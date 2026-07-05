import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <p className="section-label">Error 404</p>
        <h1>This page took a rest day.</h1>
        <p className="support-copy">
          The page you're looking for doesn't exist or has moved. Let's get you back to your training.
        </p>
        <div className="not-found-actions">
          <Link className="primary-button" to="/">Back to dashboard</Link>
          <Link className="secondary-button" to="/help">Visit Help Center</Link>
        </div>
      </div>
    </div>
  );
}
