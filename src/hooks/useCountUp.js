import { useEffect, useRef, useState } from "react";

// Animate a number from a start value up to `value`, so stats feel alive instead
// of snapping into place. Uses requestAnimationFrame with an ease-out curve
// matched to the design system's `--dur-count` (900ms). Respects
// prefers-reduced-motion (jumps straight to the final value), and re-animates
// when `value` changes.
//
// Returns the current animated number. Format it at the call site (rounding,
// units, tabular-nums) so this stays presentation-agnostic.

const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out, matches --ease-out feel

export function useCountUp(value, { duration = 900, startFrom = 0, decimals = 0 } = {}) {
  const target = Number.isFinite(value) ? value : 0;
  // Start the visible value at `startFrom` (not the target) so the very first
  // paint shows the start of the animation, never a flash of the final number.
  const [display, setDisplay] = useState(startFrom);
  const frameRef = useRef(null);
  const fromRef = useRef(startFrom);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce || duration <= 0 || target === fromRef.current) {
      setDisplay(target);
      fromRef.current = target;
      return undefined;
    }

    // If the tab is hidden, requestAnimationFrame is paused and the number would
    // stick at the start value — worse than no animation. Snap straight to the
    // target instead.
    if (typeof document !== "undefined" && document.hidden) {
      setDisplay(target);
      fromRef.current = target;
      return undefined;
    }

    const from = fromRef.current;
    const delta = target - from;
    let startTs = null;
    const factor = Math.pow(10, decimals);

    const tick = (ts) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / duration);
      const raw = from + delta * easeOut(progress);
      setDisplay(Math.round(raw * factor) / factor);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    // Safety net: if rAF is throttled/paused mid-flight (backgrounded, slow
    // device), force the final value shortly after the intended duration so the
    // real number always lands. Harmless when the animation finishes normally.
    const safety = setTimeout(() => {
      setDisplay(target);
      fromRef.current = target;
    }, duration + 250);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, decimals]);

  return display;
}
