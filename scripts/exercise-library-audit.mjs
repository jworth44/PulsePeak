import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { listDeclaredExerciseModelMedia } from "../shared/mediaReviewCatalog.js";
import { getGuideStatusLabel, getMovementMedia, resolveExerciseMedia } from "../shared/exerciseCatalog.js";
import { buildMobilityModule } from "../server/data/stretchLibrary.js";
import { getExerciseLibraryCatalog } from "../server/data/workoutLibrary.js";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
const outputPath = path.join(artifactsDir, "exercise-library-audit.json");
const modalPath = path.join(projectRoot, "src", "components", "MovementDetailModal.jsx");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const runId = crypto.randomUUID().slice(0, 8);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pulsepeak-exercise-library-"));
const dbPath = path.join(tempRoot, "qa-db.json");
const port = await findAvailablePort(43000 + crypto.randomInt(0, 15000), 400);
const baseUrl = `http://127.0.0.1:${port}`;
const serverEntryUrl = pathToFileURL(path.join(projectRoot, "server", "server.js")).href;
const serverBootstrapPath = path.join(tempRoot, "exercise-library-server-bootstrap.mjs");
const serverLogPath = path.join(artifactsDir, `exercise-library-server-${runId}.log`);

process.env.PULSEPEAK_DB_PATH = dbPath;
const { createUser, readDb, writeDb } = await import("../server/data/store.js");

fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(serverLogPath, "");
fs.writeFileSync(
  serverBootstrapPath,
  `process.env.PORT = ${JSON.stringify(String(port))};\nprocess.env.PULSEPEAK_DB_PATH = ${JSON.stringify(dbPath)};\nawait import(${JSON.stringify(serverEntryUrl)});\n`
);

const GENERIC_PATTERNS = [
  /general/i,
  /target muscles listed in the guide/i,
  /set your position and brace before the rep starts/i,
  /move into the working range without rushing/i,
  /own the strongest part of the rep with control/i,
  /return cleanly and reset for the next rep/i,
  /maintain control throughout/i,
  /^description not available\.?$/i,
  /^guide details unavailable\.?$/i
];

const report = {
  audit: "exercise-library-detail-endpoint-and-modal",
  passed: false,
  totalExercises: 0,
  exactVisualGuides: 0,
  textOnlyGuides: 0,
  brokenVisualGuides: 0,
  detailEndpointChecked: 0,
  browserVerified: [],
  coverage: {
    EXACT_FULL_VISUAL: [],
    TEXT_GUIDE_READY: [],
    BROKEN_VISUAL: []
  },
  failures: []
};

function fail(name, field, reason) {
  report.failures.push({ name, field, reason });
}

function requireText(entry, field) {
  const value = String(entry?.[field] || "").trim();
  if (!value) {
    fail(entry?.name || "(unknown)", field, "Text is empty.");
    return "";
  }
  if (GENERIC_PATTERNS.some((pattern) => pattern.test(value))) {
    fail(entry?.name || "(unknown)", field, "Text contains generic or fallback copy.");
  }
  return value;
}

function requireArray(entry, field, minimum = 1) {
  const value = Array.isArray(entry?.[field]) ? entry[field].filter(Boolean) : [];
  if (value.length < minimum) {
    fail(entry?.name || "(unknown)", field, `Expected at least ${minimum} item(s).`);
  }
  if (value.some((item) => GENERIC_PATTERNS.some((pattern) => pattern.test(String(item))))) {
    fail(entry?.name || "(unknown)", field, "Array contains generic or fallback copy.");
  }
  return value;
}

function requireGuideModifications(entry, minimum = 1) {
  const nested = entry?.modifications && typeof entry.modifications === "object" && !Array.isArray(entry.modifications)
    ? entry.modifications
    : null;
  const adjustments = Array.isArray(nested?.adjustments)
    ? nested.adjustments.filter(Boolean)
    : Array.isArray(entry?.modifications)
      ? entry.modifications.filter(Boolean)
      : [];
  const easierOptions = Array.isArray(nested?.easierOptions)
    ? nested.easierOptions.filter(Boolean)
    : Array.isArray(entry?.regressions)
      ? entry.regressions.filter(Boolean)
      : [];
  const progressions = Array.isArray(nested?.progressions)
    ? nested.progressions.filter(Boolean)
    : Array.isArray(entry?.progressions)
      ? entry.progressions.filter(Boolean)
      : [];

  if (adjustments.length < minimum) {
    fail(entry?.name || "(unknown)", "modifications", `Expected at least ${minimum} item(s).`);
  }

  [
    ["modifications.adjustments", adjustments],
    ["modifications.easierOptions", easierOptions],
    ["modifications.progressions", progressions]
  ].forEach(([field, group]) => {
    if (group.some((item) => GENERIC_PATTERNS.some((pattern) => pattern.test(String(item))))) {
      fail(entry?.name || "(unknown)", field, "Array contains generic or fallback copy.");
    }
  });

  return { adjustments, easierOptions, progressions };
}

function requireStepSequence(entry) {
  const steps = Array.isArray(entry?.stepByStep)
    ? entry.stepByStep
    : Array.isArray(entry?.stepSequence)
      ? entry.stepSequence
      : [];
  const expectedTitles = ["Start", "Mid", "Peak", "Finish"];
  if (steps.length !== 4) {
    fail(entry?.name || "(unknown)", "stepSequence", "Expected exactly 4 sequence steps.");
    return steps;
  }
  steps.forEach((step, index) => {
    const title = String(step?.title || "").trim();
    const description = String(step?.description || "").trim();
    if (!title) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].title`, "Missing step title.");
    } else if (title !== expectedTitles[index]) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].title`, `Expected ${expectedTitles[index]} but found ${title}.`);
    }
    if (!description) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].description`, "Missing step description.");
    } else if (GENERIC_PATTERNS.some((pattern) => pattern.test(description))) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].description`, "Step description still uses generic or fallback copy.");
    }
  });
  return steps;
}

function requireStepSequenceRange(entry, minimum = 1, maximum = 3) {
  const steps = Array.isArray(entry?.stepByStep)
    ? entry.stepByStep
    : Array.isArray(entry?.stepSequence)
      ? entry.stepSequence
      : [];
  if (steps.length < minimum || steps.length > maximum) {
    fail(entry?.name || "(unknown)", "stepSequence", `Expected ${minimum}-${maximum} sequence steps but found ${steps.length}.`);
    return steps;
  }
  steps.forEach((step, index) => {
    const title = String(step?.title || "").trim();
    const description = String(step?.description || "").trim();
    if (!title) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].title`, "Missing step title.");
    }
    if (!description) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].description`, "Missing step description.");
    } else if (GENERIC_PATTERNS.some((pattern) => pattern.test(description))) {
      fail(entry?.name || "(unknown)", `stepSequence[${index}].description`, "Step description still uses generic or fallback copy.");
    }
  });
  return steps;
}

function canListenOnPort(portNumber) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => tester.close(() => resolve(true)));
    tester.listen(portNumber);
  });
}

async function findAvailablePort(startPort, attempts = 20) {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = startPort + offset;
    if (await canListenOnPort(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Unable to find an open port starting at ${startPort}.`);
}

function startServer() {
  return spawn("node", [serverBootstrapPath], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      PULSEPEAK_DB_PATH: dbPath
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function waitForHealth({ attempts = 60, delayMs = 500, throwOnTimeout = true } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return true;
      }
    } catch {
      // retry
    }
    await delay(delayMs);
  }
  if (throwOnTimeout) {
    throw new Error("Server did not become healthy in time.");
  }
  return false;
}

function isTransientNetworkError(error) {
  const code = error?.cause?.code || error?.code;
  return ["ECONNRESET", "ECONNREFUSED", "EPIPE", "UND_ERR_SOCKET", "UND_ERR_CONNECT_TIMEOUT"].includes(code);
}

async function api(
  pathname,
  {
    method = "GET",
    token,
    body,
    expectedStatus = 200,
    retries = 2,
    onUnauthorized
  } = {}
) {
  let attempt = 0;
  let authToken = token;

  while (attempt <= retries) {
    try {
      const response = await fetch(`${baseUrl}${pathname}`, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body
      });

      if (response.status === 401 && typeof onUnauthorized === "function" && attempt < retries) {
        authToken = await onUnauthorized();
        attempt += 1;
        continue;
      }

      if (response.status !== expectedStatus) {
        const text = await response.text();
        throw new Error(`${method} ${pathname} expected ${expectedStatus} but received ${response.status}: ${text}`);
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      if (!isTransientNetworkError(error) || attempt >= retries) {
        throw error;
      }

      attempt += 1;
      await waitForHealth({ attempts: 12, delayMs: 250, throwOnTimeout: false });
      await delay(200 * attempt);
    }
  }

  throw new Error(`API request failed after retries: ${method} ${pathname}`);
}

function seedCompleteUser(email, name = "Exercise Library QA") {
  let user;
  try {
    user = createUser({ name, email, password: "Passw0rd!" });
  } catch (error) {
    const db = readDb();
    user = db.users.find((entry) => entry.email === email.toLowerCase());
    if (!user) {
      throw error;
    }
  }

  const db = readDb();
  const target = db.users.find((entry) => entry.email === email.toLowerCase());
  target.data.profile = {
    ...target.data.profile,
    goalType: "general_fitness",
    nutritionMode: "basic",
    unitPreference: "imperial",
    ageGroup: "30-39",
    birthdate: "1992-06-15",
    experienceLevel: "intermediate",
    trainingEnvironment: "hybrid",
    equipmentProfile: "bench_dumbbells",
    equipmentSelections: ["bench", "dumbbell"],
    injuryStatus: "none",
    restrictedAreas: [],
    sex: "male",
    heightCm: 178,
    currentWeight: 185,
    targetWeight: 180,
    appMode: "full_system",
    exerciseGuidanceLevel: "standard",
    showWarmup: true,
    showCooldown: true,
    onboardingCompleted: true,
    hiddenModules: [],
    moduleOrder: ["dashboard", "workouts", "plan", "exercise_library", "mobility", "nutrition", "progress"]
  };
  writeDb(db);
}

function collectNormalUsageErrors(page, bucket) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      bucket.consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    bucket.pageErrors.push(error.message);
  });
}

function verifySpecificExercise(entry, expectedMuscles) {
  const muscles = requireArray(entry, "primaryMuscles", 1);
  expectedMuscles.forEach((muscle) => {
    if (!muscles.includes(muscle)) {
      fail(entry.name, "primaryMuscles", `Expected muscle "${muscle}" was missing.`);
    }
  });
}

function verifyDetailRecord(entry) {
  requireText(entry, "detailId");
  requireText(entry, "name");
  requireText(entry, "category");
  requireArray(entry, "equipment", 1);
  requireArray(entry, "primaryMuscles", 1);
  requireArray(entry, "commonMistakes", 2);
  requireArray(entry, "safetyNotes", 1);
  requireGuideModifications(entry, 1);
  requireText(entry, "whatThisExerciseIs") || requireText(entry, "description");
  requireText(entry, "setup");
  requireText(entry, "howToPerform") || requireText(entry, "execution");
  requireText(entry, "trainingUse");
  requireText(entry, "breathing");
  requireText(entry, "tempo");
  requireStepSequence(entry);

  const allowedStatuses = ["full", "none", "basic"];
  if (!allowedStatuses.includes(entry.mediaStatus)) {
    fail(entry.name, "mediaStatus", `Unexpected media status "${entry.mediaStatus}".`);
  }
}

function verifyMobilityGuideRecord(entry) {
  requireText(entry, "detailId");
  requireText(entry, "name");
  requireText(entry, "whatThisExerciseIs");
  requireText(entry, "trainingUse");
  requireArray(entry, "primaryMuscles", 1);
  requireArray(entry, "secondaryMuscles", 1);
  requireText(entry, "setup");
  requireText(entry, "howToPerform");
  requireText(entry, "breathing");
  requireText(entry, "tempo");
  requireArray(entry, "commonMistakes", 2);
  requireArray(entry, "safetyNotes", 1);
  requireGuideModifications(entry, 1);
  requireStepSequence(entry);
}

function verifyStretchGuideRecord(entry) {
  requireText(entry, "detailId");
  requireText(entry, "name");
  requireText(entry, "whatThisExerciseIs");
  requireText(entry, "trainingUse");
  requireArray(entry, "primaryMuscles", 1);
  requireArray(entry, "secondaryMuscles", 1);
  requireText(entry, "setup");
  requireText(entry, "howToPerform");
  requireText(entry, "breathing");
  requireText(entry, "tempo");
  requireArray(entry, "commonMistakes", 2);
  requireArray(entry, "safetyNotes", 1);
  requireGuideModifications(entry, 1);
  requireStepSequenceRange(entry, 1, 3);
}

function verifyRehabGuideRecord(entry) {
  requireText(entry, "detailId");
  requireText(entry, "name");
  requireText(entry, "whatThisExerciseIs");
  requireText(entry, "trainingUse");
  requireArray(entry, "primaryMuscles", 1);
  requireArray(entry, "secondaryMuscles", 1);
  requireText(entry, "setup");
  requireText(entry, "howToPerform");
  requireText(entry, "breathing");
  requireText(entry, "tempo");
  requireArray(entry, "commonMistakes", 2);
  requireArray(entry, "safetyNotes", 1);
  requireGuideModifications(entry, 1);
  requireStepSequence(entry);
}

function verifyCardioGuideRecord(entry) {
  verifyDetailRecord(entry);
  if (String(entry.category || "") !== "Conditioning") {
    fail(entry?.name || "(unknown)", "category", `Expected Conditioning but found "${entry.category}".`);
  }
}

function runCardioLibraryAudit() {
  const catalog = getExerciseLibraryCatalog();
  const cardioEntries = Array.isArray(catalog?.entries)
    ? catalog.entries.filter((entry) => entry.category === "Conditioning")
    : [];
  const generalMobilityModule = buildMobilityModule({
    goalType: "general_fitness",
    injuryStatus: "none",
    restrictedAreas: [],
    lowRecovery: false,
    trainingEnvironment: "hybrid"
  });
  const rehabMobilityModule = buildMobilityModule({
    goalType: "injury_recovery",
    injuryStatus: "minor",
    restrictedAreas: ["shoulder"],
    lowRecovery: false,
    trainingEnvironment: "hybrid"
  });
  const generalLibrary = Array.isArray(generalMobilityModule?.library) ? generalMobilityModule.library : [];
  const rehabLibrary = Array.isArray(rehabMobilityModule?.library) ? rehabMobilityModule.library : [];
  const excludedEntries = [
    ...generalLibrary.filter((entry) => ["mobility_production", "stretch_production", "yoga_production"].includes(entry.sourceType)),
    ...rehabLibrary.filter((entry) => entry.sourceType === "rehab_production")
  ];

  if (cardioEntries.length !== 30) {
    fail("cardio", "count", `Expected 30 cardio entries but found ${cardioEntries.length}.`);
  }

  const cardioIdMap = new Map();
  const cardioDetailIdMap = new Map();
  const excludedIds = new Set(excludedEntries.map((entry) => entry.id));
  const excludedDetailIds = new Set(excludedEntries.map((entry) => entry.detailId));
  const excludedNames = new Set(excludedEntries.map((entry) => entry.name));

  cardioEntries.forEach((entry) => {
    if (cardioIdMap.has(entry.id)) {
      fail(entry.name, "id", `Duplicate cardio id also used by ${cardioIdMap.get(entry.id)}.`);
    } else {
      cardioIdMap.set(entry.id, entry.name);
    }
    if (cardioDetailIdMap.has(entry.detailId)) {
      fail(entry.name, "detailId", `Duplicate cardio detailId also used by ${cardioDetailIdMap.get(entry.detailId)}.`);
    } else {
      cardioDetailIdMap.set(entry.detailId, entry.name);
    }
    if (excludedIds.has(entry.id) || excludedDetailIds.has(entry.detailId) || excludedNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Cardio entry overlaps with mobility, stretch, rehab, or yoga content.");
    }
    verifyCardioGuideRecord(entry);
  });
}

function runMobilityLibraryAudit() {
  const mobilityModule = buildMobilityModule({
    goalType: "mobility",
    injuryStatus: "none",
    restrictedAreas: [],
    lowRecovery: false,
    trainingEnvironment: "hybrid"
  });
  const library = Array.isArray(mobilityModule?.library) ? mobilityModule.library : [];
  const mobilityEntries = library.filter((entry) => entry.sourceType === "mobility_production" && entry.supportTypes.includes("mobility"));
  const yogaEntries = library.filter((entry) => entry.sourceType === "yoga_production" && entry.supportTypes.includes("yoga"));

  if (mobilityEntries.length !== 30) {
    fail("mobility", "count", `Expected 30 non-yoga mobility entries but found ${mobilityEntries.length}.`);
  }
  if (yogaEntries.length !== 50) {
    fail("yoga", "count", `Expected 50 yoga entries but found ${yogaEntries.length}.`);
  }

  const mobilityIdMap = new Map();
  const mobilityDetailIdMap = new Map();
  const yogaIdSet = new Set(yogaEntries.map((entry) => entry.id));

  mobilityEntries.forEach((entry) => {
    if (mobilityIdMap.has(entry.id)) {
      fail(entry.name, "id", `Duplicate mobility id also used by ${mobilityIdMap.get(entry.id)}.`);
    } else {
      mobilityIdMap.set(entry.id, entry.name);
    }
    if (mobilityDetailIdMap.has(entry.detailId)) {
      fail(entry.name, "detailId", `Duplicate mobility detailId also used by ${mobilityDetailIdMap.get(entry.detailId)}.`);
    } else {
      mobilityDetailIdMap.set(entry.detailId, entry.name);
    }
    if (entry.supportTypes.includes("yoga")) {
      fail(entry.name, "supportTypes", "Mobility production entry is still tagged as yoga.");
    }
    if (yogaIdSet.has(entry.id)) {
      fail(entry.name, "categorySeparation", "Movement appears in both yoga and mobility production lists.");
    }
    if (String(entry.visualCategory || "").toLowerCase() !== "mobility") {
      fail(entry.name, "visualCategory", `Expected visualCategory mobility but found "${entry.visualCategory}".`);
    }
    if (String(entry.movementType || "").toLowerCase() !== "dynamic mobility") {
      fail(entry.name, "movementType", `Expected dynamic mobility but found "${entry.movementType}".`);
    }
    if (!["none", "light"].includes(String(entry.equipmentProfile || "").toLowerCase())) {
      fail(entry.name, "equipmentProfile", `Unexpected mobility equipment profile "${entry.equipmentProfile}".`);
    }
    verifyMobilityGuideRecord(entry.movement || entry);
  });
}

function runStretchLibraryAudit() {
  const mobilityModule = buildMobilityModule({
    goalType: "general_fitness",
    injuryStatus: "none",
    restrictedAreas: [],
    lowRecovery: false,
    trainingEnvironment: "hybrid"
  });
  const library = Array.isArray(mobilityModule?.library) ? mobilityModule.library : [];
  const stretchEntries = library.filter((entry) => entry.sourceType === "stretch_production" && entry.supportTypes.includes("stretching"));
  const mobilityEntries = library.filter((entry) => entry.sourceType === "mobility_production" && entry.supportTypes.includes("mobility"));
  const yogaEntries = library.filter((entry) => entry.sourceType === "yoga_production" && entry.supportTypes.includes("yoga"));

  if (stretchEntries.length !== 40) {
    fail("stretch", "count", `Expected 40 stretch entries but found ${stretchEntries.length}.`);
  }

  const stretchIdMap = new Map();
  const stretchDetailIdMap = new Map();
  const mobilityIds = new Set(mobilityEntries.map((entry) => entry.id));
  const mobilityDetailIds = new Set(mobilityEntries.map((entry) => entry.detailId));
  const mobilityNames = new Set(mobilityEntries.map((entry) => entry.name));
  const yogaIds = new Set(yogaEntries.map((entry) => entry.id));
  const yogaDetailIds = new Set(yogaEntries.map((entry) => entry.detailId));
  const yogaNames = new Set(yogaEntries.map((entry) => entry.name));

  stretchEntries.forEach((entry) => {
    if (stretchIdMap.has(entry.id)) {
      fail(entry.name, "id", `Duplicate stretch id also used by ${stretchIdMap.get(entry.id)}.`);
    } else {
      stretchIdMap.set(entry.id, entry.name);
    }
    if (stretchDetailIdMap.has(entry.detailId)) {
      fail(entry.name, "detailId", `Duplicate stretch detailId also used by ${stretchDetailIdMap.get(entry.detailId)}.`);
    } else {
      stretchDetailIdMap.set(entry.detailId, entry.name);
    }
    if (mobilityIds.has(entry.id) || mobilityDetailIds.has(entry.detailId) || mobilityNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Stretch entry overlaps with the mobility production library.");
    }
    if (yogaIds.has(entry.id) || yogaDetailIds.has(entry.detailId) || yogaNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Stretch entry overlaps with the yoga production library.");
    }
    if (entry.supportTypes.includes("mobility") || entry.supportTypes.includes("yoga")) {
      fail(entry.name, "supportTypes", "Stretch production entry is still tagged as mobility or yoga.");
    }
    if (String(entry.visualCategory || "").toLowerCase() !== "stretch") {
      fail(entry.name, "visualCategory", `Expected visualCategory stretch but found "${entry.visualCategory}".`);
    }
    if (String(entry.movementType || "").toLowerCase() !== "static stretch") {
      fail(entry.name, "movementType", `Expected static stretch but found "${entry.movementType}".`);
    }
    if (!["none", "light"].includes(String(entry.equipmentProfile || "").toLowerCase())) {
      fail(entry.name, "equipmentProfile", `Unexpected stretch equipment profile "${entry.equipmentProfile}".`);
    }
    verifyStretchGuideRecord(entry.movement || entry);
  });
}

function runRehabLibraryAudit() {
  const mobilityModule = buildMobilityModule({
    goalType: "injury_recovery",
    injuryStatus: "minor",
    restrictedAreas: ["shoulder"],
    lowRecovery: false,
    trainingEnvironment: "hybrid"
  });
  const library = Array.isArray(mobilityModule?.library) ? mobilityModule.library : [];
  const rehabEntries = library.filter((entry) => entry.sourceType === "rehab_production" && entry.supportTypes.includes("physiotherapy"));
  const mobilityEntries = library.filter((entry) => entry.sourceType === "mobility_production" && entry.supportTypes.includes("mobility"));
  const stretchEntries = library.filter((entry) => entry.sourceType === "stretch_production" && entry.supportTypes.includes("stretching"));
  const yogaEntries = library.filter((entry) => entry.sourceType === "yoga_production" && entry.supportTypes.includes("yoga"));

  if (rehabEntries.length !== 55) {
    fail("rehab", "count", `Expected 55 rehab entries but found ${rehabEntries.length}.`);
  }

  const rehabIdMap = new Map();
  const rehabDetailIdMap = new Map();
  const mobilityIds = new Set(mobilityEntries.map((entry) => entry.id));
  const mobilityDetailIds = new Set(mobilityEntries.map((entry) => entry.detailId));
  const mobilityNames = new Set(mobilityEntries.map((entry) => entry.name));
  const stretchIds = new Set(stretchEntries.map((entry) => entry.id));
  const stretchDetailIds = new Set(stretchEntries.map((entry) => entry.detailId));
  const stretchNames = new Set(stretchEntries.map((entry) => entry.name));
  const yogaIds = new Set(yogaEntries.map((entry) => entry.id));
  const yogaDetailIds = new Set(yogaEntries.map((entry) => entry.detailId));
  const yogaNames = new Set(yogaEntries.map((entry) => entry.name));

  rehabEntries.forEach((entry) => {
    if (rehabIdMap.has(entry.id)) {
      fail(entry.name, "id", `Duplicate rehab id also used by ${rehabIdMap.get(entry.id)}.`);
    } else {
      rehabIdMap.set(entry.id, entry.name);
    }
    if (rehabDetailIdMap.has(entry.detailId)) {
      fail(entry.name, "detailId", `Duplicate rehab detailId also used by ${rehabDetailIdMap.get(entry.detailId)}.`);
    } else {
      rehabDetailIdMap.set(entry.detailId, entry.name);
    }
    if (mobilityIds.has(entry.id) || mobilityDetailIds.has(entry.detailId) || mobilityNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Rehab entry overlaps with the mobility production library.");
    }
    if (stretchIds.has(entry.id) || stretchDetailIds.has(entry.detailId) || stretchNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Rehab entry overlaps with the stretch production library.");
    }
    if (yogaIds.has(entry.id) || yogaDetailIds.has(entry.detailId) || yogaNames.has(entry.name)) {
      fail(entry.name, "categorySeparation", "Rehab entry overlaps with the yoga production library.");
    }
    if (entry.supportTypes.includes("mobility") || entry.supportTypes.includes("stretching") || entry.supportTypes.includes("yoga")) {
      fail(entry.name, "supportTypes", "Rehab production entry is still tagged as mobility, stretch, or yoga.");
    }
    if (String(entry.visualCategory || "").toLowerCase() !== "rehab") {
      fail(entry.name, "visualCategory", `Expected visualCategory rehab but found "${entry.visualCategory}".`);
    }
    if (String(entry.movementType || "").toLowerCase() !== "corrective rehab") {
      fail(entry.name, "movementType", `Expected corrective rehab but found "${entry.movementType}".`);
    }
    if (!["none", "light"].includes(String(entry.equipmentProfile || "").toLowerCase())) {
      fail(entry.name, "equipmentProfile", `Unexpected rehab equipment profile "${entry.equipmentProfile}".`);
    }
    verifyRehabGuideRecord(entry.movement || entry);
  });
}

function mediaUrlToLocalPath(urlPath) {
  const normalized = String(urlPath || "").trim();
  if (!normalized.startsWith("/media/")) {
    return null;
  }

  return path.join(projectRoot, "public", normalized.replace(/^\/media\//, "media/").replaceAll("/", path.sep));
}

function runDeclaredModelMediaAudit() {
  for (const declaredSet of listDeclaredExerciseModelMedia()) {
    if (!declaredSet.complete) {
      fail(declaredSet.exerciseDetailId, `${declaredSet.modelKey} model media`, "Declared model media set is incomplete.");
      continue;
    }

    const assetPaths = [declaredSet.thumbnail, ...(declaredSet.steps || [])];
    for (const assetPath of assetPaths) {
      const localPath = mediaUrlToLocalPath(assetPath);
      if (!localPath || !fs.existsSync(localPath)) {
        fail(
          declaredSet.exerciseDetailId,
          `${declaredSet.modelKey} model media`,
          `Declared asset is missing on disk: ${assetPath}`
        );
      }
    }
  }
}

function runResolverSafetyAudit(entry) {
  ["default", "male", "female"].forEach((visualModelPreference) => {
    const resolved = resolveExerciseMedia({
      exerciseDetailId: entry.detailId,
      media: entry.media,
      visualModelPreference
    });

    if (resolved.source === "controlled-model" && resolved.media?.status !== "full") {
      fail(entry.name, `visualModelPreference:${visualModelPreference}`, "Controlled model media resolved without a complete full visual set.");
    }
  });
}

function classifyVisualCoverage(entry) {
  const mediaView = getMovementMedia(entry);
  const statusLabel = getGuideStatusLabel(entry);
  const sequenceSources = mediaView.sequence.map((step) => step.src).filter(Boolean);
  const distinctSources = Array.from(new Set(sequenceSources));
  const missingFiles = distinctSources
    .map((assetPath) => mediaUrlToLocalPath(assetPath))
    .filter((localPath) => !localPath || !fs.existsSync(localPath));

  if (mediaView.visualLevel === "full") {
    if (distinctSources.length !== 4 || missingFiles.length) {
      return "BROKEN_VISUAL";
    }
    if (statusLabel !== "Visual guide" && !/model visual ready/i.test(statusLabel)) {
      return "BROKEN_VISUAL";
    }
    return "EXACT_FULL_VISUAL";
  }

  if (statusLabel === "Visual guide") {
    return "BROKEN_VISUAL";
  }

  return "TEXT_GUIDE_READY";
}

async function runApiAudit(token) {
  let activeToken = token;
  const reauthenticate = async () => {
    const session = await loginQaUser();
    activeToken = session.token;
    return activeToken;
  };

  const catalog = await api("/api/exercise-library", { token: activeToken, onUnauthorized: reauthenticate });
  const entries = Array.isArray(catalog?.entries) ? catalog.entries : [];
  const detailIdMap = new Map();
  const nameMap = new Map();
  report.totalExercises = entries.length;

  for (const summaryEntry of entries) {
    const normalizedDetailId = String(summaryEntry.detailId || "").trim();
    const normalizedName = String(summaryEntry.name || "").trim().toLowerCase();

    if (!normalizedDetailId) {
      fail(summaryEntry.name || "(unknown)", "detailId", "Summary entry is missing detailId.");
      continue;
    }

    if (detailIdMap.has(normalizedDetailId)) {
      fail(summaryEntry.name, "detailId", `Duplicate detailId also used by ${detailIdMap.get(normalizedDetailId)}.`);
    } else {
      detailIdMap.set(normalizedDetailId, summaryEntry.name);
    }

    if (nameMap.has(normalizedName)) {
      fail(summaryEntry.name, "name", `Duplicate exercise name also used by ${nameMap.get(normalizedName)}.`);
    } else {
      nameMap.set(normalizedName, summaryEntry.name);
    }

    const detail = await api(`/api/exercise-library/${summaryEntry.detailId || summaryEntry.id}`, {
      token: activeToken,
      onUnauthorized: reauthenticate
    });
    report.detailEndpointChecked += 1;
    verifyDetailRecord(detail);
    runResolverSafetyAudit(detail);
    const coverageClass = classifyVisualCoverage(detail);
    report.coverage[coverageClass].push(detail.name);

    if (detail.detailId !== normalizedDetailId) {
      fail(summaryEntry.name, "detailId", `Summary/detail mismatch: ${normalizedDetailId} -> ${detail.detailId}`);
    }
    if (String(detail.name || "").trim() !== String(summaryEntry.name || "").trim()) {
      fail(summaryEntry.name, "name", `Summary/detail title mismatch: "${summaryEntry.name}" -> "${detail.name}"`);
    }

    if (detail.name === "Goblet squat") {
      verifySpecificExercise(detail, ["Quadriceps", "Glutes", "Adductors"]);
    }
    if (detail.name === "Incline dumbbell press") {
      verifySpecificExercise(detail, ["Upper chest", "Anterior deltoids", "Triceps"]);
    }
  }

  report.coverage.EXACT_FULL_VISUAL.sort((left, right) => left.localeCompare(right));
  report.coverage.TEXT_GUIDE_READY.sort((left, right) => left.localeCompare(right));
  report.coverage.BROKEN_VISUAL.sort((left, right) => left.localeCompare(right));
  report.exactVisualGuides = report.coverage.EXACT_FULL_VISUAL.length;
  report.textOnlyGuides = report.coverage.TEXT_GUIDE_READY.length;
  report.brokenVisualGuides = report.coverage.BROKEN_VISUAL.length;

  if (report.brokenVisualGuides) {
    report.coverage.BROKEN_VISUAL.forEach((name) => {
      fail(name, "visualCoverage", "Exercise is claiming or attempting a visual guide without a complete exact visual set.");
    });
  }
}

async function runBrowserVerification(token) {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const bucket = { consoleErrors: [], pageErrors: [] };
    collectNormalUsageErrors(page, bucket);

    await page.addInitScript((storedToken) => {
      window.localStorage.setItem("pulsepeak-auth-token", storedToken);
    }, token);

    await page.goto(`${baseUrl}/exercise-library`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /browse every movement used by pulsepeak workouts/i }).waitFor({ timeout: 15000 });

    const conditioningPill = page.locator(".exercise-library-category-pill").filter({ hasText: "Conditioning" }).first();
    await conditioningPill.click();
    const conditioningCards = page.locator(".exercise-library-card");
    if (await conditioningCards.count() !== 30) {
      fail("Conditioning", "visibleCount", `Expected 30 conditioning cards but found ${await conditioningCards.count()}.`);
    }

    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill("treadmill");
    await page.waitForTimeout(150);
    if (await conditioningCards.count() !== 3) {
      fail("Conditioning", "search", `Expected 3 treadmill conditioning results but found ${await conditioningCards.count()}.`);
    }
    await searchInput.fill("");
    await page.locator(".exercise-library-category-pill").filter({ hasText: "All" }).first().click();

    await openGuideAndAssert(page, "Goblet squat", []);
    report.browserVerified.push("Goblet squat");

    await openGuideAndAssert(page, "Incline dumbbell press", []);
    report.browserVerified.push("Incline dumbbell press");

    await openGuideAndAssert(
      page,
      "Hammer curl",
      [],
      { expectTextOnly: true }
    );
    report.browserVerified.push("Hammer curl");

    await openGuideAndAssert(
      page,
      "Barbell bench press",
      [],
      { expectTextOnly: true }
    );
    report.browserVerified.push("Barbell bench press");

    await openGuideAndAssert(
      page,
      "T-bar row",
      [],
      { expectTextOnly: true }
    );
    report.browserVerified.push("T-bar row");

    await openGuideAndAssert(page, "Hip thrust", ["Hip thrust"]);
    report.browserVerified.push("Hip thrust");

    await openGuideAndAssert(page, "Glute bridge", ["Glute bridge"]);
    report.browserVerified.push("Glute bridge");

    await openGuideAndAssert(page, "Plank", ["Plank"]);
    report.browserVerified.push("Plank");

    await openGuideAndAssert(page, "90/90 hip flow", ["90/90 hip flow"], { expectVisualFull: true });
    report.browserVerified.push("90/90 hip flow");

    await openGuideAndAssert(page, "Cat-cow", ["Cat-cow"], { expectVisualFull: true });
    report.browserVerified.push("Cat-cow");

    await openGuideAndAssert(page, "Hip flexor stretch", ["Hip flexor stretch"], { expectVisualFull: true });
    report.browserVerified.push("Hip flexor stretch");

    await openGuideAndAssert(page, "Push-up", ["Push-up"], { expectVisualFull: true });
    report.browserVerified.push("Push-up");

    await openGuideAndAssert(page, "Lat pulldown", ["Lat pulldown"], { expectVisualFull: true });
    report.browserVerified.push("Lat pulldown");

    await openGuideAndAssert(page, "Treadmill walk", [], { expectTextOnly: true });
    report.browserVerified.push("Treadmill walk");

    await page.screenshot({ path: path.join(artifactsDir, "exercise-library-modal-verification.png"), fullPage: true });

    if (bucket.consoleErrors.length) {
      bucket.consoleErrors.forEach((error) => fail("browser", "console", error));
    }
    if (bucket.pageErrors.length) {
      bucket.pageErrors.forEach((error) => fail("browser", "page", error));
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

async function loginQaUser() {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "exercise_library_qa@pulsepeak.local",
      password: "Passw0rd!"
    }),
    retries: 3
  });
}

async function openGuideAndAssert(page, exerciseName, expectedTexts, { expectTextOnly = false, expectVisualFull = false } = {}) {
  const card = page
    .locator(".exercise-library-card")
    .filter({ has: page.getByRole("heading", { name: exerciseName, exact: true }) })
    .first();
  await card.waitFor({ timeout: 15000 });
  if (expectTextOnly) {
    await card.getByText(/text coaching guide/i).first().waitFor({ timeout: 15000 });
  }
  await card.getByRole("button", { name: /open exercise guide/i }).click();

  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 15000 });
  const dialogTitle = dialog.locator(".movement-guide-title").first();
  await dialogTitle.waitFor({ timeout: 15000 });
  const openedTitle = (await dialogTitle.innerText()).trim();
  if (openedTitle !== exerciseName) {
    fail(exerciseName, "modal", `Card title did not match modal title. Opened "${openedTitle}".`);
  }

  for (const requiredSection of ["Overview", "How to Perform", "Key Tips", "Mistakes", "Modifications", "Safety"]) {
    await dialog.getByText(requiredSection, { exact: false }).first().waitFor({ timeout: 15000 });
  }
  for (const requiredDetail of ["What this exercise is", "Setup", "Muscles worked", "Primary muscles"]) {
    await dialog.getByText(requiredDetail, { exact: false }).first().waitFor({ timeout: 15000 });
  }
  for (const stepTitle of ["Start", "Mid", "Peak", "Finish"]) {
    await dialog.getByText(stepTitle, { exact: true }).first().waitFor({ timeout: 15000 });
  }

  for (const text of expectedTexts) {
    await dialog.getByText(text, { exact: false }).first().waitFor({ timeout: 15000 });
  }

  const missingSectionSignals = [
    "Guide details unavailable.",
    "Target muscles listed in the guide",
    "Phase visual pending"
  ];
  for (const badText of missingSectionSignals) {
    if (await dialog.getByText(badText, { exact: false }).count()) {
      fail(exerciseName, "modal", `Unexpected fallback text rendered: ${badText}`);
    }
  }

  if (expectTextOnly) {
    const sequenceImages = await dialog.locator(".movement-sequence-image").count();
    if (sequenceImages > 0) {
      fail(exerciseName, "modal", `Text-only guide rendered ${sequenceImages} sequence image(s).`);
    }
  }

  if (expectVisualFull) {
    const sequenceImages = await dialog.locator(".movement-sequence-image").count();
    if (sequenceImages !== 4) {
      fail(exerciseName, "modal", `Visual guide rendered ${sequenceImages} sequence image(s) instead of 4.`);
    }
    const badgeText = await dialog.locator(".movement-image-badge").first().innerText().catch(() => "");
    if (!/visual guide/i.test(badgeText) && !/movement video/i.test(badgeText)) {
      fail(exerciseName, "modal", `Visual guide badge was incorrect: ${badgeText || "(missing)"}`);
    }
  }

  await dialog.getByRole("button", { name: /close/i }).click();
  await dialog.waitFor({ state: "hidden", timeout: 15000 });
}

const modalSource = fs.readFileSync(modalPath, "utf8");
if (/Phase visual pending/i.test(modalSource)) {
  fail("MovementDetailModal", "source", "Phase visual pending placeholder still exists in modal source.");
}
if (/Target muscles listed in the guide/i.test(modalSource)) {
  fail("MovementDetailModal", "source", "Generic muscle fallback still exists in modal source.");
}
if (/Guide details unavailable\./i.test(modalSource)) {
  fail("MovementDetailModal", "source", "Guide details unavailable placeholder still exists in modal source.");
}

const server = startServer();
server.stdout.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));
server.stderr.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));

try {
  seedCompleteUser("exercise_library_qa@pulsepeak.local");
  await waitForHealth();
  const login = await loginQaUser();

  runCardioLibraryAudit();
  runMobilityLibraryAudit();
  runStretchLibraryAudit();
  runRehabLibraryAudit();
  await runApiAudit(login.token);
  runDeclaredModelMediaAudit();
  await runBrowserVerification(login.token);

  report.passed = report.failures.length === 0;
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  if (!report.passed) {
    console.error(`Exercise library audit failed with ${report.failures.length} issue(s).`);
    report.failures.slice(0, 60).forEach((failure) => {
      console.error(`- ${failure.name} :: ${failure.field} :: ${failure.reason}`);
    });
    process.exit(1);
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  if (server && !server.killed) {
    server.kill();
  }
}
