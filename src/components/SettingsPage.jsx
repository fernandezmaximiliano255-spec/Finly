import React, { useState } from 'react';

export const defaultSettings = {
  name: 'Maximiliano',
  currency: 'ARS',
  email: '',
  mobile: '',
};

export function SettingsPage({ settings, onSettingsChange, onClearData }) {
  const [form, setForm] = useState(settings);
  const [savedMessage, setSavedMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setSavedMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSettingsChange(form);
    setSavedMessage('Cambios guardados correctamente.');
  }

  function handleClearData() {
    if (window.confirm('¿Seguro que querés borrar todos los datos guardados? Esta acción no se puede deshacer.')) {
      onClearData();
    }
  }

  return (
    <div className="settings-page">
      <header className="projects-page-header">
        <div><p className="eyebrow">CUENTA</p><h1>Configuración</h1><p className="page-subtitle">Personalizá tu espacio y tus datos personales.</p></div>
      </header>

      <form className="project-form settings-form" onSubmit={handleSubmit}>
        <div className="form-header"><div><h2>Preferencias</h2><p>Estos datos se guardan solo en tu aplicación.</p></div></div>
        <div className="form-grid">
          <label>Nombre<input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Maximiliano" /></label>
          <label>Moneda<select name="currency" value={form.currency} onChange={handleChange}><option value="ARS">Peso argentino (ARS)</option><option value="USD">Dólar estadounidense (USD)</option><option value="EUR">Euro (EUR)</option></select></label>
        </div>

        <div className="settings-section-title"><h2>Datos personales</h2><p>Podés completar estos datos cuando tengas un registro de usuario.</p></div>
        <div className="form-grid">
          <label>Correo electrónico<input name="email" type="text" value={form.email} onChange={handleChange} placeholder="Ej: nombre@email.com" /></label>
          <label>Número celular<input name="mobile" inputMode="numeric" value={form.mobile} onChange={handleChange} placeholder="Ej: 1123456789" /></label>
        </div>
        <div className="settings-actions"><button className="primary-button" type="submit">Guardar cambios</button>{savedMessage && <span className="saved-message">{savedMessage}</span>}</div>
      </form>

      <section className="danger-zone">
        <div><h2>Borrar datos guardados</h2><p>Elimina proyectos, movimientos, clientes y preferencias de este dispositivo.</p></div>
        <button className="delete-data-button" onClick={handleClearData}>Borrar todos los datos</button>
      </section>
    </div>
  );
}
