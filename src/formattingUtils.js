// Función para formatear un monto de dinero
export const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };
  
  // Función para obtener el nombre del mes a partir de su número (1 para enero, 2 para febrero, etc.)
  export const getMonthName = (monthNumber) => {
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return monthNames[monthNumber - 1] || '';
  };
  
  // Función para convertir minutos en horas y minutos
  export const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  