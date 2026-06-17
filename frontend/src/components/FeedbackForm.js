import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, MessageSquare } from 'lucide-react';
import api from '../api';

const THEME = {
  gold: '#d4a574',
  goldLight: '#f5efe6',
  success: '#10b981',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};

export default function FeedbackForm({ campagneId, campagneTitle, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Veuillez selectionner une note');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/feedbacks', {
        campagneId,
        rating,
        comment
      });

      setSuccess(true);
      if (onSuccess) onSuccess({ rating, comment });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#fff', borderRadius: '20px', padding: '32px',
          maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: THEME.text }}>
            <MessageSquare size={24} style={{ display: 'inline', marginRight: '8px', color: THEME.gold }} />
            Votre avis
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color={THEME.textLight} />
          </button>
        </div>

        <p style={{ color: THEME.textLight, marginBottom: '20px' }}>
          {campagneTitle}
        </p>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%',
              background: THEME.success, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Star size={32} color='#fff' fill='#fff' />
            </div>
            <h4 style={{ color: THEME.success, fontSize: '1.2rem', fontWeight: 700 }}>
              Merci pour votre avis !
            </h4>
            <p style={{ color: THEME.textLight, marginTop: '8px' }}>
              Votre feedback aide a ameliorer nos formations.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: THEME.text, fontWeight: 600, marginBottom: '12px' }}>
                Comment evalueriez-vous cette formation ?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px', transition: 'transform 0.2s'
                    }}
                  >
                    <Star
                      size={36}
                      fill={star <= (hoverRating || rating) ? THEME.gold : 'none'}
                      color={star <= (hoverRating || rating) ? THEME.gold : THEME.border}
                    />
                  </button>
                ))}
              </div>
              <p style={{ color: THEME.gold, fontWeight: 600, marginTop: '8px', minHeight: '24px' }}>
                {rating === 1 && 'Tres insatisfait'}
                {rating === 2 && 'Insatisfait'}
                {rating === 3 && 'Neutre'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Tres satisfait !'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: THEME.text }}>
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Partagez votre experience...'
                rows={4}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  border: '2px solid ' + THEME.border, fontSize: '15px',
                  resize: 'vertical', outline: 'none'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                background: '#fee2e2', color: '#dc2626', padding: '12px',
                borderRadius: '8px', marginBottom: '16px', textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              style={{
                width: '100%', padding: '14px', background: THEME.gold,
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? 'Envoi...' : <><Send size={18} /> Envoyer mon avis</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
