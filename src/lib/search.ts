import type { SearchResultItem } from './duckduckgo';
import { requestCrawl, searchCrawlerFull } from './duvycrawl';
import { searchDuckDuckGo } from './duckduckgo';
import { shouldQueryDDG, markQueried } from './ddg-cache';

export interface SearchResult extends SearchResultItem {
  source: 'local' | 'duckduckgo';
}

export interface SearchResponse {
  results: SearchResult[];
  localCount: number;
  ddgCount: number;
  page: number;
  totalLocal: number;
  hasMore: boolean;
}

const PAGE_SIZE = 10;

const DDG_FEED_RESULTS = 3;

/**
 * Search the local crawler index first and return results immediately.
 * In the background (fire-and-forget), query DuckDuckGo for a few results
 * and feed them to the crawler so the local index grows over time.
 */
export async function search(query: string, page: number = 1): Promise<SearchResponse> {
  const empty: SearchResponse = { results: [], localCount: 0, ddgCount: 0, page, totalLocal: 0, hasMore: false };
  if (!query || query.trim() === '') return empty;

  const { results: localRaw, total: totalLocal } = await searchCrawlerPaginated(query, PAGE_SIZE, page);
  const localResults: SearchResult[] = localRaw.map((r) => ({ ...r, source: 'local' as const }));

  // Fire-and-forget: fetch DDG results in background to feed the crawler,
  // but only if we haven't queried DDG for this term recently.
  if (page === 1 && shouldQueryDDG(query)) {
    const localUrls = new Set(localResults.map((r) => r.url));
    searchDuckDuckGo(query, DDG_FEED_RESULTS + 5)
      .then((ddgRaw) => {
        markQueried(query);
        const urlsToIndex = ddgRaw
          .filter((r) => !localUrls.has(r.url))
          .slice(0, DDG_FEED_RESULTS)
          .map((r) => r.url)
          .filter((u) => u.startsWith('http'));
        requestCrawl(urlsToIndex);
      })
      .catch(() => { /* silently ignore DDG errors */ });
  }

  return {
    results: localResults,
    localCount: localResults.length,
    ddgCount: 0,
    page,
    totalLocal,
    hasMore: page * PAGE_SIZE < totalLocal,
  };
}

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