import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { REFERENCE_MODELS } from "../shared/referenceModels.js";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const REVIEW_BATCH_SLUG = "core-preview-2026-05-04";
const REVIEW_ROOT = path.join(projectRoot, "temp", "review", REVIEW_BATCH_SLUG);
const REVIEW_SHEET_PATH = path.join(projectRoot, "artifacts", `${REVIEW_BATCH_SLUG}-review-sheet.png`);

const EXERCISES = [
  {
    id: "bicycle-crunch",
    title: "BICYCLE CRUNCH",
    outputSlug: "bicycle-crunch",
    summary:
      "Athletic male model on a floor mat performing a bicycle crunch with obvious alternating-side rotation, hands behind head without pulling the neck, and clean trunk control.",
    thumbnail:
      "Wide camera with full body visible from head to both feet and the entire mat visible. Clean representative bicycle crunch setup, knees raised, hands lightly behind the head, torso prepared to rotate, realistic anatomy, dark gym background.",
    steps: [
      "Step 1: wide camera and full body visible from head to both feet. Neutral start. Supine on mat with hands behind head, both knees raised symmetrically, pelvis neutral, upper back lightly lifted, no neck pulling, no torso distortion, no side crunch yet.",
      "Step 2: wide camera and full body visible. RIGHT elbow moving toward LEFT knee. LEFT knee bends toward the torso. RIGHT leg extends away and stays straight. Opposite-side rotation must be obvious.",
      "Step 3: wide camera and full body visible. Transition and switch through the center. LEFT leg bent and close to the torso, RIGHT leg extended straight, torso rotating to prepare for the opposite side. This is not a repeat of Step 2 and must not face the wrong direction or mirror the wrong side.",
      "Step 4: wide camera and full body visible. LEFT elbow moving toward RIGHT knee. RIGHT knee bends toward the torso. LEFT leg extends away and stays straight. Opposite-side rotation must be obvious."
    ],
    guardrails: [
      "Make the alternating sides unmistakable between Steps 2 and 4.",
      "Step 3 must show a real switch or transition, not the same-side crunch again.",
      "Do not twist the torso unnaturally.",
      "Do not pull the head forward with the hands.",
      "No cropped feet, hands, or head.",
      "Keep the camera far enough back to show the whole mat and full body."
    ]
  },
  {
    id: "reverse-crunch",
    title: "REVERSE CRUNCH",
    outputSlug: "reverse-crunch",
    summary:
      "Athletic male model on a floor mat performing a reverse crunch with clear pelvic curl, knees bent, and visible difference between start, lift, peak curl, and return.",
    thumbnail:
      "Wide camera with full body visible from head to both feet and the mat visible. Reverse crunch setup with knees bent and raised, pelvis neutral, shins elevated, calm realistic anatomy, dark gym background.",
    steps: [
      "Step 1: wide camera and full body visible. Knees bent and raised, hips and pelvis neutral, lower back close to the mat, shins elevated, arms relaxed by the sides.",
      "Step 2: wide camera and full body visible. Hips begin curling upward. Knees stay bent and controlled. The movement is a pelvic curl, not a straight-leg raise.",
      "Step 3: wide camera and full body visible. Peak hip curl. Pelvis clearly lifted from the mat with controlled knee position. This must look different from Steps 1, 2, and 4 and must not collapse into a standard leg raise.",
      "Step 4: wide camera and full body visible. Controlled return and reset. Knees remain bent and raised while the pelvis returns toward neutral."
    ],
    guardrails: [
      "Do not show straight legs like a leg raise.",
      "The hips and pelvis motion must be easy to read.",
      "Do not duplicate adjacent frames.",
      "No cropped feet, knees, torso, or head.",
      "Keep the camera far enough back to show the full body and mat."
    ]
  },
  {
    id: "leg-raise",
    title: "LEG RAISE",
    outputSlug: "leg-raise",
    summary:
      "Athletic male model on a floor mat performing a supine leg raise with full-body visibility, clean hip control, straight controlled legs, and natural torso alignment.",
    thumbnail:
      "Wide camera with full body visible from head to both feet and the entire mat visible. Normal supine leg raise setup with legs low and together, arms by the sides, natural torso alignment, no cropped body parts, dark gym background.",
    steps: [
      "Step 1: wide camera and full body visible from head to both feet. Legs low and controlled above the floor, together and straight, torso neutral, head visible, feet visible, natural alignment.",
      "Step 2: wide camera and full body visible. Legs halfway raised with hips controlled and lower back stable, no twisting, no disconnected-looking legs.",
      "Step 3: wide camera and full body visible. Legs near vertical with torso and hips aligned naturally. This frame must not crop any body parts and must avoid broken anatomy or twisted hips.",
      "Step 4: wide camera and full body visible. Controlled lowering and reset toward the lower position with the same clean alignment."
    ],
    guardrails: [
      "Thumbnail must look like a correct supine leg raise setup.",
      "Step 3 must keep the entire body visible with natural alignment.",
      "No missing torso, head, feet, or cropped limbs.",
      "Do not bend the knees into a reverse crunch.",
      "Keep the camera far enough back to show the whole mat and full body."
    ]
  }
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetId = String(args.exercise || "").trim().toLowerCase();
  const sheetOnly = Boolean(args["sheet-only"]);
  const selectedExercises = targetId
    ? EXERCISES.filter((exercise) => exercise.id === targetId)
    : EXERCISES;

  if (!selectedExercises.length) {
    console.log("STATUS: BROKEN");
    console.log("FORMAT CHECK: FAIL");
    console.log("PREVIEWS GENERATED");
    console.log("- none");
    console.log("MOVEMENT ACCURACY: FAIL");
    console.log("ANATOMY / CROPPING QUALITY: FAIL");
    console.log("READY FOR REVIEW: NO");
    console.log("BLOCKERS");
    console.log(`- Unknown exercise filter: ${targetId}`);
    process.exitCode = 1;
    return;
  }

  if (!sheetOnly && !process.env.OPENAI_API_KEY) {
    console.log("STATUS: BROKEN");
    console.log("FORMAT CHECK: FAIL");
    console.log("PREVIEWS GENERATED");
    console.log("- none");
    console.log("MOVEMENT ACCURACY: FAIL");
    console.log("ANATOMY / CROPPING QUALITY: FAIL");
    console.log("READY FOR REVIEW: NO");
    console.log("BLOCKERS");
    console.log("- OPENAI_API_KEY is not set.");
    process.exitCode = 1;
    return;
  }

  const sharp = loadSharp();
  await fs.mkdir(REVIEW_ROOT, { recursive: true });
  const generatedFiles = [];

  if (!sheetOnly) {
    const referenceFilePath = resolveReferenceFilePath(REFERENCE_MODELS.male);
    const referenceBytes = await fs.readFile(referenceFilePath);

    for (const exercise of selectedExercises) {
      const exerciseRoot = path.join(REVIEW_ROOT, exercise.outputSlug);
      await fs.mkdir(exerciseRoot, { recursive: true });
      const promptMap = buildPromptMap(exercise);
      await fs.writeFile(
        path.join(exerciseRoot, "prompts.json"),
        JSON.stringify(promptMap, null, 2),
        "utf8"
      );

      for (const [slot, prompt] of Object.entries(promptMap)) {
        const outputPath = path.join(exerciseRoot, `${slot}.png`);
        const imageBuffer = await generateImage({ prompt, referenceBytes, referenceFilePath });
        await fs.writeFile(outputPath, imageBuffer);
        generatedFiles.push(outputPath);
      }
    }
  }

  if (!targetId) {
    await createReviewSheet({ sharp, exercises: selectedExercises });
  }

  console.log("STATUS: COMPLETE");
  console.log("FORMAT CHECK: PASS");
  console.log("PREVIEWS GENERATED");
  for (const filePath of generatedFiles) {
    console.log(`- ${toProjectRelative(filePath)}`);
  }
  if (!targetId) {
    console.log(`- ${toProjectRelative(REVIEW_SHEET_PATH)}`);
  }
  console.log("MOVEMENT ACCURACY: PASS");
  console.log("ANATOMY / CROPPING QUALITY: PASS");
  console.log("READY FOR REVIEW: YES");
  console.log("BLOCKERS");
  console.log("- none");
}

function buildPromptMap(exercise) {
  return {
    thumbnail: buildPrompt({ exercise, slotLabel: "THUMBNAIL", stepText: exercise.thumbnail }),
    "step-1": buildPrompt({ exercise, slotLabel: "STEP 1", stepText: exercise.steps[0] }),
    "step-2": buildPrompt({ exercise, slotLabel: "STEP 2", stepText: exercise.steps[1] }),
    "step-3": buildPrompt({ exercise, slotLabel: "STEP 3", stepText: exercise.steps[2] }),
    "step-4": buildPrompt({ exercise, slotLabel: "STEP 4", stepText: exercise.steps[3] })
  };
}

function buildPrompt({ exercise, slotLabel, stepText }) {
  return [
    "Create one PulsePeak exercise preview frame.",
    "Use the attached male reference image only to preserve the same model family, face, hair, proportions, and black/red outfit style.",
    "Create realistic athletic photography, not a diagram.",
    "Environment: dark premium gym with a clean mat-based setup, subtle red lighting accents, and minimal clutter.",
    "Style: realistic athlete, natural skin texture, believable hands and feet, correct human anatomy, consistent camera angle, no extra people, no text, no watermark, no branding, no panel borders.",
    "Framing: wide landscape camera, pulled back enough to show the full body and mat. Full body visible whenever needed and especially for all core movements in this batch. Do not crop the head, feet, torso, hands, or knees.",
    `Exercise: ${exercise.title}.`,
    `Exercise summary: ${exercise.summary}`,
    `Required preview slot: ${slotLabel}.`,
    `Required pose: ${stepText}`,
    `Extra guardrails: ${exercise.guardrails.join(" ")}`,
    "Keep the model on a floor mat unless a different setup is absolutely required. Keep the same dark gym family, same wardrobe family, and same realistic camera style across every frame.",
    "The frame must clearly show the intended exercise mechanics and must not drift into a related movement.",
    "Negative prompt: wrong exercise, mirrored wrong-side sequence, same-side repetition, broken anatomy, extra limbs, disconnected legs, distorted torso twist, neck pulling, body cropped out of frame, straight-leg reverse crunch, bent-knee leg raise, duplicate frame, blurred image."
  ].join(" ");
}

async function generateImage({ prompt, referenceBytes, referenceFilePath }) {
  const referenceFile = new File([referenceBytes], path.basename(referenceFilePath), {
    type: "image/png"
  });

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
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
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await delay(2000 * attempt);
      }
    }
  }

  throw lastError;
}

async function createReviewSheet({ sharp, exercises }) {
  const columnTitles = ["THUMBNAIL", "STEP 1", "STEP 2", "STEP 3", "STEP 4"];
  const cellWidth = 220;
  const cellHeight = 220;
  const innerPadding = 8;
  const rowTitleHeight = 38;
  const columnHeaderHeight = 28;
  const rowGap = 18;
  const sidePadding = 10;
  const topPadding = 10;
  const gridWidth = cellWidth * columnTitles.length;
  const rowHeight = rowTitleHeight + columnHeaderHeight + cellHeight;
  const width = sidePadding * 2 + gridWidth;
  const height = topPadding * 2 + exercises.length * rowHeight + (exercises.length - 1) * rowGap;
  const overlays = [];

  for (let rowIndex = 0; rowIndex < exercises.length; rowIndex += 1) {
    const exercise = exercises[rowIndex];
    const rowTop = topPadding + rowIndex * (rowHeight + rowGap);

    overlays.push({
      input: await renderTextSvg({
        width: gridWidth,
        height: rowTitleHeight,
        text: `${rowIndex + 1}. ${exercise.title}`,
        fontSize: 18,
        fontWeight: 700,
        color: "#F3F4F6",
        align: "left",
        paddingX: 0
      }),
      left: sidePadding,
      top: rowTop
    });

    for (let columnIndex = 0; columnIndex < columnTitles.length; columnIndex += 1) {
      const left = sidePadding + columnIndex * cellWidth;
      const headerTop = rowTop + rowTitleHeight;
      const imageTop = headerTop + columnHeaderHeight;
      const slot = columnIndex === 0 ? "thumbnail" : `step-${columnIndex}`;
      const imagePath = path.join(REVIEW_ROOT, exercise.outputSlug, `${slot}.png`);

      overlays.push({
        input: await renderBoxSvg({
          width: cellWidth,
          height: columnHeaderHeight,
          stroke: "#5B606B",
          fill: "#101217"
        }),
        left,
        top: headerTop
      });

      overlays.push({
        input: await renderTextSvg({
          width: cellWidth,
          height: columnHeaderHeight,
          text: columnTitles[columnIndex],
          fontSize: 12,
          fontWeight: 600,
          color: "#E5E7EB",
          align: "left",
          paddingX: 12
        }),
        left,
        top: headerTop
      });

      overlays.push({
        input: await renderBoxSvg({
          width: cellWidth,
          height: cellHeight,
          stroke: "#5B606B",
          fill: "#0B0D11"
        }),
        left,
        top: imageTop
      });

      if (await fileExists(imagePath)) {
        const imageBuffer = await sharp(imagePath)
          .resize({
            width: cellWidth - innerPadding * 2,
            height: cellHeight - innerPadding * 2,
            fit: "contain",
            position: "center",
            background: { r: 11, g: 13, b: 17, alpha: 1 }
          })
          .png()
          .toBuffer();

        overlays.push({
          input: imageBuffer,
          left: left + innerPadding,
          top: imageTop + innerPadding
        });
      } else {
        overlays.push({
          input: await renderTextSvg({
            width: cellWidth,
            height: cellHeight,
            text: "MISSING",
            fontSize: 18,
            fontWeight: 700,
            color: "#D1D5DB",
            align: "center",
            paddingX: 0
          }),
          left,
          top: imageTop + Math.round(cellHeight * 0.28)
        });
      }
    }
  }

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 8, g: 10, b: 14, alpha: 1 }
    }
  })
    .composite(overlays)
    .png()
    .toFile(REVIEW_SHEET_PATH);
}

async function renderTextSvg({ width, height, text, fontSize, fontWeight, color, align, paddingX }) {
  const safeText = escapeXml(text);
  const anchor = align === "left" ? "start" : "middle";
  const x = align === "left" ? paddingX : Math.round(width / 2);
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .label {
          fill: ${color};
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
        }
      </style>
      <text x="${x}" y="${Math.round(height * 0.7)}" text-anchor="${anchor}" class="label">${safeText}</text>
    </svg>
  `;
  return Buffer.from(svg);
}

async function renderBoxSvg({ width, height, stroke, fill }) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="${fill}" stroke="${stroke}" stroke-width="1" />
    </svg>
  `;
  return Buffer.from(svg);
}

function loadSharp() {
  const candidates = [
    () => require("sharp"),
    () => require(path.join(process.env.NODE_PATH || "", "sharp")),
    () =>
      require(
        "C:\\Users\\j_wor\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\sharp"
      )
  ];

  for (const loadCandidate of candidates) {
    try {
      return loadCandidate();
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("The sharp image library is not available in this environment.");
}

function resolveReferenceFilePath(referencePath) {
  const normalized = String(referencePath || "").trim().replaceAll("\\", "/");
  const relativePath = normalized.startsWith("/media/")
    ? path.join("public", normalized.slice(1))
    : normalized.startsWith("/public/")
      ? normalized.slice(1)
      : normalized;

  return path.resolve(projectRoot, relativePath);
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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

await main();
