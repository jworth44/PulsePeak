export function getFirstSessionRoute(user) {
  if (!user) {
    return "/dashboard";
  }

  const injuryStatus = user.injuryStatus;
  const goalType = user.goalType;

  if (injuryStatus === true || (typeof injuryStatus === "string" && injuryStatus !== "none")) {
    return "/injury-support";
  }

  if (goalType === "fat_loss") {
    return "/workout/quick-start";
  }

  if (goalType === "muscle_gain" || goalType === "bodybuilding" || goalType === "strength") {
    return "/workout/strength";
  }

  return "/guided-start";
}

export function getFirstSessionRouteContent(user) {
  const route = getFirstSessionRoute(user);

  switch (route) {
    case "/injury-support":
      return {
        title: "Your starting path: Injury Support",
        text: "Start with controlled movement and safer rebuilding before pushing harder sessions.",
        ctaLabel: "Continue Injury Support",
        route
      };
    case "/workout/quick-start":
      return {
        title: "Your starting path: Quick Workout",
        text: "Build momentum with a simple session that gets you moving without overthinking.",
        ctaLabel: "Continue Quick Workout",
        route
      };
    case "/workout/strength":
      return {
        title: "Your starting path: Strength",
        text: "Begin with clear strength work focused on consistency and steady effort.",
        ctaLabel: "Continue Strength",
        route
      };
    default:
      return {
        title: "Your starting path: Guided Start",
        text: "Start with a simple guided path so you know exactly what to do first.",
        ctaLabel: "Continue Guided Start",
        route: "/guided-start"
      };
  }
}

export function getTodayFocusContent(user, lastCategory) {
  const normalizedCategory = String(lastCategory || "").trim().toLowerCase();

  switch (normalizedCategory) {
    case "strength":
      return {
        title: "Today’s Focus",
        headline: "Continue Strength",
        text: "Keep today simple with clear strength work and one steady next session.",
        ctaLabel: "Continue Strength",
        route: "/workout/strength"
      };
    case "mobility":
      return {
        title: "Today’s Focus",
        headline: "Mobility & Stretch",
        text: "Use a lighter mobility session to keep movement quality high without adding friction.",
        ctaLabel: "Start Mobility & Stretch",
        route: "/mobility"
      };
    case "yoga":
      return {
        title: "Today’s Focus",
        headline: "Yoga Flow",
        text: "Open with a guided flow that keeps the day calm, clear, and easy to start.",
        ctaLabel: "Start Yoga Flow",
        route: "/mobility"
      };
    case "rehab":
    case "injury":
      return {
        title: "Today’s Focus",
        headline: "Injury Support",
        text: "Stay with the safer support path first before moving into broader training options.",
        ctaLabel: "Continue Injury Support",
        route: "/injury-support"
      };
    case "cardio":
      return {
        title: "Today’s Focus",
        headline: "Cardio Session",
        text: "Start with a simple cardio session that gets you moving without extra setup.",
        ctaLabel: "Start Cardio Session",
        route: "/workout/quick-start"
      };
    default: {
      const startingPath = getFirstSessionRouteContent(user);
      return {
        title: "Today’s Focus",
        headline: startingPath.title.replace("Your starting path: ", ""),
        text: startingPath.text,
        ctaLabel: startingPath.ctaLabel,
        route: startingPath.route
      };
    }
  }
}
