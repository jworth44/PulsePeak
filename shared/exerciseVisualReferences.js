// DO NOT MODIFY WITHOUT EXPLICIT APPROVAL
// Locked exercise-specific visual references for PulsePeak generation
// These references define the approved style anchor for specific movements

export const EXERCISE_VISUAL_REFERENCES = {
  "incline-dumbbell-press--incline-dumbbell-press": {
    displayName: "Incline Dumbbell Press",
    referenceType: "thread_attachment",
    visualStyle: "photo_sequence_reference",
    sourceThreadDate: "2026-04-27",
    lockedUse: [
      "identity and body proportion anchor",
      "camera angle anchor",
      "bench and dumbbell design anchor",
      "5-step movement sequence anchor",
      "outfit and environment direction anchor"
    ],
    doNotCopyDirectly: [
      "embedded text",
      "panel labels",
      "instruction captions",
      "composite layout chrome"
    ],
    sequenceReference: [
      "setup",
      "start position",
      "lowering phase",
      "bottom position",
      "press / finish"
    ],
    productionTarget: "clean no-text derivative for future generation workflows"
  }
};

export function getExerciseVisualReference(detailId) {
  const normalizedDetailId = String(detailId || "").trim();
  return EXERCISE_VISUAL_REFERENCES[normalizedDetailId] || null;
}
