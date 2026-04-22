import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
  // Réveille le serveur dès que la page login s'ouvre
  api.get('/health')
}, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('RESPONSE =', res);
      console.log('DATA =', res.data);

      localStorage.setItem('token', res.data.token);

      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      console.log('TOKEN STORED =', localStorage.getItem('token'));
      console.log('USER STORED =', localStorage.getItem('user'));

      navigate('/dashboard');
    } catch (err) {
      console.log('ERROR LOGIN =', err);
      console.log('ERROR RESPONSE =', err?.response?.data);
      console.log('LOGIN ERROR MESSAGE =', err?.message);

      setError(
        err?.response?.data?.message || 'Erreur de connexion'
      );
    }
     finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: 'Inter, sans-serif',
        background: '#f8f9ff',
      }}
    >
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>📢</div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            margin: '0 0 16px',
            textAlign: 'center',
          }}
        >
          MarketingCloudOps
        </h1>
        <p
          style={{
            fontSize: 16,
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          Plateforme cloud de gestion des campagnes marketing multicanal
        </p>

        <div
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {[
            'Gestion multi-client',
            'Campagnes email & SMS',
            'Reporting en temps réel',
            'CI/CD automatisé',
          ].map((f) => (
            <div
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 8px',
            }}
          >
            Connexion
          </h2>

          <p style={{ color: '#6b7280', marginBottom: 32 }}>
            Connectez-vous à votre espace
          </p>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '12px 16px',
                color: '#dc2626',
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                Email
              </label>

              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                Mot de passe
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#a5b4fc' : '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? '⏳ Démarrage du serveur...' : 'Se connecter'}
            </button>
          </form>

          <p
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 13,
              color: '#9ca3af',
            }}
          >
            MarketingCloudOps © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;