-- Reseed presets 1–10 with 10‑mix (idempotent)

-- Ensure tables
CREATE TABLE IF NOT EXISTS lineups_presets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lineups_preset_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL,
  role_key TEXT NOT NULL,
  weight REAL NOT NULL,
  position INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(preset_id, role_key),
  UNIQUE(preset_id, position)
);

-- 1) Entreprenör / Startup-grundare
INSERT INTO lineups_presets (id, name, is_public) VALUES (1,'Entreprenör / Startup-grundare',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=1;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(1,'STRATEGIST',0.24,0),
(1,'FUTURIST',0.18,1),
(1,'PSYCHOLOGIST',0.16,2),
(1,'CFO_ANALYST',0.22,3),
(1,'SENIOR_ADVISOR',0.20,4);

-- 2) Företagsledare (SME/Corporate)
INSERT INTO lineups_presets (id, name, is_public) VALUES (2,'Företagsledare (SME/Corporate)',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=2;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(2,'STRATEGIST',0.22,0),
(2,'RISK_COMPLIANCE_OFFICER',0.22,1),
(2,'CFO_ANALYST',0.20,2),
(2,'CUSTOMER_ADVOCATE',0.18,3),
(2,'SENIOR_ADVISOR',0.18,4);

-- 3) Investerare / Styrelseledamot
INSERT INTO lineups_presets (id, name, is_public) VALUES (3,'Investerare / Styrelseledamot',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=3;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(3,'CFO_ANALYST',0.26,0),
(3,'RISK_COMPLIANCE_OFFICER',0.22,1),
(3,'FUTURIST',0.20,2),
(3,'STRATEGIST',0.18,3),
(3,'PSYCHOLOGIST',0.14,4);

-- 4) Kreatör / Innovatör
INSERT INTO lineups_presets (id, name, is_public) VALUES (4,'Kreatör / Innovatör',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=4;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(4,'INNOVATION_CATALYST',0.26,0),
(4,'FUTURIST',0.22,1),
(4,'CUSTOMER_ADVOCATE',0.18,2),
(4,'PSYCHOLOGIST',0.18,3),
(4,'SENIOR_ADVISOR',0.16,4);

-- 5) Policy Maker / NGO-ledare
INSERT INTO lineups_presets (id, name, is_public) VALUES (5,'Policy Maker / NGO-ledare',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=5;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(5,'RISK_COMPLIANCE_OFFICER',0.24,0),
(5,'FUTURIST',0.20,1),
(5,'CUSTOMER_ADVOCATE',0.18,2),
(5,'STRATEGIST',0.20,3),
(5,'PSYCHOLOGIST',0.18,4);

-- 6) Scale-up / Rapid Growth
INSERT INTO lineups_presets (id, name, is_public) VALUES (6,'Scale-up / Rapid Growth',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=6;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(6,'STRATEGIST',0.24,0),
(6,'CFO_ANALYST',0.22,1),
(6,'CUSTOMER_ADVOCATE',0.18,2),
(6,'DATA_SCIENTIST',0.18,3),
(6,'SENIOR_ADVISOR',0.18,4);

-- 7) Regulated Industry (Health/Finance/Utilities)
INSERT INTO lineups_presets (id, name, is_public) VALUES (7,'Regulated Industry (Health/Finance/Utilities)',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=7;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(7,'RISK_COMPLIANCE_OFFICER',0.28,0),
(7,'LEGAL_ADVISOR',0.22,1),
(7,'CFO_ANALYST',0.18,2),
(7,'STRATEGIST',0.18,3),
(7,'CUSTOMER_ADVOCATE',0.14,4);

-- 8) SaaS B2B (Enterprise Software)
INSERT INTO lineups_presets (id, name, is_public) VALUES (8,'SaaS B2B (Enterprise Software)',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=8;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(8,'STRATEGIST',0.22,0),
(8,'CUSTOMER_ADVOCATE',0.20,1),
(8,'DATA_SCIENTIST',0.18,2),
(8,'CFO_ANALYST',0.20,3),
(8,'SENIOR_ADVISOR',0.20,4);

-- 9) Konsumentappar (B2C Digital Products)
INSERT INTO lineups_presets (id, name, is_public) VALUES (9,'Konsumentappar (B2C Digital Products)',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=9;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(9,'INNOVATION_CATALYST',0.22,0),
(9,'CUSTOMER_ADVOCATE',0.22,1),
(9,'PSYCHOLOGIST',0.20,2),
(9,'DATA_SCIENTIST',0.18,3),
(9,'STRATEGIST',0.18,4);

-- 10) Industri / IoT / Tillverkning
INSERT INTO lineups_presets (id, name, is_public) VALUES (10,'Industri / IoT / Tillverkning',1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=excluded.is_public;
DELETE FROM lineups_preset_roles WHERE preset_id=10;
INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position) VALUES
(10,'RISK_COMPLIANCE_OFFICER',0.24,0),
(10,'LEGAL_ADVISOR',0.18,1),
(10,'CFO_ANALYST',0.18,2),
(10,'STRATEGIST',0.20,3),
(10,'SENIOR_ADVISOR',0.20,4);
