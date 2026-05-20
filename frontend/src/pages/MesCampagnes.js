import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const C = {
  bg:     '#f4f6fb',
  card:   '#ffffff',
  navy:   '#0f172a',
  gold:   '#f5a623',
  green:  '#10b981',
  blue:   '#3b82f6',
  purple: '#8b5cf6',
  muted:  '#64748b',
  border: '#e8edf5',
  shadow: '0 2px 16px rgba(15,23,42,0.07)',
};

const TYPE_CFG = {
  email: { label:'Email', color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  icon:'✉'  },
  sms:   { label:'SMS',   color:'#10b981', bg:'rgba(16,185,129,0.1)',  icon:'💬' },
  push:  { label:'Push',  color:'#f5a623', bg:'rgba(245,166,35,0.1)',  icon:'🔔' },
};

const CAMP_IMGS = {
  email: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=500&q=70',
  sms:   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=70',
  push:  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=70',
};

function StatusBadge({ status }) {
  const cfg = {
    sent:      { bg:'#d1fae5', color:'#059669', label:'Envoyée'   },
    scheduled: { bg:'#dbeafe', color:'#1d4ed8', label:'Planifiée' },
    draft:     { bg:'#f1f5f9', color:'#64748b', label:'Brouillon' },
  }[status] || { bg:'#f1f5f9', color:'#64748b', label: status };
  return <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>;
}

/* ── Modal inscription ── */
function InscriptionModal({ camp, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const tc = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;

  const submit = async () => {
    setLoading(true);
    try {
      await api.post(`/api/campagnes/${camp.id}/inscrire`);
      setDone(true);
      onSuccess && onSuccess(camp.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur inscription');
    } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:'fixed', inset:0, background:'rgba(15,23,42,0.7)', backdropFilter:'blur(6px)',
      zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }}>
      <div style={{ background:C.card, borderRadius:20, width:'100%', maxWidth:460, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.2)', animation:'modalIn 0.3s ease', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ background:C.navy, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:4 }}>{tc.icon} Inscription campagne</div>
            <h2 style={{ color:'#fff', margin:0, fontSize:17, fontWeight:800 }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
              <h3 style={{ color:C.green, margin:'0 0 8px' }}>Inscription réussie !</h3>
              <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>Vous recevrez les communications via <strong style={{ color:tc.color }}>{tc.label}</strong>.</p>
              <button onClick={onClose} style={{ background:C.gold, color:'#111', border:'none', padding:'11px 28px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Fermer</button>
            </div>
          ) : (
            <div>
              <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px', marginBottom:20, border:`1px solid ${C.border}`, display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:42, height:42, borderRadius:10, background:tc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{tc.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:C.navy }}>{camp.title}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Canal : <span style={{ color:tc.color, fontWeight:600 }}>{tc.label}</span> {camp.client?.name && `· ${camp.client.name}`}</div>
                </div>
              </div>
              <p style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginBottom:20 }}>
                En vous inscrivant, vous recevrez les communications de cette campagne via <strong style={{ color:tc.color }}>{tc.label}</strong>.
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onClose} style={{ flex:1, padding:12, borderRadius:10, border:`1px solid ${C.border}`, background:'none', color:C.muted, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
                <button onClick={submit} disabled={loading} style={{ flex:2, padding:12, borderRadius:10, border:'none', background:C.gold, color:'#111', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily:'inherit' }}>
                  {loading ? 'Inscription...' : "✓ S'inscrire"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:none} }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function MesCampagnes() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || 'null');
  const token    = localStorage.getItem('token');

  const [campagnes,    setCampagnes]    = useState([]);
  const [inscriptions, setInscriptions] = useState([]); // ids des campagnes où l'user est inscrit
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE_MARKETING';

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);

    const promises = [api.get('/api/campagnes/public')];

    // Admin/Resp Marketing : charge TOUTES les campagnes
    if (isAdmin) {
      promises.push(api.get('/api/campagnes'));
    }

    Promise.all(promises)
      .then(([publicRes, allRes]) => {
        if (isAdmin && allRes) {
          const all = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || [];
          setCampagnes(all);
        } else {
          const pub = Array.isArray(publicRes.data) ? publicRes.data : [];
          setCampagnes(pub);
        }
      })
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, [token, isAdmin, navigate]);

  const filtered = campagnes.filter(c => {
    const mT = filter === 'all' || c.type?.toLowerCase() === filter;
    const mQ = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mT && mQ;
  });

  const handleInscriptionSuccess = (campId) => {
    setInscriptions(prev => [...prev, campId]);
  };

  // Grouper par client pour Admin/Resp Marketing
  const grouped = isAdmin
    ? filtered.reduce((acc, c) => {
        const key = c.client?.name || 'Sans client';
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
      }, {})
    : null;

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'28px 32px', fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .camp-card { transition:transform .25s, box-shadow .25s, border-color .25s; }
        .camp-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(15,23,42,0.12) !important; }
        .filter-btn { transition:all .18s; cursor:pointer; }
        .filter-btn:hover { border-color:rgba(245,166,35,0.4) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ width:4, height:24, background:`linear-gradient(180deg,${C.gold},#d4881a)`, borderRadius:2 }} />
          <h1 style={{ fontSize:22, fontWeight:800, color:C.navy, margin:0 }}>
            {isAdmin ? 'Toutes les campagnes' : 'Mes campagnes'}
          </h1>
        </div>
        <p style={{ color:C.muted, fontSize:13, margin:'0 0 0 14px' }}>
          {isAdmin
            ? `${user?.role === 'ADMIN' ? 'Administrateur' : 'Responsable Marketing'} — vue complète de toutes les campagnes par client`
            : `Bienvenue ${user?.name || ''} — inscrivez-vous aux campagnes qui vous intéressent`
          }
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
        {[
          { label:'Total',      val: loading ? '—' : campagnes.length,                             color:C.gold,   icon:'📢', bg:'#fffbeb' },
          { label:'Email',      val: loading ? '—' : campagnes.filter(c=>c.type==='email').length,  color:C.blue,   icon:'✉',  bg:'#eff6ff' },
          { label:'SMS',        val: loading ? '—' : campagnes.filter(c=>c.type==='sms').length,    color:C.green,  icon:'💬', bg:'#f0fdf4' },
          { label:'Push',       val: loading ? '—' : campagnes.filter(c=>c.type==='push').length,   color:C.purple, icon:'🔔', bg:'#f5f3ff' },
        ].map((k,i) => (
          <div key={i} style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:'15px 18px', boxShadow:C.shadow, display:'flex', alignItems:'center', gap:12, animation:`fadeUp 0.4s ease ${i*60}ms both` }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:'12px 16px', marginBottom:20, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', boxShadow:C.shadow }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:C.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une campagne..."
            style={{ width:'100%', padding:'9px 14px 9px 38px', background:'#f8fafc', border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.navy, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div style={{ width:1, height:28, background:C.border }} />
        <div style={{ display:'flex', gap:6 }}>
          {[['all','Tous'],['email','✉ Email'],['sms','💬 SMS'],['push','🔔 Push']].map(([v,l]) => (
            <button key={v} className="filter-btn" onClick={() => setFilter(v)} style={{
              padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:600,
              border:`1px solid ${filter===v ? C.gold : C.border}`,
              background: filter===v ? 'rgba(245,166,35,0.1)' : 'none',
              color: filter===v ? '#d4881a' : C.muted, fontFamily:'inherit',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:C.muted }}>
          <div style={{ width:36, height:36, border:'3px solid rgba(245,166,35,0.2)', borderTop:`3px solid ${C.gold}`, borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
          Chargement des campagnes...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:C.card, borderRadius:18, padding:'60px 24px', textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:44, marginBottom:16, opacity:0.2 }}>📢</div>
          <p style={{ color:C.muted, fontSize:15, fontWeight:600 }}>Aucune campagne trouvée</p>
        </div>
      ) : isAdmin ? (
        /* ── VUE ADMIN : groupée par client ── */
        Object.entries(grouped).map(([clientName, camps]) => (
          <div key={clientName} style={{ marginBottom:32 }}>
            {/* Client header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'12px 18px', background:C.card, borderRadius:12, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(245,166,35,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏢</div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:C.navy }}>{clientName}</div>
                <div style={{ fontSize:12, color:C.muted }}>{camps.length} campagne{camps.length>1?'s':''}</div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                {['email','sms','push'].map(t => {
                  const count = camps.filter(c=>c.type===t).length;
                  if (!count) return null;
                  const tc = TYPE_CFG[t];
                  return (
                    <span key={t} style={{ fontSize:11, fontWeight:600, color:tc.color, background:tc.bg, padding:'3px 9px', borderRadius:20 }}>
                      {tc.icon} {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Grille campagnes du client */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {camps.map((c,i) => {
                const tc     = TYPE_CFG[c.type?.toLowerCase()] || TYPE_CFG.email;
                const imgSrc = CAMP_IMGS[c.type?.toLowerCase()] || CAMP_IMGS.email;
                const isInsc = inscriptions.includes(c.id);
                return (
                  <div key={c.id} className="camp-card" style={{ background:C.card, borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}`, boxShadow:C.shadow, animation:`fadeUp 0.4s ease ${i*50}ms both` }}>
                    <div style={{ height:150, overflow:'hidden', position:'relative' }}>
                      <img src={imgSrc} alt={c.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.7))' }} />
                      <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:tc.color, background:'rgba(255,255,255,0.95)', padding:'3px 9px', borderRadius:20 }}>{tc.icon} {tc.label}</span>
                      </div>
                      <div style={{ position:'absolute', top:10, right:10 }}>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <div style={{ padding:'16px 18px 18px' }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 4px', lineHeight:1.3 }}>{c.title}</h3>
                      {c.dateScheduled && <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>🕐 {new Date(c.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}</div>}
                      <div style={{ display:'flex', gap:8 }}>
                        <span style={{ flex:1, fontSize:11, fontWeight:600, color:C.muted, background:'#f8fafc', padding:'5px 10px', borderRadius:8, textAlign:'center', border:`1px solid ${C.border}` }}>
                          {c.status === 'sent' ? '✅ Envoyée' : c.status === 'scheduled' ? '📅 Planifiée' : '📝 Brouillon'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        /* ── VUE CLIENT : grille avec bouton inscription ── */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {filtered.map((c, i) => {
            const tc     = TYPE_CFG[c.type?.toLowerCase()] || TYPE_CFG.email;
            const imgSrc = CAMP_IMGS[c.type?.toLowerCase()] || CAMP_IMGS.email;
            const isInsc = inscriptions.includes(c.id);
            return (
              <div key={c.id} className="camp-card" style={{ background:C.card, borderRadius:18, overflow:'hidden', border:`1px solid ${C.border}`, boxShadow:C.shadow, animation:`fadeUp 0.4s ease ${i*60}ms both` }}>
                <div style={{ height:180, overflow:'hidden', position:'relative' }}>
                  <img src={imgSrc} alt={c.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.75))' }} />
                  <div style={{ position:'absolute', top:12, left:12 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:tc.color, background:'rgba(255,255,255,0.95)', padding:'4px 11px', borderRadius:20 }}>{tc.icon} {tc.label}</span>
                  </div>
                </div>
                <div style={{ padding:'18px 20px 22px' }}>
                  {c.client?.name && <div style={{ fontSize:11, color:C.muted, marginBottom:5 }}>🏢 {c.client.name}</div>}
                  <h3 style={{ fontSize:15, fontWeight:700, color:C.navy, margin:'0 0 6px', lineHeight:1.3 }}>{c.title}</h3>
                  {c.dateScheduled && <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>🕐 {new Date(c.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}</div>}

                  {isInsc ? (
                    <div style={{ padding:'11px', borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, fontWeight:700, color:'#059669', textAlign:'center' }}>
                      ✅ Inscrit à cette campagne
                    </div>
                  ) : (
                    <button onClick={() => setSelected(c)} style={{
                      width:'100%', padding:'12px', borderRadius:10,
                      background:C.gold, color:'#111', border:'none',
                      fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                      transition:'background .2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#d4881a'}
                      onMouseLeave={e => e.currentTarget.style.background = C.gold}
                    >
                      S'inscrire à cette campagne →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <InscriptionModal
          camp={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleInscriptionSuccess}
        />
      )}
    </div>
  );
}