import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const gold = '#f5a623';
const dark = '#0A0A0A';
const white = '#FFFFFF';
const gray = '#F5F5F5';
const textGray = '#666666';

const CAMPAGNES_DATA = [
  {
    id: 1,
    titre: 'Formation Digital Marketing & AI',
    description: 'Maîtrisez l\'avenir du Marketing Digital avec l\'Intelligence Artificielle ! Formation complète 40h avec certification.',
    type: 'Multicanal',
    dateDebut: '2026-04-30',
    dateFin: '2026-05-15',
    places: 25,
    inscrits: 12,
    prix: 850,
    status: 'active',
    canaux: ['Email', 'SMS', 'Social Media'],
    reservations: [
      { id: 1, nom: 'Ahmed Ben Ali', email: 'ahmed@email.com', telephone: '+216 55 123 456', message: 'Intéressé par la formation', status: 'en_attente', date: '2026-06-08' },
      { id: 2, nom: 'Fatima Trabelsi', email: 'fatima@email.com', telephone: '+216 98 765 432', message: 'Je souhaite m\'inscrire', status: 'en_attente', date: '2026-06-08' },
      { id: 3, nom: 'Karim Mansour', email: 'karim@email.com', telephone: '+216 22 333 444', message: 'Disponible pour la session', status: 'accepte', date: '2026-06-07' },
    ]
  },
  {
    id: 2,
    titre: 'Formation Web WordPress',
    description: 'Maîtrisez le web en seulement 18 heures ! Créez votre site internet performant sans coder.',
    type: 'Email',
    dateDebut: '2026-04-08',
    dateFin: '2026-04-10',
    places: 20,
    inscrits: 8,
    prix: 450,
    status: 'terminee',
    canaux: ['Email', 'Push'],
    reservations: [
      { id: 4, nom: 'Sami Ben Salah', email: 'sami@email.com', telephone: '+216 55 987 654', message: 'Inscription WordPress', status: 'accepte', date: '2026-06-05' },
    ]
  },
  {
    id: 3,
    titre: 'Formation Design Graphique',
    description: 'Devenez un pro du design graphique avec Photoshop, Illustrator et Canva. 30h de formation pratique.',
    type: 'SMS',
    dateDebut: '2026-05-20',
    dateFin: '2026-06-05',
    places: 15,
    inscrits: 15,
    prix: 650,
    status: 'planifiee',
    canaux: ['SMS', 'Social Media'],
    reservations: []
  },
  {
    id: 4,
    titre: 'Formation Social Media Management',
    description: 'Apprenez à gérer les réseaux sociaux comme un pro. Stratégie, contenu, analytics et community management.',
    type: 'Social Media',
    dateDebut: '2026-06-01',
    dateFin: '2026-06-15',
    places: 30,
    inscrits: 25,
    prix: 550,
    status: 'active',
    canaux: ['Social Media', 'Email'],
    reservations: [
      { id: 5, nom: 'Leila Ben Ammar', email: 'leila@email.com', telephone: '+216 99 111 222', message: 'Formation Social Media', status: 'en_attente', date: '2026-06-08' },
    ]
  }
];

const TYPE_COLORS = {
  'Multicanal': { bg: '#FFF8E7', color: '#D48A1A', border: '#F5A623' },
  'Email': { bg: '#EFF6FF', color: '#1D4ED8', border: '#3B82F6' },
  'SMS': { bg: '#ECFDF5', color: '#047857', border: '#10B981' },
  'Social Media': { bg: '#FDF2F8', color: '#BE185D', border: '#EC4899' },
  'Push': { bg: '#F3E8FF', color: '#7C3AED', border: '#A855F7' }
};

const STATUS_COLORS = {
  'active': { bg: '#ECFDF5', color: '#047857', label: 'Active' },
  'planifiee': { bg: '#EFF6FF', color: '#1D4ED8', label: 'Planifiée' },
  'terminee': { bg: '#F3F4F6', color: '#6B7280', label: 'Terminée' }
};

function GestionCampagnesMarketing() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes] = useState(CAMPAGNES_DATA);
  const [filter, setFilter] = useState('toutes');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCampagne, setSelectedCampagne] = useState(null);
  const [newCampagne, setNewCampagne] = useState({
    titre: '',
    description: '',
    type: 'Multicanal',
    dateDebut: '',
    dateFin: '',
    places: 20,
    prix: 500,
    canaux: []
  });

  const filteredCampagnes = campagnes.filter(c => {
    if (filter !== 'toutes' && c.status !== filter) return false;
    if (search && !c.titre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: campagnes.length,
    actives: campagnes.filter(c => c.status === 'active').length,
    planifiees: campagnes.filter(c => c.status === 'planifiee').length,
    terminees: campagnes.filter(c => c.status === 'terminee').length,
    inscrits: campagnes.reduce((acc, c) => acc + c.inscrits, 0),
    enAttente: campagnes.reduce((acc, c) => acc + c.reservations.filter(r => r.status === 'en_attente').length, 0)
  };

  const handleCreateCampagne = () => {
    const campagne = {
      ...newCampagne,
      id: campagnes.length + 1,
      inscrits: 0,
      status: 'planifiee',
      reservations: []
    };
    setCampagnes([...campagnes, campagne]);
    setShowModal(false);
    setNewCampagne({
      titre: '',
      description: '',
      type: 'Multicanal',
      dateDebut: '',
      dateFin: '',
      places: 20,
      prix: 500,
      canaux: []
    });
  };

  const handleAcceptReservation = (campagneId, reservationId) => {
    setCampagnes(campagnes.map(c => {
      if (c.id === campagneId) {
        return {
          ...c,
          reservations: c.reservations.map(r => 
            r.id === reservationId ? { ...r, status: 'accepte' } : r
          ),
          inscrits: c.inscrits + 1
        };
      }
      return c;
    }));
  };

  const handleRefuseReservation = (campagneId, reservationId) => {
    setCampagnes(campagnes.map(c => {
      if (c.id === campagneId) {
        return {
          ...c,
          reservations: c.reservations.filter(r => r.id !== reservationId)
        };
      }
      return c;
    }));
  };

  const handleDeleteCampagne = (campagneId) => {
    setCampagnes(campagnes.filter(c => c.id !== campagneId));
    setShowDeleteConfirm(false);
    setSelectedCampagne(null);
  };

  const handleEditCampagne = (campagne) => {
    setSelectedCampagne(campagne);
    setNewCampagne({
      titre: campagne.titre,
      description: campagne.description,
      type: campagne.type,
      dateDebut: campagne.dateDebut,
      dateFin: campagne.dateFin,
      places: campagne.places,
      prix: campagne.prix,
      canaux: [...campagne.canaux]
    });
    setShowEdit(true);
  };

  const handleUpdateCampagne = () => {
    setCampagnes(campagnes.map(c => 
      c.id === selectedCampagne.id ? { ...c, ...newCampagne } : c
    ));
    setShowEdit(false);
    setSelectedCampagne(null);
    setNewCampagne({
      titre: '',
      description: '',
      type: 'Multicanal',
      dateDebut: '',
      dateFin: '',
      places: 20,
      prix: 500,
      canaux: []
    });
  };

  const toggleCanal = (canal) => {
    setNewCampagne(prev => ({
      ...prev,
      canaux: prev.canaux.includes(canal) 
        ? prev.canaux.filter(c => c !== canal)
        : [...prev.canaux, canal]
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: gray, 
      fontFamily: "'Inter', sans-serif",
      padding: '40px 60px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: dark, margin: 0 }}>
            Gestion des Campagnes
          </h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setShowReservations(true)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid #E5E5E5',
                background: white,
                color: dark,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>🔔</span>
              Réservations
              {stats.enAttente > 0 && (
                <span style={{
                  background: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {stats.enAttente}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                background: gold,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>+</span>
              Nouvelle Campagne
            </button>
          </div>
        </div>
        <p style={{ color: textGray, fontSize: '1rem', margin: 0 }}>
          Créez, planifiez et gérez vos campagnes marketing
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 20, 
        marginBottom: 40 
      }}>
        {[
          { label: 'Total', value: stats.total, icon: '🎯', color: gold },
          { label: 'Actives', value: stats.actives, icon: '⚡', color: '#10B981' },
          { label: 'Planifiées', value: stats.planifiees, icon: '📅', color: '#3B82F6' },
          { label: 'Terminées', value: stats.terminees, icon: '✅', color: '#6B7280' },
          { label: 'Inscrits', value: stats.inscrits, icon: '👥', color: '#8B5CF6' },
          { label: 'En attente', value: stats.enAttente, icon: '🔔', color: '#EF4444' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: white,
            borderRadius: 16,
            padding: '24px',
            border: '1px solid #E5E5E5',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: dark, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: '0.875rem', color: textGray, fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['toutes', 'active', 'planifiee', 'terminee'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                borderRadius: 20,
                border: '1px solid #E5E5E5',
                background: filter === f ? gold : white,
                color: filter === f ? 'white' : dark,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f === 'toutes' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'planifiee' ? 'Planifiées' : 'Terminées'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher une campagne..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            border: '1px solid #E5E5E5',
            background: white,
            width: 300,
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Campagnes Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: 24 
      }}>
        {filteredCampagnes.map(campagne => {
          const typeStyle = TYPE_COLORS[campagne.type] || TYPE_COLORS['Multicanal'];
          const statusStyle = STATUS_COLORS[campagne.status];
          const tauxRemplissage = Math.round((campagne.inscrits / campagne.places) * 100);
          const reservationsEnAttente = campagne.reservations.filter(r => r.status === 'en_attente').length;

          return (
            <div key={campagne.id} style={{
              background: white,
              borderRadius: 16,
              border: '1px solid #E5E5E5',
              overflow: 'hidden'
            }}>
              {/* Header card */}
              <div style={{ padding: '24px', borderBottom: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: typeStyle.bg,
                    color: typeStyle.color,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: `1px solid ${typeStyle.border}`
                  }}>
                    <span>🎯</span>
                    {campagne.type}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* 👁 Voir les détails */}
                    <button 
                      onClick={() => { setSelectedCampagne(campagne); setShowDetails(true); }}
                      style={{ 
                        width: 32, height: 32, borderRadius: 8, 
                        border: '1px solid #E5E5E5', background: white, 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#F5F5F5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                      title="Voir les détails"
                    >
                      👁
                    </button>
                    {/* ✏️ Modifier */}
                    <button 
                      onClick={() => handleEditCampagne(campagne)}
                      style={{ 
                        width: 32, height: 32, borderRadius: 8, 
                        border: '1px solid #E5E5E5', background: white, 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#F5F5F5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    {/* 🗑 Supprimer */}
                    <button 
                      onClick={() => { setSelectedCampagne(campagne); setShowDeleteConfirm(true); }}
                      style={{ 
                        width: 32, height: 32, borderRadius: 8, 
                        border: '1px solid #E5E5E5', background: white, 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#FEE2E2'; e.target.style.borderColor = '#EF4444'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#E5E5E5'; }}
                      title="Supprimer"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: dark, margin: '0 0 8px' }}>
                  {campagne.titre}
                </h3>
                <p style={{ color: textGray, fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                  {campagne.description}
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: textGray }}>
                    <span>📅</span>
                    {campagne.dateDebut}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: textGray }}>
                    <span>⏱</span>
                    {campagne.dateFin}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: textGray }}>
                    <span>👥</span>
                    {campagne.inscrits}/{campagne.places}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: gold, fontWeight: 700 }}>
                    <span>💰</span>
                    {campagne.prix} TND
                  </div>
                </div>

                {/* Canaux */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {campagne.canaux.map((canal, i) => (
                    <span key={i} style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: '#F0F0F0',
                      color: textGray,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {canal === 'Email' && '📧 '}
                      {canal === 'SMS' && '💬 '}
                      {canal === 'Social Media' && '📱 '}
                      {canal === 'Push' && '🔔 '}
                      {canal}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem' }}>
                    <span style={{ color: textGray }}>Taux de remplissage</span>
                    <span style={{ color: dark, fontWeight: 700 }}>{tauxRemplissage}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#F0F0F0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 3,
                      background: tauxRemplissage >= 80 ? '#EF4444' : tauxRemplissage >= 50 ? gold : '#10B981',
                      width: `${tauxRemplissage}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {statusStyle.label}
                  </span>

                  {reservationsEnAttente > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCampagne(campagne);
                        setShowReservations(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#FFF8E7',
                        color: gold,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      🔔 {reservationsEnAttente} nouvelle{reservationsEnAttente > 1 ? 's' : ''} réservation{reservationsEnAttente > 1 ? 's' : ''}
                    </button>
                  )}

                  {reservationsEnAttente === 0 && (
                    <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 500 }}>
                      {campagne.places - campagne.inscrits} places restantes
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Voir Détails */}
      {showDetails && selectedCampagne && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Détails de la Campagne
              </h2>
              <button 
                onClick={() => { setShowDetails(false); setSelectedCampagne(null); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                background: (TYPE_COLORS[selectedCampagne.type] || TYPE_COLORS['Multicanal']).bg,
                color: (TYPE_COLORS[selectedCampagne.type] || TYPE_COLORS['Multicanal']).color,
                fontSize: '0.75rem',
                fontWeight: 700,
                border: `1px solid ${(TYPE_COLORS[selectedCampagne.type] || TYPE_COLORS['Multicanal']).border}`,
                width: 'fit-content'
              }}>
                <span>🎯</span>
                {selectedCampagne.type}
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: dark, margin: 0 }}>
                {selectedCampagne.titre}
              </h3>

              <p style={{ color: textGray, fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                {selectedCampagne.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: gray, padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4 }}>Date de début</div>
                  <div style={{ fontWeight: 700, color: dark }}>📅 {selectedCampagne.dateDebut}</div>
                </div>
                <div style={{ background: gray, padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4 }}>Date de fin</div>
                  <div style={{ fontWeight: 700, color: dark }}>⏱ {selectedCampagne.dateFin}</div>
                </div>
                <div style={{ background: gray, padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4 }}>Places</div>
                  <div style={{ fontWeight: 700, color: dark }}>👥 {selectedCampagne.inscrits}/{selectedCampagne.places}</div>
                </div>
                <div style={{ background: gray, padding: '16px', borderRadius: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4 }}>Prix</div>
                  <div style={{ fontWeight: 700, color: gold }}>💰 {selectedCampagne.prix} TND</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: dark, marginBottom: 8 }}>Canaux de diffusion</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedCampagne.canaux.map((canal, i) => (
                    <span key={i} style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: '#F0F0F0',
                      color: textGray,
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {canal === 'Email' && '📧 '}
                      {canal === 'SMS' && '💬 '}
                      {canal === 'Social Media' && '📱 '}
                      {canal === 'Push' && '🔔 '}
                      {canal}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: dark, marginBottom: 8 }}>Réservations</div>
                {selectedCampagne.reservations.length === 0 ? (
                  <p style={{ color: textGray }}>Aucune réservation</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedCampagne.reservations.map(res => (
                      <div key={res.id} style={{ background: gray, padding: '12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: dark }}>{res.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: textGray }}>{res.email}</div>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          background: res.status === 'accepte' ? '#ECFDF5' : '#FFF8E7',
                          color: res.status === 'accepte' ? '#047857' : gold,
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {res.status === 'accepte' ? '✅ Acceptée' : '⏳ En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Campagne */}
      {showEdit && selectedCampagne && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Modifier la Campagne
              </h2>
              <button 
                onClick={() => { setShowEdit(false); setSelectedCampagne(null); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Titre</label>
                <input
                  type="text"
                  value={newCampagne.titre}
                  onChange={(e) => setNewCampagne({...newCampagne, titre: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={newCampagne.description}
                  onChange={(e) => setNewCampagne({...newCampagne, description: e.target.value})}
                  rows={4}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Type</label>
                  <select
                    value={newCampagne.type}
                    onChange={(e) => setNewCampagne({...newCampagne, type: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  >
                    <option value="Multicanal">Multicanal</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Push">Push</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Places</label>
                  <input
                    type="number"
                    value={newCampagne.places}
                    onChange={(e) => setNewCampagne({...newCampagne, places: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Date début</label>
                  <input
                    type="date"
                    value={newCampagne.dateDebut}
                    onChange={(e) => setNewCampagne({...newCampagne, dateDebut: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Date fin</label>
                  <input
                    type="date"
                    value={newCampagne.dateFin}
                    onChange={(e) => setNewCampagne({...newCampagne, dateFin: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Prix (TND)</label>
                <input
                  type="number"
                  value={newCampagne.prix}
                  onChange={(e) => setNewCampagne({...newCampagne, prix: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Canaux</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Email', 'SMS', 'Social Media', 'Push'].map(canal => (
                    <button
                      key={canal}
                      onClick={() => toggleCanal(canal)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: newCampagne.canaux.includes(canal) ? `2px solid ${gold}` : '1px solid #E5E5E5',
                        background: newCampagne.canaux.includes(canal) ? '#FFF8E7' : white,
                        color: newCampagne.canaux.includes(canal) ? gold : textGray,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {canal === 'Email' && '📧 '}
                      {canal === 'SMS' && '💬 '}
                      {canal === 'Social Media' && '📱 '}
                      {canal === 'Push' && '🔔 '}
                      {canal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpdateCampagne}
                style={{
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: gold,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                💾 Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showDeleteConfirm && selectedCampagne && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 450,
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: '0 0 12px' }}>
              Confirmer la suppression
            </h2>
            <p style={{ color: textGray, fontSize: '1rem', marginBottom: 24 }}>
              Êtes-vous sûr de vouloir supprimer la campagne <strong>"{selectedCampagne.titre}"</strong> ?<br/>
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedCampagne(null); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: '1px solid #E5E5E5',
                  background: white,
                  color: dark,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ❌ Annuler
              </button>
              <button
                onClick={() => handleDeleteCampagne(selectedCampagne.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#EF4444',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Campagne */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Nouvelle Campagne
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Titre de la campagne</label>
                <input
                  type="text"
                  value={newCampagne.titre}
                  onChange={(e) => setNewCampagne({...newCampagne, titre: e.target.value})}
                  placeholder="Ex: Formation Digital Marketing"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={newCampagne.description}
                  onChange={(e) => setNewCampagne({...newCampagne, description: e.target.value})}
                  placeholder="Description détaillée de la campagne..."
                  rows={4}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Type</label>
                  <select
                    value={newCampagne.type}
                    onChange={(e) => setNewCampagne({...newCampagne, type: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  >
                    <option value="Multicanal">Multicanal</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Push">Push</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Places disponibles</label>
                  <input
                    type="number"
                    value={newCampagne.places}
                    onChange={(e) => setNewCampagne({...newCampagne, places: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Date de début</label>
                  <input
                    type="date"
                    value={newCampagne.dateDebut}
                    onChange={(e) => setNewCampagne({...newCampagne, dateDebut: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Date de fin</label>
                  <input
                    type="date"
                    value={newCampagne.dateFin}
                    onChange={(e) => setNewCampagne({...newCampagne, dateFin: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Prix (TND)</label>
                <input
                  type="number"
                  value={newCampagne.prix}
                  onChange={(e) => setNewCampagne({...newCampagne, prix: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Canaux de diffusion</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Email', 'SMS', 'Social Media', 'Push'].map(canal => (
                    <button
                      key={canal}
                      onClick={() => toggleCanal(canal)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: newCampagne.canaux.includes(canal) ? `2px solid ${gold}` : '1px solid #E5E5E5',
                        background: newCampagne.canaux.includes(canal) ? '#FFF8E7' : white,
                        color: newCampagne.canaux.includes(canal) ? gold : textGray,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {canal === 'Email' && '📧 '}
                      {canal === 'SMS' && '💬 '}
                      {canal === 'Social Media' && '📱 '}
                      {canal === 'Push' && '🔔 '}
                      {canal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateCampagne}
                style={{
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: gold,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginTop: 8
                }}
              >
                Créer la campagne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réservations */}
      {showReservations && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 700,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Réservations {selectedCampagne ? `- ${selectedCampagne.titre}` : ''}
              </h2>
              <button 
                onClick={() => { setShowReservations(false); setSelectedCampagne(null); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            {(selectedCampagne ? selectedCampagne.reservations : campagnes.flatMap(c => c.reservations)).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: textGray }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                <p>Aucune réservation pour le moment</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(selectedCampagne ? selectedCampagne.reservations : campagnes.flatMap(c => c.reservations)).map(reservation => (
                  <div key={reservation.id} style={{
                    background: gray,
                    borderRadius: 12,
                    padding: '20px',
                    border: '1px solid #E5E5E5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: dark, fontSize: '1rem', marginBottom: 4 }}>
                          {reservation.nom}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: textGray }}>
                          {reservation.email} | {reservation.telephone}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: reservation.status === 'accepte' ? '#ECFDF5' : '#FFF8E7',
                        color: reservation.status === 'accepte' ? '#047857' : gold,
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {reservation.status === 'accepte' ? '✅ Acceptée' : '⏳ En attente'}
                      </span>
                    </div>
                    <p style={{ color: textGray, fontSize: '0.875rem', margin: '0 0 12px' }}>
                      {reservation.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {reservation.date}
                      </span>
                      {reservation.status === 'en_attente' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleAcceptReservation(selectedCampagne ? selectedCampagne.id : campagnes.find(c => c.reservations.find(r => r.id === reservation.id)).id, reservation.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              border: 'none',
                              background: '#10B981',
                              color: 'white',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✅ Accepter
                          </button>
                          <button
                            onClick={() => handleRefuseReservation(selectedCampagne ? selectedCampagne.id : campagnes.find(c => c.reservations.find(r => r.id === reservation.id)).id, reservation.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              border: '1px solid #EF4444',
                              background: 'white',
                              color: '#EF4444',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCampagnesMarketing;