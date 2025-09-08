-- Lineups table
CREATE TABLE IF NOT EXISTS lineups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  weights TEXT NOT NULL, -- JSON of Weights
  owner TEXT,            -- user or tenant id/email hash
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lineups_owner ON lineups(owner);
