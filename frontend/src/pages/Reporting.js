import React, { useState, useEffect } from 'react';
import api from '../api';

/* ─── Palette DigiLab ────────────────────────────────────────── */
const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  navy:       '#16120d',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  goldDim:    'rgba(245,166,35,0.10)',
  goldBorder: 'rgba(245,166,35,0.28)',
  border:     '#e5e9f2',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.10)',
  green:      '#22c55e',
  greenDim:   'rgba(34,197,94,0.10)',
  red:        '#ef4444',
  redDim:     'rgba(239,68,68,0.10)',
  purple:     '#8b5cf6',
  purpleDim:  'rgba(139,92,246,0.10)',
  orange:     '#f97316',
  shadow:     '0 1px 8px rgba(10,14,42,0.07)',
};

const CANAL_COLORS = [C.gold, C.blue, C.green, C.purple, '#ec4899', '#14b8a6'];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes growBar {
    from { width: 0%; }
    to   { width: var(--bar-w); }
  }
  @keyframes growBarV {
    from { height: 0%; }
    to   { height: var(--bar-h); }
  }
  .dl-stat { transition:all 0.22s ease!important; }
  .dl-stat:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.15)!important; border-color:#f5a623!important; }
  .dl-filter-btn { transition:all 0.18s; }
  .dl-filter-btn:hover { opacity:0.85; }
  .dl-canal-row:hover { background:#fafbff !important; }
`;

/* ─── Helpers ─────────────────────────────────────────────────── */
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

function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 4, height: 20, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: C.navy, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.border},transparent)` }} />
    </div>
  );
}

/* ─── Bar chart horizontal ────────────────────────────────────── */
function HBar({ value, max, color, label, sublabel, delay = 0 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="dl-canal-row" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 8, transition: 'background .15s',
      animation: `fadeUp 0.3s ease ${delay}ms both`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color,
      }}>{sublabel}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color, flexShrink: 0, marginLeft: 8 }}>{value}</span>
        </div>
        <div style={{ height: 5, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: color, borderRadius: 4,
            '--bar-w': `${pct}%`,
            animation: 'growBar 0.8s ease forwards',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Vertical bar chart (activité mensuelle) ─────────────────── */
function VBarChart({ months }) {
  const maxV = Math.max(...months.map(m => m.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, padding: '0 8px' }}>
      {months.map((m, i) => {
        const pct = (m.count / maxV) * 100;
        const isLast = i === months.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: m.count > 0 ? C.gold : 'transparent' }}>{m.count}</span>
            <div style={{
              width: '100%', borderRadius: '5px 5px 0 0',
              background: isLast ? C.gold : `rgba(245,166,35,0.28)`,
              '--bar-h': `${Math.max(pct, 3)}%`,
              animation: `growBarV 0.7s ease ${i * 80}ms forwards`,
              height: '0%',
              minHeight: m.count > 0 ? 6 : 3,
              transition: 'background .2s',
            }} />
            <span style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ label, value, pct, icon, color, dim, delay }) {
  return (
    <div className="dl-stat" style={{
      background: C.card, borderRadius: 16,
      border: `1.5px solid ${C.border}`,
      padding: '20px 22px', boxShadow: C.shadow,
      animation: `fadeUp 0.4s ease ${delay}ms both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: C.textMuted, textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: dim, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>
        {pct !== null ? `${pct}% du total` : '—'}
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: color, borderRadius: 2,
          '--bar-w': `${pct || 0}%`,
          animation: 'growBar 0.8s ease forwards',
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Reporting() {
  const [campagnes, setCampagnes] = useState([]);
  const [clients,   setClients]   = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, cl] = await Promise.all([api.get('/api/campagnes'), api.get('/api/clients')]);
        setCampagnes(Array.isArray(c.data) ? c.data : c.data.data || []);
        setClients(Array.isArray(cl.data) ? cl.data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  /* ── computed ── */
  const filtered  = filter === 'all' ? campagnes : campagnes.filter(c => c.type === filter);
  const total     = filtered.length;
  const sent      = filtered.filter(c => c.status === 'sent').length;
  const scheduled = filtered.filter(c => c.status === 'scheduled').length;
  const draft     = filtered.filter(c => c.status === 'draft').length;

  const byClient = clients.map((cl, i) => ({
    name:  cl.name,
    init:  cl.name.slice(0, 2).toUpperCase(),
    count: filtered.filter(c => c.clientId === cl.id || c.client?.id === cl.id).length,
    color: CANAL_COLORS[i % CANAL_COLORS.length],
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const maxClient = byClient.length > 0 ? byClient[0].count : 1;

  const byType = [
    { type: 'email', label: 'EMAIL', icon: '📧', color: C.blue },
    { type: 'sms',   label: 'SMS',   icon: '📱', color: C.green },
    { type: 'push',  label: 'PUSH',  icon: '🔔', color: C.gold },
  ].map(t => ({ ...t, count: filtered.filter(c => c.type === t.type).length }));

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      month: d.getMonth(),
      year:  d.getFullYear(),
      count: 0,
    };
  });
  filtered.forEach(c => {
    const d = new Date(c.createdAt || c.dateScheduled);
    const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (idx !== -1) months[idx].count++;
  });

  const kpis = [
    { label: 'Total campagnes', value: total,     icon: '📢', color: C.gold,   dim: C.goldDim,   pct: total > 0 ? 100 : 0 },
    { label: 'Envoyées',        value: sent,      icon: '✅', color: C.green,  dim: C.greenDim,  pct: total > 0 ? Math.round(sent / total * 100) : 0 },
    { label: 'Planifiées',      value: scheduled, icon: '📅', color: C.blue,   dim: C.blueDim,   pct: total > 0 ? Math.round(scheduled / total * 100) : 0 },
    { label: 'Brouillons',      value: draft,     icon: '📝', color: C.purple, dim: C.purpleDim, pct: total > 0 ? Math.round(draft / total * 100) : 0 },
  ];

  const FILTERS = [
    { value: 'all',   label: 'Tous' },
    { value: 'email', label: '📧 Email' },
    { value: 'sms',   label: '📱 SMS' },
    { value: 'push',  label: '🔔 Push' },
  ];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Suivi des campagnes</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            Analyse de performance et statistiques
          </p>
        </div>

        {/* Filtres canal */}
        <div style={{
          display: 'flex', background: C.card,
          border: `1.5px solid ${C.border}`, borderRadius: 11,
          padding: 4, gap: 3, boxShadow: C.shadow,
        }}>
          {FILTERS.map(f => (
            <button key={f.value} className="dl-filter-btn"
              onClick={() => setFilter(f.value)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: filter === f.value ? C.gold : 'none',
                color:      filter === f.value ? C.navy : C.textMuted,
                boxShadow:  filter === f.value ? '0 2px 8px rgba(245,166,35,0.25)' : 'none',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '20px 22px', boxShadow: C.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Skel h={11} w="55%" r={4} />
                  <Skel w={36} h={36} r={10} />
                </div>
                <Skel h={32} w="45%" /><div style={{ marginTop: 10 }}><Skel h={10} w="35%" r={4} /></div>
              </div>
            ))
          : kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i * 70} />)
        }
      </div>

      {/* ── Activité + Par canal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 24 }}>

        {/* Activité mensuelle */}
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`,
          padding: '22px 24px', boxShadow: C.shadow,
          animation: 'fadeUp 0.4s ease 300ms both',
        }}>
          <SectionHead label="Activité — 6 derniers mois" />
          {loading
            ? <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <Skel h={`${20 + i * 12}%`} r={4} />
                    <Skel h={10} r={3} />
                  </div>
                ))}
              </div>
            : <VBarChart months={months} />
          }
        </div>

        {/* Par canal */}
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`,
          padding: '22px 24px', boxShadow: C.shadow,
          animation: 'fadeUp 0.4s ease 380ms both',
        }}>
          <SectionHead label="Par canal" />
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Skel w={32} h={32} r={9} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Skel h={12} w="40%" /><Skel h={12} w="20%" />
                      </div>
                      <Skel h={5} r={4} />
                    </div>
                  </div>
                ))}
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {byType.map((t, i) => (
                  <HBar
                    key={t.type}
                    value={t.count}
                    max={total || 1}
                    color={t.color}
                    label={t.label}
                    sublabel={t.icon}
                    delay={i * 80}
                  />
                ))}
              </div>
          }

          {/* stats supplémentaires canal */}
          {!loading && (
            <>
              <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {byType.map(t => (
                  <div key={t.type} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: t.color }}>{t.count}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Campagnes par client ── */}
      <div style={{ animation: 'fadeUp 0.4s ease 460ms both' }}>
        <SectionHead label="Campagnes par client" />
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`,
          padding: '20px 24px', boxShadow: C.shadow,
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Skel w={34} h={34} r={9} />
                  <Skel h={13} w="15%" />
                  <div style={{ flex: 1 }}><Skel h={5} r={4} /></div>
                  <Skel h={13} w={20} />
                </div>
              ))}
            </div>
          ) : byClient.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: C.textMuted }}>
              <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 12 }}>🏢</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Aucune donnée disponible</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {byClient.map((cl, i) => (
                <HBar
                  key={cl.name}
                  value={cl.count}
                  max={maxClient}
                  color={cl.color}
                  label={cl.name}
                  sublabel={cl.init}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}