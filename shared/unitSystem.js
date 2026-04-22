export const UNIT_PREFERENCE_OPTIONS = [
  {
    value: "imperial",
    label: "Imperial",
    description: "Use inches, pounds, and fluid ounces."
  },
  {
    value: "metric",
    label: "Metric",
    description: "Use centimeters, kilograms, and liters."
  }
];

export function normalizeUnitPreference(value) {
  return value === "metric" ? "metric" : "imperial";
}

export function convertHeightFromStored(heightCm, unitPreference) {
  const numeric = Number(heightCm);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForInput(numeric, 0)
    : roundForInput(numeric / 2.54, 0);
}

export function convertHeightToStored(heightValue, unitPreference) {
  const numeric = Number(heightValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForStorage(numeric)
    : roundForStorage(numeric * 2.54);
}

export function convertWeightFromStored(weightLb, unitPreference) {
  const numeric = Number(weightLb);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForInput(numeric * 0.45359237, 1)
    : roundForInput(numeric, 0);
}

export function convertWeightToStored(weightValue, unitPreference) {
  const numeric = Number(weightValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForStorage(numeric / 0.45359237)
    : roundForStorage(numeric);
}

export function convertHydrationFromStored(liters, unitPreference) {
  const numeric = Number(liters);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return "";
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForInput(numeric, 1)
    : roundForInput(numeric * 33.814, 0);
}

export function convertHydrationToStored(value, unitPreference) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return normalizeUnitPreference(unitPreference) === "metric"
    ? roundForStorage(numeric)
    : roundForStorage(numeric / 33.814);
}

export function formatHeight(heightCm, unitPreference) {
  const numeric = Number(heightCm);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Height pending";
  }

  if (normalizeUnitPreference(unitPreference) === "metric") {
    return `${Math.round(numeric)} cm`;
  }

  const inches = numeric / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches - feet * 12);
  return `${feet}'${remainingInches}"`;
}

export function formatWeight(weightLb, unitPreference) {
  const numeric = Number(weightLb);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Weight pending";
  }

  if (normalizeUnitPreference(unitPreference) === "metric") {
    return `${roundForInput(numeric * 0.45359237, 1)} kg`;
  }

  return `${Math.round(numeric)} lb`;
}

export function formatHydration(liters, unitPreference, precision = 1) {
  const numeric = Number(liters);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return normalizeUnitPreference(unitPreference) === "metric" ? `0.0 L` : `0 oz`;
  }

  if (normalizeUnitPreference(unitPreference) === "metric") {
    return `${numeric.toFixed(precision)} L`;
  }

  return `${Math.round(numeric * 33.814)} oz`;
}

function roundForInput(value, digits) {
  const factor = 10 ** digits;
  return String(Math.round(value * factor) / factor);
}

function roundForStorage(value) {
  return Number(value.toFixed(2));
}
