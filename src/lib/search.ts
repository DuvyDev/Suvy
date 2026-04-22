import type { SearchResultItem } from './duckduckgo';
import { searchCrawler, requestCrawl, searchCrawlerFull } from './duvycrawl';
import { searchDuckDuckGo } from './duckduckgo';

/** Extended result that tracks where it came from. */
export interface SearchResult extends SearchResultItem {
  source: 'local' | 'duckduckgo';
}

/** Full response from the search orchestrator. */
export interface SearchResponse {
  results: SearchResult[];
  localCount: number;
  ddgCount: number;
  page: number;
  totalLocal: number;
  hasMore: boolean;
}

/**
 * Minimum number of local results required before skipping the DDG fallback.
 * If the crawler returns fewer than this, DDG is queried to fill the gap.
 */
const LOCAL_THRESHOLD = 3;

/** Results per page. */
const PAGE_SIZE = 10;

/**
 * Unified search: queries Duvycrawl first, falls back to DuckDuckGo
 * when there aren't enough local results, and tells the crawler to
 * index URLs that came from the fallback.
 */
export async function search(query: string, page: number = 1): Promise<SearchResponse> {
  const empty: SearchResponse = { results: [], localCount: 0, ddgCount: 0, page, totalLocal: 0, hasMore: false };
  if (!query || query.trim() === '') return empty;

  // 1. Try the local crawler index first (with pagination).
  const { results: localRaw, total: totalLocal } = await searchCrawlerPaginated(query, PAGE_SIZE, page);
  const localResults: SearchResult[] = localRaw.map((r) => ({ ...r, source: 'local' as const }));

  // 2. If we have enough local results, return them with pagination info.
  if (localResults.length >= LOCAL_THRESHOLD) {
    return {
      results: localResults,
      localCount: localResults.length,
      ddgCount: 0,
      page,
      totalLocal,
      hasMore: page * PAGE_SIZE < totalLocal,
    };
  }

  // 3. Not enough local results — supplement with DuckDuckGo (only on page 1).
  //    DDG scraping doesn't support real pagination, so we only fetch on first page.
  let ddgResults: SearchResult[] = [];
  if (page === 1) {
    const remaining = PAGE_SIZE - localResults.length;
    const localUrls = new Set(localResults.map((r) => r.url));

    const ddgRaw = await searchDuckDuckGo(query, remaining + 5);
    ddgResults = ddgRaw
      .filter((r) => !localUrls.has(r.url))
      .slice(0, remaining)
      .map((r) => ({ ...r, source: 'duckduckgo' as const }));

    // 4. Fire-and-forget: ask the crawler to index the DDG URLs for next time.
    const urlsToIndex = ddgResults.map((r) => r.url).filter((u) => u.startsWith('http'));
    requestCrawl(urlsToIndex);
  }

  return {
    results: [...localResults, ...ddgResults],
    localCount: localResults.length,
    ddgCount: ddgResults.length,
    page,
    totalLocal,
    hasMore: page * PAGE_SIZE < totalLocal,
  };
}

/**
 * Wrapper around searchCrawlerFull that returns total count for pagination.
 */
async function searchCrawlerPaginated(
  query: string,
  limit: number,
  page: number
): Promise<{ results: SearchResultItem[]; total: number }> {
  try {
    return await searchCrawlerFull(query, limit, page);
  } catch {
    return { results: [], total: 0 };
  }
}

