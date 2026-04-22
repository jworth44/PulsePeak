import React from "react";

export default function MovementReference({ movement, onClick, compact = false, prefix }) {
  if (!movement) {
    return null;
  }

  const imageSrc = movement.thumbnail || movement.image;
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
        {imageSrc ? (
          <img alt="" className="movement-reference-thumb" src={imageSrc} />
        ) : (
          <div className="movement-reference-fallback">
            <span>{movement.name.slice(0, 2).toUpperCase()}</span>
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
      <button className={classes.join(" ")} type="button" onClick={() => onClick(movement)}>
        {content}
      </button>
    );
  }

  return <div className={classes.join(" ")}>{content}</div>;
}
