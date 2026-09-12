import React from 'react';

export function MetricCard({ label, value, trend, tone }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {trend && <p className={`metric-trend ${tone}`}>{trend}</p>}
    </article>
  );
}
