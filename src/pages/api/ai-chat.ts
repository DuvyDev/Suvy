import type { APIRoute } from 'astro';
import {
  isAiSummaryEnabled,
  streamLlmChat,
} from '../../lib/ai-summary';

export const POST: APIRoute = async ({ request }) => {
  if (!isAiSummaryEnabled()) {
    return new Response(JSON.stringify({ error: 'AI disabled' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages?: { role: string; content: string }[]; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, lang = 'en' } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stream = await streamLlmChat(messages, lang);

    const encoder = new TextEncoder();
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
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
