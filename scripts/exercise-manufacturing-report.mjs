// Exercise Manufacturing Gold Standard — report generator.
// Produces a complete 20-field production report for every exercise, deriving
// the 7 fields the catalog lacks (rep ranges, rest periods, beginner tips,
// advanced tips, mobility requirements, alternative exercises, injury
// considerations) from the existing rich data with transparent rules.
// Outputs: EXERCISE_MANUFACTURING_INDEX.md + artifacts/exercise-reports.json.
import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";
import fs from "node:fs";

const items = getExerciseLibraryCatalog().entries;

const lc = (s) => String(s || "").toLowerCase();
const has = (name, ...kw) => kw.some((k) => lc(name).includes(k));

function classify(e) {
  const n = e.name;
  const pattern = lc(e.movementPattern);
  if (has(n, "sprint", "treadmill", "bike", "elliptical", "stair", "rower", "jump rope", "shuttle", "agility", "butt kick", "fast feet", "shadow", "cone", "shuffle", "cardio", "high knee"))
    return "conditioning";
  if (has(n, "jump", "box jump", "slam", "skater", "throw", "power", "clap", "broad", "bound"))
    return "power";
  if (has(n, "stretch", "mobility", "cat-cow", "90/90", "hip flow", "wall slide", "thoracic", "ankle rock", "childs pose", "world"))
    return "mobility";
  if (has(n, "plank", "hollow", "dead bug", "bird dog", "pallof", "crunch", "russian twist", "side plank", "leg raise", "superman", "ab wheel", "bear crawl", "mountain climber"))
    return "core";
  if (has(n, "curl", "raise", "fly", "extension", "pushdown", "pressdown", "kickback", "calf", "wrist", "pull-apart", "y raise", "widow", "clamshell", "frog pump"))
    return "isolation";
  if (has(n, "carry", "farmer", "suitcase", "sled"))
    return "carry";
  if (/(squat|deadlift|press|row|lunge|hinge|thrust|pull-up|pulldown|chin-up|bench|push-up|good morning|split squat|step-up)/.test(lc(n)) || /(squat|hinge|push|pull|lunge)/.test(pattern))
    return "compound";
  return "general";
}

const REP_REST = {
  compound: { reps: "6–10 reps (strength: 4–6 · muscle: 8–12)", rest: "90–180 sec (heavier = longer)" },
  isolation: { reps: "10–15 reps", rest: "45–60 sec" },
  core: { reps: "10–20 reps or 20–45 sec holds", rest: "30–45 sec" },
  power: { reps: "3–6 explosive reps", rest: "2–3 min (full recovery)" },
  conditioning: { reps: "20–60 sec work intervals (or 30–90 sec steady)", rest: "30–60 sec, or a 1:1 work:rest ratio" },
  mobility: { reps: "5–10 slow reps or 20–40 sec holds", rest: "Minimal — flow between sides" },
  carry: { reps: "20–40 meters or 30–45 sec per set", rest: "60–90 sec" },
  general: { reps: "8–12 reps", rest: "60–90 sec" }
};

function mobilityReq(e) {
  const p = lc(e.movementPattern) + " " + lc(e.name);
  const reqs = [];
  if (/squat|lunge|split|step/.test(p)) reqs.push("ankle dorsiflexion and hip flexion to reach depth with a tall torso");
  if (/hinge|deadlift|good morning|thrust|bridge/.test(p)) reqs.push("hamstring and hip-hinge range to keep a flat back");
  if (/press|overhead|push|raise|pulldown|pull-up/.test(p)) reqs.push("shoulder and thoracic (upper-back) mobility to move overhead safely");
  if (/row|pull/.test(p)) reqs.push("shoulder-blade control to pull with the back, not just the arms");
  if (/rotat|twist|pallof/.test(p)) reqs.push("thoracic rotation with a stable lower back");
  if (!reqs.length) reqs.push("general full-body control — no special mobility needed to start");
  return reqs.join("; ") + ".";
}

function injuryConsiderations(e) {
  const p = lc(e.movementPattern) + " " + lc(e.name);
  const notes = [];
  if (/squat|lunge|split|step|leg press|jump/.test(p)) notes.push("Knees: keep them tracking over the toes and reduce depth if they ache.");
  if (/hinge|deadlift|good morning|row|bent|thrust|bridge/.test(p)) notes.push("Lower back: keep a flat, braced spine and avoid rounding under load.");
  if (/press|overhead|push|raise|pulldown|pull-up|fly/.test(p)) notes.push("Shoulders: stay in a pain-free range and stop if you feel pinching.");
  if (/curl|extension|wrist|pushdown/.test(p)) notes.push("Elbows/wrists: keep movements smooth and avoid jerking or over-extending.");
  if (e.jointStress === "high") notes.push("This is a higher joint-stress movement — warm up well and progress load slowly.");
  if (!notes.length) notes.push("Low joint stress. Stop if any sharp pain appears and reduce range or load.");
  return notes;
}

function beginnerTips(e) {
  const tips = [];
  if ((e.regressions || []).length) tips.push(`If it feels hard, start with an easier version: ${e.regressions[0]}.`);
  if ((e.cues || []).length) tips.push(`Focus on one thing first: "${e.cues[0]}".`);
  tips.push("Use light or no weight until the movement feels smooth and repeatable, then add load slowly.");
  tips.push("Move slowly and watch yourself in a mirror or video to check your positions.");
  return tips;
}

function advancedTips(e) {
  const tips = [];
  if ((e.progressions || []).length) tips.push(`Make it harder: ${e.progressions[0]}.`);
  if (e.tempo) tips.push("Add tempo — slow the lowering phase or add a pause to increase difficulty without more weight.");
  tips.push("Once form is automatic, chase progressive overload (small load or rep increases week to week).");
  return tips;
}

function alternatives(e) {
  const fams = new Set(e.familyIds || []);
  const alts = items
    .filter((x) => x.id !== e.id && (x.movementId === e.movementId || (x.familyIds || []).some((f) => fams.has(f))))
    .map((x) => x.name);
  return [...new Set(alts)].slice(0, 4);
}

// The 11-point visual sequence the gold standard asks for.
const VISUAL_POINTS = [
  "Starting position", "Body alignment", "Grip", "Foot placement", "Joint position",
  "Movement initiation", "Mid movement", "End position", "Full contraction",
  "Controlled return", "Finish position"
];

function childTest(e) {
  // Heuristic clarity signals; agents do the true qualitative pass.
  const issues = [];
  const steps = e.visualSequence || [];
  if (steps.length < 3) issues.push("fewer than 3 described steps");
  const jargon = /(scapula|posterior|anterior|eccentric|concentric|propriocept|dorsiflex|valgus|retract|depress|adduct|abduct)/i;
  const jargonHits = [e.setup, e.execution, ...(e.cues || []), ...steps.map((s) => s.description)]
    .filter(Boolean).filter((t) => jargon.test(t));
  if (jargonHits.length) issues.push(`uses expert jargon a child may not know (${jargonHits.length} place(s))`);
  if (!e.setup || e.setup.length < 40) issues.push("setup is very short");
  return { pass: issues.length === 0, issues };
}

const reports = items.map((e) => {
  const cls = classify(e);
  const ct = childTest(e);
  return {
    id: e.id, name: e.name, category: e.category, class: cls,
    // 20 fields
    primaryMuscles: e.primaryMuscleGroup || (e.primaryMuscles || []).join(", "),
    secondaryMuscles: (e.secondaryMuscles || []).join(", ") || "—",
    equipment: e.equipmentDisplay || (e.equipment || []).join(", "),
    difficulty: e.difficulty,
    commonMistakes: e.commonMistakes || [],
    safetyWarnings: e.safetyNotes || [],
    breathing: e.breathing,
    tempo: e.tempo,
    coachingCues: e.cues || [],
    beginnerTips: beginnerTips(e),
    advancedTips: advancedTips(e),
    mobilityRequirements: mobilityReq(e),
    progressions: e.progressions || [],
    regressions: e.regressions || [],
    alternatives: alternatives(e),
    injuryConsiderations: injuryConsiderations(e),
    repRange: REP_REST[cls].reps,
    restPeriod: REP_REST[cls].rest,
    trainingPurpose: e.trainingPurpose || e.whatThisExerciseIs,
    // supporting
    setup: e.setup, execution: e.execution,
    visualSequence: (e.visualSequence || []).map((s) => `${s.title}: ${s.description}`),
    hasVisual: e.mediaStatus === "full",
    imageDir: e.imageDir,
    childTest: ct
  };
});

fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync("artifacts/exercise-reports.json", JSON.stringify(reports, null, 1));

// Stats
const byClass = {};
reports.forEach((r) => { byClass[r.class] = (byClass[r.class] || 0) + 1; });
const childFails = reports.filter((r) => !r.childTest.pass);
console.log(`Generated ${reports.length} production reports -> artifacts/exercise-reports.json`);
console.log("By class:", JSON.stringify(byClass));
console.log(`Visual: ${reports.filter((r) => r.hasVisual).length} · Text: ${reports.filter((r) => !r.hasVisual).length}`);
console.log(`Child-test heuristic flags: ${childFails.length}`);
console.log("Sample flags:", childFails.slice(0, 8).map((r) => r.name).join(", "));
