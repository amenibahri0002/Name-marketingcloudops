const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Stockage async-local pour le tenant courant
const { AsyncLocalStorage } = require('async_hooks');
const tenantStorage = new AsyncLocalStorage();

// Routes publiques qui ne nécessitent PAS de tenant
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/tenants/resolve',
  '/api/tenants',
  '/metrics'
];

// ✅ CORRIGÉ: async function
const tenantMiddleware = async (req, res, next) => {
  // 1. Vérifier si c'est une route publique
  const isPublic = PUBLIC_PATHS.some(path => req.path.startsWith(path));
  if (isPublic) {
    return next();
  }

  // 2. Extraire le tenantId
  let tenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
  let tenantSlug = req.headers['x-tenant-slug'] || req.headers['X-Tenant-Slug'];
  
  // 3. Fallback: sous-domaine
  if (!tenantId && !tenantSlug && req.headers.host) {
    const subdomain = req.headers.host.split('.')[0];
    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      tenantSlug = subdomain;
    }
  }

  // 4. Si pas de tenant trouvé, utiliser le tenant par défaut
  if (!tenantId && !tenantSlug) {
    try {
      const defaultTenant = await prisma.tenant.findFirst({
        where: { status: 'ACTIVE' }
      });
      
      if (defaultTenant) {
        req.tenant = defaultTenant;
        req.tenantId = defaultTenant.id;
        return next();
      } else {
        return res.status(403).json({
          error: 'Aucun tenant actif trouvé',
          code: 'NO_ACTIVE_TENANT'
        });
      }
    } catch (err) {
      console.error('[Tenant] Erreur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // 5. Chercher le tenant par ID ou slug
  try {
    let tenant = null;
    
    if (tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    } else if (tenantSlug) {
      tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    }

    if (!tenant) {
      return res.status(403).json({
        error: 'Tenant invalide ou suspendu',
        code: 'TENANT_INVALID'
      });
    }

    if (tenant.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Tenant suspendu',
        code: 'TENANT_SUSPENDED'
      });
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    
    next();
    
  } catch (err) {
    console.error('[Tenant] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Middleware pour vérifier que l'utilisateur appartient au tenant
const tenantAccessControl = async (req, res, next) => {
  if (!req.tenantId || !req.user) return next();
  
  if (req.user.tenantId && req.user.tenantId !== req.tenantId) {
    return res.status(403).json({
      error: 'Accès interdit - Vous n\'appartenez pas à ce tenant',
      code: 'TENANT_ACCESS_DENIED'
    });
  }
  
  next();
};

// Middleware pour vérifier les limites du plan
const planLimitMiddleware = async (req, res, next) => {
  if (!req.tenant || req.method === 'GET') return next();
  
  const tenant = req.tenant;
  const planLimits = {
    FREE: { users: 3, campagnes: 5, inscriptions: 50 },
    STARTER: { users: 10, campagnes: 20, inscriptions: 500 },
    PRO: { users: 50, campagnes: 100, inscriptions: 5000 },
    ENTERPRISE: { users: Infinity, campagnes: Infinity, inscriptions: Infinity }
  };

  const limits = planLimits[tenant.plan] || planLimits.FREE;
  
  next();
};

module.exports = {
  tenantMiddleware,
  tenantAccessControl,
  planLimitMiddleware,
  tenantStorage
};