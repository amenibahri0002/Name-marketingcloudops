import React, { useState, useEffect } from 'react';

/* ─── Design System DigiLab Premium ───────────────────────────── */
const T = {
  bg:          '#f0f2f8',
  card:        '#ffffff',
  cardHover:   '#fdfaf5',
  navy:        '#0a0e2a',
  navyLight:   '#1a2152',
  gold:        '#f5a623',
  goldDark:    '#d4891a',
  goldDim:     'rgba(245,166,35,0.10)',
  goldBorder:  'rgba(245,166,35,0.30)',
  blue:        '#2563eb',
  blueDim:     'rgba(37,99,235,0.10)',
  green:       '#059669',
  greenDim:    'rgba(5,150,105,0.10)',
  purple:      '#7c3aed',
  purpleDim:   'rgba(124,58,237,0.10)',
  red:         '#dc2626',
  redDim:      'rgba(220,38,38,0.10)',
  orange:      '#f97316',
  orangeDim:   'rgba(249,115,22,0.10)',
  text:        '#1a1f3c',
  textMuted:   '#6b7280',
  border:      '#e5e9f2',
  shadow:      '0 1px 8px rgba(10,14,42,0.07)',
  shadowHover: '0 8px 28px rgba(245,166,35,0.18)',
  font:        "'Plus Jakarta Sans','Inter','Segoe UI',sans-serif",
};

/* 🔑 BAR_COLORS */
const BAR_COLORS = [T.gold, T.blue, T.green, T.purple, '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

/* ─── Données réelles DigiLab Solutions ─────────────────────────── */
const DIGILAB_CAMPAGNES = [
  { 
    id: 1, 
    title: 'Campagne Ramadan 2026', 
    client: 'Tunisie Telecom', 
    type: 'sms', 
    status: 'active', 
    createdAt: '2026-03-01', 
    clientId: 1,
    // Performance temps réel
    performance: {
      envois: 125000,
      ouvertures: 98750,
      clics: 45600,
      conversions: 12300,
      tauxOuverture: 79.0,
      tauxClic: 36.5,
      tauxConversion: 9.8,
      roi: 245,
    },
    live: {
      enCours: true,
      derniereActivite: '2026-06-08T11:45:00',
      vitesseEnvoi: 450, // par minute
      restant: 25000,
    }
  },
  { 
    id: 2, 
    title: 'Promo Été DigiLab', 
    client: 'DigiLab Solutions', 
    type: 'email', 
    status: 'sent', 
    createdAt: '2026-05-15', 
    clientId: 2,
    performance: {
      envois: 45000,
      ouvertures: 38250,
      clics: 18900,
      conversions: 5400,
      tauxOuverture: 85.0,
      tauxClic: 42.0,
      tauxConversion: 12.0,
      roi: 320,
    },
    live: {
      enCours: false,
      derniereActivite: '2026-05-20T18:30:00',
      vitesseEnvoi: 0,
      restant: 0,
    }
  },
  { 
    id: 3, 
    title: 'Lancement App Zitouna', 
    client: 'Banque Zitouna', 
    type: 'push', 
    status: 'scheduled', 
    createdAt: '2026-06-10', 
    clientId: 3,
    performance: {
      envois: 0,
      ouvertures: 0,
      clics: 0,
      conversions: 0,
      tauxOuverture: 0,
      tauxClic: 0,
      tauxConversion: 0,
      roi: 0,
    },
    live: {
      enCours: false,
      derniereActivite: null,
      vitesseEnvoi: 0,
      restant: 28000,
    }
  },
  { 
    id: 4, 
    title: 'Newsletter Mensuelle', 
    client: 'Ooredoo Tunisie', 
    type: 'email', 
    status: 'active', 
    createdAt: '2026-05-01', 
    clientId: 4,
    performance: {
      envois: 80000,
      ouvertures: 68000,
      clics: 32000,
      conversions: 8800,
      tauxOuverture: 85.0,
      tauxClic: 40.0,
      tauxConversion: 11.0,
      roi: 280,
    },
    live: {
      enCours: true,
      derniereActivite: '2026-06-08T11:48:00',
      vitesseEnvoi: 120,
      restant: 15000,
    }
  },
  { 
    id: 5, 
    title: 'Black Friday Early', 
    client: 'Medina Tech', 
    type: 'email', 
    status: 'draft', 
    createdAt: '2026-06-01', 
    clientId: 5,
    performance: {
      envois: 0,
      ouvertures: 0,
      clics: 0,
      conversions: 0,
      tauxOuverture: 0,
      tauxClic: 0,
      tauxConversion: 0,
      roi: 0,
    },
    live: {
      enCours: false,
      derniereActivite: null,
      vitesseEnvoi: 0,
      restant: 15000,
    }
  },
  { 
    id: 6, 
    title: 'Ventes Flash Auto', 
    client: 'Tunisie Auto', 
    type: 'sms', 
    status: 'sent', 
    createdAt: '2026-06-05', 
    clientId: 6,
    performance: {
      envois: 42000,
      ouvertures: 37800,
      clics: 16800,
      conversions: 4200,
      tauxOuverture: 90.0,
      tauxClic: 40.0,
      tauxConversion: 10.0,
      roi: 195,
    },
    live: {
      enCours: false,
      derniereActivite: '2026-06-06T09:00:00',
      vitesseEnvoi: 0,
      restant: 0,
    }
  },
  { 
    id: 7, 
    title: 'Pack Vacances', 
    client: 'Sahara Travel', 
    type: 'email', 
    status: 'active', 
    createdAt: '2026-05-20', 
    clientId: 7,
    performance: {
      envois: 28000,
      ouvertures: 22400,
      clics: 11200,
      conversions: 3360,
      tauxOuverture: 80.0,
      tauxClic: 40.0,
      tauxConversion: 12.0,
      roi: 310,
    },
    live: {
      enCours: true,
      derniereActivite: '2026-06-08T11:50:00',
      vitesseEnvoi: 85,
      restant: 8000,
    }
  },
  { 
    id: 8, 
    title: 'Welcome StartUp', 
    client: 'StartUp Sfax', 
    type: 'email', 
    status: 'sent', 
    createdAt: '2026-04-15', 
    clientId: 8,
    performance: {
      envois: 15000,
      ouvertures: 13500,
      clics: 6750,
      conversions: 2250,
      tauxOuverture: 90.0,
      tauxClic: 45.0,
      tauxConversion: 15.0,
      roi: 450,
    },
    live: {
      enCours: false,
      derniereActivite: '2026-04-20T14:00:00',
      vitesseEnvoi: 0,
      restant: 0,
    }
  },
];

const DIGILAB_CLIENTS = [
  { id: 1, name: 'Tunisie Telecom', sector: 'Télécommunications', contacts: 125000 },
  { id: 2, name: 'DigiLab Solutions', sector: 'Marketing Digital', contacts: 45000 },
  { id: 3, name: 'Banque Zitouna', sector: 'Finance Islamique', contacts: 28000 },
  { id: 4, name: 'Ooredoo Tunisie', sector: 'Télécommunications', contacts: 80000 },
  { id: 5, name: 'Medina Tech', sector: 'Technologie', contacts: 15000 },
  { id: 6, name: 'Tunisie Auto', sector: 'Automobile', contacts: 42000 },
  { id: 7, name: 'Sahara Travel', sector: 'Tourisme', contacts: 28000 },
  { id: 8, name: 'StartUp Sfax', sector: 'Startup', contacts: 15000 },
];

const MONTHLY_DATA = [
  { month: 'Jan', campaigns: 2, emails: 35000, sms: 12000, push: 5000 },
  { month: 'Fév', campaigns: 3, emails: 52000, sms: 18000, push: 8000 },
  { month: 'Mar', campaigns: 4, emails: 125000, sms: 45000, push: 12000 },
  { month: 'Avr', campaigns: 3, emails: 48000, sms: 15000, push: 6000 },
  { month: 'Mai', campaigns: 5, emails: 153000, sms: 52000, push: 15000 },
  { month: 'Juin', campaigns: 3, emails: 70000, sms: 42000, push: 28000 },
];

/* ─── CSS Animations ──────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:scale(0.8); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes pulse-live {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
    50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(5,150,105,0); }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to { width: var(--target-width); }
  }

  .dl-card-premium {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .dl-card-premium:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 12px 40px rgba(245,166,35,0.15) !important;
    border-color: #f5a623 !important;
  }
  .dl-row-premium {
    transition: all 0.2s ease;
  }
  .dl-row-premium:hover {
    background: #fffbf0 !important;
    transform: translateX(4px);
  }
  .dl-btn-filter {
    transition: all 0.2s ease;
  }
  .dl-btn-filter:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245,166,35,0.2);
  }
  .live-indicator {
    animation: pulse-live 2s infinite;
  }
`;

/* ─── Skeleton Loader ─────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '500px 100%',
      animation: 'shimmer 1.4s infinite linear',
    }} />
  );
}

/* ─── Section Header ────────────────────────────────────────── */
function SectionHead({ label, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: T.goldDim, border: `1.5px solid ${T.goldBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>{icon}</div>
      <div>
        <span style={{
          fontSize: 13, fontWeight: 800, color: T.navy,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>{label}</span>
        <div style={{ width: 40, height: 3, background: T.gold, borderRadius: 2, marginTop: 4 }} />
      </div>
    </div>
  );
}

/* ─── KPI Card Premium ────────────────────────────────────────── */
function KpiCard({ label, value, subValue, icon, color, bgDim, delay, trend }) {
  const [show, setShow] = useState(false);
  useEffect(() => { 
    const t = setTimeout(() => setShow(true), delay); 
    return () => clearTimeout(t); 
  }, [delay]);

  return (
    <div className="dl-card-premium" style={{
      background: T.card, borderRadius: 16,
      border: `1.5px solid ${T.border}`,
      padding: 24,
      boxShadow: T.shadow,
      opacity: show ? 1 : 0,
      animation: show ? 'fadeUp 0.5s ease both' : 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: color, borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: bgDim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>{icon}</div>
        {trend !== undefined && (
          <div style={{
            padding: '4px 10px', borderRadius: 20,
            background: trend > 0 ? 'rgba(5,150,105,0.10)' : 'rgba(220,38,38,0.10)',
            color: trend > 0 ? T.green : T.red,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{
        fontSize: 36, fontWeight: 800, color: T.navy,
        lineHeight: 1, letterSpacing: '-0.03em',
        animation: show ? 'countUp 0.6s ease both' : 'none',
      }}>{value}</div>

      <div style={{ fontSize: 13, color: T.textMuted, marginTop: 8, fontWeight: 500 }}>{label}</div>

      {subValue && (
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, opacity: 0.7 }}>
          {subValue}
        </div>
      )}
    </div>
  );
}

/* ─── Progress Bar ──────────────────────────────────────────────── */
function ProgressBar({ value, max, color, height = 8, showLabel = true }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: height / 2, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const configs = {
    active:    { bg: T.greenDim, color: T.green, label: 'En cours', icon: '●' },
    sent:      { bg: T.blueDim, color: T.blue, label: 'Envoyée', icon: '✓' },
    scheduled: { bg: T.goldDim, color: T.gold, label: 'Planifiée', icon: '◷' },
    draft:     { bg: 'rgba(100,116,139,0.10)', color: '#6b7280', label: 'Brouillon', icon: '✎' },
  };
  const cfg = configs[status] || configs.draft;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 12px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
      border: `1px solid ${cfg.color}30`,
    }}>
      <span style={{ fontSize: 8 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/* ─── Type Icon ───────────────────────────────────────────────── */
function TypeIcon({ type }) {
  const icons = { email: '✉️', sms: '💬', push: '🔔' };
  const colors = { email: T.blue, sms: T.green, push: T.purple };
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: `${colors[type]}15`,
      border: `1.5px solid ${colors[type]}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16,
    }}>{icons[type] || '📢'}</div>
  );
}

/* ─── Live Indicator ─────────────────────────────────────────── */
function LiveIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="live-indicator" style={{
        width: 8, height: 8, borderRadius: '50%',
        background: T.green,
      }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: '0.05em' }}>LIVE</span>
    </div>
  );
}

/* ─── Performance Ring ───────────────────────────────────────── */
function PerformanceRing({ value, label, color, size = 50 }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e9f2" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.navy }}>{value}%</div>
      <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Reporting() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === 'all' ? DIGILAB_CAMPAGNES : DIGILAB_CAMPAGNES.filter(c => c.type === filter);

  const activeCampaigns = filtered.filter(c => c.status === 'active');
  const sent = filtered.filter(c => c.status === 'sent').length;
  const scheduled = filtered.filter(c => c.status === 'scheduled').length;
  const draft = filtered.filter(c => c.status === 'draft').length;
  const total = filtered.length;

  const byClient = DIGILAB_CLIENTS.map(cl => ({
    ...cl,
    count: filtered.filter(c => c.clientId === cl.id).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = byClient.length > 0 ? byClient[0].count : 1;
  const totalContacts = byClient.reduce((sum, c) => sum + c.contacts, 0);

  const byType = ['email', 'sms', 'push'].map(t => ({
    type: t,
    label: t === 'email' ? 'Email' : t === 'sms' ? 'SMS' : 'Push',
    icon: t === 'email' ? '✉️' : t === 'sms' ? '💬' : '🔔',
    count: filtered.filter(c => c.type === t).length,
    color: t === 'email' ? T.blue : t === 'sms' ? T.green : T.purple,
  }));

  const maxType = Math.max(...byType.map(t => t.count), 1);

  const TABS = [
    { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
    { id: 'live', label: 'Surveillance temps réel', icon: '📡' },
    { id: 'performance', label: 'Performances', icon: '📈' },
    { id: 'campaigns', label: 'Campagnes', icon: '📢' },
    { id: 'clients', label: 'Clients', icon: '🏢' },
  ];

  // Calculs globaux de performance
  const totalEnvois = filtered.reduce((sum, c) => sum + c.performance.envois, 0);
  const totalOuvertures = filtered.reduce((sum, c) => sum + c.performance.ouvertures, 0);
  const totalClics = filtered.reduce((sum, c) => sum + c.performance.clics, 0);
  const totalConversions = filtered.reduce((sum, c) => sum + c.performance.conversions, 0);
  const moyenneROI = filtered.filter(c => c.performance.roi > 0).length > 0 
    ? Math.round(filtered.filter(c => c.performance.roi > 0).reduce((sum, c) => sum + c.performance.roi, 0) / filtered.filter(c => c.performance.roi > 0).length)
    : 0;

  return (
    <div style={{
      background: T.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: T.font,
      color: T.text,
    }}>
      <style>{css}</style>

      {/* Header Premium */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 8,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
          }}>📈</div>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, color: T.navy,
              margin: 0, lineHeight: 1.2,
            }}>Reporting DigiLab</h1>
            <p style={{
              fontSize: 13, color: T.textMuted, margin: '4px 0 0',
            }}>
              Performance des campagnes marketing · Surveillance temps réel · {total} campagnes
            </p>
          </div>
        </div>
        {/* Horloge live */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 56 }}>
          <LiveIndicator />
          <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>
            {liveTime.toLocaleTimeString('fr-FR')} · {liveTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="dl-btn-filter"
              style={{
                padding: '10px 20px', borderRadius: 12,
                background: active ? T.navy : T.card,
                color: active ? '#fff' : T.textMuted,
                border: `1.5px solid ${active ? T.navy : T.border}`,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: active ? '0 4px 14px rgba(10,14,42,0.15)' : T.shadow,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'live' && activeCampaigns.length > 0 && (
                <span style={{
                  marginLeft: 4, fontSize: 10, fontWeight: 800,
                  background: T.green, color: '#fff',
                  padding: '2px 8px', borderRadius: 20,
                }}>{activeCampaigns.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          VUE D'ENSEMBLE
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{
                  background: T.card, borderRadius: 16,
                  border: `1.5px solid ${T.border}`, padding: 24,
                }}>
                  <Skel w={48} h={48} r={12} />
                  <div style={{ marginTop: 16 }}><Skel h={36} w="60%" /></div>
                  <div style={{ marginTop: 8 }}><Skel h={14} w="80%" /></div>
                </div>
              ))
            ) : (
              <>
                <KpiCard
                  label="Total Campagnes"
                  value={total}
                  subValue={`${sent} envoyées · ${activeCampaigns.length} actives · ${scheduled} planifiées`}
                  icon="📢"
                  color={T.gold}
                  bgDim={T.goldDim}
                  delay={0}
                  trend={12}
                />
                <KpiCard
                  label="Contacts Touchés"
                  value={totalEnvois.toLocaleString('fr-FR')}
                  subValue={`${totalOuvertures.toLocaleString('fr-FR')} ouvertures`}
                  icon="👥"
                  color={T.blue}
                  bgDim={T.blueDim}
                  delay={100}
                  trend={8}
                />
                <KpiCard
                  label="Taux de Conversion"
                  value={totalEnvois > 0 ? `${((totalConversions / totalEnvois) * 100).toFixed(1)}%` : '0%'}
                  subValue={`${totalConversions.toLocaleString('fr-FR')} conversions`}
                  icon="🎯"
                  color={T.green}
                  bgDim={T.greenDim}
                  delay={200}
                  trend={5}
                />
                <KpiCard
                  label="ROI Moyen"
                  value={`${moyenneROI}%`}
                  subValue="Retour sur investissement"
                  icon="💰"
                  color={T.purple}
                  bgDim={T.purpleDim}
                  delay={300}
                  trend={15}
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionHead label="Répartition par canal" icon="📊" />
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: 'all', label: 'Tous' },
                { value: 'email', label: '✉️ Email' },
                { value: 'sms', label: '💬 SMS' },
                { value: 'push', label: '🔔 Push' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="dl-btn-filter"
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: filter === f.value ? T.gold : T.card,
                    color: filter === f.value ? '#fff' : T.textMuted,
                    border: `1.5px solid ${filter === f.value ? T.gold : T.border}`,
                    fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Monthly Activity Chart */}
            <div className="dl-card-premium" style={{
              background: T.card, borderRadius: 16,
              border: `1.5px solid ${T.border}`,
              padding: 24, boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 20 }}>
                📈 Activité mensuelle — 6 derniers mois
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, padding: '0 8px' }}>
                {MONTHLY_DATA.map((m, i) => {
                  const totalMonth = m.emails + m.sms + m.push;
                  const maxTotal = Math.max(...MONTHLY_DATA.map(d => d.emails + d.sms + d.push));
                  const h = maxTotal > 0 ? (totalMonth / maxTotal) * 100 : 0;

                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>
                        {totalMonth > 0 ? (totalMonth / 1000).toFixed(0) + 'K' : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120, width: '100%' }}>
                        <div style={{
                          width: '100%',
                          height: `${Math.max(h, 4)}%`,
                          minHeight: totalMonth > 0 ? 8 : 4,
                          background: `linear-gradient(180deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                        }}>
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${(m.sms / totalMonth) * 100}%`,
                            background: T.green,
                            borderRadius: '0 0 6px 6px',
                            opacity: 0.6,
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                {[
                  { color: T.gold, label: 'Email' },
                  { color: T.green, label: 'SMS' },
                  { color: T.purple, label: 'Push' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                    <span style={{ fontSize: 11, color: T.textMuted }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Type */}
            <div className="dl-card-premium" style={{
              background: T.card, borderRadius: 16,
              border: `1.5px solid ${T.border}`,
              padding: 24, boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 20 }}>
                📊 Par canal
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {byType.map((t, i) => (
                  <div key={t.type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TypeIcon type={t.type} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{t.label}</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: t.color }}>{t.count}</span>
                    </div>
                    <ProgressBar value={t.count} max={maxType} color={t.color} height={6} />
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: 'right' }}>
                      {total > 0 ? ((t.count / total) * 100).toFixed(0) : 0}% du total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Client */}
          <SectionHead label="Campagnes par client" icon="🏢" />
          <div className="dl-card-premium" style={{
            background: T.card, borderRadius: 16,
            border: `1.5px solid ${T.border}`,
            padding: 24, boxShadow: T.shadow,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byClient.map((cl, i) => (
                <div key={cl.name} className="dl-row-premium" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 12,
                  background: i % 2 === 0 ? 'rgba(245,166,35,0.02)' : 'transparent',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${BAR_COLORS[i % BAR_COLORS.length]}15`,
                    border: `1.5px solid ${BAR_COLORS[i % BAR_COLORS.length]}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800,
                    color: BAR_COLORS[i % BAR_COLORS.length],
                    flexShrink: 0,
                  }}>
                    {cl.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cl.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{cl.sector} · {cl.contacts.toLocaleString('fr-FR')} contacts</div>
                  </div>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <ProgressBar value={cl.count} max={maxCount} color={BAR_COLORS[i % BAR_COLORS.length]} height={6} showLabel={false} />
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `${BAR_COLORS[i % BAR_COLORS.length]}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                    color: BAR_COLORS[i % BAR_COLORS.length],
                    flexShrink: 0,
                  }}>
                    {cl.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SURVEILLANCE TEMPS RÉEL
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <div>
          <SectionHead label="Campagnes en cours" icon="📡" />
          
          {activeCampaigns.length === 0 ? (
            <div className="dl-card-premium" style={{
              background: T.card, borderRadius: 16,
              border: `1.5px solid ${T.border}`,
              padding: 40, boxShadow: T.shadow,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>Aucune campagne active</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>Les campagnes en cours apparaîtront ici en temps réel</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {activeCampaigns.map((camp, i) => {
                const client = DIGILAB_CLIENTS.find(c => c.id === camp.clientId);
                const progress = camp.performance.envois > 0 
                  ? ((camp.performance.envois - camp.live.restant) / camp.performance.envois) * 100 
                  : 0;
                
                return (
                  <div key={camp.id} className="dl-card-premium" style={{
                    background: T.card, borderRadius: 16,
                    border: `1.5px solid ${T.border}`,
                    padding: 24, boxShadow: T.shadow,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Bandeau live */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: 4, background: `linear-gradient(90deg, ${T.green}, ${T.gold})`,
                    }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <TypeIcon type={camp.type} />
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{camp.title}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                            {client?.name} · {camp.type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LiveIndicator />
                        <StatusBadge status="active" />
                      </div>
                    </div>

                    {/* Progression d'envoi */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Progression d'envoi</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>
                          {camp.performance.envois.toLocaleString('fr-FR')} / {(camp.performance.envois + camp.live.restant).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${progress}%`, height: '100%',
                          background: `linear-gradient(90deg, ${T.gold}, ${T.green})`,
                          borderRadius: 4, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{progress.toFixed(1)}% complété</span>
                        <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>
                          ⚡ {camp.live.vitesseEnvoi} envois/min
                        </span>
                      </div>
                    </div>

                    {/* Stats temps réel */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      {[
                        { label: 'Envois', value: camp.performance.envois, color: T.blue, icon: '📤' },
                        { label: 'Ouvertures', value: camp.performance.ouvertures, color: T.green, icon: '👁️' },
                        { label: 'Clics', value: camp.performance.clics, color: T.gold, icon: '🖱️' },
                        { label: 'Conversions', value: camp.performance.conversions, color: T.purple, icon: '🎯' },
                      ].map((stat, idx) => (
                        <div key={idx} style={{
                          background: '#fafbfd', borderRadius: 12,
                          padding: '16px', border: `1px solid ${T.border}`,
                          textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>
                            {stat.value.toLocaleString('fr-FR')}
                          </div>
                          <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dernière activité */}
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: T.textMuted }}>
                          🕐 Dernière activité: {camp.live.derniereActivite 
                            ? new Date(camp.live.derniereActivite).toLocaleTimeString('fr-FR')
                            : '—'}
                        </span>
                        <span style={{ fontSize: 11, color: T.textMuted }}>
                          ⏱️ Restant: ~{Math.ceil(camp.live.restant / camp.live.vitesseEnvoi)} min
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tableau de surveillance */}
          <SectionHead label="Surveillance de toutes les campagnes" icon="📋" />
          <div style={{
            background: T.card, borderRadius: 16,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadow, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.navy }}>
                  {['CAMPAGNE', 'STATUT', 'ENVOIS', 'RESTANT', 'VITESSE', 'PROGRESSION', 'ACTION'].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px',
                      textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.12em', color: T.gold,
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const totalDest = c.performance.envois + c.live.restant;
                  const progress = totalDest > 0 ? (c.performance.envois / totalDest) * 100 : 0;
                  
                  return (
                    <tr key={c.id} className="dl-row-premium" style={{
                      borderBottom: `1px solid ${T.border}`,
                      background: i % 2 === 0 ? 'rgba(245,166,35,0.02)' : 'transparent',
                    }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TypeIcon type={c.type} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.title}</div>
                            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{c.client}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>
                          {c.performance.envois.toLocaleString('fr-FR')}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c.live.restant > 0 ? T.orange : T.textMuted }}>
                          {c.live.restant.toLocaleString('fr-FR')}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c.live.vitesseEnvoi > 0 ? T.green : T.textMuted }}>
                          {c.live.vitesseEnvoi > 0 ? `⚡ ${c.live.vitesseEnvoi}/min` : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${progress}%`, height: '100%',
                              background: c.status === 'active' ? T.green : c.status === 'sent' ? T.blue : T.textMuted,
                              borderRadius: 3, transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.text, minWidth: 35 }}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setSelectedCampaign(c)}
                          style={{
                            padding: '6px 14px', borderRadius: 8,
                            background: T.goldDim, color: T.goldDark,
                            border: `1px solid ${T.goldBorder}`,
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          📊 Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PERFORMANCES PAR CAMPAGNE
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'performance' && (
        <div>
          <SectionHead label="Performances détaillées par campagne" icon="📈" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map((camp, i) => {
              const client = DIGILAB_CLIENTS.find(c => c.id === camp.clientId);
              const perf = camp.performance;
              
              return (
                <div key={camp.id} className="dl-card-premium" style={{
                  background: T.card, borderRadius: 16,
                  border: `1.5px solid ${T.border}`,
                  padding: 24, boxShadow: T.shadow,
                }}>
                  {/* Header campagne */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <TypeIcon type={camp.type} />
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{camp.title}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                          {client?.name} · {camp.type.toUpperCase()} · {fmtDate(camp.createdAt)}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={camp.status} />
                  </div>

                  {/* Rings de performance */}
                  {perf.envois > 0 ? (
                    <div style={{ 
                      display: 'flex', justifyContent: 'space-around', 
                      alignItems: 'center', padding: '20px',
                      background: '#fafbfd', borderRadius: 14,
                      border: `1px solid ${T.border}`, marginBottom: 20,
                    }}>
                      <PerformanceRing value={perf.tauxOuverture} label="Ouverture" color={T.blue} size={70} />
                      <PerformanceRing value={perf.tauxClic} label="Clics" color={T.green} size={70} />
                      <PerformanceRing value={perf.tauxConversion} label="Conversion" color={T.gold} size={70} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: T.purple }}>{perf.roi}%</div>
                        <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>ROI</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', background: '#fafbfd', borderRadius: 14,
                      border: `1px solid ${T.border}`, marginBottom: 20,
                      textAlign: 'center', color: T.textMuted,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune donnée de performance</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>La campagne n'a pas encore été envoyée</div>
                    </div>
                  )}

                  {/* Stats détaillées */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Envois', value: perf.envois, color: T.blue, bg: T.blueDim, border: 'rgba(59,130,246,0.25)' },
                      { label: 'Ouvertures', value: perf.ouvertures, color: T.green, bg: T.greenDim, border: 'rgba(5,150,105,0.25)' },
                      { label: 'Clics', value: perf.clics, color: T.gold, bg: T.goldDim, border: T.goldBorder },
                      { label: 'Conversions', value: perf.conversions, color: T.purple, bg: T.purpleDim, border: 'rgba(124,58,237,0.25)' },
                    ].map((stat, idx) => (
                      <div key={idx} style={{
                        background: stat.bg, borderRadius: 12,
                        padding: '16px', border: `1px solid ${stat.border}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>
                          {stat.value.toLocaleString('fr-FR')}
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini graphique */}
                  {perf.envois > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>
                        Entonnoir de conversion
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 20px' }}>
                        {[
                          { value: perf.envois, color: T.blue, label: 'Envois' },
                          { value: perf.ouvertures, color: T.green, label: 'Ouvertures' },
                          { value: perf.clics, color: T.gold, label: 'Clics' },
                          { value: perf.conversions, color: T.purple, label: 'Conversions' },
                        ].map((bar, idx) => {
                          const max = perf.envois;
                          const h = max > 0 ? (bar.value / max) * 100 : 0;
                          return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: bar.color }}>
                                {bar.value > 0 ? ((bar.value / max) * 100).toFixed(0) : 0}%
                              </div>
                              <div style={{
                                width: '100%', height: `${Math.max(h, 5)}%`,
                                minHeight: 4, background: bar.color,
                                borderRadius: '4px 4px 0 0', opacity: 0.8,
                                transition: 'height 0.8s ease',
                              }} />
                              <div style={{ fontSize: 9, color: T.textMuted, textAlign: 'center' }}>{bar.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CAMPAGNES (liste détaillée)
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionHead label="Liste des campagnes" icon="📢" />
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: 'all', label: 'Tous' },
                { value: 'email', label: '✉️ Email' },
                { value: 'sms', label: '💬 SMS' },
                { value: 'push', label: '🔔 Push' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="dl-btn-filter"
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: filter === f.value ? T.gold : T.card,
                    color: filter === f.value ? '#fff' : T.textMuted,
                    border: `1.5px solid ${filter === f.value ? T.gold : T.border}`,
                    fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: T.card, borderRadius: 16,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadow, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.navy }}>
                  {['CAMPAGNE', 'CLIENT', 'TYPE', 'STATUT', 'PERFORMANCE', 'DATE', 'ACTIONS'].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px',
                      textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.12em', color: T.gold,
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} style={{ padding: '14px 18px' }}>
                        <Skel h={48} r={8} />
                      </td>
                    </tr>
                  ))
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className="dl-row-premium" style={{
                      borderBottom: `1px solid ${T.border}`,
                      background: i % 2 === 0 ? 'rgba(245,166,35,0.02)' : 'transparent',
                    }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <TypeIcon type={c.type} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.title}</div>
                            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>ID: #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.client}</div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          padding: '4px 10px', borderRadius: 20,
                          background: c.type === 'email' ? T.blueDim : c.type === 'sms' ? T.greenDim : T.purpleDim,
                          color: c.type === 'email' ? T.blue : c.type === 'sms' ? T.green : T.purple,
                          border: `1px solid ${c.type === 'email' ? T.blue : c.type === 'sms' ? T.green : T.purple}30`,
                        }}>
                          {c.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        {c.performance.envois > 0 ? (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>
                              {c.performance.tauxOuverture}% ouverture
                            </div>
                            <div style={{ fontSize: 10, color: T.textMuted }}>
                              {c.performance.tauxClic}% clic · {c.performance.roi}% ROI
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: T.textMuted }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: T.textMuted }}>
                          {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setSelectedCampaign(c)}
                          style={{
                            padding: '6px 14px', borderRadius: 8,
                            background: T.blueDim, color: T.blue,
                            border: `1px solid rgba(59,130,246,0.25)`,
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          📊 Voir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CLIENTS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'clients' && (
        <div>
          <SectionHead label="Performance par client" icon="🏢" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {DIGILAB_CLIENTS.map((cl, i) => {
              const clientCampaigns = DIGILAB_CAMPAGNES.filter(c => c.clientId === cl.id);
              const sentCount = clientCampaigns.filter(c => c.status === 'sent').length;
              const totalROI = clientCampaigns.filter(c => c.performance.roi > 0).reduce((sum, c) => sum + c.performance.roi, 0);
              const avgROI = clientCampaigns.filter(c => c.performance.roi > 0).length > 0 
                ? Math.round(totalROI / clientCampaigns.filter(c => c.performance.roi > 0).length) 
                : 0;
              const color = BAR_COLORS[i % BAR_COLORS.length];

              return (
                <div key={cl.id} className="dl-card-premium" style={{
                  background: T.card, borderRadius: 16,
                  border: `1.5px solid ${T.border}`,
                  padding: 24, boxShadow: T.shadow,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 3, background: color, borderRadius: '16px 16px 0 0',
                  }} />

                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}15`,
                    border: `1.5px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, color: color,
                    marginBottom: 16,
                  }}>
                    {cl.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                    {cl.name}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
                    {cl.sector}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.textMuted }}>Campagnes</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color }}>{clientCampaigns.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.textMuted }}>Envoyées</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{sentCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.textMuted }}>Contacts</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>{cl.contacts.toLocaleString('fr-FR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.textMuted }}>ROI Moyen</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.purple }}>{avgROI}%</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                    <ProgressBar
                      value={sentCount}
                      max={clientCampaigns.length || 1}
                      color={color}
                      height={4}
                      showLabel={false}
                    />
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 6, textAlign: 'center' }}>
                      {clientCampaigns.length > 0 ? Math.round((sentCount / clientCampaigns.length) * 100) : 0}% envoyées
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal détail campagne */}
      {selectedCampaign && (
        <div onClick={e => e.target === e.currentTarget && setSelectedCampaign(null)} style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: T.card, borderRadius: 22, width: 600, maxHeight: '90vh', overflowY: 'auto',
            padding: 32, boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>{selectedCampaign.title}</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
                  {selectedCampaign.client} · {selectedCampaign.type.toUpperCase()}
                </div>
              </div>
              <button onClick={() => setSelectedCampaign(null)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`,
                background: 'none', cursor: 'pointer', fontSize: 14, color: T.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <StatusBadge status={selectedCampaign.status} />
            
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'Envois', value: selectedCampaign.performance.envois },
                  { label: 'Ouvertures', value: selectedCampaign.performance.ouvertures },
                  { label: 'Clics', value: selectedCampaign.performance.clics },
                  { label: 'Conversions', value: selectedCampaign.performance.conversions },
                  { label: 'Taux d\'ouverture', value: `${selectedCampaign.performance.tauxOuverture}%` },
                  { label: 'ROI', value: `${selectedCampaign.performance.roi}%` },
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: '#fafbfd', borderRadius: 10, padding: '14px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{stat.value.toLocaleString('fr-FR')}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCampaign.live.enCours && (
              <div style={{ marginTop: 20, padding: '16px', background: T.greenDim, borderRadius: 12, border: `1px solid rgba(5,150,105,0.25)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <LiveIndicator />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>Campagne en cours d'envoi</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  ⚡ {selectedCampaign.live.vitesseEnvoi} envois/min · 
                  ⏱️ ~{Math.ceil(selectedCampaign.live.restant / selectedCampaign.live.vitesseEnvoi)} min restantes
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          © 2026 DigiLab Solutions · Tunisie · Reporting DigiPip Cloud Engine · Surveillance temps réel
        </span>
      </div>
    </div>
  );
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}