// ============================================
// FIREBASE MESSAGING SERVICE WORKER
// ============================================
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD7VHpmGCkQoLGfSCFAn4iXJyoiA987N1g",
  authDomain: "digipip-c0d46.firebaseapp.com",
  projectId: "digipip-c0d46",
  storageBucket: "digipip-c0d46.firebasestorage.app",
  messagingSenderId: "1097813700730",
  appId: "1:1097813700730:web:af3f6df9b1ec1ec1968bc3",
  measurementId: "G-N0ES6X84W3"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ============================================
// MESSAGES EN ARRIÈRE-PLAN (Firebase)
// ============================================
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message Firebase reçu:', payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  const notificationOptions = {
    body: body || 'Nouvelle notification',
    icon: '/logo192.png',
    badge: '/badge.png',
    data: {
      url: data.url || '/notifications',
      type: data.type || 'system',
      ...data
    },
    actions: [
      { action: 'open', title: '🔍 Voir' },
      { action: 'close', title: '❌ Fermer' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(title || 'DigiPip', notificationOptions);
});

// ============================================
// PUSH API STANDARD (Web Push VAPID)
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push standard reçu:', event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    console.error('[SW] Erreur parsing push data:', err);
  }

  const title = data.title || data.notification?.title || '🔔 DigiPip';
  const body = data.body || data.notification?.body || 'Nouvelle notification';
  const url = data.url || data.data?.url || '/notifications';

  const options = {
    body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: { url, type: data.type || 'push' },
    actions: [
      { action: 'open', title: '🔍 Voir' },
      { action: 'close', title: '❌ Fermer' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================
// CLIC SUR NOTIFICATION
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification:', event);
  event.notification.close();

  const url = event.notification.data?.url || '/notifications';

  if (event.action === 'close') {
    return;
  }

  // Ouvrir ou focus la fenêtre existante
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ============================================
// FERMETURE NOTIFICATION
// ============================================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée:', event.notification);
});

// ============================================
// INSTALLATION DU SW
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activé');
  event.waitUntil(clients.claim());
});