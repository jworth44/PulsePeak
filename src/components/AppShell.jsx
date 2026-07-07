import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { applyThemePreference, getStoredThemePreference, initThemeSync } from "../config/themes";
import InstallPrompt from "./InstallPrompt";

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
          { type: "link", to: "/exercise-library", label: "Exercise Library" },
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
  const mobileTabs = useMemo(
    () =>
      [
        { to: "/", label: "Today", end: true, icon: "home" },
        { to: "/workouts", label: "Workouts", icon: "dumbbell" },
        { to: "/exercise-library", label: "Library", icon: "grid" },
        !hiddenModules.includes("nutrition") ? { to: "/nutrition", label: "Nutrition", icon: "utensils" } : null,
        !hiddenModules.includes("progress") ? { to: "/progress", label: "Progress", icon: "trend" } : { to: "/plan", label: "Plan", icon: "calendar" }
      ].filter(Boolean),
    [hiddenModules]
  );

  const [activeGroup, setActiveGroup] = useState(() => getGroupForRoute(location, navGroups) || "training");

  useLayoutEffect(() => {
    applyThemePreference(getStoredThemePreference());
    return initThemeSync();
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
            <h1>PulsePeak</h1>
            <p className="muted">Your training companion</p>
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

            {selectedGroup.items.length > 1 ? (
            <div className="sidebar-submenu-panel">
              <div className="sidebar-submenu-header">
                <p className="section-label">{selectedGroup.label}</p>
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
            ) : null}
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

      <nav className="mobile-tabbar" aria-label="Primary">
        {mobileTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `mobile-tab${isActive ? " active" : ""}`}
          >
            <TabIcon name={tab.icon} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      <InstallPrompt />
    </div>
  );
}

function TabIcon({ name }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 9.8 12 3l9 6.8" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg {...common}>
          <path d="M6.5 6.5v11M4 8.5v7M17.5 6.5v11M20 8.5v7M6.5 12h11" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );
    case "utensils":
      return (
        <svg {...common}>
          <path d="M4 3v6a2 2 0 0 0 4 0V3" />
          <path d="M6 9v12" />
          <path d="M17 3c-1.7 1-2.5 3.2-2.5 5.5 0 1.4 1 2.5 2.5 2.5V21" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
          <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        </svg>
      );
    default:
      return null;
  }
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
