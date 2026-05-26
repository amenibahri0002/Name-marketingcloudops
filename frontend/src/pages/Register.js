import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [focused,  setFocused]  = useState(null);

  const API = process.env.REACT_APP_API_URL || 'https://marketingcloudops-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, { name, email, password });

      // Stocker le token et les infos utilisateur (même logique que Login)
      localStorage.setItem('token',     res.data.token);
      localStorage.setItem('user',      JSON.stringify(res.data.user));
      localStorage.setItem('userName',  res.data.user?.name  || '');
      localStorage.setItem('userEmail', res.data.user?.email || '');

      // Rediriger vers la campagne si l'utilisateur venait d'en cliquer une
      const redirect = sessionStorage.getItem('redirect_after_login');
      if (redirect) {
        sessionStorage.removeItem('redirect_after_login');
        navigate(redirect);
      } else {
        navigate('/campagnes');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    }
    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '13px 44px 13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${focused === field ? '#f5a623' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'inherit',
    transition: 'border-color .2s, box-shadow .2s',
    outline: 'none',
    boxSizing: 'border-box',
  });

  const EyeIcon = ({ open }) => open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

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
        .toggle-eye { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); padding:0; line-height:1; transition:color .2s; }
        .toggle-eye:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="register-card" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, background: '#f5a623', borderRadius: 6 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'rgba(245,166,35,0.35)', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Digi<span style={{ color: '#f5a623' }}>Pip</span>
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>
            Créez votre compte gratuitement
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#1a1612', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '36px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#ef4444', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Nom */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>Nom complet</label>
              <input
                className="register-input"
                type="text" required
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="Jean Dupont"
                style={{ ...inputStyle('name'), padding: '13px 16px' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>Email</label>
              <input
                className="register-input"
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="vous@exemple.com"
                style={{ ...inputStyle('email'), padding: '13px 16px' }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="register-input"
                  type={showPass ? 'text' : 'password'} required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={inputStyle('password')}
                />
                <button type="button" className="toggle-eye" onClick={() => setShowPass(p => !p)}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>Confirmer le mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="register-input"
                  type={showConf ? 'text' : 'password'} required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle('confirm'),
                    borderColor: confirm && confirm !== password
                      ? '#ef4444'
                      : focused === 'confirm' ? '#f5a623' : 'rgba(255,255,255,0.10)',
                  }}
                />
                <button type="button" className="toggle-eye" onClick={() => setShowConf(p => !p)}>
                  <EyeIcon open={showConf} />
                </button>
              </div>
              {confirm && confirm !== password && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>⚠ Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="register-btn"
              style={{ width: '100%', padding: '14px', background: '#f5a623', color: '#0f0e0c', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTop: '2px solid #0f0e0c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Création du compte...
                </>
              ) : 'Créer mon compte'}
            </button>
          </form>

          {/* Lien vers login */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#f5a623', textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <a href="/" className="back-link">← Retour à l'accueil</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>DigiPip © 2026</span>
        </div>
      </div>
    </div>
  );
}