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
  shadowMd:   '0 4px 20px rgba(10,14,42,0.12)',
};

/* ─── Status & Type configs ───────────────────────────────────── */
const STATUS = {
  sent:      { label: 'Envoyée',   color: '#16a34a', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)'   },
  scheduled: { label: 'Planifiée', color: '#2563eb', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)'  },
  draft:     { label: 'Brouillon', color: '#d97706', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)'  },
};

const TYPE = {
  email: { label: 'Email', icon: '📧', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)'  },
  sms:   { label: 'SMS',   icon: '📱', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)'   },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)'  },
};

/* ─── CSS ────────────────────────────────────────────────────── */
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
  @keyframes spin { to { transform: rotate(360deg); } }

  .dl-stat { transition:all 0.22s ease!important; cursor:default; }
  .dl-stat:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.15)!important; border-color:#f5a623!important; }
  .dl-row { transition:background .15s; }
  .dl-row:hover td { background:#fafbff!important; }
  .dl-btn { transition:all 0.15s!important; }
  .dl-btn:hover { opacity:0.85!important; transform:translateY(-1px)!important; }
  .dl-btn-add { transition:all 0.2s!important; }
  .dl-btn-add:hover { transform:translateY(-2px)!important; box-shadow:0 8px 22px rgba(245,166,35,0.35)!important; }
  .dl-input:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
  .dl-input-blue:focus { border-color:#3b82f6!important; box-shadow:0 0 0 3px rgba(59,130,246,0.12)!important; outline:none; }
  .dl-filter { transition:all 0.18s!important; cursor:pointer; }
  .dl-channel-pick { transition:all 0.18s!important; cursor:pointer; }
  .dl-channel-pick:hover { transform:translateY(-2px)!important; }
`;

/* ─── Helpers ─────────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '500px 100%',
      animation: 'shimmer 1.4s infinite linear',
      flexShrink: 0,
    }} />
  );
}

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 11px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 700, color,
      background: bg, border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      color: C.text, display: 'block', marginBottom: 7,
    }}>{children}</label>
  );
}

const inputBase = {
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontSize: 13.5, color: C.text, background: '#fafbfd',
  boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color .2s, box-shadow .2s',
};

/* ─── Modal créer campagne ────────────────────────────────────── */
function CreateModal({ clients, onClose, onSave }) {
  const [form, setForm]     = useState({ title: '', type: 'email', clientId: '', dateScheduled: '' });
  const [saving, setSaving] = useState(false);

  const handle = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.clientId) return;
    setSaving(true);
    try { await api.post('/api/campagnes', form); onSave(); onClose(); }
    catch (err) { alert('Erreur: ' + err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.6)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeUp 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        background: C.card, borderRadius: 20,
        width: '100%', maxWidth: 540,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 28px 70px rgba(10,14,42,0.22)', overflow: 'hidden',
      }}>
        {/* modal header navy */}
        <div style={{
          background: C.navy, padding: '20px 26px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 18, height: 2, background: C.gold, borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Nouvelle Campagne
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Créer une campagne</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handle} style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Titre + type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <FieldLabel>Titre de la campagne *</FieldLabel>
              <input className="dl-input" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Promo Ramadan 2026"
                required style={inputBase} />
            </div>
            <div>
              <FieldLabel>Client *</FieldLabel>
              <select className="dl-input" value={form.clientId}
                onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                required style={inputBase}>
                <option value="">— Sélectionner —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Canal selector */}
          <div>
            <FieldLabel>Canal d'envoi</FieldLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(TYPE).map(([key, t]) => (
                <div key={key} className="dl-channel-pick"
                  onClick={() => setForm(p => ({ ...p, type: key }))}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                    border: `1.5px solid ${form.type === key ? t.color : C.border}`,
                    background: form.type === key ? t.bg : '#fafbfd',
                    boxShadow: form.type === key ? `0 4px 14px ${t.bg}` : 'none',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{t.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: form.type === key ? t.color : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date planifiée */}
          <div>
            <FieldLabel>Date planifiée <span style={{ color: C.textMuted, fontWeight: 500 }}>(optionnelle)</span></FieldLabel>
            <input className="dl-input" type="datetime-local"
              value={form.dateScheduled}
              onChange={e => setForm(p => ({ ...p, dateScheduled: e.target.value }))}
              style={inputBase} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: 'none',
              fontSize: 13, fontWeight: 700, color: C.textMuted, cursor: 'pointer',
            }}>Annuler</button>
            <button className="dl-btn-add" type="submit" disabled={saving} style={{
              flex: 2, padding: '11px', borderRadius: 10,
              border: 'none', background: C.gold,
              fontSize: 13, fontWeight: 800, color: C.navy,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
              opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {saving
                ? <><span style={{ width: 13, height: 13, border: `2px solid ${C.navy}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Création...</>
                : '✓ Créer la campagne'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal planifier ─────────────────────────────────────────── */
function ScheduleModal({ modal, onClose, onConfirm, loading }) {
  const [date, setDate] = useState(modal.date || '');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.6)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeUp 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.card, borderRadius: 20,
        width: '100%', maxWidth: 420,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 28px 70px rgba(10,14,42,0.22)', overflow: 'hidden',
      }}>
        <div style={{
          background: C.navy, padding: '20px 26px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 18, height: 2, background: C.blue, borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.blue, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Planification</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Choisir une date d'envoi</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <FieldLabel>Date et heure d'envoi</FieldLabel>
            <input className="dl-input-blue" type="datetime-local"
              value={date} min={new Date().toISOString().slice(0, 16)}
              onChange={e => setDate(e.target.value)}
              style={inputBase} />
          </div>

          {date && (
            <div style={{
              background: C.blueDim, border: '1px solid rgba(59,130,246,0.22)',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Envoi prévu le</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                {new Date(date).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: 'none',
              fontSize: 13, fontWeight: 700, color: C.textMuted, cursor: 'pointer',
            }}>Annuler</button>
            <button className="dl-btn" onClick={() => onConfirm(modal.id, date)}
              disabled={!date || loading}
              style={{
                flex: 2, padding: '11px', borderRadius: 10,
                border: 'none', background: C.blue,
                fontSize: 13, fontWeight: 800, color: '#fff',
                cursor: (!date || loading) ? 'not-allowed' : 'pointer',
                opacity: (!date || loading) ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? <><span style={{ width: 13, height: 13, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Planification...</>
                : '🕐 Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Campagnes() {
  const [campagnes,     setCampagnes]     = useState([]);
  const [clients,       setClients]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showCreate,    setShowCreate]    = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [actionId,      setActionId]      = useState(null);
  const [filter,        setFilter]        = useState('all');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [search,        setSearch]        = useState('');

  const fetchAll = async () => {
    try {
      const [c, cl] = await Promise.all([api.get('/api/campagnes'), api.get('/api/clients')]);
      setCampagnes(Array.isArray(c.data) ? c.data : c.data.data || []);
      setClients(Array.isArray(cl.data) ? cl.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSend = async id => {
    if (!window.confirm('Envoyer cette campagne maintenant ?')) return;
    setActionId(id);
    try { await api.post(`/api/campagnes/send/${id}`); fetchAll(); }
    catch { alert("Erreur lors de l'envoi"); }
    finally { setActionId(null); }
  };

  const handleSchedule = async (id, date) => {
    if (!date) return;
    setActionId(id);
    try {
      await api.patch(`/api/campagnes/${id}`, { status: 'scheduled', dateScheduled: date });
      setScheduleModal(null); fetchAll();
    } catch { alert('Erreur planification'); }
    finally { setActionId(null); }
  };

  const handleToDraft = async id => {
    if (!window.confirm('Remettre en brouillon ?')) return;
    setActionId(id);
    try { await api.patch(`/api/campagnes/${id}`, { status: 'draft', dateScheduled: null }); fetchAll(); }
    catch { alert('Erreur'); }
    finally { setActionId(null); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try { await api.delete(`/api/campagnes/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
  };

  const filtered = campagnes.filter(c => {
    const mS = filter === 'all'     || c.status === filter;
    const mT = typeFilter === 'all' || c.type?.toLowerCase() === typeFilter;
    const mQ = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mS && mT && mQ;
  });

  const stats = [
    { label: 'Total',      value: campagnes.length,                               color: C.gold,   dim: C.goldDim,  icon: '📢' },
    { label: 'Envoyées',   value: campagnes.filter(c => c.status === 'sent').length,      color: C.green,  dim: C.greenDim, icon: '✅' },
    { label: 'Planifiées', value: campagnes.filter(c => c.status === 'scheduled').length, color: C.blue,   dim: C.blueDim,  icon: '🕐' },
    { label: 'Brouillons', value: campagnes.filter(c => c.status === 'draft').length,     color: C.purple, dim: C.purpleDim,icon: '📝' },
  ];

  const STATUS_FILTERS = [['all','Tous'], ['sent','Envoyées'], ['scheduled','Planifiées'], ['draft','Brouillons']];
  const TYPE_FILTERS   = [['all','Tous types'], ['email','📧 Email'], ['sms','📱 SMS'], ['push','🔔 Push']];
  const TABLE_HEADS    = ['TITRE & CLIENT', 'CANAL', 'STATUT', 'DATE', 'ACTIONS'];

  const formatDate = d => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {showCreate && <CreateModal clients={clients} onClose={() => setShowCreate(false)} onSave={fetchAll} />}
      {scheduleModal && <ScheduleModal modal={scheduleModal} onClose={() => setScheduleModal(null)} onConfirm={handleSchedule} loading={actionId === scheduleModal.id} />}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Campagnes</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            Gérez et suivez toutes vos campagnes marketing
          </p>
        </div>
        <button className="dl-btn-add" onClick={() => setShowCreate(true)} style={{
          background: C.gold, color: C.navy,
          border: 'none', padding: '11px 22px',
          borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontSize: 16 }}>+</span> Nouvelle campagne
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
              width: 48, height: 48, borderRadius: '50%',
              background: s.dim, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {loading ? <Skel w={36} h={26} /> : s.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar (search + filtres) ── */}
      <div style={{
        background: C.card, borderRadius: 14,
        border: `1.5px solid ${C.border}`,
        padding: '14px 18px', marginBottom: 18,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        boxShadow: C.shadow,
        animation: 'fadeUp 0.4s ease 300ms both',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textMuted }}>🔍</span>
          <input className="dl-input"
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une campagne..."
            style={{ ...inputBase, paddingLeft: 40, padding: '9px 14px 9px 40px' }}
          />
        </div>

        {/* Séparateur */}
        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 5 }}>
          {STATUS_FILTERS.map(([val, lbl]) => (
            <button key={val} className="dl-filter"
              onClick={() => setFilter(val)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                border: `1.5px solid ${filter === val ? C.gold : C.border}`,
                background: filter === val ? C.goldDim : 'none',
                color: filter === val ? C.goldDark : C.textMuted,
              }}>{lbl}</button>
          ))}
        </div>

        {/* Séparateur */}
        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 5 }}>
          {TYPE_FILTERS.map(([val, lbl]) => (
            <button key={val} className="dl-filter"
              onClick={() => setTypeFilter(val)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                border: `1.5px solid ${typeFilter === val ? C.blue : C.border}`,
                background: typeFilter === val ? C.blueDim : 'none',
                color: typeFilter === val ? C.blue : C.textMuted,
              }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: C.card, borderRadius: 16,
        border: `1.5px solid ${C.border}`,
        boxShadow: C.shadow, overflow: 'hidden',
        animation: 'fadeUp 0.4s ease 360ms both',
      }}>
        {/* table top bar */}
        <div style={{
          padding: '13px 20px', borderBottom: `1.5px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafbfd',
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>
            Liste des campagnes
            <span style={{
              marginLeft: 10, fontSize: 11, fontWeight: 700,
              background: C.goldDim, color: C.goldDark,
              border: `1px solid ${C.goldBorder}`,
              padding: '2px 9px', borderRadius: 20,
            }}>{filtered.length} / {campagnes.length}</span>
          </span>
          {search && <span style={{ fontSize: 12, color: C.textMuted }}>Résultats pour "<b>{search}</b>"</span>}
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 2 }}><Skel h={14} w="70%" /><div style={{ marginTop: 6 }}><Skel h={11} w="40%" r={4} /></div></div>
                <Skel w={70} h={24} r={20} />
                <Skel w={80} h={24} r={20} />
                <Skel w={90} h={14} r={4} />
                <div style={{ display: 'flex', gap: 6 }}><Skel w={70} h={30} r={8} /><Skel w={70} h={30} r={8} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ fontSize: 44, opacity: 0.2, marginBottom: 14 }}>📢</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucune campagne trouvée</div>
            <div style={{ fontSize: 13 }}>
              {search ? `Aucun résultat pour "${search}"` : 'Créez votre première campagne'}
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
                const sc  = STATUS[c.status] || STATUS.draft;
                const tc  = TYPE[c.type?.toLowerCase()];
                const isL = actionId === c.id;
                return (
                  <tr key={c.id} className="dl-row" style={{
                    borderBottom: `1px solid ${C.border}`,
                    animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                  }}>
                    {/* Titre & Client */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{c.client?.name || '—'}</div>
                    </td>

                    {/* Canal */}
                    <td style={{ padding: '14px 18px' }}>
                      {tc
                        ? <Pill label={`${tc.icon} ${tc.label}`} color={tc.color} bg={tc.bg} border={tc.border} />
                        : <span style={{ fontSize: 12, color: C.textMuted }}>{c.type}</span>
                      }
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '14px 18px' }}>
                      <Pill label={sc.label} color={sc.color} bg={sc.bg} border={sc.border} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 18px', fontSize: 12.5, color: C.textMuted, fontWeight: 500 }}>
                      {formatDate(c.dateScheduled)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* Envoyer */}
                        {c.status !== 'sent' && (
                          <button className="dl-btn" onClick={() => handleSend(c.id)} disabled={isL}
                            style={{
                              background: C.goldDim, color: C.goldDark,
                              border: `1px solid ${C.goldBorder}`,
                              padding: '6px 13px', borderRadius: 8,
                              fontSize: 11.5, fontWeight: 700, cursor: isL ? 'not-allowed' : 'pointer',
                              opacity: isL ? 0.5 : 1,
                            }}>▶ Envoyer</button>
                        )}

                        {/* Planifier */}
                        {c.status === 'draft' && (
                          <button className="dl-btn"
                            onClick={() => setScheduleModal({ id: c.id, date: c.dateScheduled || '' })}
                            disabled={isL}
                            style={{
                              background: C.blueDim, color: C.blue,
                              border: '1px solid rgba(59,130,246,0.25)',
                              padding: '6px 13px', borderRadius: 8,
                              fontSize: 11.5, fontWeight: 700, cursor: isL ? 'not-allowed' : 'pointer',
                              opacity: isL ? 0.5 : 1,
                            }}>🕐 Planifier</button>
                        )}

                        {/* Brouillon */}
                        {(c.status === 'scheduled' || c.status === 'sent') && (
                          <button className="dl-btn" onClick={() => handleToDraft(c.id)} disabled={isL}
                            style={{
                              background: C.purpleDim, color: C.purple,
                              border: '1px solid rgba(139,92,246,0.25)',
                              padding: '6px 13px', borderRadius: 8,
                              fontSize: 11.5, fontWeight: 700, cursor: isL ? 'not-allowed' : 'pointer',
                              opacity: isL ? 0.5 : 1,
                            }}>📝 Brouillon</button>
                        )}

                        {/* Supprimer */}
                        <button className="dl-btn" onClick={() => handleDelete(c.id)}
                          style={{
                            background: C.redDim, color: C.red,
                            border: '1px solid rgba(239,68,68,0.22)',
                            padding: '6px 13px', borderRadius: 8,
                            fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                          }}>🗑</button>
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