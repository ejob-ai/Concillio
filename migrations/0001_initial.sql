-- migrations/0001_initial.sql

-- Enable FKs (SQLite/D1)
PRAGMA foreign_keys = ON;

-- Decision sessions (separate from auth `sessions`)
CREATE TABLE IF NOT EXISTS decision_sessions (
  id            TEXT PRIMARY KEY,               -- e.g. ulid()
  topic         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'created',-- created|running|failed|done
  plan          TEXT,                           -- starter|pro|legacy etc
  meta          TEXT,                           -- JSON string (client/context)
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at    INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- keep updated_at fresh
CREATE TRIGGER IF NOT EXISTS trg_decision_sessions_updated_at
AFTER UPDATE ON decision_sessions
FOR EACH ROW
BEGIN
  UPDATE decision_sessions
  SET updated_at = strftime('%s','now')
  WHERE rowid = NEW.rowid;
END;

-- Steps within a decision session (per phase/role)
CREATE TABLE IF NOT EXISTS decision_session_steps (
  id           TEXT PRIMARY KEY,                -- e.g. ulid()
  session_id   TEXT NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
  phase        TEXT NOT NULL,                   -- intro|analysis|challenge|synthesis|consensus
  role         TEXT NOT NULL,                   -- strategist|risk_officer|advisor|data_scientist...
  input        TEXT,                            -- JSON
  output       TEXT,                            -- JSON
  cost_cents   INTEGER DEFAULT 0,
  duration_ms  INTEGER DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending|ok|error|skipped
  created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_decision_steps_session
  ON decision_session_steps(session_id);

CREATE INDEX IF NOT EXISTS idx_decision_steps_phase
  ON decision_session_steps(session_id, phase);

-- Final outcome per decision session (one row)
CREATE TABLE IF NOT EXISTS outcomes (
  session_id     TEXT PRIMARY KEY REFERENCES decision_sessions(id) ON DELETE CASCADE,
  consensus      TEXT,                          -- markdown / summary
  recommendations TEXT,                         -- markdown / list
  risks          TEXT,                          -- markdown / list
  created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Generic audit log (can include non-session events too)
CREATE TABLE IF NOT EXISTS audits (
  id          TEXT PRIMARY KEY,                 -- ulid()
  session_id  TEXT,                             -- nullable (system-level events)
  kind        TEXT NOT NULL,                    -- event type
  payload     TEXT,                             -- JSON
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY(session_id) REFERENCES decision_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audits_session
  ON audits(session_id);

-- Stripe events we’ve seen (idempotency)
CREATE TABLE IF NOT EXISTS stripe_events (
  id          TEXT PRIMARY KEY,                 -- Stripe event id
  type        TEXT NOT NULL,
  created_at  INTEGER NOT NULL,                 -- Stripe’s event time (epoch)
  received_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  payload     TEXT NOT NULL                     -- JSON
);
