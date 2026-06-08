import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Design system unifié DigiPip ── */
const T = {
  bg:       '#f0f2f8',
  card:     '#ffffff',
  navy:     '#16120d',
  navyMid:  '#1e2a3a',
  gold:     '#f5a623',
  goldDark: '#c8831a',
  goldDim:  'rgba(245,166,35,0.10)',
  goldGlow: 'rgba(245,166,35,0.20)',
  border:   '#e4e9f2',
  borderHi: '#f5a623',
  text:     '#1a1f3c',
  muted:    '#7a8599',
  green:    '#22c55e',
  greenDim: 'rgba(34,197,94,0.10)',
  blue:     '#3b82f6',
  blueDim:  'rgba(59,130,246,0.10)',
  purple:   '#8b5cf6',
  purpleDim:'rgba(139,92,246,0.10)',
  red:      '#ef4444',
  sans:     "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

/* ── Sparkline SVG ── */
function Sparkline({ data, color }) {
  const w = 90, h = 36;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*(h-6)}`).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Mini bar chart (7 jours) ── */
function BarChart({ data, labels, colors }) {
  const max = Math.max(...data.flatMap(s => s.values));
  const barW = 10, gap = 3, groupGap = 14;
  const groupW = data.length * (barW + gap) - gap + groupGap;
  const W = labels.length * groupW;
  const H = 160;

  return (
    <svg width="100%" height={H + 30} viewBox={`0 0 ${W} ${H + 30}`} preserveAspectRatio="none">
      {labels.map((label, gi) => (
        <g key={gi} transform={`translate(${gi * groupW}, 0)`}>
          {data.map((series, si) => {
            const val = series.values[gi];
            const barH = (val / max) * (H - 10);
            const x = si * (barW + gap);
            const y = H - barH;
            return (
              <g key={si}>
                <rect x={x} y={y} width={barW} height={barH}
                  rx="3" fill={colors[si]} opacity="0.85"/>
                <rect x={x} y={y} width={barW} height="3"
                  rx="2" fill={colors[si]}/>
              </g>
            );
          })}
          <text x={(data.length * (barW + gap)) / 2 - gap} y={H + 18}
            textAnchor="middle" fontSize="9" fill={T.muted} fontFamily={T.sans}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Donut chart ── */
function Donut({ segments, size = 110 }) {
  const r = 38, cx = size/2, cy = size/2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a,s) => a + s.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth="14"/>
      {segments.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="800" fill={T.text} fontFamily={T.sans}>
        {total}
      </text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill={T.muted} fontFamily={T.sans}>
        TOTAL
      </text>
    </svg>
  );
}

/* ── Activity item ── */
function ActivityItem({ icon, title, sub, time, color, delay }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'11px 0',
      borderBottom:`1px solid ${T.border}`,
      animation:`fadeUp 0.4s ease ${delay}ms both`,
    }}>
      <div style={{
        width:36, height:36, borderRadius:10, flexShrink:0,
        background:`${color}15`, border:`1px solid ${color}25`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
      }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        <div style={{ fontSize:11, color:T.muted }}>{sub}</div>
      </div>
      <div style={{ fontSize:10, color:T.muted, flexShrink:0 }}>{time}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [user,      setUser]      = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);
    Promise.all([
      api.get('/api/stats').catch(() => ({ data: {} })),
      api.get('/api/campagnes').catch(() => ({ data: [] })),
    ]).then(([s, c]) => {
      setStats(s.data);
      const arr = Array.isArray(c.data) ? c.data : c.data?.data || [];
      setCampagnes(arr.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const isAdmin  = user.role === 'ADMIN' || user.role === 'RESPONSABLE_MARKETING';
  const isClient = user.role === 'CLIENT';
  const firstName = user.name?.split(' ')[0] || 'vous';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  /* KPI cards */
  const kpis = isClient ? [
    { label:'Mes Campagnes', value: campagnes.length || stats?.campagnes || 0, icon:'📢', color:T.gold,   spark:[2,3,2.5,4,3.8,5,4.5], route:'/mes-campagnes' },
    { label:'Contacts',      value: stats?.contacts  || 0,                     icon:'📋', color:T.green,  spark:[1,2,1.5,3,2.8,4,3.5], route:'/contacts' },
    { label:'Segments',      value: stats?.segments  || 0,                     icon:'🎯', color:T.blue,   spark:[3,2,4,3,5,4,6],       route:'/segments' },
    { label:'Taux moyen',    value: '72%',                                     icon:'📈', color:T.purple, spark:[60,65,70,68,72,75,72], route:'/reporting' },
  ] : [
    { label:'Clients',    value: stats?.clients   ?? 12,   icon:'🏢', color:T.gold,   spark:[2,3,2.5,4,3.8,5,4.5], route:'/clients' },
    { label:'Campagnes',  value: stats?.campagnes ?? 7,    icon:'📢', color:T.blue,   spark:[1,3,2,4,3,5,4],       route:'/campagnes' },
    { label:'Contacts',   value: stats?.contacts  ?? 1240, icon:'📋', color:T.green,  spark:[100,200,180,300,280,380,350], route:'/contacts' },
    { label:'Segments',   value: stats?.segments  ?? 9,    icon:'🎯', color:T.purple, spark:[3,2,4,3,5,4,6],       route:'/segments' },
  ];

  /* Chart data */
  const barSeries = [
    { label:'Email', values:[8200,12500,9800,15200,13100,17800,14200] },
    { label:'SMS',   values:[3100,4200,3800,5100,4600,5800,4900]     },
    { label:'Push',  values:[1800,2900,3200,4100,3700,4500,3900]     },
  ];
  const barColors  = [T.blue, T.green, T.gold];
  const barLabels  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  /* Donut */
  const donutSegs = [
    { label:'Email', value:68, color:T.blue   },
    { label:'SMS',   value:52, color:T.green  },
    { label:'Push',  value:81, color:T.gold   },
  ];

  /* Recent activity */
  const activities = [
    { icon:'📢', title:'Campagne "Conférence IA 2026" déployée',  sub:'TechEventCo · Email',  time:'Il y a 2 min',  color:T.gold  },
    { icon:'👥', title:'3 nouveaux contacts importés',           sub:'Segment B2B Tech',      time:'Il y a 18 min', color:T.blue  },
    { icon:'✅', title:'Campagne "Promo Été" livrée à 97%',      sub:'12 500 destinataires',  time:'Il y a 1h',     color:T.green },
    { icon:'🎯', title:'Segment "VIP Tunisie" mis à jour',       sub:'847 contacts actifs',   time:'Il y a 3h',     color:T.purple},
  ];

  /* Status campagnes */
  const statusCfg = {
    sent:      { label:'Deployed', color:T.green,  bg:T.greenDim  },
    active:    { label:'Live',     color:T.green,  bg:T.greenDim  },
    draft:     { label:'Draft',    color:T.gold,   bg:T.goldDim   },
    scheduled: { label:'Queued',   color:T.blue,   bg:T.blueDim   },
    failed:    { label:'Failed',   color:T.red,    bg:'rgba(239,68,68,0.10)' },
  };

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, fontFamily:T.sans }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:`3px solid ${T.border}`, borderTopColor:T.gold, animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <span style={{ color:T.muted, fontSize:14 }}>Chargement...</span>
      </div>
    </div>
  );

  return (
    <div style={{ background:T.bg, minHeight:'100vh', fontFamily:T.sans, padding:'28px 32px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .kpi-card { transition:all 0.25s cubic-bezier(0.4,0,0.2,1); cursor:pointer; }
        .kpi-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(245,166,35,0.14) !important; border-color:#f5a623 !important; }
        .camp-row { transition:all 0.2s; cursor:pointer; }
        .camp-row:hover { background:rgba(245,166,35,0.04) !important; }
      `}</style>

      {/* ── Hero banner ── */}
      <div style={{
        background:`linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 60%, #1a2535 100%)`,
        borderRadius:22, padding:'32px 40px', marginBottom:28,
        color:'white', position:'relative', overflow:'hidden',
        boxShadow:'0 8px 40px rgba(22,18,13,0.20)',
        animation:'fadeUp 0.5s ease both',
      }}>
        {/* Decoration circles */}
        <div style={{ position:'absolute', top:-50, right:-50, width:240, height:240, background:'rgba(245,166,35,0.07)', borderRadius:'50%', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-30, right:120, width:140, height:140, background:'rgba(245,166,35,0.04)', borderRadius:'50%', pointerEvents:'none' }}/>
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>

        <div style={{ position:'relative' }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:'2.5px', marginBottom:10, textTransform:'uppercase' }}>
            ⚡ DigiPip Marketing Platform
          </div>
          <h1 style={{ fontSize:30, fontWeight:800, margin:'0 0 10px', lineHeight:1.2 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize:14, opacity:0.7, maxWidth:500, margin:'0 0 22px', lineHeight:1.6 }}>
            {isClient
              ? 'Voici l\'état de vos campagnes et performances marketing en temps réel.'
              : 'Vue globale de la plateforme — campagnes, contacts et analytics.'}
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => navigate(isClient ? '/mes-campagnes' : '/campagnes')}
              style={{ padding:'10px 22px', background:T.gold, color:T.navy, border:'none', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer' }}>
              {isClient ? '📢 Mes Campagnes' : '📢 Voir les Campagnes'}
            </button>
            <button
              onClick={() => navigate('/pipeline')}
              style={{ padding:'10px 22px', background:'rgba(255,255,255,0.08)', color:'white', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ⚡ Pipeline DevOps
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {kpis.map((k,i) => (
          <div key={k.label} className="kpi-card"
            onClick={() => navigate(k.route)}
            style={{
              background:T.card, borderRadius:18, padding:'22px 22px 18px',
              border:`1.5px solid ${T.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.05)',
              animation:`fadeUp 0.5s ease ${i*55}ms both`,
            }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', color:T.muted, textTransform:'uppercase', marginBottom:6 }}>{k.label}</div>
                <div style={{ fontSize:36, fontWeight:800, color:k.color, lineHeight:1 }}>
                  {typeof k.value === 'number' ? k.value.toLocaleString('fr-FR') : k.value}
                </div>
              </div>
              <div style={{ width:44, height:44, borderRadius:12, background:`${k.color}15`, border:`1px solid ${k.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                {k.icon}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:T.green, fontWeight:600 }}>↑ +12% ce mois</span>
              <Sparkline data={k.spark} color={k.color}/>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, marginBottom:24 }}>

        {/* Bar chart — Évolution 7 jours */}
        <div style={{ background:T.card, borderRadius:18, padding:'24px 28px', border:`1.5px solid ${T.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', animation:'fadeUp 0.5s ease 240ms both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:4 }}>Évolution des envois</div>
              <div style={{ fontSize:12, color:T.muted }}>7 derniers jours · par canal</div>
            </div>
            <div style={{ display:'flex', gap:14 }}>
              {[{l:'Email',c:T.blue},{l:'SMS',c:T.green},{l:'Push',c:T.gold}].map(({l,c}) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                  <span style={{ fontSize:10, color:T.muted, fontWeight:600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <BarChart data={barSeries} labels={barLabels} colors={barColors}/>
        </div>

        {/* Donut — répartition canaux */}
        <div style={{ background:T.card, borderRadius:18, padding:'24px 24px', border:`1.5px solid ${T.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', animation:'fadeUp 0.5s ease 300ms both' }}>
          <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:4 }}>Répartition canaux</div>
          <div style={{ fontSize:12, color:T.muted, marginBottom:20 }}>Taux d'engagement</div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
            <Donut segments={donutSegs}/>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
              {donutSegs.map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:12, color:T.muted }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.value}%</span>
                  <div style={{ width:60, height:4, borderRadius:2, background:T.border, overflow:'hidden' }}>
                    <div style={{ width:`${s.value}%`, height:'100%', background:s.color, borderRadius:2, transition:'width 1.2s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row : campagnes récentes + activité ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Campagnes récentes */}
        <div style={{ background:T.card, borderRadius:18, padding:'24px 24px', border:`1.5px solid ${T.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', animation:'fadeUp 0.5s ease 360ms both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Campagnes récentes</div>
              <div style={{ fontSize:12, color:T.muted }}>Derniers déploiements</div>
            </div>
            <button onClick={() => navigate(isClient?'/mes-campagnes':'/campagnes')}
              style={{ fontSize:12, color:T.gold, fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
              Voir tout →
            </button>
          </div>
          {campagnes.length === 0 ? (
            <div style={{ padding:'30px', textAlign:'center', color:T.muted, fontSize:13 }}>Aucune campagne</div>
          ) : (
            <div>
              {campagnes.map((c,i) => {
                const sc = statusCfg[c.status] || statusCfg.draft;
                const typeIcon = {email:'✉',sms:'💬',push:'🔔'}[c.type?.toLowerCase()] || '📢';
                return (
                  <div key={c.id} className="camp-row"
                    onClick={() => navigate(`/campagne/${c.id}`)}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'11px 10px', borderRadius:10,
                      borderBottom: i < campagnes.length-1 ? `1px solid ${T.border}` : 'none',
                      animation:`fadeUp 0.4s ease ${400+i*50}ms both`,
                    }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:T.goldDim, border:`1px solid ${T.gold}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      {typeIcon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize:11, color:T.muted }}>{c.client?.name || 'DigiPip'}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, color:sc.color, background:sc.bg, padding:'3px 9px', borderRadius:20, flexShrink:0 }}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div style={{ background:T.card, borderRadius:18, padding:'24px 24px', border:`1.5px solid ${T.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', animation:'fadeUp 0.5s ease 420ms both' }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Activité récente</div>
            <div style={{ fontSize:12, color:T.muted }}>Événements plateforme</div>
          </div>
          {activities.map((a,i) => (
            <ActivityItem key={i} {...a} delay={440+i*50}/>
          ))}
        </div>
      </div>
    </div>
  );
}
