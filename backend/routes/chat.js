const express = require('express');
const router  = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: {
        parts: [{ text: SYSTEM }],   // ← format correct pour Gemini
      },
    });

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const reply  = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('[GEMINI ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;