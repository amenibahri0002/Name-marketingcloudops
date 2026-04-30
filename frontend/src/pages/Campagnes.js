import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

const STATUS_STYLE = {
  sent:      { background:'rgba(34,197,94,0.1)',   color:'#16a34a' },
  scheduled: { background:'rgba(59,130,246,0.1)',  color:'#2563eb' },
  draft:     { background:'rgba(245,166,35,0.12)', color:'#d97706' },
};

const TYPE_STYLE = {
  email: { background:'rgba(59,130,246,0.1)',  color:DP.blue   },
  sms:   { background:'rgba(34,197,94,0.1)',   color:'#16a34a' },
  push:  { background:'rgba(245,166,35,0.12)', color:'#d97706' },
};

const TYPE_ICON = { email:'📧', sms:'📱', push:'🔔' };

export default function Campagnes() {
  const [campagnes, setCampagnes]         = useState([]);
  const [clients,   setClients]           = useState([]);
  const [showForm,  setShowForm]          = useState(false);
  const [loading,   setLoading]           = useState(false);
  const [hoveredRow,setHoveredRow]        = useState(null);
  const [form, setForm] = useState({ title:'', type:'email', clientId:'', dateScheduled:'' });

  const fetchAll = async () => {
    try {
      const [c, cl] = await Promise.all([api.get('/api/campagnes'), api.get('/api/clients')]);
      setCampagnes(Array.isArray(c.data) ? c.data : c.data.data || []);
      setClients(cl.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/api/campagnes', form);
      setForm({ title:'', type:'email', clientId:'', dateScheduled:'' });
      setShowForm(false); fetchAll();
    } catch(err) { alert('Erreur: ' + err.message); }
    setLoading(false);
  };

  const handleSend = async (id) => {
    try { await api.post(`/api/emails/send/${id}`); fetchAll(); }
    catch(err) { alert('Erreur envoi'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try { await api.delete(`/api/campagnes/${id}`); fetchAll(); }
    catch(err) { alert('Erreur suppression'); }
  };

  const sent      = campagnes.filter(c => c.status === 'sent').length;
  const scheduled = campagnes.filter(c => c.status === 'scheduled').length;
  const draft     = campagnes.filter(c => c.status === 'draft').length;

  return (
    <div style={{ fontFamily: DP.font, color: DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Campagnes</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Gérez et suivez toutes vos campagnes marketing</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'9px 18px', borderRadius:9, fontSize:12,
          fontWeight:800, cursor:'pointer', fontFamily:DP.font
        }}>
          + Nouvelle campagne
        </button>
      </div>

      {/* Stats mini */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total',      value:campagnes.length, color:DP.gold,  bg:DP.goldGlow },
          { label:'Envoyées',   value:sent,             color:DP.green, bg:'rgba(34,197,94,0.1)' },
          { label:'Planifiées', value:scheduled,        color:DP.blue,  bg:'rgba(59,130,246,0.1)' },
          { label:'Brouillons', value:draft,            color:DP.muted, bg:'rgba(156,143,122,0.1)' },
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
        <div style={{
          background:DP.card, border:`1px solid ${DP.border}`,
          borderRadius:14, padding:22, marginBottom:18
        }}>
          <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 16px', color:DP.text }}>
            Nouvelle campagne
          </h3>
          <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Titre</label>
              <input value={form.title} onChange={e => setForm({...form, title:e.target.value})} required
                placeholder="Nom de la campagne"
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="email">📧 Email</option>
                <option value="sms">📱 SMS</option>
                <option value="push">🔔 Push</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Client</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId:e.target.value})} required
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}>
                <option value="">-- Sélectionner --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Date planifiée</label>
              <input type="datetime-local" value={form.dateScheduled} onChange={e => setForm({...form, dateScheduled:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }} />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10 }}>
              <button type="submit" disabled={loading} style={{
                background:DP.gold, color:DP.dark, border:'none',
                padding:'10px 22px', borderRadius:8, fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:DP.font
              }}>
                {loading ? 'Création...' : 'Créer la campagne'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background:'transparent', color:DP.muted,
                border:`1px solid ${DP.border}`, padding:'10px 18px',
                borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:DP.font
              }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des campagnes</span>
          <span style={{ fontSize:11, color:DP.muted }}>{campagnes.length} campagne(s)</span>
        </div>

        {campagnes.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📢</div>
            <p style={{ fontSize:13 }}>Aucune campagne — créez votre première !</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Titre','Canal','Client','Statut','Date','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10, color:DP.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campagnes.map(c => {
                const sc  = STATUS_STYLE[c.status] || STATUS_STYLE.draft;
                const tc  = TYPE_STYLE[c.type?.toLowerCase()] || {};
                const ico = TYPE_ICON[c.type?.toLowerCase()] || '📄';
                return (
                  <tr key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom:`1px solid #f6f3ee`, background:hoveredRow===c.id?'#faf8f4':'transparent', transition:'background 0.15s' }}>
                    <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600, color:DP.text }}>{c.title}</td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ ...tc, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                        {ico} {c.type}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:DP.muted }}>{c.client?.name || '—'}</td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ ...sc, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{c.status}</span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:11, color:DP.muted }}>
                      {c.dateScheduled ? new Date(c.dateScheduled).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {c.status !== 'sent' && (
                          <button onClick={() => handleSend(c.id)} style={{
                            background:DP.goldGlow, color:'#d97706',
                            border:'1px solid rgba(245,166,35,0.3)',
                            padding:'5px 10px', borderRadius:6, fontSize:11,
                            fontWeight:700, cursor:'pointer', fontFamily:DP.font
                          }}>Envoyer</button>
                        )}
                        <button onClick={() => handleDelete(c.id)} style={{
                          background:'rgba(239,68,68,0.08)', color:DP.red,
                          border:'1px solid rgba(239,68,68,0.2)',
                          padding:'5px 10px', borderRadius:6, fontSize:11,
                          fontWeight:700, cursor:'pointer', fontFamily:DP.font
                        }}>Supprimer</button>
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