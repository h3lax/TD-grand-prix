import request from 'supertest';
import app from '../app';
import { initDb } from '../database';
import { insertGrandstand } from '../repositories/grandstandRepository';
import { insertSession } from '../repositories/sessionRepository';
import { insertSpectator } from '../repositories/spectatorRepository';
import { Category } from '../entities/Grandstand';
import { Day, SessionType } from '../entities/Session';
import { LoyaltyTier } from '../entities/Spectator';

beforeAll(() => {
  initDb(':memory:');

  insertGrandstand({ name: 'Tribune A', location: 'Virage 1', category: Category.GOLD, capacity: 200, basePrice: 100, covered: false });
  insertSession({ day: Day.FRIDAY, type: SessionType.PRACTICE, date: '2025-06-06', priceMultiplier: 0.5 });
  insertSession({ day: Day.SATURDAY, type: SessionType.QUALIFYING, date: '2025-06-07', priceMultiplier: 1.0 });
  insertSession({ day: Day.SUNDAY, type: SessionType.RACE, date: '2025-06-08', priceMultiplier: 1.8 });
  insertSpectator({ name: 'Alice', email: 'alice@example.com', birthDate: '1990-01-01', loyaltyTier: LoyaltyTier.GOLD, createdAt: new Date().toISOString() });
});

describe('POST /reservations/quote', () => {
  it('returns 200 with a price breakdown for a valid request', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 1,
      sessionIds: [3],
      seatCount: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      baseTotal: 360,
      isWeekendPass: false,
      total: 360,
    });
    expect(Array.isArray(res.body.lineItems)).toBe(true);
  });

  it('applies all discounts when spectatorId is provided with full weekend', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 1,
      sessionIds: [1, 2, 3],
      seatCount: 1,
      spectatorId: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.isWeekendPass).toBe(true);
    expect(res.body.loyaltyTier).toBe('GOLD');
    expect(res.body.total).toBeLessThan(res.body.baseTotal);
  });

  it('returns 404 when grandstand does not exist', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 999,
      sessionIds: [1],
      seatCount: 1,
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when a session does not exist', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 1,
      sessionIds: [999],
      seatCount: 1,
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when seatCount exceeds 6', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 1,
      sessionIds: [1],
      seatCount: 7,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when sessionIds is empty', async () => {
    const res = await request(app).post('/reservations/quote').send({
      grandstandId: 1,
      sessionIds: [],
      seatCount: 1,
    });

    expect(res.status).toBe(400);
  });
});
