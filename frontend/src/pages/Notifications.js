import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../firebase';

export default function Notifications() {
  const [status, setStatus] = useState('default');
  const [token, setToken] = useState(null);

  useEffect(() => {
    setStatus(Notification.permission);
  }, []);

  const enable = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setStatus('granted');
      setToken(fcmToken);
      
      // Sauvegarder dans le backend
      await fetch('https://marketingcloudops-backend.onrender.com/api/users/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fcmToken })
      });
      
      alert('✅ Notifications activées !');
    } else {
      setStatus('denied');
      alert('❌ Permission refusée');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: '#1a160e', marginBottom: '1.5rem' }}>🔔 Notifications</h2>
      
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a160e' }}>
              Notifications push
            </h3>
            <p style={{ margin: 0, color: '#9c8f7a', fontSize: '0.9rem' }}>
              Recevez les alertes nouvelles formations et rappels
            </p>
          </div>
          
          <button
            onClick={enable}
            disabled={status === 'granted'}
            style={{
              padding: '10px 24px',
              background: status === 'granted' 
                ? 'rgba(16,185,129,0.1)' 
                : 'linear-gradient(135deg, #f5a623, #d48a1a)',
              color: status === 'granted' ? '#10b981' : 'white',
              border: 'none',
              borderRadius: 10,
              cursor: status === 'granted' ? 'default' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {status === 'granted' ? '✅ Activé' : 'Activer'}
          </button>
        </div>

        {status === 'granted' && (
          <div style={{
            padding: '1rem',
            background: 'rgba(16,185,129,0.05)',
            borderRadius: 10,
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontWeight: 600 }}>
              ✅ Notifications activées
            </p>
            <p style={{ margin: 0, color: '#9c8f7a', fontSize: '0.8rem' }}>
              Vous recevrez les alertes sur cet appareil
            </p>
          </div>
        )}

        {status === 'denied' && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239,68,68,0.05)',
            borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontWeight: 600 }}>
              ❌ Notifications bloquées
            </p>
            <p style={{ margin: 0, color: '#9c8f7a', fontSize: '0.8rem' }}>
              Modifiez les paramètres de votre navigateur pour autoriser
            </p>
          </div>
        )}
      </div>
    </div>
  );
}