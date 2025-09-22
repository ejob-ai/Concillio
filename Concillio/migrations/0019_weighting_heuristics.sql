-- 0019_weighting_heuristics.sql
-- Nyckelordsbaserad vikt-heuristik (SV). Skapar tabell + seed och en vy för aktiva regler.

CREATE TABLE IF NOT EXISTS weighting_heuristics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,              -- t.ex. 'sv-SE'
  keyword TEXT NOT NULL,             -- matchas case-insensitive som ord/substring
  role_key TEXT NOT NULL,            -- en av våra 10 roller (UPPERCASE UNDERSCORE)
  delta REAL NOT NULL,               -- förslagsvis +0.02 .. +0.08 per träff
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (locale, keyword, role_key)
);

-- Hjälpvy: endast aktiva
CREATE VIEW IF NOT EXISTS weighting_heuristics_active AS
  SELECT * FROM weighting_heuristics WHERE is_active = 1;

-- ===== Seed: sv-SE standardregler =====
-- OBS: Idempotent via INSERT OR IGNORE. Kör gärna flera gånger.

-- Finans/ekonomi → CFO_ANALYST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','budget','CFO_ANALYST',0.06,10),
('sv-SE','kostnad','CFO_ANALYST',0.06,10),
('sv-SE','intäkt','CFO_ANALYST',0.06,10),
('sv-SE','lönsamhet','CFO_ANALYST',0.06,10),
('sv-SE','cashflow','CFO_ANALYST',0.06,10),
('sv-SE','roi','CFO_ANALYST',0.05,10);

-- Juridik/regulatoriskt → LEGAL_ADVISOR & RISK_COMPLIANCE_OFFICER
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','juridik','LEGAL_ADVISOR',0.06,10),
('sv-SE','avtal','LEGAL_ADVISOR',0.06,10),
('sv-SE','gdpr','LEGAL_ADVISOR',0.06,10),
('sv-SE','regler','LEGAL_ADVISOR',0.05,10),
('sv-SE','tillsyn','LEGAL_ADVISOR',0.05,10),
('sv-SE','compliance','RISK_COMPLIANCE_OFFICER',0.06,10),
('sv-SE','policy','RISK_COMPLIANCE_OFFICER',0.05,10),
('sv-SE','esg','RISK_COMPLIANCE_OFFICER',0.05,10),
('sv-SE','risk','RISK_COMPLIANCE_OFFICER',0.05,10);

-- Kund/lojalitet → CUSTOMER_ADVOCATE
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','kund','CUSTOMER_ADVOCATE',0.06,10),
('sv-SE','användare','CUSTOMER_ADVOCATE',0.06,10),
('sv-SE','lojalitet','CUSTOMER_ADVOCATE',0.05,10),
('sv-SE','nps','CUSTOMER_ADVOCATE',0.05,10),
('sv-SE','churn','CUSTOMER_ADVOCATE',0.05,10),
('sv-SE','support','CUSTOMER_ADVOCATE',0.04,10);

-- Tillväxt/marknad/strategi → STRATEGIST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','tillväxt','STRATEGIST',0.05,10),
('sv-SE','go-to-market','STRATEGIST',0.05,10),
('sv-SE','lansering','STRATEGIST',0.05,10),
('sv-SE','marknad','STRATEGIST',0.04,10),
('sv-SE','positionering','STRATEGIST',0.04,10),
('sv-SE','konkurrent','STRATEGIST',0.04,10);

-- Innovation/idé/pilot → INNOVATION_CATALYST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','innovation','INNOVATION_CATALYST',0.05,10),
('sv-SE','idé','INNOVATION_CATALYST',0.05,10),
('sv-SE','experiment','INNOVATION_CATALYST',0.05,10),
('sv-SE','pilot','INNOVATION_CATALYST',0.05,10),
('sv-SE','mvp','INNOVATION_CATALYST',0.05,10);

-- Data/analys/test → DATA_SCIENTIST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','data','DATA_SCIENTIST',0.06,10),
('sv-SE','analys','DATA_SCIENTIST',0.06,10),
('sv-SE','dashboard','DATA_SCIENTIST',0.05,10),
('sv-SE','a/b','DATA_SCIENTIST',0.05,10),
('sv-SE','experiment','DATA_SCIENTIST',0.04,10);

-- Framtid/scenarier → FUTURIST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','framtid','FUTURIST',0.05,10),
('sv-SE','trend','FUTURIST',0.05,10),
('sv-SE','scenario','FUTURIST',0.05,10),
('sv-SE','prognos','FUTURIST',0.04,10);

-- Team/kultur/stress → PSYCHOLOGIST
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','team','PSYCHOLOGIST',0.06,10),
('sv-SE','kultur','PSYCHOLOGIST',0.06,10),
('sv-SE','rekrytering','PSYCHOLOGIST',0.05,10),
('sv-SE','stress','PSYCHOLOGIST',0.05,10),
('sv-SE','konflikt','PSYCHOLOGIST',0.05,10),
('sv-SE','förändringsledning','PSYCHOLOGIST',0.05,10);

-- Mentorskap/erfarenhet → SENIOR_ADVISOR
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','mentor','SENIOR_ADVISOR',0.04,10),
('sv-SE','erfarenhet','SENIOR_ADVISOR',0.04,10),
('sv-SE','best practice','SENIOR_ADVISOR',0.04,10);

-- Tid/kvartal/deadline → STRATEGIST (liten bias mot exekveringsplan)
INSERT OR IGNORE INTO weighting_heuristics (locale, keyword, role_key, delta, priority)
VALUES
('sv-SE','tidplan','STRATEGIST',0.02,5),
('sv-SE','deadline','STRATEGIST',0.02,5),
('sv-SE','kvartal','STRATEGIST',0.02,5);
