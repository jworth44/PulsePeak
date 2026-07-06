import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const BRAND_LOGO = "/brand/pulsepeak-main-logo.png";

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
        <div className="auth-brand">
          <img className="auth-brand-logo" src={BRAND_LOGO} alt="PulsePeak" />
        </div>
        <p className="badge">Personal training, remembered</p>
        <h1>Build better health momentum with a fitness workspace that remembers you.</h1>
        <p className="hero-text">
          PulsePeak turns every workout you log into personal momentum — spotting your records,
          protecting your streak, and telling you what matters most today.
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
        <nav className="auth-legal-footer">
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </section>
    </div>
  );
}
