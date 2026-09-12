import React from 'react';

export function Sidebar({ activeLink, onNavigate, session }) {
  const links = ['Resumen', 'Proyectos', 'Movimientos', 'Clientes', 'Informe general'];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">finly</div>
        <div className="workspace-label">ESPACIO PERSONAL</div>
        <nav className="nav-list" aria-label="Navegación principal">
          {links.map((link, index) => (
            <a className={`nav-link ${activeLink === link ? 'active' : ''}`} href="#" key={link} onClick={(event) => { event.preventDefault(); onNavigate(link); }}>
              {link}
            </a>
          ))}
        </nav>
      </div>
      <div className="sidebar-footer">
        <a className="nav-link" href="#" onClick={(event) => { event.preventDefault(); onNavigate('Configuración'); }}>Configuración</a>
        <a className="nav-link" href="#" onClick={(event) => { event.preventDefault(); onNavigate('Centro de ayuda'); }}>Centro de ayuda</a>
      </div>
    </aside>
  );
}
