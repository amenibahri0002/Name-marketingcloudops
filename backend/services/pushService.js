// services/pushService.js - CORRIGÉ
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

async function sendPush(notification) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // ✅ CORRECTION : Chercher dans User (pas Contact)
    let users = [];
    
    if (notification.segmentId) {
      // Si segment spécifié, récupérer les users du segment
      // (à adapter selon ta logique de segments)
      users = await prisma.user.findMany({
        where: { 
          role: 'CLIENT',
          fcmToken: { not: null }
        },
        select: { fcmToken: true, name: true, email: true }
      });
    } else {
      // Tous les users CLIENT avec FCM token
      users = await prisma.user.findMany({
        where: { 
          role: 'CLIENT',
          fcmToken: { not: null }
        },
        select: { fcmToken: true, name: true, email: true }
      });
    }

    // Récupérer les tokens FCM uniques
    const tokens = [...new Set(
      users
        .filter(u => u.fcmToken)
        .map(u => u.fcmToken)
    )];

    if (tokens.length === 0) {
      return { success: false, error: 'Aucun token FCM trouvé' };
    }

    console.log(`[PUSH] Envoi à ${tokens.length} destinataires`);

    const message = {
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        campagneId: notification.campagneId?.toString() || '',
        type: notification.type,
        url: `https://digipip.vercel.app/campagnes/${notification.campagneId || ''}`
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`[PUSH] ✅ ${response.successCount}/${tokens.length} envoyés, ${response.failureCount} échecs`);

    return { 
      success: response.successCount > 0,
      sent: response.successCount,
      failed: response.failureCount,
      total: tokens.length
    };

  } catch (error) {
    console.error('[PUSH ERROR]', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendPush };