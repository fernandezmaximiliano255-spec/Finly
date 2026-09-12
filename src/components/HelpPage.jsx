import React from 'react';

const frequentlyAsked = [
  { question: '¿Cómo agrego un proyecto?', answer: 'Entrá en Proyectos, elegí “Nuevo proyecto” y completá el cliente, el trabajo, el monto y el estado de cobro.' },
  { question: '¿Qué significa que un proyecto esté pendiente?', answer: 'Significa que el trabajo está registrado, pero todavía no fue cobrado. No suma ni resta dinero en tus métricas.' },
  { question: '¿Cómo se calcula el saldo neto?', answer: 'Se calculan los ingresos cobrados y se les restan los gastos registrados.' },
  { question: '¿Por qué un movimiento viejo no aparece en el resumen?', answer: 'El resumen muestra solo los movimientos recientes. Los movimientos anteriores siguen disponibles en la sección Movimientos.' },
];

export function HelpPage() {
  return (
    <div className="help-page">
      <header className="projects-page-header">
        <div><p className="eyebrow">SOPORTE</p><h1>Centro de ayuda</h1><p className="page-subtitle">Encontrá respuestas rápidas o comunicate con nosotros.</p></div>
      </header>

      <section className="help-contact">
        <div><h2>¿Necesitás ayuda?</h2><p>Podés comunicarte conmigo por cualquiera de estos medios.</p></div>
        <div className="help-contact-data"><span>Correo electrónico: <a href="mailto:fernendezmaxi@gmail.com">fernendezmaxi@gmail.com</a></span><span>Número celular: <a href="tel:+541167203422">1167203422</a></span></div>
      </section>

      <section className="faq-section">
        <h2>Preguntas frecuentes</h2>
        <div className="faq-list">{frequentlyAsked.map((item) => <article className="faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
      </section>
    </div>
  );
}
