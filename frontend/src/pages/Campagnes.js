import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:    '#f5a623', goldDark:'#d4881a', goldGlow:'rgba(245,166,35,0.12)',
  dark:    '#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:  '#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:    '#3b82f6', green:'#22c55e', red:'#ef4444',
  font:    "'Montserrat','Open Sans',sans-serif",
};

const STATUS_STYLE = {
  sent:      { background:'rgba(34,197,94,0.1)',   color:'#16a34a', label:'Envoyée'   },
  scheduled: { background:'rgba(59,130,246,0.1)',  color:'#2563eb', label:'Planifiée' },
  draft:     { background:'rgba(245,166,35,0.12)', color:'#d97706', label:'Brouillon' },
};

const TYPE_STYLE = {
  email: { background:'rgba(59,130,246,0.1)',  color:DP.blue,   label:'📧 Email' },
  sms:   { background:'rgba(34,197,94,0.1)',   color:'#16a34a', label:'📱 SMS'   },
  push:  { background:'rgba(245,166,35,0.12)', color:'#d97706', label:'🔔 Push'  },
};

function Pill({ text, style }) {
  return (
    <span style={{ ...style, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, display:'inline-block' }}>
      {text}
    </span>
  );
}

function InputField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1.5px', display:'block', marginBottom:6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'10px 13px',
  border:`1.5px solid ${DP.border}`, borderRadius:9,
  fontSize:13, boxSizing:'border-box',
  fontFamily:DP.font, background:'white', color:DP.text,
  outline:'none', transition:'border-color 0.2s',
};

export default function Campagnes() {
  const [campagnes,  setCampagnes]  = useState([]);
  const [clients,    setClients]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filter,     setFilter]     = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search,     setSearch]     = useState('');
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
    catch { alert('Erreur envoi'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try { await api.delete(`/api/campagnes/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
  };

  // Filtered list
  const filtered = campagnes.filter(c => {
    const matchStatus = filter === 'all'     || c.status === filter;
    const matchType   = typeFilter === 'all' || c.type?.toLowerCase() === typeFilter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const sent      = campagnes.filter(c => c.status === 'sent').length;
  const scheduled = campagnes.filter(c => c.status === 'scheduled').length;
  const draft     = campagnes.filter(c => c.status === 'draft').length;

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{ width:3, height:22, background:DP.gold, borderRadius:2 }} />
            <h1 style={{ fontSize:20, fontWeight:900, margin:0 }}>Campagnes</h1>
          </div>
          <p style={{ color:DP.muted, fontSize:12, margin:'0 0 0 13px' }}>
            Gérez et suivez toutes vos campagnes marketing
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background:DP.gold, color:DP.dark, border:'none', padding:'10px 20px', borderRadius:9, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:DP.font, display:'flex', alignItems:'center', gap:7, boxShadow:'0 4px 14px rgba(245,166,35,0.3)', transition:'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background=DP.goldDark; e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background=DP.gold; e.currentTarget.style.transform='none'; }}
        >
          <span style={{ fontSize:14 }}>+</span> Nouvelle campagne
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total',      value:campagnes.length, accent:DP.gold,  bg:DP.goldGlow,                   icon:'📢' },
          { label:'Envoyées',   value:sent,             accent:DP.green, bg:'rgba(34,197,94,0.1)',          icon:'✅' },
          { label:'Planifiées', value:scheduled,        accent:DP.blue,  bg:'rgba(59,130,246,0.1)',         icon:'🕐' },
          { label:'Brouillons', value:draft,            accent:DP.muted, bg:'rgba(156,143,122,0.08)',       icon:'📝' },
        ].map(s => (
          <div key={s.label} style={{ background:DP.card, border:`1px solid ${DP.border}`, borderLeft:`3px solid ${s.accent}`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px' }}>{s.label}</div>
              <div style={{ width:28, height:28, borderRadius:7, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize:26, fontWeight:900, color:s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filters & Search ── */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:12, padding:'12px 16px', marginBottom:14, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1', minWidth:180 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, opacity:0.4 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une campagne..."
            style={{ ...inputStyle, paddingLeft:32, padding:'8px 12px 8px 32px' }}
            onFocus={e => e.target.style.borderColor=DP.gold}
            onBlur={e => e.target.style.borderColor=DP.border}
          />
        </div>

        {/* Status filter */}
        <div style={{ display:'flex', gap:6 }}>
          {[['all','Tous'],['sent','Envoyées'],['scheduled','Planifiées'],['draft','Brouillons']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding:'6px 12px', borderRadius:20, fontSize:11, fontWeight:700,
              border:`1px solid ${filter===val ? DP.gold : DP.border}`,
              background: filter===val ? DP.goldGlow : 'transparent',
              color: filter===val ? DP.gold : DP.muted,
              cursor:'pointer', fontFamily:DP.font, transition:'all 0.15s',
            }}>{lbl}</button>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display:'flex', gap:6 }}>
          {[['all','Tous types'],['email','📧 Email'],['sms','📱 SMS'],['push','🔔 Push']].map(([val, lbl]) => (
            <button key={val} onClick={() => setTypeFilter(val)} style={{
              padding:'6px 12px', borderRadius:20, fontSize:11, fontWeight:700,
              border:`1px solid ${typeFilter===val ? DP.blue : DP.border}`,
              background: typeFilter===val ? 'rgba(59,130,246,0.08)' : 'transparent',
              color: typeFilter===val ? DP.blue : DP.muted,
              cursor:'pointer', fontFamily:DP.font, transition:'all 0.15s',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DP.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:800, color:DP.text }}>Liste des campagnes</span>
          <span style={{ fontSize:11, color:DP.muted, background:DP.bg, padding:'3px 10px', borderRadius:20, border:`1px solid ${DP.border}` }}>
            {filtered.length} / {campagnes.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:DP.muted }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📢</div>
            <p style={{ fontSize:13, fontWeight:600 }}>Aucune campagne trouvée</p>
            <p style={{ fontSize:12, margin:'4px 0 0' }}>Créez votre première campagne ou modifiez les filtres</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Titre & Client','Canal','Statut','Date','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10, color:DP.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`1px solid ${DP.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sc  = STATUS_STYLE[c.status] || STATUS_STYLE.draft;
                const tc  = TYPE_STYLE[c.type?.toLowerCase()];
                return (
                  <tr key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom:`1px solid #f6f3ee`, background:hoveredRow===c.id?'#faf8f4':'transparent', transition:'background 0.15s' }}>

                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:DP.text }}>{c.title}</div>
                      <div style={{ fontSize:11, color:DP.muted, marginTop:2 }}>{c.client?.name || '—'}</div>
                    </td>

                    <td style={{ padding:'11px 14px' }}>
                      {tc ? <Pill text={tc.label} style={{ background:tc.background, color:tc.color }} />
                          : <span style={{ fontSize:12, color:DP.muted }}>{c.type}</span>}
                    </td>

                    <td style={{ padding:'11px 14px' }}>
                      <Pill text={sc.label} style={{ background:sc.background, color:sc.color }} />
                    </td>

                    <td style={{ padding:'11px 14px', fontSize:11, color:DP.muted }}>
                      {c.dateScheduled
                        ? new Date(c.dateScheduled).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
                        : '—'}
                    </td>

                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {c.status !== 'sent' && (
                          <button onClick={() => handleSend(c.id)} style={{
                            background:DP.goldGlow, color:'#d97706',
                            border:'1px solid rgba(245,166,35,0.3)',
                            padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700,
                            cursor:'pointer', fontFamily:DP.font, transition:'all 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(245,166,35,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background=DP.goldGlow}
                          >▶ Envoyer</button>
                        )}
                        <button onClick={() => handleDelete(c.id)} style={{
                          background:'rgba(239,68,68,0.07)', color:DP.red,
                          border:'1px solid rgba(239,68,68,0.18)',
                          padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700,
                          cursor:'pointer', fontFamily:DP.font, transition:'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.07)'}
                        >🗑 Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div style={{
          position:'fixed', inset:0, zIndex:1000,
          background:'rgba(22,18,13,0.55)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:24,
        }} onClick={e => e.target===e.currentTarget && setShowForm(false)}>

          <div style={{
            background:DP.card, borderRadius:18, width:'100%', maxWidth:520,
            border:`1px solid ${DP.border}`,
            boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
            overflow:'hidden',
          }}>
            {/* Modal header */}
            <div style={{ background:DP.dark, padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ width:16, height:2, background:DP.gold, display:'inline-block' }} />
                  <span style={{ fontSize:10, fontWeight:700, color:DP.gold, textTransform:'uppercase', letterSpacing:'2px' }}>Nouvelle Campagne</span>
                </div>
                <div style={{ fontSize:16, fontWeight:900, color:'#fff' }}>Créer une campagne</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{
                width:30, height:30, borderRadius:8,
                background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)',
                color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:14,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>✕</button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAdd} style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <InputField label="Titre de la campagne">
                  <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required
                    placeholder="Ex: Promo Ramadan 2026"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor=DP.gold}
                    onBlur={e => e.target.style.borderColor=DP.border}
                  />
                </InputField>

                <InputField label="Type de canal">
                  <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor=DP.gold}
                    onBlur={e => e.target.style.borderColor=DP.border}
                  >
                    <option value="email">📧 Email</option>
                    <option value="sms">📱 SMS</option>
                    <option value="push">🔔 Push</option>
                  </select>
                </InputField>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <InputField label="Client">
                  <select value={form.clientId} onChange={e => setForm({...form,clientId:e.target.value})} required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor=DP.gold}
                    onBlur={e => e.target.style.borderColor=DP.border}
                  >
                    <option value="">— Sélectionner un client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </InputField>

                <InputField label="Date planifiée">
                  <input type="datetime-local" value={form.dateScheduled} onChange={e => setForm({...form,dateScheduled:e.target.value})}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor=DP.gold}
                    onBlur={e => e.target.style.borderColor=DP.border}
                  />
                </InputField>
              </div>

              {/* Canal preview pills */}
              <div style={{ background:DP.bg, borderRadius:10, padding:'12px 14px', border:`1px solid ${DP.border}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Aperçu du canal sélectionné</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['email','sms','push'].map(t => {
                    const ts = TYPE_STYLE[t];
                    return (
                      <div key={t} style={{ flex:1, padding:'8px', borderRadius:8, border:`1.5px solid ${form.type===t ? ts.color : DP.border}`, background:form.type===t ? ts.background : 'transparent', textAlign:'center', cursor:'pointer', transition:'all 0.15s' }}
                        onClick={() => setForm({...form,type:t})}>
                        <div style={{ fontSize:16, marginBottom:2 }}>{TYPE_STYLE[t].label.split(' ')[0]}</div>
                        <div style={{ fontSize:10, fontWeight:700, color:form.type===t ? ts.color : DP.muted, textTransform:'uppercase' }}>{t}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                <button type="submit" disabled={loading} style={{
                  flex:1, background:DP.gold, color:DP.dark, border:'none',
                  padding:'11px', borderRadius:9, fontSize:13, fontWeight:800,
                  cursor:loading?'not-allowed':'pointer', fontFamily:DP.font,
                  opacity:loading?0.6:1, transition:'all 0.2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {loading ? <>
                    <span style={{ width:12, height:12, border:`2px solid ${DP.dark}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                    Création...
                  </> : '✓ Créer la campagne'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background:'transparent', color:DP.muted, border:`1px solid ${DP.border}`,
                  padding:'11px 20px', borderRadius:9, fontSize:12, cursor:'pointer', fontFamily:DP.font,
                }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}