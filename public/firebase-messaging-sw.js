// Service worker para notificaciones push de Firebase.
// Este archivo DEBE estar en la raíz de public/ para que Firebase lo encuentre.
// Versión: firebase 10.10.0 (compat)

importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCTHOI-Xv3aNLiSsEr2R7PtPGwhfNVTYO4",
  authDomain: "lifetrack-fbd7b.firebaseapp.com",
  projectId: "lifetrack-fbd7b",
  storageBucket: "lifetrack-fbd7b.appspot.com",
  messagingSenderId: "918248715963",
  appId: "1:918248715963:web:c5c2d623f668b7cfc8db9e",
});

const messaging = firebase.messaging();

// Cuando el payload incluye `notification`, Firebase SDK muestra la notificación
// automáticamente (sin "from [origen]") y onBackgroundMessage NO se dispara.
// Este handler queda como fallback para mensajes data-only legacy.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const data = payload.data || {};
  const title = data.title || 'LifeTrack';
  const body = data.body || 'Tenés algo pendiente';
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { clickAction: data.clickAction || '/gastos' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.clickAction || '/gastos';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
