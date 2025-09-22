-- Presets 6–10 seed (id 6..10)
-- Safe to run multiple times: uses INSERT OR IGNORE and clears roles per preset

-- 6) Scale-up (Execution-heavy Growth)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (6,'Scale-up (Execution-heavy Growth)',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=6;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(6,'STRATEGIST',0.24,0),
(6,'CFO_ANALYST',0.22,1),
(6,'CUSTOMER_ADVOCATE',0.18,2),
(6,'SENIOR_ADVISOR',0.18,3),
(6,'DATA_SCIENTIST',0.18,4);

-- 7) Regulated (Health/Finance/Public)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (7,'Regulated (Health/Finance/Public)',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=7;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(7,'RISK_COMPLIANCE_OFFICER',0.26,0),
(7,'LEGAL_ADVISOR',0.22,1),
(7,'CFO_ANALYST',0.18,2),
(7,'STRATEGIST',0.18,3),
(7,'CUSTOMER_ADVOCATE',0.16,4);

-- 8) SaaS B2B (Enterprise Software)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (8,'SaaS B2B (Enterprise Software)',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=8;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(8,'STRATEGIST',0.22,0),
(8,'CUSTOMER_ADVOCATE',0.20,1),
(8,'DATA_SCIENTIST',0.18,2),
(8,'CFO_ANALYST',0.20,3),
(8,'SENIOR_ADVISOR',0.20,4);

-- 9) Konsumentappar (B2C Digital Products)
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (9,'Konsumentappar (B2C Digital Products)',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=9;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(9,'INNOVATION_CATALYST',0.22,0),
(9,'CUSTOMER_ADVOCATE',0.22,1),
(9,'PSYCHOLOGIST',0.20,2),
(9,'DATA_SCIENTIST',0.18,3),
(9,'STRATEGIST',0.18,4);

-- 10) Industri / IoT / Tillverkning
INSERT OR IGNORE INTO lineups_presets (id,name,is_public,created_at)
VALUES (10,'Industri / IoT / Tillverkning',1,datetime('now'));
DELETE FROM lineups_preset_roles WHERE preset_id=10;
INSERT INTO lineups_preset_roles (preset_id,role_key,weight,position) VALUES
(10,'RISK_COMPLIANCE_OFFICER',0.24,0),
(10,'LEGAL_ADVISOR',0.18,1),
(10,'CFO_ANALYST',0.18,2),
(10,'STRATEGIST',0.20,3),
(10,'SENIOR_ADVISOR',0.20,4);
