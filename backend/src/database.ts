import Database from 'better-sqlite3';

let db: Database.Database;

export function initDb(path: string): void {
  db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS grandstands (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      location    TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      capacity    INTEGER NOT NULL,
      base_price  REAL    NOT NULL,
      covered     INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      day              TEXT    NOT NULL,
      type             TEXT    NOT NULL,
      date             TEXT    NOT NULL,
      price_multiplier REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spectators (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      email        TEXT    NOT NULL UNIQUE,
      birth_date   TEXT    NOT NULL,
      loyalty_tier TEXT    NOT NULL DEFAULT 'NONE',
      created_at   TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      spectator_id   INTEGER NOT NULL REFERENCES spectators(id),
      grandstand_id  INTEGER NOT NULL REFERENCES grandstands(id),
      seat_count     INTEGER NOT NULL,
      total_price    REAL    NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'CONFIRMED',
      booked_at      TEXT    NOT NULL,
      cancelled_at   TEXT,
      refunded_amount REAL   NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reservation_sessions (
      reservation_id INTEGER NOT NULL REFERENCES reservations(id),
      session_id     INTEGER NOT NULL REFERENCES sessions(id),
      PRIMARY KEY (reservation_id, session_id)
    );
  `);
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized — call initDb first');
  return db;
}
