import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ─── Palette ────────────────────────────────────────────────── */
const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  border:     '#e5e9f2',
  navy:       '#16120d',
  navyHero:   '#1c1814',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  goldDim:    'rgba(245,166,35,0.12)',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  shadow:     '0 1px 8px rgba(10,14,42,0.07)',
  shadowMd:   '0 4px 16px rgba(10,14,42,0.10)',
  green:      '#22c55e',
  blue:       '#3b82f6',
  orange:     '#f5a623',
  red:        '#ef4444',
};

/* ─── CSS ────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 300; }
    to   { stroke-dashoffset: 0; }
  }
  .dp-stat-card { transition: transform .2s, box-shadow .2s, border-color .2s; cursor:default; }
  .dp-stat-card:hover { transform:translateY(-3px); box-shadow: 0 8px 28px rgba(245,166,35,0.15) !important; border-color:#f5a623 !important; }
  .dp-canal-row { transition: background .15s; border-radius:8px; }
  .dp-canal-row:hover { background:#f8f6f2; }
`;

/* ─── Tiny sparkline SVG ─────────────────────────────────────── */
function Sparkline({ color, data }) {
  const w = 90, h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="300"
        style={{ animation: 'drawLine 1.2s ease forwards' }}
      />
    </svg>
  );
}

/* ─── Mini line chart ────────────────────────────────────────── */
function MiniChart({ datasets, labels }) {
  const W = 620, H = 180;
  const padL = 44, padB = 28, padT = 12, padR = 12;
  const cW = W - padL - padR;
  const cH = H - padB - padT;

  const allVals = datasets.flatMap(d => d.data);
  const maxV = Math.max(...allVals) || 1;

  const pts = (data) => data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * cW;
    const y = padT + cH - (v / maxV) * cH;
    return [x, y];
  });

  const yTicks = [0, Math.round(maxV * 0.25), Math.round(maxV * 0.5), Math.round(maxV * 0.75), maxV];

  const fmt = v => v >= 1000 ? Math.round(v / 1000) + 'k' : v;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* grid */}
      {yTicks.map((t, i) => {
        const y = padT + cH - (t / maxV) * cH;
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#e5e9f2" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{fmt(t)}</text>
          </g>
        );
      })}
      {/* x labels */}
      {labels.map((l, i) => {
        const x = padL + (i / (labels.length - 1)) * cW;
        return <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{l}</text>;
      })}
      {/* lines */}
      {datasets.map((ds, di) => {
        const points = pts(ds.data);
        const d = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
        return (
          <g key={di}>
            {/* area fill */}
            <path
              d={`${d} L${points[points.length-1][0]},${padT+cH} L${points[0][0]},${padT+cH} Z`}
              fill={ds.color} opacity="0.07"
            />
            {/* line */}
            <path
              d={d} fill="none"
              stroke={ds.color} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="600"
              style={{ animation: `drawLine ${1 + di * 0.3}s ease forwards` }}
            />
            {/* dots */}
            {points.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={ds.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Progress bar canal ─────────────────────────────────────── */
function CanalBar({ label, pct, color, icon }) {
  return (
    <div className="dp-canal-row" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
        </div>
        <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: color,
            borderRadius: 3, transition: 'width 1s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [canaux, setCanaux]     = useState(null);
  const [extra, setExtra]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);

    Promise.all([
      api.get('/api/dashboard/stats').catch(() => ({ data: null })),
      api.get('/api/dashboard/evolution').catch(() => ({ data: null })),
      api.get('/api/dashboard/canaux').catch(() => ({ data: null })),
      api.get('/api/dashboard/extra').catch(() => ({ data: null })),
    ]).then(([s, e, c, x]) => {
      setStats(s.data);
      setEvolution(e.data);
      setCanaux(c.data);
      setExtra(x.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* ── fallback data si API pas prête ── */
  const statCards = [
    {
      key: 'clients', label: 'CLIENTS',
      value: stats?.clients ?? 4,
      sub: 'Total enregistrés',
      color: C.gold,
      spark: [2, 3, 2, 4, 3, 4, 4],
      icon: '👥',
      route: '/clients',
    },
    {
      key: 'campagnes', label: 'CAMPAGNES',
      value: stats?.campagnes ?? 4,
      sub: 'Total enregistrés',
      color: C.red,
      spark: [1, 2, 3, 2, 4, 3, 4],
      icon: '📢',
      route: '/campagnes',
    },
    {
      key: 'contacts', label: 'CONTACTS',
      value: stats?.contacts ?? 8,
      sub: 'Total enregistrés',
      color: C.green,
      spark: [4, 5, 6, 5, 7, 6, 8],
      icon: '📋',
      route: '/contacts',
    },
    {
      key: 'segments', label: 'SEGMENTS',
      value: stats?.segments ?? 1,
      sub: 'Total enregistrés',
      color: C.red,
      spark: [0, 1, 1, 1, 1, 1, 1],
      icon: '🎯',
      route: '/segments',
    },
  ];

  const evoLabels = evolution?.labels ?? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const evoData = [
    { label: 'Email', color: C.blue,   data: evolution?.email   ?? [8000, 12000, 11000, 16000, 14000, 18000, 15000] },
    { label: 'SMS',   color: C.green,  data: evolution?.sms     ?? [3000, 4000,  4500,  4000,  5000,  5500,  5000]  },
    { label: 'Push',  color: C.orange, data: evolution?.push    ?? [2000, 3000,  3500,  3000,  3500,  4000,  3800]  },
  ];

  const canauxData = canaux ?? [
    { label: 'Email', pct: 72, color: C.blue,   icon: '📧' },
    { label: 'SMS',   pct: 55, color: C.green,  icon: '💬' },
    { label: 'Push',  pct: 88, color: C.orange, icon: '🔔' },
  ];

  const extraData = extra ?? [
    { label: 'Villes actives',  value: '24',    icon: '🗺️', trend: null },
    { label: 'Abonnés total',   value: '142 k', icon: '👥', trend: '+8%', trendUp: true },
    { label: 'Clients (tenants)', value: '4',   icon: '🏢', trend: '+2',  trendUp: true },
  ];

  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur'
    : user?.role === 'RESPONSABLE_MARKETING' ? 'Resp. Marketing'
    : 'Client';

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'utilisateur';

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      <div style={{ padding: '28px 32px' }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #2a2118 100%)`,
          borderRadius: 18, padding: '28px 36px',
          marginBottom: 28, position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(10,14,42,0.25)',
          animation: 'fadeUp 0.4s ease both',
        }}>
          {/* décoration */}
          <div style={{
            position: 'absolute', top: -30, right: 60,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(245,166,35,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 20, right: 20,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(245,166,35,0.05)', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 2, background: C.gold, borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.2em' }}>
              PLATEFORME MARKETING CLOUD
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
            Bonjour, {firstName} 👋
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            Voici un aperçu de votre plateforme marketing
          </div>
        </div>

        {/* ── 4 stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <div
              key={s.key}
              className="dp-stat-card"
              onClick={() => navigate(s.route)}
              style={{
                background: C.card, borderRadius: 16,
                border: `1.5px solid ${C.border}`,
                padding: '22px 24px', boxShadow: C.shadow,
                opacity: 0,
                animation: `fadeUp 0.4s ease ${i * 80}ms both`,
              }}
            >
              {/* top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: C.textMuted }}>
                  {s.label}
                </span>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${s.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {s.icon}
                </div>
              </div>
              {/* value */}
              <div style={{ fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 4 }}>
                {s.value}
              </div>
              {/* bottom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 400 }}>{s.sub}</span>
                <Sparkline color={s.color} data={s.spark} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Canal ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 28 }}>

          {/* Evolution chart */}
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            padding: '24px 28px', boxShadow: C.shadow,
            animation: 'fadeUp 0.5s ease 320ms both',
          }}>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Évolution des Campagnes — 7 jours</div>
              </div>
              <button
                onClick={() => navigate('/campagnes')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: C.gold,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                VOIR TOUT →
              </button>
            </div>
            {/* legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              {evoData.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 2.5, background: d.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{d.label}</span>
                </div>
              ))}
            </div>
            <MiniChart datasets={evoData} labels={evoLabels} />
          </div>

          {/* Par canal */}
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            padding: '24px 20px', boxShadow: C.shadow,
            animation: 'fadeUp 0.5s ease 400ms both',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Par Canal</div>

            {/* barres canal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {canauxData.map(c => (
                <CanalBar key={c.label} {...c} />
              ))}
            </div>

            {/* séparateur */}
            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

            {/* extra stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {extraData.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8,
                  background: i % 2 === 0 ? '#fafafa' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{e.icon}</span>
                    <span style={{ fontSize: 12.5, color: C.textMuted, fontWeight: 500 }}>{e.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{e.value}</span>
                    {e.trend && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 7px',
                        borderRadius: 20,
                        background: e.trendUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: e.trendUp ? C.green : C.red,
                      }}>
                        {e.trendUp ? '▲' : '▼'} {e.trend}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}