import React from "react";

const EFFECTIVE_DATE = "[EFFECTIVE_DATE]";
const COMPANY = "[COMPANY_LEGAL_NAME]";
const CONTACT_EMAIL = "[SUPPORT_CONTACT_EMAIL]";
const JURISDICTION = "[GOVERNING_JURISDICTION]";

export default function TermsPage() {
  return (
    <article className="legal-doc">
      <p className="legal-review-note">
        Draft for review — {COMPANY} should confirm these terms with legal counsel and replace the
        bracketed placeholders before public launch.
      </p>
      <p className="section-label">Legal</p>
      <h1>Terms of Service</h1>
      <p className="muted">Effective date: {EFFECTIVE_DATE}</p>

      <p>
        These Terms of Service ("Terms") govern your use of the PulsePeak application and website (the
        "Service") provided by {COMPANY} ("PulsePeak", "we", "us"). By creating an account or using the
        Service, you agree to these Terms.
      </p>

      <h2>1. Health &amp; fitness disclaimer</h2>
      <p>
        PulsePeak provides general fitness, nutrition, and wellness information and tools. It is
        <strong> not medical advice</strong> and is not a substitute for professional medical guidance.
        Consult a qualified physician before beginning any exercise or nutrition program, especially if
        you have a medical condition or injury. You use the Service and perform any exercise at your own
        risk. Stop and seek medical attention if you experience pain, dizziness, or discomfort.
      </p>

      <h2>2. Eligibility &amp; accounts</h2>
      <p>
        You must be at least 13 years old (or the minimum age in your jurisdiction) to use the Service.
        You are responsible for keeping your account credentials secure and for all activity under your
        account. Provide accurate information and keep it up to date.
      </p>

      <h2>3. Subscriptions &amp; billing</h2>
      <ul>
        <li>PulsePeak offers free and paid subscription tiers. Paid features are billed through Stripe.</li>
        <li>Subscriptions renew automatically at the end of each billing period unless canceled before renewal.</li>
        <li>You can cancel at any time; access continues until the end of the current paid period. Except where required by law, payments are non-refundable.</li>
        <li>Prices, trial terms, and features are shown at the point of purchase and may change on a prospective basis.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to misuse the Service, including by attempting to:</p>
      <ul>
        <li>access accounts or data that are not yours, or breach security;</li>
        <li>reverse engineer, scrape, or disrupt the Service;</li>
        <li>use the Service for unlawful purposes or to infringe others' rights.</li>
      </ul>

      <h2>5. Your content</h2>
      <p>
        You retain ownership of the data you enter (workouts, notes, progress). You grant us a limited
        license to store and process it solely to operate and improve the Service for you, as described
        in our Privacy Policy.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The Service, including its software, design, content, and trademarks, is owned by {COMPANY} or
        its licensors and is protected by law. We grant you a limited, non-exclusive, non-transferable
        license to use the Service for personal, non-commercial purposes.
      </p>

      <h2>7. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or terminate
        access if you violate these Terms or use the Service in a way that could cause harm or legal
        liability.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided "as is" and "as available" without warranties of any kind, whether
        express or implied, including fitness for a particular purpose and non-infringement, to the
        fullest extent permitted by law.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {COMPANY} will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any loss of data, arising from
        your use of the Service.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of {JURISDICTION}, without regard to its conflict-of-laws
        rules.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes take
        effect constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms? Contact us at {CONTACT_EMAIL}.</p>
    </article>
  );
}
