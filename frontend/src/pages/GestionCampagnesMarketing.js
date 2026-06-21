import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Eye, EyeOff, Edit, Trash2, Send,
  Mail, MessageSquare, Bell, Smartphone,
  Globe, Share2, AlertTriangle, Search,
  Grid, List, CheckCircle, X, Calendar,
  Clock, Users, Tag, DollarSign, ChevronDown,
  ChevronUp, Filter, RefreshCw, Loader2,
  Megaphone, Layers, TrendingUp, BarChart3,
  Inbox, CheckSquare, XSquare, ArrowRight
} from 'lucide-react';
import api from '../api';

const gold = '#f5a623';
const dark = '#0A0A0A';
const white = '#FFFFFF';
const gray = '#F5F5F5';
const textGray = '#666666';
const red = '#EF4444';
const green = '#10B981';
const blue = '#3B82F6';
const purple = '#8B5CF6';

const CANAUX = [
  { id: 'email', label: 'Email', icon: Mail, color: blue },
  { id: 'sms', label: 'SMS', icon: Smartphone, color: green },
  { id: 'push', label: 'Push', icon: Bell, color: purple },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: green },
  { id: 'social', label: 'Réseaux Sociaux', icon: Share2, color: '#EC4899' }
];

const STATUS_CONFIG = {
  'ACTIVE': { bg: '#ECFDF5', color: '#047857', label: 'Active', badge: '●' },
  'DRAFT': { bg: '#FEF3C7', color: '#B45309', label: 'Brouillon', badge: '◐' },
  'PAUSED': { bg: '#EFF6FF', color: '#1D4ED8', label: 'En pause', badge: '◑' },
  'COMPLETED': { bg: '#F3F4F6', color: '#6B7280', label: 'Terminée', badge: '✓' },
  'CANCELLED': { bg: '#FEE2E2', color: '#991B1B', label: 'Annulée', badge: '✕' }
};

const TYPE_COLORS = {
  'FORMATION': { bg: '#FFF8E7', color: '#D48A1A', border: gold, icon: '🔥' },
  'Promo': { bg: '#EFF6FF', color: blue, border: blue, icon: '📢' },
  'EVENT': { bg: '#ECFDF5', color: green, border: green, icon: '🎉' },
  'WEBINAR': { bg: '#F3E8FF', color: purple, border: purple, icon: '💻' }
};

// ============================================================
// MODAL DE NOTIFICATION MULTI-CANAL
// ============================================================

const NotificationModal = ({ show, onClose, campagne }) => {
  const [canauxSelectionnes, setCanauxSelectionnes] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resultats, setResultats] = useState([]);

  if (!show || !campagne) return null;

  const toggleCanal = (id) => {
    setCanauxSelectionnes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const envoyerNotifications = async () => {
    if (canauxSelectionnes.length === 0) return;
    setSending(true);
    setResultats([]);

    try {
      // Appel la route CORRECTE : /api/notifications/diffuse
      const response = await api.post('/api/notifications/diffuse', {
        campagneId: campagne.id,
        channels: canauxSelectionnes,
        title: campagne.title,
        message: message || `Nouvelle formation : ${campagne.title} ! Inscrivez-vous dès maintenant...`,
      });

      console.log('Réponse diffusion:', response.data);

      // ✅ Gérer la réponse asynchrone
      if (response.data.status === 'processing') {
        setResultats(canauxSelectionnes.map(canalId => ({
          canal: canalId,
          status: 'success',
          message: 'Diffusion lancée en arrière-plan'
        })));

        // Fermer le modal après 3 secondes
        setTimeout(() => {
          onClose();
          setCanauxSelectionnes([]);
          setResultats([]);
        }, 3000);

        return;
      }

      // Si la réponse contient des résultats (mode synchrone legacy)
      const results = response.data.results;
      if (!results) {
        setResultats(canauxSelectionnes.map(canalId => ({
          canal: canalId,
          status: 'success',
          message: 'Diffusion effectuée'
        })));
        return;
      }

      // Mapper les résultats du backend vers le format du frontend
      const mappedResults = canauxSelectionnes.map(canalId => {
        const canalLabel = CANAUX.find(c => c.id === canalId)?.label || canalId;

        if (canalId === 'email') {
          const emailRes = results.email;
          if (emailRes && emailRes.failed > 0) {
            return { canal: canalId, status: 'error', error: emailRes.errors[0] || 'Erreur email' };
          }
          return { canal: canalId, status: 'success' };
        }

        if (canalId === 'push') {
          const pushRes = results.push;
          if (pushRes && pushRes.failed > 0) {
            return { canal: canalId, status: 'error', error: pushRes.errors[0] || 'Erreur Push' };
          }
          return { canal: canalId, status: 'success' };
        }

        return { canal: canalId, status: 'success' };
      });

      setResultats(mappedResults);
    } catch (err) {
      console.error('[DIFFUSION ERROR]', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erreur serveur';
      setResultats(canauxSelectionnes.map(canalId => ({
        canal: canalId,
        status: 'error',
        error: errorMsg
      })));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: white, borderRadius: 24, width: '100%', maxWidth: 550,
          maxHeight: '90vh', overflow: 'auto', padding: '36px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: dark, margin: 0 }}>
              📢 Diffuser la campagne
            </h2>
            <p style={{ color: textGray, fontSize: '0.9rem', margin: '4px 0 0' }}>
              {campagne.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E5E5',
            background: white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: dark, fontSize: '0.9rem' }}>
            Sélectionnez les canaux
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CANAUX.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => toggleCanal(id)}
                style={{
                  padding: '12px 18px', borderRadius: 12,
                  border: canauxSelectionnes.includes(id) ? `2px solid ${color}` : '1px solid #E5E5E5',
                  background: canauxSelectionnes.includes(id) ? color + '15' : white,
                  color: canauxSelectionnes.includes(id) ? color : textGray,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s', fontSize: '0.9rem'
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: dark, fontSize: '0.9rem' }}>
            Message personnalisé (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`🎉 Nouvelle formation : ${campagne.title} ! Inscrivez-vous dès maintenant...`}
            rows={4}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #E5E5E5',
              fontSize: '0.9rem', resize: 'vertical', outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {resultats.length > 0 && (
          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resultats.map((res, i) => (
              <div key={i} style={{
                padding: '10px 16px', borderRadius: 10,
                background: res.status === 'success' ? '#ECFDF5' : '#FEE2E2',
                color: res.status === 'success' ? '#047857' : '#991B1B',
                fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
              }}>
                {res.status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {CANAUX.find(c => c.id === res.canal)?.label} : {res.status === 'success' ? 'Envoyé ✓' : `Erreur - ${res.error}`}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={envoyerNotifications}
          disabled={canauxSelectionnes.length === 0 || sending}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: canauxSelectionnes.length === 0 ? '#E5E5E5' : gold,
            color: canauxSelectionnes.length === 0 ? textGray : white,
            fontWeight: 700, cursor: canauxSelectionnes.length === 0 || sending ? 'not-allowed' : 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          {sending ? <><Loader2 size={18} className="spin" /> Envoi en cours...</> : <><Send size={18} /> Envoyer sur {canauxSelectionnes.length} canal{canauxSelectionnes.length > 1 ? 's' : ''}</>}
        </button>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
};

// ============================================================
// MODAL FORMULAIRE CAMPAGNE (CRÉER / MODIFIER)
// ============================================================
const CampagneFormModal = ({ show, onClose, onSubmit, initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FORMATION',
    dateScheduled: '',
    date: '',
    duration: '',
    format: '100% Pratique',
    location: 'Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage App 4-2 – Sfax, Tunisia',
    contact: '+216 22 044 105',
    prix: '',
    prixOriginal: '',
    placesTotal: '',
    dureeHeures: '',
    iconName: 'Sparkles',
    couleur: '#F5A623',
    prerequis: 'Aucun prérequis',
    tools: '',
    tags: '',
    inclus: '',
    image: '',
    isPublic: true,
    published: true,
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        dateScheduled: initialData.dateScheduled ? initialData.dateScheduled.split('T')[0] : '',
        tools: Array.isArray(initialData.tools) ? initialData.tools.join(', ') : initialData.tools || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        inclus: Array.isArray(initialData.inclus) ? initialData.inclus.join(', ') : initialData.inclus || ''
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      prix: parseInt(formData.prix) || 0,
      prixOriginal: parseInt(formData.prixOriginal) || 0,
      placesTotal: parseInt(formData.placesTotal) || 0,
      placesRestantes: mode === 'create' ? (parseInt(formData.placesTotal) || 0) : undefined,
      dureeHeures: parseInt(formData.dureeHeures) || 0,
      tools: formData.tools.split(',').map(t => t.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      inclus: formData.inclus.split(',').map(t => t.trim()).filter(Boolean),
      dateScheduled: formData.dateScheduled ? new Date(formData.dateScheduled).toISOString() : null
    };

    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit'
  };

  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.85rem' };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: white, borderRadius: 24, width: '100%', maxWidth: 700,
          maxHeight: '92vh', overflow: 'auto', padding: '36px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
            {mode === 'create' ? '➕ Nouvelle Campagne' : '✏️ Modifier la Campagne'}
          </h2>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E5E5',
            background: white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Titre de la formation *</label>
              <input type="text" required value={formData.title} onChange={e => handleChange('title', e.target.value)}
                placeholder="Ex: Formation Digital Marketing & AI" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)}
                placeholder="Description détaillée..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div>
              <label style={labelStyle}>Type</label>
              <select value={formData.type} onChange={e => handleChange('type', e.target.value)} style={inputStyle}>
                <option value="FORMATION">Formation</option>
                <option value="MARKETING">Marketing</option>
                <option value="EVENT">Événement</option>
                <option value="WEBINAR">Webinaire</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Statut</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} style={inputStyle}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Brouillon</option>
                <option value="PAUSED">En pause</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Date programmée *</label>
              <input type="date" required value={formData.dateScheduled} onChange={e => handleChange('dateScheduled', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Date affichée (texte)</label>
              <input type="text" value={formData.date} onChange={e => handleChange('date', e.target.value)}
                placeholder="Ex: 30 Avril 2026" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Durée (texte)</label>
              <input type="text" value={formData.duration} onChange={e => handleChange('duration', e.target.value)}
                placeholder="Ex: 40 heures" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Format</label>
              <input type="text" value={formData.format} onChange={e => handleChange('format', e.target.value)}
                placeholder="Ex: 100% Pratique" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Prix (TND) *</label>
              <input type="number" required value={formData.prix} onChange={e => handleChange('prix', e.target.value)}
                placeholder="850" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Prix original (TND)</label>
              <input type="number" value={formData.prixOriginal} onChange={e => handleChange('prixOriginal', e.target.value)}
                placeholder="1200" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Places totales *</label>
              <input type="number" required value={formData.placesTotal} onChange={e => handleChange('placesTotal', e.target.value)}
                placeholder="25" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Durée en heures</label>
              <input type="number" value={formData.dureeHeures} onChange={e => handleChange('dureeHeures', e.target.value)}
                placeholder="40" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>URL Image (Unsplash)</label>
              <input type="url" value={formData.image} onChange={e => handleChange('image', e.target.value)}
                placeholder="https://images.unsplash.com/photo-..." style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Lieu</label>
              <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Contact</label>
              <input type="text" value={formData.contact} onChange={e => handleChange('contact', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Outils (séparés par virgule)</label>
              <input type="text" value={formData.tools} onChange={e => handleChange('tools', e.target.value)}
                placeholder="Meta, ChatGPT, WordPress, Google Analytics, Canva" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Tags (séparés par virgule)</label>
              <input type="text" value={formData.tags} onChange={e => handleChange('tags', e.target.value)}
                placeholder="IA, Marketing Digital, Certifiant" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Inclus (séparés par virgule)</label>
              <input type="text" value={formData.inclus} onChange={e => handleChange('inclus', e.target.value)}
                placeholder="Certificat reconnu, Support de cours, Accès aux outils" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Prérequis</label>
              <input type="text" value={formData.prerequis} onChange={e => handleChange('prerequis', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 20, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="checkbox" checked={formData.isPublic} onChange={e => handleChange('isPublic', e.target.checked)} />
                Visible sur la page d'accueil
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="checkbox" checked={formData.published} onChange={e => handleChange('published', e.target.checked)} />
                Publiée (visible clients)
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: loading ? '#E5E5E5' : gold, color: loading ? textGray : white,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {loading ? <><Loader2 size={18} className="spin" /> Enregistrement...</> : <><CheckCircle size={18} /> {mode === 'create' ? 'Créer la campagne' : 'Enregistrer les modifications'}</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================
// MODAL CONFIRMATION SUPPRESSION
// ============================================================
const DeleteConfirmModal = ({ show, onClose, onConfirm, campagne }) => {
  if (!show || !campagne) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: white, borderRadius: 24, width: '100%', maxWidth: 450,
          padding: '40px', textAlign: 'center'
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Trash2 size={32} color={red} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: dark, margin: '0 0 12px' }}>
          Confirmer la suppression
        </h2>
        <p style={{ color: textGray, fontSize: '1rem', marginBottom: 28, lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer <strong>"{campagne.title}"</strong> ?<br />
          Cette action est irréversible.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 12, border: '1px solid #E5E5E5',
            background: white, color: dark, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
          }}>
            Annuler
          </button>
          <button onClick={onConfirm} style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: red, color: white, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
          }}>
            Supprimer définitivement
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// MODAL DÉTAILS CAMPAGNE
// ============================================================
const DetailsModal = ({ show, onClose, campagne }) => {
  if (!show || !campagne) return null;

  const typeStyle = TYPE_COLORS[campagne.type] || TYPE_COLORS['FORMATION'];
  const statusStyle = STATUS_CONFIG[campagne.status] || STATUS_CONFIG['DRAFT'];
  const tauxRemplissage = campagne.placesTotal ? Math.round(((campagne.placesTotal - (campagne.placesRestantes || 0)) / campagne.placesTotal) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: white, borderRadius: 24, width: '100%', maxWidth: 600,
          maxHeight: '90vh', overflow: 'auto', padding: 0
        }}
      >
        {campagne.image && (
          <div style={{ height: 200, overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
            <img src={campagne.image} alt={campagne.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`
              }}>
                {typeStyle.icon} {campagne.type}
              </span>
              <span style={{
                padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                background: statusStyle.bg, color: statusStyle.color
              }}>
                {statusStyle.badge} {statusStyle.label}
              </span>
            </div>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E5E5',
              background: white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <X size={18} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: '0 0 12px' }}>
            {campagne.title}
          </h2>

          <p style={{ color: textGray, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
            {campagne.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { icon: Calendar, label: 'Date', value: campagne.date || campagne.dateScheduled?.split('T')[0] },
              { icon: Clock, label: 'Durée', value: campagne.duration || `${campagne.dureeHeures}h` },
              { icon: Users, label: 'Inscrits', value: `${campagne.placesTotal - (campagne.placesRestantes || 0)}/${campagne.placesTotal}` },
              { icon: DollarSign, label: 'Prix', value: `${campagne.prix} TND` },
            ].map((item, i) => (
              <div key={i} style={{ background: gray, padding: '16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <item.icon size={20} color={gold} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: textGray }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: dark }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Taux de remplissage */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
              <span style={{ color: textGray }}>Taux de remplissage</span>
              <span style={{ fontWeight: 700, color: dark }}>{tauxRemplissage}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#F0F0F0', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: tauxRemplissage >= 80 ? red : tauxRemplissage >= 50 ? gold : green,
                width: `${tauxRemplissage}%`, transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Tags */}
          {campagne.tags && campagne.tags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: dark, marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {campagne.tags.map((tag, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 8, background: '#F0F0F0', color: textGray, fontSize: '0.8rem', fontWeight: 500 }}>
                    <Tag size={10} style={{ marginRight: 4 }} />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outils */}
          {campagne.tools && campagne.tools.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: dark, marginBottom: 8 }}>Outils</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {campagne.tools.map((tool, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 8, background: '#FFF8E7', color: '#D48A1A', fontSize: '0.8rem', fontWeight: 500 }}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// MODAL RÉSERVATIONS
// ============================================================
const ReservationsModal = ({ show, onClose, campagne, onUpdate }) => {
  if (!show) return null;

  const inscription = campagne?.inscription || [];
  const enAttente = inscription.filter(r => r.status === 'en_attente');
  const acceptes = inscription.filter(r => r.status === 'accepte');

  const handleStatusChange = async (inscriptionId, newStatus) => {
    try {
      await api.patch(`/api/inscriptions/${inscriptionId}/status`, { status: newStatus });
      onUpdate();
    } catch (err) {
      alert('Erreur : ' + err.response?.data?.error);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: white, borderRadius: 24, width: '100%', maxWidth: 700,
          maxHeight: '90vh', overflow: 'auto', padding: '36px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: dark, margin: 0 }}>
              📋 Réservations
            </h2>
            <p style={{ color: textGray, fontSize: '0.9rem', margin: '4px 0 0' }}>
              {campagne?.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E5E5',
            background: white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{
            padding: '8px 16px', borderRadius: 10, background: '#FFF8E7', color: gold,
            fontWeight: 600, fontSize: '0.85rem'
          }}>
            ⏳ En attente ({enAttente.length})
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 10, background: '#ECFDF5', color: green,
            fontWeight: 600, fontSize: '0.85rem'
          }}>
            ✅ Acceptées ({acceptes.length})
          </div>
        </div>

        {inscription.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: textGray }}>
            <Inbox size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p>Aucune inscription pour le moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inscription.map(inscription => (
              <div key={inscription.id} style={{
                background: gray, borderRadius: 14, padding: '18px',
                border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: dark, fontSize: '1rem', marginBottom: 4 }}>
                    {inscription.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: textGray, display: 'flex', gap: 12 }}>
                    <span>📧 {inscription.email}</span>
                    <span>📱 {inscription.phone}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>
                    {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {inscription.status === 'en_attente' ? (
                    <>
                      <button onClick={() => handleStatusChange(inscription.id, 'accepte')} style={{
                        padding: '8px 14px', borderRadius: 8, border: 'none',
                        background: green, color: white, fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem'
                      }}>
                        <CheckSquare size={14} style={{ marginRight: 4 }} /> Accepter
                      </button>
                      <button onClick={() => handleStatusChange(inscription.id, 'refuse')} style={{
                        padding: '8px 14px', borderRadius: 8, border: '1px solid #EF4444',
                        background: white, color: red, fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem'
                      }}>
                        <XSquare size={14} style={{ marginRight: 4 }} /> Refuser
                      </button>
                    </>
                  ) : (
                    <span style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                      background: inscription.status === 'accepte' ? '#ECFDF5' : '#FEE2E2',
                      color: inscription.status === 'accepte' ? '#047857' : '#991B1B'
                    }}>
                      {inscription.status === 'accepte' ? '✅ Acceptée' : '❌ Refusée'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function GestionCampagnesMarketing() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('toutes');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedCampagne, setSelectedCampagne] = useState(null);

  // Charger les campagnes depuis l'API
  const fetchCampagnes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/campagnes');
      setCampagnes(res.data);
    } catch (err) {
      console.error('[FETCH ERROR]', err);
      setError('Impossible de charger les campagnes. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampagnes();
  }, []);

const handleDiffuse = async () => {
  try {
    setLoading(true);

    const response = await api.post('/notifications/diffuse', {
      campagneId: selectedCampagne.id,
      channels: selectedChannels,
      title: selectedCampagne.title,
      message: customMessage || `Nouvelle formation : ${selectedCampagne.title} ! Inscrivez-vous dès maintenant...`,
    });

    console.log('Réponse diffusion:', response.data);

    // ✅ Gérer la réponse asynchrone
    if (response.data.status === 'processing') {
      toast.success('✅ Diffusion lancée en arrière-plan ! Les notifications seront envoyées.');

      setTimeout(() => {
        setShowDiffuseModal(false);
        setSelectedChannels([]);
      }, 2000);

      return;
    }

    // Si la réponse contient des résultats (mode synchrone legacy)
    if (response.data.results) {
      const { email, push } = response.data.results;

      if (email?.sent > 0) {
        toast.success(`📧 ${email.sent} email(s) envoyé(s)`);
      }
      if (email?.failed > 0) {
        toast.error(`📧 ${email.failed} email(s) échoué(s)`);
      }

      if (push?.sent > 0) {
        toast.success(`🔔 ${push.sent} push envoyé(s)`);
      }
      if (push?.failed > 0) {
        toast.error(`🔔 ${push.failed} push échoué(s)`);
      }
    }

    setShowDiffuseModal(false);
    setSelectedChannels([]);

  } catch (error) {
    console.error('[DIFFUSION ERROR]', error);

    // Gérer l'erreur de timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.info('⏳ Diffusion en cours... Vérifiez vos notifications plus tard.');
    } else {
      toast.error('Erreur lors de la diffusion : ' + (error.response?.data?.error || error.message));
    }
  } finally {
    setLoading(false);
  }
};
  // Créer une campagne
  const handleCreate = async (data) => {
    await api.post('/api/campagnes', data);
    await fetchCampagnes();
  };

  // Modifier une campagne
  const handleUpdate = async (data) => {
    await api.patch(`/api/campagnes/${selectedCampagne.id}`, data);
    await fetchCampagnes();
    setSelectedCampagne(null);
  };

  // Supprimer une campagne
  const handleDelete = async () => {
    await api.delete(`/api/campagnes/${selectedCampagne.id}`);
    await fetchCampagnes();
    setShowDelete(false);
    setSelectedCampagne(null);
  };

  // Toggle publish
 const togglePublish = async (campagne) => {
  try {
    if (campagne.published) {
      await api.put(`/api/campagnes/${campagne.id}/unpublish`);
    } else {
      await api.put(`/api/campagnes/${campagne.id}/publish`);
    }
    await fetchCampagnes();
  } catch (err) {
    alert('Erreur : ' + (err.response?.data?.error || err.message));
  }
};

  // Filtrer les campagnes
  const filteredCampagnes = campagnes.filter(c => {
    if (filter !== 'toutes' && c.status !== filter) return false;
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: gray }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} color={gold} className="spin" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: textGray }}>Chargement des campagnes...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: gray, padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <AlertTriangle size={48} color={red} style={{ marginBottom: 16 }} />
          <p style={{ color: red, fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>{error}</p>
          <button onClick={fetchCampagnes} style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            background: gold, color: white, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: gray, fontFamily: "'Inter', sans-serif", padding: '40px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: dark, margin: 0 }}>
              Gestion des Campagnes
            </h1>
            <p style={{ color: textGray, fontSize: '1rem', margin: '8px 0 0' }}>
              Créez, publiez et gérez vos formations marketing
            </p>
          </div>
          <button
            onClick={() => { setSelectedCampagne(null); setShowForm(true); }}
            style={{
              padding: '14px 28px', borderRadius: 14, border: 'none',
              background: gold, color: 'white', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(245,166,35,0.3)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} />
            Nouvelle Campagne
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['toutes', 'ACTIVE', 'DRAFT', 'PAUSED', 'COMPLETED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px', borderRadius: 12,
                border: filter === f ? 'none' : '1px solid #E5E5E5',
                background: filter === f ? gold : white,
                color: filter === f ? 'white' : dark,
                fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                textTransform: f === 'toutes' ? 'none' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {f === 'toutes' ? 'Toutes' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Rechercher une campagne..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E5E5',
                background: white, width: 280, fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, background: white, padding: 4, borderRadius: 10, border: '1px solid #E5E5E5' }}>
            <button onClick={() => setViewMode('grid')} style={{
              padding: '8px 12px', borderRadius: 8, border: 'none',
              background: viewMode === 'grid' ? gold : 'transparent',
              color: viewMode === 'grid' ? 'white' : textGray,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <Grid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} style={{
              padding: '8px 12px', borderRadius: 8, border: 'none',
              background: viewMode === 'list' ? gold : 'transparent',
              color: viewMode === 'list' ? 'white' : textGray,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Count */}
      <div style={{ marginBottom: 20, color: textGray, fontSize: '0.9rem' }}>
        {filteredCampagnes.length} campagne{filteredCampagnes.length > 1 ? 's' : ''} trouvée{filteredCampagnes.length > 1 ? 's' : ''}
      </div>

      {/* Grid/List */}
      <div style={viewMode === 'grid' ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 24
      } : { display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence>
          {filteredCampagnes.map((campagne, index) => {
            const typeStyle = TYPE_COLORS[campagne.type] || TYPE_COLORS['FORMATION'];
            const statusStyle = STATUS_CONFIG[campagne.status] || STATUS_CONFIG['DRAFT'];
            const inscrits = (campagne.placesTotal || 0) - (campagne.placesRestantes || 0);
            const tauxRemplissage = campagne.placesTotal ? Math.round((inscrits / campagne.placesTotal) * 100) : 0;
            const reservationsCount = campagne.inscription?.length || 0;

            if (viewMode === 'list') {
              return (
                <motion.div
                  key={campagne.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: white, borderRadius: 16, padding: '20px 24px',
                    border: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', gap: 20,
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,166,35,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={campagne.image || 'https://via.placeholder.com/60'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                        background: typeStyle.bg, color: typeStyle.color
                      }}>
                        {typeStyle.icon} {campagne.type}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                        background: statusStyle.bg, color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                      {!campagne.published && (
                        <span style={{
                          padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                          background: '#FEF3C7', color: '#B45309'
                        }}>
                          Non publiée
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: dark, margin: 0 }}>{campagne.title}</h3>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.8rem', color: textGray }}>
                      <span>📅 {campagne.date || campagne.dateScheduled?.split('T')[0]}</span>
                      <span>👥 {inscrits}/{campagne.placesTotal}</span>
                      <span style={{ color: gold, fontWeight: 700 }}>{campagne.prix} TND</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionButton icon={Eye} onClick={() => { setSelectedCampagne(campagne); setShowDetails(true); }} title="Voir" />
                    <ActionButton icon={Edit} onClick={() => { setSelectedCampagne(campagne); setShowEdit(true); }} title="Modifier" />
                    <ActionButton icon={campagne.published ? EyeOff : Eye} onClick={() => togglePublish(campagne)} title={campagne.published ? 'Dépublier' : 'Publier'} color={campagne.published ? '#9CA3AF' : green} />
                    <ActionButton icon={Send} onClick={() => { setSelectedCampagne(campagne); setShowNotification(true); }} title="Diffuser" color={blue} />
                    <ActionButton icon={Trash2} onClick={() => { setSelectedCampagne(campagne); setShowDelete(true); }} title="Supprimer" color={red} />
                  </div>
                </motion.div>
              );
            }

            // Grid view
            return (
              <motion.div
                key={campagne.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.08 }}
                style={{
                  background: white, borderRadius: 20, overflow: 'hidden',
                  border: '1px solid #E5E5E5', transition: 'all 0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Image */}
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img src={campagne.image || 'https://via.placeholder.com/400x180'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                    <span style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`,
                      backdropFilter: 'blur(10px)'
                    }}>
                      {typeStyle.icon} {campagne.type}
                    </span>
                    <span style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: statusStyle.bg, color: statusStyle.color,
                      backdropFilter: 'blur(10px)'
                    }}>
                      {statusStyle.badge} {statusStyle.label}
                    </span>
                  </div>
                  {!campagne.published && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: 'rgba(0,0,0,0.7)', color: 'white'
                    }}>
                      🔒 Non publiée
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: dark, margin: '0 0 8px', lineHeight: 1.3 }}>
                    {campagne.title}
                  </h3>
                  <p style={{ color: textGray, fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {campagne.description}
                  </p>

                  <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: textGray }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {campagne.date || campagne.dateScheduled?.split('T')[0]}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {inscrits}/{campagne.placesTotal}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: gold, fontWeight: 700 }}><DollarSign size={14} /> {campagne.prix} TND</span>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                      <span style={{ color: textGray }}>Remplissage</span>
                      <span style={{ fontWeight: 700, color: dark }}>{tauxRemplissage}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: '#F0F0F0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: tauxRemplissage >= 80 ? red : tauxRemplissage >= 50 ? gold : green,
                        width: `${tauxRemplissage}%`, transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <ActionButton icon={Eye} label="Voir" onClick={() => { setSelectedCampagne(campagne); setShowDetails(true); }} small />
                    <ActionButton icon={Edit} label="Modifier" onClick={() => { setSelectedCampagne(campagne); setShowEdit(true); }} small />
                    <ActionButton icon={campagne.published ? EyeOff : Eye} label={campagne.published ? 'Dépublier' : 'Publier'} onClick={() => togglePublish(campagne)} small color={campagne.published ? '#9CA3AF' : green} />
                    <ActionButton icon={Send} label="Diffuser" onClick={() => { setSelectedCampagne(campagne); setShowNotification(true); }} small color={blue} />

                     {/* ✅ NOUVEAU BOUTON : Voir les avis */}
                    <ActionButton icon={MessageSquare} label="Avis" onClick={() => navigate(`/FeedbacksCampagne/${campagne.id}`)} small color={purple} />

                    {reservationsCount > 0 && (
                      <ActionButton icon={Inbox} label={`${reservationsCount} rés.`} onClick={() => { setSelectedCampagne(campagne); setShowReservations(true); }} small color={purple} />
                    )}
                    <ActionButton icon={Trash2} label="Suppr." onClick={() => { setSelectedCampagne(campagne); setShowDelete(true); }} small color={red} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCampagnes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Megaphone size={48} style={{ color: '#E5E5E5', marginBottom: 16 }} />
          <p style={{ color: textGray, fontSize: '1.1rem' }}>Aucune campagne trouvée</p>
          <button onClick={() => { setFilter('toutes'); setSearch(''); }} style={{
            marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none',
            background: gold, color: 'white', fontWeight: 600, cursor: 'pointer'
          }}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Modals */}
      <CampagneFormModal
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      <CampagneFormModal
        show={showEdit}
        onClose={() => { setShowEdit(false); setSelectedCampagne(null); }}
        onSubmit={handleUpdate}
        initialData={selectedCampagne}
        mode="edit"
      />

      <DetailsModal
        show={showDetails}
        onClose={() => { setShowDetails(false); setSelectedCampagne(null); }}
        campagne={selectedCampagne}
      />

      <DeleteConfirmModal
        show={showDelete}
        onClose={() => { setShowDelete(false); setSelectedCampagne(null); }}
        onConfirm={handleDelete}
        campagne={selectedCampagne}
      />

      <ReservationsModal
        show={showReservations}
        onClose={() => { setShowReservations(false); setSelectedCampagne(null); }}
        campagne={selectedCampagne}
        onUpdate={fetchCampagnes}
      />

      <NotificationModal
        show={showNotification}
        onClose={() => { setShowNotification(false); setSelectedCampagne(null); }}
        campagne={selectedCampagne}
      />
    </div>
  );
}

// ============================================================
// BOUTON ACTION RÉUTILISABLE
// ============================================================
function ActionButton({ icon: Icon, label, onClick, title, color = textGray, small = false }) {
  return (
    <button
      onClick={onClick}
      title={title || label}
      style={{
        padding: small ? '6px 10px' : '8px 12px',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        background: white,
        color: color,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: small ? '0.75rem' : '0.8rem',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = color + '10'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = white; e.currentTarget.style.borderColor = '#E5E5E5'; }}
    >
      <Icon size={small ? 14 : 16} />
      {label}
    </button>
  );
}
