import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

export default function Clients() {
  const [clients,    setClients]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [form, setForm] = useState({ name:'', email:'' });

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/clients');
      setClients(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/clients', form);
      setForm({ name:'', email:'' });
      setShowForm(false); fetchAll();
    } catch(err) { alert('Erreur: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try { await api.delete(`/api/clients/${id}`); fetchAll(); }
    catch(err) { alert('Erreur suppression'); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '??';
  const avatarColors = ['#f5a623','#3b82f6','#22c55e','#8b5cf6','#ec4899','#14b8a6'];
  const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Clients</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Gérez vos clients et tenants</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'9px 18px', borderRadius:9, fontSize:12,
          fontWeight:800, cursor:'pointer', fontFamily:DP.font
        }}>
          + Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total clients',  value:clients.length,  color:DP.gold,  bg:DP.goldGlow },
          { label:'Actifs',         value:clients.length,  color:DP.green, bg:'rgba(34,197,94,0.1)' },
          { label:'Ce mois',        value:clients.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length, color:DP.blue, bg:'rgba(59,130,246,0.1)' },
        ].map(s => (
          <div key={s.label} style={{
            background:DP.card, border:`1px solid ${DP.border}`,
            borderLeft:`3px solid ${s.color}`,
            borderRadius:12, padding:'14px 16px',
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:22, marginBottom:18 }}>
          <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 16px' }}>Nouveau client</h3>
          <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Nom</label>
              <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required
                placeholder="Nom de l'entreprise"
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required
                placeholder="contact@entreprise.com"
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }} />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
              <button type="submit" style={{
                background:DP.gold, color:DP.dark, border:'none',
                padding:'10px 22px', borderRadius:8, fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:DP.font
              }}>Créer</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background:'transparent', color:DP.muted, border:`1px solid ${DP.border}`,
                padding:'10px 18px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:DP.font
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Cards */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des clients ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            style={{ padding:'7px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:12, fontFamily:DP.font, outline:'none', width:200 }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🏢</div>
            <p style={{ fontSize:13 }}>Aucun client trouvé</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Client','Email','Créé le','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10, color:DP.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const color = avatarColor(c.name);
                return (
                  <tr key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom:`1px solid #f6f3ee`, background:hoveredRow===c.id?'#faf8f4':'transparent', transition:'background 0.15s' }}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:36, height:36, borderRadius:10,
                          background:`${color}18`, border:`1px solid ${color}30`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:800, color, flexShrink:0
                        }}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:DP.text }}>{c.name}</div>
                          <div style={{ fontSize:10, color:DP.muted, marginTop:1 }}>Tenant #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:12, color:DP.muted }}>{c.email}</td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:DP.muted }}>
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <button onClick={() => handleDelete(c.id)} style={{
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