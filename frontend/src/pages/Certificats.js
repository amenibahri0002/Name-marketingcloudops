import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Download, CheckCircle, Calendar, Share2, Printer, Loader2 } from 'lucide-react';
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
  danger: '#ef4444',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  dark: '#1a1a2e',
};

export default function Certificats() {
  const navigate = useNavigate();
  const [certificats, setCertificats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;


  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/certificats/mes-certificats');
      setCertificats(res.data || []);
    } catch (err) {
      console.error('Erreur certificats:', err);
      setError('Impossible de charger vos certificats');
    } finally {
      setLoading(false);
    }
  };

  const telechargerCertificat = async (certId) => {
    try {
      const res = await api.get(`/api/certificats/${certId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat_${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    }
  };

  const disponibles = certificats.filter(c => c.status === 'disponible').length;
  const enAttente = certificats.filter(c => c.status === 'en_attente').length;

  const CertificatCard = ({ cert, index }) => {
    const isDisponible = cert.status === 'disponible';
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15, duration: 0.5 }}
        style={{
          background: THEME.card,
          borderRadius: 16,
          border: `1px solid ${THEME.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
          e.currentTarget.style.borderColor = THEME.gold + '40';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = THEME.border;
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 24px 0', borderBottom: `3px solid ${isDisponible ? THEME.success : THEME.gold}`,
          marginBottom: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: isDisponible ? THEME.successLight : THEME.goldLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={28} color={isDisponible ? THEME.success : THEME.gold} />
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            background: isDisponible ? '#d1fae5' : '#f5efe6',
            color: isDisponible ? '#059669' : '#b8956a',
          }}>
            {isDisponible ? <CheckCircle size={14} /> : <Calendar size={14} />}
            {isDisponible ? 'Disponible' : 'En attente'}
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: THEME.text, marginBottom: 8 }}>{cert.formation}</h3>
          <p style={{ fontSize: '0.9rem', color: THEME.textLight, marginBottom: 20 }}>Formateur : {cert.formateur}</p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            marginBottom: 24, padding: 16, background: THEME.bg, borderRadius: 12,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>Numéro</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{cert.numero}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{cert.date}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>Durée</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{cert.duree}</div>
            </div>
          </div>

          {isDisponible && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => telechargerCertificat(cert.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 20px', background: THEME.gold, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.3s',
              }} onMouseEnter={e => e.currentTarget.style.background = THEME.goldDark}
              onMouseLeave={e => e.currentTarget.style.background = THEME.gold}>
                <Download size={16} /> Télécharger PDF
              </button>
              <button onClick={() => alert('Partage du certificat...')} style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 12,
                color: THEME.textLight, cursor: 'pointer', transition: 'all 0.3s',
              }}>
                <Share2 size={16} />
              </button>
              <button onClick={() => alert('Impression du certificat...')} style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 12,
                color: THEME.textLight, cursor: 'pointer', transition: 'all 0.3s',
              }}>
                <Printer size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{"::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d1c7b7; border-radius: 3px; } * { scrollbar-width: thin; scrollbar-color: #d1c7b7 transparent; }"}</style>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 60px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <button onClick={() => navigate('/campagnes')} style={{
              display: 'flex', alignItems: 'center', gap: 8, color: THEME.textLight,
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
              margin: '0 auto 20px', transition: 'color 0.3s',
            }} onMouseEnter={e => e.currentTarget.style.color = THEME.text}
            onMouseLeave={e => e.currentTarget.style.color = THEME.textLight}>
              <ArrowLeft size={18} /> Retour aux formations
            </button>

            <div style={{ marginBottom: 30 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.text, marginBottom: 12, textAlign: 'center' }}>
                Mes <span style={{ color: THEME.gold }}>Certificats</span>
              </h1>
              <p style={{ fontSize: '1.1rem', color: THEME.textLight, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                Téléchargez vos certificats de formation
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20,
            marginBottom: 50, maxWidth: 600, margin: '0 auto 50px',
          }}>
            <div style={{
              background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16,
              padding: 24, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
            }} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#d1fae5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <CheckCircle size={22} color={THEME.success} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: THEME.success, marginBottom: 4 }}>{disponibles}</div>
              <div style={{ fontSize: '0.9rem', color: THEME.textLight }}>Disponibles</div>
            </div>
            <div style={{
              background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16,
              padding: 24, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
            }} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: THEME.blueLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <Calendar size={22} color={THEME.blue} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: THEME.blue, marginBottom: 4 }}>{enAttente}</div>
              <div style={{ fontSize: '0.9rem', color: THEME.textLight }}>En attente</div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 100 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', color: THEME.gold }} />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p style={{ color: THEME.textLight }}>Chargement de vos certificats...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: 60, background: '#fef2f2', borderRadius: 16,
              border: '1px solid #fecaca', color: '#dc2626',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
              <button onClick={fetchCertificats} style={{
                padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: '#fff',
                border: 'none', fontWeight: 600, cursor: 'pointer',
              }}>Réessayer</button>
            </div>
          ) : certificats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>🏆</div>
              <h3 style={{ fontSize: '1.3rem', color: THEME.text, marginBottom: 8 }}>Aucun certificat</h3>
              <p style={{ color: THEME.textLight, marginBottom: 24 }}>Vous n'avez pas encore de certificat disponible.</p>
              <button onClick={() => navigate('/campagnes')} style={{
                padding: '12px 28px', background: THEME.gold, color: '#fff', border: 'none',
                borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                transition: 'all 0.3s',
              }} onMouseEnter={e => {
                e.currentTarget.style.background = THEME.goldDark;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }} onMouseLeave={e => {
                e.currentTarget.style.background = THEME.gold;
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                Découvrir les formations →
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 30, justifyContent: 'center', maxWidth: 1000, margin: '0 auto',
            }}>
              <AnimatePresence>
                {certificats.map((cert, index) => (
                  <CertificatCard key={cert.id} cert={cert} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
