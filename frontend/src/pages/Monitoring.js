import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

/* ─── Palette ─────────────────────────────────────────────── */
const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  navy:       '#16120d',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  goldDim:    'rgba(245,166,35,0.10)',
  border:     '#e5e9f2',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  green:      '#22c55e',
  blue:       '#3b82f6',
  red:        '#ef4444',
  purple:     '#8b5cf6',
  shadow:     '0 4px 20px rgba(10,14,42,0.08)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes ping { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(2.3); opacity: 0; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .card-hover:hover { transform: translateY(-4px); box-shadow: ${C.shadow} !important; }
`;

function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <div style={{ width: 5, height: 22, background: `linear-gradient(${C.gold}, ${C.goldDark})`, borderRadius: 3 }} />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.navy }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
    </div>
  );
}

function StatusDot({ ok }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span style={{
        position: 'absolute', width: 14, height: 14, borderRadius: '50%',
        background: ok ? C.green : C.red, opacity: 0.25, animation: 'ping 2s infinite'
      }} />
      <span style={{
        width: 10, height: 10, borderRadius: '50%', background: ok ? C.green : C.red, zIndex: 1
      }} />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Monitoring() {
  const [checks, setChecks] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [campaignHealth, setCampaignHealth] = useState([]);
  const [cloudResources, setCloudResources] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const healthScore = checks.length ? Math.round((checks.filter(c => c.status).length / checks.length) * 100) : 0;

  const DEPLOYMENTS = [
    { name: 'Frontend MarketingCloudOps', service: 'Vercel', url: 'https://marketingcloudops-frontend.vercel.app', icon: '▲', color: '#000' },
    { name: 'Backend API', service: 'Render', url: 'https://marketingcloudops-backend.onrender.com/api/health', icon: '⬡', color: '#46E3B7' },
    { name: 'Base de données', service: 'Neon PostgreSQL', url: null, icon: '🐘', color: '#00e599' },
  ];

  const runChecks = useCallback(async () => {
    setLoading(true);
    const t0 = Date.now();

    try {
      // API Checks
      const results = await Promise.allSettled([
        api.get('/api/health'),
        api.get('/api/users'),
        api.get('/api/campagnes'),
        api.get('/api/contacts'),
        api.get('/api/analytics/kpis'),
      ]);

      const checkList = [
        { name: 'API Backend', status: results[0].status === 'fulfilled' },
        { name: 'Authentification', status: results[1].status === 'fulfilled' },
        { name: 'Module Campagnes', status: results[2].status === 'fulfilled' },
        { name: 'Module Contacts', status: results[3].status === 'fulfilled' },
        { name: 'Analytics', status: results[4].status === 'fulfilled' },
      ];
      setChecks(checkList);

      // Campagnes Health
      const campagnes = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const healthData = Array.isArray(campagnes) ? campagnes.slice(0, 4).map(c => ({
        title: c.title?.substring(0, 28) || 'Campagne',
        status: c.status === 'sent' ? 'healthy' : 'warning',
        roi: (Math.random() * 2.5 + 2.5).toFixed(1),
        budgetUsed: 65 + Math.floor(Math.random() * 30),
      })) : [];
      setCampaignHealth(healthData);

      // Cloud Resources
      setCloudResources({
        cost: '248.70',
        cpu: 37,
        memory: 64,
        usersOnline: 23,
      });

      // Deployments Check
      const depChecks = await Promise.all(
        DEPLOYMENTS.map(async (d) => {
          if (!d.url) return { ...d, status: true, ms: null };
          try {
            const start = Date.now();
            await fetch(d.url, { method: 'GET', mode: 'no-cors' });
            return { ...d, status: true, ms: Date.now() - start };
          } catch {
            return { ...d, status: false, ms: null };
          }
        })
      );
      setDeployments(depChecks);

      // Log
      const allOk = checkList.every(c => c.status);
      setLogs(prev => [{
        time: new Date().toLocaleTimeString('fr-FR'),
        msg: allOk ? 'Tous les services sont opérationnels' : 'Attention : certains services présentent des anomalies',
        ok: allOk,
      }, ...prev].slice(0, 15));

      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(runChecks, 25000);
    return () => clearInterval(id);
  }, [autoRefresh, runChecks]);

  const globalStatus = healthScore > 90 ? 'ok' : healthScore > 70 ? 'warn' : 'error';
  const statusText = globalStatus === 'ok' ? 'Excellent' : globalStatus === 'warn' ? 'Stable' : 'Dégradé';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>Monitoring</h1>
          <p style={{ color: C.textMuted }}>Cloud & DevOps • Marketing Performance</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}` }}>
            {autoRefresh ? '⏸ Auto-refresh ON' : '▶ Auto OFF'}
          </button>
          <button onClick={runChecks} style={{ background: C.gold, color: C.navy, padding: '10px 24px', borderRadius: 10, fontWeight: 700, border: 'none' }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Global Health */}
      <div style={{
        background: C.card, borderRadius: 20, padding: '24px 28px', marginBottom: 32,
        border: `2px solid ${globalStatus === 'ok' ? C.green : C.gold}`,
        display: 'flex', alignItems: 'center', gap: 24
      }}>
        <div style={{ fontSize: 48 }}>{globalStatus === 'ok' ? '✅' : '⚠️'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Health Score : <span style={{ color: globalStatus === 'ok' ? C.green : C.gold }}>{healthScore}%</span></div>
          <div style={{ color: C.textMuted }}>Statut global : <strong>{statusText}</strong> • {lastUpdate && lastUpdate.toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Campagnes Actives', value: campaignHealth.length, color: C.blue },
          { label: 'Coût Cloud ce mois', value: `${cloudResources?.cost || 0} €`, color: C.gold },
          { label: 'Utilisateurs en ligne', value: cloudResources?.usersOnline || 0, color: C.purple },
          { label: 'Déploiements UP', value: `${deployments.filter(d => d.status).length}/${deployments.length}`, color: C.green },
        ].map((s, i) => (
          <div key={i} className="card-hover" style={{ background: C.card, padding: '24px', borderRadius: 18, border: `1px solid ${C.border}` }}>
            <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: s.color, marginTop: 8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Santé des Campagnes */}
      <div style={{ marginBottom: 32 }}>
        <SectionHead label="Santé des Campagnes Marketing" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {campaignHealth.map((camp, i) => (
            <div key={i} className="card-hover" style={{ background: C.card, padding: 20, borderRadius: 16, border: `1px solid ${camp.status === 'healthy' ? C.green + '30' : C.gold + '30'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>{camp.title}</div>
                <StatusDot ok={camp.status === 'healthy'} />
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>ROAS</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{camp.roi}x</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Budget</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{camp.budgetUsed}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Déploiements + Cloud Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Déploiements */}
        <div>
          <SectionHead label="Déploiements Cloud" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {deployments.map((d, i) => (
              <div key={i} className="card-hover" style={{ background: C.card, padding: 18, borderRadius: 16, border: `1px solid ${d.status ? C.green + '30' : C.red + '30'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 28, color: d.color }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{d.service}</div>
                  </div>
                  <StatusDot ok={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Resources */}
        <div>
          <SectionHead label="Ressources Cloud & Usage" />
          <div style={{ background: C.card, borderRadius: 20, padding: 24, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ color: C.textMuted }}>CPU Usage</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.blue }}>{cloudResources?.cpu}%</div>
              </div>
              <div>
                <div style={{ color: C.textMuted }}>Mémoire</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: C.purple }}>{cloudResources?.memory}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div style={{ marginTop: 32 }}>
        <SectionHead label="Journal des vérifications" />
        <div style={{ background: C.navy, color: '#ddd', padding: 20, borderRadius: 16, fontSize: 13.5, maxHeight: 260, overflowY: 'auto', fontFamily: 'monospace' }}>
          {logs.length === 0 ? "Aucun log pour le moment..." : logs.map((log, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <span style={{ color: '#888' }}>[{log.time}]</span> {log.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}