-- Rebuild lineups_preset_roles without restrictive CHECK on role_key (Workers D1 safe)
-- Avoids BEGIN/COMMIT; uses CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE pattern.

-- Ensure base tables
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create relaxed table if missing (no CHECK on role_key)
CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(preset_id, position)
);

-- If an old table with CHECK existed, it keeps working; subsequent INSERTs with
-- new role_key values will target this relaxed schema (on new environments).
-- For environments already having the table with CHECK, we can't DROP/RENAME
-- atomically under D1 limitations here. Instead, seeds will target valid role keys
-- used historically (lowercase strategist/futurist/psychologist/advisor) OR we relax
-- seeds to those keys in 0011/0013 files.
