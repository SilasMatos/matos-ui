# Matos UI - Guia de Desenvolvimento

## Estrutura do Projeto

```
matos-ui/
├── apps/
│   └── docs/                          # App Next.js (docs + registry)
│       ├── content/docs/              # Documentação MDX
│       │   ├── index.mdx              # Página de introdução
│       │   └── components/
│       │       ├── index.mdx          # Lista de componentes
│       │       └── button.mdx         # Doc do Button (exemplo)
│       ├── registry.json              # Gerado pelo build (NÃO editar manualmente)
│       ├── public/r/                  # JSONs do registry (gerados pelo build)
│       ├── registry/
│       │   └── __index__.tsx          # Index de componentes (gerado pelo build)
│       └── src/
│           ├── registry/
│           │   ├── index.ts           # Definição do registry (nome, homepage, items)
│           │   ├── registry-ui.ts     # Lista de componentes UI
│           │   ├── registry-examples.ts # Lista de exemplos/demos
│           │   └── new-york-v4/
│           │       ├── ui/            # Código fonte dos componentes
│           │       ├── examples/      # Código fonte dos demos
│           │       └── hooks/         # Hooks compartilhados
│           ├── lib/
│           │   ├── config.ts          # Config do site (nome, URL, links)
│           │   └── registry.ts        # Utilitários do registry
│           ├── components/            # Componentes do site de docs
│           └── scripts/
│               └── build-registry.mts # Script de build do registry
└── packages/
    └── config/                        # Config compartilhada (tsconfig)
```

---

## Como Criar um Novo Componente

### Passo 1: Criar o componente

Crie o arquivo do componente em:

```
apps/docs/src/registry/new-york-v4/ui/NOME.tsx
```

Exemplo para um componente `badge`:

```
apps/docs/src/registry/new-york-v4/ui/badge.tsx
```

### Passo 2: Criar o demo/exemplo

Crie o arquivo de demo em:

```
apps/docs/src/registry/new-york-v4/examples/NOME-demo.tsx
```

Exemplo:

```
apps/docs/src/registry/new-york-v4/examples/badge-demo.tsx
```

O demo é o que aparece no preview da documentação.

### Passo 3: Registrar o componente

Adicione o componente no arquivo `apps/docs/src/registry/registry-ui.ts`:

```typescript
import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "button",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "ui/button.tsx",
        type: "registry:ui",
      },
    ],
  },
  // Adicione aqui:
  {
    name: "badge",
    type: "registry:ui",
    dependencies: [],  // dependências npm que o componente precisa
    files: [
      {
        path: "ui/badge.tsx",
        type: "registry:ui",
      },
    ],
  },
];
```

### Passo 4: Registrar o demo/exemplo

Adicione o demo no arquivo `apps/docs/src/registry/registry-examples.ts`:

```typescript
import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    name: "button-demo",
    type: "registry:example",
    registryDependencies: ["button"],
    files: [
      {
        path: "examples/button-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  // Adicione aqui:
  {
    name: "badge-demo",
    type: "registry:example",
    registryDependencies: ["badge"],
    files: [
      {
        path: "examples/badge-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
```

### Passo 5: Criar a documentação

Crie o arquivo MDX em:

```
apps/docs/content/docs/components/NOME.mdx
```

Use este template:

```mdx
---
title: Badge
description: Exibe um badge ou status indicator.
---

<ComponentPreview name="badge-demo" />

## Instalação

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

<CodeBlockCommand command="npx shadcn@latest add https://matos-ui.vercel.app/r/badge.json" />

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="badge"
  title="components/ui/badge.tsx"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

\```tsx
import { Badge } from "@/components/ui/badge"
\```

\```tsx
<Badge>New</Badge>
\```
```

---

## Como o Registry Funciona

### Build

Quando você roda `bun run build` (ou `bun run registry:build` dentro de `apps/docs`):

1. O script `build-registry.mts` lê os items de `registry-ui.ts` e `registry-examples.ts`
2. Gera o `registry/__index__.tsx` (lazy imports para o preview funcionar)
3. Gera o `registry.json` na raiz de docs
4. Roda `bunx shadcn build` para gerar os JSONs em `public/r/`
5. Gera `ui.json`, `blocks.json`, `all.json` agregados

### Instalação pelo usuário final

Usuários instalam componentes via:

```bash
npx shadcn@latest add https://matos-ui.vercel.app/r/NOME.json
```

Isso baixa o JSON do componente e copia o código fonte para o projeto do usuário.

---

## Campos Importantes do Registry Item

| Campo                  | Tipo              | Descrição                                                |
| ---------------------- | ----------------- | -------------------------------------------------------- |
| `name`                 | `string`          | Nome único do componente                                 |
| `type`                 | `string`          | `registry:ui`, `registry:example`, `registry:hook`, etc. |
| `dependencies`         | `string[]`        | Pacotes npm necessários                                  |
| `devDependencies`      | `string[]`        | Pacotes npm de dev necessários                           |
| `registryDependencies` | `string[]`        | Outros items do registry que são dependência             |
| `files`                | `RegistryFile[]`  | Arquivos do componente                                   |
| `files[].path`         | `string`          | Caminho relativo (ex: `ui/badge.tsx`)                    |
| `files[].type`         | `string`          | Tipo do arquivo                                          |
| `files[].target`       | `string`          | Caminho de destino no projeto do usuário (opcional)       |

---

## Checklist para Novo Componente

- [ ] Criar `apps/docs/src/registry/new-york-v4/ui/NOME.tsx`
- [ ] Criar `apps/docs/src/registry/new-york-v4/examples/NOME-demo.tsx`
- [ ] Adicionar item em `apps/docs/src/registry/registry-ui.ts`
- [ ] Adicionar demo em `apps/docs/src/registry/registry-examples.ts`
- [ ] Criar `apps/docs/content/docs/components/NOME.mdx`
- [ ] Rodar `bun run build` para testar o build do registry

---

## Comandos Úteis

```bash
# Dev server (porta 4000)
bun run dev

# Build completo (registry + next)
bun run build

# Build apenas do registry
cd apps/docs && bun run registry:build

# Lint e format
bun run check
```

---

## Arquivos que Você NÃO Deve Editar Manualmente

Estes arquivos são **gerados automaticamente** pelo build:

- `apps/docs/registry.json`
- `apps/docs/registry/__index__.tsx`
- `apps/docs/public/r/*.json`
- `apps/docs/public/r/styles/**`

---

## Dicas

- Imports dentro dos componentes do registry devem usar `@/registry/new-york-v4/ui/...`. O build reescreve automaticamente para `@/components/ui/...` no JSON final.
- Se o componente depende de outro componente do registry, use `registryDependencies` (ex: um `AlertDialog` que usa `Button` → `registryDependencies: ["button"]`).
- Para hooks compartilhados, coloque em `new-york-v4/hooks/` e registre com `type: "registry:hook"`.
- Para utilitários, coloque em `new-york-v4/lib/` e registre com `type: "registry:lib"`.

---

## Como Criar um Novo Block

Blocks são composições prontas (dashboards, telas de auth, etc.) construídas **com os componentes existentes** do Matos UI. Eles vivem em:

```
apps/docs/src/registry/new-york-v4/blocks/<slug>/
  <slug>.tsx            # componente principal (único export nomeado)
  components/*.tsx       # sub-componentes do block
  data.ts               # dados demonstrativos
```

Convenções:

- **Imports internos do block** usam caminho relativo (`./components/x`, `./data`) — assim continuam resolvendo após a instalação.
- **Componentes do Matos UI** são importados de `@/registry/new-york-v4/ui/...` (o build reescreve para `@/components/matos-ui/...`) e declarados em `registryDependencies`. **Nunca duplique** Button, Card, Chart, etc.
- Use container queries (`@container/<name>` + `@md/<name>:`) para reflow por largura do container, e apenas tokens semânticos do tema.
- Respeite `prefers-reduced-motion` (`useReducedMotion`).

### Passos

1. Crie os arquivos do block em `blocks/<slug>/`.
2. Registre o item em `apps/docs/src/registry/registry-blocks.ts` com `type: "registry:block"`, `dependencies` (npm), `registryDependencies` (URLs `https://matos-ui.com/r/<name>.json`) e a lista de `files`.
3. Adicione os metadados de exibição em `apps/docs/src/lib/blocks.ts` e o componente em `apps/docs/src/components/block-previews.tsx`.
4. Rode `bun run registry:build` — o block aparece em `/blocks` e gera `public/r/<slug>.json`.

Instalação pelo usuário final:

```bash
npx shadcn@latest add https://matos-ui.com/r/<slug>.json
```
