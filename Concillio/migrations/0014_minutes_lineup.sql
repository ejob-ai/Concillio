-- NO-OP migration to mark lineup metadata as handled by application layer
-- Rationale: Columns lineup_preset_id, lineup_preset_name, lineup_roles_json may already exist from earlier deploys.
-- ALTER TABLE lacks IF NOT EXISTS in SQLite/D1, so we avoid adding here to prevent duplicate-column failures.
-- The application ensures columns at runtime with best-effort ALTERs wrapped in try/catch.

-- Keep a safe index creation (idempotent)
CREATE INDEX IF NOT EXISTS idx_minutes_lineup_preset_id ON minutes(lineup_preset_id);
