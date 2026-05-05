import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

const ROLE_STYLE = {
  admin:   { bg:'rgba(245,166,35,0.12)',  color:'#d97706', icon:'👑' },
  manager: { bg:'rgba(59,130,246,0.1)',   color:'#2563eb', icon:'🎯' },
  user:    { bg:'rgba(34,197,94,0.1)',    color:'#16a34a', icon:'👤' },
};

const AVATAR_COLORS = ['#f5a623','#3b82f6','#22c55e','#8b5cf6','#ec4899','#14b8a6'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];
const initials    = (name) => name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '??';

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/api/users', form);
      setForm({ name:'', email:'', password:'', role:'user' });
      setShowForm(false); fetchAll();
    } catch(err) { alert('Erreur: ' + (err.response?.data?.message || err.message)); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/api/users/${id}`); fetchAll(); }
    catch(err) { alert('Erreur suppression'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const admins   = users.filter(u => u.role === 'admin').length;
  const managers = users.filter(u => u.role === 'manager').length;
  const standard = users.filter(u => u.role === 'user').length;

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Utilisateurs</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Gérez les accès et rôles de la plateforme</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'9px 18px', borderRadius:9, fontSize:12,
          fontWeight:800, cursor:'pointer', fontFamily:DP.font
        }}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total',    value:users.length, color:DP.gold,  bg:DP.goldGlow,                  icon:'👥' },
          { label:'Admins',   value:admins,        color:'#d97706', bg:'rgba(245,166,35,0.12)',     icon:'👑' },
          { label:'Managers', value:managers,      color:DP.blue,  bg:'rgba(59,130,246,0.1)',       icon:'🎯' },
          { label:'Users',    value:standard,      color:DP.green, bg:'rgba(34,197,94,0.1)',        icon:'👤' },
        ].map(s => (
          <div key={s.label} style={{
            background:DP.card, border:`1px solid ${DP.border}`,
            borderLeft:`3px solid ${s.color}`,
            borderRadius:12, padding:'14px 16px',
            display:'flex', justifyContent:'space-between', alignItems:'center'
          }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
            </div>
            <div style={{ fontSize:20, opacity:0.6 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:22, marginBottom:18 }}>
          <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 16px' }}>Nouvel utilisateur</h3>
          <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {[
              { label:'Nom complet', key:'name',     type:'text',     placeholder:'Ex: Ahmed Ben Ali' },
              { label:'Email',       key:'email',    type:'email',    placeholder:'email@exemple.com' },
              { label:'Mot de passe',key:'password', type:'password', placeholder:'••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>{f.label}</label>
                <input
                  type={f.type} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({...form, [f.key]:e.target.value})} required
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Rôle</label>
              <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="user">👤 User</option>
                <option value="manager">🎯 Manager</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
              <button type="submit" disabled={loading} style={{
                background:DP.gold, color:DP.dark, border:'none',
                padding:'10px 22px', borderRadius:8, fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:DP.font
              }}>{loading ? 'Création...' : 'Créer'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background:'transparent', color:DP.muted, border:`1px solid ${DP.border}`,
                padding:'10px 18px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:DP.font
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des utilisateurs ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            style={{ padding:'7px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:12, fontFamily:DP.font, outline:'none', width:200 }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>👤</div>
            <p style={{ fontSize:13 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Utilisateur','Email','Rôle','Créé le','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10, color:DP.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const role = ROLE_STYLE[u.role] || ROLE_STYLE.user;
                const col  = avatarColor(u.name);
                return (
                  <tr key={u.id}
                    onMouseEnter={() => setHoveredRow(u.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom:'1px solid #f6f3ee', background:hoveredRow===u.id?'#faf8f4':'transparent', transition:'background 0.15s' }}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:34, height:34, borderRadius:10,
                          background:`${col}18`, border:`1px solid ${col}30`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:800, color:col, flexShrink:0
                        }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:DP.text }}>{u.name}</div>
                          <div style={{ fontSize:10, color:DP.muted }}>ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:12, color:DP.muted }}>{u.email}</td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ background:role.bg, color:role.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                        {role.icon} {u.role}
                      </span>
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:DP.muted }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <button onClick={() => handleDelete(u.id)} style={{
                        background:'rgba(239,68,68,0.08)', color:DP.red,
                        border:'1px solid rgba(239,68,68,0.2)',
                        padding:'5px 10px', borderRadius:6, fontSize:11,
                        fontWeight:700, cursor:'pointer', fontFamily:DP.font
                      }}>Supprimer</button>
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