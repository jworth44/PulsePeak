import { buildMediaAssetPath } from "./exerciseCatalog.js";

export const PULSEPEAK_MEDIA_VERSION = "pulsepeak-media-v2";
export const PULSEPEAK_MEDIA_STEP_STATES = ["start position", "mid movement", "peak contraction", "finish position"];
export const PULSEPEAK_IMAGE_REQUIREMENTS = {
  minimumSteps: 2,
  standardSteps: 3,
  idealSteps: 4
};

export const PULSEPEAK_MEDIA_SYSTEM = {
  generator: "Leonardo AI",
  phase: "phase_1",
  version: PULSEPEAK_MEDIA_VERSION,
  visualStyle: {
    subject: "athletic, realistic fitness model with balanced muscle definition and natural skin texture",
    lighting: "soft gym lighting with natural shadows and no dramatic cinematic contrast",
    framing: "consistent full-body or 45-degree training frame with the movement clearly visible",
    angle: "front or 45-degree only",
    environment: "modern gym with clean background and minimal clutter",
    wardrobe: "consistent modern training apparel with neutral tones",
    look: "professional fitness photography, sharp detail, believable anatomy, consistent visual identity"
  },
  storage: {
    publicRoot: "/media/exercises",
    localRoot: "public/media/exercises"
  },
  stepLabels: PULSEPEAK_MEDIA_STEP_STATES,
  generationRules: {
    lockedModelsOnly: true,
    sameIdentityRequired: true,
    sameLightingRequired: true,
    sameEnvironmentRequired: true,
    sameFramingRequired: true
  }
};

export const PULSEPEAK_MODELS = {
  male: {
    key: "male",
    label: "Model A (Male)",
    referenceId: "pulsepeak-model-a-v1",
    seed: "PP-MALE-ATHLETIC-001",
    heightRange: "5'10-6'0",
    build: "athletic build with visible muscle definition, not bodybuilding size",
    face: "neutral face, clean jawline, natural expression",
    hair: "short dark hair",
    skin: "natural skin texture with visible pores, not plastic",
    aesthetic: "modern gym look with consistent training apparel",
    lockingMethod: "reference image or locked seed / platform character reference",
    description:
      "Athletic male model, 5'10-6'0, balanced muscle, short dark hair, neutral face, natural skin texture, modern gym look."
  },
  female: {
    key: "female",
    label: "Model B (Female)",
    referenceId: "pulsepeak-model-b-v1",
    seed: "PP-FEMALE-ATHLETIC-001",
    heightRange: "5'5-5'8",
    build: "athletic, toned, strong but realistic",
    face: "neutral face with consistent proportions",
    hair: "tied-back hair",
    skin: "natural skin texture with realistic detail",
    aesthetic: "modern fitness aesthetic with consistent training apparel",
    lockingMethod: "reference image or locked seed / platform character reference",
    description:
      "Athletic female model, 5'5-5'8, toned and realistic, tied-back hair, neutral face, natural skin texture, modern fitness aesthetic."
  }
};

export const STANDARD_EXERCISE_PROMPT_TEMPLATE =
  "high-quality fitness photo of [MODEL], performing [EXERCISE NAME], [STEP STATE], correct form, natural skin texture, modern gym, clean background, soft lighting, professional fitness photography, sharp detail";

export const PULSEPEAK_MEDIA_VALIDATION_RULES = {
  rejectIf: [
    "anatomy is wrong",
    "hands are broken",
    "pose is unclear",
    "wrong exercise is shown",
    "model identity changes",
    "lighting or framing does not match the PulsePeak style",
    "environment or clothing breaks consistency"
  ],
  approveOnlyIf: [
    "the movement is instantly understandable",
    "posture is clean and believable",
    "the same locked model identity is preserved",
    "the image clearly matches the intended movement phase",
    "the image fits the PulsePeak visual style"
  ]
};

export const INITIAL_EXERCISE_MEDIA_BATCH = [
  { id: "push-up", name: "Push-up", modelKey: "male", priority: "high" },
  { id: "goblet-squat", name: "Goblet squat", modelKey: "female", priority: "high" },
  { id: "dumbbell-shoulder-press", name: "Dumbbell shoulder press", modelKey: "female", priority: "high" },
  { id: "single-arm-dumbbell-row", name: "Single-arm dumbbell row", modelKey: "male", priority: "high" },
  { id: "lat-pulldown", name: "Lat pulldown", modelKey: "male", priority: "high" },
  { id: "romanian-deadlift", name: "Romanian deadlift", modelKey: "male", priority: "high" },
  { id: "walking-lunge", name: "Walking lunge", modelKey: "female", priority: "high" },
  { id: "glute-bridge", name: "Glute bridge", modelKey: "female", priority: "high" },
  { id: "plank-shoulder-tap", name: "Plank shoulder tap", modelKey: "male", priority: "high" },
  { id: "pallof-press", name: "Pallof press", modelKey: "female", priority: "high" },
  { id: "cat-cow", name: "Cat-cow", modelKey: "female", priority: "high" },
  { id: "worlds-greatest-stretch", name: "World's greatest stretch", modelKey: "male", priority: "high" },
  { id: "ninety-ninety-hip-flow", name: "90/90 hip flow", modelKey: "female", priority: "high" },
  { id: "thoracic-rotation", name: "Thoracic rotation", modelKey: "female", priority: "high" },
  { id: "hip-flexor-stretch", name: "Hip flexor stretch", modelKey: "male", priority: "high" },
  { id: "hamstring-stretch", name: "Hamstring stretch", modelKey: "female", priority: "high" },
  { id: "wall-slide", name: "Wall slide", modelKey: "female", priority: "high" },
  { id: "band-pull-apart", name: "Band pull-apart", modelKey: "male", priority: "high" },
  { id: "dead-bug-breathing", name: "Dead bug breathing", modelKey: "male", priority: "high" },
  { id: "spanish-squat-hold", name: "Spanish squat hold", modelKey: "female", priority: "high" }
];

export function buildExerciseMediaSpec({
  id,
  exerciseDetailId = null,
  name,
  familyId = "general",
  trainingType = "training",
  fallbackImage = null,
  modelKey = null,
  stepCount = PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps
}) {
  const selectedModel = PULSEPEAK_MODELS[modelKey] || resolveLockedModelForExercise({ id, familyId, trainingType });
  const resolvedStepCount = normalizeStepCount(stepCount);
  const mediaKey = String(exerciseDetailId || id || "").trim();
  const assetPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.publicRoot, mediaKey);
  const localPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.localRoot, mediaKey);
  const prompts = buildMovementPromptSet({ model: selectedModel, exerciseName: name, stepCount: resolvedStepCount });

  return {
    thumbnail: fallbackImage || null,
    images: [],
    steps: [],
    videoUrl: null,
    mediaStatus: fallbackImage ? "basic" : "none",
    assetPath,
    generation: {
      tool: PULSEPEAK_MEDIA_SYSTEM.generator,
      phase: PULSEPEAK_MEDIA_SYSTEM.phase,
      systemVersion: PULSEPEAK_MEDIA_SYSTEM.version,
      familyId,
      trainingType,
      modelKey: selectedModel.key,
      modelLabel: selectedModel.label,
      modelReferenceId: selectedModel.referenceId,
      modelSeed: selectedModel.seed,
      localPath,
      thumbnailPath: buildMediaAssetPath(assetPath, "thumbnail.png"),
      stepCount: resolvedStepCount,
      stepPaths: Array.from({ length: resolvedStepCount }, (_, index) => buildMediaAssetPath(assetPath, `step-${index + 1}.png`)),
      prompts,
      validationRules: PULSEPEAK_MEDIA_VALIDATION_RULES,
      consistencyLock: {
        modelKey: selectedModel.key,
        referenceId: selectedModel.referenceId,
        seed: selectedModel.seed,
        lighting: PULSEPEAK_MEDIA_SYSTEM.visualStyle.lighting,
        angle: PULSEPEAK_MEDIA_SYSTEM.visualStyle.angle,
        environment: PULSEPEAK_MEDIA_SYSTEM.visualStyle.environment,
        wardrobe: PULSEPEAK_MEDIA_SYSTEM.visualStyle.wardrobe
      }
    }
  };
}

export function buildMovementPromptSet({ model, exerciseName, stepCount = PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps }) {
  const resolvedStepCount = normalizeStepCount(stepCount);
  return PULSEPEAK_MEDIA_SYSTEM.stepLabels.slice(0, resolvedStepCount).map((stepState, index) => ({
    step: index + 1,
    label: stepState,
    prompt: STANDARD_EXERCISE_PROMPT_TEMPLATE.replace("[MODEL]", buildLockedModelPrompt(model))
      .replace("[EXERCISE NAME]", exerciseName)
      .replace("[STEP STATE]", stepState)
  }));
}

export function getInitialMediaBatch() {
  return INITIAL_EXERCISE_MEDIA_BATCH.map((entry) => ({
    ...entry,
    generator: PULSEPEAK_MEDIA_SYSTEM.generator,
    model: PULSEPEAK_MODELS[entry.modelKey],
    prompts: buildMovementPromptSet({ model: PULSEPEAK_MODELS[entry.modelKey], exerciseName: entry.name })
  }));
}

export function resolveLockedModelForExercise({ id, familyId = "", trainingType = "" }) {
  const value = [id, familyId, trainingType].join(" ").toLowerCase();
  if (["glute", "stretch", "mobility", "rotation", "slide", "flow", "bridge", "lunge"].some((token) => value.includes(token))) {
    return PULSEPEAK_MODELS.female;
  }
  return PULSEPEAK_MODELS.male;
}

export function normalizeStepCount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps;
  }
  return Math.max(PULSEPEAK_IMAGE_REQUIREMENTS.minimumSteps, Math.min(PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps, Math.round(numericValue)));
}

function buildLockedModelPrompt(model) {
  return `${model.label}, same PulsePeak reference identity, ${model.description}`;
}
