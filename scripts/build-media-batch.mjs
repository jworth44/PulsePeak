import fs from "node:fs/promises";
import path from "node:path";
import {
  getInitialMediaBatch,
  PULSEPEAK_MEDIA_SYSTEM,
  PULSEPEAK_MODELS,
  STANDARD_EXERCISE_PROMPT_TEMPLATE
} from "../shared/mediaGenerationConfig.js";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "media");
const outputPath = path.join(outputDir, "pulsepeak-phase1-batch.json");

const payload = {
  generator: PULSEPEAK_MEDIA_SYSTEM.generator,
  phase: PULSEPEAK_MEDIA_SYSTEM.phase,
  visualStyle: PULSEPEAK_MEDIA_SYSTEM.visualStyle,
  models: PULSEPEAK_MODELS,
  promptTemplate: STANDARD_EXERCISE_PROMPT_TEMPLATE,
  createdAt: new Date().toISOString(),
  exercises: getInitialMediaBatch()
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));

console.log(`Media batch written to ${outputPath}`);
