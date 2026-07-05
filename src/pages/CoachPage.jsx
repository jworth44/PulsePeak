import React, { useEffect, useState } from "react";
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
    <div className="page-grid">
      <Panel eyebrow="Coach summary" title="Use the coach to decide what matters most next">
        <div className="module-note">
          <strong>{isPremium ? "Premium coaching is active." : "Your core coaching view is active."}</strong>
          <p className="muted">
            {isPremium
              ? "You are seeing deeper cause-and-effect reasoning tied to your weekly plan, recovery pattern, and current gaps."
              : "You are seeing the clearest daily guidance first. Premium adds deeper reasoning behind the next move."}
          </p>
        </div>
      </Panel>

      <Panel eyebrow="Coach engine" title="What matters most right now">
        <section className={`coach-hero coach-${data.coach.primaryInsight.category}`}>
          <div className="coach-hero-copy">
            <p className="badge">{isPremium ? "Premium reasoning" : "Daily coaching"}</p>
            <h3>{data.coach.primaryInsight.title}</h3>
            <p className="coach-detail">{data.coach.primaryInsight.detail}</p>
          </div>
          <div className="coach-why-block">
            <span className="focus-step">Why it matters</span>
            <p>{data.coach.whyItMatters}</p>
          </div>
        </section>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Next actions" title="Do these next">
          <div className="coach-action-list">
            {coachNextActions.map((action) => (
              <article className="coach-action-card" key={action.title}>
                <span className="focus-step">Action</span>
                <strong>{action.title}</strong>
                <p className="muted">{action.detail}</p>
              </article>
            ))}
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
                <p className="muted">{recoveryFocus.energyLevel ?? "Not logged"}</p>
              </div>
              <div className="insight-chip">
                <strong>Sleep</strong>
                <p className="muted">{recoveryFocus.sleepHours ?? "--"} hours</p>
              </div>
              <div className="insight-chip">
                <strong>Top habit</strong>
                <p className="muted">{recoveryFocus.topHabit ?? "Not set"}</p>
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
