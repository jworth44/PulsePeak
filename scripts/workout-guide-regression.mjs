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
const outputPath = path.join(artifactsDir, "workout-guide-regression.json");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pulsepeak-workout-guide-regression-"));
const dbPath = path.join(tempRoot, "qa-db.json");
const port = await findAvailablePort(43480, 80);
const baseUrl = `http://127.0.0.1:${port}`;
const serverEntryUrl = pathToFileURL(path.join(projectRoot, "server", "server.js")).href;
const serverBootstrapPath = path.join(tempRoot, "workout-guide-regression-server-bootstrap.mjs");
const serverLogPath = path.join(artifactsDir, "workout-guide-regression-server.log");

process.env.PULSEPEAK_DB_PATH = dbPath;
const { createUser, readDb, writeDb } = await import("../server/data/store.js");

fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(
  serverBootstrapPath,
  `process.env.PORT = ${JSON.stringify(String(port))};\nprocess.env.PULSEPEAK_DB_PATH = ${JSON.stringify(dbPath)};\nawait import(${JSON.stringify(serverEntryUrl)});\n`
);

const report = {
  audit: "workout-session-guide-regression",
  passed: false,
  clickedExercise: null,
  openedGuideTitle: null,
  guideMode: null,
  failures: [],
  consoleErrors: [],
  nonFatalConsoleEvents: [],
  pageErrors: []
};

function fail(message) {
  report.failures.push(message);
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

async function api(pathname, { method = "GET", body, token, expectedStatus = 200 } = {}) {
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

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function seedPremiumUser(email) {
  try {
    createUser({ name: "Workout Guide Regression", email, password: "Passw0rd!" });
  } catch {
    // Existing user is fine in a reused temp DB.
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.email === email.toLowerCase());
  user.tier = "premium";
  user.planTier = "premium";
  user.subscriptionStatus = "active";
  user.subscriptionPlanInterval = "yearly";
  user.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  user.data.profile = {
    ...user.data.profile,
    goalType: "general_fitness",
    nutritionMode: "basic",
    unitPreference: "imperial",
    ageGroup: "30-39",
    birthdate: "1992-06-15",
    experienceLevel: "intermediate",
    trainingEnvironment: "hybrid",
    equipmentProfile: "hybrid",
    equipmentSelections: ["bench", "dumbbell", "barbell", "band"],
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
    moduleOrder: ["dashboard", "workouts", "plan", "exercise_library", "mobility", "nutrition", "progress"],
    visualModelPreference: "default"
  };
  writeDb(db);
}

const server = startServer();
server.stdout.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));
server.stderr.on("data", (chunk) => fs.appendFileSync(serverLogPath, chunk));

let browser;

try {
  seedPremiumUser("workout_guide_regression@pulsepeak.local");
  await waitForHealth();

  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "workout_guide_regression@pulsepeak.local",
      password: "Passw0rd!"
    })
  });

  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (/Failed to load resource: the server responded with a status of 404/i.test(text) || /favicon\.ico/i.test(text)) {
        report.nonFatalConsoleEvents.push(text);
      } else {
        report.consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (error) => {
    report.pageErrors.push(error.message);
  });

  await page.addInitScript((storedToken) => {
    window.localStorage.setItem("pulsepeak-auth-token", storedToken);
  }, login.token);

  await page.goto(`${baseUrl}/workouts`, { waitUntil: "networkidle" });
  await page.getByText(/choose your setup, pick your focus/i).first().waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: /review workout/i }).first().click();
  const workoutDialog = page.getByRole("dialog").first();
  await workoutDialog.waitFor({ timeout: 15000 });
  await workoutDialog.getByText(/workout session/i).first().waitFor({ timeout: 15000 });

  const exerciseCard = workoutDialog.locator(".exercise-detail-card").first();
  await exerciseCard.waitFor({ timeout: 15000 });

  const clickedExercise = (await exerciseCard.locator(".exercise-step-copy strong").first().innerText()).trim();
  report.clickedExercise = clickedExercise.replace(/^\d+\.\s*/, "");

  await exerciseCard.click();

  const guideDialog = page.getByRole("dialog").last();
  await guideDialog.waitFor({ timeout: 15000 });
  const guideTitleLocator = guideDialog.locator(".movement-guide-title").first();
  await guideTitleLocator.waitFor({ timeout: 15000 });
  const guideTitle = (await guideTitleLocator.innerText()).trim();
  report.openedGuideTitle = guideTitle;

  if (!guideTitle) {
    fail("MovementDetailModal opened without a title.");
  }
  if (report.clickedExercise !== guideTitle) {
    fail(`Guide title mismatch: clicked "${report.clickedExercise}" but opened "${guideTitle}".`);
  }

  const guideText = await guideDialog.innerText();
  if (!guideText.trim()) {
    fail("MovementDetailModal rendered a blank screen.");
  }
  if (/Phase visual pending|Target muscles listed in the guide|Guide details unavailable\./i.test(guideText)) {
    fail("MovementDetailModal rendered banned fallback placeholder text.");
  }

  const hasTextGuide = /text coaching guide/i.test(guideText);
  const hasVisualGuide = /exact visual guide|visual sequence with coaching cues/i.test(guideText);
  if (hasVisualGuide) {
    report.guideMode = "full visual guide";
  } else if (hasTextGuide) {
    report.guideMode = "text coaching guide fallback";
  } else {
    fail("MovementDetailModal did not show a recognized visual or text coaching guide state.");
  }

  for (const stepTitle of ["Start", "Mid", "Peak", "Finish"]) {
    if (!new RegExp(`\\b${stepTitle}\\b`, "i").test(guideText)) {
      fail(`MovementDetailModal did not render the ${stepTitle} step.`);
    }
  }

  if (report.consoleErrors.length) {
    fail(`Console reported ${report.consoleErrors.length} error(s) during the regression path.`);
  }
  if (report.pageErrors.length) {
    fail(`Page reported ${report.pageErrors.length} fatal error(s) during the regression path.`);
  }

  report.passed = report.failures.length === 0;
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  if (!report.passed) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(report, null, 2));
  await context.close();
} finally {
  if (browser) {
    await browser.close();
  }
  if (server && !server.killed) {
    server.kill();
  }
}
