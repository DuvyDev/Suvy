import type { SearchResultItem } from './duckduckgo';

const WIKIPEDIA_API_BASE = process.env.WIKIPEDIA_API_BASE || 'https://en.wikipedia.org/w/rest.php/v1';
const WIKIPEDIA_TIMEOUT_MS = parseInt(process.env.WIKIPEDIA_TIMEOUT_MS || '4000', 10);
const WIKIPEDIA_MAX_RETRIES = parseInt(process.env.WIKIPEDIA_MAX_RETRIES || '2', 10);

interface WikipediaSearchPage {
  id: number;
  key: string;
  title: string;
  excerpt?: string;
  description?: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}

interface WikipediaSearchResponse {
  pages: WikipediaSearchPage[];
  total: number;
}

interface WikipediaSummary {
  type: 'standard' | 'disambiguation' | 'no-extract' | 'mainpage' | 'wikidata_preview';
  title: string;
  displaytitle: string;
  pageid: number;
  namespace: { id: number; text: string };
  titles: {
    canonical: string;
    normalized: string;
    display: string;
  };
  extract: string;
  extract_html: string;
  description?: string;
  wikibase_item?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string; revs: string };
    mobile: { page: string; revs: string };
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  timestamp: string;
}

interface WikipediaImage {
  url: string;
  width: number;
  height: number;
}

export interface WikipediaResult extends SearchResultItem {
  pageId: number;
  description?: string;
  thumbnail?: WikipediaImage;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = WIKIPEDIA_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders: Record<string, string> = {
    'User-Agent': 'MySearch/1.0 (https://github.com/anomalyco; contact@opencode.ai)',
    'Accept': 'application/json',
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, mergedOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  parseJson: boolean = true,
  timeoutMs: number = WIKIPEDIA_TIMEOUT_MS
): Promise<{ data?: T; error?: string; status?: number }> {
  let lastError: string = 'Unknown error';
  let lastStatus: number | undefined;

  for (let attempt = 0; attempt <= WIKIPEDIA_MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      lastStatus = response.status;

      if (!response.ok) {
        if (response.status === 429) {
          lastError = 'Rate limited';
          lastStatus = 429;
          const retryAfter = response.headers.get('Retry-After');
          const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempt + 1);
          if (attempt < WIKIPEDIA_MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
            continue;
          }
        } else if (response.status >= 500) {
          lastError = `Server error ${response.status}`;
          if (attempt < WIKIPEDIA_MAX_RETRIES) {
            const waitMs = Math.pow(2, attempt) * 500;
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          }
        } else if (response.status === 404) {
          return { error: 'Not found', status: 404 };
        } else {
          lastError = `HTTP ${response.status}`;
        }
        break;
      }

      if (!parseJson) {
        return { data: undefined as T, status: response.status };
      }

      const data: T = await response.json();
      return { data, status: response.status };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lastError = errorMessage;

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (attempt < WIKIPEDIA_MAX_RETRIES) {
          const waitMs = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        lastError = 'Timeout after retries';
        break;
      }

      if (attempt < WIKIPEDIA_MAX_RETRIES) {
        const waitMs = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      break;
    }
  }

  return { error: lastError, status: lastStatus };
}

export async function searchWikipedia(
  query: string,
  limit: number = 10,
  language: string = 'es'
): Promise<WikipediaResult[]> {
  if (!query || query.trim() === '') return [];

  const languageCode = getLanguageCode(language);
  const url = `${getApiBase(languageCode)}/search/page?q=${encodeURIComponent(query)}&limit=${limit}`;

  const result = await fetchWithRetry<WikipediaSearchResponse>(url);

  if (result.error || !result.data) {
    console.warn(`[wikipedia] Search failed: ${result.error}`);
    return [];
  }

  return result.data.pages.map((page) => mapSearchToResult(page, languageCode));
}

export async function getWikipediaSummary(
  title: string,
  language: string = 'es'
): Promise<WikipediaResult | undefined> {
  if (!title || title.trim() === '') return undefined;

  const targetTitle = title.trim().replace(/ /g, '_');
  const languageCode = getLanguageCode(language);
  const url = `https://${languageCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetTitle)}`;

  const result = await fetchWithRetry<WikipediaSummary>(url);

  if (result.error || !result.data) {
    console.warn(`[wikipedia] Summary failed for "${title}": ${result.error}`);
    return undefined;
  }

  return mapSummaryToResult(result.data, languageCode);
}

export async function searchAndGetFirstSummary(
  query: string,
  language: string = 'es'
): Promise<WikipediaResult | undefined> {
  if (!query || query.trim() === '') return undefined;

  const searchResults = await searchWikipedia(query, 3, language);

  if (searchResults.length === 0) return undefined;

  const firstTitle = searchResults[0].url.split('/').pop()?.replace(/_/g, ' ') || searchResults[0].title;

  return getWikipediaSummary(firstTitle, language);
}

function getApiBase(language: string): string {
  if (WIKIPEDIA_API_BASE.startsWith('http')) {
    return WIKIPEDIA_API_BASE;
  }
  return `https://${language}.wikipedia.org/w/rest.php/v1`;
}

function getLanguageCode(language: string): string {
  const supportedLanguages = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];
  const normalized = language.toLowerCase().split('-')[0];
  return supportedLanguages.includes(normalized) ? normalized : 'es';
}

function mapSearchToResult(page: WikipediaSearchPage, language: string): WikipediaResult {
  const wikiUrl = `https://${language}.wikipedia.org/wiki/${encodeURIComponent(page.key)}`;

  return {
    title: page.title,
    url: wikiUrl,
    content: page.excerpt || page.description || '',
    pageId: page.id,
    description: page.description,
    thumbnail: page.thumbnail
      ? {
          url: page.thumbnail.url,
          width: page.thumbnail.width,
          height: page.thumbnail.height,
        }
      : undefined,
  };
}

function mapSummaryToResult(summary: WikipediaSummary, language: string): WikipediaResult {
  const wikiUrl = summary.content_urls?.mobile?.page || summary.content_urls?.desktop?.page ||
    `https://${language}.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`;

  const cleanTitle = summary.titles?.normalized || summary.titles?.canonical || summary.title;

  return {
    title: cleanTitle,
    url: wikiUrl,
    content: summary.extract || '',
    pageId: summary.pageid,
    description: summary.description,
    thumbnail: summary.thumbnail
      ? {
          url: summary.thumbnail.source,
          width: summary.thumbnail.width,
          height: summary.thumbnail.height,
        }
      : summary.originalimage
      ? {
          url: summary.originalimage.source,
          width: summary.originalimage.width,
          height: summary.originalimage.height,
        }
      : undefined,
  };
}