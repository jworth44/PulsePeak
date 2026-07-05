import React, { useEffect, useState } from "react";

// Honest PWA install affordance.
//
// - On Chromium/Android the browser fires `beforeinstallprompt` only when the
//   app actually meets the installability criteria (manifest + SW + icons +
//   served over a secure origin). We stash that event and show a real Install
//   button that triggers the native prompt. If the event never fires, nothing
//   renders — no dead button, no fake "install" that does nothing.
// - iOS Safari never fires `beforeinstallprompt` and has no programmatic
//   install API, so there we show a short, honest instruction (Share → Add to
//   Home Screen) instead of a button that could not work.
// - When the app is already installed (standalone display mode) we render
//   nothing. A dismissal is remembered so we don't nag.

const DISMISS_KEY = "pulsepeak-install-dismissed-at";
const DISMISS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOsDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch points.
  const iPadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iOsDevice || iPadOs;
}

function wasRecentlyDismissed() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const when = Number(raw);
    return Number.isFinite(when) && Date.now() - when < DISMISS_WINDOW_MS;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mode, setMode] = useState(null); // "prompt" | "ios" | null

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) {
      return undefined;
    }

    const onBeforeInstallPrompt = (event) => {
      // Suppress the default mini-infobar; we present our own affordance.
      event.preventDefault();
      setDeferredPrompt(event);
      setMode("prompt");
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setMode(null);
      try {
        window.localStorage.removeItem(DISMISS_KEY);
      } catch {
        // Non-fatal — cosmetic persistence only.
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS has no install event — offer the manual instruction instead.
    if (isIos()) {
      setMode("ios");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setMode(null);
    setDeferredPrompt(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Non-fatal.
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      // User dismissed the native sheet — treat as a dismissal.
    }
    dismiss();
  };

  if (!mode) {
    return null;
  }

  return (
    <div className="install-prompt" role="dialog" aria-label="Install PulsePeak">
      <div className="install-prompt-icon" aria-hidden="true">
        <img src="/icon-192.png" alt="" width="44" height="44" />
      </div>
      <div className="install-prompt-body">
        <strong>Install PulsePeak</strong>
        {mode === "ios" ? (
          <p>
            Tap the Share button, then <b>Add to Home Screen</b> for the full
            app experience.
          </p>
        ) : (
          <p>Add it to your device for instant, full-screen access — offline-ready.</p>
        )}
      </div>
      <div className="install-prompt-actions">
        {mode === "prompt" ? (
          <button className="install-prompt-cta" type="button" onClick={install}>
            Install
          </button>
        ) : null}
        <button
          className="install-prompt-dismiss"
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
      </div>
    </div>
  );
}
