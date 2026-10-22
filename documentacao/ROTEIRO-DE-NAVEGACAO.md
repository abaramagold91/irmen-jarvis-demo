# Roteiro de navegação · Protótipo Portal IRMEN Jarvis

Este roteiro serve para quem vai inspecionar o protótipo (pessoa ou outro assistente). Ele diz o que existe, como chegar lá e, principalmente, **o que é funcional no protótipo, o que é só encenação e o que ainda não existe**.

Base: servidor local em `http://127.0.0.1:8765/` (ver LEIA-ME). Em todas as tabelas, "URL" é o endereço a acrescentar depois da barra.

## 1. Legenda usada neste roteiro

| Marca | Significado |
|---|---|
| **Funciona** | Responde de verdade dentro do protótipo: muda o estado da tela, recalcula, abre algo, navega |
| **Simulado** | Parece funcionar, mas o resultado é fixo ou encenado (ex.: resposta da Ava escolhida por palavra-chave, toast de confirmação sem gravar nada) |
| **Só visual** | Elemento desenhado sem nenhum comportamento ao clicar |
| **Não implementado** | Não existe no protótipo; aparece apenas como intenção |

Regra geral: **nada é salvo**. Recarregar a página volta tudo ao estado inicial, exceto o perfil escolhido (fica no `localStorage`). Movimentos no Kanban duram até a próxima recarga.

## 2. Estrutura da tela

- **Menu lateral** (à esquerda no desktop; gaveta no tablet em retrato e no celular, aberta pelo botão ☰): 6 grupos (Cockpit, Comercial, Crédito, Conversas, Inteligência, Administração) e 16 telas. Os itens mudam com o perfil.
- **Barra superior**: título da tela, barra "Pergunte à Ava ou vá para…" (abre a paleta), seletor de perfil, botão de tema e sino de notificações.
- **Fundo**: rede neural em canvas que reage ao ponteiro do mouse. Com "reduzir movimento" ligado no sistema operacional, a rede fica parada.
- **Faixa de demonstração guiada** (aparece embaixo durante um fluxo guiado).
- **Toasts** (avisos curtos no canto) confirmam ações simuladas.

Abrir qualquer tela pelo endereço: `#painel`, `#ava`, `#funil`, `#crm`, `#tarefas`, `#simulador`, `#mesa`, `#operacoes`, `#inbox`, `#whatsapp`, `#suporte`, `#bi`, `#arena`, `#usuarios`, `#config`, `#blueprint`.
Atenção: abrir pelo endereço **não checa o perfil**. Um vendedor que digita `#mesa` vê a Mesa de Crédito, mesmo sem o item no menu. No Portal real, isso seria barrado no servidor.

## 3. Inventário das telas

| # | Tela (menu) | URL | O que mostra | Interações e situação |
|---|---|---|---|---|
| 1 | Painel | `#painel` | Painel por perfil: briefing da Ava, 3 atalhos, chips de contexto, 6 KPIs com minigráfico, "Precisa de ação hoje", medidor de meta (ou SLA), evolução do faturamento 2025 x 2026, linha do tempo. Mesa e Admin também veem a esteira de 6 fases | Atalhos do briefing e o botão "Nova operação" **funcionam** (navegam). KPIs e gráficos **simulados** (valores fixos por perfil). Botões 30 dias/Trimestre/Semestre/Ano **só visual** (marcam o botão, não refiltram). Gráficos com tooltip **funcionam** |
| 2 | Ava | `#ava` | Conversa de exemplo com a Ava, área de leitura de documentos (DRE/balanço/IR), lista de documentos lidos | Campo de pergunta **funciona** como chat local (a mensagem aparece, sem resposta). Área de upload **só visual** (não aceita arquivo). "Abrir fichas" **funciona**; "Criar tarefas de cobrança" **só visual** |
| 3 | Funil & Kanban | `#funil` | 4 KPIs, filtros, Kanban com 8 fases (Oportunidade → Faturada) ou tabela | Alternar Kanban/Tabela **funciona**. Arrastar cartões entre fases 1 a 6 **funciona** com mouse (o cartão muda de coluna e aparece toast de histórico). Soltar em Formalização ou Faturada é **bloqueado** de propósito, com aviso. Filtros e busca **só visual**. "Nova oportunidade" **funciona** só como atalho para Nova Operação |
| 4 | Organizações & Contatos | `#crm` | Lista de organizações e ficha 360º: dados, contatos, checklist documental da Mesa, negócios, linha do tempo | Escolher organização na lista **funciona** (troca a ficha). Chips de filtro marcam/desmarcam (**só visual**). "Oportunidade" leva a Nova Operação. Importar planilha, Nova organização, Contato e "Cobrar pendências pelo WhatsApp" **só visual** |
| 5 | Tarefas & Agenda | `#tarefas` | Tarefas atrasadas, de hoje e próximas; semana; disciplina comercial | Marcar tarefa como feita **funciona** (toast "+XP" e item esmaece). "Nova tarefa" **só visual**. Agenda **só visual** |
| 6 | Nova Operação | `#simulador` | Assistente em 5 passos (só o passo 3, Condições, está desenhado), condições e comparação entre 5 bancos | Equipamento, quantidade, entrada e prazo **funcionam** e recalculam valor financiado e parcelas (cálculo Price local com taxas fictícias). Os passos 1, 2, 4 e 5 **não implementados** (são rótulos). "Enviar à Mesa de Crédito" apenas navega para a Mesa (não envia nada). "PDF da proposta" **só visual** |
| 7 | Mesa de Crédito | `#mesa` | Esteira de 6 fases com SLA, fila de decisão, desempenho dos 5 bancos, rosca de distribuição | Rosca com tooltip **funciona**. Minha fila/Toda a Mesa e chips **só visual**. Decidir crédito **não implementado** |
| 8 | Operações & Pedidos | `#operacoes` | Jornada OPP → OP → PED de uma operação e tabela de operações | Leitura. "Exportar CSV" **só visual** |
| 9 | Inbox compartilhado | `#inbox` | Lista de conversas (WhatsApp oficial, não oficial, canal interno), conversa aberta, sugestões da Ava, contexto do negócio (só acima de 1280 px) | Trocar conversa **funciona**. Enviar mensagem **funciona** localmente (aparece na conversa). Sugestões da Ava preenchem o campo; na conversa "Novo contato" a sugestão "Criar contato…" abre o diálogo de lead. "Criar organização e oportunidade" **funciona** (diálogo → toast → vai para o funil). Transferir, Nota interna, Atribuir a mim **só visual** |
| 10 | WhatsApp | `#whatsapp` | Instâncias da API oficial e não oficial, roteamento, templates, saúde dos canais (gráfico de 7 dias) | Gráfico com tooltip **funciona**. Nova instância, Gerar novo QR, Configurar **só visual**. Integração real **não implementada** |
| 11 | Suporte interno | `#suporte` | KPIs, tabela de chamados, base de conhecimento | "Abrir chamado" **funciona** (diálogo → toast "SUP-209"). Chips e busca **só visual** |
| 12 | Relatórios & BI | `#bi` | Filtros, 4 abas (Comercial, Crédito, Operação & SLA, Perdas), KPIs, gráficos e tabela "Detalhamento" | Abas **funcionam**. Clicar numa barra/fatia **simulado**: a tabela de detalhamento mostra 4 operações sorteadas e o filtro clicado. Filtros, Exportar CSV, Salvar visão **só visual** |
| 13 | Arena de Metas | `#arena` | Nível e XP, metas do mês, desafios, liga das gerências, ranking da equipe, conquistas, regras de XP | "Ajustar metas" e "Criar desafio" **funcionam** (diálogos → toast). Nada é gravado |
| 14 | Usuários & Permissões | `#usuarios` | KPIs, tabela de pessoas, matriz de capabilities por papel | "Convidar usuário" **funciona** (diálogo → toast). Aprovar, Editar, busca e matriz **só visual** |
| 15 | Configurações | `#config` | Abas Unidades & filiais, Identidade visual (white label), Integrações, Planos & cobrança | Abas **funcionam**. Campos de marca **só visual** (a pré-visualização não muda). Planos & cobrança é um **estado vazio** intencional |
| 16 | Mapa do produto | `#blueprint` | Os 4 fluxos guiados e o mapa de módulos com status (Pronto/Polir/Novo/Futuro) e o que falta | Botões de fluxo **funcionam** (iniciam a demonstração guiada). Cartões de módulo navegam para a tela |

## 4. Perfis simulados

Troque no seletor "Ver o portal como". O perfil muda o menu, o Painel, o nome no rodapé do menu, o nível/XP e o texto de algumas telas. **Não há login nem permissão real**: é só um filtro visual.

| Perfil | Pessoa fictícia | Painel | Telas que não aparecem no menu |
|---|---|---|---|
| Vendedor (Comercial) | Douglas Souza, Filial Goiânia, nível 7 | "Bom dia, Douglas": meta do mês, faturado, pipeline, aprovação, fichas incompletas, sequência; medidor "da meta atingida" | Mesa de Crédito, WhatsApp, Usuários & Permissões, Configurações |
| Gerência Comercial | Marina Prado, Gerência Centro-Oeste, nível 11 | "Gerência Centro-Oeste": meta da equipe, faturado consolidado, pipeline, ticket médio, conversão, pendências | Configurações |
| Mesa de Crédito (Coordenação) | Rafael Mourino, nível 9 | "Mesa de Crédito": fichas em análise, tempo médio, aprovação, formalização, gargalo, docs incompletos; esteira de 6 fases; medidor "no prazo de 20 h úteis" | nenhuma |
| Diretoria Executiva | Diretoria IRMEN, nível 12 | "Diretoria Executiva": meta anual, receita YTD, volume financiado, spread, lead time, inadimplência | nenhuma |
| Administrador do sistema | Administração, nível 5 | Usa o mesmo painel da Mesa de Crédito (não tem painel próprio) | nenhuma |

O medidor da meta muda por perfil (Vendedor 97,3%, Gerência 83,8%, Diretoria 79,3%, Mesa/Admin 81% de SLA). A escala do gráfico de faturamento também muda (individual, equipe ou empresa).

## 5. Fluxos guiados

Abrir `#blueprint` e clicar em "Iniciar demonstração" num dos cartões. O fluxo troca o perfil sozinho, leva de tela em tela e destaca a área relevante com um contorno ciano. Botões Anterior, Próximo e Encerrar na faixa inferior.

| Fluxo | Perfil | Passos (tela) |
|---|---|---|
| Do lead no WhatsApp ao faturamento | Vendedor | Inbox (conversa "Novo contato") → Organizações → Funil → Nova Operação → Mesa → Operações → Arena (7 passos) |
| Gestor define meta e acompanha a equipe | Gerência | Painel → Arena → BI (3 passos) |
| Pendência documental resolvida | Mesa de Crédito | Painel → Organizações (Mineração Serra Azul) → Inbox → Tarefas (4 passos) |
| Vendedor pede ajuda ao suporte interno | Vendedor | Suporte → Usuários (2 passos) |

Observação: o fluxo de suporte termina em Usuários & Permissões com perfil Vendedor, que não tem esse item no menu. A tela abre mesmo assim (ver a nota sobre URL na seção 2).

## 6. Roteiros rápidos sugeridos para inspeção

1. **Visual geral (2 min)**: abrir `#painel`, mover o mouse sobre o fundo (rede reage), passar o mouse no botão vermelho "Nova operação" (efeito laser), alternar o tema, repetir no claro.
2. **Perfis (2 min)**: trocar os 5 perfis no seletor e comparar menu e Painel.
3. **Comercial (3 min)**: `#funil` → arrastar um cartão de Oportunidade para Atendimento → tentar soltar em Formalização (deve bloquear) → Tabela → `#crm` e trocar de organização → `#simulador` e mexer em entrada e prazo.
4. **Conversas (2 min)**: `#inbox` → conversa "Novo contato" → sugestão "Criar contato e oportunidade" → Criar → cai no funil com toast.
5. **Inteligência (2 min)**: `#bi` → clicar numa barra do primeiro gráfico → ver "Detalhamento" → abas Crédito, Operação & SLA, Perdas. `#arena` → Criar desafio.
6. **Paleta (1 min)**: `Ctrl+K` → digitar "mesa" → Enter (resposta da Ava) → `Esc`.
7. **Celular**: largura até 860 px ativa o menu em gaveta; abrir ☰, navegar, fechar com ✕ ou `Esc`.

## 7. Modais, sobreposições e avisos

| Elemento | Como abrir | Situação |
|---|---|---|
| Paleta Ava/navegação | `Ctrl+K`, `Cmd+K` ou a barra "Pergunte à Ava…" | Filtro de telas e ações **funciona**. Resposta da Ava **simulada**: três respostas fixas escolhidas por palavras ("mesa", "equipe"/"ajuda", ou padrão) |
| Convidar usuário | `#usuarios` → Convidar usuário | Formulário pré-preenchido, enviar mostra toast. **Simulado** |
| Criar desafio | `#arena` → Criar desafio | **Simulado** |
| Ajustar metas de novembro | `#arena` → Ajustar metas | Campos editáveis, mas a soma "R$ 20,0 mi" é fixa. **Simulado** |
| Abrir chamado | `#suporte` → Abrir chamado | Mostra artigo sugerido pela Ava. **Simulado** |
| Criar organização e oportunidade | `#inbox` → conversa "Novo contato" → botão ou sugestão | Ao enviar, vai para o funil. A oportunidade **não** aparece no Kanban. **Simulado** |
| Notificações | Sino | Só um toast com 3 alertas fixos |
| Menu mobile | ☰ em telas até 860 px | **Funciona**; fecha com ✕, `Esc` ou ao escolher uma tela |

Todos os diálogos fecham por Cancelar, ✕, clique fora ou `Esc`.

## 8. Estados demonstráveis

| Estado | Existe? | Onde ver |
|---|---|---|
| Formulário preenchido | Sim | Os 5 diálogos acima; Nova Operação; Configurações → Identidade visual |
| Formulário com validação ou erro de campo | **Não** | Nenhum campo valida. Enviar com campos vazios também mostra sucesso |
| Carregando (skeleton, spinner) | **Não** | Tudo é síncrono. Não há estado de carregamento desenhado |
| Vazio | Parcial | Coluna vazia do Kanban: mova o único cartão de Atendimento ou de Negociação para outra fase e a coluna mostra "Arraste oportunidades para cá"; Configurações → Planos & cobrança; área de upload da Ava. Existe também o texto "Nenhum negócio ainda" na ficha de organização, mas todas as 6 organizações fictícias têm negócios, então ele não aparece  |
| Erro (falha de rede, permissão negada, 404) | **Não** | Não há tela nem aviso de erro desenhado |
| Bloqueio de regra de negócio | Sim | Soltar cartão em Formalização/Faturada no Kanban mostra aviso e devolve o cartão |
| Sucesso | Sim | Toasts após cada diálogo, tarefa concluída (+XP), mudança de fase |
| Sem permissão | Parcial | Itens somem do menu conforme o perfil; não há tela de "acesso negado" |

## 9. O que funciona, o que é simulado e o que não existe

**Funciona no protótipo (lógica local real)**
- Navegação pelo menu, endereço `#tela`, paleta `Ctrl+K` e atalhos do Painel.
- Troca de perfil com filtro de menu e Painel por papel.
- Tema escuro e Slate claro, com gráficos e rede neural recoloridos.
- Kanban com arrastar e soltar (mouse) e bloqueio das fases da Mesa.
- Alternância Kanban/Tabela, abas do BI e de Configurações, troca de organização e de conversa.
- Simulador: recálculo de valor financiado e parcela por banco ao mudar equipamento, quantidade, entrada e prazo.
- Chat local no Inbox e na Ava (só adiciona a sua mensagem).
- Fluxos guiados com troca de perfil, destaque de área e navegação passo a passo.
- Gráficos ECharts com tooltip e redimensionamento; clique abre o detalhamento no BI.
- Respeito a "reduzir movimento" (rede parada, animações e transições desligadas).

**Simulado (aparência de funcionamento, resultado fixo)**
- Todos os números, nomes, empresas, CNPJs, telefones e e-mails.
- Respostas da Ava (3 textos fixos) e briefing do Painel.
- Detalhamento do BI (4 linhas sorteadas a cada clique).
- Toasts de "convite enviado", "desafio publicado", "chamado aberto", "metas salvas", "+XP".
- Notificações.

**Não implementado**
- Login, sessão, permissões reais, multiorganização real, white label efetivo.
- Gravação de qualquer dado, histórico, auditoria, XP real.
- Filtros e períodos (BI, Funil, Painel), busca, exportação CSV, PDF da proposta.
- Passos 1, 2, 4 e 5 do assistente de Nova Operação.
- Upload e leitura de documentos pela Ava.
- WhatsApp (oficial ou não), envio de mensagens, QR.
- Decisão de crédito na Mesa, aprovação de usuários, edição da matriz de capabilities.
- Estados de carregamento e de erro, validação de formulário.
- Arrastar cartões do Kanban por toque ou teclado.
