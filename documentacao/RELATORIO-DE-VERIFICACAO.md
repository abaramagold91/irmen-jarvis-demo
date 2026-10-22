# Relatório de verificação · Protótipo Portal IRMEN Jarvis

Data: 22/10/2026. Versão testada: a pasta `site/` deste pacote (fontes e ECharts locais).

**Resumo**: o protótipo carrega sem erros de JavaScript, sem nenhuma requisição externa e com as fontes corretas em todas as resoluções e nos dois temas. Em desktop e tablet o layout se sustenta, com **uma exceção em desktop** (Painel da Diretoria, 24 px de rolagem horizontal). **No celular, várias telas têm colunas espremidas e textos sobrepostos**, porque usam grades de duas colunas declaradas direto no HTML que as regras responsivas não alcançam. Teclado funciona para o essencial, mas diálogos não prendem nem devolvem o foco. "Reduzir movimento" é respeitado.

Nenhum desses problemas foi corrigido neste pacote, porque a instrução era preservar exatamente a versão aprovada. As correções sugeridas estão no fim.

## 1. Como foi testado

- Navegador: Chromium 141 (controlado pelo Playwright 1.47.2), modo headless novo, servidor local `python3 -m http.server`.
- Resoluções:

| Nome | Viewport | Densidade | Toque |
|---|---|---|---|
| Desktop | 1440 × 900 | 1x | não |
| Tablet retrato | 820 × 1180 | 1x | sim |
| Tablet paisagem | 1180 × 820 | 1x | sim |
| Celular | 390 × 844 | 2x | sim |

- Temas: escuro (padrão) e Slate claro (pelo botão da barra superior).
- Cobertura: as 16 telas, 7 subestados (Funil em tabela, 3 abas extras do BI, 3 abas extras de Configurações), o Painel nos 5 perfis (exceto tablet paisagem) e 9 a 10 sobreposições por combinação (menu mobile, paleta, resposta da Ava, 5 diálogos, notificações, fluxo guiado).
- Total: **214 capturas de página inteira e 78 capturas de sobreposições**, em JPEG, com nome `resolução/tema/NN-tela.jpg`.
- Em cada captura, um script mediu: rolagem horizontal da página, elementos que saem da tela sem estar dentro de um contêiner com rolagem, textos cortados com reticências, áreas com rolagem horizontal interna, e cada gráfico (tamanho, instância ECharts criada, canvas desenhado, dentro da tela).
- Além das medições, as capturas foram revisadas visualmente por amostragem (todas as telas no celular escuro e no tablet claro, e telas selecionadas no desktop). **Responsividade não foi considerada validada apenas pela existência de media queries**; os problemas abaixo vieram da inspeção das imagens.

Os dados brutos estão em `verificacao/resultado-qa.json` e os scripts em `verificacao/scripts/`.

## 2. Resultados gerais

| Verificação | Resultado |
|---|---|
| Erros de JavaScript | **Nenhum** em todas as combinações |
| Requisições fora de `127.0.0.1` | **Nenhuma** (sem CDN, sem fontes externas, sem telemetria) |
| Recursos com erro HTTP | 1 resposta 404 no primeiro carregamento em desktop; o protótipo não declara ícone de aba e o navegador pede `/favicon.ico`. Não afeta a tela |
| Fontes | As 8 combinações de família e peso carregaram dos arquivos locais (`document.fonts.check` verdadeiro para todas) |
| Gráficos | 172 gráficos medidos: todos com instância ECharts e canvas desenhado, nenhum fora da tela |
| Rolagem horizontal da página | Só no Painel da Diretoria em desktop 1440 (24 px) e nas sobreposições abertas sobre ele. Zero em tablet e celular |
| Tema claro | Todas as telas e sobreposições renderizam no claro, gráficos e rede recoloridos |

## 3. Problemas encontrados

### 3.1 Desktop

**D1. Painel da Diretoria transborda 24 px (1440 × 900, ambos os temas).** No último KPI, "Inadimplência", o rótulo e a pílula "Controlado" não cabem na linha do topo do cartão (que não quebra linha). A pílula sai do cartão e cria rolagem horizontal na página inteira. Captura: `desktop-1440x900/escuro/01-painel.jpg` (a imagem tem 1464 px de largura por causa disso). Só acontece com as fontes reais carregadas; na grade de 6 colunas (acima de 1280 px).

**D2. Contexto do negócio no Inbox some abaixo de 1280 px.** É intencional no CSS, mas leva junto o botão "Criar organização e oportunidade". Em tablet e celular o diálogo só é alcançável pela sugestão da Ava "Criar contato e oportunidade".

### 3.2 Tablet

Sem rolagem horizontal da página e sem sobreposição de texto nas capturas revisadas. Tabelas largas e o Kanban rolam horizontalmente dentro do próprio painel (comportamento esperado). Em tablet retrato (820 px) o menu já vira gaveta. Em paisagem (1180 px), os gráficos "Evolução do faturamento" (Painel) e "Saúde dos canais" (WhatsApp) ficam com 253 px de largura: legíveis, mas apertados.

### 3.3 Celular (390 × 844)

O menu em gaveta, a barra superior em duas linhas, os KPIs, o BI, a Arena, o WhatsApp e os diálogos funcionam bem. Os problemas estão nas telas com grade de duas colunas fixada no HTML:

| # | Tela | O que acontece | Captura |
|---|---|---|---|
| M1 | Ava | Conversa e "Leitura de documentos" ficam lado a lado; a coluna de documentos fica com cerca de 120 px, nomes de arquivo cortados, texto do upload em uma palavra por linha | `celular-390x844/*/02-ava.jpg` |
| M2 | Organizações & Contatos | Lista e ficha 360º lado a lado; a ficha fica com cerca de 40 px visíveis e o conteúdo é cortado na borda (nome, valores, botões) | `04-crm.jpg` |
| M3 | Tarefas & Agenda | Lista de tarefas e "Semana" lado a lado; títulos quebram palavra a palavra e o selo de prazo ("Hoje 10:00") **sobrepõe** o título; a agenda semanal fica ilegível | `05-tarefas.jpg` |
| M4 | Nova Operação | Condições e comparação entre bancos lado a lado; selects truncados ("Financiamer"), nome do banco **sobreposto** ao valor da parcela | `06-simulador.jpg` |
| M5 | Mesa de Crédito | Tabela de bancos e rosca lado a lado; a rosca fica com 109 px e a legenda **sobrepõe** o gráfico | `07-mesa.jpg` |
| M6 | Painel | Bloco "Precisa de ação hoje" e medidor da meta lado a lado; o medidor fica com 112 px | `01-painel.jpg` e `perfil-*-painel.jpg` |
| M7 | Suporte interno | Tabela de chamados e base de conhecimento lado a lado; a base fica com cerca de 120 px, títulos de artigo em uma palavra por linha | `11-suporte.jpg` |
| M8 | Operações & Pedidos | A jornada OPP → OP → PED fica em rolagem horizontal interna (5 colunas de no mínimo 150 px) | `08-operacoes.jpg` |

Também em todas as resoluções, tabelas largas (Mesa, Operações, Suporte, Usuários, Configurações, BI Detalhamento, Funil em tabela, Arena) rolam horizontalmente dentro do painel. Isso é intencional e não quebra a página, mas no celular boa parte das colunas fica fora da área visível.

Textos com reticências: só os previews de mensagem no Inbox e o subtítulo da organização "Terraplenagem Vale do Araguaia" na lista do CRM (intencional).

### 3.4 Teclado e foco

| Verificação | Resultado |
|---|---|
| Ordem de Tab inicial | Começa no seletor de espaço de trabalho e percorre o menu lateral antes do conteúdo. **Não há link "pular para o conteúdo"** |
| Foco visível | Sim, contorno ciano de 2 px (`:focus-visible`) em todos os elementos testados, nos dois temas |
| Navegar pelo menu com Enter | Funciona, mas **o foco vai para o `<body>`** após a troca de tela (todo o shell é redesenhado). O próximo Tab recomeça no topo do menu |
| `Ctrl+K` | Abre a paleta com o foco no campo de busca |
| Paleta: foco preso | **Não**. Tab sai da paleta e percorre a página por trás |
| Diálogos abrem por Enter | Sim |
| Diálogos: foco inicial | **Não vai para o diálogo**; permanece no botão que o abriu |
| Diálogos: foco preso | **Não** |
| `Esc` | Fecha paleta, diálogos e menu mobile |
| Foco ao fechar | **Não volta** ao botão de origem (fica no `<body>`) |
| Menu mobile por teclado | Abre com Enter e fecha com `Esc`, mas o foco **não entra** na gaveta ao abrir |
| Kanban | Os cartões recebem foco, mas **não é possível mover cartão por teclado**; também não funciona por toque (HTML5 Drag and Drop não dispara no celular) |
| Seletor de perfil | Funciona por teclado (é um `<select>` nativo) |

### 3.5 Redução de movimento

Testado com a preferência do sistema emulada (`prefers-reduced-motion: reduce`):

| Item | Movimento normal | Reduzido |
|---|---|---|
| Rede neural | Anima e reage ao ponteiro (quadros diferentes medidos) | **Parada** (quadros idênticos) |
| Esfera da Ava (`.orb`) | Animação `pulse` | Sem animação |
| Transições (incluindo laser do botão) | Ativas | Desligadas |
| Rolagem do fluxo guiado | Suave | Instantânea |
| Gráficos ECharts | Animação de entrada de 700 ms | **Continua animando** (o ECharts não lê essa preferência e o protótipo não desliga) |

### 3.6 Contraste (tokens contra o fundo da página)

| Texto | Escuro | Claro |
|---|---|---|
| Principal (`--fg`) | 17,2 : 1 | 14,9 : 1 |
| Secundário (`--fg-2`) | 9,1 : 1 | 7,4 : 1 |
| Terciário (`--fg-3`) | 6,3 : 1 | 4,9 : 1 |
| Vermelho de ação usado como texto (`--brand`) | 5,2 : 1 | **4,2 : 1** |
| Ciano usado como texto (`--arc`) | 11,2 : 1 | **4,0 : 1** |
| Texto branco no botão primário | **3,8 : 1** | 5,0 : 1 |

Os valores em negrito ficam abaixo de 4,5 : 1 (WCAG AA para texto pequeno). Medição feita contra o fundo da página; sobre os painéis de vidro o contraste varia um pouco.

### 3.7 Outros comportamentos observados

- Abrir uma tela pelo endereço (`#mesa`, `#usuarios` etc.) ignora o perfil: a tela aparece mesmo que não esteja no menu (ver `app.js`, leitura do hash).
- O fluxo guiado "Vendedor pede ajuda ao suporte interno" termina em Usuários & Permissões com perfil Vendedor, tela que esse perfil não tem no menu.
- Nas capturas `perfil-*-painel.jpg`, os toasts "Visão de …" se acumulam no canto, porque a troca de perfil foi feita em sequência rápida pelo script. No uso normal aparece um por vez.
- O perfil escolhido persiste entre recargas (`localStorage`); o tema não persiste (sempre volta ao escuro).

## 4. Gravação

`gravacao-navegacao.mp4` (1 min 43 s, 1280 × 800, H.264), no ZIP de verificação visual:

- **0:00 a 1:14 · desktop 1280 × 800 (perfil Diretoria)**: rede neural reagindo ao mouse, efeito laser no botão primário, menu lateral, arrastar cartão no Kanban, Funil em tabela, troca de organização no CRM, slider de entrada no simulador, clique num gráfico do BI com detalhamento, aba Crédito, troca para o tema claro, Painel e Arena no claro, diálogo "Criar desafio" com toast, paleta `Ctrl+K` com pergunta à Ava, troca de perfil para Vendedor, fluxo guiado do lead (3 passos) e volta ao tema escuro.
- **1:14 a 1:43 · celular 390 × 844 (perfil Gerência)**: menu em gaveta, Inbox, conversa "Novo contato", sugestão da Ava abrindo o diálogo de lead, envio e chegada ao funil, abrir e fechar o menu, tema claro, BI no celular e volta ao escuro.

O círculo branco que aparece na gravação é um ponteiro desenhado pelo script de gravação (o modo headless não grava o cursor). Ele **não faz parte do protótipo**.

## 5. Correções sugeridas (não aplicadas)

Todas são mudanças pequenas de CSS que não alteram a identidade visual no desktop. Ficam para decisão, já que a entrega precisava preservar a versão aprovada.

1. **D1**: permitir quebra no topo do KPI, por exemplo `.kpi .k-top{flex-wrap:wrap}` e `.kpi .k-lbl{min-width:0}`.
2. **M1 a M7**: trocar as grades fixadas no HTML por classes (`.g2` ou uma nova `.split`) que já colapsam para uma coluna abaixo de 860 px, ou adicionar no bloco de 860 px uma regra que force uma coluna para essas grades.
3. **Teclado**: mover o foco para o `<h1>` da tela (ou `#view`, que já tem `tabindex="-1"`) após navegar; focar o primeiro campo ao abrir diálogo; prender o foco em diálogos e paleta; devolver o foco ao botão de origem; adicionar link "pular para o conteúdo"; focar a gaveta ao abrir.
4. **Kanban**: alternativa sem arrastar (menu "Mover para…" no cartão) para teclado e toque.
5. **Movimento**: passar `animation: false` às opções do ECharts quando `prefers-reduced-motion` estiver ativo.
6. **Contraste**: escurecer o vermelho do botão primário no escuro (ou usar texto escuro) e escurecer `--brand`/`--arc` quando usados como texto no claro.
7. **Favicon**: declarar um ícone para eliminar o 404.
