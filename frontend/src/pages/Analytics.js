import React, { useState, useEffect } from 'react';
import api from '../api';

/* ─── Palette DigiLab Solutions ────────────────────────────────── */
const C = {
  bg:          '#f4f6fb',
  card:        '#ffffff',
  cardHover:   '#fdfaf5',
  navy:        '#0a0e2a',
  navyLight:   '#1a2152',
  orange:      '#f5a623',
  orangeDark:  '#d4891a',
  orangeDim:   'rgba(245,166,35,0.10)',
  orangeBorder:'rgba(245,166,35,0.30)',
  blue:        '#2563eb',
  blueDim:     'rgba(37,99,235,0.10)',
  green:       '#059669',
  greenDim:    'rgba(5,150,105,0.10)',
  purple:      '#7c3aed',
  purpleDim:   'rgba(124,58,237,0.10)',
  red:         '#dc2626',
  text:        '#1a1f3c',
  textMuted:   '#6b7280',
  border:      '#e5e9f2',
  borderHover: '#f5a623',
  shadow:      '0 1px 8px rgba(10,14,42,0.07)',
  shadowHover: '0 8px 28px rgba(245,166,35,0.18)',
};

/* ─── Données réelles DigiLab Solutions ─────────────────────────── */
const DIGILAB_CAMPAIGNS = [
  {
    id: 1,
    title: 'Campagne Ramadan 2026',
    client: 'Tunisie Telecom',
    type: 'SMS',
    status: 'active',
    recipients: 125000,
    sent: 125000,
    opened: 102500,
    clicked: 18750,
    converted: 3750,
    openRate: 82.0,
    clickRate: 15.0,
    conversionRate: 3.0,
    roi: 245,
    revenue: 45000,
    cost: 2500,
    date: '2026-03-01',
    month: 'Mars 2026'
  },
  {
    id: 2,
    title: 'Promo Été DigiLab',
    client: 'DigiLab Solutions',
    type: 'Email',
    status: 'sent',
    recipients: 45000,
    sent: 45000,
    opened: 30600,
    clicked: 7650,
    converted: 1530,
    openRate: 68.0,
    clickRate: 17.0,
    conversionRate: 3.4,
    roi: 185,
    revenue: 18000,
    cost: 1200,
    date: '2026-05-15',
    month: 'Mai 2026'
  },
  {
    id: 3,
    title: 'Lancement App Zitouna',
    client: 'Banque Zitouna',
    type: 'Push',
    status: 'scheduled',
    recipients: 28000,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    roi: 0,
    revenue: 0,
    cost: 800,
    date: '2026-06-10',
    month: 'Juin 2026'
  },
  {
    id: 4,
    title: 'Newsletter Mensuelle',
    client: 'Ooredoo Tunisie',
    type: 'Email',
    status: 'sent',
    recipients: 80000,
    sent: 80000,
    opened: 56800,
    clicked: 14200,
    converted: 2840,
    openRate: 71.0,
    clickRate: 17.8,
    conversionRate: 3.55,
    roi: 210,
    revenue: 32000,
    cost: 2000,
    date: '2026-05-01',
    month: 'Mai 2026'
  },
  {
    id: 5,
    title: 'Black Friday Early',
    client: 'Medina Tech',
    type: 'Multicanal',
    status: 'draft',
    recipients: 15000,
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    roi: 0,
    revenue: 0,
    cost: 500,
    date: '—',
    month: '—'
  },
  {
    id: 6,
    title: 'Ventes Flash Auto',
    client: 'Tunisie Auto',
    type: 'SMS',
    status: 'active',
    recipients: 42000,
    sent: 42000,
    opened: 34440,
    clicked: 7560,
    converted: 1890,
    openRate: 82.0,
    clickRate: 18.0,
    conversionRate: 4.5,
    roi: 280,
    revenue: 22000,
    cost: 1100,
    date: '2026-06-05',
    month: 'Juin 2026'
  },
  {
    id: 7,
    title: 'Pack Vacances',
    client: 'Sahara Travel',
    type: 'Email',
    status: 'sent',
    recipients: 28000,
    sent: 28000,
    opened: 17920,
    clicked: 4480,
    converted: 1120,
    openRate: 64.0,
    clickRate: 16.0,
    conversionRate: 4.0,
    roi: 195,
    revenue: 14000,
    cost: 900,
    date: '2026-05-20',
    month: 'Mai 2026'
  },
  {
    id: 8,
    title: 'Welcome StartUp',
    client: 'StartUp Sfax',
    type: 'Email',
    status: 'sent',
    recipients: 15000,
    sent: 15000,
    opened: 8850,
    clicked: 1950,
    converted: 450,
    openRate: 59.0,
    clickRate: 13.0,
    conversionRate: 3.0,
    roi: 165,
    revenue: 6000,
    cost: 550,
    date: '2026-04-15',
    month: 'Avril 2026'
  }
];

const MONTHLY_EVOLUTION = [
  { month: 'Jan 2026', campaigns: 2, emailsSent: 35000, opens: 21000, conversions: 420, revenue: 8500 },
  { month: 'Fév 2026', campaigns: 3, emailsSent: 52000, opens: 33800, conversions: 780, revenue: 14200 },
  { month: 'Mars 2026', campaigns: 4, emailsSent: 125000, opens: 102500, conversions: 3750, revenue: 45000 },
  { month: 'Avril 2026', campaigns: 3, emailsSent: 48000, opens: 31200, conversions: 890, revenue: 16500 },
  { month: 'Mai 2026', campaigns: 5, emailsSent: 153000, opens: 105320, conversions: 5190, revenue: 64000 },
  { month: 'Juin 2026', campaigns: 3, emailsSent: 70000, opens: 48840, conversions: 1890, revenue: 22000 },
];

const CLIENT_PERFORMANCE = [
  { client: 'Tunisie Telecom', campaigns: 2, totalSent: 167000, avgOpenRate: 82.0, avgClickRate: 16.5, totalRevenue: 67000, roi: 262 },
  { client: 'Banque Zitouna', campaigns: 1, totalSent: 28000, avgOpenRate: 0, avgClickRate: 0, totalRevenue: 0, roi: 0 },
  { client: 'Ooredoo Tunisie', campaigns: 1, totalSent: 80000, avgOpenRate: 71.0, avgClickRate: 17.8, totalRevenue: 32000, roi: 210 },
  { client: 'Medina Tech', campaigns: 1, totalSent: 0, avgOpenRate: 0, avgClickRate: 0, totalRevenue: 0, roi: 0 },
  { client: 'Tunisie Auto', campaigns: 1, totalSent: 42000, avgOpenRate: 82.0, avgClickRate: 18.0, totalRevenue: 22000, roi: 280 },
  { client: 'Sahara Travel', campaigns: 1, totalSent: 28000, avgOpenRate: 64.0, avgClickRate: 16.0, totalRevenue: 14000, roi: 195 },
  { client: 'StartUp Sfax', campaigns: 1, totalSent: 15000, avgOpenRate: 59.0, avgClickRate: 13.0, totalRevenue: 6000, roi: 165 },
  { client: 'DigiLab Solutions', campaigns: 1, totalSent: 45000, avgOpenRate: 68.0, avgClickRate: 17.0, totalRevenue: 18000, roi: 185 },
];

/* ─── CSS ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes shimmer {
    0%   { background-position: -500px 0; }
    100% { background-position:  500px 0; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:scale(0.85); }
    to   { opacity:1; transform:scale(1); }
  }

  .dl-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s !important;
  }
  .dl-card:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 28px rgba(245,166,35,0.18) !important;
    border-color: #f5a623 !important;
  }
  .dl-row { transition: background 0.15s; }
  .dl-row:hover td { background: #fffbf0 !important; }
  .dl-badge-pill {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 28px; height: 22px; padding: 0 10px; border-radius: 20px;
    background: rgba(245,166,35,0.12); border: 1px solid rgba(245,166,35,0.35);
    font-size: 11px; font-weight: 700; color: #d4891a;
  }
`;

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skel({ w = '100%', h = 18, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '500px 100%',
      animation: 'shimmer 1.4s infinite linear',
    }} />
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <div style={{
        width: 4, height: 22, borderRadius: 2,
        background: `linear-gradient(180deg, ${C.orange}, ${C.orangeDark})`,
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.16em',
        color: C.navy, textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${C.border}, transparent)`,
      }} />
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ label, value, icon, color, bgDim, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className="dl-card" style={{
      background: C.card, borderRadius: 16,
      border: `1.5px solid ${C.border}`,
      padding: '22px 24px',
      display: 'flex', alignItems: 'center', gap: 18,
      boxShadow: C.shadow, cursor: 'default',
      opacity: show ? 1 : 0,
      animation: show ? 'fadeUp 0.4s ease both' : 'none',
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
        background: bgDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>{icon}</div>
      <div>
        <div style={{
          fontSize: 32, fontWeight: 800, color: C.navy,
          lineHeight: 1, letterSpacing: '-0.03em',
          animation: show ? 'countUp 0.5s ease both' : 'none',
        }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 5, fontWeight: 500 }}>{label}</div>
        <div style={{ width: 28, height: 2, background: color, borderRadius: 2, marginTop: 8, opacity: 0.6 }} />
      </div>
    </div>
  );
}

/* ─── Performance Card ───────────────────────────────────────── */
function PerfCard({ label, value, icon, color, bgDim, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className="dl-card" style={{
      background: C.card, borderRadius: 16,
      border: `1.5px solid ${C.border}`,
      padding: '22px 16px', textAlign: 'center',
      boxShadow: C.shadow, cursor: 'default',
      opacity: show ? 1 : 0,
      animation: show ? 'fadeUp 0.4s ease both' : 'none',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: bgDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
        fontSize: 20,
      }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.03em', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 7, fontWeight: 500 }}>{label}</div>
      <div style={{ width: 24, height: 2, background: color, borderRadius: 2, margin: '10px auto 0', opacity: 0.6 }} />
    </div>
  );
}

/* ─── Campaign Performance Row ───────────────────────────────── */
function CampaignRow({ campaign, index }) {
  const statusColors = {
    active: { bg: C.blueDim, color: C.blue, label: 'Active' },
    sent: { bg: C.greenDim, color: C.green, label: 'Envoyée' },
    scheduled: { bg: C.purpleDim, color: C.purple, label: 'Planifiée' },
    draft: { bg: 'rgba(107,114,128,0.10)', color: '#6b7280', label: 'Brouillon' },
  };
  const sc = statusColors[campaign.status] || statusColors.draft;
  const typeIcons = { SMS: '💬', Email: '✉️', Push: '🔔', Multicanal: '⚡' };

  return (
    <tr className="dl-row" style={{ borderBottom: `1px solid ${C.border}`, cursor: 'default' }}>
      <td style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: sc.bg, border: `1.5px solid ${sc.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>{typeIcons[campaign.type] || '📢'}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{campaign.title}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{campaign.client}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          padding: '4px 12px', borderRadius: 20,
          background: sc.bg, color: sc.color,
          border: `1px solid ${sc.color}30`,
        }}>{sc.label}</span>
      </td>
      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
        {campaign.recipients.toLocaleString('fr-FR')}
      </td>
      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
        {campaign.sent > 0 ? campaign.sent.toLocaleString('fr-FR') : '—'}
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: campaign.openRate > 0 ? C.green : C.textMuted }}>
          {campaign.openRate > 0 ? `${campaign.openRate}%` : '—'}
        </div>
        {campaign.openRate > 0 && (
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            {campaign.opened.toLocaleString('fr-FR')} ouvertures
          </div>
        )}
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: campaign.clickRate > 0 ? C.blue : C.textMuted }}>
          {campaign.clickRate > 0 ? `${campaign.clickRate}%` : '—'}
        </div>
        {campaign.clickRate > 0 && (
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            {campaign.clicked.toLocaleString('fr-FR')} clics
          </div>
        )}
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: campaign.conversionRate > 0 ? C.purple : C.textMuted }}>
          {campaign.conversionRate > 0 ? `${campaign.conversionRate}%` : '—'}
        </div>
        {campaign.conversionRate > 0 && (
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            {campaign.converted.toLocaleString('fr-FR')} conversions
          </div>
        )}
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: campaign.roi > 0 ? C.orange : C.textMuted }}>
          {campaign.roi > 0 ? `${campaign.roi}%` : '—'}
        </div>
        {campaign.roi > 0 && (
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            {campaign.revenue.toLocaleString('fr-FR')} TND
          </div>
        )}
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simuler chargement
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculer les KPIs globaux
  const totalCampaigns = DIGILAB_CAMPAIGNS.length;
  const activeCampaigns = DIGILAB_CAMPAIGNS.filter(c => c.status === 'active').length;
  const sentCampaigns = DIGILAB_CAMPAIGNS.filter(c => c.status === 'sent').length;
  const totalRecipients = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.recipients, 0);
  const totalSent = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.clicked, 0);
  const totalConverted = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.converted, 0);
  const totalRevenue = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = DIGILAB_CAMPAIGNS.reduce((sum, c) => sum + c.cost, 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const avgClickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0;
  const avgConversionRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : 0;
  const globalRoi = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(0) : 0;

  const TABS = [
    { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
    { id: 'campaigns', label: 'Par Campagne', icon: '📢' },
    { id: 'clients', label: 'Par Client', icon: '🏢' },
    { id: 'evolution', label: 'Évolution', icon: '📈' },
  ];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 4, height: 24, background: C.orange, borderRadius: 2 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: 0 }}>Analytics DigiLab</h1>
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0, marginLeft: 14 }}>
          Performance des campagnes marketing · {totalCampaigns} campagnes · {totalRecipients.toLocaleString('fr-FR')} contacts
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px', borderRadius: 12,
                background: active ? C.navy : C.card,
                color: active ? '#fff' : C.textMuted,
                border: `1.5px solid ${active ? C.navy : C.border}`,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
                boxShadow: active ? '0 4px 14px rgba(10,14,42,0.15)' : C.shadow,
              }}>
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── VUE D'ENSEMBLE ── */}
      {activeTab === 'overview' && (
        <div>
          <SectionHead label="KPIs Globaux" />
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 30 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: C.shadow }}>
                  <Skel w={54} h={54} r={27} />
                  <div style={{ flex: 1 }}><Skel h={32} w="50%" /><div style={{ marginTop: 8 }}><Skel h={12} w="70%" r={4} /></div></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 30 }}>
              <KpiCard label="Total Campagnes" value={totalCampaigns} icon="📢" color={C.orange} bgDim={C.orangeDim} delay={0} />
              <KpiCard label="Contacts Touchés" value={totalRecipients.toLocaleString('fr-FR')} icon="👥" color={C.blue} bgDim={C.blueDim} delay={75} />
              <KpiCard label="Emails Envoyés" value={totalSent.toLocaleString('fr-FR')} icon="✉️" color={C.green} bgDim={C.greenDim} delay={150} />
              <KpiCard label="Revenus Générés" value={`${totalRevenue.toLocaleString('fr-FR')} TND`} icon="💰" color={C.purple} bgDim={C.purpleDim} delay={225} />
            </div>
          )}

          <SectionHead label="Performance Globale" />
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 30 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: C.shadow }}>
                  <Skel w={48} h={48} r={24} /><Skel h={26} w="55%" /><Skel h={12} w="72%" r={4} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 30 }}>
              <PerfCard label="Taux d'Ouverture" value={`${avgOpenRate}%`} icon="👁️" color={C.green} bgDim={C.greenDim} delay={260} />
              <PerfCard label="Taux de Clic" value={`${avgClickRate}%`} icon="🖱️" color={C.blue} bgDim={C.blueDim} delay={335} />
              <PerfCard label="Taux Conversion" value={`${avgConversionRate}%`} icon="🎯" color={C.purple} bgDim={C.purpleDim} delay={410} />
              <PerfCard label="ROI Global" value={`${globalRoi}%`} icon="📈" color={C.orange} bgDim={C.orangeDim} delay={485} />
              <PerfCard label="Campagnes Actives" value={activeCampaigns} icon="⚡" color={C.red} bgDim="rgba(220,38,38,0.10)" delay={560} />
            </div>
          )}
        </div>
      )}

      {/* ── PAR CAMPAGNE ── */}
      {activeTab === 'campaigns' && (
        <div>
          <SectionHead label="Performance par Campagne" />
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {['CAMPAGNE', 'STATUT', 'DESTINATAIRES', 'ENVOYÉS', "Taux d'Ouverture", 'Taux de Clic', 'Conversion', 'ROI'].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px', textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.12em', color: C.orange,
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={8} style={{ padding: '14px 18px' }}><Skel h={44} r={8} /></td></tr>
                  ))
                ) : (
                  DIGILAB_CAMPAIGNS.map((campaign, i) => (
                    <CampaignRow key={campaign.id} campaign={campaign} index={i} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PAR CLIENT ── */}
      {activeTab === 'clients' && (
        <div>
          <SectionHead label="Performance par Client" />
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {['CLIENT', 'CAMPAGNES', 'TOTAL ENVOYÉ', "Taux d'Ouverture", 'Taux de Clic', 'REVENUS', 'ROI'].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px', textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.12em', color: C.orange,
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={7} style={{ padding: '14px 18px' }}><Skel h={44} r={8} /></td></tr>
                  ))
                ) : (
                  CLIENT_PERFORMANCE.map((client, i) => (
                    <tr key={i} className="dl-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: C.orangeDim, border: `1.5px solid ${C.orangeBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: C.orange,
                            flexShrink: 0,
                          }}>{client.client.charAt(0)}</div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{client.client}</div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span className="dl-badge-pill">{client.campaigns}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
                        {client.totalSent > 0 ? client.totalSent.toLocaleString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: client.avgOpenRate > 0 ? C.green : C.textMuted }}>
                          {client.avgOpenRate > 0 ? `${client.avgOpenRate}%` : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: client.avgClickRate > 0 ? C.blue : C.textMuted }}>
                          {client.avgClickRate > 0 ? `${client.avgClickRate}%` : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: client.totalRevenue > 0 ? C.purple : C.textMuted }}>
                          {client.totalRevenue > 0 ? `${client.totalRevenue.toLocaleString('fr-FR')} TND` : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: client.roi > 0 ? C.orange : C.textMuted }}>
                          {client.roi > 0 ? `${client.roi}%` : '—'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ÉVOLUTION ── */}
      {activeTab === 'evolution' && (
        <div>
          <SectionHead label="Évolution Mensuelle" />
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {['MOIS', 'CAMPAGNES', 'EMAILS ENVOYÉS', 'OUVERTURES', 'CONVERSIONS', 'REVENUS (TND)'].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px', textAlign: 'center',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.12em', color: C.orange,
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={6} style={{ padding: '14px 18px' }}><Skel h={44} r={8} /></td></tr>
                  ))
                ) : (
                  MONTHLY_EVOLUTION.map((month, i) => (
                    <tr key={i} className="dl-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 700, color: C.text, textAlign: 'center' }}>{month.month}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span className="dl-badge-pill">{month.campaigns}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>{month.emailsSent.toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>{month.opens.toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, textAlign: 'center' }}>{month.conversions.toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>
                          {month.revenue.toLocaleString('fr-FR')} TND
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}