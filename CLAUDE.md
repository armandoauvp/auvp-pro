# AUVP Pro

Site institucional da AUVP Pro, migrado do WordPress/Elementor. Estático, construído
com Vite e publicado na Vercel. O repositório é a fonte da verdade do site.

## Comandos

```bash
npm install
npm run dev       # dev server com HMR
npm run build     # gera dist/
npm run preview   # serve dist/ como em produção
```

Não há testes automatizados. A verificação é visual: `npm run preview` e conferir as
quatro páginas, ou dirigir um browser headless (ver "Como verificar", abaixo).

## Arquitetura

Vite em modo MPA: **cada página é um `index.html` numa pasta**, e cada um é uma entrada
do bundler. As rotas saem da estrutura de pastas.

```
index.html            /
hp12c/index.html      /hp12c/
termos/index.html     /termos/
obrigado/index.html   /obrigado/
paginas/index.html    /paginas/  (índice das páginas; noindex — atualize ao criar página)
src/
  css/main.css        Tailwind (entrada) + estilos dos componentes
  js/site.js          entrada JS de todas as páginas; importa o CSS
  partials/           head, header, footer, logos, FAQ compartilhado
public/               servido como está, na raiz (logos, favicon, robots.txt)
brand/                pacote de marca (origem); NÃO vai para o ar
vite.config.js        entradas das páginas + plugin de parciais
vercel.json           build, saída e cache dos assets
```

### Parciais de HTML

`vite.config.js` traz um plugin `htmlPartials` que resolve `{{> nome }}` para o conteúdo
de `src/partials/nome.html`. Aninhamento funciona. Ele roda em `order: 'pre'`, **antes**
do processamento de HTML do Vite — é isso que faz as tags vindas de dentro de um parcial
(o `<script>` de entrada, o favicon, as imagens dos logos) passarem pelo pipeline de
assets normalmente. Se mudar para `'post'`, elas deixam de ser processadas.

### Caminhos

O site é servido na raiz do domínio, então **todas as referências são absolutas**
(`/hp12c/`, `/assets/img/logo-auvp-pro.svg`). Não existe mais o token `{{base}}` do
build antigo. CSS e JS não são referenciados à mão: `site.js` importa o CSS e o Vite
injeta as tags com hash no nome.

### JavaScript

`src/js/site.js` é a entrada de todas as páginas. Cada `init*()` é um no-op quando o
componente não existe no DOM, então o mesmo arquivo serve o site inteiro. Não há
`onclick` inline: tudo é listener, por `data-*` ou id.

O **Swiper** entra por `import()` dinâmico dentro de `initLessonCarousel`. Vira um chunk
de ~151 kB que só a página da HP-12C baixa. Não importe Swiper no topo do arquivo.

### Estilos

Tailwind 4 pelo plugin `@tailwindcss/vite` (sem PostCSS e sem `tailwind.config.js`).
`src/css/main.css` começa com `@import "tailwindcss"` e um bloco `@theme` com os tokens da
marca; abaixo vêm os estilos dos componentes portados do Elementor. As páginas são
detectadas sozinhas, não há lista de `content` para manter.

A migração da v3 preservou a aparência de propósito. Por isso existem:
- um bloco de compatibilidade no `@layer base` (cor padrão de borda e `cursor: pointer`
  em botões, como na v3);
- `--color-green-600` fixado no valor da v3, a única cor da paleta que mudou visivelmente;
- tamanhos responsivos com line-height explícito (`md:text-4xl/10`): na v4 um `leading-*`
  do elemento continua valendo no breakpoint, na v3 o tamanho o sobrescrevia.

Fonte **Anek Latin** em todo o site. Verde da marca: `#166534` (`brand-green`), escuro
`#0b4021`. Cinza do texto: `#4B4B4B` (`brand-ink`). Fundo de seção: `#F6F6F6`.

## Convenções

- Comentários de código, mensagens de commit e conteúdo em **português**.
- Os componentes vieram de widgets do Elementor. A estrutura e os nomes de classe foram
  **preservados de propósito**, para o time reconhecer o código. Evite renomear.
- Acessibilidade já está aplicada (tablist/tabpanel, botões reais, aria, `focus-visible`,
  `prefers-reduced-motion`). Mantenha ao mexer nos componentes.

## Armadilhas conhecidas

- **Animações de entrada**: `.reveal-item` nasce **visível**. É o JS que aplica
  `.reveal-armed` antes de observar. Não volte o `opacity: 0` para o CSS — se o JS falhar,
  a dobra inteira some.
- **Menu do topo**: em ponteiro com hover quem abre o dropdown é o CSS
  (`:hover` / `:focus-within`); o JS só trata toque (`(hover: none)`). Misturar os dois
  faz o clique fechar um menu que o hover acabou de abrir.
- **Altura do hero** é padding, e o conteúdo tem altura fixa. Mexer no padding em X% não
  muda a altura total em X% — meça no browser antes.
- Em **sessões na nuvem**, `cdn.asupernova.com.br` e o worker do emulador HP-12C ficam
  bloqueados pela política de rede. As imagens e o iframe aparecem vazios ali, mas
  funcionam localmente e em produção. Não "conserte" isso.

## Conteúdo externo

- Fotos e arte vêm de `cdn.asupernova.com.br` (hero, retratos, foto da HP-12C).
- O emulador da HP-12C é um iframe de `hp12c-auvp.luis-martins.workers.dev`, com
  proporção fixa 450:282 — a altura é recalculada no `initHp12c`.
- Logos: `brand/README.md` mapeia qual arquivo do pacote de marca virou qual asset
  publicado em `public/assets/img/`.

## Deploy

A Vercel builda e publica a cada push; `vercel.json` fixa build, saída e `Cache-Control`
imutável para `/assets/*` (seguro, os nomes têm hash).
`.github/workflows/ci.yml` só roda `npm ci && npm run build` em PR e push na `main`.

Não existe mais workflow de GitHub Pages: dois publicadores para o mesmo site deixariam
uma cópia velha no ar na URL do Pages.

## Pendências

- [ ] **Links de checkout**: os 7 botões de preço em `index.html` estão com `href="#"`.
- [ ] **Logo da AUVP Capital**: o rodapé dos prints usa a marca da Capital, que não veio
      no pacote de logos. Está com o logo da AUVP Pro em branco no lugar.
- [ ] **Links provisórios no rodapé**: "Precisa de ajuda", Comunidade, Spotify e AUVP News
      apontam para `auvp.com.br`. Youtube e Instagram estão em `@investidorsardinha` —
      confirmar se é o perfil certo para a Pro.
- [ ] **Imagem do hero** (`--hero-image` no topo de `src/css/main.css`): nunca foi vista
      renderizada, o CDN estava bloqueado nas sessões na nuvem.
- [ ] **Termos, seção 6**: o texto original chegou com os itens 5–16 aninhados sob o item 4,
      o que não fecha gramaticalmente. Foi reconstruído como 12 itens de primeiro nível,
      com sub-itens a–h dentro do item 4. **Precisa de conferência do jurídico.**
- [ ] **Bio do Brenner**: transcrita de um print em resolução baixa; vale reler.

## Como verificar

Não há suíte de testes. O que foi usado até aqui: Playwright headless contra
`npm run preview`, checando em 390/768/1440px que não há erro de JavaScript, nem overflow
horizontal, nem link interno quebrado, e que abas, acordeões, carrossel, toggle de preços
e a jornada salarial respondem ao clique. Vale repetir isso ao mexer em componente.
