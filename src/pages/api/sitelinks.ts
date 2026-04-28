import type { APIRoute } from 'astro';
import { searchCrawlerFull } from '../../lib/duvycrawl';

/**
 * GET /api/sitelinks?q=<query>&domain=<domain>&exclude=<url>
 * 
 * Returns up to 4 sitelinks for a given domain, filtered by the search query.
 * This endpoint exists to avoid blocking SSR — sitelinks are non-critical
 * and can be loaded after the main results are painted.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  const domain = (url.searchParams.get('domain') || '').replace(/^www\./, '');
  const exclude = url.searchParams.get('exclude') || '';

  if (!query || !domain) {
    return new Response(JSON.stringify({ sitelinks: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  try {
    const { results } = await searchCrawlerFull(query, 6, 1, { domain });
    const sitelinks = results
      .filter((r) => r.url !== exclude)
      .slice(0, 4)
      .map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }));

    return new Response(JSON.stringify({ sitelinks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new Response(JSON.stringify({ sitelinks: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
