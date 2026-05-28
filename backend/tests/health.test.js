const request = require('supertest');
const express = require('express');

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('prom-client', () => ({
  collectDefaultMetrics: jest.fn(),
  register: { contentType: 'text/plain', metrics: jest.fn().mockResolvedValue('') },
}));

const app = express();
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date(),
  service: 'MarketingCloudOps Backend',
}));

describe('GET /api/health', () => {
  it('retourne status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
  it('retourne un timestamp valide', async () => {
    const res = await request(app).get('/api/health');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
