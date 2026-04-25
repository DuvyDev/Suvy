import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = 'data';
const CACHE_FILE = join(CACHE_DIR, 'nominatim-cache.json');

const TTL_MS = parseInt(process.env.NOMINATIM_CACHE_TTL_DAYS || '30', 10) * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;
const TIMEOUT_MS = parseInt(process.env.NOMINATIM_TIMEOUT_MS || '4000', 10);

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'MySearch/1.0 (https://github.com/anomalyco)';

export interface NominatimResult {
  name: string;
  type: string;
  lat: number;
  lon: number;
  osmLink: string;
}

interface CacheEntry {
  result: NominatimResult | null;
  timestamp: number;
}

type CacheStore = Record<string, CacheEntry>;

let memCache: CacheStore | null = null;
let lastRequestTime = 0;

function ensureDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCache(): CacheStore {
  if (memCache) return memCache;
  try {
    if (existsSync(CACHE_FILE)) {
      const raw = readFileSync(CACHE_FILE, 'utf-8');
      memCache = JSON.parse(raw);
      return memCache!;
    }
  } catch {
    // Corrupted file — start fresh.
  }
  memCache = {};
  return memCache;
}

function persistCache(): void {
  ensureDir();
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(memCache), 'utf-8');
  } catch {
    // Non-critical — next write will try again.
  }
}

function prune(cache: CacheStore): void {
  const cutoff = Date.now() - TTL_MS;
  for (const key of Object.keys(cache)) {
    if (cache[key].timestamp < cutoff) {
      delete cache[key];
    }
  }

  const entries = Object.entries(cache);
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.length - MAX_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]];
    }
  }
}

function getCacheKey(query: string, lang: string): string {
  return `${query.trim().toLowerCase()}::${lang}`;
}

async function enforceRateLimit(): Promise<void> {
  const minInterval = 1100; // 1.1s to stay safely under 1 req/s
  const elapsed = Date.now() - lastRequestTime;
  if (elapsed < minInterval) {
    await new Promise((resolve) => setTimeout(resolve, minInterval - elapsed));
  }
}

function buildOsmLink(lat: number, lon: number, zoom: number = 14): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

interface NominatimResponse {
  place_id: number;
  display_name: string;
  type: string;
  class: string;
  lat: string;
  lon: string;
}

async function fetchNominatim(query: string, lang: string): Promise<NominatimResult | null> {
  await enforceRateLimit();
  lastRequestTime = Date.now();

  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=${lang}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[nominatim] API returned status ${response.status}`);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) return null;

    const place = data[0];
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (isNaN(lat) || isNaN(lon)) return null;

    const nameParts = place.display_name.split(',');
    const name = nameParts[0].trim();

    return {
      name,
      type: place.type,
      lat,
      lon,
      osmLink: buildOsmLink(lat, lon),
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('[nominatim] Request timed out');
    } else {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('[nominatim] Request failed:', msg);
    }
    return null;
  }
}

export async function geocode(query: string, lang: string = 'es'): Promise<NominatimResult | null> {
  if (!query || query.trim() === '') return null;

  const cache = loadCache();
  const key = getCacheKey(query, lang);

  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    return cached.result;
  }

  const result = await fetchNominatim(query, lang);

  cache[key] = { result, timestamp: Date.now() };
  prune(cache);
  persistCache();

  return result;
}
