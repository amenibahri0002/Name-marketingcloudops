import React, { useState, useEffect } from 'react';
import api from '../api';

const T = {
  bg:        '#f0f2f8',
  card:      '#ffffff',
  navy:      '#16120d',
  gold:      '#f5a623',
  goldDark:  '#c8831a',
  goldDim:   'rgba(245,166,35,0.10)',
  goldBorder:'rgba(245,166,35,0.28)',
  border:    '#e4e9f2',
  text:      '#1a1f3c',
  muted:     '#7a8599',
  blue:      '#3b82f6',
  blueDim:   'rgba(59,130,246,0.10)',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.10)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  purple:    '#8b5cf6',
  purpleDim: 'rgba(139,92,246,0.10)',
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

const AVATAR_COLORS = [T.gold,T.blue,T.green,T.purple,'#ec4899','#14b8a6','#f97316'];
const avatarColor = n => AVATAR_COLORS[(n?.charCodeAt(0)||0) % AVATAR_COLORS.length];
const initials = n => n ? n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '??';
const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function Skel({ w='100%', h=16, r=6 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize:'500px 100%', animation:'shimmer 1.4s infinite linear' }}/>;
}

/* ══════════════════════════════════════════
   MODAL Ajout / Édition client
══════════════════════════════════════════ */
function ClientModal({ client, onClose, onSave }) {
  const isEdit = !!client;
  const [form,   setForm]   = useState({ name: client?.name||'', email: client?.email||'', phone: client?.phone||'' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handle = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) await api.put(`/api/clients/${client.id}`, form);
      else        await api.post('/api/clients', form);
      onSave(); onClose();
    } catch (err) {
      setErrors({ api: err.response?.data?.error || 'Erreur serveur' });
    } finally { setSaving(false); }
  };

  const Field = ({ fkey, label, placeholder, type='text' }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ fontSize:11, fontWeight:700, color:T.text, display:'block', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={form[fkey]}
        onChange={e => { setForm(p=>({...p,[fkey]:e.target.value})); setErrors(p=>({...p,[fkey]:''})); }}
        onKeyDown={e => e.key==='Enter' && handle()}
        style={{
          width:'100%', padding:'10px 14px',
          border:`1.5px solid ${errors[fkey]?T.red:T.border}`, borderRadius:10,
          fontSize:13, color:T.text, background:errors[fkey]?'rgba(239,68,68,0.03)':'#fafbfd',
          boxSizing:'border-box', fontFamily:T.sans, outline:'none', transition:'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = errors[fkey]?T.red:T.gold}
        onBlur={e  => e.target.style.borderColor = errors[fkey]?T.red:T.border}
      />
      {errors[fkey] && <div style={{ fontSize:11, color:T.red, marginTop:4 }}>⚠ {errors[fkey]}</div>}
    </div>
  );

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(10,14,42,0.55)', backdropFilter:'blur(5px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      animation:'fadeIn 0.2s ease',
    }}>
      <div style={{
        background:T.card, borderRadius:22, width:460, padding:'32px',
        boxShadow:'0 24px 80px rgba(10,14,42,0.25)', border:`1.5px solid ${T.border}`,
        animation:'slideUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:26 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:T.goldDim, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {isEdit?'✏️':'🏢'}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:T.text }}>{isEdit?'Modifier le client':'Nouveau client'}</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{isEdit?`Modification de ${client.name}`:'Ajouter à la plateforme'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${T.border}`, background:'none', cursor:'pointer', fontSize:14, color:T.muted, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}
          >✕</button>
        </div>

        {errors.api && (
          <div style={{ background:T.redDim, border:`1px solid rgba(239,68,68,0.25)`, borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:13, color:T.red, fontWeight:600 }}>
            ⚠ {errors.api}
          </div>
        )}

        <Field fkey="name"  label="Nom du client *"  placeholder="Ex: DigiLab Solutions"/>
        <Field fkey="email" label="Email"             placeholder="contact@exemple.com" type="email"/>
        <Field fkey="phone" label="Téléphone"         placeholder="+216 XX XXX XXX"     type="tel"/>

        <div style={{ display:'flex', gap:10, marginTop:6 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:`1.5px solid ${T.border}`, background:'none', fontSize:13, fontWeight:700, color:T.muted, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.muted}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
          >Annuler</button>
          <button onClick={handle} disabled={saving} style={{
            flex:2, padding:'11px', borderRadius:10, border:'none',
            background:saving?T.muted:T.gold, fontSize:13, fontWeight:800, color:T.navy,
            cursor:saving?'not-allowed':'pointer', transition:'all 0.2s',
            boxShadow:saving?'none':'0 4px 14px rgba(245,166,35,0.30)',
          }}>
            {saving ? '⏳ Enregistrement...' : isEdit ? '✓ Enregistrer' : '+ Créer le client'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CARD client (vue grille)
══════════════════════════════════════════ */
function ClientCard({ client, onEdit, onDelete, idx }) {
  const [hov, setHov] = useState(false);
  const color = avatarColor(client.name);
  const cnt   = client._count?.contacts ?? client.contacts?.length ?? 0;
  const camps = client._count?.campagnes ?? client.campagnes?.length ?? 0;

  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background:T.card, borderRadius:18,
        border:`1.5px solid ${hov?T.gold:T.border}`,
        padding:'22px 22px 18px',
        boxShadow: hov ? '0 12px 36px rgba(245,166,35,0.13)' : '0 1px 8px rgba(10,14,42,0.06)',
        transition:'all 0.22s', transform: hov?'translateY(-3px)':'none',
        animation:`fadeUp 0.4s ease ${idx*60}ms both`,
        display:'flex', flexDirection:'column',
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div style={{
          width:50, height:50, borderRadius:14, flexShrink:0,
          background:`${color}15`, border:`1.5px solid ${color}30`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, fontWeight:800, color,
        }}>{initials(client.name)}</div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>onEdit(client)} style={{
            background:T.blueDim, color:T.blue, border:`1px solid rgba(59,130,246,0.2)`,
            padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700,
            cursor:'pointer', transition:'all 0.15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}
          >✏</button>
          <button onClick={()=>onDelete(client.id)} style={{
            background:T.redDim, color:T.red, border:`1px solid rgba(239,68,68,0.2)`,
            padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700,
            cursor:'pointer', transition:'all 0.15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}
          >✕</button>
        </div>
      </div>

      {/* Name */}
      <div style={{ fontSize:15, fontWeight:800, color:T.text, marginBottom:4 }}>{client.name}</div>

      {/* Email */}
      {client.email
        ? <a href={`mailto:${client.email}`} style={{ fontSize:12, color:T.blue, textDecoration:'none', fontWeight:500, marginBottom:4, display:'block' }}>{client.email}</a>
        : <span style={{ fontSize:12, color:T.muted, marginBottom:4, display:'block' }}>—</span>
      }
      {client.phone && <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>📱 {client.phone}</div>}

      {/* Divider */}
      <div style={{ height:1, background:T.border, margin:'12px 0 10px' }}/>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, color:T.muted }}>📅 {fmtDate(client.createdAt)}</span>
        <div style={{ display:'flex', gap:6 }}>
          {cnt > 0 && (
            <span style={{ background:T.goldDim, color:T.goldDark, border:`1px solid ${T.goldBorder}`, padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700 }}>
              👥 {cnt}
            </span>
          )}
          {camps > 0 && (
            <span style={{ background:T.blueDim, color:T.blue, border:`1px solid rgba(59,130,246,0.25)`, padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700 }}>
              📢 {camps}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE CLIENTS
══════════════════════════════════════════ */
export default function Clients() {
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'add' | client_obj
  const [search,     setSearch]     = useState('');
  const [view,       setView]       = useState('grid');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/clients');
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ? Ses données associées seront affectées.')) return;
    setDeletingId(id);
    try { await api.delete(`/api/clients/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalContacts = clients.reduce((a,c) => a+(c._count?.contacts||0), 0);
  const stats = [
    { label:'Total clients',  value:clients.length, color:T.gold,   dim:T.goldDim,   icon:'🏢' },
    { label:'Total contacts', value:totalContacts,  color:T.blue,   dim:T.blueDim,   icon:'👥' },
    { label:'Avec email',     value:clients.filter(c=>c.email).length, color:T.green, dim:T.greenDim, icon:'✉️' },
    { label:'Ce mois',        value:clients.filter(c => {
      const d = new Date(c.createdAt), n = new Date();
      return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
    }).length, color:T.purple, dim:T.purpleDim, icon:'📅' },
  ];

  return (
    <div style={{ background:T.bg, minHeight:'100vh', padding:'28px 32px', fontFamily:T.sans, color:T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .kcard  { transition:all 0.22s ease; }
        .kcard:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.14)!important; border-color:#f5a623!important; }
        .crow:hover td { background:rgba(245,166,35,0.03)!important; }
        .add-btn { transition:all 0.2s; }
        .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,166,35,0.35)!important; }
        input:focus, select:focus { outline:none; }
      `}</style>

      {/* Modal */}
      {modal && <ClientModal client={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={fetchAll}/>}

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, animation:'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
            <div style={{ width:4, height:24, background:`linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius:2 }}/>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Clients</h1>
          </div>
          <p style={{ color:T.muted, fontSize:13, margin:'0 0 0 14px' }}>
            {clients.length} client{clients.length>1?'s':''} enregistré{clients.length>1?'s':''}
          </p>
        </div>
        <button className="add-btn" onClick={()=>setModal('add')} style={{
          background:T.gold, color:T.navy, border:'none',
          padding:'11px 22px', borderRadius:11, fontSize:13, fontWeight:800,
          cursor:'pointer', boxShadow:'0 4px 14px rgba(245,166,35,0.25)',
          display:'flex', alignItems:'center', gap:7,
        }}>
          <span style={{ fontSize:16 }}>+</span> Ajouter client
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {stats.map((s,i) => (
          <div key={i} className="kcard" style={{
            background:T.card, borderRadius:14, border:`1.5px solid ${T.border}`,
            padding:'18px 20px', boxShadow:'0 1px 8px rgba(10,14,42,0.06)',
            display:'flex', alignItems:'center', gap:14,
            animation:`fadeUp 0.4s ease ${i*65}ms both`,
          }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:s.dim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1 }}>
                {loading ? <Skel w={40} h={24}/> : s.value}
              </div>
              <div style={{ fontSize:11, color:T.muted, marginTop:4, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background:T.card, borderRadius:14, border:`1.5px solid ${T.border}`,
        padding:'12px 16px', marginBottom:18,
        display:'flex', gap:12, alignItems:'center',
        boxShadow:'0 1px 8px rgba(10,14,42,0.05)',
        animation:'fadeUp 0.4s ease 280ms both',
      }}>
        <div style={{ position:'relative', flex:1 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:T.muted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un client..."
            style={{
              width:'100%', padding:'9px 14px 9px 36px',
              border:`1.5px solid ${T.border}`, borderRadius:10,
              fontSize:13, color:T.text, background:'#fafbfd',
              boxSizing:'border-box', fontFamily:T.sans, transition:'border-color .2s',
            }}
            onFocus={e=>e.target.style.borderColor=T.gold}
            onBlur={e=>e.target.style.borderColor=T.border}
          />
        </div>
        <span style={{ fontSize:12, color:T.muted }}>{filtered.length} résultat{filtered.length!==1?'s':''}</span>
        <div style={{ display:'flex', background:'#f4f6fb', borderRadius:9, padding:3, gap:2, border:`1.5px solid ${T.border}` }}>
          {[['grid','⊞ Grille'],['table','☰ Tableau']].map(([v,l]) => (
            <button key={v} onClick={()=>setView(v)} style={{
              padding:'6px 14px', borderRadius:7, border:'none', fontSize:12, fontWeight:700,
              background: view===v ? T.gold : 'none',
              color:      view===v ? T.navy : T.muted,
              cursor:'pointer', transition:'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Vue Grille ── */}
      {view==='grid' && (
        loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ background:T.card, borderRadius:18, border:`1.5px solid ${T.border}`, padding:'22px', boxShadow:'0 1px 8px rgba(10,14,42,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}><Skel w={50} h={50} r={14}/><Skel w={70} h={28} r={7}/></div>
                <Skel h={14} w="60%" /><div style={{ marginTop:8 }}><Skel h={11} w="80%" r={4}/></div>
                <div style={{ marginTop:16 }}><Skel h={1}/></div>
                <div style={{ marginTop:10, display:'flex', justifyContent:'space-between' }}><Skel h={10} w="40%" r={4}/><Skel h={22} w="30%" r={20}/></div>
              </div>
            ))}
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:T.muted, background:T.card, borderRadius:16, border:`1.5px solid ${T.border}` }}>
            <div style={{ fontSize:44, opacity:0.18, marginBottom:14 }}>🏢</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:6 }}>Aucun client trouvé</div>
            <div style={{ fontSize:13 }}>{search?`Aucun résultat pour "${search}"`:'Ajoutez votre premier client →'}</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {filtered.map((c,i) => (
              <ClientCard key={c.id} client={c} idx={i} onEdit={setModal} onDelete={handleDelete}/>
            ))}
          </div>
        )
      )}

      {/* ── Vue Tableau ── */}
      {view==='table' && (
        <div style={{ background:T.card, borderRadius:16, border:`1.5px solid ${T.border}`, boxShadow:'0 1px 8px rgba(10,14,42,0.05)', overflow:'hidden', animation:'fadeUp 0.4s ease 340ms both' }}>
          <div style={{ padding:'13px 20px', borderBottom:`1.5px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafbfd' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>Liste des clients</span>
              <span style={{ fontSize:11, fontWeight:700, background:T.goldDim, color:T.goldDark, border:`1px solid ${T.goldBorder}`, padding:'2px 9px', borderRadius:20 }}>{filtered.length}</span>
            </div>
          </div>
          {loading ? (
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
              {[...Array(5)].map((_,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <Skel w={42} h={42} r={12}/><div style={{ flex:1 }}><Skel h={13} w="35%"/></div>
                  <Skel w={150} h={12} r={4}/><Skel w={60} h={24} r={20}/><Skel w={100} h={30} r={8}/>
                </div>
              ))}
            </div>
          ) : filtered.length===0 ? (
            <div style={{ padding:'60px', textAlign:'center', color:T.muted }}>
              <div style={{ fontSize:44, opacity:0.18, marginBottom:14 }}>🏢</div>
              <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Aucun client trouvé</div>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:T.navy }}>
                  {['Client','Email','Téléphone','Contacts','Créé le','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i) => {
                  const color = avatarColor(c.name);
                  const cnt   = c._count?.contacts ?? 0;
                  return (
                    <tr key={c.id} className="crow" style={{ borderBottom:`1px solid ${T.border}`, transition:'background 0.15s', animation:`fadeUp 0.3s ease ${i*35}ms both` }}>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`${color}15`, border:`1.5px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color }}>{initials(c.name)}</div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{c.name}</div>
                        </div>
                      </td>
                      <td style={{ padding:'13px 18px' }}>
                        {c.email ? <a href={`mailto:${c.email}`} style={{ fontSize:13, color:T.blue, textDecoration:'none', fontWeight:500 }}>{c.email}</a> : <span style={{ color:T.muted, fontSize:13 }}>—</span>}
                      </td>
                      <td style={{ padding:'13px 18px', fontSize:13, color:T.muted }}>{c.phone||'—'}</td>
                      <td style={{ padding:'13px 18px' }}>
                        {cnt > 0
                          ? <span style={{ background:T.goldDim, color:T.goldDark, border:`1px solid ${T.goldBorder}`, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>👥 {cnt}</span>
                          : <span style={{ color:T.muted, fontSize:13 }}>0</span>
                        }
                      </td>
                      <td style={{ padding:'13px 18px', fontSize:13, color:T.muted }}>{fmtDate(c.createdAt)}</td>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex', gap:7 }}>
                          <button onClick={()=>setModal(c)} style={{ background:T.blueDim, color:T.blue, border:`1px solid rgba(59,130,246,0.2)`, padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
                            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                            onMouseLeave={e=>e.currentTarget.style.transform='none'}
                          >✏ Éditer</button>
                          <button onClick={()=>handleDelete(c.id)} disabled={deletingId===c.id} style={{ background:T.redDim, color:T.red, border:`1px solid rgba(239,68,68,0.2)`, padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', opacity:deletingId===c.id?0.5:1, transition:'all 0.15s' }}
                            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                            onMouseLeave={e=>e.currentTarget.style.transform='none'}
                          >{deletingId===c.id?'...':'✕ Suppr.'}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}