import React from "react";
import { useCountUp } from "../hooks/useCountUp";

// Presentational count-up number: animates 0 -> value so stats feel alive.
// Tabular figures so the width doesn't jitter while counting. Formatting lives
// here; the hook stays presentation-agnostic.
export default function CountUp({ value, decimals = 0, duration = 900 }) {
  const n = useCountUp(Number.isFinite(value) ? value : 0, { duration, decimals });
  const text = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{text}</span>;
}
