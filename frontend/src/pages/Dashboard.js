import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ clients: 0, campagnes: 0, contacts: 0, segments: 0 });
  const [recentCampagnes, setRecentCampagnes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

api.get('/auth/me').then(res => setUser(res.data)).catch(() => { localStorage.removeItem('token'); navigate('/login'); });

    Promise.all([
      api.get('/api/clients'),
      api.get('/api/campagnes'),
      api.get('/api/contacts'),
      api.get('/api/segments')
    ]).then(([clients, campagnes, contacts, segments]) => {
      setStats({
        clients: clients.data.length,
        campagnes: campagnes.data.length,
        contacts: contacts.data.length,
        segments: segments.data.length
      });
      setRecentCampagnes(campagnes.data.slice(0, 5));
    });
  }, [navigate]);

  const statCards = [
    { label: 'Clients', value: stats.clients, icon: '👥', color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Campagnes', value: stats.campagnes, icon: '📢', color: '#0891b2', bg: '#e0f7ff' },
    { label: 'Contacts', value: stats.contacts, icon: '📋', color: '#059669', bg: '#ecfdf5' },
    { label: 'Segments', value: stats.segments, icon: '🎯', color: '#d97706', bg: '#fffbeb' },
  ];

  const statusColor = (status) => {
    if (status === 'sent') return { bg: '#ecfdf5', color: '#059669' }
    if (status === 'scheduled') return { bg: '#e0f7ff', color: '#0891b2' }
    return { bg: '#f3f4f6', color: '#6b7280' }
  }

  return (
    <div>
      {/* Welcome */}
      {user && (
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            Bonjour, {user.name} 👋
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>
            Voici un aperçu de votre plateforme marketing
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #e8e8f0', padding: 20,
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: s.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 22
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent campaigns */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8e8f0', padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 16px' }}>
          Campagnes récentes
        </h2>
        {recentCampagnes.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>Aucune campagne</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Titre</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Client</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCampagnes.map(c => {
                const sc = statusColor(c.status)
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{c.title}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#6b7280' }}>{c.type}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#6b7280' }}>{c.client?.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;