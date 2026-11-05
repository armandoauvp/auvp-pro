/**
 * Comportamentos do site AUVP Pro.
 *
 * Cada init() e um no-op quando o componente nao existe na pagina, entao este
 * unico arquivo e a entrada de todas elas.
 */
import '../css/main.css'

/* ---------------------------------------------------------------
   Cabecalho: menu mobile e dropdowns do desktop
   --------------------------------------------------------------- */
function initHeader() {
  const toggle = document.querySelector('[data-nav-toggle]')
  const mobileNav = document.getElementById('mobile-nav')

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.dataset.open === 'true'
      mobileNav.dataset.open = String(!open)
      toggle.setAttribute('aria-expanded', String(!open))
    })
  }

  const dropdowns = [...document.querySelectorAll('[data-nav-dropdown]')]
  if (!dropdowns.length) return

  // Em ponteiro com hover quem abre o menu e o CSS (:hover / :focus-within).
  // Aqui tratamos apenas o toque, onde hover nao existe.
  const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches

  const closeAll = () => {
    for (const item of dropdowns) {
      item.dataset.open = 'false'
      item.querySelector('button')?.setAttribute('aria-expanded', 'false')
    }
  }

  for (const item of dropdowns) {
    const button = item.querySelector('button')
    if (!button) continue

    button.addEventListener('click', (event) => {
      if (!isTouch()) return
      event.preventDefault()
      const wasOpen = item.dataset.open === 'true'
      closeAll()
      if (!wasOpen) {
        item.dataset.open = 'true'
        button.setAttribute('aria-expanded', 'true')
      }
    })
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-nav-dropdown]')) closeAll()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeAll()
    // Tira o foco do menu para que :focus-within deixe de mante-lo aberto.
    if (document.activeElement?.closest('[data-nav-dropdown]')) document.activeElement.blur()
  })
}

/* ---------------------------------------------------------------
   Grade curricular: abas por certificacao
   --------------------------------------------------------------- */
function initCertTabs() {
  const section = document.getElementById('auvp-modules-section')
  if (!section) return

  const buttons = [...section.querySelectorAll('.tab-btn')]
  const grids = [...section.querySelectorAll('.modules-grid')]

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const target = button.dataset.cert
      for (const other of buttons) {
        const active = other === button
        other.classList.toggle('active', active)
        other.setAttribute('aria-selected', String(active))
      }
      for (const grid of grids) {
        grid.classList.toggle('active', grid.id === target)
      }
    })
  }
}

/* ---------------------------------------------------------------
   Metodo AUVP Pro: animacao de entrada dos cards
   --------------------------------------------------------------- */
function initReveal() {
  const items = [...document.querySelectorAll('.reveal-item')]
  if (!items.length) return

  if (!('IntersectionObserver' in window)) return

  // Esconde so agora: se este script nunca rodar, os cards continuam visiveis.
  items.forEach((item) => item.classList.add('reveal-armed'))

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.15 },
  )
  items.forEach((item) => observer.observe(item))
}

/* ---------------------------------------------------------------
   Precos: alternancia individual/pacotes + dots do carrossel
   --------------------------------------------------------------- */
function initPricing() {
  const section = document.getElementById('auvp-prices')
  if (!section) return

  const btnIndividual = section.querySelector('#trigger-individual')
  const btnPacotes = section.querySelector('#trigger-pacotes')
  const viewIndividual = section.querySelector('#view-individual')
  const viewPacotes = section.querySelector('#view-pacotes')
  const tooltip = section.querySelector('#pacotes-tooltip')
  const pill = section.querySelector('#toggle-pill')
  if (!btnIndividual || !btnPacotes || !viewIndividual || !viewPacotes || !pill) return

  let hasInteracted = false

  const showView = (individual) => {
    if (!hasInteracted) {
      hasInteracted = true
      tooltip?.classList.add('tooltip-hidden')
    }
    pill.style.transform = individual ? 'translateX(0%)' : 'translateX(100%)'
    btnIndividual.classList.toggle('active', individual)
    btnPacotes.classList.toggle('active', !individual)
    btnIndividual.setAttribute('aria-selected', String(individual))
    btnPacotes.setAttribute('aria-selected', String(!individual))
    viewIndividual.classList.toggle('hidden-view', !individual)
    viewPacotes.classList.toggle('hidden-view', individual)
  }

  btnIndividual.addEventListener('click', () => showView(true))
  btnPacotes.addEventListener('click', () => showView(false))

  initCarouselDots(section)
}

/**
 * Sincroniza os dots com a rolagem horizontal dos carrosseis de uma secao.
 * Usa o centro da area visivel para decidir qual item esta ativo.
 */
function initCarouselDots(scope) {
  for (const container of scope.querySelectorAll('.carousel-container')) {
    const dotsContainer = container.parentElement?.querySelector('.dots-container')
    if (!dotsContainer) continue
    const dots = [...dotsContainer.querySelectorAll('.dot')]
    const items = [...container.querySelectorAll('.carousel-item')]
    if (!dots.length || !items.length) continue

    const sync = () => {
      const center = container.scrollLeft + container.clientWidth / 2
      let closest = 0
      let smallest = Infinity
      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2
        const distance = Math.abs(itemCenter - center)
        if (distance < smallest) {
          smallest = distance
          closest = index
        }
      })
      dots.forEach((dot, index) => dot.classList.toggle('active', index === closest))
    }

    container.addEventListener('scroll', sync, { passive: true })
    sync()
  }
}

/* ---------------------------------------------------------------
   Jornada salarial
   --------------------------------------------------------------- */
const JOURNEY_COLORS = ['#0b4021', '#166534', '#15803d', '#22c55e']

const JOURNEY_DATA = [
  {
    badge: 'Início',
    title: 'Estagiário / Assistente',
    desc: 'O ponto de partida. Foco total em aprender os processos operacionais e a cultura do banco.',
    salary: 'R$ 39k - 52k',
  },
  {
    badge: 'CPA',
    title: 'Assistente / Atendente',
    desc: 'Sua entrada oficial. Com a CPA, você já está habilitado a comercializar produtos e atender clientes.',
    salary: 'R$ 50k - 65k',
  },
  {
    badge: 'C-PRO-R',
    title: 'Gerente / Coordenador',
    desc: 'Nível tático. Você gerencia carteiras de clientes e começa a liderar pequenas frentes de negócio.',
    salary: 'R$ 66k - 91k',
  },
  {
    badge: 'C-PRO-I',
    title: 'Alta Gestão & Consultoria',
    desc: 'O topo da pirâmide. Certificações avançadas permitem gerenciar fortunas e liderar agências inteiras.',
    salary: 'R$ 92k → Ilimitado',
  },
]

function initJourney() {
  const section = document.getElementById('auvp-journey')
  if (!section) return

  const points = [...section.querySelectorAll('.timeline-point')]
  const progress = section.querySelector('#progress-bar')
  const tooltip = section.querySelector('#interaction-tooltip')
  const content = section.querySelector('#dynamic-content')
  const badge = section.querySelector('#stage-badge')
  const title = section.querySelector('#stage-title')
  const desc = section.querySelector('#stage-desc')
  const salary = section.querySelector('#stage-salary')
  if (!points.length || !progress || !content) return

  let hasInteracted = false
  let current = -1
  let timer

  const update = (index, animate) => {
    if (index === current) return
    current = index

    points.forEach((point, i) => {
      const filled = i <= index
      point.classList.toggle('active', filled)
      point.style.borderColor = filled ? JOURNEY_COLORS[i] : '#52525b'
      point.setAttribute('aria-pressed', String(i === index))
    })

    progress.style.width = `${(index / (JOURNEY_DATA.length - 1)) * 100}%`

    const apply = () => {
      const data = JOURNEY_DATA[index]
      badge.textContent = data.badge
      badge.style.backgroundColor = JOURNEY_COLORS[index]
      title.textContent = data.title
      desc.textContent = data.desc
      salary.innerHTML = `${data.salary}<span class="text-xs md:text-base font-bold text-zinc-400 ml-1 tracking-normal">/ano</span>`
      content.classList.remove('hidden-anim')
    }

    clearTimeout(timer)
    if (!animate) {
      apply()
      return
    }
    content.classList.add('hidden-anim')
    timer = setTimeout(apply, 300)
  }

  points.forEach((point, index) => {
    point.addEventListener('click', () => {
      if (!hasInteracted) {
        hasInteracted = true
        tooltip?.classList.add('tooltip-hidden')
      }
      update(index, true)
    })
  })

  update(0, false)
}

/* ---------------------------------------------------------------
   FAQ: abas laterais
   --------------------------------------------------------------- */
function initFaq() {
  for (const faq of document.querySelectorAll('[data-faq]')) {
    const tabs = [...faq.querySelectorAll('.menu-item')]
    const panels = [...faq.querySelectorAll('.faq-panel')]
    if (!tabs.length) continue

    const select = (tab) => {
      for (const other of tabs) other.setAttribute('aria-selected', String(other === tab))
      const target = tab.getAttribute('aria-controls')
      for (const panel of panels) panel.classList.toggle('is-active', panel.id === target)
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab))
      // Setas navegam entre as abas, como manda o padrao ARIA de tablist.
      tab.addEventListener('keydown', (event) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
        if (!step) return
        event.preventDefault()
        const next = tabs[(index + step + tabs.length) % tabs.length]
        next.focus()
        select(next)
      })
    })
  }
}

/* ---------------------------------------------------------------
   Emulador HP-12C (iframe com altura proporcional)
   --------------------------------------------------------------- */
function initHp12c() {
  const container = document.getElementById('hp12c-widget-container')
  if (!container) return

  const iframe = document.createElement('iframe')
  iframe.src = container.dataset.src
  iframe.title = 'Calculadora HP-12C'
  iframe.loading = 'lazy'
  iframe.setAttribute('scrolling', 'no')

  // O emulador tem proporcao fixa de 450x282; a altura acompanha a largura.
  const resize = () => {
    const height = (container.offsetWidth * 282) / 450
    iframe.style.height = `${height}px`
    container.style.height = `${height}px`
  }

  container.append(iframe)
  iframe.addEventListener('load', resize)
  window.addEventListener('resize', resize)
  resize()
}

/* ---------------------------------------------------------------
   Carrossel de aulas (Swiper) — apenas na pagina da HP-12C
   --------------------------------------------------------------- */
async function initLessonCarousel() {
  const el = document.querySelector('.lesson-swiper')
  if (!el) return

  // So a pagina da HP-12C tem carrossel: o Swiper vem em um chunk a parte,
  // carregado sob demanda, e fica fora do bundle das outras paginas.
  const [{ default: Swiper }] = await Promise.all([
    import('swiper/bundle'),
    import('swiper/css/bundle'),
  ])

  new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    speed: 600,
    grabCursor: true,
    a11y: {
      prevSlideMessage: 'Aula anterior',
      nextSlideMessage: 'Próxima aula',
    },
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
    navigation: { nextEl: '.custom-next', prevEl: '.custom-prev' },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 25 },
    },
  })
}

/* ---------------------------------------------------------------
   UTMs: guardadas durante a visita e repassadas aos links internos,
   sem sobrescrever o que o link ja tem. Outros produtos ficam de fora.
   --------------------------------------------------------------- */
function initUtms() {
  const fromUrl = {}
  new URLSearchParams(location.search).forEach((value, name) => {
    if (name.startsWith('utm_') && value) fromUrl[name] = value
  })
  let utms = fromUrl
  try {
    // UTMs novas na URL substituem as guardadas.
    if (Object.keys(fromUrl).length) sessionStorage.setItem('auvp_utms', JSON.stringify(fromUrl))
    else utms = JSON.parse(sessionStorage.getItem('auvp_utms')) || {}
  } catch {}

  const names = Object.keys(utms)
  if (!names.length) return
  const hosts = [location.hostname, 'auvp.pro', 'www.auvp.pro']

  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')
    if (!href || href.startsWith('#')) continue
    let url
    try {
      url = new URL(href, location.href)
    } catch {
      continue
    }
    if (!/^https?:$/.test(url.protocol) || !hosts.includes(url.hostname)) continue
    if (/\.(pdf|png|jpe?g|webp|svg|zip)$/i.test(url.pathname)) continue
    const missing = names.filter((name) => !url.searchParams.has(name))
    if (!missing.length) continue
    missing.forEach((name) => url.searchParams.set(name, utms[name]))
    a.setAttribute('href', url.toString())
  }
}

function init() {
  initUtms()
  initHeader()
  initCertTabs()
  initReveal()
  initPricing()
  initJourney()
  initFaq()
  initHp12c()
  initLessonCarousel()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
