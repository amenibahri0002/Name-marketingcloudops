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
  text:        '#1a1f3c',
  textMuted:   '#6b7280',
  border:      '#e5e9f2',
  shadow:      '0 1px 8px rgba(10,14,42,0.07)',
  shadowHover: '0 8px 28px rgba(245,166,35,0.18)',
  font:        "'Plus Jakarta Sans','Inter','Segoe UI',sans-serif",
};

/* 🔑 BAR_COLORS DÉFINI ICI */
const BAR_COLORS = [T.gold, T.blue, T.green, T.purple, '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

/* ─── Données réelles DigiLab Solutions ─────────────────────────── */
const DIGILAB_CAMPAGNES = [
  { id: 1, title: 'Campagne Ramadan 2026', client: 'Tunisie Telecom', type: 'sms', status: 'sent', createdAt: '2026-03-01', clientId: 1 },
  { id: 2, title: 'Promo Été DigiLab', client: 'DigiLab Solutions', type: 'email', status: 'sent', createdAt: '2026-05-15', clientId: 2 },
  { id: 3, title: 'Lancement App Zitouna', client: 'Banque Zitouna', type: 'push', status: 'scheduled', createdAt: '2026-06-10', clientId: 3 },
  { id: 4, title: 'Newsletter Mensuelle', client: 'Ooredoo Tunisie', type: 'email', status: 'sent', createdAt: '2026-05-01', clientId: 4 },
  { id: 5, title: 'Black Friday Early', client: 'Medina Tech', type: 'email', status: 'draft', createdAt: '2026-06-01', clientId: 5 },
  { id: 6, title: 'Ventes Flash Auto', client: 'Tunisie Auto', type: 'sms', status: 'sent', createdAt: '2026-06-05', clientId: 6 },
  { id: 7, title: 'Pack Vacances', client: 'Sahara Travel', type: 'email', status: 'sent', createdAt: '2026-05-20', clientId: 7 },
  { id: 8, title: 'Welcome StartUp', client: 'StartUp Sfax', type: 'email', status: 'sent', createdAt: '2026-04-15', clientId: 8 },
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
      padding: '24px',
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
        {trend && (
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
    sent:      { bg: T.greenDim, color: T.green, label: 'Envoyée', icon: '✓' },
    scheduled: { bg: T.blueDim, color: T.blue, label: 'Planifiée', icon: '◷' },
    draft:     { bg: 'rgba(100,116,139,0.10)', color: '#6b7280', label: 'Brouillon', icon: '✎' },
    active:    { bg: T.goldDim, color: T.gold, label: 'Active', icon: '●' },
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

/* ═══════════════════════════════════════════════════════════════ */
export default function Reporting() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === 'all' ? DIGILAB_CAMPAGNES : DIGILAB_CAMPAGNES.filter(c => c.type === filter);

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
    { id: 'campaigns', label: 'Campagnes', icon: '📢' },
    { id: 'clients', label: 'Clients', icon: '🏢' },
  ];

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
              Performance des campagnes marketing · {total} campagnes · {DIGILAB_CLIENTS.length} clients
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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
            </button>
          );
        })}
      </div>

      {/* ── VUE D'ENSEMBLE ── */}
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
                  subValue={`${sent} envoyées · ${scheduled} planifiées`}
                  icon="📢"
                  color={T.gold}
                  bgDim={T.goldDim}
                  delay={0}
                  trend={12}
                />
                <KpiCard
                  label="Clients Actifs"
                  value={DIGILAB_CLIENTS.length}
                  subValue={`${totalContacts.toLocaleString('fr-FR')} contacts`}
                  icon="🏢"
                  color={T.blue}
                  bgDim={T.blueDim}
                  delay={100}
                  trend={8}
                />
                <KpiCard
                  label="Taux de Réussite"
                  value={`${Math.round((sent / total) * 100)}%`}
                  subValue={`${sent} campagnes envoyées`}
                  icon="✅"
                  color={T.green}
                  bgDim={T.greenDim}
                  delay={200}
                  trend={5}
                />
                <KpiCard
                  label="En Cours"
                  value={scheduled + draft}
                  subValue={`${scheduled} planifiées · ${draft} brouillons`}
                  icon="⏳"
                  color={T.purple}
                  bgDim={T.purpleDim}
                  delay={300}
                  trend={-2}
                />
              </>
            )}
          </div>

          {/* Filters + Charts */}
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
              {/* Legend */}
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

      {/* ── CAMPAGNES ── */}
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
                  {['CAMPAGNE', 'CLIENT', 'TYPE', 'STATUT', 'DATE'].map((h, i) => (
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
                      <td colSpan={5} style={{ padding: '14px 18px' }}>
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
                        <div style={{ fontSize: 12, color: T.textMuted }}>
                          {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
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

      {/* ── CLIENTS ── */}
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

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          © 2026 DigiLab Solutions · Tunisie · Reporting DigiPip Cloud Engine
        </span>
      </div>
    </div>
  );
}