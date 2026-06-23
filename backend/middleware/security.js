const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/* ═══════════════════════════════════════════════════════════════
   SECURITY MIDDLEWARE - DigiPip Cloud Engine
   ═══════════════════════════════════════════════════════════════ */

// Helmet middleware for security headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Global rate limiter - FIXED: disable IPv6 validation or use default keyGenerator
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator (handles IPv6 automatically)
  // OR disable the validation:
  validate: {
    keyGeneratorIpFallback: false, // Disable IPv6 validation warning
  },
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(15 * 60),
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Auth rate limiter (strict for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
  },
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: Math.ceil(15 * 60),
  },
  skipSuccessfulRequests: true,
});

// API rate limiter (more generous for authenticated users)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
  },
  message: {
    success: false,
    error: 'Rate limit exceeded. Please slow down.',
    retryAfter: 60,
  },
});

// Export middleware configurations - matching server.js imports
module.exports = {
  helmetMiddleware,
  globalLimiter,
  authLimiter,
  apiLimiter,
};