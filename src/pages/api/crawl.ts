import type { APIRoute } from 'astro';

const CRAWLER_API = process.env.CRAWLER_API || 'http://localhost:8080/api/v1';
const CRAWLER_TIMEOUT_MS = 8000;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const urls: string[] = body?.urls || [];
    const force: boolean = body?.force === true;

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: 'No URLs provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

    const res = await fetch(`${CRAWLER_API}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, force }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Crawler returned ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const crawlerResponse = await res.json();

    return new Response(JSON.stringify({ success: true, ...crawlerResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Crawler timeout' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};