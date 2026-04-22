export const THEME_OPTIONS = [
  {
    value: "solar-crest",
    label: "Solar Crest",
    mood: "Bold daylight energy",
    chips: ["#d92b31", "#144bc7", "#f2c14a"]
  },
  {
    value: "gamma-forge",
    label: "Gamma Forge",
    mood: "Dense power and recovery",
    chips: ["#1a8a43", "#0f1d13", "#89d76d"]
  },
  {
    value: "velvet-mischief",
    label: "Velvet Mischief",
    mood: "Electric contrast and edge",
    chips: ["#6f2cff", "#131313", "#7ddc36"]
  },
  {
    value: "liberty-signal",
    label: "Liberty Signal",
    mood: "Clean discipline and drive",
    chips: ["#0d3973", "#f5f8fc", "#c83242"]
  },
  {
    value: "amazon-flare",
    label: "Amazon Flare",
    mood: "Warm premium intensity",
    chips: ["#8c1f2d", "#ca8f18", "#f6ecda"]
  },
  {
    value: "crimson-orbit",
    label: "Crimson Orbit",
    mood: "Dark focus and precision",
    chips: ["#6d1136", "#15111f", "#d96aa4"]
  }
];

export const THEME_STORAGE_KEY = "pulsepeak-theme";
export const FALLBACK_THEME = "gamma-forge";

export function normalizeThemePreference(value) {
  return THEME_OPTIONS.some((option) => option.value === value) ? value : FALLBACK_THEME;
}

export function getStoredThemePreference() {
  return normalizeThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function applyThemePreference(value) {
  const theme = normalizeThemePreference(value);
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  return theme;
}
