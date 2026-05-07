import type { APIRoute } from 'astro';
import { getRelatedSearches } from '../../lib/cache-db';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return new Response(JSON.stringify({ related: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const related = getRelatedSearches(query, 8);
    return new Response(JSON.stringify({ related }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ related: [], error: String(error) }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
};
