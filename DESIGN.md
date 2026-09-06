# Matos UI — Design System

Referência do sistema de design do Matos UI: os tokens, as duas fundações que
sustentam a biblioteca e as regras que um componente precisa cumprir para entrar
no registry.

Este documento descreve o que está no código. Onde ele e o código divergirem, o
código é a autoridade — e a divergência é bug de documentação. Divergências
conhecidas estão na seção 10.

**Fontes da verdade**

| Assunto | Arquivo |
|---|---|
| Tokens CSS (cor, superfície, sombra, raio, tipografia, transição) | `apps/docs/src/app/global.css` |
| Motion tokens (springs, variants, hooks) | `apps/docs/src/registry/new-york-v4/lib/motion-tokens.ts` |
| Primitivo de elevação | `apps/docs/src/registry/new-york-v4/ui/elevated.tsx` |
| Contexto de substrato | `apps/docs/src/registry/new-york-v4/lib/surface-context.tsx` |
| Helpers de classe de superfície | `apps/docs/src/registry/new-york-v4/lib/surface-classes.ts` |
| Presets de raio | `apps/docs/src/lib/theme-customizer.ts` |
| Paletas | `apps/docs/src/registry/registry-palettes.ts` |
| Itens do registry | `apps/docs/src/registry/registry-{ui,examples,blocks,palettes}.ts` |
| Doc pública de Surface | `apps/docs/content/docs/foundations/elevated.mdx` |
| Doc pública de Motion | `apps/docs/content/docs/foundations/motion.mdx` |

---

## 1. Posicionamento

Matos UI é um registry público de componentes React para projetos que já usam
Tailwind CSS e shadcn/ui. A distribuição é copy-first: o código entra no projeto
do usuário via `shadcn add`, não como dependência opaca.

Isso, sozinho, não diferencia nada — é o modelo do shadcn. O que diferencia são
três camadas construídas em cima dele.

**Surface Philosophy.** Uma escada de elevação de oito níveis em que cada painel
declara quantos degraus sobe em relação ao substrato em que está, em vez de
declarar uma cor de fundo fixa. Um popover dentro de um dialog não desaparece
dentro dele, em nenhum dos dois modos de tema, em nenhuma profundidade.

**Motion Tokens.** Cinco tiers de spring nomeados por caráter, com o tier
derivado do mesmo `offset` de elevação que o componente já declarou. Elevação e
movimento são a mesma decisão contada duas vezes — o componente escolhe uma vez.

**Servidor MCP.** As duas fundações acima são expostas como ferramentas
consultáveis por agentes de IA, lendo direto do código-fonte no GitHub. Um
agente não precisa adivinhar a convenção: ele pergunta.

O resto — acessibilidade, tipagem, tree-shaking — é piso, não diferencial.

---

## 2. Surface Philosophy

### 2.1 O problema

Em light mode, elevação é sombra atrás de uma superfície branca. Em dark mode,
não há luz para bloquear: elevação é fundo progressivamente mais claro.

Componentes com fundo fixo quebram nos dois casos. Um dropdown com `bg-popover`
aberto dentro de um dialog que também é `bg-popover` some dentro dele. A
correção usual — empilhar sombra mais forte — não funciona em dark mode, onde a
sombra tem pouco contra o que se destacar.

### 2.2 A solução: três peças

**Tokens.** Oito pares `--surface-N` / `--shadow-N`, definidos separadamente para
light e dark.

**Substrato.** Cada container sabe em que nível está e informa quem abre dentro
dele, via React context. Nada é passado manualmente entre componentes distantes.

**`Elevated`.** O primitivo. Recebe um `offset` — quantos degraus subir em
relação ao substrato — e resolve fundo, sombra e o novo substrato para os
descendentes.

### 2.3 A escada — light mode

```css
--surface-1: #fafafa;
--surface-2: #fcfcfc;
--surface-3: #ffffff;
--surface-4: #ffffff;
--surface-5: #ffffff;
--surface-6: #ffffff;
--surface-7: #ffffff;
--surface-8: #ffffff;
```

O preenchimento achata em branco puro a partir do nível 3. Daí para cima, quem
carrega a elevação é a sombra.

Para isso funcionar, o **ring precisa rampar**. Uma opacidade fixa de 6% em todos
os níveis faz um card e um dialog desenharem exatamente a mesma linha de 1px:

```css
--shadow-color: rgb(0 0 0 / 0.06);
--lm-ring-2: rgb(0 0 0 / 0.07);   /* … até --lm-ring-8: rgb(0 0 0 / 0.13) */
--lm-drop:   rgb(0 0 0 / 0.07);
```

Cada `--shadow-N` acumula uma camada de drop a mais que o anterior, dobrando o
raio e o offset a cada passo (`1px → 3px → 6px → 12px → 24px → 48px → 96px`),
sempre com o ring correspondente ao nível.

O `--background` da página é `oklch(0.968 0.004 264)`, **não** branco puro. Isso
é deliberado: com branco puro, o canvas ficava acima de `--surface-1` (#fafafa) e
a escada invertia — a página era a coisa mais clara da tela e os níveis 3 a 8
caíam exatamente na cor dela.

### 2.4 A escada — dark mode

```css
--surface-1: #191919;
--surface-2: #242424;
--surface-3: #2e2e2e;
--surface-4: #393939;
--surface-5: #444444;
--surface-6: #4e4e4e;
--surface-7: #575757;
--surface-8: #616161;
```

Os passos são espaçados em **CIE L\*** (~4–6 por nível), não em sRGB bruto. Um
passo uniforme em sRGB colapsaria para ~3 L\* no topo da escada, onde o olho
precisa de mais diferença absoluta para perceber a mesma separação.

O `--background` é `oklch(0.185 0.006 264)` — não preto puro. Cast frio de baixa
croma (hue 264, o mesmo do light mode), claro o bastante para ler como piso
deliberado e não como ausência de cor. Fica um degrau completo abaixo de
`--surface-1` (L\* 5.72 contra 8.76). Contraste contra `--foreground`: 17.9:1.

A sombra em dark é uma receita em camadas, não um drop:

```css
--dm-hi-base:   rgba(255,255,255,0.01);  /* highlight superior */
--dm-hi-peak:   rgba(255,255,255,0.06);
--dm-ring-base: rgba(255,255,255,0.02);  /* ring interno */
--dm-ring-high: rgba(255,255,255,0.06);
--dm-drop:      rgba(0,0,0,0.18);
```

Cada nível combina: `inset` highlight na borda superior (simula luz batendo na
quina), `inset` ring de contorno, um ring escuro externo que cresce em opacidade
com o nível, e os drops acumulados. `--shadow-1` em dark é só o ring interno —
sem drop.

### 2.5 As regras

1. **Um componente declara `offset`, nunca um nível absoluto.** O nível final é
   `min(substrato + offset, 8)`.
2. **Offsets convencionais:** `2` para dropdown / popover / select menu, `4` para
   dialog / modal.
3. **A escada satura em 8**, não estoura. Aninhamento profundo para de subir em
   vez de quebrar.
4. **`SurfaceProvider` é clampado em 1–8** na entrada.
5. **`shadowLevel` desacopla sombra de fundo.** Um dropdown pode manter
   `shadowLevel={3}` em qualquer profundidade enquanto o fundo acompanha o
   substrato — porque o peso de sombra de um popover é uma constante de
   identidade, não uma função da profundidade.
6. **`hoverLift` é opt-in e desligado por padrão.** A maioria dos usos de
   `Elevated` é container passivo; levantar esses no hover é falsa affordance.
   Quando ligado, sobe um degrau de sombra e 2px, com timing vindo do utilitário
   compartilhado `hover-lift`.

### 2.6 API

```tsx
<SurfaceProvider value={1}>
  <div className="rounded-2xl bg-surface-1 shadow-surface-1 p-4">
    {/* dialog: 1 + 4 = surface-5 */}
    <Elevated offset={4} className="rounded-2xl p-4">
      {/* popover dentro do dialog: 5 + 2 = surface-7,
          mas sombra constante de popover em qualquer profundidade */}
      <Elevated offset={2} shadowLevel={3} className="rounded-xl p-2">
        Menu
      </Elevated>
    </Elevated>
  </div>
</SurfaceProvider>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `offset` | `number` | — | Degraus acima do substrato atual. |
| `shadowLevel` | `number` | nível computado | Fixa o peso da sombra. |
| `hoverLift` | `boolean` | `false` | Sobe um degrau de sombra e 2px sob o cursor. |

`Elevated` renderiza uma `div`, aceita todas as props nativas, encaminha `ref` e
expõe `data-slot="elevated"` e `data-surface={level}` para teste e depuração.

`useSurface(): number` lê o substrato atual.

**Nota de composição:** para animar um `Elevated`, use
`motion.create(Elevated)` — não envolva em `<motion.div>`. O wrapper adiciona uma
caixa de layout e quebra cadeias de flex.

---

## 3. Motion Tokens

### 3.1 O problema

Cada componente que anima responde à mesma pergunta: quão rápido, com quanto
caráter. Respondida localmente, cada um escolhe seu próprio
`stiffness: 260, damping: 20` — e o sistema termina com quarenta timings quase
iguais e nenhum igual de fato.

O sintoma não é que alguma animação esteja errada. É que um dropdown, um dialog
e um toast assentam em ritmos ligeiramente diferentes, e nada parece pertencer à
mesma superfície.

### 3.2 Os sete tiers

| Tier | `visualDuration` | `bounce` | `exit` | Para |
|---|---|---|---|---|
| `fast` | `0.15s` | `0.10` | `0.10s` | Micro-feedback: toggle, checkbox, lift de um degrau. |
| `snappy` | `0.11s` | `0.00` | `0.08s` | Follow de latência zero: sheet arrastada, botão magnético, elemento seguindo o cursor. Opt-in manual. |
| `moderate` | `0.28s` | `0.15` | `0.20s` | Painéis que precisam pousar exato: dropdown, tabs, drawer, select. |
| `slow` | `0.42s` | `0.20` | `0.30s` | Dialog e sheet — distância suficiente para o overshoot ler como vivo. |
| `gentle` | `0.60s` | `0.06` | `0.40s` | Movimento ambiente: backdrop surgindo, hero assentando no load, seção entrando no scroll. Opt-in manual. |
| `morph` | `0.75s` | `0.12` | `0.52s` | Forma, não distância: `layout` mudando largura, altura e raio juntos. |
| `playful` | `0.50s` | `0.45` | `0.35s` | Um tom, não uma velocidade. Opt-in manual. |

**`snappy` é o oposto de `playful`.** Onde `playful` adiciona caráter, `snappy`
remove todo ele: bounce 0 e uma `visualDuration` menor que `fast`, porque
qualquer overshoot em algo que o usuário está *ativamente movendo* — arrastando,
puxando com o cursor — lê como lag, não como vida. É o único tier comum
criticamente amortecido de novo, e de propósito. Nunca é alcançado por
`motionForOffset`.

**`gentle` é o par calmo de `slow`.** Mais longo e com quase nenhum bounce, para
movimento que deve recuar em vez de se anunciar: um fundo que sobe, uma seção que
entra enquanto rola para dentro da viewport. `slow` ainda é o tier de dialog;
`gentle` é para o que acontece no plano de fundo dele. Nunca é alcançado por
`motionForOffset`.

**Por que `visualDuration` e não `duration`.** A `duration` de um spring cobre a
animação inteira *incluindo* a cauda de assentamento, e a cauda é justamente a
parte que ninguém percebe como deslocamento. Calibrar por ela faz todo tier
pousar visualmente antes do que o próprio número afirma — e a discrepância cresce
com o bounce. `visualDuration` é o tempo até a chegada visual; a cauda cai
depois. É o número que o olho experimenta, e o único dos dois que vale afinar
por sensação.

Também é o que compõe com animação baseada em tempo: as custom properties CSS
derivadas desses tiers são durações simples, e parear uma transição CSS com a
duração *total* de um spring é exatamente como os dois acabam visivelmente fora
de compasso.

`visualDuration` sobrescreve `duration` quando ambos existem, então os tiers
carregam deliberadamente só um campo — o outro seria peso morto com aparência de
autoridade.

**Por que nada é criticamente amortecido.** `fast` e `moderate` ficavam em
`bounce: 0`, no raciocínio de que um painel que precisa pousar exato não deve
ultrapassar. O raciocínio estava certo e o valor era literal demais: bounce zero
somado a duração muito curta é a receita de movimento que lê como troca de
estado, não como transição — mecânico, sem desaceleração para o olho seguir.

Um bounce pequeno (0.10–0.15) não tem overshoot perceptível nessas distâncias; o
que ele compra é a desaceleração orgânica no final. Se um painel específico
algum dia ler como instável, leve **aquele** tier a 0, não o par.

**`moderate` não é simplesmente "mais rápido que `slow`".** Os dois pousam em
velocidade percebida parecida; a diferença é onde terminam. O bounce de
`moderate` é pequeno o bastante para não ter overshoot visível nas distâncias que
um painel percorre, então um select ainda assenta sob o cursor em vez de passar
do item que o usuário já está alcançando.

**`morph` é o fora-da-curva.** É o único tier mais longo que os acima dele,
porque é o único medindo outra coisa. Os outros movem um elemento que continua
sendo ele mesmo. `morph` é para um elemento *virando* outro, onde a caixa cruza
centenas de pixels de largura e altura de uma vez. Nos 0.42s de `slow` isso lê
como corte seco, e no bounce de `slow` a borda distante de uma caixa larga
oscila visivelmente depois de pousar.

**`exit` é sempre tween, nunca spring.** Nada precisa de caráter na saída, e um
overlay indo embora deve sair da frente mais rápido do que chegou — cerca de 70%
da duração de entrada do próprio tier.

### 3.3 `motionForOffset` — a ponte com elevação

| `offset` | Tier |
|---|---|
| `≤ 1` | `fast` |
| `2` | `moderate` |
| `> 2` | `slow` |

O `offset` que a superfície já declarou basta para escolher o timing. Nenhum
outro ponto do componente precisa saber quão rápido ele deve ser.

Mapeia **apenas** para `fast` / `moderate` / `slow`. `snappy` é uma resposta,
`gentle` um clima, `playful` um tom e `morph` um tipo de mudança — nenhum deles
uma distância, então nenhum é alcançável por `offset` e nenhum overlay comum vira
festivo, arrastável ou ambiente por acidente.

### 3.4 Variants de entrada

**`liftVariants(offset, options?)`** — a metade de entrada da história de
elevação. `motionForOffset` responde *quão rápido* uma superfície sobe; isso
responde *quanto* ela viaja. Elevação é o preenchimento, a sombra **e** a
chegada: uma decisão, não três.

| Opção | Tipo | Padrão |
|---|---|---|
| `y` | `number` | `4` |
| `scale` | `number` | `0.98` |

Os padrões são compartilhados, não universais. Passe `y` quando a superfície for
grande ou lenta o bastante para 4px ler como tique nervoso.

**`directionalVariants(direction, tier?)`** — um elemento que cresce a partir da
borda em que está ancorado, em vez de aparecer do nada. `direction` é o lado de
onde ele *vem*, que para um popup ancorado é o oposto do posicionamento
resolvido: um menu que teve de virar acima do cursor (side `top`) entra de
`bottom`.

Viaja **6px, não 4** — isso lê como origem, não como lift, e o deslocamento
precisa sobreviver a ser visto de lado.

**`revealVariants(options?)`** — entrada premium para conteúdo que aparece
enquanto entra na viewport: fade + um `y` maior que `liftVariants` + um
*focus-pull* opcional (`blur(6px)` → `blur(0)`) que lê como conteúdo entrando em
foco, não deslizando. Dirigido por um tween `ease.decelerate`, não por spring —
um reveal deve planar até parar. O blur é trabalho de GPU: só em blocos de texto,
cards e mídia, nunca seções inteiras, e sempre pareado com `withReducedMotion`.

| Opção | Tipo | Padrão |
|---|---|---|
| `y` / `x` | `number` | `14` / `0` |
| `blur` | `number` | `6` |
| `scale` | `number` | `1` |
| `tier` | `DurationName` | `"slow"` |

**`slideVariants(direction, options?)`** — uma superfície que desliza inteira a
partir de uma borda: drawer, sheet, trilho de toast. Viagem maior que
`directionalVariants` (aquele é uma dica de 6px num popup ancorado; este é o
painel de fato entrando na tela) e assenta no tier `slow` por padrão, pela mesma
razão que um sheet. Opções: `distance` (`24`), `tier` (`spring.slow`), `fade`
(`true`).

### 3.4b Curvas e durações — a metade tween

O spring é o padrão para tudo que viaja. Para o que é uma *forma no tempo* —
sequência de keyframes, crossfade de cor ou blur, loop de velocidade constante —
o sistema tem a contraparte baseada em `duration`:

```ts
ease = {
  standard, decelerate, accelerate, emphasized, anticipate, linear
}
duration = { instant: 0, fast: 0.18, moderate: 0.28, slow: 0.42, slower: 0.6 }
```

`duration.fast/moderate/slow` são o gêmeo JS exato de `--duration-*` no
`global.css` e **movem junto** com eles (§3.8). `duration.slower` não tem par CSS
— é para tweens de tier `gentle`. As curvas `ease` são **JS-only**: o lado CSS
mantém só `--ease-spring` / `--ease-lift`, porque aquele setup do Tailwind v4
descarta uma entrada `--ease-*` nomeada que nada mais no arquivo referencia.

- `decelerate` — começa rápido, pousa suave: para algo *entrando*.
- `accelerate` — começa suave, sai rápido: para algo *saindo* do quadro.
- `emphasized` — start expressivo e cauda longa, para um elemento herói.
- `anticipate` — recua antes de avançar: a batida de antecipação dos 12
  princípios, para um confirm brincalhão.

### 3.4c Helpers de interação

**`pressable(options?)`** — feedback de press/hover para uma superfície que é ela
própria o alvo (card, tile, botão custom): flutua e escala um fio no hover,
afunda no tap, no spring `fast`. Espalhe o retorno num elemento `motion`. Passe
`reduced` (de `useReducedMotion()`) para colapsar a nada — cue de press é pura
decoração.

**`useMagneticPull(strength?)`** — magnetismo de cursor para botão ou card: o
elemento inclina em direção ao ponteiro no hover e volta com spring no leave, no
tier `snappy`. Retorna `{ ref, style, handlers }`. No-op sob
`prefers-reduced-motion`.

**`withReducedMotion(variants)`** — filtro de acessibilidade para o padrão
*tiered, não tudo-ou-nada*: quando `useReducedMotion()` é `true`, passe um objeto
de variants por aqui para manter o crossfade de opacidade (seguro,
não-vestibular) e derrubar todo transform, blur e rotação. O elemento ainda
aparece e some com intenção — só não viaja.

**`marqueeTransition(seconds?)`** — loop de velocidade constante para marquee /
faixa de logos / ticker. Pareie com um track transladado por exatamente uma
cópia do conteúdo.

### 3.5 Stagger

```ts
stagger = { fast: 0.02, moderate: 0.04, slow: 0.06, playful: 0.08 }
```

`staggerContainer(tier?, delayChildren?)` retorna os `Variants` do container.
`liftVariants` é o filho natural — as linhas chegam com o mesmo caráter do painel
ao redor.

`playful` aqui é a contraparte de grupo do `spring.playful`: um intervalo largo
o bastante para cada item ler como uma chegada própria, para sequências que
*são* a comemoração, não uma lista que por acaso anima.

### 3.6 Cues de atenção

`attentionShake`, `attentionPulse` e `attentionGlow` são cues, não tiers: sem
offset, sem elevação, nada com que compor. Interrompem um componente que o
usuário já está olhando — um campo que acabou de falhar validação, um total que
mudou embaixo dele, uma linha que precisa de um olhar.

```ts
attentionShake  // x: [0, -4, 4, -4, 4, 0], 0.32s easeInOut  — algo quebrou
attentionPulse  // scale: [1, 1.03, 1], 0.4s easeInOut       — algo mudou
attentionGlow   // um anel que floresce e some, 0.7s easeOut — olhe aqui
```

`attentionGlow` usa `var(--color-ring)`, então herda a paleta ativa.

Acionados alternando `animate` para o nome da variante e de volta. Feitos para
viver dentro de componentes de formulário e feedback existentes, não para serem
envolvidos em um componente próprio.

### 3.7 Saída guardada

Um portal precisa continuar montado durante seu tween de saída, mas uma aba em
background ou throttled pode travar a animação e `onAnimationComplete` pode nunca
disparar.

```tsx
const { mounted, onAnimationComplete } = useExitAnimation(open, spring.moderate)
```

Mantém os dois: o callback quando funciona, e um timer dimensionado pelo
`exit.duration` do próprio tier quando não. `exitFallbackMs(tier)` é essa duração
em ms mais 100ms de folga.

Detalhe de implementação relevante: o hook espelha `mounted` em um ref e lê o ref
dentro do effect. Ler o state ali fecharia sobre um valor obsoleto ou puxaria
`mounted` para a lista de dependências — o que re-executa o effect na própria
atualização dele e re-arma o timer no meio da saída.

### 3.8 Contraparte CSS

Framer cobre o que o JavaScript dirige. Para transições CSS puras — preenchimento
de hover, anel de foco, mudança de cor — o mesmo caráter vive em duas variáveis
de tema:

```css
--ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
--duration-moderate: 280ms;
--duration-slow: 420ms;
--default-transition-duration: var(--duration-moderate);
--default-transition-timing-function: var(--ease-spring);
```

Esses dois batem com `spring.moderate` e `spring.slow` exatamente, e isso é
resultado e não coincidência: os dois lados foram afinados por sensação, de forma
independente, e os dois chegaram em 280ms e 420ms. **Mantenha-os em passo** — um
tier e sua contraparte CSS se afastando é um preenchimento de hover e o painel em
que ele está discordando visivelmente sobre a velocidade desta interface.

Como `--default-transition-*` está definido, qualquer `transition-colors` ou
`transition-opacity` sem timing próprio já herda isso. Só se escreve
`duration-moderate ease-spring` explicitamente quando uma regra define o timing
dela.

> **Armadilha do Tailwind v4 + Turbopack, documentada:** não existe
> `--duration-fast`. Esta configuração descarta silenciosamente a classe
> utilitária de uma entrada de tema `--duration-*` nomeada sempre que nada no CSS
> do próprio arquivo também a referencia via `var()`. `moderate` e `slow`
> sobrevivem só porque `--default-transition-duration` e a regra de
> view-transition acabam referenciando as duas assim. Um tier `fast` não tem
> referência natural, então nunca compilava — ele está escrito literalmente como
> `duration-180` nos dois call sites (`docs-sidebar.tsx`, `mobile-nav.tsx`).

### 3.9 O hover lift

Botão, badge e tiles `Elevated` clicáveis sobem levemente sob o cursor. Isso é um
token, `hover-lift`, não uma receita por componente:

```css
--ease-lift: cubic-bezier(0.4, 0, 0.2, 1);
--duration-lift: 320ms;
--duration-lift-press: 120ms;
```

A curva **não** é `--ease-spring`. Aquela cobre ~90% do percurso nos primeiros
15% do tempo — certo para um painel cruzando distância real, errado para um hover
de 2px, onde lê como espasmo em vez de elevação. `--ease-lift` acelera antes de
desacelerar, então o controle flutua para cima em vez de saltar.

**O utilitário é dono da lista de propriedades de transição também**, o que é
incomum para um token:

```css
@utility hover-lift {
  --lift: 2px;
  transition-property:
    translate, scale, box-shadow, background-color, border-color,
    border-radius, color, opacity;
  transition-duration: var(--duration-lift);
  transition-timing-function: var(--ease-lift);

  @media (hover: hover) {
    &:hover { translate: 0 calc(var(--lift) * -1); }
  }

  &:active {
    translate: 0 0;
    transition-duration: var(--duration-lift-press);
  }

  @media (prefers-reduced-motion: reduce) {
    transition-property: background-color, border-color, color, opacity;
    &:hover, &:active { translate: none; scale: none; }
  }
}
```

Isso não é arrumação. Tailwind v4 compila `-translate-y-0.5` para a propriedade
`translate` e `scale-[0.98]` para `scale` — nenhuma das duas coberta por
`transition-[…,transform]`. Um call site que lista `transform`, como todos os
nossos listavam, ganha um salto sem transição e nenhum erro que explique. Dobrar
a lista para dentro do token é a única forma de esse engano não voltar.

Três garantias que o utilitário carrega sozinho, para não serem repetidas no call
site: o guard `@media (hover: hover)` (senão `:hover` trava depois de um toque em
touch), a regra `:active` ordenada depois de `:hover` para vencer em
especificidade igual, e o guard de `prefers-reduced-motion`.

A distância é uma custom property local:

```tsx
<span className="hover-lift [--lift:1px]" />   // badge: controle menor, lift menor
<a className="hover-lift [--lift:0px]" />      // variante link: opta por sair
```

### 3.10 Reduced motion

- `hover-lift` já trata sozinho.
- Blocks e componentes com animação própria usam `useReducedMotion` do Framer.
- `PageTransitions` verifica em JS e nunca inicia uma view transition quando a
  preferência está ativa — por isso a regra `::view-transition-*` no CSS não
  precisa de guard próprio.

---

## 4. Cor

### 4.1 Base semântica

Tokens shadcn padrão em OKLCH: `--background`, `--foreground`, `--card`,
`--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`,
`--border`, `--input`, `--ring`, `--chart-1..5`, e a família `--sidebar-*`.

Dois desvios deliberados do shadcn stock, ambos em light mode:

**`--background` em `oklch(0.968 0.004 264)`.** Ver 2.3 — branco puro invertia a
escada de superfícies.

**`--secondary` / `--muted` / `--accent` em `oklch(0.938 0 0)`.** O shadcn stock
pareia esses com um `--background` branco puro, um degrau de 0.03 abaixo. Baixar
o `--background` para 0.968 sem acompanhar aqui colapsou esse degrau para ~0.002
— todo hover e fill construído sobre esses tokens (ghost button, link de nav,
item de menu) ficou visualmente mudo em light mode. Deslocados pelos mesmos 0.032
que `--background` moveu, o intervalo original de 0.03 volta, e com ele a
affordance de hover.

### 4.2 Paletas

Doze paletas trocáveis, publicadas como `registry:theme`:

`palette-amber`, `palette-azure`, `palette-copper`, `palette-emerald`,
`palette-fuchsia`, `palette-ink`, `palette-lime`, `palette-rose`, `palette-sky`,
`palette-slate`, `palette-teal`, `palette-violet`

Cada uma sobrescreve `primary`, `primary-foreground`, `accent-foreground`,
`chart-1..5`, `sidebar-primary`, `sidebar-primary-foreground` e `sidebar-ring`
para light e dark. Nenhuma toca na escada de superfícies — a paleta muda o
acento, não a profundidade.

---

## 5. Tipografia

Três papéis, mapeados de fontes carregadas por `next/font` no `<html>`:

```css
--font-sans:    var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--font-display: var(--font-satoshi), var(--font-inter), ui-sans-serif, …;
--font-mono:    var(--font-geist-mono), ui-monospace, monospace;
--font-logo:    "Trebuchet MS", ui-sans-serif, system-ui, sans-serif;
```

- **Inter Variable** (local) — corpo e UI
- **Satoshi Variable** (local, Fontshare FFL) — display
- **Geist Mono** (pacote `geist`) — código e dados

As variáveis de origem são nomeadas pela fonte (`--font-satoshi`), e as de tema
pelo papel (`--font-display`). A indireção é o ponto.

**Regra:** componentes do registry **nunca nomeiam uma fonte**. Eles usam
`font-sans` / `font-mono` e herdam o que o app hospedeiro mapeou, ficando neutros
quando instalados em outro projeto. `--font-display` é do site de docs, não da
biblioteca.

Nos docs, `.prose :is(h1, h2)` recebe a face display — com guard `:not(.not-prose)`
para a regra não vazar sobre componentes do registry renderizados dentro de
canvases de preview, que precisam ficar tipograficamente neutros.

---

## 6. Raio

Um valor base, seis derivados por `calc`:

```css
--radius: 0.65rem;

--radius-sm:  calc(var(--radius) - 4px);
--radius-md:  calc(var(--radius) - 2px);
--radius-lg:  var(--radius);
--radius-xl:  calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 10px);
--radius-3xl: calc(var(--radius) + 18px);
```

Quatro presets no customizador de tema, todos redefinindo apenas `--radius`:

| Id | Label | Valor |
|---|---|---|
| `sharp` | Sharp | `0rem` |
| `subtle` | Subtle | `0.375rem` |
| `default` | Default | `0.65rem` |
| `round` | Round | `1rem` |

Como os seis derivados são `calc` sobre a base, trocar o preset reescala a escada
inteira e mantém as proporções.

---

## 7. O registry

Segue a spec shadcn. URL de produção: `https://matos-ui.com/r`. Local: `:4000/r`.

```bash
npx shadcn@latest add https://matos-ui.com/r/elevated.json
```

**Tipos de item:** `registry:ui`, `registry:example`, `registry:block`,
`registry:lib`, `registry:hook`, `registry:theme`.

**Estado atual:** 47 itens `registry:ui` publicados (67 arquivos em `ui/`, a
diferença sendo primitivos internos como `button`, que continua disponível como
dependência de registry mas não é documentado avulso). Quatro blocks:
`dashboard-overview-01`, `profile-settings-01`, `sidebar-surface-01`,
`sign-in-01`. Doze paletas. Três libs (`motion-tokens`, `surface-classes`,
`surface-context`). Um hook (`use-mobile`).

**Reescrita de import no build.** Componentes do registry importam de
`@/registry/new-york-v4/ui/…`; o build reescreve para
`@/components/matos-ui/…` no JSON final.

**Arquivos gerados — não editar à mão:** `apps/docs/registry.json`,
`apps/docs/registry/__index__.tsx`, `apps/docs/public/r/*.json`,
`apps/docs/public/r/styles/**`.

### Convenções de block

- Imports internos do block usam caminho relativo (`./components/x`, `./data`),
  para continuarem resolvendo depois da instalação.
- Componentes do Matos UI vêm de `@/registry/new-york-v4/ui/…` e são declarados
  em `registryDependencies`. **Nunca duplicar** Button, Card, Chart.
- Reflow por container query (`@container/<name>` + `@md/<name>:`), não por
  breakpoint de viewport.
- Só tokens semânticos do tema.
- `useReducedMotion` respeitado.

---

## 8. Camada MCP

`@matos-ui/mcp` — servidor MCP read-only e livre de efeito colateral. Nenhuma
ferramenta executa shell, escreve arquivo ou instala nada. Se um agente instala um
componente, quem roda `shadcn add` são as ferramentas dele.

```bash
claude mcp add matos-ui -- npx -y @matos-ui/mcp@latest
```

Ferramentas que consultam o registry precisam de `MATOS_UI_REGISTRY_URL`.

**Apoiadas no registry:** `list_components`, `list_blocks`, `list_palettes`,
`get_item`, `get_install_command`, `find_component_for` (busca por palavra-chave
sobre nome/descrição/dependências — sem embeddings).

**Vindas dos docs, lidas ao vivo do GitHub:** `get_surface_philosophy` (lê
`elevated.mdx`), `get_motion_guidance` (retorna o `motion-tokens.ts` real —
código e JSDoc), `get_theme_options` (paletas do registry + presets de raio da
fonte dos docs).

**A decisão de design aqui:** as ferramentas de fundação leem o arquivo-fonte em
vez de servir um resumo escrito à mão. Um resumo é uma segunda cópia que
inevitavelmente se afasta do que está publicado. E a razão de `surface` e `motion`
serem ferramentas próprias, e não só linhas em `get_theme_options`: um agente que
recebe apenas a lista de valores usa os valores certos com a lógica errada —
aplica sombra para elevar em dark mode, escolhe timing arbitrário. As **regras**
precisam ser recuperáveis, não só os números.

`get_theme_options` usa `Promise.allSettled` deliberadamente: os presets de raio
não dependem de configuração, então continuam retornando mesmo quando a consulta
de paletas falha por falta de `MATOS_UI_REGISTRY_URL`.

---

## 9. Contrato de componente

O que um componente cumpre para entrar no registry.

1. **Nenhuma fonte nomeada.** `font-sans` / `font-mono` apenas.
2. **Nenhum fundo de elevação fixo.** Painéis que se elevam usam `Elevated` com
   `offset`, não `bg-popover`.
3. **Nenhum timing local de spring.** Tiers vêm de `spring` ou de
   `motionForOffset`. Nenhum `stiffness`/`damping` avulso.
4. **Nenhuma duração CSS solta** onde `--duration-*` serve. Exceção documentada:
   `duration-180`, por conta de 3.8.
5. **`hover-lift` para qualquer elevação sob o cursor** — nunca uma lista de
   `transition-property` escrita à mão (ver 3.9).
6. **`ref` encaminhada**, `className` mesclada via `cn`, `data-slot` presente.
7. **`prefers-reduced-motion` coberto**, pelo utilitário ou por
   `useReducedMotion`.
8. **Saída animada guardada** por `useExitAnimation` quando houver portal.
9. **Registrado nos quatro lugares:** fonte em `ui/`, demo em `examples/`, item
   em `registry-ui.ts`, demo em `registry-examples.ts`, e página MDX em
   `content/docs/components/`.
10. **Build verde:** `bun run --cwd apps/docs registry:build` e `types:check`.

---

## 10. Divergências conhecidas

Encontradas ao confrontar docs contra código. Precisam de correção.

**`elevated.mdx` mostra valores de superfície dark desatualizados.** O snippet de
instalação manual traz `--surface-1: #171717`, `--surface-2: #1e1e1e`,
`--surface-3: #252525` e o comentário "+7 lightness per step, up to #484848". O
`global.css` real usa `#191919 → #242424 → #2e2e2e → … → #616161`, espaçados em
CIE L\*. Quem seguir a instalação manual monta uma escada diferente da que o
`Elevated` foi calibrado para produzir.

**Comentário de `global.css` desatualizado sobre bounce.** O bloco que introduz
`--ease-spring` afirma que "spring.fast e spring.moderate são ambos criticamente
amortecidos (bounce: 0)". O `motion-tokens.ts` já os move para `0.1` e `0.15`, e
o próprio JSDoc de lá explica por quê. O comentário do CSS ficou para trás.

**`motion.mdx` está atrás de `motion-tokens.ts`.** O frontmatter diz "quatro
spring tiers" e a tabela lista cinco; o código agora tem **sete** (`snappy` e
`gentle` adicionados) mais os tokens tween (`ease`, `duration`) e os helpers
`revealVariants` / `slideVariants` / `pressable` / `useMagneticPull` /
`withReducedMotion` / `marqueeTransition` / `attentionGlow`, nenhum deles
documentado na página pública ainda.

**GUIDE.md aponta para `matos-ui.vercel.app`** nos templates de MDX e instalação,
enquanto README e docs usam `matos-ui.com`. Um componente novo criado a partir do
template nasce documentado com a URL antiga.

---

## 11. Stack

Monorepo Bun + Turborepo. `apps/docs` é Next.js com Fumadocs, servindo docs e
registry na porta 4000. `packages/mcp` é o servidor MCP, publicado como
`@matos-ui/mcp`. `packages/config` guarda o tsconfig base. Lint e format por
Biome. Componentes sobre Base UI + Framer Motion. Deploy por Docker rodando
`next start`, não imagem estática.

```bash
bun install
bun run dev                              # docs em :4000
bun run build                            # registry + next
bun run check                            # Biome
bun run --cwd apps/docs registry:build   # só o registry
bun run --cwd apps/docs types:check
```s
