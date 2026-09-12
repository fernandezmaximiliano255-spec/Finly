import React, { useState } from 'react';

const emptyRegistration = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
};

function validateField(name, value) {
  if (!value.trim()) return 'Campo obligatorio';
  if ((name === 'firstName' || name === 'lastName') && !/^[a-záéíóúüñ ]{2,30}$/i.test(value)) return 'Usá solo letras, entre 2 y 30 caracteres';
  if (name === 'phone' && !/^\d{8,10}$/.test(value)) return 'Usá solo números, entre 8 y 10';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email incorrecto';
  if (name === 'password' && (!/^.{8,}$/.test(value) || !/[A-ZÁÉÍÓÚÜÑ]/.test(value) || !/\d/.test(value))) return 'Mínimo 8 caracteres, una mayúscula y un número';
  return '';
}

export function RegisterPage({ onRegister, onBack }) {
  const [form, setForm] = useState(emptyRegistration);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setSuccessMessage('');
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((currentErrors) => ({ ...currentErrors, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(Object.keys(form).map((field) => [field, validateField(field, form[field])]));
    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    const result = await onRegister({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone, email: form.email.trim() }, form.password);
    if (result?.error) {
      setErrors({ email: result.error });
      return;
    }
    setSuccessMessage(result.needsConfirmation ? 'Cuenta creada. Revisá tu correo para confirmar la dirección antes de iniciar sesión.' : 'Cuenta creada correctamente. Ya podés iniciar sesión.');
    setForm(emptyRegistration);
    setErrors({});
  }

  return (
    <div className="register-page">
      <header className="projects-page-header">
        <div><button className="auth-back-button" type="button" onClick={onBack}>← Volver al inicio</button><p className="eyebrow">CUENTA</p><h1>Crear cuenta</h1><p className="page-subtitle">Registrate para comenzar a usar Finly con tus propios datos.</p></div>
      </header>

      <form className="project-form register-form" onSubmit={handleSubmit}>
        <div className="form-header"><div><h2>Datos de registro</h2><p>Todos los campos son obligatorios.</p></div></div>
        {successMessage && <div className="form-success-banner">{successMessage}</div>}
        <div className="form-grid">
          <label>Nombre<input className={errors.firstName ? 'input-error' : ''} name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Maximiliano" />{errors.firstName && <span className="field-error">{errors.firstName}</span>}</label>
          <label>Apellido<input className={errors.lastName ? 'input-error' : ''} name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: Fernández" />{errors.lastName && <span className="field-error">{errors.lastName}</span>}</label>
          <label>Teléfono<input className={errors.phone ? 'input-error' : ''} name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} inputMode="numeric" placeholder="Entre 8 y 10 números" />{errors.phone && <span className="field-error">{errors.phone}</span>}</label>
          <label className="wide-field">Correo electrónico<input className={errors.email ? 'input-error' : ''} name="email" type="text" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: nombre@email.com" />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          <label>Contraseña<input className={errors.password ? 'input-error' : ''} name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Mínimo 8 caracteres" />{errors.password && <span className="field-error">{errors.password}</span>}</label>
        </div>
        <button className="primary-button" type="submit">Registrarme</button>
      </form>
    </div>
  );
}
