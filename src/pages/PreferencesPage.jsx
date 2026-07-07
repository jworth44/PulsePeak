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
import { VISUAL_MODEL_PREFERENCE_OPTIONS } from "../../shared/profileState";

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
  const currentPlanFocus = null;
  const preferenceInfluence = null;

  const openSection = (section) => {
    setSearchParams({ section });
  };

  const handleUpgradeClick = async (interval, mode) => {
    setBillingError("");
    try {
      await startUpgradeCheckout(interval, mode);
    } catch (upgradeError) {
      setBillingError(upgradeError?.message || "We couldn't start checkout. Please try again.");
    }
  };

  const changeTheme = (nextTheme) => {
    applyThemePreference(nextTheme);
    setTheme(nextTheme);
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
    <div className="page-grid editorial-sections">
      <section className="module-page-hero">
        <div>
          <p className="badge">Settings</p>
          <h2>Tune PulsePeak to how you train.</h2>
          <p className="lead-copy">Your setup, appearance, guidance level, and what shows up — all in one place.</p>
        </div>
      </section>

      <div className="settings-layout">
        {/* Redundant with the sidebar submenu on desktop; the only section nav on
            mobile (sidebar hidden). Shown only below the sidebar breakpoint. */}
        <div className="settings-menu-nav">
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
        </div>

        {activeSection === "preferences" ? (
          <div className="page-grid page-grid-tight">
            <Panel eyebrow="App mode" title="Choose the version of PulsePeak you want to open first">
              <p className="support-copy">Choose how much PulsePeak shows you — the full experience, or a leaner focus on just training.</p>
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
              <div className="module-note">
                <strong>{preferenceInfluence?.primary || "Choose the guidance level that feels easiest to use consistently."}</strong>
                <p className="support-copy">{preferenceInfluence?.summary || "You can keep training views detailed, balanced, or minimal without changing the rest of your setup."}</p>
              </div>
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
              <div className="form-field">
                <span>Exercise visual model</span>
                <select
                  value={profile.visualModelPreference || "default"}
                  onChange={(event) => updateProfilePreference({ visualModelPreference: event.target.value }, "visual-model")}
                  disabled={saving === "visual-model"}
                >
                  {VISUAL_MODEL_PREFERENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                      <p className="support-copy">{workout.duration} mins · {(workout.exercises || []).length} exercises</p>
                      <ul className="plan-list compact-plan-list">
                        {(workout.exercises || []).slice(0, 4).map((exercise) => (
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
                    <button className="primary-button" disabled={upgradeBusy} type="button" onClick={() => handleUpgradeClick("yearly", user?.canStartTrial ? "default" : "upgrade_now")}>
                      {user?.canStartTrial ? "Start 7-day free trial" : "Upgrade yearly"}
                    </button>
                    <button className="secondary-button" disabled={upgradeBusy} type="button" onClick={() => handleUpgradeClick("monthly", "upgrade_now")}>
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
