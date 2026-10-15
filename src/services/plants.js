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
export const archivePlant = async (plantId, plantData) => {
  const dataToArchive = { ...plantData };
  delete dataToArchive.id;
  if (!dataToArchive.inicioSecado) {
    dataToArchive.inicioSecado = getDate();
  }
  await db.write(`plants/history/${plantId}`, dataToArchive);
  await db.remove(`plants/active/${plantId}`);
  return plantId;
};

// === Ambientes ===
// Solo guardan el número de ambiente y sus dimensiones (texto libre).
export const addAmbiente = (data) => db.push('plants/ambientes', data);

export const updateAmbiente = (ambienteId, data) => db.update(`plants/ambientes/${ambienteId}`, data);

export const removeAmbiente = (ambienteId) => db.remove(`plants/ambientes/${ambienteId}`);

// === Nutrientes e insecticidas ===

export const addNutriente = (data) => db.push('plants/aditives/fertilizantes', data);
export const removeNutriente = (nutrientId) => db.remove(`plants/aditives/fertilizantes/${nutrientId}`);
export const addInsecticida = (data) => db.push('plants/aditives/insecticidas', data);

// Dosis de insecticidas (por aplicación/forma).
export const addAditiveDosis = (category, aditiveId, data) =>
  db.push(`plants/aditives/${category}/${aditiveId}/dosis`, data);

export const updateAditiveDosis = (category, aditiveId, dosisKey, data) =>
  db.update(`plants/aditives/${category}/${aditiveId}/dosis/${dosisKey}`, data);

export const removeAditiveDosis = (category, aditiveId, dosisKey) =>
  db.remove(`plants/aditives/${category}/${aditiveId}/dosis/${dosisKey}`);

// === Plan de nutrientes por etapa/semana (fuente de verdad de las dosis) ===
export const setPlanNutrient = (etapa, semana, nutrientId, mlPerL) =>
  db.update(`plants/plan/${etapa}/${semana}/nutrients/${nutrientId}`, { mlPerL });

export const removePlanNutrient = (etapa, semana, nutrientId) =>
  db.remove(`plants/plan/${etapa}/${semana}/nutrients/${nutrientId}`);

// Objetivos por semana (pH / EC / PPM). value <= 0 borra el campo.
export const setPlanParam = (etapa, semana, field, value) =>
  db.update(`plants/plan/${etapa}/${semana}`, { [field]: Number(value) > 0 ? Number(value) : null });
