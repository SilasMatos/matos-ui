# Matos UI

Registry de componentes UI para shadcn/ui.

Este repositorio publica componentes prontos (ex.: `button`, `badge`, `accordion`, `file-upload`) para serem instalados direto no seu projeto via CLI do shadcn.

## Como usar o registry no seu projeto

### 1) Pre-requisitos

- Projeto React/Next.js com Tailwind
- shadcn/ui inicializado no projeto consumidor
- Node.js 18+ (ou Bun)

Se ainda nao inicializou o shadcn no projeto consumidor:

```bash
npx shadcn@latest init
```

### 2) URL base do registry

Use a URL do seu ambiente publicado:

```txt
https://matos-ui.com/r
```

Para desenvolvimento local deste repositorio, normalmente:

```txt
http://localhost:4000/r
```

### 3) Instalar componentes

No projeto consumidor, rode:

```bash
npx shadcn@latest add https://matos-ui.com/r/button.json
```

Outros exemplos:

```bash
npx shadcn@latest add https://matos-ui.com/r/badge.json
npx shadcn@latest add https://matos-ui.com/r/accordion.json
npx shadcn@latest add https://matos-ui.com/r/action-bar.json
npx shadcn@latest add https://matos-ui.com/r/file-upload.json
```

O CLI baixa os arquivos do componente e instala dependencias necessarias.

### 4) Instalar exemplos prontos (opcional)

Voce tambem pode adicionar exemplos de uso:

```bash
npx shadcn@latest add https://matos-ui.com/r/button-demo.json
npx shadcn@latest add https://matos-ui.com/r/metric-card-demo.json
```

### 5) Usar no codigo

Depois de adicionar, importe normalmente no seu app:

```tsx
import { Button } from '@/components/ui/button'

export function Example() {
  return <Button>Salvar</Button>
}
```

## Itens disponiveis

Alguns itens publicados no registry:

- `button`
- `badge`
- `breadcrumb`
- `divider`
- `accordion`
- `action-bar`
- `detail-panel`
- `command-dock`
- `file-upload`
- `notification-stack`
- `metric-card`
- `feedback-card`

E seus respectivos `*-demo`.

## Desenvolvimento deste repositorio

```bash
bun install
bun run dev
```

Scripts principais:

- `bun run dev` - sobe ambiente de desenvolvimento
- `bun run build` - build de producao (inclui registry)
- `bun run check` - lint/format com Biome

## Publicacao com Docker + Nginx

Este projeto builda o app `apps/docs` (Next static export) e serve os arquivos estaticos via Nginx.

Build da imagem:

```bash
docker build -t matos-ui/docs:prod .
```

Rodar container:

```bash
docker run -d --name matos-ui-docs -p 8080:80 --restart unless-stopped matos-ui/docs:prod
```

Rodar com Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### DNS (matos-ui.com na VPS)

1. Registro **A** para `@` apontando para o IP publico da VPS.
2. `www` como **CNAME** para `matos-ui.com` (ou **A** com o mesmo IP).

### TLS (HTTPS)

Recomendado usar Nginx/Caddy no host na porta 443 com Let's Encrypt e `proxy_pass` para `http://127.0.0.1:8080`.
