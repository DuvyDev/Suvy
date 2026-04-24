export type Language = 'es' | 'en';

export const translations = {
  es: {
    searchPlaceholder: 'Buscar...',
    searchButton: 'Buscar',
    feelingLucky: 'Voy a tener suerte',
    resultsFor: 'Resultados de',
    noResults: 'No se encontraron resultados para',
    settings: 'Configuración',
    privacy: 'Privacidad',
    terms: 'Términos',
    about: 'Acerca de',
    language: 'Idioma',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    sourceLocal: 'Local',
    sourceDDG: 'DuckDuckGo',
    poweredByLocal: 'Resultados de tu índice local',
    poweredByDDG: 'Resultado complementario de DuckDuckGo',
    images_title: 'Imágenes',
    images_tab: 'Imágenes',
    images_empty: 'Busca imágenes indexadas por tu crawler',
    images_no_results: 'No se encontraron imágenes',
    images_found: 'imágenes encontradas',
  },
  en: {
    searchPlaceholder: 'Search...',
    searchButton: 'Search',
    feelingLucky: 'I\'m Feeling Lucky',
    resultsFor: 'Results for',
    noResults: 'No results found for',
    settings: 'Settings',
    privacy: 'Privacy',
    terms: 'Terms',
    about: 'About',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    sourceLocal: 'Local',
    sourceDDG: 'DuckDuckGo',
    poweredByLocal: 'Results from your local index',
    poweredByDDG: 'Supplementary result from DuckDuckGo',
    images_title: 'Images',
    images_tab: 'Images',
    images_empty: 'Search images indexed by your crawler',
    images_no_results: 'No images found',
    images_found: 'images found',
  }
};

export function getTranslation(lang: string | undefined | null) {
  const l = (lang === 'en' ? 'en' : 'es') as Language;
  return translations[l];
}
