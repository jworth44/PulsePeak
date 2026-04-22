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
