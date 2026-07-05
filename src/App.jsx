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
import FirstSessionRoutePage from "./pages/FirstSessionRoutePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import PublicPageLayout from "./components/PublicPageLayout";

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
    return (
      <Routes>
        <Route path="/privacy" element={<PublicPageLayout><PrivacyPolicyPage /></PublicPageLayout>} />
        <Route path="/terms" element={<PublicPageLayout><TermsPage /></PublicPageLayout>} />
        <Route path="/help" element={<PublicPageLayout><HelpCenterPage /></PublicPageLayout>} />
        <Route path="/contact" element={<PublicPageLayout><ContactPage /></PublicPageLayout>} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
          <Route path="/mobility" element={<MobilityPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route
            path="/guided-start"
            element={
              <FirstSessionRoutePage
                description="Start with a simple guided session built from your saved setup."
                startPath="/workouts"
                title="Guided Start"
              />
            }
          />
          <Route
            path="/workout/quick-start"
            element={
              <FirstSessionRoutePage
                description="Begin with a quick-start workout path matched to your current goal."
                startPath="/workouts"
                title="Quick Start Workout"
              />
            }
          />
          <Route
            path="/workout/strength"
            element={
              <FirstSessionRoutePage
                description="Jump into a strength-focused session path based on your current setup."
                startPath="/workouts"
                title="Strength Session"
              />
            }
          />
          <Route
            path="/injury-support"
            element={
              <FirstSessionRoutePage
                description="Start with the injury-support path before moving into a full session."
                startPath="/mobility"
                title="Injury Support"
              />
            }
          />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="/billing/success" element={<BillingSuccessPage />} />
          <Route path="/billing/cancel" element={<BillingCancelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    )
  );
}
