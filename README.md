# AUVP Pro

Site estático da AUVP Pro, migrado do WordPress/Elementor. Construído com **Vite**
e publicado na **Vercel**.

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento com HMR em http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve dist/ como em produção
```

## Estrutura

```
index.html            página inicial — cada página é uma entrada do Vite
hp12c/index.html      /hp12c/
termos/index.html     /termos/
obrigado/index.html   /obrigado/
src/
  css/main.css        Tailwind (entrada) + estilos dos componentes
  js/site.js          entrada JS de todas as páginas; importa o CSS
  partials/           head, header, footer, logos e o FAQ compartilhado
public/               servido como está, na raiz (logos, favicon, robots.txt)
brand/                pacote de marca (origem); não vai para o ar — ver brand/README.md
vite.config.js        entradas das páginas + plugin de parciais
vercel.json           configuração de deploy
```

### Parciais de HTML

O plugin `htmlPartials` em `vite.config.js` resolve `{{> nome }}` para o conteúdo de
`src/partials/nome.html`. Inclusões aninhadas funcionam, e editar um parcial recarrega
a página aberta no `npm run dev`.

Ele roda em `order: 'pre'`, antes do processamento de HTML do Vite — por isso as tags
que vêm de dentro de um parcial (o `<script>` de entrada, o `<link>` do favicon, as
imagens dos logos) passam normalmente pelo pipeline de assets.

### Caminhos

O site é servido na raiz do domínio, então as referências são absolutas (`/hp12c/`,
`/assets/img/logo-auvp-pro.svg`). CSS e JS são injetados pelo Vite com hash no nome,
não precisam ser referenciados à mão.

### Swiper

Só a página da HP-12C tem carrossel, então o Swiper entra por `import()` dinâmico
dentro de `initLessonCarousel`. Ele vira um chunk separado (~151 kB) que as outras
páginas nunca baixam.

## Deploy

A Vercel builda e publica a cada push. `vercel.json` fixa o build (`npm run build`),
a saída (`dist`) e um `Cache-Control` imutável para `/assets/*`, que já têm hash no nome.

`.github/workflows/ci.yml` roda `npm ci && npm run build` em cada pull request e em
push na `main` — só verifica que o build passa; quem publica é a Vercel.

### Domínio próprio

Configurar em **Project → Settings → Domains** na Vercel e apontar o DNS. Nada muda no
código: os caminhos já são absolutos a partir da raiz.

## Pontos que dependem de material externo

- **Logo da AUVP Capital**: o rodapé dos prints usa a marca da Capital, que não veio no
  pacote de logos. Está com o logo da AUVP Pro em branco no lugar — ver `brand/README.md`.
- **Imagem de fundo do hero**: definida em `--hero-image` no topo de `src/css/main.css`.
- **Links de checkout**: os botões de preço estão com `href="#"` em `index.html`.
