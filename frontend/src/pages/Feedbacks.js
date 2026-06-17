import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';
import Layout from '../Layout';
import api from '../api';

const THEME = {
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  gold: '#f5a623',
  goldLight: '#fff8e7',
  success: '#10b981',
  danger: '#ef4444',
};

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const response = await api.get('/api/feedbacks/par-campagne');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Erreur chargement feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            color: THEME.text,
            marginBottom: '0.5rem'
          }}>
            📊 Feedbacks Clients
          </h1>
          <p style={{ color: THEME.textLight, marginBottom: '2rem' }}>
            Avis et notes des clients par campagne
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</div>
          ) : feedbacks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'white',
              borderRadius: 16
            }}>
              <MessageSquare size={48} style={{ color: THEME.textLight, marginBottom: '1rem' }} />
              <p>Aucun feedback pour le moment</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {feedbacks.map(campagne => (
                <div key={campagne.id} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {campagne.image && (
                        <img 
                          src={campagne.image} 
                          alt={campagne.title}
                          style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          {campagne.title}
                        </h3>
                        <p style={{ color: THEME.textLight, fontSize: '0.9rem' }}>
                          {new Date(campagne.dateScheduled).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: 800, 
                        color: THEME.gold 
                      }}>
                        {campagne.moyenneRating}⭐
                      </div>
                      <p style={{ color: THEME.textLight, fontSize: '0.85rem' }}>
                        {campagne.totalFeedbacks} avis
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} style={{ 
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: '#f8fafc',
                        borderRadius: 8
                      }}>
                        <div style={{ fontWeight: 700, color: THEME.gold }}>
                          {star}⭐
                        </div>
                        <div style={{ fontSize: '0.85rem', color: THEME.textLight }}>
                          {campagne.distribution[star] || 0}
                        </div>
                      </div>
                    ))}
                  </div>

                  {campagne.feedbacks.length > 0 && (
                    <div style={{ 
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '1rem'
                    }}>
                      <h4 style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: THEME.textLight,
                        marginBottom: '0.5rem'
                      }}>
                        Derniers commentaires
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {campagne.feedbacks.slice(0, 3).map(f => (
                          <div key={f.id} style={{
                            padding: '0.75rem',
                            background: '#f8fafc',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {f.user.name}
                              </span>
                              <p style={{ color: THEME.textLight, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                "{f.comment || 'Pas de commentaire'}"
                              </p>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: THEME.gold,
                              fontWeight: 700
                            }}>
                              <Star size={16} fill="#f5a623" />
                              {f.rating}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
