import React, { useState, useEffect } from 'react';
import api from '../api';

function Monitoring() {
  const [health, setHealth] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/api/alertes/health');
      setHealth(res.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) => {
    if (status === 'ok') return '#059669';
    if (status === 'warning') return '#d97706';
    return '#ef4444';
  };

  const statusEmoji = (status) => {
    if (status === 'ok') return '✅';
    if (status === 'warning') return '⚠️';
    return '❌';
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h2>🔍 Monitoring & Alertes</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 14 }}>Dernière mise à jour: {lastUpdate}</span>
          <button onClick={fetchHealth} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {health && (
        <>
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            <div style={{ background: '#4f46e5', borderRadius: 12, padding: 20, color: 'white', textAlign: 'center', minWidth: 150 }}>
              <div style={{ fontSize: 30 }}>👥</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{health.stats.totalClients}</div>
              <div>Clients</div>
            </div>
            <div style={{ background: '#0891b2', borderRadius: 12, padding: 20, color: 'white', textAlign: 'center', minWidth: 150 }}>
              <div style={{ fontSize: 30 }}>📋</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{health.stats.totalContacts}</div>
              <div>Contacts</div>
            </div>
            <div style={{ background: '#059669', borderRadius: 12, padding: 20, color: 'white', textAlign: 'center', minWidth: 150 }}>
              <div style={{ fontSize: 30 }}>📢</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{health.stats.totalCampagnes}</div>
              <div>Campagnes</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 15 }}>État des services</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Service</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {health.alertes.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{a.service}</td>
                  <td style={{ padding: 10 }}>
                    <span style={{ background: statusColor(a.status), color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                      {statusEmoji(a.status)} {a.status}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Monitoring;