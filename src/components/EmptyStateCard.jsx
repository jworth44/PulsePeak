import React from "react";
import { Link } from "react-router-dom";

export default function EmptyStateCard({ title, description, ctaLabel, ctaTo, children, className = "" }) {
  const classes = ["empty-state-card", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <strong>{title}</strong>
      <p className="support-copy">{description}</p>
      <div className="module-card-actions">
        <Link className="primary-button module-link" to={ctaTo}>
          {ctaLabel}
        </Link>
        {children}
      </div>
    </div>
  );
}
