import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://techevent-app.onrender.com';

const TYPE_STYLE = {
  email: { label: '📧 Email', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  sms:   { label: '📱 SMS',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
  push:  { label: '🔔 Push',  color: '#f5a623', bg: 'rgba(245,166,35,0.10)' },
};

export default function PublicCampagnes() {
  const [campagnes, setCampagnes] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/campagnes/public`)
      .then(res => setCampagnes(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f6fb',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#16120d', marginBottom: 8 }}>
            Campagnes en cours
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Découvrez nos dernières campagnes marketing
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            Chargement...
          </div>
        ) : campagnes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📢</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Aucune campagne disponible</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
            {campagnes.map(c => {
              const t = TYPE_STYLE[c.type?.toLowerCase()] || TYPE_STYLE.email;
              return (
                <div key={c.id} style={{
                  background: '#ffffff', borderRadius: 16,
                  border: '1.5px solid #e5e9f2',
                  padding: '22px 24px',
                  boxShadow: '0 1px 8px rgba(10,14,42,0.07)',
                  transition: 'transform .2s, box-shadow .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(245,166,35,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 1px 8px rgba(10,14,42,0.07)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <span style={{
                      background: t.bg, color: t.color,
                      padding: '3px 11px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700,
                    }}>{t.label}</span>
                    <span style={{
                      background: 'rgba(34,197,94,0.10)', color: '#16a34a',
                      padding: '3px 11px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>Envoyée</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1f3c', marginBottom: 8 }}>{c.title}</h3>
                  {c.client && (
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                      Par <strong>{c.client.name}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>
                    {c.sentAt
                      ? `Envoyé le ${new Date(c.sentAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}`
                      : `Créé le ${new Date(c.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}`
                    }
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}