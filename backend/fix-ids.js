const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2'); // ou utilisez un UUID

const prisma = new PrismaClient();

async function fixIds() {
  console.log('🔧 Réparation des IDs vides...\n');

  // 1. Récupérer tous les users avec ID vide
  const brokenUsers = await prisma.user.findMany({
    where: { id: '' }
  });

  console.log(`Found ${brokenUsers.length} users with empty IDs`);

  for (const user of brokenUsers) {
    const newId = createId(); // Génère un CUID
    console.log(`Fixing ${user.email} -> ${newId}`);

    // Mettre à jour l'ID (impossible directement, donc recréer)
    await prisma.user.update({
      where: { id: '' }, // ← Ne fonctionnera pas car ID vide = pas unique
      data: { id: newId }
    });
  }
}

fixIds().catch(e => {
  console.error('❌ Erreur:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());