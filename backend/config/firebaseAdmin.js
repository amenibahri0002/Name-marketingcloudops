// backend/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// Charger le fichier de compte de service

// Initialiser Firebase Admin (une seule fois)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();

/**
 * Envoyer une notification push à un ou plusieurs tokens
 * @param {string|string[]} tokens - Token(s) FCM
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @param {object} data - Données supplémentaires
 */
async function sendPushNotification(tokens, title, body, data = {}) {
  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  // Filtrer les tokens null/undefined
  const validTokens = tokenArray.filter(t => t && typeof t === 'string');

  if (validTokens.length === 0) {
    return { success: false, error: 'Aucun token FCM valide' };
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: '/notifications',
    },
    webpush: {
      notification: {
        icon: '/logo192.png',
        badge: '/logo192.png',
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Voir' },
          { action: 'close', title: 'Fermer' },
        ],
      },
      fcmOptions: {
        link: '/notifications',
      },
    },
    tokens: validTokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log(`[FCM] Envoyés: ${response.successCount}, Échecs: ${response.failureCount}`);

    return {
      success: response.successCount > 0,
      sent: response.successCount,
      failed: response.failureCount,
      responses: response.responses.map((resp, idx) => ({
        token: validTokens[idx],
        success: resp.success,
        error: resp.error ? resp.error.message : null,
      })),
    };
  } catch (error) {
    console.error('[FCM ERROR]', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendPushNotification, messaging };