# Arquitetura do protótipo Portal IRMEN Jarvis

Este documento tem duas partes que **não devem ser confundidas**:

- **Parte A** descreve como *este protótipo* é construído de fato. É uma maquete de front-end em JavaScript puro, feita para validar visual e fluxo.
- **Parte B** resume a arquitetura *proposta para o Portal real* (detalhada no "Plano técnico de implementação") e lista o que do protótipo pode ou não ser reaproveitado.

O código do protótipo não é base para produção. Ele serve como especificação visual e de comportamento.

---

## Parte A · Arquitetura real do protótipo

### A1. Visão geral

- Página única (SPA) sem framework, sem bundler e sem etapa de build.
- Quatro arquivos próprios carregados por `<script>` clássico, na ordem `echarts.min.js` → `data.js` → `screens.js` → `app.js`.
- Cada arquivo é uma IIFE que publica um objeto em `window` (`IR`, `IRH`, `SCREENS`). Não usa módulos ES.
- Renderização por template string: cada tela é uma função `(st) => string HTML` e o app troca o `innerHTML` do conteúdo a cada mudança de estado.
- Nenhuma chamada de rede além dos próprios arquivos estáticos. Não usa `fetch`, XHR, WebSocket nem service worker.

```
site/
├── index.html          estrutura (shell) + todo o CSS (tokens, componentes, responsivo, tema claro)
├── data.js             dados fictícios, ícones SVG, perfis, menu, fluxos  → window.IR
├── screens.js          16 funções de tela + helpers de formatação          → window.SCREENS, window.IRH
├── app.js              estado, render, eventos, gráficos, diálogos, tour, rede neural
└── vendor/
    ├── echarts/        echarts.min.js 5.5.0 + LICENSE + NOTICE
    └── fonts/          fonts.css + 16 woff2 + licenças OFL
```

Tamanhos: `index.html` 27 KB, `data.js` 27 KB, `screens.js` 73 KB, `app.js` 37 KB, ECharts 1,0 MB, fontes cerca de 0,3 MB.

### A2. `index.html` (shell e estilos)

Marcação fixa:

| Elemento | Papel |
|---|---|
| `canvas#neural` | Fundo de rede neural, `position:fixed`, `aria-hidden` |
| `aside#side.side` | Menu lateral (gaveta abaixo de 860 px) |
| `header#top.top` | Barra superior |
| `main#view.view` | Conteúdo da tela atual |
| `div#overlay` | Paleta e diálogos (recebe HTML sob demanda) |
| `div#tourbar` | Faixa da demonstração guiada |
| `div#toast` | Avisos, com `aria-live="polite"` |

CSS (cerca de 340 linhas, num único `<style>`):

- **Tokens em `:root`**: fundo (`--bg`, `--bg-2`), painéis translúcidos (`--panel` com alfa 0,78 e `backdrop-filter: blur(10px)`), linhas, texto (`--fg`, `--fg-2`, `--fg-3`), ação vermelha `--brand #ef3f4f`, ciano `--arc #3fd0ff`, estados (`--good`, `--warn`, `--crit`), paleta de gráficos `--c1` a `--c5`, cores da rede (`--net`, `--net-2`), fontes (`--f-display` Chakra Petch, `--f-body` IBM Plex Sans, `--f-mono` JetBrains Mono), raio `--r: 10px`, largura do menu `--side: 252px`.
- **Tema claro (Slate)**: `:root[data-theme="light"]` redefine os mesmos tokens. O escuro é o padrão e não depende do sistema operacional.
- **Componentes**: `.panel` (vidro), `.panel.hud` (cantos em L ciano), `.btn` e `.btn.pri` (chanfro por `clip-path` e brilho "laser" por `::after` que atravessa no hover), `.kpi`, `.pill`, `.seg`, `.chip`, `.tbl`/`.tbl-wrap`, `.kanban`/`.kcol`/`.kcard`, `.chat`, `.dlg`, `.pal`, `.tour`, `.orb` (esfera animada da Ava), `.empty`.
- **Grades**: `.g2`, `.g3`, `.g4`, `.g6` e várias grades declaradas direto no HTML das telas (`style="grid-template-columns:…"`).
- **Responsivo**: quebras em 1280 px (g6 vai a 3 colunas, contexto do chat some), 1024 px (g3/g4 vão a 2), 860 px (menu vira gaveta, g2/g3/g4 viram 1 coluna, g6 vai a 2, chat empilha) e 420 px (g6 vai a 1). As grades declaradas no próprio HTML **não** são afetadas por essas regras; ver o relatório de verificação.
- **Acessibilidade de movimento**: `@media (prefers-reduced-motion: reduce)` zera animações e transições.
- **Foco**: `:focus-visible` com contorno ciano de 2 px.

### A3. `data.js` (dados e catálogo)

Publica `window.IR` com:

| Chave | Conteúdo |
|---|---|
| `icon(nome)` | Gera SVG em linha a partir de um dicionário de caminhos (`P`). Não há biblioteca de ícones |
| `ROLES` | 5 perfis fictícios (rótulo, pessoa, unidade, nível, XP, título) |
| `NAV` | Menu: 6 grupos, 16 itens, cada um com `id` da tela, ícone, status de produto (`pronto`, `polir`, `novo`, `futuro`), contador opcional e `roles` (quem vê) |
| `PHASES`, `PHASE_HINT` | As 8 fases do funil |
| `ESTEIRA`, `BANKS`, `MACHINES` | Esteira da Mesa (6 fases), 5 bancos com taxa e SLA, modelos SANY com preço |
| `ORGS`, `DEALS`, `TASKS`, `CONVS`, `INSTANCES`, `TICKETS`, `USERS` | Registros fictícios das telas |
| `CAPS`, `CAP_ROLES` | Matriz de capabilities exibida em Usuários |
| `TEAMS`, `SELLERS`, `CHALLENGES`, `BADGES` | Gamificação |
| `MODULES` | Status de cada módulo no Mapa do produto |
| `FLOWS` | 4 demonstrações guiadas: lista de passos `[tela, seleção, texto]` |

Os dados são mutáveis em memória (o Kanban altera `DEALS[i].ph`), sem persistência.

### A4. `screens.js` (telas)

Publica `window.SCREENS` com 16 funções puras de leitura: `painel`, `ava`, `funil`, `crm`, `tarefas`, `simulador`, `mesa`, `operacoes`, `inbox`, `whatsapp`, `suporte`, `bi`, `arena`, `usuarios`, `config`, `blueprint`. Cada uma recebe o estado `st` e devolve HTML.

Também publica `window.IRH` com helpers: `brl` (moeda), `mi` (milhões), `org(id)`, `esc` (escape de HTML), `spark` (minigráfico SVG), `kpi` (cartão de KPI). O Painel usa a tabela `PAINEL` com textos e KPIs por perfil; Admin reaproveita o painel da Mesa.

Os gráficos ECharts não são criados aqui: a tela só deixa um `<div class="chart" id="ch-…">` reservado.

O simulador calcula a parcela em linha (tabela Price com a taxa fictícia de cada banco, entrada e prazo do estado).

### A5. `app.js` (comportamento)

**Estado** num único objeto `st`:

```js
{ screen, role, funilView, orgSel, conv, biTab, cfgTab,
  sim: { m, q, ent, prazo }, tour, theme }
```

- `role` é lido e gravado no `localStorage` (`irmen-role`), com `try/catch`.
- `screen` inicial vem do `location.hash`, se existir uma tela com aquele nome.
- O tema não fica em `st`: é o atributo `data-theme` do `<html>` (ausente = escuro).

**Ciclo de render**: `render()` descarta os gráficos existentes, refaz menu e barra superior, troca o `innerHTML` de `#view` com `SCREENS[st.screen](st)`, roda o pós-render da tela (`AFTER[tela]()`, que cria os gráficos) e redesenha a faixa do tour. `go(id)` atualiza o hash com `history.replaceState`, fecha a gaveta e chama `render()`.

**Permissão visual**: `canSee(item)` só esconde itens do menu e da paleta. Não há bloqueio de rota.

**Eventos**: delegação global no `document` para `click`, `change`, `input`, `submit`, `keydown` e eventos de arrastar. Os elementos se identificam por atributos `data-*`:

| Atributo | Efeito |
|---|---|
| `data-go` / `data-pgo` | Navegar (o segundo também fecha a paleta) |
| `data-fv`, `data-bitab`, `data-cfg` | Trocar visão do funil, aba do BI, aba de Configurações |
| `data-org`, `data-conv` | Selecionar organização ou conversa |
| `data-act` | Abrir diálogo (`convite`, `desafio`, `meta`, `ticket`, `lead`) |
| `data-flow`, `data-tour` | Iniciar fluxo guiado / Anterior, Próximo, Encerrar |
| `data-palette`, `data-ask` | Abrir paleta / perguntar à Ava |
| `data-theme-toggle`, `data-notif`, `data-open-menu`, `data-close-menu`, `data-close`, `data-scrim` | Tema, notificações, gaveta, fechar sobreposições |
| `.seg button`, `.chip` | Marcar opção ativa (só visual) |
| `.tk` (checkbox) | Concluir tarefa e mostrar "+XP" |
| `#sim-m`, `#sim-q`, `#sim-ent`, `#sim-pr` | Entradas do simulador |
| `[data-composer]` | Formulário de chat local |

**Kanban**: HTML5 Drag and Drop (`dragstart`, `dragover`, `drop`). Soltar nas fases 7 e 8 (índices 6 e 7) é recusado com aviso. Não há suporte a toque nem teclado para mover cartões.

**Sobreposições**: `palette()` e `dialog(tipo)` injetam HTML em `#overlay`. Os diálogos são `<form>`; o `submit` fecha e mostra um toast. `Esc` fecha. Não há foco preso nem devolução do foco ao botão de origem.

**Toasts**: `toast(html, xp)` cria um item em `#toast` e remove após 3,2 s.

**Tour**: `startFlow(id)` define o perfil do fluxo, `stepTo(i)` navega e aplica a classe `.spot` (contorno ciano) num elemento-alvo por tela (`SPOT`), rolando até ele (rolagem instantânea se o movimento estiver reduzido).

**Gráficos (ECharts 5.5.0)**:
- `mk(id, fn)` inicializa no `div` reservado com renderer `canvas`, aplica uma base comum (`base()`) que lê as cores **dos tokens CSS em tempo de execução** (`getComputedStyle`), por isso mudam com o tema.
- 14 gráficos ao todo: medidor e barras (Painel), rosca de bancos (Mesa e BI), linhas (WhatsApp), barras, funil, barras horizontais e linha de meta (BI Comercial), barras empilhadas e rosca (BI Crédito), barras empilhadas e linha com alvo (BI Operação), barras (BI Perdas).
- `click` nos gráficos do BI chama `drill()`, que preenche a tabela de detalhamento com 4 negócios sorteados.
- `resize` da janela redimensiona todos. Cada `render()` descarta e recria (`dispose`).

**Rede neural** (IIFE `net` no fim do `app.js`):
- Canvas em tela cheia, até 110 pontos (densidade proporcional à área), `devicePixelRatio` limitado a 2.
- Pontos derivam devagar, são repelidos pelo ponteiro (raio de cerca de 148 px), ligam-se entre si até 130 px e ao ponteiro até 170 px. Cerca de 8% dos pontos usam a cor vermelha.
- Cores vêm de `--net` e `--net-2`; um `MutationObserver` em `data-theme` recolore.
- Pausa quando a aba fica oculta. Com `prefers-reduced-motion: reduce`, desenha um quadro estático e não anima.

### A6. Dependências

| Item | Versão | Uso | Licença |
|---|---|---|---|
| Apache ECharts | 5.5.0 (arquivo minificado completo) | Todos os gráficos | Apache-2.0 |
| Chakra Petch | via Fontsource 5.1.0, pesos 500/600/700 | Títulos, números | SIL OFL 1.1 |
| IBM Plex Sans | via Fontsource 5.1.0, pesos 400/500/600 | Texto | SIL OFL 1.1 |
| JetBrains Mono | via Fontsource 5.1.0, pesos 400/500 | Códigos, valores | SIL OFL 1.1 |

Sem outras dependências em tempo de execução. As APIs de navegador usadas são `localStorage`, `history.replaceState`, `matchMedia`, `MutationObserver`, Canvas 2D, HTML5 Drag and Drop e `requestAnimationFrame`.

### A7. Limitações estruturais (por desenho de protótipo)

- Re-render total a cada interação (simples, mas descarta foco, rolagem interna e gráficos).
- Estado global único e dados globais mutáveis.
- HTML montado por string; os dados são fixos e controlados, mas com dados reais seria preciso escapar tudo (existe `esc`, usado só em parte).
- Permissão por perfil apenas visual; rotas por `#hash` abrem qualquer tela.
- Sem testes automatizados no próprio protótipo (os scripts em `verificacao/` são externos).

---

## Parte B · Arquitetura proposta para o Portal real (resumo)

Fonte: "Portal IRMEN · Plano técnico de implementação". Esta parte é **proposta**, não está implementada em lugar nenhum deste pacote.

| Tema | Protótipo (Parte A) | Portal real proposto |
|---|---|---|
| Stack | HTML + JS puro, sem build | Next.js (já em produção na Vercel) + Supabase Postgres |
| Fonte da verdade | `data.js` em memória | Banco: tabelas, RPCs e políticas RLS; a tela só lê e chama RPC |
| Regras de negócio | Algumas no front (ex.: bloquear arraste para Formalização) | Todas no backend (RPC/RLS/capabilities); o front só reflete |
| Permissões | `canSee()` esconde menu | Capabilities por papel, checadas no servidor; rota sem permissão devolve 403 |
| Eventos e histórico | Toast "histórico registrado" | Tabela append-only `domain_events`; histórico e auditoria derivados dela |
| Métricas e BI | Números fixos | Catálogo de métricas com contrato (definição, fonte, filtro, dono), calculadas a partir dos eventos |
| Gamificação | XP fixo, toast "+XP" | `xp_ledger` idempotente, crédito só por evento confirmado |
| White label | Aba de marca sem efeito | `workspace_id`, configuração de marca e feature flags no banco; nenhuma marca no código |
| WhatsApp | Telas e números fictícios | Integração Cloud API oficial e provedor não oficial, com filas e roteamento |
| Ava | Respostas fixas | Serviço com acesso limitado ao que o usuário já pode ver; leitura documental com revisão humana |
| Estados de UI | Sem carregamento, erro ou validação | Obrigatórios em toda tela (critério de aceite) |
| Entrega | Arquivos estáticos | 9 blocos com portões, começando pela fundação (versionar a produção atual) |

**O que reaproveitar do protótipo no Portal real**
- Tokens de design (cores, fontes, raios, espaçamentos) e os dois temas, convertidos para o sistema de tema do Next.js.
- Desenho dos componentes (painel de vidro, cantos HUD, botão chanfrado com laser, KPI, pill, Kanban, chat, paleta, tour) como referência visual.
- Estrutura de navegação, nomes das telas e a divisão por perfil.
- Opções dos gráficos ECharts (cores, eixos, tooltips) como guia de estilo.
- Textos de interface e fluxos guiados como roteiro de testes de aceite.

**O que não reaproveitar**
- `data.js` e qualquer número do protótipo.
- O mecanismo de render por `innerHTML` e o estado global.
- A lógica de permissão visual e o bloqueio de fase no front.
- O cálculo do simulador (o real já existe e é canônico no backend).
