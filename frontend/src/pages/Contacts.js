import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

export default function Contacts() {
  const [contacts,   setContacts]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', clientId:'' });

  const fetchAll = async () => {
    try {
      const [co, cl] = await Promise.all([api.get('/api/contacts'), api.get('/api/clients')]);
      setContacts(Array.isArray(co.data) ? co.data : co.data.data || []);
      setClients(cl.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contacts', form);
      setForm({ name:'', email:'', phone:'', clientId:'' });
      setShowForm(false); fetchAll();
    } catch(err) { alert('Erreur: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce contact ?')) return;
    try { await api.delete(`/api/contacts/${id}`); fetchAll(); }
    catch(err) { alert('Erreur suppression'); }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '??';
  const avatarColor = (name) => {
    const colors = [DP.gold, DP.blue, DP.green, '#8b5cf6', '#ec4899'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Contacts</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Gérez votre base de contacts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'9px 18px', borderRadius:9, fontSize:12,
          fontWeight:800, cursor:'pointer', fontFamily:DP.font
        }}>
          + Ajouter contact
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total contacts',  value:contacts.length,                           color:DP.gold,  bg:DP.goldGlow },
          { label:'Avec email',      value:contacts.filter(c=>c.email).length,        color:DP.blue,  bg:'rgba(59,130,246,0.1)' },
          { label:'Avec téléphone',  value:contacts.filter(c=>c.phone).length,        color:DP.green, bg:'rgba(34,197,94,0.1)' },
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
          <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 16px' }}>Nouveau contact</h3>
          <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {[
              { label:'Nom complet', key:'name',  type:'text',  placeholder:'Ex: Ahmed Ben Ali' },
              { label:'Email',       key:'email', type:'email', placeholder:'email@exemple.com' },
              { label:'Téléphone',   key:'phone', type:'tel',   placeholder:'+216 XX XXX XXX' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>{f.label}</label>
                <input
                  type={f.type} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({...form, [f.key]:e.target.value})}
                  required={f.key !== 'phone'}
                  style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Client</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="">-- Sélectionner --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
              <button type="submit" style={{
                background:DP.gold, color:DP.dark, border:'none',
                padding:'10px 22px', borderRadius:8, fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:DP.font
              }}>Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background:'transparent', color:DP.muted, border:`1px solid ${DP.border}`,
                padding:'10px 18px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:DP.font
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des contacts ({filtered.length})</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            style={{ padding:'7px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:12, fontFamily:DP.font, outline:'none', width:200 }}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
            <p style={{ fontSize:13 }}>Aucun contact trouvé</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Contact','Email','Téléphone','Client','Actions'].map(h => (
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
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%',
                          background:`${color}20`, border:`1px solid ${color}40`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:800, color, flexShrink:0
                        }}>
                          {initials(c.name)}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:DP.text }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:DP.muted }}>{c.email}</td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:DP.muted }}>{c.phone || '—'}</td>
                    <td style={{ padding:'11px 14px' }}>
                      {c.client ? (
                        <span style={{ background:DP.goldGlow, color:'#d97706', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                          {c.client.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
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