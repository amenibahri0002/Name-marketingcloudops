import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    type: 'particulier',
    sector: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [step, setStep] = useState(1); // 1 = formulaire, 2 = succès

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', general: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Nom requis';
    if (!formData.email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email invalide';
    if (!formData.password) e.password = 'Mot de passe requis';
    else if (formData.password.length < 6) e.password = 'Minimum 6 caractères';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {

const tenant = localStorage.getItem('digipip_tenant');
    const tenantId = tenant ? JSON.parse(tenant).id : 'cmqlsn2yu0000ybn5t0unlx8u';

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          type: formData.type,
          sector: formData.sector,
          tenantId: tenantId,  // ← AJOUTÉ
          role: 'CLIENT'
        }
      );

      // Stocker les données
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userName', res.data.user?.name || '');
      localStorage.setItem('userRole', res.data.user?.role || '');

      setStep(2); // Afficher succès

      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/campagnes');
      }, 3000);

    } catch (err) {
      console.error('Erreur inscription:', err);
      setErrors({
        general: err.response?.data?.error || 'Erreur lors de l\'inscription. Veuillez réessayer.'
      });
    }
    setLoading(false);
  };

  // ─── ÉTAPE 2 : SUCCÈS ───
  if (step === 2) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0e0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'DM Sans', sans-serif",
        padding: '24px',
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
          @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          .success-card { animation: fadeIn 0.5s ease both; }
          .success-icon { animation: pulse 2s ease infinite; }
        `}</style>

        <div className="success-card" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, #f5a623, #d97706)',
              borderRadius: '50% 40% 65% 45%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white',
              boxShadow: '0 4px 15px rgba(245,166,35,0.4)',
              position: 'relative',
            }}>
              ☁️
              <div style={{
                position: 'absolute', top: 6, left: 8,
                width: 12, height: 12,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%', filter: 'blur(2px)',
              }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Digi<span style={{ color: '#f5a623' }}>Pip</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
                by DigiLab Solutions
              </div>
            </div>
          </div>

          {/* Card succès */}
          <div style={{
            background: '#1a1612',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            padding: '48px 36px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}>
            <div className="success-icon" style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
              border: '2px solid rgba(34,197,94,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 40,
            }}>🎉</div>

            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 12px',
            }}>
              Bienvenue, {formData.name} !
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}>
              Votre compte a été créé avec succès.<br/>
              Vous êtes maintenant inscrit dans la liste des clients DigiLab.
            </p>

            <div style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 24,
            }}>
              <p style={{
                margin: 0,
                color: '#f5a623',
                fontWeight: 600,
                fontSize: 14,
              }}>
                ✨ Redirection vers votre espace client...
              </p>
            </div>

            <div style={{
              width: '100%',
              height: 4,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: '100%',
                background: 'linear-gradient(90deg, #f5a623, #d97706)',
                borderRadius: 2,
                animation: 'shrink 3s linear forwards',
              }} />
            </div>
            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>DigiPip © 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── ÉTAPE 1 : FORMULAIRE ───
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .register-card { animation: fadeIn 0.4s ease both; }
        .register-input::placeholder { color: rgba(255,255,255,0.2); }
        .register-input:focus { outline: none; border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.10) !important; }
        .register-btn:hover:not(:disabled) { background: #d4881a !important; }
        .register-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .back-link { color: rgba(255,255,255,0.3); text-decoration: none; font-size: 13px; transition: color .2s; }
        .back-link:hover { color: #f5a623; }
        .type-btn:hover { border-color: #f5a623 !important; }
        .type-btn.selected { background: rgba(245,166,35,0.15) !important; border-color: #f5a623 !important; color: #f5a623 !important; }
      `}</style>

      <div className="register-card" style={{ width: '100%', maxWidth: 460 }}>

        {/* ── HEADER LOGO ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, #f5a623, #d97706)',
              borderRadius: '50% 40% 65% 45%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white',
              boxShadow: '0 4px 15px rgba(245,166,35,0.4)',
              position: 'relative',
            }}>
              ☁️
              <div style={{
                position: 'absolute', top: 6, left: 8,
                width: 12, height: 12,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%', filter: 'blur(2px)',
              }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Digi<span style={{ color: '#f5a623' }}>Pip</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
                by DigiLab Solutions
              </div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>
            Créez votre compte et rejoignez DigiLab
          </p>
        </div>

        {/* ── CARD ── */}
        <div style={{
          background: '#1a1612',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}>

          {errors.general && (
            <div style={{ 
              background: 'rgba(239,68,68,0.08)', 
              border: '1px solid rgba(239,68,68,0.2)', 
              borderRadius: 10, 
              padding: '12px 16px', 
              marginBottom: 24, 
              color: '#ef4444', 
              fontSize: 13, 
              fontWeight: 500, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Nom */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Nom complet *
              </label>
              <input
                className="register-input"
                type="text" required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="Ex: Ahmed Ben Salah"
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${errors.name ? '#ef4444' : focused === 'name' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 10, fontSize: 14,
                  color: '#fff', fontFamily: 'inherit',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
              {errors.name && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.name}</div>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Email *
              </label>
              <input
                className="register-input"
                type="email" required
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="vous@exemple.com"
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${errors.email ? '#ef4444' : focused === 'email' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 10, fontSize: 14,
                  color: '#fff', fontFamily: 'inherit',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
              {errors.email && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.email}</div>}
            </div>

            {/* Téléphone */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Téléphone
              </label>
              <input
                className="register-input"
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                placeholder="+216 XX XXX XXX"
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${focused === 'phone' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 10, fontSize: 14,
                  color: '#fff', fontFamily: 'inherit',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
            </div>

            {/* Type de compte */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Type de compte
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'particulier', label: 'Particulier', icon: '👤' },
                  { id: 'entreprise', label: 'Entreprise', icon: '🏢' },
                  { id: 'agence', label: 'Agence', icon: '🏛️' },
                  { id: 'etablissement', label: 'Établissement', icon: '🎓' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('type', type.id)}
                    className={`type-btn ${formData.type === type.id ? 'selected' : ''}`}
                    style={{
                      padding: '12px',
                      borderRadius: 10,
                      border: `1.5px solid ${formData.type === type.id ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                      background: formData.type === type.id ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.03)',
                      color: formData.type === type.id ? '#f5a623' : 'rgba(255,255,255,0.4)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all .2s',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Secteur */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Secteur d'activité
              </label>
              <input
                className="register-input"
                type="text"
                value={formData.sector}
                onChange={e => handleChange('sector', e.target.value)}
                onFocus={() => setFocused('sector')}
                onBlur={() => setFocused(null)}
                placeholder="Ex: Marketing Digital, Télécommunications..."
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${focused === 'sector' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 10, fontSize: 14,
                  color: '#fff', fontFamily: 'inherit',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="register-input"
                  type={showPass ? 'text' : 'password'} required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Minimum 6 caractères"
                  style={{
                    width: '100%', padding: '13px 44px 13px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${errors.password ? '#ef4444' : focused === 'password' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                    borderRadius: 10, fontSize: 14,
                    color: '#fff', fontFamily: 'inherit',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, lineHeight: 1, transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {showPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.password && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.password}</div>}
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Confirmer le mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="register-input"
                  type={showConfirmPass ? 'text' : 'password'} required
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  onFocus={() => setFocused('confirmPassword')}
                  onBlur={() => setFocused(null)}
                  placeholder="Répétez votre mot de passe"
                  style={{
                    width: '100%', padding: '13px 44px 13px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${errors.confirmPassword ? '#ef4444' : focused === 'confirmPassword' ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
                    borderRadius: 10, fontSize: 14,
                    color: '#fff', fontFamily: 'inherit',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
                <button type="button" onClick={() => setShowConfirmPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, lineHeight: 1, transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {showConfirmPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.confirmPassword}</div>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="register-btn"
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: '#f5a623', 
                color: '#0f0e0c', 
                border: 'none', 
                borderRadius: 10, 
                fontSize: 14, 
                fontWeight: 700, 
                cursor: 'pointer', 
                fontFamily: 'inherit', 
                transition: 'background .2s', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10, 
                marginTop: 6 
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTop: '2px solid #0f0e0c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Création du compte...
                </>
              ) : '✨ Créer mon compte'}
            </button>
          </form>

          {/* Lien connexion */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#f5a623', textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <a href="/" className="back-link">← Retour à l'accueil</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>DigiPip © 2026</span>
        </div>

      </div>
    </div>
  );
}
