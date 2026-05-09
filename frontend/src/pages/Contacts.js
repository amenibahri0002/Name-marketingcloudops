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
  shadowMd:   '0 4px 20px rgba(10,14,42,0.10)',
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
  .dl-stat:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 28px rgba(245,166,35,0.15) !important;
    border-color: #f5a623 !important;
  }
  .dl-stat { transition: all 0.22s ease !important; }
  .dl-row:hover td { background: #fafbff !important; }
  .dl-btn-del:hover { background: rgba(239,68,68,0.15) !important; transform: scale(1.04); }
  .dl-btn-del { transition: all 0.15s; }
  .dl-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(245,166,35,0.35) !important; }
  .dl-btn-add { transition: all 0.2s; }
  .dl-input:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12) !important; outline: none; }
  .dl-modal-overlay { animation: fadeUp 0.2s ease; }
`;

/* ─── Avatar initiales ───────────────────────────────────────── */
const AVATAR_COLORS = [C.gold, C.blue, C.green, C.purple, '#ec4899', '#14b8a6'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = name => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

/* ─── Skeleton ───────────────────────────────────────────────── */
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

/* ─── Modal ajout contact ────────────────────────────────────── */
function AddContactModal({ clients, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', clientId: '' });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/contacts', form);
      onSave();
      onClose();
    } catch { alert('Erreur lors de la création'); }
    finally { setSaving(false); }
  };

  return (
    <div className="dl-modal-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.card, borderRadius: 20,
        width: 460, padding: '32px',
        boxShadow: '0 24px 60px rgba(10,14,42,0.25)',
        border: `1.5px solid ${C.border}`,
      }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Nouveau contact</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>Remplissez les informations</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${C.border}`,
            background: 'none', cursor: 'pointer', fontSize: 16, color: C.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* fields */}
        {[
          { key: 'name',  label: 'Nom complet *', placeholder: 'Ex: Ameni Bahri', type: 'text' },
          { key: 'email', label: 'Email',          placeholder: 'email@exemple.com', type: 'email' },
          { key: 'phone', label: 'Téléphone',      placeholder: '+216 XX XXX XXX', type: 'tel' },
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
              style={{
                width: '100%', padding: '10px 14px',
                border: `1.5px solid ${C.border}`, borderRadius: 10,
                fontSize: 13.5, color: C.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color .2s, box-shadow .2s',
              }}
            />
          </div>
        ))}

        {/* client select */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>
            Client associé
          </label>
          <select
            className="dl-input"
            value={form.clientId}
            onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
            style={{
              width: '100%', padding: '10px 14px',
              border: `1.5px solid ${C.border}`, borderRadius: 10,
              fontSize: 13.5, color: C.text, background: '#fafbfd',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color .2s, box-shadow .2s',
            }}
          >
            <option value="">— Aucun client —</option>
            {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
          </select>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
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
            {saving ? 'Enregistrement...' : '+ Ajouter le contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Contacts() {
  const [contacts,  setContacts]  = useState([]);
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [search,    setSearch]    = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [co, cl] = await Promise.all([api.get('/api/contacts'), api.get('/api/clients')]);
      setContacts(Array.isArray(co.data) ? co.data : co.data.data || []);
      setClients(Array.isArray(cl.data) ? cl.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce contact ?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/contacts/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total contacts', value: contacts.length,                           color: C.gold,  dim: C.goldDim,   icon: '👥' },
    { label: 'Avec email',     value: contacts.filter(c => c.email).length,      color: C.blue,  dim: C.blueDim,   icon: '✉️' },
    { label: 'Avec téléphone', value: contacts.filter(c => c.phone).length,      color: C.green, dim: C.greenDim,  icon: '📱' },
    { label: 'Avec client',    value: contacts.filter(c => c.clientId).length,   color: C.purple,dim: C.purpleDim, icon: '🏢' },
  ];

  const TABLE_HEADS = ['Contact', 'Email', 'Téléphone', 'Client associé', 'Actions'];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {showForm && (
        <AddContactModal clients={clients} onClose={() => setShowForm(false)} onSave={fetchAll} />
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26,
        animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.text }}>Contacts</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} enregistré{contacts.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="dl-btn-add" onClick={() => setShowForm(true)} style={{
          background: C.gold, color: C.navy,
          border: 'none', padding: '11px 22px',
          borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
        }}>
          + Ajouter contact
        </button>
      </div>

      {/* ── Stats cards ── */}
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
              background: s.dim, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {loading ? <Skel w={40} h={26} /> : s.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 18, animation: 'fadeUp 0.4s ease 300ms both' }}>
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 400 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: C.textMuted }}>🔍</span>
          <input
            className="dl-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un contact ou email..."
            style={{
              width: '100%', padding: '11px 14px 11px 42px',
              border: `1.5px solid ${C.border}`, borderRadius: 11,
              fontSize: 13.5, color: C.text, background: C.card,
              boxSizing: 'border-box', fontFamily: 'inherit',
              boxShadow: C.shadow,
              transition: 'border-color .2s, box-shadow .2s',
            }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: C.card, borderRadius: 16,
        border: `1.5px solid ${C.border}`,
        boxShadow: C.shadow, overflow: 'hidden',
        animation: 'fadeUp 0.4s ease 360ms both',
      }}>
        {/* table header bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: `1.5px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafbfd',
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>
            Liste des contacts
            <span style={{
              marginLeft: 10, fontSize: 11, fontWeight: 700,
              background: C.goldDim, color: C.goldDark,
              border: `1px solid ${C.goldBorder}`,
              padding: '2px 9px', borderRadius: 20,
            }}>{filtered.length}</span>
          </span>
          {search && (
            <span style={{ fontSize: 12, color: C.textMuted }}>
              Résultats pour "<b>{search}</b>"
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skel w={42} h={42} r={12} />
                <div style={{ flex: 1 }}><Skel h={14} w="40%" /><div style={{ marginTop: 6 }}><Skel h={11} w="60%" r={4} /></div></div>
                <Skel w={120} h={14} r={4} />
                <Skel w={80} h={14} r={4} />
                <Skel w={70} h={30} r={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ fontSize: 44, opacity: 0.25, marginBottom: 14 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucun contact trouvé</div>
            <div style={{ fontSize: 13 }}>
              {search ? `Aucun résultat pour "${search}"` : 'Ajoutez votre premier contact'}
            </div>
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
                  <tr key={c.id} className="dl-row"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background .15s',
                      animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                    }}>
                    {/* Contact */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                          background: `${color}18`, border: `1.5px solid ${color}35`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color,
                        }}>{initials(c.name)}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{c.name}</div>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '14px 18px' }}>
                      {c.email
                        ? <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: C.blue, textDecoration: 'none', fontWeight: 500 }}>{c.email}</a>
                        : <span style={{ fontSize: 13, color: C.textMuted }}>—</span>
                      }
                    </td>
                    {/* Phone */}
                    <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
                      {c.phone || '—'}
                    </td>
                    {/* Client */}
                    <td style={{ padding: '14px 18px' }}>
                      {c.client
                        ? <span style={{
                            background: C.goldDim, color: C.goldDark,
                            border: `1px solid ${C.goldBorder}`,
                            padding: '4px 12px', borderRadius: 20,
                            fontSize: 12, fontWeight: 700,
                          }}>{c.client.name}</span>
                        : <span style={{ fontSize: 13, color: C.textMuted }}>—</span>
                      }
                    </td>
                    {/* Actions */}
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
    </div>
  );
}