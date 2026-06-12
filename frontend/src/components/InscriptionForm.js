import React, { useState } from 'react';
import axios from 'axios';

export default function InscriptionForm({ campagneId, campagneTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/inscriptions`,
        {
          ...formData,
          campagneId
        }
      );

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '20px', background: '#d1fae5', borderRadius: '10px', textAlign: 'center' }}>
        <h3 style={{ color: '#065f46' }}>✅ Inscription réussie !</h3>
        <p>Vous êtes inscrit à : {campagneTitle}</p>
        <p>Un email de confirmation vous sera envoyé.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#F5A623', marginBottom: '20px' }}>
        S'inscrire à {campagneTitle}
      </h2>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>
            Nom complet *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333' }}>
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#F5A623',
            color: 'white',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Inscription en cours...' : 'Confirmer l\'inscription'}
        </button>
      </form>
    </div>
  );
}