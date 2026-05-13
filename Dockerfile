# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.6 AS builder
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json bun.lock turbo.json tsconfig.json biome.json .gitignore ./
COPY packages ./packages
COPY apps/docs ./apps/docs

RUN bun install --frozen-lockfile
RUN bun run --filter docs build

FROM oven/bun:1.3.6 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun --silent -e "const r = await fetch('http://127.0.0.1:4000/'); process.exit(r.ok ? 0 : 1)" || exit 1

CMD ["bun", "run", "--filter", "docs", "start"]
