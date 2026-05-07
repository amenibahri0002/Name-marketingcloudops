import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

function StatusDot({ ok }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:10, height:10 }}>
      <span style={{
        position:'absolute', width:10, height:10, borderRadius:'50%',
        background: ok ? DP.green : DP.red, opacity:0.3,
        animation:'ping 1.5s ease-in-out infinite'
      }} />
      <span style={{ width:7, height:7, borderRadius:'50%', background: ok ? DP.green : DP.red, position:'relative' }} />
    </span>
  );
}

export default function Monitoring() {
  const [checks,    setChecks]    = useState([]);
  const [stats,     setStats]     = useState(null);
  const [lastPing,  setLastPing]  = useState(null);
  const [pingMs,    setPingMs]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const runChecks = useCallback(async () => {
    const results = [];
    const t0 = Date.now();

    // 1 — API Health
    try {
      await api.get('/api/health');
      results.push({ name:'API Backend', status:true, detail:'Render · Online' });
    } catch {
      results.push({ name:'API Backend', status:false, detail:'Hors ligne' });
    }

    // 2 — Auth endpoint
    try {
      await api.get('/api/users');
      results.push({ name:'Auth / Users', status:true, detail:'JWT valide' });
    } catch(e) {
      const ok = e.response?.status === 401 || e.response?.status === 403;
      results.push({ name:'Auth / Users', status:ok, detail: ok ? 'Protected (401/403)' : 'Erreur inattendue' });
    }

    // 3 — Campagnes
    try {
      await api.get('/api/campagnes');
      results.push({ name:'Module Campagnes', status:true, detail:'Accessible' });
    } catch {
      results.push({ name:'Module Campagnes', status:false, detail:'Erreur' });
    }

    // 4 — Contacts
    try {
      await api.get('/api/contacts');
      results.push({ name:'Module Contacts', status:true, detail:'Accessible' });
    } catch {
      results.push({ name:'Module Contacts', status:false, detail:'Erreur' });
    }

    // 5 — Clients
    try {
      await api.get('/api/clients');
      results.push({ name:'Module Clients', status:true, detail:'Accessible' });
    } catch {
      results.push({ name:'Module Clients', status:false, detail:'Erreur' });
    }

    // 6 — Segments
    try {
      await api.get('/api/segments');
      results.push({ name:'Module Segments', status:true, detail:'Accessible' });
    } catch {
      results.push({ name:'Module Segments', status:false, detail:'Erreur' });
    }

    const ms = Date.now() - t0;
    setPingMs(ms);
    setLastPing(new Date());
    setChecks(results);

    // Stats globales
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
        clients:   cl.data.length,
      });
    } catch { setStats(null); }

    setLoading(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(runChecks, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, runChecks]);

  const allOk   = checks.length > 0 && checks.every(c => c.status);
  const hasDown = checks.some(c => !c.status);

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>
      <style>{`
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>
            État des services en temps réel
            {lastPing && (
              <span style={{ marginLeft:8 }}>
                · Dernière vérif : {lastPing.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setAutoRefresh(a => !a)} style={{
            padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:700,
            cursor:'pointer', fontFamily:DP.font, border:`1px solid ${DP.border}`,
            background: autoRefresh ? DP.goldGlow : DP.card,
            color: autoRefresh ? '#d97706' : DP.muted,
          }}>
            {autoRefresh ? '⏸ Auto ON' : '▶ Auto OFF'}
          </button>
          <button onClick={runChecks} style={{
            background:DP.gold, color:DP.dark, border:'none',
            padding:'9px 18px', borderRadius:9, fontSize:12,
            fontWeight:800, cursor:'pointer', fontFamily:DP.font
          }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Global status banner */}
      <div style={{
        background: allOk ? 'rgba(34,197,94,0.08)' : hasDown ? 'rgba(239,68,68,0.08)' : DP.goldGlow,
        border: `1px solid ${allOk ? 'rgba(34,197,94,0.25)' : hasDown ? 'rgba(239,68,68,0.25)' : 'rgba(245,166,35,0.25)'}`,
        borderRadius:14, padding:'16px 20px', marginBottom:18,
        display:'flex', alignItems:'center', gap:14
      }}>
        <div style={{ fontSize:28 }}>{allOk ? '✅' : hasDown ? '🚨' : '⏳'}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color: allOk ? DP.green : hasDown ? DP.red : '#d97706' }}>
            {loading ? 'Vérification en cours...' : allOk ? 'Tous les services sont opérationnels' : hasDown ? 'Certains services sont hors ligne' : 'Vérification...'}
          </div>
          <div style={{ fontSize:11, color:DP.muted, marginTop:2 }}>
            {checks.filter(c=>c.status).length}/{checks.length} services OK
            {pingMs && ` · Latence totale : ${pingMs}ms`}
          </div>
        </div>
      </div>

      {/* Service checks */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:18 }}>
        {checks.map((c, i) => (
          <div key={i} style={{
            background:DP.card, border:`1px solid ${DP.border}`,
            borderLeft:`3px solid ${c.status ? DP.green : DP.red}`,
            borderRadius:12, padding:'14px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <StatusDot ok={c.status} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:DP.text }}>{c.name}</div>
                <div style={{ fontSize:10, color:DP.muted, marginTop:1 }}>{c.detail}</div>
              </div>
            </div>
            <span style={{
              padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
              background: c.status ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: c.status ? DP.green : DP.red
            }}>
              {c.status ? 'UP' : 'DOWN'}
            </span>
          </div>
        ))}
      </div>

      {/* Stats snapshot */}
      {stats && (
        <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:800, color:DP.text, marginBottom:14 }}>📊 Snapshot base de données</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { label:'Campagnes',  value:stats.campagnes, color:DP.gold,  icon:'📢' },
              { label:'Envoyées',   value:stats.sent,      color:DP.green, icon:'✅' },
              { label:'Contacts',   value:stats.contacts,  color:DP.blue,  icon:'👥' },
              { label:'Clients',    value:stats.clients,   color:'#8b5cf6',icon:'🏢' },
            ].map(s => (
              <div key={s.label} style={{
                background:'#f9f7f3', borderRadius:10, padding:'14px 16px',
                border:`1px solid ${DP.border}`
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px' }}>{s.label}</div>
                  <span style={{ fontSize:14 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize:28, fontWeight:900, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}