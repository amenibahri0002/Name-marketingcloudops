// backend/services/notificationService.js
const axios = require('axios');

let prisma;

function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// ============ CONFIGURATION DES CANAUX ACTIFS ============

// Email (Resend)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = 'onboarding@resend.dev'; // Domaine Resend vérifié

// Firebase Admin (chargé dynamiquement)
let sendPushFCM = null;

try {
  const { sendPushNotification } = require('../config/firebaseAdmin');
  sendPushFCM = sendPushNotification;
  console.log('[FCM] Firebase Admin chargé avec succès');
} catch (e) {
  console.log('[FCM] Firebase Admin non disponible:', e.message);
}

// ✅ Mapping des canaux string vers enum ChannelType
const CHANNEL_TO_ENUM = {
  'email': 'EMAIL',
  'sms': 'SMS',
  'push': 'PUSH',
  'whatsapp': 'WHATSAPP',
  'social': 'SOCIAL',
};

// ============ FONCTIONS D'ENVOI ACTIFS ============

// 1. EMAIL (SMTP Gmail)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'amenibahri555@gmail.com',
    pass: process.env.SMTP_PASS || 'alddnaefoxddysgs',
  },
});

async function sendEmail(to, subject, html, text) {
  try {
    const info = await transporter.sendMail({
      from: `"DigiPip" <${process.env.SMTP_USER || 'amenibahri555@gmail.com'}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`[EMAIL SENT] À: ${to}, MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// 2. PUSH (FCM) via Firebase Admin
async function sendPush(token, title, body, data = {}) {
  if (!token) {
    return { success: false, error: 'Aucun token FCM enregistré' };
  }

  if (!sendPushFCM) {
    console.log(`[PUSH LOCAL] Token: ${token.substring(0, 20)}..., Titre: ${title}`);
    return { success: true, messageId: 'local-' + Date.now(), local: true };
  }

  try {
    const result = await sendPushFCM(token, title, body, data);
    return result;
  } catch (error) {
    console.error(`[PUSH ERROR] ${token}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============ DIFFUSION MANUELLE (Email + Push uniquement) ============

async function manualDiffusion(tenantId, campagneId, channels, title, message) {
  if (!channels || !Array.isArray(channels)) {
    console.error('[NOTIFY MANUAL] ERREUR: channels nest pas un tableau:', channels);
    throw new Error('channels doit etre un tableau (ex: ["email", "push"])');
  }

  console.log(`[NOTIFY MANUAL] Tenant: ${tenantId}, Campagne: ${campagneId}`);
  console.log(`[NOTIFY MANUAL] Canaux: ${channels.join(', ')}`);
  console.log(`[NOTIFY MANUAL] Title: ${title}`);
  console.log(`[NOTIFY MANUAL] Message: ${message}`);

  const results = {
    email: { sent: 0, failed: 0, errors: [] },
    push: { sent: 0, failed: 0, errors: [] },
  };

  const prismaInstance = getPrisma();

  // Récupérer les clients du tenant AVEC leur fcmToken
  const clients = await prismaInstance.user.findMany({
    where: {
      tenantId,
      role: 'CLIENT',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      fcmToken: true,  // <-- Récupérer le fcmToken directement
      name: true,
    },
  });

  console.log(`[NOTIFY MANUAL] ${clients.length} clients trouves`);
  console.log(`[NOTIFY MANUAL] Clients avec fcmToken: ${clients.filter(c => c.fcmToken).length}`);

  if (clients.length === 0) {
    return results;
  }

  // Convertir les canaux string en enum ChannelType[]
  const channelsEnum = channels
    .map(c => CHANNEL_TO_ENUM[c.toLowerCase()])
    .filter(Boolean);

  console.log(`[NOTIFY MANUAL] Channels enum:`, channelsEnum);

  // Creer la notification en base
  const notification = await prismaInstance.notification.create({
    data: {
      tenantId,
      type: 'CAMPAGNE_PROMO',
      title,
      message,
      campagneId,
      read: false,
      priority: 2,
    },
  });

  // Creer les recipients
  await prismaInstance.notificationRecipient.createMany({
    data: clients.map(client => ({
      notificationId: notification.id,
      userId: client.id,
      channels: channelsEnum,
    })),
  });

  // Envoyer par email
  if (channels.includes('email')) {
    for (const client of clients) {
      if (client.email) {
        const emailResult = await sendEmail(
          client.email,
          title,
          `<h2>${title}</h2><p>${message}</p><p><a href="http://localhost:3000/campagnes">Voir la campagne</a></p>`,
          message
        );
        if (emailResult.success) {
          results.email.sent++;
        } else {
          results.email.failed++;
          results.email.errors.push(`${client.email}: ${emailResult.error}`);
        }
      }
    }
  }

  // Envoyer par Push (utilise User.fcmToken directement)
  if (channels.includes('push')) {
    for (const client of clients) {
      const token = client.fcmToken;  // <-- Utilise directement le fcmToken du User
      if (token) {
        const pushResult = await sendPush(token, title, message, { campagneId, type: 'CAMPAGNE_PROMO' });
        if (pushResult.success) {
          results.push.sent++;
        } else {
          results.push.failed++;
          results.push.errors.push(`${client.id}: ${pushResult.error}`);
        }
      } else {
        results.push.failed++;
        results.push.errors.push(`${client.id}: Aucun token FCM enregistre`);
      }
    }
  }

  // Mettre a jour les statuts
  await prismaInstance.notification.update({
    where: { id: notification.id },
    data: {
      data: {
        results,
        channels,
        clientCount: clients.length,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('[NOTIFY MANUAL] Resultats:', JSON.stringify(results, null, 2));
  return results;
}

// ============ NOTIFICATIONS AUTOMATIQUES (CREATION CAMPAGNE) ============

async function notifyNewCampagne(campagne) {
  console.log('[NOTIFY AUTO] Nouvelle campagne:', campagne.title || campagne.titre);

  const prismaInstance = getPrisma();

  const tenantId = campagne.tenantId;
  if (!tenantId) {
    console.error('[NOTIFY AUTO] ERREUR: tenantId manquant');
    return { notified: 0 };
  }

  const clients = await prismaInstance.user.findMany({
    where: {
      tenantId,
      role: 'CLIENT',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      fcmToken: true,  // <-- Récupérer le fcmToken
      name: true,
    },
  });

  // Creer notification en base
  const notification = await prismaInstance.notification.create({
    data: {
      tenantId,
      type: 'CAMPAGNE_NOUVELLE',
      title: 'Nouvelle formation disponible',
      message: `${campagne.title || campagne.titre} est maintenant ouverte aux inscriptions !`,
      campagneId: campagne.id,
      read: false,
      priority: 1,
    },
  });

  // Creer les recipients
  await prismaInstance.notificationRecipient.createMany({
    data: clients.map(client => ({
      notificationId: notification.id,
      userId: client.id,
      channels: ['EMAIL', 'PUSH'],
    })),
  });

  // Envoyer emails
  for (const client of clients) {
    if (client.email) {
      await sendEmail(
        client.email,
        'Nouvelle formation disponible !',
        `<h2>${campagne.title || campagne.titre}</h2><p>${campagne.description}</p><p><a href="http://localhost:3000/campagnes/${campagne.id}">Voir les details</a></p>`,
        `${campagne.title || campagne.titre} est maintenant ouverte aux inscriptions !`
      );
    }
  }

  // Envoyer push (utilise User.fcmToken)
  for (const client of clients) {
    const token = client.fcmToken;
    if (token) {
      await sendPush(token, 'Nouvelle formation !', `${campagne.title || campagne.titre} est disponible.`, {
        campagneId: campagne.id,
        type: 'CAMPAGNE_NOUVELLE',
      });
    }
  }

  // Emettre evenement Socket.io
  const io = global.io;
  if (io) {
    clients.forEach(client => {
      io.to(`user_${client.id}`).emit('notification', {
        id: notification.id,
        type: 'CAMPAGNE_NOUVELLE',
        title: 'Nouvelle formation disponible',
        message: `${campagne.title || campagne.titre} est maintenant ouverte aux inscriptions !`,
        campagneId: campagne.id,
        createdAt: new Date().toISOString(),
      });
    });
  }

  console.log(`[NOTIFY AUTO] ${clients.length} clients notifies`);
  return { notified: clients.length };
}

module.exports = {
  sendEmail,
  sendPush,
  manualDiffusion,
  notifyNewCampagne,
};