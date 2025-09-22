-- users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- scrypt hash i base64
  password_salt TEXT NOT NULL,          -- slumpad salt i base64
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  disabled INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                  -- crypto.randomUUID()
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,             -- ISO-8601
  ip_hash TEXT,                         -- valfritt (HMAC av IP)
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
