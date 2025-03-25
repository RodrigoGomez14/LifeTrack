// Asegurar que todas las funciones existentes sigan exportándose
export { checkSearch, convertToDetailedDate, formatAmount, formatMinutesToHours, getCategoryIcon, getDate, getMonthName, getPreviousMonday, sumTransactionsByCategory };

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