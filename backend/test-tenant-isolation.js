const { prisma, getTenantPrisma } = require('./config/prisma');

async function test() {
  const tenantId = 'cmqlsn2yu0000ybn5t0unlx8u'; // Votre tenant DigiLab
  const fakeTenantId = 'fake-tenant-123456';

  console.log('🔍 Test Isolation Multi-Tenant\n');

  // 1. Sans isolation
  console.log('1. Sans isolation (prisma standard):');
  const all = await prisma.user.findMany({ take: 5 });
  console.log(`   ${all.length} utilisateurs\n`);

  // 2. Avec isolation (vrai tenant)
  console.log('2. Avec isolation (DigiLab tenant):');
  const tenantPrisma = getTenantPrisma(tenantId);
  const real = await tenantPrisma.user.findMany({ take: 5 });
  console.log(`   ${real.length} utilisateurs\n`);

  // 3. Avec isolation (fake tenant)
  console.log('3. Avec isolation (FAKE tenant):');
  const fakePrisma = getTenantPrisma(fakeTenantId);
  const fake = await fakePrisma.user.findMany({ take: 5 });
  console.log(`   ${fake.length} utilisateurs (devrait être 0)\n`);

  // 4. Test CREATE avec injection auto
  console.log('4. Test CREATE - tenantId injecté auto:');
  const testPrisma = getTenantPrisma(fakeTenantId);
  try {
    await testPrisma.user.create({
      data: {
        name: 'Test RLS',
        email: 'test-rls@example.com',
        password: 'test123',
        role: 'CLIENT',
        status: 'ACTIVE'
      }
    });
    const created = await prisma.user.findFirst({ where: { email: 'test-rls@example.com' } });
    console.log(`   ✅ Créé avec tenantId: ${created.tenantId}`);
    await prisma.user.delete({ where: { id: created.id } });
    console.log('   ✅ Cleanup\n');
  } catch (e) {
    console.log(`   ❌ Erreur: ${e.message}\n`);
  }

  console.log(fake.length === 0 ? '✅ ISOLATION OK' : '❌ ISOLATION ÉCHOUÉE');
  await prisma.$disconnect();
}

test().catch(e => { console.error(e); process.exit(1); });