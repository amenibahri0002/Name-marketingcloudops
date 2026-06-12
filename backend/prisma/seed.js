// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // ============================================================
  // 1. HASH LES PASSWORDS
  // ============================================================
  const adminHash = await bcrypt.hash('admin123', 10);
  const marketingHash = await bcrypt.hash('marketing123', 10);
  const clientHash = await bcrypt.hash('123456', 10);

  // ============================================================
  // 2. CLIENTS
  // ============================================================
  const digilab = await prisma.client.upsert({
    where: { email: 'amenibahri555@gmail.com' },
    update: {},
    create: {
      name: 'DigiLab Solutions',
      email: 'amenibahri555@gmail.com',
      phone: '+216 22 044 105'
    }
  });

  const ahmedClient = await prisma.client.upsert({
    where: { email: 'ahmed@gmail.com' },
    update: {},
    create: {
      name: 'Ahmed',
      email: 'ahmed@gmail.com',
      phone: null
    }
  });

  console.log('✅ Clients créés');

  // ============================================================
  // 3. UTILISATEURS
  // ============================================================
  await prisma.user.upsert({
    where: { email: 'amenibahri555@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'amenibahri555@gmail.com',
      password: adminHash,
      role: 'ADMIN',
      clientId: digilab.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'bahriameni412@gmail.com' },
    update: {},
    create: {
      name: 'Responsable Marketing',
      email: 'bahriameni412@gmail.com',
      password: marketingHash,
      role: 'RESPONSABLE_MARKETING',
      clientId: digilab.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'ahmed@gmail.com' },
    update: {},
    create: {
      name: 'Ahmed',
      email: 'ahmed@gmail.com',
      password: clientHash,
      role: 'CLIENT',
      clientId: ahmedClient.id
    }
  });

  console.log('✅ Utilisateurs créés');

  // ============================================================
  // 4. FORMATIONS (4 campagnes DigiLab)
  // ============================================================
  const formations = [
    {
      title: "Formation Digital Marketing & AI",
      slug: "formation-digital-marketing-ai",
      type: "FORMATION",
      status: "ACTIVE",
      isPublic: true,
      description: "Maitrisez l'avenir du Marketing Digital avec l'Intelligence Artificielle !",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      duration: "Variable selon programme",
      format: "100% Pratique · Certifiante",
      date: "30 Avril 2026",
      dateScheduled: new Date("2026-04-30"),
      location: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 850,
      prixOriginal: 1200,
      placesTotal: 25,
      placesRestantes: 12,
      dureeHeures: 40,
      iconName: "Sparkles",
      couleur: "#F5A623",
      prerequis: "Aucun prerequis",
      tools: ["Meta", "ChatGPT", "WordPress", "Google Analytics", "Canva"],
      tags: ["IA", "Marketing Digital", "Certifiant"],
      inclus: ["Certificat reconnu", "Support de cours", "Acces aux outils", "Coaching post-formation"],
      clientId: digilab.id
    },
    {
      title: "Formation Web WordPress",
      slug: "formation-web-wordpress",
      type: "FORMATION",
      status: "ACTIVE",
      isPublic: true,
      description: "Maitrisez le web en seulement 18 heures !",
      image: "https://images.unsplash.com/photo-1461749280684-dccae630cd35?w=800",
      duration: "18 heures",
      format: "Intensive · Pratique",
      date: "8 Avril 2026",
      dateScheduled: new Date("2026-04-08"),
      location: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 450,
      prixOriginal: 650,
      placesTotal: 20,
      placesRestantes: 8,
      dureeHeures: 18,
      iconName: "Zap",
      couleur: "#F5A623",
      prerequis: "Ordinateur portable",
      tools: ["WordPress", "Elementor", "SEO", "WooCommerce"],
      tags: ["WordPress", "Web", "Site Pro"],
      inclus: ["Certificat", "Theme premium", "Hebergement 1 an", "Support technique"],
      clientId: digilab.id
    },
    {
      title: "Formation Design Graphique & Marketing Digital",
      slug: "formation-design-graphique-marketing",
      type: "FORMATION",
      status: "ACTIVE",
      isPublic: true,
      description: "Boostez votre carriere avec DigiLab Solutions !",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      duration: "60 heures",
      format: "Week-end · 100% Pratique",
      date: "3 Avril 2026",
      dateScheduled: new Date("2026-04-03"),
      location: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 1200,
      prixOriginal: 1500,
      placesTotal: 15,
      placesRestantes: 5,
      dureeHeures: 60,
      iconName: "Palette",
      couleur: "#F5A623",
      prerequis: "Ordinateur avec 8GB RAM",
      tools: ["Photoshop", "Illustrator", "Canva", "Meta Ads", "Google Ads"],
      tags: ["Design", "Graphisme", "Marketing"],
      inclus: ["Certificat", "Pack Adobe", "Portfolio guide", "Stage pratique"],
      clientId: digilab.id
    },
    {
      title: "Formation Marketing Digital 40H",
      slug: "formation-marketing-digital-40h",
      type: "FORMATION",
      status: "ACTIVE",
      isPublic: true,
      description: "40H pour devenir un pro du Digital !",
      image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800",
      duration: "40 heures",
      format: "Intensive · Complet",
      date: "27 Mars 2026",
      dateScheduled: new Date("2026-03-27"),
      location: "Route Bouzayen Km 5, Immeuble El Bachir, 4eme etage App 4-2 – Sfax, Tunisia",
      contact: "+216 22 044 105",
      prix: 950,
      prixOriginal: 1200,
      placesTotal: 30,
      placesRestantes: 18,
      dureeHeures: 40,
      iconName: "TrendingUp",
      couleur: "#F5A623",
      prerequis: "Connaissances de base en informatique",
      tools: ["Meta", "Google Ads", "SEO", "WordPress", "Growth Hacking"],
      tags: ["SEO", "Google Ads", "Growth Hacking"],
      inclus: ["Certificat", "Outils premium", "Communaute privee", "Mentorat 3 mois"],
      clientId: digilab.id
    }
  ];

  for (const formation of formations) {
    await prisma.campagne.upsert({
      where: { slug: formation.slug },
      update: formation,
      create: formation,
    });
  }

  console.log('✅ 4 formations créées');

  // ============================================================
  // 5. EXEMPLE D'INSCRIPTION (optionnel)
  // ============================================================
  try {
    await prisma.inscription.create({
      data: {
        name: "Jean Test",
        email: "jean.test@example.com",
        phone: "+216 99 999 999",
        campagneId: 1
      }
    });
    console.log('✅ Inscription exemple créée');
  } catch (e) {
    console.log('⚠️ Inscription exemple déjà existante ou erreur');
  }

  // ============================================================
  // 6. CONTACTS (pour campagnes marketing) - CORRIGÉ
  // ============================================================
  const contacts = [
    { name: "Mohamed Ali", email: "mohamed@example.com", phone: "+216 20 111 222", clientId: digilab.id },
    { name: "Sarra Ben", email: "sarra@example.com", phone: "+216 21 333 444", clientId: digilab.id },
    { name: "Karim H.", email: "karim@example.com", phone: "+216 22 555 666", clientId: ahmedClient.id }
  ];

  // Utiliser createMany avec skipDuplicates (si supporté) ou create avec try/catch
  for (const contact of contacts) {
    try {
      await prisma.contact.create({
        data: contact,
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
  // 7. SEGMENTS (marketing)
  // ============================================================
  try {
    const segment = await prisma.segment.create({
      data: {
        name: "Clients intéressés par l'IA",
        criteria: "tags: IA, Marketing Digital",
        clientId: digilab.id
      }
    });
    console.log('✅ Segment créé');
  } catch (e) {
    console.log('⚠️ Segment déjà existant ou erreur');
  }

  // ============================================================
  // RÉCAP
  // ============================================================
  console.log('');
  console.log('🎉 SEED TERMINÉ !');
  console.log('   Clients    : 2');
  console.log('   Users      : 3 (Admin, Marketing, Client)');
  console.log('   Formations : 4');
  console.log('   Contacts   : 3');
  console.log('   Segments   : 1');
  console.log('');
  console.log('🔑 Logins :');
  console.log('   admin@digilab.tn        / admin123');
  console.log('   bahriameni412@gmail.com / marketing123');
  console.log('   ahmed@gmail.com         / 123456');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });