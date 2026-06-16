import React from 'react';
import { Bell, BellOff, Loader } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const THEME = {
  gold: '#f5a623',
  goldLight: '#fff8e7',
  text: '#1e293b',
  textLight: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
};

export default function PushNotificationButton() {
  const { supported, subscribed, loading, error, subscribeFirebase, unsubscribe } = usePushNotifications();

  if (!supported) {
    return (
      <div style={{ padding: '0.5rem', color: THEME.textLight, fontSize: '0.85rem' }}>
        <BellOff size={16} /> Notifications non supportées
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={subscribed ? unsubscribe : subscribeFirebase}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '8px 16px',
          borderRadius: 10,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: subscribed ? THEME.successLight : THEME.goldLight,
          color: subscribed ? THEME.success : THEME.gold,
          fontWeight: 600,
          fontSize: '0.85rem',
          transition: 'all 0.2s'
        }}
      >
        {loading ? (
          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
        ) : subscribed ? (
          <Bell size={16} />
        ) : (
          <BellOff size={16} />
        )}
        {loading ? 'Chargement...' : subscribed ? 'Notifications actives' : 'Activer notifications'}
      </button>

      {error && (
        <p style={{ color: THEME.danger, fontSize: '0.75rem', marginTop: '0.5rem' }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}