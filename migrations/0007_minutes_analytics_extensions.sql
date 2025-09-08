-- Minutes & Analytics extensions for Sprint 3
-- Minutes extra columns
ALTER TABLE minutes ADD COLUMN lineup_preset_id INTEGER;
ALTER TABLE minutes ADD COLUMN lineup_preset_name TEXT;
-- lineup_snapshot exists since 0004; skip here
ALTER TABLE minutes ADD COLUMN schema_version TEXT;  -- per role/summarizer schema version
-- prompt_version already exists; skip adding here

-- Analytics: model/tokens/cost
CREATE TABLE IF NOT EXISTS analytics_council (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT
);
-- Add columns best-effort
ALTER TABLE analytics_council ADD COLUMN model TEXT;
ALTER TABLE analytics_council ADD COLUMN prompt_tokens INTEGER;
ALTER TABLE analytics_council ADD COLUMN completion_tokens INTEGER;
ALTER TABLE analytics_council ADD COLUMN cost_usd REAL;
