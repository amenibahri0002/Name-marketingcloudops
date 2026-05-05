import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

const CRIT_LABELS = {
  email:    { label:'A un email',    icon:'📧', color:DP.blue  },
  phone:    { label:'A un tél.',     icon:'📱', color:DP.green },
  clientId: { label:'Par client',    icon:'🏢', color:'#8b5cf6'},
  all:      { label:'Tous',          icon:'👥', color:DP.gold  },
};

export default function Segments() {
  const [segments,   setSegments]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [form, setForm] = useState({ name:'', criteria:'all', clientId:'' });

  const fetchAll = async () => {
    try {
      const [s, cl] = await Promise.all([api.get('/api/segments'), api.get('/api/clients')]);
      setSegments(Array.isArray(s.data) ? s.data : s.data.data || []);
      setClients(cl.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/segments', form);
      setForm({ name:'', criteria:'all', clientId:'' });
      setShowForm(false); fetchAll();
    } catch(err) { alert('Erreur: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce segment ?')) return;
    try { await api.delete(`/api/segments/${id}`); fetchAll(); }
    catch(err) { alert('Erreur suppression'); }
  };

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Segments</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Créez des groupes de contacts ciblés</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'9px 18px', borderRadius:9, fontSize:12,
          fontWeight:800, cursor:'pointer', fontFamily:DP.font
        }}>
          + Nouveau segment
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total segments', value:segments.length,                                                    color:DP.gold,  bg:DP.goldGlow },
          { label:'Contacts couverts', value:segments.reduce((a,s)=>a+(s.contactCount||0),0),                color:DP.blue,  bg:'rgba(59,130,246,0.1)' },
          { label:'Ce mois',        value:segments.filter(s=>new Date(s.createdAt).getMonth()===new Date().getMonth()).length, color:DP.green, bg:'rgba(34,197,94,0.1)' },
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
          <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 16px' }}>Nouveau segment</h3>
          <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Nom du segment</label>
              <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required
                placeholder="Ex: Contacts VIP"
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Critère</label>
              <select value={form.criteria} onChange={e => setForm({...form, criteria:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="all">👥 Tous les contacts</option>
                <option value="email">📧 A un email</option>
                <option value="phone">📱 A un téléphone</option>
                <option value="clientId">🏢 Par client</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Client (optionnel)</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="">-- Tous les clients --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
              <button type="submit" style={{
                background:DP.gold, color:DP.dark, border:'none',
                padding:'10px 22px', borderRadius:8, fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:DP.font
              }}>Créer le segment</button>
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
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des segments</span>
          <span style={{ fontSize:11, color:DP.muted }}>{segments.length} segment(s)</span>
        </div>

        {segments.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🎯</div>
            <p style={{ fontSize:13 }}>Aucun segment — créez votre premier !</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Nom','Critère','Client','Contacts','Créé le','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10, color:DP.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segments.map(s => {
                const crit = CRIT_LABELS[s.criteria] || CRIT_LABELS.all;
                return (
                  <tr key={s.id}
                    onMouseEnter={() => setHoveredRow(s.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom:'1px solid #f6f3ee', background:hoveredRow===s.id?'#faf8f4':'transparent', transition:'background 0.15s' }}>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{
                          width:28, height:28, borderRadius:7,
                          background:DP.goldGlow, border:`1px solid rgba(245,166,35,0.25)`,
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:13
                        }}>🎯</div>
                        <span style={{ fontSize:13, fontWeight:700, color:DP.text }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{
                        background:`${crit.color}18`, color:crit.color,
                        padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700
                      }}>
                        {crit.icon} {crit.label}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:DP.muted }}>
                      {s.client?.name || '—'}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{
                        background:'rgba(59,130,246,0.1)', color:DP.blue,
                        padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700
                      }}>
                        {s.contactCount || 0} contacts
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:11, color:DP.muted }}>
                      {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <button onClick={() => handleDelete(s.id)} style={{
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