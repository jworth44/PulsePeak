import React from "react";

export default function MetricCard({ label, value, hint, accent, action }) {
  return (
    <article className={`panel metric-card accent-${accent}`}>
      <p className="section-label">{label}</p>
      <h3>{value}</h3>
      <p className="muted">{hint}</p>
      {action}
    </article>
  );
}
