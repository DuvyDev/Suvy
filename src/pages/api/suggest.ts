import type { APIRoute } from 'astro';
import { getSuggestions } from '../../lib/cache-db';

/**
 * Search suggestions endpoint.
 * Returns results in OpenSearch Suggestions format:
 * [query, [suggestion1, suggestion2, ...], [description1, ...], [url1, ...]]
 *
 * Uses ultra-fast local SQLite B-Tree index for instant prefix matching.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (query.length < 1) {
    return new Response(JSON.stringify([query, []]), {
      headers: { 'Content-Type': 'application/x-suggestions+json' },
    });
  }

  try {
    // Fetch suggestions directly from local SQLite
    const titles = getSuggestions(query, 8);

    return new Response(JSON.stringify([query, titles, [], []]), {
      headers: {
        'Content-Type': 'application/x-suggestions+json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch {
    return new Response(JSON.stringify([query, []]), {
      headers: { 'Content-Type': 'application/x-suggestions+json' },
    });
  }
};
