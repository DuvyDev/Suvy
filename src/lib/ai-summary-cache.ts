import { getCache, setCache, pruneCache } from './cache-db';

const TTL_MS = parseInt(process.env.AI_SUMMARY_CACHE_TTL_MINUTES || '60', 10) * 60 * 1000;
const MAX_ENTRIES = 3000;
const NAMESPACE = 'ai-summary';

export interface CachedAiSummary {
  summary: string;
  sources: { title: string; url: string }[];
  timestamp: number;
}

function cacheKey(query: string, lang: string): string {
  return `${query.trim().toLowerCase()}::${lang}`;
}

export function getCachedSummary(query: string, lang: string): CachedAiSummary | null {
  const key = cacheKey(query, lang);
  const entry = getCache<{ summary: string; sources: { title: string; url: string }[] }>(NAMESPACE, key, TTL_MS);
  
  if (!entry || !entry.result) return null;
  
  return {
    summary: entry.result.summary,
    sources: entry.result.sources,
    timestamp: entry.timestamp,
  };
}

export function setCachedSummary(query: string, lang: string, summary: string, sources: { title: string; url: string }[]): void {
  const key = cacheKey(query, lang);
  setCache(NAMESPACE, key, { summary, sources });
  pruneCache(NAMESPACE, TTL_MS, MAX_ENTRIES);
}

