import { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Utilise ton api.js existant

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier support
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);

    // Vérifier si déjà inscrit
    if (isSupported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      setSubscribed(!!subscription);
    } catch (err) {
      console.log('Pas encore d\'abonnement push');
    }
  };

  // ============================================
  // MÉTHODE 1 : Firebase Cloud Messaging (RECOMMANDÉ)
  // ============================================
  const subscribeFirebase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Demander permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission de notification refusée');
      }

      // 2. Récupérer le token FCM
      const { getToken } = await import('firebase/messaging');
      const { messaging } = await import('../firebase'); // ton fichier firebase.js

      const token = await getToken(messaging, {
        vapidKey: 'BEz6DDjH1Aemi_T4VObvtk0TObMx0IXbdhjfpY_GUw4zvPYtobCgoycPMj3CewDAOV4s61CKFWXqfuOR-zZi77w'
      });

      if (!token) {
        throw new Error('Impossible d\'obtenir le token FCM');
      }

      console.log('[PUSH] Token FCM:', token);

      // 3. Envoyer au backend
      await api.post('/api/users/fcm-token', { fcmToken: token });

      setSubscribed(true);
      localStorage.setItem('fcmToken', token);

    } catch (err) {
      console.error('[PUSH] Erreur Firebase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // MÉTHODE 2 : Web Push API (VAPID) - Fallback
  // ============================================
  const subscribeVAPID = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission refusée');
      }

      // 1. Enregistrer le SW
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // 2. Récupérer la clé VAPID du backend
      const { data: { publicKey } } = await api.get('/api/notifications/vapid-key');

      // 3. S'abonner
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // 4. Envoyer au backend
      await api.post('/api/notifications/subscribe', {
        subscription: JSON.stringify(subscription)
      });

      setSubscribed(true);
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));

    } catch (err) {
      console.error('[PUSH] Erreur VAPID:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // DÉSABONNEMENT
  // ============================================
  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/api/notifications/unsubscribe');
      }

      setSubscribed(false);
      localStorage.removeItem('fcmToken');
      localStorage.removeItem('pushSubscription');

    } catch (err) {
      console.error('[PUSH] Erreur désabonnement:', err);
    }
  }, []);

  // Helper pour convertir VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  return {
    supported,
    subscribed,
    loading,
    error,
    subscribeFirebase,  // Recommandé
    subscribeVAPID,     // Fallback
    unsubscribe
  };
}