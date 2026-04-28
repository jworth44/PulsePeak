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
  }
};

const REVIEWED_MEDIA = {
  "push-up": approvedAsset("push-up-step-2", {
    exerciseId: "push-up",
    reviewSource: "pulsepeak_ai_sequence_v1",
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
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "dead-bug": approvedAsset("dead-bug-photo", {
    exerciseId: "dead-bug",
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "side-plank": approvedAsset("side-plank-photo", {
    exerciseId: "side-plank",
    reviewSource: "pulsepeak_ai_sequence_v1",
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
    reviewSource: "pulsepeak_ai_sequence_v1",
    sequenceCount: 4
  }),
  "biceps-curl": approvedAsset("biceps-curl-photo", {
    exerciseId: "biceps-curl",
    reviewSource: "pulsepeak_ai_sequence_v1",
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
