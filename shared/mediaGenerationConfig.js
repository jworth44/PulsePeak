import { buildMediaAssetPath } from "./exerciseCatalog.js";

export const PULSEPEAK_MEDIA_SYSTEM = {
  generator: "Leonardo AI",
  phase: "phase_1",
  visualStyle: {
    subject: "athletic, realistic fitness model with balanced muscle definition and natural skin texture",
    lighting: "soft gym lighting with natural shadows and no dramatic cinematic contrast",
    framing: "clean mid shot or full-body training frame with the movement clearly visible",
    environment: "modern gym or clean home training setup with minimal clutter",
    look: "professional fitness photography, sharp detail, believable anatomy, consistent visual identity"
  },
  storage: {
    publicRoot: "/media/exercises",
    localRoot: "public/media/exercises"
  },
  stepLabels: ["start position", "movement initiation", "peak contraction", "finish position"]
};

export const PULSEPEAK_MODELS = {
  male: {
    key: "male",
    label: "Model A (Male)",
    referenceId: "pulsepeak-model-a-v1",
    description: "Athletic build, balanced muscle, neutral expression, short clean hair, realistic training look."
  },
  female: {
    key: "female",
    label: "Model B (Female)",
    referenceId: "pulsepeak-model-b-v1",
    description: "Athletic, toned, strong but realistic, neutral expression, clean fitness look."
  }
};

export const STANDARD_EXERCISE_PROMPT_TEMPLATE =
  "high-quality fitness photo of [MODEL], performing [EXERCISE NAME], [STEP STATE], correct form, mid-movement, natural skin texture, modern gym, clean background, soft lighting, professional fitness photography, sharp detail";

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
  name,
  familyId = "general",
  trainingType = "training",
  fallbackImage = null,
  modelKey = null
}) {
  const selectedModel = PULSEPEAK_MODELS[modelKey] || pickDefaultModel(id, trainingType);
  const assetPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.publicRoot, trainingType, familyId, id);
  const localPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.localRoot, trainingType, familyId, id);

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
      modelKey: selectedModel.key,
      modelLabel: selectedModel.label,
      modelReferenceId: selectedModel.referenceId,
      localPath,
      thumbnailPath: buildMediaAssetPath(assetPath, "thumbnail.webp"),
      stepPaths: PULSEPEAK_MEDIA_SYSTEM.stepLabels.map((_, index) => buildMediaAssetPath(assetPath, `step-${index + 1}.webp`)),
      prompts: buildMovementPromptSet({ model: selectedModel, exerciseName: name })
    }
  };
}

export function buildMovementPromptSet({ model, exerciseName }) {
  return PULSEPEAK_MEDIA_SYSTEM.stepLabels.map((stepState, index) => ({
    step: index + 1,
    label: stepState,
    prompt: STANDARD_EXERCISE_PROMPT_TEMPLATE.replace("[MODEL]", model.label)
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

function pickDefaultModel(id, trainingType) {
  const value = String(id || trainingType || "").toLowerCase();
  if (["glute", "stretch", "mobility", "rotation", "slide", "flow"].some((token) => value.includes(token))) {
    return PULSEPEAK_MODELS.female;
  }
  return PULSEPEAK_MODELS.male;
}
