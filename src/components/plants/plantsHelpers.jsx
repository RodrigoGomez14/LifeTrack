import React from 'react';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import WavesIcon from '@mui/icons-material/Waves';

export const STAGES_ORDER = ['Germinacion', 'Vegetativo', 'Floracion', 'Lavado de Raices', 'Secado', 'Curado'];

export const STAGE_PALETTE = {
  Germinacion: '#8e24aa',
  Vegetativo: '#43a047',
  Floracion: '#e53935',
  'Lavado de Raices': '#00acc1',
  Secado: '#fb8c00',
  Curado: '#546e7a',
};

// Convierte "DD/MM/YYYY" a timestamp UTC (mediodía para evitar offsets de zona horaria).
export function parseDateToTimestamp(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split('/').map(Number);
  if (!d || !m || !y) return null;
  return Date.UTC(y, m - 1, d, 12, 0, 0);
}

// Normaliza "D/M/YYYY" → "DD/MM/YYYY" para comparaciones exactas.
export function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
}

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

// Diferencia en dias entre dos fechas DD/MM/YYYY. Si endDateStr no se pasa, usa hoy.
// Dia 1 = primer dia, semana 1 = dias 1-7, semana 2 = dias 8-14, etc.
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
    }
  } else {
    endDate = new Date();
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
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

// Timeline unificado de todos los eventos de la planta.
// Devuelve array ordenado cronológicamente:
// [{ date, type, label, color, data, _id }]
const SUBCOLLECTION_META = [
  { key: 'irrigations', type: 'irrigation', color: '#2196F3', label: 'Riego' },
  { key: 'prunings', type: 'pruning', color: '#4CAF50', label: 'Poda' },
  { key: 'insecticides', type: 'insecticide', color: '#FF5722', label: 'Insecticida' },
  { key: 'transplants', type: 'transplant', color: '#9C27B0', label: 'Transplante' },
  { key: 'images', type: 'image', color: '#FF9800', label: 'Foto' },
  { key: 'logs', type: 'log', color: '#607D8B', label: 'Log' },
];

const STAGE_CHANGE_META = [
  { field: 'inicioVegetativo', stage: 'Vegetativo' },
  { field: 'inicioFloracion', stage: 'Floracion' },
  { field: 'inicioLavado', stage: 'Lavado de Raices' },
  { field: 'inicioSecado', stage: 'Secado' },
  { field: 'inicioCurado', stage: 'Curado' },
  { field: 'inicioEnfrascado', stage: 'Curado' },
];

export function getPlantTimeline(plant) {
  if (!plant) return [];
  const events = [];

  if (plant.birthDate) {
    events.push({
      date: normalizeDate(plant.birthDate),
      type: 'birth',
      label: 'Nacimiento',
      color: '#8e24aa',
      stage: 'Germinacion',
      data: {},
    });
  }

  STAGE_CHANGE_META.forEach(({ field, stage }) => {
    if (plant[field]) {
      events.push({
        date: normalizeDate(plant[field]),
        type: 'stageChange',
        label: `→ ${stage}`,
        color: STAGE_PALETTE[stage] || '#888',
        stage,
        data: { field, stage },
      });
    }
  });

  SUBCOLLECTION_META.forEach(({ key, type, color, label }) => {
    if (!plant[key]) return;
    Object.entries(plant[key]).forEach(([subId, entry]) => {
      if (!entry.date) return;
      events.push({ date: normalizeDate(entry.date), type, label, color, data: { ...entry, _id: subId } });
    });
  });

  events.sort((a, b) => {
    const ta = parseDateToTimestamp(a.date);
    const tb = parseDateToTimestamp(b.date);
    return (ta || 0) - (tb || 0);
  });

  return events;
}

// Normaliza el nombre de la planta sacando el número final (ej: "AK-47 1" → "ak-47").
// Útil para agrupar plantas hermanas (misma genética) en los wizards de selección.
export function getBaseName(name) {
  return name?.replace(/\s+\d+$/, '').trim().toLowerCase() || '';
}

// Devuelve las plantas activas que comparten ambiente con la planta de origen
// (la que se pasó por ?id= al entrar al wizard). Si no hay planta de origen
// (p. ej. se entró sin id) o no existe, devuelve todas las plantas.
// Las plantas sin ambiente se agrupan entre sí (ambiente "Sin ambiente").
export function getAmbientPlants(activePlants, originPlantId) {
  if (!originPlantId) return activePlants;
  const origin = activePlants.find((p) => p.id === originPlantId);
  if (!origin) return activePlants;
  const originAmbiente = origin.ambienteId || null;
  return activePlants.filter((p) => (p.ambienteId || null) === originAmbiente);
}

// Devuelve los rangos de etapa como [{ stage, color, start, end }] con timestamps UTC.
// El end de la etapa actual es hoy; los stages no iniciados no aparecen.
export function getStageRanges(plant) {
  if (!plant) return [];
  const ranges = [];
  const today = new Date();
  const todayTs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const stages = [
    { key: 'Germinacion', startField: 'birthDate', endField: 'inicioVegetativo' },
    { key: 'Vegetativo', startField: 'inicioVegetativo', endField: 'inicioFloracion' },
    { key: 'Floracion', startField: 'inicioFloracion', endField: 'inicioLavado' },
    { key: 'Lavado de Raices', startField: 'inicioLavado', endField: 'inicioSecado' },
    { key: 'Secado', startField: 'inicioSecado', endField: 'inicioCurado' },
    { key: 'Curado', startField: null, endField: null },
  ];

  stages.forEach(({ key, startField, endField }) => {
    let startDateStr;
    if (key === 'Curado') {
      startDateStr = plant.inicioCurado || plant.inicioEnfrascado;
    } else {
      startDateStr = plant[startField];
    }
    if (!startDateStr) return;

    const startTs = parseDateToTimestamp(startDateStr);
    if (!startTs) return;

    let endTs = todayTs;
    if (endField && plant[endField]) {
      endTs = parseDateToTimestamp(plant[endField]) || todayTs;
    }

    if (startTs >= endTs) return;

    ranges.push({
      stage: key,
      color: STAGE_PALETTE[key] || '#888',
      start: startTs,
      end: endTs,
    });
  });

  return ranges;
}
