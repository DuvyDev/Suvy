import * as cheerio from 'cheerio';

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

/**
 * Searches DuckDuckGo HTML version and parses the results.
 * @param query The search term
 * @param limit Maximum number of results to return
 * @returns Array of SearchResultItem
 */
export async function searchDuckDuckGo(query: string, limit: number = 10): Promise<SearchResultItem[]> {
  if (!query || query.trim() === '') return [];

  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`DuckDuckGo returned status: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: SearchResultItem[] = [];

    $('.result__body').each((i, el) => {
      if (i >= limit) return false; // break

      const titleEl = $(el).find('.result__title a.result__a');
      const snippetEl = $(el).find('.result__snippet');

      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      
      // Sometimes DDG wraps URLs in a redirect like "//duckduckgo.com/l/?uddg=..."
      if (url.startsWith('//duckduckgo.com/l/?uddg=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const uddg = urlParams.get('uddg');
        if (uddg) {
          url = decodeURIComponent(uddg);
        }
      }

      const content = snippetEl.text().trim();

      if (title && url) {
        results.push({ title, url, content });
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching DuckDuckGo:', error);
    return [];
  }
}
