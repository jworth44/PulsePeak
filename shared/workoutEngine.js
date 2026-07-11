export const EQUIPMENT_PROFILE_OPTIONS = [
  {
    value: "full_gym",
    label: "Full gym",
    description: "Barbells, machines, cables, benches, and more.",
    environments: ["gym", "hybrid"]
  },
  {
    value: "bench_dumbbells",
    label: "Bench + dumbbells",
    description: "A bench plus enough dumbbells for pressing and lower-body work.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "dumbbells_only",
    label: "Dumbbells only",
    description: "A practical setup for full-body home sessions.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "bodyweight",
    label: "Bodyweight",
    description: "No equipment needed beyond floor space.",
    environments: ["home", "hybrid"]
  },
  {
    value: "bands",
    label: "Bands",
    description: "Resistance bands for pulling, pressing, and joint-friendly support work.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "A mix of gym days and lighter home sessions through the week.",
    environments: ["home", "gym", "hybrid"]
  }
];

export const EQUIPMENT_SELECTION_OPTIONS = [
  { value: "bodyweight", label: "Bodyweight", environments: ["home", "gym", "hybrid"] },
  { value: "bench", label: "Bench", environments: ["home", "gym", "hybrid"] },
  { value: "dumbbells", label: "Dumbbells", environments: ["home", "gym", "hybrid"] },
  { value: "kettlebells", label: "Kettlebells", environments: ["home", "gym", "hybrid"] },
  { value: "bands", label: "Resistance bands", environments: ["home", "gym", "hybrid"] },
  { value: "pull_up_bar", label: "Pull-up bar", environments: ["home", "gym", "hybrid"] },
  { value: "barbell", label: "Barbell", environments: ["gym", "hybrid"] },
  { value: "machines", label: "Machines / cables", environments: ["gym", "hybrid"] }
];

const EQUIPMENT_PROFILE_SELECTION_MAP = {
  full_gym: ["bodyweight", "bench", "dumbbells", "barbell", "machines"],
  bench_dumbbells: ["bodyweight", "bench", "dumbbells"],
  dumbbells_only: ["bodyweight", "dumbbells"],
  bodyweight: ["bodyweight"],
  bands: ["bodyweight", "bands"],
  hybrid: ["bodyweight", "bench", "dumbbells", "bands", "pull_up_bar"]
};

export const WORKOUT_FOCUS_OPTIONS = [
  { value: "chest", label: "Chest", description: "Chest-dominant pressing work without a full push day." },
  { value: "back", label: "Back", description: "Back-focused pulling and row work." },
  { value: "shoulders", label: "Shoulders", description: "Overhead pressing, lateral work, and upper-back support." },
  { value: "legs", label: "Legs", description: "Squat, hinge, lunge, and lower-body support work." },
  { value: "glutes", label: "Glutes", description: "Hip extension, glute drive, and lower-body support." },
  { value: "arms", label: "Arms", description: "A simple arm-focused session with biceps and triceps support." },
  { value: "biceps", label: "Biceps", description: "Pulling and curl work with extra biceps emphasis." },
  { value: "triceps", label: "Triceps", description: "Pressing support with direct triceps work." },
  { value: "forearms", label: "Forearms", description: "Grip, pulling support, and forearm-friendly arm work." },
  { value: "calves", label: "Calves", description: "Lower-body work with extra calf support." },
  { value: "core_abs", label: "Core / abs", description: "Core-focused support work around a lighter training day." },
  { value: "push", label: "Push", description: "Pressing-focused upper-body work for chest, shoulders, and triceps." },
  { value: "pull", label: "Pull", description: "Rows, pulls, and rear-side work for the back and biceps." },
  { value: "chest_triceps", label: "Chest + triceps", description: "A chest-heavy session with direct triceps support." },
  { value: "back_biceps", label: "Back + biceps", description: "Back thickness, pulling strength, and arm support together." },
  { value: "upper_body", label: "Upper body", description: "Balanced pressing and pulling when you want one complete upper session." },
  { value: "lower_body", label: "Lower body", description: "A structured lower-body day with strength and support work." },
  { value: "full_body", label: "Full body", description: "One efficient session when time, equipment, or recovery is tighter." },
  { value: "mobility_recovery", label: "Mobility / recovery day", description: "Low-load movement support when recovery should lead." }
];

export function formatWorkoutFocus(value) {
  return WORKOUT_FOCUS_OPTIONS.find((option) => option.value === value)?.label || "Workout focus";
}

export function getDefaultEquipmentProfile(trainingEnvironment = "hybrid") {
  if (trainingEnvironment === "gym") {
    return "full_gym";
  }
  if (trainingEnvironment === "home") {
    return "dumbbells_only";
  }
  return "hybrid";
}

export function getDefaultEquipmentSelections(trainingEnvironment = "hybrid") {
  return [...(EQUIPMENT_PROFILE_SELECTION_MAP[getDefaultEquipmentProfile(trainingEnvironment)] || ["bodyweight"])];
}

export function normalizeEquipmentProfile(value, trainingEnvironment = "hybrid") {
  const allowed = getEquipmentOptionsForEnvironment(trainingEnvironment).map((option) => option.value);
  if (allowed.includes(value)) {
    return value;
  }

  return getDefaultEquipmentProfile(trainingEnvironment);
}

export function normalizeEquipmentSelections(value, trainingEnvironment = "hybrid") {
  const allowed = new Set(getEquipmentSelectionOptionsForEnvironment(trainingEnvironment).map((option) => option.value));
  const selected = Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .map((entry) => String(entry || "").trim())
            .filter((entry) => allowed.has(entry))
        )
      )
    : [];

  if (selected.length) {
    return selected;
  }

  return getDefaultEquipmentSelections(trainingEnvironment);
}

export function getEquipmentSelectionOptionsForEnvironment(trainingEnvironment = "hybrid") {
  return EQUIPMENT_SELECTION_OPTIONS.filter((option) => {
    if (trainingEnvironment === "hybrid") {
      return true;
    }

    return option.environments.includes(trainingEnvironment);
  });
}

export function buildEquipmentProfileFromSelections(selections = [], trainingEnvironment = "hybrid") {
  const normalizedSelections = normalizeEquipmentSelections(selections, trainingEnvironment);
  const has = (value) => normalizedSelections.includes(value);

  if (has("machines") || has("barbell")) {
    return "full_gym";
  }
  if (has("bench") && has("dumbbells")) {
    return "bench_dumbbells";
  }
  if (has("dumbbells")) {
    return "dumbbells_only";
  }
  if (has("bands") && normalizedSelections.length <= 2) {
    return "bands";
  }
  if (normalizedSelections.length === 1 && has("bodyweight")) {
    return "bodyweight";
  }
  return trainingEnvironment === "gym" ? "full_gym" : "hybrid";
}

export function getEquipmentSelectionsForProfile(profile = {}) {
  // An EMPTY selections array must fall back to the profile's equipment
  // profile — `[] || fallback` short-circuits on the truthy empty array,
  // which routed bodyweight-profile users (onboarding writes
  // equipmentSelections: []) to the environment default and served them
  // dumbbell workouts (Recovery Directive persona A/G defect).
  const explicitSelections =
    Array.isArray(profile.equipmentSelections) && profile.equipmentSelections.length
      ? profile.equipmentSelections
      : EQUIPMENT_PROFILE_SELECTION_MAP[profile.equipmentProfile] || [];
  return normalizeEquipmentSelections(explicitSelections, profile.trainingEnvironment || "hybrid");
}

export function formatEquipmentSelections(selections = []) {
  const labels = selections
    .map((value) => EQUIPMENT_SELECTION_OPTIONS.find((option) => option.value === value)?.label)
    .filter(Boolean);

  if (!labels.length) {
    return "Current setup";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  if (labels.length === 2) {
    return `${labels[0]} + ${labels[1]}`;
  }
  return `${labels.slice(0, 2).join(" + ")} + ${labels.length - 2} more`;
}

export function getEquipmentOptionsForEnvironment(trainingEnvironment = "hybrid") {
  return EQUIPMENT_PROFILE_OPTIONS.filter((option) => {
    if (trainingEnvironment === "hybrid") {
      return true;
    }

    return option.environments.includes(trainingEnvironment);
  });
}

export function getSuggestedWorkoutFocuses({ goalType = "general_fitness", injuryStatus = "none", lowRecovery = false } = {}) {
  if (injuryStatus === "active_injury") {
    return ["mobility_recovery", "upper_body", "lower_body"];
  }
  if (goalType === "mobility" || goalType === "injury_recovery") {
    return ["mobility_recovery", "full_body", "upper_body"];
  }
  if (lowRecovery) {
    return ["full_body", "mobility_recovery", "upper_body"];
  }

  switch (goalType) {
    case "strength":
      return ["upper_body", "lower_body", "push", "pull", "legs"];
    case "bodybuilding":
      return ["chest_triceps", "back_biceps", "shoulders", "legs", "upper_body"];
    case "fat_loss":
      return ["full_body", "upper_body", "lower_body", "mobility_recovery"];
    case "athletic_performance":
      return ["full_body", "legs", "pull", "mobility_recovery"];
    case "active_aging":
      return ["full_body", "lower_body", "mobility_recovery", "upper_body"];
    default:
      return ["upper_body", "lower_body", "full_body", "push", "pull"];
  }
}

export function getWorkoutLoadBand(workout = {}) {
  const intensity = normalizeToken(workout?.intensity);
  const duration = Number(workout?.duration || 0);
  const jointStress = normalizeToken(workout?.jointStressProfile || workout?.jointStress);
  const tags = [
    ...(Array.isArray(workout?.trainingStyleTags) ? workout.trainingStyleTags : []),
    ...(Array.isArray(workout?.categoryTags) ? workout.categoryTags : [])
  ].map(normalizeToken);
  const focus = normalizeWorkoutCategory(workout?.focus || workout?.focusLabel || workout?.type);

  if (
    intensity === "low" ||
    jointStress === "low" ||
    focus === "mobility_recovery" ||
    tags.includes("recovery_day") ||
    tags.includes("recovery") ||
    tags.includes("mobility") ||
    duration <= 25
  ) {
    return "light";
  }

  if (
    intensity === "high" ||
    jointStress === "high" ||
    tags.includes("conditioning") ||
    (tags.includes("strength") && duration >= 40) ||
    duration >= 55
  ) {
    return "hard";
  }

  return "moderate";
}

export function getCategoryBalanceSignal(memoryState = {}) {
  const recentCategories = getRecentCategories(memoryState);
  const recentPrimary = recentCategories.slice(0, 3);
  const categoryCounts = recentPrimary.reduce((accumulator, category) => {
    accumulator[category] = (accumulator[category] || 0) + 1;
    return accumulator;
  }, {});
  const dominantEntry = Object.entries(categoryCounts).sort((left, right) => right[1] - left[1])[0] || [];
  const dominantCategory = dominantEntry[0] || null;
  const dominantCount = Number(dominantEntry[1] || 0);
  const lowerBodyCount = recentPrimary.filter(isLowerBodyCategory).length;
  const conditioningCount = recentPrimary.filter(isConditioningCategory).length;
  const upperBodyCount = recentPrimary.filter(isUpperBodyCategory).length;

  return {
    repeatedCategory: dominantCount >= 2 ? dominantCategory : null,
    repeatedCount: dominantCount,
    lowerBodyHeavy: lowerBodyCount >= 2,
    conditioningHeavy: conditioningCount >= 2,
    upperBodyHeavy: upperBodyCount >= 2,
    recentCategories: recentPrimary
  };
}

function getRecoveryBias(memoryState = {}) {
  const recentRecords = Array.isArray(memoryState?.completionRecords) ? memoryState.completionRecords.slice(0, 3) : [];
  const hardCount = recentRecords.filter((record) => normalizeLoadBand(record?.loadBand || getWorkoutLoadBand(record)) === "hard").length;
  const moderateCount = recentRecords.filter((record) => normalizeLoadBand(record?.loadBand || getWorkoutLoadBand(record)) === "moderate").length;
  const balanceSignal = getCategoryBalanceSignal(memoryState);
  const sameCategoryStacked = Boolean(balanceSignal.repeatedCategory && balanceSignal.repeatedCount >= 2);

  if (hardCount >= 2 || (sameCategoryStacked && hardCount >= 1)) {
    return {
      level: "high",
      reason: "Recent training load was high, so a recovery-friendly session makes the next step more sustainable."
    };
  }

  if (hardCount === 1 || moderateCount >= 2 || sameCategoryStacked) {
    return {
      level: "moderate",
      reason: "Recent sessions were stacking in a similar lane, so a balanced next step helps keep the week usable."
    };
  }

  return {
    level: "normal",
    reason: "Recent training load is still balanced enough to keep progressing without forcing a recovery-only session."
  };
}

function getWorkoutRecommendationExplanation(workout, context = {}) {
  if (!workout) {
    return {
      shortLabel: "Next session",
      supportingReason: "Choose the clearest session that fits your setup and current week.",
      cautionNote: null
    };
  }

  const currentPlanFocus = normalizeWorkoutCategory(context?.currentPlanFocus);
  const workoutCategory = normalizeWorkoutCategory(workout?.focus || workout?.focusLabel || workout?.type);
  const balanceSignal = getCategoryBalanceSignal(context?.memoryState);
  const recoveryBias = getRecoveryBias(context?.memoryState);
  const loadBand = getWorkoutLoadBand(workout);

  if (recoveryBias.level === "high" && (loadBand === "light" || normalizeToken(workout?.jointStressProfile) === "low")) {
    return {
      shortLabel: "Recovery-friendly pick",
      supportingReason: "Recent training load was high, so this keeps you moving without stacking another hard session.",
      cautionNote: null
    };
  }

  if (balanceSignal.repeatedCategory && balanceSignal.repeatedCategory !== workoutCategory) {
    return {
      shortLabel: "Balanced next session",
      supportingReason: `You trained ${formatCategoryLabel(balanceSignal.repeatedCategory)} recently, so this shifts the emphasis without breaking momentum.`,
      cautionNote: null
    };
  }

  if (currentPlanFocus && currentPlanFocus !== "recommended" && workoutCategory === currentPlanFocus) {
    return {
      shortLabel: "Goal-aligned session",
      supportingReason: "This supports your current plan focus while avoiding a direct repeat of your most recent work.",
      cautionNote: null
    };
  }

  if (recoveryBias.level === "moderate" && loadBand !== "hard") {
    return {
      shortLabel: "Sustainable next step",
      supportingReason: "This keeps intensity in a useful range so the week can keep building instead of spiking too early.",
      cautionNote: null
    };
  }

  return {
    shortLabel: "Fresh next session",
    supportingReason: "This fits your current setup and recent training history without leaning too hard on the same pattern again.",
    cautionNote: null
  };
}

function getProgressionReason(workout, context = {}) {
  return getWorkoutRecommendationExplanation(workout, context).supportingReason;
}

function getWorkoutRecencyScore(workout, memoryState = {}) {
  const workoutId = String(workout?.presetId || workout?.id || "");
  const lastCompletedWorkoutId = String(memoryState?.lastCompletedWorkoutId || "");
  const recentIds = Array.isArray(memoryState?.recentlyCompletedWorkoutIds) ? memoryState.recentlyCompletedWorkoutIds : [];

  if (!workoutId) {
    return 0;
  }
  if (workoutId && workoutId === lastCompletedWorkoutId) {
    return -40;
  }

  const recentIndex = recentIds.findIndex((entry) => String(entry) === workoutId);
  if (recentIndex === -1) {
    return 10;
  }

  return Math.max(-24 + recentIndex * 3, -12);
}

function getWorkoutRotationPenalty(workout, memoryState = {}) {
  const recentCategories = Array.isArray(memoryState?.recentCategories) ? memoryState.recentCategories : [];
  const category = String(workout?.focus || workout?.focusLabel || workout?.type || "").toLowerCase();
  if (!category || !recentCategories.length) {
    return 0;
  }

  const repeatCount = recentCategories.filter((entry) => String(entry).toLowerCase() === category).length;
  const lastCategory = String(memoryState?.lastWorkoutCategory || "").toLowerCase();
  let penalty = repeatCount * 4;
  if (lastCategory && lastCategory === category) {
    penalty += 10;
  }
  return Math.min(penalty, 22);
}

function getWorkoutRecommendationScore(workout, context = {}) {
  const {
    currentPlanFocus = "recommended",
    memoryState = {},
    filters = {},
    accessTier = "free",
    goalType = "general_fitness"
  } = context;

  let score = Number(workout?.recommendationScore || 0);
  const workoutFocus = normalizeWorkoutCategory(workout?.focus || workout?.focusLabel || workout?.type);
  const workoutTags = Array.isArray(workout?.categoryTags) ? workout.categoryTags.map((tag) => String(tag).toLowerCase()) : [];
  const trainingStyleTags = Array.isArray(workout?.trainingStyleTags)
    ? workout.trainingStyleTags.map((tag) => String(tag).toLowerCase().replaceAll(" ", "_"))
    : [];
  const loadBand = getWorkoutLoadBand(workout);
  const balanceSignal = getCategoryBalanceSignal(memoryState);
  const recoveryBias = getRecoveryBias(memoryState);
  const category = normalizeWorkoutCategory(workout?.focus || workout?.focusLabel || workout?.type);

  if (currentPlanFocus && currentPlanFocus !== "recommended") {
    if (workoutFocus === currentPlanFocus) {
      score += 28;
    } else if (workoutTags.some((tag) => tag.replaceAll(" ", "_") === currentPlanFocus)) {
      score += 16;
    }
  }

  if (goalType === "strength" && trainingStyleTags.includes("strength")) {
    score += 10;
  }
  if ((goalType === "bodybuilding" || goalType === "fat_loss") && trainingStyleTags.includes("muscle_building")) {
    score += 8;
  }
  if (goalType === "fat_loss" && trainingStyleTags.includes("conditioning")) {
    score += 8;
  }

  if (filters?.workoutEnvironment && filters.workoutEnvironment !== "both") {
    const environment = String(workout?.environment || "").toLowerCase();
    if (environment === filters.workoutEnvironment || environment === "hybrid" || environment === "both") {
      score += 6;
    }
  }

  if (Array.isArray(filters?.equipmentSelections) && filters.equipmentSelections.length) {
    const haystack = JSON.stringify([
      workout?.equipmentSelections || [],
      workout?.equipmentProfile,
      workout?.equipmentSummary,
      workout?.exercises?.map((exercise) => exercise.equipment)
    ]).toLowerCase();
    const matches = filters.equipmentSelections.filter((selection) => haystack.includes(String(selection).toLowerCase())).length;
    score += matches * 2;
  }

  score += getWorkoutRecencyScore(workout, memoryState);
  score -= getWorkoutRotationPenalty(workout, memoryState);

  if (balanceSignal.repeatedCategory) {
    if (balanceSignal.repeatedCategory === category) {
      score -= 12;
    } else {
      score += 6;
    }
  }

  if (balanceSignal.lowerBodyHeavy) {
    score += isLowerBodyCategory(category) ? -8 : 4;
  }
  if (balanceSignal.conditioningHeavy) {
    score += isConditioningCategory(category) ? -8 : 4;
  }
  if (balanceSignal.upperBodyHeavy) {
    score += isUpperBodyCategory(category) ? -6 : 3;
  }

  if (recoveryBias.level === "high") {
    if (loadBand === "light") {
      score += 18;
    } else if (loadBand === "moderate") {
      score += 4;
    } else {
      score -= 14;
    }
    if (normalizeToken(workout?.jointStressProfile) === "low") {
      score += 6;
    }
  } else if (recoveryBias.level === "moderate") {
    if (loadBand === "light") {
      score += 10;
    } else if (loadBand === "moderate") {
      score += 5;
    } else {
      score -= 6;
    }
  } else if (loadBand === "moderate") {
    score += 4;
  }

  if (!hasLockedAccess(accessTier) && workout?.lockedForAccess) {
    score -= 1000;
  }

  return score;
}

function getTodaysRecommendedWorkout({ workouts = [], currentPlanFocus = "recommended", memoryState = {}, accessTier = "free", filters = {}, goalType = "general_fitness" } = {}) {
  const ranked = [...workouts]
    .map((workout) => ({
      workout,
      score: getWorkoutRecommendationScore(workout, {
        currentPlanFocus,
        memoryState,
        accessTier,
        filters,
        goalType
      })
    }))
    .sort((left, right) => right.score - left.score || String(left.workout?.name || "").localeCompare(String(right.workout?.name || "")));

  return ranked[0]?.workout || null;
}

function getWeeklyTrainingOutline({ currentPlanFocus = "recommended", memoryState = {}, accessTier = "free", workouts = [] } = {}) {
  const primaryFocus = selectAvailableFocus(currentPlanFocus, workouts) || "full_body";
  const secondaryFocus = selectSecondaryFocus(primaryFocus, workouts);
  const tertiaryFocus = selectTertiaryFocus(primaryFocus, secondaryFocus, workouts);
  const recoveryBias = getRecoveryBias(memoryState);
  const hasFullAccess = hasLockedAccess(accessTier);

  const days = [
    { day: 1, title: "Primary training", focus: primaryFocus, label: formatCategoryLabel(primaryFocus), type: "training" },
    { day: 2, title: "Balance session", focus: secondaryFocus, label: formatCategoryLabel(secondaryFocus), type: "training" },
    {
      day: 3,
      title: recoveryBias.level === "high" ? "Recovery reset" : "Mobility / recovery",
      focus: "mobility_recovery",
      label: recoveryBias.level === "high" ? "Recovery reset" : "Mobility support",
      type: "recovery"
    },
    { day: 4, title: "Primary repeat", focus: primaryFocus, label: `${formatCategoryLabel(primaryFocus)} follow-up`, type: "training" },
    { day: 5, title: "Mixed support", focus: tertiaryFocus, label: formatCategoryLabel(tertiaryFocus), type: "training" },
    {
      day: 6,
      title: hasFullAccess ? "Optional support" : "Optional recovery",
      focus: hasFullAccess ? secondaryFocus : "mobility_recovery",
      label: hasFullAccess ? `${formatCategoryLabel(secondaryFocus)} support` : "Recovery support",
      type: hasFullAccess ? "training" : "recovery",
      optional: true
    }
  ];

  if (hasFullAccess) {
    days.push({
      day: 7,
      title: "Reset / mobility",
      focus: "mobility_recovery",
      label: "Mobility or rest",
      type: "recovery",
      optional: true
    });
  }

  return {
    summary: `The week keeps ${formatCategoryLabel(primaryFocus).toLowerCase()} in the lead, layers in a balance day, and leaves room for recovery before the next hard push.`,
    primaryFocus,
    secondaryFocus,
    recoveryBias,
    days
  };
}

function getProgressInsights({ memoryState = {}, currentPlanFocus = "recommended" } = {}) {
  const insights = [];
  const balanceSignal = getCategoryBalanceSignal(memoryState);
  const recoveryBias = getRecoveryBias(memoryState);
  const records = Array.isArray(memoryState?.completionRecords) ? memoryState.completionRecords : [];

  if (balanceSignal.repeatedCategory && balanceSignal.repeatedCount >= 2) {
    insights.push({
      title: "Training balance",
      body: `You have leaned ${formatCategoryLabel(balanceSignal.repeatedCategory).toLowerCase()} recently, so the next session should shift emphasis a little.`,
      tone: "balance"
    });
  }

  if (records.length >= 2) {
    const uniqueDays = new Set(records.map((record) => record?.completedAt ? new Date(record.completedAt).toDateString() : null).filter(Boolean)).size;
    insights.push({
      title: "Consistency",
      body: uniqueDays >= 2 ? "You have kept training active across multiple days this week." : "Your recent sessions are still clustered tightly, so spacing the next one well matters.",
      tone: "consistency"
    });
  }

  if (recoveryBias.level !== "normal") {
    insights.push({
      title: "Recovery load",
      body: recoveryBias.level === "high"
        ? "You stacked multiple harder sessions recently, so recovery work may help next."
        : "Recent training has started to stack in the same lane, so a lower-friction session could keep the week smoother.",
      tone: "recovery"
    });
  }

  if (!insights.length && currentPlanFocus && currentPlanFocus !== "recommended") {
    insights.push({
      title: "Goal alignment",
      body: `Your current plan still points toward ${formatCategoryLabel(currentPlanFocus).toLowerCase()}, so staying consistent matters more than adding more variety right now.`,
      tone: "goal"
    });
  }

  return insights.slice(0, 3);
}

function getConsistencyTrend(completionRecords = []) {
  const recent = getWindowStats(completionRecords, 0, 7);
  const previous = getWindowStats(completionRecords, 7, 14);

  if (!recent.sessionCount) {
    return {
      status: "flat",
      label: "Building a baseline",
      detail: "Complete a few sessions across the week and PulsePeak will start tracking whether consistency is improving."
    };
  }

  if (recent.activeDays > previous.activeDays || recent.sessionCount > previous.sessionCount + 1) {
    return {
      status: "up",
      label: "Consistency improved",
      detail: "You trained across more days this week, which is a better signal than crowding everything into one burst."
    };
  }

  if (previous.sessionCount && recent.activeDays < previous.activeDays) {
    return {
      status: "down",
      label: "Consistency slipped a little",
      detail: "Your recent sessions are more clustered, so a simpler next step can help the week feel easier to repeat."
    };
  }

  return {
    status: "flat",
    label: "Consistency is steady",
    detail: "Your recent training rhythm is holding, which is useful when the goal is to keep momentum without overcomplicating the week."
  };
}

function getWorkoutVarietyTrend(completionRecords = []) {
  const recent = getWindowStats(completionRecords, 0, 7);
  const previous = getWindowStats(completionRecords, 7, 14);

  if (!recent.sessionCount) {
    return {
      status: "flat",
      label: "Variety is still forming",
      detail: "A few more completed sessions will show whether your training mix is widening or staying narrow."
    };
  }

  if (recent.uniqueCategories > previous.uniqueCategories && recent.uniqueCategories >= 2) {
    return {
      status: "up",
      label: "Training variety improved",
      detail: "You are using more than one training lane lately, which helps the week feel broader than a single repeated session type."
    };
  }

  if (recent.uniqueCategories <= 1 && recent.sessionCount >= 2) {
    return {
      status: "down",
      label: "Your training is leaning narrow",
      detail: "You have stayed in the same lane recently, so a balance session would help the week feel more complete."
    };
  }

  return {
    status: "flat",
    label: "Variety is holding",
    detail: "Your recent training mix is stable, which is fine when the current focus still needs repetition."
  };
}

function getLoadToleranceTrend(completionRecords = []) {
  const recent = getWindowStats(completionRecords, 0, 7);
  const previous = getWindowStats(completionRecords, 7, 14);

  if (!recent.sessionCount) {
    return {
      status: "flat",
      label: "Load trend is still early",
      detail: "PulsePeak will start reading how well you tolerate moderate and harder sessions once you have more completed workouts logged."
    };
  }

  const recentDemand = recent.moderateCount + recent.hardCount * 1.5;
  const previousDemand = previous.moderateCount + previous.hardCount * 1.5;

  if (recent.hardCount >= previous.hardCount && recentDemand > previousDemand && recent.uniqueCategories >= 2) {
    return {
      status: "up",
      label: "Work capacity is building",
      detail: "You handled more moderate or harder sessions recently without falling into a single repeated lane."
    };
  }

  if (recent.hardCount >= 2 && recent.uniqueCategories <= 1) {
    return {
      status: "down",
      label: "Load has started to stack",
      detail: "You have pushed multiple harder sessions through a narrow pattern, so recovery work will matter more next."
    };
  }

  return {
    status: "flat",
    label: "Load is staying manageable",
    detail: "Recent training demand is still within a sustainable range, which keeps progress tied to repeatability."
  };
}

function getImprovementSignals({ completionRecords = [], memoryState = {}, currentPlanFocus = "recommended" } = {}) {
  return {
    consistency: getConsistencyTrend(completionRecords),
    variety: getWorkoutVarietyTrend(completionRecords),
    loadTolerance: getLoadToleranceTrend(completionRecords),
    whyThisMatters: getWhyThisMattersNotes({
      currentPlanFocus,
      memoryState,
      phase: getProgramPhase({
        completionRecords,
        currentPlanFocus,
        workoutMomentum: {
          currentStreakDays: 0,
          weeklyCompletionCount: getWindowStats(completionRecords, 0, 7).sessionCount
        }
      }),
      recoveryBias: getRecoveryBias(memoryState)
    })
  };
}

function getMilestoneMoments({ completionRecords = [], workoutMomentum = {}, memoryState = {} } = {}) {
  const totalSessions = Array.isArray(completionRecords) ? completionRecords.length : 0;
  const sessionsThisWeek = Number(workoutMomentum?.weeklyCompletionCount || getWindowStats(completionRecords, 0, 7).sessionCount || 0);
  const currentStreakDays = Number(workoutMomentum?.currentStreakDays || 0);
  const longestStreakDays = Number(workoutMomentum?.longestStreakDays || 0);
  const trainedToday = Boolean(workoutMomentum?.trainedToday);
  const milestones = [];

  if (totalSessions >= 1) {
    milestones.push({
      id: "first_workout",
      title: "First session completed",
      detail: "You have moved from setup into a real training week.",
      achieved: totalSessions >= 1,
      fresh: trainedToday && totalSessions === 1
    });
  }
  if (totalSessions >= 3) {
    milestones.push({
      id: "three_workouts",
      title: "Three sessions completed",
      detail: "You have enough real training in place for PulsePeak to start reading your weekly rhythm more clearly.",
      achieved: true,
      fresh: trainedToday && totalSessions === 3
    });
  }
  if (totalSessions >= 5) {
    milestones.push({
      id: "five_workouts",
      title: "Five sessions completed",
      detail: "Your training history is becoming meaningful enough to guide rotation, balance, and weekly pacing more cleanly.",
      achieved: true,
      fresh: trainedToday && totalSessions === 5
    });
  }
  if (currentStreakDays >= 7) {
    milestones.push({
      id: "seven_day_streak",
      title: "That is your first seven-day streak",
      detail: "You kept the training rhythm alive across a full week of activity.",
      achieved: true,
      fresh: trainedToday && currentStreakDays === 7
    });
  }
  if (longestStreakDays >= 3) {
    milestones.push({
      id: "longest_streak",
      title: "You just set a new consistency high",
      detail: "This is the longest training streak PulsePeak has seen from you so far.",
      achieved: true,
      fresh: trainedToday && currentStreakDays === longestStreakDays && currentStreakDays >= 3
    });
  }
  if (sessionsThisWeek >= 3) {
    milestones.push({
      id: "solid_week",
      title: "You completed your first solid training week",
      detail: "Three sessions in a week is enough to make the program structure feel real instead of theoretical.",
      achieved: true,
      fresh: trainedToday && sessionsThisWeek === 3
    });
  }
  if (sessionsThisWeek >= 4) {
    milestones.push({
      id: "consistent_week",
      title: "You put together a consistent week",
      detail: "Four or more sessions in a week gives the system much better signal for balance and next-step guidance.",
      achieved: true,
      fresh: trainedToday && sessionsThisWeek === 4
    });
  }

  const fresh = milestones.find((milestone) => milestone.fresh) || null;
  const latest = fresh || milestones[milestones.length - 1] || null;

  return {
    fresh,
    latest,
    milestones
  };
}

function getProgramPhase({ completionRecords = [], currentPlanFocus = "recommended", workoutMomentum = {} } = {}) {
  const totalSessions = Array.isArray(completionRecords) ? completionRecords.length : 0;
  const sessionsThisWeek = Number(workoutMomentum?.weeklyCompletionCount || getWindowStats(completionRecords, 0, 7).sessionCount || 0);
  const currentStreakDays = Number(workoutMomentum?.currentStreakDays || 0);
  const loadTrend = getLoadToleranceTrend(completionRecords);
  const varietyTrend = getWorkoutVarietyTrend(completionRecords);

  if (totalSessions < 3) {
    return {
      id: "building_consistency",
      label: "Building consistency",
      detail: "The priority is still showing up often enough for the week to feel repeatable before pushing volume or complexity."
    };
  }

  if (sessionsThisWeek < 3) {
    return {
      id: "establishing_structure",
      label: "Establishing structure",
      detail: "The system is shaping a clearer weekly rhythm so your next few sessions land in more predictable roles."
    };
  }

  if (loadTrend.status === "down") {
    return {
      id: "balancing_recovery",
      label: "Balancing recovery",
      detail: "Recent training has started to stack, so recovery-friendly work and better spacing matter more than forcing extra hard sessions."
    };
  }

  if (loadTrend.status === "up" && currentStreakDays >= 3) {
    return {
      id: "building_work_capacity",
      label: "Building work capacity",
      detail: "You are handling a little more useful training demand, so the next step is keeping that load sustainable instead of chasing more volume too quickly."
    };
  }

  if (varietyTrend.status === "up" || normalizeWorkoutCategory(currentPlanFocus) !== "recommended") {
    return {
      id: "maintaining_momentum",
      label: "Maintaining momentum",
      detail: `The current job is to keep ${formatCategoryLabel(currentPlanFocus).toLowerCase()} moving while protecting enough variety and recovery to stay consistent.`
    };
  }

  return {
    id: "establishing_structure",
    label: "Establishing structure",
    detail: "The program has enough recent history to start feeling intentional, but consistency still matters more than complexity."
  };
}

function getNextWeekAdjustment({ completionRecords = [], currentPlanFocus = "recommended", workoutMomentum = {}, accessTier = "free" } = {}) {
  const phase = getProgramPhase({ completionRecords, currentPlanFocus, workoutMomentum });
  const varietyTrend = getWorkoutVarietyTrend(completionRecords);
  const loadTrend = getLoadToleranceTrend(completionRecords);
  const hasFullAccess = hasLockedAccess(accessTier);

  if (phase.id === "building_consistency") {
    return {
      label: "Keep the week simple",
      detail: hasFullAccess
        ? "Next week should keep the same primary focus but protect enough spacing and recovery that you can repeat the schedule again."
        : "Next week should stay simple enough that you can repeat it without needing a hard reset."
    };
  }

  if (loadTrend.status === "down") {
    return {
      label: "Emphasize recovery balance",
      detail: hasFullAccess
        ? "Next week should keep the main focus, but pull one session toward lower joint stress or mobility support so fatigue does not stack."
        : "Next week should leave room for a lighter day so the recent load does not keep stacking."
    };
  }

  if (varietyTrend.status === "down") {
    return {
      label: "Add one balancing session",
      detail: hasFullAccess
        ? "Next week should keep your primary lane, but add one clearer counter-balance session so the program does not narrow too quickly."
        : "Next week should mix in one balancing session so the week does not lean too heavily into one lane."
    };
  }

  return {
    label: "Keep progression steady",
    detail: hasFullAccess
      ? `Next week can keep ${formatCategoryLabel(currentPlanFocus).toLowerCase()} leading while nudging variety and recovery just enough to keep momentum honest.`
      : "Next week should follow the same broad shape so the system can keep learning from a stable pattern."
  };
}

function getWhyThisMattersNotes({ currentPlanFocus = "recommended", memoryState = {}, phase = null, recoveryBias = null } = {}) {
  const notes = [];
  const balanceSignal = getCategoryBalanceSignal(memoryState);
  const safePhase = phase || { id: "building_consistency", label: "Building consistency" };
  const safeRecoveryBias = recoveryBias || getRecoveryBias(memoryState);

  if (safePhase.id === "building_consistency") {
    notes.push("This week is focused on building consistency before pushing volume harder.");
  } else if (safePhase.id === "balancing_recovery") {
    notes.push("Recovery-friendly sessions keep momentum without stacking fatigue.");
  } else if (currentPlanFocus && currentPlanFocus !== "recommended") {
    notes.push(`Keeping ${formatCategoryLabel(currentPlanFocus).toLowerCase()} in the lead helps the week feel more directed instead of random.`);
  }

  if (balanceSignal.repeatedCategory) {
    notes.push("Keeping variety up helps you avoid falling into the same training lane every day.");
  } else if (safeRecoveryBias.level === "normal") {
    notes.push("A steady training mix makes it easier to keep showing up without forcing bigger swings week to week.");
  }

  return notes.slice(0, 2);
}

function getResultSignals({ completionRecords = [], workoutMomentum = {} } = {}) {
  const consistency = getConsistencyTrend(completionRecords);
  const loadTolerance = getLoadToleranceTrend(completionRecords);
  const recentWeek = getWindowStats(completionRecords, 0, 7);
  const priorWeek = getWindowStats(completionRecords, 7, 14);
  const consistencyScore = Math.min(100, recentWeek.activeDays * 20 + recentWeek.sessionCount * 8);

  let momentum = "stable";
  if (consistency.status === "up" || recentWeek.sessionCount > priorWeek.sessionCount) {
    momentum = "increasing";
  } else if (consistency.status === "down" || workoutMomentum.currentStreakDays === 0) {
    momentum = "inconsistent";
  }

  let weeklyTrend = "This week is staying steady.";
  if (momentum === "increasing") {
    weeklyTrend = "This week is moving in the right direction.";
  } else if (momentum === "inconsistent") {
    weeklyTrend = "A simpler restart session would bring the week back into rhythm.";
  } else if (loadTolerance.status === "flat" || loadTolerance.status === "up") {
    weeklyTrend = "Your current pattern is sustainable.";
  }

  let shortMessage = "You are maintaining a repeatable training rhythm.";
  if (momentum === "increasing") {
    shortMessage =
      loadTolerance.status === "up"
        ? "You are staying active without overloading."
        : "Your session frequency is improving.";
  } else if (momentum === "inconsistent") {
    shortMessage = "A short session is enough to re-establish momentum.";
  }

  return {
    momentum,
    consistencyScore,
    weeklyTrend,
    shortMessage
  };
}

function getPerformanceSignals({ completionRecords = [] } = {}) {
  const recentWeek = getWindowStats(completionRecords, 0, 7);
  const priorWeek = getWindowStats(completionRecords, 7, 14);
  const durationDelta = recentWeek.avgDuration - priorWeek.avgDuration;
  const recentDemand = recentWeek.hardCount * 2 + recentWeek.moderateCount * 1.2 + recentWeek.lightCount * 0.7;
  const priorDemand = priorWeek.hardCount * 2 + priorWeek.moderateCount * 1.2 + priorWeek.lightCount * 0.7;

  const sessionLengthTrend = recentWeek.sessionCount && durationDelta >= 6 ? "up" : recentWeek.sessionCount && durationDelta <= -6 ? "down" : "flat";
  const intensityTrend = recentDemand > priorDemand + 1 ? "up" : recentDemand < priorDemand - 1 ? "down" : "flat";
  const frequencyTrend =
    recentWeek.sessionCount > priorWeek.sessionCount ? "up" : recentWeek.sessionCount < priorWeek.sessionCount ? "down" : "flat";

  let summaryLine = "Your training demand is staying steady enough to keep building.";
  if (frequencyTrend === "up" && (sessionLengthTrend === "up" || intensityTrend === "up")) {
    summaryLine = "You are handling slightly longer or more demanding sessions.";
  } else if (frequencyTrend === "up") {
    summaryLine = "Your training frequency is becoming more consistent.";
  } else if (intensityTrend !== "down") {
    summaryLine = "You are maintaining effort without overloading.";
  }

  return {
    sessionLengthTrend,
    intensityTrend,
    frequencyTrend,
    summaryLine
  };
}

function getSystemConfidenceSignal({ completionRecords = [], memoryState = {}, workoutMomentum = {}, currentPlanFocus = "recommended" } = {}) {
  const consistency = getConsistencyTrend(completionRecords);
  const loadTolerance = getLoadToleranceTrend(completionRecords);
  const balanceSignal = getCategoryBalanceSignal(memoryState);
  const recentWeek = getWindowStats(completionRecords, 0, 7);

  if (recentWeek.sessionCount < 2 || consistency.status === "down" || loadTolerance.status === "down" || balanceSignal.repeatedCount >= 3) {
    return null;
  }

  if (consistency.status === "up" && loadTolerance.status !== "down") {
    return "You are building a repeatable training rhythm.";
  }

  if (currentPlanFocus && currentPlanFocus !== "recommended" && !balanceSignal.repeatedCategory) {
    return "This structure is supporting consistent training.";
  }

  return "Your current pattern is balanced and sustainable.";
}

function getSmartRotationStatus({ recommendedWorkout = null } = {}) {
  if (!recommendedWorkout) {
    return null;
  }

  return {
    label: "Smart rotation active",
    detail: "Automatically balancing intensity, recovery, and movement patterns based on your recent training."
  };
}

function getPrimarySignalHighlight({ identitySignal = null, checkpoint = null, milestone = null, performanceSignals = null, resultSignals = null } = {}) {
  if (checkpoint) {
    return { title: checkpoint.title, detail: checkpoint.detail, kind: "checkpoint" };
  }
  if (milestone) {
    return { title: milestone.title, detail: milestone.detail, kind: "milestone" };
  }
  if (performanceSignals?.summaryLine) {
    return { title: "Performance trend", detail: performanceSignals.summaryLine, kind: "performance" };
  }
  if (identitySignal) {
    return { title: identitySignal.label, detail: identitySignal.detail, kind: "identity" };
  }
  if (resultSignals?.shortMessage) {
    return { title: "Recent pattern", detail: resultSignals.shortMessage, kind: "result" };
  }
  return null;
}

function getRecommendedCompanionAction({
  currentPlanFocus = "recommended",
  memoryState = {},
  workoutMomentum = {},
  recoveryBias = null,
  weeklyStructure = null,
  nutritionMode = "off",
  hasMobilityModule = true,
  hasNutritionModule = false
} = {}) {
  const safeRecoveryBias = recoveryBias || getRecoveryBias(memoryState);
  const recentWeek = getWindowStats(memoryState?.completionRecords, 0, 7);
  const hasRecentGap = Boolean(
    workoutMomentum?.weeklyCompletionCount >= 1 &&
      !workoutMomentum?.trainedToday &&
      workoutMomentum?.lastActiveDate &&
      Date.now() - new Date(workoutMomentum.lastActiveDate).getTime() > 1000 * 60 * 60 * 48
  );
  const recoveryDayScheduled = Boolean((weeklyStructure?.days || []).some((entry) => entry.type === "recovery" || entry.focus === "mobility_recovery"));

  if ((safeRecoveryBias.level === "high" || recoveryDayScheduled) && hasMobilityModule) {
    return {
      module: "mobility",
      title: "Recovery support fits best next",
      detail:
        safeRecoveryBias.level === "high"
          ? "Recent load has been high, so mobility is the cleanest companion move right now."
          : "This week's structure leaves room for recovery support, so mobility is the clearest companion move.",
      href: "/mobility",
      ctaLabel: "Open mobility"
    };
  }

  if (!hasRecentGap && hasNutritionModule && nutritionMode !== "off" && recentWeek.sessionCount >= 2) {
    return {
      module: "nutrition",
      title: "Nutrition support is useful right now",
      detail: "Your training frequency is picking up, so simple food direction can help the week stay repeatable.",
      href: "/nutrition",
      ctaLabel: "Open nutrition"
    };
  }

  if (hasRecentGap) {
    return {
      module: "workouts",
      title: "A shorter restart session would fit best",
      detail: "A simple session is the fastest way back into rhythm without forcing a bigger reset.",
      href: "/workouts",
      ctaLabel: "Open workouts"
    };
  }

  if (normalizeWorkoutCategory(currentPlanFocus) === "mobility_recovery" && hasMobilityModule) {
    return {
      module: "mobility",
      title: "Mobility is part of the main plan direction",
      detail: "Your current focus already leans recovery-first, so mobility should stay connected to the main week.",
      href: "/mobility",
      ctaLabel: "Open mobility"
    };
  }

  return null;
}

function getModuleContinuityContext({
  module = "dashboard",
  currentPlanFocus = "recommended",
  memoryState = {},
  workoutMomentum = {},
  recoveryBias = null,
  weeklyStructure = null,
  nutritionMode = "off"
} = {}) {
  const safeRecoveryBias = recoveryBias || getRecoveryBias(memoryState);
  const phase = getProgramPhase({
    completionRecords: memoryState?.completionRecords || [],
    currentPlanFocus,
    workoutMomentum
  });
  const structureSummary = weeklyStructure?.summary;

  if (module === "mobility") {
    if (safeRecoveryBias.level === "high") {
      return {
        title: "Useful today because recent load has been high",
        detail: "Mobility helps keep the week moving without stacking another hard session."
      };
    }
    if ((weeklyStructure?.days || []).some((entry) => entry.type === "recovery")) {
      return {
        title: "Fits this week's recovery balance",
        detail: "The current week already leaves room for a lower-friction support session."
      };
    }
    return {
      title: "Keep the support work connected",
      detail: "Mobility matters most when it supports the same weekly pattern as your training."
    };
  }

  if (module === "nutrition") {
    if (nutritionMode === "off") {
      return {
        title: "Nutrition guidance is off right now",
        detail: "Turn it back on when you want food direction to stay connected to the training week."
      };
    }
    if (workoutMomentum?.weeklyCompletionCount >= 2) {
      return {
        title: "Supports consistency while training frequency is increasing",
        detail: "Simple nutrition direction is more useful when the week has real training volume behind it."
      };
    }
    return {
      title: "Useful when building a repeatable routine",
      detail: "The nutrition layer works best when it reinforces the same simple routine you can actually repeat."
    };
  }

  if (module === "workouts") {
    return {
      title: structureSummary || `${formatCategoryLabel(currentPlanFocus)} is guiding the week.`,
      detail:
        phase.id === "balancing_recovery"
          ? "The next workout should stay useful without narrowing the week too aggressively."
          : "The next session should fit the same weekly structure instead of acting like a disconnected one-off."
    };
  }

  if (module === "plan") {
    return {
      title: "This week is trying to do one clear job",
      detail: structureSummary || `${formatCategoryLabel(currentPlanFocus)} is leading while recovery support stays in the mix.`
    };
  }

  return {
    title: "The system is staying connected",
    detail: structureSummary || "Recent training, current focus, and weekly pacing are all shaping the next recommendation."
  };
}

function getSystemTrustCue({
  currentPlanFocus = "recommended",
  memoryState = {},
  weeklyStructure = null,
  resultSignals = null
} = {}) {
  if (memoryState?.completionRecords?.length && resultSignals?.momentum === "increasing") {
    return "Updated from your recent training";
  }
  if (currentPlanFocus && currentPlanFocus !== "recommended") {
    return "Adjusted around your current focus";
  }
  if (weeklyStructure?.days?.length) {
    return "Reflecting this week's pattern";
  }
  return null;
}

function getCheckpoints({ completionRecords = [], workoutMomentum = {} } = {}) {
  const recentWeek = getWindowStats(completionRecords, 0, 7);
  const priorWeek = getWindowStats(completionRecords, 7, 14);
  const varietyTrend = getWorkoutVarietyTrend(completionRecords);
  const loadTolerance = getLoadToleranceTrend(completionRecords);

  if (recentWeek.sessionCount >= 4) {
    return {
      id: "solid_week",
      title: "Consistent training week",
      detail: "You have put together a fuller week of training, which gives the program much better signal.",
      status: "active"
    };
  }

  if (recentWeek.sessionCount >= 3) {
    return {
      id: "three_sessions",
      title: "3 sessions this week",
      detail: "You have crossed the point where the week starts to feel like a real routine instead of isolated workouts.",
      status: "active"
    };
  }

  if (varietyTrend.status === "up" && recentWeek.uniqueCategories >= 2) {
    return {
      id: "balanced_week",
      title: "Balanced training week",
      detail: "You spread recent training across more than one lane, which keeps the week from collapsing into one repeated pattern.",
      status: "active"
    };
  }

  if (priorWeek.hardCount >= 1 && loadTolerance.status !== "down" && recentWeek.lightCount >= 1) {
    return {
      id: "recovered_after_load",
      title: "Recovered after higher load",
      detail: "You followed harder work with a lower-friction session instead of stacking fatigue.",
      status: "active"
    };
  }

  if (recentWeek.sessionCount >= 2 && priorWeek.sessionCount < 2) {
    return {
      id: "first_consistent_week",
      title: "First consistent week",
      detail: "You are starting to string sessions together across the week instead of treating them like one-offs.",
      status: "active"
    };
  }

  return null;
}

function getIdentitySignal({ completionRecords = [], workoutMomentum = {} } = {}) {
  const recentWeek = getWindowStats(completionRecords, 0, 7);
  const varietyTrend = getWorkoutVarietyTrend(completionRecords);

  if (workoutMomentum.currentStreakDays >= 4) {
    return {
      label: "You are maintaining momentum",
      detail: "Your training is showing up as a repeatable habit now, not an occasional push."
    };
  }

  if (recentWeek.sessionCount >= 3 && varietyTrend.status === "up") {
    return {
      label: "You are developing balanced training habits",
      detail: "Recent sessions are spreading across the week in a more structured way."
    };
  }

  if (recentWeek.sessionCount >= 3) {
    return {
      label: "You are training with structure",
      detail: "The week now has enough real sessions to feel like a pattern, not just one workout at a time."
    };
  }

  return {
    label: "You are building consistency",
    detail: "Every completed session is making the week easier to repeat."
  };
}

function getRecentCategories(memoryState = {}) {
  if (Array.isArray(memoryState?.completionRecords) && memoryState.completionRecords.length) {
    return memoryState.completionRecords
      .map((record) => normalizeWorkoutCategory(record?.category))
      .filter(Boolean)
      .slice(0, 4);
  }

  return Array.isArray(memoryState?.recentCategories)
    ? memoryState.recentCategories.map(normalizeWorkoutCategory).filter(Boolean).slice(0, 4)
    : [];
}

function getWindowStats(completionRecords = [], startDaysAgo = 0, endDaysAgo = 7) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - endDaysAgo);
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() - startDaysAgo + 1);

  const records = (Array.isArray(completionRecords) ? completionRecords : []).filter((record) => {
    const date = record?.completedAt ? new Date(record.completedAt) : null;
    return date && !Number.isNaN(date.getTime()) && date >= start && date < end;
  });

  const categories = records.map((record) => normalizeWorkoutCategory(record?.category)).filter(Boolean);
  const uniqueDays = new Set(records.map((record) => new Date(record.completedAt).toDateString()));
  const loadBands = records.map((record) => normalizeLoadBand(record?.loadBand || getWorkoutLoadBand(record)));

  return {
    sessionCount: records.length,
    activeDays: uniqueDays.size,
    uniqueCategories: new Set(categories).size,
    categories,
    totalDuration: records.reduce((total, record) => total + Number(record?.duration || 0), 0),
    avgDuration: records.length ? records.reduce((total, record) => total + Number(record?.duration || 0), 0) / records.length : 0,
    hardCount: loadBands.filter((entry) => entry === "hard").length,
    moderateCount: loadBands.filter((entry) => entry === "moderate").length,
    lightCount: loadBands.filter((entry) => entry === "light").length
  };
}

function selectAvailableFocus(focus, workouts = []) {
  const normalized = normalizeWorkoutCategory(focus);
  if (normalized && workouts.some((workout) => normalizeWorkoutCategory(workout?.focus || workout?.focusLabel || workout?.type) === normalized)) {
    return normalized;
  }
  return normalized === "recommended" ? "full_body" : normalized;
}

function selectSecondaryFocus(primaryFocus, workouts = []) {
  const pairMap = {
    lower_body: "upper_body",
    upper_body: "lower_body",
    push: "pull",
    pull: "push",
    full_body: "mobility_recovery",
    mobility_recovery: "full_body",
    legs: "upper_body",
    shoulders: "lower_body",
    chest: "back",
    back: "chest"
  };
  const preferred = pairMap[primaryFocus] || "full_body";
  return selectAvailableFocus(preferred, workouts) || preferred;
}

function selectTertiaryFocus(primaryFocus, secondaryFocus, workouts = []) {
  const candidates = ["conditioning", "full_body", "upper_body", "lower_body", "mobility_recovery", primaryFocus, secondaryFocus];
  return (
    candidates.find((candidate) => {
      const normalized = normalizeWorkoutCategory(candidate);
      return normalized !== primaryFocus && normalized !== secondaryFocus && selectAvailableFocus(normalized, workouts);
    }) || "full_body"
  );
}

function normalizeWorkoutCategory(value = "") {
  const normalized = normalizeToken(value);
  if (["legs", "glutes"].includes(normalized)) {
    return "lower_body";
  }
  if (["chest", "back", "shoulders", "arms", "biceps", "triceps", "upper_body", "push", "pull"].includes(normalized)) {
    return normalized === "upper_body" ? "upper_body" : normalized;
  }
  if (normalized === "recovery_day") {
    return "mobility_recovery";
  }
  return normalized || "full_body";
}

function normalizeToken(value = "") {
  return String(value || "")
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll("/", " ")
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function normalizeLoadBand(value = "") {
  const normalized = normalizeToken(value);
  if (normalized === "light" || normalized === "hard") {
    return normalized;
  }
  return "moderate";
}

function isLowerBodyCategory(category = "") {
  return ["lower_body", "legs", "glutes"].includes(normalizeWorkoutCategory(category));
}

function isConditioningCategory(category = "") {
  return ["conditioning", "fat_loss"].includes(normalizeWorkoutCategory(category));
}

function isUpperBodyCategory(category = "") {
  return ["upper_body", "push", "pull", "chest", "back", "shoulders", "arms", "biceps", "triceps"].includes(normalizeWorkoutCategory(category));
}

function formatCategoryLabel(value = "") {
  const normalized = normalizeWorkoutCategory(value);
  if (normalized === "recommended") {
    return "Balanced training";
  }
  switch (normalized) {
    case "upper_body":
      return "Upper body";
    case "lower_body":
      return "Lower body";
    case "mobility_recovery":
      return "Mobility / recovery";
    case "full_body":
      return "Full body";
    default:
      return normalized.replaceAll("_", " ");
  }
}

function hasLockedAccess(accessTier) {
  const normalized = String(accessTier || "").toLowerCase();
  return normalized === "trial_active" || normalized === "premium";
}
