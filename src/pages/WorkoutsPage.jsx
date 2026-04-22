import React, { useEffect, useMemo, useState } from "react";
import Panel from "../components/Panel";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import MovementDetailModal from "../components/MovementDetailModal";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { formatEquipmentSelections, formatWorkoutFocus } from "../../shared/workoutEngine";
import { getMovementMedia } from "../../shared/exerciseCatalog";
import { WORKOUT_DISCOVERY_CATEGORIES, WORKOUT_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";

export default function WorkoutsPage() {
  const { token, isPremium, accessTier } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [workoutEnvironment, setWorkoutEnvironment] = useState("both");
  const [equipmentSelections, setEquipmentSelections] = useState([]);
  const [workoutFocus, setWorkoutFocus] = useState("recommended");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedJointStress, setSelectedJointStress] = useState("all");
  const [selectedTrainingStyle, setSelectedTrainingStyle] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState("all");
  const [workoutLibrary, setWorkoutLibrary] = useState([]);
  const [libraryMeta, setLibraryMeta] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [favoriteSavingId, setFavoriteSavingId] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const safeProfile = data?.profile || {};
  const safeSummary = summary || {};
  const safeWorkoutAccess = safeSummary.workoutAccess || {};
  const safePlanSummary = safeSummary.planSummary || {};
  const safeWorkoutEngine = safeSummary.workoutEngine || {};
  const categoryOptions = libraryMeta?.categoryOptions || WORKOUT_DISCOVERY_CATEGORIES;
  const focusOptions = libraryMeta?.focusOptions || [];

  const displayedWorkouts = useMemo(() => {
    const filtered = workoutLibrary.filter((workout) => {
      const categoryMatch =
        selectedCategory === "all" ||
        (workout.categoryTags || []).some((tag) => slugifyDiscoveryTag(tag) === selectedCategory);
      const durationMatch =
        selectedDuration === "all" ||
        (selectedDuration === "short" ? workout.duration <= 35 : selectedDuration === "medium" ? workout.duration <= 50 : workout.duration > 50);
      const intensityMatch = selectedIntensity === "all" || String(workout.intensity || "").toLowerCase() === selectedIntensity;
      const jointStressMatch = selectedJointStress === "all" || String(workout.jointStressProfile || "").toLowerCase() === selectedJointStress;
      const trainingStyleMatch =
        selectedTrainingStyle === "all" ||
        (workout.trainingStyleTags || []).some((tag) => slugifyDiscoveryTag(tag) === selectedTrainingStyle);
      return categoryMatch && durationMatch && intensityMatch && jointStressMatch && trainingStyleMatch;
    });

    return [...filtered].sort((left, right) => {
      switch (selectedSort) {
        case "shortest":
          return left.duration - right.duration;
        case "easiest":
          return rankDifficulty(left.difficultyTag) - rankDifficulty(right.difficultyTag);
        case "recovery_friendly":
          return rankJointStress(left.jointStressProfile) - rankJointStress(right.jointStressProfile);
        case "equipment_efficient":
          return countEquipmentWords(left.equipmentSummary) - countEquipmentWords(right.equipmentSummary);
        default:
          return (right.recommendationScore || 0) - (left.recommendationScore || 0);
      }
    });
  }, [workoutLibrary, selectedCategory, selectedDuration, selectedIntensity, selectedJointStress, selectedTrainingStyle, selectedSort]);
  const topWorkout = displayedWorkouts[0] || null;
  const alternativeWorkouts = displayedWorkouts.slice(1, 4);
  const savedWorkoutKeys = useMemo(
    () => new Set((safeSummary.savedWorkouts || []).map((workout) => String(workout.presetId || workout.id || "").trim()).filter(Boolean)),
    [safeSummary.savedWorkouts]
  );
  const selectedCategoryMeta = categoryOptions.find((category) => category.id === selectedCategory) || categoryOptions[0];
  const exercisePreview = useMemo(() => {
    const entries = libraryMeta?.exerciseLibraryPreview?.entries || [];
    return selectedExerciseCategory === "all"
      ? entries
      : entries.filter((entry) => slugifyDiscoveryTag(entry.category) === selectedExerciseCategory);
  }, [libraryMeta?.exerciseLibraryPreview?.entries, selectedExerciseCategory]);
  const exercisePreviewGroups = useMemo(() => {
    const entries = libraryMeta?.exerciseLibraryPreview?.entries || [];
    const categories = libraryMeta?.exerciseLibraryPreview?.categories || [];
    if (selectedExerciseCategory !== "all") {
      return [];
    }

    return categories
      .map((category) => ({
        ...category,
        entries: entries.filter((entry) => slugifyDiscoveryTag(entry.category) === category.id).slice(0, 4)
      }))
      .filter((category) => category.entries.length);
  }, [libraryMeta?.exerciseLibraryPreview?.categories, libraryMeta?.exerciseLibraryPreview?.entries, selectedExerciseCategory]);

  useEffect(() => {
    if (!data?.profile) {
      return;
    }

    setWorkoutEnvironment(data.profile.trainingEnvironment === "hybrid" ? "both" : data.profile.trainingEnvironment);
    setEquipmentSelections(data.profile.equipmentSelections || []);
    setWorkoutFocus(summary?.workoutEngine?.recommendedFocus || "recommended");
  }, [data?.profile, summary?.workoutEngine?.recommendedFocus]);

  useEffect(() => {
    const mappedFocus = resolveCategoryToFocus(selectedCategory, focusOptions);
    if (mappedFocus && workoutFocus !== mappedFocus) {
      setWorkoutFocus(mappedFocus);
    }
  }, [focusOptions, selectedCategory, workoutFocus]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const params = new URLSearchParams({
      environment: workoutEnvironment,
      focus: workoutFocus
    });
    if (equipmentSelections.length) {
      params.set("equipmentSelections", equipmentSelections.join(","));
    }

    setLibraryLoading(true);
    apiRequest(`/workout-library?${params.toString()}`, {}, token)
      .then((payload) => {
        setWorkoutLibrary(payload.workouts);
        setLibraryMeta(payload.meta);
        setLibraryError("");
      })
      .catch((loadError) => {
        setLibraryError(loadError.message);
      })
      .finally(() => setLibraryLoading(false));
  }, [token, workoutEnvironment, equipmentSelections, workoutFocus]);

  if (loading) {
    return <div className="screen-center">Loading workouts...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load workouts."}</div>;
  }

  const workoutAccess = safeWorkoutAccess;
  const workoutPrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "workouts",
        profile: safeProfile,
        activeModules: safeSummary.activeModules,
        weeklyPlan: safePlanSummary
      });
  const selectedFocusLabel =
    workoutFocus === "recommended"
      ? libraryMeta?.focusOptions?.find((option) => option.value === safeWorkoutEngine.recommendedFocus)?.label || "Recommended"
      : formatWorkoutFocus(workoutFocus);
  const selectedFocusOption = focusOptions.find((option) => option.value === workoutFocus);
  const equipmentSummary = formatEquipmentSelections(equipmentSelections);
  const sortOptions = libraryMeta?.sortOptions?.length ? libraryMeta.sortOptions : WORKOUT_SORT_OPTIONS;
  const loadedWorkoutMessage = buildLoadedWorkoutMessage(topWorkout, selectedCategoryMeta, selectedFocusLabel);
  const coachReasoning = buildCoachReasoning({
    topWorkout,
    selectedCategoryMeta,
    selectedFocusLabel,
    workoutEnvironment,
    equipmentSummary
  });
  const companionSplits = buildCompanionSplits({
    topWorkout,
    libraryMeta,
    selectedCategoryMeta
  });

  const toggleEquipmentSelection = (value) => {
    setEquipmentSelections((current) => {
      const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
      return next.length ? next : current;
    });
  };

  const addPresetWorkout = async (workoutOrId, customExercises = null, options = {}) => {
    const workoutId = typeof workoutOrId === "string" ? workoutOrId : workoutOrId?.presetId || workoutOrId?.id;
    const workoutContext = typeof workoutOrId === "string" ? null : workoutOrId;
    const { closeOnSuccess = true, successMessage = "Workout logged." } = options;
    setSaving(`preset-${workoutId}`);
    setFeedback("");
    try {
      await mutate("/workouts/preset", {
        method: "POST",
        body: JSON.stringify({
          presetId: workoutId,
          environment: workoutContext?.environment || workoutEnvironment,
          equipmentProfile: workoutContext?.equipmentProfile || data.profile?.equipmentProfile,
          equipmentSelections: workoutContext?.equipmentSelections || equipmentSelections,
          focus: workoutContext?.focus || workoutFocus,
          exercises: customExercises
            ? customExercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup,
                weight: exercise.weight ?? "",
                repsCompleted: exercise.repsCompleted || "",
                notes: exercise.notes || ""
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

  const toggleFavoriteWorkout = async (workout, event) => {
    event?.stopPropagation?.();
    const workoutId = String(workout?.presetId || workout?.id || "").trim();
    if (!workoutId) {
      return;
    }

    setFavoriteSavingId(workoutId);
    setFeedback("");
    try {
      const payload = await mutate("/workouts/saved", {
        method: "POST",
        body: JSON.stringify({ workout })
      });
      setFeedback(payload.saved ? "Workout saved." : "Workout removed from saved workouts.");
    } catch (loadError) {
      setFeedback(loadError.message);
    } finally {
      setFavoriteSavingId("");
    }
  };

  const startWorkoutSession = (workout) => {
    if (!workout || workout.lockedForAccess) {
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

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Workouts</p>
          <h2>Choose your setup, pick your focus, and run a session that fits today.</h2>
          <p className="lead-copy">Build the session around the equipment you actually have so the workout feels usable the moment you open it.</p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      <div className={`cap-banner ${workoutAccess?.locked ? "cap-banner-locked" : ""}`}>
        <div>
          <strong>
            {workoutAccess?.trialUnlimited
              ? `Trial active: unlimited workout logging until ${workoutAccess?.trialEndsLabel || "your trial ends"}.`
              : workoutAccess?.premiumUnlimited
                ? "Premium unlocked: unlimited workout logging is active."
                : `Free plan: ${workoutAccess?.weeklyLogged || 0} of ${workoutAccess?.limit || 2} weekly workout logs used.`}
          </strong>
          <p className="support-copy">
            {workoutAccess?.trialUnlimited
              ? `You have the full system right now. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly at $119.99/year unless canceled before trial ends.`
              : workoutAccess?.premiumUnlimited
                ? "Keep logging sessions, rotating exercises, and building continuity without a weekly ceiling."
                : workoutAccess?.locked
                  ? workoutAccess?.canStartTrial
                    ? "You have hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity."
                    : `Preview stays open. Logging resets on ${workoutAccess?.resetLabel}. Premium removes the cap and keeps your training history moving.`
                  : `You still have ${workoutAccess?.remaining} workout log${workoutAccess?.remaining === 1 ? "" : "s"} left before the weekly reset on ${workoutAccess?.resetLabel}.`}
          </p>
        </div>
        {!isPremium && workoutAccess?.locked && workoutPrompt ? (
          <UpgradePrompt compact prompt={workoutPrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
        ) : null}
      </div>

      <Panel eyebrow="Today" title="Match the session to your real setup">
        <div className="section-context">
          <span className="section-context-label">Workout setup</span>
          <p>Choose where you are training, tap the equipment you have today, and then pick the split you want to run.</p>
        </div>
        {!libraryMeta?.fullLibraryAccess && libraryMeta?.lockedLibraryMessage ? (
          <div className="module-note premium-locked">
            <strong>You are only seeing a smaller free preview of PulsePeak.</strong>
            <p className="support-copy">{libraryMeta.lockedLibraryMessage}</p>
          </div>
        ) : null}
        <div className="filter-bar discovery-filter-bar">
          <label>
            Where are you training?
            <select value={workoutEnvironment} onChange={(event) => setWorkoutEnvironment(event.target.value)}>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="both">Hybrid / either</option>
            </select>
          </label>
          <label>
            What are you training today?
            <select value={workoutFocus} onChange={(event) => setWorkoutFocus(event.target.value)}>
              <option value="recommended">Recommended for today</option>
              {focusOptions.map((option) => (
                <option key={option.value} disabled={Boolean(option.locked && !isPremium)} value={option.value}>
                  {option.label}
                  {option.locked && !isPremium ? " (Locked on Free)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chip-toggle-grid workout-equipment-grid">
          {(libraryMeta?.equipmentOptions || []).map((option) => (
            <button
              key={option.value}
              className={`goal-card chip-card ${equipmentSelections.includes(option.value) ? "goal-card-active" : ""}`}
              type="button"
              onClick={() => toggleEquipmentSelection(option.value)}
            >
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>

        <div className="content-grid">
          <div className="module-note">
            <strong>{libraryMeta?.recommendationTitle || "Pick the split that fits today."}</strong>
            <p className="support-copy">{libraryMeta?.recommendationReason}</p>
            {libraryMeta?.continuityReason ? <p className="support-copy">{libraryMeta.continuityReason}</p> : null}
            <p className="support-copy">Current setup: {equipmentSummary}</p>
            {selectedFocusOption?.locked && !isPremium ? <p className="support-copy">Locked on Free. Included in Trial + Premium.</p> : null}
          </div>
          <div className="module-note">
            <strong>{workoutFocus === "recommended" ? "Good alternatives" : "Helpful companion splits"}</strong>
            <p className="support-copy">{(libraryMeta?.suggestedPairings || []).join(" · ")}</p>
          </div>
        </div>
        <div className="selector-row">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar discovery-filter-bar">
          <label>
            Duration
            <select value={selectedDuration} onChange={(event) => setSelectedDuration(event.target.value)}>
              <option value="all">Any length</option>
              <option value="short">35 min or less</option>
              <option value="medium">36-50 min</option>
              <option value="long">51+ min</option>
            </select>
          </label>
          <label>
            Intensity
            <select value={selectedIntensity} onChange={(event) => setSelectedIntensity(event.target.value)}>
              <option value="all">Any intensity</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Joint stress
            <select value={selectedJointStress} onChange={(event) => setSelectedJointStress(event.target.value)}>
              <option value="all">Any joint stress</option>
              <option value="low">Low stress</option>
              <option value="moderate">Moderate stress</option>
              <option value="high">Higher stress</option>
            </select>
          </label>
          <label>
            Training style
            <select value={selectedTrainingStyle} onChange={(event) => setSelectedTrainingStyle(event.target.value)}>
              <option value="all">Any training style</option>
              <option value="strength">Strength</option>
              <option value="muscle_building">Muscle Building</option>
              <option value="conditioning">Conditioning</option>
              <option value="bodyweight">Bodyweight</option>
              <option value="at_home">At Home</option>
              <option value="dumbbell">Dumbbell</option>
              <option value="joint-friendly">Joint-Friendly</option>
              <option value="recovery_day">Recovery Day</option>
              <option value="hybrid_setup">Hybrid Setup</option>
            </select>
          </label>
          <label>
            Sort
            <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <Panel eyebrow="Loaded session" title={topWorkout?.name || `${selectedFocusLabel} workouts`}>
        {libraryLoading ? (
          <p className="support-copy">Building the best workout for today...</p>
        ) : libraryError ? (
          <p className="support-copy">{libraryError}</p>
        ) : topWorkout ? (
          <div className="loaded-workout-shell">
            <div className="module-card loaded-workout-summary">
              <p className="section-label">
                {topWorkout.focusLabel} · {topWorkout.environment} · {topWorkout.equipmentSummary || topWorkout.equipmentProfile.replaceAll("_", " ")}
              </p>
              <div className="library-card-hero">
                {renderMovementPreview(topWorkout.exercises[0], topWorkout.name)}
                <div className="library-card-hero-copy">
                  <span className="library-depth-note">Built from {Math.max(topWorkout.exercises.reduce((total, exercise) => total + (exercise.availableSwapCount || 1), 0), 6)}+ variations</span>
                  <span className="library-depth-note">{topWorkout.jointStressProfile === "low" ? "Joint-friendly option" : "Matches your setup"}</span>
                </div>
              </div>
              <h4>{topWorkout.name}</h4>
              <p className="loaded-workout-cta">{loadedWorkoutMessage}</p>
              <p className="support-copy">{topWorkout.summary}</p>
              {topWorkout.continuityNote ? <p className="support-copy">{topWorkout.continuityNote}</p> : null}
              {topWorkout.varietyNote ? <p className="support-copy">{topWorkout.varietyNote}</p> : null}
              {topWorkout.lockedReason ? <p className="support-copy">{topWorkout.lockedReason}</p> : null}
              <p className="support-copy">{topWorkout.duration} mins · {topWorkout.intensity} · {topWorkout.primaryMuscles.join(", ")}</p>
              <div className="module-card-actions">
                <button
                  className="primary-button"
                  disabled={Boolean(topWorkout.lockedForAccess)}
                  type="button"
                  onClick={() => startWorkoutSession(topWorkout)}
                >
                  {topWorkout.lockedForAccess ? "Locked on Free" : "Start workout"}
                </button>
                <button className="ghost-button" disabled={Boolean(topWorkout.lockedForAccess)} type="button" onClick={() => setSelectedWorkout(topWorkout)}>
                  {topWorkout.lockedForAccess ? "Locked preview" : "View details"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={(event) => toggleFavoriteWorkout(topWorkout, event)}
                  disabled={favoriteSavingId === String(topWorkout.presetId || topWorkout.id || "")}
                >
                  {savedWorkoutKeys.has(String(topWorkout.presetId || topWorkout.id || "").trim()) ? "Saved workout" : "Save workout"}
                </button>
              </div>
            </div>

            <div className="module-card">
              <p className="section-label">Why this is loaded</p>
              <h4>Coach direction</h4>
              <p className="support-copy">{coachReasoning}</p>
              <p className="support-copy">
                Companion splits: {companionSplits.length ? companionSplits.join(" · ") : "Stay with this session and keep the week moving."}
              </p>
              <p className="support-copy">
                Alternatives ready: {Math.max(displayedWorkouts.length - 1, 0)} more workout option{displayedWorkouts.length - 1 === 1 ? "" : "s"} match this setup.
              </p>
            </div>

            <div className="module-card loaded-workout-exercises-card">
              <div className="section-context compact-section-context">
                <span className="section-context-label">Your session is ready</span>
                <p>Here is the loaded workout so you can see the full session before you start.</p>
              </div>
              <div className="loaded-workout-exercises">
                {topWorkout.exercises.map((exercise) => (
                  <article
                    className="loaded-workout-exercise"
                    key={`${topWorkout.id}-${exercise.slotId || exercise.name}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => exercise.movement && setSelectedMovement(exercise.movement)}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && exercise.movement) {
                        event.preventDefault();
                        setSelectedMovement(exercise.movement);
                      }
                    }}
                  >
                    <div className="loaded-workout-exercise-media">{renderMovementPreview(exercise, exercise.name)}</div>
                    <div className="loaded-workout-exercise-copy">
                      <strong>{exercise.slotLabel ? `${exercise.slotLabel}: ` : ""}{exercise.name}</strong>
                      <p className="support-copy">{getLoadedWorkoutPrescription(exercise)}</p>
                      <div className="exercise-signal-row">
                        <span className="exercise-signal-pill">{exercise.movementPattern}</span>
                        <span className="exercise-signal-pill">{exercise.equipment}</span>
                        {exercise.lastLoad?.weight ? <span className="exercise-signal-pill">Last used: {exercise.lastLoad.weight}</span> : null}
                      </div>
                    </div>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (exercise.movement) {
                          setSelectedMovement(exercise.movement);
                        }
                      }}
                    >
                      Open guide
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="support-copy">No workout matches that combination yet. Loosen the split or equipment filter and try again.</p>
        )}
      </Panel>

      <Panel eyebrow="Workout alternatives" title="Choose another strong option without losing the logic">
        {!libraryLoading ? (
          <div className="section-context compact-section-context">
            <span className="section-context-label">Visible results</span>
            <p>{displayedWorkouts.length} workout option{displayedWorkouts.length === 1 ? "" : "s"} match the category and filter choices above.</p>
          </div>
        ) : null}
        {libraryLoading ? <p className="support-copy">Loading workout library...</p> : null}
        {!libraryLoading && !libraryError ? (
          <div className="module-card-grid">
            {(alternativeWorkouts.length ? alternativeWorkouts : displayedWorkouts).map((workout) => (
              <article
                className={`module-card ${workout.lockedForAccess ? "module-card-locked" : "module-card-clickable"}`}
                key={workout.id}
                role={workout.lockedForAccess ? undefined : "button"}
                tabIndex={workout.lockedForAccess ? undefined : 0}
                onClick={workout.lockedForAccess ? undefined : () => setSelectedWorkout(workout)}
                onKeyDown={
                  workout.lockedForAccess
                    ? undefined
                    : (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedWorkout(workout);
                        }
                      }
                }
              >
                <p className="section-label">
                  {workout.focusLabel} · {workout.environment}
                </p>
                <div className="library-card-hero">
                  {renderMovementPreview(workout.exercises[0], workout.name)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">Built from {Math.max(workout.exercises.reduce((total, exercise) => total + (exercise.availableSwapCount || 1), 0), 6)}+ variations</span>
                    <span className="library-depth-note">{workout.jointStressProfile === "low" ? "Recovery-friendly option" : "Built for your current setup"}</span>
                  </div>
                </div>
                <h4>{workout.name}</h4>
                <p className="support-copy">{workout.summary}</p>
                {workout.continuityNote ? <p className="support-copy">{workout.continuityNote}</p> : null}
                {workout.lockedReason ? <p className="support-copy">{workout.lockedReason}</p> : null}
                <p className="support-copy">{workout.duration} mins · {workout.intensity}</p>
                <ul className="plan-list compact-plan-list">
                  {workout.exercises.slice(0, 4).map((exercise) => (
                    <li key={`${workout.id}-${exercise.slotId || exercise.name}`}>
                      {exercise.slotLabel}: {exercise.name}
                    </li>
                  ))}
                </ul>
                <div className="module-card-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={(event) => toggleFavoriteWorkout(workout, event)}
                    disabled={favoriteSavingId === String(workout.presetId || workout.id || "")}
                  >
                    {savedWorkoutKeys.has(String(workout.presetId || workout.id || "").trim()) ? "Saved workout" : "Save workout"}
                  </button>
                  <button className="ghost-button" disabled={Boolean(workout.lockedForAccess)} type="button" onClick={() => setSelectedWorkout(workout)}>
                    {workout.lockedForAccess ? "Locked preview" : "View details"}
                  </button>
                  <button className="primary-button" disabled={Boolean(workout.lockedForAccess)} type="button" onClick={() => startWorkoutSession(workout)}>
                    {workout.lockedForAccess ? "Locked on Free" : "Start workout"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Panel>

      <Panel eyebrow="Exercise library" title="Browse the movement pool behind the workout engine">
        <div className="section-context">
          <span className="section-context-label">Movement categories</span>
          <p>Browse by category to see the deeper exercise pool that powers workout variety, swaps, and equipment-aware recommendations.</p>
        </div>
        <div className="selector-row">
          <button
            className={`selector-pill ${selectedExerciseCategory === "all" ? "selector-pill-active" : ""}`}
            type="button"
            onClick={() => setSelectedExerciseCategory("all")}
          >
            <strong>All categories</strong>
            <span>Browse grouped movement families</span>
          </button>
          {(libraryMeta?.exerciseLibraryPreview?.categories || []).map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedExerciseCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedExerciseCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.count} options</span>
            </button>
          ))}
        </div>
        {selectedExerciseCategory === "all" ? (
          <div className="library-category-groups">
            {exercisePreviewGroups.map((group) => (
              <section className="library-category-group" key={group.id}>
                <div className="section-context compact-section-context">
                  <span className="section-context-label">{group.label}</span>
                  <p>{group.count} movements available in this category right now.</p>
                </div>
                <div className="module-card-grid">
                  {group.entries.map((entry) => (
                    <article
                      className="module-card module-card-clickable"
                      key={entry.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedMovement(buildPreviewMovement(entry))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedMovement(buildPreviewMovement(entry));
                        }
                      }}
                    >
                      <p className="section-label">
                        {entry.category} · {entry.movementPattern}
                      </p>
                      <div className="library-card-hero">
                        {renderCatalogPreview(entry)}
                        <div className="library-card-hero-copy">
                          <span className="library-depth-note">Browse deeper movement pool</span>
                          <span className="library-depth-note">{entry.rehabSafe ? "Joint-friendly option" : "Built for swaps and variety"}</span>
                        </div>
                      </div>
                      <h4>{entry.title || entry.name}</h4>
                      <p className="support-copy">{formatPreviewEquipment(entry.equipment)}</p>
                      <p className="support-copy">
                        {entry.difficulty} · {entry.jointStress} joint stress
                        {entry.rehabSafe ? " · rehab-safe option" : ""}
                      </p>
                      <div className="module-card-actions">
                        <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(buildPreviewMovement(entry)); }}>
                          Open guide
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="module-card-grid">
            {exercisePreview.slice(0, 12).map((entry) => (
              <article
                className="module-card module-card-clickable"
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMovement(buildPreviewMovement(entry))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMovement(buildPreviewMovement(entry));
                  }
                }}
              >
                <p className="section-label">
                  {entry.category} · {entry.movementPattern}
                </p>
                <div className="library-card-hero">
                  {renderCatalogPreview(entry)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">Browse deeper movement pool</span>
                    <span className="library-depth-note">{entry.rehabSafe ? "Joint-friendly option" : "Built for swaps and variety"}</span>
                  </div>
                </div>
                <h4>{entry.title || entry.name}</h4>
                <p className="support-copy">{formatPreviewEquipment(entry.equipment)}</p>
                <p className="support-copy">
                  {entry.difficulty} · {entry.jointStress} joint stress
                  {entry.rehabSafe ? " · rehab-safe option" : ""}
                </p>
                <p className="support-copy">
                  {entry.mediaStatus === "full" ? "Full media ready" : entry.mediaStatus === "basic" ? "Reference media ready" : "Text guide ready"}
                </p>
                <div className="module-card-actions">
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(buildPreviewMovement(entry)); }}>
                    Open guide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel eyebrow="Saved workouts" title="Come back to the sessions you want to run again">
        {safeSummary.savedWorkouts?.length ? (
          <div className="module-card-grid">
            {safeSummary.savedWorkouts.map((workout) => (
              <article
                className="module-card module-card-clickable"
                key={`saved-${workout.presetId || workout.id}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedWorkout(workout)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedWorkout(workout);
                  }
                }}
              >
                <p className="section-label">{workout.focusLabel || formatWorkoutFocus(workout.focus || "full_body")}</p>
                <div className="library-card-hero">
                  {renderMovementPreview(workout.exercises?.[0], workout.name)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">{savedWorkoutKeys.has(String(workout.presetId || workout.id || "").trim()) ? "Saved and ready to re-run" : "Ready to re-run"}</span>
                    <span className="library-depth-note">{workout.jointStressProfile === "low" ? "Recovery-friendly option" : "Matches your saved setup"}</span>
                  </div>
                </div>
                <h4>{workout.name}</h4>
                <p className="support-copy">{workout.summary || "Saved so you can come back to a session that already fits your setup."}</p>
                <p className="support-copy">{workout.duration} mins · {workout.intensity}</p>
                <div className="module-card-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={(event) => toggleFavoriteWorkout(workout, event)}
                    disabled={favoriteSavingId === String(workout.presetId || workout.id || "")}
                  >
                    Remove saved
                  </button>
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedWorkout(workout); }}>
                    Review workout
                  </button>
                  <button className="primary-button" type="button" onClick={(event) => { event.stopPropagation(); startWorkoutSession(workout); }}>
                    Start workout
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">Save a workout from the recommendation card, workout library, or session view and it will stay here for quick access.</p>
        )}
      </Panel>

      <Panel eyebrow="Recent training" title="Keep the week connected">
        {summary.recentWorkouts.length ? (
          <div className="module-card-grid">
            {summary.recentWorkouts.map((workout) => (
              <article
                className="module-card module-card-clickable"
                key={workout.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedWorkout(workout)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedWorkout(workout);
                  }
                }}
              >
                <p className="section-label">{workout.focus ? formatWorkoutFocus(workout.focus) : workout.type}</p>
                <h4>{workout.name}</h4>
                <div className="module-card-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedWorkout(workout);
                    }}
                  >
                    Review session
                  </button>
                  {workout.presetId ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        startWorkoutSession(workout);
                      }}
                    >
                      Re-run session
                    </button>
                  ) : null}
                </div>
                <p className="support-copy">{workout.duration} mins · {workout.exercises.length} exercises</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">No workouts logged yet. Start with one session that fits your equipment and let the rest of the week build around it.</p>
        )}
      </Panel>

      <WorkoutDetailModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onLog={addPresetWorkout}
        isSaving={saving === `preset-${selectedWorkout?.presetId || selectedWorkout?.id}`}
        onOpenMovement={setSelectedMovement}
        onUpgrade={startUpgradeCheckout}
        accessTier={accessTier}
        canStartTrial={Boolean(summary?.workoutAccess?.canStartTrial)}
        weeklyTarget={
          summary?.workoutAccess?.premiumUnlimited || summary?.workoutAccess?.trialUnlimited
            ? Math.max(3, summary?.planSummary?.suggestedWorkoutMix?.split?.length || 3)
            : summary?.workoutAccess?.limit || 2
        }
        guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"}
        workoutStreak={summary.workoutStreak}
        weeklyWorkoutCount={workoutAccess?.weeklyLogged || 0}
        loggingLocked={Boolean(workoutAccess?.locked)}
        completionExitLabel="Continue training"
        isFavorite={savedWorkoutKeys.has(String(selectedWorkout?.presetId || selectedWorkout?.id || "").trim())}
        onToggleFavorite={toggleFavoriteWorkout}
        loggingHint={
          workoutAccess?.locked
            ? workoutAccess?.canStartTrial
              ? "You have hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
              : `Free logging resets on ${workoutAccess?.resetLabel}. Premium removes the weekly cap and keeps your training continuity alive.`
            : ""
        }
      />
      <MovementDetailModal guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}

function rankDifficulty(value) {
  const map = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  return map[value] || 2;
}

function rankJointStress(value) {
  const map = { low: 1, moderate: 2, high: 3 };
  return map[String(value || "").toLowerCase()] || 2;
}

function resolveCategoryToFocus(categoryId, focusOptions) {
  if (!categoryId || categoryId === "all") {
    return null;
  }

  const directMatch = focusOptions.find((option) => option.value === categoryId);
  if (directMatch) {
    return directMatch.value;
  }

  const fallbackMap = {
    arms: "arms",
    chest: "chest",
    back: "back",
    shoulders: "shoulders",
    legs: "legs",
    glutes: "glutes",
    core: "core_abs",
    recovery_day: "mobility_recovery"
  };

  return fallbackMap[categoryId] || null;
}

function countEquipmentWords(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function slugifyDiscoveryTag(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("+", "plus")
    .replaceAll("/", " ")
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function formatPreviewEquipment(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "").replaceAll("_", " ");
}

function buildLoadedWorkoutMessage(workout, selectedCategoryMeta, selectedFocusLabel) {
  if (!workout) {
    return "Your session is ready.";
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return `Start with this ${selectedCategoryMeta.label.toLowerCase()} session.`;
  }

  return `Run this ${selectedFocusLabel.toLowerCase()} workout today.`;
}

function buildCoachReasoning({ topWorkout, selectedCategoryMeta, selectedFocusLabel, workoutEnvironment, equipmentSummary }) {
  if (!topWorkout) {
    return "Choose a setup and the coach flow will load the clearest session for today.";
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return `You selected ${selectedCategoryMeta.label}, so the loaded session is staying matched to that intent while still fitting your ${workoutEnvironment === "both" ? "hybrid" : workoutEnvironment} setup and ${equipmentSummary.toLowerCase()} equipment mix.`;
  }

  return `${selectedFocusLabel} is leading today because it is the cleanest fit for your current setup, recovery spacing, and available equipment.`;
}

function buildCompanionSplits({ topWorkout, libraryMeta, selectedCategoryMeta }) {
  if (!topWorkout) {
    return [];
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return (libraryMeta?.suggestedPairings || []).filter((entry) => !String(entry || "").toLowerCase().includes("mobility / recovery")).slice(0, 3);
  }

  return (libraryMeta?.suggestedPairings || []).slice(0, 3);
}

function getLoadedWorkoutPrescription(exercise) {
  const parts = [`${exercise.sets} sets`];
  if (exercise.reps) {
    parts.push(`${exercise.reps} reps`);
  }
  if (exercise.duration) {
    parts.push(exercise.duration);
  }
  return parts.join(" · ");
}

function renderMovementPreview(exercise, fallbackName) {
  const mediaView = getMovementMedia(exercise?.movement || exercise || { name: fallbackName });
  if (mediaView.thumbnail) {
    return <img alt={`${exercise?.name || fallbackName} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}

function renderCatalogPreview(entry) {
  const mediaView = getMovementMedia(entry);
  if (mediaView.thumbnail) {
    return <img alt={`${entry.title || entry.name} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}

function buildPreviewMovement(entry) {
  return {
    id: entry.id,
    name: entry.title || entry.name,
    category: entry.category || "Movement",
    difficulty: entry.difficulty || entry.difficultyLevel || "Standard",
    environment: Array.isArray(entry.environments) && entry.environments.length ? entry.environments.join(" / ") : "Home / gym",
    equipment: Array.isArray(entry.equipment) ? entry.equipment : Array.isArray(entry.equipmentRequirements) ? entry.equipmentRequirements : [],
    primaryMuscles: entry.primaryMuscleGroup ? [entry.primaryMuscleGroup] : entry.bodyFocus || [],
    secondaryMuscles: entry.secondaryMuscleGroups || [],
    instructions: entry.instructions || entry.guidance?.instructions || ["Use a controlled setup and follow the guide one step at a time."],
    cues: entry.cues || entry.guidance?.cues || ["Match the movement to your setup and stay controlled."],
    commonMistakes: entry.mistakes || entry.guidance?.mistakes || ["Rushing the rep before the pattern feels clean."],
    safetyNotes: entry.safetyNotes || entry.guidance?.safetyNotes || ["Use a load and range you can control cleanly."],
    modifications: entry.modifications || entry.guidance?.modifications || ["Swap into the same movement family if this version does not fit today."],
    media: entry.media,
    mediaStatus: entry.mediaStatus,
    rehabSafe: Boolean(entry.rehabSafe)
  };
}
