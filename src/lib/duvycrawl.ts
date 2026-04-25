import type { SearchResultItem } from './duckduckgo';

/**
 * Base URL for the Duvycrawl API.
 * Configurable via the CRAWLER_API environment variable.
 */
const CRAWLER_API = process.env.CRAWLER_API || 'http://localhost:8080/api/v1';

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
  language: string;
  region: string;
  crawled_at: string;
  updated_at?: string;
  published_at?: string;
  rank: number;
  schema_type?: string;
  schema_image?: string;
  schema_author?: string;
  schema_keywords?: string;
}

/** Raw image search result from the Duvycrawl API. */
interface CrawlerImageResult {
  id: number;
  url: string;
  page_url: string;
  domain: string;
  alt_text: string;
  title: string;
  context: string;
  width: number;
  height: number;
  rank: number;
}

interface CrawlerImageResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: CrawlerImageResult[];
}

interface CrawlerSearchResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: CrawlerSearchResult[];
}

/** Extra metadata returned alongside search results. */
export interface CrawlerSearchMeta {
  domain: string;
  language: string;
  region: string;
  crawledAt: string;
  updatedAt?: string;
  publishedAt?: string;
  schemaType?: string;
  schemaImage?: string;
  schemaAuthor?: string;
  schemaKeywords?: string;
}

/** Filters supported by the crawler search endpoint. */
export interface CrawlerFilters {
  domain?: string;
  lang?: string;
  after?: string;   // ISO date, e.g. 2024-01-01
  before?: string;  // ISO date, e.g. 2024-12-31
  region?: string;
}

/** Extended result shape that includes crawler metadata. */
export interface CrawlerSearchResultItem extends SearchResultItem {
  meta: CrawlerSearchMeta;
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

    const url = `${CRAWLER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}&lang=es`;
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
 * @param force If true, forces re-indexing even if recently crawled.
 */
export async function requestCrawl(urls: string[], force: boolean = false): Promise<void> {
  if (urls.length === 0) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    await fetch(`${CRAWLER_API}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, force }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`[duvycrawl] Requested crawl for ${urls.length} URL(s) (force=${force})`);
  } catch {
    // Silently ignore — the crawler might not be running.
  }
}

/**
 * Build query-string parameters for crawler search including optional filters.
 */
function buildSearchUrl(
  query: string,
  limit: number,
  page: number,
  filters: CrawlerFilters = {}
): string {
  const params = new URLSearchParams();
  params.set('q', query);
  params.set('limit', String(limit));
  params.set('page', String(page));

  if (filters.domain) params.set('domain', filters.domain);
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.after) params.set('after', filters.after);
  if (filters.before) params.set('before', filters.before);
  if (filters.region) params.set('region', filters.region);

  return `${CRAWLER_API}/search?${params.toString()}`;
}

/**
 * Search the local Duvycrawl index, returning both results and total count.
 * Supports optional filters (domain, date range, language, region).
 */
export async function searchCrawlerFull(
  query: string,
  limit: number = 10,
  page: number = 1,
  filters: CrawlerFilters = {}
): Promise<{ results: CrawlerSearchResultItem[]; total: number }> {
  if (!query || query.trim() === '') return { results: [], total: 0 };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const url = buildSearchUrl(query, limit, page, filters);
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
      meta: {
        domain: r.domain,
        language: r.language,
        region: r.region,
        crawledAt: r.crawled_at,
        updatedAt: r.updated_at,
        publishedAt: r.published_at,
        schemaType: r.schema_type,
        schemaImage: r.schema_image,
        schemaAuthor: r.schema_author,
        schemaKeywords: r.schema_keywords,
      },
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

/** Image search result exposed to the frontend. */
export interface ImageResult {
  url: string;
  pageUrl: string;
  domain: string;
  alt: string;
  title: string;
  context: string;
  width: number;
  height: number;
}

/**
 * Search for images in the Duvycrawl image index.
 */
export async function searchCrawlerImages(
  query: string,
  limit: number = 20,
  page: number = 1
): Promise<{ results: ImageResult[]; total: number }> {
  if (!query || query.trim() === '') return { results: [], total: 0 };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const url = `${CRAWLER_API}/images/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) return { results: [], total: 0 };

    const data: CrawlerImageResponse = await response.json();

    const results = (data.results || []).map((r) => ({
      url: r.url,
      pageUrl: r.page_url,
      domain: r.domain,
      alt: r.alt_text || r.title || '',
      title: r.title || r.alt_text || '',
      context: r.context || '',
      width: r.width,
      height: r.height,
    }));

    return { results, total: data.total || 0 };
  } catch {
    return { results: [], total: 0 };
  }
}