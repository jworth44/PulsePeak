import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
const outputPath = path.join(artifactsDir, "exercise-library-audit.json");
const modalPath = path.join(projectRoot, "src", "components", "MovementDetailModal.jsx");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pulsepeak-exercise-library-"));
const dbPath = path.join(tempRoot, "qa-db.json");
const port = await findAvailablePort(43220, 80);
const baseUrl = `http://127.0.0.1:${port}`;
const serverEntryUrl = pathToFileURL(path.join(projectRoot, "server", "server.js")).href;
const serverBootstrapPath = path.join(tempRoot, "exercise-library-server-bootstrap.mjs");
const serverLogPath = path.join(artifactsDir, "exercise-library-server.log");

process.env.PULSEPEAK_DB_PATH = dbPath;
const { createUser, readDb, writeDb } = await import("../server/data/store.js");

fs.mkdirSync(artifactsDir, { recursive: true });
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
  /^guide details unavailable\.?$/i
];

const report = {
  audit: "exercise-library-detail-endpoint-and-modal",
  passed: false,
  totalExercises: 0,
  exactVisualGuides: 0,
  textOnlyGuides: 0,
  detailEndpointChecked: 0,
  browserVerified: [],
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

function requireStepSequence(entry) {
  const steps = Array.isArray(entry?.stepSequence) ? entry.stepSequence : [];
  if (steps.length !== 4) {
    fail(entry?.name || "(unknown)", "stepSequence", "Expected exactly 4 sequence steps.");
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

async function waitForHealth() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await delay(500);
  }
  throw new Error("Server did not become healthy in time.");
}

async function api(pathname, { method = "GET", token, body, expectedStatus = 200 } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });

  if (response.status !== expectedStatus) {
    const text = await response.text();
    throw new Error(`${method} ${pathname} expected ${expectedStatus} but received ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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
  requireText(entry, "name");
  requireText(entry, "category");
  requireArray(entry, "equipment", 1);
  requireArray(entry, "primaryMuscles", 1);
  requireArray(entry, "commonMistakes", 2);
  requireArray(entry, "safetyNotes", 1);
  requireArray(entry, "modifications", 1);
  requireText(entry, "description");
  requireText(entry, "setup");
  requireText(entry, "execution");
  requireText(entry, "trainingUse");
  requireText(entry, "breathing");
  requireText(entry, "tempo");
  requireStepSequence(entry);

  if (!["full", "none"].includes(entry.mediaStatus)) {
    fail(entry.name, "mediaStatus", `Unexpected media status "${entry.mediaStatus}".`);
  }
}

async function runApiAudit(token) {
  const catalog = await api("/api/exercise-library", { token });
  const entries = Array.isArray(catalog?.entries) ? catalog.entries : [];
  report.totalExercises = entries.length;
  report.exactVisualGuides = entries.filter((entry) => entry.mediaStatus === "full").length;
  report.textOnlyGuides = entries.filter((entry) => entry.mediaStatus !== "full").length;

  for (const summaryEntry of entries) {
    const detail = await api(`/api/exercise-library/${summaryEntry.detailId || summaryEntry.id}`, { token });
    report.detailEndpointChecked += 1;
    verifyDetailRecord(detail);

    if (detail.name === "Goblet squat") {
      verifySpecificExercise(detail, ["Quadriceps", "Glutes", "Adductors"]);
    }
    if (detail.name === "Incline dumbbell press") {
      verifySpecificExercise(detail, ["Upper chest", "Anterior deltoids", "Triceps"]);
    }
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

    await openGuideAndAssert(page, "Goblet squat", [
      "Quadriceps",
      "Glutes",
      "Adductors",
      "The goblet squat is a squat variation where one dumbbell or kettlebell is held at chest height.",
      "Hold one dumbbell vertically or one kettlebell close to your chest.",
      "Brace your core, bend at the knees and hips, and sit down between your legs.",
      "Hold the weight close to your chest, set your feet, brace your core, and keep your torso tall.",
      "Lower by bending knees and hips together, allowing the knees to track over the toes while the hips sit down between the legs.",
      "Reach the bottom position you can control while keeping heels grounded, chest lifted, and the weight close.",
      "Drive through the mid-foot, extend hips and knees together, and finish standing tall without over-arching your back."
    ]);
    report.browserVerified.push("Goblet squat");

    await openGuideAndAssert(page, "Incline dumbbell press", [
      "Upper chest",
      "Anterior deltoids",
      "Triceps",
      "The incline dumbbell press is a chest press performed on an incline bench.",
      "Set the bench to a low-to-moderate incline.",
      "Press the dumbbells upward and slightly inward without letting them crash together.",
      "Lie on the incline bench with shoulder blades set, dumbbells near the upper chest, wrists stacked, and feet planted.",
      "Press the dumbbells upward with elbows tracking slightly below shoulder height.",
      "Reach the top with arms extended but not aggressively locked, keeping the dumbbells controlled and close to balanced.",
      "Lower the dumbbells back toward the upper chest line with control and repeat without losing shoulder position."
    ]);
    report.browserVerified.push("Incline dumbbell press");

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

async function openGuideAndAssert(page, exerciseName, expectedTexts) {
  const card = page.locator(".exercise-library-card").filter({ hasText: exerciseName }).first();
  await card.waitFor({ timeout: 15000 });
  await card.getByRole("button", { name: /open exercise guide/i }).click();

  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 15000 });
  await dialog.getByText(exerciseName, { exact: false }).first().waitFor({ timeout: 15000 });

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

const server = startServer();
server.stdout.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));
server.stderr.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));

try {
  seedCompleteUser("exercise_library_qa@pulsepeak.local");
  await waitForHealth();
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "exercise_library_qa@pulsepeak.local",
      password: "Passw0rd!"
    })
  });

  await runApiAudit(login.token);
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
