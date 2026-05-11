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

/* ─── Rôles ───────────────────────────────────────────────────── */
const ROLES = {
  ADMIN:                 'ADMIN',
  RESPONSABLE_MARKETING: 'RESPONSABLE_MARKETING',
  CLIENT:                'CLIENT',
};

const ROLE_STYLE = {
  ADMIN:                 { bg: 'rgba(245,166,35,0.12)', color: '#c8831a', border: 'rgba(245,166,35,0.3)', icon: '👑', label: 'Admin' },
  RESPONSABLE_MARKETING: { bg: 'rgba(59,130,246,0.10)', color: '#2563eb', border: 'rgba(59,130,246,0.3)', icon: '🎯', label: 'Marketing' },
  CLIENT:                { bg: 'rgba(34,197,94,0.10)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)',  icon: '👤', label: 'Client' },
};

const AVATAR_COLORS = [C.gold, C.blue, C.green, C.purple, '#ec4899', '#14b8a6', '#f97316'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials    = name => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
const formatDate  = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── CSS ─────────────────────────────────────────────────────── */
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
  .dl-stat { transition:all 0.22s ease!important; }
  .dl-stat:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.15)!important; border-color:#f5a623!important; }
  .dl-row:hover td { background:#fafbff!important; }
  .dl-btn-del { transition:all 0.15s; }
  .dl-btn-del:hover { background:rgba(239,68,68,0.15)!important; }
  .dl-btn-add { transition:all 0.2s; }
  .dl-btn-add:hover { transform:translateY(-2px)!important; box-shadow:0 8px 22px rgba(245,166,35,0.35)!important; }
  .dl-input:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
  .dl-select:focus { border-color:#f5a623!important; box-shadow:0 0 0 3px rgba(245,166,35,0.12)!important; outline:none; }
`;

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)',
      backgroundSize: '500px 100%',
      animation: 'shimmer 1.4s infinite linear',
    }} />
  );
}

/* ─── Modal ajout utilisateur ────────────────────────────────── */
function AddUserModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: ROLES.CLIENT });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [showPass, setShowPass] = useState(false);

  const handle = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/api/users', form);
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const roleColor = ROLE_STYLE[form.role]?.color || C.gold;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeUp 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.card, borderRadius: 20,
        width: '100%', maxWidth: 500,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 28px 70px rgba(10,14,42,0.22)', overflow: 'hidden',
      }}>
        {/* Header navy */}
        <div style={{
          background: C.navy, padding: '20px 26px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 18, height: 2, background: C.gold, borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Nouvel Utilisateur</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Créer un compte</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '24px 26px' }}>
          {error && (
            <div style={{
              background: C.redDim, border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 18,
              fontSize: 13, color: C.red, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>⚠️ {error}</div>
          )}

          {/* Sélecteur de rôle visuel */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>
              Rôle *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {Object.entries(ROLES).map(([key, val]) => {
                const rs = ROLE_STYLE[val];
                const selected = form.role === val;
                return (
                  <div key={key} onClick={() => setForm(p => ({ ...p, role: val }))}
                    style={{
                      padding: '12px 10px', borderRadius: 12, textAlign: 'center',
                      border: `1.5px solid ${selected ? rs.color : C.border}`,
                      background: selected ? rs.bg : '#fafbfd',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: selected ? `0 4px 14px ${rs.bg}` : 'none',
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{rs.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: selected ? rs.color : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rs.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Champs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>Nom complet *</label>
              <input className="dl-input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Ahmed Ben Ali"
                style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13.5, color: C.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>Email *</label>
              <input className="dl-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@exemple.com"
                style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13.5, color: C.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.text, display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>Mot de passe *</label>
            <div style={{ position: 'relative' }}>
              <input className="dl-input"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 caractères"
                style={{ width: '100%', padding: '11px 44px 11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13.5, color: C.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.textMuted,
              }}>{showPass ? '🙈' : '👁️'}</button>
            </div>
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
              {saving ? 'Création...' : '+ Créer l\'utilisateur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/users/${id}`); fetchAll(); }
    catch { alert('Erreur suppression'); }
    finally { setDeletingId(null); }
  };

  const filtered = users.filter(u => {
    const mR = roleFilter === 'all' || u.role === roleFilter;
    const mQ = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return mR && mQ;
  });

  const admins   = users.filter(u => u.role === ROLES.ADMIN).length;
  const managers = users.filter(u => u.role === ROLES.RESPONSABLE_MARKETING).length;
  const clients  = users.filter(u => u.role === ROLES.CLIENT).length;

  const stats = [
    { label: 'Total',      value: users.length, color: C.gold,   dim: C.goldDim,  icon: '👥' },
    { label: 'Admins',     value: admins,        color: C.goldDark, dim: C.goldDim, icon: '👑' },
    { label: 'Marketing',  value: managers,      color: C.blue,   dim: C.blueDim,  icon: '🎯' },
    { label: 'Clients',    value: clients,        color: C.green,  dim: C.greenDim, icon: '👤' },
  ];

  const TABLE_HEADS = ['UTILISATEUR', 'EMAIL', 'RÔLE', 'CRÉÉ LE', 'ACTIONS'];

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      padding: '28px 32px',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      color: C.text, boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {showForm && <AddUserModal onClose={() => setShowForm(false)} onSave={fetchAll} />}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 26, animation: 'fadeUp 0.35s ease both',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Utilisateurs</h1>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, marginLeft: 14 }}>
            {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="dl-btn-add" onClick={() => setShowForm(true)} style={{
          background: C.gold, color: C.navy,
          border: 'none', padding: '11px 22px',
          borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
        }}>
          + Nouvel utilisateur
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
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: s.dim, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {loading ? <Skel w={36} h={24} /> : s.value}
              </div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18,
        animation: 'fadeUp 0.4s ease 300ms both', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textMuted }}>🔍</span>
          <input className="dl-input" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            style={{ width: '100%', padding: '10px 14px 10px 40px', border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 13.5, color: C.text, background: C.card, boxSizing: 'border-box', fontFamily: 'inherit', boxShadow: C.shadow, transition: 'border-color .2s, box-shadow .2s' }}
          />
        </div>

        {/* Filtre rôle */}
        <div style={{ display: 'flex', background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 3, gap: 2, boxShadow: C.shadow }}>
          {[
            { val: 'all',                       lbl: 'Tous' },
            { val: ROLES.ADMIN,                 lbl: '👑 Admin' },
            { val: ROLES.RESPONSABLE_MARKETING, lbl: '🎯 Marketing' },
            { val: ROLES.CLIENT,                lbl: '👤 Client' },
          ].map(f => (
            <button key={f.val} onClick={() => setRoleFilter(f.val)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: roleFilter === f.val ? C.gold : 'none',
              color:      roleFilter === f.val ? C.navy : C.textMuted,
              boxShadow:  roleFilter === f.val ? '0 2px 8px rgba(245,166,35,0.25)' : 'none',
              transition: 'all 0.18s',
            }}>{f.lbl}</button>
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
        {/* Table top bar */}
        <div style={{
          padding: '13px 20px', borderBottom: `1.5px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafbfd',
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>
            Liste des utilisateurs
            <span style={{
              marginLeft: 10, fontSize: 11, fontWeight: 700,
              background: C.goldDim, color: C.goldDark,
              border: `1px solid ${C.goldBorder}`,
              padding: '2px 9px', borderRadius: 20,
            }}>{filtered.length}</span>
          </span>
          {search && <span style={{ fontSize: 12, color: C.textMuted }}>Résultats pour "<b>{search}</b>"</span>}
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skel w={40} h={40} r={11} />
                <div style={{ flex: 1 }}><Skel h={14} w="40%" /><div style={{ marginTop: 6 }}><Skel h={11} w="25%" r={4} /></div></div>
                <Skel w={150} h={13} r={4} />
                <Skel w={90} h={24} r={20} />
                <Skel w={80} h={13} r={4} />
                <Skel w={80} h={30} r={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ fontSize: 44, opacity: 0.2, marginBottom: 14 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucun utilisateur trouvé</div>
            <div style={{ fontSize: 13 }}>{search ? `Aucun résultat pour "${search}"` : 'Créez le premier utilisateur'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.navy }}>
                {TABLE_HEADS.map(h => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: C.gold }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const role = ROLE_STYLE[u.role] || ROLE_STYLE.CLIENT;
                const col  = avatarColor(u.name);
                return (
                  <tr key={u.id} className="dl-row" style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: 'background .15s',
                    animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                  }}>
                    {/* Utilisateur */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                          background: `${col}15`, border: `1.5px solid ${col}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: col,
                        }}>{initials(u.name)}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '14px 18px' }}>
                      <a href={`mailto:${u.email}`} style={{ fontSize: 13, color: C.blue, textDecoration: 'none', fontWeight: 500 }}>{u.email}</a>
                    </td>
                    {/* Rôle */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: role.bg, color: role.color,
                        border: `1px solid ${role.border}`,
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                        {role.icon} {role.label}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ padding: '14px 18px', fontSize: 12.5, color: C.textMuted, fontWeight: 500 }}>
                      {formatDate(u.createdAt)}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 18px' }}>
                      <button className="dl-btn-del"
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        style={{
                          background: C.redDim, color: C.red,
                          border: '1px solid rgba(239,68,68,0.2)',
                          padding: '6px 14px', borderRadius: 8,
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          opacity: deletingId === u.id ? 0.5 : 1,
                        }}>
                        {deletingId === u.id ? '...' : 'Supprimer'}
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