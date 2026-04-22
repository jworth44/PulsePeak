import React from "react";
import { getUpgradePrompt } from "../config/upgradePrompts";
import MovementReference from "./MovementReference";
import UpgradePrompt from "./UpgradePrompt";
import { useAuth } from "../state/AuthContext";
import { formatHeight, formatWeight, normalizeUnitPreference } from "../../shared/unitSystem";

export default function WeeklyPlanPreviewModal({ planPayload, onClose, onUpgrade, onOpenMovement }) {
  const { isPremium, accessTier, user } = useAuth();

  if (!planPayload?.plan) {
    return null;
  }

  const { plan, message, previewMode } = planPayload;
  const adaptiveSignals = plan.adaptiveSignals || [];
  const executionPriorities = plan.executionPriorities || [];
  const weeklyRationale = plan.weeklyRationale || [];
  const mobilityBlock = plan.mobilityBlock || null;
  const activeModuleIds = new Set((plan.activeModules || []).map((module) => module.id));
  const showNutrition = activeModuleIds.has("nutrition");
  const showHydration = activeModuleIds.has("hydration");
  const showMobility = activeModuleIds.has("mobility");
  const unitPreference = normalizeUnitPreference(plan.goalProfile?.unitPreference);
  const sanitizeNutritionText = (value) => String(value || "").replaceAll("Ã‚Â·", " - ").replaceAll("Â·", " - ");
  const weeklyPlanPrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "weekly-plan",
        profile: {
          goalType: plan.goalProfile?.goalType,
          nutritionMode: plan.nutritionMode,
          injuryStatus: plan.goalProfile?.injuryStatus
        },
        activeModules: plan.activeModules || [],
        weeklyPlan: plan
      });

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="modal-card weekly-plan-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="section-label">Premium weekly plan</p>
            <h3>{plan.weeklyFocus}</h3>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {!isPremium && previewMode ? (
          <div className="limited-preview-banner">
            <span className="focus-step">Limited preview</span>
            <strong>{message || "This is a temporary Premium preview for this session only."}</strong>
          </div>
        ) : null}

        <div className="weekly-plan-layout">
          <article className="weekly-plan-block">
            <p className="section-label">Weekly focus</p>
            <span className="section-chip">Focus</span>
            <strong>{plan.weeklyFocus}</strong>
            <p className="muted">{plan.focusReason || plan.previewNote || plan.coachNote}</p>
          </article>

          {plan.resultProjection ? (
            <article className="weekly-plan-block">
              <p className="section-label">Expected direction</p>
              <span className="section-chip">Results</span>
              <strong>{plan.resultProjection.summary}</strong>
              <p className="muted">{plan.resultProjection.confidence}</p>
            </article>
          ) : null}

          <article className="weekly-plan-block">
            <p className="section-label">{isPremium ? "Coach note" : "Preview note"}</p>
            <span className="section-chip">Guide</span>
            <strong>{isPremium ? "Why the week is set up this way" : "What this preview is showing you"}</strong>
            <p className="muted">{plan.coachNote}</p>
          </article>

          {plan.whyThisWorks ? (
            <article className="weekly-plan-block">
              <p className="section-label">Why this works</p>
              <span className="section-chip">Trust</span>
              <strong>{plan.whyThisWorks.trustNote}</strong>
              <p className="muted">{plan.whyThisWorks.body}</p>
            </article>
          ) : null}

          <article className="weekly-plan-block">
            <p className="section-label">Workout cadence</p>
            <span className="section-chip">Cadence</span>
            <strong>{plan.workoutCadence}</strong>
            <p className="muted">{plan.suggestedWorkoutMix.intensityGuidance}</p>
          </article>

          <article className="weekly-plan-block">
            <p className="section-label">Workout mix</p>
            <span className="section-chip">Training</span>
            <strong>
              {plan.suggestedWorkoutMix.environment === "both"
                ? "Gym + Home blend"
                : `${plan.suggestedWorkoutMix.environment} leaning week`}
            </strong>
            <ul className="plan-list">
              {plan.suggestedWorkoutMix.split.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {(plan.suggestedWorkoutMix.featuredMovements || []).length ? (
              <div className="movement-chip-list">
                {plan.suggestedWorkoutMix.featuredMovements.map((movement) => (
                  <MovementReference compact key={movement.id} movement={movement} onClick={onOpenMovement} />
                ))}
              </div>
            ) : null}
            {plan.suggestedWorkoutMix.rationale ? <p className="muted">{plan.suggestedWorkoutMix.rationale}</p> : null}
          </article>

          {plan.goalProfile ? (
            <article className="weekly-plan-block">
              <p className="section-label">Personalization</p>
              <span className="section-chip">Profile</span>
              <strong>{plan.goalProfile.label}</strong>
              <p className="muted">
                {plan.goalProfile.trainingEnvironment} setup - {plan.goalProfile.experienceLevel} - {plan.goalProfile.ageGroup}
                {plan.goalProfile.injuryStatus !== "none" ? ` - ${plan.goalProfile.injuryStatus.replace("_", " ")}` : ""}
              </p>
              {plan.goalProfile.currentWeight || plan.goalProfile.heightCm ? (
                <p className="muted">
                  {formatWeight(plan.goalProfile.currentWeight, unitPreference)} - {formatHeight(plan.goalProfile.heightCm, unitPreference)}
                  {plan.goalProfile.targetWeight ? ` - target ${formatWeight(plan.goalProfile.targetWeight, unitPreference)}` : ""}
                </p>
              ) : null}
            </article>
          ) : null}

          {plan.recoveryEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">Recovery emphasis</p>
              <span className="section-chip">Recovery</span>
              <strong>Protect recovery quality</strong>
              <p className="muted">{plan.recoveryEmphasis}</p>
            </article>
          ) : null}

          {showNutrition && plan.nutritionEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">{plan.nutritionMode === "full" ? "Nutrition guidance" : "Protein guidance"}</p>
              <span className="section-chip">Fuel</span>
              <strong>{plan.nutritionMode === "full" ? "Fuel the week on purpose" : "Keep protein support simple and steady"}</strong>
              <p className="muted">{plan.nutritionEmphasis}</p>
              {plan.nutritionTargets ? (
                <div className="movement-chip-list">
                  {plan.nutritionMode === "full" && plan.nutritionTargets.calorieRangeLabel ? (
                    <div className="insight-chip">
                      <strong>Calories</strong>
                      <p className="muted">{plan.nutritionTargets.calorieRangeLabel}</p>
                    </div>
                  ) : null}
                  <div className="insight-chip">
                    <strong>Protein</strong>
                    <p className="muted">{plan.nutritionTargets.proteinRangeLabel}</p>
                  </div>
                  <div className="insight-chip">
                    <strong>Hydration</strong>
                    <p className="muted">{plan.nutritionTargets.hydrationTargetLabel}</p>
                  </div>
                </div>
              ) : null}
              {plan.nutritionTargets?.todayDirection ? (
                <div className="module-note">
                  <strong>{plan.nutritionTargets.todayDirection.title}</strong>
                  <p className="support-copy">{plan.nutritionTargets.todayDirection.summary}</p>
                  {(plan.nutritionTargets.todayDirection.freeSteps || []).length ? (
                    <ul className="plan-list compact-plan-list">
                      {plan.nutritionTargets.todayDirection.freeSteps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              {plan.nutritionTargets?.mealDirection?.length ? (
                <ul className="plan-list">
                  {plan.nutritionTargets.mealDirection.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {plan.nutritionTargets?.todaysActions?.length ? (
                <>
                  <p className="section-label">What to do today</p>
                  <ul className="plan-list">
                    {plan.nutritionTargets.todaysActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {plan.nutritionTargets?.templates?.length ? (
                <>
                  <p className="section-label">Repeatable templates</p>
                  <div className="module-card-grid nutrition-template-grid">
                    {plan.nutritionTargets.templates.map((item) => (
                      <article key={item.id || item.title} className="module-card nutrition-template-card">
                        <p className="section-label">{item.title}</p>
                        <strong>{item.combo}</strong>
                        <p className="support-copy">{sanitizeNutritionText(item.nutrition)}</p>
                        <p className="support-copy">{item.whenToUse}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
              {isPremium && plan.nutritionTargets?.why ? <p className="muted">{plan.nutritionTargets.why}</p> : null}
              {isPremium && plan.nutritionTargets?.targetWeightNote ? <p className="muted">{plan.nutritionTargets.targetWeightNote}</p> : null}
            </article>
          ) : null}

          {showHydration && plan.hydrationEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">Hydration floor</p>
              <span className="section-chip">Hydration</span>
              <strong>{plan.hydrationEmphasis}</strong>
              <p className="muted">Built from your current goal and recent gaps.</p>
            </article>
          ) : null}

          {showMobility && mobilityBlock ? (
            <article className="weekly-plan-block">
              <p className="section-label">Mobility block</p>
              <span className="section-chip">Mobility</span>
              <strong>{mobilityBlock.title}</strong>
              <p className="muted">{mobilityBlock.reason || mobilityBlock.weeklyTarget}</p>
              <ul className="plan-list">
                {(mobilityBlock.warmup || []).map((item) => (
                  <li key={`warmup-${item.name}`}>
                    {item.movement ? (
                      <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Warm-up" />
                    ) : (
                      `Warm-up: ${item.name}`
                    )}
                  </li>
                ))}
                {(mobilityBlock.cooldown || []).map((item) => (
                  <li key={`cooldown-${item.name}`}>
                    {item.movement ? (
                      <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Cooldown" />
                    ) : (
                      `Cooldown: ${item.name}`
                    )}
                  </li>
                ))}
                {isPremium
                  ? (mobilityBlock.recoveryDay || []).map((item) => (
                      <li key={`recovery-${item.name}`}>
                        {item.movement ? (
                          <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Recovery day" />
                        ) : (
                          `Recovery day: ${item.name}`
                        )}
                      </li>
                    ))
                  : null}
              </ul>
              {mobilityBlock.weeklyTarget ? <p className="muted">{mobilityBlock.weeklyTarget}</p> : null}
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Adaptive signals</p>
              <span className="section-chip">Signals</span>
              <strong>What is driving this plan</strong>
              <ul className="plan-list">
                {adaptiveSignals.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Execution priorities</p>
              <span className="section-chip">Actions</span>
              <strong>What to actually do this week</strong>
              <ul className="plan-list">
                {executionPriorities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Plan rationale</p>
              <span className="section-chip">Why</span>
              <strong>Why Premium feels different</strong>
              <ul className="plan-list">
                {weeklyRationale.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {plan.habitAnchor ? <p className="muted">{plan.habitAnchor}</p> : null}
            </article>
          ) : null}
        </div>

        {isPremium ? (
          <div className="plan-preview-upgrade">
            <div>
              <p className="section-label">{accessTier === "trial_active" ? "Trial access active" : "Premium unlocked"}</p>
              <strong>{accessTier === "trial_active" ? "Your full weekly plan is active during the trial." : "Your full weekly plan is active."}</strong>
              <p className="muted">
                {accessTier === "trial_active"
                  ? `Your trial includes adaptive rationale, execution priorities, and richer weekly adjustments${user?.trialEndsLabel ? ` until ${user.trialEndsLabel}` : ""}. Then it renews yearly at $119.99/year unless canceled before trial ends.`
                  : "This plan now includes adaptive rationale, execution priorities, and richer weekly adjustments built from your latest data."}
              </p>
            </div>
          </div>
        ) : (
          <div className="plan-preview-upgrade">
            <UpgradePrompt compact prompt={weeklyPlanPrompt} onUpgrade={onUpgrade} />
          </div>
        )}
      </div>
    </div>
  );
}
