import React from "react";

export default function Panel({ eyebrow, title, actions, children, className = "", ...props }) {
  return (
    <section className={`panel ${className}`.trim()} {...props}>
      <div className="panel-heading">
        <div>
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          <h3>{title}</h3>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
