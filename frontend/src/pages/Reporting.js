import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

const BAR_COLORS = [DP.gold, DP.blue, DP.green, '#8b5cf6', '#ec4899', '#14b8a6'];

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex:1, height:6, background:'#f0ece4', borderRadius:4, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:4, transition:'width 0.6s ease' }} />
    </div>
  );
}

export default function Reporting() {
  const [campagnes, setCampagnes] = useState([]);
  const [clients,   setClients]   = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [c, cl] = await Promise.all([api.get('/api/campagnes'), api.get('/api/clients')]);
        setCampagnes(Array.isArray(c.data) ? c.data : c.data.data || []);
        setClients(cl.data);
      } catch(err) { console.error(err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = filter === 'all' ? campagnes : campagnes.filter(c => c.type === filter);

  const sent      = filtered.filter(c => c.status === 'sent').length;
  const scheduled = filtered.filter(c => c.status === 'scheduled').length;
  const draft     = filtered.filter(c => c.status === 'draft').length;
  const total     = filtered.length;

  // Campagnes par client
  const byClient = clients.map(cl => ({
    name: cl.name,
    count: filtered.filter(c => c.clientId === cl.id || c.client?.id === cl.id).length,
  })).filter(x => x.count > 0).sort((a,b) => b.count - a.count);

  const maxCount = byClient.length > 0 ? byClient[0].count : 1;

  // Campagnes par type
  const byType = ['email','sms','push'].map(t => ({
    type: t,
    icon: t === 'email' ? '📧' : t === 'sms' ? '📱' : '🔔',
    count: filtered.filter(c => c.type === t).length,
  }));

  // Activité mensuelle (6 derniers mois)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      month: d.getMonth(),
      year:  d.getFullYear(),
      count: 0,
    };
  });
  filtered.forEach(c => {
    const d = new Date(c.createdAt || c.dateScheduled);
    const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (idx !== -1) months[idx].count++;
  });
  const maxMonth = Math.max(...months.map(m => m.count), 1);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:DP.muted, fontFamily:DP.font }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ fontFamily:DP.font, color:DP.text }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Reporting</h1>
          <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Vue globale de vos performances marketing</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[
            { value:'all',   label:'Tous' },
            { value:'email', label:'📧 Email' },
            { value:'sms',   label:'📱 SMS' },
            { value:'push',  label:'🔔 Push' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:700,
              cursor:'pointer', fontFamily:DP.font, border:'none',
              background: filter === f.value ? DP.gold : DP.card,
              color:       filter === f.value ? DP.dark : DP.muted,
              boxShadow:   filter === f.value ? '0 2px 8px rgba(245,166,35,0.25)' : 'none',
              transition:'all 0.2s'
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total campagnes', value:total,     color:DP.gold,  icon:'📢', bg:DP.goldGlow },
          { label:'Envoyées',        value:sent,      color:DP.green, icon:'✅', bg:'rgba(34,197,94,0.1)' },
          { label:'Planifiées',      value:scheduled, color:DP.blue,  icon:'📅', bg:'rgba(59,130,246,0.1)' },
          { label:'Brouillons',      value:draft,     color:DP.muted, icon:'📝', bg:'rgba(156,143,122,0.1)' },
        ].map(k => (
          <div key={k.label} style={{
            background:DP.card, border:`1px solid ${DP.border}`,
            borderRadius:14, padding:'18px 20px',
            display:'flex', flexDirection:'column', gap:8
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px' }}>{k.label}</div>
              <div style={{ width:30, height:30, borderRadius:8, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:k.color }}>{k.value}</div>
            {total > 0 && (
              <div style={{ fontSize:10, color:DP.muted }}>
                {((k.value / total) * 100).toFixed(0)}% du total
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Row 2 — Activité mensuelle + Par type */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>

        {/* Activité mensuelle */}
        <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:800, color:DP.text, marginBottom:16 }}>📈 Activité — 6 derniers mois</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
            {months.map((m, i) => {
              const h = maxMonth > 0 ? (m.count / maxMonth) * 100 : 0;
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:DP.gold }}>{m.count > 0 ? m.count : ''}</div>
                  <div style={{
                    width:'100%', height:`${Math.max(h, 4)}%`,
                    minHeight: m.count > 0 ? 8 : 4,
                    background: i === months.length-1 ? DP.gold : 'rgba(245,166,35,0.3)',
                    borderRadius:'4px 4px 0 0', transition:'height 0.6s ease'
                  }} />
                  <div style={{ fontSize:9, color:DP.muted, textTransform:'uppercase' }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par type */}
        <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:800, color:DP.text, marginBottom:16 }}>📊 Par canal</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {byType.map((t, i) => (
              <div key={t.type}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:DP.text }}>{t.icon} {t.type.toUpperCase()}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:BAR_COLORS[i] }}>{t.count}</span>
                </div>
                <MiniBar value={t.count} max={total || 1} color={BAR_COLORS[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Par client */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:14, padding:20 }}>
        <div style={{ fontSize:13, fontWeight:800, color:DP.text, marginBottom:16 }}>🏢 Campagnes par client</div>
        {byClient.length === 0 ? (
          <div style={{ textAlign:'center', color:DP.muted, padding:'20px 0', fontSize:12 }}>Aucune donnée disponible</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {byClient.map((cl, i) => (
              <div key={cl.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:28, height:28, borderRadius:7, flexShrink:0,
                  background:`${BAR_COLORS[i % BAR_COLORS.length]}18`,
                  border:`1px solid ${BAR_COLORS[i % BAR_COLORS.length]}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:800, color:BAR_COLORS[i % BAR_COLORS.length]
                }}>
                  {cl.name.slice(0,2).toUpperCase()}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:DP.text, width:140, flexShrink:0 }}>{cl.name}</span>
                <MiniBar value={cl.count} max={maxCount} color={BAR_COLORS[i % BAR_COLORS.length]} />
                <span style={{ fontSize:12, fontWeight:800, color:BAR_COLORS[i % BAR_COLORS.length], width:24, textAlign:'right', flexShrink:0 }}>{cl.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}