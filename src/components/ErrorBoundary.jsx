import React from "react";

/**
 * App-wide error boundary. Converts any uncaught render error into a branded,
 * recoverable fallback instead of a blank white screen. Also the hook point for
 * crash reporting (Sentry) once a DSN is configured.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surfaced to the crash reporter when one is wired (see reportError).
    if (typeof window !== "undefined" && typeof window.__pulsepeakReportError === "function") {
      try {
        window.__pulsepeakReportError(error, info);
      } catch {
        /* never let reporting throw */
      }
    }
    // Keep a console signal in all environments for local debugging.
    // eslint-disable-next-line no-console
    console.error("PulsePeak render error:", error, info);
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <p className="section-label">Something interrupted the session</p>
            <h2>We hit an unexpected snag.</h2>
            <p className="support-copy">
              Your data is safe. Reload to pick up where you left off — this usually clears it right away.
            </p>
            <div className="error-boundary-actions">
              <button type="button" className="primary-button" onClick={this.handleReload}>
                Reload PulsePeak
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
