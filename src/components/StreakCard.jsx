import React from "react";
import CountUp from "./CountUp";

// The retention loop's home surface: the streak (freeze-protected), an adaptive
// return-prompt / reinforcement line keyed to the real streak state, freeze
// status, and weekly-goal reinforcement. All values come from the server's
// streakStatus — no fabrication.

function headline(status) {
  const days = `${status.streak}-day streak`;
  switch (status.state) {
    case "active":
      return { emoji: "🔥", title: days, sub: "You trained today — streak locked in. Keep the fire going." };
    case "at_risk":
      return { emoji: "🔥", title: days, sub: "Your streak is on the line — train today to keep it alive." };
    case "broken":
      return { emoji: "✊", title: "Start a new streak", sub: "Your streak reset. One session today gets it going again." };
    default:
      return { emoji: "⚡", title: "Start your streak", sub: "Complete your first workout today to light it up." };
  }
}

function freezeLine(status) {
  if (status.freezesUsed > 0 && status.streak > 0) {
    const used = status.freezesUsed;
    return `❄️ ${used} freeze${used === 1 ? "" : "s"} protecting your streak · ${status.freezesRemaining} left`;
  }
  if (status.streak > 0) {
    return `❄️ ${status.freezesRemaining} streak freeze${status.freezesRemaining === 1 ? "" : "s"} ready — a missed day won't break you`;
  }
  return null;
}

export default function StreakCard({ status, weeklyTarget = 3, variant }) {
  if (!status) return null;
  const { emoji, title, sub } = headline(status);
  const freeze = freezeLine(status);
  const goalTarget = Math.max(1, weeklyTarget);
  const goalRemaining = Math.max(0, goalTarget - (status.weeklyCompleted || 0));
  const goalPct = Math.min(100, Math.round(((status.weeklyCompleted || 0) / goalTarget) * 100));

  // "row" variant (Canadian-benchmark stat row, used on Today): the SAME real
  // streakStatus data as glanceable stat cardlets, with the honest state +
  // freeze coaching folded into one quiet line beneath — nothing dropped,
  // nothing fabricated.
  if (variant === "row") {
    return (
      <div className={`streak-card streak-row-card streak-${status.state}`}>
        <div className="streak-stat-row">
          <div className="streak-stat">
            <span className="streak-stat-value">
              {status.streak > 0 ? <CountUp value={status.streak} /> : 0}
            </span>
            <span className="streak-stat-label">Day streak {status.state === "active" ? "🔥" : ""}</span>
          </div>
          <div className="streak-stat">
            <span className="streak-stat-value">{status.weeklyCompleted || 0}</span>
            <span className="streak-stat-label">
              Workout{(status.weeklyCompleted || 0) === 1 ? "" : "s"} this week
            </span>
          </div>
          <div className="streak-stat">
            <span className="streak-stat-value">
              {Math.min(status.weeklyCompleted || 0, goalTarget)}/{goalTarget}
            </span>
            <span className="streak-stat-label">Weekly goal</span>
            <div className="streak-goal-bar">
              <div className="streak-goal-fill" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
        </div>
        <p className="streak-row-context">
          {sub}
          {goalRemaining > 0
            ? ` ${goalRemaining} more session${goalRemaining === 1 ? "" : "s"} hits your weekly goal.`
            : " Weekly goal complete — everything from here is a bonus."}
        </p>
        {freeze ? <p className="streak-freeze">{freeze}</p> : null}
      </div>
    );
  }

  return (
    <div className={`streak-card streak-${status.state}`}>
      <div className="streak-main">
        <div className={`streak-flame${status.state === "active" ? " streak-flame-lit" : ""}`} aria-hidden="true">
          <span className="streak-flame-emoji">{emoji}</span>
          {status.streak > 0 ? (
            <span className="streak-flame-count">
              <CountUp value={status.streak} />
            </span>
          ) : null}
        </div>
        <div className="streak-copy">
          <strong className="streak-title">{title}</strong>
          <p className="streak-sub">{sub}</p>
          {freeze ? <p className="streak-freeze">{freeze}</p> : null}
        </div>
      </div>

      <div className="streak-goal">
        <div className="streak-goal-top">
          <span>Weekly goal</span>
          <span>
            {Math.min(status.weeklyCompleted || 0, goalTarget)}/{goalTarget}
          </span>
        </div>
        <div className="streak-goal-bar">
          <div className="streak-goal-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <p className="streak-goal-note">
          {goalRemaining === 0
            ? "Weekly goal complete — everything from here is a bonus."
            : `${goalRemaining} more session${goalRemaining === 1 ? "" : "s"} to hit your weekly goal.`}
        </p>
      </div>
    </div>
  );
}
