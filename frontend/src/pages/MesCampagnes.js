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
  email: { label:'Email', color:'#3b82f6', bg:'rgba(59,130,246,0.1)', icon:'✉'  },
  sms:   { label:'SMS',   color:'#10b981', bg:'rgba(16,185,129,0.1)', icon:'💬' },
  push:  { label:'Push',  color:'#f5a623', bg:'rgba(245,166,35,0.1)', icon:'🔔' },
};

const CAMP_IMGS = {
  email: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=75',
  sms:   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=75',
  push:  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=75',
};

function Skel({ w='100%', h=14, r=6 }) {
  return (
    <div style={{
      width:w, height:h, borderRadius:r,
      background:'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize:'500px 100%',
      animation:'shimmer 1.4s infinite',
    }} />
  );
}

export default function MesCampagnes() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || 'null');
  const token    = localStorage.getItem('token');

  const [campagnes, setCampagnes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESPONSABLE_MARKETING';

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    const req = isAdmin ? api.get('/api/campagnes') : api.get('/api/campagnes/public');
    req
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setCampagnes(data);
      })
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, [token, isAdmin, navigate]);

  const filtered = campagnes.filter(c => {
    const mT = filter === 'all' || c.type?.toLowerCase() === filter;
    const mQ = !search
      || c.title?.toLowerCase().includes(search.toLowerCase())
      || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mT && mQ;
  });

  /* Grouper par client pour admin */
  const grouped = isAdmin
    ? filtered.reduce((acc, c) => {
        const key = c.client?.name || 'Sans client';
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
      }, {})
    : null;

  return (
    <div style={{
      background:C.bg, minHeight:'100vh', padding:'28px 32px',
      fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .camp-card { transition:transform .25s, box-shadow .25s, border-color .25s; cursor:pointer; }
        .camp-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(15,23,42,0.14) !important; border-color:rgba(245,166,35,0.3) !important; }
        .camp-card:hover .camp-img { transform:scale(1.05); }
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
            ? 'Vue complète — toutes les campagnes par client'
            : 'Cliquez sur une campagne pour voir les détails et vous inscrire'
          }
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
        {[
          { label:'Total',  val: loading ? '—' : campagnes.length,                             color:C.gold,   icon:'📢', bg:'#fffbeb' },
          { label:'Email',  val: loading ? '—' : campagnes.filter(c=>c.type==='email').length,  color:C.blue,   icon:'✉',  bg:'#eff6ff' },
          { label:'SMS',    val: loading ? '—' : campagnes.filter(c=>c.type==='sms').length,    color:C.green,  icon:'💬', bg:'#f0fdf4' },
          { label:'Push',   val: loading ? '—' : campagnes.filter(c=>c.type==='push').length,   color:C.purple, icon:'🔔', bg:'#f5f3ff' },
        ].map((k, i) => (
          <div key={i} style={{
            background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
            padding:'15px 18px', boxShadow:C.shadow,
            display:'flex', alignItems:'center', gap:12,
            animation:`fadeUp 0.4s ease ${i*60}ms both`,
          }}>
            <div style={{
              width:40, height:40, borderRadius:'50%', background:k.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, flexShrink:0,
            }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
        padding:'12px 16px', marginBottom:24,
        display:'flex', gap:12, alignItems:'center', flexWrap:'wrap',
        boxShadow:C.shadow,
      }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:C.muted }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une campagne..."
            style={{
              width:'100%', padding:'9px 14px 9px 38px',
              background:'#f8fafc', border:`1px solid ${C.border}`,
              borderRadius:10, fontSize:13, color:C.navy,
              outline:'none', fontFamily:'inherit',
              boxSizing:'border-box', transition:'border .2s',
            }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e  => e.target.style.borderColor = C.border}
          />
        </div>
        <div style={{ width:1, height:28, background:C.border }} />
        <div style={{ display:'flex', gap:6 }}>
          {[['all','Tous'],['email','✉ Email'],['sms','💬 SMS'],['push','🔔 Push']].map(([v,l]) => (
            <button
              key={v}
              className="filter-btn"
              onClick={() => setFilter(v)}
              style={{
                padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:600,
                border:`1px solid ${filter===v ? C.gold : C.border}`,
                background: filter===v ? 'rgba(245,166,35,0.1)' : 'none',
                color: filter===v ? '#d4881a' : C.muted,
                fontFamily:'inherit',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background:C.card, borderRadius:18, overflow:'hidden', border:`1px solid ${C.border}` }}>
              <Skel h={180} r={0} />
              <div style={{ padding:18, display:'flex', flexDirection:'column', gap:10 }}>
                <Skel h={14} w="70%" />
                <Skel h={12} w="50%" />
                <Skel h={40} r={10} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background:C.card, borderRadius:18, padding:'60px 24px',
          textAlign:'center', border:`1px solid ${C.border}`,
        }}>
          <div style={{ fontSize:44, marginBottom:16, opacity:0.2 }}>📢</div>
          <p style={{ color:C.muted, fontSize:15, fontWeight:600 }}>Aucune campagne trouvée</p>
        </div>
      ) : isAdmin ? (
        /* ── VUE ADMIN : groupée par client ── */
        Object.entries(grouped).map(([clientName, camps]) => (
          <div key={clientName} style={{ marginBottom:36 }}>
            {/* Client header */}
            <div style={{
              display:'flex', alignItems:'center', gap:12, marginBottom:16,
              padding:'14px 20px', background:C.card, borderRadius:14,
              border:`1px solid ${C.border}`, boxShadow:C.shadow,
            }}>
              <div style={{
                width:42, height:42, borderRadius:11,
                background:'rgba(245,166,35,0.1)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
              }}>🏢</div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:C.navy }}>{clientName}</div>
                <div style={{ fontSize:12, color:C.muted }}>{camps.length} campagne{camps.length>1?'s':''}</div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                {['email','sms','push'].map(t => {
                  const count = camps.filter(c => c.type===t).length;
                  if (!count) return null;
                  const tc = TYPE_CFG[t];
                  return (
                    <span key={t} style={{
                      fontSize:11, fontWeight:600, color:tc.color,
                      background:tc.bg, padding:'3px 10px', borderRadius:20,
                    }}>{tc.icon} {count}</span>
                  );
                })}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {camps.map((c, i) => (
                <CampCard key={c.id} camp={c} idx={i} onClick={() => navigate(`/campagne/${c.id}`)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        /* ── VUE CLIENT : grille cliquable ── */
        <div>
          <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>
            💡 Cliquez sur une campagne pour voir les détails et vous inscrire
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
            {filtered.map((c, i) => (
              <CampCard key={c.id} camp={c} idx={i} onClick={() => navigate(`/campagne/${c.id}`)} showArrow />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Card campagne réutilisable ── */
function CampCard({ camp, idx, onClick, showArrow }) {
  const C2 = { navy:'#0f172a', muted:'#64748b', border:'#e8edf5', gold:'#f5a623', green:'#10b981' };
  const tc     = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;
  const imgSrc = CAMP_IMGS[camp.type?.toLowerCase()] || CAMP_IMGS.email;

  return (
    <div
      className="camp-card"
      onClick={onClick}
      style={{
        background:'#ffffff', borderRadius:18, overflow:'hidden',
        border:`1px solid ${C2.border}`,
        boxShadow:'0 2px 16px rgba(15,23,42,0.07)',
        animation:`fadeUp 0.4s ease ${idx*60}ms both`,
      }}
    >
      {/* Image */}
      <div style={{ height:185, overflow:'hidden', position:'relative' }}>
        <img
          className="camp-img"
          src={imgSrc}
          alt={camp.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
          onError={e => { e.target.style.display='none'; }}
        />
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.7))',
        }} />
        {/* Badges */}
        <div style={{ position:'absolute', top:12, left:12 }}>
          <span style={{
            fontSize:11, fontWeight:700, color:tc.color,
            background:'rgba(255,255,255,0.95)', padding:'4px 11px', borderRadius:20,
          }}>{tc.icon} {tc.label}</span>
        </div>
        <div style={{ position:'absolute', top:12, right:12 }}>
          {camp.status === 'sent' && (
            <span style={{
              fontSize:11, fontWeight:700, color:'#059669',
              background:'rgba(255,255,255,0.95)', padding:'4px 10px', borderRadius:20,
            }}>● Active</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'18px 20px 20px' }}>
        {camp.client?.name && (
          <div style={{ fontSize:11, color:C2.muted, marginBottom:5, display:'flex', alignItems:'center', gap:4 }}>
            🏢 {camp.client.name}
          </div>
        )}
        <h3 style={{ fontSize:15, fontWeight:700, color:C2.navy, margin:'0 0 6px', lineHeight:1.3 }}>
          {camp.title}
        </h3>
        {camp.dateScheduled && (
          <div style={{ fontSize:12, color:C2.muted, marginBottom:14 }}>
            🕐 {new Date(camp.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
          </div>
        )}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'11px 14px',
          background: showArrow ? C2.gold : '#f8fafc',
          borderRadius:10,
          border:`1px solid ${showArrow ? C2.gold : C2.border}`,
        }}>
          <span style={{ fontSize:13, fontWeight:700, color: showArrow ? '#111' : C2.muted }}>
            {showArrow ? "Voir les détails & s'inscrire" : 'Voir les détails'}
          </span>
          <span style={{ fontSize:16, color: showArrow ? '#111' : C2.muted }}>→</span>
        </div>
      </div>
    </div>
  );
}