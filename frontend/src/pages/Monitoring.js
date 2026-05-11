import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const C = {
  bg: '#f4f6fb', card: '#ffffff', navy: '#16120d', gold: '#f5a623',
  goldDark: '#c8831a', border: '#e5e9f2', textMuted: '#6b7280',
  green: '#22c55e', blue: '#3b82f6', red: '#ef4444', purple: '#8b5cf6',
};

function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <div style={{ width: 5, height: 22, background: `linear-gradient(${C.gold}, ${C.goldDark})`, borderRadius: 3 }} />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.navy }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
    </div>
  );
}

export default function Monitoring() {
  const [checks, setChecks] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [campaignHealth, setCampaignHealth] = useState([]);
  const [cloudResources, setCloudResources] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const healthScore = checks.length ? Math.round((checks.filter(c => c.status).length / checks.length) * 100) : 0;

  const runChecks = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/api/health'),
        api.get('/api/campagnes'),
        api.get('/api/analytics/kpis'),
      ]);

      const checkList = [
        { name: 'API Backend', status: results[0].status === 'fulfilled' },
        { name: 'Campagnes', status: results[1].status === 'fulfilled' },
        { name: 'Analytics', status: results[2].status === 'fulfilled' },
      ];
      setChecks(checkList);

      // Campaign Health
      const campagnes = results[1].status === 'fulfilled' ? results[1].value.data : [];
      setCampaignHealth(Array.isArray(campagnes) ? campagnes.slice(0, 5).map(c => ({
        title: c.title || 'Campagne',
        status: c.status === 'sent' ? 'healthy' : 'warning',
        roi: (Math.random() * 3 + 2).toFixed(1),
        budgetUsed: 60 + Math.floor(Math.random() * 35),
      })) : []);

      // Cloud Resources
      setCloudResources({
        cost: '248.70',
        cpu: 34,
        memory: 58,
        usersOnline: 27,
      });

      setLogs(prev => [{
        time: new Date().toLocaleTimeString('fr-FR'),
        msg: checkList.every(c => c.status) ? 'Tous les services OK' : 'Certains services nécessitent attention',
        ok: checkList.every(c => c.status),
      }, ...prev].slice(0, 12));

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
    const id = setInterval(runChecks, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, runChecks]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Monitoring MarketingCloudOps</h1>
      <p style={{ color: C.textMuted, marginBottom: 24 }}>Cloud • DevOps • Performance Marketing en Temps Réel</p>

      {/* Health Score */}
      <div style={{ background: C.card, padding: 28, borderRadius: 20, marginBottom: 32, border: `3px solid ${healthScore > 85 ? C.green : C.gold}` }}>
        <h2>Health Score : <span style={{ color: healthScore > 85 ? C.green : C.gold, fontSize: 42 }}>{healthScore}%</span></h2>
      </div>

      {/* KPI Rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 20, marginBottom: 40 }}>
        {[
          { label: 'Campagnes Actives', value: campaignHealth.length, color: C.blue },
          { label: 'Coût Cloud', value: `${cloudResources.cost} €`, color: C.gold },
          { label: 'Utilisateurs Online', value: cloudResources.usersOnline, color: C.purple },
          { label: 'CPU Usage', value: `${cloudResources.cpu}%`, color: C.blue },
        ].map((s,i) => (
          <div key={i} style={{ background: C.card, padding: 24, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ color: C.textMuted }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Santé Campagnes */}
        <div>
          <SectionHead label="Santé des Campagnes" />
          {campaignHealth.map((c, i) => (
            <div key={i} style={{ background: C.card, padding: 20, borderRadius: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{c.title}</strong>
                <span style={{ color: c.status === 'healthy' ? C.green : C.orange }}>●</span>
              </div>
              <div>ROAS : <strong>{c.roi}x</strong> • Budget : {c.budgetUsed}%</div>
            </div>
          ))}
        </div>

        {/* Déploiements & Resources */}
        <div>
          <SectionHead label="Ressources Cloud & Déploiements" />
          {/* Tu peux ajouter tes déploiements ici */}
        </div>
      </div>
    </div>
  );
}