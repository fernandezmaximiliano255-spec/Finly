import React from 'react';

export function ProjectsPanel({ projects }) {
  return (
    <section className="panel projects-panel">
      <div className="panel-heading compact"><h2>Proyectos recientes</h2><a href="#">Ver todos</a></div>
      <div className="project-list">
        {projects.map((project) => (
          <div className="project-row" key={project.client}>
            <div><strong>{project.client}</strong><span>{project.work}</span></div>
            <strong className={project.status === 'Pendiente' ? 'pending-amount' : ''}>
              {project.status === 'Pendiente' ? '—' : project.amount}
            </strong>
            <span className={`status ${project.status === 'Cobrado' ? 'paid' : 'pending'}`}>{project.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
