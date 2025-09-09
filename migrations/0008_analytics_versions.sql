-- 0008_analytics_versions.sql
-- Note: D1 local disallows explicit BEGIN/COMMIT in migrations. Keep it simple.
ALTER TABLE analytics_council ADD COLUMN schema_version TEXT;
ALTER TABLE analytics_council ADD COLUMN prompt_version TEXT;
