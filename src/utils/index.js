// Asegurar que todas las funciones existentes sigan exportándose
export { checkSearch, formatAmount, formatMinutesToHours, getCategoryIcon, getDate, getMonthName, getPreviousMonday, sumTransactionsByCategory };

// Función para capitalizar la primera letra de un texto
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Función para formatear una fecha
export const formatDate = (date) => {
  if (!date) return 'Sin fecha';
  
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}; 