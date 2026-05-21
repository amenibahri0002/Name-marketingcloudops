const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool } = require('@neondatabase/serverless');

// Initialise le Pool avec Neon
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

// Crée une instance unique de PrismaClient
const prisma = new PrismaClient({ adapter });

// Exporte l'instance
module.exports = prisma;