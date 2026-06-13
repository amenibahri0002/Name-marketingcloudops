import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, 
  Sparkles, Zap, Palette, TrendingUp, BookOpen, Award,
  CheckCircle, AlertCircle, Phone, Mail, User, Loader2,
  CreditCard, Building, Banknote, FileText, Shield, Crown, Star, Gem,
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import Layout from '../Layout';
import api from '../api';

const THEME = {
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b', textLight: '#64748b',
  border: '#e2e8f0', gold: '#d4a574', goldLight: '#f5efe6', goldDark: '#b8956a',
  success: '#10b981', successLight: '#d1fae5', danger: '#ef4444',
  blue: '#3b82f6', blueLight: '#dbeafe', dark: '#1a1a2e', purple: '#8b5cf6',
};

const ICON_MAP = { Sparkles, Zap, Palette, TrendingUp, BookOpen, Award };

const PAYMENT_TYPES = [
  { id: 'carte', label: 'Carte Bancaire', icon: CreditCard, description: 'Paiement securise par carte', color: '#3b82f6' },
  { id: 'virement', label: 'Virement Bancaire', icon: Building, description: 'Virement sur notre compte', color: '#10b981' },
  { id: 'd17', label: 'D17 - Paiement differe', icon: FileText, description: 'Paiement sous 17 jours', color: '#f59e0b' },
  { id: 'especes', label: 'Especes', icon: Banknote, description: 'Paiement sur place', color: '#8b5cf6' },
];

const FORMULES = [
  { id: 'standard', label: 'Standard', icon: Star, description: 'Formation uniquement', prix: 0, color: '#64748b', features: ['Acces a la formation', 'Support email', 'Certificat de participation'] },
  { id: 'premium', label: 'Premium', icon: Crown, description: 'Formation + Support 1 mois', prix: 150, color: '#d4a574', features: ['Tout le pack Standard', 'Support prioritaire 1 mois', 'Acces aux replays', 'Materiel pedagogique'] },
  { id: 'vip', label: 'VIP', icon: Gem, description: 'Formation + Support 3 mois + Certificat', prix: 300, color: '#8b5cf6', features: ['Tout le pack Premium', 'Support prioritaire 3 mois', 'Certificat officiel', 'Mentorat individuel', 'Acces reseau alumni'] },
];

const InscriptionForm = ({ campagne, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', entreprise: '', notes: '',
    formule: 'standard', paymentType: 'carte', acceptConditions: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [expandedFormule, setExpandedFormule] = useState(null);

  const selectedFormule = FORMULES.find(f => f.id === formData.formule);
  const selectedPayment = PAYMENT_TYPES.find(p => p.id === formData.paymentType);

  const prixBase = campagne.prix || 0;
  const prixFormule = selectedFormule ? selectedFormule.prix : 0;
  const totalHT = prixBase + prixFormule;
  const tva = totalHT * 0.19;
  const totalTTC = totalHT + tva;

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => { setError(''); setStep(step - 1); };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.acceptConditions) {
    setError('Vous devez accepter les conditions générales');
    return;
  }
  setLoading(true);
  setError('');

  try {
    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    // ⚠️ VÉRIFICATION : Email doit exister
    const email = user.email || formData.email;
    if (!email) {
      setError('Email requis. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    // Préparer les données
    const payload = {
      name: user.name || formData.name || 'Utilisateur',
      email: email,
      phone: user.phone || formData.phone || '',
      entreprise: formData.entreprise,
      notes: formData.notes,
      formule: formData.formule,
      paymentType: formData.paymentType,
      prixTotal: totalTTC,
      campagneId: parseInt(campagne.id),
      userId: user.id || null
    };

    console.log('Payload inscription:', payload); // Debug

    const response = await api.post('/api/inscriptions', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    setSuccess(true);
    if (onSuccess) onSuccess(response.data.inscription);
  } catch (err) {
    console.error('Erreur inscription:', err);
    setError(err.response?.data?.error || "Erreur lors de l'inscription");
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ padding: '40px', background: THEME.successLight, borderRadius: '20px', textAlign: 'center', border: '3px solid ' + THEME.success }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
          <CheckCircle size={64} style={{ color: THEME.success, marginBottom: '20px' }} />
        </motion.div>
        <h3 style={{ color: '#065f46', fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Inscription confirmee !</h3>
        <p style={{ color: '#059669', fontSize: '1.1rem', marginBottom: '8px' }}>Vous etes inscrit a : <strong>{campagne.title}</strong></p>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px', textAlign: 'left' }}>
          <p style={{ color: THEME.text, fontWeight: '600', marginBottom: '8px' }}>Recapitulatif :</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: THEME.textLight }}>Formule</span><span style={{ color: THEME.text, fontWeight: '600' }}>{selectedFormule ? selectedFormule.label : ''}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: THEME.textLight }}>Paiement</span><span style={{ color: THEME.text, fontWeight: '600' }}>{selectedPayment ? selectedPayment.label : ''}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid ' + THEME.border, paddingTop: '8px', marginTop: '8px' }}>
            <span style={{ color: THEME.text, fontWeight: '700' }}>Total paye</span>
            <span style={{ color: THEME.success, fontWeight: '800', fontSize: '1.2rem' }}>{totalTTC.toFixed(2)} TND</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ background: THEME.card, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid ' + THEME.border, overflow: 'hidden' }}>
      <div style={{ background: THEME.dark, padding: '24px 32px', color: '#fff' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={24} style={{ color: THEME.gold }} /> S'inscrire a cette formation
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: step >= s ? THEME.gold : 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.3s' }}>
                {step > s ? <CheckCircle size={18} /> : s}
              </div>
              <div style={{ flex: 1, height: 3, background: step > s ? THEME.gold : 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
              <span style={{ fontSize: '0.75rem', color: step >= s ? THEME.gold : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {s === 1 ? 'Infos' : s === 2 ? 'Formule' : 'Paiement'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fee2e2', color: '#991b1b', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fecaca' }}>
            <AlertCircle size={20} /> {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: THEME.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: THEME.gold }} /> Vos informations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: THEME.text, fontSize: '0.9rem' }}>Nom complet *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = THEME.border}
                    placeholder="Votre nom et prenom" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: THEME.text, fontSize: '0.9rem' }}>Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = THEME.border}
                    placeholder="votre@email.com" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: THEME.text, fontSize: '0.9rem' }}>Telephone *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '14px 16px', border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = THEME.border}
                      placeholder="+216 XX XXX XXX" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: THEME.text, fontSize: '0.9rem' }}>Entreprise</label>
                    <input type="text" value={formData.entreprise} onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                      style={{ width: '100%', padding: '14px 16px', border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = THEME.border}
                      placeholder="Nom de votre entreprise" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: THEME.text, fontSize: '0.9rem' }}>Notes / Commentaires</label>
                  <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '15px', outline: 'none', transition: 'all 0.3s', resize: 'vertical' }}
                    onFocus={(e) => e.target.style.borderColor = THEME.gold} onBlur={(e) => e.target.style.borderColor = THEME.border}
                    placeholder="Avez-vous des questions ou besoins specifiques ?" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button onClick={handleNext}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: THEME.gold, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = THEME.goldDark}
                  onMouseLeave={e => e.currentTarget.style.background = THEME.gold}>
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: THEME.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} style={{ color: THEME.gold }} /> Choisissez votre formule
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {FORMULES.map((formule) => {
                  const Icon = formule.icon;
                  const isSelected = formData.formule === formule.id;
                  const isExpanded = expandedFormule === formule.id;
                  return (
                    <div key={formule.id} 
                      style={{ borderRadius: '16px', border: '2px solid ' + (isSelected ? formule.color : THEME.border), background: isSelected ? formule.color + '08' : THEME.card, overflow: 'hidden', transition: 'all 0.3s' }}>
                      <div onClick={() => setFormData({...formData, formule: formule.id})}
                        style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: isSelected ? formule.color : THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : formule.color, transition: 'all 0.3s' }}>
                          <Icon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', color: THEME.text, fontSize: '1.1rem' }}>{formule.label}</span>
                            <span style={{ fontWeight: '800', color: formule.color, fontSize: '1.2rem' }}>
                              {formule.prix > 0 ? '+' + formule.prix + ' TND' : 'Inclus'}
                            </span>
                          </div>
                          <p style={{ color: THEME.textLight, fontSize: '0.9rem' }}>{formule.description}</p>
                        </div>
                        {isSelected && <CheckCircle size={24} style={{ color: formule.color }} />}
                      </div>
                      <div style={{ padding: '0 20px 20px' }}>
                        <button onClick={() => setExpandedFormule(isExpanded ? null : formule.id)}
                          style={{ background: 'none', border: 'none', color: THEME.textLight, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: isExpanded ? '12px' : '0' }}>
                          {isExpanded ? 'Masquer' : 'Voir les details'} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {formule.features.map((feature, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: THEME.bg, borderRadius: '8px' }}>
                                <CheckCircle size={14} style={{ color: formule.color }} />
                                <span style={{ color: THEME.text, fontSize: '0.9rem' }}>{feature}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button onClick={handleBack}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: THEME.bg, color: THEME.text, border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                  <ArrowLeft size={18} /> Retour
                </button>
                <button onClick={handleNext}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: THEME.gold, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = THEME.goldDark}
                  onMouseLeave={e => e.currentTarget.style.background = THEME.gold}>
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: THEME.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} style={{ color: THEME.gold }} /> Mode de paiement
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {PAYMENT_TYPES.map((payment) => {
                  const Icon = payment.icon;
                  const isSelected = formData.paymentType === payment.id;
                  return (
                    <div key={payment.id} onClick={() => setFormData({...formData, paymentType: payment.id})}
                      style={{ padding: '18px', borderRadius: '14px', border: '2px solid ' + (isSelected ? payment.color : THEME.border), background: isSelected ? payment.color + '08' : THEME.card, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '10px', background: isSelected ? payment.color : THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : payment.color }}>
                        <Icon size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: THEME.text, marginBottom: '2px' }}>{payment.label}</div>
                        <p style={{ color: THEME.textLight, fontSize: '0.85rem' }}>{payment.description}</p>
                      </div>
                      {isSelected && <CheckCircle size={22} style={{ color: payment.color }} />}
                    </div>
                  );
                })}
              </div>

              <div style={{ background: THEME.bg, padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: THEME.textLight, fontSize: '0.9rem' }}>Prix formation</span>
                  <span style={{ color: THEME.text, fontWeight: '600' }}>{prixBase.toFixed(2)} TND</span>
                </div>
                {selectedFormule && selectedFormule.prix > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: THEME.textLight, fontSize: '0.9rem' }}>Formule {selectedFormule.label}</span>
                    <span style={{ color: selectedFormule.color, fontWeight: '600' }}>+{prixFormule.toFixed(2)} TND</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: THEME.textLight, fontSize: '0.9rem' }}>Total HT</span>
                  <span style={{ color: THEME.text, fontWeight: '600' }}>{totalHT.toFixed(2)} TND</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: THEME.textLight, fontSize: '0.9rem' }}>TVA 19%</span>
                  <span style={{ color: THEME.text, fontWeight: '600' }}>{tva.toFixed(2)} TND</span>
                </div>
                <div style={{ borderTop: '2px solid ' + THEME.border, paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: THEME.text, fontWeight: '700', fontSize: '1.1rem' }}>Total TTC</span>
                  <span style={{ color: THEME.gold, fontWeight: '800', fontSize: '1.5rem' }}>{totalTTC.toFixed(2)} TND</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px', padding: '16px', background: THEME.goldLight, borderRadius: '12px' }}>
                <input type="checkbox" id="conditions" checked={formData.acceptConditions} onChange={(e) => setFormData({...formData, acceptConditions: e.target.checked})}
                  style={{ width: 20, height: 20, marginTop: '2px', accentColor: THEME.gold, cursor: 'pointer' }} />
                <label htmlFor="conditions" style={{ color: THEME.text, fontSize: '0.9rem', lineHeight: '1.5', cursor: 'pointer' }}>
                  J'accepte les <span style={{ color: THEME.gold, fontWeight: '600', textDecoration: 'underline' }}>conditions generales</span> et je confirme que les informations fournies sont exactes.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button onClick={handleBack}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: THEME.bg, color: THEME.text, border: '2px solid ' + THEME.border, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                  <ArrowLeft size={18} /> Retour
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: THEME.success, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}
                  onMouseLeave={e => e.currentTarget.style.background = THEME.success}>
                  {loading ? 'Traitement...' : <><Shield size={18} /> Confirmer et payer</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function CampagneDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscriptionsCount, setInscriptionsCount] = useState(0);

  useEffect(() => { fetchCampagne(); }, [idOrSlug]);

  const fetchCampagne = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/campagnes/' + idOrSlug);
      setCampagne(response.data);
      try {
        const inscriptionsRes = await api.get('/api/inscriptions');
        const count = inscriptionsRes.data.filter(i => i.campagneId === response.data.id).length;
        setInscriptionsCount(count);
      } catch (e) { console.warn('Impossible de compter les inscriptions'); }
    } catch (err) {
      setError(err.response && err.response.status === 404 ? 'Formation non trouvee' : 'Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  const handleInscriptionSuccess = () => {
    setInscriptionsCount(prev => prev + 1);
    setCampagne(prev => ({ ...prev, placesRestantes: Math.max(0, prev.placesRestantes - 1) }));
  };

  if (loading) return (
    <Layout>
      <div style={{ minHeight: '100vh', background: THEME.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', color: THEME.gold }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: THEME.textLight }}>Chargement...</p>
        </div>
      </div>
    </Layout>
  );

  if (error || !campagne) return (
    <Layout>
      <div style={{ minHeight: '100vh', background: THEME.bg, padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', background: THEME.card, padding: 40, borderRadius: 16, border: '1px solid ' + THEME.border }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h2 style={{ color: THEME.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>{error || 'Non trouvee'}</h2>
          <button onClick={() => navigate('/campagnes')} style={{ padding: '12px 24px', background: THEME.gold, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
            <ArrowLeft size={16} style={{ display: 'inline', marginRight: 8 }} /> Retour
          </button>
        </div>
      </div>
    </Layout>
  );

  const IconComponent = ICON_MAP[campagne.iconName] || Sparkles;
  const remise = campagne.prixOriginal && campagne.prix ? Math.round(((campagne.prixOriginal - campagne.prix) / campagne.prixOriginal) * 100) : 0;
  const placesPourcentage = campagne.placesTotal ? ((campagne.placesTotal - campagne.placesRestantes) / campagne.placesTotal) * 100 : 0;
  const placesPrises = campagne.placesTotal - campagne.placesRestantes;

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{"::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d1c7b7; border-radius: 3px; } * { scrollbar-width: thin; scrollbar-color: #d1c7b7 transparent; }"}</style>

        <div style={{ background: THEME.dark, color: '#fff', padding: '24px 32px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <button onClick={() => navigate('/campagnes')} style={{ background: 'transparent', border: 'none', color: THEME.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '16px' }}>
              <ArrowLeft size={16} /> Retour aux formations
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 60, height: 60, background: THEME.gold, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComponent size={32} color="#fff" />
              </div>
              <div>
                <span style={{ background: THEME.gold, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{campagne.format || 'Formation'}</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '8px', color: '#fff' }}>{campagne.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '40px', alignItems: 'start', alignItems: 'start' }}>

            <div>
              <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
                <img src={campagne.image || '/default-formation.jpg'} alt={campagne.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {remise > 0 && (
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: THEME.danger, color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: '700' }}>-{remise}%</div>
                )}
              </div>

              <div style={{ background: THEME.card, padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid ' + THEME.border }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Description</h2>
                <p style={{ color: THEME.textLight, lineHeight: '1.7' }}>{campagne.description || 'Aucune description.'}</p>
              </div>

              <div style={{ background: THEME.card, padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid ' + THEME.border }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Informations pratiques</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { icon: Calendar, label: 'Date', value: campagne.dateScheduled || campagne.date || 'Non precisee' },
                    { icon: Clock, label: 'Duree', value: (campagne.dureeHeures || campagne.duree || 'Non precisee') + 'h' },
                    { icon: MapPin, label: 'Lieu', value: campagne.location || 'Non precise' },
                    { icon: Users, label: 'Places', value: (campagne.placesRestantes || 0) + ' / ' + (campagne.placesTotal || 0) + ' restantes' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={20} style={{ color: THEME.gold }} />
                        <div><p style={{ fontSize: '0.8rem', color: THEME.textLight }}>{item.label}</p><p style={{ fontWeight: '600', color: THEME.text }}>{item.value}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {campagne.tools && campagne.tools.length > 0 && (
                <div style={{ background: THEME.card, padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid ' + THEME.border }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Outils & Logiciels</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {campagne.tools.map((tool, i) => (
                      <span key={i} style={{ background: THEME.goldLight, color: THEME.goldDark, padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500' }}>{tool}</span>
                    ))}
                  </div>
                </div>
              )}

              {campagne.inclus && campagne.inclus.length > 0 && (
                <div style={{ background: THEME.card, padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid ' + THEME.border }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Ce qui est inclus</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {campagne.inclus.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={18} style={{ color: THEME.success }} /><span style={{ color: THEME.text }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campagne.prerequis && (
                <div style={{ background: THEME.card, padding: '24px', borderRadius: '16px', border: '1px solid ' + THEME.border }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Prerequis</h2>
                  <p style={{ color: THEME.textLight }}>{campagne.prerequis}</p>
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', top: '24px', alignSelf: 'start' }}>
              <div style={{ background: THEME.card, padding: '32px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid ' + THEME.border }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  {campagne.prixOriginal > campagne.prix && (
                    <p style={{ fontSize: '0.9rem', color: THEME.textLight, textDecoration: 'line-through', marginBottom: '4px' }}>{campagne.prixOriginal} TND</p>
                  )}
                  <p style={{ fontSize: '2.5rem', fontWeight: '800', color: THEME.gold }}>{campagne.prix || 0} TND</p>
                  {campagne.prixOriginal > campagne.prix && (
                    <p style={{ fontSize: '0.85rem', color: THEME.success, fontWeight: '600' }}>Economisez {campagne.prixOriginal - campagne.prix} TND</p>
                  )}
                </div>

                {campagne.placesTotal > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: THEME.textLight }}>{placesPrises} inscrits</span>
                      <span style={{ color: placesPourcentage > 80 ? THEME.danger : placesPourcentage > 50 ? '#f59e0b' : THEME.success, fontWeight: '600' }}>{campagne.placesRestantes} places restantes</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: placesPourcentage + '%', background: placesPourcentage > 80 ? THEME.danger : placesPourcentage > 50 ? '#f59e0b' : THEME.success, borderRadius: '4px' }} />
                    </div>
                  </div>
                )}

                {campagne.contact && (
                  <div style={{ background: THEME.goldLight, padding: '14px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: THEME.goldDark, fontWeight: '600' }}>
                      <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} /> {campagne.contact}
                    </p>
                  </div>
                )}
              </div>

              <InscriptionForm campagne={campagne} onSuccess={handleInscriptionSuccess} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}