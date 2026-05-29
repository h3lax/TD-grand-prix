import request from 'supertest';
import app from '../app';
import { initDb } from '../database';
import { Category } from '../entities/Grandstand';
import { Day, SessionType } from '../entities/Session';
import { LoyaltyTier } from '../entities/Spectator';
import { insertGrandstand } from '../repositories/grandstandRepository';
import { insertSession } from '../repositories/sessionRepository';
import { insertSpectator } from '../repositories/spectatorRepository';

beforeAll(() => {
  initDb(':memory:');
  insertGrandstand({ name: 'Tribune A', location: 'Virage 1', category: Category.GOLD, capacity: 10, basePrice: 100, covered: false });
  insertGrandstand({ name: 'Tribune Small', location: 'Virage 2', category: Category.BRONZE, capacity: 1, basePrice: 50, covered: false });
  insertSession({ day: Day.SUNDAY, type: SessionType.RACE, date: '2025-06-08', priceMultiplier: 1.8 });
  insertSpectator({ name: 'Alice', email: 'alice@example.com', birthDate: '1990-01-01', loyaltyTier: LoyaltyTier.GOLD, createdAt: new Date().toISOString() });
});

const validBody = { spectatorId: 1, grandstandId: 1, sessionIds: [1], seatCount: 2 };

describe('POST /reservations', () => {
  it('creates a reservation with status CONFIRMED and returns 201', async () => {
    const res = await request(app).post('/reservations').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      spectatorId: 1,
      grandstandId: 1,
      sessionIds: [1],
      seatCount: 2,
      status: 'CONFIRMED',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.bookedAt).toBeDefined();
    expect(res.body.refundedAmount).toBe(0);
    expect(res.body.cancelledAt).toBeNull();
  });

  it('totalPrice matches the quote endpoint for the same inputs', async () => {
    const quoteRes = await request(app).post('/reservations/quote').send(validBody);
    const reservationRes = await request(app).post('/reservations').send(validBody);

    expect(reservationRes.status).toBe(201);
    expect(reservationRes.body.totalPrice).toBe(quoteRes.body.total);
  });

  it('returns 400 when seatCount exceeds 6', async () => {
    const res = await request(app).post('/reservations').send({ ...validBody, seatCount: 7 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when grandstand does not exist', async () => {
    const res = await request(app).post('/reservations').send({ ...validBody, grandstandId: 999 });

    expect(res.status).toBe(404);
  });

  it('returns 404 when a session does not exist', async () => {
    const res = await request(app).post('/reservations').send({ ...validBody, sessionIds: [999] });

    expect(res.status).toBe(404);
  });

  it('returns 404 when spectator does not exist', async () => {
    const res = await request(app).post('/reservations').send({ ...validBody, spectatorId: 999 });

    expect(res.status).toBe(404);
  });

  it('returns 409 when there are not enough available seats', async () => {
    await request(app).post('/reservations').send({ spectatorId: 1, grandstandId: 2, sessionIds: [1], seatCount: 1 });

    const res = await request(app).post('/reservations').send({ spectatorId: 1, grandstandId: 2, sessionIds: [1], seatCount: 1 });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});
