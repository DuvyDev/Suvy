import { getCache, setCache, pruneCache } from './cache-db';

const TTL_MS = parseInt(process.env.DDG_CACHE_TTL_MINUTES || '120', 10) * 60 * 1000;
const MAX_ENTRIES = 5000;
const NAMESPACE = 'ddg';

/**
 * Returns true if the query should be sent to DDG
 * (i.e. it hasn't been queried recently enough).
 */
export function shouldQueryDDG(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  const entry = getCache<null>(NAMESPACE, normalized, TTL_MS);
  
  // If no entry, or it's expired (getCache handles expiration and returns null)
  if (!entry) return true;
  
  return false;
}

/**
 * Marks a query as having been sent to DDG now,
 * and persists the cache to disk (with pruning).
 */
export function markQueried(query: string): void {
  const normalized = query.trim().toLowerCase();
  setCache(NAMESPACE, normalized, null);
  pruneCache(NAMESPACE, TTL_MS, MAX_ENTRIES);
}