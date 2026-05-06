import { EXERCISE_IMAGE_VERSION } from "../config/exerciseImages.js";

export function getExerciseImageSrc(src) {
  const normalizedSrc = String(src || "").trim();
  if (!normalizedSrc) {
    return "";
  }

  const separator = normalizedSrc.includes("?") ? "&" : "?";
  return `${normalizedSrc}${separator}v=${EXERCISE_IMAGE_VERSION}`;
}
