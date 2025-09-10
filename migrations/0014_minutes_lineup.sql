-- Add lineup metadata to minutes (idempotent-style)
ALTER TABLE minutes ADD COLUMN lineup_preset_id INTEGER;
ALTER TABLE minutes ADD COLUMN lineup_preset_name TEXT;
ALTER TABLE minutes ADD COLUMN lineup_roles_json TEXT;     -- roller i positionsordning (UPPERCASE role_key + weight + position)

-- Quick index for filtering by preset
CREATE INDEX IF NOT EXISTS idx_minutes_lineup_preset_id ON minutes(lineup_preset_id);
