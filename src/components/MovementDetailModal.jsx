import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { getGuideStatusLabel, getMovementMedia, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { getExerciseImageSrc } from "../utils/getExerciseImageSrc";
import useModalA11y from "../hooks/useModalA11y";

export default function MovementDetailModal({ movement, movementId, visualModelPreference = "default", onClose }) {
  const { token } = useAuth();
  const dialogRef = useModalA11y(onClose);
  const [fullExerciseRecord, setFullExerciseRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const contentRef = useRef(null);
  const hasGuideRequest = Boolean(movement || movementId);
  const expectedName = String(movement?.expectedName || movement?.name || "").trim();
  const requestedIds = useMemo(
    () =>
      Array.from(
        new Set(
          [
            movement?.detailId,
            movementId,
            movement?.guideTargetId,
            movement?.movementId,
            movement?.id
          ]
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      ),
    [movement?.detailId, movement?.guideTargetId, movement?.id, movement?.movementId, movementId]
  );
  const requestedId = requestedIds[0] || "";

  useEffect(() => {
    if (!token || !requestedIds.length) {
      setFullExerciseRecord(null);
      setLoadError("");
      return;
    }

    let cancelled = false;
    setFullExerciseRecord(null);
    setLoading(true);
    setLoadError("");

    (async () => {
      let lastError = "";
      for (const candidateId of requestedIds) {
        try {
          const payload = await apiRequest(`/exercise-library/${candidateId}`, {}, token);
          const resolvedName = String(payload?.name || "").trim();
          if (expectedName && resolvedName && resolvedName !== expectedName) {
            console.warn(`MAPPING_MISMATCH: expected ${expectedName}, got ${resolvedName}`);
            continue;
          }
          if (!cancelled) {
            setFullExerciseRecord(payload);
            setLoadError("");
          }
          return;
        } catch (error) {
          lastError = error.message;
        }
      }

      if (!cancelled) {
        console.warn("MOVEMENT DETAIL LOAD FAILED", requestedIds.join(" -> "), lastError || "Guide not available for this movement");
        setFullExerciseRecord(null);
        setLoadError(lastError || "Guide not available for this movement");
      }
    })()
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [expectedName, requestedIds, token]);

  const exercise = fullExerciseRecord || movement || null;

  useEffect(() => {
    if (!exercise) {
      return;
    }
  }, [exercise]);

  const mediaView = getMovementMedia(exercise || {}, { visualModelPreference });
  const visual = resolveMovementVisual(exercise || {}, { visualModelPreference });
  const guideStatusLabel = getGuideStatusLabel(exercise || {}, { visualModelPreference });
  const equipment = normalizeStringArray(exercise?.equipment);
  const primaryMuscles = normalizeStringArray(exercise?.primaryMuscles);
  const secondaryMuscles = normalizeStringArray(exercise?.secondaryMuscles);
  const commonMistakes = normalizeStringArray(exercise?.commonMistakes);
  const safetyNotes = normalizeStringArray(exercise?.safetyNotes);
  const modificationGroups = normalizeModificationGroups(exercise);
  const stepSequence = normalizeStepSequence(exercise);

  const description = normalizeText(exercise?.whatThisExerciseIs || exercise?.description);
  const trainingUse = normalizeText(exercise?.trainingUse);
  const setup = normalizeText(exercise?.setup);
  const execution = normalizeText(exercise?.howToPerform || exercise?.execution);
  const breathing = normalizeText(exercise?.breathing);
  const tempo = normalizeText(exercise?.tempo);
  const category = normalizeText(exercise?.category);
  const difficulty = normalizeText(exercise?.difficulty);
  const movementPattern = normalizeText(exercise?.movementPattern);

  const usesDirectVideo = /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(mediaView.media?.videoUrl || "");
  const hasExternalVideo = Boolean(mediaView.media?.videoUrl) && !usesDirectVideo;
  const textFirstGuide = mediaView.visualLevel !== "full";
  const hasMediaReference = usesDirectVideo || visual.mode === "image" || hasExternalVideo;

  const requiredFieldGaps = useMemo(
    () =>
      [
        !description && "description",
        !setup && "setup",
        !execution && "execution",
        !primaryMuscles.length && "primaryMuscles",
        (stepSequence.length < 4 || stepSequence.length > 5) && "stepSequence"
      ].filter(Boolean),
    [description, execution, primaryMuscles.length, setup, stepSequence.length]
  );

  useEffect(() => {
    if (requiredFieldGaps.length) {
      console.warn("MOVEMENT DETAIL REQUIRED FIELDS MISSING", exercise?.id || exercise?.name || requestedId, requiredFieldGaps);
    }
  }, [exercise?.id, exercise?.name, requestedId, requiredFieldGaps]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [exercise?.name, movementId]);

  const visibleSteps = stepSequence.slice(0, 5);
  const hasModificationData =
    modificationGroups.adjustments.length || modificationGroups.easierOptions.length || modificationGroups.progressions.length;
  const hasKeyTips = primaryMuscles.length || secondaryMuscles.length || breathing || tempo || movementPattern;
  const hasUsableGuideContent = Boolean(description || setup || execution || primaryMuscles.length || visibleSteps.length);

  if (!hasGuideRequest) {
    return null;
  }

  if (loading && !exercise) {
    return <GuideStatusModal message="Loading guide..." onClose={onClose} title="Guide loading" />;
  }

  if (!exercise && !requestedId) {
    return <GuideStatusModal message="Guide not available." onClose={onClose} title="Guide unavailable" />;
  }

  if (!exercise) {
    return <GuideStatusModal message="Guide not available for this movement." onClose={onClose} title="Guide unavailable" />;
  }

  if (!loading && loadError && !hasUsableGuideContent) {
    return <GuideStatusModal message="Guide not available for this movement." onClose={onClose} title="Guide unavailable" />;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="movement-guide-title"
        className="modal-card movement-detail-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading movement-guide-header">
          <div className="movement-guide-header-copy">
            <p className="section-label">Movement guide</p>
            <h3 className="movement-guide-title" id="movement-guide-title">{exercise.name}</h3>
            <div className="movement-guide-header-meta">
              {category ? <span className="movement-guide-meta-pill">{category}</span> : null}
              {equipment.length ? <span className="movement-guide-meta-pill">{equipment.join(", ")}</span> : null}
              {difficulty ? <span className="movement-guide-meta-pill">{difficulty}</span> : null}
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="movement-detail-stack" ref={contentRef}>
          {loading ? (
            <article className="movement-detail-block">
              <p className="section-label">Guide status</p>
              <p className="support-copy">Loading full exercise guide...</p>
            </article>
          ) : null}

          {loadError ? (
            <article className="movement-detail-block">
              <p className="section-label">Guide status</p>
              <p className="support-copy">Unable to load this exercise guide.</p>
            </article>
          ) : null}

          <section className="movement-hero-summary-row">
            <article className="movement-detail-block movement-hero-summary-main">
              <p className="section-label">Overview</p>
              {description ? (
                <div className="movement-hero-summary-section">
                  <strong>What this exercise is</strong>
                  <p className="support-copy">{description}</p>
                </div>
              ) : null}
              {trainingUse ? (
                <div className="movement-hero-summary-section">
                  <strong>Training use</strong>
                  <p className="support-copy">{trainingUse}</p>
                </div>
              ) : null}
            </article>

            <article className="movement-detail-block movement-hero-visual-block">
              {hasMediaReference ? (
                <div className="movement-image-frame movement-image-panel">
                  <div className="movement-image-header">
                    <span className="movement-image-badge">{usesDirectVideo ? "Movement video" : guideStatusLabel}</span>
                    <span className="movement-reference-prefix">
                      {usesDirectVideo
                        ? "Watch one clean rep, then use the written steps below."
                        : hasExternalVideo
                          ? "Open the visual example if you want a quick rep check."
                          : "Use the exact visual as your reference while you follow the guide."}
                    </span>
                  </div>
                  {usesDirectVideo ? (
                    <video className="movement-image exercise-image-contain" controls poster={getExerciseImageSrc(mediaView.thumbnail) || undefined} src={mediaView.media.videoUrl} />
                  ) : visual.mode === "image" ? (
                    <img alt={visual.alt} className="movement-image exercise-image-contain" src={getExerciseImageSrc(visual.src)} />
                  ) : null}
                  {hasExternalVideo ? (
                    <div className="movement-video-actions">
                      <a className="secondary-button" href={mediaView.media.videoUrl} rel="noreferrer" target="_blank">
                        Open example video
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="movement-text-guide-panel movement-text-guide-panel-large">
                  <small>Text coaching guide</small>
                  <strong>Full exercise coaching is available</strong>
                  <p>{trainingUse || movementPattern || "Use the setup, execution, and step-by-step guide below."}</p>
                  {primaryMuscles.length ? (
                    <div className="movement-text-guide-pills">
                      {primaryMuscles.slice(0, 3).map((muscle) => (
                        <span className="movement-credibility-pill" key={muscle}>
                          {muscle}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          </section>

          {(setup || execution || visibleSteps.length) ? (
            <article className="movement-detail-block movement-perform-block">
              <p className="section-label">How to Perform</p>
              {setup ? (
                <div className="movement-hero-summary-section">
                  <strong>Setup</strong>
                  <p className="support-copy">{setup}</p>
                </div>
              ) : null}
              {execution ? (
                <div className="movement-hero-summary-section">
                  <strong>Execution</strong>
                  <p className="support-copy">{execution}</p>
                </div>
              ) : null}
              {visibleSteps.length ? (
                <div className="movement-step-sequence-block">
                  <div className="movement-step-header">
                    <div>
                      <p className="section-label">Step-by-step</p>
                      <strong>{textFirstGuide ? "Four coaching checkpoints" : "Visual sequence with coaching cues"}</strong>
                    </div>
                  </div>

                  <div className={`movement-sequence-grid ${textFirstGuide ? "movement-sequence-grid-text" : ""}`}>
                    {visibleSteps.map((step, index) => {
                      const sequenceItem = mediaView.sequence[index];
                      return (
                        <div
                          className={`movement-sequence-step ${textFirstGuide ? "movement-sequence-step-text" : "movement-sequence-step-visual"}`}
                          key={`${step.title}-${index}`}
                        >
                          <div className="movement-sequence-labels">
                            <span className="focus-step">{textFirstGuide ? `Step ${index + 1}` : sequenceItem.label}</span>
                            <strong>{step.title}</strong>
                          </div>
                          {!textFirstGuide && sequenceItem.src ? (
                            <img alt={`${exercise.name} ${step.title.toLowerCase()}`} className="movement-sequence-image exercise-image-contain" loading="lazy" src={getExerciseImageSrc(sequenceItem.src)} />
                          ) : null}
                          <div className="movement-sequence-text-body">
                            {textFirstGuide ? <span className="movement-sequence-index">{step.title}</span> : null}
                            <p className="support-copy">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </article>
          ) : null}

          {hasKeyTips ? (
            <article className="movement-detail-block">
              <p className="section-label">Key Tips</p>
              <div className="movement-detail-grid movement-detail-grid-secondary">
                {primaryMuscles.length || secondaryMuscles.length ? (
                  <div>
                    <strong>Muscles worked</strong>
                    <div className="movement-muscles-grid">
                      {primaryMuscles.length ? (
                        <div className="movement-muscles-primary">
                          <span className="movement-muscles-label">Primary muscles</span>
                          <ul className="plan-list movement-muscles-list movement-muscles-primary-text">
                            {primaryMuscles.map((muscle) => (
                              <li key={muscle}>{muscle}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {secondaryMuscles.length ? (
                        <div className="movement-muscles-secondary">
                          <span className="movement-muscles-label">Secondary muscles</span>
                          <ul className="plan-list movement-muscles-list">
                            {secondaryMuscles.map((muscle) => (
                              <li key={muscle}>{muscle}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {breathing ? (
                  <div>
                    <strong>Breathing</strong>
                    <p className="support-copy">{breathing}</p>
                  </div>
                ) : null}

                {tempo ? (
                  <div>
                    <strong>Tempo</strong>
                    <p className="support-copy">{tempo}</p>
                  </div>
                ) : null}

                {movementPattern ? (
                  <div>
                    <strong>Movement pattern</strong>
                    <p className="support-copy">{movementPattern}</p>
                  </div>
                ) : null}
              </div>
            </article>
          ) : null}

          {commonMistakes.length ? (
            <article className="movement-detail-block">
              <p className="section-label">Mistakes</p>
              <ul className="plan-list">
                {commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {hasModificationData ? (
            <article className="movement-detail-block">
              <p className="section-label">Modifications</p>
              <div className="movement-modification-groups">
                {modificationGroups.adjustments.length ? (
                  <div>
                    <span className="movement-muscles-label">Adjustments</span>
                    <ul className="plan-list">
                      {modificationGroups.adjustments.map((modification) => (
                        <li key={modification}>{modification}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {modificationGroups.easierOptions.length ? (
                  <div>
                    <span className="movement-muscles-label">Easier options</span>
                    <ul className="plan-list">
                      {modificationGroups.easierOptions.map((regression) => (
                        <li key={regression}>{regression}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {modificationGroups.progressions.length ? (
                  <div>
                    <span className="movement-muscles-label">Progressions</span>
                    <ul className="plan-list">
                      {modificationGroups.progressions.map((progression) => (
                        <li key={progression}>{progression}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </article>
          ) : null}

          {safetyNotes.length ? (
            <article className="movement-detail-block">
              <p className="section-label">Safety</p>
              <ul className="plan-list">
                {safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter(Boolean).map((entry) => String(entry).trim()).filter(Boolean) : [];
}

function normalizeModificationGroups(exercise) {
  const nested = exercise?.modifications && typeof exercise.modifications === "object" && !Array.isArray(exercise.modifications)
    ? exercise.modifications
    : null;

  return {
    adjustments: normalizeStringArray(nested?.adjustments || exercise?.adjustmentOptions || exercise?.modifications),
    easierOptions: normalizeStringArray(nested?.easierOptions || exercise?.regressions),
    progressions: normalizeStringArray(nested?.progressions || exercise?.progressions)
  };
}

function normalizeStepSequence(exercise) {
  const rawSteps = Array.isArray(exercise?.stepByStep)
    ? exercise.stepByStep
    : Array.isArray(exercise?.stepSequence)
      ? exercise.stepSequence
      : [];

  return rawSteps.filter((step) => step?.title && step?.description);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function GuideStatusModal({ title, message, onClose }) {
  const dialogRef = useModalA11y(onClose);
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div ref={dialogRef} aria-modal="true" aria-labelledby="movement-guide-title" className="modal-card movement-detail-modal" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="panel-heading movement-guide-header">
          <div className="movement-guide-header-copy">
            <p className="section-label">Movement guide</p>
            <h3 className="movement-guide-title" id="movement-guide-title">{title}</h3>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="movement-detail-stack">
          <article className="movement-detail-block empty-state-card">
            <strong>{message}</strong>
            <p className="support-copy">Return to the previous page and choose another exercise or workout guide.</p>
            <div className="module-card-actions">
              <button className="ghost-button" type="button" onClick={onClose}>
                Go back
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
