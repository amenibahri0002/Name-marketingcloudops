// services/pushService.js
const admin = require('firebase-admin');

// Initialiser Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

async function sendPush(notification) {
  try {
    const clients = await getClientsFromSegment(notification.segmentId);
    
    // Récupérer les tokens FCM
    const tokens = clients
      .filter(c => c.fcmToken)
      .map(c => c.fcmToken);

    if (tokens.length === 0) {
      return { success: false, error: 'Aucun token FCM trouvé' };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        campagneId: notification.campagneId?.toString() || '',
        type: notification.type
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    return { 
      success: response.successCount > 0,
      sent: response.successCount,
      failed: response.failureCount
    };
  } catch (error) {
    console.error('Erreur push:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendPush };