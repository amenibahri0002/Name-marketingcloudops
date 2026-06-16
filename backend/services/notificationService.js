const { PrismaClient } = require('@prisma/client');
const { sendCampagneNotification } = require('./emailService');
const { sendPush } = require('./pushService');

const prisma = new PrismaClient();

// ============================================================
// NOTIFIER TOUS LES CLIENTS (nouvelle campagne)
// ============================================================
async function notifierNouvelleCampagne(campagne) {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, email: true, name: true, fcmToken: true }
    });

    console.log(`[NOTIFICATION] Envoi à ${clients.length} clients pour campagne: ${campagne.title}`);

    for (const client of clients) {
      try {
        // 1. Email
        await sendCampagneNotification(
          [{ email: client.email, name: client.name }],
          `🔔 Nouvelle formation : ${campagne.title}`,
          `Une nouvelle formation est disponible : ${campagne.description?.substring(0, 100)}...`,
          campagne
        );

        // 2. Push (si token FCM existe)
        if (client.fcmToken) {
          await sendPush({
            title: `🔔 ${campagne.title}`,
            message: 'Nouvelle formation disponible ! Inscrivez-vous maintenant.',
            token: client.fcmToken,
            data: { 
              campagneId: campagne.id.toString(), 
              url: `/campagnes/${campagne.id}`,
              type: 'campagne'
            }
          });
        }

        // 3. Sauvegarder dans DB (NOUVEAU SCHÉMA)
        await prisma.notification.create({
          data: {
            title: campagne.title,
            message: 'Nouvelle formation disponible',
            type: 'campagne',
            canal: client.fcmToken ? 'both' : 'email',
            userId: client.id,
            campagneId: campagne.id,
            data: { url: `/campagnes/${campagne.id}`, prix: campagne.prix }
          }
        });

        console.log(`[NOTIFICATION] ✅ Envoyé à ${client.email}`);

      } catch (err) {
        console.error(`[NOTIFICATION] ❌ Erreur pour ${client.email}:`, err.message);
      }
    }

    return { success: true, sent: clients.length };

  } catch (err) {
    console.error('[NOTIFICATION SERVICE ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// NOTIFIER UN CLIENT SPÉCIFIQUE
// ============================================================
async function notifierClient(userId, title, message, type = 'system', data = {}) {
  try {
    const client = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, fcmToken: true }
    });

    if (!client) {
      return { success: false, error: 'Client non trouvé' };
    }

    // Push si token existe
    if (client.fcmToken) {
      await sendPush({
        title: title,
        message: message,
        token: client.fcmToken,
        data: { ...data, type }
      });
    }

    // Sauvegarder notification
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        canal: client.fcmToken ? 'push' : 'email',
        userId: client.id,
        data
      }
    });

    return { success: true };

  } catch (err) {
    console.error('[NOTIFIER CLIENT ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// NOTIFIER AU LOGIN (notifications non lues)
// ============================================================
async function notifierAuLogin(userId) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    if (count === 0) return { success: true, count: 0 };

    const client = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true }
    });

    if (client?.fcmToken) {
      await sendPush({
        title: '🔔 Nouvelles notifications',
        message: `Vous avez ${count} notification${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''}`,
        token: client.fcmToken,
        data: { url: '/notifications', type: 'rappel' }
      });
    }

    return { success: true, count };

  } catch (err) {
    console.error('[NOTIFIER LOGIN ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// MARQUER NOTIFICATIONS COMME LUES
// ============================================================
async function marquerCommeLues(userId, notificationIds = null) {
  try {
    const where = { userId };
    if (notificationIds) {
      where.id = { in: notificationIds };
    }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true }
    });

    return { success: true };

  } catch (err) {
    console.error('[MARQUER LUES ERROR]', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  notifierNouvelleCampagne,
  notifierClient,
  notifierAuLogin,
  marquerCommeLues
};