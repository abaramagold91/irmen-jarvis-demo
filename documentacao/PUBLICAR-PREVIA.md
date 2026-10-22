# Como publicar a prévia numa URL pública

**Situação**: publicada em <https://abaramagold91.github.io/irmen-jarvis-demo/> pelo GitHub Pages, a partir da branch `main` deste repositório separado (`abaramagold91/irmen-jarvis-demo`). Nada do sistema oficial foi usado. As opções abaixo ficam como referência para publicar em outro serviço.

A pasta `site/` está pronta para qualquer hospedagem estática: não tem build, não tem variáveis de ambiente, não tem segredos e não faz requisições externas. Basta enviar o **conteúdo** de `site/` (o `index.html` precisa ficar na raiz).

## Regras para não tocar no sistema oficial

- Use uma conta ou projeto **novo e separado**. Não use o projeto `portal-irmen-v3-demo` da Vercel, o domínio `portalirmen.com.br` nem o repositório `portal-irmen-v2`.
- Use o endereço gratuito que o próprio serviço gera (ex.: `algo.netlify.app`, `algo.pages.dev`, `usuario.github.io/...`). Não aponte nenhum domínio da IRMEN.
- Se quiser evitar indexação por buscadores, adicione `<meta name="robots" content="noindex">` ao `<head>` de `site/index.html` antes de enviar (é a única alteração aceitável, porque não muda nada visual).

## Opções (todas gratuitas para este uso; as telas dos serviços podem mudar)

**1. Netlify Drop** (mais rápido, sem linha de comando)
1. Entre em <https://app.netlify.com/drop>.
2. Arraste a pasta `site/` para a área indicada.
3. O serviço devolve uma URL `https://<nome>.netlify.app`. Sites enviados sem login podem ser temporários; para mantê-lo no ar, entre com uma conta separada da usada no sistema oficial.

**2. Cloudflare Pages**
1. Em <https://dash.cloudflare.com>, Workers & Pages → Create → Pages → "Upload assets".
2. Dê um nome ao projeto (ex.: `irmen-jarvis-demo`) e envie a pasta `site/`.
3. A URL fica `https://irmen-jarvis-demo.pages.dev`.

**3. GitHub Pages** (repositório novo e separado)
1. Crie um repositório público novo, por exemplo `irmen-jarvis-demo` (não use o `portal-irmen-v2`).
2. Envie o conteúdo de `site/` para a raiz da branch `main`.
3. Settings → Pages → Source: "Deploy from a branch", branch `main`, pasta `/ (root)`.
4. A URL fica `https://<usuario>.github.io/irmen-jarvis-demo/`.

## Como testar o acesso anônimo depois de publicar

1. Abra uma janela anônima (Chrome: `Ctrl+Shift+N`; Safari: `Cmd+Shift+N`; Firefox: `Ctrl+Shift+P`).
2. Cole a URL. A página deve abrir direto no Painel, sem tela de login do serviço.
3. Confira no DevTools (F12 → Network) que todas as requisições vão para o mesmo domínio da prévia.
4. Teste também no celular com os dados móveis (fora do Wi-Fi da empresa).

Se quiser, depois de publicar, me envie a URL: consigo abrir a página publicamente acessível e repetir as verificações sobre ela.
