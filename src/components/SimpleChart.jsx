import React from "react";

export function BarChart({ points, valueKey = "score", suffix = "%" }) {
  const safePoints = Array.isArray(points) ? points : [];
  return (
    <div className="weekly-bars">
      {safePoints.map((point, index) => {
        const label = formatChartLabel(point);
        return (
        <div className="bar-group" key={point.id || point.date || point.week || label || index}>
          <div className="bar" style={{ height: `${Math.max(point[valueKey], 18)}%` }} />
          <span className="bar-label">{label}</span>
          <span className="bar-value">
            {point[valueKey]}
            {suffix}
          </span>
        </div>
      )})}
    </div>
  );
}

export function LineChart({ points, valueKey, min, max, suffix = "" }) {
  const safePoints = Array.isArray(points) ? points : [];
  const width = 520;
  const height = 220;
  const padding = 18;
  const range = Math.max(max - min, 1);
  const coords = safePoints.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(safePoints.length - 1, 1);
    const y = height - padding - ((point[valueKey] - min) / range) * (height - padding * 2);
    return [x, y];
  });
  const path = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${valueKey} trend`}>
        <path className="line-chart-grid" d={`M ${padding} ${height - padding} L ${width - padding} ${height - padding}`} />
        <path className="line-chart-path" d={path} />
        {coords.map(([x, y], index) => (
          <g key={safePoints[index].id || safePoints[index].date || safePoints[index].week || index}>
            <circle className="line-chart-point" cx={x} cy={y} r="5" />
            <text className="line-chart-label" x={x} y={height - 2}>
              {formatChartLabel(safePoints[index])}
            </text>
            <text className="line-chart-value" x={x} y={y - 12}>
              {safePoints[index][valueKey]}
              {suffix}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatChartLabel(point = {}) {
  if (typeof point.date === "string" && point.date.length >= 5) {
    return point.date.slice(5);
  }

  if (typeof point.week === "string" && point.week.includes("-W")) {
    return point.week.split("-W")[1];
  }

  if (typeof point.label === "string" && point.label.trim()) {
    return point.label.trim();
  }

  return "--";
}
