import { EQUIPMENT_PROFILE_OPTIONS } from "../../shared/workoutEngine";

export const GOAL_OPTIONS = [
  {
    value: "strength",
    label: "Strength",
    description: "Bias the week toward heavier primary lifts and lower-rep strength work."
  },
  {
    value: "athletic_performance",
    label: "Athletic Performance",
    description: "Blend performance training, conditioning, and mobility in the weekly plan."
  },
  {
    value: "bodybuilding",
    label: "Bodybuilding",
    description: "Push volume, muscle targeting, and repeatable hypertrophy work."
  },
  {
    value: "fat_loss",
    label: "Fat Loss",
    description: "Use higher training frequency and cleaner nutrition structure."
  },
  {
    value: "general_fitness",
    label: "General Fitness",
    description: "Stay balanced across strength, recovery, and daily consistency."
  },
  {
    value: "mobility",
    label: "Mobility",
    description: "Keep the week lower intensity and movement-quality focused."
  },
  {
    value: "injury_recovery",
    label: "Injury Recovery",
    description: "Train safely with lower load, cleaner movement, and extra guardrails."
  },
  {
    value: "active_aging",
    label: "Active Aging",
    description: "Prioritize joint-friendly training and recovery-heavy pacing."
  }
];

export const AGE_GROUP_OPTIONS = ["18-29", "30-39", "40-49", "50+"];
export const EXPERIENCE_LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"];
export const TRAINING_ENVIRONMENT_OPTIONS = ["home", "gym", "hybrid"];
export { EQUIPMENT_PROFILE_OPTIONS };
export const SEX_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];
export const INJURY_STATUS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "minor", label: "Minor limitation" },
  { value: "active_injury", label: "Active injury" }
];
export const RESTRICTED_AREA_OPTIONS = ["knee", "shoulder", "back", "elbow", "hip", "ankle"];
export const NUTRITION_MODE_OPTIONS = [
  { value: "off", label: "Off", description: "Hide nutrition tracking from the dashboard." },
  { value: "basic", label: "Basic", description: "Track protein and hydration without full meal detail." },
  { value: "full", label: "Full", description: "Track calories, protein, and full meal logs." }
];

export const UNIT_PREFERENCE_OPTIONS = [
  { value: "imperial", label: "Imperial", description: "Use inches, pounds, and fluid ounces." },
  { value: "metric", label: "Metric", description: "Use centimeters, kilograms, and liters." }
];
