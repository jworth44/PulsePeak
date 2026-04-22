import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import ProgressRing from "../components/ProgressRing";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WeeklyPlanPreviewModal from "../components/WeeklyPlanPreviewModal";
import MovementDetailModal from "../components/MovementDetailModal";
import MovementReference from "../components/MovementReference";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";

export default function DashboardPage() {
  const { token, user, isPremium, accessTier, isTrial } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const onboardingNudgeKey = useMemo(
    () => `pulsepeak-onboarding-upgrade-nudge:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showOnboardingUpgradePrompt, setShowOnboardingUpgradePrompt] = useState(
    () => window.sessionStorage.getItem(onboardingNudgeKey) === "true"
  );
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();

  useEffect(() => {
    setShowOnboardingUpgradePrompt(window.sessionStorage.getItem(onboardingNudgeKey) === "true");
  }, [onboardingNudgeKey]);

  useEffect(() => {
    if (!token || !data?.profile) {
      return;
    }

    const preferredEnvironment = data.profile.trainingEnvironment === "hybrid" ? "both" : data.profile.trainingEnvironment;
    const preferredFocus = summary?.workoutEngine?.recommendedFocus || "recommended";
    const preferredEquipment = Array.isArray(data.profile.equipmentSelections) ? data.profile.equipmentSelections.join(",") : "";
    setLibraryLoading(true);
    apiRequest(
      `/workout-library?environment=${preferredEnvironment}&equipmentSelections=${encodeURIComponent(preferredEquipment)}&focus=${preferredFocus}`,
      {},
      token
    )
      .then((payload) => {
        setRecommendedWorkout(payload.workouts[0] || null);
      })
      .catch(() => {
        setRecommendedWorkout(null);
      })
      .finally(() => setLibraryLoading(false));
  }, [token, data?.profile, summary?.workoutEngine?.recommendedFocus]);

  const todayFocus = summary?.todayFocus;
  const planSummary = summary?.planSummary;
  const mobilityModule = summary?.mobilityModule;
  const workoutEngine = summary?.workoutEngine;
  const workoutAccess = summary?.workoutAccess;
  const weeklyCheckIn = summary?.weeklyCheckIn;
  const appMode = data?.profile?.appMode || "full_system";
  const showMobilityDashboard = appMode !== "training_only";
  const showExpandedSupport = appMode === "full_system";
  const workoutsUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "workouts",
        profile: data?.profile,
        activeModules: summary?.activeModules,
        weeklyPlan: summary?.planSummary
      });
  const onboardingUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "onboarding",
        profile: data?.profile,
        activeModules: summary?.activeModules,
        weeklyPlan: summary?.planSummary
      });

  const todayTrainingBlocks = useMemo(() => planSummary?.suggestedWorkoutMix?.split || [], [planSummary]);
  const todayMobilityItems = useMemo(() => mobilityModule?.suggestedFlow?.slice(0, 3) || [], [mobilityModule]);
  const weeklySessionTarget = useMemo(() => {
    if (workoutAccess?.premiumUnlimited || workoutAccess?.trialUnlimited) {
      return Math.max(3, planSummary?.suggestedWorkoutMix?.split?.length || 3);
    }
    return workoutAccess?.limit || 2;
  }, [planSummary?.suggestedWorkoutMix?.split, workoutAccess]);
  const lastWorkoutAt = summary?.recentWorkouts?.[0]?.loggedAt || null;
  const returnGapDays = useMemo(() => {
    if (!lastWorkoutAt) {
      return null;
    }
    return Math.max(0, Math.floor((Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60 * 24)));
  }, [lastWorkoutAt]);
  const nextMove = useMemo(() => {
    if (workoutAccess?.locked) {
      return "Pick up where you left off and keep the week connected.";
    }
    if (returnGapDays >= 2) {
      return recommendedWorkout ? `Pick up where you left off with ${recommendedWorkout.name}.` : "Pick up where you left off with your next session.";
    }
    if (todayFocus?.actions?.length) {
      return todayFocus.actions[0];
    }
    if (recommendedWorkout) {
      return `Run your next ${recommendedWorkout.focusLabel?.toLowerCase() || "training"} session.`;
    }
    return "Continue training with the next session that fits today.";
  }, [todayFocus?.actions, todayFocus?.whyThisMatters, recommendedWorkout, returnGapDays, workoutAccess?.locked]);
  const trialReminder = useMemo(() => {
    if (!isTrial) {
      return null;
    }
    const days = workoutAccess?.trialDaysRemaining || 0;
    if (days <= 1) {
      return {
        title: "Your full access ends tomorrow.",
        body: `Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}. Then it renews yearly at $119.99/year unless canceled.`
      };
    }
    if (days <= 3) {
      return {
        title: `Trial ends in ${days} day${days === 1 ? "" : "s"}.`,
        body: `Keep your progress connected. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly unless canceled.`
      };
    }
    return {
      title: `Trial ends in ${days} days.`,
      body: `Your full access stays active until ${workoutAccess?.trialEndsLabel || "your renewal date"}.`
    };
  }, [isTrial, workoutAccess?.trialDaysRemaining, workoutAccess?.trialEndsLabel]);

  if (loading) {
    return <div className="screen-center">Loading today&apos;s dashboard...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load your dashboard."}</div>;
  }

  const openWeeklyPlan = async () => {
    setSaving("weekly-plan");
    setFeedback("");
    try {
      const payload = await apiRequest(
        "/weekly-plan",
        isPremium
          ? {}
          : {
              headers: {
                "X-Plan-Preview": "true"
              }
            },
        token
      );
      setWeeklyPlanState(payload);
    } catch (loadError) {
      setFeedback(loadError.message);
    } finally {
      setSaving("");
    }
  };

  const addPresetWorkout = async (workoutOrId, customExercises = null, options = {}) => {
    const workoutId = typeof workoutOrId === "string" ? workoutOrId : workoutOrId?.id;
    const workoutContext = typeof workoutOrId === "string" ? null : workoutOrId;
    const { closeOnSuccess = true, successMessage = "Workout logged." } = options;
    setSaving(`preset-${workoutId}`);
    setFeedback("");
    try {
      await mutate("/workouts/preset", {
        method: "POST",
        body: JSON.stringify({
          presetId: workoutId,
          environment: workoutContext?.environment,
          equipmentProfile: workoutContext?.equipmentProfile || data.profile.equipmentProfile,
          focus: workoutContext?.focus || workoutEngine?.recommendedFocus,
          exercises: customExercises
            ? customExercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup
              }))
            : undefined
        })
      });
      setFeedback(successMessage);
      if (closeOnSuccess) {
        setSelectedWorkout(null);
      }
    } catch (mutationError) {
      setFeedback(mutationError.message);
      throw mutationError;
    } finally {
      setSaving("");
    }
  };

  const startWorkoutSession = (workout) => {
    if (!workout) {
      return;
    }

    setSelectedWorkout(workout);
  };

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setFeedback("");
    try {
      await startUpgradeCheckoutFlow(billingInterval, checkoutMode);
    } catch (loadError) {
      setFeedback(loadError.message);
    }
  };

  const dismissOnboardingUpgradePrompt = () => {
    window.sessionStorage.removeItem(onboardingNudgeKey);
    setShowOnboardingUpgradePrompt(false);
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="today-hero">
        <div className="today-hero-copy">
          <p className="badge">Today</p>
          <h2>{workoutEngine?.recommendedFocusLabel || todayFocus?.title || "Keep the next workout decision simple and clear."}</h2>
          <p className="lead-copy">{workoutEngine?.recommendationReason || todayFocus?.reason || "PulsePeak is narrowing the day around the clearest training win first."}</p>
          <div className="hero-stats hero-stats-compact">
            <div className="stat-pill">
              <strong>
                {summary.workoutAccess?.trialUnlimited
                  ? `${summary.workoutAccess?.trialDaysRemaining || 0} days left`
                  : summary.workoutAccess?.premiumUnlimited
                    ? "Unlimited"
                    : `${summary.workoutAccess?.remaining ?? 0} left`}
              </strong>
              <span className="muted">Workout logs this week</span>
            </div>
            <div className="stat-pill">
              <strong>{summary.workoutStreak} days</strong>
              <span className="muted">Training streak</span>
            </div>
            <div className="stat-pill">
              <strong>{summary.habits.filter((habit) => habit.completedToday).length}</strong>
              <span className="muted">Habits done today</span>
            </div>
          </div>
        </div>

        <div className="today-hero-score">
          <p className="section-label">This week</p>
          <strong className="hero-mini-title">Consistency score</strong>
          <div className="ring-wrap">
            <ProgressRing value={summary.completion} />
          </div>
          <p className="hero-support-copy">{summary.resultProjection?.summary}</p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      {returnGapDays >= 2 ? (
        <div className="status-banner">
          <strong>Pick up where you left off. Your next session is ready.</strong>
          <p className="support-copy">
            {isPremium || isTrial
              ? "Continue training and keep your week moving."
              : "Start your 7-day free trial to keep your progress connected."}
          </p>
        </div>
      ) : null}

      {trialReminder ? (
        <div className="status-banner">
          <strong>{trialReminder.title}</strong>
          <p className="support-copy">{trialReminder.body}</p>
        </div>
      ) : null}

      {!isPremium && showOnboardingUpgradePrompt && onboardingUpgradePrompt ? (
        <UpgradePrompt
          compact
          prompt={onboardingUpgradePrompt}
          busy={checkoutBusy}
          onDismiss={dismissOnboardingUpgradePrompt}
          onUpgrade={startUpgradeCheckout}
        />
      ) : null}

      <div className="today-stack">
        <Panel
          eyebrow="Today&apos;s training direction"
          title={workoutEngine?.recommendedFocusLabel || planSummary?.weeklyFocus || "Your plan for today"}
          actions={
            <div className="module-card-actions">
              <button
                className="primary-button"
                disabled={recommendedWorkout ? Boolean(recommendedWorkout.lockedForAccess) : libraryLoading}
                type="button"
                onClick={() => (recommendedWorkout ? startWorkoutSession(recommendedWorkout) : null)}
              >
                {recommendedWorkout
                  ? recommendedWorkout.lockedForAccess
                    ? "Locked on Free"
                    : "Start workout"
                  : libraryLoading
                    ? "Loading..."
                    : "Open Workouts"}
              </button>
              <Link className="ghost-button module-link" to="/workouts">
                Open Workouts
              </Link>
            </div>
          }
        >
          <div className="section-context">
            <span className="section-context-label">Today</span>
            <p>{workoutEngine?.recommendationReason || "This is the highest-impact move for the next few hours, pulled from the larger weekly system below."}</p>
          </div>
          {workoutEngine?.continuityNote ? (
            <div className="module-note">
              <strong>{workoutEngine.continuityNote}</strong>
              <p className="support-copy">{workoutEngine.recentRotationNote}</p>
            </div>
          ) : null}
          <div className="today-sequence">
            <div className="today-sequence-card">
              <span className="focus-step">Where you are training</span>
              <strong>{data.profile.trainingEnvironment === "hybrid" ? "Hybrid setup" : data.profile.trainingEnvironment === "gym" ? "Gym" : "Home"}</strong>
              <p className="muted">{data.profile.equipmentProfile.replace(/_/g, " ")}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">What to train</span>
              <strong>{workoutEngine?.recommendedFocusLabel || todayFocus?.title}</strong>
              <p className="muted">{(workoutEngine?.alternateFocusLabels || []).join(" · ")}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">Start with</span>
              <strong>{recommendedWorkout?.name || "Open the workout engine"}</strong>
              <p className="muted">{recommendedWorkout ? `${recommendedWorkout.duration} mins · ${recommendedWorkout.intensity}` : todayFocus?.whyThisMatters}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">Next move</span>
              <strong>{nextMove}</strong>
            </div>
          </div>
          <div className="module-note">
            <strong>
              You have completed {workoutAccess?.weeklyLogged || 0} of {weeklySessionTarget} sessions this week.
            </strong>
            <p className="support-copy">Your next session keeps the week on track.</p>
          </div>
        </Panel>

        {showMobilityDashboard ? (
        <Panel
          eyebrow="Today&apos;s mobility support"
          title={mobilityModule?.categories?.find((category) => category.id === mobilityModule?.suggestedCategory)?.label || "Guided mobility"}
          actions={
            <Link className="secondary-button module-link" to="/mobility">
              Open Mobility
            </Link>
          }
        >
          <div className="module-note">
            <strong>{planSummary?.mobilityBlock?.title || "Choose the guided movement layer that matches today."}</strong>
            <p className="support-copy">{planSummary?.mobilityBlock?.reason || mobilityModule?.description}</p>
          </div>
          <ul className="plan-list">
            {todayMobilityItems.map((item) => (
              <li key={`today-mobility-${item.name}`}>
                {item.movement ? (
                  <MovementReference compact movement={item.movement} onClick={setSelectedMovement} prefix={`${item.minutes} min`} />
                ) : (
                  `${item.name} · ${item.minutes} min`
                )}
              </li>
            ))}
          </ul>
        </Panel>
        ) : null}

        <Panel
          eyebrow="This week&apos;s split"
          title="The week broken into a simpler training structure"
          actions={
            <Link className="ghost-button module-link" to="/plan">
              Open Plan
            </Link>
          }
        >
          <div className="section-context">
            <span className="section-context-label">This week</span>
            <p>These blocks show the broader training direction so today feels connected to a real progression instead of a random session.</p>
          </div>
          <div className="today-sequence">
            {todayTrainingBlocks.length ? (
              todayTrainingBlocks.map((item) => (
                <div className="today-sequence-card" key={item}>
                  <span className="focus-step">Block</span>
                  <strong>{item}</strong>
                </div>
              ))
            ) : (
              <div className="today-sequence-card">
                <span className="focus-step">Block</span>
                <strong>{workoutEngine?.currentSplitSummary || "Keep training light and repeatable this week."}</strong>
              </div>
            )}
          </div>
          {planSummary?.suggestedWorkoutMix?.featuredMovements?.length ? (
            <div className="movement-chip-list">
              {planSummary.suggestedWorkoutMix.featuredMovements.map((movement) => (
                <MovementReference compact key={movement.id} movement={movement} onClick={setSelectedMovement} />
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel
          eyebrow="Today&apos;s recommended workout"
          title={recommendedWorkout?.name || "Your next recommended session"}
          actions={
            <Link className="secondary-button module-link" to="/workouts">
              Open Workouts
            </Link>
          }
        >
          <div className={`cap-banner compact-cap-banner ${workoutAccess?.locked ? "cap-banner-locked" : ""}`}>
            <strong>
              {workoutAccess?.trialUnlimited
                ? `Trial active: unlimited workout logging until ${workoutAccess?.trialEndsLabel || "your trial ends"}.`
                : workoutAccess?.premiumUnlimited
                  ? "Premium includes unlimited workout logging."
                  : `Free plan: ${workoutAccess?.weeklyLogged || 0} of ${workoutAccess?.limit || 2} logs used this week.`}
            </strong>
            <p className="support-copy">
              {workoutAccess?.trialUnlimited
                ? `You are using the full PulsePeak system right now. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly at $119.99/year unless canceled before trial ends.`
                : workoutAccess?.premiumUnlimited
                  ? "Preview, swap, and log as many sessions as you need."
                  : workoutAccess?.locked
                    ? workoutAccess?.canStartTrial
                      ? "Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity."
                      : `Previewing and exercise swaps still work, and logging resets on ${workoutAccess?.resetLabel}. Premium removes the cap and keeps your workout history moving.`
                    : `You still have ${workoutAccess?.remaining} workout log${workoutAccess?.remaining === 1 ? "" : "s"} left this week.`}
            </p>
          </div>
          {libraryLoading ? (
            <p className="support-copy">Finding today&apos;s best workout...</p>
          ) : recommendedWorkout ? (
            <div className="module-note">
              <strong>{recommendedWorkout.focusLabel} · {recommendedWorkout.environment} · {recommendedWorkout.duration} mins</strong>
              <p className="support-copy">{recommendedWorkout.summary}</p>
              {recommendedWorkout.continuityNote ? <p className="support-copy">{recommendedWorkout.continuityNote}</p> : null}
              {recommendedWorkout.varietyNote ? <p className="support-copy">{recommendedWorkout.varietyNote}</p> : null}
              <div className="module-card-actions">
                <button className="ghost-button" type="button" onClick={() => setSelectedWorkout(recommendedWorkout)}>
                  View details
                </button>
                <button
                  className="primary-button"
                  disabled={Boolean(recommendedWorkout.lockedForAccess)}
                  type="button"
                  onClick={() => startWorkoutSession(recommendedWorkout)}
                >
                  {recommendedWorkout.lockedForAccess ? "Locked on Free" : "Start workout"}
                </button>
              </div>
            </div>
          ) : (
            <p className="muted">No preset recommendation is available yet. Open the workout engine and choose the setup that matches today.</p>
          )}
          {!isPremium && !isTrial && !workoutAccess?.locked ? (
            <div className="module-note">
              <strong>Keep your training continuity intact.</strong>
              <p className="support-copy">
                Start your 7-day free trial after your next completed session if you want the full system to stay connected.
              </p>
            </div>
          ) : null}
          {!isPremium && workoutAccess?.locked && workoutsUpgradePrompt ? (
            <UpgradePrompt compact prompt={workoutsUpgradePrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
          ) : null}
        </Panel>

        {showExpandedSupport ? (
        <Panel eyebrow="Why this matters" title="Why PulsePeak is shaping the day this way">
          <div className="section-context">
            <span className="section-context-label">Why it works</span>
            <p>PulsePeak is combining your goal, recovery, equipment setup, and recent consistency so today&apos;s actions stay tied to a believable weekly result.</p>
          </div>
          <div className="content-grid">
            <div className="module-note">
              <strong>{summary.whyThisWorks?.trustNote}</strong>
              <p className="support-copy">{summary.whyThisWorks?.body}</p>
            </div>
            <div className="module-note">
              <strong>{summary.resultProjection?.summary}</strong>
              <p className="support-copy">{summary.resultProjection?.confidence}</p>
            </div>
          </div>
          {weeklyCheckIn ? (
            <div className="module-note">
              <strong>Weekly reflection</strong>
              <p className="support-copy">{weeklyCheckIn.todayConnection}</p>
            </div>
          ) : null}
          <div className="module-card-actions">
            <Link className="ghost-button module-link" to="/coach">
              Open Coach
            </Link>
            <Link className="ghost-button module-link" to="/progress">
              Open Progress
            </Link>
            <Link className="ghost-button module-link" to="/nutrition">
              Open Nutrition
            </Link>
          </div>
        </Panel>
        ) : null}
      </div>

      <WorkoutDetailModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onLog={addPresetWorkout}
        isSaving={saving === `preset-${selectedWorkout?.presetId || selectedWorkout?.id}`}
        onOpenMovement={setSelectedMovement}
        onUpgrade={startUpgradeCheckout}
        accessTier={accessTier}
        canStartTrial={Boolean(user?.canStartTrial)}
        weeklyTarget={weeklySessionTarget}
        workoutStreak={summary.workoutStreak}
        weeklyWorkoutCount={workoutAccess?.weeklyLogged || 0}
        loggingLocked={Boolean(workoutAccess?.locked)}
        completionExitLabel="Continue training"
        loggingHint={
          workoutAccess?.locked
            ? workoutAccess?.canStartTrial
              ? "You’ve hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
              : `Free logging resets on ${workoutAccess?.resetLabel}. Premium removes the weekly cap and keeps your workout continuity alive.`
            : ""
        }
      />
      <WeeklyPlanPreviewModal
        planPayload={weeklyPlanState}
        onClose={() => setWeeklyPlanState(null)}
        onUpgrade={startUpgradeCheckout}
        onOpenMovement={setSelectedMovement}
      />
      <MovementDetailModal guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}
