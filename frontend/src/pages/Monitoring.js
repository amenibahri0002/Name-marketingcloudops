import React, { useState, useEffect, useCallback } from 'react';
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
  shadow:     '0 1px 8px rgba(10,14,42,0.07)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes ping {
    0%,100% { transform:scale(1); opacity:0.4; }
    50%      { transform:scale(2.2); opacity:0; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.4; }
  }
  .dl-check-card:hover { border-color:#f5a623 !important; background:#fffbf5 !important; }
  .dl-check-card { transition:all 0.2s; }
  .dl-deploy-row:hover { background:#fafbff !important; }
`;

/* ─── Helpers ─────────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '400px 100%',
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

/* ─── Status dot animé ────────────────────────────────────────── */
function StatusDot({ ok, size = 8 }) {
  const color = ok ? C.green : C.red;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 4, height: size + 4, flexShrink: 0 }}>
      <span style={{ position: 'absolute', width: size + 4, height: size + 4, borderRadius: '50%', background: color, opacity: 0.3, animation: 'ping 1.8s ease-in-out infinite' }} />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'relative', flexShrink: 0 }} />
    </span>
  );
}

/* ─── Déploiements externes (Vercel + Render) ─────────────────── */
const DEPLOYMENTS = [
  {
    name:    'Frontend MarketingCloudOps',
    service: 'Vercel',
    url:     'https://digipip.vercel.app',
    icon:    '▲',
    color:   '#000000',
    bg:      'rgba(0,0,0,0.06)',
    type:    'frontend',
  },
  {
    name:    'Backend MarketingCloudOps',
    service: 'Render',
    url:     'https://marketingcloudops-backend.onrender.com/api/health',
    icon:    '⬡',
    color:   '#46E3B7',
    bg:      'rgba(70,227,183,0.08)',
    type:    'backend',
  },
  {
    name:    'Backend TechEvent',
    service: 'Render',
    url:     'https://marketingcloudops-backend.onrender.com/api/health',
    icon:    '⬡',
    color:   '#46E3B7',
    bg:      'rgba(70,227,183,0.08)',
    type:    'backend',
  },
  {
    name:    'Base de données Neon',
    service: 'Neon PostgreSQL',
    url:     null, // testé via API interne
    icon:    '🐘',
    color:   '#00e599',
    bg:      'rgba(0,229,153,0.08)',
    type:    'db',
  },
];

/* ─── Check uptime d'une URL externe ─────────────────────────── */
async function checkUrl(url) {
  if (!url) return { ok: true, ms: 0, note: 'Via API interne' };
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-cache' });
    return { ok: true, ms: Date.now() - t0, note: 'Accessible' };
  } catch {
    return { ok: false, ms: Date.now() - t0, note: 'Inaccessible' };
  }
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Monitoring() {
  const [checks,       setChecks]       = useState([]);
  const [deployments,  setDeployments]  = useState(DEPLOYMENTS.map(d => ({ ...d, status: null, ms: null })));
  const [stats,        setStats]        = useState(null);
  const [lastPing,     setLastPing]     = useState(null);
  const [pingMs,       setPingMs]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [deployLoading,setDeployLoading]= useState(true);
  const [autoRefresh,  setAutoRefresh]  = useState(true);
  const [logs,         setLogs]         = useState([]);

  /* ── Checks API internes ── */
  const runChecks = useCallback(async () => {
    setLoading(true);
    const results = [];
    const t0 = Date.now();

    const check = async (name, fn, detail) => {
      try {
        await fn();
        results.push({ name, status: true, detail, ms: Date.now() - t0 });
      } catch (e) {
        const ok = e.response?.status === 401 || e.response?.status === 403;
        results.push({ name, status: ok, detail: ok ? 'Protégé (401)' : 'Erreur', ms: Date.now() - t0 });
      }
    };

    await check('API Backend',      () => api.get('/api/health'),    'Render · Online');
    await check('Auth / Users',     () => api.get('/api/users'),     'JWT Auth');
    await check('Module Campagnes', () => api.get('/api/campagnes'), 'Accessible');
    await check('Module Contacts',  () => api.get('/api/contacts'),  'Accessible');
    await check('Module Clients',   () => api.get('/api/clients'),   'Accessible');
    await check('Module Segments',  () => api.get('/api/segments'),  'Accessible');
    await check('Analytics KPIs',   () => api.get('/api/analytics/kpis'), 'Accessible');

    const totalMs = Date.now() - t0;
    setPingMs(totalMs);
    setLastPing(new Date());
    setChecks(results);

    // Log
    const ts = new Date().toLocaleTimeString('fr-FR');
    const allOk = results.every(r => r.status);
    setLogs(prev => [{
      time: ts,
      msg: allOk ? 'Tous les services OK' : `${results.filter(r => !r.status).length} service(s) en erreur`,
      ok: allOk,
    }, ...prev].slice(0, 20));

    // Stats DB
    try {
      const [ca, co, cl] = await Promise.all([
        api.get('/api/campagnes'),
        api.get('/api/contacts'),
        api.get('/api/clients'),
      ]);
      const campagnes = Array.isArray(ca.data) ? ca.data : ca.data.data || [];
      const contacts  = Array.isArray(co.data) ? co.data : co.data.data || [];
      setStats({
        campagnes: campagnes.length,
        sent:      campagnes.filter(c => c.status === 'sent').length,
        contacts:  contacts.length,
        clients:   Array.isArray(cl.data) ? cl.data.length : 0,
      });
    } catch { setStats(null); }

    setLoading(false);
  }, []);

  /* ── Checks déploiements externes ── */
  const checkDeployments = useCallback(async () => {
    setDeployLoading(true);
    const updated = await Promise.all(
      DEPLOYMENTS.map(async d => {
        if (d.type === 'db') {
          // DB testée via l'API interne
          try {
            await api.get('/api/clients');
            return { ...d, status: true, ms: null, note: 'Neon connecté' };
          } catch {
            return { ...d, status: false, ms: null, note: 'Erreur connexion' };
          }
        }
        const result = await checkUrl(d.url);
        return { ...d, status: result.ok, ms: result.ms, note: result.note };
      })
    );
    setDeployments(updated);
    setDeployLoading(false);
  }, []);

  useEffect(() => {
    runChecks();
    checkDeployments();
  }, [runChecks, checkDeployments]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { runChecks(); checkDeployments(); }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, runChecks, checkDeployments]);

  const allOk     = checks.length > 0 && checks.every(c => c.status);
  const hasDown   = checks.some(c => !c.status);
  const upCount   = checks.filter(c => c.status).length;
  const deployUp  = deployments.filter(d => d.status === true).length;

  const globalStatus = loading ? 'loading'
    : allOk ? 'ok'
    : hasDown ? 'error'
    : 'warn';

  const STATUS_CONFIG = {
    ok:      { bg: C.greenDim, border: 'rgba(34,197,94,0.25)', icon: '✅', color: C.green,  text: 'Tous les services sont opérationnels' },
    error:   { bg: C.redDim,   border: 'rgba(239,68,68,0.25)', icon: '🚨', color: C.red,    text: 'Certains services sont hors ligne' },
    warn:    { bg: C.goldDim,  border: C.goldBorder,           icon: '⚠️', color: C.goldDark, text: 'Vérification en cours...' },
    loading: { bg: C.goldDim,  border: C.goldBorder,           icon: '⏳', color: C.goldDark, text: 'Vérification des services...' },
  };
  const sc = STATUS_CONFIG[globalStatus];

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
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Monitoring</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            État des services en temps réel
            {lastPing && <span style={{ marginLeft: 8 }}>· Dernière vérif : <strong>{lastPing.toLocaleTimeString('fr-FR')}</strong></span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setAutoRefresh(a => !a)} style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', border: `1.5px solid ${C.border}`,
            background: autoRefresh ? C.goldDim : C.card,
            color: autoRefresh ? C.goldDark : C.textMuted,
            transition: 'all 0.2s',
          }}>
            {autoRefresh ? '⏸ Auto ON' : '▶ Auto OFF'}
          </button>
          <button onClick={() => { runChecks(); checkDeployments(); }} style={{
            background: C.gold, color: C.navy,
            border: 'none', padding: '8px 20px',
            borderRadius: 9, fontSize: 12, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
            transition: 'all 0.2s',
          }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* ── Banner global ── */}
      <div style={{
        background: sc.bg, border: `1.5px solid ${sc.border}`,
        borderRadius: 16, padding: '18px 22px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: C.shadow, animation: 'fadeUp 0.4s ease both',
      }}>
        <div style={{ fontSize: 30 }}>{sc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: sc.color }}>{sc.text}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
            {upCount}/{checks.length} services API OK
            {pingMs && ` · Latence totale : ${pingMs}ms`}
            {` · ${deployUp}/${deployments.length} services déployés UP`}
          </div>
        </div>
        {loading && (
          <div style={{ width: 20, height: 20, border: `2px solid ${sc.color}30`, borderTop: `2px solid ${sc.color}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        )}
      </div>

      {/* ── 4 stats quick ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 26 }}>
        {[
          { label: 'Services API',     value: `${upCount}/${checks.length}`,    color: allOk ? C.green : C.red,    icon: '🔌', dim: allOk ? C.greenDim : C.redDim },
          { label: 'Déploiements UP',  value: `${deployUp}/${deployments.length}`, color: C.blue,   icon: '🚀', dim: C.blueDim },
          { label: 'Latence totale',   value: pingMs ? `${pingMs}ms` : '—',     color: C.gold,   icon: '⚡', dim: C.goldDim },
          { label: 'Auto-refresh',     value: autoRefresh ? '30s' : 'OFF',      color: C.purple, icon: '🔄', dim: C.purpleDim },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`,
            padding: '18px 20px', boxShadow: C.shadow,
            display: 'flex', alignItems: 'center', gap: 14,
            animation: `fadeUp 0.4s ease ${i * 70}ms both`,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.dim, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Déploiements ── */}
      <div style={{ marginBottom: 26, animation: 'fadeUp 0.4s ease 300ms both' }}>
        <SectionHead label="Statut des déploiements" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {deployments.map((d, i) => (
            <div key={i} style={{
              background: C.card, borderRadius: 14,
              border: `1.5px solid ${d.status === true ? 'rgba(34,197,94,0.25)' : d.status === false ? 'rgba(239,68,68,0.25)' : C.border}`,
              padding: '18px 20px', boxShadow: C.shadow,
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'all 0.2s',
            }}>
              {/* Service icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: d.color,
                border: `1px solid ${d.color}25`,
              }}>{d.icon}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>
                  {d.service}
                  {d.ms && <span style={{ marginLeft: 6, color: C.gold }}>· {d.ms}ms</span>}
                </div>
                {d.url && (
                  <a href={d.url.replace('/api/health', '')} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: C.blue, textDecoration: 'none', display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.url.replace('/api/health', '')}
                  </a>
                )}
              </div>

              {/* Status */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {deployLoading ? (
                  <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : d.status === true ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusDot ok={true} size={10} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenDim, padding: '2px 9px', borderRadius: 20, border: `1px solid rgba(34,197,94,0.25)` }}>UP</span>
                  </div>
                ) : d.status === false ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusDot ok={false} size={10} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.red, background: C.redDim, padding: '2px 9px', borderRadius: 20, border: `1px solid rgba(239,68,68,0.25)` }}>DOWN</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: C.textMuted }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Liens rapides */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: '▲ Vercel Dashboard', url: 'https://vercel.com/dashboard', color: '#000' },
            { label: '⬡ Render Dashboard', url: 'https://dashboard.render.com', color: '#46E3B7' },
            { label: '🐘 Neon Console',    url: 'https://console.neon.tech',    color: '#00e599' },
            { label: '📊 Grafana',         url: 'https://amenibahri0002.grafana.net', color: '#f5a623' },
          ].map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{
              fontSize: 11.5, fontWeight: 700, color: l.color,
              background: C.card, border: `1.5px solid ${C.border}`,
              padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
              boxShadow: C.shadow, transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none'; }}
            >{l.label}</a>
          ))}
        </div>
      </div>

      {/* ── Checks API ── */}
      <div style={{ marginBottom: 26, animation: 'fadeUp 0.4s ease 380ms both' }}>
        <SectionHead label="Services API internes" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 12, border: `1.5px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skel w={12} h={12} r={6} />
                <div style={{ flex: 1 }}><Skel h={13} w="60%" /><div style={{ marginTop: 5 }}><Skel h={10} w="40%" r={4} /></div></div>
                <Skel w={50} h={22} r={20} />
              </div>
            ))
          ) : checks.map((c, i) => (
            <div key={i} className="dl-check-card" style={{
              background: C.card,
              border: `1.5px solid ${c.status ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
              borderLeft: `4px solid ${c.status ? C.green : C.red}`,
              borderRadius: 12, padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: `fadeUp 0.3s ease ${i * 50}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusDot ok={c.status} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>{c.detail}</div>
                </div>
              </div>
              <span style={{
                padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: c.status ? C.greenDim : C.redDim,
                color: c.status ? C.green : C.red,
                border: `1px solid ${c.status ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                {c.status ? 'UP' : 'DOWN'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── DB Snapshot ── */}
      {stats && (
        <div style={{ marginBottom: 26, animation: 'fadeUp 0.4s ease 460ms both' }}>
          <SectionHead label="Snapshot base de données" />
          <div style={{
            background: C.card, borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            padding: '20px 22px', boxShadow: C.shadow,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[
                { label: 'Campagnes', value: stats.campagnes, color: C.gold,   dim: C.goldDim,   icon: '📢' },
                { label: 'Envoyées',  value: stats.sent,      color: C.green,  dim: C.greenDim,  icon: '✅' },
                { label: 'Contacts',  value: stats.contacts,  color: C.blue,   dim: C.blueDim,   icon: '👥' },
                { label: 'Clients',   value: stats.clients,   color: C.purple, dim: C.purpleDim, icon: '🏢' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.dim, borderRadius: 12,
                  padding: '16px 18px', border: `1px solid ${s.color}20`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Logs ── */}
      {logs.length > 0 && (
        <div style={{ animation: 'fadeUp 0.4s ease 540ms both' }}>
          <SectionHead label="Journal des vérifications" />
          <div style={{
            background: C.navy, borderRadius: 14,
            border: `1.5px solid rgba(245,166,35,0.15)`,
            padding: '16px 20px', boxShadow: C.shadow,
            fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace",
            maxHeight: 200, overflowY: 'auto',
          }}>
            {logs.map((l, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '5px 0',
                borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{l.time}</span>
                <span style={{ fontSize: 11, color: l.ok ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {l.ok ? '●' : '✕'}
                </span>
                <span style={{ fontSize: 11, color: l.ok ? 'rgba(255,255,255,0.7)' : '#f87171' }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
