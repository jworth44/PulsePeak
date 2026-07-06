// Lightweight haptic feedback for key emotional beats (workout complete, PR,
// habit done). Uses the Vibration API where available (Android/Chrome); silently
// no-ops on iOS Safari and desktop, and respects the user's reduced-motion
// preference. Never throws — feedback is a nicety, not a dependency.

const PATTERNS = {
  tap: 10, //            a single crisp tick (button / habit toggle)
  success: [16, 40, 24], // completion — short double pulse
  celebrate: [24, 40, 24, 40, 48], // PR / milestone — a little flourish
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function haptic(kind = "tap") {
  try {
    if (prefersReducedMotion()) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(PATTERNS[kind] ?? PATTERNS.tap);
  } catch {
    // Vibration unsupported / blocked — feedback is optional.
  }
}
