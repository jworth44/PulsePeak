import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import useModalA11y from "../hooks/useModalA11y";
import CountUp from "./CountUp";
import { haptic } from "../lib/haptics";

// A premium, shareable weekly recap — a "Wrapped"-style moment summarizing the
// user's real training week. All numbers come from /api/week-in-review (derived
// server-side from logged data). Screenshot-worthy by design; a Share button
// uses the Web Share API with a clipboard fallback.

function formatRange(startIso, endIso) {
  try {
    const opts = { month: "short", day: "numeric" };
    const start = new Date(startIso).toLocaleDateString("en-US", opts);
    const end = new Date(endIso).toLocaleDateString("en-US", opts);
    return `${start} – ${end}`;
  } catch {
    return "This week";
  }
}

function recordLine(record, unit) {
  if (record.type === "session_volume") {
    return `Biggest session — ${Math.round(record.volume).toLocaleString()} ${unit}`;
  }
  const detail = record.reps ? `${record.weight} ${unit} × ${record.reps}` : `${record.weight} ${unit}`;
  return `${record.exercise} — ${detail}`;
}

export default function WeekInReview({ open, onClose }) {
  const { token, dashboard } = useAuth();
  const dialogRef = useModalA11y(onClose);
  const navigate = useNavigate();
  // Reflection should create momentum — close the recap and head into training.
  const goTrain = () => {
    onClose?.();
    navigate("/workouts");
  };
  const [review, setReview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareState, setShareState] = useState(""); // "" | "copied" | "shared"
  const unit = dashboard?.profile?.unitPreference === "metric" ? "kg" : "lb";

  useEffect(() => {
    if (!open) {
      setReview(null);
      setError("");
      setShareState("");
      return undefined;
    }
    let active = true;
    setLoading(true);
    apiRequest("/week-in-review", {}, token)
      .then((payload) => {
        if (active) setReview(payload.review);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load your week.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, token]);

  if (!open) return null;

  const shareText = review
    ? `My week on PulsePeak\n${review.workoutsCompleted} workout${review.workoutsCompleted === 1 ? "" : "s"} · ${review.streak}-day streak · ${Math.round(review.totalVolume).toLocaleString()} ${unit} moved${review.prCount ? ` · ${review.prCount} new record${review.prCount === 1 ? "" : "s"}` : ""}`
    : "";

  const onShare = async () => {
    haptic("tap");
    if (navigator.share) {
      try {
        await navigator.share({ title: "My PulsePeak week", text: shareText });
        setShareState("shared");
        return;
      } catch {
        // fall through to clipboard (user canceled or share unsupported for this content)
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareState("copied");
    } catch {
      setShareState("copied"); // best-effort; text is on screen regardless
    }
  };

  const topRecords = (review?.personalRecords || []).slice(0, 3);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="wir-card"
        role="dialog"
        aria-modal="true"
        aria-label="Your week in review"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wir-header">
          <div>
            <p className="wir-eyebrow">Week in review</p>
            <h2 className="wir-title">{review ? formatRange(review.weekStart, review.weekEnd) : "Your week"}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {loading ? <p className="wir-muted">Building your week…</p> : null}
        {error ? <p className="wir-muted">{error}</p> : null}

        {review && !review.hasActivity ? (
          <div className="wir-empty">
            <p className="wir-hero-label">No sessions logged yet this week.</p>
            <p className="wir-muted">Complete your first workout and your recap fills in — streak, volume, records and all.</p>
            <button className="wir-next" type="button" onClick={goTrain}>
              Start a workout →
            </button>
          </div>
        ) : null}

        {review && review.hasActivity ? (
          <>
            <div className="wir-hero">
              <CountUp className="wir-hero-value" value={review.totalVolume} duration={1200} />
              <span className="wir-hero-label">{unit} moved this week</span>
            </div>

            <div className="wir-stats">
              <div className="wir-stat">
                <strong><CountUp value={review.workoutsCompleted} /></strong>
                <span>Workouts</span>
              </div>
              <div className="wir-stat">
                <strong><CountUp value={review.streak} /></strong>
                <span>Day streak</span>
              </div>
              <div className="wir-stat">
                <strong><CountUp value={review.exercisesCompleted} /></strong>
                <span>Exercises</span>
              </div>
              <div className="wir-stat wir-stat-volt">
                <strong><CountUp value={review.prCount} /></strong>
                <span>New records</span>
              </div>
            </div>

            <div className="wir-meters">
              <div className="wir-meter">
                <div className="wir-meter-top">
                  <span>Weekly goal</span>
                  <span>{Math.min(review.weeklyGoal.completed, review.weeklyGoal.target)}/{review.weeklyGoal.target}</span>
                </div>
                <div className="wir-bar">
                  <div
                    className="wir-bar-fill"
                    style={{ width: `${Math.min(100, Math.round((review.weeklyGoal.completed / Math.max(1, review.weeklyGoal.target)) * 100))}%` }}
                  />
                </div>
              </div>
              {typeof review.consistency === "number" ? (
                <div className="wir-meter">
                  <div className="wir-meter-top">
                    <span>Consistency</span>
                    <span>{review.consistency}%</span>
                  </div>
                  <div className="wir-bar">
                    <div className="wir-bar-fill wir-bar-fill-volt" style={{ width: `${Math.min(100, review.consistency)}%` }} />
                  </div>
                </div>
              ) : null}
            </div>

            {topRecords.length ? (
              <div className="wir-records">
                <p className="wir-records-title">Records this week</p>
                {topRecords.map((record, index) => (
                  <div className="wir-record" key={`${record.type}-${record.exercise || "session"}-${index}`}>
                    <span className="wir-record-badge">PR</span>
                    <span className="wir-record-text">{recordLine(record, unit)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {review && review.hasActivity ? (
          <div className="wir-actions">
            <button className="wir-next" type="button" onClick={goTrain}>
              Start this week strong →
            </button>
            <button className="wir-share" type="button" onClick={onShare}>
              {shareState === "copied" ? "Copied ✓" : shareState === "shared" ? "Shared ✓" : "Share my week"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
