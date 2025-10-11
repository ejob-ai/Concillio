-- PATCH 2 — Initial schema for auth + org/subscription (idempotent)

-- users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);

-- email verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_verif_user_expires ON verification_tokens(user_id, expires_at);

-- org and subscription (for Stripe mapping)
CREATE TABLE IF NOT EXISTS org (
  id TEXT PRIMARY KEY,
  name TEXT,
  stripe_customer_id TEXT UNIQUE
);
CREATE TABLE IF NOT EXISTS subscription (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  seats INTEGER DEFAULT 1,
  current_period_end INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER,
  FOREIGN KEY(org_id) REFERENCES org(id)
);
CREATE INDEX IF NOT EXISTS sub_org_idx ON subscription(org_id);
