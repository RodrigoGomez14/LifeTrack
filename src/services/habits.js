import * as db from './database';

export const addHabit = (data) => db.push('habits', data);

export const updateHabit = (habitId, data) => db.update(`habits/${habitId}`, data);

export const removeHabit = (habitId) => db.remove(`habits/${habitId}`);

// Marca o desmarca un hábito como completado en una fecha dada.
// `shouldBeCompleted` es el estado destino (no el actual) — el componente decide.
export const toggleHabitCompletion = (habitId, dateStr, shouldBeCompleted) => {
  const path = `habits/completed/${dateStr}/${habitId}`;
  if (shouldBeCompleted) {
    return db.write(path, {
      completedAt: new Date().toISOString(),
      habitId,
    });
  }
  return db.remove(path);
};
