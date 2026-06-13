const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

/**
 * Cloud Function reactiva que escucha la creación de notificaciones en Firestore
 * y las envía como notificaciones push FCM a todos los dispositivos válidos del destinatario.
 */
exports.sendPushNotification = functions.firestore.document("notifications/{notificationId}").onCreate(async (snapshot, context) => {
  const notificationData = snapshot.data();
  if (!notificationData) return null;

  const { recipientId, recipientRole, title, body, clickAction, orderId, orderNumber } = notificationData;
  if (!recipientId || !title || !body) {
    console.log("[FCM Push] Parámetros incompletos en la notificación.");
    return null;
  }

  try {
    // 1. Obtener los tokens FCM válidos para el destinatario
    // Si es cliente, buscamos por celular (recipientId)
    // Para otros roles, buscamos por userId (que puede ser su id de empleado o 'admin')
    const tokensSnapshot = await db.collection("fcmTokens")
      .where("userId", "==", recipientId)
      .where("isValid", "==", true)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`[FCM Push] No se encontraron tokens FCM activos para el usuario: ${recipientId}`);
      return null;
    }

    const tokens = [];
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.token) {
        tokens.push({ id: doc.id, token: data.token });
      }
    });

    console.log(`[FCM Push] Enviando notificación a ${tokens.length} dispositivos para el usuario: ${recipientId}`);

    const messaging = getMessaging();
    const sendPromises = tokens.map(async (item) => {
      const message = {
        token: item.token,
        notification: {
          title: title,
          body: body
        },
        data: {
          title: title,
          body: body,
          clickAction: clickAction || "/",
          orderId: orderId || "",
          orderNumber: orderNumber || ""
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            requireInteraction: true
          }
        }
      };

      try {
        await messaging.send(message);
        console.log(`[FCM Push] Mensaje enviado con éxito al token: ${item.id}`);
      } catch (err) {
        console.error(`[FCM Push] Error al enviar al token ${item.id}:`, err);
        // Si el token ya no es válido, marcarlo en la base de datos
        if (err.code === "messaging/registration-token-not-registered" || 
            err.code === "messaging/invalid-registration-token" ||
            err.message?.includes("not registered") ||
            err.message?.includes("invalid")) {
          console.log(`[FCM Push] Invalidando token desactualizado en Firestore: ${item.id}`);
          await db.collection("fcmTokens").doc(item.id).update({
            isValid: false,
            invalidatedAt: new Date()
          });
        }
      }
    });

    await Promise.all(sendPromises);
    console.log("[FCM Push] Proceso de envío finalizado.");

  } catch (error) {
    console.error("[FCM Push] Error general en sendPushNotification:", error);
  }

  return null;
});
