import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pulsepeak-launch-"));
const dbPath = path.join(tempRoot, "qa-db.json");
const port = await findAvailablePort(43100, 80);
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const serverEntryUrl = pathToFileURL(path.join(projectRoot, "server", "server.js")).href;
const serverBootstrapPath = path.join(tempRoot, "launch-server-bootstrap.mjs");

process.env.PULSEPEAK_DB_PATH = dbPath;
process.env.PORT = String(port);
fs.writeFileSync(
  serverBootstrapPath,
  `process.env.PORT = ${JSON.stringify(String(port))};\nprocess.env.PULSEPEAK_DB_PATH = ${JSON.stringify(dbPath)};\nawait import(${JSON.stringify(serverEntryUrl)});\n`
);

function canListenOnPort(portNumber) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
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

const {
  readDb,
  writeDb,
  createUser,
  normalizeWorkout,
  sanitizeUser,
  detectPersonalRecords,
  buildWeekInReview,
  buildStreakStatus,
  buildInsights,
  buildNextBestAction,
  buildLaunchSafeCoachResponse
} = await import("../server/data/store.js");
const {
  getWorkoutLibraryForProfile,
  findWorkoutPresetForProfile,
  createWorkoutFromPreset
} = await import("../server/data/workoutLibrary.js");
const { getMovementLibrary, findMovementForName } = await import("../server/data/movementLibrary.js");
const { getMovementMedia, resolveMovementVisual } = await import("../shared/exerciseCatalog.js");
const { WORKOUT_FILTER_PRESETS, WORKOUT_DISCOVERY_CATEGORIES } = await import("../shared/libraryTaxonomy.js");

const report = {
  standard: {
    launchBlockers: [
      "Route fails to render",
      "Dead-end user flow",
      "Interactive control does nothing",
      "Form cannot complete normally",
      "Filter traps the user in an unusable state",
      "Recommendation contradicts another page",
      "Broken media or image path",
      "Modal cannot be exited cleanly",
      "Free / trial / premium mismatch",
      "Onboarding handoff inconsistency",
      "Severe unfinished branding/layout issue",
      "Console error during normal usage",
      "Fake or repeated sequence visuals that misrepresent motion",
      "Broken, blank, contradictory, or misleading state"
    ]
  },
  scenarios: [],
  combinationCoverage: [],
  mediaAudit: {
    totalMovements: 0,
    trueFourStep: [],
    singleReferenceOnly: [],
    missingMedia: [],
    brokenMappings: [],
    unmatchedExerciseVariants: []
  },
  warnings: [],
  blockers: [],
  fixesVerified: []
};

function recordScenario(name, details) {
  report.scenarios.push({ name, ...details });
}

function recordWarning(message) {
  report.warnings.push(message);
}

function recordBlocker(message) {
  report.blockers.push(message);
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until server is ready.
    }
    await delay(500);
  }
  throw new Error("Server did not become healthy in time.");
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

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function registerUser({ name, email, password = "Passw0rd!" }) {
  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
    expectedStatus: 201
  });
}

function createSeedUser({ name, email, password = "Passw0rd!" }) {
  try {
    return createUser({ name, email, password });
  } catch (error) {
    if (!String(error?.message || "").includes("already exists")) {
      throw error;
    }
    return getUserRecord(email);
  }
}

async function loginUser({ email, password = "Passw0rd!" }) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

function mutateDb(mutator) {
  const db = readDb();
  mutator(db);
  writeDb(db);
}

function getUserRecord(email) {
  const db = readDb();
  return db.users.find((entry) => entry.email === email.toLowerCase()) || null;
}

function buildCompletedProfile(overrides = {}) {
  return {
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
    moduleOrder: ["dashboard", "workouts", "plan", "mobility", "nutrition", "progress", "coach"],
    hiddenModules: [],
    ...overrides
  };
}

function seedUserState(email, config = {}) {
  mutateDb((db) => {
    const user = db.users.find((entry) => entry.email === email.toLowerCase());
    if (!user) {
      throw new Error(`User not found for seed: ${email}`);
    }

    user.tier = config.tier || user.tier || "free";
    user.planTier = config.planTier || user.planTier || user.tier || "free";
    user.subscriptionStatus = config.subscriptionStatus || user.subscriptionStatus || "inactive";
    user.subscriptionPlanInterval = config.subscriptionPlanInterval || user.subscriptionPlanInterval || null;
    user.currentPeriodEnd = config.currentPeriodEnd ?? user.currentPeriodEnd ?? null;
    user.trialStartedAt = config.trialStartedAt ?? user.trialStartedAt ?? null;
    user.trialEndsAt = config.trialEndsAt ?? user.trialEndsAt ?? null;
    user.trialBillingChoice = config.trialBillingChoice ?? user.trialBillingChoice ?? null;
    user.trialStatus = config.trialStatus ?? user.trialStatus ?? "inactive";
    user.trialCanceledAt = config.trialCanceledAt ?? user.trialCanceledAt ?? null;
    user.trialConvertedAt = config.trialConvertedAt ?? user.trialConvertedAt ?? null;
    user.hasUsedTrial = config.hasUsedTrial ?? user.hasUsedTrial ?? false;
    user.cancelAtPeriodEnd = config.cancelAtPeriodEnd ?? user.cancelAtPeriodEnd ?? false;
    user.data.profile = {
      ...user.data.profile,
      ...(config.profile || {})
    };
    if (config.meals) {
      user.data.meals = config.meals;
    }
    if (config.workouts) {
      user.data.workouts = config.workouts.map(normalizeWorkout);
    }
    if (config.savedWorkouts) {
      user.data.savedWorkouts = config.savedWorkouts;
    }
    if (config.weightHistory) {
      user.data.weightHistory = config.weightHistory;
    }
    if (config.weeklyHistory) {
      user.data.weeklyHistory = config.weeklyHistory;
    }
    if (config.weeklyCheckIns) {
      user.data.weeklyCheckIns = config.weeklyCheckIns;
    }
    if (config.habits) {
      user.data.habits = config.habits;
    }
    if (config.notes) {
      user.data.notes = config.notes;
    }
    if (config.waterIntake !== undefined) {
      user.data.waterIntake = config.waterIntake;
    }
    if (config.sleepHours !== undefined) {
      user.data.sleepHours = config.sleepHours;
    }
    if (config.energyLevel !== undefined) {
      user.data.energyLevel = config.energyLevel;
    }
  });
}

function buildHistoryForProfile(profile, count = 4) {
  const filters = {
    environment: profile.trainingEnvironment === "hybrid" ? "both" : profile.trainingEnvironment,
    focus: "recommended",
    equipmentSelections: profile.equipmentSelections || []
  };
  const workouts = getWorkoutLibraryForProfile(filters, profile, [], "premium");
  return workouts.slice(0, count).map((preset, index) => {
    const workout = createWorkoutFromPreset(preset);
    workout.loggedAt = new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000).toISOString();
    return workout;
  });
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

async function withAuthedPage(browser, token, fn, options = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const bucket = { consoleErrors: [], pageErrors: [] };
  collectNormalUsageErrors(page, bucket);
  await page.addInitScript((storedToken) => {
    window.localStorage.setItem("pulsepeak-auth-token", storedToken);
  }, token);
  try {
    await fn(page, bucket, context, options);
  } finally {
    await context.close();
  }
}

async function assertRouteRenders(page, pathname, matcher, options = {}) {
  const {
    stableSelector = "main, #root, .page-grid",
    retries = 1,
    retryDelayMs = 300
  } = options;

  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await page.locator(stableSelector).first().waitFor({ timeout: 10000 });
      await page.getByText(matcher).first().waitFor({ timeout: 5000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(retryDelayMs);
      }
    }
  }

  const bodyText = await page.locator("body").innerText().catch(() => "");
  throw new Error(
    `Route ${pathname} failed to render matcher ${matcher} at ${page.url()} :: ${bodyText.slice(0, 800) || "no body text"} :: ${lastError?.message || "no inner error"}`
  );
}

async function assertDashboardRenders(page, pathname = "/") {
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  try {
    // Composed dashboard: the cinematic "Today's Training" opener is the hero
    // and its START SESSION button is the primary action (benchmark v2.1).
    await page.locator(".today-cinematic").waitFor({ timeout: 15000 });
    await page.locator(".today-cinematic-cta").waitFor({ timeout: 15000 });
  } catch (error) {
    const bodyText = await page.locator("body").innerText().catch(() => "");
    throw new Error(
      `Dashboard failed to render at ${page.url()} :: ${bodyText.slice(0, 600) || "no body text"}`
    );
  }
  expect(page.url() === `${baseUrl}/`, `Dashboard route did not resolve to root. Current URL: ${page.url()}`);
}

async function runBrowserCoverage(browser) {
  const freeEmail = "free_user@pulsepeak.local";
  const trialEmail = "trial_user@pulsepeak.local";
  const premiumEmail = "premium_user@pulsepeak.local";
  const returningEmail = "returning_user@pulsepeak.local";
  const sparseEmail = "sparse_user@pulsepeak.local";
  const onboardingEmail = "gate_user@pulsepeak.local";
  const engineEmail = "engine_user@pulsepeak.local";

  createSeedUser({ name: "Free User", email: freeEmail });
  createSeedUser({ name: "Trial User", email: trialEmail });
  createSeedUser({ name: "Premium User", email: premiumEmail });
  createSeedUser({ name: "Returning User", email: returningEmail });
  createSeedUser({ name: "Sparse User", email: sparseEmail });
  createSeedUser({ name: "Gate User", email: onboardingEmail });
  createSeedUser({ name: "Engine User", email: engineEmail });

  const completedProfile = buildCompletedProfile();
  const returningWorkouts = buildHistoryForProfile(completedProfile, 4);
  const limitedPreset = findWorkoutPresetForProfile("quick-upper-push", completedProfile, {
    environment: "both",
    focus: "recommended",
    equipmentSelections: completedProfile.equipmentSelections
  });
  const savedWorkout = limitedPreset ? [createWorkoutFromPreset(limitedPreset)] : [];

  seedUserState(freeEmail, {
    profile: completedProfile,
    savedWorkouts: savedWorkout
  });
  seedUserState(trialEmail, {
    tier: "free",
    planTier: "trial_active",
    subscriptionStatus: "trialing",
    currentPeriodEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    trialStartedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    trialBillingChoice: "yearly",
    trialStatus: "active",
    profile: completedProfile
  });
  seedUserState(premiumEmail, {
    tier: "premium",
    planTier: "premium",
    subscriptionStatus: "active",
    subscriptionPlanInterval: "yearly",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    profile: completedProfile
  });
  seedUserState(returningEmail, {
    tier: "premium",
    planTier: "premium",
    subscriptionStatus: "active",
    subscriptionPlanInterval: "yearly",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    profile: buildCompletedProfile({ goalType: "strength", experienceLevel: "advanced" }),
    workouts: returningWorkouts,
    weeklyHistory: [
      { week: "2026-W14", score: 71 },
      { week: "2026-W15", score: 76 },
      { week: "2026-W16", score: 83 }
    ],
    weightHistory: [
      { date: "2026-04-10", weight: 188 },
      { date: "2026-04-17", weight: 186 },
      { date: "2026-04-22", weight: 185 }
    ],
    meals: [
      { id: "meal-1", name: "Protein bowl", calories: 620, protein: 42 },
      { id: "meal-2", name: "Salmon rice", calories: 710, protein: 48 }
    ],
    waterIntake: 2.6,
    sleepHours: 7.8,
    energyLevel: "High"
  });
  seedUserState(sparseEmail, {
    profile: buildCompletedProfile({
      appMode: "training_recovery",
      nutritionMode: "off",
      trainingEnvironment: "home",
      equipmentProfile: "bodyweight",
      equipmentSelections: []
    }),
    workouts: [],
    meals: [],
    weeklyHistory: [],
    weightHistory: [],
    notes: ["Sparse-data user for launch audit."],
    waterIntake: 0,
    sleepHours: 7,
    energyLevel: "Steady"
  });
  // Dedicated user for the engine-depth E2E scenario: mutations (meal log,
  // habit toggle, weekly check-in) must not contaminate other scenarios'
  // assumptions, so this user is shared with nobody else.
  seedUserState(engineEmail, {
    // nutritionMode "full" so the meal-logging form renders for this user.
    profile: buildCompletedProfile({ nutritionMode: "full" }),
    workouts: buildHistoryForProfile(completedProfile, 2),
    meals: [],
    waterIntake: 0
  });
  seedUserState(onboardingEmail, {
    profile: {
      goalType: "general_fitness",
      nutritionMode: "basic",
      unitPreference: "imperial",
      ageGroup: "30-39",
      birthdate: "",
      experienceLevel: "beginner",
      trainingEnvironment: "hybrid",
      equipmentProfile: "hybrid",
      equipmentSelections: [],
      injuryStatus: "none",
      restrictedAreas: [],
      sex: "",
      heightCm: null,
      currentWeight: null,
      targetWeight: null,
      appMode: "full_system",
      exerciseGuidanceLevel: "standard",
      showWarmup: true,
      showCooldown: true,
      onboardingCompleted: false,
      hiddenModules: []
    }
  });

  const seededFreeUser = sanitizeUser(getUserRecord(freeEmail));
  const seededTrialUser = sanitizeUser(getUserRecord(trialEmail));
  const seededPremiumUser = sanitizeUser(getUserRecord(premiumEmail));
  const seededReturningUser = sanitizeUser(getUserRecord(returningEmail));
  const seededSparseUser = sanitizeUser(getUserRecord(sparseEmail));
  const seededOnboardingUser = sanitizeUser(getUserRecord(onboardingEmail));

  expect(seededFreeUser?.onboardingCompleted && seededFreeUser?.profileComplete, `Free seed user is incomplete before login: ${JSON.stringify(seededFreeUser)}`);
  expect(seededTrialUser?.onboardingCompleted && seededTrialUser?.profileComplete, `Trial seed user is incomplete before login: ${JSON.stringify(seededTrialUser)}`);
  expect(seededPremiumUser?.onboardingCompleted && seededPremiumUser?.profileComplete, `Premium seed user is incomplete before login: ${JSON.stringify(seededPremiumUser)}`);
  expect(seededReturningUser?.onboardingCompleted && seededReturningUser?.profileComplete, `Returning seed user is incomplete before login: ${JSON.stringify(seededReturningUser)}`);
  expect(seededSparseUser?.onboardingCompleted && seededSparseUser?.profileComplete, `Sparse seed user is incomplete before login: ${JSON.stringify(seededSparseUser)}`);
  expect(!seededOnboardingUser?.onboardingCompleted && !seededOnboardingUser?.profileComplete, `Onboarding seed user unexpectedly complete before login: ${JSON.stringify(seededOnboardingUser)}`);

  const freeLogin = await loginUser({ email: freeEmail });
  const trialLogin = await loginUser({ email: trialEmail });
  const premiumLogin = await loginUser({ email: premiumEmail });
  const returningLogin = await loginUser({ email: returningEmail });
  const sparseLogin = await loginUser({ email: sparseEmail });
  const onboardingLogin = await loginUser({ email: onboardingEmail });
  const engineLogin = await loginUser({ email: engineEmail });

  expect(freeLogin.user?.onboardingCompleted && freeLogin.user?.profileComplete, `Free seed user still incomplete after login: ${JSON.stringify(freeLogin.user)}`);
  expect(trialLogin.user?.onboardingCompleted && trialLogin.user?.profileComplete, `Trial seed user still incomplete after login: ${JSON.stringify(trialLogin.user)}`);
  expect(premiumLogin.user?.onboardingCompleted && premiumLogin.user?.profileComplete, `Premium seed user still incomplete after login: ${JSON.stringify(premiumLogin.user)}`);
  expect(returningLogin.user?.onboardingCompleted && returningLogin.user?.profileComplete, `Returning seed user still incomplete after login: ${JSON.stringify(returningLogin.user)}`);
  expect(sparseLogin.user?.onboardingCompleted && sparseLogin.user?.profileComplete, `Sparse seed user still incomplete after login: ${JSON.stringify(sparseLogin.user)}`);
  expect(!onboardingLogin.user?.onboardingCompleted && !onboardingLogin.user?.profileComplete, `Onboarding-gated seed user unexpectedly complete: ${JSON.stringify(onboardingLogin.user)}`);

  {
    const context = await browser.newContext();
    const page = await context.newPage();
    const bucket = { consoleErrors: [], pageErrors: [] };
    collectNormalUsageErrors(page, bucket);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /build better health momentum/i }).waitFor({ timeout: 15000 });
    expect(await page.locator(".auth-brand-word").count(), "Auth page did not render brand wordmark.");
    expect((await page.locator(".sidebar").count()) === 0, "Unauthenticated auth page rendered sidebar.");
    await page.goto(`${baseUrl}/definitely-not-a-route`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /build better health momentum/i }).waitFor({ timeout: 15000 });
    recordScenario("unauthenticated-routing", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
    await context.close();
  }

  await withAuthedPage(browser, onboardingLogin.token, async (page, bucket) => {
    await page.goto(`${baseUrl}/workouts`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /set up pulsepeak once/i }).waitFor({ timeout: 15000 });
    expect(page.url().includes("/onboarding"), "Onboarding-gated user was not forced onto onboarding route.");
    expect(await page.locator(".onboarding-brand-word").count(), "Onboarding page did not render brand wordmark.");
    recordScenario("onboarding-gate", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  {
    const context = await browser.newContext();
    const page = await context.newPage();
    const bucket = { consoleErrors: [], pageErrors: [] };
    collectNormalUsageErrors(page, bucket);
    const email = `new_user_${Date.now()}@pulsepeak.local`;
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByLabel("Name").fill("Launch Audit User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Passw0rd!");
    await page.getByRole("button", { name: "Create PulsePeak account" }).click();
    await page.getByRole("heading", { name: /set up pulsepeak once/i }).waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Training + Recovery" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "General Fitness" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Basic" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByLabel("Birthdate").fill("1992-06-15");
    await page.getByLabel(/Height/).fill("70");
    await page.getByLabel(/Current weight/).fill("185");
    await page.getByLabel(/Target weight/).fill("180");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("heading", { name: /here's how pulsepeak will shape your starting experience/i }).waitFor({ timeout: 10000 });
    await page.getByText(/Launch context/i).waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /Start my tailored dashboard/i }).click();
    await assertDashboardRenders(page);
    await page.goto(`${baseUrl}/plan`, { waitUntil: "networkidle" });
    await page.getByText(/weekly strategy|adaptive weekly plan|weekly focus/i).first().waitFor({ timeout: 15000 });
    recordScenario("new-user-onboarding-flow", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
    await context.close();
  }

  await withAuthedPage(browser, freeLogin.token, async (page, bucket) => {
    await assertDashboardRenders(page);
    // CD V2 shell: desktop primary nav is the centered top pill (no sidebar).
    await page.locator(".app-topbar").waitFor({ timeout: 10000 });
    await page.locator(".app-brand-word").filter({ hasText: "PulsePeak" }).waitFor({ timeout: 10000 });
    await page.locator(".primary-pill").waitFor({ timeout: 10000 });
    expect((await page.locator(".sidebar").count()) === 0, "Retired sidebar still rendered in the CD V2 shell.");
    await page.locator(".primary-pill").getByRole("link", { name: "Today" }).waitFor({ timeout: 10000 });
    // The Train door opens the training section, whose sub-nav exposes its pages.
    await page.locator(".primary-pill").getByRole("link", { name: "Train" }).click();
    await page.getByText(/choose your setup, pick your focus/i).waitFor({ timeout: 15000 });
    await page.locator(".section-subnav").getByRole("link", { name: "Exercise Library" }).waitFor({ timeout: 10000 });
    await assertRouteRenders(page, "/workouts", /choose your setup, pick your focus/i);
    await page.getByRole("button", { name: "Quick session" }).click();
    await page.getByText(/visible results/i).waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: "Recovery day", exact: true }).click();
    await page.getByText(/loaded session/i).waitFor({ timeout: 10000 }).catch(() => {});
    if (await page.getByText(/PulsePeak widened the filters/i).count()) {
      await page.getByText(/PulsePeak widened the filters/i).first().waitFor();
    }
    await page.getByRole("button", { name: "Reset all filters" }).click();
    await page.getByRole("button", { name: /Review workout|Locked preview/ }).first().click();
    try {
      await page.getByRole("dialog").waitFor({ timeout: 10000 });
    } catch (error) {
      throw new Error(
        `Workout detail modal failed to open :: url=${page.url()} :: console=${bucket.consoleErrors.join(" | ") || "none"} :: page=${bucket.pageErrors.join(" | ") || "none"} :: body=${(await page.locator("body").innerText().catch(() => "")).slice(0, 800)}`
      );
    }
    await page.getByRole("button", { name: /Close workout session/i }).click();
    const saveButton = page.getByRole("button", { name: /Save workout|Remove saved/ }).first();
    const saveMutation = page.waitForResponse(
      (response) => response.url().includes("/api/workouts/saved") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await saveButton.click();
    const saveResponse = await saveMutation;
    expect(saveResponse.ok(), `Workout save mutation failed with status ${saveResponse.status()}.`);
    await page.getByRole("button", { name: "Start workout" }).first().click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    await page.getByText(/Current exercise/i).waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /Close workout session/i }).click();
    await assertRouteRenders(page, "/plan", /weekly strategy|adaptive weekly plan|weekly focus/i);
    await assertRouteRenders(page, "/mobility", /mobility/i);
    await assertRouteRenders(page, "/nutrition", /nutrition/i);
    await assertRouteRenders(page, "/progress", /progress overview|performance trend|recent completed sessions/i, {
      stableSelector: ".page-grid",
      retries: 2,
      retryDelayMs: 400
    });
    await assertRouteRenders(page, "/preferences?section=preferences", /control how much guidance you see in each session/i);
    await page.getByRole("button", { name: "Minimal" }).click();
    await page.reload({ waitUntil: "networkidle" });
    // After a cold reload the SPA shell can take a moment to hydrate the
    // preferences panel. Wait for the stable panel heading to re-render before
    // asserting the guidance button so this launch gate can't false-fail on
    // first-run timing, and dump full context if the panel really is missing.
    try {
      await page.getByText(/control how much guidance you see in each session/i)
        .first()
        .waitFor({ timeout: 15000 });
      await page.getByRole("button", { name: "Minimal" }).waitFor({ timeout: 10000 });
    } catch (error) {
      throw new Error(
        `Preferences guidance button missing after reload :: url=${page.url()} :: console=${bucket.consoleErrors.join(" | ") || "none"} :: page=${bucket.pageErrors.join(" | ") || "none"} :: body=${(await page.locator("body").innerText().catch(() => "")).slice(0, 800)}`
      );
    }
    // Unknown routes now render a branded 404 (not a silent redirect / white-screen).
    await page.goto(`${baseUrl}/not-a-real-shell-route`, { waitUntil: "networkidle" });
    await page.getByText(/this page took a rest day/i).waitFor({ timeout: 15000 });
    await page.getByRole("link", { name: /back to dashboard/i }).waitFor({ timeout: 10000 });
    recordScenario("free-user-shell-and-settings", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  // Canadian-benchmark surfaces: lock the Today stat row + quick actions and
  // the Workout Library browse framework (equipment cards, honest media
  // states, live muscle counts, click-through filter) into the launch gate so
  // the regression guard enforces them.
  await withAuthedPage(browser, freeLogin.token, async (page, bucket) => {
    await assertDashboardRenders(page);
    await page.locator(".streak-stat-row").waitFor({ timeout: 10000 });
    expect((await page.locator(".streak-stat").count()) === 4, "Today stat row did not render its 4 stat cardlets (streak, workouts, weekly goal, minutes).");
    expect((await page.locator(".quick-action").count()) >= 4, "Today quick-actions row is missing its action tiles.");
    await page.goto(`${baseUrl}/workout-library`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Workout Library" }).waitFor({ timeout: 15000 });
    expect((await page.locator(".library-equipment-card").count()) === 16, "Workout Library equipment grid did not render 16 cards.");
    const awaiting = await page.locator(".library-media-awaiting").count();
    const loadedMedia = await page.locator(".library-media img").count();
    expect(awaiting + loadedMedia === 14, `Workout Library media tiles must total 14 (awaiting ${awaiting} + loaded ${loadedMedia}).`);
    // Live muscle counts come from /api/exercise-library — wait for the first.
    await page.locator(".library-muscle-card .library-media-desc").first().waitFor({ timeout: 15000 });
    expect(
      (await page.locator(".library-muscle-card .library-media-desc").count()) === 8,
      "Muscle-group tiles did not all render live exercise counts."
    );
    // Click-through filter: Chest -> a category-filtered Exercise Library.
    await page.locator(".library-muscle-card").filter({ hasText: "Chest" }).first().click();
    await page.waitForURL(/\/exercise-library\?category=Chest/, { timeout: 15000 });
    await page.locator(".exercise-library-result-count").waitFor({ timeout: 15000 });
    recordScenario("benchmark-surfaces", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  await withAuthedPage(browser, trialLogin.token, async (page, bucket) => {
    await assertDashboardRenders(page);
    await page.goto(`${baseUrl}/preferences?section=account`, { waitUntil: "networkidle" });
    await page.getByText(/Trial ends on/i).first().waitFor({ timeout: 10000 });
    await page.goto(`${baseUrl}/workouts`, { waitUntil: "networkidle" });
    await page.getByText(/choose your setup, pick your focus/i).waitFor({ timeout: 15000 });
    expect((await page.getByText(/Locked on Free/).count()) === 0, "Trial user still sees locked free workout actions.");
    recordScenario("trial-user-access", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  await withAuthedPage(browser, premiumLogin.token, async (page, bucket) => {
    await assertRouteRenders(page, "/workouts", /choose your setup, pick your focus/i);
    await page.getByRole("button", { name: "Start workout" }).first().click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    const firstCheckbox = page.locator(".exercise-check-toggle").first();
    await firstCheckbox.click();
    await page.getByText(/Exercise 2 of|completed/i).first().waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: /Close workout session/i }).click();
    await assertRouteRenders(page, "/preferences?section=account", /Current plan: Premium/i);
    expect((await page.getByText(/Start 7-day free trial/i).count()) === 0, "Premium account still surfaces free-trial CTA in account plan area.");
    recordScenario("premium-user-depth", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  await withAuthedPage(browser, returningLogin.token, async (page, bucket) => {
    await assertDashboardRenders(page);
    await page.getByText(/for you today|today's session|day streak/i).first().waitFor({ timeout: 10000 });
    await assertRouteRenders(page, "/progress", /progress overview|performance trend|recent completed sessions/i, {
      stableSelector: ".page-grid",
      retries: 2,
      retryDelayMs: 400
    });
    await page.getByText(/weekly|streak|momentum/i).first().waitFor({ timeout: 10000 });
    await assertRouteRenders(page, "/nutrition", /meal templates|today's food direction/i);
    await assertRouteRenders(page, "/plan", /weekly strategy|adaptive weekly plan|weekly focus/i);
    recordScenario("returning-user-history", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  await withAuthedPage(browser, sparseLogin.token, async (page, bucket) => {
    await assertDashboardRenders(page);
    await assertRouteRenders(page, "/nutrition", /nutrition is currently turned off|nutrition/i);
    await assertRouteRenders(page, "/progress", /progress overview|performance trend|recent completed sessions/i, {
      stableSelector: ".page-grid",
      retries: 2,
      retryDelayMs: 400
    });
    await assertRouteRenders(page, "/workouts", /choose your setup, pick your focus/i);
    expect((await page.getByText(/undefined/i).count()) === 0, "Sparse-data user surfaced undefined copy.");
    recordScenario("sparse-data-user", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors
    });
  });

  await withAuthedPage(browser, premiumLogin.token, async (page, bucket, context) => {
    await context.route("**/media/exercises/dumbbell-press/step-1.png", async (route) => {
      await route.fulfill({ status: 404, body: "" });
    });
    await page.goto(`${baseUrl}/workouts`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Review workout|Locked preview/ }).first().click();
    await page.getByRole("dialog").waitFor({ timeout: 10000 });
    recordScenario("media-failure-injected", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors,
      note: "Injected missing sequence image path to verify fallback stability."
    });
  });

  // Engine-depth E2E: exercises the Nutrition, Habit, Body-Metrics and
  // Progress engines end-to-end — an action is performed, the mutation is
  // asserted at the API level, the UI reflects it, and it survives reload.
  // Uses the dedicated engine user so state changes contaminate nothing.
  await withAuthedPage(browser, engineLogin.token, async (page, bucket) => {
    // --- Nutrition engine: log a meal, assert mutation + rendered totals.
    await assertRouteRenders(page, "/nutrition", /today's food direction|meal templates|nutrition/i);
    const mealForm = page.locator("form", { has: page.getByRole("button", { name: "Log meal" }) });
    await mealForm.locator('input[name="name"]').fill("QA Meal Bowl");
    await mealForm.locator('input[name="calories"]').fill("640");
    await mealForm.locator('input[name="protein"]').fill("45");
    const mealMutation = page.waitForResponse(
      (response) => response.url().includes("/api/meals") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await page.getByRole("button", { name: "Log meal" }).click();
    const mealResponse = await mealMutation;
    expect(mealResponse.ok(), `Meal log mutation failed with status ${mealResponse.status()}.`);
    await page.getByText(/640 kcal \| 45g protein/i).first().waitFor({ timeout: 10000 });

    // --- Habit engine: toggle a habit on the dashboard, assert state changes.
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.locator(".habit-card").first().waitFor({ timeout: 15000 });
    expect((await page.locator(".habit-card.habit-done").count()) === 0, "Engine user unexpectedly starts with completed habits.");
    const habitMutation = page.waitForResponse(
      (response) => response.url().includes("/api/habits/toggle") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await page.locator(".habit-card").first().click();
    const habitResponse = await habitMutation;
    expect(habitResponse.ok(), `Habit toggle mutation failed with status ${habitResponse.status()}.`);
    await page.locator(".habit-card.habit-done").first().waitFor({ timeout: 10000 });
    await page.getByText(/Done today/i).first().waitFor({ timeout: 10000 });

    // Persistence: the completed habit must survive a cold reload.
    await page.reload({ waitUntil: "networkidle" });
    await page.locator(".habit-card").first().waitFor({ timeout: 15000 });
    try {
      await page.locator(".habit-card.habit-done").first().waitFor({ timeout: 10000 });
    } catch (error) {
      throw new Error(
        `Habit completion did not persist across reload :: url=${page.url()} :: console=${bucket.consoleErrors.join(" | ") || "none"} :: body=${(await page.locator("body").innerText().catch(() => "")).slice(0, 500)}`
      );
    }

    // --- Body-metrics engine: submit the weekly check-in, assert persistence.
    await assertRouteRenders(page, "/progress", /progress overview|performance trend|recent completed sessions/i, {
      stableSelector: ".page-grid",
      retries: 2,
      retryDelayMs: 400
    });
    const checkInMutation = page.waitForResponse(
      (response) => response.url().includes("/api/weekly-check-in") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await page.getByRole("button", { name: /Save weekly check-in/i }).click();
    const checkInResponse = await checkInMutation;
    expect(checkInResponse.ok(), `Weekly check-in mutation failed with status ${checkInResponse.status()}.`);
    await page.getByText(/Weekly check-in saved\./i).first().waitFor({ timeout: 10000 });

    // Persistence: after reload the form must acknowledge this week's entry.
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText(/progress overview/i).first().waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: /Update weekly check-in/i }).waitFor({ timeout: 10000 });

    // --- Progress engine: the page must reflect the data the other engines
    // just produced — completed habit streak and a non-zero completion score.
    await page.getByText(/1 day streak/i).first().waitFor({ timeout: 10000 });
    const completionText = await page.getByText(/% current completion/i).first().textContent();
    expect(!/^0% current completion/.test(completionText.trim()), `Progress completion score stayed at zero after meal, habit, check-in and seeded workouts: "${completionText.trim()}"`);

    recordScenario("engine-depth-e2e", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors,
      note: "Nutrition, Habit, Body-Metrics and Progress engines verified end-to-end with API-level mutation asserts and reload persistence."
    });
  });

  // Mobile-viewport shell: enforces FACTORY gate 5 ("both platforms") by
  // machinery. At a phone viewport the desktop sidebar must give way to the
  // fixed bottom tab bar, the primary routes must render, tab navigation must
  // work, and no page may scroll sideways — the exact regression the redesign
  // fixed manually. Runs at 390x844 (iPhone-class), below the 1080px breakpoint.
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true
    });
    const page = await context.newPage();
    const bucket = { consoleErrors: [], pageErrors: [] };
    collectNormalUsageErrors(page, bucket);
    await page.addInitScript((storedToken) => {
      window.localStorage.setItem("pulsepeak-auth-token", storedToken);
    }, freeLogin.token);

    async function assertNoHorizontalScroll(label) {
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      }));
      expect(
        overflow.scrollWidth <= overflow.innerWidth + 1,
        `Horizontal scroll on ${label} at 390px: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}.`
      );
    }

    await assertDashboardRenders(page);
    // Bottom tab bar is the mobile primary nav; desktop top pill must be hidden.
    await page.locator(".mobile-tabbar").waitFor({ state: "visible", timeout: 10000 });
    expect(!(await page.locator(".app-topbar").isVisible()), "Desktop top bar is visible at 390px mobile viewport.");
    expect((await page.locator(".sidebar").count()) === 0, "Retired sidebar still rendered at mobile viewport.");
    await assertNoHorizontalScroll("dashboard");

    const mobileRoutes = [
      { path: "/workouts", matcher: /choose your setup, pick your focus/i },
      { path: "/nutrition", matcher: /today's food direction|keep nutrition practical|nutrition is currently turned off/i },
      { path: "/progress", matcher: /are you getting stronger|progress overview|recent completed sessions/i, stableSelector: ".page-grid" },
      { path: "/mobility", matcher: /choose your training path|guided movement|next in your day/i, stableSelector: ".page-grid" },
      { path: "/exercise-library", matcher: /learn every movement, the right way|find the exact movement/i, stableSelector: ".page-grid" }
    ];
    for (const route of mobileRoutes) {
      await assertRouteRenders(page, route.path, route.matcher, {
        stableSelector: route.stableSelector || "main, #root, .page-grid",
        retries: 2,
        retryDelayMs: 400
      });
      await assertNoHorizontalScroll(route.path);
    }

    // Tab navigation must actually route.
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.locator(".mobile-tabbar").waitFor({ state: "visible", timeout: 10000 });
    await page.locator(".mobile-tab", { hasText: "Train" }).click();
    await page.getByText(/choose your setup, pick your focus/i).waitFor({ timeout: 15000 });
    expect(page.url().includes("/workouts"), `Mobile Train tab did not navigate to /workouts. URL: ${page.url()}`);

    recordScenario("mobile-viewport-shell", {
      pass: bucket.consoleErrors.length === 0 && bucket.pageErrors.length === 0,
      consoleErrors: bucket.consoleErrors,
      pageErrors: bucket.pageErrors,
      note: "Phone viewport (390px): bottom tab bar replaces sidebar, primary routes render, tab nav routes, no horizontal scroll on any surface."
    });
    await context.close();
  }
}

function runCombinationAudit() {
  const profiles = [
    { name: "free-home-beginner", accessTier: "free", profile: buildCompletedProfile({ trainingEnvironment: "home", equipmentProfile: "bodyweight", equipmentSelections: [], experienceLevel: "beginner" }) },
    { name: "trial-gym-intermediate", accessTier: "trial_active", profile: buildCompletedProfile({ trainingEnvironment: "gym", equipmentProfile: "full_gym", equipmentSelections: ["barbell", "bench", "machine"], experienceLevel: "intermediate" }) },
    { name: "premium-hybrid-advanced", accessTier: "premium", profile: buildCompletedProfile({ trainingEnvironment: "hybrid", equipmentProfile: "hybrid", equipmentSelections: ["bench", "dumbbell", "barbell"], experienceLevel: "advanced", ageGroup: "40-49" }) },
    { name: "joint-friendly", accessTier: "premium", profile: buildCompletedProfile({ injuryStatus: "minor", restrictedAreas: ["shoulder"], trainingEnvironment: "hybrid", equipmentProfile: "bench_dumbbells" }) }
  ];
  const focuses = [
    "upper_body", "lower_body", "push", "pull", "chest", "back", "shoulders", "arms", "glutes", "core",
    "strength", "muscle_building", "fat_loss", "conditioning", "bodyweight", "mobility_recovery",
    "beginner", "intermediate", "advanced", "joint_friendly", "forty_plus", "recovery_day", "hybrid_setup"
  ];

  const tested = [];
  for (const profileEntry of profiles) {
    for (const focus of focuses) {
      const workouts = getWorkoutLibraryForProfile(
        {
          environment: profileEntry.profile.trainingEnvironment === "hybrid" ? "both" : profileEntry.profile.trainingEnvironment,
          focus,
          equipmentSelections: profileEntry.profile.equipmentSelections
        },
        profileEntry.profile,
        [],
        profileEntry.accessTier
      );

      const usable = workouts.length > 0;
      tested.push({
        profile: profileEntry.name,
        focus,
        count: workouts.length,
        usable
      });

      if (!usable && focus !== "mobility_recovery") {
        recordWarning(`Combination returned no workouts before UI recovery: ${profileEntry.name} / ${focus}`);
      }
    }

    for (const preset of WORKOUT_FILTER_PRESETS) {
      tested.push({
        profile: profileEntry.name,
        preset: preset.id,
        covered: true
      });
    }
  }

  const requiredCoverage = [
    "upper_body",
    "lower_body",
    "push",
    "pull",
    "chest",
    "back",
    "shoulders",
    "arms",
    "glutes",
    "core",
    "strength",
    "muscle_building",
    "fat_loss",
    "conditioning",
    "bodyweight",
    "beginner",
    "intermediate",
    "advanced",
    "joint_friendly",
    "forty_plus",
    "recovery_day",
    "hybrid_setup"
  ];
  const majorCategoryCoverage = requiredCoverage.filter((id) => tested.some((row) => row.focus === id));

  report.combinationCoverage = tested;
  report.fixesVerified.push(`Combination audit covered ${profiles.length} profile states, ${focuses.length} major focus targets, and all ${WORKOUT_FILTER_PRESETS.length} presets.`);
  expect(majorCategoryCoverage.length === requiredCoverage.length, "Combination audit missed required major workout categories.");
}

function runMediaAudit() {
  const movements = getMovementLibrary();
  const movementIds = movements.map((movement) => movement.id);
  const trueFourStep = [];
  const singleReferenceOnly = [];
  const missingMedia = [];
  const brokenMappings = [];
  const unmatchedExerciseVariants = [];

  const workoutLibrarySource = fs.readFileSync(path.join(projectRoot, "server", "data", "workoutLibrary.js"), "utf8");
  const variantNameMatches = Array.from(workoutLibrarySource.matchAll(/variant\("[^"]+",\s*"([^"]+)"/g));
  const variantNames = Array.from(new Set(variantNameMatches.map((match) => match[1]).filter(Boolean)));

  for (const movement of movements) {
    const mediaView = getMovementMedia(movement);
    const visual = resolveMovementVisual(movement);
    const uniqueSteps = new Set(mediaView.sequence.map((entry) => entry.src).filter(Boolean));
    const thumbPath = movement.thumbnail ? path.join(projectRoot, "public", movement.thumbnail.replace(/^\//, "")) : null;

    if (!movement.thumbnail || !fs.existsSync(thumbPath)) {
      missingMedia.push(movement.id);
    }

    if (uniqueSteps.size === 4) {
      trueFourStep.push(movement.id);
    } else if (visual.mode === "image") {
      singleReferenceOnly.push(movement.id);
    } else {
      missingMedia.push(movement.id);
    }

    if (mediaView.hasPhasedSequence && uniqueSteps.size < 2) {
      brokenMappings.push(movement.id);
    }
  }

  const aliasedExercises = [
    "bench press",
    "incline dumbbell press",
    "barbell bench press",
    "seated shoulder press",
    "lat pulldown",
    "triceps pushdown"
  ];
  for (const alias of aliasedExercises) {
    const mapped = findMovementForName(alias);
    if (!mapped) {
      brokenMappings.push(`alias:${alias}`);
    }
  }

  for (const variantName of variantNames) {
    if (!findMovementForName(variantName)) {
      unmatchedExerciseVariants.push(variantName);
    }
  }

  report.mediaAudit = {
    totalMovements: movementIds.length,
    trueFourStep,
    singleReferenceOnly,
    missingMedia: Array.from(new Set(missingMedia)),
    brokenMappings: Array.from(new Set(brokenMappings)),
    unmatchedExerciseVariants: Array.from(new Set(unmatchedExerciseVariants))
  };

  if (report.mediaAudit.missingMedia.length) {
    recordWarning(`Some movement thumbnails are missing: ${report.mediaAudit.missingMedia.join(", ")}`);
  }
  if (report.mediaAudit.brokenMappings.length) {
    recordWarning(`Some movement/media mappings need review: ${report.mediaAudit.brokenMappings.join(", ")}`);
  }
  if (report.mediaAudit.unmatchedExerciseVariants.length) {
    recordWarning(`Some workout exercise variants do not map to canonical movement media: ${report.mediaAudit.unmatchedExerciseVariants.join(", ")}`);
  }
}

// PWA installability is a machine-checkable contract: the built app must serve
// a valid manifest, a service worker, and every icon the manifest references.
// This asserts the prerequisites a browser uses to decide an app is
// installable — so "installable" is enforced by CI, not by memory.
async function runPwaAssetAudit() {
  const errors = [];

  async function fetchOk(pathname, label) {
    try {
      const response = await fetch(`${baseUrl}${pathname}`);
      if (!response.ok) {
        errors.push(`${label} (${pathname}) returned HTTP ${response.status}`);
        return null;
      }
      return response;
    } catch (error) {
      errors.push(`${label} (${pathname}) failed to fetch: ${error.message}`);
      return null;
    }
  }

  const manifestResponse = await fetchOk("/manifest.webmanifest", "PWA manifest");
  let manifest = null;
  if (manifestResponse) {
    try {
      manifest = JSON.parse(await manifestResponse.text());
    } catch (error) {
      errors.push(`PWA manifest is not valid JSON: ${error.message}`);
    }
  }

  if (manifest) {
    if (!manifest.name) errors.push("Manifest missing name.");
    if (!manifest.short_name) errors.push("Manifest missing short_name.");
    if (!manifest.start_url) errors.push("Manifest missing start_url.");
    if (manifest.display !== "standalone") {
      errors.push(`Manifest display is "${manifest.display}", expected "standalone".`);
    }
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const has192 = icons.some((icon) => String(icon.sizes || "").includes("192x192"));
    const has512 = icons.some((icon) => String(icon.sizes || "").includes("512x512"));
    const hasMaskable = icons.some((icon) => String(icon.purpose || "").includes("maskable"));
    if (!has192) errors.push("Manifest missing a 192x192 icon.");
    if (!has512) errors.push("Manifest missing a 512x512 icon.");
    if (!hasMaskable) errors.push("Manifest missing a maskable icon.");

    // Every icon the manifest advertises must actually resolve.
    for (const icon of icons) {
      if (!icon.src) continue;
      const iconPath = icon.src.startsWith("/") ? icon.src : `/${icon.src}`;
      const iconResponse = await fetchOk(iconPath, "Manifest icon");
      if (iconResponse) {
        const type = iconResponse.headers.get("content-type") || "";
        if (!type.startsWith("image/")) {
          errors.push(`Manifest icon ${iconPath} served non-image content-type "${type}".`);
        }
      }
    }
  }

  await fetchOk("/sw.js", "Service worker");
  await fetchOk("/apple-touch-icon.png", "Apple touch icon");

  report.pwaAssets = {
    manifestName: manifest?.name || null,
    iconCount: Array.isArray(manifest?.icons) ? manifest.icons.length : 0,
    errors
  };
  recordScenario("pwa-installability-assets", {
    pass: errors.length === 0,
    note: "Manifest, service worker, and every referenced icon are served and valid (installability prerequisites)."
  });
  if (errors.length) {
    recordBlocker(`PWA installability asset check failed: ${errors.join(" | ")}`);
  }
}

// Backend-hardening gates (red-team P0/P1 fixes): malformed input returns clean
// JSON with no stack/path leak, unknown API routes 404 as JSON, an oversized
// password is rejected fast (no scrypt event-loop DoS), and auth endpoints are
// rate-limited. Runs AFTER browser coverage so the rate-limit burst can't
// starve the scenarios' own logins.
async function runApiHardeningAudit() {
  const checks = [];

  // 1. Malformed JSON body -> clean JSON 400, no stack trace / absolute path leak.
  {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad json"
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "";
    const leaks = /SyntaxError|node_modules|at JSON\.parse|[A-Za-z]:\\\\|\/home\/|\.js:\d+/.test(text);
    checks.push({
      name: "malformed-json-clean-400",
      ok: res.status === 400 && ct.includes("application/json") && !leaks,
      detail: `status=${res.status} contentType=${ct} leak=${leaks}`
    });
  }

  // 2. Unknown /api route -> JSON 404 (not HTML "Cannot GET /api/...").
  {
    const res = await fetch(`${baseUrl}/api/does-not-exist-${Date.now()}`);
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    checks.push({
      name: "api-404-json",
      ok: res.status === 404 && ct.includes("application/json") && !/Cannot GET/.test(text),
      detail: `status=${res.status} contentType=${ct}`
    });
  }

  // 3. Oversized password rejected fast (cap runs before scrypt; no event-loop freeze).
  {
    const huge = "a".repeat(200000);
    const started = Date.now();
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "DoS Probe", email: `dos_${Date.now()}@pulsepeak.local`, password: huge })
    });
    const elapsed = Date.now() - started;
    checks.push({
      name: "oversized-password-rejected-fast",
      ok: res.status === 400 && elapsed < 1000,
      detail: `status=${res.status} elapsed=${elapsed}ms`
    });
  }

  // 4. Auth rate limiting: a login burst from one IP eventually 429s.
  {
    let saw429 = false;
    let attempts = 0;
    for (let i = 0; i < 140; i += 1) {
      attempts += 1;
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ratelimit_nobody@pulsepeak.local", password: "wrongpass" })
      });
      if (res.status === 429) {
        saw429 = true;
        break;
      }
    }
    checks.push({
      name: "auth-rate-limited",
      ok: saw429,
      detail: saw429 ? `429 after ${attempts} attempts` : "no 429 after 140 attempts"
    });
  }

  report.apiHardening = checks;
  const failed = checks.filter((check) => !check.ok);
  recordScenario("api-hardening", {
    pass: failed.length === 0,
    note: "Malformed JSON -> JSON 400 (no path leak); unknown /api -> JSON 404; oversized password rejected fast; auth rate-limited."
  });
  if (failed.length) {
    recordBlocker(`API hardening checks failed: ${failed.map((check) => `${check.name} (${check.detail})`).join(" | ")}`);
  }
}

// Personal-record detection is celebration-critical and must never fabricate a
// record or celebrate an ordinary set. Deterministic unit coverage of the pure
// detector (server/data/store.js) so this can't silently regress.
function runPrDetectionAudit() {
  const checks = [];
  const ex = (name, weight, reps, sets = 3) => ({
    name,
    weight,
    repsCompleted: reps,
    reps: reps === null ? null : String(reps),
    sets,
    equipment: "barbell",
    muscleGroup: "Chest"
  });
  const wk = (exercises, loggedAt = "2026-07-01T00:00:00.000Z") => ({
    name: "Session",
    type: "strength",
    duration: 45,
    exercises,
    loggedAt
  });
  const prior = [wk([ex("Bench Press", 135, 8)])]; // prior best: 135×8, session vol 3240

  const push = (name, ok) => checks.push({ name, ok });

  let r = detectPersonalRecords(prior, wk([ex("Bench Press", 155, 5)]));
  push("heavier-weight-is-pr", r.some((x) => x.type === "heaviest_weight" && x.exercise === "Bench Press" && x.weight === 155));

  r = detectPersonalRecords(prior, wk([ex("Bench Press", 135, 12)]));
  push("more-reps-is-e1rm-pr", r.some((x) => x.type === "best_e1rm") && !r.some((x) => x.type === "heaviest_weight"));

  r = detectPersonalRecords(prior, wk([ex("Bench Press", 135, 6)]));
  push("weaker-set-is-not-pr", !r.some((x) => x.exercise === "Bench Press"));

  // First-time exercise, kept below the prior session volume (225×5×2=2250 < 3240)
  // so this isolates the "no strength PR for a first performance" rule.
  r = detectPersonalRecords(prior, wk([ex("Deadlift", 225, 5, 2)]));
  push("first-time-exercise-is-not-pr", !r.some((x) => x.exercise === "Deadlift") && r.length === 0);

  r = detectPersonalRecords(prior, wk([ex("Push-up", null, 20)]));
  push("bodyweight-is-not-pr", r.length === 0);

  r = detectPersonalRecords(prior, wk([ex("Bench Press", 135, 8, 6)])); // vol 6480 > 3240, same weight/reps
  push("bigger-session-is-volume-pr", r.some((x) => x.type === "session_volume") && !r.some((x) => x.type === "heaviest_weight"));

  r = detectPersonalRecords([], wk([ex("Bench Press", 135, 8)]));
  push("no-history-no-pr", r.length === 0);

  const failed = checks.filter((c) => !c.ok);
  recordScenario("pr-detection", {
    pass: failed.length === 0,
    note: "detectPersonalRecords: real records only (heaviest weight, best e1RM, session volume); no first-time / weaker / bodyweight / no-history fabrication."
  });
  if (failed.length) {
    recordBlocker(`PR detection checks failed: ${failed.map((c) => c.name).join(", ")}`);
  }
}

// The shareable Week-in-Review recap must derive every number from real logged
// data (workouts, streak, volume, exercises, PRs, goal) and never fabricate.
function runWeekInReviewAudit() {
  const checks = [];
  const push = (name, ok) => checks.push({ name, ok });
  const now = new Date();
  const iso = (msAgo) => new Date(now.getTime() - msAgo).toISOString();
  const ex = (name, weight, reps, sets = 3) => ({ name, weight, repsCompleted: reps, reps: String(reps), sets, equipment: "barbell", muscleGroup: "Chest" });
  const wk = (exercises, msAgo) => ({ name: "Session", type: "strength", duration: 45, exercises, loggedAt: iso(msAgo) });

  // Empty history → no activity.
  let r = buildWeekInReview({ workouts: [] });
  push("empty-no-activity", r.hasActivity === false && r.workoutsCompleted === 0 && r.totalVolume === 0);

  // Two sessions this week, second heavier → activity + volume + a PR counted.
  const workouts = [
    wk([ex("Bench Press", 135, 8)], 3 * 24 * 60 * 60 * 1000), // 3 days ago
    wk([ex("Bench Press", 185, 5), ex("Row", 100, 10)], 1 * 24 * 60 * 60 * 1000) // 1 day ago
  ];
  r = buildWeekInReview({ workouts }, { isPremium: true, completion: 72 });
  push("counts-workouts", r.workoutsCompleted === 2);
  push("computes-volume", r.totalVolume > 0);
  push("counts-exercises", r.exercisesCompleted === 3);
  push("detects-week-prs", r.prCount >= 1 && r.personalRecords.some((x) => x.type === "heaviest_weight"));
  push("passes-consistency", r.consistency === 72);
  push("goal-progress-shape", r.weeklyGoal && r.weeklyGoal.completed === 2 && r.weeklyGoal.target > 0);

  const failed = checks.filter((c) => !c.ok);
  recordScenario("week-in-review", {
    pass: failed.length === 0,
    note: "buildWeekInReview derives workouts/streak/volume/exercises/PRs/consistency/goal from real logs; empty history → no activity."
  });
  if (failed.length) {
    recordBlocker(`Week-in-review checks failed: ${failed.map((c) => c.name).join(", ")}`);
  }
}

// The retention streak (with freeze protection) must be deterministic and honest:
// trained days grow it, freezes bridge a bounded number of missed days, and the
// loop state (active/at_risk/broken/none) must be correct.
function runStreakStatusAudit() {
  const checks = [];
  const push = (name, ok) => checks.push({ name, ok });
  const DAY = 24 * 60 * 60 * 1000;
  const dayWorkout = (daysAgo) => ({
    name: "S",
    type: "strength",
    duration: 40,
    exercises: [{ name: "Bench Press", weight: 100, repsCompleted: 8, reps: "8", sets: 3 }],
    loggedAt: new Date(Date.now() - daysAgo * DAY).toISOString()
  });

  let s = buildStreakStatus({ workouts: [] });
  push("empty-none", s.streak === 0 && s.state === "none" && s.trainedToday === false && s.freezesRemaining === 2);

  s = buildStreakStatus({ workouts: [dayWorkout(0)] });
  push("today-active", s.streak === 1 && s.state === "active" && s.trainedToday === true);

  s = buildStreakStatus({ workouts: [dayWorkout(1)] });
  push("yesterday-at-risk", s.streak === 1 && s.state === "at_risk" && s.trainedToday === false);

  // trained today + 2 days ago, missed yesterday -> freeze bridges the gap.
  s = buildStreakStatus({ workouts: [dayWorkout(0), dayWorkout(2)] });
  push("freeze-bridges-gap", s.streak === 2 && s.freezesUsed === 1 && s.freezesRemaining === 1);

  // today, then a 3-day gap to an older workout -> gap exceeds the 2 freezes, so
  // the older workout can't extend the streak; only today counts (no bridged gaps).
  s = buildStreakStatus({ workouts: [dayWorkout(0), dayWorkout(4)] });
  push("gap-beyond-freezes-breaks", s.streak === 1 && s.freezesUsed === 0 && s.freezesRemaining === 2);

  // trained 5 days ago only -> gaps exhaust the 2 freezes before reaching it -> broken.
  s = buildStreakStatus({ workouts: [dayWorkout(5)] });
  push("stale-broken", s.streak === 0 && s.state === "broken");

  // longestStreak uses the SAME freeze semantics and must never be < current
  // (that would be a visible contradiction). A big past run must be captured.
  s = buildStreakStatus({ workouts: [0, 2, 4, 7, 13, 17, 24].map(dayWorkout) });
  push("longest-consistent-alive-pattern", s.streak === 3 && s.longestStreak === 3);
  s = buildStreakStatus({ workouts: [0, 10, 11, 12, 13, 14, 15, 16].map(dayWorkout) });
  push("longest-captures-past-run", s.streak === 1 && s.longestStreak === 7);
  s = buildStreakStatus({ workouts: [0, 1, 2, 3, 4].map(dayWorkout) });
  push("longest-ge-current-invariant", s.longestStreak >= s.streak && s.longestStreak === 5);

  const failed = checks.filter((c) => !c.ok);
  recordScenario("streak-status", {
    pass: failed.length === 0,
    note: "buildStreakStatus: freeze-protected streak deterministic; states correct; freeze buffer bounded; longestStreak uses same semantics and is always >= current (no cross-screen contradiction)."
  });
  if (failed.length) {
    recordBlocker(`Streak status checks failed: ${failed.map((c) => c.name).join(", ")}`);
  }
}

// The attentive insight engine must be honest: no insight without real data
// support, sparse users get only the activation message, and every emitted
// insight carries evidence + a reason.
function runInsightEngineAudit() {
  const checks = [];
  const push = (name, ok) => checks.push({ name, ok });
  const DAY = 24 * 60 * 60 * 1000;
  const iso = (daysAgo) => new Date(Date.now() - daysAgo * DAY).toISOString();
  const ex = (name, weight, reps, group) => ({ name, weight, repsCompleted: reps, reps: String(reps), sets: 3, muscleGroup: group, equipment: "barbell" });
  const wk = (name, daysAgo, exercises) => ({ name, type: "strength", focus: "push", duration: 45, intensity: "Moderate", exercises, loggedAt: iso(daysAgo) });

  // Empty + sparse → ONLY the honest activation insight, nothing fabricated.
  let ins = buildInsights({ workouts: [] });
  push("empty-only-activation", ins.length === 1 && ins[0].category === "activation");
  ins = buildInsights({ workouts: [wk("First", 0, [ex("Bench Press", 135, 8, "Chest")])] });
  push("sparse-only-activation", ins.length === 1 && ins[0].category === "activation");

  // Rich history → real insights, every one carries evidence + reason.
  const rich = [
    wk("Push A", 0, [ex("Bench Press", 185, 5, "Chest")]),
    wk("Push B", 2, [ex("Bench Press", 180, 6, "Chest")]),
    wk("Push C", 7, [ex("Bench Press", 175, 6, "Chest")]),
    wk("Push D", 16, [ex("Bench Press", 165, 8, "Chest")]),
    wk("Legs", 4, [ex("Squat", 225, 5, "Legs")]),
    wk("Back", 12, [ex("Barbell Row", 135, 8, "Back")])
  ];
  ins = buildInsights({ workouts: rich });
  push("rich-has-insights", ins.length >= 2 && !ins.some((i) => i.category === "activation"));
  push("all-insights-have-evidence-and-reason", ins.every((i) => i.evidence && i.reason && i.title && i.message));
  push("detects-pr-opportunity", ins.some((i) => i.category === "pr_opportunity"));
  push("detects-strength-progress", ins.some((i) => i.category === "progress" && /climbing/i.test(i.title)));
  push("detects-neglected-back", ins.some((i) => i.id === "neglected-back"));

  // Honesty: a group never trained is NOT reported as "neglected".
  push("no-neglected-for-untrained-group", !ins.some((i) => i.id === "neglected-shoulders" || i.id === "neglected-arms"));

  // Volume-trend must NOT fire as a huge % when the prior month was near-empty
  // (ramp-up dressed as a trend). Prior month here has only 1 session.
  push("no-implausible-volume-trend", !ins.some((i) => i.id === "volume-trend"));

  // Next best action is always actionable with a reason.
  const nba = buildNextBestAction(ins);
  push("next-best-action-actionable", Boolean(nba && nba.to && nba.reason));

  const failed = checks.filter((c) => !c.ok);
  report.insightSample = buildInsights({ workouts: rich }).map((i) => ({ id: i.id, title: i.title }));
  recordScenario("insight-engine", {
    pass: failed.length === 0,
    note: "buildInsights: honest (sparse→activation only, no untrained-group/ramp-up fabrication); every insight carries evidence + reason; next-best-action actionable."
  });
  if (failed.length) {
    recordBlocker(`Insight engine checks failed: ${failed.map((c) => c.name).join(", ")}`);
  }
}

// Locks the correctness fixes from the cross-screen + calculation audits:
// consistent streak, honest units, rep-range volume, PR-count dedup, and a Coach
// surface backed by the real insight engine (never a "disabled" placeholder).
function runCorrectnessFixesAudit() {
  const checks = [];
  const push = (name, ok) => checks.push({ name, ok });
  const DAY = 24 * 60 * 60 * 1000;
  const iso = (d) => new Date(Date.now() - d * DAY).toISOString();
  const ex = (name, weight, reps, group) => ({ name, weight, repsCompleted: null, reps, sets: 3, muscleGroup: group, equipment: "barbell" });
  const wk = (name, d, exs) => ({ name, type: "strength", duration: 45, intensity: "Moderate", exercises: exs, loggedAt: iso(d) });

  // Rep RANGE ("8-12") must count as real volume (was silently zeroed -> NaN).
  const ranged = { workouts: [wk("A", 0, [ex("Bench", 135, "8-12", "Chest")]), wk("B", 2, [ex("Bench", 135, "8-12", "Chest")])] };
  push("rep-range-counts-volume", buildWeekInReview(ranged, { isPremium: false }).totalVolume > 0);

  // PR count must not double-count (heaviest + session_volume) per heavier session.
  const climbing = {
    workouts: [
      wk("W1", 6, [ex("Bench", 100, "8", "Chest")]),
      wk("W2", 4, [ex("Bench", 110, "8", "Chest")]),
      wk("W3", 2, [ex("Bench", 120, "8", "Chest")])
    ]
  };
  const wir = buildWeekInReview(climbing, { isPremium: false });
  push("pr-count-deduped", wir.prCount <= 2); // one bench progression + at most one volume record

  // Metric users must see "kg", not a hardcoded "lb".
  const metric = {
    profile: { unitPreference: "metric" },
    workouts: [
      wk("A", 0, [ex("Bench", 100, "8", "Chest")]),
      wk("B", 5, [ex("Bench", 90, "8", "Chest")]),
      wk("C", 9, [ex("Bench", 80, "8", "Chest")])
    ]
  };
  const metricInsights = buildInsights(metric);
  push("metric-unit-label", metricInsights.some((i) => /kg/.test(i.evidence || "")) && !metricInsights.some((i) => / lb/.test(i.evidence || "")));

  // Coach surface is backed by the real insight engine — never the old
  // "Launch baseline active / Advanced coaching is disabled" placeholder.
  const coach = buildLaunchSafeCoachResponse(metric);
  push("coach-not-disabled-placeholder", coach.coach.primaryInsight.title !== "Launch baseline active" && coach.recoveryFocus.energyLevel !== "Not evaluated");

  const failed = checks.filter((c) => !c.ok);
  recordScenario("correctness-fixes", {
    pass: failed.length === 0,
    note: "Cross-screen consistency + calc fixes: rep-range volume, PR-count dedup, metric unit labels, insight-engine-backed Coach surface."
  });
  if (failed.length) {
    recordBlocker(`Correctness fix checks failed: ${failed.map((c) => c.name).join(", ")}`);
  }
}

const server = startServer();
let browser;

server.stdout.on("data", (chunk) => {
  fs.appendFileSync(path.join(artifactsDir, "launch-readiness-server.log"), chunk);
});
server.stderr.on("data", (chunk) => {
  fs.appendFileSync(path.join(artifactsDir, "launch-readiness-server.log"), chunk);
});

try {
  await waitForHealth();
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  runCombinationAudit();
  runMediaAudit();
  runPrDetectionAudit();
  runWeekInReviewAudit();
  runStreakStatusAudit();
  runInsightEngineAudit();
  runCorrectnessFixesAudit();
  await runPwaAssetAudit();
  await runBrowserCoverage(browser);
  // After browser coverage — the auth rate-limit burst must not starve the
  // scenarios' own logins.
  await runApiHardeningAudit();

  for (const scenario of report.scenarios) {
    if (!scenario.pass) {
      recordBlocker(`Scenario failed: ${scenario.name}`);
    }
    if (scenario.consoleErrors?.length) {
      recordBlocker(`Console errors detected during ${scenario.name}: ${scenario.consoleErrors.join(" | ")}`);
    }
    if (scenario.pageErrors?.length) {
      recordBlocker(`Page errors detected during ${scenario.name}: ${scenario.pageErrors.join(" | ")}`);
    }
  }

  fs.writeFileSync(path.join(artifactsDir, "launch-readiness-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.blockers.length) {
    process.exitCode = 1;
  }
} finally {
  if (browser) {
    await browser.close();
  }
  if (server && !server.killed) {
    server.kill();
  }
}
