import { getCachedSummary, setCachedSummary } from './ai-summary-cache';

const BASE_URL = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.AI_API_KEY || '';
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const TIMEOUT_MS = 30000;
const MAX_RESULTS = 5;

export interface SearchResultContext {
  title: string;
  content: string;
  url: string;
}

export interface AiSummaryResult {
  summary: string;
  sources: { title: string; url: string }[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  es: `Eres el asistente de Inteligencia Artificial integrado en el buscador web "Suvy".
Tu objetivo es proveer respuestas, resúmenes y ayuda basada en los resultados de búsqueda web proporcionados, y mantener una conversación útil con el usuario.

Reglas:
1. Responde SIEMPRE en español, de forma directa, útil y sin introducciones innecesarias (no digas "Hola", ni "Aquí tienes el resumen", ve directo al grano).
2. Para la primera consulta: básate fuertemente en los resultados de búsqueda proporcionados. Cita las fuentes usando el formato [1], [2], etc.
3. Para preguntas de seguimiento en el chat: responde de forma conversacional. Puedes utilizar tanto el contexto de los resultados como tu conocimiento general para ayudar al usuario (por ejemplo, si pide un ejemplo de código en otro lenguaje, proporciónalo).
4. Formateo: Utiliza Markdown ampliamente. Usa listas, negritas para resaltar palabras clave y bloques de código cuando sea necesario.
5. Claridad y concisión: Mantén el resumen inicial conciso. En el chat, sé tan detallado como la pregunta del usuario lo requiera, pero mantén un tono ágil.
6. Si los resultados de búsqueda iniciales son irrelevantes y la consulta original es imposible de responder, indícalo de manera amable.`,

  en: `You are the Artificial Intelligence assistant integrated into the "Suvy" web search engine.
Your goal is to provide answers, summaries, and help based on the provided web search results, and maintain a helpful conversation with the user.

Rules:
1. ALWAYS respond in English, in a direct, helpful manner without unnecessary introductions (do not say "Hello", or "Here is the summary", get straight to the point).
2. For the initial query: rely heavily on the provided search results. Cite sources using the format [1], [2], etc.
3. For follow-up questions in the chat: respond conversationally. You may use both the context of the results and your general knowledge to assist the user (e.g., if they ask for a code example in another language, provide it).
4. Formatting: Use Markdown extensively. Use lists, bold text to highlight keywords, and code blocks where appropriate.
5. Clarity and conciseness: Keep the initial summary concise. In the chat, be as detailed as the user's question requires, but maintain an agile tone.
6. If the initial search results are irrelevant and the original query is impossible to answer, state this politely.`,
};

function getSystemPrompt(lang: string): string {
  return SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS['en'];
}

function buildUserPrompt(query: string, results: SearchResultContext[]): string {
  const formatted = results
    .slice(0, MAX_RESULTS)
    .map((r, i) => `[${i + 1}] ${r.title}\n    ${r.url}\n    ${r.content.replace(/<[^>]*>/g, '').trim()}`)
    .join('\n\n');

  return `Query: ${query}\n\nSearch results:\n\n${formatted}`;
}

function isOllama(url: string): boolean {
  return url.includes('localhost:11434') || url.includes('127.0.0.1:11434');
}

export function checkCached(query: string, lang: string): AiSummaryResult | null {
  const cached = getCachedSummary(query, lang);
  if (!cached) return null;
  return { summary: cached.summary, sources: cached.sources };
}

export async function streamLlmSummary(
  query: string,
  lang: string,
  results: SearchResultContext[]
): Promise<{ stream: ReadableStream<Uint8Array>; sources: { title: string; url: string }[] }> {
  const sources = results.slice(0, MAX_RESULTS).map((r) => ({ title: r.title, url: r.url }));
  const systemPrompt = getSystemPrompt(lang);
  const userPrompt = buildUserPrompt(query, results);

  if (isOllama(BASE_URL)) {
    const stream = await callOllamaStreaming(systemPrompt, userPrompt);
    return { stream, sources };
  }

  const stream = await callOpenAIStreaming(systemPrompt, userPrompt);
  return { stream, sources };
}

export async function streamLlmChat(
  messages: { role: string; content: string }[],
  lang: string
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = getSystemPrompt(lang);
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  if (isOllama(BASE_URL)) {
    return await callOllamaChatStreaming(fullMessages);
  }

  return await callOpenAIChatStreaming(fullMessages);
}

async function callOpenAIChatStreaming(
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages,
      temperature: 0.5,
      max_tokens: 800,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`LLM API error ${response.status}: ${text.slice(0, 200)}`);
  }

  if (!response.body) {
    throw new Error('LLM API returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
              );
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

async function callOllamaChatStreaming(
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(`${BASE_URL.replace(/\/v1$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages,
      options: { temperature: 0.5 },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Ollama error ${response.status}: ${text.slice(0, 200)}`);
  }

  if (!response.body) {
    throw new Error('Ollama returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const json = JSON.parse(trimmed);
            const content = json.message?.content;
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: content })}\n\n`)
              );
            }
            if (json.done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

async function callOpenAIStreaming(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`LLM API error ${response.status}: ${text.slice(0, 200)}`);
  }

  if (!response.body) {
    throw new Error('LLM API returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const transformed = new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
              );
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return transformed;
}

async function callOllamaStreaming(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(`${BASE_URL.replace(/\/v1$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      options: { temperature: 0.3 },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Ollama error ${response.status}: ${text.slice(0, 200)}`);
  }

  if (!response.body) {
    throw new Error('Ollama returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const transformed = new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const json = JSON.parse(trimmed);
            const content = json.message?.content;
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ text: content })}\n\n`)
              );
            }
            if (json.done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return transformed;
}

export function collectStreamText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    function processBuffer(): void {
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          if (json.text) fullText += json.text;
        } catch {
          // Skip
        }
      }
    }

    function read(): void {
      reader.read().then(({ done, value }) => {
        if (done) {
          processBuffer();
          resolve(fullText);
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        processBuffer();
        read();
      }).catch(reject);
    }

    read();
  });
}

export function saveSummary(query: string, lang: string, summary: string, sources: { title: string; url: string }[]): void {
  setCachedSummary(query, lang, summary, sources);
}

export function isAiSummaryEnabled(): boolean {
  return process.env.AI_SUMMARY_ENABLED !== 'false';
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
