import React from "react";

const EFFECTIVE_DATE = "[EFFECTIVE_DATE]";
const COMPANY = "[COMPANY_LEGAL_NAME]";
const CONTACT_EMAIL = "[PRIVACY_CONTACT_EMAIL]";

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-doc">
      <p className="legal-review-note">
        Draft for review — {COMPANY} should confirm this policy with legal counsel and replace the
        bracketed placeholders before public launch.
      </p>
      <p className="section-label">Legal</p>
      <h1>Privacy Policy</h1>
      <p className="muted">Effective date: {EFFECTIVE_DATE}</p>

      <p>
        This Privacy Policy explains how {COMPANY} ("PulsePeak", "we", "us") collects, uses, and
        protects information when you use the PulsePeak application and website (the "Service"). By
        using the Service you agree to the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account information</strong> — your name, email address, and password (stored only as a secure hash).</li>
        <li><strong>Fitness profile</strong> — goals, experience level, training environment, equipment, height, weight, birthdate, injury status, and preferences you provide during onboarding.</li>
        <li><strong>Activity data</strong> — workouts logged, habits, nutrition entries, weekly check-ins, and progress you record in the app.</li>
        <li><strong>Payment information</strong> — if you subscribe, payments are processed by Stripe. We do not store your full card number; we receive limited billing status (e.g., plan, renewal date) from Stripe.</li>
        <li><strong>Technical data</strong> — basic device/browser information and, where enabled, privacy-friendly usage analytics and crash diagnostics used to keep the Service reliable.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To provide and personalize your workouts, weekly plan, nutrition, recovery, and progress features.</li>
        <li>To create and secure your account and process subscriptions.</li>
        <li>To improve the Service, diagnose issues, and prevent abuse.</li>
        <li>To communicate service-related updates (we do not sell your personal data).</li>
      </ul>

      <h2>3. How information is shared</h2>
      <p>
        We share information only with service providers that help us operate the Service — for
        example our hosting provider, Stripe (payments), and any analytics/crash-reporting provider
        we enable. These providers may only use the data to perform services for us. We may disclose
        information if required by law or to protect the rights and safety of our users.
      </p>

      <h2>4. Cookies and similar technologies</h2>
      <p>
        We use a small amount of local storage to keep you signed in and remember preferences. Where
        analytics are enabled we use privacy-friendly, cookieless measurement where possible. You can
        clear local storage through your browser at any time.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep your account and activity data while your account is active. You may request deletion
        of your account and associated data by contacting us; we will delete or anonymize it within a
        reasonable period, except where retention is required by law.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on where you live (including under the GDPR and CCPA/CPRA), you may have rights to
        access, correct, export, or delete your personal data, and to object to or restrict certain
        processing. To exercise these rights, contact us at {CONTACT_EMAIL}.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard safeguards including encrypted transport (HTTPS), hashed passwords,
        and restricted access. No method of transmission or storage is completely secure, but we work
        to protect your information.
      </p>

      <h2>8. Children's privacy</h2>
      <p>
        The Service is not directed to children under 13 (or the minimum age required in your
        jurisdiction). We do not knowingly collect personal information from children.
      </p>

      <h2>9. International users</h2>
      <p>
        Your information may be processed in countries other than your own. We take steps to ensure it
        remains protected in accordance with this policy.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by updating the
        effective date above and, where appropriate, notifying you in the app.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this policy or your data? Contact us at {CONTACT_EMAIL}.
      </p>
    </article>
  );
}
