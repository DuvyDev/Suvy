import type { APIRoute } from 'astro';

const CRAWLER_API = import.meta.env.CRAWLER_API || process.env.CRAWLER_API || 'http://localhost:8081/api/v1';
const CRAWLER_TIMEOUT_MS = 15000; // 15 seconds timeout for batch ingest

// Handle CORS preflight requests from the extension
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const bodyText = await request.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!body || !Array.isArray(body.pages) || body.pages.length === 0) {
      return new Response(JSON.stringify({ error: 'No pages provided in payload' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const res = await fetch(`${CRAWLER_API}/ingest/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorDetails = '';
      try {
        errorDetails = await res.text();
      } catch (e) {}
      
      return new Response(
        JSON.stringify({ error: `Crawler returned ${res.status}`, details: errorDetails }),
        { 
          status: res.status >= 500 ? 502 : res.status, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    const crawlerResponse = await res.json();

    return new Response(JSON.stringify({ success: true, ...crawlerResponse }), {
      status: res.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Crawler timeout' }), {
        status: 504,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
