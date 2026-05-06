export const ACCESS_TIERS = {
  FREE: "free",
  TRIAL: "trial_active",
  PREMIUM: "premium"
};

export const FREE_COMPLETED_SESSION_LIMIT = 2;
export const FREE_WORKOUT_CATEGORY_LIMIT = 2;
export const FREE_EXERCISES_PER_WORKOUT_LIMIT = 3;
export const TRIAL_LENGTH_DAYS = 7;

export function normalizeAccessTier(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === ACCESS_TIERS.TRIAL || normalized === "trial") {
    return ACCESS_TIERS.TRIAL;
  }
  if (normalized === ACCESS_TIERS.PREMIUM) {
    return ACCESS_TIERS.PREMIUM;
  }
  return ACCESS_TIERS.FREE;
}

export function hasFullWorkoutAccess(accessTier) {
  const normalized = normalizeAccessTier(accessTier);
  return normalized === ACCESS_TIERS.TRIAL || normalized === ACCESS_TIERS.PREMIUM;
}

export function getFreeWorkoutAccessProfile(suggestedFocuses = []) {
  const usableFocuses = Array.from(new Set((suggestedFocuses || []).filter(Boolean))).slice(0, FREE_WORKOUT_CATEGORY_LIMIT);
  return {
    freeWorkoutCategoriesAllowed: FREE_WORKOUT_CATEGORY_LIMIT,
    freeExercisesPerWorkoutAllowed: FREE_EXERCISES_PER_WORKOUT_LIMIT,
    usableFocuses
  };
}

export function isWorkoutFocusUsable(accessTier, focus, suggestedFocuses = []) {
  if (hasFullWorkoutAccess(accessTier)) {
    return true;
  }

  const accessProfile = getFreeWorkoutAccessProfile(suggestedFocuses);
  return accessProfile.usableFocuses.includes(focus);
}

export function getVisibleLockedWorkoutMessage() {
  return "You are seeing only a small part of PulsePeak. Trial or Premium unlocks the full workout system.";
}

export function getPremiumCapabilitySummary(surface = "general") {
  switch (surface) {
    case "plan":
      return "Premium keeps weekly plan progression, workout rotation, and fuller session planning connected.";
    case "progress":
      return "Premium adds deeper tracking visibility and clearer weekly adjustment reasoning.";
    case "dashboard":
      return "Premium keeps the full next-action system, workout rotation, and weekly planning layer connected.";
    default:
      return "Premium makes the system deeper through fuller planning, smarter workout rotation, and clearer tracking.";
  }
}

export function getPremiumOutcomeLayer(accessTier, context = {}) {
  const normalized = normalizeAccessTier(accessTier);
  const surface = context?.surface || "general";

  if (normalized === ACCESS_TIERS.TRIAL || normalized === ACCESS_TIERS.PREMIUM) {
    switch (surface) {
      case "plan":
        return {
          title: "Deeper week-to-week guidance is active",
          detail: "You can see fuller evolution notes, next-week emphasis, and clearer progression guidance across the program."
        };
      case "progress":
        return {
          title: "Full outcome guidance is active",
          detail: "You can see richer improvement detail, milestone context, and clearer recovery-balance interpretation."
        };
      case "dashboard":
        return {
          title: "The full coaching layer is active",
          detail: "Dashboard guidance can stay connected to momentum, recovery balance, and next-week adjustments."
        };
      default:
        return {
          title: "The full coaching layer is active",
          detail: "You can see how training is evolving week to week, not just what to do today."
        };
    }
  }

  switch (surface) {
    case "plan":
      return {
        title: "Unlock deeper progression guidance",
        detail: "Free still shows the weekly structure and next workout. Premium adds fuller next-week emphasis and clearer program evolution notes."
      };
    case "progress":
      return {
        title: "Unlock deeper momentum and progress visibility",
        detail: "Free still shows basic consistency and milestone truth. Premium adds richer improvement detail and clearer adjustment reasoning."
      };
    case "dashboard":
      return {
        title: "Unlock deeper week-to-week coaching",
        detail: "Free still gives a useful next step. Premium keeps recovery balance, momentum, and progression guidance more connected."
      };
    default:
      return {
        title: "Unlock deeper coaching guidance",
        detail: "Premium makes the system better through clearer progression, recovery balance, and next-week visibility."
      };
  }
}

export function getUpgradeMoment({ accessTier, context = {} } = {}) {
  const normalized = normalizeAccessTier(accessTier);
  if (normalized === ACCESS_TIERS.TRIAL || normalized === ACCESS_TIERS.PREMIUM) {
    return null;
  }

  const momentum = context?.resultSignals?.momentum;
  const currentStreakDays = Number(context?.workoutMomentum?.currentStreakDays || 0);
  const weeklyCompletionCount = Number(context?.workoutMomentum?.weeklyCompletionCount || 0);
  const checkpoint = context?.checkpoint;
  const hasMomentum = momentum === "increasing" || currentStreakDays >= 2 || weeklyCompletionCount >= 3;

  if (!checkpoint || !hasMomentum) {
    return null;
  }

  if (checkpoint?.id === "three_sessions" || checkpoint?.id === "solid_week") {
    return {
      title: "You are building real consistency",
      detail: "You have built a real training rhythm. Unlock deeper progression guidance and see how the week evolves."
    };
  }

  if (momentum === "increasing") {
    return {
      title: "You are on track",
      detail: "Unlock deeper progression guidance while the system has enough real behavior to sharpen the next week."
    };
  }

  return {
    title: "You have real momentum now",
    detail: "Unlock fuller visibility into recovery balance, progression, and next-week emphasis while the system has meaningful data."
  };
}

export function getPremiumComparisonSummary(accessTier, context = {}) {
  const normalized = normalizeAccessTier(accessTier);
  const surface = context?.surface || "general";
  const behaviorSupport = context?.upgradeMoment?.detail || context?.companionAction?.detail || null;

  const sharedFreeLine = "Free still gives you a next workout, a visible weekly shape, and basic consistency signals.";
  const sharedPremiumLine =
    "Premium adds deeper week-to-week guidance, richer adjustment visibility, and fuller progression interpretation.";

  if (normalized === ACCESS_TIERS.TRIAL || normalized === ACCESS_TIERS.PREMIUM) {
    return {
      currentTierLabel: normalized === ACCESS_TIERS.TRIAL ? "Trial" : "Premium",
      availableNow:
        surface === "progress"
          ? "You can already see the fuller interpretation layer across consistency, recovery balance, and next-week guidance."
          : "You can already see the fuller coaching layer across planning, progression, and next-step context.",
      freeLine: sharedFreeLine,
      premiumLine: sharedPremiumLine,
      whyNow: null
    };
  }

  return {
    currentTierLabel: "Free",
    availableNow: sharedFreeLine,
    freeLine: sharedFreeLine,
    premiumLine:
      surface === "progress"
        ? "Premium adds richer improvement detail, clearer recovery interpretation, and fuller next-week adjustment visibility."
        : sharedPremiumLine,
    whyNow: behaviorSupport
  };
}
