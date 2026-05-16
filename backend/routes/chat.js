const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Tu es l'assistant IA de DigiPip, plateforme cloud marketing dédiée aux agences.
Réponds en français, de façon concise et professionnelle (max 3 phrases).

DigiPip combine :
- MARKETING : Campagnes Email (SMTP), SMS (Twilio), Push (Firebase FCM), segmentation, analytics KPIs
- CLOUD : Vercel (frontend) + Render (backend Node.js) + Neon Postgres, architecture multi-tenant
- DEVOPS : CI/CD GitHub Actions, monitoring temps réel, alertes automatiques

Rôles : Admin, Responsable Marketing, Client.
Si quelqu'un veut accéder à la plateforme, dis-leur de cliquer sur "Se connecter".`;

router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages requis' });
  }
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM,
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;