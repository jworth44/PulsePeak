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
  DIAGRAM_STYLE_RULES,
  VISUAL_GENERATION_GUARDRAILS,
  VISUAL_MEDIA_PATHS,
  VISUAL_QUALITY_GATE_STATUSES,
  VISUAL_STYLE_LOCK,
  normalizeVisualMovementCategory,
  resolveVisualGenerationRule
} from "../shared/visualGenerationRules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

const FRAME_DEFINITIONS = [
  {
    index: 1,
    label: "SETUP",
    instruction:
      "Dumbbells fully resting on the thighs with the arms relaxed and not yet in the pressing position."
  },
  {
    index: 2,
    label: "START",
    instruction:
      "Dumbbells at the upper chest, elbows bent roughly 90 degrees, wrists stacked above elbows, and stable in the start position."
  },
  {
    index: 3,
    label: "LOWERING",
    instruction:
      "Dumbbells clearly lower than frame 2 in a controlled mid-descent, with the elbows moving outward and down."
  },
  {
    index: 4,
    label: "BOTTOM",
    instruction:
      "Dumbbells at the lowest point with the elbows below the chest line in the deepest stretch position."
  },
  {
    index: 5,
    label: "PRESS",
    instruction:
      "Dumbbells at the highest point with the arms extended upward in the finished press position."
  }
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exerciseName = String(args.exerciseName || "").trim();
  const detailId = String(args.detailId || "").trim();
  const model = normalizeModel(args.model);
  const movementCategory =
    normalizeVisualMovementCategory(args.category || args.movementCategory) || "strength";

  if (!exerciseName || !detailId || !model) {
    printResult({
      status: "BROKEN",
      filesCreated: [],
      errors: [
        "Usage: node scripts/generate-exercise-frames.mjs --exerciseName=\"...\" --detailId=\"...\" --model=\"male|female\" --category=\"strength|yoga|mobility|stretch|rehab|cardio\""
      ]
    });
    process.exitCode = 1;
    return;
  }

  const referenceWebPath = REFERENCE_MODELS[model];
  const referenceFilePath = resolveReferenceFilePath(referenceWebPath);

  try {
    await fs.access(referenceFilePath);
  } catch {
    printResult({
      status: "BROKEN",
      filesCreated: [],
      errors: [`Locked reference image not found for ${model}: ${referenceFilePath}`]
    });
    process.exitCode = 1;
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    printResult({
      status: "BROKEN",
      filesCreated: [],
      errors: ["OPENAI_API_KEY is not set, so the frame generator could not run a live image request."]
    });
    process.exitCode = 1;
    return;
  }

  const filesCreated = [];

  try {
    for (const frame of FRAME_DEFINITIONS) {
      const imageBuffer = await generateFrame({
        exerciseName,
        detailId,
        model,
        movementCategory,
        referenceFilePath,
        frame
      });

      const outputFilePath = path.join(
        projectRoot,
        VISUAL_MEDIA_PATHS.reviewTempRoot,
        `${detailId}-${model}-frame-${frame.index}.png`
      );

      await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
      await fs.writeFile(outputFilePath, imageBuffer);
      filesCreated.push(toProjectRelative(outputFilePath));
    }

    if (filesCreated.some((filePath) => !filePath.includes(`/${detailId}-${model}-frame-`))) {
      throw new Error("Generated frame files do not include the required model segment in the filename.");
    }

    printResult({
      status: "COMPLETE",
      filesCreated,
      errors: []
    });
  } catch (error) {
    printResult({
      status: "BROKEN",
      filesCreated,
      errors: [error instanceof Error ? error.message : String(error)]
    });
    process.exitCode = 1;
  }
}

async function generateFrame({ exerciseName, detailId, model, movementCategory, referenceFilePath, frame }) {
  const prompt = buildFramePrompt({ exerciseName, detailId, model, movementCategory, frame });
  const referenceBytes = await fs.readFile(referenceFilePath);
  const referenceFile = new File([referenceBytes], path.basename(referenceFilePath), { type: "image/png" });

  const form = new FormData();
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("image", referenceFile);
  form.append("prompt", prompt);
  form.append("size", "1024x1024");
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
    throw new Error(`OpenAI image request failed for frame ${frame.index} (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error(`OpenAI image request completed for frame ${frame.index} but no image data was returned.`);
  }

  return Buffer.from(imageBase64, "base64");
}

function buildFramePrompt({ exerciseName, detailId, model, movementCategory, frame }) {
  const categoryRules = resolveVisualGenerationRule(movementCategory);

  return [
    `Global style lock: ${VISUAL_STYLE_LOCK}.`,
    "Create a fitness instructional diagram in a clean anatomical style similar to professional workout guide illustrations. Do NOT create photorealistic humans.",
    "Create one single high-resolution PulsePeak exercise frame.",
    "Use the SAME anatomical figure for all frames. Keep body proportions identical. Keep head shape identical. Keep limb proportions identical. Do not change character design between frames.",
    "Use the EXACT same camera angle for all frames. Same distance. Same framing. Same orientation. Do not zoom in or out. Do not crop differently between frames.",
    "The figure and bench must remain the SAME SIZE in every frame. No resizing. No repositioning. No shifting in frame.",
    "The incline bench must remain identical in shape and angle across all frames. Dumbbells must remain identical in size and style across all frames.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    `Movement category: ${movementCategory}.`,
    `Frame ${frame.index} label: ${frame.label}.`,
    `Generation status on output: ${VISUAL_QUALITY_GATE_STATUSES.REVIEW_REQUIRED}.`,
    `Required environment: ${categoryRules.requiredEnvironment}.`,
    `Allowed equipment: ${categoryRules.allowedEquipment.join(", ")}.`,
    `Clothing rules: ${categoryRules.clothingRules.join(", ")}.`,
    `Pose and movement style: ${categoryRules.poseMovementStyle.join(", ")}.`,
    `Banned elements: ${categoryRules.bannedElements.join(", ")}.`,
    `Diagram body style: ${DIAGRAM_STYLE_RULES.bodyStyle}.`,
    `Diagram face detail: ${DIAGRAM_STYLE_RULES.faceDetail}.`,
    `Diagram realism: ${DIAGRAM_STYLE_RULES.realism}.`,
    `Diagram background: ${DIAGRAM_STYLE_RULES.background}.`,
    `Diagram lighting: ${DIAGRAM_STYLE_RULES.lighting}.`,
    `Diagram environment: ${DIAGRAM_STYLE_RULES.environment}.`,
    `Diagram muscle highlight: ${DIAGRAM_STYLE_RULES.muscleHighlight}.`,
    `Diagram equipment style: ${DIAGRAM_STYLE_RULES.equipmentStyle}.`,
    "This must clearly be an incline dumbbell press only with an incline bench at 30 to 45 degrees visible, dumbbells in both hands, no flat bench, no standing pose, and no goblet dumbbell hold.",
    `Frame requirement: ${frame.instruction}`,
    "This frame must be visually distinct from the other four frames while keeping the same clean diagram style, same scale, and same instructional clarity.",
    "Do not duplicate poses. Frame 3 and frame 4 must not match. Frame 5 must show arms extended. Frame 1 must not show a press position.",
    "Each frame MUST show a different vertical dumbbell position. If two frames are similar, the output is invalid.",
    "No face detail, no photorealistic human styling, no realistic lighting, no detailed skin texture, and no direct camera stare.",
    "If the output contains a realistic human face, photographic lighting, or detailed skin texture, mark it as FAILED.",
    "Clean anatomical instructional diagram only. No text, no labels, no overlays, no extra people, no distorted anatomy, no extra limbs, and no warped dumbbells.",
    `Review-first rule: output is for ${VISUAL_MEDIA_PATHS.reviewTempRoot} only and must never be treated as approved automatically.`,
    `Guardrails: direct exercise media writes allowed = ${VISUAL_GENERATION_GUARDRAILS.directExerciseMediaWritesAllowed}, auto approval allowed = ${VISUAL_GENERATION_GUARDRAILS.autoApprovalAllowed}, reference overwrite allowed = ${VISUAL_GENERATION_GUARDRAILS.referenceOverwriteAllowed}.`,
    "Do not combine frames into a composite. Generate only this single frame."
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

function printResult({ status, filesCreated, errors }) {
  console.log(`STATUS: ${status}`);
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
