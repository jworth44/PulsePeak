import React, { useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import ActivityList from "../components/ActivityList";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { getNutritionTemplateMedia } from "../../shared/nutritionMedia";
import {
  convertHydrationToStored,
  formatHydration,
  normalizeUnitPreference
} from "../../shared/unitSystem";

function sanitizeNutritionText(value) {
  return String(value || "").replaceAll("Ã‚Â·", " - ").replaceAll("Â·", " - ");
}

export default function NutritionPage() {
  const { isPremium, workoutMemory, workoutMomentum } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [saving, setSaving] = useState("");
  const [feedback, setFeedback] = useState("");
  const [proteinCheckIn, setProteinCheckIn] = useState({ source: "", protein: "" });

  if (loading) {
    return <div className="screen-center">Loading nutrition...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load nutrition."}</div>;
  }

  const nutritionMode = data.profile.nutritionMode || "off";
  const unitPreference = normalizeUnitPreference(data.profile.unitPreference);
  const hydrationStep = unitPreference === "metric" ? 0.5 : 16;
  const hydrationStepStored = convertHydrationToStored(hydrationStep, unitPreference);
  const guidance = summary.nutritionGuidance;
  const visibleTemplates = isPremium ? guidance?.templates || [] : (guidance?.templates || []).slice(0, 2);
  const todayDirectionSteps = isPremium
    ? [...(guidance?.todayDirection?.freeSteps || []), ...(guidance?.todayDirection?.premiumSteps || [])]
    : guidance?.todayDirection?.freeSteps || [];
  const recoveryBias = null;
  const continuityContext = {
    title: "Keep nutrition practical",
    detail: "Use the nutrition layer for clear daily direction without extra recovery or coaching overlays."
  };

  const addMeal = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSaving("meal");
    setFeedback("");
    try {
      await mutate("/meals", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          calories: Number(form.get("calories")),
          protein: Number(form.get("protein"))
        })
      });
      formElement.reset();
      setFeedback("Meal logged.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  const addProteinCheckIn = async (event) => {
    event.preventDefault();
    setSaving("protein");
    setFeedback("");
    try {
      await mutate("/protein-checkins", {
        method: "POST",
        body: JSON.stringify({
          source: proteinCheckIn.source,
          protein: Number(proteinCheckIn.protein)
        })
      });
      setProteinCheckIn({ source: "", protein: "" });
      setFeedback("Protein check-in logged.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  const addHydration = async () => {
    setSaving("hydration");
    setFeedback("");
    try {
      await mutate("/hydration", {
        method: "POST",
        body: JSON.stringify({ amount: hydrationStepStored })
      });
      setFeedback("Hydration updated.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="page-grid page-grid-tight editorial-sections">
      <section className="module-page-hero">
        <div>
          <p className="badge">Nutrition</p>
          <h2>Turn your targets into food choices you can actually follow today.</h2>
          <p className="lead-copy">
            PulsePeak keeps the numbers practical, then turns them into a few repeatable meals, hydration moves, and simple timing choices that support training and recovery.
          </p>
          <p className="support-copy recommendation-context-note">{continuityContext.title}</p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      {nutritionMode === "off" ? (
        <Panel eyebrow="Nutrition mode" title="Nutrition is currently turned off">
          <div className="module-note">
            <strong>Turn nutrition guidance back on if you want today&apos;s food direction, protein tracking, and hydration support to shape the week.</strong>
            <p className="support-copy">Use the quick action below if you want the nutrition layer back without digging through other settings.</p>
          </div>
          <div className="module-card-actions">
            <button
              className="primary-button"
              disabled={saving === "nutrition-show"}
              type="button"
              onClick={async () => {
                setSaving("nutrition-show");
                setFeedback("");
                try {
                  await mutate("/profile", {
                    method: "PATCH",
                    body: JSON.stringify({ nutritionMode: "basic" })
                  });
                  setFeedback("Nutrition guidance is back on.");
                } catch (mutationError) {
                  setFeedback(mutationError.message);
                } finally {
                  setSaving("");
                }
              }}
            >
              {saving === "nutrition-show" ? "Turning on..." : "Show nutrition guidance"}
            </button>
            <Link className="ghost-button module-link" to="/preferences">
              Edit preferences
            </Link>
          </div>
        </Panel>
      ) : (
        <>
          <div className="content-grid">
            <Panel eyebrow="Today's food direction" title={guidance?.todayDirection?.title || "Actionable nutrition guidance"}>
              <div className="section-context">
                <span className="section-context-label">Today</span>
                <p>{continuityContext.detail || guidance?.todayDirection?.summary || "These are the easiest nutrition wins left for the day, based on the gaps PulsePeak still sees."}</p>
              </div>
              {todayDirectionSteps.length ? (
                <ul className="plan-list nutrition-action-list">
                  {todayDirectionSteps.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">Log a meal or hydration check-in to sharpen today's food direction.</p>
              )}
              {!isPremium ? (
                <div className="module-note nutrition-premium-note">
                  <strong>Premium adds tighter timing and recovery-aware food direction.</strong>
                  <p className="support-copy">Unlock smarter protein-gap fixes, better workout fueling suggestions, and more specific recovery support.</p>
                </div>
              ) : null}
              {guidance?.todaysActions?.length ? (
                <>
                  <p className="section-label">Quick execution moves</p>
                  <ul className="plan-list compact-plan-list">
                    {guidance.todaysActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Panel>

            <Panel eyebrow="Target guide" title="Numbers that fit the week">
              <div className="module-note">
                <strong>
                  {guidance?.proteinRangeLabel}
                  {nutritionMode === "full" && guidance?.calorieRangeLabel ? ` | ${guidance.calorieRangeLabel}` : ""}
                </strong>
                <p className="support-copy">{guidance?.why}</p>
              </div>
              <div className="module-note">
                <strong>Hydration floor: {guidance?.hydrationTargetLabel || formatHydration(data.goals.water, unitPreference)}</strong>
                <p className="support-copy">
                  Current intake: {formatHydration(data.waterIntake, unitPreference)}. Add a quick hydration step before your next meal or session.
                </p>
              </div>
              {guidance?.bodyProfileNote ? (
                <div className="module-note">
                  <strong>Built from your saved body profile</strong>
                  <p className="support-copy">{guidance.bodyProfileNote}</p>
                </div>
              ) : null}
            </Panel>
          </div>

          <div className="content-grid">
            <Panel eyebrow="Meal templates" title="Simple food options you can actually repeat">
              {visibleTemplates.length ? (
                <div className="module-card-grid nutrition-template-grid">
                  {visibleTemplates.map((template) => (
                    <article key={template.id || template.title} className="module-card nutrition-template-card">
                      {getNutritionTemplateMedia(template.id)?.image ? (
                        <img
                          alt={getNutritionTemplateMedia(template.id)?.alt || `${template.title} example`}
                          className="nutrition-template-image"
                          loading="lazy"
                          src={getNutritionTemplateMedia(template.id).image}
                        />
                      ) : null}
                      <p className="section-label">{template.title}</p>
                      <strong>{template.combo}</strong>
                      <p className="support-copy">{sanitizeNutritionText(template.nutrition)}</p>
                      <p className="support-copy">{template.whenToUse}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="support-copy">Nutrition templates will show up once your targets and meal data give the plan something to work with.</p>
              )}
              {guidance?.mealDirection?.length ? (
                <>
                  <p className="section-label">How to use them this week</p>
                  <ul className="plan-list">
                    {guidance.mealDirection.map((direction) => (
                      <li key={direction}>{direction}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {!isPremium && (guidance?.templates || []).length > visibleTemplates.length ? (
                <div className="module-note nutrition-premium-note">
                  <strong>Premium shows the fuller nutrition playbook.</strong>
                  <p className="support-copy">You will see the extra template options and more specific recovery and workout-fueling direction.</p>
                </div>
              ) : null}
            </Panel>

            <Panel eyebrow="Hydration" title="Simple hydration support">
              <div className="module-note">
                <strong>{formatHydration(data.waterIntake, unitPreference)} / {formatHydration(data.goals.water, unitPreference)}</strong>
                <p className="support-copy">Use one quick hydration action instead of trying to catch up all at once.</p>
              </div>
              <button className="primary-button" disabled={saving === "hydration"} type="button" onClick={addHydration}>
                {saving === "hydration" ? "Updating..." : `Add ${unitPreference === "metric" ? "500 mL" : "16 oz"}`}
              </button>
            </Panel>
          </div>

          {nutritionMode === "full" ? (
            <Panel eyebrow="Meals" title="Full nutrition logging">
              <form className="stack-form" onSubmit={addMeal}>
                <label>
                  Meal or snack
                  <input maxLength="40" name="name" placeholder="Chicken grain bowl" required type="text" />
                </label>
                <div className="form-grid compact">
                  <label>
                    Calories
                    <input min="0" name="calories" required step="10" type="number" />
                  </label>
                  <label>
                    Protein (g)
                    <input min="0" name="protein" required step="1" type="number" />
                  </label>
                </div>
                <button className="primary-button" disabled={saving === "meal"} type="submit">
                  {saving === "meal" ? "Logging..." : "Log meal"}
                </button>
              </form>
              <ActivityList
                items={data.meals}
                emptyMeta="Add your first meal to start tracking nutrition."
                emptyTitle="No meals logged yet"
                onRemove={(id) => mutate(`/meals/${id}`, { method: "DELETE" })}
                renderMeta={(item) => `${item.calories} kcal | ${item.protein}g protein`}
              />
            </Panel>
          ) : (
            <Panel eyebrow="Protein check-ins" title="Keep the nutrition layer light">
              <form className="stack-form" onSubmit={addProteinCheckIn}>
                <label>
                  Protein source
                  <input
                    maxLength="40"
                    placeholder="Greek yogurt"
                    type="text"
                    value={proteinCheckIn.source}
                    onChange={(event) => setProteinCheckIn((current) => ({ ...current, source: event.target.value }))}
                  />
                </label>
                <label>
                  Protein grams
                  <input
                    min="5"
                    required
                    step="1"
                    type="number"
                    value={proteinCheckIn.protein}
                    onChange={(event) => setProteinCheckIn((current) => ({ ...current, protein: event.target.value }))}
                  />
                </label>
                <button className="primary-button" disabled={saving === "protein"} type="submit">
                  {saving === "protein" ? "Logging..." : "Log protein check-in"}
                </button>
              </form>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
