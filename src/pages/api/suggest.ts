import type { APIRoute } from 'astro';

const CRAWLER_API = 'http://localhost:8080/api/v1';
const CRAWLER_TIMEOUT_MS = 2000;

/**
 * Search suggestions endpoint.
 * Returns results in OpenSearch Suggestions format:
 * [query, [suggestion1, suggestion2, ...], [description1, ...], [url1, ...]]
 *
 * Also used by the browser's search engine integration.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return new Response(JSON.stringify([query, []]), {
      headers: { 'Content-Type': 'application/x-suggestions+json' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const apiUrl = `${CRAWLER_API}/search?q=${encodeURIComponent(query)}&limit=8&lang=es`;
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(JSON.stringify([query, []]), {
        headers: { 'Content-Type': 'application/x-suggestions+json' },
      });
    }

    const data = await response.json();
    const results = data.results || [];

    // Build OpenSearch Suggestions response:
    // [query, [titles], [descriptions], [urls]]
    const titles: string[] = [];
    const descriptions: string[] = [];
    const urls: string[] = [];

    const seen = new Set<string>();
    for (const r of results) {
      const title = (r.title || '').trim();
      if (!title || seen.has(title.toLowerCase())) continue;
      seen.add(title.toLowerCase());
      titles.push(title);
      descriptions.push((r.description || '').substring(0, 120));
      urls.push(r.url || '');
    }

    return new Response(JSON.stringify([query, titles, descriptions, urls]), {
      headers: {
        'Content-Type': 'application/x-suggestions+json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new Response(JSON.stringify([query, []]), {
      headers: { 'Content-Type': 'application/x-suggestions+json' },
    });
  }
};
