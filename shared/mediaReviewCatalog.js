export const EXERCISE_VISUAL_MODEL_KEYS = ["male", "female"];

export const MEDIA_REVIEW_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  NEEDS_REGENERATION: "needs_regeneration"
};

export const MEDIA_APPROVAL_STANDARD = {
  rejectIf: [
    "Anatomy looks broken or distorted.",
    "Hands, fingers, or joints look malformed or unnatural.",
    "Posture or body proportions look unrealistic for the movement.",
    "The movement phase is unclear or does not match the intended exercise step.",
    "Model identity looks inconsistent with the PulsePeak visual system.",
    "Face or body proportions drift away from the locked model.",
    "Lighting feels fake, plastic, or overly synthetic.",
    "The gym or home setup looks messy, warped, or visually distracting.",
    "Equipment, clothing, or environment looks malformed or distorted.",
    "Framing hides the key mechanics needed to understand the movement."
  ],
  approveOnlyIf: [
    "The exercise is instantly understandable.",
    "Posture and body proportions are believable.",
    "Equipment and setup are correct for the movement.",
    "The start, mid, peak, or finish step is clearly represented.",
    "The image feels clean, premium, and consistent with PulsePeak style.",
    "The locked PulsePeak male or female model is preserved clearly.",
    "The movement phase clearly represents the intended position."
  ]
};

export const DECLARED_EXERCISE_MODEL_MEDIA = {
  "goblet-squat--goblet-squat": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_goblet_squat_male_v1",
      thumbnail: buildExerciseModelAssetPath("goblet-squat--goblet-squat", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "male", "step-1.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "male", "step-2.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "male", "step-3.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "male", "step-4.png")
      ]
    },
    female: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_goblet_squat_female_v1",
      thumbnail: buildExerciseModelAssetPath("goblet-squat--goblet-squat", "female", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "female", "step-1.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "female", "step-2.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "female", "step-3.png"),
        buildExerciseModelAssetPath("goblet-squat--goblet-squat", "female", "step-4.png")
      ]
    }
  },
  "incline-dumbbell-press--incline-dumbbell-press": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_incline_dumbbell_press_male_v1",
      thumbnail: buildExerciseModelAssetPath("incline-dumbbell-press--incline-dumbbell-press", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("incline-dumbbell-press--incline-dumbbell-press", "male", "step-1.png"),
        buildExerciseModelAssetPath("incline-dumbbell-press--incline-dumbbell-press", "male", "step-2.png"),
        buildExerciseModelAssetPath("incline-dumbbell-press--incline-dumbbell-press", "male", "step-3.png"),
        buildExerciseModelAssetPath("incline-dumbbell-press--incline-dumbbell-press", "male", "step-4.png")
      ]
    }
  },
  "flat-dumbbell-bench-press--flat-dumbbell-bench-press": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_flat_dumbbell_bench_press_male_v1",
      thumbnail: buildExerciseModelAssetPath("flat-dumbbell-bench-press--flat-dumbbell-bench-press", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("flat-dumbbell-bench-press--flat-dumbbell-bench-press", "male", "step-1.png"),
        buildExerciseModelAssetPath("flat-dumbbell-bench-press--flat-dumbbell-bench-press", "male", "step-2.png"),
        buildExerciseModelAssetPath("flat-dumbbell-bench-press--flat-dumbbell-bench-press", "male", "step-3.png"),
        buildExerciseModelAssetPath("flat-dumbbell-bench-press--flat-dumbbell-bench-press", "male", "step-4.png")
      ]
    }
  },
  "romanian-deadlift--romanian-deadlift": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_refinement_romanian_deadlift_male_v2",
      thumbnail: buildExerciseModelAssetPath("romanian-deadlift--romanian-deadlift", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("romanian-deadlift--romanian-deadlift", "male", "step-1.png"),
        buildExerciseModelAssetPath("romanian-deadlift--romanian-deadlift", "male", "step-2.png"),
        buildExerciseModelAssetPath("romanian-deadlift--romanian-deadlift", "male", "step-3.png"),
        buildExerciseModelAssetPath("romanian-deadlift--romanian-deadlift", "male", "step-4.png")
      ]
    }
  },
  "dumbbell-floor-press--dumbbell-floor-press": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_dumbbell_floor_press_male_v1",
      thumbnail: buildExerciseModelAssetPath("dumbbell-floor-press--dumbbell-floor-press", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("dumbbell-floor-press--dumbbell-floor-press", "male", "step-1.png"),
        buildExerciseModelAssetPath("dumbbell-floor-press--dumbbell-floor-press", "male", "step-2.png"),
        buildExerciseModelAssetPath("dumbbell-floor-press--dumbbell-floor-press", "male", "step-3.png"),
        buildExerciseModelAssetPath("dumbbell-floor-press--dumbbell-floor-press", "male", "step-4.png")
      ]
    }
  },
  "overhead-dumbbell-extension--overhead-dumbbell-extension": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_overhead_dumbbell_extension_male_v1",
      thumbnail: buildExerciseModelAssetPath("overhead-dumbbell-extension--overhead-dumbbell-extension", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("overhead-dumbbell-extension--overhead-dumbbell-extension", "male", "step-1.png"),
        buildExerciseModelAssetPath("overhead-dumbbell-extension--overhead-dumbbell-extension", "male", "step-2.png"),
        buildExerciseModelAssetPath("overhead-dumbbell-extension--overhead-dumbbell-extension", "male", "step-3.png"),
        buildExerciseModelAssetPath("overhead-dumbbell-extension--overhead-dumbbell-extension", "male", "step-4.png")
      ]
    }
  },
  "dumbbell-lateral-raise--dumbbell-lateral-raise": {
    male: {
      reviewStatus: "approved",
      reviewSource: "pulsepeak_ai_pilot_dumbbell_lateral_raise_male_v1",
      thumbnail: buildExerciseModelAssetPath("dumbbell-lateral-raise--dumbbell-lateral-raise", "male", "thumbnail.png"),
      steps: [
        buildExerciseModelAssetPath("dumbbell-lateral-raise--dumbbell-lateral-raise", "male", "step-1.png"),
        buildExerciseModelAssetPath("dumbbell-lateral-raise--dumbbell-lateral-raise", "male", "step-2.png"),
        buildExerciseModelAssetPath("dumbbell-lateral-raise--dumbbell-lateral-raise", "male", "step-3.png"),
        buildExerciseModelAssetPath("dumbbell-lateral-raise--dumbbell-lateral-raise", "male", "step-4.png")
      ]
    }
  }
};

const REVIEWED_MEDIA = {
  "push-up": approvedAsset("push-up-photo", {
    exerciseId: "push-up",
    reviewSource: "pulsepeak_gemini_push_up_male_v3",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=push-up+exercise+form"
  }),
  squat: approvedAsset("squat-step-2", {
    exerciseId: "squat",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=squat+exercise+form"
  }),
  row: approvedAsset("row-step-2", {
    exerciseId: "row",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=single-arm+dumbbell+row+exercise+form"
  }),
  "dumbbell-press": approvedAsset("dumbbell-press-step-2", {
    exerciseId: "dumbbell-press",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=dumbbell+bench+press+exercise+form"
  }),
  deadlift: approvedAsset("deadlift-step-2", {
    exerciseId: "deadlift",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=romanian+deadlift+dumbbell+exercise+form"
  }),
  lunge: approvedAsset("lunge-step-2", {
    exerciseId: "lunge",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=forward+lunge+exercise+form"
  }),
  "glute-bridge": approvedAsset("glute-bridge-photo", {
    exerciseId: "glute-bridge",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=glute+bridge+floor+exercise"
  }),
  plank: approvedAsset("plank-step-2", {
    exerciseId: "plank",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=forearm+plank+straight+body"
  }),
  "cat-cow": approvedAsset("cat-cow-step-2", {
    exerciseId: "cat-cow",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=cat-cow+exercise+form"
  }),
  "worlds-greatest-stretch": approvedAsset("worlds-greatest-stretch-photo", {
    exerciseId: "worlds-greatest-stretch",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=worlds+greatest+stretch+lunge+rotation"
  }),
  "thoracic-rotation": approvedAsset("thoracic-rotation-photo", {
    exerciseId: "thoracic-rotation",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=thoracic+spine+rotation+stretch+floor"
  }),
  "wall-slide": approvedAsset("wall-slide-photo", {
    exerciseId: "wall-slide",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=wall+slide+shoulder+exercise"
  }),
  "overhead-press": approvedAsset("overhead-press-step-2", {
    exerciseId: "overhead-press",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=dumbbell+overhead+press+exercise+form"
  }),
  "hamstring-stretch": approvedAsset("hamstring-stretch-photo", {
    exerciseId: "hamstring-stretch",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=seated+hamstring+stretch+straight+leg"
  }),
  "hip-flexor-stretch": approvedAsset("hip-flexor-stretch-photo", {
    exerciseId: "hip-flexor-stretch",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=kneeling+hip+flexor+stretch"
  }),
  "band-pull-apart": approvedAsset("band-pull-apart-photo", {
    exerciseId: "band-pull-apart",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=resistance+band+pull+apart+exercise"
  }),
  "wall-squat": approvedAsset("wall-squat-photo", {
    exerciseId: "wall-squat",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=wall+sit+exercise+90+degrees"
  }),
  "supported-split-squat": approvedAsset("supported-split-squat-photo", {
    exerciseId: "supported-split-squat",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=split+squat+rear+foot+elevated"
  }),
  "shoulder-mobility": approvedAsset("shoulder-mobility-photo", {
    exerciseId: "shoulder-mobility",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=shoulder+mobility+band+stretch+overhead"
  }),
  "lat-pulldown": approvedAsset("lat-pulldown-photo", {
    exerciseId: "lat-pulldown",
    reviewSource: "pulsepeak_ai_pilot_lat_pulldown_male_v1",
    sequenceCount: 4
  }),
  "chest-supported-row": approvedAsset("chest-supported-row-photo", {
    exerciseId: "chest-supported-row",
    reviewSource: "pulsepeak_ai_pilot_chest_supported_row_male_v1",
    sequenceCount: 4
  }),
  "seated-cable-row": approvedAsset("seated-cable-row-photo", {
    exerciseId: "seated-cable-row",
    reviewSource: "pulsepeak_ai_pilot_seated_cable_row_male_v1",
    sequenceCount: 4
  }),
  "dead-bug": approvedAsset("dead-bug-photo", {
    exerciseId: "dead-bug",
    reviewSource: "pulsepeak_ai_pilot_dead_bug_male_v1",
    sequenceCount: 4
  }),
  "bird-dog": approvedAsset("bird-dog-photo", {
    exerciseId: "bird-dog",
    reviewSource: "pulsepeak_ai_pilot_bird_dog_male_v1",
    sequenceCount: 4
  }),
  crunch: approvedAsset("crunch-photo", {
    exerciseId: "crunch",
    reviewSource: "pulsepeak_gemini_crunch_male_v1",
    sequenceCount: 4
  }),
  "russian-twist": approvedAsset("russian-twist-photo", {
    exerciseId: "russian-twist",
    reviewSource: "pulsepeak_gemini_russian_twist_male_v1",
    sequenceCount: 4
  }),
  "side-plank": approvedAsset("side-plank-photo", {
    exerciseId: "side-plank",
    reviewSource: "pulsepeak_ai_pilot_side_plank_male_v1",
    sequenceCount: 4,
    videoUrl: "https://www.youtube.com/results?search_query=side+plank+exercise+form"
  }),
  "mountain-climber": approvedAsset("mountain-climber-photo", {
    exerciseId: "mountain-climber",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "high-knees": approvedAsset("high-knees-photo", {
    exerciseId: "high-knees",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "jumping-jack": approvedAsset("jumping-jack-photo", {
    exerciseId: "jumping-jack",
    reviewSource: "pulsepeak_ai_preview_jumping_jack_male_v1",
    sequenceCount: 4
  }),
  burpee: approvedAsset("burpee-photo", {
    exerciseId: "burpee",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "hip-flow-90-90": approvedAsset("hip-flow-90-90-photo", {
    exerciseId: "hip-flow-90-90",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "arnold-press": approvedAsset("arnold-press-photo", {
    exerciseId: "arnold-press",
    reviewSource: "pulsepeak_ai_pilot_arnold_press_male_v1",
    sequenceCount: 4
  }),
  "childs-pose-side-reach": approvedAsset("childs-pose-side-reach-photo", {
    exerciseId: "childs-pose-side-reach",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "ankle-rocks": approvedAsset("ankle-rocks-photo", {
    exerciseId: "ankle-rocks",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "triceps-pushdown": approvedAsset("triceps-pushdown-photo", {
    exerciseId: "triceps-pushdown",
    reviewSource: "pulsepeak_ai_pilot_triceps_pushdown_male_v1",
    sequenceCount: 4
  }),
  "biceps-curl": approvedAsset("biceps-curl-photo", {
    exerciseId: "biceps-curl",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "concentration-curl": approvedAsset("concentration-curl-photo", {
    exerciseId: "concentration-curl",
    reviewSource: "pulsepeak_ai_pilot_concentration_curl_male_v1",
    sequenceCount: 4
  }),
  "front-squat": approvedAsset("front-squat-photo", {
    exerciseId: "front-squat",
    reviewSource: "pulsepeak_ai_pilot_front_squat_male_v1",
    sequenceCount: 4
  }),
  "hammer-curl": approvedAsset("hammer-curl-photo", {
    exerciseId: "hammer-curl",
    reviewSource: "pulsepeak_ai_pilot_hammer_curl_male_v1",
    sequenceCount: 4
  }),
  "lateral-raise": approvedAsset("lateral-raise-photo", {
    exerciseId: "lateral-raise",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "calf-raise": approvedAsset("calf-raise-photo", {
    exerciseId: "calf-raise",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "hip-thrust": approvedAsset("hip-thrust-photo", {
    exerciseId: "hip-thrust",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "back-squat": approvedAsset("back-squat-photo", {
    exerciseId: "back-squat",
    reviewSource: "pulsepeak_ai_pilot_back_squat_male_v1",
    sequenceCount: 4
  }),
  "barbell-bench-press": approvedAsset("barbell-bench-press-photo", {
    exerciseId: "barbell-bench-press",
    reviewSource: "pulsepeak_ai_pilot_barbell_bench_press_male_v1",
    sequenceCount: 4
  }),
  "goblet-squat": approvedAsset("goblet-squat-photo", {
    exerciseId: "goblet-squat",
    reviewSource: "pulsepeak_ai_pilot_goblet_squat_male_v1",
    sequenceCount: 4
  }),
  "incline-dumbbell-press": approvedAsset("incline-dumbbell-press-photo", {
    exerciseId: "incline-dumbbell-press",
    reviewSource: "pulsepeak_ai_pilot_incline_dumbbell_press_male_v1",
    sequenceCount: 4
  }),
  "flat-dumbbell-bench-press": approvedAsset("flat-dumbbell-bench-press-photo", {
    exerciseId: "flat-dumbbell-bench-press",
    reviewSource: "pulsepeak_ai_pilot_flat_dumbbell_bench_press_male_v1",
    sequenceCount: 4
  }),
  "overhead-dumbbell-extension": approvedAsset("overhead-dumbbell-extension-photo", {
    exerciseId: "overhead-dumbbell-extension",
    reviewSource: "pulsepeak_ai_pilot_overhead_dumbbell_extension_male_v1",
    sequenceCount: 4
  }),
  "romanian-deadlift": approvedAsset("romanian-deadlift-photo", {
    exerciseId: "romanian-deadlift",
    reviewSource: "pulsepeak_ai_refinement_romanian_deadlift_male_v2",
    sequenceCount: 4
  }),
  "reverse-lunge": approvedAsset("reverse-lunge-photo", {
    exerciseId: "reverse-lunge",
    reviewSource: "pulsepeak_ai_pilot_reverse_lunge_male_v1",
    sequenceCount: 4
  }),
  "single-arm-dumbbell-row": approvedAsset("single-arm-dumbbell-row-photo", {
    exerciseId: "single-arm-dumbbell-row",
    reviewSource: "pulsepeak_ai_pilot_single_arm_dumbbell_row_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-walking-lunge": approvedAsset("dumbbell-walking-lunge-photo", {
    exerciseId: "dumbbell-walking-lunge",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_walking_lunge_male_v1",
    sequenceCount: 4
  }),
  "walking-lunge": approvedAsset("walking-lunge-photo", {
    exerciseId: "walking-lunge",
    reviewSource: "pulsepeak_ai_pilot_walking_lunge_male_v1",
    sequenceCount: 4
  }),
  "goblet-reverse-lunge": approvedAsset("goblet-reverse-lunge-photo", {
    exerciseId: "goblet-reverse-lunge",
    reviewSource: "pulsepeak_ai_pilot_goblet_reverse_lunge_male_v1",
    sequenceCount: 4
  }),
  "split-squat": approvedAsset("split-squat-photo", {
    exerciseId: "split-squat",
    reviewSource: "pulsepeak_ai_pilot_split_squat_male_v1",
    sequenceCount: 4
  }),
  "bulgarian-split-squat": approvedAsset("bulgarian-split-squat-photo", {
    exerciseId: "bulgarian-split-squat",
    reviewSource: "pulsepeak_ai_pilot_bulgarian_split_squat_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-step-up": approvedAsset("dumbbell-step-up-photo", {
    exerciseId: "dumbbell-step-up",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_step_up_male_v1",
    sequenceCount: 4
  }),
  "face-pull": approvedAsset("face-pull-photo", {
    exerciseId: "face-pull",
    reviewSource: "pulsepeak_ai_pilot_face_pull_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-shoulder-press": approvedAsset("dumbbell-shoulder-press-photo", {
    exerciseId: "dumbbell-shoulder-press",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_shoulder_press_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-chest-fly": approvedAsset("dumbbell-chest-fly-photo", {
    exerciseId: "dumbbell-chest-fly",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_chest_fly_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-floor-press": approvedAsset("dumbbell-floor-press-photo", {
    exerciseId: "dumbbell-floor-press",
    reviewSource: "pulsepeak_ai_refinement_dumbbell_floor_press_male_v2",
    sequenceCount: 4
  }),
  "step-up": approvedAsset("step-up-photo", {
    exerciseId: "step-up",
    reviewSource: "pulsepeak_ai_pilot_step_up_female_v1",
    sequenceCount: 4
  }),
  "dumbbell-romanian-deadlift": approvedAsset("dumbbell-romanian-deadlift-photo", {
    exerciseId: "dumbbell-romanian-deadlift",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_romanian_deadlift_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-pullover": approvedAsset("dumbbell-pullover-photo", {
    exerciseId: "dumbbell-pullover",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_pullover_male_v1",
    sequenceCount: 4
  }),
  "dumbbell-lateral-raise": approvedAsset("dumbbell-lateral-raise-photo", {
    exerciseId: "dumbbell-lateral-raise",
    reviewSource: "pulsepeak_ai_pilot_dumbbell_lateral_raise_male_v1",
    sequenceCount: 4
  }),
  "seated-shoulder-press": approvedAsset("seated-shoulder-press-photo", {
    exerciseId: "seated-shoulder-press",
    reviewSource: "pulsepeak_ai_pilot_seated_shoulder_press_male_v1",
    sequenceCount: 4
  }),
  "t-bar-row": approvedAsset("t-bar-row-photo", {
    exerciseId: "t-bar-row",
    reviewSource: "pulsepeak_ai_pilot_t_bar_row_male_v1",
    sequenceCount: 4
  }),
  "incline-push-up": approvedAsset("incline-push-up-photo", {
    exerciseId: "incline-push-up",
    reviewSource: "pulsepeak_ai_pilot_incline_push_up_male_v1",
    sequenceCount: 4
  })
};

export function getReviewedMediaAsset(key) {
  const entry = REVIEWED_MEDIA[key];
  if (!entry || entry.status !== MEDIA_REVIEW_STATUSES.APPROVED) {
    return null;
  }
  return entry;
}

export function buildExerciseModelAssetPath(exerciseDetailId, modelKey, filename) {
  return `/media/exercises/${String(exerciseDetailId || "").trim()}/${String(modelKey || "").trim()}/${String(filename || "").trim()}`;
}

export function getDeclaredExerciseModelMedia(exerciseDetailId, modelKey) {
  const normalizedDetailId = String(exerciseDetailId || "").trim();
  const normalizedModelKey = String(modelKey || "")
    .trim()
    .toLowerCase();

  if (!normalizedDetailId || !EXERCISE_VISUAL_MODEL_KEYS.includes(normalizedModelKey)) {
    return null;
  }

  const declaredSet = DECLARED_EXERCISE_MODEL_MEDIA[normalizedDetailId]?.[normalizedModelKey] || null;
  if (!declaredSet) {
    return null;
  }

  const hasExplicitDeclaration = Boolean(declaredSet.thumbnail) || Array.isArray(declaredSet.steps);
  const thumbnail = declaredSet.thumbnail || (hasExplicitDeclaration ? buildExerciseModelAssetPath(normalizedDetailId, normalizedModelKey, "thumbnail.png") : null);
  const steps = Array.isArray(declaredSet.steps)
    ? declaredSet.steps.filter(Boolean).slice(0, 4)
    : hasExplicitDeclaration
      ? Array.from({ length: 4 }, (_, index) =>
        buildExerciseModelAssetPath(normalizedDetailId, normalizedModelKey, `step-${index + 1}.png`)
      )
      : [];
  const complete = Boolean(thumbnail) && steps.length === 4 && steps.every(Boolean);
  const approved =
    declaredSet.approved === true ||
    declaredSet.reviewStatus === MEDIA_REVIEW_STATUSES.APPROVED;

  return {
    exerciseDetailId: normalizedDetailId,
    modelKey: normalizedModelKey,
    thumbnail,
    steps,
    complete,
    approved,
    reviewStatus: declaredSet.reviewStatus || MEDIA_REVIEW_STATUSES.PENDING,
    reviewSource: declaredSet.reviewSource || "pulsepeak_controlled_model_pending_review",
    approvedAt: declaredSet.approvedAt || null
  };
}

export function listDeclaredExerciseModelMedia() {
  return Object.entries(DECLARED_EXERCISE_MODEL_MEDIA).flatMap(([exerciseDetailId, modelSets]) =>
    Object.keys(modelSets || {}).map((modelKey) => getDeclaredExerciseModelMedia(exerciseDetailId, modelKey)).filter(Boolean)
  );
}

export function hasReviewedMediaAsset(key) {
  return Boolean(getReviewedMediaAsset(key));
}

export function getMediaReviewStatus(key) {
  return REVIEWED_MEDIA[key] || pendingAsset();
}

function approvedAsset(assetName, options = {}) {
  const extension = options.extension || (assetName.endsWith("-photo") ? "png" : "svg");
  const exerciseId = options.exerciseId || assetName.replace(/-step-\d+$/, "").replace(/-photo$/, "");
  const src = movementAssetPath(exerciseId, "thumbnail.png");
  const suppliedSteps = Array.isArray(options.steps) ? options.steps.filter(Boolean).slice(0, 4) : [];
  const suppliedImages = Array.isArray(options.images) ? options.images.filter(Boolean).slice(0, 4) : [];
  const generatedSequence = Number.isInteger(options.sequenceCount) && options.sequenceCount > 0
    ? Array.from({ length: Math.min(options.sequenceCount, 4) }, (_, index) => movementAssetPath(exerciseId, `step-${index + 1}.png`))
    : [];
  const resolvedSequence = suppliedSteps.length ? suppliedSteps : suppliedImages.length ? suppliedImages : generatedSequence.length ? generatedSequence : [src];
  return {
    status: MEDIA_REVIEW_STATUSES.APPROVED,
    modelKey: options.modelKey || null,
    reviewSource: options.reviewSource || (extension === "png" ? "pulsepeak_ai_photo_v1" : "owned_reference_illustration"),
    image: src,
    thumbnail: src,
    images: resolvedSequence,
    steps: resolvedSequence,
    stepCount: resolvedSequence.length,
    validationPassed: true,
    videoUrl: options.videoUrl || null,
    approvedAt: options.approvedAt || "2026-04-22"
  };
}

function movementAssetPath(exerciseId, filename) {
  return `/media/exercises/${exerciseId}/${filename}`;
}

function pendingAsset() {
  return {
    status: MEDIA_REVIEW_STATUSES.PENDING,
    reviewSource: "awaiting_batch_review",
    image: null,
    thumbnail: null,
    images: [],
    approvedAt: null
  };
}
