import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const T = {
  gold:'#f5a623', goldDk:'#d4881a', bg:'#080c14',
  card:'#141c2e', border:'rgba(255,255,255,0.07)', blue:'#4f8ef7',
  purple:'#7c3aed', green:'#10b981', red:'#ef4444',
  white:'#ffffff', gray:'rgba(255,255,255,0.45)',
  font:"'Inter','DM Sans',sans-serif",
};

const TYPE_CFG = {
  email:{ label:'Email', icon:'✉', color:T.blue  },
  sms:  { label:'SMS',   icon:'💬',color:T.green },
  push: { label:'Push',  icon:'🔔',color:T.gold  },
};

/* Notification toast */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{ position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',zIndex:9999,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.4)',backdropFilter:'blur(20px)',borderRadius:14,padding:'14px 22px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 16px 40px rgba(0,0,0,0.4)',animation:'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',minWidth:320 }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <div style={{ width:32,height:32,borderRadius:8,background:'rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🔔</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13,fontWeight:700,color:T.green }}>Nouvelle inscription !</div>
        <div style={{ fontSize:12,color:T.gray,marginTop:2 }}>{msg}</div>
      </div>
      <button onClick={onClose} style={{ background:'none',border:'none',color:T.gray,cursor:'pointer',fontSize:16 }}>✕</button>
    </div>
  );
}

/* Avatar initiales */
function Avatar({ name, size=36 }) {
  const colors = [T.blue, T.purple, T.green, T.gold, '#e11d48', '#0891b2'];
  const color = colors[(name||'').charCodeAt(0) % colors.length];
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:`${color}25`,border:`1.5px solid ${color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,color,flexShrink:0 }}>
      {(name||'?')[0].toUpperCase()}
    </div>
  );
}

export default function CampagneAdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne] = useState(null);
  const [inscrits, setInscrits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const prevCount = useRef(0);
  const pollRef = useRef(null);

  const fetchData = async (showNotif=false) => {
    try {
      const [c, i] = await Promise.all([
        api.get(`/api/campagnes/${id}`),
        api.get(`/api/campagnes/${id}/inscrits`),
      ]);
      setCampagne(c.data);
      const newInscrits = Array.isArray(i.data) ? i.data : [];
      if (showNotif && newInscrits.length > prevCount.current && prevCount.current > 0) {
        const newest = newInscrits[0];
        setToast(`${newest?.nom || 'Un nouveau client'} vient de s'inscrire à ${c.data?.title}`);
      }
      prevCount.current = newInscrits.length;
      setInscrits(newInscrits);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchData(false);
    // Polling toutes les 10s pour détecter nouvelles inscriptions
    pollRef.current = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const filtered = inscrits.filter(i =>
    [i.nom, i.email, i.telephone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy === 'recent') return new Date(b.createdAt||0) - new Date(a.createdAt||0);
    if (sortBy === 'nom') return (a.nom||'').localeCompare(b.nom||'');
    return 0;
  });

  const exportCSV = () => {
    const rows = [['Nom','Email','Téléphone','Date inscription'], ...inscrits.map(i=>[i.nom||'',i.email||'',i.telephone||'',i.createdAt ? new Date(i.createdAt).toLocaleString('fr-FR') : ''])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`inscrits-campagne-${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:T.font }}>
      <div style={{ textAlign:'center' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width:40,height:40,border:`3px solid rgba(245,166,35,0.15)`,borderTop:`3px solid ${T.gold}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }}/>
        <p style={{ color:T.gray,fontFamily:T.font }}>Chargement...</p>
      </div>
    </div>
  );

  if (!campagne) return null;
  const tc = TYPE_CFG[campagne.type?.toLowerCase()] || TYPE_CFG.email;

  return (
    <div style={{ fontFamily:T.font, minHeight:'100vh', background:T.bg, color:T.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(245,166,35,0.4);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .row-item { transition:background 0.15s; border-bottom:1px solid rgba(255,255,255,0.04); }
        .row-item:hover { background:rgba(255,255,255,0.03) !important; }
        .action-btn { transition:all 0.2s; border:none; cursor:pointer; font-family:inherit; }
        .action-btn:hover { opacity:0.8; transform:translateY(-1px); }
        .search-inp:focus { outline:none; border-color:rgba(245,166,35,0.5)!important; box-shadow:0 0 0 3px rgba(245,166,35,0.1); }
      `}</style>

      {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}

      {/* SIDEBAR mini + MAIN layout */}
      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* Sidebar */}
        <div style={{ width:220,background:'#0a0f1a',borderRight:`1px solid ${T.border}`,padding:'20px 12px',flexShrink:0,display:'flex',flexDirection:'column' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'0 8px',marginBottom:28 }}>
            <div style={{ width:30,height:30,background:T.gold,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:'#111' }}>D</div>
            <span style={{ fontSize:16,fontWeight:800 }}>Digi<span style={{color:T.gold}}>Pip</span></span>
          </div>
          {[['🏠','Dashboard','/dashboard'],['📣','Campagnes','/admin/campagnes'],['👥','Contacts','/admin/contacts'],['📊','Analytics','/admin/analytics']].map(([icon,label,path])=>(
            <div key={label} onClick={()=>navigate(path)} style={{ padding:'9px 12px',borderRadius:8,marginBottom:2,display:'flex',alignItems:'center',gap:8,cursor:'pointer',background:label==='Campagnes'?'rgba(245,166,35,0.1)':'transparent' }}>
              <span style={{ fontSize:14 }}>{icon}</span>
              <span style={{ fontSize:13,fontWeight:label==='Campagnes'?700:400,color:label==='Campagnes'?T.gold:'rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* MAIN */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 40px' }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:28,fontSize:13,color:T.gray }}>
            <span onClick={()=>navigate('/admin/campagnes')} style={{ cursor:'pointer' }}>Campagnes</span>
            <span>›</span>
            <span style={{ color:T.white,fontWeight:600 }}>{campagne.title}</span>
          </div>

          {/* HEADER campagne */}
          <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'24px 28px',marginBottom:28,animation:'fadeUp 0.5s ease' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16 }}>
              <div>
                <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${tc.color}15`,border:`1px solid ${tc.color}30`,borderRadius:20,padding:'4px 12px',marginBottom:10 }}>
                  <span>{tc.icon}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:tc.color }}>{tc.label}</span>
                </div>
                <h1 style={{ fontSize:'clamp(20px,2.5vw,30px)',fontWeight:900,letterSpacing:'-0.02em',marginBottom:6 }}>{campagne.title}</h1>
                {campagne.client?.name && <p style={{ fontSize:13,color:T.gray }}>🏢 {campagne.client.name}</p>}
              </div>
              <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                {/* Indicateur live polling */}
                <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'8px 12px' }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:T.green,animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:12,fontWeight:600,color:T.green }}>Live — mise à jour toutes les 10s</span>
                </div>
                <button className="action-btn" onClick={exportCSV} style={{ background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 14px',color:T.white,fontSize:13,fontWeight:600 }}>
                  ⬇ Export CSV
                </button>
              </div>
            </div>

            {/* Stats rapides */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:24 }}>
              {[
                ['👥','Total inscrits',inscrits.length,T.blue],
                ['✉','Canal',tc.label,tc.color],
                ['📅','Dernière inscription',inscrits[0]?.createdAt ? new Date(inscrits[0].createdAt).toLocaleDateString('fr-FR') : '—',T.green],
                ['📊','Statut',campagne.status||'Active',T.gold],
              ].map(([icon,label,val,color])=>(
                <div key={label} style={{ background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:10,padding:'14px 16px' }}>
                  <div style={{ fontSize:18,marginBottom:8 }}>{icon}</div>
                  <div style={{ fontSize:10,color:T.gray,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:18,fontWeight:800,color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* LISTE DES INSCRITS */}
          <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',animation:'fadeUp 0.5s ease 0.1s both' }}>
            {/* Barre de contrôle */}
            <div style={{ padding:'18px 24px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap' }}>
              <h2 style={{ fontSize:15,fontWeight:700,flex:'none' }}>📋 Inscrits ({inscrits.length})</h2>
              <input
                className="search-inp"
                value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                style={{ flex:1,minWidth:180,padding:'8px 14px',background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.white,fontFamily:T.font,transition:'border .2s, box-shadow .2s' }}
              />
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:'8px 12px',background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.white,fontFamily:T.font,cursor:'pointer' }}>
                <option value="recent">Plus récents</option>
                <option value="nom">Par nom</option>
              </select>
            </div>

            {/* En-tête tableau */}
            <div style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1.2fr 1.2fr',padding:'10px 24px',background:'rgba(255,255,255,0.02)',borderBottom:`1px solid ${T.border}` }}>
              {['Nom','Email','Téléphone','Date inscription'].map(h=>(
                <span key={h} style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.08em' }}>{h}</span>
              ))}
            </div>

            {/* Lignes */}
            {sorted.length === 0 ? (
              <div style={{ textAlign:'center',padding:60 }}>
                <div style={{ fontSize:40,marginBottom:12,opacity:0.15 }}>👥</div>
                <p style={{ color:T.gray,fontSize:14 }}>{search ? 'Aucun résultat trouvé' : 'Aucun inscrit pour le moment'}</p>
                {!search && <p style={{ color:'rgba(255,255,255,0.2)',fontSize:12,marginTop:6 }}>Les inscriptions apparaîtront ici en temps réel.</p>}
              </div>
            ) : sorted.map((inscrit, idx) => (
              <div key={inscrit.id||idx} className="row-item" style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1.2fr 1.2fr',padding:'14px 24px',alignItems:'center',animation:`fadeUp 0.4s ease ${idx*30}ms both` }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <Avatar name={inscrit.nom} size={32} />
                  <span style={{ fontSize:13,fontWeight:600,color:T.white }}>{inscrit.nom||'—'}</span>
                </div>
                <div style={{ fontSize:13,color:T.gray }}>{inscrit.email||'—'}</div>
                <div style={{ fontSize:13,color:T.gray }}>{inscrit.telephone||'—'}</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.3)' }}>
                  {inscrit.createdAt ? new Date(inscrit.createdAt).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—'}
                </div>
              </div>
            ))}

            {/* Footer avec total */}
            {sorted.length > 0 && (
              <div style={{ padding:'12px 24px',borderTop:`1px solid ${T.border}`,background:'rgba(255,255,255,0.01)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <span style={{ fontSize:12,color:T.gray }}>{sorted.length} résultat{sorted.length!==1?'s':''} affiché{sorted.length!==1?'s':''}</span>
                <span style={{ fontSize:12,color:'rgba(255,255,255,0.2)' }}>Actualisé automatiquement</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}