const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'techevent_secret_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Format invalide' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // LOG TEMPORAIRE
    console.log('=== TOKEN DECODED ===');
    console.log('Keys:', Object.keys(decoded));
    console.log('tenantId:', decoded.tenantId);
    console.log('=====================');
    
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      clientId: decoded.clientId,
      tenantId: decoded.tenantId  // ← AJOUTER CECI
    };
    
    req.tenantId = decoded.tenantId;  // ← AJOUTER CECI AUSSI
    
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

function requireRole(...roles) {
  return function(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Accès refusé',
        required: roles,
        current: req.user.role
      });
    }
    next();
  };
}

const ROLES = {
  ADMIN: 'ADMIN',
  RESPONSABLE_MARKETING: 'RESPONSABLE_MARKETING',
  CLIENT: 'CLIENT'
};

module.exports = {
  authenticate: authMiddleware,
  requireRole,
  ROLES
};