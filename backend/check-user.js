const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'amenibahri555@gmail.com' }
  });
  console.log('User:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

check();