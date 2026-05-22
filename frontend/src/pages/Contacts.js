import React, { useState, useEffect } from 'react';
import api from '../api';

const T = {
  bg:       '#f0f2f8',
  card:     '#ffffff',
  navy:     '#16120d',
  navyMid:  '#1e2a3a',
  gold:     '#f5a623',
  goldDark: '#c8831a',
  goldDim:  'rgba(245,166,35,0.10)',
  goldBorder:'rgba(245,166,35,0.28)',
  border:   '#e4e9f2',
  text:     '#1a1f3c',
  muted:    '#7a8599',
  blue:     '#3b82f6',
  blueDim:  'rgba(59,130,246,0.10)',
  green:    '#22c55e',
  greenDim: 'rgba(34,197,94,0.10)',
  red:      '#ef4444',
  redDim:   'rgba(239,68,68,0.10)',
  purple:   '#8b5cf6',
  purpleDim:'rgba(139,92,246,0.10)',
  sans:     "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

const AVATAR_COLORS = [T.gold, T.blue, T.green, T.purple, '#ec4899', '#14b8a6'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];
const initials = name => name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '??';

/* ── Skeleton ── */
function Skel({ w='100%', h=16, r=6 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize:'500px 100%', animation:'shimmer 1.4s infinite linear' }}/>;
}

/* ── Modal Ajout / Édition ── */
function ContactModal({ clients, contact, onClose, onSave }) {
  const isEdit = !!contact;
  const [form, setForm] = useState({
    name:     contact?.name     || '',
    email:    contact?.email    || '',
    phone:    contact?.phone    || '',
    clientId: contact?.clientId || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) await api.put(`/api/contacts/${contact.id}`, form);
      else        await api.post('/api/contacts', form);
      onSave();
      onClose();
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const Field = ({ fkey, label, placeholder, type='text' }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ fontSize:11, fontWeight:700, color:T.text, display:'block', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[fkey]}
        onChange={e => { setForm(p=>({...p,[fkey]:e.target.value})); setErrors(p=>({...p,[fkey]:''})); }}
        style={{
          width:'100%', padding:'10px 14px',
          border:`1.5px solid ${errors[fkey] ? T.red : T.border}`, borderRadius:10,
          fontSize:13, color:T.text, background:errors[fkey]?'rgba(239,68,68,0.03)':'#fafbfd',
          boxSizing:'border-box', fontFamily:T.sans, outline:'none',
          transition:'border-color .2s, box-shadow .2s',
        }}
        onFocus={e => e.target.style.borderColor = errors[fkey] ? T.red : T.gold}
        onBlur={e  => e.target.style.borderColor = errors[fkey] ? T.red : T.border}
      />
      {errors[fkey] && <div style={{ fontSize:11, color:T.red, marginTop:4 }}>⚠ {errors[fkey]}</div>}
    </div>
  );

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(10,14,42,0.55)', backdropFilter:'blur(5px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      animation:'fadeIn 0.2s ease',
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:T.card, borderRadius:22, width:480, padding:'32px',
        boxShadow:'0 24px 80px rgba(10,14,42,0.25)',
        border:`1.5px solid ${T.border}`,
        animation:'slideUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:T.goldDim, border:`1px solid ${T.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>
                {isEdit ? '✏️' : '👤'}
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:T.text }}>
                {isEdit ? 'Modifier le contact' : 'Nouveau contact'}
              </div>
            </div>
            <div style={{ fontSize:12, color:T.muted, marginLeft:46 }}>
              {isEdit ? `Modification de ${contact.name}` : 'Remplissez les informations'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:`1.5px solid ${T.border}`,
            background:'none', cursor:'pointer', fontSize:16, color:T.muted,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.red; e.currentTarget.style.color=T.red; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}
          >✕</button>
        </div>

        <Field fkey="name"  label="Nom complet *" placeholder="Ex: Ameni Bahri"/>
        <Field fkey="email" label="Email"          placeholder="email@exemple.com" type="email"/>
        <Field fkey="phone" label="Téléphone"      placeholder="+216 XX XXX XXX" type="tel"/>

        {/* Client select */}
        <div style={{ marginBottom:28 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.text, display:'block', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>
            Client associé
          </label>
          <div style={{ position:'relative' }}>
            <select
              value={form.clientId}
              onChange={e => setForm(p=>({...p,clientId:e.target.value}))}
              style={{
                width:'100%', padding:'10px 36px 10px 14px',
                border:`1.5px solid ${T.border}`, borderRadius:10,
                fontSize:13, color:T.text, background:'#fafbfd',
                boxSizing:'border-box', fontFamily:T.sans, outline:'none',
                appearance:'none', cursor:'pointer',
              }}
              onFocus={e => e.target.style.borderColor=T.gold}
              onBlur={e  => e.target.style.borderColor=T.border}
            >
              <option value="">— Aucun client —</option>
              {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </select>
            <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:11, color:T.muted }}>▾</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px', borderRadius:10,
            border:`1.5px solid ${T.border}`, background:'none',
            fontSize:13, fontWeight:700, color:T.muted, cursor:'pointer',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor=T.muted}
            onMouseLeave={e => e.currentTarget.style.borderColor=T.border}
          >Annuler</button>
          <button onClick={handle} disabled={saving} style={{
            flex:2, padding:'11px', borderRadius:10, border:'none',
            background: saving ? T.muted : T.gold,
            fontSize:13, fontWeight:800, color:T.navy,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
            transition:'all 0.2s',
          }}>
            {saving ? '⏳ Enregistrement...' : isEdit ? '✓ Enregistrer' : '+ Ajouter le contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE CONTACTS
══════════════════════════════════════════ */
export default function Contacts() {
  const [contacts,   setContacts]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'add' | contact_obj
  const [search,     setSearch]     = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [sortBy,     setSortBy]     = useState('name');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [co, cl] = await Promise.all([api.get('/api/contacts'), api.get('/api/clients')]);
      setContacts(Array.isArray(co.data) ? co.data : co.data?.data || []);
      setClients(Array.isArray(cl.data) ? cl.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce contact ?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/contacts/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  /* Filtres + tri */
  const filtered = contacts
    .filter(c =>
      (c.name?.toLowerCase().includes(search.toLowerCase()) ||
       c.email?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterClient || String(c.clientId) === filterClient || c.client?.id === Number(filterClient))
    )
    .sort((a,b) => {
      if (sortBy==='name')  return a.name?.localeCompare(b.name||'');
      if (sortBy==='email') return (a.email||'').localeCompare(b.email||'');
      return 0;
    });

  const stats = [
    { label:'Total',     value:contacts.length,                          color:T.gold,   dim:T.goldDim,   icon:'👥' },
    { label:'Avec email',value:contacts.filter(c=>c.email).length,       color:T.blue,   dim:T.blueDim,   icon:'✉️' },
    { label:'Avec tél.', value:contacts.filter(c=>c.phone).length,       color:T.green,  dim:T.greenDim,  icon:'📱' },
    { label:'Avec client',value:contacts.filter(c=>c.clientId).length,   color:T.purple, dim:T.purpleDim, icon:'🏢' },
  ];

  return (
    <div style={{ background:T.bg, minHeight:'100vh', padding:'28px 32px', fontFamily:T.sans, color:T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes shimmer  { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .kcard { transition:all 0.22s ease; cursor:default; }
        .kcard:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(245,166,35,0.14) !important; border-color:#f5a623 !important; }
        .crow:hover td { background:rgba(245,166,35,0.03) !important; }
        .crow { transition:background 0.15s; }
        .act-btn { transition:all 0.15s; cursor:pointer; }
        .act-btn:hover { transform:scale(1.05); }
        .add-btn { transition:all 0.2s; }
        .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,166,35,0.35) !important; }
        input:focus, select:focus { outline:none; }
      `}</style>

      {/* Modal */}
      {modal && (
        <ContactModal
          clients={clients}
          contact={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={fetchAll}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, animation:'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
            <div style={{ width:4, height:24, background:`linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius:2 }}/>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Contacts</h1>
          </div>
          <p style={{ color:T.muted, fontSize:13, margin:'0 0 0 14px' }}>
            {contacts.length} contact{contacts.length>1?'s':''} enregistré{contacts.length>1?'s':''}
          </p>
        </div>
        <button className="add-btn" onClick={() => setModal('add')} style={{
          background:T.gold, color:T.navy, border:'none',
          padding:'11px 22px', borderRadius:11, fontSize:13, fontWeight:800,
          cursor:'pointer', boxShadow:'0 4px 14px rgba(245,166,35,0.25)',
          display:'flex', alignItems:'center', gap:7,
        }}>
          <span style={{ fontSize:16 }}>+</span> Ajouter contact
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
        padding:'13px 18px', marginBottom:18,
        display:'flex', gap:12, alignItems:'center', flexWrap:'wrap',
        boxShadow:'0 1px 8px rgba(10,14,42,0.05)',
        animation:'fadeUp 0.4s ease 280ms both',
      }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:T.muted }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher nom ou email..."
            style={{
              width:'100%', padding:'9px 14px 9px 36px',
              border:`1.5px solid ${T.border}`, borderRadius:10,
              fontSize:13, color:T.text, background:'#fafbfd',
              boxSizing:'border-box', fontFamily:T.sans, transition:'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor=T.gold}
            onBlur={e  => e.target.style.borderColor=T.border}
          />
        </div>

        {/* Filter client */}
        <div style={{ position:'relative', minWidth:160 }}>
          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            style={{
              padding:'9px 32px 9px 14px', border:`1.5px solid ${T.border}`, borderRadius:10,
              fontSize:13, color:T.text, background:'#fafbfd',
              fontFamily:T.sans, appearance:'none', cursor:'pointer',
              transition:'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor=T.gold}
            onBlur={e  => e.target.style.borderColor=T.border}
          >
            <option value="">Tous les clients</option>
            {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:11, color:T.muted }}>▾</span>
        </div>

        {/* Sort */}
        <div style={{ display:'flex', gap:6 }}>
          {[['name','Nom'],['email','Email']].map(([v,l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600,
              border:`1.5px solid ${sortBy===v ? T.gold : T.border}`,
              background: sortBy===v ? T.goldDim : 'none',
              color: sortBy===v ? T.goldDark : T.muted,
              cursor:'pointer', transition:'all 0.15s',
            }}>{l}</button>
          ))}
        </div>

        <span style={{ fontSize:12, color:T.muted, marginLeft:'auto' }}>
          {filtered.length} résultat{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{
        background:T.card, borderRadius:16, border:`1.5px solid ${T.border}`,
        boxShadow:'0 1px 8px rgba(10,14,42,0.06)', overflow:'hidden',
        animation:'fadeUp 0.4s ease 340ms both',
      }}>
        {/* Table header bar */}
        <div style={{
          padding:'13px 20px', borderBottom:`1.5px solid ${T.border}`,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'#fafbfd',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:700 }}>Liste des contacts</span>
            <span style={{
              fontSize:11, fontWeight:700,
              background:T.goldDim, color:T.goldDark,
              border:`1px solid ${T.goldBorder}`,
              padding:'2px 9px', borderRadius:20,
            }}>{filtered.length}</span>
          </div>
          {search && <span style={{ fontSize:12, color:T.muted }}>Résultats pour "<b>{search}</b>"</span>}
        </div>

        {loading ? (
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
            {[...Array(5)].map((_,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <Skel w={42} h={42} r={12}/>
                <div style={{ flex:1 }}><Skel h={13} w="40%"/><div style={{ marginTop:5 }}><Skel h={10} w="55%" r={4}/></div></div>
                <Skel w={120} h={12} r={4}/>
                <Skel w={90} h={12} r={4}/>
                <Skel w={110} h={30} r={8}/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px 20px', textAlign:'center', color:T.muted }}>
            <div style={{ fontSize:44, opacity:0.18, marginBottom:14 }}>👥</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color:T.text }}>Aucun contact trouvé</div>
            <div style={{ fontSize:13 }}>
              {search ? `Aucun résultat pour "${search}"` : 'Ajoutez votre premier contact →'}
            </div>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:T.navy }}>
                {['Contact','Email','Téléphone','Client associé','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.gold }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c,i) => {
                const ac = avatarColor(c.name);
                return (
                  <tr key={c.id} className="crow" style={{ borderBottom:`1px solid ${T.border}`, animation:`fadeUp 0.3s ease ${i*35}ms both` }}>
                    {/* Contact */}
                    <td style={{ padding:'13px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{
                          width:40, height:40, borderRadius:11, flexShrink:0,
                          background:`${ac}18`, border:`1.5px solid ${ac}35`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:800, color:ac,
                        }}>{initials(c.name)}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{c.name}</div>
                          <div style={{ fontSize:11, color:T.muted }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding:'13px 18px' }}>
                      {c.email
                        ? <a href={`mailto:${c.email}`} style={{ fontSize:13, color:T.blue, textDecoration:'none', fontWeight:500 }}>{c.email}</a>
                        : <span style={{ fontSize:13, color:T.muted }}>—</span>
                      }
                    </td>
                    {/* Phone */}
                    <td style={{ padding:'13px 18px', fontSize:13, color:T.muted, fontWeight:500 }}>
                      {c.phone || '—'}
                    </td>
                    {/* Client */}
                    <td style={{ padding:'13px 18px' }}>
                      {c.client
                        ? <span style={{ background:T.goldDim, color:T.goldDark, border:`1px solid ${T.goldBorder}`, padding:'3px 11px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                            🏢 {c.client.name}
                          </span>
                        : <span style={{ fontSize:13, color:T.muted }}>—</span>
                      }
                    </td>
                    {/* Actions */}
                    <td style={{ padding:'13px 18px' }}>
                      <div style={{ display:'flex', gap:7 }}>
                        <button className="act-btn"
                          onClick={() => setModal(c)}
                          style={{
                            background:T.blueDim, color:T.blue,
                            border:`1px solid rgba(59,130,246,0.2)`,
                            padding:'6px 13px', borderRadius:8,
                            fontSize:12, fontWeight:700,
                          }}>✏ Éditer</button>
                        <button className="act-btn"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId===c.id}
                          style={{
                            background:T.redDim, color:T.red,
                            border:`1px solid rgba(239,68,68,0.2)`,
                            padding:'6px 13px', borderRadius:8,
                            fontSize:12, fontWeight:700,
                            opacity: deletingId===c.id ? 0.5 : 1,
                          }}>
                          {deletingId===c.id ? '...' : '✕ Suppr.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}