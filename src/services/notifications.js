import { messaging } from '../firebase';
import { database } from '../firebase';

const VAPID_KEY = 'BKjMSzLbssVRr1aCjbcgxsRZWNvH8y-gYErFAtZlkq3Li0tC6I2RQmuqidCZtdunPyyS6_FBqKpIPjll98e4Wbk';

// Los datos de notificaciones viven en `notifications/{uid}/` — un nodo
// SEPARADO del arbol del usuario. Asi la cloud function no necesita leer
// `users/` y las escrituras de `lastSent` no disparan el listener raiz.

const notifPath = (uid, relative = '') =>
  relative ? `notifications/${uid}/${relative}` : `notifications/${uid}`;

// ── FCM token ──

export const requestPermission = async () => {
  if (!messaging) return { error: 'Firebase Messaging no disponible en este navegador' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { error: 'Permiso denegado. Activalo desde la configuracion del navegador.' };

  try {
    const token = await messaging.getToken({ vapidKey: VAPID_KEY });
    return token ? { token } : { error: 'No se pudo obtener el token de notificacion.' };
  } catch (e) {
    const msg = e.code === 'messaging/token-subscribe-failed'
      ? 'No se pudo suscribir. El service worker esta registrado?'
      : e.code === 'messaging/incorrect-gcm-sender-id'
        ? 'VAPID key incorrecta.'
        : `Error: ${e.message || 'desconocido'}`;
    return { error: msg };
  }
};

export const saveFcmToken = (uid, token) => {
  if (!uid || !token) return;
  return database.ref(`${notifPath(uid)}/fcmToken`).set(token);
};

export const removeFcmToken = (uid) => {
  if (!uid) return;
  return database.ref(`${notifPath(uid)}/fcmToken`).remove();
};

export const getStoredFcmToken = async (uid) => {
  if (!uid) return null;
  const snap = await database.ref(`${notifPath(uid)}/fcmToken`).once('value');
  return snap.val();
};

// ── Reminders ──

export const addReminder = (uid, data) =>
  database.ref(`${notifPath(uid)}/reminders`).push(data);

export const updateReminder = (uid, reminderId, data) =>
  database.ref(`${notifPath(uid, `reminders/${reminderId}`)}`).update(data);

export const removeReminder = (uid, reminderId) =>
  database.ref(`${notifPath(uid, `reminders/${reminderId}`)}`).remove();

export const getReminders = async (uid) => {
  if (!uid) return {};
  const snap = await database.ref(`${notifPath(uid)}/reminders`).once('value');
  return snap.val() || {};
};

// ── Foreground listener ──

export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  const unsubscribe = messaging.onMessage((payload) => {
    callback(payload);
  });
  return unsubscribe;
};
