-- Minimal org + subscription schema
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
