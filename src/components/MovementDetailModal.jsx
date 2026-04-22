import React from "react";
import { getMovementMedia } from "../../shared/exerciseCatalog";

export default function MovementDetailModal({ movement, onClose, guidanceLevel = "standard" }) {
  if (!movement) {
    return null;
  }

  const mediaView = getMovementMedia(movement);
  const equipment = Array.isArray(movement.equipment) ? movement.equipment : [];
  const primaryMuscles = Array.isArray(movement.primaryMuscles) ? movement.primaryMuscles : [];
  const secondaryMuscles = Array.isArray(movement.secondaryMuscles) ? movement.secondaryMuscles : [];
  const cues = Array.isArray(movement.cues) ? movement.cues : [];
  const commonMistakes = Array.isArray(movement.commonMistakes) ? movement.commonMistakes : [];
  const safetyNotes = Array.isArray(movement.safetyNotes) ? movement.safetyNotes : [];
  const modifications = Array.isArray(movement.modifications) ? movement.modifications : [];
  const instructions = Array.isArray(movement.instructions) ? movement.instructions : [];
  const sequenceSteps = [
    { key: "start", title: "Start", support: "Set your position and brace before the rep starts." },
    { key: "mid", title: "Mid", support: "Move into the working range without rushing." },
    { key: "peak", title: "Peak", support: "Own the strongest part of the rep with control." },
    { key: "finish", title: "Finish", support: "Return cleanly and reset for the next rep." }
  ];
  const showFullGuidance = guidanceLevel === "full";
  const showStandardGuidance = guidanceLevel !== "minimal";
  const instructionList = guidanceLevel === "minimal" ? instructions.slice(0, 2) : instructions;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="modal-card movement-detail-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="section-label">Movement guide</p>
            <h3>{movement.name}</h3>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="movement-hero">
          <div className="movement-guide-intro">
            <div className="movement-detail-block">
              <p className="section-label">Movement snapshot</p>
              <strong>Use the visual sequence first, then run the set with the cues below.</strong>
              <p className="support-copy">
                {mediaView.hasVideo
                  ? "Video sits at the top of the guide when it is available so you can confirm the movement quickly."
                  : mediaView.hasThumbnail
                    ? "Reference imagery is ready for this movement, with the written cues keeping the rep quality sharp."
                    : "This guide is media-ready, so the same layout already supports full visuals later without changing how you use it now."}
              </p>
            </div>
            <div className="movement-meta-grid">
              <div className="insight-chip">
                <strong>Category</strong>
                <p className="support-copy">{movement.category}</p>
              </div>
              <div className="insight-chip">
                <strong>Difficulty</strong>
                <p className="support-copy">{movement.difficulty}</p>
              </div>
              <div className="insight-chip">
                <strong>Equipment</strong>
                <p className="support-copy">{equipment.join(", ") || "No equipment"}</p>
              </div>
              <div className="insight-chip">
                <strong>Primary muscles</strong>
                <p className="support-copy">{primaryMuscles.join(", ") || "General"}</p>
              </div>
              <div className="insight-chip">
                <strong>Movement quality</strong>
                <p className="support-copy">{movement.rehabSafe ? "Joint-friendly option" : "Standard loading option"}</p>
              </div>
              <div className="insight-chip">
                <strong>Media status</strong>
                <p className="support-copy">
                  {mediaView.mediaStatus === "full"
                    ? "Full media ready"
                    : mediaView.mediaStatus === "basic"
                      ? "Reference visual ready"
                      : "Structured placeholder ready"}
                </p>
              </div>
            </div>
          </div>

          <div className="movement-visual-stack">
            <div className="movement-image-frame movement-image-panel">
              <div className="movement-image-header">
                <span className="movement-image-badge">{mediaView.hasVideo ? "Movement video" : "Movement preview"}</span>
                <span className="movement-reference-prefix">
                  {mediaView.hasVideo
                    ? "Watch one clean rep, then use the cues below."
                    : mediaView.hasThumbnail
                      ? "Reference visual"
                      : "Structured placeholder"}
                </span>
              </div>
              {mediaView.hasVideo ? (
                <video className="movement-image" controls poster={mediaView.thumbnail || undefined} src={mediaView.media.videoUrl} />
              ) : mediaView.hasThumbnail ? (
                <img alt={movement.imageAlt || `${movement.name} preview`} className="movement-image" src={mediaView.thumbnail} />
              ) : (
                <div className="movement-media-placeholder movement-media-placeholder-hero">
                  <span className="movement-media-placeholder-mark">{mediaView.placeholderInitials}</span>
                  <strong>{mediaView.placeholderLabel}</strong>
                  <p>{movement.name}</p>
                </div>
              )}
            </div>

            <div className="movement-credibility-strip">
              <span className="movement-credibility-pill">
                {movement.rehabSafe ? "Joint-friendly option" : "Matches your current setup"}
              </span>
              <span className="movement-credibility-pill">
                {movement.secondaryMuscles?.length ? `Supports ${movement.secondaryMuscles[0].toLowerCase()}` : "Used in guided training"}
              </span>
            </div>
          </div>
        </div>

        <article className="movement-detail-block">
          <p className="section-label">Visual sequence</p>
          <div className="movement-sequence-grid">
            {sequenceSteps.map((step, index) => {
              const sequenceItem = mediaView.sequence[index];
              return (
                <div className="movement-sequence-step" key={step.key}>
                  <div className="movement-sequence-labels">
                    <span className="focus-step">{sequenceItem.label}</span>
                    <strong>{step.title}</strong>
                  </div>
                  {sequenceItem.src ? (
                    <img alt={`${movement.name} ${step.title.toLowerCase()}`} className="movement-sequence-image" src={sequenceItem.src} />
                  ) : (
                    <div className="movement-media-placeholder movement-sequence-placeholder">
                      <span className="movement-media-placeholder-mark">{index + 1}</span>
                      <strong>{sequenceItem.label}</strong>
                      <p>{step.title}</p>
                    </div>
                  )}
                  <p className="support-copy">{step.support}</p>
                </div>
              );
            })}
          </div>
        </article>

        <div className="movement-detail-grid">
          <article className="movement-detail-block">
            <p className="section-label">Step by step</p>
            <ol className="movement-numbered-list">
              {instructionList.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          {showStandardGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Key cues</p>
              <ul className="plan-list">
                {cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Mistakes to avoid</p>
              <ul className="plan-list">
                {commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Safety notes</p>
              <ul className="plan-list">
                {safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Modifications</p>
              <ul className="plan-list">
                {modifications.map((modification) => (
                  <li key={modification}>{modification}</li>
                ))}
              </ul>
            </article>
          ) : null}

          <article className="movement-detail-block">
            <p className="section-label">Secondary muscles</p>
            <p className="support-copy">{secondaryMuscles.join(", ") || "None listed"}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
