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
    "The movement phase clearly represents the intended position."
  ]
};

const REVIEWED_MEDIA = {
  "push-up": approvedAsset("push-up"),
  squat: approvedAsset("squat"),
  row: approvedAsset("row"),
  deadlift: approvedAsset("deadlift"),
  lunge: approvedAsset("lunge"),
  "glute-bridge": approvedAsset("glute-bridge"),
  plank: approvedAsset("plank"),
  "cat-cow": approvedAsset("cat-cow"),
  "worlds-greatest-stretch": approvedAsset("worlds-greatest-stretch"),
  "thoracic-rotation": approvedAsset("thoracic-rotation"),
  "wall-slide": approvedAsset("wall-slide"),
  "overhead-press": approvedAsset("overhead-press"),
  "hamstring-stretch": approvedAsset("hamstring-stretch"),
  "hip-flexor-stretch": approvedAsset("hip-flexor-stretch"),
  "band-pull-apart": approvedAsset("band-pull-apart"),
  "wall-squat": approvedAsset("wall-squat"),
  "supported-split-squat": approvedAsset("supported-split-squat"),
  "shoulder-mobility": approvedAsset("shoulder-mobility"),
  "lat-pulldown": pendingAsset(),
  "dead-bug": pendingAsset(),
  "side-plank": pendingAsset(),
  "mountain-climber": pendingAsset(),
  "high-knees": pendingAsset(),
  burpee: pendingAsset(),
  "hip-flow-90-90": pendingAsset(),
  "childs-pose-side-reach": pendingAsset(),
  "ankle-rocks": pendingAsset(),
  "triceps-pushdown": pendingAsset(),
  "biceps-curl": pendingAsset(),
  "lateral-raise": pendingAsset(),
  "calf-raise": pendingAsset(),
  "hip-thrust": pendingAsset()
};

export function getReviewedMediaAsset(key) {
  const entry = REVIEWED_MEDIA[key];
  if (!entry || entry.status !== MEDIA_REVIEW_STATUSES.APPROVED) {
    return null;
  }
  return entry;
}

export function getMediaReviewStatus(key) {
  return REVIEWED_MEDIA[key] || pendingAsset();
}

function approvedAsset(assetName) {
  const src = `/movements/${assetName}.svg`;
  return {
    status: MEDIA_REVIEW_STATUSES.APPROVED,
    reviewSource: "owned_reference_illustration",
    image: src,
    thumbnail: src,
    images: [src, src, src, src],
    approvedAt: "2026-04-21"
  };
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
