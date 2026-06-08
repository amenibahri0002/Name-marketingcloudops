import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Building, MapPin, Calendar, 
  Camera, Save, ArrowLeft, Award, BookOpen, CreditCard,
  Edit3, CheckCircle, Lock, Bell, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#F5A623',
  primaryLight: '#FFF8E7',
  primaryDark: '#D48A1A',
  dark: '#0A0A0A',
  gray: '#666666',
  grayLight: '#F5F5F5',
  grayBorder: '#E5E5E5',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
};

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saved, setSaved] = useState(false);

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({
        nom: parsed.nom || parsed.name || '',
        prenom: parsed.prenom || '',
        email: parsed.email || parsed.mail || '',
        telephone: parsed.telephone || parsed.phone || '',
        entreprise: parsed.entreprise || parsed.company || '',
        adresse: parsed.adresse || parsed.address || '',
        ville: parsed.ville || parsed.city || '',
        bio: parsed.bio || '',
      });
    }
  }, []);

  const handleSave = () => {
    // Sauvegarder dans localStorage
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.nom || user?.name || 'Client';
  const displayEmail = user?.email || user?.mail || '';
  const displayRole = user?.role || 'client';
  const inscriptions = user?.inscriptions || 0;
  const certificats = user?.formationsCompletees || 0;

  return (
    <div className="profil-page">
      <style>{`
        .profil-page { min-height: 100vh; background: ${COLORS.grayLight}; padding: 30px; }
        .profil-container { max-width: 800px; margin: 0 auto; }

        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 30px; }
        .back-btn { display: flex; align-items: center; gap: 8px; color: ${COLORS.gray}; background: none; border: none; cursor: pointer; font-size: 0.95rem; }
        .back-btn:hover { color: ${COLORS.dark}; }
        .page-title { font-size: 1.8rem; font-weight: 800; color: ${COLORS.dark}; }

        /* HEADER PROFIL */
        .profil-header { background: ${COLORS.white}; border-radius: 20px; padding: 40px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder}; text-align: center; position: relative; }

        .profil-avatar-wrapper { position: relative; width: 120px; height: 120px; margin: 0 auto 20px; }
        .profil-avatar {
          width: 120px; height: 120px; border-radius: 50%; background: ${COLORS.primary};
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 800; color: ${COLORS.white};
          border: 4px solid ${COLORS.primaryLight}; overflow: hidden;
        }
        .profil-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-edit {
          position: absolute; bottom: 0; right: 0; width: 36px; height: 36px;
          background: ${COLORS.primary}; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; color: ${COLORS.white};
          cursor: pointer; border: 3px solid ${COLORS.white}; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .profil-name { font-size: 1.5rem; font-weight: 800; color: ${COLORS.dark}; margin-bottom: 8px; }
        .profil-email { font-size: 1rem; color: ${COLORS.gray}; margin-bottom: 8px; }
        .profil-role {
          display: inline-block; background: ${COLORS.primaryLight}; color: ${COLORS.primary};
          padding: 4px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
          text-transform: uppercase;
        }

        /* STATS */
        .profil-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-box {
          background: ${COLORS.white}; padding: 20px; border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder};
          text-align: center;
        }
        .stat-box-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .stat-box-value { font-size: 1.6rem; font-weight: 800; color: ${COLORS.primary}; }
        .stat-box-label { font-size: 0.85rem; color: ${COLORS.gray}; margin-top: 4px; }

        /* FORMULAIRE */
        .profil-form { background: ${COLORS.white}; border-radius: 20px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .form-section-title { font-size: 1.1rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-size: 0.85rem; font-weight: 600; color: ${COLORS.dark}; margin-bottom: 8px; }
        .form-input {
          padding: 12px 16px; border: 2px solid ${COLORS.grayBorder}; border-radius: 12px;
          font-size: 0.95rem; color: ${COLORS.dark}; transition: all 0.3s; background: ${COLORS.grayLight};
        }
        .form-input:focus { outline: none; border-color: ${COLORS.primary}; background: ${COLORS.white}; }
        .form-input:disabled { background: ${COLORS.grayLight}; color: ${COLORS.gray}; cursor: not-allowed; }
        .form-input.full-width { grid-column: 1 / -1; }

        .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
        .btn-edit {
          display: flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: ${COLORS.primary}; color: ${COLORS.white}; border: none;
          border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
        }
        .btn-edit:hover { background: ${COLORS.primaryDark}; transform: translateY(-2px); }
        .btn-save {
          display: flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: ${COLORS.green}; color: ${COLORS.white}; border: none;
          border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
        }
        .btn-save:hover { background: #059669; transform: translateY(-2px); }
        .btn-cancel {
          display: flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: ${COLORS.white}; color: ${COLORS.dark}; border: 2px solid ${COLORS.grayBorder};
          border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
        }
        .btn-cancel:hover { border-color: ${COLORS.red}; color: ${COLORS.red}; }

        .success-message {
          display: flex; align-items: center; gap: 10px; background: ${COLORS.green}15;
          color: ${COLORS.green}; padding: 12px 16px; border-radius: 10px;
          margin-bottom: 20px; border: 1px solid ${COLORS.green}30;
        }

        /* SECTIONS INFO */
        .info-section { background: ${COLORS.white}; border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${COLORS.grayBorder}; }
        .info-row:last-child { border-bottom: none; }
        .info-icon { width: 40px; height: 40px; border-radius: 10px; background: ${COLORS.primaryLight}; color: ${COLORS.primary}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .info-content { flex: 1; }
        .info-label { font-size: 0.8rem; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 1rem; font-weight: 600; color: ${COLORS.dark}; margin-top: 2px; }

        @media (max-width: 768px) {
          .profil-page { padding: 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .profil-stats { grid-template-columns: 1fr; }
          .profil-header { padding: 24px; }
        }
      `}</style>

      <div className="profil-container">
        {/* HEADER */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/campagnes')}>
            <ArrowLeft size={18} /> Retour
          </button>
          <h1 className="page-title">Mon Profil</h1>
        </div>

        {/* PROFIL HEADER */}
        <div className="profil-header">
          <div className="profil-avatar-wrapper">
            <div className="profil-avatar">
              {user?.avatar ? <img src={user.avatar} alt={displayName} /> : getInitials(displayName)}
            </div>
            <div className="avatar-edit" onClick={() => alert('Upload photo à implémenter')}>
              <Camera size={16} />
            </div>
          </div>
          <div className="profil-name">{displayName}</div>
          <div className="profil-email">{displayEmail}</div>
          <span className="profil-role">{displayRole}</span>
        </div>

        {/* STATS */}
        <div className="profil-stats">
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
              <BookOpen size={22} />
            </div>
            <div className="stat-box-value">{inscriptions}</div>
            <div className="stat-box-label">Inscriptions</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: COLORS.green + '15', color: COLORS.green }}>
              <Award size={22} />
            </div>
            <div className="stat-box-value">{certificats}</div>
            <div className="stat-box-label">Certificats</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: COLORS.blue + '15', color: COLORS.blue }}>
              <CreditCard size={22} />
            </div>
            <div className="stat-box-value">{PAIEMENTS_COUNT}</div>
            <div className="stat-box-label">Paiements</div>
          </div>
        </div>

        {/* MESSAGE DE SUCCÈS */}
        {saved && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={18} />
            Profil mis à jour avec succès !
          </motion.div>
        )}

        {/* FORMULAIRE */}
        <div className="profil-form">
          <h3 className="form-section-title">
            <User size={20} style={{ color: COLORS.primary }} />
            Informations personnelles
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input 
                className="form-input"
                value={formData.prenom || ''}
                onChange={e => setFormData({...formData, prenom: e.target.value})}
                disabled={!editing}
                placeholder="Votre prénom"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input 
                className="form-input"
                value={formData.nom || ''}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                disabled={!editing}
                placeholder="Votre nom"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                className="form-input"
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!editing}
                placeholder="votre@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input 
                className="form-input"
                value={formData.telephone || ''}
                onChange={e => setFormData({...formData, telephone: e.target.value})}
                disabled={!editing}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Entreprise</label>
              <input 
                className="form-input"
                value={formData.entreprise || ''}
                onChange={e => setFormData({...formData, entreprise: e.target.value})}
                disabled={!editing}
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville</label>
              <input 
                className="form-input"
                value={formData.ville || ''}
                onChange={e => setFormData({...formData, ville: e.target.value})}
                disabled={!editing}
                placeholder="Votre ville"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Adresse</label>
              <input 
                className="form-input full-width"
                value={formData.adresse || ''}
                onChange={e => setFormData({...formData, adresse: e.target.value})}
                disabled={!editing}
                placeholder="Votre adresse complète"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio</label>
              <textarea 
                className="form-input full-width"
                rows={3}
                value={formData.bio || ''}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                disabled={!editing}
                placeholder="Une courte description de vous..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="form-actions">
            {!editing ? (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                <Edit3 size={18} /> Modifier
              </button>
            ) : (
              <>
                <button className="btn-cancel" onClick={() => setEditing(false)}>
                  Annuler
                </button>
                <button className="btn-save" onClick={handleSave}>
                  <Save size={18} /> Enregistrer
                </button>
              </>
            )}
          </div>
        </div>

        {/* INFORMATIONS COMPLÉMENTAIRES */}
        <div className="info-section">
          <h3 className="form-section-title">
            <Shield size={20} style={{ color: COLORS.primary }} />
            Sécurité du compte
          </h3>
          <div className="info-row">
            <div className="info-icon"><Lock size={18} /></div>
            <div className="info-content">
              <div className="info-label">Mot de passe</div>
              <div className="info-value">Dernière modification il y a 30 jours</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-icon"><Bell size={18} /></div>
            <div className="info-content">
              <div className="info-label">Notifications</div>
              <div className="info-value">Email et push activés</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-icon"><Calendar size={18} /></div>
            <div className="info-content">
              <div className="info-label">Membre depuis</div>
              <div className="info-value">Juin 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Variable pour le compteur de paiements (à remplacer par vraies données)
const PAIEMENTS_COUNT = 3;