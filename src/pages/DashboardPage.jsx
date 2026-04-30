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
import { buildGuideTarget } from "../../shared/exerciseCatalog";
import { ACCESS_TIERS, getPremiumComparisonSummary, getPremiumOutcomeLayer, getUpgradeMoment, hasFullWorkoutAccess } from "../../shared/entitlements";
import {
  getCheckpoints,
  getIdentitySignal,
  getImprovementSignals,
  getNextWeekAdjustment,
  getPerformanceSignals,
  getProgramPhase,
  getPrimarySignalHighlight,
  getRecommendedCompanionAction,
  getResultSignals,
  getSmartRotationStatus,
  getSystemTrustCue,
  getTodaysRecommendedWorkout,
  getWeeklyTrainingOutline,
  getWhyThisMattersNotes,
  getWorkoutRecommendationExplanation,
  getRecoveryBias,
  getModuleContinuityContext,
  getSystemConfidenceSignal
} from "../../shared/workoutEngine";
import { getDashboardNextAction } from "../../shared/dashboardModules";

export default function DashboardPage() {
  const { token, user, isPremium, accessTier, isTrial, needsOnboarding, workoutMemory, workoutMomentum, workoutMilestones, recordWorkoutCompletion } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [recommendedWorkoutPool, setRecommendedWorkoutPool] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
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
        setRecommendedWorkoutPool(payload.workouts || []);
        setRecommendedWorkout(
          getTodaysRecommendedWorkout({
            workouts: payload.workouts || [],
            currentPlanFocus,
            memoryState: workoutMemory,
            accessTier,
            filters: {
              workoutEnvironment: preferredEnvironment,
              equipmentSelections: data.profile.equipmentSelections || []
            },
            goalType: data.profile.goalType
          })
        );
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
  const recommendationExplanation = useMemo(
    () =>
      getWorkoutRecommendationExplanation(recommendedWorkout, {
        accessTier,
        currentPlanFocus,
        goalType: data?.profile?.goalType,
        memoryState: workoutMemory,
        filters: {
          workoutEnvironment: data?.profile?.trainingEnvironment === "hybrid" ? "both" : data?.profile?.trainingEnvironment,
          equipmentSelections: data?.profile?.equipmentSelections || []
        }
      }),
    [accessTier, currentPlanFocus, data?.profile?.equipmentSelections, data?.profile?.goalType, data?.profile?.trainingEnvironment, recommendedWorkout, workoutMemory]
  );
  const weeklyStructure = useMemo(
    () =>
      getWeeklyTrainingOutline({
        currentPlanFocus,
        memoryState: workoutMemory,
        accessTier,
        workouts: recommendedWorkoutPool
      }),
    [accessTier, currentPlanFocus, recommendedWorkoutPool, workoutMemory]
  );
  const recoveryBias = useMemo(() => getRecoveryBias(workoutMemory), [workoutMemory]);
  const launchContext = null;
  const preferenceInfluence = null;
  const improvementSignals = useMemo(
    () =>
      getImprovementSignals({
        completionRecords: workoutMemory.completionRecords,
        memoryState: workoutMemory,
        currentPlanFocus
      }),
    [currentPlanFocus, workoutMemory]
  );
  const resultSignals = useMemo(
    () =>
      getResultSignals({
        completionRecords: workoutMemory.completionRecords,
        workoutMomentum
      }),
    [workoutMemory.completionRecords, workoutMomentum]
  );
  const performanceSignals = useMemo(
    () =>
      getPerformanceSignals({
        completionRecords: workoutMemory.completionRecords
      }),
    [workoutMemory.completionRecords]
  );
  const checkpoint = useMemo(
    () =>
      getCheckpoints({
        completionRecords: workoutMemory.completionRecords,
        workoutMomentum
      }),
    [workoutMemory.completionRecords, workoutMomentum]
  );
  const identitySignal = useMemo(
    () =>
      getIdentitySignal({
        completionRecords: workoutMemory.completionRecords,
        workoutMomentum
      }),
    [workoutMemory.completionRecords, workoutMomentum]
  );
  const programPhase = useMemo(
    () =>
      getProgramPhase({
        completionRecords: workoutMemory.completionRecords,
        currentPlanFocus,
        workoutMomentum
      }),
    [currentPlanFocus, workoutMemory.completionRecords, workoutMomentum]
  );
  const systemConfidenceSignal = useMemo(
    () =>
      getSystemConfidenceSignal({
        completionRecords: workoutMemory.completionRecords,
        memoryState: workoutMemory,
        workoutMomentum,
        currentPlanFocus
      }),
    [currentPlanFocus, workoutMemory, workoutMomentum]
  );
  const nextWeekAdjustment = useMemo(
    () =>
      getNextWeekAdjustment({
        completionRecords: workoutMemory.completionRecords,
        currentPlanFocus,
        workoutMomentum,
        accessTier
      }),
    [accessTier, currentPlanFocus, workoutMemory.completionRecords, workoutMomentum]
  );
  const whyThisMattersNotes = useMemo(
    () =>
      getWhyThisMattersNotes({
        currentPlanFocus,
        memoryState: workoutMemory,
        phase: programPhase,
        recoveryBias
      }),
    [currentPlanFocus, programPhase, recoveryBias, workoutMemory]
  );
  const premiumOutcomeLayer = useMemo(
    () => getPremiumOutcomeLayer(accessTier, { surface: "dashboard" }),
    [accessTier]
  );
  const companionAction = useMemo(
    () =>
      getRecommendedCompanionAction({
        currentPlanFocus,
        memoryState: workoutMemory,
        workoutMomentum,
        recoveryBias,
        weeklyStructure,
        nutritionMode: data?.profile?.nutritionMode,
        hasMobilityModule: showMobilityDashboard,
        hasNutritionModule: (summary?.activeModules || []).includes("nutrition")
      }),
    [currentPlanFocus, data?.profile?.nutritionMode, recoveryBias, showMobilityDashboard, summary?.activeModules, weeklyStructure, workoutMemory, workoutMomentum]
  );
  const continuityContext = useMemo(
    () =>
      getModuleContinuityContext({
        module: "dashboard",
        currentPlanFocus,
        memoryState: workoutMemory,
        workoutMomentum,
        recoveryBias,
        weeklyStructure,
        nutritionMode: data?.profile?.nutritionMode
      }),
    [currentPlanFocus, data?.profile?.nutritionMode, recoveryBias, weeklyStructure, workoutMemory, workoutMomentum]
  );
  const trustCue = useMemo(
    () =>
      getSystemTrustCue({
        currentPlanFocus,
        memoryState: workoutMemory,
        weeklyStructure,
        resultSignals
      }),
    [currentPlanFocus, resultSignals, weeklyStructure, workoutMemory]
  );
  const smartRotationStatus = useMemo(
    () => getSmartRotationStatus({ recommendedWorkout }),
    [recommendedWorkout]
  );
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
  const primarySignal = useMemo(
    () =>
      getPrimarySignalHighlight({
        checkpoint,
        milestone: workoutMilestones?.fresh || workoutMilestones?.latest || null,
        identitySignal,
        performanceSignals,
        resultSignals
      }),
    [checkpoint, identitySignal, performanceSignals, resultSignals, workoutMilestones]
  );
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
      recordWorkoutCompletion(workoutContext || { id: workoutId, name: workoutContext?.name || "Workout", focus: workoutContext?.focus || workoutEngine?.recommendedFocus, duration: workoutContext?.duration });
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
  const dismissConversionPrompt = () => {
    window.sessionStorage.setItem(conversionPromptKey, "dismissed");
    setShowConversionPrompt(false);
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
              <strong>{workoutMomentum.currentStreakDays} day{workoutMomentum.currentStreakDays === 1 ? "" : "s"}</strong>
              <span className="muted">Current training streak</span>
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

      <div className="module-note">
        <strong>{launchContext?.launchLabel || "Built from your setup"}</strong>
        <p className="support-copy">
          {launchContext?.launchSummary || "Your dashboard is using your current profile and access settings as the baseline for what to show next."}
        </p>
        <p className="support-copy">
          {launchContext?.weekIntent || "Open the weekly plan or workouts view when you want more detailed training direction."}
        </p>
      </div>

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

      <div className="today-stack">
        {nextAction ? (
          <Panel eyebrow={nextAction.eyebrow} title={nextAction.title}>
            <div className="module-note">
              <p className="support-copy">{nextAction.reason}</p>
              <div className="module-card-actions">
                {nextAction.primaryAction?.action === "start_workout" ? (
                  <button className="primary-button" type="button" onClick={() => recommendedWorkout && startWorkoutSession(recommendedWorkout)}>
                    {nextAction.primaryAction.label}
                  </button>
                ) : nextAction.primaryAction?.action === "upgrade" ? (
                  <button className="primary-button" type="button" onClick={() => startUpgradeCheckout(user?.canStartTrial ? "yearly" : "monthly", user?.canStartTrial ? "default" : "upgrade_now")}>
                    {nextAction.primaryAction.label}
                  </button>
                ) : nextAction.primaryAction?.href ? (
                  <Link className="primary-button module-link" to={nextAction.primaryAction.href}>
                    {nextAction.primaryAction.label}
                  </Link>
                ) : null}
                {nextAction.secondaryAction?.action === "review_workout" ? (
                  <button className="ghost-button" type="button" onClick={() => recommendedWorkout && setSelectedWorkout(recommendedWorkout)}>
                    {nextAction.secondaryAction.label}
                  </button>
                ) : nextAction.secondaryAction?.href ? (
                  <Link className="ghost-button module-link" to={nextAction.secondaryAction.href}>
                    {nextAction.secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : null}

        {(workoutMomentum.currentStreakDays > 0 || workoutMomentum.weeklyCompletionCount > 0) ? (
          <div className="momentum-strip">
            <span className="momentum-badge">
              {workoutMomentum.currentStreakDays} day{workoutMomentum.currentStreakDays === 1 ? "" : "s"} current streak
            </span>
            <span className="momentum-badge">
              {workoutMomentum.longestStreakDays} day{workoutMomentum.longestStreakDays === 1 ? "" : "s"} best streak
            </span>
            <span className="momentum-badge">
              {workoutMomentum.weeklyCompletionCount} session{workoutMomentum.weeklyCompletionCount === 1 ? "" : "s"} this week
            </span>
          </div>
        ) : null}

        {primarySignal ? (
          <div className="module-note">
            <strong>{primarySignal.title}</strong>
            <p className="support-copy">{primarySignal.detail}</p>
          </div>
        ) : null}

        {performanceSignals?.summaryLine ? (
          <div className="module-note">
            <strong>Performance trend</strong>
            <p className="support-copy">{performanceSignals.summaryLine}</p>
          </div>
        ) : null}

        {companionAction ? (
          <div className="module-note">
            <strong>{companionAction.title}</strong>
            <p className="support-copy">{companionAction.detail}</p>
            <div className="module-card-actions">
              <Link className="ghost-button module-link" to={companionAction.href}>
                {companionAction.ctaLabel}
              </Link>
            </div>
          </div>
        ) : null}

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
            <p>{workoutEngine?.recommendationReason || continuityContext.detail || "This is the highest-impact move for the next few hours, pulled from the larger weekly system below."}</p>
          </div>
          {trustCue ? <p className="support-copy recommendation-context-note">{trustCue}</p> : null}
          {recommendationExplanation?.shortLabel ? (
            <div className="module-note">
              <strong>{recommendationExplanation.shortLabel}</strong>
              <p className="support-copy">{recommendationExplanation.supportingReason}</p>
            </div>
          ) : null}
          {smartRotationStatus ? (
            <div className="module-note smart-rotation-note">
              <strong>{smartRotationStatus.label}</strong>
              <p className="support-copy">{smartRotationStatus.detail}</p>
            </div>
          ) : null}
          {preferenceInfluence?.items?.length ? (
            <div className="module-note">
              <strong>{preferenceInfluence.primary}</strong>
              <p className="support-copy">{preferenceInfluence.summary}</p>
            </div>
          ) : null}
          {systemConfidenceSignal ? (
            <div className="module-note">
              <strong>This is working</strong>
              <p className="support-copy">{systemConfidenceSignal}</p>
            </div>
          ) : null}
          <div className="module-note">
            <strong>{programPhase.label}</strong>
            <p className="support-copy">{programPhase.detail}</p>
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
            {workoutMemory.lastCompletedAt ? (
              <p className="support-copy">Last completed session: {workoutMemory.completionRecords?.[0]?.workoutName || "Workout"}.</p>
            ) : null}
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
          {weeklyStructure?.summary ? (
            <div className="module-note">
              <strong>{weeklyStructure.summary}</strong>
              <p className="support-copy">
                {recommendedWorkout ? `Today points toward ${recommendedWorkout.name} so the week starts from a clear next action.` : "Open the workout engine to lock in the next session from this weekly structure."}
              </p>
              <p className="support-copy">{nextWeekAdjustment.detail}</p>
            </div>
          ) : (
            <div className="module-note">
              <strong>{continuityContext.title}</strong>
              <p className="support-copy">{continuityContext.detail}</p>
            </div>
          )}
          <div className="today-sequence">
            {weeklyStructure?.days?.length ? (
              weeklyStructure.days.map((entry) => (
                <div className="today-sequence-card" key={`weekly-structure-${entry.day}`}>
                  <span className="focus-step">Block</span>
                  <strong>{entry.label}</strong>
                  <p className="muted">{entry.title}</p>
                </div>
              ))
            ) : todayTrainingBlocks.length ? (
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
              {recommendationExplanation?.shortLabel ? <p className="support-copy recommendation-context-note">{recommendationExplanation.shortLabel}</p> : null}
              {recommendationExplanation?.supportingReason ? <p className="support-copy">{recommendationExplanation.supportingReason}</p> : null}
              {smartRotationStatus ? <p className="support-copy recommendation-context-note">{smartRotationStatus.label}</p> : null}
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
          {!hasFullAccess && accessTier !== ACCESS_TIERS.TRIAL && !workoutAccess?.locked ? (
            <div className="module-note">
              <strong>Keep your training continuity intact.</strong>
              <p className="support-copy">
                Start your 7-day free trial after your next completed session if you want the full system to stay connected.
              </p>
            </div>
          ) : null}
          {!hasFullAccess && !workoutAccess?.locked && workoutsUpgradePrompt && upgradeMoment && showConversionPrompt ? (
            <UpgradePrompt
              compact
              prompt={{ ...workoutsUpgradePrompt, contextNote: upgradeMoment.detail }}
              busy={checkoutBusy}
              onDismiss={dismissConversionPrompt}
              onUpgrade={startUpgradeCheckout}
            />
          ) : null}
          {!hasFullAccess && workoutAccess?.locked && workoutsUpgradePrompt ? (
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
          {!hasFullAccess ? (
            <div className="module-note">
              <strong>{premiumOutcomeLayer.title}</strong>
              <p className="support-copy">{premiumComparison.availableNow}</p>
              <p className="support-copy">{premiumComparison.premiumLine}</p>
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
    </div>
  );
}
