import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const tenant = localStorage.getItem('digipip_tenant');
      const tenantId = tenant ? JSON.parse(tenant).id : 'cmqlsn2yu0000ybn5t0unlx8u';

      const res = await api.post('/api/auth/login', { email, password, tenantId });

      localStorage.setItem('token',     res.data.token);
      localStorage.setItem('user',      JSON.stringify(res.data.user));
      localStorage.setItem('userName',  res.data.user?.name  || '');
      localStorage.setItem('userEmail', res.data.user?.email || '');
      localStorage.setItem('userRole',  res.data.user?.role  || '');

      if (res.data.user?.tenantId) {
        localStorage.setItem('digipip_tenant', JSON.stringify({
          id: res.data.user.tenantId,
          name: 'DigiLab Solutions',
          slug: 'digilab-solutions'
        }));
      }

      const role = res.data.user?.role;
      if (role === 'ADMIN' || role === 'RESPONSABLE_MARKETING') {
        navigate('/dashboard');
      } else {
        navigate('/campagnes');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
    }
    setLoading(false);
  };

  // ─── PALETTE LIGHT (identique au Register) ───
  const C = {
    bg:       '#f5f3ef',
    card:     '#ffffff',
    border:   '#e5dfd6',
    text:     '#1a1612',
    muted:    '#7a7067',
    subtle:   '#a39a90',
    accent:   '#f5a623',
    accentDk: '#c47d0e',
    inputBg:  '#faf9f7',
    errBg:    '#fff5f5',
    errBorder:'#fca5a5',
    errText:  '#dc2626',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        .login-card { animation: fadeUp .4s ease both; }
        .login-input { outline: none; }
        .login-input::placeholder { color: #c2bbb3 !important; }
        .login-input:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12) !important; }
        .login-btn { transition: all .2s !important; }
        .login-btn:hover:not(:disabled) { background: linear-gradient(135deg,#e8980f,#b86e09) !important; box-shadow: 0 6px 20px rgba(245,166,35,0.35) !important; transform: translateY(-1px); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: .6; cursor: not-allowed; }
        .back-link { color: #a39a90; text-decoration: none; font-size: 13px; transition: color .2s; }
        .back-link:hover { color: #f5a623; }
        .eye-btn { background: none; border: none; cursor: pointer; color: #a39a90; padding: 0; line-height: 1; transition: color .2s; }
        .eye-btn:hover { color: #f5a623; }
      `}</style>

      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>

        {/* ── LOGO ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #f5a623, #c47d0e)',
              borderRadius: '50% 40% 65% 45%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
              position: 'relative', flexShrink: 0,
            }}>
              ☁️
              <div style={{
                position: 'absolute', top: 7, left: 9,
                width: 11, height: 11,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%', filter: 'blur(2px)',
              }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
                Digi<span style={{ color: C.accent }}>Pip</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
                by DigiLab Solutions
              </div>
            </div>
          </div>
          <p style={{ color: C.subtle, fontSize: 13, margin: 0 }}>
            Connectez-vous à votre espace
          </p>
        </div>

        {/* ── CARD ── */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(26,22,18,0.09), 0 2px 8px rgba(26,22,18,0.05)',
        }}>

          {/* Erreur */}
          {error && (
            <div style={{
              background: C.errBg,
              border: `1px solid ${C.errBorder}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 22,
              color: C.errText, fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: C.muted, marginBottom: 7,
                letterSpacing: '0.07em', textTransform: 'uppercase',
              }}>
                Email
              </label>
              <input
                className="login-input"
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="vous@exemple.com"
                style={{
                  width: '100%', padding: '12px 16px',
                  background: C.inputBg,
                  border: `1.5px solid ${focused === 'email' ? C.accent : C.border}`,
                  borderRadius: 10, fontSize: 14,
                  color: C.text, fontFamily: 'inherit',
                  transition: 'border-color .2s, box-shadow .2s',
                  caretColor: C.accent,
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: C.muted, marginBottom: 7,
                letterSpacing: '0.07em', textTransform: 'uppercase',
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="login-input"
                  type={showPass ? 'text' : 'password'} required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    background: C.inputBg,
                    border: `1.5px solid ${focused === 'password' ? C.accent : C.border}`,
                    borderRadius: 10, fontSize: 14,
                    color: C.text, fontFamily: 'inherit',
                    transition: 'border-color .2s, box-shadow .2s',
                    caretColor: C.accent,
                  }}
                />
                <button type="button" className="eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-btn"
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #f5a623, #c47d0e)',
                color: '#fff',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 4,
                boxShadow: '0 4px 14px rgba(245,166,35,0.30)',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Connexion...
                </>
              ) : 'Se connecter →'}
            </button>
          </form>

          {/* Lien register */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.muted }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: C.accent, textDecoration: 'none', fontWeight: 700 }}>
              S'inscrire
            </Link>
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          textAlign: 'center', marginTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <a href="/" className="back-link">← Retour à l'accueil</a>
          <span style={{ color: C.border }}>·</span>
          <span style={{ color: C.subtle, fontSize: 12 }}>DigiPip © 2026</span>
        </div>

      </div>
    </div>
  );
}