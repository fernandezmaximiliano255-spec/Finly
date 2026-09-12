export const metrics = [
  { label: 'Ingresos totales', value: '$8,420', trend: '+18.4%', tone: 'positive' },
  { label: 'Gastos', value: '$2,180', trend: '-4.2%', tone: 'negative' },
  { label: 'Proyectos', value: '12', trend: '+3 este mes', tone: 'blue' },
  { label: 'Saldo disponible', value: '$6,240', trend: '74% de ingresos', tone: 'purple' },
];

export const projects = [
  { client: 'Gym Center', work: 'Rediseño web', amount: '$2,400', status: 'Cobrado' },
  { client: 'Luna Studio', work: 'Identidad de marca', amount: '$1,850', status: 'Pendiente' },
  { client: 'Norte Café', work: 'Landing page', amount: '$980', status: 'Cobrado' },
  { client: 'Senda App', work: 'Auditoría UX', amount: '$720', status: 'Pendiente' },
];

export const transactions = [
  { date: '28 ago', description: 'Cobro de factura', project: 'Gym Center', amount: '+$2,400', type: 'income' },
  { date: '25 ago', description: 'Suscripción de software', project: '—', amount: '-$89', type: 'expense' },
  { date: '21 ago', description: 'Cobro de factura', project: 'Luna Studio', amount: '+$1,850', type: 'income' },
  { date: '18 ago', description: 'Espacio de coworking', project: '—', amount: '-$180', type: 'expense' },
];

export const revenueByMonth = [
  { month: 'Feb', value: 74 },
  { month: 'Mar', value: 108 },
  { month: 'Abr', value: 92 },
  { month: 'May', value: 144 },
  { month: 'Jun', value: 126 },
  { month: 'Jul', value: 178 },
  { month: 'Ago', value: 212 },
];
