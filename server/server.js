import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import {
  buildCoachDecisionEngine,
  buildCoachingTips,
  buildWeeklyCheckInState,
  buildWorkoutAccess,
  buildLimitedWeeklyPlan,
  buildWeeklyPlan,
  canStartTrial,
  calculateStreak,
  clearSession,
  countWeeklyLoggedWorkouts,
  createSession,
  createUser,
  findUserById,
  findUserByToken,
  getAccessTier,
  hasRecentWorkoutDuplicate,
  isPremiumEntitled,
  normalizeWorkout,
  normalizeWellnessData,
  sanitizeUser,
  sortWorkoutsDesc,
  summarizeDashboard,
  updateUserAccount,
  updateUserData,
  validateUser
} from "./data/store.js";
import { getMovementLibrary } from "./data/movementLibrary.js";
import { createWorkoutFromPreset, findWorkoutPresetForProfile, getExerciseLibraryCatalog, getExerciseLibraryRecordById, getWorkoutLibraryForProfile, getWorkoutLibraryMeta } from "./data/workoutLibrary.js";
import { applyStripeWebhookEvent } from "./stripeBilling.js";
import { CUSTOMIZABLE_MODULE_IDS } from "../shared/dashboardModules.js";
import { normalizeUnitPreference } from "../shared/unitSystem.js";
import {
  buildEquipmentProfileFromSelections,
  getEquipmentSelectionsForProfile,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../shared/workoutEngine.js";
import { APP_MODES, getHiddenModulesForAppMode, normalizeAppMode } from "../shared/appModes.js";
import { normalizeVisualModelPreference } from "../shared/profileState.js";

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const distPath = path.resolve(__dirname, "../dist");
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const monthlyPriceId = process.env.STRIPE_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID;
const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ID_YEARLY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const premiumPlanAmount = Number(process.env.STRIPE_PREMIUM_PRICE_CENTS || 1499);
const premiumPlanYearlyAmount = Number(process.env.STRIPE_PREMIUM_YEARLY_PRICE_CENTS || 11999);
const premiumPlanCurrency = process.env.STRIPE_PREMIUM_CURRENCY || "usd";
const TRIAL_DURATION_DAYS = 7;
const PRIMARY_WEBHOOK_PATH = "/api/webhook";
const LEGACY_WEBHOOK_PATH = "/api/stripe/webhook";
const appOrigin = normalizePublicOrigin(process.env.APP_ORIGIN);
const allowedCorsOrigins = buildAllowedCorsOrigins(process.env.CORS_ALLOWED_ORIGINS, appOrigin);

logStripeConfigurationWarnings();

app.set("trust proxy", 1);
app.use(
  cors(
    allowedCorsOrigins.length
      ? {
          origin(origin, callback) {
            if (!origin || allowedCorsOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error("CORS origin not allowed."));
          }
        }
      : {}
  )
);

function handleStripeWebhook(request, response) {
  try {
    if (!stripe || !stripeWebhookSecret) {
      throw new Error("Stripe webhook is not configured.");
    }

    const signature = request.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      return response.status(400).json({ message: "Missing Stripe signature." });
    }

    const event = stripe.webhooks.constructEvent(request.body, signature, stripeWebhookSecret);
    const result = applyStripeWebhookEvent(event);
    return response.json({
      received: true,
      duplicate: Boolean(result?.ignored)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
}

app.post(PRIMARY_WEBHOOK_PATH, express.raw({ type: "application/json" }), handleStripeWebhook);
app.post(LEGACY_WEBHOOK_PATH, express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", (request, response) => {
  try {
    const { name, email, password } = request.body;
    assertValidName(name);
    assertValidEmail(email);
    assertValidPassword(password);

    const user = createUser({ name, email, password });
    const token = createSession(user.id);

    return response.status(201).json({
      token,
      user: sanitizeUser(user),
      dashboard: buildUserSummary(user)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/auth/login", (request, response) => {
  try {
    const { email, password } = request.body;
    assertValidEmail(email);
    assertValidPassword(password, true);
    const user = validateUser(email, password);

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const token = createSession(user.id);
    return response.json({
      token,
      user: sanitizeUser(user),
      dashboard: buildUserSummary(user)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/auth/session", requireAuth, (request, response) => {
  response.json({
    user: sanitizeUser(request.user),
    dashboard: buildUserSummary(request.user)
  });
});

app.post("/api/auth/logout", requireAuth, (request, response) => {
  clearSession(request.token);
  response.status(204).end();
});

app.get("/api/dashboard", requireAuth, (request, response) => {
  response.json({
    user: sanitizeUser(request.user),
    data: request.user.data,
    summary: buildUserSummary(request.user)
  });
});

app.get("/api/workout-library", requireAuth, (request, response) => {
  const environment = request.query.environment || "both";
  const workoutType = request.query.type || "all";
  const focus = request.query.focus || "recommended";
  const equipmentSelections = parseEquipmentSelectionsQuery(
    request.query.equipmentSelections,
    request.user.data.profile?.trainingEnvironment,
    request.user.data.profile
  );
  const equipmentProfile =
    request.query.equipmentProfile ||
    buildEquipmentProfileFromSelections(equipmentSelections, request.user.data.profile?.trainingEnvironment);
  const lowRecovery = normalizeWellnessData(request.user.data).sleepHours < 6.5 || normalizeWellnessData(request.user.data).energyLevel === "Low";
  const filters = {
    environment,
    type: workoutType,
    focus,
    equipmentProfile,
    equipmentSelections,
    lowRecovery
  };
    const recentWorkouts = sortWorkoutsDesc((request.user.data.workouts || []).map(normalizeWorkout));
    const accessTier = getAccessTier(request.user);
    const workouts = getWorkoutLibraryForProfile(filters, request.user.data.profile, recentWorkouts, accessTier).filter(
      (workout) => workoutType === "all" || workout.type === workoutType
    );

  response.json({
    environment,
    equipmentProfile,
    equipmentSelections,
    type: workoutType,
    focus,
    workouts,
      meta: getWorkoutLibraryMeta(filters, request.user.data.profile, workouts, recentWorkouts, accessTier)
  });
});

app.get("/api/exercise-library", requireAuth, (_request, response) => {
  response.json(getExerciseLibraryCatalog());
});

app.get("/api/exercise-library/:id", requireAuth, (request, response) => {
  const record = getExerciseLibraryRecordById(request.params.id);
  if (!record) {
    return response.status(404).json({ message: "Exercise not found." });
  }

  return response.json(record);
});

app.get("/api/movements", requireAuth, (_request, response) => {
  response.json({
    movements: getMovementLibrary()
  });
});

app.patch("/api/goals", requireAuth, (request, response) => {
  try {
    const nextGoals = {
      calories: parseNumberInRange(request.body.calories, 1200, 6000, "Calories"),
      protein: parseNumberInRange(request.body.protein, 40, 400, "Protein"),
      water: parseNumberInRange(request.body.water, 1, 10, "Water"),
      sleep: parseNumberInRange(request.body.sleep, 4, 14, "Sleep"),
      workoutMinutes: parseNumberInRange(request.body.workoutMinutes, 10, 240, "Workout minutes")
    };

  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    goals: nextGoals
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.patch("/api/profile", requireAuth, (request, response) => {
  try {
    const currentProfile = normalizeWellnessData(request.user.data).profile;
    const birthdate = parseOptionalBirthdate(request.body.birthdate);
    const explicitGoalType = parseOptionalGoalType(request.body.goalType);
    const mergedGoalType = explicitGoalType || currentProfile.goalType;
    const nextAppMode = request.body.appMode !== undefined ? parseAppMode(request.body.appMode) : undefined;
    const nextProfile = {
      ...(explicitGoalType ? { goalType: explicitGoalType } : {}),
      ...(birthdate ? { birthdate, ageGroup: deriveAgeGroupFromBirthdate(birthdate) } : {}),
      ...(typeof request.body.ageGroup === "string" && request.body.ageGroup.trim() && !birthdate
        ? { ageGroup: parseAgeGroup(request.body.ageGroup) }
        : {}),
      ...(request.body.experienceLevel !== undefined
        ? { experienceLevel: parseExperienceLevel(request.body.experienceLevel) }
        : {}),
      ...(request.body.trainingEnvironment !== undefined
        ? { trainingEnvironment: parseTrainingEnvironment(request.body.trainingEnvironment) }
        : {}),
      ...(request.body.equipmentSelections !== undefined
        ? {
            equipmentSelections: parseEquipmentSelections(
              request.body.equipmentSelections,
              request.body.trainingEnvironment ?? currentProfile.trainingEnvironment,
              request.body.equipmentProfile
            )
          }
        : {}),
      ...(request.body.equipmentProfile !== undefined
        ? { equipmentProfile: parseEquipmentProfile(request.body.equipmentProfile, request.body.trainingEnvironment ?? currentProfile.trainingEnvironment) }
        : {}),
      ...(request.body.injuryStatus !== undefined ? { injuryStatus: parseInjuryStatus(request.body.injuryStatus) } : {}),
      ...(request.body.nutritionMode !== undefined
        ? { nutritionMode: parseNutritionMode(request.body.nutritionMode, mergedGoalType) }
        : {}),
      ...(nextAppMode !== undefined ? { appMode: nextAppMode } : {}),
      ...(request.body.sex !== undefined ? { sex: parseSex(request.body.sex) } : {}),
      ...(request.body.unitPreference !== undefined ? { unitPreference: parseUnitPreference(request.body.unitPreference) } : {}),
      ...(request.body.heightCm !== undefined ? { heightCm: parseOptionalMeasurement(request.body.heightCm, 120, 230, "Height") } : {}),
      ...(request.body.currentWeight !== undefined
        ? { currentWeight: parseOptionalMeasurement(request.body.currentWeight, 80, 500, "Current weight") }
        : {}),
      ...(request.body.targetWeight !== undefined
        ? { targetWeight: parseOptionalMeasurement(request.body.targetWeight, 80, 500, "Target weight") }
        : {}),
      ...(request.body.moduleOrder !== undefined ? { moduleOrder: parseModuleOrder(request.body.moduleOrder) } : {}),
      ...(request.body.hiddenModules !== undefined ? { hiddenModules: parseHiddenModules(request.body.hiddenModules) } : {}),
      ...(request.body.exerciseGuidanceLevel !== undefined
        ? { exerciseGuidanceLevel: parseExerciseGuidanceLevel(request.body.exerciseGuidanceLevel) }
        : {}),
      ...(request.body.visualModelPreference !== undefined
        ? { visualModelPreference: parseVisualModelPreference(request.body.visualModelPreference) }
        : {}),
      ...(request.body.showWarmup !== undefined ? { showWarmup: parseBooleanSetting(request.body.showWarmup) } : {}),
      ...(request.body.showCooldown !== undefined ? { showCooldown: parseBooleanSetting(request.body.showCooldown) } : {}),
      onboardingCompleted: parseOptionalBoolean(request.body.onboardingCompleted),
      ...(request.body.restrictedAreas !== undefined ? { restrictedAreas: parseRestrictedAreas(request.body.restrictedAreas) } : {})
    };

    const updatedUser = updateUserData(request.user.id, (data) => ({
      ...data,
      profile: {
        ...data.profile,
        ...nextProfile,
        equipmentProfile:
          nextProfile.equipmentSelections !== undefined
            ? buildEquipmentProfileFromSelections(
                nextProfile.equipmentSelections,
                nextProfile.trainingEnvironment ?? data.profile?.trainingEnvironment
              )
            : nextProfile.equipmentProfile || data.profile?.equipmentProfile,
        hiddenModules:
          nextAppMode !== undefined
            ? getHiddenModulesForAppMode(nextAppMode)
            : nextProfile.hiddenModules !== undefined
              ? nextProfile.hiddenModules
              : data.profile?.hiddenModules,
        onboardingCompleted:
          typeof nextProfile.onboardingCompleted === "boolean"
            ? nextProfile.onboardingCompleted
            : data.profile?.onboardingCompleted ?? false
      }
    }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/hydration", requireAuth, (request, response) => {
  try {
    const amount = parseNumberInRange(request.body.amount || 0, 0.1, 2, "Hydration amount");
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    waterIntake: Number((data.waterIntake + amount).toFixed(2))
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/workouts/saved", requireAuth, (request, response) => {
  try {
    const workout = request.body?.workout;
    if (!workout || typeof workout !== "object") {
      throw new Error("Workout is required.");
    }

    const savedId = String(workout.presetId || workout.id || "").trim();
    if (!savedId) {
      throw new Error("Workout id is required.");
    }

    const wasSaved = (request.user.data?.savedWorkouts || []).some((entry) => String(entry.presetId || entry.id || "").trim() === savedId);
    const updatedUser = updateUserData(request.user.id, (data) => {
      const savedWorkouts = Array.isArray(data.savedWorkouts) ? [...data.savedWorkouts] : [];
      const existingIndex = savedWorkouts.findIndex((entry) => String(entry.presetId || entry.id || "").trim() === savedId);

      if (existingIndex >= 0) {
        savedWorkouts.splice(existingIndex, 1);
      } else {
        savedWorkouts.unshift({
          id: workout.id || savedId,
          presetId: workout.presetId || workout.id || null,
          name: workout.name,
          type: workout.type,
          environment: workout.environment,
          focus: workout.focus,
          focusLabel: workout.focusLabel,
          duration: workout.duration,
          intensity: workout.intensity,
          summary: workout.summary,
          continuityNote: workout.continuityNote,
          varietyNote: workout.varietyNote,
          equipmentProfile: workout.equipmentProfile,
          equipmentSummary: workout.equipmentSummary,
          primaryMuscles: workout.primaryMuscles,
          exercises: Array.isArray(workout.exercises)
            ? workout.exercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup,
                movementId: exercise.movement?.id || exercise.movementId || null
              }))
            : [],
          savedAt: new Date().toISOString()
        });
      }

      return {
        ...data,
        savedWorkouts
      };
    });

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser),
      saved: !wasSaved
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/recovery", requireAuth, (request, response) => {
  try {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    sleepHours: parseNumberInRange(request.body.sleepHours, 0, 14, "Sleep hours"),
    energyLevel: parseEnergyLevel(request.body.energyLevel)
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/meals", requireAuth, (request, response) => {
  try {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    meals: [
      {
        id: crypto.randomUUID(),
        name: parseText(request.body.name, "Meal name", 2, 40),
        calories: parseNumberInRange(request.body.calories, 0, 3000, "Calories"),
        protein: parseNumberInRange(request.body.protein, 0, 300, "Protein")
      },
      ...data.meals
    ]
  }));

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/protein-checkins", requireAuth, (request, response) => {
  try {
    const profile = normalizeWellnessData(request.user.data).profile;
    if (profile.nutritionMode === "off") {
      throw new Error("Protein check-ins are turned off until nutrition tracking is enabled.");
    }

    const grams = parseNumberInRange(request.body.protein, 5, 120, "Protein");
    const source = String(request.body.source || "").trim();
    const entryName = source ? `Protein check-in: ${source}` : "Protein check-in";
    const updatedUser = updateUserData(request.user.id, (data) => ({
      ...data,
      meals: [
        {
          id: crypto.randomUUID(),
          name: entryName,
          calories: 0,
          protein: grams
        },
        ...data.meals
      ]
    }));

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.delete("/api/meals/:id", requireAuth, (request, response) => {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    meals: data.meals.filter((meal) => meal.id !== request.params.id)
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/workouts", requireAuth, (request, response) => {
  try {
    const exercises = Array.isArray(request.body.exercises) ? request.body.exercises.map(parseExercise) : [];
    const workoutEntry = normalizeWorkout({
      id: crypto.randomUUID(),
      name: parseText(request.body.name, "Workout name", 2, 40),
      type: parseWorkoutType(request.body.type),
      environment: parseEnvironment(request.body.environment),
      duration: parseNumberInRange(request.body.duration, 5, 300, "Workout duration"),
      intensity: parseIntensity(request.body.intensity),
      exercises,
      loggedAt: new Date().toISOString()
    });
    if (!isPremiumEntitled(request.user)) {
      const weeklyLogged = countWeeklyLoggedWorkouts(request.user.data.workouts || []);
      if (weeklyLogged >= 2) {
        const workoutAccess = buildWorkoutAccess(request.user);
        return response.status(403).json({
          message: workoutAccess.canStartTrial
            ? "You’ve hit your free session limit. Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
            : "Free accounts can log up to 2 workouts each week. Upgrade to keep logging without the weekly cap.",
          code: "free_workout_cap",
          workoutAccess
        });
      }
    }
    const updatedUser = updateUserData(request.user.id, (data) => {
      const existingWorkouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
      if (hasRecentWorkoutDuplicate(existingWorkouts, workoutEntry)) {
        throw new Error("That workout was already logged recently. Give it a moment before logging it again.");
      }

      return {
        ...data,
        workouts: [workoutEntry, ...existingWorkouts]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/workouts/preset", requireAuth, (request, response) => {
  try {
    const preset = findWorkoutPresetForProfile(request.body.presetId, request.user.data.profile, {
      environment: request.body.environment || request.user.data.profile?.trainingEnvironment,
      equipmentProfile: request.body.equipmentProfile || request.user.data.profile?.equipmentProfile,
      equipmentSelections:
        request.body.equipmentSelections || getEquipmentSelectionsForProfile(request.user.data.profile),
      focus: request.body.focus || "recommended",
      lowRecovery: normalizeWellnessData(request.user.data).sleepHours < 6.5 || normalizeWellnessData(request.user.data).energyLevel === "Low"
    });
    if (!preset) {
      throw new Error("Workout preset not found.");
    }

    const workoutEntry = createWorkoutFromPreset(
      preset,
      Array.isArray(request.body.exercises) ? request.body.exercises.map(parseExercise) : null
    );
    if (!isPremiumEntitled(request.user)) {
      const weeklyLogged = countWeeklyLoggedWorkouts(request.user.data.workouts || []);
      if (weeklyLogged >= 2) {
        const workoutAccess = buildWorkoutAccess(request.user);
        return response.status(403).json({
          message: workoutAccess.canStartTrial
            ? "You’ve hit your free session limit. Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
            : "Free accounts can preview workouts all week, but logging stops after 2 sessions until you upgrade or the week resets.",
          code: "free_workout_cap",
          workoutAccess
        });
      }
    }
    const updatedUser = updateUserData(request.user.id, (data) => {
      const existingWorkouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
      if (hasRecentWorkoutDuplicate(existingWorkouts, workoutEntry)) {
        throw new Error("That workout was already logged recently. Give it a moment before logging it again.");
      }

      return {
        ...data,
        workouts: [workoutEntry, ...existingWorkouts]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.delete("/api/workouts/:id", requireAuth, (request, response) => {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    workouts: data.workouts.map(normalizeWorkout).filter((workout) => workout.id !== request.params.id)
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/habits/toggle", requireAuth, (request, response) => {
  const today = new Date().toISOString().slice(0, 10);
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    habits: data.habits.map((habit) => {
      if (habit.id !== request.body.habitId) {
        return habit;
      }

      const completedDates = new Set(habit.completedDates);
      if (completedDates.has(today)) {
        completedDates.delete(today);
      } else {
        completedDates.add(today);
      }

      return {
        ...habit,
        completedDates: Array.from(completedDates).sort()
      };
    })
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/weekly-check-in", requireAuth, (request, response) => {
  try {
    const checkIn = parseWeeklyCheckIn(request.body);
    const updatedUser = updateUserData(request.user.id, (data) => {
      const nextCheckIns = (data.weeklyCheckIns || []).filter((entry) => entry.weekKey !== checkIn.weekKey);
      return {
        ...data,
        weeklyCheckIns: [
          {
            ...checkIn,
            createdAt: new Date().toISOString()
          },
          ...nextCheckIns
        ]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/progress", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);

  response.json({
    weeklyHistory: summary.weeklyHistory,
    weightHistory: request.user.data.weightHistory,
    habits: summary.habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      streak: habit.streak,
      completedToday: habit.completedDates.includes(new Date().toISOString().slice(0, 10))
    }))
  });
});

app.get("/api/coaching", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);
  const coach = buildCoachDecisionEngine(
    request.user.data,
    {
      totals: summary.totals,
      habits: summary.habits,
      completion: summary.completion,
      workouts: request.user.data.workouts
    },
    isPremiumEntitled(request.user)
  );
  response.json({
    coach,
    recommendations: summary.insights,
    notes: request.user.data.notes,
    recoveryFocus: buildRecoveryFocus(request.user.data, summary)
  });
});

app.post("/api/checkout-session", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable upgrades.");
    }

    if (isPremiumEntitled(request.user)) {
      return response.status(400).json({ message: "Your account is already on Premium." });
    }

    const requestedBillingInterval = parseBillingInterval(request.body?.billingInterval);
    const checkoutMode = parseCheckoutMode(request.body?.checkoutMode);
    const trialEligible = canStartTrial(request.user) && checkoutMode !== "upgrade_now";
    const billingInterval = trialEligible ? "yearly" : requestedBillingInterval;
    const appOrigin = getAppOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${appOrigin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/billing/cancel`,
      client_reference_id: request.user.id,
      customer_email: request.user.email,
      metadata: {
        userId: request.user.id,
        tier: "premium",
        billingInterval,
        checkoutMode
      },
      subscription_data: {
        ...(trialEligible ? { trial_period_days: TRIAL_DURATION_DAYS } : {}),
        metadata: {
          userId: request.user.id,
          billingInterval,
          checkoutMode
        }
      },
      line_items: [buildCheckoutLineItem(billingInterval)]
    });

    return response.status(201).json({
      sessionId: session.id,
      checkoutUrl: session.url,
      billingInterval,
      checkoutMode,
      trialEligible
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/billing-portal", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to manage subscriptions.");
    }

    let billingUser = request.user;
    let customerId = billingUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: billingUser.email,
        name: billingUser.name,
        metadata: {
          userId: billingUser.id
        }
      });

      billingUser = updateUserAccount(billingUser.id, (user) => ({
        ...user,
        stripeCustomerId: customer.id
      }));
      customerId = customer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppOrigin(request)}/`
    });

    return response.status(201).json({
      url: portalSession.url
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/checkout/confirm", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable upgrades.");
    }

    const sessionId = String(request.body.sessionId || "").trim();
    if (!sessionId) {
      throw new Error("Missing checkout session ID.");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"]
    });

    if (session.client_reference_id !== request.user.id || session.metadata?.userId !== request.user.id) {
      return response.status(403).json({ message: "This checkout session does not belong to your account." });
    }

    if (session.mode !== "subscription" || session.status !== "complete") {
      throw new Error("Checkout is not complete yet.");
    }

    const latestUser = findUserById(request.user.id);
    if (!latestUser) {
      return response.status(404).json({ message: "User not found." });
    }

    return response.json({
      user: sanitizeUser(latestUser),
      dashboard: buildUserSummary(latestUser),
      checkoutComplete: session.status === "complete",
      entitlementPending: !isPremiumEntitled(latestUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/weekly-plan", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);
  const workouts = sortWorkoutsDesc((request.user.data.workouts || []).map(normalizeWorkout));
  const plan = buildWeeklyPlan(request.user.data, summary.totals, summary.habits, summary.completion, workouts);
  const isPreviewRequest = request.headers["x-plan-preview"] === "true";

  if (!isPremiumEntitled(request.user)) {
    if (isPreviewRequest) {
      return response.json({
        plan: buildLimitedWeeklyPlan(plan),
        previewMode: true,
        access: "session-preview",
        message: "This preview shows the headline structure. Premium unlocks the deeper reasoning, clearer weekly actions, and fuller weekly adjustments."
      });
    }

    return response.status(403).json({
      message: "Upgrade required to unlock your personalized weekly plan.",
      preview: summary.weeklyPlanPreview
    });
  }

  return response.json({
    plan
  });
});

app.use(express.static(distPath));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api")) {
    return next();
  }

  return response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`PulsePeak API listening on http://localhost:${port}`);
});

function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return response.status(401).json({ message: "Missing auth token." });
  }

  const user = findUserByToken(token);
  if (!user) {
    return response.status(401).json({ message: "Invalid or expired session." });
  }

  request.user = user;
  request.token = token;
  return next();
}

function getAppOrigin(request) {
  if (appOrigin) {
    return appOrigin;
  }

  const originHeader = request.headers.origin;
  if (originHeader) {
    return originHeader;
  }

  return `${request.protocol}://${request.get("host")}`;
}

function normalizePublicOrigin(value) {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  return normalized || "";
}

function buildAllowedCorsOrigins(rawValue, originValue) {
  const configuredOrigins = String(rawValue || "")
    .split(",")
    .map((entry) => normalizePublicOrigin(entry))
    .filter(Boolean);

  if (originValue && !configuredOrigins.includes(originValue)) {
    configuredOrigins.push(originValue);
  }

  return configuredOrigins;
}

function buildUserSummary(user) {
  return {
    ...summarizeDashboard(user.data),
    workoutAccess: buildWorkoutAccess(user),
    weeklyCheckIn: buildWeeklyCheckInState(user.data, { isPremium: isPremiumEntitled(user) }),
    pricingModel: buildPricingModel(user)
  };
}

function buildPricingModel(user) {
  const accessTier = getAccessTier(user);
  const monthlyAmount = premiumPlanAmount;
  const yearlyAmount = premiumPlanYearlyAmount;
  const yearlySavings = Math.max(0, monthlyAmount * 12 - yearlyAmount);
  const yearlySavingsPercent = yearlySavings > 0 ? 33 : 0;

  return {
    accessTier,
    canStartTrial: canStartTrial(user),
    trialDays: TRIAL_DURATION_DAYS,
    trialEndsAt: accessTier === "trial_active" ? user.currentPeriodEnd || user.trialEndsAt || null : null,
    trialDisclosure: `Then auto-renews yearly at ${formatCurrency(yearlyAmount, premiumPlanCurrency)}/year unless canceled before trial ends.`,
    monthly: {
      interval: "monthly",
      amountCents: monthlyAmount,
      priceLabel: formatCurrency(monthlyAmount, premiumPlanCurrency),
      cadenceLabel: `${formatCurrency(monthlyAmount, premiumPlanCurrency)} / month`,
      helper: "Direct paid option"
    },
    yearly: {
      interval: "yearly",
      amountCents: yearlyAmount,
      priceLabel: formatCurrency(yearlyAmount, premiumPlanCurrency),
      cadenceLabel: `${formatCurrency(yearlyAmount, premiumPlanCurrency)} / year`,
      helper: yearlySavings > 0 ? `Best value - save ${yearlySavingsPercent}%` : "Best long-term value",
      savingsAmountCents: yearlySavings,
      savingsPercent: yearlySavingsPercent
    }
  };
}

function buildCheckoutLineItem(billingInterval) {
  if (billingInterval === "yearly") {
    if (yearlyPriceId) {
      return {
        price: yearlyPriceId,
        quantity: 1
      };
    }

    return {
      quantity: 1,
      price_data: {
        currency: premiumPlanCurrency,
        recurring: {
          interval: "year"
        },
        unit_amount: premiumPlanYearlyAmount,
        product_data: {
          name: "Premium Plan"
        }
      }
    };
  }

  if (monthlyPriceId) {
    return {
      price: monthlyPriceId,
      quantity: 1
    };
  }

  return {
    quantity: 1,
    price_data: {
      currency: premiumPlanCurrency,
      recurring: {
        interval: "month"
      },
      unit_amount: premiumPlanAmount,
      product_data: {
        name: "Premium Plan"
      }
    }
  };
}

function parseBillingInterval(value) {
  return value === "yearly" ? "yearly" : "monthly";
}

function parseCheckoutMode(value) {
  return value === "upgrade_now" ? "upgrade_now" : "default";
}

function formatCurrency(amountCents, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "usd").toUpperCase(),
    maximumFractionDigits: 0
  }).format((Number(amountCents) || 0) / 100);
}

function logStripeConfigurationWarnings() {
  const missing = [];
  if (!process.env.STRIPE_SECRET_KEY) {
    missing.push("STRIPE_SECRET_KEY");
  }
  if (!process.env.STRIPE_PRICE_ID) {
    missing.push("STRIPE_PRICE_ID");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    missing.push("STRIPE_WEBHOOK_SECRET");
  }

  if (missing.length) {
    console.warn(`[Stripe] Missing env vars: ${missing.join(", ")}.`);
    console.warn("[Stripe] Checkout, billing portal, or webhook syncing may be unavailable until Stripe configuration is complete.");
  }
}

function buildRecoveryFocus(data, summary) {
  const topHabit = summary.habits
    .map((habit) => ({
      ...habit,
      completedToday: habit.completedDates.includes(new Date().toISOString().slice(0, 10)),
      streak: calculateStreak(habit.completedDates)
    }))
    .sort((left, right) => right.streak - left.streak)[0];

  return {
    energyLevel: data.energyLevel,
    sleepHours: data.sleepHours,
    topHabit: topHabit ? `${topHabit.name} (${topHabit.streak}-day streak)` : "No habits yet"
  };
}

function assertValidName(name) {
  parseText(name, "Name", 2, 50);
}

function assertValidEmail(email) {
  const normalized = String(email || "").trim();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
}

function assertValidPassword(password, allowShorterForLogin = false) {
  const normalized = String(password || "");
  const minimum = allowShorterForLogin ? 1 : 8;
  if (normalized.trim().length < minimum) {
    throw new Error(allowShorterForLogin ? "Password is required." : "Password must be at least 8 characters.");
  }
}

function parseText(value, label, minLength, maxLength) {
  const normalized = String(value || "").trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new Error(`${label} must be between ${minLength} and ${maxLength} characters.`);
  }

  return normalized;
}

function parseNumberInRange(value, minimum, maximum, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseIntensity(value) {
  const allowed = ["Low", "Moderate", "High"];
  if (!allowed.includes(value)) {
    throw new Error("Workout intensity must be Low, Moderate, or High.");
  }

  return value;
}

function parseWorkoutType(value) {
  const allowed = ["strength", "cardio", "mobility"];
  if (!allowed.includes(value)) {
    throw new Error("Workout type must be strength, cardio, or mobility.");
  }

  return value;
}

function parseEnvironment(value) {
  const allowed = ["gym", "home", "both"];
  if (!allowed.includes(value)) {
    throw new Error("Workout environment must be gym, home, or both.");
  }

  return value;
}

function parseExercise(exercise) {
  const normalized = {
    name: parseText(exercise.name, "Exercise name", 2, 60),
    sets: parseNumberInRange(exercise.sets, 1, 10, "Exercise sets"),
    reps: exercise.reps ? String(exercise.reps).trim() : null,
    duration: exercise.duration ? String(exercise.duration).trim() : null,
    equipment: parseText(exercise.equipment, "Exercise equipment", 2, 30),
    muscleGroup: parseText(exercise.muscleGroup, "Muscle group", 2, 30),
    weight:
      exercise.weight === undefined || exercise.weight === null || String(exercise.weight).trim() === ""
        ? null
        : parseNumberInRange(exercise.weight, 0, 2000, "Exercise weight"),
    repsCompleted: exercise.repsCompleted ? String(exercise.repsCompleted).trim() : null,
    notes: exercise.notes ? String(exercise.notes).trim().slice(0, 160) : ""
  };

  if (!normalized.reps && !normalized.duration) {
    throw new Error("Each exercise needs reps or duration.");
  }

  return normalized;
}

function parseEnergyLevel(value) {
  const allowed = ["Low", "Steady", "High"];
  if (!allowed.includes(value)) {
    throw new Error("Energy level must be Low, Steady, or High.");
  }

  return value;
}

function parseGoalType(value) {
  const allowed = [
    "strength",
    "athletic_performance",
    "bodybuilding",
    "fat_loss",
    "general_fitness",
    "mobility",
    "injury_recovery",
    "active_aging"
  ];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid primary goal.");
  }

  return value;
}

function parseOptionalGoalType(value) {
  if (value === undefined) {
    return undefined;
  }

  return parseGoalType(value);
}

function parseAgeGroup(value) {
  const allowed = ["18-29", "30-39", "40-49", "50+"];
  return allowed.includes(value) ? value : "30-39";
}

function parseOptionalBirthdate(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error("Birthdate is required.");
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Enter a valid birthdate.");
  }

  const today = new Date();
  if (parsed > today) {
    throw new Error("Birthdate cannot be in the future.");
  }

  const age = getAgeFromBirthdate(normalized);
  if (age < 18 || age > 100) {
    throw new Error("Birthdate must represent an adult age between 18 and 100.");
  }

  return normalized;
}

function parseExperienceLevel(value) {
  const allowed = ["beginner", "intermediate", "advanced"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid experience level.");
  }

  return value;
}

function parseTrainingEnvironment(value) {
  const allowed = ["home", "gym", "hybrid"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid training environment.");
  }

  return value;
}

function parseEquipmentProfile(value, trainingEnvironment = "hybrid") {
  const normalized = normalizeEquipmentProfile(value, trainingEnvironment);
  if (!normalized) {
    throw new Error("Choose a valid equipment setup.");
  }

  return normalized;
}

function parseEquipmentSelections(value, trainingEnvironment = "hybrid", equipmentProfile = null) {
  const normalized = normalizeEquipmentSelections(value, trainingEnvironment);
  if (!normalized?.length) {
    if (equipmentProfile) {
      return normalizeEquipmentSelections(
        getEquipmentSelectionsForProfile({
          trainingEnvironment,
          equipmentProfile
        }),
        trainingEnvironment
      );
    }
    return normalizeEquipmentSelections([], trainingEnvironment);
  }

  return normalized;
}

function parseEquipmentSelectionsQuery(value, trainingEnvironment = "hybrid", profile = {}) {
  if (!value) {
    return getEquipmentSelectionsForProfile(profile);
  }

  const selections = Array.isArray(value) ? value : String(value).split(",");
  return normalizeEquipmentSelections(selections, trainingEnvironment);
}

function parseInjuryStatus(value) {
  const allowed = ["none", "minor", "active_injury"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid injury status.");
  }

  return value;
}

function parseAppMode(value) {
  const normalized = String(value || "").trim();
  if (!APP_MODES.includes(normalized)) {
    throw new Error("Choose a valid app mode.");
  }

  return normalizeAppMode(normalized);
}

function parseExerciseGuidanceLevel(value) {
  const allowed = ["full", "standard", "minimal"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid exercise guidance level.");
  }

  return value;
}

function parseBooleanSetting(value) {
  if (typeof value !== "boolean") {
    throw new Error("Choose a valid on or off setting.");
  }

  return value;
}

function parseVisualModelPreference(value) {
  const normalized = normalizeVisualModelPreference(value);
  if (!normalized) {
    throw new Error("Choose a valid exercise visual model.");
  }

  return normalized;
}

function parseRestrictedAreas(value) {
  const allowed = new Set(["knee", "shoulder", "back", "elbow", "hip", "ankle"]);
  if (!Array.isArray(value)) {
    return [];
  }

  const cleaned = Array.from(
    new Set(
      value.map((entry) => String(entry || "").trim()).filter((entry) => allowed.has(entry))
    )
  );

  if (cleaned.length > 6) {
    throw new Error("Too many restricted areas were selected.");
  }

  return cleaned;
}

function parseSex(value) {
  const allowed = ["female", "male", "non_binary", "prefer_not_to_say"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid sex option for training estimates.");
  }

  return value;
}

function parseUnitPreference(value) {
  const normalized = normalizeUnitPreference(value);
  if (!normalized) {
    throw new Error("Choose a valid unit preference.");
  }

  return normalized;
}

function parseNutritionMode(value, goalType) {
  const allowed = ["off", "basic", "full"];
  const normalizedGoalType = parseGoalType(goalType);
  if (!allowed.includes(value)) {
    if (normalizedGoalType === "fat_loss") {
      return "full";
    }
    if (normalizedGoalType === "bodybuilding" || normalizedGoalType === "general_fitness") {
      return "basic";
    }
    return "off";
  }

  return value;
}

function parseOptionalBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function parseModuleOrder(value) {
  if (!Array.isArray(value)) {
    return CUSTOMIZABLE_MODULE_IDS;
  }

  const selected = value.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId));
  return [...selected, ...CUSTOMIZABLE_MODULE_IDS.filter((moduleId) => !selected.includes(moduleId))];
}

function parseHiddenModules(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))));
}

function parseOptionalMeasurement(value, minimum, maximum, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  return parseNumberInRange(value, minimum, maximum, label);
}

function parseWeeklyCheckIn(value) {
  const payload = value || {};
  return {
    weekKey: typeof payload.weekKey === "string" && payload.weekKey.trim() ? payload.weekKey.trim() : getCurrentWeekKey(),
    weekFeel: parseWeeklyCheckEnum(payload.weekFeel, ["rough", "mixed", "strong"], "How the week felt"),
    recoveryFeel: parseWeeklyCheckEnum(payload.recoveryFeel, ["low", "steady", "high"], "Recovery"),
    planDifficulty: parseWeeklyCheckEnum(payload.planDifficulty, ["too_easy", "right", "too_hard"], "Plan difficulty"),
    nutritionAdherence: parseWeeklyCheckEnum(payload.nutritionAdherence, ["off_track", "mostly_on", "locked_in"], "Nutrition"),
    sorenessIssues: parseWeeklyCheckEnum(payload.sorenessIssues, ["none", "manageable", "significant"], "Soreness"),
    confidence: parseWeeklyCheckEnum(payload.confidence, ["low", "steady", "high"], "Confidence")
  };
}

function parseWeeklyCheckEnum(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} selection is required.`);
  }

  return value;
}

function getCurrentWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const dayOffset = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayOffset);
  return start.toISOString().slice(0, 10);
}

function getAgeFromBirthdate(birthdate) {
  const today = new Date();
  const parsed = new Date(`${birthdate}T00:00:00`);
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }

  return age;
}

function deriveAgeGroupFromBirthdate(birthdate) {
  const age = getAgeFromBirthdate(birthdate);
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
