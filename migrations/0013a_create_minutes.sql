-- 0013a_create_minutes.sql
-- Ensure the minutes table exists before 0014 creates an index on minutes(lineup_preset_id)
-- Keep schema aligned with current application expectations (see routes/minutes.tsx and /api/council/consult)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS minutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  context TEXT,
  roles_json TEXT NOT NULL,
  consensus_json TEXT NOT NULL,
  -- optional/extended columns used by app code
  roles_raw_json TEXT,
  advisor_bullets_json TEXT,
  prompt_version TEXT,
  consensus_validated INTEGER,
  -- lineup metadata (used for presets/custom role weights)
  lineup_preset_id INTEGER,
  lineup_preset_name TEXT,
  lineup_roles_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
