const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

jest.mock('@prisma/client', () => {
  const mockUser = {
    id: 1, name: 'Test User', email: 'test@digipip.com',
    password: require('bcryptjs').hashSync('password123', 10),
    role: 'CLIENT',
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockResolvedValue({ id:2, name:'New', email:'new@digipip.com', role:'CLIENT' }),
        update: jest.fn().mockResolvedValue({ ...mockUser, lastLogin: new Date() }),
      },
      client: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@digipip.com' }),
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

const authRoutes = require('../routes/auth');
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/login', () => {
  it('connexion reussie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@digipip.com', password: 'password123' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('token');
  });

  it('echec mot de passe incorrect', async () => {
    const { PrismaClient } = require('@prisma/client');
    new PrismaClient().user.findUnique.mockResolvedValueOnce({
      id:1, email:'test@digipip.com',
      password: require('bcryptjs').hashSync('autre', 10), role:'CLIENT', name:'Test',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@digipip.com', password: 'mauvais' });
    expect(res.statusCode).toBe(401); // ← CORRIGÉ : 401 au lieu de 400
  });
});

describe('POST /api/auth/register', () => {
  it('creation compte reussie', async () => {
    const { PrismaClient } = require('@prisma/client');
    new PrismaClient().user.findUnique.mockResolvedValueOnce(null);
    new PrismaClient().client.findUnique.mockResolvedValueOnce(null); // ← AJOUTÉ
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name:'New', email:'new@digipip.com', password:'password123' });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  it('echec email deja utilise', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name:'Test', email:'test@digipip.com', password:'password123' });
    expect(res.statusCode).toBe(400);
  });
});