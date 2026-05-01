import React from "react";
import { BILLING_OPTIONS, TRIAL_MODEL } from "../config/monetization";
import { useAuth } from "../state/AuthContext";

export default function UpgradePrompt({ prompt, onUpgrade, onDismiss, busy = false, compact = false }) {
  const { user, accessTier, dashboard } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState("yearly");
  if (!prompt) {
    return null;
  }

  const pricingModel = dashboard?.pricingModel;
  const billingEnabled = pricingModel?.billingEnabled === true;
  const billingOptions = BILLING_OPTIONS.map((option) => {
    const liveOption = pricingModel?.[option.id];
    return {
      ...option,
      priceLabel: liveOption?.cadenceLabel || option.priceLabel,
      helper: liveOption?.helper || option.helper
    };
  });
  const canStartTrial = Boolean(user?.canStartTrial);
  const trialEndsLabel = user?.trialEndsLabel || null;
  const directPaidLabel = billingEnabled ? "Upgrade now" : "Coming soon";
  const primaryLabel = busy
    ? "Redirecting..."
    : !billingEnabled
      ? "Coming soon"
      : canStartTrial
      ? `Start ${TRIAL_MODEL.days}-day free trial`
      : selectedPlan === "yearly"
        ? "Upgrade now"
        : prompt.ctaLabel || "Upgrade now";

  return (
    <section className={`upgrade-prompt ${compact ? "upgrade-prompt-compact" : ""}`}>
      <div className="upgrade-prompt-copy">
        <p className="section-label">{prompt.eyebrow}</p>
        <h4>{prompt.title}</h4>
        <p className="support-copy upgrade-copy">{prompt.body}</p>
        {accessTier === "trial_active" && trialEndsLabel ? (
          <p className="support-copy upgrade-copy">
            Trial ends on {trialEndsLabel}. Then renews yearly at $119.99/year unless canceled before trial ends.
          </p>
        ) : null}
        {prompt.bullets?.length ? (
          <ul className="plan-list">
            {prompt.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        <div className="upgrade-tier-summary">
          <div className="upgrade-tier-card">
            <span className="section-label">Free</span>
            <strong>2 completed sessions in a rolling 7-day window</strong>
            <span className="support-copy">See the system, train a little, and feel where the real limit starts.</span>
          </div>
          <div className="upgrade-tier-card">
            <span className="section-label">7-day trial</span>
            <strong>Full access before billing starts</strong>
            <span className="support-copy">Keep your next 7 days connected. Then auto-renews yearly at $119.99/year unless canceled.</span>
          </div>
          <div className="upgrade-tier-card">
            <span className="section-label">Premium</span>
            <strong>Unlimited execution and continuity</strong>
            <span className="support-copy">Keep every session, every swap path, and the full week moving without interruption.</span>
          </div>
        </div>
        <div className="upgrade-pricing-grid">
          {billingOptions.map((option) => (
            <button
              key={option.id}
              className={`upgrade-pricing-card ${selectedPlan === option.id ? "upgrade-pricing-card-active" : ""}`}
              disabled={!billingEnabled}
              type="button"
              onClick={() => setSelectedPlan(option.id)}
            >
              <span className="section-label">{option.label}</span>
              <strong>{option.priceLabel}</strong>
              <span className="support-copy">{option.helper}</span>
            </button>
          ))}
        </div>
        {canStartTrial ? (
          <>
            <p className="support-copy upgrade-copy">{TRIAL_MODEL.summary}</p>
            <p className="support-copy upgrade-copy">{TRIAL_MODEL.support}</p>
          </>
        ) : (
          <p className="support-copy upgrade-copy">Upgrade to keep logging every session, keep your week connected, and continue training without limits.</p>
        )}
        {!billingEnabled ? (
          <p className="support-copy upgrade-copy">Billing is coming soon for this launch baseline.</p>
        ) : null}
      </div>
      <div className="upgrade-prompt-actions">
        <button className="primary-button" disabled={busy || !billingEnabled} type="button" onClick={() => onUpgrade?.(canStartTrial ? "yearly" : selectedPlan, canStartTrial ? "default" : "upgrade_now")}>
          {primaryLabel}
        </button>
        {canStartTrial ? (
          <button className="secondary-button" disabled={busy || !billingEnabled} type="button" onClick={() => onUpgrade?.(selectedPlan, "upgrade_now")}>
            {directPaidLabel}
          </button>
        ) : null}
        {onDismiss ? (
          <button className="ghost-button" type="button" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}
