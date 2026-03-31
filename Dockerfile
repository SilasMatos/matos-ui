# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.6 AS builder
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json bun.lock turbo.json tsconfig.json biome.json ./
COPY packages ./packages
COPY apps/docs ./apps/docs

RUN bun install --frozen-lockfile
RUN bun run --filter docs build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY docker/nginx.prod.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs/out ./

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
