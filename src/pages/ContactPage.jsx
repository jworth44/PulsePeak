import React from "react";
import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "[SUPPORT_CONTACT_EMAIL]";

export default function ContactPage() {
  return (
    <article className="legal-doc">
      <p className="section-label">Support</p>
      <h1>Contact PulsePeak</h1>
      <p>
        We're here to help. For questions about your account, billing, or the app, reach out and we'll
        get back to you as soon as we can.
      </p>

      <h2>Email support</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>

      <h2>Help Center</h2>
      <p>
        Many questions are answered in our <Link to="/help">Help Center</Link>, including setup,
        workouts, nutrition, and subscription topics.
      </p>

      <h2>Billing &amp; subscriptions</h2>
      <p>
        You can manage or cancel your subscription from Settings inside the app. For billing questions,
        email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </article>
  );
}
