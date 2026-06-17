import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ArrowLeft, MessageSquare, Users, Eye, 
  ChevronRight, BarChart3, TrendingUp, Calendar,
  ThumbsUp, ThumbsDown, Filter, Search, X
} from 'lucide-react';
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
  purple: '#8b5cf6',
  purpleLight: '#ede9fe'
};

// ==================== PAGE LISTE DES CAMPAGNES ====================
const CampagnesList = ({ onSelectCampagne }) => {
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('avis'); // 'avis', 'note', 'date'

  useEffect(() => {
    fetchCampagnesWithFeedbacks();
  }, []);

  const fetchCampagnesWithFeedbacks = async () => {
    try {
      setLoading(true);
      // Récupérer toutes les campagnes
      const campagnesRes = await api.get('/api/campagnes');
      const campagnesData = campagnesRes.data;

      // Pour chaque campagne, récupérer les stats d'avis
      const campagnesWithStats = await Promise.all(
        campagnesData.map(async (campagne) => {
          try {
            const feedbackRes = await api.get(`/api/feedbacks/campagne/${campagne.id}`);
            return {
              ...campagne,
              feedbacksCount: feedbackRes.data.stats?.total || 0,
              averageRating: feedbackRes.data.stats?.average || 0,
              distribution: feedbackRes.data.stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
          } catch (err) {
            return {
              ...campagne,
              feedbacksCount: 0,
              averageRating: 0,
              distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
          }
        })
      );

      setCampagnes(campagnesWithStats);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampagnes = campagnes
    .filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'avis') return b.feedbacksCount - a.feedbacksCount;
      if (sortBy === 'note') return b.averageRating - a.averageRating;
      if (sortBy === 'date') return new Date(b.dateScheduled || b.createdAt) - new Date(a.dateScheduled || a.createdAt);
      return 0;
    });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < Math.round(rating) ? THEME.gold : 'none'}
        color={i < Math.round(rating) ? THEME.gold : THEME.border}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return THEME.success;
    if (rating >= 3) return '#f59e0b';
    return THEME.danger;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ 
          width: 40, height: 40, border: '3px solid ' + THEME.border, 
          borderTop: '3px solid ' + THEME.gold, borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 20px'
        }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        <p style={{ color: THEME.textLight }}>Chargement des campagnes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: THEME.text, marginBottom: '8px' }}>
          <MessageSquare size={28} style={{ display: 'inline', marginRight: '12px', color: THEME.gold }} />
          Avis Clients
        </h1>
        <p style={{ color: THEME.textLight }}>Consultez les retours clients par formation</p>
      </div>

      {/* Stats globales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          background: THEME.card, padding: '24px', borderRadius: '16px', 
          border: '1px solid ' + THEME.border, textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.gold }}>
            {campagnes.reduce((sum, c) => sum + c.feedbacksCount, 0)}
          </div>
          <div style={{ color: THEME.textLight, marginTop: '4px', fontSize: '0.9rem' }}>Total avis</div>
        </div>
        <div style={{ 
          background: THEME.card, padding: '24px', borderRadius: '16px', 
          border: '1px solid ' + THEME.border, textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.blue }}>
            {campagnes.filter(c => c.feedbacksCount > 0).length}
          </div>
          <div style={{ color: THEME.textLight, marginTop: '4px', fontSize: '0.9rem' }}>Campagnes avec avis</div>
        </div>
        <div style={{ 
          background: THEME.card, padding: '24px', borderRadius: '16px', 
          border: '1px solid ' + THEME.border, textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.purple }}>
            {(campagnes.reduce((sum, c) => sum + c.averageRating, 0) / (campagnes.filter(c => c.averageRating > 0).length || 1)).toFixed(1)}
          </div>
          <div style={{ color: THEME.textLight, marginTop: '4px', fontSize: '0.9rem' }}>Note moyenne globale</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '24px', 
        flexWrap: 'wrap', alignItems: 'center' 
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ 
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: THEME.textLight 
          }} />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px',
              border: '2px solid ' + THEME.border, fontSize: '15px', outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.gold}
            onBlur={(e) => e.target.style.borderColor = THEME.border}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: THEME.textLight
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} style={{ color: THEME.textLight }} />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px 16px', borderRadius: '12px', border: '2px solid ' + THEME.border,
              fontSize: '14px', outline: 'none', cursor: 'pointer', background: THEME.card
            }}
          >
            <option value="avis">Plus d'avis</option>
            <option value="note">Meilleure note</option>
            <option value="date">Plus récent</option>
          </select>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {filteredCampagnes.map((campagne, index) => (
            <motion.div
              key={campagne.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCampagne(campagne)}
              style={{
                background: THEME.card, borderRadius: '16px', border: '1px solid ' + THEME.border,
                padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.gold;
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = THEME.border;
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                {/* Image */}
                <div style={{ 
                  width: 80, height: 80, borderRadius: '12px', overflow: 'hidden',
                  flexShrink: 0, background: THEME.bg
                }}>
                  <img 
                    src={campagne.image || '/default-formation.jpg'} 
                    alt={campagne.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', 
                    alignItems: 'flex-start', marginBottom: '8px' 
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.1rem', fontWeight: 700, color: THEME.text,
                        marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {campagne.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.textLight, fontSize: '0.85rem' }}>
                        <Calendar size={14} />
                        {campagne.dateScheduled ? new Date(campagne.dateScheduled).toLocaleDateString('fr-FR') : 'Date non précisée'}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: campagne.feedbacksCount > 0 ? THEME.successLight : THEME.bg,
                      padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem',
                      color: campagne.feedbacksCount > 0 ? THEME.success : THEME.textLight,
                      fontWeight: 600, flexShrink: 0
                    }}>
                      <MessageSquare size={14} />
                      {campagne.feedbacksCount} avis
                    </div>
                  </div>

                  {/* Rating et distribution */}
                  {campagne.feedbacksCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ 
                          fontSize: '1.5rem', fontWeight: 800, 
                          color: getRatingColor(campagne.averageRating) 
                        }}>
                          {Number(campagne.averageRating || 0).toFixed(1)}
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {renderStars(campagne.averageRating)}
                        </div>
                      </div>

                      {/* Mini barres de distribution */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '150px' }}>
                        {[5, 4, 3, 2, 1].map((note) => {
                          const count = campagne.distribution[note] || 0;
                          const total = campagne.feedbacksCount;
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          return (
                            <div key={note} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <div style={{ 
                                width: '100%', height: '4px', background: THEME.bg, 
                                borderRadius: '2px', overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: percentage + '%', height: '100%',
                                  background: note >= 4 ? THEME.success : note >= 3 ? '#f59e0b' : THEME.danger,
                                  borderRadius: '2px', transition: 'width 0.5s'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.65rem', color: THEME.textLight }}>{note}★</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: THEME.gold, fontWeight: 600, fontSize: '0.9rem'
                      }}>
                        Voir les avis
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: THEME.textLight, fontSize: '0.9rem', fontStyle: 'italic'
                    }}>
                      <MessageSquare size={14} />
                      Aucun avis pour cette formation
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCampagnes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: THEME.textLight }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Aucune campagne ne correspond à votre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PAGE DÉTAIL D'UNE CAMPAGNE ====================
const CampagneDetailAvis = ({ campagneId, onBack }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(null);

  useEffect(() => {
    fetchData();
  }, [campagneId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbacksRes, campagneRes] = await Promise.all([
        api.get(`/api/feedbacks/campagne/${campagneId}`),
        api.get(`/api/campagnes/${campagneId}`)
      ]);

      setFeedbacks(feedbacksRes.data.feedbacks);
      setStats(feedbacksRes.data.stats);
      setCampagne(campagneRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = filterRating 
    ? feedbacks.filter(f => f.rating === filterRating)
    : feedbacks;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={18} 
        fill={i < rating ? THEME.gold : 'none'}
        color={i < rating ? THEME.gold : THEME.border}
      />
    ));
  };

  const getSentiment = (rating) => {
    if (rating >= 4) return { icon: ThumbsUp, color: THEME.success, text: 'Positif' };
    if (rating >= 3) return { icon: TrendingUp, color: '#f59e0b', text: 'Neutre' };
    return { icon: ThumbsDown, color: THEME.danger, text: 'Négatif' };
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ 
          width: 40, height: 40, border: '3px solid ' + THEME.border, 
          borderTop: '3px solid ' + THEME.gold, borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 20px'
        }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        <p style={{ color: THEME.textLight }}>Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: THEME.textLight, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.95rem', marginBottom: '16px',
            padding: '8px 0'
          }}
        >
          <ArrowLeft size={18} /> Retour à la liste
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: '12px', overflow: 'hidden',
            background: THEME.bg, flexShrink: 0
          }}>
            <img 
              src={campagne?.image || '/default-formation.jpg'} 
              alt={campagne?.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: THEME.text, marginBottom: '4px' }}>
              {campagne?.title}
            </h1>
            <p style={{ color: THEME.textLight, fontSize: '0.9rem' }}>
              {campagne?.dateScheduled ? new Date(campagne.dateScheduled).toLocaleDateString('fr-FR') : 'Date non précisée'}
              {' · '}
              {feedbacks.length} avis
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            background: THEME.card, padding: '24px', borderRadius: '16px',
            border: '1px solid ' + THEME.border, textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.gold }}>
              {Number(stats?.average || 0).toFixed(1) || '0.0'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '8px 0' }}>
              {renderStars(Math.round(stats.average || 0))}
            </div>
            <div style={{ color: THEME.textLight, fontSize: '0.85rem' }}>Note moyenne</div>
          </div>

          <div style={{ 
            background: THEME.card, padding: '24px', borderRadius: '16px',
            border: '1px solid ' + THEME.border, textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: THEME.blue }}>
              {stats.total || 0}
            </div>
            <div style={{ color: THEME.textLight, fontSize: '0.85rem', marginTop: '8px' }}>Total avis</div>
          </div>

          {[5, 4, 3, 2, 1].map((note) => (
            <div 
              key={note}
              onClick={() => setFilterRating(filterRating === note ? null : note)}
              style={{ 
                background: filterRating === note ? THEME.goldLight : THEME.card, 
                padding: '16px', borderRadius: '16px',
                border: '2px solid ' + (filterRating === note ? THEME.gold : THEME.border),
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>
                <Star size={16} fill={THEME.gold} color={THEME.gold} />
                <span style={{ fontWeight: 700, color: THEME.text }}>{note}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.text }}>
                {stats.distribution?.[note] || 0}
              </div>
              <div style={{ color: THEME.textLight, fontSize: '0.8rem', marginTop: '4px' }}>
                {stats.total > 0 ? ((stats.distribution?.[note] || 0) / stats.total * 100).toFixed(0) : 0}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtre actif */}
      {filterRating && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
          padding: '12px 16px', background: THEME.goldLight, borderRadius: '12px'
        }}>
          <span style={{ color: THEME.goldDark, fontWeight: 600 }}>
            Filtre : {filterRating} étoiles ({filteredFeedbacks.length} avis)
          </span>
          <button 
            onClick={() => setFilterRating(null)}
            style={{ 
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: THEME.goldDark, display: 'flex', alignItems: 'center'
            }}
          >
            <X size={16} /> Réinitialiser
          </button>
        </div>
      )}

      {/* Liste des avis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {filteredFeedbacks.map((feedback, index) => {
            const sentiment = getSentiment(feedback.rating);
            const SentimentIcon = sentiment.icon;

            return (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: THEME.card, padding: '24px', borderRadius: '16px',
                  border: '1px solid ' + THEME.border,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', 
                  alignItems: 'flex-start', marginBottom: '12px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: THEME.goldLight, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: THEME.gold, fontWeight: 700, fontSize: '1rem'
                    }}>
                      {feedback.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: THEME.text, fontSize: '1rem' }}>
                        {feedback.user?.name || 'Client anonyme'}
                      </div>
                      <div style={{ color: THEME.textLight, fontSize: '0.8rem' }}>
                        {new Date(feedback.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px',
                    background: sentiment.color + '15', color: sentiment.color,
                    fontSize: '0.85rem', fontWeight: 600
                  }}>
                    <SentimentIcon size={14} />
                    {sentiment.text}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {renderStars(feedback.rating)}
                </div>

                {feedback.comment && (
                  <div style={{ 
                    background: THEME.bg, padding: '16px', borderRadius: '12px',
                    borderLeft: '3px solid ' + THEME.gold
                  }}>
                    <p style={{ color: THEME.text, lineHeight: 1.7, fontStyle: 'italic' }}>
                      "{feedback.comment}"
                    </p>
                  </div>
                )}

                {!feedback.comment && (
                  <p style={{ color: THEME.textLight, fontStyle: 'italic', fontSize: '0.9rem' }}>
                    Aucun commentaire
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredFeedbacks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: THEME.textLight }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>{filterRating ? `Aucun avis avec ${filterRating} étoiles` : 'Aucun avis pour cette formation'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PAGE PRINCIPALE ====================
export default function FeedbacksCampagne() {
  const { campagneId } = useParams();
  const navigate = useNavigate();
  const [selectedCampagne, setSelectedCampagne] = useState(null);

  // Si campagneId est dans l'URL, afficher le détail
  // Sinon, afficher la liste
  const showDetail = !!campagneId;

  const handleSelectCampagne = (campagne) => {
    setSelectedCampagne(campagne);
    navigate(`/FeedbacksCampagne/${campagne.id}`);
  };

  const handleBack = () => {
    setSelectedCampagne(null);
    navigate('/FeedbacksCampagne');
  };

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', padding: '30px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {showDetail ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CampagneDetailAvis 
                  campagneId={campagneId} 
                  onBack={handleBack} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CampagnesList onSelectCampagne={handleSelectCampagne} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}