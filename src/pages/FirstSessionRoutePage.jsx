import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FirstSessionRoutePage({ title, description, startPath }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeConfig = getFirstSessionRouteContent(location.pathname, { title, description, startPath });
  const handlePrimaryAction = () => {
    if (routeConfig.mobilityCategory && typeof window !== "undefined") {
      window.localStorage.setItem("pulsepeak.mobility.lastCategory", routeConfig.mobilityCategory);
    }

    navigate(routeConfig.startPath);
  };

  return (
    <div className="page-grid first-session-page">
      <section className="panel first-session-card">
        <div className="first-session-header">
          <p className="section-label">First session</p>
          <h2>{routeConfig.title}</h2>
          <p className="support-copy">{routeConfig.subtitle}</p>
        </div>

        <div className="first-session-details">
          <div className="module-note first-session-note">
            <strong>Why you landed here</strong>
            <p className="support-copy">{routeConfig.why}</p>
          </div>
          <div className="module-note first-session-note">
            <strong>What to do first</strong>
            <p className="support-copy">{routeConfig.nextStep}</p>
          </div>
        </div>

        <div className="first-session-actions">
          <button className="primary-button" type="button" onClick={handlePrimaryAction}>
            {routeConfig.primaryCta}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}

function getFirstSessionRouteContent(pathname, fallback = {}) {
  const variants = {
    "/injury-support": {
      title: "Start With Injury Support",
      subtitle: "We’ll begin with a lower-impact path focused on safer movement, mobility, and controlled rebuilding.",
      primaryCta: "Open Injury Support",
      startPath: "/mobility",
      mobilityCategory: "injury_support",
      why: "Your current profile suggests starting with the most joint-friendly path before pushing into a fuller training session.",
      nextStep: "Open the injury-support path first, then move into the broader training flow once you feel settled."
    },
    "/workout/quick-start": {
      title: "Start With a Quick Workout",
      subtitle: "We’ll begin with a simple, low-friction session so you can build momentum without overthinking the plan.",
      primaryCta: "Open Workout Options",
      startPath: "/workouts",
      why: "Your setup points to a lighter first step, so this route gets you moving quickly instead of dropping you into a heavier decision screen.",
      nextStep: "Start a short session first, get one clean win, and use the full workout area after that if you want more."
    },
    "/workout/strength": {
      title: "Start With Strength",
      subtitle: "We’ll begin with a focused strength session built around clear movements and steady effort.",
      primaryCta: "Open Workout Options",
      startPath: "/workouts",
      why: "Your profile points toward a strength-first start, so this route puts the clearest training path in front of you immediately.",
      nextStep: "Begin with the strength session path first, then use the dashboard later once you have your first session underway."
    },
    "/guided-start": {
      title: "Start Your First Guided Session",
      subtitle: "We’ll walk you through a simple starting path so you know exactly what to do first.",
      primaryCta: "Open Workout Options",
      startPath: "/workouts",
      why: "Your profile does not need a special first-session redirect, so we’re starting with the clearest general path.",
      nextStep: "Open the guided start first, follow the simplest session path, and use the dashboard later when you want the wider view."
    }
  };

  return (
    variants[pathname] || {
      title: fallback.title || "Start Your First Guided Session",
      subtitle: fallback.description || "We’ll walk you through a simple starting path so you know exactly what to do first.",
      primaryCta: "Open Workout Options",
      startPath: fallback.startPath || "/workouts",
      why: "This route is acting as the default first-session handoff for your current setup.",
      nextStep: "Start the guided session first, then return to the dashboard when you want the full app overview."
    }
  );
}
