import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = 'data';
const CACHE_FILE = join(CACHE_DIR, 'ai-summary-cache.json');

const TTL_MS = parseInt(process.env.AI_SUMMARY_CACHE_TTL_MINUTES || '60', 10) * 60 * 1000;
const MAX_ENTRIES = 3000;

export interface CachedAiSummary {
  summary: string;
  sources: { title: string; url: string }[];
  timestamp: number;
}

type CacheStore = Record<string, CachedAiSummary>;

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
  }
  memCache = {};
  return memCache;
}

function persistCache(): void {
  ensureDir();
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(memCache), 'utf-8');
  } catch {
  }
}

function prune(cache: CacheStore): void {
  const cutoff = Date.now() - TTL_MS;
  for (const key of Object.keys(cache)) {
    if (cache[key].timestamp < cutoff) {
      delete cache[key];
    }
  }

  const entries = Object.entries(cache);
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.length - MAX_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]];
    }
  }
}

function cacheKey(query: string, lang: string): string {
  return `${query.trim().toLowerCase()}::${lang}`;
}

export function getCachedSummary(query: string, lang: string): CachedAiSummary | null {
  const cache = loadCache();
  const entry = cache[cacheKey(query, lang)];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    delete cache[cacheKey(query, lang)];
    return null;
  }
  return entry;
}

export function setCachedSummary(query: string, lang: string, summary: string, sources: { title: string; url: string }[]): void {
  const cache = loadCache();
  const key = cacheKey(query, lang);
  cache[key] = { summary, sources, timestamp: Date.now() };
  prune(cache);
  persistCache();
}
