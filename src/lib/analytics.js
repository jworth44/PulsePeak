import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Privacy-friendly, cookieless analytics scaffold. Dormant until the owner sets
 * `VITE_PLAUSIBLE_DOMAIN` at build time — no script loads and nothing is tracked
 * otherwise, so there is zero cost / no consent obligation by default.
 *
 * NOTE for launch: when enabling, the server CSP (server/server.js) must add the
 * analytics host to `script-src` and `connect-src`
 * (e.g. https://plausible.io), otherwise the script is blocked.
 */
let initialized = false;

export function initAnalytics() {
  if (initialized || typeof document === "undefined") return;
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return; // dormant
  initialized = true;
  const script = document.createElement("script");
  script.defer = true;
  script.setAttribute("data-domain", domain);
  script.src = import.meta.env.VITE_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

export function trackPageview(path) {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible("pageview", { u: window.location.origin + path });
  }
}

/** Hook: initializes analytics once and reports a pageview on each route change. */
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
