import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "../components/CountUp";
import CelebrationOverlay from "../components/CelebrationOverlay";
import EmptyStateCard from "../components/EmptyStateCard";
import HabitList from "../components/HabitList";
import StreakCard from "../components/StreakCard";
import TodayForYou from "../components/TodayForYou";
import WeekInReview from "../components/WeekInReview";
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
import { getFirstSessionRouteContent, getTodayFocusContent } from "../utils/getFirstSessionRoute";
import { buildGuideTarget } from "../../shared/exerciseCatalog";
import { ACCESS_TIERS, getPremiumComparisonSummary, getPremiumOutcomeLayer, getUpgradeMoment, hasFullWorkoutAccess } from "../../shared/entitlements";
import { getDashboardNextAction } from "../../shared/dashboardModules";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user, isPremium, accessTier, isTrial, needsOnboarding, workoutMemory, workoutMomentum, workoutMilestones, recordWorkoutCompletion } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [recommendedWorkoutPool, setRecommendedWorkoutPool] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWeekReview, setShowWeekReview] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState(null);
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const openMovementGuide = (target) => setSelectedMovement(buildGuideTarget(target));
  const onboardingNudgeKey = useMemo(
    () => `pulsepeak-onboarding-upgrade-nudge:${user?.id || "guest"}`,
    [user?.id]
  );
  const conversionPromptKey = useMemo(
    () => `pulsepeak-dashboard-conversion:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showOnboardingUpgradePrompt, setShowOnboardingUpgradePrompt] = useState(
    () => window.sessionStorage.getItem(onboardingNudgeKey) === "true"
  );
  const [showConversionPrompt, setShowConversionPrompt] = useState(
    () => window.sessionStorage.getItem(conversionPromptKey) !== "dismissed"
  );
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const currentPlanFocus = null;
  const startingPath = useMemo(() => getFirstSessionRouteContent(data?.profile || user), [data?.profile, user]);
  const lastCategory = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("lastCategory") || window.localStorage.getItem("pulsepeak.mobility.lastCategory") || "";
  }, []);
  const todayFocusStrip = useMemo(() => getTodayFocusContent(data?.profile || user, lastCategory), [data?.profile, lastCategory, user]);
  const quickActions = useMemo(
    () => [
      { id: "strength", label: "Strength", route: "/workout/strength" },
      { id: "mobility", label: "Mobility & Stretch", route: "/mobility" },
      { id: "yoga", label: "Yoga Flow", route: "/mobility", category: "yoga" },
      { id: "injury-support", label: "Injury Support", route: "/injury-support" },
      { id: "cardio", label: "Cardio", route: "/workout/quick-start", category: "cardio" }
    ],
    []
  );

  useEffect(() => {
    setShowOnboardingUpgradePrompt(window.sessionStorage.getItem(onboardingNudgeKey) === "true");
  }, [onboardingNudgeKey]);
  useEffect(() => {
    setShowConversionPrompt(window.sessionStorage.getItem(conversionPromptKey) !== "dismissed");
  }, [conversionPromptKey]);

  useEffect(() => {
    if (!token || !data?.profile) {
      return;
    }

    const preferredEnvironment = data.profile.trainingEnvironment === "hybrid" ? "both" : data.profile.trainingEnvironment;
    const preferredEquipment = Array.isArray(data.profile.equipmentSelections) ? data.profile.equipmentSelections.join(",") : "";
    setLibraryLoading(true);
    apiRequest(
      `/workout-library?environment=${preferredEnvironment}&equipmentSelections=${encodeURIComponent(preferredEquipment)}&focus=${currentPlanFocus}`,
      {},
      token
    )
      .then((payload) => {
        const pool = payload.workouts || [];
        setRecommendedWorkoutPool(pool);
        // Pick the top session from the pool as "today's recommended session" so
        // the dashboard can start it directly instead of sending the user to
        // re-pick a workout it already chose.
        setRecommendedWorkout(pool[0] || null);
      })
      .catch(() => {
        setRecommendedWorkoutPool([]);
        setRecommendedWorkout(null);
      })
      .finally(() => setLibraryLoading(false));
  }, [accessTier, currentPlanFocus, data?.profile, token, workoutMemory]);

  const todayFocus = summary?.todayFocus;
  const planSummary = summary?.planSummary;
  const mobilityModule = summary?.mobilityModule;
  const workoutEngine = summary?.workoutEngine;
  const workoutAccess = summary?.workoutAccess;
  const weeklyCheckIn = summary?.weeklyCheckIn;
  const appMode = data?.profile?.appMode || "full_system";
  const showMobilityDashboard = appMode !== "training_only";
  const showExpandedSupport = appMode === "full_system";
  const hasFullAccess = hasFullWorkoutAccess(accessTier);
  const workoutsUpgradePrompt = hasFullAccess
    ? null
    : getUpgradePrompt({
        surface: "workouts",
        profile: data?.profile,
        activeModules: summary?.activeModules,
        weeklyPlan: summary?.planSummary
      });
  const onboardingUpgradePrompt = hasFullAccess
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
    // Must match the server's Week-in-Review target (store.js buildWeekInReview:
    // premium/trial = 4, free = the weekly cap) so the weekly goal reads the same
    // on the StreakCard and in the recap.
    if (workoutAccess?.premiumUnlimited || workoutAccess?.trialUnlimited) {
      return 4;
    }
    return workoutAccess?.limit || 2;
  }, [workoutAccess]);
  // Streak-milestone moment: when a real streak crosses a milestone (and the
  // user trained today), celebrate it once. localStorage suppresses repeats and
  // resets if the streak breaks, so re-climbing celebrates again.
  useEffect(() => {
    const status = summary?.streakStatus;
    if (!status) return;
    const KEY = "pulsepeak-streak-milestone";
    let last = 0;
    try {
      last = Number(window.localStorage.getItem(KEY)) || 0;
    } catch {
      last = 0;
    }
    if (status.streak < last) {
      try {
        window.localStorage.setItem(KEY, String(status.streak));
      } catch {
        /* non-fatal */
      }
      last = status.streak;
    }
    const milestones = [3, 7, 14, 30, 60, 100, 180, 365];
    if (status.trainedToday && milestones.includes(status.streak) && status.streak > last) {
      try {
        window.localStorage.setItem(KEY, String(status.streak));
      } catch {
        /* non-fatal */
      }
      setStreakMilestone({
        variant: "milestone",
        eyebrow: "Streak milestone",
        title: `${status.streak}-day streak!`,
        subtitle: "Consistency is compounding — this is how results happen.",
        hero: { value: status.streak, label: "days in a row" },
        autoDismissMs: 6000
      });
    }
  }, [summary?.streakStatus]);

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
  const recommendationExplanation = null;
  const weeklyStructure = null;
  const recoveryBias = null;
  const launchContext = null;
  const preferenceInfluence = null;
  const improvementSignals = [];
  const resultSignals = null;
  const performanceSignals = null;
  const checkpoint = null;
  const identitySignal = null;
  const programPhase = null;
  const systemConfidenceSignal = null;
  const nextWeekAdjustment = null;
  const whyThisMattersNotes = [];
  const premiumOutcomeLayer = useMemo(
    () => getPremiumOutcomeLayer(accessTier, { surface: "dashboard" }),
    [accessTier]
  );
  const companionAction = null;
  const continuityContext = null;
  const trustCue = null;
  const smartRotationStatus = null;
  const upgradeMoment = useMemo(
    () =>
      getUpgradeMoment({
        accessTier,
        context: {
          resultSignals,
          checkpoint,
          workoutMomentum
        }
      }),
    [accessTier, checkpoint, resultSignals, workoutMomentum]
  );
  const premiumComparison = useMemo(
    () =>
      getPremiumComparisonSummary(accessTier, {
        surface: "dashboard",
        upgradeMoment
      }),
    [accessTier, upgradeMoment]
  );
  const nextAction = useMemo(
    () =>
      getDashboardNextAction({
        needsOnboarding,
        recommendedWorkout,
        recommendationExplanation,
        weeklyStructure,
        programPhase,
        nextWeekAdjustment,
        workoutMemory,
        workoutMomentum,
        workoutAccess,
        hasFullAccess,
        recoveryBias,
        showMobilityDashboard,
        hasNutritionModule: (summary?.activeModules || []).includes("nutrition")
      }),
    [hasFullAccess, needsOnboarding, nextWeekAdjustment, programPhase, recommendedWorkout, recommendationExplanation, recoveryBias, showMobilityDashboard, summary?.activeModules, weeklyStructure, workoutAccess, workoutMemory, workoutMomentum]
  );
  const primarySignal = null;
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
    return (
      <div className="screen-center">
        <EmptyStateCard
          ctaLabel="Open Guided Start"
          ctaTo="/guided-start"
          description={error || "Use a working start path while the dashboard reconnects."}
          title="Dashboard unavailable"
        />
      </div>
    );
  }

  const openWeeklyPlan = async () => {
    setSaving("weekly-plan");
    setFeedback("");
    try {
      const payload = await apiRequest(
        "/weekly-plan",
        hasFullAccess
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
      const result = await mutate("/workouts/preset", {
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
                muscleGroup: exercise.muscleGroup,
                // Carry the real logged performance so volume + PR detection work.
                weight: exercise.weight,
                repsCompleted: exercise.repsCompleted,
                notes: exercise.notes
              }))
            : undefined
        })
      });
      recordWorkoutCompletion(workoutContext || { id: workoutId, name: workoutContext?.name || "Workout", focus: workoutContext?.focus || workoutEngine?.recommendedFocus, duration: workoutContext?.duration });
      setFeedback(successMessage);
      if (closeOnSuccess) {
        setSelectedWorkout(null);
      }
      return result?.personalRecords || [];
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
  const dismissConversionPrompt = () => {
    window.sessionStorage.setItem(conversionPromptKey, "dismissed");
    setShowConversionPrompt(false);
  };
  const openQuickAction = (action) => {
    if (action.category) {
      window.localStorage.setItem("lastCategory", action.category);
      window.localStorage.setItem("pulsepeak.mobility.lastCategory", action.category);
    }

    navigate(action.route);
  };
  const openPrimaryWorkoutAction = () => {
    if (recommendedWorkout) {
      startWorkoutSession(recommendedWorkout);
      return;
    }

    navigate("/workouts");
  };

  const toggleHabit = async (habitId) => {
    if (saving === "habit") {
      return;
    }
    setSaving("habit");
    try {
      await mutate("/habits/toggle", { method: "POST", body: JSON.stringify({ habitId }) });
    } catch (toggleError) {
      setFeedback(toggleError.message);
    } finally {
      setSaving("");
    }
  };

  // A warm, personal, time-aware opening beat — the app should greet you the way
  // a coach who knows you would, before it shows you what to do.
  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "there";
  const greetingHour = new Date().getHours();
  const timeGreeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";
  const greetingStreak = summary.streakStatus || {};
  const greetingSubline = greetingStreak.trainedToday
    ? greetingStreak.streak > 1
      ? `You've already trained today — that's ${greetingStreak.streak} days running.`
      : "You've already trained today — nice work."
    : greetingStreak.state === "at_risk" && greetingStreak.streak > 0
      ? `Keep your ${greetingStreak.streak}-day streak alive today.`
      : "Let's build some momentum today.";

  // Benchmark hero copy: the ranked top insight is the most personal, honest
  // line the engine has; the time-aware subline is the fallback for day one.
  const heroInsight = Array.isArray(summary.personalInsights) && summary.personalInsights.length > 0
    ? summary.personalInsights[0]
    : null;
  const heroCopy = heroInsight?.message || greetingSubline;

  return (
    <div className="page-grid page-grid-tight today-page">
      {/* Cinematic opener (APPROVED_VISUAL_TARGET): one display headline, one
          honest supporting line, one action. Backdrop is a designed tile per
          theme — upgrades to owner photography when the media program lands. */}
      <section className="today-cinematic">
        <div className="today-cinematic-content">
          <p className="today-cinematic-greeting">{timeGreeting}, {firstName}</p>
          <h1 className="today-cinematic-title">Today&rsquo;s<br />Training</h1>
          <p className="today-cinematic-copy">{heroCopy}</p>
          <button className="today-cinematic-cta" type="button" onClick={openPrimaryWorkoutAction}>
            Start session <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {summary.streakStatus ? (
        <StreakCard status={summary.streakStatus} weeklyTarget={weeklySessionTarget} variant="row" />
      ) : null}

      <button className="text-link today-week-review-link" type="button" onClick={() => setShowWeekReview(true)}>
        See your week in review →
      </button>

      {/* Today's Focus (benchmark): the engine's real session focus + why. */}
      <section className="today-focus-card">
        <div className="today-focus-body">
          <p className="today-focus-eyebrow section-label">Today&rsquo;s focus</p>
          <h2 className="today-focus-title">{workoutEngine?.recommendedFocusLabel || todayFocus?.title || "Your next session"}</h2>
          <p className="today-focus-copy">{workoutEngine?.recommendationReason || todayFocus?.reason || "Pick a session that fits your setup and keep the week moving."}</p>
          <button className="secondary-button today-focus-plan" type="button" onClick={() => navigate("/plan")}>
            View full plan <span aria-hidden="true">→</span>
          </button>
        </div>
        {/* Owner-approved focus imagery (concept crop, 2026-07-09); upgraded
            per-asset by the media program. */}
        <div aria-hidden="true" className="today-focus-media today-focus-media-live">
          <img alt="" loading="lazy" src="/media/today-focus.png" />
        </div>
      </section>

      {summary.habits.length > 0 && (
        <Panel className="today-habits" title="Small wins that keep the week on track">
          <HabitList habits={summary.habits} onToggle={toggleHabit} />
        </Panel>
      )}

      <Panel className="today-quick" title="Quick actions">
        {/* Canadian-benchmark row: one tap to the real actions the app has —
            honest labels, no invented features. Mobility hides with its module. */}
        <div className="quick-actions-row">
          <button className="quick-action" type="button" onClick={openPrimaryWorkoutAction}>
            <QuickActionIcon name="play" />
            <span>Start workout</span>
          </button>
          <button className="quick-action" type="button" onClick={() => navigate("/workouts")}>
            <QuickActionIcon name="log" />
            <span>Log a session</span>
          </button>
          <button className="quick-action" type="button" onClick={() => navigate("/exercise-library")}>
            <QuickActionIcon name="library" />
            <span>Exercises</span>
          </button>
          {showMobilityDashboard ? (
            <button className="quick-action" type="button" onClick={() => navigate("/mobility")}>
              <QuickActionIcon name="mobility" />
              <span>Mobility</span>
            </button>
          ) : null}
          <button className="quick-action" type="button" onClick={() => navigate("/progress")}>
            <QuickActionIcon name="checkin" />
            <span>Weekly check-in</span>
          </button>
        </div>
      </Panel>

      {Array.isArray(summary.recentWorkouts) && summary.recentWorkouts.length > 0 ? (
        <Panel className="today-recent" title="Recent activity">
          {/* Real logged sessions only (Canadian benchmark item). Photo
              thumbnails arrive with the media re-shoot — text rows until then,
              never placeholder imagery. */}
          <ul className="recent-activity-list">
            {summary.recentWorkouts.slice(0, 3).map((workout) => (
              <li className="recent-activity-row" key={workout.id}>
                <div className="recent-activity-copy">
                  <strong>{workout.name}</strong>
                  <span className="muted">
                    {formatRecentWhen(workout.loggedAt)}
                    {workout.duration ? ` · ${workout.duration} min` : ""}
                  </span>
                </div>
                <span className="recent-activity-state">Completed</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {/* The rest of the ranked insight rail — the top insight already leads
          the cinematic hero, so only the follow-on insights render here. */}
      <TodayForYou insights={(summary.personalInsights || []).slice(1)} listOnly />

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

      {!hasFullAccess && showOnboardingUpgradePrompt && onboardingUpgradePrompt && !upgradeMoment ? (
        <UpgradePrompt
          compact
          prompt={onboardingUpgradePrompt}
          busy={checkoutBusy}
          onDismiss={dismissOnboardingUpgradePrompt}
          onUpgrade={startUpgradeCheckout}
        />
      ) : null}


      <WorkoutDetailModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onLog={addPresetWorkout}
        isSaving={saving === `preset-${selectedWorkout?.presetId || selectedWorkout?.id}`}
        onOpenMovement={openMovementGuide}
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
        onOpenMovement={openMovementGuide}
      />
      <MovementDetailModal
        guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"}
        movement={selectedMovement}
        movementId={selectedMovement?.detailId || selectedMovement?.guideTargetId || selectedMovement?.id}
        onClose={() => setSelectedMovement(null)}
      />
      <WeekInReview open={showWeekReview} onClose={() => setShowWeekReview(false)} />
      <CelebrationOverlay
        open={Boolean(streakMilestone)}
        onClose={() => setStreakMilestone(null)}
        {...(streakMilestone || {})}
      />
    </div>
  );
}

// Thin athletic line icons for the Quick Actions row (decorative — the button
// labels carry the meaning).
function QuickActionIcon({ name }) {
  const p = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
  switch (name) {
    case "play":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5v7l6-3.5z" />
        </svg>
      );
    case "log":
      return (
        <svg {...p}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3.5" />
        </svg>
      );
    case "library":
      return (
        <svg {...p}>
          <path d="M6.5 8v8M17.5 8v8M4 9.5v5M20 9.5v5M6.5 12h11" />
        </svg>
      );
    case "mobility":
      return (
        <svg {...p}>
          <circle cx="12" cy="5" r="2.1" />
          <path d="M12 7.5v6M12 9.5l-4.5 2M12 9.5l4.5 2M12 13.5l-3 6.5M12 13.5l3 6.5" />
        </svg>
      );
    case "checkin":
      return (
        <svg {...p}>
          <path d="M4 17l5-5 4 4 7-8" />
          <path d="M16 8h4v4" />
        </svg>
      );
    default:
      return null;
  }
}

// Human, honest recency for the Recent Activity rows ("Today" / "Yesterday" /
// "N days ago"); empty string when the timestamp is missing or unparseable.
// Compares LOCAL CALENDAR DAYS, not 24h buckets — a session logged yesterday
// evening must read "Yesterday" even at 1am.
function formatRecentWhen(iso) {
  if (!iso) return "";
  const logged = new Date(iso);
  if (Number.isNaN(logged.getTime())) return "";
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(logged)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
