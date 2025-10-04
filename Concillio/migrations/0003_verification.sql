-- Add verified flag to users
ALTER TABLE users ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;

-- Email verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_verif_user_expires ON verification_tokens(user_id, expires_at);
