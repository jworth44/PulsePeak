// BLOCKED UNTIL OPENAI_API_KEY IS AVAILABLE
// This script is generation infrastructure only.
// It must not wire, approve, or overwrite reference models.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { REFERENCE_MODELS } from "../shared/referenceModels.js";

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
  const outputFilePath = path.join(projectRoot, "temp", `${detailId}-${model}.png`);

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

async function generateExerciseComposite({ exerciseName, detailId, model, referenceFilePath }) {
  const prompt = buildCompositePrompt({ exerciseName, detailId, model });
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

function buildCompositePrompt({ exerciseName, detailId, model }) {
  const modelLine =
    model === "female"
      ? "Use the attached locked PulsePeak female reference identity exactly. Same exact woman, same face, same body proportions, same hair, no face or body drift."
      : "Use the attached locked PulsePeak male reference identity exactly. Same exact man, same face, same body proportions, same hair, no face or body drift.";

  return [
    "Create a single high-resolution 5-panel composite exercise visual for PulsePeak.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    modelLine,
    "Use black-and-red PulsePeak athletic clothing only, consistent across all five panels, logo-free.",
    "Use a bright premium gym environment with consistent lighting, same camera angle, same background, and no dark cinematic styling.",
    "Panel 1 is the thumbnail setup frame.",
    "Panel 2 is Step 1 start position.",
    "Panel 3 is Step 2 lowering or transition phase.",
    "Panel 4 is Step 3 bottom or peak controlled position.",
    "Panel 5 is Step 4 finish, press, or lockout phase.",
    `Show correct biomechanics for ${exerciseName}, not an approximation and not a related exercise.`,
    "Each panel must depict a clearly different phase with believable anatomy, symmetrical equipment, and consistent identity.",
    "No text, no labels, no overlays, no watermarks, no extra people, no distorted anatomy, no extra limbs, no warped equipment."
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
