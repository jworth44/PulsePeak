export const VISUAL_MOVEMENT_CATEGORIES = ["strength", "mobility", "yoga", "stretch", "rehab", "recovery", "cardio"];

export const VISUAL_QUALITY_GATE_STATUSES = {
  GENERATED: "generated",
  REVIEW_REQUIRED: "review_required",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const VISUAL_STYLE_LOCK = "anatomical_diagram";

export const VISUAL_GENERATION_STYLES = {
  REALISTIC_PHOTO: "realistic_photo",
  ANATOMICAL_SEQUENCE: "anatomical_sequence"
};

export const DIAGRAM_STYLE_RULES = {
  type: "fitness_instructional_diagram",
  bodyStyle: "semi-realistic anatomical",
  faceDetail: "minimal",
  realism: "non-photorealistic",
  background: "plain light",
  lighting: "flat even",
  environment: "none",
  muscleHighlight: "red_orange_high_contrast",
  equipmentStyle: "simple_clean_shapes"
};

export const VISUAL_REJECTION_REASONS = [
  "wrong body/model",
  "wrong exercise",
  "wrong equipment",
  "wrong movement category",
  "distorted anatomy",
  "repeated poses",
  "poor lighting",
  "not PulsePeak branded",
  "unrealistic image"
];

export const VISUAL_MEDIA_PATHS = {
  reviewPublicRoot: "public/media/review",
  reviewTempRoot: "temp/review",
  reviewAnatomicalRoot: "temp/review/anatomical",
  finalExerciseRoot: "public/media/exercises"
};

export const VISUAL_GENERATION_GUARDRAILS = {
  reviewFirstRequired: true,
  directExerciseMediaWritesAllowed: false,
  autoApprovalAllowed: false,
  referenceOverwriteAllowed: false,
  finalWiringRequiresApprovedStatus: true
};

export const VISUAL_GENERATION_RULES = {
  strength: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "correct exercise-specific equipment only",
      "simple clean equipment shapes"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "strong joint clarity",
      "biomechanically correct strength movement setup"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  mobility: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "mat only when the movement requires it",
      "simple support tools only when explicitly required"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "emphasize joint motion clarity",
      "controlled range-of-motion sequence"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  yoga: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "clean mat positioning",
      "simple props only when explicitly required"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "controlled posture",
      "clear position readability"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  stretch: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "mat only when the stretch requires it",
      "simple support tools only when explicitly required"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "relaxed positions",
      "clear stretch target presentation"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  rehab: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "simple rehab-specific equipment only when explicitly required",
      "simple clean support shapes"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "clinical movement clarity",
      "joint-friendly rehab presentation"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  recovery: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "simple rehab-specific equipment only when explicitly required",
      "simple clean support shapes"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "clinical movement clarity",
      "joint-friendly rehab presentation"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  },
  cardio: {
    requiredEnvironment: "no environment styling, plain light background, flat even diagram presentation",
    allowedEquipment: [
      "correct cardio equipment only when required",
      "simplified equipment shapes"
    ],
    clothingRules: [
      "diagram style only",
      "non-photorealistic figure styling"
    ],
    poseMovementStyle: [
      "diagram style only",
      "simplified equipment shapes",
      "athletic movement clarity"
    ],
    bannedElements: [
      "gym background",
      "lighting effects",
      "realistic rendering",
      "depth or shadows"
    ]
  }
};

export const VISUAL_STYLE_RULES = {
  [VISUAL_GENERATION_STYLES.REALISTIC_PHOTO]: {
    subjectStyle: [
      "fitness instructional diagram",
      "clean anatomical style similar to professional workout guide illustrations",
      "non-photorealistic human presentation"
    ],
    identityRules: [
      "no realistic face identity",
      "no photorealistic human styling"
    ],
    bannedElements: [
      "realistic human face",
      "photographic lighting",
      "detailed skin texture",
      "duplicate poses"
    ]
  },
  [VISUAL_GENERATION_STYLES.ANATOMICAL_SEQUENCE]: {
    subjectStyle: [
      "clean anatomical figure",
      "diagram-style movement education",
      "clear 4 to 5 position sequence",
      "best for first-pass exercise education"
    ],
    identityRules: [
      "no realistic face identity",
      "no gender-specific model required",
      "simplified non-photoreal figure presentation"
    ],
    environmentRules: [
      "clean white or light background",
      "no gym background required unless it helps explain the setup"
    ],
    muscleHighlightRules: [
      "active muscles highlighted in red and orange",
      "movement mechanics visually prioritized over visual realism"
    ],
    bannedElements: [
      "fake AI photography",
      "photorealistic face",
      "identity-specific facial detail",
      "dark cluttered scene"
    ]
  }
};

export function normalizeVisualMovementCategory(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return VISUAL_MOVEMENT_CATEGORIES.includes(normalized) ? normalized : null;
}

export function resolveVisualGenerationRule(category) {
  return VISUAL_GENERATION_RULES[normalizeVisualMovementCategory(category) || "strength"];
}

export function normalizeVisualGenerationStyle(value) {
  return VISUAL_GENERATION_STYLES.ANATOMICAL_SEQUENCE;
}

export function resolveVisualStyleRule(style) {
  return VISUAL_STYLE_RULES[normalizeVisualGenerationStyle(style)];
}

export function canApprovedVisualBeWired(status) {
  return status === VISUAL_QUALITY_GATE_STATUSES.APPROVED;
}
