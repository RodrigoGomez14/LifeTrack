const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.dailyExpenseReminder = functions.pubsub
  .schedule('* * * * *')
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async (context) => {
    const now = new Date();
    const art = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const todayDay = art.getDay();
    const hh = String(art.getHours()).padStart(2, '0');
    const mm = String(art.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    const dd = String(art.getDate()).padStart(2, '0');
    const MM = String(art.getMonth() + 1).padStart(2, '0');
    const yyyy = art.getFullYear();
    const todayIso = `${yyyy}-${MM}-${dd}`;

    const db = admin.database();
    const rootSnapshot = await db.ref('/').once('value');
    const root = rootSnapshot.val();
    if (!root) return null;

    let sentCount = 0;

    for (const uid in root) {
      if (uid === 'config' || uid === 'aditives') continue;

      const userNode = root[uid];
      const fcmToken = userNode?.config?.notifications?.fcmToken;
      if (!fcmToken || typeof fcmToken !== 'string') continue;

      const list = userNode?.config?.notifications?.list;
      if (!list || typeof list !== 'object') continue;

      for (const notifId in list) {
        const n = list[notifId];
        if (!n || !n.days || !n.time || !n.title) continue;
        if (!Array.isArray(n.days) || !n.days.includes(todayDay)) continue;
        if (n.time !== currentTime) continue;
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
            android: {
              priority: 'high',
            },
            apns: {
              payload: {
                aps: {
                  contentAvailable: true,
                },
              },
            },
          });

          await db.ref(`${uid}/config/notifications/list/${notifId}/lastSent`).set(todayIso);
          sentCount++;
        } catch (e) {
          console.error(`Error enviando notificación ${notifId} al usuario ${uid}:`, e.message);
        }
      }
    }

    if (sentCount > 0) {
      console.log(`Notificaciones enviadas: ${sentCount}`);
    }
    return null;
  });

exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debés iniciar sesión.');
  }

  const db = admin.database();
  const snap = await db.ref(`${context.auth.uid}/config/notifications/fcmToken`).once('value');
  const token = snap.val();

  if (!token) {
    throw new functions.https.HttpsError('not-found', 'No hay token de notificación registrado. Activá las notificaciones primero.');
  }

  await admin.messaging().send({
    token,
    notification: {
      title: '🧪 Prueba de notificación',
      body: 'Si ves esto, las notificaciones funcionan correctamente.',
    },
    data: {
      title: '🧪 Prueba de notificación',
      body: 'Si ves esto, las notificaciones funcionan correctamente.',
      clickAction: '/gastos',
    },
  });

  return { success: true };
});
