import React from "react";
import { buildGuideTarget, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { hasFullWorkoutAccess } from "../../shared/entitlements";
import { getWorkoutLoadBand } from "../../shared/workoutEngine";
import { useAuth } from "../state/AuthContext";
import useModalA11y from "../hooks/useModalA11y";
import { getExerciseImageSrc } from "../utils/getExerciseImageSrc";
import CelebrationOverlay from "./CelebrationOverlay";

export default function WorkoutDetailModal({
  workout,
  onClose,
  onLog,
  onUpgrade,
  isSaving,
  onOpenMovement,
  accessTier = "free",
  canStartTrial = false,
  weeklyTarget = 2,
  guidanceLevel = "standard",
  workoutStreak = 0,
  weeklyWorkoutCount = 0,
  loggingLocked = false,
  loggingHint = "",
  completionExitLabel = "Return",
  isFavorite = false,
  onToggleFavorite
}) {
  const { workoutMemory, dashboard } = useAuth();
  const dialogRef = useModalA11y(onClose);
  const [celebration, setCelebration] = React.useState(null);
  const workoutExercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const currentWorkoutFocus = workout?.focus || workout?.focusLabel || workout?.type || "training";
  const [selectedBySlot, setSelectedBySlot] = React.useState({});
  const [completedMap, setCompletedMap] = React.useState({});
  const [exerciseState, setExerciseState] = React.useState({});
  const [sessionComplete, setSessionComplete] = React.useState(false);
  const [completionLogged, setCompletionLogged] = React.useState(false);
  const [completionError, setCompletionError] = React.useState("");
  const [transitionMessage, setTransitionMessage] = React.useState("");
  const [swapCount, setSwapCount] = React.useState(0);
  const transitionTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (!workout) {
      setSelectedBySlot({});
      setCompletedMap({});
      setExerciseState({});
      setSessionComplete(false);
      return;
    }

    const selected = {};
    const state = {};
    workoutExercises.forEach((exercise) => {
      const slotKey = exercise.slotId || exercise.name;
      selected[slotKey] = exercise.name;
      state[slotKey] = {
        weight: exercise.lastLoad?.weight ?? "",
        repsCompleted: exercise.lastLoad?.repsCompleted || "",
        notes: ""
      };
    });
    setSelectedBySlot(selected);
    setCompletedMap({});
    setExerciseState(state);
    setSessionComplete(false);
    setCompletionLogged(false);
    setCompletionError("");
    setTransitionMessage("");
    setSwapCount(0);
  }, [workout, workoutExercises]);

  React.useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    },
    []
  );

  const selectedExercises = workoutExercises.map((exercise) => {
    const slotKey = exercise.slotId || exercise.name;
    const options = [exercise, ...(exercise.swapOptions || [])];
    const selected = options.find((option) => option.name === selectedBySlot[slotKey]) || exercise;
    return {
      ...selected,
      weight: exerciseState[slotKey]?.weight ?? selected.lastLoad?.weight ?? "",
      repsCompleted: exerciseState[slotKey]?.repsCompleted || "",
      notes: exerciseState[slotKey]?.notes || ""
    };
  });
  const phaseSections = buildPhaseSections(selectedExercises, workout?.focus);
  const totalExercises = selectedExercises.length;
  const completedExercises = Object.values(completedMap).filter(Boolean).length;
  const allExercisesComplete = totalExercises > 0 && completedExercises === totalExercises;
  const currentExerciseIndex = Math.max(0, selectedExercises.findIndex((exercise) => !completedMap[exercise.slotId || exercise.name]));
  const activeExercise = sessionComplete ? null : selectedExercises[currentExerciseIndex] || null;
  const nextExercise = !sessionComplete ? selectedExercises[currentExerciseIndex + 1] || null : null;
  const progressLabel = sessionComplete ? "Session complete" : `Exercise ${Math.min(currentExerciseIndex + 1, totalExercises)} of ${totalExercises}`;
  const progressDetail = sessionComplete
    ? `${totalExercises} exercises finished | ${workout?.duration || 0} mins planned`
    : `${completedExercises} completed | ${Math.max(totalExercises - completedExercises, 0)} left`;
  const canReplayAndLog = !workout?.loggedAt || Boolean(workout?.presetId);
  const projectedWeeklyCount = completionLogged ? weeklyWorkoutCount + 1 : weeklyWorkoutCount;
  const hasFullAccess = hasFullWorkoutAccess(accessTier);
  const showFirstSuccessTrigger = completionLogged && !hasFullAccess && canStartTrial && weeklyWorkoutCount === 0;
  const showUsedTrialTrigger = completionLogged && !hasFullAccess && !canStartTrial;
  const showSwapIntentPrompt = !hasFullAccess && swapCount >= 2 && !sessionComplete;
  const activeVisual = activeExercise ? resolveMovementVisual(activeExercise.movement || activeExercise) : null;
  const completionSignals = {};
  const resultSignals = null;
  const checkpoint = null;
  const performanceSignals = null;
  const identitySignal = null;
  const programPhase = null;
  const nextWeekAdjustment = null;
  const recoveryBias = null;
  const whyThisMattersNotes = [];
  const completionMilestone = null;
  const completionLoadBand = getWorkoutLoadBand(workout);
  const completionReinforcement = buildCompletionReinforcement({
    completionSignals,
    programPhase,
    projectedWeeklyCount,
    workoutMomentum: null
  });
  const nextStepSuggestion = buildNextStepSuggestion({
    completionLoadBand,
    recoveryBias,
    nextWeekAdjustment
  });
  const primaryCompletionSignal = null;

  if (!workout) {
    return null;
  }

  const updateExerciseState = (slotKey, key, value) => {
    setExerciseState((current) => ({
      ...current,
      [slotKey]: {
        ...current[slotKey],
        [key]: value
      }
    }));
  };

  const toggleExerciseComplete = (exercise) => {
    if (sessionComplete) {
      return;
    }
    const slotKey = exercise.slotId || exercise.name;
    const nextComplete = !completedMap[slotKey];
    setCompletedMap((current) => ({
      ...current,
      [slotKey]: nextComplete
    }));
    if (nextComplete) {
      const nextIndex = selectedExercises.findIndex((entry) => (entry.slotId || entry.name) === slotKey) + 1;
      const nextName = selectedExercises[nextIndex]?.name;
      setTransitionMessage(nextName ? `Up next: ${nextName}` : "");
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = window.setTimeout(() => setTransitionMessage(""), 800);
    } else {
      setTransitionMessage("");
    }
  };

  const handleSwap = (exercise, nextName) => {
    const slotKey = exercise.slotId || exercise.name;
    setSwapCount((current) => current + 1);
    setSelectedBySlot((current) => ({
      ...current,
      [slotKey]: nextName
    }));
    setCompletedMap((current) => ({
      ...current,
      [slotKey]: false
    }));
  };

  const openCelebration = (logged, records = []) => {
    // All numbers come from real session data the user just entered — no fakes.
    const unit = dashboard?.profile?.unitPreference === "metric" ? "kg" : "lb";

    // A real personal record outranks the ordinary session celebration.
    if (Array.isArray(records) && records.length > 0) {
      const primary = records[0];
      const extra = records.length - 1;
      let title;
      let hero;
      let subtitle;
      if (primary.type === "session_volume") {
        title = "Biggest session yet";
        hero = { value: primary.volume, label: `${unit} moved` };
        subtitle = "A brand-new personal record";
      } else {
        title = primary.exercise;
        hero = { value: primary.weight, label: primary.reps ? `${unit} × ${primary.reps} reps` : unit };
        subtitle = primary.label; // "Heaviest ever" | "Best estimated 1RM"
      }
      setCelebration({
        variant: "pr",
        eyebrow: records.length > 1 ? "NEW RECORDS" : "NEW RECORD",
        title,
        subtitle,
        hero,
        note: extra > 0 ? `+${extra} more personal record${extra === 1 ? "" : "s"} today` : undefined,
        // A PR is worth lingering on (and screenshotting) — hold it a beat longer.
        autoDismissMs: 8000
      });
      return;
    }

    const volume = selectedExercises.reduce((sum, exercise) => {
      const weight = Number(exercise.weight);
      // Mirror the server's volume math: fall back to planned reps (and take the
      // leading integer of a range like "8-12") so the celebration volume matches
      // the recap/PR volume instead of zeroing when "reps done" is left blank.
      const reps = parseInt(String(exercise.repsCompleted || exercise.reps || ""), 10);
      const sets = Number(exercise.sets) || 1;
      if (Number.isFinite(weight) && weight > 0 && Number.isFinite(reps) && reps > 0) {
        return sum + weight * reps * sets;
      }
      return sum;
    }, 0);
    const minutes = Number(workout?.duration) || 0;
    const weeklyGoalHit = logged && weeklyTarget > 0 && weeklyWorkoutCount + 1 >= weeklyTarget;

    let hero;
    if (volume > 0) {
      hero = { value: Math.round(volume), label: `${unit} moved` };
    } else if (minutes > 0) {
      hero = { value: minutes, label: "minutes trained" };
    } else {
      hero = { value: totalExercises, label: "exercises done" };
    }

    const stats = [];
    if (hero.label !== "exercises done") stats.push({ value: totalExercises, label: "Exercises" });
    if (hero.label !== "minutes trained" && minutes > 0) stats.push({ value: minutes, label: "Minutes" });
    if (workoutStreak > 0) stats.push({ value: workoutStreak, label: "Day streak" });

    setCelebration({
      variant: weeklyGoalHit ? "milestone" : "session",
      eyebrow: weeklyGoalHit ? "Weekly goal complete" : "Session complete",
      title: weeklyGoalHit
        ? `${weeklyTarget} sessions this week!`
        : "Strong work.",
      hero,
      stats: stats.slice(0, 3)
    });
  };

  const finalizeWorkout = async () => {
    setSessionComplete(true);
    setCompletionError("");
    let logged = false;
    let records = [];
    if (canReplayAndLog && !loggingLocked) {
      try {
        const prs = await onLog(workout, selectedExercises, {
          closeOnSuccess: false,
          successMessage: "Workout complete."
        });
        records = Array.isArray(prs) ? prs : [];
        setCompletionLogged(true);
        logged = true;
      } catch (error) {
        setCompletionLogged(false);
        setCompletionError(error?.message || "Unable to save the workout.");
      }
    }
    openCelebration(logged, records);
  };

  return (
    <>
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div ref={dialogRef} aria-modal="true" className="modal-card workout-session-modal" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <p className="section-label">Workout session</p>
            <h3>{workout.name}</h3>
          </div>
          <div className="module-card-actions">
            {onToggleFavorite ? (
              <button className="ghost-button" type="button" onClick={(event) => onToggleFavorite(workout, event)}>
                {isFavorite ? "Remove saved" : "Save workout"}
              </button>
            ) : null}
            <button aria-label="Close workout session" className="icon-button" type="button" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="insight-chip">
            <strong>Type</strong>
            <p className="muted">{workout.type}</p>
          </div>
          <div className="insight-chip">
            <strong>Duration</strong>
            <p className="muted">{workout.duration} mins</p>
          </div>
          <div className="insight-chip">
            <strong>Setup</strong>
            <p className="muted">{workout.equipmentSummary || workout.equipmentProfile?.replaceAll("_", " ")}</p>
          </div>
          <div className="insight-chip">
            <strong>Intensity</strong>
            <p className="muted">{workout.intensity}</p>
          </div>
        </div>

        {workout.startPrompt ? (
          <div className="workout-start-callout">
            <span className="focus-step">Start here</span>
            <strong>{workout.startPrompt}</strong>
            {workout.continuityNote ? <p className="muted">{workout.continuityNote}</p> : null}
            {workout.varietyNote ? <p className="muted">{workout.varietyNote}</p> : null}
          </div>
        ) : null}

        {Array.isArray(workout.warmupBlock) && workout.warmupBlock.length ? (
          <div className="workout-support-block">
            <span className="focus-step">Optional warm-up</span>
            {workout.warmupBlock.map((entry) => (
              <div key={entry.name}>
                <strong>{entry.name}</strong>
                <p className="muted">{entry.detail}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="workout-progress-bar" aria-live="polite">
          <div className="workout-progress-copy">
            <strong>{progressLabel}</strong>
            <span className="muted">{progressDetail}</span>
          </div>
          <div className="workout-progress-track" aria-hidden="true">
            <span style={{ width: `${Math.max((completedExercises / Math.max(totalExercises, 1)) * 100, sessionComplete ? 100 : 8)}%` }} />
          </div>
          {transitionMessage ? <p className="workout-transition-note">{transitionMessage}</p> : null}
        </div>

        {!sessionComplete && activeExercise ? (
          <div className="workout-current-step workout-current-step-visual">
            <div className="workout-current-step-copy">
              <span className="focus-step">Current exercise</span>
              <strong>{activeExercise.name}</strong>
              <p className="muted">{getExerciseInstruction(activeExercise, guidanceLevel)}</p>
              <div className="exercise-signal-row">
                <span className="exercise-signal-pill">{activeExercise.movementPattern}</span>
                <span className="exercise-signal-pill">{activeExercise.equipment}</span>
                {activeExercise.lastLoad?.weight ? <span className="exercise-signal-pill">Used in your last session: {activeExercise.lastLoad.weight}</span> : null}
                {activeExercise.rehabSafe ? <span className="exercise-signal-pill">Joint-friendly option</span> : null}
              </div>
              {workout.lastTrainedLabel ? <p className="muted">{workout.lastTrainedLabel}</p> : null}
              {workout.partOfWeeklyPlan ? <p className="muted">Part of your weekly plan.</p> : null}
            </div>
            <div className="workout-current-step-visual-panel">
              <div className="exercise-visual-thumb exercise-visual-thumb-large">
                {activeVisual?.mode === "image" ? (
                    <img alt={activeVisual.alt} className="exercise-visual-thumb-image exercise-image-contain" src={getExerciseImageSrc(activeVisual.src)} />
                ) : (
                  <div className="exercise-visual-thumb-placeholder exercise-visual-thumb-placeholder-large movement-image-fallback">
                    <span>{activeVisual?.initials || "MV"}</span>
                    <small>{activeVisual?.label || "Movement preview"}</small>
                  </div>
                )}
              </div>
              <div className="workout-current-step-meta">
                <span>{activeExercise.sets} sets</span>
                <span>{activeExercise.reps || activeExercise.duration || "Controlled reps"}</span>
                {nextExercise ? <span className="workout-next-chip">Up next: {nextExercise.name}</span> : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="exercise-phase-list">
          {phaseSections.map((section) => (
            <section className="exercise-phase-group" key={section.id}>
              <div className="exercise-phase-header">
                <span className="focus-step">{section.eyebrow}</span>
                <strong>{section.title}</strong>
                <p className="muted">{section.description}</p>
              </div>
              <div className="exercise-detail-list">
                {section.exercises.map(({ exercise, index }) => {
                  const slotKey = exercise.slotId || exercise.name;
                  const isCompleted = Boolean(completedMap[slotKey]) || sessionComplete;
                  const isActive = !sessionComplete && activeExercise && (activeExercise.slotId || activeExercise.name) === slotKey;
                  const movementVisual = resolveMovementVisual(exercise.movement || exercise);
                  const swapOptions = [exercise, ...(exercise.swapOptions || [])].filter(
                    (option) =>
                      option.name === selectedBySlot[slotKey] ||
                      !selectedExercises.some(
                        (selected) => selected.name === option.name && (selected.slotId || selected.name) !== slotKey
                      )
                  );

                  const guideTarget =
                    exercise.detailId || exercise.guideTargetId || exercise.mediaStatus === "full"
                      ? exercise
                      : exercise.movement || exercise;

                  return (
                    <article
                      className={`exercise-detail-card exercise-detail-card-clickable ${isActive ? "exercise-detail-card-active" : ""} ${isCompleted ? "exercise-detail-card-complete" : ""}`}
                      key={slotKey}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenMovement?.(buildGuideTarget(guideTarget))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenMovement?.(buildGuideTarget(guideTarget));
                        }
                      }}
                    >
                      <div className="exercise-detail-topline">
                        <label className="exercise-check-toggle" onClick={(event) => event.stopPropagation()}>
                          <input checked={isCompleted} type="checkbox" onChange={() => toggleExerciseComplete(exercise)} />
                          <span />
                        </label>
                        <div>
                          <span className="focus-step">{exercise.slotLabel || "Exercise"}</span>
                          <span className="exercise-pattern">{exercise.movementPattern}</span>
                        </div>
                        <span className="exercise-step-state">{isCompleted ? "Done" : isActive ? "Now" : "Next"}</span>
                      </div>

                      <div className="exercise-step-header">
                        <div className={`exercise-visual-thumb ${isActive ? "exercise-visual-thumb-active" : ""}`}>
                          {movementVisual.mode === "image" ? (
                                  <img alt={movementVisual.alt} className="exercise-visual-thumb-image exercise-image-contain" src={getExerciseImageSrc(movementVisual.src)} />
                          ) : (
                            <div className="exercise-visual-thumb-placeholder movement-image-fallback">
                              <span>{movementVisual.initials}</span>
                              <small>{movementVisual.label}</small>
                            </div>
                          )}
                        </div>
                        <div className="exercise-step-copy">
                          <strong>
                            {index + 1}. {exercise.name}
                          </strong>
                          <p className="exercise-purpose-line">{getExercisePurpose(exercise)}</p>
                        </div>
                      </div>

                      <p className="exercise-prescription">
                        {exercise.sets} sets
                        {exercise.reps ? ` | ${exercise.reps} reps` : ""}
                        {exercise.duration ? ` | ${exercise.duration}` : ""}
                      </p>

                      {guidanceLevel !== "minimal" ? <p className="muted">{getExerciseInstruction(exercise, guidanceLevel)}</p> : null}
                      <div className="exercise-signal-row">
                        <span className="exercise-signal-pill">{exercise.equipment}</span>
                        <span className="exercise-signal-pill">{exercise.muscleGroup}</span>
                        {exercise.lastLoad?.weight ? <span className="exercise-signal-pill">Used in your last session: {exercise.lastLoad.weight}</span> : null}
                        {exercise.rehabSafe ? <span className="exercise-signal-pill">Joint-friendly option</span> : null}
                        {exercise.availableSwapCount ? <span className="exercise-signal-pill">{exercise.availableSwapCount} alternatives available</span> : null}
                      </div>

                      <div className="workout-load-grid" onClick={(event) => event.stopPropagation()}>
                        <label>
                          Weight
                          <input
                            placeholder="0"
                            type="number"
                            value={exerciseState[slotKey]?.weight ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "weight", event.target.value)}
                          />
                        </label>
                        <label>
                          Reps done
                          <input
                            placeholder={exercise.reps || "Done"}
                            type="text"
                            value={exerciseState[slotKey]?.repsCompleted ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "repsCompleted", event.target.value)}
                          />
                        </label>
                      </div>

                      {guidanceLevel === "full" ? (
                        <label className="exercise-notes-field" onClick={(event) => event.stopPropagation()}>
                          Notes
                          <textarea
                            placeholder="How it felt, rep quality, pain notes..."
                            rows="2"
                            value={exerciseState[slotKey]?.notes ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "notes", event.target.value)}
                          />
                        </label>
                      ) : null}

                      {swapOptions.length > 1 ? (
                        <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                          Swap exercise{exercise.availableSwapCount ? ` (${exercise.availableSwapCount} options)` : ""}
                          <select value={selectedBySlot[slotKey] || exercise.name} onChange={(event) => handleSwap(exercise, event.target.value)}>
                            {swapOptions.map((option) => (
                              <option key={`${slotKey}-${option.name}`} value={option.name}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                          {exercise.familyOptionCount > 3 ? (
                            <span className="support-copy">More options in this movement family are ready when you want variety.</span>
                          ) : null}
                        </label>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {loggingLocked && loggingHint ? (
          <div className="limited-preview-banner workout-lock-banner">
            <span className="focus-step">Weekly free limit reached</span>
            <strong>{loggingHint}</strong>
          </div>
        ) : null}

        {showSwapIntentPrompt ? (
          <div className="module-note">
            <strong>Unlock full control with a 7-day trial.</strong>
            <p className="support-copy">Keep your swaps, session flow, and training continuity connected without hitting the free limit.</p>
          </div>
        ) : null}

        {sessionComplete ? (
          <div className="workout-complete-card">
            <span className="focus-step">Session complete</span>
            <strong>Workout complete.</strong>
            <p className="muted">
              {workout.focusLabel || workout.type} | {totalExercises} exercises | {workout.duration} mins
            </p>
            <p className="muted">
              {completionLogged
                ? "This session now counts toward your weekly progress."
                : loggingLocked
                  ? "You finished the session. Logging stays locked until your access resets or you upgrade."
                  : !canReplayAndLog
                    ? "This completed session stays available here as a review."
                    : completionError || "Finalizing your workout now."}
            </p>
            <p className="muted">{completionReinforcement}</p>
            <p className="muted">
              You have completed {projectedWeeklyCount} of {weeklyTarget} sessions this week. Next session keeps your week on track.
            </p>
            {primaryCompletionSignal ? (
              <div className="module-note">
                <strong>{primaryCompletionSignal.title}</strong>
                <p className="support-copy">{primaryCompletionSignal.detail}</p>
              </div>
            ) : null}
            {nextStepSuggestion ? (
              <div className="module-note">
                <strong>{nextStepSuggestion.title}</strong>
                <p className="support-copy">{nextStepSuggestion.detail}</p>
              </div>
            ) : null}
            {primaryCompletionSignal?.kind !== "performance" && resultSignals?.shortMessage ? <p className="support-copy">{resultSignals.shortMessage}</p> : null}
            {whyThisMattersNotes.length ? (
              <p className="support-copy">{whyThisMattersNotes[0]}</p>
            ) : null}
            {showFirstSuccessTrigger ? (
              <div className="module-note">
                <strong>You completed your first session. Unlock the full system for the next 7 days.</strong>
                <p className="support-copy">Run unlimited workouts, keep your plan connected, and follow the full execution flow without interruption.</p>
                <div className="module-card-actions">
                  <button className="primary-button" type="button" onClick={() => onUpgrade?.("yearly", "default")}>
                    Start 7-day free trial
                  </button>
                </div>
              </div>
            ) : null}
            {showUsedTrialTrigger ? (
              <div className="module-note">
                <strong>Continue your training without limits.</strong>
                <p className="support-copy">Keep logging every session and keep your momentum connected across the week.</p>
                <div className="module-card-actions">
                  <button className="primary-button" type="button" onClick={() => onUpgrade?.("yearly", "upgrade_now")}>
                    Upgrade now
                  </button>
                </div>
              </div>
            ) : null}
            {Array.isArray(workout.cooldownBlock) && workout.cooldownBlock.length ? (
              <div className="workout-support-block">
                <span className="focus-step">Optional cooldown</span>
                {workout.cooldownBlock.map((entry) => (
                  <div key={entry.name}>
                    <strong>{entry.name}</strong>
                    <p className="muted">{entry.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="modal-actions">
              <button className="primary-button workout-nav-button" type="button" onClick={onClose}>
                {completionExitLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-actions">
            <button
              className="primary-button workout-nav-button"
              disabled={!allExercisesComplete || isSaving}
              type="button"
              onClick={finalizeWorkout}
            >
              {isSaving ? "Saving..." : `${workout.focusLabel || workout.name} completed`}
            </button>
          </div>
        )}
      </div>
    </div>
      <CelebrationOverlay
        open={Boolean(celebration)}
        onClose={() => setCelebration(null)}
        {...(celebration || {})}
      />
    </>
  );
}

function buildPhaseSections(exercises, workoutFocus) {
  if (!exercises.length) {
    return [];
  }

  if (workoutFocus === "mobility_recovery") {
    return [
      makePhase("warmup", "Warm-up", "Warm in", "Open the tightest area first so the rest of the flow feels smoother.", exercises.slice(0, 1), 0),
      makePhase("main", "Main work", "Main flow", "Spend the bulk of the session where you need the most support today.", exercises.slice(1, Math.max(exercises.length - 1, 1)), 1),
      ...(exercises.length > 2
        ? [makePhase("cooldown", "Cooldown", "Finish", "End with lower-stress movement so you leave the session feeling better.", exercises.slice(-1), exercises.length - 1)]
        : [])
    ].filter((section) => section.exercises.length);
  }

  const warmupCount = 1;
  const finisherCount = exercises.length >= 6 ? 1 : 0;
  const mainCount = Math.min(3, Math.max(exercises.length - warmupCount - finisherCount - 1, 2));
  const supportStart = warmupCount + mainCount;
  const finisherStart = exercises.length - finisherCount;

  return [
    makePhase("warmup", "Warm-up", "First", "Use the opener to groove the pattern before the harder work starts.", exercises.slice(0, warmupCount), 0),
    makePhase("main", "Main work", "Main work", "Give the anchor lifts the best focus and effort of the session.", exercises.slice(warmupCount, supportStart), warmupCount),
    makePhase("support", "Support work", "Support", "Round out the target muscles and keep the split complete.", exercises.slice(supportStart, finisherStart || exercises.length), supportStart),
    ...(finisherCount
      ? [makePhase("cooldown", "Optional finisher / cooldown", "Finish", "Close the session with a short final block if you still feel good.", exercises.slice(finisherStart), finisherStart)]
      : [])
  ].filter((section) => section.exercises.length);
}

function makePhase(id, title, eyebrow, description, exercises, offset) {
  return {
    id,
    title,
    eyebrow,
    description,
    exercises: exercises.map((exercise, index) => ({ exercise, index: offset + index }))
  };
}

function getExerciseInstruction(exercise, guidanceLevel) {
  if (guidanceLevel === "minimal") {
    return "Stay controlled and keep the reps clean.";
  }

  const movementInstruction = exercise.movement?.instructions?.[0];
  if (movementInstruction) {
    return movementInstruction;
  }

  const pattern = String(exercise.movementPattern || "").toLowerCase();
  if (pattern.includes("push")) {
    return guidanceLevel === "full"
      ? "Set your position first, control the lowering phase, and finish each rep with steady pressure."
      : "Control the lowering phase, then press smoothly.";
  }
  if (pattern.includes("pull")) {
    return guidanceLevel === "full"
      ? "Brace first, pull with your back, and avoid yanking the weight back into the start position."
      : "Pull with your back first and own the return.";
  }
  if (pattern.includes("squat")) {
    return guidanceLevel === "full"
      ? "Brace before the rep, stay balanced through the whole foot, and keep the descent and drive smooth."
      : "Brace, stay balanced, and keep the rep smooth.";
  }
  if (pattern.includes("hinge")) {
    return guidanceLevel === "full"
      ? "Keep the hinge long through the hips, maintain tension, and stand back up under control."
      : "Keep the hinge in the hips and stand up under control.";
  }
  if (pattern.includes("mobility")) {
    return guidanceLevel === "full"
      ? "Move slowly, breathe through the position, and stay in a pain-free range the whole time."
      : "Move slowly and stay in a pain-free range.";
  }
  return guidanceLevel === "full"
    ? "Move with control, keep the reps clean, and stay with the purpose of the slot."
    : "Move with control and keep the slot clean.";
}

function getExercisePurpose(exercise) {
  const pattern = String(exercise.movementPattern || "").toLowerCase();
  if (pattern.includes("push")) {
    return "Build pressing strength with a clean, repeatable pattern.";
  }
  if (pattern.includes("pull")) {
    return "Drive back tension and keep the pull balanced.";
  }
  if (pattern.includes("squat")) {
    return "Cover the main lower-body pattern for this session.";
  }
  if (pattern.includes("hinge")) {
    return "Train the posterior chain without losing position.";
  }
  if (pattern.includes("carry")) {
    return "Finish with trunk control and total-body tension.";
  }
  if (pattern.includes("rotate") || pattern.includes("core")) {
    return "Support trunk control and keep the session connected.";
  }
  if (pattern.includes("mobility")) {
    return "Open the movement pattern before the next harder block.";
  }
  return "Keep this slot clean so the whole workout flows well.";
}

function buildCompletionReinforcement({ completionSignals, programPhase, projectedWeeklyCount, workoutMomentum }) {
  if (completionSignals?.consistency?.status === "up") {
    return completionSignals.consistency.detail;
  }
  if (projectedWeeklyCount >= 3) {
    return "You kept this week moving with another real completed session.";
  }
  if (workoutMomentum?.currentStreakDays >= 2) {
    return "That keeps your recent momentum alive without forcing the next step.";
  }
  return programPhase?.detail || "You turned the plan into a real completed session.";
}

function buildNextStepSuggestion({ completionLoadBand, recoveryBias, nextWeekAdjustment }) {
  if (completionLoadBand === "hard" || recoveryBias?.level === "high") {
    return {
      title: "A lighter recovery session would fit well next",
      detail: "Use mobility or a lower-joint-stress session next so the recent load stays sustainable."
    };
  }

  if (nextWeekAdjustment?.detail) {
    return {
      title: nextWeekAdjustment.label,
      detail: nextWeekAdjustment.detail
    };
  }

  return {
    title: "Review your next session later this week",
    detail: "The next recommendation will stay cleaner if you let the week build one session at a time."
  };
}
