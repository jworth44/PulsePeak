import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import AppShell from "./components/AppShell";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PlanPage from "./pages/PlanPage";
import MobilityPage from "./pages/MobilityPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import NutritionPage from "./pages/NutritionPage";
import ProgressPage from "./pages/ProgressPage";
import CoachPage from "./pages/CoachPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import OnboardingPage from "./pages/OnboardingPage";
import PreferencesPage from "./pages/PreferencesPage";

const BRAND_LOGO = "/brand/pulsepeak-main-logo.png";

export default function App() {
  const { token, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="screen-center screen-center-branded">
        <img className="screen-center-logo" src={BRAND_LOGO} alt="PulsePeak" />
        <p>Loading PulsePeak...</p>
      </div>
    );
  }

  if (!token) {
    return <AuthPage />;
  }

  return (
    needsOnboarding ? (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    ) : (
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
          <Route path="/mobility" element={<MobilityPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="/billing/success" element={<BillingSuccessPage />} />
          <Route path="/billing/cancel" element={<BillingCancelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    )
  );
}
