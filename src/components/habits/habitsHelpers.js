// Formatea una fecha como YYYY-MM-DD para usar como clave del store de hábitos.
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Devuelve { start, end } de la semana ISO (lunes 00:00 → domingo 23:59:59) que contiene la fecha.
export const getWeekRange = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  const weekStart = new Date(date);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
};

// Determina si un hábito aplica para una fecha dada según su frecuencia y la fecha de creación.
export const shouldShowHabitForDate = (habit, date) => {
  if (habit.createdAt) {
    const createdDate = new Date(habit.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < createdDate) return false;
  }

  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
    case 'monthly':
      return Array.isArray(habit.monthlyDays) && habit.monthlyDays.includes(dayOfMonth);
    case 'yearly': {
      const isCorrectMonth = Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.includes(month);
      const isCorrectDay = Array.isArray(habit.yearlyDays) && habit.yearlyDays.includes(dayOfMonth);
      return isCorrectMonth && isCorrectDay;
    }
    default:
      return true;
  }
};

// `true` si la fecha es hoy (compara solo año/mes/día).
export const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// "12 - 18 de marzo 2025" o "29 marzo - 4 abril 2025" cuando cruza meses.
export const formatWeekRangeDisplay = (date) => {
  const { start, end } = getWeekRange(date);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleString('es-ES', { month: 'long' });
  const endMonth = end.toLocaleString('es-ES', { month: 'long' });
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} de ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
};
