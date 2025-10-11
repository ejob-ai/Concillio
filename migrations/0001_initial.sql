-- migrations/0001_initial.sql

-- sessions: one per user decision
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  user_id TEXT,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created', -- created|running|consensus|failed|canceled
  plan TEXT,                               -- free|starter|pro
  meta TEXT                                 -- JSON
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- steps: orchestrator phases with deterministic ordering
CREATE TABLE IF NOT EXISTS session_steps (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  phase TEXT NOT NULL,    -- intro|analysis|challenge|synthesis|consensus
  ordinal INTEGER NOT NULL,
  started_at INTEGER,
  finished_at INTEGER,
  cost_ms INTEGER DEFAULT 0,
  cost_tokens INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending|running|done|failed
  payload TEXT,            -- JSON (inputs/outputs)
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_steps_session ON session_steps(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_steps_session_phase ON session_steps(session_id, phase);

-- outcomes: final protocol / recommendations
CREATE TABLE IF NOT EXISTS outcomes (
  session_id TEXT PRIMARY KEY,
  protocol_md TEXT,
  summary TEXT,
  risks TEXT,              -- JSON
  decided_at INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- audits: request/response snapshots or metrics
CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  kind TEXT NOT NULL,      -- model_call|webhook|system
  data TEXT,               -- JSON
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- stripe_events: to dedupe webhook deliveries
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT,
  received_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  raw TEXT                  -- JSON
);
