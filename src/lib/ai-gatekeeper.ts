export type GatekeeperDecision = 'AUTO' | 'BUTTON' | 'HIDE';

export interface GatekeeperResult {
  decision: GatekeeperDecision;
  score: number;
}

export interface GatekeeperInput {
  query: string;
  topResultUrl?: string;
  activeSpecialCards: string[];
}

const URL_REGEX = /https?:\/\/\S+/i;
const OPERATOR_REGEX = /\b(site|filetype|intitle|inurl|intext):/i;
const ONLY_NUMBERS_REGEX = /^[\d\s+\-*/().,%°^]+$/;
const INTERROGATIVE_REGEX = /\b(qu[eé]|c[oó]mo|qui[eé]n|cu[aá]ndo|por\s*qu[eé]|d[oó]nde|cu[aá]l|what|how|who|when|why|where|which)\b/i;
const COMPARATIVE_REGEX = /\b(vs|versus|diferencia\s+entre|comparativa|comparar|mejor\s+que|difference\s+between|compare|better\s+than|or\s+(vs|versus))\b/i;
const SYNTHESIS_REGEX = /\b(resumen|explicaci[oó]n|explicar|historia\s+de|biograf[ií]a|definici[oó]n|significado|tutorial|gu[ií]a|summary|explain|history\s+of|definition|guide|tutorial|meaning\s+of)\b/i;
const TRANSACTIONAL_REGEX = /\b(login|sign\s*in|sign\s*up|register|comprar|buy|descargar|download|precio|price|gratis|free|online|oficial|official|app|cuenta|account|subscribe|suscrib|sesi[oó]n|session|store|tienda|shop|coupon|cup[oó]n)\b/i;
const YMYL_REGEX = /\b(s[ií]ntomas?|dosis|enfermedad|cancer|c[aá]ncer|tumor|medicamento|medicina|receta|tratamiento|cirug[ií]a|invertir|hipoteca|declaraci[oó]n\s+de\s+impuestos|impuestos|taxes|mortgage|symptom|disease|medicine|prescription|investment)\b/i;

export function evaluateGatekeeper(input: GatekeeperInput): GatekeeperResult {
  const { query, topResultUrl, activeSpecialCards } = input;
  let score = 0;
  const q = query.trim();
  const lower = q.toLowerCase();

  if (!q) return { decision: 'HIDE', score };

  if (URL_REGEX.test(q)) score -= 100;
  if (OPERATOR_REGEX.test(lower)) score -= 100;
  if (ONLY_NUMBERS_REGEX.test(q)) score -= 100;

  if (isNavigational(lower, topResultUrl)) score -= 100;
  if (activeSpecialCards.length > 0) score -= 80;
  if (TRANSACTIONAL_REGEX.test(lower)) score -= 60;
  if (isShortNonInformational(lower)) score -= 40;
  if (isYMYL(lower)) score -= 100;

  if (INTERROGATIVE_REGEX.test(lower)) score += 60;
  if (COMPARATIVE_REGEX.test(lower)) score += 70;
  if (q.split(/\s+/).length > 4) score += 30;
  if (SYNTHESIS_REGEX.test(lower)) score += 50;

  const decision: GatekeeperDecision = score > 50 ? 'AUTO' : score > 10 ? 'BUTTON' : 'HIDE';
  return { decision, score };
}

function isShortNonInformational(query: string): boolean {
  const words = query.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 2) return false;
  return !INTERROGATIVE_REGEX.test(query);
}

function isYMYL(query: string): boolean {
  const words = query.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 5) return false;
  return YMYL_REGEX.test(query);
}

function isNavigational(query: string, topResultUrl?: string): boolean {
  if (!topResultUrl) return false;
  const cleanedQuery = cleanForDomainMatch(query);
  if (!cleanedQuery) return false;
  const domain = extractBareDomain(topResultUrl);
  return cleanedQuery === domain;
}

function cleanForDomainMatch(input: string): string {
  return input
    .replace(/\.(com|org|net|io|dev|app|es|mx|ar|co|us|uk|de|fr|it|br|jp|cn|ru|info|biz|tv|me|ai|gg|gov|edu|mil|int|eu|ch|at|be|nl|se|no|dk|fi|pt|pl|cz|hu|ro|gr|tr|ie|nz|au|ca)$/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function extractBareDomain(url: string): string {
  try {
    let hostname = new URL(url).hostname.replace(/^www\./, '');
    const knownCCTlds = ['co.uk', 'com.ar', 'com.br', 'com.mx', 'co.jp', 'com.au', 'org.uk', 'net.uk', 'ac.uk', 'gov.uk'];
    const parts = hostname.split('.');

    let tld: string;
    if (parts.length >= 3 && knownCCTlds.includes(parts.slice(-2).join('.'))) {
      tld = parts.slice(-2).join('.');
    } else {
      tld = parts[parts.length - 1];
    }

    hostname = hostname.replace(new RegExp(`\\.${tld.replace(/\./g, '\\.')}$`), '');
    const remaining = hostname.split('.');
    return remaining[remaining.length - 1];
  } catch {
    return '';
  }
}
