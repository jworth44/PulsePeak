import React, { useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import {
  EQUIPMENT_PROFILE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  INJURY_STATUS_OPTIONS,
  NUTRITION_MODE_OPTIONS,
  RESTRICTED_AREA_OPTIONS,
  SEX_OPTIONS,
  TRAINING_ENVIRONMENT_OPTIONS,
  UNIT_PREFERENCE_OPTIONS
} from "../config/profileOptions";
import { useAuth } from "../state/AuthContext";
import {
  convertHeightFromStored,
  convertHeightToStored,
  convertWeightFromStored,
  convertWeightToStored,
  normalizeUnitPreference
} from "../../shared/unitSystem";
import { getDefaultEquipmentProfile, getEquipmentOptionsForEnvironment, normalizeEquipmentProfile } from "../../shared/workoutEngine";
import { APP_MODE_OPTIONS, getAppModeLabel } from "../../shared/appModes.js";

const BRAND_LOGO = "/brand/pulsepeak-main-logo.png";

const STEP_TITLES = [
  "Welcome",
  "App mode",
  "Primary goal",
  "Training setup",
  "Nutrition mode",
  "Body and recovery",
  "Review"
];

const ONBOARDING_STEP_MEDIA = {
  0: { src: "/media/onboarding-welcome.png", alt: "Athlete pressing dumbbells in a dark premium gym" },
  1: { src: "/media/onboarding-appmode.png", alt: "Athlete reviewing a fitness app between sets" },
  2: { src: "/media/onboarding/onboarding-6.jpg", alt: "PulsePeak goal selection setup preview" },
  3: { src: "/media/onboarding/onboarding-11.jpg", alt: "PulsePeak training setup preview" },
  4: { src: "/media/onboarding/onboarding-7.jpg", alt: "PulsePeak nutrition mode setup preview" },
  5: { src: "/media/onboarding/onboarding-10.jpg", alt: "PulsePeak body and recovery setup preview" },
  6: { src: "/media/onboarding/onboarding-9.jpg", alt: "PulsePeak review setup preview" }
};

export default function OnboardingFlow({ mode = "onboarding", onComplete }) {
  const { token, user, dashboard, refreshSession } = useAuth();
  const profile = dashboard?.profile || {};
  const initialTrainingEnvironment = profile.trainingEnvironment || "hybrid";
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFailures, setImageFailures] = useState({});
  const [form, setForm] = useState({
    appMode: profile.appMode || "full_system",
    goalType: profile.goalType || "general_fitness",
    nutritionMode: profile.nutritionMode || "basic",
    unitPreference: normalizeUnitPreference(profile.unitPreference),
    ageGroup: profile.ageGroup || "30-39",
    birthdate: profile.birthdate || "",
    experienceLevel: profile.experienceLevel || "beginner",
    trainingEnvironment: initialTrainingEnvironment,
    equipmentProfile: normalizeEquipmentProfile(profile.equipmentProfile, initialTrainingEnvironment),
    injuryStatus: profile.injuryStatus || "none",
    sex: profile.sex || "prefer_not_to_say",
    heightInput: convertHeightFromStored(profile.heightCm, profile.unitPreference),
    currentWeightInput: convertWeightFromStored(profile.currentWeight, profile.unitPreference),
    targetWeightInput: convertWeightFromStored(profile.targetWeight, profile.unitPreference),
    restrictedAreas: profile.restrictedAreas || []
  });

  const totalSteps = STEP_TITLES.length;
  const isLastStep = step === totalSteps - 1;
  const progress = Math.round(((step + 1) / totalSteps) * 100);
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === form.goalType)?.label || "General Fitness";
  const nutritionLabel = NUTRITION_MODE_OPTIONS.find((option) => option.value === form.nutritionMode)?.label || "Basic";
  const showRestrictedAreas = form.injuryStatus !== "none";
  const derivedAgeGroup = React.useMemo(() => deriveAgeGroup(form.birthdate) || form.ageGroup || "30-39", [form.birthdate, form.ageGroup]);
  const sexLabel = SEX_OPTIONS.find((option) => option.value === form.sex)?.label || "Prefer not to say";
  const unitLabel = UNIT_PREFERENCE_OPTIONS.find((option) => option.value === form.unitPreference)?.label || "Imperial";
  const heightUnitLabel = form.unitPreference === "metric" ? "cm" : "in";
  const weightUnitLabel = form.unitPreference === "metric" ? "kg" : "lb";
  const availableEquipmentOptions = useMemo(
    () => getEquipmentOptionsForEnvironment(form.trainingEnvironment),
    [form.trainingEnvironment]
  );
  const equipmentLabel = availableEquipmentOptions.find((option) => option.value === form.equipmentProfile)?.label || "Hybrid";

  const summaryRows = useMemo(
    () => [
      { label: "App mode", value: getAppModeLabel(form.appMode), editStep: 1 },
      { label: "Primary goal", value: goalLabel, editStep: 2 },
      { label: "Training setup", value: `${capitalize(form.experienceLevel)} / ${capitalize(form.trainingEnvironment)} / ${equipmentLabel}`, editStep: 3 },
      { label: "Nutrition mode", value: `${nutritionLabel} / ${unitLabel}`, editStep: 4 },
      {
        label: "Body profile",
        value: `${derivedAgeGroup} / ${sexLabel} / ${form.heightInput || "Height pending"} ${heightUnitLabel} / ${form.currentWeightInput || "Weight pending"} ${weightUnitLabel}`,
        editStep: 5
      },
      {
        label: "Recovery guardrails",
        value: `${formatInjuryStatus(form.injuryStatus)}${form.targetWeightInput ? ` / target ${form.targetWeightInput} ${weightUnitLabel}` : ""}`,
        editStep: 5
      },
      {
        label: "Restricted areas",
        value: showRestrictedAreas && form.restrictedAreas.length ? form.restrictedAreas.map(capitalize).join(", ") : "None selected",
        editStep: 5
      }
    ],
    [
      derivedAgeGroup,
      form.appMode,
      form.currentWeightInput,
      form.equipmentProfile,
      form.experienceLevel,
      form.heightInput,
      form.injuryStatus,
      form.restrictedAreas,
      form.sex,
      form.targetWeightInput,
      form.trainingEnvironment,
      equipmentLabel,
      goalLabel,
      heightUnitLabel,
      nutritionLabel,
      sexLabel,
      showRestrictedAreas,
      unitLabel,
      weightUnitLabel
    ]
  );
  const projectedOutcome = useMemo(() => getProjectedOutcome(form), [form]);
  const whyThisWorksPreview = useMemo(() => getWhyThisWorksPreview(form), [form]);
  const currentPlanFocus = null;
  const onboardingLaunchContext = null;
  const onboardingNudgeKey = useMemo(
    () => `pulsepeak-onboarding-upgrade-nudge:${user?.id || "guest"}`,
    [user?.id]
  );
  const stepMedia = ONBOARDING_STEP_MEDIA[step];

  const updateField = (key, value) => {
      if (key === "unitPreference") {
        setForm((current) => {
        const nextUnitPreference = normalizeUnitPreference(value);
        return {
          ...current,
          unitPreference: nextUnitPreference,
          heightInput: convertUnitInputs(current.heightInput, current.unitPreference, nextUnitPreference, "height"),
          currentWeightInput: convertUnitInputs(current.currentWeightInput, current.unitPreference, nextUnitPreference, "weight"),
          targetWeightInput: convertUnitInputs(current.targetWeightInput, current.unitPreference, nextUnitPreference, "weight")
        };
      });
      return;
    }

    if (key === "trainingEnvironment") {
      setForm((current) => ({
        ...current,
        trainingEnvironment: value,
        equipmentProfile: normalizeEquipmentProfile(current.equipmentProfile, value) || getDefaultEquipmentProfile(value)
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const toggleRestrictedArea = (area) => {
    setForm((current) => ({
      ...current,
      restrictedAreas: current.restrictedAreas.includes(area)
        ? current.restrictedAreas.filter((entry) => entry !== area)
        : [...current.restrictedAreas, area]
    }));
  };

  const goNext = () => {
    const nextError = validateStep(step, form);
    if (nextError) {
      setError(nextError);
      return;
    }
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const validationError = validateStep(step, form);
      if (validationError) {
        throw new Error(validationError);
      }
      await apiRequest(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            appMode: form.appMode,
            goalType: form.goalType,
            nutritionMode: form.nutritionMode,
            unitPreference: form.unitPreference,
            ageGroup: derivedAgeGroup,
            birthdate: form.birthdate,
            experienceLevel: form.experienceLevel,
            trainingEnvironment: form.trainingEnvironment,
            equipmentProfile: form.equipmentProfile,
            injuryStatus: form.injuryStatus,
            sex: form.sex,
            heightCm: convertHeightToStored(form.heightInput, form.unitPreference),
            currentWeight: convertWeightToStored(form.currentWeightInput, form.unitPreference),
            targetWeight: convertWeightToStored(form.targetWeightInput, form.unitPreference),
            restrictedAreas: showRestrictedAreas ? form.restrictedAreas : [],
            onboardingCompleted: true
          })
        },
        token
      );
      if (mode === "onboarding") {
        window.sessionStorage.setItem(onboardingNudgeKey, "true");
      }
      const refreshedSession = await refreshSession(token);
      onComplete?.(refreshedSession?.dashboard?.profile || refreshedSession?.user || null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-shell onboarding-editorial">
      <section className="onboarding-panel onboarding-hero">
        <p className="brand-wordmark onboarding-brand-word" aria-label="PulsePeak">
          Pulse<span className="brand-wordmark-accent">Peak</span>
        </p>
        <p className="badge">{mode === "onboarding" ? "Tailored setup" : "Preferences"}</p>
        <h1>
          {mode === "onboarding"
            ? "Set up PulsePeak once so every screen feels built around you."
            : "Update the adaptive settings that shape your dashboard and weekly plan."}
        </h1>
        <p className="hero-text">
          PulsePeak uses your goal, body profile, preferred units, nutrition depth, and recovery context to shape what appears on the dashboard and how your weekly plan behaves from the first session.
        </p>
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <strong>
            Step {step + 1} of {totalSteps}: {STEP_TITLES[step]}
          </strong>
        </div>
      </section>

      <section className="onboarding-panel onboarding-card">
        {step === 0 ? (
          <StepLayout
            media={stepMedia}
            onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))}
            showFallback={Boolean(imageFailures[step])}
          >
            <div className="onboarding-step">
              <p className="section-label">Welcome</p>
              <h2>Build the version of PulsePeak that actually fits you.</h2>
              <p className="muted">
                This takes about a minute. When you finish, the dashboard, coach, and weekly plan will already feel sharper, cleaner, and more personal than a generic fitness app.
              </p>
              <div className="onboarding-highlights">
                <div className="preview-highlight">
                  <span className="focus-step">Goal-aware</span>
                  <strong>Weekly plan adapts to the result you care about most.</strong>
                </div>
                <div className="preview-highlight">
                  <span className="focus-step">Clutter control</span>
                  <strong>Nutrition, mobility, and other modules appear only when they matter.</strong>
                </div>
                <div className="preview-highlight">
                  <span className="focus-step">Recovery-aware</span>
                  <strong>Injury and recovery inputs shape the training tone from day one.</strong>
                </div>
                <div className="preview-highlight">
                  <span className="focus-step">Body-aware</span>
                  <strong>Weight, height, and birthdate make fueling and hydration guidance more believable.</strong>
                </div>
              </div>
            </div>
          </StepLayout>
        ) : null}

        {step === 1 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
            <div className="onboarding-step">
              <p className="section-label">App mode</p>
              <h2>Choose how you want PulsePeak to work for you.</h2>
              <p className="muted">This is your starting layout, not a permanent lock-in. You can switch it later in Settings whenever you want to open the app up again.</p>
              <div className="goal-card-grid">
                {APP_MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`goal-card ${form.appMode === option.value ? "goal-card-active" : ""}`}
                    aria-pressed={form.appMode === option.value}
                    type="button"
                    onClick={() => updateField("appMode", option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </StepLayout>
        ) : null}

        {step === 2 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
          <div className="onboarding-step">
            <p className="section-label">Primary goal</p>
            <h2>What should PulsePeak optimize first?</h2>
            <div className="goal-card-grid">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`goal-card ${form.goalType === option.value ? "goal-card-active" : ""}`}
                  aria-pressed={form.goalType === option.value}
                  type="button"
                  onClick={() => {
                    updateField("goalType", option.value);
                    updateField("nutritionMode", getSuggestedNutritionMode(option.value, form.nutritionMode));
                  }}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
          </StepLayout>
        ) : null}

        {step === 3 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
          <div className="onboarding-step">
            <p className="section-label">Training setup</p>
            <h2>How should the training side of the app think about you?</h2>
            <div className="profile-grid">
              <label>
                Experience level
                <select value={form.experienceLevel} onChange={(event) => updateField("experienceLevel", event.target.value)}>
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Training environment
                <select value={form.trainingEnvironment} onChange={(event) => updateField("trainingEnvironment", event.target.value)}>
                  {TRAINING_ENVIRONMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Equipment setup
                <select value={form.equipmentProfile} onChange={(event) => updateField("equipmentProfile", event.target.value)}>
                  {availableEquipmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="module-note">
              <strong>{equipmentLabel}</strong>
              <p className="muted">
                PulsePeak uses this to decide which exercises, swaps, and splits make sense before you ever open the workout library.
              </p>
            </div>
          </div>
          </StepLayout>
        ) : null}

        {step === 4 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
          <div className="onboarding-step">
            <p className="section-label">Nutrition mode</p>
            <h2>Choose the nutrition depth and units you want to live in every day.</h2>
            <div className="goal-card-grid">
              {NUTRITION_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`goal-card ${form.nutritionMode === option.value ? "goal-card-active" : ""}`}
                  aria-pressed={form.nutritionMode === option.value}
                  type="button"
                  onClick={() => updateField("nutritionMode", option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            <div className="section-stack">
              <div>
                <p className="section-label">Units</p>
                <p className="muted">Choose the measurement system that should appear in onboarding, planning, and daily tracking.</p>
              </div>
              <div className="goal-card-grid">
                {UNIT_PREFERENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`goal-card ${form.unitPreference === option.value ? "goal-card-active" : ""}`}
                    aria-pressed={form.unitPreference === option.value}
                    type="button"
                    onClick={() => updateField("unitPreference", option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </StepLayout>
        ) : null}

        {step === 5 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
          <div className="onboarding-step">
            <p className="section-label">Body and recovery</p>
            <h2>Give PulsePeak enough context to personalize the week responsibly.</h2>
            <div className="profile-grid">
              <label>
                Birthdate
                <input
                  max={new Date().toISOString().slice(0, 10)}
                  type="date"
                  value={form.birthdate}
                  onChange={(event) => updateField("birthdate", event.target.value)}
                />
              </label>
              <label>
                Sex for training estimates
                <select value={form.sex} onChange={(event) => updateField("sex", event.target.value)}>
                  {SEX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Height ({heightUnitLabel})
                <input
                  min="120"
                  max={form.unitPreference === "metric" ? "230" : "90"}
                  step={form.unitPreference === "metric" ? "1" : "1"}
                  type="number"
                  value={form.heightInput}
                  onChange={(event) => updateField("heightInput", event.target.value)}
                />
              </label>
              <label>
                Current weight ({weightUnitLabel})
                <input
                  min={form.unitPreference === "metric" ? "35" : "80"}
                  max={form.unitPreference === "metric" ? "230" : "500"}
                  step={form.unitPreference === "metric" ? "0.5" : "1"}
                  type="number"
                  value={form.currentWeightInput}
                  onChange={(event) => updateField("currentWeightInput", event.target.value)}
                />
              </label>
              <label>
                Target weight ({weightUnitLabel})
                <input
                  min={form.unitPreference === "metric" ? "35" : "80"}
                  max={form.unitPreference === "metric" ? "230" : "500"}
                  step={form.unitPreference === "metric" ? "0.5" : "1"}
                  type="number"
                  value={form.targetWeightInput}
                  onChange={(event) => updateField("targetWeightInput", event.target.value)}
                />
              </label>
              <label>
                Injury status
                <select value={form.injuryStatus} onChange={(event) => updateField("injuryStatus", event.target.value)}>
                  {INJURY_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="module-note">
              <strong>{derivedAgeGroup} recovery profile</strong>
              <p className="muted">
                PulsePeak uses your birthdate, body profile, and chosen units to tune cadence, recovery emphasis, and rough fueling guidance instead of defaulting everyone to the same week.
              </p>
            </div>
            {showRestrictedAreas ? (
              <div className="section-stack">
                <div>
                  <p className="section-label">Restricted areas</p>
                  <p className="muted">Choose any areas that should make the plan more conservative. You can leave this blank if the limitation is broad.</p>
                </div>
                <div className="chip-toggle-grid">
                  {RESTRICTED_AREA_OPTIONS.map((area) => (
                    <button
                      key={area}
                      className={`goal-card chip-card ${form.restrictedAreas.includes(area) ? "goal-card-active" : ""}`}
                      aria-pressed={form.restrictedAreas.includes(area)}
                      type="button"
                      onClick={() => toggleRestrictedArea(area)}
                    >
                      <strong>{capitalize(area)}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          </StepLayout>
        ) : null}

        {step === 6 ? (
          <StepLayout media={stepMedia} onImageError={() => setImageFailures((current) => ({ ...current, [step]: true }))} showFallback={Boolean(imageFailures[step])}>
          <div className="onboarding-step">
            <p className="section-label">Review</p>
            <h2>Here&apos;s how PulsePeak will shape your starting experience.</h2>
            <div className="onboarding-summary">
              <div className="plan-preview-callout onboarding-review-card">
                <div>
                  <span className="focus-step">Launch context</span>
                  <strong>{onboardingLaunchContext?.nextWorkoutLabel || "Your tailored dashboard is ready"}</strong>
                  <p>{onboardingLaunchContext?.launchSummary || "PulsePeak will start from your saved setup and keep the first experience simple, clear, and personalized."}</p>
                </div>
              </div>
              {summaryRows.map((row) => (
                <div className="plan-preview-callout onboarding-review-card" key={row.label}>
                  <div>
                    <span className="focus-step">{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                  <button className="ghost-button onboarding-edit-button" type="button" onClick={() => setStep(row.editStep)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
            <div className="onboarding-hero-grid">
              <div className="onboarding-hero-card">
                <span className="focus-step">Expected direction</span>
                <strong>{projectedOutcome.summary}</strong>
                <span className="muted">{projectedOutcome.confidence}</span>
              </div>
              <div className="onboarding-hero-card">
                <span className="focus-step">Why this works</span>
                <strong>{whyThisWorksPreview.trustNote}</strong>
                <span className="muted">{whyThisWorksPreview.body}</span>
              </div>
            </div>
            <p className="muted">
              Finish setup to land in a dashboard, coach view, and weekly plan that already reflect your modules, body profile, nutrition depth, training context, and recovery needs.
            </p>
          </div>
          </StepLayout>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <div className="onboarding-actions">
          <button className="ghost-button" disabled={step === 0 || saving} type="button" onClick={goBack}>
            Back
          </button>
          {isLastStep ? (
            <button className="primary-button" disabled={saving} type="button" onClick={saveProfile}>
              {saving ? "Saving..." : mode === "onboarding" ? "Start my tailored dashboard" : "Save preferences"}
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={goNext}>
              Next
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function StepLayout({ children, media, onImageError, showFallback }) {
  return (
    <div className="onboarding-step-layout">
      <div>{children}</div>
      <div className="onboarding-step-media">
        {showFallback || !media?.src ? (
          <div className="onboarding-step-media-fallback">
            <strong>PulsePeak setup preview</strong>
            <p>Visual guidance for this setup step will appear here.</p>
          </div>
        ) : (
          <img alt={media.alt} src={media.src} onError={onImageError} />
        )}
      </div>
    </div>
  );
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value[0].toUpperCase() + value.slice(1);
}

function formatInjuryStatus(value) {
  if (value === "active_injury") {
    return "Active injury";
  }
  if (value === "minor") {
    return "Minor limitation";
  }
  return "None";
}

function getSuggestedNutritionMode(goalType, currentMode) {
  if (goalType === "fat_loss") {
    return "full";
  }
  if (goalType === "bodybuilding" || goalType === "general_fitness") {
    return currentMode === "full" ? "full" : "basic";
  }
  return currentMode === "full" ? "full" : "off";
}

function deriveAgeGroup(birthdate) {
  if (!birthdate) {
    return "";
  }

  const parsed = new Date(`${birthdate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }

  if (age < 30) {
    return "18-29";
  }
  if (age < 40) {
    return "30-39";
  }
  if (age < 50) {
    return "40-49";
  }
  return "50+";
}

function convertUnitInputs(value, previousUnit, nextUnit, type) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (type === "height") {
    const stored = convertHeightToStored(value, previousUnit);
    return stored ? convertHeightFromStored(stored, nextUnit) : "";
  }

  const stored = convertWeightToStored(value, previousUnit);
  return stored ? convertWeightFromStored(stored, nextUnit) : "";
}

function validateStep(step, form) {
  if (step < 5) {
    return "";
  }

  if (!form.birthdate) {
    return "Add your birthdate so PulsePeak can tune recovery and nutrition guidance more accurately.";
  }
  if (!form.heightInput) {
    return "Add your height so PulsePeak can estimate a more realistic calorie range.";
  }
  if (!form.currentWeightInput) {
    return "Add your current weight so PulsePeak can personalize protein and hydration guidance.";
  }

  // Range checks mirror the server bounds (120–230 cm / 80–500 lb canonical)
  // but run HERE, on this step, in the user's own units — previously a typo
  // like "511" for 5'11" only failed at the final submit, with the error
  // quoting centimetre bounds to an imperial user (audit F11).
  const metric = form.unitPreference === "metric";
  const storedHeight = convertHeightToStored(form.heightInput, form.unitPreference);
  if (storedHeight !== null && (storedHeight < 120 || storedHeight > 230)) {
    return metric
      ? "Height should be between 120 and 230 cm — double-check the number."
      : "Height should be between 48 and 90 inches — double-check the number.";
  }
  const storedWeight = convertWeightToStored(form.currentWeightInput, form.unitPreference);
  if (storedWeight !== null && (storedWeight < 80 || storedWeight > 500)) {
    return metric
      ? "Current weight should be between 37 and 226 kg — double-check the number."
      : "Current weight should be between 80 and 500 lb — double-check the number.";
  }
  const storedTarget = convertWeightToStored(form.targetWeightInput, form.unitPreference);
  if (storedTarget !== null && (storedTarget < 80 || storedTarget > 500)) {
    return metric
      ? "Target weight should be between 37 and 226 kg — double-check the number."
      : "Target weight should be between 80 and 500 lb — double-check the number.";
  }

  return "";
}

function getProjectedOutcome(form) {
  if (form.goalType === "fat_loss") {
    return {
      summary: "A realistic fat-loss pace is roughly 0.25 to 0.75 lb per week once protein, hydration, and training are steady.",
      confidence: "PulsePeak is aiming for believable weekly progress, not crash-diet promises."
    };
  }
  if (form.goalType === "strength") {
    return {
      summary: "Expect steadier top sets, cleaner reps, and gradual load progress before dramatic jumps.",
      confidence: "The plan is built to make strength more repeatable week to week."
    };
  }
  if (form.goalType === "bodybuilding") {
    return {
      summary: "The first visible win should be better training quality and more repeatable weekly volume.",
      confidence: "Physique change follows more reliable training and fueling, not one perfect week."
    };
  }
  if (form.goalType === "mobility" || form.goalType === "injury_recovery") {
    return {
      summary: "Expect smoother movement, less guarded sessions, and better confidence before bigger physical changes.",
      confidence: "PulsePeak is prioritizing movement quality and safe repeatability first."
    };
  }
  return {
    summary: "The first wins should be steadier consistency, cleaner recovery, and fewer off-track days.",
    confidence: "That foundation is what makes the rest of the app feel more useful every week."
  };
}

function getWhyThisWorksPreview(form) {
  return {
    trustNote: "Built from your actual setup, not a generic fitness template.",
    body: `${capitalize(form.trainingEnvironment)} access, ${capitalize(form.experienceLevel)} experience, ${formatInjuryStatus(form.injuryStatus).toLowerCase()}, and your chosen nutrition depth all shape what PulsePeak shows and recommends.`
  };
}
