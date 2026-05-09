import React, { useState, useEffect } from 'react';
import api from '../api';

/* ─── Palette DigiLab ────────────────────────────────────────── */
const C = {
  bg:         '#f4f6fb',
  card:       '#ffffff',
  navy:       '#16120d',
  gold:       '#f5a623',
  goldDark:   '#c8831a',
  goldDim:    'rgba(245,166,35,0.10)',
  goldBorder: 'rgba(245,166,35,0.28)',
  border:     '#e5e9f2',
  text:       '#1a1f3c',
  textMuted:  '#6b7280',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.10)',
  green:      '#22c55e',
  greenDim:   'rgba(34,197,94,0.10)',
  red:        '#ef4444',
  redDim:     'rgba(239,68,68,0.10)',
  purple:     '#8b5cf6',
  purpleDim:  'rgba(139,92,246,0.10)',
  shadow:     '0 1px 8px rgba(10,14,42,0.07)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  .dl-stat:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.15)!important; border-color:#f5a623!important; }
  .dl-stat { transition:all 0.22s ease!important; }
  .dl-client-card:hover { transform:translateY(-2px)!important; box-shadow:0 8px 28px rgba(10,14,42,0.10)!important; border-color:#f5a623!important; }
  .dl-client-card { transition:all 0.22s ease!important; }
  .dl-row:hover td { background:#fafbff!important; }
  .dl-btn-del:hover { background:rgba(239,68,68,0.15)!important; }
  .dl-btn-del { transition:all 0.15s; }
  .dl-btn-add:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(245,166,35,0.35)!important; }
  .dl-btn-add { transition:all 0.2s; }
  .dl-input:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
  .dl-tab { transition:all 0.2s; cursor:pointer; }
`;

/* ─── Helpers ────────────────────────────────────────────────── */
const AVATAR_COLORS = [C.gold, C.blue, C.green, C.purple, '#ec4899', '#14b8a6', '#f97316'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = name => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '500px 100%',
      animation: 'shimmer 1.4s infinite linear',
    }} />
  );
}

/* ─── Modal ajout client ─────────────────────────────────────── */
function AddClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!form.name.trim()) { setError('Le nom est requis'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/api/clients', form);
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeUp 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.card, borderRadius: 20,
        width: 440, padding: '32px',
        boxShadow: '0 24px 60px rgba(10,14,42,0.25)',
        border: `1.5px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Nouveau client</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>Ajouter un client à la plateforme</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1.5px solid ${C.border}`, background: 'none',
            cursor: 'pointer', fontSize: 18, color: C.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {error && (
          <div style={{
            background: C.redDim, border: `1px solid rgba(239,68,68,0.25)`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 18,
            fontSize: 13, color: C.red, fontWeight: 600,
          }}>{error}</div>
        )}

        {[
          { key: 'name',  label: 'Nom du client *', placeholder: 'Ex: DigiLab Solutions', type: 'text'  },
          { key: 'email', label: 'Email',            placeholder: 'contact@exemple.com',    type: 'email' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>
              {f.label}
            </label>
            <input
              className="dl-input"
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{
                width: '100%', padding: '11px 14px',
                border: `1.5px solid ${C.border}`, borderRadius: 10,
                fontSize: 13.5, color: C.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color .2s, box-shadow .2s',
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: `1.5px solid ${C.border}`, background: 'none',
            fontSize: 13, fontWeight: 700, color: C.textMuted, cursor: 'pointer',
          }}>Annuler</button>
          <button className="dl-btn-add" onClick={handle} disabled={saving} style={{
            flex: 2, padding: '11px', borderRadius: 10,
            border: 'none', background: C.gold,
            fontSize: 13, fontWeight: 800, color: C.navy,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Enregistrement...' : '+ Créer le client'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Client card (vue grille) ───────────────────────────────── */
function ClientCard({ client, onDelete }) {
  const color = avatarColor(client.name);
  return (
    <div className="dl-client-card" style={{
      background: C.card, borderRadius: 16,
      border: `1.5px solid ${C.border}`,
      padding: '22px 22px 18px',
      boxShadow: C.shadow, cursor: 'default',
    }}>
      {/* top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${color}15`, border: `1.5px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color, flexShrink: 0,
        }}>{initials(client.name)}</div>
        <button className="dl-btn-del" onClick={() => onDelete(client.id)} style={{
          background: C.redDim, color: C.red,
          border: `1px solid rgba(239,68,68,0.2)`,
          padding: '5px 11px', borderRadius: 7,
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>Supprimer</button>
      </div>

      {/* name */}
      <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{client.name}</div>

      {/* email */}
      {client.email && (
        <a href={`mailto:${client.email}`} style={{
          fontSize: 12.5, color: C.blue, textDecoration: 'none',
          fontWeight: 500, display: 'block', marginBottom: 12,
        }}>{client.email}</a>
      )}

      {/* separator */}
      <div style={{ height: 1, background: C.border, margin: '12px 0' }} />

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>
          Créé le {formatDate(client.createdAt)}
        </span>
        {client._count?.contacts !== undefined && (
          <span style={{
            background: C.goldDim, color: C.goldDark,
            border: `1px solid ${C.goldBorder}`,
            padding: '3px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 700,
          }}>{client._count.contacts} contact{client._count.contacts > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Clients() {
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [search,    setSearch]    = useState('');
  const [view,      setView]      = useState('grid'); // 'grid' | 'table'
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/clients');
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ? Ses contacts seront également affectés.')) return;
    setDeletingId(id);
    try { await api.delete(`/api/clients/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalContacts = clients.reduce((acc, c) => acc + (c._count?.contacts || 0), 0);

  const stats = [
    { label: 'Total clients',    value: clients.length,  color: C.gold,   dim: C.goldDim,   icon: '🏢' },
    { label: 'Total contacts',   value: totalContacts,   color: C.blue,   dim: C.blueDim,   icon: '👥' },
    { label: 'Avec email',       value: clients.filter(c => c.email).length, color: C.green, dim: C.greenDim, icon: '✉️' },
    { label: 'Actifs ce mois',   value: clients.filter(c => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, color: C.purple, dim: C.purpleDim, icon: '📅' },
  ];

  const TABLE_HEADS = ['Client', 'Email', 'Contacts', 'Date création', 'Actions'];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {showForm && <AddClientModal onClose={() => setShowForm(false)} onSave={fetchAll} />}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Clients</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="dl-btn-add" onClick={() => setShowForm(true)} style={{
          background: C.gold, color: C.navy,
          border: 'none', padding: '11px 22px',
          borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
        }}>
          + Ajouter client
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="dl-stat" style={{
            background: C.card, borderRadius: 14,
            border: `1.5px solid ${C.border}`,
            padding: '18px 20px', boxShadow: C.shadow,
            display: 'flex', alignItems: 'center', gap: 14,
            animation: `fadeUp 0.4s ease ${i * 70}ms both`,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: s.dim, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {loading ? <Skel w={40} h={24} /> : s.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 18, animation: 'fadeUp 0.4s ease 300ms both',
      }}>
        {/* search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textMuted }}>🔍</span>
          <input
            className="dl-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            style={{
              padding: '10px 14px 10px 40px', width: 320,
              border: `1.5px solid ${C.border}`, borderRadius: 11,
              fontSize: 13.5, color: C.text, background: C.card,
              boxSizing: 'border-box', fontFamily: 'inherit',
              boxShadow: C.shadow,
              transition: 'border-color .2s, box-shadow .2s',
            }}
          />
        </div>

        {/* view toggle */}
        <div style={{
          display: 'flex', background: C.card,
          border: `1.5px solid ${C.border}`, borderRadius: 10,
          padding: 3, gap: 2, boxShadow: C.shadow,
        }}>
          {[
            { id: 'grid',  label: '⊞ Grille' },
            { id: 'table', label: '☰ Tableau' },
          ].map(v => (
            <button key={v.id} className="dl-tab"
              onClick={() => setView(v.id)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: view === v.id ? C.gold : 'none',
                color:      view === v.id ? C.navy : C.textMuted,
                boxShadow:  view === v.id ? '0 2px 8px rgba(245,166,35,0.25)' : 'none',
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid view ── */}
      {view === 'grid' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '22px', boxShadow: C.shadow }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <Skel w={48} h={48} r={14} />
                  <div style={{ flex: 1 }}><Skel h={14} w="70%" /><div style={{ marginTop: 8 }}><Skel h={11} w="50%" r={4} /></div></div>
                </div>
                <Skel h={1} /><div style={{ marginTop: 12 }}><Skel h={11} w="60%" r={4} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ fontSize: 44, opacity: 0.25, marginBottom: 14 }}>🏢</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucun client trouvé</div>
            <div style={{ fontSize: 13 }}>{search ? `Aucun résultat pour "${search}"` : 'Ajoutez votre premier client'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, animation: 'fadeUp 0.4s ease 360ms both' }}>
            {filtered.map(c => (
              <ClientCard key={c.id} client={c} onDelete={handleDelete} />
            ))}
          </div>
        )
      )}

      {/* ── Table view ── */}
      {view === 'table' && (
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
          overflow: 'hidden', animation: 'fadeUp 0.4s ease 360ms both',
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: `1.5px solid ${C.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fafbfd',
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>
              Liste des clients
              <span style={{
                marginLeft: 10, fontSize: 11, fontWeight: 700,
                background: C.goldDim, color: C.goldDark,
                border: `1px solid ${C.goldBorder}`,
                padding: '2px 9px', borderRadius: 20,
              }}>{filtered.length}</span>
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Skel w={42} h={42} r={12} />
                  <div style={{ flex: 1 }}><Skel h={14} w="35%" /></div>
                  <Skel w={150} h={14} r={4} />
                  <Skel w={60} h={26} r={20} />
                  <Skel w={80} h={30} r={8} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: 44, opacity: 0.25, marginBottom: 14 }}>🏢</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Aucun client trouvé</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {TABLE_HEADS.map(h => (
                    <th key={h} style={{
                      padding: '13px 18px', textAlign: 'left',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.16em', color: C.gold,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => {
                  const color = avatarColor(c.name);
                  return (
                    <tr key={c.id} className="dl-row" style={{
                      borderBottom: `1px solid ${C.border}`,
                      animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                    }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                            background: `${color}15`, border: `1.5px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color,
                          }}>{initials(c.name)}</div>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {c.email
                          ? <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: C.blue, textDecoration: 'none', fontWeight: 500 }}>{c.email}</a>
                          : <span style={{ color: C.textMuted, fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {c._count?.contacts !== undefined
                          ? <span style={{
                              background: C.goldDim, color: C.goldDark,
                              border: `1px solid ${C.goldBorder}`,
                              padding: '3px 11px', borderRadius: 20,
                              fontSize: 12, fontWeight: 700,
                            }}>{c._count.contacts}</span>
                          : <span style={{ color: C.textMuted, fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted }}>{formatDate(c.createdAt)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <button className="dl-btn-del"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          style={{
                            background: C.redDim, color: C.red,
                            border: `1px solid rgba(239,68,68,0.2)`,
                            padding: '6px 14px', borderRadius: 8,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            opacity: deletingId === c.id ? 0.5 : 1,
                          }}>
                          {deletingId === c.id ? '...' : 'Supprimer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}