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
  const bullets = ["Your full adaptive weekly plan", "Guidance built from your real training data", "Unlimited workout logging every week"];

  if (hasModule(activeModules, "nutrition")) {
    bullets.push(profile.nutritionMode === "full" ? "Richer calorie, protein, and fueling guidance" : "Deeper protein and hydration guidance");
  }

  if (hasModule(activeModules, "hydration")) {
    bullets.push("Hydration guidance that adapts to your day");
  }

  if (hasModule(activeModules, "mobility") || profile.injuryStatus !== "none") {
    bullets.push("Mobility and recovery shaped around how you actually feel");
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
      ? "Unlock your full plan — built around your recovery"
      : nutritionHeavy
        ? "Unlock your full plan — built around your fueling and recovery"
        : "Unlock your full adaptive weekly plan";

    const body = mobilityHeavy
        ? "Premium unlocks your full weekly plan, with deeper mobility work and recovery-aware adjustments built around how you actually feel."
      : nutritionHeavy
        ? "Premium unlocks your full weekly plan, with unlimited logging and smarter fueling and hydration tuned to your real data."
        : "Premium unlocks your full weekly plan — unlimited logging and a week that adapts to exactly how you train.";

    return {
      eyebrow: "Premium",
      title,
      body: `${body} Keep your whole week moving, not just a preview.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "workouts") {
    return {
      eyebrow: "Premium",
      title: "Train without limits",
      body: "Free gives you two sessions a week. Premium lets you log every workout, keep your streak alive, and never lose your momentum to a cap.",
      bullets: [
        "Unlimited workout logging, every week",
        "Every session counts toward your streak and progress",
        "More ways to swap exercises without losing your plan",
        "Smooth, guided sessions from warm-up to finish",
        mobilityHeavy ? "Deeper recovery support around your hardest sessions" : "Smarter session variety tuned to your setup"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "coach") {
    const category = coach?.primaryInsight?.category || "consistency";
    const titleMap = {
      hydration: "Go deeper on hydration and performance",
      nutrition: "Go deeper on fueling and recovery",
      recovery: "Go deeper on recovery and training load",
      training: "Go deeper on your training decisions",
      consistency: "Go deeper on your weekly momentum"
    };

    return {
      eyebrow: "Premium",
      title: titleMap[category] || titleMap.consistency,
      body: `Premium helps you keep momentum by showing the clearer why behind your ${goalLabel} decisions this week.`,
      bullets: [
        "Clearer reasons behind each recommendation",
        "Coaching connected to your weekly plan",
        mobilityHeavy ? "Sharper recovery and mobility guidance" : "More precise next steps from your data"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "progress") {
    const streak = summary?.workoutStreak || 0;
    return {
      eyebrow: "Premium",
      title: streak >= 3 ? "See why your momentum is building" : "See what's actually moving your progress",
      body: "Premium makes it easier to keep your week moving by showing what's improving, what's slipping, and what to fix next.",
      bullets: [
        "See what's improving and what's slipping",
        "Clear explanations for why your trends changed",
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
        : "Your setup is ready. Premium unlocks the full adaptive plan behind it.";

    return {
      eyebrow: "Included in your free trial",
      title,
      body: `PulsePeak already knows you're focused on ${goalLabel}. The free trial is the easiest way to unlock the full experience for your next 7 days.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  return null;
}
