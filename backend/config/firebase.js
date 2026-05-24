const admin = require('firebase-admin')

let firebaseApp = null;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || raw === 'undefined' || raw === '{}') {
    console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT non configuré — Push désactivé');
  } else {
    const serviceAccount = JSON.parse(raw);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseApp = admin;
      console.log('[Firebase] ✓ Initialisé avec succès');
    } else {
      firebaseApp = admin;
    }
  }
} catch (err) {
  console.warn('[Firebase] Initialisation échouée (Push désactivé) :', err.message);
}

// Export un mock si Firebase n'est pas configuré
module.exports = firebaseApp || {
  messaging: () => ({
    send: async () => {
      console.warn('[Firebase] Push ignoré — Firebase non configuré');
      return 'mock-message-id';
    }
  })
};