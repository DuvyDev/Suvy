import type { SearchResultItem } from './duckduckgo';

/**
 * Base URL for the Duvycrawl API.
 * Both services are expected to run on the same machine.
 */
const CRAWLER_API = 'http://localhost:8080/api/v1';

/** Timeout for crawler API requests (ms). Keep short so DDG fallback kicks in fast. */
const CRAWLER_TIMEOUT_MS = 3000;

/** Raw search result from the Duvycrawl API. */
interface CrawlerSearchResult {
  id: number;
  url: string;
  title: string;
  description: string;
  snippet: string;
  domain: string;
  crawled_at: string;
  rank: number;
}

interface CrawlerSearchResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: CrawlerSearchResult[];
}

/**
 * Search the local Duvycrawl index via its FTS5 API.
 * Returns results mapped to the shared SearchResultItem shape.
 */
export async function searchCrawler(
  query: string,
  limit: number = 10
): Promise<SearchResultItem[]> {
  if (!query || query.trim() === '') return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const url = `${CRAWLER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[duvycrawl] API returned status ${response.status}`);
      return [];
    }

    const data: CrawlerSearchResponse = await response.json();

    return (data.results || []).map((r) => ({
      title: r.title || r.domain,
      url: r.url,
      // Prefer the FTS5 snippet (has <b> highlights), fall back to description.
      content: r.snippet || r.description || '',
    }));
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.warn('[duvycrawl] Search request timed out');
    } else {
      console.warn('[duvycrawl] Search failed:', error?.message || error);
    }
    return [];
  }
}

/**
 * Ask the crawler to index a list of URLs.
 * Fire-and-forget — errors are logged but not propagated.
 */
export async function requestCrawl(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    await fetch(`${CRAWLER_API}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`[duvycrawl] Requested crawl for ${urls.length} URL(s)`);
  } catch {
    // Silently ignore — the crawler might not be running.
  }
}

/**
 * Search the local Duvycrawl index, returning both results and total count.
 * Used by the search orchestrator for pagination support.
 */
export async function searchCrawlerFull(
  query: string,
  limit: number = 10,
  page: number = 1
): Promise<{ results: SearchResultItem[]; total: number }> {
  if (!query || query.trim() === '') return { results: [], total: 0 };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const url = `${CRAWLER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[duvycrawl] API returned status ${response.status}`);
      return { results: [], total: 0 };
    }

    const data: CrawlerSearchResponse = await response.json();

    const results = (data.results || []).map((r) => ({
      title: r.title || r.domain,
      url: r.url,
      content: r.snippet || r.description || '',
    }));

    return { results, total: data.total || 0 };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.warn('[duvycrawl] Search request timed out');
    } else {
      console.warn('[duvycrawl] Search failed:', error?.message || error);
    }
    return { results: [], total: 0 };
  }
}

