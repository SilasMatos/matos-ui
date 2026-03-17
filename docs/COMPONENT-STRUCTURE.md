# Estrutura de Componentes para o Registry

Este documento define como os componentes devem ser escritos para serem publicados no registry do Matos UI.

---

## 1. Convenções gerais

| Regra | Descrição |
| ----- | --------- |
| **Arquivo** | Nome em `lowercase` com hífens: `my-component.tsx` |
| **Export** | Sempre **named exports**. Não usar `export default`. |
| **Elemento raiz** | Ter `data-slot="nome-do-componente"` para identificação. |
| **Classes** | Usar `twMerge(variantes, className)` para permitir override pelo consumidor. |
| **Props** | Spread `{...props}` no final do elemento. |
| **Cores** | Usar variáveis do tema (`bg-primary`, `text-muted-foreground`, etc.), nunca cores hardcoded. |
| **Focus** | Interativos devem ter `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`. |
| **Ícones** | Botões só de ícone devem ter `aria-label`. |

---

## 2. Estrutura do arquivo UI

### 2.1 Componente com variantes (tailwind-variants)

Use **tailwind-variants** (`tv`) para componentes que não dependem de Base UI.

```tsx
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const nomeVariants = tv({
  base: [
    "classes-base-do-componente",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ],
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border-border bg-transparent",
    },
    size: {
      sm: "h-7 px-2 text-xs",
      md: "h-8 px-3 text-sm",
      lg: "h-9 px-4 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type NomeProps = ComponentProps<"div"> &
  VariantProps<typeof nomeVariants>;

export function Nome({ className, variant, size, ...props }: NomeProps) {
  return (
    <div
      data-slot="nome"
      className={twMerge(nomeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

**Obrigatório:**

- Exportar `nomeVariants` (ou `nomeComponentVariants`) para o consumidor poder estender.
- Exportar tipo `NomeProps` com `ComponentProps<"elemento">` + `VariantProps<typeof nomeVariants>`.
- Exportar função `Nome` com **named export**.
- `data-slot` no elemento raiz.
- `twMerge(variantes, className)` e `...props` no final.

### 2.2 Componente com Base UI (headless)

Use **class-variance-authority** (`cva`) quando o componente for um wrapper do Base UI (ex.: Button, Dialog).

```tsx
"use client";

import { NomePrimitive } from "@base-ui/react/nome";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const nomeVariants = cva(
  "classes-base focus-visible:ring-ring rounded-lg ...",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { sm: "...", md: "...", lg: "..." },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

function Nome({
  className,
  variant = "default",
  size = "md",
  ...props
}: NomePrimitive.Props & VariantProps<typeof nomeVariants>) {
  return (
    <NomePrimitive
      data-slot="nome"
      className={cn(nomeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Nome, nomeVariants };
```

**Obrigatório:**

- `"use client"` quando usar componentes do Base UI.
- Import de `cn` de `@/lib/utils` (ou equivalente no projeto do registry).
- Exportar o componente e as variantes: `export { Nome, nomeVariants }`.

---

## 3. Estrutura do arquivo de demo (example)

O demo é usado no preview da documentação e deve importar do registry.

```tsx
import { Nome } from "@/registry/new-york-v4/ui/nome";

export default function NomeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Nome>Default</Nome>
      <Nome variant="secondary">Secondary</Nome>
      <Nome variant="outline" size="lg">Outline Large</Nome>
    </div>
  );
}
```

**Obrigatório:**

- Import do componente de `@/registry/new-york-v4/ui/NOME`.
- **Default export** da função do demo (ex.: `NomeDemo`).
- Nome do arquivo: `nome-demo.tsx`.

---

## 4. Imports dentro do registry

Componentes em `src/registry/new-york-v4/` devem importar entre si assim:

| De / Para | Import |
| --------- | ------ |
| UI → outro UI | `@/registry/new-york-v4/ui/outro-componente` |
| UI → hook | `@/registry/new-york-v4/hooks/use-nome` |
| UI → lib | `@/registry/new-york-v4/lib/utils` (se existir) |
| Example → UI | `@/registry/new-york-v4/ui/nome` |

O build do registry reescreve esses caminhos no JSON final (ex.: `@/components/ui/...` para quem instala).

---

## 5. Checklist por componente

Antes de registrar um componente, conferir:

- [ ] Arquivo em `ui/nome-do-componente.tsx` (lowercase, hífens).
- [ ] Named exports: componente + variantes (e tipo de props).
- [ ] `data-slot="nome-do-componente"` no elemento raiz.
- [ ] `twMerge(...)` ou `cn(...)` com `className` e variantes.
- [ ] Props tipadas com `ComponentProps<"elemento">` e, se tiver variantes, `VariantProps<typeof variantes>`.
- [ ] Cores do tema (sem hex/rgb fixos).
- [ ] Focus visible em interativos.
- [ ] `{...props}` no final do elemento.
- [ ] Demo em `examples/nome-do-componente-demo.tsx` com default export.
- [ ] Registro em `registry-ui.ts` e `registry-examples.ts`.
- [ ] Doc em `content/docs/components/nome-do-componente.mdx`.

---

## 6. Resumo de arquivos por componente

| O quê | Onde |
| ----- | ---- |
| Código do componente | `apps/docs/src/registry/new-york-v4/ui/nome.tsx` |
| Código do demo | `apps/docs/src/registry/new-york-v4/examples/nome-demo.tsx` |
| Entrada no registry (UI) | `apps/docs/src/registry/registry-ui.ts` |
| Entrada no registry (demo) | `apps/docs/src/registry/registry-examples.ts` |
| Página de documentação | `apps/docs/content/docs/components/nome.mdx` |

Depois de criar/alterar, rodar `bun run registry:build` (ou `bun run build`) para gerar os JSONs do registry.
