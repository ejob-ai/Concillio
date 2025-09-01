-- Prompts core schema with security, versioning, logging
-- prompt packs
CREATE TABLE IF NOT EXISTS prompt_packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- versions
CREATE TABLE IF NOT EXISTS prompt_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pack_id INTEGER NOT NULL REFERENCES prompt_packs(id),
  version TEXT NOT NULL,
  locale TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','active','deprecated')),
  metadata_json TEXT,
  json_schema TEXT,
  prompt_hash TEXT,
  rollout_percent INTEGER DEFAULT 100 CHECK(rollout_percent BETWEEN 0 AND 100),
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(pack_id, version, locale)
);

-- entries
CREATE TABLE IF NOT EXISTS prompt_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL REFERENCES prompt_versions(id),
  role TEXT NOT NULL,
  system_prompt_enc TEXT NOT NULL,
  user_template_enc TEXT NOT NULL,
  params_json TEXT,
  allowed_placeholders TEXT,
  model_params_json TEXT,
  entry_hash TEXT,
  encryption_key_version INTEGER DEFAULT 1,
  schema_version TEXT DEFAULT '1',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(version_id, role)
);

-- RBAC (placeholder if needed later)
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','editor','viewer')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- audit log (relational mirror; immutable variant lives in KV with HMAC)
CREATE TABLE IF NOT EXISTS prompt_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  pack_slug TEXT NOT NULL,
  version TEXT,
  locale TEXT,
  role TEXT,
  actor TEXT,
  diff_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- inference log
CREATE TABLE IF NOT EXISTS inference_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT NOT NULL,
  pack_slug TEXT NOT NULL,
  version TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  model TEXT,
  temperature REAL,
  params_json TEXT,
  request_ts TEXT,
  latency_ms INTEGER,
  cost_estimate_cents REAL,
  status TEXT,
  error TEXT,
  payload_json TEXT,
  session_sticky_version TEXT
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_entries_version_role ON prompt_entries(version_id, role);
CREATE INDEX IF NOT EXISTS idx_versions_pack_locale_status ON prompt_versions(pack_id, locale, status);
