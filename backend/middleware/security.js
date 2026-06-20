const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiter global - PLUS PERMISSIF pour le développement
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // ← AUGMENTÉ de 100 à 1000 requêtes
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignorer les requêtes de localhost (développement)
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  }
});

// Rate limiter pour auth (plus strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 tentatives de login par 15 min
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

// Helmet avec config adaptée
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  helmetMiddleware,
};