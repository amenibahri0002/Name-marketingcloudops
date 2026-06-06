// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const T = {
  bg: '#f0f2f8',
  card: '#ffffff',
  navy: '#16120d',
  gold: '#f5a623',
  border: '#e4e9f2',
  text: '#1a1f3c',
  muted: '#7a8599',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
  sans: "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

// Données mock pour DigiLab Solutions
const ADMIN_DATA = {
  mrr: '45,200 TND',
  mrrValue: 45200,
  clients: 47,
  campaigns: 128,
  activeCampaigns: 12,
  churnRate: '2.1%',
  urgentTickets: 3,
  alerts: [
    { type: 'danger', message: '2 paiements échoués — Clients #42 et #38', action: '/facturation/echecs' },
    { type: 'warning', message: '3 tickets support en attente > 4h', action: '/support' },
    { type: 'warning', message: 'Queue SMS: 12,450 messages en attente', action: '/cloud-operations' },
  ],
  kpis: [
    { label: 'MRR', value: '45,200 TND', change: '+8%', icon: '💰', color: '#f5a623' },
    { label: 'Clients Actifs', value: '47', change: '+3', icon: '🏢', color: '#3b82f6' },
    { label: 'Churn Rate', value: '2.1%', change: '-0.5%', icon: '📉', color: '#8b5cf6' },
    { label: 'Tickets Urgents', value: '3', change: '-2', icon: '🎫', color: '#ef4444' },
  ],
  topClients: [
    { name: 'Tunisie Telecom', plan: 'Enterprise', mrr: '2,500 TND/mois', status: 'active', growth: '+15%' },
    { name: 'Banque Zitouna', plan: 'Enterprise', mrr: '1,800 TND/mois', status: 'active', growth: '+22%' },
    { name: 'Ooredoo Tunisie', plan: 'Agency', mrr: '1,500 TND/mois', status: 'active', growth: '+8%' },
    { name: 'Medina Tech', plan: 'Agency', mrr: '950 TND/mois', status: 'active', growth: '+30%' },
    { name: 'Carthage Group', plan: 'Enterprise', mrr: '1,200 TND/mois', status: 'active', growth: '+12%' },
  ],
  campaigns: [
    { id: 1, title: 'Promo Ramadan 2026', client: 'Tunisie Telecom', status: 'review', type: 'sms', reason: 'Spam suspecté' },
    { id: 2, title: 'Lancement App Mobile', client: 'Banque Zitouna', status: 'active', type: 'push', reason: null },
    { id: 3, title: 'Newsletter Hebdo', client: 'Ooredoo Tunisie', status: 'active', type: 'email', reason: null },
    { id: 4, title: 'Black Friday Early', client: 'Medina Tech', status: 'failed', type: 'email', reason: 'Bounce rate > 15%' },
    { id: 5, title: 'Campagne Été 2026', client: 'Carthage Group', status: 'scheduled', type: 'multicanal', reason: null },
  ],
  planDistribution: [
    { label: 'Starter', value: 14, color: '#3b82f6' },
    { label: 'Agency', value: 26, color: '#f5a623' },
    { label: 'Enterprise', value: 7, color: '#8b5cf6' },
  ],
  revenueData: [8200, 9500, 11200, 10800, 12500, 14200, 13800, 15600, 14900, 16800, 17500, 18900],
  revenueLabels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);
    
    // Vérification rôle admin
    if ((u.role || '').toUpperCase() !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    // Simuler chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (loading) {
    return React.createElement('div', {
      style: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.bg,
        fontFamily: T.sans
      }
    }, 
      React.createElement('div', { style: { textAlign: 'center' } },
        React.createElement('div', {
          style: {
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid ' + T.border,
            borderTopColor: T.gold,
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }
        }),
        React.createElement('span', { style: { color: T.muted, fontSize: 15 } }, 'Chargement de la console admin...')
      ),
      React.createElement('style', null, '@keyframes spin { to { transform: rotate(360deg); } }')
    );
  }

  // Helper pour créer des éléments
  const el = React.createElement;

  return el('div', {
    style: { background: T.bg, minHeight: '100vh', fontFamily: T.sans, padding: '28px 32px' }
  }, [
    // Style global
    el('style', { key: 'style' }, `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      @keyframes spin { to{transform:rotate(360deg)} }
    `),
    
    // Header
    el('div', { key: 'header', style: { marginBottom: 28, animation: 'fadeUp 0.5s ease both' } }, [
      el('div', { key: 'header-flex', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }, [
        el('div', { key: 'header-left' }, [
          el('div', { key: 'badge', style: { fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '2.5px', marginBottom: 8, textTransform: 'uppercase' } }, '⚡ DigiPip Admin Console'),
          el('h1', { key: 'title', style: { fontSize: 30, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.2 } }, greeting + ', Administrateur 👋'),
          el('p', { key: 'subtitle', style: { fontSize: 14, color: T.muted, maxWidth: 520, lineHeight: 1.6 } }, 'Vue d\'ensemble de la plateforme DigiLab Solutions — gestion des clients, campagnes et infrastructure cloud.')
        ]),
        el('div', { key: 'status', style: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' } }, [
          el('span', { key: 'dot', style: { width: 8, height: 8, borderRadius: '50%', background: T.green, boxShadow: '0 0 8px ' + T.green } }),
          el('span', { key: 'text', style: { fontSize: 12, color: T.green, fontWeight: 700 } }, 'Système opérationnel')
        ])
      ])
    ]),
    
    // Alertes
    el('div', { key: 'alerts', style: { marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 } },
      ADMIN_DATA.alerts.map((alert, i) => 
        el('div', {
          key: 'alert-' + i,
          style: {
            padding: '14px 20px', borderRadius: 14,
            background: alert.type === 'danger' ? 'rgba(239,68,68,0.10)' : 'rgba(245,166,35,0.10)',
            border: '1px solid ' + (alert.type === 'danger' ? 'rgba(239,68,68,0.25)' : 'rgba(245,166,35,0.25)'),
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            animation: 'fadeUp 0.4s ease ' + (i * 100) + 'ms both'
          }
        }, [
          el('span', { key: 'msg', style: { fontSize: 13, fontWeight: 600, color: alert.type === 'danger' ? T.red : T.gold } }, 
            (alert.type === 'danger' ? '🔴 ' : '🟡 ') + alert.message
          ),
          el('button', {
            key: 'btn',
            onClick: () => navigate(alert.action),
            style: { fontSize: 12, fontWeight: 700, color: alert.type === 'danger' ? T.red : T.gold, background: 'none', border: 'none', cursor: 'pointer' }
          }, 'Voir →')
        ])
      )
    ),
    
    // KPIs
    el('div', { key: 'kpis', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 } },
      ADMIN_DATA.kpis.map((kpi, i) => 
        el('div', {
          key: 'kpi-' + i,
          onClick: () => navigate(kpi.route || '/'),
          style: {
            background: T.card, borderRadius: 18, padding: '24px 22px 20px',
            border: '1.5px solid ' + T.border,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            animation: 'fadeUp 0.5s ease ' + (i * 80) + 'ms both'
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 16px 40px ' + kpi.color + '18';
            e.currentTarget.style.borderColor = kpi.color;
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            e.currentTarget.style.borderColor = T.border;
          }
        }, [
          el('div', { key: 'kpi-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 } }, [
            el('span', { key: 'label', style: { fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1.5px' } }, kpi.label),
            el('span', { key: 'icon', style: { fontSize: 22 } }, kpi.icon)
          ]),
          el('div', { key: 'value', style: { fontSize: 32, fontWeight: 800, color: kpi.color, lineHeight: 1, marginBottom: 8 } }, kpi.value),
          el('span', { key: 'change', style: { fontSize: 12, fontWeight: 600, color: kpi.change.startsWith('+') ? T.green : kpi.change.startsWith('-') && kpi.label !== 'Churn Rate' ? T.red : T.green } }, kpi.change + ' vs mois dernier')
        ])
      )
    ),
    
    // Footer
    el('div', { key: 'footer', style: { padding: '20px 0', borderTop: '1px solid ' + T.border, textAlign: 'center', marginTop: 40 } },
      el('span', { style: { fontSize: 12, color: T.muted } }, '© 2026 DigiLab Solutions · Tunisie · Admin Console · DigiPip Cloud Engine')
    )
  ]);
};

export default AdminDashboard;