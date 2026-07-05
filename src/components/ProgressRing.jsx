import React from "react";

const CIRCUMFERENCE = 302;

export default function ProgressRing({ value }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const isComplete = clamped >= 100;

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
        <strong>{clamped}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}
