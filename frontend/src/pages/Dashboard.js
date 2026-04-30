import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DP = {
  gold:     '#f5a623',
  goldGlow: 'rgba(245,166,35,0.12)',
  dark:     '#16120d',
  bg:       '#f6f3ee',
  card:     '#ffffff',
  border:   '#ede8df',
  text:     '#1a160e',
  muted:    '#9c8f7a',
  font:     "'Montserrat', 'Open Sans', sans-serif",
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
};

const KPI_CONFIG = [
  { key: 'clients',   label: 'Clients',   icon: '👥', accent: DP.gold,  iconBg: DP.goldGlow },
  { key: 'campagnes', label: 'Campagnes', icon: '📢', accent: DP.blue,  iconBg: 'rgba(59,130,246,0.1)' },
  { key: 'contacts',  label: 'Contacts',  icon: '📋', accent: DP.green, iconBg: 'rgba(34,197,94,0.1)' },
  { key: 'segments',  label: 'Segments',  icon: '🎯', accent: DP.red,   iconBg: 'rgba(239,68,68,0.1)' },
];

const STATUS_STYLE = {
  sent:      { background: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
  scheduled: { background: 'rgba(59,130,246,0.1)',  color: '#2563eb' },
  draft:     { background: 'rgba(245,166,35,0.12)', color: '#d97706' },
  default:   { background: '#f3f4f6',               color: '#6b7280' },
};

const TYPE_ICON  = { email: '📧', sms: '📱', push: '🔔' };
const TYPE_STYLE = {
  email: { background: 'rgba(59,130,246,0.1)',  color: DP.blue   },
  sms:   { background: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
  push:  { background: 'rgba(245,166,35,0.12)', color: '#d97706' },
};

/* ── Sparkline SVG ── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ opacity: 0.45 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Progress bar ── */
function ProgBar({ label, icon, pct, color, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: DP.text }}>
          <span>{icon}</span>{label}
        </div>
        <span style={{ fontFamily: DP.font, fontSize: 12, fontWeight: 800, color }}>{value}</span>
      </div>
      <div style={{ height: 5, background: DP.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/* ── Pill ── */
function Pill({ text, style }) {
  return (
    <span style={{ ...style, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
      {text}
    </span>
  );
}

/* ── Canvas Line Chart ── */
function LineChart({ emailData, smsData, pushData }) {
  const canvasRef = useRef(null);
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    const allVals = [...emailData, ...smsData, ...pushData];
    const maxVal  = Math.max(...allVals) * 1.15 || 1;
    const pL = 44, pR = 12, pT = 12, pB = 28;
    const cW = W - pL - pR, cH = H - pT - pB;

    ctx.clearRect(0, 0, W, H);

    // Grid + Y labels
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const y = pT + cH * (1 - t);
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(W - pR, y); ctx.stroke();
      const val = Math.round(maxVal * t);
      ctx.fillStyle = DP.muted;
      ctx.font = `600 9px ${DP.font}`;
      ctx.textAlign = 'right';
      ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val, pL - 5, y + 3);
    });

    // X labels
    labels.forEach((l, i) => {
      const x = pL + (i / (labels.length - 1)) * cW;
      ctx.fillStyle = DP.muted;
      ctx.font = `600 9px ${DP.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(l, x, H - 6);
    });

    const drawLine = (data, color, fillAlpha) => {
      const pts = data.map((v, i) => ({
        x: pL + (i / (data.length - 1)) * cW,
        y: pT + cH * (1 - v / maxVal),
      }));

      // Area fill
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pT + cH);
      ctx.lineTo(pts[0].x, pT + cH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pT, 0, pT + cH);
      grad.addColorStop(0, color + Math.round(fillAlpha * 255).toString(16).padStart(2, '0'));
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad; ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = color; ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round'; ctx.stroke();

      // Dots
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    };

    drawLine(pushData,  DP.gold,  0.12);
    drawLine(smsData,   DP.green, 0.10);
    drawLine(emailData, DP.blue,  0.12);
  }, [emailData, smsData, pushData]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        {[['Email', DP.blue], ['SMS', DP.green], ['Push', DP.gold]].map(([l, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: DP.muted }}>
            <span style={{ width: 12, height: 3, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 200, display: 'block' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [user,           setUser]           = useState(null);
  const [stats,          setStats]          = useState({ clients: 0, campagnes: 0, contacts: 0, segments: 0 });
  const [recentCampagnes,setRecentCampagnes]= useState([]);
  const [hoveredCard,    setHoveredCard]    = useState(null);
  const [hoveredRow,     setHoveredRow]     = useState(null);

  const emailData = [8200, 12400, 9800, 15600, 11200, 18400, 14200];
  const smsData   = [3200, 4100,  2900, 5600,  3800,  6200,  4900];
  const pushData  = [1800, 3400,  2200, 4800,  3100,  5900,  4100];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });

    Promise.all([
      api.get('/api/auth/me'),
      api.get('/api/clients'),
      api.get('/api/campagnes'),
      api.get('/api/contacts'),
      api.get('/api/segments')
    ]).then(([clients, campagnes, contacts, segments]) => {
      setStats({
        clients:   clients.data.length,
        campagnes: campagnes.data.length,
        contacts:  contacts.data.length,
        segments:  segments.data.length,
      });
      setRecentCampagnes(campagnes.data.slice(0, 5));
    }).catch(console.error);
  }, [navigate]);

  const sparkData = {
    clients:   [4, 6, 5, 8, 7, 9,  stats.clients],
    campagnes: [2, 4, 3, 6, 5, 7,  stats.campagnes],
    contacts:  [10,12,11,15,13,16, stats.contacts],
    segments:  [1, 2, 2, 3, 3, 4,  stats.segments],
  };

  return (
    <div style={{ fontFamily: DP.font, color: DP.text }}>

      {/* Welcome Banner */}
      {user && (
        <div style={{
          marginBottom: 22, padding: '1.1rem 1.5rem',
          background: DP.dark, borderRadius: 14,
          border: '1px solid rgba(245,166,35,0.15)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', background: 'radial-gradient(ellipse 80% 80% at 90% 50%, rgba(200,120,10,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: DP.gold, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5, position: 'relative', zIndex: 1 }}>
            <span style={{ width: 18, height: 2, background: DP.gold, display: 'inline-block' }} />
            Plateforme Marketing Cloud
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 3px', position: 'relative', zIndex: 1 }}>
            Bonjour, {user.name} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, margin: 0, position: 'relative', zIndex: 1 }}>
            Voici un aperçu de votre plateforme marketing
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 18 }}>
        {KPI_CONFIG.map(k => (
          <div key={k.key}
            onMouseEnter={() => setHoveredCard(k.key)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: DP.card, borderRadius: 14,
              border: `1px solid ${DP.border}`,
              borderLeft: `3px solid ${k.accent}`,
              padding: '1rem 1.1rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              transform: hoveredCard === k.key ? 'translateY(-3px)' : 'none',
              boxShadow: hoveredCard === k.key ? '0 8px 24px rgba(0,0,0,0.07)' : 'none',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: DP.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{k.label}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.accent, lineHeight: 1, marginBottom: 6 }}>{stats[k.key]}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 11, color: DP.muted }}>Total enregistrés</div>
              <Sparkline data={sparkData[k.key]} color={k.accent} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 : Chart + Par Canal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 13, marginBottom: 18 }}>

        {/* Line Chart card */}
        <div style={{ background: DP.card, borderRadius: 14, border: `1px solid ${DP.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.2rem', borderBottom: `1px solid ${DP.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: DP.text }}>Évolution des Campagnes — 7 jours</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: DP.gold, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Voir tout →</span>
          </div>
          <div style={{ padding: '1rem 1.2rem' }}>
            <LineChart emailData={emailData} smsData={smsData} pushData={pushData} />
          </div>
        </div>

        {/* Par Canal */}
        <div style={{ background: DP.card, borderRadius: 14, border: `1px solid ${DP.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', borderBottom: `1px solid ${DP.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: DP.text }}>Par Canal</span>
          </div>
          <div style={{ padding: '1.1rem 1.2rem' }}>
            <ProgBar label="Email" icon="📧" pct={72} color={DP.blue}  value="72%" />
            <ProgBar label="SMS"   icon="📱" pct={55} color={DP.green} value="55%" />
            <ProgBar label="Push"  icon="🔔" pct={88} color={DP.gold}  value="88%" />
            <div style={{ borderTop: `1px solid ${DP.border}`, marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { icon: '🏙️', label: 'Villes actives',    value: '24' },
                { icon: '👥', label: 'Abonnés total',     value: '142 k', badge: '+8%',  badgeColor: DP.green },
                { icon: '🏢', label: 'Clients (tenants)', value: String(stats.clients), badge: '+2', badgeColor: DP.blue },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 9px', background: '#f6f3ee', borderRadius: 7, border: `1px solid ${DP.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: DP.text }}>
                    <span>{r.icon}</span>{r.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: DP.text }}>{r.value}</span>
                    {r.badge && <span style={{ fontSize: 10, fontWeight: 700, color: r.badgeColor, background: `${r.badgeColor}18`, padding: '1px 5px', borderRadius: 4 }}>{r.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div style={{ background: DP.card, borderRadius: 14, border: `1px solid ${DP.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.2rem', borderBottom: `1px solid ${DP.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: DP.text }}>Campagnes Récentes</span>
          <span onClick={() => navigate('/campagnes')} style={{ fontSize: 10, fontWeight: 700, color: DP.gold, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nouvelle Campagne +
          </span>
        </div>

        {recentCampagnes.length === 0 ? (
          <p style={{ color: DP.muted, textAlign: 'center', padding: '2rem', fontSize: 13 }}>Aucune campagne</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Titre', 'Canal', 'Client', 'Statut', 'Progression'].map(h => (
                  <th key={h} style={{ padding: '0 13px 9px', textAlign: 'left', fontSize: 10, color: DP.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCampagnes.map((c, i) => {
                const sc  = STATUS_STYLE[c.status] || STATUS_STYLE.default;
                const tc  = TYPE_STYLE[c.type?.toLowerCase()];
                const ico = TYPE_ICON[c.type?.toLowerCase()] || '📄';
                const pct = c.progress ?? Math.min(99, 30 + i * 18);
                return (
                  <tr key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom: i < recentCampagnes.length - 1 ? `1px solid #f6f3ee` : 'none', background: hoveredRow === c.id ? '#faf8f4' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '10px 13px', fontSize: 13, fontWeight: 600, color: DP.text }}>{c.title}</td>
                    <td style={{ padding: '10px 13px' }}>
                      {tc
                        ? <Pill text={`${ico} ${c.type}`} style={{ background: tc.background, color: tc.color }} />
                        : <span style={{ fontSize: 12, color: DP.muted }}>{c.type}</span>}
                    </td>
                    <td style={{ padding: '10px 13px', fontSize: 12, color: DP.muted }}>{c.client?.name || '—'}</td>
                    <td style={{ padding: '10px 13px' }}><Pill text={c.status} style={sc} /></td>
                    <td style={{ padding: '10px 13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ flex: 1, height: 4, background: DP.border, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: DP.gold, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: DP.muted, minWidth: 26 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}