const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool } = require('@neondatabase/serverless');

// Initialise le Pool et l'adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seed pour TechEvent...');

  // 1. Crée ou met à jour le client TechEvent
  const client = await prisma.client.upsert({
    where: { email: 'contact@techevent.tn' },
    update: {},
    create: {
      name: 'TechEventCo',
      email: 'contact@techevent.tn',
      phone: '+216 12 345 678',
    },
  });
  console.log('✅ Client TechEvent:', client.name);

  // 2. Crée ou met à jour la campagne
  const campagne = await prisma.campagne.upsert({
    where: { title: 'Conférence Intelligence Artificielle 2026' },
    update: {},
    create: {
      title: 'Conférence Intelligence Artificielle 2026',
      type: 'Événement',
      description: 'Rejoignez-nous pour une journée dédiée à l\'IA.',
      isPublic: true,
      dateScheduled: new Date('2026-06-15T10:00:00+01:00'),
      clientId: client.id,
    },
  });
  console.log('✅ Campagne TechEvent:', campagne.title);

  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });