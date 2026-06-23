const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  await prisma.$transaction([
    prisma.notificationDelivery.deleteMany(),
    prisma.notificationRecipient.deleteMany(),
    prisma.pushToken.deleteMany(),
    prisma.pushSubscription.deleteMany(),
    prisma.userNotificationPreference.deleteMany(),
    prisma.paiement.deleteMany(),
    prisma.inscription.deleteMany(),
    prisma.feedback.deleteMany(),
    prisma.contactSegment.deleteMany(),
    prisma.segment.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.alerte.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.client.deleteMany(),
    prisma.campagne.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tenant.deleteMany(),
  ]);
  console.log('Base nettoyee');
  await prisma.$disconnect();
}

clean().catch(e => { console.error(e); process.exit(1); });