const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret123';
const adminToken = jwt.sign({ id:1, role:'RESPONSABLE_MARKETING' }, JWT_SECRET);

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      campagne: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            title: 'Test',
            inscriptions: [],
          _count: { inscriptions: 0 },  // ← AJOUTER
            client: { name: 'Test' }
          }
        ]),
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          title: 'Test',
          inscriptions: [],
          _count: { inscriptions: 0 },  // ← AJOUTER
          client: { name: 'Test' }
        }),
      },
    })),
  };
});

jest.mock('../middleware/security', () => ({
  loginLimiter:    (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  validateLogin:   (req, res, next) => next(),
  validateRegister:(req, res, next) => next(),
  checkValidation: (req, res, next) => next(),
}));

const campagnesRoutes = require('../routes/campagnes');
const app = express();
app.use(express.json());
app.use('/api/campagnes', campagnesRoutes);

describe('GET /api/campagnes', () => {
  it('retourne la liste des campagnes', async () => {
    const res = await request(app)
      .get('/api/campagnes')
      .set('Authorization', 'Bearer ' + adminToken);
   expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/campagnes/public', () => {
  it('retourne les campagnes publiques', async () => {
    const res = await request(app).get('/api/campagnes/public');
    expect([200, 403]).toContain(res.statusCode);
  });
});

describe('GET /api/campagnes/:id', () => {
  it('retourne une campagne par ID', async () => {
    const res = await request(app)
      .get('/api/campagnes/1')
      .set('Authorization', 'Bearer ' + adminToken);
    expect(400).toContain(res.statusCode);
  });
});
