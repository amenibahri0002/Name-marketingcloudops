import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MapPin, Camera, Save, ArrowLeft, Award, BookOpen, CreditCard, Edit3, CheckCircle, Lock, Bell, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import api from '../api';

const THEME = {
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  gold: '#d4a574',
  goldLight: '#f5efe6',
  goldDark: '#b8956a',
  success: '#10b981',
  successLight: '#d1fae5',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  dark: '#1a1a2e',
};

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/me');
      const userData = res.data;
      setUser(userData);
      setFormData({
        nom: userData.nom || userData.name || '',
        prenom: userData.prenom || '',
        email: userData.email || userData.mail || '',
        telephone: userData.telephone || userData.phone || '',
        entreprise: userData.entreprise || userData.company || '',
        adresse: userData.adresse || userData.address || '',
        ville: userData.ville || userData.city || '',
        bio: userData.bio || '',
      });
    } catch (err) {
      console.error('Erreur profil:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Impossible de charger votre profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/api/users/me', formData);
      setUser(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.nom || user?.name || 'Client';
  const displayEmail = user?.email || user?.mail || '';
  const displayRole = user?.role || 'client';
  const inscriptions = user?.inscriptionsCount || 0;
  const certificats = user?.formationsCompletees || 0;
  const paiementsCount = user?.paiementsCount || 0;

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, system-ui, sans-serif', padding: '30px' }}>
        <style>{"::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d1c7b7; border-radius: 3px; } * { scrollbar-width: thin; scrollbar-color: #d1c7b7 transparent; }"}</style>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
            <button onClick={() => navigate('/campagnes')} style={{
              display: 'flex', alignItems: 'center', gap: 8, color: THEME.textLight,
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
              transition: 'color 0.3s',
            }} onMouseEnter={e => e.currentTarget.style.color = THEME.text}
            onMouseLeave={e => e.currentTarget.style.color = THEME.textLight}>
              <ArrowLeft size={18} /> Retour
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: THEME.text }}>Mon Profil</h1>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 100 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', color: THEME.gold }} />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p style={{ color: THEME.textLight }}>Chargement de votre profil...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: 40, background: '#fef2f2', borderRadius: 16,
              border: '1px solid #fecaca', color: '#dc2626',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
              <button onClick={fetchUser} style={{
                padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: '#fff',
                border: 'none', fontWeight: 600, cursor: 'pointer',
              }}>Réessayer</button>
            </div>
          ) : (
            <>
              {/* Profil Header */}
              <div style={{
                background: THEME.card, borderRadius: 20, padding: 40, marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`,
                textAlign: 'center', position: 'relative',
              }}>
                <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 20px' }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%', background: THEME.gold,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 800, color: '#fff',
                    border: `4px solid ${THEME.goldLight}`, overflow: 'hidden',
                  }}>
                    {user?.avatar ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(displayName)}
                  </div>
                  <div onClick={() => alert('Upload photo a implementer')} style={{
                    position: 'absolute', bottom: 0, right: 0, width: 36, height: 36,
                    background: THEME.gold, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff',
                    cursor: 'pointer', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    <Camera size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.text, marginBottom: 8 }}>{displayName}</div>
                <div style={{ fontSize: '1rem', color: THEME.textLight, marginBottom: 8 }}>{displayEmail}</div>
                <span style={{
                  display: 'inline-block', background: THEME.goldLight, color: THEME.gold,
                  padding: '4px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
                  textTransform: 'uppercase',
                }}>{displayRole}</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { icon: BookOpen, label: 'Inscriptions', value: inscriptions, color: THEME.gold, bg: THEME.goldLight },
                  { icon: Award, label: 'Certificats', value: certificats, color: THEME.success, bg: '#d1fae5' },
                  { icon: CreditCard, label: 'Paiements', value: paiementsCount, color: THEME.blue, bg: THEME.blueLight },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} style={{
                      background: THEME.card, padding: 20, borderRadius: 16,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`,
                      textAlign: 'center', transition: 'all 0.3s',
                    }} onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                    }} onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: stat.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', color: stat.color,
                      }}>
                        <Icon size={22} />
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '0.85rem', color: THEME.textLight, marginTop: 4 }}>{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Success Message */}
              {saved && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, background: '#d1fae5',
                    color: '#059669', padding: '12px 16px', borderRadius: 10,
                    marginBottom: 20, border: '1px solid #a7f3d0',
                  }}>
                  <CheckCircle size={18} /> Profil mis à jour avec succès !
                </motion.div>
              )}

              {/* Formulaire */}
              <div style={{
                background: THEME.card, borderRadius: 20, padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`, marginBottom: 24,
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={20} style={{ color: THEME.gold }} /> Informations personnelles
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  {[
                    { label: 'Prénom', key: 'prenom', type: 'text' },
                    { label: 'Nom', key: 'nom', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Téléphone', key: 'telephone', type: 'text' },
                    { label: 'Entreprise', key: 'entreprise', type: 'text' },
                    { label: 'Ville', key: 'ville', type: 'text' },
                  ].map(field => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: THEME.text, marginBottom: 8 }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={!editing}
                        placeholder={`Votre ${field.label.toLowerCase()}`}
                        style={{
                          padding: '12px 16px', border: '2px solid', borderColor: editing ? THEME.border : THEME.border,
                          borderRadius: 12, fontSize: '0.95rem', color: THEME.text,
                          transition: 'all 0.3s', background: editing ? '#fff' : THEME.bg,
                          outline: 'none',
                        }}
                        onFocus={e => { if (editing) e.target.style.borderColor = THEME.gold; }}
                        onBlur={e => e.target.style.borderColor = THEME.border}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: THEME.text, marginBottom: 8 }}>Adresse</label>
                    <input
                      value={formData.adresse || ''}
                      onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                      disabled={!editing}
                      placeholder="Votre adresse complète"
                      style={{
                        padding: '12px 16px', border: '2px solid', borderColor: THEME.border,
                        borderRadius: 12, fontSize: '0.95rem', color: THEME.text,
                        transition: 'all 0.3s', background: editing ? '#fff' : THEME.bg,
                        outline: 'none',
                      }}
                      onFocus={e => { if (editing) e.target.style.borderColor = THEME.gold; }}
                      onBlur={e => e.target.style.borderColor = THEME.border}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: THEME.text, marginBottom: 8 }}>Bio</label>
                    <textarea
                      rows={3}
                      value={formData.bio || ''}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!editing}
                      placeholder="Une courte description de vous..."
                      style={{
                        padding: '12px 16px', border: '2px solid', borderColor: THEME.border,
                        borderRadius: 12, fontSize: '0.95rem', color: THEME.text,
                        transition: 'all 0.3s', background: editing ? '#fff' : THEME.bg,
                        outline: 'none', resize: 'vertical',
                      }}
                      onFocus={e => { if (editing) e.target.style.borderColor = THEME.gold; }}
                      onBlur={e => e.target.style.borderColor = THEME.border}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                      background: THEME.gold, color: '#fff', border: 'none', borderRadius: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                    }} onMouseEnter={e => { e.target.style.background = THEME.goldDark; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.target.style.background = THEME.gold; e.target.style.transform = 'translateY(0)'; }}>
                      <Edit3 size={18} /> Modifier
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setEditing(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                        background: THEME.card, color: THEME.text, border: `2px solid ${THEME.border}`,
                        borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                      }} onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.target.style.borderColor = THEME.border; e.target.style.color = THEME.text; }}>
                        Annuler
                      </button>
                      <button onClick={handleSave} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                        background: THEME.success, color: '#fff', border: 'none',
                        borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                      }} onMouseEnter={e => { e.target.style.background = '#059669'; e.target.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.target.style.background = THEME.success; e.target.style.transform = 'translateY(0)'; }}>
                        <Save size={18} /> Enregistrer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sécurité */}
              <div style={{
                background: THEME.card, borderRadius: 20, padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`,
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={20} style={{ color: THEME.gold }} /> Sécurité du compte
                </h3>
                {[
                  { icon: Lock, label: 'Mot de passe', value: 'Dernière modification il y a 30 jours' },
                  { icon: Bell, label: 'Notifications', value: 'Email et push activés' },
                  { icon: Calendar, label: 'Membre depuis', value: 'Juin 2026' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                      borderBottom: i < 2 ? `1px solid ${THEME.border}` : 'none',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, background: THEME.goldLight,
                        color: THEME.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: THEME.text, marginTop: 2 }}>{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}