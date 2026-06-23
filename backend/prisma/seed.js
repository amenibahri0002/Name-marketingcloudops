// prisma/seed.js - Multi-Tenant DigiPip avec RLS
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// ============================================================
// FONCTION RLS - A executer UNE SEULE FOIS
// ============================================================
async function applyRLS() {
  console.log('🔒 Application des politiques RLS...');

  const tables = [
    'User', 'Client', 'Campagne', 'Inscription', 'Paiement',
    'Notification', 'NotificationRecipient', 'NotificationDelivery',
    'Feedback', 'Contact', 'Segment', 'ContactSegment',
    'Alerte', 'ApiKey', 'PushSubscription', 'PushToken',
    'UserNotificationPreference'
  ];

  try {
    // 1. Activer RLS sur chaque table
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✅ RLS active sur ${table}`);
    }

    // 2. Creer la fonction set_tenant_context
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id text)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_tenant_id', tenant_id, false);
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('  ✅ Fonction set_tenant_context creee');

    // 3. Creer les policies (supprimer si existent deja)
    const policies = [
      { table: 'User', column: 'tenantId' },
      { table: 'Client', column: 'tenantId' },
      { table: 'Campagne', column: 'tenantId' },
      { table: 'Inscription', column: 'tenantId' },
      { table: 'Paiement', column: 'tenantId' },
      { table: 'Notification', column: 'tenantId' },
      { table: 'Feedback', column: 'tenantId' },
      { table: 'Contact', column: 'tenantId' },
      { table: 'Segment', column: 'tenantId' },
      { table: 'Alerte', column: 'tenantId' },
      { table: 'ApiKey', column: 'tenantId' },
      { table: 'PushSubscription', column: 'tenantId' },
      { table: 'UserNotificationPreference', column: 'tenantId' },
    ];

    for (const { table, column } of policies) {
      await prisma.$executeRawUnsafe(`
        DROP POLICY IF EXISTS tenant_isolation_${table.toLowerCase()} ON "${table}";
      `);
      await prisma.$executeRawUnsafe(`
        CREATE POLICY tenant_isolation_${table.toLowerCase()} ON "${table}"
          USING ("${column}" = current_setting('app.current_tenant_id')::text);
      `);
      console.log(`  ✅ Policy creee pour ${table}`);
    }

    // 4. Policies speciales (tables sans tenantId direct)
     // 4. Policies speciales (tables sans tenantId direct)

    // NotificationRecipient
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "tenant_isolation_notification_recipient" ON "NotificationRecipient";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "tenant_isolation_notification_recipient" ON "NotificationRecipient" ` +
        `USING (EXISTS (SELECT 1 FROM "Notification" n WHERE n.id = "NotificationRecipient"."notificationId" AND n."tenantId" = current_setting('app.current_tenant_id')::text));`
      );
      console.log('  ✅ Policy NotificationRecipient');
    } catch (e) {
      console.log(`  ❌ NotificationRecipient: ${e.meta?.message || e.message}`);
    }

    // NotificationDelivery
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "tenant_isolation_notification_delivery" ON "NotificationDelivery";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "tenant_isolation_notification_delivery" ON "NotificationDelivery" ` +
        `USING (EXISTS (SELECT 1 FROM "Notification" n WHERE n.id = "NotificationDelivery"."notificationId" AND n."tenantId" = current_setting('app.current_tenant_id')::text));`
      );
      console.log('  ✅ Policy NotificationDelivery');
    } catch (e) {
      console.log(`  ❌ NotificationDelivery: ${e.meta?.message || e.message}`);
    }

    // ContactSegment
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "tenant_isolation_contact_segment" ON "ContactSegment";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "tenant_isolation_contact_segment" ON "ContactSegment" ` +
        `USING (EXISTS (SELECT 1 FROM "Contact" c WHERE c.id = "ContactSegment"."contactId" AND c."tenantId" = current_setting('app.current_tenant_id')::text));`
      );
      console.log('  ✅ Policy ContactSegment');
    } catch (e) {
      console.log(`  ❌ ContactSegment: ${e.meta?.message || e.message}`);
    }

    // PushToken
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "tenant_isolation_push_token" ON "PushToken";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "tenant_isolation_push_token" ON "PushToken" ` +
        `USING (EXISTS (SELECT 1 FROM "User" u WHERE u.id = "PushToken"."userId" AND u."tenantId" = current_setting('app.current_tenant_id')::text));`
      );
      console.log('  ✅ Policy PushToken');
    } catch (e) {
      console.log(`  ❌ PushToken: ${e.meta?.message || e.message}`);
    }

    // 5. Indexes supplementaires
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_user_tenant_email" ON "User"("tenantId", "email")',
      'CREATE INDEX IF NOT EXISTS "idx_campagne_tenant_status" ON "Campagne"("tenantId", "status")',
      'CREATE INDEX IF NOT EXISTS "idx_inscription_tenant_status" ON "Inscription"("tenantId", "status")',
      'CREATE INDEX IF NOT EXISTS "idx_paiement_tenant_status" ON "Paiement"("tenantId", "status")',
      'CREATE INDEX IF NOT EXISTS "idx_contact_tenant_type" ON "Contact"("tenantId", "type")',
    ];

    for (const indexSql of indexes) {
      await prisma.$executeRawUnsafe(indexSql);
    }
    console.log('  ✅ Indexes supplementaires crees');

    console.log('\n🎉 RLS applique avec succes !');
    return true;

  } catch (error) {
    console.error('❌ Erreur RLS:', error);
    return false;
  }
}

// ============================================================
// SEED PRINCIPAL
// ============================================================
async function main() {
  console.log('🌱 Debut du seed multi-tenant...');

  // 1. APPLIQUER RLS (une seule fois)
  await applyRLS();

  // ============================================================
  // 2. CREER LE TENANT PRINCIPAL (DigiLab Solutions)
  // ============================================================
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'digilab-solutions' },
    update: {},
    create: {
      name: 'DigiLab Solutions',
      slug: 'digilab-solutions',
      description: 'Agence digitale tunisienne specialisee en marketing cloud',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      subdomain: 'digilab',
      settings: {
        theme: 'light',
        language: 'fr',
        currency: 'TND',
        timezone: 'Africa/Tunis',
        primaryColor: '#3b82f6',
      },
    }
  });
  console.log(`✅ Tenant cree : ${tenant.name} (${tenant.id})`);

  // ============================================================
  // 3. HASH LES PASSWORDS
  // ============================================================
  const adminHash = await bcrypt.hash('admin123', 10);
  const marketingHash = await bcrypt.hash('marketing123', 10);
  const clientHash = await bcrypt.hash('123456', 10);

  // ============================================================
  // 4. UTILISATEURS (avec tenantId)
  // ============================================================
  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'amenibahri555@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Admin',
      email: 'amenibahri555@gmail.com',
      password: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Admin cree');

  const marketingUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'bahriameni412@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Responsable Marketing',
      email: 'bahriameni412@gmail.com',
      password: marketingHash,
      role: 'RESPONSABLE_MARKETING',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Responsable Marketing cree');

  const ahmedUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'ahmed@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Ahmed',
      email: 'ahmed@gmail.com',
      password: clientHash,
      role: 'CLIENT',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Client Ahmed cree');

 const amenUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'bhameni24@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'amen bh',
      email: 'bhameni24@gmail.com',
      password: clientHash,
      role: 'CLIENT',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Client Amen Bh cree');

  // ============================================================
  // 5. CLIENTS EXTERNES
  // ============================================================
  await prisma.client.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'amenibahri555@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      name: 'DigiLab Solutions',
      email: 'amenibahri555@gmail.com',
      phone: '+216 22 044 105',
      type: 'ENTREPRISE',
      status: 'ACTIVE',
    }
  });

  await prisma.client.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'ahmed@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: ahmedUser.id,
      name: 'Ahmed',
      email: 'ahmed@gmail.com',
      phone: '+216 99 999 999',
      type: 'PARTICULIER',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Clients externes crees');

  // ============================================================
  // 6. FORMATIONS (4 campagnes)
  // ============================================================
  const formations = [
    {
      title: "Formation Digital Marketing & AI",
      slug: "formation-digital-marketing-ai",
      type: "FORMATION",
      status: "ACTIVE",
      published: true,
      description: "Maitrisez l'avenir du Marketing Digital avec l'Intelligence Artificielle !",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      duree: "Variable selon programme",
      format: "100% Pratique · Certifiante",
      dateAffichee: "30 Avril 2026",
      dateScheduled: new Date("2026-04-30"),
      lieu: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 850,
      prixOriginal: 1200,
      placesTotal: 25,
      placesRestantes: 12,
      dureeHeures: 40,
    },
    {
      title: "Formation Web WordPress",
      slug: "formation-web-wordpress",
      type: "FORMATION",
      status: "ACTIVE",
      published: true,
      description: "Maitrisez le web en seulement 18 heures !",
      image: "https://images.unsplash.com/photo-1461749280684-dccae630cd35?w=800",
      duree: "18 heures",
      format: "Intensive · Pratique",
      dateAffichee: "8 Avril 2026",
      dateScheduled: new Date("2026-04-08"),
      lieu: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 450,
      prixOriginal: 650,
      placesTotal: 20,
      placesRestantes: 8,
      dureeHeures: 18,
    },
    {
      title: "Formation Design Graphique & Marketing Digital",
      slug: "formation-design-graphique-marketing",
      type: "FORMATION",
      status: "ACTIVE",
      published: true,
      description: "Boostez votre carriere avec DigiLab Solutions !",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      duree: "60 heures",
      format: "Week-end · 100% Pratique",
      dateAffichee: "3 Avril 2026",
      dateScheduled: new Date("2026-04-03"),
      lieu: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 1200,
      prixOriginal: 1500,
      placesTotal: 15,
      placesRestantes: 5,
      dureeHeures: 60,
    },
    {
      title: "Formation Marketing Digital 40H",
      slug: "formation-marketing-digital-40h",
      type: "FORMATION",
      status: "ACTIVE",
      published: true,
      description: "40H pour devenir un pro du Digital !",
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800",
      duree: "40 heures",
      format: "Intensive · Complet",
      dateAffichee: "27 Mars 2026",
      dateScheduled: new Date("2026-03-27"),
      lieu: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 950,
      prixOriginal: 1200,
      placesTotal: 30,
      placesRestantes: 18,
      dureeHeures: 40,
    }
  ];

  for (const formation of formations) {
    await prisma.campagne.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: formation.slug } },
      update: formation,
      create: { tenantId: tenant.id, ...formation },
    });
  }
  console.log('✅ 4 formations creees');

  // ============================================================
  // 7. INSCRIPTION EXEMPLE
  // ============================================================
  try {
    const firstCampagne = await prisma.campagne.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'asc' }
    });

    if (firstCampagne) {
      await prisma.inscription.create({
        data: {
          tenantId: tenant.id,
          name: "amen bh",
          email: "bhameni24@gmail.com",
          phone: "+216 22 105 279",
          campagneId: firstCampagne.id,
          status: 'CONFIRMEE',
        }
      });
      console.log('✅ Inscription exemple creee');
    }
  } catch (e) {
    console.log('⚠️ Inscription exemple deja existante');
  }

  // ============================================================
  // 8. CONTACTS
  // ============================================================
  const contacts = [
    { name: "DigiLab Solutions", email: "amenibahri555@gmail.com", phone: "+216 22 044 105" },
    { name: "Ahmed", email: "ahmed@gmail.com", phone: "+216 99 999 999" },
    { name: "amen bh", email: "bhameni24@gmail.com", phone: "+216 22 105 279" }
  ];

  for (const contact of contacts) {
    try {
      await prisma.contact.create({ data: { tenantId: tenant.id, ...contact } });
    } catch (e) {
      if (e.code === 'P2002') console.log(`⚠️ Contact ${contact.email} deja existant`);
    }
  }
  console.log('✅ Contacts crees');

  // ============================================================
  // 9. SEGMENTS
  // ============================================================
  try {
    await prisma.segment.create({
      data: {
        tenantId: tenant.id,
        name: "Clients interesses par l'IA",
        criteria: "tags: IA, Marketing Digital",
      }
    });
    console.log('✅ Segment cree');
  } catch (e) {
    console.log('⚠️ Segment deja existant');
  }

  // ============================================================
  // RECAP
  // ============================================================
  console.log('');
  console.log('🎉 SEED MULTI-TENANT TERMINE !');
  console.log(`   Tenant     : ${tenant.name} (${tenant.slug})`);
  console.log('   Users      : 4');
  console.log('   Clients    : 2');
  console.log('   Formations : 4');
  console.log('   Contacts   : 3');
  console.log('   Segments   : 1');
  console.log('');
  console.log('🔑 Logins :');
  console.log('   amenibahri555@gmail.com / admin123');
  console.log('   bahriameni412@gmail.com / marketing123');
  console.log('   ahmed@gmail.com         / 123456');
  console.log('   bhameni24@gmail.com     / 123456');
}

main()
  .catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });