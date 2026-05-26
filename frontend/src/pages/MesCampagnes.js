import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api';

const T = {
  gold:'#f5a623', goldDk:'#d4881a', bg:'#080c14', bg2:'#0d1420',
  card:'#141c2e', border:'rgba(255,255,255,0.07)', blue:'#4f8ef7',
  purple:'#7c3aed', green:'#10b981', white:'#ffffff',
  gray:'rgba(255,255,255,0.45)', font:"'Inter','DM Sans',sans-serif",
};

const TYPE_CFG = {
  email:{ label:'Email',   icon:'✉', color:T.blue   },
  sms:  { label:'SMS',     icon:'💬', color:T.green  },
  push: { label:'Push',    icon:'🔔', color:T.gold   },
};

const CAMP_IMGS = {
  email:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
  sms:  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
  push: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
};

/* Aurora background léger */
function AuroraBg() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0, raf;
    const orbs = [
      { bx:0.1, by:0.2, rx:0.2, ry:0.15, freq:0.22, ph:0,   r:600, col:[79,142,247],  a:0.30 },
      { bx:0.9, by:0.1, rx:0.16,ry:0.12, freq:0.17, ph:1.1, r:550, col:[124,58,237],  a:0.28 },
      { bx:0.5, by:0.6, rx:0.22,ry:0.18, freq:0.13, ph:2.2, r:700, col:[245,166,35],  a:0.18 },
      { bx:0.8, by:0.8, rx:0.18,ry:0.14, freq:0.19, ph:3.5, r:600, col:[16,185,129],  a:0.22 },
      { bx:0.3, by:0.5, rx:0.18,ry:0.14, freq:0.25, ph:4.8, r:580, col:[160,60,255],  a:0.22 },
    ];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const draw = () => {
      const {width:W, height:H} = canvas;
      ctx.fillStyle = '#080c14'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 0.5;
      for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      orbs.forEach(o => {
        const cx=(o.bx+Math.sin(t*o.freq+o.ph)*o.rx)*W;
        const cy=(o.by+Math.cos(t*o.freq*0.7+o.ph+1)*o.ry)*H;
        const r=o.r*(1+Math.sin(t*o.freq*1.3+o.ph)*0.1);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0,`rgba(${o.col},${o.a})`);
        g.addColorStop(0.3,`rgba(${o.col},${(o.a*0.5).toFixed(2)})`);
        g.addColorStop(1,`rgba(${o.col},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });
      t+=0.008; raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
}

export default function MesCampagnes() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // ── Auth immédiate ──
  const token = localStorage.getItem('token');
  if (!token) {
    sessionStorage.setItem('redirect_after_login', '/campagnes');
    return <Navigate to="/login" replace />;
  }
// ✅ Rediriger ADMIN et RESPONSABLE_MARKETING vers la gestion
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role === 'ADMIN' || payload.role === 'RESPONSABLE_MARKETING') {
    return <Navigate to="/gestion-campagnes" replace />;
  }
} catch(e) {}
  useEffect(() => {
    Promise.all([
      api.get('/api/campagnes/public'),
      api.get('/api/campagnes/mes-inscriptions').catch(() => ({ data: [] })),
    ])
      .then(([c, i]) => {
        setCampagnes(Array.isArray(c.data) ? c.data : []);
        setInscriptions(Array.isArray(i.data) ? i.data.map(x => x.campagneId || x.id) : []);
      })
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campagnes.filter(c => {
    const matchType = filter === 'all' || c.type?.toLowerCase() === filter;
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div style={{ fontFamily: T.font, minHeight: '100vh', color: T.white, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(245,166,35,0.4);border-radius:2px}
        .camp-card { transition: all 0.3s cubic-bezier(0.34,1.2,0.64,1); cursor:pointer; }
        .camp-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 32px 64px rgba(0,0,0,0.5) !important; border-color: rgba(245,166,35,0.35) !important; }
        .filter-btn { transition: all 0.2s; border:none; cursor:pointer; font-family:inherit; }
        .filter-btn:hover { opacity: 0.85; }
        .search-input:focus { outline:none; border-color:rgba(245,166,35,0.5) !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.1); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <AuroraBg />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* NAVBAR */}
        <nav style={{ height:64, padding:'0 5%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,12,20,0.7)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 }}>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <div style={{ width:34,height:34,background:T.gold,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#111' }}>D</div>
            <span style={{ fontSize:18,fontWeight:800 }}>Digi<span style={{color:T.gold}}>Pip</span></span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${T.gold},${T.purple})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff' }}>
              {(localStorage.getItem('userName')||'C')[0].toUpperCase()}
            </div>
            <span style={{ fontSize:13,color:T.gray }}>{localStorage.getItem('userName') || 'Client'}</span>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ padding:'48px 5% 32px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ animation:'fadeUp 0.6s ease' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:20, padding:'5px 14px', marginBottom:16 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:T.green,display:'block',boxShadow:`0 0 6px ${T.green}` }} />
              <span style={{ fontSize:11,fontWeight:700,color:T.green,letterSpacing:'0.12em',textTransform:'uppercase' }}>Campagnes disponibles</span>
            </div>
            <h1 style={{ fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-0.03em',marginBottom:8 }}>
              Mes <span style={{ background:`linear-gradient(135deg,${T.gold},#ffc048)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Campagnes</span>
            </h1>
            <p style={{ fontSize:15,color:T.gray,lineHeight:1.6 }}>Découvrez et inscrivez-vous aux campagnes de nos agences partenaires.</p>
          </div>
        </div>

        {/* FILTRES + SEARCH */}
        <div style={{ padding:'0 5% 32px', maxWidth:1200, margin:'0 auto', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:6 }}>
            {[['all','Toutes'], ['email','Email'], ['sms','SMS'], ['push','Push']].map(([val,label]) => (
              <button key={val} className="filter-btn" onClick={() => setFilter(val)} style={{
                padding:'8px 18px', borderRadius:20, fontSize:13, fontWeight:600,
                background: filter===val ? T.gold : 'rgba(255,255,255,0.05)',
                color: filter===val ? '#111' : T.gray,
                border: `1px solid ${filter===val ? T.gold : T.border}`,
              }}>{label}</button>
            ))}
          </div>
          <input
            className="search-input"
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Rechercher une campagne..."
            style={{ flex:1, minWidth:200, padding:'9px 16px', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, borderRadius:20, fontSize:13, color:T.white, fontFamily:T.font, transition:'border .2s, box-shadow .2s' }}
          />
          <span style={{ fontSize:12,color:T.gray }}>{filtered.length} campagne{filtered.length!==1?'s':''}</span>
        </div>

        {/* GRID */}
        <div style={{ padding:'0 5% 80px', maxWidth:1200, margin:'0 auto' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:80 }}>
              <div style={{ width:36,height:36,border:`3px solid rgba(245,166,35,0.15)`,borderTop:`3px solid ${T.gold}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }} />
              <p style={{ color:T.gray }}>Chargement des campagnes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:80 }}>
              <div style={{ fontSize:48,marginBottom:16,opacity:0.2 }}>📢</div>
              <p style={{ color:T.gray }}>Aucune campagne trouvée.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:22 }}>
              {filtered.map((c, idx) => {
                const tc = TYPE_CFG[c.type?.toLowerCase()] || TYPE_CFG.email;
                const isInscrit = inscriptions.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className="camp-card"
                    onClick={() => { window.location.href = `/campagnes/${c.id}`; }}
                    style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.25)', animation:`fadeUp 0.5s ease ${idx*60}ms both` }}
                  >
                    {/* Image */}
                    <div style={{ height:180, overflow:'hidden', position:'relative' }}>
                      <img src={CAMP_IMGS[c.type?.toLowerCase()]||CAMP_IMGS.email} alt={c.title} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s' }}
                        onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                        onMouseLeave={e=>e.target.style.transform='scale(1)'}
                        onError={e=>{e.target.src=`https://picsum.photos/seed/${c.id}/600/400`;}}
                      />
                      <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(20,28,46,0.92))' }} />
                      {/* Badge type */}
                      <div style={{ position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',border:`1px solid ${tc.color}40`,borderRadius:20,padding:'4px 10px',display:'flex',alignItems:'center',gap:5 }}>
                        <span style={{ fontSize:12 }}>{tc.icon}</span>
                        <span style={{ fontSize:11,fontWeight:700,color:tc.color }}>{tc.label}</span>
                      </div>
                      {/* Badge inscrit */}
                      {isInscrit && (
                        <div style={{ position:'absolute',top:12,right:12,background:'rgba(16,185,129,0.2)',backdropFilter:'blur(8px)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:20,padding:'4px 10px' }}>
                          <span style={{ fontSize:11,fontWeight:700,color:T.green }}>✓ Inscrit</span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div style={{ padding:'18px 20px 20px' }}>
                      {c.client?.name && <p style={{ fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:6 }}>🏢 {c.client.name}</p>}
                      <h3 style={{ fontSize:16,fontWeight:700,marginBottom:8,lineHeight:1.35,color:T.white }}>{c.title}</h3>
                      {c.description && <p style={{ fontSize:13,color:T.gray,lineHeight:1.55,marginBottom:14,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{c.description}</p>}
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); window.location.href = `/campagnes/${c.id}`; }}
                          style={{
                            flex:1, padding:'11px', borderRadius:10,
                            background: isInscrit ? 'rgba(16,185,129,0.12)' : T.gold,
                            color: isInscrit ? T.green : '#111',
                            fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:T.font,
                            border: isInscrit ? '1px solid rgba(16,185,129,0.3)' : 'none',
                          }}>
                          {isInscrit ? '✓ Déjà inscrit — Voir' : 'Voir & S\'inscrire →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}