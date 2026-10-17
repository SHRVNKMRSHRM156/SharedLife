import pg from 'pg';

// One small pool per function instance. Vercel functions are short-lived, so keep it tiny.
let pool;
let ready;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    pool = new pg.Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000 });
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('seeker', 'counsellor', 'advocate')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL,
  city          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('active', 'pending', 'approved', 'rejected', 'suspended')),
  profile       JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service        TEXT NOT NULL CHECK (service IN ('consultation', 'premarital', 'marital', 'prenup', 'course', 'workshop')),
  mode           TEXT NOT NULL CHECK (mode IN ('online', 'in_person')),
  preferred_date DATE NOT NULL,
  preferred_slot TEXT NOT NULL CHECK (preferred_slot IN ('morning', 'afternoon', 'evening')),
  partner_name   TEXT NOT NULL DEFAULT '',
  notes          TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  assigned_to    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  scheduled_at   TIMESTAMPTZ,
  admin_note     TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_assigned_idx ON bookings(assigned_to);

CREATE TABLE IF NOT EXISTS login_failures (
  email TEXT NOT NULL,
  at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_failures_idx ON login_failures(email, at);
`;

// Tables are created on first use, so a fresh database needs no manual setup.
export function ensureSchema() {
  if (!ready) {
    ready = getPool().query(SCHEMA).catch((err) => { ready = undefined; throw err; });
  }
  return ready;
}

export async function query(text, params) {
  await ensureSchema();
  return getPool().query(text, params);
}

// For tests: close the pool and forget state.
export async function _reset() {
  if (pool) await pool.end();
  pool = undefined;
  ready = undefined;
}
