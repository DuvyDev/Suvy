const GEO_PATTERNS: RegExp[] = [
  /\bmapa\s+de\b/i,
  /\bmap\s+of\b/i,
  /\bdónde\s+está\b/i,
  /\bdonde\s+está\b/i,
  /\bwhere\s+is\b/i,
  /\bubicación\s+de\b/i,
  /\bubicacion\s+de\b/i,
  /\blocation\s+of\b/i,
  /\bcómo\s+llegar\b/i,
  /\bcomo\s+llegar\b/i,
  /\bdirections\s+to\b/i,
  /\bnear\s+me\b/i,
  /\bcerca\s+de\s+mí\b/i,
  /\bcerca\s+de\s+mi\b/i,
  /\bmaps?\s+de\b/i,
  /\bmaps?\s+of\b/i,
  /\bcoordenadas\s+de\b/i,
  /\bcoordinates\s+of\b/i,
];

const ADDRESS_PATTERNS: RegExp[] = [
  /\d+\s+(calle|avenida|plaza|paseo|camino|carretera|bulevar|paseo)\b/i,
  /\d+\s+(street|avenue|plaza|boulevard|blvd|ave|road|rd|drive|dr|lane|ln)\b/i,
];

export function isGeoQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;

  for (const pattern of GEO_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  for (const pattern of ADDRESS_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}
