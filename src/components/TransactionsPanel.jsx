import React from 'react';
import { formatMovementDate } from '../dateUtils';

export function TransactionsPanel({ transactions }) {
  return (
    <section className="panel transactions-panel">
      <div className="panel-heading compact"><h2>Movimientos recientes</h2><a href="#">Ver todos los movimientos</a></div>
      <div className="transaction-table">
        <div className="table-row table-header"><span>FECHA</span><span>DESCRIPCIÓN</span><span>PROYECTO</span><span>MONTO</span></div>
        {transactions.map((transaction) => (
          <div className="table-row" key={`${transaction.date}-${transaction.description}`}>
            <span>{formatMovementDate(transaction.date)}</span><strong>{transaction.description}</strong><span>{transaction.project}</span><strong className={transaction.type}>{transaction.amount}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
