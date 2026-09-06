# AGENTS.md — Orquestração do Matos UI

Guia de roteamento para agentes que trabalham neste repositório. Diz **qual skill
carregar para qual tarefa** e em que ordem. Para detalhes do projeto, siga os
documentos canônicos — este arquivo não os repete.

| Assunto | Fonte da verdade |
|---|---|
| Estrutura, como criar componente/demo, build do registry | `GUIDE.md` |
| Tokens, Surface Philosophy, Motion, regras de entrada no registry | `DESIGN.md` |
| Tokens CSS | `apps/docs/src/app/global.css` |
| Motion tokens | `apps/docs/src/registry/new-york-v4/lib/motion-tokens.ts` |
| Paletas / customizer | `apps/docs/src/registry/registry-palettes.ts`, `apps/docs/src/lib/theme-customizer.ts` |

Monorepo Bun + Turbo. `apps/docs` (Next.js, docs + registry), `packages/mcp`,
`packages/config`.

Roster de skills: `skills-lock.json` + `.agents/skills/` (skills locais) e o
plugin `web-animation-skills`. Ao adicionar/remover skill, atualize as tabelas
abaixo.

---

## Regras sempre válidas

1. **Antes de tocar em qualquer coisa visual** (componente, token, paleta,
   animação, layout), leia `DESIGN.md` — Surface Philosophy e Motion tokens são
   obrigatórios e não negociáveis. Nada de `bg-*` fixo onde a escada de elevação
   se aplica; nada de spring/duração hardcoded onde há motion token.
2. **`registry.json`, `public/r/**`, `registry/__index__.tsx` são gerados.**
   Nunca editar à mão — rodar `bun run registry:build` em `apps/docs`.
3. **Fechamento de tarefa:** `bun run check` (biome) na raiz e
   `bun run check-types` (tsc) antes de considerar pronto.
4. **Motion acessível não é opcional:** toda animação nova respeita
   `prefers-reduced-motion` → carregue `web-animation-skills:accessible-animation`
   junto com qualquer skill de animação.
5. Idioma dos docs do projeto: PT-BR. Código, nomes de token e commits: EN.

---

## Roteamento de skills

### Animação / motion (plugin `web-animation-skills`)

Carregue a skill **antes** de escrever a primeira linha de animação. Combine
sempre com `accessible-animation`. Se a animação é de UI de componente do
registry, cruze com os motion tokens de `DESIGN.md`.

| Gatilho | Skill |
|---|---|
| Hover/press, toggle, switch, like button, toast, drawer/modal, reorder de lista, shared-element / layout transition, polir feedback de UI | `web-animation-skills:micro-interaction` |
| Scroll animation, ScrollTrigger, pin de seção, scrub, hero timeline, scroll horizontal, SplitText, GSAP Flip, sync com Lenis/Locomotive | `web-animation-skills:gsap-web` |
| Janky/choppy, "fazer 60fps", layout thrashing, animar width/height/top/left, `height: auto`, animar box-shadow, FLIP | `web-animation-skills:60fps-animation` |
| `prefers-reduced-motion`, WCAG 2.3.3, vestibular, `useReducedMotion`, gate de GSAP/Framer/Lenis | `web-animation-skills:accessible-animation` |
| Glassmorphism, frosted glass, liquid/Apple glass, nav/modal/card de vidro, blur com `backdrop-filter`, refração SVG | `web-animation-skills:glassmorphism` |
| Animar SVG: draw-on (`stroke-dashoffset`), morph de shape, motion along path, ícone/logo animado, gradiente/filtro SVG | `web-animation-skills:svg-animation` |
| Transição de página/rota, View Transitions API, crossfade entre views, `AnimatePresence` exit não dispara no Next App Router | `web-animation-skills:page-transition-animation` |
| Lottie / `.lottie` / `.json` Bodymovin, controlar playback, Lottie scroll-driven, recolorir em runtime, checklist de export AE | `web-animation-skills:lottie-animation` |
| ASCII animation, intro/loader de terminal, imagem/vídeo → ASCII, shader ASCII em canvas/Three.js | `web-animation-skills:ascii-animation` |

> `60fps-animation`, `svg-animation` e `page-transition-animation` também estão
> instaladas como skills locais avulsas em `.agents/skills` — o conteúdo é o
> mesmo, então invocar sem o prefixo `web-animation-skills:` funciona igual.

### Animação / 3D / áudio (skills locais em `.agents/skills`)

| Gatilho | Skill |
|---|---|
| Princípios de animação (timing, easing, antecipação, follow-through, squash & stretch) aplicados a UI | `12-principles-of-animation` |
| Motion design conceitual / direção de movimento (LottieFiles) | `motion-design` |
| Cena Three.js, câmera, luz, materiais, loop de render | `threejs-fundamentals` |
| Animar objetos/câmera/shaders em Three.js | `threejs-animation` |
| Gerar SFX/áudio com IA para microinterações, achievement toasts, hover/success cues | `generating-sounds-with-ai` |

### Frontend / UI (skills locais)

| Gatilho | Skill |
|---|---|
| Arquitetura de componente React, padrões de estado, performance de render, a11y de UI | `frontend-ui-engineering` |
| Diretrizes visuais de UI (espaçamento, hierarquia, densidade) | `ui-guidelines` |
| Layout responsivo, breakpoints, container queries, fluid type | `responsive-design` |
| Confirmar comportamento/assinatura de API (Framer Motion, Base UI, Next 16, Tailwind v4) **contra a doc oficial** antes de codar — em vez de ir de memória | `grill-with-docs` |
| Texto soa a IA / precisa soar humano (docs MDX, copy do site) | `humanizer` |

### Dados, artefatos e design (built-in)

| Gatilho | Skill |
|---|---|
| Qualquer chart/gráfico/dashboard/paleta categórica ou sequencial, stat tile, sparkline, legenda, eixo, tooltip — **ler antes de escrever a primeira linha de chart** | `dataviz` |
| Mockup, wireframe, landing page, poster, one-pager que o usuário quer ajustar à mão | `design` |
| Antes de escrever qualquer Artifact (inclusive `.md` pedido por skill) | `artifact-design` |
| Diagrama dentro de Artifact | `artifact-diagramming` |
| Artifact que lê dados ao vivo, guarda estado, poll, checklist, upload | `artifact-capabilities` |
| Perguntas sobre Claude API / SDK / modelos / pricing / caching | `claude-api` |

### Fluxo de trabalho (built-in)

| Gatilho | Skill |
|---|---|
| Revisar diff/PR/branch em busca de bugs de correção + limpeza | `code-review` |
| Só limpeza de qualidade (reuso, simplificação, altitude), sem caça a bug | `simplify` |
| Rodar/abrir o app para confirmar uma mudança visual | `run` |
| Automação via `settings.json`, hooks, permissões, env vars | `update-config` |
| Reduzir prompts de permissão | `fewer-permission-prompts` |
| Tarefa recorrente por intervalo | `loop` |
| Agente agendado (cron) | `schedule` |
| Rebind de teclas | `keybindings-help` |
| Revisão de segurança do branch | `security-review` |

---

## Cadeias comuns (ordem de skills)

- **Nova animação de componente do registry:** `DESIGN.md` → `grill-with-docs`
  se depender de API não-trivial de Framer/Base UI → skill de animação aplicável
  (`micro-interaction` / `gsap-web` / `svg-animation` …) → `12-principles-of-animation`
  para calibrar o caráter → `accessible-animation` → `bun run check` +
  `check-types` → `code-review`.
- **Componente com feedback sonoro** (achievement toast, success cue):
  `generating-sounds-with-ai` para os assets → `micro-interaction` para disparar
  no evento → `accessible-animation` (respeitar mudo/reduced-motion) → checks.
- **Nova paleta / mexer no customizer:** `DESIGN.md` (§ paletas) →
  `registry-palettes.ts` (sem token novo, sem hardcode) → `dataviz` se o preview
  tem chart → `bun run registry:build` → checks.
- **Efeito de vidro na navbar / cards:** `web-animation-skills:glassmorphism` +
  `accessible-animation` (fallback `prefers-reduced-transparency`) → `DESIGN.md`
  para não furar a escada de elevação.
- **Página/rota nova com transição:** `page-transition-animation` +
  `accessible-animation` → `60fps-animation` se houver jank.
- **Landing / seção de marketing nova:** `design` (mockup) → implementação →
  `micro-interaction` / `gsap-web` → `humanizer` na copy → checks.
- **Escrever/ajustar doc MDX:** `humanizer` → checks.
