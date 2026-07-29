import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function createDatabase(filename) {
  fs.mkdirSync(path.dirname(filename), { recursive: true })
  const db = new DatabaseSync(filename)

  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      owner_username TEXT NOT NULL,
      owner_username_key TEXT NOT NULL,
      owner_password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      username_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      hint_revealed_at TEXT,
      solved_at TEXT,
      UNIQUE(room_id, username_key),
      UNIQUE(room_id, name)
    );

    CREATE TABLE IF NOT EXISTS hint_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      occurred_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_teams_room ON teams(room_id);
    CREATE INDEX IF NOT EXISTS idx_hint_logs_room ON hint_logs(room_id, occurred_at DESC);
  `)

  return db
}
