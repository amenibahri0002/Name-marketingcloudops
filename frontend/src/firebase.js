// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7VHpmGCkQoLGfSCFAn4iXJyoiA987N1g",
  authDomain: "digipip-c0d46.firebaseapp.com",
  projectId: "digipip-c0d46",
  storageBucket: "digipip-c0d46.firebasestorage.app",
  messagingSenderId: "1097813700730",
  appId: "1:1097813700730:web:af3f6df9b1ec1ec1968bc3",
  measurementId: "G-N0ES6X84W3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ============================================================
// DEMANDER LA PERMISSION ET RÉCUPÉRER LE TOKEN FCM
// ============================================================
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

    const token = await getToken(messaging, {
      vapidKey: "BCjzqK4FtbHdMZ3qbgfJWvQtdoLhguDuh88kexG7YtifLxTEkzbL-91LqjvkbRxU_D55NhjY95fWGXxVaEUNPW0"
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('Erreur permission notification:', err);
    return null;
  }
}

// ============================================================
// ÉCOUTER LES MESSAGES EN PREMIER PLAN
// ============================================================
export function onForegroundMessage(callback) {
  onMessage(messaging, (payload) => {
    console.log('Message reçu en premier plan:', payload);
    callback(payload);
  });
}

export { messaging };