-- 0018_add_preset_private_person.sql
-- Idempotent add/update of preset #16: "Privatperson / Livsbeslut" (is_public=1)
-- Ensures tables & basic constraints exist, then upserts preset and replaces its 5 roles.

-- Safety: ensure core tables exist (no-op if already there)
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (preset_id, role_key),
  UNIQUE (preset_id, position)
);

-- Upsert preset
INSERT INTO lineups_presets (id, name, is_public)
VALUES (16, 'Privatperson / Livsbeslut', 1)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  is_public = excluded.is_public;

-- Replace roles for preset 16 atomically-ish (D1 runs statements individually; order matters)
DELETE FROM lineups_preset_roles WHERE preset_id = 16;

INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (16, 'PSYCHOLOGIST',          0.26, 0),
  (16, 'SENIOR_ADVISOR',        0.22, 1),
  (16, 'STRATEGIST',            0.20, 2),
  (16, 'FUTURIST',              0.18, 3),
  (16, 'LEGAL_ADVISOR',         0.14, 4);
