import React from 'react';

export function RevenueChart({ data, totalRevenue }) {
  const lastActiveIndex = data.reduce((lastIndex, item, index) => (item.value > 0 ? index : lastIndex), -1);

  return (
    <section className="panel revenue-panel">
      <div className="panel-heading">
        <div><h2>Resumen de ingresos</h2><p>Desde tu registro · 7 meses</p></div>
        <div className="chart-total"><strong>${totalRevenue.toLocaleString('en-US')}</strong></div>
      </div>
      <div className="chart" aria-label="Ingresos de febrero a agosto">
        {data.map((item, index) => (
          <div className="bar-column" key={item.month}>
            <div className={`bar ${index === lastActiveIndex ? 'highlight' : ''}`} style={{ height: `${item.value}px` }} />
            <span>{item.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
