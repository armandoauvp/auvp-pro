import { readFile } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'

const root = import.meta.dirname
const partialsDir = path.join(root, 'src/partials')

/**
 * Resolve os parciais de HTML: `{{> nome }}` vira o conteudo de
 * src/partials/nome.html. Inclusoes aninhadas funcionam.
 *
 * Roda em `order: 'pre'` para que as tags que vierem de um parcial (scripts,
 * links, imagens) ainda passem pelo pipeline normal do Vite.
 */
function htmlPartials() {
  const cache = new Map()

  async function load(name) {
    if (!cache.has(name)) {
      cache.set(name, readFile(path.join(partialsDir, `${name}.html`), 'utf8'))
    }
    return cache.get(name)
  }

  async function render(html, depth = 0) {
    if (depth > 10) throw new Error('Inclusão de parciais circular ou profunda demais')
    const tokens = [...html.matchAll(/\{\{>\s*([\w-]+)\s*\}\}/g)]
    if (!tokens.length) return html

    let out = ''
    let last = 0
    for (const token of tokens) {
      const [match, name] = token
      let partial
      try {
        partial = await load(name)
      } catch {
        throw new Error(`Parcial não encontrado: src/partials/${name}.html`)
      }
      out += html.slice(last, token.index) + (await render(partial, depth + 1))
      last = token.index + match.length
    }
    return out + html.slice(last)
  }

  return {
    name: 'auvp-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => render(html),
    },
    configureServer(server) {
      // Editar um parcial recarrega a página aberta, como editar a própria página.
      server.watcher.add(partialsDir)
      server.watcher.on('change', (file) => {
        if (!file.startsWith(partialsDir)) return
        cache.clear()
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

/** Uma entrada por página: index na raiz e uma pasta por URL. */
function pages() {
  const entries = { main: path.join(root, 'index.html') }
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory() || ['node_modules', 'dist', 'public', 'src', 'brand', '.git', '.github'].includes(dir.name)) continue
    const file = path.join(root, dir.name, 'index.html')
    try {
      readdirSync(path.join(root, dir.name)).includes('index.html') && (entries[dir.name] = file)
    } catch {
      /* pasta sem index.html não é uma página */
    }
  }
  return entries
}

export default defineConfig({
  appType: 'mpa',
  plugins: [htmlPartials()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: pages() },
  },
  server: { port: 4000 },
  preview: { port: 4000 },
})
