// services/socialService.js
const axios = require('axios');

async function sendSocial(notification) {
  try {
    // Poster sur les réseaux sociaux (Facebook, Instagram, LinkedIn)
    const results = await Promise.all([
      // Facebook
      axios.post(`https://graph.facebook.com/v18.0/${process.env.FB_PAGE_ID}/feed`, {
        message: `${notification.title}\n\n${notification.message}`,
        access_token: process.env.FB_ACCESS_TOKEN
      }),
      // LinkedIn
      axios.post('https://api.linkedin.com/v2/shares', {
        content: {
          contentEntities: [{
            entityLocation: `https://digilab.tn/campagnes/${notification.campagne?.slug || ''}`
          }],
          title: notification.title
        },
        owner: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        text: { text: notification.message }
      }, {
        headers: { Authorization: `Bearer ${process.env.LINKEDIN_TOKEN}` }
      })
    ]);

    return { success: true, platforms: ['Facebook', 'LinkedIn'] };
  } catch (error) {
    console.error('Erreur social:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSocial };