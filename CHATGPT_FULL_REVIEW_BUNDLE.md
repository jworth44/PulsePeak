# PulsePeak Full Review Bundle

This file was generated for external review. It contains the current code for key app files touched during the PulsePeak upgrade work.

Binary image/media assets are not embedded here. See `CHATGPT_MEDIA_MANIFEST.md` for the asset list.

## Included Files

- src/App.jsx
- src/main.jsx
- src/styles.css
- src/api/client.js
- src/components/AppShell.jsx
- src/components/DashboardControlsPanel.jsx
- src/components/MovementDetailModal.jsx
- src/components/MovementReference.jsx
- src/components/OnboardingFlow.jsx
- src/components/UpgradePrompt.jsx
- src/components/WeeklyPlanPreviewModal.jsx
- src/components/WorkoutDetailModal.jsx
- src/config/monetization.js
- src/config/profileOptions.js
- src/config/themes.js
- src/config/upgradePrompts.js
- src/hooks/useDashboardData.js
- src/hooks/useUpgradeCheckout.js
- src/lib/stripe.js
- src/pages/AuthPage.jsx
- src/pages/BillingCancelPage.jsx
- src/pages/BillingSuccessPage.jsx
- src/pages/CoachPage.jsx
- src/pages/DashboardPage.jsx
- src/pages/HelpCenterPage.jsx
- src/pages/MobilityPage.jsx
- src/pages/NutritionPage.jsx
- src/pages/OnboardingPage.jsx
- src/pages/PlanPage.jsx
- src/pages/PreferencesPage.jsx
- src/pages/ProgressPage.jsx
- src/pages/WorkoutsPage.jsx
- src/state/AuthContext.jsx
- shared/appModes.js
- shared/dashboardModules.js
- shared/entitlements.js
- shared/exerciseCatalog.js
- shared/libraryTaxonomy.js
- shared/mediaGenerationConfig.js
- shared/mediaReviewCatalog.js
- shared/nutritionMedia.js
- shared/profileState.js
- shared/unitSystem.js
- shared/workoutEngine.js
- server/server.js
- server/stripeBilling.js
- server/data/movementLibrary.js
- server/data/store.js
- server/data/stretchLibrary.js
- server/data/workoutLibrary.js
- scripts/build-media-batch.mjs
- scripts/e2e-smoke.mjs
- package.json
- .env.example
- render.yaml
- STAGING_DEPLOY.md

---

## FILE: src/App.jsx

`$ext
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import AppShell from "./components/AppShell";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PlanPage from "./pages/PlanPage";
import MobilityPage from "./pages/MobilityPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import NutritionPage from "./pages/NutritionPage";
import ProgressPage from "./pages/ProgressPage";
import CoachPage from "./pages/CoachPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import OnboardingPage from "./pages/OnboardingPage";
import PreferencesPage from "./pages/PreferencesPage";

export default function App() {
  const { token, loading, needsOnboarding } = useAuth();

  if (loading) {
    return <div className="screen-center">Loading PulsePeak...</div>;
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

```

## FILE: src/main.jsx

`$ext
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./state/AuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

```

## FILE: src/styles.css

`$ext
:root {
  color-scheme: dark;
  --ink-rgb: 11, 21, 43;
  --card-rgb: 255, 255, 255;
  --card-alt-rgb: 244, 246, 255;
  --accent-rgb: 217, 43, 49;
  --chart-rgb: 20, 75, 199;
  --premium-rgb: 242, 193, 74;
  --success-rgb: 47, 168, 109;
  --danger-rgb: 212, 72, 113;
  --sidebar-rgb: 9, 18, 40;
  --overlay-rgb: 4, 9, 20;
  --theme-name: "Solar Crest";
  --app-background: #081325;
  --app-background-strong: #13203f;
  --sidebar-background: rgba(9, 18, 40, 0.86);
  --main-surface-background: rgba(15, 24, 52, 0.72);
  --surface: rgba(248, 250, 255, 0.82);
  --surface-strong: rgba(255, 255, 255, 0.94);
  --surface-dark: #091328;
  --card-background: rgba(255, 255, 255, 0.86);
  --secondary-card-background: rgba(244, 246, 255, 0.84);
  --text-primary: #f7f9ff;
  --text-secondary: #51627f;
  --text-on-card: #0d1833;
  --sidebar-text: #f7f9ff;
  --sidebar-muted: #c6d2ee;
  --accent-color: #d92b31;
  --accent-contrast: #fff7ef;
  --border-color: rgba(208, 220, 255, 0.12);
  --button-background: linear-gradient(135deg, #e0303c, #c51933);
  --button-hover: linear-gradient(135deg, #f0464d, #d92b31);
  --button-text: #fff7ef;
  --secondary-button-background: rgba(9, 18, 40, 0.94);
  --secondary-button-background-hover: rgba(14, 26, 58, 0.98);
  --secondary-button-text: #f7f9ff;
  --ghost-button-background: rgba(11, 21, 43, 0.08);
  --ghost-button-background-hover: rgba(11, 21, 43, 0.14);
  --ghost-button-text: #0d1833;
  --ring-accent: #f2c14a;
  --chart-accent: #4a7cff;
  --premium-highlight: #f2c14a;
  --panel-shadow: 0 26px 80px rgba(4, 10, 24, 0.34);
  --soft-shadow: 0 18px 42px rgba(6, 11, 24, 0.22);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(242, 193, 74, 0.24), transparent 28%),
    radial-gradient(circle at top right, rgba(74, 124, 255, 0.28), transparent 34%),
    linear-gradient(180deg, #050d1b 0%, #081325 48%, #122146 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(242, 193, 74, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(243, 246, 255, 0.92));
  --callout-glow:
    radial-gradient(circle at top right, rgba(217, 43, 49, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(245, 247, 255, 0.94));
  --focus-glow:
    radial-gradient(circle at top right, rgba(242, 193, 74, 0.24), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(244, 247, 255, 0.92));
  --success-glow:
    radial-gradient(circle at top right, rgba(47, 168, 109, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(248, 255, 252, 0.96), rgba(239, 250, 245, 0.92));
  --warning-glow:
    radial-gradient(circle at top right, rgba(217, 43, 49, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(255, 248, 249, 0.96), rgba(250, 239, 243, 0.92));
  --cool-glow:
    radial-gradient(circle at top right, rgba(74, 124, 255, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(247, 250, 255, 0.96), rgba(236, 243, 255, 0.92));
  --gradient-hero: var(--hero-gradient);
  --bg: var(--app-background);
  --bg-strong: var(--app-background-strong);
  --text: var(--text-primary);
  --muted: var(--text-secondary);
  --primary-text: var(--text-on-card);
  --secondary-text: var(--text-secondary);
  --line: var(--border-color);
  --orange: var(--accent-color);
  --green: rgb(var(--success-rgb));
  --blue: var(--chart-accent);
  --rose: rgb(var(--danger-rgb));
  --shadow: var(--panel-shadow);
  --radius-lg: 28px;
  --radius-md: 20px;
  --radius-sm: 14px;
}

:root[data-theme="gamma-forge"] {
  --ink-rgb: 216, 240, 222;
  --card-rgb: 18, 32, 22;
  --card-alt-rgb: 28, 46, 31;
  --accent-rgb: 45, 184, 83;
  --chart-rgb: 142, 215, 109;
  --premium-rgb: 215, 242, 96;
  --success-rgb: 88, 211, 125;
  --danger-rgb: 196, 83, 118;
  --sidebar-rgb: 9, 18, 11;
  --overlay-rgb: 5, 10, 7;
  --app-background: #08100a;
  --app-background-strong: #132317;
  --sidebar-background: rgba(9, 18, 11, 0.88);
  --main-surface-background: rgba(14, 24, 16, 0.78);
  --surface: rgba(16, 30, 19, 0.88);
  --surface-strong: rgba(20, 38, 24, 0.96);
  --surface-dark: #ecffe9;
  --card-background: rgba(19, 33, 22, 0.9);
  --secondary-card-background: rgba(28, 46, 31, 0.9);
  --text-primary: #edf9ef;
  --text-secondary: #bdd9c0;
  --text-on-card: #edf9ef;
  --sidebar-text: #edf9ef;
  --sidebar-muted: #bfd9c1;
  --accent-color: #2db853;
  --accent-contrast: #f5fff0;
  --border-color: rgba(184, 227, 191, 0.14);
  --button-background: linear-gradient(135deg, #3ac863, #1f9f44);
  --button-hover: linear-gradient(135deg, #55d976, #2db853);
  --button-text: #08100a;
  --secondary-button-background: rgba(6, 18, 9, 0.94);
  --secondary-button-background-hover: rgba(10, 25, 12, 0.98);
  --secondary-button-text: #edf9ef;
  --ghost-button-background: rgba(184, 227, 191, 0.12);
  --ghost-button-background-hover: rgba(184, 227, 191, 0.2);
  --ghost-button-text: #edf9ef;
  --ring-accent: #d7f260;
  --chart-accent: #8ed76d;
  --premium-highlight: #d7f260;
  --panel-shadow: 0 28px 84px rgba(3, 8, 4, 0.42);
  --soft-shadow: 0 18px 42px rgba(5, 11, 7, 0.32);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(215, 242, 96, 0.2), transparent 26%),
    radial-gradient(circle at top right, rgba(45, 184, 83, 0.24), transparent 32%),
    linear-gradient(180deg, #060b06 0%, #08100a 50%, #102115 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(215, 242, 96, 0.15), transparent 30%),
    linear-gradient(180deg, rgba(22, 37, 25, 0.98), rgba(18, 31, 21, 0.94));
  --callout-glow:
    radial-gradient(circle at top right, rgba(45, 184, 83, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(25, 39, 28, 0.98), rgba(18, 31, 21, 0.95));
  --focus-glow:
    radial-gradient(circle at top right, rgba(142, 215, 109, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(24, 38, 27, 0.98), rgba(18, 31, 21, 0.95));
  --success-glow:
    radial-gradient(circle at top right, rgba(88, 211, 125, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(23, 40, 27, 0.98), rgba(17, 31, 21, 0.95));
  --warning-glow:
    radial-gradient(circle at top right, rgba(215, 242, 96, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(24, 39, 27, 0.98), rgba(18, 31, 21, 0.95));
  --cool-glow:
    radial-gradient(circle at top right, rgba(142, 215, 109, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(24, 39, 27, 0.98), rgba(18, 31, 21, 0.95));
}

:root[data-theme="velvet-mischief"] {
  --ink-rgb: 245, 241, 255;
  --card-rgb: 20, 14, 28;
  --card-alt-rgb: 28, 20, 38;
  --accent-rgb: 127, 57, 240;
  --chart-rgb: 179, 88, 255;
  --premium-rgb: 128, 220, 59;
  --success-rgb: 128, 220, 59;
  --danger-rgb: 226, 105, 189;
  --sidebar-rgb: 8, 6, 13;
  --overlay-rgb: 5, 3, 8;
  --app-background: #09060f;
  --app-background-strong: #140d1d;
  --sidebar-background: rgba(8, 6, 13, 0.9);
  --main-surface-background: rgba(16, 11, 24, 0.8);
  --surface: rgba(22, 15, 31, 0.9);
  --surface-strong: rgba(30, 21, 43, 0.96);
  --surface-dark: #f7f4ff;
  --card-background: rgba(24, 17, 35, 0.9);
  --secondary-card-background: rgba(32, 22, 46, 0.9);
  --text-primary: #f7f4ff;
  --text-secondary: #d4c6e8;
  --text-on-card: #f7f4ff;
  --sidebar-text: #f7f4ff;
  --sidebar-muted: #cfbee6;
  --accent-color: #7f39f0;
  --accent-contrast: #fffaff;
  --border-color: rgba(207, 183, 255, 0.14);
  --button-background: linear-gradient(135deg, #8745ff, #6424d6);
  --button-hover: linear-gradient(135deg, #9557ff, #7f39f0);
  --button-text: #fffaff;
  --secondary-button-background: rgba(13, 9, 22, 0.94);
  --secondary-button-background-hover: rgba(18, 12, 30, 0.98);
  --secondary-button-text: #f7f4ff;
  --ghost-button-background: rgba(207, 183, 255, 0.1);
  --ghost-button-background-hover: rgba(207, 183, 255, 0.18);
  --ghost-button-text: #f7f4ff;
  --ring-accent: #80dc3b;
  --chart-accent: #b358ff;
  --premium-highlight: #80dc3b;
  --panel-shadow: 0 30px 90px rgba(5, 4, 9, 0.46);
  --soft-shadow: 0 18px 42px rgba(7, 5, 11, 0.34);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(127, 57, 240, 0.24), transparent 30%),
    radial-gradient(circle at top right, rgba(128, 220, 59, 0.2), transparent 28%),
    linear-gradient(180deg, #06050a 0%, #09060f 50%, #140d1d 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(128, 220, 59, 0.12), transparent 26%),
    linear-gradient(180deg, rgba(29, 21, 41, 0.98), rgba(21, 15, 31, 0.94));
  --callout-glow:
    radial-gradient(circle at top right, rgba(127, 57, 240, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(30, 21, 43, 0.98), rgba(22, 15, 31, 0.95));
  --focus-glow:
    radial-gradient(circle at top right, rgba(179, 88, 255, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(30, 21, 43, 0.98), rgba(22, 15, 31, 0.95));
  --success-glow:
    radial-gradient(circle at top right, rgba(128, 220, 59, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(29, 21, 41, 0.98), rgba(21, 15, 31, 0.95));
  --warning-glow:
    radial-gradient(circle at top right, rgba(226, 105, 189, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(30, 21, 43, 0.98), rgba(22, 15, 31, 0.95));
  --cool-glow:
    radial-gradient(circle at top right, rgba(179, 88, 255, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(29, 21, 41, 0.98), rgba(21, 15, 31, 0.95));
}

:root[data-theme="liberty-signal"] {
  --ink-rgb: 15, 33, 57;
  --card-rgb: 255, 255, 255;
  --card-alt-rgb: 240, 244, 251;
  --accent-rgb: 200, 50, 66;
  --chart-rgb: 34, 84, 166;
  --premium-rgb: 118, 164, 245;
  --success-rgb: 53, 162, 117;
  --danger-rgb: 200, 50, 66;
  --sidebar-rgb: 12, 28, 54;
  --overlay-rgb: 8, 17, 30;
  --app-background: #e7eef9;
  --app-background-strong: #d8e3f4;
  --sidebar-background: rgba(12, 28, 54, 0.9);
  --main-surface-background: rgba(245, 248, 252, 0.66);
  --surface: rgba(255, 255, 255, 0.84);
  --surface-strong: rgba(255, 255, 255, 0.97);
  --surface-dark: #0d2446;
  --card-background: rgba(255, 255, 255, 0.92);
  --secondary-card-background: rgba(240, 244, 251, 0.9);
  --text-primary: #112340;
  --text-secondary: #44556e;
  --text-on-card: #112340;
  --sidebar-text: #f5f8fc;
  --sidebar-muted: #dbe6f7;
  --accent-color: #c83242;
  --accent-contrast: #fdf8fb;
  --border-color: rgba(17, 35, 64, 0.1);
  --button-background: linear-gradient(135deg, #d43e50, #b92838);
  --button-hover: linear-gradient(135deg, #de5060, #c83242);
  --button-text: #fdf8fb;
  --secondary-button-background: rgba(13, 36, 70, 0.94);
  --secondary-button-background-hover: rgba(16, 43, 82, 0.98);
  --secondary-button-text: #f5f8fc;
  --ghost-button-background: rgba(17, 35, 64, 0.08);
  --ghost-button-background-hover: rgba(17, 35, 64, 0.14);
  --ghost-button-text: #112340;
  --ring-accent: #2254a6;
  --chart-accent: #3472d8;
  --premium-highlight: #2254a6;
  --panel-shadow: 0 24px 72px rgba(20, 36, 64, 0.12);
  --soft-shadow: 0 16px 34px rgba(20, 36, 64, 0.1);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(34, 84, 166, 0.16), transparent 32%),
    radial-gradient(circle at top right, rgba(200, 50, 66, 0.16), transparent 30%),
    linear-gradient(180deg, #f5f8fc 0%, #e7eef9 50%, #d8e3f4 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(34, 84, 166, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 252, 0.94));
  --callout-glow:
    radial-gradient(circle at top right, rgba(200, 50, 66, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 252, 0.95));
  --focus-glow:
    radial-gradient(circle at top right, rgba(34, 84, 166, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 244, 251, 0.95));
  --success-glow:
    radial-gradient(circle at top right, rgba(53, 162, 117, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(251, 255, 253, 0.98), rgba(244, 250, 247, 0.95));
  --warning-glow:
    radial-gradient(circle at top right, rgba(200, 50, 66, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 251, 251, 0.98), rgba(250, 242, 244, 0.95));
  --cool-glow:
    radial-gradient(circle at top right, rgba(34, 84, 166, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(247, 251, 255, 0.98), rgba(240, 244, 251, 0.95));
}

:root[data-theme="amazon-flare"] {
  --ink-rgb: 58, 28, 23;
  --card-rgb: 253, 248, 240;
  --card-alt-rgb: 246, 236, 214;
  --accent-rgb: 140, 31, 45;
  --chart-rgb: 180, 118, 24;
  --premium-rgb: 214, 165, 47;
  --success-rgb: 70, 156, 114;
  --danger-rgb: 183, 57, 76;
  --sidebar-rgb: 55, 21, 24;
  --overlay-rgb: 23, 10, 9;
  --app-background: #f4eadb;
  --app-background-strong: #ecd7ba;
  --sidebar-background: rgba(55, 21, 24, 0.9);
  --main-surface-background: rgba(252, 244, 233, 0.68);
  --surface: rgba(253, 248, 240, 0.86);
  --surface-strong: rgba(255, 251, 245, 0.97);
  --surface-dark: #331619;
  --card-background: rgba(255, 250, 243, 0.9);
  --secondary-card-background: rgba(246, 236, 214, 0.86);
  --text-primary: #3a1c17;
  --text-secondary: #665046;
  --text-on-card: #3a1c17;
  --sidebar-text: #fff5ef;
  --sidebar-muted: #f0d7cf;
  --accent-color: #8c1f2d;
  --accent-contrast: #fff8f1;
  --border-color: rgba(58, 28, 23, 0.1);
  --button-background: linear-gradient(135deg, #9c2938, #7a1421);
  --button-hover: linear-gradient(135deg, #af3444, #8c1f2d);
  --button-text: #fff8f1;
  --secondary-button-background: rgba(51, 22, 25, 0.94);
  --secondary-button-background-hover: rgba(63, 28, 31, 0.98);
  --secondary-button-text: #fff5ef;
  --ghost-button-background: rgba(58, 28, 23, 0.08);
  --ghost-button-background-hover: rgba(58, 28, 23, 0.14);
  --ghost-button-text: #3a1c17;
  --ring-accent: #ca8f18;
  --chart-accent: #b47618;
  --premium-highlight: #d6a52f;
  --panel-shadow: 0 26px 72px rgba(54, 25, 21, 0.12);
  --soft-shadow: 0 16px 34px rgba(54, 25, 21, 0.1);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(214, 165, 47, 0.18), transparent 30%),
    radial-gradient(circle at top right, rgba(140, 31, 45, 0.16), transparent 30%),
    linear-gradient(180deg, #fcf6ee 0%, #f4eadb 50%, #ecd7ba 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(214, 165, 47, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 251, 245, 0.98), rgba(248, 239, 223, 0.94));
  --callout-glow:
    radial-gradient(circle at top right, rgba(140, 31, 45, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(255, 251, 245, 0.98), rgba(247, 238, 223, 0.95));
  --focus-glow:
    radial-gradient(circle at top right, rgba(202, 143, 24, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(255, 251, 245, 0.98), rgba(248, 239, 223, 0.95));
  --success-glow:
    radial-gradient(circle at top right, rgba(70, 156, 114, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(251, 255, 252, 0.98), rgba(244, 249, 246, 0.95));
  --warning-glow:
    radial-gradient(circle at top right, rgba(140, 31, 45, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 250, 248, 0.98), rgba(250, 241, 241, 0.95));
  --cool-glow:
    radial-gradient(circle at top right, rgba(180, 118, 24, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 251, 245, 0.98), rgba(246, 239, 228, 0.95));
}

:root[data-theme="crimson-orbit"] {
  --ink-rgb: 242, 229, 242;
  --card-rgb: 25, 17, 31;
  --card-alt-rgb: 34, 24, 43;
  --accent-rgb: 109, 17, 54;
  --chart-rgb: 214, 106, 164;
  --premium-rgb: 237, 135, 191;
  --success-rgb: 71, 181, 146;
  --danger-rgb: 196, 76, 123;
  --sidebar-rgb: 11, 8, 18;
  --overlay-rgb: 6, 4, 10;
  --app-background: #0d0914;
  --app-background-strong: #171020;
  --sidebar-background: rgba(11, 8, 18, 0.9);
  --main-surface-background: rgba(20, 14, 28, 0.8);
  --surface: rgba(24, 17, 33, 0.9);
  --surface-strong: rgba(31, 22, 43, 0.96);
  --surface-dark: #fff0fb;
  --card-background: rgba(26, 18, 35, 0.9);
  --secondary-card-background: rgba(34, 24, 43, 0.9);
  --text-primary: #f8f0fb;
  --text-secondary: #d7c5d9;
  --text-on-card: #f8f0fb;
  --sidebar-text: #f8f0fb;
  --sidebar-muted: #d7c4da;
  --accent-color: #6d1136;
  --accent-contrast: #fff5fb;
  --border-color: rgba(229, 201, 240, 0.12);
  --button-background: linear-gradient(135deg, #891849, #5d0a2c);
  --button-hover: linear-gradient(135deg, #9b2660, #6d1136);
  --button-text: #fff5fb;
  --secondary-button-background: rgba(17, 11, 25, 0.94);
  --secondary-button-background-hover: rgba(24, 16, 34, 0.98);
  --secondary-button-text: #f8f0fb;
  --ghost-button-background: rgba(229, 201, 240, 0.1);
  --ghost-button-background-hover: rgba(229, 201, 240, 0.18);
  --ghost-button-text: #f8f0fb;
  --ring-accent: #d96aa4;
  --chart-accent: #c85286;
  --premium-highlight: #ed87bf;
  --panel-shadow: 0 30px 92px rgba(6, 4, 10, 0.48);
  --soft-shadow: 0 18px 42px rgba(8, 5, 12, 0.36);
  --hero-gradient:
    radial-gradient(circle at top left, rgba(237, 135, 191, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(109, 17, 54, 0.24), transparent 32%),
    linear-gradient(180deg, #09060f 0%, #0d0914 50%, #171020 100%);
  --card-glow:
    radial-gradient(circle at top right, rgba(237, 135, 191, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(32, 24, 41, 0.98), rgba(24, 17, 33, 0.94));
  --callout-glow:
    radial-gradient(circle at top right, rgba(109, 17, 54, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(32, 24, 41, 0.98), rgba(24, 17, 33, 0.95));
  --focus-glow:
    radial-gradient(circle at top right, rgba(214, 106, 164, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(32, 24, 41, 0.98), rgba(24, 17, 33, 0.95));
  --success-glow:
    radial-gradient(circle at top right, rgba(71, 181, 146, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(31, 24, 39, 0.98), rgba(24, 17, 33, 0.95));
  --warning-glow:
    radial-gradient(circle at top right, rgba(214, 106, 164, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(32, 24, 41, 0.98), rgba(24, 17, 33, 0.95));
  --cool-glow:
    radial-gradient(circle at top right, rgba(237, 135, 191, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(31, 24, 39, 0.98), rgba(24, 17, 33, 0.95));
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Instrument Sans", sans-serif;
  color: var(--text);
  background: var(--gradient-hero);
  transition: background 220ms ease, color 220ms ease;
}

button,
input,
select {
  font: inherit;
}

#root {
  min-height: 100vh;
}

.app-shell,
.hero-content,
.hero-stats,
.panel-heading,
.metrics-grid,
.content-grid,
.insight-list,
.weekly-bars,
.auth-shell,
.help-layout,
.onboarding-shell,
.onboarding-highlights,
.onboarding-summary,
.onboarding-actions {
  display: flex;
}

.app-shell {
  min-height: 100vh;
}

.sidebar {
  width: 290px;
  padding: 28px 22px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 28px;
  background:
    radial-gradient(circle at top right, rgba(var(--premium-rgb), 0.16), transparent 34%),
    linear-gradient(180deg, rgba(var(--sidebar-rgb), 0.92), rgba(var(--sidebar-rgb), 0.82));
  border-right: 1px solid var(--line);
  position: sticky;
  top: 0;
  height: 100vh;
  backdrop-filter: blur(14px);
  box-shadow: inset -1px 0 0 rgba(var(--premium-rgb), 0.06);
  color: var(--sidebar-text);
  overflow: hidden;
}

.sidebar-primary,
.sidebar-brand,
.sidebar-profile,
.sidebar-group-list,
.sidebar-submenu-panel,
.sidebar-submenu-items {
  display: grid;
}

.sidebar-primary {
  gap: 20px;
  min-height: 0;
  overflow: hidden;
  grid-template-rows: auto minmax(0, 1fr);
}

.sidebar-brand,
.sidebar-profile {
  gap: 6px;
}

.sidebar h1,
.hero-copy h2,
.panel h3,
.metric-card h3,
.auth-hero h1,
.coach-card h4,
.habit-card h4,
.preset-card h4 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.sidebar-nav-shell {
  display: grid;
  gap: 12px;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
}

.sidebar-group-list {
  gap: 10px;
}

.sidebar-group-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--sidebar-text);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  cursor: pointer;
}

.sidebar-group-button-active,
.sidebar-group-button:hover,
.sidebar-group-button:focus-visible {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(var(--premium-rgb), 0.18);
}

.sidebar-submenu-panel {
  gap: 12px;
  min-height: 0;
  align-content: start;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.sidebar-submenu-header {
  display: grid;
  gap: 8px;
}

.sidebar-submenu-header strong {
  color: var(--sidebar-text);
  font-family: "Space Grotesk", sans-serif;
}

.sidebar-submenu-items {
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.nav-link {
  padding: 14px 16px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--sidebar-text);
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.nav-link:hover,
.nav-link:focus-visible {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(var(--premium-rgb), 0.16);
}

.sidebar-submenu-link {
  width: 100%;
  text-align: left;
}

.nav-link.active {
  background: var(--button-background);
  color: var(--button-text);
  border-color: rgba(var(--premium-rgb), 0.26);
  box-shadow: 0 16px 28px rgba(var(--accent-rgb), 0.24);
}

.sidebar-submenu-link-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sidebar-footer {
  display: grid;
  gap: 10px;
  min-height: 0;
  margin-top: auto;
  align-content: end;
}

.sidebar-profile-button {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--sidebar-text);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.sidebar-profile-button:hover,
.sidebar-profile-button:focus-visible {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(var(--premium-rgb), 0.18);
  box-shadow: 0 16px 24px rgba(var(--overlay-rgb), 0.2);
}

.sidebar-settings-button {
  justify-content: center;
}

.sidebar-inline-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(var(--premium-rgb), 0.18);
  color: var(--sidebar-text);
  font-size: 0.88rem;
  line-height: 1.45;
}

.app-main {
  flex: 1;
  padding: 24px;
  background: linear-gradient(180deg, rgba(var(--overlay-rgb), 0.06), rgba(var(--overlay-rgb), 0.02));
}

.page-grid {
  display: grid;
  gap: 20px;
}

.hero,
.panel,
.auth-card,
.auth-hero,
.help-hero,
.help-sidebar-card,
.onboarding-panel {
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  background: var(--surface);
  backdrop-filter: blur(14px);
  color: var(--text-on-card);
}

.hero,
.panel,
.auth-card,
.auth-hero,
.help-hero,
.help-sidebar-card,
.onboarding-panel {
  border-radius: var(--radius-lg);
  padding: 24px;
}

.panel,
.preset-card,
.premium-card,
.metric-card,
.weekly-plan-block,
.goal-card,
.theme-swatch {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.preset-card:hover,
.premium-card:hover,
.goal-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--soft-shadow);
}

.hero-content {
  gap: 24px;
}

.hero-copy,
.hero-card {
  flex: 1;
}

.hero-copy h2,
.auth-hero h1 {
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 0.98;
  max-width: 11ch;
}

.hero-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: var(--card-glow);
  color: var(--text-on-card);
}

.focus-card,
.focus-actions,
.focus-action,
.coaching-strip,
.momentum-pills,
.help-blocks,
.faq-groups,
.faq-list,
.help-toc,
.help-hero-actions,
.auth-card-header {
  display: grid;
  gap: 14px;
}

.coaching-strip {
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.75fr);
  align-items: stretch;
}

.focus-card {
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.9fr);
  align-items: stretch;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  box-shadow: var(--shadow);
  background: var(--focus-glow);
  color: var(--text-on-card);
}

.focus-card h3,
.focus-card strong {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.focus-copy {
  display: grid;
  gap: 10px;
}

.focus-badge {
  width: fit-content;
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--text-on-card);
}

.focus-reason {
  margin: 0;
  max-width: 58ch;
  color: var(--muted);
  font-size: 1rem;
}

.focus-why {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(var(--ink-rgb), 0.05);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
}

.focus-why p {
  margin: 0;
  color: var(--text);
  font-weight: 600;
  line-height: 1.45;
}

.focus-actions-wrap {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(var(--card-rgb), 0.72);
  border: 1px solid rgba(var(--ink-rgb), 0.08);
}

.focus-action {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.9);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.focus-step {
  display: inline-block;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
}

.focus-training {
  background: var(--warning-glow);
}

.focus-nutrition {
  background: var(--success-glow);
}

.focus-hydration {
  background: var(--cool-glow);
}

.focus-recovery {
  background: var(--card-glow);
}

.focus-consistency {
  background: var(--callout-glow);
}

.momentum-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  box-shadow: var(--shadow);
  background: var(--card-glow);
  color: var(--text-on-card);
}

.momentum-card h3,
.momentum-pill strong {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.momentum-badge {
  width: fit-content;
  background: rgba(var(--chart-rgb), 0.12);
  color: var(--text-on-card);
}

.momentum-pills {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 8px;
}

.momentum-pill {
  padding: 16px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.86);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.momentum-positive {
  background: var(--success-glow);
}

.momentum-warning {
  background: var(--warning-glow);
}

.momentum-neutral {
  background: var(--cool-glow);
}

.eyebrow,
.section-label,
.badge {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--accent-contrast);
  background: rgba(var(--accent-rgb), 0.18);
  border: 1px solid rgba(var(--accent-rgb), 0.22);
}

.tier-pill {
  display: inline-block;
  margin: 8px 0 0;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  background: rgba(var(--premium-rgb), 0.2);
  color: var(--sidebar-text);
  border: 1px solid rgba(var(--premium-rgb), 0.24);
}

.sidebar-plan-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(var(--premium-rgb), 0.18);
  color: var(--sidebar-text);
  font-size: 0.84rem;
  line-height: 1.45;
}

.muted,
.hero-text,
.coach-notes p {
  color: var(--muted);
}

.sidebar .muted,
.sidebar .section-label,
.sidebar .eyebrow,
.hero-stats,
.insight-list {
  gap: 12px;
  flex-wrap: wrap;
}

.stat-pill,
.insight-chip,
.coach-card {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: rgba(var(--card-rgb), 0.82);
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  color: var(--text-on-card);
}

.stat-pill strong,
.habit-status strong {
  display: block;
  font-size: 1.15rem;
  font-family: "Space Grotesk", sans-serif;
}

.metrics-grid,
.content-grid {
  gap: 20px;
}

.metrics-grid {
  flex-wrap: wrap;
}

.metrics-grid > * {
  flex: 1 1 220px;
}

.content-grid > * {
  flex: 1 1 380px;
}

.panel-heading {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-card {
  position: relative;
  overflow: hidden;
}

.metric-card::after {
  content: "";
  position: absolute;
  inset: auto -24px -24px auto;
  width: 96px;
  height: 96px;
  border-radius: 999px;
  opacity: 0.14;
}

.accent-orange::after {
  background: var(--orange);
}

.accent-green::after {
  background: var(--green);
}

.accent-blue::after {
  background: var(--blue);
}

.accent-rose::after {
  background: var(--rose);
}

.form-grid,
.stack-form,
.auth-card form,
.coach-list,
.coach-notes {
  display: grid;
  gap: 14px;
}

.section-stack,
.profile-grid,
.goal-card-grid,
.chip-toggle-grid,
.theme-picker,
.theme-picker-grid,
.module-note {
  display: grid;
  gap: 14px;
}

.form-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.profile-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid.compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 13px 14px;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(var(--ink-rgb), 0.14);
  background: rgba(var(--card-rgb), 0.9);
  color: var(--text-on-card);
  appearance: none;
}

input:focus,
select:focus {
  outline: 3px solid rgba(var(--accent-rgb), 0.2);
  border-color: rgba(var(--accent-rgb), 0.52);
}

.primary-button,
.secondary-button,
.ghost-button,
.icon-button,
.auth-toggle button,
.habit-card,
.module-link {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 150ms ease, background 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
  border: 1px solid transparent;
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover,
.icon-button:hover,
.auth-toggle button:hover,
.habit-card:hover,
.module-link:hover {
  transform: translateY(-1px);
}

.primary-button {
  padding: 14px 18px;
  background: var(--button-background);
  color: var(--button-text);
  font-weight: 700;
  box-shadow: 0 16px 28px rgba(var(--accent-rgb), 0.2);
}

.primary-button:hover {
  background: var(--button-hover);
}

.secondary-button,
.ghost-button,
.module-link {
  padding: 12px 16px;
  font-weight: 700;
}

.secondary-button,
.module-link {
  background: color-mix(in srgb, var(--secondary-button-background) 74%, var(--secondary-card-background));
  color: var(--secondary-button-text);
  border-color: rgba(var(--ink-rgb), 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.secondary-button:hover,
.module-link:hover,
.secondary-button:focus-visible,
.module-link:focus-visible {
  background: color-mix(in srgb, var(--secondary-button-background-hover) 76%, var(--secondary-card-background));
}

.module-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ghost-button,
.icon-button,
.auth-toggle button {
  background: var(--ghost-button-background);
  color: var(--ghost-button-text);
  border-color: rgba(var(--ink-rgb), 0.1);
}

.ghost-button:hover,
.icon-button:hover,
.auth-toggle button:hover,
.ghost-button:focus-visible,
.icon-button:focus-visible,
.auth-toggle button:focus-visible {
  background: var(--ghost-button-background-hover);
}

.goal-card-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.goal-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(var(--card-rgb), 0.72);
  text-align: left;
  cursor: pointer;
  color: var(--text-on-card);
}

.goal-card strong,
.section-chip {
  font-family: "Space Grotesk", sans-serif;
}

.goal-card span {
  color: var(--muted);
  line-height: 1.45;
}

.goal-card-active {
  border-color: rgba(var(--accent-rgb), 0.42);
  background: var(--callout-glow);
  box-shadow: 0 16px 34px rgba(var(--accent-rgb), 0.14);
}

.chip-toggle-grid {
  grid-template-columns: repeat(auto-fit, minmax(120px, max-content));
}

.chip-toggle {
  position: relative;
  display: inline-flex;
}

.chip-toggle input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.chip-toggle span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 1px solid rgba(var(--ink-rgb), 0.1);
  background: rgba(var(--card-rgb), 0.8);
  font-weight: 700;
  color: var(--text-on-card);
}

.chip-toggle input:checked + span {
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.16), rgba(var(--chart-rgb), 0.12));
  border-color: rgba(var(--accent-rgb), 0.38);
}

.card-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 12px;
}

.list-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--surface-strong);
  border: 1px solid var(--line);
  color: var(--text-on-card);
}

.item-title {
  display: block;
  margin-bottom: 4px;
}

.progress-ring {
  position: relative;
  width: 220px;
  height: 220px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track,
.ring-value {
  fill: none;
  stroke-width: 10;
}

.ring-track {
  stroke: rgba(var(--ink-rgb), 0.12);
}

.ring-value {
  stroke: var(--orange);
  stroke-dasharray: 302;
  stroke-linecap: round;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
}

.ring-center strong {
  display: block;
  font-size: 2rem;
  font-family: "Space Grotesk", sans-serif;
}

.weekly-bars {
  align-items: end;
  gap: 12px;
  min-height: 180px;
}

.bar-group {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.bar {
  border-radius: 18px 18px 8px 8px;
  background: linear-gradient(180deg, var(--chart-accent), rgb(var(--success-rgb)));
  min-height: 24px;
}

.bar-label,
.bar-value {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.83rem;
}

.line-chart {
  overflow-x: auto;
}

.line-chart svg {
  width: 100%;
  min-width: 420px;
}

.line-chart-path,
.line-chart-grid {
  fill: none;
  stroke-linecap: round;
}

.line-chart-path {
  stroke: var(--chart-accent);
  stroke-width: 4;
}

.line-chart-grid {
  stroke: rgba(var(--ink-rgb), 0.16);
  stroke-width: 2;
}

.line-chart-point {
  fill: var(--ring-accent);
}

.line-chart-label,
.line-chart-value {
  fill: var(--muted);
  font-size: 11px;
  text-anchor: middle;
}

.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.habit-card {
  padding: 18px;
  border-radius: 20px;
  text-align: left;
  background: rgba(var(--card-rgb), 0.84);
  border: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-on-card);
}

.habit-done {
  background: linear-gradient(135deg, rgba(var(--success-rgb), 0.18), rgba(var(--card-rgb), 0.92));
}

.habit-status {
  text-align: right;
}

.auth-shell {
  min-height: 100vh;
  padding: 24px;
  gap: 20px;
  align-items: stretch;
}

.onboarding-shell {
  width: min(980px, 100%);
  min-height: auto;
  margin: 0 auto;
  padding: 8px 0 24px;
  gap: 18px;
  flex-direction: column;
  align-items: stretch;
  background:
    radial-gradient(circle at top, rgba(var(--premium-rgb), 0.12), transparent 28%),
    linear-gradient(180deg, rgba(var(--card-rgb), 0.06), transparent 55%);
}

.onboarding-hero,
.onboarding-card {
  max-width: none;
  margin: 0 auto;
  width: 100%;
}

.onboarding-hero {
  display: grid;
  gap: 20px;
  padding: 28px;
  background:
    radial-gradient(circle at top right, rgba(var(--premium-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, rgba(var(--card-rgb), 0.98), rgba(var(--card-alt-rgb), 0.92));
}

.onboarding-hero h1,
.onboarding-step h2 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.onboarding-progress {
  display: grid;
  gap: 10px;
}

.onboarding-progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  overflow: hidden;
}

.onboarding-progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--accent-color), var(--chart-accent));
}

.onboarding-card,
.onboarding-step {
  display: grid;
  gap: 18px;
}

.onboarding-card {
  padding: 28px;
  background: rgba(var(--card-rgb), 0.96);
}

.onboarding-hero-grid,
.movement-guide-intro {
  display: grid;
  gap: 14px;
}

.onboarding-summary,
.onboarding-highlights {
  gap: 14px;
  flex-wrap: wrap;
}

.onboarding-summary > *,
.onboarding-highlights > * {
  flex: 1 1 220px;
}

.onboarding-hero-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.onboarding-hero-card {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(var(--premium-rgb), 0.1), rgba(var(--chart-rgb), 0.06)),
    rgba(var(--card-rgb), 0.94);
  border: 1px solid rgba(var(--premium-rgb), 0.16);
  color: var(--text-on-card);
}

.onboarding-actions {
  justify-content: space-between;
  gap: 12px;
}

.onboarding-review-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.onboarding-edit-button {
  min-width: 88px;
}

.dashboard-flow-strip,
.module-control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-flow-strip {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background:
    radial-gradient(circle at top right, rgba(var(--chart-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, rgba(var(--card-rgb), 0.96), rgba(var(--card-alt-rgb), 0.9));
  color: var(--text-on-card);
}

.dashboard-flow-strip h3 {
  margin: 4px 0 0;
  font-family: "Space Grotesk", sans-serif;
}

.dashboard-flow-links,
.module-control-list,
.module-control-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dashboard-flow-links {
  justify-content: flex-end;
}

.dashboard-flow-link {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(var(--ink-rgb), 0.1);
  background: rgba(var(--card-rgb), 0.78);
  color: var(--text-on-card);
  text-decoration: none;
  font-weight: 700;
}

.module-control-list {
  flex-direction: column;
}

.module-control-row {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.84);
}

.module-control-row p {
  margin: 4px 0 0;
}

.chip-card {
  min-height: auto;
  align-items: center;
  justify-content: center;
}

.auth-shell > * {
  flex: 1;
}

.auth-card {
  max-width: 460px;
  margin-left: auto;
}

.auth-card-header {
  margin-bottom: 18px;
}

.auth-card-header h3 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.auth-toggle {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.auth-toggle .toggle-active,
.environment-toggle .toggle-active {
  background: var(--surface-dark);
  color: var(--accent-contrast);
}

.environment-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.environment-toggle button {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  background: rgba(var(--ink-rgb), 0.08);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
}

.preset-grid,
.premium-lockup {
  display: grid;
  gap: 14px;
}

.preset-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.preset-card,
.premium-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(var(--card-rgb), 0.86);
  color: var(--text-on-card);
}

.exercise-list,
.plan-list {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
}

.exercise-list li,
.plan-list li {
  margin-bottom: 6px;
}

.filter-bar,
.filter-group,
.card-actions,
.premium-columns,
.detail-grid,
.modal-actions,
.weekly-plan-preview,
.preview-highlight-list,
.plan-locked-footer,
.weekly-plan-layout,
.plan-footer-actions,
.upgrade-prompt,
.upgrade-prompt-actions {
  display: grid;
  gap: 12px;
}

.filter-bar {
  margin-bottom: 16px;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  align-items: end;
}

.filter-bar label {
  min-width: 0;
}

.discovery-filter-bar {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.type-toggle {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.card-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.empty-state {
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(var(--ink-rgb), 0.18);
  background: rgba(var(--card-rgb), 0.58);
  margin-bottom: 16px;
  color: var(--text-on-card);
}

.status-banner {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--success-rgb), 0.16);
  border: 1px solid rgba(var(--success-rgb), 0.24);
  color: var(--text-on-card);
  font-weight: 700;
}

.module-note {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.76);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.module-note p {
  margin: 0;
  color: color-mix(in srgb, var(--primary-text) 88%, var(--secondary-text));
}

.module-card-locked {
  cursor: default;
  opacity: 0.92;
  background:
    linear-gradient(135deg, rgba(var(--chart-rgb), 0.06), rgba(var(--accent-rgb), 0.08)),
    rgba(var(--card-rgb), 0.86);
  border-color: rgba(var(--accent-rgb), 0.14);
}

.module-card-locked .module-card-actions {
  opacity: 0.96;
}

.premium-locked {
  background:
    linear-gradient(135deg, rgba(var(--chart-rgb), 0.08), rgba(var(--accent-rgb), 0.08)),
    rgba(var(--card-rgb), 0.86);
}

.premium-unlocked {
  background:
    linear-gradient(135deg, rgba(var(--success-rgb), 0.1), rgba(var(--premium-rgb), 0.08)),
    rgba(var(--card-rgb), 0.9);
}

.premium-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.weekly-plan-preview {
  padding: 16px;
  border-radius: 20px;
  background: rgba(var(--card-rgb), 0.76);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
}

.accent-callout {
  background: var(--success-glow);
}

.preview-highlight-list {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.plan-preview-callout,
.preview-highlight {
  padding: 16px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.92);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.plan-preview-callout strong,
.preview-highlight strong {
  display: block;
  font-family: "Space Grotesk", sans-serif;
}

.plan-locked-footer {
  align-items: start;
}

.plan-footer-actions {
  grid-template-columns: repeat(2, minmax(0, max-content));
}

.weekly-plan-modal {
  display: grid;
  gap: 18px;
}

.weekly-plan-modal .panel-heading,
.movement-detail-modal .panel-heading {
  align-items: start;
}

.limited-preview-banner,
.plan-preview-upgrade,
.weekly-plan-block {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.9);
  color: var(--text-on-card);
}

.limited-preview-banner,
.plan-preview-upgrade {
  display: grid;
  gap: 8px;
}

.limited-preview-banner {
  background:
    linear-gradient(135deg, rgba(var(--chart-rgb), 0.08), rgba(var(--accent-rgb), 0.08)),
    rgba(var(--card-rgb), 0.92);
}

.weekly-plan-layout {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.weekly-plan-block {
  display: grid;
  gap: 10px;
  align-content: start;
}

.weekly-plan-block strong,
.plan-preview-upgrade strong,
.limited-preview-banner strong {
  font-family: "Space Grotesk", sans-serif;
}

.section-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.weekly-plan-block p,
.plan-preview-upgrade p,
.limited-preview-banner p {
  margin: 0;
}

.plan-preview-upgrade {
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
}

.upgrade-prompt {
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background:
    linear-gradient(135deg, rgba(var(--premium-rgb), 0.12), rgba(var(--chart-rgb), 0.08)),
    rgba(var(--card-rgb), 0.92);
  color: var(--text-on-card);
  box-shadow: var(--soft-shadow);
}

.upgrade-prompt h4 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.upgrade-prompt p {
  margin: 0;
}

.upgrade-prompt-copy {
  display: grid;
  gap: 10px;
}

.upgrade-pricing-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.upgrade-tier-summary {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.upgrade-tier-card {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.82);
  color: var(--text-on-card);
}

.upgrade-tier-card strong {
  font-family: "Space Grotesk", sans-serif;
}

.upgrade-pricing-card {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  text-align: left;
  border-radius: 16px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.84);
  color: var(--text-on-card);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.upgrade-pricing-card strong {
  font-family: "Space Grotesk", sans-serif;
}

.upgrade-pricing-card-active,
.upgrade-pricing-card:hover,
.upgrade-pricing-card:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(var(--accent-rgb), 0.24);
  box-shadow: var(--soft-shadow);
  background: var(--focus-glow);
}

.upgrade-prompt-actions {
  grid-template-columns: repeat(3, max-content);
  align-items: center;
}

.upgrade-prompt-compact {
  padding: 16px 18px;
  border-radius: 18px;
  box-shadow: none;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(var(--overlay-rgb), 0.6);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 1000;
}

.modal-card {
  width: min(760px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border-radius: 24px;
  background: var(--card-glow);
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
  color: var(--text-on-card);
}

.detail-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
}

.workout-start-callout,
.workout-session-step {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.9);
  color: var(--text-on-card);
}

.workout-start-callout {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--focus-glow);
  box-shadow: 0 18px 30px rgba(var(--overlay-rgb), 0.08);
}

.workout-start-callout p {
  margin: 0;
}

.workout-progress-bar,
.workout-current-step,
.workout-complete-card,
.exercise-phase-group,
.exercise-phase-header,
.exercise-step-header,
.workout-current-step-copy,
.workout-current-step-meta {
  display: grid;
  gap: 10px;
}

.workout-progress-bar,
.workout-current-step,
.workout-complete-card,
.exercise-phase-group {
  margin-bottom: 16px;
}

.workout-progress-bar,
.workout-current-step,
.workout-complete-card {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.9);
  color: var(--text-on-card);
  transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.workout-progress-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.workout-progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  overflow: hidden;
}

.workout-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--button-background);
  transition: width 220ms ease;
}

.workout-transition-note {
  margin: 0;
  color: var(--text-on-card);
  font-size: 0.9rem;
  font-weight: 700;
}

.workout-current-step {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  background: var(--cool-glow);
  border-color: rgba(var(--accent-rgb), 0.2);
  box-shadow: 0 24px 38px rgba(var(--overlay-rgb), 0.16);
  transform: translateY(-1px);
}

.workout-current-step-visual {
  grid-template-columns: minmax(0, 1.25fr) minmax(220px, 0.9fr);
}

.workout-current-step-meta {
  text-align: right;
  color: var(--text-on-card);
  font-weight: 700;
  align-content: start;
}

.workout-current-step-visual-panel {
  display: grid;
  gap: 12px;
  align-content: start;
}

.workout-current-step-note {
  display: grid;
  gap: 6px;
  padding-top: 2px;
}

.workout-current-step-note p {
  margin: 0;
}

.workout-next-chip {
  display: inline-flex;
  justify-self: end;
  width: fit-content;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--text-on-card);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.workout-complete-card {
  background: var(--success-glow);
  border-color: rgba(var(--success-rgb), 0.26);
  box-shadow: var(--soft-shadow);
}

.workout-session-flow {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 16px;
}

.workout-session-step {
  display: grid;
  gap: 8px;
}

.workout-session-step p,
.exercise-swap-note {
  margin: 0;
}

.exercise-phase-header {
  margin-bottom: 10px;
}

.equipment-wrap,
.exercise-detail-list {
  margin-top: 16px;
}

.exercise-detail-list {
  display: grid;
  gap: 10px;
}

.exercise-detail-card {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--card-rgb), 0.84);
  border: 1px solid var(--line);
  color: var(--text-on-card);
  transition: opacity 180ms ease, transform 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.exercise-detail-card-active {
  border-color: rgba(var(--accent-rgb), 0.34);
  box-shadow: 0 24px 38px rgba(var(--overlay-rgb), 0.15);
  background: var(--focus-glow);
  transform: translateY(-2px);
}

.exercise-detail-card-complete {
  border-color: rgba(var(--success-rgb), 0.18);
  background: rgba(var(--card-rgb), 0.74);
  opacity: 0.58;
}

.exercise-detail-card-upcoming {
  background: rgba(var(--card-rgb), 0.66);
  opacity: 0.88;
}

.exercise-detail-card-upcoming .movement-reference,
.exercise-detail-card-upcoming .exercise-prescription,
.exercise-detail-card-upcoming .exercise-swap-picker,
.exercise-detail-card-upcoming .exercise-swap-note {
  display: none;
}

.exercise-detail-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.exercise-pattern {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.exercise-step-header {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.exercise-step-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.exercise-purpose-line {
  margin: 0;
  color: color-mix(in srgb, var(--text-on-card) 86%, var(--secondary-text));
  line-height: 1.45;
}

.exercise-step-state {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.exercise-detail-card-active .exercise-step-state {
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--text-on-card);
}

.exercise-detail-card-complete .exercise-step-state {
  background: rgba(var(--success-rgb), 0.12);
  color: color-mix(in srgb, var(--text-on-card) 74%, var(--secondary-text));
}

.exercise-prescription {
  margin: 0;
  color: var(--text-on-card);
  font-weight: 700;
}

.exercise-signal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exercise-signal-pill,
.movement-credibility-pill,
.library-depth-note {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 16%, var(--border-color));
  background: color-mix(in srgb, var(--secondary-card-background) 88%, transparent);
  color: color-mix(in srgb, var(--text-on-card) 88%, var(--secondary-text));
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
}

.exercise-visual-thumb,
.library-card-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent-color) 14%, var(--border-color));
  background: color-mix(in srgb, var(--secondary-card-background) 94%, transparent);
}

.exercise-visual-thumb {
  max-width: 88px;
}

.exercise-visual-thumb-large {
  max-width: none;
  min-height: 180px;
}

.exercise-visual-thumb-image,
.library-card-thumb {
  object-fit: cover;
}

.exercise-visual-thumb-image,
.library-card-thumb,
.movement-sequence-image {
  width: 100%;
  height: 100%;
  display: block;
}

.exercise-visual-thumb-placeholder,
.library-card-thumb-placeholder,
.movement-media-placeholder {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: grid;
  place-content: center;
  gap: 6px;
  padding: 12px;
  text-align: center;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--premium-highlight) 18%, transparent), transparent 38%),
    linear-gradient(145deg, color-mix(in srgb, var(--secondary-card-background) 96%, transparent), color-mix(in srgb, var(--card-background) 92%, transparent));
  color: var(--text-on-card);
}

.exercise-visual-thumb-placeholder span,
.library-card-thumb-placeholder span,
.movement-media-placeholder-mark {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
}

.exercise-visual-thumb-placeholder small,
.library-card-thumb-placeholder small {
  color: color-mix(in srgb, var(--text-on-card) 78%, var(--secondary-text));
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.workout-nav-button {
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease, background 160ms ease, border-color 160ms ease;
}

.workout-nav-button:hover:not(:disabled),
.workout-nav-button:focus-visible:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--soft-shadow);
}

.exercise-swap-picker {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  color: var(--text-on-card);
  font-size: 0.88rem;
  font-weight: 700;
}

.exercise-swap-picker select {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(var(--ink-rgb), 0.1);
  background: rgba(var(--card-rgb), 0.94);
  color: var(--text-on-card);
}

.movement-link-list,
.movement-chip-list,
.movement-hero,
.movement-meta-grid,
.movement-detail-grid,
.movement-detail-block,
.movement-numbered-list,
.movement-reference,
.movement-reference-copy {
  display: grid;
  gap: 12px;
}

.movement-chip-list {
  grid-template-columns: repeat(auto-fit, minmax(160px, max-content));
}

.movement-detail-modal {
  width: min(860px, 100%);
}

.movement-hero {
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.85fr);
  align-items: stretch;
}

.movement-image-frame,
.movement-image-fallback,
.movement-detail-block {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.9);
  color: var(--text-on-card);
}

.movement-image-frame {
  min-height: 220px;
  background:
    radial-gradient(circle at top right, rgba(var(--premium-rgb), 0.18), transparent 30%),
    radial-gradient(circle at top left, rgba(var(--chart-rgb), 0.18), transparent 34%),
    linear-gradient(180deg, rgba(var(--card-rgb), 0.98), rgba(var(--card-alt-rgb), 0.92));
  overflow: hidden;
  position: relative;
}

.movement-image-panel {
  align-content: start;
  gap: 14px;
}

.movement-image-header {
  display: grid;
  gap: 6px;
}

.movement-image-frame-live {
  padding: 16px;
}

.movement-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  padding: 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
}

.movement-image-fallback {
  min-height: 120px;
  display: grid;
  align-content: center;
  gap: 10px;
  background: transparent;
  border: 0;
  padding: 8px 0 0;
}

.movement-image-fallback strong,
.movement-detail-block strong,
.movement-numbered-list li::marker {
  font-family: "Space Grotesk", sans-serif;
}

.movement-image-fallback p,
.movement-detail-block p {
  margin: 0;
}

.movement-image-badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.08);
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.movement-meta-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.movement-detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 4px;
}

.movement-detail-block {
  align-content: start;
}

.movement-numbered-list {
  margin: 0;
  padding-left: 22px;
}

.movement-numbered-list li {
  color: var(--muted);
  line-height: 1.55;
}

.movement-reference {
  grid-template-columns: 50px minmax(0, 1fr);
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: rgba(var(--card-rgb), 0.86);
  color: var(--text-on-card);
}

.movement-reference-compact {
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 10px;
  border-radius: 16px;
}

.movement-reference-clickable {
  cursor: pointer;
}

.movement-reference-clickable:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--accent-rgb), 0.2);
  box-shadow: var(--soft-shadow);
}

.movement-reference-media {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(var(--premium-rgb), 0.18), transparent 32%),
    linear-gradient(135deg, rgba(var(--card-alt-rgb), 0.92), rgba(var(--card-rgb), 0.94));
}

.movement-reference-compact .movement-reference-media {
  height: 36px;
}

.movement-reference-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  background: rgba(255, 255, 255, 0.72);
  display: block;
}

.movement-reference-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--accent-color);
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.movement-reference-copy {
  gap: 2px;
  min-width: 0;
}

.movement-reference-copy strong {
  font-family: "Space Grotesk", sans-serif;
  text-align: left;
}

.movement-reference-prefix {
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
}

.form-error {
  margin: 0;
  color: rgb(var(--danger-rgb));
  font-weight: 700;
}

.coach-list {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.coach-hero,
.coach-action-list,
.coach-action-card,
.coach-why-block,
.coach-deeper-reasoning,
.coach-note-list {
  display: grid;
  gap: 14px;
}

.coach-hero {
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  align-items: stretch;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(var(--ink-rgb), 0.08);
  background: var(--cool-glow);
  color: var(--text-on-card);
}

.coach-hero-copy,
.coach-action-card {
  display: grid;
  gap: 10px;
}

.coach-hero h3,
.coach-action-card strong {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.coach-detail {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}

.coach-why-block,
.coach-action-card,
.coach-deeper-reasoning {
  padding: 18px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.86);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.coach-why-block p,
.coach-note-list p,
.coach-deeper-reasoning p {
  margin: 0;
}

.coach-action-list {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.coach-note-list {
  gap: 10px;
}

.coach-note-list p {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--card-rgb), 0.78);
  border: 1px solid rgba(var(--ink-rgb), 0.06);
  color: var(--text-on-card);
}

.coach-hydration {
  background: var(--cool-glow);
}

.coach-nutrition {
  background: var(--success-glow);
}

.coach-recovery {
  background: var(--card-glow);
}

.coach-training,
.coach-momentum,
.coach-consistency {
  background: var(--warning-glow);
}

.screen-center {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  color: var(--muted);
}

.billing-panel {
  max-width: 720px;
  display: grid;
  gap: 18px;
}

.billing-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-picker-grid {
  grid-template-columns: 1fr;
}

.theme-swatch {
  padding: 14px 16px;
  border: 1px solid rgba(var(--premium-rgb), 0.12);
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.92);
  color: var(--text-on-card);
  text-align: left;
  cursor: pointer;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), var(--shadow);
}

.theme-swatch-active {
  border-color: rgba(var(--premium-rgb), 0.28);
  background:
    linear-gradient(135deg, rgba(var(--accent-rgb), 0.24), rgba(var(--chart-rgb), 0.18)),
    rgba(var(--card-rgb), 0.92);
  box-shadow: 0 16px 30px rgba(var(--overlay-rgb), 0.16);
}

.theme-swatch:hover,
.theme-swatch:focus-visible {
  background: rgba(var(--card-rgb), 0.98);
  border-color: rgba(var(--premium-rgb), 0.2);
}

.theme-swatch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.theme-swatch-row strong {
  display: block;
}

.theme-swatch-mood {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.45;
  opacity: 0.82;
}

.theme-chip-row {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.theme-chip {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.help-hero h2,
.help-section h4,
.faq-group h4,
.faq-item summary {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.help-layout {
  gap: 20px;
  align-items: flex-start;
}

.help-hero-actions {
  grid-template-columns: repeat(2, max-content);
  margin-top: 18px;
}

.help-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
}

.settings-layout {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(240px, 0.42fr) minmax(0, 1fr);
  align-items: start;
}

.settings-menu {
  display: grid;
  gap: 10px;
}

.settings-menu-button {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(var(--card-rgb), 0.86);
  color: var(--text-on-card);
  font-weight: 700;
  cursor: pointer;
}

.settings-menu-button-active,
.settings-menu-button:hover,
.settings-menu-button:focus-visible {
  background: var(--focus-glow);
  border-color: rgba(var(--premium-rgb), 0.22);
}

.settings-theme-grid {
  gap: 12px;
}

.settings-theme-swatch {
  color: var(--text-on-card);
}

.help-sidebar-card {
  display: grid;
  gap: 12px;
}

.billing-panel h3 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.help-toc a {
  text-decoration: none;
  color: var(--text);
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(var(--ink-rgb), 0.05);
  font-weight: 700;
}

.help-content {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 20px;
}

.help-section {
  display: grid;
  gap: 18px;
  scroll-margin-top: 24px;
}

.help-summary,
.help-block p,
.faq-item p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.help-block {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.78);
  border: 1px solid rgba(var(--ink-rgb), 0.06);
  color: var(--text-on-card);
}

.faq-group {
  display: grid;
  gap: 14px;
}

.faq-item {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(var(--card-rgb), 0.86);
  border: 1px solid rgba(var(--ink-rgb), 0.07);
  color: var(--text-on-card);
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item[open] summary {
  margin-bottom: 10px;
}

@media (max-width: 1080px) {
  .app-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 22px 18px;
    gap: 20px;
  }

  .sidebar-footer {
    gap: 12px;
  }

  .hero-content,
  .auth-shell,
  .help-layout,
  .onboarding-shell {
    flex-direction: column;
  }

  .auth-card {
    max-width: none;
    margin-left: 0;
  }

  .help-sidebar {
    width: 100%;
    position: static;
  }
}

@media (max-width: 780px) {
  .app-main,
  .auth-shell,
  .onboarding-shell {
    padding: 0 0 16px;
  }

  .hero,
  .panel,
  .auth-card,
  .auth-hero,
  .onboarding-panel {
    padding: 18px;
  }

  .page-grid {
    gap: 16px;
  }

  .sidebar {
    padding: 16px 14px;
    border-radius: 0 0 24px 24px;
  }

  .sidebar-nav-shell,
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .nav-link,
  .sidebar-group-button,
  .settings-menu-button {
    min-height: 48px;
  }

  .sidebar-footer {
    gap: 10px;
  }

  .form-grid,
  .profile-grid,
  .form-grid.compact {
    grid-template-columns: 1fr;
  }

  .environment-toggle,
  .type-toggle,
  .card-actions,
  .premium-columns,
  .detail-grid,
  .workout-session-flow,
  .coaching-strip,
  .focus-card,
  .coach-hero,
  .preview-highlight-list,
  .weekly-plan-layout,
  .plan-preview-upgrade,
  .plan-footer-actions,
  .upgrade-prompt,
  .upgrade-prompt-actions,
  .help-hero-actions,
  .movement-hero,
  .onboarding-hero-grid,
  .movement-meta-grid,
  .movement-detail-grid {
    grid-template-columns: 1fr;
  }

  .workout-current-step {
    grid-template-columns: 1fr;
  }

  .momentum-pills {
    grid-template-columns: 1fr;
  }

  .progress-ring {
    width: 180px;
    height: 180px;
  }

  .hero-copy h2,
  .auth-hero h1,
  .onboarding-step h2,
  .help-hero h2,
  .panel h3 {
    line-height: 1.1;
  }

  .hero-stats {
    gap: 10px;
  }

  .stat-pill,
  .insight-chip,
  .coach-card {
    width: 100%;
  }

  .premium-card,
  .weekly-plan-block,
  .plan-preview-callout,
  .preview-highlight,
  .movement-detail-block,
  .help-block,
  .faq-item {
    padding: 14px;
  }

  .weekly-plan-preview,
  .coach-hero,
  .movement-image-frame,
  .movement-image-fallback {
    border-radius: 18px;
  }

  .upgrade-prompt,
  .upgrade-prompt-compact {
    padding: 14px;
  }

  .modal-backdrop {
    padding: 10px;
    align-items: end;
  }

  .modal-card {
    width: 100%;
    max-height: 94vh;
    padding: 18px 16px;
    border-radius: 22px 22px 0 0;
  }

  .modal-card .panel-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .modal-card .icon-button {
    width: 100%;
    justify-content: center;
  }

  .detail-grid {
    gap: 10px;
  }

  .exercise-detail-card,
  .coach-action-card {
    padding: 14px;
    border-radius: 16px;
  }

  .exercise-detail-topline {
    align-items: flex-start;
    flex-direction: column;
  }

  .movement-reference {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 10px;
  }

  .movement-reference-compact {
    grid-template-columns: 38px minmax(0, 1fr);
    padding: 8px;
  }

  .movement-reference-copy strong {
    font-size: 0.95rem;
  }

  .list-card,
  .habit-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .onboarding-actions {
    flex-direction: column;
  }

  .onboarding-actions button,
  .billing-actions a,
  .plan-footer-actions button,
  .card-actions button,
  .help-hero-actions a {
    width: 100%;
    justify-content: center;
  }

  .dashboard-flow-strip,
  .module-control-row,
  .onboarding-review-card {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-flow-links,
  .module-control-actions {
    width: 100%;
  }

  .dashboard-flow-link,
  .module-control-actions button,
  .onboarding-edit-button {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .billing-actions,
  .help-hero-actions {
    width: 100%;
  }

  .coach-note-list p,
  .module-note p,
  .movement-image-fallback p {
    line-height: 1.5;
  }
}

.page-grid-tight {
  gap: 1.1rem;
}

.module-page-hero,
.today-hero {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.75fr);
  align-items: stretch;
  padding: 1.35rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--card-background) 88%, transparent),
      color-mix(in srgb, var(--secondary-card-background) 92%, transparent)
    ),
    var(--card-background);
  box-shadow: var(--shadow-soft);
}

.today-hero-copy,
.today-hero-score {
  display: grid;
  gap: 0.85rem;
}

.lead-copy,
.hero-support-copy,
.support-copy,
.section-context p,
.upgrade-copy {
  color: color-mix(in srgb, var(--primary-text) 88%, var(--secondary-text));
  line-height: 1.6;
}

.lead-copy {
  font-size: 1.02rem;
  max-width: 62ch;
}

.hero-mini-title {
  font-size: 1rem;
  letter-spacing: 0.01em;
}

.today-hero-score {
  align-content: space-between;
  justify-items: start;
  padding: 1rem;
  border-radius: 20px;
  background: color-mix(in srgb, var(--secondary-card-background) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
}

.hero-stats-compact {
  gap: 0.75rem;
}

.today-stack {
  display: grid;
  gap: 1rem;
}

.section-context {
  display: grid;
  gap: 0.35rem;
  padding: 0.95rem 1rem;
  margin-bottom: 1rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
  background: color-mix(in srgb, var(--secondary-card-background) 82%, transparent);
}

.section-context-label {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-color);
}

.today-sequence {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.today-sequence-card,
.module-card {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
  background: color-mix(in srgb, var(--secondary-card-background) 92%, transparent);
}

.module-card-clickable {
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.module-card-clickable:hover,
.module-card-clickable:focus-visible {
  transform: translateY(-1px);
  box-shadow: var(--soft-shadow);
}

.today-sequence-card strong,
.module-card strong,
.module-note strong,
.cap-banner strong,
.upgrade-prompt-copy h4 {
  color: var(--primary-text);
}

.module-card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.module-card h4 {
  margin: 0;
}

.module-card-actions,
.module-page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.module-link {
  text-decoration: none;
  cursor: pointer;
}

.cap-banner {
  display: grid;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
  background: color-mix(in srgb, var(--secondary-card-background) 90%, transparent);
}

.cap-banner .support-copy {
  max-width: 68ch;
}

.compact-cap-banner {
  margin-bottom: 1rem;
}

.cap-banner-locked {
  border-color: color-mix(in srgb, var(--premium-highlight) 55%, var(--border-color));
  background: color-mix(in srgb, var(--premium-highlight) 10%, var(--secondary-card-background));
}

.selector-row {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-bottom: 1rem;
}

.selector-pill {
  display: grid;
  gap: 0.3rem;
  padding: 1rem;
  text-align: left;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
  background: color-mix(in srgb, var(--secondary-card-background) 92%, transparent);
  color: var(--primary-text);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
  cursor: pointer;
}

.selector-pill span {
  color: color-mix(in srgb, var(--primary-text) 82%, var(--secondary-text));
  font-size: 0.92rem;
  line-height: 1.45;
}

.selector-pill:hover,
.selector-pill-active {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent-color) 55%, var(--border-color));
  box-shadow: 0 18px 32px rgba(12, 18, 36, 0.14);
  background: color-mix(in srgb, var(--accent-color) 12%, var(--secondary-card-background));
}

.compact-section-context {
  margin-bottom: 0.75rem;
}

.library-category-groups,
.library-category-group {
  display: grid;
  gap: 1rem;
}

.mobility-guided-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.nutrition-action-list li {
  font-weight: 600;
}

.nutrition-template-grid {
  align-items: stretch;
}

.nutrition-template-card {
  gap: 0.45rem;
}

.nutrition-template-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 14%, var(--border-color));
  margin-bottom: 0.15rem;
}

.nutrition-template-card .section-label {
  margin-bottom: 0;
}

.nutrition-premium-note {
  margin-top: 1rem;
}

.compact-plan-list {
  margin-top: 0;
}

.workout-lock-banner {
  margin-top: 1rem;
}

.movement-detail-modal .movement-hero {
  align-items: start;
}

.movement-detail-modal .movement-image-frame {
  max-width: 320px;
  justify-self: end;
  padding: 0.9rem;
  background: color-mix(in srgb, var(--secondary-card-background) 96%, transparent);
}

.movement-detail-modal .movement-image {
  object-fit: contain;
  max-height: 220px;
}

.movement-detail-modal .movement-image-header {
  margin-bottom: 0.55rem;
}

.movement-detail-modal .movement-image-fallback {
  min-height: 180px;
  display: grid;
  place-content: center;
  text-align: left;
}

.movement-visual-stack,
.movement-credibility-strip,
.movement-sequence-labels,
.movement-video-actions,
.library-card-hero,
.library-card-hero-copy {
  display: grid;
  gap: 0.75rem;
}

.movement-video-actions .secondary-button {
  width: 100%;
  justify-content: center;
}

.movement-credibility-strip {
  grid-template-columns: repeat(auto-fit, minmax(140px, max-content));
}

.movement-media-placeholder-hero {
  min-height: 220px;
}

.movement-sequence-step {
  padding: 0.8rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 14%, var(--border-color));
  background: color-mix(in srgb, var(--secondary-card-background) 92%, transparent);
}

.movement-sequence-placeholder {
  min-height: 130px;
  border-radius: 14px;
}

.library-card-hero {
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: start;
  margin-bottom: 0.35rem;
}

.library-card-hero-copy {
  align-content: start;
}

.library-card-thumb {
  max-width: 88px;
  height: 88px;
}

.upgrade-prompt {
  border: 1px solid color-mix(in srgb, var(--accent-color) 18%, var(--border-color));
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 9%, var(--card-background)),
      color-mix(in srgb, var(--secondary-card-background) 95%, transparent)
    );
}

.upgrade-prompt .plan-list li,
.cap-banner p,
.module-note .support-copy,
.movement-detail-block .support-copy {
  color: color-mix(in srgb, var(--primary-text) 88%, var(--secondary-text));
}

.workout-equipment-grid {
  margin-top: 1rem;
}

.workout-session-modal .icon-button {
  min-width: 2.4rem;
}

.exercise-detail-card-clickable {
  cursor: pointer;
}

.exercise-check-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.65rem;
}

.exercise-check-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.exercise-check-toggle span {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--accent-color) 48%, var(--border-color));
  background: color-mix(in srgb, var(--card-background) 82%, transparent);
  display: inline-block;
}

.exercise-check-toggle input:checked + span {
  background: var(--accent-color);
  box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--card-background) 92%, white);
}

.workout-load-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.workout-load-grid input,
.exercise-notes-field textarea {
  width: 100%;
}

.exercise-notes-field {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.85rem;
}

.workout-support-block {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 16%, var(--border-color));
  background: color-mix(in srgb, var(--secondary-card-background) 94%, transparent);
  display: grid;
  gap: 0.55rem;
}

.loaded-workout-shell,
.loaded-workout-exercises {
  display: grid;
  gap: 1rem;
}

.loaded-workout-shell {
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.75fr);
  align-items: start;
}

.loaded-workout-exercises-card {
  grid-column: 1 / -1;
}

.loaded-workout-cta {
  margin: 0 0 0.35rem;
  font-weight: 700;
  color: var(--primary-text);
}

.loaded-workout-exercise {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) auto;
  gap: 0.9rem;
  align-items: center;
  padding: 0.95rem;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--accent-color) 14%, var(--border-color));
  background: color-mix(in srgb, var(--secondary-card-background) 94%, transparent);
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.loaded-workout-exercise:hover,
.loaded-workout-exercise:focus-visible {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent-color) 46%, var(--border-color));
  box-shadow: var(--soft-shadow);
}

.loaded-workout-exercise-copy {
  display: grid;
  gap: 0.35rem;
}

.loaded-workout-exercise .library-card-thumb,
.loaded-workout-exercise .library-card-thumb-placeholder {
  max-width: 88px;
  height: 88px;
}

.movement-sequence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.movement-sequence-step {
  display: grid;
  gap: 0.45rem;
}

.movement-sequence-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  border-radius: 14px;
  background: color-mix(in srgb, var(--secondary-card-background) 94%, transparent);
  padding: 0.55rem;
}

.movement-sequence-fallback {
  min-height: 100px;
}

@media (max-width: 980px) {
  .module-page-hero,
  .today-hero {
    grid-template-columns: 1fr;
  }

  .loaded-workout-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .page-grid-tight {
    gap: 0.9rem;
  }

  .today-hero,
  .module-page-hero {
    padding: 1rem;
    border-radius: 20px;
  }

  .today-sequence,
  .module-card-grid,
  .selector-row,
  .upgrade-pricing-grid {
    grid-template-columns: 1fr;
  }

  .upgrade-tier-summary {
    grid-template-columns: 1fr;
  }

  .module-card-actions,
  .module-page-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .movement-detail-modal .movement-image-frame {
    max-width: none;
    justify-self: stretch;
  }

  .loaded-workout-exercise {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .loaded-workout-exercise .ghost-button {
    grid-column: 1 / -1;
  }
}

```

## FILE: src/api/client.js

`$ext
const API_ROOT = "/api";

export async function apiRequest(path, options = {}, token) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

```

## FILE: src/components/AppShell.jsx

`$ext
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { FALLBACK_THEME, applyThemePreference } from "../config/themes";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessTier, isPremium, dashboard } = useAuth();
  const hiddenModules = dashboard?.profile?.hiddenModules || [];

  const navGroups = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        items: [{ type: "link", to: "/", label: "Dashboard", end: true }]
      },
      {
        id: "training",
        label: "Training",
        items: [
          { type: "link", to: "/workouts", label: "Workouts" },
          { type: "link", to: "/plan", label: "Plan" },
          !hiddenModules.includes("mobility") ? { type: "link", to: "/mobility", label: "Mobility" } : null,
          !hiddenModules.includes("nutrition") ? { type: "link", to: "/nutrition", label: "Nutrition" } : null
        ].filter(Boolean)
      },
      {
        id: "insights",
        label: "Insights",
        items: [
          !hiddenModules.includes("progress") ? { type: "link", to: "/progress", label: "Progress" } : null,
          !hiddenModules.includes("coach") ? { type: "link", to: "/coach", label: "Coach" } : null
        ].filter(Boolean)
      }
    ],
    [hiddenModules]
  );
  const settingsGroup = useMemo(
    () => ({
      id: "settings",
      label: "Settings",
      items: [
        { type: "link", to: "/preferences?section=account", label: "Account", match: isSettingsSectionActive(location, "account") },
        { type: "link", to: "/preferences?section=preferences", label: "Preferences", match: isSettingsSectionActive(location, "preferences") },
        { type: "link", to: "/preferences?section=appearance", label: "Appearance", match: isSettingsSectionActive(location, "appearance") },
        { type: "link", to: "/preferences?section=modules", label: "Module Visibility", match: isSettingsSectionActive(location, "modules") }
      ]
    }),
    [location]
  );
  const [activeGroup, setActiveGroup] = useState(() => getGroupForRoute(location, navGroups) || "training");

  useLayoutEffect(() => {
    applyThemePreference(document.documentElement.dataset.theme || FALLBACK_THEME);
  }, []);

  useEffect(() => {
    const nextGroup = getGroupForRoute(location, navGroups);
    if (nextGroup) {
      setActiveGroup(nextGroup);
    }
  }, [location, navGroups]);

  const selectedGroup = activeGroup === "settings" ? settingsGroup : navGroups.find((group) => group.id === activeGroup) || navGroups[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-primary">
          <div className="sidebar-brand">
            <p className="eyebrow">Health and fitness companion</p>
            <h1>PulsePeak</h1>
            <p className="muted">Training, recovery, and decision support in one polished fitness workspace.</p>
          </div>

          <div className="sidebar-nav-shell">
            <nav className="sidebar-group-list">
              {navGroups.filter((group) => group.id !== "insights" || group.items.length).map((group) => {
                  const isActiveSection = group.id === activeGroup;
                  return (
                    <button
                      key={group.id}
                      className={`sidebar-group-button ${isActiveSection ? "sidebar-group-button-active" : ""}`}
                      type="button"
                      onClick={() => setActiveGroup(group.id)}
                    >
                      <span>{group.label}</span>
                    </button>
                  );
                })}
            </nav>

            <div className="sidebar-submenu-panel">
              <div className="sidebar-submenu-header">
                <p className="section-label">{selectedGroup.label}</p>
                <strong>{selectedGroup.label === "Settings" ? "Manage the app without cluttering the rail." : "Open the section you need next."}</strong>
              </div>
              <div className="sidebar-submenu-items">
                {selectedGroup.items.map((item) =>
                  item.type === "link" ? (
                    item.to.includes("?section=") ? (
                      <button
                        key={item.to}
                        className={`nav-link sidebar-submenu-link ${item.match ? "active" : ""}`}
                        type="button"
                        onClick={() => navigate(item.to)}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <NavLink key={item.to} className="nav-link sidebar-submenu-link" end={item.end} to={item.to}>
                        {item.label}
                      </NavLink>
                    )
                  ) : (
                    <button
                      key={item.label}
                      className={`nav-link sidebar-submenu-link sidebar-submenu-action ${item.disabled ? "sidebar-submenu-link-disabled" : ""}`}
                      disabled={item.disabled}
                      type="button"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-profile-button" type="button" onClick={() => navigate("/preferences?section=account")}>
            <div className="sidebar-profile">
              <strong>{user?.name}</strong>
              <p className="muted">{user?.email}</p>
              <p className="tier-pill">{user?.accessLabel || (isPremium ? "Premium" : "Free")}</p>
              {accessTier === "trial_active" && user?.trialEndsLabel ? (
                <p className="muted">Trial active until {user.trialEndsLabel}</p>
              ) : null}
              {accessTier === "free" && user?.canStartTrial ? (
                <p className="muted">7-day free trial available</p>
              ) : null}
              {accessTier === "trial_active" ? (
                <p className="sidebar-plan-note">
                  {user?.trialStatus === "canceled" && user?.trialEndsLabel
                    ? `Trial ends on ${user.trialEndsLabel}. You will return to Free after that date. Monthly remains available separately later.`
                    : `Trial ends on ${user?.trialEndsLabel || "your renewal date"}. Then renews yearly at $119.99/year unless canceled.`}
                </p>
              ) : null}
              {accessTier === "premium" && user?.subscriptionPlanInterval ? (
                <p className="sidebar-plan-note">
                  {`${user.subscriptionPlanInterval === "yearly" ? "Yearly" : "Monthly"} plan active`}
                  {user?.currentPeriodEnd
                    ? `. Renewal date: ${new Date(user.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
                    : user?.cancelAtPeriodEnd
                      ? ". Ends after the current billing period."
                      : "."}
                </p>
              ) : null}
            </div>
          </button>
          <button
            className={`sidebar-group-button sidebar-settings-button ${activeGroup === "settings" ? "sidebar-group-button-active" : ""}`}
            type="button"
            onClick={() => {
              setActiveGroup("settings");
              navigate("/preferences?section=preferences");
            }}
          >
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}

function isRouteActive(pathname, to, end = false) {
  if (end) {
    return pathname === to;
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

function getGroupForRoute(location, groups) {
  const settingsMatch = isSettingsPath(location.pathname);
  if (settingsMatch) {
    return "settings";
  }

  const matchedGroup = groups.find((group) =>
    group.items.some((item) => item.type === "link" && item.to && isRouteActive(location.pathname, item.to, item.end))
  );
  return matchedGroup?.id || null;
}

function isSettingsPath(pathname) {
  return pathname === "/preferences" || pathname.startsWith("/preferences/");
}

function isSettingsSectionActive(location, section) {
  if (!isSettingsPath(location.pathname)) {
    return false;
  }

  const params = new URLSearchParams(location.search);
  return (params.get("section") || "preferences") === section;
}

```

## FILE: src/components/DashboardControlsPanel.jsx

`$ext
import React, { useMemo, useState } from "react";
import Panel from "./Panel";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { normalizeHiddenModules } from "../../shared/dashboardModules";

const VISIBILITY_OPTIONS = [
  { id: "nutrition", label: "Nutrition", description: "Hide nutrition guidance from the main navigation." },
  { id: "mobility", label: "Mobility", description: "Hide mobility and recovery guidance from the main navigation." },
  { id: "insights_group", label: "Insights group", description: "Hide both Coach and Progress from the main navigation." },
  { id: "coach", label: "Coach", description: "Hide the coach surface from the main navigation." },
  { id: "progress", label: "Progress", description: "Hide progress tracking from the main navigation." }
];

export default function DashboardControlsPanel() {
  const { token, dashboard, refreshSession } = useAuth();
  const profile = dashboard?.profile || {};
  const [hiddenModules, setHiddenModules] = useState(() => normalizeHiddenModules(profile.hiddenModules));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  React.useEffect(() => {
    setHiddenModules(normalizeHiddenModules(profile.hiddenModules));
  }, [profile.hiddenModules]);

  const visibilityOptions = useMemo(
    () =>
      VISIBILITY_OPTIONS.map((option) => {
        if (option.id === "insights_group") {
          const hidden = hiddenModules.includes("coach") && hiddenModules.includes("progress");
          return { ...option, hidden };
        }

        return { ...option, hidden: hiddenModules.includes(option.id) };
      }),
    [hiddenModules]
  );

  const toggleHiddenModule = (moduleId) => {
    setHiddenModules((current) => {
      if (moduleId === "insights_group") {
        const next = new Set(current);
        const bothHidden = next.has("coach") && next.has("progress");
        if (bothHidden) {
          next.delete("coach");
          next.delete("progress");
        } else {
          next.add("coach");
          next.add("progress");
        }
        return Array.from(next);
      }

      return current.includes(moduleId) ? current.filter((entry) => entry !== moduleId) : [...current, moduleId];
    });
  };

  const saveControls = async () => {
    setSaving(true);
    setStatus("");
    try {
      await apiRequest(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            hiddenModules: normalizeHiddenModules(hiddenModules)
          })
        },
        token
      );
      await refreshSession(token);
      setStatus("Module visibility saved.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel eyebrow="Module Visibility" title="Hide the optional parts of PulsePeak you do not want in the navigation">
      <div className="module-control-list">
        {visibilityOptions.map((module) => {
          const hidden = module.hidden;
          return (
            <div className="module-control-row" key={module.id}>
              <div>
                <strong>{module.label}</strong>
                <p className="muted">{module.description}</p>
              </div>
              <div className="module-control-actions">
                <button className={hidden ? "secondary-button" : "primary-button"} type="button" onClick={() => toggleHiddenModule(module.id)}>
                  {hidden ? "Show" : "Hide"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {status ? <p className="muted">{status}</p> : null}
      <button className="primary-button" disabled={saving} type="button" onClick={saveControls}>
        {saving ? "Saving..." : "Save visibility"}
      </button>
    </Panel>
  );
}

```

## FILE: src/components/MovementDetailModal.jsx

`$ext
import React from "react";
import { getMovementMedia } from "../../shared/exerciseCatalog";

export default function MovementDetailModal({ movement, onClose, guidanceLevel = "standard" }) {
  if (!movement) {
    return null;
  }

  const mediaView = getMovementMedia(movement);
  const equipment = Array.isArray(movement.equipment) ? movement.equipment : [];
  const primaryMuscles = Array.isArray(movement.primaryMuscles) ? movement.primaryMuscles : [];
  const secondaryMuscles = Array.isArray(movement.secondaryMuscles) ? movement.secondaryMuscles : [];
  const cues = Array.isArray(movement.cues) ? movement.cues : [];
  const commonMistakes = Array.isArray(movement.commonMistakes) ? movement.commonMistakes : [];
  const safetyNotes = Array.isArray(movement.safetyNotes) ? movement.safetyNotes : [];
  const modifications = Array.isArray(movement.modifications) ? movement.modifications : [];
  const instructions = Array.isArray(movement.instructions) ? movement.instructions : [];
  const sequenceSteps = [
    { key: "start", title: "Start", support: "Set your position and brace before the rep starts." },
    { key: "mid", title: "Mid", support: "Move into the working range without rushing." },
    { key: "peak", title: "Peak", support: "Own the strongest part of the rep with control." },
    { key: "finish", title: "Finish", support: "Return cleanly and reset for the next rep." }
  ];
  const showFullGuidance = guidanceLevel === "full";
  const showStandardGuidance = guidanceLevel !== "minimal";
  const instructionList = guidanceLevel === "minimal" ? instructions.slice(0, 2) : instructions;
  const videoUrl = mediaView.media?.videoUrl || "";
  const usesDirectVideo = /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(videoUrl);
  const hasExternalVideo = Boolean(videoUrl) && !usesDirectVideo;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="modal-card movement-detail-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="section-label">Movement guide</p>
            <h3>{movement.name}</h3>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="movement-hero">
          <div className="movement-guide-intro">
            <div className="movement-detail-block">
              <p className="section-label">Movement snapshot</p>
              <strong>Use the visual sequence first, then run the set with the cues below.</strong>
              <p className="support-copy">
                {usesDirectVideo
                  ? "Video sits at the top of the guide when it is available so you can confirm the movement quickly."
                  : hasExternalVideo
                    ? "A quick example video is available for this movement, and the guide opens it without changing your place in the app."
                  : mediaView.hasThumbnail
                    ? "Reference imagery is ready for this movement, with the written cues keeping the rep quality sharp."
                    : "This guide is media-ready, so the same layout already supports full visuals later without changing how you use it now."}
              </p>
            </div>
            <div className="movement-meta-grid">
              <div className="insight-chip">
                <strong>Category</strong>
                <p className="support-copy">{movement.category}</p>
              </div>
              <div className="insight-chip">
                <strong>Difficulty</strong>
                <p className="support-copy">{movement.difficulty}</p>
              </div>
              <div className="insight-chip">
                <strong>Equipment</strong>
                <p className="support-copy">{equipment.join(", ") || "No equipment"}</p>
              </div>
              <div className="insight-chip">
                <strong>Primary muscles</strong>
                <p className="support-copy">{primaryMuscles.join(", ") || "General"}</p>
              </div>
              <div className="insight-chip">
                <strong>Movement quality</strong>
                <p className="support-copy">{movement.rehabSafe ? "Joint-friendly option" : "Standard loading option"}</p>
              </div>
              <div className="insight-chip">
                <strong>Media status</strong>
                <p className="support-copy">
                  {mediaView.mediaStatus === "full"
                    ? "Full media ready"
                    : mediaView.mediaStatus === "basic"
                      ? "Reference visual ready"
                      : "Structured placeholder ready"}
                </p>
              </div>
            </div>
          </div>

          <div className="movement-visual-stack">
            <div className="movement-image-frame movement-image-panel">
              <div className="movement-image-header">
                <span className="movement-image-badge">{usesDirectVideo ? "Movement video" : "Movement preview"}</span>
                <span className="movement-reference-prefix">
                  {usesDirectVideo
                    ? "Watch one clean rep, then use the cues below."
                    : hasExternalVideo
                      ? "Preview the movement here, then open a video example for a quick rep check."
                    : mediaView.hasThumbnail
                      ? "Reference visual"
                      : "Structured placeholder"}
                </span>
              </div>
              {usesDirectVideo ? (
                <video className="movement-image" controls poster={mediaView.thumbnail || undefined} src={mediaView.media.videoUrl} />
              ) : mediaView.hasThumbnail ? (
                <img alt={movement.imageAlt || `${movement.name} preview`} className="movement-image" src={mediaView.thumbnail} />
              ) : (
                <div className="movement-media-placeholder movement-media-placeholder-hero">
                  <span className="movement-media-placeholder-mark">{mediaView.placeholderInitials}</span>
                  <strong>{mediaView.placeholderLabel}</strong>
                  <p>{movement.name}</p>
                </div>
              )}
              {hasExternalVideo ? (
                <div className="movement-video-actions">
                  <a className="secondary-button" href={videoUrl} rel="noreferrer" target="_blank">
                    Open example video
                  </a>
                </div>
              ) : null}
            </div>

            <div className="movement-credibility-strip">
              <span className="movement-credibility-pill">
                {movement.rehabSafe ? "Joint-friendly option" : "Matches your current setup"}
              </span>
              <span className="movement-credibility-pill">
                {movement.secondaryMuscles?.length ? `Supports ${movement.secondaryMuscles[0].toLowerCase()}` : "Used in guided training"}
              </span>
            </div>
          </div>
        </div>

        <article className="movement-detail-block">
          <p className="section-label">Visual sequence</p>
          <div className="movement-sequence-grid">
            {sequenceSteps.map((step, index) => {
              const sequenceItem = mediaView.sequence[index];
              return (
                <div className="movement-sequence-step" key={step.key}>
                  <div className="movement-sequence-labels">
                    <span className="focus-step">{sequenceItem.label}</span>
                    <strong>{step.title}</strong>
                  </div>
                  {sequenceItem.src ? (
                    <img alt={`${movement.name} ${step.title.toLowerCase()}`} className="movement-sequence-image" src={sequenceItem.src} />
                  ) : (
                    <div className="movement-media-placeholder movement-sequence-placeholder">
                      <span className="movement-media-placeholder-mark">{index + 1}</span>
                      <strong>{sequenceItem.label}</strong>
                      <p>{step.title}</p>
                    </div>
                  )}
                  <p className="support-copy">{step.support}</p>
                </div>
              );
            })}
          </div>
        </article>

        <div className="movement-detail-grid">
          <article className="movement-detail-block">
            <p className="section-label">Step by step</p>
            <ol className="movement-numbered-list">
              {instructionList.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          {showStandardGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Key cues</p>
              <ul className="plan-list">
                {cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Mistakes to avoid</p>
              <ul className="plan-list">
                {commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Safety notes</p>
              <ul className="plan-list">
                {safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showFullGuidance ? (
            <article className="movement-detail-block">
              <p className="section-label">Modifications</p>
              <ul className="plan-list">
                {modifications.map((modification) => (
                  <li key={modification}>{modification}</li>
                ))}
              </ul>
            </article>
          ) : null}

          <article className="movement-detail-block">
            <p className="section-label">Secondary muscles</p>
            <p className="support-copy">{secondaryMuscles.join(", ") || "None listed"}</p>
          </article>
        </div>
      </div>
    </div>
  );
}

```

## FILE: src/components/MovementReference.jsx

`$ext
import React from "react";

export default function MovementReference({ movement, onClick, compact = false, prefix }) {
  if (!movement) {
    return null;
  }

  const imageSrc = movement.thumbnail || movement.image;
  const classes = ["movement-reference"];
  if (compact) {
    classes.push("movement-reference-compact");
  }
  if (onClick) {
    classes.push("movement-reference-clickable");
  }

  const content = (
    <>
      <div className="movement-reference-media" aria-hidden="true">
        {imageSrc ? (
          <img alt="" className="movement-reference-thumb" src={imageSrc} />
        ) : (
          <div className="movement-reference-fallback">
            <span>{movement.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="movement-reference-copy">
        {prefix ? <span className="movement-reference-prefix">{prefix}</span> : null}
        <strong>{movement.name}</strong>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button className={classes.join(" ")} type="button" onClick={() => onClick(movement)}>
        {content}
      </button>
    );
  }

  return <div className={classes.join(" ")}>{content}</div>;
}

```

## FILE: src/components/OnboardingFlow.jsx

`$ext
import React, { useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import {
  EQUIPMENT_PROFILE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  INJURY_STATUS_OPTIONS,
  NUTRITION_MODE_OPTIONS,
  RESTRICTED_AREA_OPTIONS,
  SEX_OPTIONS,
  TRAINING_ENVIRONMENT_OPTIONS,
  UNIT_PREFERENCE_OPTIONS
} from "../config/profileOptions";
import { useAuth } from "../state/AuthContext";
import {
  convertHeightFromStored,
  convertHeightToStored,
  convertWeightFromStored,
  convertWeightToStored,
  normalizeUnitPreference
} from "../../shared/unitSystem";
import { getDefaultEquipmentProfile, getEquipmentOptionsForEnvironment, normalizeEquipmentProfile } from "../../shared/workoutEngine";
import { APP_MODE_OPTIONS, getAppModeLabel } from "../../shared/appModes.js";

const STEP_TITLES = [
  "Welcome",
  "App mode",
  "Primary goal",
  "Training setup",
  "Nutrition mode",
  "Body and recovery",
  "Review"
];

export default function OnboardingFlow({ mode = "onboarding", onComplete }) {
  const { token, user, dashboard, refreshSession } = useAuth();
  const profile = dashboard?.profile || {};
  const initialTrainingEnvironment = profile.trainingEnvironment || "hybrid";
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    appMode: profile.appMode || "full_system",
    goalType: profile.goalType || "general_fitness",
    nutritionMode: profile.nutritionMode || "basic",
    unitPreference: normalizeUnitPreference(profile.unitPreference),
    ageGroup: profile.ageGroup || "30-39",
    birthdate: profile.birthdate || "",
    experienceLevel: profile.experienceLevel || "beginner",
    trainingEnvironment: initialTrainingEnvironment,
    equipmentProfile: normalizeEquipmentProfile(profile.equipmentProfile, initialTrainingEnvironment),
    injuryStatus: profile.injuryStatus || "none",
    sex: profile.sex || "prefer_not_to_say",
    heightInput: convertHeightFromStored(profile.heightCm, profile.unitPreference),
    currentWeightInput: convertWeightFromStored(profile.currentWeight, profile.unitPreference),
    targetWeightInput: convertWeightFromStored(profile.targetWeight, profile.unitPreference),
    restrictedAreas: profile.restrictedAreas || []
  });

  const totalSteps = STEP_TITLES.length;
  const isLastStep = step === totalSteps - 1;
  const progress = Math.round(((step + 1) / totalSteps) * 100);
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === form.goalType)?.label || "General Fitness";
  const nutritionLabel = NUTRITION_MODE_OPTIONS.find((option) => option.value === form.nutritionMode)?.label || "Basic";
  const showRestrictedAreas = form.injuryStatus !== "none";
  const derivedAgeGroup = React.useMemo(() => deriveAgeGroup(form.birthdate) || form.ageGroup || "30-39", [form.birthdate, form.ageGroup]);
  const sexLabel = SEX_OPTIONS.find((option) => option.value === form.sex)?.label || "Prefer not to say";
  const unitLabel = UNIT_PREFERENCE_OPTIONS.find((option) => option.value === form.unitPreference)?.label || "Imperial";
  const heightUnitLabel = form.unitPreference === "metric" ? "cm" : "in";
  const weightUnitLabel = form.unitPreference === "metric" ? "kg" : "lb";
  const availableEquipmentOptions = useMemo(
    () => getEquipmentOptionsForEnvironment(form.trainingEnvironment),
    [form.trainingEnvironment]
  );
  const equipmentLabel = availableEquipmentOptions.find((option) => option.value === form.equipmentProfile)?.label || "Hybrid";

  const summaryRows = useMemo(
    () => [
      { label: "App mode", value: getAppModeLabel(form.appMode), editStep: 1 },
      { label: "Primary goal", value: goalLabel, editStep: 2 },
      { label: "Training setup", value: `${capitalize(form.experienceLevel)} / ${capitalize(form.trainingEnvironment)} / ${equipmentLabel}`, editStep: 3 },
      { label: "Nutrition mode", value: `${nutritionLabel} / ${unitLabel}`, editStep: 4 },
      {
        label: "Body profile",
        value: `${derivedAgeGroup} / ${sexLabel} / ${form.heightInput || "Height pending"} ${heightUnitLabel} / ${form.currentWeightInput || "Weight pending"} ${weightUnitLabel}`,
        editStep: 5
      },
      {
        label: "Recovery guardrails",
        value: `${formatInjuryStatus(form.injuryStatus)}${form.targetWeightInput ? ` / target ${form.targetWeightInput} ${weightUnitLabel}` : ""}`,
        editStep: 5
      },
      {
        label: "Restricted areas",
        value: showRestrictedAreas && form.restrictedAreas.length ? form.restrictedAreas.map(capitalize).join(", ") : "None selected",
        editStep: 5
      }
    ],
    [
      derivedAgeGroup,
      form.appMode,
      form.currentWeightInput,
      form.equipmentProfile,
      form.experienceLevel,
      form.heightInput,
      form.injuryStatus,
      form.restrictedAreas,
      form.sex,
      form.targetWeightInput,
      form.trainingEnvironment,
      equipmentLabel,
      goalLabel,
      heightUnitLabel,
      nutritionLabel,
      sexLabel,
      showRestrictedAreas,
      unitLabel,
      weightUnitLabel
    ]
  );
  const projectedOutcome = useMemo(() => getProjectedOutcome(form), [form]);
  const whyThisWorksPreview = useMemo(() => getWhyThisWorksPreview(form), [form]);
  const onboardingNudgeKey = useMemo(
    () => `pulsepeak-onboarding-upgrade-nudge:${user?.id || "guest"}`,
    [user?.id]
  );

  const updateField = (key, value) => {
      if (key === "unitPreference") {
        setForm((current) => {
        const nextUnitPreference = normalizeUnitPreference(value);
        return {
          ...current,
          unitPreference: nextUnitPreference,
          heightInput: convertUnitInputs(current.heightInput, current.unitPreference, nextUnitPreference, "height"),
          currentWeightInput: convertUnitInputs(current.currentWeightInput, current.unitPreference, nextUnitPreference, "weight"),
          targetWeightInput: convertUnitInputs(current.targetWeightInput, current.unitPreference, nextUnitPreference, "weight")
        };
      });
      return;
    }

    if (key === "trainingEnvironment") {
      setForm((current) => ({
        ...current,
        trainingEnvironment: value,
        equipmentProfile: normalizeEquipmentProfile(current.equipmentProfile, value) || getDefaultEquipmentProfile(value)
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const toggleRestrictedArea = (area) => {
    setForm((current) => ({
      ...current,
      restrictedAreas: current.restrictedAreas.includes(area)
        ? current.restrictedAreas.filter((entry) => entry !== area)
        : [...current.restrictedAreas, area]
    }));
  };

  const goNext = () => {
    const nextError = validateStep(step, form);
    if (nextError) {
      setError(nextError);
      return;
    }
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const validationError = validateStep(step, form);
      if (validationError) {
        throw new Error(validationError);
      }
      await apiRequest(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            appMode: form.appMode,
            goalType: form.goalType,
            nutritionMode: form.nutritionMode,
            unitPreference: form.unitPreference,
            ageGroup: derivedAgeGroup,
            birthdate: form.birthdate,
            experienceLevel: form.experienceLevel,
            trainingEnvironment: form.trainingEnvironment,
            equipmentProfile: form.equipmentProfile,
            injuryStatus: form.injuryStatus,
            sex: form.sex,
            heightCm: convertHeightToStored(form.heightInput, form.unitPreference),
            currentWeight: convertWeightToStored(form.currentWeightInput, form.unitPreference),
            targetWeight: convertWeightToStored(form.targetWeightInput, form.unitPreference),
            restrictedAreas: showRestrictedAreas ? form.restrictedAreas : [],
            onboardingCompleted: true
          })
        },
        token
      );
      if (mode === "onboarding") {
        window.sessionStorage.setItem(onboardingNudgeKey, "true");
      }
      await refreshSession(token);
      onComplete?.();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-shell">
      <section className="onboarding-panel onboarding-hero">
        <p className="badge">{mode === "onboarding" ? "Tailored setup" : "Preferences"}</p>
        <h1>
          {mode === "onboarding"
            ? "Set up PulsePeak once so every screen feels built around you."
            : "Update the adaptive settings that shape your dashboard and weekly plan."}
        </h1>
        <p className="hero-text">
          PulsePeak uses your goal, body profile, preferred units, nutrition depth, and recovery context to shape what appears on the dashboard and how your weekly plan behaves from the first session.
        </p>
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <strong>
            Step {step + 1} of {totalSteps}: {STEP_TITLES[step]}
          </strong>
        </div>
        <div className="onboarding-hero-grid">
          <div className="onboarding-hero-card">
            <span className="focus-step">Tailored from day one</span>
            <strong>Modules, weekly planning, and coach logic start from your real setup instead of a default template.</strong>
          </div>
          <div className="onboarding-hero-card">
            <span className="focus-step">Clearer nutrition and recovery</span>
            <strong>Body profile, units, and injury inputs make the next step feel more believable immediately.</strong>
          </div>
        </div>
      </section>

      <section className="onboarding-panel onboarding-card">
        {step === 0 ? (
          <div className="onboarding-step">
            <p className="section-label">Welcome</p>
            <h2>Build the version of PulsePeak that actually fits you.</h2>
            <p className="muted">
              This takes about a minute. When you finish, the dashboard, coach, and weekly plan will already feel sharper, cleaner, and more personal than a generic fitness app.
            </p>
            <div className="onboarding-highlights">
              <div className="preview-highlight">
                <span className="focus-step">Goal-aware</span>
                <strong>Weekly plan adapts to the result you care about most.</strong>
              </div>
              <div className="preview-highlight">
                <span className="focus-step">Clutter control</span>
                <strong>Nutrition, mobility, and other modules appear only when they matter.</strong>
              </div>
              <div className="preview-highlight">
                <span className="focus-step">Recovery-aware</span>
                <strong>Injury and recovery inputs shape the training tone from day one.</strong>
              </div>
              <div className="preview-highlight">
                <span className="focus-step">Body-aware</span>
                <strong>Weight, height, and birthdate make fueling and hydration guidance more believable.</strong>
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="onboarding-step">
            <p className="section-label">App mode</p>
            <h2>Choose how you want PulsePeak to work for you.</h2>
            <p className="muted">This is your starting layout, not a permanent lock-in. You can switch it later in Settings whenever you want to open the app up again.</p>
            <div className="goal-card-grid">
              {APP_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`goal-card ${form.appMode === option.value ? "goal-card-active" : ""}`}
                  type="button"
                  onClick={() => updateField("appMode", option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboarding-step">
            <p className="section-label">Primary goal</p>
            <h2>What should PulsePeak optimize first?</h2>
            <div className="goal-card-grid">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`goal-card ${form.goalType === option.value ? "goal-card-active" : ""}`}
                  type="button"
                  onClick={() => {
                    updateField("goalType", option.value);
                    updateField("nutritionMode", getSuggestedNutritionMode(option.value, form.nutritionMode));
                  }}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="onboarding-step">
            <p className="section-label">Training setup</p>
            <h2>How should the training side of the app think about you?</h2>
            <div className="profile-grid">
              <label>
                Experience level
                <select value={form.experienceLevel} onChange={(event) => updateField("experienceLevel", event.target.value)}>
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Training environment
                <select value={form.trainingEnvironment} onChange={(event) => updateField("trainingEnvironment", event.target.value)}>
                  {TRAINING_ENVIRONMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Equipment setup
                <select value={form.equipmentProfile} onChange={(event) => updateField("equipmentProfile", event.target.value)}>
                  {availableEquipmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="module-note">
              <strong>{equipmentLabel}</strong>
              <p className="muted">
                PulsePeak uses this to decide which exercises, swaps, and splits make sense before you ever open the workout library.
              </p>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="onboarding-step">
            <p className="section-label">Nutrition mode</p>
            <h2>Choose the nutrition depth and units you want to live in every day.</h2>
            <div className="goal-card-grid">
              {NUTRITION_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`goal-card ${form.nutritionMode === option.value ? "goal-card-active" : ""}`}
                  type="button"
                  onClick={() => updateField("nutritionMode", option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            <div className="section-stack">
              <div>
                <p className="section-label">Units</p>
                <p className="muted">Choose the measurement system that should appear in onboarding, planning, and daily tracking.</p>
              </div>
              <div className="goal-card-grid">
                {UNIT_PREFERENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`goal-card ${form.unitPreference === option.value ? "goal-card-active" : ""}`}
                    type="button"
                    onClick={() => updateField("unitPreference", option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="onboarding-step">
            <p className="section-label">Body and recovery</p>
            <h2>Give PulsePeak enough context to personalize the week responsibly.</h2>
            <div className="profile-grid">
              <label>
                Birthdate
                <input
                  max={new Date().toISOString().slice(0, 10)}
                  type="date"
                  value={form.birthdate}
                  onChange={(event) => updateField("birthdate", event.target.value)}
                />
              </label>
              <label>
                Sex for training estimates
                <select value={form.sex} onChange={(event) => updateField("sex", event.target.value)}>
                  {SEX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Height ({heightUnitLabel})
                <input
                  min="120"
                  max={form.unitPreference === "metric" ? "230" : "90"}
                  step={form.unitPreference === "metric" ? "1" : "1"}
                  type="number"
                  value={form.heightInput}
                  onChange={(event) => updateField("heightInput", event.target.value)}
                />
              </label>
              <label>
                Current weight ({weightUnitLabel})
                <input
                  min={form.unitPreference === "metric" ? "35" : "80"}
                  max={form.unitPreference === "metric" ? "230" : "500"}
                  step={form.unitPreference === "metric" ? "0.5" : "1"}
                  type="number"
                  value={form.currentWeightInput}
                  onChange={(event) => updateField("currentWeightInput", event.target.value)}
                />
              </label>
              <label>
                Target weight ({weightUnitLabel})
                <input
                  min={form.unitPreference === "metric" ? "35" : "80"}
                  max={form.unitPreference === "metric" ? "230" : "500"}
                  step={form.unitPreference === "metric" ? "0.5" : "1"}
                  type="number"
                  value={form.targetWeightInput}
                  onChange={(event) => updateField("targetWeightInput", event.target.value)}
                />
              </label>
              <label>
                Injury status
                <select value={form.injuryStatus} onChange={(event) => updateField("injuryStatus", event.target.value)}>
                  {INJURY_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="module-note">
              <strong>{derivedAgeGroup} recovery profile</strong>
              <p className="muted">
                PulsePeak uses your birthdate, body profile, and chosen units to tune cadence, recovery emphasis, and rough fueling guidance instead of defaulting everyone to the same week.
              </p>
            </div>
            {showRestrictedAreas ? (
              <div className="section-stack">
                <div>
                  <p className="section-label">Restricted areas</p>
                  <p className="muted">Choose any areas that should make the plan more conservative. You can leave this blank if the limitation is broad.</p>
                </div>
                <div className="chip-toggle-grid">
                  {RESTRICTED_AREA_OPTIONS.map((area) => (
                    <button
                      key={area}
                      className={`goal-card chip-card ${form.restrictedAreas.includes(area) ? "goal-card-active" : ""}`}
                      type="button"
                      onClick={() => toggleRestrictedArea(area)}
                    >
                      <strong>{capitalize(area)}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 6 ? (
          <div className="onboarding-step">
            <p className="section-label">Review</p>
            <h2>Here&apos;s how PulsePeak will shape your starting experience.</h2>
            <div className="onboarding-summary">
              {summaryRows.map((row) => (
                <div className="plan-preview-callout onboarding-review-card" key={row.label}>
                  <div>
                    <span className="focus-step">{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                  <button className="ghost-button onboarding-edit-button" type="button" onClick={() => setStep(row.editStep)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
            <div className="onboarding-hero-grid">
              <div className="onboarding-hero-card">
                <span className="focus-step">Expected direction</span>
                <strong>{projectedOutcome.summary}</strong>
                <span className="muted">{projectedOutcome.confidence}</span>
              </div>
              <div className="onboarding-hero-card">
                <span className="focus-step">Why this works</span>
                <strong>{whyThisWorksPreview.trustNote}</strong>
                <span className="muted">{whyThisWorksPreview.body}</span>
              </div>
            </div>
            <p className="muted">
              Finish setup to land in a dashboard, coach view, and weekly plan that already reflect your modules, body profile, nutrition depth, training context, and recovery needs.
            </p>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <div className="onboarding-actions">
          <button className="ghost-button" disabled={step === 0 || saving} type="button" onClick={goBack}>
            Back
          </button>
          {isLastStep ? (
            <button className="primary-button" disabled={saving} type="button" onClick={saveProfile}>
              {saving ? "Saving..." : mode === "onboarding" ? "Start my tailored dashboard" : "Save preferences"}
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={goNext}>
              Next
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value[0].toUpperCase() + value.slice(1);
}

function formatInjuryStatus(value) {
  if (value === "active_injury") {
    return "Active injury";
  }
  if (value === "minor") {
    return "Minor limitation";
  }
  return "None";
}

function getSuggestedNutritionMode(goalType, currentMode) {
  if (goalType === "fat_loss") {
    return "full";
  }
  if (goalType === "bodybuilding" || goalType === "general_fitness") {
    return currentMode === "full" ? "full" : "basic";
  }
  return currentMode === "full" ? "full" : "off";
}

function deriveAgeGroup(birthdate) {
  if (!birthdate) {
    return "";
  }

  const parsed = new Date(`${birthdate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }

  if (age < 30) {
    return "18-29";
  }
  if (age < 40) {
    return "30-39";
  }
  if (age < 50) {
    return "40-49";
  }
  return "50+";
}

function convertUnitInputs(value, previousUnit, nextUnit, type) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (type === "height") {
    const stored = convertHeightToStored(value, previousUnit);
    return stored ? convertHeightFromStored(stored, nextUnit) : "";
  }

  const stored = convertWeightToStored(value, previousUnit);
  return stored ? convertWeightFromStored(stored, nextUnit) : "";
}

function validateStep(step, form) {
  if (step < 5) {
    return "";
  }

  if (!form.birthdate) {
    return "Add your birthdate so PulsePeak can tune recovery and nutrition guidance more accurately.";
  }
  if (!form.heightInput) {
    return "Add your height so PulsePeak can estimate a more realistic calorie range.";
  }
  if (!form.currentWeightInput) {
    return "Add your current weight so PulsePeak can personalize protein and hydration guidance.";
  }

  return "";
}

function getProjectedOutcome(form) {
  if (form.goalType === "fat_loss") {
    return {
      summary: "A realistic fat-loss pace is roughly 0.25 to 0.75 lb per week once protein, hydration, and training are steady.",
      confidence: "PulsePeak is aiming for believable weekly progress, not crash-diet promises."
    };
  }
  if (form.goalType === "strength") {
    return {
      summary: "Expect steadier top sets, cleaner reps, and gradual load progress before dramatic jumps.",
      confidence: "The plan is built to make strength more repeatable week to week."
    };
  }
  if (form.goalType === "bodybuilding") {
    return {
      summary: "The first visible win should be better training quality and more repeatable weekly volume.",
      confidence: "Physique change follows more reliable training and fueling, not one perfect week."
    };
  }
  if (form.goalType === "mobility" || form.goalType === "injury_recovery") {
    return {
      summary: "Expect smoother movement, less guarded sessions, and better confidence before bigger physical changes.",
      confidence: "PulsePeak is prioritizing movement quality and safe repeatability first."
    };
  }
  return {
    summary: "The first wins should be steadier consistency, cleaner recovery, and fewer off-track days.",
    confidence: "That foundation is what makes the rest of the app feel more useful every week."
  };
}

function getWhyThisWorksPreview(form) {
  return {
    trustNote: "Built from your actual setup, not a generic fitness template.",
    body: `${capitalize(form.trainingEnvironment)} access, ${capitalize(form.experienceLevel)} experience, ${formatInjuryStatus(form.injuryStatus).toLowerCase()}, and your chosen nutrition depth all shape what PulsePeak shows and recommends.`
  };
}

```

## FILE: src/components/UpgradePrompt.jsx

`$ext
import React from "react";
import { BILLING_OPTIONS, TRIAL_MODEL } from "../config/monetization";
import { useAuth } from "../state/AuthContext";

export default function UpgradePrompt({ prompt, onUpgrade, onDismiss, busy = false, compact = false }) {
  const { user, accessTier, dashboard } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState("yearly");
  if (!prompt) {
    return null;
  }

  const pricingModel = dashboard?.pricingModel;
  const billingOptions = BILLING_OPTIONS.map((option) => {
    const liveOption = pricingModel?.[option.id];
    return {
      ...option,
      priceLabel: liveOption?.cadenceLabel || option.priceLabel,
      helper: liveOption?.helper || option.helper
    };
  });
  const canStartTrial = Boolean(user?.canStartTrial);
  const trialEndsLabel = user?.trialEndsLabel || null;
  const directPaidLabel = "Upgrade now";
  const primaryLabel = busy
    ? "Redirecting..."
    : canStartTrial
      ? `Start ${TRIAL_MODEL.days}-day free trial`
      : selectedPlan === "yearly"
        ? "Upgrade now"
        : prompt.ctaLabel || "Upgrade now";

  return (
    <section className={`upgrade-prompt ${compact ? "upgrade-prompt-compact" : ""}`}>
      <div className="upgrade-prompt-copy">
        <p className="section-label">{prompt.eyebrow}</p>
        <h4>{prompt.title}</h4>
        <p className="support-copy upgrade-copy">{prompt.body}</p>
        {accessTier === "trial_active" && trialEndsLabel ? (
          <p className="support-copy upgrade-copy">
            Trial ends on {trialEndsLabel}. Then renews yearly at $119.99/year unless canceled before trial ends.
          </p>
        ) : null}
        {prompt.bullets?.length ? (
          <ul className="plan-list">
            {prompt.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        <div className="upgrade-tier-summary">
          <div className="upgrade-tier-card">
            <span className="section-label">Free</span>
            <strong>2 completed sessions in a rolling 7-day window</strong>
            <span className="support-copy">See the system, train a little, and feel where the real limit starts.</span>
          </div>
          <div className="upgrade-tier-card">
            <span className="section-label">7-day trial</span>
            <strong>Full access before billing starts</strong>
            <span className="support-copy">Keep your next 7 days connected. Then auto-renews yearly at $119.99/year unless canceled.</span>
          </div>
          <div className="upgrade-tier-card">
            <span className="section-label">Premium</span>
            <strong>Unlimited execution and continuity</strong>
            <span className="support-copy">Keep every session, every swap path, and the full week moving without interruption.</span>
          </div>
        </div>
        <div className="upgrade-pricing-grid">
          {billingOptions.map((option) => (
            <button
              key={option.id}
              className={`upgrade-pricing-card ${selectedPlan === option.id ? "upgrade-pricing-card-active" : ""}`}
              type="button"
              onClick={() => setSelectedPlan(option.id)}
            >
              <span className="section-label">{option.label}</span>
              <strong>{option.priceLabel}</strong>
              <span className="support-copy">{option.helper}</span>
            </button>
          ))}
        </div>
        {canStartTrial ? (
          <>
            <p className="support-copy upgrade-copy">{TRIAL_MODEL.summary}</p>
            <p className="support-copy upgrade-copy">{TRIAL_MODEL.support}</p>
          </>
        ) : (
          <p className="support-copy upgrade-copy">Upgrade to keep logging every session, keep your week connected, and continue training without limits.</p>
        )}
      </div>
      <div className="upgrade-prompt-actions">
        <button className="primary-button" disabled={busy} type="button" onClick={() => onUpgrade?.(canStartTrial ? "yearly" : selectedPlan, canStartTrial ? "default" : "upgrade_now")}>
          {primaryLabel}
        </button>
        {canStartTrial ? (
          <button className="secondary-button" disabled={busy} type="button" onClick={() => onUpgrade?.(selectedPlan, "upgrade_now")}>
            {directPaidLabel}
          </button>
        ) : null}
        {onDismiss ? (
          <button className="ghost-button" type="button" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}

```

## FILE: src/components/WeeklyPlanPreviewModal.jsx

`$ext
import React from "react";
import { getUpgradePrompt } from "../config/upgradePrompts";
import MovementReference from "./MovementReference";
import UpgradePrompt from "./UpgradePrompt";
import { useAuth } from "../state/AuthContext";
import { formatHeight, formatWeight, normalizeUnitPreference } from "../../shared/unitSystem";

export default function WeeklyPlanPreviewModal({ planPayload, onClose, onUpgrade, onOpenMovement }) {
  const { isPremium, accessTier, user } = useAuth();

  if (!planPayload?.plan) {
    return null;
  }

  const { plan, message, previewMode } = planPayload;
  const adaptiveSignals = plan.adaptiveSignals || [];
  const executionPriorities = plan.executionPriorities || [];
  const weeklyRationale = plan.weeklyRationale || [];
  const mobilityBlock = plan.mobilityBlock || null;
  const activeModuleIds = new Set((plan.activeModules || []).map((module) => module.id));
  const showNutrition = activeModuleIds.has("nutrition");
  const showHydration = activeModuleIds.has("hydration");
  const showMobility = activeModuleIds.has("mobility");
  const unitPreference = normalizeUnitPreference(plan.goalProfile?.unitPreference);
  const sanitizeNutritionText = (value) => String(value || "").replaceAll("Ã‚Â·", " - ").replaceAll("Â·", " - ");
  const weeklyPlanPrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "weekly-plan",
        profile: {
          goalType: plan.goalProfile?.goalType,
          nutritionMode: plan.nutritionMode,
          injuryStatus: plan.goalProfile?.injuryStatus
        },
        activeModules: plan.activeModules || [],
        weeklyPlan: plan
      });

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="modal-card weekly-plan-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="section-label">Premium weekly plan</p>
            <h3>{plan.weeklyFocus}</h3>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {!isPremium && previewMode ? (
          <div className="limited-preview-banner">
            <span className="focus-step">Limited preview</span>
            <strong>{message || "This is a temporary Premium preview for this session only."}</strong>
          </div>
        ) : null}

        <div className="weekly-plan-layout">
          <article className="weekly-plan-block">
            <p className="section-label">Weekly focus</p>
            <span className="section-chip">Focus</span>
            <strong>{plan.weeklyFocus}</strong>
            <p className="muted">{plan.focusReason || plan.previewNote || plan.coachNote}</p>
          </article>

          {plan.resultProjection ? (
            <article className="weekly-plan-block">
              <p className="section-label">Expected direction</p>
              <span className="section-chip">Results</span>
              <strong>{plan.resultProjection.summary}</strong>
              <p className="muted">{plan.resultProjection.confidence}</p>
            </article>
          ) : null}

          <article className="weekly-plan-block">
            <p className="section-label">{isPremium ? "Coach note" : "Preview note"}</p>
            <span className="section-chip">Guide</span>
            <strong>{isPremium ? "Why the week is set up this way" : "What this preview is showing you"}</strong>
            <p className="muted">{plan.coachNote}</p>
          </article>

          {plan.whyThisWorks ? (
            <article className="weekly-plan-block">
              <p className="section-label">Why this works</p>
              <span className="section-chip">Trust</span>
              <strong>{plan.whyThisWorks.trustNote}</strong>
              <p className="muted">{plan.whyThisWorks.body}</p>
            </article>
          ) : null}

          <article className="weekly-plan-block">
            <p className="section-label">Workout cadence</p>
            <span className="section-chip">Cadence</span>
            <strong>{plan.workoutCadence}</strong>
            <p className="muted">{plan.suggestedWorkoutMix.intensityGuidance}</p>
          </article>

          <article className="weekly-plan-block">
            <p className="section-label">Workout mix</p>
            <span className="section-chip">Training</span>
            <strong>
              {plan.suggestedWorkoutMix.environment === "both"
                ? "Gym + Home blend"
                : `${plan.suggestedWorkoutMix.environment} leaning week`}
            </strong>
            <ul className="plan-list">
              {plan.suggestedWorkoutMix.split.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {(plan.suggestedWorkoutMix.featuredMovements || []).length ? (
              <div className="movement-chip-list">
                {plan.suggestedWorkoutMix.featuredMovements.map((movement) => (
                  <MovementReference compact key={movement.id} movement={movement} onClick={onOpenMovement} />
                ))}
              </div>
            ) : null}
            {plan.suggestedWorkoutMix.rationale ? <p className="muted">{plan.suggestedWorkoutMix.rationale}</p> : null}
          </article>

          {plan.goalProfile ? (
            <article className="weekly-plan-block">
              <p className="section-label">Personalization</p>
              <span className="section-chip">Profile</span>
              <strong>{plan.goalProfile.label}</strong>
              <p className="muted">
                {plan.goalProfile.trainingEnvironment} setup - {plan.goalProfile.experienceLevel} - {plan.goalProfile.ageGroup}
                {plan.goalProfile.injuryStatus !== "none" ? ` - ${plan.goalProfile.injuryStatus.replace("_", " ")}` : ""}
              </p>
              {plan.goalProfile.currentWeight || plan.goalProfile.heightCm ? (
                <p className="muted">
                  {formatWeight(plan.goalProfile.currentWeight, unitPreference)} - {formatHeight(plan.goalProfile.heightCm, unitPreference)}
                  {plan.goalProfile.targetWeight ? ` - target ${formatWeight(plan.goalProfile.targetWeight, unitPreference)}` : ""}
                </p>
              ) : null}
            </article>
          ) : null}

          {plan.recoveryEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">Recovery emphasis</p>
              <span className="section-chip">Recovery</span>
              <strong>Protect recovery quality</strong>
              <p className="muted">{plan.recoveryEmphasis}</p>
            </article>
          ) : null}

          {showNutrition && plan.nutritionEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">{plan.nutritionMode === "full" ? "Nutrition guidance" : "Protein guidance"}</p>
              <span className="section-chip">Fuel</span>
              <strong>{plan.nutritionMode === "full" ? "Fuel the week on purpose" : "Keep protein support simple and steady"}</strong>
              <p className="muted">{plan.nutritionEmphasis}</p>
              {plan.nutritionTargets ? (
                <div className="movement-chip-list">
                  {plan.nutritionMode === "full" && plan.nutritionTargets.calorieRangeLabel ? (
                    <div className="insight-chip">
                      <strong>Calories</strong>
                      <p className="muted">{plan.nutritionTargets.calorieRangeLabel}</p>
                    </div>
                  ) : null}
                  <div className="insight-chip">
                    <strong>Protein</strong>
                    <p className="muted">{plan.nutritionTargets.proteinRangeLabel}</p>
                  </div>
                  <div className="insight-chip">
                    <strong>Hydration</strong>
                    <p className="muted">{plan.nutritionTargets.hydrationTargetLabel}</p>
                  </div>
                </div>
              ) : null}
              {plan.nutritionTargets?.todayDirection ? (
                <div className="module-note">
                  <strong>{plan.nutritionTargets.todayDirection.title}</strong>
                  <p className="support-copy">{plan.nutritionTargets.todayDirection.summary}</p>
                  {(plan.nutritionTargets.todayDirection.freeSteps || []).length ? (
                    <ul className="plan-list compact-plan-list">
                      {plan.nutritionTargets.todayDirection.freeSteps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              {plan.nutritionTargets?.mealDirection?.length ? (
                <ul className="plan-list">
                  {plan.nutritionTargets.mealDirection.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {plan.nutritionTargets?.todaysActions?.length ? (
                <>
                  <p className="section-label">What to do today</p>
                  <ul className="plan-list">
                    {plan.nutritionTargets.todaysActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {plan.nutritionTargets?.templates?.length ? (
                <>
                  <p className="section-label">Repeatable templates</p>
                  <div className="module-card-grid nutrition-template-grid">
                    {plan.nutritionTargets.templates.map((item) => (
                      <article key={item.id || item.title} className="module-card nutrition-template-card">
                        <p className="section-label">{item.title}</p>
                        <strong>{item.combo}</strong>
                        <p className="support-copy">{sanitizeNutritionText(item.nutrition)}</p>
                        <p className="support-copy">{item.whenToUse}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
              {isPremium && plan.nutritionTargets?.why ? <p className="muted">{plan.nutritionTargets.why}</p> : null}
              {isPremium && plan.nutritionTargets?.targetWeightNote ? <p className="muted">{plan.nutritionTargets.targetWeightNote}</p> : null}
            </article>
          ) : null}

          {showHydration && plan.hydrationEmphasis ? (
            <article className="weekly-plan-block">
              <p className="section-label">Hydration floor</p>
              <span className="section-chip">Hydration</span>
              <strong>{plan.hydrationEmphasis}</strong>
              <p className="muted">Built from your current goal and recent gaps.</p>
            </article>
          ) : null}

          {showMobility && mobilityBlock ? (
            <article className="weekly-plan-block">
              <p className="section-label">Mobility block</p>
              <span className="section-chip">Mobility</span>
              <strong>{mobilityBlock.title}</strong>
              <p className="muted">{mobilityBlock.reason || mobilityBlock.weeklyTarget}</p>
              <ul className="plan-list">
                {(mobilityBlock.warmup || []).map((item) => (
                  <li key={`warmup-${item.name}`}>
                    {item.movement ? (
                      <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Warm-up" />
                    ) : (
                      `Warm-up: ${item.name}`
                    )}
                  </li>
                ))}
                {(mobilityBlock.cooldown || []).map((item) => (
                  <li key={`cooldown-${item.name}`}>
                    {item.movement ? (
                      <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Cooldown" />
                    ) : (
                      `Cooldown: ${item.name}`
                    )}
                  </li>
                ))}
                {isPremium
                  ? (mobilityBlock.recoveryDay || []).map((item) => (
                      <li key={`recovery-${item.name}`}>
                        {item.movement ? (
                          <MovementReference compact movement={item.movement} onClick={onOpenMovement} prefix="Recovery day" />
                        ) : (
                          `Recovery day: ${item.name}`
                        )}
                      </li>
                    ))
                  : null}
              </ul>
              {mobilityBlock.weeklyTarget ? <p className="muted">{mobilityBlock.weeklyTarget}</p> : null}
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Adaptive signals</p>
              <span className="section-chip">Signals</span>
              <strong>What is driving this plan</strong>
              <ul className="plan-list">
                {adaptiveSignals.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Execution priorities</p>
              <span className="section-chip">Actions</span>
              <strong>What to actually do this week</strong>
              <ul className="plan-list">
                {executionPriorities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {isPremium ? (
            <article className="weekly-plan-block">
              <p className="section-label">Plan rationale</p>
              <span className="section-chip">Why</span>
              <strong>Why Premium feels different</strong>
              <ul className="plan-list">
                {weeklyRationale.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {plan.habitAnchor ? <p className="muted">{plan.habitAnchor}</p> : null}
            </article>
          ) : null}
        </div>

        {isPremium ? (
          <div className="plan-preview-upgrade">
            <div>
              <p className="section-label">{accessTier === "trial_active" ? "Trial access active" : "Premium unlocked"}</p>
              <strong>{accessTier === "trial_active" ? "Your full weekly plan is active during the trial." : "Your full weekly plan is active."}</strong>
              <p className="muted">
                {accessTier === "trial_active"
                  ? `Your trial includes adaptive rationale, execution priorities, and richer weekly adjustments${user?.trialEndsLabel ? ` until ${user.trialEndsLabel}` : ""}. Then it renews yearly at $119.99/year unless canceled before trial ends.`
                  : "This plan now includes adaptive rationale, execution priorities, and richer weekly adjustments built from your latest data."}
              </p>
            </div>
          </div>
        ) : (
          <div className="plan-preview-upgrade">
            <UpgradePrompt compact prompt={weeklyPlanPrompt} onUpgrade={onUpgrade} />
          </div>
        )}
      </div>
    </div>
  );
}

```

## FILE: src/components/WorkoutDetailModal.jsx

`$ext
import React from "react";
import { getMovementMedia } from "../../shared/exerciseCatalog";

export default function WorkoutDetailModal({
  workout,
  onClose,
  onLog,
  onUpgrade,
  isSaving,
  onOpenMovement,
  accessTier = "free",
  canStartTrial = false,
  weeklyTarget = 2,
  guidanceLevel = "standard",
  workoutStreak = 0,
  weeklyWorkoutCount = 0,
  loggingLocked = false,
  loggingHint = "",
  completionExitLabel = "Return",
  isFavorite = false,
  onToggleFavorite
}) {
  const [selectedBySlot, setSelectedBySlot] = React.useState({});
  const [completedMap, setCompletedMap] = React.useState({});
  const [exerciseState, setExerciseState] = React.useState({});
  const [sessionComplete, setSessionComplete] = React.useState(false);
  const [completionLogged, setCompletionLogged] = React.useState(false);
  const [completionError, setCompletionError] = React.useState("");
  const [transitionMessage, setTransitionMessage] = React.useState("");
  const [swapCount, setSwapCount] = React.useState(0);
  const transitionTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (!workout) {
      setSelectedBySlot({});
      setCompletedMap({});
      setExerciseState({});
      setSessionComplete(false);
      return;
    }

    const selected = {};
    const state = {};
    workout.exercises.forEach((exercise) => {
      const slotKey = exercise.slotId || exercise.name;
      selected[slotKey] = exercise.name;
      state[slotKey] = {
        weight: exercise.lastLoad?.weight ?? "",
        repsCompleted: exercise.lastLoad?.repsCompleted || "",
        notes: ""
      };
    });
    setSelectedBySlot(selected);
    setCompletedMap({});
    setExerciseState(state);
    setSessionComplete(false);
    setCompletionLogged(false);
    setCompletionError("");
    setTransitionMessage("");
    setSwapCount(0);
  }, [workout]);

  React.useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    },
    []
  );

  if (!workout) {
    return null;
  }

  const selectedExercises = workout.exercises.map((exercise) => {
    const slotKey = exercise.slotId || exercise.name;
    const options = [exercise, ...(exercise.swapOptions || [])];
    const selected = options.find((option) => option.name === selectedBySlot[slotKey]) || exercise;
    return {
      ...selected,
      weight: exerciseState[slotKey]?.weight ?? selected.lastLoad?.weight ?? "",
      repsCompleted: exerciseState[slotKey]?.repsCompleted || "",
      notes: exerciseState[slotKey]?.notes || ""
    };
  });
  const phaseSections = buildPhaseSections(selectedExercises, workout.focus);
  const totalExercises = selectedExercises.length;
  const completedExercises = Object.values(completedMap).filter(Boolean).length;
  const allExercisesComplete = totalExercises > 0 && completedExercises === totalExercises;
  const currentExerciseIndex = Math.max(0, selectedExercises.findIndex((exercise) => !completedMap[exercise.slotId || exercise.name]));
  const activeExercise = sessionComplete ? null : selectedExercises[currentExerciseIndex] || null;
  const nextExercise = !sessionComplete ? selectedExercises[currentExerciseIndex + 1] || null : null;
  const progressLabel = sessionComplete ? "Session complete" : `Exercise ${Math.min(currentExerciseIndex + 1, totalExercises)} of ${totalExercises}`;
  const progressDetail = sessionComplete
    ? `${totalExercises} exercises finished | ${workout.duration} mins planned`
    : `${completedExercises} completed | ${Math.max(totalExercises - completedExercises, 0)} left`;
  const canReplayAndLog = !workout.loggedAt || Boolean(workout.presetId);
  const projectedWeeklyCount = completionLogged ? weeklyWorkoutCount + 1 : weeklyWorkoutCount;
  const showFirstSuccessTrigger = completionLogged && accessTier === "free" && canStartTrial && weeklyWorkoutCount === 0;
  const showUsedTrialTrigger = completionLogged && accessTier === "free" && !canStartTrial;
  const showSwapIntentPrompt = accessTier === "free" && swapCount >= 2 && !sessionComplete;
  const activeMedia = activeExercise ? getMovementMedia(activeExercise.movement || activeExercise) : null;

  const updateExerciseState = (slotKey, key, value) => {
    setExerciseState((current) => ({
      ...current,
      [slotKey]: {
        ...current[slotKey],
        [key]: value
      }
    }));
  };

  const toggleExerciseComplete = (exercise) => {
    if (sessionComplete) {
      return;
    }
    const slotKey = exercise.slotId || exercise.name;
    const nextComplete = !completedMap[slotKey];
    setCompletedMap((current) => ({
      ...current,
      [slotKey]: nextComplete
    }));
    if (nextComplete) {
      const nextIndex = selectedExercises.findIndex((entry) => (entry.slotId || entry.name) === slotKey) + 1;
      const nextName = selectedExercises[nextIndex]?.name;
      setTransitionMessage(nextName ? `Up next: ${nextName}` : "");
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = window.setTimeout(() => setTransitionMessage(""), 800);
    } else {
      setTransitionMessage("");
    }
  };

  const handleSwap = (exercise, nextName) => {
    const slotKey = exercise.slotId || exercise.name;
    setSwapCount((current) => current + 1);
    setSelectedBySlot((current) => ({
      ...current,
      [slotKey]: nextName
    }));
    setCompletedMap((current) => ({
      ...current,
      [slotKey]: false
    }));
  };

  const finalizeWorkout = async () => {
    setSessionComplete(true);
    setCompletionError("");
    if (canReplayAndLog && !loggingLocked) {
      try {
        await onLog(workout, selectedExercises, {
          closeOnSuccess: false,
          successMessage: "Workout complete."
        });
        setCompletionLogged(true);
      } catch (error) {
        setCompletionLogged(false);
        setCompletionError(error?.message || "Unable to save the workout.");
      }
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div aria-modal="true" className="modal-card workout-session-modal" role="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <p className="section-label">Workout session</p>
            <h3>{workout.name}</h3>
          </div>
          <div className="module-card-actions">
            {onToggleFavorite ? (
              <button className="ghost-button" type="button" onClick={(event) => onToggleFavorite(workout, event)}>
                {isFavorite ? "Saved workout" : "Save workout"}
              </button>
            ) : null}
            <button aria-label="Close workout session" className="icon-button" type="button" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="insight-chip">
            <strong>Type</strong>
            <p className="muted">{workout.type}</p>
          </div>
          <div className="insight-chip">
            <strong>Duration</strong>
            <p className="muted">{workout.duration} mins</p>
          </div>
          <div className="insight-chip">
            <strong>Setup</strong>
            <p className="muted">{workout.equipmentSummary || workout.equipmentProfile?.replaceAll("_", " ")}</p>
          </div>
          <div className="insight-chip">
            <strong>Intensity</strong>
            <p className="muted">{workout.intensity}</p>
          </div>
        </div>

        {workout.startPrompt ? (
          <div className="workout-start-callout">
            <span className="focus-step">Start here</span>
            <strong>{workout.startPrompt}</strong>
            {workout.continuityNote ? <p className="muted">{workout.continuityNote}</p> : null}
            {workout.varietyNote ? <p className="muted">{workout.varietyNote}</p> : null}
          </div>
        ) : null}

        {Array.isArray(workout.warmupBlock) && workout.warmupBlock.length ? (
          <div className="workout-support-block">
            <span className="focus-step">Optional warm-up</span>
            {workout.warmupBlock.map((entry) => (
              <div key={entry.name}>
                <strong>{entry.name}</strong>
                <p className="muted">{entry.detail}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="workout-progress-bar" aria-live="polite">
          <div className="workout-progress-copy">
            <strong>{progressLabel}</strong>
            <span className="muted">{progressDetail}</span>
          </div>
          <div className="workout-progress-track" aria-hidden="true">
            <span style={{ width: `${Math.max((completedExercises / Math.max(totalExercises, 1)) * 100, sessionComplete ? 100 : 8)}%` }} />
          </div>
          {transitionMessage ? <p className="workout-transition-note">{transitionMessage}</p> : null}
        </div>

        {!sessionComplete && activeExercise ? (
          <div className="workout-current-step workout-current-step-visual">
            <div className="workout-current-step-copy">
              <span className="focus-step">Current exercise</span>
              <strong>{activeExercise.name}</strong>
              <p className="muted">{getExerciseInstruction(activeExercise, guidanceLevel)}</p>
              <div className="exercise-signal-row">
                <span className="exercise-signal-pill">{activeExercise.movementPattern}</span>
                <span className="exercise-signal-pill">{activeExercise.equipment}</span>
                {activeExercise.lastLoad?.weight ? <span className="exercise-signal-pill">Used in your last session: {activeExercise.lastLoad.weight}</span> : null}
                {activeExercise.rehabSafe ? <span className="exercise-signal-pill">Joint-friendly option</span> : null}
              </div>
              {workout.lastTrainedLabel ? <p className="muted">{workout.lastTrainedLabel}</p> : null}
              {workout.partOfWeeklyPlan ? <p className="muted">Part of your weekly plan.</p> : null}
            </div>
            <div className="workout-current-step-visual-panel">
              <div className="exercise-visual-thumb exercise-visual-thumb-large">
                {activeMedia?.thumbnail ? (
                  <img alt={`${activeExercise.name} preview`} className="exercise-visual-thumb-image" src={activeMedia.thumbnail} />
                ) : (
                  <div className="exercise-visual-thumb-placeholder exercise-visual-thumb-placeholder-large">
                    <span>{activeMedia?.placeholderInitials || "MV"}</span>
                    <small>{activeMedia?.placeholderLabel || "Movement preview"}</small>
                  </div>
                )}
              </div>
              <div className="workout-current-step-meta">
                <span>{activeExercise.sets} sets</span>
                <span>{activeExercise.reps || activeExercise.duration || "Controlled reps"}</span>
                {nextExercise ? <span className="workout-next-chip">Up next: {nextExercise.name}</span> : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="exercise-phase-list">
          {phaseSections.map((section) => (
            <section className="exercise-phase-group" key={section.id}>
              <div className="exercise-phase-header">
                <span className="focus-step">{section.eyebrow}</span>
                <strong>{section.title}</strong>
                <p className="muted">{section.description}</p>
              </div>
              <div className="exercise-detail-list">
                {section.exercises.map(({ exercise, index }) => {
                  const slotKey = exercise.slotId || exercise.name;
                  const isCompleted = Boolean(completedMap[slotKey]) || sessionComplete;
                  const isActive = !sessionComplete && activeExercise && (activeExercise.slotId || activeExercise.name) === slotKey;
                  const movementMedia = getMovementMedia(exercise.movement || exercise);
                  const swapOptions = [exercise, ...(exercise.swapOptions || [])].filter(
                    (option) =>
                      option.name === selectedBySlot[slotKey] ||
                      !selectedExercises.some(
                        (selected) => selected.name === option.name && (selected.slotId || selected.name) !== slotKey
                      )
                  );

                  return (
                    <article
                      className={`exercise-detail-card exercise-detail-card-clickable ${isActive ? "exercise-detail-card-active" : ""} ${isCompleted ? "exercise-detail-card-complete" : ""}`}
                      key={slotKey}
                      role="button"
                      tabIndex={0}
                      onClick={() => exercise.movement && onOpenMovement?.(exercise.movement)}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && exercise.movement) {
                          event.preventDefault();
                          onOpenMovement?.(exercise.movement);
                        }
                      }}
                    >
                      <div className="exercise-detail-topline">
                        <label className="exercise-check-toggle" onClick={(event) => event.stopPropagation()}>
                          <input checked={isCompleted} type="checkbox" onChange={() => toggleExerciseComplete(exercise)} />
                          <span />
                        </label>
                        <div>
                          <span className="focus-step">{exercise.slotLabel || "Exercise"}</span>
                          <span className="exercise-pattern">{exercise.movementPattern}</span>
                        </div>
                        <span className="exercise-step-state">{isCompleted ? "Done" : isActive ? "Now" : "Next"}</span>
                      </div>

                      <div className="exercise-step-header">
                        <div className={`exercise-visual-thumb ${isActive ? "exercise-visual-thumb-active" : ""}`}>
                          {movementMedia.thumbnail ? (
                            <img alt={`${exercise.name} preview`} className="exercise-visual-thumb-image" src={movementMedia.thumbnail} />
                          ) : (
                            <div className="exercise-visual-thumb-placeholder">
                              <span>{movementMedia.placeholderInitials}</span>
                              <small>{movementMedia.placeholderLabel}</small>
                            </div>
                          )}
                        </div>
                        <div className="exercise-step-copy">
                          <strong>
                            {index + 1}. {exercise.name}
                          </strong>
                          <p className="exercise-purpose-line">{getExercisePurpose(exercise)}</p>
                        </div>
                      </div>

                      <p className="exercise-prescription">
                        {exercise.sets} sets
                        {exercise.reps ? ` | ${exercise.reps} reps` : ""}
                        {exercise.duration ? ` | ${exercise.duration}` : ""}
                      </p>

                      {guidanceLevel !== "minimal" ? <p className="muted">{getExerciseInstruction(exercise, guidanceLevel)}</p> : null}
                      <div className="exercise-signal-row">
                        <span className="exercise-signal-pill">{exercise.equipment}</span>
                        <span className="exercise-signal-pill">{exercise.muscleGroup}</span>
                        {exercise.lastLoad?.weight ? <span className="exercise-signal-pill">Used in your last session: {exercise.lastLoad.weight}</span> : null}
                        {exercise.rehabSafe ? <span className="exercise-signal-pill">Joint-friendly option</span> : null}
                        {exercise.availableSwapCount ? <span className="exercise-signal-pill">{exercise.availableSwapCount} alternatives available</span> : null}
                      </div>

                      <div className="workout-load-grid" onClick={(event) => event.stopPropagation()}>
                        <label>
                          Weight
                          <input
                            placeholder="0"
                            type="number"
                            value={exerciseState[slotKey]?.weight ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "weight", event.target.value)}
                          />
                        </label>
                        <label>
                          Reps done
                          <input
                            placeholder={exercise.reps || "Done"}
                            type="text"
                            value={exerciseState[slotKey]?.repsCompleted ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "repsCompleted", event.target.value)}
                          />
                        </label>
                      </div>

                      {guidanceLevel === "full" ? (
                        <label className="exercise-notes-field" onClick={(event) => event.stopPropagation()}>
                          Notes
                          <textarea
                            placeholder="How it felt, rep quality, pain notes..."
                            rows="2"
                            value={exerciseState[slotKey]?.notes ?? ""}
                            onChange={(event) => updateExerciseState(slotKey, "notes", event.target.value)}
                          />
                        </label>
                      ) : null}

                      {swapOptions.length > 1 ? (
                        <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                          Swap exercise{exercise.availableSwapCount ? ` (${exercise.availableSwapCount} options)` : ""}
                          <select value={selectedBySlot[slotKey] || exercise.name} onChange={(event) => handleSwap(exercise, event.target.value)}>
                            {swapOptions.map((option) => (
                              <option key={`${slotKey}-${option.name}`} value={option.name}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                          {exercise.familyOptionCount > 3 ? (
                            <span className="support-copy">More options in this movement family are ready when you want variety.</span>
                          ) : null}
                        </label>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {loggingLocked && loggingHint ? (
          <div className="limited-preview-banner workout-lock-banner">
            <span className="focus-step">Weekly free limit reached</span>
            <strong>{loggingHint}</strong>
          </div>
        ) : null}

        {showSwapIntentPrompt ? (
          <div className="module-note">
            <strong>Unlock full control with a 7-day trial.</strong>
            <p className="support-copy">Keep your swaps, session flow, and training continuity connected without hitting the free limit.</p>
          </div>
        ) : null}

        {sessionComplete ? (
          <div className="workout-complete-card">
            <span className="focus-step">Session complete</span>
            <strong>Workout complete.</strong>
            <p className="muted">
              {workout.focusLabel || workout.type} | {totalExercises} exercises | {workout.duration} mins
            </p>
            <p className="muted">
              {completionLogged
                ? "This session now counts toward your weekly progress."
                : loggingLocked
                  ? "You finished the session. Logging stays locked until your access resets or you upgrade."
                  : !canReplayAndLog
                    ? "This completed session stays available here as a review."
                    : completionError || "Finalizing your workout now."}
            </p>
            <p className="muted">
              {completionLogged
                ? projectedWeeklyCount > 1
                  ? `You have trained ${projectedWeeklyCount} times in the last 7 days.`
                  : "You are building consistency with a real completed session."
                : workoutStreak > 0
                  ? `Your ${workoutStreak}-day streak is still moving.`
                  : "Next session is ready when you are."}
            </p>
            <p className="muted">
              You have completed {projectedWeeklyCount} of {weeklyTarget} sessions this week. Next session keeps your week on track.
            </p>
            {showFirstSuccessTrigger ? (
              <div className="module-note">
                <strong>You completed your first session. Unlock the full system for the next 7 days.</strong>
                <p className="support-copy">Run unlimited workouts, keep your plan connected, and follow the full execution flow without interruption.</p>
                <div className="module-card-actions">
                  <button className="primary-button" type="button" onClick={() => onUpgrade?.("yearly", "default")}>
                    Start 7-day free trial
                  </button>
                </div>
              </div>
            ) : null}
            {showUsedTrialTrigger ? (
              <div className="module-note">
                <strong>Continue your training without limits.</strong>
                <p className="support-copy">Keep logging every session and keep your momentum connected across the week.</p>
                <div className="module-card-actions">
                  <button className="primary-button" type="button" onClick={() => onUpgrade?.("yearly", "upgrade_now")}>
                    Upgrade now
                  </button>
                </div>
              </div>
            ) : null}
            {Array.isArray(workout.cooldownBlock) && workout.cooldownBlock.length ? (
              <div className="workout-support-block">
                <span className="focus-step">Optional cooldown</span>
                {workout.cooldownBlock.map((entry) => (
                  <div key={entry.name}>
                    <strong>{entry.name}</strong>
                    <p className="muted">{entry.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="modal-actions">
              <button className="primary-button workout-nav-button" type="button" onClick={onClose}>
                {completionExitLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-actions">
            <button
              className="primary-button workout-nav-button"
              disabled={!allExercisesComplete || isSaving}
              type="button"
              onClick={finalizeWorkout}
            >
              {isSaving ? "Saving..." : `${workout.focusLabel || workout.name} completed`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function buildPhaseSections(exercises, workoutFocus) {
  if (!exercises.length) {
    return [];
  }

  if (workoutFocus === "mobility_recovery") {
    return [
      makePhase("warmup", "Warm-up", "Warm in", "Open the tightest area first so the rest of the flow feels smoother.", exercises.slice(0, 1), 0),
      makePhase("main", "Main work", "Main flow", "Spend the bulk of the session where you need the most support today.", exercises.slice(1, Math.max(exercises.length - 1, 1)), 1),
      ...(exercises.length > 2
        ? [makePhase("cooldown", "Cooldown", "Finish", "End with lower-stress movement so you leave the session feeling better.", exercises.slice(-1), exercises.length - 1)]
        : [])
    ].filter((section) => section.exercises.length);
  }

  const warmupCount = 1;
  const finisherCount = exercises.length >= 6 ? 1 : 0;
  const mainCount = Math.min(3, Math.max(exercises.length - warmupCount - finisherCount - 1, 2));
  const supportStart = warmupCount + mainCount;
  const finisherStart = exercises.length - finisherCount;

  return [
    makePhase("warmup", "Warm-up", "First", "Use the opener to groove the pattern before the harder work starts.", exercises.slice(0, warmupCount), 0),
    makePhase("main", "Main work", "Main work", "Give the anchor lifts the best focus and effort of the session.", exercises.slice(warmupCount, supportStart), warmupCount),
    makePhase("support", "Support work", "Support", "Round out the target muscles and keep the split complete.", exercises.slice(supportStart, finisherStart || exercises.length), supportStart),
    ...(finisherCount
      ? [makePhase("cooldown", "Optional finisher / cooldown", "Finish", "Close the session with a short final block if you still feel good.", exercises.slice(finisherStart), finisherStart)]
      : [])
  ].filter((section) => section.exercises.length);
}

function makePhase(id, title, eyebrow, description, exercises, offset) {
  return {
    id,
    title,
    eyebrow,
    description,
    exercises: exercises.map((exercise, index) => ({ exercise, index: offset + index }))
  };
}

function getExerciseInstruction(exercise, guidanceLevel) {
  if (guidanceLevel === "minimal") {
    return "Stay controlled and keep the reps clean.";
  }

  const movementInstruction = exercise.movement?.instructions?.[0];
  if (movementInstruction) {
    return movementInstruction;
  }

  const pattern = String(exercise.movementPattern || "").toLowerCase();
  if (pattern.includes("push")) {
    return guidanceLevel === "full"
      ? "Set your position first, control the lowering phase, and finish each rep with steady pressure."
      : "Control the lowering phase, then press smoothly.";
  }
  if (pattern.includes("pull")) {
    return guidanceLevel === "full"
      ? "Brace first, pull with your back, and avoid yanking the weight back into the start position."
      : "Pull with your back first and own the return.";
  }
  if (pattern.includes("squat")) {
    return guidanceLevel === "full"
      ? "Brace before the rep, stay balanced through the whole foot, and keep the descent and drive smooth."
      : "Brace, stay balanced, and keep the rep smooth.";
  }
  if (pattern.includes("hinge")) {
    return guidanceLevel === "full"
      ? "Keep the hinge long through the hips, maintain tension, and stand back up under control."
      : "Keep the hinge in the hips and stand up under control.";
  }
  if (pattern.includes("mobility")) {
    return guidanceLevel === "full"
      ? "Move slowly, breathe through the position, and stay in a pain-free range the whole time."
      : "Move slowly and stay in a pain-free range.";
  }
  return guidanceLevel === "full"
    ? "Move with control, keep the reps clean, and stay with the purpose of the slot."
    : "Move with control and keep the slot clean.";
}

function getExercisePurpose(exercise) {
  const pattern = String(exercise.movementPattern || "").toLowerCase();
  if (pattern.includes("push")) {
    return "Build pressing strength with a clean, repeatable pattern.";
  }
  if (pattern.includes("pull")) {
    return "Drive back tension and keep the pull balanced.";
  }
  if (pattern.includes("squat")) {
    return "Cover the main lower-body pattern for this session.";
  }
  if (pattern.includes("hinge")) {
    return "Train the posterior chain without losing position.";
  }
  if (pattern.includes("carry")) {
    return "Finish with trunk control and total-body tension.";
  }
  if (pattern.includes("rotate") || pattern.includes("core")) {
    return "Support trunk control and keep the session connected.";
  }
  if (pattern.includes("mobility")) {
    return "Open the movement pattern before the next harder block.";
  }
  return "Keep this slot clean so the whole workout flows well.";
}

```

## FILE: src/config/monetization.js

`$ext
export const FREE_FEATURES = [
  "Workout browsing with guided session previews",
  "2 workout logs each week",
  "Core mobility, nutrition, and recovery support",
  "Coach, progress, and weekly check-ins",
  "Limited weekly plan preview"
];

export const TRIAL_FEATURES = [
  "7 days of the real guided workout experience",
  "Unlimited workout logging during the trial",
  "Full weekly planning and smoother guided sessions",
  "Deeper workout rotation, swaps, and continuity",
  "Broader mobility, coach, and nutrition support"
];

export const PREMIUM_FEATURES = [
  "Full adaptive weekly plan",
  "Unlimited workout logging all week",
  "Smoother guided workout sessions from warm-up through completion",
  "Deeper exercise swap depth, smarter split rotation, and better continuity for your equipment",
  "Guided mobility and physio depth shaped by recovery and injury context",
  "Execution priorities and weekly rationale tied to your actual data",
  "Deeper coach reasoning linked to smarter weekly decisions",
  "Richer nutrition execution and smarter weekly adjustments"
];

export const BILLING_OPTIONS = [
  {
    id: "monthly",
    label: "Monthly",
    priceLabel: "$14.99 / month",
    helper: "Direct paid option"
  },
  {
    id: "yearly",
    label: "Yearly",
    priceLabel: "$119.99 / year",
    helper: "Best value - save 33%"
  }
];

export const TRIAL_MODEL = {
  days: 7,
  headline: "7-day free trial",
  summary:
    "Trial unlocks the full workout system for 7 days so you can keep your progress connected. Then auto-renews yearly at $119.99/year unless canceled before trial ends.",
  support:
    "Cancel before trial ends to return to Free. Monthly is available separately outside the trial renewal path."
};

export const PREMIUM_PREVIEW = {
  name: "PulsePeak Premium",
  badge: "Locked preview",
  cta: "Start trial"
};

```

## FILE: src/config/profileOptions.js

`$ext
import { EQUIPMENT_PROFILE_OPTIONS } from "../../shared/workoutEngine";

export const GOAL_OPTIONS = [
  {
    value: "strength",
    label: "Strength",
    description: "Bias the week toward heavier primary lifts and lower-rep strength work."
  },
  {
    value: "athletic_performance",
    label: "Athletic Performance",
    description: "Blend performance training, conditioning, and mobility in the weekly plan."
  },
  {
    value: "bodybuilding",
    label: "Bodybuilding",
    description: "Push volume, muscle targeting, and repeatable hypertrophy work."
  },
  {
    value: "fat_loss",
    label: "Fat Loss",
    description: "Use higher training frequency and cleaner nutrition structure."
  },
  {
    value: "general_fitness",
    label: "General Fitness",
    description: "Stay balanced across strength, recovery, and daily consistency."
  },
  {
    value: "mobility",
    label: "Mobility",
    description: "Keep the week lower intensity and movement-quality focused."
  },
  {
    value: "injury_recovery",
    label: "Injury Recovery",
    description: "Train safely with lower load, cleaner movement, and extra guardrails."
  },
  {
    value: "active_aging",
    label: "Active Aging",
    description: "Prioritize joint-friendly training and recovery-heavy pacing."
  }
];

export const AGE_GROUP_OPTIONS = ["18-29", "30-39", "40-49", "50+"];
export const EXPERIENCE_LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"];
export const TRAINING_ENVIRONMENT_OPTIONS = ["home", "gym", "hybrid"];
export { EQUIPMENT_PROFILE_OPTIONS };
export const SEX_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];
export const INJURY_STATUS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "minor", label: "Minor limitation" },
  { value: "active_injury", label: "Active injury" }
];
export const RESTRICTED_AREA_OPTIONS = ["knee", "shoulder", "back", "elbow", "hip", "ankle"];
export const NUTRITION_MODE_OPTIONS = [
  { value: "off", label: "Off", description: "Hide nutrition tracking from the dashboard." },
  { value: "basic", label: "Basic", description: "Track protein and hydration without full meal detail." },
  { value: "full", label: "Full", description: "Track calories, protein, and full meal logs." }
];

export const UNIT_PREFERENCE_OPTIONS = [
  { value: "imperial", label: "Imperial", description: "Use inches, pounds, and fluid ounces." },
  { value: "metric", label: "Metric", description: "Use centimeters, kilograms, and liters." }
];

```

## FILE: src/config/themes.js

`$ext
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

```

## FILE: src/config/upgradePrompts.js

`$ext
function hasModule(activeModules, id) {
  return new Set((activeModules || []).map((module) => module.id || module)).has(id);
}

function formatGoal(goalType) {
  const labels = {
    strength: "strength",
    athletic_performance: "athletic performance",
    bodybuilding: "body composition",
    fat_loss: "fat-loss",
    general_fitness: "general fitness",
    mobility: "mobility",
    injury_recovery: "injury recovery",
    active_aging: "active aging"
  };
  return labels[goalType] || "fitness";
}

function getAdaptiveValueBullets(profile = {}, activeModules = []) {
  const bullets = ["Full adaptive weekly plan", "Execution priorities tied to your real data", "Unlimited workout logging each week"];

  if (hasModule(activeModules, "nutrition")) {
    bullets.push(profile.nutritionMode === "full" ? "Richer calorie, protein, and fueling guidance" : "Deeper protein and hydration guidance");
  }

  if (hasModule(activeModules, "hydration")) {
    bullets.push("Hydration guidance that shifts with your current gaps");
  }

  if (hasModule(activeModules, "mobility") || profile.injuryStatus !== "none") {
    bullets.push("Mobility and recovery depth shaped by injury and movement context");
  }

  return Array.from(new Set(bullets)).slice(0, 4);
}

export function getUpgradePrompt({ surface, profile = {}, activeModules = [], coach = null, weeklyPlan = null, summary = null }) {
  const goalLabel = formatGoal(profile.goalType);
  const mobilityHeavy = hasModule(activeModules, "mobility") || profile.injuryStatus !== "none";
  const nutritionHeavy = hasModule(activeModules, "nutrition") || hasModule(activeModules, "hydration");
  const adaptiveBullets = getAdaptiveValueBullets(profile, activeModules);

  if (surface === "weekly-plan") {
    const title = mobilityHeavy
      ? "Unlock the full adaptive plan behind your recovery and mobility needs"
      : nutritionHeavy
        ? "Unlock the full adaptive plan behind your fueling and recovery data"
        : "Unlock the full adaptive weekly plan";

    const body = mobilityHeavy
        ? "Premium adds the deeper weekly rationale, execution priorities, guided mobility depth, and recovery-aware adjustments that help the week make better decisions."
      : nutritionHeavy
        ? "Premium adds the deeper weekly rationale, execution priorities, unlimited workout logging, and smarter hydration and fueling adjustments tied to your real data."
        : "Premium adds the deeper weekly rationale, unlimited workout logging, and execution priorities that explain exactly why the week is structured this way.";

    return {
      eyebrow: "Full system feature",
      title,
      body: `${body} Keep the week connected instead of stopping at the preview layer.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "workouts") {
    return {
      eyebrow: "Included in trial",
      title: "Run the full workout system without limits",
      body: "You are seeing only a small part of PulsePeak on Free. Keep logging sessions, keep your progress connected, and stop guessing what comes next.",
      bullets: [
        "Unlimited workout logging all week",
        "Full workout system access across all visible splits",
        "More exercise swap options without losing the workout structure",
        "Smoother guided sessions from warm-up through completion",
        mobilityHeavy ? "Broader recovery and physio-style support around harder sessions" : "Cleaner split guidance and smarter continuity tied to your setup"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "coach") {
    const category = coach?.primaryInsight?.category || "consistency";
    const titleMap = {
      hydration: "Unlock deeper coach reasoning around hydration and performance",
      nutrition: "Unlock deeper coach reasoning around fueling and recovery",
      recovery: "Unlock deeper coach reasoning around recovery and training load",
      training: "Unlock deeper coach reasoning around training decisions",
      consistency: "Unlock deeper coach reasoning tied to your weekly plan"
    };

    return {
      eyebrow: "Full system feature",
      title: titleMap[category] || titleMap.consistency,
      body: `Premium helps you keep momentum by showing the clearer why behind your ${goalLabel} decisions this week.`,
      bullets: [
        "Deeper why-this-matters explanations",
        "Coach reasoning tied back to your weekly plan",
        mobilityHeavy ? "Sharper recovery and mobility guardrails" : "More precise next actions from your current data"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "progress") {
    const streak = summary?.workoutStreak || 0;
    return {
      eyebrow: "Full system feature",
      title: streak >= 3 ? "See why your momentum is building" : "See what is actually moving your progress",
      body: "Premium makes it easier to keep your week moving by showing what is improving, what is slipping, and what to fix next.",
      bullets: [
        "Trend feedback tied to your weekly plan decisions",
        "Clearer why-your-trends-changed explanations",
        nutritionHeavy ? "Richer nutrition, hydration, and recovery context" : "Stronger next-step guidance from your patterns"
      ],
      ctaLabel: "Upgrade now"
    };
  }

  if (surface === "onboarding") {
    const title = mobilityHeavy
      ? "Your setup is ready. Premium goes deeper on recovery, mobility, and weekly planning."
      : nutritionHeavy
        ? "Your setup is ready. Premium goes deeper on fueling, recovery, and weekly planning."
        : "Your setup is ready. Premium unlocks the full adaptive layer behind it.";

    return {
      eyebrow: "Included in trial",
      title,
      body: `PulsePeak already knows you are focused on ${goalLabel}. Trial is the easiest way to keep the full system connected for the next 7 days.`,
      bullets: adaptiveBullets,
      ctaLabel: "Upgrade now"
    };
  }

  return null;
}

```

## FILE: src/hooks/useDashboardData.js

`$ext
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useDashboardData() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const payload = await apiRequest("/dashboard", {}, token);
      setData(payload.data);
      setSummary(payload.summary);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadDashboard();
  }, [token]);

  const mutate = async (path, options = {}) => {
    const payload = await apiRequest(path, options, token);
    setData(payload.data);
    setSummary(payload.summary);
    return payload;
  };

  return {
    data,
    summary,
    loading,
    error,
    reload: loadDashboard,
    mutate
  };
}

```

## FILE: src/hooks/useUpgradeCheckout.js

`$ext
import { useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useUpgradeCheckout() {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setBusy(true);
    try {
      const payload = await apiRequest(
        "/checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ billingInterval, checkoutMode })
        },
        token
      );

      if (payload.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }

      throw new Error("Unable to start Stripe Checkout.");
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    startUpgradeCheckout
  };
}

```

## FILE: src/lib/stripe.js

`$ext
import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

export function getStripeClient() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

```

## FILE: src/pages/AuthPage.jsx

`$ext
import React, { useState } from "react";
import { useAuth } from "../state/AuthContext";

export default function AuthPage() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await authenticate(mode, form);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <p className="badge">Real accounts, synced data, coaching</p>
        <h1>Build better health momentum with a fitness workspace that remembers you.</h1>
        <p className="hero-text">
          PulsePeak now includes authentication, persistent dashboard data, habit streaks, progress charts,
          and coaching recommendations tailored to your recovery and training trends.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <p className="section-label">{mode === "register" ? "Create your account" : "Welcome back"}</p>
          <h3>{mode === "register" ? "Start with a real PulsePeak account." : "Sign in to pick up where you left off."}</h3>
          <p className="muted">
            {mode === "register"
              ? "You will finish a short adaptive setup before landing in your personalized dashboard."
              : "Your dashboard, coach view, themes, and weekly plan stay synced to this account."}
          </p>
        </div>

        <div className="auth-toggle">
          <button className={mode === "login" ? "toggle-active" : ""} type="button" onClick={() => setMode("login")}>
            Sign in
          </button>
          <button className={mode === "register" ? "toggle-active" : ""} type="button" onClick={() => setMode("register")}>
            Create account
          </button>
        </div>

        <form className="stack-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Name
              <input
                autoComplete="name"
                placeholder="Jordan Walker"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              autoComplete="email"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder={mode === "register" ? "Create a secure password" : "Enter your password"}
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? (mode === "register" ? "Creating account..." : "Signing in...") : mode === "register" ? "Create PulsePeak account" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}

```

## FILE: src/pages/BillingCancelPage.jsx

`$ext
import React from "react";
import { Link } from "react-router-dom";

export default function BillingCancelPage() {
  return (
    <section className="panel billing-panel">
      <p className="badge">Checkout canceled</p>
      <h3>Your account is still on the free plan.</h3>
      <p className="muted">Nothing changed in your account. You can keep using the dashboard, coach, progress, and weekly-plan preview, then upgrade later if the deeper adaptive layer feels worth it.</p>
      <div className="module-note">
        <strong>Free access is still intact.</strong>
        <p className="muted">You can keep logging meals, workouts, recovery, and habits while using the preview flow before deciding to upgrade.</p>
      </div>
      <div className="billing-actions">
        <Link className="primary-button" to="/">
          Return to dashboard
        </Link>
        <Link className="ghost-button" to="/coach">
          Open coach
        </Link>
      </div>
    </section>
  );
}

```

## FILE: src/pages/BillingSuccessPage.jsx

`$ext
import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const { token, setUser, setDashboard, refreshSession } = useAuth();
  const [status, setStatus] = useState("confirming");
  const [message, setMessage] = useState("Confirming your PulsePeak access...");
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;

    const sessionId = searchParams.get("session_id");
    if (!token || !sessionId) {
      setStatus("error");
      setMessage("We could not verify your upgrade session.");
      return;
    }

    const run = async () => {
      try {
        const payload = await apiRequest(
          "/checkout/confirm",
          {
            method: "POST",
            body: JSON.stringify({ sessionId })
          },
          token
        );

        setUser(payload.user);
        setDashboard(payload.dashboard);
        if (payload.entitlementPending) {
          let syncedPayload = payload;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1500));
            syncedPayload = await refreshSession(token);
            if (hasPremiumAccess(syncedPayload?.user)) {
              break;
            }
          }

        if (hasPremiumAccess(syncedPayload?.user)) {
            setStatus("success");
            setMessage(
              isTrialAccess(syncedPayload?.user)
                ? "Your 7-day free trial is active. The full workout system is now available."
                : "Premium unlocked. Your full weekly plan is now available."
            );
          } else {
            setStatus("pending");
            setMessage("Your payment is complete. We're waiting for Stripe to finish syncing your Premium access.");
          }
        } else {
          setStatus("success");
          setMessage(
            isTrialAccess(payload?.user)
              ? "Your 7-day free trial is active. The full workout system is now available."
              : "Premium unlocked. Your full weekly plan is now available."
          );
        }
        await refreshSession(token);
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    };

    run();
  }, [searchParams, token, setUser, setDashboard, refreshSession]);

  return (
    <section className="panel billing-panel">
      <p className="badge">{status === "success" ? "Upgrade complete" : status === "pending" ? "Payment received" : "Billing status"}</p>
      <h3>{status === "success" ? "Your PulsePeak access is ready" : status === "pending" ? "We are finalizing your Premium access" : "We are checking your upgrade"}</h3>
      <p className="muted">{message}</p>
      <div className="module-note">
        <strong>{status === "success" ? "Your access now follows secure backend subscription state." : "Your access is being verified against Stripe."}</strong>
        <p className="muted">
          {status === "success"
            ? isTrialAccess(user)
              ? `Your trial includes the full workout system until ${user?.trialEndsLabel || "the trial ends"}. Then it renews yearly at $119.99/year unless canceled before trial ends.`
              : "You can now open the full adaptive weekly plan, use deeper coach reasoning, and keep the richer guidance synced to this account."
            : "If the upgrade takes a moment to appear, refresh once more after Stripe finishes syncing the subscription."}
        </p>
      </div>
      <div className="billing-actions">
        <Link className="primary-button" to="/">
          Go to dashboard
        </Link>
        <Link className="ghost-button" to="/coach">
          Open coach
        </Link>
      </div>
    </section>
  );
}

function hasPremiumAccess(user) {
  if (!user) {
    return false;
  }

  const tier = String(user.tier || "").toLowerCase().trim();
  const status = String(user.subscriptionStatus || "").toLowerCase().trim();
  return tier === "premium" || status === "active" || status === "trialing";
}

function isTrialAccess(user) {
  if (!user) {
    return false;
  }

  const accessTier = String(user.accessTier || "").toLowerCase().trim();
  const status = String(user.subscriptionStatus || "").toLowerCase().trim();
  return accessTier === "trial_active" || status === "trialing";
}

```

## FILE: src/pages/CoachPage.jsx

`$ext
import React, { useEffect, useState } from "react";
import Panel from "../components/Panel";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { useAuth } from "../state/AuthContext";

export default function CoachPage() {
  const { token, user, isPremium, dashboard } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const dismissalKey = React.useMemo(
    () => `pulsepeak-dismissed-coach-upgrade:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const { busy: checkoutBusy, startUpgradeCheckout } = useUpgradeCheckout();

  useEffect(() => {
    apiRequest("/coaching", {}, token)
      .then(setData)
      .catch((loadError) => setError(loadError.message));
  }, [token]);

  useEffect(() => {
    setShowUpgradePrompt(window.localStorage.getItem(dismissalKey) !== "true");
  }, [dismissalKey]);

  if (error) {
    return <div className="screen-center">{error}</div>;
  }

  if (!data) {
    return <div className="screen-center">Loading coaching...</div>;
  }

  const coachUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "coach",
        profile: dashboard?.profile,
        activeModules: dashboard?.summary?.activeModules || [],
        coach: data.coach,
        summary: dashboard?.summary
      });

  const dismissUpgradePrompt = () => {
    window.localStorage.setItem(dismissalKey, "true");
    setShowUpgradePrompt(false);
  };

  const handleUpgrade = async (billingInterval = "monthly", checkoutMode = "default") => {
    try {
      await startUpgradeCheckout(billingInterval, checkoutMode);
    } catch (upgradeError) {
      setError(upgradeError.message);
    }
  };

  return (
    <div className="page-grid">
      <Panel eyebrow="Coach summary" title="Use the coach to decide what matters most next">
        <div className="module-note">
          <strong>{isPremium ? "Premium coaching is active." : "Your core coaching view is active."}</strong>
          <p className="muted">
            {isPremium
              ? "You are seeing deeper cause-and-effect reasoning tied to your weekly plan, recovery pattern, and current gaps."
              : "You are seeing the clearest daily guidance first. Premium adds deeper reasoning behind the next move."}
          </p>
        </div>
      </Panel>

      <Panel eyebrow="Coach engine" title="What matters most right now">
        <section className={`coach-hero coach-${data.coach.primaryInsight.category}`}>
          <div className="coach-hero-copy">
            <p className="badge">{isPremium ? "Premium reasoning" : "Daily coaching"}</p>
            <h3>{data.coach.primaryInsight.title}</h3>
            <p className="coach-detail">{data.coach.primaryInsight.detail}</p>
          </div>
          <div className="coach-why-block">
            <span className="focus-step">Why it matters</span>
            <p>{data.coach.whyItMatters}</p>
          </div>
        </section>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Next actions" title="Do these next">
          <div className="coach-action-list">
            {data.coach.nextActions.map((action) => (
              <article className="coach-action-card" key={action.title}>
                <span className="focus-step">Action</span>
                <strong>{action.title}</strong>
                <p className="muted">{action.detail}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Longer-term pattern" title="What the coach is noticing">
          <div className="coach-notes">
            <div className="module-note">
              <strong>{data.coach.longerTermNote}</strong>
              <p className="muted">{data.coach.planConnection}</p>
            </div>
            <div className="insight-list">
              <div className="insight-chip">
                <strong>Energy</strong>
                <p className="muted">{data.recoveryFocus.energyLevel}</p>
              </div>
              <div className="insight-chip">
                <strong>Sleep</strong>
                <p className="muted">{data.recoveryFocus.sleepHours} hours</p>
              </div>
              <div className="insight-chip">
                <strong>Top habit</strong>
                <p className="muted">{data.recoveryFocus.topHabit}</p>
              </div>
            </div>
            {isPremium ? (
              <div className="coach-deeper-reasoning">
                <span className="focus-step">Premium depth</span>
                <p className="muted">Premium coaching connects your current gaps, recovery pattern, and weekly-plan logic into one clearer explanation.</p>
              </div>
            ) : null}
            <div className="coach-note-list">
              {data.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {!isPremium && showUpgradePrompt && coachUpgradePrompt ? (
        <UpgradePrompt prompt={coachUpgradePrompt} busy={checkoutBusy} onDismiss={dismissUpgradePrompt} onUpgrade={handleUpgrade} />
      ) : null}
    </div>
  );
}

```

## FILE: src/pages/DashboardPage.jsx

`$ext
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import ProgressRing from "../components/ProgressRing";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import WeeklyPlanPreviewModal from "../components/WeeklyPlanPreviewModal";
import MovementDetailModal from "../components/MovementDetailModal";
import MovementReference from "../components/MovementReference";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";

export default function DashboardPage() {
  const { token, user, isPremium, accessTier, isTrial } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const onboardingNudgeKey = useMemo(
    () => `pulsepeak-onboarding-upgrade-nudge:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showOnboardingUpgradePrompt, setShowOnboardingUpgradePrompt] = useState(
    () => window.sessionStorage.getItem(onboardingNudgeKey) === "true"
  );
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();

  useEffect(() => {
    setShowOnboardingUpgradePrompt(window.sessionStorage.getItem(onboardingNudgeKey) === "true");
  }, [onboardingNudgeKey]);

  useEffect(() => {
    if (!token || !data?.profile) {
      return;
    }

    const preferredEnvironment = data.profile.trainingEnvironment === "hybrid" ? "both" : data.profile.trainingEnvironment;
    const preferredFocus = summary?.workoutEngine?.recommendedFocus || "recommended";
    const preferredEquipment = Array.isArray(data.profile.equipmentSelections) ? data.profile.equipmentSelections.join(",") : "";
    setLibraryLoading(true);
    apiRequest(
      `/workout-library?environment=${preferredEnvironment}&equipmentSelections=${encodeURIComponent(preferredEquipment)}&focus=${preferredFocus}`,
      {},
      token
    )
      .then((payload) => {
        setRecommendedWorkout(payload.workouts[0] || null);
      })
      .catch(() => {
        setRecommendedWorkout(null);
      })
      .finally(() => setLibraryLoading(false));
  }, [token, data?.profile, summary?.workoutEngine?.recommendedFocus]);

  const todayFocus = summary?.todayFocus;
  const planSummary = summary?.planSummary;
  const mobilityModule = summary?.mobilityModule;
  const workoutEngine = summary?.workoutEngine;
  const workoutAccess = summary?.workoutAccess;
  const weeklyCheckIn = summary?.weeklyCheckIn;
  const appMode = data?.profile?.appMode || "full_system";
  const showMobilityDashboard = appMode !== "training_only";
  const showExpandedSupport = appMode === "full_system";
  const workoutsUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "workouts",
        profile: data?.profile,
        activeModules: summary?.activeModules,
        weeklyPlan: summary?.planSummary
      });
  const onboardingUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "onboarding",
        profile: data?.profile,
        activeModules: summary?.activeModules,
        weeklyPlan: summary?.planSummary
      });

  const todayTrainingBlocks = useMemo(() => planSummary?.suggestedWorkoutMix?.split || [], [planSummary]);
  const todayMobilityItems = useMemo(() => mobilityModule?.suggestedFlow?.slice(0, 3) || [], [mobilityModule]);
  const weeklySessionTarget = useMemo(() => {
    if (workoutAccess?.premiumUnlimited || workoutAccess?.trialUnlimited) {
      return Math.max(3, planSummary?.suggestedWorkoutMix?.split?.length || 3);
    }
    return workoutAccess?.limit || 2;
  }, [planSummary?.suggestedWorkoutMix?.split, workoutAccess]);
  const lastWorkoutAt = summary?.recentWorkouts?.[0]?.loggedAt || null;
  const returnGapDays = useMemo(() => {
    if (!lastWorkoutAt) {
      return null;
    }
    return Math.max(0, Math.floor((Date.now() - new Date(lastWorkoutAt).getTime()) / (1000 * 60 * 60 * 24)));
  }, [lastWorkoutAt]);
  const nextMove = useMemo(() => {
    if (workoutAccess?.locked) {
      return "Pick up where you left off and keep the week connected.";
    }
    if (returnGapDays >= 2) {
      return recommendedWorkout ? `Pick up where you left off with ${recommendedWorkout.name}.` : "Pick up where you left off with your next session.";
    }
    if (todayFocus?.actions?.length) {
      return todayFocus.actions[0];
    }
    if (recommendedWorkout) {
      return `Run your next ${recommendedWorkout.focusLabel?.toLowerCase() || "training"} session.`;
    }
    return "Continue training with the next session that fits today.";
  }, [todayFocus?.actions, todayFocus?.whyThisMatters, recommendedWorkout, returnGapDays, workoutAccess?.locked]);
  const trialReminder = useMemo(() => {
    if (!isTrial) {
      return null;
    }
    const days = workoutAccess?.trialDaysRemaining || 0;
    if (days <= 1) {
      return {
        title: "Your full access ends tomorrow.",
        body: `Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}. Then it renews yearly at $119.99/year unless canceled.`
      };
    }
    if (days <= 3) {
      return {
        title: `Trial ends in ${days} day${days === 1 ? "" : "s"}.`,
        body: `Keep your progress connected. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly unless canceled.`
      };
    }
    return {
      title: `Trial ends in ${days} days.`,
      body: `Your full access stays active until ${workoutAccess?.trialEndsLabel || "your renewal date"}.`
    };
  }, [isTrial, workoutAccess?.trialDaysRemaining, workoutAccess?.trialEndsLabel]);

  if (loading) {
    return <div className="screen-center">Loading today&apos;s dashboard...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load your dashboard."}</div>;
  }

  const openWeeklyPlan = async () => {
    setSaving("weekly-plan");
    setFeedback("");
    try {
      const payload = await apiRequest(
        "/weekly-plan",
        isPremium
          ? {}
          : {
              headers: {
                "X-Plan-Preview": "true"
              }
            },
        token
      );
      setWeeklyPlanState(payload);
    } catch (loadError) {
      setFeedback(loadError.message);
    } finally {
      setSaving("");
    }
  };

  const addPresetWorkout = async (workoutOrId, customExercises = null, options = {}) => {
    const workoutId = typeof workoutOrId === "string" ? workoutOrId : workoutOrId?.id;
    const workoutContext = typeof workoutOrId === "string" ? null : workoutOrId;
    const { closeOnSuccess = true, successMessage = "Workout logged." } = options;
    setSaving(`preset-${workoutId}`);
    setFeedback("");
    try {
      await mutate("/workouts/preset", {
        method: "POST",
        body: JSON.stringify({
          presetId: workoutId,
          environment: workoutContext?.environment,
          equipmentProfile: workoutContext?.equipmentProfile || data.profile.equipmentProfile,
          focus: workoutContext?.focus || workoutEngine?.recommendedFocus,
          exercises: customExercises
            ? customExercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup
              }))
            : undefined
        })
      });
      setFeedback(successMessage);
      if (closeOnSuccess) {
        setSelectedWorkout(null);
      }
    } catch (mutationError) {
      setFeedback(mutationError.message);
      throw mutationError;
    } finally {
      setSaving("");
    }
  };

  const startWorkoutSession = (workout) => {
    if (!workout) {
      return;
    }

    setSelectedWorkout(workout);
  };

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setFeedback("");
    try {
      await startUpgradeCheckoutFlow(billingInterval, checkoutMode);
    } catch (loadError) {
      setFeedback(loadError.message);
    }
  };

  const dismissOnboardingUpgradePrompt = () => {
    window.sessionStorage.removeItem(onboardingNudgeKey);
    setShowOnboardingUpgradePrompt(false);
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="today-hero">
        <div className="today-hero-copy">
          <p className="badge">Today</p>
          <h2>{workoutEngine?.recommendedFocusLabel || todayFocus?.title || "Keep the next workout decision simple and clear."}</h2>
          <p className="lead-copy">{workoutEngine?.recommendationReason || todayFocus?.reason || "PulsePeak is narrowing the day around the clearest training win first."}</p>
          <div className="hero-stats hero-stats-compact">
            <div className="stat-pill">
              <strong>
                {summary.workoutAccess?.trialUnlimited
                  ? `${summary.workoutAccess?.trialDaysRemaining || 0} days left`
                  : summary.workoutAccess?.premiumUnlimited
                    ? "Unlimited"
                    : `${summary.workoutAccess?.remaining ?? 0} left`}
              </strong>
              <span className="muted">Workout logs this week</span>
            </div>
            <div className="stat-pill">
              <strong>{summary.workoutStreak} days</strong>
              <span className="muted">Training streak</span>
            </div>
            <div className="stat-pill">
              <strong>{summary.habits.filter((habit) => habit.completedToday).length}</strong>
              <span className="muted">Habits done today</span>
            </div>
          </div>
        </div>

        <div className="today-hero-score">
          <p className="section-label">This week</p>
          <strong className="hero-mini-title">Consistency score</strong>
          <div className="ring-wrap">
            <ProgressRing value={summary.completion} />
          </div>
          <p className="hero-support-copy">{summary.resultProjection?.summary}</p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      {returnGapDays >= 2 ? (
        <div className="status-banner">
          <strong>Pick up where you left off. Your next session is ready.</strong>
          <p className="support-copy">
            {isPremium || isTrial
              ? "Continue training and keep your week moving."
              : "Start your 7-day free trial to keep your progress connected."}
          </p>
        </div>
      ) : null}

      {trialReminder ? (
        <div className="status-banner">
          <strong>{trialReminder.title}</strong>
          <p className="support-copy">{trialReminder.body}</p>
        </div>
      ) : null}

      {!isPremium && showOnboardingUpgradePrompt && onboardingUpgradePrompt ? (
        <UpgradePrompt
          compact
          prompt={onboardingUpgradePrompt}
          busy={checkoutBusy}
          onDismiss={dismissOnboardingUpgradePrompt}
          onUpgrade={startUpgradeCheckout}
        />
      ) : null}

      <div className="today-stack">
        <Panel
          eyebrow="Today&apos;s training direction"
          title={workoutEngine?.recommendedFocusLabel || planSummary?.weeklyFocus || "Your plan for today"}
          actions={
            <div className="module-card-actions">
              <button
                className="primary-button"
                disabled={recommendedWorkout ? Boolean(recommendedWorkout.lockedForAccess) : libraryLoading}
                type="button"
                onClick={() => (recommendedWorkout ? startWorkoutSession(recommendedWorkout) : null)}
              >
                {recommendedWorkout
                  ? recommendedWorkout.lockedForAccess
                    ? "Locked on Free"
                    : "Start workout"
                  : libraryLoading
                    ? "Loading..."
                    : "Open Workouts"}
              </button>
              <Link className="ghost-button module-link" to="/workouts">
                Open Workouts
              </Link>
            </div>
          }
        >
          <div className="section-context">
            <span className="section-context-label">Today</span>
            <p>{workoutEngine?.recommendationReason || "This is the highest-impact move for the next few hours, pulled from the larger weekly system below."}</p>
          </div>
          {workoutEngine?.continuityNote ? (
            <div className="module-note">
              <strong>{workoutEngine.continuityNote}</strong>
              <p className="support-copy">{workoutEngine.recentRotationNote}</p>
            </div>
          ) : null}
          <div className="today-sequence">
            <div className="today-sequence-card">
              <span className="focus-step">Where you are training</span>
              <strong>{data.profile.trainingEnvironment === "hybrid" ? "Hybrid setup" : data.profile.trainingEnvironment === "gym" ? "Gym" : "Home"}</strong>
              <p className="muted">{data.profile.equipmentProfile.replace(/_/g, " ")}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">What to train</span>
              <strong>{workoutEngine?.recommendedFocusLabel || todayFocus?.title}</strong>
              <p className="muted">{(workoutEngine?.alternateFocusLabels || []).join(" · ")}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">Start with</span>
              <strong>{recommendedWorkout?.name || "Open the workout engine"}</strong>
              <p className="muted">{recommendedWorkout ? `${recommendedWorkout.duration} mins · ${recommendedWorkout.intensity}` : todayFocus?.whyThisMatters}</p>
            </div>
            <div className="today-sequence-card">
              <span className="focus-step">Next move</span>
              <strong>{nextMove}</strong>
            </div>
          </div>
          <div className="module-note">
            <strong>
              You have completed {workoutAccess?.weeklyLogged || 0} of {weeklySessionTarget} sessions this week.
            </strong>
            <p className="support-copy">Your next session keeps the week on track.</p>
          </div>
        </Panel>

        {showMobilityDashboard ? (
        <Panel
          eyebrow="Today&apos;s mobility support"
          title={mobilityModule?.categories?.find((category) => category.id === mobilityModule?.suggestedCategory)?.label || "Guided mobility"}
          actions={
            <Link className="secondary-button module-link" to="/mobility">
              Open Mobility
            </Link>
          }
        >
          <div className="module-note">
            <strong>{planSummary?.mobilityBlock?.title || "Choose the guided movement layer that matches today."}</strong>
            <p className="support-copy">{planSummary?.mobilityBlock?.reason || mobilityModule?.description}</p>
          </div>
          <ul className="plan-list">
            {todayMobilityItems.map((item) => (
              <li key={`today-mobility-${item.name}`}>
                {item.movement ? (
                  <MovementReference compact movement={item.movement} onClick={setSelectedMovement} prefix={`${item.minutes} min`} />
                ) : (
                  `${item.name} · ${item.minutes} min`
                )}
              </li>
            ))}
          </ul>
        </Panel>
        ) : null}

        <Panel
          eyebrow="This week&apos;s split"
          title="The week broken into a simpler training structure"
          actions={
            <Link className="ghost-button module-link" to="/plan">
              Open Plan
            </Link>
          }
        >
          <div className="section-context">
            <span className="section-context-label">This week</span>
            <p>These blocks show the broader training direction so today feels connected to a real progression instead of a random session.</p>
          </div>
          <div className="today-sequence">
            {todayTrainingBlocks.length ? (
              todayTrainingBlocks.map((item) => (
                <div className="today-sequence-card" key={item}>
                  <span className="focus-step">Block</span>
                  <strong>{item}</strong>
                </div>
              ))
            ) : (
              <div className="today-sequence-card">
                <span className="focus-step">Block</span>
                <strong>{workoutEngine?.currentSplitSummary || "Keep training light and repeatable this week."}</strong>
              </div>
            )}
          </div>
          {planSummary?.suggestedWorkoutMix?.featuredMovements?.length ? (
            <div className="movement-chip-list">
              {planSummary.suggestedWorkoutMix.featuredMovements.map((movement) => (
                <MovementReference compact key={movement.id} movement={movement} onClick={setSelectedMovement} />
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel
          eyebrow="Today&apos;s recommended workout"
          title={recommendedWorkout?.name || "Your next recommended session"}
          actions={
            <Link className="secondary-button module-link" to="/workouts">
              Open Workouts
            </Link>
          }
        >
          <div className={`cap-banner compact-cap-banner ${workoutAccess?.locked ? "cap-banner-locked" : ""}`}>
            <strong>
              {workoutAccess?.trialUnlimited
                ? `Trial active: unlimited workout logging until ${workoutAccess?.trialEndsLabel || "your trial ends"}.`
                : workoutAccess?.premiumUnlimited
                  ? "Premium includes unlimited workout logging."
                  : `Free plan: ${workoutAccess?.weeklyLogged || 0} of ${workoutAccess?.limit || 2} logs used this week.`}
            </strong>
            <p className="support-copy">
              {workoutAccess?.trialUnlimited
                ? `You are using the full PulsePeak system right now. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly at $119.99/year unless canceled before trial ends.`
                : workoutAccess?.premiumUnlimited
                  ? "Preview, swap, and log as many sessions as you need."
                  : workoutAccess?.locked
                    ? workoutAccess?.canStartTrial
                      ? "Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity."
                      : `Previewing and exercise swaps still work, and logging resets on ${workoutAccess?.resetLabel}. Premium removes the cap and keeps your workout history moving.`
                    : `You still have ${workoutAccess?.remaining} workout log${workoutAccess?.remaining === 1 ? "" : "s"} left this week.`}
            </p>
          </div>
          {libraryLoading ? (
            <p className="support-copy">Finding today&apos;s best workout...</p>
          ) : recommendedWorkout ? (
            <div className="module-note">
              <strong>{recommendedWorkout.focusLabel} · {recommendedWorkout.environment} · {recommendedWorkout.duration} mins</strong>
              <p className="support-copy">{recommendedWorkout.summary}</p>
              {recommendedWorkout.continuityNote ? <p className="support-copy">{recommendedWorkout.continuityNote}</p> : null}
              {recommendedWorkout.varietyNote ? <p className="support-copy">{recommendedWorkout.varietyNote}</p> : null}
              <div className="module-card-actions">
                <button className="ghost-button" type="button" onClick={() => setSelectedWorkout(recommendedWorkout)}>
                  View details
                </button>
                <button
                  className="primary-button"
                  disabled={Boolean(recommendedWorkout.lockedForAccess)}
                  type="button"
                  onClick={() => startWorkoutSession(recommendedWorkout)}
                >
                  {recommendedWorkout.lockedForAccess ? "Locked on Free" : "Start workout"}
                </button>
              </div>
            </div>
          ) : (
            <p className="muted">No preset recommendation is available yet. Open the workout engine and choose the setup that matches today.</p>
          )}
          {!isPremium && !isTrial && !workoutAccess?.locked ? (
            <div className="module-note">
              <strong>Keep your training continuity intact.</strong>
              <p className="support-copy">
                Start your 7-day free trial after your next completed session if you want the full system to stay connected.
              </p>
            </div>
          ) : null}
          {!isPremium && workoutAccess?.locked && workoutsUpgradePrompt ? (
            <UpgradePrompt compact prompt={workoutsUpgradePrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
          ) : null}
        </Panel>

        {showExpandedSupport ? (
        <Panel eyebrow="Why this matters" title="Why PulsePeak is shaping the day this way">
          <div className="section-context">
            <span className="section-context-label">Why it works</span>
            <p>PulsePeak is combining your goal, recovery, equipment setup, and recent consistency so today&apos;s actions stay tied to a believable weekly result.</p>
          </div>
          <div className="content-grid">
            <div className="module-note">
              <strong>{summary.whyThisWorks?.trustNote}</strong>
              <p className="support-copy">{summary.whyThisWorks?.body}</p>
            </div>
            <div className="module-note">
              <strong>{summary.resultProjection?.summary}</strong>
              <p className="support-copy">{summary.resultProjection?.confidence}</p>
            </div>
          </div>
          {weeklyCheckIn ? (
            <div className="module-note">
              <strong>Weekly reflection</strong>
              <p className="support-copy">{weeklyCheckIn.todayConnection}</p>
            </div>
          ) : null}
          <div className="module-card-actions">
            <Link className="ghost-button module-link" to="/coach">
              Open Coach
            </Link>
            <Link className="ghost-button module-link" to="/progress">
              Open Progress
            </Link>
            <Link className="ghost-button module-link" to="/nutrition">
              Open Nutrition
            </Link>
          </div>
        </Panel>
        ) : null}
      </div>

      <WorkoutDetailModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onLog={addPresetWorkout}
        isSaving={saving === `preset-${selectedWorkout?.presetId || selectedWorkout?.id}`}
        onOpenMovement={setSelectedMovement}
        onUpgrade={startUpgradeCheckout}
        accessTier={accessTier}
        canStartTrial={Boolean(user?.canStartTrial)}
        weeklyTarget={weeklySessionTarget}
        workoutStreak={summary.workoutStreak}
        weeklyWorkoutCount={workoutAccess?.weeklyLogged || 0}
        loggingLocked={Boolean(workoutAccess?.locked)}
        completionExitLabel="Continue training"
        loggingHint={
          workoutAccess?.locked
            ? workoutAccess?.canStartTrial
              ? "You’ve hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
              : `Free logging resets on ${workoutAccess?.resetLabel}. Premium removes the weekly cap and keeps your workout continuity alive.`
            : ""
        }
      />
      <WeeklyPlanPreviewModal
        planPayload={weeklyPlanState}
        onClose={() => setWeeklyPlanState(null)}
        onUpgrade={startUpgradeCheckout}
        onOpenMovement={setSelectedMovement}
      />
      <MovementDetailModal guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}

```

## FILE: src/pages/HelpCenterPage.jsx

`$ext
import React from "react";
import Panel from "../components/Panel";
import { HELP_FAQ_CATEGORIES, HELP_SECTIONS } from "../content/helpCenterContent";

export default function HelpCenterPage() {
  return (
    <div className="page-grid">
      <section className="help-hero">
        <div>
          <p className="badge">Help Center</p>
          <h2>Learn how PulsePeak works without guessing.</h2>
          <p className="hero-text">
            This guide covers the product as it exists today, including free access, Premium weekly plan behavior,
            logging flows, coaching, and common troubleshooting steps.
          </p>
          <div className="help-hero-actions">
            <a className="secondary-button module-link" href="#getting-started">
              Start with setup
            </a>
            <a className="ghost-button module-link" href="#faq">
              Jump to FAQ
            </a>
          </div>
        </div>
      </section>

      <div className="help-layout">
        <aside className="help-sidebar">
          <div className="help-sidebar-card">
            <p className="section-label">On this page</p>
            <nav className="help-toc">
              {HELP_SECTIONS.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  {section.label}
                </a>
              ))}
              <a href="#faq">FAQ</a>
            </nav>
          </div>
        </aside>

        <div className="help-content">
          {HELP_SECTIONS.map((section) => (
            <Panel key={section.id} eyebrow={section.eyebrow} title={section.title}>
              <article className="help-section" id={section.id}>
                <p className="help-summary">{section.summary}</p>
                <div className="help-blocks">
                  {section.blocks.map((block) => (
                    <section className="help-block" key={block.title}>
                      <h4>{block.title}</h4>
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </section>
                  ))}
                </div>
              </article>
            </Panel>
          ))}

          <Panel eyebrow="Quick answers" title="Frequently asked questions">
            <article className="help-section" id="faq">
              <div className="faq-groups">
                {HELP_FAQ_CATEGORIES.map((category) => (
                  <section className="faq-group" key={category.id}>
                    <h4>{category.title}</h4>
                    <div className="faq-list">
                      {category.items.map((item) => (
                        <details className="faq-item" key={item.question}>
                          <summary>{item.question}</summary>
                          <p>{item.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </Panel>
        </div>
      </div>
    </div>
  );
}

```

## FILE: src/pages/MobilityPage.jsx

`$ext
import React, { useMemo, useState } from "react";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { useDashboardData } from "../hooks/useDashboardData";
import { getMovementMedia } from "../../shared/exerciseCatalog";
import { MOBILITY_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";

export default function MobilityPage() {
  const { data, summary, loading, error } = useDashboardData();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedTime, setSelectedTime] = useState("10");
  const [selectedRecovery, setSelectedRecovery] = useState("all");
  const [selectedFlowType, setSelectedFlowType] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedInjurySupport, setSelectedInjurySupport] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedSwaps, setSelectedSwaps] = useState({});
  const mobilityModule = summary?.mobilityModule || null;
  const categories = mobilityModule?.categories || [];
  const effectiveCategory = selectedCategory || mobilityModule?.suggestedCategory || categories[0]?.id || "stretching";
  const effectiveEnvironment = data?.profile?.trainingEnvironment || "hybrid";
  const guidanceLevel = data?.profile?.exerciseGuidanceLevel || "standard";
  const routines = mobilityModule?.library || [];

  const flowTypeOptions = useMemo(
    () => [
      { value: "all", label: "Any flow type" },
      { value: "full_body", label: "Full-body flow" },
      { value: "upper_body", label: "Upper-body flow" },
      { value: "lower_body", label: "Lower-body flow" },
      { value: "reset", label: "Reset flow" }
    ],
    []
  );
  const intensityOptions = useMemo(
    () => [
      { value: "all", label: "Any intensity" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Moderate" },
      { value: "high", label: "Strong" }
    ],
    []
  );
  const injurySupportOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.injurySupportOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions;
    }

    const options = Array.from(
      new Set(
        routines
          .filter((routine) => routine.supportTypes.includes("physiotherapy") || routine.supportTypes.includes("injury_specific"))
          .flatMap((routine) => routine.supportTopics || [])
      )
    );
    return [{ value: "all", label: "Any injury support" }, ...options.map((value) => ({ value, label: formatSupportTopic(value) }))];
  }, [mobilityModule?.filterOptions?.injurySupportOptions, routines]);

  const filteredRoutines = useMemo(() => {
    const normalizeSupportTopic = (value) => {
      const map = {
        wrist: "carpal_tunnel",
        elbow: "tennis_elbow",
        shoulder: "shoulder_irritation",
        knee: "knee_support",
        ankle: "ankle_stiffness",
        back: "lower_back",
        hip: "hip_tightness"
      };
      return map[value] || value;
    };

    const filtered = routines.filter((routine) => {
      if (!routine.supportTypes.includes(effectiveCategory)) {
        return false;
      }
      if (Number(selectedTime) && routine.minutes > Number(selectedTime)) {
        return false;
      }
      if (effectiveEnvironment !== "hybrid" && !routine.environments.includes(effectiveEnvironment) && !routine.environments.includes("hybrid")) {
        return false;
      }

      if (effectiveCategory === "yoga") {
        const flowType = getRoutineFlowType(routine);
        if (selectedFlowType !== "all" && flowType !== selectedFlowType) {
          return false;
        }
        if (selectedIntensity !== "all" && String(routine.recoveryFit || "").toLowerCase() !== selectedIntensity) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "stretching") {
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea) &&
          !(routine.supportTopics || []).includes(normalizeSupportTopic(selectedArea))
        ) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "physiotherapy") {
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea)
        ) {
          return false;
        }
        if (selectedInjurySupport !== "all" && !(routine.supportTopics || []).includes(selectedInjurySupport)) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "recovery") {
        if (selectedRecovery === "low" && routine.recoveryFit === "low") {
          return false;
        }
        if (selectedRecovery === "steady" && routine.recoveryFit === "high" && routine.phase === "recovery") {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "injury_specific") {
        if (selectedInjurySupport !== "all" && !(routine.supportTopics || []).includes(selectedInjurySupport)) {
          return false;
        }
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea)
        ) {
          return false;
        }
        return true;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      switch (selectedSort) {
        case "shortest":
          return (left.minutes || 0) - (right.minutes || 0);
        case "easiest":
          return rankRecoveryFit(left.recoveryFit) - rankRecoveryFit(right.recoveryFit);
        case "recovery_friendly":
          return rankRecoveryFit(right.recoveryFit) - rankRecoveryFit(left.recoveryFit);
        default:
          return 0;
      }
    });
  }, [effectiveCategory, effectiveEnvironment, routines, selectedArea, selectedFlowType, selectedInjurySupport, selectedIntensity, selectedRecovery, selectedSort, selectedTime]);

  const suggestedRoutines = useMemo(() => {
    const direct = filteredRoutines.slice(0, 4);
    if (direct.length >= 4) {
      return direct;
    }
    const fallback = routines.filter(
      (routine) => routine.supportTypes.includes(effectiveCategory) && !direct.some((entry) => entry.name === routine.name)
    );
    return [...direct, ...fallback.slice(0, 4 - direct.length)];
  }, [effectiveCategory, filteredRoutines, routines]);

  const suggestedRoutineCards = useMemo(
    () =>
      suggestedRoutines.map((routine) => ({
        routine,
        currentRoutine: selectedSwaps[routine.name] || routine,
        swapOptions: filteredRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase)
      })),
    [filteredRoutines, selectedSwaps, suggestedRoutines]
  );
  const totalSuggestedMinutes = suggestedRoutines.reduce((total, routine) => total + (routine.minutes || 0), 0);

  if (loading) {
    return <div className="screen-center">Loading mobility guidance...</div>;
  }

  if (!data || !summary || !mobilityModule) {
    return <div className="screen-center">{error || "Unable to load mobility guidance."}</div>;
  }

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Mobility</p>
          <h2>{mobilityModule?.title || "Guided movement support that fits today"}</h2>
          <p className="lead-copy">{getModeLeadCopy(effectiveCategory)}</p>
        </div>
      </section>

      <Panel eyebrow="Choose your mode" title="Guided mobility categories">
        <div className="section-context">
          <span className="section-context-label">Today&apos;s support</span>
          <p>{getModeSupportCopy(effectiveCategory)}</p>
        </div>
        <div className="selector-row">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${effectiveCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedArea("all");
                setSelectedRecovery("all");
                setSelectedFlowType("all");
                setSelectedIntensity("all");
                setSelectedInjurySupport("all");
              }}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>

        <div className="filter-bar discovery-filter-bar">
          {effectiveCategory === "yoga" ? (
            <>
              <label>
                Flow type
                <select value={selectedFlowType} onChange={(event) => setSelectedFlowType(event.target.value)}>
                  {flowTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Intensity
                <select value={selectedIntensity} onChange={(event) => setSelectedIntensity(event.target.value)}>
                  {intensityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "stretching" ? (
            <>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "physiotherapy" ? (
            <>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Injury support
                <select value={selectedInjurySupport} onChange={(event) => setSelectedInjurySupport(event.target.value)}>
                  {injurySupportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "recovery" ? (
            <>
              <label>
                Recovery state
                <select value={selectedRecovery} onChange={(event) => setSelectedRecovery(event.target.value)}>
                  {(mobilityModule?.filterOptions?.recoveryOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "injury_specific" ? (
            <>
              <label>
                Injury mapping
                <select value={selectedInjurySupport} onChange={(event) => setSelectedInjurySupport(event.target.value)}>
                  {injurySupportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          <label>
            Sort
            <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value)}>
              {MOBILITY_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Suggested today" title="Start here first">
          <div className="module-note">
            <strong>{mobilityModule?.sessionName || categories.find((category) => category.id === effectiveCategory)?.label || "Guided mobility"}</strong>
            <p className="support-copy">{getGuidedBlockSupportCopy(effectiveCategory)}</p>
            <p className="support-copy">Total session time: about {totalSuggestedMinutes} minutes.</p>
            {filteredRoutines.length > suggestedRoutines.length ? (
              <p className="support-copy">{filteredRoutines.length - suggestedRoutines.length} more drills are available in this support family if you want to swap or expand.</p>
            ) : null}
          </div>
          <div className="module-card-grid mobility-guided-grid">
            {suggestedRoutineCards.map(({ routine, currentRoutine, swapOptions }) => (
              <article
                className="module-card module-card-clickable"
                key={`suggested-${routine.name}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMovement(currentRoutine.movement || currentRoutine)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMovement(currentRoutine.movement || currentRoutine);
                  }
                }}
              >
                <p className="section-label">
                  {currentRoutine.group} · {currentRoutine.minutes} min
                </p>
                <div className="library-card-hero">
                  {renderMobilityPreview(currentRoutine)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">{currentRoutine.recoveryFit === "high" ? "Recovery-focused" : "Matches your current need"}</span>
                    <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} more in this flow` : "Guide ready"}</span>
                  </div>
                </div>
                <h4>{currentRoutine.name}</h4>
                <p className="support-copy">{currentRoutine.benefit}</p>
                <p className="support-copy">{effectiveCategory === "yoga" ? "Run this flow as the next step in your movement session." : "Open the guide, then run this drill with the same calm pace."}</p>
                <p className="support-copy">
                  {(currentRoutine.bodyAreas || []).length
                    ? `Best for: ${currentRoutine.bodyAreas.join(", ")}`
                    : currentRoutine.restrictedAreas.length
                      ? `Best for: ${currentRoutine.restrictedAreas.join(", ")}`
                      : "General recovery support"}
                </p>
                {swapOptions.length ? (
                  <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                    Swap drill
                    <select
                      value={currentRoutine.name}
                      onChange={(event) => {
                        const nextRoutine = [routine, ...swapOptions].find((entry) => entry.name === event.target.value) || routine;
                        setSelectedSwaps((current) => ({
                          ...current,
                          [routine.name]: nextRoutine
                        }));
                      }}
                    >
                      {[routine, ...swapOptions].map((option) => (
                        <option key={`${routine.name}-${option.name}`} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(currentRoutine.movement || currentRoutine); }}>
                  Open guide
                </button>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Why this matters" title="Keep the support work useful">
          <div className="module-note">
            <strong>{summary.planSummary?.mobilityBlock?.weeklyTarget || "Use mobility to improve the next training session, not just fill time."}</strong>
            <p className="support-copy">{summary.planSummary?.mobilityBlock?.reason || mobilityModule?.description}</p>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Library" title="Pick the exact flow you need">
        {filteredRoutines.length ? (
          <div className="module-card-grid">
            {filteredRoutines.map((routine) => {
              const swapOptions = filteredRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase);
              const currentRoutine = selectedSwaps[routine.name] || routine;
              return (
                <article
                  className="module-card module-card-clickable"
                  key={`${routine.name}-${routine.phase}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMovement(currentRoutine.movement || currentRoutine)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMovement(currentRoutine.movement || currentRoutine);
                    }
                  }}
                >
                  <p className="section-label">
                    {currentRoutine.group} · {currentRoutine.minutes} min
                  </p>
                  <div className="library-card-hero">
                    {renderMobilityPreview(currentRoutine)}
                    <div className="library-card-hero-copy">
                      <span className="library-depth-note">{currentRoutine.recoveryFit === "high" ? "Recovery-focused" : "Movement support ready"}</span>
                      <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} alternatives` : "Guide ready"}</span>
                    </div>
                  </div>
                  <h4>{currentRoutine.name}</h4>
                  <p className="support-copy">{currentRoutine.benefit}</p>
                  <p className="support-copy">{effectiveCategory === "yoga" ? "Follow this flow as a movement sequence." : "Start with this sequence and keep the tempo controlled."}</p>
                  <p className="support-copy">
                    {(currentRoutine.bodyAreas || []).length
                      ? `Best for: ${currentRoutine.bodyAreas.join(", ")}`
                      : currentRoutine.restrictedAreas.length
                        ? `Best for: ${currentRoutine.restrictedAreas.join(", ")}`
                        : "General recovery support"}
                  </p>
                  {swapOptions.length ? (
                    <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                      Swap drill
                      <select
                        value={currentRoutine.name}
                        onChange={(event) => {
                          const nextRoutine = [routine, ...swapOptions].find((entry) => entry.name === event.target.value) || routine;
                          setSelectedSwaps((current) => ({
                            ...current,
                            [routine.name]: nextRoutine
                          }));
                        }}
                      >
                        {[routine, ...swapOptions].map((option) => (
                          <option key={`${routine.name}-${option.name}`} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(currentRoutine.movement || currentRoutine); }}>
                    Open guide
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">No mobility drills match that filter combination yet. Loosen one filter and try again.</p>
        )}
      </Panel>

      <MovementDetailModal guidanceLevel={guidanceLevel} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}

function rankRecoveryFit(value) {
  const map = { low: 1, medium: 2, high: 3 };
  return map[String(value || "").toLowerCase()] || 2;
}

function getRoutineFlowType(routine) {
  if ((routine.bodyAreas || []).includes("full_body")) {
    return "full_body";
  }
  if ((routine.bodyAreas || []).some((area) => ["shoulder", "back", "wrist", "elbow"].includes(area))) {
    return "upper_body";
  }
  if ((routine.bodyAreas || []).some((area) => ["hip", "knee", "ankle"].includes(area))) {
    return "lower_body";
  }
  return "reset";
}

function formatSupportTopic(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function getModeLeadCopy(category) {
  if (category === "yoga") {
    return "Use yoga for flow-based movement sessions built from core poses, linked sequences, and deeper variations when you want a fuller movement practice.";
  }
  if (category === "stretching") {
    return "Use stretching for simple targeted lengthening before training, after training, or anytime one area feels tight.";
  }
  if (category === "physiotherapy") {
    return "Use physiotherapy for controlled, lower-risk drills that rebuild confidence around a specific joint or movement limitation.";
  }
  if (category === "recovery") {
    return "Use recovery for system-level support when soreness, fatigue, stiffness, or stress should drive the session.";
  }
  return "Use injury-specific support when you need stricter filtering around a known limitation instead of a general movement session.";
}

function getModeSupportCopy(category) {
  if (category === "yoga") {
    return "Yoga uses flow type, time, and intensity because it should feel like a real flow system with base poses, sequence options, and deeper variations, not targeted therapy.";
  }
  if (category === "stretching") {
    return "Stretching stays simple and direct: choose the area you want to open up and how long you have.";
  }
  if (category === "physiotherapy") {
    return "Physiotherapy stays highly targeted: choose the body area and the kind of injury support you need.";
  }
  if (category === "recovery") {
    return "Recovery is system-level. Choose how you feel and how much time you have instead of forcing strict body targeting.";
  }
  return "Injury-specific support stays structured around the issue you are managing, not broad wellness browsing.";
}

function getGuidedBlockSupportCopy(category) {
  if (category === "yoga") {
    return "These flows are built to move together as a sequence, so the top four cards all surface real session options immediately while the deeper pool handles variations and swap depth.";
  }
  if (category === "stretching") {
    return "These stretches are direct and targeted so you can quickly address the area that needs attention.";
  }
  if (category === "physiotherapy") {
    return "These drills are surfaced as real rehab-session items so each one feels equally actionable, not hidden in a text list.";
  }
  if (category === "recovery") {
    return "These recovery drills help reduce fatigue and stiffness without pretending every session has to target one joint.";
  }
  return "These support drills stay organized around the specific issue you selected so the session feels focused and safe.";
}

function renderMobilityPreview(routine) {
  const mediaView = getMovementMedia(routine.movement || routine);
  if (mediaView.thumbnail) {
    return <img alt={`${routine.name} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}

```

## FILE: src/pages/NutritionPage.jsx

`$ext
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import ActivityList from "../components/ActivityList";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { getNutritionTemplateMedia } from "../../shared/nutritionMedia";
import {
  convertHydrationToStored,
  formatHydration,
  normalizeUnitPreference
} from "../../shared/unitSystem";

function sanitizeNutritionText(value) {
  return String(value || "").replaceAll("Ã‚Â·", " - ").replaceAll("Â·", " - ");
}

export default function NutritionPage() {
  const { isPremium } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [saving, setSaving] = useState("");
  const [feedback, setFeedback] = useState("");
  const [proteinCheckIn, setProteinCheckIn] = useState({ source: "", protein: "" });

  if (loading) {
    return <div className="screen-center">Loading nutrition...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load nutrition."}</div>;
  }

  const nutritionMode = data.profile.nutritionMode || "off";
  const unitPreference = normalizeUnitPreference(data.profile.unitPreference);
  const hydrationStep = unitPreference === "metric" ? 0.5 : 16;
  const hydrationStepStored = convertHydrationToStored(hydrationStep, unitPreference);
  const guidance = summary.nutritionGuidance;
  const visibleTemplates = isPremium ? guidance?.templates || [] : (guidance?.templates || []).slice(0, 2);
  const todayDirectionSteps = isPremium
    ? [...(guidance?.todayDirection?.freeSteps || []), ...(guidance?.todayDirection?.premiumSteps || [])]
    : guidance?.todayDirection?.freeSteps || [];

  const addMeal = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSaving("meal");
    setFeedback("");
    try {
      await mutate("/meals", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          calories: Number(form.get("calories")),
          protein: Number(form.get("protein"))
        })
      });
      formElement.reset();
      setFeedback("Meal logged.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  const addProteinCheckIn = async (event) => {
    event.preventDefault();
    setSaving("protein");
    setFeedback("");
    try {
      await mutate("/protein-checkins", {
        method: "POST",
        body: JSON.stringify({
          source: proteinCheckIn.source,
          protein: Number(proteinCheckIn.protein)
        })
      });
      setProteinCheckIn({ source: "", protein: "" });
      setFeedback("Protein check-in logged.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  const addHydration = async () => {
    setSaving("hydration");
    setFeedback("");
    try {
      await mutate("/hydration", {
        method: "POST",
        body: JSON.stringify({ amount: hydrationStepStored })
      });
      setFeedback("Hydration updated.");
    } catch (mutationError) {
      setFeedback(mutationError.message);
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Nutrition</p>
          <h2>Turn your targets into food choices you can actually follow today.</h2>
          <p className="lead-copy">
            PulsePeak keeps the numbers practical, then turns them into a few repeatable meals, hydration moves, and simple timing choices that support training and recovery.
          </p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      {nutritionMode === "off" ? (
        <Panel eyebrow="Nutrition mode" title="Nutrition is currently turned off">
          <div className="module-note">
            <strong>Turn nutrition guidance back on if you want today&apos;s food direction, protein tracking, and hydration support to shape the week.</strong>
            <p className="support-copy">Use the quick action below if you want the nutrition layer back without digging through other settings.</p>
          </div>
          <div className="module-card-actions">
            <button
              className="primary-button"
              disabled={saving === "nutrition-show"}
              type="button"
              onClick={async () => {
                setSaving("nutrition-show");
                setFeedback("");
                try {
                  await mutate("/profile", {
                    method: "PATCH",
                    body: JSON.stringify({ nutritionMode: "basic" })
                  });
                  setFeedback("Nutrition guidance is back on.");
                } catch (mutationError) {
                  setFeedback(mutationError.message);
                } finally {
                  setSaving("");
                }
              }}
            >
              {saving === "nutrition-show" ? "Turning on..." : "Show nutrition guidance"}
            </button>
            <Link className="ghost-button module-link" to="/preferences">
              Edit preferences
            </Link>
          </div>
        </Panel>
      ) : (
        <>
          <div className="content-grid">
            <Panel eyebrow="Today's food direction" title={guidance?.todayDirection?.title || "Actionable nutrition guidance"}>
              <div className="section-context">
                <span className="section-context-label">Today</span>
                <p>{guidance?.todayDirection?.summary || "These are the easiest nutrition wins left for the day, based on the gaps PulsePeak still sees."}</p>
              </div>
              {todayDirectionSteps.length ? (
                <ul className="plan-list nutrition-action-list">
                  {todayDirectionSteps.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">Log a meal or hydration check-in to sharpen today's food direction.</p>
              )}
              {!isPremium ? (
                <div className="module-note nutrition-premium-note">
                  <strong>Premium adds tighter timing and recovery-aware food direction.</strong>
                  <p className="support-copy">Unlock smarter protein-gap fixes, better workout fueling suggestions, and more specific recovery support.</p>
                </div>
              ) : null}
              {guidance?.todaysActions?.length ? (
                <>
                  <p className="section-label">Quick execution moves</p>
                  <ul className="plan-list compact-plan-list">
                    {guidance.todaysActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Panel>

            <Panel eyebrow="Target guide" title="Numbers that fit the week">
              <div className="module-note">
                <strong>
                  {guidance?.proteinRangeLabel}
                  {nutritionMode === "full" && guidance?.calorieRangeLabel ? ` | ${guidance.calorieRangeLabel}` : ""}
                </strong>
                <p className="support-copy">{guidance?.why}</p>
              </div>
              <div className="module-note">
                <strong>Hydration floor: {guidance?.hydrationTargetLabel || formatHydration(data.goals.water, unitPreference)}</strong>
                <p className="support-copy">
                  Current intake: {formatHydration(data.waterIntake, unitPreference)}. Add a quick hydration step before your next meal or session.
                </p>
              </div>
              {guidance?.bodyProfileNote ? (
                <div className="module-note">
                  <strong>Built from your saved body profile</strong>
                  <p className="support-copy">{guidance.bodyProfileNote}</p>
                </div>
              ) : null}
            </Panel>
          </div>

          <div className="content-grid">
            <Panel eyebrow="Meal templates" title="Simple food options you can actually repeat">
              {visibleTemplates.length ? (
                <div className="module-card-grid nutrition-template-grid">
                  {visibleTemplates.map((template) => (
                    <article key={template.id || template.title} className="module-card nutrition-template-card">
                      {getNutritionTemplateMedia(template.id)?.image ? (
                        <img
                          alt={getNutritionTemplateMedia(template.id)?.alt || `${template.title} example`}
                          className="nutrition-template-image"
                          src={getNutritionTemplateMedia(template.id).image}
                        />
                      ) : null}
                      <p className="section-label">{template.title}</p>
                      <strong>{template.combo}</strong>
                      <p className="support-copy">{sanitizeNutritionText(template.nutrition)}</p>
                      <p className="support-copy">{template.whenToUse}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="support-copy">Nutrition templates will show up once your targets and meal data give the plan something to work with.</p>
              )}
              {guidance?.mealDirection?.length ? (
                <>
                  <p className="section-label">How to use them this week</p>
                  <ul className="plan-list">
                    {guidance.mealDirection.map((direction) => (
                      <li key={direction}>{direction}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {!isPremium && (guidance?.templates || []).length > visibleTemplates.length ? (
                <div className="module-note nutrition-premium-note">
                  <strong>Premium shows the fuller nutrition playbook.</strong>
                  <p className="support-copy">You will see the extra template options and more specific recovery and workout-fueling direction.</p>
                </div>
              ) : null}
            </Panel>

            <Panel eyebrow="Hydration" title="Simple hydration support">
              <div className="module-note">
                <strong>{formatHydration(data.waterIntake, unitPreference)} / {formatHydration(data.goals.water, unitPreference)}</strong>
                <p className="support-copy">Use one quick hydration action instead of trying to catch up all at once.</p>
              </div>
              <button className="primary-button" disabled={saving === "hydration"} type="button" onClick={addHydration}>
                {saving === "hydration" ? "Updating..." : `Add ${unitPreference === "metric" ? "500 mL" : "16 oz"}`}
              </button>
            </Panel>
          </div>

          {nutritionMode === "full" ? (
            <Panel eyebrow="Meals" title="Full nutrition logging">
              <form className="stack-form" onSubmit={addMeal}>
                <label>
                  Meal or snack
                  <input maxLength="40" name="name" placeholder="Chicken grain bowl" required type="text" />
                </label>
                <div className="form-grid compact">
                  <label>
                    Calories
                    <input min="0" name="calories" required step="10" type="number" />
                  </label>
                  <label>
                    Protein (g)
                    <input min="0" name="protein" required step="1" type="number" />
                  </label>
                </div>
                <button className="primary-button" disabled={saving === "meal"} type="submit">
                  {saving === "meal" ? "Logging..." : "Log meal"}
                </button>
              </form>
              <ActivityList
                items={data.meals}
                emptyMeta="Add your first meal to start tracking nutrition."
                emptyTitle="No meals logged yet"
                onRemove={(id) => mutate(`/meals/${id}`, { method: "DELETE" })}
                renderMeta={(item) => `${item.calories} kcal | ${item.protein}g protein`}
              />
            </Panel>
          ) : (
            <Panel eyebrow="Protein check-ins" title="Keep the nutrition layer light">
              <form className="stack-form" onSubmit={addProteinCheckIn}>
                <label>
                  Protein source
                  <input
                    maxLength="40"
                    placeholder="Greek yogurt"
                    type="text"
                    value={proteinCheckIn.source}
                    onChange={(event) => setProteinCheckIn((current) => ({ ...current, source: event.target.value }))}
                  />
                </label>
                <label>
                  Protein grams
                  <input
                    min="5"
                    required
                    step="1"
                    type="number"
                    value={proteinCheckIn.protein}
                    onChange={(event) => setProteinCheckIn((current) => ({ ...current, protein: event.target.value }))}
                  />
                </label>
                <button className="primary-button" disabled={saving === "protein"} type="submit">
                  {saving === "protein" ? "Logging..." : "Log protein check-in"}
                </button>
              </form>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

```

## FILE: src/pages/OnboardingPage.jsx

`$ext
import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "../components/OnboardingFlow";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return <OnboardingFlow mode="onboarding" onComplete={() => navigate("/", { replace: true })} />;
}

```

## FILE: src/pages/PlanPage.jsx

`$ext
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel";
import WeeklyPlanPreviewModal from "../components/WeeklyPlanPreviewModal";
import MovementDetailModal from "../components/MovementDetailModal";
import UpgradePrompt from "../components/UpgradePrompt";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { apiRequest } from "../api/client";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { getMovementMedia } from "../../shared/exerciseCatalog";
import { PLAN_DISCOVERY_CATEGORIES, PLAN_LIBRARY, TOOL_CATEGORIES, TOOL_LIBRARY } from "../../shared/libraryTaxonomy.js";

export default function PlanPage() {
  const { token, isPremium } = useAuth();
  const { data, summary, loading, error } = useDashboardData();
  const [weeklyPlanState, setWeeklyPlanState] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [opening, setOpening] = useState(false);
  const [selectedPlanCategory, setSelectedPlanCategory] = useState("all");
  const [selectedGoalFilter, setSelectedGoalFilter] = useState("all");
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState("all");
  const [selectedRecoveryFilter, setSelectedRecoveryFilter] = useState("all");
  const [selectedEnvironmentFilter, setSelectedEnvironmentFilter] = useState("all");
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const safeProfile = data?.profile || {};
  const safeSummary = summary || {};
  const planLibrary = useMemo(() => {
    const goalType = safeProfile.goalType || "general_fitness";
    const equipmentProfile = safeProfile.equipmentProfile || "hybrid";
    const environment = safeProfile.trainingEnvironment || "hybrid";
    const recoveryBias = safeProfile.injuryStatus !== "none" ? "joint_friendly" : "balanced";

    return PLAN_LIBRARY.filter((plan) => {
      const categoryMatch = selectedPlanCategory === "all" || plan.category === selectedPlanCategory;
      const goalMatch = selectedGoalFilter === "all" || plan.goal === selectedGoalFilter;
      const equipmentMatch = selectedEquipmentFilter === "all" || plan.equipment.includes(selectedEquipmentFilter);
      const recoveryMatch = selectedRecoveryFilter === "all" || plan.recoveryProfile === selectedRecoveryFilter;
      const environmentMatch = selectedEnvironmentFilter === "all" || plan.environment.includes(selectedEnvironmentFilter);
      return categoryMatch && goalMatch && equipmentMatch && recoveryMatch && environmentMatch;
    }).sort((left, right) => {
      const leftScore = rankPlan(left, { goalType, equipmentProfile, environment, recoveryBias });
      const rightScore = rankPlan(right, { goalType, equipmentProfile, environment, recoveryBias });
      return rightScore - leftScore;
    });
  }, [safeProfile, selectedPlanCategory, selectedGoalFilter, selectedEquipmentFilter, selectedRecoveryFilter, selectedEnvironmentFilter]);
  const toolsByCategory = useMemo(
    () =>
      TOOL_CATEGORIES.map((category) => ({
        ...category,
        items: TOOL_LIBRARY.filter((tool) => tool.category === category.id)
      })),
    []
  );

  if (loading) {
    return <div className="screen-center">Loading your plan...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load your weekly plan."}</div>;
  }

  const weeklyPlanPrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "weekly-plan",
        profile: safeProfile,
        activeModules: safeSummary.activeModules,
        weeklyPlan: safeSummary.planSummary
      });

  const openWeeklyPlan = async () => {
    setOpening(true);
    setFeedback("");
    try {
      const payload = await apiRequest(
        "/weekly-plan",
        isPremium
          ? {}
          : {
              headers: {
                "X-Plan-Preview": "true"
              }
            },
        token
      );
      setWeeklyPlanState(payload);
    } catch (loadError) {
      setFeedback(loadError.message);
    } finally {
      setOpening(false);
    }
  };

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setFeedback("");
    try {
      await startUpgradeCheckoutFlow(billingInterval, checkoutMode);
    } catch (loadError) {
      setFeedback(loadError.message);
    }
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Plan</p>
          <h2>{summary.planSummary?.weeklyFocus || "Your adaptive weekly plan"}</h2>
          <p className="lead-copy">
            This week stays centered on the work that matters most for your goal, recovery, and training setup.
          </p>
        </div>
        <div className="module-page-actions">
          <button className="primary-button" disabled={opening} type="button" onClick={openWeeklyPlan}>
            {opening ? "Opening plan..." : isPremium ? "Open full weekly plan" : "Preview weekly plan"}
          </button>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      <div className="content-grid">
        <Panel eyebrow="This week" title={summary.planSummary?.weeklyFocus || "Weekly focus"}>
          <div className="section-context">
            <span className="section-context-label">Weekly strategy</span>
            <p>Use this as the target for the week so your workouts, mobility work, and recovery all pull in the same direction.</p>
          </div>
          <div className="module-note">
            <strong>{summary.planSummary?.workoutCadence || "Keep the week simple and repeatable."}</strong>
            <p className="support-copy">{summary.planSummary?.focusReason || summary.todayFocus?.whyThisMatters}</p>
          </div>
          {summary.planSummary?.suggestedWorkoutMix?.intensityGuidance ? (
            <div className="module-note">
              <strong>Intensity direction</strong>
              <p className="support-copy">{summary.planSummary.suggestedWorkoutMix.intensityGuidance}</p>
            </div>
          ) : null}
          {summary.planSummary?.mobilityBlock?.weeklyTarget ? (
            <div className="module-note">
              <strong>Mobility target</strong>
              <p className="support-copy">{summary.planSummary.mobilityBlock.weeklyTarget}</p>
            </div>
          ) : null}
          {summary.planSummary?.suggestedWorkoutMix?.recommendedFocuses?.length ? (
            <div className="module-note">
              <strong>Suggested split options</strong>
              <p className="support-copy">{summary.planSummary.suggestedWorkoutMix.recommendedFocuses.join(" · ")}</p>
            </div>
          ) : null}
          <ul className="plan-list">
            {(summary.planSummary?.suggestedWorkoutMix?.split || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {summary.weeklyCheckIn?.nextWeekAdjustments?.length ? (
            <div className="module-note">
              <strong>What the weekly check-in is changing</strong>
              <p className="support-copy">{summary.weeklyCheckIn.nextWeekAdjustments[0]}</p>
            </div>
          ) : null}
        </Panel>

        <Panel eyebrow="Why this works" title="Built from your actual data">
          <div className="module-note">
            <strong>{summary.whyThisWorks?.trustNote}</strong>
            <p className="support-copy">{summary.whyThisWorks?.body}</p>
          </div>
          {summary.resultProjection ? (
            <div className="module-note">
              <strong>{summary.resultProjection.summary}</strong>
              <p className="support-copy">{summary.resultProjection.confidence}</p>
            </div>
          ) : null}
        </Panel>
      </div>

      {summary.planSummary?.suggestedWorkoutMix?.featuredMovements?.length ? (
        <Panel eyebrow="Movement highlights" title="The week is built around these key patterns">
          <div className="section-context">
            <span className="section-context-label">Start-to-finish guides</span>
            <p>Open any movement to see the full visual sequence, cues, and example video support before you train.</p>
          </div>
          <div className="module-card-grid">
            {summary.planSummary.suggestedWorkoutMix.featuredMovements.map((movement) => {
              const mediaView = getMovementMedia(movement);
              return (
                <article
                  className="module-card module-card-clickable"
                  key={movement.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMovement(movement)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMovement(movement);
                    }
                  }}
                >
                  <div className="library-card-hero">
                    {mediaView.thumbnail ? (
                      <img alt={`${movement.name} preview`} className="library-card-thumb" src={mediaView.thumbnail} />
                    ) : (
                      <div className="library-card-thumb library-card-thumb-placeholder">
                        <span>{mediaView.placeholderInitials}</span>
                        <small>{mediaView.placeholderLabel}</small>
                      </div>
                    )}
                    <div className="library-card-hero-copy">
                      <span className="library-depth-note">Built into this week&apos;s plan</span>
                      <span className="library-depth-note">
                        {mediaView.hasVideo ? "Video example available" : "4-step movement guide ready"}
                      </span>
                    </div>
                  </div>
                  <p className="section-label">{movement.category}</p>
                  <h4>{movement.name}</h4>
                  <p className="support-copy">
                    {movement.primaryMuscles.join(", ")}
                    {movement.secondaryMuscles?.length ? ` · Supports ${movement.secondaryMuscles[0]}` : ""}
                  </p>
                  <div className="module-card-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedMovement(movement);
                      }}
                    >
                      Open guide
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <Panel eyebrow="Plan library" title="Browse original PulsePeak training paths">
        <div className="section-context">
          <span className="section-context-label">Plan discovery</span>
          <p>Browse the paths that best fit your goal, schedule, equipment, and recovery style, then let the weekly plan shape workouts, mobility, and your next move.</p>
        </div>
        <div className="selector-row">
          <button
            className={`selector-pill ${selectedPlanCategory === "all" ? "selector-pill-active" : ""}`}
            type="button"
            onClick={() => setSelectedPlanCategory("all")}
          >
            <strong>All plan paths</strong>
            <span>See the broader plan library</span>
          </button>
          {PLAN_DISCOVERY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedPlanCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedPlanCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <label>
            Goal
            <select value={selectedGoalFilter} onChange={(event) => setSelectedGoalFilter(event.target.value)}>
              <option value="all">Any goal</option>
              <option value="general_fitness">General fitness</option>
              <option value="strength">Strength</option>
              <option value="bodybuilding">Build muscle</option>
              <option value="fat_loss">Lose fat</option>
              <option value="mobility">Mobility</option>
              <option value="athletic_performance">Performance</option>
            </select>
          </label>
          <label>
            Equipment
            <select value={selectedEquipmentFilter} onChange={(event) => setSelectedEquipmentFilter(event.target.value)}>
              <option value="all">Any setup</option>
              <option value="bodyweight">Bodyweight</option>
              <option value="dumbbells_only">Dumbbells only</option>
              <option value="bench_dumbbells">Bench + dumbbells</option>
              <option value="hybrid">Hybrid setup</option>
              <option value="full_gym">Full gym</option>
            </select>
          </label>
          <label>
            Recovery emphasis
            <select value={selectedRecoveryFilter} onChange={(event) => setSelectedRecoveryFilter(event.target.value)}>
              <option value="all">Any recovery profile</option>
              <option value="balanced">Balanced</option>
              <option value="joint_friendly">Joint-friendly</option>
              <option value="recovery_focused">Recovery-focused</option>
              <option value="performance">Performance support</option>
            </select>
          </label>
          <label>
            Environment
            <select value={selectedEnvironmentFilter} onChange={(event) => setSelectedEnvironmentFilter(event.target.value)}>
              <option value="all">Home or gym</option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
        </div>
        <div className="module-card-grid">
          {planLibrary.slice(0, 9).map((plan) => (
            <article className="module-card" key={plan.id}>
              <p className="section-label">{plan.title}</p>
              <h4>{formatPlanCategory(plan.category)}</h4>
              <p className="support-copy">{plan.summary}</p>
              <p className="support-copy">
                {plan.guidance.focus}
              </p>
              <p className="support-copy">
                Works best with {plan.equipment.map((item) => item.replaceAll("_", " ")).join(", ")} · {plan.recoveryProfile.replaceAll("_", " ")}
              </p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Tools" title="Use the support tools that keep the system practical">
        <div className="section-context">
          <span className="section-context-label">Support layer</span>
          <p>These tools keep history, progression, recovery, and daily decisions easy to return to without turning the app into clutter.</p>
        </div>
        <div className="module-card-grid">
          {toolsByCategory.map((category) => (
            <article className="module-card" key={category.id}>
              <p className="section-label">{category.label}</p>
              <h4>{category.description}</h4>
              <ul className="plan-list compact-plan-list">
                {category.items.map((tool) => (
                  <li key={tool.id}>
                    <Link className="module-link" to={tool.to}>
                      {tool.title}
                    </Link>
                    <span className="support-copy">{tool.summary}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Panel>

      {!isPremium && weeklyPlanPrompt ? (
        <UpgradePrompt compact prompt={weeklyPlanPrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
      ) : null}

      <WeeklyPlanPreviewModal
        planPayload={weeklyPlanState}
        onClose={() => setWeeklyPlanState(null)}
        onUpgrade={startUpgradeCheckout}
        onOpenMovement={setSelectedMovement}
      />
      <MovementDetailModal movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}

function rankPlan(plan, { goalType, equipmentProfile, environment, recoveryBias }) {
  let score = 0;
  if (plan.goal === goalType) score += 5;
  if (plan.equipment.includes(equipmentProfile)) score += 4;
  if (plan.environment.includes(environment)) score += 3;
  if (plan.recoveryProfile === recoveryBias) score += 2;
  return score;
}

function formatPlanCategory(value) {
  return PLAN_DISCOVERY_CATEGORIES.find((category) => category.id === value)?.label || value.replaceAll("_", " ");
}

```

## FILE: src/pages/PreferencesPage.jsx

`$ext
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Panel from "../components/Panel";
import DashboardControlsPanel from "../components/DashboardControlsPanel";
import OnboardingFlow from "../components/OnboardingFlow";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { apiRequest } from "../api/client";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { THEME_OPTIONS, applyThemePreference, getStoredThemePreference } from "../config/themes";
import { APP_MODE_OPTIONS } from "../../shared/appModes.js";

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { token, user, logout, isPremium } = useAuth();
  const { data, summary, mutate } = useDashboardData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "preferences";
  const [theme, setTheme] = React.useState(() => getStoredThemePreference());
  const [saving, setSaving] = React.useState("");
  const [billingBusy, setBillingBusy] = React.useState(false);
  const [billingError, setBillingError] = React.useState("");
  const { busy: upgradeBusy, startUpgradeCheckout } = useUpgradeCheckout();
  const profile = data?.profile || {};

  const openSection = (section) => {
    setSearchParams({ section });
  };

  const changeTheme = (nextTheme) => {
    setTheme(applyThemePreference(nextTheme));
  };

  const updateProfilePreference = async (patch, key) => {
    setSaving(key);
    try {
      await mutate("/profile", {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
    } finally {
      setSaving("");
    }
  };

  const openBillingPortal = async () => {
    setBillingBusy(true);
    setBillingError("");
    try {
      const payload = await apiRequest(
        "/billing-portal",
        {
          method: "POST",
          body: JSON.stringify({})
        },
        token
      );

      window.location.assign(payload.url);
    } catch (loadError) {
      setBillingError(loadError.message);
    } finally {
      setBillingBusy(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="module-page-hero">
        <div>
          <p className="badge">Settings</p>
          <h2>Keep the app simple, set your guidance level, and review the work you have actually logged.</h2>
          <p className="lead-copy">Your training setup, appearance, session detail level, and visibility controls all live here so the main navigation stays calm.</p>
        </div>
      </section>

      <div className="settings-layout">
        <Panel eyebrow="Settings menu" title="Choose a control area">
          <div className="settings-menu">
            {[
              ["account", "Account"],
              ["preferences", "Preferences"],
              ["appearance", "Appearance"],
              ["modules", "Module Visibility"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`settings-menu-button ${activeSection === value ? "settings-menu-button-active" : ""}`}
                type="button"
                onClick={() => openSection(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>

        {activeSection === "preferences" ? (
          <div className="page-grid page-grid-tight">
            <Panel eyebrow="App mode" title="Choose the version of PulsePeak you want to open first">
              <p className="support-copy">Switching app mode reapplies the recommended layout for that mode using the same module visibility system already built into your settings.</p>
              <div className="goal-card-grid">
                {APP_MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`goal-card ${profile.appMode === option.value ? "goal-card-active" : ""}`}
                    disabled={saving === "app-mode"}
                    type="button"
                    onClick={() => updateProfilePreference({ appMode: option.value }, "app-mode")}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel eyebrow="Training preferences" title="Control how much guidance you see in each session">
              <div className="goal-card-grid">
                {[
                  ["full", "Full guidance", "Show full instructions, mistakes, safety notes, and movement imagery."],
                  ["standard", "Standard", "Show the key cues and only the detail you need to keep moving."],
                  ["minimal", "Minimal", "Keep the session cleaner with names, sets, reps, and your last load."]
                ].map(([value, label, description]) => (
                  <button
                    key={value}
                    className={`goal-card ${profile.exerciseGuidanceLevel === value ? "goal-card-active" : ""}`}
                    disabled={saving === "guidance"}
                    type="button"
                    onClick={() => updateProfilePreference({ exerciseGuidanceLevel: value }, "guidance")}
                  >
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </button>
                ))}
              </div>
              <div className="chip-toggle-grid">
                <button
                  className={`goal-card chip-card ${profile.showWarmup !== false ? "goal-card-active" : ""}`}
                  disabled={saving === "warmup"}
                  type="button"
                  onClick={() => updateProfilePreference({ showWarmup: profile.showWarmup === false }, "warmup")}
                >
                  <strong>{profile.showWarmup === false ? "Warm-up hidden" : "Show warm-up"}</strong>
                </button>
                <button
                  className={`goal-card chip-card ${profile.showCooldown !== false ? "goal-card-active" : ""}`}
                  disabled={saving === "cooldown"}
                  type="button"
                  onClick={() => updateProfilePreference({ showCooldown: profile.showCooldown === false }, "cooldown")}
                >
                  <strong>{profile.showCooldown === false ? "Cooldown hidden" : "Show cooldown"}</strong>
                </button>
              </div>
            </Panel>

            <OnboardingFlow mode="preferences" onComplete={() => navigate("/", { replace: true })} />

            <Panel eyebrow="Workout history" title="Review your logged sessions and last used loads">
              {summary?.recentWorkouts?.length ? (
                <div className="module-card-grid">
                  {summary.recentWorkouts.map((workout) => (
                    <article className="module-card" key={workout.id}>
                      <p className="section-label">{workout.loggedAt?.slice(0, 10) || "Recent session"}</p>
                      <h4>{workout.name}</h4>
                      <p className="support-copy">{workout.duration} mins · {workout.exercises.length} exercises</p>
                      <ul className="plan-list compact-plan-list">
                        {workout.exercises.slice(0, 4).map((exercise) => (
                          <li key={`${workout.id}-${exercise.name}`}>
                            {exercise.name}
                            {exercise.weight ? ` · ${exercise.weight}` : ""}
                            {exercise.repsCompleted ? ` · ${exercise.repsCompleted}` : ""}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="support-copy">Log a few sessions and your recent workout history will show up here with the loads you used.</p>
              )}
              {summary?.exerciseHistory?.length ? (
                <>
                  <p className="section-label">Strength progression</p>
                  <div className="module-card-grid">
                    {summary.exerciseHistory.slice(0, 6).map((entry) => (
                      <article className="module-card" key={entry.name}>
                        <p className="section-label">{entry.entries.length} logged set{entry.entries.length === 1 ? "" : "s"}</p>
                        <h4>{entry.name}</h4>
                        <p className="support-copy">Last load: {entry.lastWeight || "Not logged yet"}</p>
                        <p className="support-copy">Best load: {entry.bestWeight || "Not logged yet"}</p>
                        <p className="support-copy">Most recent: {entry.lastPerformedAt?.slice(0, 10) || "No date yet"}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
            </Panel>
          </div>
        ) : null}

        {activeSection === "account" ? (
          <div className="page-grid page-grid-tight">
            <Panel eyebrow="Account" title="Manage your profile, billing, and access in one place">
              <div className="module-card-grid">
                <article className="module-card">
                  <p className="section-label">Account info</p>
                  <h4>{user?.name || "PulsePeak account"}</h4>
                  <p className="support-copy">{user?.email}</p>
                  <p className="support-copy">Current plan: {user?.accessLabel || (isPremium ? "Premium" : "Free")}</p>
                </article>
                <article className="module-card">
                  <p className="section-label">Billing & subscription</p>
                  <h4>{user?.subscriptionPlanInterval ? `${user.subscriptionPlanInterval === "yearly" ? "Yearly" : "Monthly"} plan` : "No active paid plan"}</h4>
                  <p className="support-copy">
                    {user?.trialStatus === "canceled" && user?.trialEndsLabel
                      ? `Trial access stays live until ${user.trialEndsLabel}, then the account returns to Free.`
                      : user?.trialEndsLabel
                        ? `Trial ends on ${user.trialEndsLabel}, then renews yearly at $119.99/year unless canceled.`
                        : user?.currentPeriodEnd
                          ? `Next billing date: ${new Date(user.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
                          : "Billing details and invoices are managed in your account portal."}
                  </p>
                  <div className="module-card-actions">
                    <button className="secondary-button" disabled={billingBusy || (!user?.hasBillingProfile && !isPremium)} type="button" onClick={openBillingPortal}>
                      {billingBusy ? "Opening billing..." : "Billing & subscription"}
                    </button>
                  </div>
                  {billingError ? <p className="support-copy">{billingError}</p> : null}
                </article>
                <article className="module-card">
                  <p className="section-label">Purchase history</p>
                  <h4>Invoices and past charges</h4>
                  <p className="support-copy">Review invoices, payment history, and subscription changes through the billing portal so your account history stays in one place.</p>
                  <div className="module-card-actions">
                    <button className="secondary-button" disabled={billingBusy || (!user?.hasBillingProfile && !isPremium)} type="button" onClick={openBillingPortal}>
                      {billingBusy ? "Opening history..." : "Open purchase history"}
                    </button>
                  </div>
                </article>
                <article className="module-card">
                  <p className="section-label">Upgrade options</p>
                  <h4>Keep the full system available</h4>
                  <p className="support-copy">Choose yearly to stay on the main trial and renewal path, or use monthly only as a separate direct paid option.</p>
                  <div className="module-card-actions">
                    <button className="primary-button" disabled={upgradeBusy} type="button" onClick={() => startUpgradeCheckout("yearly", user?.canStartTrial ? "default" : "upgrade_now")}>
                      {user?.canStartTrial ? "Start 7-day free trial" : "Upgrade yearly"}
                    </button>
                    <button className="secondary-button" disabled={upgradeBusy} type="button" onClick={() => startUpgradeCheckout("monthly", "upgrade_now")}>
                      Upgrade monthly
                    </button>
                  </div>
                </article>
              </div>
              <div className="module-card-actions">
                <button className="ghost-button" type="button" onClick={logout}>
                  Log out
                </button>
              </div>
            </Panel>
          </div>
        ) : null}

        {activeSection === "appearance" ? (
          <Panel eyebrow="Appearance" title="Choose the visual baseline you want to train with">
            <div className="theme-picker-grid settings-theme-grid">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`theme-swatch settings-theme-swatch ${theme === option.value ? "theme-swatch-active" : ""}`}
                  type="button"
                  onClick={() => changeTheme(option.value)}
                >
                  <span className="theme-swatch-row">
                    <span>
                      <strong>{option.label}</strong>
                      <span className="theme-swatch-mood">{option.mood}</span>
                    </span>
                    <span aria-hidden="true" className="theme-chip-row">
                      {option.chips.map((chip) => (
                        <span className="theme-chip" key={`${option.value}-${chip}`} style={{ background: chip }} />
                      ))}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeSection === "modules" ? <DashboardControlsPanel /> : null}
      </div>
    </div>
  );
}

```

## FILE: src/pages/ProgressPage.jsx

`$ext
import React from "react";
import Panel from "../components/Panel";
import UpgradePrompt from "../components/UpgradePrompt";
import { BarChart, LineChart } from "../components/SimpleChart";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { useAuth } from "../state/AuthContext";

export default function ProgressPage() {
  const { user, isPremium } = useAuth();
  const { data, summary, loading, mutate } = useDashboardData();
  const { busy: checkoutBusy, startUpgradeCheckout } = useUpgradeCheckout();
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const dismissalKey = React.useMemo(
    () => `pulsepeak-dismissed-progress-upgrade:${user?.id || "guest"}`,
    [user?.id]
  );
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(true);

  React.useEffect(() => {
    setShowUpgradePrompt(window.localStorage.getItem(dismissalKey) !== "true");
  }, [dismissalKey]);

  if (loading || !data || !summary) {
    return <div className="screen-center">Loading progress...</div>;
  }

  const bestStreak = summary.habits.reduce((best, habit) => Math.max(best, habit.streak), 0);
  const weeklyCheckIn = summary.weeklyCheckIn;
  const latestCheckIn = weeklyCheckIn?.latestCheckIn;
  const progressUpgradePrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "progress",
        profile: data.profile,
        activeModules: summary.activeModules || [],
        summary
      });

  const dismissUpgradePrompt = () => {
    window.localStorage.setItem(dismissalKey, "true");
    setShowUpgradePrompt(false);
  };

  const handleUpgrade = async (billingInterval = "monthly", checkoutMode = "default") => {
    setError("");
    try {
      await startUpgradeCheckout(billingInterval, checkoutMode);
    } catch (upgradeError) {
      setError(upgradeError.message);
    }
  };

  const submitWeeklyCheckIn = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setStatus("");
    setError("");
    try {
      await mutate("/weekly-check-in", {
        method: "POST",
        body: JSON.stringify({
          weekKey: weeklyCheckIn?.currentWeekKey,
          weekFeel: form.get("weekFeel"),
          recoveryFeel: form.get("recoveryFeel"),
          planDifficulty: form.get("planDifficulty"),
          nutritionAdherence: form.get("nutritionAdherence"),
          sorenessIssues: form.get("sorenessIssues"),
          confidence: form.get("confidence")
        })
      });
      setStatus("Weekly check-in saved.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-grid">
      {error ? <div className="status-banner">{error}</div> : null}
      {status ? <div className="status-banner">{status}</div> : null}

      <Panel eyebrow="Progress overview" title="See whether the week is actually moving forward">
        <div className="content-grid">
          <div className="module-note">
            <strong>{summary.completion}% current completion</strong>
            <p className="muted">Your daily score pulls training, recovery, hydration, and nutrition into one signal so progress feels connected instead of scattered.</p>
          </div>
          <div className="module-note">
            <strong>{bestStreak} day best streak</strong>
            <p className="muted">Habit streaks and weekly-score history show whether your routine is becoming easier to repeat and trust.</p>
          </div>
        </div>
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Weekly check-in" title={weeklyCheckIn?.title || "Close the loop on your week"}>
          <div className="section-context">
            <span className="section-context-label">Reflect once a week</span>
            <p>{weeklyCheckIn?.summary || "A short reflection helps PulsePeak explain what changed and what the next week should tighten up."}</p>
          </div>
          <form className="stack-form" onSubmit={submitWeeklyCheckIn}>
            <div className="profile-grid">
              <label>
                How did the week feel?
                <select defaultValue={latestCheckIn?.weekFeel || "mixed"} name="weekFeel">
                  <option value="rough">Rough</option>
                  <option value="mixed">Mixed</option>
                  <option value="strong">Strong</option>
                </select>
              </label>
              <label>
                Energy / recovery
                <select defaultValue={latestCheckIn?.recoveryFeel || "steady"} name="recoveryFeel">
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Plan difficulty
                <select defaultValue={latestCheckIn?.planDifficulty || "right"} name="planDifficulty">
                  <option value="too_easy">Too easy</option>
                  <option value="right">About right</option>
                  <option value="too_hard">Too hard</option>
                </select>
              </label>
              <label>
                Nutrition felt
                <select defaultValue={latestCheckIn?.nutritionAdherence || "mostly_on"} name="nutritionAdherence">
                  <option value="off_track">Off track</option>
                  <option value="mostly_on">Mostly on track</option>
                  <option value="locked_in">Locked in</option>
                </select>
              </label>
              <label>
                Soreness / joint issues
                <select defaultValue={latestCheckIn?.sorenessIssues || "manageable"} name="sorenessIssues">
                  <option value="none">None</option>
                  <option value="manageable">Manageable</option>
                  <option value="significant">Significant</option>
                </select>
              </label>
              <label>
                Confidence for next week
                <select defaultValue={latestCheckIn?.confidence || "steady"} name="confidence">
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Saving..." : weeklyCheckIn?.submittedThisWeek ? "Update weekly check-in" : "Save weekly check-in"}
            </button>
          </form>
        </Panel>

        <Panel eyebrow="Check-in summary" title="What the app is taking from this week">
          <div className="module-note">
            <strong>{weeklyCheckIn?.todayConnection || "Today and next week should stay connected through one clear adjustment."}</strong>
            <p className="support-copy">
              {isPremium ? weeklyCheckIn?.premiumSummary : weeklyCheckIn?.freeSummary}
            </p>
          </div>
          <div className="content-grid">
            <div className="module-note">
              <strong>What went well</strong>
              {weeklyCheckIn?.whatWentWell?.length ? (
                <ul className="plan-list">
                  {weeklyCheckIn.whatWentWell.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">Complete a weekly check-in to turn the week into clearer progress notes.</p>
              )}
            </div>
            <div className="module-note">
              <strong>Needs tightening</strong>
              {weeklyCheckIn?.needsTightening?.length ? (
                <ul className="plan-list">
                  {weeklyCheckIn.needsTightening.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">PulsePeak will show what needs tightening once the week has a little more feedback behind it.</p>
              )}
            </div>
          </div>
          <div className="module-note">
            <strong>What changes next week</strong>
            {weeklyCheckIn?.nextWeekAdjustments?.length ? (
              <ul className="plan-list">
                {weeklyCheckIn.nextWeekAdjustments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="support-copy">The next week's changes will appear here after your check-in is saved.</p>
            )}
          </div>
          {isPremium && weeklyCheckIn?.premiumReasoning ? (
            <div className="module-note">
              <strong>Premium adjustment reasoning</strong>
              <p className="support-copy">{weeklyCheckIn.premiumReasoning}</p>
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="content-grid">
        <Panel eyebrow="Weekly score" title="Adherence chart">
          <BarChart points={summary.weeklyHistory} />
        </Panel>

        <Panel eyebrow="Weight trend" title="7-day bodyweight view">
          <LineChart
            max={Math.max(...data.weightHistory.map((point) => point.weight)) + 1}
            min={Math.min(...data.weightHistory.map((point) => point.weight)) - 1}
            points={data.weightHistory}
            suffix=" lb"
            valueKey="weight"
          />
        </Panel>
      </div>

      <Panel eyebrow="Streaks" title="Habit consistency">
        <div className="insight-list">
          {summary.habits.map((habit) => (
            <div className="insight-chip" key={habit.id}>
              <strong>{habit.name}</strong>
              <p className="muted">
                {habit.streak} day streak / target {habit.target}
              </p>
            </div>
          ))}
          <div className="insight-chip">
            <strong>Best streak</strong>
            <p className="muted">{bestStreak} consecutive days</p>
          </div>
        </div>
      </Panel>

      {!isPremium && showUpgradePrompt && progressUpgradePrompt ? (
        <UpgradePrompt prompt={progressUpgradePrompt} busy={checkoutBusy} onDismiss={dismissUpgradePrompt} onUpgrade={handleUpgrade} />
      ) : null}
    </div>
  );
}

```

## FILE: src/pages/WorkoutsPage.jsx

`$ext
import React, { useEffect, useMemo, useState } from "react";
import Panel from "../components/Panel";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import MovementDetailModal from "../components/MovementDetailModal";
import UpgradePrompt from "../components/UpgradePrompt";
import { apiRequest } from "../api/client";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { useUpgradeCheckout } from "../hooks/useUpgradeCheckout";
import { getUpgradePrompt } from "../config/upgradePrompts";
import { formatEquipmentSelections, formatWorkoutFocus } from "../../shared/workoutEngine";
import { getMovementMedia } from "../../shared/exerciseCatalog";
import { WORKOUT_DISCOVERY_CATEGORIES, WORKOUT_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";

export default function WorkoutsPage() {
  const { token, isPremium, accessTier } = useAuth();
  const { data, summary, loading, error, mutate } = useDashboardData();
  const [workoutEnvironment, setWorkoutEnvironment] = useState("both");
  const [equipmentSelections, setEquipmentSelections] = useState([]);
  const [workoutFocus, setWorkoutFocus] = useState("recommended");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedJointStress, setSelectedJointStress] = useState("all");
  const [selectedTrainingStyle, setSelectedTrainingStyle] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState("all");
  const [workoutLibrary, setWorkoutLibrary] = useState([]);
  const [libraryMeta, setLibraryMeta] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState("");
  const [favoriteSavingId, setFavoriteSavingId] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const { busy: checkoutBusy, startUpgradeCheckout: startUpgradeCheckoutFlow } = useUpgradeCheckout();
  const safeProfile = data?.profile || {};
  const safeSummary = summary || {};
  const safeWorkoutAccess = safeSummary.workoutAccess || {};
  const safePlanSummary = safeSummary.planSummary || {};
  const safeWorkoutEngine = safeSummary.workoutEngine || {};
  const categoryOptions = libraryMeta?.categoryOptions || WORKOUT_DISCOVERY_CATEGORIES;
  const focusOptions = libraryMeta?.focusOptions || [];

  const displayedWorkouts = useMemo(() => {
    const filtered = workoutLibrary.filter((workout) => {
      const categoryMatch =
        selectedCategory === "all" ||
        (workout.categoryTags || []).some((tag) => slugifyDiscoveryTag(tag) === selectedCategory);
      const durationMatch =
        selectedDuration === "all" ||
        (selectedDuration === "short" ? workout.duration <= 35 : selectedDuration === "medium" ? workout.duration <= 50 : workout.duration > 50);
      const intensityMatch = selectedIntensity === "all" || String(workout.intensity || "").toLowerCase() === selectedIntensity;
      const jointStressMatch = selectedJointStress === "all" || String(workout.jointStressProfile || "").toLowerCase() === selectedJointStress;
      const trainingStyleMatch =
        selectedTrainingStyle === "all" ||
        (workout.trainingStyleTags || []).some((tag) => slugifyDiscoveryTag(tag) === selectedTrainingStyle);
      return categoryMatch && durationMatch && intensityMatch && jointStressMatch && trainingStyleMatch;
    });

    return [...filtered].sort((left, right) => {
      switch (selectedSort) {
        case "shortest":
          return left.duration - right.duration;
        case "easiest":
          return rankDifficulty(left.difficultyTag) - rankDifficulty(right.difficultyTag);
        case "recovery_friendly":
          return rankJointStress(left.jointStressProfile) - rankJointStress(right.jointStressProfile);
        case "equipment_efficient":
          return countEquipmentWords(left.equipmentSummary) - countEquipmentWords(right.equipmentSummary);
        default:
          return (right.recommendationScore || 0) - (left.recommendationScore || 0);
      }
    });
  }, [workoutLibrary, selectedCategory, selectedDuration, selectedIntensity, selectedJointStress, selectedTrainingStyle, selectedSort]);
  const topWorkout = displayedWorkouts[0] || null;
  const alternativeWorkouts = displayedWorkouts.slice(1, 4);
  const savedWorkoutKeys = useMemo(
    () => new Set((safeSummary.savedWorkouts || []).map((workout) => String(workout.presetId || workout.id || "").trim()).filter(Boolean)),
    [safeSummary.savedWorkouts]
  );
  const selectedCategoryMeta = categoryOptions.find((category) => category.id === selectedCategory) || categoryOptions[0];
  const exercisePreview = useMemo(() => {
    const entries = libraryMeta?.exerciseLibraryPreview?.entries || [];
    return selectedExerciseCategory === "all"
      ? entries
      : entries.filter((entry) => slugifyDiscoveryTag(entry.category) === selectedExerciseCategory);
  }, [libraryMeta?.exerciseLibraryPreview?.entries, selectedExerciseCategory]);
  const exercisePreviewGroups = useMemo(() => {
    const entries = libraryMeta?.exerciseLibraryPreview?.entries || [];
    const categories = libraryMeta?.exerciseLibraryPreview?.categories || [];
    if (selectedExerciseCategory !== "all") {
      return [];
    }

    return categories
      .map((category) => ({
        ...category,
        entries: entries.filter((entry) => slugifyDiscoveryTag(entry.category) === category.id).slice(0, 4)
      }))
      .filter((category) => category.entries.length);
  }, [libraryMeta?.exerciseLibraryPreview?.categories, libraryMeta?.exerciseLibraryPreview?.entries, selectedExerciseCategory]);

  useEffect(() => {
    if (!data?.profile) {
      return;
    }

    setWorkoutEnvironment(data.profile.trainingEnvironment === "hybrid" ? "both" : data.profile.trainingEnvironment);
    setEquipmentSelections(data.profile.equipmentSelections || []);
    setWorkoutFocus(summary?.workoutEngine?.recommendedFocus || "recommended");
  }, [data?.profile, summary?.workoutEngine?.recommendedFocus]);

  useEffect(() => {
    const mappedFocus = resolveCategoryToFocus(selectedCategory, focusOptions);
    if (mappedFocus && workoutFocus !== mappedFocus) {
      setWorkoutFocus(mappedFocus);
    }
  }, [focusOptions, selectedCategory, workoutFocus]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const params = new URLSearchParams({
      environment: workoutEnvironment,
      focus: workoutFocus
    });
    if (equipmentSelections.length) {
      params.set("equipmentSelections", equipmentSelections.join(","));
    }

    setLibraryLoading(true);
    apiRequest(`/workout-library?${params.toString()}`, {}, token)
      .then((payload) => {
        setWorkoutLibrary(payload.workouts);
        setLibraryMeta(payload.meta);
        setLibraryError("");
      })
      .catch((loadError) => {
        setLibraryError(loadError.message);
      })
      .finally(() => setLibraryLoading(false));
  }, [token, workoutEnvironment, equipmentSelections, workoutFocus]);

  if (loading) {
    return <div className="screen-center">Loading workouts...</div>;
  }

  if (!data || !summary) {
    return <div className="screen-center">{error || "Unable to load workouts."}</div>;
  }

  const workoutAccess = safeWorkoutAccess;
  const workoutPrompt = isPremium
    ? null
    : getUpgradePrompt({
        surface: "workouts",
        profile: safeProfile,
        activeModules: safeSummary.activeModules,
        weeklyPlan: safePlanSummary
      });
  const selectedFocusLabel =
    workoutFocus === "recommended"
      ? libraryMeta?.focusOptions?.find((option) => option.value === safeWorkoutEngine.recommendedFocus)?.label || "Recommended"
      : formatWorkoutFocus(workoutFocus);
  const selectedFocusOption = focusOptions.find((option) => option.value === workoutFocus);
  const equipmentSummary = formatEquipmentSelections(equipmentSelections);
  const sortOptions = libraryMeta?.sortOptions?.length ? libraryMeta.sortOptions : WORKOUT_SORT_OPTIONS;
  const loadedWorkoutMessage = buildLoadedWorkoutMessage(topWorkout, selectedCategoryMeta, selectedFocusLabel);
  const coachReasoning = buildCoachReasoning({
    topWorkout,
    selectedCategoryMeta,
    selectedFocusLabel,
    workoutEnvironment,
    equipmentSummary
  });
  const companionSplits = buildCompanionSplits({
    topWorkout,
    libraryMeta,
    selectedCategoryMeta
  });

  const toggleEquipmentSelection = (value) => {
    setEquipmentSelections((current) => {
      const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
      return next.length ? next : current;
    });
  };

  const addPresetWorkout = async (workoutOrId, customExercises = null, options = {}) => {
    const workoutId = typeof workoutOrId === "string" ? workoutOrId : workoutOrId?.presetId || workoutOrId?.id;
    const workoutContext = typeof workoutOrId === "string" ? null : workoutOrId;
    const { closeOnSuccess = true, successMessage = "Workout logged." } = options;
    setSaving(`preset-${workoutId}`);
    setFeedback("");
    try {
      await mutate("/workouts/preset", {
        method: "POST",
        body: JSON.stringify({
          presetId: workoutId,
          environment: workoutContext?.environment || workoutEnvironment,
          equipmentProfile: workoutContext?.equipmentProfile || data.profile?.equipmentProfile,
          equipmentSelections: workoutContext?.equipmentSelections || equipmentSelections,
          focus: workoutContext?.focus || workoutFocus,
          exercises: customExercises
            ? customExercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup,
                weight: exercise.weight ?? "",
                repsCompleted: exercise.repsCompleted || "",
                notes: exercise.notes || ""
              }))
            : undefined
        })
      });
      setFeedback(successMessage);
      if (closeOnSuccess) {
        setSelectedWorkout(null);
      }
    } catch (mutationError) {
      setFeedback(mutationError.message);
      throw mutationError;
    } finally {
      setSaving("");
    }
  };

  const toggleFavoriteWorkout = async (workout, event) => {
    event?.stopPropagation?.();
    const workoutId = String(workout?.presetId || workout?.id || "").trim();
    if (!workoutId) {
      return;
    }

    setFavoriteSavingId(workoutId);
    setFeedback("");
    try {
      const payload = await mutate("/workouts/saved", {
        method: "POST",
        body: JSON.stringify({ workout })
      });
      setFeedback(payload.saved ? "Workout saved." : "Workout removed from saved workouts.");
    } catch (loadError) {
      setFeedback(loadError.message);
    } finally {
      setFavoriteSavingId("");
    }
  };

  const startWorkoutSession = (workout) => {
    if (!workout || workout.lockedForAccess) {
      return;
    }

    setSelectedWorkout(workout);
  };

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    setFeedback("");
    try {
      await startUpgradeCheckoutFlow(billingInterval, checkoutMode);
    } catch (loadError) {
      setFeedback(loadError.message);
    }
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Workouts</p>
          <h2>Choose your setup, pick your focus, and run a session that fits today.</h2>
          <p className="lead-copy">Build the session around the equipment you actually have so the workout feels usable the moment you open it.</p>
        </div>
      </section>

      {feedback ? <div className="status-banner">{feedback}</div> : null}

      <div className={`cap-banner ${workoutAccess?.locked ? "cap-banner-locked" : ""}`}>
        <div>
          <strong>
            {workoutAccess?.trialUnlimited
              ? `Trial active: unlimited workout logging until ${workoutAccess?.trialEndsLabel || "your trial ends"}.`
              : workoutAccess?.premiumUnlimited
                ? "Premium unlocked: unlimited workout logging is active."
                : `Free plan: ${workoutAccess?.weeklyLogged || 0} of ${workoutAccess?.limit || 2} weekly workout logs used.`}
          </strong>
          <p className="support-copy">
            {workoutAccess?.trialUnlimited
              ? `You have the full system right now. Trial ends on ${workoutAccess?.trialEndsLabel || "your renewal date"}, then renews yearly at $119.99/year unless canceled before trial ends.`
              : workoutAccess?.premiumUnlimited
                ? "Keep logging sessions, rotating exercises, and building continuity without a weekly ceiling."
                : workoutAccess?.locked
                  ? workoutAccess?.canStartTrial
                    ? "You have hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity."
                    : `Preview stays open. Logging resets on ${workoutAccess?.resetLabel}. Premium removes the cap and keeps your training history moving.`
                  : `You still have ${workoutAccess?.remaining} workout log${workoutAccess?.remaining === 1 ? "" : "s"} left before the weekly reset on ${workoutAccess?.resetLabel}.`}
          </p>
        </div>
        {!isPremium && workoutAccess?.locked && workoutPrompt ? (
          <UpgradePrompt compact prompt={workoutPrompt} busy={checkoutBusy} onUpgrade={startUpgradeCheckout} />
        ) : null}
      </div>

      <Panel eyebrow="Today" title="Match the session to your real setup">
        <div className="section-context">
          <span className="section-context-label">Workout setup</span>
          <p>Choose where you are training, tap the equipment you have today, and then pick the split you want to run.</p>
        </div>
        {!libraryMeta?.fullLibraryAccess && libraryMeta?.lockedLibraryMessage ? (
          <div className="module-note premium-locked">
            <strong>You are only seeing a smaller free preview of PulsePeak.</strong>
            <p className="support-copy">{libraryMeta.lockedLibraryMessage}</p>
          </div>
        ) : null}
        <div className="filter-bar discovery-filter-bar">
          <label>
            Where are you training?
            <select value={workoutEnvironment} onChange={(event) => setWorkoutEnvironment(event.target.value)}>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="both">Hybrid / either</option>
            </select>
          </label>
          <label>
            What are you training today?
            <select value={workoutFocus} onChange={(event) => setWorkoutFocus(event.target.value)}>
              <option value="recommended">Recommended for today</option>
              {focusOptions.map((option) => (
                <option key={option.value} disabled={Boolean(option.locked && !isPremium)} value={option.value}>
                  {option.label}
                  {option.locked && !isPremium ? " (Locked on Free)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chip-toggle-grid workout-equipment-grid">
          {(libraryMeta?.equipmentOptions || []).map((option) => (
            <button
              key={option.value}
              className={`goal-card chip-card ${equipmentSelections.includes(option.value) ? "goal-card-active" : ""}`}
              type="button"
              onClick={() => toggleEquipmentSelection(option.value)}
            >
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>

        <div className="content-grid">
          <div className="module-note">
            <strong>{libraryMeta?.recommendationTitle || "Pick the split that fits today."}</strong>
            <p className="support-copy">{libraryMeta?.recommendationReason}</p>
            {libraryMeta?.continuityReason ? <p className="support-copy">{libraryMeta.continuityReason}</p> : null}
            <p className="support-copy">Current setup: {equipmentSummary}</p>
            {selectedFocusOption?.locked && !isPremium ? <p className="support-copy">Locked on Free. Included in Trial + Premium.</p> : null}
          </div>
          <div className="module-note">
            <strong>{workoutFocus === "recommended" ? "Good alternatives" : "Helpful companion splits"}</strong>
            <p className="support-copy">{(libraryMeta?.suggestedPairings || []).join(" · ")}</p>
          </div>
        </div>
        <div className="selector-row">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar discovery-filter-bar">
          <label>
            Duration
            <select value={selectedDuration} onChange={(event) => setSelectedDuration(event.target.value)}>
              <option value="all">Any length</option>
              <option value="short">35 min or less</option>
              <option value="medium">36-50 min</option>
              <option value="long">51+ min</option>
            </select>
          </label>
          <label>
            Intensity
            <select value={selectedIntensity} onChange={(event) => setSelectedIntensity(event.target.value)}>
              <option value="all">Any intensity</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Joint stress
            <select value={selectedJointStress} onChange={(event) => setSelectedJointStress(event.target.value)}>
              <option value="all">Any joint stress</option>
              <option value="low">Low stress</option>
              <option value="moderate">Moderate stress</option>
              <option value="high">Higher stress</option>
            </select>
          </label>
          <label>
            Training style
            <select value={selectedTrainingStyle} onChange={(event) => setSelectedTrainingStyle(event.target.value)}>
              <option value="all">Any training style</option>
              <option value="strength">Strength</option>
              <option value="muscle_building">Muscle Building</option>
              <option value="conditioning">Conditioning</option>
              <option value="bodyweight">Bodyweight</option>
              <option value="at_home">At Home</option>
              <option value="dumbbell">Dumbbell</option>
              <option value="joint-friendly">Joint-Friendly</option>
              <option value="recovery_day">Recovery Day</option>
              <option value="hybrid_setup">Hybrid Setup</option>
            </select>
          </label>
          <label>
            Sort
            <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <Panel eyebrow="Loaded session" title={topWorkout?.name || `${selectedFocusLabel} workouts`}>
        {libraryLoading ? (
          <p className="support-copy">Building the best workout for today...</p>
        ) : libraryError ? (
          <p className="support-copy">{libraryError}</p>
        ) : topWorkout ? (
          <div className="loaded-workout-shell">
            <div className="module-card loaded-workout-summary">
              <p className="section-label">
                {topWorkout.focusLabel} · {topWorkout.environment} · {topWorkout.equipmentSummary || topWorkout.equipmentProfile.replaceAll("_", " ")}
              </p>
              <div className="library-card-hero">
                {renderMovementPreview(topWorkout.exercises[0], topWorkout.name)}
                <div className="library-card-hero-copy">
                  <span className="library-depth-note">Built from {Math.max(topWorkout.exercises.reduce((total, exercise) => total + (exercise.availableSwapCount || 1), 0), 6)}+ variations</span>
                  <span className="library-depth-note">{topWorkout.jointStressProfile === "low" ? "Joint-friendly option" : "Matches your setup"}</span>
                </div>
              </div>
              <h4>{topWorkout.name}</h4>
              <p className="loaded-workout-cta">{loadedWorkoutMessage}</p>
              <p className="support-copy">{topWorkout.summary}</p>
              {topWorkout.continuityNote ? <p className="support-copy">{topWorkout.continuityNote}</p> : null}
              {topWorkout.varietyNote ? <p className="support-copy">{topWorkout.varietyNote}</p> : null}
              {topWorkout.lockedReason ? <p className="support-copy">{topWorkout.lockedReason}</p> : null}
              <p className="support-copy">{topWorkout.duration} mins · {topWorkout.intensity} · {topWorkout.primaryMuscles.join(", ")}</p>
              <div className="module-card-actions">
                <button
                  className="primary-button"
                  disabled={Boolean(topWorkout.lockedForAccess)}
                  type="button"
                  onClick={() => startWorkoutSession(topWorkout)}
                >
                  {topWorkout.lockedForAccess ? "Locked on Free" : "Start workout"}
                </button>
                <button className="ghost-button" disabled={Boolean(topWorkout.lockedForAccess)} type="button" onClick={() => setSelectedWorkout(topWorkout)}>
                  {topWorkout.lockedForAccess ? "Locked preview" : "View details"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={(event) => toggleFavoriteWorkout(topWorkout, event)}
                  disabled={favoriteSavingId === String(topWorkout.presetId || topWorkout.id || "")}
                >
                  {savedWorkoutKeys.has(String(topWorkout.presetId || topWorkout.id || "").trim()) ? "Saved workout" : "Save workout"}
                </button>
              </div>
            </div>

            <div className="module-card">
              <p className="section-label">Why this is loaded</p>
              <h4>Coach direction</h4>
              <p className="support-copy">{coachReasoning}</p>
              <p className="support-copy">
                Companion splits: {companionSplits.length ? companionSplits.join(" · ") : "Stay with this session and keep the week moving."}
              </p>
              <p className="support-copy">
                Alternatives ready: {Math.max(displayedWorkouts.length - 1, 0)} more workout option{displayedWorkouts.length - 1 === 1 ? "" : "s"} match this setup.
              </p>
            </div>

            <div className="module-card loaded-workout-exercises-card">
              <div className="section-context compact-section-context">
                <span className="section-context-label">Your session is ready</span>
                <p>Here is the loaded workout so you can see the full session before you start.</p>
              </div>
              <div className="loaded-workout-exercises">
                {topWorkout.exercises.map((exercise) => (
                  <article
                    className="loaded-workout-exercise"
                    key={`${topWorkout.id}-${exercise.slotId || exercise.name}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => exercise.movement && setSelectedMovement(exercise.movement)}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && exercise.movement) {
                        event.preventDefault();
                        setSelectedMovement(exercise.movement);
                      }
                    }}
                  >
                    <div className="loaded-workout-exercise-media">{renderMovementPreview(exercise, exercise.name)}</div>
                    <div className="loaded-workout-exercise-copy">
                      <strong>{exercise.slotLabel ? `${exercise.slotLabel}: ` : ""}{exercise.name}</strong>
                      <p className="support-copy">{getLoadedWorkoutPrescription(exercise)}</p>
                      <div className="exercise-signal-row">
                        <span className="exercise-signal-pill">{exercise.movementPattern}</span>
                        <span className="exercise-signal-pill">{exercise.equipment}</span>
                        {exercise.lastLoad?.weight ? <span className="exercise-signal-pill">Last used: {exercise.lastLoad.weight}</span> : null}
                      </div>
                    </div>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (exercise.movement) {
                          setSelectedMovement(exercise.movement);
                        }
                      }}
                    >
                      Open guide
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="support-copy">No workout matches that combination yet. Loosen the split or equipment filter and try again.</p>
        )}
      </Panel>

      <Panel eyebrow="Workout alternatives" title="Choose another strong option without losing the logic">
        {!libraryLoading ? (
          <div className="section-context compact-section-context">
            <span className="section-context-label">Visible results</span>
            <p>{displayedWorkouts.length} workout option{displayedWorkouts.length === 1 ? "" : "s"} match the category and filter choices above.</p>
          </div>
        ) : null}
        {libraryLoading ? <p className="support-copy">Loading workout library...</p> : null}
        {!libraryLoading && !libraryError ? (
          <div className="module-card-grid">
            {(alternativeWorkouts.length ? alternativeWorkouts : displayedWorkouts).map((workout) => (
              <article
                className={`module-card ${workout.lockedForAccess ? "module-card-locked" : "module-card-clickable"}`}
                key={workout.id}
                role={workout.lockedForAccess ? undefined : "button"}
                tabIndex={workout.lockedForAccess ? undefined : 0}
                onClick={workout.lockedForAccess ? undefined : () => setSelectedWorkout(workout)}
                onKeyDown={
                  workout.lockedForAccess
                    ? undefined
                    : (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedWorkout(workout);
                        }
                      }
                }
              >
                <p className="section-label">
                  {workout.focusLabel} · {workout.environment}
                </p>
                <div className="library-card-hero">
                  {renderMovementPreview(workout.exercises[0], workout.name)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">Built from {Math.max(workout.exercises.reduce((total, exercise) => total + (exercise.availableSwapCount || 1), 0), 6)}+ variations</span>
                    <span className="library-depth-note">{workout.jointStressProfile === "low" ? "Recovery-friendly option" : "Built for your current setup"}</span>
                  </div>
                </div>
                <h4>{workout.name}</h4>
                <p className="support-copy">{workout.summary}</p>
                {workout.continuityNote ? <p className="support-copy">{workout.continuityNote}</p> : null}
                {workout.lockedReason ? <p className="support-copy">{workout.lockedReason}</p> : null}
                <p className="support-copy">{workout.duration} mins · {workout.intensity}</p>
                <ul className="plan-list compact-plan-list">
                  {workout.exercises.slice(0, 4).map((exercise) => (
                    <li key={`${workout.id}-${exercise.slotId || exercise.name}`}>
                      {exercise.slotLabel}: {exercise.name}
                    </li>
                  ))}
                </ul>
                <div className="module-card-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={(event) => toggleFavoriteWorkout(workout, event)}
                    disabled={favoriteSavingId === String(workout.presetId || workout.id || "")}
                  >
                    {savedWorkoutKeys.has(String(workout.presetId || workout.id || "").trim()) ? "Saved workout" : "Save workout"}
                  </button>
                  <button className="ghost-button" disabled={Boolean(workout.lockedForAccess)} type="button" onClick={() => setSelectedWorkout(workout)}>
                    {workout.lockedForAccess ? "Locked preview" : "View details"}
                  </button>
                  <button className="primary-button" disabled={Boolean(workout.lockedForAccess)} type="button" onClick={() => startWorkoutSession(workout)}>
                    {workout.lockedForAccess ? "Locked on Free" : "Start workout"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Panel>

      <Panel eyebrow="Exercise library" title="Browse the movement pool behind the workout engine">
        <div className="section-context">
          <span className="section-context-label">Movement categories</span>
          <p>Browse by category to see the deeper exercise pool that powers workout variety, swaps, and equipment-aware recommendations.</p>
        </div>
        <div className="selector-row">
          <button
            className={`selector-pill ${selectedExerciseCategory === "all" ? "selector-pill-active" : ""}`}
            type="button"
            onClick={() => setSelectedExerciseCategory("all")}
          >
            <strong>All categories</strong>
            <span>Browse grouped movement families</span>
          </button>
          {(libraryMeta?.exerciseLibraryPreview?.categories || []).map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${selectedExerciseCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => setSelectedExerciseCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.count} options</span>
            </button>
          ))}
        </div>
        {selectedExerciseCategory === "all" ? (
          <div className="library-category-groups">
            {exercisePreviewGroups.map((group) => (
              <section className="library-category-group" key={group.id}>
                <div className="section-context compact-section-context">
                  <span className="section-context-label">{group.label}</span>
                  <p>{group.count} movements available in this category right now.</p>
                </div>
                <div className="module-card-grid">
                  {group.entries.map((entry) => (
                    <article
                      className="module-card module-card-clickable"
                      key={entry.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedMovement(buildPreviewMovement(entry))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedMovement(buildPreviewMovement(entry));
                        }
                      }}
                    >
                      <p className="section-label">
                        {entry.category} · {entry.movementPattern}
                      </p>
                      <div className="library-card-hero">
                        {renderCatalogPreview(entry)}
                        <div className="library-card-hero-copy">
                          <span className="library-depth-note">Browse deeper movement pool</span>
                          <span className="library-depth-note">{entry.rehabSafe ? "Joint-friendly option" : "Built for swaps and variety"}</span>
                        </div>
                      </div>
                      <h4>{entry.title || entry.name}</h4>
                      <p className="support-copy">{formatPreviewEquipment(entry.equipment)}</p>
                      <p className="support-copy">
                        {entry.difficulty} · {entry.jointStress} joint stress
                        {entry.rehabSafe ? " · rehab-safe option" : ""}
                      </p>
                      <div className="module-card-actions">
                        <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(buildPreviewMovement(entry)); }}>
                          Open guide
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="module-card-grid">
            {exercisePreview.slice(0, 12).map((entry) => (
              <article
                className="module-card module-card-clickable"
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMovement(buildPreviewMovement(entry))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMovement(buildPreviewMovement(entry));
                  }
                }}
              >
                <p className="section-label">
                  {entry.category} · {entry.movementPattern}
                </p>
                <div className="library-card-hero">
                  {renderCatalogPreview(entry)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">Browse deeper movement pool</span>
                    <span className="library-depth-note">{entry.rehabSafe ? "Joint-friendly option" : "Built for swaps and variety"}</span>
                  </div>
                </div>
                <h4>{entry.title || entry.name}</h4>
                <p className="support-copy">{formatPreviewEquipment(entry.equipment)}</p>
                <p className="support-copy">
                  {entry.difficulty} · {entry.jointStress} joint stress
                  {entry.rehabSafe ? " · rehab-safe option" : ""}
                </p>
                <p className="support-copy">
                  {entry.mediaStatus === "full" ? "Full media ready" : entry.mediaStatus === "basic" ? "Reference media ready" : "Text guide ready"}
                </p>
                <div className="module-card-actions">
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(buildPreviewMovement(entry)); }}>
                    Open guide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel eyebrow="Saved workouts" title="Come back to the sessions you want to run again">
        {safeSummary.savedWorkouts?.length ? (
          <div className="module-card-grid">
            {safeSummary.savedWorkouts.map((workout) => (
              <article
                className="module-card module-card-clickable"
                key={`saved-${workout.presetId || workout.id}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedWorkout(workout)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedWorkout(workout);
                  }
                }}
              >
                <p className="section-label">{workout.focusLabel || formatWorkoutFocus(workout.focus || "full_body")}</p>
                <div className="library-card-hero">
                  {renderMovementPreview(workout.exercises?.[0], workout.name)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">{savedWorkoutKeys.has(String(workout.presetId || workout.id || "").trim()) ? "Saved and ready to re-run" : "Ready to re-run"}</span>
                    <span className="library-depth-note">{workout.jointStressProfile === "low" ? "Recovery-friendly option" : "Matches your saved setup"}</span>
                  </div>
                </div>
                <h4>{workout.name}</h4>
                <p className="support-copy">{workout.summary || "Saved so you can come back to a session that already fits your setup."}</p>
                <p className="support-copy">{workout.duration} mins · {workout.intensity}</p>
                <div className="module-card-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={(event) => toggleFavoriteWorkout(workout, event)}
                    disabled={favoriteSavingId === String(workout.presetId || workout.id || "")}
                  >
                    Remove saved
                  </button>
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedWorkout(workout); }}>
                    Review workout
                  </button>
                  <button className="primary-button" type="button" onClick={(event) => { event.stopPropagation(); startWorkoutSession(workout); }}>
                    Start workout
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">Save a workout from the recommendation card, workout library, or session view and it will stay here for quick access.</p>
        )}
      </Panel>

      <Panel eyebrow="Recent training" title="Keep the week connected">
        {summary.recentWorkouts.length ? (
          <div className="module-card-grid">
            {summary.recentWorkouts.map((workout) => (
              <article
                className="module-card module-card-clickable"
                key={workout.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedWorkout(workout)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedWorkout(workout);
                  }
                }}
              >
                <p className="section-label">{workout.focus ? formatWorkoutFocus(workout.focus) : workout.type}</p>
                <h4>{workout.name}</h4>
                <div className="module-card-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedWorkout(workout);
                    }}
                  >
                    Review session
                  </button>
                  {workout.presetId ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        startWorkoutSession(workout);
                      }}
                    >
                      Re-run session
                    </button>
                  ) : null}
                </div>
                <p className="support-copy">{workout.duration} mins · {workout.exercises.length} exercises</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">No workouts logged yet. Start with one session that fits your equipment and let the rest of the week build around it.</p>
        )}
      </Panel>

      <WorkoutDetailModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onLog={addPresetWorkout}
        isSaving={saving === `preset-${selectedWorkout?.presetId || selectedWorkout?.id}`}
        onOpenMovement={setSelectedMovement}
        onUpgrade={startUpgradeCheckout}
        accessTier={accessTier}
        canStartTrial={Boolean(summary?.workoutAccess?.canStartTrial)}
        weeklyTarget={
          summary?.workoutAccess?.premiumUnlimited || summary?.workoutAccess?.trialUnlimited
            ? Math.max(3, summary?.planSummary?.suggestedWorkoutMix?.split?.length || 3)
            : summary?.workoutAccess?.limit || 2
        }
        guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"}
        workoutStreak={summary.workoutStreak}
        weeklyWorkoutCount={workoutAccess?.weeklyLogged || 0}
        loggingLocked={Boolean(workoutAccess?.locked)}
        completionExitLabel="Continue training"
        isFavorite={savedWorkoutKeys.has(String(selectedWorkout?.presetId || selectedWorkout?.id || "").trim())}
        onToggleFavorite={toggleFavoriteWorkout}
        loggingHint={
          workoutAccess?.locked
            ? workoutAccess?.canStartTrial
              ? "You have hit your free session limit. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
              : `Free logging resets on ${workoutAccess?.resetLabel}. Premium removes the weekly cap and keeps your training continuity alive.`
            : ""
        }
      />
      <MovementDetailModal guidanceLevel={data.profile?.exerciseGuidanceLevel || "standard"} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  );
}

function rankDifficulty(value) {
  const map = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  return map[value] || 2;
}

function rankJointStress(value) {
  const map = { low: 1, moderate: 2, high: 3 };
  return map[String(value || "").toLowerCase()] || 2;
}

function resolveCategoryToFocus(categoryId, focusOptions) {
  if (!categoryId || categoryId === "all") {
    return null;
  }

  const directMatch = focusOptions.find((option) => option.value === categoryId);
  if (directMatch) {
    return directMatch.value;
  }

  const fallbackMap = {
    arms: "arms",
    chest: "chest",
    back: "back",
    shoulders: "shoulders",
    legs: "legs",
    glutes: "glutes",
    core: "core_abs",
    recovery_day: "mobility_recovery"
  };

  return fallbackMap[categoryId] || null;
}

function countEquipmentWords(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function slugifyDiscoveryTag(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("+", "plus")
    .replaceAll("/", " ")
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function formatPreviewEquipment(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "").replaceAll("_", " ");
}

function buildLoadedWorkoutMessage(workout, selectedCategoryMeta, selectedFocusLabel) {
  if (!workout) {
    return "Your session is ready.";
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return `Start with this ${selectedCategoryMeta.label.toLowerCase()} session.`;
  }

  return `Run this ${selectedFocusLabel.toLowerCase()} workout today.`;
}

function buildCoachReasoning({ topWorkout, selectedCategoryMeta, selectedFocusLabel, workoutEnvironment, equipmentSummary }) {
  if (!topWorkout) {
    return "Choose a setup and the coach flow will load the clearest session for today.";
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return `You selected ${selectedCategoryMeta.label}, so the loaded session is staying matched to that intent while still fitting your ${workoutEnvironment === "both" ? "hybrid" : workoutEnvironment} setup and ${equipmentSummary.toLowerCase()} equipment mix.`;
  }

  return `${selectedFocusLabel} is leading today because it is the cleanest fit for your current setup, recovery spacing, and available equipment.`;
}

function buildCompanionSplits({ topWorkout, libraryMeta, selectedCategoryMeta }) {
  if (!topWorkout) {
    return [];
  }

  if (selectedCategoryMeta?.id && selectedCategoryMeta.id !== "all") {
    return (libraryMeta?.suggestedPairings || []).filter((entry) => !String(entry || "").toLowerCase().includes("mobility / recovery")).slice(0, 3);
  }

  return (libraryMeta?.suggestedPairings || []).slice(0, 3);
}

function getLoadedWorkoutPrescription(exercise) {
  const parts = [`${exercise.sets} sets`];
  if (exercise.reps) {
    parts.push(`${exercise.reps} reps`);
  }
  if (exercise.duration) {
    parts.push(exercise.duration);
  }
  return parts.join(" · ");
}

function renderMovementPreview(exercise, fallbackName) {
  const mediaView = getMovementMedia(exercise?.movement || exercise || { name: fallbackName });
  if (mediaView.thumbnail) {
    return <img alt={`${exercise?.name || fallbackName} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}

function renderCatalogPreview(entry) {
  const mediaView = getMovementMedia(entry);
  if (mediaView.thumbnail) {
    return <img alt={`${entry.title || entry.name} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}

function buildPreviewMovement(entry) {
  return {
    id: entry.id,
    name: entry.title || entry.name,
    category: entry.category || "Movement",
    difficulty: entry.difficulty || entry.difficultyLevel || "Standard",
    environment: Array.isArray(entry.environments) && entry.environments.length ? entry.environments.join(" / ") : "Home / gym",
    equipment: Array.isArray(entry.equipment) ? entry.equipment : Array.isArray(entry.equipmentRequirements) ? entry.equipmentRequirements : [],
    primaryMuscles: entry.primaryMuscleGroup ? [entry.primaryMuscleGroup] : entry.bodyFocus || [],
    secondaryMuscles: entry.secondaryMuscleGroups || [],
    instructions: entry.instructions || entry.guidance?.instructions || ["Use a controlled setup and follow the guide one step at a time."],
    cues: entry.cues || entry.guidance?.cues || ["Match the movement to your setup and stay controlled."],
    commonMistakes: entry.mistakes || entry.guidance?.mistakes || ["Rushing the rep before the pattern feels clean."],
    safetyNotes: entry.safetyNotes || entry.guidance?.safetyNotes || ["Use a load and range you can control cleanly."],
    modifications: entry.modifications || entry.guidance?.modifications || ["Swap into the same movement family if this version does not fit today."],
    media: entry.media,
    mediaStatus: entry.mediaStatus,
    rehabSafe: Boolean(entry.rehabSafe)
  };
}

```

## FILE: src/state/AuthContext.jsx

`$ext
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "pulsepeak-auth-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const accessTier = React.useMemo(() => {
    if (!user) {
      return "free";
    }

    const normalized = String(user.accessTier || "").toLowerCase().trim();
    if (normalized === "trial" || normalized === "trial_active") {
      return "trial_active";
    }
    if (normalized === "premium") {
      return "premium";
    }
    return "free";
  }, [user]);
  const isTrial = accessTier === "trial_active";
  const isPremium = React.useMemo(() => {
    if (!user) {
      return false;
    }

    const tier = String(user.tier || "").toLowerCase().trim();
    const status = String(user.subscriptionStatus || "").toLowerCase().trim();

    return tier === "premium" || status === "active" || status === "trialing";
  }, [user]);
  const needsOnboarding = React.useMemo(() => {
    if (!user) {
      return false;
    }

    return !user.onboardingCompleted || !user.profileComplete;
  }, [user]);

  const refreshSession = async (activeToken = token) => {
    if (!activeToken) {
      return null;
    }

    const payload = await apiRequest("/auth/session", {}, activeToken);
    setUser(payload.user);
    setDashboard(payload.dashboard);
    return payload;
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshSession(token)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const authenticate = async (mode, formState) => {
    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const payload = await apiRequest(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(formState)
      }
    );

    window.localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    setDashboard(payload.dashboard);
    return payload;
  };

  const logout = async () => {
    if (token) {
      await apiRequest("/auth/logout", { method: "POST" }, token);
    }

    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setDashboard(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        accessTier,
        isTrial,
        isPremium,
        needsOnboarding,
        dashboard,
        setDashboard,
        setUser,
        authenticate,
        logout,
        refreshSession,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

```

## FILE: shared/appModes.js

`$ext
export const APP_MODES = ["full_system", "training_only", "training_recovery"];

export const APP_MODE_OPTIONS = [
  {
    value: "full_system",
    label: "Full System",
    description: "Get the full training, recovery, nutrition, and progress experience."
  },
  {
    value: "training_only",
    label: "Training Only",
    description: "Keep PulsePeak focused on your workouts and weekly plan."
  },
  {
    value: "training_recovery",
    label: "Training + Recovery",
    description: "Train hard, recover well, and keep the app lighter."
  }
];

const HIDDEN_MODULES_BY_MODE = {
  full_system: [],
  training_only: ["mobility", "nutrition", "progress", "coach"],
  training_recovery: ["nutrition", "progress", "coach"]
};

export function normalizeAppMode(value) {
  return APP_MODES.includes(value) ? value : "full_system";
}

export function getHiddenModulesForAppMode(value) {
  return [...(HIDDEN_MODULES_BY_MODE[normalizeAppMode(value)] || [])];
}

export function getAppModeLabel(value) {
  return APP_MODE_OPTIONS.find((option) => option.value === normalizeAppMode(value))?.label || "Full System";
}

```

## FILE: shared/dashboardModules.js

`$ext
export const NUTRITION_MODES = ["off", "basic", "full"];
export const CUSTOMIZABLE_MODULE_IDS = ["workouts", "nutrition", "hydration", "mobility", "recovery", "progress", "coach"];

export const DASHBOARD_MODULES = [
  { id: "weekly_plan", label: "Weekly Plan" },
  { id: "workouts", label: "Workouts" },
  { id: "nutrition", label: "Nutrition" },
  { id: "hydration", label: "Hydration" },
  { id: "recovery", label: "Recovery" },
  { id: "habits", label: "Habits" },
  { id: "mobility", label: "Mobility" },
  { id: "progress", label: "Progress" },
  { id: "coach", label: "Coach" }
];

export function getDefaultNutritionMode(goalType) {
  switch (goalType) {
    case "fat_loss":
      return "full";
    case "bodybuilding":
      return "basic";
    case "general_fitness":
      return "basic";
    default:
      return "off";
  }
}

export function normalizeNutritionMode(goalType, nutritionMode) {
  if (NUTRITION_MODES.includes(nutritionMode)) {
    return nutritionMode;
  }

  return getDefaultNutritionMode(goalType);
}

export function getActiveModules(userLike) {
  const profile = userLike?.profile || userLike || {};
  const goalType = profile.goalType || "general_fitness";
  const nutritionMode = normalizeNutritionMode(goalType, profile.nutritionMode);
  const injuryStatus = profile.injuryStatus || "none";
  const hasHabitData = Boolean(userLike?.hasHabits);
  const hiddenModules = normalizeHiddenModules(profile.hiddenModules);
  const moduleOrder = normalizeModuleOrder(profile.moduleOrder);

  return DASHBOARD_MODULES.filter((module) => {
    if (!isModuleVisible(module.id, { goalType, nutritionMode, injuryStatus, hasHabitData })) {
      return false;
    }

    if (module.id === "weekly_plan" || module.id === "habits") {
      return true;
    }

    return !hiddenModules.includes(module.id);
  }).sort((left, right) => compareModuleOrder(left.id, right.id, moduleOrder));
}

export function isModuleVisible(moduleId, { goalType, nutritionMode, injuryStatus, hasHabitData }) {
  switch (moduleId) {
    case "nutrition":
      return nutritionMode !== "off";
    case "hydration":
      return nutritionMode !== "off" || goalType === "fat_loss";
    case "mobility":
      return injuryStatus !== "none" || goalType === "mobility" || goalType === "injury_recovery" || goalType === "active_aging";
    case "recovery":
      return true;
    case "weekly_plan":
    case "coach":
    case "workouts":
    case "progress":
      return true;
    case "habits":
      return hasHabitData || ["fat_loss", "general_fitness", "bodybuilding", "athletic_performance", "active_aging", "mobility"].includes(goalType);
    default:
      return false;
  }
}

export function normalizeModuleOrder(moduleOrder) {
  const selected = Array.isArray(moduleOrder)
    ? moduleOrder.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))
    : [];

  return [...selected, ...CUSTOMIZABLE_MODULE_IDS.filter((moduleId) => !selected.includes(moduleId))];
}

export function normalizeHiddenModules(hiddenModules) {
  return Array.isArray(hiddenModules)
    ? Array.from(new Set(hiddenModules.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))))
    : [];
}

function compareModuleOrder(leftId, rightId, moduleOrder) {
  const getRank = (moduleId) => {
    if (moduleId === "weekly_plan") {
      return -2;
    }
    if (moduleId === "habits") {
      return 100;
    }

    const index = moduleOrder.indexOf(moduleId);
    return index === -1 ? 99 : index;
  };

  return getRank(leftId) - getRank(rightId);
}

```

## FILE: shared/entitlements.js

`$ext
export const ACCESS_TIERS = {
  FREE: "free",
  TRIAL: "trial_active",
  PREMIUM: "premium"
};

export const FREE_COMPLETED_SESSION_LIMIT = 2;
export const FREE_WORKOUT_CATEGORY_LIMIT = 2;
export const FREE_EXERCISES_PER_WORKOUT_LIMIT = 3;
export const TRIAL_LENGTH_DAYS = 7;

export function normalizeAccessTier(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === ACCESS_TIERS.TRIAL || normalized === "trial") {
    return ACCESS_TIERS.TRIAL;
  }
  if (normalized === ACCESS_TIERS.PREMIUM) {
    return ACCESS_TIERS.PREMIUM;
  }
  return ACCESS_TIERS.FREE;
}

export function hasFullWorkoutAccess(accessTier) {
  const normalized = normalizeAccessTier(accessTier);
  return normalized === ACCESS_TIERS.TRIAL || normalized === ACCESS_TIERS.PREMIUM;
}

export function getFreeWorkoutAccessProfile(suggestedFocuses = []) {
  const usableFocuses = Array.from(new Set((suggestedFocuses || []).filter(Boolean))).slice(0, FREE_WORKOUT_CATEGORY_LIMIT);
  return {
    freeWorkoutCategoriesAllowed: FREE_WORKOUT_CATEGORY_LIMIT,
    freeExercisesPerWorkoutAllowed: FREE_EXERCISES_PER_WORKOUT_LIMIT,
    usableFocuses
  };
}

export function isWorkoutFocusUsable(accessTier, focus, suggestedFocuses = []) {
  if (hasFullWorkoutAccess(accessTier)) {
    return true;
  }

  const accessProfile = getFreeWorkoutAccessProfile(suggestedFocuses);
  return accessProfile.usableFocuses.includes(focus);
}

export function getVisibleLockedWorkoutMessage() {
  return "You are seeing only a small part of PulsePeak. Trial or Premium unlocks the full workout system.";
}

```

## FILE: shared/exerciseCatalog.js

`$ext
const MEDIA_STATUS = ["none", "basic", "full"];
const MAX_SEQUENCE_STEPS = 4;
const MIN_SEQUENCE_STEPS = 2;

export function buildMediaAssetPath(...segments) {
  return segments
    .flat()
    .map((segment) => String(segment || "").trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function createMediaPayload({
  images = [],
  steps = [],
  videoUrl = null,
  thumbnail = null,
  fallbackImage = null,
  mediaStatus = null,
  assetPath = null,
  generation = null
} = {}) {
  const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const normalizedSteps = Array.isArray(steps) ? steps.filter(Boolean) : [];
  const resolvedImages = normalizedSteps.length ? normalizedSteps : normalizedImages;
  const safeThumbnail = thumbnail || resolvedImages[0] || fallbackImage || null;
  const normalizedSequence = normalizeMediaSequence(resolvedImages.length ? resolvedImages : safeThumbnail ? [safeThumbnail] : []);
  const derivedStatus =
    mediaStatus && MEDIA_STATUS.includes(mediaStatus)
      ? mediaStatus
      : videoUrl
        ? "full"
        : normalizedSequence.length >= MAX_SEQUENCE_STEPS
          ? "full"
          : safeThumbnail || normalizedSequence.length
            ? "basic"
            : "none";

  return {
    status: derivedStatus,
    images: normalizedSequence,
    steps: normalizedSequence,
    videoUrl: videoUrl || null,
    thumbnail: safeThumbnail,
    assetPath: assetPath || null,
    generation: generation || null
  };
}

function normalizeMediaSequence(images) {
  const filtered = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!filtered.length) {
    return [];
  }
  const capped = filtered.slice(0, MAX_SEQUENCE_STEPS);
  if (capped.length >= MIN_SEQUENCE_STEPS) {
    while (capped.length < MAX_SEQUENCE_STEPS) {
      capped.push(capped[capped.length - 1]);
    }
    return capped;
  }
  while (capped.length < MIN_SEQUENCE_STEPS) {
    capped.push(capped[capped.length - 1]);
  }
  while (capped.length < MAX_SEQUENCE_STEPS) {
    capped.push(capped[capped.length - 1]);
  }
  return capped;
}

export function getMovementMedia(entry = {}) {
  const media = entry.media?.status
    ? entry.media
    : createMediaPayload({
        images: entry.media?.images || [],
        steps: entry.media?.steps || [],
        videoUrl: entry.media?.videoUrl || null,
        thumbnail: entry.media?.thumbnail || null,
        fallbackImage: entry.image || null,
        mediaStatus: entry.mediaStatus || null,
        assetPath: entry.media?.assetPath || null,
        generation: entry.media?.generation || null
      });
  const sequenceLabels = ["Step 1", "Step 2", "Step 3", "Step 4"];
  const sequence = sequenceLabels.map((label, index) => ({
    label,
    src: media.images?.[index] || media.images?.[media.images.length - 1] || null
  }));

  return {
    media,
    thumbnail: media.thumbnail || null,
    sequence,
    hasVideo: Boolean(media.videoUrl),
    hasThumbnail: Boolean(media.thumbnail),
    mediaStatus: media.status || "none",
    generation: media.generation || null,
    placeholderInitials: buildMovementInitials(entry.name || entry.title || "Move"),
    placeholderLabel: "Movement preview"
  };
}

export function createCatalogFamily({ familyId, defaults = {}, entries = [] }) {
  return entries.map((entry) =>
    createLibraryEntry({
      ...defaults,
      ...entry,
      familyIds: Array.from(new Set([...(defaults.familyIds || []), familyId, ...(entry.familyIds || [])]))
    })
  );
}

export function validateLibraryEntries(entries, label = "catalog") {
  const seenIds = new Set();
  const seenNames = new Set();

  return entries.map((entry) => {
    const normalized = createLibraryEntry(entry);
    const idKey = normalized.id.toLowerCase();
    const nameKey = normalized.name.toLowerCase();

    if (seenIds.has(idKey)) {
      throw new Error(`Duplicate ${label} id detected: ${normalized.id}`);
    }
    if (seenNames.has(nameKey)) {
      throw new Error(`Duplicate ${label} name detected: ${normalized.name}`);
    }

    seenIds.add(idKey);
    seenNames.add(nameKey);
    return normalized;
  });
}

export function createLibraryEntry({
  id,
  name,
  mode,
  trainingType,
  category,
  primaryMuscleGroup,
  secondaryMuscleGroups = [],
  movementPattern,
  equipmentRequirements = [],
  difficultyLevel = "standard",
  trainingGoals = [],
  jointStressLevel = "moderate",
  rehabSafe = false,
  environments = [],
  mobilityCategory = null,
  bodyAreaFocus = [],
  injurySupportType = [],
  intensityProfile = "moderate",
  variationFamily = null,
  familyIds = [],
  relatedIds = [],
  instructions = [],
  mistakes = [],
  cues = [],
  safetyNotes = [],
  modifications = [],
  media = null,
  extra = {}
}) {
  const normalizedId = String(id || "").trim();
  const normalizedName = String(name || "").trim();
  const normalizedTrainingType = String(trainingType || mode || "").trim() || "training";
  const normalizedCategory = String(category || "").trim();
  const normalizedPrimaryMuscle = String(primaryMuscleGroup || "").trim() || "General";
  const normalizedMovementPattern = String(movementPattern || "").trim() || "General";

  if (!normalizedId) {
    throw new Error("Catalog entries require an id.");
  }
  if (!normalizedName) {
    throw new Error(`Catalog entry ${normalizedId} requires a name.`);
  }
  if (!normalizedCategory) {
    throw new Error(`Catalog entry ${normalizedId} requires a category.`);
  }

  const normalizedInstructions = normalizeStringArray(instructions);
  const normalizedMistakes = normalizeStringArray(mistakes);
  const normalizedCues = normalizeStringArray(cues);
  const normalizedSafetyNotes = normalizeStringArray(safetyNotes);
  const normalizedModifications = normalizeStringArray(modifications);

  return {
    id: normalizedId,
    title: normalizedName,
    name: normalizedName,
    mode: normalizedTrainingType,
    trainingType: normalizedTrainingType,
    contentType: normalizedTrainingType,
    category: normalizedCategory,
    subcategory: variationFamily ? String(variationFamily).trim() : normalizedCategory,
    primaryMuscleGroup: normalizedPrimaryMuscle,
    secondaryMuscleGroups: normalizeStringArray(secondaryMuscleGroups),
    movementPattern: normalizedMovementPattern,
    equipmentRequirements: normalizeStringArray(equipmentRequirements),
    difficultyLevel: String(difficultyLevel || "standard").trim() || "standard",
    trainingGoals: normalizeStringArray(trainingGoals),
    jointStressLevel: String(jointStressLevel || "moderate").trim() || "moderate",
    rehabSafe: Boolean(rehabSafe),
    mobilityCategory: mobilityCategory ? String(mobilityCategory).trim() : null,
    bodyAreaFocus: normalizeStringArray(bodyAreaFocus),
    injurySupportType: normalizeStringArray(injurySupportType),
    intensityProfile: String(intensityProfile || "moderate").trim() || "moderate",
    recoveryProfile: String(intensityProfile || "moderate").trim() || "moderate",
    variationFamily: variationFamily ? String(variationFamily).trim() : null,
    familyIds: normalizeStringArray(familyIds),
    relatedIds: normalizeStringArray(relatedIds),
    relatedContentIds: normalizeStringArray(relatedIds),
    environments: normalizeStringArray(environments),
    instructions: normalizedInstructions,
    mistakes: normalizedMistakes,
    cues: normalizedCues,
    safetyNotes: normalizedSafetyNotes,
    modifications: normalizedModifications,
    media: media?.status ? media : createMediaPayload(media || {}),
    mediaStatus: media?.status || createMediaPayload(media || {}).status,
    tags: {
      trainingType: normalizedTrainingType,
      primaryMuscleGroup: normalizedPrimaryMuscle,
      secondaryMuscleGroups: normalizeStringArray(secondaryMuscleGroups),
      movementPattern: normalizedMovementPattern,
      equipmentRequirements: normalizeStringArray(equipmentRequirements),
      difficultyLevel: String(difficultyLevel || "standard").trim() || "standard",
      trainingGoals: normalizeStringArray(trainingGoals),
      jointStressLevel: String(jointStressLevel || "moderate").trim() || "moderate",
      rehabSafe: Boolean(rehabSafe),
      mobilityCategory: mobilityCategory ? String(mobilityCategory).trim() : null,
      bodyAreaFocus: normalizeStringArray(bodyAreaFocus),
      injurySupportType: normalizeStringArray(injurySupportType),
      intensityProfile: String(intensityProfile || "moderate").trim() || "moderate",
      variationFamily: variationFamily ? String(variationFamily).trim() : null,
      familyIds: normalizeStringArray(familyIds)
    },
    difficulty: String(difficultyLevel || "standard").trim() || "standard",
    goals: normalizeStringArray(trainingGoals),
    jointStress: String(jointStressLevel || "moderate").trim() || "moderate",
    equipment: normalizeStringArray(equipmentRequirements),
    bodyFocus: normalizeStringArray([normalizedPrimaryMuscle, ...normalizeStringArray(secondaryMuscleGroups)]),
    movementPatterns: normalizeStringArray([normalizedMovementPattern]),
    guidance: {
      instructions: normalizedInstructions,
      mistakes: normalizedMistakes,
      cues: normalizedCues,
      safetyNotes: normalizedSafetyNotes,
      modifications: normalizedModifications
    },
    ...extra
  };
}

function normalizeStringArray(values) {
  return Array.isArray(values)
    ? Array.from(
        new Set(
          values
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      )
    : [];
}

function buildMovementInitials(value) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.length ? parts.map((part) => part[0]?.toUpperCase() || "").join("") : "MV";
}

```

## FILE: shared/libraryTaxonomy.js

`$ext
import { createMediaPayload } from "./exerciseCatalog.js";

export const WORKOUT_DISCOVERY_CATEGORIES = [
  { id: "all", label: "All workouts", description: "Browse the full training library." },
  { id: "full_body", label: "Full Body", description: "Balanced sessions that cover the whole body." },
  { id: "upper_body", label: "Upper Body", description: "Pressing and pulling sessions for the upper body." },
  { id: "lower_body", label: "Lower Body", description: "Lower-body sessions built around squat, hinge, and single-leg work." },
  { id: "push", label: "Push", description: "Chest, shoulders, and triceps sessions." },
  { id: "pull", label: "Pull", description: "Back, rear-delt, and biceps sessions." },
  { id: "legs", label: "Legs", description: "Lower-body sessions with more dedicated leg volume." },
  { id: "chest", label: "Chest", description: "Chest-led pressing sessions." },
  { id: "back", label: "Back", description: "Back-led pulling sessions." },
  { id: "shoulders", label: "Shoulders", description: "Shoulder priority sessions and health work." },
  { id: "arms", label: "Arms", description: "Direct arm support and accessory work." },
  { id: "glutes", label: "Glutes", description: "Hip-drive and glute emphasis." },
  { id: "core", label: "Core", description: "Carries, control, and trunk stability." },
  { id: "strength", label: "Strength", description: "Main-lift-first sessions with more load emphasis." },
  { id: "muscle_building", label: "Muscle Building", description: "Volume-forward sessions for muscle gain." },
  { id: "fat_loss", label: "Fat Loss", description: "Efficient sessions that keep pace high enough to stay moving." },
  { id: "conditioning", label: "Conditioning", description: "Faster-paced finishers and density work." },
  { id: "bodyweight", label: "Bodyweight", description: "Sessions that stay useful without heavy equipment." },
  { id: "at_home", label: "At Home", description: "Home-friendly sessions that stay practical." },
  { id: "dumbbell", label: "Dumbbell", description: "Sessions built around dumbbells and simple setups." },
  { id: "beginner", label: "Beginner", description: "Clearer pacing and simpler exercise demands." },
  { id: "intermediate", label: "Intermediate", description: "Steadier volume and more movement variety." },
  { id: "advanced", label: "Advanced", description: "Denser or heavier session options." },
  { id: "joint_friendly", label: "Joint-Friendly", description: "Lower-stress choices that still move the week forward." },
  { id: "forty_plus", label: "40+", description: "Smoother pacing and recovery-aware training." },
  { id: "recovery_day", label: "Recovery Day", description: "Lower-stress sessions for lighter training days." },
  { id: "hybrid_setup", label: "Hybrid Setup", description: "Flexible sessions for mixed equipment setups." }
];

export const PLAN_DISCOVERY_CATEGORIES = [
  { id: "build_muscle", label: "Build Muscle", description: "Training paths built around repeatable volume and recovery." },
  { id: "lose_fat", label: "Lose Fat", description: "Training paths that keep consistency high while cutting noise." },
  { id: "improve_strength", label: "Improve Strength", description: "Main-lift-forward plans that keep progression believable." },
  { id: "general_fitness", label: "General Fitness", description: "Balanced plans that keep training useful across the week." },
  { id: "beginner_restart", label: "Beginner Restart", description: "A simpler path back into training after a long gap." },
  { id: "at_home_consistency", label: "At-Home Consistency", description: "Home-first plans that stay effective without a full gym." },
  { id: "joint_friendly_training", label: "Joint-Friendly Training", description: "Plans that reduce wear while keeping momentum alive." },
  { id: "training_recovery", label: "Training + Recovery", description: "Plans with more recovery and mobility built in." },
  { id: "busy_schedule", label: "Busy Schedule", description: "Shorter sessions with cleaner weekly structure." },
  { id: "dumbbell_only", label: "Dumbbell-Only", description: "Plans that stay strong with dumbbells and basic tools." },
  { id: "mobility_priority", label: "Mobility Priority", description: "Movement-first plans that still keep training useful." },
  { id: "recomposition", label: "Recomposition", description: "Balanced training for getting leaner while holding strength." },
  { id: "performance_support", label: "Performance Support", description: "Athletic support paths that keep training quality high." }
];

export const EXERCISE_LIBRARY_CATEGORIES = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "legs", label: "Legs" },
  { id: "glutes", label: "Glutes" },
  { id: "core", label: "Core" },
  { id: "full_body", label: "Full Body" },
  { id: "conditioning", label: "Conditioning" },
  { id: "mobility", label: "Mobility" },
  { id: "stretching", label: "Stretching" },
  { id: "rehab", label: "Rehab / Physio" },
  { id: "recovery", label: "Recovery" }
];

export const TOOL_CATEGORIES = [
  { id: "training_tools", label: "Training tools", description: "Helpers that keep session decisions easier." },
  { id: "progress_tools", label: "Progress tools", description: "Tools that keep your history and consistency visible." },
  { id: "recovery_tools", label: "Recovery tools", description: "Support tools for mobility, recovery, and training load." },
  { id: "nutrition_tools", label: "Nutrition tools", description: "Simple food and hydration support tools." }
];

export const TOOL_LIBRARY = [
  { id: "workout-history", title: "Workout history", category: "progress_tools", to: "/preferences?section=preferences", summary: "Review completed sessions, exercise choices, and recent logs." },
  { id: "strength-progression", title: "Strength progression", category: "progress_tools", to: "/preferences?section=preferences", summary: "Track last load, best load, and how lifts are trending over time." },
  { id: "weekly-consistency", title: "Weekly consistency tracker", category: "progress_tools", to: "/progress", summary: "Keep the week connected with one simple progress signal." },
  { id: "split-selector", title: "Workout selector / split helper", category: "training_tools", to: "/workouts", summary: "Choose the right split, setup, and session for the day." },
  { id: "mobility-selector", title: "Mobility selector", category: "recovery_tools", to: "/mobility", summary: "Find the right recovery or rehab flow by area, time, and recovery state." },
  { id: "nutrition-support", title: "Nutrition guidance", category: "nutrition_tools", to: "/nutrition", summary: "Keep food direction, hydration, and recovery support practical." }
];

export const PLAN_LIBRARY = [
  planEntry("strength-base-builder", "Strength Base Builder", "improve_strength", "strength", "intermediate", ["full_gym", "hybrid"], ["gym", "hybrid"], "moderate", "moderate", "balanced", "A main-lift-first path that builds a stronger weekly structure without overcomplicating the week."),
  planEntry("lean-recomp-path", "Lean Recomp Path", "recomposition", "fat_loss", "intermediate", ["hybrid", "bench_dumbbells", "full_gym"], ["home", "gym", "hybrid"], "moderate", "moderate", "balanced", "A balanced path for tightening up body composition while keeping training quality high."),
  planEntry("joint-smart-muscle-plan", "Joint-Smart Muscle Plan", "joint_friendly_training", "bodybuilding", "beginner", ["hybrid", "bench_dumbbells", "full_gym"], ["home", "gym", "hybrid"], "moderate", "high", "joint_friendly", "A muscle-building path with more recovery room and lower-stress movement choices."),
  planEntry("dumbbell-momentum-plan", "Dumbbell Momentum Plan", "dumbbell_only", "general_fitness", "beginner", ["dumbbells_only", "bench_dumbbells"], ["home", "hybrid"], "short", "moderate", "balanced", "A cleaner weekly path for dumbbell-only training that still feels structured."),
  planEntry("full-body-consistency-track", "Full-Body Consistency Track", "general_fitness", "general_fitness", "beginner", ["bodyweight", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"], "short", "moderate", "balanced", "A full-body path for staying consistent when life is busy and variety matters."),
  planEntry("recovery-first-training-week", "Recovery-First Training Week", "training_recovery", "mobility", "beginner", ["bodyweight", "hybrid", "bench_dumbbells"], ["home", "gym", "hybrid"], "short", "low", "recovery_focused", "A training week that gives recovery and movement quality more room without going idle."),
  planEntry("hybrid-performance-path", "Hybrid Performance Path", "performance_support", "athletic_performance", "advanced", ["hybrid", "full_gym"], ["home", "gym", "hybrid"], "moderate", "high", "performance", "A mixed-environment path for keeping performance work sharp across the week."),
  planEntry("beginner-restart-track", "Beginner Restart Track", "beginner_restart", "general_fitness", "beginner", ["bodyweight", "hybrid", "dumbbells_only"], ["home", "gym", "hybrid"], "short", "low", "joint_friendly", "A lower-friction path back into training after a break."),
  planEntry("at-home-consistency-loop", "At-Home Consistency Loop", "at_home_consistency", "general_fitness", "beginner", ["bodyweight", "bands", "dumbbells_only"], ["home", "hybrid"], "short", "moderate", "balanced", "A home-first path that keeps the app simple and the week repeatable."),
  planEntry("mobility-priority-path", "Mobility Priority Path", "mobility_priority", "mobility", "beginner", ["bodyweight", "bands", "hybrid"], ["home", "gym", "hybrid"], "short", "low", "recovery_focused", "A movement-first path that still keeps training options open."),
  planEntry("busy-schedule-build", "Busy Schedule Build", "busy_schedule", "general_fitness", "intermediate", ["hybrid", "bench_dumbbells", "bodyweight"], ["home", "gym", "hybrid"], "short", "moderate", "balanced", "A time-efficient path for fitting useful training into a crowded week.")
];

export const WORKOUT_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "shortest", label: "Shortest" },
  { value: "easiest", label: "Easiest" },
  { value: "recovery_friendly", label: "Most recovery-friendly" },
  { value: "equipment_efficient", label: "Most equipment-efficient" }
];

export const MOBILITY_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "shortest", label: "Shortest" },
  { value: "easiest", label: "Easiest" },
  { value: "recovery_friendly", label: "Most recovery-friendly" }
];

function planEntry(id, title, category, goal, experienceLevel, equipment, environment, scheduleStructure, intensity, recoveryProfile, summary) {
  return {
    id,
    title,
    contentType: "plan",
    category,
    subcategory: goal,
    goal,
    experienceLevel,
    equipment,
    environment,
    duration: scheduleStructure,
    intensity,
    difficulty: experienceLevel,
    bodyFocus: goal === "mobility" ? ["mobility", "recovery"] : ["full_body"],
    movementPatterns: goal === "strength" ? ["push", "pull", "squat", "hinge"] : ["balanced_training"],
    recoveryProfile,
    jointStress: recoveryProfile === "joint_friendly" ? "low" : intensity === "high" ? "moderate" : "low",
    rehabSafe: recoveryProfile !== "performance",
    summary,
    guidance: {
      focus: `Use ${title} when you want the week to feel more ${goal.replaceAll("_", " ")}-driven.`,
      nextMove: "Pick the next session that matches the plan and let the week stay connected."
    },
    media: createMediaPayload(),
    relatedContentIds: [],
    tags: [category, goal, experienceLevel, recoveryProfile]
  };
}

```

## FILE: shared/mediaGenerationConfig.js

`$ext
import { buildMediaAssetPath } from "./exerciseCatalog.js";

export const PULSEPEAK_MEDIA_VERSION = "pulsepeak-media-v2";
export const PULSEPEAK_MEDIA_STEP_STATES = ["start position", "mid movement", "peak contraction", "finish position"];
export const PULSEPEAK_IMAGE_REQUIREMENTS = {
  minimumSteps: 2,
  standardSteps: 3,
  idealSteps: 4
};

export const PULSEPEAK_MEDIA_SYSTEM = {
  generator: "Leonardo AI",
  phase: "phase_1",
  version: PULSEPEAK_MEDIA_VERSION,
  visualStyle: {
    subject: "athletic, realistic fitness model with balanced muscle definition and natural skin texture",
    lighting: "soft gym lighting with natural shadows and no dramatic cinematic contrast",
    framing: "consistent full-body or 45-degree training frame with the movement clearly visible",
    angle: "front or 45-degree only",
    environment: "modern gym with clean background and minimal clutter",
    wardrobe: "consistent modern training apparel with neutral tones",
    look: "professional fitness photography, sharp detail, believable anatomy, consistent visual identity"
  },
  storage: {
    publicRoot: "/media/exercises",
    localRoot: "public/media/exercises"
  },
  stepLabels: PULSEPEAK_MEDIA_STEP_STATES,
  generationRules: {
    lockedModelsOnly: true,
    sameIdentityRequired: true,
    sameLightingRequired: true,
    sameEnvironmentRequired: true,
    sameFramingRequired: true
  }
};

export const PULSEPEAK_MODELS = {
  male: {
    key: "male",
    label: "Model A (Male)",
    referenceId: "pulsepeak-model-a-v1",
    seed: "PP-MALE-ATHLETIC-001",
    heightRange: "5'10-6'0",
    build: "athletic build with visible muscle definition, not bodybuilding size",
    face: "neutral face, clean jawline, natural expression",
    hair: "short dark hair",
    skin: "natural skin texture with visible pores, not plastic",
    aesthetic: "modern gym look with consistent training apparel",
    lockingMethod: "reference image or locked seed / platform character reference",
    description:
      "Athletic male model, 5'10-6'0, balanced muscle, short dark hair, neutral face, natural skin texture, modern gym look."
  },
  female: {
    key: "female",
    label: "Model B (Female)",
    referenceId: "pulsepeak-model-b-v1",
    seed: "PP-FEMALE-ATHLETIC-001",
    heightRange: "5'5-5'8",
    build: "athletic, toned, strong but realistic",
    face: "neutral face with consistent proportions",
    hair: "tied-back hair",
    skin: "natural skin texture with realistic detail",
    aesthetic: "modern fitness aesthetic with consistent training apparel",
    lockingMethod: "reference image or locked seed / platform character reference",
    description:
      "Athletic female model, 5'5-5'8, toned and realistic, tied-back hair, neutral face, natural skin texture, modern fitness aesthetic."
  }
};

export const STANDARD_EXERCISE_PROMPT_TEMPLATE =
  "high-quality fitness photo of [MODEL], performing [EXERCISE NAME], [STEP STATE], correct form, natural skin texture, modern gym, clean background, soft lighting, professional fitness photography, sharp detail";

export const PULSEPEAK_MEDIA_VALIDATION_RULES = {
  rejectIf: [
    "anatomy is wrong",
    "hands are broken",
    "pose is unclear",
    "wrong exercise is shown",
    "model identity changes",
    "lighting or framing does not match the PulsePeak style",
    "environment or clothing breaks consistency"
  ],
  approveOnlyIf: [
    "the movement is instantly understandable",
    "posture is clean and believable",
    "the same locked model identity is preserved",
    "the image clearly matches the intended movement phase",
    "the image fits the PulsePeak visual style"
  ]
};

export const INITIAL_EXERCISE_MEDIA_BATCH = [
  { id: "push-up", name: "Push-up", modelKey: "male", priority: "high" },
  { id: "goblet-squat", name: "Goblet squat", modelKey: "female", priority: "high" },
  { id: "dumbbell-shoulder-press", name: "Dumbbell shoulder press", modelKey: "female", priority: "high" },
  { id: "single-arm-dumbbell-row", name: "Single-arm dumbbell row", modelKey: "male", priority: "high" },
  { id: "lat-pulldown", name: "Lat pulldown", modelKey: "male", priority: "high" },
  { id: "romanian-deadlift", name: "Romanian deadlift", modelKey: "male", priority: "high" },
  { id: "walking-lunge", name: "Walking lunge", modelKey: "female", priority: "high" },
  { id: "glute-bridge", name: "Glute bridge", modelKey: "female", priority: "high" },
  { id: "plank-shoulder-tap", name: "Plank shoulder tap", modelKey: "male", priority: "high" },
  { id: "pallof-press", name: "Pallof press", modelKey: "female", priority: "high" },
  { id: "cat-cow", name: "Cat-cow", modelKey: "female", priority: "high" },
  { id: "worlds-greatest-stretch", name: "World's greatest stretch", modelKey: "male", priority: "high" },
  { id: "ninety-ninety-hip-flow", name: "90/90 hip flow", modelKey: "female", priority: "high" },
  { id: "thoracic-rotation", name: "Thoracic rotation", modelKey: "female", priority: "high" },
  { id: "hip-flexor-stretch", name: "Hip flexor stretch", modelKey: "male", priority: "high" },
  { id: "hamstring-stretch", name: "Hamstring stretch", modelKey: "female", priority: "high" },
  { id: "wall-slide", name: "Wall slide", modelKey: "female", priority: "high" },
  { id: "band-pull-apart", name: "Band pull-apart", modelKey: "male", priority: "high" },
  { id: "dead-bug-breathing", name: "Dead bug breathing", modelKey: "male", priority: "high" },
  { id: "spanish-squat-hold", name: "Spanish squat hold", modelKey: "female", priority: "high" }
];

export function buildExerciseMediaSpec({
  id,
  name,
  familyId = "general",
  trainingType = "training",
  fallbackImage = null,
  modelKey = null,
  stepCount = PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps
}) {
  const selectedModel = PULSEPEAK_MODELS[modelKey] || resolveLockedModelForExercise({ id, familyId, trainingType });
  const resolvedStepCount = normalizeStepCount(stepCount);
  const assetPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.publicRoot, id);
  const localPath = buildMediaAssetPath(PULSEPEAK_MEDIA_SYSTEM.storage.localRoot, id);
  const prompts = buildMovementPromptSet({ model: selectedModel, exerciseName: name, stepCount: resolvedStepCount });

  return {
    thumbnail: fallbackImage || null,
    images: [],
    steps: [],
    videoUrl: null,
    mediaStatus: fallbackImage ? "basic" : "none",
    assetPath,
    generation: {
      tool: PULSEPEAK_MEDIA_SYSTEM.generator,
      phase: PULSEPEAK_MEDIA_SYSTEM.phase,
      systemVersion: PULSEPEAK_MEDIA_SYSTEM.version,
      familyId,
      trainingType,
      modelKey: selectedModel.key,
      modelLabel: selectedModel.label,
      modelReferenceId: selectedModel.referenceId,
      modelSeed: selectedModel.seed,
      localPath,
      thumbnailPath: buildMediaAssetPath(assetPath, "thumbnail.png"),
      stepCount: resolvedStepCount,
      stepPaths: Array.from({ length: resolvedStepCount }, (_, index) => buildMediaAssetPath(assetPath, `step-${index + 1}.png`)),
      prompts,
      validationRules: PULSEPEAK_MEDIA_VALIDATION_RULES,
      consistencyLock: {
        modelKey: selectedModel.key,
        referenceId: selectedModel.referenceId,
        seed: selectedModel.seed,
        lighting: PULSEPEAK_MEDIA_SYSTEM.visualStyle.lighting,
        angle: PULSEPEAK_MEDIA_SYSTEM.visualStyle.angle,
        environment: PULSEPEAK_MEDIA_SYSTEM.visualStyle.environment,
        wardrobe: PULSEPEAK_MEDIA_SYSTEM.visualStyle.wardrobe
      }
    }
  };
}

export function buildMovementPromptSet({ model, exerciseName, stepCount = PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps }) {
  const resolvedStepCount = normalizeStepCount(stepCount);
  return PULSEPEAK_MEDIA_SYSTEM.stepLabels.slice(0, resolvedStepCount).map((stepState, index) => ({
    step: index + 1,
    label: stepState,
    prompt: STANDARD_EXERCISE_PROMPT_TEMPLATE.replace("[MODEL]", buildLockedModelPrompt(model))
      .replace("[EXERCISE NAME]", exerciseName)
      .replace("[STEP STATE]", stepState)
  }));
}

export function getInitialMediaBatch() {
  return INITIAL_EXERCISE_MEDIA_BATCH.map((entry) => ({
    ...entry,
    generator: PULSEPEAK_MEDIA_SYSTEM.generator,
    model: PULSEPEAK_MODELS[entry.modelKey],
    prompts: buildMovementPromptSet({ model: PULSEPEAK_MODELS[entry.modelKey], exerciseName: entry.name })
  }));
}

export function resolveLockedModelForExercise({ id, familyId = "", trainingType = "" }) {
  const value = [id, familyId, trainingType].join(" ").toLowerCase();
  if (["glute", "stretch", "mobility", "rotation", "slide", "flow", "bridge", "lunge"].some((token) => value.includes(token))) {
    return PULSEPEAK_MODELS.female;
  }
  return PULSEPEAK_MODELS.male;
}

export function normalizeStepCount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps;
  }
  return Math.max(PULSEPEAK_IMAGE_REQUIREMENTS.minimumSteps, Math.min(PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps, Math.round(numericValue)));
}

function buildLockedModelPrompt(model) {
  return `${model.label}, same PulsePeak reference identity, ${model.description}`;
}

```

## FILE: shared/mediaReviewCatalog.js

`$ext
export const MEDIA_REVIEW_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  NEEDS_REGENERATION: "needs_regeneration"
};

export const MEDIA_APPROVAL_STANDARD = {
  rejectIf: [
    "Anatomy looks broken or distorted.",
    "Hands, fingers, or joints look malformed or unnatural.",
    "Posture or body proportions look unrealistic for the movement.",
    "The movement phase is unclear or does not match the intended exercise step.",
    "Model identity looks inconsistent with the PulsePeak visual system.",
    "Face or body proportions drift away from the locked model.",
    "Lighting feels fake, plastic, or overly synthetic.",
    "The gym or home setup looks messy, warped, or visually distracting.",
    "Equipment, clothing, or environment looks malformed or distorted.",
    "Framing hides the key mechanics needed to understand the movement."
  ],
  approveOnlyIf: [
    "The exercise is instantly understandable.",
    "Posture and body proportions are believable.",
    "Equipment and setup are correct for the movement.",
    "The start, mid, peak, or finish step is clearly represented.",
    "The image feels clean, premium, and consistent with PulsePeak style.",
    "The locked PulsePeak male or female model is preserved clearly.",
    "The movement phase clearly represents the intended position."
  ]
};

const REVIEWED_MEDIA = {
  "push-up": approvedAsset("push-up-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=push-up+exercise+form"
  }),
  squat: approvedAsset("squat-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=squat+exercise+form"
  }),
  row: approvedAsset("row-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=single-arm+dumbbell+row+exercise+form"
  }),
  "dumbbell-press": approvedAsset("dumbbell-press-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=dumbbell+bench+press+exercise+form"
  }),
  deadlift: approvedAsset("deadlift-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=romanian+deadlift+dumbbell+exercise+form"
  }),
  lunge: approvedAsset("lunge"),
  "glute-bridge": approvedAsset("glute-bridge"),
  plank: approvedAsset("plank"),
  "cat-cow": approvedAsset("cat-cow-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=cat-cow+exercise+form"
  }),
  "worlds-greatest-stretch": approvedAsset("worlds-greatest-stretch"),
  "thoracic-rotation": approvedAsset("thoracic-rotation"),
  "wall-slide": approvedAsset("wall-slide"),
  "overhead-press": approvedAsset("overhead-press-photo", {
    videoUrl: "https://www.youtube.com/results?search_query=dumbbell+overhead+press+exercise+form"
  }),
  "hamstring-stretch": approvedAsset("hamstring-stretch"),
  "hip-flexor-stretch": approvedAsset("hip-flexor-stretch"),
  "band-pull-apart": approvedAsset("band-pull-apart"),
  "wall-squat": approvedAsset("wall-squat"),
  "supported-split-squat": approvedAsset("supported-split-squat"),
  "shoulder-mobility": approvedAsset("shoulder-mobility"),
  "lat-pulldown": approvedAsset("lat-pulldown-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "dead-bug": approvedAsset("dead-bug-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "side-plank": approvedAsset("side-plank", {
    extension: "svg",
    reviewSource: "owned_reference_illustration"
  }),
  "mountain-climber": approvedAsset("mountain-climber-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "high-knees": approvedAsset("high-knees-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  burpee: approvedAsset("burpee-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "hip-flow-90-90": approvedAsset("hip-flow-90-90-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "childs-pose-side-reach": approvedAsset("childs-pose-side-reach-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "ankle-rocks": approvedAsset("ankle-rocks-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "triceps-pushdown": approvedAsset("triceps-pushdown-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "biceps-curl": approvedAsset("biceps-curl-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "lateral-raise": approvedAsset("lateral-raise-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "calf-raise": approvedAsset("calf-raise-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  }),
  "hip-thrust": approvedAsset("hip-thrust-photo", {
    reviewSource: "pulsepeak_family_photo_fallback"
  })
};

export function getReviewedMediaAsset(key) {
  const entry = REVIEWED_MEDIA[key];
  if (!entry || entry.status !== MEDIA_REVIEW_STATUSES.APPROVED) {
    return null;
  }
  return entry;
}

export function getMediaReviewStatus(key) {
  return REVIEWED_MEDIA[key] || pendingAsset();
}

function approvedAsset(assetName, options = {}) {
  const extension = options.extension || (assetName.endsWith("-photo") ? "png" : "svg");
  const src = `/movements/${assetName}.${extension}`;
  return {
    status: MEDIA_REVIEW_STATUSES.APPROVED,
    modelKey: options.modelKey || null,
    reviewSource: options.reviewSource || (extension === "png" ? "pulsepeak_ai_photo_v1" : "owned_reference_illustration"),
    image: src,
    thumbnail: src,
    images: [src, src, src, src],
    steps: [src, src, src, src],
    stepCount: 4,
    validationPassed: true,
    videoUrl: options.videoUrl || null,
    approvedAt: options.approvedAt || "2026-04-22"
  };
}

function pendingAsset() {
  return {
    status: MEDIA_REVIEW_STATUSES.PENDING,
    reviewSource: "awaiting_batch_review",
    image: null,
    thumbnail: null,
    images: [],
    approvedAt: null
  };
}

```

## FILE: shared/nutritionMedia.js

`$ext
export const NUTRITION_TEMPLATE_MEDIA = {
  "high-protein-breakfast": {
    image: "/nutrition/high-protein-breakfast.png",
    alt: "High-protein breakfast example with eggs, yogurt, oats, and fruit."
  },
  "quick-lunch": {
    image: "/nutrition/quick-lunch.png",
    alt: "Quick lunch example with a balanced high-protein bowl."
  },
  "protein-gap-snack": {
    image: "/nutrition/protein-gap-snack.png",
    alt: "Protein-focused snack example with dairy, fruit, and quick grab options."
  }
};

export function getNutritionTemplateMedia(templateId) {
  return NUTRITION_TEMPLATE_MEDIA[templateId] || null;
}

```

## FILE: shared/profileState.js

`$ext
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

```

## FILE: shared/unitSystem.js

`$ext
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

```

## FILE: shared/workoutEngine.js

`$ext
export const EQUIPMENT_PROFILE_OPTIONS = [
  {
    value: "full_gym",
    label: "Full gym",
    description: "Barbells, machines, cables, benches, and more.",
    environments: ["gym", "hybrid"]
  },
  {
    value: "bench_dumbbells",
    label: "Bench + dumbbells",
    description: "A bench plus enough dumbbells for pressing and lower-body work.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "dumbbells_only",
    label: "Dumbbells only",
    description: "A practical setup for full-body home sessions.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "bodyweight",
    label: "Bodyweight",
    description: "No equipment needed beyond floor space.",
    environments: ["home", "hybrid"]
  },
  {
    value: "bands",
    label: "Bands",
    description: "Resistance bands for pulling, pressing, and joint-friendly support work.",
    environments: ["home", "gym", "hybrid"]
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "A mix of gym days and lighter home sessions through the week.",
    environments: ["home", "gym", "hybrid"]
  }
];

export const EQUIPMENT_SELECTION_OPTIONS = [
  { value: "bodyweight", label: "Bodyweight", environments: ["home", "gym", "hybrid"] },
  { value: "bench", label: "Bench", environments: ["home", "gym", "hybrid"] },
  { value: "dumbbells", label: "Dumbbells", environments: ["home", "gym", "hybrid"] },
  { value: "kettlebells", label: "Kettlebells", environments: ["home", "gym", "hybrid"] },
  { value: "bands", label: "Resistance bands", environments: ["home", "gym", "hybrid"] },
  { value: "pull_up_bar", label: "Pull-up bar", environments: ["home", "gym", "hybrid"] },
  { value: "barbell", label: "Barbell", environments: ["gym", "hybrid"] },
  { value: "machines", label: "Machines / cables", environments: ["gym", "hybrid"] }
];

const EQUIPMENT_PROFILE_SELECTION_MAP = {
  full_gym: ["bodyweight", "bench", "dumbbells", "barbell", "machines"],
  bench_dumbbells: ["bodyweight", "bench", "dumbbells"],
  dumbbells_only: ["bodyweight", "dumbbells"],
  bodyweight: ["bodyweight"],
  bands: ["bodyweight", "bands"],
  hybrid: ["bodyweight", "bench", "dumbbells", "bands", "pull_up_bar"]
};

export const WORKOUT_FOCUS_OPTIONS = [
  { value: "chest", label: "Chest", description: "Chest-dominant pressing work without a full push day." },
  { value: "back", label: "Back", description: "Back-focused pulling and row work." },
  { value: "shoulders", label: "Shoulders", description: "Overhead pressing, lateral work, and upper-back support." },
  { value: "legs", label: "Legs", description: "Squat, hinge, lunge, and lower-body support work." },
  { value: "glutes", label: "Glutes", description: "Hip extension, glute drive, and lower-body support." },
  { value: "arms", label: "Arms", description: "A simple arm-focused session with biceps and triceps support." },
  { value: "biceps", label: "Biceps", description: "Pulling and curl work with extra biceps emphasis." },
  { value: "triceps", label: "Triceps", description: "Pressing support with direct triceps work." },
  { value: "forearms", label: "Forearms", description: "Grip, pulling support, and forearm-friendly arm work." },
  { value: "calves", label: "Calves", description: "Lower-body work with extra calf support." },
  { value: "core_abs", label: "Core / abs", description: "Core-focused support work around a lighter training day." },
  { value: "push", label: "Push", description: "Pressing-focused upper-body work for chest, shoulders, and triceps." },
  { value: "pull", label: "Pull", description: "Rows, pulls, and rear-side work for the back and biceps." },
  { value: "chest_triceps", label: "Chest + triceps", description: "A chest-heavy session with direct triceps support." },
  { value: "back_biceps", label: "Back + biceps", description: "Back thickness, pulling strength, and arm support together." },
  { value: "upper_body", label: "Upper body", description: "Balanced pressing and pulling when you want one complete upper session." },
  { value: "lower_body", label: "Lower body", description: "A structured lower-body day with strength and support work." },
  { value: "full_body", label: "Full body", description: "One efficient session when time, equipment, or recovery is tighter." },
  { value: "mobility_recovery", label: "Mobility / recovery day", description: "Low-load movement support when recovery should lead." }
];

export function formatWorkoutFocus(value) {
  return WORKOUT_FOCUS_OPTIONS.find((option) => option.value === value)?.label || "Workout focus";
}

export function getDefaultEquipmentProfile(trainingEnvironment = "hybrid") {
  if (trainingEnvironment === "gym") {
    return "full_gym";
  }
  if (trainingEnvironment === "home") {
    return "dumbbells_only";
  }
  return "hybrid";
}

export function getDefaultEquipmentSelections(trainingEnvironment = "hybrid") {
  return [...(EQUIPMENT_PROFILE_SELECTION_MAP[getDefaultEquipmentProfile(trainingEnvironment)] || ["bodyweight"])];
}

export function normalizeEquipmentProfile(value, trainingEnvironment = "hybrid") {
  const allowed = getEquipmentOptionsForEnvironment(trainingEnvironment).map((option) => option.value);
  if (allowed.includes(value)) {
    return value;
  }

  return getDefaultEquipmentProfile(trainingEnvironment);
}

export function normalizeEquipmentSelections(value, trainingEnvironment = "hybrid") {
  const allowed = new Set(getEquipmentSelectionOptionsForEnvironment(trainingEnvironment).map((option) => option.value));
  const selected = Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .map((entry) => String(entry || "").trim())
            .filter((entry) => allowed.has(entry))
        )
      )
    : [];

  if (selected.length) {
    return selected;
  }

  return getDefaultEquipmentSelections(trainingEnvironment);
}

export function getEquipmentSelectionOptionsForEnvironment(trainingEnvironment = "hybrid") {
  return EQUIPMENT_SELECTION_OPTIONS.filter((option) => {
    if (trainingEnvironment === "hybrid") {
      return true;
    }

    return option.environments.includes(trainingEnvironment);
  });
}

export function buildEquipmentProfileFromSelections(selections = [], trainingEnvironment = "hybrid") {
  const normalizedSelections = normalizeEquipmentSelections(selections, trainingEnvironment);
  const has = (value) => normalizedSelections.includes(value);

  if (has("machines") || has("barbell")) {
    return "full_gym";
  }
  if (has("bench") && has("dumbbells")) {
    return "bench_dumbbells";
  }
  if (has("dumbbells")) {
    return "dumbbells_only";
  }
  if (has("bands") && normalizedSelections.length <= 2) {
    return "bands";
  }
  if (normalizedSelections.length === 1 && has("bodyweight")) {
    return "bodyweight";
  }
  return trainingEnvironment === "gym" ? "full_gym" : "hybrid";
}

export function getEquipmentSelectionsForProfile(profile = {}) {
  return normalizeEquipmentSelections(
    profile.equipmentSelections || EQUIPMENT_PROFILE_SELECTION_MAP[profile.equipmentProfile] || [],
    profile.trainingEnvironment || "hybrid"
  );
}

export function formatEquipmentSelections(selections = []) {
  const labels = selections
    .map((value) => EQUIPMENT_SELECTION_OPTIONS.find((option) => option.value === value)?.label)
    .filter(Boolean);

  if (!labels.length) {
    return "Current setup";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  if (labels.length === 2) {
    return `${labels[0]} + ${labels[1]}`;
  }
  return `${labels.slice(0, 2).join(" + ")} + ${labels.length - 2} more`;
}

export function getEquipmentOptionsForEnvironment(trainingEnvironment = "hybrid") {
  return EQUIPMENT_PROFILE_OPTIONS.filter((option) => {
    if (trainingEnvironment === "hybrid") {
      return true;
    }

    return option.environments.includes(trainingEnvironment);
  });
}

export function getSuggestedWorkoutFocuses({ goalType = "general_fitness", injuryStatus = "none", lowRecovery = false } = {}) {
  if (injuryStatus === "active_injury") {
    return ["mobility_recovery", "upper_body", "lower_body"];
  }
  if (goalType === "mobility" || goalType === "injury_recovery") {
    return ["mobility_recovery", "full_body", "upper_body"];
  }
  if (lowRecovery) {
    return ["full_body", "mobility_recovery", "upper_body"];
  }

  switch (goalType) {
    case "strength":
      return ["upper_body", "lower_body", "push", "pull", "legs"];
    case "bodybuilding":
      return ["chest_triceps", "back_biceps", "shoulders", "legs", "upper_body"];
    case "fat_loss":
      return ["full_body", "upper_body", "lower_body", "mobility_recovery"];
    case "athletic_performance":
      return ["full_body", "legs", "pull", "mobility_recovery"];
    case "active_aging":
      return ["full_body", "lower_body", "mobility_recovery", "upper_body"];
    default:
      return ["upper_body", "lower_body", "full_body", "push", "pull"];
  }
}

```

## FILE: server/server.js

`$ext
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import {
  buildCoachDecisionEngine,
  buildCoachingTips,
  buildWeeklyCheckInState,
  buildWorkoutAccess,
  buildLimitedWeeklyPlan,
  buildWeeklyPlan,
  canStartTrial,
  calculateStreak,
  clearSession,
  countWeeklyLoggedWorkouts,
  createSession,
  createUser,
  findUserById,
  findUserByToken,
  getAccessTier,
  hasRecentWorkoutDuplicate,
  isPremiumEntitled,
  normalizeWorkout,
  normalizeWellnessData,
  sanitizeUser,
  sortWorkoutsDesc,
  summarizeDashboard,
  updateUserAccount,
  updateUserData,
  validateUser
} from "./data/store.js";
import { getMovementLibrary } from "./data/movementLibrary.js";
import { createWorkoutFromPreset, findWorkoutPresetForProfile, getWorkoutLibraryForProfile, getWorkoutLibraryMeta } from "./data/workoutLibrary.js";
import { applyStripeWebhookEvent } from "./stripeBilling.js";
import { CUSTOMIZABLE_MODULE_IDS } from "../shared/dashboardModules.js";
import { normalizeUnitPreference } from "../shared/unitSystem.js";
import {
  buildEquipmentProfileFromSelections,
  getEquipmentSelectionsForProfile,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../shared/workoutEngine.js";
import { APP_MODES, getHiddenModulesForAppMode, normalizeAppMode } from "../shared/appModes.js";

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const distPath = path.resolve(__dirname, "../dist");
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const monthlyPriceId = process.env.STRIPE_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID;
const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ID_YEARLY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const premiumPlanAmount = Number(process.env.STRIPE_PREMIUM_PRICE_CENTS || 1499);
const premiumPlanYearlyAmount = Number(process.env.STRIPE_PREMIUM_YEARLY_PRICE_CENTS || 11999);
const premiumPlanCurrency = process.env.STRIPE_PREMIUM_CURRENCY || "usd";
const TRIAL_DURATION_DAYS = 7;
const PRIMARY_WEBHOOK_PATH = "/api/webhook";
const LEGACY_WEBHOOK_PATH = "/api/stripe/webhook";
const appOrigin = normalizePublicOrigin(process.env.APP_ORIGIN);
const allowedCorsOrigins = buildAllowedCorsOrigins(process.env.CORS_ALLOWED_ORIGINS, appOrigin);

logStripeConfigurationWarnings();

app.set("trust proxy", 1);
app.use(
  cors(
    allowedCorsOrigins.length
      ? {
          origin(origin, callback) {
            if (!origin || allowedCorsOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error("CORS origin not allowed."));
          }
        }
      : {}
  )
);

function handleStripeWebhook(request, response) {
  try {
    if (!stripe || !stripeWebhookSecret) {
      throw new Error("Stripe webhook is not configured.");
    }

    const signature = request.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      return response.status(400).json({ message: "Missing Stripe signature." });
    }

    const event = stripe.webhooks.constructEvent(request.body, signature, stripeWebhookSecret);
    const result = applyStripeWebhookEvent(event);
    return response.json({
      received: true,
      duplicate: Boolean(result?.ignored)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
}

app.post(PRIMARY_WEBHOOK_PATH, express.raw({ type: "application/json" }), handleStripeWebhook);
app.post(LEGACY_WEBHOOK_PATH, express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", (request, response) => {
  try {
    const { name, email, password } = request.body;
    assertValidName(name);
    assertValidEmail(email);
    assertValidPassword(password);

    const user = createUser({ name, email, password });
    const token = createSession(user.id);

    return response.status(201).json({
      token,
      user: sanitizeUser(user),
      dashboard: buildUserSummary(user)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/auth/login", (request, response) => {
  try {
    const { email, password } = request.body;
    assertValidEmail(email);
    assertValidPassword(password, true);
    const user = validateUser(email, password);

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const token = createSession(user.id);
    return response.json({
      token,
      user: sanitizeUser(user),
      dashboard: buildUserSummary(user)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/auth/session", requireAuth, (request, response) => {
  response.json({
    user: sanitizeUser(request.user),
    dashboard: buildUserSummary(request.user)
  });
});

app.post("/api/auth/logout", requireAuth, (request, response) => {
  clearSession(request.token);
  response.status(204).end();
});

app.get("/api/dashboard", requireAuth, (request, response) => {
  response.json({
    user: sanitizeUser(request.user),
    data: request.user.data,
    summary: buildUserSummary(request.user)
  });
});

app.get("/api/workout-library", requireAuth, (request, response) => {
  const environment = request.query.environment || "both";
  const workoutType = request.query.type || "all";
  const focus = request.query.focus || "recommended";
  const equipmentSelections = parseEquipmentSelectionsQuery(
    request.query.equipmentSelections,
    request.user.data.profile?.trainingEnvironment,
    request.user.data.profile
  );
  const equipmentProfile =
    request.query.equipmentProfile ||
    buildEquipmentProfileFromSelections(equipmentSelections, request.user.data.profile?.trainingEnvironment);
  const lowRecovery = normalizeWellnessData(request.user.data).sleepHours < 6.5 || normalizeWellnessData(request.user.data).energyLevel === "Low";
  const filters = {
    environment,
    type: workoutType,
    focus,
    equipmentProfile,
    equipmentSelections,
    lowRecovery
  };
    const recentWorkouts = sortWorkoutsDesc((request.user.data.workouts || []).map(normalizeWorkout));
    const accessTier = getAccessTier(request.user);
    const workouts = getWorkoutLibraryForProfile(filters, request.user.data.profile, recentWorkouts, accessTier).filter(
      (workout) => workoutType === "all" || workout.type === workoutType
    );

  response.json({
    environment,
    equipmentProfile,
    equipmentSelections,
    type: workoutType,
    focus,
    workouts,
      meta: getWorkoutLibraryMeta(filters, request.user.data.profile, workouts, recentWorkouts, accessTier)
    });
  });

app.get("/api/movements", requireAuth, (_request, response) => {
  response.json({
    movements: getMovementLibrary()
  });
});

app.patch("/api/goals", requireAuth, (request, response) => {
  try {
    const nextGoals = {
      calories: parseNumberInRange(request.body.calories, 1200, 6000, "Calories"),
      protein: parseNumberInRange(request.body.protein, 40, 400, "Protein"),
      water: parseNumberInRange(request.body.water, 1, 10, "Water"),
      sleep: parseNumberInRange(request.body.sleep, 4, 14, "Sleep"),
      workoutMinutes: parseNumberInRange(request.body.workoutMinutes, 10, 240, "Workout minutes")
    };

  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    goals: nextGoals
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.patch("/api/profile", requireAuth, (request, response) => {
  try {
    const currentProfile = normalizeWellnessData(request.user.data).profile;
    const birthdate = parseOptionalBirthdate(request.body.birthdate);
    const explicitGoalType = parseOptionalGoalType(request.body.goalType);
    const mergedGoalType = explicitGoalType || currentProfile.goalType;
    const nextAppMode = request.body.appMode !== undefined ? parseAppMode(request.body.appMode) : undefined;
    const nextProfile = {
      ...(explicitGoalType ? { goalType: explicitGoalType } : {}),
      ...(birthdate ? { birthdate, ageGroup: deriveAgeGroupFromBirthdate(birthdate) } : {}),
      ...(typeof request.body.ageGroup === "string" && request.body.ageGroup.trim() && !birthdate
        ? { ageGroup: parseAgeGroup(request.body.ageGroup) }
        : {}),
      ...(request.body.experienceLevel !== undefined
        ? { experienceLevel: parseExperienceLevel(request.body.experienceLevel) }
        : {}),
      ...(request.body.trainingEnvironment !== undefined
        ? { trainingEnvironment: parseTrainingEnvironment(request.body.trainingEnvironment) }
        : {}),
      ...(request.body.equipmentSelections !== undefined
        ? {
            equipmentSelections: parseEquipmentSelections(
              request.body.equipmentSelections,
              request.body.trainingEnvironment ?? currentProfile.trainingEnvironment,
              request.body.equipmentProfile
            )
          }
        : {}),
      ...(request.body.equipmentProfile !== undefined
        ? { equipmentProfile: parseEquipmentProfile(request.body.equipmentProfile, request.body.trainingEnvironment ?? currentProfile.trainingEnvironment) }
        : {}),
      ...(request.body.injuryStatus !== undefined ? { injuryStatus: parseInjuryStatus(request.body.injuryStatus) } : {}),
      ...(request.body.nutritionMode !== undefined
        ? { nutritionMode: parseNutritionMode(request.body.nutritionMode, mergedGoalType) }
        : {}),
      ...(nextAppMode !== undefined ? { appMode: nextAppMode } : {}),
      ...(request.body.sex !== undefined ? { sex: parseSex(request.body.sex) } : {}),
      ...(request.body.unitPreference !== undefined ? { unitPreference: parseUnitPreference(request.body.unitPreference) } : {}),
      ...(request.body.heightCm !== undefined ? { heightCm: parseOptionalMeasurement(request.body.heightCm, 120, 230, "Height") } : {}),
      ...(request.body.currentWeight !== undefined
        ? { currentWeight: parseOptionalMeasurement(request.body.currentWeight, 80, 500, "Current weight") }
        : {}),
      ...(request.body.targetWeight !== undefined
        ? { targetWeight: parseOptionalMeasurement(request.body.targetWeight, 80, 500, "Target weight") }
        : {}),
      ...(request.body.moduleOrder !== undefined ? { moduleOrder: parseModuleOrder(request.body.moduleOrder) } : {}),
      ...(request.body.hiddenModules !== undefined ? { hiddenModules: parseHiddenModules(request.body.hiddenModules) } : {}),
      ...(request.body.exerciseGuidanceLevel !== undefined
        ? { exerciseGuidanceLevel: parseExerciseGuidanceLevel(request.body.exerciseGuidanceLevel) }
        : {}),
      ...(request.body.showWarmup !== undefined ? { showWarmup: parseBooleanSetting(request.body.showWarmup) } : {}),
      ...(request.body.showCooldown !== undefined ? { showCooldown: parseBooleanSetting(request.body.showCooldown) } : {}),
      onboardingCompleted: parseOptionalBoolean(request.body.onboardingCompleted),
      ...(request.body.restrictedAreas !== undefined ? { restrictedAreas: parseRestrictedAreas(request.body.restrictedAreas) } : {})
    };

    const updatedUser = updateUserData(request.user.id, (data) => ({
      ...data,
      profile: {
        ...data.profile,
        ...nextProfile,
        equipmentProfile:
          nextProfile.equipmentSelections !== undefined
            ? buildEquipmentProfileFromSelections(
                nextProfile.equipmentSelections,
                nextProfile.trainingEnvironment ?? data.profile?.trainingEnvironment
              )
            : nextProfile.equipmentProfile || data.profile?.equipmentProfile,
        hiddenModules:
          nextAppMode !== undefined
            ? getHiddenModulesForAppMode(nextAppMode)
            : nextProfile.hiddenModules !== undefined
              ? nextProfile.hiddenModules
              : data.profile?.hiddenModules,
        onboardingCompleted:
          typeof nextProfile.onboardingCompleted === "boolean"
            ? nextProfile.onboardingCompleted
            : data.profile?.onboardingCompleted ?? false
      }
    }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/hydration", requireAuth, (request, response) => {
  try {
    const amount = parseNumberInRange(request.body.amount || 0, 0.1, 2, "Hydration amount");
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    waterIntake: Number((data.waterIntake + amount).toFixed(2))
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/workouts/saved", requireAuth, (request, response) => {
  try {
    const workout = request.body?.workout;
    if (!workout || typeof workout !== "object") {
      throw new Error("Workout is required.");
    }

    const savedId = String(workout.presetId || workout.id || "").trim();
    if (!savedId) {
      throw new Error("Workout id is required.");
    }

    const wasSaved = (request.user.data?.savedWorkouts || []).some((entry) => String(entry.presetId || entry.id || "").trim() === savedId);
    const updatedUser = updateUserData(request.user.id, (data) => {
      const savedWorkouts = Array.isArray(data.savedWorkouts) ? [...data.savedWorkouts] : [];
      const existingIndex = savedWorkouts.findIndex((entry) => String(entry.presetId || entry.id || "").trim() === savedId);

      if (existingIndex >= 0) {
        savedWorkouts.splice(existingIndex, 1);
      } else {
        savedWorkouts.unshift({
          id: workout.id || savedId,
          presetId: workout.presetId || workout.id || null,
          name: workout.name,
          type: workout.type,
          environment: workout.environment,
          focus: workout.focus,
          focusLabel: workout.focusLabel,
          duration: workout.duration,
          intensity: workout.intensity,
          summary: workout.summary,
          continuityNote: workout.continuityNote,
          varietyNote: workout.varietyNote,
          equipmentProfile: workout.equipmentProfile,
          equipmentSummary: workout.equipmentSummary,
          primaryMuscles: workout.primaryMuscles,
          exercises: Array.isArray(workout.exercises)
            ? workout.exercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration,
                equipment: exercise.equipment,
                muscleGroup: exercise.muscleGroup,
                movementId: exercise.movement?.id || exercise.movementId || null
              }))
            : [],
          savedAt: new Date().toISOString()
        });
      }

      return {
        ...data,
        savedWorkouts
      };
    });

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser),
      saved: !wasSaved
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/recovery", requireAuth, (request, response) => {
  try {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    sleepHours: parseNumberInRange(request.body.sleepHours, 0, 14, "Sleep hours"),
    energyLevel: parseEnergyLevel(request.body.energyLevel)
  }));

    response.json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/meals", requireAuth, (request, response) => {
  try {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    meals: [
      {
        id: crypto.randomUUID(),
        name: parseText(request.body.name, "Meal name", 2, 40),
        calories: parseNumberInRange(request.body.calories, 0, 3000, "Calories"),
        protein: parseNumberInRange(request.body.protein, 0, 300, "Protein")
      },
      ...data.meals
    ]
  }));

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/protein-checkins", requireAuth, (request, response) => {
  try {
    const profile = normalizeWellnessData(request.user.data).profile;
    if (profile.nutritionMode === "off") {
      throw new Error("Protein check-ins are turned off until nutrition tracking is enabled.");
    }

    const grams = parseNumberInRange(request.body.protein, 5, 120, "Protein");
    const source = String(request.body.source || "").trim();
    const entryName = source ? `Protein check-in: ${source}` : "Protein check-in";
    const updatedUser = updateUserData(request.user.id, (data) => ({
      ...data,
      meals: [
        {
          id: crypto.randomUUID(),
          name: entryName,
          calories: 0,
          protein: grams
        },
        ...data.meals
      ]
    }));

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.delete("/api/meals/:id", requireAuth, (request, response) => {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    meals: data.meals.filter((meal) => meal.id !== request.params.id)
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/workouts", requireAuth, (request, response) => {
  try {
    const exercises = Array.isArray(request.body.exercises) ? request.body.exercises.map(parseExercise) : [];
    const workoutEntry = normalizeWorkout({
      id: crypto.randomUUID(),
      name: parseText(request.body.name, "Workout name", 2, 40),
      type: parseWorkoutType(request.body.type),
      environment: parseEnvironment(request.body.environment),
      duration: parseNumberInRange(request.body.duration, 5, 300, "Workout duration"),
      intensity: parseIntensity(request.body.intensity),
      exercises,
      loggedAt: new Date().toISOString()
    });
    if (!isPremiumEntitled(request.user)) {
      const weeklyLogged = countWeeklyLoggedWorkouts(request.user.data.workouts || []);
      if (weeklyLogged >= 2) {
        const workoutAccess = buildWorkoutAccess(request.user);
        return response.status(403).json({
          message: workoutAccess.canStartTrial
            ? "You’ve hit your free session limit. Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
            : "Free accounts can log up to 2 workouts each week. Upgrade to keep logging without the weekly cap.",
          code: "free_workout_cap",
          workoutAccess
        });
      }
    }
    const updatedUser = updateUserData(request.user.id, (data) => {
      const existingWorkouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
      if (hasRecentWorkoutDuplicate(existingWorkouts, workoutEntry)) {
        throw new Error("That workout was already logged recently. Give it a moment before logging it again.");
      }

      return {
        ...data,
        workouts: [workoutEntry, ...existingWorkouts]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/workouts/preset", requireAuth, (request, response) => {
  try {
    const preset = findWorkoutPresetForProfile(request.body.presetId, request.user.data.profile, {
      environment: request.body.environment || request.user.data.profile?.trainingEnvironment,
      equipmentProfile: request.body.equipmentProfile || request.user.data.profile?.equipmentProfile,
      equipmentSelections:
        request.body.equipmentSelections || getEquipmentSelectionsForProfile(request.user.data.profile),
      focus: request.body.focus || "recommended",
      lowRecovery: normalizeWellnessData(request.user.data).sleepHours < 6.5 || normalizeWellnessData(request.user.data).energyLevel === "Low"
    });
    if (!preset) {
      throw new Error("Workout preset not found.");
    }

    const workoutEntry = createWorkoutFromPreset(
      preset,
      Array.isArray(request.body.exercises) ? request.body.exercises.map(parseExercise) : null
    );
    if (!isPremiumEntitled(request.user)) {
      const weeklyLogged = countWeeklyLoggedWorkouts(request.user.data.workouts || []);
      if (weeklyLogged >= 2) {
        const workoutAccess = buildWorkoutAccess(request.user);
        return response.status(403).json({
          message: workoutAccess.canStartTrial
            ? "You’ve hit your free session limit. Free includes 2 completed workout sessions every 7 days. Start your 7-day free trial to unlock unlimited sessions, full workout access, and better weekly continuity. Trial converts to yearly at $119.99/year unless canceled before day 7."
            : "Free accounts can preview workouts all week, but logging stops after 2 sessions until you upgrade or the week resets.",
          code: "free_workout_cap",
          workoutAccess
        });
      }
    }
    const updatedUser = updateUserData(request.user.id, (data) => {
      const existingWorkouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
      if (hasRecentWorkoutDuplicate(existingWorkouts, workoutEntry)) {
        throw new Error("That workout was already logged recently. Give it a moment before logging it again.");
      }

      return {
        ...data,
        workouts: [workoutEntry, ...existingWorkouts]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.delete("/api/workouts/:id", requireAuth, (request, response) => {
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    workouts: data.workouts.map(normalizeWorkout).filter((workout) => workout.id !== request.params.id)
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/habits/toggle", requireAuth, (request, response) => {
  const today = new Date().toISOString().slice(0, 10);
  const updatedUser = updateUserData(request.user.id, (data) => ({
    ...data,
    habits: data.habits.map((habit) => {
      if (habit.id !== request.body.habitId) {
        return habit;
      }

      const completedDates = new Set(habit.completedDates);
      if (completedDates.has(today)) {
        completedDates.delete(today);
      } else {
        completedDates.add(today);
      }

      return {
        ...habit,
        completedDates: Array.from(completedDates).sort()
      };
    })
  }));

  response.json({
    data: updatedUser.data,
    summary: buildUserSummary(updatedUser)
  });
});

app.post("/api/weekly-check-in", requireAuth, (request, response) => {
  try {
    const checkIn = parseWeeklyCheckIn(request.body);
    const updatedUser = updateUserData(request.user.id, (data) => {
      const nextCheckIns = (data.weeklyCheckIns || []).filter((entry) => entry.weekKey !== checkIn.weekKey);
      return {
        ...data,
        weeklyCheckIns: [
          {
            ...checkIn,
            createdAt: new Date().toISOString()
          },
          ...nextCheckIns
        ]
      };
    });

    response.status(201).json({
      data: updatedUser.data,
      summary: buildUserSummary(updatedUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/progress", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);

  response.json({
    weeklyHistory: summary.weeklyHistory,
    weightHistory: request.user.data.weightHistory,
    habits: summary.habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      streak: habit.streak,
      completedToday: habit.completedDates.includes(new Date().toISOString().slice(0, 10))
    }))
  });
});

app.get("/api/coaching", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);
  const coach = buildCoachDecisionEngine(
    request.user.data,
    {
      totals: summary.totals,
      habits: summary.habits,
      completion: summary.completion,
      workouts: request.user.data.workouts
    },
    isPremiumEntitled(request.user)
  );
  response.json({
    coach,
    recommendations: summary.insights,
    notes: request.user.data.notes,
    recoveryFocus: buildRecoveryFocus(request.user.data, summary)
  });
});

app.post("/api/checkout-session", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable upgrades.");
    }

    if (isPremiumEntitled(request.user)) {
      return response.status(400).json({ message: "Your account is already on Premium." });
    }

    const requestedBillingInterval = parseBillingInterval(request.body?.billingInterval);
    const checkoutMode = parseCheckoutMode(request.body?.checkoutMode);
    const trialEligible = canStartTrial(request.user) && checkoutMode !== "upgrade_now";
    const billingInterval = trialEligible ? "yearly" : requestedBillingInterval;
    const appOrigin = getAppOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${appOrigin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/billing/cancel`,
      client_reference_id: request.user.id,
      customer_email: request.user.email,
      metadata: {
        userId: request.user.id,
        tier: "premium",
        billingInterval,
        checkoutMode
      },
      subscription_data: {
        ...(trialEligible ? { trial_period_days: TRIAL_DURATION_DAYS } : {}),
        metadata: {
          userId: request.user.id,
          billingInterval,
          checkoutMode
        }
      },
      line_items: [buildCheckoutLineItem(billingInterval)]
    });

    return response.status(201).json({
      sessionId: session.id,
      checkoutUrl: session.url,
      billingInterval,
      checkoutMode,
      trialEligible
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/billing-portal", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to manage subscriptions.");
    }

    let billingUser = request.user;
    let customerId = billingUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: billingUser.email,
        name: billingUser.name,
        metadata: {
          userId: billingUser.id
        }
      });

      billingUser = updateUserAccount(billingUser.id, (user) => ({
        ...user,
        stripeCustomerId: customer.id
      }));
      customerId = customer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppOrigin(request)}/`
    });

    return response.status(201).json({
      url: portalSession.url
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/checkout/confirm", requireAuth, async (request, response) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable upgrades.");
    }

    const sessionId = String(request.body.sessionId || "").trim();
    if (!sessionId) {
      throw new Error("Missing checkout session ID.");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"]
    });

    if (session.client_reference_id !== request.user.id || session.metadata?.userId !== request.user.id) {
      return response.status(403).json({ message: "This checkout session does not belong to your account." });
    }

    if (session.mode !== "subscription" || session.status !== "complete") {
      throw new Error("Checkout is not complete yet.");
    }

    const latestUser = findUserById(request.user.id);
    if (!latestUser) {
      return response.status(404).json({ message: "User not found." });
    }

    return response.json({
      user: sanitizeUser(latestUser),
      dashboard: buildUserSummary(latestUser),
      checkoutComplete: session.status === "complete",
      entitlementPending: !isPremiumEntitled(latestUser)
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.get("/api/weekly-plan", requireAuth, (request, response) => {
  const summary = buildUserSummary(request.user);
  const workouts = sortWorkoutsDesc((request.user.data.workouts || []).map(normalizeWorkout));
  const plan = buildWeeklyPlan(request.user.data, summary.totals, summary.habits, summary.completion, workouts);
  const isPreviewRequest = request.headers["x-plan-preview"] === "true";

  if (!isPremiumEntitled(request.user)) {
    if (isPreviewRequest) {
      return response.json({
        plan: buildLimitedWeeklyPlan(plan),
        previewMode: true,
        access: "session-preview",
        message: "This preview shows the headline structure. Premium unlocks the deeper reasoning, clearer weekly actions, and fuller weekly adjustments."
      });
    }

    return response.status(403).json({
      message: "Upgrade required to unlock your personalized weekly plan.",
      preview: summary.weeklyPlanPreview
    });
  }

  return response.json({
    plan
  });
});

app.use(express.static(distPath));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api")) {
    return next();
  }

  return response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`PulsePeak API listening on http://localhost:${port}`);
});

function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return response.status(401).json({ message: "Missing auth token." });
  }

  const user = findUserByToken(token);
  if (!user) {
    return response.status(401).json({ message: "Invalid or expired session." });
  }

  request.user = user;
  request.token = token;
  return next();
}

function getAppOrigin(request) {
  if (appOrigin) {
    return appOrigin;
  }

  const originHeader = request.headers.origin;
  if (originHeader) {
    return originHeader;
  }

  return `${request.protocol}://${request.get("host")}`;
}

function normalizePublicOrigin(value) {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  return normalized || "";
}

function buildAllowedCorsOrigins(rawValue, originValue) {
  const configuredOrigins = String(rawValue || "")
    .split(",")
    .map((entry) => normalizePublicOrigin(entry))
    .filter(Boolean);

  if (originValue && !configuredOrigins.includes(originValue)) {
    configuredOrigins.push(originValue);
  }

  return configuredOrigins;
}

function buildUserSummary(user) {
  return {
    ...summarizeDashboard(user.data),
    workoutAccess: buildWorkoutAccess(user),
    weeklyCheckIn: buildWeeklyCheckInState(user.data, { isPremium: isPremiumEntitled(user) }),
    pricingModel: buildPricingModel(user)
  };
}

function buildPricingModel(user) {
  const accessTier = getAccessTier(user);
  const monthlyAmount = premiumPlanAmount;
  const yearlyAmount = premiumPlanYearlyAmount;
  const yearlySavings = Math.max(0, monthlyAmount * 12 - yearlyAmount);
  const yearlySavingsPercent = yearlySavings > 0 ? 33 : 0;

  return {
    accessTier,
    canStartTrial: canStartTrial(user),
    trialDays: TRIAL_DURATION_DAYS,
    trialEndsAt: accessTier === "trial_active" ? user.currentPeriodEnd || user.trialEndsAt || null : null,
    trialDisclosure: `Then auto-renews yearly at ${formatCurrency(yearlyAmount, premiumPlanCurrency)}/year unless canceled before trial ends.`,
    monthly: {
      interval: "monthly",
      amountCents: monthlyAmount,
      priceLabel: formatCurrency(monthlyAmount, premiumPlanCurrency),
      cadenceLabel: `${formatCurrency(monthlyAmount, premiumPlanCurrency)} / month`,
      helper: "Direct paid option"
    },
    yearly: {
      interval: "yearly",
      amountCents: yearlyAmount,
      priceLabel: formatCurrency(yearlyAmount, premiumPlanCurrency),
      cadenceLabel: `${formatCurrency(yearlyAmount, premiumPlanCurrency)} / year`,
      helper: yearlySavings > 0 ? `Best value - save ${yearlySavingsPercent}%` : "Best long-term value",
      savingsAmountCents: yearlySavings,
      savingsPercent: yearlySavingsPercent
    }
  };
}

function buildCheckoutLineItem(billingInterval) {
  if (billingInterval === "yearly") {
    if (yearlyPriceId) {
      return {
        price: yearlyPriceId,
        quantity: 1
      };
    }

    return {
      quantity: 1,
      price_data: {
        currency: premiumPlanCurrency,
        recurring: {
          interval: "year"
        },
        unit_amount: premiumPlanYearlyAmount,
        product_data: {
          name: "Premium Plan"
        }
      }
    };
  }

  if (monthlyPriceId) {
    return {
      price: monthlyPriceId,
      quantity: 1
    };
  }

  return {
    quantity: 1,
    price_data: {
      currency: premiumPlanCurrency,
      recurring: {
        interval: "month"
      },
      unit_amount: premiumPlanAmount,
      product_data: {
        name: "Premium Plan"
      }
    }
  };
}

function parseBillingInterval(value) {
  return value === "yearly" ? "yearly" : "monthly";
}

function parseCheckoutMode(value) {
  return value === "upgrade_now" ? "upgrade_now" : "default";
}

function formatCurrency(amountCents, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "usd").toUpperCase(),
    maximumFractionDigits: 0
  }).format((Number(amountCents) || 0) / 100);
}

function logStripeConfigurationWarnings() {
  const missing = [];
  if (!process.env.STRIPE_SECRET_KEY) {
    missing.push("STRIPE_SECRET_KEY");
  }
  if (!process.env.STRIPE_PRICE_ID) {
    missing.push("STRIPE_PRICE_ID");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    missing.push("STRIPE_WEBHOOK_SECRET");
  }

  if (missing.length) {
    console.warn(`[Stripe] Missing env vars: ${missing.join(", ")}.`);
    console.warn("[Stripe] Checkout, billing portal, or webhook syncing may be unavailable until Stripe configuration is complete.");
  }
}

function buildRecoveryFocus(data, summary) {
  const topHabit = summary.habits
    .map((habit) => ({
      ...habit,
      completedToday: habit.completedDates.includes(new Date().toISOString().slice(0, 10)),
      streak: calculateStreak(habit.completedDates)
    }))
    .sort((left, right) => right.streak - left.streak)[0];

  return {
    energyLevel: data.energyLevel,
    sleepHours: data.sleepHours,
    topHabit: topHabit ? `${topHabit.name} (${topHabit.streak}-day streak)` : "No habits yet"
  };
}

function assertValidName(name) {
  parseText(name, "Name", 2, 50);
}

function assertValidEmail(email) {
  const normalized = String(email || "").trim();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
}

function assertValidPassword(password, allowShorterForLogin = false) {
  const normalized = String(password || "");
  const minimum = allowShorterForLogin ? 1 : 8;
  if (normalized.trim().length < minimum) {
    throw new Error(allowShorterForLogin ? "Password is required." : "Password must be at least 8 characters.");
  }
}

function parseText(value, label, minLength, maxLength) {
  const normalized = String(value || "").trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new Error(`${label} must be between ${minLength} and ${maxLength} characters.`);
  }

  return normalized;
}

function parseNumberInRange(value, minimum, maximum, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseIntensity(value) {
  const allowed = ["Low", "Moderate", "High"];
  if (!allowed.includes(value)) {
    throw new Error("Workout intensity must be Low, Moderate, or High.");
  }

  return value;
}

function parseWorkoutType(value) {
  const allowed = ["strength", "cardio", "mobility"];
  if (!allowed.includes(value)) {
    throw new Error("Workout type must be strength, cardio, or mobility.");
  }

  return value;
}

function parseEnvironment(value) {
  const allowed = ["gym", "home", "both"];
  if (!allowed.includes(value)) {
    throw new Error("Workout environment must be gym, home, or both.");
  }

  return value;
}

function parseExercise(exercise) {
  const normalized = {
    name: parseText(exercise.name, "Exercise name", 2, 60),
    sets: parseNumberInRange(exercise.sets, 1, 10, "Exercise sets"),
    reps: exercise.reps ? String(exercise.reps).trim() : null,
    duration: exercise.duration ? String(exercise.duration).trim() : null,
    equipment: parseText(exercise.equipment, "Exercise equipment", 2, 30),
    muscleGroup: parseText(exercise.muscleGroup, "Muscle group", 2, 30),
    weight:
      exercise.weight === undefined || exercise.weight === null || String(exercise.weight).trim() === ""
        ? null
        : parseNumberInRange(exercise.weight, 0, 2000, "Exercise weight"),
    repsCompleted: exercise.repsCompleted ? String(exercise.repsCompleted).trim() : null,
    notes: exercise.notes ? String(exercise.notes).trim().slice(0, 160) : ""
  };

  if (!normalized.reps && !normalized.duration) {
    throw new Error("Each exercise needs reps or duration.");
  }

  return normalized;
}

function parseEnergyLevel(value) {
  const allowed = ["Low", "Steady", "High"];
  if (!allowed.includes(value)) {
    throw new Error("Energy level must be Low, Steady, or High.");
  }

  return value;
}

function parseGoalType(value) {
  const allowed = [
    "strength",
    "athletic_performance",
    "bodybuilding",
    "fat_loss",
    "general_fitness",
    "mobility",
    "injury_recovery",
    "active_aging"
  ];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid primary goal.");
  }

  return value;
}

function parseOptionalGoalType(value) {
  if (value === undefined) {
    return undefined;
  }

  return parseGoalType(value);
}

function parseAgeGroup(value) {
  const allowed = ["18-29", "30-39", "40-49", "50+"];
  return allowed.includes(value) ? value : "30-39";
}

function parseOptionalBirthdate(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error("Birthdate is required.");
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Enter a valid birthdate.");
  }

  const today = new Date();
  if (parsed > today) {
    throw new Error("Birthdate cannot be in the future.");
  }

  const age = getAgeFromBirthdate(normalized);
  if (age < 18 || age > 100) {
    throw new Error("Birthdate must represent an adult age between 18 and 100.");
  }

  return normalized;
}

function parseExperienceLevel(value) {
  const allowed = ["beginner", "intermediate", "advanced"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid experience level.");
  }

  return value;
}

function parseTrainingEnvironment(value) {
  const allowed = ["home", "gym", "hybrid"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid training environment.");
  }

  return value;
}

function parseEquipmentProfile(value, trainingEnvironment = "hybrid") {
  const normalized = normalizeEquipmentProfile(value, trainingEnvironment);
  if (!normalized) {
    throw new Error("Choose a valid equipment setup.");
  }

  return normalized;
}

function parseEquipmentSelections(value, trainingEnvironment = "hybrid", equipmentProfile = null) {
  const normalized = normalizeEquipmentSelections(value, trainingEnvironment);
  if (!normalized?.length) {
    if (equipmentProfile) {
      return normalizeEquipmentSelections(
        getEquipmentSelectionsForProfile({
          trainingEnvironment,
          equipmentProfile
        }),
        trainingEnvironment
      );
    }
    return normalizeEquipmentSelections([], trainingEnvironment);
  }

  return normalized;
}

function parseEquipmentSelectionsQuery(value, trainingEnvironment = "hybrid", profile = {}) {
  if (!value) {
    return getEquipmentSelectionsForProfile(profile);
  }

  const selections = Array.isArray(value) ? value : String(value).split(",");
  return normalizeEquipmentSelections(selections, trainingEnvironment);
}

function parseInjuryStatus(value) {
  const allowed = ["none", "minor", "active_injury"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid injury status.");
  }

  return value;
}

function parseAppMode(value) {
  const normalized = String(value || "").trim();
  if (!APP_MODES.includes(normalized)) {
    throw new Error("Choose a valid app mode.");
  }

  return normalizeAppMode(normalized);
}

function parseExerciseGuidanceLevel(value) {
  const allowed = ["full", "standard", "minimal"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid exercise guidance level.");
  }

  return value;
}

function parseBooleanSetting(value) {
  if (typeof value !== "boolean") {
    throw new Error("Choose a valid on or off setting.");
  }

  return value;
}

function parseRestrictedAreas(value) {
  const allowed = new Set(["knee", "shoulder", "back", "elbow", "hip", "ankle"]);
  if (!Array.isArray(value)) {
    return [];
  }

  const cleaned = Array.from(
    new Set(
      value.map((entry) => String(entry || "").trim()).filter((entry) => allowed.has(entry))
    )
  );

  if (cleaned.length > 6) {
    throw new Error("Too many restricted areas were selected.");
  }

  return cleaned;
}

function parseSex(value) {
  const allowed = ["female", "male", "non_binary", "prefer_not_to_say"];
  if (!allowed.includes(value)) {
    throw new Error("Choose a valid sex option for training estimates.");
  }

  return value;
}

function parseUnitPreference(value) {
  const normalized = normalizeUnitPreference(value);
  if (!normalized) {
    throw new Error("Choose a valid unit preference.");
  }

  return normalized;
}

function parseNutritionMode(value, goalType) {
  const allowed = ["off", "basic", "full"];
  const normalizedGoalType = parseGoalType(goalType);
  if (!allowed.includes(value)) {
    if (normalizedGoalType === "fat_loss") {
      return "full";
    }
    if (normalizedGoalType === "bodybuilding" || normalizedGoalType === "general_fitness") {
      return "basic";
    }
    return "off";
  }

  return value;
}

function parseOptionalBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function parseModuleOrder(value) {
  if (!Array.isArray(value)) {
    return CUSTOMIZABLE_MODULE_IDS;
  }

  const selected = value.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId));
  return [...selected, ...CUSTOMIZABLE_MODULE_IDS.filter((moduleId) => !selected.includes(moduleId))];
}

function parseHiddenModules(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter((moduleId) => CUSTOMIZABLE_MODULE_IDS.includes(moduleId))));
}

function parseOptionalMeasurement(value, minimum, maximum, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  return parseNumberInRange(value, minimum, maximum, label);
}

function parseWeeklyCheckIn(value) {
  const payload = value || {};
  return {
    weekKey: typeof payload.weekKey === "string" && payload.weekKey.trim() ? payload.weekKey.trim() : getCurrentWeekKey(),
    weekFeel: parseWeeklyCheckEnum(payload.weekFeel, ["rough", "mixed", "strong"], "How the week felt"),
    recoveryFeel: parseWeeklyCheckEnum(payload.recoveryFeel, ["low", "steady", "high"], "Recovery"),
    planDifficulty: parseWeeklyCheckEnum(payload.planDifficulty, ["too_easy", "right", "too_hard"], "Plan difficulty"),
    nutritionAdherence: parseWeeklyCheckEnum(payload.nutritionAdherence, ["off_track", "mostly_on", "locked_in"], "Nutrition"),
    sorenessIssues: parseWeeklyCheckEnum(payload.sorenessIssues, ["none", "manageable", "significant"], "Soreness"),
    confidence: parseWeeklyCheckEnum(payload.confidence, ["low", "steady", "high"], "Confidence")
  };
}

function parseWeeklyCheckEnum(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} selection is required.`);
  }

  return value;
}

function getCurrentWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const dayOffset = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayOffset);
  return start.toISOString().slice(0, 10);
}

function getAgeFromBirthdate(birthdate) {
  const today = new Date();
  const parsed = new Date(`${birthdate}T00:00:00`);
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }

  return age;
}

function deriveAgeGroupFromBirthdate(birthdate) {
  const age = getAgeFromBirthdate(birthdate);
  if (age < 30) {
    return "18-29";
  }
  if (age < 40) {
    return "30-39";
  }
  if (age < 50) {
    return "40-49";
  }
  return "50+";
}

```

## FILE: server/stripeBilling.js

`$ext
import {
  findUserById,
  findUserByStripeCustomerId,
  findUserByStripeSubscriptionId,
  hasProcessedWebhookEvent,
  recordProcessedWebhookEvent,
  updateUserAccount
} from "./data/store.js";

const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function applyStripeWebhookEvent(event) {
  if (hasProcessedWebhookEvent(event.id)) {
    return {
      ignored: true,
      reason: "already_processed",
      eventId: event.id
    };
  }

  let result;
  switch (event.type) {
    case "checkout.session.completed":
      result = handleCheckoutSessionCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      result = handleSubscriptionUpsert(event.data.object);
      break;
    case "customer.subscription.deleted":
      result = handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_failed":
      result = handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      result = null;
  }

  recordProcessedWebhookEvent(event.id, event.type);
  return result;
}

function handleCheckoutSessionCompleted(session) {
  const user = findUserForStripeObject(session);
  if (!user) {
    throw new Error(`Unable to locate user for checkout session ${session.id}.`);
  }

  const subscriptionStatus =
    session.mode === "subscription"
      ? session.payment_status === "paid"
        ? "active"
        : session.payment_status === "no_payment_required"
          ? "trialing"
          : "incomplete"
      : "incomplete";

  return persistSubscriptionState(user.id, {
    tier: PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
    subscriptionStatus,
    stripeCustomerId: normalizeNullableId(session.customer),
    stripeSubscriptionId: normalizeNullableId(session.subscription),
    subscriptionPlanInterval: normalizeNullableInterval(session?.metadata?.billingInterval)
  });
}

function handleSubscriptionUpsert(subscription) {
  const user = findUserForStripeObject(subscription);
  if (!user) {
    throw new Error(`Unable to locate user for subscription ${subscription.id}.`);
  }

  const subscriptionStatus = normalizeSubscriptionStatus(subscription.status);

  return persistSubscriptionState(user.id, {
    tier: PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
    subscriptionStatus,
    stripeCustomerId: normalizeNullableId(subscription.customer),
    stripeSubscriptionId: normalizeNullableId(subscription.id),
    currentPeriodEnd: timestampToIso(subscription.current_period_end),
    subscriptionPlanInterval: normalizeNullableInterval(subscription?.items?.data?.[0]?.price?.recurring?.interval),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
  });
}

function handleSubscriptionDeleted(subscription) {
  const user = findUserForStripeObject(subscription);
  if (!user) {
    throw new Error(`Unable to locate user for canceled subscription ${subscription.id}.`);
  }

  return persistSubscriptionState(user.id, {
    tier: "free",
    subscriptionStatus: "canceled",
    stripeCustomerId: normalizeNullableId(subscription.customer),
    stripeSubscriptionId: normalizeNullableId(subscription.id),
    currentPeriodEnd: timestampToIso(subscription.current_period_end)
  });
}

function handleInvoicePaymentFailed(invoice) {
  const user = findUserForStripeObject(invoice);
  if (!user) {
    throw new Error(`Unable to locate user for failed invoice ${invoice.id}.`);
  }

  return persistSubscriptionState(user.id, {
    tier: "free",
    subscriptionStatus: "past_due",
    stripeCustomerId: normalizeNullableId(invoice.customer),
    stripeSubscriptionId: normalizeNullableId(invoice.subscription)
  });
}

function persistSubscriptionState(userId, nextState) {
  return updateUserAccount(userId, (user) => {
    const subscriptionStatus = normalizeSubscriptionStatus(nextState.subscriptionStatus ?? user.subscriptionStatus);
    const currentPeriodEnd = nextState.currentPeriodEnd ?? user.currentPeriodEnd ?? null;
    const subscriptionPlanInterval = nextState.subscriptionPlanInterval ?? user.subscriptionPlanInterval ?? null;
    const cancelAtPeriodEnd = typeof nextState.cancelAtPeriodEnd === "boolean" ? nextState.cancelAtPeriodEnd : Boolean(user.cancelAtPeriodEnd);
    const wasTrialing = String(user.subscriptionStatus || "").toLowerCase().trim() === "trialing";
    return {
      ...user,
      tier: nextState.tier ?? user.tier ?? "free",
      planTier: subscriptionStatus === "trialing" ? "trial_active" : PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
      subscriptionStatus,
      stripeCustomerId: nextState.stripeCustomerId ?? user.stripeCustomerId ?? null,
      stripeSubscriptionId: nextState.stripeSubscriptionId ?? user.stripeSubscriptionId ?? null,
      currentPeriodEnd,
      trialStartedAt:
        subscriptionStatus === "trialing"
          ? user.trialStartedAt || new Date().toISOString()
          : user.trialStartedAt ?? null,
      trialEndsAt:
        subscriptionStatus === "trialing"
          ? currentPeriodEnd
          : subscriptionStatus === "canceled" || subscriptionStatus === "past_due" || subscriptionStatus === "inactive"
            ? null
            : user.trialEndsAt ?? null
      ,
      trialBillingChoice:
        subscriptionStatus === "trialing"
          ? nextState.subscriptionPlanInterval || user.trialBillingChoice || null
          : user.trialBillingChoice ?? null,
      trialStatus:
        subscriptionStatus === "trialing"
          ? cancelAtPeriodEnd
            ? "canceled"
            : "active"
          : wasTrialing && subscriptionStatus === "active"
            ? "converted"
            : subscriptionStatus === "canceled" && user.trialEndsAt
              ? "expired"
              : user.trialStatus || "inactive",
      trialCanceledAt:
        subscriptionStatus === "trialing" && cancelAtPeriodEnd
          ? user.trialCanceledAt || new Date().toISOString()
          : subscriptionStatus === "active"
            ? null
            : user.trialCanceledAt ?? null,
      trialConvertedAt:
        wasTrialing && subscriptionStatus === "active"
          ? user.trialConvertedAt || new Date().toISOString()
          : user.trialConvertedAt ?? null,
      hasUsedTrial: Boolean(user.hasUsedTrial || subscriptionStatus === "trialing" || user.trialStartedAt),
      subscriptionPlanInterval,
      cancelAtPeriodEnd
    };
  });
}

function findUserForStripeObject(object) {
  const metadataUserId = String(object?.metadata?.userId || "").trim();
  if (metadataUserId) {
    const metadataUser = findUserById(metadataUserId);
    if (metadataUser) {
      return metadataUser;
    }
  }

  const customerUser = findUserByStripeCustomerId(normalizeNullableId(object?.customer));
  if (customerUser) {
    return customerUser;
  }

  return findUserByStripeSubscriptionId(normalizeNullableId(object?.subscription) || normalizeNullableId(object?.id));
}

function normalizeNullableId(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeNullableInterval(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === "month") {
    return "monthly";
  }
  if (normalized === "year") {
    return "yearly";
  }
  if (normalized === "monthly" || normalized === "yearly") {
    return normalized;
  }
  return null;
}

function normalizeSubscriptionStatus(value) {
  const normalized = String(value || "inactive").toLowerCase().trim();
  return normalized || "inactive";
}

function timestampToIso(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}

```

## FILE: server/data/movementLibrary.js

`$ext
import { getReviewedMediaAsset } from "../../shared/mediaReviewCatalog.js";

const MOVEMENT_MEDIA = {
  squat: buildMovementMedia("squat", "Athlete setting up a squat with a stable stance."),
  "push-up": buildMovementMedia("push-up", "Athlete holding a strong push-up position."),
  "dumbbell-press": buildMovementMedia("dumbbell-press", "Athlete pressing dumbbells from a stable bench position."),
  row: buildMovementMedia("row", "Athlete performing a strong rowing pattern with a flat back."),
  deadlift: buildMovementMedia("deadlift", "Athlete hinging into a deadlift setup with the weight close."),
  lunge: buildMovementMedia("lunge", "Athlete lowering into a controlled lunge stance."),
  plank: buildMovementMedia("plank", "Athlete holding a strong forearm plank."),
  "overhead-press": buildMovementMedia("overhead-press", "Athlete pressing dumbbells overhead with a stacked torso."),
  "cat-cow": buildMovementMedia("cat-cow", "Athlete moving through a cat-cow mobility drill."),
  "worlds-greatest-stretch": buildMovementMedia("worlds-greatest-stretch", "Athlete performing a long lunge rotation stretch."),
  "wall-slide": buildMovementMedia("wall-slide", "Athlete performing a shoulder wall slide with control."),
  "hamstring-stretch": buildMovementMedia("hamstring-stretch", "Athlete hinging into a hamstring stretch with a long spine."),
  "hip-flexor-stretch": buildMovementMedia("hip-flexor-stretch", "Athlete holding a half-kneeling hip flexor stretch."),
  "thoracic-rotation": buildMovementMedia("thoracic-rotation", "Athlete opening into a thoracic rotation drill."),
  "shoulder-mobility": buildMovementMedia("shoulder-mobility", "Athlete using a smooth shoulder mobility reach."),
  "glute-bridge": buildMovementMedia("glute-bridge", "Athlete pressing into a glute bridge with hips lifted."),
  "band-pull-apart": buildMovementMedia("band-pull-apart", "Athlete pulling a band apart with shoulders down."),
  "wall-squat": buildMovementMedia("wall-squat", "Athlete holding a supported wall squat."),
  "supported-split-squat": buildMovementMedia("supported-split-squat", "Athlete using support during a split squat.")
};

const MOVEMENT_LIBRARY = [
  movement({
    id: "squat",
    name: "Squat",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "dumbbell", "barbell"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    instructions: [
      "Stand with feet around shoulder width and brace your trunk before you move.",
      "Sit your hips back and down while keeping your chest tall and knees tracking over your toes.",
      "Lower only as far as you can keep control and even pressure through the whole foot.",
      "Drive through the floor to stand tall and finish with your ribs stacked over your hips."
    ],
    cues: ["Tripod foot pressure", "Brace before you bend", "Knees follow toes"],
    commonMistakes: ["Collapsing the chest", "Letting the knees cave inward", "Rising onto the toes too early"],
    safetyNotes: ["Reduce depth if you lose spinal position.", "Use a box or support if knee confidence is low."],
    modifications: ["Bodyweight squat to box", "Goblet squat", "Wall squat for lower-load support"],
    image: mediaRef("squat", "Squat form guide")
  }),
  movement({
    id: "push-up",
    name: "Push-up",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders", "Core"],
    instructions: [
      "Set your hands slightly wider than shoulders and form a straight line from head to heels.",
      "Brace your core and lower your chest between your hands without letting your hips sag.",
      "Pause just above the floor while keeping elbows at a comfortable angle.",
      "Press the floor away and return to a strong plank."
    ],
    cues: ["Long body line", "Screw hands into the floor", "Push the floor away"],
    commonMistakes: ["Dropping the hips", "Flaring the elbows hard", "Leading with the chin"],
    safetyNotes: ["Elevate the hands if shoulder comfort or strength is limited.", "Stop if shoulder pain builds with each rep."],
    modifications: ["Incline push-up", "Knee push-up", "Slow eccentric push-up"],
    image: mediaRef("push-up", "Push-up setup guide")
  }),
  movement({
    id: "dumbbell-press",
    name: "Dumbbell Press",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "bench", "floor"],
    primaryMuscles: ["Chest", "Shoulders"],
    secondaryMuscles: ["Triceps"],
    instructions: [
      "Set your shoulders down and back before the first rep.",
      "Start with dumbbells stacked over elbows and wrists neutral.",
      "Lower under control until the upper arm is close to the floor or bench line.",
      "Press back up smoothly without letting the ribs flare."
    ],
    cues: ["Stack wrist over elbow", "Own the bottom", "Press without shrugging"],
    commonMistakes: ["Bouncing at the bottom", "Arching hard through the low back", "Letting wrists fold back"],
    safetyNotes: ["Use the floor press variation if shoulder range feels limited.", "Keep load conservative if shoulder irritation is active."],
    modifications: ["Floor press", "Single-arm dumbbell press", "Neutral-grip press"],
    image: mediaRef("dumbbell-press", "Dumbbell press form guide")
  }),
  movement({
    id: "row",
    name: "Row",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "machine", "cable", "barbell"],
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear delts"],
    instructions: [
      "Set your torso and keep the neck long before you start pulling.",
      "Drive the elbow back toward the hip instead of yanking with the hand.",
      "Pause briefly when the shoulder blade is fully retracted.",
      "Lower with control and keep the torso stable."
    ],
    cues: ["Lead with the elbow", "Pull to the hip", "Stay square through the torso"],
    commonMistakes: ["Jerking the weight", "Shrugging into the neck", "Twisting the torso to finish the rep"],
    safetyNotes: ["Use chest support if your low back gets tired quickly.", "Lower the load if you cannot pause at the top."],
    modifications: ["Chest-supported row", "Single-arm row", "Cable row"],
    image: mediaRef("row", "Row position guide")
  }),
  movement({
    id: "deadlift",
    name: "Deadlift",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["barbell", "dumbbell"],
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Back", "Core"],
    instructions: [
      "Set the weight close to your body and hinge back with a long spine.",
      "Brace your trunk and create tension before the weight leaves the floor.",
      "Drive through the floor and stand tall while keeping the bar or dumbbells close.",
      "Hinge back down with the same control and reset the next rep."
    ],
    cues: ["Push hips back", "Keep the weight close", "Stand tall, do not lean back"],
    commonMistakes: ["Rounding early off the floor", "Letting the weight drift forward", "Hyperextending at lockout"],
    safetyNotes: ["Switch to a Romanian deadlift or bridge variation if the back feels irritable.", "Keep reps crisp instead of grinding through fatigue."],
    modifications: ["Romanian deadlift", "Dumbbell deadlift", "Glute bridge"],
    image: mediaRef("deadlift", "Deadlift hinge guide")
  }),
  movement({
    id: "lunge",
    name: "Lunge",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "dumbbell"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Step into a stance wide enough that both knees can bend comfortably.",
      "Lower straight down while keeping the front foot planted and torso steady.",
      "Stop before the front knee or hip loses control.",
      "Drive through the front foot to return to the start."
    ],
    cues: ["Front foot heavy", "Drop straight down", "Stay tall through the torso"],
    commonMistakes: ["Taking too narrow a stance", "Pushing off the back foot only", "Front knee collapsing inward"],
    safetyNotes: ["Hold onto support if balance is the limiting factor.", "Use a split squat or supported split squat if the knee feels unstable."],
    modifications: ["Reverse lunge", "Supported split squat", "Split squat to shallow depth"],
    image: mediaRef("lunge", "Lunge stance guide")
  }),
  movement({
    id: "overhead-press",
    name: "Overhead Press",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["dumbbell", "machine", "barbell"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Upper back"],
    instructions: [
      "Start with the load at shoulder height and ribs stacked over the hips.",
      "Brace lightly and press straight up without leaning back.",
      "Finish with the weight over the mid-foot and shoulders active.",
      "Lower to the start under control."
    ],
    cues: ["Ribs down", "Punch straight up", "Finish tall"],
    commonMistakes: ["Overarching the lower back", "Pressing out in front", "Shrugging early"],
    safetyNotes: ["Skip or reduce load when shoulder symptoms are active.", "Use a machine or neutral grip if overhead range is limited."],
    modifications: ["Seated dumbbell press", "Neutral-grip press", "Band pull-apart if pressing is not tolerated"],
    image: mediaRef("overhead-press", "Overhead press guide")
  }),
  movement({
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "strength",
    difficulty: "beginner",
    environment: "gym",
    equipment: ["machine"],
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear delts"],
    instructions: [
      "Sit tall with the bar overhead and shoulders set down away from the ears.",
      "Pull elbows down toward your sides instead of yanking the bar behind you.",
      "Pause near the upper chest with the trunk still.",
      "Return the bar overhead with control."
    ],
    cues: ["Elbows to ribs", "Chest tall", "Control the return"],
    commonMistakes: ["Pulling behind the neck", "Swinging the torso back", "Letting shoulders shrug at the top"],
    safetyNotes: ["Use a neutral handle if the shoulders feel cramped.", "Reduce load if you need momentum to finish reps."],
    modifications: ["Band pulldown", "Chest-supported row", "Half-kneeling single-arm pulldown"],
    image: mediaRef("lat-pulldown", "Lat pulldown guide")
  }),
  movement({
    id: "lateral-raise",
    name: "Lateral Raise",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "machine", "cable"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Upper back"],
    instructions: [
      "Stand tall with a soft elbow bend and shoulders relaxed.",
      "Raise the arms out to the side until about shoulder height.",
      "Pause briefly without shrugging into the neck.",
      "Lower slowly and keep control all the way down."
    ],
    cues: ["Soft elbows", "Lead wide, not high", "Keep the neck relaxed"],
    commonMistakes: ["Swinging the torso", "Turning it into a shrug", "Going too heavy to control the top"],
    safetyNotes: ["Stay in a pain-free range if shoulder irritation is present.", "Drop load before form starts to swing."],
    modifications: ["Cable raise", "Partial-range raise", "Wall slide for shoulder control work"],
    image: mediaRef("lateral-raise", "Lateral raise guide")
  }),
  movement({
    id: "triceps-pushdown",
    name: "Triceps Pushdown",
    category: "strength",
    difficulty: "beginner",
    environment: "gym",
    equipment: ["machine", "cable"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Set the elbows near your sides and keep the chest steady.",
      "Press the handle down by extending the elbows, not by rocking the torso.",
      "Pause with the arms straight and shoulders quiet.",
      "Return with control until the forearms are about parallel to the floor."
    ],
    cues: ["Elbows stay pinned", "Move the forearms only", "Quiet shoulders"],
    commonMistakes: ["Swinging the torso", "Letting elbows drift forward", "Slamming the weight stack"],
    safetyNotes: ["Use a rope or neutral handle if elbows are sensitive.", "Reduce range if elbow pain sharpens."],
    modifications: ["Band pushdown", "Close-grip push-up", "Overhead triceps extension with lighter load"],
    image: mediaRef("triceps-pushdown", "Triceps pushdown guide")
  }),
  movement({
    id: "biceps-curl",
    name: "Biceps Curl",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "barbell", "machine"],
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Stand tall with elbows close to your sides.",
      "Curl the load up without swinging the shoulders or torso.",
      "Pause briefly at the top if you can still keep the elbows quiet.",
      "Lower under control to a full stretch."
    ],
    cues: ["Elbows stay close", "No torso swing", "Own the lowering phase"],
    commonMistakes: ["Leaning back to finish reps", "Letting elbows drift forward", "Dropping the weight too quickly"],
    safetyNotes: ["Use a neutral grip if elbows or wrists feel cranky.", "Keep load lighter if shoulder compensation shows up."],
    modifications: ["Hammer curl", "Cable curl", "Alternating dumbbell curl"],
    image: mediaRef("biceps-curl", "Biceps curl guide")
  }),
  movement({
    id: "calf-raise",
    name: "Calf Raise",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "machine", "dumbbell"],
    primaryMuscles: ["Calves"],
    secondaryMuscles: ["Feet"],
    instructions: [
      "Stand tall with even pressure through the base of the foot.",
      "Rise smoothly onto the ball of the foot without rolling the ankle.",
      "Pause briefly at the top and stay tall.",
      "Lower slowly until the heel is back under control."
    ],
    cues: ["Push through the big toe", "Smooth up and down", "Ankles stay straight"],
    commonMistakes: ["Bouncing at the bottom", "Rolling outward on the foot", "Rushing through reps"],
    safetyNotes: ["Use support if balance is limiting control.", "Keep range smaller if the Achilles is sensitive."],
    modifications: ["Supported calf raise", "Seated calf raise", "Single-leg calf raise"],
    image: mediaRef("calf-raise", "Calf raise guide")
  }),
  movement({
    id: "hip-thrust",
    name: "Hip Thrust",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["barbell", "dumbbell", "bench"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Set the upper back on support and feet flat with knees bent.",
      "Brace lightly and drive through the heels to lift the hips.",
      "Finish with ribs down and glutes squeezed instead of overextending the back.",
      "Lower under control until the hips reset."
    ],
    cues: ["Drive through heels", "Ribs down at the top", "Squeeze glutes, not low back"],
    commonMistakes: ["Overarching the back", "Feet too far away", "Rushing the top position"],
    safetyNotes: ["Use bodyweight or glute bridge first if setup feels unstable.", "Stop short of painful hip pinching."],
    modifications: ["Glute bridge", "Dumbbell hip thrust", "Paused bodyweight bridge"],
    image: mediaRef("hip-thrust", "Hip thrust guide")
  }),
  movement({
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "band"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Lie on your back with knees bent and feet planted.",
      "Brace lightly and press through the heels to lift the hips.",
      "Finish by squeezing the glutes, not by arching the low back.",
      "Lower slowly until the hips touch down."
    ],
    cues: ["Ribs stay down", "Push through heels", "Squeeze glutes at the top"],
    commonMistakes: ["Driving from the low back", "Feet too far from the hips", "Rushing the lowering phase"],
    safetyNotes: ["Keep range smaller if the back or front of the hip gets irritated.", "Pause and reset if hamstrings cramp early."],
    modifications: ["Bridge hold", "Single-leg bridge", "Banded bridge"],
    image: mediaRef("glute-bridge", "Glute bridge guide")
  }),
  movement({
    id: "band-pull-apart",
    name: "Band Pull-Apart",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["band"],
    primaryMuscles: ["Upper back", "Rear delts"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Hold a light band at shoulder height with soft elbows.",
      "Pull the band apart by spreading the hands and squeezing between the shoulder blades.",
      "Pause when the chest feels open and shoulders stay down.",
      "Return slowly to the start."
    ],
    cues: ["Long neck", "Spread the band", "Squeeze between the shoulder blades"],
    commonMistakes: ["Shrugging up into the neck", "Arching the back", "Using a band that is too heavy"],
    safetyNotes: ["Use a lighter band if you cannot keep the shoulders quiet.", "Stay in pain-free range when the shoulder is irritated."],
    modifications: ["Wall slide", "Face pull with light cable", "Partial-range pull-apart"],
    image: mediaRef("band-pull-apart", "Band pull-apart guide")
  }),
  movement({
    id: "wall-squat",
    name: "Wall Squat",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["wall"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Stand with your back supported and feet a comfortable distance from the wall.",
      "Slide down only into a depth you can control pain-free.",
      "Keep even pressure through both feet and hold with steady breathing.",
      "Drive through the feet to return up or end the hold."
    ],
    cues: ["Use the wall for support", "Stay pain-aware", "Even pressure through both feet"],
    commonMistakes: ["Sliding too deep too soon", "Letting knees collapse inward", "Holding breath through the entire set"],
    safetyNotes: ["Keep the hold short and shallow if knee confidence is low.", "Stop if pressure becomes sharp instead of muscular."],
    modifications: ["Supported box squat pattern", "Sit-to-stand", "Partial wall sit"],
    image: mediaRef("wall-squat", "Wall squat guide")
  }),
  movement({
    id: "supported-split-squat",
    name: "Supported Split Squat",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "support"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Set a split stance and hold a support for balance.",
      "Lower slowly while keeping most of the pressure through the front foot.",
      "Stay within a depth where the front knee and hip remain controlled.",
      "Stand back up through the front leg."
    ],
    cues: ["Use the support", "Front foot heavy", "Stay tall"],
    commonMistakes: ["Dropping too deep", "Shifting all weight to the back leg", "Losing balance and rushing reps"],
    safetyNotes: ["This is a better option when lunges feel unstable.", "Shorten the range before pain or balance becomes the limiter."],
    modifications: ["Static split squat hold", "Reverse lunge to support", "Wall squat"],
    image: mediaRef("supported-split-squat", "Supported split squat guide")
  }),
  movement({
    id: "hamstring-stretch",
    name: "Hamstring Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Set one heel forward and hinge from the hips with a long spine.",
      "Keep the front knee soft instead of locking it out hard.",
      "Lean until you feel a stretch behind the thigh, not pain in the back.",
      "Breathe steadily and ease out slowly."
    ],
    cues: ["Hinge, do not round", "Soft front knee", "Breathe into the stretch"],
    commonMistakes: ["Rounding the low back", "Forcing range", "Locking the knee"],
    safetyNotes: ["Back off if you feel nerve tension or sharp pulling.", "Use support if balance affects the position."],
    modifications: ["Supine hamstring stretch", "Bent-knee hamstring stretch", "Dynamic leg swing"],
    image: mediaRef("hamstring-stretch", "Hamstring stretch guide")
  }),
  movement({
    id: "hip-flexor-stretch",
    name: "Hip Flexor Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hip flexors"],
    secondaryMuscles: ["Quads", "Glutes"],
    instructions: [
      "Set a half-kneeling position with the ribs stacked over the hips.",
      "Gently tuck the pelvis and squeeze the glute on the kneeling side.",
      "Shift forward slightly until the front of the hip opens.",
      "Hold steady without arching the low back."
    ],
    cues: ["Tuck first, then glide", "Glute stays on", "Ribs over hips"],
    commonMistakes: ["Leaning way forward", "Arching through the low back", "Forcing the range aggressively"],
    safetyNotes: ["Pad the knee if needed.", "Keep it gentle if the front of the hip feels pinchy."],
    modifications: ["Standing hip flexor stretch", "Shorter-range half-kneeling hold", "Split-stance hip opener"],
    image: mediaRef("hip-flexor-stretch", "Hip flexor stretch guide")
  }),
  movement({
    id: "thoracic-rotation",
    name: "Thoracic Rotation",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Upper back"],
    secondaryMuscles: ["Shoulders", "Core"],
    instructions: [
      "Set a side-lying or quadruped position with the lower back quiet.",
      "Rotate through the upper back while following the hand with your eyes.",
      "Pause at the open position and breathe out.",
      "Return smoothly without forcing the neck."
    ],
    cues: ["Rotate from the upper back", "Eyes follow the hand", "Exhale into the open position"],
    commonMistakes: ["Twisting through the low back", "Yanking the shoulder open", "Holding the breath"],
    safetyNotes: ["Keep the range small if the shoulder feels pinchy.", "Move slowly if dizziness shows up during rotation."],
    modifications: ["Thread the needle", "Open book", "Wall-supported rotation"],
    image: mediaRef("thoracic-rotation", "Thoracic rotation guide")
  }),
  movement({
    id: "shoulder-mobility",
    name: "Shoulder Mobility",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "band", "wall"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Upper back"],
    instructions: [
      "Move the shoulder through a comfortable range while keeping the ribs down.",
      "Focus on smooth reaching and controlled rotation, not forcing end range.",
      "Pause briefly where you can breathe and stay relaxed.",
      "Reset if the neck starts taking over."
    ],
    cues: ["Relax the neck", "Smooth reach", "Move only in pain-free range"],
    commonMistakes: ["Shrugging through every rep", "Forcing overhead range", "Arching the low back to cheat mobility"],
    safetyNotes: ["Keep motion small during active shoulder irritation.", "Control matters more than range."],
    modifications: ["Wall slide", "Band shoulder opener", "Supported arm circles"],
    image: mediaRef("shoulder-mobility", "Shoulder mobility guide")
  }),
  movement({
    id: "plank",
    name: "Plank",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Set elbows or hands under the shoulders and make a straight body line.",
      "Brace the trunk gently and squeeze the glutes.",
      "Keep the head neutral and breathe behind the brace.",
      "Finish before the hips sag or the shoulders shrug."
    ],
    cues: ["Long line", "Ribs down", "Breathe, do not hold"],
    commonMistakes: ["Sagging through the hips", "Piking too high", "Looking too far forward"],
    safetyNotes: ["Elevate the hands if shoulder or low-back comfort is limited.", "Shorter, cleaner holds beat long sloppy holds."],
    modifications: ["Incline plank", "Knee plank", "Side plank"],
    image: mediaRef("plank", "Plank guide")
  }),
  movement({
    id: "dead-bug",
    name: "Dead Bug",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip flexors", "Shoulders"],
    instructions: [
      "Lie on your back with knees and arms stacked over the hips and shoulders.",
      "Exhale to flatten the ribs gently toward the floor.",
      "Reach the opposite arm and leg away without losing trunk position.",
      "Return and switch sides with control."
    ],
    cues: ["Exhale first", "Keep ribs heavy", "Move slowly"],
    commonMistakes: ["Arching the low back", "Rushing the limb movement", "Going too far for control"],
    safetyNotes: ["Limit range if you lose trunk control.", "Use this as a recovery drill, not a speed exercise."],
    modifications: ["Heel taps", "Arms-only dead bug", "Dead bug breathing hold"],
    image: mediaRef("dead-bug", "Dead bug guide")
  }),
  movement({
    id: "side-plank",
    name: "Side Plank",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Obliques"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Set the elbow under the shoulder and stack the ribs over the hips.",
      "Lift the hips until the body forms one long diagonal line.",
      "Keep the top shoulder relaxed and breathe steadily.",
      "Lower before the hips rotate or sag."
    ],
    cues: ["Elbow under shoulder", "Lift from the side body", "Stay long through the spine"],
    commonMistakes: ["Rolling the chest down", "Shoulder shrugging", "Holding too long with poor shape"],
    safetyNotes: ["Bend the knees if shoulder or side-body strength is limited.", "Stop if the shoulder loses stability."],
    modifications: ["Knee side plank", "Short-lever side plank", "Supported side plank against wall"],
    image: mediaRef("side-plank", "Side plank guide")
  }),
  movement({
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "cardio",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core", "Hip flexors"],
    secondaryMuscles: ["Shoulders", "Cardio"],
    instructions: [
      "Start in a strong plank with hands under shoulders.",
      "Drive one knee toward the chest without letting the hips jump up.",
      "Switch smoothly and keep the trunk stable.",
      "Move only as fast as you can maintain a solid plank."
    ],
    cues: ["Strong plank first", "Quick feet, quiet hips", "Hands press the floor away"],
    commonMistakes: ["Bouncing the hips high", "Rounding hard through the upper back", "Going too fast to control"],
    safetyNotes: ["Elevate the hands if wrists or shoulders are irritated.", "Slow the tempo if low-back control slips."],
    modifications: ["Incline mountain climber", "Slow climber", "Marching plank"],
    image: mediaRef("mountain-climber", "Mountain climber guide")
  }),
  movement({
    id: "high-knees",
    name: "High Knees",
    category: "cardio",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Hip flexors", "Calves"],
    instructions: [
      "Stand tall and start with a light bounce through the feet.",
      "Drive one knee up toward hip height while the opposite arm swings naturally.",
      "Switch quickly while staying tall through the trunk.",
      "Land softly and keep rhythm smooth."
    ],
    cues: ["Tall posture", "Fast arms help fast legs", "Soft landings"],
    commonMistakes: ["Leaning way back", "Slamming the feet", "Letting the knees stay low while sprinting arms only"],
    safetyNotes: ["Use a march if impact is not comfortable.", "Shorter rounds work better than sloppy speed."],
    modifications: ["High-knee march", "Fast march in place", "Low-impact cardio step"],
    image: mediaRef("high-knees", "High knees guide")
  }),
  movement({
    id: "burpee",
    name: "Burpee",
    category: "cardio",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Chest", "Legs", "Core"],
    instructions: [
      "Start standing, hinge down, and place your hands under the shoulders.",
      "Step or jump back into plank while keeping the trunk braced.",
      "Return the feet forward and stand up powerfully.",
      "Add the jump only if you can still land softly and stay in control."
    ],
    cues: ["Hands under shoulders", "Strong plank position", "Land softly"],
    commonMistakes: ["Collapsing into the low back", "Catching feet too wide", "Turning every rep into a rushed flop"],
    safetyNotes: ["Step the feet instead of jumping if joints are irritated.", "Use a squat-thrust version if the full burpee feels too aggressive."],
    modifications: ["Step-back burpee", "Squat thrust", "Plank walkout"],
    image: mediaRef("burpee", "Burpee guide")
  }),
  movement({
    id: "cat-cow",
    name: "Cat-Cow",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Spine"],
    secondaryMuscles: ["Core", "Upper back"],
    instructions: [
      "Start on hands and knees with shoulders over wrists and hips over knees.",
      "Round the spine gently as you exhale into cat.",
      "Then lengthen the front body and lift the chest softly into cow.",
      "Move smoothly with the breath instead of forcing range."
    ],
    cues: ["Move with the breath", "Segment the spine", "Smooth and easy"],
    commonMistakes: ["Jamming the neck", "Rushing through range", "Forcing the low back too hard"],
    safetyNotes: ["Stay in a small range if the back feels sensitive.", "Use a towel under the knees if needed."],
    modifications: ["Seated cat-cow", "Child's pose to tabletop flow", "Short-range spinal waves"],
    image: mediaRef("cat-cow", "Cat-cow guide")
  }),
  movement({
    id: "worlds-greatest-stretch",
    name: "World's Greatest Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hips", "Thoracic spine"],
    secondaryMuscles: ["Hamstrings", "Shoulders"],
    instructions: [
      "Step into a long lunge with the hands framing the front foot.",
      "Drop the back knee if needed and open the chest into rotation.",
      "Return the hand to the floor and settle into the hip stretch briefly.",
      "Switch sides with control."
    ],
    cues: ["Long lunge stance", "Rotate from the upper back", "Breathe between positions"],
    commonMistakes: ["Rushing the transitions", "Collapsing the chest", "Forcing the rotation with the neck"],
    safetyNotes: ["Use blocks or support if hands do not comfortably reach the floor.", "Shorten the stride if the front hip pinches."],
    modifications: ["Split-stance reach", "Open-book rotation", "Half-kneeling mobility flow"],
    image: mediaRef("worlds-greatest-stretch", "Total-body mobility guide")
  }),
  movement({
    id: "hip-flow-90-90",
    name: "90/90 Hip Flow",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hips"],
    secondaryMuscles: ["Glutes", "Core"],
    instructions: [
      "Sit tall with both knees bent into a 90/90 position.",
      "Rotate through the hips to switch both knees to the other side.",
      "Move slowly and stay tall instead of collapsing backward.",
      "Use the hands for support only as much as needed."
    ],
    cues: ["Tall torso", "Rotate from the hips", "Smooth switches"],
    commonMistakes: ["Throwing the knees over with momentum", "Collapsing the chest", "Forcing painful hip range"],
    safetyNotes: ["Limit range if the front or deep hip feels pinchy.", "Keep a hand down for balance if needed."],
    modifications: ["Supported 90/90 switch", "Seated hip rotations", "Half-range hip flow"],
    image: mediaRef("hip-flow-90-90", "90/90 hip flow guide")
  }),
  movement({
    id: "wall-slide",
    name: "Wall Slide",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["wall"],
    primaryMuscles: ["Shoulders", "Upper back"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Stand with forearms or hands against the wall and ribs stacked.",
      "Slide the arms upward while keeping the neck relaxed and shoulders controlled.",
      "Pause where you can still keep contact and control.",
      "Return slowly without arching the low back."
    ],
    cues: ["Ribs down", "Reach and slide", "Keep the neck quiet"],
    commonMistakes: ["Arching the back to gain range", "Shrugging hard", "Pushing into pain"],
    safetyNotes: ["Stay below painful overhead range.", "Move slower if shoulder control is the main goal."],
    modifications: ["Supported arm raise", "Band pull-apart", "Table slide"],
    image: mediaRef("wall-slide", "Wall slide guide")
  }),
  movement({
    id: "childs-pose-side-reach",
    name: "Child's Pose with Side Reach",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Lats", "Upper back"],
    secondaryMuscles: ["Hips"],
    instructions: [
      "Sit back into child's pose with the arms long in front.",
      "Walk both hands to one side and breathe into the long side body.",
      "Hold for a few easy breaths without forcing the hips down.",
      "Return to center and repeat on the other side."
    ],
    cues: ["Long reach", "Easy breathing", "Let the side body open"],
    commonMistakes: ["Forcing the hips down aggressively", "Collapsing into the shoulders", "Holding the breath"],
    safetyNotes: ["Use a cushion under the hips if knees are tight.", "Stay higher if the shoulders feel pinchy overhead."],
    modifications: ["Table-supported lat stretch", "Quadruped side reach", "Short-range prayer stretch"],
    image: mediaRef("childs-pose-side-reach", "Side reach stretch guide")
  }),
  movement({
    id: "ankle-rocks",
    name: "Half-Kneeling Ankle Rocks",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Ankles"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Set a half-kneeling stance with the front foot flat.",
      "Drive the front knee forward over the middle toes without lifting the heel.",
      "Pause at the end range you can control.",
      "Rock back and repeat smoothly."
    ],
    cues: ["Heel stays down", "Knee tracks over toes", "Smooth rock forward"],
    commonMistakes: ["Letting the arch collapse", "Popping the heel up", "Forcing the knee too far inward"],
    safetyNotes: ["Use support if balance gets in the way.", "Stay pain-aware if the ankle or knee is irritated."],
    modifications: ["Wall ankle rocks", "Short-range forward knee drives", "Supported calf stretch"],
    image: mediaRef("ankle-rocks", "Ankle mobility guide")
  })
];

const MOVEMENTS_BY_ID = new Map(MOVEMENT_LIBRARY.map((movementEntry) => [movementEntry.id, movementEntry]));

const MOVEMENT_NAME_ALIASES = new Map(
  [
    ["barbell bench press", "dumbbell-press"],
    ["incline dumbbell press", "dumbbell-press"],
    ["bench press", "dumbbell-press"],
    ["dumbbell floor press", "dumbbell-press"],
    ["seated shoulder press", "overhead-press"],
    ["dumbbell shoulder press", "overhead-press"],
    ["overhead press", "overhead-press"],
    ["cable lateral raise", "lateral-raise"],
    ["triceps pushdown", "triceps-pushdown"],
    ["lat pulldown", "lat-pulldown"],
    ["chest-supported row", "row"],
    ["single-arm dumbbell row", "row"],
    ["cable row", "row"],
    ["cable face pull", "band-pull-apart"],
    ["ez-bar curl", "biceps-curl"],
    ["hammer curl", "biceps-curl"],
    ["back squat", "squat"],
    ["front squat", "squat"],
    ["bodyweight squat", "squat"],
    ["goblet squat", "squat"],
    ["jump squat", "squat"],
    ["supported box squat pattern", "wall-squat"],
    ["romanian deadlift", "deadlift"],
    ["dumbbell romanian deadlift", "deadlift"],
    ["leg press", "squat"],
    ["walking lunge", "lunge"],
    ["reverse lunge", "lunge"],
    ["bulgarian split squat", "supported-split-squat"],
    ["supported split squat", "supported-split-squat"],
    ["standing calf raise", "calf-raise"],
    ["seated calf raise", "calf-raise"],
    ["hip thrust", "hip-thrust"],
    ["leg curl", "deadlift"],
    ["push-up", "push-up"],
    ["glute bridge", "glute-bridge"],
    ["plank", "plank"],
    ["plank shoulder tap", "plank"],
    ["dead bug", "dead-bug"],
    ["dead bug breathing", "dead-bug"],
    ["side plank", "side-plank"],
    ["world's greatest stretch", "worlds-greatest-stretch"],
    ["cat-cow", "cat-cow"],
    ["90/90 hip switch", "hip-flow-90-90"],
    ["90/90 hip flow", "hip-flow-90-90"],
    ["mountain climber", "mountain-climber"],
    ["high knees", "high-knees"],
    ["burpee", "burpee"],
    ["band shoulder opener", "shoulder-mobility"],
    ["thread the needle", "thoracic-rotation"],
    ["thoracic rotation", "thoracic-rotation"],
    ["doorway pec stretch", "shoulder-mobility"],
    ["half-kneeling ankle rocks", "ankle-rocks"],
    ["walking spiderman reach", "worlds-greatest-stretch"],
    ["child's pose with side reach", "childs-pose-side-reach"],
    ["wall slide", "wall-slide"],
    ["glute bridge hold", "glute-bridge"]
  ].map(([name, id]) => [name.toLowerCase(), id])
);

export function getMovementLibrary() {
  return MOVEMENT_LIBRARY.map(cloneMovement);
}

export function getMovementById(id) {
  return cloneMovement(MOVEMENTS_BY_ID.get(id) || null);
}

export function findMovementForName(name) {
  const normalizedName = String(name || "").trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }

  const directId = MOVEMENT_NAME_ALIASES.get(normalizedName) || normalizedName;
  return getMovementById(directId);
}

export function attachMovementToExercise(exercise) {
  const movementEntry = getMovementById(exercise.movementId) || findMovementForName(exercise.name);
  return {
    ...exercise,
    movementId: movementEntry?.id || exercise.movementId || null,
    movement: movementEntry
  };
}

export function adaptMovementForProfile(movementId, profile = {}) {
  const movementEntry = getMovementById(movementId);
  if (!movementEntry || profile.injuryStatus === "none") {
    return movementEntry;
  }

  const restrictedAreas = Array.isArray(profile.restrictedAreas) ? profile.restrictedAreas : [];
  const substitutions = [
    { areas: ["shoulder"], match: ["dumbbell-press", "overhead-press", "push-up", "lateral-raise"], replaceWith: "band-pull-apart" },
    { areas: ["shoulder"], match: ["lat-pulldown"], replaceWith: "wall-slide" },
    { areas: ["knee"], match: ["squat", "lunge"], replaceWith: "wall-squat" },
    { areas: ["hip"], match: ["lunge", "squat"], replaceWith: "supported-split-squat" },
    { areas: ["back"], match: ["deadlift"], replaceWith: "glute-bridge" },
    { areas: ["back"], match: ["squat"], replaceWith: "wall-squat" },
    { areas: ["ankle"], match: ["lunge"], replaceWith: "supported-split-squat" }
  ];

  const replacement = substitutions.find(
    (rule) => rule.match.includes(movementEntry.id) && rule.areas.some((area) => restrictedAreas.includes(area))
  );

  return replacement ? getMovementById(replacement.replaceWith) : movementEntry;
}

export function selectFeaturedMovements({ goalType, preferredEnvironment, injuryStatus, restrictedAreas, mobilityEnabled }) {
  const baseSelections = {
    strength: ["squat", "deadlift", "row"],
    athletic_performance: ["overhead-press", "row", "thoracic-rotation"],
    bodybuilding: ["dumbbell-press", "row", "lateral-raise"],
    fat_loss: ["lunge", "push-up", "mountain-climber"],
    general_fitness: ["squat", "row", "push-up"],
    mobility: ["hip-flexor-stretch", "thoracic-rotation", "shoulder-mobility"],
    injury_recovery: ["glute-bridge", "band-pull-apart", "supported-split-squat"],
    active_aging: ["squat", "glute-bridge", "hip-flexor-stretch"]
  };
  const environmentBoost =
    preferredEnvironment === "home"
      ? ["push-up", "glute-bridge"]
      : preferredEnvironment === "gym"
        ? ["lat-pulldown", "hip-thrust"]
        : [];
  const mobilityBoost = mobilityEnabled ? ["thoracic-rotation", "hip-flexor-stretch"] : [];
  const combinedIds = dedupeIds([...(baseSelections[goalType] || baseSelections.general_fitness), ...environmentBoost, ...mobilityBoost]);

  return combinedIds
    .map((movementId) => adaptMovementForProfile(movementId, { injuryStatus, restrictedAreas }))
    .filter(Boolean)
    .slice(0, 4);
}

function movement({
  id,
  name,
  category,
  difficulty,
  environment,
  equipment,
  primaryMuscles,
  secondaryMuscles,
  instructions,
  cues,
  commonMistakes,
  safetyNotes,
  modifications,
  image
}) {
  return {
    id,
    name,
    category,
    difficulty,
    environment,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    instructions,
    cues,
    commonMistakes,
    safetyNotes,
    modifications,
    ...resolveMovementMedia(image, name)
  };
}

function mediaRef(key, alt) {
  return {
    type: "media-ref",
    key,
    alt
  };
}

function cloneMovement(movementEntry) {
  if (!movementEntry) {
    return null;
  }

  return {
    ...movementEntry,
    equipment: [...movementEntry.equipment],
    primaryMuscles: [...movementEntry.primaryMuscles],
    secondaryMuscles: [...movementEntry.secondaryMuscles],
    instructions: [...movementEntry.instructions],
    cues: [...movementEntry.cues],
    commonMistakes: [...movementEntry.commonMistakes],
    safetyNotes: [...movementEntry.safetyNotes],
    modifications: [...movementEntry.modifications],
    image: movementEntry.image || null,
    imageAlt: movementEntry.imageAlt || `${movementEntry.name} movement guide`,
    thumbnail: movementEntry.thumbnail || null,
    media: movementEntry.media
      ? {
          ...movementEntry.media,
          images: Array.isArray(movementEntry.media.images) ? [...movementEntry.media.images] : [],
          steps: Array.isArray(movementEntry.media.steps) ? [...movementEntry.media.steps] : []
        }
      : null,
    video: movementEntry.video ? { ...movementEntry.video } : null
  };
}

function dedupeIds(ids) {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function resolveMovementMedia(image, name) {
  if (typeof image === "string") {
    return {
      image,
      imageAlt: `${name} movement guide`,
      thumbnail: image,
      media: {
        status: "basic",
        thumbnail: image,
        images: [image, image, image, image],
        steps: [image, image, image, image],
        videoUrl: null
      },
      video: null
    };
  }

  if (image?.type === "media-ref") {
    const mapped = MOVEMENT_MEDIA[image.key] || buildMovementMedia(image.key, image.alt || `${name} movement guide`);
    return {
      image: mapped?.image || null,
      imageAlt: mapped?.imageAlt || image.alt || `${name} movement guide`,
      thumbnail: mapped?.thumbnail || null,
      media: mapped
        ? {
            status: mapped.images?.length ? "basic" : mapped.thumbnail ? "basic" : "none",
            thumbnail: mapped.thumbnail || null,
            images: Array.isArray(mapped.images) ? mapped.images : [],
            steps: Array.isArray(mapped.images) ? mapped.images : [],
            videoUrl: mapped.videoUrl || null
          }
        : null,
      video: null
    };
  }

  return {
    image: null,
    imageAlt: `${name} movement guide`,
    thumbnail: null,
    media: null,
    video: null
  };
}

function buildMovementMedia(assetName, imageAlt) {
  const approvedAsset = getReviewedMediaAsset(assetName);
  if (!approvedAsset) {
    return null;
  }

  return {
    image: approvedAsset.image || approvedAsset.thumbnail || null,
    imageAlt,
    thumbnail: approvedAsset.thumbnail || null,
    images: Array.isArray(approvedAsset.images) ? approvedAsset.images : [],
    videoUrl: approvedAsset.videoUrl || null
  };
}

```

## FILE: server/data/store.js

`$ext
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { attachMovementToExercise, findMovementForName, selectFeaturedMovements } from "./movementLibrary.js";
import { buildMobilityModule, buildMobilityPlan } from "./stretchLibrary.js";
import {
  CUSTOMIZABLE_MODULE_IDS,
  getActiveModules,
  normalizeHiddenModules,
  normalizeModuleOrder,
  normalizeNutritionMode
} from "../../shared/dashboardModules.js";
import { hasCompletedOnboarding, isProfileComplete } from "../../shared/profileState.js";
import { formatHydration, formatWeight, normalizeUnitPreference } from "../../shared/unitSystem.js";
import {
  ACCESS_TIERS,
  FREE_COMPLETED_SESSION_LIMIT,
  TRIAL_LENGTH_DAYS,
  normalizeAccessTier
} from "../../shared/entitlements.js";
import {
  buildEquipmentProfileFromSelections,
  formatWorkoutFocus,
  getDefaultEquipmentSelections,
  getEquipmentSelectionsForProfile,
  getSuggestedWorkoutFocuses,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../../shared/workoutEngine.js";
import { normalizeAppMode } from "../../shared/appModes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.join(__dirname, "db.json");
const DB_PATH = path.resolve(process.env.PULSEPEAK_DB_PATH || DEFAULT_DB_PATH);

const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_DURATION_MS = 30 * DAY_MS;
const FREE_WEEKLY_WORKOUT_LIMIT = FREE_COMPLETED_SESSION_LIMIT;
const TRIAL_DURATION_DAYS = TRIAL_LENGTH_DAYS;
const GOAL_TYPES = [
  "strength",
  "athletic_performance",
  "bodybuilding",
  "fat_loss",
  "general_fitness",
  "mobility",
  "injury_recovery",
  "active_aging"
];
const AGE_GROUPS = ["18-29", "30-39", "40-49", "50+"];
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const TRAINING_ENVIRONMENTS = ["home", "gym", "hybrid"];
const INJURY_STATUSES = ["none", "minor", "active_injury"];
const RESTRICTED_AREAS = ["knee", "shoulder", "back", "elbow", "hip", "ankle"];
const NUTRITION_MODES = ["off", "basic", "full"];
const SEX_OPTIONS = ["female", "male", "non_binary", "prefer_not_to_say"];

export function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw);
  if (!Array.isArray(db.users)) {
    db.users = [];
  }
  if (!Array.isArray(db.sessions)) {
    db.sessions = [];
  }
  if (!Array.isArray(db.webhookEvents)) {
    db.webhookEvents = [];
  }
  const now = Date.now();
  const filteredSessions = db.sessions.filter((session) => {
    if (!session.expiresAt) {
      return true;
    }

    return new Date(session.expiresAt).getTime() > now;
  });

  if (filteredSessions.length !== db.sessions.length) {
    db.sessions = filteredSessions;
    writeDb(db);
  }

  return db;
}

export function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function ensureDbFile() {
  const dbDirectory = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(
        {
          users: [],
          sessions: [],
          webhookEvents: []
        },
        null,
        2
      )
    );
  }
}

function normalizeStoredUser(user) {
  return {
    ...user,
    data: normalizeWellnessData(user.data)
  };
}

export function normalizeWellnessData(data = {}) {
  const normalizedGoals = {
    calories: Number(data.goals?.calories || 2200),
    protein: Number(data.goals?.protein || 150),
    water: Number(data.goals?.water || 2.8),
    sleep: Number(data.goals?.sleep || 8),
    workoutMinutes: Number(data.goals?.workoutMinutes || 55)
  };
  const normalizedProfile = {
    goalType: GOAL_TYPES.includes(data.profile?.goalType) ? data.profile.goalType : "general_fitness",
    ageGroup: AGE_GROUPS.includes(data.profile?.ageGroup) ? data.profile.ageGroup : "30-39",
    birthdate: typeof data.profile?.birthdate === "string" ? data.profile.birthdate : "",
    experienceLevel: EXPERIENCE_LEVELS.includes(data.profile?.experienceLevel) ? data.profile.experienceLevel : "beginner",
    trainingEnvironment: TRAINING_ENVIRONMENTS.includes(data.profile?.trainingEnvironment)
      ? data.profile.trainingEnvironment
      : "hybrid",
    equipmentProfile: normalizeEquipmentProfile(data.profile?.equipmentProfile, data.profile?.trainingEnvironment),
    equipmentSelections: normalizeEquipmentSelections(data.profile?.equipmentSelections, data.profile?.trainingEnvironment),
    injuryStatus: INJURY_STATUSES.includes(data.profile?.injuryStatus) ? data.profile.injuryStatus : "none",
    sex: SEX_OPTIONS.includes(data.profile?.sex) ? data.profile.sex : "",
    heightCm: Number.isFinite(Number(data.profile?.heightCm)) ? Number(data.profile.heightCm) : null,
    currentWeight: Number.isFinite(Number(data.profile?.currentWeight)) ? Number(data.profile.currentWeight) : null,
    targetWeight: Number.isFinite(Number(data.profile?.targetWeight)) ? Number(data.profile.targetWeight) : null,
    unitPreference: normalizeUnitPreference(data.profile?.unitPreference),
    nutritionMode: NUTRITION_MODES.includes(data.profile?.nutritionMode)
      ? data.profile.nutritionMode
      : normalizeNutritionMode(
          GOAL_TYPES.includes(data.profile?.goalType) ? data.profile.goalType : "general_fitness",
          data.profile?.nutritionMode
        ),
    appMode: normalizeAppMode(data.profile?.appMode),
    moduleOrder: normalizeModuleOrder(data.profile?.moduleOrder),
    hiddenModules: normalizeHiddenModules(data.profile?.hiddenModules),
    exerciseGuidanceLevel: ["full", "standard", "minimal"].includes(data.profile?.exerciseGuidanceLevel)
      ? data.profile.exerciseGuidanceLevel
      : "standard",
    showWarmup: typeof data.profile?.showWarmup === "boolean" ? data.profile.showWarmup : true,
    showCooldown: typeof data.profile?.showCooldown === "boolean" ? data.profile.showCooldown : true,
    onboardingCompleted:
      typeof data.profile?.onboardingCompleted === "boolean" ? data.profile.onboardingCompleted : true,
    restrictedAreas: Array.isArray(data.profile?.restrictedAreas)
      ? data.profile.restrictedAreas.filter((area) => RESTRICTED_AREAS.includes(area))
      : []
  };
  if (normalizedProfile.birthdate) {
    normalizedProfile.ageGroup = deriveAgeGroupFromBirthdate(normalizedProfile.birthdate);
  }
  normalizedProfile.equipmentProfile = buildEquipmentProfileFromSelections(
    normalizedProfile.equipmentSelections?.length ? normalizedProfile.equipmentSelections : getDefaultEquipmentSelections(normalizedProfile.trainingEnvironment),
    normalizedProfile.trainingEnvironment
  );

  return {
    ...data,
    goals: normalizedGoals,
    profile: normalizedProfile,
    waterIntake: Number(data.waterIntake || 0),
    sleepHours: Number(data.sleepHours || normalizedGoals.sleep),
    energyLevel: ["Low", "Steady", "High"].includes(data.energyLevel) ? data.energyLevel : "Steady",
    meals: Array.isArray(data.meals) ? data.meals : [],
    workouts: Array.isArray(data.workouts) ? data.workouts.map(normalizeWorkout) : [],
    savedWorkouts: Array.isArray(data.savedWorkouts) ? data.savedWorkouts.map(normalizeSavedWorkout).filter(Boolean) : [],
    habits: Array.isArray(data.habits) ? data.habits : [],
    weeklyHistory: Array.isArray(data.weeklyHistory) ? data.weeklyHistory : [],
    weeklyCheckIns: Array.isArray(data.weeklyCheckIns) ? data.weeklyCheckIns.map(normalizeWeeklyCheckIn).filter(Boolean) : [],
    weightHistory: Array.isArray(data.weightHistory) ? data.weightHistory : [],
    notes: Array.isArray(data.notes) ? data.notes : []
  };
}

export function hasProcessedWebhookEvent(eventId) {
  const normalizedEventId = String(eventId || "").trim();
  if (!normalizedEventId) {
    return false;
  }

  const db = readDb();
  return db.webhookEvents.some((event) => event.id === normalizedEventId);
}

export function recordProcessedWebhookEvent(eventId, type) {
  const normalizedEventId = String(eventId || "").trim();
  if (!normalizedEventId) {
    throw new Error("Webhook event ID is required.");
  }

  const db = readDb();
  if (db.webhookEvents.some((event) => event.id === normalizedEventId)) {
    return false;
  }

  db.webhookEvents.push({
    id: normalizedEventId,
    type: String(type || "").trim() || "unknown",
    processedAt: new Date().toISOString()
  });

  if (db.webhookEvents.length > 500) {
    db.webhookEvents = db.webhookEvents.slice(-500);
  }

  writeDb(db);
  return true;
}

export function findUserByEmail(email) {
  const db = readDb();
  const user = db.users.find((entry) => entry.email === email.toLowerCase());
  return user ? normalizeStoredUser(user) : null;
}

export function findUserById(userId) {
  const db = readDb();
  const user = db.users.find((entry) => entry.id === userId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByStripeCustomerId(customerId) {
  const normalizedCustomerId = String(customerId || "").trim();
  if (!normalizedCustomerId) {
    return null;
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.stripeCustomerId === normalizedCustomerId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByStripeSubscriptionId(subscriptionId) {
  const normalizedSubscriptionId = String(subscriptionId || "").trim();
  if (!normalizedSubscriptionId) {
    return null;
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.stripeSubscriptionId === normalizedSubscriptionId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function findUserByToken(token) {
  const db = readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  const user = db.users.find((entry) => entry.id === session.userId) || null;
  return user ? normalizeStoredUser(user) : null;
}

export function createUser({ name, email, password }) {
  const db = readDb();
  const safeName = String(name || "").trim();
  const normalizedName = safeName || String(email || "").trim().split("@")[0] || "PulsePeak User";
  const normalizedEmail = email.trim().toLowerCase();

  if (db.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    tier: "free",
    planTier: ACCESS_TIERS.FREE,
    subscriptionStatus: "inactive",
    currentPeriodEnd: null,
    trialStartedAt: null,
    trialEndsAt: null,
    trialBillingChoice: null,
    trialStatus: "inactive",
    trialCanceledAt: null,
    trialConvertedAt: null,
    hasUsedTrial: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionPlanInterval: null,
    cancelAtPeriodEnd: false,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    data: createDefaultWellnessData(normalizedName)
  };

  db.users.push(user);
  writeDb(db);
  return user;
}

export function validateUser(email, password) {
  const user = findUserByEmail(email.trim());
  if (!user) {
    return null;
  }

  const attemptedHash = crypto.scryptSync(password, user.salt, 64).toString("hex");
  return attemptedHash === user.passwordHash ? normalizeStoredUser(user) : null;
}

export function createSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  db.sessions = db.sessions.filter((session) => session.userId !== userId);
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt
  });
  writeDb(db);
  return token;
}

export function clearSession(token) {
  const db = readDb();
  db.sessions = db.sessions.filter((session) => session.token !== token);
  writeDb(db);
}

export function updateUserData(userId, updater) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  const nextData = updater(normalizeWellnessData(structuredClone(db.users[index].data)));
  db.users[index].data = normalizeWellnessData(nextData);
  writeDb(db);
  return normalizeStoredUser(db.users[index]);
}

export function updateUserAccount(userId, updater) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  db.users[index] = updater(structuredClone(db.users[index]));
  writeDb(db);
  return normalizeStoredUser(db.users[index]);
}

export function sanitizeUser(user) {
  const profile = normalizeWellnessData(user.data).profile;
  const accessTier = getAccessTier(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    tier: getUserTier(user),
    accessTier,
    accessLabel: formatAccessLabel(accessTier),
    planTier: user?.planTier || accessTier,
    subscriptionStatus: getSubscriptionStatus(user),
    currentPeriodEnd: user.currentPeriodEnd || null,
    trialEndsAt: accessTier === "trial_active" ? getTrialEndsAt(user) : null,
    trialEndsLabel: accessTier === "trial_active" ? formatDateLabel(getTrialEndsAt(user)) : null,
    trialDaysRemaining: accessTier === "trial_active" ? getTrialDaysRemaining(user) : 0,
    canStartTrial: canStartTrial(user),
    trialBillingChoice: user?.trialBillingChoice || null,
    trialStatus: user?.trialStatus || "inactive",
    trialCanceledAt: user?.trialCanceledAt || null,
    trialConvertedAt: user?.trialConvertedAt || null,
    hasUsedTrial: Boolean(user?.hasUsedTrial || user?.trialStartedAt || user?.trialUsedAt),
    hasBillingProfile: Boolean(user.stripeCustomerId),
    subscriptionPlanInterval: user?.subscriptionPlanInterval || null,
    cancelAtPeriodEnd: Boolean(user?.cancelAtPeriodEnd),
    profileComplete: isProfileComplete(profile),
    onboardingCompleted: hasCompletedOnboarding(profile)
  };
}

export function getSubscriptionStatus(user) {
  return String(user?.subscriptionStatus || "inactive").toLowerCase().trim() || "inactive";
}

export function isPremiumEntitled(user) {
  const status = getSubscriptionStatus(user);
  return getUserTier(user) === "premium" || status === "active" || status === "trialing";
}

export function summarizeDashboard(data) {
  data = normalizeWellnessData(data);
  const today = new Date().toISOString().slice(0, 10);
  const workouts = sortWorkoutsDesc((data.workouts || []).map(normalizeWorkout));
  const totals = {
    calories: (data.meals || []).reduce((sum, meal) => sum + meal.calories, 0),
    protein: (data.meals || []).reduce((sum, meal) => sum + meal.protein, 0),
    workoutMinutes: workouts.reduce((sum, workout) => sum + workout.duration, 0)
  };
  const habitSummary = (data.habits || []).map((habit) => ({
    ...habit,
    streak: calculateStreak(habit.completedDates),
    completedToday: habit.completedDates.includes(today)
  }));
  const completion = calculateCompletionScore(data, totals, habitSummary, workouts);

  const nutritionGuidance = buildNutritionPlanning(data, totals);
  const weeklyPlan = buildWeeklyPlan(data, totals, habitSummary, completion, workouts);
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const mobilityModule = buildMobilityModule({
    goalType: data.profile.goalType,
    injuryStatus: data.profile.injuryStatus,
    restrictedAreas: data.profile.restrictedAreas,
    lowRecovery,
    trainingEnvironment: data.profile.trainingEnvironment,
    planContext: {
      weeklyFocus: weeklyPlan.weeklyFocus,
      intensityDirection: weeklyPlan.suggestedWorkoutMix?.intensityGuidance,
      mobilityTarget: weeklyPlan.mobilityBlock?.weeklyTarget,
      suggestedSplits: weeklyPlan.suggestedWorkoutMix?.recommendedFocuses || weeklyPlan.suggestedWorkoutMix?.split || []
    }
  });
  const resultProjection = buildResultProjection(data, {
    totals,
    completion,
    habits: habitSummary,
    workoutStreak: calculateWorkoutStreak(workouts),
    weeklyTrend: getWeeklyTrend(data.weeklyHistory || [], completion)
  });
  const workoutEngine = buildWorkoutEngineSummary(data, weeklyPlan, workouts);

  return {
    totals,
    completion,
    workoutStreak: calculateWorkoutStreak(workouts),
    recentWorkouts: workouts.slice(0, 3),
    savedWorkouts: sortSavedWorkoutsDesc(data.savedWorkouts || []),
    latestExerciseLoads: buildLatestExerciseLoads(workouts),
    exerciseHistory: buildExerciseHistory(workouts),
    habits: habitSummary,
    weeklyHistory: data.weeklyHistory,
    weeklyCheckIns: data.weeklyCheckIns,
    weightHistory: data.weightHistory,
    profile: data.profile,
    nutritionGuidance,
    mobilityModule,
    workoutEngine,
    resultProjection,
    whyThisWorks: buildWhyThisWorksBlock(data, weeklyPlan),
    activeModules: getActiveModules({ profile: data.profile, hasHabits: (data.habits || []).length > 0 }),
    insights: buildCoachingTips(data, totals, habitSummary, completion, workouts),
    todayFocus: buildTodayFocusCard(data, totals, habitSummary, completion, workouts),
    momentum: buildMomentumFeedback(data, totals, habitSummary, completion, workouts),
    weeklyPlanPreview: buildWeeklyPlanPreview(weeklyPlan),
    planSummary: buildLimitedWeeklyPlan(weeklyPlan),
    premiumPreview: {
      title: "Smarter workout execution",
      description: "Upgrade to unlock deeper split guidance, stronger exercise variety, broader mobility support, and better weekly workout decisions.",
      features: [
        "Unlimited workout logging across the week",
        "More exercise swap depth for the equipment you actually have",
        "Deeper mobility, recovery, and fueling adjustments"
      ]
    }
  };
}

function normalizeWeeklyCheckIn(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  return {
    id: entry.id || crypto.randomUUID(),
    weekKey: typeof entry.weekKey === "string" ? entry.weekKey : getWeekKey(entry.createdAt || new Date().toISOString()),
    createdAt: entry.createdAt || new Date().toISOString(),
    weekFeel: normalizeEnum(entry.weekFeel, ["rough", "mixed", "strong"], "mixed"),
    recoveryFeel: normalizeEnum(entry.recoveryFeel, ["low", "steady", "high"], "steady"),
    planDifficulty: normalizeEnum(entry.planDifficulty, ["too_easy", "right", "too_hard"], "right"),
    nutritionAdherence: normalizeEnum(entry.nutritionAdherence, ["off_track", "mostly_on", "locked_in"], "mostly_on"),
    sorenessIssues: normalizeEnum(entry.sorenessIssues, ["none", "manageable", "significant"], "manageable"),
    confidence: normalizeEnum(entry.confidence, ["low", "steady", "high"], "steady")
  };
}

function normalizeEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function getWeekKey(referenceDate = new Date()) {
  const localReference = new Date(referenceDate);
  const day = localReference.getDay();
  const dayOffset = day === 0 ? 6 : day - 1;
  const start = new Date(localReference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayOffset);
  return start.toISOString().slice(0, 10);
}

export function buildWeeklyCheckInState(data, { isPremium = false } = {}) {
  data = normalizeWellnessData(data);
  const checkIns = [...(data.weeklyCheckIns || [])].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const latestCheckIn = checkIns[0] || null;
  const currentWeekKey = getWeekKey();
  const currentWeekSubmitted = latestCheckIn?.weekKey === currentWeekKey;
  const weeklyTrend = getWeeklyTrend(data.weeklyHistory || [], getLatestWeeklyScore(data));
  const workoutCountThisWeek = countWeeklyLoggedWorkouts(data.workouts || []);

  if (!latestCheckIn) {
    return {
      currentWeekKey,
      submittedThisWeek: false,
      title: "Close the loop on your week",
      summary: "A 60-second weekly check-in helps PulsePeak explain what is working, what felt off, and how next week should tighten up.",
      freeSummary: "Check in once a week to keep the plan feeling responsive instead of generic.",
      premiumSummary: "Premium uses the same check-in to explain the deeper reasoning behind next week's changes.",
      whatWentWell: [],
      needsTightening: [],
      nextWeekAdjustments: [],
      todayConnection: "Your weekly reflection will help PulsePeak connect today's actions to next week's direction more clearly.",
      premiumReasoning: ""
    };
  }

  const whatWentWell = [];
  const needsTightening = [];
  const nextWeekAdjustments = [];

  if (latestCheckIn.weekFeel === "strong") {
    whatWentWell.push("The week felt strong enough to keep momentum instead of rebuilding from scratch.");
  } else if (latestCheckIn.weekFeel === "mixed") {
    whatWentWell.push("Parts of the week worked, which means the system only needs a few cleaner decisions rather than a full reset.");
  }

  if (latestCheckIn.recoveryFeel !== "low") {
    whatWentWell.push("Recovery held up well enough to support the current training rhythm.");
  } else {
    needsTightening.push("Recovery felt softer than the plan wants, so next week needs cleaner pacing.");
    nextWeekAdjustments.push("Bias recovery and mobility work earlier so training doesn't start from a hole.");
  }

  if (latestCheckIn.nutritionAdherence === "locked_in") {
    whatWentWell.push("Nutrition felt consistent, which makes the weekly plan easier to trust.");
  } else if (latestCheckIn.nutritionAdherence === "off_track") {
    needsTightening.push("Nutrition felt off track, so the app should keep fueling actions simpler and harder to miss.");
    nextWeekAdjustments.push("Keep protein and hydration actions more visible until the week feels easier to execute.");
  }

  if (latestCheckIn.planDifficulty === "too_hard") {
    needsTightening.push("The plan felt too hard, so next week should protect recovery before asking for more.");
    nextWeekAdjustments.push("Pull one session lighter and keep the week more repeatable.");
  } else if (latestCheckIn.planDifficulty === "too_easy") {
    whatWentWell.push("The current structure felt manageable enough to handle a slightly stronger push.");
    nextWeekAdjustments.push("Lean one session harder or add a little more intensity where recovery allows.");
  } else {
    whatWentWell.push("The overall training load felt about right, which makes progression easier to keep stacking.");
  }

  if (latestCheckIn.sorenessIssues === "significant") {
    needsTightening.push("Soreness or joint issues were loud enough that movement support should carry more weight next week.");
    nextWeekAdjustments.push("Keep mobility and physio-style support closer to the front of the week.");
  } else if (latestCheckIn.sorenessIssues === "manageable") {
    whatWentWell.push("Soreness stayed manageable, so the system can keep building without overreacting.");
  }

  if (latestCheckIn.confidence === "high") {
    nextWeekAdjustments.push("Carry confidence forward by keeping the plan specific, not busier.");
  } else if (latestCheckIn.confidence === "low") {
    needsTightening.push("Confidence heading into next week is low, so the plan should feel simpler and easier to follow.");
    nextWeekAdjustments.push("Make next week's first wins obvious so the week feels easier to start.");
  }

  if (weeklyTrend === "up") {
    whatWentWell.push("Your broader weekly trend is still moving in the right direction.");
  } else if (weeklyTrend === "down") {
    needsTightening.push("Your weekly trend has softened, so the next week should chase consistency before intensity.");
  }

  if (workoutCountThisWeek <= 1) {
    needsTightening.push("Training volume stayed light, so the next week should protect one minimum viable session early.");
  }

  return {
    currentWeekKey,
    submittedThisWeek: currentWeekSubmitted,
    title: currentWeekSubmitted ? "This week's reflection is in" : "Your last weekly check-in",
    summary:
      latestCheckIn.weekFeel === "strong"
        ? "The week mostly held together. PulsePeak can now lean into momentum instead of only protecting against misses."
        : latestCheckIn.weekFeel === "rough"
          ? "The week felt rough enough that the next plan should get simpler before it gets harder."
          : "The week had enough signal for PulsePeak to tighten a few things without changing everything.",
    freeSummary:
      "Free keeps the recap short so you can see what went well, what needs tightening, and the main adjustment for next week.",
    premiumSummary:
      "Premium goes further by explaining why the weekly system is adjusting and how those changes connect back to today's priorities.",
    whatWentWell: whatWentWell.slice(0, 3),
    needsTightening: needsTightening.slice(0, 3),
    nextWeekAdjustments: nextWeekAdjustments.slice(0, 3),
    todayConnection:
      latestCheckIn.nutritionAdherence === "off_track"
        ? "Today's actions should stay fuel-first so next week's plan starts from cleaner recovery."
        : latestCheckIn.recoveryFeel === "low"
          ? "Today's actions should stay recovery-first so next week's plan doesn't carry the same fatigue forward."
          : "Today's actions should protect the weekly momentum you just built instead of starting over again.",
    premiumReasoning: isPremium
      ? buildWeeklyCheckInPremiumReasoning(latestCheckIn, { weeklyTrend, workoutCountThisWeek })
      : "",
    latestCheckIn
  };
}

function buildWeeklyCheckInPremiumReasoning(checkIn, { weeklyTrend, workoutCountThisWeek }) {
  const reasons = [];
  if (checkIn.planDifficulty === "too_hard") {
    reasons.push("The weekly system will trim pressure because your reflection says the plan is outrunning recovery.");
  }
  if (checkIn.planDifficulty === "too_easy") {
    reasons.push("The weekly system can add a little more intent because the current load felt comfortable.");
  }
  if (checkIn.nutritionAdherence === "off_track") {
    reasons.push("Fueling guidance will stay more visible because nutrition felt harder to execute than training itself.");
  }
  if (checkIn.sorenessIssues === "significant") {
    reasons.push("Mobility and physio-style support should sit closer to the front of the week because soreness was more than background noise.");
  }
  if (weeklyTrend === "up") {
    reasons.push("Your trend is still climbing, so the plan can build from momentum instead of only damage control.");
  }
  if (workoutCountThisWeek <= 1) {
    reasons.push("Because training frequency stayed low, the next weekly plan should protect an early win before asking for more.");
  }
  return reasons.slice(0, 3).join(" ");
}

function getLatestWeeklyScore(data) {
  const latest = (data.weeklyHistory || []).at(-1);
  return Number.isFinite(latest?.score) ? latest.score : 0;
}

export function getWorkoutWeekWindow(referenceDate = new Date()) {
  const end = new Date(referenceDate);
  const start = new Date(end.getTime() - 7 * DAY_MS);
  return { start, end };
}

export function countWeeklyLoggedWorkouts(workouts = [], referenceDate = new Date()) {
  const { start, end } = getWorkoutWeekWindow(referenceDate);
  return (workouts || [])
    .map(normalizeWorkout)
    .filter((workout) => {
      const loggedAt = new Date(workout.loggedAt);
      return loggedAt >= start && loggedAt <= end;
    }).length;
}

export function buildWorkoutAccess(user) {
  const workouts = normalizeWellnessData(user?.data).workouts || [];
  const weeklyLogged = countWeeklyLoggedWorkouts(workouts);
  const accessTier = getAccessTier(user);
  const premiumUnlimited = accessTier === ACCESS_TIERS.PREMIUM;
  const trialUnlimited = accessTier === ACCESS_TIERS.TRIAL;
  const fullLoggingAccess = premiumUnlimited || trialUnlimited;
  const { end } = getWorkoutWeekWindow();
  return {
    accessTier,
    accessLabel: formatAccessLabel(accessTier),
    premiumUnlimited,
    trialUnlimited,
    fullLoggingAccess,
    canStartTrial: canStartTrial(user),
    trialEndsAt: accessTier === "trial_active" ? getTrialEndsAt(user) : null,
    trialEndsLabel: accessTier === "trial_active" ? formatDateLabel(getTrialEndsAt(user)) : null,
    trialDaysRemaining: accessTier === "trial_active" ? getTrialDaysRemaining(user) : 0,
    weeklyLogged,
    limit: fullLoggingAccess ? null : FREE_WEEKLY_WORKOUT_LIMIT,
    remaining: fullLoggingAccess ? null : Math.max(0, FREE_WEEKLY_WORKOUT_LIMIT - weeklyLogged),
    locked: !fullLoggingAccess && weeklyLogged >= FREE_WEEKLY_WORKOUT_LIMIT,
    resetAt: end.toISOString(),
    resetLabel: "the rolling 7-day window clears",
    windowLabel: "last 7 days"
  };
}

export function buildWeeklyPlan(data, totals, habits, completion, workouts = []) {
  data = normalizeWellnessData(data);
  const profile = data.profile;
  const workoutStreak = calculateWorkoutStreak(workouts);
  const recentWorkouts = workouts.slice(0, 5);
  const recentWorkoutDays = new Set(recentWorkouts.map((workout) => workout.loggedAt?.slice(0, 10)).filter(Boolean)).size;
  const strengthCount = recentWorkouts.filter((workout) => workout.type === "strength").length;
  const cardioCount = recentWorkouts.filter((workout) => workout.type === "cardio").length;
  const mobilityCount = recentWorkouts.filter((workout) => workout.type === "mobility").length;
  const gymCount = recentWorkouts.filter((workout) => workout.environment === "gym").length;
  const homeCount = recentWorkouts.filter((workout) => workout.environment === "home").length;
  const goalBlueprint = getGoalBlueprint(profile.goalType);
  const activeModules = getActiveModules({ profile, hasHabits: habits.length > 0 });
  const activeModuleIds = new Set(activeModules.map((module) => module.id));
  const nutritionMode = profile.nutritionMode;
  const nutritionEnabled = activeModuleIds.has("nutrition");
  const hydrationEnabled = activeModuleIds.has("hydration");
  const mobilityEnabled = activeModuleIds.has("mobility");
  const habitsEnabled = activeModuleIds.has("habits");
  const preferredEnvironment =
    profile.trainingEnvironment === "hybrid"
      ? gymCount === homeCount
        ? "both"
        : gymCount > homeCount
          ? "gym"
          : "home"
      : profile.trainingEnvironment;
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const completedHabitCount = habits.filter((habit) => habit.completedToday).length;
  const habitCompletionRate = habits.length ? completedHabitCount / habits.length : 0;
  const topHabit = [...habits].sort((left, right) => right.streak - left.streak)[0];
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const highRecovery = data.sleepHours >= data.goals.sleep - 0.25 && data.energyLevel === "High";
  const weeklyTrend = getWeeklyTrend(data.weeklyHistory || [], completion);
  const proteinCompletion = totals.protein / data.goals.protein;
  const hydrationCompletion = data.waterIntake / data.goals.water;
  const calorieCompletion = totals.calories / data.goals.calories;
  const nutritionPlanning = buildNutritionPlanning(data, totals);
  const goalDrivenSessions = Math.min(6, Math.max(2, Math.round(data.goals.workoutMinutes / 18)));
  const recentTrainingBaseline = recentWorkoutDays >= 4 ? 4 : recentWorkoutDays >= 2 ? 3 : 2;
  const ageRecoveryPenalty = profile.ageGroup === "50+" ? 1 : profile.ageGroup === "40-49" ? 0.5 : 0;
  const injuryPenalty = profile.injuryStatus === "active_injury" ? 1 : profile.injuryStatus === "minor" ? 0.5 : 0;
  const experienceBoost = profile.experienceLevel === "advanced" ? 0.5 : profile.experienceLevel === "beginner" ? -0.25 : 0;
  const recommendedSessions = Math.max(
    2,
    Math.min(
      6,
      Math.round(goalDrivenSessions + goalBlueprint.sessionBias + experienceBoost - ageRecoveryPenalty - injuryPenalty)
    )
  );
  const finalSessions = lowRecovery && recommendedSessions > 4 ? recommendedSessions - 1 : recommendedSessions;
  const intensity = getIntensityGuidance({
    goalType: profile.goalType,
    lowRecovery,
    highRecovery,
    injuryStatus: profile.injuryStatus,
    experienceLevel: profile.experienceLevel
  });
  const weeklyFocus = getWeeklyFocus({
    profile,
    proteinGap,
    waterGap,
    lowRecovery,
    weeklyTrend,
    completion
  });
  const workoutMix = buildWorkoutMix({
    goalType: profile.goalType,
    finalSessions,
    preferredEnvironment,
    lowRecovery,
    injuryStatus: profile.injuryStatus,
    strengthCount,
    cardioCount,
    mobilityCount
  });
  const restrictionNote = buildRestrictionNote(profile.restrictedAreas);
  const cadence =
    preferredEnvironment === "both"
      ? "Blend gym and home sessions based on your schedule, energy, and equipment access."
      : `Lean on ${preferredEnvironment} sessions this week so the plan matches your actual setup.`;
  const focusReason =
    proteinGap >= 25
      ? `Your current protein intake is ${proteinGap}g short of goal, so better fueling is the fastest way to improve recovery quality.`
      : waterGap >= 0.5
        ? `Hydration is still ${waterGap.toFixed(1)}L short, so the week needs cleaner execution before extra intensity.`
        : lowRecovery
          ? "Sleep, energy, or injury context says this week should protect progress instead of forcing volume."
          : `${formatGoalType(profile.goalType)} is your main goal, so the weekly structure now leans toward ${goalBlueprint.focusPhrase}.`;
  const recoveryEmphasis = getRecoveryEmphasis({
    profile,
    lowRecovery,
    highRecovery
  });
  const nutritionEmphasis = nutritionEnabled
    ? getNutritionEmphasis({
    profile,
    data,
    proteinGap,
    calorieGap,
    waterGap,
    nutritionMode,
    nutritionPlanning
  })
    : null;
  const hydrationFloor = Number(
    Math.max(data.goals.water, nutritionPlanning.hydrationLiters, profile.goalType === "fat_loss" ? 3 : data.goals.water).toFixed(1)
  );
  const coachNote =
    completedHabitCount === 0
      ? `Use one tiny daily habit to make a ${formatGoalType(profile.goalType).toLowerCase()} week easier to sustain.`
      : `Your habit base is already supporting ${formatGoalType(profile.goalType).toLowerCase()}, so this week is about cleaner execution instead of adding chaos.`;
  const mobilityBlock = mobilityEnabled
    ? buildMobilityPlan({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    restrictedAreas: profile.restrictedAreas,
    lowRecovery,
    workoutEnvironment: preferredEnvironment
  })
    : null;
  const adaptiveSignals = [
    `Goal signal: ${formatGoalType(profile.goalType)} with ${profile.experienceLevel} experience in a ${profile.trainingEnvironment} setup.`,
    nutritionPlanning.bodyProfileNote,
    `Training baseline: ${recentWorkoutDays} recent workout day${recentWorkoutDays === 1 ? "" : "s"} with a ${workoutStreak}-day streak.`,
    `Recovery signal: ${data.sleepHours.toFixed(1)} hours of sleep, ${data.energyLevel.toLowerCase()} energy, and ${profile.injuryStatus === "none" ? "no active injury flags." : `${profile.injuryStatus.replace("_", " ")} status${restrictionNote ? ` around ${restrictionNote}` : ""}.`}`
  ];
  const executionPriorities = [
    nutritionEnabled
      ? proteinGap >= 25
        ? `Hit a daily protein floor of at least ${Math.max(data.goals.protein - 20, 100)}g before treating calories as done.`
        : `Keep protein near your ${nutritionPlanning.proteinRangeLabel} so ${goalBlueprint.outputPhrase}.`
      : `Focus first on session quality and recovery since nutrition tracking is currently turned down.`,
    hydrationEnabled
      ? waterGap >= 0.5
        ? `Treat ${hydrationFloor.toFixed(1)}L as the daily floor and close the current hydration gap earlier in the day.`
        : `Keep hydration above ${Math.max(hydrationFloor - 0.3, 1.8).toFixed(1)}L before the evening.`
      : mobilityEnabled
        ? `Use the mobility block as the easiest recovery bridge between harder sessions.`
        : `Keep recovery inputs updated so the plan can keep matching how the week actually feels.`,
    habitsEnabled
      ? topHabit
        ? `Use "${topHabit.name}" as the anchor habit that keeps the week from slipping.`
        : "Pair each session with one small daily habit so the plan stays easier to follow."
      : `Use one fixed training slot this week so execution stays repeatable.`
  ];
  if (nutritionEnabled && nutritionPlanning.mealDirection.length) {
    executionPriorities.splice(1, 0, nutritionPlanning.mealDirection[0]);
  }
  const workoutRationale = getWorkoutRationale({
    profile,
    strengthCount,
    cardioCount,
    mobilityCount,
    restrictionNote
  });
  const habitAnchor =
    habitCompletionRate >= 0.66
      ? `Your habits are already holding together, so protect that with ${topHabit?.name || "one repeatable daily routine"} every day.`
      : `Consistency is still fragile, so use ${topHabit?.name || "one small daily habit"} as the non-negotiable anchor this week.`;
  const premiumReason = buildWeeklyPlanPremiumReason({
    proteinGap,
    waterGap,
    lowRecovery,
    weeklyTrend,
    habitCompletionRate,
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus
  });
  const featuredMovements = selectFeaturedMovements({
    goalType: profile.goalType,
    preferredEnvironment,
    injuryStatus: profile.injuryStatus,
    restrictedAreas: profile.restrictedAreas,
    mobilityEnabled
  });
  const resultProjection = buildResultProjection(data, {
    totals,
    completion,
    habits,
    workoutStreak,
    weeklyTrend
  });
  const whyThisWorks = buildWhyThisWorksBlock(data, {
    workoutCadence: `${finalSessions} training sessions across the week`,
    nutritionEmphasis,
    recoveryEmphasis
  });

  return {
    weeklyFocus,
    focusReason,
    workoutCadence: `${finalSessions} training sessions across the week`,
    goalProfile: {
      goalType: profile.goalType,
      label: formatGoalType(profile.goalType),
      ageGroup: profile.ageGroup,
      birthdate: profile.birthdate,
      experienceLevel: profile.experienceLevel,
      trainingEnvironment: profile.trainingEnvironment,
      equipmentProfile: profile.equipmentProfile,
      injuryStatus: profile.injuryStatus,
      restrictedAreas: profile.restrictedAreas,
      sex: profile.sex,
      unitPreference: profile.unitPreference,
      heightCm: profile.heightCm,
      currentWeight: profile.currentWeight,
      targetWeight: profile.targetWeight
    },
    suggestedWorkoutMix: {
      environment: preferredEnvironment,
      equipmentProfile: profile.equipmentProfile,
      split: workoutMix,
      recommendedFocuses: getSuggestedWorkoutFocuses({
        goalType: profile.goalType,
        injuryStatus: profile.injuryStatus,
        lowRecovery
      }).map((focusId) => formatWorkoutFocus(focusId)),
      intensityGuidance: intensity,
      rationale: `${workoutRationale} ${cadence}`,
      featuredMovements
    },
    recoveryEmphasis,
    nutritionMode,
    nutritionEmphasis,
    nutritionTargets: nutritionEnabled
      ? {
          calorieRangeLabel: nutritionPlanning.calorieRangeLabel,
          proteinRangeLabel: nutritionPlanning.proteinRangeLabel,
          hydrationTargetLabel: nutritionPlanning.hydrationTargetLabel,
          why: nutritionPlanning.why,
          mealDirection: nutritionPlanning.mealDirection,
          todaysActions: nutritionPlanning.todaysActions,
          templates: nutritionPlanning.templates,
          targetWeightNote: nutritionPlanning.targetWeightNote
        }
      : null,
    hydrationEmphasis: hydrationEnabled ? `Treat ${hydrationFloor.toFixed(1)}L as the non-negotiable hydration floor each day.` : null,
    mobilityBlock,
    coachNote,
    adaptiveSignals,
    executionPriorities,
    habitAnchor,
    weeklyRationale: [
      focusReason,
      `Goal match: your current profile points to ${finalSessions} structured sessions centered on ${goalBlueprint.focusPhrase}.`,
      restrictionNote
        ? `Movement guardrail: the plan keeps ${restrictionNote} in mind so training stays realistic instead of ignoring your current limits.`
        : "Movement guardrail: the plan keeps your current setup and recovery profile in mind instead of defaulting to a generic split.",
      weeklyTrend === "up"
        ? "Momentum is building, so the plan preserves it with structure instead of forcing a reset."
        : "Recent momentum is mixed, so the plan simplifies the week into easier wins you can repeat."
    ],
    premiumReason,
    resultProjection,
    whyThisWorks,
    previewNote: getWeeklyPlanPreviewNote({
      proteinCompletion,
      hydrationCompletion,
      calorieCompletion,
      lowRecovery,
      goalType: profile.goalType
    }),
    activeModules
  };
}

function buildWeeklyPlanPreview(plan) {
  const highlightNote = plan.mobilityBlock?.weeklyTarget || plan.nutritionTargets?.proteinRangeLabel || plan.previewNote;
  return {
    title: "Personalized Weekly Plan",
    badge: "Premium feature",
    teaser: `${plan.weeklyFocus} with ${plan.workoutCadence.toLowerCase()} tuned for ${plan.goalProfile?.label?.toLowerCase() || "your current goal"}.`,
    highlights: [
      plan.workoutCadence,
      plan.suggestedWorkoutMix.split[0],
      highlightNote
    ],
    premiumHighlights: [
      plan.suggestedWorkoutMix.intensityGuidance,
      plan.executionPriorities[0],
      plan.executionPriorities[1],
      plan.mobilityBlock?.title || plan.habitAnchor
    ],
    premiumReason: plan.premiumReason,
    premiumTeaser: `${plan.weeklyFocus} with a plan that adjusts around your goal, recovery, training history, mobility needs, and consistency gaps.`,
    lockedPreviewLabel: "Free preview"
  };
}

export function buildLimitedWeeklyPlan(plan) {
  return {
    weeklyFocus: plan.weeklyFocus,
    focusReason: plan.focusReason,
    goalProfile: plan.goalProfile,
    workoutCadence: plan.workoutCadence,
    activeModules: plan.activeModules,
    nutritionMode: plan.nutritionMode,
    resultProjection: plan.resultProjection,
    whyThisWorks: plan.whyThisWorks,
    suggestedWorkoutMix: {
      environment: plan.suggestedWorkoutMix.environment,
      split: plan.suggestedWorkoutMix.split.slice(0, 2),
      intensityGuidance: plan.suggestedWorkoutMix.intensityGuidance,
      featuredMovements: (plan.suggestedWorkoutMix.featuredMovements || []).slice(0, 2)
    },
    nutritionEmphasis: plan.nutritionEmphasis,
    nutritionTargets: plan.nutritionTargets
      ? {
          calorieRangeLabel: plan.nutritionTargets.calorieRangeLabel,
          proteinRangeLabel: plan.nutritionTargets.proteinRangeLabel,
          hydrationTargetLabel: plan.nutritionTargets.hydrationTargetLabel,
          todayDirection: plan.nutritionTargets.todayDirection
            ? {
                title: plan.nutritionTargets.todayDirection.title,
                summary: plan.nutritionTargets.todayDirection.summary,
                freeSteps: (plan.nutritionTargets.todayDirection.freeSteps || []).slice(0, 2)
              }
            : null,
          mealDirection: (plan.nutritionTargets.mealDirection || []).slice(0, 2),
          todaysActions: (plan.nutritionTargets.todaysActions || []).slice(0, 2),
          templates: (plan.nutritionTargets.templates || []).slice(0, 2)
        }
      : null,
    hydrationEmphasis: plan.hydrationEmphasis,
    mobilityBlock: plan.mobilityBlock
      ? {
          title: plan.mobilityBlock.title,
          reason: plan.mobilityBlock.reason,
          weeklyTarget: plan.mobilityBlock.weeklyTarget,
          warmup: (plan.mobilityBlock.warmup || []).slice(0, 1),
          cooldown: (plan.mobilityBlock.cooldown || []).slice(0, 1)
        }
      : null,
    previewNote: plan.previewNote,
    coachNote: plan.coachNote,
    premiumReason: plan.premiumReason
  };
}

function buildWorkoutEngineSummary(data, weeklyPlan, workouts = []) {
  const profile = data.profile;
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";
  const planSuggestedFocuses = weeklyPlan?.suggestedWorkoutMix?.recommendedFocuses || [];
  const suggestedFocuses = planSuggestedFocuses.length
    ? planSuggestedFocuses.map((focusLabel) => normalizeFocusLabelToId(focusLabel)).filter(Boolean)
    : getSuggestedWorkoutFocuses({
        goalType: profile.goalType,
        injuryStatus: profile.injuryStatus,
        lowRecovery
      });
  const recentFocuses = workouts
    .map((workout) => workout.focus)
    .filter(Boolean)
    .slice(0, 3)
    .map((focusId) => formatWorkoutFocus(focusId));
  const recommendedFocus = suggestedFocuses[0];
  const recentMatchDays = findDaysSinceFocus(workouts, recommendedFocus);
  const mostRecentFocus = workouts.find((workout) => workout.focus)?.focus || null;

  return {
    trainingLocation: profile.trainingEnvironment,
    equipmentProfile: profile.equipmentProfile,
    recommendedFocus,
    recommendedFocusLabel: formatWorkoutFocus(recommendedFocus),
    alternateFocusLabels: suggestedFocuses.slice(1, 4).map((focusId) => formatWorkoutFocus(focusId)),
    currentSplitSummary:
      weeklyPlan?.suggestedWorkoutMix?.recommendedFocuses?.length
        ? weeklyPlan.suggestedWorkoutMix.recommendedFocuses.join(" · ")
        : weeklyPlan?.suggestedWorkoutMix?.split?.join(" · "),
    recommendationReason:
      profile.injuryStatus !== "none"
        ? "Training should stay equipment-aware and easier to recover from while your movement guardrails stay in place."
        : lowRecovery
          ? "Recovery is softer right now, so the best workout should still move the week forward without forcing a hard split."
          : recentMatchDays === 0
            ? `${formatGoalType(profile.goalType)} is still the target, but the engine is rotating the movement mix so the session does not feel repeated.`
            : `${weeklyPlan?.weeklyFocus || formatGoalType(profile.goalType)} is the weekly target, so today leans on the split that best fits your setup and keeps the week balanced.`,
    recentFocuses,
    continuityNote:
      typeof recentMatchDays === "number"
        ? recentMatchDays === 0
          ? `${formatWorkoutFocus(recommendedFocus)} was already trained today, so the engine is leaning on exercise variety instead of serving the same workout again.`
          : `Last trained: ${formatWorkoutFocus(recommendedFocus)} ${recentMatchDays === 1 ? "yesterday" : `${recentMatchDays} days ago`}.`
        : `${formatWorkoutFocus(recommendedFocus)} has not been logged recently, so it has room to become the right anchor session now.`,
    recentRotationNote:
      mostRecentFocus && mostRecentFocus === recommendedFocus
        ? "Today keeps the same split priority, but should rotate the movement mix enough to stay fresh."
        : "Today leans toward a smarter split rotation based on what has and has not been trained recently."
  };
}

function normalizeFocusLabelToId(value) {
  const map = {
    Push: "push",
    Pull: "pull",
    Legs: "legs",
    "Chest + triceps": "chest_triceps",
    "Back + biceps": "back_biceps",
    Shoulders: "shoulders",
    "Upper body": "upper_body",
    "Lower body": "lower_body",
    "Full body": "full_body",
    "Mobility / recovery day": "mobility_recovery"
  };
  return map[value] || null;
}

function findDaysSinceFocus(workouts, focus) {
  if (!focus) {
    return null;
  }

  const matchedWorkout = workouts.find((workout) => workout.focus === focus && workout.loggedAt);
  if (!matchedWorkout) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - new Date(matchedWorkout.loggedAt).getTime()) / DAY_MS));
}

function getGoalBlueprint(goalType) {
  const map = {
    strength: {
      sessionBias: 0,
      focusPhrase: "lower-rep strength work and heavier primary lifts",
      outputPhrase: "higher-load training can recover well"
    },
    athletic_performance: {
      sessionBias: 0,
      focusPhrase: "mixed performance work plus mobility support",
      outputPhrase: "power, conditioning, and movement quality all stay covered"
    },
    bodybuilding: {
      sessionBias: 0.5,
      focusPhrase: "volume, muscle targeting, and repeatable upper-lower work",
      outputPhrase: "higher training volume still feels recoverable"
    },
    fat_loss: {
      sessionBias: 1,
      focusPhrase: "higher frequency training with a calorie-burn bias",
      outputPhrase: "higher-frequency sessions do not feel flat"
    },
    mobility: {
      sessionBias: -1,
      focusPhrase: "movement quality, lower intensity, and daily mobility",
      outputPhrase: "mobility work actually supports your day-to-day movement"
    },
    injury_recovery: {
      sessionBias: -1,
      focusPhrase: "safe low-load work that protects the irritated area",
      outputPhrase: "healing stays on track without losing all structure"
    },
    active_aging: {
      sessionBias: -0.5,
      focusPhrase: "joint-friendly strength work with extra recovery support",
      outputPhrase: "joint-friendly training stays consistent"
    },
    general_fitness: {
      sessionBias: 0,
      focusPhrase: "balanced training and repeatable weekly structure",
      outputPhrase: "balanced training stays easy to repeat"
    }
  };

  return map[goalType] || map.general_fitness;
}

function formatGoalType(goalType) {
  const labels = {
    strength: "Strength",
    athletic_performance: "Athletic performance",
    bodybuilding: "Bodybuilding",
    fat_loss: "Fat loss",
    general_fitness: "General fitness",
    mobility: "Mobility",
    injury_recovery: "Injury recovery",
    active_aging: "Active aging"
  };

  return labels[goalType] || "General fitness";
}

function getIntensityGuidance({ goalType, lowRecovery, highRecovery, injuryStatus, experienceLevel }) {
  if (injuryStatus === "active_injury") {
    return "Keep every session low-load and pain-aware while rebuilding confidence.";
  }
  if (goalType === "mobility") {
    return "Keep intensity low and prioritize movement quality over workload.";
  }
  if (goalType === "injury_recovery") {
    return "Keep intensity conservative and let movement quality lead the week.";
  }
  if (lowRecovery) {
    return "Keep intensity moderate, trim volume slightly, and lean on mobility work.";
  }
  if (goalType === "strength") {
    return highRecovery ? "Push one heavier strength day and keep the rest clean and technical." : "Use heavier top sets, then keep assistance work controlled.";
  }
  if (goalType === "bodybuilding") {
    return "Keep most work in a moderate effort range so you can accumulate cleaner volume.";
  }
  if (goalType === "fat_loss") {
    return "Keep sessions brisk and repeatable instead of chasing all-out fatigue.";
  }
  if (goalType === "athletic_performance") {
    return "Use one faster or more explosive day, then balance it with mobility and recovery.";
  }
  if (goalType === "active_aging") {
    return "Stay moderate and joint-friendly so recovery quality stays high all week.";
  }
  return experienceLevel === "advanced"
    ? "Stay mostly moderate with one harder effort."
    : "Stay moderate and focus on repeatable execution.";
}

function buildWorkoutMix({ goalType, finalSessions, preferredEnvironment, lowRecovery, injuryStatus, strengthCount, cardioCount, mobilityCount }) {
  const recommendedFocuses = getSuggestedWorkoutFocuses({ goalType, injuryStatus, lowRecovery }).map((focusId) => formatWorkoutFocus(focusId));
  const anchorFocus = recommendedFocuses[0] || "Full body";
  const secondaryFocus = recommendedFocuses[1] || "Upper body";
  const tertiaryFocus = recommendedFocuses[2] || "Mobility / recovery day";
  const homeSuffix = preferredEnvironment === "home" ? " at home" : "";

  if (goalType === "mobility") {
    return [
      "Mobility / recovery day",
      `Technique-based full body session${homeSuffix}`,
      "Easy walk or low-stress cardio block"
    ];
  }

  if (goalType === "injury_recovery") {
    return [
      "Mobility / recovery day",
      "Pain-aware upper or lower session",
      "Optional easy conditioning block"
    ];
  }

  if (goalType === "fat_loss") {
    return [
      `${anchorFocus} as the anchor training split`,
      `${secondaryFocus} when you want a second lifting day`,
      tertiaryFocus
    ];
  }

  if (goalType === "athletic_performance") {
    return [
      `${anchorFocus} for power and strength`,
      `${secondaryFocus} when speed or output needs to lead`,
      tertiaryFocus
    ];
  }

  if (goalType === "active_aging") {
    return [
      `${anchorFocus} as the main training day`,
      `${secondaryFocus} when you want extra volume`,
      tertiaryFocus
    ];
  }

  return [
    `${anchorFocus} as the main split`,
    `${secondaryFocus} as the second option`,
    tertiaryFocus === "Mobility / recovery day" ? `${tertiaryFocus}${homeSuffix}` : tertiaryFocus
  ];
}

function getRecoveryEmphasis({ profile, lowRecovery, highRecovery }) {
  if (profile.injuryStatus === "active_injury") {
    return "Bias the week toward pain-aware movement, lower-load work, and enough recovery between sessions to keep symptoms quiet.";
  }
  if (profile.goalType === "active_aging") {
    return "Protect sleep, joints, and session spacing so each workout leaves you feeling better instead of more beat up.";
  }
  if (profile.ageGroup === "50+") {
    return "Give yourself more room between harder sessions and use mobility work to keep recovery quality high.";
  }
  if (lowRecovery) {
    return "Bias your week toward sleep, lower-impact sessions, and at least two deliberate mobility blocks.";
  }
  if (highRecovery) {
    return "Recovery is strong enough to support one harder session, but keep the easy days easy.";
  }
  return "Protect your sleep routine and use mobility work to keep recovery steady between harder sessions.";
}

function buildNutritionPlanning(data, totals) {
  const profile = data.profile;
  const unitPreference = normalizeUnitPreference(profile.unitPreference);
  const age = getAgeFromBirthdate(profile.birthdate);
  const currentWeightLb = Number(profile.currentWeight || data.weightHistory?.[data.weightHistory.length - 1]?.weight || 0);
  const currentWeightKg = poundsToKilograms(currentWeightLb || 0);
  const targetWeightLb = Number(profile.targetWeight || 0);
  const baseGoalProteinMultiplier =
    profile.goalType === "bodybuilding"
      ? [0.8, 1]
      : profile.goalType === "strength" || profile.goalType === "athletic_performance"
        ? [0.75, 0.95]
        : profile.goalType === "fat_loss"
          ? [0.8, 1]
          : profile.goalType === "injury_recovery"
            ? [0.75, 0.9]
            : [0.65, 0.85];
  const proteinMin = currentWeightLb ? Math.round(currentWeightLb * baseGoalProteinMultiplier[0]) : Math.max(data.goals.protein - 20, 110);
  const proteinMax = currentWeightLb ? Math.round(currentWeightLb * baseGoalProteinMultiplier[1]) : Math.max(data.goals.protein, proteinMin + 20);
  const trainingBias = data.goals.workoutMinutes >= 70 ? 1.55 : data.goals.workoutMinutes >= 45 ? 1.45 : 1.35;
  const sexOffset = profile.sex === "male" ? 5 : profile.sex === "female" ? -161 : -78;
  const estimatedMaintenance = currentWeightKg && profile.heightCm && age
    ? Math.round((10 * currentWeightKg + 6.25 * Number(profile.heightCm) - 5 * age + sexOffset) * trainingBias)
    : null;
  const calorieAdjustment =
    profile.goalType === "fat_loss"
      ? -300
      : profile.goalType === "bodybuilding"
        ? 180
        : profile.goalType === "strength" || profile.goalType === "athletic_performance"
          ? 80
          : profile.goalType === "mobility" || profile.goalType === "injury_recovery"
            ? -50
            : 0;
  const calorieCenter = estimatedMaintenance ? estimatedMaintenance + calorieAdjustment : data.goals.calories;
  const calorieRangeLabel = `${Math.max(1400, calorieCenter - 150)}-${Math.max(1550, calorieCenter + 150)} kcal`;
  const hydrationLiters = Number(
    Math.max(
      data.goals.water,
      currentWeightKg ? currentWeightKg * 0.033 + (data.goals.workoutMinutes >= 45 ? 0.45 : 0.25) : data.goals.water
    ).toFixed(1)
  );
  const proteinRangeLabel = `${proteinMin}-${proteinMax} g`;
  const hydrationTargetLabel = formatHydration(hydrationLiters, unitPreference);
  const targetWeightNote =
    targetWeightLb && currentWeightLb && Math.abs(targetWeightLb - currentWeightLb) >= 3
      ? targetWeightLb < currentWeightLb
        ? `A slower cut toward ${Math.round(targetWeightLb)} lb is realistic if recovery and protein stay steady.`
        : `A steady build toward ${Math.round(targetWeightLb)} lb makes more sense if training quality and appetite stay strong.`
      : null;
  const why =
    estimatedMaintenance
      ? `These are rough training targets based on your age, height, current weight, selected goal, and how hard the week is meant to be.`
      : `These are practical starting targets shaped by your current goal, training setup, and the goals already saved in PulsePeak.`;
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(hydrationLiters - Number(data.waterIntake || 0), 0);
  const mealDirection = buildMealDirection({
    profile,
    totals,
    data,
    hydrationLiters,
    proteinMin,
    proteinGap,
    unitPreference
  });
  const todayDirection = buildTodayNutritionDirection({
    profile,
    proteinGap,
    calorieGap,
    waterGap,
    hydrationLiters,
    unitPreference
  });
  const todaysActions = buildNutritionExecutionPlan({
    profile,
    totals,
    goals: data.goals,
    waterIntake: data.waterIntake,
    hydrationLiters,
    proteinGap,
    unitPreference
  });
  const templates = buildNutritionTemplates({
    profile,
    calorieGap,
    proteinGap,
    waterGap,
    unitPreference
  });

  return {
    calorieRangeLabel,
    proteinRangeLabel,
    hydrationLiters,
    hydrationTargetLabel,
    why,
    todayDirection,
    mealDirection,
    todaysActions,
    templates,
    targetWeightNote,
    bodyProfileNote:
      currentWeightLb && profile.heightCm
        ? `Body profile: ${formatWeight(currentWeightLb, unitPreference)} at ${profile.unitPreference === "metric" ? `${Math.round(profile.heightCm)} cm` : `${Math.round(profile.heightCm / 2.54)} in`} with ${profile.sex ? profile.sex.replace("_", " ") : "unspecified"} training estimates.`
        : "Body profile: add birthdate, height, weight, and sex to tighten nutrition and recovery guidance further."
  };
}

function buildTodayNutritionDirection({ profile, proteinGap, calorieGap, waterGap, hydrationLiters, unitPreference }) {
  const hydrationServing = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";

  if (proteinGap >= 35) {
    return {
      title: "Build the day around protein first",
      summary: `You still have roughly ${Math.round(proteinGap)}g of protein to close, so the easiest win is one protein-heavy meal early plus one simple gap-fix later.`,
      freeSteps: [
        "Start with a 30-40g protein breakfast or lunch.",
        "Keep one shake, yogurt bowl, or turkey wrap ready in case the gap is still open tonight."
      ],
      premiumSteps: [
        "Put the highest-protein meal before the busiest part of the day so the gap does not drag into the evening.",
        "If you train later, use a shake or yogurt + fruit within an hour after training instead of relying on a big catch-up dinner.",
        "Keep hydration paired with that meal so recovery quality rises with the same action."
      ]
    };
  }

  if (profile.nutritionMode === "full" && calorieGap >= 350) {
    return {
      title: "Use one anchor meal to close the calorie gap cleanly",
      summary: "You do not need a perfect day. One balanced meal with protein, carbs, and fruit will move the day back toward target quickly.",
      freeSteps: [
        "Use one balanced anchor meal instead of grazing late.",
        "Keep protein in that meal so calories and recovery move together."
      ],
      premiumSteps: [
        "Place the anchor meal after training or in the part of the day where appetite is strongest.",
        "Use easier calories like rice, oats, bagels, or fruit if the day already got away from you.",
        "Finish the day with a lighter protein snack instead of trying to cram everything into one late meal."
      ]
    };
  }

  if (waterGap >= 0.5) {
    return {
      title: "Treat hydration like part of the meal plan",
      summary: `A quick ${hydrationServing} step before the next meal is the cleanest nutrition win still open today.`,
      freeSteps: [
        `Drink ${hydrationServing} before your next meal.`,
        "Keep water visible so the rest of the target feels easier to finish."
      ],
      premiumSteps: [
        `Use ${hydrationServing} before your next meal and another serving around training if recovery feels soft.`,
        "Front-load more of your water earlier tomorrow so the target stops turning into a late catch-up task."
      ]
    };
  }

  return {
    title: "Keep the day simple and repeatable",
    summary: "Your nutrition targets are close enough that consistency matters more than adding complexity.",
    freeSteps: [
      "Keep your next meal balanced and protein-forward.",
      "Finish the day with water nearby so tomorrow starts clean."
    ],
    premiumSteps: [
      "Keep meal timing predictable so tomorrow's training and appetite stay easier to manage.",
      "Protect a protein-forward evening meal so recovery stays automatic."
    ]
  };
}

function buildMealDirection({ profile, totals, data, hydrationLiters, proteinMin, proteinGap, unitPreference }) {
  const directions = [];
  if (profile.goalType === "fat_loss") {
    directions.push("Lead with a high-protein breakfast so appetite stays steadier through the afternoon.");
  }
  if (profile.goalType === "bodybuilding" || profile.goalType === "strength") {
    directions.push("Protect a post-workout meal with protein plus carbs so harder sessions recover cleanly.");
  }
  if (proteinGap >= 25) {
    directions.push(`Use one anchor meal with at least ${Math.min(45, Math.max(30, proteinMin / 4))}g of protein before dinner.`);
  } else {
    directions.push("Keep two protein-forward meals in the day so recovery does not depend on one late catch-up meal.");
  }
  directions.push(`Use hydration timing instead of guesswork: get roughly half of ${formatHydration(hydrationLiters, unitPreference)} in before mid-afternoon.`);
  if (totals.calories < data.goals.calories * 0.6 && profile.nutritionMode === "full") {
    directions.push("Add one easy snack option you can repeat on busy days so calories do not collapse late.");
  }
  return directions.slice(0, 3);
}

function buildNutritionExecutionPlan({ profile, totals, goals, waterIntake, hydrationLiters, proteinGap, unitPreference }) {
  const calorieGap = Math.max(goals.calories - totals.calories, 0);
  const waterGap = Math.max(hydrationLiters - Number(waterIntake || 0), 0);
  const actions = [];

  if (proteinGap >= 40) {
    actions.push("Eat a 30-40g protein breakfast or add a protein shake before the afternoon.");
  } else if (proteinGap >= 20) {
    actions.push(`Make your next meal protein-first and close at least ${Math.min(30, Math.round(proteinGap))}g of the gap.`);
  }

  if (profile.nutritionMode === "full" && calorieGap >= 450) {
    actions.push("Use one balanced anchor meal with protein, carbs, and fruit so calories recover without grazing all evening.");
  } else if (profile.nutritionMode === "full" && calorieGap >= 250) {
    actions.push("Add one planned snack or post-workout meal instead of leaving the calorie gap until late.");
  }

  if (waterGap >= 0.5) {
    const hydrationActionAmount = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";
    actions.push(`Drink ${hydrationActionAmount} of water before your next meal or training block.`);
  }

  if (!actions.length) {
    actions.push("Keep the next meal balanced and keep water nearby so today's targets stay easy to finish.");
  }

  return actions.slice(0, 3);
}

function buildNutritionTemplates({ profile, calorieGap, proteinGap, waterGap, unitPreference }) {
  const hydrationServing = normalizeUnitPreference(unitPreference) === "metric" ? "500 mL" : "16 oz";
  const templates = [
    {
      id: "high-protein-breakfast",
      title: "High-protein breakfast",
      combo: "Eggs + Greek yogurt, or oats + whey + fruit",
      nutrition: "30-40g protein · ~350-500 kcal",
      whenToUse: "Best when the day needs an early protein win."
    }
  ];

  if (profile.goalType === "strength" || profile.goalType === "bodybuilding" || profile.goalType === "athletic_performance") {
    templates.push({
      id: "quick-recovery-meal",
      title: "Quick recovery meal",
      combo: "Chicken + rice + fruit, or shake + bagel + yogurt",
      nutrition: "30-45g protein · ~450-700 kcal",
      whenToUse: "Use after harder sessions or when calories are trailing."
    });
  } else {
    templates.push({
      id: "quick-lunch",
      title: "Quick lunch",
      combo: "Tuna rice bowl, or yogurt + berries + granola",
      nutrition: "25-35g protein · ~350-550 kcal",
      whenToUse: "Use on busy days when you need a realistic meal, not a perfect one."
    });
  }

  if (proteinGap >= 30) {
    templates.push({
      id: "protein-gap-snack",
      title: "Protein-gap snack",
      combo: "Shake, cottage cheese, or deli-turkey wrap",
      nutrition: "20-30g protein · ~180-320 kcal",
      whenToUse: "Use when protein is still lagging later in the day."
    });
  } else if (calorieGap >= 300) {
    templates.push({
      id: "recovery-top-up",
      title: "Recovery top-up",
      combo: "Bagel + yogurt, oats + whey, or rice cakes + turkey",
      nutrition: "20-30g protein · ~250-400 kcal",
      whenToUse: "Use when calories are still open but a full extra meal feels like too much."
    });
  } else if (waterGap >= 0.5) {
    templates.push({
      id: "hydration-pairing",
      title: "Hydration pairing",
      combo: `${hydrationServing} water + fruit, or water + yogurt`,
      nutrition: "Hydration support · light snack",
      whenToUse: "Use before the next meal so hydration stops falling behind."
    });
  }

  return templates.slice(0, 4);
}

function getNutritionEmphasis({ profile, data, proteinGap, calorieGap, waterGap, nutritionMode, nutritionPlanning }) {
  if (nutritionMode === "basic") {
    return proteinGap >= 20
      ? `Keep protein front and center by closing the remaining ${proteinGap}g gap without overcomplicating tracking. A practical daily range is ${nutritionPlanning.proteinRangeLabel}.`
      : `Use simple protein-forward meals and hydration to support the training week without full calorie tracking. A steady protein range is ${nutritionPlanning.proteinRangeLabel}.`;
  }
  if (profile.goalType === "fat_loss") {
    return proteinGap >= 20
      ? `Keep meals high in protein while controlling appetite, close the remaining ${proteinGap}g gap earlier in the day, and treat ${nutritionPlanning.calorieRangeLabel} as the rough daily target band.`
      : `Use high-protein meals and repeatable food structure so fat-loss progress does not depend on willpower. A practical calorie lane is ${nutritionPlanning.calorieRangeLabel}.`;
  }
  if (profile.goalType === "bodybuilding") {
    return calorieGap >= 350
      ? `Stop under-fueling late in the day by planning one extra recovery meal or shake and working inside ${nutritionPlanning.calorieRangeLabel}.`
      : `Keep meals repeatable, protein-forward, and frequent enough to support training volume. A useful protein lane is ${nutritionPlanning.proteinRangeLabel}.`;
  }
  if (profile.goalType === "strength") {
    return proteinGap >= 25
      ? `Raise daily protein consistency, aim to close a remaining ${proteinGap}g gap earlier in the day, and keep intake near ${nutritionPlanning.proteinRangeLabel}.`
      : `Keep carbs and protein steady around your main lifting sessions so heavier work feels supported. A useful calorie lane is ${nutritionPlanning.calorieRangeLabel}.`;
  }
  if (profile.goalType === "injury_recovery") {
    return `Keep protein steady and avoid under-fueling so tissue recovery is not fighting against low intake. A practical hydration floor is ${nutritionPlanning.hydrationTargetLabel}.`;
  }
  if (waterGap >= 0.5) {
    return `Reinforce hydration by making ${nutritionPlanning.hydrationTargetLabel} your daily floor.`;
  }
  if (calorieGap >= 350) {
    return `Stop under-fueling late in the day by planning one reliable anchor meal and working inside ${nutritionPlanning.calorieRangeLabel}.`;
  }
  return `Keep meals repeatable and protein-forward so training recovery stays automatic. A practical protein lane is ${nutritionPlanning.proteinRangeLabel}.`;
}

function getWeeklyFocus({ profile, proteinGap, waterGap, lowRecovery, weeklyTrend, completion }) {
  if (profile.goalType === "injury_recovery") {
    return "Move safely while restoring confidence";
  }
  if (profile.goalType === "mobility") {
    return "Build daily mobility consistency";
  }
  if (proteinGap >= 25) {
    return "Recovery through better fueling";
  }
  if (waterGap >= 0.5) {
    return "Hydration consistency";
  }
  if (lowRecovery) {
    return "Protect recovery while staying active";
  }
  if (weeklyTrend === "up" || completion >= 80) {
    return `Build on current momentum for ${formatGoalType(profile.goalType).toLowerCase()}`;
  }
  return `Rebuild consistency around ${formatGoalType(profile.goalType).toLowerCase()}`;
}

function buildRestrictionNote(restrictedAreas) {
  if (!restrictedAreas?.length) {
    return "";
  }

  if (restrictedAreas.length === 1) {
    return restrictedAreas[0];
  }

  return `${restrictedAreas.slice(0, -1).join(", ")} and ${restrictedAreas.at(-1)}`;
}

function getWorkoutRationale({ profile, strengthCount, cardioCount, mobilityCount, restrictionNote }) {
  if (profile.goalType === "strength") {
    return "The mix leans toward lower-rep lifting and keeps accessories secondary so strength stays the main signal.";
  }
  if (profile.goalType === "bodybuilding") {
    return "The mix keeps more volume and muscle targeting in the week so you are not defaulting to generic full-body work.";
  }
  if (profile.goalType === "fat_loss") {
    return "The mix spreads training frequency a bit higher so calorie burn and adherence stay practical.";
  }
  if (profile.goalType === "athletic_performance") {
    return "The mix keeps strength, conditioning, and mobility together so performance work does not become one-dimensional.";
  }
  if (profile.goalType === "mobility") {
    return "The mix lowers intensity and keeps mobility at the center so movement quality improves without overload.";
  }
  if (profile.goalType === "injury_recovery") {
    return `The mix stays conservative${restrictionNote ? ` around ${restrictionNote}` : ""} so you can keep moving without pretending everything is normal.`;
  }
  if (profile.goalType === "active_aging") {
    return "The mix stays joint-friendly and recovery-heavy so training still feels sustainable next week.";
  }
  if (strengthCount === 0) {
    return "The mix leans toward strength first because your recent logs do not show enough resistance training yet.";
  }
  if (mobilityCount === 0) {
    return "The mix adds mobility support because your recent training is missing an easy recovery bridge.";
  }
  if (cardioCount === 0) {
    return "The mix keeps a conditioning slot so the week is not only strength work.";
  }
  return "The mix reflects your recent training pattern while keeping recovery and balance in the plan.";
}

export function calculateStreak(completedDates) {
  const entries = new Set(completedDates);
  let streak = 0;

  for (let index = 0; index < 365; index += 1) {
    const date = new Date(Date.now() - index * DAY_MS).toISOString().slice(0, 10);
    if (entries.has(date)) {
      streak += 1;
      continue;
    }

    if (index === 0) {
      continue;
    }

    break;
  }

  return streak;
}

export function buildCoachingTips(data, totals, habits, completion, workouts = []) {
  const coachEngine = buildCoachDecisionEngine(data, {
    totals,
    habits,
    completion,
    workouts
  });
  if (coachEngine?.nextActions?.length) {
    return coachEngine.nextActions.map((action) => action.title);
  }

  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const latestWorkout = workouts[0];
  const tips = [];

  if (completion < 70) {
    tips.push("Your recovery score is lagging a bit. Aim for one quick workout block and one protein-rich meal.");
  }

  if (!trainedToday) {
    if (data.sleepHours < 6.5 || data.energyLevel === "Low") {
      tips.push("Recovery looks limited today, so choose a lighter mobility or cardio session instead of a heavy lift.");
    } else {
      tips.push("You have not trained yet today. A structured strength or cardio session would move your score fastest.");
    }
  } else if (latestWorkout?.type === "strength" && data.energyLevel === "Low") {
    tips.push("You already trained today. Favor hydration, protein, and an easier evening walk instead of piling on more intensity.");
  }

  if (proteinGap > 0) {
    tips.push(`You still have ${proteinGap}g of protein available. Lean into yogurt, eggs, tofu, or chicken to close the gap.`);
  }

  if (waterGap > 0) {
    tips.push(`Hydration is ${waterGap.toFixed(1)}L short. Front-load two glasses before your next task switch.`);
  }

  if (pendingHabits.length) {
    tips.push(`Your next easy win is "${pendingHabits[0].name}". Completing it protects your streak momentum.`);
  }

  if (!tips.length) {
    tips.push("Everything is trending well. Hold the line with sleep, a short walk, and your usual meal cadence.");
  }

  return tips;
}

export function buildCoachDecisionEngine(data, summaryLike, isPremium = false) {
  const normalizedData = normalizeWellnessData(data);
  const workouts = sortWorkoutsDesc((summaryLike?.workouts || normalizedData.workouts || []).map(normalizeWorkout));
  const totals =
    summaryLike?.totals || {
      calories: (normalizedData.meals || []).reduce((sum, meal) => sum + meal.calories, 0),
      protein: (normalizedData.meals || []).reduce((sum, meal) => sum + meal.protein, 0),
      workoutMinutes: workouts.reduce((sum, workout) => sum + workout.duration, 0)
    };
  const today = new Date().toISOString().slice(0, 10);
  const habits =
    summaryLike?.habits ||
    (normalizedData.habits || []).map((habit) => ({
      ...habit,
      streak: calculateStreak(habit.completedDates),
      completedToday: habit.completedDates.includes(today)
    }));
  const completion = Number.isFinite(summaryLike?.completion)
    ? summaryLike.completion
    : calculateCompletionScore(normalizedData, totals, habits, workouts);
  const activeModules = getActiveModules({
    profile: normalizedData.profile,
    hasHabits: habits.length > 0
  });
  const activeModuleIds = new Set(activeModules.map((module) => module.id));
  const nutritionMode = normalizedData.profile.nutritionMode;
  const waterGap = Math.max(normalizedData.goals.water - normalizedData.waterIntake, 0);
  const proteinGap = Math.max(normalizedData.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(normalizedData.goals.calories - totals.calories, 0);
  const workoutStreak = calculateWorkoutStreak(workouts);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === today);
  const recentWorkoutDays = new Set(workouts.slice(0, 7).map((workout) => workout.loggedAt.slice(0, 10))).size;
  const completedHabitCount = habits.filter((habit) => habit.completedToday).length;
  const habitCompletionRate = habits.length ? completedHabitCount / habits.length : 0;
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const weeklyTrend = getWeeklyTrend(normalizedData.weeklyHistory || [], completion);
  const lowRecovery =
    normalizedData.sleepHours < normalizedData.goals.sleep - 0.75 || normalizedData.energyLevel === "Low";
  const mediumRecovery =
    normalizedData.sleepHours < normalizedData.goals.sleep - 0.25 || normalizedData.energyLevel === "Steady";
  const weeklyPlan = buildWeeklyPlan(normalizedData, totals, habits, completion, workouts);

  const candidates = [];

  if (lowRecovery) {
    candidates.push({
      priority: 100,
      category: "recovery",
      title: "Recovery is the biggest thing limiting you today.",
      detail:
        normalizedData.energyLevel === "Low"
          ? "Your energy is low and sleep is not strong enough to support a hard training push."
          : `You are still ${Math.max(normalizedData.goals.sleep - normalizedData.sleepHours, 0).toFixed(1)} hours under your sleep target, so training quality will drop faster than usual.`,
      why:
        "When recovery is soft, forcing intensity usually lowers training quality and makes consistency harder tomorrow.",
      actions: isPremium
        ? [
            {
              title: "Choose a lighter session",
              detail: `Use a ${Math.min(25, Math.max(15, normalizedData.goals.workoutMinutes / 2))}-minute mobility, walk, or easy cardio block instead of a hard lift.`
            },
            {
              title: "Protect tonight's sleep window",
              detail: "Finish caffeine earlier, stop the session before fatigue climbs, and set up an earlier wind-down."
            }
          ]
        : [
            {
              title: "Keep training light today",
              detail: "Use a short walk, mobility block, or easy cardio session."
            },
            {
              title: "Set up better sleep tonight",
              detail: "Aim for an earlier bedtime."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly trend is already soft, so better recovery is the fastest way to stop the slide."
          : "If recovery improves, the plan can support stronger sessions again without resetting the week."
    });
  }

  if (activeModuleIds.has("hydration") && waterGap >= 0.5) {
    candidates.push({
      priority: 92,
      category: "hydration",
      title: "Hydration is the cleanest performance gap right now.",
      detail: `${waterGap.toFixed(1)}L is still open, which can drag training quality, appetite control, and recovery.`,
      why: isPremium
        ? "Hydration is the easiest win left today and it directly improves how the next workout, meal timing, and recovery feel."
        : "Hydration is the easiest quick win left today.",
      actions: isPremium
        ? [
            {
              title: "Close the first liter earlier",
              detail: "Drink two glasses now and keep another bottle beside your next work block."
            },
            {
              title: "Hydrate before training or dinner",
              detail: "Use that timing to make the rest of the target easier to finish."
            }
          ]
        : [
            {
              title: "Drink two glasses now",
              detail: "Front-load the gap instead of leaving it for tonight."
            },
            {
              title: "Keep a bottle nearby",
              detail: "Make the next few sips automatic."
            }
          ],
      note:
        workoutStreak >= 2
          ? "Your training rhythm is holding, so hydration is the easiest thing to tighten without changing the whole week."
          : "Fixing hydration helps the rest of the week feel easier even before training changes."
    });
  }

  if (activeModuleIds.has("nutrition") && proteinGap >= 20) {
    candidates.push({
      priority: 88,
      category: "nutrition",
      title: "Protein is the main recovery gap still open today.",
      detail: `${proteinGap}g of protein is still missing, which weakens recovery and makes training progress less efficient.`,
      why: isPremium
        ? "Closing the protein gap supports muscle repair, keeps hunger steadier, and makes the weekly plan's recovery logic work the way it should."
        : "More protein will support recovery and make the day feel more complete.",
      actions:
        nutritionMode === "full"
          ? isPremium
            ? [
                {
                  title: "Add one 30-40g protein meal",
                  detail: "Use a meal like Greek yogurt plus fruit, eggs and toast, chicken, tofu, or a protein shake with food."
                },
                {
                  title: "Close protein before chasing extra calories",
                  detail: "Use the next meal to reduce the gap while there is still time left in the day."
                }
              ]
            : [
                {
                  title: "Add one protein-forward meal",
                  detail: "Aim for 30g or more."
                },
                {
                  title: "Log it right away",
                  detail: "Keep the dashboard accurate."
                }
              ]
          : isPremium
            ? [
                {
                  title: "Use a quick protein check-in",
                  detail: "Log a protein source like yogurt, eggs, tuna, tofu, or a shake so the dashboard reflects the real gap."
                },
                {
                  title: "Pair protein with hydration",
                  detail: "That makes the next action support both recovery and energy."
                }
              ]
            : [
                {
                  title: "Add a quick protein source",
                  detail: "Choose something easy to repeat."
                },
                {
                  title: "Log a protein check-in",
                  detail: "Keep the plan synced to today."
                }
              ],
      note:
        calorieGap >= 350 && nutritionMode === "full"
          ? "You are under on both protein and energy, so one real meal is more useful than scattered snacks."
          : "Your weekly plan is already leaning toward better fueling, so closing protein helps it feel more accurate immediately."
    });
  }

  if (nutritionMode === "full" && calorieGap >= 350) {
    candidates.push({
      priority: 80,
      category: "nutrition",
      title: "Under-fueling is starting to flatten the day.",
      detail: `${calorieGap} calories are still open, and leaving them untouched makes recovery and energy weaker tomorrow.`,
      why:
        "A solid meal now does more for recovery and consistency than trying to catch everything late at night.",
      actions: isPremium
        ? [
            {
              title: "Use one anchor meal",
              detail: "Pick a meal with protein, carbs, and fluids instead of trying to patch the gap with snacks."
            },
            {
              title: "Close calories before the late evening",
              detail: "That keeps the weekly plan's recovery targets more realistic."
            }
          ]
        : [
            {
              title: "Add one solid meal",
              detail: "Choose protein, carbs, and fluids together."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly consistency is slipping a bit, and under-fueling is part of that picture."
          : "The week can still stay on track if you stop the calorie gap from compounding."
    });
  }

  if (!trainedToday && recentWorkoutDays < 2) {
    candidates.push({
      priority: 84,
      category: "training",
      title: "Training consistency is the weak point to protect next.",
      detail:
        workoutStreak > 0
          ? `You have a ${workoutStreak}-day streak, but today is still open and the recent training pattern is thin.`
          : "You have not trained today, and the recent workout pattern is too light to carry weekly momentum on its own.",
      why: isPremium
        ? "A minimum viable session keeps the weekly plan from turning theoretical and protects momentum without needing a perfect workout."
        : "One short session is enough to keep momentum moving.",
      actions: isPremium
        ? [
            {
              title: "Schedule a minimum viable session",
              detail: `Log a 20-30 minute ${lowRecovery ? "mobility or cardio" : "strength or conditioning"} block before the day ends.`
            },
            {
              title: "Keep the win small and deliberate",
              detail: "The goal is to protect weekly momentum, not chase the perfect session."
            }
          ]
        : [
            {
              title: "Log a short workout today",
              detail: "A 20-minute session is enough."
            },
            {
              title: "Keep it realistic",
              detail: "Choose the easiest option you will actually do."
            }
          ],
      note:
        workoutStreak > 0
          ? "The streak is still alive, so today's best move is protecting it with a smaller win."
          : "The fastest reset is one small session, not waiting for the perfect day."
    });
  }

  if (habitCompletionRate < 0.34 && pendingHabits.length) {
    candidates.push({
      priority: 72,
      category: "consistency",
      title: "Daily follow-through is softer than the plan needs.",
      detail: `Only ${completedHabitCount} habit${completedHabitCount === 1 ? "" : "s"} are done today, so the week is relying on motivation more than routine.`,
      why:
        "Small repeatable habits are what keep recovery, food, and training from becoming separate problems.",
      actions: isPremium
        ? [
            {
              title: `Complete "${pendingHabits[0].name}" next`,
              detail: "Use it as the smallest action that gets you back into a better pattern today."
            },
            {
              title: "Tie it to an existing task",
              detail: "Attach the habit to a meal, training block, or evening routine so it stops depending on memory."
            }
          ]
        : [
            {
              title: `Complete "${pendingHabits[0].name}" next`,
              detail: "Use one easy win to restart follow-through."
            }
          ],
      note:
        weeklyTrend === "down"
          ? "Your weekly trend is slipping, and low follow-through is part of why."
          : "Your big metrics are close enough that habit follow-through is the easiest lever left."
    });
  }

  if (workoutStreak >= 3 || (weeklyTrend === "up" && completion >= 75)) {
    candidates.push({
      priority: 60,
      category: "momentum",
      title: "Momentum is building, so the main job is protecting it.",
      detail:
        workoutStreak >= 3
          ? `You have a ${workoutStreak}-day workout streak and the week is moving in the right direction.`
          : "Your weekly trend is improving, which means consistency is starting to compound.",
      why:
        "Momentum is easier to keep than to rebuild, so today should reinforce the basics instead of overcomplicating the plan.",
      actions: isPremium
        ? [
            {
              title: "Keep one anchor behavior clean",
              detail: `Protect ${pendingHabits[0]?.name || "meal timing or hydration"} so the week does not rely only on motivation.`
            },
            {
              title: "Avoid unnecessary intensity spikes",
              detail: "A clean repeatable day is more valuable than a heroic one-off effort."
            }
          ]
        : [
            {
              title: "Protect the streak",
              detail: "Keep one healthy action easy and repeatable today."
            }
          ],
      note:
        weeklyPlan.weeklyFocus
          ? `This is why the weekly plan is leaning toward "${weeklyPlan.weeklyFocus.toLowerCase()}."`
          : "The weekly plan is reacting to better consistency, not just static goals."
    });
  }

  const chosen =
    candidates.sort((left, right) => right.priority - left.priority)[0] ||
    {
      category: "consistency",
      title: "You are mostly on track, so keep the basics clean.",
      detail: "There is no major gap dominating the day right now.",
      why: "The best move is to protect consistency rather than invent a new problem to solve.",
      actions: [
        {
          title: "Log the next meaningful action",
          detail: "Use your next meal, workout, or recovery check-in to keep the dashboard current."
        }
      ],
      note: "The coach will shift as soon as one of the real signals changes."
    };

  return {
    primaryInsight: {
      category: chosen.category,
      title: chosen.title,
      detail: chosen.detail
    },
    nextActions: chosen.actions.slice(0, 3),
    whyItMatters: chosen.why,
    longerTermNote: chosen.note,
    premiumLevel: isPremium ? "premium" : "free",
    planConnection: isPremium
      ? weeklyPlan.focusReason
      : weeklyPlan.previewNote
  };
}

export function buildTodayFocus(data, totals, habits, completion) {
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const workoutGap = Math.max(data.goals.workoutMinutes - totals.workoutMinutes, 0);
  const sleepGap = Math.max(data.goals.sleep - data.sleepHours, 0);

  if (waterGap >= 0.5) {
    return {
      title: "Prioritize hydration first",
      action: "Drink two glasses of water before your next task switch.",
      reason: `${waterGap.toFixed(1)}L still separates you from today’s goal.`
    };
  }

  if (proteinGap >= 25) {
    return {
      title: "Close the protein gap",
      action: "Add one high-protein meal or snack this afternoon.",
      reason: `${proteinGap}g protein remains to reach your target.`
    };
  }

  if (workoutGap >= 15) {
    return {
      title: "Protect your training target",
      action: "Schedule a short ${workoutGap}-minute session or brisk walk today.",
      reason: `${workoutGap} workout minutes are still open.`
    };
  }

  if (sleepGap >= 0.5) {
    return {
      title: "Set up recovery tonight",
      action: "Block a wind-down window and aim for an earlier bedtime.",
      reason: `You are averaging ${sleepGap.toFixed(1)} hours below your sleep goal today.`
    };
  }

  if (pendingHabits.length) {
    return {
      title: "Keep your streak alive",
      action: `Complete "${pendingHabits[0].name}" before the day ends.`,
      reason: "Habit consistency is the easiest lever left to move today."
    };
  }

  if (completion >= 85) {
    return {
      title: "Maintain the momentum",
      action: "Stay consistent with your meal timing and evening routine.",
      reason: "Your day is already tracking well across the core metrics."
    };
  }

  return {
    title: "Choose one decisive win",
    action: "Pick the smallest unfinished metric and complete it next.",
    reason: "A single focused action will lift your score more than scattered effort."
  };
}

export function buildTodayFocusCard(data, totals, habits, completion, workouts = []) {
  const dayPart = getDayPart();
  const pendingHabits = habits.filter((habit) => !habit.completedToday);
  const today = new Date().toISOString().slice(0, 10);
  const proteinGap = Math.max(data.goals.protein - totals.protein, 0);
  const calorieGap = Math.max(data.goals.calories - totals.calories, 0);
  const waterGap = Math.max(data.goals.water - data.waterIntake, 0);
  const sleepGap = Math.max(data.goals.sleep - data.sleepHours, 0);
  const trainedToday = workouts.some((workout) => workout.loggedAt.slice(0, 10) === today);
  const workoutGap = trainedToday ? 0 : Math.max(data.goals.workoutMinutes - totals.workoutMinutes, 20);
  const lowRecovery = data.sleepHours < 6.5 || data.energyLevel === "Low";

  if (lowRecovery && !trainedToday) {
    return {
      category: "recovery",
      dayPart,
      title: dayPart === "evening" ? "Protect recovery tonight and keep training light." : "Recovery is low, so use a lighter session today.",
      reason: dayPart === "morning" ? "Your first move should lower stress, not chase intensity." : "Sleep and energy are below baseline, so today should protect momentum without adding heavy stress.",
      whyThisMatters: "A lighter session still protects your streak while keeping recovery from sliding further.",
      actions: [
        dayPart === "morning"
          ? `Plan a ${Math.min(workoutGap, 25)}-minute mobility or easy cardio block now.`
          : `Log a ${Math.min(workoutGap, 25)}-minute mobility or easy cardio session.`,
        dayPart === "evening" ? "Hydrate, stop the session early, and set up an earlier bedtime." : "Hydrate before training and aim for an earlier wind-down tonight."
      ]
    };
  }

  if (!trainedToday) {
    return {
      category: "training",
      dayPart,
      title: dayPart === "morning" ? "Lock in today's training window now." : "You have not trained yet. Get a short workout on the board.",
      reason: dayPart === "evening" ? "A shorter session still gives the day a meaningful win and protects weekly momentum." : "Training is the biggest open gap right now and will move today's score the fastest.",
      whyThisMatters: "A short workout today protects your streak and keeps weekly momentum from stalling.",
      actions: [
        dayPart === "morning"
          ? `Pick a ${Math.min(workoutGap, 35)}-minute ${data.energyLevel === "High" ? "strength" : "home or mobility"} session before the day fills up.`
          : `Log a ${Math.min(workoutGap, 35)}-minute ${data.energyLevel === "High" ? "strength" : "home or mobility"} session.`,
        proteinGap >= 20 ? "Pair it with a high-protein meal afterward." : "Hydrate before you start so the session feels easier."
      ]
    };
  }

  if (proteinGap >= 25) {
    return {
      category: "nutrition",
      dayPart,
      title: dayPart === "morning" ? "Set up protein early so recovery stays on track." : "Prioritize protein intake today.",
      reason: dayPart === "afternoon" ? `${proteinGap}g of protein is still missing, so now is the best time to close the gap before the day gets away from you.` : `${proteinGap}g of protein is still missing, which makes recovery and training adaptation weaker.`,
      whyThisMatters: "Closing your protein gap supports recovery and helps your training actually pay off.",
      actions: [
        dayPart === "evening" ? "Make your next meal protein-forward instead of letting the gap carry into tomorrow." : "Add one high-protein meal or snack in your next eating window.",
        waterGap >= 0.5 ? "Drink water with that meal to improve hydration at the same time." : "Choose an option with at least 30g of protein."
      ]
    };
  }

  if (waterGap >= 0.5) {
    return {
      category: "hydration",
      dayPart,
      title: dayPart === "morning" ? "Start closing the hydration gap early." : "Bring hydration up before the day gets away from you.",
      reason: dayPart === "evening" ? `${waterGap.toFixed(1)}L is still open, and hydration is the easiest meaningful win left tonight.` : `${waterGap.toFixed(1)}L still separates you from today's target, which can drag energy and training quality down.`,
      whyThisMatters: "Hydration is the easiest win left today and improves energy, recovery, and training quality.",
      actions: [
        dayPart === "morning" ? "Drink two glasses of water before the next task switch." : "Drink two glasses of water in the next hour.",
        trainedToday ? "Keep a bottle nearby for the rest of the day." : "Hydrate before your next workout or walk."
      ]
    };
  }

  if (sleepGap >= 0.5) {
    return {
      category: "recovery",
      dayPart,
      title: dayPart === "morning" ? "Protect tonight's recovery before the day speeds up." : "Set up a stronger recovery tonight.",
      reason: `You are still ${sleepGap.toFixed(1)} hours short of your sleep target, so tonight's routine matters.`,
      whyThisMatters: "Better sleep is what keeps tomorrow's training, appetite, and energy from sliding backward.",
      actions: [
        dayPart === "morning" ? "Keep caffeine and training intensity reasonable so recovery is easier to finish tonight." : "Protect a wind-down window before bed.",
        "Keep the evening session light and finish hydration early."
      ]
    };
  }

  if (calorieGap >= 350) {
    return {
      category: "nutrition",
      dayPart,
      title: dayPart === "morning" ? "Plan one solid meal now so energy stays stable later." : "You are under-fueled. Add one solid meal today.",
      reason: `${calorieGap} calories are still open, so your recovery and energy may lag if you leave them untouched.`,
      whyThisMatters: "Fueling enough today makes it easier to recover well and show up stronger tomorrow.",
      actions: [
        proteinGap >= 15 ? "Choose a meal that closes both calories and protein together." : "Add a balanced meal with carbs, protein, and fluids.",
        "Log it as soon as you eat so the dashboard stays accurate."
      ]
    };
  }

  if (pendingHabits.length) {
    return {
      category: "consistency",
      dayPart,
      title: "Use one easy win to keep today's momentum alive.",
      reason: "Your core metrics are close enough that habit consistency is the cleanest next move.",
      whyThisMatters: "One small completed habit keeps your identity and streak momentum intact.",
      actions: [
        `Complete "${pendingHabits[0].name}" before the day ends.`,
        "Use that check-in to review tomorrow's first healthy action."
      ]
    };
  }

  if (completion >= 85) {
    return {
      category: "consistency",
      dayPart,
      title: "You are on track. Keep the day clean and consistent.",
      reason: "Nutrition, training, hydration, and recovery are all moving in the right direction today.",
      whyThisMatters: "Consistency is what turns a good day into a strong week instead of a one-off result.",
      actions: [
        "Stick to your usual meal timing and bedtime routine.",
        "Come back tomorrow and keep the streak building."
      ]
    };
  }

  return {
    category: "consistency",
    dayPart,
    title: "Finish the day with one deliberate health action.",
    reason: "You are close enough across the board that one focused action will keep momentum moving.",
    whyThisMatters: "Small wins compound fastest when you close the day on purpose instead of drifting through it.",
    actions: [
      pendingHabits.length ? `Complete "${pendingHabits[0].name}" next.` : "Log your next meal or hydration check-in.",
      "Check back after your next log to see if the focus shifts."
    ]
  };
}

function buildMomentumFeedback(data, totals, habits, completion, workouts = []) {
  const weeklyScores = (data.weeklyHistory || []).map((entry) => entry.score);
  const currentScore = weeklyScores.at(-1) || completion;
  const priorWindow = weeklyScores.slice(0, -1);
  const priorAverage = priorWindow.length ? priorWindow.reduce((sum, score) => sum + score, 0) / priorWindow.length : currentScore;
  const habitCompletionCount = habits.filter((habit) => habit.completedToday).length;
  const mealCount = (data.meals || []).length;
  const workoutStreak = calculateWorkoutStreak(workouts);
  const recoveryStrong = data.sleepHours >= data.goals.sleep - 0.5 && data.energyLevel !== "Low";

  if (workoutStreak >= 3 || (currentScore >= priorAverage + 4 && habitCompletionCount >= 1)) {
    return {
      tone: "positive",
      title: "You're building momentum.",
      detail: `Your ${workoutStreak || 1}-day training rhythm and recent check-ins are pushing this week above your baseline.`
    };
  }

  if (completion < 65 && !recoveryStrong && habitCompletionCount === 0) {
    return {
      tone: "warning",
      title: "You're slipping slightly.",
      detail: "Recovery and daily follow-through are both softer than usual, so one solid action today matters more than chasing perfection."
    };
  }

  if (habitCompletionCount === 0 || mealCount <= 2) {
    return {
      tone: "neutral",
      title: "One more action keeps the streak alive.",
      detail: `You already have enough data in motion that one more logged meal, habit, or workout will keep today's momentum intact.`
    };
  }

  return {
    tone: "positive",
    title: "You're on track this week.",
    detail: "The dashboard is moving in the right direction, so the best move now is to keep today's basics clean and repeatable."
  };
}

function getDayPart(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}

function getWeeklyTrend(history, completion) {
  const scores = [...history.map((entry) => entry.score), completion].filter((score) => Number.isFinite(score));
  if (scores.length < 3) {
    return "flat";
  }

  const first = scores.slice(0, Math.max(1, scores.length - 2));
  const last = scores.slice(-2);
  const firstAverage = first.reduce((sum, score) => sum + score, 0) / first.length;
  const lastAverage = last.reduce((sum, score) => sum + score, 0) / last.length;

  if (lastAverage >= firstAverage + 4) {
    return "up";
  }
  if (lastAverage <= firstAverage - 4) {
    return "down";
  }
  return "flat";
}

function buildWeeklyPlanPremiumReason({ proteinGap, waterGap, lowRecovery, weeklyTrend, habitCompletionRate, goalType, injuryStatus }) {
  if (injuryStatus === "active_injury") {
    return "Premium turns your current injury and restriction inputs into safer weekly guardrails instead of a generic plan.";
  }
  if (goalType === "mobility") {
    return "Premium shows how mobility should shape the whole week, not just add a random stretch suggestion.";
  }
  if (lowRecovery) {
    return "Premium turns your current recovery state into a lighter training mix and clearer weekly guardrails.";
  }
  if (proteinGap >= 25) {
    return "Premium shows how your fueling gap should change the week, not just that protein is low.";
  }
  if (waterGap >= 0.5) {
    return "Premium adds hydration and recovery adjustments so the week reflects how you're actually feeling.";
  }
  if (weeklyTrend === "up") {
    return "Premium leans into your current momentum instead of giving you a generic steady-state week.";
  }
  if (habitCompletionRate < 0.5) {
    return "Premium connects the weekly plan to your actual consistency pattern so the plan is easier to stick to.";
  }
  return `Premium explains why your ${formatGoalType(goalType).toLowerCase()} week is structured this way using your training, recovery, and consistency data.`;
}

function getWeeklyPlanPreviewNote({ proteinCompletion, hydrationCompletion, calorieCompletion, lowRecovery, goalType }) {
  if (goalType === "mobility") {
    return "Movement quality is actively shaping the weekly structure.";
  }
  if (goalType === "injury_recovery") {
    return "The weekly setup is staying conservative around recovery and movement quality.";
  }
  if (goalType === "active_aging") {
    return "Joint-friendly pacing is actively shaping the weekly structure.";
  }
  if (lowRecovery) {
    return "Recovery is shaping this week more than volume right now.";
  }
  if (proteinCompletion < 0.8) {
    return "Protein support is still one of the biggest levers in this plan.";
  }
  if (hydrationCompletion < 0.8) {
    return "Hydration consistency is still influencing the weekly setup.";
  }
  if (calorieCompletion < 0.8) {
    return "Fueling consistency is still part of why this week is structured the way it is.";
  }
  return "This preview reflects your current training and recovery pattern.";
}

function buildResultProjection(data, { completion, workoutStreak, weeklyTrend, habits }) {
  const profile = data.profile;
  const habitCompletionRate = habits.length ? habits.filter((habit) => habit.completedToday).length / habits.length : 0;

  if (profile.goalType === "fat_loss") {
    return {
      title: "Expected direction",
      summary: "A realistic pace is roughly 0.25 to 0.75 lb per week when protein, hydration, and weekly consistency stay solid.",
      confidence: completion >= 75 ? "Your current inputs support the upper end of that range." : "Your current consistency is more likely to support the slower end first."
    };
  }

  if (profile.goalType === "strength") {
    return {
      title: "Expected direction",
      summary: "Expect steadier bar speed, cleaner top sets, and gradual load progress across the next few weeks.",
      confidence: workoutStreak >= 3 ? "Your current training rhythm gives that progression a better chance to hold." : "That progression gets easier once your weekly training rhythm is steadier."
    };
  }

  if (profile.goalType === "bodybuilding") {
    return {
      title: "Expected direction",
      summary: "The short-term win is better session quality and repeatable volume before visible physique change follows.",
      confidence: weeklyTrend === "up" ? "Your current trend already supports better training quality." : "The plan is set to make volume more repeatable before asking for more."
    };
  }

  if (profile.goalType === "mobility" || profile.goalType === "injury_recovery") {
    return {
      title: "Expected direction",
      summary: "The near-term result is smoother movement, less guarded training, and more confidence under simple loading.",
      confidence: habitCompletionRate >= 0.5 ? "Your current consistency supports steady improvement in movement quality." : "Small daily mobility touchpoints will matter more than big sessions here."
    };
  }

  return {
    title: "Expected direction",
    summary: "The first visible wins should be better consistency, steadier recovery, and fewer off-track days during the week.",
    confidence: weeklyTrend === "up" ? "Your recent trend suggests those improvements are already starting to stick." : "The current plan is designed to make those basics easier to repeat."
  };
}

function buildWhyThisWorksBlock(data, planLike = {}) {
  const profile = data.profile;
  const parts = [
    `${formatGoalType(profile.goalType)} sets the weekly direction.`,
    `${profile.trainingEnvironment} access, ${profile.equipmentProfile.replace("_", " ")} equipment, and ${profile.experienceLevel} experience shape how ambitious the week should feel.`,
    `Recovery inputs and nutrition depth keep the plan from behaving like a generic template.`
  ];

  if (profile.injuryStatus !== "none") {
    parts.splice(2, 0, "Injury and restricted-area inputs keep movement choices and intensity more realistic.");
  }

  return {
    title: "Why this works",
    body: parts.join(" "),
    trustNote: "Built from your actual data and adjusted weekly from the inputs you keep updating.",
    premiumNote: planLike.nutritionEmphasis
      ? "Premium goes further by showing the reasoning, execution priorities, and smarter weekly adjustments behind those inputs."
      : "Premium goes further by showing the reasoning and smarter weekly adjustments behind those inputs."
  };
}

function getAgeFromBirthdate(birthdate) {
  if (!birthdate) {
    return null;
  }

  const parsed = new Date(`${birthdate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
}

function deriveAgeGroupFromBirthdate(birthdate) {
  const age = getAgeFromBirthdate(birthdate);
  if (age === null) {
    return "30-39";
  }
  if (age < 30) {
    return "18-29";
  }
  if (age < 40) {
    return "30-39";
  }
  if (age < 50) {
    return "40-49";
  }
  return "50+";
}

function poundsToKilograms(value) {
  return Number((Number(value || 0) * 0.45359237).toFixed(2));
}

export function getAccessTier(user) {
  const status = getSubscriptionStatus(user);
  if (status === "trialing") {
    return ACCESS_TIERS.TRIAL;
  }
  if (getUserTier(user) === "premium" || status === "active") {
    return ACCESS_TIERS.PREMIUM;
  }
  return ACCESS_TIERS.FREE;
}

export function canStartTrial(user) {
  return getAccessTier(user) === ACCESS_TIERS.FREE && !Boolean(user?.hasUsedTrial || user?.trialStartedAt || user?.trialUsedAt);
}

export function getTrialEndsAt(user) {
  return user?.trialEndsAt || user?.currentPeriodEnd || null;
}

function getTrialDaysRemaining(user) {
  const trialEndsAt = getTrialEndsAt(user);
  if (!trialEndsAt) {
    return 0;
  }

  const delta = new Date(trialEndsAt).getTime() - Date.now();
  if (delta <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(delta / DAY_MS));
}

function formatAccessLabel(accessTier) {
  if (accessTier === ACCESS_TIERS.TRIAL) {
    return "Trial";
  }
  if (accessTier === ACCESS_TIERS.PREMIUM) {
    return "Premium";
  }
  return "Free";
}

function formatDateLabel(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(parsed);
}

function getUserTier(user) {
  return user?.tier === "premium" ? "premium" : "free";
}

function createDefaultWellnessData(name) {
  return {
    goals: {
      calories: 2200,
      protein: 150,
      water: 2.8,
      sleep: 8,
      workoutMinutes: 55
    },
    profile: {
      goalType: "general_fitness",
      ageGroup: "30-39",
      birthdate: "",
      experienceLevel: "beginner",
      trainingEnvironment: "hybrid",
      equipmentProfile: "hybrid",
      injuryStatus: "none",
      sex: "",
      heightCm: null,
      currentWeight: null,
      targetWeight: null,
      unitPreference: "imperial",
      nutritionMode: "basic",
      appMode: "full_system",
      moduleOrder: CUSTOMIZABLE_MODULE_IDS,
      hiddenModules: [],
      exerciseGuidanceLevel: "standard",
      showWarmup: true,
      showCooldown: true,
      onboardingCompleted: false,
      restrictedAreas: []
    },
    waterIntake: 0,
    sleepHours: 7.2,
    energyLevel: "Steady",
    meals: [],
    workouts: [],
    savedWorkouts: [],
    habits: [
      {
        id: crypto.randomUUID(),
        name: "Morning mobility",
        target: "10 min",
        completedDates: []
      },
      {
        id: crypto.randomUUID(),
        name: "Evening walk",
        target: "20 min",
        completedDates: []
      },
      {
        id: crypto.randomUUID(),
        name: "Meal prep",
        target: "1 block",
        completedDates: []
      }
    ],
    weeklyHistory: [],
    weightHistory: [],
    notes: [
      `${name.split(" ")[0] || "Athlete"} is building steady consistency through nutrition and recovery.`,
      "Energy improves when hydration is above 2.5L and sleep crosses 7.5 hours."
    ]
  };
}

function calculateCompletionScore(data, totals, habits, workouts = []) {
  const normalizedData = normalizeWellnessData(data);
  const weeklyWorkoutCount = countWeeklyLoggedWorkouts(workouts);
  const workoutCompletion = Math.min(weeklyWorkoutCount / 3, 1);
  const nutritionCompletion =
    (normalizedData.meals || []).length > 0
      ? Math.min(
          ((totals.calories / normalizedData.goals.calories) + (totals.protein / normalizedData.goals.protein)) / 2,
          1
        )
      : 0;
  const hydrationCompletion =
    normalizedData.waterIntake > 0 ? Math.min(normalizedData.waterIntake / normalizedData.goals.water, 1) : 0;
  const { start, end } = getWorkoutWeekWindow();
  const habitTargets = habits.length ? habits.length * 3 : 0;
  const weeklyHabitCompletions = habits.reduce((sum, habit) => {
    const count = (habit.completedDates || []).filter((dateValue) => {
      const completedAt = new Date(`${dateValue}T12:00:00`);
      return completedAt >= start && completedAt <= end;
    }).length;
    return sum + count;
  }, 0);
  const habitCompletion = habitTargets ? Math.min(weeklyHabitCompletions / habitTargets, 1) : 0;
  const currentWeekKey = getWeekKey();
  const checkInCompletion = (normalizedData.weeklyCheckIns || []).some((checkIn) => checkIn.weekKey === currentWeekKey)
    ? 1
    : 0;

  return Math.round(
    (workoutCompletion * 0.4 + habitCompletion * 0.2 + nutritionCompletion * 0.15 + hydrationCompletion * 0.15 + checkInCompletion * 0.1) *
      100
  );
}

export function normalizeWorkout(workout) {
  return {
    id: workout.id || crypto.randomUUID(),
    presetId: workout.presetId || null,
    name: workout.name,
    type: workout.type || inferWorkoutType(workout.name),
    environment: workout.environment || "both",
    focus: workout.focus || inferWorkoutFocus(workout.name),
    duration: Number(workout.duration || 0),
    intensity: workout.intensity || "Moderate",
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map(normalizeExercise) : [],
    loggedAt: workout.loggedAt || new Date().toISOString()
  };
}

function normalizeExercise(exercise) {
  return attachMovementToExercise({
    name: exercise.name,
    sets: Number(exercise.sets || 0),
    reps: exercise.reps || null,
    duration: exercise.duration || null,
    equipment: exercise.equipment || "bodyweight",
    muscleGroup: exercise.muscleGroup || "General",
    movementId: exercise.movementId || findMovementForName(exercise.name)?.id || null,
    weight: exercise.weight ?? null,
    repsCompleted: exercise.repsCompleted ?? null,
    notes: exercise.notes || ""
  });
}

function normalizeSavedWorkout(workout) {
  if (!workout || typeof workout !== "object") {
    return null;
  }

  return {
    id: workout.id || workout.presetId || crypto.randomUUID(),
    presetId: workout.presetId || null,
    name: workout.name || "Saved workout",
    type: workout.type || inferWorkoutType(workout.name),
    environment: workout.environment || "both",
    focus: workout.focus || inferWorkoutFocus(workout.name),
    focusLabel: workout.focusLabel || (workout.focus ? formatWorkoutFocus(workout.focus) : null),
    duration: Number(workout.duration || 0),
    intensity: workout.intensity || "Moderate",
    summary: workout.summary || "",
    continuityNote: workout.continuityNote || "",
    varietyNote: workout.varietyNote || "",
    equipmentProfile: workout.equipmentProfile || "hybrid",
    equipmentSummary: workout.equipmentSummary || workout.equipmentProfile?.replaceAll("_", " ") || "mixed setup",
    primaryMuscles: Array.isArray(workout.primaryMuscles) ? workout.primaryMuscles : [],
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map(normalizeExercise) : [],
    savedAt: workout.savedAt || new Date().toISOString()
  };
}

function sortSavedWorkoutsDesc(workouts = []) {
  return [...workouts].sort((left, right) => new Date(right.savedAt || 0).getTime() - new Date(left.savedAt || 0).getTime());
}

function buildLatestExerciseLoads(workouts = []) {
  return sortWorkoutsDesc(workouts).reduce((accumulator, workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (!exercise?.name || accumulator[exercise.name]) {
        return;
      }

      if (exercise.weight === null || exercise.weight === undefined || exercise.weight === "") {
        return;
      }

      accumulator[exercise.name] = {
        weight: exercise.weight,
        repsCompleted: exercise.repsCompleted || exercise.reps || null,
        loggedAt: workout.loggedAt
      };
    });
    return accumulator;
  }, {});
}

function buildExerciseHistory(workouts = []) {
  const historyMap = new Map();

  sortWorkoutsDesc(workouts).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (!exercise?.name) {
        return;
      }

      if (!historyMap.has(exercise.name)) {
        historyMap.set(exercise.name, []);
      }

      historyMap.get(exercise.name).push({
        loggedAt: workout.loggedAt,
        workoutName: workout.name,
        weight: exercise.weight ?? null,
        repsCompleted: exercise.repsCompleted || exercise.reps || null,
        sets: exercise.sets
      });
    });
  });

  return Array.from(historyMap.entries())
    .map(([name, entries]) => {
      const weightedEntries = entries.filter((entry) => entry.weight !== null && entry.weight !== undefined && entry.weight !== "");
      return {
        name,
        lastPerformedAt: entries[0]?.loggedAt || null,
        lastWeight: weightedEntries[0]?.weight ?? null,
        bestWeight: weightedEntries.length ? Math.max(...weightedEntries.map((entry) => Number(entry.weight) || 0)) : null,
        entries: entries.slice(0, 6)
      };
    })
    .sort((left, right) => new Date(right.lastPerformedAt || 0).getTime() - new Date(left.lastPerformedAt || 0).getTime());
}

function inferWorkoutType(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("mobility")) {
    return "mobility";
  }
  if (lower.includes("hiit") || lower.includes("cardio")) {
    return "cardio";
  }
  return "strength";
}

function inferWorkoutFocus(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("chest") && lower.includes("triceps")) return "chest_triceps";
  if (lower.includes("back") && lower.includes("biceps")) return "back_biceps";
  if (lower.includes("push")) return "push";
  if (lower.includes("pull")) return "pull";
  if (lower.includes("legs")) return "legs";
  if (lower.includes("shoulders")) return "shoulders";
  if (lower.includes("upper")) return "upper_body";
  if (lower.includes("lower")) return "lower_body";
  if (lower.includes("full body")) return "full_body";
  if (lower.includes("mobility") || lower.includes("recovery")) return "mobility_recovery";
  return null;
}

function calculateWorkoutStreak(workouts) {
  const workoutDates = new Set(workouts.map((workout) => workout.loggedAt.slice(0, 10)));
  let streak = 0;

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(Date.now() - index * DAY_MS).toISOString().slice(0, 10);
    if (workoutDates.has(date)) {
      streak += 1;
      continue;
    }

    if (index === 0) {
      continue;
    }

    break;
  }

  return streak;
}

export function sortWorkoutsDesc(workouts) {
  return [...workouts].sort((left, right) => new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime());
}

export function hasRecentWorkoutDuplicate(workouts, candidateWorkout, minutesWindow = 10) {
  const candidateTime = new Date(candidateWorkout.loggedAt).getTime();
  return workouts.some((workout) => {
    const sameIdentity =
      (candidateWorkout.presetId && workout.presetId === candidateWorkout.presetId) ||
      workout.name.trim().toLowerCase() === candidateWorkout.name.trim().toLowerCase();

    if (!sameIdentity) {
      return false;
    }

    const deltaMinutes = Math.abs(candidateTime - new Date(workout.loggedAt).getTime()) / (1000 * 60);
    return deltaMinutes <= minutesWindow;
  });
}

```

## FILE: server/data/stretchLibrary.js

`$ext
import { findMovementForName } from "./movementLibrary.js";
import { createLibraryEntry, createMediaPayload, validateLibraryEntries } from "../../shared/exerciseCatalog.js";
import { buildExerciseMediaSpec } from "../../shared/mediaGenerationConfig.js";

const MOBILITY_CATEGORIES = [
  {
    id: "yoga",
    label: "Yoga",
    description: "Longer flowing patterns that improve movement quality and help you settle down after hard training."
  },
  {
    id: "stretching",
    label: "Stretching",
    description: "Simple targeted stretches for tight areas before or after training."
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy / Rehab",
    description: "Controlled drills that protect irritated areas and rebuild confidence."
  },
  {
    id: "recovery",
    label: "Recovery Mobility",
    description: "Low-stress movement support for days when soreness, stiffness, or fatigue need to lead."
  },
  {
    id: "injury_specific",
    label: "Injury-Specific",
    description: "Educational movement support organized around the areas that feel most limited right now."
  }
];

const AREA_OPTIONS = [
  { value: "all", label: "All body areas" },
  { value: "full_body", label: "Full body" },
  { value: "shoulder", label: "Shoulder irritation" },
  { value: "back", label: "Lower back" },
  { value: "hip", label: "Hip tightness" },
  { value: "knee", label: "Knee support" },
  { value: "ankle", label: "Ankle stiffness" },
  { value: "elbow", label: "Tennis elbow support" },
  { value: "wrist", label: "Carpal tunnel support" }
];

const INJURY_SUPPORT_OPTIONS = [
  { value: "all", label: "Any injury support" },
  { value: "meniscus_support", label: "Meniscus irritation / tear support" },
  { value: "acl_mcl_support", label: "ACL / MCL stability support" },
  { value: "patellar_tracking_support", label: "Patellar tracking support" },
  { value: "general_knee_pain_support", label: "General knee pain support" },
  { value: "lumbar_strain_support", label: "Lumbar strain support" },
  { value: "disc_irritation_support", label: "Disc irritation support" },
  { value: "general_low_back_stiffness", label: "General low-back stiffness" },
  { value: "rotator_cuff_support", label: "Rotator cuff irritation support" },
  { value: "shoulder_impingement_support", label: "Impingement support" },
  { value: "shoulder_instability_support", label: "Shoulder instability support" },
  { value: "tennis_elbow", label: "Tennis elbow support" },
  { value: "carpal_tunnel", label: "Carpal tunnel support" },
  { value: "hip_tightness_support", label: "Hip tightness support" },
  { value: "ankle_stiffness_support", label: "Ankle stiffness support" }
];

const SUPPORT_TOPIC_EQUIVALENTS = {
  knee_support: ["general_knee_pain_support", "patellar_tracking_support", "acl_mcl_support", "meniscus_support"],
  lower_back: ["general_low_back_stiffness", "lumbar_strain_support", "disc_irritation_support"],
  shoulder_irritation: ["rotator_cuff_support", "shoulder_impingement_support", "shoulder_instability_support"],
  hip_tightness: ["hip_tightness_support"],
  ankle_stiffness: ["ankle_stiffness_support"]
};

const BASE_MOBILITY_LIBRARY = [
  routine({
    name: "Cat-cow",
    supportTypes: ["yoga", "recovery"],
    restrictedAreas: ["back"],
    bodyAreas: ["back", "full_body"],
    supportTopics: ["lower_back"],
    phase: "warmup",
    benefit: "Wake up the spine and breathe into easier movement quality.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "general_fitness", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Child's pose with side reach",
    supportTypes: ["yoga", "recovery"],
    restrictedAreas: ["back", "shoulder"],
    bodyAreas: ["back", "shoulder", "full_body"],
    supportTopics: ["lower_back", "shoulder_irritation"],
    phase: "cooldown",
    benefit: "Downshift after hard training while opening the upper back and lats.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Thoracic rotation",
    supportTypes: ["yoga", "recovery", "injury_specific"],
    restrictedAreas: ["back", "shoulder"],
    bodyAreas: ["back", "shoulder", "full_body"],
    supportTopics: ["shoulder_irritation", "lower_back"],
    phase: "warmup",
    benefit: "Improve rotational freedom without aggressive spinal loading.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "athletic_performance"],
    recoveryFit: "high"
  }),
  routine({
    name: "Walking spiderman reach",
    supportTypes: ["yoga", "stretching"],
    restrictedAreas: ["hip", "shoulder"],
    bodyAreas: ["hip", "shoulder", "full_body"],
    supportTopics: ["hip_tightness", "shoulder_irritation"],
    phase: "warmup",
    benefit: "Prime total-body mobility before mixed training days.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["athletic_performance", "general_fitness"],
    recoveryFit: "medium"
  }),
  routine({
    name: "World's greatest stretch",
    supportTypes: ["stretching", "recovery"],
    restrictedAreas: ["hip", "ankle"],
    bodyAreas: ["hip", "ankle", "full_body"],
    supportTopics: ["hip_tightness", "ankle_stiffness"],
    phase: "warmup",
    benefit: "Prep hips, ankles, and hamstrings before squats or lunges.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["fat_loss", "athletic_performance", "general_fitness"],
    recoveryFit: "medium"
  }),
  routine({
    name: "90/90 hip flow",
    supportTypes: ["stretching", "recovery", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Improve hip rotation and reduce stiffness after lower-body work.",
    minutes: 7,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Hip flexor stretch",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Reduce front-of-hip tightness from sitting and leg training.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "fat_loss", "general_fitness"],
    recoveryFit: "high"
  }),
  routine({
    name: "Hamstring stretch",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Restore posterior-chain range after cardio or lower-body work.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "general_fitness", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Half-kneeling ankle rocks",
    supportTypes: ["stretching", "injury_specific"],
    restrictedAreas: ["ankle", "knee"],
    bodyAreas: ["ankle", "knee"],
    supportTopics: ["ankle_stiffness", "knee_support"],
    phase: "warmup",
    benefit: "Open ankle range before loaded leg training.",
    minutes: 4,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["strength", "fat_loss", "injury_recovery"],
    recoveryFit: "medium"
  }),
  routine({
    name: "Supported box squat pattern",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["knee", "hip"],
    bodyAreas: ["knee", "hip"],
    supportTopics: ["knee_support", "hip_tightness"],
    phase: "warmup",
    benefit: "Practice a lower-load squat pattern when joint confidence is low.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging"],
    recoveryFit: "medium"
  }),
  routine({
    name: "Wall slide",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["shoulder"],
    bodyAreas: ["shoulder"],
    supportTopics: ["shoulder_irritation"],
    phase: "warmup",
    benefit: "Improve shoulder control without loading irritated tissue.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Band pull-apart",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["shoulder", "elbow"],
    bodyAreas: ["shoulder", "elbow"],
    supportTopics: ["shoulder_irritation", "tennis_elbow"],
    phase: "warmup",
    benefit: "Reintroduce upper-back tension without heavy loading.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Wrist flexor glide",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["elbow"],
    bodyAreas: ["wrist", "elbow"],
    supportTopics: ["carpal_tunnel", "tennis_elbow"],
    phase: "recovery",
    benefit: "Keep the forearm and wrist moving more smoothly when grip work has been irritating.",
    minutes: 4,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Dead bug breathing",
    supportTypes: ["physiotherapy", "recovery", "injury_specific"],
    restrictedAreas: ["back"],
    bodyAreas: ["back", "full_body"],
    supportTopics: ["lower_back"],
    phase: "recovery",
    benefit: "Rebuild trunk control without aggressive spinal loading.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Glute bridge hold",
    supportTypes: ["physiotherapy", "injury_specific", "recovery"],
    restrictedAreas: ["back", "hip", "knee"],
    bodyAreas: ["back", "hip", "knee"],
    supportTopics: ["lower_back", "hip_tightness", "knee_support"],
    phase: "recovery",
    benefit: "Create lower-body tension without heavy compression.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "fat_loss"],
    recoveryFit: "high"
  }),
  routine({
    name: "Shoulder mobility",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["shoulder"],
    bodyAreas: ["shoulder"],
    supportTopics: ["shoulder_irritation"],
    phase: "recovery",
    benefit: "Keep shoulders moving cleanly between upper-body sessions.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["strength", "bodybuilding", "mobility"],
    recoveryFit: "high"
  })
];

const EXPANDED_MOBILITY_LIBRARY = [
  ...routineFamily("shoulder_mobility_family", [
    { name: "Banded shoulder external rotation", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["shoulder", "elbow"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation", "tennis_elbow"], phase: "activation", benefit: "Build cleaner shoulder rotation before pressing or upper-body rehab work.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility", "active_aging"], recoveryFit: "high" },
    { name: "Sleeper stretch", supportTypes: ["stretching", "injury_specific"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Open the back of the shoulder without turning the drill into a forceful crank.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" },
    { name: "Scapular push-up", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder", "full_body"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Rebuild serratus and shoulder blade control before heavier pushing.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "athletic_performance"], recoveryFit: "medium" },
    { name: "Bench thoracic opener", supportTypes: ["stretching", "recovery"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Restore extension through the upper back so overhead work feels cleaner.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("thoracic_spine_family", [
    { name: "Open book rotation", supportTypes: ["stretching", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "mobility", benefit: "Restore upper-back rotation so the torso moves better without forcing the lower back.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness", "active_aging"], recoveryFit: "high" },
    { name: "Foam roller thoracic extension", supportTypes: ["recovery", "stretching"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "release", benefit: "Open upper-back extension after long sitting or pressing volume.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding", "general_fitness"], recoveryFit: "high" },
    { name: "Quadruped T-spine reach", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "control", benefit: "Create cleaner rotation and control through a supported position.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" }
  ]),
  ...routineFamily("wrist_elbow_family", [
    { name: "Wrist extension rock", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "activation", benefit: "Gently load the wrist so pressing and gripping feel less abrupt.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Forearm pronation-supination", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["tennis_elbow", "carpal_tunnel"], phase: "control", benefit: "Restore forearm rotation with a low-stress drill you can repeat often.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Finger extension spread", supportTypes: ["recovery", "injury_specific"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Offset repeated gripping and keyboard tension with a low-friction reset drill.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("hip_recovery_family", [
    { name: "Figure-four glute stretch", supportTypes: ["stretching", "recovery"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Reduce glute and hip stiffness after lower-body work or long sitting.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "fat_loss", "general_fitness"], recoveryFit: "high" },
    { name: "Adductor rock-back", supportTypes: ["stretching", "recovery"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "mobility", benefit: "Open the inner thigh and make squat depth feel less sticky.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["strength", "mobility", "active_aging"], recoveryFit: "medium" },
    { name: "Hip airplane support", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "control", benefit: "Improve hip stability and balance before single-leg work.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("knee_support_family", [
    { name: "Spanish squat hold", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "control", benefit: "Build quad tension in a knee-friendly way when squats feel sharp or unstable.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" },
    { name: "Terminal knee extension", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Wake up the quad and finish knee extension with low joint stress.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Supported step-down", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Practice knee tracking with more control than a free-moving lunge.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" }
  ]),
  ...routineFamily("ankle_reset_family", [
    { name: "Calf wall stretch", supportTypes: ["stretching", "recovery"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "release", benefit: "Restore calf length and make knee travel smoother in squats and lunges.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Tibialis raise", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "activation", benefit: "Build lower-leg support for better deceleration and shin comfort.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["athletic_performance", "injury_recovery"], recoveryFit: "medium" },
    { name: "Ankle circle control", supportTypes: ["recovery", "stretching"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "mobility", benefit: "Smooth out ankle motion before cardio, jumping, or leg training.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("neck_posture_family", [
    { name: "Chin tuck reset", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["full_body"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Bring posture back online after screen-heavy days without adding strain.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["active_aging", "mobility"], recoveryFit: "high" },
    { name: "Wall angel slide", supportTypes: ["recovery", "stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Reconnect posture, rib position, and shoulder movement in one simple drill.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("full_body_recovery_family", [
    { name: "Crocodile breathing", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "release", benefit: "Downshift tension so your mobility work actually sticks instead of feeling rushed.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" },
    { name: "Standing reach flow", supportTypes: ["yoga", "recovery"], restrictedAreas: ["full_body", "back"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "mobility", benefit: "Move the whole body through a simple recovery pattern when you feel stiff everywhere.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Supine twist reset", supportTypes: ["yoga", "recovery"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip", "full_body"], supportTopics: ["lower_back", "hip_tightness"], phase: "release", benefit: "Finish the session with a lower-intensity reset for the trunk and hips.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" }
  ])
];

const RAW_MOBILITY_LIBRARY = [...BASE_MOBILITY_LIBRARY, ...EXPANDED_MOBILITY_LIBRARY];
const MOBILITY_LIBRARY = validateLibraryEntries(RAW_MOBILITY_LIBRARY, "mobility catalog").map((entry) => {
  const rawEntry = RAW_MOBILITY_LIBRARY.find((candidate) => candidate.id === entry.id);
  return {
    ...entry,
    ...(rawEntry || {})
  };
});

export function buildMobilityPlan({ goalType, injuryStatus, restrictedAreas, lowRecovery, workoutEnvironment }) {
  const selectedCategory =
    injuryStatus !== "none"
      ? "physiotherapy"
      : goalType === "mobility"
        ? "yoga"
        : lowRecovery
          ? "recovery"
          : "stretching";
  const library = buildMobilitySessionSet({
    category: selectedCategory,
    injuryArea: restrictedAreas?.[0] || "all",
    goalType,
    timeCap: lowRecovery ? 10 : 15,
    trainingEnvironment: workoutEnvironment,
    recoveryStatus: lowRecovery ? "low" : "steady",
    restrictedAreas,
    injuryStatus
  });
  const warmup = library.guidedBlock.filter((item) => item.group === "activation").slice(0, 2);
  const cooldown = library.guidedBlock.filter((item) => item.group === "release").slice(0, 2);
  const recoveryDay = dedupeByName([
    ...library.guidedBlock.filter((item) => item.phase === "recovery"),
    ...filterMobilityLibrary({
      category: "recovery",
      injuryArea: restrictedAreas?.[0] || "all",
      goalType,
      timeCap: 12,
      trainingEnvironment: workoutEnvironment,
      recoveryStatus: "low",
      restrictedAreas,
      injuryStatus
    })
  ]).slice(0, 3);

  return {
    title:
      injuryStatus === "active_injury"
        ? "Use a physiotherapy-style recovery flow that respects the areas you need to protect"
        : goalType === "mobility"
          ? "Use guided movement as a real part of the training week"
          : lowRecovery
            ? "Lean on recovery mobility instead of forcing more load"
            : "Use targeted stretching and movement prep to make training feel better this week",
    reason:
      injuryStatus === "active_injury"
        ? "The mobility block stays supportive and educational so you can keep moving without pretending everything is fine."
        : goalType === "mobility"
          ? "Mobility is the goal, so the week needs a clearer movement practice instead of a few random drills."
          : lowRecovery
            ? "Recovery is softer right now, so low-stress movement gives you the safest win."
            : "A short guided mobility layer before and after training improves how the whole week feels.",
    warmup,
    cooldown,
    recoveryDay,
    weeklyTarget:
      goalType === "mobility" || injuryStatus !== "none"
        ? "Aim for 4-5 guided mobility touchpoints this week."
        : "Aim for 3 guided mobility touchpoints this week.",
    category: selectedCategory,
    guidedBlock: library.guidedBlock,
    additionalPool: library.additionalPool,
    sessionName: library.sessionName
  };
}

export function buildMobilityModule({ goalType, injuryStatus, restrictedAreas, lowRecovery, trainingEnvironment, planContext = null }) {
  const suggestedCategory =
    injuryStatus !== "none"
      ? "physiotherapy"
      : goalType === "mobility"
        ? "yoga"
        : lowRecovery
          ? "recovery"
          : "stretching";

  const sessionSet = buildMobilitySessionSet({
    category: suggestedCategory,
    injuryArea: restrictedAreas?.[0] || "all",
    goalType,
    timeCap: lowRecovery ? 10 : 15,
    trainingEnvironment,
    recoveryStatus: lowRecovery ? "low" : "steady",
    restrictedAreas,
    injuryStatus
  });

  return {
    title: planContext?.weeklyFocus ? `${planContext.weeklyFocus} support` : "Guided mobility support",
    description:
      planContext?.mobilityTarget
        ? `${planContext.mobilityTarget} Choose yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.`
        : "Choose yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.",
    suggestedCategory,
    sessionName: sessionSet.sessionName,
    categories: MOBILITY_CATEGORIES,
    library: MOBILITY_LIBRARY,
    suggestedFlow: sessionSet.guidedBlock,
    additionalPool: sessionSet.additionalPool,
    filterOptions: {
      areaOptions: AREA_OPTIONS,
      injurySupportOptions: INJURY_SUPPORT_OPTIONS,
      timeOptions: [
        { value: "5", label: "5 min" },
        { value: "10", label: "10 min" },
        { value: "15", label: "15 min" },
        { value: "20", label: "20 min" }
      ],
      recoveryOptions: [
        { value: "all", label: "Any recovery state" },
        { value: "low", label: "Low recovery" },
        { value: "steady", label: "Steady recovery" }
      ]
    }
  };
}

export function buildMobilitySessionSet({
  category = "stretching",
  injuryArea = "all",
  goalType = "general_fitness",
  timeCap = 15,
  trainingEnvironment = "hybrid",
  recoveryStatus = "all",
  restrictedAreas = [],
  injuryStatus = "none"
}) {
  const primary = filterMobilityLibrary({
    category,
    injuryArea,
    goalType,
    timeCap,
    trainingEnvironment,
    recoveryStatus,
    restrictedAreas,
    injuryStatus
  });
  const guidedBlock = ensureMobilityMinimum(primary, {
    category,
    injuryArea,
    goalType,
    timeCap,
    trainingEnvironment,
    recoveryStatus,
    restrictedAreas,
    injuryStatus
  }).slice(0, 6);
  const additionalPool = dedupeByName([
    ...primary.slice(guidedBlock.length),
    ...MOBILITY_LIBRARY.filter((entry) => !guidedBlock.some((selected) => selected.name === entry.name))
  ]).slice(0, 10);

  return {
    guidedBlock,
    additionalPool,
    sessionName: buildMobilitySessionName(category, injuryArea, recoveryStatus)
  };
}

export function filterMobilityLibrary({
  category = "stretching",
  injuryArea = "all",
  goalType = "general_fitness",
  timeCap = 15,
  trainingEnvironment = "hybrid",
  recoveryStatus = "all",
  restrictedAreas = [],
  injuryStatus = "none"
}) {
  const normalizedTimeCap = Number(timeCap) || 15;
  const requestedEnvironment = trainingEnvironment === "hybrid" ? "hybrid" : trainingEnvironment;

  return dedupeByName(
    MOBILITY_LIBRARY.filter((item) => {
      if (!item.supportTypes.includes(category)) {
        return false;
      }
      if (item.minutes > normalizedTimeCap) {
        return false;
      }
      if (
        requestedEnvironment !== "hybrid" &&
        !item.environments.includes(requestedEnvironment) &&
        !item.environments.includes("hybrid")
      ) {
        return false;
      }
      if (
        injuryArea !== "all" &&
        !item.restrictedAreas.includes(injuryArea) &&
        !item.bodyAreas.includes(injuryArea) &&
        !item.supportTopics.includes(normalizeSupportTopic(injuryArea))
      ) {
        return false;
      }
      if (recoveryStatus === "low" && item.recoveryFit === "low") {
        return false;
      }
      if (recoveryStatus === "steady" && item.recoveryFit === "high" && item.phase === "recovery") {
        return false;
      }
      if (category === "injury_specific" && injuryStatus === "none" && restrictedAreas.length === 0 && injuryArea === "all") {
        return false;
      }

      return true;
    }).sort((left, right) => scoreRoutine(right, { goalType, restrictedAreas, recoveryStatus, injuryArea }) - scoreRoutine(left, { goalType, restrictedAreas, recoveryStatus, injuryArea }))
  );
}

function routineFamily(familyId, entries) {
  return entries.map((entry) => routine({ ...entry, familyId }));
}

function routine({ name, supportTypes, restrictedAreas, bodyAreas, supportTopics, phase, benefit, minutes, environments, goalTags, recoveryFit, familyId = null }) {
  const movement = findMovementForName(name);
  const entryId = name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  const mediaMovementId = movement?.id || entryId;
  const group =
    phase === "warmup" || phase === "activation"
      ? "activation"
      : phase === "cooldown" || phase === "release"
        ? "release"
        : phase === "recovery" || phase === "control"
          ? "control"
          : "mobility";
  const resolvedFamilyId = familyId || supportTopics[0] || bodyAreas[0] || "general";
  const resolvedSupportTopics = expandSupportTopics(supportTopics);
  const content = buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group });
  const media = createMediaPayload(
    buildExerciseMediaSpec({
      id: mediaMovementId,
      name,
      familyId: resolvedFamilyId,
      trainingType: "mobility",
      fallbackImage: movement?.image || null
    })
  );

  const entry = createLibraryEntry({
    id: entryId,
    name,
    mode: "mobility",
    category: phase,
    primaryMuscleGroup: bodyAreas[0] || "full_body",
    secondaryMuscleGroups: bodyAreas.slice(1),
    movementPattern: group,
    equipmentRequirements: movement?.equipment || ["bodyweight"],
    difficultyLevel: recoveryFit === "high" ? "beginner" : "standard",
    trainingGoals: goalTags,
    jointStressLevel: recoveryFit === "high" ? "low" : "moderate",
    rehabSafe: supportTypes.includes("physiotherapy") || supportTypes.includes("injury_specific"),
    environments,
    mobilityCategory: supportTypes[0],
    bodyAreaFocus: bodyAreas,
    injurySupportType: resolvedSupportTopics,
    intensityProfile: recoveryFit,
    variationFamily: resolvedSupportTopics[0] || bodyAreas[0] || "general",
    familyIds: [resolvedFamilyId],
    instructions: content.instructions,
    mistakes: content.mistakes,
    cues: content.cues,
    safetyNotes: content.safetyNotes,
    modifications: content.modifications,
    media,
    extra: {
      supportTypes,
      restrictedAreas,
      bodyAreas,
      supportTopics: resolvedSupportTopics,
      phase,
      group,
      benefit,
      minutes,
      goalTags,
      recoveryFit,
      movementId: mediaMovementId,
      contentStandard: "v1",
      movement: buildMobilityMovementGuide(
        {
          id: entryId,
          name,
          category: phase,
          bodyAreas,
          instructions: content.instructions,
          cues: content.cues,
          mistakes: content.mistakes,
          safetyNotes: content.safetyNotes,
          modifications: content.modifications,
          media,
          familyIds: [resolvedFamilyId]
        },
        movement
      )
    }
  });

  return {
    ...entry,
    supportTypes,
    restrictedAreas,
    bodyAreas,
    supportTopics: resolvedSupportTopics,
    phase,
    group,
    benefit,
    minutes,
    goalTags,
    recoveryFit,
    movementId: mediaMovementId
  };
}

function buildMobilityMovementGuide(option, baseMovement = null) {
  return {
    ...(baseMovement || {}),
    id: baseMovement?.id || option.id,
    name: baseMovement?.name || option.name,
    category: baseMovement?.category || option.category,
    difficulty: baseMovement?.difficulty || "Beginner",
    environment: baseMovement?.environment || "Home / gym",
    equipment: baseMovement?.equipment?.length ? baseMovement.equipment : ["bodyweight"],
    primaryMuscles: baseMovement?.primaryMuscles?.length ? baseMovement.primaryMuscles : option.bodyAreas || ["full_body"],
    secondaryMuscles: baseMovement?.secondaryMuscles?.length ? baseMovement.secondaryMuscles : option.bodyAreas?.slice(1) || [],
    instructions: baseMovement?.instructions?.length ? baseMovement.instructions : option.instructions || [],
    cues: baseMovement?.cues?.length ? baseMovement.cues : option.cues || [],
    commonMistakes: baseMovement?.commonMistakes?.length ? baseMovement.commonMistakes : option.mistakes || [],
    safetyNotes: baseMovement?.safetyNotes?.length ? baseMovement.safetyNotes : option.safetyNotes || [],
    modifications: baseMovement?.modifications?.length ? baseMovement.modifications : option.modifications || [],
    media: option.media,
    mediaStatus: option.media?.status || "none",
    familyIds: option.familyIds || []
  };
}

function buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group }) {
  return {
    instructions: [
      `Set up for ${name} slowly and use the first rep to find a comfortable range.`,
      group === "activation"
        ? "Use smooth reps to wake the area up before training."
        : group === "control"
          ? "Own the position instead of rushing through the drill."
          : "Keep the breath calm while you move through the range.",
      "Stop before the drill turns sharp, pinchy, or forced."
    ],
    cues: [
      "Stay relaxed enough to breathe normally.",
      bodyAreas?.length ? `Let ${bodyAreas.join(" / ")} lead the drill.` : "Let the target area lead the drill.",
      benefit || "Use the drill to make the next session feel cleaner."
    ],
    mistakes: [
      "Forcing range just because the position looks easy.",
      "Rushing the drill without feeling the target area move.",
      supportTopics?.length
        ? `Ignoring the area you are trying to support: ${supportTopics.map((topic) => formatSupportTopic(topic).toLowerCase()).join(", ")}.`
        : "Turning a support drill into a max-effort stretch."
    ],
    safetyNotes: [
      "Keep the drill pain-free and repeatable.",
      "Use a smaller range and slower tempo if the area feels irritated."
    ],
    modifications: [
      "Shorten the hold or range if you feel guarding.",
      "Swap to another drill in the same support family if this one does not feel right today."
    ]
  };
}

function scoreRoutine(routineEntry, { goalType, restrictedAreas, recoveryStatus, injuryArea }) {
  let score = 0;
  if (routineEntry.goalTags.includes(goalType)) {
    score += 3;
  }
  if (restrictedAreas.some((area) => routineEntry.restrictedAreas.includes(area))) {
    score += 4;
  }
  if (injuryArea !== "all" && (routineEntry.bodyAreas.includes(injuryArea) || routineEntry.supportTopics.includes(normalizeSupportTopic(injuryArea)))) {
    score += 4;
  }
  if (recoveryStatus === "low" && routineEntry.recoveryFit === "high") {
    score += 3;
  }
  if (["recovery", "control", "release"].includes(routineEntry.phase)) {
    score += 1;
  }
  return score;
}

function dedupeByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.name)) {
      return false;
    }

    seen.add(item.name);
    return true;
  });
}

function ensureMobilityMinimum(primaryList, context) {
  const current = [...primaryList];
  if (current.length >= 4) {
    return current;
  }

  const sameArea = MOBILITY_LIBRARY.filter(
    (entry) =>
      matchesArea(entry, context.injuryArea, context.restrictedAreas) &&
      !current.some((selected) => selected.name === entry.name)
  );
  const similarMovement = MOBILITY_LIBRARY.filter(
    (entry) =>
      entry.group === current[0]?.group &&
      !current.some((selected) => selected.name === entry.name)
  );
  const safeFallback = MOBILITY_LIBRARY.filter(
    (entry) =>
      entry.rehabSafe &&
      entry.minutes <= Math.max(Number(context.timeCap) || 10, 10) &&
      !current.some((selected) => selected.name === entry.name)
  );

  return dedupeByName([...current, ...sameArea, ...similarMovement, ...safeFallback]).slice(0, 6);
}

function matchesArea(entry, injuryArea, restrictedAreas = []) {
  if (injuryArea && injuryArea !== "all") {
    return entry.bodyAreas.includes(injuryArea) || entry.supportTopics.includes(normalizeSupportTopic(injuryArea));
  }
  return restrictedAreas.some((area) => entry.bodyAreas.includes(area) || entry.supportTopics.includes(normalizeSupportTopic(area)));
}

function buildMobilitySessionName(category, injuryArea, recoveryStatus) {
  if (category === "physiotherapy") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} stability sequence` : "Guided rehab sequence";
  }
  if (category === "recovery") {
    return recoveryStatus === "low" ? "Post-training reset" : "Recovery support flow";
  }
  if (category === "stretching") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} stretching flow` : "Targeted stretching flow";
  }
  if (category === "injury_specific") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} injury-support sequence` : "Injury-support sequence";
  }
  return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} recovery flow` : "Full-body recovery flow";
}

function formatAreaLabel(value) {
  const map = {
    back: "Lower-back",
    shoulder: "Shoulder",
    hip: "Hip",
    knee: "Knee",
    ankle: "Ankle",
    elbow: "Elbow",
    wrist: "Wrist",
    full_body: "Full-body"
  };
  return map[value] || "Full-body";
}

function formatSupportTopic(value) {
  const map = {
    meniscus_support: "Meniscus support",
    acl_mcl_support: "ACL / MCL stability support",
    patellar_tracking_support: "Patellar tracking support",
    general_knee_pain_support: "General knee pain support",
    lumbar_strain_support: "Lumbar strain support",
    disc_irritation_support: "Disc irritation support",
    general_low_back_stiffness: "General low-back stiffness",
    rotator_cuff_support: "Rotator cuff irritation support",
    shoulder_impingement_support: "Shoulder impingement support",
    shoulder_instability_support: "Shoulder instability support",
    tennis_elbow: "Tennis elbow support",
    carpal_tunnel: "Carpal tunnel support",
    hip_tightness_support: "Hip tightness support",
    ankle_stiffness_support: "Ankle stiffness support",
    lower_back: "Lower-back support",
    knee_support: "Knee support",
    shoulder_irritation: "Shoulder support",
    hip_tightness: "Hip tightness support",
    ankle_stiffness: "Ankle stiffness support"
  };

  return map[value] || String(value || "").replaceAll("_", " ");
}

function expandSupportTopics(topics = []) {
  const expanded = new Set();
  topics.forEach((topic) => {
    const normalized = String(topic || "").trim();
    if (!normalized) {
      return;
    }
    expanded.add(normalized);
    (SUPPORT_TOPIC_EQUIVALENTS[normalized] || []).forEach((alias) => expanded.add(alias));
  });
  return Array.from(expanded);
}

function normalizeSupportTopic(value) {
  const map = {
    wrist: "carpal_tunnel",
    elbow: "tennis_elbow",
    shoulder: "rotator_cuff_support",
    knee: "general_knee_pain_support",
    ankle: "ankle_stiffness_support",
    back: "general_low_back_stiffness",
    hip: "hip_tightness_support"
  };

  return map[value] || value;
}

```

## FILE: server/data/workoutLibrary.js

`$ext
import crypto from "node:crypto";
import {
  ACCESS_TIERS,
  FREE_EXERCISES_PER_WORKOUT_LIMIT,
  getFreeWorkoutAccessProfile,
  hasFullWorkoutAccess,
  isWorkoutFocusUsable,
  normalizeAccessTier
} from "../../shared/entitlements.js";
import {
  buildEquipmentProfileFromSelections,
  EQUIPMENT_PROFILE_OPTIONS,
  formatEquipmentSelections,
  getEquipmentSelectionOptionsForEnvironment,
  getEquipmentSelectionsForProfile,
  WORKOUT_FOCUS_OPTIONS,
  formatWorkoutFocus,
  getEquipmentOptionsForEnvironment,
  getSuggestedWorkoutFocuses,
  normalizeEquipmentProfile,
  normalizeEquipmentSelections
} from "../../shared/workoutEngine.js";
import { createLibraryEntry, createMediaPayload, validateLibraryEntries } from "../../shared/exerciseCatalog.js";
import { buildExerciseMediaSpec } from "../../shared/mediaGenerationConfig.js";
import { EXERCISE_LIBRARY_CATEGORIES, WORKOUT_DISCOVERY_CATEGORIES, WORKOUT_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";
import { adaptMovementForProfile, attachMovementToExercise, findMovementForName } from "./movementLibrary.js";

const BASE_EXERCISE_VARIANTS = [
  variant("barbell-bench-press", "Barbell bench press", "horizontal_push_primary", "barbell", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("machine-chest-press", "Machine chest press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("incline-dumbbell-press", "Incline dumbbell press", "horizontal_push_primary", "dumbbell", "Chest", "Horizontal push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("incline-machine-press", "Incline machine press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-floor-press", "Dumbbell floor press", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("push-up", "Push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-chest-press", "Band chest press", "horizontal_push_secondary", "bands", "Chest", "Horizontal push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("deficit-push-up", "Deficit push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("seated-shoulder-press", "Seated shoulder press", "vertical_push", "machine", "Shoulders", "Vertical push", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-shoulder-press", "Dumbbell shoulder press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("pike-push-up", "Pike push-up", "vertical_push", "bodyweight", "Shoulders", "Vertical push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-overhead-press", "Band overhead press", "vertical_push", "bands", "Shoulders", "Vertical push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("arnold-press", "Arnold press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-lateral-raise", "Cable lateral raise", "shoulder_isolation", "machine", "Shoulders", "Shoulder isolation", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-lateral-raise", "Dumbbell lateral raise", "shoulder_isolation", "dumbbell", "Shoulders", "Shoulder isolation", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-lateral-raise", "Band lateral raise", "shoulder_isolation", "bands", "Shoulders", "Shoulder isolation", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("lean-away-lateral-raise", "Lean-away lateral raise", "shoulder_isolation", "dumbbell", "Shoulders", "Shoulder isolation", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("triceps-pushdown", "Triceps pushdown", "triceps", "machine", "Triceps", "Elbow extension", ["full_gym"], ["gym", "hybrid"]),
  variant("overhead-dumbbell-extension", "Overhead dumbbell extension", "triceps", "dumbbell", "Triceps", "Elbow extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("close-grip-push-up", "Close-grip push-up", "triceps", "bodyweight", "Triceps", "Elbow extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-pressdown", "Band pressdown", "triceps", "bands", "Triceps", "Elbow extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bench-dip", "Bench dip", "triceps", "bodyweight", "Triceps", "Elbow extension", ["bench_dumbbells", "bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("skull-crusher", "Skull crusher", "triceps", "dumbbell", "Triceps", "Elbow extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("lat-pulldown", "Lat pulldown", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]),
  variant("assisted-pull-up", "Assisted pull-up", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]),
  variant("band-pulldown", "Band pulldown", "vertical_pull", "bands", "Back", "Vertical pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("back-widow", "Back widow", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("pull-up-negative", "Pull-up negative", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("chest-supported-row", "Chest-supported row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]),
  variant("seated-cable-row", "Seated cable row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]),
  variant("single-arm-dumbbell-row", "Single-arm dumbbell row", "horizontal_pull", "dumbbell", "Back", "Horizontal pull", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-row", "Band row", "horizontal_pull", "bands", "Back", "Horizontal pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("doorframe-row", "Doorframe row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("inverted-row", "Inverted row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("face-pull", "Cable face pull", "rear_delt", "machine", "Shoulders", "Rear delt / posture", ["full_gym"], ["gym", "hybrid"]),
  variant("band-pull-apart", "Band pull-apart", "rear_delt", "bands", "Shoulders", "Rear delt / posture", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("reverse-fly", "Reverse fly", "rear_delt", "dumbbell", "Shoulders", "Rear delt / posture", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("reverse-snow-angel", "Reverse snow angel", "rear_delt", "bodyweight", "Shoulders", "Rear delt / posture", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("ez-bar-curl", "EZ-bar curl", "biceps", "barbell", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]),
  variant("hammer-curl", "Hammer curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-curl", "Band curl", "biceps", "bands", "Biceps", "Elbow flexion", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("towel-curl-isometric", "Towel curl isometric", "biceps", "bodyweight", "Biceps", "Elbow flexion", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("incline-dumbbell-curl", "Incline dumbbell curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),
  variant("concentration-curl", "Concentration curl", "biceps", "dumbbell", "Biceps", "Elbow flexion", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("back-squat", "Back squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("leg-press", "Leg press", "squat", "machine", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]),
  variant("goblet-squat", "Goblet squat", "squat", "dumbbell", "Legs", "Squat", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bodyweight-squat", "Bodyweight squat", "squat", "bodyweight", "Legs", "Squat", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-squat", "Banded squat", "squat", "bands", "Legs", "Squat", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("front-foot-elevated-squat", "Front-foot elevated squat", "squat", "dumbbell", "Legs", "Squat", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("romanian-deadlift", "Romanian deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("trap-bar-deadlift", "Trap-bar deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]),
  variant("dumbbell-romanian-deadlift", "Dumbbell Romanian deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-hinge-reach", "Hip hinge reach", "hinge", "bodyweight", "Hamstrings", "Hinge", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-hip-hinge", "Band hip hinge", "hinge", "bands", "Hamstrings", "Hinge", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("kettlebell-deadlift", "Kettlebell deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("walking-lunge", "Walking lunge", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("supported-split-squat", "Supported split squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-reverse-lunge", "Banded reverse lunge", "lunge", "bands", "Legs", "Single-leg", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("step-up", "Step-up", "lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("rear-foot-elevated-split-squat", "Rear-foot elevated split squat", "lunge", "dumbbell", "Legs", "Single-leg", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]),

  variant("hip-thrust", "Hip thrust", "glute", "barbell", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),
  variant("glute-bridge", "Glute bridge", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("dumbbell-glute-bridge", "Dumbbell glute bridge", "glute", "dumbbell", "Glutes", "Hip extension", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-glute-bridge", "Banded glute bridge", "glute", "bands", "Glutes", "Hip extension", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("cable-pull-through", "Cable pull-through", "glute", "machine", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]),

  variant("standing-calf-raise", "Standing calf raise", "calf", "machine", "Calves", "Calf raise", ["full_gym"], ["gym", "hybrid"]),
  variant("single-leg-calf-raise", "Single-leg calf raise", "calf", "bodyweight", "Calves", "Calf raise", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-calf-raise", "Band calf raise", "calf", "bands", "Calves", "Calf raise", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("seated-calf-raise", "Seated calf raise", "calf", "dumbbell", "Calves", "Calf raise", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("dumbbell-thruster", "Dumbbell thruster", "full_body_push", "dumbbell", "Full body", "Total-body push", ["full_gym", "bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("push-up-to-down-dog", "Push-up to down dog", "full_body_push", "bodyweight", "Full body", "Total-body push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-thruster", "Band thruster", "full_body_push", "bands", "Full body", "Total-body push", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("man-maker", "Man maker", "full_body_push", "dumbbell", "Full body", "Total-body push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("renegade-row", "Renegade row", "full_body_pull", "dumbbell", "Full body", "Total-body pull", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("mountain-climber", "Mountain climber", "full_body_pull", "bodyweight", "Full body", "Total-body pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-row-squat", "Band row to squat", "full_body_pull", "bands", "Full body", "Total-body pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bear-crawl-drag", "Bear crawl drag", "full_body_pull", "bodyweight", "Full body", "Total-body pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("reverse-lunge", "Reverse lunge", "full_body_leg", "bodyweight", "Legs", "Total-body leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("goblet-squat-to-press", "Goblet squat to press", "full_body_leg", "dumbbell", "Legs", "Total-body leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),
  variant("banded-good-morning", "Banded good morning", "full_body_leg", "bands", "Legs", "Total-body leg", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("step-up-to-knee-drive", "Step-up to knee drive", "full_body_leg", "dumbbell", "Legs", "Total-body leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]),

  variant("high-knees", "High knees", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("burpee", "Burpee", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("band-power-step", "Band power step", "conditioning", "bands", "Cardio", "Conditioning", ["bands", "hybrid"], ["home", "gym", "hybrid"]),
  variant("bike-sprint", "Bike sprint", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]),
  variant("jump-rope", "Jump rope", "conditioning", "bodyweight", "Cardio", "Conditioning", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),

  variant("cat-cow", "Cat-cow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("worlds-greatest-stretch", "World's greatest stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("ninety-ninety-hip-flow", "90/90 hip flow", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("thoracic-rotation", "Thoracic rotation", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("shoulder-mobility", "Shoulder mobility", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hip-flexor-stretch", "Hip flexor stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]),
  variant("hamstring-stretch", "Hamstring stretch", "mobility_flow", "bodyweight", "Mobility", "Mobility flow", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"])
];

const EXPANDED_EXERCISE_VARIANTS = [
  ...variantFamily("push_family", [
    ["flat-dumbbell-bench-press", "Flat dumbbell bench press", "horizontal_push_primary", "dumbbell", "Chest", "Horizontal push", ["full_gym", "bench_dumbbells", "hybrid"], ["home", "gym", "hybrid"]],
    ["smith-machine-bench-press", "Smith machine bench press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["machine-incline-chest-press", "Machine incline chest press", "horizontal_push_primary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["cable-chest-fly", "Cable chest fly", "horizontal_push_secondary", "machine", "Chest", "Horizontal push", ["full_gym"], ["gym", "hybrid"]],
    ["dumbbell-squeeze-press", "Dumbbell squeeze press", "horizontal_push_secondary", "dumbbell", "Chest", "Horizontal push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["ring-push-up", "Ring push-up", "horizontal_push_secondary", "bodyweight", "Chest", "Horizontal push", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("shoulder_press_family", [
    ["half-kneeling-dumbbell-press", "Half-kneeling dumbbell press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["landmine-press", "Landmine press", "vertical_push", "barbell", "Shoulders", "Vertical push", ["full_gym", "hybrid"], ["gym", "hybrid"]],
    ["z-press", "Z-press", "vertical_push", "dumbbell", "Shoulders", "Vertical push", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["cable-y-raise", "Cable Y raise", "shoulder_isolation", "machine", "Shoulders", "Shoulder isolation", ["full_gym"], ["gym", "hybrid"]],
    ["rear-delt-cable-fly", "Rear-delt cable fly", "rear_delt", "machine", "Shoulders", "Rear delt / posture", ["full_gym"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("pull_family", [
    ["neutral-grip-lat-pulldown", "Neutral-grip lat pulldown", "vertical_pull", "machine", "Back", "Vertical pull", ["full_gym"], ["gym", "hybrid"]],
    ["chin-up", "Chin-up", "vertical_pull", "bodyweight", "Back", "Vertical pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["straight-arm-band-pulldown", "Straight-arm band pulldown", "vertical_pull", "bands", "Back", "Vertical pull", ["bands", "hybrid"], ["home", "gym", "hybrid"]],
    ["t-bar-row", "T-bar row", "horizontal_pull", "barbell", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]],
    ["machine-row", "Machine row", "horizontal_pull", "machine", "Back", "Horizontal pull", ["full_gym"], ["gym", "hybrid"]],
    ["tripod-row", "Tripod row", "horizontal_pull", "dumbbell", "Back", "Horizontal pull", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["suspension-row", "Suspension row", "horizontal_pull", "bodyweight", "Back", "Horizontal pull", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("arm_accessory_family", [
    ["preacher-curl", "Preacher curl", "biceps", "machine", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]],
    ["rope-hammer-curl", "Rope hammer curl", "biceps", "machine", "Biceps", "Elbow flexion", ["full_gym"], ["gym", "hybrid"]],
    ["reverse-curl", "Reverse curl", "biceps", "barbell", "Biceps", "Elbow flexion", ["full_gym", "hybrid"], ["gym", "hybrid"]],
    ["rope-overhead-extension", "Rope overhead extension", "triceps", "machine", "Triceps", "Elbow extension", ["full_gym"], ["gym", "hybrid"]],
    ["cross-body-triceps-extension", "Cross-body triceps extension", "triceps", "dumbbell", "Triceps", "Elbow extension", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["wrist-curl", "Wrist curl", "biceps", "dumbbell", "Forearms", "Elbow flexion", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("squat_family", [
    ["front-squat", "Front squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["hack-squat", "Hack squat", "squat", "machine", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["box-squat", "Box squat", "squat", "barbell", "Legs", "Squat", ["full_gym"], ["gym", "hybrid"]],
    ["heels-elevated-goblet-squat", "Heels-elevated goblet squat", "squat", "dumbbell", "Legs", "Squat", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("hinge_family", [
    ["conventional-deadlift", "Conventional deadlift", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]],
    ["single-leg-romanian-deadlift", "Single-leg Romanian deadlift", "hinge", "dumbbell", "Hamstrings", "Hinge", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["barbell-good-morning", "Barbell good morning", "hinge", "barbell", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]],
    ["cable-romanian-deadlift", "Cable Romanian deadlift", "hinge", "machine", "Hamstrings", "Hinge", ["full_gym"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("single_leg_family", [
    ["dumbbell-reverse-lunge", "Dumbbell reverse lunge", "lunge", "dumbbell", "Legs", "Single-leg", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["lateral-lunge", "Lateral lunge", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["cossack-squat", "Cossack squat", "lunge", "bodyweight", "Legs", "Single-leg", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["landmine-split-squat", "Landmine split squat", "lunge", "barbell", "Legs", "Single-leg", ["full_gym", "hybrid"], ["gym", "hybrid"]]
  ]),
  ...variantFamily("glute_family", [
    ["barbell-hip-thrust-pause", "Barbell hip thrust pause", "glute", "barbell", "Glutes", "Hip extension", ["full_gym"], ["gym", "hybrid"]],
    ["frog-pump", "Frog pump", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["single-leg-glute-bridge", "Single-leg glute bridge", "glute", "bodyweight", "Glutes", "Hip extension", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]]
  ]),
  ...variantFamily("core_finish_family", [
    ["farmer-carry", "Farmer carry", "full_body_finish", "dumbbell", "Core", "Carry", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["suitcase-carry", "Suitcase carry", "full_body_finish", "dumbbell", "Core", "Carry", ["bench_dumbbells", "dumbbells_only", "hybrid"], ["home", "gym", "hybrid"]],
    ["pallof-press", "Pallof press", "full_body_finish", "bands", "Core", "Anti-rotation", ["bands", "hybrid"], ["home", "gym", "hybrid"]],
    ["dead-bug", "Dead bug", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["plank-shoulder-tap", "Plank shoulder tap", "full_body_finish", "bodyweight", "Core", "Core control", ["bodyweight", "hybrid"], ["home", "gym", "hybrid"]],
    ["sled-push", "Sled push", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]],
    ["rower-sprint", "Rower sprint", "conditioning", "machine", "Cardio", "Conditioning", ["full_gym"], ["gym", "hybrid"]]
  ])
];

const RAW_EXERCISE_VARIANTS = [...BASE_EXERCISE_VARIANTS, ...EXPANDED_EXERCISE_VARIANTS];
const EXERCISE_VARIANTS = validateLibraryEntries(RAW_EXERCISE_VARIANTS, "workout catalog").map((entry) => {
  const rawEntry = RAW_EXERCISE_VARIANTS.find((candidate) => candidate.id === entry.id);
  return {
    ...entry,
    ...(rawEntry || {})
  };
});

const WORKOUT_TEMPLATES = [
  template("push-day", "Push Day", "push", "strength", 46, "Moderate", ["Chest", "Shoulders", "Triceps"], "A straightforward pressing day that adapts cleanly to your setup.", [
    slot("primary-press", "Primary press", "horizontal_push_primary", 4, "6-10"),
    slot("secondary-press", "Secondary press", "horizontal_push_secondary", 3, "8-12"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-12"),
    slot("delts", "Shoulder support", "shoulder_isolation", 3, "12-15"),
    slot("triceps", "Triceps finisher", "triceps", 3, "10-15")
  ]),
  template("pull-day", "Pull Day", "pull", "strength", 46, "Moderate", ["Back", "Shoulders", "Biceps"], "Rows and pulls built to fit the equipment you actually have today.", [
    slot("vertical-pull", "Primary pull", "vertical_pull", 4, "8-10"),
    slot("horizontal-pull", "Secondary pull", "horizontal_pull", 3, "8-12"),
    slot("rear-delt", "Rear delt / posture", "rear_delt", 3, "12-15"),
    slot("biceps", "Biceps support", "biceps", 3, "10-15")
  ]),
  template("legs-day", "Leg Day: balanced lower", "legs", "strength", 50, "High", ["Legs", "Hamstrings", "Glutes"], "A balanced lower-body session with squat, hinge, and single-leg work kept in a clean order.", [
    slot("squat", "Primary squat", "squat", 4, "6-10"),
    slot("hinge", "Hinge pattern", "hinge", 3, "8-12"),
    slot("lunge", "Single-leg work", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15"),
    slot("calf", "Calf support", "calf", 3, "12-20")
  ]),
  template("chest-triceps", "Chest + Triceps", "chest_triceps", "strength", 44, "Moderate", ["Chest", "Triceps"], "A chest-forward session with clean triceps support instead of random extra volume.", [
    slot("primary-press", "Chest press", "horizontal_push_primary", 4, "6-8"),
    slot("secondary-press", "Secondary chest", "horizontal_push_secondary", 3, "8-12"),
    slot("delts", "Shoulder support", "shoulder_isolation", 2, "12-15"),
    slot("triceps-a", "Triceps", "triceps", 3, "10-12"),
    slot("triceps-b", "Triceps burn", "triceps", 2, "12-15")
  ]),
  template("back-biceps", "Back + Biceps", "back_biceps", "strength", 44, "Moderate", ["Back", "Biceps"], "A back-heavy session that still leaves room for direct biceps work.", [
    slot("vertical-pull", "Lat pattern", "vertical_pull", 4, "8-10"),
    slot("horizontal-pull", "Row pattern", "horizontal_pull", 3, "8-12"),
    slot("rear-delt", "Upper-back support", "rear_delt", 3, "12-15"),
    slot("biceps-a", "Main curl", "biceps", 3, "10-12"),
    slot("biceps-b", "Secondary curl", "biceps", 2, "12-15")
  ]),
  template("shoulders-day", "Shoulders", "shoulders", "strength", 40, "Moderate", ["Shoulders", "Upper back"], "A shoulder-focused session that still protects posture and pressing quality.", [
    slot("vertical-press", "Primary press", "vertical_push", 4, "6-10"),
    slot("delts-a", "Lateral work", "shoulder_isolation", 3, "12-15"),
    slot("rear-delt", "Rear delt support", "rear_delt", 3, "12-15"),
    slot("horizontal-push", "Pressing support", "horizontal_push_secondary", 2, "10-12")
  ]),
  template("upper-body", "Upper Body: balanced push-pull", "upper_body", "strength", 48, "Moderate", ["Chest", "Back", "Shoulders", "Arms"], "A balanced upper session when you want one complete hit instead of a narrow split.", [
    slot("horizontal-push", "Press", "horizontal_push_primary", 3, "6-10"),
    slot("horizontal-pull", "Row", "horizontal_pull", 3, "8-12"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-12"),
    slot("vertical-pull", "Pull", "vertical_pull", 3, "8-12"),
    slot("arms", "Arms", "biceps", 2, "10-15")
  ]),
  template("lower-body", "Lower Body: clean strength base", "lower_body", "strength", 48, "Moderate", ["Legs", "Hamstrings", "Glutes"], "A clean lower-body strength base with enough structure to feel serious without getting bloated.", [
    slot("squat", "Squat", "squat", 4, "6-10"),
    slot("hinge", "Hinge", "hinge", 3, "8-12"),
    slot("lunge", "Single-leg", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15")
  ]),
  template("full-body", "Full Body: balanced training day", "full_body", "strength", 52, "Moderate", ["Full body"], "A complete full-body session with enough work to cover push, pull, lower body, and one useful support block.", [
    slot("full-push", "Primary push", "full_body_push", 3, "8-10"),
    slot("full-pull", "Primary pull", "full_body_pull", 3, "8-10"),
    slot("full-leg", "Lower-body anchor", "full_body_leg", 3, "8-10"),
    slot("secondary-press", "Upper-body support", "horizontal_push_secondary", 2, "10-12"),
    slot("glute", "Lower-body support", "glute", 2, "10-12"),
    slot("finish", "Core or carry finish", "full_body_finish", 2, null, "25-30 sec")
  ]),
  template("mobility-recovery", "Mobility / Recovery Day", "mobility_recovery", "mobility", 24, "Low", ["Mobility", "Recovery"], "Use this when recovery, stiffness, or joint confidence needs to lead the day.", [
    slot("mobility-a", "Warm-in", "mobility_flow", 2, "5 each side"),
    slot("mobility-b", "Main flow", "mobility_flow", 2, "6 each side"),
    slot("mobility-c", "Cooldown", "mobility_flow", 2, "5 each side")
  ]),
  template("push-volume", "Push Volume Builder", "push", "strength", 52, "Moderate", ["Chest", "Shoulders", "Triceps"], "A slightly fuller pressing session when you want more chest and shoulder volume without losing structure.", [
    slot("primary-press", "Heavy press", "horizontal_push_primary", 4, "6-8"),
    slot("secondary-press", "Secondary chest", "horizontal_push_secondary", 3, "8-12"),
    slot("vertical-press", "Overhead press", "vertical_push", 3, "8-10"),
    slot("delts-a", "Lateral delts", "shoulder_isolation", 3, "12-15"),
    slot("triceps-a", "Triceps press", "triceps", 3, "10-12"),
    slot("triceps-b", "Triceps burn", "triceps", 2, "12-15")
  ]),
  template("pull-density", "Pull Density Day", "pull", "strength", 50, "Moderate", ["Back", "Rear delts", "Biceps"], "A denser pull session with more back volume and enough arm work to feel complete.", [
    slot("vertical-pull", "Primary pull", "vertical_pull", 4, "6-10"),
    slot("horizontal-pull", "Main row", "horizontal_pull", 4, "8-12"),
    slot("rear-delt", "Upper-back support", "rear_delt", 3, "12-15"),
    slot("biceps-a", "Main curl", "biceps", 3, "10-12"),
    slot("biceps-b", "Secondary curl", "biceps", 2, "12-15")
  ]),
  template("leg-builder", "Leg Builder: squat + hinge focus", "legs", "strength", 54, "High", ["Quads", "Hamstrings", "Glutes"], "A more standard lifting-style lower day with heavier squat and hinge emphasis.", [
    slot("squat", "Primary squat", "squat", 4, "5-8"),
    slot("hinge", "Posterior-chain hinge", "hinge", 4, "6-10"),
    slot("lunge", "Single-leg work", "lunge", 3, "8-10 each side"),
    slot("glute", "Glute drive", "glute", 3, "10-15"),
    slot("calf", "Calf support", "calf", 3, "12-20")
  ]),
  template("upper-strength-balance", "Upper Strength Balance: main lifts first", "upper_body", "strength", 52, "Moderate", ["Chest", "Back", "Shoulders", "Arms"], "A standard upper-body layout with pressing and pulling anchored by the main lifts first.", [
    slot("horizontal-push", "Primary press", "horizontal_push_primary", 4, "6-8"),
    slot("horizontal-pull", "Primary row", "horizontal_pull", 4, "8-10"),
    slot("vertical-press", "Shoulder press", "vertical_push", 3, "8-10"),
    slot("vertical-pull", "Vertical pull", "vertical_pull", 3, "8-12"),
    slot("arms-a", "Arm finisher", "biceps", 2, "10-15"),
    slot("arms-b", "Triceps support", "triceps", 2, "10-15")
  ]),
  template("lower-strength-balance", "Lower Strength Balance: squat + single-leg", "lower_body", "strength", 50, "Moderate", ["Quads", "Glutes", "Hamstrings"], "A lower-body session with clearer squat and single-leg emphasis so it does not feel like the same leg day twice.", [
    slot("squat", "Main squat", "squat", 4, "6-8"),
    slot("hinge", "Main hinge", "hinge", 3, "8-10"),
    slot("lunge", "Single-leg slot", "lunge", 3, "8-12 each side"),
    slot("glute", "Glute support", "glute", 3, "10-15"),
    slot("calf", "Calves", "calf", 2, "15-20")
  ]),
  template("full-body-density", "Full Body Density: fast pace", "full_body", "strength", 36, "High", ["Full body"], "A shorter, denser full-body session that moves faster and leans harder on pace than volume.", [
    slot("full-push", "Push opener", "full_body_push", 3, "10-12"),
    slot("full-leg", "Leg drive", "full_body_leg", 3, "10-12"),
    slot("full-pull", "Pull reset", "full_body_pull", 3, "10-12"),
    slot("conditioning", "Density closer", "conditioning", 3, null, "30-40 sec"),
    slot("finish", "Core reset", "full_body_finish", 2, null, "20-30 sec"),
    slot("mobility-a", "Quick reset", "mobility_flow", 2, "4 each side")
  ]),
  template("recovery-reset", "Recovery Reset", "mobility_recovery", "mobility", 28, "Low", ["Mobility", "Recovery"], "A support day built for stiffness, stress, or lower readiness without losing the training rhythm.", [
    slot("mobility-a", "Reset flow", "mobility_flow", 2, "5 each side"),
    slot("mobility-b", "Main mobility work", "mobility_flow", 3, "5-6 each side"),
    slot("conditioning", "Easy conditioning", "conditioning", 2, null, "20-30 sec")
  ])
];

const FOCUS_ALIAS_MAP = {
  recommended: [],
  push: ["push"],
  pull: ["pull"],
  legs: ["legs", "lower_body"],
  chest: ["chest_triceps", "push"],
  back: ["back_biceps", "pull"],
  shoulders: ["shoulders", "push"],
  glutes: ["legs", "lower_body"],
  arms: ["back_biceps", "chest_triceps"],
  biceps: ["back_biceps", "pull"],
  triceps: ["chest_triceps", "push"],
  forearms: ["pull", "back_biceps"],
  calves: ["legs", "lower_body"],
  core_abs: ["full_body", "mobility_recovery"],
  chest_triceps: ["chest_triceps"],
  back_biceps: ["back_biceps"],
  upper_body: ["upper_body", "push", "pull"],
  lower_body: ["lower_body", "legs"],
  full_body: ["full_body"],
  mobility_recovery: ["mobility_recovery"]
};

export function getWorkoutLibraryForProfile(filters = {}, profile = {}, recentWorkouts = [], accessTier = ACCESS_TIERS.PREMIUM) {
  const normalizedFilters = normalizeFilters(filters, profile);
  const historyContext = buildRecentWorkoutContext(recentWorkouts);
  const suggestedFocuses = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: normalizedFilters.lowRecovery
  });
  const normalizedAccessTier = normalizeAccessTier(accessTier);
  const focusPool = normalizedFilters.focus === "recommended"
    ? suggestedFocuses
    : normalizedFilters.focus === "all"
      ? WORKOUT_FOCUS_OPTIONS.map((option) => option.value)
      : [normalizedFilters.focus];
  const templateFocusPool = normalizedFilters.focus === "all"
    ? Array.from(new Set(WORKOUT_TEMPLATES.map((entry) => entry.focus)))
    : Array.from(new Set(focusPool.flatMap((focusId) => FOCUS_ALIAS_MAP[focusId] || [focusId])));

  const workouts = WORKOUT_TEMPLATES.filter((templateEntry) => templateFocusPool.includes(templateEntry.focus))
    .map((templateEntry) => buildWorkoutFromTemplate(templateEntry, normalizedFilters, profile, historyContext))
    .filter(Boolean)
    .map((workout) => applyWorkoutAccess(workout, normalizedAccessTier, suggestedFocuses))
    .sort((left, right) => right.recommendationScore - left.recommendationScore);

  return dedupeSurfacedWorkouts(workouts, normalizedFilters.focus);
}

export function getWorkoutLibraryMeta(filters = {}, profile = {}, workouts = null, recentWorkouts = [], accessTier = ACCESS_TIERS.PREMIUM) {
  const normalizedFilters = normalizeFilters(filters, profile);
  const historyContext = buildRecentWorkoutContext(recentWorkouts);
  const suggestedFocuses = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: normalizedFilters.lowRecovery
  });
  const visibleWorkouts = workouts || getWorkoutLibraryForProfile(normalizedFilters, profile, recentWorkouts, accessTier);
  const topWorkout = visibleWorkouts[0] || null;
  const normalizedAccessTier = normalizeAccessTier(accessTier);
  const accessProfile = getFreeWorkoutAccessProfile(suggestedFocuses);
  const selectedFocusMeta =
    normalizedFilters.focus === "recommended"
      ? WORKOUT_FOCUS_OPTIONS.find((option) => option.value === suggestedFocuses[0]) || null
      : WORKOUT_FOCUS_OPTIONS.find((option) => option.value === normalizedFilters.focus) || null;

    return {
      environment: normalizedFilters.environment,
      equipmentProfile: normalizedFilters.equipmentProfile,
      equipmentSelections: normalizedFilters.equipmentSelections,
      focus: normalizedFilters.focus,
      categoryOptions: WORKOUT_DISCOVERY_CATEGORIES,
      sortOptions: WORKOUT_SORT_OPTIONS,
      focusOptions: WORKOUT_FOCUS_OPTIONS.map((option) => ({
        ...option,
        recommended: suggestedFocuses.includes(option.value),
        locked: !hasFullWorkoutAccess(normalizedAccessTier) && !isWorkoutFocusUsable(normalizedAccessTier, option.value, suggestedFocuses)
      })),
    equipmentOptions: getEquipmentSelectionOptionsForEnvironment(normalizedFilters.environment),
    suggestedFocuses,
    accessProfile,
    fullLibraryAccess: hasFullWorkoutAccess(normalizedAccessTier),
    lockedLibraryMessage: hasFullWorkoutAccess(normalizedAccessTier)
      ? ""
      : "Free keeps a small working preview open. Trial + Premium unlock the full workout system, swaps, and session depth.",
    recommendationTitle: topWorkout
      ? normalizedFilters.manualFocus
        ? `You selected ${selectedFocusMeta?.label || topWorkout.focusLabel}. ${topWorkout.name} is the clearest fit.`
        : `${topWorkout.focusLabel} is the cleanest match today.`
      : "Pick the split that fits today.",
      recommendationReason: buildRecommendationReason(profile, normalizedFilters, historyContext, selectedFocusMeta),
      continuityReason: buildContinuityReason(topWorkout, historyContext),
      suggestedPairings: buildSuggestedPairings(profile, normalizedFilters, selectedFocusMeta),
      topWorkoutId: topWorkout?.id || null,
      exerciseLibraryPreview: buildExerciseLibraryPreview(normalizedFilters)
    };
  }

export function findWorkoutPresetForProfile(presetId, profile = {}, filters = {}) {
  const templateEntry = WORKOUT_TEMPLATES.find((entry) => entry.id === presetId);
  if (!templateEntry) {
    return null;
  }

  return buildWorkoutFromTemplate(templateEntry, normalizeFilters(filters, profile), profile, buildRecentWorkoutContext([]));
}

export function findWorkoutPreset(presetId) {
  return findWorkoutPresetForProfile(presetId, {}, {});
}

export function createWorkoutFromPreset(preset, exercisesOverride = null) {
  const exercises = Array.isArray(exercisesOverride) && exercisesOverride.length
    ? exercisesOverride.map((exerciseEntry) => stripExerciseForLogging(exerciseEntry))
    : preset.exercises.map((exerciseEntry) => stripExerciseForLogging(exerciseEntry));

  return {
    id: crypto.randomUUID(),
    presetId: preset.id,
    name: preset.name,
    type: preset.type,
    environment: preset.environment,
    duration: preset.duration,
    intensity: preset.intensity,
    focus: preset.focus,
    exercises,
    loggedAt: new Date().toISOString()
  };
}

function normalizeFilters(filters, profile) {
  const environment = normalizeEnvironment(filters.environment || profile.trainingEnvironment || "hybrid");
  const equipmentSelections = normalizeEquipmentSelections(
    filters.equipmentSelections || getEquipmentSelectionsForProfile(profile),
    environment === "both" ? profile.trainingEnvironment || "hybrid" : environment
  );
  const equipmentProfile = buildEquipmentProfileFromSelections(
    equipmentSelections,
    environment === "both" ? profile.trainingEnvironment || "hybrid" : environment
  ) || normalizeEquipmentProfile(filters.equipmentProfile || profile.equipmentProfile, environment === "both" ? profile.trainingEnvironment : environment);
  const focus = WORKOUT_FOCUS_OPTIONS.some((option) => option.value === filters.focus) || ["all", "recommended"].includes(filters.focus)
    ? filters.focus || "recommended"
    : "recommended";

  return {
    environment,
    equipmentProfile,
    equipmentSelections,
    focus,
    manualFocus: Boolean(filters.focus && filters.focus !== "recommended"),
    lowRecovery: Boolean(filters.lowRecovery)
  };
}

function buildWorkoutFromTemplate(templateEntry, filters, profile, historyContext) {
  if (filters.environment !== "both" && templateEntry.focus === "mobility_recovery" && filters.environment === "gym") {
    return null;
  }

  const environment = resolveWorkoutEnvironment(filters.environment, filters.equipmentProfile);
  const exercises = templateEntry.slots
    .map((slotEntry) =>
      buildExerciseForSlot(slotEntry, {
        environment,
        equipmentProfile: filters.equipmentProfile,
        equipmentSelections: filters.equipmentSelections,
        profile,
        historyContext
      })
    )
    .filter(Boolean);

  if (!exercises.length) {
    return null;
  }

  return {
    id: templateEntry.id,
    name: `${templateEntry.name}${filters.equipmentProfile === "full_gym" ? "" : ` (${formatEquipmentProfile(filters.equipmentProfile)})`}`,
    focus: templateEntry.focus,
    focusLabel: formatWorkoutFocus(templateEntry.focus),
    type: templateEntry.type,
    environment,
    equipmentProfile: filters.equipmentProfile,
    equipmentSelections: filters.equipmentSelections,
    equipmentSummary: formatEquipmentSelections(filters.equipmentSelections),
    duration: templateEntry.duration,
    intensity: templateEntry.intensity,
    summary: templateEntry.summary,
    primaryMuscles: templateEntry.primaryMuscles,
    sessionFlow: buildSessionFlow(templateEntry),
      startPrompt: buildStartPrompt(templateEntry, filters),
      continuityNote: buildWorkoutContinuityNote(templateEntry, historyContext),
      varietyNote: buildWorkoutVarietyNote(exercises, historyContext),
      lastTrainedLabel: formatLastTrainedLabel(templateEntry.focus, historyContext),
      difficultyTag: deriveWorkoutDifficulty(templateEntry),
      jointStressProfile: deriveWorkoutJointStress(exercises),
      trainingStyleTags: deriveWorkoutTrainingStyles(templateEntry, filters, exercises),
      categoryTags: deriveWorkoutCategoryTags(templateEntry, filters, exercises, profile),
      recommendationScore: scoreTemplate(templateEntry, profile, filters, historyContext),
      warmupBlock: profile.showWarmup === false ? [] : buildWarmupBlock(templateEntry, profile),
      cooldownBlock: profile.showCooldown === false ? [] : buildCooldownBlock(templateEntry, profile),
      exercises
  };
}

function applyWorkoutAccess(workout, accessTier, suggestedFocuses) {
  if (hasFullWorkoutAccess(accessTier)) {
    return {
      ...workout,
      lockedForAccess: false,
      previewOnly: false,
      lockedExerciseCount: 0
    };
  }

  const focusUsable = isWorkoutFocusUsable(accessTier, workout.focus, suggestedFocuses);
  if (!focusUsable) {
    return {
      ...workout,
      lockedForAccess: true,
      previewOnly: true,
      lockedReason: "Locked on Free. Trial + Premium unlock this split.",
      exercises: [],
      lockedExerciseCount: workout.exercises.length
    };
  }

  const visibleExercises = workout.exercises.slice(0, FREE_EXERCISES_PER_WORKOUT_LIMIT);
  return {
    ...workout,
    lockedForAccess: false,
    previewOnly: workout.exercises.length > visibleExercises.length,
    lockedExerciseCount: Math.max(workout.exercises.length - visibleExercises.length, 0),
    lockedReason:
      workout.exercises.length > visibleExercises.length
        ? "Free preview only. Trial + Premium unlock the full session."
        : "",
    exercises: visibleExercises
  };
}

function buildExerciseForSlot(slotEntry, { environment, equipmentProfile, equipmentSelections, profile, historyContext }) {
  const options = EXERCISE_VARIANTS.filter((variantEntry) => {
    if (variantEntry.pool !== slotEntry.pool) {
      return false;
    }
    if (!matchesEquipmentSetup(variantEntry, equipmentProfile, equipmentSelections)) {
      return false;
    }
    if (!variantEntry.environments.includes(environment) && !variantEntry.environments.includes("hybrid")) {
      return false;
    }
    return true;
  });

  const rankedOptions = [...options].sort((left, right) =>
    rankVariantOption(right, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) -
    rankVariantOption(left, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry })
  );
  const fallbackOptions = rankedOptions.length
    ? rankedOptions
    : EXERCISE_VARIANTS
        .filter((variantEntry) => variantEntry.pool === slotEntry.pool)
        .sort((left, right) =>
          rankVariantOption(right, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) -
          rankVariantOption(left, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry })
        );

  const primaryOption = fallbackOptions[0];
  if (!primaryOption) {
    return null;
  }

  const swapOptions = fallbackOptions
    .slice(1)
    .map((option) => attachExerciseMetadata(option, slotEntry, profile, historyContext))
    .filter(Boolean)
    .slice(0, 10);

  return {
    ...attachExerciseMetadata(primaryOption, slotEntry, profile, historyContext),
    availableSwapCount: Math.max(fallbackOptions.length - 1, 0),
    swapOptions
  };
}

function attachExerciseMetadata(option, slotEntry, profile, historyContext) {
  const movement = findMovementForName(option.name);
  const adaptedMovement = movement ? adaptMovementForProfile(movement.id, profile) : null;
  const displayMovement = adaptedMovement || movement;
  const displayName = displayMovement?.name || option.name;
  const equipment = displayMovement?.equipment?.[0] || option.equipment;
  const muscleGroup = displayMovement?.primaryMuscles?.[0] || option.muscleGroup;
  const lastLoad = historyContext?.latestLoads?.get(displayName.toLowerCase()) || null;
  const familyOptionCount = EXERCISE_VARIANTS.filter(
    (variantEntry) =>
      variantEntry.pool === option.pool &&
      variantEntry.id !== option.id &&
      variantEntry.familyIds?.some((familyId) => option.familyIds?.includes(familyId))
  ).length;
  const movementGuide = buildMovementGuide(option, displayMovement);

  return {
    name: displayName,
    sets: slotEntry.sets,
    reps: slotEntry.reps,
    duration: slotEntry.duration,
    equipment,
    muscleGroup,
    movementPattern: option.movementPattern,
    slotId: slotEntry.slotId,
    slotLabel: slotEntry.label,
    lastLoad,
    tags: option.tags,
    media: option.media,
    familyIds: option.familyIds || [],
    familyOptionCount,
    movementId: displayMovement?.id || movement?.id || null,
    movement: movementGuide
  };
}

function scoreTemplate(templateEntry, profile, filters, historyContext) {
  let score = 0;

  if (getSuggestedWorkoutFocuses({ goalType: profile.goalType, injuryStatus: profile.injuryStatus, lowRecovery: filters.lowRecovery }).includes(templateEntry.focus)) {
    score += 6;
  }

  if (filters.focus !== "all" && filters.focus !== "recommended" && filters.focus === templateEntry.focus) {
    score += 10;
  }

  if (profile.goalType === "bodybuilding" && ["chest_triceps", "back_biceps", "shoulders", "legs"].includes(templateEntry.focus)) {
    score += 4;
  }

  if (profile.goalType === "strength" && ["upper_body", "lower_body", "legs", "push", "pull"].includes(templateEntry.focus)) {
    score += 4;
  }

  if (profile.injuryStatus !== "none" && templateEntry.focus === "mobility_recovery") {
    score += 8;
  }

  if (filters.lowRecovery && templateEntry.focus === "mobility_recovery") {
    score += 8;
  }

  if (filters.lowRecovery && templateEntry.focus === "full_body") {
    score += 2;
  }

  if (historyContext.templateUsage.get(templateEntry.id)) {
    const recentTemplateUsage = historyContext.templateUsage.get(templateEntry.id);
    score -= recentTemplateUsage >= 2 ? 8 : 4;
  }

  if (historyContext.recentFocuses[0] === templateEntry.focus) {
    score -= templateEntry.focus === "mobility_recovery" ? 1 : 5;
  }

  const lastFocusDays = historyContext.focusLastTrainedDays.get(templateEntry.focus);
  if (typeof lastFocusDays === "number") {
    if (lastFocusDays >= 4) {
      score += 5;
    } else if (lastFocusDays <= 1 && templateEntry.focus !== "mobility_recovery") {
      score -= 4;
    }
  } else {
    score += 4;
  }

  return score;
}

function rankVariantOption(option, { environment, equipmentProfile, equipmentSelections, profile, historyContext, slotEntry }) {
  let score = 0;

  if (option.equipmentProfiles.includes(equipmentProfile)) {
    score += 5;
  }
  if (matchesEquipmentSelection(option.equipment, equipmentSelections)) {
    score += 5;
  }
  if (option.environments.includes(environment)) {
    score += 4;
  } else if (option.environments.includes("hybrid")) {
    score += 2;
  }
  if (profile.goalType === "bodybuilding" && ["machine", "dumbbell"].includes(option.equipment)) {
    score += 2;
  }
  if (profile.goalType === "strength" && ["barbell", "machine"].includes(option.equipment)) {
    score += 2;
  }
  if (profile.injuryStatus !== "none" && ["bodyweight", "bands", "dumbbell"].includes(option.equipment)) {
    score += 2;
  }
  const usageCount = historyContext.exerciseUsage.get(option.name.toLowerCase()) || 0;
  if (usageCount >= 2) {
    score -= 5;
  } else if (usageCount === 1) {
    score -= 2;
  }

  const recentPoolUse = historyContext.poolUsage.get(slotEntry.pool) || 0;
  if (recentPoolUse >= 3 && usageCount === 0) {
    score += 2;
  }

  return score;
}

function buildRecommendationReason(profile, filters, historyContext, selectedFocusMeta = null) {
  const recommendedFocus = getSuggestedWorkoutFocuses({
    goalType: profile.goalType,
    injuryStatus: profile.injuryStatus,
    lowRecovery: filters.lowRecovery
  })[0];
  const focusLabel = filters.manualFocus ? selectedFocusMeta?.label || formatWorkoutFocus(filters.focus) : formatWorkoutFocus(recommendedFocus);

  if (profile.injuryStatus !== "none") {
    return filters.manualFocus
      ? `You selected ${focusLabel}, so the engine is keeping that intent while still protecting your movement guardrails and equipment fit.`
      : `${focusLabel} is leading because your current setup needs cleaner movement choices and easier recovery decisions.`;
  }

  if (filters.lowRecovery) {
    return filters.manualFocus
      ? `You selected ${focusLabel}, and the engine is keeping it realistic for a lower-recovery day instead of forcing a heavier session.`
      : `${focusLabel} is leading because recovery is softer, so the best session today should still move the week forward without forcing extra load.`;
  }

  if (filters.manualFocus) {
    return `You picked ${focusLabel}, so today’s options stay matched to your ${filters.environment} setup, ${formatEquipmentSelections(filters.equipmentSelections).toLowerCase()} setup, and recent training history.`;
  }

  if (historyContext.recentFocuses[0] === recommendedFocus) {
    return `${focusLabel} still fits best today, with enough movement changes to keep the session from feeling recycled.`;
  }

  return `${focusLabel} is the best fit today because it lines up with your ${profile.goalType.replace("_", " ")} goal, your ${filters.environment} training setup, and the equipment you actually have available.`;
}

function buildSuggestedPairings(profile, filters, selectedFocusMeta = null) {
  if (filters.manualFocus && selectedFocusMeta) {
    const map = {
      chest: ["Chest + triceps", "Push", "Upper body"],
      back: ["Back + biceps", "Pull", "Upper body"],
      shoulders: ["Shoulders", "Push", "Upper body"],
      legs: ["Legs", "Lower body", "Glutes"],
      glutes: ["Glutes", "Legs", "Lower body"],
      arms: ["Back + biceps", "Chest + triceps", "Upper body"],
      biceps: ["Back + biceps", "Pull", "Upper body"],
      triceps: ["Chest + triceps", "Push", "Upper body"],
      forearms: ["Pull", "Back + biceps", "Upper body"],
      calves: ["Legs", "Lower body", "Glutes"],
      core_abs: ["Full body", "Mobility / recovery day", "Lower body"],
      push: ["Chest + triceps", "Shoulders", "Upper body"],
      pull: ["Back + biceps", "Upper body", "Forearms"],
      chest_triceps: ["Push", "Chest", "Shoulders"],
      back_biceps: ["Pull", "Back", "Biceps"],
      upper_body: ["Push", "Pull", "Chest + triceps"],
      lower_body: ["Legs", "Glutes", "Calves"],
      full_body: ["Upper body", "Lower body", "Mobility / recovery day"],
      mobility_recovery: ["Mobility / recovery day", "Core / abs", "Full body"]
    };
    return map[selectedFocusMeta.value] || [selectedFocusMeta.label];
  }

  if (profile.goalType === "bodybuilding") {
    return ["Chest + triceps", "Back + biceps", "Shoulders", "Legs"];
  }
  if (profile.goalType === "strength") {
    return ["Upper body", "Lower body", "Push", "Pull", "Legs"];
  }
  if (profile.goalType === "fat_loss") {
    return ["Full body", "Upper body", "Lower body", "Mobility / recovery day"];
  }
  if (filters.lowRecovery || profile.injuryStatus !== "none") {
    return ["Mobility / recovery day", "Full body", "Upper body"];
  }

  return ["Upper body", "Lower body", "Full body", "Push", "Pull"];
}

function dedupeSurfacedWorkouts(workouts, selectedFocus) {
  const seen = new Set();
  return workouts.filter((workout) => {
    const family = `${workout.focus}:${workout.primaryMuscles[0] || "general"}`;
    if (selectedFocus !== "recommended" && selectedFocus !== "all") {
      return true;
    }
    if (seen.has(family)) {
      return false;
    }
    seen.add(family);
    return true;
  });
}

function buildSessionFlow(templateEntry) {
  if (templateEntry.focus === "mobility_recovery") {
    return [
      { title: "Warm in", detail: "Use the first movement to open up the tightest area before pushing range." },
      { title: "Main mobility work", detail: "Spend the bulk of the session on the biggest restriction or support need." },
      { title: "Cooldown", detail: "Finish with easy breathing or low-stress movement so the session actually helps recovery." }
    ];
  }

  return [
    { title: "Warm-up", detail: "Take 5-8 minutes to raise temperature and rehearse the first lift with lighter reps." },
    { title: "Main work", detail: "Do the anchor lifts first while your focus and technique are freshest." },
    { title: "Support work", detail: "Finish with support work that rounds out the session without losing the split." }
  ];
}

function buildStartPrompt(templateEntry, filters) {
  if (templateEntry.focus === "mobility_recovery") {
    return `Start this as a lower-stress ${filters.environment === "gym" ? "gym" : "home"} reset. Smooth reps and breathing matter more than intensity.`;
  }

  return `Start with the first block, stay in order, and let the session build from your main lift into the support work.`;
}

function buildRecentWorkoutContext(recentWorkouts = []) {
  const workouts = [...(recentWorkouts || [])]
    .filter(Boolean)
    .sort((left, right) => new Date(right.loggedAt || 0).getTime() - new Date(left.loggedAt || 0).getTime())
    .slice(0, 8);

  const templateUsage = new Map();
  const exerciseUsage = new Map();
  const poolUsage = new Map();
  const focusLastTrainedDays = new Map();
  const latestLoads = new Map();

  workouts.forEach((workout, index) => {
    if (workout.presetId) {
      templateUsage.set(workout.presetId, (templateUsage.get(workout.presetId) || 0) + 1);
    }
    if (workout.focus && !focusLastTrainedDays.has(workout.focus)) {
      focusLastTrainedDays.set(workout.focus, getDaysSince(workout.loggedAt));
    }

    (workout.exercises || []).forEach((exercise) => {
      if (exercise?.name) {
        const key = exercise.name.toLowerCase();
        exerciseUsage.set(key, (exerciseUsage.get(key) || 0) + 1);
        if (!latestLoads.has(key) && exercise.weight !== undefined && exercise.weight !== null && exercise.weight !== "") {
          latestLoads.set(key, {
            weight: exercise.weight,
            repsCompleted: exercise.repsCompleted || null,
            loggedAt: workout.loggedAt || null
          });
        }
      }
      const pool = inferPoolFromExercise(exercise);
      if (pool) {
        poolUsage.set(pool, (poolUsage.get(pool) || 0) + 1);
      }
    });
  });

  return {
    workouts,
    recentFocuses: workouts.map((workout) => workout.focus).filter(Boolean),
    templateUsage,
    exerciseUsage,
    poolUsage,
    focusLastTrainedDays,
    latestLoads
  };
}

function buildContinuityReason(topWorkout, historyContext) {
  if (!topWorkout) {
    return "Pick the session that fits today, then let the rest of the week build around it.";
  }

  if (topWorkout.lastTrainedLabel) {
    return `${topWorkout.lastTrainedLabel} ${topWorkout.varietyNote || ""}`.trim();
  }

  if (historyContext.workouts.length) {
    return topWorkout.varietyNote || "You keep the same training goal while rotating enough of the movement mix to stay fresh.";
  }

  return "Log a few real sessions and your next recommendations will start feeling noticeably smarter.";
}

function buildWorkoutContinuityNote(templateEntry, historyContext) {
  const lastTrainedLabel = formatLastTrainedLabel(templateEntry.focus, historyContext);
  if (!lastTrainedLabel) {
    return "This split is ready to be the anchor session for today because it has not shown up recently.";
  }
  return lastTrainedLabel;
}

function buildWorkoutVarietyNote(exercises, historyContext) {
  const repeatedMovements = exercises.filter((exercise) => (historyContext.exerciseUsage.get(exercise.name.toLowerCase()) || 0) > 0).length;
  if (!historyContext.workouts.length) {
    return "The engine will start rotating more aggressively once it has a little workout history to learn from.";
  }
  if (repeatedMovements === 0) {
    return "This session keeps the same goal but rotates in a fresh movement mix.";
  }
  if (repeatedMovements <= 2) {
    return "This session keeps the split familiar while changing enough of the exercise mix to stay fresh.";
  }
  return "This session stays close to the same training intent, but swap options are there if you want more variety.";
}

function formatLastTrainedLabel(focus, historyContext) {
  const days = historyContext.focusLastTrainedDays.get(focus);
  if (typeof days !== "number") {
    return "";
  }
  if (days === 0) {
    return `Last trained: ${formatWorkoutFocus(focus)} today.`;
  }
  if (days === 1) {
    return `Last trained: ${formatWorkoutFocus(focus)} yesterday.`;
  }
  return `Last trained: ${formatWorkoutFocus(focus)} ${days} days ago.`;
}

function getDaysSince(dateValue) {
  const parsed = new Date(dateValue || 0);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)));
}

function inferPoolFromExercise(exercise) {
  const matched = EXERCISE_VARIANTS.find((variantEntry) => variantEntry.name.toLowerCase() === String(exercise?.name || "").toLowerCase());
  return matched?.pool || null;
}

function resolveWorkoutEnvironment(environment, equipmentProfile) {
  if (environment === "both") {
    return equipmentProfile === "full_gym" ? "gym" : "home";
  }

  return environment;
}

function normalizeEnvironment(value) {
  if (["gym", "home", "both", "hybrid"].includes(value)) {
    return value === "hybrid" ? "both" : value;
  }
  return "both";
}

function formatEquipmentProfile(value) {
  return EQUIPMENT_PROFILE_OPTIONS.find((option) => option.value === value)?.label || "Current setup";
}

function stripExerciseForLogging(exerciseEntry) {
  return {
    name: exerciseEntry.name,
    sets: exerciseEntry.sets,
    reps: exerciseEntry.reps || null,
    duration: exerciseEntry.duration || null,
    equipment: exerciseEntry.equipment,
    muscleGroup: exerciseEntry.muscleGroup,
    weight: exerciseEntry.weight ?? null,
    repsCompleted: exerciseEntry.repsCompleted || null,
    notes: exerciseEntry.notes || ""
  };
}

function buildWarmupBlock(templateEntry, profile) {
  if (templateEntry.focus === "mobility_recovery") {
    return [];
  }

  return [
    {
      name: profile.trainingEnvironment === "gym" ? "5-minute ramp-up" : "3-minute body prep",
      detail:
        profile.trainingEnvironment === "gym"
          ? "Use 2 easy sets on the first lift plus one mobility drill for the tightest area."
          : "Use one mobility drill and one lighter rehearsal set before the main work."
    }
  ];
}

function buildCooldownBlock(templateEntry, profile) {
  return [
    {
      name: templateEntry.focus === "mobility_recovery" ? "Easy breathing reset" : "Short cooldown / stretch",
      detail:
        profile.injuryStatus !== "none"
          ? "Finish with one gentle stretch or breathing reset for the area that needs the most support."
          : "Take 2-4 minutes to bring breathing down and loosen the area that worked hardest."
    }
  ];
}

function matchesEquipmentSetup(option, equipmentProfile, equipmentSelections = []) {
  return option.equipmentProfiles.includes(equipmentProfile) || matchesEquipmentSelection(option.equipment, equipmentSelections);
}

function matchesEquipmentSelection(optionEquipment, equipmentSelections = []) {
  const selectionSet = new Set(equipmentSelections || []);
  if (!selectionSet.size) {
    return true;
  }

  const map = {
    dumbbell: ["dumbbells", "kettlebells"],
    bodyweight: ["bodyweight", "pull_up_bar"],
    bands: ["bands"],
    barbell: ["barbell"],
    machine: ["machines"],
    kettlebell: ["kettlebells"]
  };

  return (map[optionEquipment] || [optionEquipment]).some((entry) => selectionSet.has(entry));
}

function deriveWorkoutDifficulty(templateEntry) {
  if (templateEntry.intensity === "High" || templateEntry.slots.length >= 6) {
    return "Advanced";
  }
  if (templateEntry.duration >= 46) {
    return "Intermediate";
  }
  return "Beginner";
}

function deriveWorkoutJointStress(exercises) {
  if ((exercises || []).some((exercise) => exercise.tags?.jointStressLevel === "high")) {
    return "high";
  }
  if ((exercises || []).every((exercise) => exercise.tags?.jointStressLevel === "low")) {
    return "low";
  }
  return "moderate";
}

function deriveWorkoutTrainingStyles(templateEntry, filters, exercises) {
  const styles = new Set();
  styles.add(templateEntry.type === "mobility" ? "Recovery" : "Strength");
  if (templateEntry.focus === "full_body" && templateEntry.intensity === "High") {
    styles.add("Conditioning");
  }
  if ((exercises || []).some((exercise) => exercise.equipment === "bodyweight")) {
    styles.add("Bodyweight");
  }
  if ((exercises || []).some((exercise) => exercise.equipment === "dumbbell")) {
    styles.add("Dumbbell");
  }
  if (filters.environment === "home") {
    styles.add("At Home");
  }
  if (filters.environment === "both") {
    styles.add("Hybrid Setup");
  }
  if (templateEntry.focus === "mobility_recovery") {
    styles.add("Recovery Day");
    styles.add("Joint-Friendly");
  }
  if (["push", "pull", "upper_body", "chest_triceps", "back_biceps", "shoulders"].includes(templateEntry.focus)) {
    styles.add("Muscle Building");
  }
  return Array.from(styles);
}

function deriveWorkoutCategoryTags(templateEntry, filters, exercises, profile) {
  const tags = new Set(deriveWorkoutTrainingStyles(templateEntry, filters, exercises));
  tags.add(templateEntry.focus);
  if (templateEntry.focus === "legs" || templateEntry.focus === "lower_body") tags.add("Lower Body");
  if (templateEntry.focus === "upper_body") tags.add("Upper Body");
  if (templateEntry.focus === "full_body") tags.add("Full Body");
  if (templateEntry.focus === "chest_triceps") {
    tags.add("Chest");
    tags.add("Arms");
  }
  if (templateEntry.focus === "back_biceps") {
    tags.add("Back");
    tags.add("Arms");
  }
  if (templateEntry.focus === "shoulders") tags.add("Shoulders");
  if ((exercises || []).some((exercise) => exercise.muscleGroup === "Glutes")) tags.add("Glutes");
  if ((exercises || []).some((exercise) => ["Core", "Full body"].includes(exercise.muscleGroup))) tags.add("Core");
  if (profile?.goalType === "fat_loss") tags.add("Fat Loss");
  if (profile?.goalType === "bodybuilding") tags.add("Muscle Building");
  if (profile?.goalType === "strength") tags.add("Strength");
  if (profile?.ageGroup === "40-49" || profile?.ageGroup === "50+") tags.add("40+");
  tags.add(deriveWorkoutDifficulty(templateEntry));
  if (deriveWorkoutJointStress(exercises) === "low") tags.add("Joint-Friendly");
  return Array.from(tags);
}

function buildExerciseLibraryPreview(filters) {
  const previewEntries = EXERCISE_VARIANTS
    .filter((entry) => matchesEquipmentSetup(entry, filters.equipmentProfile, filters.equipmentSelections))
    .filter((entry) => entry.environments.includes(filters.environment) || entry.environments.includes("hybrid") || filters.environment === "both")
    .slice(0, 36)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      category: mapExerciseCategory(entry),
      movementPattern: entry.movementPattern,
      equipment: Array.isArray(entry.equipment)
        ? entry.equipment.join(", ")
        : Array.isArray(entry.equipmentRequirements)
          ? entry.equipmentRequirements.join(", ")
          : entry.equipment || "",
      difficulty: entry.difficulty,
      jointStress: entry.jointStress,
      rehabSafe: entry.rehabSafe,
      familyIds: entry.familyIds || [],
      media: entry.media,
      mediaStatus: entry.mediaStatus
    }));

  const categoryCounts = EXERCISE_LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    count: previewEntries.filter((entry) => entry.category === category.label).length
  })).filter((category) => category.count > 0);

  return {
    categories: categoryCounts,
    entries: previewEntries
  };
}

function mapExerciseCategory(entry) {
  const primary = String(entry.primaryMuscleGroup || "").toLowerCase();
  const type = String(entry.trainingType || entry.mode || "").toLowerCase();
  if (type === "mobility") return "Mobility";
  if (primary.includes("chest")) return "Chest";
  if (primary.includes("back")) return "Back";
  if (primary.includes("shoulder")) return "Shoulders";
  if (primary.includes("biceps") || primary.includes("forearms")) return "Biceps";
  if (primary.includes("triceps")) return "Triceps";
  if (primary.includes("glutes")) return "Glutes";
  if (primary.includes("legs") || primary.includes("hamstrings") || primary.includes("quads") || primary.includes("calves")) return "Legs";
  if (primary.includes("core")) return "Core";
  if (primary.includes("cardio")) return "Conditioning";
  if (primary.includes("full body")) return "Full Body";
  return "Conditioning";
}

function slot(slotId, label, pool, sets, reps = null, duration = null) {
  return { slotId, label, pool, sets, reps, duration };
}

function template(id, name, focus, type, duration, intensity, primaryMuscles, summary, slots) {
  return { id, name, focus, type, duration, intensity, primaryMuscles, summary, slots };
}

function variantFamily(familyId, entries) {
  return entries.map(([id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments]) =>
    variant(id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments, { familyId })
  );
}

function variant(id, name, pool, equipment, muscleGroup, movementPattern, equipmentProfiles, environments, options = {}) {
  const jointStressLevel =
    pool === "conditioning" ? "high" : ["mobility_flow", "glute", "calf", "rear_delt"].includes(pool) ? "low" : "moderate";
  const trainingGoals = inferTrainingGoals(pool, movementPattern);
  const rehabSafe = ["bands", "bodyweight", "dumbbell"].includes(equipment) && jointStressLevel !== "high";
  const familyId = options.familyId || `${pool}_family`;
  const movementReference = findMovementForName(name);
  const content = buildTrainingContentStandard({ name, pool, equipment, muscleGroup, movementPattern });
  return createLibraryEntry({
    id,
    name,
    mode: pool === "mobility_flow" ? "mobility" : "training",
    category: pool,
    primaryMuscleGroup: muscleGroup,
    secondaryMuscleGroups: inferSecondaryMuscles(muscleGroup, movementPattern),
    movementPattern,
    equipmentRequirements: [equipment],
    difficultyLevel: inferDifficultyLevel(pool, equipment),
    trainingGoals,
    jointStressLevel,
    rehabSafe,
    environments,
    variationFamily: pool,
    familyIds: [familyId],
    instructions: content.instructions,
    mistakes: content.mistakes,
    cues: content.cues,
    safetyNotes: content.safetyNotes,
    modifications: content.modifications,
    media: createMediaPayload(
      buildExerciseMediaSpec({
        id,
        name,
        familyId,
        trainingType: pool === "mobility_flow" ? "mobility" : "training",
        fallbackImage: movementReference?.image || null
      })
    ),
    extra: {
      pool,
      equipment,
      muscleGroup,
      equipmentProfiles,
      contentStandard: "v1",
      variationGroup: familyId
    }
  });
}

function buildMovementGuide(option, baseMovement = null) {
  const fallbackMovement = attachMovementToExercise({
    name: option.name,
    equipment: option.equipmentRequirements || [option.equipment],
    muscleGroup: option.primaryMuscleGroup || option.muscleGroup,
    movementId: baseMovement?.id || null
  }).movement;
  const movement = baseMovement || fallbackMovement;

  return {
    ...(movement || {}),
    id: movement?.id || option.id,
    name: movement?.name || option.name,
    category: movement?.category || option.category,
    difficulty: movement?.difficulty || option.difficultyLevel,
    environment: movement?.environment || option.environments?.join(", ") || "Home / gym",
    equipment: movement?.equipment?.length ? movement.equipment : option.equipmentRequirements || [option.equipment],
    primaryMuscles: movement?.primaryMuscles?.length ? movement.primaryMuscles : [option.primaryMuscleGroup || option.muscleGroup],
    secondaryMuscles:
      movement?.secondaryMuscles?.length ? movement.secondaryMuscles : option.secondaryMuscleGroups || [],
    instructions: movement?.instructions?.length ? movement.instructions : option.instructions || [],
    cues: movement?.cues?.length ? movement.cues : option.cues || [],
    commonMistakes: movement?.commonMistakes?.length ? movement.commonMistakes : option.mistakes || [],
    safetyNotes: movement?.safetyNotes?.length ? movement.safetyNotes : option.safetyNotes || [],
    modifications: movement?.modifications?.length ? movement.modifications : option.modifications || [],
    media: option.media,
    mediaStatus: option.media?.status || option.mediaStatus || "none",
    familyIds: option.familyIds || []
  };
}

function buildTrainingContentStandard({ name, pool, equipment, muscleGroup, movementPattern }) {
  const lowerPattern = String(movementPattern || "").toLowerCase();
  const setup = getEquipmentCue(equipment);
  const movementRole =
    pool === "conditioning"
      ? "build pace without losing position"
      : pool === "full_body_finish"
        ? "finish the session with control"
        : `train ${String(muscleGroup || "the target area").toLowerCase()}`;

  return {
    instructions: [
      `Set up with ${setup} and get your body in a stable starting position for ${name}.`,
      `Move through each rep with control so the main job is to ${movementRole}.`,
      lowerPattern.includes("carry") || lowerPattern.includes("conditioning")
        ? "Keep breathing steady and stop the set before posture breaks."
        : "Finish each rep cleanly and keep the same shape on the last rep as the first."
    ],
    cues: buildCueList(lowerPattern, muscleGroup),
    mistakes: buildMistakeList(lowerPattern),
    safetyNotes: [
      "Use a load you can control through the full working range.",
      lowerPattern.includes("hinge") || lowerPattern.includes("squat")
        ? "Brace before each rep and stop if you lose spinal position."
        : "Stop the set if the target area loses tension and the rep turns sloppy."
    ],
    modifications: [
      equipment === "barbell"
        ? "Use a dumbbell or machine version if you need a simpler setup."
        : "Reduce load, shorten the range slightly, or slow the tempo to keep the rep cleaner.",
      "Swap to a lower-stress alternative if the joint position feels wrong today."
    ]
  };
}

function buildCueList(lowerPattern, muscleGroup) {
  if (lowerPattern.includes("push")) {
    return ["Brace before you press.", "Keep the shoulders packed instead of shrugging.", `Drive through the rep with ${String(muscleGroup).toLowerCase()} tension.`];
  }
  if (lowerPattern.includes("pull")) {
    return ["Start the pull from your back, not your hands.", "Keep the ribs stacked and neck relaxed.", "Pause briefly when you reach the strongest position."];
  }
  if (lowerPattern.includes("squat") || lowerPattern.includes("single-leg")) {
    return ["Stay balanced through the whole foot.", "Keep the torso organized as you lower.", "Push the floor away on the way up."];
  }
  if (lowerPattern.includes("hinge")) {
    return ["Send the hips back first.", "Keep the bar or load close to you.", "Finish tall without leaning back."];
  }
  if (lowerPattern.includes("carry") || lowerPattern.includes("conditioning")) {
    return ["Stay tall and move with purpose.", "Keep breathing under control.", "Let posture lead the pace."];
  }
  return ["Move with control.", "Keep tension where the exercise is meant to work.", "Stay smooth from rep to rep."];
}

function buildMistakeList(lowerPattern) {
  if (lowerPattern.includes("push")) {
    return ["Flaring the ribs to finish the press.", "Losing shoulder position at the bottom.", "Rushing the lowering phase."];
  }
  if (lowerPattern.includes("pull")) {
    return ["Yanking with the arms before the back engages.", "Turning the rep into a body swing.", "Shrugging through the top of the pull."];
  }
  if (lowerPattern.includes("squat") || lowerPattern.includes("single-leg")) {
    return ["Dropping too fast into the bottom.", "Letting balance shift to the toes.", "Cutting the rep short once it gets harder."];
  }
  if (lowerPattern.includes("hinge")) {
    return ["Rounding the back to chase range.", "Letting the load drift away from the body.", "Turning the rep into a squat."];
  }
  return ["Rushing reps without control.", "Letting posture break before the set ends.", "Using momentum instead of tension."];
}

function getEquipmentCue(equipment) {
  const map = {
    barbell: "a strong brace and a simple bar path",
    dumbbell: "steady grip and even control on both sides",
    bodyweight: "full-body tension and clear body position",
    bands: "constant tension and a stable anchor point",
    machine: "the pad or seat adjusted so the line of pull feels natural"
  };

  return map[equipment] || "a stable setup";
}

function inferTrainingGoals(pool, movementPattern) {
  if (pool === "mobility_flow") {
    return ["mobility", "rehab", "recovery"];
  }
  if (pool === "full_body_finish") {
    return ["general_fitness", "conditioning", "athletic_performance"];
  }
  if (pool === "conditioning") {
    return ["conditioning", "athletic_performance", "fat_loss"];
  }
  if (String(movementPattern || "").toLowerCase().includes("isolation")) {
    return ["hypertrophy", "bodybuilding"];
  }
  return ["strength", "hypertrophy", "general_fitness"];
}

function inferSecondaryMuscles(muscleGroup, movementPattern) {
  const lowerPattern = String(movementPattern || "").toLowerCase();
  if (lowerPattern.includes("push")) {
    return muscleGroup === "Chest" ? ["Shoulders", "Triceps"] : ["Chest", "Triceps"];
  }
  if (lowerPattern.includes("pull")) {
    return muscleGroup === "Back" ? ["Biceps", "Rear delts"] : ["Back", "Biceps"];
  }
  if (lowerPattern.includes("hinge") || lowerPattern.includes("squat")) {
    return ["Glutes", "Hamstrings", "Core"];
  }
  return [];
}

function inferDifficultyLevel(pool, equipment) {
  if (pool === "conditioning") {
    return "advanced";
  }
  if (equipment === "bodyweight" || equipment === "bands") {
    return "beginner";
  }
  if (equipment === "barbell" || equipment === "machine") {
    return "intermediate";
  }
  return "standard";
}

```

## FILE: scripts/build-media-batch.mjs

`$ext
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildExerciseMediaSpec,
  PULSEPEAK_IMAGE_REQUIREMENTS,
  PULSEPEAK_MEDIA_SYSTEM,
  PULSEPEAK_MODELS,
  PULSEPEAK_MEDIA_VALIDATION_RULES,
  STANDARD_EXERCISE_PROMPT_TEMPLATE,
  resolveLockedModelForExercise
} from "../shared/mediaGenerationConfig.js";
import { getMovementLibrary } from "../server/data/movementLibrary.js";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "media");
const outputPath = path.join(outputDir, "pulsepeak-phase1-batch.json");
const movementLibrary = getMovementLibrary();

const payload = {
  generator: PULSEPEAK_MEDIA_SYSTEM.generator,
  phase: PULSEPEAK_MEDIA_SYSTEM.phase,
  version: PULSEPEAK_MEDIA_SYSTEM.version,
  visualStyle: PULSEPEAK_MEDIA_SYSTEM.visualStyle,
  models: PULSEPEAK_MODELS,
  requirements: PULSEPEAK_IMAGE_REQUIREMENTS,
  validationRules: PULSEPEAK_MEDIA_VALIDATION_RULES,
  promptTemplate: STANDARD_EXERCISE_PROMPT_TEMPLATE,
  createdAt: new Date().toISOString(),
  exercises: movementLibrary.map((movement) => {
    const model = resolveLockedModelForExercise({
      id: movement.id,
      familyId: movement.category,
      trainingType: movement.category === "mobility" || movement.category === "rehab" ? "mobility" : "training"
    });
    return {
      id: movement.id,
      name: movement.name,
      category: movement.category,
      model,
      spec: buildExerciseMediaSpec({
        id: movement.id,
        name: movement.name,
        familyId: movement.category,
        trainingType: movement.category === "mobility" || movement.category === "rehab" ? "mobility" : "training",
        modelKey: model.key,
        stepCount: PULSEPEAK_IMAGE_REQUIREMENTS.idealSteps
      })
    };
  })
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));

console.log(`Media batch written to ${outputPath}`);

```

## FILE: scripts/e2e-smoke.mjs

`$ext
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
const screenshotPath = path.join(artifactsDir, "stabilization-proof.png");
const proofPath = path.join(artifactsDir, "stabilization-proof.json");

fs.mkdirSync(artifactsDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

const page = await browser.newPage();
const apiProof = [];
const consoleMessages = [];
const pageErrors = [];
const uniqueEmail = `ui_user_${Date.now()}@pulsepeak.local`;

page.on("console", (message) => {
  consoleMessages.push(`${message.type()}: ${message.text()}`);
});

page.on("pageerror", (error) => {
  pageErrors.push(error.message);
});

page.on("response", async (response) => {
  const url = response.url();
  if (!url.includes("/api/")) {
    return;
  }

  if (
    ![
      "/api/auth/register",
      "/api/auth/session",
      "/api/profile",
      "/api/dashboard",
      "/api/workout-library",
      "/api/workouts/saved"
    ].some((fragment) => url.includes(fragment))
  ) {
    return;
  }

  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "";
  }

  apiProof.push({
    url,
    status: response.status(),
    body
  });
});

try {
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel("Name").fill("UI Test User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Create PulsePeak account" }).click();

  await page.getByRole("heading", { name: /set up pulsepeak once/i }).waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Training \+ Recovery/i }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "General Fitness" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Basic" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Birthdate").fill("1992-06-15");
  await page.getByLabel(/Height/).fill("70");
  await page.getByLabel(/Current weight/).fill("185");
  await page.getByLabel(/Target weight/).fill("180");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Start my tailored dashboard/i }).click();

  await page.getByText(/today's training direction/i).waitFor({ timeout: 15000 });

  await page.goto("http://127.0.0.1:3001/workouts", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /choose your setup, pick your focus/i }).waitFor();

  await page.getByLabel("Where are you training?").selectOption("home");
  await page.getByRole("button", { name: "Dumbbells" }).click();
  await page.getByRole("button", { name: /^Upper Body/i }).first().click();

  await page.getByText("Your session is ready").waitFor({ timeout: 15000 });
  const loadedWorkoutCard = page.locator(".loaded-workout-exercises-card");
  const loadedWorkoutText = await loadedWorkoutCard.innerText();
  if (!loadedWorkoutText.toLowerCase().includes("sets")) {
    throw new Error("Loaded workout list did not render training prescription details.");
  }

  const saveButton = page.getByRole("button", { name: /Save workout|Saved workout/i }).first();
  await saveButton.click();
  await page.getByText(/Workout saved|Workout removed from saved workouts/i).waitFor({ timeout: 10000 });

  await page.getByRole("button", { name: "Start workout" }).first().click();
  await page.getByRole("dialog").waitFor({ timeout: 10000 });
  await page.getByText(/Current exercise/i).waitFor();
  await page.getByRole("button", { name: /Close workout session/i }).click();

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("heading", { name: /keep the app simple, set your guidance level/i }).waitFor({ timeout: 10000 });
  await page.getByRole("main").getByRole("button", { name: "Account" }).click();
  await page.getByText(/Manage your profile, billing, and access in one place/i).waitFor();

  await page.screenshot({ path: screenshotPath, fullPage: true });

  const proof = {
    email: uniqueEmail,
    currentUrl: page.url(),
    loadedWorkoutText,
    settingsVisible: await page.getByText(/Manage your profile, billing, and access in one place/i).isVisible(),
    screenshotPath,
    apiProof,
    consoleMessages,
    pageErrors
  };

  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof));
} finally {
  await browser.close();
}

```

## FILE: package.json

`$ext
{
  "name": "pulsepeak-fitness",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server/server.js",
    "dev": "node scripts/dev.mjs",
    "dev:client": "vite --host 0.0.0.0",
    "dev:server": "node server/server.js",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0",
    "media:batch": "node scripts/build-media-batch.mjs"
  },
  "dependencies": {
    "@stripe/stripe-js": "^9.2.0",
    "cors": "^2.8.5",
    "dotenv": "^17.4.2",
    "express": "^4.21.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "stripe": "^22.0.2"
  },
  "devDependencies": {
    "playwright-core": "^1.59.1",
    "vite": "^5.4.19"
  }
}

```

## FILE: .env.example

`$ext
APP_ORIGIN=https://your-staging-url.example.com
CORS_ALLOWED_ORIGINS=https://your-staging-url.example.com
PULSEPEAK_DB_PATH=/tmp/pulsepeak-db.json
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_PRICE_ID=price_replace_me
STRIPE_YEARLY_PRICE_ID=price_yearly_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_PREMIUM_PRICE_CENTS=1499
STRIPE_PREMIUM_YEARLY_PRICE_CENTS=11999
STRIPE_PREMIUM_CURRENCY=usd
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me

```

## FILE: render.yaml

`$ext
services:
  - type: web
    name: pulsepeak-staging
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: NODE_VERSION
        value: 22.20.0
      - key: APP_ORIGIN
        sync: false
      - key: CORS_ALLOWED_ORIGINS
        sync: false
      - key: PULSEPEAK_DB_PATH
        value: /tmp/pulsepeak-db.json
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PRICE_ID
        sync: false
      - key: STRIPE_YEARLY_PRICE_ID
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: STRIPE_PREMIUM_PRICE_CENTS
        value: "1499"
      - key: STRIPE_PREMIUM_YEARLY_PRICE_CENTS
        value: "11999"
      - key: STRIPE_PREMIUM_CURRENCY
        value: usd
      - key: VITE_STRIPE_PUBLISHABLE_KEY
        sync: false

```

## FILE: STAGING_DEPLOY.md

`$ext
# PulsePeak Staging Deploy

## Recommended staging host

Use a single Render web service with the included `render.yaml`.

Why this is the cleanest path:
- the frontend already builds to `dist`
- the Express server already serves `dist`
- the frontend already calls `/api` on the same origin
- Stripe return URLs can stay on the same host

## Build and start

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`

## Required environment variables

- `APP_ORIGIN`
- `CORS_ALLOWED_ORIGINS`
- `PULSEPEAK_DB_PATH`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Suggested staging values

- `APP_ORIGIN=https://your-render-service.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://your-render-service.onrender.com`
- `PULSEPEAK_DB_PATH=/tmp/pulsepeak-db.json`

`/tmp/pulsepeak-db.json` is the lowest-manual-work staging path. It is fine for staging, but data is ephemeral and can reset on restart or redeploy.

If you want persistent staging data later, point `PULSEPEAK_DB_PATH` to a mounted disk path instead.

## Stripe webhook

Point the Stripe webhook at:

- `https://your-render-service.onrender.com/api/webhook`

The app also supports the legacy path:

- `https://your-render-service.onrender.com/api/stripe/webhook`

```

