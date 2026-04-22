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
  return normalizeEquipmentSelections(
    profile.equipmentSelections || EQUIPMENT_PROFILE_SELECTION_MAP[profile.equipmentProfile] || [],
    profile.trainingEnvironment || "hybrid"
  );
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
