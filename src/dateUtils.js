export function formatMovementDate(date) {
  if (date === 'Hoy' || date === 'Pendiente') return date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  const legacyDate = date.match(/^(\d{1,2})\s+([a-záé]+)$/i);
  if (legacyDate) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months.indexOf(legacyDate[2].toLowerCase());
    if (month !== -1) {
      const formattedDay = legacyDate[1].padStart(2, '0');
      const formattedMonth = String(month + 1).padStart(2, '0');
      return `${formattedDay}/${formattedMonth}/${new Date().getFullYear()}`;
    }
  }

  return date;
}
