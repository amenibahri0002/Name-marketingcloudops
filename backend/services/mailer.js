const nodemailer = require('nodemailer');

// ============================================================
// MÊME CONFIGURATION QUE notificationService.js
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,      // ← Même que notificationService
    pass: process.env.MAIL_PASS       // ← Même que notificationService
  }
});

// Vérifier la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP ERROR]', error);
  } else {
    console.log('[SMTP] ✅ Serveur prêt pour envoyer des emails');
  }
});

// ============================================================
// EMAIL DE CONFIRMATION D'INSCRIPTION - NON BLOQUANT
// ============================================================
function sendInscriptionConfirmationEmail(userEmail, userName, campagneDetails) {
  transporter.sendMail({
    from: `"DigiLab Solutions" <${process.env.MAIL_USER}>`,  // ← Même expéditeur
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
  .then(info => {
    console.log(`[EMAIL] ✅ Confirmation envoyée à ${userEmail} (ID: ${info.messageId})`);
  })
  .catch(err => {
    console.error('[EMAIL] ❌ Erreur:', err.message);
  });
}

module.exports = { sendInscriptionConfirmationEmail };