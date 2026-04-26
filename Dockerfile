# syntax=docker/dockerfile:1
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Runtime environment defaults
ENV NODE_ENV=production
ENV PORT=8800
ENV CRAWLER_API=http://localhost:8080/api/v1
ENV DDG_ENABLED=true
ENV DDG_RESULTS=3
ENV DDG_CACHE_TTL_MINUTES=120
ENV NEWS_MAX_ITEMS=5
ENV WIKIPEDIA_CARD_ENABLED=true
ENV RESULTS_PER_PAGE=10
ENV DEFAULT_LANG=en

EXPOSE 8800

CMD ["node", "dist/server/entry.mjs"]
