import * as db from './database';
import { getDate } from '../utils';

// === CRUD de plantas ===

export const addPlant = (data) => db.push('plants/active', data);

// `isArchived` decide si la planta vive en `active` o en `history`.
export const updatePlant = (plantId, data, { isArchived = false } = {}) => {
  const folder = isArchived ? 'history' : 'active';
  return db.update(`plants/${folder}/${plantId}`, data);
};

export const removePlant = (plantId, { isArchived = false } = {}) => {
  const folder = isArchived ? 'history' : 'active';
  return db.remove(`plants/${folder}/${plantId}`);
};

// === Actividades de planta ===

// Unificador: cualquier actividad de la planta se agrega como un push a su subcolección.
// `activityType` ∈ {'irrigations', 'prunings', 'insecticides', 'transplants', 'logs', 'images'}
export const addPlantActivity = (plantId, activityType, data) =>
  db.push(`plants/active/${plantId}/${activityType}`, data);

// Cambio atómico del volumen de maceta. Lo usa NewTransplant.
export const setPlantPotVolume = (plantId, newVolume) =>
  db.transaction(`plants/active/${plantId}`, (plantData) => {
    if (plantData) {
      plantData.potVolume = newVolume;
    }
    return plantData;
  });

// Mueve la planta de `active` a `history`. Agrega `inicioSecado` si no existía.
// Devuelve la nueva key generada en history.
export const archivePlant = async (plantId, plantData) => {
  const dataToArchive = { ...plantData };
  if (!dataToArchive.inicioSecado) {
    dataToArchive.inicioSecado = getDate();
  }
  const newKey = await db.push('plants/history', dataToArchive);
  await db.remove(`plants/active/${plantId}`);
  return newKey;
};

// === Aditivos (fertilizantes / insecticidas) ===

export const addAditive = (data) => db.push('plants/aditives', data);
