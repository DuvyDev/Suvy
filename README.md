# Suvy

> A personal and private search engine powered by your own crawler.

[Suvy](https://github.com/DuvyDev/Suvy) is a self-hosted, privacy-first web search interface that puts you in control of your search experience. Instead of relying entirely on third-party search engines, Suvy leverages your own **[DuvyCrawl](https://github.com/DuvyDev/DuvyCrawl)** indexer for local results, while seamlessly supplementing with DuckDuckGo when needed.

## Features

- **Privacy-first**: Your queries are processed locally. No tracking, no profiling.
- **Personal crawler integration**: Searches your own DuvyCrawl index first.
- **Smart fallback**: Automatically queries DuckDuckGo to fill gaps and feeds those URLs back into your crawler for future indexing.
- **Rich result cards**: Site names, favicons, relative dates, sitelinks, and Wikipedia knowledge panels.
- **News sidebar**: Articles with rich schema (images, authors, publication dates) displayed in a dedicated panel.
- **Advanced filters**: Date range, language, and `site:` operator support.
- **Manual URL submission**: Easily queue new URLs for your crawler to index.
- **Image search**: Browse images indexed by your crawler.
- **Dark / Light mode**: Toggle themes with persistence.
- **OpenSearch**: Add Suvy as a browser search engine.

## Tech Stack

- [Astro](https://astro.build/) — Fast, modern web framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [DuvyCrawl](https://github.com/DuvyDev/DuvyCrawl) — Local web crawler & indexer (companion project)
- DuckDuckGo HTML scraping — Fallback search source

## Quick Start

### Prerequisites

- Node.js >= 22.12.0
- A running [DuvyCrawl](https://github.com/DuvyDev/DuvyCrawl) instance (default: `http://localhost:8080`)

### Installation

```bash
git clone https://github.com/DuvyDev/Suvy.git
cd Suvy
npm install
```

### Development

```bash
npm run dev
```

The dev server will start on `http://localhost:4321` by default.

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker-compose up -d
```

See [`docker-compose.yml`](./docker-compose.yml) for configuration options.

## Configuration

Copy `.env.example` to `.env` and adjust values:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8800` | Server port |
| `SITE_URL` | `http://localhost:8800` | Public site URL for OG tags |
| `CRAWLER_API` | `http://localhost:8080/api/v1` | DuvyCrawl API endpoint |
| `DDG_ENABLED` | `true` | Enable DuckDuckGo fallback |
| `DDG_RESULTS` | `3` | DDG results to feed crawler |
| `DDG_CACHE_TTL_MINUTES` | `120` | How long to cache DDG queries |
| `NEWS_MAX_ITEMS` | `5` | Max news items in sidebar |
| `WIKIPEDIA_CARD_ENABLED` | `true` | Show Wikipedia knowledge panel |
| `RESULTS_PER_PAGE` | `10` | Pagination page size |
| `DEFAULT_LANG` | `es` | Default UI language (`es` or `en`) |

## Project Structure

```
/
├── public/              # Static assets (favicon, logos, OG images)
├── src/
│   ├── components/      # Astro components
│   ├── layouts/         # Page layouts
│   ├── lib/             # Business logic (search, crawler, DDG)
│   ├── i18n/            # Translations
│   ├── pages/           # Astro routes
│   └── styles/          # Global CSS
├── data/                # Runtime data (DDG cache)
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/DuvyDev/Suvy).

## Author

- **Pablo M. Duval** — [@DuvyDev](https://github.com/DuvyDev)

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
