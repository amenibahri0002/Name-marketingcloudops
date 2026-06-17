import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, BookOpen, Award, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
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

const ICON_MAP = { Sparkles: '✨', Zap: '⚡', Palette: '🎨', TrendingUp: '📈', BookOpen: '📚', Award: '🏆' };

export default function MesInscriptions() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/inscriptions/mes-inscriptions');
      const mesFormations = res.data.map(ins => ({
        ...ins.campagne,
        inscriptionId: ins.id,
        inscriptionDate: ins.createdAt,
        inscriptiontatus: ins.status,
        status: ins.status === 'terminee' ? 'terminee' : 'en_cours',
        progress: ins.progress || Math.floor(Math.random() * 100),
      }));
      setFormations(mesFormations);
    } catch (err) {
      console.error('Erreur:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Impossible de charger vos formations');
      }
    } finally {
      setLoading(false);
    }
  };

  const campagnesFiltrees = filtre === 'tous' ? formations : formations.filter(f => f.status === filtre);
  const terminees = formations.filter(f => f.status === 'terminee').length;
  const enCours = formations.filter(f => f.status === 'en_cours').length;
  const certificats = formations.filter(f => f.certificat).length;
  const totalHeures = formations.reduce((sum, f) => sum + (f.dureeHeures || 0), 0);

  const FormationCard = ({ formation, index }) => {
    const isTerminee = formation.status === 'terminee';
    const icon = ICON_MAP[formation.iconName] || '✨';

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        style={{
          background: THEME.card, borderRadius: 16, border: `1px solid ${THEME.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onClick={() => navigate(`/campagnes/${formation.slug}`)}
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
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img src={formation.image || '/default-formation.jpg'} alt={formation.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
          />
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: isTerminee ? THEME.success : THEME.blue, color: '#fff',
            padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {isTerminee ? <CheckCircle size={14} /> : <Clock size={14} />}
            {isTerminee ? 'Terminée' : 'En cours'}
          </div>
          
          {/* Badge "Inscrit" */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: THEME.success, color: '#fff',
            padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CheckCircle size={14} />
            Inscrit
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: THEME.goldLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{icon}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {formation.tags?.map((tag, i) => (
                <span key={i} style={{
                  background: THEME.goldLight, color: THEME.goldDark,
                  padding: '4px 12px', borderRadius: 15, fontSize: '0.8rem', fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: THEME.text, marginBottom: 10, lineHeight: 1.3 }}>{formation.title}</h3>
          <p style={{ fontSize: '0.9rem', color: THEME.textLight, lineHeight: 1.5, marginBottom: 16 }}>
            {formation.description?.substring(0, 100)}...
          </p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: THEME.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} /> {formation.date}
            </span>
            <span style={{ fontSize: '0.85rem', color: THEME.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {formation.dureeHeures}h
            </span>
            <span style={{ fontSize: '0.85rem', color: THEME.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} /> Sfax
            </span>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: THEME.textLight, marginBottom: 8 }}>
              <span>Progression</span><span>{formation.progress || 0}%</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: (formation.progress || 0) + '%' }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ height: '100%', borderRadius: 4, background: isTerminee ? THEME.success : THEME.gold }}
              />
            </div>
          </div>

          {/* Statut de l'inscription */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 8,
            background: formation.inscriptionStatus === 'paye' ? THEME.successLight : 
                        formation.inscriptionStatus === 'en_attente' ? THEME.blueLight : '#f1f5f9',
            marginBottom: 16
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: formation.inscriptionStatus === 'paye' ? THEME.success : 
                         formation.inscriptionStatus === 'en_attente' ? THEME.blue : THEME.textLight
            }} />
            <span style={{ 
              fontSize: '0.85rem', fontWeight: 600,
              color: formation.inscriptionStatus === 'paye' ? THEME.success : 
                     formation.inscriptionStatus === 'en_attente' ? THEME.blue : THEME.textLight
            }}>
              {formation.inscriptionStatus === 'paye' ? '✅ Payée' : 
               formation.inscriptionStatus === 'en_attente' ? '⏳ En attente de paiement' : 
               formation.inscriptionStatus}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: THEME.gold }}>{formation.prix} TND</div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
              background: THEME.gold, color: '#fff', border: 'none', borderRadius: 12,
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
            }} onMouseEnter={e => { e.target.style.background = THEME.goldDark; e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.target.style.background = THEME.gold; e.target.style.transform = 'scale(1)'; }}>
              Voir détails <ChevronRight size={14} />
            </button>
          </div>
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
                Mes <span style={{ color: THEME.gold }}>inscriptions</span>
              </h1>
              <p style={{ fontSize: '1.1rem', color: THEME.textLight, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                Suivez votre progression et accédez à vos formations
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
            marginBottom: 50, maxWidth: 900, margin: '0 auto 50px',
          }}>
            {[
              { icon: BookOpen, label: 'Formations', value: formations.length, color: THEME.gold },
              { icon: CheckCircle, label: 'Terminées', value: terminees, color: THEME.success },
              { icon: Clock, label: 'En cours', value: enCours, color: THEME.blue },
              { icon: Award, label: 'Certificats', value: certificats, color: '#ec4899' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  style={{
                    background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16,
                    padding: 24, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: stat.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                    color: stat.color,
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.9rem', color: THEME.textLight }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'tous', label: 'Toutes', count: formations.length },
                { id: 'en_cours', label: 'En cours', count: enCours, icon: Clock },
                { id: 'terminee', label: 'Terminées', count: terminees, icon: CheckCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setFiltre(tab.id)} style={{
                    padding: '10px 20px', borderRadius: 25, border: '2px solid',
                    borderColor: filtre === tab.id ? THEME.gold : THEME.border,
                    background: filtre === tab.id ? THEME.gold : THEME.card,
                    color: filtre === tab.id ? '#fff' : THEME.textLight,
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {Icon && <Icon size={14} />}
                    {tab.label}
                    <span style={{
                      background: filtre === tab.id ? 'rgba(0,0,0,0.15)' : THEME.bg,
                      color: filtre === tab.id ? '#fff' : THEME.text,
                      padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30, color: THEME.textLight, fontSize: '0.9rem' }}>
            {totalHeures} heures de formation au total
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 100 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', color: THEME.gold }} />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p style={{ color: THEME.textLight }}>Chargement de vos inscriptions...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: 60, background: '#fef2f2', borderRadius: 16,
              border: '1px solid #fecaca', color: '#dc2626',
            }}>
              <AlertCircle size={48} style={{ marginBottom: 16 }} />
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{
                marginTop: 16, padding: '10px 20px', background: THEME.gold, color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
              }}>Réessayer</button>
            </div>
          ) : campagnesFiltrees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>📚</div>
              <h3 style={{ fontSize: '1.3rem', color: THEME.text, marginBottom: 8 }}>Aucune inscription</h3>
              <p style={{ color: THEME.textLight, marginBottom: 24 }}>Vous n'avez pas encore d'inscription active.</p>
              <button onClick={() => navigate('/campagnes')} style={{
                padding: '12px 28px', background: THEME.gold, color: '#fff', border: 'none',
                borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                transition: 'all 0.3s',
              }} onMouseEnter={e => { e.target.style.background = THEME.goldDark; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = THEME.gold; e.target.style.transform = 'translateY(0)'; }}>
                Découvrir les formations →
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: 30, justifyContent: 'center', maxWidth: 1000, margin: '0 auto',
            }}>
              <AnimatePresence>
                {campagnesFiltrees.map((formation, index) => (
                  <FormationCard key={formation.id} formation={formation} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
