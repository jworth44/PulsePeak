import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "../components/OnboardingFlow";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return <OnboardingFlow mode="onboarding" onComplete={() => navigate("/", { replace: true })} />;
}
