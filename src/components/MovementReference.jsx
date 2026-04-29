import React from "react";
import { buildGuideTarget, resolveMovementVisual } from "../../shared/exerciseCatalog";

export default function MovementReference({ movement, onClick, compact = false, prefix }) {
  if (!movement) {
    return null;
  }

  const visual = resolveMovementVisual(movement);
  const classes = ["movement-reference"];
  if (compact) {
    classes.push("movement-reference-compact");
  }
  if (onClick) {
    classes.push("movement-reference-clickable");
  }

  const content = (
    <>
      <div className="movement-reference-media" aria-hidden="true">
        {visual.mode === "image" ? (
          <img alt="" className="movement-reference-thumb" src={visual.src} />
        ) : (
          <div className="movement-reference-fallback movement-image-fallback">
            <span>{visual.initials}</span>
            <small>{visual.label}</small>
          </div>
        )}
      </div>
      <div className="movement-reference-copy">
        {prefix ? <span className="movement-reference-prefix">{prefix}</span> : null}
        <strong>{movement.name}</strong>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button className={classes.join(" ")} type="button" onClick={() => onClick(buildGuideTarget(movement))}>
        {content}
      </button>
    );
  }

  return <div className={classes.join(" ")}>{content}</div>;
}
