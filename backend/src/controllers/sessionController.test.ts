import request from 'supertest';
import app from '../app';
import { initDb } from '../database';

beforeAll(() => initDb(':memory:'));

describe('POST /sessions', () => {
  it('creates a session with an explicit multiplier and returns 201', async () => {
    const res = await request(app).post('/sessions').send({
      day: 'SUNDAY',
      type: 'RACE',
      date: '2026-07-20T14:00:00Z',
      priceMultiplier: 1.8,
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ day: 'SUNDAY', type: 'RACE', priceMultiplier: 1.8 });
  });

  it('applies the default multiplier when priceMultiplier is omitted', async () => {
    const res = await request(app).post('/sessions').send({
      day: 'FRIDAY',
      type: 'PRACTICE',
      date: '2026-07-18T10:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.priceMultiplier).toBe(0.5);
  });

  it('returns 400 when day is invalid', async () => {
    const res = await request(app).post('/sessions').send({
      day: 'MONDAY',
      type: 'RACE',
      date: '2026-07-20T14:00:00Z',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when type is missing', async () => {
    const res = await request(app).post('/sessions').send({
      day: 'SUNDAY',
      date: '2026-07-20T14:00:00Z',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /sessions', () => {
  it('returns an array of sessions', async () => {
    const res = await request(app).get('/sessions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
