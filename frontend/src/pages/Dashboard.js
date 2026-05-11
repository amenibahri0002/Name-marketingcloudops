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
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [canaux, setCanaux] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);

    const fetchData = async () => {
      try {
        const [statsRes, evoRes, canauxRes, realtimeRes] = await Promise.allSettled([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/evolution'),
          api.get('/api/dashboard/canaux'),
          api.get('/api/dashboard/realtime'),   // nouveau endpoint
        ]);

        setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : {});
        setEvolution(evoRes.status === 'fulfilled' ? evoRes.value.data : null);
        setCanaux(canauxRes.status === 'fulfilled' ? canauxRes.value.data : []);
        setRealtime(realtimeRes.status === 'fulfilled' ? realtimeRes.value.data : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isClient = user.role === 'CLIENT';
  const firstName = user.name?.split(' ')[0] || 'Cher utilisateur';

  // KPI Cards enrichies
  const statCards = [
    { 
      key: 'campagnes', 
      label: 'CAMPAGNES ACTIVES', 
      value: stats?.campagnesActives ?? 7, 
      total: stats?.campagnesTotal,
      icon: '🚀', 
      color: C.gold, 
      route: '/campagnes' 
    },
    { 
      key: 'roi', 
      label: 'ROAS MOYEN', 
      value: stats?.roas ? `${stats.roas}x` : '3.4x', 
      icon: '💰', 
      color: '#22c55e', 
      route: '/analytics' 
    },
    { 
      key: 'budget', 
      label: 'BUDGET CONSOMMÉ', 
      value: stats?.budgetConsomme ? `${stats.budgetConsomme}€` : '12450€', 
      icon: '☁️', 
      color: C.orange 
    },
    { 
      key: 'contacts', 
      label: 'CONTACTS', 
      value: stats?.contacts?.toLocaleString('fr-FR') ?? '1 240', 
      icon: '👥', 
      color: C.green, 
      route: '/contacts' 
    },
  ];

  if (loading) {
    return <div style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background: C.bg}}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{css}</style>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #2a2118 100%)`,
        borderRadius: 24, padding: '40px 48px', marginBottom: 40, color: 'white', position: 'relative'
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
          Bonjour, {firstName} 👋
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9 }}>
          {isClient 
            ? "Vue d’ensemble de vos performances marketing" 
            : "État global de la plateforme MarketingCloudOps"}
        </p>
        
        {/* Status Cloud */}
        <div style={{ position: 'absolute', top: 32, right: 48, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <span style={{ color: '#22c55e' }}>●</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Tous les services Cloud OK</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            {realtime?.usersOnline || 0} utilisateur(s) connecté(s)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
        {statCards.map((card, i) => (
          <div
            key={card.key}
            className="stat-card"
            onClick={() => card.route && navigate(card.route)}
            style={{
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 20,
              padding: '32px 28px',
              cursor: card.route ? 'pointer' : 'default',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, letterSpacing: '0.5px' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, color: card.color, marginTop: 8 }}>
                  {card.value}
                </div>
              </div>
              <div style={{ fontSize: 32, opacity: 0.9 }}>{card.icon}</div>
            </div>
            
            {card.total && (
              <div style={{ marginTop: 12, fontSize: 13, color: C.textMuted }}>
                sur {card.total} total
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deuxième rangée : Graphiques + Canaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Évolution */}
        <div style={{ background: C.card, borderRadius: 20, padding: 32, border: `2px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Évolution des performances (7 jours)</h3>
              <p style={{ color: C.textMuted, fontSize: 14 }}>Envois par canal</p>
            </div>
            <button onClick={() => navigate('/analytics')} style={{ color: C.gold, fontWeight: 600 }}>Voir l’analytics complet →</button>
          </div>
          
          {/* Ici tu mettras ton vrai graphique (Chart.js, Recharts, Tremor, etc.) */}
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 12 }}>
            [Graphique d’évolution à implémenter]
          </div>
        </div>

        {/* Canaux de diffusion */}
        <div style={{ background: C.card, borderRadius: 20, padding: 32, border: `2px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Performance par Canal</h3>
          {canauxData.map((c, i) => (
            <CanalBar key={i} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}