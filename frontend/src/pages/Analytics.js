import React, { useState, useEffect } from 'react';
import api from '../api';

/* ─── Palette DigiLab Solutions ──────────────────────────────────
   Extraite de digilabsolutions.tn :
   - Fond principal : blanc #ffffff / gris très clair #f4f6fb
   - Navy sombre    : #0a0e2a  (sections hero du site)
   - Orange vif     : #f5a623  (CTA, accents)
   - Orange foncé   : #d4891a  (hover)
   - Bleu accent    : #2563eb
   - Texte          : #1a1f3c
   - Sous-texte     : #6b7280
──────────────────────────────────────────────────────────────── */
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

/* ─── CSS global ─────────────────────────────────────────────── */
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

/* ─── Section header style DigiLab ───────────────────────────── */
function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      {/* carré orange signature DigiLab */}
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

/* ─── Icônes SVG ─────────────────────────────────────────────── */
const Ico = ({ d, color, size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
    stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const ICONS = {
  users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  file:     <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  click:    <><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  money:    <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  trend:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  diamond:  <><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></>,
};

/* ─── KPI overview card ───────────────────────────────────────── */
function KpiCard({ label, value, iconKey, color, bgDim, delay }) {
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
      {/* icon circle */}
      <div style={{
        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
        background: bgDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ico d={ICONS[iconKey]} color={color} size={22} />
      </div>
      <div>
        <div style={{
          fontSize: 32, fontWeight: 800, color: C.navy,
          lineHeight: 1, letterSpacing: '-0.03em',
          animation: show ? 'countUp 0.5s ease both' : 'none',
        }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 5, fontWeight: 500 }}>{label}</div>
        {/* accent line */}
        <div style={{ width: 28, height: 2, background: color, borderRadius: 2, marginTop: 8, opacity: 0.6 }} />
      </div>
    </div>
  );
}

/* ─── Performance card ────────────────────────────────────────── */
function PerfCard({ label, value, iconKey, color, bgDim, delay }) {
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
      }}>
        <Ico d={ICONS[iconKey]} color={color} size={20} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 7, fontWeight: 500 }}>{label}</div>
      <div style={{ width: 24, height: 2, background: color, borderRadius: 2, margin: '10px auto 0', opacity: 0.6 }} />
    </div>
  );
}

/* ─── Résumé card — style navy DigiLab ───────────────────────── */
function SummaryCard({ label, value, iconKey, color, bgDim }) {
  return (
    <div className="dl-card" style={{
      background: C.navy, borderRadius: 16,
      border: `1.5px solid ${C.navyLight}`,
      padding: '24px 26px',
      display: 'flex', alignItems: 'center', gap: 18,
      boxShadow: '0 4px 20px rgba(10,14,42,0.18)',
      cursor: 'default',
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
        background: `${color}20`, border: `1.5px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ico d={ICONS[iconKey]} color={color} size={22} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: `${color}cc`, textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Analytics() {
  const [kpis, setKpis]           = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics/kpis'),
      api.get('/api/analytics/evolution'),
    ]).then(([k, e]) => {
      setKpis(k.data);
      setEvolution(e.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const overviewCards = kpis ? [
    { label: 'Total Clients',        value: kpis.overview.totalClients,        iconKey: 'users',    color: C.orange, bgDim: C.orangeDim },
    { label: 'Total Contacts',       value: kpis.overview.totalContacts,       iconKey: 'file',     color: C.green,  bgDim: C.greenDim  },
    { label: 'Campagnes envoyées',   value: kpis.overview.campagnesEnvoyees,   iconKey: 'send',     color: C.blue,   bgDim: C.blueDim   },
    { label: 'Campagnes planifiées', value: kpis.overview.campagnesPlanifiees, iconKey: 'calendar', color: C.purple, bgDim: C.purpleDim },
  ] : [];

  const perfCards = kpis ? [
    { label: 'Emails envoyés',   value: kpis.performance.totalEmailsSent,          iconKey: 'mail',  color: C.orange, bgDim: C.orangeDim },
    { label: "Taux d'ouverture", value: kpis.performance.tauxOuvertureMoyen + '%', iconKey: 'eye',   color: C.green,  bgDim: C.greenDim  },
    { label: 'Taux de clic',     value: kpis.performance.tauxClicMoyen + '%',      iconKey: 'click', color: C.blue,   bgDim: C.blueDim   },
    { label: 'Conversions',      value: kpis.performance.totalConversions,          iconKey: 'check', color: C.purple, bgDim: C.purpleDim },
    { label: 'ROI Total',        value: kpis.performance.roiTotal + '%',           iconKey: 'money', color: C.red,    bgDim: 'rgba(220,38,38,0.10)' },
  ] : [];

  const TABLE_COLS = ['MOIS', 'CAMPAGNES', 'EMAILS ENVOYÉS', 'OUVERTURES', 'CONVERSIONS'];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {/* ── Vue d'ensemble ── */}
      <div style={{ marginBottom: 30 }}>
        <SectionHead label="Vue d'ensemble" />
        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: C.shadow }}>
                  <Skel w={54} h={54} r={27} />
                  <div style={{ flex: 1 }}><Skel h={30} w="50%" /><div style={{ marginTop: 8 }}><Skel h={12} w="70%" r={4} /></div></div>
                </div>
              ))}
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {overviewCards.map((c, i) => <KpiCard key={c.label} {...c} delay={i * 75} />)}
            </div>
        }
      </div>

      {/* ── Performance ── */}
      <div style={{ marginBottom: 30 }}>
        <SectionHead label="Performance des campagnes" />
        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: C.shadow }}>
                  <Skel w={48} h={48} r={24} /><Skel h={26} w="55%" /><Skel h={12} w="72%" r={4} />
                </div>
              ))}
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              {perfCards.map((c, i) => <PerfCard key={c.label} {...c} delay={260 + i * 75} />)}
            </div>
        }
      </div>

      {/* ── Évolution par mois ── */}
      <div style={{ marginBottom: 30 }}>
        <SectionHead label="Évolution par mois" />
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`,
          boxShadow: C.shadow, overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(4)].map((_, i) => <Skel key={i} h={44} r={8} />)}
            </div>
          ) : evolution.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Aucune donnée disponible</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {TABLE_COLS.map(h => (
                    <th key={h} style={{
                      padding: '14px 18px', textAlign: 'left',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.16em', color: C.orange,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evolution.map((e, i) => (
                  <tr key={i} className="dl-row"
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: 'default' }}>
                    <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 700, color: C.text }}>{e.mois}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="dl-badge-pill">{e.campagnes}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted }}>{e.emailsSent ?? 0}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted }}>{e.opens ?? 0}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted }}>{e.conversions ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Résumé analytique — fond navy ── */}
      <div>
        <SectionHead label="Résumé analytique" />
        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: C.navy, borderRadius: 16, padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Skel w={54} h={54} r={27} />
                  <div style={{ flex: 1 }}><Skel h={12} w="55%" r={4} /><div style={{ marginTop: 10 }}><Skel h={32} w="45%" /></div></div>
                </div>
              ))}
            </div>
          : kpis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <SummaryCard label="Segments actifs"    value={kpis.overview.totalSegments}              iconKey="target"  color={C.orange} bgDim={C.orangeDim} />
              <SummaryCard label="Taux de conversion" value={kpis.performance.tauxConversionMoyen+'%'} iconKey="trend"   color="#4ade80"  bgDim="rgba(74,222,128,0.15)" />
              <SummaryCard label="ROI Global"         value={kpis.performance.roiTotal+'%'}            iconKey="diamond" color="#a78bfa"  bgDim="rgba(167,139,250,0.15)" />
            </div>
          )
        }
      </div>
    </div>
  );
}