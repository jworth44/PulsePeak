import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";
import { getMovementLibrary } from "../server/data/movementLibrary.js";
import { buildMobilityModule } from "../server/data/stretchLibrary.js";
import { normalizeVisualMovementCategory } from "./visualGenerationRules.js";

const ALLOWED_VISUAL_CATEGORIES = ["strength", "yoga", "mobility", "stretch", "rehab", "cardio"];

const DEFAULT_MOBILITY_CONTEXT = {
  goalType: "general_fitness",
  injuryStatus: "none",
  restrictedAreas: [],
  lowRecovery: false,
  trainingEnvironment: "hybrid"
};

const RAW_VISUAL_MOVEMENTS = collectRawVisualMovements();
const { map, aliases, duplicates, missingDisplayNames } = buildVisualCategoryArtifacts(RAW_VISUAL_MOVEMENTS);

export const VISUAL_CATEGORY_MAP = map;
export const VISUAL_CATEGORY_ALIASES = aliases;
export const VISUAL_CATEGORY_DUPLICATE_IDS = duplicates;
export const VISUAL_CATEGORY_MISSING_DISPLAY_NAMES = missingDisplayNames;

export function getVisualCategoryForMovement(id) {
  const normalizedId = normalizeLookupValue(id);
  if (!normalizedId) {
    return null;
  }

  const resolvedKey = VISUAL_CATEGORY_ALIASES[normalizedId] || normalizedId;
  return VISUAL_CATEGORY_MAP[resolvedKey] || null;
}

export function getMovementsByVisualCategory(category) {
  const normalizedCategory = normalizeVisualMovementCategory(category);
  if (!normalizedCategory) {
    return [];
  }

  return Object.values(VISUAL_CATEGORY_MAP)
    .filter((entry) => entry.visualCategory === normalizedCategory)
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export function getUnmappedVisualMovements() {
  return Object.values(VISUAL_CATEGORY_MAP).filter((entry) => !normalizeVisualMovementCategory(entry.visualCategory));
}

export function getVisualCategoryAuditSnapshot() {
  const entries = Object.values(VISUAL_CATEGORY_MAP);
  const orderedCategoryCounts = ALLOWED_VISUAL_CATEGORIES.reduce((acc, category) => {
    acc[category] = entries.filter((entry) => entry.visualCategory === category).length;
    return acc;
  }, {});

  return {
    totalLiveMovements: entries.length,
    mappedCount: entries.filter((entry) => normalizeVisualMovementCategory(entry.visualCategory)).length,
    unmappedCount: entries.filter((entry) => !normalizeVisualMovementCategory(entry.visualCategory)).length,
    categoryCounts: orderedCategoryCounts,
    lowMediumConfidenceItems: entries
      .filter((entry) => entry.confidence !== "high")
      .sort((left, right) => left.displayName.localeCompare(right.displayName)),
    duplicateIds: VISUAL_CATEGORY_DUPLICATE_IDS,
    missingDisplayNames: VISUAL_CATEGORY_MISSING_DISPLAY_NAMES
  };
}

function collectRawVisualMovements() {
  const exerciseEntries = getExerciseLibraryCatalog().entries.map((entry) =>
    normalizeSourceEntry(entry, "exercise-library")
  );
  const movementEntries = getMovementLibrary().map((entry) =>
    normalizeSourceEntry(entry, "movement-library")
  );
  const mobilityEntries = buildMobilityModule(DEFAULT_MOBILITY_CONTEXT).library.map((entry) =>
    normalizeSourceEntry(entry, "mobility-library")
  );

  return [...exerciseEntries, ...movementEntries, ...mobilityEntries];
}

function normalizeSourceEntry(entry, source) {
  const name = String(entry?.name || entry?.title || "").trim();
  const detailId = String(entry?.detailId || entry?.exerciseDetailId || "").trim() || null;
  const movementId = String(entry?.movementId || "").trim() || null;
  const id = String(entry?.id || movementId || detailId || name).trim();
  const aliases = Array.from(
    new Set(
      [detailId, id, movementId, entry?.guideTargetId, name]
        .map((value) => normalizeLookupValue(value))
        .filter(Boolean)
    )
  );

  return {
    source,
    key: detailId || id,
    id,
    detailId,
    movementId,
    displayName: name,
    category: String(entry?.category || "").trim(),
    trainingType: String(entry?.trainingType || "").trim(),
    mobilityCategory: String(entry?.mobilityCategory || "").trim().toLowerCase() || null,
    supportTypes: normalizeStringList(entry?.supportTypes),
    injurySupportType: normalizeStringList(entry?.injurySupportType),
    equipment: normalizeStringList(entry?.equipment || entry?.equipmentRequirements),
    movementPattern: String(entry?.movementPattern || "").trim(),
    phase: String(entry?.phase || "").trim().toLowerCase() || null,
    aliases
  };
}

function buildVisualCategoryArtifacts(records) {
  const mapEntries = new Map();
  const aliasMap = {};
  const duplicateBuckets = new Map();
  const missingDisplayNames = [];

  for (const record of records) {
    if (!record.displayName) {
      missingDisplayNames.push({
        id: record.key,
        source: record.source
      });
      continue;
    }

    const classification = classifyVisualCategory(record);
    const key = normalizeLookupValue(record.key);
    const mappedEntry = {
      id: key,
      displayName: record.displayName,
      visualCategory: classification.visualCategory,
      confidence: classification.confidence,
      reason: classification.reason
    };

    if (!mapEntries.has(key)) {
      mapEntries.set(key, mappedEntry);
    } else {
      const existing = mapEntries.get(key);
      if (scoreConfidence(mappedEntry.confidence) > scoreConfidence(existing.confidence)) {
        mapEntries.set(key, mappedEntry);
      }
      duplicateBuckets.set(key, [...(duplicateBuckets.get(key) || []), record.source]);
    }

    for (const alias of record.aliases) {
      if (!aliasMap[alias]) {
        aliasMap[alias] = key;
      }
    }
  }

  const duplicateIds = Array.from(duplicateBuckets.entries())
    .map(([id, sources]) => ({
      id,
      sources: Array.from(new Set(sources)).sort()
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    map: Object.fromEntries(Array.from(mapEntries.entries()).sort(([left], [right]) => left.localeCompare(right))),
    aliases: aliasMap,
    duplicates: duplicateIds,
    missingDisplayNames
  };
}

function classifyVisualCategory(record) {
  const normalizedName = record.displayName.toLowerCase();
  const category = record.category.toLowerCase();
  const trainingType = record.trainingType.toLowerCase();
  const movementPattern = record.movementPattern.toLowerCase();
  const supportTypes = record.supportTypes;
  const injurySupportType = record.injurySupportType;
  const mobilityCategory = record.mobilityCategory;

  if (mobilityCategory === "physiotherapy" || supportTypes.includes("physiotherapy")) {
    return {
      visualCategory: "rehab",
      confidence: "high",
      reason: "Explicit physiotherapy / rehab metadata marks this as a corrective or clinical movement."
    };
  }

  if (mobilityCategory === "yoga") {
    return {
      visualCategory: "yoga",
      confidence: supportTypes.includes("injury_specific") || supportTypes.includes("stretching") ? "medium" : "high",
      reason: "Yoga category metadata places this in the yoga visual style family."
    };
  }

  if (mobilityCategory === "stretching") {
    if (isDynamicMobilityDrill(normalizedName, movementPattern, record.phase)) {
      return {
        visualCategory: "mobility",
        confidence: "medium",
        reason: "The library calls this stretching, but the drill reads as dynamic movement prep rather than a static hold."
      };
    }

    return {
      visualCategory: "stretch",
      confidence: "high",
      reason: "Stretching metadata and relaxed hold presentation make this a stretch visual."
    };
  }

  if (mobilityCategory === "recovery") {
    if (isStretchLike(normalizedName)) {
      return {
        visualCategory: "stretch",
        confidence: "medium",
        reason: "Recovery-tagged entry is primarily a stretch based on the exercise name and relaxed target position."
      };
    }

    if (isRehabLike(normalizedName, supportTypes, injurySupportType)) {
      return {
        visualCategory: "rehab",
        confidence: "medium",
        reason: "Recovery metadata plus corrective or pain-support cues make this closest to rehab."
      };
    }

    return {
      visualCategory: "mobility",
      confidence: "medium",
      reason: "Recovery metadata suggests movement quality work, but the drill is not explicitly yoga, stretch, or rehab."
    };
  }

  if (trainingType === "mobility" || category === "mobility") {
    if (isRehabLike(normalizedName, supportTypes, injurySupportType)) {
      return {
        visualCategory: "rehab",
        confidence: "medium",
        reason: "Mobility entry leans corrective because of injury-support or rehab-style drill cues."
      };
    }

    if (isStretchLike(normalizedName)) {
      return {
        visualCategory: "stretch",
        confidence: "medium",
        reason: "Mobility entry is named like a stretch and should use the stretch visual style."
      };
    }

    return {
      visualCategory: "mobility",
      confidence: "high",
      reason: "Mobility training metadata and movement-prep style point to mobility visuals."
    };
  }

  if (isCardioLike(normalizedName, category, movementPattern)) {
    return {
      visualCategory: "cardio",
      confidence: "high",
      reason: "Conditioning, cardio equipment, or locomotion cues mark this as a cardio visual."
    };
  }

  if (isRehabLike(normalizedName, supportTypes, injurySupportType)) {
    return {
      visualCategory: "rehab",
      confidence: "low",
      reason: "This is not explicitly in a rehab library, but corrective or pain-reduction cues suggest rehab visuals."
    };
  }

  return {
    visualCategory: "strength",
    confidence: "high",
    reason: "Resistance-training or standard exercise-library context makes this a strength visual."
  };
}

function isCardioLike(name, category, movementPattern) {
  const cardioTokens = [
    "sprint",
    "jump",
    "jack",
    "rope",
    "battle rope",
    "assault bike",
    "bike",
    "treadmill",
    "rower",
    "burpee",
    "high knees",
    "skater",
    "mountain climber",
    "sled push",
    "conditioning"
  ];

  return (
    category.includes("conditioning") ||
    movementPattern.includes("conditioning") ||
    cardioTokens.some((token) => name.includes(token))
  );
}

function isStretchLike(name) {
  return [
    "stretch",
    "pose",
    "opener",
    "twist reset",
    "figure-four",
    "release"
  ].some((token) => name.includes(token));
}

function isDynamicMobilityDrill(name, movementPattern, phase) {
  return [
    "flow",
    "rock",
    "rotation",
    "reach",
    "circle",
    "control",
    "rock-back",
    "airplane",
    "spiderman",
    "mobility"
  ].some((token) => name.includes(token)) || movementPattern.includes("mobility") || phase === "warmup" || phase === "mobility";
}

function isRehabLike(name, supportTypes, injurySupportType) {
  if (supportTypes.includes("physiotherapy")) {
    return true;
  }

  const rehabTokens = [
    "breathing",
    "glide",
    "external rotation",
    "chin tuck",
    "terminal knee extension",
    "supported",
    "hold",
    "tibialis",
    "wrist",
    "finger extension",
    "scapular",
    "step-down"
  ];

  return injurySupportType.length > 0 && rehabTokens.some((token) => name.includes(token));
}

function normalizeStringList(values) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
    : [];
}

function normalizeLookupValue(value) {
  return String(value || "").trim().toLowerCase();
}

function scoreConfidence(confidence) {
  if (confidence === "high") {
    return 3;
  }
  if (confidence === "medium") {
    return 2;
  }
  if (confidence === "low") {
    return 1;
  }
  return 0;
}
