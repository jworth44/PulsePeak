export function isProfileComplete(profile = {}) {
  return Boolean(
    profile.goalType &&
      profile.nutritionMode &&
      profile.unitPreference &&
      profile.ageGroup &&
      profile.birthdate &&
      profile.experienceLevel &&
      profile.trainingEnvironment &&
      profile.equipmentProfile &&
      profile.sex &&
      Number.isFinite(Number(profile.heightCm)) &&
      Number(profile.heightCm) > 0 &&
      Number.isFinite(Number(profile.currentWeight)) &&
      Number(profile.currentWeight) > 0 &&
      profile.injuryStatus &&
      Array.isArray(profile.restrictedAreas)
  );
}

export function hasCompletedOnboarding(profile = {}) {
  return profile.onboardingCompleted === true && isProfileComplete(profile);
}
