import type { APIRoute } from 'astro';
import { geocode } from '../../lib/nominatim';
import { isGeoQuery } from '../../lib/geodetect';
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
    let result = null;

    if (isGeoQuery(q)) {
      result = await geocode(q, lang);
    }
    
    // Fallback: check if Wikipedia has coordinates for this query
    if (!result) {
      const wikiRes = await searchAndGetFirstSummary(q, lang);
      if (wikiRes && wikiRes.coordinates) {
        result = {
          name: wikiRes.title || q,
          type: wikiRes.description || 'place',
          lat: wikiRes.coordinates.lat,
          lon: wikiRes.coordinates.lon,
          osmLink: `https://www.openstreetmap.org/?mlat=${wikiRes.coordinates.lat}&mlon=${wikiRes.coordinates.lon}#map=14/${wikiRes.coordinates.lat}/${wikiRes.coordinates.lon}`
        };
      }
    }
    
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
