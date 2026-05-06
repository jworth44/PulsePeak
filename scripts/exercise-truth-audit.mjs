import fs from "node:fs";
import path from "node:path";
import { getWorkoutLibraryMeta } from "../server/data/workoutLibrary.js";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });

const profiles = [
  {
    label: "home",
    goalType: "general_fitness",
    trainingEnvironment: "home",
    equipmentProfile: "bench_dumbbells",
    equipmentSelections: ["bench", "dumbbell", "bodyweight"],
    injuryStatus: "none",
    restrictedAreas: [],
    mobilityEnabled: true,
    experienceLevel: "intermediate",
    ageBucket: "adult"
  },
  {
    label: "gym",
    goalType: "general_fitness",
    trainingEnvironment: "gym",
    equipmentProfile: "full_gym",
    equipmentSelections: ["bench", "dumbbell", "bands", "bodyweight", "machine", "barbell"],
    injuryStatus: "none",
    restrictedAreas: [],
    mobilityEnabled: true,
    experienceLevel: "intermediate",
    ageBucket: "adult"
  },
  {
    label: "hybrid",
    goalType: "general_fitness",
    trainingEnvironment: "hybrid",
    equipmentProfile: "full_gym",
    equipmentSelections: ["bench", "dumbbell", "bands", "bodyweight", "machine", "barbell"],
    injuryStatus: "none",
    restrictedAreas: [],
    mobilityEnabled: true,
    experienceLevel: "intermediate",
    ageBucket: "adult"
  }
];

const merged = new Map();

for (const profile of profiles) {
  const meta = getWorkoutLibraryMeta(profile, {
    environment: "both",
    equipmentSelections: profile.equipmentSelections,
    focus: "recommended"
  });
  for (const entry of meta.exerciseLibraryPreview.entries) {
    if (!merged.has(entry.id)) {
      merged.set(entry.id, entry);
    }
  }
}

const results = [...merged.values()]
  .sort((left, right) => left.name.localeCompare(right.name))
  .map((entry) => classifyExercise(entry));

const summary = {
  totalExercisesAudited: results.length,
  exactVisualMatches: results.filter((entry) => entry.status === "EXACT_VISUAL_OK").length,
  exactTextOnlyGuides: results.filter((entry) => entry.status === "EXACT_TEXT_ONLY_OK").length,
  relatedReferenceVisualUses: results.filter((entry) => entry.status === "RELATED_REFERENCE_ALLOWED").length,
  removedMismatchedVisuals: results.filter((entry) => entry.status !== "EXACT_VISUAL_OK").length,
  remainingExactMediaGaps: results.filter((entry) => entry.status !== "EXACT_VISUAL_OK").map((entry) => entry.name)
};

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  exercises: results
};

fs.writeFileSync(path.join(artifactsDir, "exercise-truth-audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

function classifyExercise(entry) {
  const steps = Array.isArray(entry.media?.steps)
    ? entry.media.steps.filter(Boolean)
    : Array.isArray(entry.media?.images)
      ? entry.media.images.filter(Boolean)
      : [];
  const uniqueSteps = new Set(steps).size;
  const hasExactVisualGuide = Boolean(entry.thumbnail) && uniqueSteps >= 4;
  const hasSingleReference = Boolean(entry.thumbnail) && uniqueSteps > 0 && uniqueSteps < 4;
  const status = hasExactVisualGuide
    ? "EXACT_VISUAL_OK"
    : hasSingleReference
      ? "RELATED_REFERENCE_ALLOWED"
      : "EXACT_TEXT_ONLY_OK";

  return {
    id: entry.id,
    name: entry.name,
    status,
    previewMode: hasExactVisualGuide ? "exact_visual" : hasSingleReference ? "reference_visual" : "text_only",
    equipment: entry.equipment,
    primaryMuscleGroup: entry.primaryMuscleGroup,
    secondaryMuscleGroups: entry.secondaryMuscleGroups || [],
    difficulty: entry.difficulty,
    jointStress: entry.jointStress,
    movementPattern: entry.movementPattern,
    guideSupportLabel: entry.guideSupportLabel,
    snapshot: entry.snapshot,
    instructions: entry.instructions || [],
    cues: entry.cues || [],
    commonMistakes: entry.commonMistakes || [],
    safetyNotes: entry.safetyNotes || [],
    modifications: entry.modifications || [],
    thumbnail: entry.thumbnail || null
  };
}
