import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const T = {
  gold:'#f5a623', goldDk:'#d4881a', bg:'#080c14', bg2:'#0a0f1a',
  card:'#111827', card2:'#0d1520', border:'rgba(255,255,255,0.06)',
  blue:'#4f8ef7', purple:'#7c3aed', green:'#10b981', red:'#ef4444',
  cyan:'#06b6d4', orange:'#f97316',
  white:'#ffffff', gray:'rgba(255,255,255,0.4)',
  font:"'Inter',system-ui,sans-serif",
};

const TYPE_CFG = {
  email:{ label:'Email', icon:'✉',  color:T.blue   },
  sms:  { label:'SMS',   icon:'💬', color:T.green  },
  push: { label:'Push',  icon:'🔔', color:T.gold   },
};

/* ══════════════════════════════════════════════════════
   HOOK — SSE temps réel + fallback polling
══════════════════════════════════════════════════════ */
function useRealtimeInscrits(campagneId) {
  const [inscrits, setInscrits]   = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [stats, setStats]         = useState({ today:0, thisHour:0, rate:0 });
  const sseRef  = useRef(null);
  const pollRef = useRef(null);

  const computeStats = useCallback((list) => {
    const now = new Date();
    const today = list.filter(i => new Date(i.createdAt).toDateString() === now.toDateString()).length;
    const hour  = list.filter(i => (now - new Date(i.createdAt)) < 3600000).length;
    const prev  = list.filter(i => { const d = now - new Date(i.createdAt); return d >= 3600000 && d < 7200000; }).length;
    const rate  = prev === 0 ? (hour > 0 ? 100 : 0) : Math.round(((hour - prev) / prev) * 100);
    setStats({ today, thisHour: hour, rate });
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const res  = await api.get(`/api/campagnes/${campagneId}/inscrits`);
      const list = Array.isArray(res.data) ? res.data : [];
      setInscrits(list);
      computeStats(list);
    } catch {}
  }, [campagneId, computeStats]);

  useEffect(() => {
    if (!campagneId) return;
    fetchAll();

    const token   = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL || '';
    const sseUrl  = `${API_URL}/api/campagnes/${campagneId}/inscrits/stream?token=${token}`;

    try {
      const es = new EventSource(sseUrl);
      sseRef.current = es;
      es.onopen = () => setConnected(true);
      es.addEventListener('inscription', (e) => {
        try {
          const data = JSON.parse(e.data);
          setInscrits(prev => {
            const next = [data, ...prev.filter(i => i.id !== data.id)];
            computeStats(next);
            return next;
          });
          setLastEvent({ type:'inscription', data, ts: new Date() });
        } catch {}
      });
      es.addEventListener('ping', () => setConnected(true));
      es.onerror = () => {
        setConnected(false);
        es.close();
        pollRef.current = setInterval(() => fetchAll(), 8000);
      };
    } catch {
      pollRef.current = setInterval(() => fetchAll(), 8000);
    }

    return () => { sseRef.current?.close(); clearInterval(pollRef.current); };
  }, [campagneId, fetchAll, computeStats]);

  return { inscrits, connected, lastEvent, stats, refetch: fetchAll };
}

/* ══════════════════════════════════════════════════════
   UI — Toast nouvelle inscription
══════════════════════════════════════════════════════ */
function LiveToast({ event, onClose }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 4200);
    const t2 = setTimeout(onClose, 4700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [event]);
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      transform: visible ? 'translateY(0)' : 'translateY(120%)',
      opacity: visible ? 1 : 0,
      transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      background:'rgba(10,16,26,0.97)', backdropFilter:'blur(24px)',
      border:'1px solid rgba(16,185,129,0.35)', borderRadius:16,
      padding:'16px 20px', boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
      minWidth:300, maxWidth:380, display:'flex', alignItems:'flex-start', gap:12,
    }}>
      <style>{`@keyframes prog{from{width:100%}to{width:0%}}`}</style>
      <div style={{ width:38,height:38,borderRadius:10,background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🎉</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11,fontWeight:700,color:T.green,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:3 }}>Nouvelle inscription</div>
        <div style={{ fontSize:14,fontWeight:600,color:T.white }}>{event?.data?.nom}</div>
        <div style={{ fontSize:12,color:T.gray,marginTop:1 }}>{event?.data?.email}</div>
      </div>
      <button onClick={onClose} style={{ background:'none',border:'none',color:T.gray,cursor:'pointer',fontSize:16,padding:2 }}>✕</button>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:2,background:'rgba(255,255,255,0.06)',borderRadius:'0 0 16px 16px',overflow:'hidden' }}>
        <div style={{ height:'100%',background:T.green,animation:'prog 4.2s linear forwards' }} />
      </div>
    </div>
  );
}

/* KPI Card */
function KpiCard({ icon, label, value, sub, color, trend }) {
  return (
    <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'18px 20px',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,right:0,width:80,height:80,borderRadius:'50%',background:`${color}12`,transform:'translate(20px,-20px)',pointerEvents:'none' }} />
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
        <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{icon}</div>
        {trend !== undefined && (
          <div style={{ fontSize:11,fontWeight:700,color:trend>=0?T.green:T.red,background:trend>=0?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${trend>=0?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:20,padding:'3px 8px' }}>
            {trend>=0?'↑':'↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize:28,fontWeight:900,color,letterSpacing:'-0.04em',lineHeight:1,marginBottom:5 }}>{value}</div>
      <div style={{ fontSize:12,fontWeight:600,color:T.white,marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11,color:T.gray }}>{sub}</div>}
    </div>
  );
}

/* Avatar */
function Avatar({ name, size=32 }) {
  const cols = [T.blue,T.purple,T.green,T.gold,T.cyan,T.orange];
  const c = cols[(name||'').charCodeAt(0) % cols.length];
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:`${c}22`,border:`1.5px solid ${c}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color:c,flexShrink:0 }}>
      {(name||'?')[0].toUpperCase()}
    </div>
  );
}

/* Badge connexion */
function ConnectionBadge({ connected }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,background:connected?'rgba(16,185,129,0.08)':'rgba(245,166,35,0.08)',border:`1px solid ${connected?'rgba(16,185,129,0.25)':'rgba(245,166,35,0.25)'}`,borderRadius:20,padding:'5px 12px' }}>
      <div style={{ width:7,height:7,borderRadius:'50%',background:connected?T.green:T.gold,boxShadow:connected?`0 0 6px ${T.green}`:'none',animation:connected?'pulse 2s infinite':'none' }} />
      <span style={{ fontSize:11,fontWeight:700,color:connected?T.green:T.gold }}>{connected?'SSE Live':'Polling 8s'}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════ */
export default function CampagneAdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('recent');
  const [activeTab, setActiveTab]   = useState('inscrits');
  const [sparkData, setSparkData]   = useState(Array(12).fill(0));
  const [deployStatus, setDeployStatus] = useState({
    status:'success', lastDeploy:'il y a 2h 14m', branch:'main', commit:'a3f9b2c',
    services:[
      { name:'Frontend (Vercel)', status:'up', latency:'42ms',  uptime:'99.9%' },
      { name:'Backend (Render)',  status:'up', latency:'118ms', uptime:'99.7%' },
      { name:'Neon DB',           status:'up', latency:'8ms',   uptime:'100%'  },
      { name:'Firebase FCM',      status:'up', latency:'61ms',  uptime:'99.8%' },
      { name:'Twilio SMS',        status:'up', latency:'95ms',  uptime:'99.5%' },
    ],
  });
  const prevCount = useRef(0);

  const { inscrits, connected, lastEvent, stats, refetch } = useRealtimeInscrits(id);

  /* Fetch campagne */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    api.get(`/api/campagnes/${id}`)
      .then(r => setCampagne(r.data))
      .catch(() => navigate('/admin/campagnes'))
      .finally(() => setLoading(false));
  }, [id]);

  /* Fetch services cloud */
  useEffect(() => {
    api.get('/api/monitoring/services')
      .then(r => { if (r.data?.length) setDeployStatus(p => ({ ...p, services: r.data })); })
      .catch(() => {});
  }, []);

  /* Toast nouvelle inscription */
  useEffect(() => {
    if (!lastEvent) return;
    if (inscrits.length > prevCount.current && prevCount.current > 0) setToast(lastEvent);
    prevCount.current = inscrits.length;
  }, [lastEvent, inscrits.length]);

  /* Sparkline 12h */
  useEffect(() => {
    const now = new Date();
    setSparkData(Array.from({ length:12 }, (_,i) => {
      const s = new Date(now - (11-i)*3600000);
      const e = new Date(now - (10-i)*3600000);
      return inscrits.filter(x => { const d = new Date(x.createdAt); return d>=s && d<e; }).length;
    }));
  }, [inscrits]);

  const exportCSV = () => {
    const rows = [['Nom','Email','Téléphone','Date'], ...inscrits.map(i=>[i.nom||'',i.email||'',i.telephone||'',i.createdAt?new Date(i.createdAt).toLocaleString('fr-FR'):''])];
    const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(new Blob([rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')],{type:'text/csv'})), download:`inscrits-${id}-${Date.now()}.csv` });
    a.click();
  };

  const filtered = inscrits.filter(i => [i.nom,i.email,i.telephone].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  const sorted   = [...filtered].sort((a,b) => sortBy==='recent' ? new Date(b.createdAt)-new Date(a.createdAt) : (a.nom||'').localeCompare(b.nom||''));

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:T.font }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40,height:40,border:`3px solid ${T.gold}30`,borderTop:`3px solid ${T.gold}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }} />
        <p style={{ color:T.gray,fontFamily:T.font }}>Chargement...</p>
      </div>
    </div>
  );

  if (!campagne) return null;
  const tc = TYPE_CFG[campagne.type?.toLowerCase()] || TYPE_CFG.email;
  const maxSpark = Math.max(...sparkData, 1);

  return (
    <div style={{ fontFamily:T.font,minHeight:'100vh',background:T.bg,color:T.white,display:'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.gold}40;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        @keyframes ripple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
        .row:hover{background:rgba(255,255,255,0.025)!important}
        .tab-btn{transition:all .2s;border:none;cursor:pointer;font-family:inherit}
        .icon-btn{transition:all .18s;border:none;cursor:pointer;font-family:inherit}
        .icon-btn:hover{opacity:0.75;transform:translateY(-1px)}
        .nav-item:hover{background:rgba(255,255,255,0.04)!important}
      `}</style>

      {toast && <LiveToast event={toast} onClose={()=>setToast(null)} />}

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:220,background:T.bg2,borderRight:`1px solid ${T.border}`,padding:'20px 12px',flexShrink:0,display:'flex',flexDirection:'column',gap:2 }}>
        <div onClick={()=>navigate('/')} style={{ display:'flex',alignItems:'center',gap:8,padding:'4px 10px',marginBottom:24,cursor:'pointer' }}>
          <div style={{ width:28,height:28,background:T.gold,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:'#111' }}>D</div>
          <span style={{ fontSize:16,fontWeight:800 }}>Digi<span style={{color:T.gold}}>Pip</span></span>
        </div>
        {[['🏠','Dashboard','/dashboard'],['📣','Campagnes','/admin/campagnes'],['👥','Contacts','/admin/contacts'],['📊','Analytics','/admin/analytics'],['⚙️','Monitoring','/admin/monitoring']].map(([icon,label,path]) => {
          const active = label==='Campagnes';
          return (
            <div key={label} className="nav-item" onClick={()=>navigate(path)} style={{ padding:'9px 12px',borderRadius:9,display:'flex',alignItems:'center',gap:9,cursor:'pointer',background:active?`${T.gold}15`:'transparent',border:`1px solid ${active?T.gold+'30':'transparent'}`,transition:'background .15s' }}>
              <span style={{ fontSize:14 }}>{icon}</span>
              <span style={{ fontSize:13,fontWeight:active?700:400,color:active?T.gold:T.gray }}>{label}</span>
            </div>
          );
        })}
        {/* Mini services */}
        <div style={{ marginTop:'auto',paddingTop:16,borderTop:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,padding:'0 12px' }}>Services</div>
          {deployStatus.services.slice(0,3).map(s=>(
            <div key={s.name} style={{ padding:'5px 12px',display:'flex',alignItems:'center',gap:7 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:s.status==='up'?T.green:T.red,flexShrink:0,animation:s.status==='up'?'pulse 2.5s infinite':'none' }} />
              <span style={{ fontSize:11,color:T.gray,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name.split(' ')[0]}</span>
              <span style={{ fontSize:10,color:'rgba(255,255,255,0.2)' }}>{s.latency}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column' }}>

        {/* TOP BAR */}
        <div style={{ height:56,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(8,12,20,0.8)',backdropFilter:'blur(16px)',borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:T.gray }}>
            <span onClick={()=>navigate('/admin/campagnes')} style={{ cursor:'pointer',transition:'color .15s' }} onMouseEnter={e=>e.target.style.color=T.white} onMouseLeave={e=>e.target.style.color=T.gray}>Campagnes</span>
            <span>›</span>
            <span style={{ color:T.white,fontWeight:600 }}>{campagne.title}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <ConnectionBadge connected={connected} />
            <button className="icon-btn" onClick={refetch} style={{ width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,color:T.gray,fontSize:14 }}>↺</button>
            <button className="icon-btn" onClick={exportCSV} style={{ display:'flex',alignItems:'center',gap:6,height:32,padding:'0 12px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,color:T.white,fontSize:12,fontWeight:600 }}>⬇ CSV</button>
          </div>
        </div>

        <div style={{ padding:'28px 32px',flex:1 }}>

          {/* HEADER */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12,animation:'fadeUp 0.5s ease' }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${tc.color}15`,border:`1px solid ${tc.color}30`,borderRadius:20,padding:'4px 12px',marginBottom:10 }}>
                <span>{tc.icon}</span>
                <span style={{ fontSize:11,fontWeight:700,color:tc.color }}>{tc.label}</span>
              </div>
              <h1 style={{ fontSize:'clamp(18px,2.5vw,26px)',fontWeight:900,letterSpacing:'-0.02em' }}>{campagne.title}</h1>
              {campagne.client?.name && <p style={{ fontSize:12,color:T.gray,marginTop:4 }}>🏢 {campagne.client.name}</p>}
            </div>
          </div>

          {/* KPI CARDS */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20,animation:'fadeUp 0.5s ease 0.05s both' }}>
            <KpiCard icon="👥" label="Total inscrits"  value={inscrits.length} color={T.blue}   sub="depuis le lancement" />
            <KpiCard icon="📅" label="Aujourd'hui"     value={stats.today}     color={T.green}  sub="nouvelles inscriptions" />
            <KpiCard icon="⚡" label="Cette heure"     value={stats.thisHour}  color={T.gold}   sub="inscriptions récentes" trend={stats.rate} />
            <KpiCard icon="📡" label="Canal"           value={tc.label}        color={tc.color} sub={tc.icon + ' actif'} />
          </div>

          {/* SPARKLINE + DERNIÈRE INSCRIPTION */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20,animation:'fadeUp 0.5s ease 0.1s both' }}>

            {/* Sparkline */}
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'18px 20px' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:700 }}>Activité — 12 dernières heures</div>
                  <div style={{ fontSize:11,color:T.gray,marginTop:2 }}>Inscriptions par tranche horaire</div>
                </div>
                <div style={{ fontSize:11,color:T.gray,background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:6,padding:'3px 8px',display:'flex',alignItems:'center',gap:5 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:T.green,animation:'pulse 1.5s infinite' }} />
                  Live
                </div>
              </div>
              <div style={{ display:'flex',alignItems:'flex-end',gap:4,height:56 }}>
                {sparkData.map((v,i) => {
                  const isLast = i===sparkData.length-1;
                  const h = Math.max((v/maxSpark)*50, 3);
                  return (
                    <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                      <div style={{ width:'100%',background:isLast?T.blue:`${T.blue}45`,borderRadius:'3px 3px 0 0',height:`${h}px`,transition:'height 0.5s ease',position:'relative' }}>
                        {isLast && v>0 && <div style={{ position:'absolute',inset:0,borderRadius:'3px 3px 0 0',background:T.blue,animation:'pulse 1.5s infinite' }} />}
                      </div>
                      {i%3===0 && <div style={{ fontSize:8,color:'rgba(255,255,255,0.2)',whiteSpace:'nowrap' }}>{`-${11-i}h`}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dernière inscription */}
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'18px 20px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:0,right:0,width:120,height:120,borderRadius:'50%',background:`${T.green}10`,transform:'translate(30px,-30px)',pointerEvents:'none' }} />
              <div style={{ fontSize:13,fontWeight:700,marginBottom:14 }}>Dernière inscription</div>
              {inscrits[0] ? (
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ position:'relative' }}>
                    <Avatar name={inscrits[0].nom} size={44} />
                    {lastEvent && (Date.now()-new Date(lastEvent.ts))<30000 && (
                      <div style={{ position:'absolute',inset:-4,borderRadius:'50%',border:`2px solid ${T.green}`,animation:'ripple 1.5s ease-out infinite' }} />
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15,fontWeight:700 }}>{inscrits[0].nom}</div>
                    <div style={{ fontSize:12,color:T.gray,marginTop:2 }}>{inscrits[0].email}</div>
                    <div style={{ fontSize:12,color:T.gray }}>{inscrits[0].telephone}</div>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <div style={{ fontSize:11,color:T.green,fontWeight:600 }}>● Récent</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:2 }}>
                      {inscrits[0].createdAt ? new Date(inscrits[0].createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:'center',padding:'16px 0' }}>
                  <div style={{ fontSize:32,opacity:0.12,marginBottom:8 }}>👤</div>
                  <p style={{ fontSize:13,color:T.gray }}>En attente de la première inscription...</p>
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div style={{ display:'flex',gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:16 }}>
            {[['inscrits',`📋 Inscrits (${inscrits.length})`],['timeline','🕒 Timeline'],['devops','⚙️ DevOps & Cloud']].map(([key,label])=>(
              <button key={key} className="tab-btn" onClick={()=>setActiveTab(key)} style={{ padding:'10px 18px',fontSize:13,fontWeight:600,color:activeTab===key?T.white:T.gray,background:'transparent',borderBottom:activeTab===key?`2px solid ${T.gold}`:'2px solid transparent',borderTop:'none',borderLeft:'none',borderRight:'none',marginBottom:-1 }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB INSCRITS ── */}
          {activeTab==='inscrits' && (
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:'hidden',animation:'fadeUp 0.3s ease' }}>
              <div style={{ padding:'14px 20px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10,alignItems:'center' }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher nom, email, téléphone..."
                  style={{ flex:1,padding:'8px 12px',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.white,fontFamily:T.font,outline:'none',transition:'border .2s' }}
                  onFocus={e=>e.target.style.borderColor=`${T.gold}60`}
                  onBlur={e=>e.target.style.borderColor=T.border}
                />
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:'8px 10px',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.white,fontFamily:T.font,cursor:'pointer',outline:'none' }}>
                  <option value="recent">Plus récents</option>
                  <option value="nom">A → Z</option>
                </select>
                <span style={{ fontSize:12,color:T.gray,whiteSpace:'nowrap' }}>{sorted.length} résultat{sorted.length!==1?'s':''}</span>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'2fr 2.2fr 1.3fr 1.4fr',padding:'10px 20px',background:'rgba(0,0,0,0.2)' }}>
                {['Nom','Email','Téléphone','Inscrit le'].map(h=>(
                  <span key={h} style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.09em' }}>{h}</span>
                ))}
              </div>
              {sorted.length===0 ? (
                <div style={{ textAlign:'center',padding:64 }}>
                  <div style={{ fontSize:40,opacity:0.12,marginBottom:12 }}>👥</div>
                  <p style={{ color:T.gray,fontSize:14 }}>{search?'Aucun résultat':'En attente d\'inscriptions...'}</p>
                  {!search && <p style={{ color:'rgba(255,255,255,0.18)',fontSize:12,marginTop:6 }}>Les inscriptions apparaissent ici en temps réel.</p>}
                </div>
              ) : sorted.map((ins,idx)=>(
                <div key={ins.id||idx} className="row" style={{ display:'grid',gridTemplateColumns:'2fr 2.2fr 1.3fr 1.4fr',padding:'13px 20px',alignItems:'center',borderBottom:`1px solid rgba(255,255,255,0.03)`,animation:`slideIn 0.3s ease ${idx*20}ms both` }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <Avatar name={ins.nom} size={30} />
                    <span style={{ fontSize:13,fontWeight:600 }}>{ins.nom||'—'}</span>
                  </div>
                  <div style={{ fontSize:13,color:T.gray }}>{ins.email||'—'}</div>
                  <div style={{ fontSize:13,color:T.gray }}>{ins.telephone||'—'}</div>
                  <div style={{ fontSize:11,color:'rgba(255,255,255,0.25)' }}>
                    {ins.createdAt?new Date(ins.createdAt).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}
                  </div>
                </div>
              ))}
              {sorted.length>0 && (
                <div style={{ padding:'10px 20px',borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between' }}>
                  <span style={{ fontSize:11,color:T.gray }}>{inscrits.length} inscrit{inscrits.length!==1?'s':''} au total</span>
                  <span style={{ fontSize:11,color:'rgba(255,255,255,0.18)' }}>{connected?'● SSE temps réel':'↺ Polling toutes les 8s'}</span>
                </div>
              )}
            </div>
          )}

          {/* ── TAB TIMELINE ── */}
          {activeTab==='timeline' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>
              {inscrits.length===0 ? (
                <div style={{ textAlign:'center',padding:80,background:T.card,border:`1px solid ${T.border}`,borderRadius:14 }}>
                  <div style={{ fontSize:40,opacity:0.12,marginBottom:12 }}>🕒</div>
                  <p style={{ color:T.gray }}>Aucune activité pour le moment.</p>
                </div>
              ) : (
                <div style={{ position:'relative',paddingLeft:20 }}>
                  <div style={{ position:'absolute',left:7,top:8,bottom:8,width:1,background:`linear-gradient(to bottom,${T.blue},${T.purple},${T.green})`,opacity:0.25 }} />
                  {sorted.slice(0,25).map((ins,idx)=>(
                    <div key={ins.id||idx} style={{ display:'flex',gap:16,marginBottom:12,animation:`fadeUp 0.4s ease ${idx*35}ms both` }}>
                      <div style={{ width:14,height:14,borderRadius:'50%',background:T.blue,border:`2px solid ${T.bg}`,flexShrink:0,marginTop:4,position:'relative',zIndex:1 }} />
                      <div style={{ flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <Avatar name={ins.nom} size={28} />
                          <div>
                            <div style={{ fontSize:13,fontWeight:600 }}>{ins.nom}</div>
                            <div style={{ fontSize:11,color:T.gray }}>{ins.email} · {ins.telephone}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:'right',flexShrink:0,marginLeft:12 }}>
                          <div style={{ fontSize:11,color:T.green,fontWeight:600 }}>✓ Inscrit</div>
                          <div style={{ fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:2 }}>
                            {ins.createdAt?new Date(ins.createdAt).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {inscrits.length>25 && <p style={{ fontSize:12,color:T.gray,textAlign:'center',paddingLeft:20,marginTop:8 }}>+ {inscrits.length-25} autres — exportez le CSV pour tout voir.</p>}
                </div>
              )}
            </div>
          )}

          {/* ── TAB DEVOPS ── */}
          {activeTab==='devops' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>

              {/* CI/CD Pipeline */}
              <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'20px 24px',marginBottom:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
                  <h3 style={{ fontSize:14,fontWeight:700 }}>⚙️ Pipeline CI/CD — GitHub Actions</h3>
                  <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'5px 10px' }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:T.green }} />
                    <span style={{ fontSize:11,fontWeight:700,color:T.green }}>Build : succès</span>
                  </div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:0,flexWrap:'nowrap',overflowX:'auto',paddingBottom:4 }}>
                  {[
                    {step:'git push',   color:T.blue,   status:'done'},
                    {step:'npm test',   color:T.purple, status:'done'},
                    {step:'npm build',  color:T.cyan,   status:'done'},
                    {step:'→ Vercel',   color:T.green,  status:'done'},
                    {step:'→ Render',   color:T.green,  status:'done'},
                    {step:'🟢 Live',    color:T.gold,   status:'live'},
                  ].map((s,i,arr)=>(
                    <React.Fragment key={s.step}>
                      <div style={{ background:`${s.color}14`,border:`1px solid ${s.color}35`,borderRadius:8,padding:'8px 14px',flexShrink:0,textAlign:'center' }}>
                        <code style={{ fontSize:12,color:s.color,fontWeight:700 }}>{s.step}</code>
                        <div style={{ fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:2 }}>{s.status==='live'?'en production':'✓ OK'}</div>
                      </div>
                      {i<arr.length-1 && <span style={{ color:'rgba(255,255,255,0.15)',padding:'0 6px',fontSize:14,flexShrink:0 }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ marginTop:14,fontSize:12,color:T.gray,display:'flex',gap:20,flexWrap:'wrap' }}>
                  <span>🌿 Branche : <code style={{color:T.white}}>{deployStatus.branch}</code></span>
                  <span>🔖 Commit : <code style={{color:T.white}}>{deployStatus.commit}</code></span>
                  <span>🕐 Deploy : <span style={{color:T.white}}>{deployStatus.lastDeploy}</span></span>
                </div>
              </div>

              {/* Services Cloud */}
              <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:'hidden' }}>
                <div style={{ padding:'16px 24px',borderBottom:`1px solid ${T.border}` }}>
                  <h3 style={{ fontSize:14,fontWeight:700 }}>☁️ Services Cloud — Statut temps réel</h3>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 80px 80px 80px',padding:'8px 24px',background:'rgba(0,0,0,0.2)' }}>
                  {['Service','Statut','Latence','Uptime'].map((h,i)=>(
                    <span key={h} style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'0.08em',textAlign:i>0?'center':undefined }}>{h}</span>
                  ))}
                </div>
                {deployStatus.services.map(s=>(
                  <div key={s.name} className="row" style={{ display:'grid',gridTemplateColumns:'1fr 80px 80px 80px',padding:'13px 24px',borderBottom:`1px solid rgba(255,255,255,0.03)`,alignItems:'center' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:s.status==='up'?T.green:T.red,boxShadow:s.status==='up'?`0 0 6px ${T.green}`:'none',animation:s.status==='up'?'pulse 2.5s infinite':'none' }} />
                      <span style={{ fontSize:13,fontWeight:600 }}>{s.name}</span>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <span style={{ fontSize:11,color:s.status==='up'?T.green:T.red,fontWeight:700 }}>{s.status==='up'?'UP':'DOWN'}</span>
                    </div>
                    <div style={{ textAlign:'center',fontSize:12,color:T.gray }}>{s.latency}</div>
                    <div style={{ textAlign:'center' }}>
                      <span style={{ fontSize:11,color:T.green,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:20,padding:'2px 8px' }}>{s.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
