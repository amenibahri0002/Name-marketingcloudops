import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  border:     '#e5e9f2',
  navy:       '#16120d',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  goldDim:    'rgba(245,166,35,0.12)',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  green:      '#22c55e',
  blue:       '#3b82f6',
  orange:     '#f5a623',
  red:        '#ef4444',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes drawLine { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
  .stat-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  .stat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(245,166,35,0.18) !important; border-color: #f5a623 !important; }
`;

function Sparkline({ color, data }) {
  const w = 88, h = 38;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [canaux, setCanaux] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);

    Promise.all([
      api.get('/api/dashboard/stats').catch(() => ({ data: {} })),
      api.get('/api/dashboard/evolution').catch(() => ({ data: {} })),
      api.get('/api/dashboard/canaux').catch(() => ({ data: [] })),
    ]).then(([s, e, c]) => {
      setStats(s.data);
      setEvolution(e.data);
      setCanaux(c.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const isClient = user.role === 'CLIENT';

  const statCards = [
    { key: 'clients',    label: 'CLIENTS',     value: stats?.clients ?? 12,    icon: '👥', color: C.gold,     route: '/clients' },
    { key: 'campagnes',  label: 'CAMPAGNES',   value: stats?.campagnes ?? 7,   icon: '📢', color: C.orange,  route: '/campagnes' },
    { key: 'contacts',   label: 'CONTACTS',    value: stats?.contacts ?? 1240, icon: '📋', color: C.green,   route: '/contacts' },
    { key: 'segments',   label: 'SEGMENTS',    value: stats?.segments ?? 9,    icon: '🎯', color: C.blue,    route: '/segments' },
  ];

  const evoLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const evoData = [
    { label: 'Email', color: C.blue,   data: [8200, 12500, 9800, 15200, 13100, 17800, 14200] },
    { label: 'SMS',   color: C.green,  data: [3100, 4200, 3800, 5100, 4600, 5800, 4900] },
    { label: 'Push',  color: C.orange, data: [1800, 2900, 3200, 4100, 3700, 4500, 3900] },
  ];

  const canauxData = canaux?.length ? canaux : [
    { label: 'Email', pct: 68, color: C.blue,   icon: '📧' },
    { label: 'SMS',   pct: 52, color: C.green,  icon: '💬' },
    { label: 'Push',  pct: 81, color: C.orange, icon: '🔔' },
  ];

  const firstName = user.name?.split(' ')[0] || 'Cher client';

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        Chargement du tableau de bord...
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '32px' }}>
      <style>{css}</style>

      {/* Hero Welcome */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #2a2118 100%)`,
        borderRadius: 20, padding: '36px 40px', marginBottom: 32,
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -60, width: 220, height: 220, background: 'rgba(245,166,35,0.08)', borderRadius: '50%' }} />
        
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: '2px', marginBottom: 8 }}>
          BIENVENUE SUR DIGIPIP
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Bonjour, {firstName} 👋
        </h1>
        <p style={{ fontSize: 15.5, opacity: 0.85, maxWidth: 520 }}>
          {isClient 
            ? "Voici l’état de vos campagnes et performances marketing." 
            : "Voici un aperçu global de votre plateforme."}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map((card, i) => (
          <div
            key={card.key}
            className="stat-card"
            onClick={() => navigate(card.route)}
            style={{
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 18,
              padding: '28px 26px',
              cursor: 'pointer',
              animation: `fadeUp 0.5s ease ${i * 60}ms both`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: C.textMuted }}>{card.label}</span>
              <div style={{ fontSize: 26 }}>{card.icon}</div>
            </div>

            <div style={{ fontSize: 42, fontWeight: 800, color: card.color, marginBottom: 4 }}>
              {card.value.toLocaleString('fr-FR')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Total</span>
              <Sparkline color={card.color} data={[2, 3, 2.5, 4, 3.8, 5, 4.5]} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        
        {/* Evolution Chart */}
        <div style={{ background: C.card, borderRadius: 18, padding: '28px', border: `2px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Évolution des envois (7 jours)</div>
              <div style={{ fontSize: 13, color: C.textMuted }}>Comparaison par canal</div>
            </div>
            <button onClick={() => navigate('/analytics')} style={{ color: C.gold, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Détails →
            </button>
          </div>
          {/* MiniChart component ici si tu veux la garder */}
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>
            [Graphique d'évolution - à compléter avec MiniChart]
          </div>
        </div>

        {/* Canaux */}
        <div style={{ background: C.card, borderRadius: 18, padding: '28px', border: `2px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Répartition par Canal</div>
          {canauxData.map((c, i) => (
            <div key={i} style={{ marginBottom: i < canauxData.length - 1 ? 16 : 0 }}>
              <CanalBar label={c.label} pct={c.pct} color={c.color} icon={c.icon} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Composant CanalBar */
function CanalBar({ label, pct, color, icon }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontWeight: 600 }}>{label}</span>
        </div>
        <span style={{ fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: '#e5e9f2', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 1.2s ease' }} />
      </div>
    </div>
  );
}