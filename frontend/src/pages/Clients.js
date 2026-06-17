import React, { useState, useEffect } from 'react';
import api from '../api';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM DIGILAB
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg:        '#f0f2f8',
  card:      '#ffffff',
  navy:      '#16120d',
  gold:      '#f5a623',
  goldDark:  '#c8831a',
  goldDim:   'rgba(245,166,35,0.10)',
  goldBorder:'rgba(245,166,35,0.28)',
  border:    '#e4e9f2',
  text:      '#1a1f3c',
  muted:     '#7a8599',
  blue:      '#3b82f6',
  blueDim:   'rgba(59,130,246,0.10)',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.10)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  purple:    '#8b5cf6',
  purpleDim: 'rgba(139,92,246,0.10)',
  orange:    '#f97316',
  orangeDim: 'rgba(249,115,22,0.10)',
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

/* ─── Types d'utilisateurs ───────────────────────────────────── */
const USER_TYPES = {
  particulier:  { label: 'Particulier',  color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)', icon: '👤' },
  entreprise:   { label: 'Entreprise',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)',  icon: '🏢' },
  agence:       { label: 'Agence',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)', icon: '🏛️' },
  etablissement:{ label: 'Établissement',color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)', icon: '🎓' },
};

/* ─── Segments des participants ──────────────────────────────── */
const SEGMENTS = {
  debutant:     { label: 'Débutant',     color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)', icon: '🌱' },
  etudiant:     { label: 'Étudiant',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)', icon: '📚' },
  professionnel:{ label: 'Professionnel',color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)',  icon: '💼' },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const AVATAR_COLORS = [T.gold, T.blue, T.green, T.purple, '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
const avatarColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Skel({ w = '100%', h = 16, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize: '500px 100%', animation: 'shimmer 1.4s infinite linear' }} />;
}

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, color,
      background: bg, border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: DÉTAIL CLIENT (avec onglet Participants = Contacts)
   ═══════════════════════════════════════════════════════════════ */
function ClientDetailModal({ client, onClose, campagnes }) {
  const [activeTab, setActiveTab] = useState('participants');
  const typeInfo = USER_TYPES[client.type];

  const tabs = [
    ['participants', '👥 Participants', client.participants?.length || 0],
    ['campagnes', '📢 Campagnes', client.campagnesInscrites?.length || 0],
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 800, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: T.navy, padding: '24px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `${avatarColor(client.name)}20`,
              border: `2px solid ${avatarColor(client.name)}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: avatarColor(client.name),
            }}>{initials(client.name)}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{client.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{client.sector}</span>
                <span style={{ fontSize: 12, color: client.status === 'active' ? T.green : T.red }}>
                  {client.status === 'active' ? '🟢 Actif' : '🔴 Inactif'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 1, background: T.border,
        }}>
          {[
            { label: 'Participants', value: client.participants?.length || 0, color: T.blue },
            { label: 'Campagnes', value: client.campagnesInscrites?.length || 0, color: T.gold },
            { label: 'Inscrit le', value: fmtDate(client.createdAt), color: T.green },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fafbfd', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd' }}>
          {tabs.map(([key, label, count]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                padding: '14px 20px', border: 'none', background: 'none',
                fontSize: 13, fontWeight: activeTab === key ? 700 : 500,
                color: activeTab === key ? T.goldDark : T.muted,
                borderBottom: `2px solid ${activeTab === key ? T.gold : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {label}
              {count !== null && (
                <span style={{
                  background: activeTab === key ? T.goldDim : 'rgba(107,114,128,0.1)',
                  color: activeTab === key ? T.goldDark : T.muted,
                  padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* TAB: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                    Participants · {client.name}
                  </h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: '4px 0 0' }}>
                    {client.type === 'particulier' 
                      ? 'Ce particulier est inscrit comme participant' 
                      : `Participants inscrits par cette ${USER_TYPES[client.type]?.label.toLowerCase()}`}
                  </p>
                </div>
                <Pill label="🔒 Données isolées" color={T.green} bg={T.greenDim} border="rgba(34,197,94,0.25)" />
              </div>

              {(!client.participants || client.participants.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                  <div>Aucun participant</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {client.participants.map(p => {
                    const seg = SEGMENTS[p.segment];
                    const campagne = campagnes.find(c => c.id === p.campagneId);
                    return (
                      <div key={p.id} style={{
                        background: '#fafbfd', borderRadius: 12,
                        border: `1px solid ${T.border}`, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: `${avatarColor(p.name)}15`,
                          border: `1.5px solid ${avatarColor(p.name)}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: avatarColor(p.name),
                          flexShrink: 0,
                        }}>{initials(p.name)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            {p.email} · {p.phone}
                          </div>
                          {campagne && (
                            <div style={{ fontSize: 11, color: T.goldDark, marginTop: 4, fontWeight: 600 }}>
                              📢 {campagne.title}
                            </div>
                          )}
                        </div>
                        <Pill label={`${seg?.icon} ${seg?.label}`} color={seg?.color} bg={seg?.bg} border={seg?.border} />
                        <Pill label={p.status === 'active' ? '✓ Actif' : '✕ Inactif'} 
                          color={p.status === 'active' ? T.green : T.red}
                          bg={p.status === 'active' ? T.greenDim : T.redDim}
                          border={p.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'} />
                        <span style={{ fontSize: 11, color: T.muted }}>
                          {fmtDate(p.dateinscription)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: CAMPAGNES */}
          {activeTab === 'campagnes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                  Campagnes inscrites · {client.name}
                </h3>
                <Pill label="🔒 Données isolées" color={T.green} bg={T.greenDim} border="rgba(34,197,94,0.25)" />
              </div>
              {(!client.campagnesInscrites || client.campagnesInscrites.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📢</div>
                  <div>Aucune inscription</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {client.campagnesInscrites.map(campId => {
                    const campagne = campagnes.find(c => c.id === campId);
                    return (
                      <div key={campId} style={{
                        background: '#fafbfd', borderRadius: 12,
                        border: `1px solid ${T.border}`, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: T.goldDim, border: `1.5px solid ${T.goldBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, flexShrink: 0,
                        }}>📢</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                            {campagne?.title || `Campagne #${campId}`}
                          </div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            {client.participants.filter(p => p.campagneId === campId).length} participant(s)
                          </div>
                        </div>
                        <Pill label="✓ Inscrit" color={T.green} bg={T.greenDim} border="rgba(34,197,94,0.25)" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Ajout / Édition client
   ═══════════════════════════════════════════════════════════════ */
function ClientModal({ client, onClose, onSave }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    type: client?.type || 'entreprise',
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    sector: client?.sector || '',
    status: client?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handle = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let newClient;
      if (isEdit) {
        const res = await api.put(`/api/clients/${client.id}`, form);
        newClient = res.data;
      } else {
        const res = await api.post('/api/clients', form);
        newClient = res.data;
      }
      onSave(newClient, isEdit);
      onClose();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ fkey, label, placeholder, type = 'text' }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={form[fkey]}
        onChange={e => { setForm(p => ({ ...p, [fkey]: e.target.value })); setErrors(p => ({ ...p, [fkey]: '' })); }}
        onKeyDown={e => e.key === 'Enter' && handle()}
        style={{
          width: '100%', padding: '10px 14px',
          border: `1.5px solid ${errors[fkey] ? T.red : T.border}`, borderRadius: 10,
          fontSize: 13, color: T.text, background: errors[fkey] ? 'rgba(239,68,68,0.03)' : '#fafbfd',
          boxSizing: 'border-box', fontFamily: T.sans, outline: 'none', transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = errors[fkey] ? T.red : T.gold}
        onBlur={e => e.target.style.borderColor = errors[fkey] ? T.red : T.border}
      />
      {errors[fkey] && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>⚠ {errors[fkey]}</div>}
    </div>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 460, padding: '32px',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.goldDim, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {isEdit ? '✏️' : '👤'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{isEdit ? 'Modifier' : 'Nouvel'} utilisateur</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{isEdit ? form.name : 'Ajouter à DigiLab'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', fontSize: 14, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Type */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Type *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(USER_TYPES).map(([key, info]) => (
              <button key={key} onClick={() => setForm(p => ({ ...p, type: key }))}
                style={{
                  padding: '12px', borderRadius: 10,
                  border: `2px solid ${form.type === key ? info.color : T.border}`,
                  background: form.type === key ? info.bg : '#fff',
                  color: form.type === key ? info.color : T.muted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                <span style={{ fontSize: 16 }}>{info.icon}</span>
                {info.label}
              </button>
            ))}
          </div>
        </div>

        <Field fkey="name" label="Nom / Raison sociale *" placeholder="Ex: DigiLab Solutions" />
        <Field fkey="email" label="Email" placeholder="contact@exemple.com" type="email" />
        <Field fkey="phone" label="Téléphone" placeholder="+216 XX XXX XXX" type="tel" />
        <Field fkey="sector" label="Secteur" placeholder="Ex: Marketing Digital" />

        {/* Status */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Statut</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['active', 'inactive'].map(st => (
              <button key={st} onClick={() => setForm(p => ({ ...p, status: st }))}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: `2px solid ${form.status === st ? (st === 'active' ? T.green : T.red) : T.border}`,
                  background: form.status === st ? (st === 'active' ? T.greenDim : T.redDim) : '#fff',
                  color: form.status === st ? (st === 'active' ? T.green : T.red) : T.muted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>
                {st === 'active' ? '🟢 Actif' : '🔴 Inactif'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handle} disabled={saving} style={{
            flex: 2, padding: '11px', borderRadius: 10, border: 'none',
            background: saving ? T.muted : T.gold, fontSize: 13, fontWeight: 800, color: T.navy,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
          }}>
            {saving ? '⏳ ...' : isEdit ? '✓ Enregistrer' : '+ Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARD client
   ═══════════════════════════════════════════════════════════════ */
function ClientCard({ client, onEdit, onDelete, onView, idx }) {
  const [hov, setHov] = useState(false);
  const color = avatarColor(client.name);
  const typeInfo = USER_TYPES[client.type];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onView(client)}
      style={{
        background: T.card, borderRadius: 18,
        border: `1.5px solid ${hov ? T.gold : T.border}`,
        padding: '22px 22px 18px',
        boxShadow: hov ? '0 12px 36px rgba(245,166,35,0.13)' : '0 1px 8px rgba(10,14,42,0.06)',
        transition: 'all 0.22s', transform: hov ? 'translateY(-3px)' : 'none',
        animation: `fadeUp 0.4s ease ${idx * 60}ms both`,
        display: 'flex', flexDirection: 'column', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
          background: `${color}15`, border: `1.5px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color,
        }}>{initials(client.name)}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(client); }} style={{
            background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.2)`,
            padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>✏</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(client.id); }} style={{
            background: T.redDim, color: T.red, border: `1px solid rgba(239,68,68,0.2)`,
            padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>✕</button>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4 }}>{client.name}</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>{client.sector}</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
        <Pill label={client.status === 'active' ? '🟢 Actif' : '🔴 Inactif'}
          color={client.status === 'active' ? T.green : T.red}
          bg={client.status === 'active' ? T.greenDim : T.redDim}
          border={client.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'} />
      </div>

      {client.email && <a href={`mailto:${client.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: T.blue, textDecoration: 'none', fontWeight: 500, marginBottom: 4, display: 'block' }}>{client.email}</a>}
      {client.phone && <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>📱 {client.phone}</div>}

      <div style={{ height: 1, background: T.border, margin: '12px 0 10px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: T.muted }}>📅 {fmtDate(client.createdAt)}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.25)`, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            👥 {client.participants?.length || 0}
          </span>
          <span style={{ background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
  📢 {client.inscriptionsCount || 0}
      </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE CLIENTS (connectée à l'API)
   ═══════════════════════════════════════════════════════════════ */
export default function Clients() {
  const [clients, setClients] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Charger les données depuis l'API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Charger les clients et les campagnes en parallèle
      const [clientsRes, campagnesRes] = await Promise.all([
        api.get('/api/clients').catch(() => ({ data: [] })),
        api.get('/api/campagnes/public').catch(() => ({ data: [] }))
      ]);

      // Transformer les données clients pour le format attendu
      const clientsFormates = clientsRes.data.map(c => ({
  id: c.id,
  type: c.type || 'entreprise',
  name: c.name,
  email: c.email,
  phone: c.phone,
  createdAt: c.createdAt,
  sector: c.sector || 'Non spécifié',
  status: c.status || 'active',
  inscriptionsCount: c.inscriptionsCount || 0,  // ← CORRECT
  participants: c.users || [],  // ← les users sont les participants
  campagnesInscrites: c.inscription?.map(i => i.campagneId) || [],  // ← les campagnes des inscriptions
}));

      setClients(clientsFormates);
      setCampagnes(campagnesRes.data);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newClient, isEdit) => {
    await fetchData(); // Recharger depuis l'API
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ? Tous ses participants seront supprimés.')) return;
    try {
      await api.delete(`/api/clients/${id}`);
      await fetchData();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = clients.filter(c => {
    const mSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.sector?.toLowerCase().includes(search.toLowerCase());
    const mType = typeFilter === 'all' || c.type === typeFilter;
    const mSeg = segmentFilter === 'all' || c.participants?.some(p => p.segment === segmentFilter);
    return mSearch && mType && mSeg;
  });

  const totalParticipants = clients.reduce((a, c) => a + (c.participants?.length || 0), 0);
const totalinscriptions = clients.reduce((a, c) => a + (c.inscriptionsCount || 0), 0);
const stats = [
  { label: 'Utilisateurs', value: clients.length, color: T.gold, dim: T.goldDim, icon: '👤' },
  { label: 'Participants', value: totalParticipants, color: T.blue, dim: T.blueDim, icon: '👥' },
  { label: 'inscriptions', value: totalinscriptions, color: T.purple, dim: T.purpleDim, icon: '📢' },
];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 32px', fontFamily: T.sans, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .kcard:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.14)!important; border-color:#f5a623!important; }
        .crow:hover td { background:rgba(245,166,35,0.03)!important; }
      `}</style>

      {/* Modals */}
      {modal && <ClientModal client={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {detailClient && <ClientDetailModal client={detailClient} onClose={() => setDetailClient(null)} campagnes={campagnes} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, animation: 'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 4, height: 24, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Clients & Contacts</h1>
          </div>
          <p style={{ color: T.muted, fontSize: 13, margin: '0 0 0 14px' }}>
            {clients.length} utilisateurs · {totalParticipants} participants · Fusion Clients + Contacts
          </p>
        </div>
        <button onClick={() => setModal('add')} style={{
          background: T.gold, color: T.navy, border: 'none',
          padding: '11px 22px', borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontSize: 16 }}>+</span> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} className="kcard" style={{
            background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`,
            padding: '18px 20px', boxShadow: '0 1px 8px rgba(10,14,42,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: `fadeUp 0.4s ease ${i * 65}ms both`,
          }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: s.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? <Skel w={40} h={24} /> : s.value.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`,
        padding: '12px 16px', marginBottom: 18,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        boxShadow: '0 1px 8px rgba(10,14,42,0.05)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: T.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{
              width: '100%', padding: '9px 14px 9px 36px',
              border: `1.5px solid ${T.border}`, borderRadius: 10,
              fontSize: 13, color: T.text, background: '#fafbfd',
              boxSizing: 'border-box', fontFamily: T.sans,
            }}
            onFocus={e => e.target.style.borderColor = T.gold}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>

        {/* Filtre type */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[
            ['all', 'Tous'],
            ['particulier', '👤'],
            ['entreprise', '🏢'],
            ['agence', '🏛️'],
            ['etablissement', '🎓'],
          ].map(([val, lbl]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                border: `1.5px solid ${typeFilter === val ? T.gold : T.border}`,
                background: typeFilter === val ? T.goldDim : 'none',
                color: typeFilter === val ? T.goldDark : T.muted,
                cursor: 'pointer',
              }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Filtre segment */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[
            ['all', 'Tous'],
            ['debutant', '🌱'],
            ['etudiant', '📚'],
            ['professionnel', '💼'],
          ].map(([val, lbl]) => (
            <button key={val} onClick={() => setSegmentFilter(val)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                border: `1.5px solid ${segmentFilter === val ? T.purple : T.border}`,
                background: segmentFilter === val ? T.purpleDim : 'none',
                color: segmentFilter === val ? T.purple : T.muted,
                cursor: 'pointer',
              }}>
              {lbl}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12, color: T.muted }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        <div style={{ display: 'flex', background: '#f4f6fb', borderRadius: 9, padding: 3, gap: 2, border: `1.5px solid ${T.border}` }}>
          {[['grid', '⊞'], ['table', '☰']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700,
              background: view === v ? T.gold : 'none',
              color: view === v ? T.navy : T.muted,
              cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Vue Grille */}
      {view === 'grid' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 18, border: `1.5px solid ${T.border}`, padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><Skel w={50} h={50} r={14} /><Skel w={70} h={28} r={7} /></div>
                <Skel h={14} w="60%" /><div style={{ marginTop: 8 }}><Skel h={11} w="80%" r={4} /></div>
                <div style={{ marginTop: 16 }}><Skel h={1} /></div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}><Skel h={10} w="40%" r={4} /><Skel h={22} w="30%" r={20} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: T.muted, background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}` }}>
            <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 14 }}>👤</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun résultat</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {filtered.map((c, i) => (
              <ClientCard key={c.id} client={c} idx={i} onEdit={setModal} onDelete={handleDelete} onView={setDetailClient} />
            ))}
          </div>
        )
      )}

      {/* Vue Tableau */}
      {view === 'table' && (
        <div style={{ background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}`, boxShadow: '0 1px 8px rgba(10,14,42,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 20px', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Liste · <span style={{ fontSize: 11, fontWeight: 700, background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '2px 9px', borderRadius: 20 }}>{filtered.length}</span></span>
          </div>
          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Skel w={42} h={42} r={12} /><div style={{ flex: 1 }}><Skel h={13} w="35%" /></div>
                  <Skel w={150} h={12} r={4} /><Skel w={60} h={24} r={20} /><Skel w={100} h={30} r={8} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: T.muted }}>
              <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 14 }}>👤</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun résultat</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.navy }}>
                  {['Utilisateur', 'Type', 'Email', 'Téléphone', 'Participants', 'Campagnes', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: T.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const color = avatarColor(c.name);
                  const typeInfo = USER_TYPES[c.type];
                  return (
                    <tr key={c.id} className="crow" style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                      onClick={() => setDetailClient(c)}>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color }}>{initials(c.name)}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: T.muted }}>{c.sector}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        {c.email ? <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 13, color: T.blue, textDecoration: 'none' }}>{c.email}</a> : <span style={{ color: T.muted }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 13, color: T.muted }}>{c.phone || '—'}</td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.25)`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>👥 {c.participants?.length || 0}</span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
<span style={{ background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>📢 {c.inscriptionsCount || 0}</span>                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <Pill label={c.status === 'active' ? '🟢' : '🔴'} color={c.status === 'active' ? T.green : T.red} bg={c.status === 'active' ? T.greenDim : T.redDim} border={c.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'} />
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', gap: 7 }}>
                          <button onClick={(e) => { e.stopPropagation(); setModal(c); }} style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.2)`, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ background: T.redDim, color: T.red, border: `1px solid rgba(239,68,68,0.2)`, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.muted }}>
          © 2026 DigiLab Solutions · Clients & Contacts unifiés · DigiPip Cloud Engine
        </span>
      </div>
    </div>
  );
}
