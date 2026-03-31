# Matos UI

Componentes estilizados para shadcn/ui.

## Getting Started

```bash
bun install
bun run dev
```

## Scripts

- `bun run dev` - Dev server
- `bun run build` - Build (inclui registry)
- `bun run check` - Lint e format (Biome)

## Producao com Docker + Nginx

Este repositorio esta configurado para buildar o app `apps/docs` (Next static export) e servir os arquivos estaticos via Nginx.

### Build da imagem

```bash
docker build -t matos-ui/docs:prod .
```

### Rodar container

```bash
docker run -d --name matos-ui-docs -p 8080:80 --restart unless-stopped matos-ui/docs:prod
```

### Rodar com Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### DNS (matos-ui.com na VPS)

1. Registro **A** para `@` (raiz) apontando para o IP publico da VPS (ex.: `72.62.9.144`).
2. **CNAME** `www` → `matos-ui.com` (ou **A** `www` com o mesmo IP).

Apos propagar, `http://matos-ui.com` deve responder na porta exposta pelo compose (`8080` se nao houver proxy na 80).

### TLS (HTTPS) no host

Recomendado: Nginx ou Caddy **no host** na porta 443 com certificado Let's Encrypt, fazendo `proxy_pass` para `http://127.0.0.1:8080` (container). O container continua servindo HTTP na 80 internamente.

### Nginx externo (opcional)

Se voce usa Nginx no host para TLS e dominio, faca proxy para o container na porta `8080`.
