import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { setRedirectAfterLogin } from '../utils/redirectUtils';

const THEME = {
  gold: '#d4a574',
  goldDark: '#b8956a',
  goldLight: 'rgba(212, 165, 116, 0.15)',
  text: '#1e293b',
  textLight: '#64748b',
  bg: '#f8fafc',
  card: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(226, 232, 240, 0.6)',
  dark: '#1a1a2e',
};

export default function LoginRequiredModal({ isOpen, onClose, campagneTitle, redirectUrl }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Handle click outside
  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClickOutside]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleRegister = () => {
    if (redirectUrl) setRedirectAfterLogin(redirectUrl);
    onClose();
    navigate('/register', { state: { frominscription: true, redirectUrl } });
  };

  const handleLogin = () => {
    if (redirectUrl) setRedirectAfterLogin(redirectUrl);
    onClose();
    navigate('/login', { state: { redirectUrl } });
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(4px) saturate(180%)',
        WebkitBackdropFilter: 'blur(4px) saturate(180%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.2); }
          50% { box-shadow: 0 0 40px rgba(212, 165, 116, 0.4); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: 24,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          overflow: 'hidden',
          animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* Close button - floating */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; 
            e.currentTarget.style.color = '#1e293b';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; 
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <X size={16} />
        </button>

        {/* Header - Compact */}
        <div style={{
          padding: '32px 32px 20px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Floating icon */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4a574, #c9956a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 20px rgba(212, 165, 116, 0.35)',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <Sparkles size={28} color="#fff" />
          </div>

          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: 6,
            letterSpacing: '-0.02em',
          }}>
            Accès réservé
          </h2>

          <p style={{
            fontSize: '0.9rem',
            color: '#64748b',
            lineHeight: 1.5,
            maxWidth: 320,
            margin: '0 auto',
          }}>
            {campagneTitle ? `Inscrivez-vous pour accéder à "${campagneTitle}"` : 'Connectez-vous pour accéder à cette formation'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '0 32px 32px' }}>
          {/* Steps - Horizontal compact */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            {[1, 2, 3].map((num, i) => (
              <React.Fragment key={i}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: i === 0 ? 'linear-gradient(135deg, #d4a574, #c9956a)' : '#f1f5f9',
                    color: i === 0 ? '#fff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: i === 0 ? '0 2px 8px rgba(212, 165, 116, 0.3)' : 'none',
                  }}>
                    {num}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: i === 0 ? '#d4a574' : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {['inscription', 'Connexion', 'Accès'][i]}
                  </span>
                </div>
                {i < 2 && (
                  <ArrowRight size={14} style={{ color: '#e2e8f0' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Benefits - Compact grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginBottom: 24,
          }}>
            {[
              { icon: '🎓', text: 'Formations en ligne' },
              { icon: '📊', text: 'Suivi progression' },
              { icon: '🏆', text: 'Certificats' },
              { icon: '💼', text: 'Espace client' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'rgba(212, 165, 116, 0.08)',
                borderRadius: 10,
                border: '1px solid rgba(212, 165, 116, 0.15)',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegister();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #d4a574, #c9956a)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(212, 165, 116, 0.3)',
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'translateY(-2px)'; 
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 165, 116, 0.4)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 165, 116, 0.3)';
              }}
            >
              <UserPlus size={18} />
              Créer un compte 
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogin();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#475569',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = '#d4a574'; 
                e.currentTarget.style.color = '#d4a574';
                e.currentTarget.style.background = 'rgba(212, 165, 116, 0.05)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = '#e2e8f0'; 
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogIn size={18} />
              J'ai déjà un compte
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#64748b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          >
            Continuer sans s'inscrire
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
