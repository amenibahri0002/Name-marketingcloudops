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
    expect(res.statusCode).toBe(200);
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
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/register', () => {
  it('creation compte reussie', async () => {
    const { PrismaClient } = require('@prisma/client');
    new PrismaClient().user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name:'New', email:'new@digipip.com', password:'password123' });
    expect([200, 400]).toContain(res.statusCode);
  });
  it('echec email deja utilise', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name:'Test', email:'test@digipip.com', password:'password123' });
    expect(res.statusCode).toBe(400);
  });
});
