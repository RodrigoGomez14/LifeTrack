import { messaging } from '../firebase';
import { write, remove } from './database';

const VAPID_KEY = 'BKjMSzLbssVRr1aCjbcgxsRZWNvH8y-gYErFAtZlkq3Li0tC6I2RQmuqidCZtdunPyyS6_FBqKpIPjll98e4Wbk';

export const requestPermission = async () => {
  if (!messaging) return { error: 'Firebase Messaging no disponible en este navegador' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { error: 'Permiso denegado. Activalo desde la configuración del navegador.' };

  try {
    const token = await messaging.getToken({ vapidKey: VAPID_KEY });
    return token ? { token } : { error: 'No se pudo obtener el token de notificación.' };
  } catch (e) {
    console.error('FCM getToken error:', e);
    const msg = e.code === 'messaging/token-subscribe-failed'
      ? 'No se pudo suscribir. ¿El service worker está registrado?'
      : e.code === 'messaging/incorrect-gcm-sender-id'
        ? 'VAPID key incorrecta. Verificá la clave en Firebase Console.'
        : `Error: ${e.message || 'desconocido'}`;
    return { error: msg };
  }
};

export const saveFcmToken = (uid, token) => {
  if (!uid || !token) return;
  return write(`config/notifications/fcmToken`, token);
};

export const removeFcmToken = (uid) => {
  if (!uid) return;
  return remove('config/notifications/fcmToken');
};

export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  const unsubscribe = messaging.onMessage((payload) => {
    callback(payload);
  });
  return unsubscribe;
};
