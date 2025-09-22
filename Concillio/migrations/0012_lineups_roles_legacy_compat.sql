-- Legacy compat seed for environments with strict role_key CHECK constraint
-- Maps extended roles to nearest legacy roles to satisfy CHECK(role_key IN (...))

-- Ensure tables exist
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

-- Helper view to translate extended role keys to legacy allowed ones
-- NOTE: D1 doesn't support CREATE FUNCTION; do mapping inline in INSERTs

-- Re-seed IDs 11-15 with mapped roles
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at) VALUES
  (11,'Entreprenör / Startup-grundare',1,datetime('now')),
  (12,'Företagsledare (SME/Corporate)',1,datetime('now')),
  (13,'Investerare / Styrelseledamot',1,datetime('now')),
  (14,'Kreatör / Innovatör',1,datetime('now')),
  (15,'Policy Maker / NGO-ledare',1,datetime('now'))
;

DELETE FROM lineups_preset_roles WHERE preset_id IN (11,12,13,14,15);

-- 11
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (11,'STRATEGIST',0.24,0),
  (11,'FUTURIST',0.18,1),
  (11,'PSYCHOLOGIST',0.14,2),
  (11,'ADVISOR',0.22,3),
  (11,'ADVISOR',0.22,4);

-- 12
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (12,'STRATEGIST',0.22,0),
  (12,'PSYCHOLOGIST',0.22,1), -- map RISK_COMPLIANCE_OFFICER -> PSYCHOLOGIST
  (12,'ADVISOR',0.22,2),      -- map CFO_ANALYST -> ADVISOR
  (12,'FUTURIST',0.18,3),     -- map CUSTOMER_ADVOCATE -> FUTURIST
  (12,'ADVISOR',0.16,4);

-- 13
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (13,'ADVISOR',0.26,0),      -- map CFO_ANALYST -> ADVISOR
  (13,'PSYCHOLOGIST',0.20,1), -- map RISK_COMPLIANCE_OFFICER -> PSYCHOLOGIST
  (13,'FUTURIST',0.16,2),
  (13,'STRATEGIST',0.22,3),
  (13,'PSYCHOLOGIST',0.16,4);

-- 14
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (14,'ADVISOR',0.28,0),      -- map INNOVATION_CATALYST -> ADVISOR
  (14,'FUTURIST',0.22,1),
  (14,'FUTURIST',0.20,2),     -- map CUSTOMER_ADVOCATE -> FUTURIST
  (14,'PSYCHOLOGIST',0.14,3),
  (14,'ADVISOR',0.16,4);

-- 15
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (15,'PSYCHOLOGIST',0.26,0), -- map RISK_COMPLIANCE_OFFICER -> PSYCHOLOGIST
  (15,'FUTURIST',0.20,1),
  (15,'FUTURIST',0.18,2),     -- map CUSTOMER_ADVOCATE -> FUTURIST
  (15,'STRATEGIST',0.20,3),
  (15,'PSYCHOLOGIST',0.16,4);

-- Re-seed IDs 6-10 mapped
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at) VALUES
  (6,'Scale-up (Execution-heavy Growth)',1,datetime('now')),
  (7,'Regulated (Health/Finance/Public)',1,datetime('now')),
  (8,'SaaS B2B (Enterprise Software)',1,datetime('now')),
  (9,'Konsumentappar (B2C Digital Products)',1,datetime('now')),
  (10,'Industri / IoT / Tillverkning',1,datetime('now'))
;

DELETE FROM lineups_preset_roles WHERE preset_id IN (6,7,8,9,10);

-- 6
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (6,'STRATEGIST',0.24,0),
  (6,'ADVISOR',0.22,1),      -- map CFO_ANALYST
  (6,'FUTURIST',0.18,2),     -- map CUSTOMER_ADVOCATE
  (6,'ADVISOR',0.18,3),      -- map SENIOR_ADVISOR (same)
  (6,'PSYCHOLOGIST',0.18,4); -- map DATA_SCIENTIST

-- 7
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (7,'PSYCHOLOGIST',0.26,0), -- map RISK_COMPLIANCE_OFFICER
  (7,'PSYCHOLOGIST',0.22,1), -- map LEGAL_ADVISOR
  (7,'ADVISOR',0.18,2),      -- map CFO_ANALYST
  (7,'STRATEGIST',0.18,3),
  (7,'FUTURIST',0.16,4);     -- map CUSTOMER_ADVOCATE

-- 8
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (8,'STRATEGIST',0.22,0),
  (8,'FUTURIST',0.20,1),     -- map CUSTOMER_ADVOCATE
  (8,'PSYCHOLOGIST',0.18,2), -- map DATA_SCIENTIST
  (8,'ADVISOR',0.20,3),      -- map CFO_ANALYST
  (8,'ADVISOR',0.20,4);      -- map SENIOR_ADVISOR

-- 9
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (9,'ADVISOR',0.22,0),      -- map INNOVATION_CATALYST
  (9,'FUTURIST',0.22,1),     -- map CUSTOMER_ADVOCATE
  (9,'PSYCHOLOGIST',0.20,2),
  (9,'PSYCHOLOGIST',0.18,3), -- map DATA_SCIENTIST
  (9,'STRATEGIST',0.18,4);

-- 10
INSERT OR IGNORE INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
  (10,'PSYCHOLOGIST',0.24,0), -- map RISK_COMPLIANCE_OFFICER
  (10,'PSYCHOLOGIST',0.18,1), -- map LEGAL_ADVISOR
  (10,'ADVISOR',0.18,2),      -- map CFO_ANALYST
  (10,'STRATEGIST',0.20,3),
  (10,'ADVISOR',0.20,4);
