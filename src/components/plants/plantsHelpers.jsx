import React from 'react';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import WavesIcon from '@mui/icons-material/Waves';

export const STAGES_ORDER = ['Germinacion', 'Vegetativo', 'Floracion', 'Lavado de Raices', 'Secado', 'Curado'];

// Convierte "DD/MM/YYYY" a "Lunes, 5 de mayo de 2026" (capitalizada).
export function convertToDetailedDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  const formatStr = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatStr.charAt(0).toUpperCase() + formatStr.slice(1);
}

// Mes en formato "Mayo 2026" (capitalizado). Se usa en el header del calendario.
export function formatMonthDisplay(date) {
  return date
    .toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

// Diferencia en días entre dos fechas DD/MM/YYYY. Si endDateStr no se pasa, usa hoy.
// Cuando se calcula contra "hoy", resta 1 día para no contar el día actual.
export function calculateDaysBetween(startDateStr, endDateStr = null) {
  if (!startDateStr) return null;
  const startParts = startDateStr.split('/');
  if (startParts.length !== 3) return null;
  const startDate = new Date(
    parseInt(startParts[2], 10),
    parseInt(startParts[1], 10) - 1,
    parseInt(startParts[0], 10)
  );

  let endDate;
  let isCalculatingToToday = false;
  if (endDateStr) {
    const endParts = endDateStr.split('/');
    if (endParts.length === 3) {
      endDate = new Date(
        parseInt(endParts[2], 10),
        parseInt(endParts[1], 10) - 1,
        parseInt(endParts[0], 10)
      );
    } else {
      endDate = new Date();
      isCalculatingToToday = true;
    }
  } else {
    endDate = new Date();
    isCalculatingToToday = true;
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  const diffTime = Math.abs(endDate - startDate);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (isCalculatingToToday && diffDays > 0) diffDays -= 1;
  return diffDays;
}

// Días que la planta pasó (o lleva) en una etapa específica.
export function calculateDaysInStage(plant, stageName) {
  if (!plant) return null;
  if (stageName === 'Germinacion' && plant.birthDate) {
    if (plant.inicioVegetativo) {
      return calculateDaysBetween(plant.birthDate, plant.inicioVegetativo);
    }
    return calculateDaysBetween(plant.birthDate);
  }
  if (stageName === 'Vegetativo' && plant.inicioVegetativo) {
    if (plant.inicioFloracion) {
      return calculateDaysBetween(plant.inicioVegetativo, plant.inicioFloracion);
    }
    if (plant.etapa === 'Vegetativo') {
      return calculateDaysBetween(plant.inicioVegetativo);
    }
  }
  if (stageName === 'Floracion' && plant.inicioFloracion) {
    if (plant.inicioLavado) {
      return calculateDaysBetween(plant.inicioFloracion, plant.inicioLavado);
    }
    return calculateDaysBetween(plant.inicioFloracion);
  }
  if (stageName === 'Lavado de Raices' && plant.inicioLavado) {
    if (plant.inicioSecado) {
      return calculateDaysBetween(plant.inicioLavado, plant.inicioSecado);
    }
    if (plant.etapa === 'Lavado de Raices') {
      return calculateDaysBetween(plant.inicioLavado);
    }
  }
  if (stageName === 'Secado' && plant.inicioSecado) {
    if (plant.finalSecado) {
      return calculateDaysBetween(plant.inicioSecado, plant.finalSecado);
    }
    if (plant.etapa === 'Secado') {
      return calculateDaysBetween(plant.inicioSecado);
    }
  }
  if (stageName === 'Curado') {
    const inicio = plant.inicioCurado || plant.inicioEnfrascado;
    if (inicio) {
      return calculateDaysBetween(inicio);
    }
  }
  return null;
}

// Devuelve startDate, endDate, duration, isActive, isCompleted, hasStarted para la etapa.
export function getStageInfo(plant, stageName) {
  let startDate = null;
  let endDate = null;
  let isActive = false;
  let isCompleted = false;

  switch (stageName) {
    case 'Germinacion':
      startDate = plant.birthDate;
      endDate = plant.inicioVegetativo;
      isActive = plant.etapa === 'Germinacion';
      isCompleted = !!plant.inicioVegetativo;
      break;
    case 'Vegetativo':
      startDate = plant.inicioVegetativo;
      endDate = plant.inicioFloracion;
      isActive = plant.etapa === 'Vegetativo';
      isCompleted = !!plant.inicioFloracion;
      break;
    case 'Floracion':
      startDate = plant.inicioFloracion;
      endDate = plant.inicioLavado;
      isActive = plant.etapa === 'Floracion';
      isCompleted = !!plant.inicioLavado;
      break;
    case 'Lavado de Raices':
      startDate = plant.inicioLavado;
      endDate = plant.inicioSecado;
      isActive = plant.etapa === 'Lavado de Raices';
      isCompleted = !!plant.inicioSecado;
      break;
    case 'Secado':
      startDate = plant.inicioSecado;
      endDate = plant.finalSecado;
      isActive = plant.etapa === 'Secado';
      isCompleted = !!plant.finalSecado;
      break;
    case 'Curado':
      startDate = plant.finalSecado || plant.inicioCurado || plant.inicioEnfrascado;
      endDate = null;
      isActive = plant.etapa === 'Curado' || plant.etapa === 'Enfrascado';
      isCompleted = plant.etapa === 'Curado' || plant.etapa === 'Enfrascado';
      break;
    default:
      break;
  }

  const duration = startDate ? calculateDaysInStage(plant, stageName) : null;
  return { startDate, endDate, duration, isActive, isCompleted, hasStarted: !!startDate };
}

// Devuelve el icono apropiado para una etapa (componente React).
export function getStageIcon(stage, fontSize = 'small') {
  switch (stage) {
    case 'Germinacion':
      return <SpaIcon fontSize={fontSize} />;
    case 'Vegetativo':
      return <GrassIcon fontSize={fontSize} />;
    case 'Floracion':
      return <LocalFloristIcon fontSize={fontSize} />;
    case 'Lavado de Raices':
      return <WavesIcon fontSize={fontSize} />;
    case 'Secado':
      return <ParkIcon fontSize={fontSize} />;
    case 'Curado':
      return <ForestIcon fontSize={fontSize} />;
    default:
      return <ForestIcon fontSize={fontSize} />;
  }
}

// Mapping etapa actual → siguiente etapa + campo de fecha asociado.
// Devuelve { newStage, dateField } o null si ya está en Curado (terminal).
export function getNextStage(currentStage) {
  const etapa = currentStage === 'Enfrascado' ? 'Curado' : currentStage;
  switch (etapa) {
    case 'Germinacion':
      return { newStage: 'Vegetativo', dateField: 'inicioVegetativo' };
    case 'Vegetativo':
      return { newStage: 'Floracion', dateField: 'inicioFloracion' };
    case 'Floracion':
      return { newStage: 'Lavado de Raices', dateField: 'inicioLavado' };
    case 'Lavado de Raices':
      return { newStage: 'Secado', dateField: 'inicioSecado' };
    case 'Secado':
      return { newStage: 'Curado', dateField: 'inicioCurado' };
    default:
      return null;
  }
}
