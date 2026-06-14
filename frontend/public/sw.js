self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'MarketingCloudOps'
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { url: data.url || '/' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
  // frontend/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
   apiKey: "AIzaSyD7VHpmGCkQoLGfSCFAn4iXJyoiA987N1g",
  authDomain: "digipip-c0d46.firebaseapp.com",
  projectId: "digipip-c0d46",
  storageBucket: "digipip-c0d46.firebasestorage.app",
  messagingSenderId: "1097813700730",
  appId: "1:1097813700730:web:af3f6df9b1ec1ec1968bc3",
  measurementId: "G-N0ES6X84W3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Message en arrière-plan:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
})