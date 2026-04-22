import React from "react";

export function BarChart({ points, valueKey = "score", suffix = "%" }) {
  return (
    <div className="weekly-bars">
      {points.map((point) => (
        <div className="bar-group" key={point.date}>
          <div className="bar" style={{ height: `${Math.max(point[valueKey], 18)}%` }} />
          <span className="bar-label">{point.date.slice(5)}</span>
          <span className="bar-value">
            {point[valueKey]}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ points, valueKey, min, max, suffix = "" }) {
  const width = 520;
  const height = 220;
  const padding = 18;
  const range = Math.max(max - min, 1);
  const coords = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
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
          <g key={points[index].date}>
            <circle className="line-chart-point" cx={x} cy={y} r="5" />
            <text className="line-chart-label" x={x} y={height - 2}>
              {points[index].date.slice(5)}
            </text>
            <text className="line-chart-value" x={x} y={y - 12}>
              {points[index][valueKey]}
              {suffix}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
