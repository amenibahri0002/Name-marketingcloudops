import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, Tag, ArrowRight, 
  Sparkles, Zap, Palette, TrendingUp, BookOpen, Award,
  Search, Grid, List, CheckCircle, AlertTriangle,
  RefreshCw,Globe
} from 'lucide-react';
import api from '../api';

const ICON_MAP = { Sparkles, Zap, Palette, TrendingUp, BookOpen, Award };

const COLORS = {
  primary: '#F5A623', primaryLight: '#FFF8E7', primaryDark: '#D48A1A',
  dark: '#0A0A0A', gray: '#666666', grayLight: '#F5F5F5',
  grayBorder: '#E5E5E5', white: '#FFFFFF', green: '#10B981',
  red: '#EF4444', blue: '#3B82F6', purple: '#8B5CF6',
};

// ============================================================
// COMPOSANT CARTE FORMATION
// ============================================================
const FormationCard = ({ campagne, index, viewMode }) => {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[campagne.iconName] || Sparkles;
  const remise = campagne.prixOriginal ? 
    Math.round(((campagne.prixOriginal - campagne.prix) / campagne.prixOriginal) * 100) : 0;
  const placesPourcentage = campagne.placesTotal ? 
    (campagne.placesRestantes / campagne.placesTotal) * 100 : 0;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        onClick={() => navigate('/campagnes/' + campagne.slug)}
        style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          cursor: 'pointer',
          border: '1px solid ' + COLORS.grayBorder,
          transition: 'all 0.3s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS.primary;
          e.currentTarget.style.transform = 'translateX(8px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,166,35,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = COLORS.grayBorder;
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={campagne.image} alt={campagne.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: COLORS.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent size={16} color={COLORS.primary} />
            </div>
            <span style={{ background: COLORS.primaryLight, color: COLORS.primaryDark, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
              {campagne.format}
            </span>
            {remise > 0 && (
              <span style={{ background: COLORS.red, color: COLORS.white, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                -{remise}%
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.dark, marginBottom: '4px' }}>
            {campagne.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: COLORS.gray, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {campagne.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: COLORS.gray }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} /> {campagne.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> {campagne.dureeHeures}h
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} /> {campagne.placesRestantes} places
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: COLORS.primary }}>
            {campagne.prix} TND
          </p>
          {campagne.prixOriginal > campagne.prix && (
            <p style={{ fontSize: '0.85rem', color: COLORS.gray, textDecoration: 'line-through' }}>
              {campagne.prixOriginal} TND
            </p>
          )}
          <button style={{ marginTop: '8px', background: COLORS.primary, color: COLORS.white, border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Voir <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Mode GRID (par défaut)
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      style={{
        background: COLORS.white,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(10,10,10,0.08)',
        transition: 'all 0.3s',
        border: '1px solid ' + COLORS.grayBorder,
        cursor: 'pointer'
      }}
      onClick={() => navigate('/campagnes/' + campagne.slug)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(10,10,10,0.15)';
        e.currentTarget.style.borderColor = COLORS.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,10,10,0.08)';
        e.currentTarget.style.borderColor = COLORS.grayBorder;
      }}
    >
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img src={campagne.image} alt={campagne.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
        {remise > 0 && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: COLORS.red, color: COLORS.white, padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
            -{remise}%
          </div>
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: placesPourcentage < 30 ? COLORS.red : placesPourcentage < 60 ? '#F59E0B' : COLORS.green, color: COLORS.white, padding: '4px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} />
          {campagne.placesRestantes} places
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: COLORS.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconComponent size={22} color={COLORS.primary} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '1px' }}>Formation</span>
            <span style={{ fontSize: '0.85rem', color: COLORS.gray, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Calendar size={12} /> {campagne.date}
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.dark, marginBottom: '10px', lineHeight: 1.3 }}>
          {campagne.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: COLORS.gray, lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campagne.description}
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: COLORS.gray, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {campagne.dureeHeures}h
          </span>
          <span style={{ fontSize: '0.8rem', color: COLORS.gray, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} /> Sfax
          </span>
          <span style={{ fontSize: '0.8rem', color: COLORS.gray, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} /> {campagne.format}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {campagne.tools?.slice(0, 4).map((tool, i) => (
            <span key={i} style={{ background: COLORS.grayLight, color: COLORS.dark, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, border: '1px solid ' + COLORS.grayBorder }}>
              {tool}
            </span>
          ))}
          {campagne.tools?.length > 4 && (
            <span style={{ background: COLORS.grayLight, color: COLORS.dark, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>
              +{campagne.tools.length - 4}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {campagne.tags?.map((tag, i) => (
            <span key={i} style={{ background: COLORS.primaryLight, color: COLORS.primaryDark, padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid ' + COLORS.grayBorder }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: COLORS.gray, textDecoration: 'line-through', display: 'block' }}>
              {campagne.prixOriginal} TND
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: COLORS.primary }}>
              {campagne.prix} TND
            </span>
          </div>
          <button style={{ color: COLORS.white, background: COLORS.primary, border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s', fontSize: '0.9rem' }}>
            Voir & S'inscrire <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// STATISTIQUES EN TEMPS RÉEL
// ============================================================
const StatsBar = ({ formations, inscriptions, contacts }) => {
  const totalHeures = formations.reduce((acc, f) => acc + (f.dureeHeures || 0), 0);
  const totalPlaces = formations.reduce((acc, f) => acc + (f.placesRestantes || 0), 0);
  const totalInscrits = inscriptions?.length || 0;
  const totalContacts = contacts?.length || 0;

  const stats = [
    { label: 'Formations', value: formations.length, icon: BookOpen, color: COLORS.primary },
    { label: 'Heures de cours', value: totalHeures + 'H', icon: Clock, color: COLORS.blue },
    { label: 'Places disponibles', value: totalPlaces, icon: Users, color: COLORS.green },
    { label: 'Inscriptions', value: totalInscrits, icon: CheckCircle, color: COLORS.purple },
    { label: 'Contacts', value: totalContacts, icon: Globe, color: COLORS.red },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: COLORS.white,
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(10,10,10,0.05)',
              border: '1px solid ' + COLORS.grayBorder,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: stat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={stat.color} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: COLORS.gray, marginTop: '2px' }}>{stat.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================
// FILTRES AVANCÉS
// ============================================================
const FilterBar = ({ filtre, setFiltre, searchTerm, setSearchTerm, viewMode, setViewMode, sortBy, setSortBy }) => {
  const categories = [
    { id: 'tous', label: 'Tous', icon: Grid },
    { id: 'IA', label: 'IA', icon: Zap },
    { id: 'Marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'Design', label: 'Design', icon: Palette },
    { id: 'Web', label: 'Web', icon: Globe },
  ];

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: COLORS.gray }} />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '2px solid ' + COLORS.grayBorder, fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }}
            onFocus={(e) => e.target.style.borderColor = COLORS.primary}
            onBlur={(e) => e.target.style.borderColor = COLORS.grayBorder}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid ' + COLORS.grayBorder, fontSize: '0.95rem', background: COLORS.white, cursor: 'pointer', outline: 'none' }}
        >
          <option value="date">Trier par date</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
          <option value="places">Places disponibles</option>
        </select>

        <div style={{ display: 'flex', gap: '8px', background: COLORS.white, padding: '4px', borderRadius: '12px', border: '2px solid ' + COLORS.grayBorder }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? COLORS.primary : 'transparent', color: viewMode === 'grid' ? COLORS.white : COLORS.gray, cursor: 'pointer', transition: 'all 0.3s' }}>
            <Grid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? COLORS.primary : 'transparent', color: viewMode === 'list' ? COLORS.white : COLORS.gray, cursor: 'pointer', transition: 'all 0.3s' }}>
            <List size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFiltre(cat.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '25px',
                border: '2px solid ' + (filtre === cat.id ? COLORS.primary : COLORS.grayBorder),
                background: filtre === cat.id ? COLORS.primary : COLORS.white,
                color: filtre === cat.id ? COLORS.white : COLORS.gray,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function Campagnes() {
  const [formations, setFormations] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

  // 🔄 FETCH DEPUIS PRISMA VIA API.JS
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [formationsRes, inscriptionsRes, contactsRes] = await Promise.all([
          api.get('/api/formations'),
          api.get('/api/inscriptions').catch(() => ({ data: [] })),
          api.get('/api/contacts').catch(() => ({ data: [] }))
        ]);

        setFormations(formationsRes.data);
        setInscriptions(inscriptionsRes.data);
        setContacts(contactsRes.data);
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les données depuis le serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filtre + recherche + tri
  const formationsFiltrees = useMemo(() => {
    let result = [...formations];

    if (filtre !== 'tous') {
      result = result.filter(c => c.tags?.some(t => t.toLowerCase().includes(filtre.toLowerCase())));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.tools?.some(t => t.toLowerCase().includes(term))
      );
    }

    switch (sortBy) {
      case 'prix-asc': result.sort((a, b) => (a.prix || 0) - (b.prix || 0)); break;
      case 'prix-desc': result.sort((a, b) => (b.prix || 0) - (a.prix || 0)); break;
      case 'places': result.sort((a, b) => (b.placesRestantes || 0) - (a.placesRestantes || 0)); break;
      case 'date':
      default: result.sort((a, b) => new Date(a.dateScheduled || 0) - new Date(b.dateScheduled || 0));
    }

    return result;
  }, [formations, filtre, searchTerm, sortBy]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: COLORS.grayLight }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '4px solid ' + COLORS.grayBorder, borderTop: '4px solid ' + COLORS.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ color: COLORS.gray, fontSize: '1.1rem' }}>Chargement des formations...</p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: COLORS.grayLight, padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <AlertTriangle size={48} style={{ color: COLORS.red, marginBottom: '16px' }} />
        <p style={{ color: COLORS.red, fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>{error}</p>
        <p style={{ color: COLORS.gray, marginBottom: '24px' }}>Vérifiez que le backend est démarré</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: COLORS.grayLight }}>
      {/* Header */}
      <div style={{ background: COLORS.dark, color: COLORS.white, padding: '60px 20px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, ' + COLORS.primary + ' 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Nos <span style={{ color: COLORS.primary }}>Campagnes</span> Professionnelles
          </h1>
          <p style={{ fontSize: '1.1rem', color: COLORS.gray, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Devenez un expert du digital avec nos formations pratiques et certifiantes.
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
        <StatsBar formations={formations} inscriptions={inscriptions} contacts={contacts} />
        <FilterBar filtre={filtre} setFiltre={setFiltre} searchTerm={searchTerm} setSearchTerm={setSearchTerm} viewMode={viewMode} setViewMode={setViewMode} sortBy={sortBy} setSortBy={setSortBy} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: COLORS.gray, fontSize: '0.9rem' }}>
          <span>{formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? 's' : ''} trouvée{formationsFiltrees.length > 1 ? 's' : ''}</span>
        </div>

        <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' } : { display: 'block' }}>
          <AnimatePresence>
            {formationsFiltrees.map((campagne, index) => (
              <FormationCard key={campagne.id} campagne={campagne} index={index} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </div>

        {formationsFiltrees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Search size={48} style={{ color: COLORS.gray, marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: COLORS.gray, fontSize: '1.1rem' }}>Aucune formation ne correspond à votre recherche</p>
            <button onClick={() => { setFiltre('tous'); setSearchTerm(''); }} style={{ marginTop: '16px', padding: '10px 20px', background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}