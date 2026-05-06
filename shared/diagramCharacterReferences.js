// DO NOT MODIFY WITHOUT EXPLICIT APPROVAL
// Locked diagram-style character references for anatomical visual generation

export const DIAGRAM_CHARACTER_REFERENCES = {
  male_anatomical_v1: {
    displayName: "Locked Male Anatomical Guide Character",
    referenceType: "thread_attachment",
    sourceThreadDate: "2026-04-27",
    visualStyle: "fitwill_style_anatomical_diagram",
    lockedTraits: [
      "monochrome semi-realistic anatomical figure",
      "smooth grayscale body rendering",
      "minimal facial detail",
      "neutral expression",
      "black shorts only",
      "high-contrast red/orange muscle highlights",
      "clean white background",
      "simple bench and dumbbell design",
      "non-photorealistic instructional diagram look"
    ],
    usageRules: [
      "use as the male diagram-style character anchor for future anatomical sequences",
      "preserve the same simplified figure proportions and rendering style",
      "do not introduce photorealistic skin, face detail, or environmental styling"
    ]
  },
  female_anatomical_v1: {
    displayName: "Locked Female Anatomical Guide Character",
    referenceType: "generated_image",
    sourceThreadDate: "2026-04-27",
    visualStyle: "fitwill_style_anatomical_diagram",
    generatedImagePath:
      "C:/Users/j_wor/.codex/generated_images/019dc14d-76fc-7610-8d72-606fcc096470/ig_0f417167c1d00b8a0169f02283c830819b977cf3e3b19206ea.png",
    lockedTraits: [
      "same monochrome anatomical guide style as the locked male character",
      "same grayscale rendering language",
      "same minimal facial detail",
      "same high-contrast red/orange muscle highlight treatment",
      "female body proportions with the same instructional diagram style",
      "clean white background",
      "non-photorealistic anatomical rendering"
    ],
    usageRules: [
      "use as the female diagram-style character anchor for future anatomical sequences",
      "preserve the same simplified figure proportions and rendering style",
      "do not introduce photorealistic skin, face detail, or environmental styling"
    ]
  }
};

export function getDiagramCharacterReference(key) {
  const normalizedKey = String(key || "").trim();
  return DIAGRAM_CHARACTER_REFERENCES[normalizedKey] || null;
}
