import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import WeeklyPlanPreviewModal from "../components/WeeklyPlanPreviewModal";
import MovementDetailModal from "../components/MovementDetailModal";
import UpgradePrompt from "../components/UpgradePrompt";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { apiRequest } from "../api/client";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { buildGuideTarget, getGuideStatusLabel, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { getExerciseImageSrc } from "../utils/getExerciseImageSrc";
import { getPremiumComparisonSummary, getPremiumOutcomeLayer, getUpgradeMoment, hasFullWorkoutAccess } from "../../shared/entitlements";
import { PLAN_DISCOVERY_CATEGORIES, PLAN_LIBRARY, TOOL_CATEGORIES, TOOL_LIBRARY } from "../../shared/libraryTaxonomy.js";

export default function PlanPage() {
  const { token, accessTier, workoutMemory, workoutMomentum } = useAuth();
  const { data, summary, loading, error } = useDashboardData();
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [opening, setOpening] = useState(false);
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [recommendedWorkoutPool, setRecommendedWorkoutPool] = useState([]);
  const [selectedPlanCategory, setSelectedPlanCategory] = useState("all");
  const [selectedGoalFilter, setSelectedGoalFilter] = useState("all");
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState("all");
  const [selectedRecoveryFilter, setSelectedRecoveryFilter] = useState("all");
  const [selectedEnvironmentFilter, setSelectedEnvironmentFilter] = useState("all");
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const openMovementGuide = (target) => setSelectedMovement(buildGuideTarget(target));
  const safeProfile = data?.profile || {};
  const safeSummary = summary || {};
  const workoutEngine = safeSummary.workoutEngine || {};
  const currentPlanFocus = workoutEngine.recommendedFocus || "recommended";
  const programSummary = workoutEngine.recommendationReason || null;
  const focusLabel = workoutEngine.recommendedFocusLabel || "";
  const alternativeWorkoutCount = Math.max(recommendedWorkoutPool.length - (recommendedWorkout ? 1 : 0), 0);
  const planLibrary = useMemo(() => {
    const goalType = safeProfile.goalType || "general_fitness";
    const equipmentProfile = safeProfile.equipmentProfile || "hybrid";
    const environment = safeProfile.trainingEnvironment || "hybrid";
    const recoveryBias = safeProfile.injuryStatus !== "none" ? "joint_friendly" : "balanced";

    return PLAN_LIBRARY.filter((plan) => {
      const categoryMatch = selectedPlanCategory === "all" || plan.category === selectedPlanCategory;
      const goalMatch = selectedGoalFilter === "all" || plan.goal === selectedGoalFilter;
      const equipmentMatch = selectedEquipmentFilter === "all" || plan.equipment.includes(selectedEquipmentFilter);
      const recoveryMatch = selectedRecoveryFilter === "all" || plan.recoveryProfile === selectedRecoveryFilter;
      const environmentMatch = selectedEnvironmentFilter === "all" || plan.environment.includes(selectedEnvironmentFilter);
      return categoryMatch && goalMatch && equipmentMatch && recoveryMatch && environmentMatch;
    }).sort((left, right) => {
      const leftScore = rankPlan(left, { goalType, equipmentProfile, environment, recoveryBias });
      const rightScore = rankPlan(right, { goalType, equipmentProfile, environment, recoveryBias });
      return rightScore - leftScore;
    });
  }, [safeProfile, selectedPlanCategory, selectedGoalFilter, selectedEquipmentFilter, selectedRecoveryFilter, selectedEnvironmentFilter]);
  const toolsByCategory = useMemo(
    () =>
      TOOL_CATEGORIES.map((category) => ({
        ...category,
        items: TOOL_LIBRARY.filter((tool) => tool.category === category.id)
      })),
    []
  );
  const weeklyStructure = null;
  const recommendationExplanation = {
    shortLabel: focusLabel ? `${focusLabel} fits today` : "Next recommended session",
    supportingReason: workoutEngine.recommendationReason || recommendedWorkout?.continuityNote || ""
  };
  const improvementSignals = [];
  const resultSignals = [];
  const performanceSignals = [];
  const checkpoint = [];
  const identitySignal = null;
  const programPhase = null;
  const nextWeekAdjustment = null;
  const recoveryBias = null;
  const launchContext = null;
  const preferenceInfluence = null;
  const whyThisMattersNotes = [];
  const premiumOutcomeLayer = useMemo(
    () => getPremiumOutcomeLayer(accessTier, { surface: "plan" }),
    [accessTier]
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
        surface: "plan",
        upgradeMoment
      }),
    [accessTier, upgradeMoment]
  );
  const companionAction = null;
  const continuityContext = {
    title: "Stay consistent this week",
    detail: "Use the plan page to keep the week organized without layered coaching prompts."
  };
  const trustCue = null;
  const smartRotationStatus = null;
  const systemConfidenceSignal = null;
  const primarySignal = null;

  React.useEffect(() => {
    if (!token || !safeProfile.trainingEnvironment) {
      return;
    }

    const preferredEnvironment = safeProfile.trainingEnvironment === "hybrid" ? "both" : safeProfile.trainingEnvironment;
    const preferredEquipment = Array.isArray(safeProfile.equipmentSelections) ? safeProfile.equipmentSelections.join(",") : "";
    const params = new URLSearchParams({
      environment: preferredEnvironment,
      focus: currentPlanFocus || "recommended"
    });
    if (preferredEquipment) {
      params.set("equipmentSelections", preferredEquipment);
    }

    apiRequest(`/workout-library?${params.toString()}`, {}, token)
      .then((payload) => {
        const workouts = payload.workouts || [];
        setRecommendedWorkoutPool(workouts);
        setRecommendedWorkout(workouts[0] || null);
      })
      .catch(() => {
        setRecommendedWorkoutPool([]);
        setRecommendedWorkout(null);
      });
  }, [accessTier, currentPlanFocus, safeProfile.equipmentSelections, safeProfile.goalType, safeProfile.trainingEnvironment, token, workoutMemory]);

  if (loading) {
    return <div className="screen-center">Loading your plan...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load your weekly plan."}</div>;
  }

  const hasPlanAccess = hasFullWorkoutAccess(accessTier);
  const weeklyPlanPrompt = hasPlanAccess
    ? null
    : getUpgradePrompt({
        surface: "weekly-plan",
        profile: safeProfile,
        activeModules: safeSummary.activeModules,
        weeklyPlan: safeSummary.planSummary
      });

  const openWeeklyPlan = async () => {
    setOpening(true);
    setFeedback("");
    try {
      const payload = await apiRequest(
        "/weekly-plan",
        hasPlanAccess
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
      setOpening(false);
    }
  };

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setFeedback("");
    try {
      await startUpgradeCheckoutFlow(billingInterval, checkoutMode);
    } catch (loadError) {
      setFeedback(loadError.message);
    }
  };

  return (
    <div className="page-grid page-grid-tight editorial-sections">
      <section className="module-page-hero">
        <div>
          <p className="badge">Plan</p>
          <h2>{summary.planSummary?.weeklyFocus || "Your adaptive weekly plan"}</h2>
          <p className="lead-copy">
            {programSummary || "This page keeps your weekly plan organized around your current setup, available tools, and next recommended actions."}
          </p>
        </div>
        <div className="module-page-actions">
          <button className="primary-button" disabled={opening} type="button" onClick={openWeeklyPlan}>
            {opening ? "Opening plan..." : hasPlanAccess ? "Open full weekly plan" : "Preview weekly plan"}
          </button>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      <div className="module-note">
        <strong>{launchContext?.launchLabel || "Plan overview"}</strong>
        <p className="support-copy">{launchContext?.launchSummary || "Use this space to review the week at a high level before opening a full plan preview or jumping into workouts."}</p>
      </div>

      <div className="content-grid">
        <Panel eyebrow="Program" title="What this block is trying to do">
          <div className="module-note">
            <strong>{focusLabel || "This plan"} is leading this week.</strong>
            <p className="support-copy">{programSummary || "The weekly plan stays centered on a simple structure so you can review the week without extra coaching overlays."}</p>
          </div>
          {trustCue ? <p className="support-copy recommendation-context-note">{trustCue}</p> : null}
          {preferenceInfluence?.items?.length ? (
            <div className="module-note">
              <strong>{preferenceInfluence.primary}</strong>
              <p className="support-copy">{preferenceInfluence.summary}</p>
            </div>
          ) : null}
          {primarySignal ? (
            <div className="module-note">
              <strong>{primarySignal.title}</strong>
              <p className="support-copy">{primarySignal.detail}</p>
            </div>
          ) : null}
          <div className="module-note">
            <strong>Current phase: Weekly overview</strong>
            <p className="support-copy">{programPhase?.detail || "Your plan stays visible here without progression overlays."}</p>
          </div>
          <div className="module-note">
            <strong>{weeklyStructure?.summary || continuityContext.title}</strong>
            <p className="support-copy">
              {workoutMomentum.weeklyCompletionCount
                ? `You have already logged ${workoutMomentum.weeklyCompletionCount} session${workoutMomentum.weeklyCompletionCount === 1 ? "" : "s"} this week, so the next workout should fit the broader pattern instead of repeating blindly.`
                : continuityContext.detail || "The first session of the week should set the direction cleanly instead of forcing too many choices."}
            </p>
          </div>
          <div className="module-note">
            <strong>Next week likely emphasis</strong>
            <p className="support-copy">{nextWeekAdjustment?.detail || "Use the weekly check-in before changing your next block."}</p>
          </div>
          {performanceSignals?.summaryLine ? (
            <div className="module-note">
              <strong>Performance trend</strong>
              <p className="support-copy">{performanceSignals.summaryLine}</p>
            </div>
          ) : null}
          {systemConfidenceSignal ? (
            <div className="module-note">
              <strong>This is working</strong>
              <p className="support-copy">{systemConfidenceSignal}</p>
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
        </Panel>

        {recommendedWorkout ? (
          <Panel eyebrow="Next workout" title="Your next recommended workout">
            <div className="module-note">
              <strong>{recommendedWorkout.name}</strong>
              <p className="support-copy">{recommendationExplanation?.shortLabel || "Next recommended session"}</p>
              <p className="support-copy">{recommendationExplanation?.supportingReason}</p>
              {alternativeWorkoutCount ? <p className="support-copy">{alternativeWorkoutCount} alternate sessions are ready in Workouts.</p> : null}
              {smartRotationStatus ? <p className="support-copy recommendation-context-note">{smartRotationStatus.label}</p> : null}
              {performanceSignals?.summaryLine ? <p className="support-copy">{performanceSignals.summaryLine}</p> : null}
              {!hasPlanAccess ? <p className="support-copy">{premiumComparison.availableNow}</p> : null}
              {!hasPlanAccess ? <p className="support-copy">{premiumComparison.premiumLine || premiumOutcomeLayer.detail}</p> : null}
              {!hasPlanAccess && upgradeMoment ? <p className="support-copy">{upgradeMoment.detail}</p> : null}
              <div className="module-card-actions">
                <Link className="primary-button module-link" to="/workouts">
                  {recommendedWorkout.lockedForAccess ? "Review workout" : "Start or review"}
                </Link>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel eyebrow="Next workout" title="Your next recommended workout">
            <div className="module-note">
              <strong>{continuityContext.title}</strong>
              <p className="support-copy">{continuityContext.detail}</p>
              <div className="module-card-actions">
                <Link className="primary-button module-link" to="/workouts">
                  Open Workouts
                </Link>
              </div>
            </div>
          </Panel>
        )}
      </div>

      <div className="content-grid">
        <Panel eyebrow="This week" title={summary.planSummary?.weeklyFocus || "Weekly focus"}>
          <div className="section-context">
            <span className="section-context-label">Weekly strategy</span>
            <p>{launchContext?.weekIntent || "Use this as the target for the week so workouts and supporting tools stay organized around one clear direction."}</p>
          </div>
          <div className="module-note">
            <strong>{summary.planSummary?.workoutCadence || "Keep the week simple and repeatable."}</strong>
            <p className="support-copy">{summary.planSummary?.focusReason || summary.todayFocus?.whyThisMatters}</p>
          </div>
          {summary.planSummary?.suggestedWorkoutMix?.intensityGuidance ? (
            <div className="module-note">
              <strong>Intensity direction</strong>
              <p className="support-copy">{summary.planSummary.suggestedWorkoutMix.intensityGuidance}</p>
            </div>
          ) : null}
          {summary.planSummary?.mobilityBlock?.weeklyTarget ? (
            <div className="module-note">
              <strong>Mobility target</strong>
              <p className="support-copy">{summary.planSummary.mobilityBlock.weeklyTarget}</p>
            </div>
          ) : null}
          {summary.planSummary?.suggestedWorkoutMix?.recommendedFocuses?.length ? (
            <div className="module-note">
              <strong>Suggested split options</strong>
              <p className="support-copy">{summary.planSummary.suggestedWorkoutMix.recommendedFocuses.join(" · ")}</p>
            </div>
          ) : null}
          <ul className="plan-list">
            {(summary.planSummary?.suggestedWorkoutMix?.split || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {summary.weeklyCheckIn?.nextWeekAdjustments?.length ? (
            <div className="module-note">
              <strong>What the weekly check-in is changing</strong>
              <p className="support-copy">{summary.weeklyCheckIn.nextWeekAdjustments[0]}</p>
            </div>
          ) : null}
        </Panel>

        <Panel eyebrow="Why this works" title="Built from your actual data">
          <div className="module-note">
            <strong>{summary.whyThisWorks?.trustNote}</strong>
            <p className="support-copy">{summary.whyThisWorks?.body}</p>
          </div>
          <div className="module-note">
            <strong>Current phase: Weekly overview</strong>
            <p className="support-copy">{programPhase?.detail || "Plan details stay accessible here without extra coaching signals."}</p>
          </div>
          {summary.resultProjection ? (
            <div className="module-note">
              <strong>{summary.resultProjection.summary}</strong>
              <p className="support-copy">{summary.resultProjection.confidence}</p>
            </div>
          ) : null}
        </Panel>
      </div>

      {weeklyStructure?.days?.length ? (
        <Panel eyebrow="This week's structure" title="A simple shape for the week">
          <div className="weekly-structure-grid">
            {weeklyStructure.days.map((entry) => {
              const isTodayFocus = recommendedWorkout && normalizeFocusKey(recommendedWorkout.focus || recommendedWorkout.focusLabel) === normalizeFocusKey(entry.focus || entry.label);
              return (
                <article className={`weekly-structure-card ${isTodayFocus ? "weekly-structure-card-active" : ""}`} key={`plan-week-${entry.day}`}>
                  <p className="section-label">Day {entry.day}</p>
                  <h4>{entry.label}</h4>
                  <p className="support-copy">{entry.title}</p>
                  {isTodayFocus ? <p className="recommendation-context-note">Today&apos;s recommended session fits here.</p> : null}
                </article>
              );
            })}
          </div>
        </Panel>
      ) : (
        <Panel eyebrow="This week's structure" title="A simple shape for the week">
          <div className="module-note">
            <strong>{continuityContext.title}</strong>
            <p className="support-copy">{continuityContext.detail}</p>
          </div>
        </Panel>
      )}

      {!hasPlanAccess && weeklyPlanPrompt && upgradeMoment ? (
        <UpgradePrompt compact prompt={{ ...weeklyPlanPrompt, contextNote: upgradeMoment.detail }} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
      ) : null}

      {summary.planSummary?.suggestedWorkoutMix?.featuredMovements?.length ? (
        <Panel eyebrow="Movement highlights" title="The week is built around these key patterns">
          <div className="section-context">
            <span className="section-context-label">Start-to-finish guides</span>
            <p>Open any movement to see the full visual sequence, cues, and example video support before you train.</p>
          </div>
          <div className="module-card-grid">
            {summary.planSummary.suggestedWorkoutMix.featuredMovements.map((movement) => {
              const visual = resolveMovementVisual(movement);
              return (
                <article
                  className="module-card module-card-clickable"
                  key={movement.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openMovementGuide(movement)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openMovementGuide(movement);
                    }
                  }}
                >
                  <div className="library-card-hero">
                    {visual.mode === "image" ? (
                      <img alt={visual.alt} className="library-card-thumb" loading="lazy" src={getExerciseImageSrc(visual.src)} />
                    ) : (
                      <div className="library-card-thumb library-card-thumb-placeholder movement-image-fallback">
                        <span>{visual.initials}</span>
                        <small>{visual.label}</small>
                      </div>
                    )}
                    <div className="library-card-hero-copy">
                      <span className="library-depth-note">Built into this week&apos;s plan</span>
                      <span className="library-depth-note">
                        {getGuideStatusLabel(movement)}
                      </span>
                    </div>
                  </div>
                  <p className="section-label">{movement.category}</p>
                  <h4>{movement.name}</h4>
                  <p className="support-copy">
                    {(movement.primaryMuscles || []).join(", ")}
                    {movement.secondaryMuscles?.length ? ` · Supports ${movement.secondaryMuscles[0]}` : ""}
                  </p>
                  <div className="module-card-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openMovementGuide(movement);
                      }}
                    >
                      Open guide
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <Panel eyebrow="Plan library" title="Browse original PulsePeak training paths">
        <div className="section-context">
          <span className="section-context-label">Plan discovery</span>
          <p>Browse the paths that best fit your goal, schedule, equipment, and recovery style, then let the weekly plan shape workouts, mobility, and your next move.</p>
        </div>
        <div className="selector-row">
          <button
            className={`selector-pill ${selectedPlanCategory === "all" ? "selector-pill-active" : ""}`}
            type="button"
            onClick={() => setSelectedPlanCategory("all")}
          >
            <strong>All plan paths</strong>
            <span>See the broader plan library</span>
          </button>
          {PLAN_DISCOVERY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedPlanCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedPlanCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <label>
            Goal
            <select value={selectedGoalFilter} onChange={(event) => setSelectedGoalFilter(event.target.value)}>
              <option value="all">Any goal</option>
              <option value="general_fitness">General fitness</option>
              <option value="strength">Strength</option>
              <option value="bodybuilding">Build muscle</option>
              <option value="fat_loss">Lose fat</option>
              <option value="mobility">Mobility</option>
              <option value="athletic_performance">Performance</option>
            </select>
          </label>
          <label>
            Equipment
            <select value={selectedEquipmentFilter} onChange={(event) => setSelectedEquipmentFilter(event.target.value)}>
              <option value="all">Any setup</option>
              <option value="bodyweight">Bodyweight</option>
              <option value="dumbbells_only">Dumbbells only</option>
              <option value="bench_dumbbells">Bench + dumbbells</option>
              <option value="hybrid">Hybrid setup</option>
              <option value="full_gym">Full gym</option>
            </select>
          </label>
          <label>
            Recovery emphasis
            <select value={selectedRecoveryFilter} onChange={(event) => setSelectedRecoveryFilter(event.target.value)}>
              <option value="all">Any recovery profile</option>
              <option value="balanced">Balanced</option>
              <option value="joint_friendly">Joint-friendly</option>
              <option value="recovery_focused">Recovery-focused</option>
              <option value="performance">Performance support</option>
            </select>
          </label>
          <label>
            Environment
            <select value={selectedEnvironmentFilter} onChange={(event) => setSelectedEnvironmentFilter(event.target.value)}>
              <option value="all">Home or gym</option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
        </div>
        <div className="module-card-grid">
          {planLibrary.slice(0, 9).map((plan) => (
            <article className="module-card" key={plan.id}>
              <p className="section-label">{plan.title}</p>
              <h4>{formatPlanCategory(plan.category)}</h4>
              <p className="support-copy">{plan.summary}</p>
              <p className="support-copy">
                {plan.guidance.focus}
              </p>
              <p className="support-copy">
                Works best with {plan.equipment.map((item) => item.replaceAll("_", " ")).join(", ")} · {plan.recoveryProfile.replaceAll("_", " ")}
              </p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Tools" title="Tools that keep your week practical">
        <div className="section-context">
          <span className="section-context-label">Support layer</span>
          <p>These tools keep history, progression, recovery, and daily decisions easy to return to without turning the app into clutter.</p>
        </div>
        <div className="module-card-grid">
          {toolsByCategory.map((category) => (
            <article className="module-card" key={category.id}>
              <p className="section-label">{category.label}</p>
              <h4>{category.description}</h4>
              <ul className="plan-list compact-plan-list">
                {category.items.map((tool) => (
                  <li key={tool.id}>
                    <Link className="module-link" to={tool.to}>
                      {tool.title}
                    </Link>
                    <span className="support-copy">{tool.summary}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Panel>

      {!hasPlanAccess && weeklyPlanPrompt && !upgradeMoment ? (
        <UpgradePrompt compact prompt={weeklyPlanPrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
      ) : null}

      <WeeklyPlanPreviewModal
        planPayload={weeklyPlanState}
        onClose={() => setWeeklyPlanState(null)}
        onUpgrade={startUpgradeCheckout}
        onOpenMovement={openMovementGuide}
      />
      <MovementDetailModal
        movement={selectedMovement}
        movementId={selectedMovement?.detailId || selectedMovement?.guideTargetId || selectedMovement?.id}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}

function rankPlan(plan, { goalType, equipmentProfile, environment, recoveryBias }) {
  let score = 0;
  if (plan.goal === goalType) score += 5;
  if (plan.equipment.includes(equipmentProfile)) score += 4;
  if (plan.environment.includes(environment)) score += 3;
  if (plan.recoveryProfile === recoveryBias) score += 2;
  return score;
}

function formatPlanCategory(value) {
  return PLAN_DISCOVERY_CATEGORIES.find((category) => category.id === value)?.label || value.replaceAll("_", " ");
}

function normalizeFocusKey(value = "") {
  const normalized = String(value || "")
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll("/", " ")
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (["legs", "glutes"].includes(normalized)) {
    return "lower_body";
  }
  if (normalized === "recovery_day") {
    return "mobility_recovery";
  }
  return normalized;
}
