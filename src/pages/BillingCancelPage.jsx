import React from "react";
import { Link } from "react-router-dom";

export default function BillingCancelPage() {
  return (
    <section className="panel billing-panel">
      <p className="badge">Checkout canceled</p>
      <h3>Your account is still on the free plan.</h3>
      <p className="muted">Nothing changed in your account. You can keep using the dashboard, coach, progress, and weekly-plan preview, then upgrade later if the deeper adaptive layer feels worth it.</p>
      <div className="module-note">
        <strong>Free access is still intact.</strong>
        <p className="muted">You can keep logging meals, workouts, recovery, and habits while using the preview flow before deciding to upgrade.</p>
      </div>
      <div className="billing-actions">
        <Link className="primary-button" to="/">
          Return to dashboard
        </Link>
        <Link className="ghost-button" to="/coach">
          Open coach
        </Link>
      </div>
    </section>
  );
}
