import React from "react";
import Panel from "../components/Panel";
import UpgradePrompt from "../components/UpgradePrompt";
import { BarChart, LineChart } from "../components/SimpleChart";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { useAuth } from "../state/AuthContext";

export default function ProgressPage() {
  const { user, isPremium } = useAuth();
  const { data, summary, loading, mutate } = useDashboardData();
  const { busy: checkoutBusy, startUpgradeCheckout } = useUpgradeCheckout();
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const dismissalKey = React.useMemo(
    () => `pulsepeak-dismissed-progress-upgrade:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(true);

  React.useEffect(() => {
    setShowUpgradePrompt(window.localStorage.getItem(dismissalKey) !== "true");
  }, [dismissalKey]);

  if (loading || !data || !summary) {
    return <div className="screen-center">Loading progress...</div>;
  }

  const bestStreak = summary.habits.reduce((best, habit) => Math.max(best, habit.streak), 0);
  const weeklyCheckIn = summary.weeklyCheckIn;
  const latestCheckIn = weeklyCheckIn?.latestCheckIn;
  const progressUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "progress",
        profile: data.profile,
        activeModules: summary.activeModules || [],
        summary
      });

  const dismissUpgradePrompt = () => {
    window.localStorage.setItem(dismissalKey, "true");
    setShowUpgradePrompt(false);
  };

  const handleUpgrade = async (billingInterval = "monthly", checkoutMode = "default") => {
    setError("");
    try {
      await startUpgradeCheckout(billingInterval, checkoutMode);
    } catch (upgradeError) {
      setError(upgradeError.message);
    }
  };

  const submitWeeklyCheckIn = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setStatus("");
    setError("");
    try {
      await mutate("/weekly-check-in", {
        method: "POST",
        body: JSON.stringify({
          weekKey: weeklyCheckIn?.currentWeekKey,
          weekFeel: form.get("weekFeel"),
          recoveryFeel: form.get("recoveryFeel"),
          planDifficulty: form.get("planDifficulty"),
          nutritionAdherence: form.get("nutritionAdherence"),
          sorenessIssues: form.get("sorenessIssues"),
          confidence: form.get("confidence")
        })
      });
      setStatus("Weekly check-in saved.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-grid">
      {error ? <div className="status-banner">{error}</div> : null}
      {status ? <div className="status-banner">{status}</div> : null}

      <Panel eyebrow="Progress overview" title="See whether the week is actually moving forward">
        <div className="content-grid">
          <div className="module-note">
            <strong>{summary.completion}% current completion</strong>
            <p className="muted">Your daily score pulls training, recovery, hydration, and nutrition into one signal so progress feels connected instead of scattered.</p>
          </div>
          <div className="module-note">
            <strong>{bestStreak} day best streak</strong>
            <p className="muted">Habit streaks and weekly-score history show whether your routine is becoming easier to repeat and trust.</p>
          </div>
        </div>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Weekly check-in" title={weeklyCheckIn?.title || "Close the loop on your week"}>
          <div className="section-context">
            <span className="section-context-label">Reflect once a week</span>
            <p>{weeklyCheckIn?.summary || "A short reflection helps PulsePeak explain what changed and what the next week should tighten up."}</p>
          </div>
          <form className="stack-form" onSubmit={submitWeeklyCheckIn}>
            <div className="profile-grid">
              <label>
                How did the week feel?
                <select defaultValue={latestCheckIn?.weekFeel || "mixed"} name="weekFeel">
                  <option value="rough">Rough</option>
                  <option value="mixed">Mixed</option>
                  <option value="strong">Strong</option>
                </select>
              </label>
              <label>
                Energy / recovery
                <select defaultValue={latestCheckIn?.recoveryFeel || "steady"} name="recoveryFeel">
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Plan difficulty
                <select defaultValue={latestCheckIn?.planDifficulty || "right"} name="planDifficulty">
                  <option value="too_easy">Too easy</option>
                  <option value="right">About right</option>
                  <option value="too_hard">Too hard</option>
                </select>
              </label>
              <label>
                Nutrition felt
                <select defaultValue={latestCheckIn?.nutritionAdherence || "mostly_on"} name="nutritionAdherence">
                  <option value="off_track">Off track</option>
                  <option value="mostly_on">Mostly on track</option>
                  <option value="locked_in">Locked in</option>
                </select>
              </label>
              <label>
                Soreness / joint issues
                <select defaultValue={latestCheckIn?.sorenessIssues || "manageable"} name="sorenessIssues">
                  <option value="none">None</option>
                  <option value="manageable">Manageable</option>
                  <option value="significant">Significant</option>
                </select>
              </label>
              <label>
                Confidence for next week
                <select defaultValue={latestCheckIn?.confidence || "steady"} name="confidence">
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Saving..." : weeklyCheckIn?.submittedThisWeek ? "Update weekly check-in" : "Save weekly check-in"}
            </button>
          </form>
        </Panel>

        <Panel eyebrow="Check-in summary" title="What the app is taking from this week">
          <div className="module-note">
            <strong>{weeklyCheckIn?.todayConnection || "Today and next week should stay connected through one clear adjustment."}</strong>
            <p className="support-copy">
              {isPremium ? weeklyCheckIn?.premiumSummary : weeklyCheckIn?.freeSummary}
            </p>
          </div>
          <div className="content-grid">
            <div className="module-note">
              <strong>What went well</strong>
              {weeklyCheckIn?.whatWentWell?.length ? (
                <ul className="plan-list">
                  {weeklyCheckIn.whatWentWell.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">Complete a weekly check-in to turn the week into clearer progress notes.</p>
              )}
            </div>
            <div className="module-note">
              <strong>Needs tightening</strong>
              {weeklyCheckIn?.needsTightening?.length ? (
                <ul className="plan-list">
                  {weeklyCheckIn.needsTightening.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">PulsePeak will show what needs tightening once the week has a little more feedback behind it.</p>
              )}
            </div>
          </div>
          <div className="module-note">
            <strong>What changes next week</strong>
            {weeklyCheckIn?.nextWeekAdjustments?.length ? (
              <ul className="plan-list">
                {weeklyCheckIn.nextWeekAdjustments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="support-copy">The next week's changes will appear here after your check-in is saved.</p>
            )}
          </div>
          {isPremium && weeklyCheckIn?.premiumReasoning ? (
            <div className="module-note">
              <strong>Premium adjustment reasoning</strong>
              <p className="support-copy">{weeklyCheckIn.premiumReasoning}</p>
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="content-grid">
        <Panel eyebrow="Weekly score" title="Adherence chart">
          <BarChart points={summary.weeklyHistory} />
        </Panel>

        <Panel eyebrow="Weight trend" title="7-day bodyweight view">
          <LineChart
            max={Math.max(...data.weightHistory.map((point) => point.weight)) + 1}
            min={Math.min(...data.weightHistory.map((point) => point.weight)) - 1}
            points={data.weightHistory}
            suffix=" lb"
            valueKey="weight"
          />
        </Panel>
      </div>

      <Panel eyebrow="Streaks" title="Habit consistency">
        <div className="insight-list">
          {summary.habits.map((habit) => (
            <div className="insight-chip" key={habit.id}>
              <strong>{habit.name}</strong>
              <p className="muted">
                {habit.streak} day streak / target {habit.target}
              </p>
            </div>
          ))}
          <div className="insight-chip">
            <strong>Best streak</strong>
            <p className="muted">{bestStreak} consecutive days</p>
          </div>
        </div>
      </Panel>

      {!isPremium && showUpgradePrompt && progressUpgradePrompt ? (
        <UpgradePrompt prompt={progressUpgradePrompt} busy={checkoutBusy} onDismiss={dismissUpgradePrompt} onUpgrade={handleUpgrade} />
      ) : null}
    </div>
  );
}
