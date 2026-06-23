// test-rls.js — Vérification RLS
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRLS() {
  console.log('🔍 Test RLS...\n');

  const tenantId = 'cmqlsn2yu0000ybn5t0unlx8u'; // ID de votre tenant DigiLab

  // 1. Sans RLS (tous les users)
  console.log('1. Sans RLS (prisma standard):');
  const allUsers = await prisma.user.findMany({ take: 5 });
  console.log(`   ${allUsers.length} utilisateurs trouvés\n`);

  // 2. Avec RLS activé manuellement
  console.log('2. Avec RLS (tenantId = DigiLab):');
  await prisma.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '${tenantId}', true)`);
  const tenantUsers = await prisma.user.findMany({ take: 5 });
  console.log(`   ${tenantUsers.length} utilisateurs trouvés\n`);

  // 3. Avec RLS + mauvais tenantId
  console.log('3. Avec RLS (tenantId = FAKE):');
  await prisma.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', 'fake-tenant-id', true)`);
  const fakeUsers = await prisma.user.findMany({ take: 5 });
  console.log(`   ${fakeUsers.length} utilisateurs trouvés (devrait être 0)\n`);

  // 4. Vérifier les policies
  console.log('4. Policies RLS actives:');
  const policies = await prisma.$queryRaw`
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  policies.forEach(p => console.log(`   ${p.tablename} → ${p.policyname}`));

  console.log('\n✅ Test RLS terminé !');
  await prisma.$disconnect();
}

testRLS().catch(e => { console.error(e); process.exit(1); });