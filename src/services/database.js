import { database } from '../firebase';
import { getCurrentUser } from './auth';

// Resuelve el uid del usuario autenticado.
// Tira si no hay sesión — los servicios de dominio se llaman post-login.
const requireUid = () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');
  return user.uid;
};

// Construye un path absoluto en RTDB a partir de un path relativo al user.
// `userPath('')` → uid; `userPath('/foo')` y `userPath('foo')` → uid/foo
const userPath = (relativePath = '') => {
  const uid = requireUid();
  if (!relativePath) return uid;
  const normalized = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${uid}/${normalized}`;
};

// === CRUD genérico ===

export const read = async (relativePath) => {
  const snapshot = await database.ref(userPath(relativePath)).once('value');
  return snapshot.val();
};

export const write = (relativePath, data) =>
  database.ref(userPath(relativePath)).set(data);

export const push = async (relativePath, data) => {
  const ref = await database.ref(userPath(relativePath)).push(data);
  return ref.key;
};

export const update = (relativePath, data) =>
  database.ref(userPath(relativePath)).update(data);

export const remove = (relativePath) =>
  database.ref(userPath(relativePath)).remove();

// === Operaciones avanzadas ===

// Multi-path update atómico. `updates` es { relPath: value }; el servicio
// prepende uid a cada key. Útil para mutaciones que tocan varios nodos.
export const bulkUpdate = (updates) => {
  const uid = requireUid();
  const absUpdates = {};
  Object.keys(updates).forEach((relPath) => {
    const normalized = relPath.startsWith('/') ? relPath.slice(1) : relPath;
    absUpdates[`${uid}/${normalized}`] = updates[relPath];
  });
  return database.ref().update(absUpdates);
};

// Genera una key tipo push() sin escribir. Para construir bulkUpdates con IDs.
export const generateKey = (relativePath) =>
  database.ref().child(userPath(relativePath)).push().key;

// Operación atómica. Para contadores y campos que se calculan a partir del valor previo.
export const transaction = (relativePath, transactionFn) =>
  database.ref(userPath(relativePath)).transaction(transactionFn);

// === Suscripción al árbol completo del user ===

// Suscribe al nodo raíz del user. El callback recibe el .val() ya desempaquetado
// (puede ser null si la cuenta es nueva). Devuelve función de cleanup.
export const subscribeToUserData = (callback) => {
  const uid = requireUid();
  const ref = database.ref(uid);
  const handler = (snapshot) => callback(snapshot.val());
  ref.on('value', handler);
  return () => ref.off('value', handler);
};
