---
name: inset-card-ui
description: >
  Guia para construir o padrão de UI "inset card" (também chamado de "nested card with detached header/footer") —
  o estilo usado em dashboards modernos como Stripe, Vercel e Linear. Use esta skill sempre que o usuário pedir
  um card com painel interno recuado, header ou footer soltos, data table com inset, dashboard com camadas de
  fundo, ou qualquer componente que descreva profundidade visual sem sombras. Também deve ser ativada quando
  o usuário mencionar termos como "inner panel", "outer card", "card aninhado", "bloco recuado dentro do card",
  "footer solto", "header solto", ou "padrão Stripe/Vercel/Linear".
---

# Inset Card UI Pattern

O padrão **inset card** cria profundidade visual usando camadas de fundo e geometria — sem sombras, sem gradientes.
É o estilo dominante em produtos como Stripe Dashboard, Vercel Analytics e Linear.

---

## Anatomia do padrão

```
┌─────────────────────────────────────┐  ← outer card
│  [header solto]  ou                 │    background diferenciado
│  [titulo]                           │    border-radius grande (~20px)
│  ┌───────────────────────────────┐  │  ← inner panel
│  │  conteúdo principal           │  │    background primário
│  │  (tabela, chart, form, etc.)  │  │    border-radius menor (~12px)
│  └───────────────────────────────┘  │    margin lateral (~10-12px)
│                                     │
│  [footer solto]  ou                 │
│   [button] [link]                   │
└─────────────────────────────────────┘
```

### 3 camadas obrigatórias

| Camada | Papel | CSS-chave |
|---|---|---|
| **Outer card** | Container externo com fundo diferenciado + textura sutil de pontos | `background-color: var(--color-background-secondary)` · `background-image: var(--inset-card-dot-pattern)` · `border-radius: 20px` · `border: 0.5px solid var(--color-border-tertiary)` |
| **Inner panel** | Bloco recuado que "flutua" dentro do outer | `background: var(--color-background-primary)` · `border-radius: 12px` · `margin: 0 10px` · `border: 0.5px solid var(--color-border-tertiary)` |
| **Header / Footer soltos** | Ações e metadados fora do inner panel | `padding: 14px 18px` · sem `border` · separação só por espaçamento |

> **Regra de ouro:** a profundidade vem do contraste de fundo entre outer e inner, não de bordas ou sombras.
> Se você adicionou um `box-shadow`, algo está errado.
> O padrão de pontos do outer card é uma textura por cima do fundo, nunca um fundo próprio que troca a cor base.

---

## Diferença em relação ao flat card

| | Flat card | Inset card |
|---|---|---|
| Profundidade | Bordas | Camadas de fundo |
| Header/footer | Separados por `border-top/bottom` | Soltos, só espaçamento |
| Conteúdo | Vai até as bordas do card | Recuado com `margin` lateral |
| Referências | Notion, Google Analytics | Stripe, Vercel, Linear |

---

## Template base (HTML/CSS)

```html
<div class="outer-card">

  <!-- HEADER SOLTO -->
  <div class="loose-header">
    <div>
      <span class="header-title">Título do card</span>
      <span class="header-sub">subtítulo ou metadata</span>
    </div>
    <div class="header-actions">
      <!-- botões, filtros, selects -->
    </div>
  </div>

  <!-- INNER PANEL -->
  <div class="inner-panel">
    <!-- tabela, chart, lista, form -->
  </div>

  <!-- FOOTER SOLTO -->
  <div class="loose-footer">
    <span class="footer-info">Mostrando 1–8 de 248</span>
    <div class="pagination"><!-- botões de página --></div>
  </div>

</div>
```

```css
.outer-card {
  background-color: var(--color-background-secondary);
  background-image: var(--inset-card-dot-pattern);
  background-size: 48px 48px;
  background-repeat: repeat;
  background-clip: padding-box;
  border-radius: 20px;
  border: 0.5px solid var(--color-border-tertiary);
  overflow: hidden;
  font-family: var(--font-sans);
}

/* header solto — sem border, só padding */
.loose-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 10px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.header-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: 8px;
}

/* inner panel — recuado com margin lateral */
.inner-panel {
  background: var(--color-background-primary);
  border-radius: 12px;
  border: 0.5px solid var(--color-border-tertiary);
  margin: 0 10px;   /* ← o recuo que cria o "inset" */
  overflow: hidden;
}

/* footer solto — sem border, só padding */
.loose-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px 14px;
}
```

---

## Variações comuns

### Data table com inset

O caso mais comum. A tabela fica 100% dentro do inner panel.
O header solto carrega título + botões de ação (filtrar, exportar, adicionar).
O footer solto carrega paginação e contagem de registros.

```css
/* thead da tabela herda o fundo do inner panel ou usa secondary */
.inner-panel thead th {
  background: var(--color-background-secondary);
  border-bottom: 0.5px solid var(--color-border-tertiary);
  padding: 8px 16px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.inner-panel tbody tr {
  border-bottom: 0.5px solid var(--color-border-tertiary);
}

.inner-panel tbody tr:last-child { border-bottom: none; }
.inner-panel tbody tr:hover { background: var(--color-background-secondary); }
.inner-panel tbody td { padding: 11px 16px; font-size: 13px; }
```

### Metric card com inset (estilo Stripe)

O inner panel contém o gráfico/sparkline.
O header solto exibe o label e o número principal.
O footer solto exibe links como "Ver detalhes →".

```html
<div class="outer-card" style="padding-bottom: 0">
  <div class="loose-header" style="flex-direction: column; align-items: flex-start">
    <span class="header-title">Total sign-ups</span>
    <span style="font-size: 28px; font-weight: 500; color: var(--color-text-primary)">1,004</span>
    <span class="header-sub">All time</span>
  </div>
  <div class="inner-panel">
    <!-- sparkline / chart -->
  </div>
  <div class="loose-footer">
    <span class="footer-info">Atualizado agora</span>
    <a style="font-size: 13px; color: var(--color-text-info)">Ver todos →</a>
  </div>
</div>
```

### Sem header (só footer solto)

Quando o card é autoexplicativo, o header pode ser omitido.
O inner panel começa logo após o `padding-top` do outer card.

```html
<div class="outer-card" style="padding-top: 10px">
  <div class="inner-panel"><!-- conteúdo --></div>
  <div class="loose-footer"><!-- ações --></div>
</div>
```

---

## Erros comuns a evitar

| Erro | Por quê é errado | Correção |
|---|---|---|
| `box-shadow` no inner panel | Destrói a sensação flat | Remova. Use só contraste de fundo |
| SVG de pontos com `<rect>` de fundo | Troca a cor do outer card e quebra o tema claro/escuro | Remova o `<rect>` e use o SVG só como `background-image` transparente |
| `border-bottom` no header solto | Transforma em flat card | Remova. Só padding separa |
| `margin: 0` no inner panel | O "inset" desaparece | Use pelo menos `margin: 0 10px` |
| `border-radius` igual no outer e inner | Não cria hierarquia visual | Outer ≥ 16px, inner ≤ 14px |
| `padding-bottom` no outer card quando há footer | Cria gap extra embaixo do inner | Use `padding-bottom: 0` no outer |
| `overflow: hidden` ausente no inner panel | Conteúdo vaza para fora do border-radius | Sempre adicione `overflow: hidden` |

---

## Tokens de design recomendados

Estes valores usam as CSS variables do sistema host (claude.ai / qualquer design system compatível):

```css
/* backgrounds */
--outer-bg:  var(--color-background-secondary);   /* cinza/escuro suave */
--inner-bg:  var(--color-background-primary);      /* branco ou mais claro */
--inset-card-dot-pattern: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cg opacity='0.18'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 11H11V12H12V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 23H11V24H12V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11 35H12V36H11V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 47H11V48H12V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M23 11H24V12H23V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 23H23V24H24V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M23 35H24V36H23V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 47H23V48H24V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M35 11H36V12H35V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M36 23H35V24H36V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M35 35H36V36H35V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M36 47H35V48H36V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M47 11H48V12H47V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M48 23H47V24H48V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M47 35H48V36H47V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M48 47H47V48H48V47Z' fill='%23A1A1AA'/%3E%3C/g%3E%3C/svg%3E");

/* bordas */
--card-border: 0.5px solid var(--color-border-tertiary);

/* border-radius */
--outer-radius: 20px;
--inner-radius: 12px;

/* espaçamentos */
--header-padding: 16px 18px 10px;
--footer-padding: 10px 18px 14px;
--panel-margin:   0 10px;
```

### Textura padrão do outer card

Use o padrão de pontos apenas no **outer card**. Ele deve ser transparente e aplicado por cima do background base:

```css
.outer-card {
  background-color: var(--outer-bg);
  background-image: var(--inset-card-dot-pattern);
  background-size: 48px 48px;
  background-repeat: repeat;
  background-clip: padding-box;
}
```

Não aplique essa textura no inner panel. O inner panel precisa continuar limpo para manter legibilidade de formulários, tabelas e conteúdo denso.

---

## Checklist de implementação

- [ ] Outer card tem `background` diferente do inner panel
- [ ] Outer card usa a textura de pontos padrão como `background-image`
- [ ] SVG/textura do outer card é transparente e não substitui a cor base
- [ ] Inner panel tem `margin` lateral (mínimo `0 10px`)
- [ ] Inner panel tem `border-radius` menor que o outer
- [ ] Inner panel tem `overflow: hidden`
- [ ] Header solto **não** tem `border-bottom`
- [ ] Footer solto **não** tem `border-top`
- [ ] Nenhum `box-shadow` em nenhuma camada
- [ ] Outer card tem `overflow: hidden` para respeitar o border-radius externo
- [ ] `padding-bottom: 0` no outer card quando o inner panel encosta na borda inferior

---

## Referências visuais

Produtos que usam este padrão consistentemente:
- **Stripe Dashboard** — metric cards com sparkline + footer de links
- **Vercel Analytics** — tabelas e gráficos com inset panel
- **Linear** — cards de issue list com header/footer soltos
- **Resend** — dashboard de emails com nested cards
