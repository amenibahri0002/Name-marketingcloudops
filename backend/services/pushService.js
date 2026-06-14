// services/pushService.js - VERSION CORRIGÉE
const admin = require('firebase-admin');

// Initialiser Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

async function sendPush(notification) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Récupérer les clients avec FCM token
    let clients = [];
    
    if (notification.segmentId) {
      // Si segment spécifié, récupérer les clients du segment
      const segment = await prisma.segment.findUnique({
        where: { id: notification.segmentId },
        include: {
          contacts: {
            select: { fcmToken: true, name: true, email: true }
          }
        }
      });
      clients = segment?.contacts || [];
    } else {
      // Sinon, tous les clients avec FCM token
      clients = await prisma.contact.findMany({
        where: { fcmToken: { not: null } },
        select: { fcmToken: true, name: true, email: true }
      });
      
      // Ajouter aussi les users
      const users = await prisma.user.findMany({
        where: { 
          role: 'CLIENT',
          fcmToken: { not: null }
        },
        select: { fcmToken: true, name: true, email: true }
      });
      
      clients = [...clients, ...users];
    }

    // Récupérer les tokens FCM uniques
    const tokens = [...new Set(
      clients
        .filter(c => c.fcmToken)
        .map(c => c.fcmToken)
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

    // ✅ Utiliser sendEachForMulticast (nouvelle API)
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