import React, { useState } from 'react';

export function LoginPage({ onLogin, onBack }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setLoginError('');
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    const error = !value.trim() ? 'Campo obligatorio' : name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Formato de email incorrecto' : '';
    setErrors((currentErrors) => ({ ...currentErrors, [name]: error }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Campo obligatorio';
    if (!form.password) nextErrors.password = 'Campo obligatorio';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Formato de email incorrecto';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await onLogin(form.email.trim(), form.password);
    if (result?.error) setLoginError(result.error);
  }

  return (
    <div className="login-page">
      <header className="projects-page-header">
        <div><button className="auth-back-button" type="button" onClick={onBack}>← Volver al inicio</button><p className="eyebrow">CUENTA</p><h1>Iniciar sesión</h1><p className="page-subtitle">Ingresá a Finly para ver tus proyectos y movimientos.</p></div>
      </header>
      <form className="project-form login-form" onSubmit={handleSubmit}>
        <div className="form-header"><div><h2>Bienvenido nuevamente</h2><p>Usá el correo y la contraseña de tu cuenta.</p></div></div>
        {loginError && <div className="form-error-banner">{loginError}</div>}
        <div className="form-grid">
          <label>Correo electrónico<input className={errors.email ? 'input-error' : ''} name="email" type="text" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="Ej: nombre@email.com" />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          <label>Contraseña<div className="password-input-wrap"><input className={errors.password ? 'input-error' : ''} name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Tu contraseña" /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? '◉' : '◌'}</button></div>{errors.password && <span className="field-error">{errors.password}</span>}</label>
        </div>
        <button className="primary-button" type="submit">Ingresar</button>
      </form>
    </div>
  );
}
