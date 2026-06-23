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
  const [step, setStep] = useState(1);

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
          tenantId,
          role: 'CLIENT'
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userName', res.data.user?.name || '');
      localStorage.setItem('userRole', res.data.user?.role || '');

      setStep(2);
      setTimeout(() => navigate('/campagnes'), 3000);
    } catch (err) {
      setErrors({ general: err.response?.data?.error || "Erreur lors de l'inscription. Veuillez réessayer." });
    }
    setLoading(false);
  };

  // ─── PALETTE LIGHT ───
  // bg:       #f7f5f2  (blanc cassé chaud)
  // card:     #ffffff
  // border:   #e8e2d9
  // text:     #1a1612  (brun très foncé)
  // muted:    #7a7067
  // accent:   #f5a623  (or DigiPip)
  // accentDk: #c47d0e

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

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    background: C.inputBg,
    border: `1.5px solid ${
      errors[field] ? C.errBorder :
      focused === field ? C.accent :
      C.border
    }`,
    borderRadius: 10,
    fontSize: 14,
    color: C.text,
    fontFamily: 'inherit',
    transition: 'border-color .2s, box-shadow .2s',
    caretColor: C.accent,
    outline: 'none',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    marginBottom: 7,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  };

  // ─── ÉTAPE 2 : SUCCÈS ───
  if (step === 2) {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '24px',
      }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
          @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
          @keyframes shrink { from { width:100%; } to { width:0%; } }
          .sc { animation: fadeUp .5s ease both; }
          .si { animation: pulse 2s ease infinite; }
        `}</style>
        <div className="sc" style={{ width:'100%', maxWidth:420, textAlign:'center' }}>
          {/* Logo */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{
              width:44, height:44,
              background:'linear-gradient(135deg, #f5a623, #c47d0e)',
              borderRadius:'50% 40% 65% 45%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22,
              boxShadow:'0 4px 16px rgba(245,166,35,0.35)',
              position:'relative',
            }}>
              ☁️
              <div style={{ position:'absolute', top:7, left:9, width:11, height:11, background:'rgba(255,255,255,0.6)', borderRadius:'50%', filter:'blur(2px)' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:24, fontWeight:800, color:C.text, letterSpacing:'-0.02em' }}>
                Digi<span style={{ color:C.accent }}>Pip</span>
              </div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:'0.08em', textTransform:'uppercase', marginTop:2 }}>
                by DigiLab Solutions
              </div>
            </div>
          </div>

          <div style={{
            background:C.card,
            border:`1px solid ${C.border}`,
            borderRadius:18,
            padding:'48px 36px',
            boxShadow:'0 12px 40px rgba(26,22,18,0.10)',
          }}>
            <div className="si" style={{
              width:80, height:80, borderRadius:'50%',
              background:'rgba(34,197,94,0.08)',
              border:'2px solid rgba(34,197,94,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 24px', fontSize:40,
            }}>🎉</div>

            <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:'0 0 10px' }}>
              Bienvenue, {formData.name} !
            </h2>
            <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, margin:'0 0 24px' }}>
              Votre compte a été créé avec succès.<br/>
              Vous êtes maintenant inscrit dans la liste des clients DigiLab.
            </p>

            <div style={{
              background:'rgba(245,166,35,0.07)',
              border:`1px solid rgba(245,166,35,0.25)`,
              borderRadius:10, padding:'14px 16px', marginBottom:24,
            }}>
              <p style={{ margin:0, color:C.accentDk, fontWeight:600, fontSize:14 }}>
                ✨ Redirection vers votre espace client...
              </p>
            </div>

            <div style={{ width:'100%', height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:'100%',
                background:`linear-gradient(90deg, ${C.accent}, ${C.accentDk})`,
                borderRadius:2, animation:'shrink 3s linear forwards',
              }} />
            </div>
          </div>

          <div style={{ marginTop:24 }}>
            <span style={{ color:C.subtle, fontSize:12 }}>DigiPip © 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── ÉTAPE 1 : FORMULAIRE ───
  return (
    <div style={{
      minHeight:'100vh',
      background:C.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Inter', sans-serif",
      padding:'24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        .reg-card { animation: fadeUp .4s ease both; }
        .reg-input::placeholder { color: #c2bbb3 !important; }
        .reg-input:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12) !important; }
        .reg-btn { transition: all .2s !important; }
        .reg-btn:hover:not(:disabled) { background: linear-gradient(135deg,#e8980f,#b86e09) !important; box-shadow: 0 6px 20px rgba(245,166,35,0.35) !important; transform: translateY(-1px); }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity:.6; cursor:not-allowed; }
        .back-link { color:#a39a90; text-decoration:none; font-size:13px; transition:color .2s; }
        .back-link:hover { color:#f5a623; }
        .type-btn { cursor:pointer; transition:all .2s; font-family:inherit; }
        .type-btn:hover { border-color: #f5a623 !important; background: rgba(245,166,35,0.06) !important; }
        .type-btn.sel { background: rgba(245,166,35,0.10) !important; border-color: #f5a623 !important; color: #c47d0e !important; }
        .eye-btn { background:none; border:none; cursor:pointer; color:#a39a90; padding:0; line-height:1; transition:color .2s; }
        .eye-btn:hover { color:#f5a623; }
      `}</style>

      <div className="reg-card" style={{ width:'100%', maxWidth:460 }}>

        {/* ── LOGO ── */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div style={{
              width:44, height:44,
              background:'linear-gradient(135deg, #f5a623, #c47d0e)',
              borderRadius:'50% 40% 65% 45%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22,
              boxShadow:'0 4px 16px rgba(245,166,35,0.35)',
              position:'relative',
            }}>
              ☁️
              <div style={{ position:'absolute', top:7, left:9, width:11, height:11, background:'rgba(255,255,255,0.6)', borderRadius:'50%', filter:'blur(2px)' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:'-0.02em', lineHeight:1 }}>
                Digi<span style={{ color:C.accent }}>Pip</span>
              </div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:'0.08em', textTransform:'uppercase', marginTop:3 }}>
                by DigiLab Solutions
              </div>
            </div>
          </div>
          <p style={{ color:C.subtle, fontSize:13, margin:0 }}>
            Créez votre compte et rejoignez DigiLab
          </p>
        </div>

        {/* ── CARD ── */}
        <div style={{
          background:C.card,
          border:`1px solid ${C.border}`,
          borderRadius:18,
          padding:'36px 32px',
          boxShadow:'0 8px 32px rgba(26,22,18,0.09), 0 2px 8px rgba(26,22,18,0.05)',
        }}>

          {/* Erreur générale */}
          {errors.general && (
            <div style={{
              background:C.errBg,
              border:`1px solid ${C.errBorder}`,
              borderRadius:10, padding:'12px 16px', marginBottom:22,
              color:C.errText, fontSize:13, fontWeight:500,
              display:'flex', alignItems:'center', gap:8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Nom */}
            <div>
              <label style={labelStyle}>Nom complet *</label>
              <input className="reg-input" type="text" required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="Nom et Prénom"
                style={inputStyle('name')}
              />
              {errors.name && <div style={{ fontSize:12, color:C.errText, marginTop:5, display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.name}</div>}
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email *</label>
              <input className="reg-input" type="email" required
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="vous@exemple.com"
                style={inputStyle('email')}
              />
              {errors.email && <div style={{ fontSize:12, color:C.errText, marginTop:5, display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.email}</div>}
            </div>

            {/* Téléphone */}
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input className="reg-input" type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                placeholder="+216 XX XXX XXX"
                style={inputStyle('phone')}
              />
            </div>

            {/* Type de compte */}
            <div>
              <label style={labelStyle}>Type de compte</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { id:'particulier', label:'Particulier', icon:'👤' },
                  { id:'entreprise',  label:'Entreprise',  icon:'🏢' },
                  { id:'agence',      label:'Agence',      icon:'🏛️' },
                  { id:'etablissement',label:'Établissement',icon:'🎓' },
                ].map(t => (
                  <button key={t.id} type="button"
                    onClick={() => handleChange('type', t.id)}
                    className={`type-btn${formData.type === t.id ? ' sel' : ''}`}
                    style={{
                      padding:'11px 8px',
                      borderRadius:10,
                      border:`1.5px solid ${formData.type === t.id ? C.accent : C.border}`,
                      background: formData.type === t.id ? 'rgba(245,166,35,0.10)' : C.inputBg,
                      color: formData.type === t.id ? C.accentDk : C.muted,
                      fontSize:13, fontWeight:600,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    }}
                  >
                    <span style={{ fontSize:15 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Secteur */}
            <div>
              <label style={labelStyle}>Secteur d'activité</label>
              <input className="reg-input" type="text"
                value={formData.sector}
                onChange={e => handleChange('sector', e.target.value)}
                onFocus={() => setFocused('sector')} onBlur={() => setFocused(null)}
                placeholder="Ex: Marketing Digital, Télécommunications..."
                style={inputStyle('sector')}
              />
            </div>

            {/* Divider */}
            <div style={{ height:1, background:C.border, margin:'2px 0' }} />

            {/* Mot de passe */}
            <div>
              <label style={labelStyle}>Mot de passe *</label>
              <div style={{ position:'relative' }}>
                <input className="reg-input" type={showPass ? 'text' : 'password'} required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Minimum 6 caractères"
                  style={{ ...inputStyle('password'), paddingRight:44 }}
                />
                <button type="button" className="eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)' }}
                >
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <div style={{ fontSize:12, color:C.errText, marginTop:5, display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.password}</div>}
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label style={labelStyle}>Confirmer le mot de passe *</label>
              <div style={{ position:'relative' }}>
                <input className="reg-input" type={showConfirmPass ? 'text' : 'password'} required
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused(null)}
                  placeholder="Répétez votre mot de passe"
                  style={{ ...inputStyle('confirmPassword'), paddingRight:44 }}
                />
                <button type="button" className="eye-btn"
                  onClick={() => setShowConfirmPass(p => !p)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)' }}
                >
                  {showConfirmPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.confirmPassword && <div style={{ fontSize:12, color:C.errText, marginTop:5, display:'flex', alignItems:'center', gap:4 }}>⚠ {errors.confirmPassword}</div>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="reg-btn"
              style={{
                width:'100%', padding:'14px',
                background:'linear-gradient(135deg, #f5a623, #c47d0e)',
                color:'#fff',
                border:'none', borderRadius:10,
                fontSize:14, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                marginTop:6,
                boxShadow:'0 4px 14px rgba(245,166,35,0.30)',
                letterSpacing:'0.01em',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                  Création du compte...
                </>
              ) : '✨ Créer mon compte'}
            </button>
          </form>

          {/* Lien connexion */}
          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:C.muted }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:C.accent, textDecoration:'none', fontWeight:700 }}>
              Se connecter
            </Link>
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ textAlign:'center', marginTop:24, display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
          <a href="/" className="back-link">← Retour à l'accueil</a>
          <span style={{ color:C.border }}>·</span>
          <span style={{ color:C.subtle, fontSize:12 }}>DigiPip © 2026</span>
        </div>
      </div>
    </div>
  );
}