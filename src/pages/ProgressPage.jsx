import React from "react";
import Panel from "../components/Panel";
import UpgradePrompt from "../components/UpgradePrompt";
import { BarChart, LineChart } from "../components/SimpleChart";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { useAuth } from "../state/AuthContext";
import { getPremiumCapabilitySummary, getPremiumComparisonSummary, getPremiumOutcomeLayer, hasFullWorkoutAccess } from "../../shared/entitlements";

export default function ProgressPage() {
  const { user, accessTier, workoutMemory, workoutMomentum, workoutMilestones } = useAuth();
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
  const hasProgressAccess = hasFullWorkoutAccess(accessTier);
  const progressInsights = [];
  const improvementSignals = {
    consistency: {
      label: "Consistency builds from completed sessions",
      detail: "Keep logging workouts and the progress view will fill in stronger trend signals over time."
    },
    variety: {
      label: "Variety is not being interpreted yet",
      detail: "Advanced variety analysis is deferred for now."
    },
    loadTolerance: {
      label: "Load tolerance is not being interpreted yet",
      detail: "Advanced load-tolerance analysis is deferred for now."
    }
  };
  const resultSignals = [];
  const performanceSignals = {
    summaryLine: "Performance interpretation is temporarily simplified",
    sessionLengthTrend: null,
    intensityTrend: null,
    frequencyTrend: null
  };
  const checkpoint = null;
  const identitySignal = null;
  const programPhase = null;
  const nextWeekAdjustment = null;
  const whyThisMattersNotes = [];
  const premiumOutcomeLayer = getPremiumOutcomeLayer(accessTier, { surface: "progress" });
  const premiumComparison = getPremiumComparisonSummary(accessTier, { surface: "progress" });
  const systemConfidenceSignal = null;
  const trustCue = null;
  const primarySignal = null;
  const visibleMilestone = checkpoint || workoutMilestones?.fresh || workoutMilestones?.latest || null;
  const progressUpgradePrompt = hasProgressAccess
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
            <strong>{workoutMomentum.currentStreakDays} day current streak</strong>
            <p className="muted">Training streak and recent activity now reflect actual completed sessions instead of a disconnected summary signal.</p>
          </div>
          <div className="module-note">
            <strong>{performanceSignals.summaryLine}</strong>
            {systemConfidenceSignal ? <p className="muted">{systemConfidenceSignal}</p> : null}
            {trustCue ? <p className="support-copy recommendation-context-note">{trustCue}</p> : null}
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Performance trend" title="How your training demand is moving">
        <div className="content-grid">
          <div className="module-note">
            <strong>Session length</strong>
            <p className="support-copy">{formatTrendLabel(performanceSignals.sessionLengthTrend)}</p>
          </div>
          <div className="module-note">
            <strong>Intensity mix</strong>
            <p className="support-copy">{formatTrendLabel(performanceSignals.intensityTrend)}</p>
          </div>
          <div className="module-note">
            <strong>Training frequency</strong>
            <p className="support-copy">{formatTrendLabel(performanceSignals.frequencyTrend)}</p>
          </div>
        </div>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Consistency" title="Recent momentum">
          <div className="insight-list">
            <div className="insight-chip">
              <strong>Current streak</strong>
              <p className="muted">{workoutMomentum.currentStreakDays} consecutive active day{workoutMomentum.currentStreakDays === 1 ? "" : "s"}</p>
            </div>
            <div className="insight-chip">
              <strong>Longest streak</strong>
              <p className="muted">{Math.max(workoutMomentum.longestStreakDays, bestStreak)} day{Math.max(workoutMomentum.longestStreakDays, bestStreak) === 1 ? "" : "s"}</p>
            </div>
            <div className="insight-chip">
              <strong>Sessions this week</strong>
              <p className="muted">{workoutMomentum.weeklyCompletionCount}</p>
            </div>
          </div>
        </Panel>

        <Panel eyebrow="Training insight" title="What the recent pattern suggests">
          {progressInsights.length ? (
            <div className="insight-list">
              {progressInsights.map((insight) => (
                <div className="insight-chip" key={insight.title}>
                  <strong>{insight.title}</strong>
                  <p className="muted">{insight.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="support-copy">Complete a few sessions and PulsePeak will surface simple balance, consistency, and recovery signals here.</p>
          )}
          {primarySignal ? (
            <div className="module-note">
              <strong>{primarySignal.title}</strong>
              <p className="support-copy">{primarySignal.detail}</p>
            </div>
          ) : null}
        </Panel>
      </div>

      <Panel eyebrow="Improvement signals" title="What is actually improving">
        <div className="content-grid">
          <div className="module-note">
            <strong>{improvementSignals.consistency.label}</strong>
            <p className="support-copy">{improvementSignals.consistency.detail}</p>
          </div>
          {hasProgressAccess ? (
            <>
              <div className="module-note">
                <strong>{improvementSignals.variety.label}</strong>
                <p className="support-copy">{improvementSignals.variety.detail}</p>
              </div>
              <div className="module-note">
                <strong>{improvementSignals.loadTolerance.label}</strong>
                <p className="support-copy">{improvementSignals.loadTolerance.detail}</p>
              </div>
            </>
          ) : (
            <div className="module-note">
              <strong>{premiumOutcomeLayer.title}</strong>
              <p className="support-copy">{premiumComparison.availableNow}</p>
              <p className="support-copy">{premiumComparison.premiumLine || premiumOutcomeLayer.detail}</p>
            </div>
          )}
        </div>
        {!hasProgressAccess ? (
          <div className="module-note">
            <strong>Free still shows the real basics.</strong>
            <p className="support-copy">You can still see consistency, milestones, and recent sessions here. Premium expands the interpretation layer, not just the lock screen.</p>
          </div>
        ) : null}
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Milestones" title="Recent reinforcement">
          {visibleMilestone ? (
            <div className="module-note">
              <strong>{visibleMilestone.title}</strong>
              <p className="support-copy">{visibleMilestone.detail}</p>
            </div>
          ) : (
            <p className="support-copy">Complete a few more sessions and PulsePeak will start surfacing grounded milestones here.</p>
          )}
        </Panel>

        <Panel eyebrow="Program arc" title="Where the program is headed">
          <div className="module-note">
            <strong>Current phase: {programPhase.label}</strong>
            <p className="support-copy">{programPhase.detail}</p>
          </div>
          <div className="module-note">
            <strong>Next week likely emphasis</strong>
            <p className="support-copy">{nextWeekAdjustment.detail}</p>
          </div>
          {whyThisMattersNotes.length ? (
            <div className="insight-list">
              {whyThisMattersNotes.map((note) => (
                <div className="insight-chip" key={note}>
                  <strong>Why this matters</strong>
                  <p className="muted">{note}</p>
                </div>
              ))}
            </div>
          ) : null}
          {systemConfidenceSignal ? (
            <div className="module-note">
              <strong>This is working</strong>
              <p className="support-copy">{systemConfidenceSignal}</p>
            </div>
          ) : null}
        </Panel>
      </div>

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
              {hasProgressAccess ? weeklyCheckIn?.premiumSummary : weeklyCheckIn?.freeSummary}
            </p>
            {!hasProgressAccess ? <p className="support-copy">{getPremiumCapabilitySummary("progress")}</p> : null}
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
          {hasProgressAccess && weeklyCheckIn?.premiumReasoning ? (
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

      <Panel eyebrow="Recent training" title="Recent completed sessions">
        {workoutMemory.completionRecords?.length ? (
          <div className="module-card-grid">
            {workoutMemory.completionRecords.slice(0, 4).map((record) => (
              <article className="module-card" key={`${record.workoutId}-${record.completedAt}`}>
                <p className="section-label">{record.category}</p>
                <h4>{record.workoutName}</h4>
                <p className="support-copy">
                  {new Date(record.completedAt).toLocaleString()} {record.duration ? `· ${record.duration} mins` : ""}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">Complete a workout and PulsePeak will start building a cleaner recent activity trail here.</p>
        )}
      </Panel>

      {!hasProgressAccess && showUpgradePrompt && progressUpgradePrompt ? (
        <UpgradePrompt prompt={progressUpgradePrompt} busy={checkoutBusy} onDismiss={dismissUpgradePrompt} onUpgrade={handleUpgrade} />
      ) : null}
    </div>
  );
}

function formatTrendLabel(trend) {
  if (trend === "up") {
    return "Trending up";
  }

  if (trend === "down") {
    return "Needs rebalancing";
  }

  return "Holding steady";
}
