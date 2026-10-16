-- Vin Diesel chat leads. Safe to re-run.
CREATE TABLE IF NOT EXISTS chat_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  urgent INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  company TEXT,
  phone TEXT,
  vehicles TEXT,
  location TEXT,
  reason TEXT,
  preferred_when TEXT,
  summary TEXT,
  transcript TEXT,
  email_status TEXT,
  email_error TEXT,
  page_url TEXT,
  conversation_id TEXT
);

CREATE INDEX IF NOT EXISTS chat_leads_created ON chat_leads (id DESC);
CREATE INDEX IF NOT EXISTS chat_leads_conversation ON chat_leads (conversation_id, kind);

CREATE TABLE IF NOT EXISTS chat_rate (
  ip_hash TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, bucket)
);
