import type { APIRoute } from 'astro';
import { searchAndGetFirstSummary } from '../../lib/wikipedia';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q');
  const lang = url.searchParams.get('lang') || 'es';
  
  if (!q) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const result = await searchAndGetFirstSummary(q, lang);
    
    if (!result) {
      return new Response(JSON.stringify({ found: false }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ found: true, result }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
