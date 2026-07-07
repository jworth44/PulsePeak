import React, { useLayoutEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { applyThemePreference, getStoredThemePreference, initThemeSync } from "../config/themes";
import InstallPrompt from "./InstallPrompt";

// Creative Direction V2 — Product Shell.
// The desktop sidebar is retired. Both viewports share one centered content
// column and four primary doors — Today · Train · Progress · You — as a
// centered top pill (desktop) and a fixed bottom tab bar (mobile). Each door
// that owns sub-pages surfaces them as a contextual secondary nav at the top of
// the column, so no route is stranded. See CREATIVE_DIRECTION_V2.md §Structure.

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isPremium, dashboard } = useAuth();
  const hiddenModules = dashboard?.profile?.hiddenModules || [];

  useLayoutEffect(() => {
    applyThemePreference(getStoredThemePreference());
    return initThemeSync();
  }, []);

  const doors = useMemo(() => {
    const shows = (module) => !hiddenModules.includes(module);

    const trainItems = [
      { to: "/workouts", label: "Workouts" },
      { to: "/plan", label: "Plan" },
      { to: "/exercise-library", label: "Exercise Library" },
      shows("mobility") ? { to: "/mobility", label: "Mobility" } : null,
      shows("nutrition") ? { to: "/nutrition", label: "Nutrition" } : null
    ].filter(Boolean);

    const progressItems = [
      shows("progress") ? { to: "/progress", label: "Progress" } : null,
      shows("coach") ? { to: "/coach", label: "Coach" } : null
    ].filter(Boolean);

    const youItems = [
      { to: "/preferences?section=account", label: "Account" },
      { to: "/preferences?section=preferences", label: "Preferences" },
      { to: "/preferences?section=appearance", label: "Appearance" },
      { to: "/preferences?section=modules", label: "Module Visibility" }
    ];

    return [
      { id: "today", label: "Today", icon: "home", to: "/", items: [] },
      { id: "train", label: "Train", icon: "dumbbell", to: "/workouts", items: trainItems },
      progressItems.length
        ? { id: "progress", label: "Progress", icon: "trend", to: progressItems[0].to, items: progressItems }
        : null,
      { id: "you", label: "You", icon: "user", to: "/preferences?section=account", items: youItems }
    ].filter(Boolean);
  }, [hiddenModules]);

  const activeId = doorForPath(location);
  const activeDoor = doors.find((door) => door.id === activeId) || null;
  // A single-item section needs no secondary nav — the door already lands there.
  const subItems = activeDoor && activeDoor.items.length > 1 ? activeDoor.items : [];

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link to="/" className="app-brand" aria-label="PulsePeak — Today">
            <span className="app-brand-word">PulsePeak</span>
          </Link>

          <nav className="primary-pill" aria-label="Primary">
            {doors.map((door) => {
              const active = door.id === activeId;
              return (
                <Link
                  key={door.id}
                  to={door.to}
                  className={`primary-pill-link${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <TabIcon name={door.icon} />
                  <span>{door.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            className="topbar-profile"
            type="button"
            onClick={() => navigate("/preferences?section=account")}
            aria-label="Your account and settings"
          >
            <span className="topbar-profile-name">{user?.name || "You"}</span>
            <span className="topbar-profile-tier">
              {user?.accessLabel || (isPremium ? "Premium" : "Free")}
            </span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="app-column">
          {subItems.length ? (
            <nav className="section-subnav" aria-label={activeDoor.label}>
              {subItems.map((item) => {
                const active = isSubActive(item, location);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`section-subnav-link${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          {children}
        </div>
      </main>

      <nav className="mobile-tabbar" aria-label="Primary">
        {doors.map((door) => {
          const active = door.id === activeId;
          return (
            <Link
              key={door.id}
              to={door.to}
              className={`mobile-tab${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <TabIcon name={door.icon} />
              <span>{door.label}</span>
            </Link>
          );
        })}
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
    case "trend":
      return (
        <svg {...common}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    default:
      return null;
  }
}

function matchAny(pathname, routes) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function doorForPath(location) {
  const { pathname } = location;
  if (pathname === "/") return "today";
  if (matchAny(pathname, ["/workouts", "/plan", "/exercise-library", "/mobility", "/nutrition"])) return "train";
  if (matchAny(pathname, ["/progress", "/coach"])) return "progress";
  if (pathname === "/preferences" || pathname.startsWith("/preferences/")) return "you";
  return null;
}

function isSubActive(item, location) {
  const [path, query] = item.to.split("?");
  if (query && query.includes("section=")) {
    if (!(location.pathname === "/preferences" || location.pathname.startsWith("/preferences/"))) {
      return false;
    }
    const target = new URLSearchParams(query).get("section");
    const current = new URLSearchParams(location.search).get("section") || "preferences";
    return current === target;
  }
  return location.pathname === path || location.pathname.startsWith(`${path}/`);
}
