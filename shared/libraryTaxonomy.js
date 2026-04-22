import { createMediaPayload } from "./exerciseCatalog.js";

export const WORKOUT_DISCOVERY_CATEGORIES = [
  { id: "all", label: "All workouts", description: "Browse the full training library." },
  { id: "full_body", label: "Full Body", description: "Balanced sessions that cover the whole body." },
  { id: "upper_body", label: "Upper Body", description: "Pressing and pulling sessions for the upper body." },
  { id: "lower_body", label: "Lower Body", description: "Lower-body sessions built around squat, hinge, and single-leg work." },
  { id: "push", label: "Push", description: "Chest, shoulders, and triceps sessions." },
  { id: "pull", label: "Pull", description: "Back, rear-delt, and biceps sessions." },
  { id: "legs", label: "Legs", description: "Lower-body sessions with more dedicated leg volume." },
  { id: "chest", label: "Chest", description: "Chest-led pressing sessions." },
  { id: "back", label: "Back", description: "Back-led pulling sessions." },
  { id: "shoulders", label: "Shoulders", description: "Shoulder priority sessions and health work." },
  { id: "arms", label: "Arms", description: "Direct arm support and accessory work." },
  { id: "glutes", label: "Glutes", description: "Hip-drive and glute emphasis." },
  { id: "core", label: "Core", description: "Carries, control, and trunk stability." },
  { id: "strength", label: "Strength", description: "Main-lift-first sessions with more load emphasis." },
  { id: "muscle_building", label: "Muscle Building", description: "Volume-forward sessions for muscle gain." },
  { id: "fat_loss", label: "Fat Loss", description: "Efficient sessions that keep pace high enough to stay moving." },
  { id: "conditioning", label: "Conditioning", description: "Faster-paced finishers and density work." },
  { id: "bodyweight", label: "Bodyweight", description: "Sessions that stay useful without heavy equipment." },
  { id: "at_home", label: "At Home", description: "Home-friendly sessions that stay practical." },
  { id: "dumbbell", label: "Dumbbell", description: "Sessions built around dumbbells and simple setups." },
  { id: "beginner", label: "Beginner", description: "Clearer pacing and simpler exercise demands." },
  { id: "intermediate", label: "Intermediate", description: "Steadier volume and more movement variety." },
  { id: "advanced", label: "Advanced", description: "Denser or heavier session options." },
  { id: "joint_friendly", label: "Joint-Friendly", description: "Lower-stress choices that still move the week forward." },
  { id: "forty_plus", label: "40+", description: "Smoother pacing and recovery-aware training." },
  { id: "recovery_day", label: "Recovery Day", description: "Lower-stress sessions for lighter training days." },
  { id: "hybrid_setup", label: "Hybrid Setup", description: "Flexible sessions for mixed equipment setups." }
];

export const PLAN_DISCOVERY_CATEGORIES = [
  { id: "build_muscle", label: "Build Muscle", description: "Training paths built around repeatable volume and recovery." },
  { id: "lose_fat", label: "Lose Fat", description: "Training paths that keep consistency high while cutting noise." },
  { id: "improve_strength", label: "Improve Strength", description: "Main-lift-forward plans that keep progression believable." },
  { id: "general_fitness", label: "General Fitness", description: "Balanced plans that keep training useful across the week." },
  { id: "beginner_restart", label: "Beginner Restart", description: "A simpler path back into training after a long gap." },
  { id: "at_home_consistency", label: "At-Home Consistency", description: "Home-first plans that stay effective without a full gym." },
  { id: "joint_friendly_training", label: "Joint-Friendly Training", description: "Plans that reduce wear while keeping momentum alive." },
  { id: "training_recovery", label: "Training + Recovery", description: "Plans with more recovery and mobility built in." },
  { id: "busy_schedule", label: "Busy Schedule", description: "Shorter sessions with cleaner weekly structure." },
  { id: "dumbbell_only", label: "Dumbbell-Only", description: "Plans that stay strong with dumbbells and basic tools." },
  { id: "mobility_priority", label: "Mobility Priority", description: "Movement-first plans that still keep training useful." },
  { id: "recomposition", label: "Recomposition", description: "Balanced training for getting leaner while holding strength." },
  { id: "performance_support", label: "Performance Support", description: "Athletic support paths that keep training quality high." }
];

export const EXERCISE_LIBRARY_CATEGORIES = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "legs", label: "Legs" },
  { id: "glutes", label: "Glutes" },
  { id: "core", label: "Core" },
  { id: "full_body", label: "Full Body" },
  { id: "conditioning", label: "Conditioning" },
  { id: "mobility", label: "Mobility" },
  { id: "stretching", label: "Stretching" },
  { id: "rehab", label: "Rehab / Physio" },
  { id: "recovery", label: "Recovery" }
];

export const TOOL_CATEGORIES = [
  { id: "training_tools", label: "Training tools", description: "Helpers that keep session decisions easier." },
  { id: "progress_tools", label: "Progress tools", description: "Tools that keep your history and consistency visible." },
  { id: "recovery_tools", label: "Recovery tools", description: "Support tools for mobility, recovery, and training load." },
  { id: "nutrition_tools", label: "Nutrition tools", description: "Simple food and hydration support tools." }
];

export const TOOL_LIBRARY = [
  { id: "workout-history", title: "Workout history", category: "progress_tools", to: "/preferences?section=preferences", summary: "Review completed sessions, exercise choices, and recent logs." },
  { id: "strength-progression", title: "Strength progression", category: "progress_tools", to: "/preferences?section=preferences", summary: "Track last load, best load, and how lifts are trending over time." },
  { id: "weekly-consistency", title: "Weekly consistency tracker", category: "progress_tools", to: "/progress", summary: "Keep the week connected with one simple progress signal." },
  { id: "split-selector", title: "Workout selector / split helper", category: "training_tools", to: "/workouts", summary: "Choose the right split, setup, and session for the day." },
  { id: "mobility-selector", title: "Mobility selector", category: "recovery_tools", to: "/mobility", summary: "Find the right recovery or rehab flow by area, time, and recovery state." },
  { id: "nutrition-support", title: "Nutrition guidance", category: "nutrition_tools", to: "/nutrition", summary: "Keep food direction, hydration, and recovery support practical." }
];

export const PLAN_LIBRARY = [
  planEntry("strength-base-builder", "Strength Base Builder", "improve_strength", "strength", "intermediate", ["full_gym", "hybrid"], ["gym", "hybrid"], "moderate", "moderate", "balanced", "A main-lift-first path that builds a stronger weekly structure without overcomplicating the week."),
  planEntry("lean-recomp-path", "Lean Recomp Path", "recomposition", "fat_loss", "intermediate", ["hybrid", "bench_dumbbells", "full_gym"], ["home", "gym", "hybrid"], "moderate", "moderate", "balanced", "A balanced path for tightening up body composition while keeping training quality high."),
  planEntry("joint-smart-muscle-plan", "Joint-Smart Muscle Plan", "joint_friendly_training", "bodybuilding", "beginner", ["hybrid", "bench_dumbbells", "full_gym"], ["home", "gym", "hybrid"], "moderate", "high", "joint_friendly", "A muscle-building path with more recovery room and lower-stress movement choices."),
  planEntry("dumbbell-momentum-plan", "Dumbbell Momentum Plan", "dumbbell_only", "general_fitness", "beginner", ["dumbbells_only", "bench_dumbbells"], ["home", "hybrid"], "short", "moderate", "balanced", "A cleaner weekly path for dumbbell-only training that still feels structured."),
  planEntry("full-body-consistency-track", "Full-Body Consistency Track", "general_fitness", "general_fitness", "beginner", ["bodyweight", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"], "short", "moderate", "balanced", "A full-body path for staying consistent when life is busy and variety matters."),
  planEntry("recovery-first-training-week", "Recovery-First Training Week", "training_recovery", "mobility", "beginner", ["bodyweight", "hybrid", "bench_dumbbells"], ["home", "gym", "hybrid"], "short", "low", "recovery_focused", "A training week that gives recovery and movement quality more room without going idle."),
  planEntry("hybrid-performance-path", "Hybrid Performance Path", "performance_support", "athletic_performance", "advanced", ["hybrid", "full_gym"], ["home", "gym", "hybrid"], "moderate", "high", "performance", "A mixed-environment path for keeping performance work sharp across the week."),
  planEntry("beginner-restart-track", "Beginner Restart Track", "beginner_restart", "general_fitness", "beginner", ["bodyweight", "hybrid", "dumbbells_only"], ["home", "gym", "hybrid"], "short", "low", "joint_friendly", "A lower-friction path back into training after a break."),
  planEntry("at-home-consistency-loop", "At-Home Consistency Loop", "at_home_consistency", "general_fitness", "beginner", ["bodyweight", "bands", "dumbbells_only"], ["home", "hybrid"], "short", "moderate", "balanced", "A home-first path that keeps the app simple and the week repeatable."),
  planEntry("mobility-priority-path", "Mobility Priority Path", "mobility_priority", "mobility", "beginner", ["bodyweight", "bands", "hybrid"], ["home", "gym", "hybrid"], "short", "low", "recovery_focused", "A movement-first path that still keeps training options open."),
  planEntry("busy-schedule-build", "Busy Schedule Build", "busy_schedule", "general_fitness", "intermediate", ["hybrid", "bench_dumbbells", "bodyweight"], ["home", "gym", "hybrid"], "short", "moderate", "balanced", "A time-efficient path for fitting useful training into a crowded week.")
];

export const WORKOUT_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "shortest", label: "Shortest" },
  { value: "easiest", label: "Easiest" },
  { value: "recovery_friendly", label: "Most recovery-friendly" },
  { value: "equipment_efficient", label: "Most equipment-efficient" }
];

export const MOBILITY_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "shortest", label: "Shortest" },
  { value: "easiest", label: "Easiest" },
  { value: "recovery_friendly", label: "Most recovery-friendly" }
];

function planEntry(id, title, category, goal, experienceLevel, equipment, environment, scheduleStructure, intensity, recoveryProfile, summary) {
  return {
    id,
    title,
    contentType: "plan",
    category,
    subcategory: goal,
    goal,
    experienceLevel,
    equipment,
    environment,
    duration: scheduleStructure,
    intensity,
    difficulty: experienceLevel,
    bodyFocus: goal === "mobility" ? ["mobility", "recovery"] : ["full_body"],
    movementPatterns: goal === "strength" ? ["push", "pull", "squat", "hinge"] : ["balanced_training"],
    recoveryProfile,
    jointStress: recoveryProfile === "joint_friendly" ? "low" : intensity === "high" ? "moderate" : "low",
    rehabSafe: recoveryProfile !== "performance",
    summary,
    guidance: {
      focus: `Use ${title} when you want the week to feel more ${goal.replaceAll("_", " ")}-driven.`,
      nextMove: "Pick the next session that matches the plan and let the week stay connected."
    },
    media: createMediaPayload(),
    relatedContentIds: [],
    tags: [category, goal, experienceLevel, recoveryProfile]
  };
}
