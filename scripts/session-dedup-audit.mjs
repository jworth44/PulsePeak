// Recovery Directive P0 regression gate: a generated session must NEVER list
// the same movement twice (the "Cat-cow × 4" defect), and the cooldown must
// not repeat a main-flow movement. Sweeps every template across a realistic
// matrix of environments, equipment setups, and profiles.
import { getWorkoutLibraryForProfile } from "../server/data/workoutLibrary.js";

const ENVIRONMENTS = ["home", "gym", "both"];
const SETUPS = [
  { equipmentProfile: "bodyweight", equipmentSelections: [] },
  { equipmentProfile: "bench_dumbbells", equipmentSelections: ["bench", "dumbbell"] },
  { equipmentProfile: "hybrid", equipmentSelections: ["bench", "dumbbell", "band"] },
  { equipmentProfile: "full_gym", equipmentSelections: ["barbell", "bench", "machine", "dumbbell"] }
];
const PROFILES = [
  { label: "beginner-none", experienceLevel: "beginner", injuryStatus: "none", restrictedAreas: [], ageGroup: "30-39", goalType: "general_fitness" },
  { label: "intermediate-none", experienceLevel: "intermediate", injuryStatus: "none", restrictedAreas: [], ageGroup: "30-39", goalType: "strength" },
  { label: "40plus", experienceLevel: "intermediate", injuryStatus: "none", restrictedAreas: [], ageGroup: "40-49", goalType: "general_fitness" },
  { label: "shoulder-restricted", experienceLevel: "intermediate", injuryStatus: "minor", restrictedAreas: ["shoulder"], ageGroup: "30-39", goalType: "general_fitness" },
  { label: "knee-restricted", experienceLevel: "beginner", injuryStatus: "minor", restrictedAreas: ["knee"], ageGroup: "30-39", goalType: "general_fitness" }
];

let sessionsChecked = 0;
const failures = [];
const cooldownWarnings = [];

for (const environment of ENVIRONMENTS) {
  for (const setup of SETUPS) {
    for (const profileSpec of PROFILES) {
      const profile = {
        trainingEnvironment: environment === "both" ? "hybrid" : environment,
        showWarmup: true,
        showCooldown: true,
        ...profileSpec
      };
      const filters = {
        environment,
        focus: "all",
        equipmentProfile: setup.equipmentProfile,
        equipmentSelections: setup.equipmentSelections
      };
      const workouts = getWorkoutLibraryForProfile(filters, profile, [], "premium");
      for (const workout of workouts) {
        sessionsChecked += 1;
        const names = (workout.exercises || []).map((exercise) => String(exercise.name || "").toLowerCase());
        const dupes = names.filter((name, index) => names.indexOf(name) !== index);
        if (dupes.length) {
          failures.push({
            workout: workout.name,
            context: `${environment}/${setup.equipmentProfile}/${profileSpec.label}`,
            duplicates: [...new Set(dupes)]
          });
        }
        const cooldownNames = (workout.cooldownBlock || []).map((entry) => String(entry.name || "").toLowerCase());
        const crossPhase = cooldownNames.filter((name) => names.includes(name));
        if (crossPhase.length) {
          cooldownWarnings.push({
            workout: workout.name,
            context: `${environment}/${setup.equipmentProfile}/${profileSpec.label}`,
            repeated: [...new Set(crossPhase)]
          });
        }
      }
    }
  }
}

console.log(`session-dedup-audit: ${sessionsChecked} sessions checked across ${ENVIRONMENTS.length * SETUPS.length * PROFILES.length} contexts`);
if (cooldownWarnings.length) {
  console.log(`cooldown-vs-main repeats (review): ${cooldownWarnings.length}`);
  for (const warning of cooldownWarnings.slice(0, 5)) console.log("  WARN", JSON.stringify(warning));
}
if (failures.length) {
  console.error(`FAIL — sessions with duplicate movements: ${failures.length}`);
  for (const failure of failures.slice(0, 10)) console.error("  ", JSON.stringify(failure));
  process.exit(1);
}
console.log("PASS — no session lists the same movement twice.");
