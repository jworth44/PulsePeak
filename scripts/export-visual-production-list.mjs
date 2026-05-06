import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getMovementMedia } from "../shared/exerciseCatalog.js";
import {
  getDeclaredExerciseModelMedia,
  getReviewedMediaAsset
} from "../shared/mediaReviewCatalog.js";
import {
  getVisualCategoryAuditSnapshot,
  VISUAL_CATEGORY_MAP
} from "../shared/visualCategoryMap.js";
import { getMovementLibrary } from "../server/data/movementLibrary.js";
import { buildMobilityModule } from "../server/data/stretchLibrary.js";
import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_MOBILITY_CONTEXT = {
  goalType: "general_fitness",
  injuryStatus: "none",
  restrictedAreas: [],
  lowRecovery: false,
  trainingEnvironment: "hybrid"
};

const REQUIRED_FILES = ["thumbnail.png", "step-1.png", "step-2.png", "step-3.png", "step-4.png"];
const REQUIRED_FILES_CELL = REQUIRED_FILES.join("; ");
const CATEGORY_PRIORITY = ["strength", "cardio", "mobility", "stretch", "yoga", "rehab"];
const PATTERN_PRIORITY = [
  "Horizontal push",
  "Vertical push",
  "Vertical pull",
  "Horizontal pull",
  "Squat",
  "Hinge",
  "Single-leg",
  "Hip extension",
  "Conditioning",
  "Core control",
  "Mobility flow"
];

async function main() {
  const exportRows = await buildExportRows();
  const artifactsDir = path.join(projectRoot, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });

  const csvPath = path.join(artifactsDir, "pulsepeak-visual-production-list.csv");
  const jsonPath = path.join(artifactsDir, "pulsepeak-visual-production-list.json");
  const summaryPath = path.join(artifactsDir, "pulsepeak-visual-production-summary.md");

  await fs.writeFile(csvPath, buildCsv(exportRows));
  await fs.writeFile(jsonPath, JSON.stringify(exportRows, null, 2));
  await fs.writeFile(summaryPath, await buildSummary(exportRows));

  console.log(
    JSON.stringify(
      {
        created: [
          toProjectRelative(csvPath),
          toProjectRelative(jsonPath),
          toProjectRelative(summaryPath)
        ],
        counts: summarizeCounts(exportRows)
      },
      null,
      2
    )
  );
}

async function buildExportRows() {
  const recordsByKey = collectMovementRecordsByKey();
  const rows = [];
  let index = 1;

  for (const [canonicalId, visualCategoryEntry] of Object.entries(VISUAL_CATEGORY_MAP)) {
    const group = buildAggregateForKey(canonicalId, recordsByKey.get(canonicalId) || []);
    const detailId = group.detailId || canonicalId;
    const displayName = group.displayName || visualCategoryEntry.displayName || canonicalId;
    const visualCategory = visualCategoryEntry?.visualCategory || "strength";
    const genericRoots = Array.from(group.genericRoots);
    const genericStatuses = await Promise.all(genericRoots.map((root) => inspectRequiredSet(root)));
    const modelStatuses = {
      male: await inspectModelSet(detailId, "male"),
      female: await inspectModelSet(detailId, "female")
    };
    const reviewFiles = await listReviewArtifacts(detailId, group.id, displayName);

    const currentVisualStatus = determineCurrentVisualStatus({
      group,
      genericStatuses,
      reviewFiles
    });

    rows.push({
      index: index++,
      id: group.id || canonicalId,
      detailId,
      displayName,
      visualCategory,
      equipment: joinList(group.equipment),
      primaryMuscles: joinList(group.primaryMuscles),
      secondaryMuscles: joinList(group.secondaryMuscles),
      movementPattern: group.movementPattern || "",
      difficulty: group.difficulty || "",
      currentVisualStatus,
      maleVisualStatus: modelStatuses.male.status,
      femaleVisualStatus: modelStatuses.female.status,
      requiredFilesMale: REQUIRED_FILES_CELL,
      requiredFilesFemale: REQUIRED_FILES_CELL,
      notes: buildNotes({
        group,
        visualCategoryEntry,
        genericStatuses,
        modelStatuses,
        reviewFiles
      })
    });
  }

  return rows.sort((left, right) => left.index - right.index);
}

function collectMovementRecordsByKey() {
  const recordsByKey = new Map();
  const exerciseEntries = getExerciseLibraryCatalog().entries.map((entry) => normalizeSourceEntry(entry, "exercise-library"));
  const movementEntries = getMovementLibrary().map((entry) => normalizeSourceEntry(entry, "movement-library"));
  const mobilityEntries = buildMobilityModule(DEFAULT_MOBILITY_CONTEXT).library.map((entry) =>
    normalizeSourceEntry(entry, "mobility-library")
  );

  for (const record of [...exerciseEntries, ...movementEntries, ...mobilityEntries]) {
    const bucket = recordsByKey.get(record.rawKey) || [];
    bucket.push(record);
    recordsByKey.set(record.rawKey, bucket);
  }

  return recordsByKey;
}

function normalizeSourceEntry(entry, source) {
  const displayName = String(entry?.name || entry?.title || "").trim();
  const detailId = String(entry?.detailId || entry?.exerciseDetailId || "").trim();
  const movementId = String(entry?.movementId || entry?.id || "").trim();
  const id = String(entry?.id || movementId || detailId || displayName).trim();
  const rawKey = normalizeLookupValue(detailId || id || displayName);
  const equipment = normalizeStringList(entry?.equipment || entry?.equipmentRequirements);
  const primaryMuscles = normalizeStringList(
    entry?.primaryMuscles || entry?.primaryMuscleGroup || entry?.bodyAreaFocus || entry?.bodyFocus
  );
  const secondaryMuscles = normalizeStringList(
    entry?.secondaryMuscles || entry?.secondaryMuscleGroups || entry?.bodyAreas
  );
  const movementPattern = choosePreferredValue(
    String(entry?.movementPattern || "").trim(),
    normalizeStringList(entry?.movementPatterns)[0]
  );
  const difficulty = String(entry?.difficulty || entry?.difficultyLevel || "").trim();
  const media = entry?.media || null;
  const thumbnail = String(entry?.thumbnail || media?.thumbnail || entry?.image || "").trim();
  const image = String(entry?.image || thumbnail || "").trim();
  const genericRoot = resolveGenericMediaRoot({ media, thumbnail, image });

  return {
    source,
    rawKey,
    id,
    detailId,
    movementId,
    displayName,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    movementPattern,
    difficulty,
    media,
    thumbnail,
    image,
    genericRoot
  };
}

function createEmptyAggregate(canonicalId) {
  return {
    canonicalId,
    id: "",
    detailId: "",
    displayName: "",
    movementPattern: "",
    difficulty: "",
    equipment: new Set(),
    primaryMuscles: new Set(),
    secondaryMuscles: new Set(),
    sources: new Set(),
    aliases: new Set(),
    genericRoots: new Set(),
    defaultHasPhasedSequence: false,
    bestRepresentative: null
  };
}

function buildAggregateForKey(canonicalId, records) {
  const current = createEmptyAggregate(canonicalId);

  for (const record of records) {
    current.id = choosePreferredValue(current.id, record.id);
    current.detailId = choosePreferredValue(current.detailId, record.detailId);
    current.displayName = choosePreferredValue(current.displayName, record.displayName);
    current.movementPattern = choosePreferredValue(current.movementPattern, record.movementPattern);
    current.difficulty = choosePreferredValue(current.difficulty, record.difficulty);
    current.sources.add(record.source);
    current.aliases.add(record.id);
    current.aliases.add(record.detailId);
    current.aliases.add(record.movementId);
    current.aliases.add(record.displayName);
    mergeIntoSet(current.equipment, record.equipment);
    mergeIntoSet(current.primaryMuscles, record.primaryMuscles);
    mergeIntoSet(current.secondaryMuscles, record.secondaryMuscles);

    if (record.genericRoot) {
      current.genericRoots.add(record.genericRoot);
    }

    const mediaView = getMovementMedia(
      {
        id: record.id,
        detailId: record.detailId,
        name: record.displayName,
        title: record.displayName,
        media: record.media,
        image: record.image,
        thumbnail: record.thumbnail
      },
      { visualModelPreference: "default" }
    );

    if (mediaView.hasPhasedSequence || current.defaultHasPhasedSequence) {
      current.defaultHasPhasedSequence = true;
    }

    if (!current.bestRepresentative || scoreRepresentative(record, mediaView) > current.bestRepresentative.score) {
      current.bestRepresentative = {
        score: scoreRepresentative(record, mediaView),
        record
      };
    }
  }

  if (current.bestRepresentative?.record) {
    const record = current.bestRepresentative.record;
    current.id = choosePreferredValue(current.id, record.id);
    current.detailId = choosePreferredValue(current.detailId, record.detailId);
    current.displayName = choosePreferredValue(current.displayName, record.displayName);
    current.movementPattern = choosePreferredValue(current.movementPattern, record.movementPattern);
    current.difficulty = choosePreferredValue(current.difficulty, record.difficulty);
  }

  return current;
}

function scoreRepresentative(record, mediaView) {
  let score = 0;
  if (record.source === "exercise-library") {
    score += 20;
  } else if (record.source === "movement-library") {
    score += 10;
  }
  if (mediaView.hasPhasedSequence) {
    score += 8;
  } else if (mediaView.hasThumbnail) {
    score += 4;
  }
  score += record.primaryMuscles.length + record.secondaryMuscles.length + record.equipment.length;
  return score;
}

async function inspectModelSet(detailId, model) {
  const declared = getDeclaredExerciseModelMedia(detailId, model);
  const modelRoot = path.join(projectRoot, "public", "media", "exercises", detailId, model);
  const requiredStatus = await inspectRequiredSet(modelRoot);
  const reviewArtifacts = await listReviewArtifacts(detailId, `${detailId}-${model}`, model);

  if (declared?.approved) {
    return { status: "approved_visual", details: requiredStatus };
  }
  if (requiredStatus.complete) {
    return { status: "complete_not_approved", details: requiredStatus };
  }
  if (reviewArtifacts.length) {
    return { status: "needs_review", details: requiredStatus };
  }
  if (requiredStatus.hasAnyFiles) {
    return { status: "partial_media", details: requiredStatus };
  }
  return { status: "missing_media", details: requiredStatus };
}

async function inspectRequiredSet(rootPath) {
  if (!rootPath) {
    return createEmptySetStatus(rootPath);
  }

  try {
    const dirEntries = await fs.readdir(rootPath, { withFileTypes: true });
    const fileNames = dirEntries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
    const presentFiles = REQUIRED_FILES.filter((file) => fileNames.includes(file));
    const missingFiles = REQUIRED_FILES.filter((file) => !fileNames.includes(file));

    return {
      rootPath,
      exists: true,
      hasAnyFiles: fileNames.length > 0,
      complete: missingFiles.length === 0,
      partial: presentFiles.length > 0 && missingFiles.length > 0,
      presentFiles,
      missingFiles,
      extraFiles: fileNames.filter((file) => !REQUIRED_FILES.includes(file))
    };
  } catch {
    return createEmptySetStatus(rootPath);
  }
}

function createEmptySetStatus(rootPath) {
  return {
    rootPath,
    exists: false,
    hasAnyFiles: false,
    complete: false,
    partial: false,
    presentFiles: [],
    missingFiles: [...REQUIRED_FILES],
    extraFiles: []
  };
}

function determineCurrentVisualStatus({ group, genericStatuses, reviewFiles }) {
  if (group.defaultHasPhasedSequence) {
    return "approved_visual";
  }

  if (reviewFiles.length) {
    return "needs_review";
  }

  if (genericStatuses.some((status) => status.complete)) {
    return "complete_not_approved";
  }

  if (genericStatuses.some((status) => status.partial || status.hasAnyFiles)) {
    return "partial_media";
  }

  const hasAnyMediaReference = group.genericRoots.size > 0 || Boolean(getReviewedMediaAsset(group.id));
  return hasAnyMediaReference ? "missing_media" : "text_only";
}

function buildNotes({ group, visualCategoryEntry, genericStatuses, modelStatuses, reviewFiles }) {
  const notes = [];

  if (visualCategoryEntry) {
    notes.push(
      `category confidence: ${visualCategoryEntry.confidence} (${visualCategoryEntry.reason})`
    );
  }
  if (group.sources.size) {
    notes.push(`sources: ${Array.from(group.sources).sort().join(", ")}`);
  }
  if (reviewFiles.length) {
    notes.push(`review artifacts: ${reviewFiles.map((filePath) => path.basename(filePath)).join(", ")}`);
  }

  const partialGeneric = genericStatuses.find((status) => status.partial);
  if (partialGeneric) {
    notes.push(
      `generic partial media at ${toProjectRelative(partialGeneric.rootPath)} missing ${partialGeneric.missingFiles.join(", ")}`
    );
  }

  for (const [model, modelStatus] of Object.entries(modelStatuses)) {
    if (modelStatus.status === "partial_media") {
      notes.push(
        `${model} partial media missing ${modelStatus.details.missingFiles.join(", ")}`
      );
    } else if (modelStatus.status === "complete_not_approved") {
      notes.push(`${model} full set exists but is not approved`);
    } else if (modelStatus.status === "approved_visual") {
      notes.push(`${model} approved controlled model set`);
    }
  }

  return notes.join(" | ");
}

async function listReviewArtifacts(...keys) {
  const reviewDir = path.join(projectRoot, "temp", "review");
  try {
    const fileNames = await fs.readdir(reviewDir);
    const normalizedKeys = keys.map((key) => normalizeLookupValue(key)).filter(Boolean);
    return fileNames
      .filter((fileName) => normalizedKeys.some((key) => normalizeLookupValue(fileName).includes(key)))
      .map((fileName) => path.join(reviewDir, fileName))
      .sort();
  } catch {
    return [];
  }
}

function resolveGenericMediaRoot({ media, thumbnail, image }) {
  const assetPath = String(media?.assetPath || "").trim();
  if (assetPath) {
    return path.join(projectRoot, "public", assetPath.replaceAll("/", path.sep));
  }

  const candidates = [thumbnail, image, ...(Array.isArray(media?.steps) ? media.steps : []), ...(Array.isArray(media?.images) ? media.images : [])]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const match = candidate.replaceAll("\\", "/").match(/\/media\/exercises\/([^/]+)\//);
    if (match?.[1]) {
      return path.join(projectRoot, "public", "media", "exercises", match[1]);
    }
  }

  return "";
}

function summarizeCounts(rows) {
  const categoryCounts = getVisualCategoryAuditSnapshot().categoryCounts;
  return {
    total: rows.length,
    ...categoryCounts,
    approvedVisuals: rows.filter((row) => row.currentVisualStatus === "approved_visual").length,
    textOnly: rows.filter((row) => row.currentVisualStatus === "text_only").length,
    missingMale: rows.filter((row) => row.maleVisualStatus !== "approved_visual").length,
    missingFemale: rows.filter((row) => row.femaleVisualStatus !== "approved_visual").length
  };
}

async function buildSummary(rows) {
  const counts = summarizeCounts(rows);
  const topPriority = rows
    .filter((row) => row.currentVisualStatus !== "approved_visual")
    .sort((left, right) => comparePriorityRows(left, right))
    .slice(0, 20);

  return [
    "# PulsePeak Visual Production Summary",
    "",
    `- Total movements: ${counts.total}`,
    `- Strength: ${counts.strength}`,
    `- Yoga: ${counts.yoga}`,
    `- Mobility: ${counts.mobility}`,
    `- Stretch: ${counts.stretch}`,
    `- Rehab: ${counts.rehab}`,
    `- Cardio: ${counts.cardio}`,
    `- Approved visual count: ${counts.approvedVisuals}`,
    `- Text-only count: ${counts.textOnly}`,
    `- Missing female sets: ${counts.missingFemale}`,
    `- Missing male sets: ${counts.missingMale}`,
    "",
    "## Top 20 Priority Exercises For Visuals",
    ...topPriority.map(
      (row, index) =>
        `${index + 1}. ${row.displayName} (${row.visualCategory}) - current: ${row.currentVisualStatus}; male: ${row.maleVisualStatus}; female: ${row.femaleVisualStatus}`
    ),
    ""
  ].join("\n");
}

function comparePriorityRows(left, right) {
  const categoryDelta =
    CATEGORY_PRIORITY.indexOf(left.visualCategory) - CATEGORY_PRIORITY.indexOf(right.visualCategory);
  if (categoryDelta !== 0) {
    return categoryDelta;
  }

  const leftPattern = PATTERN_PRIORITY.findIndex((pattern) => left.movementPattern.includes(pattern));
  const rightPattern = PATTERN_PRIORITY.findIndex((pattern) => right.movementPattern.includes(pattern));
  if (leftPattern !== rightPattern) {
    return (leftPattern === -1 ? 999 : leftPattern) - (rightPattern === -1 ? 999 : rightPattern);
  }

  return left.displayName.localeCompare(right.displayName);
}

function buildCsv(rows) {
  const columns = [
    "index",
    "id",
    "detailId",
    "displayName",
    "visualCategory",
    "equipment",
    "primaryMuscles",
    "secondaryMuscles",
    "movementPattern",
    "difficulty",
    "currentVisualStatus",
    "maleVisualStatus",
    "femaleVisualStatus",
    "requiredFilesMale",
    "requiredFilesFemale",
    "notes"
  ];

  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(","))
  ].join("\n");
}

function escapeCsv(value) {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replaceAll("\"", "\"\"")}"` : normalized;
}

function mergeIntoSet(target, values) {
  for (const value of values || []) {
    if (value) {
      target.add(value);
    }
  }
}

function joinList(values) {
  return Array.from(values || []).join("; ");
}

function normalizeStringList(values) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : typeof values === "string"
      ? [values.trim()].filter(Boolean)
      : [];
}

function choosePreferredValue(current, candidate) {
  return String(current || "").trim() || String(candidate || "").trim() || "";
}

function normalizeLookupValue(value) {
  return String(value || "").trim().toLowerCase();
}

function toProjectRelative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll("\\", "/");
}

await main();
