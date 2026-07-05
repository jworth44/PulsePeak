import React from "react";
import { Link } from "react-router-dom";

const BRAND_LOGO = "/brand/pulsepeak-main-logo.png";

/**
 * Lightweight chrome for publicly-reachable pages (legal, help, contact) so
 * they render for logged-out visitors without the authenticated AppShell.
 */
export default function PublicPageLayout({ children }) {
  return (
    <div className="public-page">
      <header className="public-page-header">
        <Link className="public-brand" to="/">
          <img src={BRAND_LOGO} alt="PulsePeak" />
        </Link>
        <nav className="public-nav">
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link className="public-nav-cta" to="/">Sign in</Link>
        </nav>
      </header>
      <main className="public-page-main">{children}</main>
      <footer className="public-page-footer">
        <p className="muted">© {new Date().getFullYear()} PulsePeak. All rights reserved.</p>
        <nav className="public-footer-nav">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/help">Help Center</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
