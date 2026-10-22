# Ajuste mobile (prévia para aprovação)

Prévia: `previa-mobile/` (no GitHub Pages: <https://abaramagold91.github.io/irmen-jarvis-demo/previa-mobile/>). A raiz do site continua com a versão aprovada até a aprovação deste ajuste.

## O que mudou

Somente dois arquivos novos, carregados depois dos originais: `mobile.css` e `mobile.js`. `index.html` ganhou duas linhas para incluí-los. `data.js`, `screens.js`, `app.js` e todo o CSS original estão intactos.

Todas as regras ficam dentro de `@media (max-width:860px)` (celular e tablet em retrato), mais uma trava horizontal para telas de toque até 1280 px. O `mobile.js` só age quando a largura é de até 860 px.

| Regra | Como ficou |
|---|---|
| Tela travada para os lados | A página nunca rola na horizontal; só de cima para baixo. Testado tentando rolar lateralmente em 8 telas: deslocamento horizontal sempre 0 |
| Colunas espremidas | As grades de duas colunas viram uma coluna (Painel, Ava, CRM, Tarefas, Nova Operação, Mesa, Suporte, Arena) |
| KPIs | Duas colunas compactas no celular, rótulos e pílulas quebram linha em vez de sair do cartão |
| Carrosséis | Kanban, esteira de fases, jornada OPP → OP → PED, lista de organizações e lista de conversas deslizam para o lado com encaixe por cartão e pontos indicadores |
| Kanban no toque | Tocar num cartão abre "Mover para…" com as 8 fases. Usa a mesma regra do arrastar: fases 7 e 8 continuam bloqueadas, com o mesmo aviso |
| Tabelas | No celular viram cartões (rótulo à esquerda, valor à direita). No tablet em retrato cabem na largura, sem rolagem lateral |
| Barra superior | Sempre duas linhas fixas: menu, título, tema e notificações; embaixo, Ava e perfil |
| Inbox | Conversas em carrossel, conversa aberta logo abaixo, cabeçalho da conversa sem aperto, campo de mensagem em largura total |
| Gráficos | Rosca de bancos com legenda embaixo; funil do BI com rótulos que cabem |
| Diálogos | Título longo não empurra o botão de fechar |

## Verificação

- Desktop: layout, cores, fontes e exibição de cada elemento comparados com a versão aprovada nas 16 telas, em 1440, 1280, 1180 e 900 px, nos dois temas: **idênticos**.
- Celular 390 × 844 e tablet 820 × 1180, nos dois temas: 23 estados de tela, 5 perfis e 10 sobreposições capturados; nenhum erro de JavaScript, nenhuma rolagem horizontal de página, nenhum elemento saindo da tela.
- Toque: cartão do Kanban movido de Oportunidade para Proposta pelo "Mover para…"; tentativa de mover para Formalização bloqueada com aviso.

## O que continua igual (fora do escopo deste ajuste)

- Foco de teclado em diálogos e após navegar, contraste do botão primário no escuro, 24 px de transbordo no Painel da Diretoria em 1440 px. Estão no relatório de verificação e não foram tocados para não alterar o desktop aprovado.
