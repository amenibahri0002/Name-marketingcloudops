import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Award, Download, CheckCircle, Calendar, 
  Sparkles, Zap, Palette, TrendingUp, Share2, Printer
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

const CERTIFICATS_DATA = [
  {
    id: 'cert-001',
    formation: 'Formation Web WordPress',
    formateur: 'Développeur Web & Expert WordPress',
    date: '8 Avril 2026',
    duree: '18 heures',
    icon: Zap,
    couleur: COLORS.blue,
    numero: 'DL-2026-001',
    status: 'disponible'
  },
  {
    id: 'cert-002',
    formation: 'Formation Digital Marketing & AI',
    formateur: 'Expert certifié en IA & Marketing',
    date: '30 Avril 2026',
    duree: '40 heures',
    icon: Sparkles,
    couleur: COLORS.primary,
    numero: 'DL-2026-002',
    status: 'en_attente'
  }
];

const CertificatCard = ({ certificat, index }) => {
  const IconComponent = certificat.icon;
  const isDisponible = certificat.status === 'disponible';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="certificat-card"
    >
      <div className="cert-header" style={{ borderColor: certificat.couleur }}>
        <div className="cert-icon" style={{ background: certificat.couleur + '15', color: certificat.couleur }}>
          <IconComponent size={28} />
        </div>
        <div className="cert-status" style={{ 
          background: isDisponible ? COLORS.green + '15' : COLORS.grayLight,
          color: isDisponible ? COLORS.green : COLORS.gray,
          border: `1px solid ${isDisponible ? COLORS.green + '40' : COLORS.grayBorder}`
        }}>
          {isDisponible ? <CheckCircle size={14} /> : <Calendar size={14} />}
          {isDisponible ? 'Disponible' : 'En attente'}
        </div>
      </div>

      <div className="cert-content">
        <h3 className="cert-title">{certificat.formation}</h3>
        <p className="cert-formateur">Formateur : {certificat.formateur}</p>

        <div className="cert-details">
          <div className="cert-detail">
            <span className="cert-label">Numéro</span>
            <span className="cert-value">{certificat.numero}</span>
          </div>
          <div className="cert-detail">
            <span className="cert-label">Date</span>
            <span className="cert-value">{certificat.date}</span>
          </div>
          <div className="cert-detail">
            <span className="cert-label">Durée</span>
            <span className="cert-value">{certificat.duree}</span>
          </div>
        </div>

        {isDisponible && (
          <div className="cert-actions">
            <button className="btn-download" onClick={() => alert('Téléchargement du certificat...')}>
              <Download size={16} /> Télécharger PDF
            </button>
            <button className="btn-share" onClick={() => alert('Partage du certificat...')}>
              <Share2 size={16} />
            </button>
            <button className="btn-print" onClick={() => alert('Impression du certificat...')}>
              <Printer size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function Certificats() {
  const navigate = useNavigate();
  const [certificats, setCertificats] = useState(CERTIFICATS_DATA);
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

  const disponibles = certificats.filter(c => c.status === 'disponible').length;
  const enAttente = certificats.filter(c => c.status === 'en_attente').length;

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
          display: flex; align-items: center; gap: 8px;
          color: ${COLORS.gray}; background: none; border: none;
          cursor: pointer; font-size: 0.95rem; margin-bottom: 20px;
          transition: color 0.3s;
        }
        .back-nav:hover { color: ${COLORS.dark}; }

        .welcome-section {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-bottom: 30px;
        }
        .welcome-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, ${COLORS.primary}, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: #fff;
        }
        .welcome-text h1 {
          font-size: 2.5rem; font-weight: 800; color: ${COLORS.dark}; margin-bottom: 12px;
        }
        .welcome-text p {
          font-size: 1.1rem; color: ${COLORS.gray}; max-width: 600px; margin: 0 auto;
        }
        .welcome-text .highlight { color: ${COLORS.primary}; }

        /* STATS */
        .stats-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
          margin-bottom: 50px; max-width: 600px; margin-left: auto; margin-right: auto;
        }
        .stat-card {
          background: ${COLORS.white}; border: 1px solid ${COLORS.grayBorder};
          border-radius: 16px; padding: 24px; text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .stat-icon-box {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .stat-number { font-size: 2rem; font-weight: 800; color: ${COLORS.primary}; margin-bottom: 4px; }
        .stat-label { font-size: 0.9rem; color: ${COLORS.gray}; }

        /* GRID */
        .certificats-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 30px; justify-content: center; max-width: 1000px; margin: 0 auto;
        }

        /* CARD */
        .certificat-card {
          background: ${COLORS.white}; border: 1px solid ${COLORS.grayBorder};
          border-radius: 20px; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .certificat-card:hover {
          transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border-color: ${COLORS.primary}40;
        }

        .cert-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 24px 0; border-bottom: 3px solid; margin-bottom: 20px;
        }
        .cert-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .cert-status {
          padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }

        .cert-content { padding: 0 24px 24px; }
        .cert-title { font-size: 1.2rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 8px; }
        .cert-formateur { font-size: 0.9rem; color: ${COLORS.gray}; margin-bottom: 20px; }

        .cert-details {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
          margin-bottom: 24px; padding: 16px; background: ${COLORS.grayLight};
          border-radius: 12px;
        }
        .cert-detail { text-align: center; }
        .cert-label { font-size: 0.75rem; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 0.5px; }
        .cert-value { font-size: 0.95rem; font-weight: 600; color: ${COLORS.dark}; margin-top: 4px; }

        .cert-actions {
          display: flex; gap: 10px;
        }
        .btn-download {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; background: ${COLORS.primary}; color: ${COLORS.white};
          border: none; border-radius: 12px; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-download:hover { background: ${COLORS.primaryDark}; transform: scale(1.02); }
        .btn-share, .btn-print {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          background: ${COLORS.grayLight}; border: 1px solid ${COLORS.grayBorder};
          border-radius: 12px; color: ${COLORS.gray}; cursor: pointer; transition: all 0.3s;
        }
        .btn-share:hover, .btn-print:hover {
          background: ${COLORS.primaryLight}; border-color: ${COLORS.primary}; color: ${COLORS.primary};
        }

        /* EMPTY STATE */
        .empty-state { text-align: center; padding: 80px 20px; }
        .empty-state-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.3; }
        .empty-state h3 { font-size: 1.3rem; color: ${COLORS.dark}; margin-bottom: 8px; }
        .empty-state p { color: ${COLORS.gray}; margin-bottom: 24px; }
        .btn-explorer {
          padding: 12px 28px; background: ${COLORS.primary}; color: ${COLORS.white};
          border: none; border-radius: 12px; font-weight: 700; font-size: 0.95rem;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-explorer:hover { background: ${COLORS.primaryDark}; transform: translateY(-2px); }

        /* LOADING */
        .loading-state { text-align: center; padding: 100px 20px; }
        .spinner {
          width: 40px; height: 40px; border: 3px solid ${COLORS.grayBorder};
          border-top: 3px solid ${COLORS.primary}; border-radius: 50%;
          animation: spin 1s linear infinite; margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .certificats-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
          .cert-details { grid-template-columns: 1fr; }
        }
      `}</style>

      <SidebarClient />

      <div className="main-content-area">
        <div className="page-container">
          {/* HEADER */}
          <div className="page-header-section">
            <button className="back-nav" onClick={() => navigate('/campagnes')}>
              <ArrowLeft size={18} /> Retour aux formations
            </button>

            <div className="welcome-section">
              <div className="welcome-avatar">{initiale}</div>
              <div className="welcome-text">
                <h1>Mes <span className="highlight">Certificats</span></h1>
                <p>Téléchargez vos certificats de formation</p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: COLORS.green + '15', color: COLORS.green }}>
                <CheckCircle size={22} />
              </div>
              <div className="stat-number">{disponibles}</div>
              <div className="stat-label">Disponibles</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-box" style={{ background: COLORS.blue + '15', color: COLORS.blue }}>
                <Calendar size={22} />
              </div>
              <div className="stat-number">{enAttente}</div>
              <div className="stat-label">En attente</div>
            </div>
          </div>

          {/* GRID */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p style={{ color: COLORS.gray }}>Chargement de vos certificats...</p>
            </div>
          ) : certificats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>Aucun certificat</h3>
              <p>Vous n'avez pas encore de certificat disponible.</p>
              <button className="btn-explorer" onClick={() => navigate('/campagnes')}>
                Découvrir les formations →
              </button>
            </div>
          ) : (
            <div className="certificats-grid">
              <AnimatePresence>
                {certificats.map((certificat, index) => (
                  <CertificatCard key={certificat.id} certificat={certificat} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}