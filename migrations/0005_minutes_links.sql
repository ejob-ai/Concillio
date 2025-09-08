-- Optional link table for minutes diffs
CREATE TABLE IF NOT EXISTS minutes_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  current_id INTEGER NOT NULL,
  previous_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(current_id) REFERENCES minutes(id),
  FOREIGN KEY(previous_id) REFERENCES minutes(id)
);
CREATE INDEX IF NOT EXISTS idx_minutes_links_current ON minutes_links(current_id);
