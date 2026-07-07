import React from "react";
import { Link } from "react-router-dom";

// The attentive layer, made visible. Renders the ranked insight engine output
// so the first thing on the dashboard is personal and specific to the user's
// real history — never generic. The top insight is the effective "next best
// action" (it's what the engine ranked most urgent + actionable).

const CATEGORY_LABEL = {
  activation: "Getting started",
  comeback: "Comeback",
  streak: "Streak",
  pr_opportunity: "PR opportunity",
  balance: "Balance",
  progress: "Progress",
  momentum: "Momentum",
  plateau: "Plateau",
  pattern: "Pattern"
};

function ActionButton({ action, primary }) {
  if (!action?.to) return null;
  return (
    <Link className={primary ? "foryou-cta" : "foryou-link"} to={action.to}>
      {action.label} →
    </Link>
  );
}

export default function TodayForYou({ insights = [] }) {
  if (!Array.isArray(insights) || insights.length === 0) return null;
  const [hero, ...rest] = insights;
  const secondary = rest.slice(0, 4);

  return (
    <section className="foryou" aria-label="Personal insights for today">
      <p className="foryou-eyebrow">For you today</p>

      <div className={`foryou-hero foryou-cat-${hero.category}`}>
        <div className="foryou-hero-body">
          <span className="foryou-tag">{CATEGORY_LABEL[hero.category] || "Insight"}</span>
          <h2 className="foryou-hero-title">{hero.title}</h2>
          <p className="foryou-hero-msg">{hero.message}</p>
          {hero.evidence ? <p className="foryou-hero-evidence">{hero.evidence}</p> : null}
        </div>
        <ActionButton action={hero.action} primary />
      </div>

      {secondary.length ? (
        <div className="foryou-list">
          {secondary.map((insight) => (
            <div className="foryou-item" key={insight.id}>
              <div className="foryou-item-body">
                <span className="foryou-tag foryou-tag-sm">{CATEGORY_LABEL[insight.category] || "Insight"}</span>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
                {insight.evidence ? <span className="foryou-evidence-chip">{insight.evidence}</span> : null}
              </div>
              <ActionButton action={insight.action} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
