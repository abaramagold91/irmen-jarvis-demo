# Portal IRMEN · Protótipo Jarvis (pacote de demonstração)

Protótipo visual e navegável do Portal IRMEN. É **exclusivamente demonstrativo**: todos os números, nomes, CNPJs e telefones são fictícios, não há backend, não há Supabase, não há credenciais e nenhuma requisição sai da máquina.

Esta é a mesma versão visual aprovada (temas escuro e Slate claro, tipografia, cores, recortes, botões com laser, rede neural e transparências). Em relação ao artifact publicado, houve só duas mudanças: o `index.html` ganhou o esqueleto HTML (`<!doctype>`, `<head>`, `<body>` e a mesma linha de estilo base) que a hospedagem de Artifacts acrescentava sozinha, e os dois endereços de CDN foram trocados por cópias locais:

| No artifact aprovado | Neste pacote |
|---|---|
| `fonts.googleapis.com` (Chakra Petch 500/600/700, IBM Plex Sans 400/500/600, JetBrains Mono 400/500) | `site/vendor/fonts/fonts.css` + 16 arquivos `.woff2` (subconjuntos latin e latin-ext, os mesmos pesos) |
| `cdnjs.cloudflare.com/.../echarts/5.5.0/echarts.min.js` | `site/vendor/echarts/echarts.min.js` (mesma versão 5.5.0) |

`data.js`, `screens.js` e `app.js` são idênticos byte a byte aos publicados. O CSS dentro de `index.html` também não mudou.

## Como abrir (3 opções)

Requisito: qualquer navegador recente (Chrome, Edge, Firefox ou Safari). Não precisa de internet.

**Opção A: Python (já vem no macOS e na maioria dos Linux)**

```bash
cd portal-irmen-jarvis-demo/site
python3 -m http.server 8765 --bind 127.0.0.1
```

Abra <http://127.0.0.1:8765/> no navegador. Para parar, `Ctrl+C` no terminal.
No Windows, se `python3` não existir, use `py -m http.server 8765 --bind 127.0.0.1`.

**Opção B: Node.js (18 ou superior)**

```bash
cd portal-irmen-jarvis-demo/site
npx --yes http-server@14.1.1 -p 8765 -a 127.0.0.1 -c-1
```

Abra <http://127.0.0.1:8765/>. (O `npx` baixa o `http-server` uma vez do registro npm; se a máquina estiver offline, use a opção A.)

**Opção C: abrir o arquivo direto**

Dar dois cliques em `site/index.html` também funciona (testado no Chromium: telas, gráficos e interações carregam sem erros). Prefira A ou B para inspeção, porque alguns navegadores tratam `file://` de forma mais restrita para fontes e armazenamento local.

## Atalhos úteis

- Abrir uma tela direto: `http://127.0.0.1:8765/#bi`, `#funil`, `#arena` etc. (lista completa no roteiro).
- Paleta da Ava e navegação: `Ctrl+K` (ou `Cmd+K`). `Esc` fecha paleta, diálogos e menu mobile.
- Trocar perfil: seletor "Ver o portal como" na barra superior. O perfil escolhido fica salvo no `localStorage` (`irmen-role`); para voltar ao início, limpe os dados do site ou escolha outro perfil.
- Tema: botão sol/lua na barra superior. O protótipo sempre abre no escuro; o claro (Slate) só vale enquanto a página estiver aberta.

## Conteúdo do pacote

| Caminho | O que é |
|---|---|
| `site/` | O protótipo pronto para servir (é a pasta que vai para qualquer hospedagem estática) |
| `ROTEIRO-DE-NAVEGACAO.md` | Inventário de telas, perfis, fluxos guiados, estados demonstráveis e o que é real, simulado ou ausente |
| `ARQUITETURA-DO-PROTOTIPO.md` | Como este protótipo é construído (arquivos, estado, navegação, gráficos, efeitos) e, separado, onde ele difere da arquitetura proposta para o Portal real |
| `RELATORIO-DE-VERIFICACAO.md` | Resultado dos testes em desktop, tablet e celular, nos dois temas, com problemas encontrados |
| `PUBLICAR-PREVIA.md` | Como publicar a pasta `site/` numa URL pública de demonstração |
| `LICENCAS-DE-TERCEIROS.md` | Licenças do ECharts e das fontes |
| `package.json` / `package-lock.json` | Versões exatas das bibliotecas copiadas para `site/vendor/` (só documentam a origem; não é preciso instalar nada) |
| `verificacao/` | Resultado bruto dos testes (`resultado-qa.json`) e os scripts Playwright usados |

As capturas de tela e a gravação estão no ZIP separado `portal-irmen-jarvis-verificacao-visual.zip`.

## Versões

| Dependência | Versão | Origem |
|---|---|---|
| Apache ECharts | 5.5.0 | npm `echarts@5.5.0`, arquivo `dist/echarts.min.js` |
| Chakra Petch | Fontsource 5.1.0 | npm `@fontsource/chakra-petch@5.1.0` |
| IBM Plex Sans | Fontsource 5.1.0 | npm `@fontsource/ibm-plex-sans@5.1.0` |
| JetBrains Mono | Fontsource 5.1.0 | npm `@fontsource/jetbrains-mono@5.1.0` |

Não há framework, bundler nem etapa de build. Os ícones são SVG desenhados em linha no próprio `data.js` (sem biblioteca de ícones).
