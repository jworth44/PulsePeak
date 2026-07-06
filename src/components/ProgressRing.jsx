import React, { useEffect, useRef } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { haptic } from "../lib/haptics";

const CIRCUMFERENCE = 302;

export default function ProgressRing({ value }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const isComplete = clamped >= 100;
  // Count the center number up in lockstep with the ring drawing (--dur-ring 1200ms).
  const displayValue = useCountUp(clamped, { duration: 1200 });
  // Fire a single haptic the moment the ring reaches 100% (not on every render).
  const wasComplete = useRef(isComplete);
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      haptic("celebrate");
    }
    wasComplete.current = isComplete;
  }, [isComplete]);

  return (
    <div className={`progress-ring${isComplete ? " is-complete" : ""}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="pp-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d5f" />
            <stop offset="100%" stopColor="#d6172e" />
          </linearGradient>
          <linearGradient id="pp-ring-gradient-volt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8ff6b" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="60" cy="60" r="48" />
        <circle className="ring-value" cx="60" cy="60" r="48" style={{ strokeDashoffset: offset }} />
      </svg>
      <div className="ring-center">
        <strong style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(displayValue)}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}
