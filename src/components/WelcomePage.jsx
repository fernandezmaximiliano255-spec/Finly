import React from 'react';

export function WelcomePage({ onNavigate }) {
  return (
    <main className="welcome-page">
      <section className="welcome-brand">
        <div className="welcome-logo">finly</div>
        <p>Tu espacio simple para ordenar tu trabajo independiente.</p>
      </section>

      <section className="welcome-content">
        <span className="welcome-kicker">GESTIÓN PARA FREELANCERS</span>
        <h1>Bienvenido a Finly</h1>
        <p>Acá podés organizar tus proyectos, clientes, ingresos y gastos en un solo lugar, de forma clara y sencilla.</p>
        <div className="welcome-actions">
          <button className="welcome-button welcome-button-secondary" onClick={() => onNavigate('Registro')}>Registrarte</button>
          <button className="welcome-button welcome-button-primary" onClick={() => onNavigate('Iniciar sesión')}>Iniciar sesión</button>
        </div>
      </section>

      <span className="welcome-footer">Una forma más simple de llevar tu negocio.</span>
    </main>
  );
}
