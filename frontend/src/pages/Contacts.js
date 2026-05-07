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
  const [hoveredCard, setHoveredCard] = useState(null);
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
  const avatarColors = [DP.gold, DP.blue, DP.green, '#8b5cf6', '#ec4899'];
  const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, margin:'0 0 6px' }}>Contacts</h1>
          <p style={{ color:DP.muted, fontSize:13, margin:0 }}>Gérez votre base de contacts</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          style={{
            background:DP.gold, 
            color:DP.dark, 
            border:'none',
            padding:'11px 22px', 
            borderRadius:10, 
            fontSize:13,
            fontWeight:800, 
            cursor:'pointer', 
            fontFamily:DP.font,
            boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          + Ajouter contact
        </button>
      </div>

      {/* Stats Cards Améliorées */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16, marginBottom:24 }}>
        {[
          { label:'Total contacts',  value:contacts.length, color:DP.gold,  icon:'👥' },
          { label:'Avec email',      value:contacts.filter(c=>c.email).length, color:DP.blue,  icon:'✉️' },
          { label:'Avec téléphone',  value:contacts.filter(c=>c.phone).length, color:DP.green, icon:'📱' },
        ].map((s, i) => (
          <div 
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background:DP.card, 
              border:`1px solid ${DP.border}`,
              borderLeft:`4px solid ${s.color}`,
              borderRadius:14, 
              padding:'1.4rem 1.5rem',
              transition: 'all 0.3s',
              transform: hoveredCard === i ? 'translateY(-5px)' : 'none',
              boxShadow: hoveredCard === i ? '0 12px 25px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <div style={{ fontSize:11, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
              {s.label}
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un contact ou email..."
          style={{
            width: '100%',
            maxWidth: 460,
            padding: '11px 14px 11px 42px',
            border: `1.5px solid ${DP.border}`,
            borderRadius: 10,
            fontSize: 13.5,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = DP.gold}
          onBlur={e => e.target.style.borderColor = DP.border}
        />
      </div>

      {/* Table */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:800, color:DP.text }}>Liste des contacts ({filtered.length})</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:42, marginBottom:12 }}>👥</div>
            <p>Aucun contact trouvé</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Contact','Email','Téléphone','Client','Actions'].map(h => (
                  <th key={h} style={{ 
                    padding:'12px 16px', 
                    textAlign:'left', 
                    fontSize:10.5, 
                    color:DP.muted, 
                    fontWeight:700, 
                    textTransform:'uppercase', 
                    letterSpacing:'1.1px',
                    borderBottom:`1px solid ${DP.border}` 
                  }}>{h}</th>
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
                    style={{ 
                      borderBottom:`1px solid #f6f3ee`, 
                      background:hoveredRow===c.id ? '#faf8f4' : 'transparent', 
                      transition:'background 0.2s' 
                    }}>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{
                          width:42, height:42, borderRadius:12,
                          background:`${color}18`, border:`1px solid ${color}35`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:800, color, flexShrink:0
                        }}>
                          {initials(c.name)}
                        </div>
                        <div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:DP.muted }}>{c.email || '—'}</td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:DP.muted }}>{c.phone || '—'}</td>
                    <td style={{ padding:'14px 16px' }}>
                      {c.client ? (
                        <span style={{ background:DP.goldGlow, color:'#d97706', padding:'4px 11px', borderRadius:20, fontSize:11.5, fontWeight:700 }}>
                          {c.client.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background:'rgba(239,68,68,0.08)', 
                          color:DP.red,
                          border:'1px solid rgba(239,68,68,0.2)',
                          padding:'6px 13px', 
                          borderRadius:7, 
                          fontSize:12,
                          fontWeight:700, 
                          cursor:'pointer'
                        }}
                      >
                        Supprimer
                      </button>
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