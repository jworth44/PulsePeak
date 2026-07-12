import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { attachMovementToExercise, findMovementForName, selectFeaturedMovements } from "./movementLibrary.js";
import { buildMobilityModule, buildMobilityPlan } from "./stretchLibrary.js";
import {
  CUSTOMIZABLE_MODULE_IDS,
  getActiveModules,
  normalizeHiddenModules,
  normalizeModuleOrder,
  normalizeNutritionMode
} from "../../shared/dashboardModules.js";
import { hasCompletedOnboarding, isProfileComplete, normalizeVisualModelPreference } from "../../shared/profileState.js";
import { formatHydration, formatWeight, normalizeUnitPreference } from "../../shared/unitSystem.js";
import {
  ACCESS_TIERS,
  FREE_COMPLETED_SESSION_LIMIT,
  TRIAL_LENGTH_DAYS,
  normalizeAccessTier
} from "../../shared/entitlements.js";
import {
  buildEquipmentProfileFromSelections,
  formatWorkoutFocus,
  getDefaultEquipmentSelections,
  getEquipmentSelectionsForProfile,
  getSuggestedWorkoutFocuses,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../../shared/workoutEngine.js";
import { normalizeAppMode } from "../../shared/appModes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.join(__dirname, "db.json");
const DB_PATH = path.resolve(process.env.PULSEPEAK_DB_PATH || DEFAULT_DB_PATH);
const PUBLIC_PATH = path.resolve(__dirname, "../../public");

const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_DURATION_MS = 30 * DAY_MS;
const FREE_WEEKLY_WORKOUT_LIMIT = FREE_COMPLETED_SESSION_LIMIT;
const TRIAL_DURATION_DAYS = TRIAL_LENGTH_DAYS;
const COACHING_RUNTIME_ENABLED = false;
const GOAL_TYPES = [
  "strength",
  "athletic_performance",
  "bodybuilding",
  "fat_loss",
  "general_fitness",
  "mobility",
  "injury_recovery",
  "active_aging"
];
const AGE_GROUPS = ["18-29", "30-39", "40-49", "50+"];
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const TRAINING_ENVIRONMENTS = ["home", "gym", "hybrid"];
const INJURY_STATUSES = ["none", "minor", "active_injury"];
const RESTRICTED_AREAS = ["knee", "shoulder", "back", "elbow", "hip", "ankle"];
const NUTRITION_MODES = ["off", "basic", "full"];
const SEX_OPTIONS = ["female", "male", "non_binary", "prefer_not_to_say"];

export function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  let db;
  try {
    db = JSON.parse(raw);
  } catch (error) {
    // Never let a corrupt/half-written DB file crash every request with a raw
    // SyntaxError. Atomic writes (see writeDb) make this near-impossible now,
    // but a disk fault or external edit is still possible — surface a clean,
    // actionable error that the terminal error middleware turns into a JSON 500.
    throw new Error(`PulsePeak database file is unreadable at ${DB_PATH}: ${error.message}`);
  }
  if (!db || typeof db !== "object") {
    throw new Error(`PulsePeak database file is not a valid object at ${DB_PATH}.`);
  }
  if (!Array.isArray(db.users)) {
    db.users = [];
  }
  if (!Array.isArray(db.sessions)) {
    db.sessions = [];
  }
  if (!Array.isArray(db.webhookEvents)) {
    db.webhookEvents = [];
  }
  const now = Date.now();
  const filteredSessions = db.sessions.filter((session) => {
    if (!session.expiresAt) {
      return true;
    }

    return new Date(session.expiresAt).getTime() > now;
  });

  if (filteredSessions.length !== db.sessions.length) {
    db.sessions = filteredSessions;
    writeDb(db);
  }

  return db;
}

export function writeDb(db) {
  ensureDbFile();
  const payload = JSON.stringify(db, null, 2);
  const tempPath = `${DB_PATH}.tmp`;
  try {
    // Atomic write: serialize to a temp file, then rename over the live file.
    // rename is atomic on the same volume, so a crash/OOM/disk-full mid-write
    // leaves the existing DB_PATH fully intact instead of truncated/corrupt.
    fs.writeFileSync(tempPath, payload);
    fs.renameSync(tempPath, DB_PATH);
  } catch (error) {
    // Some environments (OneDrive-synced dirs, transient Windows file locks)
    // can reject the rename. Fall back to a direct write so persistence still
    // succeeds; clean up any stray temp file.
    fs.writeFileSync(DB_PATH, payload);
    try {
      fs.rmSync(tempPath, { force: true });
    } catch {
      // best-effort cleanup
    }
  }
}

function ensureDbFile() {
  const dbDirectory = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(
        {
          users: [],
          sessions: [],
          webhookEvents: []
        },
        null,
        2
      )
    );
  }
}

function normalizeStoredUser(user) {
  return {
    ...user,
    data: normalizeWellnessData(user.data)
  };
}

export function normalizeWellnessData(data = {}) {
  const sanitizedData = normalizeLegacyMovementAssetRefs(data);
  const normalizedGoals = {
    calories: Number(sanitizedData.goals?.calories || 2200),
    protein: Number(sanitizedData.goals?.protein || 150),
    water: Number(sanitizedData.goals?.water || 2.8),
    sleep: Number(sanitizedData.goals?.sleep || 8),
    workoutMinutes: Number(sanitizedData.goals?.workoutMinutes || 55)
  };
  const normalizedProfile = {
    goalType: GOAL_TYPES.includes(sanitizedData.profile?.goalType) ? sanitizedData.profile.goalType : "general_fitness",
    ageGroup: AGE_GROUPS.includes(sanitizedData.profile?.ageGroup) ? sanitizedData.profile.ageGroup : "30-39",
    birthdate: typeof sanitizedData.profile?.birthdate === "string" ? sanitizedData.profile.birthdate : "",
    experienceLevel: EXPERIENCE_LEVELS.includes(sanitizedData.profile?.experienceLevel) ? sanitizedData.profile.experienceLevel : "beginner",
    trainingEnvironment: TRAINING_ENVIRONMENTS.includes(sanitizedData.profile?.trainingEnvironment)
      ? sanitizedData.profile.trainingEnvironment
      : "hybrid",
    equipmentProfile: normalizeEquipmentProfile(sanitizedData.profile?.equipmentProfile, sanitizedData.profile?.trainingEnvironment),
    equipmentSelections: normalizeEquipmentSelections(sanitizedData.profile?.equipmentSelections, sanitizedData.profile?.trainingEnvironment),
    injuryStatus: INJURY_STATUSES.includes(sanitizedData.profile?.injuryStatus) ? sanitizedData.profile.injuryStatus : "none",
    sex: SEX_OPTIONS.includes(sanitizedData.profile?.sex) ? sanitizedData.profile.sex : "",
    heightCm: Number.isFinite(Number(sanitizedData.profile?.heightCm)) ? Number(sanitizedData.profile.heightCm) : null,
    currentWeight: Number.isFinite(Number(sanitizedData.profile?.currentWeight)) ? Number(sanitizedData.profile.currentWeight) : null,
    targetWeight: Number.isFinite(Number(sanitizedData.profile?.targetWeight)) ? Number(sanitizedData.profile.targetWeight) : null,
    unitPreference: normalizeUnitPreference(sanitizedData.profile?.unitPreference),
    nutritionMode: NUTRITION_MODES.includes(sanitizedData.profile?.nutritionMode)
      ? sanitizedData.profile.nutritionMode
      : normalizeNutritionMode(
          GOAL_TYPES.includes(sanitizedData.profile?.goalType) ? sanitizedData.profile.goalType : "general_fitness",
          sanitizedData.profile?.nutritionMode
        ),
    appMode: normalizeAppMode(sanitizedData.profile?.appMode),
    moduleOrder: normalizeModuleOrder(sanitizedData.profile?.moduleOrder),
    hiddenModules: normalizeHiddenModules(sanitizedData.profile?.hiddenModules),
    exerciseGuidanceLevel: ["full", "standard", "minimal"].includes(sanitizedData.profile?.exerciseGuidanceLevel)
      ? sanitizedData.profile.exerciseGuidanceLevel
      : "standard",
    visualModelPreference: normalizeVisualModelPreference(sanitizedData.profile?.visualModelPreference),
    showWarmup: typeof sanitizedData.profile?.showWarmup === "boolean" ? sanitizedData.profile.showWarmup : true,
    showCooldown: typeof sanitizedData.profile?.showCooldown === "boolean" ? sanitizedData.profile.showCooldown : true,
    onboardingCompleted:
      typeof sanitizedData.profile?.onboardingCompleted === "boolean" ? sanitizedData.profile.onboardingCompleted : true,
    restrictedAreas: Array.isArray(sanitizedData.profile?.restrictedAreas)
      ? sanitizedData.profile.restrictedAreas.filter((area) => RESTRICTED_AREAS.includes(area))
      : []
  };
  if (normalizedProfile.birthdate) {
    normalizedProfile.ageGroup = deriveAgeGroupFromBirthdate(normalizedProfile.birthdate);
  }
  normalizedProfile.equipmentProfile = buildEquipmentProfileFromSelections(
    normalizedProfile.equipmentSelections?.length ? normalizedProfile.equipmentSelections : getDefaultEquipmentSelections(normalizedProfile.trainingEnvironment),
    normalizedProfile.trainingEnvironment
  );

  return {
    ...sanitizedData,
    goals: normalizedGoals,
    profile: normalizedProfile,
    waterIntake: Number(sanitizedData.waterIntake || 0),
    sleepHours: Number(sanitizedData.sleepHours || normalizedGoals.sleep),
    energyLevel: ["Low", "Steady", "High"].includes(sanitizedData.energyLevel) ? sanitizedData.energyLevel : "Steady",
    // Sticky, explicit flag: true only once the user has actually reported
    // recovery via /api/recovery. It must be a pure passthrough — the
    // sleepHours/energyLevel above are backfilled to defaults on every
    // read/write, so inferring "logged" from their presence would flip true
    // after the first save. The backfilled values are for internal math ONLY;
    // never present them as observed unless recoveryLogged is true.
    recoveryLogged: sanitizedData.recoveryLogged === true,
    meals: Array.isArray(sanitizedData.meals) ? sanitizedData.meals : [],
    workouts: Array.isArray(sanitizedData.workouts) ? sanitizedData.workouts.map(normalizeWorkout) : [],
    savedWorkouts: Array.isArray(sanitizedData.savedWorkouts) ? sanitizedData.savedWorkouts.map(normalizeSavedWorkout).filter(Boolean) : [],
    habits: Array.isArray(sanitizedData.habits) ? sanitizedData.habits : [],
    weeklyHistory: Array.isArray(sanitizedData.weeklyHistory) ? sanitizedData.weeklyHistory : [],
    weeklyCheckIns: Array.isArray(sanitizedData.weeklyCheckIns) ? sanitizedData.weeklyCheckIns.map(normalizeWeeklyCheckIn).filter(Boolean) : [],
    weightHistory: Array.isArray(sanitizedData.weightHistory) ? sanitizedData.weightHistory : [],
    notes: Array.isArray(sanitizedData.notes) ? sanitizedData.notes : []
  };
}

function normalizeLegacyMovementAssetRefs(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLegacyMovementAssetRefs(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeLegacyMovementAssetRefs(entryValue)])
    );
  }

  if (typeof value !== "string") {
    return value;
  }

  const legacyMatch = value.match(/^\/movements\/([a-z0-9-]+)\.svg$/i);
  if (!legacyMatch) {
    return value;
  }

  const exerciseId = legacyMatch[1].toLowerCase();
  const photoAssetPath = `/movements/${exerciseId}-photo.png`;
  const absolutePhotoAssetPath = path.join(PUBLIC_PATH, photoAssetPath.replace(/^\//, "").replaceAll("/", path.sep));

  return fs.existsSync(absolutePhotoAssetPath) ? photoAssetPath : value;
}

export function hasProcessedWebhookEvent(eventId) {
  const normalizedEventId = String(eventId || "").trim();
  if (!normalizedEventId) {
    return false;
  }

  const db = readDb();
  return db.webhookEvents.some((event) => event.id === normalizedEventId);
}

export function recordProcessedWebhookEvent(eventId, type) {
  const normalizedEventId = String(eventId || "").trim();
  if (!normalizedEventId) {
    throw new Error("Webhook event ID is required.");
  }

  const db = readDb();
  if (db.webhookEvents.some((event) => event.id === normalizedEventId)) {
    return false;
  }

  db.webhookEvents.push({
    id: normalizedEventId,
    type: String(type || "").trim() || "unknown",
    processedAt: new Date().toISOString()
  });

  if (db.webhookEvents.length > 500) {
    db.webhookEvents = db.webhookEvents.slice(-500);
  }

  writeDb(db);
  return true;
}

export function findUserByEmail(email) {
  const db = readDb();
  const user = db.users.find((entry) => entry.email === email.toLowerCase());
  return user ? normalizeStoredUser(user) : null;
}

export function findUserById(userId) {
  const db = readDb();
  const user = db.users.find((entry) => entry.id === userId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByStripeCustomerId(customerId) {
  const normalizedCustomerId = String(customerId || "").trim();
  if (!normalizedCustomerId) {
    return null;
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.stripeCustomerId === normalizedCustomerId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByStripeSubscriptionId(subscriptionId) {
  const normalizedSubscriptionId = String(subscriptionId || "").trim();
  if (!normalizedSubscriptionId) {
    return null;
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.stripeSubscriptionId === normalizedSubscriptionId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByToken(token) {
  const db = readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  const user = db.users.find((entry) => entry.id === session.userId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function createUser({ name, email, password }) {
  const db = readDb();
  const safeName = String(name || "").trim();
  const normalizedName = safeName || String(email || "").trim().split("@")[0] || "PulsePeak User";
  const normalizedEmail = email.trim().toLowerCase();

  if (db.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    tier: "free",
    planTier: ACCESS_TIERS.FREE,
    subscriptionStatus: "inactive",
    currentPeriodEnd: null,
    trialStartedAt: null,
    trialEndsAt: null,
    trialBillingChoice: null,
    trialStatus: "inactive",
    trialCanceledAt: null,
    trialConvertedAt: null,
    hasUsedTrial: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionPlanInterval: null,
    cancelAtPeriodEnd: false,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    data: createDefaultWellnessData(normalizedName)
  };

  db.users.push(user);
  writeDb(db);
  return user;
}

export function validateUser(email, password) {
  const user = findUserByEmail(email.trim());
  if (!user) {
    return null;
  }

  const attemptedHash = crypto.scryptSync(password, user.salt, 64).toString("hex");
  // Constant-time compare so a wrong password cannot be probed byte-by-byte via
  // response timing. Buffers must be equal length before timingSafeEqual.
  const attempted = Buffer.from(attemptedHash, "hex");
  const stored = Buffer.from(String(user.passwordHash || ""), "hex");
  const matches = attempted.length === stored.length && crypto.timingSafeEqual(attempted, stored);
  return matches ? normalizeStoredUser(user) : null;
}

export function createSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  db.sessions = db.sessions.filter((session) => session.userId !== userId);
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt
  });
  writeDb(db);
  return token;
}

export function clearSession(token) {
  const db = readDb();
  db.sessions = db.sessions.filter((session) => session.token !== token);
  writeDb(db);
}

export function updateUserData(userId, updater) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  const nextData = updater(normalizeWellnessData(structuredClone(db.users[index].data)));
  db.users[index].data = normalizeWellnessData(nextData);
  writeDb(db);
  return normalizeStoredUser(db.users[index]);
}

export function updateUserAccount(userId, updater) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  db.users[index] = updater(structuredClone(db.users[index]));
  writeDb(db);
  return normalizeStoredUser(db.users[index]);
}

export function sanitizeUser(user) {
  const profile = normalizeWellnessData(user.data).profile;
  const accessTier = getAccessTier(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    tier: getUserTier(user),
    accessTier,
    accessLabel: formatAccessLabel(accessTier),
    planTier: user?.planTier || accessTier,
    subscriptionStatus: getSubscriptionStatus(user),
    currentPeriodEnd: user.currentPeriodEnd || null,
    trialEndsAt: accessTier === "trial_active" ? getTrialEndsAt(user) : null,
    trialEndsLabel: accessTier === "trial_active" ? formatDateLabel(getTrialEndsAt(user)) : null,
    trialDaysRemaining: accessTier === "trial_active" ? getTrialDaysRemaining(user) : 0,
    canStartTrial: canStartTrial(user),
    trialBillingChoice: user?.trialBillingChoice || null,
    trialStatus: user?.trialStatus || "inactive",
    trialCanceledAt: user?.trialCanceledAt || null,
    trialConvertedAt: user?.trialConvertedAt || null,
    hasUsedTrial: Boolean(user?.hasUsedTrial || user?.trialStartedAt || user?.trialUsedAt),
    hasBillingProfile: Boolean(user.stripeCustomerId),
    subscriptionPlanInterval: user?.subscriptionPlanInterval || null,
    cancelAtPeriodEnd: Boolean(user?.cancelAtPeriodEnd),
    profileComplete: isProfileComplete(profile),
    onboardingCompleted: hasCompletedOnboarding(profile)
  };
}

export function getSubscriptionStatus(user) {
  return String(user?.subscriptionStatus || "inactive").toLowerCase().trim() || "inactive";
}

export function isPremiumEntitled(user) {
  const status = getSubscriptionStatus(user);
  if (getUserTier(user) === "premium" || status === "active") {
    return true;
  }
  // A trial only entitles while it is still within its window. Fail closed if the
  // local status lags Stripe (expired trial that has not yet been reconciled).
  if (status === "trialing") {
    return hasActiveTrialWindow(user);
  }
  return false;
}

function hasActiveTrialWindow(user) {
  const trialEndsAt = getTrialEndsAt(user);
  return Boolean(trialEndsAt) && new Date(trialEndsAt).getTime() > Date.now();
}

export function summarizeDashboard(data) {
  data = normalizeWellnessData(data);
  const today = new Date().toISOString().slice(0, 10);
  const workouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
  // Compute streak + insights here, while `data` is freshly normalized — some
  // downstream builders mutate data.workouts, which would starve these if run later.
  const streakStatus = buildStreakStatus(data);
  const insights = buildInsights(data, { now: Date.now() });
  const nextBestAction = buildNextBestAction(insights);
  const totals = {
    calories: (data.meals || []).reduce((sum, meal) => sum + meal.calories, 0),
    protein: (data.meals || []).reduce((sum, meal) => sum + meal.protein, 0),
    workoutMinutes: workouts.reduce((sum, workout) => sum + workout.duration, 0)
  };
  const habitSummary = (data.habits || []).map((habit) => ({
    ...habit,
    streak: calculateStreak(habit.completedDates),
    completedToday: habit.completedDates.includes(today)
  }));
  const completion = calculateCompletionScore(data, totals, habitSummary, workouts);

  const nutritionGuidance = buildNutritionPlanning(data, totals);
  const weeklyPlan = buildWeeklyPlan(data, totals, habitSummary, completion, workouts);
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const mobilityModule = buildMobilityModule({
    goalType: data.profile.goalType,
    injuryStatus: data.profile.injuryStatus,
    restrictedAreas: data.profile.restrictedAreas,
    lowRecovery,
    trainingEnvironment: data.profile.trainingEnvironment,
    planContext: {
      weeklyFocus: weeklyPlan.weeklyFocus,
      intensityDirection: weeklyPlan.suggestedWorkoutMix?.intensityGuidance,
      mobilityTarget: weeklyPlan.mobilityBlock?.weeklyTarget,
      suggestedSplits: weeklyPlan.suggestedWorkoutMix?.recommendedFocuses || weeklyPlan.suggestedWorkoutMix?.split || []
    }
  });
  const resultProjection = buildResultProjection(data, {
    totals,
    completion,
    habits: habitSummary,
    workoutStreak: calculateWorkoutStreak(workouts),
    weeklyTrend: getWeeklyTrend(data.weeklyHistory || [], completion)
  });
  const workoutEngine = buildWorkoutEngineSummary(data, weeklyPlan, workouts);

  return {
    totals,
    completion,
    // Exported streak is the canonical freeze-protected value (same as
    // streakStatus.streak) so every consumer of summary.workoutStreak — e.g. the
    // workout-completion celebration — agrees with the StreakCard on screen.
    workoutStreak: streakStatus.streak,
    streakStatus,
    personalInsights: insights,
    nextBestAction,
    recentWorkouts: workouts.slice(0, 3),
    savedWorkouts: sortSavedWorkoutsDesc(data.savedWorkouts || []),
    latestExerciseLoads: buildLatestExerciseLoads(workouts),
    exerciseHistory: buildExerciseHistory(workouts),
    habits: habitSummary,
    weeklyHistory: data.weeklyHistory,
    weeklyCheckIns: data.weeklyCheckIns,
    weightHistory: data.weightHistory,
    profile: data.profile,
    nutritionGuidance,
    mobilityModule,
    workoutEngine,
    resultProjection,
    whyThisWorks: buildWhyThisWorksBlock(data, weeklyPlan),
    activeModules: getActiveModules({ profile: data.profile, hasHabits: (data.habits || []).length > 0 }),
    insights: buildLaunchSafeCoachingTips(),
    todayFocus: buildLaunchSafeTodayFocusCard(),
    momentum: buildLaunchSafeMomentumCard(),
    weeklyPlanPreview: buildWeeklyPlanPreview(weeklyPlan),
    planSummary: buildLimitedWeeklyPlan(weeklyPlan),
    premiumPreview: {
      title: "Smarter workout execution",
      description: "Upgrade to unlock deeper split guidance, stronger exercise variety, broader mobility support, and better weekly workout decisions.",
      features: [
        "Unlimited workout logging across the week",
        "More exercise swap depth for the equipment you actually have",
        "Deeper mobility, recovery, and fueling adjustments"
      ]
    }
  };
}

function buildLaunchSafeCoachingTips() {
  return [];
}

function buildLaunchSafeTodayFocusCard() {
  return {
    title: "Launch baseline active",
    reason: "Advanced coaching is disabled for this launch baseline.",
    whyThisMatters: "Use the core workout, mobility, and library flows without coaching overlays.",
    actions: [],
    coachingEnabled: COACHING_RUNTIME_ENABLED
  };
}

function buildLaunchSafeMomentumCard() {
  return {
    title: "Launch baseline active",
    detail: "Momentum and recovery coaching are disabled for this launch baseline.",
    tone: "neutral",
    coachingEnabled: COACHING_RUNTIME_ENABLED
  };
}

export function buildLaunchSafeWeeklyCheckInState(data = null) {
  // Coaching copy stays disabled for the launch baseline, but the check-in
  // *state* must stay truthful: a submitted week is acknowledged so the UI
  // does not keep asking for a check-in that already exists.
  const currentWeekKey = getWeekKey();
  const checkIns = data && Array.isArray(data.weeklyCheckIns) ? data.weeklyCheckIns : [];
  const submittedThisWeek = checkIns.some((entry) => entry?.weekKey === currentWeekKey);
  return {
    currentWeekKey,
    submittedThisWeek,
    title: submittedThisWeek ? "This week's check-in is in" : "How did this week go?",
    summary: submittedThisWeek
      ? "Thanks — logging how the week felt keeps your training honest and your trends grounded in reality."
      : "Take a few seconds to log how the week felt — energy, recovery, and how the plan landed. It keeps your progress honest.",
    freeSummary: "Your check-ins feed the consistency score and trends on this page.",
    premiumSummary: "Your check-ins feed the consistency score and trends on this page.",
    whatWentWell: [],
    needsTightening: [],
    nextWeekAdjustments: [],
    todayConnection: "Log it, then jump into today's session from the dashboard.",
    premiumReasoning: "",
    coachingEnabled: COACHING_RUNTIME_ENABLED
  };
}

// The conversational LLM coach is owner-gated (API key/$), but the Coach page
// must never claim an "active coach" and then show a disabled placeholder. So we
// back it with the REAL deterministic insight engine — honest, evidence-based
// guidance from the user's own logged data — plus real recovery values.
export function buildLaunchSafeCoachResponse(data = {}) {
  const wellness = normalizeWellnessData(data);
  const insights = buildInsights(data, { now: Date.now() });
  const nextAction = buildNextBestAction(insights);
  const top = insights[0] || null;
  const topHabit = (wellness.habits || [])
    .map((habit) => ({ name: habit.name, streak: habit.streak || 0 }))
    .sort((a, b) => b.streak - a.streak)[0];
  // Recovery values must reflect what the user ACTUALLY logged (the sticky
  // recoveryLogged flag), not the defaults that normalization backfills.
  const recoveryLogged = wellness.recoveryLogged === true;

  return {
    coachingEnabled: COACHING_RUNTIME_ENABLED,
    coach: {
      primaryInsight: {
        category: top?.category || "neutral",
        title: top?.title || "Log a session to unlock your guidance",
        detail: top?.message || "Once you've logged a couple of workouts, PulsePeak reads your patterns and tells you the clearest next move."
      },
      whyItMatters: top?.reason || "Guidance sharpens as soon as there's real training history to read.",
      nextActions: [
        // Carry the route: an "Action" card that goes nowhere is a dead
        // affordance (owner audit F7).
        { title: nextAction.title, detail: nextAction.message, to: nextAction.to || null },
        ...insights.slice(1, 3).map((insight) => ({
          title: insight.title,
          detail: insight.message,
          to: insight.action?.to || null
        }))
      ],
      // "Keep the current rhythm going" implies a rhythm exists — for a user
      // whose only insight is the getting-started nudge, say the honest thing.
      longerTermNote:
        insights[1]?.title ||
        (top && top.category !== "activation"
          ? "Keep the current rhythm going."
          : "Keep logging sessions and your patterns sharpen."),
      planConnection: insights[1]?.message || top?.reason || "Your guidance is built from your real logged training — nothing generic."
    },
    recommendations: [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    recoveryFocus: {
      // null → the client renders an honest "Not logged yet" state instead of
      // presenting a default as an observation.
      energyLevel: recoveryLogged ? wellness.energyLevel : null,
      sleepHours: recoveryLogged ? wellness.sleepHours : null,
      topHabit: topHabit && topHabit.streak > 0
        ? `${topHabit.name} (${topHabit.streak}-day streak)`
        : null
    }
  };
}

function normalizeWeeklyCheckIn(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  return {
    id: entry.id || crypto.randomUUID(),
    weekKey: typeof entry.weekKey === "string" ? entry.weekKey : getWeekKey(entry.createdAt || new Date().toISOString()),
    createdAt: entry.createdAt || new Date().toISOString(),
    weekFeel: normalizeEnum(entry.weekFeel, ["rough", "mixed", "strong"], "mixed"),
    recoveryFeel: normalizeEnum(entry.recoveryFeel, ["low", "steady", "high"], "steady"),
    planDifficulty: normalizeEnum(entry.planDifficulty, ["too_easy", "right", "too_hard"], "right"),
    nutritionAdherence: normalizeEnum(entry.nutritionAdherence, ["off_track", "mostly_on", "locked_in"], "mostly_on"),
    sorenessIssues: normalizeEnum(entry.sorenessIssues, ["none", "manageable", "significant"], "manageable"),
    confidence: normalizeEnum(entry.confidence, ["low", "steady", "high"], "steady")
  };
}

function normalizeEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function getWeekKey(referenceDate = new Date()) {
  const localReference = new Date(referenceDate);
  const day = localReference.getDay();
  const dayOffset = day === 0 ? 6 : day - 1;
  const start = new Date(localReference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayOffset);
  return start.toISOString().slice(0, 10);
}

export function buildWeeklyCheckInState(data, { isPremium = false } = {}) {
  data = normalizeWellnessData(data);
  const checkIns = [...(data.weeklyCheckIns || [])].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const latestCheckIn = checkIns[0] || null;
  const currentWeekKey = getWeekKey();
  const currentWeekSubmitted = latestCheckIn?.weekKey === currentWeekKey;
  const weeklyTrend = getWeeklyTrend(data.weeklyHistory || [], getLatestWeeklyScore(data));
  const workoutCountThisWeek = countWeeklyLoggedWorkouts(data.workouts || []);

  if (!latestCheckIn) {
    return {
      currentWeekKey,
      submittedThisWeek: false,
      title: "Close the loop on your week",
      summary: "A 60-second weekly check-in helps PulsePeak explain what is working, what felt off, and how next week should tighten up.",
      freeSummary: "Check in once a week to keep the plan feeling responsive instead of generic.",
      premiumSummary: "Premium uses the same check-in to explain the deeper reasoning behind next week's changes.",
      whatWentWell: [],
      needsTightening: [],
      nextWeekAdjustments: [],
      todayConnection: "Your weekly reflection will help PulsePeak connect today's actions to next week's direction more clearly.",
      premiumReasoning: ""
    };
  }

  const whatWentWell = [];
  const needsTightening = [];
  const nextWeekAdjustments = [];

  if (latestCheckIn.weekFeel === "strong") {
    whatWentWell.push("The week felt strong enough to keep momentum instead of rebuilding from scratch.");
  } else if (latestCheckIn.weekFeel === "mixed") {
    whatWentWell.push("Parts of the week worked, which means the system only needs a few cleaner decisions rather than a full reset.");
  }

  if (latestCheckIn.recoveryFeel !== "low") {
    whatWentWell.push("Recovery held up well enough to support the current training rhythm.");
  } else {
    needsTightening.push("Recovery felt softer than the plan wants, so next week needs cleaner pacing.");
    nextWeekAdjustments.push("Bias recovery and mobility work earlier so training doesn't start from a hole.");
  }

  if (latestCheckIn.nutritionAdherence === "locked_in") {
    whatWentWell.push("Nutrition felt consistent, which makes the weekly plan easier to trust.");
  } else if (latestCheckIn.nutritionAdherence === "off_track") {
    needsTightening.push("Nutrition felt off track, so the app should keep fueling actions simpler and harder to miss.");
    nextWeekAdjustments.push("Keep protein and hydration actions more visible until the week feels easier to execute.");
  }

  if (latestCheckIn.planDifficulty === "too_hard") {
    needsTightening.push("The plan felt too hard, so next week should protect recovery before asking for more.");
    nextWeekAdjustments.push("Pull one session lighter and keep the week more repeatable.");
  } else if (latestCheckIn.planDifficulty === "too_easy") {
    whatWentWell.push("The current structure felt manageable enough to handle a slightly stronger push.");
    nextWeekAdjustments.push("Lean one session harder or add a little more intensity where recovery allows.");
  } else {
    whatWentWell.push("The overall training load felt about right, which makes progression easier to keep stacking.");
  }

  if (latestCheckIn.sorenessIssues === "significant") {
    needsTightening.push("Soreness or joint issues were loud enough that movement support should carry more weight next week.");
    nextWeekAdjustments.push("Keep mobility and physio-style support closer to the front of the week.");
  } else if (latestCheckIn.sorenessIssues === "manageable") {
    whatWentWell.push("Soreness stayed manageable, so the system can keep building without overreacting.");
  }

  if (latestCheckIn.confidence === "high") {
    nextWeekAdjustments.push("Carry confidence forward by keeping the plan specific, not busier.");
  } else if (latestCheckIn.confidence === "low") {
    needsTightening.push("Confidence heading into next week is low, so the plan should feel simpler and easier to follow.");
    nextWeekAdjustments.push("Make next week's first wins obvious so the week feels easier to start.");
  }

  if (weeklyTrend === "up") {
    whatWentWell.push("Your broader weekly trend is still moving in the right direction.");
  } else if (weeklyTrend === "down") {
    needsTightening.push("Your weekly trend has softened, so the next week should chase consistency before intensity.");
  }

  if (workoutCountThisWeek <= 1) {
    needsTightening.push("Training volume stayed light, so the next week should protect one minimum viable session early.");
  }

  return {
    currentWeekKey,
    submittedThisWeek: currentWeekSubmitted,
    title: currentWeekSubmitted ? "This week's reflection is in" : "Your last weekly check-in",
    summary:
      latestCheckIn.weekFeel === "strong"
        ? "The week mostly held together. PulsePeak can now lean into momentum instead of only protecting against misses."
        : latestCheckIn.weekFeel === "rough"
          ? "The week felt rough enough that the next plan should get simpler before it gets harder."
          : "The week had enough signal for PulsePeak to tighten a few things without changing everything.",
    freeSummary:
      "Free keeps the recap short so you can see what went well, what needs tightening, and the main adjustment for next week.",
    premiumSummary:
      "Premium goes further by explaining why the weekly system is adjusting and how those changes connect back to today's priorities.",
    whatWentWell: whatWentWell.slice(0, 3),
    needsTightening: needsTightening.slice(0, 3),
    nextWeekAdjustments: nextWeekAdjustments.slice(0, 3),
    todayConnection:
      latestCheckIn.nutritionAdherence === "off_track"
        ? "Today's actions should stay fuel-first so next week's plan starts from cleaner recovery."
        : latestCheckIn.recoveryFeel === "low"
          ? "Today's actions should stay recovery-first so next week's plan doesn't carry the same fatigue forward."
          : "Today's actions should protect the weekly momentum you just built instead of starting over again.",
    premiumReasoning: isPremium
      ? buildWeeklyCheckInPremiumReasoning(latestCheckIn, { weeklyTrend, workoutCountThisWeek })
      : "",
    latestCheckIn
  };
}

function buildWeeklyCheckInPremiumReasoning(checkIn, { weeklyTrend, workoutCountThisWeek }) {
  const reasons = [];
  if (checkIn.planDifficulty === "too_hard") {
    reasons.push("The weekly system will trim pressure because your reflection says the plan is outrunning recovery.");
  }
  if (checkIn.planDifficulty === "too_easy") {
    reasons.push("The weekly system can add a little more intent because the current load felt comfortable.");
  }
  if (checkIn.nutritionAdherence === "off_track") {
    reasons.push("Fueling guidance will stay more visible because nutrition felt harder to execute than training itself.");
  }
  if (checkIn.sorenessIssues === "significant") {
    reasons.push("Mobility and physio-style support should sit closer to the front of the week because soreness was more than background noise.");
  }
  if (weeklyTrend === "up") {
    reasons.push("Your trend is still climbing, so the plan can build from momentum instead of only damage control.");
  }
  if (workoutCountThisWeek <= 1) {
    reasons.push("Because training frequency stayed low, the next weekly plan should protect an early win before asking for more.");
  }
  return reasons.slice(0, 3).join(" ");
}

function getLatestWeeklyScore(data) {
  const latest = (data.weeklyHistory || []).at(-1);
  return Number.isFinite(latest?.score) ? latest.score : 0;
}

export function getWorkoutWeekWindow(referenceDate = new Date()) {
  const end = new Date(referenceDate);
  // Snap the start to midnight so the window boundary is deterministic — a
  // workout logged ~7 days ago can't flicker in/out of the count on sub-ms
  // timing between calls within the same request.
  const start = new Date(end.getTime() - 7 * DAY_MS);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function countWeeklyLoggedWorkouts(workouts = [], referenceDate = new Date()) {
  const { start, end } = getWorkoutWeekWindow(referenceDate);
  return (workouts || [])
    .map(normalizeWorkout)
    .filter((workout) => {
      const loggedAt = new Date(workout.loggedAt);
      return loggedAt >= start && loggedAt <= end;
    }).length;
}

// Real minutes trained this week — the sum of logged session durations inside
// the current week window. Honest by construction: no logged sessions → 0.
export function sumWeeklyLoggedMinutes(workouts = [], referenceDate = new Date()) {
  const { start, end } = getWorkoutWeekWindow(referenceDate);
  return (workouts || [])
    .map(normalizeWorkout)
    .filter((workout) => {
      const loggedAt = new Date(workout.loggedAt);
      return loggedAt >= start && loggedAt <= end;
    })
    .reduce((total, workout) => total + (Number.isFinite(Number(workout.duration)) ? Number(workout.duration) : 0), 0);
}

export function buildWorkoutAccess(user) {
  const workouts = normalizeWellnessData(user?.data).workouts || [];
  const weeklyLogged = countWeeklyLoggedWorkouts(workouts);
  const accessTier = getAccessTier(user);
  const premiumUnlimited = accessTier === ACCESS_TIERS.PREMIUM;
  const trialUnlimited = accessTier === ACCESS_TIERS.TRIAL;
  const fullLoggingAccess = premiumUnlimited || trialUnlimited;
  const { end } = getWorkoutWeekWindow();
  return {
    accessTier,
    accessLabel: formatAccessLabel(accessTier),
    premiumUnlimited,
    trialUnlimited,
    fullLoggingAccess,
    canStartTrial: canStartTrial(user),
    trialEndsAt: accessTier === "trial_active" ? getTrialEndsAt(user) : null,
    trialEndsLabel: accessTier === "trial_active" ? formatDateLabel(getTrialEndsAt(user)) : null,
    trialDaysRemaining: accessTier === "trial_active" ? getTrialDaysRemaining(user) : 0,
    weeklyLogged,
    limit: fullLoggingAccess ? null : FREE_WEEKLY_WORKOUT_LIMIT,
    remaining: fullLoggingAccess ? null : Math.max(0, FREE_WEEKLY_WORKOUT_LIMIT - weeklyLogged),
    locked: !fullLoggingAccess && weeklyLogged >= FREE_WEEKLY_WORKOUT_LIMIT,
    resetAt: end.toISOString(),
    resetLabel: "the rolling 7-day window clears",
    windowLabel: "last 7 days"
  };
}

export function buildWeeklyPlan(data, totals, habits, completion, workouts = []) {
  data = normalizeWellnessData(data);
  const profile = data.profile;
  // Sticky flag (survives normalization) — recovery was actually reported.
  const recoveryLogged = data.recoveryLogged === true;
  const workoutStreak = calculateWorkoutStreak(workouts);
  const recentWorkouts = workouts.slice(0, 5);
  const recentWorkoutDays = new Set(recentWorkouts.map((workout) => workout.loggedAt?.slice(0, 10)).filter(Boolean)).size;
  const strengthCount = recentWorkouts.filter((workout) => workout.type === "strength").length;
  const cardioCount = recentWorkouts.filter((workout) => workout.type === "cardio").length;
  const mobilityCount = recentWorkouts.filter((workout) => workout.type === "mobility").length;
  const gymCount = recentWorkouts.filter((workout) => workout.environment === "gym").length;
  const homeCount = recentWorkouts.filter((workout) => workout.environment === "home").length;
  const goalBlueprint = getGoalBlueprint(profile.goalType);
  const activeModules = getActiveModules({ profile, hasHabits: habits.length > 0 });
  const activeModuleIds = new Set(activeModules.map((module) => module.id));
  const nutritionMode = profile.nutritionMode;
  const nutritionEnabled = activeModuleIds.has("nutrition");
  const hydrationEnabled = activeModuleIds.has("hydration");
  const mobilityEnabled = activeModuleIds.has("mobility");
  const habitsEnabled = activeModuleIds.has("habits");
  const preferredEnvironment =
    profile.trainingEnvironment === "hybrid"
      ? gymCount === homeCount
        ? "both"
        : gymCount > homeCount
          ? "gym"
          : "home"
      : profile.trainingEnvironment;
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  // A nutrition "gap" is only meaningful once the user has actually logged
  // something to fall short against. Before their first meal (every new user)
  // the gap equals the whole goal — that is absence-of-data, not a deficit, so
  // it must not drive plan copy or the weekly focus.
  const nutritionTracked = profile.nutritionMode !== "off" && (totals.protein > 0 || totals.calories > 0);
  const completedHabitCount = habits.filter((habit) => habit.completedToday).length;
  const habitCompletionRate = habits.length ? completedHabitCount / habits.length : 0;
  const topHabit = [...habits].sort((left, right) => right.streak - left.streak)[0];
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const highRecovery = data.sleepHours >= data.goals.sleep - 0.25 && data.energyLevel === "High";
  const weeklyTrend = getWeeklyTrend(data.weeklyHistory || [], completion);
  const proteinCompletion = totals.protein / data.goals.protein;
  const hydrationCompletion = data.waterIntake / data.goals.water;
  const calorieCompletion = totals.calories / data.goals.calories;
  const nutritionPlanning = buildNutritionPlanning(data, totals);
  const goalDrivenSessions = Math.min(6, Math.max(2, Math.round(data.goals.workoutMinutes / 18)));
  const recentTrainingBaseline = recentWorkoutDays >= 4 ? 4 : recentWorkoutDays >= 2 ? 3 : 2;
  const ageRecoveryPenalty = profile.ageGroup === "50+" ? 1 : profile.ageGroup === "40-49" ? 0.5 : 0;
  const injuryPenalty = profile.injuryStatus === "active_injury" ? 1 : profile.injuryStatus === "minor" ? 0.5 : 0;
  const experienceBoost = profile.experienceLevel === "advanced" ? 0.5 : profile.experienceLevel === "beginner" ? -0.25 : 0;
  const recommendedSessions = Math.max(
    2,
    Math.min(
      6,
      Math.round(goalDrivenSessions + goalBlueprint.sessionBias + experienceBoost - ageRecoveryPenalty - injuryPenalty)
    )
  );
  const finalSessions = lowRecovery && recommendedSessions > 4 ? recommendedSessions - 1 : recommendedSessions;
  const intensity = getIntensityGuidance({
    goalType: profile.goalType,
    lowRecovery,
    highRecovery,
    injuryStatus: profile.injuryStatus,
    experienceLevel: profile.experienceLevel
  });
  const weeklyFocus = getWeeklyFocus({
    profile,
    proteinGap,
    waterGap,
    nutritionTracked,
    // Distinguish a brand-new user (nothing to "rebuild") from a returning one
    // who has slipped, so the weekly focus doesn't imply lost consistency that
    // never existed.
    hasTrainingHistory: recentWorkoutDays > 0 || (data.weeklyHistory?.length || 0) > 0,
    lowRecovery,
    weeklyTrend,
    completion
  });
  const workoutMix = buildWorkoutMix({
    goalType: profile.goalType,
    finalSessions,
    preferredEnvironment,
    lowRecovery,
    injuryStatus: profile.injuryStatus,
    strengthCount,
    cardioCount,
    mobilityCount
  });
  const restrictionNote = buildRestrictionNote(profile.restrictedAreas);
  const cadence =
    preferredEnvironment === "both"
      ? "Blend gym and home sessions based on your schedule, energy, and equipment access."
      : `Lean on ${preferredEnvironment} sessions this week so the plan matches your actual setup.`;
  const focusReason =
    nutritionTracked && proteinGap >= 25
      ? `Your current protein intake is ${proteinGap}g short of goal, so better fueling is the fastest way to improve recovery quality.`
      : nutritionTracked && waterGap >= 0.5
        ? `Hydration is still ${waterGap.toFixed(1)}L short, so the week needs cleaner execution before extra intensity.`
        : lowRecovery
          ? "Sleep, energy, or injury context says this week should protect progress instead of forcing volume."
          : `${formatGoalType(profile.goalType)} is your main goal, so the weekly structure now leans toward ${goalBlueprint.focusPhrase}.`;
  const recoveryEmphasis = getRecoveryEmphasis({
    profile,
    lowRecovery,
    highRecovery
  });
  const nutritionEmphasis = nutritionEnabled
    ? getNutritionEmphasis({
    profile,
    data,
    proteinGap,
    calorieGap,
    waterGap,
    nutritionMode,
    nutritionPlanning
  })
    : null;
  const hydrationFloor = Number(
    Math.max(data.goals.water, nutritionPlanning.hydrationLiters, profile.goalType === "fat_loss" ? 3 : data.goals.water).toFixed(1)
  );
  const coachNote =
    completedHabitCount === 0
      ? `Use one tiny daily habit to make a ${formatGoalType(profile.goalType).toLowerCase()} week easier to sustain.`
      : `Your habit base is already supporting ${formatGoalType(profile.goalType).toLowerCase()}, so this week is about cleaner execution instead of adding chaos.`;
  const mobilityBlock = mobilityEnabled
    ? buildMobilityPlan({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    restrictedAreas: profile.restrictedAreas,
    lowRecovery,
    workoutEnvironment: preferredEnvironment
  })
    : null;
  const adaptiveSignals = [
    `Goal signal: ${formatGoalType(profile.goalType)} with ${profile.experienceLevel} experience in a ${profile.trainingEnvironment} setup.`,
    nutritionPlanning.bodyProfileNote,
    workouts.length
      ? `Training baseline: ${recentWorkoutDays} recent workout day${recentWorkoutDays === 1 ? "" : "s"} with a ${workoutStreak}-day streak.`
      : `Training baseline: no sessions logged yet — the plan starts from your goal and setup.`,
    // Only report a recovery reading the user actually gave us.
    recoveryLogged
      ? `Recovery signal: ${data.sleepHours.toFixed(1)} hours of sleep, ${data.energyLevel.toLowerCase()} energy, and ${profile.injuryStatus === "none" ? "no active injury flags." : `${profile.injuryStatus.replace("_", " ")} status${restrictionNote ? ` around ${restrictionNote}` : ""}.`}`
      : `Recovery signal: ${profile.injuryStatus === "none" ? "log sleep and energy to fold recovery into the plan." : `${profile.injuryStatus.replace("_", " ")} status${restrictionNote ? ` around ${restrictionNote}` : ""}; log sleep and energy to refine it further.`}`
  ];
  const hydrationTracked = data.waterIntake > 0;
  const executionPriorities = [
    nutritionEnabled
      ? nutritionTracked && proteinGap >= 25
        ? `Hit a daily protein floor of at least ${Math.max(data.goals.protein - 20, 100)}g before treating calories as done.`
        : `Keep protein near your ${nutritionPlanning.proteinRangeLabel} so ${goalBlueprint.outputPhrase}.`
      : `Focus first on session quality and recovery since nutrition tracking is currently turned down.`,
    hydrationEnabled
      ? hydrationTracked && waterGap >= 0.5
        ? `Treat ${hydrationFloor.toFixed(1)}L as the daily floor and close the current hydration gap earlier in the day.`
        : `Keep hydration above ${Math.max(hydrationFloor - 0.3, 1.8).toFixed(1)}L before the evening.`
      : mobilityEnabled
        ? `Use the mobility block as the easiest recovery bridge between harder sessions.`
        : `Keep recovery inputs updated so the plan can keep matching how the week actually feels.`,
    habitsEnabled
      ? topHabit
        ? `Use "${topHabit.name}" as the anchor habit that keeps the week from slipping.`
        : "Pair each session with one small daily habit so the plan stays easier to follow."
      : `Use one fixed training slot this week so execution stays repeatable.`
  ];
  if (nutritionEnabled && nutritionPlanning.mealDirection.length) {
    executionPriorities.splice(1, 0, nutritionPlanning.mealDirection[0]);
  }
  const workoutRationale = getWorkoutRationale({
    profile,
    strengthCount,
    cardioCount,
    mobilityCount,
    restrictionNote
  });
  // "Fragile consistency" is a claim about the user's history — never assert it
  // for someone who simply hasn't started yet (no completed habit days).
  const hasHabitHistory = (habits || []).some(
    (habit) => (habit.streak || 0) > 0 || (Array.isArray(habit.completedDates) && habit.completedDates.length > 0)
  );
  const habitAnchor = !hasHabitHistory
    ? `Anchor the week with ${topHabit?.name || "one small daily habit"} — a couple of check-ins is all it takes to start a streak.`
    : habitCompletionRate >= 0.66
      ? `Your habits are already holding together, so protect that with ${topHabit?.name || "one repeatable daily routine"} every day.`
      : `Your habit consistency has slipped, so use ${topHabit?.name || "one small daily habit"} as the anchor to rebuild it this week.`;
  const premiumReason = buildWeeklyPlanPremiumReason({
    proteinGap,
    waterGap,
    nutritionTracked,
    hydrationTracked,
    lowRecovery,
    weeklyTrend,
    habitCompletionRate,
    hasHabitHistory,
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus
  });
  const featuredMovements = selectFeaturedMovements({
    goalType: profile.goalType,
    preferredEnvironment,
    injuryStatus: profile.injuryStatus,
    restrictedAreas: profile.restrictedAreas,
    mobilityEnabled
  });
  const resultProjection = buildResultProjection(data, {
    totals,
    completion,
    habits,
    workoutStreak,
    weeklyTrend
  });
  const whyThisWorks = buildWhyThisWorksBlock(data, {
    workoutCadence: `${finalSessions} training sessions across the week`,
    nutritionEmphasis,
    recoveryEmphasis
  });

  return {
    weeklyFocus,
    focusReason,
    workoutCadence: `${finalSessions} training sessions across the week`,
    goalProfile: {
      goalType: profile.goalType,
      label: formatGoalType(profile.goalType),
      ageGroup: profile.ageGroup,
      birthdate: profile.birthdate,
      experienceLevel: profile.experienceLevel,
      trainingEnvironment: profile.trainingEnvironment,
      equipmentProfile: profile.equipmentProfile,
      injuryStatus: profile.injuryStatus,
      restrictedAreas: profile.restrictedAreas,
      sex: profile.sex,
      unitPreference: profile.unitPreference,
      heightCm: profile.heightCm,
      currentWeight: profile.currentWeight,
      targetWeight: profile.targetWeight
    },
    suggestedWorkoutMix: {
      environment: preferredEnvironment,
      equipmentProfile: profile.equipmentProfile,
      split: workoutMix,
      recommendedFocuses: getSuggestedWorkoutFocuses({
        goalType: profile.goalType,
        injuryStatus: profile.injuryStatus,
        lowRecovery
      }).map((focusId) => formatWorkoutFocus(focusId)),
      intensityGuidance: intensity,
      rationale: `${workoutRationale} ${cadence}`,
      featuredMovements
    },
    recoveryEmphasis,
    nutritionMode,
    nutritionEmphasis,
    nutritionTargets: nutritionEnabled
      ? {
          calorieRangeLabel: nutritionPlanning.calorieRangeLabel,
          proteinRangeLabel: nutritionPlanning.proteinRangeLabel,
          hydrationTargetLabel: nutritionPlanning.hydrationTargetLabel,
          why: nutritionPlanning.why,
          mealDirection: nutritionPlanning.mealDirection,
          todaysActions: nutritionPlanning.todaysActions,
          templates: nutritionPlanning.templates,
          targetWeightNote: nutritionPlanning.targetWeightNote
        }
      : null,
    hydrationEmphasis: hydrationEnabled ? `Treat ${hydrationFloor.toFixed(1)}L as the non-negotiable hydration floor each day.` : null,
    mobilityBlock,
    coachNote,
    adaptiveSignals,
    executionPriorities,
    habitAnchor,
    weeklyRationale: [
      focusReason,
      `Goal match: your current profile points to ${finalSessions} structured sessions centered on ${goalBlueprint.focusPhrase}.`,
      restrictionNote
        ? `Movement guardrail: the plan keeps ${restrictionNote} in mind so training stays realistic instead of ignoring your current limits.`
        : "Movement guardrail: the plan keeps your current setup and recovery profile in mind instead of defaulting to a generic split.",
      weeklyTrend === "up"
        ? "Momentum is building, so the plan preserves it with structure instead of forcing a reset."
        : "Recent momentum is mixed, so the plan simplifies the week into easier wins you can repeat."
    ],
    premiumReason,
    resultProjection,
    whyThisWorks,
    previewNote: getWeeklyPlanPreviewNote({
      proteinCompletion,
      hydrationCompletion,
      calorieCompletion,
      nutritionTracked,
      hydrationTracked,
      lowRecovery,
      goalType: profile.goalType
    }),
    activeModules
  };
}

function buildWeeklyPlanPreview(plan) {
  const highlightNote = plan.mobilityBlock?.weeklyTarget || plan.nutritionTargets?.proteinRangeLabel || plan.previewNote;
  return {
    title: "Personalized Weekly Plan",
    badge: "Premium feature",
    teaser: `${plan.weeklyFocus} with ${plan.workoutCadence.toLowerCase()} tuned for ${plan.goalProfile?.label?.toLowerCase() || "your current goal"}.`,
    highlights: [
      plan.workoutCadence,
      plan.suggestedWorkoutMix.split[0],
      highlightNote
    ],
    premiumHighlights: [
      plan.suggestedWorkoutMix.intensityGuidance,
      plan.executionPriorities[0],
      plan.executionPriorities[1],
      plan.mobilityBlock?.title || plan.habitAnchor
    ],
    premiumReason: plan.premiumReason,
    premiumTeaser: `${plan.weeklyFocus} with a plan that adjusts around your goal, recovery, training history, mobility needs, and consistency gaps.`,
    lockedPreviewLabel: "Free preview"
  };
}

export function buildLimitedWeeklyPlan(plan) {
  return {
    weeklyFocus: plan.weeklyFocus,
    focusReason: plan.focusReason,
    goalProfile: plan.goalProfile,
    workoutCadence: plan.workoutCadence,
    activeModules: plan.activeModules,
    nutritionMode: plan.nutritionMode,
    resultProjection: plan.resultProjection,
    whyThisWorks: plan.whyThisWorks,
    suggestedWorkoutMix: {
      environment: plan.suggestedWorkoutMix.environment,
      split: plan.suggestedWorkoutMix.split.slice(0, 2),
      intensityGuidance: plan.suggestedWorkoutMix.intensityGuidance,
      featuredMovements: (plan.suggestedWorkoutMix.featuredMovements || []).slice(0, 2)
    },
    nutritionEmphasis: plan.nutritionEmphasis,
    nutritionTargets: plan.nutritionTargets
      ? {
          calorieRangeLabel: plan.nutritionTargets.calorieRangeLabel,
          proteinRangeLabel: plan.nutritionTargets.proteinRangeLabel,
          hydrationTargetLabel: plan.nutritionTargets.hydrationTargetLabel,
          todayDirection: plan.nutritionTargets.todayDirection
            ? {
                title: plan.nutritionTargets.todayDirection.title,
                summary: plan.nutritionTargets.todayDirection.summary,
                freeSteps: (plan.nutritionTargets.todayDirection.freeSteps || []).slice(0, 2)
              }
            : null,
          mealDirection: (plan.nutritionTargets.mealDirection || []).slice(0, 2),
          todaysActions: (plan.nutritionTargets.todaysActions || []).slice(0, 2),
          templates: (plan.nutritionTargets.templates || []).slice(0, 2)
        }
      : null,
    hydrationEmphasis: plan.hydrationEmphasis,
    mobilityBlock: plan.mobilityBlock
      ? {
          title: plan.mobilityBlock.title,
          reason: plan.mobilityBlock.reason,
          weeklyTarget: plan.mobilityBlock.weeklyTarget,
          warmup: (plan.mobilityBlock.warmup || []).slice(0, 1),
          cooldown: (plan.mobilityBlock.cooldown || []).slice(0, 1)
        }
      : null,
    previewNote: plan.previewNote,
    coachNote: plan.coachNote,
    premiumReason: plan.premiumReason
  };
}

function buildWorkoutEngineSummary(data, weeklyPlan, workouts = []) {
  const profile = data.profile;
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const planSuggestedFocuses = weeklyPlan?.suggestedWorkoutMix?.recommendedFocuses || [];
  const suggestedFocuses = planSuggestedFocuses.length
    ? planSuggestedFocuses.map((focusLabel) => normalizeFocusLabelToId(focusLabel)).filter(Boolean)
    : getSuggestedWorkoutFocuses({
        goalType: profile.goalType,
        injuryStatus: profile.injuryStatus,
        lowRecovery
      });
  const recentFocuses = workouts
    .map((workout) => workout.focus)
    .filter(Boolean)
    .slice(0, 3)
    .map((focusId) => formatWorkoutFocus(focusId));
  const recommendedFocus = suggestedFocuses[0];
  const recentMatchDays = findDaysSinceFocus(workouts, recommendedFocus);
  const mostRecentFocus = workouts.find((workout) => workout.focus)?.focus || null;

  return {
    trainingLocation: profile.trainingEnvironment,
    equipmentProfile: profile.equipmentProfile,
    recommendedFocus,
    recommendedFocusLabel: formatWorkoutFocus(recommendedFocus),
    alternateFocusLabels: suggestedFocuses.slice(1, 4).map((focusId) => formatWorkoutFocus(focusId)),
    currentSplitSummary:
      weeklyPlan?.suggestedWorkoutMix?.recommendedFocuses?.length
        ? weeklyPlan.suggestedWorkoutMix.recommendedFocuses.join(" · ")
        : weeklyPlan?.suggestedWorkoutMix?.split?.join(" · "),
    recommendationReason:
      profile.injuryStatus !== "none"
        ? "You're working around something right now, so today stays kind to your body — cleaner movements and easier recovery, nothing that pushes the injury."
        : lowRecovery
          ? "You're a little low on recovery today, so this keeps the week moving without grinding you down — enough to make progress, not enough to dig a hole."
          : recentMatchDays === 0
            ? `You already trained ${formatWorkoutFocus(recommendedFocus)} today — so instead of a repeat, today mixes up the movements to keep your ${formatGoalType(profile.goalType).toLowerCase()} goal moving and the session feeling fresh.`
            : `Your ${formatGoalType(profile.goalType).toLowerCase()} goal is driving the week, so today picks the split that best fits your setup and keeps everything moving in balance.`,
    recentFocuses,
    continuityNote:
      typeof recentMatchDays === "number"
        ? recentMatchDays === 0
          ? `${formatWorkoutFocus(recommendedFocus)} was already trained today, so the engine is leaning on exercise variety instead of serving the same workout again.`
          : `Last trained: ${formatWorkoutFocus(recommendedFocus)} ${recentMatchDays === 1 ? "yesterday" : `${recentMatchDays} days ago`}.`
        : `${formatWorkoutFocus(recommendedFocus)} has not been logged recently, so it has room to become the right anchor session now.`,
    recentRotationNote:
      mostRecentFocus && mostRecentFocus === recommendedFocus
        ? "Today keeps the same split priority, but should rotate the movement mix enough to stay fresh."
        : "Today leans toward a smarter split rotation based on what has and has not been trained recently."
  };
}

function normalizeFocusLabelToId(value) {
  const map = {
    Push: "push",
    Pull: "pull",
    Legs: "legs",
    "Chest + triceps": "chest_triceps",
    "Back + biceps": "back_biceps",
    Shoulders: "shoulders",
    "Upper body": "upper_body",
    "Lower body": "lower_body",
    "Full body": "full_body",
    "Mobility / recovery day": "mobility_recovery"
  };
  return map[value] || null;
}

function findDaysSinceFocus(workouts, focus) {
  if (!focus) {
    return null;
  }

  const matchedWorkout = workouts.find((workout) => workout.focus === focus && workout.loggedAt);
  if (!matchedWorkout) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - new Date(matchedWorkout.loggedAt).getTime()) / DAY_MS));
}

function getGoalBlueprint(goalType) {
  const map = {
    strength: {
      sessionBias: 0,
      focusPhrase: "lower-rep strength work and heavier primary lifts",
      outputPhrase: "higher-load training can recover well"
    },
    athletic_performance: {
      sessionBias: 0,
      focusPhrase: "mixed performance work plus mobility support",
      outputPhrase: "power, conditioning, and movement quality all stay covered"
    },
    bodybuilding: {
      sessionBias: 0.5,
      focusPhrase: "volume, muscle targeting, and repeatable upper-lower work",
      outputPhrase: "higher training volume still feels recoverable"
    },
    fat_loss: {
      sessionBias: 1,
      focusPhrase: "higher frequency training with a calorie-burn bias",
      outputPhrase: "higher-frequency sessions do not feel flat"
    },
    mobility: {
      sessionBias: -1,
      focusPhrase: "movement quality, lower intensity, and daily mobility",
      outputPhrase: "mobility work actually supports your day-to-day movement"
    },
    injury_recovery: {
      sessionBias: -1,
      focusPhrase: "safe low-load work that protects the irritated area",
      outputPhrase: "healing stays on track without losing all structure"
    },
    active_aging: {
      sessionBias: -0.5,
      focusPhrase: "joint-friendly strength work with extra recovery support",
      outputPhrase: "joint-friendly training stays consistent"
    },
    general_fitness: {
      sessionBias: 0,
      focusPhrase: "balanced training and repeatable weekly structure",
      outputPhrase: "balanced training stays easy to repeat"
    }
  };

  return map[goalType] || map.general_fitness;
}

function formatGoalType(goalType) {
  const labels = {
    strength: "Strength",
    athletic_performance: "Athletic performance",
    bodybuilding: "Bodybuilding",
    fat_loss: "Fat loss",
    general_fitness: "General fitness",
    mobility: "Mobility",
    injury_recovery: "Injury recovery",
    active_aging: "Active aging"
  };

  return labels[goalType] || "General fitness";
}

function getIntensityGuidance({ goalType, lowRecovery, highRecovery, injuryStatus, experienceLevel }) {
  if (injuryStatus === "active_injury") {
    return "Keep every session low-load and pain-aware while rebuilding confidence.";
  }
  if (goalType === "mobility") {
    return "Keep intensity low and prioritize movement quality over workload.";
  }
  if (goalType === "injury_recovery") {
    return "Keep intensity conservative and let movement quality lead the week.";
  }
  if (lowRecovery) {
    return "Keep intensity moderate, trim volume slightly, and lean on mobility work.";
  }
  if (goalType === "strength") {
    return highRecovery ? "Push one heavier strength day and keep the rest clean and technical." : "Use heavier top sets, then keep assistance work controlled.";
  }
  if (goalType === "bodybuilding") {
    return "Keep most work in a moderate effort range so you can accumulate cleaner volume.";
  }
  if (goalType === "fat_loss") {
    return "Keep sessions brisk and repeatable instead of chasing all-out fatigue.";
  }
  if (goalType === "athletic_performance") {
    return "Use one faster or more explosive day, then balance it with mobility and recovery.";
  }
  if (goalType === "active_aging") {
    return "Stay moderate and joint-friendly so recovery quality stays high all week.";
  }
  return experienceLevel === "advanced"
    ? "Stay mostly moderate with one harder effort."
    : "Stay moderate and focus on repeatable execution.";
}

function buildWorkoutMix({ goalType, finalSessions, preferredEnvironment, lowRecovery, injuryStatus, strengthCount, cardioCount, mobilityCount }) {
  const recommendedFocuses = getSuggestedWorkoutFocuses({ goalType, injuryStatus, lowRecovery }).map((focusId) => formatWorkoutFocus(focusId));
  const anchorFocus = recommendedFocuses[0] || "Full body";
  const secondaryFocus = recommendedFocuses[1] || "Upper body";
  const tertiaryFocus = recommendedFocuses[2] || "Mobility / recovery day";
  const homeSuffix = preferredEnvironment === "home" ? " at home" : "";

  if (goalType === "mobility") {
    return [
      "Mobility / recovery day",
      `Technique-based full body session${homeSuffix}`,
      "Easy walk or low-stress cardio block"
    ];
  }

  if (goalType === "injury_recovery") {
    return [
      "Mobility / recovery day",
      "Pain-aware upper or lower session",
      "Optional easy conditioning block"
    ];
  }

  if (goalType === "fat_loss") {
    return [
      `${anchorFocus} as the anchor training split`,
      `${secondaryFocus} when you want a second lifting day`,
      tertiaryFocus
    ];
  }

  if (goalType === "athletic_performance") {
    return [
      `${anchorFocus} for power and strength`,
      `${secondaryFocus} when speed or output needs to lead`,
      tertiaryFocus
    ];
  }

  if (goalType === "active_aging") {
    return [
      `${anchorFocus} as the main training day`,
      `${secondaryFocus} when you want extra volume`,
      tertiaryFocus
    ];
  }

  return [
    `${anchorFocus} as the main split`,
    `${secondaryFocus} as the second option`,
    tertiaryFocus === "Mobility / recovery day" ? `${tertiaryFocus}${homeSuffix}` : tertiaryFocus
  ];
}

function getRecoveryEmphasis({ profile, lowRecovery, highRecovery }) {
  if (profile.injuryStatus === "active_injury") {
    return "Bias the week toward pain-aware movement, lower-load work, and enough recovery between sessions to keep symptoms quiet.";
  }
  if (profile.goalType === "active_aging") {
    return "Protect sleep, joints, and session spacing so each workout leaves you feeling better instead of more beat up.";
  }
  if (profile.ageGroup === "50+") {
    return "Give yourself more room between harder sessions and use mobility work to keep recovery quality high.";
  }
  if (lowRecovery) {
    return "Bias your week toward sleep, lower-impact sessions, and at least two deliberate mobility blocks.";
  }
  if (highRecovery) {
    return "Recovery is strong enough to support one harder session, but keep the easy days easy.";
  }
  return "Protect your sleep routine and use mobility work to keep recovery steady between harder sessions.";
}

function buildNutritionPlanning(data, totals) {
  const profile = data.profile;
  const unitPreference = normalizeUnitPreference(profile.unitPreference);
  const age = getAgeFromBirthdate(profile.birthdate);
  const currentWeightLb = Number(profile.currentWeight || data.weightHistory?.[data.weightHistory.length - 1]?.weight || 0);
  const currentWeightKg = poundsToKilograms(currentWeightLb || 0);
  const targetWeightLb = Number(profile.targetWeight || 0);
  const baseGoalProteinMultiplier =
    profile.goalType === "bodybuilding"
      ? [0.8, 1]
      : profile.goalType === "strength" || profile.goalType === "athletic_performance"
        ? [0.75, 0.95]
        : profile.goalType === "fat_loss"
          ? [0.8, 1]
          : profile.goalType === "injury_recovery"
            ? [0.75, 0.9]
            : [0.65, 0.85];
  const proteinMin = currentWeightLb ? Math.round(currentWeightLb * baseGoalProteinMultiplier[0]) : Math.max(data.goals.protein - 20, 110);
  const proteinMax = currentWeightLb ? Math.round(currentWeightLb * baseGoalProteinMultiplier[1]) : Math.max(data.goals.protein, proteinMin + 20);
  const trainingBias = data.goals.workoutMinutes >= 70 ? 1.55 : data.goals.workoutMinutes >= 45 ? 1.45 : 1.35;
  const sexOffset = profile.sex === "male" ? 5 : profile.sex === "female" ? -161 : -78;
  const estimatedMaintenance = currentWeightKg && profile.heightCm && age
    ? Math.round((10 * currentWeightKg + 6.25 * Number(profile.heightCm) - 5 * age + sexOffset) * trainingBias)
    : null;
  const calorieAdjustment =
    profile.goalType === "fat_loss"
      ? -300
      : profile.goalType === "bodybuilding"
        ? 180
        : profile.goalType === "strength" || profile.goalType === "athletic_performance"
          ? 80
          : profile.goalType === "mobility" || profile.goalType === "injury_recovery"
            ? -50
            : 0;
  const calorieCenter = estimatedMaintenance ? estimatedMaintenance + calorieAdjustment : data.goals.calories;
  const calorieRangeLabel = `${Math.max(1400, calorieCenter - 150)}-${Math.max(1550, calorieCenter + 150)} kcal`;
  const hydrationLiters = Number(
    Math.max(
      data.goals.water,
      currentWeightKg ? currentWeightKg * 0.033 + (data.goals.workoutMinutes >= 45 ? 0.45 : 0.25) : data.goals.water
    ).toFixed(1)
  );
  const proteinRangeLabel = `${proteinMin}-${proteinMax} g`;
  const hydrationTargetLabel = formatHydration(hydrationLiters, unitPreference);
  const targetWeightNote =
    targetWeightLb && currentWeightLb && Math.abs(targetWeightLb - currentWeightLb) >= 3
      ? targetWeightLb < currentWeightLb
        ? `A slower cut toward ${Math.round(targetWeightLb)} lb is realistic if recovery and protein stay steady.`
        : `A steady build toward ${Math.round(targetWeightLb)} lb makes more sense if training quality and appetite stay strong.`
      : null;
  const why =
    estimatedMaintenance
      ? `These are rough training targets based on your age, height, current weight, selected goal, and how hard the week is meant to be.`
      : `These are practical starting targets shaped by your current goal, training setup, and the goals already saved in PulsePeak.`;
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(hydrationLiters - Number(data.waterIntake || 0), 0);
  const mealDirection = buildMealDirection({
    profile,
    totals,
    data,
    hydrationLiters,
    proteinMin,
    proteinGap,
    unitPreference
  });
  const todayDirection = buildTodayNutritionDirection({
    profile,
    proteinGap,
    calorieGap,
    waterGap,
    hydrationLiters,
    unitPreference
  });
  const todaysActions = buildNutritionExecutionPlan({
    profile,
    totals,
    goals: data.goals,
    waterIntake: data.waterIntake,
    hydrationLiters,
    proteinGap,
    unitPreference
  });
  const templates = buildNutritionTemplates({
    profile,
    calorieGap,
    proteinGap,
    waterGap,
    unitPreference
  });

  return {
    calorieRangeLabel,
    proteinRangeLabel,
    hydrationLiters,
    hydrationTargetLabel,
    why,
    todayDirection,
    mealDirection,
    todaysActions,
    templates,
    targetWeightNote,
    bodyProfileNote:
      currentWeightLb && profile.heightCm
        ? `Body profile: ${formatWeight(currentWeightLb, unitPreference)} at ${profile.unitPreference === "metric" ? `${Math.round(profile.heightCm)} cm` : `${Math.round(profile.heightCm / 2.54)} in`} with ${profile.sex ? profile.sex.replace("_", " ") : "unspecified"} training estimates.`
        : "Body profile: add birthdate, height, weight, and sex to tighten nutrition and recovery guidance further."
  };
}

function buildTodayNutritionDirection({ profile, proteinGap, calorieGap, waterGap, hydrationLiters, unitPreference }) {
  const hydrationServing = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";

  if (proteinGap >= 35) {
    return {
      title: "Build the day around protein first",
      summary: `You still have roughly ${Math.round(proteinGap)}g of protein to close, so the easiest win is one protein-heavy meal early plus one simple gap-fix later.`,
      freeSteps: [
        "Start with a 30-40g protein breakfast or lunch.",
        "Keep one shake, yogurt bowl, or turkey wrap ready in case the gap is still open tonight."
      ],
      premiumSteps: [
        "Put the highest-protein meal before the busiest part of the day so the gap does not drag into the evening.",
        "If you train later, use a shake or yogurt + fruit within an hour after training instead of relying on a big catch-up dinner.",
        "Keep hydration paired with that meal so recovery quality rises with the same action."
      ]
    };
  }

  if (profile.nutritionMode === "full" && calorieGap >= 350) {
    return {
      title: "Use one anchor meal to close the calorie gap cleanly",
      summary: "You do not need a perfect day. One balanced meal with protein, carbs, and fruit will move the day back toward target quickly.",
      freeSteps: [
        "Use one balanced anchor meal instead of grazing late.",
        "Keep protein in that meal so calories and recovery move together."
      ],
      premiumSteps: [
        "Place the anchor meal after training or in the part of the day where appetite is strongest.",
        "Use easier calories like rice, oats, bagels, or fruit if the day already got away from you.",
        "Finish the day with a lighter protein snack instead of trying to cram everything into one late meal."
      ]
    };
  }

  if (waterGap >= 0.5) {
    return {
      title: "Treat hydration like part of the meal plan",
      summary: `A quick ${hydrationServing} step before the next meal is the cleanest nutrition win still open today.`,
      freeSteps: [
        `Drink ${hydrationServing} before your next meal.`,
        "Keep water visible so the rest of the target feels easier to finish."
      ],
      premiumSteps: [
        `Use ${hydrationServing} before your next meal and another serving around training if recovery feels soft.`,
        "Front-load more of your water earlier tomorrow so the target stops turning into a late catch-up task."
      ]
    };
  }

  return {
    title: "Keep the day simple and repeatable",
    summary: "Your nutrition targets are close enough that consistency matters more than adding complexity.",
    freeSteps: [
      "Keep your next meal balanced and protein-forward.",
      "Finish the day with water nearby so tomorrow starts clean."
    ],
    premiumSteps: [
      "Keep meal timing predictable so tomorrow's training and appetite stay easier to manage.",
      "Protect a protein-forward evening meal so recovery stays automatic."
    ]
  };
}

function buildMealDirection({ profile, totals, data, hydrationLiters, proteinMin, proteinGap, unitPreference }) {
  const directions = [];
  if (profile.goalType === "fat_loss") {
    directions.push("Lead with a high-protein breakfast so appetite stays steadier through the afternoon.");
  }
  if (profile.goalType === "bodybuilding" || profile.goalType === "strength") {
    directions.push("Protect a post-workout meal with protein plus carbs so harder sessions recover cleanly.");
  }
  if (proteinGap >= 25) {
    directions.push(`Use one anchor meal with at least ${Math.min(45, Math.max(30, proteinMin / 4))}g of protein before dinner.`);
  } else {
    directions.push("Keep two protein-forward meals in the day so recovery does not depend on one late catch-up meal.");
  }
  directions.push(`Use hydration timing instead of guesswork: get roughly half of ${formatHydration(hydrationLiters, unitPreference)} in before mid-afternoon.`);
  if (totals.calories < data.goals.calories * 0.6 && profile.nutritionMode === "full") {
    directions.push("Add one easy snack option you can repeat on busy days so calories do not collapse late.");
  }
  return directions.slice(0, 3);
}

function buildNutritionExecutionPlan({ profile, totals, goals, waterIntake, hydrationLiters, proteinGap, unitPreference }) {
  const calorieGap = Math.max(goals.calories - totals.calories, 0);
  const waterGap = Math.max(hydrationLiters - Number(waterIntake || 0), 0);
  const actions = [];

  if (proteinGap >= 40) {
    actions.push("Eat a 30-40g protein breakfast or add a protein shake before the afternoon.");
  } else if (proteinGap >= 20) {
    actions.push(`Make your next meal protein-first and close at least ${Math.min(30, Math.round(proteinGap))}g of the gap.`);
  }

  if (profile.nutritionMode === "full" && calorieGap >= 450) {
    actions.push("Use one balanced anchor meal with protein, carbs, and fruit so calories recover without grazing all evening.");
  } else if (profile.nutritionMode === "full" && calorieGap >= 250) {
    actions.push("Add one planned snack or post-workout meal instead of leaving the calorie gap until late.");
  }

  if (waterGap >= 0.5) {
    const hydrationActionAmount = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";
    actions.push(`Drink ${hydrationActionAmount} of water before your next meal or training block.`);
  }

  if (!actions.length) {
    actions.push("Keep the next meal balanced and keep water nearby so today's targets stay easy to finish.");
  }

  return actions.slice(0, 3);
}

function buildNutritionTemplates({ profile, calorieGap, proteinGap, waterGap, unitPreference }) {
  const hydrationServing = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";
  const templates = [
    {
      id: "high-protein-breakfast",
      title: "High-protein breakfast",
      combo: "Eggs + Greek yogurt, or oats + whey + fruit",
      nutrition: "30-40g protein · ~350-500 kcal",
      whenToUse: "Best when the day needs an early protein win."
    }
  ];

  if (profile.goalType === "strength" || profile.goalType === "bodybuilding" || profile.goalType === "athletic_performance") {
    templates.push({
      id: "quick-recovery-meal",
      title: "Quick recovery meal",
      combo: "Chicken + rice + fruit, or shake + bagel + yogurt",
      nutrition: "30-45g protein · ~450-700 kcal",
      whenToUse: "Use after harder sessions or when calories are trailing."
    });
  } else {
    templates.push({
      id: "quick-lunch",
      title: "Quick lunch",
      combo: "Tuna rice bowl, or yogurt + berries + granola",
      nutrition: "25-35g protein · ~350-550 kcal",
      whenToUse: "Use on busy days when you need a realistic meal, not a perfect one."
    });
  }

  if (proteinGap >= 30) {
    templates.push({
      id: "protein-gap-snack",
      title: "Protein-gap snack",
      combo: "Shake, cottage cheese, or deli-turkey wrap",
      nutrition: "20-30g protein · ~180-320 kcal",
      whenToUse: "Use when protein is still lagging later in the day."
    });
  } else if (calorieGap >= 300) {
    templates.push({
      id: "recovery-top-up",
      title: "Recovery top-up",
      combo: "Bagel + yogurt, oats + whey, or rice cakes + turkey",
      nutrition: "20-30g protein · ~250-400 kcal",
      whenToUse: "Use when calories are still open but a full extra meal feels like too much."
    });
  } else if (waterGap >= 0.5) {
    templates.push({
      id: "hydration-pairing",
      title: "Hydration pairing",
      combo: `${hydrationServing} water + fruit, or water + yogurt`,
      nutrition: "Hydration support · light snack",
      whenToUse: "Use before the next meal so hydration stops falling behind."
    });
  }

  return templates.slice(0, 4);
}

function getNutritionEmphasis({ profile, data, proteinGap, calorieGap, waterGap, nutritionMode, nutritionPlanning }) {
  if (nutritionMode === "basic") {
    return proteinGap >= 20
      ? `Keep protein front and center by closing the remaining ${proteinGap}g gap without overcomplicating tracking. A practical daily range is ${nutritionPlanning.proteinRangeLabel}.`
      : `Use simple protein-forward meals and hydration to support the training week without full calorie tracking. A steady protein range is ${nutritionPlanning.proteinRangeLabel}.`;
  }
  if (profile.goalType === "fat_loss") {
    return proteinGap >= 20
      ? `Keep meals high in protein while controlling appetite, close the remaining ${proteinGap}g gap earlier in the day, and treat ${nutritionPlanning.calorieRangeLabel} as the rough daily target band.`
      : `Use high-protein meals and repeatable food structure so fat-loss progress does not depend on willpower. A practical calorie lane is ${nutritionPlanning.calorieRangeLabel}.`;
  }
  if (profile.goalType === "bodybuilding") {
    return calorieGap >= 350
      ? `Stop under-fueling late in the day by planning one extra recovery meal or shake and working inside ${nutritionPlanning.calorieRangeLabel}.`
      : `Keep meals repeatable, protein-forward, and frequent enough to support training volume. A useful protein lane is ${nutritionPlanning.proteinRangeLabel}.`;
  }
  if (profile.goalType === "strength") {
    return proteinGap >= 25
      ? `Raise daily protein consistency, aim to close a remaining ${proteinGap}g gap earlier in the day, and keep intake near ${nutritionPlanning.proteinRangeLabel}.`
      : `Keep carbs and protein steady around your main lifting sessions so heavier work feels supported. A useful calorie lane is ${nutritionPlanning.calorieRangeLabel}.`;
  }
  if (profile.goalType === "injury_recovery") {
    return `Keep protein steady and avoid under-fueling so tissue recovery is not fighting against low intake. A practical hydration floor is ${nutritionPlanning.hydrationTargetLabel}.`;
  }
  if (waterGap >= 0.5) {
    return `Reinforce hydration by making ${nutritionPlanning.hydrationTargetLabel} your daily floor.`;
  }
  if (calorieGap >= 350) {
    return `Stop under-fueling late in the day by planning one reliable anchor meal and working inside ${nutritionPlanning.calorieRangeLabel}.`;
  }
  return `Keep meals repeatable and protein-forward so training recovery stays automatic. A practical protein lane is ${nutritionPlanning.proteinRangeLabel}.`;
}

function getWeeklyFocus({ profile, proteinGap, waterGap, nutritionTracked, hasTrainingHistory, lowRecovery, weeklyTrend, completion }) {
  if (profile.goalType === "injury_recovery") {
    return "Move safely while restoring confidence";
  }
  if (profile.goalType === "mobility") {
    return "Build daily mobility consistency";
  }
  if (nutritionTracked && proteinGap >= 25) {
    return "Recovery through better fueling";
  }
  if (nutritionTracked && waterGap >= 0.5) {
    return "Hydration consistency";
  }
  if (lowRecovery) {
    return "Protect recovery while staying active";
  }
  if (weeklyTrend === "up" || completion >= 80) {
    return `Build on current momentum for ${formatGoalType(profile.goalType).toLowerCase()}`;
  }
  if (!hasTrainingHistory) {
    return `Build your first week of consistency around ${formatGoalType(profile.goalType).toLowerCase()}`;
  }
  return `Rebuild consistency around ${formatGoalType(profile.goalType).toLowerCase()}`;
}

function buildRestrictionNote(restrictedAreas) {
  if (!restrictedAreas?.length) {
    return "";
  }

  if (restrictedAreas.length === 1) {
    return restrictedAreas[0];
  }

  return `${restrictedAreas.slice(0, -1).join(", ")} and ${restrictedAreas.at(-1)}`;
}

function getWorkoutRationale({ profile, strengthCount, cardioCount, mobilityCount, restrictionNote }) {
  if (profile.goalType === "strength") {
    return "The mix leans toward lower-rep lifting and keeps accessories secondary so strength stays the main signal.";
  }
  if (profile.goalType === "bodybuilding") {
    return "The mix keeps more volume and muscle targeting in the week so you are not defaulting to generic full-body work.";
  }
  if (profile.goalType === "fat_loss") {
    return "The mix spreads training frequency a bit higher so calorie burn and adherence stay practical.";
  }
  if (profile.goalType === "athletic_performance") {
    return "The mix keeps strength, conditioning, and mobility together so performance work does not become one-dimensional.";
  }
  if (profile.goalType === "mobility") {
    return "The mix lowers intensity and keeps mobility at the center so movement quality improves without overload.";
  }
  if (profile.goalType === "injury_recovery") {
    return `The mix stays conservative${restrictionNote ? ` around ${restrictionNote}` : ""} so you can keep moving without pretending everything is normal.`;
  }
  if (profile.goalType === "active_aging") {
    return "The mix stays joint-friendly and recovery-heavy so training still feels sustainable next week.";
  }
  if (strengthCount === 0) {
    return "The mix leans toward strength first because your recent logs do not show enough resistance training yet.";
  }
  if (mobilityCount === 0) {
    return "The mix adds mobility support because your recent training is missing an easy recovery bridge.";
  }
  if (cardioCount === 0) {
    return "The mix keeps a conditioning slot so the week is not only strength work.";
  }
  return "The mix reflects your recent training pattern while keeping recovery and balance in the plan.";
}

export function calculateStreak(completedDates) {
  const entries = new Set(completedDates);
  let streak = 0;

  for (let index = 0; index < 365; index += 1) {
    const date = new Date(Date.now() - index * DAY_MS).toISOString().slice(0, 10);
    if (entries.has(date)) {
      streak += 1;
      continue;
    }

    if (index === 0) {
      continue;
    }

    break;
  }

  return streak;
}

export function buildCoachingTips(data, totals, habits, completion, workouts = []) {
  const coachEngine = buildCoachDecisionEngine(data, {
    totals,
    habits,
    completion,
    workouts
  });
  if (coachEngine?.nextActions?.length) {
    return coachEngine.nextActions.map((action) => action.title);
  }

  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const latestWorkout = workouts[0];
  const tips = [];

  if (completion < 70) {
    tips.push("Your recovery score is lagging a bit. Aim for one quick workout block and one protein-rich meal.");
  }

  if (!trainedToday) {
    if (data.sleepHours < 6.5 || data.energyLevel === "Low") {
      tips.push("Recovery looks limited today, so choose a lighter mobility or cardio session instead of a heavy lift.");
    } else {
      tips.push("You have not trained yet today. A structured strength or cardio session would move your score fastest.");
    }
  } else if (latestWorkout?.type === "strength" && data.energyLevel === "Low") {
    tips.push("You already trained today. Favor hydration, protein, and an easier evening walk instead of piling on more intensity.");
  }

  if (proteinGap > 0) {
    tips.push(`You still have ${proteinGap}g of protein available. Lean into yogurt, eggs, tofu, or chicken to close the gap.`);
  }

  if (waterGap > 0) {
    tips.push(`Hydration is ${waterGap.toFixed(1)}L short. Front-load two glasses before your next task switch.`);
  }

  if (pendingHabits.length) {
    tips.push(`Your next easy win is "${pendingHabits[0].name}". Completing it protects your streak momentum.`);
  }

  if (!tips.length) {
    tips.push("Everything is trending well. Hold the line with sleep, a short walk, and your usual meal cadence.");
  }

  return tips;
}

export function buildCoachDecisionEngine(data, summaryLike, isPremium = false) {
  const normalizedData = normalizeWellnessData(data);
  const workouts = sortWorkoutsDesc((summaryLike?.workouts || normalizedData.workouts || []).map(normalizeWorkout));
  const totals =
    summaryLike?.totals || {
      calories: (normalizedData.meals || []).reduce((sum, meal) => sum + meal.calories, 0),
      protein: (normalizedData.meals || []).reduce((sum, meal) => sum + meal.protein, 0),
      workoutMinutes: workouts.reduce((sum, workout) => sum + workout.duration, 0)
    };
  const today = new Date().toISOString().slice(0, 10);
  const habits =
    summaryLike?.habits ||
    (normalizedData.habits || []).map((habit) => ({
      ...habit,
      streak: calculateStreak(habit.completedDates),
      completedToday: habit.completedDates.includes(today)
    }));
  const completion = Number.isFinite(summaryLike?.completion)
    ? summaryLike.completion
    : calculateCompletionScore(normalizedData, totals, habits, workouts);
  const activeModules = getActiveModules({
    profile: normalizedData.profile,
    hasHabits: habits.length > 0
  });
  const activeModuleIds = new Set(activeModules.map((module) => module.id));
  const nutritionMode = normalizedData.profile.nutritionMode;
  const waterGap = Math.max(normalizedData.goals.water - normalizedData.waterIntake, 0);
  const proteinGap = Math.max(normalizedData.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(normalizedData.goals.calories - totals.calories, 0);
  const workoutStreak = calculateWorkoutStreak(workouts);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === today);
  const recentWorkoutDays = new Set(workouts.slice(0, 7).map((workout) => workout.loggedAt.slice(0, 10))).size;
  const completedHabitCount = habits.filter((habit) => habit.completedToday).length;
  const habitCompletionRate = habits.length ? completedHabitCount / habits.length : 0;
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const weeklyTrend = getWeeklyTrend(normalizedData.weeklyHistory || [], completion);
  const lowRecovery =
    normalizedData.sleepHours < normalizedData.goals.sleep - 0.75 || normalizedData.energyLevel === "Low";
  const mediumRecovery =
    normalizedData.sleepHours < normalizedData.goals.sleep - 0.25 || normalizedData.energyLevel === "Steady";
  const weeklyPlan = buildWeeklyPlan(normalizedData, totals, habits, completion, workouts);

  const candidates = [];

  if (lowRecovery) {
    candidates.push({
      priority: 100,
      category: "recovery",
      title: "Recovery is the biggest thing limiting you today.",
      detail:
        normalizedData.energyLevel === "Low"
          ? "Your energy is low and sleep is not strong enough to support a hard training push."
          : `You are still ${Math.max(normalizedData.goals.sleep - normalizedData.sleepHours, 0).toFixed(1)} hours under your sleep target, so training quality will drop faster than usual.`,
      why:
        "When recovery is soft, forcing intensity usually lowers training quality and makes consistency harder tomorrow.",
      actions: isPremium
        ? [
            {
              title: "Choose a lighter session",
              detail: `Use a ${Math.min(25, Math.max(15, normalizedData.goals.workoutMinutes / 2))}-minute mobility, walk, or easy cardio block instead of a hard lift.`
            },
            {
              title: "Protect tonight's sleep window",
              detail: "Finish caffeine earlier, stop the session before fatigue climbs, and set up an earlier wind-down."
            }
          ]
        : [
            {
              title: "Keep training light today",
              detail: "Use a short walk, mobility block, or easy cardio session."
            },
            {
              title: "Set up better sleep tonight",
              detail: "Aim for an earlier bedtime."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly trend is already soft, so better recovery is the fastest way to stop the slide."
          : "If recovery improves, the plan can support stronger sessions again without resetting the week."
    });
  }

  if (activeModuleIds.has("hydration") && waterGap >= 0.5) {
    candidates.push({
      priority: 92,
      category: "hydration",
      title: "Hydration is the cleanest performance gap right now.",
      detail: `${waterGap.toFixed(1)}L is still open, which can drag training quality, appetite control, and recovery.`,
      why: isPremium
        ? "Hydration is the easiest win left today and it directly improves how the next workout, meal timing, and recovery feel."
        : "Hydration is the easiest quick win left today.",
      actions: isPremium
        ? [
            {
              title: "Close the first liter earlier",
              detail: "Drink two glasses now and keep another bottle beside your next work block."
            },
            {
              title: "Hydrate before training or dinner",
              detail: "Use that timing to make the rest of the target easier to finish."
            }
          ]
        : [
            {
              title: "Drink two glasses now",
              detail: "Front-load the gap instead of leaving it for tonight."
            },
            {
              title: "Keep a bottle nearby",
              detail: "Make the next few sips automatic."
            }
          ],
      note:
        workoutStreak >= 2
          ? "Your training rhythm is holding, so hydration is the easiest thing to tighten without changing the whole week."
          : "Fixing hydration helps the rest of the week feel easier even before training changes."
    });
  }

  if (activeModuleIds.has("nutrition") && proteinGap >= 20) {
    candidates.push({
      priority: 88,
      category: "nutrition",
      title: "Protein is the main recovery gap still open today.",
      detail: `${proteinGap}g of protein is still missing, which weakens recovery and makes training progress less efficient.`,
      why: isPremium
        ? "Closing the protein gap supports muscle repair, keeps hunger steadier, and makes the weekly plan's recovery logic work the way it should."
        : "More protein will support recovery and make the day feel more complete.",
      actions:
        nutritionMode === "full"
          ? isPremium
            ? [
                {
                  title: "Add one 30-40g protein meal",
                  detail: "Use a meal like Greek yogurt plus fruit, eggs and toast, chicken, tofu, or a protein shake with food."
                },
                {
                  title: "Close protein before chasing extra calories",
                  detail: "Use the next meal to reduce the gap while there is still time left in the day."
                }
              ]
            : [
                {
                  title: "Add one protein-forward meal",
                  detail: "Aim for 30g or more."
                },
                {
                  title: "Log it right away",
                  detail: "Keep the dashboard accurate."
                }
              ]
          : isPremium
            ? [
                {
                  title: "Use a quick protein check-in",
                  detail: "Log a protein source like yogurt, eggs, tuna, tofu, or a shake so the dashboard reflects the real gap."
                },
                {
                  title: "Pair protein with hydration",
                  detail: "That makes the next action support both recovery and energy."
                }
              ]
            : [
                {
                  title: "Add a quick protein source",
                  detail: "Choose something easy to repeat."
                },
                {
                  title: "Log a protein check-in",
                  detail: "Keep the plan synced to today."
                }
              ],
      note:
        calorieGap >= 350 && nutritionMode === "full"
          ? "You are under on both protein and energy, so one real meal is more useful than scattered snacks."
          : "Your weekly plan is already leaning toward better fueling, so closing protein helps it feel more accurate immediately."
    });
  }

  if (nutritionMode === "full" && calorieGap >= 350) {
    candidates.push({
      priority: 80,
      category: "nutrition",
      title: "Under-fueling is starting to flatten the day.",
      detail: `${calorieGap} calories are still open, and leaving them untouched makes recovery and energy weaker tomorrow.`,
      why:
        "A solid meal now does more for recovery and consistency than trying to catch everything late at night.",
      actions: isPremium
        ? [
            {
              title: "Use one anchor meal",
              detail: "Pick a meal with protein, carbs, and fluids instead of trying to patch the gap with snacks."
            },
            {
              title: "Close calories before the late evening",
              detail: "That keeps the weekly plan's recovery targets more realistic."
            }
          ]
        : [
            {
              title: "Add one solid meal",
              detail: "Choose protein, carbs, and fluids together."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly consistency is slipping a bit, and under-fueling is part of that picture."
          : "The week can still stay on track if you stop the calorie gap from compounding."
    });
  }

  if (!trainedToday && recentWorkoutDays < 2) {
    candidates.push({
      priority: 84,
      category: "training",
      title: "Training consistency is the weak point to protect next.",
      detail:
        workoutStreak > 0
          ? `You have a ${workoutStreak}-day streak, but today is still open and the recent training pattern is thin.`
          : "You have not trained today, and the recent workout pattern is too light to carry weekly momentum on its own.",
      why: isPremium
        ? "A minimum viable session keeps the weekly plan from turning theoretical and protects momentum without needing a perfect workout."
        : "One short session is enough to keep momentum moving.",
      actions: isPremium
        ? [
            {
              title: "Schedule a minimum viable session",
              detail: `Log a 20-30 minute ${lowRecovery ? "mobility or cardio" : "strength or conditioning"} block before the day ends.`
            },
            {
              title: "Keep the win small and deliberate",
              detail: "The goal is to protect weekly momentum, not chase the perfect session."
            }
          ]
        : [
            {
              title: "Log a short workout today",
              detail: "A 20-minute session is enough."
            },
            {
              title: "Keep it realistic",
              detail: "Choose the easiest option you will actually do."
            }
          ],
      note:
        workoutStreak > 0
          ? "The streak is still alive, so today's best move is protecting it with a smaller win."
          : "The fastest reset is one small session, not waiting for the perfect day."
    });
  }

  if (habitCompletionRate < 0.34 && pendingHabits.length) {
    candidates.push({
      priority: 72,
      category: "consistency",
      title: "Daily follow-through is softer than the plan needs.",
      detail: `Only ${completedHabitCount} habit${completedHabitCount === 1 ? "" : "s"} are done today, so the week is relying on motivation more than routine.`,
      why:
        "Small repeatable habits are what keep recovery, food, and training from becoming separate problems.",
      actions: isPremium
        ? [
            {
              title: `Complete "${pendingHabits[0].name}" next`,
              detail: "Use it as the smallest action that gets you back into a better pattern today."
            },
            {
              title: "Tie it to an existing task",
              detail: "Attach the habit to a meal, training block, or evening routine so it stops depending on memory."
            }
          ]
        : [
            {
              title: `Complete "${pendingHabits[0].name}" next`,
              detail: "Use one easy win to restart follow-through."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly trend is slipping, and low follow-through is part of why."
          : "Your big metrics are close enough that habit follow-through is the easiest lever left."
    });
  }

  if (workoutStreak >= 3 || (weeklyTrend === "up" && completion >= 75)) {
    candidates.push({
      priority: 60,
      category: "momentum",
      title: "Momentum is building, so the main job is protecting it.",
      detail:
        workoutStreak >= 3
          ? `You have a ${workoutStreak}-day workout streak and the week is moving in the right direction.`
          : "Your weekly trend is improving, which means consistency is starting to compound.",
      why:
        "Momentum is easier to keep than to rebuild, so today should reinforce the basics instead of overcomplicating the plan.",
      actions: isPremium
        ? [
            {
              title: "Keep one anchor behavior clean",
              detail: `Protect ${pendingHabits[0]?.name || "meal timing or hydration"} so the week does not rely only on motivation.`
            },
            {
              title: "Avoid unnecessary intensity spikes",
              detail: "A clean repeatable day is more valuable than a heroic one-off effort."
            }
          ]
        : [
            {
              title: "Protect the streak",
              detail: "Keep one healthy action easy and repeatable today."
            }
          ],
      note:
        weeklyPlan.weeklyFocus
          ? `This is why the weekly plan is leaning toward "${weeklyPlan.weeklyFocus.toLowerCase()}."`
          : "The weekly plan is reacting to better consistency, not just static goals."
    });
  }

  const chosen =
    candidates.sort((left, right) => right.priority - left.priority)[0] ||
    {
      category: "consistency",
      title: "You are mostly on track, so keep the basics clean.",
      detail: "There is no major gap dominating the day right now.",
      why: "The best move is to protect consistency rather than invent a new problem to solve.",
      actions: [
        {
          title: "Log the next meaningful action",
          detail: "Use your next meal, workout, or recovery check-in to keep the dashboard current."
        }
      ],
      note: "The coach will shift as soon as one of the real signals changes."
    };

  return {
    primaryInsight: {
      category: chosen.category,
      title: chosen.title,
      detail: chosen.detail
    },
    nextActions: chosen.actions.slice(0, 3),
    whyItMatters: chosen.why,
    longerTermNote: chosen.note,
    premiumLevel: isPremium ? "premium" : "free",
    planConnection: isPremium
      ? weeklyPlan.focusReason
      : weeklyPlan.previewNote
  };
}

export function buildTodayFocus(data, totals, habits, completion) {
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const workoutGap = Math.max(data.goals.workoutMinutes - totals.workoutMinutes, 0);
  const sleepGap = Math.max(data.goals.sleep - data.sleepHours, 0);

  if (waterGap >= 0.5) {
    return {
      title: "Prioritize hydration first",
      action: "Drink two glasses of water before your next task switch.",
      reason: `${waterGap.toFixed(1)}L still separates you from today’s goal.`
    };
  }

  if (proteinGap >= 25) {
    return {
      title: "Close the protein gap",
      action: "Add one high-protein meal or snack this afternoon.",
      reason: `${proteinGap}g protein remains to reach your target.`
    };
  }

  if (workoutGap >= 15) {
    return {
      title: "Protect your training target",
      action: "Schedule a short ${workoutGap}-minute session or brisk walk today.",
      reason: `${workoutGap} workout minutes are still open.`
    };
  }

  if (sleepGap >= 0.5) {
    return {
      title: "Set up recovery tonight",
      action: "Block a wind-down window and aim for an earlier bedtime.",
      reason: `You are averaging ${sleepGap.toFixed(1)} hours below your sleep goal today.`
    };
  }

  if (pendingHabits.length) {
    return {
      title: "Keep your streak alive",
      action: `Complete "${pendingHabits[0].name}" before the day ends.`,
      reason: "Habit consistency is the easiest lever left to move today."
    };
  }

  if (completion >= 85) {
    return {
      title: "Maintain the momentum",
      action: "Stay consistent with your meal timing and evening routine.",
      reason: "Your day is already tracking well across the core metrics."
    };
  }

  return {
    title: "Choose one decisive win",
    action: "Pick the smallest unfinished metric and complete it next.",
    reason: "A single focused action will lift your score more than scattered effort."
  };
}

export function buildTodayFocusCard(data, totals, habits, completion, workouts = []) {
  const dayPart = getDayPart();
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const today = new Date().toISOString().slice(0, 10);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const sleepGap = Math.max(data.goals.sleep - data.sleepHours, 0);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === today);
  const workoutGap = trainedToday ? 0 : Math.max(data.goals.workoutMinutes - totals.workoutMinutes, 20);
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";

  if (lowRecovery && !trainedToday) {
    return {
      category: "recovery",
      dayPart,
      title: dayPart === "evening" ? "Protect recovery tonight and keep training light." : "Recovery is low, so use a lighter session today.",
      reason: dayPart === "morning" ? "Your first move should lower stress, not chase intensity." : "Sleep and energy are below baseline, so today should protect momentum without adding heavy stress.",
      whyThisMatters: "A lighter session still protects your streak while keeping recovery from sliding further.",
      actions: [
        dayPart === "morning"
          ? `Plan a ${Math.min(workoutGap, 25)}-minute mobility or easy cardio block now.`
          : `Log a ${Math.min(workoutGap, 25)}-minute mobility or easy cardio session.`,
        dayPart === "evening" ? "Hydrate, stop the session early, and set up an earlier bedtime." : "Hydrate before training and aim for an earlier wind-down tonight."
      ]
    };
  }

  if (!trainedToday) {
    return {
      category: "training",
      dayPart,
      title: dayPart === "morning" ? "Lock in today's training window now." : "You have not trained yet. Get a short workout on the board.",
      reason: dayPart === "evening" ? "A shorter session still gives the day a meaningful win and protects weekly momentum." : "Training is the biggest open gap right now and will move today's score the fastest.",
      whyThisMatters: "A short workout today protects your streak and keeps weekly momentum from stalling.",
      actions: [
        dayPart === "morning"
          ? `Pick a ${Math.min(workoutGap, 35)}-minute ${data.energyLevel === "High" ? "strength" : "home or mobility"} session before the day fills up.`
          : `Log a ${Math.min(workoutGap, 35)}-minute ${data.energyLevel === "High" ? "strength" : "home or mobility"} session.`,
        proteinGap >= 20 ? "Pair it with a high-protein meal afterward." : "Hydrate before you start so the session feels easier."
      ]
    };
  }

  if (proteinGap >= 25) {
    return {
      category: "nutrition",
      dayPart,
      title: dayPart === "morning" ? "Set up protein early so recovery stays on track." : "Prioritize protein intake today.",
      reason: dayPart === "afternoon" ? `${proteinGap}g of protein is still missing, so now is the best time to close the gap before the day gets away from you.` : `${proteinGap}g of protein is still missing, which makes recovery and training adaptation weaker.`,
      whyThisMatters: "Closing your protein gap supports recovery and helps your training actually pay off.",
      actions: [
        dayPart === "evening" ? "Make your next meal protein-forward instead of letting the gap carry into tomorrow." : "Add one high-protein meal or snack in your next eating window.",
        waterGap >= 0.5 ? "Drink water with that meal to improve hydration at the same time." : "Choose an option with at least 30g of protein."
      ]
    };
  }

  if (waterGap >= 0.5) {
    return {
      category: "hydration",
      dayPart,
      title: dayPart === "morning" ? "Start closing the hydration gap early." : "Bring hydration up before the day gets away from you.",
      reason: dayPart === "evening" ? `${waterGap.toFixed(1)}L is still open, and hydration is the easiest meaningful win left tonight.` : `${waterGap.toFixed(1)}L still separates you from today's target, which can drag energy and training quality down.`,
      whyThisMatters: "Hydration is the easiest win left today and improves energy, recovery, and training quality.",
      actions: [
        dayPart === "morning" ? "Drink two glasses of water before the next task switch." : "Drink two glasses of water in the next hour.",
        trainedToday ? "Keep a bottle nearby for the rest of the day." : "Hydrate before your next workout or walk."
      ]
    };
  }

  if (sleepGap >= 0.5) {
    return {
      category: "recovery",
      dayPart,
      title: dayPart === "morning" ? "Protect tonight's recovery before the day speeds up." : "Set up a stronger recovery tonight.",
      reason: `You are still ${sleepGap.toFixed(1)} hours short of your sleep target, so tonight's routine matters.`,
      whyThisMatters: "Better sleep is what keeps tomorrow's training, appetite, and energy from sliding backward.",
      actions: [
        dayPart === "morning" ? "Keep caffeine and training intensity reasonable so recovery is easier to finish tonight." : "Protect a wind-down window before bed.",
        "Keep the evening session light and finish hydration early."
      ]
    };
  }

  if (calorieGap >= 350) {
    return {
      category: "nutrition",
      dayPart,
      title: dayPart === "morning" ? "Plan one solid meal now so energy stays stable later." : "You are under-fueled. Add one solid meal today.",
      reason: `${calorieGap} calories are still open, so your recovery and energy may lag if you leave them untouched.`,
      whyThisMatters: "Fueling enough today makes it easier to recover well and show up stronger tomorrow.",
      actions: [
        proteinGap >= 15 ? "Choose a meal that closes both calories and protein together." : "Add a balanced meal with carbs, protein, and fluids.",
        "Log it as soon as you eat so the dashboard stays accurate."
      ]
    };
  }

  if (pendingHabits.length) {
    return {
      category: "consistency",
      dayPart,
      title: "Use one easy win to keep today's momentum alive.",
      reason: "Your core metrics are close enough that habit consistency is the cleanest next move.",
      whyThisMatters: "One small completed habit keeps your identity and streak momentum intact.",
      actions: [
        `Complete "${pendingHabits[0].name}" before the day ends.`,
        "Use that check-in to review tomorrow's first healthy action."
      ]
    };
  }

  if (completion >= 85) {
    return {
      category: "consistency",
      dayPart,
      title: "You are on track. Keep the day clean and consistent.",
      reason: "Nutrition, training, hydration, and recovery are all moving in the right direction today.",
      whyThisMatters: "Consistency is what turns a good day into a strong week instead of a one-off result.",
      actions: [
        "Stick to your usual meal timing and bedtime routine.",
        "Come back tomorrow and keep the streak building."
      ]
    };
  }

  return {
    category: "consistency",
    dayPart,
    title: "Finish the day with one deliberate health action.",
    reason: "You are close enough across the board that one focused action will keep momentum moving.",
    whyThisMatters: "Small wins compound fastest when you close the day on purpose instead of drifting through it.",
    actions: [
      pendingHabits.length ? `Complete "${pendingHabits[0].name}" next.` : "Log your next meal or hydration check-in.",
      "Check back after your next log to see if the focus shifts."
    ]
  };
}

function buildMomentumFeedback(data, totals, habits, completion, workouts = []) {
  const weeklyScores = (data.weeklyHistory || []).map((entry) => entry.score);
  const currentScore = weeklyScores.at(-1) || completion;
  const priorWindow = weeklyScores.slice(0, -1);
  const priorAverage = priorWindow.length ? priorWindow.reduce((sum, score) => sum + score, 0) / priorWindow.length : currentScore;
  const habitCompletionCount = habits.filter((habit) => habit.completedToday).length;
  const mealCount = (data.meals || []).length;
  const workoutStreak = calculateWorkoutStreak(workouts);
  const recoveryStrong = data.sleepHours >= data.goals.sleep - 0.5 && data.energyLevel !== "Low";

  if (workoutStreak >= 3 || (currentScore >= priorAverage + 4 && habitCompletionCount >= 1)) {
    return {
      tone: "positive",
      title: "You're building momentum.",
      detail: `Your ${workoutStreak || 1}-day training rhythm and recent check-ins are pushing this week above your baseline.`
    };
  }

  if (completion < 65 && !recoveryStrong && habitCompletionCount === 0) {
    return {
      tone: "warning",
      title: "You're slipping slightly.",
      detail: "Recovery and daily follow-through are both softer than usual, so one solid action today matters more than chasing perfection."
    };
  }

  if (habitCompletionCount === 0 || mealCount <= 2) {
    return {
      tone: "neutral",
      title: "One more action keeps the streak alive.",
      detail: `You already have enough data in motion that one more logged meal, habit, or workout will keep today's momentum intact.`
    };
  }

  return {
    tone: "positive",
    title: "You're on track this week.",
    detail: "The dashboard is moving in the right direction, so the best move now is to keep today's basics clean and repeatable."
  };
}

function getDayPart(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}

function getWeeklyTrend(history, completion) {
  const scores = [...history.map((entry) => entry.score), completion].filter((score) => Number.isFinite(score));
  if (scores.length < 3) {
    return "flat";
  }

  const first = scores.slice(0, Math.max(1, scores.length - 2));
  const last = scores.slice(-2);
  const firstAverage = first.reduce((sum, score) => sum + score, 0) / first.length;
  const lastAverage = last.reduce((sum, score) => sum + score, 0) / last.length;

  if (lastAverage >= firstAverage + 4) {
    return "up";
  }
  if (lastAverage <= firstAverage - 4) {
    return "down";
  }
  return "flat";
}

function buildWeeklyPlanPremiumReason({ proteinGap, waterGap, nutritionTracked, hydrationTracked, lowRecovery, weeklyTrend, habitCompletionRate, hasHabitHistory, goalType, injuryStatus }) {
  if (injuryStatus === "active_injury") {
    return "Premium turns your current injury and restriction inputs into safer weekly guardrails instead of a generic plan.";
  }
  if (goalType === "mobility") {
    return "Premium shows how mobility should shape the whole week, not just add a random stretch suggestion.";
  }
  if (lowRecovery) {
    return "Premium turns your current recovery state into a lighter training mix and clearer weekly guardrails.";
  }
  if (nutritionTracked && proteinGap >= 25) {
    return "Premium shows how your fueling gap should change the week, not just that protein is low.";
  }
  if (hydrationTracked && waterGap >= 0.5) {
    return "Premium adds hydration and recovery adjustments so the week reflects how you're actually feeling.";
  }
  if (weeklyTrend === "up") {
    return "Premium leans into your current momentum instead of giving you a generic steady-state week.";
  }
  if (hasHabitHistory && habitCompletionRate < 0.5) {
    return "Premium connects the weekly plan to your actual consistency pattern so the plan is easier to stick to.";
  }
  return `Premium explains why your ${formatGoalType(goalType).toLowerCase()} week is structured this way using your training, recovery, and consistency data.`;
}

function getWeeklyPlanPreviewNote({ proteinCompletion, hydrationCompletion, calorieCompletion, nutritionTracked, hydrationTracked, lowRecovery, goalType }) {
  if (goalType === "mobility") {
    return "Movement quality is actively shaping the weekly structure.";
  }
  if (goalType === "injury_recovery") {
    return "The weekly setup is staying conservative around recovery and movement quality.";
  }
  if (goalType === "active_aging") {
    return "Joint-friendly pacing is actively shaping the weekly structure.";
  }
  if (lowRecovery) {
    return "Recovery is shaping this week more than volume right now.";
  }
  if (nutritionTracked && proteinCompletion < 0.8) {
    return "Protein support is still one of the biggest levers in this plan.";
  }
  if (hydrationTracked && hydrationCompletion < 0.8) {
    return "Hydration consistency is still influencing the weekly setup.";
  }
  if (nutritionTracked && calorieCompletion < 0.8) {
    return "Fueling consistency is still part of why this week is structured the way it is.";
  }
  return "This preview reflects your goal, training setup, and recovery inputs.";
}

function buildResultProjection(data, { completion, workoutStreak, weeklyTrend, habits }) {
  const profile = data.profile;
  const habitCompletionRate = habits.length ? habits.filter((habit) => habit.completedToday).length / habits.length : 0;

  if (profile.goalType === "fat_loss") {
    return {
      title: "Expected direction",
      summary: "A realistic pace is roughly 0.25 to 0.75 lb per week when protein, hydration, and weekly consistency stay solid.",
      confidence: completion >= 75 ? "Your current inputs support the upper end of that range." : "Your current consistency is more likely to support the slower end first."
    };
  }

  if (profile.goalType === "strength") {
    return {
      title: "Expected direction",
      summary: "Expect steadier bar speed, cleaner top sets, and gradual load progress across the next few weeks.",
      confidence: workoutStreak >= 3 ? "Your current training rhythm gives that progression a better chance to hold." : "That progression gets easier once your weekly training rhythm is steadier."
    };
  }

  if (profile.goalType === "bodybuilding") {
    return {
      title: "Expected direction",
      summary: "The short-term win is better session quality and repeatable volume before visible physique change follows.",
      confidence: weeklyTrend === "up" ? "Your current trend already supports better training quality." : "The plan is set to make volume more repeatable before asking for more."
    };
  }

  if (profile.goalType === "mobility" || profile.goalType === "injury_recovery") {
    return {
      title: "Expected direction",
      summary: "The near-term result is smoother movement, less guarded training, and more confidence under simple loading.",
      confidence: habitCompletionRate >= 0.5 ? "Your current consistency supports steady improvement in movement quality." : "Small daily mobility touchpoints will matter more than big sessions here."
    };
  }

  return {
    title: "Expected direction",
    summary: "The first visible wins should be better consistency, steadier recovery, and fewer off-track days during the week.",
    confidence: weeklyTrend === "up" ? "Your recent trend suggests those improvements are already starting to stick." : "The current plan is designed to make those basics easier to repeat."
  };
}

function buildWhyThisWorksBlock(data, planLike = {}) {
  const profile = data.profile;
  const hasLoggedHistory =
    (data.workouts?.length || 0) > 0 || (data.meals?.length || 0) > 0 || (data.weeklyHistory?.length || 0) > 0;
  const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
  const parts = [
    `${formatGoalType(profile.goalType)} sets the weekly direction.`,
    `${capitalize(profile.trainingEnvironment)} access, ${profile.equipmentProfile.replace("_", " ")} equipment, and ${profile.experienceLevel} experience shape how ambitious the week should feel.`,
    // Only claim recovery/nutrition are shaping the plan once they exist.
    hasLoggedHistory
      ? "Your recovery inputs and logged nutrition keep the plan from behaving like a generic template."
      : "As you log training, recovery, and nutrition, the plan sharpens around you instead of a generic template."
  ];

  if (profile.injuryStatus !== "none") {
    parts.splice(2, 0, "Injury and restricted-area inputs keep movement choices and intensity more realistic.");
  }

  return {
    title: "Why this works",
    body: parts.join(" "),
    trustNote: hasLoggedHistory
      ? "Built from your goal, setup, and logged training — it adjusts every week as you keep updating it."
      : "Built from your goal and setup — it becomes a personalized, data-driven plan as you start logging.",
    premiumNote: planLike.nutritionEmphasis
      ? "Premium goes further by showing the reasoning, execution priorities, and smarter weekly adjustments behind those inputs."
      : "Premium goes further by showing the reasoning and smarter weekly adjustments behind those inputs."
  };
}

function getAgeFromBirthdate(birthdate) {
  if (!birthdate) {
    return null;
  }

  const parsed = new Date(`${birthdate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
}

function deriveAgeGroupFromBirthdate(birthdate) {
  const age = getAgeFromBirthdate(birthdate);
  if (age === null) {
    return "30-39";
  }
  if (age < 30) {
    return "18-29";
  }
  if (age < 40) {
    return "30-39";
  }
  if (age < 50) {
    return "40-49";
  }
  return "50+";
}

function poundsToKilograms(value) {
  return Number((Number(value || 0) * 0.45359237).toFixed(2));
}

export function getAccessTier(user) {
  const status = getSubscriptionStatus(user);
  // Only treat a trial as TRIAL access while it is still inside its window;
  // an expired-but-unreconciled trial falls through to premium/active or FREE.
  if (status === "trialing" && hasActiveTrialWindow(user)) {
    return ACCESS_TIERS.TRIAL;
  }
  if (getUserTier(user) === "premium" || status === "active") {
    return ACCESS_TIERS.PREMIUM;
  }
  return ACCESS_TIERS.FREE;
}

export function canStartTrial(user) {
  return getAccessTier(user) === ACCESS_TIERS.FREE && !Boolean(user?.hasUsedTrial || user?.trialStartedAt || user?.trialUsedAt);
}

export function getTrialEndsAt(user) {
  return user?.trialEndsAt || user?.currentPeriodEnd || null;
}

function getTrialDaysRemaining(user) {
  const trialEndsAt = getTrialEndsAt(user);
  if (!trialEndsAt) {
    return 0;
  }

  const delta = new Date(trialEndsAt).getTime() - Date.now();
  if (delta <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(delta / DAY_MS));
}

function formatAccessLabel(accessTier) {
  if (accessTier === ACCESS_TIERS.TRIAL) {
    return "Trial";
  }
  if (accessTier === ACCESS_TIERS.PREMIUM) {
    return "Premium";
  }
  return "Free";
}

function formatDateLabel(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(parsed);
}

function getUserTier(user) {
  return user?.tier === "premium" ? "premium" : "free";
}

function createDefaultWellnessData(name) {
  return {
    goals: {
      calories: 2200,
      protein: 150,
      water: 2.8,
      sleep: 8,
      workoutMinutes: 55
    },
    profile: {
      goalType: "general_fitness",
      ageGroup: "30-39",
      birthdate: "",
      experienceLevel: "beginner",
      trainingEnvironment: "hybrid",
      equipmentProfile: "hybrid",
      injuryStatus: "none",
      sex: "",
      heightCm: null,
      currentWeight: null,
      targetWeight: null,
      unitPreference: "imperial",
      nutritionMode: "basic",
      appMode: "full_system",
      moduleOrder: CUSTOMIZABLE_MODULE_IDS,
      hiddenModules: [],
      exerciseGuidanceLevel: "standard",
      visualModelPreference: "default",
      showWarmup: true,
      showCooldown: true,
      onboardingCompleted: false,
      restrictedAreas: []
    },
    waterIntake: 0,
    // Recovery is unlogged until the user actually reports it — never seed a
    // fabricated sleep/energy reading that the coach would present as observed.
    sleepHours: null,
    energyLevel: null,
    meals: [],
    workouts: [],
    savedWorkouts: [],
    habits: [
      {
        id: crypto.randomUUID(),
        name: "Morning mobility",
        target: "10 min",
        completedDates: []
      },
      {
        id: crypto.randomUUID(),
        name: "Evening walk",
        target: "20 min",
        completedDates: []
      },
      {
        id: crypto.randomUUID(),
        name: "Meal prep",
        target: "1 block",
        completedDates: []
      }
    ],
    weeklyHistory: [],
    weightHistory: [],
    // No seeded "notes" — the coach must never present fabricated observations
    // ("... is building steady consistency ...") to a user who has logged nothing.
    notes: []
  };
}

function calculateCompletionScore(data, totals, habits, workouts = []) {
  const normalizedData = normalizeWellnessData(data);
  const weeklyWorkoutCount = countWeeklyLoggedWorkouts(workouts);
  const workoutCompletion = Math.min(weeklyWorkoutCount / 3, 1);
  const nutritionCompletion =
    (normalizedData.meals || []).length > 0
      ? Math.min(
          ((totals.calories / normalizedData.goals.calories) + (totals.protein / normalizedData.goals.protein)) / 2,
          1
        )
      : 0;
  const hydrationCompletion =
    normalizedData.waterIntake > 0 ? Math.min(normalizedData.waterIntake / normalizedData.goals.water, 1) : 0;
  const { start, end } = getWorkoutWeekWindow();
  const habitTargets = habits.length ? habits.length * 3 : 0;
  const weeklyHabitCompletions = habits.reduce((sum, habit) => {
    const count = (habit.completedDates || []).filter((dateValue) => {
      const completedAt = new Date(`${dateValue}T12:00:00`);
      return completedAt >= start && completedAt <= end;
    }).length;
    return sum + count;
  }, 0);
  const habitCompletion = habitTargets ? Math.min(weeklyHabitCompletions / habitTargets, 1) : 0;
  const currentWeekKey = getWeekKey();
  const checkInCompletion = (normalizedData.weeklyCheckIns || []).some((checkIn) => checkIn.weekKey === currentWeekKey)
    ? 1
    : 0;

  return Math.round(
    (workoutCompletion * 0.4 + habitCompletion * 0.2 + nutritionCompletion * 0.15 + hydrationCompletion * 0.15 + checkInCompletion * 0.1) *
      100
  );
}

export function normalizeWorkout(workout) {
  return {
    id: workout.id || crypto.randomUUID(),
    presetId: workout.presetId || null,
    name: workout.name,
    type: workout.type || inferWorkoutType(workout.name),
    environment: workout.environment || "both",
    focus: workout.focus || inferWorkoutFocus(workout.name),
    duration: Number(workout.duration || 0),
    intensity: workout.intensity || "Moderate",
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map(normalizeExercise) : [],
    loggedAt: workout.loggedAt || new Date().toISOString()
  };
}

function normalizeExercise(exercise) {
  const normalizedExercise = attachMovementToExercise({
    name: exercise.name,
    sets: Number(exercise.sets || 0),
    reps: exercise.reps || null,
    duration: exercise.duration || null,
    equipment: exercise.equipment || "bodyweight",
    muscleGroup: exercise.muscleGroup || "General",
    movementId: exercise.movementId || findMovementForName(exercise.name)?.id || null,
    weight: exercise.weight ?? null,
    repsCompleted: exercise.repsCompleted ?? null,
    notes: exercise.notes || ""
  });

  return {
    ...normalizedExercise,
    detailId: exercise.detailId || exercise.guideTargetId || normalizedExercise.detailId || null,
    guideTargetId: exercise.guideTargetId || exercise.detailId || normalizedExercise.guideTargetId || null,
    movement: exercise.movement && typeof exercise.movement === "object" ? exercise.movement : normalizedExercise.movement,
    media: exercise.media || normalizedExercise.media || null,
    mediaStatus: exercise.mediaStatus || normalizedExercise.mediaStatus || "",
    thumbnail: exercise.thumbnail || normalizedExercise.thumbnail || "",
    image: exercise.image || normalizedExercise.image || "",
    imageAlt: exercise.imageAlt || normalizedExercise.imageAlt || ""
  };
}

function normalizeSavedWorkout(workout) {
  if (!workout || typeof workout !== "object") {
    return null;
  }

  return {
    id: workout.id || workout.presetId || crypto.randomUUID(),
    presetId: workout.presetId || null,
    name: workout.name || "Saved workout",
    type: workout.type || inferWorkoutType(workout.name),
    environment: workout.environment || "both",
    focus: workout.focus || inferWorkoutFocus(workout.name),
    focusLabel: workout.focusLabel || (workout.focus ? formatWorkoutFocus(workout.focus) : null),
    duration: Number(workout.duration || 0),
    intensity: workout.intensity || "Moderate",
    summary: workout.summary || "",
    continuityNote: workout.continuityNote || "",
    varietyNote: workout.varietyNote || "",
    equipmentProfile: workout.equipmentProfile || "hybrid",
    equipmentSummary: workout.equipmentSummary || workout.equipmentProfile?.replaceAll("_", " ") || "mixed setup",
    primaryMuscles: Array.isArray(workout.primaryMuscles) ? workout.primaryMuscles : [],
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map(normalizeExercise) : [],
    savedAt: workout.savedAt || new Date().toISOString()
  };
}

function sortSavedWorkoutsDesc(workouts = []) {
  return [...workouts].sort((left, right) => new Date(right.savedAt || 0).getTime() - new Date(left.savedAt || 0).getTime());
}

function buildLatestExerciseLoads(workouts = []) {
  return sortWorkoutsDesc(workouts).reduce((accumulator, workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (!exercise?.name || accumulator[exercise.name]) {
        return;
      }

      if (exercise.weight === null || exercise.weight === undefined || exercise.weight === "") {
        return;
      }

      accumulator[exercise.name] = {
        weight: exercise.weight,
        repsCompleted: exercise.repsCompleted || exercise.reps || null,
        loggedAt: workout.loggedAt
      };
    });
    return accumulator;
  }, {});
}

function buildExerciseHistory(workouts = []) {
  const historyMap = new Map();

  sortWorkoutsDesc(workouts).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (!exercise?.name) {
        return;
      }

      if (!historyMap.has(exercise.name)) {
        historyMap.set(exercise.name, []);
      }

      historyMap.get(exercise.name).push({
        loggedAt: workout.loggedAt,
        workoutName: workout.name,
        weight: exercise.weight ?? null,
        repsCompleted: exercise.repsCompleted || exercise.reps || null,
        sets: exercise.sets
      });
    });
  });

  return Array.from(historyMap.entries())
    .map(([name, entries]) => {
      const weightedEntries = entries.filter((entry) => entry.weight !== null && entry.weight !== undefined && entry.weight !== "");
      const earliestWeighted = weightedEntries[weightedEntries.length - 1]; // entries are newest-first
      return {
        name,
        lastPerformedAt: entries[0]?.loggedAt || null,
        lastWeight: weightedEntries[0]?.weight ?? null,
        bestWeight: weightedEntries.length ? Math.max(...weightedEntries.map((entry) => Number(entry.weight) || 0)) : null,
        // True earliest across the FULL history (not the 6-entry display cap), so
        // the "up X lb over N weeks" insight reflects the real starting point.
        weightedCount: weightedEntries.length,
        earliestWeight: earliestWeighted?.weight ?? null,
        earliestAt: earliestWeighted?.loggedAt ?? null,
        entries: entries.slice(0, 6)
      };
    })
    .sort((left, right) => new Date(right.lastPerformedAt || 0).getTime() - new Date(left.lastPerformedAt || 0).getTime());
}

// Estimated one-rep max (Epley). Reps default to 1 when unknown so a bare
// weight still ranks. Used to detect "more reps at a weight you've hit before".
function estimatedOneRepMax(weight, reps) {
  const w = Number(weight);
  if (!Number.isFinite(w) || w <= 0) {
    return 0;
  }
  const r = Number(reps);
  const useReps = Number.isFinite(r) && r > 0 ? r : 1;
  return w * (1 + useReps / 30);
}

// Reps can be a free-text string ("8-12", "12 each", "5", "AMRAP"). Take the
// leading integer so a rep range still counts as real work instead of silently
// zeroing the set's volume (and hiding PRs / understating trends).
function parseRepCount(value) {
  if (value === null || value === undefined) return NaN;
  const parsed = parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function exerciseVolume(exercise) {
  const w = Number(exercise?.weight);
  const r = parseRepCount(exercise?.repsCompleted ?? exercise?.reps);
  const sets = Number(exercise?.sets) || 1;
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) {
    return 0;
  }
  return w * r * sets;
}

function sessionVolume(workout) {
  return (workout?.exercises || []).reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
}

// Detect legitimate personal records earned in `newWorkout`, comparing ONLY
// against the user's prior logged workouts. Rules that keep this honest:
//   - A record must BEAT a previous best — a first-ever performance of an
//     exercise is not a record (avoids celebrating every ordinary new movement).
//   - Only real numeric weight (>0) counts; bodyweight/cardio don't fabricate PRs.
//   - Per exercise, at most one strength record (heaviest weight > best e1RM).
//   - One session-volume record per workout, only if a prior heavier session exists.
// Returns a priority-sorted array (may be empty). Never invents data.
export function detectPersonalRecords(priorWorkouts = [], newWorkout) {
  if (!newWorkout || !Array.isArray(newWorkout.exercises)) {
    return [];
  }
  const priors = Array.isArray(priorWorkouts) ? priorWorkouts.map(normalizeWorkout) : [];

  const bestWeight = new Map(); // name -> heaviest prior weight
  const bestE1rm = new Map(); //   name -> best prior estimated 1RM
  priors.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const name = exercise?.name;
      const weight = Number(exercise?.weight);
      if (!name || !Number.isFinite(weight) || weight <= 0) {
        return;
      }
      const reps = parseRepCount(exercise?.repsCompleted ?? exercise?.reps);
      bestWeight.set(name, Math.max(bestWeight.get(name) || 0, weight));
      bestE1rm.set(name, Math.max(bestE1rm.get(name) || 0, estimatedOneRepMax(weight, reps)));
    });
  });
  const priorBestSessionVolume = priors.reduce((max, workout) => Math.max(max, sessionVolume(workout)), 0);

  const records = [];
  const seen = new Set();
  (newWorkout.exercises || []).forEach((exercise) => {
    const name = exercise?.name;
    const weight = Number(exercise?.weight);
    if (!name || !Number.isFinite(weight) || weight <= 0 || seen.has(name)) {
      return;
    }
    // Must have prior history for THIS exercise to legitimately beat.
    if (!bestWeight.has(name)) {
      return;
    }
    const reps = parseRepCount(exercise?.repsCompleted ?? exercise?.reps);
    const hasReps = Number.isFinite(reps) && reps > 0;
    const priorWeight = bestWeight.get(name);
    const priorE1rm = bestE1rm.get(name) || 0;
    const newE1rm = estimatedOneRepMax(weight, reps);

    if (weight > priorWeight) {
      records.push({ exercise: name, type: "heaviest_weight", label: "Heaviest ever", weight, reps: hasReps ? reps : null });
      seen.add(name);
    } else if (newE1rm > priorE1rm + 0.01) {
      records.push({
        exercise: name,
        type: "best_e1rm",
        label: "Best estimated 1RM",
        weight,
        reps: hasReps ? reps : null,
        estOneRepMax: Math.round(newE1rm)
      });
      seen.add(name);
    }
  });

  const newSessionVolume = sessionVolume(newWorkout);
  if (newSessionVolume > 0 && priorBestSessionVolume > 0 && newSessionVolume > priorBestSessionVolume) {
    records.push({ exercise: null, type: "session_volume", label: "Biggest session yet", volume: Math.round(newSessionVolume) });
  }

  const rank = { heaviest_weight: 0, best_e1rm: 1, session_volume: 2 };
  return records.sort((left, right) => rank[left.type] - rank[right.type]);
}

// Assemble the shareable "Week in Review" recap from real logged data over the
// rolling 7-day window. Every number is derived, never fabricated.
export function buildWeekInReview(data, options = {}) {
  const { isPremium = false, completion = null, referenceDate = new Date() } = options;
  const wellness = normalizeWellnessData(data);
  const allWorkouts = (wellness.workouts || []).map(normalizeWorkout);
  const { start, end } = getWorkoutWeekWindow(referenceDate);
  const startMs = start.getTime();
  const endMs = end.getTime();
  const inWindow = (workout) => {
    const logged = new Date(workout.loggedAt).getTime();
    return Number.isFinite(logged) && logged >= startMs && logged <= endMs;
  };

  const weekWorkouts = allWorkouts.filter(inWindow);
  const workoutsCompleted = weekWorkouts.length;
  const totalVolume = Math.round(weekWorkouts.reduce((sum, workout) => sum + sessionVolume(workout), 0));
  const exercisesCompleted = weekWorkouts.reduce(
    (sum, workout) => sum + (Array.isArray(workout.exercises) ? workout.exercises.length : 0),
    0
  );
  // Canonical freeze-protected streak — must match the StreakCard that launches
  // this recap (was strict calculateWorkoutStreak, which contradicted it).
  const streak = buildStreakStatus(data).streak;

  // Personal records earned during the window: walk chronologically so each
  // workout is compared only against everything logged before it.
  const chronological = [...allWorkouts].sort(
    (left, right) => new Date(left.loggedAt).getTime() - new Date(right.loggedAt).getTime()
  );
  const rawRecords = [];
  chronological.forEach((workout, index) => {
    if (!inWindow(workout)) {
      return;
    }
    detectPersonalRecords(chronological.slice(0, index), workout).forEach((record) => rawRecords.push(record));
  });
  // Collapse to distinct achievements: the best strength record per exercise plus
  // a single best session-volume record — so "N new records" isn't inflated by a
  // lift that trips both a weight PR and a volume PR in the same session.
  const bestByExercise = new Map();
  let bestVolumeRecord = null;
  for (const record of rawRecords) {
    if (record.type === "session_volume") {
      if (!bestVolumeRecord || record.volume > bestVolumeRecord.volume) bestVolumeRecord = record;
      continue;
    }
    const prev = bestByExercise.get(record.exercise);
    if (!prev || (record.weight || 0) > (prev.weight || 0)) bestByExercise.set(record.exercise, record);
  }
  const records = [...bestByExercise.values()];
  if (bestVolumeRecord) records.push(bestVolumeRecord);

  const weeklyGoalTarget = isPremium ? 4 : FREE_WEEKLY_WORKOUT_LIMIT;

  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    workoutsCompleted,
    streak,
    totalVolume,
    exercisesCompleted,
    personalRecords: records,
    prCount: records.length,
    consistency: typeof completion === "number" ? completion : null,
    weeklyGoal: { completed: workoutsCompleted, target: weeklyGoalTarget },
    hasActivity: workoutsCompleted > 0
  };
}

// ---------------------------------------------------------------------------
// ATTENTIVE INSIGHT ENGINE
// Turns real logged data into personal, evidence-backed observations. Every
// generator is gated on sufficient real data — if the data doesn't support a
// claim, the insight is simply not produced (nothing is ever fabricated).
// Insights carry evidence, confidence, an explainable reason, and an action;
// they are ranked by priority x confidence and recomputed live on each load.
// ---------------------------------------------------------------------------
const INSIGHT_MAJOR_GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core"];
const INSIGHT_CONFIDENCE_WEIGHT = { high: 1, medium: 0.72, low: 0.45 };
const INSIGHT_DAY_NAMES = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

function insightDaysSince(iso, nowMs) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return null;
  return Math.floor((nowMs - time) / DAY_MS);
}

function normalizeInsightGroup(name) {
  const value = String(name || "").toLowerCase();
  if (/chest|pec|bench/.test(value)) return "chest";
  if (/back|lat|row|pulldown|deadlift/.test(value)) return "back";
  if (/leg|quad|glute|hamstring|calf|squat|lunge/.test(value)) return "legs";
  if (/shoulder|delt|overhead|military/.test(value)) return "shoulders";
  if (/bicep|tricep|\barm\b|curl|pushdown/.test(value)) return "arms";
  if (/core|\bab\b|abs|oblique|plank/.test(value)) return "core";
  return null;
}

export function buildInsights(data, options = {}) {
  const nowMs = options.now || Date.now();
  const wellness = normalizeWellnessData(data);
  const workouts = sortWorkoutsDesc((wellness.workouts || []).map(normalizeWorkout));
  // Weights are stored in the user's own input unit (not converted), so the fix
  // for the metric/imperial mismatch is a correct LABEL — matching what the
  // Week-in-Review and celebrations show — never a hardcoded "lb".
  const unit = String(wellness.profile?.unitPreference || "").toLowerCase() === "metric" ? "kg" : "lb";
  const insights = [];
  const add = (insight) => {
    if (insight) insights.push(insight);
  };

  // Not enough history to read patterns — say so honestly and point forward.
  if (workouts.length < 2) {
    add({
      id: "activation",
      category: "activation",
      priority: 100,
      confidence: "high",
      title: workouts.length === 0 ? "Let's get your first session in" : "One more session unlocks your patterns",
      message:
        workouts.length === 0
          ? "Log your first workout and PulsePeak starts learning how you train — your records, best days, and momentum."
          : "Log one more session and PulsePeak can start spotting your trends, records, and best training days.",
      evidence: `${workouts.length} session${workouts.length === 1 ? "" : "s"} logged so far`,
      action: { label: "Start a workout", to: "/workouts" },
      reason: "There isn't enough history yet to read your patterns — this is the honest next step."
    });
    return insights;
  }

  const exerciseHistory = buildExerciseHistory(workouts);
  const streak = buildStreakStatus(data);
  const lastWorkout = workouts[0];
  const daysSinceLast = insightDaysSince(lastWorkout.loggedAt, nowMs);

  // Comeback — you've trained before but have been away.
  if (daysSinceLast !== null && daysSinceLast >= 4) {
    add({
      id: "comeback",
      category: "comeback",
      priority: 92,
      confidence: "high",
      title: `Welcome back — it's been ${daysSinceLast} days`,
      message: `Your last session was ${daysSinceLast} days ago. Ease back in with something familiar and rebuild momentum.`,
      evidence: `Last workout: ${lastWorkout.name}`,
      action: { label: "Start a workout", to: "/workouts" },
      reason: `You've trained before but haven't logged in ${daysSinceLast} days.`
    });
  }

  // Streak risk — active streak, not trained today.
  if (streak.state === "at_risk" && streak.streak >= 1) {
    add({
      id: "streak-risk",
      category: "streak",
      priority: 96,
      confidence: "high",
      title: `Your ${streak.streak}-day streak is on the line`,
      message: `Train today to keep your ${streak.streak}-day streak alive.${
        streak.freezesRemaining > 0
          ? ` You have ${streak.freezesRemaining} freeze${streak.freezesRemaining === 1 ? "" : "s"} left, but a session is the sure thing.`
          : ""
      }`,
      evidence: `${streak.streak}-day streak · not trained today`,
      action: { label: "Train today", to: "/workouts" },
      reason: "You have an active streak and haven't trained yet today."
    });
  }

  // PR opportunity — a recently-trained lift with a clear best to chase.
  const prCandidate = exerciseHistory
    .filter(
      (entry) =>
        entry.bestWeight &&
        entry.lastPerformedAt &&
        insightDaysSince(entry.lastPerformedAt, nowMs) <= 14 &&
        entry.entries.length >= 2
    )
    .sort((a, b) => (b.bestWeight || 0) - (a.bestWeight || 0))[0];
  if (prCandidate) {
    const last = prCandidate.entries[0];
    add({
      id: `pr-op-${prCandidate.name}`,
      category: "pr_opportunity",
      priority: 82,
      confidence: "high",
      title: `Ready for a ${prCandidate.name} PR?`,
      message: `Last time you hit ${last?.weight} ${unit}${last?.repsCompleted ? ` × ${last.repsCompleted}` : ""}. Your best is ${prCandidate.bestWeight} ${unit} — today could be the day you beat it.`,
      evidence: `Best ${prCandidate.bestWeight} ${unit} · last ${last?.weight} ${unit}`,
      action: { label: "Start a session", to: "/workouts" },
      reason: `You've trained ${prCandidate.name} in the last two weeks and have a clear personal best to chase.`
    });
  }

  // Neglected major muscle group — trained before, but overdue.
  const groupLast = new Map();
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const group = normalizeInsightGroup(exercise.muscleGroup) || normalizeInsightGroup(exercise.name);
      if (!group) return;
      const time = new Date(workout.loggedAt).getTime();
      if (!groupLast.has(group) || time > groupLast.get(group)) {
        groupLast.set(group, time);
      }
    });
  });
  let neglected = null;
  for (const group of INSIGHT_MAJOR_GROUPS) {
    if (!groupLast.has(group)) continue; // never trained -> not "neglected"
    const days = Math.floor((nowMs - groupLast.get(group)) / DAY_MS);
    if (days >= 8 && (!neglected || days > neglected.days)) {
      neglected = { group, days };
    }
  }
  if (neglected) {
    add({
      id: `neglected-${neglected.group}`,
      category: "balance",
      priority: 76,
      confidence: "medium",
      title: `Your ${neglected.group} is overdue`,
      message: `You haven't trained ${neglected.group} in ${neglected.days} days. A ${neglected.group} session would rebalance your week.`,
      evidence: `${neglected.days} days since your last ${neglected.group} work`,
      action: { label: `Train ${neglected.group}`, to: "/workouts" },
      reason: `You train ${neglected.group} normally, but it's been ${neglected.days} days.`
    });
  }

  // Recent strength improvement — TRUE earliest vs latest weighted set for a lift
  // (from full history, not the 6-entry display cap, so the gain/timespan is real).
  const improved = exerciseHistory
    .map((entry) => {
      if ((entry.weightedCount || 0) < 3) return null;
      const latest = Number(entry.lastWeight);
      const earliest = Number(entry.earliestWeight);
      if (!Number.isFinite(latest) || !Number.isFinite(earliest) || !(latest > earliest)) return null;
      return {
        name: entry.name,
        gain: latest - earliest,
        latest,
        earliest,
        days: insightDaysSince(entry.earliestAt, nowMs)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.gain - a.gain)[0];
  if (improved) {
    const weeks = Math.max(1, Math.round((improved.days || 7) / 7));
    add({
      id: `improved-${improved.name}`,
      category: "progress",
      priority: 68,
      confidence: "high",
      title: `Your ${improved.name} is climbing`,
      message: `Up ${improved.gain} ${unit} — from ${improved.earliest} to ${improved.latest} ${unit} over about ${weeks} week${weeks === 1 ? "" : "s"}. Keep the pressure on.`,
      evidence: `${improved.earliest} → ${improved.latest} ${unit}`,
      action: { label: "See progress", to: "/progress" },
      reason: `${improved.name} has moved up across your recent sessions.`
    });
  }

  // Weekly momentum — this week vs your best of the prior three weeks.
  const weekCount = (weeksAgo) =>
    workouts.filter((workout) => {
      const days = insightDaysSince(workout.loggedAt, nowMs);
      return days !== null && days >= weeksAgo * 7 && days < (weeksAgo + 1) * 7;
    }).length;
  const thisWeek = weekCount(0);
  const priorBestWeek = Math.max(weekCount(1), weekCount(2), weekCount(3));
  if (thisWeek >= 1 && priorBestWeek >= 2 && thisWeek + 1 > priorBestWeek && thisWeek <= priorBestWeek) {
    add({
      id: "weekly-momentum",
      category: "momentum",
      priority: 72,
      confidence: "high",
      title: "One session from your best week in a month",
      message: `You've logged ${thisWeek} this week. One more beats your best of the last month (${priorBestWeek}).`,
      evidence: `This week ${thisWeek} · recent best ${priorBestWeek}`,
      action: { label: "Log a session", to: "/workouts" },
      reason: "Your session count this week is one short of your recent best."
    });
  }

  // Monthly volume trend. Requires a real baseline in BOTH months (≥2 sessions
  // each) so a ramp-up from a near-empty month isn't dressed up as a "+400%
  // trend", and skips implausibly large swings that are ramps, not trends.
  const windowWorkouts = (startDaysAgo, endDaysAgo) =>
    workouts.filter((workout) => {
      const days = insightDaysSince(workout.loggedAt, nowMs);
      return days !== null && days >= endDaysAgo && days < startDaysAgo;
    });
  const thisMonthWorkouts = windowWorkouts(30, 0);
  const lastMonthWorkouts = windowWorkouts(60, 30);
  const thisMonthVol = thisMonthWorkouts.reduce((sum, workout) => sum + sessionVolume(workout), 0);
  const lastMonthVol = lastMonthWorkouts.reduce((sum, workout) => sum + sessionVolume(workout), 0);
  if (thisMonthWorkouts.length >= 2 && lastMonthWorkouts.length >= 2 && thisMonthVol > 0 && lastMonthVol > 0) {
    const pct = Math.round(((thisMonthVol - lastMonthVol) / lastMonthVol) * 100);
    if (Math.abs(pct) >= 15 && Math.abs(pct) <= 100) {
      add({
        id: "volume-trend",
        category: "progress",
        priority: 60,
        confidence: "medium",
        title: pct > 0 ? `Volume up ${pct}% this month` : `Volume down ${Math.abs(pct)}% this month`,
        message:
          pct > 0
            ? `You've moved ${pct}% more weight than last month — the work is compounding.`
            : `Your training volume is down ${Math.abs(pct)}% vs last month. Worth a look if it wasn't a planned deload.`,
        evidence: `${Math.round(thisMonthVol).toLocaleString()} vs ${Math.round(lastMonthVol).toLocaleString()} ${unit}`,
        action: { label: "See progress", to: "/progress" },
        reason: "Comparing your total training volume this month against last month."
      });
    }
  }

  // Plateau — same top weight on a lift for 3+ recent sessions.
  const plateau = exerciseHistory
    .map((entry) => {
      const weighted = entry.entries.filter((item) => Number(item.weight) > 0).slice(0, 4);
      if (weighted.length < 3) return null;
      const weights = weighted.map((item) => Number(item.weight));
      return weights.every((weight) => weight === weights[0])
        ? { name: entry.name, weight: weights[0], count: weighted.length }
        : null;
    })
    .filter(Boolean)[0];
  if (plateau) {
    add({
      id: `plateau-${plateau.name}`,
      category: "plateau",
      priority: 54,
      confidence: "medium",
      title: `${plateau.name} has stalled`,
      message: `You've hit ${plateau.weight} ${unit} on ${plateau.name} for ${plateau.count} sessions straight. Try one more rep, a small load bump, or a tempo change to break through.`,
      evidence: `${plateau.weight} ${unit} × ${plateau.count} sessions`,
      action: { label: "Start a session", to: "/workouts" },
      reason: `${plateau.name} hasn't progressed in your last ${plateau.count} logged sets.`
    });
  }

  // Best training day of the week (last ~8 weeks).
  const recentForDays = workouts.filter((workout) => {
    const days = insightDaysSince(workout.loggedAt, nowMs);
    return days !== null && days <= 56;
  });
  if (recentForDays.length >= 5) {
    const counts = {};
    recentForDays.forEach((workout) => {
      const day = new Date(workout.loggedAt).getDay();
      counts[day] = (counts[day] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 3 && top[1] / recentForDays.length >= 0.34) {
      add({
        id: "best-day",
        category: "pattern",
        priority: 46,
        confidence: "medium",
        title: `${INSIGHT_DAY_NAMES[Number(top[0])]} are your day`,
        message: `You've trained on ${INSIGHT_DAY_NAMES[Number(top[0])]} more than any other day lately — ${top[1]} of your last ${recentForDays.length} sessions. Lean into what works.`,
        evidence: `${top[1]} of ${recentForDays.length} recent sessions`,
        action: null,
        reason: "Your logged sessions cluster on this weekday."
      });
    }
  }

  insights.sort(
    (a, b) =>
      b.priority * INSIGHT_CONFIDENCE_WEIGHT[b.confidence] - a.priority * INSIGHT_CONFIDENCE_WEIGHT[a.confidence]
  );
  return insights;
}

// The single most urgent, actionable thing to do next, derived from the ranked
// insights (falls back to an honest generic when nothing specific applies).
export function buildNextBestAction(insights = []) {
  const actionable = insights.find((insight) => insight.action && insight.action.to);
  if (!actionable) {
    return {
      title: "Start today's session",
      message: "Pick a workout and keep your momentum going.",
      to: "/workouts",
      reason: "Training is the highest-value thing you can do right now."
    };
  }
  return {
    title: actionable.action.label,
    message: actionable.title,
    to: actionable.action.to,
    reason: actionable.reason
  };
}

function inferWorkoutType(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("mobility")) {
    return "mobility";
  }
  if (lower.includes("hiit") || lower.includes("cardio")) {
    return "cardio";
  }
  return "strength";
}

function inferWorkoutFocus(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("chest") && lower.includes("triceps")) return "chest_triceps";
  if (lower.includes("back") && lower.includes("biceps")) return "back_biceps";
  if (lower.includes("push")) return "push";
  if (lower.includes("pull")) return "pull";
  if (lower.includes("legs")) return "legs";
  if (lower.includes("shoulders")) return "shoulders";
  if (lower.includes("upper")) return "upper_body";
  if (lower.includes("lower")) return "lower_body";
  if (lower.includes("full body")) return "full_body";
  if (lower.includes("mobility") || lower.includes("recovery")) return "mobility_recovery";
  return null;
}

function calculateWorkoutStreak(workouts) {
  const workoutDates = new Set(workouts.map((workout) => workout.loggedAt.slice(0, 10)));
  let streak = 0;

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(Date.now() - index * DAY_MS).toISOString().slice(0, 10);
    if (workoutDates.has(date)) {
      streak += 1;
      continue;
    }

    if (index === 0) {
      continue;
    }

    break;
  }

  return streak;
}

// How many missed days a streak may bridge before it breaks. This is a rule,
// not depleting per-user state: "remaining" is derived from the gaps already in
// the current streak, so the whole thing stays deterministic and honest.
const STREAK_FREEZE_ALLOWANCE = 2;

// Walk back day-by-day from today. Trained days grow the streak; a missed day
// (not today) is bridged by a freeze if the allowance isn't spent, otherwise the
// streak breaks. Bridged days do NOT count toward the streak length, and only
// gaps that fall BETWEEN trained days count as freezes used (trailing misses
// after the oldest streak day bridge to nothing and are not charged).
function computeStreakWithFreezes(workouts, freezeAllowance, nowMs = Date.now()) {
  const trained = new Set((workouts || []).map((workout) => String(workout.loggedAt).slice(0, 10)));
  const dateAt = (index) => new Date(nowMs - index * DAY_MS).toISOString().slice(0, 10);

  let streak = 0;
  let misses = 0;
  let lastTrainedIndex = -1;
  for (let index = 0; index < 400; index += 1) {
    if (trained.has(dateAt(index))) {
      streak += 1;
      lastTrainedIndex = index;
      continue;
    }
    if (index === 0) {
      continue; // today isn't over — no penalty for not having trained yet
    }
    if (misses < freezeAllowance) {
      misses += 1; // a freeze may bridge this missed day
      continue;
    }
    break;
  }

  // Charge only the missed days that actually bridge gaps inside the streak span.
  let freezesUsed = 0;
  for (let index = 1; index <= lastTrainedIndex; index += 1) {
    if (!trained.has(dateAt(index))) {
      freezesUsed += 1;
    }
  }

  return { streak, freezesUsed };
}

// Longest freeze-protected streak ever, using the SAME semantics as the current
// streak (each trained day is treated as an "anchor today"). Guarantees
// longest >= current, so the two can never contradict on screen.
function computeLongestStreak(workouts, freezeAllowance) {
  const trainedDates = [...new Set((workouts || []).map((workout) => String(workout.loggedAt).slice(0, 10)))];
  let best = 0;
  for (const date of trainedDates) {
    const anchorMs = new Date(`${date}T12:00:00.000Z`).getTime();
    if (!Number.isFinite(anchorMs)) continue;
    const { streak } = computeStreakWithFreezes(workouts, freezeAllowance, anchorMs);
    if (streak > best) best = streak;
  }
  return best;
}

// Retention-facing streak status: current streak (freeze-protected), how much of
// the freeze buffer is spent, and the loop state (active / at_risk / broken /
// none) used to pick the right reinforcement + return-prompt copy client-side.
export function buildStreakStatus(data) {
  const wellness = normalizeWellnessData(data);
  const workouts = (wellness.workouts || []).map(normalizeWorkout);
  const trained = new Set(workouts.map((workout) => String(workout.loggedAt).slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);
  const trainedToday = trained.has(today);
  const { streak, freezesUsed } = computeStreakWithFreezes(workouts, STREAK_FREEZE_ALLOWANCE);
  const hasEverTrained = workouts.length > 0;

  let state;
  if (streak === 0) {
    state = hasEverTrained ? "broken" : "none";
  } else {
    state = trainedToday ? "active" : "at_risk";
  }

  return {
    streak,
    longestStreak: Math.max(streak, computeLongestStreak(workouts, STREAK_FREEZE_ALLOWANCE)),
    freezesTotal: STREAK_FREEZE_ALLOWANCE,
    freezesUsed,
    freezesRemaining: Math.max(0, STREAK_FREEZE_ALLOWANCE - freezesUsed),
    trainedToday,
    atRisk: state === "at_risk",
    state,
    weeklyCompleted: countWeeklyLoggedWorkouts(workouts),
    weeklyMinutes: sumWeeklyLoggedMinutes(workouts)
  };
}

export function sortWorkoutsDesc(workouts) {
  return [...workouts].sort((left, right) => new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime());
}

export function hasRecentWorkoutDuplicate(workouts, candidateWorkout, minutesWindow = 10) {
  const candidateTime = new Date(candidateWorkout.loggedAt).getTime();
  return workouts.some((workout) => {
    const sameIdentity =
      (candidateWorkout.presetId && workout.presetId === candidateWorkout.presetId) ||
      workout.name.trim().toLowerCase() === candidateWorkout.name.trim().toLowerCase();

    if (!sameIdentity) {
      return false;
    }

    const deltaMinutes = Math.abs(candidateTime - new Date(workout.loggedAt).getTime()) / (1000 * 60);
    return deltaMinutes <= minutesWindow;
  });
}
