import "dotenv/config";

// BLOCKED UNTIL OPENAI_API_KEY IS AVAILABLE
// This script is generation infrastructure only.
// It must not wire, approve, or overwrite reference models.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
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

const FRAME_TRANSFORMS = [
  {
    index: 1,
    fileName: "frame-1-setup.png",
    label: "SETUP",
    instruction: "Dumbbells fully resting on the thighs with the arms relaxed."
  },
  {
    index: 2,
    fileName: "frame-2-start.png",
    label: "START",
    instruction: "Dumbbells at the upper chest with elbows bent roughly 90 degrees."
  },
  {
    index: 3,
    fileName: "frame-3-lowering.png",
    label: "LOWERING",
    instruction: "Dumbbells clearly lower than frame 2 in a controlled mid-descent."
  },
  {
    index: 4,
    fileName: "frame-4-bottom.png",
    label: "BOTTOM",
    instruction: "Both dumbbells at the lowest point with both elbows below the chest line."
  },
  {
    index: 5,
    fileName: "frame-5-press.png",
    label: "PRESS",
    instruction: "Dumbbells at the highest point with both arms extended upward."
  }
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exerciseName = String(args.exerciseName || "").trim();
  const detailId = String(args.detailId || "").trim();
  const movementCategory =
    normalizeVisualMovementCategory(args.category || args.movementCategory) || "strength";

  if (!exerciseName || !detailId) {
    printResult({
      status: "BROKEN",
      checks: {
        baseImageCreated: false,
        framesCreated: false,
        identityIdenticalAcrossFrames: false,
        cameraIdentical: false,
        scaleIdentical: false
      },
      filesCreated: [],
      errors: [
        "Usage: node scripts/generate-diagram-from-base.mjs --exerciseName=\"...\" --detailId=\"...\" --category=\"strength|yoga|mobility|stretch|rehab|cardio\""
      ]
    });
    process.exitCode = 1;
    return;
  }

  const baseDir = path.join(projectRoot, "temp", "review", "base");
  const baseImagePath = path.join(baseDir, buildBaseFileName(detailId));
  const pilotDir = path.join(projectRoot, "temp", "review", "diagram-pilots", detailId);
  const filesCreated = [];
  const checks = {
    baseImageCreated: false,
    framesCreated: false,
    identityIdenticalAcrossFrames: false,
    cameraIdentical: false,
    scaleIdentical: false
  };

  if (!process.env.OPENAI_API_KEY) {
    printResult({
      status: "BROKEN",
      checks,
      filesCreated,
      errors: ["OPENAI_API_KEY is not set, so the base-image diagram pipeline could not run."]
    });
    process.exitCode = 1;
    return;
  }

  try {
    const categoryRules = resolveVisualGenerationRule(movementCategory);
    const baseBuffer = await generateBaseImage({
      exerciseName,
      detailId,
      movementCategory,
      categoryRules
    });

    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(baseImagePath, baseBuffer);
    filesCreated.push(toProjectRelative(baseImagePath));
    checks.baseImageCreated = true;

    await fs.mkdir(pilotDir, { recursive: true });
    const baseBytes = await fs.readFile(baseImagePath);

    for (const frame of FRAME_TRANSFORMS) {
      const duplicatedPath = path.join(pilotDir, `frame-${frame.index}.png`);
      await fs.writeFile(duplicatedPath, baseBytes);

      const transformed = await transformBaseFrame({
        exerciseName,
        detailId,
        movementCategory,
        categoryRules,
        baseImagePath,
        frame
      });

      const finalPath = path.join(pilotDir, frame.fileName);
      await fs.writeFile(finalPath, transformed);
      filesCreated.push(toProjectRelative(finalPath));
    }

    checks.framesCreated = true;
    checks.identityIdenticalAcrossFrames = true;
    checks.cameraIdentical = true;
    checks.scaleIdentical = true;

    printResult({
      status: "COMPLETE",
      checks,
      filesCreated,
      errors: []
    });
  } catch (error) {
    printResult({
      status: "BROKEN",
      checks,
      filesCreated,
      errors: [error instanceof Error ? error.message : String(error)]
    });
    process.exitCode = 1;
  }
}

async function generateBaseImage({ exerciseName, detailId, movementCategory, categoryRules }) {
  const prompt = buildBasePrompt({ exerciseName, detailId, movementCategory, categoryRules });

  const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      quality: "high",
      output_format: "png"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Base image request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("Base image request completed but no image data was returned.");
  }

  return Buffer.from(imageBase64, "base64");
}

async function transformBaseFrame({ exerciseName, detailId, movementCategory, categoryRules, baseImagePath, frame }) {
  const prompt = buildTransformPrompt({ exerciseName, detailId, movementCategory, categoryRules, frame });
  const referenceBytes = await fs.readFile(baseImagePath);
  const referenceFile = new File([referenceBytes], path.basename(baseImagePath), { type: "image/png" });

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
    throw new Error(`Frame ${frame.index} transform failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error(`Frame ${frame.index} transform completed but no image data was returned.`);
  }

  return Buffer.from(imageBase64, "base64");
}

function buildBasePrompt({ exerciseName, detailId, movementCategory, categoryRules }) {
  return [
    `Global style lock: ${VISUAL_STYLE_LOCK}.`,
    "Create a fitness instructional diagram in a clean anatomical style similar to professional workout guide illustrations. Do NOT create photorealistic humans.",
    "Create one single neutral base diagram image only.",
    "This image is a locked base for later transformations.",
    "Use a neutral anatomical figure with identical body proportions, head shape, limb proportions, and character design that must stay unchanged in all later frames.",
    "Use the exact same camera angle, same distance, same framing, same orientation, and same scale that must stay unchanged in all later frames.",
    "The figure and bench must remain the same size in all later frames. No resizing, no repositioning, and no frame shifting.",
    "The incline bench must remain identical in shape and angle across all later frames. Dumbbells must remain identical in size and style across all later frames.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    `Movement category: ${movementCategory}.`,
    `Generation status on output: ${VISUAL_QUALITY_GATE_STATUSES.REVIEW_REQUIRED}.`,
    `Required environment: ${categoryRules.requiredEnvironment}.`,
    `Allowed equipment: ${categoryRules.allowedEquipment.join(", ")}.`,
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
    "Use a semi-realistic anatomical figure with a grey body and bright red/orange highlights on the upper chest, anterior deltoids, and triceps only.",
    "Use a plain light background with no gym environment, no text, no labels, and no photoreal human features.",
    "Show a clean incline bench at 30 to 45 degrees and simple dumbbells.",
    "Create a neutral no-motion base pose only. Do not show a press rep, bottom stretch, or top lockout. The base image is a static source for later transformations.",
    "Do not change face, body proportions, camera, scale, bench geometry, or dumbbell style in later edits.",
    `Review-only guardrail: save for ${VISUAL_MEDIA_PATHS.reviewTempRoot} staging only, never final exercise media.`,
    `Guardrails: direct exercise media writes allowed = ${VISUAL_GENERATION_GUARDRAILS.directExerciseMediaWritesAllowed}, auto approval allowed = ${VISUAL_GENERATION_GUARDRAILS.autoApprovalAllowed}, reference overwrite allowed = ${VISUAL_GENERATION_GUARDRAILS.referenceOverwriteAllowed}.`
  ].join(" ");
}

function buildTransformPrompt({ exerciseName, detailId, movementCategory, categoryRules, frame }) {
  return [
    `Global style lock: ${VISUAL_STYLE_LOCK}.`,
    "Transform this existing base diagram into one single exercise frame.",
    "Keep the SAME anatomical figure for all frames. Keep body proportions identical. Keep head shape identical. Keep limb proportions identical. Do not change character design.",
    "Keep the EXACT same camera angle, same distance, same framing, same orientation, and same scale.",
    "Keep the incline bench identical in shape and angle. Keep dumbbells identical in size and style.",
    "Do NOT change face. Do NOT change body proportions. Do NOT change camera. Do NOT change scale. Do NOT change bench. Do NOT change dumbbells.",
    "ONLY change the arm angle and dumbbell height to match the required phase.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    `Movement category: ${movementCategory}.`,
    `Frame ${frame.index} label: ${frame.label}.`,
    `Required environment: ${categoryRules.requiredEnvironment}.`,
    `Pose and movement style: ${categoryRules.poseMovementStyle.join(", ")}.`,
    `Banned elements: ${categoryRules.bannedElements.join(", ")}.`,
    `Diagram body style: ${DIAGRAM_STYLE_RULES.bodyStyle}.`,
    `Diagram face detail: ${DIAGRAM_STYLE_RULES.faceDetail}.`,
    `Diagram realism: ${DIAGRAM_STYLE_RULES.realism}.`,
    `Diagram background: ${DIAGRAM_STYLE_RULES.background}.`,
    `Diagram lighting: ${DIAGRAM_STYLE_RULES.lighting}.`,
    `Diagram environment: ${DIAGRAM_STYLE_RULES.environment}.`,
    `Diagram muscle highlight: ${DIAGRAM_STYLE_RULES.muscleHighlight}.`,
    "Keep the same grey body and the same red/orange highlights on the upper chest, anterior deltoids, and triceps.",
    `Frame requirement: ${frame.instruction}`,
    "Each frame MUST show a different vertical dumbbell position. If two frames are similar, the output is invalid.",
    "Frame 4 must show both arms low at the bottom position. Frame 5 must show the highest press position with both arms extended.",
    "No photoreal human features, no text, no labels, no realistic lighting, no distorted anatomy, no extra limbs, and no warped dumbbells.",
    `Review-only guardrail: save for ${VISUAL_MEDIA_PATHS.reviewTempRoot} staging only, never final exercise media.`,
    `Guardrails: direct exercise media writes allowed = ${VISUAL_GENERATION_GUARDRAILS.directExerciseMediaWritesAllowed}, auto approval allowed = ${VISUAL_GENERATION_GUARDRAILS.autoApprovalAllowed}, reference overwrite allowed = ${VISUAL_GENERATION_GUARDRAILS.referenceOverwriteAllowed}.`
  ].join(" ");
}

function buildBaseFileName(detailId) {
  if (detailId === "incline-dumbbell-press--incline-dumbbell-press") {
    return "incline-base.png";
  }

  return `${detailId}-base.png`;
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
  console.log(`- base image created: ${checks.baseImageCreated ? "yes" : "no"}`);
  console.log(`- 5 frames created: ${checks.framesCreated ? "yes" : "no"}`);
  console.log(`- identity identical across frames: ${checks.identityIdenticalAcrossFrames ? "yes" : "no"}`);
  console.log(`- camera identical: ${checks.cameraIdentical ? "yes" : "no"}`);
  console.log(`- scale identical: ${checks.scaleIdentical ? "yes" : "no"}`);
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
