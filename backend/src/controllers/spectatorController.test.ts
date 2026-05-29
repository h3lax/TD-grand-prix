import request from 'supertest';
import app from '../app';
import { initDb } from '../database';

beforeAll(() => initDb(':memory:'));

describe('POST /spectators', () => {
  it('creates a spectator and returns 201', async () => {
    const res = await request(app).post('/spectators').send({
      name: 'Alice Martin',
      email: 'alice@example.com',
      birthDate: '1990-04-12',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alice Martin', email: 'alice@example.com', loyaltyTier: 'NONE' });
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app).post('/spectators').send({
      name: 'Bob',
      email: 'not-an-email',
      birthDate: '1990-01-01',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when birthDate is in the future', async () => {
    const res = await request(app).post('/spectators').send({
      name: 'Future Person',
      email: 'future@example.com',
      birthDate: '2099-01-01',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when email is already in use', async () => {
    await request(app).post('/spectators').send({
      name: 'Carol',
      email: 'carol@example.com',
      birthDate: '1985-06-15',
    });
    const res = await request(app).post('/spectators').send({
      name: 'Carol Duplicate',
      email: 'carol@example.com',
      birthDate: '1985-06-15',
    });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /spectators', () => {
  it('returns an array of spectators', async () => {
    const res = await request(app).get('/spectators');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
