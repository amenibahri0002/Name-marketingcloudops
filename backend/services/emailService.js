// services/emailService.js - SEUL fichier email, utilise Resend
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// EMAIL DE CONFIRMATION D'INSCRIPTION
// ============================================================
function sendInscriptionConfirmationEmail(userEmail, userName, campagneDetails) {
  resend.emails.send({
    from: 'DigiLab <onboarding@resend.dev>',
    to: userEmail,
    subject: `✅ Inscription confirmée - ${campagneDetails.title}`,
    html: generateInscriptionHTML(userName, campagneDetails)
  })
  .then(() => console.log(`[EMAIL] ✅ Inscription envoyée à ${userEmail}`))
  .catch(err => console.error('[EMAIL] ❌ Erreur:', err.message));
}

// ============================================================
// EMAIL DE NOTIFICATION DE CAMPAGNE (pour tous les clients)
// ============================================================
async function sendCampagneNotification(destinataires, title, message, campagne) {
  let sent = 0;
  let failed = 0;

  for (const dest of destinataires) {
    try {
      await resend.emails.send({
        from: 'DigiLab <onboarding@resend.dev>',
        to: dest.email,
        subject: title,
        html: generateCampagneHTML(dest, message, campagne)
      });
      sent++;
      console.log(`[EMAIL] ✅ Notification envoyée à ${dest.email}`);
    } catch (err) {
      failed++;
      console.error(`[EMAIL] ❌ ${dest.email}:`, err.message);
    }
  }

  return { success: sent > 0, sent, failed, total: destinataires.length };
}

// ============================================================
// HTML GENERATORS
// ============================================================
function generateInscriptionHTML(userName, campagne) {
  return `
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
          <div class="campagne-card">
            <div class="campagne-title">${campagne.title}</div>
            <div class="detail">📅 ${campagne.date || 'À définir'}</div>
            <div class="detail">⏱️ ${campagne.dureeHeures || 'N/A'} heures</div>
            <div class="detail">📍 ${campagne.location || 'Sfax'}</div>
            <div class="detail">🎯 ${campagne.format || 'Présentiel'}</div>
            <div class="price">${campagne.prix || 'N/A'} TND</div>
          </div>
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
  `;
}

function generateCampagneHTML(dest, message, campagne) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F5A623;">📢 Nouvelle formation !</h2>
      <p>Bonjour ${dest.name || 'Client'},</p>
      <p>${message}</p>
      ${campagne ? `
        <div style="background: #fffbeb; border-left: 4px solid #f5a623; padding: 16px; margin: 20px 0;">
          <h3>${campagne.title}</h3>
          <p>📅 ${campagne.date || 'À définir'} | ⏱️ ${campagne.dureeHeures || 'N/A'}h</p>
          <p>📍 ${campagne.location || 'Sfax'} | 💰 ${campagne.prix || 'N/A'} TND</p>
        </div>
      ` : ''}
      <a href="https://digipip.vercel.app/campagnes" 
         style="background: #F5A623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
        Voir les formations
      </a>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #999;">
        DigiLab Solutions - Cloud Marketing<br>
        📧 contact@digilab.tn | 📱 +216 22 044 105
      </p>
    </div>
  `;
}

module.exports = {
  sendInscriptionConfirmationEmail,
  sendCampagneNotification
};