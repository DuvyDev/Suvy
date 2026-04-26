import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = 'data';
const CACHE_FILE = join(CACHE_DIR, 'cache.db');

function ensureDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  ensureDir();
  db = new DatabaseSync(CACHE_FILE);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache_entries (
      namespace TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      timestamp INTEGER NOT NULL,
      PRIMARY KEY (namespace, key)
    ) WITHOUT ROWID;
  `);
  
  return db;
}

export function getCache<T = any>(namespace: string, key: string, ttlMs: number): { result: T, timestamp: number } | null {
  const database = getDb();
  
  const stmt = database.prepare('SELECT value, timestamp FROM cache_entries WHERE namespace = ? AND key = ?');
  const row = stmt.get(namespace, key) as { value: string | null, timestamp: number } | undefined;
  
  if (!row) return null;
  
  if (Date.now() - row.timestamp > ttlMs) {
    const delStmt = database.prepare('DELETE FROM cache_entries WHERE namespace = ? AND key = ?');
    delStmt.run(namespace, key);
    return null;
  }
  
  if (row.value !== null) {
    try {
      return { result: JSON.parse(row.value) as T, timestamp: row.timestamp };
    } catch {
      return null;
    }
  }
  
  return { result: null as T, timestamp: row.timestamp };
}

export function setCache(namespace: string, key: string, value: any): void {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO cache_entries (namespace, key, value, timestamp)
    VALUES (?, ?, ?, ?)
  `);
  
  const serialized = value !== undefined && value !== null ? JSON.stringify(value) : null;
  stmt.run(namespace, key, serialized, Date.now());
}

export function pruneCache(namespace: string, ttlMs: number, maxEntries: number): void {
  const database = getDb();
  const cutoff = Date.now() - ttlMs;
  
  const delExpired = database.prepare('DELETE FROM cache_entries WHERE namespace = ? AND timestamp < ?');
  delExpired.run(namespace, cutoff);
  
  const countStmt = database.prepare('SELECT COUNT(*) as count FROM cache_entries WHERE namespace = ?');
  const result = countStmt.get(namespace) as { count: number };
  
  if (result.count > maxEntries) {
    const toRemove = result.count - maxEntries;
    const delOverflow = database.prepare(`
      DELETE FROM cache_entries 
      WHERE namespace = ? 
      AND key IN (
        SELECT key FROM cache_entries 
        WHERE namespace = ? 
        ORDER BY timestamp ASC 
        LIMIT ?
      )
    `);
    delOverflow.run(namespace, namespace, toRemove);
  }
}
