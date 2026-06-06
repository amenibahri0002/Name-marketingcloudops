import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ═══════════════════════════════════════════
   DESIGN SYSTEM DIGIPIP — RESPONSABLE MARKETING
═══════════════════════════════════════════ */
const T = {
  bg:        '#f0f2f8',
  card:      '#ffffff',
  navy:      '#16120d',
  navyMid:   '#1e2a3a',
  gold:      '#f5a623',
  goldDark:  '#c8831a',
  goldDim:   'rgba(245,166,35,0.10)',
  goldGlow:  'rgba(245,166,35,0.20)',
  border:    '#e4e9f2',
  borderHi:  '#f5a623',
  text:      '#1a1f3c',
  muted:     '#7a8599',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.10)',
  blue:      '#3b82f6',
  blueDim:   'rgba(59,130,246,0.10)',
  purple:    '#8b5cf6',
  purpleDim: 'rgba(139,92,246,0.10)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  cyan:      '#06b6d4',
  orange:    '#f97316',
  teal:      '#14b8a6',
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
  mono:      "'JetBrains Mono',monospace",
};

/* ═══════════════════════════════════════════
   COMPOSANTS DE BASE
═══════════════════════════════════════════ */

/* ── Sparkline ── */
function Sparkline({ data, color, width = 90, height = 36 }) {
  const w = width, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6)}`).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Bar Chart Vertical (Envois par compte) ── */
function BarChartVertical({ data, labels, colors, maxValue }) {
  const H = 200;
  const max = maxValue || Math.max(...data.flatMap(s => s.values));
  const barW = 28, gap = 6, groupGap = 24;
  const groupW = data.length * (barW + gap) - gap + groupGap;
  const W = labels.length * groupW;

  return (
    <svg width="100%" height={H + 40} viewBox={`0 0 ${W} ${H + 40}`} preserveAspectRatio="none">
      {/* Lignes de grille */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <g key={i}>
          <line x1="0" y1={H - ratio * H} x2={W} y2={H - ratio * H} stroke={T.border} strokeWidth="1" strokeDasharray="4 4" />
          <text x="-8" y={H - ratio * H + 4} textAnchor="end" fontSize="9" fill={T.muted} fontFamily={T.sans}>
            {Math.round(max * ratio).toLocaleString('fr-FR')}
          </text>
        </g>
      ))}

      {labels.map((label, gi) => (
        <g key={gi} transform={`translate(${gi * groupW + groupGap / 2}, 0)`}>
          {data.map((series, si) => {
            const val = series.values[gi];
            const barH = (val / max) * (H - 10);
            const x = si * (barW + gap);
            const y = H - barH;
            return (
              <g key={si}>
                <rect x={x} y={y} width={barW} height={barH} rx="5" fill={colors[si]} opacity="0.85" />
                <rect x={x} y={y} width={barW} height="4" rx="2" fill={colors[si]} />
                {/* Valeur au-dessus */}
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill={colors[si]} fontFamily={T.sans}>
                  {val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}
                </text>
              </g>
            );
          })}
          <text x={(data.length * (barW + gap)) / 2 - gap} y={H + 20} textAnchor="middle" fontSize="10" fill={T.muted} fontFamily={T.sans} fontWeight="600">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Donut Chart ── */
function Donut({ segments, size = 130, centerLabel, centerSub }) {
  const r = 45, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth="16" />
      {segments.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill={T.text} fontFamily={T.sans}>{centerLabel || total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={T.muted} fontFamily={T.sans} fontWeight="600">{centerSub || 'TOTAL'}</text>
    </svg>
  );
}

/* ── Mini KPI Card ── */
function MiniKPI({ label, value, change, icon, color, spark, delay, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        background: T.card, borderRadius: 16, padding: '20px',
        border: `1.5px solid ${T.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        animation: `fadeUp 0.5s ease ${delay}ms both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${color}15`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = T.border;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1.2px' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: change.startsWith('+') ? T.green : change.startsWith('-') ? T.red : T.muted }}>{change}</span>
        {spark && <Sparkline data={spark} color={color} width={70} height={28} />}
      </div>
    </div>
  );
}

/* ── Activity Item ── */
function ActivityItem({ icon, title, sub, time, color, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${T.border}`,
      animation: `fadeUp 0.4s ease ${delay}ms both`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>
      </div>
      <div style={{ fontSize: 10, color: T.muted, flexShrink: 0, fontWeight: 500 }}>{time}</div>
    </div>
  );
}

/* ── Campaign Row ── */
function CampaignRow({ campaign, index, onClick }) {
  const statusConfig = {
    sent:      { label: 'Envoyée',    color: T.green,  bg: T.greenDim },
    active:    { label: 'En cours',   color: T.blue,   bg: T.blueDim },
    draft:     { label: 'Brouillon',  color: T.gold,   bg: T.goldDim },
    scheduled: { label: 'Planifiée',  color: T.purple, bg: T.purpleDim },
    failed:    { label: 'Échouée',    color: T.red,    bg: T.redDim },
    paused:    { label: 'En pause',   color: T.orange, bg: 'rgba(249,115,22,0.10)' },
  };
  const sc = statusConfig[campaign.status] || statusConfig.draft;
  const typeIcon = { email: '✉', sms: '💬', push: '🔔', social: '📱', multicanal: '⚡' }[campaign.type?.toLowerCase()] || '📢';

  return (
    <div onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 12px', borderRadius: 12,
        borderBottom: index < 4 ? `1px solid ${T.border}` : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        animation: `fadeUp 0.4s ease ${400 + index * 60}ms both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: sc.bg, border: `1px solid ${sc.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {typeIcon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaign.title}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
          {campaign.client} · {campaign.channel} · {campaign.recipients.toLocaleString('fr-FR')} destinataires
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{campaign.rate}%</div>
        <div style={{ fontSize: 10, color: T.muted }}>taux d'ouverture</div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700,
        color: sc.color, background: sc.bg,
        padding: '4px 10px', borderRadius: 20, flexShrink: 0,
      }}>
        {sc.label}
      </span>
    </div>
  );
}

/* ── Account Card (Envoi par compte) ── */
function AccountCard({ account, index }) {
  return (
    <div style={{
      background: T.card, borderRadius: 14, padding: '18px 20px',
      border: `1.5px solid ${T.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      animation: `fadeUp 0.5s ease ${200 + index * 80}ms both`,
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      e.currentTarget.style.borderColor = T.gold;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
      e.currentTarget.style.borderColor = T.border;
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${account.color}15`, border: `1px solid ${account.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {account.icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{account.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{account.type}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Envoyés</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: account.color, marginTop: 4 }}>{account.sent.toLocaleString('fr-FR')}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux d'eng.</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.green, marginTop: 4 }}>{account.engagement}%</div>
        </div>
      </div>

      {/* Mini sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkline data={account.trend} color={account.color} width={120} height={32} />
        <span style={{ fontSize: 11, fontWeight: 600, color: account.trend[account.trend.length - 1] > account.trend[0] ? T.green : T.red }}>
          {account.trend[account.trend.length - 1] > account.trend[0] ? '↗' : '↘'} {Math.abs(((account.trend[account.trend.length - 1] - account.trend[0]) / account.trend[0] * 100)).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONNÉES MOCK — DIGILAB SOLUTIONS
═══════════════════════════════════════════ */

const ACCOUNTS_DATA = [
  { name: 'Tunisie Telecom', type: 'Enterprise', icon: '📡', color: T.blue, sent: 45200, engagement: 78.5, trend: [32000, 35000, 38000, 41000, 42000, 44000, 45200] },
  { name: 'Banque Zitouna', type: 'Enterprise', icon: '🏦', color: T.gold, sent: 28400, engagement: 65.2, trend: [20000, 22000, 24000, 25000, 26000, 27000, 28400] },
  { name: 'Ooredoo Tunisie', type: 'Agency', icon: '📶', color: T.purple, sent: 19800, engagement: 72.1, trend: [12000, 14000, 15000, 16000, 17000, 18000, 19800] },
  { name: 'StartUp Sfax', type: 'Starter', icon: '🚀', color: T.green, sent: 5600, engagement: 54.3, trend: [3000, 3500, 4000, 4200, 4800, 5200, 5600] },
  { name: 'Medina Tech', type: 'Agency', icon: '💻', color: T.cyan, sent: 12300, engagement: 68.9, trend: [8000, 9000, 9500, 10000, 11000, 11500, 12300] },
  { name: 'Carthage Group', type: 'Enterprise', icon: '🏛️', color: T.orange, sent: 31500, engagement: 81.2, trend: [25000, 26000, 27000, 28000, 29000, 30000, 31500] },
];

const CAMPAIGNS_DATA = [
  { id: 1, title: 'Campagne Ramadan 2026', client: 'Tunisie Telecom', type: 'sms', channel: 'SMS', status: 'active', recipients: 125000, rate: 82.4, date: 'En cours' },
  { id: 2, title: 'Promo Été DigiLab', client: 'DigiLab Solutions', type: 'email', channel: 'Email', status: 'sent', recipients: 45000, rate: 68.7, date: 'Il y a 2h' },
  { id: 3, title: 'Lancement App Zitouna', client: 'Banque Zitouna', type: 'push', channel: 'Push', status: 'scheduled', recipients: 28000, rate: 0, date: 'Dans 3h' },
  { id: 4, title: 'Newsletter Mensuelle', client: 'Ooredoo Tunisie', type: 'email', channel: 'Email', status: 'sent', recipients: 80000, rate: 71.2, date: 'Il y a 1j' },
  { id: 5, title: 'Black Friday Early', client: 'Medina Tech', type: 'multicanal', channel: 'Email+SMS', status: 'draft', recipients: 15000, rate: 0, date: 'Brouillon' },
];

const CHANNEL_DISTRIBUTION = [
  { label: 'Email', value: 45, color: T.blue },
  { label: 'SMS', value: 30, color: T.green },
  { label: 'Push', value: 15, color: T.gold },
  { label: 'Social', value: 10, color: T.purple },
];

const ACTIVITIES = [
  { icon: '📢', title: 'Campagne "Ramadan 2026" lancée', sub: 'Tunisie Telecom · 125K destinataires', time: 'Il y a 5 min', color: T.gold },
  { icon: '✅', title: 'Promo Été livrée à 97.2%', sub: '45 000 ouvertures · Taux 68.7%', time: 'Il y a 2h', color: T.green },
  { icon: '👥', title: '2 340 nouveaux contacts importés', sub: 'Segment "Clients VIP Tunisie"', time: 'Il y a 4h', color: T.blue },
  { icon: '📊', title: 'Rapport mensuel généré', sub: 'Mai 2026 · 6 comptes actifs', time: 'Il y a 6h', color: T.purple },
  { icon: '⚡', title: 'Alerte: CPU cluster à 85%', sub: 'Cluster EU-West · Auto-scaling activé', time: 'Il y a 8h', color: T.orange },
  { icon: '🎯', title: 'Segment "B2B Tunis" mis à jour', sub: '3 847 contacts · 12% croissance', time: 'Il y a 1j', color: T.cyan },
];

/* ═══════════════════════════════════════════
   DASHBOARD RESPONSABLE MARKETING
══════════════════════════════════════════ */
export default function MarketingDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [period, setPeriod] = useState('7j');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);

    // Redirection si admin
    if (u.role === 'ADMIN') {
      navigate('/admin/dashboard');
      return;
    }

    api.get('/api/stats').catch(() => ({ data: {} }))
      .then(s => setStats(s.data))
      .finally(() => setLoading(false));
  }, [navigate]);

  const firstName = user.name?.split(' ')[0] || 'Responsable';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  /* Données d'envoi par compte selon la période */
  const evolutionData = {
    '7j': {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      series: [
        { label: 'Email', values: [8200, 12500, 9800, 15200, 13100, 17800, 14200] },
        { label: 'SMS', values: [3100, 4200, 3800, 5100, 4600, 5800, 4900] },
        { label: 'Push', values: [1800, 2900, 3200, 4100, 3700, 4500, 3900] },
      ],
    },
    '30j': {
      labels: ['S1', 'S2', 'S3', 'S4'],
      series: [
        { label: 'Email', values: [45000, 52000, 48000, 61000] },
        { label: 'SMS', values: [18000, 22000, 20000, 25000] },
        { label: 'Push', values: [12000, 15000, 14000, 18000] },
      ],
    },
    '90j': {
      labels: ['Jan', 'Fév', 'Mar'],
      series: [
        { label: 'Email', values: [180000, 210000, 245000] },
        { label: 'SMS', values: [75000, 88000, 95000] },
        { label: 'Push', values: [45000, 52000, 61000] },
      ],
    },
  };

  const currentData = evolutionData[period];
  const totalSent = currentData.series.reduce((sum, s) => sum + s.values.reduce((a, b) => a + b, 0), 0);
  const totalClients = 47;
  const totalCampaigns = 128;
  const activeCampaigns = 12;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.sans }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${T.border}`, borderTopColor: T.gold, animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <span style={{ color: T.muted, fontSize: 15, fontWeight: 500 }}>Chargement du dashboard marketing...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.sans, padding: '28px 32px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* ═══════ HEADER ═══════ */}
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '2.5px', marginBottom: 8, textTransform: 'uppercase' }}>
              ⚡ DigiPip Marketing Platform
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.2 }}>
              {greeting}, {firstName} 👋
            </h1>
            <p style={{ fontSize: 14, color: T.muted, maxWidth: 520, lineHeight: 1.6 }}>
              Vue marketing de DigiLab Solutions — suivi des campagnes, performances par compte et analytics en temps réel.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPeriod('7j')}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: period === '7j' ? T.gold : T.card,
                color: period === '7j' ? T.navy : T.muted,
                border: `1.5px solid ${period === '7j' ? T.gold : T.border}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              7 jours
            </button>
            <button onClick={() => setPeriod('30j')}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: period === '30j' ? T.gold : T.card,
                color: period === '30j' ? T.navy : T.muted,
                border: `1.5px solid ${period === '30j' ? T.gold : T.border}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              30 jours
            </button>
            <button onClick={() => setPeriod('90j')}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: period === '90j' ? T.gold : T.card,
                color: period === '90j' ? T.navy : T.muted,
                border: `1.5px solid ${period === '90j' ? T.gold : T.border}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              90 jours
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ KPI PRINCIPAUX ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MiniKPI
          label="Total Clients"
          value={totalClients.toString()}
          change="+3 ce mois"
          icon="🏢"
          color={T.blue}
          spark={[38, 40, 42, 43, 45, 46, 47]}
          delay={0}
          onClick={() => navigate('/clients')}
        />
        <MiniKPI
          label="Campagnes Totales"
          value={totalCampaigns.toString()}
          change="+12 ce mois"
          icon="📢"
          color={T.gold}
          spark={[105, 110, 115, 118, 122, 125, 128]}
          delay={80}
          onClick={() => navigate('/campagnes')}
        />
        <MiniKPI
          label="Campagnes Actives"
          value={activeCampaigns.toString()}
          change="+2 vs hier"
          icon="⚡"
          color={T.green}
          spark={[8, 9, 10, 10, 11, 11, 12]}
          delay={160}
          onClick={() => navigate('/gestion-campagnes')}
        />
        <MiniKPI
          label="Envoyés Total"
          value={totalSent.toLocaleString('fr-FR')}
          change="+18.5% ce mois"
          icon="📤"
          color={T.purple}
          spark={[28000, 31000, 34000, 38000, 42000, 46000, totalSent]}
          delay={240}
          onClick={() => navigate('/reporting')}
        />
      </div>

      {/* ═══════ SECTION ENVOIS PAR COMPTE ═══════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: T.card, borderRadius: 18, padding: '28px 32px',
          border: `1.5px solid ${T.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.5s ease 300ms both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 4 }}>Évolution des envois par compte</div>
              <div style={{ fontSize: 13, color: T.muted }}>Volume d'envois par canal — {period === '7j' ? '7 derniers jours' : period === '30j' ? '4 dernières semaines' : '3 derniers mois'}</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {[{ l: 'Email', c: T.blue }, { l: 'SMS', c: T.green }, { l: 'Push', c: T.gold }].map(({ l, c }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <BarChartVertical
            data={currentData.series}
            labels={currentData.labels}
            colors={[T.blue, T.green, T.gold]}
          />
        </div>
      </div>

      {/* ═══════ GRID : COMPTES + CANAUX + CAMPAGNES + ACTIVITÉ ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* ── Performance par compte ── */}
        <div style={{
          background: T.card, borderRadius: 18, padding: '24px 28px',
          border: `1.5px solid ${T.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.5s ease 400ms both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Performance par compte</div>
              <div style={{ fontSize: 12, color: T.muted }}>Envois et engagement — 6 comptes actifs</div>
            </div>
            <button onClick={() => navigate('/clients')} style={{ fontSize: 12, color: T.gold, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Voir tout →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ACCOUNTS_DATA.map((account, i) => (
              <AccountCard key={account.name} account={account} index={i} />
            ))}
          </div>
        </div>

        {/* ── Répartition des canaux ── */}
        <div style={{
          background: T.card, borderRadius: 18, padding: '24px 28px',
          border: `1.5px solid ${T.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.5s ease 480ms both',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 4 }}>Répartition des canaux</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Distribution par type d'envoi</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Donut segments={CHANNEL_DISTRIBUTION} size={140} centerLabel="100%" centerSub="CANAUX" />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CHANNEL_DISTRIBUTION.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 4, background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}%</span>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: T.border, overflow: 'hidden' }}>
                    <div style={{ width: `${s.value}%`, height: '100%', background: s.color, borderRadius: 3, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats additionnelles */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux moyen d'ouverture</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.green, marginTop: 4 }}>68.4%</div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>↑ +4.2% vs mois dernier</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux de conversion</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.blue, marginTop: 4 }}>12.8%</div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>↑ +1.5% vs mois dernier</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ CAMPAGNES RÉCENTES + ACTIVITÉ ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>

        {/* ── Campagnes récentes ── */}
        <div style={{
          background: T.card, borderRadius: 18, padding: '24px 28px',
          border: `1.5px solid ${T.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.5s ease 560ms both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Campagnes récentes</div>
              <div style={{ fontSize: 12, color: T.muted }}>Derniers déploiements et statuts</div>
            </div>
            <button onClick={() => navigate('/gestion-campagnes')} style={{ fontSize: 12, color: T.gold, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Gérer →
            </button>
          </div>
          <div>
            {CAMPAIGNS_DATA.map((c, i) => (
              <CampaignRow
                key={c.id}
                campaign={c}
                index={i}
                onClick={() => navigate(`/campagne/${c.id}`)}
              />
            ))}
          </div>

          {/* Quick actions campagnes */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => navigate('/campagnes/nouvelle')}
              style={{
                padding: '12px', borderRadius: 10,
                background: `${T.gold}10`, border: `1.5px solid ${T.gold}30`,
                color: T.goldDark, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}20`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; }}
            >
              <span>➕</span> Nouvelle campagne
            </button>
            <button onClick={() => navigate('/segments')}
              style={{
                padding: '12px', borderRadius: 10,
                background: `${T.blue}10`, border: `1.5px solid ${T.blue}30`,
                color: T.blue, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${T.blue}20`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${T.blue}10`; }}
            >
              <span>🎯</span> Gérer segments
            </button>
          </div>
        </div>

        {/* ── Activité récente ── */}
        <div style={{
          background: T.card, borderRadius: 18, padding: '24px 28px',
          border: `1.5px solid ${T.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          animation: 'fadeUp 0.5s ease 640ms both',
        }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Activité récente</div>
            <div style={{ fontSize: 12, color: T.muted }}>Événements plateforme DigiLab</div>
          </div>
          <div>
            {ACTIVITIES.map((a, i) => (
              <ActivityItem key={i} {...a} delay={680 + i * 50} />
            ))}
          </div>

          {/* Mini stats */}
          <div style={{ marginTop: 16, padding: '16px', borderRadius: 12, background: T.goldDim, border: `1px solid ${T.gold}20` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 8 }}>📊 Performance globale</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: T.muted }}>Mois en cours</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>142 800</div>
                <div style={{ fontSize: 10, color: T.green, fontWeight: 600 }}>envois</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: T.muted }}>Objectif</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>85%</div>
                <div style={{ fontSize: 10, color: T.gold, fontWeight: 600 }}>atteint</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <div style={{ padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.muted }}>
          © 2026 DigiLab Solutions · Tunisie · Responsable Marketing Console
        </span>
      </div>
    </div>
  );
}