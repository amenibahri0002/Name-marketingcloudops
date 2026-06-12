// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(notification) {
  try {
    // Récupérer les emails des clients du segment
    const clients = await getClientsFromSegment(notification.segmentId);
    
    const promises = clients.map(client => 
      transporter.sendMail({
        from: '"DigiLab Solutions" <contact@digilab.tn>',
        to: client.email,
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F5A623;">${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.campagne ? `
              <a href="https://digilab.tn/campagnes/${notification.campagne.slug}" 
                 style="background: #F5A623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
                Voir la formation
              </a>
            ` : ''}
          </div>
        `
      })
    );

    await Promise.all(promises);
    return { success: true, count: clients.length };
  } catch (error) {
    console.error('Erreur email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };