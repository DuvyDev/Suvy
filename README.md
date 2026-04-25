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
- **Bilingual**: English and Spanish UI with one-click toggle.
- **OpenSearch**: Add Suvy as a browser search engine.

## Tech Stack

- [Astro](https://astro.build/) — Fast, modern web framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [DuvyCrawl](https://github.com/DuvyDev/DuvyCrawl) — Local web crawler & indexer (companion project)
- DuckDuckGo HTML scraping — Fallback search source

## Quick Start

### Option 1: Production Kit (Docker Compose)

The all-in-one deployment includes Suvy, DuvyCrawl, Cloudflare WARP (SOCKS5 proxy for the crawler), and a Cloudflare Tunnel — everything you need to get a private search engine online in minutes.

#### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- A [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/network/create-tunnel/) token (to expose Suvy to the internet)

#### Steps

```bash
git clone https://github.com/DuvyDev/Suvy.git
cd Suvy

# Copy the example env and fill in your values
cp .env.example .env
```

Edit `.env` — at minimum, set your `TUNNEL_TOKEN` and `SITE_URL`:

```env
TUNNEL_TOKEN=your_cloudflare_tunnel_token
SITE_URL=https://search.yourdomain.com
CRAWLER_API=http://duvycrawl:8080/api/v1
PROXY_URL=socks5://warp:1080
```

> **Note:** `CRAWLER_API` and `PROXY_URL` use Docker service names as hostnames, so they work out of the box inside the compose network.

Then launch everything:

```bash
docker-compose up -d
```

That's it. Suvy will be available at the domain configured in your Cloudflare Tunnel.

#### Architecture

```
Internet ──► Cloudflare ──► cloudflared ──► suvy ──► duvycrawl ──► warp (SOCKS5)
                                       │
                                       └──► DuckDuckGo (fallback)
```

| Service | Description | Port |
|---------|-------------|------|
| `suvy` | Search engine frontend + API | 8800 (internal) |
| `duvycrawl` | Web crawler & FTS5 indexer | 8080 (internal) |
| `warp` | Cloudflare WARP SOCKS5 proxy | 1080 (internal) |
| `cloudflared` | Cloudflare Tunnel connector | — |

All services communicate over isolated Docker bridge networks. Suvy's port is only exposed on `127.0.0.1` for optional local debugging — public traffic flows exclusively through the Cloudflare Tunnel.

#### Optional: Crawler Config & Data

Mount your DuvyCrawl configuration and persistent data:

```bash
mkdir -p crawl/data crawl/configs
# Place your duvycrawl config.yaml in crawl/configs/
```

The `crawl/data` directory persists the crawler's SQLite database across restarts.

---

### Option 2: Standalone (Node.js)

Run Suvy by itself if you already have a DuvyCrawl instance elsewhere.

#### Prerequisites

- Node.js >= 22.12.0
- A running [DuvyCrawl](https://github.com/DuvyDev/DuvyCrawl) instance (default: `http://localhost:8080`)

#### Steps

```bash
git clone https://github.com/DuvyDev/Suvy.git
cd Suvy
npm install

# Development
npm run dev

# Production build
npm run build
npm run preview
```

The dev server starts on `http://localhost:8800` by default.

---

## Configuration

Copy `.env.example` to `.env` and adjust values:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8800` | Server port |
| `SITE_URL` | `http://localhost:8800` | Public site URL (for OG tags & canonical URLs) |
| `CRAWLER_API` | `http://localhost:8080/api/v1` | DuvyCrawl API endpoint |
| `DDG_ENABLED` | `true` | Enable DuckDuckGo fallback |
| `DDG_RESULTS` | `3` | Number of DDG results to feed the crawler |
| `DDG_CACHE_TTL_MINUTES` | `120` | How long to cache DDG query results |
| `NEWS_MAX_ITEMS` | `5` | Max news items in sidebar |
| `WIKIPEDIA_CARD_ENABLED` | `true` | Show Wikipedia knowledge panel |
| `RESULTS_PER_PAGE` | `10` | Pagination page size |
| `DEFAULT_LANG` | `en` | Default UI language (`en` or `es`) |
| `TUNNEL_TOKEN` | — | Cloudflare Tunnel token (Docker Kit only) |
| `PROXY_URL` | `socks5://warp:1080` | SOCKS5 proxy for crawler (Docker Kit only) |
| `TZ` | `UTC` | Timezone for all services |

## Project Structure

```
/
├── public/                    # Static assets (favicon, logos, OG images)
├── src/
│   ├── components/            # Astro components
│   ├── layouts/               # Page layouts
│   ├── lib/                   # Business logic (search, crawler, DDG)
│   ├── i18n/                  # Translations (en / es)
│   ├── pages/                 # Astro routes (including /api/*)
│   └── styles/                # Global CSS
├── data/                      # Runtime data (DDG cache)
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
