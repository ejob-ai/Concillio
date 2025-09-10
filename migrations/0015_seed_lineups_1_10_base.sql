-- Seed 10 public lineups using base roles only (strategist,futurist,psychologist,advisor)
-- Compatible with remote DB schema CHECK(role_key IN (...)) and UNIQUE(preset_id, role_key)

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
  UNIQUE(preset_id, role_key)
);

-- Clear existing presets/roles (safe for re-seed during setup)
DELETE FROM lineups_preset_roles;
DELETE FROM lineups_presets;

-- Helper: all weights sum to 1.0 per preset; role_key must be lowercase per remote CHECK

-- 1 Startup / Entreprenör
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (1,'Startup / Entreprenör',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(1,'strategist',0.35,0),(1,'futurist',0.25,1),(1,'psychologist',0.20,2),(1,'advisor',0.20,3);

-- 2 SME / Corporate
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (2,'SME / Corporate',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(2,'strategist',0.30,0),(2,'futurist',0.20,1),(2,'psychologist',0.25,2),(2,'advisor',0.25,3);

-- 3 Investerare / Styrelse
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (3,'Investerare / Styrelse',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(3,'advisor',0.35,0),(3,'strategist',0.25,1),(3,'futurist',0.20,2),(3,'psychologist',0.20,3);

-- 4 Kreatör / Innovatör
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (4,'Kreatör / Innovatör',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(4,'futurist',0.30,0),(4,'strategist',0.20,1),(4,'psychologist',0.20,2),(4,'advisor',0.30,3);

-- 5 Policy / NGO
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (5,'Policy / NGO',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(5,'psychologist',0.30,0),(5,'strategist',0.25,1),(5,'futurist',0.20,2),(5,'advisor',0.25,3);

-- 6 Scale-up (Execution)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (6,'Scale-up (Execution-heavy Growth)',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(6,'strategist',0.30,0),(6,'advisor',0.30,1),(6,'futurist',0.20,2),(6,'psychologist',0.20,3);

-- 7 Regulated (Health/Finance/Public)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (7,'Regulated (Health/Finance/Public)',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(7,'psychologist',0.30,0),(7,'strategist',0.25,1),(7,'advisor',0.25,2),(7,'futurist',0.20,3);

-- 8 SaaS B2B (Enterprise)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (8,'SaaS B2B (Enterprise Software)',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(8,'strategist',0.28,0),(8,'advisor',0.28,1),(8,'futurist',0.22,2),(8,'psychologist',0.22,3);

-- 9 Konsumentappar (B2C)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (9,'Konsumentappar (B2C Digital Products)',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(9,'futurist',0.30,0),(9,'psychologist',0.25,1),(9,'strategist',0.20,2),(9,'advisor',0.25,3);

-- 10 Industri / IoT / Tillverkning
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (10,'Industri / IoT / Tillverkning',1,datetime('now'));
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(10,'strategist',0.28,0),(10,'psychologist',0.24,1),(10,'advisor',0.24,2),(10,'futurist',0.24,3);
