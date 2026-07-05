// Exercise Manufacturing Gold Standard — report generator.
// Produces a complete 20-field production report for every exercise, deriving
// the 7 fields the catalog lacks (rep ranges, rest periods, beginner tips,
// advanced tips, mobility requirements, alternative exercises, injury
// considerations) from the existing rich data with transparent rules.
// Outputs: EXERCISE_MANUFACTURING_INDEX.md + artifacts/exercise-reports.json.
import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";
import fs from "node:fs";

const items = getExerciseLibraryCatalog().entries;

const lc = (s) => String(s || "").toLowerCase().replace(/['’]/g, "");
const has = (name, ...kw) => kw.some((k) => lc(name).includes(k));

function classify(e) {
  const n = e.name;
  const pattern = lc(e.movementPattern);
  if (has(n, "stretch", "mobility", "cat-cow", "90/90", "hip flow", "wall slide", "thoracic", "ankle rock", "childs pose", "world", "hip flexor"))
    return "mobility";
  if (has(n, "sprint", "treadmill", "bike", "elliptical", "stair", "rower", "jump rope", "shuttle", "agility", "butt kick", "fast feet", "shadow", "cone", "shuffle", "cardio", "high knee", "jumping jack", "battle rope", "power step", "lateral shuffle", "man maker", "burpee", "mountain climber", "bear crawl"))
    return "conditioning";
  if (has(n, "box jump", "jump squat", "slam", "skater", "throw", "clap", "broad jump", "bound", "med ball", "split jump", "box jump"))
    return "power";
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

function mobilityReq(e, cls) {
  const p = lc(e.name) + " " + lc(e.movementPattern);
  const reqs = [];
  const isCalf = /calf|heel raise/.test(p);
  const isForwardPress = /(chest press|bench|floor press|push-up|pushup|fly|pull-apart|lateral raise|front raise|pressdown|pushdown|curl)/.test(p) && !/overhead|shoulder press|arnold|z-press|thruster|pike/.test(p);
  if (isCalf) reqs.push("enough ankle movement to rise up onto the balls of your feet and lower your heels");
  else if (/squat|lunge|split|step-up|leg press/.test(p)) reqs.push("bendy ankles and hips so you can lower down while keeping your chest up");
  else if (/hinge|deadlift|good morning|thrust|bridge|romanian/.test(p)) reqs.push("hamstring and hip flexibility to bend forward from the hips with a flat back");
  else if (/overhead|shoulder press|arnold|z-press|thruster|pike|pulldown|pull-up|chin-up/.test(p)) reqs.push("shoulders and upper back that can reach overhead comfortably");
  else if (isForwardPress) reqs.push("just enough shoulder movement to reach your arms out — no special flexibility needed to start");
  else if (/row|pull/.test(p)) reqs.push("the ability to pull with your back by squeezing your shoulder blades together");
  else if (/rotat|twist|pallof|wood/.test(p)) reqs.push("the ability to turn at the upper body while keeping your lower back still");
  else if (cls === "conditioning") reqs.push("general full-body coordination — no special stretchiness needed to start");
  else reqs.push("general full-body control — no special mobility needed to start");
  return reqs.join("; ") + ".";
}

function injuryConsiderations(e, cls) {
  const p = lc(e.name) + " " + lc(e.movementPattern);
  const notes = [];
  if (/calf|heel raise/.test(p)) notes.push("Ankles/Achilles: move only as far as is comfortable and stop if the back of the ankle pinches or hurts.");
  if (/leg curl|leg extension|hamstring curl/.test(p)) notes.push("Knees/hamstrings: move smoothly and stop if you feel a sharp pull, cramp, or knee pain.");
  else if (/squat|lunge|split|step-up|leg press|jump/.test(p)) notes.push("Knees: keep them pointing over your toes and don't go so deep that they ache.");
  if (/hinge|deadlift|good morning|row|bent|thrust|bridge|romanian|carry/.test(p)) notes.push("Lower back: keep your back flat (not rounded) and don't lift more than you can control.");
  if (/overhead|shoulder press|arnold|z-press|thruster|pike|pulldown|pull-up|chin-up|fly/.test(p)) notes.push("Shoulders: stay in a pain-free range and stop if you feel any pinching.");
  if (/(biceps|hammer|preacher|concentration|ez-bar|wrist) curl|triceps|pushdown|extension|skull/.test(p) && !/leg/.test(p)) notes.push("Elbows/wrists: move smoothly and don't jerk or fully snap the joint straight.");
  if (e.jointStress === "high") notes.push("This is a higher-stress movement — warm up well and add weight slowly.");
  if (!notes.length) notes.push("Low joint stress. Stop if any sharp pain appears and make the movement smaller or easier.");
  return notes;
}

// Class-aware progression language so bodyweight / mobility / cardio don't get "add load".
function beginnerTips(e, cls) {
  const tips = [];
  const reg = (e.regressions || []).filter((r) => !/reduce load|shorten the range|lower-stress movement/i.test(r));
  if (reg.length) tips.push(`If it feels hard, start with an easier version: ${reg[0]}.`);
  if ((e.cues || []).length) tips.push(`Focus on one thing first: "${e.cues[0]}".`);
  if (cls === "mobility") tips.push("Keep the range small and smooth at first, then slowly move a little farther as it feels easy.");
  else if (cls === "conditioning" || cls === "power") tips.push("If you get tired, slow down or take a short break — don't push through sloppy or shaky form.");
  else tips.push("Use light or no weight until the movement feels smooth and repeatable, then add weight slowly.");
  tips.push("Move slowly and watch yourself in a mirror or video to check your positions.");
  return tips;
}

function advancedTips(e, cls) {
  const tips = [];
  const prog = (e.progressions || []).filter((r) => !/reduce load|shorten the range|lower-stress movement/i.test(r));
  if (prog.length) tips.push(`Make it harder: ${prog[0]}.`);
  if (cls === "mobility") tips.push("Once it feels smooth, hold a little longer or reach a little farther each time.");
  else if (cls === "conditioning") tips.push("Add difficulty by working longer, resting less, or going a bit faster while staying in control.");
  else if (cls === "power") tips.push("Make each rep more explosive, or add a small jump/step up in height — keep landings soft.");
  else {
    if (e.tempo) tips.push("Add tempo — slow the lowering part or add a pause to make it harder without more weight.");
    tips.push("Once form is automatic, add small amounts of weight or a rep or two week to week.");
  }
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
    beginnerTips: beginnerTips(e, cls),
    advancedTips: advancedTips(e, cls),
    mobilityRequirements: mobilityReq(e, cls),
    progressions: (e.progressions || []).filter((r) => !/reduce load or shorten the range|lower-stress movement in the same family/i.test(r)),
    regressions: (e.regressions || []).filter((r) => !/reduce load or shorten the range|lower-stress movement in the same family/i.test(r)),
    alternatives: alternatives(e),
    injuryConsiderations: injuryConsiderations(e, cls),
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
