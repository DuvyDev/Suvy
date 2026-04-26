import type { APIRoute } from 'astro';
import {
  isAiSummaryEnabled,
  checkCached,
  streamLlmSummary,
  saveSummary,
  type SearchResultContext,
} from '../../lib/ai-summary';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export const POST: APIRoute = async ({ request }) => {
  if (!isAiSummaryEnabled()) {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { q?: string; lang?: string; results?: SearchResultContext[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { q, lang = 'en', results } = body;

  if (!q || !results || !Array.isArray(results) || results.length === 0) {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const cached = checkCached(q, lang);
    if (cached) {
      return new Response(JSON.stringify({ found: true, summary: cached.summary, sources: cached.sources }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const { stream, sources } = await streamLlmSummary(q, lang, results);

    const encoder = new TextEncoder();
    let fullText = '';
    let buffer = '';

    function processSseChunk(chunk: string): string[] {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      const outputs: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(trimmed.slice(6));
          if (json.text) {
            fullText += json.text;
            outputs.push(`data: ${JSON.stringify({ text: json.text })}\n\n`);
          }
        } catch {
          // Skip malformed
        }
      }
      return outputs;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`));

        function pump(): void {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (buffer.trim()) {
                const remaining = processSseChunk('\n');
                for (const out of remaining) {
                  controller.enqueue(encoder.encode(out));
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              try {
                saveSummary(q, lang, fullText, sources);
              } catch {
                // Cache write failure is non-critical
              }
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const outputs = processSseChunk(chunk);
            for (const out of outputs) {
              controller.enqueue(encoder.encode(out));
            }
            pump();
          }).catch(() => {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          });
        }
        pump();
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
