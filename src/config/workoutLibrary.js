// ======================================================================
// WORKOUT LIBRARY — browse taxonomy + media pipeline (production framework)
// ======================================================================
// A complete, production-ready browse experience: Browse by Equipment
// (icon-based UI, no owner media needed), Browse by Muscle Group (requires
// approved anatomical diagrams) and Popular Workout Types (requires approved
// photography).
//
// MEDIA HONESTY (Product Excellence Standard): media that is NOT yet approved
// resolves to `null` and the UI renders a clean, intentional "awaiting approved
// media" production state — never fake/placeholder imagery, never a hidden gap.
// When the owner supplies an approved asset, its path is added to
// WORKOUT_LIBRARY_MEDIA below and it drops directly into the finished
// framework. Every required asset is tracked in the Media Production Queue
// (MEDIA_AUDIT_REGISTER.md → "Workout Library").
// ======================================================================

// ---- Browse by equipment (icon UI — no owner media required) ----------
// `filter` is the query the results view is opened with. Equipment values map
// to the app's equipment profiles; the session-shortcut chips map to a focus.
export const EQUIPMENT_FILTERS = [
  { id: "bodyweight", label: "Bodyweight", icon: "bodyweight", filter: { equipment: "bodyweight" } },
  { id: "dumbbells", label: "Dumbbells", icon: "dumbbell", filter: { equipment: "dumbbells" } },
  { id: "barbell", label: "Barbell", icon: "barbell", filter: { equipment: "barbell" } },
  { id: "kettlebells", label: "Kettlebells", icon: "kettlebell", filter: { equipment: "kettlebells" } },
  { id: "machines", label: "Machines / Cables", icon: "machine", filter: { equipment: "machines" } },
  { id: "bands", label: "Resistance Bands", icon: "band", filter: { equipment: "bands" } },
  { id: "pullup", label: "Pull-up Bar", icon: "pullup", filter: { equipment: "pullup_bar" } },
  { id: "bench", label: "Bench", icon: "bench", filter: { equipment: "bench" } },
  { id: "quick", label: "Quick Session", icon: "clock", filter: { focus: "quick" } },
  { id: "home", label: "Home Equipment", icon: "home", filter: { focus: "home" } },
  { id: "joint", label: "Lower Joint Stress", icon: "shield", filter: { focus: "low_impact" } },
  { id: "recovery", label: "Recovery Day", icon: "recovery", filter: { focus: "recovery" } },
  { id: "strengthFocus", label: "Strength Focus", icon: "strength", filter: { focus: "strength" } },
  { id: "upper", label: "Upper Body", icon: "upper", filter: { region: "upper" } },
  { id: "lower", label: "Lower Body", icon: "lower", filter: { region: "lower" } },
  { id: "core", label: "Core", icon: "core", filter: { muscle: "core" } }
];

// ---- Browse by muscle group (requires approved anatomical diagram) -----
export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", media: "muscle-chest", filter: { muscle: "chest" } },
  { id: "back", label: "Back", media: "muscle-back", filter: { muscle: "back" } },
  { id: "shoulders", label: "Shoulders", media: "muscle-shoulders", filter: { muscle: "shoulders" } },
  { id: "arms", label: "Arms", media: "muscle-arms", filter: { muscle: "arms" } },
  { id: "legs", label: "Legs", media: "muscle-legs", filter: { muscle: "legs" } },
  { id: "glutes", label: "Glutes", media: "muscle-glutes", filter: { muscle: "glutes" } },
  { id: "core", label: "Core", media: "muscle-core", filter: { muscle: "core" } },
  { id: "fullBody", label: "Full Body", media: "muscle-full-body", filter: { muscle: "full_body" } }
];

// ---- Popular workout types (requires approved photography) -------------
export const WORKOUT_TYPES = [
  { id: "strength", label: "Strength", media: "type-strength", description: "Build muscle and get stronger with focused training.", filter: { type: "strength" } },
  { id: "hypertrophy", label: "Hypertrophy", media: "type-hypertrophy", description: "Increase muscle size with balanced volume.", filter: { type: "hypertrophy" } },
  { id: "strengthEndurance", label: "Strength Endurance", media: "type-strength-endurance", description: "Build work capacity and sustained performance.", filter: { type: "strength_endurance" } },
  { id: "power", label: "Power", media: "type-power", description: "Train explosive strength and athletic performance.", filter: { type: "power" } },
  { id: "conditioning", label: "Conditioning", media: "type-conditioning", description: "Improve fitness and cardiovascular health.", filter: { type: "conditioning" } },
  { id: "recovery", label: "Recovery", media: "type-recovery", description: "Support recovery and reduce soreness.", filter: { type: "recovery" } }
];

// ======================================================================
// MEDIA PIPELINE
// ======================================================================
// Approved-media manifest: media key -> served asset path. EMPTY until the
// owner supplies approved assets. To publish an approved asset, add e.g.
//   "muscle-chest": "/media/workout-library/muscle/chest.png",
// after it has passed the AI Image QA Gate. Anything not listed here renders
// the "awaiting approved media" production state.
export const WORKOUT_LIBRARY_MEDIA = {
  // (intentionally empty — awaiting owner-generated, QA-passed assets)
};

// Resolve a media key to an approved asset path, or null when none is approved
// yet (the caller then renders the awaiting-media production state).
export function resolveLibraryMedia(key) {
  if (!key) return null;
  const src = WORKOUT_LIBRARY_MEDIA[key];
  return typeof src === "string" && src.length > 0 ? src : null;
}

// Every asset the finished framework needs — the source of truth for the Media
// Production Queue and for coverage reporting.
export const REQUIRED_LIBRARY_MEDIA = [
  ...MUSCLE_GROUPS.map((m) => ({ key: m.media, kind: "muscle-diagram", label: m.label })),
  ...WORKOUT_TYPES.map((t) => ({ key: t.media, kind: "workout-photo", label: t.label }))
];

// Coverage snapshot — how much approved media has dropped into the framework.
export function getLibraryMediaCoverage() {
  const total = REQUIRED_LIBRARY_MEDIA.length;
  const approved = REQUIRED_LIBRARY_MEDIA.filter((a) => resolveLibraryMedia(a.key)).length;
  return { total, approved, awaiting: total - approved };
}

// Media validation: any published (non-null) asset must be a rooted path under
// the reviewed media directory. Returns the list of invalid entries (empty =
// valid) so a build/QA check can fail loudly on a malformed drop-in.
export function validateLibraryMedia() {
  return Object.entries(WORKOUT_LIBRARY_MEDIA)
    .filter(([, src]) => !(typeof src === "string" && src.startsWith("/media/workout-library/")))
    .map(([key, src]) => ({ key, src }));
}
