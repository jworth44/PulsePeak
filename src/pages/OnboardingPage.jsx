import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "../components/OnboardingFlow";
import { getFirstSessionRoute } from "../utils/getFirstSessionRoute";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return <OnboardingFlow mode="onboarding" onComplete={(profile) => navigate(getFirstSessionRoute(profile), { replace: true })} />;
}
