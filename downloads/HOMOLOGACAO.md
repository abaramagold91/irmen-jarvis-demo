# Portal IRMEN · Versão homologada (v1)

Homologado por Rafa Mourino em 22/10/2026.

Este pacote é a referência visual **completa e aprovada** do Portal IRMEN no padrão Jarvis: o sistema inteiro e a tela de login. Ao enviar ao arquiteto de software ou implantar no Portal real, implante **tudo junto**, com as mesmas telas, imagens, textos, cores, fontes e animações descritos aqui. Nada deste pacote deve ser implantado pela metade.

> Este pacote continua sendo um protótipo visual. Não tem backend, não conecta ao Supabase e não guarda dados. Os comportamentos marcados como "simulado" precisam ser ligados ao sistema real na implantação.

## 1. O que está no pacote

| Caminho | Conteúdo |
|---|---|
| `site/login/` | Tela de login e recuperação de acesso (homologada nesta data) |
| `site/` | Sistema completo: 16 telas, 5 perfis, fluxos guiados, temas escuro e claro |
| `site/mobile.css`, `site/mobile.js` | Camada de celular e tablet (o desktop não muda com ela) |
| `site/vendor/` | Fontes e ECharts locais, sem CDN |
| `documentacao/` | Roteiro de navegação, arquitetura do protótipo, ajuste mobile, verificação e licenças |
| ZIP de capturas (separado) | Capturas do login, do sistema e do mobile, e as gravações de navegação |

Como abrir: `cd site && python3 -m http.server 8765 --bind 127.0.0.1` e acesse `http://127.0.0.1:8765/login/`. Ao entrar, o login leva para o sistema (`/`).

## 2. Telas do sistema homologadas

As 16 telas do menu, com o detalhe de cada uma em `documentacao/ROTEIRO-DE-NAVEGACAO.md`:

1. Painel (`#painel`)
2. Ava (`#ava`)
3. Funil & Kanban (`#funil`)
4. Organizações & Contatos (`#crm`)
5. Tarefas & Agenda (`#tarefas`)
6. Nova Operação (`#simulador`)
7. Mesa de Crédito (`#mesa`)
8. Operações & Pedidos (`#operacoes`)
9. Inbox compartilhado (`#inbox`)
10. WhatsApp (`#whatsapp`)
11. Suporte interno (`#suporte`)
12. Relatórios & BI (`#bi`)
13. Arena de Metas (`#arena`)
14. Usuários & Permissões (`#usuarios`)
15. Configurações (`#config`)
16. Mapa do produto (`#blueprint`)

## 3. Tela de login homologada

### 3.1 Identidade

- Mesmas fontes do sistema: Chakra Petch (títulos), IBM Plex Sans (texto), JetBrains Mono (detalhes).
- Tema escuro como padrão e tema claro pelo botão sol/lua.
- **Destaques em vermelho da marca** (`#ef3f4f` no escuro, `#d42a3a` no claro): etiquetas, palavra em destaque do título, ícones dos cartões e do rodapé, links e cantoneiras do cartão.
- **Ficam em azul** (`#3fd0ff` / `#0a7aa8`): rede neural de fundo, orbe, radar e o contorno do campo em foco (em vermelho seria confundido com erro).
- Ícone da aba: selo "IR" vermelho.

### 3.2 Textos aprovados (usar exatamente assim)

**Lado esquerdo**

- Etiqueta: `COMERCIAL · CRÉDITO · OPERAÇÃO`
- Título: **O centro de comando da sua *operação*.** ("operação" em vermelho)
- Apoio: Pipeline, crédito, interações e metas em tempo real, com rastreabilidade do lead ao faturamento.
- Radar: rótulos `CRM`, `CRÉDITO`, `OPERAÇÃO`, `INTERAÇÕES`.
- Cartões:

| Etiqueta | Título | Linha de apoio |
|---|---|---|
| FUNIL | Da oportunidade até o faturamento | Com histórico de cada etapa no funil |
| CRÉDITO | Principais players do mercado | Esteira da Mesa de Crédito e SLA em toda a operação |
| RASTREIO | OPP → OP → PED | Códigos únicos rastreáveis do lead, da operação e do pedido |
| GESTÃO | Metas e BI | Números que descem até a operação de origem |

- Rodapé: "Tratamento de dados conforme a LGPD" e "Conexão criptografada de ponta a ponta".

**Cartão de acesso**

- `ACESSO SEGURO` · **Entrar no portal** · Use o e-mail corporativo do seu convite.
- Campos E-mail e Senha (mostrar/ocultar, aviso de Caps Lock), "Manter conectado neste dispositivo", "Esqueci minha senha", botão **Entrar**.
- `PRIMEIRO ACESSO`: "O acesso é criado pela administração. Abra o link do convite que chegou no seu e-mail para definir a senha." e, em destaque, "Não encontrou? Confira também a caixa de spam."
- Botão **Solicitar primeiro acesso**.
- Rodapé do cartão: "Problemas para entrar? Fale com a administração".
- Rodapé da página: "© 2026 IRMEN · Uso restrito a pessoas autorizadas" · Privacidade · Termos · Suporte.

### 3.3 Animações

- Rede neural de fundo (mesma do sistema).
- Radar: feixe gira a cada 6 s; cada bolinha (CRM, Crédito, Operação, Interações) **fica vermelha enquanto o feixe passa** e volta ao azul quando ele sai.
- Botão principal com o laser no hover, igual ao sistema.
- Tudo respeita "reduzir movimento" do sistema operacional.

### 3.4 Estados e fluxos

| Fluxo | Telas |
|---|---|
| Entrar | validação dos campos → carregando → "Acesso liberado / Bem-vindo de volta" → sistema |
| Senha incorreta | aviso com tentativas restantes; na 3ª, bloqueio de 15 minutos com sugestão de recuperar a senha |
| Recuperar senha | 1. e-mail → 2. código de 6 dígitos (reenvio após 45 s) → 3. nova senha com medidor de força e regras (10+ caracteres, maiúscula, número, símbolo) → 4. "Senha atualizada" |
| Solicitar primeiro acesso | nome completo, e-mail corporativo, área, gestor responsável (opcional) → "Pedido recebido", com lembrete do spam |

### 3.5 Responsivo

- Desktop: duas colunas (apresentação à esquerda, cartão à direita). Entre 1101 e 1380 px o radar e os títulos dos cartões reduzem um pouco para os títulos caberem em 2 linhas.
- Até 1100 px o radar some. Tablet (641 a 900 px): uma coluna, cartões em 4 colunas.
- Celular: uma coluna, faixa de apresentação compacta, página travada na horizontal.

## 4. O que é simulado no protótipo e precisa ser ligado na implantação

| No protótipo | No Portal real |
|---|---|
| Qualquer e-mail válido com senha de 8+ caracteres entra; senha com "errada" falha | Autenticação real do Portal |
| Bloqueio após 3 tentativas fica só na memória da página | Limite de tentativas no servidor |
| Código de recuperação: qualquer 6 dígitos, exceto `000000` | Fluxo real de recuperação de senha |
| "Solicitar primeiro acesso" mostra confirmação sem enviar nada | **Abrir a tela de solicitação de acesso que já existe no sistema** |
| "Manter conectado" não guarda nada | Sessão persistente real |
| Privacidade, Termos, Suporte e "Fale com a administração" não abrem nada | Links reais |
| Após entrar, abre o protótipo | Abrir o painel do perfil do usuário |

As regras da nova senha (10+ caracteres, maiúscula, número, símbolo) devem ser confirmadas com a política de senha real antes de implantar.

## 5. Verificação

- Login testado em 1440×900, 1280×760, 820×1180, 390×844 e 360×740, nos dois temas: todos os estados capturados, sem rolagem lateral e sem erros de JavaScript.
- Pacote testado aberto localmente: login → sistema, sem nenhuma requisição externa.
- Sistema: ver `documentacao/RELATORIO-DE-VERIFICACAO.md` e `documentacao/AJUSTE-MOBILE.md`.
- Pendências conhecidas do sistema (não bloqueiam a homologação visual, devem ser tratadas na implantação): foco preso e retorno de foco nos diálogos, contraste do botão principal no escuro, sobra de 24 px no painel da Diretoria em 1440 px e a rota por endereço que ignora o filtro de perfil.

## 6. Prévia pública

- Login: https://abaramagold91.github.io/irmen-jarvis-demo/login/
- Sistema: https://abaramagold91.github.io/irmen-jarvis-demo/
