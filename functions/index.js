const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// 4 franjas horarias fijas. Solo se ejecuta 4 veces al dia.
// Lee UNICAMENTE el nodo notifications/ (NO users/).
// NO escribe en el arbol del usuario — solo en notifications/ para evitar
// re-descargas del listener raiz del cliente.
const SLOTS = {
  9:  'morning',
  12: 'midday',
  18: 'evening',
  22: 'night',
};

exports.checkReminders = functions.pubsub
  .schedule('0 9,12,18,22 * * *')
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async (context) => {
    const art = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const todayDay = art.getDay();
    const currentSlot = SLOTS[art.getHours()];
    if (!currentSlot) return null;

    const dd = String(art.getDate()).padStart(2, '0');
    const MM = String(art.getMonth() + 1).padStart(2, '0');
    const yyyy = art.getFullYear();
    const todayIso = `${yyyy}-${MM}-${dd}`;

    const db = admin.database();

    // Solo lee el nodo notifications/ — NO la DB entera
    const snap = await db.ref('notifications').once('value');
    const all = snap.val();
    if (!all) return null;

    let sentCount = 0;

    for (const uid in all) {
      const userNotifs = all[uid];
      const fcmToken = userNotifs?.fcmToken;
      if (!fcmToken || typeof fcmToken !== 'string') continue;

      const list = userNotifs?.reminders;
      if (!list || typeof list !== 'object') continue;

      for (const notifId in list) {
        const n = list[notifId];
        if (!n || !n.days || !n.slot || !n.title) continue;
        if (!Array.isArray(n.days) || !n.days.includes(todayDay)) continue;
        if (n.slot !== currentSlot) continue;
        if (n.lastSent === todayIso) continue;

        try {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: n.title,
              body: n.body || '',
            },
            data: {
              title: n.title,
              body: n.body || '',
              clickAction: n.redirectTo || '/gastos',
            },
            android: { priority: 'high' },
            apns: { payload: { aps: { contentAvailable: true } } },
          });

          // Escribe lastSent en notifications/ — NO en el arbol del usuario.
          // Esto NO dispara el listener raiz del cliente.
          await db.ref(`notifications/${uid}/reminders/${notifId}/lastSent`).set(todayIso);
          sentCount++;
        } catch (e) {
          console.error(`Error enviando notificacion ${notifId} al usuario ${uid}: ${e.message}`);
        }
      }
    }

    if (sentCount > 0) {
      console.log(`Slot ${currentSlot} — notificaciones enviadas: ${sentCount}`);
    }
    return null;
  });

exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesion.');
  }

  const db = admin.database();
  const snap = await db.ref(`notifications/${context.auth.uid}/fcmToken`).once('value');
  const token = snap.val();

  if (!token) {
    throw new functions.https.HttpsError('not-found', 'No hay token de notificacion registrado.');
  }

  await admin.messaging().send({
    token,
    notification: {
      title: 'Prueba de notificacion',
      body: 'Si ves esto, las notificaciones funcionan correctamente.',
    },
    data: {
      title: 'Prueba de notificacion',
      body: 'Si ves esto, las notificaciones funcionan correctamente.',
      clickAction: '/gastos',
    },
  });

  return { success: true };
});
