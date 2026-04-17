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
│  [header solto]                     │    background diferenciado
│                                     │    border-radius grande (~20px)
│  ┌───────────────────────────────┐  │  ← inner panel
│  │  conteúdo principal           │  │    background primário
│  │  (tabela, chart, form, etc.)  │  │    border-radius menor (~12px)
│  └───────────────────────────────┘  │    margin lateral (~10-12px)
│                                     │
│  [footer solto]                     │
└─────────────────────────────────────┘
```

### 3 camadas obrigatórias

| Camada | Papel | CSS-chave |
|---|---|---|
| **Outer card** | Container externo com fundo diferenciado | `background: var(--color-background-secondary)` · `border-radius: 20px` · `border: 0.5px solid var(--color-border-tertiary)` |
| **Inner panel** | Bloco recuado que "flutua" dentro do outer | `background: var(--color-background-primary)` · `border-radius: 12px` · `margin: 0 10px` · `border: 0.5px solid var(--color-border-tertiary)` |
| **Header / Footer soltos** | Ações e metadados fora do inner panel | `padding: 14px 18px` · sem `border` · separação só por espaçamento |

> **Regra de ouro:** a profundidade vem do contraste de fundo entre outer e inner, não de bordas ou sombras.
> Se você adicionou um `box-shadow`, algo está errado.

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
  background: var(--color-background-secondary);
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

---

## Checklist de implementação

- [ ] Outer card tem `background` diferente do inner panel
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