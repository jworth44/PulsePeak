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
  VISUAL_GENERATION_STYLES,
  VISUAL_MEDIA_PATHS,
  VISUAL_QUALITY_GATE_STATUSES,
  VISUAL_STYLE_LOCK,
  normalizeVisualMovementCategory,
  resolveVisualGenerationRule,
  resolveVisualStyleRule
} from "../shared/visualGenerationRules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const DEFAULT_STEPS = 5;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const exerciseName = String(args.exerciseName || "").trim();
  const detailId = String(args.detailId || "").trim();
  const movementCategory =
    normalizeVisualMovementCategory(args.category || args.movementCategory) || "strength";
  const steps = normalizeSteps(args.steps);

  if (!exerciseName || !detailId) {
    printResult({
      status: "BROKEN",
      checks: {
        promptPrepared: false,
        imageGenerated: false,
        fileSaved: false
      },
      filesCreated: [],
      errors: [
        "Usage: node scripts/generate-anatomical-sequence.mjs --exerciseName=\"...\" --detailId=\"...\" --category=\"strength|yoga|mobility|stretch|rehab|cardio\" --steps=\"5\""
      ]
    });
    process.exitCode = 1;
    return;
  }

  const outputFilePath = path.join(
    projectRoot,
    VISUAL_MEDIA_PATHS.reviewAnatomicalRoot,
    `${detailId}-anatomical-sequence.png`
  );
  const promptFilePath = path.join(
    projectRoot,
    VISUAL_MEDIA_PATHS.reviewAnatomicalRoot,
    `${detailId}-anatomical-prompt.txt`
  );
  const checks = {
    promptPrepared: false,
    imageGenerated: false,
    fileSaved: false
  };
  const errors = [];
  const prompt = buildAnatomicalPrompt({ exerciseName, detailId, movementCategory, steps });

  try {
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(promptFilePath, `${prompt}\n`);
    checks.promptPrepared = true;
  } catch (error) {
    errors.push(`Unable to save anatomical pilot prompt: ${error instanceof Error ? error.message : String(error)}`);
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
    errors.push("OPENAI_API_KEY is not set, so the anatomical sequence pilot prompt was prepared but no live image request was run.");
    printResult({
      status: "PARTIAL",
      checks,
      filesCreated: [toProjectRelative(promptFilePath)],
      errors
    });
    return;
  }

  try {
    const imageBuffer = await generateAnatomicalSequence(prompt);
    checks.imageGenerated = true;
    await fs.writeFile(outputFilePath, imageBuffer);
    checks.fileSaved = true;

    printResult({
      status: "COMPLETE",
      checks,
      filesCreated: [toProjectRelative(promptFilePath), toProjectRelative(outputFilePath)],
      errors
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    printResult({
      status: "PARTIAL",
      checks,
      filesCreated: [toProjectRelative(promptFilePath)],
      errors
    });
  }
}

async function generateAnatomicalSequence(prompt) {
  const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: "1536x1024",
      quality: "high",
      output_format: "png"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI anatomical image request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("OpenAI anatomical image request completed but no image data was returned.");
  }

  return Buffer.from(imageBase64, "base64");
}

function buildAnatomicalPrompt({ exerciseName, detailId, movementCategory, steps }) {
  const categoryRules = resolveVisualGenerationRule(movementCategory);
  const styleRules = resolveVisualStyleRule(VISUAL_GENERATION_STYLES.ANATOMICAL_SEQUENCE);
  const isInclineDumbbellPress =
    normalizeLookupValue(exerciseName) === "incline dumbbell press" ||
    normalizeLookupValue(detailId) === "incline-dumbbell-press--incline-dumbbell-press";

  const muscles = isInclineDumbbellPress
    ? "upper chest, anterior deltoids, and triceps highlighted in red and orange"
    : "primary working muscles highlighted in red and orange";

  return [
    `Global style lock: ${VISUAL_STYLE_LOCK}.`,
    "Create a fitness instructional diagram in a clean anatomical style similar to professional workout guide illustrations. Do NOT create photorealistic humans.",
    "Create one clean anatomical sequence guide image for PulsePeak.",
    `Exercise name: ${exerciseName}.`,
    `Exercise detailId: ${detailId}.`,
    `Movement category: ${movementCategory}.`,
    `Generation style: ${VISUAL_GENERATION_STYLES.ANATOMICAL_SEQUENCE}.`,
    `Panel count: ${steps}.`,
    `Generation status on output: ${VISUAL_QUALITY_GATE_STATUSES.REVIEW_REQUIRED}.`,
    `Required environment: ${categoryRules.requiredEnvironment}.`,
    `Allowed equipment: ${categoryRules.allowedEquipment.join(", ")}.`,
    `Pose and movement style: ${categoryRules.poseMovementStyle.join(", ")}.`,
    `Banned movement-category elements: ${categoryRules.bannedElements.join(", ")}.`,
    `Diagram body style: ${DIAGRAM_STYLE_RULES.bodyStyle}.`,
    `Diagram face detail: ${DIAGRAM_STYLE_RULES.faceDetail}.`,
    `Diagram realism: ${DIAGRAM_STYLE_RULES.realism}.`,
    `Diagram background: ${DIAGRAM_STYLE_RULES.background}.`,
    `Diagram lighting: ${DIAGRAM_STYLE_RULES.lighting}.`,
    `Diagram environment: ${DIAGRAM_STYLE_RULES.environment}.`,
    `Diagram muscle highlight: ${DIAGRAM_STYLE_RULES.muscleHighlight}.`,
    `Diagram equipment style: ${DIAGRAM_STYLE_RULES.equipmentStyle}.`,
    `Style rules: ${styleRules.subjectStyle.join(", ")}.`,
    `Identity rules: ${styleRules.identityRules.join(", ")}.`,
    `Environment rules: ${styleRules.environmentRules.join(", ")}.`,
    `Muscle highlight rules: ${styleRules.muscleHighlightRules.join(", ")}.`,
    `Style banned elements: ${styleRules.bannedElements.join(", ")}.`,
    `Pilot anatomy requirement: ${muscles}.`,
    "Show a 5-panel anatomical movement sequence with a simple incline bench and simple dumbbells.",
    "Use a clean white or light background.",
    "Do not use a realistic face, photorealistic person, or fake AI photography.",
    "Do not bake text, labels, or captions into the image.",
    "If the output contains a realistic human face, photographic lighting, or detailed skin texture, mark it as FAILED.",
    "For Incline Dumbbell Press, show five clear phases from setup through lockout with the incline bench visible and the dumbbells easy to read.",
    `Review-first rule: output is for ${VISUAL_MEDIA_PATHS.reviewAnatomicalRoot} only and must never be treated as approved automatically.`,
    `Guardrails: direct exercise media writes allowed = ${VISUAL_GENERATION_GUARDRAILS.directExerciseMediaWritesAllowed}, auto approval allowed = ${VISUAL_GENERATION_GUARDRAILS.autoApprovalAllowed}, reference overwrite allowed = ${VISUAL_GENERATION_GUARDRAILS.referenceOverwriteAllowed}.`
  ].join(" ");
}

function normalizeSteps(value) {
  const parsed = Number.parseInt(String(value || DEFAULT_STEPS), 10);
  return Number.isFinite(parsed) && parsed >= 4 && parsed <= 5 ? parsed : DEFAULT_STEPS;
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

function normalizeLookupValue(value) {
  return String(value || "").trim().toLowerCase();
}

function toProjectRelative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll("\\", "/");
}

function printResult({ status, checks, filesCreated, errors }) {
  console.log(`STATUS: ${status}`);
  console.log("");
  console.log("CHECKS:");
  console.log(`- prompt prepared: ${checks.promptPrepared ? "yes" : "no"}`);
  console.log(`- image generated: ${checks.imageGenerated ? "yes" : "no"}`);
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
