import React, { useState } from 'react';

const emptyClient = {
  name: '',
  landline: '',
  mobile: '',
  email: '',
};

export function ClientsPage({ clients, onClientsChange, onClientSave, onClientDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  }

  function validateField(name, value) {
    if (!value) return '';
    if (name === 'landline' && !/^\d{8}$/.test(value)) return 'Formato incorrecto. Usá exactamente 8 números';
    if (name === 'mobile' && !/^\d{10}$/.test(value)) return 'Formato incorrecto. Usá exactamente 10 números';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato incorrecto. Usá un email válido';
    return '';
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((currentErrors) => ({ ...currentErrors, [name]: validateField(name, value) }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Campo faltante';
    const landlineError = validateField('landline', form.landline);
    const mobileError = validateField('mobile', form.mobile);
    const emailError = validateField('email', form.email);
    if (landlineError) nextErrors.landline = landlineError;
    if (mobileError) nextErrors.mobile = mobileError;
    if (emailError) nextErrors.email = emailError;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const clientToSave = { ...form, createdAt: form.createdAt || Date.now() };
    if (onClientSave) onClientSave(clientToSave, editingIndex);
    else if (editingIndex === null) onClientsChange([...clients, clientToSave]);
    else onClientsChange(clients.map((client, index) => (index === editingIndex ? clientToSave : client)));
    setForm(emptyClient);
    setErrors({});
    setShowForm(false);
    setEditingIndex(null);
  }

  function handleEdit(client, index) {
    setForm(client);
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  }

  function handleDelete(clientToDelete) {
    if (onClientDelete) onClientDelete(clientToDelete);
    else onClientsChange(clients.filter((client) => client !== clientToDelete));
  }

  return (
    <div className="clients-page">
      <header className="projects-page-header">
        <div>
          <p className="eyebrow">GESTIÓN</p>
          <h1>Clientes</h1>
          <p className="page-subtitle">Guardá los datos de las personas y negocios con los que trabajás.</p>
        </div>
        <button className="primary-button" onClick={() => { setForm(emptyClient); setEditingIndex(null); setErrors({}); setShowForm(true); }}>+ Agregar nuevo cliente</button>
      </header>

      {showForm && (
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div><h2>{editingIndex === null ? 'Nuevo cliente' : 'Editar cliente'}</h2><p>Completá los datos del cliente.</p></div>
            <button type="button" className="close-button" onClick={() => { setShowForm(false); setForm(emptyClient); setEditingIndex(null); setErrors({}); }}>×</button>
          </div>
          <div className="form-grid">
            <label>Nombre del cliente<input className={errors.name ? 'input-error' : ''} name="name" value={form.name} onChange={handleChange} placeholder="Ej: Gym Center" />{errors.name && <span className="field-error">{errors.name}</span>}</label>
            <label>Teléfono fijo<input className={errors.landline ? 'input-error' : ''} name="landline" value={form.landline} onChange={handleChange} onBlur={handleBlur} inputMode="numeric" placeholder="Ej: 44444444" />{errors.landline && <span className="field-error">{errors.landline}</span>}</label>
            <label>Número celular<input className={errors.mobile ? 'input-error' : ''} name="mobile" value={form.mobile} onChange={handleChange} onBlur={handleBlur} inputMode="numeric" placeholder="Ej: 1123456789" />{errors.mobile && <span className="field-error">{errors.mobile}</span>}</label>
            <label>Email<input className={errors.email ? 'input-error' : ''} name="email" type="text" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: contacto@email.com" />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          </div>
          <button className="primary-button" type="submit">{editingIndex === null ? 'Guardar cliente' : 'Guardar cambios'}</button>
        </form>
      )}

      <section className="clients-page-list">
        <div className="list-header"><h2>Todos tus clientes</h2><span>{clients.length} clientes</span></div>
        {clients.length === 0 ? <p className="empty-state">Todavía no agregaste ningún cliente.</p> : (
          <div className="clients-list">
            {clients.map((client, index) => (
              <article className="client-row" key={`${client.name}-${index}`}>
                <div><strong>Nombre del cliente: {client.name}</strong><span>Correo electrónico: {client.email || 'Sin correo electrónico'}</span></div>
                <div className="client-contact"><span>{client.landline ? `Teléfono fijo: ${client.landline}` : 'Sin teléfono fijo'}</span><span>{client.mobile ? `Número celular: ${client.mobile}` : 'Sin número celular'}</span></div>
                <div className="client-actions"><button className="edit-client" onClick={() => handleEdit(client, index)}>Editar</button><button className="delete-client" onClick={() => handleDelete(client)}>Eliminar</button></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
