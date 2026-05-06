export type Category = 'length' | 'time' | 'temperature' | 'mass' | 'volume' | 'area' | 'speed' | 'digital';

export interface UnitDef {
  short: string;
  label: { en: string; es: string };
  aliases: string[];
}

export interface CategoryDef {
  key: Category;
  label: { en: string; es: string };
  units: UnitDef[];
  factors: Record<string, number>;
}

export interface ConversionResult {
  inputValue: number;
  inputUnit: string;
  inputUnitFull: string;
  outputValue: number;
  outputUnit: string;
  outputUnitFull: string;
  formula: string;
  category: Category;
}

export interface ConversionQuery {
  mode: 'result' | 'interactive';
  category?: Category;
  fromUnit?: string;
  toUnit?: string;
  inputValue?: number;
  result?: ConversionResult;
}

export interface ClientCategoryDef {
  key: Category;
  label: { en: string; es: string };
  units: { short: string; label: { en: string; es: string }; factor: number }[];
  isTemperature: boolean;
}

export const UNIT_CATEGORIES: CategoryDef[] = [
  {
    key: 'length',
    label: { en: 'Length', es: 'Longitud' },
    units: [
      { short: 'km', label: { en: 'kilometers', es: 'kilómetros' }, aliases: ['km', 'kms', 'kilometro', 'kilómetro', 'kilometros', 'kilómetros', 'kilometer', 'kilometers'] },
      { short: 'm', label: { en: 'meters', es: 'metros' }, aliases: ['m', 'metro', 'metros', 'meter', 'meters'] },
  { short: 'dm', label: { en: 'decimeters', es: 'decímetros' }, aliases: ['dm', 'decimetro', 'decímetro', 'decimetros', 'decímetros', 'decimeter', 'decimeters'] },
  { short: 'cm', label: { en: 'centimeters', es: 'centímetros' }, aliases: ['cm', 'centimetro', 'centímetro', 'centimetros', 'centímetros', 'centimeter', 'centimeters'] },
  { short: 'mm', label: { en: 'millimeters', es: 'milímetros' }, aliases: ['mm', 'milimetro', 'milímetro', 'milimetros', 'milímetros', 'millimeter', 'millimeters'] },
  { short: 'μm', label: { en: 'micrometers', es: 'micrómetros' }, aliases: ['μm', 'um', 'micrometro', 'micrómetro', 'micrometros', 'micrómetros', 'micrometer', 'micrometers', 'micra', 'micras', 'micron', 'microns', 'micrón'] },
      { short: 'nm', label: { en: 'nanometers', es: 'nanómetros' }, aliases: ['nm', 'nanometro', 'nanómetro', 'nanometros', 'nanómetros', 'nanometer', 'nanometers'] },
      { short: 'mi', label: { en: 'miles', es: 'millas' }, aliases: ['mi', 'mile', 'miles', 'milla', 'millas'] },
      { short: 'yd', label: { en: 'yards', es: 'yardas' }, aliases: ['yd', 'yds', 'yard', 'yards', 'yarda', 'yardas'] },
      { short: 'ft', label: { en: 'feet', es: 'pies' }, aliases: ['ft', 'feet', 'foot', 'pie', 'pies'] },
      { short: 'in', label: { en: 'inches', es: 'pulgadas' }, aliases: ['in', 'inch', 'inches', 'pulgada', 'pulgadas'] },
    ],
    factors: { km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, μm: 0.000001, nm: 1e-9, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  },
  {
    key: 'time',
    label: { en: 'Time', es: 'Tiempo' },
    units: [
      { short: 'year', label: { en: 'years', es: 'años' }, aliases: ['year', 'years', 'yr', 'yrs', 'año', 'años'] },
      { short: 'month', label: { en: 'months', es: 'meses' }, aliases: ['month', 'months', 'mo', 'mes', 'meses'] },
      { short: 'week', label: { en: 'weeks', es: 'semanas' }, aliases: ['week', 'weeks', 'wk', 'wks', 'semana', 'semanas'] },
      { short: 'day', label: { en: 'days', es: 'días' }, aliases: ['day', 'days', 'd', 'dia', 'día', 'dias', 'días'] },
      { short: 'hour', label: { en: 'hours', es: 'horas' }, aliases: ['hour', 'hours', 'hr', 'hrs', 'hora', 'horas', 'h'] },
      { short: 'min', label: { en: 'minutes', es: 'minutos' }, aliases: ['min', 'mins', 'minute', 'minutes', 'minuto', 'minutos'] },
      { short: 'sec', label: { en: 'seconds', es: 'segundos' }, aliases: ['sec', 'secs', 'second', 'seconds', 's', 'segundo', 'segundos', 'seg'] },
      { short: 'ms', label: { en: 'milliseconds', es: 'milisegundos' }, aliases: ['ms', 'msec', 'millisecond', 'milliseconds', 'milisegundo', 'milisegundos'] },
      { short: 'μs', label: { en: 'microseconds', es: 'microsegundos' }, aliases: ['μs', 'us', 'microsecond', 'microseconds', 'microsegundo', 'microsegundos'] },
      { short: 'ns', label: { en: 'nanoseconds', es: 'nanosegundos' }, aliases: ['ns', 'nanosecond', 'nanoseconds', 'nanosegundo', 'nanosegundos'] },
    ],
    factors: { year: 31536000, month: 2628000, week: 604800, day: 86400, hour: 3600, min: 60, sec: 1, ms: 0.001, μs: 0.000001, ns: 1e-9 },
  },
  {
    key: 'temperature',
    label: { en: 'Temperature', es: 'Temperatura' },
    units: [
      { short: 'C', label: { en: 'celsius', es: 'celsius' }, aliases: ['c', 'celsius', 'centigrado', 'centígrado', 'centigrados', 'centígrados', 'celcius'] },
      { short: 'F', label: { en: 'fahrenheit', es: 'fahrenheit' }, aliases: ['f', 'fahrenheit', 'farenheit', 'farenheit'] },
      { short: 'K', label: { en: 'kelvin', es: 'kelvin' }, aliases: ['k', 'kelvin'] },
    ],
    factors: { C: 1, F: 1, K: 1 },
  },
  {
    key: 'mass',
    label: { en: 'Mass', es: 'Masa' },
    units: [
      { short: 'kg', label: { en: 'kilograms', es: 'kilogramos' }, aliases: ['kg', 'kgs', 'kilogramo', 'kilogramos', 'kilogram', 'kilograms', 'kilo', 'kilos'] },
  { short: 'g', label: { en: 'grams', es: 'gramos' }, aliases: ['g', 'gs', 'gramo', 'gramos', 'gram', 'grams'] },
  { short: 'dg', label: { en: 'decigrams', es: 'decigramos' }, aliases: ['dg', 'decigramo', 'decigramos', 'decigram', 'decigrams'] },
  { short: 'mg', label: { en: 'milligrams', es: 'miligramos' }, aliases: ['mg', 'mgs', 'miligramo', 'miligramos', 'milligram', 'milligrams'] },
      { short: 'lb', label: { en: 'pounds', es: 'libras' }, aliases: ['lb', 'lbs', 'pound', 'pounds', 'libra', 'libras'] },
      { short: 'oz', label: { en: 'ounces', es: 'onzas' }, aliases: ['oz', 'ounce', 'ounces', 'onza', 'onzas'] },
      { short: 'ton', label: { en: 'metric tons', es: 'toneladas' }, aliases: ['ton', 'tons', 'tonne', 'tonnes', 'tonelada', 'toneladas'] },
    ],
    factors: { kg: 1000, g: 1, dg: 0.1, mg: 0.001, lb: 453.592, oz: 28.3495, ton: 1000000 },
  },
  {
    key: 'volume',
    label: { en: 'Volume', es: 'Volumen' },
    units: [
  { short: 'L', label: { en: 'liters', es: 'litros' }, aliases: ['l', 'lt', 'liter', 'liters', 'litre', 'litres', 'litro', 'litros'] },
  { short: 'dL', label: { en: 'deciliters', es: 'decilitros' }, aliases: ['dl', 'decilitro', 'decilitros', 'deciliter', 'deciliters', 'decilitre', 'decilitres'] },
  { short: 'mL', label: { en: 'milliliters', es: 'mililitros' }, aliases: ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres', 'mililitro', 'mililitros'] },
      { short: 'gal', label: { en: 'gallons', es: 'galones' }, aliases: ['gal', 'gals', 'gallon', 'gallons', 'galon', 'galón', 'galones'] },
      { short: 'qt', label: { en: 'quarts', es: 'cuartos' }, aliases: ['qt', 'qts', 'quart', 'quarts'] },
      { short: 'pt', label: { en: 'pints', es: 'pintas' }, aliases: ['pt', 'pts', 'pint', 'pints', 'pinta', 'pintas'] },
      { short: 'cup', label: { en: 'cups', es: 'tazas' }, aliases: ['cup', 'cups', 'taza', 'tazas'] },
      { short: 'floz', label: { en: 'fluid ounces', es: 'onzas líquidas' }, aliases: ['floz', 'fl oz', 'fluid ounce', 'fluid ounces'] },
    ],
    factors: { L: 1, dL: 0.1, mL: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588, floz: 0.0295735 },
  },
  {
    key: 'area',
    label: { en: 'Area', es: 'Área' },
    units: [
      { short: 'km2', label: { en: 'sq kilometers', es: 'km²' }, aliases: ['km2', 'km²', 'sqkm', 'sq km', 'square km', 'square kilometer', 'square kilometers', 'kilometro cuadrado', 'kilómetro cuadrado', 'kilometros cuadrados', 'kilómetros cuadrados'] },
  { short: 'm2', label: { en: 'sq meters', es: 'm²' }, aliases: ['m2', 'm²', 'sqm', 'sq m', 'square meter', 'square meters', 'metro cuadrado', 'metros cuadrados'] },
  { short: 'dm2', label: { en: 'sq decimeters', es: 'dm²' }, aliases: ['dm2', 'dm²', 'sqdm', 'sq dm', 'square decimeter', 'square decimeters', 'decimetro cuadrado', 'decímetro cuadrado', 'decimetros cuadrados', 'decímetros cuadrados'] },
  { short: 'cm2', label: { en: 'sq centimeters', es: 'cm²' }, aliases: ['cm2', 'cm²', 'sqcm', 'sq cm', 'square centimeter', 'square centimeters', 'centimetro cuadrado', 'centímetro cuadrado', 'centimetros cuadrados', 'centímetros cuadrados'] },
      { short: 'ha', label: { en: 'hectares', es: 'hectáreas' }, aliases: ['ha', 'hectare', 'hectares', 'hectarea', 'hectárea', 'hectareas', 'hectáreas'] },
      { short: 'acre', label: { en: 'acres', es: 'acres' }, aliases: ['acre', 'acres'] },
      { short: 'mi2', label: { en: 'sq miles', es: 'millas²' }, aliases: ['mi2', 'mi²', 'sqmi', 'sq mi', 'square mile', 'square miles', 'milla cuadrada', 'millas cuadradas'] },
      { short: 'ft2', label: { en: 'sq feet', es: 'pies²' }, aliases: ['ft2', 'ft²', 'sqft', 'sq ft', 'square foot', 'square feet', 'pie cuadrado', 'pies cuadrados'] },
    ],
    factors: { km2: 1000000, m2: 1, dm2: 0.01, cm2: 0.0001, ha: 10000, acre: 4046.86, mi2: 2589988.11, ft2: 0.092903 },
  },
  {
    key: 'speed',
    label: { en: 'Speed', es: 'Velocidad' },
    units: [
      { short: 'kmh', label: { en: 'km/h', es: 'km/h' }, aliases: ['kmh', 'km/h', 'kph', 'kmph', 'kilometers per hour', 'kilómetros por hora'] },
      { short: 'mph', label: { en: 'mph', es: 'mph' }, aliases: ['mph', 'mi/h', 'miph', 'miles per hour', 'millas por hora'] },
      { short: 'ms', label: { en: 'm/s', es: 'm/s' }, aliases: ['m/s', 'meters per second', 'metros por segundo'] },
      { short: 'knot', label: { en: 'knots', es: 'nudos' }, aliases: ['knot', 'knots', 'kn', 'kt', 'nudo', 'nudos'] },
      { short: 'fts', label: { en: 'ft/s', es: 'ft/s' }, aliases: ['ft/s', 'fts', 'fps', 'feet per second', 'pies por segundo'] },
    ],
    factors: { kmh: 1, mph: 1.60934, ms: 3.6, knot: 1.852, fts: 1.09728 },
  },
  {
    key: 'digital',
    label: { en: 'Digital', es: 'Digital' },
    units: [
      { short: 'bit', label: { en: 'bits', es: 'bits' }, aliases: ['bit', 'bits'] },
      { short: 'B', label: { en: 'bytes', es: 'bytes' }, aliases: ['b', 'byte', 'bytes'] },
      { short: 'KB', label: { en: 'kilobytes', es: 'kilobytes' }, aliases: ['kb', 'k', 'kilobyte', 'kilobytes'] },
      { short: 'MB', label: { en: 'megabytes', es: 'megabytes' }, aliases: ['mb', 'm', 'megabyte', 'megabytes'] },
      { short: 'GB', label: { en: 'gigabytes', es: 'gigabytes' }, aliases: ['gb', 'g', 'gigabyte', 'gigabytes'] },
      { short: 'TB', label: { en: 'terabytes', es: 'terabytes' }, aliases: ['tb', 't', 'terabyte', 'terabytes'] },
      { short: 'PB', label: { en: 'petabytes', es: 'petabytes' }, aliases: ['pb', 'p', 'petabyte', 'petabytes'] },
    ],
    factors: { bit: 0.125, B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 },
  },
];

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Build alias → (category, unit) map once
// Both original and stripped-diacritics versions are stored
function buildAliasMap(): Map<string, { category: Category; unit: UnitDef }> {
  const map = new Map<string, { category: Category; unit: UnitDef }>();
  for (const cat of UNIT_CATEGORIES) {
    for (const unit of cat.units) {
      for (const alias of unit.aliases) {
        if (!map.has(alias)) map.set(alias, { category: cat.key, unit });
        const stripped = stripDiacritics(alias);
        if (stripped !== alias && !map.has(stripped)) map.set(stripped, { category: cat.key, unit });
      }
    }
  }
  return map;
}

const aliasMap = buildAliasMap();

function convertValue(value: number, fromUnit: string, toUnit: string, category: Category, factors: Record<string, number>): number {
  if (category === 'temperature') {
    let kelvin: number;
    if (fromUnit === 'C') kelvin = value + 273.15;
    else if (fromUnit === 'F') kelvin = (value - 32) * 5 / 9 + 273.15;
    else kelvin = value;
    if (toUnit === 'C') return kelvin - 273.15;
    if (toUnit === 'F') return (kelvin - 273.15) * 9 / 5 + 32;
    return kelvin;
  }
  return value * factors[fromUnit] / factors[toUnit];
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const r = Math.round(n * 1e10) / 1e10;
  if (Number.isInteger(r)) return r.toString();
  return parseFloat(r.toPrecision(12)).toString();
}

interface TokenMatch {
  unit: UnitDef;
  category: Category;
  index: number;
}

// Detect any conversion intent in a free-text query
// Tokens are checked against the alias map. 2+ units of the same category triggers the converter.
// "convert" keyword + at least 1 unit also triggers it.
// A leading number sets the input value.
export function detectConversionQuery(query: string, lang: string = 'en'): ConversionQuery | null {
  const lower = query.toLowerCase().trim();
  const tokens = lower.split(/[\s,;:.!?¡¿()\[\]{}"']+/).filter(t => t.length > 0);
  if (tokens.length === 0) return null;

  const convertKeywords = /^(convert|convertir|convierte|conversion|conversion|conversor|converter)$/;

  let inputValue: number | undefined;
  const matches: TokenMatch[] = [];
  let hasKeyword = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const num = parseFloat(token.replace(',', '.'));
    if (!isNaN(num) && token !== '') {
      if (inputValue === undefined) inputValue = num;
      continue;
    }
    if (convertKeywords.test(stripDiacritics(token))) {
      hasKeyword = true;
      continue;
    }
    const m = aliasMap.get(stripDiacritics(token));
    if (m) {
      matches.push({ unit: m.unit, category: m.category, index: i });
    }
  }

  // Group by category
  const byCategory = new Map<Category, TokenMatch[]>();
  for (const m of matches) {
    if (!byCategory.has(m.category)) byCategory.set(m.category, []);
    byCategory.get(m.category)!.push(m);
  }

  // Pick first category with 2+ distinct units
  let bestCat: Category | undefined;
  let bestUnits: TokenMatch[] = [];
  for (const [cat, units] of byCategory) {
    const distinct = new Set(units.map(u => u.unit.short));
    if (distinct.size >= 2) {
      bestCat = cat;
      bestUnits = units;
      break;
    }
  }

  // Fallback: convert keyword + at least 1 unit
  if (!bestCat && hasKeyword && matches.length >= 1) {
    bestCat = matches[0].category;
    bestUnits = [matches[0]];
  }

  if (!bestCat) return null;

  // fromUnit = first unit's short, toUnit = last different unit's short
  const cat = UNIT_CATEGORIES.find(c => c.key === bestCat)!;
  const fromShort = bestUnits[0].unit.short;
  let toShort = bestUnits[bestUnits.length - 1].unit.short;
  if (toShort === fromShort) {
    // find next different unit
    const other = bestUnits.find(u => u.unit.short !== fromShort);
    toShort = other ? other.unit.short : fromShort;
  }
  // If still same (only 1 unit + keyword), cycle to next in category
  if (toShort === fromShort) {
    const idx = cat.units.findIndex(u => u.short === fromShort);
    toShort = cat.units[(idx + 1) % cat.units.length].short;
  }

  const langKey = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  const fromUnitFull = cat.units.find(u => u.short === fromShort)!.label[langKey];
  const toUnitFull = cat.units.find(u => u.short === toShort)!.label[langKey];

  if (inputValue !== undefined) {
    const out = convertValue(inputValue, fromShort, toShort, bestCat, cat.factors);
    return {
      mode: 'result',
      fromUnit: fromShort,
      toUnit: toShort,
      inputValue,
      category: bestCat,
      result: {
        inputValue,
        inputUnit: fromShort,
        inputUnitFull: fromUnitFull,
        outputValue: out,
        outputUnit: toShort,
        outputUnitFull: toUnitFull,
        formula: `${inputValue} ${fromShort} = ${formatNumber(out)} ${toShort}`,
        category: bestCat,
      },
    };
  }

  return {
    mode: 'interactive',
    fromUnit: fromShort,
    toUnit: toShort,
    category: bestCat,
    inputValue: 1,
  };
}

export function performConversion(value: number, fromUnit: string, toUnit: string, category: Category): number {
  const cat = UNIT_CATEGORIES.find(c => c.key === category)!;
  return convertValue(value, fromUnit, toUnit, category, cat.factors);
}

export function getClientCategories(lang: string = 'en'): ClientCategoryDef[] {
  return UNIT_CATEGORIES.map(cat => ({
    key: cat.key,
    label: cat.label,
    units: cat.units.map(u => ({
      short: u.short,
      label: u.label,
      factor: cat.factors[u.short],
    })),
    isTemperature: cat.key === 'temperature',
  }));
}
