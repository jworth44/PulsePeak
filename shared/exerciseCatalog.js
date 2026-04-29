import { getDeclaredExerciseModelMedia } from "./mediaReviewCatalog.js";

const MEDIA_STATUS = ["none", "basic", "full"];
const MAX_SEQUENCE_STEPS = 4;
const MIN_SEQUENCE_STEPS = 2;

export function buildMediaAssetPath(...segments) {
  return segments
    .flat()
    .map((segment) => String(segment || "").trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function createMediaPayload({
  images = [],
  steps = [],
  videoUrl = null,
  thumbnail = null,
  fallbackImage = null,
  mediaStatus = null,
  assetPath = null,
  generation = null
} = {}) {
  const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const normalizedSteps = Array.isArray(steps) ? steps.filter(Boolean) : [];
  const resolvedImages = normalizedSteps.length ? normalizedSteps : normalizedImages;
  const safeThumbnail = thumbnail || resolvedImages[0] || fallbackImage || null;
  const normalizedSequence = normalizeMediaSequence(resolvedImages.length ? resolvedImages : safeThumbnail ? [safeThumbnail] : []);
  const derivedStatus =
    mediaStatus && MEDIA_STATUS.includes(mediaStatus)
      ? mediaStatus
      : videoUrl
        ? "full"
        : normalizedSequence.length >= MAX_SEQUENCE_STEPS
          ? "full"
          : safeThumbnail || normalizedSequence.length
            ? "basic"
            : "none";

  return {
    status: derivedStatus,
    images: normalizedSequence,
    steps: normalizedSequence,
    videoUrl: videoUrl || null,
    thumbnail: safeThumbnail,
    assetPath: assetPath || null,
    generation: generation || null
  };
}

function normalizeMediaSequence(images) {
  const filtered = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!filtered.length) {
    return [];
  }
  return filtered.slice(0, MAX_SEQUENCE_STEPS);
}

export function resolveExerciseMedia({ exerciseDetailId, media, visualModelPreference = "default", fallbackImage = null } = {}) {
  const normalizedPreference = String(visualModelPreference || "default")
    .trim()
    .toLowerCase();
  const normalizedDetailId = String(exerciseDetailId || "").trim();

  if ((normalizedPreference === "male" || normalizedPreference === "female") && normalizedDetailId) {
    const declaredModelMedia = getDeclaredExerciseModelMedia(normalizedDetailId, normalizedPreference);
    if (declaredModelMedia?.complete && declaredModelMedia?.approved) {
      return {
        media: createMediaPayload({
          thumbnail: declaredModelMedia.thumbnail,
          steps: declaredModelMedia.steps,
          mediaStatus: "full",
          assetPath: `/media/exercises/${normalizedDetailId}/${normalizedPreference}`,
          generation: {
            modelKey: normalizedPreference,
            reviewSource: declaredModelMedia.reviewSource
          }
        }),
        guideLabel: `${normalizedPreference[0].toUpperCase()}${normalizedPreference.slice(1)} model visual ready`,
        selectedModel: normalizedPreference,
        source: "controlled-model"
      };
    }
  }

  const resolvedMedia = media?.status
    ? media
    : createMediaPayload({
        images: media?.images || [],
        steps: media?.steps || [],
        videoUrl: media?.videoUrl || null,
        thumbnail: media?.thumbnail || null,
        fallbackImage,
        mediaStatus: media?.status || null,
        assetPath: media?.assetPath || null,
        generation: media?.generation || null
      });

  return {
    media: resolvedMedia,
    guideLabel: resolvedMedia.status === "full" ? "Visual guide" : "Text coaching guide",
    selectedModel: null,
    source: "reviewed-or-text"
  };
}

export function getGuideStatusLabel(entry = {}, options = {}) {
  const mediaView = getMovementMedia(entry, options);
  if (mediaView.selectedModel && mediaView.mediaStatus === "full") {
    return `${mediaView.selectedModel[0].toUpperCase()}${mediaView.selectedModel.slice(1)} model visual ready`;
  }
  return mediaView.visualLevel === "full" ? "Visual guide" : "Text coaching guide";
}

export function getMovementMedia(entry = {}, options = {}) {
  const resolvedExerciseMedia = resolveExerciseMedia({
    exerciseDetailId: entry.detailId || entry.exerciseDetailId || entry.id || "",
    media: entry.media,
    visualModelPreference: options.visualModelPreference || entry.visualModelPreference || "default",
    fallbackImage: entry.image || entry.thumbnail || null
  });
  const media = resolvedExerciseMedia.media;
  const sequenceLabels = ["Step 1", "Step 2", "Step 3", "Step 4"];
  const distinctSequence = Array.from(new Set((media.steps?.length ? media.steps : media.images || []).filter(Boolean))).slice(0, MAX_SEQUENCE_STEPS);
  const hasPhasedSequence = distinctSequence.length >= MIN_SEQUENCE_STEPS;
  const sequence = sequenceLabels.map((label, index) => ({
    label,
    src: hasPhasedSequence ? distinctSequence[index] || null : null
  }));
  const effectiveStatus =
    media.status === "full" && !hasPhasedSequence
      ? "basic"
      : media.status || "none";
  const visualLevel = hasPhasedSequence ? "full" : media.thumbnail || media.videoUrl ? "preview" : "none";

  return {
    media,
    thumbnail: media.thumbnail || null,
    sequence,
    hasPhasedSequence,
    hasVideo: Boolean(media.videoUrl),
    hasThumbnail: Boolean(media.thumbnail),
    mediaStatus: effectiveStatus,
    visualLevel,
    generation: media.generation || null,
    guideLabel: resolvedExerciseMedia.guideLabel,
    selectedModel: resolvedExerciseMedia.selectedModel,
    mediaSource: resolvedExerciseMedia.source,
    placeholderInitials: buildMovementInitials(entry.name || entry.title || "Move"),
    placeholderLabel: resolvedExerciseMedia.guideLabel
  };
}

export function resolveMovementVisual(movementOrMedia = {}, options = {}) {
  const mediaView =
    movementOrMedia?.media?.status || movementOrMedia?.mediaStatus || movementOrMedia?.image || movementOrMedia?.thumbnail || movementOrMedia?.name
      ? getMovementMedia(movementOrMedia, options)
      : getMovementMedia({ media: movementOrMedia }, options);
  const basicSource = mediaView.thumbnail || mediaView.media?.images?.[0] || mediaView.media?.steps?.[0] || null;

  return {
    mode: basicSource ? "image" : "fallback",
    src: basicSource,
    alt: movementOrMedia?.imageAlt || `${movementOrMedia?.name || movementOrMedia?.title || "Movement"} preview`,
    status: mediaView.mediaStatus || "none",
    initials: mediaView.placeholderInitials,
    label: mediaView.placeholderLabel,
    guideLabel: mediaView.guideLabel,
    visualLevel: mediaView.visualLevel
  };
}

export function buildGuideTarget(target = {}) {
  if (!target || typeof target !== "object") {
    return null;
  }

  const movement = target.movement && typeof target.movement === "object" ? target.movement : target;
  const detailId = String(target.detailId || movement.detailId || "").trim();
  const guideTargetId = String(target.guideTargetId || movement.guideTargetId || detailId || "").trim();
  const movementId = String(target.movementId || movement.movementId || "").trim();
  const id = String(movement.id || target.id || "").trim();
  const resolvedName = String(movement.name || target.name || target.title || "Exercise guide").trim();

  return {
    ...target,
    ...movement,
    name: resolvedName,
    expectedName: String(target.expectedName || movement.expectedName || resolvedName).trim(),
    detailId,
    guideTargetId,
    movementId,
    id,
    visualLevel: getMovementMedia(movement).visualLevel
  };
}

export function createCatalogFamily({ familyId, defaults = {}, entries = [] }) {
  return entries.map((entry) =>
    createLibraryEntry({
      ...defaults,
      ...entry,
      familyIds: Array.from(new Set([...(defaults.familyIds || []), familyId, ...(entry.familyIds || [])]))
    })
  );
}

export function validateLibraryEntries(entries, label = "catalog") {
  const seenIds = new Set();
  const seenNames = new Set();

  return entries.map((entry) => {
    const normalized = createLibraryEntry(entry);
    const idKey = normalized.id.toLowerCase();
    const nameKey = normalized.name.toLowerCase();

    if (seenIds.has(idKey)) {
      throw new Error(`Duplicate ${label} id detected: ${normalized.id}`);
    }
    if (seenNames.has(nameKey)) {
      throw new Error(`Duplicate ${label} name detected: ${normalized.name}`);
    }

    seenIds.add(idKey);
    seenNames.add(nameKey);
    return normalized;
  });
}

export function createLibraryEntry({
  id,
  name,
  mode,
  trainingType,
  category,
  primaryMuscleGroup,
  secondaryMuscleGroups = [],
  movementPattern,
  equipmentRequirements = [],
  difficultyLevel = "standard",
  trainingGoals = [],
  jointStressLevel = "moderate",
  rehabSafe = false,
  environments = [],
  mobilityCategory = null,
  bodyAreaFocus = [],
  injurySupportType = [],
  intensityProfile = "moderate",
  variationFamily = null,
  familyIds = [],
  relatedIds = [],
  instructions = [],
  mistakes = [],
  cues = [],
  safetyNotes = [],
  modifications = [],
  media = null,
  extra = {}
}) {
  const normalizedId = String(id || "").trim();
  const normalizedName = String(name || "").trim();
  const normalizedTrainingType = String(trainingType || mode || "").trim() || "training";
  const normalizedCategory = String(category || "").trim();
  const normalizedPrimaryMuscle = String(primaryMuscleGroup || "").trim() || "General";
  const normalizedMovementPattern = String(movementPattern || "").trim() || "General";

  if (!normalizedId) {
    throw new Error("Catalog entries require an id.");
  }
  if (!normalizedName) {
    throw new Error(`Catalog entry ${normalizedId} requires a name.`);
  }
  if (!normalizedCategory) {
    throw new Error(`Catalog entry ${normalizedId} requires a category.`);
  }

  const normalizedInstructions = normalizeStringArray(instructions);
  const normalizedMistakes = normalizeStringArray(mistakes);
  const normalizedCues = normalizeStringArray(cues);
  const normalizedSafetyNotes = normalizeStringArray(safetyNotes);
  const normalizedModifications = normalizeStringArray(modifications);

  return {
    id: normalizedId,
    title: normalizedName,
    name: normalizedName,
    mode: normalizedTrainingType,
    trainingType: normalizedTrainingType,
    contentType: normalizedTrainingType,
    category: normalizedCategory,
    subcategory: variationFamily ? String(variationFamily).trim() : normalizedCategory,
    primaryMuscleGroup: normalizedPrimaryMuscle,
    secondaryMuscleGroups: normalizeStringArray(secondaryMuscleGroups),
    movementPattern: normalizedMovementPattern,
    equipmentRequirements: normalizeStringArray(equipmentRequirements),
    difficultyLevel: String(difficultyLevel || "standard").trim() || "standard",
    trainingGoals: normalizeStringArray(trainingGoals),
    jointStressLevel: String(jointStressLevel || "moderate").trim() || "moderate",
    rehabSafe: Boolean(rehabSafe),
    mobilityCategory: mobilityCategory ? String(mobilityCategory).trim() : null,
    bodyAreaFocus: normalizeStringArray(bodyAreaFocus),
    injurySupportType: normalizeStringArray(injurySupportType),
    intensityProfile: String(intensityProfile || "moderate").trim() || "moderate",
    recoveryProfile: String(intensityProfile || "moderate").trim() || "moderate",
    variationFamily: variationFamily ? String(variationFamily).trim() : null,
    familyIds: normalizeStringArray(familyIds),
    relatedIds: normalizeStringArray(relatedIds),
    relatedContentIds: normalizeStringArray(relatedIds),
    environments: normalizeStringArray(environments),
    instructions: normalizedInstructions,
    mistakes: normalizedMistakes,
    cues: normalizedCues,
    safetyNotes: normalizedSafetyNotes,
    modifications: normalizedModifications,
    media: media?.status ? media : createMediaPayload(media || {}),
    mediaStatus: media?.status || createMediaPayload(media || {}).status,
    tags: {
      trainingType: normalizedTrainingType,
      primaryMuscleGroup: normalizedPrimaryMuscle,
      secondaryMuscleGroups: normalizeStringArray(secondaryMuscleGroups),
      movementPattern: normalizedMovementPattern,
      equipmentRequirements: normalizeStringArray(equipmentRequirements),
      difficultyLevel: String(difficultyLevel || "standard").trim() || "standard",
      trainingGoals: normalizeStringArray(trainingGoals),
      jointStressLevel: String(jointStressLevel || "moderate").trim() || "moderate",
      rehabSafe: Boolean(rehabSafe),
      mobilityCategory: mobilityCategory ? String(mobilityCategory).trim() : null,
      bodyAreaFocus: normalizeStringArray(bodyAreaFocus),
      injurySupportType: normalizeStringArray(injurySupportType),
      intensityProfile: String(intensityProfile || "moderate").trim() || "moderate",
      variationFamily: variationFamily ? String(variationFamily).trim() : null,
      familyIds: normalizeStringArray(familyIds)
    },
    difficulty: String(difficultyLevel || "standard").trim() || "standard",
    goals: normalizeStringArray(trainingGoals),
    jointStress: String(jointStressLevel || "moderate").trim() || "moderate",
    equipment: normalizeStringArray(equipmentRequirements),
    bodyFocus: normalizeStringArray([normalizedPrimaryMuscle, ...normalizeStringArray(secondaryMuscleGroups)]),
    movementPatterns: normalizeStringArray([normalizedMovementPattern]),
    guidance: {
      instructions: normalizedInstructions,
      mistakes: normalizedMistakes,
      cues: normalizedCues,
      safetyNotes: normalizedSafetyNotes,
      modifications: normalizedModifications
    },
    ...extra
  };
}

function normalizeStringArray(values) {
  return Array.isArray(values)
    ? Array.from(
        new Set(
          values
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      )
    : [];
}

function buildMovementInitials(value) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.length ? parts.map((part) => part[0]?.toUpperCase() || "").join("") : "MV";
}
