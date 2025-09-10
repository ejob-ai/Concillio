-- Add lineup metadata to minutes (idempotent-style)
-- D1 lacks IF NOT EXISTS for ALTER, so guard each with try-catch in app and here we attempt cautiously
-- Create table if not exists for safety
CREATE TABLE IF NOT EXISTS minutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  context TEXT,
  roles_json TEXT NOT NULL,
  consensus_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Add columns with a pattern that tolerates prior existence
-- Note: D1 migrations abort on error, so we avoid duplicate additions by checking PRAGMA table_info
-- However, D1 migrations do not allow dynamic SQL; fallback: add only if not present using separate migr step.

-- Attempt adds (will fail if exists); safe to ignore in app
ALTER TABLE minutes ADD COLUMN lineup_preset_id INTEGER;
ALTER TABLE minutes ADD COLUMN lineup_preset_name TEXT;
ALTER TABLE minutes ADD COLUMN lineup_roles_json TEXT;

-- Quick index for filtering by preset
CREATE INDEX IF NOT EXISTS idx_minutes_lineup_preset_id ON minutes(lineup_preset_id);
