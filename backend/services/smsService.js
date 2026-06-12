// services/smsService.js
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendSMS(notification) {
  try {
    const clients = await getClientsFromSegment(notification.segmentId);
    
    const promises = clients.map(contact => 
      client.messages.create({
        body: `${notification.title}\n\n${notification.message}\n\nDigiLab Solutions`,
        from: process.env.TWILIO_PHONE,
        to: contact.phone
      })
    );

    await Promise.all(promises);
    return { success: true, count: clients.length };
  } catch (error) {
    console.error('Erreur SMS:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSMS };