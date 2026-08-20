import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'signal_desk.db');

export const db = new Database(DB_PATH);

// Initialize DB schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_providers (
      id TEXT PRIMARY KEY,
      provider_type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 0,
      base_url TEXT,
      model TEXT NOT NULL,
      secret_ref TEXT,
      routing_eligibility TEXT DEFAULT 'ALL',
      privacy_class TEXT DEFAULT 'CLOUD',
      timeout_seconds INTEGER DEFAULT 30,
      max_retries INTEGER DEFAULT 2,
      streaming_enabled INTEGER DEFAULT 1,
      supports_chat INTEGER DEFAULT 1,
      supports_tools INTEGER DEFAULT 0,
      supports_json_schema INTEGER DEFAULT 0,
      supports_vision INTEGER DEFAULT 0,
      supports_embeddings INTEGER DEFAULT 0,
      context_window INTEGER,
      max_output_tokens INTEGER,
      health_status TEXT DEFAULT 'UNKNOWN',
      last_health_check_utc TEXT,
      last_error_code TEXT,
      last_error_message_redacted TEXT,
      average_latency_ms INTEGER DEFAULT 0,
      created_at_utc TEXT,
      updated_at_utc TEXT,
      version INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ai_routing_policy (
      id TEXT PRIMARY KEY,
      routing_mode TEXT DEFAULT 'AUTO'
    );
  `);
  
  // Insert default routing policy if not exists
  const stmt = db.prepare('SELECT count(*) as count FROM ai_routing_policy');
  const res = stmt.get() as { count: number };
  if (res.count === 0) {
    db.prepare("INSERT INTO ai_routing_policy (id, routing_mode) VALUES ('default', 'AUTO')").run();
  }
}

initDB();
