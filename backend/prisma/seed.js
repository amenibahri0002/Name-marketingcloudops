// prisma/seed.js - Multi-Tenant DigiPip (Vos données)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed multi-tenant...');

  // ============================================================
  // 1. CREER LE TENANT PRINCIPAL (DigiLab Solutions)
  // ============================================================
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'digilab-solutions' },
    update: {},
    create: {
      name: 'DigiLab Solutions',
      slug: 'digilab-solutions',
      description: 'Agence digitale tunisienne specialisée en marketing cloud',
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
  console.log(`✅ Tenant créé : ${tenant.name} (${tenant.id})`);

  // ============================================================
  // 2. HASH LES PASSWORDS
  // ============================================================
  const adminHash = await bcrypt.hash('admin123', 10);
  const marketingHash = await bcrypt.hash('marketing123', 10);
  const clientHash = await bcrypt.hash('123456', 10);

  // ============================================================
  // 3. UTILISATEURS (avec tenantId)
  // ============================================================

  // Admin
  await prisma.user.upsert({
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
  console.log('✅ Admin créé');

  // Responsable Marketing
  await prisma.user.upsert({
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
  console.log('✅ Responsable Marketing créé');

  // Client Ahmed
  await prisma.user.upsert({
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
  console.log('✅ Client Ahmed créé');

  // Client Amen Bh
  await prisma.user.upsert({
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
  console.log('✅ Client Amen Bh créé');

  // ============================================================
  // 4. CLIENTS EXTERNES (particuliers/entreprises)
  // ============================================================
  const digilabClient = await prisma.client.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'amenibahri555@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'DigiLab Solutions',
      email: 'amenibahri555@gmail.com',
      phone: '+216 22 044 105',
      type: 'ENTREPRISE',
      status: 'ACTIVE',
    }
  });

  const ahmedClient = await prisma.client.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'ahmed@gmail.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Ahmed',
      email: 'ahmed@gmail.com',
      phone: '+216 99 999 999',
      type: 'PARTICULIER',
      status: 'ACTIVE',
    }
  });
  console.log('✅ Clients externes créés');

  // ============================================================
  // 5. FORMATIONS (4 campagnes - avec tenantId)
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
      create: {
        tenantId: tenant.id,
        ...formation,
      },
    });
  }
  console.log('✅ 4 formations créées');

  // ============================================================
  // 6. INSCRIPTION EXEMPLE (avec tenantId)
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
      console.log('✅ Inscription exemple créée');
    }
  } catch (e) {
    console.log('⚠️ Inscription exemple déjà existante ou erreur:', e.message);
  }

  // ============================================================
  // 7. CONTACTS (avec tenantId)
  // ============================================================
  const contacts = [
    { name: "DigiLab Solutions", email: "amenibahri555@gmail.com", phone: "+216 22 044 105" },
    { name: "Ahmed", email: "ahmed@gmail.com", phone: "+216 99 999 999" },
    { name: "amen bh", email: "bhameni24@gmail.com", phone: "+216 22 105 279" }
  ];

  for (const contact of contacts) {
    try {
      await prisma.contact.create({
        data: {
          tenantId: tenant.id,
          ...contact,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`⚠️ Contact ${contact.email} déjà existant`);
      } else {
        console.log(`⚠️ Erreur contact ${contact.email}:`, e.message);
      }
    }
  }
  console.log('✅ Contacts créés');

  // ============================================================
  // 8. SEGMENTS (avec tenantId)
  // ============================================================
  try {
    await prisma.segment.create({
      data: {
        tenantId: tenant.id,
        name: "Clients intéressés par l'IA",
        criteria: "tags: IA, Marketing Digital",
      }
    });
    console.log('✅ Segment créé');
  } catch (e) {
    console.log('⚠️ Segment déjà existant ou erreur:', e.message);
  }

  // ============================================================
  // RÉCAP
  // ============================================================
  console.log('');
  console.log('🎉 SEED MULTI-TENANT TERMINÉ !');
  console.log(`   Tenant     : ${tenant.name} (${tenant.slug})`);
  console.log('   Users      : 4 (Admin, Responsable Marketing, Ahmed, Amen)');
  console.log('   Clients    : 2 (DigiLab Solutions, Ahmed)');
  console.log('   Formations : 4');
  console.log('   Contacts   : 3');
  console.log('   Segments   : 1');
  console.log('');
  console.log('🔑 Logins :');
  console.log('   amenibahri555@gmail.com        / admin123');
  console.log('   bahriameni412@gmail.com / marketing123');
  console.log('   ahmed@gmail.com         / 123456');
  console.log('   bhameni24@gmail.com     / 123456');
}

main()
  .catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });