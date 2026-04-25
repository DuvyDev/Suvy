import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = 'data';
const CACHE_FILE = join(CACHE_DIR, 'ddg-cache.json');

const TTL_MS = parseInt(process.env.DDG_CACHE_TTL_MINUTES || '120', 10) * 60 * 1000;
const MAX_ENTRIES = 5000;

type CacheStore = Record<string, number>;

let memCache: CacheStore | null = null;

function ensureDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCache(): CacheStore {
  if (memCache) return memCache;
  try {
    if (existsSync(CACHE_FILE)) {
      const raw = readFileSync(CACHE_FILE, 'utf-8');
      memCache = JSON.parse(raw);
      return memCache!;
    }
  } catch {
    // Corrupted file — start fresh.
  }
  memCache = {};
  return memCache;
}

function persistCache(): void {
  ensureDir();
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(memCache), 'utf-8');
  } catch {
    // Non-critical — next write will try again.
  }
}

function prune(cache: CacheStore): void {
  const cutoff = Date.now() - TTL_MS;
  for (const key of Object.keys(cache)) {
    if (cache[key] < cutoff) {
      delete cache[key];
    }
  }

  const entries = Object.entries(cache);
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a[1] - b[1]);
    const toRemove = entries.length - MAX_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]];
    }
  }
}

/**
 * Returns true if the query should be sent to DDG
 * (i.e. it hasn't been queried recently enough).
 */
export function shouldQueryDDG(query: string): boolean {
  const cache = loadCache();
  const normalized = query.trim().toLowerCase();
  const ts = cache[normalized];
  if (!ts) return true;
  return Date.now() - ts > TTL_MS;
}

/**
 * Marks a query as having been sent to DDG now,
 * and persists the cache to disk (with pruning).
 */
export function markQueried(query: string): void {
  const cache = loadCache();
  const normalized = query.trim().toLowerCase();
  cache[normalized] = Date.now();
  prune(cache);
  persistCache();
}