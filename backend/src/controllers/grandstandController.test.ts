import request from 'supertest';
import app from '../app';
import { initDb } from '../database';

beforeAll(() => initDb(':memory:'));

describe('POST /grandstands', () => {
  it('creates a grandstand and returns 201', async () => {
    const res = await request(app).post('/grandstands').send({
      name: 'Tribune Sainte-Beaume',
      location: 'Virage 3',
      category: 'GOLD',
      capacity: 200,
      basePrice: 180,
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Tribune Sainte-Beaume', category: 'GOLD', covered: false });
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when a required field is missing', async () => {
    const res = await request(app).post('/grandstands').send({
      location: 'Virage 1',
      category: 'GOLD',
      capacity: 100,
      basePrice: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when category is not a valid enum value', async () => {
    const res = await request(app).post('/grandstands').send({
      name: 'Test',
      location: 'Virage 1',
      category: 'DIAMOND',
      capacity: 100,
      basePrice: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when capacity is not a positive integer', async () => {
    const res = await request(app).post('/grandstands').send({
      name: 'Test',
      location: 'Virage 1',
      category: 'BRONZE',
      capacity: -1,
      basePrice: 100,
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /grandstands', () => {
  it('returns an array of grandstands', async () => {
    const res = await request(app).get('/grandstands');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/grandstands?category=GOLD');
    expect(res.status).toBe(200);
    expect(res.body.every((g: { category: string }) => g.category === 'GOLD')).toBe(true);
  });

  it('returns 400 for an invalid category filter', async () => {
    const res = await request(app).get('/grandstands?category=INVALID');
    expect(res.status).toBe(400);
  });
});
