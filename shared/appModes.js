export const APP_MODES = ["full_system", "training_only", "training_recovery"];

export const APP_MODE_OPTIONS = [
  {
    value: "full_system",
    label: "Full System",
    description: "Get the full training, recovery, nutrition, and progress experience."
  },
  {
    value: "training_only",
    label: "Training Only",
    description: "Keep PulsePeak focused on your workouts and weekly plan."
  },
  {
    value: "training_recovery",
    label: "Training + Recovery",
    description: "Train hard, recover well, and keep the app lighter."
  }
];

const HIDDEN_MODULES_BY_MODE = {
  full_system: [],
  training_only: ["mobility", "nutrition", "progress", "coach"],
  training_recovery: ["nutrition", "progress", "coach"]
};

export function normalizeAppMode(value) {
  return APP_MODES.includes(value) ? value : "full_system";
}

export function getHiddenModulesForAppMode(value) {
  return [...(HIDDEN_MODULES_BY_MODE[normalizeAppMode(value)] || [])];
}

export function getAppModeLabel(value) {
  return APP_MODE_OPTIONS.find((option) => option.value === normalizeAppMode(value))?.label || "Full System";
}
