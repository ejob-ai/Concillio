-- Schema for lineups
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(preset_id, position)
);

-- Ensure role_key is unrestricted on existing envs (drop CHECK by rebuild)
CREATE TABLE IF NOT EXISTS _new_lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(preset_id, role_key),
  UNIQUE(preset_id, position)
);
INSERT OR IGNORE INTO _new_lineups_preset_roles (id, preset_id, role_key, weight, position)
SELECT id, preset_id, role_key, weight, position FROM lineups_preset_roles;
DROP TABLE IF EXISTS lineups_preset_roles;
ALTER TABLE _new_lineups_preset_roles RENAME TO lineups_preset_roles;
CREATE INDEX IF NOT EXISTS idx_lineups_roles_preset ON lineups_preset_roles(preset_id);
CREATE INDEX IF NOT EXISTS idx_lineups_roles_role ON lineups_preset_roles(role_key);

-- 1) Entreprenör / Startup-grundare
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (11,'Entreprenör / Startup-grundare',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=11;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(11,'STRATEGIST',0.24,0),
(11,'FUTURIST',0.18,1),
(11,'PSYCHOLOGIST',0.14,2),
(11,'CFO_ANALYST',0.22,3),
(11,'SENIOR_ADVISOR',0.22,4);

-- 2) Företagsledare (SME/Corporate)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (12,'Företagsledare (SME/Corporate)',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=12;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(12,'STRATEGIST',0.22,0),
(12,'RISK_COMPLIANCE_OFFICER',0.22,1),
(12,'CFO_ANALYST',0.22,2),
(12,'CUSTOMER_ADVOCATE',0.18,3),
(12,'SENIOR_ADVISOR',0.16,4);

-- 3) Investerare / Styrelseledamot
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (13,'Investerare / Styrelseledamot',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=13;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(13,'CFO_ANALYST',0.26,0),
(13,'RISK_COMPLIANCE_OFFICER',0.20,1),
(13,'FUTURIST',0.16,2),
(13,'STRATEGIST',0.22,3),
(13,'PSYCHOLOGIST',0.16,4);

-- 4) Kreatör / Innovatör
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (14,'Kreatör / Innovatör',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=14;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(14,'INNOVATION_CATALYST',0.28,0),
(14,'FUTURIST',0.22,1),
(14,'CUSTOMER_ADVOCATE',0.20,2),
(14,'PSYCHOLOGIST',0.14,3),
(14,'SENIOR_ADVISOR',0.16,4);

-- 5) Policy Maker / NGO-ledare
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (15,'Policy Maker / NGO-ledare',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=15;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(15,'RISK_COMPLIANCE_OFFICER',0.26,0),
(15,'FUTURIST',0.20,1),
(15,'CUSTOMER_ADVOCATE',0.18,2),
(15,'STRATEGIST',0.20,3),
(15,'PSYCHOLOGIST',0.16,4);
