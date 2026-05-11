import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  border:     '#e5e9f2',
  navy:       '#16120d',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  green:      '#22c55e',
  blue:       '#3b82f6',
  orange:     '#f5a623',
  purple:     '#8b5cf6',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [evolution, setEvolution] = useState(null);
  const [canaux, setCanaux] = useState([]);
  const [realtime, setRealtime] = useState({ usersOnline: 0 });
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
          api.get('/api/dashboard/realtime'),
        ]);

        setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : {
          clients: 18,
          campagnes: 12,
          contacts: 2450,
          segments: 15,
          campagnesActives: 7,
          roas: 4.2,
          budgetConsomme: 18750
        });

        setEvolution(evoRes.status === 'fulfilled' ? evoRes.value.data : null);
        setCanaux(canauxRes.status === 'fulfilled' ? canauxRes.value.data : [
          { label: 'Email', pct: 68, color: C.blue, icon: '📧' },
          { label: 'SMS',   pct: 52, color: C.green, icon: '💬' },
          { label: 'Push',  pct: 81, color: C.orange, icon: '🔔' },
        ]);
        setRealtime(realtimeRes.status === 'fulfilled' ? realtimeRes.value.data : { usersOnline: 23 });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const firstName = user.name?.split(' ')[0] || 'Cher utilisateur';
  const isClient = user.role === 'CLIENT';

  const chartData = {
    labels: evolution?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      { label: 'Email', data: evolution?.email || [8200,12500,9800,15200,13100,17800,14200], borderColor: '#3b82f6', tension: 0.4, fill: false },
      { label: 'SMS',   data: evolution?.sms   || [3100,4200,3800,5100,4600,5800,4900], borderColor: '#22c55e', tension: 0.4, fill: false },
      { label: 'Push',  data: evolution?.push  || [1800,2900,3200,4100,3700,4500,3900], borderColor: '#f5a623', tension: 0.4, fill: false },
    ],
  };

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg}}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #2a2118 100%)`,
        borderRadius: 24, padding: '40px 48px', marginBottom: 40, color: 'white', position: 'relative'
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
          Bonjour, {firstName} 👋
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9 }}>
          {isClient ? "Vue d’ensemble de vos performances marketing" : "État global de la plateforme MarketingCloudOps"}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
        {[
          { label: 'Campagnes Actives', value: stats.campagnesActives || 7, icon: '🚀', color: C.gold, route: '/campagnes' },
          { label: 'ROAS Moyen', value: `${stats.roas || 4.2}x`, icon: '💰', color: C.green, route: '/analytics' },
          { label: 'Budget Consommé', value: `${(stats.budgetConsomme || 18750).toLocaleString('fr-FR')} €`, icon: '☁️', color: C.orange },
          { label: 'Contacts', value: (stats.contacts || 2450).toLocaleString('fr-FR'), icon: '👥', color: C.blue, route: '/contacts' },
        ].map((card, i) => (
          <div key={i} onClick={() => card.route && navigate(card.route)} style={{
            background: C.card, border: `2px solid ${C.border}`, borderRadius: 20,
            padding: '32px 28px', cursor: card.route ? 'pointer' : 'default'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted }}>{card.label}</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: card.color, marginTop: 8 }}>{card.value}</div>
              </div>
              <div style={{ fontSize: 32 }}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Graph + Canaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ background: C.card, borderRadius: 20, padding: 32, border: `2px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Évolution des envois (7 jours)</h3>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>

        <div style={{ background: C.card, borderRadius: 20, padding: 32, border: `2px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Répartition par Canal</h3>
          {canaux.map((c, i) => (
            <div key={i} style={{ marginBottom: i < canaux.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontWeight: 600 }}>{c.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: c.color }}>{c.pct}%</span>
              </div>
              <div style={{ height: 8, background: '#e5e9f2', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}