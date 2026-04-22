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
import { PLAN_DISCOVERY_CATEGORIES, PLAN_LIBRARY, TOOL_CATEGORIES, TOOL_LIBRARY } from "../../shared/libraryTaxonomy.js";

export default function PlanPage() {
  const { token, isPremium } = useAuth();
  const { data, summary, loading, error } = useDashboardData();
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [opening, setOpening] = useState(false);
  const [selectedPlanCategory, setSelectedPlanCategory] = useState("all");
  const [selectedGoalFilter, setSelectedGoalFilter] = useState("all");
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState("all");
  const [selectedRecoveryFilter, setSelectedRecoveryFilter] = useState("all");
  const [selectedEnvironmentFilter, setSelectedEnvironmentFilter] = useState("all");
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const safeProfile = data?.profile || {};
  const safeSummary = summary || {};
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

  if (loading) {
    return <div className="screen-center">Loading your plan...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load your weekly plan."}</div>;
  }

  const weeklyPlanPrompt = isPremium
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
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Plan</p>
          <h2>{summary.planSummary?.weeklyFocus || "Your adaptive weekly plan"}</h2>
          <p className="lead-copy">
            This week stays centered on the work that matters most for your goal, recovery, and training setup.
          </p>
        </div>
        <div className="module-page-actions">
          <button className="primary-button" disabled={opening} type="button" onClick={openWeeklyPlan}>
            {opening ? "Opening plan..." : isPremium ? "Open full weekly plan" : "Preview weekly plan"}
          </button>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      <div className="content-grid">
        <Panel eyebrow="This week" title={summary.planSummary?.weeklyFocus || "Weekly focus"}>
          <div className="section-context">
            <span className="section-context-label">Weekly strategy</span>
            <p>Use this as the target for the week so your workouts, mobility work, and recovery all pull in the same direction.</p>
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
          {summary.resultProjection ? (
            <div className="module-note">
              <strong>{summary.resultProjection.summary}</strong>
              <p className="support-copy">{summary.resultProjection.confidence}</p>
            </div>
          ) : null}
        </Panel>
      </div>

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

      <Panel eyebrow="Tools" title="Use the support tools that keep the system practical">
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

      {!isPremium && weeklyPlanPrompt ? (
        <UpgradePrompt compact prompt={weeklyPlanPrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
      ) : null}

      <WeeklyPlanPreviewModal
        planPayload={weeklyPlanState}
        onClose={() => setWeeklyPlanState(null)}
        onUpgrade={startUpgradeCheckout}
        onOpenMovement={setSelectedMovement}
      />
      <MovementDetailModal movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
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
