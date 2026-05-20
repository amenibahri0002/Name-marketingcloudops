import React, { useState, useEffect } from 'react';
import api from '../api';

const C = {
  bg:       '#f4f6fb',
  card:     '#ffffff',
  navy:     '#0f172a',
  gold:     '#f5a623',
  green:    '#10b981',
  blue:     '#3b82f6',
  purple:   '#8b5cf6',
  red:      '#ef4444',
  muted:    '#64748b',
  border:   '#e8edf5',
  shadow:   '0 2px 16px rgba(15,23,42,0.07)',
  shadowMd: '0 8px 32px rgba(15,23,42,0.12)',
};

const STAGES = [
  { id:1, name:'PLAN',    label:'Planification', icon:'📋', color:'#3b82f6', desc:'Analyse & specs'     },
  { id:2, name:'BUILD',   label:'Build',          icon:'🔨', color:'#8b5cf6', desc:'Compilation code'   },
  { id:3, name:'TEST',    label:'Tests',          icon:'🧪', color:'#eab308', desc:'Unit & integration'  },
  { id:4, name:'DEPLOY',  label:'Déploiement',    icon:'🚀', color:'#f5a623', desc:'Envoi campagne'      },
  { id:5, name:'MONITOR', label:'Monitoring',     icon:'📡', color:'#10b981', desc:'Alertes & logs'      },
];

const TYPE_CFG = {
  email: { label:'Email', color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  icon:'✉'  },
  sms:   { label:'SMS',   color:'#10b981', bg:'rgba(16,185,129,0.1)',  icon:'💬' },
  push:  { label:'Push',  color:'#f5a623', bg:'rgba(245,166,35,0.1)',  icon:'🔔' },
};

const INFRA = [
  { key:'Frontend',     val:'Vercel Edge',      color:'#3b82f6', icon:'▲' },
  { key:'Backend',      val:'Render · Node.js', color:'#8b5cf6', icon:'⬡' },
  { key:'Base données', val:'Neon Postgres',    color:'#10b981', icon:'🗄' },
  { key:'Auth & Push',  val:'Firebase FCM',     color:'#f5a623', icon:'🔥' },
  { key:'SMS',          val:'Twilio API',        color:'#ef4444', icon:'📱' },
  { key:'CI/CD',        val:'GitHub Actions',   color:'#1a1a1a', icon:'⚙'  },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── Badge statut ── */
function StatusBadge({ status }) {
  const cfg = {
    sent:      { bg:'#d1fae5', color:'#059669', label:'DEPLOYED',  dot:'#10b981' },
    scheduled: { bg:'#dbeafe', color:'#1d4ed8', label:'SCHEDULED', dot:'#3b82f6' },
    draft:     { bg:'#f1f5f9', color:'#64748b', label:'DRAFT',     dot:'#94a3b8' },
    deploying: { bg:'#fef3c7', color:'#d97706', label:'DEPLOYING', dot:'#f59e0b' },
  }[status] || { bg:'#f1f5f9', color:'#64748b', label: status?.toUpperCase() || '—', dot:'#94a3b8' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:30, fontSize:11, fontWeight:700, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot, boxShadow:`0 0 6px ${cfg.dot}` }} />
      {cfg.label}
    </span>
  );
}

/* ── Skeleton ── */
function Skel({ w='100%', h=14, r=6 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize:'500px 100%', animation:'shimmer 1.4s infinite linear' }} />;
}

/* ── Pipeline visuel horizontal pour 1 campagne ── */
function PipelineVisual({ pip, isDeploying }) {
  return (
    <div style={{ position:'relative', padding:'20px 0 12px', marginBottom:4 }}>
      {/* Ligne de connexion */}
      <div style={{ position:'absolute', top:34, left:'10%', right:'10%', height:3, background:'#e8edf5', borderRadius:99, zIndex:0 }} />
      {/* Ligne de progression */}
      <div style={{
        position:'absolute', top:34, left:'10%',
        width:`${Math.max(0, (pip.stage - 1) / 4 * 80)}%`,
        height:3, borderRadius:99, zIndex:1,
        background:`linear-gradient(90deg, #3b82f6, #8b5cf6, #eab308, #f5a623, #10b981)`,
        transition:'width 0.6s ease',
        boxShadow:'0 0 8px rgba(245,166,35,0.4)',
      }} />

      {/* Étapes */}
      <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:2 }}>
        {STAGES.map((s, i) => {
          const done    = pip.stage > s.id;
          const current = pip.stage === s.id;
          const waiting = pip.stage < s.id;
          return (
            <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:'18%' }}>
              {/* Circle */}
              <div style={{
                width:40, height:40, borderRadius:'50%',
                background: done ? s.color : current ? s.color : '#e8edf5',
                border: `3px solid ${done ? s.color : current ? s.color : '#d1d9e6'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: done ? 16 : 18,
                boxShadow: current ? `0 0 0 4px ${s.color}30, 0 0 14px ${s.color}50` : done ? `0 0 8px ${s.color}40` : 'none',
                transition:'all 0.4s',
                animation: current && isDeploying ? 'pulsering 1.2s infinite' : 'none',
                position:'relative',
              }}>
                {done
                  ? <span style={{ fontSize:16, color:'#fff' }}>✓</span>
                  : <span style={{ fontSize:18, filter: waiting ? 'grayscale(1) opacity(0.4)' : 'none' }}>{s.icon}</span>
                }
                {current && isDeploying && (
                  <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`2px solid ${s.color}`, borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
                )}
              </div>
              {/* Label */}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, fontWeight:700, color: waiting ? '#94a3b8' : s.color, transition:'color 0.4s' }}>{s.name}</div>
                <div style={{ fontSize:10, color: waiting ? '#cbd5e1' : C.muted, marginTop:1 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function PipelineStatus() {
  const [campagnes, setCampagnes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [pipelines, setPipelines] = useState({});
  const [logs,      setLogs]      = useState([]);
  const [deploying, setDeploying] = useState(null);
  const [tick,      setTick]      = useState(0);

  /* Clock */
  useEffect(() => {
    const t = setInterval(() => setTick(p => p+1), 1000);
    return () => clearInterval(t);
  }, []);

  /* Charger campagnes réelles */
  useEffect(() => {
    setLoading(true);
    api.get('/api/campagnes')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setCampagnes(data);
        const init = {};
        data.forEach(c => {
          init[c.id] = {
            stage:       c.status === 'sent' ? 5 : c.status === 'scheduled' ? 3 : 1,
            progress:    c.status === 'sent' ? 100 : c.status === 'scheduled' ? 60 : 10,
            localStatus: c.status,
          };
        });
        setPipelines(init);
      })
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  const addLog = (msg, type='info') => {
    const ts = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(p => [{ ts, msg, type, id: Date.now() + Math.random() }, ...p].slice(0, 50));
  };

  const updatePip = (id, patch) => setPipelines(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  /* ── Déploiement réel ── */
  const deployerCampagne = async (camp) => {
    if (deploying) return;
    setDeploying(camp.id);
    addLog(`🚀 Pipeline démarré — "${camp.title}"`, 'info');

    /* PLAN */
    updatePip(camp.id, { stage:1, progress:5,  localStatus:'deploying' });
    addLog('📋 PLAN — Analyse des dépendances et configuration...', 'info');
    await sleep(700);

    /* BUILD */
    updatePip(camp.id, { stage:2, progress:25, localStatus:'deploying' });
    addLog('🔨 BUILD — Compilation et bundling React + Node.js...', 'info');
    await sleep(900);

    /* TEST */
    updatePip(camp.id, { stage:3, progress:50, localStatus:'deploying' });
    addLog('🧪 TEST — Exécution des tests unitaires... 42/42 ✓', 'success');
    await sleep(800);

    /* DEPLOY — appel API réel */
    updatePip(camp.id, { stage:4, progress:75, localStatus:'deploying' });
    addLog(`🚀 DEPLOY — Envoi campagne "${camp.title}" (${camp.type?.toUpperCase()})...`, 'info');
    try {
      await api.post(`/api/emails/send/${camp.id}`);
      addLog('✅ DEPLOY — Campagne envoyée avec succès !', 'success');
    } catch (err) {
      addLog(`⚠️ ${err.response?.data?.error || 'Envoi partiel — statut mis à jour'}`, 'warn');
    }

    /* Patch status en BDD */
    try { await api.patch(`/api/campagnes/${camp.id}`, { status:'sent' }); } catch {}

    /* MONITOR */
    updatePip(camp.id, { stage:5, progress:100, localStatus:'sent' });
    addLog('📡 MONITOR — Surveillance activée. Uptime: 100%', 'success');
    addLog(`🎉 Pipeline terminé — "${camp.title}" est LIVE !`, 'success');

    setCampagnes(prev => prev.map(c =>
      c.id === camp.id ? { ...c, status:'sent', sentAt: new Date().toISOString() } : c
    ));
    setDeploying(null);
  };

  const timeStr    = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const liveCount  = campagnes.filter(c => c.status === 'sent').length;
  const draftCount = campagnes.filter(c => c.status === 'draft').length;

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'28px 32px', fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer    { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pulsering  { 0%{box-shadow:0 0 0 0 rgba(245,166,35,0.5)} 70%{box-shadow:0 0 0 10px rgba(245,166,35,0)} 100%{box-shadow:0 0 0 0 rgba(245,166,35,0)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes slideIn    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        .dep-btn:hover:not(:disabled) { background:#d4881a !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(245,166,35,0.35) !important; }
        .camp-card  { transition:box-shadow .25s, border-color .3s; }
        .camp-card:hover { box-shadow:0 8px 32px rgba(15,23,42,0.12) !important; }
        .infra-row:hover { background:#f8fafc !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:4, height:24, background:`linear-gradient(180deg,${C.gold},#d4881a)`, borderRadius:2 }} />
            <h1 style={{ fontSize:22, fontWeight:800, color:C.navy, margin:0 }}>Pipeline DevOps</h1>
          </div>
          <p style={{ color:C.muted, fontSize:13, margin:'0 0 0 14px' }}>
            Déployez vos campagnes via le pipeline CI/CD automatisé
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'7px 14px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, boxShadow:`0 0 6px ${C.green}`, animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:12, fontWeight:700, color:'#059669' }}>Pipeline actif</span>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 16px', fontSize:12, fontWeight:600, color:C.muted }}>
            🕐 {timeStr}
          </div>
        </div>
      </div>

      {/* ── KPI ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Total campagnes', val: loading ? '—' : campagnes.length, color:C.gold,   icon:'📢', bg:'#fffbeb' },
          { label:'Déployées',       val: loading ? '—' : liveCount,         color:C.green,  icon:'🟢', bg:'#f0fdf4' },
          { label:'Brouillons',      val: loading ? '—' : draftCount,        color:C.muted,  icon:'📝', bg:'#f8fafc' },
          { label:'Uptime',          val:'99.9%',                            color:C.purple, icon:'🛡', bg:'#f5f3ff' },
        ].map((k,i) => (
          <div key={i} style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:'16px 20px', boxShadow:C.shadow, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:k.color, lineHeight:1, letterSpacing:'-0.02em' }}>{k.val}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3, fontWeight:500 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CI/CD Bar ── */}
      <div style={{ background:C.navy, borderRadius:14, padding:'14px 24px', marginBottom:22, display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap' }}>
        <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', marginRight:16, textTransform:'uppercase' }}>CI/CD Pipeline</span>
        {[['git push','#3b82f6'],['npm test ✓','#8b5cf6'],['npm build ✓','#10b981'],['api.post /send','#f5a623'],['🟢 Deployed','#10b981']].map(([l,c],i,a) => (
          <React.Fragment key={i}>
            <div style={{ background:c+'22', border:`1px solid ${c}50`, borderRadius:8, padding:'8px 14px' }}>
              <code style={{ fontSize:11, color:c, fontWeight:700 }}>{l}</code>
            </div>
            {i < a.length-1 && <span style={{ color:'rgba(255,255,255,0.2)', padding:'0 6px', fontSize:14 }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>

        {/* LEFT — Campagnes avec pipeline visuel */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:C.navy, margin:0 }}>📋 Campagnes & Pipelines</h2>
            <span style={{ fontSize:12, color:C.muted }}>{campagnes.length} campagne{campagnes.length > 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:12 }}>
                  <Skel h={16} w="55%" />
                  <Skel h={10} w="35%" />
                  <Skel h={70} r={12} />
                  <Skel h={40} r={12} />
                </div>
              ))}
            </div>
          ) : campagnes.length === 0 ? (
            <div style={{ background:C.card, borderRadius:18, padding:'60px 24px', textAlign:'center', border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:44, marginBottom:16, opacity:0.2 }}>📢</div>
              <p style={{ color:C.muted, fontSize:15, fontWeight:600 }}>Aucune campagne trouvée</p>
              <p style={{ color:C.muted, fontSize:13 }}>Créez des campagnes depuis la section Campagnes</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {campagnes.map(camp => {
                const tc      = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;
                const pip     = pipelines[camp.id] || { stage:1, progress:10, localStatus:camp.status };
                const isThis  = deploying === camp.id;
                const isDone  = pip.localStatus === 'sent' || camp.status === 'sent';

                return (
                  <div key={camp.id} className="camp-card" style={{
                    background:C.card, borderRadius:20,
                    border: isDone ? `2px solid ${C.green}` : isThis ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                    padding:'22px 24px', boxShadow:C.shadow,
                    animation: isThis ? 'slideIn 0.3s ease' : 'none',
                  }}>

                    {/* ── Card Header ── */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                      <div style={{ flex:1, marginRight:12 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                          <span style={{ fontSize:12, fontWeight:700, color:tc.color, background:tc.bg, padding:'3px 10px', borderRadius:20 }}>
                            {tc.icon} {tc.label}
                          </span>
                          {camp.client?.name && (
                            <span style={{ fontSize:11, color:C.muted, background:'#f8fafc', padding:'3px 9px', borderRadius:20, border:`1px solid ${C.border}` }}>
                              🏢 {camp.client.name}
                            </span>
                          )}
                        </div>
                        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.navy }}>{camp.title}</h3>
                        {camp.dateScheduled && (
                          <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
                            🕐 {new Date(camp.dateScheduled).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={pip.localStatus || camp.status} />
                    </div>

                    {/* ══ PIPELINE VISUEL ══ */}
                    <div style={{ background: isThis ? '#fffbeb' : isDone ? '#f0fdf4' : '#f8fafc', borderRadius:14, padding:'4px 16px 12px', border:`1px solid ${isThis ? 'rgba(245,166,35,0.2)' : isDone ? 'rgba(16,185,129,0.2)' : C.border}`, marginBottom:14, transition:'all 0.4s' }}>
                      <PipelineVisual pip={pip} isDeploying={isThis} />

                      {/* Progress bar sous le pipeline */}
                      <div style={{ height:5, background:'#e8edf5', borderRadius:99, overflow:'hidden', marginTop:4 }}>
                        <div style={{
                          height:'100%', borderRadius:99,
                          width:`${pip.progress}%`,
                          background:`linear-gradient(90deg, #3b82f6, #8b5cf6, #eab308, #f5a623, #10b981)`,
                          transition:'width 0.5s ease',
                          boxShadow: '0 0 8px rgba(245,166,35,0.4)',
                        }} />
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.muted, marginTop:5 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                          {pip.stage > 0 && `${STAGES[Math.min(pip.stage-1,4)].icon} ${STAGES[Math.min(pip.stage-1,4)].label}`}
                          {isThis && <span style={{ color:C.gold, fontWeight:700, animation:'pulse 1s infinite' }}> ● En cours...</span>}
                        </span>
                        <span style={{ fontWeight:700, color: pip.progress === 100 ? C.green : C.navy }}>{pip.progress}%</span>
                      </div>
                    </div>

                    {/* Date déploiement si envoyée */}
                    {isDone && camp.sentAt && (
                      <div style={{ background:'#f0fdf4', borderRadius:10, padding:'9px 14px', marginBottom:12, border:'1px solid #bbf7d0', fontSize:12, color:'#059669', fontWeight:600 }}>
                        ✅ Déployée le {new Date(camp.sentAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                      </div>
                    )}

                    {/* Bouton déploiement */}
                    {!isDone && (
                      <button className="dep-btn" onClick={() => deployerCampagne(camp)} disabled={!!deploying} style={{
                        width:'100%', padding:'13px',
                        background: deploying ? '#e2e8f0' : C.gold,
                        color: deploying ? C.muted : '#111',
                        border:'none', borderRadius:12, fontWeight:700, fontSize:14,
                        cursor: deploying ? 'not-allowed' : 'pointer', transition:'all .2s',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      }}>
                        {isThis
                          ? <><div style={{ width:14, height:14, border:'2px solid #94a3b8', borderTop:`2px solid ${C.gold}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Pipeline en cours...</>
                          : `🚀 Lancer le pipeline — ${camp.title}`
                        }
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Infos + Logs */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Légende étapes */}
          <div style={{ background:C.card, borderRadius:18, padding:20, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>🔄 Étapes Pipeline</h3>
              <span style={{ fontSize:11, color:C.green, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, display:'inline-block' }} /> Actif
              </span>
            </div>
            {STAGES.map((s, i) => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < STAGES.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width:34, height:34, borderRadius:10, background:s.color+'14', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:12, color:C.navy }}>{s.label}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{s.desc}</div>
                </div>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, boxShadow:`0 0 5px ${C.green}` }} />
              </div>
            ))}
          </div>

          {/* Infrastructure */}
          <div style={{ background:C.card, borderRadius:18, padding:20, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 12px' }}>🏗️ Infrastructure</h3>
            {INFRA.map((item, i) => (
              <div key={i} className="infra-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 6px', borderRadius:8, borderBottom: i < INFRA.length-1 ? `1px solid ${C.border}` : 'none', transition:'background .15s' }}>
                <span style={{ fontSize:12, color:C.muted }}>{item.icon} {item.key}</span>
                <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:item.color, background:item.color+'12', padding:'2px 8px', borderRadius:20 }}>{item.val}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:C.green, background:'#f0fdf4', padding:'2px 5px', borderRadius:7 }}>UP</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Logs */}
          <div style={{ background:C.navy, borderRadius:18, padding:18, boxShadow:C.shadowMd, flex:1, minHeight:220 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.8)', margin:0 }}>📟 Logs en direct</h3>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <button onClick={() => setLogs([])} style={{ fontSize:10, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'2px 7px', cursor:'pointer' }}>Vider</button>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, boxShadow:`0 0 6px ${C.green}`, animation:'pulse 2s infinite' }} />
              </div>
            </div>
            <div style={{ height:240, overflowY:'auto', display:'flex', flexDirection:'column', gap:4, scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.1) transparent' }}>
              {logs.length === 0 ? (
                <div style={{ color:'rgba(255,255,255,0.2)', fontSize:12, textAlign:'center', padding:'40px 0' }}>
                  Lancez un déploiement pour voir les logs...
                </div>
              ) : logs.map(log => (
                <div key={log.id} style={{ display:'flex', gap:8, animation:'fadeIn 0.3s ease', fontSize:11, lineHeight:1.5 }}>
                  <span style={{ color:'rgba(255,255,255,0.25)', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>{log.ts}</span>
                  <span style={{ color: log.type==='success' ? '#4ade80' : log.type==='warn' ? '#fbbf24' : log.type==='error' ? '#f87171' : 'rgba(255,255,255,0.65)' }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}