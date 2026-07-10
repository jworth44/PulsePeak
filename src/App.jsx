import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import AppShell from "./components/AppShell";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PublicPageLayout from "./components/PublicPageLayout";
import { usePageTracking } from "./lib/analytics";

// Route-level code splitting: the two entry surfaces (auth, dashboard) stay in
// the main bundle for the fastest first paint; every other route loads on
// demand. The PWA precaches all chunks, so post-install navigation is instant.
const PlanPage = lazy(() => import("./pages/PlanPage"));
const MobilityPage = lazy(() => import("./pages/MobilityPage"));
const WorkoutsPage = lazy(() => import("./pages/WorkoutsPage"));
const ExerciseLibraryPage = lazy(() => import("./pages/ExerciseLibraryPage"));
const WorkoutLibraryPage = lazy(() => import("./pages/WorkoutLibraryPage"));
const NutritionPage = lazy(() => import("./pages/NutritionPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const CoachPage = lazy(() => import("./pages/CoachPage"));
const BillingSuccessPage = lazy(() => import("./pages/BillingSuccessPage"));
const BillingCancelPage = lazy(() => import("./pages/BillingCancelPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const FirstSessionRoutePage = lazy(() => import("./pages/FirstSessionRoutePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const BRAND_LOGO = "/brand/pulsepeak-main-logo.png";

function RouteFallback() {
  return <div className="route-loading" role="status" aria-label="Loading" />;
}

export default function App() {
  const { token, loading, needsOnboarding } = useAuth();
  usePageTracking();

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/privacy" element={<PublicPageLayout><PrivacyPolicyPage /></PublicPageLayout>} />
          <Route path="/terms" element={<PublicPageLayout><TermsPage /></PublicPageLayout>} />
          <Route path="/help" element={<PublicPageLayout><HelpCenterPage /></PublicPageLayout>} />
          <Route path="/contact" element={<PublicPageLayout><ContactPage /></PublicPageLayout>} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    needsOnboarding ? (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Suspense>
    ) : (
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
            <Route path="/workout-library" element={<WorkoutLibraryPage />} />
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
            {/* Aliases for URLs users are likely to type from nav labels or habit. */}
            <Route path="/today" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/train" element={<Navigate to="/workouts" replace />} />
            <Route path="/exercises" element={<Navigate to="/exercise-library" replace />} />
            <Route path="/settings" element={<Navigate to="/preferences?section=account" replace />} />
            <Route path="/account" element={<Navigate to="/preferences?section=account" replace />} />
            <Route path="/billing/success" element={<BillingSuccessPage />} />
            <Route path="/billing/cancel" element={<BillingCancelPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    )
  );
}
