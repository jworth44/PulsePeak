// Creative Direction V2 — two first-class themes + "match system".
// Daylight (warm paper + pine) and Midnight (warm graphite + ember) are the
// only themes; the six legacy novelty themes are retired. Tokens live in
// src/styles-themes.css. Midnight is the shipping default while Daylight is
// hardened to parity per-capability (see PRODUCTION_ROADMAP.md, risk R1).

export const THEME_OPTIONS = [
  {
    value: "system",
    label: "Match system",
    mood: "Follows your device's light or dark setting",
    chips: ["#ede6d8", "#17130f", "#d9573a"]
  },
  {
    value: "daylight",
    label: "Daylight",
    mood: "Warm paper & pine — bright and editorial",
    chips: ["#ede6d8", "#1f6b5c", "#2b2116"]
  },
  {
    value: "midnight",
    label: "Midnight",
    mood: "Warm graphite & ember — calm and focused",
    chips: ["#17130f", "#d9573a", "#f2ece1"]
  },
  {
    value: "blossom",
    label: "Blossom",
    mood: "Lavender & blush — bright, violet & magenta",
    chips: ["#f2e9fb", "#7c3aed", "#db2777"]
  }
];

export const THEME_STORAGE_KEY = "pulsepeak-theme";
// The default theme for a brand-new user. Daylight and Midnight are EQUAL,
// first-class themes — either can be the default by changing only this value
// (or set it to "system"). The final default is an owner decision after
// real-world evaluation; both themes are held to full parity regardless.
export const FALLBACK_THEME = "midnight";

const THEME_COLOR = { daylight: "#ede6d8", midnight: "#17130f", blossom: "#f1e6fc" };

export function normalizeThemePreference(value) {
  return THEME_OPTIONS.some((option) => option.value === value) ? value : FALLBACK_THEME;
}

function prefersLight() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: light)").matches
    : false;
}

// Resolve a preference (system | daylight | midnight) to a concrete theme.
export function resolveTheme(preference) {
  const pref = normalizeThemePreference(preference);
  return pref === "system" ? (prefersLight() ? "daylight" : "midnight") : pref;
}

export function getStoredThemePreference() {
  if (typeof window === "undefined") return FALLBACK_THEME;
  return normalizeThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
}

// Apply a preference: set the concrete theme on <html>, persist the preference,
// and keep the browser theme-color in sync. Returns the concrete theme applied.
export function applyThemePreference(value) {
  const preference = normalizeThemePreference(value);
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && THEME_COLOR[resolved]) meta.setAttribute("content", THEME_COLOR[resolved]);
  return resolved;
}

// When the preference is "match system", re-resolve as the OS setting flips.
// Returns an unsubscribe function.
export function initThemeSync() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia("(prefers-color-scheme: light)");
  const handler = () => {
    if (getStoredThemePreference() === "system") {
      applyThemePreference("system");
    }
  };
  if (query.addEventListener) query.addEventListener("change", handler);
  else if (query.addListener) query.addListener(handler);
  return () => {
    if (query.removeEventListener) query.removeEventListener("change", handler);
    else if (query.removeListener) query.removeListener(handler);
  };
}
