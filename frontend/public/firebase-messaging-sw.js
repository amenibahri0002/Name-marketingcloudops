// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuration Firebase - DigiPip
firebase.initializeApp({
  apiKey: "AIzaSyD7VHpmGCkQoLGfSCFAn4iXJyoiA987N1g",
  authDomain: "digipip-c0d46.firebaseapp.com",
  projectId: "digipip-c0d46",
  storageBucket: "digipip-c0d46.appspot.com",
  messagingSenderId: "1097813700730",
  appId: "1:1097813700730:web:af3f6df9b1ec1ec1968bc",
});

const messaging = firebase.messaging();

// Gérer les messages en arrière-plan (app fermée)
messaging.onBackgroundMessage(async (payload) => {
  console.log('Message en arrière-plan reçu:', payload);

  const notificationTitle = payload.notification?.title || 'DigiPip';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data,
    tag: 'digipip-notification',
    requireInteraction: true,
  };

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // Sauvegarder la notification en base via l'API
  // Note: En arrière-plan, on ne peut pas faire de fetch authentifié facilement
  // La notification sera sauvegardée quand l'app sera ouverte
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/notifications');
      }
    })
  );
});