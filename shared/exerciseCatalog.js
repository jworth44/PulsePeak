const MEDIA_STATUS = ["none", "basic", "full"];

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
  const derivedStatus =
    mediaStatus && MEDIA_STATUS.includes(mediaStatus)
      ? mediaStatus
      : videoUrl
        ? "full"
        : safeThumbnail || resolvedImages.length
          ? "basic"
          : "none";

  return {
    status: derivedStatus,
    images: resolvedImages.length ? resolvedImages : fallbackImage ? [fallbackImage] : [],
    steps: resolvedImages.length ? resolvedImages : fallbackImage ? [fallbackImage] : [],
    videoUrl: videoUrl || null,
    thumbnail: safeThumbnail,
    assetPath: assetPath || null,
    generation: generation || null
  };
}

export function getMovementMedia(entry = {}) {
  const media = entry.media?.status
    ? entry.media
    : createMediaPayload({
        images: entry.media?.images || [],
        steps: entry.media?.steps || [],
        videoUrl: entry.media?.videoUrl || null,
        thumbnail: entry.media?.thumbnail || null,
        fallbackImage: entry.image || null,
        mediaStatus: entry.mediaStatus || null,
        assetPath: entry.media?.assetPath || null,
        generation: entry.media?.generation || null
      });
  const sequenceLabels = ["Step 1", "Step 2", "Step 3", "Step 4"];
  const sequence = sequenceLabels.map((label, index) => ({
    label,
    src: media.images?.[index] || media.images?.[media.images.length - 1] || null
  }));

  return {
    media,
    thumbnail: media.thumbnail || null,
    sequence,
    hasVideo: Boolean(media.videoUrl),
    hasThumbnail: Boolean(media.thumbnail),
    mediaStatus: media.status || "none",
    generation: media.generation || null,
    placeholderInitials: buildMovementInitials(entry.name || entry.title || "Move"),
    placeholderLabel: "Movement preview"
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
