import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock, ArrowRight } from 'lucide-react';
import { setRedirectAfterLogin } from '../utils/redirectUtils';

const THEME = {
  gold: '#d4a574',
  goldDark: '#b8956a',
  goldLight: '#f5efe6',
  text: '#1e293b',
  textLight: '#64748b',
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  dark: '#1a1a2e',
};

export default function LoginRequiredModal({ isOpen, onClose, campagneTitle, redirectUrl }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle click outside
  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Add event listener for clicks outside
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent body scroll when modal is open
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
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleRegister = () => {
    if (redirectUrl) {
      setRedirectAfterLogin(redirectUrl);
    }
    onClose();
    navigate('/register');
  };

  const handleLogin = () => {
    if (redirectUrl) {
      setRedirectAfterLogin(redirectUrl);
    }
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  // Render using portal to avoid parent re-renders affecting the modal
  return createPortal(
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: THEME.card,
          borderRadius: 24,
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${THEME.dark}, #2d2d44)`,
          padding: '40px 32px 32px',
          textAlign: 'center',
          position: 'relative',
        }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 8px 30px ${THEME.gold}40`,
          }}>
            <Lock size={36} color="#fff" />
          </div>

          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 8,
          }}>
            Accès réservé aux membres
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
          }}>
            {campagneTitle ? `Pour vous inscrire à "${campagneTitle}"` : 'Pour accéder à cette formation'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          {/* Steps */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 28,
          }}>
            {[
              { num: '1', label: 'Inscription', active: true },
              { num: '2', label: 'Connexion', active: false },
              { num: '3', label: 'Accès', active: false },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: step.active ? THEME.gold : '#f1f5f9',
                    color: step.active ? '#fff' : THEME.textLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}>
                    {step.num}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: step.active ? THEME.gold : THEME.textLight,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && (
                  <ArrowRight size={16} style={{ color: THEME.border, marginTop: -14 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{
            background: THEME.goldLight,
            border: `1px solid ${THEME.gold}30`,
            borderRadius: 16,
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: THEME.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <LogIn size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: THEME.text,
                marginBottom: 4,
              }}>
                Créez votre compte maintenant
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: THEME.textLight,
                lineHeight: 1.6,
              }}>
                Inscrivez-vous pour accéder à toutes nos formations et suivre votre progression.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: '28px',
          }}>
            {[
              { icon: '✓', text: 'Inscription aux formations en ligne' },
              { icon: '✓', text: 'Suivi de vos cours et progression' },
              { icon: '✓', text: 'Téléchargement des certificats' },
              { icon: '✓', text: 'Accès à l\'espace client DigiPip' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#059669',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  color: THEME.textLight,
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
            gap: 12,
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegister();
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: THEME.gold,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.goldDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = THEME.gold; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <UserPlus size={20} />
              Créer un compte gratuit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogin();
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'transparent',
                color: THEME.text,
                border: `2px solid ${THEME.border}`,
                borderRadius: 12,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.gold; e.currentTarget.style.color = THEME.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.color = THEME.text; }}
            >
              <LogIn size={20} />
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
              padding: '12px',
              background: 'none',
              border: 'none',
              color: THEME.textLight,
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = THEME.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = THEME.textLight; }}
          >
            Continuer sans s'inscrire
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}