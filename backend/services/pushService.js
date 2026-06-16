// services/pushService.js - CORRIGÉ pour local + Render
const fs = require('fs');
const path = require('path');

// Mode local : désactiver Firebase si pas de config valide
const isLocal = !process.env.RENDER && !process.env.FIREBASE_SERVICE_ACCOUNT;

if (isLocal) {
  console.log('[FIREBASE] ℹ️ Mode local - Push notifications désactivées');
  module.exports = { 
    sendPush: async () => ({ 
      success: false, 
      note: 'Mode local - Firebase désactivé',
      message: 'Les push notifications fonctionnent uniquement sur Render'
    }),
    firebaseInitialized: false 
  };
  return; // ← STOP ici en local
}

// Suite pour Render uniquement
const admin = require('firebase-admin');

let firebaseInitialized = false;

function fixPrivateKey(key) {
  if (!key) return null;
  // Remplacer les \n littéraux par des vrais retours à la ligne
  let fixed = key.replace(/\\n/g, '\n');
  if (!fixed.includes('BEGIN PRIVATE KEY')) {
    console.error('[FIREBASE] ❌ Clé privée invalide');
    return null;
  }
  return fixed;
}

function initializeFirebase() {
  if (admin.apps.length > 0) {
    firebaseInitialized = true;
    return;
  }

  try {
    let serviceAccount;

    // Option 1: Variable d'environnement (Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('[FIREBASE] ✅ Config chargée depuis FIREBASE_SERVICE_ACCOUNT');
      } catch (err) {
        console.error('[FIREBASE] ❌ Erreur parsing FIREBASE_SERVICE_ACCOUNT:', err.message);
      }
    }

    // Option 2: Fichier JSON (Local avec fichier)
    if (!serviceAccount) {
      const localPath = path.join(__dirname, '..', 'firebase-service-account.json');
      if (fs.existsSync(localPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        console.log('[FIREBASE] ✅ Config chargée depuis firebase-service-account.json');
      }
    }

    // Option 3: Fichier dans un dossier config
    if (!serviceAccount) {
      const configPath = path.join(__dirname, '..', 'config', 'firebase-service-account.json');
      if (fs.existsSync(configPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('[FIREBASE] ✅ Config chargée depuis config/firebase-service-account.json');
      }
    }

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = fixPrivateKey(serviceAccount.private_key);
      
      if (!serviceAccount.private_key) {
        throw new Error('Clé privée invalide après correction');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('[FIREBASE] ✅ Admin SDK initialisé avec succès');
    } else {
      console.log('[FIREBASE] ⚠️ Aucune config trouvée - Push notifications désactivées');
    }

  } catch (err) {
    console.error('[FIREBASE] ❌ Erreur initialisation:', err.message);
    console.log('[FIREBASE] ℹ️ Push notifications désactivées');
  }
}

initializeFirebase();

async function sendPush(notification) {
  try {
    if (!firebaseInitialized) {
      return { 
        success: false, 
        error: 'Firebase non configuré',
        note: 'Créez firebase-service-account.json ou set FIREBASE_SERVICE_ACCOUNT'
      };
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const users = await prisma.user.findMany({
      where: { 
        role: 'CLIENT',
        fcmToken: { not: null }
      },
      select: { fcmToken: true, name: true, email: true }
    });

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

module.exports = { sendPush, firebaseInitialized };