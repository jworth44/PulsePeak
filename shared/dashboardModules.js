export const NUTRITION_MODES = ["off", "basic", "full"];
export const CUSTOMIZABLE_MODULE_IDS = ["workouts", "nutrition", "hydration", "mobility", "recovery", "progress", "coach"];

export const DASHBOARD_MODULES = [
  { id: "weekly_plan", label: "Weekly Plan" },
  { id: "workouts", label: "Workouts" },
  { id: "nutrition", label: "Nutrition" },
  { id: "hydration", label: "Hydration" },
  { id: "recovery", label: "Recovery" },
  { id: "habits", label: "Habits" },
  { id: "mobility", label: "Mobility" },
  { id: "progress", label: "Progress" },
  { id: "coach", label: "Coach" }
];

export function getDefaultNutritionMode(goalType) {
  switch (goalType) {
    case "fat_loss":
      return "full";
    case "bodybuilding":
      return "basic";
    case "general_fitness":
      return "basic";
    default:
      return "off";
  }
}

export function normalizeNutritionMode(goalType, nutritionMode) {
  if (NUTRITION_MODES.includes(nutritionMode)) {
    return nutritionMode;
  }

  return getDefaultNutritionMode(goalType);
}

export function getActiveModules(userLike) {
  const profile = userLike?.profile || userLike || {};
  const goalType = profile.goalType || "general_fitness";
  const nutritionMode = normalizeNutritionMode(goalType, profile.nutritionMode);
  const injuryStatus = profile.injuryStatus || "none";
  const hasHabitData = Boolean(userLike?.hasHabits);
  const hiddenModules = normalizeHiddenModules(profile.hiddenModules);
  const moduleOrder = normalizeModuleOrder(profile.moduleOrder);

  return DASHBOARD_MODULES.filter((module) => {
    if (!isModuleVisible(module.id, { goalType, nutritionMode, injuryStatus, hasHabitData })) {
      return false;
    }

    if (module.id === "weekly_plan" || module.id === "habits") {
      return true;
    }

    return !hiddenModules.includes(module.id);
  }).sort((left, right) => compareModuleOrder(left.id, right.id, moduleOrder));
}

export function isModuleVisible(moduleId, { goalType, nutritionMode, injuryStatus, hasHabitData }) {
  switch (moduleId) {
    case "nutrition":
      return nutritionMode !== "off";
    case "hydration":
      return nutritionMode !== "off" || goalType === "fat_loss";
    case "mobility":
      return injuryStatus !== "none" || goalType === "mobility" || goalType === "injury_recovery" || goalType === "active_aging";
    case "recovery":
      return true;
    case "weekly_plan":
    case "coach":
    case "workouts":
    case "progress":
      return true;
    case "habits":
      return hasHabitData || ["fat_loss", "general_fitness", "bodybuilding", "athletic_performance", "active_aging", "mobility"].includes(goalType);
    default:
      return false;
  }
}

export function normalizeModuleOrder(moduleOrder) {
  const selected = Array.isArray(moduleOrder)
    ? moduleOrder.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))
    : [];

  return [...selected, ...CUSTOMIZABLE_MODULE_IDS.filter((moduleId) => !selected.includes(moduleId))];
}

export function normalizeHiddenModules(hiddenModules) {
  return Array.isArray(hiddenModules)
    ? Array.from(new Set(hiddenModules.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))))
    : [];
}

export function getDashboardNextAction({
  needsOnboarding = false
} = {}) {
  if (needsOnboarding) {
    return {
      eyebrow: "Setup",
      title: "Finish your setup",
      reason: "Complete your profile so PulsePeak can tailor the app to your goals and preferences.",
      primaryAction: { label: "Finish setup", href: "/preferences?section=preferences" }
    };
  }

  return null;
}

function compareModuleOrder(leftId, rightId, moduleOrder) {
  const getRank = (moduleId) => {
    if (moduleId === "weekly_plan") {
      return -2;
    }
    if (moduleId === "habits") {
      return 100;
    }

    const index = moduleOrder.indexOf(moduleId);
    return index === -1 ? 99 : index;
  };

  return getRank(leftId) - getRank(rightId);
}
