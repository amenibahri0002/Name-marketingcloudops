// services/whatsappService.js
const axios = require('axios');

async function sendWhatsApp(notification) {
  try {
    // Utiliser WhatsApp Business API ou Twilio WhatsApp
    const clients = await getClientsFromSegment(notification.segmentId);
    
    const promises = clients.map(client => 
      axios.post(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: client.phone.replace('+', ''),
        type: 'template',
        template: {
          name: 'digilab_notification',
          language: { code: 'fr' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: notification.title },
              { type: 'text', text: notification.message }
            ]
          }]
        }
      }, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
      })
    );

    await Promise.all(promises);
    return { success: true, count: clients.length };
  } catch (error) {
    console.error('Erreur WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendWhatsApp };