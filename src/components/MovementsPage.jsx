import React, { useState } from 'react';
import { formatMovementDate } from '../dateUtils';

const emptyMovement = { description: '', project: '—', amount: '', type: 'expense', date: '' };

function movementDateTimestamp(movement) {
  if (movement.type === 'pending') return movement.createdAt || Date.now();
  if (movement.date === 'Hoy') return new Date().setHours(0, 0, 0, 0);

  if (/^\d{4}-\d{2}-\d{2}$/.test(movement.date)) {
    const [year, month, day] = movement.date.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  const legacyDate = movement.date.match(/^(\d{1,2})\s+([a-záé]+)$/i);
  if (legacyDate) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months.indexOf(legacyDate[2].toLowerCase());
    if (month !== -1) return new Date(new Date().getFullYear(), month, Number(legacyDate[1])).getTime();
  }

  return movement.createdAt || 0;
}

export function MovementsPage({ transactions, projects, onTransactionsChange, onMovementDelete, onPendingEdit, onPendingDelete }) {
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMovement);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const pendingProjects = projects
    .filter((project) => project.status === 'Pendiente')
    .map((project) => ({
      date: 'Pendiente',
      description: `Cobro pendiente de ${project.work}`,
      project: project.client,
      amount: '—',
      type: 'pending',
      virtual: true,
      createdAt: project.createdAt || Date.now(),
      projectData: project,
    }));
  const displayTransactions = [...transactions, ...pendingProjects]
    .sort((first, second) => movementDateTimestamp(second) - movementDateTimestamp(first));
  const filteredTransactions = filter === 'all' ? displayTransactions : displayTransactions.filter((transaction) => transaction.type === filter);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setFormMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.description.trim()) nextErrors.description = 'Campo faltante';
    if (!form.amount.trim()) nextErrors.amount = 'Campo faltante';
    if (!form.date.trim()) nextErrors.date = 'Campo faltante';
    if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) nextErrors.date = 'Formato incorrecto. Usá una fecha válida';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormMessage('Revisá los campos marcados en rojo antes de guardar.');
      return;
    }

    const numericAmount = form.amount.replace(/[^0-9]/g, '');
    const newMovement = { ...form, type: 'expense', amount: `-$${numericAmount}`, createdAt: form.createdAt || Date.now() };
    if (editingIndex === null) {
      onTransactionsChange([newMovement, ...transactions]);
    } else {
      onTransactionsChange(transactions.map((transaction, index) => (
        index === editingIndex ? { ...transaction, ...newMovement } : transaction
      )));
    }
    setForm(emptyMovement);
    setErrors({});
    setFormMessage('');
    setShowForm(false);
    setEditingIndex(null);
  }

  function handleDelete(index) {
    const movementToDelete = filteredTransactions[index];
    if (movementToDelete.virtual) return;
    onMovementDelete(movementToDelete);
  }

  function handleEdit(index) {
    const movementToEdit = filteredTransactions[index];
    if (movementToEdit.type !== 'expense') return;
    const transactionIndex = transactions.indexOf(movementToEdit);
    setEditingIndex(transactionIndex);
    setForm({
      ...movementToEdit,
      amount: movementToEdit.amount.replace(/[^0-9]/g, ''),
    });
    setErrors({});
    setFormMessage('');
    setShowForm(true);
  }

  return (
    <div className="movements-page">
      <header className="projects-page-header">
        <div><p className="eyebrow">ACTIVIDAD</p><h1>Movimientos</h1><p className="page-subtitle">Consultá tus cobros y registrá tus gastos.</p></div>
        <button className="primary-button" onClick={() => { setEditingIndex(null); setForm(emptyMovement); setShowForm(true); }}>+ Nuevo gasto</button>
      </header>

      {showForm && (
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-header"><div><h2>{editingIndex === null ? 'Nuevo gasto' : 'Editar gasto'}</h2><p>Completá los datos del gasto.</p></div><button type="button" className="close-button" onClick={() => { setShowForm(false); setEditingIndex(null); setErrors({}); setFormMessage(''); }}>×</button></div>
          {formMessage && <div className="form-error-banner">{formMessage}</div>}
          <div className="form-grid">
            <label>Descripción<input className={errors.description ? 'input-error' : ''} name="description" value={form.description} onChange={handleChange} placeholder="Ej: Suscripción de software" />{errors.description && <span className="field-error">{errors.description}</span>}</label>
            <label>Proyecto<select name="project" value={form.project} onChange={handleChange}><option>—</option>{projects.map((project) => <option key={project.client}>{project.client}</option>)}</select></label>
            <label>Monto<input className={errors.amount ? 'input-error' : ''} name="amount" value={form.amount} onChange={handleChange} placeholder="Ej: 2500" />{errors.amount && <span className="field-error">{errors.amount}</span>}</label>
            <label>Fecha<input className={errors.date ? 'input-error' : ''} type="date" name="date" value={form.date} onChange={handleChange} />{errors.date && <span className="field-error">{errors.date}</span>}</label>
          </div>
          <button className="primary-button" type="submit">{editingIndex === null ? 'Guardar gasto' : 'Guardar cambios'}</button>
        </form>
      )}

      <section className="panel movement-list-panel">
          <div className="list-header"><div><h2>Todos los movimientos</h2><span>{filteredTransactions.length} movimientos</span></div><select className="movement-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Todos</option><option value="income">Cobrados</option><option value="expense">Gastos</option><option value="pending">Pendientes</option></select></div>
        <div className="movement-list">
          {filteredTransactions.map((transaction, index) => (
            <div className="movement-row" key={`${transaction.date}-${transaction.description}-${index}`}>
              <div><strong>{transaction.description}</strong><span>{formatMovementDate(transaction.date)} · {transaction.project}</span></div>
              <div className={`movement-status ${transaction.type}`}>
                {transaction.type === 'pending' ? <><span className="pending-line" /> <span>Pendiente</span></> : <><span>{transaction.type === 'income' ? 'Cobrado' : 'Gasto'}</span><strong>{transaction.amount}</strong></>}
              </div>
              <div className="movement-actions">
                {transaction.type === 'expense' && <button className="edit-movement" onClick={() => handleEdit(index)}>Editar</button>}
                {transaction.type === 'pending' && <button className="edit-movement" onClick={() => onPendingEdit(transaction.projectData)}>Editar</button>}
                {transaction.virtual
                  ? <button className="delete-movement" onClick={() => onPendingDelete(transaction.projectData)}>Eliminar</button>
                  : <button className="delete-movement" onClick={() => handleDelete(index)}>Eliminar</button>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
