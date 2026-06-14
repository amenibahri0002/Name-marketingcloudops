// backend/utils/mailer.js (ou services/mailer.js)
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// EMAIL DE CONFIRMATION D'INSCRIPTION - NON BLOQUANT
// ============================================================
function sendInscriptionConfirmationEmail(userEmail, userName, campagneDetails) {
  // Fire-and-forget : pas de await, pas de blocage
  resend.emails.send({
    from: 'DigiLab <onboarding@resend.dev>',  // Domaine Resend par défaut
    to: userEmail,
    subject: `✅ Inscription confirmée - ${campagneDetails.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #f5a623, #d48a1a); padding: 40px 30px; text-align: center; color: #fff; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .campagne-card { background: #fffbeb; border: 2px solid #f5a623; border-radius: 12px; padding: 24px; margin: 20px 0; }
          .campagne-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .detail { display: flex; align-items: center; gap: 8px; margin: 8px 0; color: #64748b; font-size: 14px; }
          .price { font-size: 24px; font-weight: 800; color: #f5a623; margin: 16px 0; }
          .button { display: inline-block; background: #f5a623; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue !</h1>
            <p>Votre inscription est confirmée</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              Bonjour <strong>${userName}</strong>,
            </p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              Vous êtes maintenant inscrit à notre formation. Voici les détails :
            </p>
            <div class="campagne-card">
              <div class="campagne-title">${campagneDetails.title}</div>
              <div class="detail">📅 ${campagneDetails.date || 'À définir'}</div>
              <div class="detail">⏱️ ${campagneDetails.dureeHeures || 'N/A'} heures</div>
              <div class="detail">📍 ${campagneDetails.location || 'Sfax'}</div>
              <div class="detail">🎯 ${campagneDetails.format || 'Présentiel'}</div>
              <div class="price">${campagneDetails.prix || 'N/A'} TND</div>
            </div>
            <p style="font-size: 14px; color: #64748b; margin: 20px 0;">
              <strong>Prochaines étapes :</strong>
            </p>
            <ul style="color: #475569; line-height: 1.8;">
              <li>Préparez votre ordinateur portable</li>
              <li>Rejoignez notre groupe WhatsApp pour les mises à jour</li>
              <li>Arrivez 15 minutes avant le début</li>
            </ul>
            <center>
              <a href="https://digipip.vercel.app/mes-inscriptions" class="button">
                Voir mes inscriptions
              </a>
            </center>
          </div>
          <div class="footer">
            <p>DigiLab Solutions - Cloud Marketing</p>
            <p>📧 contact@digilab.tn | 📱 +216 22 044 105</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
  .then(data => {
    console.log(`[RESEND] ✅ Confirmation envoyée à ${userEmail}`);
  })
  .catch(err => {
    console.error('[RESEND] ❌ Erreur:', err.message);
  });
}

// ============================================================
// EMAIL DE NOTIFICATION DE CAMPAGNE (pour remplacer notificationService)
// ============================================================
async function sendCampagneNotification(destinataires, title, message, campagne) {
  let sent = 0;
  
  for (const dest of destinataires) {
    try {
      await resend.emails.send({
        from: 'DigiLab <onboarding@resend.dev>',
        to: dest.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F5A623;">${title}</h2>
            <p>Bonjour ${dest.name || 'Client'},</p>
            <p>${message}</p>
            <a href="https://digipip.vercel.app/campagnes/${campagne?.slug || ''}" 
               style="background: #F5A623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
              Voir la formation
            </a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              DigiLab Solutions - Cloud Marketing<br>
              📧 contact@digilab.tn | 📱 +216 22 044 105
            </p>
          </div>
        `
      });
      sent++;
      console.log(`[RESEND] ✅ Notification envoyée à ${dest.email}`);
    } catch (err) {
      console.error(`[RESEND ERROR] ${dest.email}:`, err.message);
    }
  }
  
  return { success: sent > 0, sent, total: destinataires.length };
}

module.exports = { 
  sendInscriptionConfirmationEmail,
  sendCampagneNotification
};