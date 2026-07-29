import { storage } from '../firebase';
import { getCurrentUser } from './auth';

const requireUid = () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No hay usuario autenticado');
  return user.uid;
};

const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

// ── Perfil ──

export const uploadProfilePhoto = async (file) => {
  const uid = requireUid();
  const safeName = `${Date.now()}_${sanitizeName(file.name)}`;
  const path = `profileImages/${uid}/${safeName}`;
  const uploadTask = await storage.ref(path).put(file);
  return uploadTask.ref.getDownloadURL();
};

// ── Plantas ──

export const uploadPlantImage = async (file, plantId, filename) => {
  const uid = requireUid();
  const path = `users/${uid}/plants/${plantId}/images/${filename}`;
  const snapshot = await storage.ref(path).put(file);
  return { downloadURL: await snapshot.ref.getDownloadURL(), storagePath: path };
};

// ── Resúmenes de tarjeta ──

export const uploadStatementPdf = async (file, cardId, yearMonth) => {
  const uid = requireUid();
  const safeName = `${cardId}_${yearMonth}_${sanitizeName(file.name.replace(/\s+/g, '_'))}`;
  const path = `users/${uid}/summaries/${safeName}`;
  await storage.ref(path).put(file, {
    contentType: 'application/pdf',
    customMetadata: { userId: uid, cardId, yearMonth },
  });
  return { storagePath: path, downloadURL: await storage.ref(path).getDownloadURL() };
};

// ── Backups ──

export const uploadBackup = async (blob, fileName) => {
  const uid = requireUid();
  const path = `backups/${uid}/${fileName}`;
  const ref = storage.ref(path);
  await ref.put(blob);
  return ref.getDownloadURL();
};

// ── Utilidades ──

export const getFileUrl = (storagePath) =>
  storage.ref(storagePath).getDownloadURL();
