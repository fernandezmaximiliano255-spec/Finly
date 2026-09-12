import React, { useEffect, useState } from 'react';

const emptyProject = {
  client: '',
  work: '',
  amount: '',
  status: 'Pendiente',
};

export function ProjectsPage({ projects, onProjectsChange, onProjectSave, onProjectDelete, projectToEdit, onEditHandled }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProject);
  const [editingIndex, setEditingIndex] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!projectToEdit) return;
    const projectIndex = projects.indexOf(projectToEdit);
    if (projectIndex === -1) return;
    setForm(projectToEdit);
    setEditingIndex(projectIndex);
    setMenuIndex(null);
    setErrors({});
    setShowForm(true);
    onEditHandled();
  }, [projectToEdit, projects, onEditHandled]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.client.trim()) nextErrors.client = 'Campo faltante';
    if (!form.work.trim()) nextErrors.work = 'Campo faltante';
    if (!form.amount.trim()) nextErrors.amount = 'Campo faltante';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const projectToSave = { ...form, createdAt: form.createdAt || Date.now() };

    if (editingIndex === null) {
      if (onProjectSave) onProjectSave(projectToSave, null);
      else onProjectsChange([...projects, projectToSave]);
    } else {
      if (onProjectSave) onProjectSave(projectToSave, editingIndex);
      else onProjectsChange(projects.map((project, index) => (index === editingIndex ? projectToSave : project)));
    }

    setForm(emptyProject);
    setErrors({});
    setShowForm(false);
    setEditingIndex(null);
  }

  function handleEdit(index) {
    setForm(projects[index]);
    setEditingIndex(index);
    setMenuIndex(null);
    setErrors({});
    setShowForm(true);
  }

  function handleDelete(index) {
    if (onProjectDelete) onProjectDelete(projects[index], index);
    else onProjectsChange(projects.filter((_, projectIndex) => projectIndex !== index));
    setMenuIndex(null);
  }

  return (
    <div className="projects-page">
      <header className="projects-page-header">
        <div>
          <p className="eyebrow">GESTIÓN</p>
          <h1>Proyectos</h1>
          <p className="page-subtitle">Organizá tus trabajos, clientes e ingresos.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(true)}>+ Nuevo proyecto</button>
      </header>

      {showForm && (
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div><h2>{editingIndex === null ? 'Nuevo proyecto' : 'Editar proyecto'}</h2><p>Completá los datos del trabajo.</p></div>
            <button type="button" className="close-button" onClick={() => { setShowForm(false); setEditingIndex(null); setErrors({}); }}>×</button>
          </div>
          <div className="form-grid">
            <label>Cliente<input className={errors.client ? 'input-error' : ''} name="client" value={form.client} onChange={handleChange} placeholder="Ej: Gym Center" />{errors.client && <span className="field-error">{errors.client}</span>}</label>
            <label>Trabajo realizado<input className={errors.work ? 'input-error' : ''} name="work" value={form.work} onChange={handleChange} placeholder="Ej: Página web" />{errors.work && <span className="field-error">{errors.work}</span>}</label>
            <label>Monto<input className={errors.amount ? 'input-error' : ''} name="amount" value={form.amount} onChange={handleChange} placeholder="Ej: $2.400" />{errors.amount && <span className="field-error">{errors.amount}</span>}</label>
            <label>Estado<select name="status" value={form.status} onChange={handleChange}><option>Cobrado</option><option>Pendiente</option></select></label>
          </div>
          <button className="primary-button" type="submit">{editingIndex === null ? 'Guardar proyecto' : 'Guardar cambios'}</button>
        </form>
      )}

      <section className="projects-page-list">
        <div className="list-header"><h2>Todos tus proyectos</h2><span>{projects.length} proyectos</span></div>
        <div className="project-cards">
          {projects.map((project, index) => (
            <article className="project-card" key={`${project.client}-${index}`}>
              <div className="project-card-top">
                <span className={`status ${project.status === 'Cobrado' ? 'paid' : 'pending'}`}>{project.status}</span>
                <div className="project-actions">
                  <button className="more-button" aria-label="Más opciones" onClick={() => setMenuIndex(menuIndex === index ? null : index)}>•••</button>
                  {menuIndex === index && (
                    <div className="project-menu">
                      <button onClick={() => handleEdit(index)}>Editar</button>
                      <button className="delete-action" onClick={() => handleDelete(index)}>Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
              <h3>{project.client}</h3>
              <p>{project.work}</p>
              <strong>{project.amount}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
