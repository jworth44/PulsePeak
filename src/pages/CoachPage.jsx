import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { useAuth } from "../state/AuthContext";

export default function CoachPage() {
  const { token, user, isPremium, dashboard } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const dismissalKey = React.useMemo(
    () => `pulsepeak-dismissed-coach-upgrade:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const { busy: checkoutBusy, startUpgradeCheckout } = useUpgradeCheckout();

  useEffect(() => {
    apiRequest("/coaching", {}, token)
      .then(setData)
      .catch((loadError) => setError(loadError.message));
  }, [token]);

  useEffect(() => {
    setShowUpgradePrompt(window.localStorage.getItem(dismissalKey) !== "true");
  }, [dismissalKey]);

  if (error) {
    return <div className="screen-center">{error}</div>;
  }

  if (!data) {
    return <div className="screen-center">Loading coaching...</div>;
  }

  if (!data.coach || !data.coach.primaryInsight) {
    return <div className="screen-center">Your coaching view is being prepared. Check back shortly.</div>;
  }

  const recoveryFocus = data.recoveryFocus || {};
  const coachNextActions = data.coach.nextActions || [];
  const coachNotes = data.notes || [];

  const coachUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "coach",
        profile: dashboard?.profile,
        activeModules: dashboard?.summary?.activeModules || [],
        coach: data.coach,
        summary: dashboard?.summary
      });

  const dismissUpgradePrompt = () => {
    window.localStorage.setItem(dismissalKey, "true");
    setShowUpgradePrompt(false);
  };

  const handleUpgrade = async (billingInterval = "monthly", checkoutMode = "default") => {
    try {
      await startUpgradeCheckout(billingInterval, checkoutMode);
    } catch (upgradeError) {
      setError(upgradeError.message);
    }
  };

  return (
    <div className="page-grid editorial-sections">
      {/* Editorial opener (Craftsmanship): the coach's single clearest read
          IS the page — no explainer panel, no box around the thought. */}
      <section className="progress-pride coach-opener" data-reveal>
        <p className="progress-pride-eyebrow">
          {isPremium ? "Your coach · premium reasoning" : "Your coach · read from your real training"}
        </p>
        <h2 className="progress-pride-title">{data.coach.primaryInsight.title}</h2>
        <p className="progress-pride-copy">{data.coach.primaryInsight.detail}</p>
        <p className="coach-why-line">
          <strong>Why it matters</strong> — {data.coach.whyItMatters}
        </p>
      </section>

      {/* With sparse actions (zero-data state) the 2-col split leaves the
          left column short beside a much taller right column — a dead void.
          Collapse to one column until there are enough actions to balance. */}
      <div className={`content-grid${coachNextActions.length < 2 ? " content-grid-single" : ""}`}>
        <Panel eyebrow="Next actions" title="Do these next">
          <div className="coach-action-list">
            {/* An "Action" card must act: cards with a route are links. */}
            {coachNextActions.map((action) =>
              action.to ? (
                <Link className="coach-action-card coach-action-card-link" key={action.title} to={action.to}>
                  <span className="focus-step">Action</span>
                  <strong>{action.title}</strong>
                  <p className="muted">{action.detail}</p>
                  <span aria-hidden="true" className="coach-action-go">Go →</span>
                </Link>
              ) : (
                <article className="coach-action-card" key={action.title}>
                  <span className="focus-step">Action</span>
                  <strong>{action.title}</strong>
                  <p className="muted">{action.detail}</p>
                </article>
              )
            )}
          </div>
        </Panel>

        <Panel eyebrow="Longer-term pattern" title="What the coach is noticing">
          <div className="coach-notes">
            <div className="module-note">
              <strong>{data.coach.longerTermNote}</strong>
              <p className="muted">{data.coach.planConnection}</p>
            </div>
            <div className="insight-list">
              <div className="insight-chip">
                <strong>Energy</strong>
                <p className="muted">{recoveryFocus.energyLevel ?? "Not logged yet"}</p>
              </div>
              <div className="insight-chip">
                <strong>Sleep</strong>
                <p className="muted">
                  {typeof recoveryFocus.sleepHours === "number"
                    ? `${recoveryFocus.sleepHours} hours`
                    : "Not logged yet"}
                </p>
              </div>
              <div className="insight-chip">
                <strong>Top habit</strong>
                <p className="muted">{recoveryFocus.topHabit ?? "No streak yet"}</p>
              </div>
            </div>
            {isPremium ? (
              <div className="coach-deeper-reasoning">
                <span className="focus-step">Premium depth</span>
                <p className="muted">Premium coaching connects your current gaps, recovery pattern, and weekly-plan logic into one clearer explanation.</p>
              </div>
            ) : null}
            <div className="coach-note-list">
              {coachNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {!isPremium && showUpgradePrompt && coachUpgradePrompt ? (
        <UpgradePrompt prompt={coachUpgradePrompt} busy={checkoutBusy} onDismiss={dismissUpgradePrompt} onUpgrade={handleUpgrade} />
      ) : null}
    </div>
  );
}
