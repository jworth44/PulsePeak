import fs from "node:fs/promises";
import path from "node:path";
import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";

const projectRoot = process.cwd();
const artifactRoot = path.join(projectRoot, "artifacts", "media", "top5-visual-pilot");
const publicMediaRoot = path.join(projectRoot, "public", "media", "exercises");
const promptVersion = "pulsepeak-top5-visual-pilot-v1";

const PILOT_EXERCISES = [
  {
    name: "Goblet squat",
    equipment: "one dumbbell or kettlebell",
    category: "Legs",
    summary:
      "athletic adult model performing a goblet squat with one dumbbell or kettlebell held tight at chest height, safe squat mechanics, chest tall, heels grounded",
    thumbnail: "standing tall with the weight held vertically at chest height, feet set about shoulder width, clean studio-gym hero frame",
    steps: [
      "Start position: standing tall, one dumbbell or kettlebell held at chest height, elbows tucked, feet planted about shoulder width, torso upright, neutral spine",
      "Mid position: lowering into the squat under control, knees and hips bending together, weight still tight to chest, torso tall, heels grounded",
      "Peak position: bottom of the controlled squat, chest still lifted, heels grounded, knees tracking over toes, weight close to sternum",
      "Finish position: standing tall again after the squat, hips and knees extended, weight still held at chest, stable balanced stance"
    ]
  },
  {
    name: "Incline dumbbell press",
    equipment: "low-to-moderate incline bench and two dumbbells",
    category: "Chest",
    summary:
      "athletic adult model lying on a low incline bench performing an incline dumbbell press with two dumbbells, upper-chest focused pressing mechanics, shoulder blades set",
    thumbnail: "top half of the press on an incline bench with dumbbells controlled over the upper chest line, feet planted, stable body position",
    steps: [
      "Start position: lying on a low incline bench, dumbbells near the upper chest line, wrists stacked over elbows, feet planted, shoulder blades set back and down",
      "Mid position: pressing the dumbbells upward and slightly inward from the upper chest line, elbows tracking slightly below shoulder height",
      "Peak position: top press position with arms extended but not aggressively locked, dumbbells controlled and balanced over the upper chest line",
      "Finish position: controlled lower/reset with dumbbells returning near the upper chest line, ribcage steady, shoulders still packed"
    ]
  },
  {
    name: "Hammer curl",
    equipment: "two dumbbells",
    category: "Biceps",
    summary:
      "athletic adult model standing tall performing a hammer curl with two dumbbells in a neutral grip, elbows close to ribs, realistic arm training form",
    thumbnail: "clean representative standing hammer curl frame with dumbbells beside the torso and palms facing inward, premium studio-gym look",
    steps: [
      "Start position: standing tall, dumbbells at the sides, palms facing inward, wrists neutral, elbows close to the ribs, shoulders relaxed",
      "Mid position: curling the dumbbells upward with a neutral grip, upper arms mostly still, no torso swing, controlled elbow flexion",
      "Peak position: top curl position with neutral grip maintained, forearms near vertical, biceps and brachialis engaged, shoulders not shrugged",
      "Finish position: controlled lower/reset with dumbbells returning to the sides, arms extended again, posture tall and steady"
    ]
  },
  {
    name: "Barbell bench press",
    equipment: "flat bench, racked barbell, and plates",
    category: "Chest",
    summary:
      "athletic adult model performing a barbell bench press on a flat bench inside a clean PulsePeak gym, correct rack setup, strong pressing mechanics, safe shoulder position",
    thumbnail: "controlled bench press frame on a flat bench with barbell centered over the chest, hands set on the bar, premium gym look",
    steps: [
      "Start position: lying on a flat bench under a racked barbell, hands gripping the bar evenly, shoulder blades set, feet planted, bar unracked over the chest",
      "Mid position: lowering the barbell under control toward the lower chest or sternum line, elbows under the bar, torso stable on the bench",
      "Peak position: bottom position with the barbell lightly touching or reaching the lower chest line under control, wrists stacked, shoulders stable",
      "Finish position: pressing the barbell upward to a controlled top position over the chest without overlocking or losing shoulder position"
    ]
  },
  {
    name: "T-bar row",
    equipment: "T-bar row setup or landmine row handle",
    category: "Back",
    summary:
      "athletic adult model performing a T-bar row from a strong hip hinge with neutral spine, pulling a landmine row handle toward the lower chest or upper abdomen, exact rowing setup",
    thumbnail: "hinged T-bar row setup with neutral spine and handle gripped firmly, premium gym frame that clearly shows the row station and body position",
    steps: [
      "Start position: strong hip-hinged stance at the T-bar row or landmine handle, arms extended, spine neutral, chest open, knees softly bent",
      "Mid position: pulling the handle toward the lower chest or upper abdomen, elbows driving back, torso staying stable without jerking",
      "Peak position: top row position with elbows back, upper back engaged, handle close to lower chest or upper abdomen, neck neutral",
      "Finish position: controlled lower/reset to arms extended again, torso still hinged and stable, no rounding through the spine"
    ]
  }
];

const MODEL_SPECS = {
  male: {
    label: "adult male model",
    identity:
      "one consistent adult male exercise model, athletic and realistic, balanced muscle definition, natural skin texture, short dark hair",
    outfit:
      "red, black, and white PulsePeak training outfit, consistent across all steps, modern training shoes",
    wardrobe: "same outfit style across every image in the male set"
  },
  female: {
    label: "adult female model",
    identity:
      "one consistent adult female exercise model, athletic and realistic, toned but natural build, natural skin texture, tied-back hair",
    outfit:
      "red, black, and white PulsePeak training outfit, consistent across all steps, modern training shoes",
    wardrobe: "same outfit style across every image in the female set"
  }
};

const GLOBAL_STYLE =
  "same PulsePeak gym/studio environment, same red/black/white brand styling, same soft clean lighting, same 45-degree or front training camera style, same premium realistic fitness photography look, safe exercise form, believable anatomy, no extra people, no background clutter";

const NEGATIVE_PROMPT =
  "wrong exercise, approximate movement family, broken anatomy, extra limbs, malformed hands, warped dumbbells or barbell, unstable bench, incorrect equipment, blurry frame, cropped body, dramatic cinematic lighting, cluttered background, multiple people, unsafe form";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPrompt({ exercise, modelKey, detailId, phaseLabel, phasePrompt }) {
  const model = MODEL_SPECS[modelKey];
  return [
    `Create an exact exercise visual for PulsePeak.`,
    `${model.identity}.`,
    `${model.outfit}.`,
    `${GLOBAL_STYLE}.`,
    `Exercise: ${exercise.name}.`,
    `Exercise detailId: ${detailId}.`,
    `Category: ${exercise.category}.`,
    `Required equipment: ${exercise.equipment}.`,
    `Exercise summary: ${exercise.summary}.`,
    `Required phase: ${phaseLabel}.`,
    `Shot direction: ${phasePrompt}.`,
    `Keep the same model identity, same environment, same lighting, same wardrobe, and the same camera style across thumbnail and all four steps.`,
    `Do not substitute another exercise, do not change equipment, and do not approximate the movement family.`,
    `Negative prompt: ${NEGATIVE_PROMPT}.`
  ].join(" ");
}

function buildPromptPack(entry, exercise) {
  const baseName = slugify(entry.name);
  return Object.keys(MODEL_SPECS).reduce((acc, modelKey) => {
    acc[modelKey] = {
      detailId: entry.detailId,
      modelKey,
      outputFolder: `public/media/exercises/${entry.detailId}/${modelKey}`,
      files: {
        thumbnail: {
          filename: "thumbnail.png",
          prompt: buildPrompt({
            exercise,
            modelKey,
            detailId: entry.detailId,
            phaseLabel: "Thumbnail",
            phasePrompt: exercise.thumbnail
          })
        },
        steps: exercise.steps.map((phasePrompt, index) => ({
          filename: `step-${index + 1}.png`,
          label: ["Start", "Mid", "Peak", "Finish"][index],
          prompt: buildPrompt({
            exercise,
            modelKey,
            detailId: entry.detailId,
            phaseLabel: ["Start", "Mid", "Peak", "Finish"][index],
            phasePrompt
          })
        }))
      },
      reviewGate: {
        requiredFiles: ["thumbnail.png", "step-1.png", "step-2.png", "step-3.png", "step-4.png"],
        rules: [
          "All 5 files must exist before wiring this model set.",
          "All 5 images must match the exact named exercise and detailId.",
          "Start, Mid, Peak, and Finish must be visually distinct.",
          "Reject if anatomy, equipment, or exercise mechanics are obviously wrong."
        ]
      },
      filenamesReady: [
        `${baseName}-${modelKey}-thumbnail.png`,
        `${baseName}-${modelKey}-step-1.png`,
        `${baseName}-${modelKey}-step-2.png`,
        `${baseName}-${modelKey}-step-3.png`,
        `${baseName}-${modelKey}-step-4.png`
      ]
    };
    return acc;
  }, {});
}

function renderPromptMarkdown(entry, exercise, modelKey, pack) {
  return [
    `# ${exercise.name} — ${modelKey} model pilot`,
    ``,
    `- detailId: \`${entry.detailId}\``,
    `- output folder: \`${pack.outputFolder}\``,
    `- required files: \`thumbnail.png\`, \`step-1.png\`, \`step-2.png\`, \`step-3.png\`, \`step-4.png\``,
    `- status: External generation required before wiring`,
    ``,
    `## Thumbnail`,
    pack.files.thumbnail.prompt,
    ``,
    `## Step 1 — Start`,
    pack.files.steps[0].prompt,
    ``,
    `## Step 2 — Mid`,
    pack.files.steps[1].prompt,
    ``,
    `## Step 3 — Peak`,
    pack.files.steps[2].prompt,
    ``,
    `## Step 4 — Finish`,
    pack.files.steps[3].prompt,
    ``,
    `## Review gate`,
    ...pack.reviewGate.rules.map((rule) => `- ${rule}`)
  ].join("\n");
}

async function ensureFolderStub(detailId, modelKey) {
  const dir = path.join(publicMediaRoot, detailId, modelKey);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, ".gitkeep"),
    `External generation required before wiring ${detailId}/${modelKey}.\n`,
    "utf8"
  );
}

async function main() {
  const catalog = getExerciseLibraryCatalog().entries;
  const created = [];
  const manifest = {
    version: promptVersion,
    generatedAt: new Date().toISOString(),
    generationAvailableInRepo: false,
    reason:
      "This Codex environment can scaffold exact prompt packs and folder stubs, but it cannot deterministically save generated image outputs into the repo media folders from the image tool.",
    exercises: []
  };

  for (const exercise of PILOT_EXERCISES) {
    const entry = catalog.find((candidate) => candidate.name === exercise.name);
    if (!entry?.detailId) {
      throw new Error(`Pilot exercise not found or missing detailId: ${exercise.name}`);
    }

    const promptPack = buildPromptPack(entry, exercise);
    const artifactExerciseRoot = path.join(artifactRoot, entry.detailId);
    await fs.mkdir(artifactExerciseRoot, { recursive: true });

    for (const modelKey of Object.keys(MODEL_SPECS)) {
      await ensureFolderStub(entry.detailId, modelKey);
      const artifactModelRoot = path.join(artifactExerciseRoot, modelKey);
      await fs.mkdir(artifactModelRoot, { recursive: true });
      await fs.writeFile(
        path.join(artifactModelRoot, "prompt.md"),
        renderPromptMarkdown(entry, exercise, modelKey, promptPack[modelKey]),
        "utf8"
      );
      await fs.writeFile(
        path.join(artifactModelRoot, "prompt.json"),
        JSON.stringify(promptPack[modelKey], null, 2),
        "utf8"
      );
    }

    manifest.exercises.push({
      name: entry.name,
      detailId: entry.detailId,
      prompts: promptPack
    });
    created.push({ name: entry.name, detailId: entry.detailId });
  }

  await fs.mkdir(artifactRoot, { recursive: true });
  await fs.writeFile(path.join(artifactRoot, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  console.log(JSON.stringify({ created, manifest: path.join(artifactRoot, "manifest.json") }, null, 2));
}

await main();
