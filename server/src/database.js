import pg from 'pg'

const { Pool } = pg

export async function createDatabase(connectionString) {
  if (!connectionString) {
    throw new Error('DATABASE_URL must be configured')
  }

  const sslSetting = process.env.DATABASE_SSL?.toLowerCase()
  const ssl = sslSetting === 'true'
    ? { rejectUnauthorized: false }
    : sslSetting === 'false'
      ? false
      : undefined

  const pool = new Pool({
    connectionString,
    ssl,
    max: Number(process.env.DATABASE_POOL_SIZE || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })

  pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error', error)
  })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id UUID PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      owner_username TEXT NOT NULL,
      owner_username_key TEXT NOT NULL,
      owner_password_hash TEXT NOT NULL,
      is_testing BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL
    );

    ALTER TABLE rooms
      ADD COLUMN IF NOT EXISTS is_testing BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      username_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      hint_revealed_at TIMESTAMPTZ,
      solved_at TIMESTAMPTZ,
      UNIQUE(room_id, username_key),
      UNIQUE(room_id, name)
    );

    CREATE TABLE IF NOT EXISTS hint_logs (
      id SERIAL PRIMARY KEY,
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      occurred_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_teams_room ON teams(room_id);
    CREATE INDEX IF NOT EXISTS idx_hint_logs_room ON hint_logs(room_id, occurred_at DESC);
  `)

  return pool
}
