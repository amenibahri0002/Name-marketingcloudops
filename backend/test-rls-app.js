// test-rls-app.js — Test isolation applicative Prisma Extension
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simuler l'extension forTenant
const TENANT_TABLES = [
  'user', 'client', 'campagne', 'inscription', 'paiement',
  'notification', 'notificationRecipient', 'notificationDelivery',
  'feedback', 'contact', 'segment', 'contactSegment',
  'alerte', 'apiKey', 'pushSubscription', 'pushToken',
  'userNotificationPreference'
];

const forTenant = (tenantId) => {
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

async function testAppIsolation() {
  console.log('🔍 Test Isolation Applicative...\n');

  const tenantId = 'cmqlsn2yu0000ybn5t0unlx8u';
  const fakeTenantId = 'fake-tenant-123';

  // 1. Sans isolation
  console.log('1. Sans isolation (prisma standard):');
  const allUsers = await prisma.user.findMany({ take: 5 });
  console.log(`   ${allUsers.length} utilisateurs trouvés\n`);

  // 2. Avec isolation (DigiLab tenant)
  console.log('2. Avec isolation (tenantId = DigiLab):');
  const tenantPrisma = forTenant(tenantId);
  const tenantUsers = await tenantPrisma.user.findMany({ take: 5 });
  console.log(`   ${tenantUsers.length} utilisateurs trouvés\n`);

  // 3. Avec isolation (fake tenant)
  console.log('3. Avec isolation (tenantId = FAKE):');
  const fakePrisma = forTenant(fakeTenantId);
  const fakeUsers = await fakePrisma.user.findMany({ take: 5 });
  console.log(`   ${fakeUsers.length} utilisateurs trouvés (devrait être 0)\n`);

  // 4. Test CREATE avec injection auto
  console.log('4. Test CREATE avec injection tenantId:');
  try {
    const newPrisma = forTenant(fakeTenantId);
    await newPrisma.user.create({
      data: {
        name: 'Test User',
        email: 'test-rls@example.com',
        password: 'test123',
        role: 'CLIENT',
        status: 'ACTIVE'
      }
    });
    console.log('   ✅ User cree avec tenantId injecte');

    // Verifier que le tenantId est bien le fake
    const created = await prisma.user.findFirst({
      where: { email: 'test-rls@example.com' }
    });
    console.log(`   tenantId du user cree: ${created.tenantId} (devrait etre ${fakeTenantId})`);

    // Cleanup
    await prisma.user.delete({ where: { id: created.id } });
    console.log('   ✅ Cleanup effectue\n');
  } catch (e) {
    console.log(`   ❌ Erreur: ${e.message}\n`);
  }

  console.log('✅ Test isolation applicative termine !');
  await prisma.$disconnect();
}

testAppIsolation().catch(e => { console.error('❌ Erreur:', e); process.exit(1); });