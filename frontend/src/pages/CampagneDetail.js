import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, Tag, CheckCircle, 
  CreditCard, Building2, Truck, Timer, Download, Mail, Phone,
  Sparkles, Zap, Palette, TrendingUp, BookOpen, Award, Shield,
  ChevronRight, AlertCircle, FileText, Printer, Send
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
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
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
    inclus: ['Certificat reconnu', 'Support de cours', 'Acces aux outils', 'Coaching post-formation'],
    formateur: 'Expert certifie en IA & Marketing Digital',
    programme: [
      'Introduction au Marketing Digital & IA',
      'Strategie Meta Ads avancee',
      'ChatGPT & outils IA pour le marketing',
      'SEO & Google Analytics',
      'Creation de contenu avec Canva & IA',
      'WordPress & automatisation',
      'Projet final & certification'
    ]
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
    image: 'https://images.unsplash.com/photo-1461749280684-dccae630cd35?w=1200',
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
    inclus: ['Certificat', 'Theme premium', 'Hebergement 1 an', 'Support technique'],
    formateur: 'Developpeur Web & Expert WordPress',
    programme: [
      'Introduction a WordPress',
      'Installation & configuration',
      'Creation avec Elementor',
      'SEO pour WordPress',
      'E-commerce avec WooCommerce',
      'Securite & maintenance',
      'Mise en ligne du projet'
    ]
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
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
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
    inclus: ['Certificat', 'Pack Adobe', 'Portfolio guide', 'Stage pratique'],
    formateur: 'Designer Graphique & Directeur Artistique',
    programme: [
      'Fondamentaux du design graphique',
      'Photoshop avance',
      'Illustrator & vectoriel',
      'Canva & design social media',
      'Meta Ads & creation visuelle',
      'Google Ads & bannieres',
      'Portfolio & certification'
    ]
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
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200',
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
    inclus: ['Certificat', 'Outils premium', 'Communaute privee', 'Mentorat 3 mois'],
    formateur: 'Consultant Marketing Digital Senior',
    programme: [
      'Ecosysteme du Marketing Digital',
      'SEO & referencement naturel',
      'Google Ads & campagnes avancees',
      'Meta Ads & strategie social',
      'WordPress & content marketing',
      'Growth Hacking & analytics',
      'Projet final & certification'
    ]
  }
];

// ============================================================
// DONNÉES DIGILAB (pour facture)
// ============================================================
const DIGILAB_INFO = {
  nom: 'DigiLab Solutions',
  adresse: 'Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2',
  ville: 'Sfax, Tunisia',
  mf: 'MF: 1234567/A/M/000',
  rc: 'RC: B12345672020',
  telephone: '+216 22 044 105',
  email: 'contact@digilab-solutions.tn',
  iban: 'TN59 1234 5678 9012 3456 7890'
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function CampagneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etape, setEtape] = useState(1);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', entreprise: '' });
  const [modePaiement, setModePaiement] = useState('carte');
  const [carteData, setCarteData] = useState({ numero: '', expiration: '', cvc: '', titulaire: '' });
  const [inscriptionTerminee, setInscriptionTerminee] = useState(false);
  const [numeroFacture, setNumeroFacture] = useState('');
  const [emailEnvoye, setEmailEnvoye] = useState(false);
  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    const found = CAMPAGNES_DATA.find(c => c.id === id);
    if (found) {
      setCampagne(found);
    }
    setLoading(false);
  }, [id]);

  const validerEtape1 = () => {
    const errs = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formData.prenom.trim()) errs.prenom = 'Le prenom est obligatoire';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Email invalide';
    if (!formData.telephone.trim() || formData.telephone.length < 8) errs.telephone = 'Telephone invalide';
    setErreurs(errs);
    return Object.keys(errs).length === 0;
  };

  const validerEtape2 = () => {
    if (modePaiement === 'carte') {
      const errs = {};
      if (!carteData.numero.trim() || carteData.numero.length < 16) errs.numero = 'Numero invalide';
      if (!carteData.expiration.trim()) errs.expiration = 'Date invalide';
      if (!carteData.cvc.trim() || carteData.cvc.length < 3) errs.cvc = 'CVC invalide';
      if (!carteData.titulaire.trim()) errs.titulaire = 'Titulaire obligatoire';
      setErreurs(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const genererFacture = () => {
    const factureId = 'INV-' + Date.now();
    setNumeroFacture(factureId);

    const tva = campagne.prix * 0.19;
    const total = campagne.prix + tva;
    const remise = campagne.prixOriginal - campagne.prix;
    const dateNow = new Date().toLocaleDateString('fr-FR');

    const factureHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Facture ${factureId}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  .header { border-bottom: 3px solid ${COLORS.primary}; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: ${COLORS.primary}; margin: 0; font-size: 28px; }
  .header p { margin: 5px 0; color: #666; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
  .info-box { background: ${COLORS.grayLight}; padding: 15px; border-radius: 8px; }
  .info-box h3 { margin-top: 0; color: ${COLORS.primary}; font-size: 14px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: ${COLORS.primary}; color: white; padding: 12px; text-align: left; }
  td { padding: 12px; border-bottom: 1px solid ${COLORS.grayBorder}; }
  .total-row { font-weight: bold; background: ${COLORS.grayLight}; }
  .grand-total { font-size: 18px; color: ${COLORS.primary}; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid ${COLORS.grayBorder}; text-align: center; color: ${COLORS.gray}; font-size: 12px; }
  .badge { display: inline-block; background: ${COLORS.green}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  .remise { color: ${COLORS.red}; }
</style>
</head>
<body>
  <div class="header">
    <h1>FACTURE</h1>
    <p><strong>N° ${factureId}</strong></p>
    <p>Date : ${dateNow}</p>
    <span class="badge">PAYEE</span>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Émetteur</h3>
      <p><strong>${DIGILAB_INFO.nom}</strong></p>
      <p>${DIGILAB_INFO.adresse}</p>
      <p>${DIGILAB_INFO.ville}</p>
      <p>${DIGILAB_INFO.mf}</p>
      <p>${DIGILAB_INFO.rc}</p>
      <p>Tel: ${DIGILAB_INFO.telephone}</p>
    </div>
    <div class="info-box">
      <h3>Client</h3>
      <p><strong>${formData.prenom} ${formData.nom}</strong></p>
      <p>Email: ${formData.email}</p>
      <p>Tel: ${formData.telephone}</p>
      ${formData.entreprise ? '<p>Entreprise: ' + formData.entreprise + '</p>' : ''}
    </div>
  </div>

  <h3 style="color:${COLORS.primary}">Détail de la formation</h3>
  <table>
    <tr>
      <th>Description</th>
      <th>Durée</th>
      <th>Prix unitaire</th>
      <th>Total</th>
    </tr>
    <tr>
      <td><strong>${campagne.title}</strong><br><small>${campagne.description.substring(0, 80)}...</small></td>
      <td>${campagne.dureeHeures} heures</td>
      <td>${campagne.prixOriginal.toFixed(2)} TND</td>
      <td>${campagne.prixOriginal.toFixed(2)} TND</td>
    </tr>
    <tr class="total-row">
      <td colspan="3" style="text-align:right">Sous-total :</td>
      <td>${campagne.prixOriginal.toFixed(2)} TND</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align:right" class="remise">Remise promotionnelle :</td>
      <td class="remise">-${remise.toFixed(2)} TND</td>
    </tr>
    <tr class="total-row">
      <td colspan="3" style="text-align:right">Prix HT :</td>
      <td>${campagne.prix.toFixed(2)} TND</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align:right">TVA 19% :</td>
      <td>${tva.toFixed(2)} TND</td>
    </tr>
    <tr class="total-row grand-total">
      <td colspan="3" style="text-align:right"><strong>TOTAL TTC :</strong></td>
      <td><strong>${total.toFixed(2)} TND</strong></td>
    </tr>
  </table>

  <div class="info-box" style="margin-top:20px;">
    <h3>Mode de paiement</h3>
    <p>${modePaiement === 'carte' ? 'Carte Bancaire' : modePaiement === 'virement' ? 'Virement Bancaire' : modePaiement === 'livraison' ? 'Paiement sur place' : 'Paiement différé D17'}</p>
    ${modePaiement === 'virement' ? '<p>IBAN : ' + DIGILAB_INFO.iban + '</p>' : ''}
  </div>

  <div class="info-box" style="margin-top:20px;">
    <h3>Ce qui est inclus</h3>
    <p>${campagne.inclus.join(' · ')}</p>
  </div>

  <div class="footer">
    <p><strong>${DIGILAB_INFO.nom}</strong> - ${DIGILAB_INFO.telephone} - ${DIGILAB_INFO.email}</p>
    <p>Merci pour votre confiance !</p>
  </div>
</body>
</html>`;

    const blob = new Blob([factureHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Facture_' + factureId + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const envoyerEmail = () => {
    const tva = campagne.prix * 0.19;
    const total = campagne.prix + tva;

    console.log('=== EMAIL DE CONFIRMATION ===');
    console.log('Destinataire: ' + formData.email);
    console.log('Sujet: Confirmation inscription - ' + campagne.title);
    console.log('---');
    console.log('Bonjour ' + formData.prenom + ' ' + formData.nom + ',');
    console.log('');
    console.log('Votre inscription a la formation "' + campagne.title + '" a ete confirmee avec succes !');
    console.log('');
    console.log('DETAILS:');
    console.log('- Formation: ' + campagne.title);
    console.log('- Date: ' + campagne.date);
    console.log('- Duree: ' + campagne.dureeHeures + ' heures');
    console.log('- Lieu: ' + campagne.location);
    console.log('- Prix: ' + campagne.prix + ' TND (TVA 19% incluse: ' + total.toFixed(2) + ' TND)');
    console.log('- Mode de paiement: ' + (modePaiement === 'carte' ? 'Carte Bancaire' : modePaiement === 'virement' ? 'Virement Bancaire' : modePaiement === 'livraison' ? 'Paiement sur place' : 'Paiement differe D17'));
    console.log('- N° Facture: ' + numeroFacture);
    console.log('');
    console.log('Ce qui est inclus: ' + campagne.inclus.join(', '));
    console.log('');
    console.log('Contact: ' + DIGILAB_INFO.telephone);
    console.log('Email: ' + DIGILAB_INFO.email);
    console.log('');
    console.log('Merci pour votre confiance !');
    console.log('DigiLab Solutions');
    console.log('==========================');

    setEmailEnvoye(true);
    setTimeout(() => setEmailEnvoye(false), 5000);
  };

  const finaliserInscription = () => {
    if (!validerEtape2()) return;

    const factureId = 'INV-' + Date.now();
    setNumeroFacture(factureId);
    setInscriptionTerminee(true);

    setTimeout(() => {
      genererFacture();
      envoyerEmail();
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: 50, height: 50, border: '4px solid ' + COLORS.grayBorder, borderTop: '4px solid ' + COLORS.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!campagne) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <AlertCircle size={64} style={{ color: COLORS.red, marginBottom: 20 }} />
        <h2>Formation non trouvee</h2>
        <p style={{ color: COLORS.gray, marginBottom: 30 }}>La formation demandee n'existe pas.</p>
        <button 
          onClick={() => navigate('/campagnes')}
          style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
        >
          Retour aux formations
        </button>
      </div>
    );
  }

  const IconComponent = campagne.icon;
  const remise = Math.round(((campagne.prixOriginal - campagne.prix) / campagne.prixOriginal) * 100);
  const tva = campagne.prix * 0.19;
  const total = campagne.prix + tva;

  return (
    <div className="campagne-detail-page">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkmark { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }

        .campagne-detail-page { min-height: 100vh; background: ${COLORS.grayLight}; }
        .detail-container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }

        .back-btn { display: inline-flex; align-items: center; gap: 8px; color: ${COLORS.gray}; background: none; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 20px; transition: color 0.3s; }
        .back-btn:hover { color: ${COLORS.dark}; }

        .detail-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .hero-image { border-radius: 20px; overflow: hidden; height: 400px; border: 1px solid ${COLORS.grayBorder}; }
        .hero-image img { width: 100%; height: 100%; object-fit: cover; }

        .hero-content { display: flex; flex-direction: column; justify-content: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: ${COLORS.primaryLight}; color: ${COLORS.primary}; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; width: fit-content; margin-bottom: 16px; border: 1px solid ${COLORS.primary}20; }
        .hero-title { font-size: 2.2rem; font-weight: 800; color: ${COLORS.dark}; margin-bottom: 16px; line-height: 1.2; }
        .hero-description { font-size: 1rem; color: ${COLORS.gray}; line-height: 1.7; margin-bottom: 24px; }

        .hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .hero-stat { background: ${COLORS.white}; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(10,10,10,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .hero-stat-value { font-size: 1.3rem; font-weight: 700; color: ${COLORS.primary}; }
        .hero-stat-label { font-size: 0.75rem; color: ${COLORS.gray}; margin-top: 4px; }

        .hero-prix-box { background: ${COLORS.white}; padding: 20px; border-radius: 16px; box-shadow: 0 2px 8px rgba(10,10,10,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .prix-original { font-size: 1rem; color: ${COLORS.gray}; text-decoration: line-through; }
        .prix-actuel { font-size: 2.2rem; font-weight: 800; color: ${COLORS.primary}; }
        .prix-remise { display: inline-block; background: ${COLORS.red}; color: ${COLORS.white}; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-left: 10px; }
        .places-alert { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px; background: ${COLORS.primaryLight}; border-radius: 8px; color: ${COLORS.primaryDark}; font-size: 0.85rem; border: 1px solid ${COLORS.primary}30; }
        .places-alert.pulse { animation: pulse 2s infinite; }

        .detail-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .section-card { background: ${COLORS.white}; padding: 28px; border-radius: 16px; box-shadow: 0 2px 8px rgba(10,10,10,0.05); margin-bottom: 24px; border: 1px solid ${COLORS.grayBorder}; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

        .programme-list { list-style: none; padding: 0; }
        .programme-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${COLORS.grayBorder}; }
        .programme-item:last-child { border-bottom: none; }
        .programme-num { width: 28px; height: 28px; background: ${COLORS.primaryLight}; color: ${COLORS.primary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; border: 1px solid ${COLORS.primary}30; }

        .tools-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .tool-badge { background: ${COLORS.grayLight}; color: ${COLORS.dark}; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; border: 1px solid ${COLORS.grayBorder}; }

        .inclus-list { list-style: none; padding: 0; }
        .inclus-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; color: ${COLORS.dark}; }
        .inclus-item svg { color: ${COLORS.green}; flex-shrink: 0; }

        .info-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; color: ${COLORS.dark}; font-size: 0.9rem; }
        .info-row svg { color: ${COLORS.primary}; flex-shrink: 0; }

        .inscription-panel { position: sticky; top: 20px; }
        .inscription-card { background: ${COLORS.white}; padding: 28px; border-radius: 16px; box-shadow: 0 4px 20px rgba(10,10,10,0.08); border: 1px solid ${COLORS.grayBorder}; }
        .inscription-title { font-size: 1.2rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 20px; text-align: center; }

        .etapes-indicator { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
        .etape-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; transition: all 0.3s; }
        .etape-dot.active { background: ${COLORS.primary}; color: ${COLORS.white}; }
        .etape-dot.completed { background: ${COLORS.green}; color: ${COLORS.white}; }
        .etape-dot.pending { background: ${COLORS.grayBorder}; color: ${COLORS.gray}; }
        .etape-line { width: 30px; height: 2px; background: ${COLORS.grayBorder}; align-self: center; }
        .etape-line.completed { background: ${COLORS.green}; }

        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: ${COLORS.dark}; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 14px; border: 2px solid ${COLORS.grayBorder}; border-radius: 10px; font-size: 0.95rem; transition: all 0.3s; box-sizing: border-box; color: ${COLORS.dark}; }
        .form-input:focus { outline: none; border-color: ${COLORS.primary}; }
        .form-input.error { border-color: ${COLORS.red}; }
        .form-error { color: ${COLORS.red}; font-size: 0.8rem; margin-top: 4px; }

        .paiement-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .paiement-option { display: flex; align-items: center; gap: 12px; padding: 14px; border: 2px solid ${COLORS.grayBorder}; border-radius: 12px; cursor: pointer; transition: all 0.3s; }
        .paiement-option:hover { border-color: ${COLORS.primary}; }
        .paiement-option.selected { border-color: ${COLORS.primary}; background: ${COLORS.primaryLight}; }
        .paiement-option svg { color: ${COLORS.primary}; }
        .paiement-option-info { flex: 1; }
        .paiement-option-title { font-weight: 600; color: ${COLORS.dark}; font-size: 0.9rem; }
        .paiement-option-desc { font-size: 0.8rem; color: ${COLORS.gray}; }

        .radio-circle { width: 20px; height: 20px; border: 2px solid ${COLORS.grayBorder}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .radio-circle.selected { border-color: ${COLORS.primary}; background: ${COLORS.primary}; }
        .radio-circle.selected::after { content: ''; width: 8px; height: 8px; background: ${COLORS.white}; border-radius: 50%; }

        .recap-box { background: ${COLORS.grayLight}; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid ${COLORS.grayBorder}; }
        .recap-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; color: ${COLORS.dark}; }
        .recap-row.total { border-top: 2px solid ${COLORS.grayBorder}; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 1.1rem; color: ${COLORS.primary}; }

        .btn-primary { width: 100%; padding: 14px; background: ${COLORS.primary}; color: ${COLORS.white}; border: none; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary:hover { background: ${COLORS.primaryDark}; transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-secondary { width: 100%; padding: 12px; background: ${COLORS.white}; color: ${COLORS.dark}; border: 2px solid ${COLORS.grayBorder}; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-top: 10px; }
        .btn-secondary:hover { border-color: ${COLORS.primary}; color: ${COLORS.primary}; }

        .success-screen { text-align: center; padding: 40px 20px; animation: slideIn 0.5s ease; }
        .success-icon { width: 80px; height: 80px; background: ${COLORS.green}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; animation: checkmark 0.5s ease; }
        .success-icon svg { color: ${COLORS.white}; width: 40px; height: 40px; }
        .success-title { font-size: 1.5rem; font-weight: 800; color: ${COLORS.dark}; margin-bottom: 12px; }
        .success-text { color: ${COLORS.gray}; margin-bottom: 24px; line-height: 1.6; }
        .success-facture { background: ${COLORS.grayLight}; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: left; border: 1px solid ${COLORS.grayBorder}; }
        .success-facture-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; color: ${COLORS.dark}; }
        .success-facture-row.total { font-weight: 700; color: ${COLORS.primary}; font-size: 1.1rem; border-top: 2px solid ${COLORS.grayBorder}; margin-top: 8px; padding-top: 12px; }

        .email-notification { display: flex; align-items: center; gap: 10px; background: ${COLORS.primaryLight}; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; color: ${COLORS.primaryDark}; font-size: 0.9rem; border: 1px solid ${COLORS.primary}30; }

        .virement-info { background: ${COLORS.primaryLight}; padding: 16px; border-radius: 12px; margin-top: 16px; border: 1px solid ${COLORS.primary}30; }
        .virement-info h4 { margin: 0 0 10px 0; color: ${COLORS.primaryDark}; font-size: 0.9rem; }
        .virement-info p { margin: 4px 0; color: ${COLORS.dark}; font-size: 0.85rem; }
        .virement-info .iban { font-family: monospace; background: ${COLORS.white}; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; letter-spacing: 1px; border: 1px solid ${COLORS.grayBorder}; }

        .livraison-info { background: ${COLORS.primaryLight}; padding: 16px; border-radius: 12px; margin-top: 16px; border: 1px solid ${COLORS.primary}30; }
        .livraison-info p { margin: 0; color: ${COLORS.primaryDark}; font-size: 0.9rem; }

        .d17-info { background: ${COLORS.primaryLight}; padding: 16px; border-radius: 12px; margin-top: 16px; border: 1px solid ${COLORS.primary}30; }
        .d17-info p { margin: 0; color: ${COLORS.primaryDark}; font-size: 0.9rem; }

        @media (max-width: 968px) {
          .detail-hero { grid-template-columns: 1fr; }
          .hero-image { height: 250px; }
          .detail-sections { grid-template-columns: 1fr; }
          .inscription-panel { position: static; }
          .hero-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="detail-container">
        <button className="back-btn" onClick={() => navigate('/campagnes')}>
          <ArrowLeft size={18} /> Retour aux formations
        </button>

        {/* HERO */}
        <div className="detail-hero">
          <div className="hero-image">
            <img src={campagne.image} alt={campagne.title} />
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <IconComponent size={14} /> Formation Certifiante
            </div>
            <h1 className="hero-title">{campagne.title}</h1>
            <p className="hero-description">{campagne.description}</p>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">{campagne.dureeHeures}h</div>
                <div className="hero-stat-label">Duree</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{campagne.placesRestantes}</div>
                <div className="hero-stat-label">Places</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Pratique</div>
              </div>
            </div>

            <div className="hero-prix-box">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span className="prix-original">{campagne.prixOriginal} TND</span>
                <span className="prix-remise">-{remise}%</span>
              </div>
              <div className="prix-actuel">{campagne.prix} TND</div>
              <div style={{ fontSize: '0.8rem', color: COLORS.gray, marginTop: 4 }}>TVA 19% incluse</div>

              {campagne.placesRestantes < 10 && (
                <div className={"places-alert " + (campagne.placesRestantes < 5 ? 'pulse' : '')}>
                  <AlertCircle size={16} />
                  Il ne reste que {campagne.placesRestantes} places !
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTIONS + INSCRIPTION */}
        <div className="detail-sections">
          <div className="sections-left">
            {/* Programme */}
            <div className="section-card">
              <h3 className="section-title"><BookOpen size={20} style={{ color: COLORS.primary }} /> Programme de la formation</h3>
              <ul className="programme-list">
                {campagne.programme.map((item, i) => (
                  <li key={i} className="programme-item">
                    <span className="programme-num">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outils */}
            <div className="section-card">
              <h3 className="section-title"><Zap size={20} style={{ color: COLORS.primary }} /> Outils & Technologies</h3>
              <div className="tools-grid">
                {campagne.tools.map((tool, i) => (
                  <span key={i} className="tool-badge">{tool}</span>
                ))}
              </div>
            </div>

            {/* Ce qui est inclus */}
            <div className="section-card">
              <h3 className="section-title"><Award size={20} style={{ color: COLORS.primary }} /> Ce qui est inclus</h3>
              <ul className="inclus-list">
                {campagne.inclus.map((item, i) => (
                  <li key={i} className="inclus-item">
                    <CheckCircle size={18} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Informations pratiques */}
            <div className="section-card">
              <h3 className="section-title"><MapPin size={20} style={{ color: COLORS.primary }} /> Informations pratiques</h3>
              <div className="info-row"><Calendar size={18} /> <strong>Date :</strong> {campagne.date}</div>
              <div className="info-row"><Clock size={18} /> <strong>Duree :</strong> {campagne.duration}</div>
              <div className="info-row"><MapPin size={18} /> <strong>Lieu :</strong> {campagne.location}</div>
              <div className="info-row"><Phone size={18} /> <strong>Contact :</strong> {campagne.contact}</div>
              <div className="info-row"><Shield size={18} /> <strong>Prerequis :</strong> {campagne.prerequis}</div>
              <div className="info-row"><Users size={18} /> <strong>Formateur :</strong> {campagne.formateur}</div>
            </div>
          </div>

          {/* PANEL INSCRIPTION */}
          <div className="inscription-panel">
            <div className="inscription-card">
              {!inscriptionTerminee ? (
                <>
                  <h3 className="inscription-title">Inscription</h3>

                  <div className="etapes-indicator">
                    <div className={"etape-dot " + (etape >= 1 ? 'active' : 'pending')}>1</div>
                    <div className={"etape-line " + (etape >= 2 ? 'completed' : '')} />
                    <div className={"etape-dot " + (etape === 2 ? 'active' : etape > 2 ? 'completed' : 'pending')}>2</div>
                    <div className={"etape-line " + (etape >= 3 ? 'completed' : '')} />
                    <div className={"etape-dot " + (etape === 3 ? 'active' : 'pending')}>3</div>
                  </div>

                  <AnimatePresence mode="wait">
                    {etape === 1 && (
                      <motion.div key="etape1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="form-group">
                          <label className="form-label">Prenom *</label>
                          <input 
                            className={"form-input " + (erreurs.prenom ? 'error' : '')}
                            value={formData.prenom}
                            onChange={e => setFormData({...formData, prenom: e.target.value})}
                            placeholder="Votre prenom"
                          />
                          {erreurs.prenom && <div className="form-error">{erreurs.prenom}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nom *</label>
                          <input 
                            className={"form-input " + (erreurs.nom ? 'error' : '')}
                            value={formData.nom}
                            onChange={e => setFormData({...formData, nom: e.target.value})}
                            placeholder="Votre nom"
                          />
                          {erreurs.nom && <div className="form-error">{erreurs.nom}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email *</label>
                          <input 
                            type="email"
                            className={"form-input " + (erreurs.email ? 'error' : '')}
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="votre@email.com"
                          />
                          {erreurs.email && <div className="form-error">{erreurs.email}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Telephone *</label>
                          <input 
                            className={"form-input " + (erreurs.telephone ? 'error' : '')}
                            value={formData.telephone}
                            onChange={e => setFormData({...formData, telephone: e.target.value})}
                            placeholder="+216 XX XXX XXX"
                          />
                          {erreurs.telephone && <div className="form-error">{erreurs.telephone}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Entreprise (optionnel)</label>
                          <input 
                            className="form-input"
                            value={formData.entreprise}
                            onChange={e => setFormData({...formData, entreprise: e.target.value})}
                            placeholder="Nom de votre entreprise"
                          />
                        </div>
                        <button className="btn-primary" onClick={() => validerEtape1() && setEtape(2)}>
                          Continuer <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    )}

                    {etape === 2 && (
                      <motion.div key="etape2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="paiement-options">
                          <div 
                            className={"paiement-option " + (modePaiement === 'carte' ? 'selected' : '')}
                            onClick={() => setModePaiement('carte')}
                          >
                            <div className={"radio-circle " + (modePaiement === 'carte' ? 'selected' : '')} />
                            <CreditCard size={20} />
                            <div className="paiement-option-info">
                              <div className="paiement-option-title">Carte Bancaire</div>
                              <div className="paiement-option-desc">Paiement securise en ligne</div>
                            </div>
                          </div>

                          <div 
                            className={"paiement-option " + (modePaiement === 'virement' ? 'selected' : '')}
                            onClick={() => setModePaiement('virement')}
                          >
                            <div className={"radio-circle " + (modePaiement === 'virement' ? 'selected' : '')} />
                            <Building2 size={20} />
                            <div className="paiement-option-info">
                              <div className="paiement-option-title">Virement Bancaire</div>
                              <div className="paiement-option-desc">Virement sur notre compte</div>
                            </div>
                          </div>

                          <div 
                            className={"paiement-option " + (modePaiement === 'livraison' ? 'selected' : '')}
                            onClick={() => setModePaiement('livraison')}
                          >
                            <div className={"radio-circle " + (modePaiement === 'livraison' ? 'selected' : '')} />
                            <Truck size={20} />
                            <div className="paiement-option-info">
                              <div className="paiement-option-title">Paiement sur place</div>
                              <div className="paiement-option-desc">Payer le jour de la formation</div>
                            </div>
                          </div>

                          <div 
                            className={"paiement-option " + (modePaiement === 'd17' ? 'selected' : '')}
                            onClick={() => setModePaiement('d17')}
                          >
                            <div className={"radio-circle " + (modePaiement === 'd17' ? 'selected' : '')} />
                            <Timer size={20} />
                            <div className="paiement-option-info">
                              <div className="paiement-option-title">D17 - Paiement differe</div>
                              <div className="paiement-option-desc">17 jours pour payer</div>
                            </div>
                          </div>
                        </div>

                        {modePaiement === 'carte' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <div className="form-group">
                              <label className="form-label">Numero de carte *</label>
                              <input 
                                className={"form-input " + (erreurs.numero ? 'error' : '')}
                                value={carteData.numero}
                                onChange={e => setCarteData({...carteData, numero: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                                placeholder="1234 5678 9012 3456"
                                maxLength={16}
                              />
                              {erreurs.numero && <div className="form-error">{erreurs.numero}</div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div className="form-group">
                                <label className="form-label">Expiration *</label>
                                <input 
                                  className={"form-input " + (erreurs.expiration ? 'error' : '')}
                                  value={carteData.expiration}
                                  onChange={e => setCarteData({...carteData, expiration: e.target.value})}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                />
                                {erreurs.expiration && <div className="form-error">{erreurs.expiration}</div>}
                              </div>
                              <div className="form-group">
                                <label className="form-label">CVC *</label>
                                <input 
                                  className={"form-input " + (erreurs.cvc ? 'error' : '')}
                                  value={carteData.cvc}
                                  onChange={e => setCarteData({...carteData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                  placeholder="123"
                                  maxLength={3}
                                />
                                {erreurs.cvc && <div className="form-error">{erreurs.cvc}</div>}
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Titulaire de la carte *</label>
                              <input 
                                className={"form-input " + (erreurs.titulaire ? 'error' : '')}
                                value={carteData.titulaire}
                                onChange={e => setCarteData({...carteData, titulaire: e.target.value})}
                                placeholder="NOM PRENOM"
                              />
                              {erreurs.titulaire && <div className="form-error">{erreurs.titulaire}</div>}
                            </div>
                          </motion.div>
                        )}

                        {modePaiement === 'virement' && (
                          <div className="virement-info">
                            <h4><Building2 size={14} /> Virement bancaire</h4>
                            <p>Effectuez votre virement sur le compte suivant :</p>
                            <p className="iban">{DIGILAB_INFO.iban}</p>
                            <p style={{ marginTop: 8, fontSize: '0.8rem' }}>Au nom de : {DIGILAB_INFO.nom}</p>
                            <p style={{ fontSize: '0.8rem' }}>Votre inscription sera confirmee apres reception du virement.</p>
                          </div>
                        )}

                        {modePaiement === 'livraison' && (
                          <div className="livraison-info">
                            <p><Truck size={14} style={{ display: 'inline', marginRight: 6 }} /> Vous paierez sur place le jour de la formation. Apportez le montant exact en especes.</p>
                          </div>
                        )}

                        {modePaiement === 'd17' && (
                          <div className="d17-info">
                            <p><Timer size={14} style={{ display: 'inline', marginRight: 6 }} /> Vous avez 17 jours a compter de la date de la formation pour effectuer le paiement.</p>
                          </div>
                        )}

                        <div className="recap-box">
                          <div className="recap-row">
                            <span>Formation</span>
                            <span>{campagne.prixOriginal.toFixed(2)} TND</span>
                          </div>
                          <div className="recap-row" style={{ color: COLORS.red }}>
                            <span>Remise</span>
                            <span>-{(campagne.prixOriginal - campagne.prix).toFixed(2)} TND</span>
                          </div>
                          <div className="recap-row">
                            <span>Prix HT</span>
                            <span>{campagne.prix.toFixed(2)} TND</span>
                          </div>
                          <div className="recap-row">
                            <span>TVA 19%</span>
                            <span>{tva.toFixed(2)} TND</span>
                          </div>
                          <div className="recap-row total">
                            <span>Total TTC</span>
                            <span>{total.toFixed(2)} TND</span>
                          </div>
                        </div>

                        <button className="btn-primary" onClick={finaliserInscription}>
                          <CheckCircle size={18} /> Confirmer l'inscription
                        </button>
                        <button className="btn-secondary" onClick={() => setEtape(1)}>
                          Retour
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="success-screen">
                  <div className="success-icon">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="success-title">Inscription confirmee !</h2>
                  <p className="success-text">
                    Felicitations {formData.prenom} !<br />
                    Votre inscription a <strong>{campagne.title}</strong> a ete enregistree avec succes.
                  </p>

                  {emailEnvoye && (
                    <div className="email-notification">
                      <Mail size={18} />
                      Un email de confirmation a ete envoye a {formData.email}
                    </div>
                  )}

                  <div className="success-facture">
                    <h4 style={{ margin: '0 0 12px 0', color: COLORS.dark, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={18} /> Recapitulatif
                    </h4>
                    <div className="success-facture-row"><span>N° Facture</span><span>{numeroFacture}</span></div>
                    <div className="success-facture-row"><span>Formation</span><span>{campagne.title}</span></div>
                    <div className="success-facture-row"><span>Date</span><span>{campagne.date}</span></div>
                    <div className="success-facture-row"><span>Participant</span><span>{formData.prenom} {formData.nom}</span></div>
                    <div className="success-facture-row"><span>Mode de paiement</span><span>{modePaiement === 'carte' ? 'Carte Bancaire' : modePaiement === 'virement' ? 'Virement' : modePaiement === 'livraison' ? 'Sur place' : 'D17'}</span></div>
                    <div className="success-facture-row total"><span>Total TTC</span><span>{total.toFixed(2)} TND</span></div>
                  </div>

                  <button className="btn-primary" onClick={genererFacture} style={{ marginBottom: 10 }}>
                    <Download size={18} /> Telecharger la facture
                  </button>
                  <button className="btn-secondary" onClick={() => navigate('/campagnes')}>
                    Retour aux formations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}