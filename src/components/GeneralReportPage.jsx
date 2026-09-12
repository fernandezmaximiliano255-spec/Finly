import React, { useMemo, useState } from 'react';

function amountToNumber(amount) {
  return Number(String(amount).replace(/[^0-9]/g, '')) || 0;
}

function formatAmount(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

function dateToTimestamp(date) {
  if (!date) return 0;
  if (date === 'Hoy') return new Date().setHours(0, 0, 0, 0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  const legacyDate = date.match(/^(\d{1,2})\s+([a-záé]+)$/i);
  if (legacyDate) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months.indexOf(legacyDate[2].toLowerCase());
    if (month !== -1) return new Date(new Date().getFullYear(), month, Number(legacyDate[1])).getTime();
  }

  return 0;
}

function timestampToMonthKey(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export function GeneralReportPage({ projects, transactions }) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const monthOptions = useMemo(() => {
    const monthKeys = new Set();
    projects.forEach((project) => {
      if (project.createdAt) monthKeys.add(timestampToMonthKey(project.createdAt));
    });
    transactions.forEach((transaction) => {
      const timestamp = dateToTimestamp(transaction.date);
      if (timestamp) monthKeys.add(timestampToMonthKey(timestamp));
    });
    monthKeys.add(timestampToMonthKey(Date.now()));
    return [...monthKeys].sort().reverse();
  }, [projects, transactions]);

  const isInSelectedMonth = (timestamp) => selectedMonth === 'all' || timestampToMonthKey(timestamp) === selectedMonth;
  const visibleProjects = projects.filter((project) => selectedMonth === 'all' || (project.createdAt && isInSelectedMonth(project.createdAt)));
  const visibleTransactions = transactions.filter((transaction) => selectedMonth === 'all' || isInSelectedMonth(dateToTimestamp(transaction.date)));
  const paidProjects = visibleProjects.filter((project) => project.status === 'Cobrado');
  const pendingProjects = visibleProjects.filter((project) => project.status === 'Pendiente');
  const income = paidProjects.reduce((total, project) => total + amountToNumber(project.amount), 0);
  const expenses = visibleTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + amountToNumber(transaction.amount), 0);
  const netBalance = income - expenses;

  return (
    <div className="report-page">
      <header className="projects-page-header">
        <div>
          <p className="eyebrow">ANÁLISIS</p>
          <h1>Informe general</h1>
          <p className="page-subtitle">Consultá los principales números de tu negocio.</p>
        </div>
        <select className="report-filter" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="Filtrar informe por período">
          <option value="all">Todo</option>
          {monthOptions.map((monthKey) => <option key={monthKey} value={monthKey}>{formatMonthLabel(monthKey)}</option>)}
        </select>
      </header>

      <section className="report-grid">
        <article className="report-card">
          <span>Ingresos del período</span>
          <strong className="report-positive">{formatAmount(income)}</strong>
        </article>
        <article className="report-card">
          <span>Gastos del período</span>
          <strong className="report-negative">{formatAmount(expenses)}</strong>
        </article>
        <article className="report-card">
          <span>Saldo neto</span>
          <strong className={netBalance >= 0 ? 'report-positive' : 'report-negative'}>{formatAmount(netBalance)}</strong>
        </article>
        <article className="report-card">
          <span>Proyectos cobrados y pendientes</span>
          <strong>{paidProjects.length} cobrados · {pendingProjects.length} pendientes</strong>
        </article>
      </section>
    </div>
  );
}
