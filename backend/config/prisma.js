const { PrismaClient } = require('@prisma/client');

// ============================================
// CONFIGURATION: Utilise DIRECT_URL pour seeds
// DATABASE_URL (pooled) pour l'app runtime
// ============================================
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// ============================================
// RETRY LOGIC pour cold starts Neon
// ============================================
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 secondes

async function withRetry(operation, operationName = 'DB operation') {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Retry uniquement sur les erreurs de connexion (cold start)
      if (error.code === 'P1001' || error.code === 'P1002' || 
          error.message?.includes('Can\'t reach database server')) {
        console.log(`⚠️  ${operationName} - Tentative ${attempt}/${MAX_RETRIES} (cold start Neon)...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
        continue;
      }

      throw error; // Autres erreurs = ne pas retry
    }
  }

  throw lastError;
}

// ============================================
// LISTE DES TABLES AVEC TENANTID
// ============================================
const TENANT_TABLES = [
  'user', 'client', 'campagne', 'inscription', 'paiement',
  'notification', 'notificationRecipient', 'notificationDelivery',
  'feedback', 'contact', 'segment', 'contactSegment',
  'alerte', 'apiKey', 'pushSubscription', 'pushToken',
  'userNotificationPreference'
];

// ============================================
// EXTENSION: forTenant
// Injecte automatiquement tenantId dans WHERE et CREATE
// ============================================
const forTenant = (tenantId) => {
  if (!tenantId) {
    throw new Error('tenantId requis pour forTenant');
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const lowerModel = model.toLowerCase();

          if (!TENANT_TABLES.includes(lowerModel)) {
            return query(args);
          }

          const newArgs = args ? { ...args } : {};

          if (['findUnique', 'findFirst', 'findMany', 'count', 
               'aggregate', 'groupBy', 'update', 'updateMany', 
               'delete', 'deleteMany', 'upsert'].includes(operation)) {

            if (!newArgs.where) newArgs.where = {};

            if (typeof newArgs.where === 'object' && !Array.isArray(newArgs.where)) {
              if (!newArgs.where.tenantId) {
                newArgs.where = {
                  AND: [
                    { tenantId: tenantId },
                    newArgs.where
                  ]
                };
              }
            }
          }

          if (['create', 'createMany'].includes(operation)) {
            if (!newArgs.data) newArgs.data = {};

            if (Array.isArray(newArgs.data)) {
              newArgs.data = newArgs.data.map(item => ({
                ...item,
                tenantId: tenantId
              }));
            } else {
              if (!newArgs.data.tenantId) {
                newArgs.data = {
                  ...newArgs.data,
                  tenantId: tenantId
                };
              }
            }
          }

          return query(newArgs);
        },
      },
    },
  });
};

// ============================================
// HELPERS
// ============================================
const getTenantPrisma = (tenantId) => forTenant(tenantId);
const getBypassPrisma = () => prisma;

module.exports = {
  prisma,
  forTenant,
  getTenantPrisma,
  getBypassPrisma,
  TENANT_TABLES,
  withRetry
};