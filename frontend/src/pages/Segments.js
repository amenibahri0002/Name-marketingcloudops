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
  teal:      '#14b8a6',
  tealDim:   'rgba(20,184,166,0.10)',
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   NIVEAUX (3 categories)
   ═══════════════════════════════════════════════════════════════ */
const NIVEAUX = {
  debutant:     { label: 'Debutant',      icon: '🌱', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)', description: 'Nouveau dans le domaine' },
  etudiant:     { label: 'Etudiant',      icon: '🎓', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)', description: 'En formation ou stage' },
  professionnel:{ label: 'Professionnel', icon: '💼', color: '#f5a623', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)', description: 'Experience confirmee' },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const AVATAR_COLORS = [T.gold, T.blue, T.green, T.purple, T.orange, T.teal, '#ec4899', '#6366f1'];
const avatarColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Skel({ w = '100%', h = 16, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize: '500px 100%', animation: 'shimmer 1.4s infinite linear' }} />;
}

function Pill({ label, color, bg, border }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>{label}</span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: CREER / EDITER UN SEGMENT (avec campagnes associees)
   ═══════════════════════════════════════════════════════════════ */
function SegmentModal({ segment, onClose, onSave, campagnesDisponibles }) {
  const isEdit = !!segment;
  const [form, setForm] = useState({
    name: segment?.name || '',
    niveau: segment?.niveau || 'debutant',
    criteria: segment?.criteria?.description || '',
    campagneIds: segment?.campagneIds || [],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom du segment requis';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        niveau: form.niveau,
        criteria: form.criteria ? { description: form.criteria } : {},
        campagneIds: form.campagneIds,
      };
      if (isEdit) {
        await api.put(`/api/segments/${segment.id}`, payload);
      } else {
        await api.post('/api/segments', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      const msg = err.response?.data?.error || err.message || 'Erreur';
      alert('Erreur: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleCampagne = (id) => {
    setForm(p => ({
      ...p,
      campagneIds: p.campagneIds.includes(id)
        ? p.campagneIds.filter(cid => cid !== id)
        : [...p.campagneIds, id]
    }));
  };

  const niveauInfo = NIVEAUX[form.niveau];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 600, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ background: T.navy, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.goldDim, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🎯
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{isEdit ? 'Modifier' : 'Nouveau'} Segment</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Definissez le niveau et les campagnes associees</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Nom */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nom du segment *</label>
            <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="Ex: Prospects Debutants Marketing"
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${errors.name ? T.red : T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: errors.name ? 'rgba(239,68,68,0.03)' : '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = errors.name ? T.red : T.gold}
              onBlur={e => e.target.style.borderColor = errors.name ? T.red : T.border}
            />
            {errors.name && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>⚠ {errors.name}</div>}
          </div>

          {/* Niveau */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Niveau cible *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(NIVEAUX).map(([key, info]) => (
                <button key={key} onClick={() => setForm(p => ({ ...p, niveau: key }))}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 12,
                    border: `2px solid ${form.niveau === key ? info.color : T.border}`,
                    background: form.niveau === key ? info.bg : '#fff',
                    color: form.niveau === key ? info.color : T.muted,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: 24 }}>{info.icon}</span>
                  <span>{info.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>{info.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Criteres */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Criteres (optionnel)</label>
            <textarea value={form.criteria} onChange={e => setForm(p => ({ ...p, criteria: e.target.value }))}
              placeholder="Decrivez les criteres de ce segment..."
              rows={2}
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Campagnes associees */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Campagnes associees ({form.campagneIds.length} selectionnee{form.campagneIds.length !== 1 ? 's' : ''})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', padding: 4 }}>
              {campagnesDisponibles.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: T.muted, fontSize: 13 }}>Aucune campagne disponible</div>
              ) : (
                campagnesDisponibles.map(c => (
                  <button key={c.id} onClick={() => toggleCampagne(c.id)}
                    style={{
                      padding: '12px 16px', borderRadius: 10,
                      border: `2px solid ${form.campagneIds.includes(c.id) ? T.gold : T.border}`,
                      background: form.campagneIds.includes(c.id) ? T.goldDim : '#fff',
                      color: form.campagneIds.includes(c.id) ? T.goldDark : T.text,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      textAlign: 'left', transition: 'all 0.15s',
                    }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f0f2f8' }}>
                      {c.image ? <img src={c.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📢</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.type} · {c.prix ? c.prix + ' TND' : 'Gratuit'} · {c.placesRestantes || 0} places</div>
                    </div>
                    {form.campagneIds.includes(c.id) && <span style={{ fontSize: 16, color: T.gold }}>✓</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 28px', borderTop: `1.5px solid ${T.border}`, display: 'flex', gap: 10, background: '#fafbfd' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            flex: 2, padding: '12px', borderRadius: 10, border: 'none',
            background: saving ? T.muted : T.gold, fontSize: 13, fontWeight: 800, color: T.navy,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {saving ? '⏳ ...' : `🎯 ${isEdit ? 'Enregistrer' : 'Creer le segment'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: VOIR LES CLIENTS D'UN SEGMENT
   ═══════════════════════════════════════════════════════════════ */
function SegmentClientsModal({ segment, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const niv = NIVEAUX[segment.niveau] || NIVEAUX.debutant;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get(`/api/segments/niveau/${segment.niveau}`);
        setContacts(res.data || []);
      } catch (err) {
        console.error('Erreur chargement contacts:', err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [segment.niveau]);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 600, maxHeight: '85vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ background: T.navy, padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>👥 Clients du segment</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              <span style={{ color: niv.color }}>{niv.icon} {segment.name}</span> · {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(4)].map((_, i) => <Skel key={i} w="100%" h={56} r={12} />)}
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <div>Aucun contact dans ce segment</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map(contact => {
                const color = avatarColor(contact.name);
                return (
                  <div key={contact.id} style={{ background: '#fafbfd', borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${color}15`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{initials(contact.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{contact.name}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{contact.email} · {contact.phone || '—'}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{contact.secteur || '—'} · {contact.region || '—'}</div>
                    </div>
                    <Pill label={`${niv.icon} ${niv.label}`} color={niv.color} bg={niv.bg} border={niv.border} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: ENVOI CAMPAGNE / NOTIFICATION A UN SEGMENT
   ═══════════════════════════════════════════════════════════════ */
function SendCampaignModal({ segment, onClose, onSend }) {
  const [campagnes, setCampagnes] = useState([]);
  const [selectedCampagne, setSelectedCampagne] = useState('');
  const [canaux, setCanaux] = useState({ email: true, sms: false, push: false, whatsapp: false });
  const [messagePerso, setMessagePerso] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCampagnes, setLoadingCampagnes] = useState(true);
  const niv = NIVEAUX[segment.niveau] || NIVEAUX.debutant;

  useEffect(() => {
    api.get('/api/campagnes').then(r => setCampagnes(r.data || [])).catch(() => {}).finally(() => setLoadingCampagnes(false));
  }, []);

  const handleSend = async () => {
    if (!selectedCampagne) return;
    setLoading(true);
    try {
      await api.post(`/api/campagnes/send/${selectedCampagne}`, {
        segment: segment.niveau,
        canaux: Object.entries(canaux).filter(([_, v]) => v).map(([k]) => k),
        messagePerso: messagePerso || undefined,
      });
      onSend();
      onClose();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleCanal = (c) => setCanaux(p => ({ ...p, [c]: !p[c] }));

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: T.card, borderRadius: 22, width: 560, maxHeight: '90vh', boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`, animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: T.navy, padding: '24px 28px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>📢 Envoyer campagne segmentee</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Cible : <strong style={{ color: niv.color }}>{niv.icon} {segment.name}</strong></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Campagne a envoyer *</label>
            {loadingCampagnes ? <Skel w="100%" h={40} r={10} /> : (
              <select value={selectedCampagne} onChange={e => setSelectedCampagne(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${selectedCampagne ? T.gold : T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: selectedCampagne ? T.goldDim : '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans, cursor: 'pointer' }}>
                <option value="">Choisir une campagne...</option>
                {campagnes.map(c => <option key={c.id} value={c.id}>{c.title} — {c.type} · {c.prix} TND</option>)}
              </select>
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Canaux</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{k:'email',l:'📧 Email'},{k:'sms',l:'📱 SMS'},{k:'push',l:'🔔 Push'},{k:'whatsapp',l:'💬 WhatsApp'}].map(c => (
                <button key={c.k} onClick={() => toggleCanal(c.k)} style={{ padding: '12px', borderRadius: 10, border: `2px solid ${canaux[c.k] ? T.gold : T.border}`, background: canaux[c.k] ? T.goldDim : '#fff', color: canaux[c.k] ? T.goldDark : T.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{c.l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Message personnalise (optionnel)</label>
            <textarea value={messagePerso} onChange={e => setMessagePerso(e.target.value)} placeholder={`Bonjour, une nouvelle formation pour ${niv.label.toLowerCase()}s !`} rows={3} style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ padding: '18px 28px', borderTop: `1.5px solid ${T.border}`, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleSend} disabled={!selectedCampagne || loading || !Object.values(canaux).some(v => v)} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: (!selectedCampagne || loading) ? T.muted : T.gold, fontSize: 13, fontWeight: 800, color: T.navy, cursor: (!selectedCampagne || loading) ? 'not-allowed' : 'pointer', boxShadow: (!selectedCampagne || loading) ? 'none' : '0 4px 14px rgba(245,166,35,0.30)' }}>
            {loading ? '⏳ Envoi...' : '📢 Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE SEGMENTS - MAIN COMPONENT
   Architecture: Segments en lignes, avec campagnes et clients
   ═══════════════════════════════════════════════════════════════ */
export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentModal, setSegmentModal] = useState(null);
  const [clientsModal, setClientsModal] = useState(null);
  const [sendModal, setSendModal] = useState(null);
  const [search, setSearch] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [userRole, setUserRole] = useState('');

  // Charger les donnees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [segRes, campRes, contRes] = await Promise.all([
          api.get('/api/segments').catch(() => ({ data: [] })),
          api.get('/api/campagnes').catch(() => ({ data: [] })),
          api.get('/api/contacts').catch(() => ({ data: [] })),
        ]);
        setSegments(segRes.data || []);
        setCampagnes(campRes.data || []);
        setContacts(contRes.data || []);
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || user.poste || '');

    fetchData();
  }, []);

  const handleSaveSegment = () => {
    // Recharger les segments
    api.get('/api/segments').then(r => setSegments(r.data || [])).catch(() => {});
  };

  const handleDeleteSegment = async (id) => {
    if (!window.confirm('Supprimer ce segment ?')) return;
    try {
      await api.delete(`/api/segments/${id}`);
      setSegments(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  // Filtrer les segments
  const filtered = segments.filter(s => {
    const mSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const mNiveau = niveauFilter === 'all' || s.niveau === niveauFilter;
    return mSearch && mNiveau;
  });

  // Stats
  const totalContacts = contacts.length;
  const stats = [
    { label: 'Segments', value: segments.length, color: T.gold, dim: T.goldDim, icon: '🎯' },
    { label: 'Contacts', value: totalContacts, color: T.blue, dim: T.blueDim, icon: '👥' },
    { label: 'Campagnes', value: campagnes.length, color: T.purple, dim: T.purpleDim, icon: '📢' },
    { label: 'Debutants', value: contacts.filter(c => c.niveau === 'DEBUTANT' || c.niveau === 'debutant').length, color: T.green, dim: T.greenDim, icon: '🌱' },
  ];

  const isMarketing = userRole === 'MARKETING' || userRole === 'ADMIN' || userRole === 'Responsable Marketing' || userRole.toLowerCase().includes('marketing') || userRole.toLowerCase().includes('admin');

  // Helper: trouver les campagnes d'un segment
  const getCampagnesForSegment = (segment) => {
    if (!segment.campagneIds || segment.campagneIds.length === 0) return [];
    return campagnes.filter(c => segment.campagneIds.includes(c.id));
  };

  // Helper: trouver les contacts d'un segment par niveau
  const getContactsForSegment = (segment) => {
    return contacts.filter(c => c.niveau?.toLowerCase() === segment.niveau?.toLowerCase());
  };

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
        .niveau-card:hover { transform:translateY(-2px)!important; box-shadow:0 6px 20px rgba(0,0,0,0.08)!important; }
        .btn-add-segment:hover { transform:translateY(-2px)!important; box-shadow:0 6px 20px rgba(245,166,35,0.45)!important; }
        .btn-add-segment:active { transform:translateY(0)!important; }
      `}</style>

      {segmentModal && <SegmentModal segment={segmentModal === 'add' ? null : segmentModal} onClose={() => setSegmentModal(null)} onSave={handleSaveSegment} campagnesDisponibles={campagnes} />}
      {clientsModal && <SegmentClientsModal segment={clientsModal} onClose={() => setClientsModal(null)} />}
      {sendModal && <SendCampaignModal segment={sendModal} onClose={() => setSendModal(null)} onSend={() => alert('Envoye avec succes !')} />}

      {/* ═══════ HEADER ═══════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, animation: 'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: T.navy }}>Segments</h1>
          </div>
          <p style={{ color: T.muted, fontSize: 14, margin: '4px 0 0 14px' }}>
            {segments.length} segments · {totalContacts} contacts · {campagnes.length} campagnes
          </p>
        </div>
        {isMarketing && (
          <button onClick={() => setSegmentModal('add')} className="btn-add-segment" style={{
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: '#fff', border: 'none',
            padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>+</span> Ajouter Segment
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="kcard" style={{ background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`, padding: '18px 20px', boxShadow: '0 1px 8px rgba(10,14,42,0.06)', display: 'flex', alignItems: 'center', gap: 14, animation: `fadeUp 0.4s ease ${i * 65}ms both` }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: s.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? <Skel w={40} h={24} /> : s.value}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes Niveaux */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Segmentation par Niveau</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {Object.entries(NIVEAUX).map(([key, info]) => {
            const count = contacts.filter(c => c.niveau?.toLowerCase() === key).length;
            return (
              <div key={key} className="niveau-card" onClick={() => setNiveauFilter(niveauFilter === key ? 'all' : key)} style={{
                background: T.card, borderRadius: 14, border: `1.5px solid ${niveauFilter === key ? info.color : T.border}`,
                padding: '20px', boxShadow: '0 1px 8px rgba(10,14,42,0.06)', animation: `fadeUp 0.4s ease both`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: info.bg, border: `1.5px solid ${info.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{info.icon}</div>
                  {niveauFilter === key && <span style={{ fontSize: 11, fontWeight: 700, color: info.color, background: info.bg, border: `1px solid ${info.border}`, padding: '2px 8px', borderRadius: 20 }}>✓ Filtre</span>}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: info.color, lineHeight: 1, marginBottom: 4 }}>{loading ? <Skel w={30} h={24} /> : count}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{info.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{info.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`, padding: '16px', marginBottom: 18, boxShadow: '0 1px 8px rgba(10,14,42,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>🔍 Filtres</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un segment..."
              style={{ width: '100%', padding: '9px 14px 9px 36px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans }}
              onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          <select value={niveauFilter} onChange={e => setNiveauFilter(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${niveauFilter !== 'all' ? T.gold : T.border}`, fontSize: 13, color: T.text, background: niveauFilter !== 'all' ? T.goldDim : '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous niveaux</option>
            {Object.entries(NIVEAUX).map(([key, info]) => <option key={key} value={key}>{info.icon} {info.label}</option>)}
          </select>
          <span style={{ fontSize: 12, color: T.muted }}>{filtered.length} resultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ═══════ TABLE DES SEGMENTS ═══════ */}
      <div style={{ background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}`, boxShadow: '0 1px 8px rgba(10,14,42,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Segments crees</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '2px 10px', borderRadius: 20 }}>{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} w="100%" h={72} r={12} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: T.muted }}>
            <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 14 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun segment</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Creez votre premier segment avec le bouton "Ajouter Segment"</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: T.navy }}>
                  {['Segment', 'Niveau', 'Campagnes associees', 'Clients segmentes', 'Criteres', 'Cree le', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: T.gold, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((segment) => {
                  const niv = NIVEAUX[segment.niveau] || { label: '—', icon: '❓', color: T.muted, bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' };
                  const segmentCampagnes = getCampagnesForSegment(segment);
                  const segmentContacts = getContactsForSegment(segment);

                  return (
                    <tr key={segment.id} className="crow" style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.15s' }}>
                      {/* SEGMENT NAME */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: niv.bg, border: `1.5px solid ${niv.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{niv.icon}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{segment.name}</div>
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>ID: {segment.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>

                      {/* NIVEAU */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <Pill label={`${niv.icon} ${niv.label}`} color={niv.color} bg={niv.bg} border={niv.border} />
                      </td>

                      {/* CAMPAGNES ASSOCIEES */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        {segmentCampagnes.length === 0 ? (
                          <span style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>Aucune campagne</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {segmentCampagnes.slice(0, 3).map(c => (
                              <span key={c.id} style={{ padding: '4px 10px', background: T.purpleDim, borderRadius: 20, fontSize: 11, fontWeight: 700, color: T.purple, border: `1px solid rgba(139,92,246,0.25)`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                📢 {c.title.length > 20 ? c.title.slice(0, 20) + '...' : c.title}
                              </span>
                            ))}
                            {segmentCampagnes.length > 3 && (
                              <span style={{ padding: '4px 10px', background: T.goldDim, borderRadius: 20, fontSize: 11, fontWeight: 700, color: T.goldDark, border: `1px solid ${T.goldBorder}` }}>+{segmentCampagnes.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* CLIENTS SEGMENTES */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => setClientsModal(segment)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {segmentContacts.slice(0, 3).map((c, i) => (
                              <div key={c.id} style={{ width: 28, height: 28, borderRadius: '50%', background: `${avatarColor(c.name)}20`, border: `2px solid ${avatarColor(c.name)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: avatarColor(c.name), marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i, position: 'relative' }}>{initials(c.name)}</div>
                            ))}
                            {segmentContacts.length === 0 && <span style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>Aucun</span>}
                          </div>
                          {segmentContacts.length > 0 && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.blue, marginLeft: 4 }}>{segmentContacts.length} contact{segmentContacts.length !== 1 ? 's' : ''}</span>
                          )}
                        </button>
                      </td>

                      {/* CRITERES */}
                      <td style={{ padding: '16px 20px', maxWidth: 200 }}>
                        <div style={{ fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(typeof segment.criteria === 'object' && segment.criteria !== null
                            ? (segment.criteria.description || JSON.stringify(segment.criteria))
                            : segment.criteria) || <span style={{ fontStyle: 'italic' }}>—</span>}
                        </div>
                      </td>

                      {/* DATE */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: T.muted }}>{fmtDate(segment.createdAt)}</span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSegmentModal(segment)} style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.25)`, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏ Editer</button>
                          <button onClick={() => setSendModal(segment)} style={{ background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📢 Envoyer</button>
                          <button onClick={() => handleDeleteSegment(segment.id)} style={{ background: T.redDim, color: T.red, border: `1px solid rgba(239,68,68,0.25)`, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.muted }}>© 2026 DigiLab Solutions · Segmentation par niveau · DigiPip Cloud Engine</span>
      </div>
    </div>
  );
}
