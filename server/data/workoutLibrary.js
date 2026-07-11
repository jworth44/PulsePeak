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
import { getReviewedMediaAsset, hasReviewedMediaAsset } from "../../shared/mediaReviewCatalog.js";
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
  variant("pull-up-negative", "Pull-up negative", "vertical_pull", "pullup-bar", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

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
  variant("biceps-curl", "Biceps curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hammer-curl", "Hammer curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-curl", "Band curl", "biceps", "bands", "Biceps", "Elbow flexion", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("towel-curl-isometric", "Towel curl isometric", "biceps", "bodyweight", "Biceps", "Elbow flexion", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("incline-dumbbell-curl", "Incline dumbbell curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),
  variant("concentration-curl", "Concentration curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("back-squat", "Back squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("leg-press", "Leg press", "squat", "machine", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("leg-extension", "Leg extension", "knee-extension", "machine", "Legs", "Knee extension", ["full_gym"], ["gym", "hybrid"]),
  variant("goblet-squat", "Goblet squat", "squat", "dumbbell", "Legs", "Squat", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bodyweight-squat", "Bodyweight squat", "squat", "bodyweight", "Legs", "Squat", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-squat", "Banded squat", "squat", "bands", "Legs", "Squat", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("front-foot-elevated-squat", "Front-foot elevated split squat", "squat", "dumbbell", "Legs", "Single-leg squat / split squat", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("romanian-deadlift", "Romanian deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("good-morning", "Good morning", "hinge", "bodyweight", "Hamstrings", "Hinge", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("sumo-deadlift", "Sumo deadlift", "sumo-deadlift", "barbell", "Legs", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("trap-bar-deadlift", "Trap-bar deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-romanian-deadlift", "Dumbbell Romanian deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-hinge-reach", "Hip hinge reach", "hinge", "bodyweight", "Hamstrings", "Hinge", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-hip-hinge", "Band hip hinge", "hinge", "bands", "Hamstrings", "Hinge", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("kettlebell-deadlift", "Kettlebell deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("walking-lunge", "Walking lunge", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("split-squat", "Split squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("supported-split-squat", "Supported split squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-reverse-lunge", "Banded reverse lunge", "lunge", "bands", "Legs", "Single-leg", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("goblet-reverse-lunge", "Goblet reverse lunge", "goblet-reverse-lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("step-up", "Step-up", "lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("rear-foot-elevated-split-squat", "Rear-foot elevated split squat", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bulgarian-split-squat", "Bulgarian split squat", "bulgarian-split-squat", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),
  variant("dumbbell-walking-lunge", "Dumbbell walking lunge", "dumbbell-walking-lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("dumbbell-step-up", "Dumbbell step-up", "dumbbell-step-up", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("hip-thrust", "Hip thrust", "glute", "barbell", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),
  variant("glute-bridge", "Glute bridge", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("dumbbell-glute-bridge", "Dumbbell glute bridge", "glute", "dumbbell", "Glutes", "Hip extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-glute-bridge", "Banded glute bridge", "glute", "bands", "Glutes", "Hip extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-pull-through", "Cable pull-through", "glute", "machine", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),
  variant("hamstring-curl", "Hamstring curl", "hamstring-curl", "machine", "Hamstrings", "Knee flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("seated-hamstring-curl", "Seated hamstring curl", "seated-hamstring-curl", "machine", "Hamstrings", "Knee flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("lying-hamstring-curl", "Lying hamstring curl", "lying-hamstring-curl", "machine", "Hamstrings", "Knee flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("cable-glute-kickback", "Cable glute kickback", "cable-glute-kickback", "machine", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),
  variant("band-glute-kickback", "Band glute kickback", "band-glute-kickback", "bands", "Glutes", "Hip extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-abduction", "Hip abduction", "hip-abduction", "machine", "Glutes", "Hip abduction", ["full_gym"], ["gym", "hybrid"]),
  variant("lateral-band-walk", "Lateral band walk", "lateral-band-walk", "bands", "Glutes", "Hip abduction", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("clamshell", "Clamshell", "clamshell", "bodyweight", "Glutes", "Hip abduction", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("standing-calf-raise", "Standing calf raise", "calf", "machine", "Calves", "Calf raise", ["full_gym"], ["gym", "hybrid"]),
  variant("calf-raise", "Calf raise", "calf", "bodyweight", "Calves", "Calf raise", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("single-leg-calf-raise", "Single-leg calf raise", "calf", "bodyweight", "Calves", "Calf raise", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-calf-raise", "Band calf raise", "calf", "bands", "Calves", "Calf raise", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("seated-calf-raise", "Seated calf raise", "calf", "dumbbell", "Calves", "Calf raise", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hollow-body-hold", "Hollow body hold", "full_body_finish", "bodyweight", "Core", "Anti-extension core", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hollow-rock", "Hollow rock", "full_body_finish", "bodyweight", "Core", "Anti-extension core", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("crunch", "Crunch", "full_body_finish", "bodyweight", "Core", "Trunk flexion", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("reverse-crunch", "Reverse crunch", "full_body_finish", "bodyweight", "Core", "Trunk flexion", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bicycle-crunch", "Bicycle crunch", "full_body_finish", "bodyweight", "Core", "Rotational core", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("russian-twist", "Russian twist", "full_body_finish", "bodyweight", "Core", "Rotational core", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hanging-knee-raise", "Hanging knee raise", "full_body_finish", "pullup-bar", "Core", "Hip flexion / trunk control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("leg-raise", "Leg raise", "full_body_finish", "bodyweight", "Core", "Hip flexion / trunk control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-crunch", "Cable crunch", "full_body_finish", "machine", "Core", "Trunk flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("ab-wheel-rollout", "Ab wheel rollout", "full_body_finish", "ab-wheel", "Core", "Anti-extension core", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bird-dog", "Bird dog", "full_body_finish", "bodyweight", "Core", "Contralateral stability", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("superman", "Superman", "full_body_finish", "bodyweight", "Back", "Spinal extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bear-crawl", "Bear crawl", "full_body_pull", "bodyweight", "Full body", "Crawl pattern", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("jump-squat", "Jump squat", "conditioning", "bodyweight", "Legs", "Jump / power", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("box-jump", "Box jump", "conditioning", "bodyweight", "Legs", "Jump / power", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("jumping-jack", "Jumping jack", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("skater-hop", "Skater hop", "conditioning", "bodyweight", "Legs", "Lateral power", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("battle-rope-waves", "Battle rope waves", "conditioning", "ropes", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]),
  variant("medicine-ball-slam", "Medicine ball slam", "conditioning", "medicine-ball", "Full body", "Power conditioning", ["full_gym", "hybrid"], ["gym", "hybrid"]),
  variant("assault-bike-sprint", "Assault bike sprint", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]),
  variant("treadmill-incline-walk", "Treadmill incline walk", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]),

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
  variant("plank", "Plank", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("side-plank", "Side plank", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("cat-cow", "Cat-cow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("worlds-greatest-stretch", "World's greatest stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("ninety-ninety-hip-flow", "90/90 hip flow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("thoracic-rotation", "Thoracic rotation", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("shoulder-mobility", "Shoulder mobility", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("wall-slide", "Wall slide", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-flexor-stretch", "Hip flexor stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hamstring-stretch", "Hamstring stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("childs-pose-side-reach", "Child's pose side reach", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("ankle-rocks", "Ankle rocks", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"])
];

const EXPANDED_EXERCISE_VARIANTS = [
  ...variantFamily("push_family", [
    ["flat-dumbbell-bench-press", "Flat dumbbell bench press", "horizontal_push_primary", "dumbbell", "Chest", "Horizontal push", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]],
    ["smith-machine-bench-press", "Smith machine bench press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["machine-incline-chest-press", "Machine incline chest press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["cable-chest-fly", "Cable chest fly", "horizontal_push_secondary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["dumbbell-chest-fly", "Dumbbell chest fly", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["dumbbell-squeeze-press", "Dumbbell squeeze press", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["incline-push-up", "Incline push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["decline-push-up", "Decline push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
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
    ["chin-up", "Chin-up", "vertical_pull", "pullup-bar", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["straight-arm-band-pulldown", "Straight-arm band pulldown", "vertical_pull", "bands", "Back", "Vertical pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]],
    ["straight-arm-pulldown", "Straight-arm pulldown", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]],
    ["dumbbell-pullover", "Dumbbell pullover", "vertical_pull", "dumbbell", "Back", "Vertical pull", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
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
  ]),
  ...variantFamily("conditioning_cardio_family", [
    ["butt-kicks", "Butt kicks", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["shadow-boxing", "Shadow boxing", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["lateral-shuffles", "Lateral shuffles", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["forward-backward-sprints", "Forward-backward sprints", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["treadmill-walk", "Treadmill walk", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["treadmill-run", "Treadmill run", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["stationary-bike", "Stationary bike", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["elliptical-trainer", "Elliptical trainer", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["stair-climber", "Stair climber", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["box-step-up-cardio", "Box step-up cardio", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["fast-feet-drill", "Fast feet drill", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["agility-ladder-in-out", "Agility ladder in-out", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["agility-ladder-lateral", "Agility ladder lateral", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["cone-drill-zigzag", "Cone drill zigzag", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["shuttle-run", "Shuttle run", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["split-jump-lunge", "Split jump lunge", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["bear-crawl-cardio", "Bear crawl cardio", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["jump-rope-double-unders", "Jump rope double unders", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["battle-rope-slams", "Battle rope slams", "conditioning", "ropes", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]]
  ])
];

const RAW_EXERCISE_VARIANTS = [...BASE_EXERCISE_VARIANTS, ...EXPANDED_EXERCISE_VARIANTS];
const EXERCISE_VARIANTS = validateLibraryEntries(RAW_EXERCISE_VARIANTS, "workout catalog").map((entry) => {
  const rawEntry = RAW_EXERCISE_VARIANTS.find((candidate) => candidate.id === entry.id);
  return {
    ...entry,
    ...(rawEntry || {})
  };
});

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
    // Recovery Directive session-quality standard: a recovery day finishes
    // with LOW-stress activation, not conditioning (the conditioning pool is
    // high-joint-stress by definition and is excluded from recovery
    // sessions, which left this slot permanently empty).
    slot("finish", "Low-stress finish", "glute", 2, "10-12")
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

export function getExerciseLibraryCatalog() {
  const entries = EXERCISE_VARIANTS
    .map((entry) => buildExerciseLibraryRecord(entry, findMovementForName(entry.name)))
    .sort((left, right) => left.name.localeCompare(right.name));

  const categories = EXERCISE_LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    count: entries.filter((entry) => entry.category === category.label).length
  })).filter((category) => category.count > 0);

  const equipmentOptions = Array.from(
    new Set(
      entries.flatMap((entry) => entry.equipment).filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  const difficultyOptions = Array.from(new Set(entries.map((entry) => entry.difficulty).filter(Boolean)));

  return {
    total: entries.length,
    categories,
    equipmentOptions,
    difficultyOptions,
    entries
  };
}

export function getExerciseLibraryRecordById(exerciseId) {
  const normalizedId = String(exerciseId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return (
    getExerciseLibraryCatalog().entries.find(
      (entry) => String(entry.detailId || entry.id) === normalizedId || String(entry.id) === normalizedId
    ) || null
  );
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
  // Session-level dedup (Recovery Directive P0): slots were ranked
  // independently, so templates with several same-pool slots selected the
  // SAME top variant repeatedly (the "Cat-cow × 4" defect). Each picked
  // exercise is excluded from later slots; a slot whose pool is genuinely
  // exhausted is dropped (an honestly shorter session) rather than silently
  // filled with a repeat.
  const usedExerciseNames = new Set();
  const seenSessionNames = new Set();
  const exercises = templateEntry.slots
    .map((slotEntry) =>
      buildExerciseForSlot(slotEntry, {
        environment,
        equipmentProfile: filters.equipmentProfile,
        equipmentSelections: filters.equipmentSelections,
        profile,
        historyContext,
        usedExerciseNames,
        templateFocus: templateEntry.focus
      })
    )
    .filter(Boolean)
    // Final invariant: one session never lists the same movement twice.
    .filter((exercise) => {
      const key = String(exercise.name || "").toLowerCase();
      if (seenSessionNames.has(key)) {
        return false;
      }
      seenSessionNames.add(key);
      return true;
    });

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
  const previewExercise = workout.exercises?.[0] || null;
  if (hasFullWorkoutAccess(accessTier)) {
    return {
      ...workout,
      previewExercise,
      lockedForAccess: false,
      previewOnly: false,
      lockedExerciseCount: 0
    };
  }

  const focusUsable = isWorkoutFocusUsable(accessTier, workout.focus, suggestedFocuses);
  if (!focusUsable) {
    return {
      ...workout,
      previewExercise,
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
    previewExercise,
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

// Selection-time safety rules (Recovery Directive Part 5/7): a restricted
// user's sessions must not CONTAIN the restricted patterns — adapting the
// guide text after selection is not enough. Conservative, pattern-first.
const RESTRICTED_AREA_VARIANT_RULES = [
  { area: "shoulder", conflicts: (v) => v.movementPattern === "Vertical push" || /lateral raise|upright row|pullover|overhead|arnold|pike push|handstand|snatch|jerk/i.test(v.name) },
  { area: "knee", conflicts: (v) => /jump|plyo|bound|burpee|high knees|jack|skater|pistol/i.test(v.name) },
  { area: "ankle", conflicts: (v) => /jump|plyo|bound|high knees|jack|skater/i.test(v.name) },
  { area: "hip", conflicts: (v) => /jump|plyo|bound|burpee|skater/i.test(v.name) },
  { area: "back", conflicts: (v) => /deadlift|good morning|bent-over|barbell row/i.test(v.name) },
  { area: "wrist", conflicts: (v) => /push-up|plank|handstand|crawl|renegade/i.test(v.name) }
];

function violatesRestrictions(variantEntry, profile) {
  if (!profile || profile.injuryStatus === "none") {
    return false;
  }
  const areas = Array.isArray(profile.restrictedAreas) ? profile.restrictedAreas : [];
  if (!areas.length) {
    return false;
  }
  return RESTRICTED_AREA_VARIANT_RULES.some((rule) => areas.includes(rule.area) && rule.conflicts(variantEntry));
}

function buildExerciseForSlot(slotEntry, { environment, equipmentProfile, equipmentSelections, profile, historyContext, usedExerciseNames = new Set(), templateFocus = null }) {
  const isUsed = (variantEntry) => usedExerciseNames.has(String(variantEntry.name || "").toLowerCase());
  const options = EXERCISE_VARIANTS.filter((variantEntry) => {
    if (variantEntry.pool !== slotEntry.pool) {
      return false;
    }
    if (isUsed(variantEntry)) {
      return false;
    }
    if (!matchesEquipmentSetup(variantEntry, equipmentProfile, equipmentSelections)) {
      return false;
    }
    if (!variantEntry.environments.includes(environment) && !variantEntry.environments.includes("hybrid")) {
      return false;
    }
    if (violatesRestrictions(variantEntry, profile)) {
      return false;
    }
    // A recovery session must stay a recovery session: no high-joint-stress
    // variants inside mobility_recovery templates (the "high-stress Recovery
    // Reset" persona-F defect).
    if (templateFocus === "mobility_recovery" && variantEntry.jointStressLevel === "high") {
      return false;
    }
    return true;
  });

  const rankedOptions = [...options].sort((left, right) =>
    rankVariantOption(right, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) -
    rankVariantOption(left, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry })
  );
  // NO pool-wide fallback (Recovery Directive persona A/G defect): the old
  // fallback dropped the equipment/safety filters and served dumbbell work
  // to bodyweight-only users. A slot whose eligible pool is empty is
  // dropped by the caller — an honestly shorter session, never equipment
  // the user doesn't have or movements they can't do.
  const primaryOption = rankedOptions[0];
  if (!primaryOption) {
    return null;
  }

  const primary = attachExerciseMetadata(primaryOption, slotEntry, profile, historyContext);
  // Record BOTH the variant name and the displayed guide name — dedup must
  // hold on what the user actually reads in the session.
  usedExerciseNames.add(String(primaryOption.name || "").toLowerCase());
  if (primary?.name) {
    usedExerciseNames.add(String(primary.name).toLowerCase());
  }

  const swapOptions = rankedOptions
    .slice(1)
    .map((option) => attachExerciseMetadata(option, slotEntry, profile, historyContext))
    .filter(Boolean)
    .slice(0, 10);

  return {
    ...primary,
    availableSwapCount: Math.max(rankedOptions.length - 1, 0),
    swapOptions
  };
}

function attachExerciseMetadata(option, slotEntry, profile, historyContext) {
  const movement = findMovementForName(option.name);
  const adaptedMovement = movement ? adaptMovementForProfile(movement.id, profile) : null;
  const displayMovement = adaptedMovement || movement;
  const familyOptionCount = EXERCISE_VARIANTS.filter(
    (variantEntry) =>
      variantEntry.pool === option.pool &&
      variantEntry.id !== option.id &&
      variantEntry.familyIds?.some((familyId) => option.familyIds?.includes(familyId))
  ).length;
  const movementGuide = buildMovementGuide(option, displayMovement);
  const displayName = movementGuide?.name || option.name;
  const equipment = movementGuide?.equipment?.[0] || option.equipment;
  const muscleGroup = movementGuide?.primaryMuscles?.[0] || option.muscleGroup;
  const lastLoad = historyContext?.latestLoads?.get(displayName.toLowerCase()) || null;

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
    detailId: movementGuide?.detailId || null,
    guideTargetId: movementGuide?.detailId || null,
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
  // "both" is a filter value, not English — the owner's hero read
  // "your both training setup" (Recovery Directive: copy must read coached,
  // never machine-assembled).
  const environmentLabel = filters.environment === "both" ? "hybrid" : filters.environment;
  const recommendedFocus = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: filters.lowRecovery
  })[0];
  const focusLabel = filters.manualFocus ? selectedFocusMeta?.label || formatWorkoutFocus(filters.focus) : formatWorkoutFocus(recommendedFocus);

  if (profile.injuryStatus !== "none") {
    return filters.manualFocus
      ? `You picked ${focusLabel}, and today keeps that intent while staying kind to your body — clean movements and an equipment fit that won't aggravate the injury.`
      : `${focusLabel} leads today because your body needs cleaner movement choices and easier recovery right now.`;
  }

  if (filters.lowRecovery) {
    return filters.manualFocus
      ? `You picked ${focusLabel}, and today keeps it realistic for a lower-recovery day instead of pushing a heavier session.`
      : `${focusLabel} leads because you're low on recovery — this still moves your week forward without piling on extra load.`;
  }

  if (filters.manualFocus) {
    const equipmentPhrase = `${formatEquipmentSelections(filters.equipmentSelections).toLowerCase()} setup`;
    // Only cite "recent training history" if there actually is any.
    return historyContext.workouts.length
      ? `You picked ${focusLabel}, so today’s options stay matched to your ${environmentLabel} setup, ${equipmentPhrase}, and recent training history.`
      : `You picked ${focusLabel}, so today’s options stay matched to your ${environmentLabel} setup and ${equipmentPhrase}.`;
  }

  if (historyContext.recentFocuses[0] === recommendedFocus) {
    return `${focusLabel} still fits best today, with enough movement changes to keep the session from feeling recycled.`;
  }

  return `${focusLabel} is the best fit today because it lines up with your ${profile.goalType.replace("_", " ")} goal, your ${environmentLabel} training setup, and the equipment you actually have available.`;
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
  if (lastTrainedLabel) {
    return lastTrainedLabel;
  }
  // No "not shown up recently" for a user with no training logged — that
  // implies a history they don't have.
  if (!historyContext.workouts.length) {
    return "A strong anchor session to open your week with.";
  }
  return "This split hasn't come up in your recent sessions, so it's a good way to keep the week balanced.";
}

function buildWorkoutVarietyNote(exercises, historyContext) {
  const repeatedMovements = exercises.filter((exercise) => (historyContext.exerciseUsage.get(exercise.name.toLowerCase()) || 0) > 0).length;
  if (!historyContext.workouts.length) {
    return "Once you've logged a few sessions, your workouts start rotating more to keep things fresh — for now, this is a strong, balanced place to start.";
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
    notes: exerciseEntry.notes || "",
    movementId: exerciseEntry.movementId || exerciseEntry.movement?.movementId || exerciseEntry.movement?.id || null,
    detailId: exerciseEntry.detailId || exerciseEntry.guideTargetId || exerciseEntry.movement?.detailId || null,
    guideTargetId: exerciseEntry.guideTargetId || exerciseEntry.detailId || exerciseEntry.movement?.detailId || null,
    movement: exerciseEntry.movement || null
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
  // Bodyweight is a capability every user has: owning a bench or dumbbells
  // must never disqualify equipment-free movements. (This gap silently
  // emptied bodyweight/mobility pools for equipped users and was papered
  // over by the old unsafe pool-wide fallback. Bar-dependent movements are
  // tagged "pullup-bar", not "bodyweight", so they still require the bar.)
  if (optionEquipment === "bodyweight") {
    return true;
  }

  const selectionSet = new Set(equipmentSelections || []);
  if (!selectionSet.size) {
    return true;
  }

  const map = {
    dumbbell: ["dumbbells", "kettlebells"],
    "pullup-bar": ["pull_up_bar"],
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
  tags.add(deriveWorkoutDifficulty(templateEntry));
  // Safety tags describe the WORKOUT, never the user. "Joint-Friendly" means
  // no high-joint-stress movement in the session (strictly all-low was so
  // rare the category matched nothing and silently fell back to unfiltered
  // sessions — unsafe under a safety label). "40+" additionally requires the
  // session itself not be high intensity (smoother pacing, recovery-aware).
  // The old "40+" tag keyed on the USER's ageGroup, which made the category
  // mean "everything" for a 40+ user and "nothing" for everyone else.
  const hasHighStressExercise = (exercises || []).some(
    (exercise) => exercise.tags?.jointStressLevel === "high"
  );
  if (!hasHighStressExercise) tags.add("Joint-Friendly");
  if (!hasHighStressExercise && templateEntry.intensity !== "High") tags.add("40+");
  return Array.from(tags);
}

function buildExerciseLibraryPreview(filters) {
  const previewEntries = EXERCISE_VARIANTS
    .filter((entry) => matchesEquipmentSetup(entry, filters.equipmentProfile, filters.equipmentSelections))
    .filter((entry) => entry.environments.includes(filters.environment) || entry.environments.includes("hybrid") || filters.environment === "both")
    .map((entry) => buildExerciseLibraryRecord(entry, findMovementForName(entry.name)));

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
  return buildExerciseLibraryRecord(option, baseMovement);
}

function buildExerciseLibraryRecord(option, baseMovement = null) {
  const fallbackMovement = attachMovementToExercise({
    name: option.name,
    equipment: option.equipmentRequirements || [option.equipment],
    muscleGroup: option.primaryMuscleGroup || option.muscleGroup,
    movementId: baseMovement?.id || null
  }).movement;
  const movement = baseMovement || fallbackMovement;
  // Keep the public exercise-library id tied to the unique variant id so
  // similar movements can share one movement reference without colliding.
  const libraryId = option.id;
  const guideProfile = buildExerciseGuideProfile(option, movement);
  const resolvedMedia = resolveExactGuideMedia(option, movement);
  const resolvedMediaStatus = resolvedMedia?.status || "none";
  const standardizedGuideFields = buildStructuredGuideFields({
    description: guideProfile.description,
    trainingUse: guideProfile.trainingUse,
    primaryMuscles: guideProfile.primaryMuscles,
    secondaryMuscles: guideProfile.secondaryMuscles,
    setup: guideProfile.setup,
    execution: guideProfile.execution,
    stepSequence: guideProfile.visualSequence,
    breathing: guideProfile.breathing,
    tempo: guideProfile.tempo,
    commonMistakes: guideProfile.commonMistakes,
    safetyNotes: guideProfile.safetyNotes,
    adjustments: guideProfile.modifications,
    easierOptions: guideProfile.regressions,
    progressions: guideProfile.progressions
  });

  return {
    ...(movement || {}),
    id: libraryId,
    movementId: movement?.id || option.id,
    detailId: buildExerciseLibraryDetailId(option),
    title: option.title || option.name || movement?.name,
    name: option.name || movement?.name,
    category: mapExerciseCategory(option),
    guideCategory: guideProfile.category,
    difficulty: guideProfile.difficulty,
    environment: movement?.environment || option.environments?.join(", ") || "Home / gym",
    equipment: guideProfile.equipment,
    primaryMuscles: guideProfile.primaryMuscles,
    secondaryMuscles: guideProfile.secondaryMuscles,
    instructions: guideProfile.instructions,
    cues: guideProfile.cues,
    commonMistakes: guideProfile.commonMistakes,
    safetyNotes: guideProfile.safetyNotes,
    modifications: standardizedGuideFields.modifications,
    adjustmentOptions: standardizedGuideFields.modifications.adjustments,
    progressions: guideProfile.progressions,
    regressions: guideProfile.regressions,
    snapshot: guideProfile.snapshot,
    movementQuality: guideProfile.movementQuality,
    movementQualityDetail: guideProfile.movementQualityDetail,
    jointStress: guideProfile.jointStress,
    visualSequence: guideProfile.visualSequence,
    stepSequence: guideProfile.visualSequence,
    description: guideProfile.description,
    guideSupportLabel: guideProfile.guideSupportLabel,
    bestFit: guideProfile.bestFit,
    trainingUse: guideProfile.trainingUse,
    whatThisExerciseIs: standardizedGuideFields.whatThisExerciseIs,
    setup: guideProfile.setup,
    execution: guideProfile.execution,
    howToPerform: standardizedGuideFields.howToPerform,
    breathing: guideProfile.breathing,
    tempo: guideProfile.tempo,
    stepByStep: standardizedGuideFields.stepByStep,
    exactVisuals: guideProfile.exactVisuals,
    image: resolvedMedia?.thumbnail || resolvedMedia?.images?.[0] || null,
    imageAlt: resolvedMedia ? `${option.name} reference visual` : "",
    thumbnail: resolvedMedia?.thumbnail || resolvedMedia?.images?.[0] || null,
    media: resolvedMedia,
    mediaStatus: resolvedMediaStatus,
    mediaPaths: {
      thumbnail: resolvedMedia?.thumbnail || null,
      steps: Array.isArray(resolvedMedia?.steps) ? resolvedMedia.steps : Array.isArray(resolvedMedia?.images) ? resolvedMedia.images : []
    },
    equipmentDisplay: guideProfile.equipment.join(", "),
    primaryMuscleGroup: guideProfile.primaryMuscles.join(", "),
    secondaryMuscleGroups: guideProfile.secondaryMuscles,
    movementPattern: guideProfile.movementPattern || option.movementPattern,
    familyIds: option.familyIds || [],
    guideContentStandard: "v2"
  };
}

function buildExerciseLibraryDetailId(option) {
  if (String(option?.id || "").trim().toLowerCase() === "front-foot-elevated-squat") {
    return "front-foot-elevated-squat--front-foot-elevated-squat";
  }
  const name = String(option?.name || option?.title || option?.id || "exercise")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseId = String(option?.id || "").trim().toLowerCase();
  return baseId ? `${baseId}--${name}` : name;
}

const EXACT_VISUAL_MEDIA_KEYS = new Map(
  [
    ["push-up", "push-up"],
    ["dumbbell-shoulder-press", "overhead-press"],
    ["lat-pulldown", "lat-pulldown"],
    ["triceps-pushdown", "triceps-pushdown"],
    ["biceps-curl", "biceps-curl"],
    ["single-arm-dumbbell-row", "row"],
    ["band-pull-apart", "band-pull-apart"],
    ["cat-cow", "cat-cow"],
    ["worlds-greatest-stretch", "worlds-greatest-stretch"],
    ["ninety-ninety-hip-flow", "hip-flow-90-90"],
    ["thoracic-rotation", "thoracic-rotation"],
    ["shoulder-mobility", "shoulder-mobility"],
    ["wall-slide", "wall-slide"],
    ["hip-flexor-stretch", "hip-flexor-stretch"],
    ["hamstring-stretch", "hamstring-stretch"],
    ["childs-pose-side-reach", "childs-pose-side-reach"],
    ["ankle-rocks", "ankle-rocks"],
    ["glute-bridge", "glute-bridge"],
    ["calf-raise", "calf-raise"],
    ["dead-bug", "dead-bug"],
    ["plank", "plank"],
    ["side-plank", "side-plank"],
    ["high-knees", "high-knees"],
    ["burpee", "burpee"],
    // Variant -> representative reviewed-image mappings. Each variant shares the
    // demo image of the movement family it already matches (via findMovementForName),
    // where that base has an approved reviewed asset and the image is a genuine
    // visual match. Visually-misleading pairings (cardio machines, machine leg
    // curls, crawls, composites) are deliberately left as text guides.
    ["ab-wheel-rollout", "ab-wheel"],
    ["reverse-fly", "band-pull-apart"],
    ["reverse-snow-angel", "band-pull-apart"],
    ["battle-rope-waves", "battle-ropes"],
    ["band-curl", "biceps-curl"],
    ["ez-bar-curl", "biceps-curl"],
    ["incline-dumbbell-curl", "biceps-curl"],
    ["preacher-curl", "biceps-curl"],
    ["reverse-curl", "biceps-curl"],
    ["rope-hammer-curl", "biceps-curl"],
    ["towel-curl-isometric", "biceps-curl"],
    ["band-calf-raise", "calf-raise"],
    ["seated-calf-raise", "calf-raise"],
    ["single-leg-calf-raise", "calf-raise"],
    ["standing-calf-raise", "calf-raise"],
    ["bicycle-crunch", "crunch"],
    ["cable-crunch", "crunch"],
    ["reverse-crunch", "crunch"],
    ["band-hip-hinge", "deadlift"],
    ["banded-good-morning", "deadlift"],
    ["good-morning", "deadlift"],
    ["hip-hinge-reach", "deadlift"],
    ["kettlebell-deadlift", "deadlift"],
    ["sumo-deadlift", "deadlift"],
    ["trap-bar-deadlift", "deadlift"],
    ["band-chest-press", "dumbbell-press"],
    ["incline-machine-press", "dumbbell-press"],
    ["machine-chest-press", "dumbbell-press"],
    ["banded-glute-bridge", "glute-bridge"],
    ["dumbbell-glute-bridge", "glute-bridge"],
    ["band-glute-kickback", "hip-thrust"],
    ["cable-glute-kickback", "hip-thrust"],
    ["cable-pull-through", "hip-thrust"],
    ["hollow-body-hold", "hollow-hold"],
    ["hollow-rock", "hollow-hold"],
    ["assisted-pull-up", "lat-pulldown"],
    ["band-pulldown", "lat-pulldown"],
    ["chin-up", "lat-pulldown"],
    ["neutral-grip-lat-pulldown", "lat-pulldown"],
    ["pull-up-negative", "lat-pulldown"],
    ["straight-arm-band-pulldown", "lat-pulldown"],
    ["hip-abduction", "lateral-band-walk"],
    ["band-lateral-raise", "lateral-raise"],
    ["cable-lateral-raise", "lateral-raise"],
    ["lean-away-lateral-raise", "lateral-raise"],
    ["hanging-knee-raise", "leg-raise"],
    ["banded-reverse-lunge", "lunge"],
    ["rear-foot-elevated-split-squat", "lunge"],
    ["step-up-to-knee-drive", "lunge"],
    ["medicine-ball-slam", "med-ball-slam"],
    ["band-overhead-press", "overhead-press"],
    ["band-thruster", "overhead-press"],
    ["dumbbell-thruster", "overhead-press"],
    ["goblet-squat-to-press", "overhead-press"],
    ["half-kneeling-dumbbell-press", "overhead-press"],
    ["landmine-press", "overhead-press"],
    ["pike-push-up", "overhead-press"],
    ["z-press", "overhead-press"],
    ["plank-shoulder-tap", "plank"],
    ["close-grip-push-up", "push-up"],
    ["deficit-push-up", "push-up"],
    ["push-up-to-down-dog", "push-up"],
    ["band-row", "row"],
    ["band-row-squat", "row"],
    ["doorframe-row", "row"],
    ["inverted-row", "row"],
    ["machine-row", "row"],
    ["renegade-row", "row"],
    ["tripod-row", "row"],
    ["banded-squat", "squat"],
    ["bodyweight-squat", "squat"],
    ["jump-squat", "squat"],
    ["leg-extension", "squat"],
    ["leg-press", "squat"],
    ["front-foot-elevated-squat", "supported-split-squat"],
    ["band-pressdown", "triceps-pushdown"],
    ["bench-dip", "triceps-pushdown"],
    ["rope-overhead-extension", "triceps-pushdown"],
    ["skull-crusher", "triceps-pushdown"],
    // Pass 2: name-based variants whose base movement has an approved image
    // (these weren't pre-matched to a movement, so pass 1 missed them).
    ["rear-delt-cable-fly", "band-pull-apart"],
    ["cable-chest-fly", "dumbbell-chest-fly"],
    ["battle-rope-slams", "battle-ropes"],
    ["barbell-good-morning", "deadlift"],
    ["cable-romanian-deadlift", "deadlift"],
    ["conventional-deadlift", "deadlift"],
    ["single-leg-romanian-deadlift", "deadlift"],
    ["dumbbell-squeeze-press", "dumbbell-press"],
    ["machine-incline-chest-press", "dumbbell-press"],
    ["smith-machine-bench-press", "dumbbell-press"],
    ["frog-pump", "glute-bridge"],
    ["single-leg-glute-bridge", "glute-bridge"],
    ["barbell-hip-thrust-pause", "hip-thrust"],
    ["straight-arm-pulldown", "lat-pulldown"],
    ["dumbbell-reverse-lunge", "lunge"],
    ["lateral-lunge", "lunge"],
    ["decline-push-up", "push-up"],
    ["ring-push-up", "push-up"],
    ["suspension-row", "row"],
    ["box-squat", "squat"],
    ["cossack-squat", "squat"],
    ["hack-squat", "squat"],
    ["heels-elevated-goblet-squat", "squat"],
    ["landmine-split-squat", "supported-split-squat"],
    ["split-jump-lunge", "supported-split-squat"],
    ["cross-body-triceps-extension", "triceps-pushdown"],
    ["bear-crawl-cardio", "bear-crawl"],
    ["bear-crawl-drag", "bear-crawl"]
  ]
);

function resolveExactGuideMedia(option, movement) {
  const exactKey = EXACT_VISUAL_MEDIA_KEYS.get(option.id) || (hasReviewedMediaAsset(option.id) ? option.id : null);
  if (!exactKey) {
    return null;
  }

  if (movement?.id === exactKey && movement?.media) {
    return movement.media;
  }

  const exactMovement = findMovementForName(exactKey) || attachMovementToExercise({ name: exactKey, movementId: exactKey }).movement;
  if (exactMovement?.media) {
    return exactMovement.media;
  }

  const reviewedAsset = getReviewedMediaAsset(exactKey);
  if (!reviewedAsset) {
    return null;
  }

  return createMediaPayload({
    thumbnail: reviewedAsset.thumbnail || reviewedAsset.image || null,
    steps: reviewedAsset.steps || reviewedAsset.images || [],
    videoUrl: reviewedAsset.videoUrl || null,
    mediaStatus: "full",
    generation: reviewedAsset.reviewSource
      ? {
          reviewSource: reviewedAsset.reviewSource,
          modelKey: reviewedAsset.modelKey || null
        }
      : null
  });
}

function buildExerciseGuideProfile(option, movement) {
  const name = option.name || movement?.name || "Movement";
  const loweredName = name.toLowerCase();
  const override = getExerciseLibraryContentOverride(name);
  const equipment = normalizeGuideEquipment(option);
  const primaryMuscles = inferGuidePrimaryMuscles(option, movement, loweredName);
  const secondaryMuscles = inferGuideSecondaryMuscles(option, movement, primaryMuscles, loweredName);
  const difficulty = inferGuideDifficulty(option, loweredName);
  const jointStress = option.jointStressLevel || option.jointStress || movement?.jointStress || "moderate";
  const movementQuality = inferMovementQuality(option, loweredName, jointStress);
  const movementQualityDetail = inferMovementQualityDetail(option, loweredName, primaryMuscles, equipment);
  const snapshot = buildGuideSnapshot(option, loweredName, primaryMuscles, equipment, movementQualityDetail);
  const visualSequence = buildVisualSequence(option, loweredName, equipment);
  const exactVisuals = Boolean(resolveExactGuideMedia(option, movement));
  const modifications = override?.modifications || buildGuideModifications(option, loweredName, movement?.modifications);
  const setup = override?.setup || snapshot.setup;
  const execution = override?.execution || snapshot.execution;
  const mergedPrimaryMuscles = override?.primaryMuscles || primaryMuscles;
  const mergedSecondaryMuscles = override?.secondaryMuscles || secondaryMuscles;
  const mergedDifficulty = override?.difficulty || difficulty;
  const mergedJointStress = override?.jointStress || jointStress;
  const mergedMovementPattern = override?.movementPattern || option.movementPattern;
  const mergedTrainingUse = override?.trainingUse || buildTrainingUse(option, loweredName);
  const mergedDescription = override?.description || snapshot.summary;
  const mergedVisualSequence = normalizeGuideStepSequence(override?.stepSequence || visualSequence);
  const mergedSnapshot = {
    ...snapshot,
    summary: mergedDescription,
    setup,
    execution
  };
  const mergedCues = override?.cues || buildGuideCues(option, loweredName, movement?.cues);
  const mergedMistakes = override?.commonMistakes || buildGuideMistakes(option, loweredName, movement?.commonMistakes);
  const mergedSafetyNotes = override?.safetyNotes || buildGuideSafetyNotes(option, loweredName, movement?.safetyNotes);
  const mergedProgressions = override?.progressions || deriveGuideProgressions(modifications);
  const mergedRegressions = override?.regressions || deriveGuideRegressions(modifications);
  const mergedEquipment = override?.equipment || equipment;
  const mergedCategory = override?.category || formatGuideCategory(option, movement);

  return {
    category: mergedCategory,
    difficulty: mergedDifficulty,
    equipment: mergedEquipment,
    primaryMuscles: mergedPrimaryMuscles,
    secondaryMuscles: mergedSecondaryMuscles,
    instructions: mergedVisualSequence.map((step) => step.description),
    cues: mergedCues,
    commonMistakes: mergedMistakes,
    safetyNotes: mergedSafetyNotes,
    modifications,
    progressions: mergedProgressions,
    regressions: mergedRegressions,
    snapshot: mergedSnapshot,
    description: mergedDescription,
    movementQuality,
    movementQualityDetail,
    movementPattern: mergedMovementPattern,
    jointStress: mergedJointStress,
    visualSequence: mergedVisualSequence,
    guideSupportLabel: exactVisuals ? "Exact visual sequence ready" : "Detailed text guide ready",
    bestFit: buildBestFitLabel(option, loweredName, equipment),
    trainingUse: mergedTrainingUse,
    setup,
    execution,
    breathing: override?.breathing || buildBreathingGuide(option, loweredName),
    tempo: override?.tempo || buildTempoGuide(option, loweredName),
    exactVisuals
  };
}

const STANDARD_GUIDE_STEP_TITLES = ["Start", "Mid", "Peak", "Finish"];

function normalizeGuideStepSequence(stepSequence) {
  if (!Array.isArray(stepSequence)) {
    return [];
  }

  return stepSequence.slice(0, 4).map((step, index) => ({
    ...step,
    title: STANDARD_GUIDE_STEP_TITLES[index]
  }));
}

function buildStructuredGuideFields({
  description,
  trainingUse,
  primaryMuscles = [],
  secondaryMuscles = [],
  setup,
  execution,
  stepSequence = [],
  breathing,
  tempo,
  commonMistakes = [],
  safetyNotes = [],
  adjustments = [],
  easierOptions = [],
  progressions = []
}) {
  return {
    whatThisExerciseIs: description,
    trainingUse,
    primaryMuscles,
    secondaryMuscles,
    setup,
    howToPerform: execution,
    stepByStep: stepSequence,
    breathing,
    tempo,
    commonMistakes,
    safetyNotes,
    modifications: {
      adjustments,
      easierOptions,
      progressions
    }
  };
}

function normalizeGuideEquipment(option) {
  const rawEquipment = Array.isArray(option.equipmentRequirements) && option.equipmentRequirements.length
    ? option.equipmentRequirements
    : [option.equipment].filter(Boolean);
  return rawEquipment.map((entry) => {
    if (entry === "bodyweight") return "Bodyweight";
    if (entry === "bands") return "Resistance band";
    if (entry === "machine") return "Machine or cable station";
    if (entry === "dumbbell") return "Dumbbells";
    if (entry === "barbell") return "Barbell";
    return String(entry || "").trim();
  });
}

function cardioStepSequence(start, mid, peak, finish) {
  return [
    { title: "Start", description: start },
    { title: "Mid", description: mid },
    { title: "Peak", description: peak },
    { title: "Finish", description: finish }
  ];
}

function createCardioOverride({
  equipment,
  primaryMuscles,
  secondaryMuscles,
  difficulty,
  jointStress = "moderate",
  movementPattern,
  trainingUse,
  description,
  setup,
  execution,
  breathing,
  tempo,
  stepSequence,
  commonMistakes,
  safetyNotes,
  modifications,
  cues
}) {
  return {
    category: "Conditioning",
    equipment,
    primaryMuscles,
    secondaryMuscles,
    difficulty,
    jointStress,
    movementPattern,
    trainingUse,
    description,
    setup,
    execution,
    breathing,
    tempo,
    stepSequence,
    commonMistakes,
    safetyNotes,
    modifications,
    regressions: modifications.slice(0, 2),
    progressions: modifications.slice(-2),
    cues
  };
}

const CARDIO_LIBRARY_CONTENT_OVERRIDES = {
  "butt kicks": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hip flexors", "Hamstrings", "Calves"],
    secondaryMuscles: ["Conditioning", "Core", "Glutes"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Running drill / posterior heel recovery",
    trainingUse: "Warm-up work, aerobic intervals, and running-mechanics conditioning with low complexity.",
    description: "Butt kicks are a cyclical running drill where the heels recover quickly toward the glutes while the torso stays tall and relaxed.",
    setup: "Stand tall with a light athletic stance, ribs stacked over the hips, and enough open space to cycle the feet quickly in place or over a short lane.",
    execution: "Alternate the feet quickly, bringing each heel up toward the glutes while staying light on the balls of the feet and keeping the arms moving in rhythm.",
    breathing: "Keep breathing short and rhythmic so the pace stays smooth instead of tense.",
    tempo: "Move at a fast but repeatable cadence that lets the heels recover cleanly each rep.",
    stepSequence: cardioStepSequence(
      "Set a tall stance, soften the knees slightly, and begin with quick light contacts under the hips.",
      "Cycle one heel toward the glute while the opposite foot lands softly and the torso stays stacked.",
      "Reach the fastest repeatable rhythm you can maintain without leaning forward or stomping.",
      "Ease the speed down under control and reset posture before the next interval."
    ),
    commonMistakes: ["Leaning too far forward", "Kicking backward instead of recovering the heel up", "Landing heavily through the whole foot", "Letting the knees collapse inward as speed rises"],
    safetyNotes: ["Use a march version first if impact tolerance is limited.", "Stop the interval if calf or hamstring tension rises sharply."],
    modifications: ["Marching butt kicks", "Shorter work intervals", "Reduced pace with smaller heel recovery"],
    cues: ["Stay tall", "Heels recover quickly", "Keep the contacts light"]
  }),
  "shadow boxing": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Conditioning", "Shoulders", "Core"],
    secondaryMuscles: ["Calves", "Glutes", "Obliques"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Striking rhythm / locomotor conditioning",
    trainingUse: "Conditioning blocks, coordination work, and low-load upper-body cardio with footwork.",
    description: "Shadow boxing is a continuous striking drill performed without impact. It blends footwork, trunk rotation, and light upper-body output into a repeatable cardio interval.",
    setup: "Stand in a staggered fighting stance with the hands up, elbows relaxed, and enough room around you to pivot and step without crowding the space.",
    execution: "Throw light crisp punches while shifting the feet, rotating through the trunk, and keeping the shoulders loose rather than muscling every strike.",
    breathing: "Exhale lightly on combinations and return to steady nasal or relaxed mouth breathing between bursts.",
    tempo: "Keep the pace lively and smooth instead of throwing every punch at full power.",
    stepSequence: cardioStepSequence(
      "Set a staggered stance, bring the hands up, and organize your balance over the middle of both feet.",
      "Start with light jabs and crosses while the feet stay active and the shoulders remain relaxed.",
      "Add sharper combinations and small pivots without losing trunk control or stance position.",
      "Flow back to a calmer rhythm and reset before the next round or combination block."
    ),
    commonMistakes: ["Punching with locked elbows", "Standing flat-footed", "Over-rotating the low back instead of the trunk", "Holding the breath during combinations"],
    safetyNotes: ["Keep the punching force moderate so the shoulders and elbows stay comfortable.", "Use shorter rounds if neck or shoulder tension builds."],
    modifications: ["Hands-only punches from a fixed stance", "Lower-tempo footwork", "Shorter combination rounds"],
    cues: ["Hands stay relaxed", "Feet stay alive", "Rotate through the trunk"]
  }),
  "lateral shuffles": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Glutes", "Adductors", "Conditioning"],
    secondaryMuscles: ["Quadriceps", "Calves", "Core"],
    difficulty: "beginner",
    jointStress: "moderate",
    movementPattern: "Lateral locomotion",
    trainingUse: "Court-style conditioning, frontal-plane movement prep, and athletic footwork intervals.",
    description: "Lateral shuffles are side-to-side locomotion drills that train quick foot placement, hip control, and repeatable conditioning in the frontal plane.",
    setup: "Start in a soft athletic stance with the hips back slightly, chest tall, and enough space to move several steps left and right without crossing the feet.",
    execution: "Push off the trail leg, shuffle laterally with quick controlled steps, and keep the feet under the hips while the torso stays level.",
    breathing: "Use steady breaths that match the rhythm of the side-to-side work.",
    tempo: "Move quickly enough to stay athletic, but never so fast that the feet start crossing or the hips bob wildly.",
    stepSequence: cardioStepSequence(
      "Set the athletic stance with knees soft, hips loaded lightly, and hands ready to counterbalance.",
      "Drive sideways with the trail leg and take quick shuffle steps while keeping the feet separated.",
      "Hit the fastest clean lateral rhythm you can manage without crossing the feet or standing upright.",
      "Decelerate under control, reset the stance, and change direction cleanly."
    ),
    commonMistakes: ["Crossing the feet", "Standing too tall", "Letting the knees cave inward", "Slamming into each change of direction"],
    safetyNotes: ["Shorten the travel distance if adductors or knees feel stressed.", "Use a grippy surface so lateral push-offs stay controlled."],
    modifications: ["Short shuffle distance", "Reduced speed", "Step-and-hold lateral pattern"],
    cues: ["Stay low", "Feet stay apart", "Push then glide"]
  }),
  "forward-backward sprints": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Conditioning", "Quadriceps", "Calves"],
    secondaryMuscles: ["Glutes", "Core", "Hamstrings"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Acceleration / deceleration conditioning",
    trainingUse: "Short anaerobic intervals, agility conditioning, and deceleration practice in a simple lane.",
    description: "Forward-backward sprints combine quick accelerations with controlled backward recovery steps or backpedals, building conditioning and change-of-direction control.",
    setup: "Mark a short lane, stand tall at one end, and make sure the surface is clear enough for both acceleration and backward travel.",
    execution: "Sprint forward with quick powerful steps, decelerate under control, and transition into a backward run or fast backpedal without losing posture.",
    breathing: "Use strong quick breaths during each burst and recover fully enough to keep the next change of direction sharp.",
    tempo: "Accelerate fast, decelerate under control, and make the backward section smooth rather than panicked.",
    stepSequence: cardioStepSequence(
      "Set at the start of the lane with a slight forward lean and arms ready to drive.",
      "Accelerate forward over the first few steps while staying stacked through the trunk.",
      "Brake cleanly at the end of the lane and transition into a controlled backward sprint or backpedal.",
      "Return to the start with quick feet, regain balance, and reset before the next rep."
    ),
    commonMistakes: ["Overstriding into the stop", "Losing balance during the backward transition", "Looking down instead of staying aware of space", "Letting the torso collapse as fatigue rises"],
    safetyNotes: ["Use a short lane until deceleration is comfortable.", "Skip the backward sprint if you cannot keep the path clear and safe."],
    modifications: ["Fast forward walk plus controlled backpedal", "Shorter lane", "Lower sprint intensity"],
    cues: ["Accelerate smoothly", "Brake under control", "Stay aware during the backpedal"]
  }),
  "treadmill walk": createCardioOverride({
    equipment: ["Treadmill"],
    primaryMuscles: ["Conditioning", "Calves", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Quadriceps"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Steady-state walk",
    trainingUse: "Low-impact aerobic work, recovery cardio, and foundational conditioning sessions.",
    description: "Treadmill walk is a steady-state cardio option that builds aerobic volume with minimal impact while reinforcing a clean gait pattern.",
    setup: "Set the treadmill speed to a pace that lets you walk naturally with the hands free or only lightly touching the rails if needed.",
    execution: "Walk with purposeful steps, let the arms swing naturally, and keep the body stacked instead of leaning onto the handles.",
    breathing: "Settle into calm rhythmic breathing that you can sustain for the full interval.",
    tempo: "Use an even cadence that stays smooth from the first minute through the last.",
    stepSequence: cardioStepSequence(
      "Step onto the moving belt only once the speed is set low enough to establish a stable stride.",
      "Settle into a natural walking rhythm with full-foot pressure and relaxed arm swing.",
      "Own the middle of the interval with steady posture and repeatable cadence instead of drifting on the handles.",
      "Reduce the speed gradually and step off only when the belt is safe and your balance is steady."
    ),
    commonMistakes: ["Hanging on the rails", "Taking overly long steps", "Looking down the whole time", "Letting posture collapse as the minutes add up"],
    safetyNotes: ["Keep one hand available for safety if you are still getting used to the treadmill.", "Reduce the pace if shin, knee, or hip irritation builds."],
    modifications: ["Shorter walking interval", "Lower speed", "Flat-ground walking instead of treadmill work"],
    cues: ["Walk tall", "Hands off when possible", "Keep the stride smooth"]
  }),
  "treadmill run": createCardioOverride({
    equipment: ["Treadmill"],
    primaryMuscles: ["Conditioning", "Calves", "Hip flexors"],
    secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Steady or interval running",
    trainingUse: "Cardio intervals, aerobic development, and repeatable indoor run training.",
    description: "Treadmill run is a cyclical running option that lets you control pace precisely for intervals or steady conditioning work.",
    setup: "Choose a pace you can run with good posture, set the belt before stepping on, and leave enough headroom in speed so you do not need to overstride.",
    execution: "Run with a light forward lean from the ankles, quick feet under the body, and relaxed arm swing while the trunk stays stacked.",
    breathing: "Use repeatable rhythmic breathing that matches the pace and keeps the shoulders relaxed.",
    tempo: "Run at the planned pace instead of drifting faster and losing your stride quality.",
    stepSequence: cardioStepSequence(
      "Start at a controlled pace and establish your stride before building to the target run speed.",
      "Settle into a smooth cadence with the feet landing under the body and the arms swinging naturally.",
      "Hold the target effort without overstriding, bouncing excessively, or gripping the treadmill rails.",
      "Bring the speed down in stages and recover walking before stepping off the belt."
    ),
    commonMistakes: ["Overstriding in front of the body", "Clenching the shoulders and hands", "Leaning on the rails", "Starting too fast to sustain the interval"],
    safetyNotes: ["Use a pace you can step down from safely if fatigue spikes.", "Stop the interval if the stride becomes noisy and uncontrolled."],
    modifications: ["Run-walk intervals", "Lower pace", "Incline walk instead of running"],
    cues: ["Quick feet", "Relax the shoulders", "Run under control"]
  }),
  "stationary bike": createCardioOverride({
    equipment: ["Stationary bike"],
    primaryMuscles: ["Conditioning", "Quadriceps", "Glutes"],
    secondaryMuscles: ["Calves", "Hamstrings", "Core"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Cyclical seated cardio",
    trainingUse: "Low-impact aerobic work, beginner conditioning, and recovery-friendly interval sessions.",
    description: "Stationary bike is a low-impact cardio option that builds aerobic work capacity through steady or interval-based pedaling.",
    setup: "Set the saddle height so the knee stays softly bent at the bottom of the stroke and choose a resistance that lets you pedal smoothly.",
    execution: "Pedal with an even circular rhythm, keep light tension through the trunk, and avoid mashing the pedals with your upper body rocking around.",
    breathing: "Keep breathing steady and relaxed so the pedal rhythm stays smooth.",
    tempo: "Choose a cadence you can maintain cleanly instead of grinding a resistance that kills rhythm.",
    stepSequence: cardioStepSequence(
      "Set the seat and resistance, clip in or place the feet securely, and begin pedaling at an easy rhythm.",
      "Build toward the target cadence while the torso stays quiet and the hands stay light.",
      "Own the middle of the interval with even pedal strokes and consistent lower-body pressure.",
      "Reduce resistance or cadence gradually and spin down before stopping the bike."
    ),
    commonMistakes: ["Seat too low or too high", "Pushing too hard against excessive resistance", "Rocking the torso side to side", "Death-gripping the handlebars"],
    safetyNotes: ["Adjust the saddle before the interval so the knees track comfortably.", "Back the resistance off if your pedal stroke starts to grind."],
    modifications: ["Shorter interval", "Lower resistance", "Easy recovery spin"],
    cues: ["Smooth circles", "Hands stay light", "Let cadence do the work"]
  }),
  "elliptical trainer": createCardioOverride({
    equipment: ["Elliptical trainer"],
    primaryMuscles: ["Conditioning", "Glutes", "Quadriceps"],
    secondaryMuscles: ["Calves", "Hamstrings", "Shoulders"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Gliding machine cardio",
    trainingUse: "Low-impact conditioning, return-to-cardio work, and full-body steady-state intervals.",
    description: "Elliptical trainer work builds conditioning with a gliding lower-body pattern that keeps impact low while still allowing meaningful output.",
    setup: "Step onto the machine once the pedals are stable, set an appropriate resistance, and stand tall with a light grip on the handles.",
    execution: "Drive the pedals in a smooth cycle, let the handles move naturally if you use them, and keep the torso stacked instead of leaning heavily forward.",
    breathing: "Match your breathing to the glide rhythm so effort stays smooth rather than choppy.",
    tempo: "Keep the pedal rhythm continuous and even from start to finish.",
    stepSequence: cardioStepSequence(
      "Step onto the pedals carefully, establish balance, and begin at a controlled glide.",
      "Settle into a smooth stride while the feet stay connected and the torso remains tall.",
      "Hold the target effort with repeatable tempo and no heavy collapse into the handles.",
      "Lower the resistance or pace gradually and let the pedals slow before stepping off."
    ),
    commonMistakes: ["Leaning heavily on the handles", "Taking short choppy strides", "Letting the knees drift inward", "Starting with too much resistance"],
    safetyNotes: ["Keep a light hold until balance on the machine feels automatic.", "Reduce resistance if the stride stops feeling fluid."],
    modifications: ["Shorter steady interval", "Lower resistance", "Handle-assisted easy pace"],
    cues: ["Stay tall", "Glide smoothly", "Hands stay light"]
  }),
  "stair climber": createCardioOverride({
    equipment: ["Stair climber"],
    primaryMuscles: ["Conditioning", "Glutes", "Quadriceps"],
    secondaryMuscles: ["Calves", "Hamstrings", "Core"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Step-cycle cardio",
    trainingUse: "Lower-body conditioning, glute-focused aerobic work, and short machine intervals with strong leg drive.",
    description: "Stair climber intervals use a repeated step pattern to raise the heart rate while challenging the legs through continuous loaded stepping.",
    setup: "Step onto the machine carefully, set a pace you can manage upright, and hold the rails only lightly enough to steady yourself if needed.",
    execution: "Drive each step through the full foot, keep the torso stacked over the hips, and let the machine rhythm stay consistent rather than surging every few steps.",
    breathing: "Use steady breaths that help you stay upright instead of folding over the console.",
    tempo: "Keep a repeatable step rhythm and avoid speeding up so much that each step gets short and sloppy.",
    stepSequence: cardioStepSequence(
      "Begin at a manageable pace and set upright posture before the intensity rises.",
      "Settle into a repeatable stepping rhythm with even pressure through each foot.",
      "Hold the strongest effort you can manage while still keeping tall posture and full steps.",
      "Step the pace down gradually and exit only once the pedals are stable and slow."
    ),
    commonMistakes: ["Leaning hard on the rails", "Taking tiny half steps", "Letting the trunk fold forward", "Choosing a pace that kills posture immediately"],
    safetyNotes: ["Use the rails for balance, not to offload your bodyweight through the whole interval.", "Drop the pace if the knees start to feel overloaded."],
    modifications: ["Lower speed", "Shorter intervals", "Treadmill incline walk instead"],
    cues: ["Full steps", "Stand tall", "Do not hang on the rails"]
  }),
  "box step-up cardio": createCardioOverride({
    equipment: ["Low box or bench"],
    primaryMuscles: ["Conditioning", "Quadriceps", "Glutes"],
    secondaryMuscles: ["Calves", "Hamstrings", "Core"],
    difficulty: "beginner",
    jointStress: "moderate",
    movementPattern: "Alternating step pattern",
    trainingUse: "Low-skill cardio intervals, lower-body endurance, and step-based conditioning at home or in the gym.",
    description: "Box step-up cardio uses repeated alternating step-ups on a low platform to build heart rate and leg endurance without complex coordination.",
    setup: "Choose a stable box or bench height you can step onto without needing to jump or twist the hips to get there.",
    execution: "Step up with one foot, drive through the platform, and alternate sides while keeping the torso tall and the pace smooth.",
    breathing: "Use steady breaths that let you keep the stepping rhythm consistent.",
    tempo: "Move continuously, but only as fast as you can place each foot cleanly on and off the platform.",
    stepSequence: cardioStepSequence(
      "Stand close to the box, brace lightly, and plant one foot fully on the step.",
      "Drive up through the lead leg and bring the second foot through under control.",
      "Set the fastest repeatable alternating step rhythm you can manage without stomping or twisting.",
      "Step down softly, reset your stance, and continue or end the interval under control."
    ),
    commonMistakes: ["Using a box that is too high", "Pushing mainly off the trailing leg", "Twisting the hips on the box", "Landing heavily on the way down"],
    safetyNotes: ["Lower the step height if knee control or balance fades.", "Keep the box stable and clear of clutter before starting."],
    modifications: ["Lower box height", "Slow alternating step-up", "March in place instead of stepping"],
    cues: ["Whole foot on the box", "Stand through the lead leg", "Step down softly"]
  }),
  "fast feet drill": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Conditioning", "Calves", "Hip flexors"],
    secondaryMuscles: ["Core", "Quadriceps", "Glutes"],
    difficulty: "beginner",
    jointStress: "low",
    movementPattern: "Rapid foot turnover",
    trainingUse: "Short conditioning bursts, warm-up acceleration work, and coordination-heavy foot-speed drills.",
    description: "Fast feet drill uses very short quick contacts in place to raise heart rate while training foot speed and elastic rhythm.",
    setup: "Stand in a narrow athletic stance with knees soft, arms ready to move, and enough space around you to work at high cadence safely.",
    execution: "Tap the feet rapidly under the hips, keep the contacts small, and let the arms move naturally while the torso stays tall and quiet.",
    breathing: "Keep the breath quick but steady so tension does not climb into the neck and shoulders.",
    tempo: "Aim for the fastest clean turnover you can maintain while the feet stay underneath you.",
    stepSequence: cardioStepSequence(
      "Set the athletic stance with weight centered and heels barely brushing the floor.",
      "Start rapid low-amplitude foot contacts while the arms move in sync with the rhythm.",
      "Reach your fastest repeatable cadence without bouncing high or drifting forward.",
      "Ease the speed down smoothly and re-center before the next burst."
    ),
    commonMistakes: ["Bouncing too high", "Letting the feet drift forward", "Tensing the shoulders", "Turning the drill into noisy stomping"],
    safetyNotes: ["Use shorter intervals if calves fatigue faster than your cardio does.", "Stay on a surface that gives you enough grip for quick contacts."],
    modifications: ["Slower cadence", "Marching fast feet", "Shorter work intervals"],
    cues: ["Tiny contacts", "Stay tall", "Quick but quiet"]
  }),
  "agility ladder in-out": createCardioOverride({
    equipment: ["Agility ladder"],
    primaryMuscles: ["Conditioning", "Calves", "Hip flexors"],
    secondaryMuscles: ["Glutes", "Adductors", "Core"],
    difficulty: "intermediate",
    jointStress: "low",
    movementPattern: "Footwork ladder drill",
    trainingUse: "Agility conditioning, rhythm work, and low-load coordination intervals using a simple ladder pattern.",
    description: "Agility ladder in-out is a footwork drill where the feet step in and out of each ladder square in a repeating rhythm that challenges coordination and conditioning.",
    setup: "Lay the ladder flat, stand at one end in an athletic stance, and look ahead enough to read the lane without staring straight down every step.",
    execution: "Step into the ladder square and back out in the planned pattern while the arms help rhythm and the torso stays centered over the feet.",
    breathing: "Use calm rhythmic breaths so the ladder pattern stays quick and crisp.",
    tempo: "Move quickly, but only as fast as you can place the feet cleanly in each square.",
    stepSequence: cardioStepSequence(
      "Set the first stance just before the ladder with knees soft and eyes scanning a few rungs ahead.",
      "Step into and out of the first squares with quick precise contacts and quiet hips.",
      "Build to the fastest clean in-out rhythm you can hold without clipping the ladder.",
      "Run out through the final rung, decelerate cleanly, and reset before the next pass."
    ),
    commonMistakes: ["Looking straight down the whole time", "Clipping the ladder because the pace is too high", "Crossing the feet unintentionally", "Letting the torso sway side to side"],
    safetyNotes: ["Slow down before accuracy disappears.", "Use a flat surface so the ladder does not bunch or slide."],
    modifications: ["Walk the pattern first", "Shorter ladder pass", "Single-step in-out rhythm"],
    cues: ["Eyes ahead", "Fast accurate feet", "Quiet hips"]
  }),
  "agility ladder lateral": createCardioOverride({
    equipment: ["Agility ladder"],
    primaryMuscles: ["Conditioning", "Glutes", "Adductors"],
    secondaryMuscles: ["Calves", "Quadriceps", "Core"],
    difficulty: "intermediate",
    jointStress: "low",
    movementPattern: "Lateral ladder footwork",
    trainingUse: "Side-to-side conditioning, coordination work, and frontal-plane foot speed.",
    description: "Agility ladder lateral work uses repeated side-facing steps through the ladder to build conditioning and directional foot control.",
    setup: "Stand sideways to the ladder in a soft athletic stance with enough room to shuffle through the full lane.",
    execution: "Move laterally through each rung with quick precise steps, keeping the feet organized and the torso tall instead of twisting across the ladder.",
    breathing: "Keep the breathing rhythmic so the feet stay light and organized.",
    tempo: "Move quickly through the rungs while still placing every step cleanly.",
    stepSequence: cardioStepSequence(
      "Set the side-facing stance at the first rung with knees soft and the hips loaded lightly.",
      "Step through the first few rungs laterally with clean foot placement and even rhythm.",
      "Maintain the fastest side-facing cadence you can own without crossing awkwardly or clipping the ladder.",
      "Exit the final rung, decelerate cleanly, and reset before heading back the other way."
    ),
    commonMistakes: ["Crossing the feet when the pattern should stay lateral", "Standing too upright", "Clipping the ladder with the trailing foot", "Rotating the shoulders wildly instead of staying organized"],
    safetyNotes: ["Practice the pattern slowly before adding speed.", "Reduce the length of the ladder pass if hips or calves fatigue quickly."],
    modifications: ["Shorter ladder segment", "Walk-through pace", "Simple two-feet-per-square pattern"],
    cues: ["Stay organized", "Move laterally", "Feet stay precise"]
  }),
  "cone drill zigzag": createCardioOverride({
    equipment: ["Cones or markers"],
    primaryMuscles: ["Conditioning", "Glutes", "Calves"],
    secondaryMuscles: ["Quadriceps", "Adductors", "Core"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Zigzag change of direction",
    trainingUse: "Agility conditioning, directional change work, and short repeat sprint intervals.",
    description: "Cone drill zigzag uses angled cuts around markers to build cardio output while teaching better control into and out of direction changes.",
    setup: "Set the cones in a zigzag pattern with enough spacing to run and cut without crowding each marker.",
    execution: "Accelerate toward each cone, plant cleanly, and redirect the body around the angle while keeping the trunk braced and the feet underneath you.",
    breathing: "Use strong quick breaths through the cuts and recover fully enough to keep the next run sharp.",
    tempo: "Accelerate hard between cones, but brake early enough to cut cleanly instead of sliding through each turn.",
    stepSequence: cardioStepSequence(
      "Start at the first cone in an athletic stance with eyes up and the first line clear.",
      "Accelerate toward the next marker and lower enough to prepare for the cut.",
      "Plant and redirect around the cone with the hips and torso staying under control.",
      "Finish the final line cleanly, decelerate, and reset before the next zigzag pass."
    ),
    commonMistakes: ["Waiting too long to brake into the cone", "Standing tall through the cuts", "Letting the knee collapse inward on the plant", "Looking only at the feet instead of the next cone"],
    safetyNotes: ["Use wider cone spacing until change-of-direction mechanics feel solid.", "Reduce speed if the cuts stop feeling clean and controlled."],
    modifications: ["Walk-jog through the cones", "Fewer cones", "Wider turning angles"],
    cues: ["Brake before you cut", "Eyes to the next cone", "Push out of the plant"]
  }),
  "shuttle run": createCardioOverride({
    equipment: ["Open lane"],
    primaryMuscles: ["Conditioning", "Quadriceps", "Calves"],
    secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Repeated acceleration and turn",
    trainingUse: "Anaerobic intervals, field-style conditioning, and repeat acceleration training.",
    description: "Shuttle run uses repeated accelerations between two points with quick turns, making it a simple but demanding conditioning drill.",
    setup: "Mark two clear turnaround points with enough traction and space to accelerate and decelerate safely.",
    execution: "Sprint to the far line, plant under control, turn quickly, and drive back to the start while keeping the torso organized.",
    breathing: "Use sharp recovery breaths during the turn and keep the trunk from tensing up between efforts.",
    tempo: "Run each segment fast, but keep the turn controlled enough that you can push hard out of it.",
    stepSequence: cardioStepSequence(
      "Start at one end of the lane in an athletic stance with weight ready to drive forward.",
      "Accelerate to the far marker with quick powerful steps and a stable trunk.",
      "Brake into the turn, plant cleanly, and reverse direction without drifting upright.",
      "Sprint back through the start line, decelerate safely, and reset for the next rep."
    ),
    commonMistakes: ["Sliding into the turn", "Reaching too far with the plant foot", "Popping upright before re-accelerating", "Running too long a lane for the quality you can keep"],
    safetyNotes: ["Choose a lane length you can turn on cleanly.", "Cut the set short if deceleration quality drops fast."],
    modifications: ["Shorter shuttle distance", "Jog the return", "Reduce total reps"],
    cues: ["Accelerate hard", "Turn cleanly", "Re-accelerate out of the plant"]
  }),
  "split jump lunge": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Quadriceps", "Glutes", "Conditioning"],
    secondaryMuscles: ["Calves", "Hamstrings", "Core"],
    difficulty: "advanced",
    jointStress: "high",
    movementPattern: "Alternating split-jump plyometric",
    trainingUse: "Higher-intensity conditioning, lower-body power endurance, and athletic repeat-effort work.",
    description: "Split jump lunge alternates the legs in the air from a split stance, turning a lunge pattern into a demanding cardio and power-endurance drill.",
    setup: "Start in a stable split stance with enough room overhead and around you to jump and switch legs safely.",
    execution: "Lower into a controlled split stance, jump explosively, switch the legs in the air, and land softly into the opposite split stance before repeating.",
    breathing: "Use quick exhalations on the jumps and reset your breathing during the landing rhythm.",
    tempo: "Keep the jump crisp and reactive, but only if each landing stays quiet and balanced.",
    stepSequence: cardioStepSequence(
      "Set the split stance, brace lightly, and lower enough to preload the legs for the first jump.",
      "Drive through the floor and switch the legs in the air while the torso stays tall.",
      "Land softly in the opposite split stance and absorb the impact under control.",
      "Rebound only if the landing stays clean; otherwise reset and take the next rep with control."
    ),
    commonMistakes: ["Crashing onto the front foot", "Letting the knee cave inward on landing", "Losing balance in the air switch", "Trying to move faster than you can land safely"],
    safetyNotes: ["Use reverse lunges or split squats first if impact tolerance is not solid.", "Stop the set if landings get noisy or the trunk starts folding forward."],
    modifications: ["Alternating reverse lunge", "Split squat cardio reps", "Low pogo split switches"],
    cues: ["Land softly", "Switch cleanly", "Own each split stance"]
  }),
  "bear crawl cardio": createCardioOverride({
    equipment: ["Bodyweight"],
    primaryMuscles: ["Conditioning", "Shoulders", "Core"],
    secondaryMuscles: ["Hip flexors", "Quadriceps", "Glutes"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Quadruped crawl",
    trainingUse: "Crawl-based conditioning, shoulder endurance, and trunk-stable locomotion intervals.",
    description: "Bear crawl cardio uses a low quadruped position to challenge conditioning while the shoulders and trunk stabilize continuous contralateral movement.",
    setup: "Set up on hands and feet with knees hovering just off the floor, spine long, and enough open space to crawl forward for several controlled steps.",
    execution: "Move opposite hand and foot together in small deliberate steps while keeping the hips level and the shoulders active.",
    breathing: "Use short steady breaths so the trunk stays braced without becoming rigid.",
    tempo: "Crawl at a pace that raises the heart rate without letting the hips bounce high or the steps get sloppy.",
    stepSequence: cardioStepSequence(
      "Lift the knees just off the floor and set a long neutral spine with hands under shoulders.",
      "Begin crawling forward with small opposite-limb steps while the hips stay level.",
      "Hold the strongest repeatable crawl pace you can manage without losing trunk control.",
      "Slow the crawl down under control, lower the knees, and reset before the next interval."
    ),
    commonMistakes: ["Hips rising too high", "Taking giant steps that twist the torso", "Shrugging into the neck", "Holding the breath during the crawl"],
    safetyNotes: ["Reduce distance if wrists or shoulders start to fatigue before the cardio goal is met.", "Use a softer surface if hands or toes need a little more comfort."],
    modifications: ["Short crawl distance", "Bear crawl hold with shoulder taps", "High plank march"],
    cues: ["Small steps", "Hips stay level", "Push the floor away"]
  }),
  "jump rope double unders": createCardioOverride({
    equipment: ["Jump rope"],
    primaryMuscles: ["Conditioning", "Calves", "Shoulders"],
    secondaryMuscles: ["Core", "Forearms", "Hip flexors"],
    difficulty: "advanced",
    jointStress: "moderate",
    movementPattern: "Reactive jump rope pattern",
    trainingUse: "Advanced conditioning, elastic lower-leg endurance, and higher-skill rope intervals.",
    description: "Jump rope double unders require the rope to pass twice under the feet in one jump, demanding rhythm, timing, and reactive stiffness.",
    setup: "Set the rope length correctly, stand tall with elbows close to the ribs, and start with enough space to swing the rope freely.",
    execution: "Jump once with enough height and tight body position to let the rope pass twice, turning the rope from the wrists rather than the shoulders.",
    breathing: "Stay relaxed enough to breathe rhythmically instead of bracing hard against every jump.",
    tempo: "Keep the rope fast and compact while the jumps stay springy and efficient.",
    stepSequence: cardioStepSequence(
      "Set posture tall with the rope ready and establish a clean single-under rhythm first.",
      "Jump slightly higher and speed the wrists up so the rope can clear twice under one jump.",
      "Hold the strongest repeatable double-under rhythm you can manage without excessive piking or heel kickback.",
      "Break the set as soon as timing slips badly, reset the rope, and restart with control."
    ),
    commonMistakes: ["Swinging from the shoulders", "Tucking the knees excessively", "Jumping too high and losing rhythm", "Letting missed reps turn into rushed flailing"],
    safetyNotes: ["Build this from solid single-under rhythm first.", "Use shorter rounds if calves or Achilles tissues are not conditioned for repeated contacts yet."],
    modifications: ["Single-under jump rope", "Alternating single-single-double practice", "Low-volume double-under sets"],
    cues: ["Wrists stay fast", "Jump compactly", "Keep the rhythm tight"]
  }),
  "battle rope slams": createCardioOverride({
    equipment: ["Battle ropes"],
    primaryMuscles: ["Conditioning", "Lats", "Core"],
    secondaryMuscles: ["Shoulders", "Glutes", "Quadriceps"],
    difficulty: "intermediate",
    jointStress: "moderate",
    movementPattern: "Explosive rope slam",
    trainingUse: "Short power-conditioning bursts, trunk-braced upper-body output, and aggressive but controlled intervals.",
    description: "Battle rope slams combine a fast overhead lift with a sharp downward strike, producing a powerful cardio interval that also trains full-body coordination.",
    setup: "Stand in an athletic stance holding one rope end in each hand, with enough distance from the anchor for visible rope movement.",
    execution: "Lift the hands overhead with the trunk braced, then slam the ropes down hard by driving the arms and torso together while keeping the knees soft.",
    breathing: "Exhale sharply on each slam and take quick recovery breaths between waves of effort.",
    tempo: "Attack each slam hard, then reset just enough to make the next rep crisp instead of muscling a slow rope drop.",
    stepSequence: cardioStepSequence(
      "Set the athletic stance, grip the rope ends firmly, and brace before the first overhead lift.",
      "Raise the ropes overhead while the ribs stay stacked and the hips stay loaded.",
      "Drive the ropes down explosively, using the trunk and arms together to create a sharp slam.",
      "Recoil into the next rep under control and stop the set before posture collapses."
    ),
    commonMistakes: ["Arching the low back overhead", "Slamming with straight locked knees", "Letting the ropes drift with no clear finish", "Using only the arms with no trunk control"],
    safetyNotes: ["Keep enough room from the anchor so the ropes can move freely.", "Back off if low-back fatigue replaces powerful trunk bracing."],
    modifications: ["Alternating battle rope waves", "Half-kneeling rope slams", "Shorter slam intervals"],
    cues: ["Brace before the lift", "Slam with the whole body", "Reset each rep cleanly"]
  })
};

const EXERCISE_LIBRARY_CONTENT_OVERRIDES = {
  ...CARDIO_LIBRARY_CONTENT_OVERRIDES,
  "goblet squat": {
    category: "Legs",
    equipment: ["Dumbbell or kettlebell"],
    primaryMuscles: ["Quadriceps", "Glutes", "Adductors"],
    secondaryMuscles: ["Core", "Upper back", "Calves"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Squat",
    trainingUse: "Lower-body strength, squat pattern development, core bracing, joint-friendly leg training",
    description:
      "The goblet squat is a squat variation where one dumbbell or kettlebell is held at chest height. It trains the legs while encouraging an upright torso, strong bracing, and controlled knee tracking.",
    setup:
      "Hold one dumbbell vertically or one kettlebell close to your chest. Keep elbows slightly tucked, ribs stacked over hips, feet about shoulder-width apart, and toes turned slightly out if comfortable.",
    execution:
      "Brace your core, bend at the knees and hips, and sit down between your legs. Keep the chest tall, knees tracking in line with the toes, and weight balanced through the mid-foot. Drive through the floor to stand tall without leaning back.",
    breathing: "Inhale and brace before lowering. Exhale as you drive back to standing.",
    tempo: "Lower for 2–3 seconds, pause briefly with control if needed, then stand with steady power.",
    stepSequence: [
      { title: "Start", description: "Hold the weight close to your chest, set your feet, brace your core, and keep your torso tall." },
      { title: "Mid", description: "Lower by bending knees and hips together, allowing the knees to track over the toes while the hips sit down between the legs." },
      { title: "Peak", description: "Reach the bottom position you can control while keeping heels grounded, chest lifted, and the weight close." },
      { title: "Finish", description: "Drive through the mid-foot, extend hips and knees together, and finish standing tall without over-arching your back." }
    ],
    commonMistakes: [
      "Letting the weight drift away from the chest",
      "Collapsing knees inward",
      "Rounding the back at the bottom",
      "Rising onto the toes",
      "Turning the movement into a forward lean instead of a squat"
    ],
    safetyNotes: [
      "Use a range of motion you can control without knee collapse or back rounding.",
      "Keep the weight close to reduce strain on the lower back.",
      "Start lighter if depth or balance is inconsistent."
    ],
    modifications: ["Use a box or bench target to control depth, or reduce range of motion until the squat pattern is stable."],
    progressions: ["Use a heavier dumbbell or kettlebell", "Add a pause at the bottom", "Progress toward front squat variations"],
    regressions: ["Bodyweight squat", "Box squat", "Supported squat"],
    cues: ["Keep the weight close", "Knees track with toes", "Stand tall through the finish"]
  },
  "bodyweight squat": {
    category: "Legs",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Calves"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Squat",
    trainingUse: "Squat pattern practice, warm-up, lower-body control, beginner leg training",
    description:
      "The bodyweight squat trains the basic squat pattern without external load. It helps build lower-body control, knee tracking, hip mobility, and confidence before adding weight.",
    setup:
      "Stand with feet about shoulder-width apart. Keep the ribs stacked over the hips, eyes forward, and arms in front of the body for balance if needed.",
    execution:
      "Brace lightly, bend at the knees and hips, and lower under control. Keep knees tracking with toes, heels grounded, and torso as tall as your mobility allows. Stand back up by pressing the floor away.",
    breathing: "Inhale before lowering. Exhale as you stand.",
    tempo: "Lower under control for 2 seconds, then stand smoothly.",
    stepSequence: [
      { title: "Start", description: "Stand tall with feet set, ribs stacked, and arms positioned for balance." },
      { title: "Mid", description: "Bend the knees and hips together, keeping the knees tracking in line with the toes." },
      { title: "Peak", description: "Reach a controlled bottom position with heels down and torso stable." },
      { title: "Finish", description: "Push through the floor and stand tall, keeping knees and hips aligned." }
    ],
    commonMistakes: [
      "Knees collapsing inward",
      "Heels lifting off the floor",
      "Dropping too fast",
      "Rounding the back",
      "Stopping short because of poor balance instead of controlled range"
    ],
    safetyNotes: [
      "Use a comfortable depth and avoid forcing range.",
      "Hold a stable surface if balance is limiting.",
      "Keep the movement controlled instead of bouncing at the bottom."
    ],
    modifications: ["Use a box squat target or hold onto a post or support for balance."],
    progressions: ["Add a pause", "Use a slower tempo", "Add a goblet load", "Progress to split squat patterns"],
    regressions: ["Supported squat", "High box squat"],
    cues: ["Whole foot stays grounded", "Knees and toes stay lined up", "Stand through the floor"]
  },
  "incline dumbbell press": {
    category: "Chest",
    equipment: ["Dumbbells", "Incline bench"],
    primaryMuscles: ["Upper chest", "Anterior deltoids", "Triceps"],
    secondaryMuscles: ["Serratus anterior", "Upper back stabilizers"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal push / incline press",
    trainingUse: "Upper-chest strength, pressing volume, shoulder-friendly chest training when controlled",
    description:
      "The incline dumbbell press is a chest press performed on an incline bench. It emphasizes the upper chest and front shoulders while allowing each arm to move independently.",
    setup:
      "Set the bench to a low-to-moderate incline. Sit with dumbbells on thighs, lie back, set shoulder blades gently back and down, and bring dumbbells to the upper chest line with wrists stacked over elbows.",
    execution:
      "Press the dumbbells upward and slightly inward without letting them crash together. Keep elbows angled below shoulder height, lower with control toward the upper chest, and maintain a stable ribcage.",
    breathing: "Inhale as the dumbbells lower. Exhale as you press.",
    tempo: "Lower for 2–3 seconds, press smoothly, and avoid bouncing out of the bottom.",
    stepSequence: [
      { title: "Start", description: "Lie on the incline bench with shoulder blades set, dumbbells near the upper chest, wrists stacked, and feet planted." },
      { title: "Mid", description: "Press the dumbbells upward with elbows tracking slightly below shoulder height." },
      { title: "Peak", description: "Reach the top with arms extended but not aggressively locked, keeping the dumbbells controlled and close to balanced." },
      { title: "Finish", description: "Lower the dumbbells back toward the upper chest line with control and repeat without losing shoulder position." }
    ],
    commonMistakes: [
      "Setting the bench too steep and turning it into a shoulder press",
      "Flaring elbows too wide",
      "Letting the lower back arch excessively",
      "Bouncing the dumbbells at the bottom",
      "Letting wrists bend backward"
    ],
    safetyNotes: [
      "Use a weight you can lower under control.",
      "Stop if shoulder pain or pinching occurs.",
      "Keep shoulder blades stable and avoid forcing extra depth."
    ],
    modifications: ["Use a lower incline, lighter dumbbells, or reduce range slightly if shoulders are sensitive."],
    progressions: ["Increase load", "Add controlled tempo", "Add paused reps"],
    regressions: ["Dumbbell floor press", "Push-up", "Machine chest press"],
    cues: ["Shoulder blades stay set", "Press on an upward path", "Keep the ribs quiet"]
  },
  "dumbbell floor press": {
    category: "Chest",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Upper back stabilizers", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Pressing strength, triceps emphasis, shoulder-friendly chest pressing, limited-range pressing",
    description:
      "The dumbbell floor press is a chest press performed lying on the floor. The floor limits shoulder extension, making it a useful shoulder-friendly pressing option.",
    setup:
      "Lie on your back with knees bent and feet flat. Hold dumbbells above the chest with wrists stacked over elbows. Set upper arms at a slight angle from the torso, not straight out at shoulder height.",
    execution:
      "Lower the dumbbells until the upper arms or triceps softly contact the floor. Pause briefly, then press back up while keeping wrists stacked and ribs controlled.",
    breathing: "Inhale as you lower. Exhale as you press up.",
    tempo: "Lower for 2 seconds, pause softly on the floor, press smoothly.",
    stepSequence: [
      { title: "Start", description: "Lie on the floor with dumbbells above the chest, knees bent, feet planted, and wrists stacked." },
      { title: "Mid", description: "Lower the dumbbells under control while elbows track slightly below shoulder height." },
      { title: "Peak", description: "Let the upper arms lightly touch the floor without relaxing tension or bouncing." },
      { title: "Finish", description: "Press the dumbbells back up over the chest while keeping ribs down and shoulders controlled." }
    ],
    commonMistakes: [
      "Slamming elbows into the floor",
      "Flaring elbows too wide",
      "Letting wrists bend backward",
      "Arching the ribs excessively",
      "Losing control at the bottom"
    ],
    safetyNotes: [
      "Lower softly; the floor is a range limiter, not a rebound point.",
      "Use manageable weight so you can control the bottom.",
      "Keep elbows at a comfortable angle."
    ],
    modifications: ["Use one dumbbell at a time or reduce range slightly."],
    progressions: ["Heavier dumbbells", "Paused reps", "Bench dumbbell press"],
    regressions: ["Push-up from elevated surface", "Light dumbbell press"],
    cues: ["Touch the floor softly", "Keep wrists stacked", "Press without rib flare"]
  },
  "push-up": {
    category: "Chest",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Core", "Serratus anterior"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Upper-body pressing strength, trunk control, bodyweight chest training",
    description:
      "The push-up is a bodyweight pressing exercise that trains the chest, shoulders, triceps, and core together. A good push-up keeps the body moving as one rigid unit.",
    setup:
      "Place hands slightly wider than shoulder-width, fingers spread, and feet extended behind you. Brace the core, squeeze glutes lightly, and keep the body in a straight line from head to heels.",
    execution:
      "Lower the chest toward the floor by bending the elbows. Keep elbows angled roughly 30–60 degrees from the torso. Press back up while maintaining a straight body line.",
    breathing: "Inhale as you lower. Exhale as you press up.",
    tempo: "Lower under control for 2 seconds, press smoothly.",
    stepSequence: [
      { title: "Start", description: "Set hands, brace the core, tighten glutes, and create a straight line from head to heels." },
      { title: "Mid", description: "Lower the chest with control while elbows track at a comfortable angle from the body." },
      { title: "Peak", description: "Reach the lowest controlled position without sagging hips or collapsing shoulders." },
      { title: "Finish", description: "Press the floor away and return to a strong plank position." }
    ],
    commonMistakes: [
      "Letting hips sag",
      "Flaring elbows straight out",
      "Cutting depth short without control",
      "Dropping the head",
      "Losing core tension"
    ],
    safetyNotes: [
      "Elevate hands if full push-ups cause shoulder, wrist, or low-back strain.",
      "Keep wrists comfortable and distribute pressure through the hands.",
      "Stop before form breaks."
    ],
    modifications: ["Incline push-up", "Knee push-up", "Hands-elevated push-up"],
    progressions: ["Deficit push-up", "Tempo push-up", "Paused push-up", "Close-grip variation"],
    regressions: ["Wall push-up", "Bench incline push-up"],
    cues: ["Move as one piece", "Elbows angle back", "Push the floor away"]
  },
  "deficit push-up": {
    category: "Chest",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Core", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Upper-body pressing strength, deeper pressing range, bodyweight chest training",
    description:
      "The deficit push-up is a push-up variation performed with the hands elevated on stable handles or blocks so the chest can travel through a deeper range of motion.",
    setup:
      "Place your hands on stable handles, plates, or dumbbells that create a deficit. Brace the core, squeeze the glutes lightly, and keep the body in a straight line from head to heels.",
    execution:
      "Lower the chest between the hands by bending the elbows under control. Keep elbows angled roughly 30–60 degrees from the torso, then press back up without losing trunk tension.",
    breathing: "Inhale as you lower. Exhale as you press up.",
    tempo: "Lower under control for 2 seconds, press smoothly.",
    stepSequence: [
      { title: "Start", description: "Set the hands on the deficit, brace the trunk, and create a straight line from head to heels." },
      { title: "Mid", description: "Lower the chest between the hands with control while elbows track at a comfortable angle." },
      { title: "Peak", description: "Reach the deepest controlled position you can hold without sagging the hips or dumping into the shoulders." },
      { title: "Finish", description: "Press the floor away and return to a strong plank without losing body tension." }
    ],
    commonMistakes: [
      "Dropping too deeply without control",
      "Letting the shoulders roll forward at the bottom",
      "Flaring elbows too wide",
      "Sagging through the hips",
      "Using unstable hand supports"
    ],
    safetyNotes: [
      "Only use a deficit depth you can control without shoulder pinching.",
      "Make sure the hand supports are secure and even.",
      "Stop before form or shoulder position breaks down."
    ],
    modifications: ["Use a smaller deficit", "Elevate the hands less", "Return to a standard push-up"],
    progressions: ["Pause in the bottom", "Add tempo", "Add load with a weighted vest"],
    regressions: ["Standard push-up", "Incline push-up"],
    cues: ["Own the deeper bottom", "Keep the shoulders packed", "Move as one rigid unit"]
  },
  "hammer curl": {
    category: "Biceps",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Brachialis", "Brachioradialis", "Biceps"],
    secondaryMuscles: ["Forearms"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Elbow flexion",
    trainingUse: "Arm strength, forearm development, elbow-flexor training",
    description:
      "The hammer curl is a dumbbell curl performed with a neutral grip. It emphasizes the brachialis and brachioradialis while also training the biceps.",
    setup:
      "Stand tall with a dumbbell in each hand, palms facing inward. Keep elbows close to the ribs, shoulders relaxed, wrists neutral, and core lightly braced.",
    execution:
      "Curl the dumbbells upward without swinging the torso. Keep palms facing each other and elbows mostly fixed. Lower under control until the arms are extended again.",
    breathing: "Exhale while curling up. Inhale while lowering.",
    tempo: "Curl for 1–2 seconds, lower for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand tall with dumbbells at your sides, palms facing inward, wrists neutral, and elbows close to the ribs." },
      { title: "Mid", description: "Curl the dumbbells upward while keeping the upper arms still and avoiding body swing." },
      { title: "Peak", description: "Reach the top with forearms close to vertical and biceps and forearms engaged without shrugging." },
      { title: "Finish", description: "Lower the dumbbells slowly to the starting position while keeping control through the forearms." }
    ],
    commonMistakes: [
      "Swinging the torso to lift the weight",
      "Letting elbows drift far forward",
      "Bending wrists",
      "Shrugging shoulders",
      "Dropping the dumbbells too quickly"
    ],
    safetyNotes: [
      "Use a load that does not require body momentum.",
      "Keep wrists neutral to reduce forearm and elbow irritation.",
      "Avoid forcing the top range if elbows feel pinched."
    ],
    modifications: ["Alternate arms", "Use lighter dumbbells", "Perform seated"],
    progressions: ["Heavier dumbbells", "Slow eccentric lowering", "Cross-body hammer curl"],
    regressions: ["Single-arm hammer curl", "Resistance-band curl"],
    cues: ["Neutral grip stays fixed", "Elbows stay pinned", "Lower slower than you lift"]
  },
  "arnold press": {
    category: "Shoulders",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Anterior deltoids", "Lateral deltoids"],
    secondaryMuscles: ["Triceps", "Upper chest", "Rotator cuff stabilizers"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Vertical push",
    trainingUse: "Shoulder strength, pressing control, deltoid development",
    description:
      "The Arnold press is a dumbbell shoulder press variation that rotates from a palms-in front rack position into an overhead press. It increases shoulder demand and requires controlled range.",
    setup:
      "Sit or stand tall with dumbbells in front of the shoulders, palms facing you. Brace your core, keep ribs down, and avoid leaning back.",
    execution:
      "Rotate the dumbbells outward as you press overhead. Finish with palms facing forward or slightly inward. Lower with control by reversing the path back to the front rack position.",
    breathing: "Inhale before pressing. Exhale as you press overhead.",
    tempo: "Press smoothly for 1–2 seconds, lower for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Hold dumbbells in front of your shoulders with palms facing you, elbows slightly forward, and torso braced." },
      { title: "Mid", description: "Begin pressing while rotating the palms outward, keeping the ribs controlled." },
      { title: "Peak", description: "Reach overhead with arms extended and shoulders stable without shrugging aggressively." },
      { title: "Finish", description: "Lower by reversing the rotation back to the front rack position with control." }
    ],
    commonMistakes: [
      "Leaning back to force the press",
      "Rotating too aggressively",
      "Shrugging at the top",
      "Lowering too fast",
      "Pressing through shoulder pain"
    ],
    safetyNotes: [
      "Use lighter weights than a standard shoulder press at first.",
      "Keep the range pain-free and controlled.",
      "Avoid if the rotation causes shoulder pinching."
    ],
    modifications: ["Perform seated", "Reduce range", "Use standard dumbbell shoulder press"],
    progressions: ["Add load gradually", "Slow the lowering", "Use alternating Arnold presses"],
    regressions: ["Dumbbell shoulder press", "Landmine-style press if available"],
    cues: ["Rotate smoothly", "Keep ribs stacked", "Finish without shrugging"]
  },
  "band chest press": {
    category: "Chest",
    equipment: ["Resistance band"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Core", "Serratus anterior"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Home chest training, joint-friendly pressing, band-based upper-body strength",
    description:
      "The band chest press is a standing or anchored pressing exercise using a resistance band. It trains chest and triceps while requiring core control against band tension.",
    setup:
      "Anchor the band behind you at chest height or wrap it securely around your upper back. Hold one end in each hand, step forward to create tension, and set hands near chest level.",
    execution:
      "Press the hands forward until arms extend without locking aggressively. Keep ribs down, shoulders controlled, and band path level. Return slowly until hands come back near the chest.",
    breathing: "Exhale as you press forward. Inhale as you return.",
    tempo: "Press for 1–2 seconds, return slowly for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand tall with the band anchored behind you, hands at chest height, elbows bent, and core braced." },
      { title: "Mid", description: "Press forward against band tension while keeping shoulders down and ribs controlled." },
      { title: "Peak", description: "Reach the extended position with chest and triceps engaged, avoiding excessive shoulder shrug." },
      { title: "Finish", description: "Return slowly until hands come back near the chest while keeping tension on the band." }
    ],
    commonMistakes: [
      "Letting the band pull the arms back too fast",
      "Arching the lower back",
      "Pressing too high toward the neck",
      "Standing with unstable feet",
      "Losing band tension"
    ],
    safetyNotes: [
      "Make sure the band anchor is secure before pressing.",
      "Inspect the band for damage.",
      "Stand far enough forward for tension but not so far that control is lost."
    ],
    modifications: ["Use a lighter band or shorten the press range."],
    progressions: ["Use a stronger band", "Use a staggered stance", "Slow the eccentric return"],
    regressions: ["Wall push-up", "Incline push-up"],
    cues: ["Keep the ribs down", "Press straight forward", "Control the band on the return"]
  },
  "band pulldown": {
    category: "Back",
    equipment: ["Resistance band"],
    primaryMuscles: ["Latissimus dorsi", "Teres major", "Biceps"],
    secondaryMuscles: ["Rear deltoids", "Lower traps", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Vertical pull",
    trainingUse: "Back training at home, lat activation, shoulder-friendly pulling practice",
    description:
      "The band pulldown is a vertical pulling exercise using a resistance band anchored overhead. It trains the lats and upper back while allowing a controlled pulling path.",
    setup:
      "Anchor the band securely overhead. Kneel or stand facing the anchor, hold the band with arms extended, ribs down, and shoulders relaxed away from ears.",
    execution:
      "Pull the elbows down toward the ribs while keeping the chest tall and shoulders controlled. Pause briefly, then let the arms return overhead slowly.",
    breathing: "Exhale as you pull down. Inhale as you return.",
    tempo: "Pull for 1–2 seconds, return for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the band overhead, arms extended, ribs down, and shoulders controlled." },
      { title: "Mid", description: "Pull elbows down and slightly back, aiming to bring them toward the sides of the ribs." },
      { title: "Peak", description: "Reach the strongest contraction with lats engaged and shoulders away from the ears." },
      { title: "Finish", description: "Return the arms overhead slowly while keeping tension and control." }
    ],
    commonMistakes: [
      "Shrugging shoulders toward ears",
      "Leaning back excessively",
      "Pulling with only the arms",
      "Letting the band snap back",
      "Using an unstable anchor"
    ],
    safetyNotes: [
      "Check that the band anchor is secure.",
      "Keep tension smooth to avoid shoulder irritation.",
      "Avoid yanking from the top position."
    ],
    modifications: ["Use a lighter band or kneel closer to the anchor."],
    progressions: ["Use a stronger band", "Slow the return", "Pause at the bottom"],
    regressions: ["Straight-arm band pulldown with lighter tension"],
    cues: ["Pull elbows to ribs", "Shoulders stay down", "Control the return overhead"]
  },
  "bench dip": {
    category: "Triceps",
    equipment: ["Bench or sturdy elevated surface"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Anterior deltoids", "Chest"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate to high",
    movementPattern: "Elbow extension / bodyweight press",
    trainingUse: "Triceps strength, bodyweight arm training",
    description:
      "The bench dip is a bodyweight triceps exercise performed with hands on a bench or sturdy surface. It can be effective but requires careful shoulder positioning.",
    setup:
      "Sit on the edge of a bench, place hands beside hips, and walk feet forward. Keep chest open, shoulders down, and hips close to the bench.",
    execution:
      "Bend the elbows to lower the body while keeping hips close to the bench. Lower only as far as shoulders feel comfortable. Press through the hands to extend elbows and return up.",
    breathing: "Inhale as you lower. Exhale as you press up.",
    tempo: "Lower slowly for 2 seconds, press up with control.",
    stepSequence: [
      { title: "Start", description: "Place hands on the bench beside your hips, walk feet forward, and keep hips close to the bench." },
      { title: "Mid", description: "Bend the elbows and lower under control without letting shoulders roll forward." },
      { title: "Peak", description: "Reach the lowest comfortable position while keeping chest open and shoulders controlled." },
      { title: "Finish", description: "Press through the hands, extend the elbows, and return to the top without locking aggressively." }
    ],
    commonMistakes: [
      "Letting shoulders roll forward",
      "Moving hips too far away from the bench",
      "Lowering too deep",
      "Shrugging shoulders",
      "Bouncing out of the bottom"
    ],
    safetyNotes: [
      "Avoid this movement if it causes front-shoulder pain.",
      "Keep range conservative.",
      "Use close control and do not force depth."
    ],
    modifications: ["Bend knees more and keep feet closer to reduce load."],
    progressions: ["Straighten legs", "Elevate feet only if shoulders tolerate it", "Progress to close-grip push-up"],
    regressions: ["Cable or band triceps pressdown", "Close-grip wall push-up"],
    cues: ["Keep hips close", "Chest stays open", "Lower only as deep as shoulders tolerate"]
  },
  "conventional deadlift": {
    category: "Back / Legs",
    equipment: ["Barbell, dumbbells, or kettlebells depending on variation"],
    primaryMuscles: ["Glutes", "Hamstrings", "Spinal erectors"],
    secondaryMuscles: ["Lats", "Upper back", "Core", "Grip"],
    difficulty: "Intermediate",
    jointStress: "moderate to high",
    movementPattern: "Hip hinge",
    trainingUse: "Posterior-chain strength, hinge pattern development, full-body strength",
    description:
      "The deadlift is a hip-hinge strength exercise where the load is lifted from the floor or low position by driving through the legs and extending the hips.",
    setup:
      "Stand with the load close to the mid-foot. Hinge at the hips, bend knees slightly, brace the core, set the lats, and keep the spine neutral before lifting.",
    execution:
      "Push through the floor and extend hips and knees together. Keep the load close to the body. Stand tall at the top without leaning back, then hinge to lower with control.",
    breathing: "Inhale and brace before lifting. Exhale after passing the hardest part or at the top, then reset.",
    tempo: "Lift with steady power, lower under control for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set feet, bring the load close, hinge down, brace, and create tension through the back and core." },
      { title: "Mid", description: "Drive through the floor while keeping the load close and the spine neutral." },
      { title: "Peak", description: "Stand tall with hips extended, shoulders controlled, and ribs stacked over hips." },
      { title: "Finish", description: "Hinge back down with control, keeping the load close and resetting tension before the next rep." }
    ],
    commonMistakes: [
      "Rounding the back before lifting",
      "Letting the load drift forward",
      "Jerking the weight off the floor",
      "Over-leaning backward at the top",
      "Squatting too low instead of hinging"
    ],
    safetyNotes: [
      "Start light while learning the hinge.",
      "Stop if low-back pain replaces muscular effort.",
      "Keep the load close and brace before each rep."
    ],
    modifications: ["Use dumbbells from blocks", "Use a kettlebell deadlift", "Use a Romanian deadlift"],
    progressions: ["Increase load gradually", "Use slower tempo", "Progress to a full barbell deadlift"],
    regressions: ["Hip hinge drill", "Elevated deadlift", "Kettlebell deadlift from blocks"],
    cues: ["Brace before you break the floor", "Keep the load close", "Stand tall without leaning back"]
  },
  "single-arm dumbbell row": {
    category: "Back",
    equipment: ["Dumbbell", "Bench or support"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Middle traps"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal pull",
    trainingUse: "Back strength, rowing pattern, unilateral pulling, posture support",
    description:
      "The single-arm dumbbell row is a supported horizontal pulling exercise that trains the lats, mid-back, rear delts, and biceps one side at a time.",
    setup:
      "Place one hand and knee or one hand only on a bench or support. Keep the back flat, ribs controlled, and dumbbell hanging under the shoulder.",
    execution:
      "Pull the dumbbell toward the hip or lower ribs by driving the elbow back. Keep the shoulder from shrugging. Lower slowly until the arm is extended again.",
    breathing: "Exhale as you row. Inhale as you lower.",
    tempo: "Pull for 1 second, pause briefly, lower for 2–3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set your support hand, keep the spine long, brace lightly, and let the dumbbell hang under the shoulder." },
      { title: "Mid", description: "Pull the elbow back toward the hip while keeping the torso quiet." },
      { title: "Peak", description: "Squeeze the back at the top without twisting or shrugging." },
      { title: "Finish", description: "Lower the dumbbell under control until the arm extends and the shoulder stays stable." }
    ],
    commonMistakes: [
      "Twisting the torso",
      "Shrugging the shoulder",
      "Pulling the dumbbell too high toward the neck",
      "Using momentum",
      "Letting the back round"
    ],
    safetyNotes: [
      "Keep the support position stable.",
      "Use a weight that does not require twisting.",
      "Maintain a neutral spine."
    ],
    modifications: ["Use lighter weight", "Use a chest-supported row", "Use a band row"],
    progressions: ["Use a heavier dumbbell", "Slow the lowering", "Add paused reps"],
    regressions: ["Band row", "Incline-supported dumbbell row"],
    cues: ["Elbow tracks toward the hip", "Torso stays quiet", "Lower under full control"]
  },
  "pike push-up": {
    category: "Shoulders",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Anterior deltoids", "Lateral deltoids", "Triceps"],
    secondaryMuscles: ["Upper chest", "Core", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Vertical push",
    trainingUse: "Bodyweight shoulder strength, overhead pressing pattern, upper-body control",
    description:
      "The pike push-up is a bodyweight shoulder press variation performed with the hips raised and torso angled downward. It shifts more load toward the shoulders compared with a regular push-up.",
    setup:
      "Place hands on the floor about shoulder-width apart. Walk feet closer to the hands and raise hips high so the body forms an inverted V. Keep arms straight, core braced, and head between the arms.",
    execution:
      "Bend the elbows and lower the head toward the floor between the hands. Keep hips high and elbows controlled. Press the floor away to return to the starting position.",
    breathing: "Inhale while lowering. Exhale as you press back up.",
    tempo: "Lower for 2-3 seconds, press up smoothly.",
    stepSequence: [
      { title: "Start", description: "Set hands shoulder-width, raise hips high, brace the core, and keep the head between the arms." },
      { title: "Mid", description: "Bend the elbows and lower the head toward the floor while keeping hips elevated." },
      { title: "Peak", description: "Reach the lowest controlled position without collapsing the neck or shoulders." },
      { title: "Finish", description: "Press the floor away and return to the inverted V position with elbows extended." }
    ],
    commonMistakes: [
      "Letting hips drop into a regular push-up",
      "Flaring elbows too wide",
      "Dropping the head without control",
      "Shrugging aggressively",
      "Using too short a range to avoid the hard part"
    ],
    safetyNotes: [
      "Keep the neck neutral and avoid crashing the head toward the floor.",
      "Elevate hands if wrist or shoulder stress is too high.",
      "Stop if shoulder pinching occurs."
    ],
    modifications: ["Perform with hands elevated on a box or bench to reduce load."],
    progressions: ["Elevate feet", "Slow the lowering", "Add a pause near the bottom", "Progress toward handstand push-up work"],
    regressions: ["Incline pike push-up", "Dumbbell shoulder press"],
    cues: ["Hips stay high", "Head moves between the hands", "Press the floor away"]
  },
  "band overhead press": {
    category: "Shoulders",
    equipment: ["Resistance band"],
    primaryMuscles: ["Anterior deltoids", "Lateral deltoids", "Triceps"],
    secondaryMuscles: ["Core", "Upper traps", "Serratus anterior"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Vertical push",
    trainingUse: "Home shoulder training, joint-friendly overhead pressing, band resistance control",
    description:
      "The band overhead press is a vertical pressing exercise using a resistance band. Band tension increases as the hands move upward, making control and shoulder position important.",
    setup:
      "Stand on the band or anchor it under the feet. Hold handles or ends at shoulder height with elbows slightly forward. Brace the core and keep ribs down.",
    execution:
      "Press the hands overhead until arms are extended. Keep the band path controlled and avoid leaning back. Lower slowly back to shoulder height.",
    breathing: "Exhale as you press overhead. Inhale as you lower.",
    tempo: "Press for 1-2 seconds, lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand on the band with hands at shoulder height, ribs down, and core braced." },
      { title: "Mid", description: "Press upward while keeping elbows controlled and avoiding a backward lean." },
      { title: "Peak", description: "Reach overhead with arms extended and shoulders stable." },
      { title: "Finish", description: "Lower the hands back to shoulder height under band tension." }
    ],
    commonMistakes: [
      "Leaning back to finish the press",
      "Letting the band pull arms down too quickly",
      "Starting with uneven band tension",
      "Shrugging excessively",
      "Pressing through shoulder pain"
    ],
    safetyNotes: [
      "Check the band for damage before use.",
      "Stand securely on the band to prevent slipping.",
      "Reduce range or resistance if shoulders pinch."
    ],
    modifications: ["Use a lighter band or press one arm at a time."],
    progressions: ["Use a stronger band", "Add a pause overhead", "Slow the lowering"],
    regressions: ["Seated dumbbell shoulder press with light weight", "Wall slide"],
    cues: ["Ribs stay down", "Press straight overhead", "Control the band on the way down"]
  },
  "overhead dumbbell extension": {
    category: "Triceps",
    equipment: ["Dumbbell"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Elbow extension",
    trainingUse: "Triceps strength, overhead arm work, long-head triceps emphasis",
    description:
      "The overhead dumbbell extension trains the triceps by extending the elbows while the arms are positioned overhead. It emphasizes the long head of the triceps.",
    setup:
      "Hold one dumbbell with both hands around the inside of the top plate or handle. Bring it overhead with elbows pointing forward and upper arms close to the head. Brace the core and keep ribs down.",
    execution:
      "Bend the elbows to lower the dumbbell behind the head. Keep upper arms mostly still. Extend the elbows to raise the dumbbell back overhead.",
    breathing: "Inhale as the dumbbell lowers. Exhale as you extend the elbows.",
    tempo: "Lower for 2-3 seconds, extend smoothly.",
    stepSequence: [
      { title: "Start", description: "Hold the dumbbell overhead with elbows forward, ribs controlled, and core braced." },
      { title: "Mid", description: "Bend the elbows and lower the dumbbell behind the head without flaring the arms wide." },
      { title: "Peak", description: "Reach a comfortable stretch through the triceps while keeping shoulders controlled." },
      { title: "Finish", description: "Extend the elbows to bring the dumbbell back overhead without arching the back." }
    ],
    commonMistakes: [
      "Flaring elbows too wide",
      "Arching the low back",
      "Letting the dumbbell drop too fast",
      "Moving the shoulders instead of the elbows",
      "Using too heavy a weight"
    ],
    safetyNotes: [
      "Keep range pain-free around elbows and shoulders.",
      "Use a secure grip on the dumbbell.",
      "Avoid forcing deep elbow flexion if it causes discomfort."
    ],
    modifications: ["Use a lighter dumbbell or perform seated with back support."],
    progressions: ["Use a heavier dumbbell", "Slow eccentric lowering", "Single-arm overhead extension"],
    regressions: ["Band pressdown", "Close-grip push-up from an elevated surface"],
    cues: ["Elbows point forward", "Upper arms stay quiet", "Keep ribs stacked"]
  },
  "close-grip push-up": {
    category: "Triceps",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Triceps", "Chest"],
    secondaryMuscles: ["Anterior deltoids", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal push / elbow extension",
    trainingUse: "Triceps-focused bodyweight pressing, upper-body strength, close-grip control",
    description:
      "The close-grip push-up is a push-up variation with the hands set narrower than a standard push-up. It increases triceps demand while still training the chest and shoulders.",
    setup:
      "Place hands under or slightly inside shoulder width. Set the body in a straight plank from head to heels, brace the core, and keep elbows close to the body.",
    execution:
      "Lower the body as one unit while elbows track back instead of flaring wide. Press the floor away and return to the top while keeping body alignment.",
    breathing: "Inhale as you lower. Exhale as you press up.",
    tempo: "Lower for 2 seconds, press up steadily.",
    stepSequence: [
      { title: "Start", description: "Set a narrow hand position, brace the core, and create a straight line from head to heels." },
      { title: "Mid", description: "Lower with elbows tracking close to the ribs and shoulders controlled." },
      { title: "Peak", description: "Reach the lowest controlled position without hips sagging or elbows flaring wide." },
      { title: "Finish", description: "Press the floor away and return to a strong plank position." }
    ],
    commonMistakes: [
      "Setting hands so close that wrists or elbows hurt",
      "Letting elbows flare out",
      "Sagging the hips",
      "Cutting range too short",
      "Losing shoulder control"
    ],
    safetyNotes: [
      "Use a comfortable hand width; hands do not need to touch.",
      "Elevate hands if wrist, elbow, or shoulder stress is too high.",
      "Stop before form breaks."
    ],
    modifications: ["Perform hands-elevated close-grip push-ups."],
    progressions: ["Slow eccentric close-grip push-ups", "Paused reps", "Deficit close-grip push-ups"],
    regressions: ["Incline close-grip push-up", "Band pressdown"],
    cues: ["Hands narrow but comfortable", "Elbows brush the ribs", "Move as one solid plank"]
  },
  "skull crusher": {
    category: "Triceps",
    equipment: ["Dumbbells or EZ-bar"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders", "Forearms"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Elbow extension",
    trainingUse: "Triceps isolation, pressing accessory work, elbow-extension strength",
    description:
      "The skull crusher is a lying triceps extension where the elbows bend and straighten while the upper arms stay mostly fixed. It isolates the triceps more than pressing movements.",
    setup:
      "Lie on a bench or floor holding dumbbells or a bar above the chest. Keep upper arms angled slightly back instead of perfectly vertical, wrists neutral, and elbows pointed forward.",
    execution:
      "Bend the elbows and lower the weight toward the forehead or just behind the head. Keep upper arms mostly still. Extend the elbows to return the weight upward.",
    breathing: "Inhale while lowering. Exhale while extending the elbows.",
    tempo: "Lower slowly for 2-3 seconds, extend with control.",
    stepSequence: [
      { title: "Start", description: "Lie down with the weight above the chest, elbows pointed forward, and upper arms stable." },
      { title: "Mid", description: "Bend only the elbows and lower the weight toward the forehead or slightly behind the head." },
      { title: "Peak", description: "Reach the bottom with control while keeping elbows from flaring out." },
      { title: "Finish", description: "Extend the elbows and bring the weight back up without swinging the shoulders." }
    ],
    commonMistakes: [
      "Letting elbows flare wide",
      "Moving the shoulders too much",
      "Lowering too fast",
      "Using a range that irritates elbows",
      "Letting wrists bend backward"
    ],
    safetyNotes: [
      "Use light to moderate weight until elbow comfort is clear.",
      "Keep the movement controlled near the head.",
      "Avoid if elbows feel sharp pain."
    ],
    modifications: ["Use dumbbells with neutral grip or reduce range."],
    progressions: ["Slow eccentric skull crushers", "Paused reps", "EZ-bar variation"],
    regressions: ["Band pressdown", "Overhead dumbbell extension with lighter load"],
    cues: ["Upper arms stay fixed", "Elbows point forward", "Lower under control"]
  },
  "band pressdown": {
    category: "Triceps",
    equipment: ["Resistance band"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Forearms"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Elbow extension",
    trainingUse: "Joint-friendly triceps isolation, home arm training, pressing accessory work",
    description:
      "The band pressdown trains the triceps by extending the elbows against band tension. It is a joint-friendly arm exercise that works well with a high anchor.",
    setup:
      "Anchor a resistance band overhead. Hold the band ends with elbows tucked at your sides, chest tall, and shoulders relaxed.",
    execution:
      "Press the hands downward by straightening the elbows. Keep upper arms close to the body and avoid swinging. Return slowly until elbows bend again.",
    breathing: "Exhale as you press down. Inhale as you return.",
    tempo: "Press down for 1 second, return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand facing the anchor with elbows tucked, hands near lower chest height, and shoulders relaxed." },
      { title: "Mid", description: "Press the band down by extending the elbows while keeping upper arms still." },
      { title: "Peak", description: "Reach full triceps contraction with arms extended and wrists controlled." },
      { title: "Finish", description: "Allow the elbows to bend slowly and return to the starting position under tension." }
    ],
    commonMistakes: [
      "Letting elbows drift forward",
      "Using shoulder movement instead of elbow extension",
      "Snapping the band back up",
      "Leaning over excessively",
      "Using an unstable anchor"
    ],
    safetyNotes: [
      "Check the band and anchor before use.",
      "Keep tension smooth and controlled.",
      "Avoid locking elbows aggressively."
    ],
    modifications: ["Use a lighter band or step closer to the anchor."],
    progressions: ["Use a stronger band", "Add a pause at the bottom", "Slow the return"],
    regressions: ["Single-arm light band pressdown"],
    cues: ["Elbows stay pinned", "Press straight down", "Return under control"]
  },
  "band curl": {
    category: "Biceps",
    equipment: ["Resistance band"],
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Elbow flexion",
    trainingUse: "Home arm training, joint-friendly biceps work, high-rep accessory training",
    description:
      "The band curl trains the biceps using resistance band tension. Band resistance increases toward the top, encouraging control through the full curl.",
    setup:
      "Stand on the band with feet secure. Hold the band ends with arms down, palms facing forward or inward, elbows close to the body.",
    execution:
      "Curl the hands upward while keeping elbows mostly still. Squeeze at the top, then lower slowly while keeping tension on the band.",
    breathing: "Exhale while curling. Inhale while lowering.",
    tempo: "Curl for 1-2 seconds, lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand securely on the band with arms down, elbows tucked, and wrists neutral." },
      { title: "Mid", description: "Curl upward against band tension while keeping shoulders relaxed." },
      { title: "Peak", description: "Reach the top with biceps engaged and band tension controlled." },
      { title: "Finish", description: "Lower slowly until arms extend without letting the band snap down." }
    ],
    commonMistakes: [
      "Standing unevenly on the band",
      "Letting elbows drift forward",
      "Shrugging shoulders",
      "Losing tension at the bottom",
      "Letting the band snap back"
    ],
    safetyNotes: [
      "Inspect the band for damage.",
      "Keep feet secure on the band.",
      "Use smooth tension to protect elbows."
    ],
    modifications: ["Use a lighter band or one arm at a time."],
    progressions: ["Use a stronger band", "Pause at the top", "Slow the lowering"],
    regressions: ["Shorter range curl with lighter band tension"],
    cues: ["Stand evenly on the band", "Elbows stay close", "Keep tension through the bottom"]
  },
  "incline dumbbell curl": {
    category: "Biceps",
    equipment: ["Dumbbells", "Incline bench"],
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    difficulty: "Intermediate",
    jointStress: "low to moderate",
    movementPattern: "Elbow flexion",
    trainingUse: "Biceps isolation, long-range curl variation, arm hypertrophy",
    description:
      "The incline dumbbell curl is performed lying back on an incline bench. The arm starts slightly behind the torso, creating a longer biceps stretch than a standing curl.",
    setup:
      "Set an incline bench to a moderate angle. Lie back with dumbbells hanging at your sides. Keep shoulders back, elbows slightly behind the body, and wrists neutral.",
    execution:
      "Curl the dumbbells upward without swinging the upper arms forward. Squeeze near the top, then lower slowly into the stretched bottom position.",
    breathing: "Exhale as you curl. Inhale as you lower.",
    tempo: "Curl for 1-2 seconds, lower for 3 seconds.",
    stepSequence: [
      { title: "Start", description: "Lie back on the incline bench with arms hanging down, shoulders set, and elbows slightly behind the torso." },
      { title: "Mid", description: "Curl the dumbbells upward while keeping upper arms quiet and wrists controlled." },
      { title: "Peak", description: "Reach the top with biceps engaged without rolling shoulders forward." },
      { title: "Finish", description: "Lower slowly until arms extend again and the biceps stretch under control." }
    ],
    commonMistakes: [
      "Using too much weight",
      "Swinging elbows forward",
      "Letting shoulders roll forward",
      "Dropping too quickly into the stretch",
      "Bending wrists"
    ],
    safetyNotes: [
      "Start light due to the increased stretch.",
      "Avoid aggressive bottom range if shoulders or elbows are uncomfortable.",
      "Keep the movement slow and controlled."
    ],
    modifications: ["Use a lower incline or alternate arms."],
    progressions: ["Add slow eccentrics", "Use pauses", "Increase dumbbell load slightly"],
    regressions: ["Standing dumbbell curl", "Band curl"],
    cues: ["Shoulders stay back", "Do not let elbows drift forward", "Own the lowered stretch"]
  },
  "rear-foot elevated split squat": {
    category: "Legs",
    equipment: ["Bench or support", "Dumbbells optional"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Intermediate to advanced",
    jointStress: "moderate to high",
    movementPattern: "Single-leg squat / split squat",
    trainingUse: "Single-leg strength, glute and quad development, balance and control",
    description:
      "The rear-foot elevated split squat is a single-leg squat variation with the back foot elevated. It heavily trains the front leg while challenging balance, hip control, and range of motion.",
    setup:
      "Stand a stride in front of a bench or stable support. Place the top of the rear foot on the bench. Set the front foot far enough forward that the heel stays grounded during the rep.",
    execution:
      "Lower by bending the front knee and hip while the rear knee moves down. Keep the torso controlled and front knee tracking over the toes. Drive through the front foot to stand.",
    breathing: "Inhale before lowering. Exhale as you stand.",
    tempo: "Lower for 2-3 seconds, pause briefly if needed, drive up steadily.",
    stepSequence: [
      { title: "Start", description: "Set the rear foot on the bench, plant the front foot firmly, brace, and find balance." },
      { title: "Mid", description: "Lower under control by bending the front leg while keeping the heel grounded." },
      { title: "Peak", description: "Reach the bottom position with the front knee tracking well and hips controlled." },
      { title: "Finish", description: "Drive through the front foot and stand tall without pushing off the rear leg." }
    ],
    commonMistakes: [
      "Front foot too close to the bench",
      "Pushing too much with the rear leg",
      "Knee collapsing inward",
      "Dropping too fast",
      "Losing balance before completing the rep"
    ],
    safetyNotes: [
      "Use support for balance when learning.",
      "Keep the range controlled and pain-free.",
      "Start bodyweight before adding dumbbells."
    ],
    modifications: ["Hold onto a stable support or reduce depth."],
    progressions: ["Add dumbbells", "Use a slower tempo", "Pause at the bottom", "Add front-foot elevation"],
    regressions: ["Regular split squat", "Step-up", "Supported split squat"],
    cues: ["Front foot stays heavy", "Drop straight down", "Stand through the front leg"]
  },
  "step-up": {
    category: "Legs",
    equipment: ["Box, bench, or step", "Dumbbells optional"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Single-leg step",
    trainingUse: "Single-leg strength, stair mechanics, glute and quad control",
    description:
      "The step-up trains one leg at a time by stepping onto an elevated surface. It builds practical leg strength and control through a stair-like pattern.",
    setup:
      "Stand facing a stable box or bench. Place one foot fully on the surface with heel planted. Keep torso tall and core braced.",
    execution:
      "Drive through the planted foot to step up until the working leg is straight. Avoid pushing hard off the back foot. Step down with control and repeat.",
    breathing: "Exhale as you step up. Inhale as you lower.",
    tempo: "Step up smoothly, lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Place the full working foot on the box with heel grounded, torso tall, and core braced." },
      { title: "Mid", description: "Drive through the planted foot and begin rising without bouncing off the back leg." },
      { title: "Peak", description: "Stand tall on the box with the working leg controlling the top position." },
      { title: "Finish", description: "Step down slowly and reset with the same foot position before the next rep." }
    ],
    commonMistakes: [
      "Using too high a box",
      "Pushing mostly off the trailing leg",
      "Knee collapsing inward",
      "Landing heavily on the way down",
      "Letting the heel hang off the box"
    ],
    safetyNotes: [
      "Use a stable surface that will not slide.",
      "Choose a height that allows control.",
      "Hold support if balance is limiting."
    ],
    modifications: ["Use a lower step or hold onto support."],
    progressions: ["Add dumbbells", "Increase step height moderately", "Slow the lowering"],
    regressions: ["Low step-up", "Supported split squat"],
    cues: ["Whole foot on the box", "Drive through the lead leg", "Step down under control"]
  },
  "front-foot elevated split squat": {
    category: "Legs",
    equipment: ["Low step, plate, wedge, or small elevation", "Dumbbells optional"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core", "Calves"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Single-leg squat / split squat",
    trainingUse: "Quad-focused single-leg strength, knee-control training, deeper split-squat range, lower-body balance",
    description:
      "The front-foot elevated split squat is a split-squat variation where the front foot is raised slightly on a plate, wedge, or low step. The elevation allows more controlled range through the front leg and can increase quad demand while still training the glutes and balance.",
    setup:
      "Place the front foot on a low stable elevation with the full foot supported. Step the other foot back into a split stance with the back heel lifted. Keep the front heel planted, torso tall, and core braced. Hold dumbbells at your sides only if bodyweight control is solid.",
    execution:
      "Lower by bending the front knee and hip while the back knee moves toward the floor. Let the front knee travel forward as comfortable while tracking in line with the toes. Drive through the elevated front foot to return to standing.",
    breathing: "Inhale and brace before lowering. Exhale as you drive through the front foot to stand.",
    tempo: "Lower for 2-3 seconds, pause briefly if needed, then stand with steady control.",
    stepSequence: [
      { title: "Start", description: "Set the full front foot on a low stable elevation, step the other foot back, brace your core, and find balance." },
      { title: "Mid", description: "Lower under control by bending the front knee and hip while keeping the front heel planted." },
      { title: "Peak", description: "Reach the deepest controlled position with the front knee tracking over the toes and the back knee moving toward the floor." },
      { title: "Finish", description: "Drive through the elevated front foot and stand tall without pushing excessively from the rear leg." }
    ],
    commonMistakes: [
      "Using an unstable or overly high elevation",
      "Letting the front heel lift",
      "Collapsing the front knee inward",
      "Pushing too much from the rear leg",
      "Dropping quickly into the bottom position"
    ],
    safetyNotes: [
      "Use a low, stable elevation.",
      "Hold support if balance is limiting.",
      "Reduce depth if the front knee feels irritated.",
      "Start bodyweight before loading."
    ],
    modifications: ["Hold onto a rack, wall, or stable support to improve balance and reduce load."],
    progressions: ["Add dumbbells", "Slow the lowering", "Add a pause at the bottom", "Increase range gradually"],
    regressions: ["Regular split squat", "Supported split squat", "Low step-up"],
    cues: ["Front heel stays planted", "Front knee tracks with toes", "Drive through the elevated front foot"]
  },
  "back squat": {
    category: "Legs",
    equipment: ["Barbell", "Rack"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Spinal erectors", "Core", "Hamstrings"],
    difficulty: "Intermediate",
    jointStress: "moderate to high",
    movementPattern: "Squat",
    trainingUse: "Lower-body strength, barbell squat development, full-body bracing under load",
    description:
      "The back squat is a barbell squat performed with the bar resting across the upper back. It builds lower-body strength while demanding trunk stiffness and stable bar position.",
    setup:
      "Set the bar across the upper traps or rear-delt shelf, grip it evenly, and step back into a stable stance about shoulder width. Brace the trunk, lock in the upper back, and keep the whole foot planted.",
    execution:
      "Break at the knees and hips together to sit down between the legs. Keep the chest organized, knees tracking over the toes, and the bar stacked over the mid-foot. Drive up through the floor to stand tall without overextending at the top.",
    breathing: "Take a full breath and brace before each rep. Exhale after you pass the hardest part or once you return to the top.",
    tempo: "Descend for 2-3 seconds, control the bottom, then stand with steady force.",
    stepSequence: [
      { title: "Start", description: "Set the bar firmly on the upper back, grip evenly, brace hard, and root the feet into the floor." },
      { title: "Mid", description: "Lower by bending knees and hips together while the bar stays balanced over the mid-foot." },
      { title: "Peak", description: "Reach the deepest position you can hold without chest collapse, heel lift, or loss of spinal control." },
      { title: "Finish", description: "Drive up through the floor, extend hips and knees together, and finish tall with ribs stacked over the pelvis." }
    ],
    commonMistakes: [
      "Letting the chest fold forward out of the bottom",
      "Allowing knees to cave inward",
      "Shifting onto the toes instead of staying over mid-foot",
      "Losing upper-back tension under the bar",
      "Over-leaning backward at lockout"
    ],
    safetyNotes: [
      "Use safeties or a spotter when loading the movement heavily.",
      "Reduce load if you cannot keep the bar balanced over the mid-foot.",
      "Stop the set if back position breaks before the legs fatigue."
    ],
    modifications: ["Use a box as a depth target", "Reduce range to the deepest controlled position", "Use a goblet squat on lighter days"],
    progressions: ["Increase barbell load gradually", "Add a pause in the bottom", "Use tempo reps to improve position"],
    regressions: ["Goblet squat", "Bodyweight squat", "Supported squat pattern"],
    cues: ["Brace before every rep", "Push the floor away", "Keep the bar over mid-foot"]
  },
  "front squat": {
    category: "Legs",
    equipment: ["Barbell", "Rack"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Upper back", "Core", "Adductors"],
    difficulty: "Intermediate to advanced",
    jointStress: "moderate",
    movementPattern: "Squat",
    trainingUse: "Quad-focused barbell strength, upright squat mechanics, trunk and upper-back demand",
    description:
      "The front squat is a barbell squat performed with the bar resting on the front of the shoulders. It emphasizes quad strength and demands a tall torso with strong upper-back support.",
    setup:
      "Rack the bar on the front of the shoulders with elbows lifted and upper arms angled forward. Set the hands where you can keep the chest up, step back into a shoulder-width stance, and brace the trunk.",
    execution:
      "Lower by bending knees and hips together while keeping elbows lifted and torso tall. Let the knees travel forward as needed, keep the bar stacked over the mid-foot, and drive up without letting the elbows drop.",
    breathing: "Take a breath and brace before the descent. Exhale after the sticking point or when you return to the top.",
    tempo: "Lower for 2-3 seconds, stay organized in the bottom, then stand with smooth force.",
    stepSequence: [
      { title: "Start", description: "Set the bar on the shoulders, lift the elbows, brace the torso, and root the feet into the floor." },
      { title: "Mid", description: "Descend with the chest tall and elbows high while the knees and hips bend together." },
      { title: "Peak", description: "Reach the bottom with the bar still centered over the mid-foot and the torso as upright as possible." },
      { title: "Finish", description: "Drive straight up, keep the elbows from dropping, and stand tall without losing the front-rack position." }
    ],
    commonMistakes: [
      "Letting elbows drop during the descent",
      "Collapsing the chest in the bottom",
      "Allowing the bar to roll forward",
      "Shifting weight onto the toes",
      "Using a grip that cannot support a stable rack position"
    ],
    safetyNotes: [
      "Use a manageable load until you can maintain the front-rack position cleanly.",
      "Stop if wrist, elbow, or shoulder position breaks down before the legs fatigue.",
      "Use safeties when working near hard sets."
    ],
    modifications: ["Use straps for a front-rack assist", "Reduce depth to the deepest controlled position", "Use a goblet squat if front-rack mobility is limited"],
    progressions: ["Increase load gradually", "Add pause front squats", "Use tempo descents to reinforce position"],
    regressions: ["Goblet squat", "Heels-elevated goblet squat", "Back squat with lighter load"],
    cues: ["Elbows stay high", "Chest stays proud", "Drive straight up"]
  },
  "hack squat": {
    category: "Legs",
    equipment: ["Hack squat machine"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Calves"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Squat",
    trainingUse: "Quad-focused machine leg training, lower-body volume, squat work with added support",
    description:
      "The hack squat is a machine squat variation that supports the torso while the legs drive the sled. It is useful for heavy quad work without the same balance demands as a free-weight squat.",
    setup:
      "Place the shoulders under the pads, set the feet on the platform at a stance you can control, and unlock the sled with the torso supported. Keep the whole foot planted and the low back organized against the pad.",
    execution:
      "Lower the sled by bending the knees and hips under control. Keep the knees tracking over the toes and descend only as far as you can keep the pelvis and feet stable. Drive through the platform to return to the top without snapping the knees.",
    breathing: "Inhale before lowering. Exhale as you drive the sled back up.",
    tempo: "Lower for 2-3 seconds, pause briefly if needed, and press back up smoothly.",
    stepSequence: [
      { title: "Start", description: "Set the shoulders into the pads, plant the feet evenly, unlock the sled, and brace before descending." },
      { title: "Mid", description: "Lower under control while the knees track in line with the toes and the heels stay grounded." },
      { title: "Peak", description: "Reach the deepest position you can control without the pelvis rolling or the feet shifting on the platform." },
      { title: "Finish", description: "Drive through the platform to stand back up and stop just short of hard knee lockout." }
    ],
    commonMistakes: [
      "Dropping too deep and losing pelvic position",
      "Letting the knees cave inward",
      "Pushing mostly through the toes",
      "Locking the knees aggressively at the top",
      "Using a foot position that forces awkward hip or knee tracking"
    ],
    safetyNotes: [
      "Use a range that keeps the feet and pelvis stable against the machine.",
      "Do not rush the lockout into the machine stops.",
      "Reduce load if knee comfort worsens as depth increases."
    ],
    modifications: ["Use a shorter range of motion", "Adjust foot placement higher or lower to find a comfortable position", "Lower the load and use slower tempo"],
    progressions: ["Increase machine load gradually", "Add pause reps", "Use higher-rep hypertrophy sets"],
    regressions: ["Leg press", "Goblet squat", "Bodyweight squat"],
    cues: ["Whole foot stays planted", "Control the sled down", "Stand without snapping the knees"]
  },
  "banded squat": {
    category: "Legs",
    equipment: ["Resistance band"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Core", "Calves"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Squat",
    trainingUse: "Home leg training, squat pattern practice, joint-friendly lower-body volume",
    description:
      "The banded squat uses resistance-band tension to load the squat pattern without needing external weights. It is useful for home training, warm-ups, and lighter leg work.",
    setup:
      "Stand on the band and set it securely across the shoulders or hold the ends at shoulder height depending on the setup. Place the feet about shoulder width, brace the trunk, and keep the band tension even.",
    execution:
      "Sit down between the hips by bending knees and hips together. Keep the chest organized, knees tracking with the toes, and the heels grounded. Stand back up against the band without letting the tension pull you out of position.",
    breathing: "Inhale before lowering. Exhale as you stand back up.",
    tempo: "Lower for 2-3 seconds and stand smoothly against the band tension.",
    stepSequence: [
      { title: "Start", description: "Set the band evenly, plant the feet, brace the trunk, and create tension before the descent starts." },
      { title: "Mid", description: "Lower by bending the knees and hips together while keeping the band stable and the chest tall." },
      { title: "Peak", description: "Reach the deepest squat you can hold without the band shifting or the heels lifting." },
      { title: "Finish", description: "Drive through the floor and stand tall while keeping tension balanced across both sides." }
    ],
    commonMistakes: [
      "Starting with uneven band tension",
      "Letting the band pull the torso forward",
      "Collapsing the knees inward",
      "Rising onto the toes",
      "Rushing through the bottom without control"
    ],
    safetyNotes: [
      "Inspect the band before use and make sure it is seated evenly.",
      "Use a range of motion you can control without losing heel pressure.",
      "Reduce tension if the band changes your squat mechanics too much."
    ],
    modifications: ["Use a lighter band", "Reduce depth", "Use a box target for consistency"],
    progressions: ["Use a stronger band", "Add a pause in the bottom", "Slow the lowering phase"],
    regressions: ["Bodyweight squat", "Supported squat", "Goblet squat with light load"],
    cues: ["Band tension stays even", "Chest stays organized", "Drive through the whole foot"]
  },
  "supported split squat": {
    category: "Legs",
    equipment: ["Bodyweight", "Support or rail"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Single-leg squat / split squat",
    trainingUse: "Single-leg pattern practice, balance-supported leg training, knee-friendly lower-body control",
    description:
      "The supported split squat is a split-stance leg exercise performed while lightly holding a stable support. It builds single-leg strength and control without forcing full balance demands.",
    setup:
      "Take a split stance with one foot forward and one foot back. Hold a stable support lightly with one or both hands, keep the torso tall, and plant the front foot firmly through the heel and mid-foot.",
    execution:
      "Lower straight down by bending both knees under control. Keep most of the load on the front leg, let the front knee track over the toes, and press through the front foot to return to standing.",
    breathing: "Inhale as you lower. Exhale as you stand.",
    tempo: "Lower for 2-3 seconds and stand back up smoothly.",
    stepSequence: [
      { title: "Start", description: "Set the split stance, hold the support lightly, brace the trunk, and load the front foot." },
      { title: "Mid", description: "Lower straight down while both knees bend and the front knee tracks cleanly over the toes." },
      { title: "Peak", description: "Reach the lowest controlled position you can hold without losing front-foot pressure or balance." },
      { title: "Finish", description: "Drive through the front foot and return to standing while keeping the torso tall and steady." }
    ],
    commonMistakes: [
      "Pulling too much with the hands on the support",
      "Taking too short a stance",
      "Letting the front knee cave inward",
      "Leaning too far forward onto the support",
      "Pushing mostly off the back foot"
    ],
    safetyNotes: [
      "Use only as much hand support as needed to stay balanced.",
      "Keep the range pain-free for the front knee and hip.",
      "Shorten the range if control is lost at the bottom."
    ],
    modifications: ["Use more support", "Reduce depth", "Shorten the stance slightly"],
    progressions: ["Reduce hand assistance", "Add dumbbells", "Progress to rear-foot elevated split squat"],
    regressions: ["Supported squat", "Low step-up", "Bodyweight split-stance hold"],
    cues: ["Front foot stays heavy", "Hands only help balance", "Drop straight down"]
  },
  "walking lunge": {
    category: "Legs",
    equipment: ["Bodyweight or dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core", "Calves"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Single-leg squat / lunge",
    trainingUse: "Single-leg strength, dynamic lower-body control, glute and quad development",
    description:
      "The walking lunge is a moving lunge variation where each step loads one leg at a time. It builds leg strength, coordination, and balance through repeated stride positions.",
    setup:
      "Stand tall with feet under the hips and ribs stacked over the pelvis. If loading the movement, hold dumbbells at the sides and brace the trunk before taking the first step.",
    execution:
      "Step forward into a long enough stride that the front heel stays grounded. Lower under control until both knees are bent, then drive through the front foot to bring the back leg through into the next rep.",
    breathing: "Inhale as you lower into each step. Exhale as you drive up and through.",
    tempo: "Take deliberate steps, lower with control, and stand through each stride before rushing the next one.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace the trunk, and step forward into a stable lunge-length stride." },
      { title: "Mid", description: "Lower straight down while the front knee tracks over the toes and the torso stays organized." },
      { title: "Peak", description: "Reach the bottom with both legs loaded and the front heel still grounded." },
      { title: "Finish", description: "Drive through the front foot, stand up, and bring the back leg through into the next walking step." }
    ],
    commonMistakes: [
      "Taking steps that are too short or too long",
      "Letting the front knee cave inward",
      "Falling forward instead of lowering straight down",
      "Rushing the transition between steps",
      "Losing trunk position as fatigue builds"
    ],
    safetyNotes: [
      "Use a clear walking lane and shorten the stride if balance is inconsistent.",
      "Reduce load if you cannot control the bottom of each rep.",
      "Stop if knee discomfort increases with each step."
    ],
    modifications: ["Perform stationary reverse lunges", "Use bodyweight only", "Hold onto support between reps"],
    progressions: ["Add dumbbells", "Pause in the bottom", "Use slower eccentric lowering"],
    regressions: ["Supported split squat", "Reverse lunge", "Step-up"],
    cues: ["Step long enough to stay grounded", "Drop straight down", "Stand before the next stride"]
  },
  "reverse lunge": {
    category: "Legs",
    equipment: ["Bodyweight or dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Single-leg squat / lunge",
    trainingUse: "Single-leg strength, joint-friendly leg training, balance and hip control",
    description:
      "The reverse lunge is a lunge variation where the working stance stays planted while the other leg steps backward. It is often more joint-friendly than a forward lunge while still training the legs hard.",
    setup:
      "Stand tall with feet under the hips and brace the trunk. If loading the movement, hold dumbbells at the sides and keep the front foot rooted before stepping back.",
    execution:
      "Step one leg backward and lower straight down until both knees bend under control. Keep the front foot grounded and the front knee tracking over the toes. Push through the front foot to return to standing.",
    breathing: "Inhale as you lower. Exhale as you drive back to standing.",
    tempo: "Step back deliberately, lower for 2-3 seconds, and stand smoothly.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace the trunk, and step the back leg behind you into a stable split stance." },
      { title: "Mid", description: "Lower straight down while the front foot stays planted and the front knee tracks cleanly." },
      { title: "Peak", description: "Reach the bottom with both legs loaded and the torso still organized over the front foot." },
      { title: "Finish", description: "Drive through the front foot and bring the back leg forward to return to the start." }
    ],
    commonMistakes: [
      "Stepping back too narrowly and losing balance",
      "Pushing off the back foot instead of the front leg",
      "Letting the front knee cave inward",
      "Leaning the torso too far forward",
      "Rushing the return to standing"
    ],
    safetyNotes: [
      "Use a shorter step length if balance is shaky.",
      "Keep the range pain-free around the front knee and hip.",
      "Reduce load if the front foot cannot stay grounded."
    ],
    modifications: ["Use bodyweight only", "Hold onto support", "Reduce depth"],
    progressions: ["Add dumbbells", "Pause at the bottom", "Use a slower lowering phase"],
    regressions: ["Supported split squat", "Static split squat", "Low step-up"],
    cues: ["Front foot stays rooted", "Step back under control", "Stand through the front leg"]
  },
  "lateral lunge": {
    category: "Legs",
    equipment: ["Bodyweight or dumbbells"],
    primaryMuscles: ["Glutes", "Adductors", "Quadriceps"],
    secondaryMuscles: ["Hamstrings", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Lateral lunge",
    trainingUse: "Frontal-plane leg strength, groin control, hip mobility and single-side loading",
    description:
      "The lateral lunge is a side-to-side lower-body movement that loads one leg while the other stays longer. It trains the glutes, adductors, and quads in the frontal plane.",
    setup:
      "Stand tall with feet under the hips and brace the trunk. If loading the movement, hold the weight in a way that lets you keep the chest tall and the stance stable.",
    execution:
      "Step out to the side and sit into the working hip while the stepping leg bends. Keep the opposite leg long, the working foot flat, and the torso organized. Push through the bent leg to return to the start.",
    breathing: "Inhale as you sit into the side lunge. Exhale as you push back to center.",
    tempo: "Step out smoothly, lower for 2-3 seconds, and return with control.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace the trunk, and step out wide enough to load one hip cleanly." },
      { title: "Mid", description: "Sit into the working hip while the knee bends and the opposite leg stays long." },
      { title: "Peak", description: "Reach the deepest side lunge you can hold with the foot flat and the torso organized." },
      { title: "Finish", description: "Drive through the working foot and return to the starting stance without collapsing inward." }
    ],
    commonMistakes: [
      "Turning the movement into a forward lean instead of a side sit",
      "Letting the working heel lift",
      "Allowing the knee to collapse inward",
      "Using too short a step to load the hip properly",
      "Pushing off the non-working leg"
    ],
    safetyNotes: [
      "Use a range that keeps the working foot flat and the knee comfortable.",
      "Start bodyweight before adding load if hip mobility is limited.",
      "Reduce step width if groin tension becomes sharp or pinchy."
    ],
    modifications: ["Use bodyweight only", "Reduce step width", "Use support for balance"],
    progressions: ["Add dumbbells", "Pause in the bottom", "Use slower eccentric lowering"],
    regressions: ["Supported split squat", "Bodyweight squat", "Step-up"],
    cues: ["Sit into the hip", "Keep the foot flat", "Drive back to center"]
  },
  "hip thrust": {
    category: "Glutes",
    equipment: ["Barbell or dumbbell", "Bench"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Adductors"],
    difficulty: "Intermediate",
    jointStress: "low to moderate",
    movementPattern: "Hip extension",
    trainingUse: "Glute strength, lockout power, posterior-chain hypertrophy with low spinal load",
    description:
      "The hip thrust is a loaded hip-extension exercise performed with the upper back supported on a bench. It emphasizes the glutes and allows heavy loading without the same spinal demands as some hinge patterns.",
    setup:
      "Set the upper back on a bench, position the load over the hips, and plant the feet so the shins can be close to vertical near the top. Brace the trunk and keep the chin slightly tucked.",
    execution:
      "Drive through the heels and extend the hips until the torso and thighs form a strong line. Keep the ribs controlled and avoid arching through the low back. Lower under control until the hips return to the start.",
    breathing: "Inhale before driving up. Exhale near the top as the hips lock out under control.",
    tempo: "Lift with steady power, pause briefly at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the upper back on the bench, place the load over the hips, plant the feet, and brace before lifting." },
      { title: "Mid", description: "Drive through the heels and extend the hips while keeping the ribs controlled and the chin tucked." },
      { title: "Peak", description: "Reach full hip extension with the glutes squeezed and the torso level, not overarched." },
      { title: "Finish", description: "Lower the hips under control until you return to the starting position and reset tension." }
    ],
    commonMistakes: [
      "Overarching the low back instead of finishing with the glutes",
      "Setting the feet too far away or too close",
      "Driving mostly through the toes",
      "Losing upper-back support on the bench",
      "Dropping the load too quickly"
    ],
    safetyNotes: [
      "Pad the hips if the load position is uncomfortable.",
      "Use a setup that keeps the neck relaxed and the upper back securely supported.",
      "Reduce load if the movement shifts into the low back instead of the glutes."
    ],
    modifications: ["Use a dumbbell instead of a barbell", "Reduce range of motion", "Use glute bridge on the floor"],
    progressions: ["Increase load gradually", "Pause longer at the top", "Use single-leg variations later"],
    regressions: ["Glute bridge", "Bodyweight hip thrust", "Frog pump"],
    cues: ["Drive through the heels", "Ribs stay down", "Finish with glutes not low back"]
  },
  "glute bridge": {
    category: "Glutes",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Adductors"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip extension",
    trainingUse: "Glute activation, low-load posterior-chain work, warm-up and recovery-friendly strength",
    description:
      "The glute bridge is a floor-based hip-extension exercise that trains the glutes without heavy loading. It is useful for glute activation, early strength work, and low-stress accessory training.",
    setup:
      "Lie on your back with knees bent and feet flat about hip width apart. Keep the arms relaxed at the sides, brace lightly, and set the heels where you can feel the glutes drive the movement.",
    execution:
      "Press through the heels and lift the hips until the knees, hips, and shoulders line up. Keep the ribs controlled and avoid pushing the movement into the low back. Lower slowly to the floor and repeat.",
    breathing: "Inhale before lifting. Exhale as you drive the hips up.",
    tempo: "Lift smoothly, hold a brief squeeze at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Lie with feet planted, knees bent, ribs controlled, and the heels set where the glutes can drive the rep." },
      { title: "Mid", description: "Press through the heels and raise the hips while keeping the trunk quiet and the knees stable." },
      { title: "Peak", description: "Reach a strong top position with the glutes squeezed and the torso level, not arched." },
      { title: "Finish", description: "Lower the hips back to the floor under control and reset before the next rep." }
    ],
    commonMistakes: [
      "Pushing mostly through the toes",
      "Overarching the low back at the top",
      "Letting the knees collapse inward",
      "Rushing the lowering phase",
      "Using too much hamstring tension instead of glute drive"
    ],
    safetyNotes: [
      "Keep the range pain-free and stop if the movement shifts into the low back.",
      "Adjust foot distance until the glutes, not the hamstrings, lead the rep.",
      "Pause at the top only if you can keep the ribs controlled."
    ],
    modifications: ["Use a shorter range", "Place a pad under the head or upper back for comfort", "Use isometric holds"],
    progressions: ["Add a dumbbell across the hips", "Use a longer pause at the top", "Progress to hip thrust"],
    regressions: ["Reduced-range bridge", "Glute squeeze isometric", "Frog pump"],
    cues: ["Drive through the heels", "Squeeze the glutes at the top", "Lower under control"]
  },
  "romanian deadlift": {
    category: "Back / Legs",
    equipment: ["Barbell or dumbbells"],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Spinal erectors", "Lats", "Upper back", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Hip hinge",
    trainingUse: "Posterior-chain strength, hinge skill, hamstring loading without pulling from the floor",
    description:
      "The Romanian deadlift is a hip-hinge exercise where the load travels down the legs without touching the floor between reps. It emphasizes the hamstrings and glutes while reinforcing controlled hinge mechanics.",
    setup:
      "Stand tall holding the load close to the thighs. Unlock the knees slightly, brace the trunk, set the shoulders down and back, and prepare to hinge from the hips rather than squat down.",
    execution:
      "Push the hips back and let the load slide down the thighs and shins while keeping the spine neutral. Lower only as far as the hamstrings allow without losing position, then drive the hips forward to stand back up.",
    breathing: "Inhale and brace before lowering. Exhale as you stand back up through the hardest part.",
    tempo: "Lower for 2-3 seconds, feel the hamstrings load, then stand with steady power.",
    stepSequence: [
      { title: "Start", description: "Stand tall with the load close, soften the knees slightly, brace the trunk, and prepare to hinge." },
      { title: "Mid", description: "Push the hips back while the load tracks close to the legs and the spine stays neutral." },
      { title: "Peak", description: "Reach the deepest hinge you can control while the hamstrings stay loaded and the shoulders remain set." },
      { title: "Finish", description: "Drive the hips forward and stand tall without leaning backward at lockout." }
    ],
    commonMistakes: [
      "Turning the hinge into a squat by bending the knees too much",
      "Letting the load drift away from the body",
      "Rounding through the low or upper back",
      "Dropping too deep and losing hamstring tension",
      "Snapping the hips through too aggressively at the top"
    ],
    safetyNotes: [
      "Only lower through the range you can control with a neutral spine.",
      "Keep the load close to reduce low-back strain.",
      "Reduce load if you cannot feel the hamstrings controlling the hinge."
    ],
    modifications: ["Use dumbbells", "Start from blocks", "Shorten the range of motion"],
    progressions: ["Increase load gradually", "Add tempo", "Use pause reps just below the knee"],
    regressions: ["Hip hinge drill", "Kettlebell deadlift", "Band hip hinge"],
    cues: ["Push the hips back", "Load the hamstrings", "Keep the bar or bells close"]
  },
  "band hip hinge": {
    category: "Back / Legs",
    equipment: ["Resistance band"],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Spinal erectors", "Core", "Lats"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Hip hinge",
    trainingUse: "Home hinge training, hamstring and glute pattern practice, posterior-chain control",
    description:
      "The band hip hinge is a hinge pattern performed against resistance-band tension. It is useful for learning how to load the hips and hamstrings without heavy free weights.",
    setup:
      "Stand on the band and hold the ends or loop it securely so the tension stays close to the body. Soften the knees slightly, brace the trunk, and keep the shoulders organized before hinging.",
    execution:
      "Push the hips back while the band stays close and the spine remains neutral. Feel the hamstrings load as the torso inclines forward. Drive the hips forward to return to standing without leaning back.",
    breathing: "Inhale before hinging. Exhale as you stand back up.",
    tempo: "Lower into the hinge for 2-3 seconds and stand smoothly against the band tension.",
    stepSequence: [
      { title: "Start", description: "Stand on the band, soften the knees, brace the trunk, and create even tension before moving." },
      { title: "Mid", description: "Push the hips back while the band tracks close and the torso inclines forward under control." },
      { title: "Peak", description: "Reach the deepest hinge you can hold while keeping the hamstrings loaded and the back neutral." },
      { title: "Finish", description: "Drive the hips forward and return to standing without letting the band yank you out of position." }
    ],
    commonMistakes: [
      "Squatting down instead of hinging back",
      "Letting the band pull the torso forward",
      "Rounding through the back",
      "Locking the knees straight",
      "Snapping upright too quickly"
    ],
    safetyNotes: [
      "Check the band before use and keep the tension even across both sides.",
      "Reduce resistance if you cannot keep the back neutral.",
      "Stop the range before the hinge turns into spinal flexion."
    ],
    modifications: ["Use a lighter band", "Reduce range of motion", "Practice bodyweight hinge reps first"],
    progressions: ["Use a stronger band", "Add a pause at the loaded hinge position", "Progress to Romanian deadlift"],
    regressions: ["Hip hinge drill", "Wall tap hinge", "Kettlebell hinge with light load"],
    cues: ["Hips go back first", "Keep the band close", "Stand through the glutes"]
  },
  "band calf raise": {
    category: "Legs",
    equipment: ["Resistance band"],
    primaryMuscles: ["Calves"],
    secondaryMuscles: ["Feet", "Ankles"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Ankle plantar flexion",
    trainingUse: "Calf strength, ankle stiffness, lower-leg accessory work at home",
    description:
      "The band calf raise trains the calf muscles by pressing through the forefoot against resistance-band tension. It is useful for home calf work and ankle-strength accessory training.",
    setup:
      "Stand on the band and position it so the resistance loads the ankles through the full raise. Hold onto support if needed, keep the feet planted evenly through the ball of the foot, and brace lightly.",
    execution:
      "Press through the forefoot to rise onto the toes under control. Squeeze the calves at the top, then lower the heels slowly while keeping tension through the band.",
    breathing: "Exhale as you rise. Inhale as you lower.",
    tempo: "Lift for 1-2 seconds, pause briefly at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the band securely, plant the forefoot evenly, and brace lightly before rising." },
      { title: "Mid", description: "Press through the ball of the foot and lift the heels while keeping the ankles aligned." },
      { title: "Peak", description: "Reach the top position with the calves squeezed and the pressure centered through the forefoot." },
      { title: "Finish", description: "Lower the heels slowly while keeping tension on the band and control through the ankles." }
    ],
    commonMistakes: [
      "Rolling to the outside or inside of the foot",
      "Dropping the heels too quickly",
      "Bouncing through the bottom",
      "Using momentum instead of calf contraction",
      "Starting with uneven band tension"
    ],
    safetyNotes: [
      "Use a support if balance interferes with calf loading.",
      "Move through a pain-free ankle range.",
      "Reduce tension if the band pulls the feet out of alignment."
    ],
    modifications: ["Use a lighter band", "Perform both legs together", "Shorten the range slightly"],
    progressions: ["Use a stronger band", "Add a longer pause at the top", "Progress to single-leg raises"],
    regressions: ["Bodyweight calf raise", "Supported calf raise hold", "Seated calf raise with light load"],
    cues: ["Press through the forefoot", "Own the top squeeze", "Lower slowly"]
  },
  "assisted pull-up": {
    category: "Back",
    equipment: ["Pull-up station", "Band or machine assist"],
    primaryMuscles: ["Latissimus dorsi", "Teres major", "Biceps"],
    secondaryMuscles: ["Rhomboids", "Lower traps", "Core", "Forearms"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Vertical pull",
    trainingUse: "Vertical pulling strength, pull-up skill building, assisted upper-back development",
    description:
      "The assisted pull-up is a vertical pull performed with external assistance from a band or machine. It helps build the strength and position needed for strict pull-ups while keeping the rep pattern honest.",
    setup:
      "Set the assistance level so you can control the full rep. Grip the bar evenly, set the shoulders down and back, brace the trunk, and start from a stable hang without excessive swinging.",
    execution:
      "Pull the elbows down toward the ribs and bring the chest toward the bar. Keep the shoulders controlled instead of shrugging into the ears. Lower back to the hang under control without dropping through the bottom.",
    breathing: "Inhale before pulling. Exhale as you move through the hardest part of the rep.",
    tempo: "Pull with intent, pause briefly at the top if controlled, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Grip the bar, set the shoulders, brace the trunk, and begin from a controlled assisted hang." },
      { title: "Mid", description: "Drive the elbows down and back while the chest rises toward the bar." },
      { title: "Peak", description: "Reach the top with the upper back engaged and the shoulders still organized, not shrugged." },
      { title: "Finish", description: "Lower under control back to the start and keep tension before the next rep begins." }
    ],
    commonMistakes: [
      "Using too much assistance and losing the real pull-up pattern",
      "Shrugging the shoulders toward the ears",
      "Kipping or swinging to finish the rep",
      "Dropping too fast into the bottom",
      "Leading only with the chin instead of the elbows"
    ],
    safetyNotes: [
      "Use enough assistance to keep the full range controlled.",
      "Avoid jerking out of the bottom hang.",
      "Stop if the shoulders lose position before the lats and arms fatigue."
    ],
    modifications: ["Increase assistance", "Limit the range to the strongest section", "Use neutral-grip handles if available"],
    progressions: ["Reduce assistance gradually", "Pause at the top", "Use slow eccentric lowering"],
    regressions: ["Band pulldown", "Lat pulldown", "Pull-up negative"],
    cues: ["Elbows drive to the ribs", "Shoulders stay down", "Lower under control"]
  },
  "pull-up negative": {
    category: "Back",
    equipment: ["Pull-up bar", "Step or box"],
    primaryMuscles: ["Latissimus dorsi", "Biceps", "Lower traps"],
    secondaryMuscles: ["Rhomboids", "Forearms", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Vertical pull",
    trainingUse: "Eccentric pull-up strength, vertical pulling control, pull-up skill development",
    description:
      "The pull-up negative starts from the top position of a pull-up and focuses on lowering under control. It builds eccentric strength through the lats, arms, and upper back.",
    setup:
      "Use a box or step to begin at the top of the pull-up with the chin over the bar. Grip the bar firmly, set the shoulders down, and brace the trunk before removing support.",
    execution:
      "Lower slowly from the top by controlling shoulder position and elbow extension. Keep the chest organized and avoid dropping through the midpoint. Finish in a controlled hang or end the rep before the shoulders lose position.",
    breathing: "Inhale at the top. Exhale slowly as you control the descent.",
    tempo: "Lower for 3-5 seconds with smooth control through the entire range.",
    stepSequence: [
      { title: "Start", description: "Step into the top position, set the shoulders, and brace before taking weight off the support." },
      { title: "Mid", description: "Lower slowly while the elbows open and the shoulders stay packed down." },
      { title: "Peak", description: "Control the hardest middle range instead of dropping through it." },
      { title: "Finish", description: "Reach the bottom under control and reset on the box before starting the next rep." }
    ],
    commonMistakes: [
      "Dropping too fast after the top position",
      "Losing shoulder control in the midpoint",
      "Kicking or twisting to survive the descent",
      "Starting from a weak top position",
      "Skipping the reset between reps"
    ],
    safetyNotes: [
      "Use a box to reset each rep safely instead of jumping wildly.",
      "End the range early if shoulder position breaks before the hang.",
      "Reduce volume if elbow or shoulder irritation builds quickly."
    ],
    modifications: ["Shorten the lowering range", "Use a thicker band for assistance on the way down", "Use smaller sets of singles"],
    progressions: ["Lengthen the eccentric", "Add pauses during the descent", "Progress to assisted or strict pull-ups"],
    regressions: ["Assisted pull-up", "Band pulldown", "Scap pull-up hold"],
    cues: ["Own the descent", "Shoulders stay packed", "Reset every rep"]
  },
  "back widow": {
    category: "Back",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Upper back", "Rear deltoids", "Rhomboids"],
    secondaryMuscles: ["Triceps", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal pull / upper-back extension",
    trainingUse: "Upper-back activation, posture support, bodyweight pulling assistance",
    description:
      "The back widow is a bodyweight upper-back drill where you drive through the elbows to lift the chest and upper torso. It helps train the upper back without needing a row station or pull-up bar.",
    setup:
      "Lie on your back with knees bent and feet flat. Place the elbows on the floor beside the torso, brace lightly through the trunk, and keep the neck long.",
    execution:
      "Drive the elbows into the floor to lift the chest and upper back. Focus on squeezing the mid-back rather than arching the neck. Lower back down softly and repeat with control.",
    breathing: "Exhale as you lift. Inhale as you lower.",
    tempo: "Lift for 1-2 seconds, hold briefly at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the elbows by the sides, feet planted, trunk lightly braced, and neck long." },
      { title: "Mid", description: "Drive through the elbows to lift the chest and upper back off the floor." },
      { title: "Peak", description: "Pause at the top with the upper back engaged and the shoulders away from the ears." },
      { title: "Finish", description: "Lower back down softly without collapsing or letting the neck take over." }
    ],
    commonMistakes: [
      "Cranking the neck backward to create the lift",
      "Shrugging the shoulders into the ears",
      "Bridging from the hips instead of lifting from the upper back",
      "Dropping back to the floor with no control",
      "Placing the elbows too far away from the torso"
    ],
    safetyNotes: [
      "Keep the neck long and stop if the front of the shoulder feels pinchy.",
      "Use a smaller lift if you cannot keep the tension in the upper back.",
      "Move slowly enough to separate upper-back work from momentum."
    ],
    modifications: ["Reduce range of motion", "Use isometric holds", "Place the feet closer to the hips for more support"],
    progressions: ["Hold longer at the top", "Use slower lowering", "Progress to band or dumbbell rows"],
    regressions: ["Band pull-apart", "Chest-supported row", "Scap retraction drill"],
    cues: ["Drive through the elbows", "Lift the chest not the chin", "Lower softly"]
  },
  "band row": {
    category: "Back",
    equipment: ["Resistance band"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Middle traps"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Horizontal pull",
    trainingUse: "Home rowing strength, posture support, upper-back and lat training",
    description:
      "The band row is a horizontal pulling exercise using resistance-band tension. It trains the lats, mid-back, and arms while being easy to set up at home.",
    setup:
      "Anchor the band in front of you at around chest or stomach height. Stand or sit in a stable position with the arms extended, ribs stacked, and shoulders relaxed away from the ears.",
    execution:
      "Row the hands toward the lower ribs by driving the elbows back. Keep the torso quiet and avoid shrugging. Return slowly until the arms extend again while the band stays under control.",
    breathing: "Exhale as you row. Inhale as you return.",
    tempo: "Pull for 1-2 seconds and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the anchor, extend the arms, brace lightly, and keep the shoulders relaxed before rowing." },
      { title: "Mid", description: "Drive the elbows back toward the ribs while the torso stays quiet." },
      { title: "Peak", description: "Pause at full row with the upper back engaged and the shoulders still down." },
      { title: "Finish", description: "Return the arms forward under control without letting the band snap you open." }
    ],
    commonMistakes: [
      "Shrugging the shoulders upward",
      "Leaning back to finish the rep",
      "Letting the elbows flare too high",
      "Snapping the band back out",
      "Using an unstable anchor"
    ],
    safetyNotes: [
      "Check the band and anchor before each set.",
      "Use a resistance level that keeps the torso quiet.",
      "Stop if the shoulder position cannot stay controlled at the end range."
    ],
    modifications: ["Use a lighter band", "Use a shorter range of motion", "Perform one arm at a time"],
    progressions: ["Use a stronger band", "Add a pause at full row", "Slow the return"],
    regressions: ["Doorframe row", "Chest-supported row", "Seated light band row"],
    cues: ["Elbows drive back", "Shoulders stay down", "Return under control"]
  },
  "doorframe row": {
    category: "Back",
    equipment: ["Doorframe or sturdy support"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Biceps"],
    secondaryMuscles: ["Rear deltoids", "Core", "Forearms"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Horizontal pull",
    trainingUse: "Bodyweight rowing, home pulling pattern practice, upper-back and arm strength",
    description:
      "The doorframe row is a home rowing variation where you lean back while holding a stable frame and pull the body forward. It builds pulling strength with bodyweight resistance.",
    setup:
      "Stand facing a sturdy doorframe or anchor point and grip it securely with both hands. Walk the feet forward enough to create a lean, keep the body braced, and trust only a stable structure.",
    execution:
      "Pull the body toward the hands by driving the elbows back and squeezing the upper back. Keep the torso rigid and avoid shrugging. Lower back to the lean position under control.",
    breathing: "Exhale as you row in. Inhale as you lower back out.",
    tempo: "Pull smoothly and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Grip the frame securely, walk the feet forward, lean back under control, and brace the trunk." },
      { title: "Mid", description: "Drive the elbows back and pull the chest toward the hands while keeping the body rigid." },
      { title: "Peak", description: "Reach the top with the upper back and arms engaged and the shoulders away from the ears." },
      { title: "Finish", description: "Lower back into the leaning start position under control without losing body tension." }
    ],
    commonMistakes: [
      "Using an unstable frame or surface",
      "Shrugging instead of rowing with the back",
      "Letting the hips sag out of line",
      "Jerking into the top position",
      "Lowering too fast back into the lean"
    ],
    safetyNotes: [
      "Only use a structure you trust completely to hold bodyweight.",
      "Shorten the lean if you cannot control the return.",
      "Stop if shoulder position breaks or grip security changes."
    ],
    modifications: ["Use a smaller lean angle", "Bend the knees more", "Row one arm at a time only if the setup stays secure"],
    progressions: ["Increase the lean angle", "Add a pause at the top", "Progress to inverted row"],
    regressions: ["Band row", "Chest-supported row", "Seated band row"],
    cues: ["Body stays rigid", "Pull the elbows back", "Use only a stable support"]
  },
  "inverted row": {
    category: "Back",
    equipment: ["Bar or suspension setup"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Middle traps"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Core"],
    difficulty: "Intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal pull",
    trainingUse: "Bodyweight rowing strength, upper-back development, pulling control with trunk tension",
    description:
      "The inverted row is a bodyweight row performed under a bar or suspension setup. It trains the lats, upper back, and arms while requiring the body to stay rigid from head to heels.",
    setup:
      "Position yourself under a bar or straps and grip them evenly. Set the body in a straight line, keep the heels planted, brace the trunk, and begin with the arms extended and shoulders organized.",
    execution:
      "Pull the chest toward the bar by driving the elbows back. Keep the body rigid and avoid shrugging. Lower back down under control until the arms extend fully again.",
    breathing: "Exhale as you pull. Inhale as you lower.",
    tempo: "Row up with intent, pause briefly if controlled, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the grip, brace the trunk, keep the body straight, and begin from an extended-arm hang under the bar." },
      { title: "Mid", description: "Drive the elbows back and pull the chest upward while the body stays rigid." },
      { title: "Peak", description: "Reach the top with the chest close to the bar and the shoulders still down and back." },
      { title: "Finish", description: "Lower under control until the arms extend fully without losing body tension." }
    ],
    commonMistakes: [
      "Sagging through the hips",
      "Shrugging into the shoulders",
      "Pulling the chin up instead of the chest",
      "Using momentum to finish the rep",
      "Cutting the bottom range short"
    ],
    safetyNotes: [
      "Adjust the bar height so the full rep stays controlled.",
      "Keep the setup stable before every set.",
      "Reduce the angle if the trunk cannot stay rigid through the rep."
    ],
    modifications: ["Raise the bar higher", "Bend the knees", "Shorten the range slightly while learning control"],
    progressions: ["Lower the bar height", "Elevate the feet", "Pause at the top"],
    regressions: ["Band row", "Doorframe row", "Chest-supported row"],
    cues: ["Body stays in one line", "Chest pulls to the bar", "Lower with control"]
  },
  "lat pulldown": {
    category: "Back",
    equipment: ["Cable or pulldown machine"],
    primaryMuscles: ["Latissimus dorsi", "Teres major", "Biceps"],
    secondaryMuscles: ["Rhomboids", "Lower traps", "Forearms"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Vertical pull",
    trainingUse: "Lat strength, vertical pulling volume, pull-up accessory work",
    description:
      "The lat pulldown is a machine-based vertical pull that trains the lats, upper back, and arms. It is a useful option for building vertical pulling strength before or alongside pull-ups.",
    setup:
      "Sit tall, secure the thighs under the pad, and take a grip you can control without shrugging. Brace the trunk lightly, keep the chest organized, and begin with the arms extended overhead.",
    execution:
      "Pull the bar or handles down by driving the elbows toward the ribs. Keep the shoulders down and avoid leaning back excessively. Let the arms return overhead slowly without losing tension.",
    breathing: "Exhale as you pull down. Inhale as you return overhead.",
    tempo: "Pull for 1-2 seconds and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the grip, lock the thighs in place, sit tall, and begin with the arms extended overhead." },
      { title: "Mid", description: "Drive the elbows down and toward the ribs while the chest stays organized and the shoulders stay down." },
      { title: "Peak", description: "Reach the strongest contraction with the bar near the upper chest and the lats fully engaged." },
      { title: "Finish", description: "Return the bar overhead slowly without shrugging or letting the weight stack crash." }
    ],
    commonMistakes: [
      "Leaning back too far to finish the rep",
      "Shrugging the shoulders toward the ears",
      "Pulling mostly with the arms",
      "Letting the weight stack slam on the return",
      "Using more load than the shoulders can control"
    ],
    safetyNotes: [
      "Use a weight you can return overhead slowly and smoothly.",
      "Keep the shoulder range pain-free and avoid yanking from the top.",
      "Reduce load if you have to lean back to finish every rep."
    ],
    modifications: ["Use a neutral-grip attachment", "Reduce the range slightly", "Use a lighter load with slower tempo"],
    progressions: ["Increase load gradually", "Add pauses at the bottom", "Use single-arm cable pulldowns"],
    regressions: ["Band pulldown", "Assisted pull-up", "Half-kneeling single-arm pulldown"],
    cues: ["Elbows go to the ribs", "Shoulders stay down", "Control the return overhead"]
  },
  "pallof press": {
    category: "Core",
    equipment: ["Cable or resistance band"],
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Glutes", "Shoulders"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Anti-rotation press",
    trainingUse: "Core stability, anti-rotation strength, trunk control for lifting and sport",
    description:
      "The Pallof press is an anti-rotation core exercise where you press a cable or band straight out while resisting the pull of the anchor. It trains the trunk to stay stable instead of twisting.",
    setup:
      "Stand or kneel sideways to the anchor and hold the handle at chest height. Set the feet or knees in a stable base, brace the trunk, squeeze the glutes lightly, and keep the ribs stacked.",
    execution:
      "Press the hands straight out in front of the chest without letting the torso rotate. Pause briefly at full reach, then bring the hands back in under control while keeping the body square.",
    breathing: "Exhale as you press out. Inhale as you return the hands back in.",
    tempo: "Press smoothly, pause briefly at full reach, and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the body square to the front, hold the handle at the chest, and brace before pressing." },
      { title: "Mid", description: "Press the hands straight out while resisting the urge to rotate toward the anchor." },
      { title: "Peak", description: "Pause at full extension with the ribs stacked, hips steady, and trunk still square." },
      { title: "Finish", description: "Bring the hands back to the chest slowly without letting the torso twist or lean." }
    ],
    commonMistakes: [
      "Rotating toward the anchor",
      "Leaning backward as the hands press out",
      "Letting the shoulders shrug up",
      "Rushing the return to the chest",
      "Using so much resistance that the torso cannot stay square"
    ],
    safetyNotes: [
      "Use a resistance level that allows a square, controlled trunk position.",
      "Keep the knees soft and glutes lightly engaged to support the pelvis.",
      "Stop if low-back compensation replaces abdominal tension."
    ],
    modifications: ["Use a lighter band or cable setting", "Shorten the press distance", "Perform tall-kneeling instead of standing"],
    progressions: ["Pause longer at full extension", "Use a stronger band", "Perform in split stance"],
    regressions: ["Pallof hold", "Short-range press-outs", "Dead bug variation"],
    cues: ["Stay square to the front", "Press straight out", "Do not let the band twist you"]
  },
  "dead bug": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Deep core", "Rectus abdominis"],
    secondaryMuscles: ["Obliques", "Hip flexors"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Anti-extension core",
    trainingUse: "Core control, ribcage and pelvis positioning, trunk stability for lifting",
    description:
      "The dead bug is a supine core exercise that teaches the trunk to resist extension while the arms and legs move. It builds control through the core without loading the spine heavily.",
    setup:
      "Lie on your back with arms reaching up and hips and knees bent to tabletop. Flatten the low back gently toward the floor by stacking the ribs over the pelvis, then brace lightly.",
    execution:
      "Reach one arm and the opposite leg away from the body while keeping the low back from lifting. Move slowly, return to the start, and alternate sides without losing trunk position.",
    breathing: "Exhale as the arm and leg reach away. Inhale as you return to the start.",
    tempo: "Move each rep slowly with a full controlled reach and return.",
    stepSequence: [
      { title: "Start", description: "Set arms overhead of the shoulders, knees over the hips, and flatten the low back gently into the floor." },
      { title: "Mid", description: "Reach one arm and the opposite leg away while keeping the ribs down and the trunk quiet." },
      { title: "Peak", description: "Pause at the farthest controlled reach without the low back lifting away from the floor." },
      { title: "Finish", description: "Return to tabletop under control and reset before switching sides." }
    ],
    commonMistakes: [
      "Letting the low back arch off the floor",
      "Moving too fast to keep tension",
      "Reaching farther than trunk control allows",
      "Holding the breath throughout the rep",
      "Shrugging the shoulders toward the ears"
    ],
    safetyNotes: [
      "Shorten the range if the low back lifts or the ribs flare.",
      "Use slow breaths to help keep the trunk stacked.",
      "Stop the rep before the movement turns into a hip-flexor-only drill."
    ],
    modifications: ["Move only the legs", "Move only the arms", "Use a shorter reach"],
    progressions: ["Pause longer at full reach", "Use a slower tempo", "Hold a light band or weight overhead"],
    regressions: ["Bent-knee march", "Supine heel tap", "Pallof hold"],
    cues: ["Low back stays heavy", "Ribs stay down", "Reach only as far as you can control"]
  },
  "mountain climber": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Core", "Hip flexors"],
    secondaryMuscles: ["Shoulders", "Chest", "Quads"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Plank drive / conditioning",
    trainingUse: "Conditioning, trunk stiffness under motion, low-equipment cardio intervals",
    description:
      "The mountain climber is a plank-based conditioning drill where the knees drive forward one at a time. It challenges the core and shoulders while raising the heart rate.",
    setup:
      "Start in a strong plank with hands under the shoulders, core braced, and body in a straight line from head to heels. Spread the fingers and push the floor away so the shoulders stay active.",
    execution:
      "Drive one knee toward the chest while the other leg stays extended. Switch legs smoothly without letting the hips bounce high or sag low. Keep the trunk braced and shoulders stable throughout.",
    breathing: "Use short steady breaths and avoid holding your breath as the pace increases.",
    tempo: "Move fast enough to raise the heart rate while keeping the plank shape under control.",
    stepSequence: [
      { title: "Start", description: "Set a strong plank with hands under the shoulders, core braced, and hips level." },
      { title: "Mid", description: "Drive one knee forward under the torso while the opposite leg stays long and the shoulders stay stacked." },
      { title: "Peak", description: "Reach the most compressed knee position you can control without the hips hiking or sagging." },
      { title: "Finish", description: "Switch legs smoothly and keep the body in a stable plank as the pattern continues." }
    ],
    commonMistakes: [
      "Bouncing the hips up and down",
      "Letting the shoulders collapse behind the hands",
      "Running the legs without trunk control",
      "Cutting the knee drive short with sloppy rhythm",
      "Holding the breath as speed rises"
    ],
    safetyNotes: [
      "Elevate the hands if wrist or shoulder loading is too high.",
      "Slow the pace if the plank shape breaks down.",
      "Stop if low-back discomfort replaces core tension."
    ],
    modifications: ["Perform slower alternating knee drives", "Elevate the hands on a bench", "Use a shorter range of motion"],
    progressions: ["Increase pace", "Add timed intervals", "Use sliding discs for smoother knee drives"],
    regressions: ["High plank march", "Incline mountain climber", "Dead bug"],
    cues: ["Keep the plank shape", "Drive the knee under control", "Shoulders stay stacked over hands"]
  },
  "high knees": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hip flexors", "Quads", "Calves"],
    secondaryMuscles: ["Core", "Glutes"],
    difficulty: "Beginner",
    jointStress: "moderate",
    movementPattern: "Running drill / conditioning",
    trainingUse: "Cardio intervals, sprint mechanics practice, warm-up and footwork conditioning",
    description:
      "High knees are a running-in-place drill where the knees drive upward quickly while the feet cycle underneath the body. They build conditioning and reinforce active leg turnover.",
    setup:
      "Stand tall with ribs stacked over the hips and arms ready to move naturally. Brace lightly through the trunk and stay tall through the crown of the head.",
    execution:
      "Drive the knees upward one at a time while staying light on the balls of the feet. Keep the torso tall, use the arms rhythmically, and land quickly instead of stomping the floor.",
    breathing: "Use short rhythmic breaths that match the pace of the drill.",
    tempo: "Move with quick light contacts while keeping posture controlled.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace lightly, and begin with fast but controlled foot contacts under the hips." },
      { title: "Mid", description: "Drive each knee upward while the opposite arm swings naturally and the torso stays tall." },
      { title: "Peak", description: "Reach the highest knee position you can maintain without leaning back or stomping the floor." },
      { title: "Finish", description: "Land lightly, cycle the next leg through, and maintain quick rhythm without losing posture." }
    ],
    commonMistakes: [
      "Leaning backward to lift the knees higher",
      "Landing heavily instead of staying light",
      "Letting the knees rise with no arm rhythm",
      "Shortening posture as fatigue builds",
      "Overstriding in place"
    ],
    safetyNotes: [
      "Use a surface with enough grip to stay light and quick.",
      "Lower the pace if shin, calf, or knee discomfort builds.",
      "Keep the drill tall and rhythmic instead of forcing maximum knee height."
    ],
    modifications: ["March high knees", "Reduce the pace", "Use shorter work intervals"],
    progressions: ["Increase speed", "Add longer intervals", "Use them inside conditioning circuits"],
    regressions: ["March in place", "Low knee drive march", "Step-up pattern"],
    cues: ["Stay tall", "Feet stay light", "Drive the knee and cycle quickly"]
  },
  "burpee": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Quads", "Chest", "Shoulders"],
    secondaryMuscles: ["Triceps", "Core", "Glutes", "Calves"],
    difficulty: "Intermediate",
    jointStress: "moderate to high",
    movementPattern: "Total-body conditioning",
    trainingUse: "Conditioning, total-body power-endurance, minimal-equipment high-output intervals",
    description:
      "The burpee combines a squat, plank, and explosive stand or jump into one full-body conditioning movement. It raises the heart rate quickly while challenging coordination and trunk control.",
    setup:
      "Stand tall with feet under the hips and brace lightly through the trunk. Keep enough space around you to move into a plank and back to standing safely.",
    execution:
      "Squat down and place the hands on the floor, kick or step the feet back into a strong plank, then return the feet forward and stand or jump tall. Keep each phase controlled instead of slamming through the floor.",
    breathing: "Exhale during the explosive stand or jump and use quick recovery breaths between reps.",
    tempo: "Move with a controlled drop, crisp plank transition, and strong stand back up.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace lightly, and squat down until the hands can plant on the floor." },
      { title: "Mid", description: "Kick or step the feet back into a strong plank without letting the hips sag." },
      { title: "Peak", description: "Return the feet forward under the body and organize the stance for a strong stand or jump." },
      { title: "Finish", description: "Stand or jump tall, reset your balance, and begin the next rep without collapsing." }
    ],
    commonMistakes: [
      "Slamming into the floor with no plank control",
      "Letting the hips sag in the plank phase",
      "Landing the feet too wide or too narrow on the return",
      "Rounding excessively through the stand",
      "Turning every rep into a rushed collapse"
    ],
    safetyNotes: [
      "Step the feet instead of jumping if impact or control is a limiter.",
      "Keep the plank phase clean rather than chasing speed at all costs.",
      "Stop if low-back, wrist, or shoulder discomfort builds quickly."
    ],
    modifications: ["Use a squat-thrust with no jump", "Step back and forward instead of jumping", "Use hands on an elevated surface"],
    progressions: ["Add a jump", "Increase pace", "Use interval sets with controlled rest"],
    regressions: ["Squat thrust", "Mountain climber", "High plank walkout"],
    cues: ["Hands plant cleanly", "Own the plank", "Stand back up with control"]
  },
  "rower sprint": {
    category: "Conditioning",
    equipment: ["Rowing machine"],
    primaryMuscles: ["Quads", "Glutes", "Upper back"],
    secondaryMuscles: ["Hamstrings", "Core", "Lats", "Biceps"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Rowing sprint",
    trainingUse: "Conditioning intervals, full-body power endurance, machine-based sprint work",
    description:
      "The rower sprint is a high-effort interval on the rowing machine. It combines leg drive, trunk stiffness, and upper-body finish into repeated powerful strokes.",
    setup:
      "Strap the feet securely into the rower, set a damper or resistance you can move explosively, and sit tall with the handle in hand. Brace lightly and prepare to sequence the drive from legs to torso to arms.",
    execution:
      "Push through the legs first, then open the torso slightly and finish with the arms pulling the handle to the lower ribs. Recover in reverse order with control so the next stroke starts smoothly and powerfully.",
    breathing: "Use strong rhythmic breaths that match the sprint effort and avoid holding tension through multiple strokes.",
    tempo: "Drive each stroke hard, then recover just enough to keep the next stroke clean and repeatable.",
    stepSequence: [
      { title: "Start", description: "Set the catch position with the feet secure, torso tall, and handle ready for a strong first drive." },
      { title: "Mid", description: "Drive through the legs first while the handle stays connected and the torso remains braced." },
      { title: "Peak", description: "Finish the stroke with the torso slightly open and the handle drawn to the lower ribs." },
      { title: "Finish", description: "Recover in reverse order with control so the body returns smoothly into the next catch." }
    ],
    commonMistakes: [
      "Pulling with the arms before the legs drive",
      "Throwing the torso back too early",
      "Crashing into the catch on the recovery",
      "Using stroke rate with no power through the legs",
      "Losing posture as fatigue rises"
    ],
    safetyNotes: [
      "Choose an interval effort you can repeat without technique collapse.",
      "Keep the spine tall and controlled instead of rounding to chase speed.",
      "Stop the sprint set if the stroke sequence breaks down badly."
    ],
    modifications: ["Use shorter sprint intervals", "Lower the stroke rate slightly", "Use moderate-power rowing instead of max sprinting"],
    progressions: ["Increase interval intensity", "Add more rounds", "Use longer sprint durations"],
    regressions: ["Steady rowing", "Bike sprint", "High knees interval"],
    cues: ["Legs drive first", "Handle finishes to the ribs", "Recover smoothly"]
  },
  "biceps curl": {
    category: "Biceps",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Elbow flexion",
    trainingUse: "Arm strength, elbow-flexor development, upper-body accessory training",
    description:
      "The biceps curl trains the front of the upper arm by bending the elbow against resistance. It is most effective when the torso stays still and the arm does the work.",
    setup:
      "Stand tall with dumbbells at your sides, palms facing forward or slightly inward. Keep elbows close to the ribs, shoulders relaxed, wrists neutral, and core lightly braced.",
    execution:
      "Curl the dumbbells upward by bending the elbows. Keep the upper arms mostly still. Squeeze briefly near the top, then lower slowly until the arms extend again.",
    breathing: "Exhale as you curl up. Inhale as you lower.",
    tempo: "Curl for 1-2 seconds. Lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand tall with dumbbells at your sides, elbows close to the ribs, and wrists neutral." },
      { title: "Mid", description: "Curl the dumbbells upward without swinging the torso or letting elbows drift far forward." },
      { title: "Peak", description: "Reach the top with biceps engaged and shoulders relaxed." },
      { title: "Finish", description: "Lower the dumbbells slowly until the arms extend again under control." }
    ],
    commonMistakes: [
      "Swinging the torso to lift the weight",
      "Letting elbows drift too far forward",
      "Shrugging the shoulders",
      "Dropping the dumbbells quickly",
      "Bending the wrists backward"
    ],
    safetyNotes: [
      "Choose a load you can control without momentum.",
      "Keep wrists neutral and elbows comfortable.",
      "Reduce load if elbow discomfort appears."
    ],
    modifications: ["Curl one arm at a time or perform seated to reduce body swing."],
    progressions: ["Use heavier dumbbells", "Slow eccentric lowering", "Add paused reps"],
    regressions: ["Use lighter dumbbells", "Use a resistance band"],
    cues: ["Elbows stay quiet", "Curl with the arm, not the torso", "Lower slower than you lift"]
  },
  "split squat": {
    category: "Legs",
    equipment: ["Bodyweight or dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Split squat / single-leg squat",
    trainingUse: "Single-leg strength, balance, lower-body control, squat pattern development",
    description:
      "The split squat trains one leg at a time from a staggered stance. It builds lower-body strength and control without requiring the rear foot to be elevated.",
    setup:
      "Stand in a long staggered stance with one foot forward and one foot behind. Keep the front foot flat, back heel lifted, torso tall, and core braced.",
    execution:
      "Lower by bending both knees while keeping most of the work in the front leg. Let the back knee move toward the floor under control. Drive through the front foot to return to standing.",
    breathing: "Inhale as you lower. Exhale as you stand.",
    tempo: "Lower for 2-3 seconds. Stand smoothly without bouncing.",
    stepSequence: [
      { title: "Start", description: "Set a stable staggered stance with front foot flat, back heel raised, and torso tall." },
      { title: "Mid", description: "Bend both knees and lower straight down while keeping the front knee tracking over the toes." },
      { title: "Peak", description: "Reach the lowest controlled position with balance and front foot pressure maintained." },
      { title: "Finish", description: "Drive through the front foot and return to the starting stance without pushing hard off the back leg." }
    ],
    commonMistakes: [
      "Front foot too narrow or too close",
      "Knee collapsing inward",
      "Pushing mainly off the back leg",
      "Leaning too far forward",
      "Dropping too fast"
    ],
    safetyNotes: [
      "Use support if balance is limiting.",
      "Keep range pain-free around knees and hips.",
      "Start bodyweight before adding dumbbells."
    ],
    modifications: ["Hold onto a stable surface", "Reduce depth"],
    progressions: ["Add dumbbells", "Slow the lowering", "Pause near the bottom"],
    regressions: ["Supported split squat", "Low step-up"],
    cues: ["Front foot stays rooted", "Drop straight down", "Stand through the front leg"]
  },
  "good morning": {
    category: "Legs / Posterior Chain",
    equipment: ["Bodyweight", "Band", "Dumbbells", "Barbell"],
    primaryMuscles: ["Hamstrings", "Glutes", "Spinal erectors"],
    secondaryMuscles: ["Core", "Upper back"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Hip hinge",
    trainingUse: "Hip hinge practice, posterior-chain strength, hamstring and glute development",
    description:
      "The good morning is a hip-hinge exercise that trains the hamstrings, glutes, and back extensors. The movement is driven by pushing the hips back while keeping the spine stable.",
    setup:
      "Stand tall with feet about hip-width. Brace the core. If loaded, keep the load secure across the upper back, at the chest, or in the hands depending on variation.",
    execution:
      "Hinge by pushing the hips back while keeping the spine neutral and knees softly bent. Lower until you feel tension in the hamstrings, then drive hips forward to stand tall.",
    breathing: "Inhale and brace before hinging. Exhale as you return to standing.",
    tempo: "Hinge down for 2-3 seconds. Stand with control.",
    stepSequence: [
      { title: "Start", description: "Stand tall, brace the core, soften the knees, and set the load securely if using one." },
      { title: "Mid", description: "Push the hips back while keeping the spine long and chest controlled." },
      { title: "Peak", description: "Reach the deepest hinge you can control with hamstring tension and a neutral spine." },
      { title: "Finish", description: "Drive the hips forward and return to standing without leaning back." }
    ],
    commonMistakes: [
      "Rounding the lower back",
      "Turning the movement into a squat",
      "Locking the knees",
      "Going deeper than control allows",
      "Using too much load too soon"
    ],
    safetyNotes: [
      "Start very light until hinge mechanics are solid.",
      "Stop if the lower back takes over sharply.",
      "Keep the motion controlled and avoid bouncing."
    ],
    modifications: ["Use bodyweight only", "Hold a dowel to practice hinge alignment"],
    progressions: ["Add light load", "Slow tempo", "Paused hinge reps"],
    regressions: ["Hip hinge drill", "Romanian deadlift with dumbbells from a raised start"],
    cues: ["Hips move back", "Keep the spine long", "Stand by driving the hips through"]
  },
  "calf raise": {
    category: "Legs",
    equipment: ["Bodyweight", "Dumbbells", "Machine", "Step"],
    primaryMuscles: ["Calves"],
    secondaryMuscles: ["Foot and ankle stabilizers"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Ankle plantar flexion",
    trainingUse: "Calf strength, ankle control, lower-leg endurance",
    description:
      "The calf raise strengthens the calf muscles by lifting the heels and rising onto the balls of the feet. It can be done on flat ground or from a step for greater range.",
    setup:
      "Stand tall with feet about hip-width. Hold support for balance if needed. Keep toes pointed forward or slightly outward and weight balanced through the ball of the foot.",
    execution:
      "Raise the heels as high as controlled, pause briefly at the top, then lower slowly until heels return to the floor or below step level if using a step.",
    breathing: "Exhale as you rise. Inhale as you lower.",
    tempo: "Rise for 1 second. Pause briefly. Lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Stand tall with feet set and balance controlled." },
      { title: "Mid", description: "Push through the balls of the feet and lift the heels." },
      { title: "Peak", description: "Reach the highest controlled position with calves engaged." },
      { title: "Finish", description: "Lower slowly until heels return under control." }
    ],
    commonMistakes: [
      "Bouncing quickly",
      "Rolling ankles outward",
      "Using too little range",
      "Leaning heavily into support",
      "Letting knees collapse inward"
    ],
    safetyNotes: [
      "Use support if balance is unstable.",
      "Lower with control to protect the Achilles tendon.",
      "Avoid forcing deep stretch if calves or Achilles feel irritated."
    ],
    modifications: ["Use both legs", "Hold support"],
    progressions: ["Single-leg calf raise", "Weighted calf raise", "Step calf raise"],
    regressions: ["Seated calf raise", "Partial range calf raise"],
    cues: ["Push through the ball of the foot", "Pause at the top", "Lower under control"]
  },
  plank: {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals", "Deep core stabilizers"],
    secondaryMuscles: ["Glutes", "Shoulders", "Serratus anterior"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Anti-extension core",
    trainingUse: "Core stability, trunk control, posture support",
    description:
      "The plank is an isometric core exercise that trains the body to resist extension. The goal is to hold a strong straight-line position without the hips sagging or rising too high.",
    setup:
      "Place forearms on the floor with elbows under shoulders. Extend legs behind you, tuck toes, brace the core, and lightly squeeze glutes.",
    execution:
      "Hold the body in a straight line from head to heels. Keep ribs pulled down, hips level, and neck neutral. Breathe steadily without losing tension.",
    breathing: "Use slow controlled breaths while maintaining the brace.",
    tempo: "Hold steadily for the prescribed time. Quality matters more than duration.",
    stepSequence: [
      { title: "Start", description: "Set elbows under shoulders, extend legs, brace the core, and squeeze glutes lightly." },
      { title: "Mid", description: "Lift into a straight-line position with ribs down and hips level." },
      { title: "Peak", description: "Maintain full-body tension without sagging or hiking the hips." },
      { title: "Finish", description: "Lower with control and reset before form breaks." }
    ],
    commonMistakes: [
      "Letting hips sag",
      "Raising hips too high",
      "Holding breath",
      "Shrugging shoulders",
      "Looking too far forward"
    ],
    safetyNotes: [
      "Stop the set when position breaks.",
      "Reduce hold time if the lower back feels strained.",
      "Keep elbows comfortable under shoulders."
    ],
    modifications: ["Plank from knees", "Elevated forearm plank"],
    progressions: ["Longer holds", "Shoulder taps", "Weighted plank"],
    regressions: ["Knee plank", "Dead bug"],
    cues: ["Ribs stay down", "Squeeze glutes lightly", "Hold a straight line"]
  },
  "side plank": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Obliques", "Deep core stabilizers"],
    secondaryMuscles: ["Glutes", "Shoulders", "Hip abductors"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Anti-lateral-flexion core",
    trainingUse: "Lateral core stability, hip control, shoulder stability",
    description:
      "The side plank trains the core to resist side bending. It also challenges the shoulder, hips, and obliques to hold the body in a straight line.",
    setup:
      "Lie on one side with elbow under shoulder and legs stacked or staggered. Brace the core and align head, ribs, hips, and feet.",
    execution:
      "Lift the hips from the floor and hold a straight side-body line. Keep the shoulder packed, hips stacked, and ribs controlled. Lower with control when the hold is complete.",
    breathing: "Breathe slowly while keeping tension through the side body.",
    tempo: "Hold steadily for the prescribed time.",
    stepSequence: [
      { title: "Start", description: "Set the elbow under the shoulder and align the body on one side." },
      { title: "Mid", description: "Lift the hips and create a straight line from head to feet or knees." },
      { title: "Peak", description: "Hold the top position with obliques engaged and hips stacked." },
      { title: "Finish", description: "Lower the hips under control and reset before switching sides." }
    ],
    commonMistakes: [
      "Letting hips drop",
      "Rolling the chest toward the floor",
      "Shrugging the shoulder",
      "Holding breath",
      "Setting the elbow too far from the shoulder"
    ],
    safetyNotes: [
      "Use the knee-supported version if shoulder or core control is limited.",
      "Keep the neck neutral.",
      "Stop before the shoulder collapses."
    ],
    modifications: ["Perform from knees", "Stagger the feet for balance"],
    progressions: ["Full side plank", "Top-leg raise", "Longer hold"],
    regressions: ["Knee side plank", "Side-lying core brace"],
    cues: ["Stack the hips", "Press the floor away", "Hold a long side-body line"]
  },
  "cat-cow": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Spine mobility", "Thoracic spine", "Lumbar control"],
    secondaryMuscles: ["Abdominals", "Shoulders", "Hips"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Spinal flexion and extension",
    trainingUse: "Warm-up spinal motion, movement prep, and low-stress recovery work",
    description:
      "Cat-cow is a controlled spinal mobility drill performed on hands and knees. It teaches you to move segment by segment through spinal flexion and extension while pairing the motion with relaxed breathing.",
    setup:
      "Start on all fours with hands under shoulders and knees under hips. Spread the fingers, press the floor away lightly, and keep the neck long so the whole spine can move smoothly.",
    execution:
      "Round the spine upward into flexion as you gently tuck the pelvis and bring the ribs up. Then reverse the motion by tipping the pelvis the other way, letting the chest open, and extending through the upper and mid-back without collapsing into the lower back.",
    breathing: "Exhale as you round into cat. Inhale as you lengthen and open into cow.",
    tempo: "Move slowly from one end range to the other and pause briefly where you feel the clearest spinal motion.",
    stepSequence: [
      { title: "Start", description: "Set hands under shoulders, knees under hips, and find a neutral tabletop with a long neck." },
      { title: "Mid", description: "Exhale and round the spine upward, tucking the pelvis and drawing the ribs toward the ceiling." },
      { title: "Peak", description: "Move into the opposite direction by inhaling, opening the chest, and extending through the thoracic spine with control." },
      { title: "Finish", description: "Return smoothly through neutral and continue alternating without rushing or dumping into the low back." }
    ],
    commonMistakes: [
      "Bending mostly through the neck instead of the full spine",
      "Forcing the lower back into extension",
      "Rushing through the positions without breathing",
      "Keeping the shoulders tense instead of pressing the floor calmly"
    ],
    safetyNotes: [
      "Keep the range comfortable and controlled rather than chasing the biggest shape possible.",
      "If wrists are sensitive, use fists, handles, or a folded towel under the hands."
    ],
    modifications: ["Place padding under the knees", "Limit the range and focus on breath-led motion"],
    progressions: ["Pause at each end range", "Add segment-by-segment spinal control"],
    regressions: ["Seated cat-cow", "Standing wall-supported spinal flexion and extension"],
    cues: ["Move one spinal segment at a time", "Let the breath lead the shape", "Keep the shoulders calm"]
  },
  "world's greatest stretch": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hip flexors", "Hamstrings", "Thoracic spine"],
    secondaryMuscles: ["Glutes", "Adductors", "Shoulders"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Lunge mobility with thoracic rotation",
    trainingUse: "Warm-up hips and upper back, open the front of the hip, and prepare for lunging or squatting sessions",
    description:
      "World's greatest stretch is a full-body mobility drill that combines a long lunge, hamstring lengthening, and thoracic rotation. It is useful when you want one movement that opens the hips and upper back together.",
    setup:
      "Step into a long lunge with the front foot outside the same-side hand. Keep the back leg long, back heel lifted, and both hands near the front foot so you can move between the floor and the rotation.",
    execution:
      "Sink into the lunge to open the back hip, then bring the forearm or hand toward the floor inside the front foot. From there, rotate the chest open and reach the same-side arm upward while keeping the front foot rooted and the spine long.",
    breathing: "Exhale as you sink and reach toward the floor. Inhale as you rotate the chest open.",
    tempo: "Move deliberately between the floor reach and the open rotation, pausing briefly in each end position.",
    stepSequence: [
      { title: "Start", description: "Set a long lunge with the front foot planted and both hands near the inside of that foot." },
      { title: "Mid", description: "Lower the torso toward the floor or front shin while keeping the back leg active and the front heel grounded." },
      { title: "Peak", description: "Rotate the chest open and reach the same-side arm upward, creating space through the thoracic spine." },
      { title: "Finish", description: "Bring the hand back down with control, reset the lunge, and repeat before switching sides." }
    ],
    commonMistakes: [
      "Letting the front heel lift as you sink deeper",
      "Twisting through the lower back instead of the upper back",
      "Taking too short a stance to feel the hip stretch",
      "Rushing the rotation without owning the lunge position"
    ],
    safetyNotes: [
      "Shorten the lunge or place the back knee down if balance or hip tension makes the drill too aggressive.",
      "Rotate only as far as you can keep the front foot and pelvis under control."
    ],
    modifications: ["Drop the back knee for a half-kneeling version", "Use yoga blocks under the hands"],
    progressions: ["Add a hamstring rock-back between reps", "Pause longer in the thoracic rotation"],
    regressions: ["Half-kneeling hip flexor stretch", "Quadruped thoracic rotation"],
    cues: ["Long lunge first", "Rotate from the upper back", "Keep the front foot rooted"]
  },
  "90/90 hip flow": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hip internal rotation", "Hip external rotation", "Glutes"],
    secondaryMuscles: ["Adductors", "Core", "Deep hip rotators"],
    difficulty: "Intermediate",
    jointStress: "low",
    movementPattern: "Hip rotation flow",
    trainingUse: "Hip rotation work, lower-body mobility, and control for squatting, lunging, and ground-based movement",
    description:
      "The 90/90 hip flow is a seated mobility drill that trains the hips to rotate internally and externally under control. It helps build usable hip motion instead of only passive stretching.",
    setup:
      "Sit on the floor with one leg in front and one leg behind, both bent roughly to 90 degrees. Keep the torso tall, hands on the floor for support if needed, and both sitting bones as even as possible.",
    execution:
      "Rotate the knees from one side to the other while keeping the feet moving with them. Control the transition through the middle, then settle into the next 90/90 position and sit tall before reversing.",
    breathing: "Breathe steadily through the transitions and exhale gently into the end position on each side.",
    tempo: "Move slowly through the rotation and pause briefly when you arrive on each side.",
    stepSequence: [
      { title: "Start", description: "Sit tall in a 90/90 position with one shin in front, one leg behind, and support from the hands if needed." },
      { title: "Mid", description: "Rotate both knees toward the middle while keeping the feet organized and the torso under control." },
      { title: "Peak", description: "Settle into the opposite 90/90 position and stack tall over the hips without collapsing." },
      { title: "Finish", description: "Own the new side for a breath, then rotate back under control for the next rep." }
    ],
    commonMistakes: [
      "Throwing the knees side to side without control",
      "Leaning back so far that the hips stop doing the work",
      "Lifting the feet excessively instead of rotating through the hips",
      "Collapsing the torso over the front leg"
    ],
    safetyNotes: [
      "Use the hands for support and reduce range if the hips feel pinchy.",
      "Move slowly through the middle position, where control is usually hardest."
    ],
    modifications: ["Keep both hands behind you for support", "Work smaller side-to-side rotations"],
    progressions: ["Lift the hands briefly during the switch", "Add a forward fold over the front shin on each side"],
    regressions: ["Seated hip rotation with hands supported", "Supine windshield-wiper hip rotations"],
    cues: ["Rotate through the hips", "Sit tall on each side", "Control the middle"]
  },
  "thoracic rotation": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Thoracic spine", "Upper back rotation"],
    secondaryMuscles: ["Shoulders", "Obliques", "Hips"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Thoracic rotation",
    trainingUse: "Upper-back mobility, posture support, and rotation prep for pressing, pulling, and overhead work",
    description:
      "Thoracic rotation is a mobility drill that teaches the upper back to rotate while the lower body stays mostly quiet. It improves chest opening and rotational control without forcing motion from the lower back.",
    setup:
      "Set up in quadruped or a supported open-book position depending on the variation in front of you. Brace lightly through the trunk so the movement can come from the upper back rather than the hips or low back.",
    execution:
      "Rotate the chest open by leading with the upper back and elbow or hand. Keep the pelvis mostly stable, then return slowly to the starting position before repeating.",
    breathing: "Exhale as you rotate open. Inhale as you return under control.",
    tempo: "Rotate slowly into the open position, pause briefly, and return without snapping back.",
    stepSequence: [
      { title: "Start", description: "Set the base position with the hips stable and one hand or elbow ready to lead the rotation." },
      { title: "Mid", description: "Turn the chest open gradually while keeping the ribs controlled and the lower body quiet." },
      { title: "Peak", description: "Reach the top of the rotation where the upper back opens without borrowing motion from the low back." },
      { title: "Finish", description: "Return to the starting position smoothly and reset before the next rotation." }
    ],
    commonMistakes: [
      "Forcing the low back to rotate",
      "Letting the hips sway or open too much",
      "Moving too fast to feel the upper back",
      "Shrugging the shoulder during the reach"
    ],
    safetyNotes: [
      "Keep the motion comfortable and stop short of pinching through the shoulder or spine.",
      "Use a smaller range if you cannot keep the hips still."
    ],
    modifications: ["Use a shorter range of motion", "Support the head or torso more heavily"],
    progressions: ["Add a brief end-range pause", "Perform from a half-kneeling rotation setup"],
    regressions: ["Open-book rotation with knees stacked", "Seated thoracic rotation"],
    cues: ["Upper back rotates", "Hips stay quiet", "Move with the breath"]
  },
  "shoulder mobility": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Shoulder range of motion", "Scapular control"],
    secondaryMuscles: ["Upper back", "Rotator cuff", "Serratus anterior"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Shoulder mobility flow",
    trainingUse: "Warm up the shoulders, improve overhead comfort, and build better scapular control before upper-body sessions",
    description:
      "Shoulder mobility drills train the shoulders and shoulder blades to move through a controlled range without compensating through the ribs or lower back. The focus is smooth quality, not forcing more range than you own.",
    setup:
      "Stand or kneel tall with the ribs stacked over the pelvis. Set the shoulders down and around the ribcage, and keep the neck relaxed before starting the arm motion.",
    execution:
      "Move the arms through the planned pattern with control, keeping the ribs from flaring and the shoulders from shrugging excessively. Let the shoulder blades rotate naturally while the torso stays organized.",
    breathing: "Use smooth breaths and avoid bracing so hard that the ribcage cannot stay stacked.",
    tempo: "Move slowly enough to feel shoulder control at every part of the range.",
    stepSequence: [
      { title: "Start", description: "Set a tall posture with ribs stacked, shoulders relaxed, and arms ready to move." },
      { title: "Mid", description: "Begin the shoulder motion slowly, keeping the ribcage quiet and the neck relaxed." },
      { title: "Peak", description: "Reach the usable end range with the shoulder blades moving well and no aggressive shrugging." },
      { title: "Finish", description: "Return through the same path with control and reset before the next rep." }
    ],
    commonMistakes: [
      "Flaring the ribs to fake more range",
      "Shrugging aggressively instead of controlling the shoulder blade",
      "Moving too fast to feel the position",
      "Pushing into pinchy shoulder range"
    ],
    safetyNotes: [
      "Stay in a pain-free range and reduce the arc if the shoulder pinches.",
      "Prioritize smooth control over reaching higher or farther."
    ],
    modifications: ["Use a smaller range", "Perform the drill lying on the floor for more support"],
    progressions: ["Add a light band", "Pause at end range without losing rib position"],
    regressions: ["Wall-assisted shoulder reach", "Supine shoulder flexion"],
    cues: ["Ribs stay stacked", "Shoulder blade moves with the arm", "No forced range"]
  },
  "wall slide": {
    category: "Mobility",
    equipment: ["Wall"],
    primaryMuscles: ["Shoulder flexion", "Serratus anterior", "Scapular control"],
    secondaryMuscles: ["Upper back", "Rotator cuff", "Abdominals"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Shoulder flexion and scapular upward rotation",
    trainingUse: "Shoulder prep, overhead mobility, and scapular control before pressing or pulling sessions",
    description:
      "The wall slide is a shoulder mobility and control drill performed against a wall. It helps you move the arms overhead while keeping the ribs controlled and the shoulder blades working smoothly.",
    setup:
      "Stand with your back, head, and forearms against a wall if possible. Bend the elbows, keep ribs stacked, and lightly flatten the lower ribs so you do not arch to reach higher.",
    execution:
      "Slide the forearms or hands upward along the wall while keeping contact as much as your range allows. Let the shoulder blades rotate upward naturally, then return slowly without losing trunk position.",
    breathing: "Inhale to prepare. Exhale gently as the arms slide up while the ribs stay controlled.",
    tempo: "Slide up slowly, pause briefly near the top, and return under control.",
    stepSequence: [
      { title: "Start", description: "Set your back and arms against the wall with elbows bent and ribs stacked over the pelvis." },
      { title: "Mid", description: "Slide the arms upward while keeping the forearms or hands in contact as much as your range allows." },
      { title: "Peak", description: "Reach the highest controlled overhead position without arching the low back or shrugging hard." },
      { title: "Finish", description: "Slide back down slowly and reset with the same rib and shoulder position." }
    ],
    commonMistakes: [
      "Flaring the ribs to chase more overhead range",
      "Losing wall contact immediately",
      "Shrugging excessively at the top",
      "Moving too fast to keep the shoulders organized"
    ],
    safetyNotes: [
      "Use only the range you can control without low-back arching or shoulder pinching.",
      "Step slightly away from the wall if the full contact version is too aggressive."
    ],
    modifications: ["Use a shorter slide range", "Perform on the floor with bent knees for more trunk support"],
    progressions: ["Add a light lift-off from the wall", "Pause longer at the top range"],
    regressions: ["Supported wall reach", "Shoulder mobility flow with smaller range"],
    cues: ["Ribs stay down", "Slide, do not shrug", "Own the overhead range"]
  },
  "hip flexor stretch": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hip flexors", "Quadriceps"],
    secondaryMuscles: ["Glutes", "Abdominals"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip extension stretch",
    trainingUse: "Open the front of the hip, improve split-stance comfort, and offset long periods of sitting",
    description:
      "The hip flexor stretch is usually performed from a half-kneeling position to lengthen the front of the hip on the trailing leg. It works best when the pelvis stays controlled rather than simply lunging farther forward.",
    setup:
      "Set up in a half-kneeling position with one knee down and the other foot planted in front. Keep the torso tall, lightly tuck the pelvis, and brace enough to avoid arching the lower back.",
    execution:
      "Shift the body gently forward while maintaining the slight posterior pelvic tilt. You should feel the stretch in the front of the down-leg hip rather than the lower back. Hold or pulse lightly without losing posture.",
    breathing: "Take slow breaths and exhale as you settle slightly deeper into the stretch.",
    tempo: "Ease into the stretch gradually and hold or pulse with control rather than bouncing.",
    stepSequence: [
      { title: "Start", description: "Set a half-kneeling stance with the front foot planted, torso tall, and pelvis slightly tucked." },
      { title: "Mid", description: "Shift forward gently while keeping the ribs stacked and the glute on the down-leg side lightly active." },
      { title: "Peak", description: "Settle into the stretch at the front of the hip without arching the lower back." },
      { title: "Finish", description: "Back out of the stretch smoothly, reset posture, and repeat before switching sides." }
    ],
    commonMistakes: [
      "Arching the lower back instead of stretching the front of the hip",
      "Leaning too far forward without pelvic control",
      "Letting the front knee drift inward",
      "Holding breath while trying to go deeper"
    ],
    safetyNotes: [
      "Pad the down knee if needed.",
      "Keep the stretch gentle and stop if the low back or front knee feels irritated."
    ],
    modifications: ["Shorten the stance", "Hold onto support for balance"],
    progressions: ["Reach the same-side arm overhead", "Add a gentle side bend away from the down knee"],
    regressions: ["Standing split-stance hip flexor stretch", "Couch stretch with very short range"],
    cues: ["Tuck the pelvis", "Tall torso", "Stretch the front of the hip, not the low back"]
  },
  "hamstring stretch": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves", "Glutes", "Low back stabilizers"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip hinge stretch",
    trainingUse: "Hamstring mobility, posterior-chain recovery, and better hip-hinge positioning",
    description:
      "The hamstring stretch lengthens the back of the thigh and is most effective when you hinge from the hips rather than simply rounding the spine to reach farther.",
    setup:
      "Set up in the version you are using with one or both legs extended. Keep the spine long, chest open, and toes relaxed rather than aggressively pulled back unless the variation calls for it.",
    execution:
      "Hinge forward from the hips until you feel a stretch through the hamstrings. Maintain a long spine and stop before the stretch turns into low-back strain or pulling behind the knee.",
    breathing: "Breathe slowly and use each exhale to soften into the position without forcing range.",
    tempo: "Move in gradually, hold the stretch steadily, and back out with control.",
    stepSequence: [
      { title: "Start", description: "Set the legs and posture for the chosen variation with the spine long and hips ready to hinge." },
      { title: "Mid", description: "Fold forward from the hips while keeping the chest reaching long instead of rounding heavily." },
      { title: "Peak", description: "Hold the strongest stretch you can manage through the hamstrings without pain or pulling behind the knee." },
      { title: "Finish", description: "Come out of the stretch slowly and reset posture before the next rep or side." }
    ],
    commonMistakes: [
      "Rounding the spine to chase more range",
      "Locking the knee aggressively",
      "Pulling so hard that the stretch becomes painful",
      "Holding breath while folding deeper"
    ],
    safetyNotes: [
      "Keep the stretch comfortable and do not force end range.",
      "Bend the knee slightly if the hamstring or back feels too strained."
    ],
    modifications: ["Use a strap or support", "Bend the knee slightly"],
    progressions: ["Increase the hold time", "Move into a longer hip hinge with the spine still organized"],
    regressions: ["Supine hamstring stretch", "Seated hamstring stretch with bent knee"],
    cues: ["Hinge from the hips", "Keep the spine long", "Stretch, do not yank"]
  },
  "child's pose side reach": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Lats", "Thoracic side body", "Shoulder mobility"],
    secondaryMuscles: ["Obliques", "Upper back", "Hips"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Side-bending reach stretch",
    trainingUse: "Lat lengthening, ribcage expansion, shoulder recovery, and low-intensity mobility work",
    description:
      "Child's pose side reach combines a supported child's pose with a lateral hand walk to open the lats, side body, and upper back. It is useful when overhead work or pulling volume has left the upper body feeling stiff.",
    setup:
      "Start in child's pose with knees comfortable, hips back toward the heels, and hands reaching forward on the floor. Relax the neck and let the torso settle before shifting the hands.",
    execution:
      "Walk both hands to one side while keeping the hips heavy. Reach through the outside arm and breathe into the open side of the ribcage, then return through center before switching sides.",
    breathing: "Take slow breaths into the side ribs and upper back while holding the reach.",
    tempo: "Move the hands gradually, pause in the stretch, and return to center smoothly.",
    stepSequence: [
      { title: "Start", description: "Settle into child's pose with hips back, arms reaching forward, and the spine relaxed but long." },
      { title: "Mid", description: "Walk both hands to one side while keeping the hips anchored and the chest low." },
      { title: "Peak", description: "Reach long through the outside arm and breathe into the side body and lat stretch." },
      { title: "Finish", description: "Walk back to center with control, reset, and repeat to the other side." }
    ],
    commonMistakes: [
      "Letting the hips drift away from the heels",
      "Collapsing the shoulders instead of reaching long",
      "Turning the position into a twist instead of a side reach",
      "Holding the breath instead of expanding the side ribs"
    ],
    safetyNotes: [
      "Pad the knees or place support under the hips if child's pose is uncomfortable.",
      "Keep the reach gentle if the shoulders feel irritated."
    ],
    modifications: ["Widen the knees", "Place a cushion between hips and heels"],
    progressions: ["Hold longer with deeper breaths", "Reach the top hand farther over the bottom hand"],
    regressions: ["Seated side reach", "Wall-supported lat stretch"],
    cues: ["Hips stay heavy", "Reach through the outside arm", "Breathe into the open ribs"]
  },
  "ankle rocks": {
    category: "Mobility",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Ankle dorsiflexion", "Soleus", "Calf mobility"],
    secondaryMuscles: ["Foot stabilizers", "Tibialis anterior", "Achilles tendon control"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Ankle dorsiflexion mobility",
    trainingUse: "Ankle mobility prep for squats, lunges, running, and lower-body training",
    description:
      "Ankle rocks improve ankle dorsiflexion by moving the knee forward over the toes while the heel stays planted. They are useful when limited ankle motion affects squatting, lunging, or gait mechanics.",
    setup:
      "Set up in a half-kneeling or split-stance position with the working foot flat on the floor. Keep the heel grounded, toes pointed forward, and hands available for balance if needed.",
    execution:
      "Drive the knee forward over the toes as far as you can without the heel lifting. Pause briefly at the end range, then ease back out and repeat with smooth control.",
    breathing: "Breathe steadily and exhale softly as you move into the end range.",
    tempo: "Rock forward slowly, pause briefly, and return without bouncing.",
    stepSequence: [
      { title: "Start", description: "Set the working foot flat, heel down, and knee lined up with the toes in a stable split stance." },
      { title: "Mid", description: "Glide the knee forward over the toes while keeping the heel anchored to the floor." },
      { title: "Peak", description: "Own the deepest controlled dorsiflexion position with pressure through the whole foot." },
      { title: "Finish", description: "Rock back slightly, keep the heel down, and repeat the forward glide with control." }
    ],
    commonMistakes: [
      "Letting the heel lift to fake more range",
      "Rolling the foot inward or outward",
      "Bouncing into the end range",
      "Letting the knee drift far off line from the toes"
    ],
    safetyNotes: [
      "Use a pain-free range and avoid forcing the ankle if the front of the joint feels pinchy.",
      "Keep the full foot grounded instead of collapsing the arch."
    ],
    modifications: ["Use hands on a wall for support", "Work a smaller forward range"],
    progressions: ["Add a longer pause at end range", "Use a loaded split-stance ankle rock with very light support"],
    regressions: ["Standing calf stretch with bent knee", "Seated ankle dorsiflexion drill"],
    cues: ["Heel stays down", "Knee tracks over the toes", "Glide, do not bounce"]
  },
  "machine chest press": {
    category: "Chest",
    equipment: ["Chest press machine"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Serratus anterior", "Upper back stabilizers"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Stable chest pressing, hypertrophy work, and beginner-friendly upper-body strength training",
    description:
      "The machine chest press is a supported pressing exercise that lets you train the chest, triceps, and front shoulders with a fixed path. It is useful when you want pressing volume with less balance demand than free weights.",
    setup:
      "Adjust the seat so the handles start around mid-chest height. Plant the feet, sit tall against the pad, and set the shoulder blades gently back and down before taking the handles.",
    execution:
      "Press the handles forward until the arms are extended without locking aggressively. Keep the chest lifted, shoulders away from the ears, and return slowly until you feel a controlled stretch through the chest.",
    breathing: "Inhale as the handles come back. Exhale as you press forward.",
    tempo: "Press smoothly for 1-2 seconds and return for 2-3 seconds under control.",
    stepSequence: [
      { title: "Start", description: "Set the seat height, grip the handles at mid-chest level, plant the feet, and organize the shoulders against the pad." },
      { title: "Mid", description: "Drive the handles forward while keeping the ribs controlled and the shoulders from shrugging." },
      { title: "Peak", description: "Reach full pressing range with the chest engaged and the elbows nearly straight without snapping the joints." },
      { title: "Finish", description: "Return the handles slowly toward the chest until you reach a comfortable stretch and repeat from the same stable posture." }
    ],
    commonMistakes: [
      "Setting the seat too high or too low",
      "Shrugging to finish the press",
      "Letting the elbows slam into lockout",
      "Bouncing out of the bottom range"
    ],
    safetyNotes: [
      "Adjust the machine so the pressing path feels natural for your shoulders.",
      "Use a load you can lower slowly without losing chest or shoulder position."
    ],
    modifications: ["Reduce the range slightly if shoulders are sensitive", "Use a lighter load and controlled tempo"],
    progressions: ["Increase load gradually", "Add a pause in the stretched position", "Use single-arm chest press work if available"],
    regressions: ["Band chest press", "Incline push-up", "Wall push-up"],
    cues: ["Handles start at mid-chest", "Shoulders stay down", "Press and return with control"]
  },
  "cable chest fly": {
    category: "Chest",
    equipment: ["Cable machine"],
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior deltoids", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal adduction / chest isolation",
    trainingUse: "Chest hypertrophy, end-range pec tension, and accessory work after pressing",
    description:
      "The cable chest fly isolates the chest by bringing the arms together through a wide arc while cable tension stays on the pecs. It works best when the elbows stay softly bent and the torso remains quiet.",
    setup:
      "Set the cable handles around chest height or slightly above. Stand in a staggered stance, take one handle in each hand, step forward into tension, and keep the chest tall with a soft bend in the elbows.",
    execution:
      "Bring the hands together in a hugging arc in front of the chest without turning the movement into a press. Control the stretch as the arms open back out and stop before the shoulders lose position.",
    breathing: "Exhale as the hands come together. Inhale as the arms open back out.",
    tempo: "Move together for 1-2 seconds and return for 2-3 seconds with a controlled stretch.",
    stepSequence: [
      { title: "Start", description: "Set the cables, step into a stable stance, and begin with the arms open and elbows softly bent." },
      { title: "Mid", description: "Sweep the arms inward in a wide arc while keeping the chest lifted and shoulders controlled." },
      { title: "Peak", description: "Bring the hands together in front of the chest and squeeze the pecs without slamming the handles together." },
      { title: "Finish", description: "Open the arms back out slowly until you feel a stretch across the chest, then repeat with the same arc." }
    ],
    commonMistakes: [
      "Straightening the elbows and turning it into a press",
      "Letting the shoulders roll forward",
      "Using too much weight and cutting the arc short",
      "Losing control in the stretched position"
    ],
    safetyNotes: [
      "Stop the stretch before the front of the shoulder feels pinchy.",
      "Use a load that lets you own the return without the cables pulling you open."
    ],
    modifications: ["Use a split stance for more balance", "Reduce the stretch range slightly"],
    progressions: ["Use a lower cable angle", "Add a pause at peak contraction", "Slow the eccentric return"],
    regressions: ["Band chest fly", "Machine chest press", "Push-up"],
    cues: ["Hug the arms together", "Soft elbows stay fixed", "Control the stretch"]
  },
  "dumbbell chest fly": {
    category: "Chest",
    equipment: ["Dumbbells", "Flat bench"],
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Anterior deltoids", "Biceps long head stabilizers"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal adduction / chest isolation",
    trainingUse: "Chest hypertrophy, pec stretch under control, and accessory work after pressing",
    description:
      "The dumbbell chest fly is a chest isolation exercise performed lying on a bench with a wide arm arc. It challenges the pecs through a loaded stretch, so control matters more than heavy weight.",
    setup:
      "Lie on a flat bench with dumbbells above the chest and a slight bend in the elbows. Set the shoulder blades gently back and down, plant the feet, and keep the ribs controlled.",
    execution:
      "Lower the dumbbells out wide in an arc while keeping the elbow angle mostly fixed. When you reach a comfortable chest stretch, squeeze the arms back together over the chest without turning the rep into a pressing motion.",
    breathing: "Inhale as the dumbbells lower. Exhale as you bring them back together.",
    tempo: "Lower for 2-3 seconds, pause briefly in the stretch if controlled, and return smoothly.",
    stepSequence: [
      { title: "Start", description: "Set on the bench with dumbbells above the chest, feet planted, and elbows softly bent." },
      { title: "Mid", description: "Lower the arms outward in a wide arc while keeping the chest open and shoulder blades organized." },
      { title: "Peak", description: "Reach the deepest stretch you can control across the chest without shoulder discomfort or elbow collapse." },
      { title: "Finish", description: "Squeeze the arms back together over the chest, maintaining the same elbow bend and avoiding a pressing path." }
    ],
    commonMistakes: [
      "Using too much weight and bending into a press",
      "Dropping too deep into the stretch",
      "Letting the elbows straighten too much",
      "Losing shoulder position at the bottom"
    ],
    safetyNotes: [
      "Use lighter loads than you would for pressing.",
      "Stop the descent before the front of the shoulder feels strained."
    ],
    modifications: ["Shorten the range of motion", "Perform on the floor for a reduced stretch"],
    progressions: ["Add a pause in the stretched position", "Use slightly heavier dumbbells", "Progress to incline dumbbell fly if tolerated"],
    regressions: ["Cable chest fly", "Machine chest press", "Push-up"],
    cues: ["Wide arc, soft elbows", "Stretch the chest, not the shoulder", "Fly back together smoothly"]
  },
  "incline push-up": {
    category: "Chest",
    equipment: ["Bench or sturdy elevated surface"],
    primaryMuscles: ["Chest", "Triceps", "Anterior deltoids"],
    secondaryMuscles: ["Core", "Serratus anterior"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Horizontal push",
    trainingUse: "Beginner pressing strength, higher-quality push-up practice, and shoulder-friendly bodyweight training",
    description:
      "The incline push-up is a push-up variation performed with the hands elevated on a bench or support. Elevation reduces the load so you can train the full push-up pattern with better control.",
    setup:
      "Place the hands on a stable bench, box, or rail slightly wider than shoulder width. Walk the feet back so the body forms a straight line from head to heels and brace the core lightly.",
    execution:
      "Lower the chest toward the support by bending the elbows while keeping the body moving as one unit. Press the support away to return to the top without letting the hips sag.",
    breathing: "Inhale as you lower. Exhale as you press away from the support.",
    tempo: "Lower for 2 seconds and press back up smoothly.",
    stepSequence: [
      { title: "Start", description: "Set the hands on the support, walk the feet back, and lock in a straight body line with core tension." },
      { title: "Mid", description: "Lower the chest toward the support while the elbows track at a comfortable angle from the body." },
      { title: "Peak", description: "Reach the lowest controlled position without hips sagging or shoulders collapsing." },
      { title: "Finish", description: "Press the support away and return to a strong plank line at the top." }
    ],
    commonMistakes: [
      "Letting the hips sag toward the floor",
      "Shrugging the shoulders up to the ears",
      "Using a support that is too low to control",
      "Cutting the depth short without control"
    ],
    safetyNotes: [
      "Use a stable support that will not move under your hands.",
      "Raise the hands higher if shoulder, wrist, or trunk control breaks down."
    ],
    modifications: ["Use a higher support", "Widen the stance for more stability"],
    progressions: ["Lower the hand height", "Add a pause at the bottom", "Progress to standard push-up"],
    regressions: ["Wall push-up", "Counter push-up", "Knee push-up"],
    cues: ["Body moves as one line", "Chest goes to the support", "Press away without sagging"]
  },
  "decline push-up": {
    category: "Chest",
    equipment: ["Bodyweight", "Bench or sturdy elevation"],
    primaryMuscles: ["Upper chest", "Anterior deltoids", "Triceps"],
    secondaryMuscles: ["Core", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Horizontal push / decline push-up",
    trainingUse: "Upper-chest emphasis, harder bodyweight pressing, and push-up progression work",
    description:
      "The decline push-up is a push-up variation performed with the feet elevated. Elevation shifts more load toward the upper chest and shoulders while increasing the total challenge of the push-up.",
    setup:
      "Place the feet on a stable bench or box and the hands on the floor slightly wider than shoulder width. Brace the trunk and set a straight line from head through heels before starting the rep.",
    execution:
      "Lower the chest toward the floor under control while keeping the hips level and elbows at a comfortable angle. Press back up to the top plank without letting the low back sag or the shoulders shrug.",
    breathing: "Inhale as you lower. Exhale as you press back up.",
    tempo: "Lower for 2-3 seconds and press up with smooth control.",
    stepSequence: [
      { title: "Start", description: "Set the feet on the elevation, hands on the floor, and create a rigid plank line before the rep begins." },
      { title: "Mid", description: "Lower the chest toward the floor while the elbows track below shoulder height and the hips stay level." },
      { title: "Peak", description: "Reach the lowest controlled position without collapsing through the shoulders or low back." },
      { title: "Finish", description: "Press the floor away and return to a strong elevated plank at the top." }
    ],
    commonMistakes: [
      "Letting the low back sag because the feet are too high",
      "Dropping the head between the arms",
      "Flaring the elbows too wide",
      "Using an unstable foot support"
    ],
    safetyNotes: [
      "Choose a foot height you can control without losing trunk position.",
      "Stop if shoulder or wrist discomfort builds as the load increases."
    ],
    modifications: ["Use a lower foot elevation", "Reduce range slightly while building control"],
    progressions: ["Add a pause at the bottom", "Use a deficit hand position", "Progress toward ring or weighted push-ups"],
    regressions: ["Standard push-up", "Incline push-up", "Hands-elevated push-up"],
    cues: ["Feet elevated, trunk rigid", "Lower with control", "Press back to a clean plank"]
  },
  "band row": {
    category: "Back",
    equipment: ["Resistance band"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Middle traps"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Horizontal pull",
    trainingUse: "Home rowing strength, posture support, and upper-back development when equipment is limited",
    description:
      "The band row is a horizontal pulling exercise performed against band tension. It trains the lats, rhomboids, and middle back while staying easy to set up at home or in a small space.",
    setup:
      "Anchor the band in front of you around chest or stomach height. Stand or sit in a stable position with the arms extended, ribs stacked, and shoulders relaxed away from the ears.",
    execution:
      "Pull the elbows back toward the lower ribs while keeping the torso quiet and the chest organized. Squeeze the upper back at the end of the row, then return slowly until the arms are extended again.",
    breathing: "Exhale as you row. Inhale as you return under tension.",
    tempo: "Pull for 1-2 seconds, pause briefly, and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the anchor, extend the arms, and organize the ribs and shoulders before the pull." },
      { title: "Mid", description: "Drive the elbows back while the torso stays quiet and the wrists remain neutral." },
      { title: "Peak", description: "Squeeze the mid-back and lats with the hands near the lower ribs and shoulders still down." },
      { title: "Finish", description: "Let the arms extend slowly until the band stays taut and the shoulders remain controlled." }
    ],
    commonMistakes: [
      "Leaning back to finish the row",
      "Shrugging the shoulders",
      "Letting the band snap you forward",
      "Using an unstable anchor"
    ],
    safetyNotes: [
      "Check the band and anchor before every set.",
      "Use a resistance level that lets the torso stay quiet through the whole row."
    ],
    modifications: ["Use a lighter band", "Perform the row seated", "Use one arm at a time"],
    progressions: ["Use a stronger band", "Pause longer at full row", "Slow the eccentric return"],
    regressions: ["Doorframe row", "Chest-supported row", "Light seated band row"],
    cues: ["Elbows drive back", "Shoulders stay down", "Band returns under control"]
  },
  "seated cable row": {
    category: "Back",
    equipment: ["Cable row station"],
    primaryMuscles: ["Latissimus dorsi", "Rhomboids", "Middle traps"],
    secondaryMuscles: ["Rear deltoids", "Biceps", "Forearms"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal pull",
    trainingUse: "Back strength, rowing volume, and controlled horizontal pulling with machine stability",
    description:
      "The seated cable row is a machine-based row that trains the lats and mid-back from a stable seated position. It is useful when you want to load horizontal pulling without needing as much full-body balance as free weights.",
    setup:
      "Sit tall at the cable row station with the feet planted on the platform and the knees softly bent. Reach for the handle with a neutral spine, chest organized, and shoulders away from the ears.",
    execution:
      "Pull the handle toward the lower ribs by driving the elbows back. Keep the torso mostly still instead of turning the movement into a heavy lean. Return forward slowly until the arms extend and the shoulder blades move naturally.",
    breathing: "Exhale as you row. Inhale as you return forward.",
    tempo: "Pull for 1-2 seconds and return for 2-3 seconds under control.",
    stepSequence: [
      { title: "Start", description: "Sit tall with feet planted, arms extended, and the handle in line with a long neutral spine." },
      { title: "Mid", description: "Drive the elbows back and pull the handle toward the lower ribs while keeping the chest organized." },
      { title: "Peak", description: "Reach full row with the lats and mid-back engaged and the shoulders still away from the ears." },
      { title: "Finish", description: "Return the handle forward slowly until the arms extend and the shoulder blades glide without the weight stack slamming." }
    ],
    commonMistakes: [
      "Leaning back excessively to move more weight",
      "Shrugging through the end of the pull",
      "Yanking the handle with the arms first",
      "Letting the stack crash on the return"
    ],
    safetyNotes: [
      "Use a load you can row without turning the set into a body swing.",
      "Keep the lumbar spine neutral and reduce load if posture breaks."
    ],
    modifications: ["Use a neutral-grip handle", "Shorten the range slightly", "Use lighter load with slower return"],
    progressions: ["Add load gradually", "Pause at full contraction", "Use single-arm cable rows"],
    regressions: ["Band row", "Chest-supported row", "Light machine row"],
    cues: ["Pull to the lower ribs", "Torso stays tall", "Return the cable slowly"]
  },
  "chest-supported row": {
    category: "Back",
    equipment: ["Incline bench", "Dumbbells"],
    primaryMuscles: ["Mid-back", "Latissimus dorsi", "Rear deltoids"],
    secondaryMuscles: ["Rhomboids", "Biceps", "Forearms"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Horizontal pull",
    trainingUse: "Upper-back hypertrophy, low-back-friendly rowing, and strict pulling mechanics",
    description:
      "The chest-supported row is a rowing variation performed with the chest supported on an incline bench. The support reduces body English so the mid-back and lats do more of the work.",
    setup:
      "Set an incline bench and lie chest-down with the feet planted securely. Let the dumbbells hang under the shoulders, keep the neck long, and lightly brace the trunk into the pad.",
    execution:
      "Row the elbows back and slightly out or in depending on the grip, keeping the chest on the bench. Squeeze the upper back at the top, then lower the dumbbells until the arms are extended again.",
    breathing: "Exhale as you row. Inhale as you lower.",
    tempo: "Row up smoothly, pause briefly at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the chest on the incline bench, let the dumbbells hang, and organize the shoulders before rowing." },
      { title: "Mid", description: "Drive the elbows back while the chest stays glued to the pad and the neck stays long." },
      { title: "Peak", description: "Pause at the top with the mid-back and lats engaged without shrugging or lifting the chest." },
      { title: "Finish", description: "Lower the dumbbells under control until the arms extend and the shoulders stay organized." }
    ],
    commonMistakes: [
      "Lifting the chest off the bench to finish the rep",
      "Shrugging through the top position",
      "Using momentum instead of back tension",
      "Cutting the lowering phase short"
    ],
    safetyNotes: [
      "Use a bench angle and load that let the chest stay supported for the whole set.",
      "Keep the neck neutral instead of craning upward."
    ],
    modifications: ["Use lighter dumbbells", "Use a neutral grip", "Shorten the range slightly while learning control"],
    progressions: ["Increase load gradually", "Pause at peak contraction", "Use tempo rows with slower lowering"],
    regressions: ["Band row", "Doorframe row", "Machine row"],
    cues: ["Chest stays on the pad", "Elbows row back", "Lower under control"]
  },
  "dumbbell pullover": {
    category: "Back",
    equipment: ["Dumbbell", "Bench or floor"],
    primaryMuscles: ["Latissimus dorsi", "Chest"],
    secondaryMuscles: ["Serratus anterior", "Triceps long head", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Shoulder extension / pullover",
    trainingUse: "Lat accessory work, chest and serratus training, and shoulder-controlled overhead range",
    description:
      "The dumbbell pullover is performed lying on a bench or floor while moving a dumbbell in an arc from over the chest to overhead and back. It can train the lats and chest when the ribs and shoulder motion stay controlled.",
    setup:
      "Lie on a bench or floor holding one dumbbell over the chest with both hands. Keep a soft elbow bend, ribs stacked, feet planted, and shoulders organized before lowering the weight.",
    execution:
      "Lower the dumbbell overhead in a smooth arc while keeping the ribcage controlled. When you reach a comfortable stretch, pull the weight back over the chest using the lats and chest without flaring the elbows wide.",
    breathing: "Inhale as the dumbbell lowers overhead. Exhale as you pull it back above the chest.",
    tempo: "Lower for 2-3 seconds, pause briefly if controlled, and return smoothly.",
    stepSequence: [
      { title: "Start", description: "Set on the bench or floor with the dumbbell above the chest, soft elbows, and ribs stacked." },
      { title: "Mid", description: "Guide the dumbbell overhead in an arc while keeping the torso controlled and the shoulders from shrugging." },
      { title: "Peak", description: "Reach the deepest overhead stretch you can control without losing rib position or shoulder comfort." },
      { title: "Finish", description: "Pull the dumbbell back over the chest with a smooth arc and reset over the starting position." }
    ],
    commonMistakes: [
      "Arching the ribs to fake more range",
      "Turning the movement into an elbow extension",
      "Going too deep overhead for shoulder control",
      "Using too much load and losing the arc"
    ],
    safetyNotes: [
      "Keep the range pain-free through the shoulders and ribs.",
      "Use a load you can control overhead without dropping into the bottom."
    ],
    modifications: ["Use a floor pullover for less range", "Reduce the overhead depth", "Use a lighter dumbbell"],
    progressions: ["Increase load gradually", "Pause in the stretched position", "Use a slower eccentric"],
    regressions: ["Straight-arm pulldown", "Lat pulldown", "Band pulldown"],
    cues: ["Ribs stay down", "Smooth overhead arc", "Pull back with lats and chest"]
  },
  "straight-arm pulldown": {
    category: "Back",
    equipment: ["Cable machine or high anchor"],
    primaryMuscles: ["Latissimus dorsi"],
    secondaryMuscles: ["Teres major", "Core", "Serratus anterior"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Shoulder extension",
    trainingUse: "Lat isolation, vertical-pull accessory work, and learning to drive from the shoulders instead of the elbows",
    description:
      "The straight-arm pulldown trains the lats by moving the arms from overhead toward the thighs with only a soft elbow bend. It is useful for teaching lat engagement without turning the movement into a row or pulldown.",
    setup:
      "Stand facing a high cable or anchor and grip the handle or bar with arms mostly straight. Set the ribs down, hinge slightly if needed, and keep the shoulders organized before starting the pull.",
    execution:
      "Sweep the arms down toward the thighs while keeping the elbows only softly bent. Focus on driving from the shoulders and lats, then return overhead slowly until you feel the stretch again.",
    breathing: "Exhale as you pull down. Inhale as you return overhead.",
    tempo: "Pull down smoothly and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Take the high anchor, set the ribs and trunk, and begin with the arms overhead and elbows softly bent." },
      { title: "Mid", description: "Pull the arms down in an arc toward the thighs without turning the movement into an elbow-driven row." },
      { title: "Peak", description: "Reach the bottom with the lats fully engaged and the shoulders still down away from the ears." },
      { title: "Finish", description: "Return overhead slowly until the lats lengthen again and the trunk stays organized." }
    ],
    commonMistakes: [
      "Bending the elbows too much and turning it into a pulldown",
      "Arching the low back to finish the rep",
      "Shrugging the shoulders upward",
      "Letting the handle fly back overhead"
    ],
    safetyNotes: [
      "Use a load that lets the trunk stay steady and the elbows mostly fixed.",
      "Keep the movement smooth to avoid irritating the shoulders."
    ],
    modifications: ["Use a rope or straight bar depending comfort", "Reduce range slightly", "Use lighter load"],
    progressions: ["Pause at the bottom", "Slow the return", "Progress to heavier cable or band resistance"],
    regressions: ["Straight-arm band pulldown", "Band pulldown", "Lat pulldown with light load"],
    cues: ["Arms stay long", "Lats drive the sweep", "Return overhead slowly"]
  },
  "cable face pull": {
    category: "Back",
    equipment: ["Cable machine with rope"],
    primaryMuscles: ["Rear deltoids", "Rotator cuff", "Upper back"],
    secondaryMuscles: ["Middle traps", "Lower traps", "Biceps"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Horizontal pull / external rotation",
    trainingUse: "Rear-delt training, shoulder-health accessory work, and upper-back posture support",
    description:
      "The cable face pull is a rope-based pulling exercise that finishes near face height with the elbows high and the hands separating. It trains the rear delts, upper back, and external rotators when done with control.",
    setup:
      "Set a rope attachment around face height. Stand tall with a stable stance, arms extended, ribs stacked, and shoulders relaxed before beginning the pull.",
    execution:
      "Pull the rope toward the face by driving the elbows high and back. Let the hands separate as you finish, creating external rotation at the shoulder, then return forward slowly without shrugging.",
    breathing: "Exhale as you pull the rope toward the face. Inhale as you return forward.",
    tempo: "Pull for 1-2 seconds, pause briefly, and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the rope at face height, take a stable stance, and begin with the arms extended and shoulders organized." },
      { title: "Mid", description: "Drive the elbows back and slightly high while the rope travels toward the face." },
      { title: "Peak", description: "Finish with the hands separated near the face and the rear delts and upper back fully engaged." },
      { title: "Finish", description: "Return the rope forward slowly until the arms extend without losing shoulder control." }
    ],
    commonMistakes: [
      "Shrugging through the pull",
      "Pulling too low toward the chest",
      "Leaning back to finish the rep",
      "Using momentum instead of upper-back control"
    ],
    safetyNotes: [
      "Use a load that lets you finish with clean shoulder rotation and no neck tension.",
      "Stop short of pain if the front of the shoulder feels pinchy."
    ],
    modifications: ["Use a lighter load", "Use a band version", "Shorten the range slightly"],
    progressions: ["Pause at peak contraction", "Use slower return", "Progress to single-arm face pull work"],
    regressions: ["Band pull-apart", "Rear-delt cable fly", "Scap retraction drill"],
    cues: ["Pull to the face", "Elbows high, shoulders calm", "Hands separate at the finish"]
  },
  "reverse fly": {
    category: "Shoulders",
    equipment: ["Dumbbells or rear-delt machine"],
    primaryMuscles: ["Rear deltoids"],
    secondaryMuscles: ["Rhomboids", "Middle traps", "Rotator cuff"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Horizontal abduction / rear-delt isolation",
    trainingUse: "Rear-delt development, posture support, and upper-back accessory work",
    description:
      "The reverse fly is a rear-delt isolation exercise performed from a hinged or supported position. It trains the back of the shoulders while the upper back helps stabilize the shoulder blades.",
    setup:
      "Hinge at the hips or set up chest-supported with dumbbells hanging below the shoulders. Keep a soft elbow bend, long neck, and ribs controlled before lifting the arms.",
    execution:
      "Raise the arms outward and slightly back in a wide arc while keeping the elbows softly bent. Stop when the rear delts and upper back are engaged, then lower under control without swinging.",
    breathing: "Exhale as you raise the arms. Inhale as you lower them back down.",
    tempo: "Lift for 1-2 seconds and lower for 2-3 seconds with control.",
    stepSequence: [
      { title: "Start", description: "Set the hinge or chest-supported position with dumbbells hanging and the shoulders organized." },
      { title: "Mid", description: "Lift the arms outward in a wide arc while keeping the torso quiet and elbows softly bent." },
      { title: "Peak", description: "Reach the top with the rear delts and upper back engaged without shrugging or overextending." },
      { title: "Finish", description: "Lower the weights back down slowly until the arms hang again under control." }
    ],
    commonMistakes: [
      "Using momentum to swing the weights up",
      "Shrugging the shoulders",
      "Turning the rep into a row by bending the elbows too much",
      "Losing the hinge position"
    ],
    safetyNotes: [
      "Use lighter weights than you would for rows or presses.",
      "Keep the movement pain-free and reduce range if the shoulder pinches."
    ],
    modifications: ["Use chest support", "Use lighter dumbbells", "Shorten the range slightly"],
    progressions: ["Add a pause at the top", "Slow the lowering", "Use cable or machine rear-delt fly variations"],
    regressions: ["Band pull-apart", "Cable face pull", "Scap retraction drill"],
    cues: ["Rear delts lift the arms", "Soft elbows stay fixed", "Lower without swinging"]
  },
  "leg press": {
    category: "Legs",
    equipment: ["Leg press machine"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Squat / machine press",
    trainingUse: "Lower-body strength, quad-focused hypertrophy, and high-volume leg training with back support",
    description:
      "The leg press is a machine-based lower-body press that trains the quads and glutes while the torso stays supported. It is useful for building leg strength and volume without needing to balance a barbell on the back.",
    setup:
      "Sit with the back and hips fully supported against the pad. Place the feet on the platform around shoulder width, keep the heels planted, and set the knees to track in line with the toes before unlocking the sled.",
    execution:
      "Lower the sled under control by bending the knees and hips until you reach a comfortable depth. Press the platform away through the whole foot and return to the top without snapping the knees hard into lockout.",
    breathing: "Inhale as the sled lowers. Exhale as you press it away.",
    tempo: "Lower for 2-3 seconds and press back up smoothly with control.",
    stepSequence: [
      { title: "Start", description: "Set the back against the pad, place the feet on the platform, and unlock the sled with the knees softly bent." },
      { title: "Mid", description: "Lower the sled by bending the knees while keeping the feet flat and knees tracking over the toes." },
      { title: "Peak", description: "Reach the deepest position you can control without the hips rolling off the pad or the knees collapsing inward." },
      { title: "Finish", description: "Drive through the feet and press the sled away until the legs are extended without locking out aggressively." }
    ],
    commonMistakes: [
      "Letting the knees cave inward",
      "Bringing the sled down so far that the hips roll up",
      "Using mostly the toes instead of the full foot",
      "Snapping the knees into lockout"
    ],
    safetyNotes: [
      "Use a range that keeps the low back and hips anchored to the pad.",
      "Adjust foot position if knee or hip comfort is poor in the current setup."
    ],
    modifications: ["Use a lighter load", "Shorten the range slightly", "Change foot height on the platform"],
    progressions: ["Increase load gradually", "Pause in the bottom position", "Use controlled tempo sets"],
    regressions: ["Goblet squat", "Bodyweight squat", "Supported split squat"],
    cues: ["Back stays supported", "Whole foot drives", "Knees track over toes"]
  },
  "leg extension": {
    category: "Legs",
    equipment: ["Leg extension machine"],
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: ["Hip flexors", "Shin stabilizers"],
    difficulty: "Beginner",
    jointStress: "moderate",
    movementPattern: "Knee extension",
    trainingUse: "Quadriceps isolation, knee-extensor strength, and accessory work after squats or leg press",
    description:
      "The leg extension isolates the quadriceps by extending the knees against machine resistance. It is useful when you want direct quad work without loading the spine or needing much balance.",
    setup:
      "Adjust the machine so the knee lines up with the pivot point and the pad sits just above the ankles. Sit tall against the backrest and grip the handles lightly to stay stable.",
    execution:
      "Extend the knees to lift the pad until the quads are fully engaged. Squeeze briefly at the top, then lower slowly until the knees bend again without the weight stack crashing.",
    breathing: "Exhale as you extend the knees. Inhale as you lower.",
    tempo: "Lift for 1-2 seconds, pause briefly, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the knee joint to the machine pivot, place the pad above the ankles, and begin with the knees bent under control." },
      { title: "Mid", description: "Extend the knees smoothly while keeping the thighs supported and the torso tall." },
      { title: "Peak", description: "Reach the top with the quads squeezed and the knees nearly straight without snapping into lockout." },
      { title: "Finish", description: "Lower the pad slowly until the knees bend again and the machine stays quiet." }
    ],
    commonMistakes: [
      "Using momentum to kick the weight up",
      "Setting the pad too high or too low on the shins",
      "Locking the knees aggressively",
      "Letting the weight drop on the return"
    ],
    safetyNotes: [
      "Use controlled loads if the knees are sensitive.",
      "Keep the setup aligned so the knee tracks naturally through the machine path."
    ],
    modifications: ["Use lighter load", "Shorten the end range slightly", "Use single-leg work if the machine allows"],
    progressions: ["Increase load gradually", "Add a squeeze at the top", "Use slower eccentrics"],
    regressions: ["Leg press", "Bodyweight squat", "Terminal knee extension with a band"],
    cues: ["Knee aligns with pivot", "Lift with the quads", "Lower without dropping"]
  },
  "hamstring curl": {
    category: "Legs",
    equipment: ["Hamstring curl machine"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Knee flexion",
    trainingUse: "Hamstring isolation, posterior-chain accessory work, and knee-flexion strength",
    description:
      "The hamstring curl isolates knee flexion by pulling the pad through a controlled curling range. It is useful for direct hamstring work alongside hinging and squatting patterns.",
    setup:
      "Adjust the machine so the moving pad sits comfortably just above the heels or lower calves and the knee lines up with the pivot. Brace lightly through the trunk and settle into the support pad.",
    execution:
      "Curl the pad by bending the knees and squeezing the hamstrings. Pause briefly when the curl is strongest, then return slowly until the knees extend again under control.",
    breathing: "Exhale as you curl. Inhale as you return.",
    tempo: "Curl for 1-2 seconds and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the machine pads correctly, align the knees with the pivot, and begin with the legs extended under control." },
      { title: "Mid", description: "Bend the knees and pull the pad through the strongest part of the curl without lifting out of the support." },
      { title: "Peak", description: "Reach full hamstring contraction with the knees flexed and the hips staying quiet." },
      { title: "Finish", description: "Lower the pad slowly until the legs extend again without losing tension." }
    ],
    commonMistakes: [
      "Using body movement to finish the curl",
      "Setting the pads in the wrong position",
      "Rushing the lowering phase",
      "Using more load than the hamstrings can control"
    ],
    safetyNotes: [
      "Adjust the machine carefully so the knees and pads line up comfortably.",
      "Reduce the load if you feel cramping or sharp discomfort around the knees."
    ],
    modifications: ["Use lighter load", "Work one leg at a time if available", "Shorten the range slightly"],
    progressions: ["Pause at peak contraction", "Slow the eccentric", "Increase load gradually"],
    regressions: ["Glute bridge", "Romanian deadlift with light load", "Reduced-range machine curls"],
    cues: ["Curl from the knees", "Hamstrings do the work", "Return slowly"]
  },
  "seated hamstring curl": {
    category: "Legs",
    equipment: ["Seated hamstring curl machine"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Knee flexion",
    trainingUse: "Hamstring hypertrophy, knee-flexion strength, and posterior-chain accessory training",
    description:
      "The seated hamstring curl trains the hamstrings from a seated position that places them on stretch at the hip. It is a strong option for direct hamstring work with a clear machine path.",
    setup:
      "Adjust the back pad and thigh pad so the knees line up with the pivot and the lower pad sits just above the heels. Sit tall with the thighs secured and the feet set comfortably.",
    execution:
      "Curl the lower legs down and back by bending the knees while keeping the hips planted in the seat. Squeeze the hamstrings at the bottom, then return slowly to the stretched start position.",
    breathing: "Exhale as you curl down. Inhale as you return.",
    tempo: "Curl for 1-2 seconds, hold briefly, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the seat and pads, secure the thighs, and begin from the extended-knee position with control." },
      { title: "Mid", description: "Bend the knees and draw the lower legs down and back while the torso stays tall and planted." },
      { title: "Peak", description: "Reach the strongest curl with the hamstrings fully engaged and the hips still fixed to the seat." },
      { title: "Finish", description: "Return the legs slowly to the starting stretch without letting the stack crash." }
    ],
    commonMistakes: [
      "Sliding forward in the seat",
      "Letting the weight pull the legs back too fast",
      "Using too much load to keep a full range",
      "Setting the machine pads incorrectly"
    ],
    safetyNotes: [
      "Keep the hips anchored to the seat for the whole set.",
      "Reduce load if the knees or hamstrings feel strained in the stretched position."
    ],
    modifications: ["Use lighter load", "Shorten the end range slightly", "Perform single-leg curls if the machine allows"],
    progressions: ["Add pauses at the bottom", "Slow the eccentric", "Increase load gradually"],
    regressions: ["Lying hamstring curl", "Glute bridge", "Light machine hamstring curl"],
    cues: ["Thighs stay pinned", "Curl under control", "Own the return"]
  },
  "lying hamstring curl": {
    category: "Legs",
    equipment: ["Lying hamstring curl machine"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves", "Glutes stabilizing"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Knee flexion",
    trainingUse: "Direct hamstring work, posterior-chain accessory training, and knee-flexion strength with torso support",
    description:
      "The lying hamstring curl is performed face down on a machine so the hamstrings can curl the pad toward the glutes through a controlled range. It is a straightforward way to isolate the back of the legs.",
    setup:
      "Lie face down on the machine with the knees lined up to the pivot and the lower pad resting just above the heels. Keep the hips pressed into the pad and hold the handles lightly for support.",
    execution:
      "Curl the pad up by bending the knees and bringing the heels toward the glutes. Pause briefly at the top, then lower slowly back to the starting position without lifting the hips off the pad.",
    breathing: "Exhale as you curl up. Inhale as you lower back down.",
    tempo: "Curl for 1-2 seconds, pause briefly, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Line the knees up with the pivot, set the pad above the heels, and keep the hips pressed into the bench." },
      { title: "Mid", description: "Bend the knees and curl the pad upward while the torso stays quiet against the support." },
      { title: "Peak", description: "Reach the top contraction with the heels close to the glutes and the hamstrings fully engaged." },
      { title: "Finish", description: "Lower the pad back down slowly until the legs extend again under control." }
    ],
    commonMistakes: [
      "Letting the hips lift off the pad",
      "Using momentum to whip the pad up",
      "Lowering too fast",
      "Setting the machine pads incorrectly"
    ],
    safetyNotes: [
      "Keep the hips pressed into the pad to protect the low back.",
      "Choose a load that lets you control both the curl and the return."
    ],
    modifications: ["Use lighter load", "Work a shorter range if needed", "Try single-leg curls if available"],
    progressions: ["Pause at the top", "Slow the lowering", "Increase load gradually"],
    regressions: ["Seated hamstring curl", "Glute bridge", "Bodyweight sliding leg curl"],
    cues: ["Hips stay down", "Heels curl up", "Lower with control"]
  },
  "landmine split squat": {
    category: "Legs",
    equipment: ["Landmine setup", "Barbell"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Split squat / single-leg squat",
    trainingUse: "Single-leg strength, front-leg loading, and lower-body development with a stable bar path",
    description:
      "The landmine split squat uses a split stance and a landmine-loaded bar to train the quads and glutes with a stable, forward-biased resistance path. It can feel more accessible than free dumbbells for some lifters.",
    setup:
      "Hold the end of the landmine bar at chest or shoulder level and step into a split stance. Keep the front foot flat, back heel lifted, torso tall, and core braced before starting the rep.",
    execution:
      "Lower straight down by bending both knees while keeping most of the work in the front leg. Drive through the front foot to stand back up while the landmine stays close to the torso.",
    breathing: "Inhale as you lower. Exhale as you stand.",
    tempo: "Lower for 2-3 seconds and stand up smoothly.",
    stepSequence: [
      { title: "Start", description: "Hold the landmine close to the chest, set the split stance, and organize the front foot and torso." },
      { title: "Mid", description: "Lower under control by bending both knees while the front knee tracks over the toes." },
      { title: "Peak", description: "Reach the deepest controlled split-squat position without collapsing the torso or front knee." },
      { title: "Finish", description: "Drive through the front foot and return to standing with the bar still close and the trunk stacked." }
    ],
    commonMistakes: [
      "Taking too short a stance",
      "Pushing mostly off the back leg",
      "Letting the front knee cave inward",
      "Leaning the torso too far forward"
    ],
    safetyNotes: [
      "Keep the landmine path close to the body so the trunk stays organized.",
      "Reduce load or use support if balance limits clean movement."
    ],
    modifications: ["Use bodyweight only", "Hold the landmine lower", "Reduce depth"],
    progressions: ["Increase load gradually", "Add a pause at the bottom", "Use tempo reps"],
    regressions: ["Supported split squat", "Step-up", "Bodyweight split squat"],
    cues: ["Front foot does the work", "Bar stays close", "Lower straight down"]
  },
  "kettlebell deadlift": {
    category: "Back / Legs",
    equipment: ["Kettlebell"],
    primaryMuscles: ["Glutes", "Hamstrings", "Spinal erectors"],
    secondaryMuscles: ["Lats", "Upper back", "Core", "Grip"],
    difficulty: "Beginner",
    jointStress: "moderate",
    movementPattern: "Hip hinge",
    trainingUse: "Hinge pattern learning, posterior-chain strength, and beginner-friendly deadlift practice",
    description:
      "The kettlebell deadlift is a hip-hinge lift performed with the kettlebell between the feet. It is often easier to learn than a barbell deadlift because the load stays centered and close to the body.",
    setup:
      "Stand with the kettlebell centered between the feet around mid-foot. Hinge back at the hips with a soft knee bend, brace the trunk, and grip the handle while keeping the spine neutral.",
    execution:
      "Push through the floor and extend the hips and knees together to stand tall. Keep the kettlebell close and the shoulders organized, then hinge back to lower it with control.",
    breathing: "Inhale and brace before lifting. Exhale after the hardest part or at the top, then reset.",
    tempo: "Lift with steady power and lower for 2-3 seconds with control.",
    stepSequence: [
      { title: "Start", description: "Set the feet around the bell, hinge down, brace, and grip the handle with the chest organized." },
      { title: "Mid", description: "Drive through the floor and lift the kettlebell while keeping it close and the spine neutral." },
      { title: "Peak", description: "Stand tall with hips extended, ribs stacked, and shoulders controlled without leaning back." },
      { title: "Finish", description: "Hinge back down and place the kettlebell back between the feet with control before the next rep." }
    ],
    commonMistakes: [
      "Squatting the weight up instead of hinging",
      "Letting the kettlebell drift forward",
      "Rounding the back before the lift",
      "Jerking the bell off the floor"
    ],
    safetyNotes: [
      "Start with a manageable weight while learning the hinge pattern.",
      "Keep the bell close and stop if the low back loses position."
    ],
    modifications: ["Elevate the kettlebell on a block", "Use a lighter kettlebell", "Reduce range while learning"],
    progressions: ["Heavier kettlebell", "Double-kettlebell deadlift", "Progress to conventional or sumo deadlift"],
    regressions: ["Hip hinge drill", "Good morning", "Romanian deadlift from blocks"],
    cues: ["Bell stays close", "Hips drive through", "Stand tall, do not lean back"]
  },
  "dumbbell romanian deadlift": {
    category: "Back / Legs",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Spinal erectors", "Lats", "Upper back", "Grip"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Hip hinge",
    trainingUse: "Posterior-chain strength, hamstring hypertrophy, and hinge pattern development with dumbbells",
    description:
      "The dumbbell Romanian deadlift is a hip-hinge exercise where the dumbbells travel close to the thighs and shins while the hips move back. It emphasizes the hamstrings and glutes more than knee-dominant squat patterns.",
    setup:
      "Stand tall with a dumbbell in each hand in front of the thighs. Set a soft bend in the knees, brace the core, and keep the shoulders packed so the dumbbells stay close to the body.",
    execution:
      "Push the hips back and hinge forward while keeping the spine long and the dumbbells close to the legs. When you feel a strong hamstring stretch, drive the hips forward to return to standing.",
    breathing: "Inhale as you hinge down. Exhale as you stand back up.",
    tempo: "Lower for 2-3 seconds and return with smooth control.",
    stepSequence: [
      { title: "Start", description: "Stand tall with dumbbells at the thighs, soft knees, and a braced trunk." },
      { title: "Mid", description: "Hinge by sending the hips back while the dumbbells track close to the thighs and shins." },
      { title: "Peak", description: "Reach the deepest hinge you can control with hamstring tension and a neutral spine." },
      { title: "Finish", description: "Drive the hips forward and return to standing while keeping the dumbbells close." }
    ],
    commonMistakes: [
      "Bending the knees too much and turning it into a squat",
      "Letting the dumbbells drift away from the legs",
      "Rounding the back at the bottom",
      "Leaning back excessively at the top"
    ],
    safetyNotes: [
      "Use a range you can control without losing spinal position.",
      "Start lighter until the hinge path feels consistent."
    ],
    modifications: ["Use lighter dumbbells", "Reduce range of motion", "Perform from a raised start"],
    progressions: ["Increase load gradually", "Add a pause near the stretched position", "Use tempo eccentrics"],
    regressions: ["Hip hinge drill", "Kettlebell deadlift", "Good morning"],
    cues: ["Hips back first", "Dumbbells stay close", "Stand by driving the hips through"]
  },
  "single-leg romanian deadlift": {
    category: "Back / Legs",
    equipment: ["Bodyweight or dumbbells"],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Core", "Foot and ankle stabilizers", "Spinal erectors"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Single-leg hip hinge",
    trainingUse: "Single-leg posterior-chain strength, balance, and hip-control development",
    description:
      "The single-leg Romanian deadlift is a one-leg hinge that trains the hamstrings and glutes while challenging balance and trunk control. It is useful for developing unilateral strength and hip stability.",
    setup:
      "Stand tall on one leg with a soft knee bend and the other foot lightly floating behind you. Keep the hips square, brace the core, and hold dumbbells or reach the hands forward depending on the variation.",
    execution:
      "Hinge at the hips while the free leg reaches back as a counterbalance. Lower until you feel tension in the standing hamstring, then drive through the stance foot and return to a tall balanced position.",
    breathing: "Inhale as you hinge down. Exhale as you return to standing.",
    tempo: "Lower for 2-3 seconds and return with control, not momentum.",
    stepSequence: [
      { title: "Start", description: "Set balance on one foot with a soft knee bend, hips square, and trunk braced." },
      { title: "Mid", description: "Hinge forward while the back leg reaches behind and the stance-leg hamstring loads." },
      { title: "Peak", description: "Reach the deepest hinge you can control without twisting the pelvis or losing the standing foot." },
      { title: "Finish", description: "Drive through the standing foot and return to tall balance under control." }
    ],
    commonMistakes: [
      "Twisting the hips open",
      "Rounding the spine to go deeper",
      "Losing balance because the foot is not organized",
      "Using momentum to stand back up"
    ],
    safetyNotes: [
      "Use support if balance is the limiting factor.",
      "Keep the range smaller until you can hinge without pelvic rotation."
    ],
    modifications: ["Perform bodyweight only", "Use one hand on support", "Tap the back foot lightly between reps"],
    progressions: ["Add dumbbells", "Use slower eccentrics", "Pause in the bottom position"],
    regressions: ["Dumbbell Romanian deadlift", "Hip hinge reach", "Supported single-leg hinge"],
    cues: ["Hips stay square", "Back leg reaches long", "Own the balance"]
  },
  "frog pump": {
    category: "Glutes",
    equipment: ["Bodyweight or dumbbell"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Deep hip rotators"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip extension",
    trainingUse: "Glute activation, high-rep pump work, and low-load hip-extension training",
    description:
      "The frog pump is a glute bridge variation performed with the soles of the feet together and the knees open. The shortened leg position reduces hamstring contribution and helps many people feel the glutes more clearly.",
    setup:
      "Lie on your back, bring the soles of the feet together, and let the knees fall outward. Keep the heels close enough to the hips to create leverage and brace lightly through the trunk.",
    execution:
      "Drive the hips upward by squeezing the glutes and pressing through the outer edges of the feet. Pause briefly at the top, then lower until the hips touch down softly before the next rep.",
    breathing: "Exhale as you lift the hips. Inhale as you lower.",
    tempo: "Lift for 1-2 seconds, squeeze briefly, and lower for 2 seconds.",
    stepSequence: [
      { title: "Start", description: "Set on your back with soles together, knees open, and heels close enough to the hips for a strong bridge." },
      { title: "Mid", description: "Drive the hips upward while keeping the knees open and the low back from taking over." },
      { title: "Peak", description: "Squeeze the glutes hard at the top with the hips fully extended and ribs controlled." },
      { title: "Finish", description: "Lower the hips back down softly and reset the feet before the next rep." }
    ],
    commonMistakes: [
      "Pushing mostly through the low back instead of the glutes",
      "Letting the feet drift too far away",
      "Dropping the hips too quickly between reps",
      "Losing the knee-open position"
    ],
    safetyNotes: [
      "Use a smaller top range if the front of the hips feels pinchy.",
      "Keep the ribs controlled so the low back does not over-arch."
    ],
    modifications: ["Use bodyweight only", "Reduce range of motion", "Place a pad under the hips if the floor is uncomfortable"],
    progressions: ["Add a dumbbell to the hips", "Use higher reps with pauses", "Progress to hip thrusts"],
    regressions: ["Glute bridge", "Reduced-range bridge", "Glute squeeze isometric"],
    cues: ["Soles together, knees open", "Glutes drive the lift", "Lower softly"]
  },
  "bulgarian split squat": {
    category: "Legs",
    equipment: ["Bench or support", "Bodyweight or dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Adductors", "Hamstrings", "Core"],
    difficulty: "Intermediate to advanced",
    jointStress: "moderate to high",
    movementPattern: "Rear-foot elevated split squat",
    trainingUse: "Single-leg strength, quad and glute hypertrophy, and balance-focused lower-body training",
    description:
      "The Bulgarian split squat is a rear-foot elevated split squat where the front leg does most of the work. It challenges strength, range of motion, and balance more than a regular split squat.",
    setup:
      "Stand a stride in front of a bench or support and place the top of the back foot on it. Plant the front foot firmly, keep the heel grounded, and brace the torso before lowering.",
    execution:
      "Lower straight down by bending the front knee and hip while the back knee travels toward the floor. Keep most of the pressure in the front foot and drive through it to return to standing.",
    breathing: "Inhale as you lower. Exhale as you stand.",
    tempo: "Lower for 2-3 seconds and stand smoothly with control.",
    stepSequence: [
      { title: "Start", description: "Place the rear foot on the bench, set the front foot far enough forward, and find a tall balanced stance." },
      { title: "Mid", description: "Lower under control while the front knee tracks over the toes and the back knee moves toward the floor." },
      { title: "Peak", description: "Reach the bottom position with the front heel grounded and the torso still organized." },
      { title: "Finish", description: "Drive through the front foot to return to standing without pushing hard off the back leg." }
    ],
    commonMistakes: [
      "Setting the front foot too close to the bench",
      "Pushing off the back foot too much",
      "Letting the front knee cave inward",
      "Dropping too fast and losing balance"
    ],
    safetyNotes: [
      "Use support or bodyweight first if balance is the limiting factor.",
      "Keep the range pain-free around the front knee and hip."
    ],
    modifications: ["Use bodyweight only", "Hold onto support", "Reduce depth"],
    progressions: ["Add dumbbells", "Add a pause at the bottom", "Use tempo reps"],
    regressions: ["Split squat", "Supported split squat", "Step-up"],
    cues: ["Front leg does the work", "Rear foot stays light", "Lower straight down"]
  },
  "goblet reverse lunge": {
    category: "Legs",
    equipment: ["Dumbbell or kettlebell"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "moderate",
    movementPattern: "Reverse lunge",
    trainingUse: "Single-leg strength, lunge pattern practice, and trunk-controlled lower-body training",
    description:
      "The goblet reverse lunge is a reverse lunge performed while holding one weight at chest height. The goblet load adds trunk demand and helps many lifters stay more upright through the lunge.",
    setup:
      "Hold one dumbbell or kettlebell close to the chest with elbows slightly tucked. Stand tall with feet under the hips, brace the trunk, and keep the front foot rooted before stepping back.",
    execution:
      "Step one leg back and lower under control until both knees bend comfortably. Keep the chest tall and most of the work in the front leg, then drive through the front foot to return to standing.",
    breathing: "Inhale as you step back and lower. Exhale as you drive back up.",
    tempo: "Lower for 2-3 seconds and stand smoothly without rushing the step.",
    stepSequence: [
      { title: "Start", description: "Hold the weight at chest height, stand tall, and organize the front foot before stepping back." },
      { title: "Mid", description: "Reach the back foot behind you and lower until both knees bend with control." },
      { title: "Peak", description: "Set the bottom position with the front foot planted, chest tall, and front knee tracking well." },
      { title: "Finish", description: "Drive through the front foot and step back into the starting stance under control." }
    ],
    commonMistakes: [
      "Stepping back too short and jamming the front knee forward",
      "Letting the front knee cave inward",
      "Leaning the torso too far forward",
      "Pushing off the back foot to stand up"
    ],
    safetyNotes: [
      "Use a lighter goblet load if balance or trunk position is the weak link.",
      "Keep the lunge range pain-free and controlled."
    ],
    modifications: ["Use bodyweight only", "Reduce depth", "Hold onto support with the free hand"],
    progressions: ["Add load", "Pause at the bottom", "Use alternating reverse lunges"],
    regressions: ["Reverse lunge", "Split squat", "Supported split squat"],
    cues: ["Weight stays close to chest", "Step back under control", "Front foot drives the return"]
  },
  "dumbbell walking lunge": {
    category: "Legs",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Walking lunge",
    trainingUse: "Single-leg leg strength, coordination, and loaded lower-body conditioning",
    description:
      "The dumbbell walking lunge is a loaded lunge pattern performed while moving forward step to step. It trains the legs and glutes while also challenging balance, posture, and rhythm under load.",
    setup:
      "Stand tall with a dumbbell in each hand at your sides. Brace the core, keep the shoulders down, and make sure you have enough space to take controlled lunging steps forward.",
    execution:
      "Step forward into a lunge and lower until both knees bend under control. Push through the front foot to stand and bring the back leg through into the next forward step without rushing.",
    breathing: "Inhale as you lower into each lunge. Exhale as you drive up and through to the next step.",
    tempo: "Lower each rep for 2 seconds and transition smoothly into the next stride.",
    stepSequence: [
      { title: "Start", description: "Stand tall with dumbbells at the sides, core braced, and eyes forward before stepping." },
      { title: "Mid", description: "Step forward and lower under control while the front knee tracks over the toes and the torso stays tall." },
      { title: "Peak", description: "Reach the bottom of the lunge with both legs loaded and balance still organized." },
      { title: "Finish", description: "Drive through the front foot, stand back up, and bring the trailing leg through into the next stride." }
    ],
    commonMistakes: [
      "Taking steps that are too short or too long",
      "Letting the torso sway under the dumbbells",
      "Dropping too quickly into each lunge",
      "Letting the front knee collapse inward"
    ],
    safetyNotes: [
      "Use a clear walking lane and manageable load so each step stays controlled.",
      "Reset between reps if the pattern turns sloppy instead of forcing the continuous walk."
    ],
    modifications: ["Use bodyweight or lighter dumbbells", "Perform alternating stationary lunges", "Shorten the stride slightly"],
    progressions: ["Increase load gradually", "Add a pause in each lunge", "Use longer walking sets"],
    regressions: ["Walking lunge", "Reverse lunge", "Split squat"],
    cues: ["Tall torso under load", "Step and lower with control", "Front foot drives the next step"]
  },
  "dumbbell step-up": {
    category: "Legs",
    equipment: ["Dumbbells", "Box or bench"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Single-leg step",
    trainingUse: "Loaded single-leg strength, stair-pattern training, and glute and quad development",
    description:
      "The dumbbell step-up is a loaded step-up performed with dumbbells held at the sides. It builds practical single-leg strength while adding more trunk and grip demand than a bodyweight step-up.",
    setup:
      "Hold a dumbbell in each hand and stand facing a stable box or bench. Place the full working foot on the surface with the heel down and keep the torso tall before stepping up.",
    execution:
      "Drive through the working foot to rise onto the box without pushing hard off the trailing leg. Stand tall at the top, then lower back down slowly with the same foot control.",
    breathing: "Exhale as you step up. Inhale as you lower back down.",
    tempo: "Stand up smoothly and lower for 2-3 seconds with control.",
    stepSequence: [
      { title: "Start", description: "Hold the dumbbells at your sides and place the full working foot on the box with the heel grounded." },
      { title: "Mid", description: "Drive through the planted foot and rise without bouncing off the trailing leg." },
      { title: "Peak", description: "Stand tall on the box with the working leg controlling the top position and the dumbbells steady." },
      { title: "Finish", description: "Step down slowly under control and reset the same foot before the next rep." }
    ],
    commonMistakes: [
      "Using a box that is too high to control",
      "Pushing mostly off the trailing foot",
      "Landing heavily on the way down",
      "Letting the working knee cave inward"
    ],
    safetyNotes: [
      "Use a stable step that will not shift.",
      "Choose a height you can control with the load you are holding."
    ],
    modifications: ["Use bodyweight only", "Lower the step height", "Hold one dumbbell goblet-style instead of two"],
    progressions: ["Increase load gradually", "Slow the eccentric", "Add a knee drive at the top"],
    regressions: ["Step-up", "Supported split squat", "Low step-up"],
    cues: ["Full foot on the box", "Stand from the working leg", "Lower with control"]
  },
  "sumo deadlift": {
    category: "Back / Legs",
    equipment: ["Barbell or kettlebell"],
    primaryMuscles: ["Glutes", "Adductors", "Hamstrings"],
    secondaryMuscles: ["Quadriceps", "Spinal erectors", "Upper back", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate to high",
    movementPattern: "Hip hinge",
    trainingUse: "Posterior-chain strength, adductor loading, and deadlift variation work with a wider stance",
    description:
      "The sumo deadlift is a wide-stance deadlift where the feet turn out and the hands grip inside the legs. It changes the leverage compared with a conventional deadlift and often increases adductor involvement.",
    setup:
      "Take a wider-than-shoulder-width stance with toes turned out as comfortable and the load centered between the legs. Hinge down, bend the knees enough to grip the bar or handle, brace the trunk, and set the spine neutral.",
    execution:
      "Push the floor apart with the feet and stand up by extending the hips and knees together. Keep the load close, chest organized, and finish tall without leaning back. Lower by hinging down under control.",
    breathing: "Inhale and brace before lifting. Exhale after the hardest part or at the top, then reset.",
    tempo: "Lift with steady power and lower for 2-3 seconds under control.",
    stepSequence: [
      { title: "Start", description: "Set the wide stance, turn the toes out, grip the load inside the legs, and brace before the pull." },
      { title: "Mid", description: "Push the floor apart and lift while keeping the load close and the torso organized." },
      { title: "Peak", description: "Stand tall with the hips extended, shoulders controlled, and no exaggerated lean back." },
      { title: "Finish", description: "Hinge down with control and return the load to the floor while keeping the stance organized." }
    ],
    commonMistakes: [
      "Letting the knees collapse inward",
      "Starting with the hips too high or too low",
      "Letting the bar drift away from the body",
      "Leaning back too far at lockout"
    ],
    safetyNotes: [
      "Use only the stance width you can keep stable and pain-free.",
      "Brace before every rep and stop if spinal position breaks down."
    ],
    modifications: ["Use a kettlebell between the legs", "Narrow the stance slightly", "Pull from blocks"],
    progressions: ["Increase load gradually", "Use paused reps off the floor", "Progress to heavier barbell work"],
    regressions: ["Kettlebell deadlift", "Trap-bar deadlift", "Romanian deadlift"],
    cues: ["Push the floor apart", "Load stays close", "Stand tall, not back"]
  },
  "cable glute kickback": {
    category: "Glutes",
    equipment: ["Cable machine", "Ankle cuff"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip extension",
    trainingUse: "Glute isolation, hip-extension accessory work, and lower-body pump training",
    description:
      "The cable glute kickback isolates hip extension by driving one leg back against cable resistance. It is useful for direct glute work when you want less spinal loading than hinges or squats.",
    setup:
      "Attach an ankle cuff to a low cable, face the machine, and hold onto the frame for balance. Stand tall on the support leg, brace lightly, and keep the working knee soft before kicking back.",
    execution:
      "Extend the hip by driving the leg back without arching the lower back. Squeeze the glute at the end range, then return the foot forward slowly until tension stays on the cable.",
    breathing: "Exhale as you kick back. Inhale as you return.",
    tempo: "Kick back for 1-2 seconds and return for 2-3 seconds under control.",
    stepSequence: [
      { title: "Start", description: "Set the cuff, hold the machine for balance, and begin with the working foot slightly under the hip." },
      { title: "Mid", description: "Drive the leg back by extending the hip while the torso stays quiet and ribs controlled." },
      { title: "Peak", description: "Reach the strongest glute contraction with the leg behind you and no low-back arch." },
      { title: "Finish", description: "Return the foot forward slowly until the cable stays taut and you can repeat cleanly." }
    ],
    commonMistakes: [
      "Arching the low back to move the leg farther",
      "Swinging the leg with momentum",
      "Rotating the pelvis open",
      "Letting the cable yank the leg back in"
    ],
    safetyNotes: [
      "Keep the motion driven from the hip, not the lower back.",
      "Use a load you can control without twisting the pelvis."
    ],
    modifications: ["Use lighter load", "Reduce the range slightly", "Perform with two-hand support on the machine"],
    progressions: ["Add a pause at full extension", "Increase load gradually", "Use slow eccentric returns"],
    regressions: ["Band glute kickback", "Glute bridge", "Frog pump"],
    cues: ["Hip extends, low back stays quiet", "Squeeze the glute", "Return under tension"]
  },
  "band glute kickback": {
    category: "Glutes",
    equipment: ["Resistance band"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip extension",
    trainingUse: "Home glute isolation, hip-extension practice, and low-load accessory training",
    description:
      "The band glute kickback is a home-friendly hip-extension exercise performed against band tension. It is useful when you want direct glute work without a cable station.",
    setup:
      "Loop the band around the working ankle and anchor it securely behind you or around the support leg depending on the setup. Stand tall, hold a stable surface if needed, and brace the trunk.",
    execution:
      "Drive the working leg back by extending the hip while keeping the pelvis square. Squeeze the glute at the end of the rep and return forward slowly without letting the band snap you in.",
    breathing: "Exhale as you kick back. Inhale as you return.",
    tempo: "Kick back smoothly and return for 2-3 seconds under tension.",
    stepSequence: [
      { title: "Start", description: "Set the band securely, organize your balance, and begin with the working foot slightly under the hip." },
      { title: "Mid", description: "Extend the hip and send the leg back while the torso stays quiet." },
      { title: "Peak", description: "Hold the end position briefly with the glute squeezed and the pelvis still square." },
      { title: "Finish", description: "Bring the leg back in slowly while keeping tension on the band." }
    ],
    commonMistakes: [
      "Letting the pelvis rotate open",
      "Using body swing instead of glute tension",
      "Arching the low back",
      "Using an unstable band anchor"
    ],
    safetyNotes: [
      "Check the band and anchor before starting.",
      "Reduce tension if you cannot keep the torso steady."
    ],
    modifications: ["Use a lighter band", "Shorten the range", "Hold onto support with both hands"],
    progressions: ["Use a stronger band", "Pause at full extension", "Slow the eccentric return"],
    regressions: ["Glute bridge", "Quadruped hip extension", "Bodyweight kickback"],
    cues: ["Square pelvis", "Glute drives the leg back", "Band returns slowly"]
  },
  "hip abduction": {
    category: "Glutes",
    equipment: ["Hip abduction machine or band"],
    primaryMuscles: ["Glute medius", "Glute minimus"],
    secondaryMuscles: ["Tensor fasciae latae", "Deep hip stabilizers"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip abduction",
    trainingUse: "Lateral hip strength, pelvis stability, and glute-med accessory work",
    description:
      "Hip abduction moves the thigh outward away from the midline to train the glute medius and minimus. It is useful for building lateral hip strength that supports squats, lunges, and gait mechanics.",
    setup:
      "Set up in the machine or band position with the pelvis stable and the working line of force aligned with the thighs. Sit or stand tall and keep the torso from swaying as the leg moves outward.",
    execution:
      "Move the thighs or leg outward under control until the lateral hip is fully engaged. Pause briefly, then return slowly without letting the resistance pull you back too fast.",
    breathing: "Exhale as you move outward. Inhale as you return.",
    tempo: "Move out for 1-2 seconds, pause briefly, and return for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the pelvis steady in the machine or band position and begin with the legs in the start range." },
      { title: "Mid", description: "Press the thigh or knees outward while the torso stays quiet and the feet stay organized." },
      { title: "Peak", description: "Reach the strongest lateral-hip contraction without rolling the pelvis or trunk." },
      { title: "Finish", description: "Return inward slowly until the start position is reached with control." }
    ],
    commonMistakes: [
      "Leaning the torso to create more range",
      "Moving too fast to feel the side hip",
      "Letting the knees or feet collapse inward on the return",
      "Using too much resistance for a clean arc"
    ],
    safetyNotes: [
      "Keep the pelvis steady and reduce load if you have to sway to move.",
      "Stay in a pain-free range around the hips."
    ],
    modifications: ["Use lighter resistance", "Work a shorter range", "Use one leg at a time if the machine allows"],
    progressions: ["Pause at peak abduction", "Slow the return", "Progress to lateral band walks"],
    regressions: ["Clamshell", "Side-lying hip raise", "Bodyweight lateral shift"],
    cues: ["Side glutes move the thigh", "Pelvis stays quiet", "Return slowly"]
  },
  "lateral band walk": {
    category: "Glutes",
    equipment: ["Resistance band"],
    primaryMuscles: ["Glute medius"],
    secondaryMuscles: ["Glute minimus", "Tensor fasciae latae", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Lateral locomotion / hip abduction",
    trainingUse: "Glute-med activation, lateral hip stability, and warm-up work before lower-body training",
    description:
      "The lateral band walk is a side-stepping drill performed against band tension. It trains the lateral hips to resist the knees collapsing inward and supports stronger squat and lunge mechanics.",
    setup:
      "Place a loop band above the knees or around the ankles depending on the challenge you want. Set a shallow athletic stance with hips back slightly, feet parallel, and tension already on the band.",
    execution:
      "Step sideways under control without letting the band snap the trailing leg in. Keep the toes mostly forward, knees soft, and tension on the band as you continue stepping both directions.",
    breathing: "Breathe steadily throughout the set and avoid holding your breath while staying braced.",
    tempo: "Take controlled side steps and keep constant band tension rather than moving quickly.",
    stepSequence: [
      { title: "Start", description: "Set the band position, sink into a slight squat, and create gentle tension before stepping." },
      { title: "Mid", description: "Step sideways with the lead foot while the pelvis stays level and the knees stay tracking out." },
      { title: "Peak", description: "Set the new stance width with the side hip engaged and the band still under tension." },
      { title: "Finish", description: "Bring the trailing foot in carefully without losing the tension or letting the knees collapse." }
    ],
    commonMistakes: [
      "Standing too tall and losing side-hip tension",
      "Letting the knees cave inward during the trail step",
      "Dragging the feet instead of stepping cleanly",
      "Taking steps that are too big to control"
    ],
    safetyNotes: [
      "Use a light enough band that you can keep the knees and feet aligned.",
      "Keep the steps controlled to avoid twisting the knees."
    ],
    modifications: ["Use a lighter band", "Place the band above the knees", "Take smaller steps"],
    progressions: ["Place the band around the ankles", "Use a lower athletic stance", "Add longer walking sets"],
    regressions: ["Hip abduction", "Clamshell", "Bodyweight side step"],
    cues: ["Band stays taut", "Knees track out", "Trail foot follows under control"]
  },
  clamshell: {
    category: "Glutes",
    equipment: ["Bodyweight or mini band"],
    primaryMuscles: ["Glute medius"],
    secondaryMuscles: ["Glute minimus", "Deep hip rotators"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Hip external rotation / abduction",
    trainingUse: "Lateral hip activation, glute-med training, and rehab-friendly lower-body prep",
    description:
      "The clamshell is a side-lying glute exercise where the top knee opens while the feet stay together. It targets the lateral hip and deep rotators without needing much external load.",
    setup:
      "Lie on one side with hips and knees bent, feet stacked, and head supported comfortably. Keep the pelvis stacked and the heels together before starting the rep.",
    execution:
      "Open the top knee while keeping the feet touching and the pelvis from rolling backward. Raise only as high as you can keep the side hip doing the work, then lower with control.",
    breathing: "Exhale as the top knee opens. Inhale as it lowers.",
    tempo: "Open for 1-2 seconds, pause briefly, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the side-lying position with knees bent, feet together, and hips stacked." },
      { title: "Mid", description: "Lift the top knee by rotating from the hip while the feet stay connected." },
      { title: "Peak", description: "Hold the highest position you can control without the pelvis rolling back." },
      { title: "Finish", description: "Lower the knee slowly until it meets the bottom leg and repeat." }
    ],
    commonMistakes: [
      "Rolling the pelvis backward to create more range",
      "Letting the feet separate",
      "Moving too fast to feel the side hip",
      "Using a range that shifts the work into the low back"
    ],
    safetyNotes: [
      "Keep the movement small enough that the lateral hip stays loaded.",
      "Add a pillow or pad under the head and knees if the side-lying setup is uncomfortable."
    ],
    modifications: ["Use bodyweight only", "Reduce the range of motion", "Support the top hand on the floor for stability"],
    progressions: ["Add a mini band", "Pause at the top", "Progress to lateral band walks"],
    regressions: ["Side-lying isometric hold", "Hip abduction with very small range", "Supine band abduction"],
    cues: ["Feet stay together", "Top knee opens from the hip", "Pelvis stays stacked"]
  },
  "hollow body hold": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals", "Deep core stabilizers"],
    secondaryMuscles: ["Hip flexors", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "low",
    movementPattern: "Anti-extension core",
    trainingUse: "Midline stiffness, gymnastics-style core training, and trunk control for pressing and hanging work",
    description: "The hollow body hold is an isometric core position where the ribs stay down, the low back stays controlled, and the arms and legs reach long without losing shape.",
    setup: "Lie on your back, flatten the ribs gently toward the floor, and reach the arms overhead or forward based on control. Extend the legs long and keep the chin lightly tucked.",
    execution: "Lift the shoulders and legs just enough to hold a hollow shape while keeping the low back controlled. Maintain steady tension through the abdominals instead of arching through the lumbar spine.",
    breathing: "Take short controlled breaths without letting the ribs pop up.",
    tempo: "Hold the position for time with quality prioritized over duration.",
    stepSequence: [
      { title: "Start", description: "Set the low back and ribs, reach the arms long, and extend the legs into a hollow setup." },
      { title: "Mid", description: "Lift the shoulders and legs into the hold while keeping the trunk braced and the neck relaxed." },
      { title: "Peak", description: "Own the strongest hollow shape you can keep without the low back arching away from control." },
      { title: "Finish", description: "Lower out of the hold before the ribs flare or the low back loses position." }
    ],
    commonMistakes: ["Arching the low back", "Holding the breath", "Lifting the legs too low to control", "Pulling the head forward with tension"],
    safetyNotes: ["Shorten the lever by bending the knees or bringing the arms forward if low-back control is not solid.", "End the set when the hollow shape breaks."],
    modifications: ["Bend the knees", "Keep the arms by the sides", "Use tuck hollow hold"],
    progressions: ["Lower the legs farther", "Reach the arms overhead", "Add longer holds"],
    regressions: ["Dead bug", "Bent-knee hollow hold", "Plank"],
    cues: ["Ribs stay down", "Reach long", "Hold the shape, not the strain"]
  },
  "hollow rock": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals", "Deep core stabilizers"],
    secondaryMuscles: ["Hip flexors", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "low",
    movementPattern: "Anti-extension core / dynamic stability",
    trainingUse: "Dynamic trunk control, gymnastics-style core strength, and hollow-shape endurance",
    description: "The hollow rock builds on the hollow hold by adding a controlled rocking motion while keeping the same braced body shape.",
    setup: "Start in a hollow hold with the low back controlled, ribs down, arms long, and legs extended to a range you can manage.",
    execution: "Rock gently forward and backward without changing the hollow shape. The movement should come from the whole body rocking, not from bending at the hips or spine.",
    breathing: "Use short steady breaths and keep the abdominal brace through the rocking motion.",
    tempo: "Use small smooth rocks with consistent control rather than big fast swings.",
    stepSequence: [
      { title: "Start", description: "Set a strong hollow hold with the low back controlled and the limbs reaching long." },
      { title: "Mid", description: "Begin the rock by shifting the body weight slightly without changing the trunk or hip angle." },
      { title: "Peak", description: "Maintain the hollow shape through the strongest part of the forward and backward rock." },
      { title: "Finish", description: "Return to a controlled hollow hold or lower out once the body shape starts to change." }
    ],
    commonMistakes: ["Kicking the legs to create motion", "Arching the low back", "Making the rock too big to control", "Letting the chin jut forward"],
    safetyNotes: ["Use small rocks until you can keep the same shape throughout.", "Stop if the low back starts taking over the movement."],
    modifications: ["Use tuck hollow rocks", "Reduce the rocking range", "Alternate with hollow holds"],
    progressions: ["Lengthen the lever", "Increase total reps", "Use slower pauses at each end of the rock"],
    regressions: ["Hollow body hold", "Dead bug", "Bent-knee hollow hold"],
    cues: ["Same shape the whole time", "Small controlled rocks", "Low back stays organized"]
  },
  crunch: {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals"],
    secondaryMuscles: ["Deep core stabilizers"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Trunk flexion",
    trainingUse: "Direct abdominal work, beginner core training, and short-range trunk flexion practice",
    description: "The crunch trains the abdominals by flexing the upper trunk a short distance off the floor without pulling aggressively on the neck.",
    setup: "Lie on your back with knees bent and feet planted. Place the hands lightly by the sides of the head or across the chest and keep the chin gently tucked.",
    execution: "Lift the head and shoulder blades by curling the ribs toward the pelvis. Pause briefly at the top, then lower under control without fully relaxing the core.",
    breathing: "Exhale as you curl up. Inhale as you lower back down.",
    tempo: "Crunch up for 1-2 seconds, pause briefly, and lower for 2 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the feet, tuck the chin lightly, and brace the abs before curling." },
      { title: "Mid", description: "Lift the head and shoulders by drawing the ribs toward the pelvis." },
      { title: "Peak", description: "Pause at the top with the abdominals engaged and the neck still relaxed." },
      { title: "Finish", description: "Lower the shoulders back down slowly without dropping out of tension." }
    ],
    commonMistakes: ["Pulling on the head", "Using too much momentum", "Turning it into a sit-up", "Holding the breath"],
    safetyNotes: ["Support the head lightly but do not yank on the neck.", "Keep the range comfortable and controlled."],
    modifications: ["Cross the arms over the chest", "Reduce range of motion", "Perform on a mat for comfort"],
    progressions: ["Slow the lowering", "Add a pause at the top", "Use cable crunches"],
    regressions: ["Abdominal brace hold", "Dead bug", "Short-range crunch"],
    cues: ["Ribs curl up", "Neck stays relaxed", "Lower with control"]
  },
  "reverse crunch": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals"],
    secondaryMuscles: ["Hip flexors", "Deep core stabilizers"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Posterior pelvic tilt / trunk flexion",
    trainingUse: "Lower-abdominal control, pelvic control, and core training without spinal loading",
    description: "The reverse crunch trains the abdominals by curling the pelvis off the floor rather than just swinging the legs upward.",
    setup: "Lie on your back with hips and knees bent. Keep the hands by the sides or lightly holding a stable support above the head if needed.",
    execution: "Draw the knees toward the chest and curl the pelvis off the floor by using the abdominals. Lower back down slowly until the pelvis resets under control.",
    breathing: "Exhale as the knees come in and the pelvis curls up. Inhale as you lower back down.",
    tempo: "Curl up smoothly and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the legs bent above the floor and prepare to curl the pelvis, not just lift the knees." },
      { title: "Mid", description: "Bring the knees inward while the low abs initiate a pelvic curl off the floor." },
      { title: "Peak", description: "Reach the top with the pelvis lightly lifted and the abs fully engaged." },
      { title: "Finish", description: "Lower the pelvis and legs back down slowly without letting them swing." }
    ],
    commonMistakes: ["Swinging the legs instead of curling the pelvis", "Using momentum", "Dropping the legs too fast", "Arching the low back at the bottom"],
    safetyNotes: ["Keep the motion controlled and small enough that the pelvis stays organized.", "Stop if the hip flexors dominate more than the abs."],
    modifications: ["Use a smaller range", "Keep the knees more bent", "Hold a support for stability"],
    progressions: ["Slow the lowering", "Add a pause at the top", "Progress toward hanging knee raises"],
    regressions: ["Crunch", "Dead bug", "Bent-knee march"],
    cues: ["Curl the pelvis", "No leg swing", "Lower under control"]
  },
  "bicycle crunch": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Abdominals", "Obliques"],
    secondaryMuscles: ["Hip flexors"],
    difficulty: "Beginner to intermediate",
    jointStress: "low",
    movementPattern: "Rotational trunk flexion",
    trainingUse: "Rotational core endurance, oblique training, and bodyweight conditioning core work",
    description: "The bicycle crunch combines a crunch with alternating trunk rotation and leg motion to train the abdominals and obliques together.",
    setup: "Lie on your back with hands lightly by the head, knees bent, and shoulder blades ready to lift from the floor. Keep the neck long and the low back controlled.",
    execution: "Lift the shoulders, rotate one elbow toward the opposite knee, and extend the other leg. Alternate sides smoothly while keeping the movement driven by the trunk rather than yanking the head around.",
    breathing: "Exhale on each twist toward the knee. Inhale as you transition sides under control.",
    tempo: "Move with a steady alternating rhythm that keeps each rep controlled.",
    stepSequence: [
      { title: "Start", description: "Set the hands lightly by the head, lift the shoulder blades, and bring one knee in." },
      { title: "Mid", description: "Rotate the trunk so one elbow moves toward the opposite knee while the other leg extends." },
      { title: "Peak", description: "Reach the strongest oblique contraction without pulling on the neck or losing trunk control." },
      { title: "Finish", description: "Switch sides smoothly and repeat with the same controlled rotation." }
    ],
    commonMistakes: ["Pulling the head with the hands", "Rushing the alternating motion", "Only moving the elbows instead of rotating the trunk", "Letting the low back arch as the leg extends"],
    safetyNotes: ["Move slowly enough to keep the trunk and neck under control.", "Use a smaller leg extension if the low back starts to arch."],
    modifications: ["Keep the feet higher", "Reduce the range of rotation", "Use marching crunches instead"],
    progressions: ["Slow the tempo", "Pause on each side", "Increase total reps"],
    regressions: ["Crunch", "Reverse crunch", "Dead bug"],
    cues: ["Rotate from the ribs", "Hands stay light", "Extend only as far as you control"]
  },
  "russian twist": {
    category: "Core",
    equipment: ["Bodyweight or medicine ball"],
    primaryMuscles: ["Obliques", "Abdominals"],
    secondaryMuscles: ["Hip flexors", "Deep core stabilizers"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Rotational core",
    trainingUse: "Oblique work, rotational trunk endurance, and seated core accessory training",
    description: "The Russian twist is a seated rotational core exercise where the trunk turns side to side while the pelvis stays relatively quiet.",
    setup: "Sit with knees bent and heels on the floor or slightly lifted based on control. Lean back just enough to feel the abs engage and keep the chest open rather than rounded.",
    execution: "Rotate the torso side to side from the ribs while keeping the hips mostly steady. If using a weight, move it with the torso instead of just swinging the arms.",
    breathing: "Exhale into each rotation. Inhale as you pass through center.",
    tempo: "Use a steady controlled side-to-side rhythm without bouncing.",
    stepSequence: [
      { title: "Start", description: "Set the seated lean-back position with the abs braced and the feet organized." },
      { title: "Mid", description: "Rotate to one side from the trunk while the pelvis stays mostly quiet." },
      { title: "Peak", description: "Reach the end of the twist with the obliques engaged and the chest still open." },
      { title: "Finish", description: "Return through center under control and rotate to the other side without swinging." }
    ],
    commonMistakes: ["Moving only the arms", "Rounding the low back heavily", "Rushing the twists", "Lifting the feet without control"],
    safetyNotes: ["Stay in a range that feels stable through the trunk and hips.", "Reduce load if the low back takes over."],
    modifications: ["Keep the heels down", "Use bodyweight only", "Reduce the lean-back angle"],
    progressions: ["Add a medicine ball", "Lift the feet", "Pause at each side"],
    regressions: ["Seated trunk rotation", "Crunch", "Dead bug"],
    cues: ["Twist from the ribs", "Pelvis stays steady", "Move with control"]
  },
  "hanging knee raise": {
    category: "Core",
    equipment: ["Pull-up bar or captain's chair"],
    primaryMuscles: ["Abdominals", "Hip flexors"],
    secondaryMuscles: ["Grip", "Lats", "Shoulder stabilizers"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Hip flexion / trunk control",
    trainingUse: "Hanging core work, lower-abdominal control, and trunk stability under suspension",
    description: "The hanging knee raise trains the abs and hip flexors by lifting the knees from a hang while resisting swing and keeping the trunk organized.",
    setup: "Hang from a bar or support with shoulders active and ribs controlled. Let the legs hang long and steady before beginning the raise.",
    execution: "Raise the knees toward the chest by flexing at the hips and curling the pelvis slightly. Lower the legs back down slowly without letting the body swing excessively.",
    breathing: "Exhale as the knees rise. Inhale as you lower with control.",
    tempo: "Lift smoothly, pause briefly at the top, and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the hang with active shoulders, a quiet trunk, and the legs steady below you." },
      { title: "Mid", description: "Draw the knees upward while resisting the urge to swing the torso." },
      { title: "Peak", description: "Reach the top with the abs engaged and the pelvis slightly curled under instead of just lifting the thighs." },
      { title: "Finish", description: "Lower the legs slowly back to the hang until the body is stable again." }
    ],
    commonMistakes: ["Swinging the body to create momentum", "Shrugging into the shoulders", "Only lifting the thighs without trunk control", "Dropping the legs quickly"],
    safetyNotes: ["Use straps or a captain's chair if grip is the limiting factor.", "Stop if shoulder position breaks or the swing gets excessive."],
    modifications: ["Use smaller knee raises", "Use captain's chair support", "Reset between reps"],
    progressions: ["Pause at the top", "Raise the knees higher", "Progress to leg raises"],
    regressions: ["Reverse crunch", "Dead bug", "Captain's chair knee raise"],
    cues: ["Hang active", "Knees rise under control", "No wild swing"]
  },
  "leg raise": {
    category: "Core",
    equipment: ["Bodyweight or hanging support"],
    primaryMuscles: ["Abdominals", "Hip flexors"],
    secondaryMuscles: ["Grip", "Lats", "Deep core stabilizers"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Hip flexion / trunk control",
    trainingUse: "Advanced core training, lower-abdominal strength, and hanging or floor-based trunk control",
    description: "The leg raise challenges the abdominals by lifting straighter legs while keeping the pelvis and ribcage controlled instead of letting the low back take over.",
    setup: "Set up on the floor or in a hang with the trunk braced and the legs long. Keep the ribs down and shoulders organized before lifting.",
    execution: "Raise the legs by flexing at the hips while maintaining abdominal tension. Lower the legs slowly to the starting position without swinging or arching through the low back.",
    breathing: "Exhale as the legs rise. Inhale as you lower under control.",
    tempo: "Lift smoothly and lower for 2-3 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the trunk and shoulders, extend the legs long, and prepare to raise them without losing rib position." },
      { title: "Mid", description: "Lift the legs under control while keeping the trunk braced and the movement smooth." },
      { title: "Peak", description: "Reach the top position your core can control without momentum or excessive spinal motion." },
      { title: "Finish", description: "Lower the legs slowly and stop before the low back arches or the body swings." }
    ],
    commonMistakes: ["Using momentum", "Arching the low back", "Shrugging during hanging raises", "Dropping the legs too quickly"],
    safetyNotes: ["Use a bent-knee version if straight-leg control is not there yet.", "Keep the range short enough that the low back stays supported or the hang stays quiet."],
    modifications: ["Bend the knees", "Use floor leg raises", "Reset between reps"],
    progressions: ["Pause at the top", "Use slower eccentrics", "Progress to toes-to-bar style control"],
    regressions: ["Hanging knee raise", "Reverse crunch", "Dead bug"],
    cues: ["Legs move, trunk stays organized", "No swing", "Lower slower than you lift"]
  },
  "cable crunch": {
    category: "Core",
    equipment: ["Cable machine with rope"],
    primaryMuscles: ["Abdominals"],
    secondaryMuscles: ["Deep core stabilizers", "Hip flexors"],
    difficulty: "Intermediate",
    jointStress: "low",
    movementPattern: "Trunk flexion",
    trainingUse: "Loaded abdominal work, trunk-flexion strength, and core hypertrophy",
    description: "The cable crunch trains the abs through loaded trunk flexion while kneeling under a high cable. It should feel like the ribs are curling down, not like a hip hinge.",
    setup: "Kneel facing away from a high cable with a rope attachment held near the head or collarbone. Set the hips still, ribs stacked, and glutes lightly engaged before crunching.",
    execution: "Curl the ribs toward the pelvis by flexing through the trunk. Keep the hips relatively quiet and return slowly until the abs lengthen again under tension.",
    breathing: "Exhale as you crunch down. Inhale as you return upward.",
    tempo: "Crunch for 1-2 seconds and return for 2-3 seconds under control.",
    stepSequence: [
      { title: "Start", description: "Set the kneeling stance, hold the rope close, and organize the ribs over the pelvis." },
      { title: "Mid", description: "Curl down by drawing the ribs toward the hips while the pelvis stays mostly still." },
      { title: "Peak", description: "Reach the strongest abdominal contraction without turning the movement into a hip hinge." },
      { title: "Finish", description: "Return upward slowly until the trunk lengthens under cable tension again." }
    ],
    commonMistakes: ["Folding mostly at the hips", "Yanking the rope with the arms", "Using too much load to feel the abs", "Bouncing through the range"],
    safetyNotes: ["Use a load that lets you feel trunk flexion without neck strain.", "Keep the pelvis quiet so the stress stays in the abs."],
    modifications: ["Use lighter load", "Shorten the range", "Use bodyweight crunches"],
    progressions: ["Increase load gradually", "Add a pause at the bottom", "Use slow eccentrics"],
    regressions: ["Crunch", "Reverse crunch", "Dead bug"],
    cues: ["Ribs curl down", "Hips stay quiet", "Return under tension"]
  },
  "ab wheel rollout": {
    category: "Core",
    equipment: ["Ab wheel"],
    primaryMuscles: ["Abdominals", "Deep core stabilizers"],
    secondaryMuscles: ["Lats", "Serratus anterior", "Shoulders"],
    difficulty: "Intermediate to advanced",
    jointStress: "moderate",
    movementPattern: "Anti-extension core",
    trainingUse: "Advanced trunk stability, anti-extension strength, and full-body core integration",
    description: "The ab wheel rollout challenges the core to resist spinal extension as the body reaches forward. It works best when the range stops before the low back starts to take over.",
    setup: "Kneel with the ab wheel under the shoulders and hands firmly on the handles. Brace the trunk, tuck the ribs slightly, and keep the glutes lightly engaged before rolling out.",
    execution: "Roll the wheel forward while maintaining a straight trunk and resisting low-back arching. Pull back in using the abs and lats until you return to the starting position.",
    breathing: "Inhale as you roll out. Exhale as you pull back in.",
    tempo: "Roll out slowly for 2-3 seconds and return with control.",
    stepSequence: [
      { title: "Start", description: "Set the knees, wheel, and trunk brace so the ribs and pelvis stay connected before you move." },
      { title: "Mid", description: "Roll the wheel forward while keeping the torso long and resisting low-back extension." },
      { title: "Peak", description: "Reach the furthest position you can control without the low back arching or the shoulders collapsing." },
      { title: "Finish", description: "Pull the wheel back underneath you using the abs and lats while keeping the same trunk shape." }
    ],
    commonMistakes: ["Going too far and arching the low back", "Dropping the head and shoulders", "Using momentum to return", "Losing rib position early in the rollout"],
    safetyNotes: ["Use a shorter rollout range than you think you need at first.", "Stop immediately if the movement shifts into low-back strain."],
    modifications: ["Use partial rollouts", "Perform from a wall stop", "Use a stability ball rollout instead"],
    progressions: ["Increase rollout range", "Add pauses at full extension", "Progress toward standing rollout work"],
    regressions: ["Dead bug", "Plank", "Body saw plank"],
    cues: ["Ribs and pelvis stay connected", "Reach without arching", "Pull back under control"]
  },
  "bird dog": {
    category: "Core",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Deep core stabilizers", "Spinal stabilizers"],
    secondaryMuscles: ["Glutes", "Shoulders"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Contralateral stability",
    trainingUse: "Core stability, spinal control, and coordination between opposite arm and leg",
    description: "The bird dog teaches the trunk to stay stable while the opposite arm and leg reach away. It is a low-load but high-value drill for spinal control and hip-shoulder coordination.",
    setup: "Start on all fours with hands under shoulders and knees under hips. Brace lightly through the trunk and keep the neck long before reaching.",
    execution: "Reach one arm forward and the opposite leg back while keeping the hips and ribs square to the floor. Return under control and switch sides without shifting excessively.",
    breathing: "Exhale as you reach long. Inhale as you return to the tabletop position.",
    tempo: "Move slowly and pause briefly in the extended position before returning.",
    stepSequence: [
      { title: "Start", description: "Set a stable tabletop with a long spine and quiet hips before reaching." },
      { title: "Mid", description: "Reach the opposite arm and leg away while the torso stays still and the pelvis remains level." },
      { title: "Peak", description: "Hold the long reach with the glute, shoulder, and core all engaged at once." },
      { title: "Finish", description: "Return to the start smoothly without dropping or twisting, then switch sides." }
    ],
    commonMistakes: ["Rotating the hips open", "Lifting the leg too high and arching the back", "Rushing the switch", "Shrugging the reaching shoulder"],
    safetyNotes: ["Keep the reach long rather than high.", "Use a smaller reach if you cannot keep the hips and ribs square."],
    modifications: ["Reach only the leg", "Reach only the arm", "Shorten the hold"],
    progressions: ["Pause longer in the reach", "Draw elbow to knee between reps", "Use resisted bird dogs"],
    regressions: ["Quadruped brace hold", "Dead bug", "Marching tabletop hold"],
    cues: ["Reach long, not high", "Hips stay level", "Return under control"]
  },
  superman: {
    category: "Back",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Spinal erectors", "Glutes"],
    secondaryMuscles: ["Upper back", "Shoulders", "Hamstrings"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Spinal extension",
    trainingUse: "Posterior-chain activation, low-load back extensor work, and warm-up for hinge training",
    description: "The superman is a prone extension drill that lightly trains the back extensors and glutes by lifting the arms, chest, and legs off the floor.",
    setup: "Lie face down with the arms extended overhead or slightly out and the legs long behind you. Keep the neck neutral and brace lightly through the trunk before lifting.",
    execution: "Lift the arms, chest, and legs gently from the floor while keeping the motion smooth and controlled. Lower back down softly instead of bouncing through the range.",
    breathing: "Exhale as you lift. Inhale as you lower.",
    tempo: "Lift for 1-2 seconds, pause briefly, and lower for 2 seconds.",
    stepSequence: [
      { title: "Start", description: "Set the prone position with the arms and legs long and the neck neutral." },
      { title: "Mid", description: "Lift the chest, arms, and legs gently while keeping the glutes and upper back active." },
      { title: "Peak", description: "Hold the top with smooth tension rather than forcing a maximal back arch." },
      { title: "Finish", description: "Lower back to the floor under control and reset before the next rep." }
    ],
    commonMistakes: ["Cranking the neck up", "Overarching the low back", "Swinging the limbs up and down", "Holding the breath"],
    safetyNotes: ["Use a small lift if your low back feels compressed.", "Focus on quality posterior-chain tension rather than height."],
    modifications: ["Lift only the arms", "Lift only the legs", "Use shorter holds"],
    progressions: ["Pause longer at the top", "Use alternating arm-leg supermans", "Progress to back extension work"],
    regressions: ["Bird dog", "Glute bridge", "Prone chest lift"],
    cues: ["Lift gently", "Neck stays long", "Lower softly"]
  },
  "farmer carry": {
    category: "Carries",
    equipment: ["Dumbbells, kettlebells, or trap implements"],
    primaryMuscles: ["Grip", "Traps", "Core"],
    secondaryMuscles: ["Forearms", "Shoulders", "Glutes"],
    difficulty: "Beginner to intermediate",
    jointStress: "low to moderate",
    movementPattern: "Loaded carry",
    trainingUse: "Grip strength, trunk bracing, posture under load, and loaded conditioning",
    description: "The farmer carry is a bilateral loaded carry where you walk with heavy weights at the sides. It trains posture, grip, and trunk stiffness while the legs keep moving under load.",
    setup: "Stand tall with one weight in each hand at the sides. Set the shoulders down, ribs stacked, and grip firm before you start walking.",
    execution: "Walk with short controlled steps while staying tall and resisting sway. Keep the weights quiet at the sides and finish the carry before posture starts to break down.",
    breathing: "Use steady rhythmic breaths without losing your brace or shrugging.",
    tempo: "Walk at a strong controlled pace with crisp repeatable steps.",
    stepSequence: [
      { title: "Start", description: "Stand tall with the weights at the sides, shoulders packed, and trunk braced before the first step." },
      { title: "Mid", description: "Take short strong steps while keeping the torso vertical and the weights quiet." },
      { title: "Peak", description: "Own the middle of the carry with full-body tension and no leaning or shrugging." },
      { title: "Finish", description: "Complete the distance, slow the steps down, and set the weights down with control." }
    ],
    commonMistakes: ["Shrugging under the load", "Leaning forward or side to side", "Taking sloppy noisy steps", "Using more load than grip can control cleanly"],
    safetyNotes: ["Use a clear walking path and set the weights down safely once posture fades.", "Choose a load you can carry without twisting or collapsing."],
    modifications: ["Use lighter weights", "Shorten the carry distance", "Perform static farmer holds"],
    progressions: ["Increase load", "Increase distance", "Use uneven surfaces only if control is solid"],
    regressions: ["Suitcase carry with lighter load", "Farmer hold", "March in place under load"],
    cues: ["Stand tall", "Grip hard", "Walk without wobble"]
  },
  "suitcase carry": {
    category: "Carries",
    equipment: ["Dumbbell or kettlebell"],
    primaryMuscles: ["Obliques", "Grip", "Core"],
    secondaryMuscles: ["Traps", "Glutes", "Forearms"],
    difficulty: "Intermediate",
    jointStress: "low to moderate",
    movementPattern: "Single-arm loaded carry",
    trainingUse: "Anti-side-bend trunk strength, grip work, and single-sided carry training",
    description: "The suitcase carry is a one-sided loaded carry that challenges the trunk to resist leaning toward or away from the weight while walking.",
    setup: "Hold one weight at one side with the free arm relaxed. Stand tall with the ribs stacked over the pelvis and the shoulders level before walking.",
    execution: "Walk forward with controlled steps while resisting side bend and rotation. Keep the weighted shoulder packed and the torso centered over the feet.",
    breathing: "Use steady breaths while keeping the trunk stacked and the shoulders even.",
    tempo: "Walk at a controlled pace that lets you keep the torso quiet.",
    stepSequence: [
      { title: "Start", description: "Pick up the weight at one side, stand tall, and level the shoulders before stepping." },
      { title: "Mid", description: "Walk forward while resisting any pull or lean from the loaded side." },
      { title: "Peak", description: "Maintain a quiet centered torso with the obliques fully engaged through the middle of the carry." },
      { title: "Finish", description: "Slow down, stop under control, and set the weight down safely before switching sides." }
    ],
    commonMistakes: ["Leaning toward the weight", "Hiking the loaded shoulder", "Walking too fast to stay aligned", "Letting the ribs flare"],
    safetyNotes: ["Switch sides evenly and stop if you cannot keep the torso centered.", "Use a clear path and manageable load."],
    modifications: ["Use a lighter load", "Carry for shorter distance", "Perform static suitcase holds"],
    progressions: ["Increase load", "Increase distance", "Use slower marching steps"],
    regressions: ["Farmer hold", "Farmer carry", "Tall kneeling anti-side-bend hold"],
    cues: ["Stay tall and centered", "Shoulders stay level", "Let the trunk resist the load"]
  },
  "bear crawl": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Shoulders", "Core", "Quadriceps"],
    secondaryMuscles: ["Glutes", "Hip flexors", "Serratus anterior"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Crawl pattern",
    trainingUse: "Full-body coordination, trunk stability, shoulder endurance, and conditioning",
    description: "The bear crawl is a low hovering crawl where opposite hand and foot move together while the trunk stays stable and the knees stay just off the floor.",
    setup: "Start on hands and feet with knees hovering a few inches off the floor. Keep the back flat, ribs down, and hands under the shoulders before moving.",
    execution: "Crawl forward by moving opposite hand and foot together in short controlled steps. Keep the hips level, knees hovering, and torso quiet as you move.",
    breathing: "Use steady breaths and avoid holding your breath while crawling.",
    tempo: "Take short crisp steps with control rather than rushing.",
    stepSequence: [
      { title: "Start", description: "Set the hover position with knees off the floor, spine long, and trunk braced." },
      { title: "Mid", description: "Move one hand and the opposite foot forward together while keeping the hips quiet." },
      { title: "Peak", description: "Own the hovering crawl position as the body shifts weight without twisting or sagging." },
      { title: "Finish", description: "Place the limbs down softly, continue the pattern, and stop before posture breaks." }
    ],
    commonMistakes: ["Hips hiking too high", "Letting the knees touch down every step", "Taking steps that are too large", "Twisting the trunk during the crawl"],
    safetyNotes: ["Use a short lane and quality-first pace.", "Rest once the hover position breaks rather than dragging through sloppy reps."],
    modifications: ["Hold the bear hover", "Crawl fewer steps", "Use elevated hands"],
    progressions: ["Crawl backward", "Increase distance", "Add shoulder tap pauses"],
    regressions: ["Bird dog", "Bear hover hold", "Marching tabletop"],
    cues: ["Knees stay low", "Opposite hand and foot move", "Hips stay quiet"]
  },
  "jump squat": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Quadriceps", "Glutes", "Calves"],
    secondaryMuscles: ["Core", "Hamstrings"],
    difficulty: "Intermediate",
    jointStress: "moderate to high",
    movementPattern: "Jump / squat power",
    trainingUse: "Lower-body power, athletic conditioning, and explosive leg training",
    description: "The jump squat adds an explosive vertical jump to the squat pattern and trains the legs to produce force quickly while landing with control.",
    setup: "Stand in a squat stance with feet around shoulder width and the trunk braced. Keep the chest organized and the feet rooted before loading the squat.",
    execution: "Dip into a controlled squat, explode upward into a jump, and land softly through the whole foot before resetting into the next rep.",
    breathing: "Inhale on the dip. Exhale as you drive into the jump.",
    tempo: "Use a quick but controlled dip, explosive jump, and quiet landing reset.",
    stepSequence: [
      { title: "Start", description: "Set the squat stance and load a short controlled dip with the trunk organized." },
      { title: "Mid", description: "Drive forcefully through the floor and extend the hips, knees, and ankles into the jump." },
      { title: "Peak", description: "Reach the top of the jump with the body stacked and the arms helping the rhythm if used." },
      { title: "Finish", description: "Land softly, absorb the force through the legs, and reset before the next jump." }
    ],
    commonMistakes: ["Dropping too deep before the jump", "Landing stiff-legged", "Letting the knees cave in on landing", "Turning it into a sloppy pogo jump"],
    safetyNotes: ["Land softly and stop the set once landing quality drops.", "Use bodyweight only unless you already own the landing mechanics."],
    modifications: ["Use lower-effort jumps", "Pause between reps", "Use bodyweight squat to calf raise instead"],
    progressions: ["Increase intent", "Add repeated reactive reps", "Progress to box jump variations"],
    regressions: ["Bodyweight squat", "Calf raise jump prep", "Step squat with fast stand"],
    cues: ["Dip with control", "Explode up", "Land softly and stable"]
  },
  "box jump": {
    category: "Conditioning",
    equipment: ["Stable box"],
    primaryMuscles: ["Glutes", "Quadriceps", "Calves"],
    secondaryMuscles: ["Hamstrings", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Jump / box landing",
    trainingUse: "Power development, athletic training, and explosive lower-body work with controlled landings",
    description: "The box jump trains explosive jumping power while reducing landing impact by finishing on top of a box. The goal is a clean jump and soft landing, not the tallest possible box.",
    setup: "Stand facing a stable box at a distance that allows a natural jump. Set the feet around hip to shoulder width and brace the trunk before loading the jump.",
    execution: "Dip quickly and jump onto the box, landing softly with knees and hips bent. Stand up only once the landing is secure, then step down under control instead of jumping back off.",
    breathing: "Inhale during the dip and exhale through the jump.",
    tempo: "Quick preload, explosive jump, soft landing, and controlled step-down.",
    stepSequence: [
      { title: "Start", description: "Face the box, set the stance, and load a short athletic dip." },
      { title: "Mid", description: "Drive off the floor powerfully and bring the body onto the box under control." },
      { title: "Peak", description: "Land softly on the box with the feet planted and the trunk stable." },
      { title: "Finish", description: "Stand tall only after the landing is secure, then step down carefully." }
    ],
    commonMistakes: ["Using a box that is too high", "Landing loudly or stiff-legged", "Letting the knees cave inward", "Jumping back down carelessly"],
    safetyNotes: ["Choose a box height you can land on cleanly every rep.", "Always step down unless the program specifically calls for rebound work and the setup supports it."],
    modifications: ["Use a lower box", "Use a squat jump instead", "Pause between jumps"],
    progressions: ["Increase box height gradually", "Use repeated singles", "Add approach mechanics only if landings stay clean"],
    regressions: ["Jump squat", "Step-up", "Snap-down landing drill"],
    cues: ["Explode to the box", "Land quietly", "Step down with control"]
  },
  "jumping jack": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Calves", "Shoulders", "Conditioning"],
    secondaryMuscles: ["Glutes", "Hip abductors", "Core"],
    difficulty: "Beginner",
    jointStress: "low to moderate",
    movementPattern: "Low-impact jumping pattern",
    trainingUse: "Heart-rate ramp-up, low-complexity cardio intervals, and coordination-focused warm-up work",
    description: "The jumping jack is a classic bodyweight conditioning drill where the feet and arms move out and in together in a repeatable rhythm.",
    setup: "Stand tall with feet together or hip width and arms by the sides. Keep the posture stacked and prepare to move with light quick contacts.",
    execution: "Jump the feet out while the arms sweep overhead, then jump back to the starting position with the arms returning to the sides. Keep the rhythm smooth and the landings light.",
    breathing: "Breathe rhythmically and avoid holding your breath while the pace rises.",
    tempo: "Use a steady repeatable cadence that you can maintain cleanly.",
    stepSequence: [
      { title: "Start", description: "Stand tall with the feet under you and arms ready at the sides." },
      { title: "Mid", description: "Jump the feet out while the arms travel overhead in one coordinated motion." },
      { title: "Peak", description: "Reach the widest position with the body still tall and the landing light." },
      { title: "Finish", description: "Return the feet and arms to the start position and continue with the same rhythm." }
    ],
    commonMistakes: ["Landing heavily", "Losing rhythm between arms and legs", "Shrugging through the shoulders", "Letting the knees cave in on the return"],
    safetyNotes: ["Use a step-out version if repeated jumping irritates the joints.", "Keep the contacts light and stop if form becomes sloppy."],
    modifications: ["Step jacks instead of jumping", "Reduce arm range", "Shorten the work interval"],
    progressions: ["Increase pace", "Use longer intervals", "Add overhead load only if appropriate"],
    regressions: ["Step jack", "March in place", "Low-impact side steps"],
    cues: ["Light feet", "Arms and legs move together", "Keep the rhythm smooth"]
  },
  "skater hop": {
    category: "Conditioning",
    equipment: ["Bodyweight"],
    primaryMuscles: ["Glutes", "Quadriceps", "Lateral hip stabilizers"],
    secondaryMuscles: ["Calves", "Hamstrings", "Core"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Lateral power",
    trainingUse: "Lateral athletic power, single-leg landing control, and conditioning",
    description: "The skater hop is a side-to-side jumping drill that trains lateral force production and controlled single-leg landing mechanics.",
    setup: "Start in a slight athletic stance with the hips back, chest organized, and weight balanced through the whole foot.",
    execution: "Hop laterally to one side and land under control on the outside leg. Rebound or reset into the next hop while keeping the hips and knee aligned.",
    breathing: "Use short steady breaths and exhale through the more forceful hop.",
    tempo: "Jump with intent but only as fast as you can own each landing.",
    stepSequence: [
      { title: "Start", description: "Set an athletic stance and load the leg you are about to push from." },
      { title: "Mid", description: "Drive laterally off the planted leg and move across with the torso stable." },
      { title: "Peak", description: "Land softly on the opposite leg with the knee and hip lined up." },
      { title: "Finish", description: "Stabilize the landing and push into the next hop only when you are controlled." }
    ],
    commonMistakes: ["Landing with the knee collapsing inward", "Jumping too far to control the landing", "Staying too upright to absorb force", "Rushing before balance is regained"],
    safetyNotes: ["Own the landing before increasing distance or speed.", "Use smaller hops if the knees or ankles feel unstable."],
    modifications: ["Use step-behind lateral bounds", "Reduce hop distance", "Pause between reps"],
    progressions: ["Increase distance", "Use faster repeats", "Add reactive change-of-direction patterns"],
    regressions: ["Lateral step", "Lateral band walk", "Split-stance lateral reach"],
    cues: ["Push sideways", "Land softly", "Stabilize before the next hop"]
  },
  "battle rope waves": {
    category: "Conditioning",
    equipment: ["Battle ropes"],
    primaryMuscles: ["Shoulders", "Arms", "Core", "Conditioning"],
    secondaryMuscles: ["Upper back", "Legs", "Grip"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Upper-body conditioning",
    trainingUse: "Metabolic conditioning, shoulder endurance, and trunk-stable upper-body power output",
    description: "Battle rope waves use repeated rope movement to challenge the shoulders, arms, and trunk while the lower body stays in an athletic stance.",
    setup: "Stand facing the anchor in an athletic stance with knees soft and one rope end in each hand. Brace the trunk and keep the shoulders down before starting the waves.",
    execution: "Create alternating or double waves by driving the ropes with the arms while keeping the torso steady. Maintain an athletic stance and let the arms move quickly without losing posture.",
    breathing: "Use rhythmic breaths and do not let the pace force you into breath-holding.",
    tempo: "Move the ropes fast enough to create clean waves while posture stays organized.",
    stepSequence: [
      { title: "Start", description: "Set the stance, grip the rope ends, and brace before the first wave." },
      { title: "Mid", description: "Drive the ropes in a repeatable wave pattern while the hips and trunk stay stable." },
      { title: "Peak", description: "Maintain strong crisp waves through the hardest part of the interval without shrugging." },
      { title: "Finish", description: "Slow the ropes down under control and stand tall before dropping the pace fully." }
    ],
    commonMistakes: ["Standing too upright", "Shrugging the shoulders", "Using only the arms with no trunk organization", "Letting the wave pattern break down immediately"],
    safetyNotes: ["Use a rope load and interval length you can sustain with clean posture.", "Stop before the shoulders or low back lose position."],
    modifications: ["Use shorter intervals", "Use smaller waves", "Alternate arms more slowly"],
    progressions: ["Longer work intervals", "Heavier ropes", "Double-wave or power-slam combinations"],
    regressions: ["Jumping jack", "Farmer carry march", "Light cable conditioning intervals"],
    cues: ["Athletic stance", "Ropes move, trunk stays steady", "Keep the waves crisp"]
  },
  "medicine ball slam": {
    category: "Conditioning",
    equipment: ["Medicine ball"],
    primaryMuscles: ["Core", "Lats", "Shoulders", "Conditioning"],
    secondaryMuscles: ["Glutes", "Hamstrings", "Arms"],
    difficulty: "Intermediate",
    jointStress: "moderate",
    movementPattern: "Explosive trunk flexion / power",
    trainingUse: "Power conditioning, full-body effort, and aggressive but controlled core-driven output",
    description: "The medicine ball slam is an explosive power drill where the ball is lifted overhead and slammed to the floor using the trunk, arms, and hips together.",
    setup: "Stand with feet around hip width and hold the ball securely in both hands. Brace the trunk and make sure the slam area is clear before taking the ball overhead.",
    execution: "Reach the ball overhead, then drive it powerfully down by flexing through the trunk and hips. Follow the ball safely, pick it up with control, and reset before the next rep.",
    breathing: "Inhale before the overhead reach and exhale sharply through the slam.",
    tempo: "Use powerful slams with deliberate resets rather than sloppy nonstop reps.",
    stepSequence: [
      { title: "Start", description: "Set the stance, grip the ball securely, and reach it overhead with a braced trunk." },
      { title: "Mid", description: "Drive the ball downward with the trunk, arms, and hips working together." },
      { title: "Peak", description: "Finish the slam into the floor with full body tension and no overextension through the low back." },
      { title: "Finish", description: "Follow the ball down safely, retrieve it with control, and reset before the next slam." }
    ],
    commonMistakes: ["Leaning back too far overhead", "Trying to catch a high bounce carelessly", "Slamming with only the arms", "Rushing the pickup into poor posture"],
    safetyNotes: ["Use a slam-safe ball and clear floor space.", "Pick the ball up with control between reps instead of rounding and snatching it up."],
    modifications: ["Use a lighter ball", "Reduce overhead range", "Use chest-pass slams instead"],
    progressions: ["Use a slightly heavier slam ball", "Increase work density", "Add rotational slam variations"],
    regressions: ["Jumping jack", "Cable crunch", "Bodyweight squat to reach"],
    cues: ["Reach up with control", "Slam through the trunk and hips", "Retrieve safely"]
  },
  "sled push": {
    category: "Conditioning",
    equipment: ["Sled"],
    primaryMuscles: ["Quadriceps", "Glutes", "Calves", "Conditioning"],
    secondaryMuscles: ["Core", "Shoulders", "Triceps"],
    difficulty: "Intermediate to advanced",
    jointStress: "moderate",
    movementPattern: "Loaded drive / locomotion",
    trainingUse: "Leg-driven conditioning, force production, and lower-body work with low eccentric cost",
    description: "The sled push is a forward driving conditioning drill where the legs produce force while the torso stays angled and braced against the sled handles.",
    setup: "Set the hands firmly on the sled handles, lean slightly forward from the ankles, and create a rigid trunk before initiating the push.",
    execution: "Drive the sled with quick powerful steps while maintaining the lean and trunk tension. Keep the feet pushing through the ground and avoid letting the upper body collapse as fatigue builds.",
    breathing: "Use short steady breaths and keep the brace organized as the sled moves.",
    tempo: "Use quick repeatable steps and only as much speed as you can keep with posture.",
    stepSequence: [
      { title: "Start", description: "Grip the sled, set the forward body angle, and brace before the first drive step." },
      { title: "Mid", description: "Push through the ground with powerful steps while keeping the torso rigid and the sled moving smoothly." },
      { title: "Peak", description: "Maintain the strongest part of the push with consistent stride rhythm and no posture collapse." },
      { title: "Finish", description: "Run the sled through the target distance, then decelerate under control instead of quitting into the handles." }
    ],
    commonMistakes: ["Standing too upright", "Chopping the steps too short", "Letting the core soften under fatigue", "Using a sled load that kills movement quality immediately"],
    safetyNotes: ["Use a load you can move with clean posture and clear floor space.", "Stop the interval once the lean and stride mechanics break down."],
    modifications: ["Use a lighter sled", "Shorten the distance", "Push with slower marching steps"],
    progressions: ["Increase load", "Increase distance", "Use repeated sprint intervals"],
    regressions: ["Bike sprint", "Farmer carry march", "Bodyweight split-stance drives"],
    cues: ["Lean from the ankles", "Quick strong steps", "Stay braced the whole run"]
  },
  "assault bike sprint": {
    category: "Conditioning",
    equipment: ["Air bike / assault bike"],
    primaryMuscles: ["Conditioning", "Quadriceps", "Glutes", "Arms"],
    secondaryMuscles: ["Calves", "Core", "Shoulders"],
    difficulty: "Intermediate to advanced",
    jointStress: "low to moderate",
    movementPattern: "Cardio sprint",
    trainingUse: "High-output conditioning, interval work, and full-body power-endurance training",
    description: "The assault bike sprint uses hard pedaling plus aggressive push-pull handle action to create a high-output conditioning interval with low impact.",
    setup: "Adjust the seat so you can pedal with a slight knee bend at the bottom. Set the hands on the moving handles, sit tall, and brace the trunk before building speed.",
    execution: "Drive the pedals hard while pushing and pulling the handles forcefully. Hold an efficient trunk position and keep the effort aggressive for the planned sprint interval.",
    breathing: "Breathe hard and rhythmically rather than holding your breath during the sprint.",
    tempo: "Accelerate quickly into the work interval and sustain only as much pace as the interval demands.",
    stepSequence: [
      { title: "Start", description: "Set seat height, grip the handles, and begin pedaling with a stacked torso." },
      { title: "Mid", description: "Drive into the sprint by pushing and pulling the handles while pedaling hard." },
      { title: "Peak", description: "Hold the highest sustainable sprint output without bouncing in the saddle or losing rhythm." },
      { title: "Finish", description: "Ease out of the sprint under control and keep moving for the recovery period instead of stopping abruptly." }
    ],
    commonMistakes: ["Seat set too low or too high", "Pulling with the arms but not driving the pedals", "Bouncing around in the seat", "Going all-out too early for the interval length"],
    safetyNotes: ["Set the seat correctly before sprinting.", "Use recovery periods that let you regain control before the next hard effort."],
    modifications: ["Use shorter sprint intervals", "Reduce intensity", "Use upper-body light recovery pace"],
    progressions: ["Increase sprint duration", "Increase repeat count", "Use harder work-to-rest ratios"],
    regressions: ["Bike sprint", "Treadmill incline walk", "Rower sprint"],
    cues: ["Push and pull hard", "Pedal with intent", "Stay tall and rhythmic"]
  },
  "treadmill incline walk": {
    category: "Conditioning",
    equipment: ["Treadmill"],
    primaryMuscles: ["Glutes", "Calves", "Conditioning"],
    secondaryMuscles: ["Hamstrings", "Quadriceps", "Core"],
    difficulty: "Beginner",
    jointStress: "low",
    movementPattern: "Incline walking",
    trainingUse: "Low-impact conditioning, glute-focused cardio, and incline endurance work",
    description: "The treadmill incline walk is a lower-impact conditioning option that raises the incline to increase lower-body demand without requiring running.",
    setup: "Set the treadmill to the planned incline and choose a pace you can maintain while staying tall. Keep the hands free or only lightly touching for balance rather than hanging on.",
    execution: "Walk with purposeful steps, push through the full foot, and keep the torso stacked over the hips. Let the incline challenge the glutes and calves while you maintain a steady pace.",
    breathing: "Use steady rhythmic breathing that matches the walking pace.",
    tempo: "Keep a smooth repeatable walking cadence instead of drifting into a shuffle or run.",
    stepSequence: [
      { title: "Start", description: "Set the incline and pace, stand tall, and begin walking with the feet landing under you." },
      { title: "Mid", description: "Settle into a strong walking rhythm with full-foot pressure and minimal handle support." },
      { title: "Peak", description: "Own the middle of the interval with glutes and calves working while posture stays stacked." },
      { title: "Finish", description: "Reduce speed or incline gradually and step off only once the belt is safe and your balance is steady." }
    ],
    commonMistakes: ["Leaning heavily on the handles", "Overstriding uphill", "Letting the trunk fold forward", "Choosing a pace that turns into a sloppy jog"],
    safetyNotes: ["Use the treadmill rails only lightly if needed for balance.", "Step down the pace gradually before ending the interval."],
    modifications: ["Lower the incline", "Shorten the interval", "Use a slower pace"],
    progressions: ["Increase incline", "Increase interval duration", "Use weighted vest walking only if posture stays strong"],
    regressions: ["Flat treadmill walk", "Outdoor incline walk", "Bike recovery pace"],
    cues: ["Walk tall", "Push through the full foot", "Do not hang on the handles"]
  }
};

function getExerciseLibraryContentOverride(name) {
  return EXERCISE_LIBRARY_CONTENT_OVERRIDES[String(name || "").trim().toLowerCase()] || null;
}

function formatGuideCategory(option, movement) {
  if (option.primaryMuscleGroup === "Cardio") return "Conditioning";
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") return "Mobility";
  return option.primaryMuscleGroup || movement?.category || "Training";
}

function inferGuidePrimaryMuscles(option, movement, loweredName) {
  const base = Array.isArray(movement?.primaryMuscles) ? movement.primaryMuscles.filter(Boolean) : [];
  if (loweredName.includes("sled push") || loweredName.includes("rower sprint") || loweredName.includes("jump rope") || loweredName.includes("high knees") || loweredName.includes("burpee") || loweredName.includes("bike sprint") || loweredName.includes("band power step")) {
    return ["Conditioning"];
  }
  if (loweredName.includes("carry") || loweredName.includes("pallof") || loweredName.includes("dead bug") || loweredName.includes("plank shoulder tap")) return ["Core"];
  if (loweredName.includes("hammer curl")) return ["Biceps", "Brachialis"];
  if (loweredName.includes("preacher curl")) return ["Biceps"];
  if (loweredName.includes("reverse curl")) return ["Brachioradialis", "Forearms"];
  if (loweredName.includes("incline dumbbell curl")) return ["Biceps"];
  if (loweredName.includes("rope overhead extension") || loweredName.includes("overhead dumbbell extension") || loweredName.includes("cross-body triceps extension")) return ["Triceps"];
  if (loweredName.includes("bench dip")) return ["Triceps"];
  if (loweredName.includes("close-grip push-up")) return ["Triceps", "Chest"];
  if (loweredName.includes("goblet squat")) return ["Quads", "Glutes"];
  if (loweredName.includes("bodyweight squat")) return ["Quads", "Glutes"];
  if (loweredName.includes("banded squat")) return ["Quads", "Glutes"];
  if (loweredName.includes("front squat")) return ["Quads", "Upper back"];
  if (loweredName.includes("hack squat") || loweredName.includes("leg press")) return ["Quads", "Glutes"];
  if (loweredName.includes("box squat")) return ["Glutes", "Quads"];
  if (loweredName.includes("front-foot elevated squat")) return ["Quads", "Glutes"];
  if (loweredName.includes("romanian deadlift") || loweredName.includes("good morning")) return ["Hamstrings", "Glutes"];
  if (loweredName.includes("conventional deadlift") || loweredName.includes("trap-bar deadlift") || loweredName.includes("kettlebell deadlift")) return ["Glutes", "Hamstrings"];
  if (loweredName.includes("hip hinge reach") || loweredName.includes("band hip hinge")) return ["Hamstrings", "Glutes"];
  if (loweredName.includes("hip thrust") || loweredName.includes("glute bridge") || loweredName.includes("frog pump")) return ["Glutes"];
  if (loweredName.includes("incline") && loweredName.includes("press")) return ["Upper chest", "Front delts"];
  if (loweredName.includes("band chest press")) return ["Chest"];
  if (loweredName.includes("machine chest press") || loweredName.includes("barbell bench press") || loweredName.includes("flat dumbbell bench press") || loweredName.includes("smith machine bench press")) return ["Chest"];
  if (loweredName.includes("floor press")) return ["Chest", "Triceps"];
  if (loweredName.includes("arnold press")) return ["Front delts", "Side delts"];
  if (loweredName.includes("pike push-up")) return ["Shoulders", "Upper chest"];
  if (loweredName.includes("landmine press")) return ["Front delts", "Upper chest"];
  if (loweredName.includes("z-press")) return ["Shoulders", "Core"];
  if (loweredName.includes("lateral raise")) return ["Side delts"];
  if (loweredName.includes("face pull") || loweredName.includes("reverse fly") || loweredName.includes("rear-delt")) return ["Rear delts", "Upper back"];
  if (loweredName.includes("lat pulldown") || loweredName.includes("pull-up") || loweredName.includes("chin-up")) return ["Lats", "Upper back"];
  if (loweredName.includes("back widow")) return ["Upper back", "Lats"];
  if (loweredName.includes("row")) return ["Mid-back", "Lats"];
  if (loweredName.includes("calf raise")) return ["Calves"];
  if (base.length && !base.includes("General")) return base;
  return [option.primaryMuscleGroup || option.muscleGroup || "Primary muscle"];
}

function inferGuideSecondaryMuscles(option, movement, primaryMuscles, loweredName) {
  if (loweredName.includes("sled push") || loweredName.includes("rower sprint") || loweredName.includes("jump rope") || loweredName.includes("high knees") || loweredName.includes("burpee") || loweredName.includes("bike sprint") || loweredName.includes("band power step")) {
    return ["Quads", "Glutes", "Core"];
  }
  if (loweredName.includes("carry")) return ["Obliques", "Grip"];
  if (loweredName.includes("pallof")) return ["Obliques", "Glutes"];
  if (loweredName.includes("plank shoulder tap")) return ["Shoulders", "Glutes"];
  if (loweredName.includes("hammer curl")) return ["Forearms"];
  if (loweredName.includes("preacher curl")) return ["Forearms"];
  if (loweredName.includes("incline dumbbell press") || loweredName.includes("machine chest press") || loweredName.includes("bench press") || loweredName.includes("band chest press")) return ["Triceps", "Front delts"];
  if (loweredName.includes("floor press")) return ["Triceps", "Front delts"];
  if (loweredName.includes("close-grip push-up")) return ["Front delts", "Core"];
  if (loweredName.includes("bench dip") || loweredName.includes("rope overhead extension") || loweredName.includes("overhead dumbbell extension") || loweredName.includes("cross-body triceps extension") || loweredName.includes("skull crusher") || loweredName.includes("band pressdown")) return ["Shoulders"];
  if (loweredName.includes("arnold press")) return ["Triceps", "Upper back"];
  if (loweredName.includes("z-press")) return ["Triceps", "Core"];
  if (loweredName.includes("shoulder press") || loweredName.includes("overhead press") || loweredName.includes("pike push-up")) return ["Triceps", "Upper back"];
  if (loweredName.includes("lat pulldown") || loweredName.includes("band pulldown")) return ["Biceps", "Rear delts"];
  if (loweredName.includes("back widow")) return ["Rear delts", "Triceps"];
  if (loweredName.includes("row")) return ["Biceps", "Rear delts"];
  if (loweredName.includes("front squat")) return ["Glutes", "Core"];
  if (loweredName.includes("hack squat") || loweredName.includes("leg press")) return ["Hamstrings", "Calves"];
  if (loweredName.includes("box squat")) return ["Hamstrings", "Core"];
  if (loweredName.includes("squat")) return ["Core", "Hamstrings"];
  if (loweredName.includes("deadlift") || loweredName.includes("hinge") || loweredName.includes("good morning")) return ["Core", "Back"];
  if (loweredName.includes("lunge") || loweredName.includes("split squat") || loweredName.includes("step-up")) return ["Hamstrings", "Core"];
  if (loweredName.includes("glute bridge") || loweredName.includes("hip thrust")) return ["Hamstrings", "Core"];
  if (loweredName.includes("calf raise")) return ["Feet"];
  if (loweredName.includes("plank") || loweredName.includes("dead bug")) return ["Shoulders", "Glutes"];
  const base = Array.isArray(movement?.secondaryMuscles) ? movement.secondaryMuscles.filter(Boolean) : [];
  return base.length ? base : inferSecondaryMuscles(primaryMuscles[0] || option.primaryMuscleGroup || "", option.movementPattern);
}

function inferGuideDifficulty(option, loweredName) {
  if (loweredName.includes("burpee") || loweredName.includes("man maker") || loweredName.includes("sled push") || loweredName.includes("rower sprint")) return "advanced";
  if (loweredName.includes("landmine press") || loweredName.includes("preacher curl") || loweredName.includes("hack squat") || loweredName.includes("front squat") || loweredName.includes("box squat") || loweredName.includes("rope hammer curl") || loweredName.includes("rope overhead extension")) return "intermediate";
  if (loweredName.includes("deficit push-up") || loweredName.includes("rear-foot elevated split squat") || loweredName.includes("cossack squat") || loweredName.includes("z-press")) return "intermediate";
  if (loweredName.includes("pike push-up") || loweredName.includes("pull-up negative") || loweredName.includes("chin-up") || loweredName.includes("arnold press")) return "intermediate";
  if (loweredName.includes("trap-bar deadlift") || loweredName.includes("conventional deadlift") || loweredName.includes("single-leg romanian deadlift")) return "intermediate";
  if (loweredName.includes("goblet squat") || loweredName.includes("machine chest press") || loweredName.includes("lat pulldown") || loweredName.includes("hammer curl")) return "beginner";
  if (loweredName.includes("band ") || loweredName.includes("bodyweight") || loweredName.includes("glute bridge") || loweredName.includes("cat-cow")) return "beginner";
  return option.difficultyLevel || option.difficulty || "standard";
}

function inferMovementQuality(option, loweredName, jointStress) {
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") return "Mobility and control";
  if (loweredName.includes("carry")) return "Loaded carry";
  if (loweredName.includes("pallof")) return "Anti-rotation core";
  if (loweredName.includes("sled push") || loweredName.includes("rower sprint") || loweredName.includes("jump rope") || loweredName.includes("bike sprint") || loweredName.includes("high knees") || loweredName.includes("burpee") || loweredName.includes("band power step")) return "Conditioning pattern";
  if (loweredName.includes("supported") || loweredName.includes("machine") || loweredName.includes("band ")) return "Stable and accessible";
  if (loweredName.includes("press")) return "Pressing pattern";
  if (loweredName.includes("row") || loweredName.includes("pulldown") || loweredName.includes("pull-up")) return "Pulling pattern";
  if (loweredName.includes("squat")) return "Squat pattern";
  if (loweredName.includes("deadlift") || loweredName.includes("hinge")) return "Hip hinge pattern";
  if (loweredName.includes("lunge") || loweredName.includes("split squat") || loweredName.includes("step-up")) return "Single-leg pattern";
  if (jointStress === "low") return "Lower-stress support work";
  return "Controlled accessory work";
}

function inferMovementQualityDetail(option, loweredName, primaryMuscles, equipment) {
  const setup = equipment.join(", ").toLowerCase() || "your current setup";
  if (loweredName.includes("bodyweight squat")) return "Bodyweight squat pattern for learning depth, balance, and lower-body control.";
  if (loweredName.includes("banded squat")) return "Banded squat that adds tension while keeping the movement simple and upright.";
  if (loweredName.includes("goblet squat")) return "Front-loaded squat that helps you stay tall while training the quads and glutes.";
  if (loweredName.includes("front squat")) return "Front-racked squat that challenges quads, upper back, and trunk stiffness.";
  if (loweredName.includes("hack squat")) return "Machine squat that biases the quads with extra stability from the sled path.";
  if (loweredName.includes("box squat")) return "Box-targeted squat that teaches depth control and a deliberate sit-back pattern.";
  if (loweredName.includes("floor press")) return "Short-range press that keeps the shoulder in a friendlier bottom position.";
  if (loweredName.includes("incline") && loweredName.includes("press")) return "Upper-chest pressing pattern with a slightly higher line of push.";
  if (loweredName.includes("band chest press")) return "Standing band press that trains chest and triceps with rising tension as you extend.";
  if (loweredName.includes("hammer curl")) return "Neutral-grip curl that trains elbow flexion with extra forearm support.";
  if (loweredName.includes("preacher curl")) return "Supported curl that reduces torso swing and keeps tension on the biceps.";
  if (loweredName.includes("arnold press")) return "Rotating overhead press that biases the front and side delts.";
  if (loweredName.includes("pike push-up")) return "Bodyweight overhead press pattern that shifts more load into the shoulders.";
  if (loweredName.includes("landmine press")) return "Arced pressing path that often feels friendlier than a straight overhead press.";
  if (loweredName.includes("z-press")) return "Seated press that forces trunk control because the legs cannot help stabilize.";
  if (loweredName.includes("face pull")) return "Upper-back and rear-delt drill that encourages better shoulder position.";
  if (loweredName.includes("back widow")) return "Floor-based upper-back pull that teaches scapular retraction without hanging equipment.";
  if (loweredName.includes("bench dip")) return "Bodyweight elbow-extension drill using a bench, but with higher shoulder demand than pushdowns.";
  if (loweredName.includes("rope overhead extension") || loweredName.includes("overhead dumbbell extension")) return "Overhead triceps extension that loads the long head while the elbows stay pointed forward.";
  if (loweredName.includes("skull crusher")) return "Lying elbow-extension pattern that isolates the triceps through a strict range.";
  if (loweredName.includes("close-grip push-up")) return "Narrower push-up variation that shifts more work toward the triceps.";
  if (loweredName.includes("conventional deadlift")) return "Floor pull with a longer hip hinge and full-body tension from the start.";
  if (loweredName.includes("trap-bar deadlift")) return "Trap-bar pull that keeps the load centered and usually feels simpler off the floor.";
  if (loweredName.includes("single-leg romanian deadlift")) return "Single-leg hinge that trains posterior chain control and balance at the same time.";
  if (loweredName.includes("step-up")) return "Single-leg squat pattern onto a box or bench with control through the lead leg.";
  if (loweredName.includes("rear-foot elevated split squat")) return "Split-stance squat with more loading on the front leg and more mobility demand.";
  if (loweredName.includes("farmer carry")) return "Bilateral loaded carry that trains bracing, grip, and posture while you walk.";
  if (loweredName.includes("suitcase carry")) return "Single-sided loaded carry that challenges anti-side-bend control while you walk.";
  if (loweredName.includes("pallof press")) return "Anti-rotation press that teaches the trunk to resist twisting under band tension.";
  if (loweredName.includes("sled push")) return "Forward drive conditioning effort that loads the legs without a large eccentric hit.";
  if (loweredName.includes("rower sprint")) return "Short high-output rowing effort driven by legs, trunk timing, and a hard finish.";
  if (loweredName.includes("jump rope")) return "Rhythm-based conditioning drill built around repeated low-amplitude jumps.";
  return `controlled strength exercise you perform with ${setup}`;
}

function buildGuideSnapshot(option, loweredName, primaryMuscles, equipment, movementQualityDetail) {
  const fallbackSequence = buildVisualSequence(option, loweredName, equipment);
  if (loweredName.includes("band chest press")) {
    return {
      summary: "Band chest press is a standing press variation that trains the chest and triceps without needing a bench.",
      setup: "Anchor the band behind you, set one foot forward if needed, and start with the hands just outside the chest.",
      execution: "Press forward until the elbows straighten, keep the ribs stacked, then return under control without letting the band yank you back."
    };
  }
  if (loweredName.includes("bodyweight squat")) {
    return {
      summary: "Bodyweight squat is the unloaded squat pattern used to build position, control, and comfortable depth.",
      setup: "Stand with feet around shoulder width, brace lightly, and let the arms counterbalance in front if needed.",
      execution: "Sit down between the hips, keep pressure through the whole foot, and stand tall without rushing out of the bottom."
    };
  }
  if (loweredName.includes("banded squat")) {
    return {
      summary: "Banded squat adds band resistance to the squat pattern while still teaching clean lower-body mechanics.",
      setup: "Stand on the band or hold it in the chosen setup, brace the trunk, and set the feet so the whole foot stays planted.",
      execution: "Lower with control, keep the knees tracking over the toes, and stand up smoothly against the rising band tension."
    };
  }
  if (loweredName.includes("front-foot elevated squat")) {
    return {
      summary: "Front-foot elevated squat is a split-squat variation that increases knee travel and quad demand on the lead leg.",
      setup: "Place the front foot on a small plate or platform, set a split stance, and keep the torso tall before you descend.",
      execution: "Lower straight down over the lead leg, pause in control, then drive through the elevated front foot to stand back up."
    };
  }
  if (loweredName.includes("goblet squat")) {
    return {
      summary: "Goblet squat is a front-loaded squat that trains the quads and glutes while helping you keep the torso tall.",
      setup: "Hold one dumbbell at chest height, keep the elbows close, and set the feet around shoulder width before the first rep.",
      execution: "Sit down between the hips, keep the whole foot planted, then stand tall without letting the weight drift away from the chest."
    };
  }
  if (loweredName.includes("hammer curl")) {
    return {
      summary: "Hammer curl is a neutral-grip curl that trains the biceps and brachialis with extra forearm involvement.",
      setup: "Stand tall with a dumbbell in each hand, palms facing in, and keep the elbows pinned near the ribs.",
      execution: "Curl without swinging, squeeze the top briefly, then lower slowly until the elbows are straight again."
    };
  }
  if (loweredName.includes("incline dumbbell press")) {
    return {
      summary: "Incline dumbbell press biases the upper chest while still training the front delts and triceps.",
      setup: "Set the bench to a low incline, pull the shoulder blades down and back, and start with the dumbbells stacked over the elbows.",
      execution: "Lower with control until the upper arm reaches the bench line, then press back up on the same upward path without flaring the ribs."
    };
  }
  if (loweredName.includes("arnold press")) {
    return {
      summary: "Arnold press is a rotating dumbbell press that trains the front and side delts through a longer pressing path.",
      setup: "Start seated or standing with the dumbbells in front of the shoulders and palms facing you.",
      execution: "Rotate the palms as you press overhead, finish tall, then lower back down on the same smooth path."
    };
  }
  if (loweredName.includes("pike push-up")) {
    return {
      summary: "Pike push-up is a bodyweight pressing variation that shifts emphasis toward the shoulders.",
      setup: "Start in a pike shape with hips high, hands planted firmly, and the head free to travel between the hands.",
      execution: "Lower the head toward the floor in front of the hands, press back up, and keep the hips high through the rep."
    };
  }
  if (loweredName.includes("floor press")) {
    return {
      summary: "Dumbbell floor press is a chest press variation that limits the bottom range and usually feels friendlier on the shoulders.",
      setup: "Lie on the floor with knees bent, set the shoulders first, and start with the dumbbells stacked over the elbows.",
      execution: "Lower until the upper arms touch the floor softly, then press back up without bouncing from the bottom."
    };
  }
  if (loweredName.includes("overhead dumbbell extension")) {
    return {
      summary: "Overhead dumbbell extension is a triceps exercise that trains elbow extension from an overhead position.",
      setup: "Hold one or two dumbbells overhead, keep the ribs stacked, and point the elbows forward before the first rep.",
      execution: "Bend only at the elbows to lower the weight behind the head, then extend back up without flaring the elbows wide."
    };
  }
  if (loweredName.includes("rope overhead extension")) {
    return {
      summary: "Rope overhead extension is a cable triceps movement that loads the long head through an overhead angle.",
      setup: "Face away from the cable, hold the rope overhead, and set the elbows slightly in front of the head.",
      execution: "Extend the elbows until the arms straighten, keep the upper arms mostly fixed, then return under control."
    };
  }
  if (loweredName.includes("bench dip")) {
    return {
      summary: "Bench dip is a bodyweight triceps movement performed with the hands supported behind you on a bench.",
      setup: "Place the hands on the bench edge, set the feet where you can control the load, and keep the chest open before lowering.",
      execution: "Bend the elbows to lower the body only as far as the shoulders stay comfortable, then press back up without bouncing."
    };
  }
  if (loweredName.includes("close-grip push-up")) {
    return {
      summary: "Close-grip push-up is a narrower push-up variation that increases the triceps demand.",
      setup: "Set the hands closer than a standard push-up, stack the body in one line, and brace before the first rep.",
      execution: "Lower under control with the elbows tracking close to the torso, then press back to a strong plank."
    };
  }
  if (loweredName.includes("band pressdown")) {
    return {
      summary: "Band pressdown is a standing triceps movement that mimics a pushdown without needing a cable machine.",
      setup: "Anchor the band overhead, pin the elbows near the ribs, and start with the forearms bent.",
      execution: "Press the hands down until the elbows straighten, then return only as far as you can keep the upper arms still."
    };
  }
  if (loweredName.includes("band pulldown")) {
    return {
      summary: "Band pulldown is a home-friendly vertical pull that trains the lats and upper back with an overhead anchor.",
      setup: "Anchor the band overhead, sit or kneel tall, and start with the arms long and shoulders set down.",
      execution: "Pull the elbows toward the ribs, pause briefly, then let the band return the arms overhead under control."
    };
  }
  if (loweredName.includes("back widow")) {
    return {
      summary: "Back widow is a floor-based upper-back drill that trains scapular retraction and extension without hanging equipment.",
      setup: "Lie on your back with the elbows bent and tucked near the torso, then dig the elbows into the floor.",
      execution: "Drive through the elbows to lift the chest slightly, squeeze the upper back, then lower back to the floor with control."
    };
  }
  if (loweredName.includes("pull-up negative")) {
    return {
      summary: "Pull-up negative trains the lowering phase of a pull-up so you can build control and strength through the descent.",
      setup: "Start from the top position using a box or jump, set the shoulders, and hold the chin above the bar first.",
      execution: "Lower yourself as slowly as possible to a dead hang without losing shoulder position, then reset for the next rep."
    };
  }
  if (loweredName.includes("step-up")) {
    return {
      summary: "Step-up is a single-leg lower-body exercise that trains the lead leg to drive you onto a box or bench.",
      setup: "Place one foot fully on the box, lean slightly over the lead leg, and keep the torso tall before you drive up.",
      execution: "Push through the lead foot to stand on top, control the descent, and avoid bouncing off the trailing leg."
    };
  }
  if (loweredName.includes("rear-foot elevated split squat")) {
    return {
      summary: "Rear-foot elevated split squat is a Bulgarian split-squat variation that loads the front leg through a long range.",
      setup: "Set the back foot on a bench, position the front foot far enough ahead, and brace before you drop straight down.",
      execution: "Lower under control over the front leg, pause briefly, then drive through the front foot to stand back up."
    };
  }
  if (loweredName.includes("sled push")) {
    return {
      summary: "Sled push is a leg-driven conditioning effort that lets you produce force without the impact of running.",
      setup: "Set both hands on the sled handles, lean forward from the ankles, and keep the trunk braced before you start moving.",
      execution: "Drive the sled with quick powerful steps, keep the body line rigid, and maintain pressure through the whole run."
    };
  }
  if (loweredName.includes("rower sprint")) {
    return {
      summary: "Rower sprint is a short high-output interval on the rowing machine that blends leg drive, trunk timing, and arm finish.",
      setup: "Sit tall, strap in, and begin each stroke from the catch with the shins near vertical and the spine long.",
      execution: "Drive hard with the legs, finish with the hips and arms in sequence, then recover forward smoothly into the next stroke."
    };
  }
  if (loweredName.includes("cable chest fly")) {
    return {
      summary: "Cable chest fly is a chest isolation movement that keeps tension on the pecs through a long sweeping arc.",
      setup: "Set the cable handles just below shoulder height, step into a split stance, and start with a soft bend in the elbows.",
      execution: "Sweep the hands together in front of the chest, squeeze briefly, then open back up under control without losing shoulder position."
    };
  }
  if (loweredName.includes("cable pull-through")) {
    return {
      summary: "Cable pull-through is a hip hinge that trains the glutes and hamstrings with cable tension pulling from behind.",
      setup: "Stand facing away from the cable, hold the rope between the legs, and step far enough forward to keep tension at the start.",
      execution: "Hinge back into the hips, keep the rope close to the body, then drive the hips through to stand tall without leaning back."
    };
  }
  if (loweredName.includes("chin-up")) {
    return {
      summary: "Chin-up is a bodyweight vertical pull using a supinated grip to train the lats, biceps, and upper back.",
      setup: "Take an underhand grip on the bar, start from a long-arm hang, and set the shoulders down before you pull.",
      execution: "Pull the chest toward the bar, pause briefly near the top, then lower back to a controlled hang without dropping."
    };
  }
  if (loweredName.includes("triceps pushdown")) {
    return {
      summary: "Triceps pushdown is a cable isolation movement that trains elbow extension without needing the shoulders to move much.",
      setup: "Stand tall at the cable, pin the elbows near the ribs, and start with the forearms bent under the handle.",
      execution: "Press the handle down until the elbows straighten, squeeze briefly, then return under control without letting the elbows drift."
    };
  }
  if (loweredName.includes("cross-body triceps extension")) {
    return {
      summary: "Cross-body triceps extension is a single-arm triceps movement that lets you finish across the body under constant tension.",
      setup: "Set the handle for a single arm, brace the trunk, and start with the elbow tucked near the side of the body.",
      execution: "Extend the elbow across the body without twisting the torso, then return slowly until the forearm bends again."
    };
  }
  if (loweredName.includes("skull crusher")) {
    return {
      summary: "Skull crusher is a lying triceps exercise that keeps the upper arm fairly still while the elbows flex and extend.",
      setup: "Lie back with the weight stacked over the shoulders, lock the upper arms in place, and brace before lowering.",
      execution: "Bend at the elbows to lower the weight toward the forehead or behind the head, then extend back up without letting the shoulders roll forward."
    };
  }
  if (loweredName.includes("reverse fly") || loweredName.includes("rear-delt cable fly")) {
    return {
      summary: `${option.name} trains the rear delts and upper back by opening the arms out wide under control.`,
      setup: "Set the torso so the shoulders can stay packed, hold the handles or weights with a soft elbow bend, and start with the arms in front of you.",
      execution: "Open the arms out and slightly back without shrugging, pause briefly, then return along the same path under control."
    };
  }
  if (loweredName.includes("reverse snow angel")) {
    return {
      summary: "Reverse snow angel is a floor-based shoulder and upper-back drill that teaches arm motion while the trunk stays quiet.",
      setup: "Lie face down with the ribs lightly braced, forehead supported if needed, and arms long beside the hips.",
      execution: "Sweep the arms overhead in a wide arc without shrugging, then return to the start while keeping the torso still."
    };
  }
  if (loweredName.includes("frog pump")) {
    return {
      summary: "Frog pump is a glute bridge variation with the soles of the feet together to bias the glutes through a short range.",
      setup: "Lie on your back, bring the soles of the feet together, and set the ribs down before the first rep.",
      execution: "Drive the hips up by squeezing the glutes, pause at the top, then lower slowly without letting the low back take over."
    };
  }
  return {
    summary: buildGuideSummary(option, loweredName, primaryMuscles, movementQualityDetail),
    setup: buildGuideSetup(option, loweredName, equipment, fallbackSequence),
    execution: buildGuideExecution(option, loweredName, movementQualityDetail, fallbackSequence)
  };
}

function buildVisualSequence(option, loweredName, equipment) {
  const equipmentCue = equipment[0] ? equipment[0].toLowerCase() : "your setup";

  if (loweredName.includes("goblet squat")) {
    return [
      { title: "Setup", description: "Hold one dumbbell tight to the chest, brace the trunk, and plant the whole foot before you move." },
      { title: "Descent", description: "Sit down between the hips while the knees track over the toes and the elbows stay inside the knees." },
      { title: "Bottom", description: "Stop at the deepest position where the chest stays tall and the heels stay flat." },
      { title: "Stand", description: "Drive through the floor and stand tall without letting the dumbbell pull you forward." }
    ];
  }

  if (loweredName.includes("bodyweight squat")) {
    return [
      { title: "Setup", description: "Set the feet around shoulder width, brace lightly, and balance across the whole foot." },
      { title: "Descent", description: "Sit down between the hips while the knees track over the toes and the chest stays proud." },
      { title: "Bottom", description: "Pause at the cleanest depth you can keep without the heels lifting or the torso folding." },
      { title: "Stand", description: "Push through mid-foot and stand tall without snapping out of the bottom." }
    ];
  }

  if (loweredName.includes("banded squat")) {
    return [
      { title: "Setup", description: "Set the band and feet first, then brace so the tension is already present before you descend." },
      { title: "Descent", description: "Lower with control and keep the knees tracking cleanly as the band tension changes." },
      { title: "Bottom", description: "Pause briefly where you can still keep even foot pressure and a tall torso." },
      { title: "Stand", description: "Stand up smoothly against the band without letting it yank you out of position." }
    ];
  }

  if (loweredName.includes("front-foot elevated squat")) {
    return [
      { title: "Setup", description: "Elevate the front foot, set a split stance, and get your weight centered over the lead leg." },
      { title: "Lower", description: "Drop straight down and let the front knee travel forward while the heel stays planted." },
      { title: "Bottom", description: "Pause in the deepest clean position you can keep over the front foot." },
      { title: "Stand", description: "Drive through the front foot and stand without pushing off the back leg." }
    ];
  }

  if (loweredName.includes("hammer curl")) {
    return [
      { title: "Start", description: "Stand tall with the dumbbells by your sides and palms facing each other." },
      { title: "Curl", description: "Bend the elbows and bring the weights up without leaning back or rolling the shoulders forward." },
      { title: "Peak", description: "Squeeze briefly near the top while the elbows stay close to the ribs." },
      { title: "Lower", description: "Lower slowly to full elbow extension so the next rep starts from a dead stop." }
    ];
  }

  if (loweredName.includes("incline dumbbell press")) {
    return [
      { title: "Setup", description: "Set the bench on a low incline, stack the wrists over the elbows, and keep the shoulder blades set down and back." },
      { title: "Lower", description: "Lower the dumbbells on a slight upward chest line until the upper arms reach a controlled bottom position." },
      { title: "Drive", description: "Press up and slightly in while the ribcage stays quiet and the shoulders do not shrug." },
      { title: "Finish", description: "Finish over the upper chest without crashing the dumbbells together, then reset for the next rep." }
    ];
  }

  if (loweredName.includes("band chest press")) {
    return [
      { title: "Setup", description: "Anchor the band behind you, set the stance, and start with the hands just outside the chest." },
      { title: "Press", description: "Drive the hands forward until the elbows straighten without letting the ribs flare." },
      { title: "Peak", description: "Reach fully into the press and squeeze the chest while the shoulders stay down." },
      { title: "Return", description: "Let the band pull you back slowly until the hands return near the chest." }
    ];
  }

  if (loweredName.includes("arnold press")) {
    return [
      { title: "Setup", description: "Start with the dumbbells at shoulder height, palms facing you, and the ribs stacked over the hips." },
      { title: "Rotate", description: "Rotate the palms out as the elbows begin to press upward." },
      { title: "Peak", description: "Finish overhead with the arms strong and the shoulders active, not shrugged." },
      { title: "Return", description: "Lower on the same rotating path until you return to the front-racked start." }
    ];
  }

  if (loweredName.includes("pike push-up")) {
    return [
      { title: "Setup", description: "Create a pike shape with hips high, hands rooted, and the head free to travel between the arms." },
      { title: "Lower", description: "Bend the elbows and lower the head toward the floor in front of the hands." },
      { title: "Peak", description: "Pause briefly near the bottom while the shoulders stay active and the elbows track well." },
      { title: "Press", description: "Push the floor away to return to the high-hip start position." }
    ];
  }

  if (loweredName.includes("floor press")) {
    return [
      { title: "Setup", description: "Lie on the floor with knees bent, shoulders set, and the dumbbells stacked over the elbows." },
      { title: "Lower", description: "Lower slowly until the triceps touch the floor softly and the forearms stay close to vertical." },
      { title: "Drive", description: "Press back up from the dead stop without bouncing the elbows off the floor." },
      { title: "Finish", description: "Finish with straight wrists and quiet ribs so every rep starts from the same stable position." }
    ];
  }

  if (loweredName.includes("overhead dumbbell extension") || loweredName.includes("rope overhead extension")) {
    return [
      { title: "Setup", description: "Lock the upper arms in place overhead and brace so the ribs stay stacked." },
      { title: "Lower", description: "Bend at the elbows only and lower the load behind the head under control." },
      { title: "Peak", description: "Stop at the deepest range where the elbows stay pointed forward and the shoulders stay quiet." },
      { title: "Extend", description: "Straighten the elbows back to the top without letting them flare wide." }
    ];
  }

  if (loweredName.includes("bench dip")) {
    return [
      { title: "Setup", description: "Set the hands on the bench edge, position the feet, and lift the chest before you lower." },
      { title: "Lower", description: "Bend the elbows and lower only until the shoulders still feel controlled." },
      { title: "Bottom", description: "Pause briefly without collapsing into the front of the shoulders." },
      { title: "Press", description: "Press back up by straightening the elbows without bouncing out of the bottom." }
    ];
  }

  if (loweredName.includes("close-grip push-up")) {
    return [
      { title: "Setup", description: "Set the hands closer than shoulder width and lock the body into a straight plank." },
      { title: "Lower", description: "Lower with the elbows tracking close to the torso and the chest moving between the hands." },
      { title: "Bottom", description: "Pause just above the floor without letting the hips sag or shoulders dump forward." },
      { title: "Press", description: "Push back to plank and finish with the body moving as one piece." }
    ];
  }

  if (loweredName.includes("band pressdown")) {
    return [
      { title: "Setup", description: "Anchor the band overhead and pin the elbows close to the ribs before you press." },
      { title: "Press", description: "Extend the elbows until the arms are straight without rocking the torso." },
      { title: "Peak", description: "Pause at lockout with the shoulders quiet and the elbows still pinned." },
      { title: "Return", description: "Return slowly until the forearms bend but the upper arms stay in place." }
    ];
  }

  if (loweredName.includes("band pulldown")) {
    return [
      { title: "Setup", description: "Anchor the band overhead, sit or kneel tall, and start with long arms and packed shoulders." },
      { title: "Pull", description: "Drive the elbows down toward the ribs instead of yanking with the hands." },
      { title: "Peak", description: "Pause briefly with the lats squeezed and the chest still tall." },
      { title: "Return", description: "Let the band return overhead with control before the next rep." }
    ];
  }

  if (loweredName.includes("back widow")) {
    return [
      { title: "Setup", description: "Lie on your back, plant the elbows, and set the upper back before you press into the floor." },
      { title: "Drive", description: "Push through the elbows to lift the chest and shoulder blades off the floor slightly." },
      { title: "Peak", description: "Hold the top briefly while the neck stays long and the shoulders do not shrug." },
      { title: "Return", description: "Lower back down slowly and reset the elbows before repeating." }
    ];
  }

  if (loweredName.includes("pull-up negative")) {
    return [
      { title: "Setup", description: "Start from the top of the pull-up using a step or jump and set the shoulders before descending." },
      { title: "Lower", description: "Lower as slowly as possible while keeping the chest lifted and elbows under control." },
      { title: "Peak", description: "Own the hardest midpoint without dropping suddenly through the sticking point." },
      { title: "Finish", description: "Reach a dead hang cleanly, then step back up to repeat instead of jumping from the bottom." }
    ];
  }

  if (loweredName.includes("step-up")) {
    return [
      { title: "Setup", description: "Place the whole lead foot on the box, brace lightly, and lean slightly over the lead leg." },
      { title: "Drive", description: "Push through the lead foot to stand up without launching off the trailing leg." },
      { title: "Peak", description: "Finish tall on top with balance fully controlled before coming back down." },
      { title: "Lower", description: "Step down under control and reset the lead foot before the next rep." }
    ];
  }

  if (loweredName.includes("rear-foot elevated split squat")) {
    return [
      { title: "Setup", description: "Set the back foot on the bench, front foot forward, and brace before you descend." },
      { title: "Lower", description: "Drop straight down over the front leg while keeping most of the pressure through the lead foot." },
      { title: "Bottom", description: "Pause at the deepest range you can keep without losing front-leg control." },
      { title: "Stand", description: "Drive through the front foot and return to the top without bouncing." }
    ];
  }

  if (loweredName.includes("carry")) {
    return [
      { title: "Setup", description: "Pick the load up cleanly, brace the trunk, and stand tall before you start walking." },
      { title: "Walk", description: "Take short deliberate steps and keep the shoulders level instead of swaying." },
      { title: "Hold", description: "Maintain grip, posture, and trunk tension through the middle of the carry." },
      { title: "Reset", description: "Set the load down with control and re-brace before the next run." }
    ];
  }

  if (loweredName.includes("pallof")) {
    return [
      { title: "Setup", description: "Anchor the band to the side, hold it at the chest, and set your stance before pressing." },
      { title: "Press", description: "Press the hands straight out without letting the trunk rotate toward the anchor." },
      { title: "Peak", description: "Pause with the arms extended and the ribs stacked over the hips." },
      { title: "Return", description: "Bring the hands back to the chest slowly while keeping the torso square." }
    ];
  }

  if (loweredName.includes("sled push")) {
    return [
      { title: "Setup", description: "Lean into the sled handles, brace the trunk, and create body tension before the first step." },
      { title: "Drive", description: "Push with powerful alternating steps and keep pressure through the whole foot." },
      { title: "Peak", description: "Hold the body angle steady as the sled reaches full speed instead of standing upright." },
      { title: "Finish", description: "Run it through the line, slow the sled under control, and reset before the next push." }
    ];
  }

  if (loweredName.includes("rower sprint")) {
    return [
      { title: "Catch", description: "Start from the catch with the shins near vertical, chest tall, and arms long." },
      { title: "Drive", description: "Push hard through the legs first, then open the hips before finishing with the arms." },
      { title: "Finish", description: "Pause briefly in the finish with the handle at the lower ribs and the trunk tall." },
      { title: "Recover", description: "Send the hands away, hinge forward, and slide back to the catch smoothly." }
    ];
  }

  if (loweredName.includes("band power step")) {
    return [
      { title: "Setup", description: "Set the band tension first, stand tall, and load the stance leg before you move." },
      { title: "Drive", description: "Step explosively in the intended direction while the trunk stays braced and the band stays under control." },
      { title: "Peak", description: "Own the landing on the outside leg instead of letting the band whip you into position." },
      { title: "Reset", description: "Step back to the start under control and re-brace before the next rep." }
    ];
  }

  if (loweredName.includes("bear crawl drag")) {
    return [
      { title: "Setup", description: "Set up in a hovering tabletop beside the load with the knees just off the floor and the hips level." },
      { title: "Drag", description: "Reach across with one arm and drag the load through without twisting the torso." },
      { title: "Hold", description: "Pause once the load clears your body while the trunk stays quiet and the knees hover." },
      { title: "Reset", description: "Set the hand back down, rebuild your base, and switch sides without letting the hips sway." }
    ];
  }

  if (loweredName.includes("bike sprint")) {
    return [
      { title: "Setup", description: "Set the seat and resistance, stay tall through the trunk, and bring the pedals under tension before the sprint starts." },
      { title: "Drive", description: "Accelerate hard through the pedals while the upper body stays quiet and connected to the handlebars." },
      { title: "Peak", description: "Hold the highest clean cadence you can sustain without bouncing in the saddle." },
      { title: "Reset", description: "Ease the speed down gradually and recover the breathing before the next interval." }
    ];
  }

  if (loweredName.includes("burpee")) {
    return [
      { title: "Start", description: "Stand tall, brace, and drop the hands toward the floor without letting the chest collapse." },
      { title: "Floor", description: "Kick or step back into a clean plank, hit the bottom under control, and bring the feet back in quickly." },
      { title: "Rise", description: "Drive back to standing with balance first so the chest is up before the jump or reach." },
      { title: "Finish", description: "Land softly, reset your stance, and keep the next rep athletic instead of frantic." }
    ];
  }

  if (loweredName.includes("cable chest fly")) {
    return [
      { title: "Setup", description: "Set the cable handles just below shoulder height, brace, and start with the arms opened slightly in front of the body." },
      { title: "Sweep", description: "Bring the hands together on a wide hugging path without straightening the elbows hard." },
      { title: "Peak", description: "Squeeze the chest briefly in front of the sternum while the shoulders stay down." },
      { title: "Return", description: "Open the arms back up slowly until the chest feels stretched but the shoulders still stay organized." }
    ];
  }

  if (loweredName.includes("cable pull-through")) {
    return [
      { title: "Setup", description: "Face away from the cable, step forward to create tension, and hinge back with the rope close to the hips." },
      { title: "Load", description: "Let the hips travel back until the glutes and hamstrings are loaded and the spine stays long." },
      { title: "Drive", description: "Push the floor away and bring the hips through until you stand tall with the glutes squeezed." },
      { title: "Reset", description: "Guide the rope back between the legs under control and rebuild the hinge before the next rep." }
    ];
  }

  if (loweredName.includes("chin-up")) {
    return [
      { title: "Setup", description: "Take an underhand grip, start from a long-arm hang, and pack the shoulders before you pull." },
      { title: "Pull", description: "Drive the elbows down and pull the chest toward the bar without kicking through the hips." },
      { title: "Peak", description: "Pause near the top with the chin over the bar and the shoulders still down away from the ears." },
      { title: "Return", description: "Lower all the way back to a hang under control instead of dropping through the bottom." }
    ];
  }

  if (loweredName.includes("cross-body triceps extension")) {
    return [
      { title: "Setup", description: "Set the handle for one arm, tuck the elbow near the side, and square the trunk before you start." },
      { title: "Extend", description: "Straighten the elbow across the body without letting the shoulder roll or the torso twist." },
      { title: "Peak", description: "Squeeze briefly at full extension while the upper arm stays mostly still." },
      { title: "Return", description: "Return slowly until the elbow bends again and reset before the next rep." }
    ];
  }

  if (loweredName.includes("dead bug")) {
    return [
      { title: "Start", description: "Lie flat with the ribs down, knees over hips, and arms reaching so the trunk stays locked in." },
      { title: "Reach", description: "Extend the opposite arm and leg away slowly without letting the low back arch off the floor." },
      { title: "Hold", description: "Pause in the longest range you can keep while the trunk stays quiet and the breath stays controlled." },
      { title: "Return", description: "Bring the limbs back to the start and switch sides without rushing the reset." }
    ];
  }

  if (loweredName.includes("frog pump")) {
    return [
      { title: "Setup", description: "Bring the soles of the feet together, let the knees open, and brace the ribs down before you lift." },
      { title: "Drive", description: "Push the hips upward by squeezing the glutes instead of arching the lower back." },
      { title: "Peak", description: "Pause at the top with the hips long and the glutes fully engaged." },
      { title: "Lower", description: "Lower slowly until the hips touch down lightly and reset before the next rep." }
    ];
  }

  if (loweredName.includes("high knees")) {
    return [
      { title: "Setup", description: "Stand tall, set the arms for sprint rhythm, and prepare to strike the ground under the hips." },
      { title: "Drive", description: "Alternate the knees up quickly while the arms move with the same fast rhythm." },
      { title: "Peak", description: "Own the tallest clean posture you can keep as the pace climbs." },
      { title: "Reset", description: "Slow the feet down under control instead of stopping abruptly when the interval ends." }
    ];
  }

  if (loweredName.includes("jump rope")) {
    return [
      { title: "Setup", description: "Stand tall with the handles at your sides, elbows relaxed, and enough rope clearance for short quick jumps." },
      { title: "Turn", description: "Spin the rope from the wrists while you hop low off the floor with even timing." },
      { title: "Peak", description: "Keep the rhythm smooth and the contacts light as the rope speed builds." },
      { title: "Reset", description: "Land softly and re-find the rope rhythm before the next cycle if you miss a turn." }
    ];
  }

  if (loweredName.includes("man maker")) {
    return [
      { title: "Start", description: "Set the dumbbells on the floor at shoulder width, lock in a plank, and brace before the first row." },
      { title: "Floor", description: "Control the row and push-up phase without letting the hips twist or sag." },
      { title: "Stand", description: "Bring the feet in, clean the dumbbells up, and stand tall before the press or finish." },
      { title: "Finish", description: "Complete the rep under control, lower the dumbbells back to the floor cleanly, and reset your plank." }
    ];
  }

  if (loweredName.includes("mountain climber")) {
    return [
      { title: "Setup", description: "Build a strong plank with hands under shoulders, ribs stacked, and feet ready to alternate fast." },
      { title: "Drive", description: "Pull one knee under the torso while the opposite leg reaches back, then switch quickly." },
      { title: "Peak", description: "Hold the shoulders and hips steady even as the foot speed climbs." },
      { title: "Reset", description: "Slow the pace down with control and keep the plank organized between intervals." }
    ];
  }

  if (loweredName.includes("plank shoulder tap")) {
    return [
      { title: "Setup", description: "Set a wide-enough plank for balance, brace the trunk, and push the floor away before lifting a hand." },
      { title: "Tap", description: "Lift one hand to the opposite shoulder without letting the hips twist or the feet shuffle." },
      { title: "Peak", description: "Pause briefly with the hand off the floor while the trunk stays square." },
      { title: "Return", description: "Place the hand back down softly, re-center, and switch sides under control." }
    ];
  }

  if (loweredName.includes("rear-delt cable fly") || loweredName.includes("reverse fly")) {
    return [
      { title: "Setup", description: "Set the torso and shoulders first, then hold the handles or weights with a soft bend in the elbows." },
      { title: "Open", description: "Sweep the arms out wide without shrugging or letting the chest pop up." },
      { title: "Peak", description: "Pause when the rear delts and upper back are fully squeezed and the neck stays relaxed." },
      { title: "Return", description: "Bring the arms back in slowly on the same arc until the next rep can start cleanly." }
    ];
  }

  if (loweredName.includes("reverse snow angel")) {
    return [
      { title: "Setup", description: "Lie face down with the trunk braced and arms long beside the hips before you start the sweep." },
      { title: "Reach", description: "Lift the arms slightly and sweep them overhead in a wide arc without shrugging." },
      { title: "Peak", description: "Pause at the longest overhead position you can keep while the ribs stay quiet." },
      { title: "Return", description: "Sweep the arms back to the hips under control and reset before the next rep." }
    ];
  }

  if (loweredName.includes("skull crusher")) {
    return [
      { title: "Setup", description: "Lie back with the load stacked over the shoulders, brace, and keep the upper arms still." },
      { title: "Lower", description: "Bend the elbows to lower the weight toward the forehead or just behind the head under control." },
      { title: "Peak", description: "Stop at the deepest range where the elbows stay pointed up and the shoulders stay quiet." },
      { title: "Extend", description: "Straighten the elbows back to the top without drifting the upper arms forward." }
    ];
  }

  if (loweredName.includes("triceps pushdown")) {
    return [
      { title: "Setup", description: "Stand tall at the cable, pin the elbows by the ribs, and start with the forearms bent." },
      { title: "Press", description: "Drive the handle down until the elbows straighten without leaning over the stack." },
      { title: "Peak", description: "Pause at lockout while the shoulders stay quiet and the triceps stay loaded." },
      { title: "Return", description: "Let the handle come back up slowly until the forearms bend again without the elbows drifting." }
    ];
  }

  if (loweredName.includes("curl")) {
    return [
      { title: "Start", description: `Stand tall with the ${equipmentCue} hanging by your sides and the elbows close to the ribs.` },
      { title: "Curl", description: "Bend the elbows without swinging the torso or letting the shoulders roll forward." },
      { title: "Peak", description: "Squeeze the top briefly while the upper arm stays mostly quiet." },
      { title: "Lower", description: "Lower slowly to a full stretch so the next rep starts under control." }
    ];
  }

  if (loweredName.includes("squat")) {
    return [
      { title: "Setup", description: `Set the feet, brace the trunk, and hold the ${equipmentCue} where the torso can stay tall.` },
      { title: "Descent", description: "Sit down between the hips while the knees track over the toes and the whole foot stays planted." },
      { title: "Bottom", description: "Pause at the deepest clean position you can keep without the chest folding or heels lifting." },
      { title: "Stand", description: "Drive through the floor and stand tall without letting the load pull you forward." }
    ];
  }

  if (loweredName.includes("deadlift") || loweredName.includes("hinge") || loweredName.includes("good morning")) {
    return [
      { title: "Setup", description: "Brace first, keep the weight close, and hinge back with a long spine." },
      { title: "Load", description: "Feel tension in the hips and hamstrings before you reverse the rep." },
      { title: "Drive", description: "Stand by pushing the floor away and bringing the hips through without leaning back." },
      { title: "Reset", description: "Return by hinging back again so every rep starts from the same controlled shape." }
    ];
  }

  if (loweredName.includes("lunge") || loweredName.includes("split squat") || loweredName.includes("step-up")) {
    return [
      { title: "Setup", description: "Build a stance that gives the hips and knees room to bend without wobbling." },
      { title: "Lower", description: "Descend with most of the pressure through the lead foot and keep the torso steady." },
      { title: "Bottom", description: "Stop before the front knee caves or the pelvis tips out of position." },
      { title: "Drive", description: "Push through the lead leg to stand or step through without bouncing." }
    ];
  }

  if (loweredName.includes("press") || loweredName.includes("push-up")) {
    return [
      { title: "Setup", description: "Set the shoulders and wrists so the press starts from a stacked, controlled position." },
      { title: "Lower", description: "Lower under control until the chest, elbows, or upper arm reach the intended bottom range." },
      { title: "Drive", description: "Press smoothly while keeping the ribcage and shoulders organized." },
      { title: "Finish", description: "Lock out only as far as you can stay tall and ready for the next rep." }
    ];
  }

  if (loweredName.includes("row") || loweredName.includes("pulldown") || loweredName.includes("pull-up")) {
    return [
      { title: "Setup", description: "Set the torso and shoulders before the first pull so the line of force stays clean." },
      { title: "Pull", description: "Drive the elbows toward the hip or ribcage instead of yanking with the hands." },
      { title: "Peak", description: "Pause briefly when the shoulder blade has fully moved and the neck stays relaxed." },
      { title: "Return", description: "Lower with control and keep the same torso position into the next rep." }
    ];
  }

  if (loweredName.includes("raise") || loweredName.includes("pull-apart") || loweredName.includes("face pull")) {
    return [
      { title: "Setup", description: "Stand tall, keep the ribs quiet, and begin from a light but controlled start position." },
      { title: "Lift", description: "Move the arms through the target arc without turning the rep into a shrug." },
      { title: "Peak", description: "Own the top range briefly while the neck stays relaxed." },
      { title: "Lower", description: "Lower slowly so tension stays on the target muscles instead of momentum." }
    ];
  }

  if (loweredName.includes("bridge") || loweredName.includes("thrust")) {
    return [
      { title: "Setup", description: "Plant the feet, brace lightly, and set the ribs before you lift." },
      { title: "Drive", description: "Push through the heels and lift the hips until the glutes do the work." },
      { title: "Peak", description: "Pause at the top without turning the lockout into a low-back arch." },
      { title: "Lower", description: "Lower slowly and reset so the hips do not just drop between reps." }
    ];
  }

  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return [
      { title: "Set up", description: "Start in a comfortable position that lets you breathe and move without forcing range." },
      { title: "Move", description: "Ease into the main reach or rotation smoothly instead of chasing end range." },
      { title: "Open", description: "Pause briefly where you feel the target area working or opening up cleanly." },
      { title: "Return", description: "Come back slowly and repeat only through ranges you can control." }
    ];
  }

  return [
    { title: "Setup", description: "Build a stable start position before the first rep." },
    { title: "Move", description: "Run the main part of the rep with control and steady breathing." },
    { title: "Peak", description: "Own the hardest part of the movement instead of rushing past it." },
    { title: "Reset", description: "Return cleanly so the next rep starts from the same position." }
  ];
}

function withIndefiniteArticle(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "a";
  }
  return /^[aeiou]/i.test(text) ? `an ${text}` : `a ${text}`;
}

function buildGuideSummary(option, loweredName, primaryMuscles, movementQualityDetail) {
  const muscleLine = primaryMuscles.length ? primaryMuscles.join(", ").toLowerCase() : "the target muscles";
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return `${option.name} is a controlled mobility drill used to open up ${muscleLine} without forcing range.`;
  }
  if (loweredName.includes("carry")) {
    return `${option.name} is a loaded carry that trains ${muscleLine} while you hold posture and walk under control.`;
  }
  if (loweredName.includes("sled push") || loweredName.includes("rower sprint") || loweredName.includes("jump rope") || loweredName.includes("bike sprint") || loweredName.includes("high knees") || loweredName.includes("burpee")) {
    return `${option.name} is a conditioning movement that challenges ${muscleLine} while you keep position and pace together.`;
  }
  return `${option.name} is ${withIndefiniteArticle(String(movementQualityDetail || option.movementPattern || "training pattern").toLowerCase())} used to train ${muscleLine}.`;
}

function buildGuideSetup(option, loweredName, equipment, fallbackSequence = []) {
  const firstStep = fallbackSequence[0]?.description;
  const equipmentCue = equipment[0] ? equipment[0].toLowerCase() : "your setup";
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return firstStep || "Set up in a comfortable position that lets you move and breathe without chasing end range.";
  }
  if (loweredName.includes("assisted pull-up")) {
    return "Set the assistance pad or band first, grip the handles, and start from a long-arm hang with the shoulders packed down.";
  }
  if (loweredName.includes("back squat")) {
    return "Set the bar on the upper back, take a stable stance, brace, and unlock the knees before you descend.";
  }
  if (loweredName.includes("box squat")) {
    return "Set the box height first, place the bar on the upper back, and stance the feet so you can sit back under control.";
  }
  if (loweredName.includes("front squat")) {
    return "Rack the bar across the front shoulders, lift the elbows, and set the feet so the torso can stay tall.";
  }
  if (loweredName.includes("hack squat")) {
    return "Set your feet on the sled where you can keep full-foot pressure, brace into the pad, and unlock the carriage before lowering.";
  }
  if (loweredName.includes("leg press")) {
    return "Sit into the seat, place the feet on the platform at a controllable width, and brace before you unlock the sled.";
  }
  if (loweredName.includes("good morning")) {
    return "Set the load across the upper back, unlock the knees softly, and brace before you hinge from the hips.";
  }
  if (loweredName.includes("deadlift") || loweredName.includes("hinge")) {
    return `Set the ${equipmentCue} close to the body, brace the trunk, and hinge back until the hamstrings load before you pull.`;
  }
  if (loweredName.includes("bridge") || loweredName.includes("thrust")) {
    return "Plant the feet, set the ribs down, and position the load over the hips before you begin the first rep.";
  }
  if (loweredName.includes("lunge") || loweredName.includes("split squat")) {
    return "Build a split stance that lets both knees bend under control, stack the torso, and brace before you descend.";
  }
  if (loweredName.includes("carry")) {
    return `Pick up the ${equipmentCue} cleanly, stand tall, and lock in your brace before the first step.`;
  }
  if (loweredName.includes("jump rope")) {
    return "Hold the handles lightly at your sides, stay tall through the trunk, and start with short relaxed jumps.";
  }
  if (loweredName.includes("bike sprint")) {
    return "Set the seat and resistance, brace through the hands and trunk, and start pedaling from a strong seated position.";
  }
  if (loweredName.includes("mountain climber")) {
    return "Set a strong plank with hands under shoulders, ribs stacked, and feet ready to alternate quickly.";
  }
  if (loweredName.includes("high knees")) {
    return "Stand tall, set the arms for sprint rhythm, and prepare to strike the floor quickly under the hips.";
  }
  if (loweredName.includes("burpee")) {
    return "Start standing with enough space to drop to the floor, brace the trunk, and keep the feet under the hips before the first rep.";
  }
  if (loweredName.includes("man maker")) {
    return "Place the dumbbells on the floor at shoulder width, set a strong plank, and prepare to move from the floor to standing in one sequence.";
  }
  if (loweredName.includes("bear crawl drag")) {
    return "Set up in a hovering tabletop beside the load, keep the knees just off the floor, and brace before each drag.";
  }
  if (loweredName.includes("pull-up") || loweredName.includes("chin-up")) {
    return "Grip the bar first, start from a long-arm hang, and set the shoulders down before initiating the pull.";
  }
  if (loweredName.includes("row") || loweredName.includes("pulldown")) {
    return firstStep || `Set the torso and shoulders first so the ${equipmentCue} moves on a clean pulling path.`;
  }
  if (loweredName.includes("press") || loweredName.includes("push-up")) {
    return firstStep || `Set the shoulders, wrists, and trunk so the ${equipmentCue} starts from a stacked pressing position.`;
  }
  if (loweredName.includes("curl")) {
    return firstStep || `Stand tall with the ${equipmentCue} at your sides and keep the elbows close to the ribs before the first rep.`;
  }
  if (loweredName.includes("raise") || loweredName.includes("fly") || loweredName.includes("pull-apart") || loweredName.includes("face pull")) {
    return firstStep || `Start with the ${equipmentCue} in a light controlled position and keep the ribs quiet before lifting.`;
  }
  if (loweredName.includes("plank")) {
    return "Stack the shoulders over the hands or elbows, brace the trunk, and set a straight line from shoulders to heels.";
  }
  if (loweredName.includes("dead bug")) {
    return "Lie on your back with ribs down, hips and knees bent, and arms reaching so the trunk stays flat to the floor.";
  }
  return firstStep || `Set up with ${equipmentCue}, brace, and build a repeatable start position before the first rep.`;
}

function buildGuideExecution(option, loweredName, movementQualityDetail, fallbackSequence = []) {
  const secondStep = fallbackSequence[1]?.description || "";
  const thirdStep = fallbackSequence[2]?.description || "";
  const fourthStep = fallbackSequence[3]?.description || "";
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return `${secondStep} ${thirdStep} ${fourthStep}`.trim();
  }
  if (loweredName.includes("assisted pull-up")) {
    return "Pull the elbows down toward the ribs, pause with the chest lifted, then lower back to a full hang without losing shoulder position.";
  }
  if (loweredName.includes("back squat") || loweredName.includes("box squat") || loweredName.includes("front squat") || loweredName.includes("hack squat") || loweredName.includes("leg press")) {
    return "Lower with control, keep pressure through the whole foot, and stand back up without letting the torso or knees lose position.";
  }
  if (loweredName.includes("deadlift") || loweredName.includes("hinge") || loweredName.includes("good morning")) {
    return "Hinge until the hips and hamstrings are loaded, then drive through the floor and bring the hips through without leaning back at lockout.";
  }
  if (loweredName.includes("bridge") || loweredName.includes("thrust")) {
    return "Drive through the heels to lift the hips, squeeze the glutes at the top, and lower under control without arching the low back.";
  }
  if (loweredName.includes("lunge") || loweredName.includes("split squat") || loweredName.includes("step-up")) {
    return "Lower under control over the lead leg, keep the torso steady, and drive back up through the front foot instead of bouncing.";
  }
  if (loweredName.includes("carry")) {
    return "Walk with short controlled steps, keep the ribs stacked over the hips, and hold posture all the way to the finish.";
  }
  if (loweredName.includes("jump rope")) {
    return "Turn the rope from the wrists, keep the jumps low and quick, and stay relaxed through the shoulders as the rhythm builds.";
  }
  if (loweredName.includes("bike sprint")) {
    return "Drive hard through the pedals, keep the torso quiet, and hold strong output without rocking side to side.";
  }
  if (loweredName.includes("mountain climber")) {
    return "Alternate the knees under the torso quickly while keeping the shoulders stacked and the trunk from bouncing around.";
  }
  if (loweredName.includes("high knees")) {
    return "Drive the knees up with quick contacts under the hips, keep the chest tall, and match the legs with active arm swing.";
  }
  if (loweredName.includes("burpee")) {
    return "Drop to the floor under control, hit the plank cleanly, then return to standing with enough pace to stay athletic without losing shape.";
  }
  if (loweredName.includes("man maker")) {
    return "Control the plank and row phase first, then bring the dumbbells through to standing and finish the rep without rushing the transition.";
  }
  if (loweredName.includes("bear crawl drag")) {
    return "Keep the hips quiet while one arm drags the load across, then reset the base before alternating sides.";
  }
  if (loweredName.includes("plank")) {
    return "Brace the trunk, squeeze the glutes, and hold a straight line without letting the hips sag or pike up.";
  }
  if (loweredName.includes("dead bug")) {
    return "Reach the opposite arm and leg away while the low back stays quiet, then return slowly before switching sides.";
  }
  if (secondStep && thirdStep && fourthStep) {
    return `${secondStep} ${thirdStep} ${fourthStep}`.trim();
  }
  return movementQualityDetail;
}

function buildGuideInstructions(option, loweredName, equipment, existingInstructions = []) {
  const exactInstructions = buildVisualSequence(option, loweredName, equipment).map((step) => step.description);
  return exactInstructions.length ? exactInstructions : Array.isArray(existingInstructions) ? existingInstructions : [];
}

function buildGuideCues(option, loweredName, existingCues = []) {
  if (loweredName.includes("goblet squat")) return ["Dumbbell stays close to the chest", "Whole foot stays planted", "Stand tall without leaning back"];
  if (loweredName.includes("hammer curl")) return ["Neutral grip all the way", "Elbows stay close", "Lower slower than you lift"];
  if (loweredName.includes("incline dumbbell press")) return ["Shoulders stay packed", "Press on an upward angle", "Do not bounce out of the bottom"];
  if (loweredName.includes("floor press")) return ["Upper arm taps the floor softly", "Forearms stay vertical", "Drive without flaring the ribs"];
  if (loweredName.includes("arnold press")) return ["Rotate smoothly", "Stay tall through the torso", "Finish without shrugging"];
  if (loweredName.includes("band chest press")) return ["Anchor stays stable", "Press straight forward", "Do not let the band pull you open"];
  if (loweredName.includes("pike push-up")) return ["Hips stay high", "Head travels between the hands", "Push the floor away"];
  if (loweredName.includes("overhead dumbbell extension") || loweredName.includes("rope overhead extension")) return ["Elbows point forward", "Upper arms stay still", "Straighten fully without flaring"];
  if (loweredName.includes("bench dip")) return ["Chest stays open", "Shoulders stay away from ears", "Use a shorter range if needed"];
  if (loweredName.includes("close-grip push-up")) return ["Hands stay narrow but comfortable", "Elbows brush the ribs", "Whole body moves together"];
  if (loweredName.includes("band pressdown")) return ["Elbows stay pinned", "Press down through the band", "Return slowly"];
  if (loweredName.includes("band pulldown")) return ["Elbows to ribs", "Shoulders stay down", "Control the return"];
  if (loweredName.includes("back widow")) return ["Drive through the elbows", "Lift the chest, not the neck", "Lower softly"];
  if (loweredName.includes("pull-up negative")) return ["Own the descent", "Keep the shoulders packed", "Do not drop through the midpoint"];
  if (loweredName.includes("step-up")) return ["Whole lead foot on the box", "Drive through the lead leg", "Step down under control"];
  if (loweredName.includes("rear-foot elevated split squat")) return ["Front foot heavy", "Drop straight down", "Stay tall over the front leg"];
  if (loweredName.includes("carry")) return ["Tall posture", "Short controlled steps", "Do not let the load sway you"];
  if (loweredName.includes("pallof")) return ["Ribs stacked", "Press straight out", "Do not rotate toward the anchor"];
  if (loweredName.includes("sled push")) return ["Lean from the ankles", "Quick hard steps", "Stay braced the whole run"];
  if (loweredName.includes("rower sprint")) return ["Legs drive first", "Finish with the handle to the ribs", "Recover smoothly into the next stroke"];
  if (Array.isArray(existingCues) && existingCues.length) return existingCues;
  return buildCueList(String(option.movementPattern || "").toLowerCase(), option.primaryMuscleGroup);
}

function buildGuideMistakes(option, loweredName, existingMistakes = []) {
  if (loweredName.includes("goblet squat")) return ["Letting the dumbbell drift away from the chest", "Heels lifting at the bottom", "Collapsing the chest on the way up"];
  if (loweredName.includes("hammer curl")) return ["Swinging the torso", "Letting the elbows drift forward", "Dumping the lowering phase"];
  if (loweredName.includes("bench dip")) return ["Dropping too deep into the shoulders", "Shrugging into the ears", "Using bounce to get out of the bottom"];
  if (loweredName.includes("band chest press")) return ["Letting the band pull the shoulders open", "Pressing with flared ribs", "Losing stance balance"];
  if (loweredName.includes("pike push-up")) return ["Letting the hips drop", "Flaring the elbows too wide", "Bouncing off the head path"];
  if (loweredName.includes("overhead dumbbell extension") || loweredName.includes("rope overhead extension")) return ["Letting the elbows flare wide", "Arching the low back to finish", "Turning it into a shoulder movement"];
  if (loweredName.includes("close-grip push-up")) return ["Elbows winging out", "Hips sagging", "Cutting the range short when it gets hard"];
  if (loweredName.includes("band pressdown")) return ["Rocking the torso", "Letting elbows drift forward", "Snapping the band back up"];
  if (loweredName.includes("band pulldown")) return ["Shrugging at the top", "Turning it into a row", "Using momentum instead of elbow drive"];
  if (loweredName.includes("back widow")) return ["Jamming the neck into extension", "Shrugging into the ears", "Trying to bridge instead of lift from the upper back"];
  if (loweredName.includes("pull-up negative")) return ["Dropping too fast", "Losing shoulder position halfway down", "Kipping or twisting to survive the descent"];
  if (loweredName.includes("step-up")) return ["Pushing too hard off the back leg", "Only using the toes on the box", "Falling down into the descent"];
  if (loweredName.includes("rear-foot elevated split squat")) return ["Taking too short a stance", "Collapsing into the front knee", "Bouncing off the bottom"];
  if (loweredName.includes("carry")) return ["Leaning away from the load", "Letting the shoulders shrug up", "Taking rushed sloppy steps"];
  if (loweredName.includes("pallof")) return ["Rotating toward the band", "Leaning backward as you press", "Rushing the return"];
  if (loweredName.includes("sled push")) return ["Standing too upright", "Chopping the steps too short to move the sled", "Losing trunk tension"];
  if (loweredName.includes("rower sprint")) return ["Pulling with the arms first", "Throwing the torso back early", "Crashing into the catch"];
  if (Array.isArray(existingMistakes) && existingMistakes.length) return existingMistakes;
  return buildMistakeList(String(option.movementPattern || "").toLowerCase());
}

function buildGuideSafetyNotes(option, loweredName, existingSafetyNotes = []) {
  if (loweredName.includes("bench dip")) return ["Use a shorter range if the front of the shoulder feels pinchy.", "Swap this out if shoulder irritation builds quickly."];
  if (loweredName.includes("goblet squat")) return ["Stay in a depth where the chest and heels stay controlled.", "Use a box if you need a consistent bottom target."];
  if (loweredName.includes("hammer curl")) return ["Keep the wrist neutral instead of cranking it back.", "Lighten the load if you need body English to finish reps."];
  if (loweredName.includes("band chest press")) return ["Check the anchor before every set.", "Reduce band tension if you cannot control the return."];
  if (loweredName.includes("pike push-up")) return ["Elevate the hands if shoulder loading is too aggressive.", "Stop short if neck or shoulder pressure builds."];
  if (loweredName.includes("overhead dumbbell extension") || loweredName.includes("rope overhead extension")) return ["Use a load that lets the elbows stay mostly in place.", "Shorten the range if elbows or shoulders get cranky."];
  if (loweredName.includes("close-grip push-up")) return ["Elevate the hands if full floor reps lose shape.", "Stop the set if the low back or shoulders start taking over."];
  if (loweredName.includes("band pressdown")) return ["Use a secure overhead anchor.", "Step closer if the band is pulling you out of position."];
  if (loweredName.includes("band pulldown")) return ["Use an anchor that will not shift or slip.", "Reduce band tension if you have to lean back to finish reps."];
  if (loweredName.includes("back widow")) return ["Keep the neck long instead of cranking the head back.", "Use a smaller lift if the front of the shoulder feels pinchy."];
  if (loweredName.includes("pull-up negative")) return ["Step back to the top instead of jumping wildly between reps.", "Limit the range if you cannot control the shoulders to full hang."];
  if (loweredName.includes("step-up")) return ["Choose a box height you can control without hopping.", "Lower the box if the lead knee or hip loses control."];
  if (loweredName.includes("rear-foot elevated split squat")) return ["Hold support if balance is the main limiter.", "Reduce depth if the front hip or knee gets pinchy."];
  if (loweredName.includes("carry")) return ["Set the load down before grip failure changes your posture.", "Keep the walking lane clear before each carry."];
  if (loweredName.includes("pallof")) return ["Use a lighter band if the trunk rotates as soon as you press.", "Keep the knees soft so the low back does not take over."];
  if (loweredName.includes("sled push")) return ["Use a load you can move with clean posture, not a grindy collapse.", "Keep the run space clear before you start the push."];
  if (loweredName.includes("rower sprint")) return ["Stay tall through the spine instead of rounding to chase stroke rate.", "Treat this as an interval, not a max-out every stroke if form falls apart."];
  if (Array.isArray(existingSafetyNotes) && existingSafetyNotes.length) return existingSafetyNotes;
  return [
    "Use a load and range you can control cleanly.",
    String(option.movementPattern || "").toLowerCase().includes("squat") || String(option.movementPattern || "").toLowerCase().includes("hinge")
      ? "Brace before the rep and stop if position breaks."
      : "Stop the set when the rep stops matching the target pattern."
  ];
}

function buildGuideModifications(option, loweredName, existingModifications = []) {
  if (loweredName.includes("incline dumbbell press")) return ["Flat dumbbell bench press", "Machine chest press", "Push-up if no bench is available"];
  if (loweredName.includes("floor press")) return ["Neutral-grip floor press", "Push-up", "Machine chest press"];
  if (loweredName.includes("hammer curl")) return ["Alternating hammer curl", "Band curl", "Concentration curl"];
  if (loweredName.includes("goblet squat")) return ["Bodyweight squat", "Heels-elevated goblet squat", "Supported box squat pattern"];
  if (loweredName.includes("band chest press")) return ["Split-stance band chest press", "Push-up", "Machine chest press"];
  if (loweredName.includes("pike push-up")) return ["Incline pike push-up", "Dumbbell shoulder press", "Wall-supported pike hold"];
  if (loweredName.includes("overhead dumbbell extension") || loweredName.includes("rope overhead extension")) return ["Band pressdown", "Lighter single-dumbbell extension", "Cable pushdown"];
  if (loweredName.includes("bench dip")) return ["Close-grip push-up", "Band pressdown", "Cable triceps pushdown"];
  if (loweredName.includes("close-grip push-up")) return ["Incline close-grip push-up", "Bench push-up", "Band pressdown"];
  if (loweredName.includes("band pressdown")) return ["Cable pushdown", "Close-grip push-up", "Overhead band extension"];
  if (loweredName.includes("band pulldown")) return ["Neutral-grip pulldown", "Chest-supported row", "Half-kneeling single-arm band pulldown"];
  if (loweredName.includes("back widow")) return ["Band pulldown", "Face pull", "Chest-supported row"];
  if (loweredName.includes("pull-up negative")) return ["Assisted pull-up", "Band pulldown", "Scap pull-up hold"];
  if (loweredName.includes("step-up")) return ["Lower box step-up", "Split squat", "Bodyweight step-up"];
  if (loweredName.includes("rear-foot elevated split squat")) return ["Split squat", "Supported split squat", "Front-foot elevated split squat"];
  if (loweredName.includes("carry")) return ["Lighter carry distance", "Farmer hold", "Suitcase carry with slower steps"];
  if (loweredName.includes("pallof")) return ["Shorter band press-out", "Tall-kneeling Pallof press", "Pallof hold"];
  if (loweredName.includes("sled push")) return ["Lighter sled push", "Marching sled push", "Bike sprint if sled space is unavailable"];
  if (loweredName.includes("rower sprint")) return ["Longer moderate rowing interval", "Bike sprint", "High-knees interval"];
  if (Array.isArray(existingModifications) && existingModifications.length) return existingModifications;
  return buildGenericModifications(option, loweredName);
}

// Class-aware, directional fallback ordered [easier, easier, harder, harder] so
// deriveGuideRegressions (slice 0,2) and deriveGuideProgressions (slice -2) both
// return sensible, correctly-directional guidance instead of a broken placeholder.
function buildGenericModifications(option, loweredName) {
  const isMobility = String(option.mode || option.trainingType || "").toLowerCase() === "mobility"
    || /(stretch|mobility|cat-cow|90\/90|hip flow|wall slide|thoracic|ankle rock|child|hip flexor)/.test(loweredName);
  const isConditioning = /(sprint|treadmill|bike|elliptical|stair|rower|jump rope|shuttle|agility|butt kick|fast feet|shadow|cone|shuffle|high knee|jumping jack|battle rope|power step)/.test(loweredName);
  const isPower = /(box jump|jump squat|slam|skater|broad jump|bound|med ball|split jump)/.test(loweredName);
  if (isMobility) {
    return [
      "Make the movement smaller and gentler, or hold something for balance",
      "Only move as far as feels comfortable — no forcing the stretch",
      "Move a little farther as it loosens up",
      "Hold the end position a little longer, or add a slow breath there"
    ];
  }
  if (isConditioning) {
    return [
      "Go slower or take short walk breaks when you get tired",
      "Shorten the work interval and rest a little longer",
      "Work a bit longer or rest a little less",
      "Increase the pace, resistance, or incline while staying in control"
    ];
  }
  if (isPower) {
    return [
      "Do it without the jump first (step through the motion)",
      "Use a lower height or a smaller, softer jump",
      "Increase the height or distance a little",
      "Make each rep more explosive — always land soft and controlled"
    ];
  }
  return [
    "Use less weight or a smaller range of motion to start",
    "Do fewer reps and rest a little longer between sets",
    "Add a little weight or a few more reps as it gets easier",
    "Slow the lowering part or add a short pause to make it harder without more weight"
  ];
}

function buildBestFitLabel(option, loweredName, equipment) {
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") return "Best for reset and recovery work";
  if (loweredName.includes("machine")) return "Best when you want extra stability";
  if (loweredName.includes("band")) return "Best for home setups and lower joint load";
  if (loweredName.includes("bodyweight")) return "Best when you need a no-equipment option";
  return `Best with ${equipment.join(", ").toLowerCase()} available`;
}

function buildTrainingUse(option, loweredName) {
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return "Use for mobility work, warm-ins, and recovery-focused sessions.";
  }
  if (loweredName.includes("carry") || loweredName.includes("pallof") || loweredName.includes("plank") || loweredName.includes("dead bug")) {
    return "Use for trunk stiffness, control, and finishers that support bigger lifts.";
  }
  if (loweredName.includes("conditioning") || loweredName.includes("sprint") || loweredName.includes("burpee") || loweredName.includes("high knees") || loweredName.includes("jump rope") || loweredName.includes("sled push")) {
    return "Use for conditioning blocks, density work, and shorter finishers.";
  }
  if (loweredName.includes("curl") || loweredName.includes("pushdown") || loweredName.includes("extension") || loweredName.includes("raise") || loweredName.includes("fly")) {
    return "Use for targeted accessory work, hypertrophy, and adding volume without rebuilding the whole session.";
  }
  if (loweredName.includes("squat") || loweredName.includes("deadlift") || loweredName.includes("row") || loweredName.includes("press") || loweredName.includes("lunge")) {
    return "Use as a main lift or key supporting movement inside strength and hypertrophy sessions.";
  }
  return "Use where this movement pattern best fits your training day and available setup.";
}

function buildBreathingGuide(option, loweredName) {
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return "Breathe slowly through the whole movement and avoid holding your breath at end range.";
  }
  if (loweredName.includes("carry") || loweredName.includes("conditioning") || loweredName.includes("sprint")) {
    return "Keep breaths rhythmic and steady enough that posture does not fall apart.";
  }
  if (loweredName.includes("squat") || loweredName.includes("deadlift") || loweredName.includes("hinge") || loweredName.includes("lunge")) {
    return "Take a breath and brace before the rep, then exhale as you pass the hardest part of the movement.";
  }
  return "Inhale on the controlled lowering phase and exhale as you drive through the main effort.";
}

function buildTempoGuide(option, loweredName) {
  if (String(option.mode || option.trainingType || "").toLowerCase() === "mobility") {
    return "Move slowly enough to stay in control and pause briefly where the stretch or position is clearest.";
  }
  if (loweredName.includes("conditioning") || loweredName.includes("sprint") || loweredName.includes("high knees") || loweredName.includes("jump rope") || loweredName.includes("sled push")) {
    return "Move with intent, but only as fast as you can keep clean positions and repeatable rhythm.";
  }
  if (loweredName.includes("curl") || loweredName.includes("raise") || loweredName.includes("pushdown") || loweredName.includes("extension")) {
    return "Lift with control, squeeze briefly where it counts, and lower slower than you lift.";
  }
  return "Control the lowering phase, stay organized at the hardest point, and finish each rep before starting the next.";
}

function deriveGuideRegressions(modifications = []) {
  return modifications.slice(0, 2);
}

function deriveGuideProgressions(modifications = []) {
  return modifications.slice(-2);
}

function choosePreferredMovementMedia(primaryMedia, fallbackMedia) {
  const primaryScore = scoreMovementMedia(primaryMedia);
  const fallbackScore = scoreMovementMedia(fallbackMedia);
  return primaryScore >= fallbackScore ? primaryMedia || fallbackMedia || null : fallbackMedia || primaryMedia || null;
}

function scoreMovementMedia(media) {
  if (!media) {
    return 0;
  }

  const uniqueSteps = new Set(
    (Array.isArray(media.steps) && media.steps.length ? media.steps : media.images || []).filter(Boolean)
  ).size;

  if (uniqueSteps >= 4) {
    return 4;
  }
  if (uniqueSteps >= 2) {
    return 3;
  }
  if (media.thumbnail) {
    return 2;
  }
  if (Array.isArray(media.images) && media.images.filter(Boolean).length) {
    return 1;
  }
  return 0;
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
