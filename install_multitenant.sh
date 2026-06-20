#!/bin/bash
# ============================================
# SCRIPT D'INSTALLATION MULTI-TENANT DIGIPIP
# ============================================
# Ce script automatise l'installation complète
# de l'architecture multi-tenant

set -e

echo "========================================"
echo "  DigiPip — Installation Multi-Tenant"
echo "========================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Erreur : Vous devez exécuter ce script depuis la racine du projet${NC}"
    echo "Structure attendue :"
    echo "  ./backend/"
    echo "  ./frontend/"
    exit 1
fi

echo -e "${BLUE}Etape 1/8 — Sauvegarde du schéma actuel...${NC}"
if [ -f "backend/prisma/schema.prisma" ]; then
    cp backend/prisma/schema.prisma backend/prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}  Sauvegarde créée${NC}"
else
    echo -e "${YELLOW}  Aucun schéma existant trouvé${NC}"
fi

echo ""
echo -e "${BLUE}Etape 2/8 — Copie du nouveau schéma Prisma...${NC}"
cat > backend/prisma/schema.prisma << 'PRISMA_EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// TENANT — Noyau de l'architecture multi-tenant
// ============================================
model Tenant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?
  status      TenantStatus @default(ACTIVE)
  plan        PlanType @default(FREE)

  domain      String?  @unique
  subdomain   String?  @unique
  settings    Json?    @default("{}")

  maxUsers        Int @default(5)
  maxCampagnes    Int @default(10)
  maxInscriptions Int @default(100)

  users        User[]
  clients      Client[]
  campagnes    Campagne[]
  inscriptions Inscription[]
  paiements    Paiement[]
  notifications Notification[]
  feedbacks    Feedback[]
  contacts     Contact[]
  segments     Segment[]
  alertes      Alerte[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([status])
  @@index([plan])
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  PENDING
  CANCELLED
}

enum PlanType {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// ============================================
// USER
// ============================================
model User {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  email     String
  password  String
  role      UserRole @default(CLIENT)
  status    UserStatus @default(ACTIVE)

  phone     String?
  avatar    String?
  fcmToken  String?

  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inscriptions Inscription[]
  paiements    Paiement[]
  notifications Notification[]
  feedbacks    Feedback[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([tenantId, role])
  @@index([tenantId, status])
}

enum UserRole {
  CLIENT
  ADMIN
  RESPONSABLE_MARKETING
  SUPPORT
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

// ============================================
// CLIENT
// ============================================
model Client {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  email     String
  phone     String?
  password  String?

  type      ClientType @default(PARTICULIER)
  sector    String?
  company   String?

  status    ClientStatus @default(ACTIVE)
  fcmToken  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inscriptions Inscription[]
  feedbacks    Feedback[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([tenantId, type])
  @@index([tenantId, status])
}

enum ClientType {
  PARTICULIER
  ENTREPRISE
  ASSOCIATION
  INSTITUTION
}

enum ClientStatus {
  ACTIVE
  INACTIVE
  PROSPECT
  ARCHIVED
}

// ============================================
// CAMPAGNE
// ============================================
model Campagne {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  title       String
  slug        String
  description String?  @db.Text

  type        CampagneType @default(FORMATION)
  status      CampagneStatus @default(DRAFT)
  published   Boolean @default(false)

  image       String?
  prix        Int?
  prixOriginal Int?
  placesTotal  Int @default(20)
  placesRestantes Int @default(20)

  dateScheduled DateTime?
  dateAffichee  String?
  duree         String?
  format        String?
  dureeHeures   Int?
  lieu          String?
  contact       String?

  inscriptions Inscription[]
  feedbacks    Feedback[]
  notifications Notification[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, type])
  @@index([tenantId, published])
}

enum CampagneType {
  FORMATION
  PRODUIT
  EVENEMENT
  WEBINAIRE
  NEWSLETTER
  MARKETING
}

enum CampagneStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

// ============================================
// INSCRIPTION
// ============================================
model Inscription {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name        String
  email       String
  phone       String?

  campagneId  String
  campagne    Campagne @relation(fields: [campagneId], references: [id], onDelete: Cascade)

  formule     String?
  paymentType String?
  prixTotal   Int?
  status      InscriptionStatus @default(EN_ATTENTE)
  paymentData Json?

  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  clientId    String?
  client      Client?  @relation(fields: [clientId], references: [id])
  paiements   Paiement[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([campagneId])
  @@index([userId])
  @@index([clientId])
}

enum InscriptionStatus {
  EN_ATTENTE
  CONFIRMEE
  PAYEE
  ANNULEE
  TERMINEE
}

// ============================================
// PAIEMENT
// ============================================
model Paiement {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  montant       Int
  mode          PaymentMode @default(CARTE)
  status        PaymentStatus @default(EN_ATTENTE)
  reference     String?  @unique

  inscriptionId String?
  inscription   Inscription? @relation(fields: [inscriptionId], references: [id])
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])

  stripePaymentIntentId String?
  stripeCustomerId      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([inscriptionId])
}

enum PaymentMode {
  CARTE
  VIREMENT
  ESPECES
  CHEQUE
  EN_LIGNE
}

enum PaymentStatus {
  EN_ATTENTE
  PAYE
  ECHOUE
  REMBOURSE
  ANNULE
}

// ============================================
// NOTIFICATION
// ============================================
model Notification {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  title     String
  message   String   @db.Text
  type      NotificationType @default(RAPPEL)
  canal     NotificationCanal @default(EMAIL)

  isRead    Boolean @default(false)
  sentAt    DateTime?

  campagneId String?
  campagne   Campagne? @relation(fields: [campagneId], references: [id])
  userId     String?
  user       User?     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([tenantId])
  @@index([tenantId, userId])
  @@index([tenantId, isRead])
}

enum NotificationType {
  PROMOTION
  NOUVELLE_CAMPAGNE
  RAPPEL
  ALERTE
  CONFIRMATION
  FACTURE
}

enum NotificationCanal {
  EMAIL
  SMS
  PUSH
  WHATSAPP
  SOCIAL
  IN_APP
}

// ============================================
// FEEDBACK
// ============================================
model Feedback {
  id         String   @id @default(cuid())
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  rating     Int      @default(5)
  comment    String?  @db.Text

  campagneId String
  campagne   Campagne @relation(fields: [campagneId], references: [id], onDelete: Cascade)

  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  clientId   String?
  client     Client?  @relation(fields: [clientId], references: [id])

  createdAt DateTime @default(now())

  @@index([tenantId])
  @@index([tenantId, campagneId])
  @@index([tenantId, rating])
}

// ============================================
// CONTACT
// ============================================
model Contact {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  email     String
  phone     String?

  niveau    NiveauType @default(DEBUTANT)
  type      ContactType @default(PARTICULIER)
  secteur   String?
  region    String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  segments  ContactSegment[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([tenantId, niveau])
  @@index([tenantId, type])
}

enum NiveauType {
  DEBUTANT
  ETUDIANT
  PROFESSIONNEL
  EXPERT
}

enum ContactType {
  PARTICULIER
  ENTREPRISE
  ASSOCIATION
}

// ============================================
// SEGMENT
// ============================================
model Segment {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  criteria  String?  @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  contacts  ContactSegment[]

  @@index([tenantId])
}

model ContactSegment {
  id        String   @id @default(cuid())
  contactId String
  contact   Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  segmentId String
  segment   Segment  @relation(fields: [segmentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([contactId, segmentId])
  @@index([segmentId])
}

// ============================================
// ALERTE
// ============================================
model Alerte {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  type        AlerteType
  message     String   @db.Text
  status      AlerteStatus @default(ACTIVE)
  severity    Severity @default(MEDIUM)

  resolvedAt  DateTime?
  resolvedBy  String?

  createdAt DateTime @default(now())

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, severity])
}

enum AlerteType {
  CAPACITE
  PAIEMENT
  INSCRIPTION
  SYSTEME
  SECURITE
}

enum AlerteStatus {
  ACTIVE
  RESOLUE
  IGNOREE
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// ============================================
// PUSH SUBSCRIPTION
// ============================================
model PushSubscription {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  endpoint  String
  p256dh    String
  auth      String

  userId    String?

  createdAt DateTime @default(now())

  @@unique([tenantId, endpoint])
  @@index([tenantId])
  @@index([tenantId, userId])
}

// ============================================
// API KEY
// ============================================
model ApiKey {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  key       String   @unique
  scopes    String[] @default(["read"])
  lastUsed  DateTime?
  expiresAt DateTime?

  createdAt DateTime @default(now())

  @@index([tenantId])
  @@index([key])
}
PRISMA_EOF

echo -e "${GREEN}  Schéma Prisma copié avec succès${NC}"

echo ""
echo -e "${BLUE}Etape 3/8 — Migration de la base de données...${NC}"
cd backend
npx prisma migrate dev --name add_multitenant --accept-data-loss
echo -e "${GREEN}  Migration terminée${NC}"

echo ""
echo -e "${BLUE}Etape 4/8 — Génération du client Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}  Client Prisma généré${NC}"

cd ..

echo ""
echo -e "${BLUE}Etape 5/8 — Création du middleware tenant...${NC}"
mkdir -p backend/middleware
cat > backend/middleware/tenant.js << 'MIDDLEWARE_EOF'
const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('async_hooks');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const TENANT_MODELS = new Set([
  'User', 'Client', 'Campagne', 'Inscription', 'Paiement',
  'Notification', 'Feedback', 'Contact', 'Segment',
  'ContactSegment', 'Alerte', 'PushSubscription', 'ApiKey',
]);

function isTenantModel(model) {
  return TENANT_MODELS.has(model);
}

const tenantStorage = new AsyncLocalStorage();

function getCurrentTenantId() {
  const store = tenantStorage.getStore();
  return store?.tenantId || null;
}

function runWithTenant(tenantId, callback) {
  return tenantStorage.run({ tenantId }, callback);
}

// Extension Prisma avec isolation automatique
const prismaWithTenant = prisma.$extends({
  query: {
    $allModels: {
      async findUnique({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async findMany({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async count({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async create({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.data = { ...args.data, tenantId };
        }
        return query(args);
      },
      async createMany({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.data = args.data.map(d => ({ ...d, tenantId }));
        }
        return query(args);
      },
      async update({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async updateMany({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async delete({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async deleteMany({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async aggregate({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
      async groupBy({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && isTenantModel(model)) {
          args.where = { ...args.where, tenantId };
        }
        return query(args);
      },
    },
  },
});

// Middleware Express
function tenantMiddleware(req, res, next) {
  let tenantId = null;
  let tenantSlug = null;

  if (req.headers['x-tenant-id']) {
    tenantId = req.headers['x-tenant-id'];
  } else if (req.headers.host) {
    const host = req.headers.host;
    const subdomain = host.split('.')[0];
    if (subdomain && !['www', 'app', 'api', 'localhost'].includes(subdomain)) {
      tenantSlug = subdomain;
    }
  } else if (req.user?.tenantId) {
    tenantId = req.user.tenantId;
  }

  if (tenantSlug && !tenantId) {
    prisma.tenant.findUnique({ where: { slug: tenantSlug } })
      .then(tenant => {
        if (!tenant || tenant.status !== 'ACTIVE') {
          return res.status(403).json({ error: 'Tenant invalide', code: 'TENANT_INVALID' });
        }
        req.tenant = tenant;
        req.tenantId = tenant.id;
        runWithTenant(tenant.id, () => next());
      })
      .catch(err => {
        console.error('[Tenant] Erreur:', err);
        res.status(500).json({ error: 'Erreur tenant' });
      });
    return;
  }

  if (tenantId) {
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, status: true, name: true, plan: true, settings: true }
    })
      .then(tenant => {
        if (!tenant || tenant.status !== 'ACTIVE') {
          return res.status(403).json({ error: 'Tenant invalide', code: 'TENANT_INVALID' });
        }
        req.tenant = tenant;
        req.tenantId = tenant.id;
        runWithTenant(tenant.id, () => next());
      })
      .catch(err => {
        console.error('[Tenant] Erreur:', err);
        res.status(500).json({ error: 'Erreur tenant' });
      });
    return;
  }

  req.tenant = null;
  req.tenantId = null;
  next();
}

function tenantAccessControl(req, res, next) {
  if (!req.tenantId) return next();
  if (req.user && req.user.role !== 'SUPER_ADMIN' && req.user.tenantId !== req.tenantId) {
    return res.status(403).json({ error: 'Acces interdit', code: 'TENANT_ACCESS_DENIED' });
  }
  next();
}

function planLimitMiddleware(req, res, next) {
  if (!req.tenant) return next();
  const limits = {
    FREE: { maxUsers: 3, maxCampagnes: 5, maxInscriptions: 50 },
    STARTER: { maxUsers: 10, maxCampagnes: 20, maxInscriptions: 500 },
    PRO: { maxUsers: 50, maxCampagnes: 100, maxInscriptions: 5000 },
    ENTERPRISE: { maxUsers: Infinity, maxCampagnes: Infinity, maxInscriptions: Infinity },
  };
  req.planLimits = limits[req.tenant.plan] || limits.FREE;
  next();
}

async function createTenant(data) {
  return prisma.tenant.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      plan: (data.plan || 'FREE').toUpperCase(),
      domain: data.domain,
      subdomain: data.subdomain,
      status: 'ACTIVE',
      settings: data.settings || {},
    }
  });
}

async function getTenantStats(tenantId) {
  const [users, clients, campagnes, inscriptions, paiements, notifications, feedbacks] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.client.count({ where: { tenantId } }),
    prisma.campagne.count({ where: { tenantId } }),
    prisma.inscription.count({ where: { tenantId } }),
    prisma.paiement.count({ where: { tenantId } }),
    prisma.notification.count({ where: { tenantId } }),
    prisma.feedback.count({ where: { tenantId } }),
  ]);
  return { users, clients, campagnes, inscriptions, paiements, notifications, feedbacks };
}

module.exports = {
  prisma,
  prismaWithTenant,
  tenantMiddleware,
  planLimitMiddleware,
  tenantAccessControl,
  getCurrentTenantId,
  runWithTenant,
  createTenant,
  getTenantStats,
  TENANT_MODELS,
};
MIDDLEWARE_EOF

echo -e "${GREEN}  Middleware tenant créé${NC}"

echo ""
echo -e "${BLUE}Etape 6/8 — Création du seed initial...${NC}"
cat > backend/prisma/seed.js << 'SEED_EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Seeding DigiPip Multi-Tenant...\n');

  // Créer le tenant DigiLab Solutions
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
  console.log(`  ✅ Tenant créé : ${tenant.name} (${tenant.id})`);

  // Créer l'admin
  const adminPassword = await bcrypt.hash('AdminDigiPip2024!', 12);
  const admin = await prisma.user.upsert({
    where: { 
      tenantId_email: { tenantId: tenant.id, email: 'admin@digilab.tn' }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Administrateur',
      email: 'admin@digilab.tn',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });
  console.log(`  ✅ Admin créé : ${admin.email}`);

  // Créer le responsable marketing
  const rmPassword = await bcrypt.hash('RMDigiPip2024!', 12);
  const rm = await prisma.user.upsert({
    where: { 
      tenantId_email: { tenantId: tenant.id, email: 'rm@digilab.tn' }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Responsable Marketing',
      email: 'rm@digilab.tn',
      password: rmPassword,
      role: 'RESPONSABLE_MARKETING',
      status: 'ACTIVE',
    }
  });
  console.log(`  ✅ Responsable Marketing créé : ${rm.email}`);

  // Créer un client test
  const clientPassword = await bcrypt.hash('ClientDigiPip2024!', 12);
  const client = await prisma.user.upsert({
    where: { 
      tenantId_email: { tenantId: tenant.id, email: 'client@test.tn' }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Client Test',
      email: 'client@test.tn',
      password: clientPassword,
      role: 'CLIENT',
      status: 'ACTIVE',
    }
  });
  console.log(`  ✅ Client test créé : ${client.email}`);

  // Créer quelques campagnes
  const campagnes = [
    { title: 'Marketing Digital 40H', slug: 'marketing-digital-40h', type: 'FORMATION', prix: 2900, placesTotal: 20 },
    { title: 'Design Graphique', slug: 'design-graphique', type: 'FORMATION', prix: 1900, placesTotal: 15 },
    { title: 'Web WordPress', slug: 'web-wordpress', type: 'FORMATION', prix: 1500, placesTotal: 25 },
  ];

  for (const c of campagnes) {
    await prisma.campagne.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: c.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        ...c,
        status: 'ACTIVE',
        published: true,
        description: `Formation professionnelle en ${c.title}`,
        image: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800`,
        placesRestantes: c.placesTotal,
      }
    });
    console.log(`  ✅ Campagne créée : ${c.title}`);
  }

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📧 Identifiants de test :');
  console.log('   Admin      : admin@digilab.tn / AdminDigiPip2024!');
  console.log('   Marketing  : rm@digilab.tn / RMDigiPip2024!');
  console.log('   Client     : client@test.tn / ClientDigiPip2024!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
SEED_EOF

echo -e "${GREEN}  Seed créé${NC}"

echo ""
echo -e "${BLUE}Etape 7/8 — Exécution du seed...${NC}"
cd backend
npx prisma db seed
cd ..
echo -e "${GREEN}  Données initiales insérées${NC}"

echo ""
echo -e "${BLUE}Etape 8/8 — Création des fichiers frontend...${NC}"

mkdir -p frontend/src/context
mkdir -p frontend/src/components/TenantSelector
mkdir -p frontend/src/pages/SuperAdmin

echo -e "${GREEN}  Dossiers créés${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation terminée avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Résumé :"
echo "  ✅ Schéma Prisma multi-tenant"
echo "  ✅ Migration base de données"
echo "  ✅ Middleware d'isolation"
echo "  ✅ Seed initial (DigiLab Solutions)"
echo ""
echo "⚠️  Actions manuelles restantes :"
echo "  1. Copier TenantContext.js dans frontend/src/context/"
echo "  2. Copier TenantSelector.js/.css dans frontend/src/components/TenantSelector/"
echo "  3. Copier TenantsManagement.js dans frontend/src/pages/SuperAdmin/"
echo "  4. Mettre à jour App.js avec TenantProvider"
echo "  5. Mettre à jour server.js avec les middlewares tenant"
echo "  6. Mettre à jour api.js pour injecter X-Tenant-ID"
echo ""
echo "🚀 Pour démarrer :"
echo "  cd backend && npm run dev"
echo "  cd frontend && npm start"
