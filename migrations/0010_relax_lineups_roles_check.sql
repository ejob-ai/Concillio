-- Rebuild lineups_preset_roles without restrictive CHECK on role_key
-- This enables extended roles beyond the original four
BEGIN TRANSACTION;

-- Ensure presets table exists (foreign key target)
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Rename existing roles table to a temp name (assumes it exists)
ALTER TABLE lineups_preset_roles RENAME TO lineups_preset_roles_old;

-- Create new relaxed schema (no CHECK constraint on role_key)
CREATE TABLE lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(preset_id, position)
);

-- Copy data forward
INSERT INTO lineups_preset_roles (id, preset_id, role_key, weight, position)
SELECT id, preset_id, role_key, weight, position FROM lineups_preset_roles_old;

-- Drop old table
DROP TABLE lineups_preset_roles_old;

COMMIT;