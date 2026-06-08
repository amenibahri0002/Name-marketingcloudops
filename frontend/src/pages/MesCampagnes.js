import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, MapPin, CheckCircle, Award, 
  Download, ChevronRight, BookOpen, TrendingUp, Star, 
  AlertCircle, Sparkles, Zap, Palette, PlayCircle, Users
} from 'lucide-react';
import SidebarClient from '../components/SidebarClient';

const COLORS = {
  primary: '#F5A623',
  primaryLight: '#FFF8E7',
  primaryDark: '#D48A1A',
  dark: '#0A0A0A',
  gray: '#666666',
  grayLight: '#F5F5F5',
  grayBorder: '#E5E5E5',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
};

const CAMPAGNES_DATA = [
  {
    id: 'formation-digital-marketing-ai',
    title: 'Formation Digital Marketing & AI',
    description: "Maîtrisez l'avenir du Marketing Digital avec l'Intelligence Artificielle ! Formation exclusive alliant les stratégies de Marketing Digital incontournables et la puissance de l'IA.",
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    date: '30 Avril 2026',
    dureeHeures: 40,
    prix: 850,
    status: 'en_cours',
    progress: 65,
    formateur: 'Expert certifié en IA & Marketing',
    certificat: false,
    icon: Sparkles,
    couleur: COLORS.primary,
    tags: ['IA', 'Marketing Digital', 'Certifiant']
  },
  {
    id: 'formation-web-wordpress',
    title: 'Formation Web WordPress',
    description: "Maîtrisez le web en seulement 18 heures ! Créez votre site internet performant sans coder. Formation intensive et pratique.",
    image: 'https://images.unsplash.com/photo-1461749280684-dccae630cd35?w=800',
    date: '8 Avril 2026',
    dureeHeures: 18,
    prix: 450,
    status: 'terminee',
    progress: 100,
    formateur: 'Développeur Web & Expert WordPress',
    certificat: true,
    icon: Zap,
    couleur: COLORS.blue,
    tags: ['WordPress', 'Web', 'Site Pro']
  },
  {
    id: 'formation-design-graphique-marketing',
    title: 'Formation Design Graphique & Marketing Digital',
    description: "Boostez votre carrière avec DigiLab Solutions ! Formation intensive de 60H en Design Graphique et Marketing Digital. 100% Pratique.",
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    date: '3 Avril 2026',
    dureeHeures: 60,
    prix: 1200,
    status: 'en_cours',
    progress: 30,
    formateur: 'Designer Graphique & Directeur Artistique',
    certificat: false,
    icon: Palette,
    couleur: '#EC4899',
    tags: ['Design', 'Graphisme', 'Marketing']
  }
];

const FormationCard = ({ formation, index }) => {
  const navigate = useNavigate();
  const IconComponent = formation.icon;
  const isTerminee = formation.status === 'terminee';
  const isEnCours = formation.status === 'en_cours';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="formation-card"
    >
      <div className="card-image-wrapper">
        <img src={formation.image} alt={formation.title} className="card-image" />
        <div className="card-status-badge" style={{ 
          background: isTerminee ? COLORS.green : COLORS.primary,
          color: COLORS.white
        }}>
          {isTerminee ? <CheckCircle size={14} /> : <Clock size={14} />}
          {isTerminee ? 'Terminée' : 'En cours'}
        </div>

        {formation.certificat && (
          <div className="card-cert-badge">
            <Award size={14} /> Certificat
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <div className="card-icon" style={{ background: formation.couleur + '15', color: formation.couleur }}>
            <IconComponent size={20} />
          </div>
          <div className="card-tags">
            {formation.tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <h3 className="card-title">{formation.title}</h3>
        <p className="card-description">{formation.description.substring(0, 100)}...</p>

        <div className="card-meta">
          <span><Calendar size={14} /> {formation.date}</span>
          <span><Clock size={14} /> {formation.dureeHeures}h</span>
          <span><MapPin size={14} /> Sfax</span>
        </div>

        <div className="card-formateur">
          <Users size={12} /> Formateur : {formation.formateur}
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>Progression</span>
            <span>{formation.progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: formation.progress + '%' }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ background: isTerminee ? COLORS.green : COLORS.primary }}
            />
          </div>
        </div>

        <div className="card-footer">
          <div className="card-prix">{formation.prix} TND</div>
          <div className="card-actions">
            {formation.certificat && (
              <button className="btn-certificat" onClick={() => alert('Téléchargement du certificat...')}>
                <Download size={14} /> Certificat
              </button>
            )}
            <button 
              className="btn-voir"
              onClick={() => navigate('/campagnes/' + formation.id)}
            >
              Voir <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MesCampagnes() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState(CAMPAGNES_DATA);
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userName = localStorage.getItem('userName') || 'Client';
  const initiale = userName[0]?.toUpperCase() || 'C';

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const formationsFiltrees = filtre === 'tous' 
    ? formations 
    : formations.filter(f => f.status === filtre);

  const terminees = formations.filter(f => f.status === 'terminee').length;
  const enCours = formations.filter(f => f.status === 'en_cours').length;
  const certificats = formations.filter(f => f.certificat).length;
  const totalHeures = formations.reduce((sum, f) => sum + f.dureeHeures, 0);

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper {
          display: flex;
          min-height: 100vh;
          background: ${COLORS.grayLight};
          font-family: 'Inter', 'DM Sans', sans-serif;
        }

        .main-content-area {
          flex: 1;
          margin-left: 0px;
          min-height: 100vh;
          background: ${COLORS.grayLight};
        }

        @media (max-width: 1024px) {
          .main-content-area { margin-left: 0; }
        }

        /* CONTENEUR CENTRÉ avec marges égales */
        .page-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 60px;
        }

        @media (max-width: 1200px) {
          .page-container { padding: 40px 40px; }
        }
        @media (max-width: 768px) {
          .page-container { padding: 20px 20px; }
        }

        /* HEADER */
        .page-header-section {
          text-align: center;
          margin-bottom: 50px;
        }

        .back-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${COLORS.gray};
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          margin-bottom: 20px;
          transition: color 0.3s;
        }
        .back-nav:hover { color: ${COLORS.dark}; }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 30px;
        }
        .welcome-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${COLORS.primary}, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
        }
        .welcome-text h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: ${COLORS.dark};
          margin-bottom: 12px;
        }
        .welcome-text p {
          font-size: 1.1rem;
          color: ${COLORS.gray};
          max-width: 600px;
          margin: 0 auto;
        }
        .welcome-text .highlight {
          color: ${COLORS.primary};
        }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 50px;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }
        .stat-card {
          background: ${COLORS.white};
          border: 1px solid ${COLORS.grayBorder};
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .stat-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: ${COLORS.primary};
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 0.9rem;
          color: ${COLORS.gray};
        }

        /* FILTRES */
        .filters-section {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .filter-tabs {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .filter-tab {
          padding: 10px 20px;
          border-radius: 25px;
          border: 2px solid ${COLORS.grayBorder};
          background: ${COLORS.white};
          color: ${COLORS.gray};
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-tab:hover {
          border-color: ${COLORS.primary};
          color: ${COLORS.primary};
        }
        .filter-tab.active {
          background: ${COLORS.primary};
          color: ${COLORS.white};
          border-color: ${COLORS.primary};
        }
        .filter-badge {
          background: ${COLORS.grayLight};
          color: ${COLORS.dark};
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .filter-tab.active .filter-badge {
          background: rgba(0,0,0,0.15);
          color: ${COLORS.white};
        }

        .total-heures {
          font-size: 0.9rem;
          color: ${COLORS.gray};
          text-align: center;
          margin-bottom: 30px;
        }

        /* GRID - centrée avec max-width */
        .formations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 30px;
          justify-content: center;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* CARD */
        .formation-card {
          background: ${COLORS.white};
          border: 1px solid ${COLORS.grayBorder};
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .formation-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border-color: ${COLORS.primary}40;
        }

        .card-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .formation-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-status-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-cert-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: ${COLORS.green};
          color: ${COLORS.white};
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-content {
          padding: 24px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .card-tags .tag {
          background: ${COLORS.primaryLight};
          color: ${COLORS.primaryDark};
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: ${COLORS.dark};
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .card-description {
          font-size: 0.9rem;
          color: ${COLORS.gray};
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .card-meta span {
          font-size: 0.85rem;
          color: ${COLORS.gray};
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-formateur {
          font-size: 0.85rem;
          color: ${COLORS.gray};
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        /* PROGRESS */
        .progress-section {
          margin-bottom: 18px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: ${COLORS.gray};
          margin-bottom: 8px;
        }
        .progress-bar-bg {
          height: 8px;
          background: ${COLORS.grayLight};
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }

        /* FOOTER CARD */
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid ${COLORS.grayBorder};
        }
        .card-prix {
          font-size: 1.4rem;
          font-weight: 800;
          color: ${COLORS.primary};
        }
        .card-actions {
          display: flex;
          gap: 10px;
        }
        .btn-certificat {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: ${COLORS.green}15;
          border: 1px solid ${COLORS.green}40;
          color: ${COLORS.green};
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-certificat:hover {
          background: ${COLORS.green}25;
        }
        .btn-voir {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: ${COLORS.primary};
          color: ${COLORS.white};
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-voir:hover {
          background: ${COLORS.primaryDark};
          transform: scale(1.05);
        }

        /* EMPTY STATE */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.3;
        }
        .empty-state h3 {
          font-size: 1.3rem;
          color: ${COLORS.dark};
          margin-bottom: 8px;
        }
        .empty-state p {
          color: ${COLORS.gray};
          margin-bottom: 24px;
        }
        .btn-explorer {
          padding: 12px 28px;
          background: ${COLORS.primary};
          color: ${COLORS.white};
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-explorer:hover {
          background: ${COLORS.primaryDark};
          transform: translateY(-2px);
        }

        /* LOADING */
        .loading-state {
          text-align: center;
          padding: 100px 20px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${COLORS.grayBorder};
          border-top: 3px solid ${COLORS.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .formations-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .page-container {
            padding: 20px 20px;
          }
          .welcome-text h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <SidebarClient />

      <div className="main-content-area">
        <div className="page-container">
          {/* HEADER CENTRÉ */}
          <div className="page-header-section">
            <button className="back-nav" onClick={() => navigate('/campagnes')}>
              <ArrowLeft size={18} /> Retour aux formations
            </button>

            <div className="welcome-section">
              <div className="welcome-avatar">{initiale}</div>
              <div className="welcome-text">
                <h1>Mes <span className="highlight">Inscriptions</span></h1>
                <p>Suivez votre progression et accédez à vos formations</p>
              </div>
            </div>
          </div>

          {/* STATS CENTRÉES */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
                <BookOpen size={22} />
              </div>
              <div className="stat-number">{formations.length}</div>
              <div className="stat-label">Formations</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: COLORS.green + '15', color: COLORS.green }}>
                <CheckCircle size={22} />
              </div>
              <div className="stat-number">{terminees}</div>
              <div className="stat-label">Terminées</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: COLORS.blue + '15', color: COLORS.blue }}>
                <Clock size={22} />
              </div>
              <div className="stat-number">{enCours}</div>
              <div className="stat-label">En cours</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: '#EC4899' + '15', color: '#EC4899' }}>
                <Award size={22} />
              </div>
              <div className="stat-number">{certificats}</div>
              <div className="stat-label">Certificats</div>
            </div>
          </div>

          {/* FILTRES CENTRÉS */}
          <div className="filters-section">
            <div className="filter-tabs">
              <button 
                className={"filter-tab " + (filtre === 'tous' ? 'active' : '')}
                onClick={() => setFiltre('tous')}
              >
                Toutes <span className="filter-badge">{formations.length}</span>
              </button>
              <button 
                className={"filter-tab " + (filtre === 'en_cours' ? 'active' : '')}
                onClick={() => setFiltre('en_cours')}
              >
                <Clock size={14} /> En cours <span className="filter-badge">{enCours}</span>
              </button>
              <button 
                className={"filter-tab " + (filtre === 'terminee' ? 'active' : '')}
                onClick={() => setFiltre('terminee')}
              >
                <CheckCircle size={14} /> Terminées <span className="filter-badge">{terminees}</span>
              </button>
            </div>
          </div>

          <div className="total-heures">
            {totalHeures} heures de formation au total
          </div>

          {/* GRID */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p style={{ color: COLORS.gray }}>Chargement de vos formations...</p>
            </div>
          ) : formationsFiltrees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>Aucune formation</h3>
              <p>Vous n'avez pas encore d'inscription active.</p>
              <button className="btn-explorer" onClick={() => navigate('/campagnes')}>
                Découvrir les formations →
              </button>
            </div>
          ) : (
            <div className="formations-grid">
              <AnimatePresence>
                {formationsFiltrees.map((formation, index) => (
                  <FormationCard key={formation.id} formation={formation} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}