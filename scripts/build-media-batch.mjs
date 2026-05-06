import fs from "node:fs/promises";
import path from "node:path";
import {
  buildExerciseMediaSpec,
  PULSEPEAK_IMAGE_REQUIREMENTS,
  PULSEPEAK_MEDIA_SYSTEM,
  PULSEPEAK_MODELS,
  PULSEPEAK_MEDIA_VALIDATION_RULES,
  STANDARD_EXERCISE_PROMPT_TEMPLATE,
  resolveLockedModelForExercise
} from "../shared/mediaGenerationConfig.js";
import { getMovementLibrary } from "../server/data/movementLibrary.js";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "media");
const outputPath = path.join(outputDir, "pulsepeak-phase1-batch.json");
const movementLibrary = getMovementLibrary();

const payload = {
  generator: PULSEPEAK_MEDIA_SYSTEM.generator,
  phase: PULSEPEAK_MEDIA_SYSTEM.phase,
  version: PULSEPEAK_MEDIA_SYSTEM.version,
  visualStyle: PULSEPEAK_MEDIA_SYSTEM.visualStyle,
  models: PULSEPEAK_MODELS,
  requirements: PULSEPEAK_IMAGE_REQUIREMENTS,
  validationRules: PULSEPEAK_MEDIA_VALIDATION_RULES,
  promptTemplate: STANDARD_EXERCISE_PROMPT_TEMPLATE,
  createdAt: new Date().toISOString(),
  exercises: movementLibrary.map((movement) => {
    const model = resolveLockedModelForExercise({
      id: movement.id,
      familyId: movement.category,
      trainingType: movement.category === "mobility" || movement.category === "rehab" ? "mobility" : "training"
    });
    return {
      id: movement.id,
      name: movement.name,
      category: movement.category,
      model,
      spec: buildExerciseMediaSpec({
        id: movement.id,
        name: movement.name,
        familyId: movement.category,
        trainingType: movement.category === "mobility" || movement.category === "rehab" ? "mobility" : "training",
        modelKey: model.key,
        stepCount: PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps
      })
    };
  })
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));

console.log(`Media batch written to ${outputPath}`);
