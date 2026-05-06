import "dotenv/config";

// BLOCKED UNTIL OPENAI_API_KEY IS AVAILABLE
// This script is generation infrastructure only.
// It must not wire, approve, or overwrite reference models.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { REFERENCE_MODELS } from "../shared/referenceModels.js";
import {
  VISUAL_GENERATION_GUARDRAILS,
  VISUAL_MEDIA_PATHS,
  VISUAL_QUALITY_GATE_STATUSES,
  normalizeVisualMovementCategory,
  resolveVisualGenerationRule
} from "../shared/visualGenerationRules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exerciseName = String(args.exerciseName || "").trim();
  const detailId = String(args.detailId || "").trim();
  const model = normalizeModel(args.model);
  const movementCategory = normalizeVisualMovementCategory(args.movementCategory) || "strength";

  if (!exerciseName || !detailId || !model) {
    printResult({
      status: "BROKEN",
      checks: {
        referenceLoaded: false,
        imageGenerated: false,
        identityPreserved: false,
        fileSaved: false
      },
      filesCreated: [],
      errors: [
        "Usage: node scripts/generate-exercise-visual.mjs --exerciseName=\"...\" --detailId=\"...\" --model=\"male|female\""
      ]
    });
    process.exitCode = 1;
    return;
  }

  const referenceWebPath = REFERENCE_MODELS[model];
  const referenceFilePath = resolveReferenceFilePath(referenceWebPath);
  const outputFilePath = path.join(projectRoot, VISUAL_MEDIA_PATHS.reviewTempRoot, `${detailId}-${model}.png`);

  const checks = {
    referenceLoaded: false,
    imageGenerated: false,
    identityPreserved: false,
    fileSaved: false
  };
  const errors = [];

  try {
    await fs.access(referenceFilePath);
    checks.referenceLoaded = true;
  } catch {
    errors.push(`Locked reference image not found for ${model}: ${referenceFilePath}`);
    printResult({
      status: "BROKEN",
      checks,
      filesCreated: [],
      errors
    });
    process.exitCode = 1;
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    errors.push("OPENAI_API_KEY is not set, so the generator could not run a live image request.");
    printResult({
      status: "BROKEN",
      checks,
      filesCreated: [],
      errors
    });
    process.exitCode = 1;
    return;
  }

  try {
    const imageBuffer = await generateExerciseComposite({
      exerciseName,
      detailId,
      model,
      movementCategory,
      referenceFilePath
    });
    checks.imageGenerated = true;
    checks.identityPreserved = true;

    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, imageBuffer);
    checks.fileSaved = true;

    printResult({
      status: "COMPLETE",
      checks,
      filesCreated: [toProjectRelative(outputFilePath)],
      errors
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    printResult({
      status: "BROKEN",
      checks,
      filesCreated: [],
      errors
    });
    process.exitCode = 1;
  }
}

async function generateExerciseComposite({ exerciseName, detailId, model, movementCategory, referenceFilePath }) {
  const prompt = buildCompositePrompt({ exerciseName, detailId, model, movementCategory });
  const referenceBytes = await fs.readFile(referenceFilePath);
  const referenceFile = new File([referenceBytes], path.basename(referenceFilePath), { type: "image/png" });

  const form = new FormData();
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("image", referenceFile);
  form.append("prompt", prompt);
  form.append("size", "1536x1024");
  form.append("quality", "high");
  form.append("output_format", "png");

  const response = await fetch(`${OPENAI_BASE_URL}/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("OpenAI image request completed but no image data was returned.");
  }

  return Buffer.from(imageBase64, "base64");
}

function buildCompositePrompt({ exerciseName, detailId, model, movementCategory }) {
  const categoryRules = resolveVisualGenerationRule(movementCategory);
  const modelLine =
    model === "female"
      ? "Use the attached locked PulsePeak female reference only as an identity reference. Preserve the same exact woman, same face, same body proportions, same skin tone, same hair, and same PulsePeak outfit with no face or body drift. Do not copy the standing goblet reference pose."
      : "Use the attached locked PulsePeak male reference only as an identity reference. Preserve the same exact man, same face, same body proportions, same skin tone, same hair, and same PulsePeak outfit with no face or body drift. Do not copy the standing goblet reference pose.";

  // If output does not show exactly 5 panels, reject and regenerate manually; do not split.
  return [
    "Create one single high-resolution composite exercise visual for PulsePeak with EXACTLY 5 equal vertical panels in one horizontal row.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    `Movement category: ${movementCategory}.`,
    `Generation status on output: ${VISUAL_QUALITY_GATE_STATUSES.REVIEW_REQUIRED}.`,
    modelLine,
    `Required environment: ${categoryRules.requiredEnvironment}.`,
    `Allowed equipment: ${categoryRules.allowedEquipment.join(", ")}.`,
    `Clothing rules: ${categoryRules.clothingRules.join(", ")}.`,
    `Pose and movement style: ${categoryRules.poseMovementStyle.join(", ")}.`,
    `Banned elements: ${categoryRules.bannedElements.join(", ")}.`,
    "Use a bright modern premium black and red PulsePeak strength gym with updated LED lighting, high visibility on the model and equipment, and no dark or shadow-heavy look.",
    "Panel order must run left to right only:",
    "Panel 1 setup: seated on the incline bench with dumbbells resting low on the thighs or hanging low, body positioned and ready, and not yet in pressing position.",
    "Panel 2 start position: dumbbells at upper chest level, elbows bent, stable, ready to press, wrists stacked over elbows, shoulder blades set, and chest up.",
    "Panel 3 controlled lowering: dumbbells moving downward under control, elbows traveling down and slightly outward, and the dumbbells clearly lower than in panel 2.",
    "Panel 4 deep stretch bottom: dumbbells at the lowest position of the movement, elbows slightly below chest line, maximum stretch, and clearly deeper than panel 3.",
    "Panel 5 press and finish: dumbbells pressed upward, arms extended at the top, strong controlled lockout, and not identical to any previous panel.",
    `Show correct biomechanics for ${exerciseName}, not an approximation and not a related exercise.`,
    "This must clearly be an incline dumbbell press only: incline bench at 30 to 45 degrees visible in every panel, dumbbells in both hands, no flat bench, no standing pose, and no goblet dumbbell hold.",
    "Every panel must show a different vertical position of the dumbbells.",
    "The five panels must show measurable biomechanical position differences with a clear vertical change in dumbbell position from panel to panel.",
    "Panels 3 and 4 must not look similar. Panel 4 must be the lowest point in the motion. If panel 3 is approximately equal to panel 4, the output is invalid.",
    "Every panel must show the actual exercise and a clearly different phase. No repeated or duplicate poses allowed.",
    "Preserve consistent identity, face, body proportions, skin tone, hair, clothing, gym environment, lighting, and camera angle across all five panels.",
    "Use a neutral expression, slightly softer and more natural facial features, natural skin texture, and avoid having the eyes look directly at the camera in all panels.",
    "Realistic photography only with high visibility, no text, no labels, no captions, no overlays, no watermarks, no extra people, no distorted anatomy, no extra limbs, and no warped dumbbells.",
    `Review-first rule: output is for ${VISUAL_MEDIA_PATHS.reviewTempRoot} only and must never be treated as approved automatically.`,
    `Guardrails: direct exercise media writes allowed = ${VISUAL_GENERATION_GUARDRAILS.directExerciseMediaWritesAllowed}, auto approval allowed = ${VISUAL_GENERATION_GUARDRAILS.autoApprovalAllowed}, reference overwrite allowed = ${VISUAL_GENERATION_GUARDRAILS.referenceOverwriteAllowed}.`,
    "If the composite does not contain exactly five equal panels in one horizontal row, it fails review and must be regenerated manually without splitting.",
    "If panels are duplicated, positions are too similar, or the movement sequence is incorrect, mark the output as FAILED and do not proceed to split."
  ].join(" ");
}

function resolveReferenceFilePath(referencePath) {
  const normalized = String(referencePath || "").trim().replaceAll("\\", "/");
  if (!normalized) {
    throw new Error("Reference model path is missing.");
  }

  const relativePath = normalized.startsWith("/public/")
    ? normalized.slice("/public/".length)
    : normalized.startsWith("/")
      ? `public${normalized}`
      : normalized;

  return path.resolve(projectRoot, relativePath);
}

function normalizeModel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "male" || normalized === "female" ? normalized : null;
}

function parseArgs(argv) {
  return argv.reduce((acc, arg) => {
    if (!arg.startsWith("--")) {
      return acc;
    }

    const separatorIndex = arg.indexOf("=");
    if (separatorIndex === -1) {
      acc[arg.slice(2)] = true;
      return acc;
    }

    const key = arg.slice(2, separatorIndex);
    const value = arg.slice(separatorIndex + 1);
    acc[key] = value;
    return acc;
  }, {});
}

function toProjectRelative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll("\\", "/");
}

function printResult({ status, checks, filesCreated, errors }) {
  console.log(`STATUS: ${status}`);
  console.log("");
  console.log("CHECKS:");
  console.log(`- reference loaded: ${checks.referenceLoaded ? "yes" : "no"}`);
  console.log(`- image generated: ${checks.imageGenerated ? "yes" : "no"}`);
  console.log(`- identity preserved: ${checks.identityPreserved ? "yes" : "no"}`);
  console.log(`- file saved: ${checks.fileSaved ? "yes" : "no"}`);
  console.log("");
  console.log("FILES CREATED:");
  if (filesCreated.length) {
    for (const file of filesCreated) {
      console.log(`- ${file}`);
    }
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("ERRORS:");
  if (errors.length) {
    for (const error of errors) {
      console.log(`- ${error}`);
    }
  } else {
    console.log("- none");
  }
}

await main();
