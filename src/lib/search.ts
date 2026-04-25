import type { SearchResultItem } from './duckduckgo';
import { requestCrawl, searchCrawlerFull, type CrawlerFilters, type CrawlerSearchResultItem } from './duvycrawl';
import { searchDuckDuckGo } from './duckduckgo';
import { shouldQueryDDG, markQueried } from './ddg-cache';

export interface SearchResult extends CrawlerSearchResultItem {
  source: 'local' | 'duckduckgo';
}

export interface SearchResponse {
  results: SearchResult[];
  localCount: number;
  ddgCount: number;
  page: number;
  totalLocal: number;
  hasMore: boolean;
  wikipediaResult?: SearchResult;
  sitelinks: SearchResultItem[];
  newsResults: SearchResult[];
}

export interface SearchOptions {
  page?: number;
  filters?: CrawlerFilters;
}

const PAGE_SIZE = 10;

const DDG_FEED_RESULTS = 10;

/**
 * Parse search query to extract operators like site:domain.
 * Returns the cleaned query and extracted filters.
 */
function parseQuery(rawQuery: string): { query: string; domain?: string } {
  const siteRegex = /\bsite:(\S+)/gi;
  let domain: string | undefined;
  let match: RegExpExecArray | null;

  while ((match = siteRegex.exec(rawQuery)) !== null) {
    domain = match[1];
  }

  const query = rawQuery.replace(siteRegex, '').trim().replace(/\s+/g, ' ');
  return { query, domain };
}

/**
 * Search the local crawler index first and return results immediately.
 * Supports site: filtering, date range, language and region filters.
 * In the background (fire-and-forget), query DuckDuckGo for a few results
 * and feed them to the crawler so the local index grows over time.
 */
export async function search(rawQuery: string, options: SearchOptions = {}): Promise<SearchResponse> {
  const { page = 1, filters = {} } = options;

  const empty: SearchResponse = {
    results: [],
    localCount: 0,
    ddgCount: 0,
    page,
    totalLocal: 0,
    hasMore: false,
    sitelinks: [],
    newsResults: [],
  };

  if (!rawQuery || rawQuery.trim() === '') return empty;

  const { query, domain } = parseQuery(rawQuery);
  if (!query && !domain) return empty;

  const mergedFilters: CrawlerFilters = {
    ...filters,
    ...(domain ? { domain } : {}),
  };

  const { results: localRaw, total: totalLocal } = await searchCrawlerPaginated(
    query || domain || '',
    PAGE_SIZE,
    page,
    mergedFilters
  );

  let localResults: SearchResult[] = localRaw.map((r) => ({ ...r, source: 'local' as const }));

  // Extract Wikipedia result if present.
  let wikipediaResult: SearchResult | undefined;
  const wikiIndex = localResults.findIndex(
    (r) => r.meta.domain === 'wikipedia.org' || r.meta.domain.endsWith('.wikipedia.org')
  );
  if (wikiIndex >= 0) {
    wikipediaResult = localResults[wikiIndex];
    localResults = localResults.filter((_, i) => i !== wikiIndex);
  }

  // Extract news results with rich schema (image + publishedAt) for the sidebar card.
  const newsResults: SearchResult[] = localResults
    .filter(
      (r, i) =>
        i !== 0 && // skip first result (gets sitelinks)
        r.meta.schemaImage &&
        r.meta.publishedAt &&
        !r.meta.domain.includes('wikipedia.org')
    )
    .sort((a, b) => {
      const ta = a.meta.publishedAt ? new Date(a.meta.publishedAt).getTime() : 0;
      const tb = b.meta.publishedAt ? new Date(b.meta.publishedAt).getTime() : 0;
      return tb - ta; // newest first
    })
    .slice(0, 5);

  // Fetch sitelinks for the first result's domain (page 1 only).
  let sitelinks: SearchResultItem[] = [];
  if (page === 1 && localResults.length > 0) {
    const firstDomain = localResults[0].meta.domain;
    try {
      const { results: domainResults } = await searchCrawlerFull(
        query || '',
        6,
        1,
        { ...mergedFilters, domain: firstDomain }
      );
      sitelinks = domainResults
        .filter((r) => r.url !== localResults[0].url)
        .slice(0, 4);
    } catch {
      // Silently ignore — sitelinks are non-critical.
    }
  }

  // Fire-and-forget: fetch DDG results in background to feed the crawler,
  // but only if we haven't queried DDG for this term recently.
  if (page === 1 && shouldQueryDDG(rawQuery)) {
    const localUrls = new Set(localRaw.map((r) => r.url));
    searchDuckDuckGo(rawQuery, DDG_FEED_RESULTS + 5)
      .then((ddgRaw) => {
        markQueried(rawQuery);
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
    wikipediaResult,
    sitelinks,
    newsResults,
  };
}

async function searchCrawlerPaginated(
  query: string,
  limit: number,
  page: number,
  filters: CrawlerFilters
): Promise<{ results: CrawlerSearchResultItem[]; total: number }> {
  try {
    return await searchCrawlerFull(query, limit, page, filters);
  } catch {
    return { results: [], total: 0 };
  }
}