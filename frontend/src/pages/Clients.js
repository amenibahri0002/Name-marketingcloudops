import React, { useState, useEffect } from 'react';
import api from '../api';

const DP = {
  gold: '#f5a623', goldGlow: 'rgba(245,166,35,0.12)',
  dark: '#16120d', bg: '#f6f3ee', card: '#ffffff',
  border: '#ede8df', text: '#1a160e', muted: '#9c8f7a',
  blue: '#3b82f6', green: '#22c55e', red: '#ef4444',
  font: "'Montserrat','Open Sans',sans-serif",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/clients');
      setClients(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/clients', form);
      setForm({ name: '', email: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) { alert('Erreur: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await api.delete(`/api/clients/${id}`);
      fetchAll();
    } catch (err) { alert('Erreur suppression'); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  const avatarColors = ['#f5a623', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6'];
  const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={{ fontFamily: DP.font, color: DP.text }}>

      {/* Header Amélioré */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>Clients</h1>
          <p style={{ color: DP.muted, fontSize: 13 }}>Gérez vos clients et tenants</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          style={{
            background: DP.gold,
            color: DP.dark,
            border: 'none',
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(245,166,35,0.35)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(245,166,35,0.25)'; }}
        >
          + Nouveau client
        </button>
      </div>

      {/* Stats Cards - Améliorées */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total clients', value: clients.length, color: DP.gold, icon: '👥' },
          { label: 'Actifs', value: clients.length, color: DP.green, icon: '✅' },
          { label: 'Ce mois', value: clients.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length, color: DP.blue, icon: '📅' },
        ].map((s, i) => (
          <div 
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: DP.card,
              border: `1px solid ${DP.border}`,
              borderLeft: `4px solid ${s.color}`,
              borderRadius: 14,
              padding: '1.3rem 1.4rem',
              transition: 'all 0.3s',
              transform: hoveredCard === i ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === i ? '0 12px 25px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DP.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {s.label}
              </div>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un client ou email..."
          style={{
            width: '100%',
            maxWidth: 450,
            padding: '11px 14px 11px 40px',
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

      {/* Table Améliorée */}
      <div style={{ background: DP.card, border: `1px solid ${DP.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DP.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>Liste des clients ({filtered.length})</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: DP.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Client', 'Email', 'Créé le', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 10.5,
                    color: DP.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    borderBottom: `1px solid ${DP.border}`
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const color = avatarColor(c.name);
                return (
                  <tr 
                    key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: hoveredRow === c.id ? '#faf8f4' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${color}15`, border: `1px solid ${color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color
                        }}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: DP.muted }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: DP.muted }}>{c.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12.5, color: DP.muted }}>
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          color: DP.red,
                          border: `1px solid rgba(239,68,68,0.2)`,
                          padding: '6px 14px',
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
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