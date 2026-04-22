import crypto from "node:crypto";
import {
  ACCESS_TIERS,
  FREE_EXERCISES_PER_WORKOUT_LIMIT,
  getFreeWorkoutAccessProfile,
  hasFullWorkoutAccess,
  isWorkoutFocusUsable,
  normalizeAccessTier
} from "../../shared/entitlements.js";
import {
  buildEquipmentProfileFromSelections,
  EQUIPMENT_PROFILE_OPTIONS,
  formatEquipmentSelections,
  getEquipmentSelectionOptionsForEnvironment,
  getEquipmentSelectionsForProfile,
  WORKOUT_FOCUS_OPTIONS,
  formatWorkoutFocus,
  getEquipmentOptionsForEnvironment,
  getSuggestedWorkoutFocuses,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../../shared/workoutEngine.js";
import { createLibraryEntry, createMediaPayload, validateLibraryEntries } from "../../shared/exerciseCatalog.js";
import { buildExerciseMediaSpec } from "../../shared/mediaGenerationConfig.js";
import { EXERCISE_LIBRARY_CATEGORIES, WORKOUT_DISCOVERY_CATEGORIES, WORKOUT_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";
import { adaptMovementForProfile, attachMovementToExercise, findMovementForName } from "./movementLibrary.js";

const BASE_EXERCISE_VARIANTS = [
  variant("barbell-bench-press", "Barbell bench press", "horizontal_push_primary", "barbell", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("machine-chest-press", "Machine chest press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("incline-dumbbell-press", "Incline dumbbell press", "horizontal_push_primary", "dumbbell", "Chest", "Horizontal push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("incline-machine-press", "Incline machine press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-floor-press", "Dumbbell floor press", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("push-up", "Push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-chest-press", "Band chest press", "horizontal_push_secondary", "bands", "Chest", "Horizontal push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("deficit-push-up", "Deficit push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("seated-shoulder-press", "Seated shoulder press", "vertical_push", "machine", "Shoulders", "Vertical push", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-shoulder-press", "Dumbbell shoulder press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("pike-push-up", "Pike push-up", "vertical_push", "bodyweight", "Shoulders", "Vertical push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-overhead-press", "Band overhead press", "vertical_push", "bands", "Shoulders", "Vertical push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("arnold-press", "Arnold press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-lateral-raise", "Cable lateral raise", "shoulder_isolation", "machine", "Shoulders", "Shoulder isolation", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-lateral-raise", "Dumbbell lateral raise", "shoulder_isolation", "dumbbell", "Shoulders", "Shoulder isolation", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-lateral-raise", "Band lateral raise", "shoulder_isolation", "bands", "Shoulders", "Shoulder isolation", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("lean-away-lateral-raise", "Lean-away lateral raise", "shoulder_isolation", "dumbbell", "Shoulders", "Shoulder isolation", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("triceps-pushdown", "Triceps pushdown", "triceps", "machine", "Triceps", "Elbow extension", ["full_gym"], ["gym", "hybrid"]),
  variant("overhead-dumbbell-extension", "Overhead dumbbell extension", "triceps", "dumbbell", "Triceps", "Elbow extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("close-grip-push-up", "Close-grip push-up", "triceps", "bodyweight", "Triceps", "Elbow extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-pressdown", "Band pressdown", "triceps", "bands", "Triceps", "Elbow extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bench-dip", "Bench dip", "triceps", "bodyweight", "Triceps", "Elbow extension", ["bench_dumbbells", "bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("skull-crusher", "Skull crusher", "triceps", "dumbbell", "Triceps", "Elbow extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("lat-pulldown", "Lat pulldown", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]),
  variant("assisted-pull-up", "Assisted pull-up", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]),
  variant("band-pulldown", "Band pulldown", "vertical_pull", "bands", "Back", "Vertical pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("back-widow", "Back widow", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("pull-up-negative", "Pull-up negative", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("chest-supported-row", "Chest-supported row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]),
  variant("seated-cable-row", "Seated cable row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]),
  variant("single-arm-dumbbell-row", "Single-arm dumbbell row", "horizontal_pull", "dumbbell", "Back", "Horizontal pull", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-row", "Band row", "horizontal_pull", "bands", "Back", "Horizontal pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("doorframe-row", "Doorframe row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("inverted-row", "Inverted row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("face-pull", "Cable face pull", "rear_delt", "machine", "Shoulders", "Rear delt / posture", ["full_gym"], ["gym", "hybrid"]),
  variant("band-pull-apart", "Band pull-apart", "rear_delt", "bands", "Shoulders", "Rear delt / posture", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("reverse-fly", "Reverse fly", "rear_delt", "dumbbell", "Shoulders", "Rear delt / posture", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("reverse-snow-angel", "Reverse snow angel", "rear_delt", "bodyweight", "Shoulders", "Rear delt / posture", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("ez-bar-curl", "EZ-bar curl", "biceps", "barbell", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("hammer-curl", "Hammer curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-curl", "Band curl", "biceps", "bands", "Biceps", "Elbow flexion", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("towel-curl-isometric", "Towel curl isometric", "biceps", "bodyweight", "Biceps", "Elbow flexion", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("incline-dumbbell-curl", "Incline dumbbell curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),
  variant("concentration-curl", "Concentration curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("back-squat", "Back squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("leg-press", "Leg press", "squat", "machine", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("goblet-squat", "Goblet squat", "squat", "dumbbell", "Legs", "Squat", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bodyweight-squat", "Bodyweight squat", "squat", "bodyweight", "Legs", "Squat", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-squat", "Banded squat", "squat", "bands", "Legs", "Squat", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("front-foot-elevated-squat", "Front-foot elevated squat", "squat", "dumbbell", "Legs", "Squat", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("romanian-deadlift", "Romanian deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("trap-bar-deadlift", "Trap-bar deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-romanian-deadlift", "Dumbbell Romanian deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-hinge-reach", "Hip hinge reach", "hinge", "bodyweight", "Hamstrings", "Hinge", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-hip-hinge", "Band hip hinge", "hinge", "bands", "Hamstrings", "Hinge", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("kettlebell-deadlift", "Kettlebell deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("walking-lunge", "Walking lunge", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("supported-split-squat", "Supported split squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-reverse-lunge", "Banded reverse lunge", "lunge", "bands", "Legs", "Single-leg", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("step-up", "Step-up", "lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("rear-foot-elevated-split-squat", "Rear-foot elevated split squat", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),

  variant("hip-thrust", "Hip thrust", "glute", "barbell", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),
  variant("glute-bridge", "Glute bridge", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("dumbbell-glute-bridge", "Dumbbell glute bridge", "glute", "dumbbell", "Glutes", "Hip extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-glute-bridge", "Banded glute bridge", "glute", "bands", "Glutes", "Hip extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-pull-through", "Cable pull-through", "glute", "machine", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),

  variant("standing-calf-raise", "Standing calf raise", "calf", "machine", "Calves", "Calf raise", ["full_gym"], ["gym", "hybrid"]),
  variant("single-leg-calf-raise", "Single-leg calf raise", "calf", "bodyweight", "Calves", "Calf raise", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-calf-raise", "Band calf raise", "calf", "bands", "Calves", "Calf raise", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("seated-calf-raise", "Seated calf raise", "calf", "dumbbell", "Calves", "Calf raise", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("dumbbell-thruster", "Dumbbell thruster", "full_body_push", "dumbbell", "Full body", "Total-body push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("push-up-to-down-dog", "Push-up to down dog", "full_body_push", "bodyweight", "Full body", "Total-body push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-thruster", "Band thruster", "full_body_push", "bands", "Full body", "Total-body push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("man-maker", "Man maker", "full_body_push", "dumbbell", "Full body", "Total-body push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("renegade-row", "Renegade row", "full_body_pull", "dumbbell", "Full body", "Total-body pull", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("mountain-climber", "Mountain climber", "full_body_pull", "bodyweight", "Full body", "Total-body pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-row-squat", "Band row to squat", "full_body_pull", "bands", "Full body", "Total-body pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bear-crawl-drag", "Bear crawl drag", "full_body_pull", "bodyweight", "Full body", "Total-body pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("reverse-lunge", "Reverse lunge", "full_body_leg", "bodyweight", "Legs", "Total-body leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("goblet-squat-to-press", "Goblet squat to press", "full_body_leg", "dumbbell", "Legs", "Total-body leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-good-morning", "Banded good morning", "full_body_leg", "bands", "Legs", "Total-body leg", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("step-up-to-knee-drive", "Step-up to knee drive", "full_body_leg", "dumbbell", "Legs", "Total-body leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("high-knees", "High knees", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("burpee", "Burpee", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-power-step", "Band power step", "conditioning", "bands", "Cardio", "Conditioning", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bike-sprint", "Bike sprint", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]),
  variant("jump-rope", "Jump rope", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("cat-cow", "Cat-cow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("worlds-greatest-stretch", "World's greatest stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("ninety-ninety-hip-flow", "90/90 hip flow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("thoracic-rotation", "Thoracic rotation", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("shoulder-mobility", "Shoulder mobility", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-flexor-stretch", "Hip flexor stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hamstring-stretch", "Hamstring stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"])
];

const EXPANDED_EXERCISE_VARIANTS = [
  ...variantFamily("push_family", [
    ["flat-dumbbell-bench-press", "Flat dumbbell bench press", "horizontal_push_primary", "dumbbell", "Chest", "Horizontal push", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]],
    ["smith-machine-bench-press", "Smith machine bench press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["machine-incline-chest-press", "Machine incline chest press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["cable-chest-fly", "Cable chest fly", "horizontal_push_secondary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["dumbbell-squeeze-press", "Dumbbell squeeze press", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["ring-push-up", "Ring push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("shoulder_press_family", [
    ["half-kneeling-dumbbell-press", "Half-kneeling dumbbell press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["landmine-press", "Landmine press", "vertical_push", "barbell", "Shoulders", "Vertical push", ["full_gym", "hybrid"], ["gym", "hybrid"]],
    ["z-press", "Z-press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["cable-y-raise", "Cable Y raise", "shoulder_isolation", "machine", "Shoulders", "Shoulder isolation", ["full_gym"], ["gym", "hybrid"]],
    ["rear-delt-cable-fly", "Rear-delt cable fly", "rear_delt", "machine", "Shoulders", "Rear delt / posture", ["full_gym"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("pull_family", [
    ["neutral-grip-lat-pulldown", "Neutral-grip lat pulldown", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]],
    ["chin-up", "Chin-up", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["straight-arm-band-pulldown", "Straight-arm band pulldown", "vertical_pull", "bands", "Back", "Vertical pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]],
    ["t-bar-row", "T-bar row", "horizontal_pull", "barbell", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]],
    ["machine-row", "Machine row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]],
    ["tripod-row", "Tripod row", "horizontal_pull", "dumbbell", "Back", "Horizontal pull", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["suspension-row", "Suspension row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("arm_accessory_family", [
    ["preacher-curl", "Preacher curl", "biceps", "machine", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]],
    ["rope-hammer-curl", "Rope hammer curl", "biceps", "machine", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]],
    ["reverse-curl", "Reverse curl", "biceps", "barbell", "Biceps", "Elbow flexion", ["full_gym", "hybrid"], ["gym", "hybrid"]],
    ["rope-overhead-extension", "Rope overhead extension", "triceps", "machine", "Triceps", "Elbow extension", ["full_gym"], ["gym", "hybrid"]],
    ["cross-body-triceps-extension", "Cross-body triceps extension", "triceps", "dumbbell", "Triceps", "Elbow extension", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["wrist-curl", "Wrist curl", "biceps", "dumbbell", "Forearms", "Elbow flexion", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("squat_family", [
    ["front-squat", "Front squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["hack-squat", "Hack squat", "squat", "machine", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["box-squat", "Box squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["heels-elevated-goblet-squat", "Heels-elevated goblet squat", "squat", "dumbbell", "Legs", "Squat", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("hinge_family", [
    ["conventional-deadlift", "Conventional deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]],
    ["single-leg-romanian-deadlift", "Single-leg Romanian deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["barbell-good-morning", "Barbell good morning", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]],
    ["cable-romanian-deadlift", "Cable Romanian deadlift", "hinge", "machine", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("single_leg_family", [
    ["dumbbell-reverse-lunge", "Dumbbell reverse lunge", "lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["lateral-lunge", "Lateral lunge", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["cossack-squat", "Cossack squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["landmine-split-squat", "Landmine split squat", "lunge", "barbell", "Legs", "Single-leg", ["full_gym", "hybrid"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("glute_family", [
    ["barbell-hip-thrust-pause", "Barbell hip thrust pause", "glute", "barbell", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]],
    ["frog-pump", "Frog pump", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["single-leg-glute-bridge", "Single-leg glute bridge", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("core_finish_family", [
    ["farmer-carry", "Farmer carry", "full_body_finish", "dumbbell", "Core", "Carry", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["suitcase-carry", "Suitcase carry", "full_body_finish", "dumbbell", "Core", "Carry", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["pallof-press", "Pallof press", "full_body_finish", "bands", "Core", "Anti-rotation", ["bands", "hybrid"], ["home", "gym", "hybrid"]],
    ["dead-bug", "Dead bug", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["plank-shoulder-tap", "Plank shoulder tap", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["sled-push", "Sled push", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["rower-sprint", "Rower sprint", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]]
  ])
];

const EXERCISE_VARIANTS = validateLibraryEntries([...BASE_EXERCISE_VARIANTS, ...EXPANDED_EXERCISE_VARIANTS], "workout catalog");

const WORKOUT_TEMPLATES = [
  template("push-day", "Push Day", "push", "strength", 46, "Moderate", ["Chest", "Shoulders", "Triceps"], "A straightforward pressing day that adapts cleanly to your setup.", [
    slot("primary-press", "Primary press", "horizontal_push_primary", 4, "6-10"),
    slot("secondary-press", "Secondary press", "horizontal_push_secondary", 3, "8-12"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-12"),
    slot("delts", "Shoulder support", "shoulder_isolation", 3, "12-15"),
    slot("triceps", "Triceps finisher", "triceps", 3, "10-15")
  ]),
  template("pull-day", "Pull Day", "pull", "strength", 46, "Moderate", ["Back", "Shoulders", "Biceps"], "Rows and pulls built to fit the equipment you actually have today.", [
    slot("vertical-pull", "Primary pull", "vertical_pull", 4, "8-10"),
    slot("horizontal-pull", "Secondary pull", "horizontal_pull", 3, "8-12"),
    slot("rear-delt", "Rear delt / posture", "rear_delt", 3, "12-15"),
    slot("biceps", "Biceps support", "biceps", 3, "10-15")
  ]),
  template("legs-day", "Leg Day: balanced lower", "legs", "strength", 50, "High", ["Legs", "Hamstrings", "Glutes"], "A balanced lower-body session with squat, hinge, and single-leg work kept in a clean order.", [
    slot("squat", "Primary squat", "squat", 4, "6-10"),
    slot("hinge", "Hinge pattern", "hinge", 3, "8-12"),
    slot("lunge", "Single-leg work", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15"),
    slot("calf", "Calf support", "calf", 3, "12-20")
  ]),
  template("chest-triceps", "Chest + Triceps", "chest_triceps", "strength", 44, "Moderate", ["Chest", "Triceps"], "A chest-forward session with clean triceps support instead of random extra volume.", [
    slot("primary-press", "Chest press", "horizontal_push_primary", 4, "6-8"),
    slot("secondary-press", "Secondary chest", "horizontal_push_secondary", 3, "8-12"),
    slot("delts", "Shoulder support", "shoulder_isolation", 2, "12-15"),
    slot("triceps-a", "Triceps", "triceps", 3, "10-12"),
    slot("triceps-b", "Triceps burn", "triceps", 2, "12-15")
  ]),
  template("back-biceps", "Back + Biceps", "back_biceps", "strength", 44, "Moderate", ["Back", "Biceps"], "A back-heavy session that still leaves room for direct biceps work.", [
    slot("vertical-pull", "Lat pattern", "vertical_pull", 4, "8-10"),
    slot("horizontal-pull", "Row pattern", "horizontal_pull", 3, "8-12"),
    slot("rear-delt", "Upper-back support", "rear_delt", 3, "12-15"),
    slot("biceps-a", "Main curl", "biceps", 3, "10-12"),
    slot("biceps-b", "Secondary curl", "biceps", 2, "12-15")
  ]),
  template("shoulders-day", "Shoulders", "shoulders", "strength", 40, "Moderate", ["Shoulders", "Upper back"], "A shoulder-focused session that still protects posture and pressing quality.", [
    slot("vertical-press", "Primary press", "vertical_push", 4, "6-10"),
    slot("delts-a", "Lateral work", "shoulder_isolation", 3, "12-15"),
    slot("rear-delt", "Rear delt support", "rear_delt", 3, "12-15"),
    slot("horizontal-push", "Pressing support", "horizontal_push_secondary", 2, "10-12")
  ]),
  template("upper-body", "Upper Body: balanced push-pull", "upper_body", "strength", 48, "Moderate", ["Chest", "Back", "Shoulders", "Arms"], "A balanced upper session when you want one complete hit instead of a narrow split.", [
    slot("horizontal-push", "Press", "horizontal_push_primary", 3, "6-10"),
    slot("horizontal-pull", "Row", "horizontal_pull", 3, "8-12"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-12"),
    slot("vertical-pull", "Pull", "vertical_pull", 3, "8-12"),
    slot("arms", "Arms", "biceps", 2, "10-15")
  ]),
  template("lower-body", "Lower Body: clean strength base", "lower_body", "strength", 48, "Moderate", ["Legs", "Hamstrings", "Glutes"], "A clean lower-body strength base with enough structure to feel serious without getting bloated.", [
    slot("squat", "Squat", "squat", 4, "6-10"),
    slot("hinge", "Hinge", "hinge", 3, "8-12"),
    slot("lunge", "Single-leg", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15")
  ]),
  template("full-body", "Full Body: balanced training day", "full_body", "strength", 52, "Moderate", ["Full body"], "A complete full-body session with enough work to cover push, pull, lower body, and one useful support block.", [
    slot("full-push", "Primary push", "full_body_push", 3, "8-10"),
    slot("full-pull", "Primary pull", "full_body_pull", 3, "8-10"),
    slot("full-leg", "Lower-body anchor", "full_body_leg", 3, "8-10"),
    slot("secondary-press", "Upper-body support", "horizontal_push_secondary", 2, "10-12"),
    slot("glute", "Lower-body support", "glute", 2, "10-12"),
    slot("finish", "Core or carry finish", "full_body_finish", 2, null, "25-30 sec")
  ]),
  template("mobility-recovery", "Mobility / Recovery Day", "mobility_recovery", "mobility", 24, "Low", ["Mobility", "Recovery"], "Use this when recovery, stiffness, or joint confidence needs to lead the day.", [
    slot("mobility-a", "Warm-in", "mobility_flow", 2, "5 each side"),
    slot("mobility-b", "Main flow", "mobility_flow", 2, "6 each side"),
    slot("mobility-c", "Cooldown", "mobility_flow", 2, "5 each side")
  ]),
  template("push-volume", "Push Volume Builder", "push", "strength", 52, "Moderate", ["Chest", "Shoulders", "Triceps"], "A slightly fuller pressing session when you want more chest and shoulder volume without losing structure.", [
    slot("primary-press", "Heavy press", "horizontal_push_primary", 4, "6-8"),
    slot("secondary-press", "Secondary chest", "horizontal_push_secondary", 3, "8-12"),
    slot("vertical-press", "Overhead press", "vertical_push", 3, "8-10"),
    slot("delts-a", "Lateral delts", "shoulder_isolation", 3, "12-15"),
    slot("triceps-a", "Triceps press", "triceps", 3, "10-12"),
    slot("triceps-b", "Triceps burn", "triceps", 2, "12-15")
  ]),
  template("pull-density", "Pull Density Day", "pull", "strength", 50, "Moderate", ["Back", "Rear delts", "Biceps"], "A denser pull session with more back volume and enough arm work to feel complete.", [
    slot("vertical-pull", "Primary pull", "vertical_pull", 4, "6-10"),
    slot("horizontal-pull", "Main row", "horizontal_pull", 4, "8-12"),
    slot("rear-delt", "Upper-back support", "rear_delt", 3, "12-15"),
    slot("biceps-a", "Main curl", "biceps", 3, "10-12"),
    slot("biceps-b", "Secondary curl", "biceps", 2, "12-15")
  ]),
  template("leg-builder", "Leg Builder: squat + hinge focus", "legs", "strength", 54, "High", ["Quads", "Hamstrings", "Glutes"], "A more standard lifting-style lower day with heavier squat and hinge emphasis.", [
    slot("squat", "Primary squat", "squat", 4, "5-8"),
    slot("hinge", "Posterior-chain hinge", "hinge", 4, "6-10"),
    slot("lunge", "Single-leg work", "lunge", 3, "8-10 each side"),
    slot("glute", "Glute drive", "glute", 3, "10-15"),
    slot("calf", "Calf support", "calf", 3, "12-20")
  ]),
  template("upper-strength-balance", "Upper Strength Balance: main lifts first", "upper_body", "strength", 52, "Moderate", ["Chest", "Back", "Shoulders", "Arms"], "A standard upper-body layout with pressing and pulling anchored by the main lifts first.", [
    slot("horizontal-push", "Primary press", "horizontal_push_primary", 4, "6-8"),
    slot("horizontal-pull", "Primary row", "horizontal_pull", 4, "8-10"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-10"),
    slot("vertical-pull", "Vertical pull", "vertical_pull", 3, "8-12"),
    slot("arms-a", "Arm finisher", "biceps", 2, "10-15"),
    slot("arms-b", "Triceps support", "triceps", 2, "10-15")
  ]),
  template("lower-strength-balance", "Lower Strength Balance: squat + single-leg", "lower_body", "strength", 50, "Moderate", ["Quads", "Glutes", "Hamstrings"], "A lower-body session with clearer squat and single-leg emphasis so it does not feel like the same leg day twice.", [
    slot("squat", "Main squat", "squat", 4, "6-8"),
    slot("hinge", "Main hinge", "hinge", 3, "8-10"),
    slot("lunge", "Single-leg slot", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15"),
    slot("calf", "Calves", "calf", 2, "15-20")
  ]),
  template("full-body-density", "Full Body Density: fast pace", "full_body", "strength", 36, "High", ["Full body"], "A shorter, denser full-body session that moves faster and leans harder on pace than volume.", [
    slot("full-push", "Push opener", "full_body_push", 3, "10-12"),
    slot("full-leg", "Leg drive", "full_body_leg", 3, "10-12"),
    slot("full-pull", "Pull reset", "full_body_pull", 3, "10-12"),
    slot("conditioning", "Density closer", "conditioning", 3, null, "30-40 sec"),
    slot("finish", "Core reset", "full_body_finish", 2, null, "20-30 sec"),
    slot("mobility-a", "Quick reset", "mobility_flow", 2, "4 each side")
  ]),
  template("recovery-reset", "Recovery Reset", "mobility_recovery", "mobility", 28, "Low", ["Mobility", "Recovery"], "A support day built for stiffness, stress, or lower readiness without losing the training rhythm.", [
    slot("mobility-a", "Reset flow", "mobility_flow", 2, "5 each side"),
    slot("mobility-b", "Main mobility work", "mobility_flow", 3, "5-6 each side"),
    slot("conditioning", "Easy conditioning", "conditioning", 2, null, "20-30 sec")
  ])
];

const FOCUS_ALIAS_MAP = {
  recommended: [],
  push: ["push"],
  pull: ["pull"],
  legs: ["legs", "lower_body"],
  chest: ["chest_triceps", "push"],
  back: ["back_biceps", "pull"],
  shoulders: ["shoulders", "push"],
  glutes: ["legs", "lower_body"],
  arms: ["back_biceps", "chest_triceps"],
  biceps: ["back_biceps", "pull"],
  triceps: ["chest_triceps", "push"],
  forearms: ["pull", "back_biceps"],
  calves: ["legs", "lower_body"],
  core_abs: ["full_body", "mobility_recovery"],
  chest_triceps: ["chest_triceps"],
  back_biceps: ["back_biceps"],
  upper_body: ["upper_body", "push", "pull"],
  lower_body: ["lower_body", "legs"],
  full_body: ["full_body"],
  mobility_recovery: ["mobility_recovery"]
};

export function getWorkoutLibraryForProfile(filters = {}, profile = {}, recentWorkouts = [], accessTier = ACCESS_TIERS.PREMIUM) {
  const normalizedFilters = normalizeFilters(filters, profile);
  const historyContext = buildRecentWorkoutContext(recentWorkouts);
  const suggestedFocuses = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: normalizedFilters.lowRecovery
  });
  const normalizedAccessTier = normalizeAccessTier(accessTier);
  const focusPool = normalizedFilters.focus === "recommended"
    ? suggestedFocuses
    : normalizedFilters.focus === "all"
      ? WORKOUT_FOCUS_OPTIONS.map((option) => option.value)
      : [normalizedFilters.focus];
  const templateFocusPool = normalizedFilters.focus === "all"
    ? Array.from(new Set(WORKOUT_TEMPLATES.map((entry) => entry.focus)))
    : Array.from(new Set(focusPool.flatMap((focusId) => FOCUS_ALIAS_MAP[focusId] || [focusId])));

  const workouts = WORKOUT_TEMPLATES.filter((templateEntry) => templateFocusPool.includes(templateEntry.focus))
    .map((templateEntry) => buildWorkoutFromTemplate(templateEntry, normalizedFilters, profile, historyContext))
    .filter(Boolean)
    .map((workout) => applyWorkoutAccess(workout, normalizedAccessTier, suggestedFocuses))
    .sort((left, right) => right.recommendationScore - left.recommendationScore);

  return dedupeSurfacedWorkouts(workouts, normalizedFilters.focus);
}

export function getWorkoutLibraryMeta(filters = {}, profile = {}, workouts = null, recentWorkouts = [], accessTier = ACCESS_TIERS.PREMIUM) {
  const normalizedFilters = normalizeFilters(filters, profile);
  const historyContext = buildRecentWorkoutContext(recentWorkouts);
  const suggestedFocuses = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: normalizedFilters.lowRecovery
  });
  const visibleWorkouts = workouts || getWorkoutLibraryForProfile(normalizedFilters, profile, recentWorkouts, accessTier);
  const topWorkout = visibleWorkouts[0] || null;
  const normalizedAccessTier = normalizeAccessTier(accessTier);
  const accessProfile = getFreeWorkoutAccessProfile(suggestedFocuses);
  const selectedFocusMeta =
    normalizedFilters.focus === "recommended"
      ? WORKOUT_FOCUS_OPTIONS.find((option) => option.value === suggestedFocuses[0]) || null
      : WORKOUT_FOCUS_OPTIONS.find((option) => option.value === normalizedFilters.focus) || null;

    return {
      environment: normalizedFilters.environment,
      equipmentProfile: normalizedFilters.equipmentProfile,
      equipmentSelections: normalizedFilters.equipmentSelections,
      focus: normalizedFilters.focus,
      categoryOptions: WORKOUT_DISCOVERY_CATEGORIES,
      sortOptions: WORKOUT_SORT_OPTIONS,
      focusOptions: WORKOUT_FOCUS_OPTIONS.map((option) => ({
        ...option,
        recommended: suggestedFocuses.includes(option.value),
        locked: !hasFullWorkoutAccess(normalizedAccessTier) && !isWorkoutFocusUsable(normalizedAccessTier, option.value, suggestedFocuses)
      })),
    equipmentOptions: getEquipmentSelectionOptionsForEnvironment(normalizedFilters.environment),
    suggestedFocuses,
    accessProfile,
    fullLibraryAccess: hasFullWorkoutAccess(normalizedAccessTier),
    lockedLibraryMessage: hasFullWorkoutAccess(normalizedAccessTier)
      ? ""
      : "Free keeps a small working preview open. Trial + Premium unlock the full workout system, swaps, and session depth.",
    recommendationTitle: topWorkout
      ? normalizedFilters.manualFocus
        ? `You selected ${selectedFocusMeta?.label || topWorkout.focusLabel}. ${topWorkout.name} is the clearest fit.`
        : `${topWorkout.focusLabel} is the cleanest match today.`
      : "Pick the split that fits today.",
      recommendationReason: buildRecommendationReason(profile, normalizedFilters, historyContext, selectedFocusMeta),
      continuityReason: buildContinuityReason(topWorkout, historyContext),
      suggestedPairings: buildSuggestedPairings(profile, normalizedFilters, selectedFocusMeta),
      topWorkoutId: topWorkout?.id || null,
      exerciseLibraryPreview: buildExerciseLibraryPreview(normalizedFilters)
    };
  }

export function findWorkoutPresetForProfile(presetId, profile = {}, filters = {}) {
  const templateEntry = WORKOUT_TEMPLATES.find((entry) => entry.id === presetId);
  if (!templateEntry) {
    return null;
  }

  return buildWorkoutFromTemplate(templateEntry, normalizeFilters(filters, profile), profile, buildRecentWorkoutContext([]));
}

export function findWorkoutPreset(presetId) {
  return findWorkoutPresetForProfile(presetId, {}, {});
}

export function createWorkoutFromPreset(preset, exercisesOverride = null) {
  const exercises = Array.isArray(exercisesOverride) && exercisesOverride.length
    ? exercisesOverride.map((exerciseEntry) => stripExerciseForLogging(exerciseEntry))
    : preset.exercises.map((exerciseEntry) => stripExerciseForLogging(exerciseEntry));

  return {
    id: crypto.randomUUID(),
    presetId: preset.id,
    name: preset.name,
    type: preset.type,
    environment: preset.environment,
    duration: preset.duration,
    intensity: preset.intensity,
    focus: preset.focus,
    exercises,
    loggedAt: new Date().toISOString()
  };
}

function normalizeFilters(filters, profile) {
  const environment = normalizeEnvironment(filters.environment || profile.trainingEnvironment || "hybrid");
  const equipmentSelections = normalizeEquipmentSelections(
    filters.equipmentSelections || getEquipmentSelectionsForProfile(profile),
    environment === "both" ? profile.trainingEnvironment || "hybrid" : environment
  );
  const equipmentProfile = buildEquipmentProfileFromSelections(
    equipmentSelections,
    environment === "both" ? profile.trainingEnvironment || "hybrid" : environment
  ) || normalizeEquipmentProfile(filters.equipmentProfile || profile.equipmentProfile, environment === "both" ? profile.trainingEnvironment : environment);
  const focus = WORKOUT_FOCUS_OPTIONS.some((option) => option.value === filters.focus) || ["all", "recommended"].includes(filters.focus)
    ? filters.focus || "recommended"
    : "recommended";

  return {
    environment,
    equipmentProfile,
    equipmentSelections,
    focus,
    manualFocus: Boolean(filters.focus && filters.focus !== "recommended"),
    lowRecovery: Boolean(filters.lowRecovery)
  };
}

function buildWorkoutFromTemplate(templateEntry, filters, profile, historyContext) {
  if (filters.environment !== "both" && templateEntry.focus === "mobility_recovery" && filters.environment === "gym") {
    return null;
  }

  const environment = resolveWorkoutEnvironment(filters.environment, filters.equipmentProfile);
  const exercises = templateEntry.slots
    .map((slotEntry) =>
      buildExerciseForSlot(slotEntry, {
        environment,
        equipmentProfile: filters.equipmentProfile,
        equipmentSelections: filters.equipmentSelections,
        profile,
        historyContext
      })
    )
    .filter(Boolean);

  if (!exercises.length) {
    return null;
  }

  return {
    id: templateEntry.id,
    name: `${templateEntry.name}${filters.equipmentProfile === "full_gym" ? "" : ` (${formatEquipmentProfile(filters.equipmentProfile)})`}`,
    focus: templateEntry.focus,
    focusLabel: formatWorkoutFocus(templateEntry.focus),
    type: templateEntry.type,
    environment,
    equipmentProfile: filters.equipmentProfile,
    equipmentSelections: filters.equipmentSelections,
    equipmentSummary: formatEquipmentSelections(filters.equipmentSelections),
    duration: templateEntry.duration,
    intensity: templateEntry.intensity,
    summary: templateEntry.summary,
    primaryMuscles: templateEntry.primaryMuscles,
    sessionFlow: buildSessionFlow(templateEntry),
      startPrompt: buildStartPrompt(templateEntry, filters),
      continuityNote: buildWorkoutContinuityNote(templateEntry, historyContext),
      varietyNote: buildWorkoutVarietyNote(exercises, historyContext),
      lastTrainedLabel: formatLastTrainedLabel(templateEntry.focus, historyContext),
      difficultyTag: deriveWorkoutDifficulty(templateEntry),
      jointStressProfile: deriveWorkoutJointStress(exercises),
      trainingStyleTags: deriveWorkoutTrainingStyles(templateEntry, filters, exercises),
      categoryTags: deriveWorkoutCategoryTags(templateEntry, filters, exercises, profile),
      recommendationScore: scoreTemplate(templateEntry, profile, filters, historyContext),
      warmupBlock: profile.showWarmup === false ? [] : buildWarmupBlock(templateEntry, profile),
      cooldownBlock: profile.showCooldown === false ? [] : buildCooldownBlock(templateEntry, profile),
      exercises
  };
}

function applyWorkoutAccess(workout, accessTier, suggestedFocuses) {
  if (hasFullWorkoutAccess(accessTier)) {
    return {
      ...workout,
      lockedForAccess: false,
      previewOnly: false,
      lockedExerciseCount: 0
    };
  }

  const focusUsable = isWorkoutFocusUsable(accessTier, workout.focus, suggestedFocuses);
  if (!focusUsable) {
    return {
      ...workout,
      lockedForAccess: true,
      previewOnly: true,
      lockedReason: "Locked on Free. Trial + Premium unlock this split.",
      exercises: [],
      lockedExerciseCount: workout.exercises.length
    };
  }

  const visibleExercises = workout.exercises.slice(0, FREE_EXERCISES_PER_WORKOUT_LIMIT);
  return {
    ...workout,
    lockedForAccess: false,
    previewOnly: workout.exercises.length > visibleExercises.length,
    lockedExerciseCount: Math.max(workout.exercises.length - visibleExercises.length, 0),
    lockedReason:
      workout.exercises.length > visibleExercises.length
        ? "Free preview only. Trial + Premium unlock the full session."
        : "",
    exercises: visibleExercises
  };
}

function buildExerciseForSlot(slotEntry, { environment, equipmentProfile, equipmentSelections, profile, historyContext }) {
  const options = EXERCISE_VARIANTS.filter((variantEntry) => {
    if (variantEntry.pool !== slotEntry.pool) {
      return false;
    }
    if (!matchesEquipmentSetup(variantEntry, equipmentProfile, equipmentSelections)) {
      return false;
    }
    if (!variantEntry.environments.includes(environment) && !variantEntry.environments.includes("hybrid")) {
      return false;
    }
    return true;
  });

  const rankedOptions = [...options].sort((left, right) =>
    rankVariantOption(right, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) -
    rankVariantOption(left, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry })
  );
  const fallbackOptions = rankedOptions.length
    ? rankedOptions
    : EXERCISE_VARIANTS
        .filter((variantEntry) => variantEntry.pool === slotEntry.pool)
        .sort((left, right) =>
          rankVariantOption(right, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) -
          rankVariantOption(left, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry })
        );

  const primaryOption = fallbackOptions[0];
  if (!primaryOption) {
    return null;
  }

  const swapOptions = fallbackOptions
    .slice(1)
    .map((option) => attachExerciseMetadata(option, slotEntry, profile, historyContext))
    .filter(Boolean)
    .slice(0, 10);

  return {
    ...attachExerciseMetadata(primaryOption, slotEntry, profile, historyContext),
    availableSwapCount: Math.max(fallbackOptions.length - 1, 0),
    swapOptions
  };
}

function attachExerciseMetadata(option, slotEntry, profile, historyContext) {
  const movement = findMovementForName(option.name);
  const adaptedMovement = movement ? adaptMovementForProfile(movement.id, profile) : null;
  const displayMovement = adaptedMovement || movement;
  const displayName = displayMovement?.name || option.name;
  const equipment = displayMovement?.equipment?.[0] || option.equipment;
  const muscleGroup = displayMovement?.primaryMuscles?.[0] || option.muscleGroup;
  const lastLoad = historyContext?.latestLoads?.get(displayName.toLowerCase()) || null;
  const familyOptionCount = EXERCISE_VARIANTS.filter(
    (variantEntry) =>
      variantEntry.pool === option.pool &&
      variantEntry.id !== option.id &&
      variantEntry.familyIds?.some((familyId) => option.familyIds?.includes(familyId))
  ).length;
  const movementGuide = buildMovementGuide(option, displayMovement);

  return {
    name: displayName,
    sets: slotEntry.sets,
    reps: slotEntry.reps,
    duration: slotEntry.duration,
    equipment,
    muscleGroup,
    movementPattern: option.movementPattern,
    slotId: slotEntry.slotId,
    slotLabel: slotEntry.label,
    lastLoad,
    tags: option.tags,
    media: option.media,
    familyIds: option.familyIds || [],
    familyOptionCount,
    movementId: displayMovement?.id || movement?.id || null,
    movement: movementGuide
  };
}

function scoreTemplate(templateEntry, profile, filters, historyContext) {
  let score = 0;

  if (getSuggestedWorkoutFocuses({ goalType: profile.goalType, injuryStatus: profile.injuryStatus, lowRecovery: filters.lowRecovery }).includes(templateEntry.focus)) {
    score += 6;
  }

  if (filters.focus !== "all" && filters.focus !== "recommended" && filters.focus === templateEntry.focus) {
    score += 10;
  }

  if (profile.goalType === "bodybuilding" && ["chest_triceps", "back_biceps", "shoulders", "legs"].includes(templateEntry.focus)) {
    score += 4;
  }

  if (profile.goalType === "strength" && ["upper_body", "lower_body", "legs", "push", "pull"].includes(templateEntry.focus)) {
    score += 4;
  }

  if (profile.injuryStatus !== "none" && templateEntry.focus === "mobility_recovery") {
    score += 8;
  }

  if (filters.lowRecovery && templateEntry.focus === "mobility_recovery") {
    score += 8;
  }

  if (filters.lowRecovery && templateEntry.focus === "full_body") {
    score += 2;
  }

  if (historyContext.templateUsage.get(templateEntry.id)) {
    const recentTemplateUsage = historyContext.templateUsage.get(templateEntry.id);
    score -= recentTemplateUsage >= 2 ? 8 : 4;
  }

  if (historyContext.recentFocuses[0] === templateEntry.focus) {
    score -= templateEntry.focus === "mobility_recovery" ? 1 : 5;
  }

  const lastFocusDays = historyContext.focusLastTrainedDays.get(templateEntry.focus);
  if (typeof lastFocusDays === "number") {
    if (lastFocusDays >= 4) {
      score += 5;
    } else if (lastFocusDays <= 1 && templateEntry.focus !== "mobility_recovery") {
      score -= 4;
    }
  } else {
    score += 4;
  }

  return score;
}

function rankVariantOption(option, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) {
  let score = 0;

  if (option.equipmentProfiles.includes(equipmentProfile)) {
    score += 5;
  }
  if (matchesEquipmentSelection(option.equipment, equipmentSelections)) {
    score += 5;
  }
  if (option.environments.includes(environment)) {
    score += 4;
  } else if (option.environments.includes("hybrid")) {
    score += 2;
  }
  if (profile.goalType === "bodybuilding" && ["machine", "dumbbell"].includes(option.equipment)) {
    score += 2;
  }
  if (profile.goalType === "strength" && ["barbell", "machine"].includes(option.equipment)) {
    score += 2;
  }
  if (profile.injuryStatus !== "none" && ["bodyweight", "bands", "dumbbell"].includes(option.equipment)) {
    score += 2;
  }
  const usageCount = historyContext.exerciseUsage.get(option.name.toLowerCase()) || 0;
  if (usageCount >= 2) {
    score -= 5;
  } else if (usageCount === 1) {
    score -= 2;
  }

  const recentPoolUse = historyContext.poolUsage.get(slotEntry.pool) || 0;
  if (recentPoolUse >= 3 && usageCount === 0) {
    score += 2;
  }

  return score;
}

function buildRecommendationReason(profile, filters, historyContext, selectedFocusMeta = null) {
  const recommendedFocus = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: filters.lowRecovery
  })[0];
  const focusLabel = filters.manualFocus ? selectedFocusMeta?.label || formatWorkoutFocus(filters.focus) : formatWorkoutFocus(recommendedFocus);

  if (profile.injuryStatus !== "none") {
    return filters.manualFocus
      ? `You selected ${focusLabel}, so the engine is keeping that intent while still protecting your movement guardrails and equipment fit.`
      : `${focusLabel} is leading because your current setup needs cleaner movement choices and easier recovery decisions.`;
  }

  if (filters.lowRecovery) {
    return filters.manualFocus
      ? `You selected ${focusLabel}, and the engine is keeping it realistic for a lower-recovery day instead of forcing a heavier session.`
      : `${focusLabel} is leading because recovery is softer, so the best session today should still move the week forward without forcing extra load.`;
  }

  if (filters.manualFocus) {
    return `You picked ${focusLabel}, so today’s options stay matched to your ${filters.environment} setup, ${formatEquipmentSelections(filters.equipmentSelections).toLowerCase()} setup, and recent training history.`;
  }

  if (historyContext.recentFocuses[0] === recommendedFocus) {
    return `${focusLabel} still fits best today, with enough movement changes to keep the session from feeling recycled.`;
  }

  return `${focusLabel} is the best fit today because it lines up with your ${profile.goalType.replace("_", " ")} goal, your ${filters.environment} training setup, and the equipment you actually have available.`;
}

function buildSuggestedPairings(profile, filters, selectedFocusMeta = null) {
  if (filters.manualFocus && selectedFocusMeta) {
    const map = {
      chest: ["Chest + triceps", "Push", "Upper body"],
      back: ["Back + biceps", "Pull", "Upper body"],
      shoulders: ["Shoulders", "Push", "Upper body"],
      legs: ["Legs", "Lower body", "Glutes"],
      glutes: ["Glutes", "Legs", "Lower body"],
      arms: ["Back + biceps", "Chest + triceps", "Upper body"],
      biceps: ["Back + biceps", "Pull", "Upper body"],
      triceps: ["Chest + triceps", "Push", "Upper body"],
      forearms: ["Pull", "Back + biceps", "Upper body"],
      calves: ["Legs", "Lower body", "Glutes"],
      core_abs: ["Full body", "Mobility / recovery day", "Lower body"],
      push: ["Chest + triceps", "Shoulders", "Upper body"],
      pull: ["Back + biceps", "Upper body", "Forearms"],
      chest_triceps: ["Push", "Chest", "Shoulders"],
      back_biceps: ["Pull", "Back", "Biceps"],
      upper_body: ["Push", "Pull", "Chest + triceps"],
      lower_body: ["Legs", "Glutes", "Calves"],
      full_body: ["Upper body", "Lower body", "Mobility / recovery day"],
      mobility_recovery: ["Mobility / recovery day", "Core / abs", "Full body"]
    };
    return map[selectedFocusMeta.value] || [selectedFocusMeta.label];
  }

  if (profile.goalType === "bodybuilding") {
    return ["Chest + triceps", "Back + biceps", "Shoulders", "Legs"];
  }
  if (profile.goalType === "strength") {
    return ["Upper body", "Lower body", "Push", "Pull", "Legs"];
  }
  if (profile.goalType === "fat_loss") {
    return ["Full body", "Upper body", "Lower body", "Mobility / recovery day"];
  }
  if (filters.lowRecovery || profile.injuryStatus !== "none") {
    return ["Mobility / recovery day", "Full body", "Upper body"];
  }

  return ["Upper body", "Lower body", "Full body", "Push", "Pull"];
}

function dedupeSurfacedWorkouts(workouts, selectedFocus) {
  const seen = new Set();
  return workouts.filter((workout) => {
    const family = `${workout.focus}:${workout.primaryMuscles[0] || "general"}`;
    if (selectedFocus !== "recommended" && selectedFocus !== "all") {
      return true;
    }
    if (seen.has(family)) {
      return false;
    }
    seen.add(family);
    return true;
  });
}

function buildSessionFlow(templateEntry) {
  if (templateEntry.focus === "mobility_recovery") {
    return [
      { title: "Warm in", detail: "Use the first movement to open up the tightest area before pushing range." },
      { title: "Main mobility work", detail: "Spend the bulk of the session on the biggest restriction or support need." },
      { title: "Cooldown", detail: "Finish with easy breathing or low-stress movement so the session actually helps recovery." }
    ];
  }

  return [
    { title: "Warm-up", detail: "Take 5-8 minutes to raise temperature and rehearse the first lift with lighter reps." },
    { title: "Main work", detail: "Do the anchor lifts first while your focus and technique are freshest." },
    { title: "Support work", detail: "Finish with support work that rounds out the session without losing the split." }
  ];
}

function buildStartPrompt(templateEntry, filters) {
  if (templateEntry.focus === "mobility_recovery") {
    return `Start this as a lower-stress ${filters.environment === "gym" ? "gym" : "home"} reset. Smooth reps and breathing matter more than intensity.`;
  }

  return `Start with the first block, stay in order, and let the session build from your main lift into the support work.`;
}

function buildRecentWorkoutContext(recentWorkouts = []) {
  const workouts = [...(recentWorkouts || [])]
    .filter(Boolean)
    .sort((left, right) => new Date(right.loggedAt || 0).getTime() - new Date(left.loggedAt || 0).getTime())
    .slice(0, 8);

  const templateUsage = new Map();
  const exerciseUsage = new Map();
  const poolUsage = new Map();
  const focusLastTrainedDays = new Map();
  const latestLoads = new Map();

  workouts.forEach((workout, index) => {
    if (workout.presetId) {
      templateUsage.set(workout.presetId, (templateUsage.get(workout.presetId) || 0) + 1);
    }
    if (workout.focus && !focusLastTrainedDays.has(workout.focus)) {
      focusLastTrainedDays.set(workout.focus, getDaysSince(workout.loggedAt));
    }

    (workout.exercises || []).forEach((exercise) => {
      if (exercise?.name) {
        const key = exercise.name.toLowerCase();
        exerciseUsage.set(key, (exerciseUsage.get(key) || 0) + 1);
        if (!latestLoads.has(key) && exercise.weight !== undefined && exercise.weight !== null && exercise.weight !== "") {
          latestLoads.set(key, {
            weight: exercise.weight,
            repsCompleted: exercise.repsCompleted || null,
            loggedAt: workout.loggedAt || null
          });
        }
      }
      const pool = inferPoolFromExercise(exercise);
      if (pool) {
        poolUsage.set(pool, (poolUsage.get(pool) || 0) + 1);
      }
    });
  });

  return {
    workouts,
    recentFocuses: workouts.map((workout) => workout.focus).filter(Boolean),
    templateUsage,
    exerciseUsage,
    poolUsage,
    focusLastTrainedDays,
    latestLoads
  };
}

function buildContinuityReason(topWorkout, historyContext) {
  if (!topWorkout) {
    return "Pick the session that fits today, then let the rest of the week build around it.";
  }

  if (topWorkout.lastTrainedLabel) {
    return `${topWorkout.lastTrainedLabel} ${topWorkout.varietyNote || ""}`.trim();
  }

  if (historyContext.workouts.length) {
    return topWorkout.varietyNote || "You keep the same training goal while rotating enough of the movement mix to stay fresh.";
  }

  return "Log a few real sessions and your next recommendations will start feeling noticeably smarter.";
}

function buildWorkoutContinuityNote(templateEntry, historyContext) {
  const lastTrainedLabel = formatLastTrainedLabel(templateEntry.focus, historyContext);
  if (!lastTrainedLabel) {
    return "This split is ready to be the anchor session for today because it has not shown up recently.";
  }
  return lastTrainedLabel;
}

function buildWorkoutVarietyNote(exercises, historyContext) {
  const repeatedMovements = exercises.filter((exercise) => (historyContext.exerciseUsage.get(exercise.name.toLowerCase()) || 0) > 0).length;
  if (!historyContext.workouts.length) {
    return "The engine will start rotating more aggressively once it has a little workout history to learn from.";
  }
  if (repeatedMovements === 0) {
    return "This session keeps the same goal but rotates in a fresh movement mix.";
  }
  if (repeatedMovements <= 2) {
    return "This session keeps the split familiar while changing enough of the exercise mix to stay fresh.";
  }
  return "This session stays close to the same training intent, but swap options are there if you want more variety.";
}

function formatLastTrainedLabel(focus, historyContext) {
  const days = historyContext.focusLastTrainedDays.get(focus);
  if (typeof days !== "number") {
    return "";
  }
  if (days === 0) {
    return `Last trained: ${formatWorkoutFocus(focus)} today.`;
  }
  if (days === 1) {
    return `Last trained: ${formatWorkoutFocus(focus)} yesterday.`;
  }
  return `Last trained: ${formatWorkoutFocus(focus)} ${days} days ago.`;
}

function getDaysSince(dateValue) {
  const parsed = new Date(dateValue || 0);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)));
}

function inferPoolFromExercise(exercise) {
  const matched = EXERCISE_VARIANTS.find((variantEntry) => variantEntry.name.toLowerCase() === String(exercise?.name || "").toLowerCase());
  return matched?.pool || null;
}

function resolveWorkoutEnvironment(environment, equipmentProfile) {
  if (environment === "both") {
    return equipmentProfile === "full_gym" ? "gym" : "home";
  }

  return environment;
}

function normalizeEnvironment(value) {
  if (["gym", "home", "both", "hybrid"].includes(value)) {
    return value === "hybrid" ? "both" : value;
  }
  return "both";
}

function formatEquipmentProfile(value) {
  return EQUIPMENT_PROFILE_OPTIONS.find((option) => option.value === value)?.label || "Current setup";
}

function stripExerciseForLogging(exerciseEntry) {
  return {
    name: exerciseEntry.name,
    sets: exerciseEntry.sets,
    reps: exerciseEntry.reps || null,
    duration: exerciseEntry.duration || null,
    equipment: exerciseEntry.equipment,
    muscleGroup: exerciseEntry.muscleGroup,
    weight: exerciseEntry.weight ?? null,
    repsCompleted: exerciseEntry.repsCompleted || null,
    notes: exerciseEntry.notes || ""
  };
}

function buildWarmupBlock(templateEntry, profile) {
  if (templateEntry.focus === "mobility_recovery") {
    return [];
  }

  return [
    {
      name: profile.trainingEnvironment === "gym" ? "5-minute ramp-up" : "3-minute body prep",
      detail:
        profile.trainingEnvironment === "gym"
          ? "Use 2 easy sets on the first lift plus one mobility drill for the tightest area."
          : "Use one mobility drill and one lighter rehearsal set before the main work."
    }
  ];
}

function buildCooldownBlock(templateEntry, profile) {
  return [
    {
      name: templateEntry.focus === "mobility_recovery" ? "Easy breathing reset" : "Short cooldown / stretch",
      detail:
        profile.injuryStatus !== "none"
          ? "Finish with one gentle stretch or breathing reset for the area that needs the most support."
          : "Take 2-4 minutes to bring breathing down and loosen the area that worked hardest."
    }
  ];
}

function matchesEquipmentSetup(option, equipmentProfile, equipmentSelections = []) {
  return option.equipmentProfiles.includes(equipmentProfile) || matchesEquipmentSelection(option.equipment, equipmentSelections);
}

function matchesEquipmentSelection(optionEquipment, equipmentSelections = []) {
  const selectionSet = new Set(equipmentSelections || []);
  if (!selectionSet.size) {
    return true;
  }

  const map = {
    dumbbell: ["dumbbells", "kettlebells"],
    bodyweight: ["bodyweight", "pull_up_bar"],
    bands: ["bands"],
    barbell: ["barbell"],
    machine: ["machines"],
    kettlebell: ["kettlebells"]
  };

  return (map[optionEquipment] || [optionEquipment]).some((entry) => selectionSet.has(entry));
}

function deriveWorkoutDifficulty(templateEntry) {
  if (templateEntry.intensity === "High" || templateEntry.slots.length >= 6) {
    return "Advanced";
  }
  if (templateEntry.duration >= 46) {
    return "Intermediate";
  }
  return "Beginner";
}

function deriveWorkoutJointStress(exercises) {
  if ((exercises || []).some((exercise) => exercise.tags?.jointStressLevel === "high")) {
    return "high";
  }
  if ((exercises || []).every((exercise) => exercise.tags?.jointStressLevel === "low")) {
    return "low";
  }
  return "moderate";
}

function deriveWorkoutTrainingStyles(templateEntry, filters, exercises) {
  const styles = new Set();
  styles.add(templateEntry.type === "mobility" ? "Recovery" : "Strength");
  if (templateEntry.focus === "full_body" && templateEntry.intensity === "High") {
    styles.add("Conditioning");
  }
  if ((exercises || []).some((exercise) => exercise.equipment === "bodyweight")) {
    styles.add("Bodyweight");
  }
  if ((exercises || []).some((exercise) => exercise.equipment === "dumbbell")) {
    styles.add("Dumbbell");
  }
  if (filters.environment === "home") {
    styles.add("At Home");
  }
  if (filters.environment === "both") {
    styles.add("Hybrid Setup");
  }
  if (templateEntry.focus === "mobility_recovery") {
    styles.add("Recovery Day");
    styles.add("Joint-Friendly");
  }
  if (["push", "pull", "upper_body", "chest_triceps", "back_biceps", "shoulders"].includes(templateEntry.focus)) {
    styles.add("Muscle Building");
  }
  return Array.from(styles);
}

function deriveWorkoutCategoryTags(templateEntry, filters, exercises, profile) {
  const tags = new Set(deriveWorkoutTrainingStyles(templateEntry, filters, exercises));
  tags.add(templateEntry.focus);
  if (templateEntry.focus === "legs" || templateEntry.focus === "lower_body") tags.add("Lower Body");
  if (templateEntry.focus === "upper_body") tags.add("Upper Body");
  if (templateEntry.focus === "full_body") tags.add("Full Body");
  if (templateEntry.focus === "chest_triceps") {
    tags.add("Chest");
    tags.add("Arms");
  }
  if (templateEntry.focus === "back_biceps") {
    tags.add("Back");
    tags.add("Arms");
  }
  if (templateEntry.focus === "shoulders") tags.add("Shoulders");
  if ((exercises || []).some((exercise) => exercise.muscleGroup === "Glutes")) tags.add("Glutes");
  if ((exercises || []).some((exercise) => ["Core", "Full body"].includes(exercise.muscleGroup))) tags.add("Core");
  if (profile?.goalType === "fat_loss") tags.add("Fat Loss");
  if (profile?.goalType === "bodybuilding") tags.add("Muscle Building");
  if (profile?.goalType === "strength") tags.add("Strength");
  if (profile?.ageGroup === "40-49" || profile?.ageGroup === "50+") tags.add("40+");
  tags.add(deriveWorkoutDifficulty(templateEntry));
  if (deriveWorkoutJointStress(exercises) === "low") tags.add("Joint-Friendly");
  return Array.from(tags);
}

function buildExerciseLibraryPreview(filters) {
  const previewEntries = EXERCISE_VARIANTS
    .filter((entry) => matchesEquipmentSetup(entry, filters.equipmentProfile, filters.equipmentSelections))
    .filter((entry) => entry.environments.includes(filters.environment) || entry.environments.includes("hybrid") || filters.environment === "both")
    .slice(0, 36)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      category: mapExerciseCategory(entry),
      movementPattern: entry.movementPattern,
      equipment: entry.equipment?.join(", ") || entry.equipmentRequirements?.join(", "),
      difficulty: entry.difficulty,
      jointStress: entry.jointStress,
      rehabSafe: entry.rehabSafe,
      familyIds: entry.familyIds || [],
      media: entry.media,
      mediaStatus: entry.mediaStatus
    }));

  const categoryCounts = EXERCISE_LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    count: previewEntries.filter((entry) => entry.category === category.label).length
  })).filter((category) => category.count > 0);

  return {
    categories: categoryCounts,
    entries: previewEntries
  };
}

function mapExerciseCategory(entry) {
  const primary = String(entry.primaryMuscleGroup || "").toLowerCase();
  const type = String(entry.trainingType || entry.mode || "").toLowerCase();
  if (type === "mobility") return "Mobility";
  if (primary.includes("chest")) return "Chest";
  if (primary.includes("back")) return "Back";
  if (primary.includes("shoulder")) return "Shoulders";
  if (primary.includes("biceps") || primary.includes("forearms")) return "Biceps";
  if (primary.includes("triceps")) return "Triceps";
  if (primary.includes("glutes")) return "Glutes";
  if (primary.includes("legs") || primary.includes("hamstrings") || primary.includes("quads") || primary.includes("calves")) return "Legs";
  if (primary.includes("core")) return "Core";
  if (primary.includes("cardio")) return "Conditioning";
  if (primary.includes("full body")) return "Full Body";
  return "Conditioning";
}

function slot(slotId, label, pool, sets, reps = null, duration = null) {
  return { slotId, label, pool, sets, reps, duration };
}

function template(id, name, focus, type, duration, intensity, primaryMuscles, summary, slots) {
  return { id, name, focus, type, duration, intensity, primaryMuscles, summary, slots };
}

function variantFamily(familyId, entries) {
  return entries.map(([id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments]) =>
    variant(id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments, { familyId })
  );
}

function variant(id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments, options = {}) {
  const jointStressLevel =
    pool === "conditioning" ? "high" : ["mobility_flow", "glute", "calf", "rear_delt"].includes(pool) ? "low" : "moderate";
  const trainingGoals = inferTrainingGoals(pool, movementPattern);
  const rehabSafe = ["bands", "bodyweight", "dumbbell"].includes(equipment) && jointStressLevel !== "high";
  const familyId = options.familyId || `${pool}_family`;
  const movementReference = findMovementForName(name);
  const content = buildTrainingContentStandard({ name, pool, equipment, muscleGroup, movementPattern });
  return createLibraryEntry({
    id,
    name,
    mode: pool === "mobility_flow" ? "mobility" : "training",
    category: pool,
    primaryMuscleGroup: muscleGroup,
    secondaryMuscleGroups: inferSecondaryMuscles(muscleGroup, movementPattern),
    movementPattern,
    equipmentRequirements: [equipment],
    difficultyLevel: inferDifficultyLevel(pool, equipment),
    trainingGoals,
    jointStressLevel,
    rehabSafe,
    environments,
    variationFamily: pool,
    familyIds: [familyId],
    instructions: content.instructions,
    mistakes: content.mistakes,
    cues: content.cues,
    safetyNotes: content.safetyNotes,
    modifications: content.modifications,
    media: createMediaPayload(
      buildExerciseMediaSpec({
        id,
        name,
        familyId,
        trainingType: pool === "mobility_flow" ? "mobility" : "training",
        fallbackImage: movementReference?.image || null
      })
    ),
    extra: {
      pool,
      equipment,
      muscleGroup,
      equipmentProfiles,
      contentStandard: "v1",
      variationGroup: familyId
    }
  });
}

function buildMovementGuide(option, baseMovement = null) {
  const fallbackMovement = attachMovementToExercise({
    name: option.name,
    equipment: option.equipmentRequirements || [option.equipment],
    muscleGroup: option.primaryMuscleGroup || option.muscleGroup,
    movementId: baseMovement?.id || null
  }).movement;
  const movement = baseMovement || fallbackMovement;

  return {
    ...(movement || {}),
    id: movement?.id || option.id,
    name: movement?.name || option.name,
    category: movement?.category || option.category,
    difficulty: movement?.difficulty || option.difficultyLevel,
    environment: movement?.environment || option.environments?.join(", ") || "Home / gym",
    equipment: movement?.equipment?.length ? movement.equipment : option.equipmentRequirements || [option.equipment],
    primaryMuscles: movement?.primaryMuscles?.length ? movement.primaryMuscles : [option.primaryMuscleGroup || option.muscleGroup],
    secondaryMuscles:
      movement?.secondaryMuscles?.length ? movement.secondaryMuscles : option.secondaryMuscleGroups || [],
    instructions: movement?.instructions?.length ? movement.instructions : option.instructions || [],
    cues: movement?.cues?.length ? movement.cues : option.cues || [],
    commonMistakes: movement?.commonMistakes?.length ? movement.commonMistakes : option.mistakes || [],
    safetyNotes: movement?.safetyNotes?.length ? movement.safetyNotes : option.safetyNotes || [],
    modifications: movement?.modifications?.length ? movement.modifications : option.modifications || [],
    media: option.media,
    mediaStatus: option.media?.status || option.mediaStatus || "none",
    familyIds: option.familyIds || []
  };
}

function buildTrainingContentStandard({ name, pool, equipment, muscleGroup, movementPattern }) {
  const lowerPattern = String(movementPattern || "").toLowerCase();
  const setup = getEquipmentCue(equipment);
  const movementRole =
    pool === "conditioning"
      ? "build pace without losing position"
      : pool === "full_body_finish"
        ? "finish the session with control"
        : `train ${String(muscleGroup || "the target area").toLowerCase()}`;

  return {
    instructions: [
      `Set up with ${setup} and get your body in a stable starting position for ${name}.`,
      `Move through each rep with control so the main job is to ${movementRole}.`,
      lowerPattern.includes("carry") || lowerPattern.includes("conditioning")
        ? "Keep breathing steady and stop the set before posture breaks."
        : "Finish each rep cleanly and keep the same shape on the last rep as the first."
    ],
    cues: buildCueList(lowerPattern, muscleGroup),
    mistakes: buildMistakeList(lowerPattern),
    safetyNotes: [
      "Use a load you can control through the full working range.",
      lowerPattern.includes("hinge") || lowerPattern.includes("squat")
        ? "Brace before each rep and stop if you lose spinal position."
        : "Stop the set if the target area loses tension and the rep turns sloppy."
    ],
    modifications: [
      equipment === "barbell"
        ? "Use a dumbbell or machine version if you need a simpler setup."
        : "Reduce load, shorten the range slightly, or slow the tempo to keep the rep cleaner.",
      "Swap to a lower-stress alternative if the joint position feels wrong today."
    ]
  };
}

function buildCueList(lowerPattern, muscleGroup) {
  if (lowerPattern.includes("push")) {
    return ["Brace before you press.", "Keep the shoulders packed instead of shrugging.", `Drive through the rep with ${String(muscleGroup).toLowerCase()} tension.`];
  }
  if (lowerPattern.includes("pull")) {
    return ["Start the pull from your back, not your hands.", "Keep the ribs stacked and neck relaxed.", "Pause briefly when you reach the strongest position."];
  }
  if (lowerPattern.includes("squat") || lowerPattern.includes("single-leg")) {
    return ["Stay balanced through the whole foot.", "Keep the torso organized as you lower.", "Push the floor away on the way up."];
  }
  if (lowerPattern.includes("hinge")) {
    return ["Send the hips back first.", "Keep the bar or load close to you.", "Finish tall without leaning back."];
  }
  if (lowerPattern.includes("carry") || lowerPattern.includes("conditioning")) {
    return ["Stay tall and move with purpose.", "Keep breathing under control.", "Let posture lead the pace."];
  }
  return ["Move with control.", "Keep tension where the exercise is meant to work.", "Stay smooth from rep to rep."];
}

function buildMistakeList(lowerPattern) {
  if (lowerPattern.includes("push")) {
    return ["Flaring the ribs to finish the press.", "Losing shoulder position at the bottom.", "Rushing the lowering phase."];
  }
  if (lowerPattern.includes("pull")) {
    return ["Yanking with the arms before the back engages.", "Turning the rep into a body swing.", "Shrugging through the top of the pull."];
  }
  if (lowerPattern.includes("squat") || lowerPattern.includes("single-leg")) {
    return ["Dropping too fast into the bottom.", "Letting balance shift to the toes.", "Cutting the rep short once it gets harder."];
  }
  if (lowerPattern.includes("hinge")) {
    return ["Rounding the back to chase range.", "Letting the load drift away from the body.", "Turning the rep into a squat."];
  }
  return ["Rushing reps without control.", "Letting posture break before the set ends.", "Using momentum instead of tension."];
}

function getEquipmentCue(equipment) {
  const map = {
    barbell: "a strong brace and a simple bar path",
    dumbbell: "steady grip and even control on both sides",
    bodyweight: "full-body tension and clear body position",
    bands: "constant tension and a stable anchor point",
    machine: "the pad or seat adjusted so the line of pull feels natural"
  };

  return map[equipment] || "a stable setup";
}

function inferTrainingGoals(pool, movementPattern) {
  if (pool === "mobility_flow") {
    return ["mobility", "rehab", "recovery"];
  }
  if (pool === "full_body_finish") {
    return ["general_fitness", "conditioning", "athletic_performance"];
  }
  if (pool === "conditioning") {
    return ["conditioning", "athletic_performance", "fat_loss"];
  }
  if (String(movementPattern || "").toLowerCase().includes("isolation")) {
    return ["hypertrophy", "bodybuilding"];
  }
  return ["strength", "hypertrophy", "general_fitness"];
}

function inferSecondaryMuscles(muscleGroup, movementPattern) {
  const lowerPattern = String(movementPattern || "").toLowerCase();
  if (lowerPattern.includes("push")) {
    return muscleGroup === "Chest" ? ["Shoulders", "Triceps"] : ["Chest", "Triceps"];
  }
  if (lowerPattern.includes("pull")) {
    return muscleGroup === "Back" ? ["Biceps", "Rear delts"] : ["Back", "Biceps"];
  }
  if (lowerPattern.includes("hinge") || lowerPattern.includes("squat")) {
    return ["Glutes", "Hamstrings", "Core"];
  }
  return [];
}

function inferDifficultyLevel(pool, equipment) {
  if (pool === "conditioning") {
    return "advanced";
  }
  if (equipment === "bodyweight" || equipment === "bands") {
    return "beginner";
  }
  if (equipment === "barbell" || equipment === "machine") {
    return "intermediate";
  }
  return "standard";
}
