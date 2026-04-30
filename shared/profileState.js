export const VISUAL_MODEL_PREFERENCES = ["default", "male", "female"];

export const VISUAL_MODEL_PREFERENCE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "male", label: "Male model" },
  { value: "female", label: "Female model" }
];

export function isProfileComplete(profile = {}) {
  return Boolean(
    profile.goalType &&
      profile.nutritionMode &&
      profile.unitPreference &&
      profile.ageGroup &&
      profile.birthdate &&
      profile.experienceLevel &&
      profile.trainingEnvironment &&
      profile.equipmentProfile &&
      profile.sex &&
      Number.isFinite(Number(profile.heightCm)) &&
      Number(profile.heightCm) > 0 &&
      Number.isFinite(Number(profile.currentWeight)) &&
      Number(profile.currentWeight) > 0 &&
      profile.injuryStatus &&
      Array.isArray(profile.restrictedAreas)
  );
}

export function hasCompletedOnboarding(profile = {}) {
  return profile.onboardingCompleted === true && isProfileComplete(profile);
}

export function normalizeVisualModelPreference(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return VISUAL_MODEL_PREFERENCES.includes(normalized) ? normalized : "default";
}

export function formatGoalLabel(value = "") {
  return formatGoalLabelInternal(value);
}

function formatGoalLabelInternal(value = "") {
  switch (String(value || "").toLowerCase()) {
    case "bodybuilding":
      return "Muscle-building training";
    case "fat_loss":
      return "Fat-loss training";
    case "athletic_performance":
      return "Performance-focused training";
    case "mobility":
      return "Mobility-first training";
    case "injury_recovery":
      return "Recovery-led training";
    case "active_aging":
      return "Longevity-focused training";
    case "strength":
      return "Strength-focused training";
    default:
      return "General fitness training";
  }
}
