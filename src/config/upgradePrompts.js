function hasModule(activeModules, id) {
  return new Set((activeModules || []).map((module) => module.id || module)).has(id);
}

function formatGoal(goalType) {
  const labels = {
    strength: "strength",
    athletic_performance: "athletic performance",
    bodybuilding: "body composition",
    fat_loss: "fat-loss",
    general_fitness: "general fitness",
    mobility: "mobility",
    injury_recovery: "injury recovery",
    active_aging: "active aging"
  };
  return labels[goalType] || "fitness";
}

function getAdaptiveValueBullets(profile = {}, activeModules = []) {
  const bullets = ["Full adaptive weekly plan", "Execution priorities tied to your real data", "Unlimited workout logging each week"];

  if (hasModule(activeModules, "nutrition")) {
    bullets.push(profile.nutritionMode === "full" ? "Richer calorie, protein, and fueling guidance" : "Deeper protein and hydration guidance");
  }

  if (hasModule(activeModules, "hydration")) {
    bullets.push("Hydration guidance that shifts with your current gaps");
  }

  if (hasModule(activeModules, "mobility") || profile.injuryStatus !== "none") {
    bullets.push("Mobility and recovery depth shaped by injury and movement context");
  }

  return Array.from(new Set(bullets)).slice(0, 4);
}

export function getUpgradePrompt({ surface, profile = {}, activeModules = [], coach = null, weeklyPlan = null, summary = null }) {
  const goalLabel = formatGoal(profile.goalType);
  const mobilityHeavy = hasModule(activeModules, "mobility") || profile.injuryStatus !== "none";
  const nutritionHeavy = hasModule(activeModules, "nutrition") || hasModule(activeModules, "hydration");
  const adaptiveBullets = getAdaptiveValueBullets(profile, activeModules);

  if (surface === "weekly-plan") {
    const title = mobilityHeavy
      ? "Unlock the full adaptive plan behind your recovery and mobility needs"
      : nutritionHeavy
        ? "Unlock the full adaptive plan behind your fueling and recovery data"
        : "Unlock the full adaptive weekly plan";

    const body = mobilityHeavy
        ? "Premium adds the deeper weekly rationale, execution priorities, guided mobility depth, and recovery-aware adjustments that help the week make better decisions."
      : nutritionHeavy
        ? "Premium adds the deeper weekly rationale, execution priorities, unlimited workout logging, and smarter hydration and fueling adjustments tied to your real data."
        : "Premium adds the deeper weekly rationale, unlimited workout logging, and execution priorities that explain exactly why the week is structured this way.";

    return {
      eyebrow: "Full system feature",
      title,
      body: `${body} Keep the week connected instead of stopping at the preview layer.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "workouts") {
    return {
      eyebrow: "Included in trial",
      title: "Run the full workout system without limits",
      body: "You are seeing only a small part of PulsePeak on Free. Keep logging sessions, keep your progress connected, and stop guessing what comes next.",
      bullets: [
        "Unlimited workout logging all week",
        "Full workout system access across all visible splits",
        "More exercise swap options without losing the workout structure",
        "Smoother guided sessions from warm-up through completion",
        mobilityHeavy ? "Broader recovery and physio-style support around harder sessions" : "Cleaner split guidance and smarter continuity tied to your setup"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "coach") {
    const category = coach?.primaryInsight?.category || "consistency";
    const titleMap = {
      hydration: "Unlock deeper coach reasoning around hydration and performance",
      nutrition: "Unlock deeper coach reasoning around fueling and recovery",
      recovery: "Unlock deeper coach reasoning around recovery and training load",
      training: "Unlock deeper coach reasoning around training decisions",
      consistency: "Unlock deeper coach reasoning tied to your weekly plan"
    };

    return {
      eyebrow: "Full system feature",
      title: titleMap[category] || titleMap.consistency,
      body: `Premium helps you keep momentum by showing the clearer why behind your ${goalLabel} decisions this week.`,
      bullets: [
        "Deeper why-this-matters explanations",
        "Coach reasoning tied back to your weekly plan",
        mobilityHeavy ? "Sharper recovery and mobility guardrails" : "More precise next actions from your current data"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "progress") {
    const streak = summary?.workoutStreak || 0;
    return {
      eyebrow: "Full system feature",
      title: streak >= 3 ? "See why your momentum is building" : "See what is actually moving your progress",
      body: "Premium makes it easier to keep your week moving by showing what is improving, what is slipping, and what to fix next.",
      bullets: [
        "Trend feedback tied to your weekly plan decisions",
        "Clearer why-your-trends-changed explanations",
        nutritionHeavy ? "Richer nutrition, hydration, and recovery context" : "Stronger next-step guidance from your patterns"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "onboarding") {
    const title = mobilityHeavy
      ? "Your setup is ready. Premium goes deeper on recovery, mobility, and weekly planning."
      : nutritionHeavy
        ? "Your setup is ready. Premium goes deeper on fueling, recovery, and weekly planning."
        : "Your setup is ready. Premium unlocks the full adaptive layer behind it.";

    return {
      eyebrow: "Included in trial",
      title,
      body: `PulsePeak already knows you are focused on ${goalLabel}. Trial is the easiest way to keep the full system connected for the next 7 days.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  return null;
}
