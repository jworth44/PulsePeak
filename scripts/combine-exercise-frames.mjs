import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const detailId = String(args.detailId || "").trim();
  const model = normalizeModel(args.model);

  if (!detailId || !model) {
    printResult({
      status: "BROKEN",
      filesCreated: [],
      errors: [
        "Usage: node scripts/combine-exercise-frames.mjs --detailId=\"...\" --model=\"male|female\""
      ]
    });
    process.exitCode = 1;
    return;
  }

  const sharp = loadSharp();
  const reviewDir = path.join(projectRoot, "temp", "review");
  const inputPaths = [1, 2, 3, 4, 5].map((index) =>
    path.join(reviewDir, `${detailId}-${model}-frame-${index}.png`)
  );
  const outputPath = path.join(reviewDir, `${detailId}-${model}-composite.png`);

  try {
    await verifyInputsExist(inputPaths);
    const frameData = await Promise.all(inputPaths.map((filePath) => loadFrameMetadata(sharp, filePath)));
    const targetHeight = Math.min(...frameData.map((frame) => frame.metadata.height || 0));

    if (!targetHeight) {
      throw new Error("Could not determine a valid target height from the input frames.");
    }

    const resizedFrames = await Promise.all(
      frameData.map(async (frame) => {
        const resizedBuffer = await sharp(frame.filePath)
          .resize({ height: targetHeight, fit: "contain" })
          .png()
          .toBuffer();

        const resizedMetadata = await sharp(resizedBuffer).metadata();
        if (!resizedMetadata.width || !resizedMetadata.height) {
          throw new Error(`Could not read resized image dimensions for ${path.basename(frame.filePath)}.`);
        }

        return {
          input: resizedBuffer,
          top: 0,
          left: 0,
          width: resizedMetadata.width,
          height: resizedMetadata.height
        };
      })
    );

    let currentLeft = 0;
    const composites = resizedFrames.map((frame) => {
      const placement = {
        input: frame.input,
        top: 0,
        left: currentLeft
      };
      currentLeft += frame.width;
      return placement;
    });

    const compositeWidth = resizedFrames.reduce((sum, frame) => sum + frame.width, 0);

    await fs.mkdir(reviewDir, { recursive: true });
    await sharp({
      create: {
        width: compositeWidth,
        height: targetHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite(composites)
      .png()
      .toFile(outputPath);

    printResult({
      status: "COMPLETE",
      filesCreated: [toProjectRelative(outputPath)],
      errors: []
    });
  } catch (error) {
    printResult({
      status: "BROKEN",
      filesCreated: [],
      errors: [error instanceof Error ? error.message : String(error)]
    });
    process.exitCode = 1;
  }
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

  throw new Error("The sharp image library is not available, so frames cannot be combined in this environment.");
}

async function verifyInputsExist(inputPaths) {
  for (const inputPath of inputPaths) {
    try {
      await fs.access(inputPath);
    } catch {
      throw new Error(`Missing required review frame: ${inputPath}`);
    }
  }
}

async function loadFrameMetadata(sharp, filePath) {
  const metadata = await sharp(filePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not determine image dimensions for ${filePath}`);
  }

  return {
    filePath,
    metadata
  };
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
