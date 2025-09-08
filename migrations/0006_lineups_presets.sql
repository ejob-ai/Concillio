-- Public lineup presets and user lineups (Sprint 3)
-- Presets (public)
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  audience TEXT,
  focus TEXT,
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL,
  role_key TEXT NOT NULL CHECK(role_key IN ('strategist','futurist','psychologist','advisor')),
  weight REAL NOT NULL CHECK(weight >= 0),
  position INTEGER NOT NULL,
  UNIQUE(preset_id, role_key),
  FOREIGN KEY(preset_id) REFERENCES lineups_presets(id)
);
CREATE INDEX IF NOT EXISTS idx_lineups_preset_roles_preset ON lineups_preset_roles(preset_id);

-- User lineups (owned by anonymous uid for now)
CREATE TABLE IF NOT EXISTS user_lineups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_uid TEXT NOT NULL,
  name TEXT NOT NULL,
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_lineups_owner ON user_lineups(owner_uid);

CREATE TABLE IF NOT EXISTS user_lineup_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lineup_id INTEGER NOT NULL,
  role_key TEXT NOT NULL CHECK(role_key IN ('strategist','futurist','psychologist','advisor')),
  weight REAL NOT NULL CHECK(weight >= 0),
  position INTEGER NOT NULL,
  UNIQUE(lineup_id, role_key),
  FOREIGN KEY(lineup_id) REFERENCES user_lineups(id)
);
CREATE INDEX IF NOT EXISTS idx_user_lineup_roles_lineup ON user_lineup_roles(lineup_id);

-- Seed five public presets if table empty
INSERT INTO lineups_presets (name, audience, focus, is_public)
SELECT 'Startup', 'Founders', 'Speed to PMF; capital efficiency', 1
WHERE NOT EXISTS (SELECT 1 FROM lineups_presets);

INSERT INTO lineups_presets (name, audience, focus, is_public)
SELECT 'SME / Corporate', 'Operators', 'Execution, governance, risk controls', 1
WHERE NOT EXISTS (SELECT 1 FROM lineups_presets WHERE name='SME / Corporate');

INSERT INTO lineups_presets (name, audience, focus, is_public)
SELECT 'Investor', 'VC/PE/Angel', 'Thesis, downside protection, unit economics', 1
WHERE NOT EXISTS (SELECT 1 FROM lineups_presets WHERE name='Investor');

INSERT INTO lineups_presets (name, audience, focus, is_public)
SELECT 'Innovator', 'R&D / Product', 'Exploration vs exploitation; bets portfolio', 1
WHERE NOT EXISTS (SELECT 1 FROM lineups_presets WHERE name='Innovator');

INSERT INTO lineups_presets (name, audience, focus, is_public)
SELECT 'Policy / NGO', 'Policy makers', 'Impact, stakeholders, legitimacy, ethics', 1
WHERE NOT EXISTS (SELECT 1 FROM lineups_presets WHERE name='Policy / NGO');

-- Helper view to get preset id by name
CREATE VIEW IF NOT EXISTS v_preset_ids AS
SELECT id, name FROM lineups_presets;

-- Seed roles per preset if not already present
-- Startup
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'strategist', 0.35, 1 FROM lineups_presets p WHERE p.name='Startup';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'futurist', 0.25, 2 FROM lineups_presets p WHERE p.name='Startup';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'psychologist', 0.20, 3 FROM lineups_presets p WHERE p.name='Startup';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'advisor', 0.20, 4 FROM lineups_presets p WHERE p.name='Startup';

-- SME / Corporate
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'strategist', 0.30, 1 FROM lineups_presets p WHERE p.name='SME / Corporate';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'futurist', 0.20, 3 FROM lineups_presets p WHERE p.name='SME / Corporate';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'psychologist', 0.25, 2 FROM lineups_presets p WHERE p.name='SME / Corporate';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'advisor', 0.25, 4 FROM lineups_presets p WHERE p.name='SME / Corporate';

-- Investor
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'strategist', 0.30, 1 FROM lineups_presets p WHERE p.name='Investor';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'futurist', 0.30, 2 FROM lineups_presets p WHERE p.name='Investor';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'psychologist', 0.15, 3 FROM lineups_presets p WHERE p.name='Investor';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'advisor', 0.25, 4 FROM lineups_presets p WHERE p.name='Investor';

-- Innovator
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'strategist', 0.25, 2 FROM lineups_presets p WHERE p.name='Innovator';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'futurist', 0.35, 1 FROM lineups_presets p WHERE p.name='Innovator';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'psychologist', 0.20, 3 FROM lineups_presets p WHERE p.name='Innovator';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'advisor', 0.20, 4 FROM lineups_presets p WHERE p.name='Innovator';

-- Policy / NGO
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'strategist', 0.25, 1 FROM lineups_presets p WHERE p.name='Policy / NGO';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'futurist', 0.20, 3 FROM lineups_presets p WHERE p.name='Policy / NGO';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'psychologist', 0.30, 2 FROM lineups_presets p WHERE p.name='Policy / NGO';
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position)
SELECT p.id, 'advisor', 0.25, 4 FROM lineups_presets p WHERE p.name='Policy / NGO';
