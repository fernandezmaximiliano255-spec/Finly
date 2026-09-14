import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { supabase } from './supabaseClient';
import { projects as initialProjects, transactions as initialTransactions } from './data';
import { MetricCard } from './components/MetricCard';
import { ClientsPage } from './components/ClientsPage';
import { GeneralReportPage } from './components/GeneralReportPage';
import { defaultSettings, SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { WelcomePage } from './components/WelcomePage';
import { MovementsPage } from './components/MovementsPage';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ProjectsPage } from './components/ProjectsPage';
import { RevenueChart } from './components/RevenueChart';
import { Sidebar } from './components/Sidebar';
import { TransactionsPanel } from './components/TransactionsPanel';

function loadProjects() {
  const savedProjects = localStorage.getItem('finly-projects');
  if (!savedProjects) return initialProjects;

  try {
    return JSON.parse(savedProjects);
  } catch {
    return initialProjects;
  }
}

function loadStoredValue(key, fallback) {
  const savedValue = localStorage.getItem(key);
  if (!savedValue) return fallback;
  try {
    return JSON.parse(savedValue);
  } catch {
    return fallback;
  }
}

function userStorageKey(baseKey, userId) {
  return `${baseKey}-${userId}`;
}

function projectFromSupabase(row) {
  return {
    id: row.id,
    client: row.client,
    work: row.work,
    amount: `$${Number(row.amount).toLocaleString('en-US')}`,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function projectToSupabase(project, userId) {
  return {
    user_id: userId,
    client: project.client,
    work: project.work,
    amount: amountToNumber(project.amount),
    status: project.status,
  };
}

function clientFromSupabase(row) {
  return { id: row.id, name: row.name, landline: row.landline || '', mobile: row.mobile || '', email: row.email || '', createdAt: new Date(row.created_at).getTime() };
}

function clientToSupabase(client, userId) {
  return { user_id: userId, name: client.name, landline: client.landline || null, mobile: client.mobile || null, email: client.email || null };
}

function dateToISO(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (date === 'Hoy') return new Date().toISOString().slice(0, 10);
  const europeanDate = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (europeanDate) return `${europeanDate[3]}-${europeanDate[2]}-${europeanDate[1]}`;
  const legacyDate = date.match(/^(\d{1,2})\s+([a-záé]+)$/i);
  if (legacyDate) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months.indexOf(legacyDate[2].toLowerCase());
    if (month !== -1) return `${new Date().getFullYear()}-${String(month + 1).padStart(2, '0')}-${String(legacyDate[1]).padStart(2, '0')}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function movementFromSupabase(row) {
  return {
    id: row.id,
    description: row.description,
    project: row.projects?.client || '—',
    projectId: row.project_id,
    amount: `${row.type === 'expense' ? '-' : '+'}$${Number(row.amount).toLocaleString('en-US')}`,
    type: row.type,
    date: row.movement_date,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function movementToSupabase(movement, userId, projects) {
  const project = projects.find((item) => item.client === movement.project);
  return {
    user_id: userId,
    project_id: movement.projectId || project?.id || null,
    description: movement.description,
    amount: amountToNumber(movement.amount),
    type: movement.type,
    movement_date: dateToISO(movement.date),
  };
}

function loadTransactions() {
  const savedTransactions = localStorage.getItem('finly-transactions');
  if (!savedTransactions) return initialTransactions;

  try {
    return JSON.parse(savedTransactions);
  } catch {
    return initialTransactions;
  }
}

function loadClients() {
  const savedClients = localStorage.getItem('finly-clients');
  if (!savedClients) return [];

  try {
    return JSON.parse(savedClients);
  } catch {
    return [];
  }
}

function loadSettings() {
  const savedSettings = localStorage.getItem('finly-settings');
  if (!savedSettings) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(savedSettings) };
  } catch {
    return defaultSettings;
  }
}

function amountToNumber(amount) {
  return Number(amount.replace(/[^0-9]/g, '')) || 0;
}

function formatAmount(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

function getCurrentPeriodLabel() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const month = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(today).replace('.', '');
  return `1 ${month} – ${lastDay.getDate()} ${month}, ${today.getFullYear()}`;
}

function getFirstName(name) {
  return name.trim().split(/\s+/)[0] || 'usuario';
}

function getInitials(name) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return 'U';
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();
  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}

function buildRevenueChartData(transactions, registrationDate) {
  const startDate = new Date(registrationDate || Date.now());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short' });
  const monthlyIncome = Array.from({ length: 7 }, (_, index) => {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .filter((transaction) => {
        const timestamp = movementDateTimestamp(transaction);
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth()}` === monthKey;
      })
      .reduce((total, transaction) => total + amountToNumber(transaction.amount), 0);
    return { month: monthFormatter.format(monthDate).replace('.', ''), income };
  });
  const maxIncome = Math.max(...monthlyIncome.map((month) => month.income), 1);
  return monthlyIncome.map((month) => ({ month: month.month, value: month.income === 0 ? 0 : Math.max(24, Math.round((month.income / maxIncome) * 190)) }));
}

function movementDateTimestamp(movement) {
  if (movement.type === 'pending') return movement.createdAt || 0;

  if (movement.date === 'Hoy') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }

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

function syncProjectMovements(projects, transactions) {
  const linkedProjects = new Set();
  const keptTransactions = [];

  for (const transaction of transactions) {
    const linkedProject = projects.find((project) => (
      project.status === 'Cobrado' &&
      transaction.type === 'income' &&
      transaction.project === project.client
    ));

    if (!linkedProject) {
      const pendingProject = projects.find((project) => (
        project.status === 'Pendiente' &&
        transaction.type === 'income' &&
        transaction.project === project.client
      ));

      if (pendingProject) continue;
      keptTransactions.push(transaction);
      continue;
    }

    const projectKey = `${linkedProject.client}::${linkedProject.work}`;
    if (linkedProjects.has(projectKey)) continue;

    linkedProjects.add(projectKey);
    keptTransactions.push({
      ...transaction,
      source: 'project-payment',
      projectKey,
      createdAt: transaction.createdAt || 0,
      description: `Cobro de ${linkedProject.work}`,
      amount: `+$${amountToNumber(linkedProject.amount).toLocaleString('en-US')}`,
    });
  }

  const missingMovements = projects
    .filter((project) => project.status === 'Cobrado')
    .filter((project) => !linkedProjects.has(`${project.client}::${project.work}`))
    .map((project) => ({
      date: 'Hoy',
      description: `Cobro de ${project.work}`,
      project: project.client,
      amount: `+$${amountToNumber(project.amount).toLocaleString('en-US')}`,
      type: 'income',
      source: 'project-payment',
      projectKey: `${project.client}::${project.work}`,
      createdAt: Date.now(),
    }));

  return [...missingMovements, ...keptTransactions];
}

function AuthLayout({ children, type }) {
  const isRegister = type === 'register';
  return (
    <div className={`auth-shell auth-${type}`}>
      <section className="auth-showcase">
        <a className="auth-brand" href="#">finly</a>
        <div className="auth-showcase-copy">
          <p className="auth-kicker">{isRegister ? 'Tu próximo paso' : 'Tu espacio personal'}</p>
          <h2>{isRegister ? 'Empezá a ordenar tus finanzas.' : 'Todo lo importante, en un solo lugar.'}</h2>
          <p>{isRegister ? 'Creá tu cuenta y empezá a registrar proyectos, ingresos y gastos de forma simple.' : 'Volvé a tus proyectos y seguí avanzando con una visión clara de tu trabajo.'}</p>
        </div>
        <div className="auth-visual" aria-hidden="true">
          {isRegister ? <>
            <div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" />
            <div className="auth-step-card"><span>01</span><strong>Creá tu espacio</strong><small>Configurá tus datos personales</small></div>
            <div className="auth-step-card offset"><span>02</span><strong>Cargá tu primer proyecto</strong><small>Y empezá a ver tus avances</small></div>
          </> : <>
            <div className="auth-chart-card"><div className="auth-card-top"><span>Resumen mensual</span><strong>+18.4%</strong></div><div className="auth-bars"><i /><i /><i /><i /><i /></div><div className="auth-card-foot"><span>Ingresos</span><b>$8.420</b></div></div>
            <div className="auth-floating-card"><span className="auth-check">✓</span><div><strong>Proyecto cobrado</strong><small>Actualizado recién</small></div></div>
          </>}
        </div>
      </section>
      <div className="auth-content">{children}</div>
    </div>
  );
}

function App() {
  const [activeLink, setActiveLink] = useState('Resumen');
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(loadSettings);
  const [session, setSession] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  function handleProjectsChange(nextProjects) {
    setProjects(nextProjects);
  }

  async function handleProjectSave(project, editingIndex) {
    if (!session) {
      handleProjectsChange(editingIndex === null ? [...projects, project] : projects.map((item, index) => (index === editingIndex ? project : item)));
      return;
    }

    if (editingIndex === null) {
      const { data, error } = await supabase.from('projects').insert(projectToSupabase(project, session.user.id)).select().single();
      if (error) {
        window.alert('No se pudo guardar el proyecto en Supabase.');
        return;
      }
      setProjects((currentProjects) => [...currentProjects, projectFromSupabase(data)]);
      return;
    }

    const existingProject = projects[editingIndex];
    const { data, error } = await supabase.from('projects').update(projectToSupabase(project, session.user.id)).eq('id', existingProject.id).select().single();
    if (error) {
      window.alert('No se pudo actualizar el proyecto en Supabase.');
      return;
    }
    setProjects((currentProjects) => currentProjects.map((item, index) => (index === editingIndex ? projectFromSupabase(data) : item)));
  }

  async function handleProjectDelete(project, index) {
    if (!session || !project.id) {
      handleProjectsChange(projects.filter((_, projectIndex) => projectIndex !== index));
      return;
    }

    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      window.alert('No se pudo eliminar el proyecto en Supabase.');
      return;
    }
    setProjects((currentProjects) => currentProjects.filter((item) => item.id !== project.id));
  }

  async function handleClientSave(client, editingIndex) {
    if (!session) {
      setClients(editingIndex === null ? [...clients, client] : clients.map((item, index) => (index === editingIndex ? client : item)));
      return;
    }

    if (editingIndex === null) {
      const { data, error } = await supabase.from('clients').insert(clientToSupabase(client, session.user.id)).select().single();
      if (error) {
        window.alert('No se pudo guardar el cliente en Supabase.');
        return;
      }
      setClients((currentClients) => [...currentClients, clientFromSupabase(data)]);
      return;
    }

    const existingClient = clients[editingIndex];
    const { data, error } = await supabase.from('clients').update(clientToSupabase(client, session.user.id)).eq('id', existingClient.id).select().single();
    if (error) {
      window.alert('No se pudo actualizar el cliente en Supabase.');
      return;
    }
    setClients((currentClients) => currentClients.map((item, index) => (index === editingIndex ? clientFromSupabase(data) : item)));
  }

  async function handleClientDelete(client) {
    if (!session || !client.id) {
      setClients((currentClients) => currentClients.filter((item) => item !== client));
      return;
    }

    const { error } = await supabase.from('clients').delete().eq('id', client.id);
    if (error) {
      window.alert('No se pudo eliminar el cliente en Supabase.');
      return;
    }
    setClients((currentClients) => currentClients.filter((item) => item.id !== client.id));
  }

  async function handleTransactionsChange(nextTransactions) {
    if (!session) {
      setTransactions(nextTransactions);
      return;
    }

    const newMovement = nextTransactions.find((transaction) => !transaction.id && transaction.type !== 'pending');
    if (newMovement) {
      const { data, error } = await supabase.from('movements').insert(movementToSupabase(newMovement, session.user.id, projects)).select('*, projects(client)').single();
      if (error) {
        window.alert('No se pudo guardar el movimiento en Supabase.');
        return;
      }
      setTransactions((currentTransactions) => [movementFromSupabase(data), ...currentTransactions]);
      return;
    }

    const changedMovement = nextTransactions.find((transaction, index) => transaction.id && JSON.stringify(transaction) !== JSON.stringify(transactions[index]));
    if (changedMovement) {
      const { data, error } = await supabase.from('movements').update(movementToSupabase(changedMovement, session.user.id, projects)).eq('id', changedMovement.id).select('*, projects(client)').single();
      if (error) {
        window.alert('No se pudo actualizar el movimiento en Supabase.');
        return;
      }
      setTransactions((currentTransactions) => currentTransactions.map((transaction) => (transaction.id === changedMovement.id ? movementFromSupabase(data) : transaction)));
    }
  }

  function handlePendingEdit(project) {
    setProjectToEdit(project);
    setActiveLink('Proyectos');
  }

  function handlePendingDelete(projectToDelete) {
    setProjects((currentProjects) => currentProjects.filter((project) => project !== projectToDelete));
  }

  async function handleMovementDelete(movementToDelete) {
    if (session && movementToDelete.id) {
      const { error } = await supabase.from('movements').delete().eq('id', movementToDelete.id);
      if (error) {
        window.alert('No se pudo eliminar el movimiento en Supabase.');
        return;
      }
    }
    setTransactions((currentTransactions) => currentTransactions.filter((transaction) => transaction !== movementToDelete));

    if (movementToDelete.type === 'income' && movementToDelete.source === 'project-payment') {
      setProjects((currentProjects) => currentProjects.map((project) => (
        project.client === movementToDelete.project
          ? { ...project, status: 'Pendiente' }
          : project
      )));
    }
  }

  useEffect(() => {
    if (!session) return;
    localStorage.setItem(userStorageKey('finly-projects', session.user.id), JSON.stringify(projects));
  }, [projects, session]);

  useEffect(() => {
    if (!session) return;
    localStorage.setItem(userStorageKey('finly-transactions', session.user.id), JSON.stringify(transactions));
  }, [transactions, session]);

  useEffect(() => {
    if (!session) return;
    localStorage.setItem(userStorageKey('finly-clients', session.user.id), JSON.stringify(clients));
  }, [clients, session]);

  useEffect(() => {
    localStorage.setItem('finly-settings', JSON.stringify(settings));
  }, [settings]);

  function handleClearData() {
    setProjects(initialProjects);
    setTransactions(initialTransactions);
    setClients([]);
    setSettings(defaultSettings);
    localStorage.removeItem('finly-projects');
    localStorage.removeItem('finly-transactions');
    localStorage.removeItem('finly-clients');
    localStorage.removeItem('finly-settings');
    if (session) {
      localStorage.removeItem(userStorageKey('finly-projects', session.user.id));
      localStorage.removeItem(userStorageKey('finly-transactions', session.user.id));
      localStorage.removeItem(userStorageKey('finly-clients', session.user.id));
    }
  }

  useEffect(() => {
    if (!session) {
      setProjects([]);
      setTransactions([]);
      setClients([]);
      return;
    }

    const userId = session.user.id;
    const projectsKey = userStorageKey('finly-projects', userId);
    const transactionsKey = userStorageKey('finly-transactions', userId);
    const clientsKey = userStorageKey('finly-clients', userId);

    // Migración única de los datos anteriores, que no estaban separados por usuario.
    if (!localStorage.getItem(projectsKey) && localStorage.getItem('finly-projects')) {
      localStorage.setItem(projectsKey, localStorage.getItem('finly-projects'));
      localStorage.setItem(transactionsKey, localStorage.getItem('finly-transactions') || '[]');
      localStorage.setItem(clientsKey, localStorage.getItem('finly-clients') || '[]');
      localStorage.removeItem('finly-projects');
      localStorage.removeItem('finly-transactions');
      localStorage.removeItem('finly-clients');
    }

    supabase.from('projects').select('*').order('created_at', { ascending: true }).then(async ({ data, error }) => {
      if (error) {
        console.error('No se pudieron cargar los proyectos:', error.message);
        setProjects([]);
        return;
      }

      const localProjects = loadStoredValue(projectsKey, []);
      if ((!data || data.length === 0) && localProjects.length > 0) {
        const { data: migratedProjects, error: migrationError } = await supabase
          .from('projects')
          .insert(localProjects.map((project) => projectToSupabase(project, userId)))
          .select();
        if (!migrationError) {
          setProjects(migratedProjects.map(projectFromSupabase));
          return;
        }
      }
      setProjects((data || []).map(projectFromSupabase));
    });
    Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: true }),
      supabase.from('movements').select('*, projects(client)').order('movement_date', { ascending: false }),
    ]).then(([clientsResult, movementsResult]) => {
      if (clientsResult.error) console.error('No se pudieron cargar los clientes:', clientsResult.error.message);
      if (movementsResult.error) console.error('No se pudieron cargar los movimientos:', movementsResult.error.message);
      setClients((clientsResult.data || []).map(clientFromSupabase));
      setTransactions((movementsResult.data || []).map(movementFromSupabase));
    });
  }, [session]);

  async function handleRegister(profile, password) {
    const { data, error } = await supabase.auth.signUp({
      email: profile.email,
      password,
      options: { data: { first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone } },
    });
    if (error) return { error: error.message };

    localStorage.setItem('finly-user', JSON.stringify(profile));
    setSettings((currentSettings) => ({ ...currentSettings, name: `${profile.firstName} ${profile.lastName}`, email: profile.email, mobile: profile.phone }));
    return { success: true, needsConfirmation: !data.session };
  }

  async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'El correo o la contraseña no coinciden.' };
    setSession(data.session);
    const profile = data.user.user_metadata;
    setSettings((currentSettings) => ({ ...currentSettings, name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(), email: data.user.email, mobile: profile.phone || '' }));
    setActiveLink('Resumen');
    return { success: true };
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('finly-user');
    setSettings(defaultSettings);
    setProfileMenuOpen(false);
    setActiveLink('Resumen');
  }

  useEffect(() => {
    const synchronizedTransactions = syncProjectMovements(projects, transactions);
    if (JSON.stringify(synchronizedTransactions) !== JSON.stringify(transactions)) {
      setTransactions(synchronizedTransactions);
    }
  }, [projects, transactions]);

  useEffect(() => {
    if (!session) return;
    const unsavedTransactions = transactions.filter((transaction) => !transaction.id && transaction.type !== 'pending');
    if (unsavedTransactions.length === 0) return;

    Promise.all(unsavedTransactions.map((transaction) => (
      supabase.from('movements').insert(movementToSupabase(transaction, session.user.id, projects)).select('*, projects(client)').single()
    ))).then((results) => {
      if (results.some(({ error }) => error)) {
        console.error('No se pudieron sincronizar todos los movimientos con Supabase.');
        return;
      }
      setTransactions((currentTransactions) => currentTransactions.map((transaction) => {
        const unsavedIndex = unsavedTransactions.indexOf(transaction);
        return unsavedIndex === -1 ? transaction : movementFromSupabase(results[unsavedIndex].data);
      }));
    });
  }, [transactions, projects, session]);

  const paidProjects = projects.filter((project) => project.status === 'Cobrado');
  const totalRevenue = paidProjects.reduce((total, project) => total + amountToNumber(project.amount), 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + amountToNumber(transaction.amount), 0);
  const availableBalance = totalRevenue - totalExpenses;
  const metrics = [
    { label: 'Ingresos totales', value: formatAmount(totalRevenue), trend: '', tone: 'positive' },
    { label: 'Gastos', value: formatAmount(totalExpenses), trend: '', tone: 'negative' },
    { label: 'Proyectos', value: String(projects.length), trend: '', tone: 'blue' },
    { label: 'Saldo disponible', value: formatAmount(availableBalance), trend: '', tone: 'purple' },
  ];
  const pendingMovements = projects
    .filter((project) => project.status === 'Pendiente')
    .map((project) => ({
      date: 'Pendiente',
      description: `Cobro pendiente de ${project.work}`,
      project: project.client,
      amount: '—',
      type: 'pending',
      // Los proyectos nuevos ya guardan createdAt. Para proyectos antiguos
      // que fueron creados antes de agregar ese campo, los mostramos como
      // recientes para no perderlos del resumen.
      createdAt: project.createdAt || Date.now(),
    }));
  const recentLimit = new Date();
  recentLimit.setHours(0, 0, 0, 0);
  recentLimit.setDate(recentLimit.getDate() - 30);
  const recentMovements = [...transactions, ...pendingMovements]
    .filter((movement) => movementDateTimestamp(movement) >= recentLimit.getTime())
    .sort((first, second) => movementDateTimestamp(second) - movementDateTimestamp(first))
    .slice(0, 5);
  const revenueChartData = buildRevenueChartData(transactions, session?.user?.created_at);

  const publicLinks = ['Registro', 'Iniciar sesión', 'Centro de ayuda'];
  const requiresSession = !publicLinks.includes(activeLink);
  const shouldShowLogin = requiresSession && !session;

  if (activeLink === 'Registro') {
    return <AuthLayout type="register"><RegisterPage onRegister={handleRegister} onBack={() => setActiveLink('Resumen')} /></AuthLayout>;
  }

  if (activeLink === 'Iniciar sesión') {
    return <AuthLayout type="login"><LoginPage onLogin={handleLogin} onBack={() => setActiveLink('Resumen')} /></AuthLayout>;
  }

  if (!session && activeLink === 'Resumen') {
    return <WelcomePage onNavigate={setActiveLink} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeLink={activeLink} onNavigate={setActiveLink} session={session} />
      <main className="main-content">
        {shouldShowLogin ? <LoginPage onLogin={handleLogin} onBack={() => setActiveLink('Resumen')} /> : activeLink === 'Proyectos' ? <ProjectsPage projects={projects} onProjectsChange={handleProjectsChange} onProjectSave={handleProjectSave} onProjectDelete={handleProjectDelete} projectToEdit={projectToEdit} onEditHandled={() => setProjectToEdit(null)} /> : activeLink === 'Movimientos' ? <MovementsPage transactions={transactions} projects={projects} onTransactionsChange={handleTransactionsChange} onMovementDelete={handleMovementDelete} onPendingEdit={handlePendingEdit} onPendingDelete={handlePendingDelete} /> : activeLink === 'Clientes' ? <ClientsPage clients={clients} onClientsChange={setClients} onClientSave={handleClientSave} onClientDelete={handleClientDelete} /> : activeLink === 'Informe general' ? <GeneralReportPage projects={projects} transactions={transactions} /> : activeLink === 'Configuración' ? <SettingsPage settings={settings} onSettingsChange={setSettings} onClearData={handleClearData} /> : activeLink === 'Centro de ayuda' ? <HelpPage /> : <>
        <header className="page-header">
          <div>
            <p className="eyebrow">RESUMEN</p>
            <h1>Buen día, {getFirstName(settings.name)}</h1>
            <p className="page-subtitle">Controlá tus proyectos, ingresos y gastos fácilmente.</p>
          </div>
          <div className="header-actions">
            <span>{getCurrentPeriodLabel()}</span>
            <div className="profile-menu-wrap">
              <button className="avatar" type="button" aria-label="Abrir menú de perfil" onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}>{getInitials(settings.name)}</button>
              {profileMenuOpen && <div className="profile-menu"><strong>{settings.name}</strong><span>{settings.email || 'Sin correo electrónico'}</span><button type="button" onClick={handleLogout}>Cerrar sesión</button></div>}
            </div>
          </div>
        </header>

        <section className="metrics-grid">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </section>

        <section className="middle-grid">
          <RevenueChart data={revenueChartData} totalRevenue={totalRevenue} />
          <ProjectsPanel projects={[...projects].slice(-4).reverse()} />
        </section>

        <TransactionsPanel transactions={recentMovements} />
        </>}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
);
