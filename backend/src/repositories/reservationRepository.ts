import { getDb } from '../database';
import { Reservation, ReservationStatus } from '../entities/Reservation';

type ReservationRow = {
  id: number;
  spectator_id: number;
  grandstand_id: number;
  seat_count: number;
  total_price: number;
  status: string;
  booked_at: string;
  cancelled_at: string | null;
  refunded_amount: number;
};

function toReservation(row: ReservationRow): Reservation {
  const sessionIds = (
    getDb()
      .prepare('SELECT session_id FROM reservation_sessions WHERE reservation_id = ?')
      .all(row.id) as { session_id: number }[]
  ).map((r) => r.session_id);

  return {
    id: row.id,
    spectatorId: row.spectator_id,
    grandstandId: row.grandstand_id,
    sessionIds,
    seatCount: row.seat_count,
    totalPrice: row.total_price,
    status: row.status as ReservationStatus,
    bookedAt: row.booked_at,
    cancelledAt: row.cancelled_at,
    refundedAmount: row.refunded_amount,
  };
}

export function insertReservation(data: Omit<Reservation, 'id'>): Reservation {
  const db = getDb();

  const insertReservationStmt = db.prepare(
    'INSERT INTO reservations (spectator_id, grandstand_id, seat_count, total_price, status, booked_at, cancelled_at, refunded_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertSessionLinkStmt = db.prepare(
    'INSERT INTO reservation_sessions (reservation_id, session_id) VALUES (?, ?)',
  );

  const run = db.transaction(() => {
    const result = insertReservationStmt.run(
      data.spectatorId, data.grandstandId, data.seatCount, data.totalPrice,
      data.status, data.bookedAt, data.cancelledAt, data.refundedAmount,
    );
    const id = result.lastInsertRowid as number;
    for (const sessionId of data.sessionIds) {
      insertSessionLinkStmt.run(id, sessionId);
    }
    return id;
  });

  const id = run();
  return { ...data, id };
}

export function findAllReservations(spectatorId?: number): Reservation[] {
  const rows = spectatorId
    ? (getDb().prepare('SELECT * FROM reservations WHERE spectator_id = ?').all(spectatorId) as ReservationRow[])
    : (getDb().prepare('SELECT * FROM reservations').all() as ReservationRow[]);
  return rows.map(toReservation);
}

export function findReservationById(id: number): Reservation | undefined {
  const row = getDb().prepare('SELECT * FROM reservations WHERE id = ?').get(id) as ReservationRow | undefined;
  return row ? toReservation(row) : undefined;
}

export function cancelReservation(id: number, cancelledAt: string, refundedAmount: number): Reservation {
  getDb()
    .prepare('UPDATE reservations SET status = ?, cancelled_at = ?, refunded_amount = ? WHERE id = ?')
    .run(ReservationStatus.CANCELLED, cancelledAt, refundedAmount, id);
  return findReservationById(id) as Reservation;
}

export function countConfirmedSeats(grandstandId: number, sessionId: number): number {
  const result = getDb().prepare(`
    SELECT COALESCE(SUM(r.seat_count), 0) AS total
    FROM reservations r
    JOIN reservation_sessions rs ON rs.reservation_id = r.id
    WHERE r.grandstand_id = ? AND rs.session_id = ? AND r.status = 'CONFIRMED'
  `).get(grandstandId, sessionId) as { total: number };
  return result.total;
}
