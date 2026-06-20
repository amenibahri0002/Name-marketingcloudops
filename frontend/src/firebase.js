// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from './api';

// Configuration Firebase - DigiPip
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "digipip-c0d46.firebaseapp.com",
  projectId: "digipip-c0d46",
  storageBucket: "digipip-c0d46.appspot.com",
  messagingSenderId: "1097813700730",
  appId: "1:1097813700730:web:af3f6df9b1ec1ec1968bc",
};

// Clé VAPID publique pour Web Push
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Sauvegarder une notification reçue en base de données
 */
async function saveNotification(payload) {
  try {
    const notificationData = {
      title: payload.notification?.title || 'DigiPip',
      message: payload.notification?.body || '',
      type: payload.data?.type || 'CAMPAGNE_PROMO',
      campagneId: payload.data?.campagneId || null,
      priority: 1,
    };

    await api.post('/api/notifications/receive', notificationData);
    console.log('✅ Notification sauvegardée en base');
  } catch (err) {
    console.error('❌ Erreur sauvegarde notification:', err);
  }
}

/**
 * Demander la permission de notifications et obtenir le token FCM
 * Envoie automatiquement le token au backend
 */
export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permission de notification refusée');
      return null;
    }

    // Enregistrer le service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker enregistré:', registration);

    // Obtenir le token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token obtenu:', token);

      // Envoyer le token au backend
      try {
        await api.post('/api/users/fcm-token', { fcmToken: token });
        console.log('Token FCM envoyé au backend');
      } catch (err) {
        console.error('Erreur envoi token au backend:', err);
      }

      return token;
    } else {
      console.log('Aucun token FCM disponible');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}

/**
 * Écouter les messages en premier plan (app ouverte)
 * Sauvegarde automatiquement la notification en base
 */
export function onForegroundMessage(callback) {
  onMessage(messaging, async (payload) => {
    console.log('Message reçu en premier plan:', payload);

    // Sauvegarder la notification en base
    await saveNotification(payload);

    // Appeler le callback pour afficher le toast
    callback(payload);
  });
}

export { messaging };