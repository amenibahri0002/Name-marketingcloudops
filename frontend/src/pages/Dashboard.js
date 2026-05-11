import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const G = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  dark:     '#0d0b08',
  dark2:    '#111',
  dark3:    '#1a1a1a',
  font:     "'Syne','Montserrat',sans-serif",
};

const TYPE = {
  email: { label: 'Email', icon: '✉', color: '#60a5fa' },
  sms:   { label: 'SMS',   icon: '💬', color: '#34d399' },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623' },
};

const CAMP_IMGS = {
  email: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
  sms:   'https://images.unsplash.com/photo-1512941937938-a27bc91e2d4f?w=600&q=80',
  push:  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
};

/* ====================== MODAL ====================== */
function Modal({ camp, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const tc = TYPE[camp.type?.toLowerCase()] || TYPE.email;

  const handleInscription = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      await api.post(`/api/campagnes/${camp.id}/inscrire`);
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(13,11,8,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1410, #0f0c08)',
        border: '1px solid rgba(245,166,35,0.35)',
        borderRadius: 24,
        width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        animation: 'modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(245,166,35,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: G.gold, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {tc.icon} {tc.label}
            </div>
            <h2 style={{ fontSize: 22, marginTop: 6, fontWeight: 800, color: '#fff' }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: 26, color: '#777', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, background: 'rgba(245,166,35,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>📈</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600, color: '#fff' }}>Taux d'ouverture</div>
              <div style={{ fontSize: 26, color: G.gold, fontWeight: 800 }}>28–45%</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>🎯</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600, color: '#fff' }}>Audience</div>
              <div style={{ fontSize: 26, color: '#34d399', fontWeight: 800 }}>5 000+</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: G.gold, marginBottom: 10 }}>Description</h4>
            <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
              {camp.description || "Campagne marketing multi-canal avec suivi complet des performances et optimisation en temps réel."}
            </p>
          </div>

          <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
            <h4 style={{ color: G.gold, marginBottom: 12 }}>🚀 Infrastructure DevOps</h4>
            <ul style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, listStyle: 'none', paddingLeft: 0 }}>
              <li>✓ Déploiement automatique (CI/CD)</li>
              <li>✓ Scalabilité cloud (Neon + Vercel)</li>
              <li>✓ Monitoring en temps réel</li>
              <li>✓ Backup automatique</li>
            </ul>
          </div>

          {!done ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', cursor: 'pointer' }}>Fermer</button>
              <button onClick={handleInscription} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 12, background: G.gold, color: '#111', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Inscription...' : "✓ Je m'inscris"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <h3 style={{ color: '#34d399', margin: '16px 0' }}>Inscription réussie !</h3>
              <button onClick={onClose} style={{ padding: '12px 32px', background: G.gold, color: '#111', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Retour</button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes modalPop { from { opacity:0; transform:scale(0.88) translateY(40px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [campagnes, setCampagnes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    api.get('/api/campagnes/public')
      .then(r => setCampagnes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: G.font, background: G.dark, color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(245,166,35,0.4); border-radius:2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .nav-a { color:#ccc; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-a:hover { color:#fff; }
        .pillar-card { transition:all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .pillar-card:hover { transform:translateY(-12px) !important; }
        .camp-card:hover { transform:translateY(-6px) !important; box-shadow:0 24px 60px rgba(0,0,0,0.4) !important; }
        .btn-cta:hover { background:#d4881a !important; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,166,35,0.4) !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 72,
        background: scrolled ? 'rgba(13,11,8,0.98)' : 'rgba(13,11,8,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(245,166,35,0.25)' : 'rgba(245,166,35,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6%', transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: G.gold, borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, background: 'rgba(255,255,255,0.9)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>Digi<span style={{ color: G.gold }}>Pip</span></div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.08em' }}>by DigiLab Solutions</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 36 }}>
          <a className="nav-a" href="#marketing">Marketing</a>
          <a className="nav-a" href="#devops">Cloud & DevOps</a>
          <a className="nav-a" href="#campagnes">Campagnes</a>
        </div>

        <button className="btn-cta" onClick={() => navigate(token ? '/dashboard' : '/login')} style={{
          background: G.gold, color: '#111', padding: '11px 26px',
          borderRadius: 10, fontWeight: 700, border: 'none',
          fontSize: 14, cursor: 'pointer', fontFamily: G.font, transition: 'all 0.2s',
        }}>
          {token ? 'Dashboard →' : 'Se connecter →'}
        </button>
      </nav>

      {/* Hero, 3 Pillars, Marketing, Cloud, Campagnes, Footer restent identiques à ton code */}

      {/* ... (le reste de ton code est conservé) */}

      {selected && <Modal camp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}