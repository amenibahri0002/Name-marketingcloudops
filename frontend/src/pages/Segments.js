import React, { useState, useEffect } from 'react';
import api from '../api';

const VILLES_TUNISIE = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès',
  'Ariana', 'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine',
  'Nabeul', 'Tataouine', 'Beja', 'Jendouba', 'El Kef', 'Mahdia',
  'Sidi Bouzid', 'Tozeur', 'Siliana', 'Zaghouan', 'Kebili', 'Manouba'
]

const CRITERES_PREDEFINIS = [
  { id: 'age_18_25', label: 'Âge 18–25 ans', category: 'Démographie', icon: '👤' },
  { id: 'age_25_35', label: 'Âge 25–35 ans', category: 'Démographie', icon: '👤' },
  { id: 'age_35_plus', label: 'Âge 35+ ans', category: 'Démographie', icon: '👤' },
  { id: 'hist_3_ouvertures', label: 'A ouvert 3+ campagnes', category: 'Historique', icon: '📧' },
  { id: 'hist_inscrit_recent', label: 'Inscrit récemment', category: 'Historique', icon: '🕐' },
  { id: 'hist_actif', label: 'Utilisateur actif', category: 'Historique', icon: '⚡' },
  { id: 'int_hightech', label: 'Intérêt : High-Tech', category: 'Intérêt', icon: '💡' },
  { id: 'int_ia', label: 'Intérêt : Intelligence Artificielle', category: 'Intérêt', icon: '🤖' },
  { id: 'int_startup', label: 'Intérêt : Startups', category: 'Intérêt', icon: '🚀' },
  { id: 'int_marketing', label: 'Intérêt : Marketing', category: 'Intérêt', icon: '📢' },
]

const CATEGORIES = ['Démographie', 'Localisation', 'Historique', 'Intérêt']

function Segments() {
  const [segments, setSegments] = useState([]);
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [selectedCriteres, setSelectedCriteres] = useState([]);
  const [selectedVilles, setSelectedVilles] = useState([]);
  const [autreInteret, setAutreInteret] = useState('');
  const [autresInterets, setAutresInterets] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [contactId, setContactId] = useState('');
  const [activeCategory, setActiveCategory] = useState('Démographie');

  const fetchAll = async () => {
    const [s, cl, co] = await Promise.all([
      api.get('/api/segments'),
      api.get('/api/clients'),
      api.get('/api/contacts')
    ]);
    setSegments(s.data);
    setClients(cl.data);
    setContacts(co.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleCritere = (critere) => {
    setSelectedCriteres(prev =>
      prev.find(c => c.id === critere.id)
        ? prev.filter(c => c.id !== critere.id)
        : [...prev, critere]
    )
  }

  const toggleVille = (ville) => {
    const critere = { id: 'loc_' + ville, label: 'Localisation : ' + ville, category: 'Localisation', icon: '📍' }
    setSelectedVilles(prev =>
      prev.includes(ville) ? prev.filter(v => v !== ville) : [...prev, ville]
    )
    toggleCritere(critere)
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    const criteria = selectedCriteres.map(c => c.label).join(' | ')
    await api.post('/api/segments', { name, criteria, clientId });
    setName(''); setClientId(''); setSelectedCriteres([]);
    setSelectedVilles([]); setAutresInterets([]); setShowForm(false);
    fetchAll();
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    await api.post(`/api/segments/${selectedSegment}/contacts`, { contactId });
    setContactId('');
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/segments/${id}`);
    fetchAll();
  };

  const addAutreInteret = () => {
    if (autreInteret.trim()) {
      const newCritere = {
        id: 'int_custom_' + Date.now(),
        label: 'Intérêt : ' + autreInteret.trim(),
        category: 'Intérêt',
        icon: '⭐'
      }
      setAutresInterets(prev => [...prev, newCritere])
      toggleCritere(newCritere)
      setAutreInteret('')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>Segments</h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            Groupez vos contacts selon des critères communs pour cibler vos campagnes
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#4f46e5', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 8, fontSize: 14,
          fontWeight: 600, cursor: 'pointer'
        }}>
          + Nouveau segment
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div style={{
          background: 'white', border: '1px solid #e8e8f0',
          borderRadius: 12, padding: 28, marginBottom: 32
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', margin: '0 0 24px' }}>
            Créer un segment
          </h2>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Nom du segment
                </label>
                <input
                  placeholder="Ex: Jeunes technophiles Tunis"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 14, boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Client
                </label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 14, boxSizing: 'border-box', background: 'white'
                  }}
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Critères */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 12 }}>
                Critères de segmentation
              </label>

              {/* Categories tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)} style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 13,
                    border: '1px solid',
                    borderColor: activeCategory === cat ? '#4f46e5' : '#e5e7eb',
                    background: activeCategory === cat ? '#eef2ff' : 'white',
                    color: activeCategory === cat ? '#4f46e5' : '#6b7280',
                    cursor: 'pointer', fontWeight: activeCategory === cat ? 600 : 400
                  }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Démographie */}
              {activeCategory === 'Démographie' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CRITERES_PREDEFINIS.filter(c => c.category === 'Démographie').map(critere => {
                    const selected = selectedCriteres.find(c => c.id === critere.id)
                    return (
                      <div key={critere.id} onClick={() => toggleCritere(critere)} style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                        border: '1px solid', borderColor: selected ? '#4f46e5' : '#e5e7eb',
                        background: selected ? '#eef2ff' : 'white',
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, color: selected ? '#4f46e5' : '#374151',
                        fontWeight: selected ? 500 : 400
                      }}>
                        <span>{critere.icon}</span>
                        <span>{critere.label}</span>
                        {selected && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Localisation */}
{activeCategory === 'Localisation' && (
  <div>
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
      Sélectionne une ou plusieurs villes de Tunisie :
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <select
        onChange={e => {
          const ville = e.target.value
          if (ville && !selectedVilles.includes(ville)) {
            toggleVille(ville)
          }
          e.target.value = ''
        }}
        style={{
          flex: 1, padding: '10px 14px',
          border: '1px solid #e5e7eb', borderRadius: 8,
          fontSize: 14, background: 'white', cursor: 'pointer'
        }}
      >
        <option value="">-- Sélectionner une ville --</option>
        {VILLES_TUNISIE.filter(v => !selectedVilles.includes(v)).map(ville => (
          <option key={ville} value={ville}>📍 {ville}</option>
        ))}
      </select>
    </div>

    {/* Villes sélectionnées */}
    {selectedVilles.length > 0 && (
      <div style={{
        background: '#f8f9ff', border: '1px solid #e8e8f0',
        borderRadius: 8, padding: 12
      }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          Villes sélectionnées ({selectedVilles.length}) :
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {selectedVilles.map(ville => (
            <span key={ville} style={{
              background: '#4f46e5', color: 'white',
              padding: '4px 10px', borderRadius: 20, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              📍 {ville}
              <span
                onClick={() => toggleVille(ville)}
                style={{ cursor: 'pointer', marginLeft: 4, fontWeight: 700 }}
              >×</span>
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
)}

              {/* Historique */}
              {activeCategory === 'Historique' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CRITERES_PREDEFINIS.filter(c => c.category === 'Historique').map(critere => {
                    const selected = selectedCriteres.find(c => c.id === critere.id)
                    return (
                      <div key={critere.id} onClick={() => toggleCritere(critere)} style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                        border: '1px solid', borderColor: selected ? '#4f46e5' : '#e5e7eb',
                        background: selected ? '#eef2ff' : 'white',
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, color: selected ? '#4f46e5' : '#374151',
                        fontWeight: selected ? 500 : 400
                      }}>
                        <span>{critere.icon}</span>
                        <span>{critere.label}</span>
                        {selected && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Intérêt */}
              {activeCategory === 'Intérêt' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                    {[...CRITERES_PREDEFINIS.filter(c => c.category === 'Intérêt'), ...autresInterets].map(critere => {
                      const selected = selectedCriteres.find(c => c.id === critere.id)
                      return (
                        <div key={critere.id} onClick={() => toggleCritere(critere)} style={{
                          padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                          border: '1px solid', borderColor: selected ? '#4f46e5' : '#e5e7eb',
                          background: selected ? '#eef2ff' : 'white',
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: 13, color: selected ? '#4f46e5' : '#374151',
                          fontWeight: selected ? 500 : 400
                        }}>
                          <span>{critere.icon}</span>
                          <span>{critere.label}</span>
                          {selected && <span style={{ marginLeft: 'auto' }}>✓</span>}
                        </div>
                      )
                    })}
                  </div>

                  {/* Ajouter autre intérêt */}
                  <div style={{
                    background: '#f8f9ff', border: '1px dashed #c7d2fe',
                    borderRadius: 8, padding: 16
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#4f46e5', marginBottom: 10 }}>
                      + Ajouter un intérêt personnalisé
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Ex: Photographie, Cuisine, Finance..."
                        value={autreInteret}
                        onChange={e => setAutreInteret(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAutreInteret())}
                        style={{
                          flex: 1, padding: '8px 14px',
                          border: '1px solid #c7d2fe', borderRadius: 8,
                          fontSize: 13, outline: 'none'
                        }}
                      />
                      <button type="button" onClick={addAutreInteret} style={{
                        background: '#4f46e5', color: 'white', border: 'none',
                        padding: '8px 16px', borderRadius: 8, fontSize: 13,
                        cursor: 'pointer', fontWeight: 500
                      }}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected criteria */}
              {selectedCriteres.length > 0 && (
                <div style={{
                  background: '#f8f9ff', border: '1px solid #e8e8f0',
                  borderRadius: 8, padding: 12, marginTop: 16
                }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    Critères sélectionnés ({selectedCriteres.length}) :
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedCriteres.map(c => (
                      <span key={c.id} style={{
                        background: '#4f46e5', color: 'white',
                        padding: '4px 10px', borderRadius: 20, fontSize: 12,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        {c.icon} {c.label}
                        <span onClick={(e) => { e.stopPropagation(); toggleCritere(c) }}
                          style={{ cursor: 'pointer', marginLeft: 4 }}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" style={{
                background: '#4f46e5', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 8, fontSize: 14,
                fontWeight: 600, cursor: 'pointer'
              }}>
                Créer le segment
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: 'white', color: '#6b7280',
                border: '1px solid #e5e7eb',
                padding: '10px 24px', borderRadius: 8, fontSize: 14,
                cursor: 'pointer'
              }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ajouter contact à segment */}
      {selectedSegment && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: 12, padding: 20, marginBottom: 24
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#92400e', margin: '0 0 12px' }}>
            Ajouter un contact au segment #{selectedSegment}
          </h3>
          <form onSubmit={handleAddContact} style={{ display: 'flex', gap: 12 }}>
            <select value={contactId} onChange={e => setContactId(e.target.value)} required
              style={{ padding: '8px 14px', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 14, flex: 1 }}>
              <option value="">-- Sélectionner un contact --</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
            <button type="submit" style={{
              background: '#d97706', color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer'
            }}>Ajouter</button>
            <button type="button" onClick={() => setSelectedSegment(null)} style={{
              background: 'white', color: '#6b7280', border: '1px solid #e5e7eb',
              padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer'
            }}>Annuler</button>
          </form>
        </div>
      )}

      {/* Liste segments */}
      {segments.length === 0 ? (
        <div style={{
          background: 'white', border: '1px solid #e8e8f0',
          borderRadius: 12, padding: 60, textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', margin: '0 0 8px' }}>
            Aucun segment créé
          </h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            Créez votre premier segment pour cibler vos campagnes
          </p>
          <button onClick={() => setShowForm(true)} style={{
            background: '#4f46e5', color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, cursor: 'pointer'
          }}>
            Créer un segment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {segments.map(s => (
            <div key={s.id} style={{
              background: 'white', border: '1px solid #e8e8f0',
              borderRadius: 12, padding: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>
                    {s.name}
                  </h3>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.client?.name}</div>
                </div>
                <div style={{
                  background: '#eef2ff', color: '#4f46e5',
                  padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600
                }}>
                  {s.contacts?.length || 0} contacts
                </div>
              </div>

              {s.criteria && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>CRITÈRES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.criteria.split(' | ').map((c, i) => (
                      <span key={i} style={{
                        background: '#f3f4f6', color: '#374151',
                        padding: '3px 10px', borderRadius: 20, fontSize: 12
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelectedSegment(s.id)} style={{
                  flex: 1, padding: '8px', background: '#f8f9ff',
                  border: '1px solid #e8e8f0', borderRadius: 8,
                  fontSize: 13, color: '#4f46e5', cursor: 'pointer', fontWeight: 500
                }}>
                  + Ajouter contact
                </button>
                <button onClick={() => handleDelete(s.id)} style={{
                  padding: '8px 16px', background: 'white',
                  border: '1px solid #fecaca', borderRadius: 8,
                  fontSize: 13, color: '#ef4444', cursor: 'pointer'
                }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Segments;