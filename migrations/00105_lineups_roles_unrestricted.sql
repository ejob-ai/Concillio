-- Rebuild lineups_preset_roles without CHECK(role_key IN ...), to run BEFORE 0011
-- D1-safe: no transactions; create/copy/drop/rename

CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS _new_lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(preset_id, role_key),
  UNIQUE(preset_id, position)
);

CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL
);

INSERT OR IGNORE INTO _new_lineups_preset_roles (id, preset_id, role_key, weight, position)
SELECT id, preset_id, role_key, weight, position FROM lineups_preset_roles;

DROP TABLE IF EXISTS lineups_preset_roles;
ALTER TABLE _new_lineups_preset_roles RENAME TO lineups_preset_roles;

CREATE INDEX IF NOT EXISTS idx_lineups_roles_preset ON lineups_preset_roles(preset_id);
CREATE INDEX IF NOT EXISTS idx_lineups_roles_role ON lineups_preset_roles(role_key);
