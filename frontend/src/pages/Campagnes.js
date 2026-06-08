import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, Tag, ArrowRight, 
  Sparkles, Zap, Palette, TrendingUp, BookOpen, Award
} from 'lucide-react';

// ============================================================
// COULEURS OFFICIELLES DIGILAB SOLUTIONS
// ============================================================
const COLORS = {
  primary: '#F5A623',      // Orange/Or DigiLab (boutons, accents)
  primaryLight: '#FFF8E7', // Orange très clair (fonds)
  primaryDark: '#D48A1A',  // Orange foncé (hover)
  dark: '#0A0A0A',         // Noir profond (textes)
  darkLight: '#1A1A2E',    // Noir bleuté (header/footer)
  gray: '#666666',         // Gris moyen (textes secondaires)
  grayLight: '#F5F5F5',    // Gris très clair (fonds sections)
  grayBorder: '#E5E5E5',   // Gris bordures
  white: '#FFFFFF',        // Blanc
  green: '#10B981',        // Vert (succès, disponible)
  red: '#EF4444',          // Rouge (urgence, remise)
  blue: '#3B82F6',         // Bleu (info)
};

// ============================================================
// IMAGES DES FORMATIONS
// ============================================================
const CAMP_IMGS = {
  formation_digital_ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  formation_web: 'https://images.unsplash.com/photo-1461749280684-dccae630cd35?w=800',
  formation_design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  formation_marketing: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
};

// ============================================================
// DONNÉES DES 4 FORMATIONS
// ============================================================
const CAMPAGNES_DATA = [
  {
    id: 'formation-digital-marketing-ai',
    title: 'Formation Digital Marketing & AI',
    type: 'formation',
    description: "Maitrisez l'avenir du Marketing Digital avec l'Intelligence Artificielle ! Formation exclusive alliant les strategies de Marketing Digital incontournables et la puissance de l'IA. 100% Pratique : Apprenez en manipulant les meilleurs outils (Meta, ChatGPT, WordPress, et plus encore). Formation Certifiante : Valorisez votre profil professionnel avec un certificat reconnu.",
    duration: 'Variable selon programme',
    format: '100% Pratique · Certifiante',
    tools: ['Meta', 'ChatGPT', 'WordPress', 'Google Analytics', 'Canva'],
    contact: '+216 22 044 105',
    location: 'Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia',
    image: CAMP_IMGS.formation_digital_ai,
    date: '30 Avril 2026',
    tags: ['IA', 'Marketing Digital', 'Certifiant'],
    status: 'active',
    prix: 850,
    prixOriginal: 1200,
    placesTotal: 25,
    placesRestantes: 12,
    dureeHeures: 40,
    icon: Sparkles,
    couleur: COLORS.primary,
    prerequis: 'Aucun prerequis',
    inclus: ['Certificat reconnu', 'Support de cours', 'Acces aux outils', 'Coaching post-formation']
  },
  {
    id: 'formation-web-wordpress',
    title: 'Formation Web WordPress',
    type: 'formation',
    description: "Maitrisez le web en seulement 18 heures ! Creez votre site internet performant sans coder. Notre formation WordPress est concue pour vous donner toutes les cles en main afin de lancer votre projet professionnel. Duree : 18 heures de formation intensive.",
    duration: '18 heures',
    format: 'Intensive · Pratique',
    tools: ['WordPress', 'Elementor', 'SEO', 'WooCommerce'],
    contact: '+216 22 044 105',
    location: 'Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia',
    image: CAMP_IMGS.formation_web,
    date: '8 Avril 2026',
    tags: ['WordPress', 'Web', 'Site Pro'],
    status: 'active',
    prix: 450,
    prixOriginal: 650,
    placesTotal: 20,
    placesRestantes: 8,
    dureeHeures: 18,
    icon: Zap,
    couleur: COLORS.primary,
    prerequis: 'Ordinateur portable',
    inclus: ['Certificat', 'Theme premium', 'Hebergement 1 an', 'Support technique']
  },
  {
    id: 'formation-design-graphique-marketing',
    title: 'Formation Design Graphique & Marketing Digital',
    type: 'formation',
    description: "Boostez votre carriere avec DigiLab Solutions ! Formation intensive de 60H en Design Graphique et Marketing Digital. 100% Pratique : Apprenez en faisant. Flexibilite : Des cours programmes le week-end pour s'adapter a votre emploi du temps.",
    duration: '60 heures',
    format: 'Week-end · 100% Pratique',
    tools: ['Photoshop', 'Illustrator', 'Canva', 'Meta Ads', 'Google Ads'],
    contact: '+216 22 044 105',
    location: 'Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia',
    image: CAMP_IMGS.formation_design,
    date: '3 Avril 2026',
    tags: ['Design', 'Graphisme', 'Marketing'],
    status: 'active',
    prix: 1200,
    prixOriginal: 1500,
    placesTotal: 15,
    placesRestantes: 5,
    dureeHeures: 60,
    icon: Palette,
    couleur: COLORS.primary,
    prerequis: 'Ordinateur avec 8GB RAM',
    inclus: ['Certificat', 'Pack Adobe', 'Portfolio guide', 'Stage pratique']
  },
  {
    id: 'formation-marketing-digital-40h',
    title: 'Formation Marketing Digital 40H',
    type: 'formation',
    description: "40H pour devenir un pro du Digital ! Maitrisez l'ecosysteme du web. Formation complete et pratique pour dompter les algorithmes et booster votre visibilite. Meta, Google Ads, SEO, WordPress et bien plus encore.",
    duration: '40 heures',
    format: 'Intensive · Complet',
    tools: ['Meta', 'Google Ads', 'SEO', 'WordPress', 'Growth Hacking'],
    contact: '+216 22 044 105',
    location: 'Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia',
    image: CAMP_IMGS.formation_marketing,
    date: '27 Mars 2026',
    tags: ['SEO', 'Google Ads', 'Growth Hacking'],
    status: 'active',
    prix: 950,
    prixOriginal: 1200,
    placesTotal: 30,
    placesRestantes: 18,
    dureeHeures: 40,
    icon: TrendingUp,
    couleur: COLORS.primary,
    prerequis: 'Connaissances de base en informatique',
    inclus: ['Certificat', 'Outils premium', 'Communaute privee', 'Mentorat 3 mois']
  }
];

// ============================================================
// COMPOSANT CARTE DE FORMATION
// ============================================================
const FormationCard = ({ campagne, index }) => {
  const navigate = useNavigate();
  const IconComponent = campagne.icon;
  const remise = Math.round(((campagne.prixOriginal - campagne.prix) / campagne.prixOriginal) * 100);
  const placesPourcentage = (campagne.placesRestantes / campagne.placesTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="formation-card"
    >
      <div className="card-image-wrapper">
        <img src={campagne.image} alt={campagne.title} className="card-image" />
        <div className="card-badge-remise">-{remise}%</div>
        <div className="card-badge-places" style={{ 
          background: placesPourcentage < 30 ? COLORS.red : placesPourcentage < 60 ? '#F59E0B' : COLORS.green 
        }}>
          <Users size={12} />
          {campagne.placesRestantes} places restantes
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <div className="card-icon" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
            <IconComponent size={22} />
          </div>
          <div className="card-meta">
            <span className="card-type">Formation</span>
            <span className="card-date"><Calendar size={12} /> {campagne.date}</span>
          </div>
        </div>

        <h3 className="card-title">{campagne.title}</h3>
        <p className="card-description">{campagne.description.substring(0, 140)}...</p>

        <div className="card-details">
          <span className="detail-item"><Clock size={14} /> {campagne.dureeHeures}h</span>
          <span className="detail-item"><MapPin size={14} /> Sfax</span>
          <span className="detail-item"><BookOpen size={14} /> {campagne.format}</span>
        </div>

        <div className="card-tools">
          {campagne.tools.slice(0, 4).map((tool, i) => (
            <span key={i} className="tool-tag">{tool}</span>
          ))}
          {campagne.tools.length > 4 && <span className="tool-tag">+{campagne.tools.length - 4}</span>}
        </div>

        <div className="card-tags">
          {campagne.tags.map((tag, i) => (
            <span key={i} className="tag-item"><Tag size={10} /> {tag}</span>
          ))}
        </div>

        <div className="card-footer">
          <div className="card-prix">
            <span className="prix-original">{campagne.prixOriginal} TND</span>
            <span className="prix-actuel" style={{ color: COLORS.primary }}>{campagne.prix} TND</span>
          </div>
          <button 
            className="btn-inscrire"
            onClick={() => navigate('/campagnes/' + campagne.id)}
          >
            Voir & S'inscrire <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// PAGE PRINCIPALE : CAMPAGNES
// ============================================================
export default function Campagnes() {
  const [filtre, setFiltre] = useState('tous');

  const formationsFiltrees = filtre === 'tous' 
    ? CAMPAGNES_DATA 
    : CAMPAGNES_DATA.filter(c => c.tags.some(t => t.toLowerCase().includes(filtre.toLowerCase())));

  return (
    <div className="campagnes-page">
      <style>{`
        .campagnes-page { min-height: 100vh; background: ${COLORS.grayLight}; padding: 40px 20px; }
        .campagnes-container { max-width: 1280px; margin: 0 auto; }

        .page-header { text-align: center; margin-bottom: 50px; }
        .page-header h1 { font-size: 2.5rem; font-weight: 800; color: ${COLORS.dark}; margin-bottom: 12px; }
        .page-header p { font-size: 1.1rem; color: ${COLORS.gray}; max-width: 600px; margin: 0 auto; }
        .page-header .highlight { color: ${COLORS.primary}; }

        .filtres { display: flex; gap: 10px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
        .filtre-btn { padding: 8px 20px; border-radius: 25px; border: 2px solid ${COLORS.grayBorder}; background: ${COLORS.white}; color: ${COLORS.gray}; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .filtre-btn:hover, .filtre-btn.actif { background: ${COLORS.primary}; color: ${COLORS.white}; border-color: ${COLORS.primary}; }

        .formations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 30px; }

        .formation-card { background: ${COLORS.white}; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(10,10,10,0.08); transition: all 0.3s; border: 1px solid ${COLORS.grayBorder}; }
        .formation-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(10,10,10,0.15); border-color: ${COLORS.primary}; }

        .card-image-wrapper { position: relative; height: 200px; overflow: hidden; }
        .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .formation-card:hover .card-image { transform: scale(1.05); }
        .card-badge-remise { position: absolute; top: 12px; left: 12px; background: ${COLORS.red}; color: ${COLORS.white}; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }
        .card-badge-places { position: absolute; top: 12px; right: 12px; color: ${COLORS.white}; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }

        .card-content { padding: 24px; }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .card-meta { display: flex; flex-direction: column; }
        .card-type { font-size: 0.75rem; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px; }
        .card-date { font-size: 0.85rem; color: ${COLORS.gray}; display: flex; align-items: center; gap: 4px; }

        .card-title { font-size: 1.2rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 10px; line-height: 1.3; }
        .card-description { font-size: 0.9rem; color: ${COLORS.gray}; line-height: 1.5; margin-bottom: 16px; }

        .card-details { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
        .detail-item { font-size: 0.8rem; color: ${COLORS.gray}; display: flex; align-items: center; gap: 4px; }

        .card-tools { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .tool-tag { background: ${COLORS.grayLight}; color: ${COLORS.dark}; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; border: 1px solid ${COLORS.grayBorder}; }

        .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
        .tag-item { background: ${COLORS.primaryLight}; color: ${COLORS.primaryDark}; padding: 3px 10px; border-radius: 15px; font-size: 0.75rem; display: flex; align-items: center; gap: 3px; font-weight: 500; }

        .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid ${COLORS.grayBorder}; }
        .card-prix { display: flex; flex-direction: column; }
        .prix-original { font-size: 0.85rem; color: ${COLORS.gray}; text-decoration: line-through; }
        .prix-actuel { font-size: 1.4rem; font-weight: 800; }
        .btn-inscrire { color: ${COLORS.white}; background: ${COLORS.primary}; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.3s; font-size: 0.9rem; }
        .btn-inscrire:hover { background: ${COLORS.primaryDark}; transform: scale(1.05); }

        .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: ${COLORS.white}; padding: 24px; border-radius: 16px; text-align: center; box-shadow: 0 2px 10px rgba(10,10,10,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .stat-number { font-size: 2rem; font-weight: 800; color: ${COLORS.primary}; }
        .stat-label { font-size: 0.9rem; color: ${COLORS.gray}; margin-top: 4px; }

        @media (max-width: 768px) {
          .formations-grid { grid-template-columns: 1fr; }
          .page-header h1 { font-size: 1.8rem; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="campagnes-container">
        <div className="page-header">
          <h1>Nos <span className="highlight">Formations</span> Professionnelles</h1>
          <p>Devenez un expert du digital avec nos formations pratiques et certifiantes. 100% orientees metier.</p>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Formations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">158H</div>
            <div className="stat-label">Heures de cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">90+</div>
            <div className="stat-label">Places disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Pratique</div>
          </div>
        </div>

        <div className="filtres">
          <button className={"filtre-btn " + (filtre === 'tous' ? 'actif' : '')} onClick={() => setFiltre('tous')}>Tous</button>
          <button className={"filtre-btn " + (filtre === 'IA' ? 'actif' : '')} onClick={() => setFiltre('IA')}>IA</button>
          <button className={"filtre-btn " + (filtre === 'Marketing' ? 'actif' : '')} onClick={() => setFiltre('Marketing')}>Marketing</button>
          <button className={"filtre-btn " + (filtre === 'Design' ? 'actif' : '')} onClick={() => setFiltre('Design')}>Design</button>
          <button className={"filtre-btn " + (filtre === 'Web' ? 'actif' : '')} onClick={() => setFiltre('Web')}>Web</button>
        </div>

        <div className="formations-grid">
          <AnimatePresence>
            {formationsFiltrees.map((campagne, index) => (
              <FormationCard key={campagne.id} campagne={campagne} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}