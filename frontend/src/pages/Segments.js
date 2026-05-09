import React, { useState, useEffect } from 'react';
import api from '../api';

/* ─── Palette DigiLab ────────────────────────────────────────── */
const C = {
  bg:          '#f4f6fb',
  card:        '#ffffff',
  navy:        '#16120d',
  gold:        '#f5a623',
  goldDark:    '#c8831a',
  goldDim:     'rgba(245,166,35,0.10)',
  goldBorder:  'rgba(245,166,35,0.28)',
  border:      '#e5e9f2',
  text:        '#1a1f3c',
  textMuted:   '#6b7280',
  blue:        '#3b82f6',
  blueDim:     'rgba(59,130,246,0.10)',
  green:       '#22c55e',
  greenDim:    'rgba(34,197,94,0.10)',
  red:         '#ef4444',
  redDim:      'rgba(239,68,68,0.10)',
  purple:      '#8b5cf6',
  purpleDim:   'rgba(139,92,246,0.10)',
  shadow:      '0 1px 8px rgba(10,14,42,0.07)',
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
  .dl-stat { transition:all 0.22s ease !important; }
  .dl-stat:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.15)!important; border-color:#f5a623!important; }
  .dl-row:hover td { background:#fafbff !important; }
  .dl-btn-del { transition:all 0.15s; }
  .dl-btn-del:hover { background:rgba(239,68,68,0.15)!important; }
  .dl-btn-add { transition:all 0.2s; }
  .dl-btn-add:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(245,166,35,0.35)!important; }
  .dl-input:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
  .dl-select:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
`;

/* ─── Helpers ─────────────────────────────────────────────────── */
const CRIT = {
  all:      { label: 'Tous les contacts', icon: '👥', color: '#f5a623' },
  email:    { label: 'A un email',        icon: '📧', color: '#3b82f6' },
  phone:    { label: 'A un téléphone',    icon: '📱', color: '#22c55e' },
  clientId: { label: 'Par client',        icon: '🏢', color: '#8b5cf6' },
};

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

function SectionHead({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 4, height: 20, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: C.navy, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.border},transparent)` }} />
    </div>
  );
}

/* ─── Modal nouveau segment ───────────────────────────────────── */
function AddSegmentModal({ clients, onClose, onSave }) {
  const [form, setForm]   = useState({ name: '', criteria: 'all', clientId: '' });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/segments', form);
      onSave(); onClose();
    } catch { alert('Erreur lors de la création'); }
    finally { setSaving(false); }
  };

  const critOptions = [
    { value: 'all',      label: '👥 Tous les contacts' },
    { value: 'email',    label: '📧 A un email' },
    { value: 'phone',    label: '📱 A un téléphone' },
    { value: 'clientId', label: '🏢 Par client' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeUp 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.card, borderRadius: 20,
        width: 480, padding: '32px',
        boxShadow: '0 24px 60px rgba(10,14,42,0.25)',
        border: `1.5px solid ${C.border}`,
      }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Nouveau segment</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>Créez un groupe de contacts ciblés</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${C.border}`,
            background: 'none', cursor: 'pointer', fontSize: 18, color: C.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Nom */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>
            Nom du segment *
          </label>
          <input className="dl-input"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Ex: Contacts VIP"
            style={{
              width: '100%', padding: '11px 14px',
              border: `1.5px solid ${C.border}`, borderRadius: 10,
              fontSize: 13.5, color: C.text, background: '#fafbfd',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color .2s, box-shadow .2s',
            }}
          />
        </div>

        {/* Critère */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>
            Critère de segmentation
          </label>
          <select className="dl-select"
            value={form.criteria}
            onChange={e => setForm(p => ({ ...p, criteria: e.target.value }))}
            style={{
              width: '100%', padding: '11px 14px',
              border: `1.5px solid ${C.border}`, borderRadius: 10,
              fontSize: 13.5, color: C.text, background: '#fafbfd',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color .2s, box-shadow .2s',
            }}>
            {critOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Client optionnel */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>
            Client associé <span style={{ color: C.textMuted, fontWeight: 500 }}>(optionnel)</span>
          </label>
          <select className="dl-select"
            value={form.clientId}
            onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
            style={{
              width: '100%', padding: '11px 14px',
              border: `1.5px solid ${C.border}`, borderRadius: 10,
              fontSize: 13.5, color: C.text, background: '#fafbfd',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color .2s, box-shadow .2s',
            }}>
            <option value="">— Tous les clients —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Actions */}
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
            {saving ? 'Création...' : '+ Créer le segment'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Segments() {
  const [segments,   setSegments]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [s, cl] = await Promise.all([api.get('/api/segments'), api.get('/api/clients')]);
      setSegments(Array.isArray(s.data) ? s.data : s.data.data || []);
      setClients(Array.isArray(cl.data) ? cl.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce segment ?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/segments/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  const totalContacts = segments.reduce((a, s) => a + (s.contactCount || 0), 0);
  const ceMonth = segments.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length;

  const stats = [
    { label: 'Total segments',    value: segments.length, color: C.gold,   dim: C.goldDim,   icon: '🎯' },
    { label: 'Contacts couverts', value: totalContacts,   color: C.blue,   dim: C.blueDim,   icon: '👥' },
    { label: 'Créés ce mois',     value: ceMonth,         color: C.green,  dim: C.greenDim,  icon: '📅' },
    { label: 'Types de critères', value: new Set(segments.map(s => s.criteria)).size, color: C.purple, dim: C.purpleDim, icon: '🔬' },
  ];

  const TABLE_HEADS = ['NOM', 'CRITÈRE', 'CLIENT', 'CONTACTS', 'CRÉÉ LE', 'ACTIONS'];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {showForm && <AddSegmentModal clients={clients} onClose={() => setShowForm(false)} onSave={fetchAll} />}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Segments</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            Créez des groupes de contacts ciblés
          </p>
        </div>
        <button className="dl-btn-add" onClick={() => setShowForm(true)} style={{
          background: C.gold, color: C.navy,
          border: 'none', padding: '11px 22px',
          borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
        }}>
          + Nouveau segment
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
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
                {loading ? <Skel w={36} h={24} /> : s.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ animation: 'fadeUp 0.4s ease 320ms both' }}>
        <SectionHead label="Liste des segments" />
        <div style={{
          background: C.card, borderRadius: 16,
          border: `1.5px solid ${C.border}`,
          boxShadow: C.shadow, overflow: 'hidden',
        }}>
          {/* subheader */}
          <div style={{
            padding: '13px 20px', borderBottom: `1.5px solid ${C.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fafbfd',
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>
              Segments
              <span style={{
                marginLeft: 10, fontSize: 11, fontWeight: 700,
                background: C.goldDim, color: C.goldDark,
                border: `1px solid ${C.goldBorder}`,
                padding: '2px 9px', borderRadius: 20,
              }}>{segments.length}</span>
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Skel w={34} h={34} r={9} />
                  <Skel h={14} w="25%" />
                  <Skel h={22} w="100px" r={20} />
                  <Skel h={14} w="15%" />
                  <Skel h={22} w="80px" r={20} />
                  <Skel h={14} w="10%" />
                  <Skel h={30} w={80} r={8} />
                </div>
              ))}
            </div>
          ) : segments.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: 44, opacity: 0.2, marginBottom: 14 }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucun segment</div>
              <div style={{ fontSize: 13 }}>Créez votre premier segment pour cibler vos contacts</div>
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
                {segments.map((s, idx) => {
                  const crit = CRIT[s.criteria] || CRIT.all;
                  return (
                    <tr key={s.id} className="dl-row" style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background .15s',
                      animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                    }}>
                      {/* Nom */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                            background: C.goldDim, border: `1.5px solid ${C.goldBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15,
                          }}>🎯</div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{s.name}</span>
                        </div>
                      </td>
                      {/* Critère */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: `${crit.color}15`, color: crit.color,
                          border: `1px solid ${crit.color}30`,
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 11.5, fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}>
                          {crit.icon} {crit.label}
                        </span>
                      </td>
                      {/* Client */}
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
                        {s.client?.name || '—'}
                      </td>
                      {/* Contacts */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: C.blueDim, color: C.blue,
                          border: '1px solid rgba(59,130,246,0.25)',
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 11.5, fontWeight: 700,
                        }}>
                          {s.contactCount || 0} contact{s.contactCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '14px 18px', fontSize: 12.5, color: C.textMuted }}>
                        {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 18px' }}>
                        <button className="dl-btn-del"
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          style={{
                            background: C.redDim, color: C.red,
                            border: `1px solid rgba(239,68,68,0.2)`,
                            padding: '6px 14px', borderRadius: 8,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            opacity: deletingId === s.id ? 0.5 : 1,
                          }}>
                          {deletingId === s.id ? '...' : 'Supprimer'}
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
    </div>
  );
}