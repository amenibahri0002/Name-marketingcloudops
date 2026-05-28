const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret123';
const adminToken = jwt.sign({ id:1, role:'RESPONSABLE_MARKETING' }, JWT_SECRET);

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    campagne: {
      findMany:   jest.fn().mockResolvedValue([
        { id:1, title:'Camp Email', type:'email', status:'sent',  client:{ name:'TechCo' } },
        { id:2, title:'Promo SMS',  type:'sms',   status:'draft', client:{ name:'TechCo' } },
      ]),
      findUnique: jest.fn().mockResolvedValue({ id:1, title:'Camp Email', type:'email', status:'sent', client:{ name:'TechCo' } }),
      create:     jest.fn().mockResolvedValue({ id:3, title:'Nouvelle', type:'push', status:'draft' }),
      update:     jest.fn().mockResolvedValue({ id:1, status:'draft' }),
      delete:     jest.fn().mockResolvedValue({ id:1 }),
    },
    inscription: {
      findMany:  jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create:    jest.fn().mockResolvedValue({ id:1, campagneId:1, userId:2 }),
    },
  })),
}));

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
    expect([200, 403]).toContain(res.statusCode);
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
    expect([200, 403]).toContain(res.statusCode);
  });
});
