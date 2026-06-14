// services/notificationService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Resend } = require('resend');

// ============================================================
// RESEND (API HTTP - pas SMTP bloqué)
// ============================================================
const resend = new Resend(process.env.RESEND_API_KEY);

// Templates de notifications
const TEMPLATES = {
  nouvelle_campagne: {
    title: '🎉 Nouvelle formation disponible !',
    emoji: '🎉',
    color: '#F5A623'
  },
  promotion: {
    title: '🔥 Promotion spéciale !',
    emoji: '🔥',
    color: '#EF4444'
  },
  places_limitées: {
    title: '⚠️ Dernières places disponibles !',
    emoji: '⚠️',
    color: '#EF4444'
  },
  complet: {
    title: '✅ Formation complète !',
    emoji: '✅',
    color: '#10B981'
  },
  changement_date: {
    title: '📅 Changement de date',
    emoji: '📅',
    color: '#3B82F6'
  },
  rappel: {
    title: '⏰ Rappel - Formation proche !',
    emoji: '⏰',
    color: '#8B5CF6'
  }
};

// ============================================================
// NOTIFIER TOUS LES CLIENTS (multi-canal) - ENVOI RÉEL
// ============================================================
async function notifierClients({ type, campagne, message, canaux = ['email'] }) {
  const template = TEMPLATES[type] || TEMPLATES.nouvelle_campagne;

  // Récupérer les destinataires
  const contacts = await prisma.contact.findMany({
    where: { clientId: campagne.clientId },
    select: { id: true, name: true, email: true, phone: true }
  });

  const users = contacts.length > 0 ? contacts : await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true, phone: true }
  });

  const destinataires = contacts.length > 0 ? contacts : users;

  const results = [];

  for (const canal of canaux) {
    try {
      let result;
      switch (canal) {
        case 'email':
          result = await envoyerEmail(destinataires, { type, campagne, message, template });
          break;
        case 'sms':
          result = await envoyerSMS(destinataires, { type, campagne, message, template });
          break;
        case 'push':
          result = await envoyerPush(destinataires, { type, campagne, message, template });
          break;
        case 'whatsapp':
          result = await envoyerWhatsApp(destinataires, { type, campagne, message, template });
          break;
        case 'social':
          result = await publierSocial({ type, campagne, message, template });
          break;
        default:
          result = { success: false, error: 'Canal inconnu' };
      }

      // Sauvegarder la notification en base
      await prisma.notification.create({
        data: {
          title: template.title,
          message: message || genererMessage({ type, campagne, template }),
          type,
          canal,
          status: result.success ? 'sent' : 'failed',
          campagneId: campagne.id,
          sentAt: result.success ? new Date() : null,
          metadata: {
            destinatairesCount: destinataires.length,
            sent: result.count || 0,
            error: result.error || null
          }
        }
      });

      results.push({ canal, ...result });
    } catch (err) {
      console.error(`[NOTIFY ERROR ${canal}]`, err);
      results.push({ canal, success: false, error: err.message });
    }
  }

  return results;
}

// ============================================================
// EMAIL - ENVOI RÉEL avec Resend
// ============================================================
async function envoyerEmail(destinataires, { type, campagne, message, template }) {
  const html = genererEmailHTML({ type, campagne, message, template });
  let sent = 0;
  let failed = 0;

  // Envoyer les emails un par un
  for (const dest of destinataires) {
    try {
      await resend.emails.send({
        from: 'DigiLab <onboarding@resend.dev>',
        to: dest.email,
        subject: `${template.emoji} ${template.title} - ${campagne.title}`,
        html: html.replace(/{{NOM}}/g, dest.name || 'Client')
      });
      sent++;
      console.log(`[RESEND] ✅ Email envoyé à ${dest.email}`);
    } catch (err) {
      failed++;
      console.error(`[RESEND ERROR] ${dest.email}:`, err.message);
    }
  }

  return { 
    success: sent > 0, 
    count: sent, 
    failed: failed,
    total: destinataires.length 
  };
}

// ============================================================
// SMS - ENVOI RÉEL (Twilio)
// ============================================================
async function envoyerSMS(destinataires, { type, campagne, message, template }) {
  try {
    // Vérifier si Twilio est configuré
    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
      console.log('[SMS] Twilio non configuré - envoi simulé');
      return { success: true, count: 0, note: 'Twilio non configuré' };
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    
    const smsMessage = `${template.emoji} ${template.title}\n${campagne.title}\n${message || ''}\nPrix: ${campagne.prix} TND`;

    let sent = 0;
    for (const dest of destinataires) {
      if (!dest.phone) continue;
      try {
        await client.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE,
          to: dest.phone
        });
        sent++;
      } catch (err) {
        console.error(`[SMS ERROR] ${dest.phone}:`, err.message);
      }
    }

    return { success: sent > 0, count: sent, total: destinataires.length };
  } catch (err) {
    console.error('[SMS ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// PUSH - ENVOI RÉEL (Firebase)
// ============================================================
async function envoyerPush(destinataires, { type, campagne, message, template }) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('[PUSH] Firebase non configuré - envoi simulé');
      return { success: true, count: 0, note: 'Firebase non configuré' };
    }

    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    }

    // Récupérer les tokens FCM
    const tokens = destinataires
      .filter(c => c.fcmToken)
      .map(c => c.fcmToken);

    if (tokens.length === 0) {
      return { success: false, error: 'Aucun token FCM trouvé' };
    }

    const pushMessage = {
      notification: {
        title: `${template.emoji} ${template.title}`,
        body: message || genererMessage({ type, campagne, template })
      },
      data: {
        campagneId: campagne.id.toString(),
        type: type
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(pushMessage);
    
    return { 
      success: response.successCount > 0,
      count: response.successCount,
      failed: response.failureCount,
      total: tokens.length
    };
  } catch (err) {
    console.error('[PUSH ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// WHATSAPP - ENVOI RÉEL (WhatsApp Business API)
// ============================================================
async function envoyerWhatsApp(destinataires, { type, campagne, message, template }) {
  try {
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
      console.log('[WHATSAPP] Non configuré - envoi simulé');
      return { success: true, count: 0, note: 'WhatsApp non configuré' };
    }

    const axios = require('axios');
    let sent = 0;

    for (const dest of destinataires) {
      if (!dest.phone) continue;
      try {
        await axios.post(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
          messaging_product: 'whatsapp',
          to: dest.phone.replace('+', ''),
          type: 'template',
          template: {
            name: 'digilab_notification',
            language: { code: 'fr' },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: template.title },
                { type: 'text', text: message || genererMessage({ type, campagne, template }) }
              ]
            }]
          }
        }, {
          headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
        });
        sent++;
      } catch (err) {
        console.error(`[WHATSAPP ERROR] ${dest.phone}:`, err.message);
      }
    }

    return { success: sent > 0, count: sent, total: destinataires.length };
  } catch (err) {
    console.error('[WHATSAPP ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// RÉSEAUX SOCIAUX - ENVOI RÉEL
// ============================================================
async function publierSocial({ type, campagne, message, template }) {
  try {
    const platforms = [];
    
    // Facebook
    if (process.env.FB_ACCESS_TOKEN && process.env.FB_PAGE_ID) {
      try {
        const axios = require('axios');
        await axios.post(`https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}/feed`, {
          message: `${template.emoji} ${template.title}\n\n${message || genererMessage({ type, campagne, template })}`,
          access_token: process.env.FB_ACCESS_TOKEN
        });
        platforms.push('Facebook');
      } catch (err) {
        console.error('[FACEBOOK ERROR]', err.message);
      }
    }

    // LinkedIn
    if (process.env.LINKEDIN_TOKEN && process.env.LINKEDIN_PERSON_ID) {
      try {
        const axios = require('axios');
        await axios.post('https://api.linkedin.com/v2/shares', {
          content: {
            contentEntities: [{
              entityLocation: `https://digipip.vercel.app/campagnes/${campagne.slug}`
            }],
            title: template.title
          },
          owner: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
          text: { text: message || genererMessage({ type, campagne, template }) }
        }, {
          headers: { Authorization: `Bearer ${process.env.LINKEDIN_TOKEN}` }
        });
        platforms.push('LinkedIn');
      } catch (err) {
        console.error('[LINKEDIN ERROR]', err.message);
      }
    }

    return { 
      success: platforms.length > 0, 
      platforms,
      count: platforms.length 
    };
  } catch (err) {
    console.error('[SOCIAL ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// GÉNÉRATEURS DE CONTENU
// ============================================================
function genererMessage({ type, campagne, template }) {
  const messages = {
    nouvelle_campagne: `Découvrez notre nouvelle formation "${campagne.title}" ! ${campagne.description?.substring(0, 100) || ''}... Prix: ${campagne.prix} TND. Places limitées: ${campagne.placesTotal}.`,
    promotion: `🔥 PROMOTION sur "${campagne.title}" ! Prix spécial: ${campagne.prix} TND au lieu de ${campagne.prixOriginal} TND. Économisez ${campagne.prixOriginal - campagne.prix} TND !`,
    places_limitées: `⚠️ URGENT - Plus que ${campagne.placesRestantes} places disponibles pour "${campagne.title}" ! Réservez vite avant qu'il ne soit trop tard.`,
    complet: `✅ La formation "${campagne.title}" est désormais COMPLETE ! Merci pour votre confiance. Inscrivez-vous sur liste d'attente pour la prochaine session.`,
    changement_date: `📅 La formation "${campagne.title}" a changé de date. Nouvelle date: ${campagne.date || campagne.dateScheduled}. Veuillez vérifier votre planning.`,
    rappel: `⏰ RAPPEL - La formation "${campagne.title}" commence bientôt ! Préparez-vous et rejoignez-nous.`
  };

  return messages[type] || messages.nouvelle_campagne;
}

function genererEmailHTML({ type, campagne, message, template }) {
  const msg = message || genererMessage({ type, campagne, template });
  const remise = campagne.prixOriginal ? Math.round(((campagne.prixOriginal - campagne.prix) / campagne.prixOriginal) * 100) : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: ${template.color}; padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 800; }
    .content { padding: 40px 30px; }
    .badge { display: inline-block; padding: 8px 16px; background: #FFF8E7; color: #D48A1A; border-radius: 20px; font-weight: 700; font-size: 14px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: 800; color: #0A0A0A; margin-bottom: 16px; }
    .description { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .details { background: #F5F5F5; padding: 24px; border-radius: 16px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E5E5; }
    .detail-row:last-child { border-bottom: none; }
    .price { font-size: 32px; font-weight: 800; color: ${template.color}; }
    .price-original { text-decoration: line-through; color: #999; font-size: 20px; }
    .cta { display: inline-block; background: ${template.color}; color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 18px; margin-top: 20px; }
    .footer { background: #0A0A0A; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${template.emoji} ${template.title}</h1>
    </div>
    <div class="content">
      <div class="badge">FORMATION</div>
      <h2 class="title">${campagne.title}</h2>
      <p class="description">Bonjour {{NOM}},</p>
      <p class="description">${msg}</p>

      ${campagne.image ? `<img src="${campagne.image}" style="width:100%;border-radius:16px;margin-bottom:24px;" />` : ''}

      <div class="details">
        <div class="detail-row">
          <span>📅 Date</span>
          <strong>${campagne.date || campagne.dateScheduled?.split('T')[0] || 'À définir'}</strong>
        </div>
        <div class="detail-row">
          <span>⏱ Durée</span>
          <strong>${campagne.duration || campagne.dureeHeures + 'h'}</strong>
        </div>
        <div class="detail-row">
          <span>📍 Lieu</span>
          <strong>${campagne.location || 'Sfax, Tunisia'}</strong>
        </div>
        <div class="detail-row">
          <span>👥 Places</span>
          <strong>${campagne.placesRestantes || campagne.placesTotal} restantes</strong>
        </div>
        <div class="detail-row" style="align-items:center;">
          <span>💰 Prix</span>
          <div>
            ${campagne.prixOriginal ? `<span class="price-original">${campagne.prixOriginal} TND</span> ` : ''}
            <span class="price">${campagne.prix} TND</span>
            ${remise > 0 ? `<span style="background:#EF4444;color:white;padding:4px 12px;border-radius:20px;font-size:14px;margin-left:10px;">-${remise}%</span>` : ''}
          </div>
        </div>
      </div>

      <center>
        <a href="https://digipip.vercel.app/campagnes/${campagne.slug}" class="cta">
          🚀 Voir la formation & S'inscrire
        </a>
      </center>
    </div>
    <div class="footer">
      <p><strong>DigiLab Solutions</strong></p>
      <p>Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage - Sfax</p>
      <p>📞 +216 22 044 105 | 📧 contact@digilab.tn</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================
// VÉRIFIER ALERTES AUTOMATIQUES
// ============================================================
async function verifierAlertesAutomatiques(campagneId) {
  const campagne = await prisma.campagne.findUnique({
    where: { id: campagneId },
    include: { inscriptions: true }
  });

  if (!campagne) return;

  const alertes = [];

  if (campagne.placesRestantes <= 5 && campagne.placesRestantes > 0) {
    alertes.push({ type: 'places_limitées', canaux: ['email', 'sms', 'push'] });
  }

  if (campagne.placesRestantes === 0) {
    alertes.push({ type: 'complet', canaux: ['email', 'push'] });
  }

  if (campagne.dateScheduled) {
    const dateFormation = new Date(campagne.dateScheduled);
    const maintenant = new Date();
    const diffJours = Math.ceil((dateFormation - maintenant) / (1000 * 60 * 60 * 24));

    if (diffJours === 7) {
      alertes.push({ type: 'rappel', canaux: ['email', 'sms', 'push'] });
    }
  }

  for (const alerte of alertes) {
    await notifierClients({
      type: alerte.type,
      campagne,
      canaux: alerte.canaux
    });
  }
}

module.exports = {
  notifierClients,
  verifierAlertesAutomatiques,
  TEMPLATES
};