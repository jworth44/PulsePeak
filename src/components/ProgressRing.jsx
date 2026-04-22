import React from "react";

const CIRCUMFERENCE = 302;

export default function ProgressRing({ value }) {
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <div className="progress-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r="48" />
        <circle className="ring-value" cx="60" cy="60" r="48" style={{ strokeDashoffset: offset }} />
      </svg>
      <div className="ring-center">
        <strong>{value}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}
