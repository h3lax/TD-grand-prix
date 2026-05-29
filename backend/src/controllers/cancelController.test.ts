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
  insertGrandstand({ name: 'Tribune A', location: 'Virage 1', category: Category.GOLD, capacity: 100, basePrice: 100, covered: false });
  insertSession({ day: Day.SUNDAY, type: SessionType.RACE, date: '2099-06-08', priceMultiplier: 1.8 });
  insertSession({ day: Day.SUNDAY, type: SessionType.RACE, date: '2000-01-01', priceMultiplier: 1.8 });
  insertSpectator({ name: 'Alice', email: 'alice@example.com', birthDate: '1990-01-01', loyaltyTier: LoyaltyTier.NONE, createdAt: new Date().toISOString() });
});

async function bookSession(sessionId: number) {
  return request(app).post('/reservations').send({
    spectatorId: 1,
    grandstandId: 1,
    sessionIds: [sessionId],
    seatCount: 1,
  });
}

describe('POST /reservations/:id/cancel', () => {
  it('cancels a reservation and returns 100% refund when first session is far in the future', async () => {
    const book = await bookSession(1);
    const id = book.body.id;

    const res = await request(app).post(`/reservations/${id}/cancel`);

    expect(res.status).toBe(200);
    expect(res.body.rate).toBe(1);
    expect(res.body.refund).toBe(book.body.totalPrice);
    expect(res.body.reservation.status).toBe('CANCELLED');
    expect(res.body.reservation.cancelledAt).toBeDefined();
    expect(res.body.daysUntilFirstSession).toBeGreaterThan(7);
  });

  it('cancels a reservation and returns 0% refund when first session is in the past', async () => {
    const book = await bookSession(2);
    const id = book.body.id;

    const res = await request(app).post(`/reservations/${id}/cancel`);

    expect(res.status).toBe(200);
    expect(res.body.rate).toBe(0);
    expect(res.body.refund).toBe(0);
    expect(res.body.reservation.status).toBe('CANCELLED');
  });

  it('returns 409 when reservation is already cancelled', async () => {
    const book = await bookSession(1);
    const id = book.body.id;
    await request(app).post(`/reservations/${id}/cancel`);

    const res = await request(app).post(`/reservations/${id}/cancel`);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when reservation does not exist', async () => {
    const res = await request(app).post('/reservations/999/cancel');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('releases seats after cancellation so a new booking is accepted', async () => {
    const book = await bookSession(1);
    await request(app).post(`/reservations/${book.body.id}/cancel`);

    const rebook = await bookSession(1);
    expect(rebook.status).toBe(201);
  });
});
