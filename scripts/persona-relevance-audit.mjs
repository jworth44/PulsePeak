// Persona relevance gate (Recovery Directive Parts 5-7, personas A-G).
// Generates each persona's real workout library through the same filter
// derivation the API route uses and fails the build if any session violates
// the persona's constraints:
//   - equipment honesty (bodyweight users never receive equipment work)
//   - restricted-area safety (shoulder/knee/etc. patterns never selected)
//   - recovery sessions stay low-stress
//   - no duplicate movements in one session
//   - no silently thin sessions (< 3 exercises)
import { buildEquipmentProfileFromSelections, getEquipmentSelectionsForProfile } from "../shared/workoutEngine.js";
import { getWorkoutLibraryForProfile } from "../server/data/workoutLibrary.js";

const base = {
  goalType: "general_fitness", ageGroup: "30-39", experienceLevel: "intermediate",
  trainingEnvironment: "hybrid", equipmentProfile: "bench_dumbbells",
  equipmentSelections: ["bench", "dumbbells"], injuryStatus: "none", restrictedAreas: [],
  showWarmup: true, showCooldown: true
};

const PERSONAS = {
  A_beginner_home: { profile: { ...base, experienceLevel: "beginner", trainingEnvironment: "home", equipmentProfile: "bodyweight", equipmentSelections: [] } },
  B_lifter_gym: { profile: { ...base, experienceLevel: "advanced", goalType: "strength", trainingEnvironment: "gym", equipmentProfile: "full_gym", equipmentSelections: ["barbell", "bench", "machines", "dumbbells"] } },
  C_forty_plus: { profile: { ...base, ageGroup: "40-49" } },
  D_knee: { profile: { ...base, injuryStatus: "minor", restrictedAreas: ["knee"] } },
  E_shoulder: { profile: { ...base, injuryStatus: "minor", restrictedAreas: ["shoulder"] } },
  F_recovery: { profile: { ...base }, focus: "mobility_recovery" },
  G_bodyweight: { profile: { ...base, trainingEnvironment: "home", equipmentProfile: "bodyweight", equipmentSelections: [] } }
};

const HOUSEHOLD_OK = /bodyweight|none|towel|wall|chair|floor|doorframe|sturdy/i;
const SHOULDER_RISK = /overhead|shoulder press|pike push|handstand|arnold|upright row|lateral raise|pullover|snatch|jerk/i;
const KNEE_RISK = /jump|plyo|bound|burpee|high knees|jack|skater|pistol/i;

const failures = [];
let sessionsChecked = 0;

for (const [name, spec] of Object.entries(PERSONAS)) {
  const profile = spec.profile;
  const selections = getEquipmentSelectionsForProfile(profile);
  const equipmentProfile = buildEquipmentProfileFromSelections(selections, profile.trainingEnvironment);
  const environment = profile.trainingEnvironment === "home" ? "home" : "both";
  const workouts = getWorkoutLibraryForProfile(
    { environment, focus: spec.focus || "recommended", equipmentProfile, equipmentSelections: selections },
    profile, [], "premium"
  );
  if (!workouts.length) {
    failures.push(`${name}: ZERO workouts generated`);
    continue;
  }
  for (const workout of workouts) {
    sessionsChecked += 1;
    const exercises = workout.exercises || [];
    const names = exercises.map((exercise) => exercise.name.toLowerCase());
    const dupes = names.filter((entry, index) => names.indexOf(entry) !== index);
    if (dupes.length) failures.push(`${name} / ${workout.name}: duplicate movements (${[...new Set(dupes)].join(", ")})`);
    if (exercises.length < 3) failures.push(`${name} / ${workout.name}: thin session (${exercises.length} exercises)`);
    if (equipmentProfile === "bodyweight") {
      const bad = exercises.filter((exercise) => exercise.equipment && !HOUSEHOLD_OK.test(exercise.equipment));
      if (bad.length) failures.push(`${name} / ${workout.name}: equipment violation (${bad.map((e) => `${e.name} [${e.equipment}]`).join(", ")})`);
    }
    if (name === "E_shoulder") {
      const bad = exercises.filter((exercise) => SHOULDER_RISK.test(exercise.name));
      if (bad.length) failures.push(`${name} / ${workout.name}: shoulder-risk selection (${bad.map((e) => e.name).join(", ")})`);
    }
    if (name === "D_knee") {
      const bad = exercises.filter((exercise) => KNEE_RISK.test(exercise.name));
      if (bad.length) failures.push(`${name} / ${workout.name}: knee-risk selection (${bad.map((e) => e.name).join(", ")})`);
    }
    if (spec.focus === "mobility_recovery" && workout.jointStressProfile === "high") {
      failures.push(`${name} / ${workout.name}: high-joint-stress recovery session`);
    }
  }
}

console.log(`persona-relevance-audit: ${sessionsChecked} sessions checked across ${Object.keys(PERSONAS).length} personas`);
if (failures.length) {
  console.error(`FAIL — ${failures.length} persona-relevance violations:`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
console.log("PASS — every persona's sessions respect their equipment, restrictions, and recovery context.");
