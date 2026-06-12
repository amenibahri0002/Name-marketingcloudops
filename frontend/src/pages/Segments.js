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
   CONFIGS SEGMENTATION COMPLÈTE
   ═══════════════════════════════════════════════════════════════ */

const CLIENT_TYPES = {
  entreprise:      { label: 'Entreprise',        icon: '🏢', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  agence:          { label: 'Agence Marketing',  icon: '🏛️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)' },
  centre_formation:{ label: 'Centre de Formation',icon: '🎓', color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)' },
  association:     { label: 'Association',       icon: '🤝', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
  particulier:     { label: 'Particulier',       icon: '👤', color: '#14b8a6', bg: 'rgba(20,184,166,0.10)',  border: 'rgba(20,184,166,0.25)' },
};

/* ─── NIVEAUX (Segmentation principale) ─────────────────────── */
const NIVEAUX = {
  debutant:     { label: 'Débutant',     icon: '🌱', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)', description: 'Nouveau dans le domaine' },
  etudiant:     { label: 'Étudiant',     icon: '🎓', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)', description: 'En formation ou stage' },
  professionnel:{ label: 'Professionnel',icon: '💼', color: '#f5a623', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)', description: 'Expérience confirmée' },
  expert:       { label: 'Expert',       icon: '⭐', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)', description: 'Expert / Senior' },
};

const CONTACT_SEGMENTS = {
  etudiant:    { label: 'Étudiant',    icon: '🎓', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  employe:     { label: 'Employé',     icon: '💼', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
  manager:     { label: 'Manager',     icon: '👔', color: '#f5a623', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)' },
  entrepreneur:{ label: 'Entrepreneur',icon: '🚀', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)' },
  autre:       { label: 'Autre',       icon: '❓', color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' },
};

const SECTEURS = [
  'Télécommunications', 'Finance', 'Marketing Digital', 'Technologie',
  'Tourisme', 'Automobile', 'Éducation', 'Santé', 'Commerce', 'Industrie'
];

const REGIONS = ['Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Gabès', 'Kairouan', 'Monastir'];

const TAILLES = ['1-10', '11-50', '51-200', '201-500', '500+', 'Particulier'];

const CENTRES_INTERET = ['Marketing', 'Digital', 'IA', 'Formation', 'Web', 'Télécom', 'Finance', 'Startup', 'E-commerce', 'Social Media'];

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
   MODAL: ENVOI CAMPAGNE SEGMENTÉE (Marketing)
   ═══════════════════════════════════════════════════════════════ */
function SendCampaignModal({ segment, segmentCount, onClose, onSend }) {
  const [campagnes, setCampagnes] = useState([]);
  const [selectedCampagne, setSelectedCampagne] = useState('');
  const [canaux, setCanaux] = useState({ email: true, sms: false, push: false, whatsapp: false });
  const [messagePerso, setMessagePerso] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCampagnes, setLoadingCampagnes] = useState(true);

  useEffect(() => {
    const fetchCampagnes = async () => {
      try {
        const res = await api.get('/api/campagnes');
        setCampagnes(res.data || []);
      } catch (err) {
        console.error('Erreur chargement campagnes:', err);
      } finally {
        setLoadingCampagnes(false);
      }
    };
    fetchCampagnes();
  }, []);

  const handleSend = async () => {
    if (!selectedCampagne) return;
    setLoading(true);
    try {
      await api.post(`/api/campagnes/send/${selectedCampagne}`, {
        segment: segment,
        canaux: Object.entries(canaux).filter(([_, v]) => v).map(([k]) => k),
        messagePerso: messagePerso || undefined,
      });
      onSend();
      onClose();
    } catch (err) {
      console.error('Erreur envoi:', err);
      alert("Erreur lors de l'envoi de la campagne");
    } finally {
      setLoading(false);
    }
  };

  const toggleCanal = (canal) => {
    setCanaux(p => ({ ...p, [canal]: !p[canal] }));
  };

  const niveauInfo = NIVEAUX[segment] || NIVEAUX[Object.keys(NIVEAUX)[0]];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 560, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ background: T.navy, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
              📢 Envoyer campagne segmentée
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              Cible : <strong style={{ color: niveauInfo.color }}>{niveauInfo.icon} {niveauInfo.label}</strong> · {segmentCount} contact{segmentCount > 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Campagne à envoyer *
            </label>
            {loadingCampagnes ? (
              <Skel w="100%" h={40} r={10} />
            ) : (
              <select 
                value={selectedCampagne} 
                onChange={e => setSelectedCampagne(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: `1.5px solid ${selectedCampagne ? T.gold : T.border}`, borderRadius: 10,
                  fontSize: 13, color: T.text, background: selectedCampagne ? T.goldDim : '#fafbfd',
                  boxSizing: 'border-box', fontFamily: T.sans, cursor: 'pointer',
                }}
              >
                <option value="">Choisir une campagne...</option>
                {campagnes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.type} · {c.prix} TND · {c.placesRestantes || 0} places
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Canaux de notification
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'email', label: '📧 Email', desc: 'Notification par email' },
                { key: 'sms', label: '📱 SMS', desc: 'Message texte' },
                { key: 'push', label: '🔔 Push', desc: 'Notification navigateur' },
                { key: 'whatsapp', label: '💬 WhatsApp', desc: 'Message WhatsApp' },
              ].map(canal => (
                <button key={canal.key} onClick={() => toggleCanal(canal.key)}
                  style={{
                    padding: '12px', borderRadius: 10,
                    border: `2px solid ${canaux[canal.key] ? T.gold : T.border}`,
                    background: canaux[canal.key] ? T.goldDim : '#fff',
                    color: canaux[canal.key] ? T.goldDark : T.muted,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    textAlign: 'left',
                  }}>
                  <div>{canal.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, opacity: 0.7 }}>{canal.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={messagePerso}
              onChange={e => setMessagePerso(e.target.value)}
              placeholder={`Bonjour, une nouvelle formation pour ${niveauInfo.label.toLowerCase()}s est disponible !`}
              rows={3}
              style={{
                width: '100%', padding: '12px 14px',
                border: `1.5px solid ${T.border}`, borderRadius: 10,
                fontSize: 13, color: T.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: T.sans, resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ background: niveauInfo.bg, border: `1px solid ${niveauInfo.border}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: niveauInfo.color, marginBottom: 4 }}>
              {niveauInfo.icon} Segment : {niveauInfo.label}
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              {niveauInfo.description} · {segmentCount} contact{segmentCount > 1 ? 's' : ''} seront notifié{segmentCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 28px', borderTop: `1.5px solid ${T.border}`, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>
            Annuler
          </button>
          <button 
            onClick={handleSend} 
            disabled={!selectedCampagne || loading || !Object.values(canaux).some(v => v)}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: (!selectedCampagne || loading) ? T.muted : T.gold, 
              fontSize: 13, fontWeight: 800, color: T.navy,
              cursor: (!selectedCampagne || loading) ? 'not-allowed' : 'pointer',
              boxShadow: (!selectedCampagne || loading) ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
            }}
          >
            {loading ? '⏳ Envoi en cours...' : `📢 Envoyer à ${segmentCount} contact${segmentCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: NOTIFICATION SEGMENTÉE (Marketing)
   ═══════════════════════════════════════════════════════════════ */
function SendNotificationModal({ segment, segmentCount, onClose, onSend }) {
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [canaux, setCanaux] = useState({ email: true, sms: false, push: false, whatsapp: false });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!titre.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/notifications/send-segment', {
        segment: segment,
        titre: titre,
        message: message,
        canaux: Object.entries(canaux).filter(([_, v]) => v).map(([k]) => k),
      });
      onSend();
      onClose();
    } catch (err) {
      console.error('Erreur envoi notification:', err);
      alert("Erreur lors de l'envoi de la notification");
    } finally {
      setLoading(false);
    }
  };

  const toggleCanal = (canal) => {
    setCanaux(p => ({ ...p, [canal]: !p[canal] }));
  };

  const niveauInfo = NIVEAUX[segment] || NIVEAUX[Object.keys(NIVEAUX)[0]];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 520, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ background: T.navy, padding: '24px 28px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
            🔔 Notification segmentée
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
            Cible : <strong style={{ color: niveauInfo.color }}>{niveauInfo.icon} {niveauInfo.label}</strong> · {segmentCount} contact{segmentCount > 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Titre *</label>
            <input
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Nouvelle formation disponible !"
              style={{
                width: '100%', padding: '10px 14px',
                border: `1.5px solid ${T.border}`, borderRadius: 10,
                fontSize: 13, color: T.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: T.sans,
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Bonjour, nous avons une nouvelle offre spécialement pour les ${niveauInfo.label.toLowerCase()}s...`}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px',
                border: `1.5px solid ${T.border}`, borderRadius: 10,
                fontSize: 13, color: T.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: T.sans, resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Canaux</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'email', label: '📧 Email' },
                { key: 'sms', label: '📱 SMS' },
                { key: 'push', label: '🔔 Push' },
                { key: 'whatsapp', label: '💬 WhatsApp' },
              ].map(canal => (
                <button key={canal.key} onClick={() => toggleCanal(canal.key)}
                  style={{
                    padding: '10px', borderRadius: 10,
                    border: `2px solid ${canaux[canal.key] ? T.gold : T.border}`,
                    background: canaux[canal.key] ? T.goldDim : '#fff',
                    color: canaux[canal.key] ? T.goldDark : T.muted,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {canal.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 28px', borderTop: `1.5px solid ${T.border}`, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>
            Annuler
          </button>
          <button 
            onClick={handleSend} 
            disabled={!titre.trim() || !message.trim() || loading || !Object.values(canaux).some(v => v)}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: (!titre.trim() || !message.trim() || loading) ? T.muted : T.gold, 
              fontSize: 13, fontWeight: 800, color: T.navy,
              cursor: (!titre.trim() || !message.trim() || loading) ? 'not-allowed' : 'pointer',
              boxShadow: (!titre.trim() || !message.trim() || loading) ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
            }}
          >
            {loading ? '⏳ Envoi...' : `🔔 Envoyer à ${segmentCount} contact${segmentCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: DÉTAIL CLIENT (avec segmentation par niveau)
   ═══════════════════════════════════════════════════════════════ */
function ClientDetailModal({ client, onClose }) {
  const [activeTab, setActiveTab] = useState('contacts');
  const typeInfo = CLIENT_TYPES[client.type];

  const tabs = [
    ['contacts', '👥 Contacts segmentés', client.contacts?.length || 0],
    ['niveaux', '📊 Niveaux', null],
    ['infos', 'ℹ️ Informations', null],
  ];

  const segmentCounts = (client.contacts || []).reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  const niveauCounts = (client.contacts || []).reduce((acc, c) => {
    acc[c.niveau] = (acc[c.niveau] || 0) + 1;
    return acc;
  }, {});

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 850, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ background: T.navy, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: T.border }}>
          {[
            { label: 'Contacts', value: client.contacts?.length || 0, color: T.blue },
            { label: 'Région', value: client.region, color: T.green },
            { label: 'Taille', value: client.taille, color: T.purple },
            { label: 'Inscrit le', value: fmtDate(client.createdAt), color: T.gold },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fafbfd', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 28px', background: '#fafbfd', borderBottom: `1.5px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Répartition par niveau</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(niveauCounts).map(([niv, count]) => {
              const nivInfo = NIVEAUX[niv];
              return nivInfo ? (
                <div key={niv} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20,
                  background: nivInfo?.bg, border: `1px solid ${nivInfo?.border}`,
                }}>
                  <span style={{ fontSize: 14 }}>{nivInfo?.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: nivInfo?.color }}>{nivInfo?.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

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

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {activeTab === 'contacts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                    Contacts segmentés · {client.name}
                  </h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: '4px 0 0' }}>
                    Segmentation : Niveau → Type → Secteur → Région → Taille → Centres d'intérêt
                  </p>
                </div>
                <Pill label="🔒 Données isolées" color={T.green} bg={T.greenDim} border="rgba(34,197,94,0.25)" />
              </div>

              {(client.contacts || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                  <div>Aucun contact</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(client.contacts || []).map(contact => {
                    const seg = CONTACT_SEGMENTS[contact.segment];
                    const niv = NIVEAUX[contact.niveau];
                    return (
                      <div key={contact.id} style={{
                        background: '#fafbfd', borderRadius: 12,
                        border: `1px solid ${T.border}`, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: `${avatarColor(contact.name)}15`,
                          border: `1.5px solid ${avatarColor(contact.name)}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: avatarColor(contact.name),
                          flexShrink: 0,
                        }}>{initials(contact.name)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{contact.name}</div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            {contact.email} · {contact.phone}
                          </div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                            {contact.departement} · {contact.niveau}
                          </div>
                        </div>
                        <Pill label={`${niv?.icon} ${niv?.label}`} color={niv?.color} bg={niv?.bg} border={niv?.border} />
                        <Pill label={`${seg?.icon} ${seg?.label}`} color={seg?.color} bg={seg?.bg} border={seg?.border} />
                        <Pill label={contact.status === 'active' ? '✓ Actif' : '✕ Inactif'} 
                          color={contact.status === 'active' ? T.green : T.red}
                          bg={contact.status === 'active' ? T.greenDim : T.redDim}
                          border={contact.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'niveaux' && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 16px' }}>Répartition par niveau d'expertise</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(NIVEAUX).map(([key, info]) => {
                  const count = niveauCounts[key] || 0;
                  const total = client.contacts?.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={key} style={{ background: '#fafbfd', borderRadius: 12, padding: '16px 20px', border: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{info.icon}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: info.color }}>{info.label}</div>
                            <div style={{ fontSize: 11, color: T.muted }}>{info.description}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{count}</div>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#e4e9f2', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: info.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4, textAlign: 'right' }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'infos' && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 16px' }}>Informations de segmentation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: "Type de client", value: `${typeInfo?.icon} ${typeInfo?.label}` },
                  { label: "Secteur d'activité", value: client.sector },
                  { label: 'Région', value: client.region },
                  { label: 'Taille', value: client.taille },
                  { label: 'Email', value: client.email },
                  { label: 'Téléphone', value: client.phone },
                ].map((info, i) => (
                  <div key={i} style={{ background: '#fafbfd', borderRadius: 10, padding: '14px 18px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{info.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{info.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Centres d'intérêt</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(client.centresInteret || []).map((ci, i) => (
                    <span key={i} style={{ padding: '6px 14px', background: T.goldDim, borderRadius: 20, fontSize: 12, fontWeight: 700, color: T.goldDark, border: `1px solid ${T.goldBorder}` }}>
                      {ci}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Ajout / Édition client avec segmentation par niveau
   ═══════════════════════════════════════════════════════════════ */
function ClientModal({ client, onClose, onSave }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    type: client?.type || 'entreprise',
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    sector: client?.sector || '',
    region: client?.region || 'Tunis',
    taille: client?.taille || '11-50',
    centresInteret: client?.centresInteret || [],
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

  const handle = () => {
    if (!validate()) return;
    setSaving(true);

    const newClient = {
      id: isEdit ? client.id : Date.now(),
      ...form,
      createdAt: isEdit ? client.createdAt : new Date().toISOString(),
      contacts: isEdit ? client.contacts : [],
    };

    setTimeout(() => {
      onSave(newClient, isEdit);
      setSaving(false);
      onClose();
    }, 500);
  };

  const toggleInteret = (interet) => {
    setForm(p => ({
      ...p,
      centresInteret: p.centresInteret.includes(interet)
        ? p.centresInteret.filter(i => i !== interet)
        : [...p.centresInteret, interet]
    }));
  };

  const Field = ({ fkey, label, placeholder, type = 'text' }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={form[fkey]}
        onChange={e => { setForm(p => ({ ...p, [fkey]: e.target.value })); setErrors(p => ({ ...p, [fkey]: '' })); }}
        style={{
          width: '100%', padding: '10px 14px',
          border: `1.5px solid ${errors[fkey] ? T.red : T.border}`, borderRadius: 10,
          fontSize: 13, color: T.text, background: errors[fkey] ? 'rgba(239,68,68,0.03)' : '#fafbfd',
          boxSizing: 'border-box', fontFamily: T.sans, outline: 'none',
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
        background: T.card, borderRadius: 22, width: 520, maxHeight: '90vh', overflowY: 'auto',
        padding: '32px', boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.goldDim, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {isEdit ? '✏️' : '👤'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{isEdit ? 'Modifier' : 'Nouveau'} client</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Segmentation automatique par niveau</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', fontSize: 14, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Type de client *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(CLIENT_TYPES).map(([key, info]) => (
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secteur</label>
            <select value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans }}>
              <option value="">Sélectionner...</option>
              {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Région</label>
            <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Taille</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TAILLES.map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, taille: t }))}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  border: `2px solid ${form.taille === t ? T.gold : T.border}`,
                  background: form.taille === t ? T.goldDim : '#fff',
                  color: form.taille === t ? T.goldDark : T.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Centres d'intérêt</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CENTRES_INTERET.map(ci => (
              <button key={ci} onClick={() => toggleInteret(ci)}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `2px solid ${form.centresInteret.includes(ci) ? T.gold : T.border}`,
                  background: form.centresInteret.includes(ci) ? T.goldDim : '#fff',
                  color: form.centresInteret.includes(ci) ? T.goldDark : T.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {form.centresInteret.includes(ci) ? '✓ ' : ''}{ci}
              </button>
            ))}
          </div>
        </div>

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
   PAGE SEGMENTS (Clients + Contacts + Segmentation par Niveau + API)
   ═══════════════════════════════════════════════════════════════ */
export default function Segments() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sendModal, setSendModal] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Charger depuis l'API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/clients');
        setClients(res.data || []);
      } catch (err) {
        console.error('Erreur chargement clients:', err);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');

    fetchClients();
  }, []);

  const handleSave = async (newClient, isEdit) => {
    try {
      if (isEdit) {
        await api.put(`/api/clients/${newClient.id}`, newClient);
        setClients(prev => prev.map(c => c.id === newClient.id ? newClient : c));
      } else {
        const res = await api.post('/api/clients', newClient);
        setClients(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      if (isEdit) {
        setClients(prev => prev.map(c => c.id === newClient.id ? newClient : c));
      } else {
        setClients(prev => [...prev, newClient]);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ? Tous ses contacts seront supprimés.')) return;
    try {
      await api.delete(`/api/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  // Recalcul automatique des segments avec filtre niveau
  const filtered = clients.filter(c => {
    const mSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const mType = typeFilter === 'all' || c.type === typeFilter;
    const mSegment = segmentFilter === 'all' || (c.contacts || []).some(contact => contact.segment === segmentFilter);
    const mNiveau = niveauFilter === 'all' || (c.contacts || []).some(contact => contact.niveau === niveauFilter);
    const mSector = sectorFilter === 'all' || c.sector === sectorFilter;
    const mRegion = regionFilter === 'all' || c.region === regionFilter;
    return mSearch && mType && mSegment && mNiveau && mSector && mRegion;
  });

  const totalContacts = clients.reduce((a, c) => a + (c.contacts?.length || 0), 0);

  const niveauStats = Object.entries(NIVEAUX).map(([key, info]) => {
    const count = clients.reduce((a, c) => a + (c.contacts || []).filter(contact => contact.niveau === key).length, 0);
    return { key, ...info, count };
  });

  const stats = [
    { label: 'Total clients', value: clients.length, color: T.gold, dim: T.goldDim, icon: '🏢' },
    { label: 'Total contacts', value: totalContacts, color: T.blue, dim: T.blueDim, icon: '👥' },
    { label: 'Entreprises', value: clients.filter(c => c.type === 'entreprise').length, color: T.purple, dim: T.purpleDim, icon: '🏢' },
    { label: 'Particuliers', value: clients.filter(c => c.type === 'particulier').length, color: T.teal, dim: T.tealDim, icon: '👤' },
  ];

  const isMarketing = userRole === 'MARKETING' || userRole === 'ADMIN';

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
      `}</style>

      {modal && <ClientModal client={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {detailClient && <ClientDetailModal client={detailClient} onClose={() => setDetailClient(null)} />}
      {sendModal && sendModal.type === 'campaign' && (
        <SendCampaignModal 
          segment={sendModal.segment} 
          segmentCount={sendModal.count} 
          onClose={() => setSendModal(null)} 
          onSend={() => alert('✅ Campagne envoyée avec succès !')} 
        />
      )}
      {sendModal && sendModal.type === 'notification' && (
        <SendNotificationModal 
          segment={sendModal.segment} 
          segmentCount={sendModal.count} 
          onClose={() => setSendModal(null)} 
          onSend={() => alert('✅ Notification envoyée avec succès !')} 
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, animation: 'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 4, height: 24, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Segments DigiLab</h1>
          </div>
          <p style={{ color: T.muted, fontSize: 13, margin: '0 0 0 14px' }}>
            Segmentation clients & contacts · {clients.length} clients · {totalContacts} contacts · Recalcul automatique
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isMarketing && (
            <button onClick={() => setModal('add')} style={{
              background: T.gold, color: T.navy, border: 'none',
              padding: '11px 22px', borderRadius: 11, fontSize: 13, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{ fontSize: 16 }}>+</span> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
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

      {/* Cartes de segmentation par Niveau */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Segmentation par Niveau</h2>
          {isMarketing && (
            <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>
              Cliquez sur "Envoyer" pour cibler un segment
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {niveauStats.map((niv, i) => (
            <div key={niv.key} className="niveau-card" style={{
              background: T.card, borderRadius: 14, border: `1.5px solid ${niveauFilter === niv.key ? niv.color : T.border}`,
              padding: '20px', boxShadow: '0 1px 8px rgba(10,14,42,0.06)',
              animation: `fadeUp 0.4s ease ${(i + 4) * 65}ms both`,
              cursor: 'pointer', transition: 'all 0.2s',
            }} onClick={() => setNiveauFilter(niveauFilter === niv.key ? 'all' : niv.key)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: niv.bg, border: `1.5px solid ${niv.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {niv.icon}
                </div>
                {niveauFilter === niv.key && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: niv.color, background: niv.bg, border: `1px solid ${niv.border}`, padding: '2px 8px', borderRadius: 20 }}>
                    ✓ Filtré
                  </span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: niv.color, lineHeight: 1, marginBottom: 4 }}>
                {loading ? <Skel w={30} h={24} /> : niv.count}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{niv.label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>{niv.description}</div>

              {isMarketing && niv.count > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSendModal({ type: 'campaign', segment: niv.key, count: niv.count }); }}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8,
                      border: `1.5px solid ${niv.color}`, background: niv.bg,
                      color: niv.color, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    📢 Campagne
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSendModal({ type: 'notification', segment: niv.key, count: niv.count }); }}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8,
                      border: `1.5px solid ${T.gold}`, background: T.goldDim,
                      color: T.goldDark, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    🔔 Notif
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filtres de segmentation */}
      <div style={{
        background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`,
        padding: '16px', marginBottom: 18,
        boxShadow: '0 1px 8px rgba(10,14,42,0.05)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          🔍 Filtres de segmentation (recalcul automatique)
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Recherche */}
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

          {/* Niveau */}
          <select value={niveauFilter} onChange={e => setNiveauFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${niveauFilter !== 'all' ? T.gold : T.border}`, fontSize: 13, color: T.text, background: niveauFilter !== 'all' ? T.goldDim : '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous niveaux</option>
            {Object.entries(NIVEAUX).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>

          {/* Type de client */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous types</option>
            {Object.entries(CLIENT_TYPES).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>

          {/* Segment de contact */}
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous segments</option>
            {Object.entries(CONTACT_SEGMENTS).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>

          {/* Secteur */}
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous secteurs</option>
            {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Région */}
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Toutes régions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <span style={{ fontSize: 12, color: T.muted }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}`, boxShadow: '0 1px 8px rgba(10,14,42,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Clients segmentés · <span style={{ fontSize: 11, fontWeight: 700, background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '2px 9px', borderRadius: 20 }}>{filtered.length}</span>
          </span>
          {isMarketing && filtered.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setSendModal({ type: 'campaign', segment: 'filtered', count: filtered.reduce((a, c) => a + (c.contacts?.length || 0), 0) })}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  border: `1.5px solid ${T.gold}`, background: T.goldDim,
                  color: T.goldDark, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                📢 Campagne filtrée
              </button>
            </div>
          )}
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
            <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 14 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun résultat</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Essayez de modifier vos filtres de segmentation</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.navy }}>
                {['Client', 'Type', 'Secteur', 'Région', 'Taille', 'Contacts', 'Niveaux', 'Segments', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: T.gold }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const color = avatarColor(c.name);
                const typeInfo = CLIENT_TYPES[c.type];
                const contactSegments = (c.contacts || []).reduce((acc, contact) => {
                  acc[contact.segment] = (acc[contact.segment] || 0) + 1;
                  return acc;
                }, {});
                const contactNiveaux = (c.contacts || []).reduce((acc, contact) => {
                  acc[contact.niveau] = (acc[contact.niveau] || 0) + 1;
                  return acc;
                }, {});

                return (
                  <tr key={c.id} className="crow" style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                    onClick={() => setDetailClient(c)}>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color }}>{initials(c.name)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: T.text }}>{c.sector}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: T.muted }}>{c.region}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ background: T.purpleDim, color: T.purple, border: `1px solid rgba(139,92,246,0.25)`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{c.taille}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.25)`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>👥 {(c.contacts || []).length}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {Object.entries(contactNiveaux).map(([niv, count]) => {
                          const nivInfo = NIVEAUX[niv];
                          return nivInfo ? (
                            <span key={niv} style={{ fontSize: 10, fontWeight: 700, color: nivInfo?.color, background: nivInfo?.bg, border: `1px solid ${nivInfo?.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {nivInfo?.icon} {count}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {Object.entries(contactSegments).map(([seg, count]) => {
                          const segInfo = CONTACT_SEGMENTS[seg];
                          return (
                            <span key={seg} style={{ fontSize: 10, fontWeight: 700, color: segInfo?.color, background: segInfo?.bg, border: `1px solid ${segInfo?.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {segInfo?.icon} {count}
                            </span>
                          );
                        })}
                      </div>
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

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.muted }}>
          © 2026 DigiLab Solutions · Segmentation automatique par niveau · DigiPip Cloud Engine
        </span>
      </div>
    </div>
  );
}