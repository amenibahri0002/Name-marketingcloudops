// test-rls-neon.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRLS() {
  console.log('🔍 Test RLS avec $transaction...\n');

  const tenantId = 'cmqlsn2yu0000ybn5t0unlx8u';
  const fakeTenantId = 'fake-tenant-123';

  // Test 1 : Transaction manuelle avec set_config
  console.log('1. Transaction + set_config (FAKE tenant):');
  const result1 = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${fakeTenantId}::text, true)`;
    return tx.user.findMany({ take: 5 });
  });
  console.log(`   ${result1.length} utilisateurs (devrait être 0)\n`);

  // Test 2 : Transaction avec vrai tenant
  console.log('2. Transaction + set_config (DigiLab tenant):');
  const result2 = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}::text, true)`;
    return tx.user.findMany({ take: 5 });
  });
  console.log(`   ${result2.length} utilisateurs (devrait être 4)\n`);

  // Test 3 : Sans transaction (set_config seul)
  console.log('3. Sans transaction (set_config seul + FAKE):');
  await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${fakeTenantId}::text, true)`;
  const result3 = await prisma.user.findMany({ take: 5 });
  console.log(`   ${result3.length} utilisateurs (Neon: probablement 5)\n`);

  console.log('✅ Test terminé');
  await prisma.$disconnect();
}

testRLS().catch(e => { console.error(e); process.exit(1); });