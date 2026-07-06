import React, { useEffect, useMemo, useRef } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { haptic } from "../lib/haptics";

// A cinematic, reusable "moment" overlay for the emotional peaks of the app —
// finishing a workout, hitting a milestone, a personal record. It takes over the
// screen briefly with a Volt-lime burst, count-up numbers, and a haptic pulse,
// then settles. Everything it shows is passed in from real data (no fabricated
// stats). Fully honest, fully on the design system's reserved celebration
// language (--ease-spring, --grad-volt, --volt-glow, --dur-count) and respects
// prefers-reduced-motion.

const PARTICLE_COUNT = 20;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function CountUpNumber({ value, decimals = 0, className }) {
  const display = useCountUp(value, { duration: 1000, decimals });
  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatted}
    </span>
  );
}

export default function CelebrationOverlay({
  open,
  onClose,
  variant = "session", // "session" | "milestone" | "pr"
  eyebrow = "Session complete",
  title = "Nice work.",
  hero, // { value, label, decimals }
  stats = [], // [{ value, label }]
  autoDismissMs = 5000,
}) {
  const reduce = prefersReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Stable particle field per mount (angle/distance/delay/size).
  const particles = useMemo(() => {
    if (reduce) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * 360 + (i % 3) * 14;
      const distance = 120 + ((i * 37) % 140);
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        tx: `${Math.cos(rad) * distance}px`,
        ty: `${Math.sin(rad) * distance}px`,
        delay: `${(i % 5) * 40}ms`,
        size: `${6 + ((i * 13) % 8)}px`,
        volt: i % 3 !== 0,
      };
    });
  }, [reduce]);

  useEffect(() => {
    if (!open) return undefined;
    haptic(variant === "session" ? "success" : "celebrate");
    const key = (event) => {
      if (event.key === "Escape") closeRef.current?.();
    };
    window.addEventListener("keydown", key);
    const timer = window.setTimeout(() => closeRef.current?.(), autoDismissMs);
    return () => {
      window.removeEventListener("keydown", key);
      window.clearTimeout(timer);
    };
  }, [open, variant, autoDismissMs]);

  if (!open) return null;

  return (
    <div
      className={`celebration-overlay celebration-${variant}${reduce ? " celebration-reduced" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="celebration-burst" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`celebration-particle${p.volt ? " celebration-particle-volt" : ""}`}
            style={{
              "--tx": p.tx,
              "--ty": p.ty,
              "--delay": p.delay,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div className="celebration-card" onClick={(event) => event.stopPropagation()}>
        <p className="celebration-eyebrow">{eyebrow}</p>
        <h2 className="celebration-title">{title}</h2>

        {hero ? (
          <div className="celebration-hero">
            <CountUpNumber
              className="celebration-hero-value"
              value={hero.value}
              decimals={hero.decimals || 0}
            />
            <span className="celebration-hero-label">{hero.label}</span>
          </div>
        ) : null}

        {stats.length ? (
          <div className="celebration-stats">
            {stats.map((stat) => (
              <div className="celebration-stat" key={stat.label}>
                <CountUpNumber
                  className="celebration-stat-value"
                  value={stat.value}
                  decimals={stat.decimals || 0}
                />
                <span className="celebration-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <button className="celebration-continue" type="button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
