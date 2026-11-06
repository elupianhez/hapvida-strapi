// Extrai um site atual para um pacote de dados neutro (sem nada do Liferay), pronto para importar no Strapi.
// Roda uma vez por site. Lê o HTML público de cada página e a API de páginas (lista e SEO).
//
//   node extrair.mjs        variáveis: SITE=notredame  SITE_ID=12522378  LIFERAY_URL  LIFERAY_OAUTH_CLIENT_ID/SECRET
//
// Saída em dados/<site>/:
//   site.json     tema, CSS do tema, estilos globais, scripts de terceiros, classes do <body>
//   masters.json  esqueleto do master (cabeçalho/rodapé) com <!--conteudo--> no lugar da página
//   paginas.json  caminho, título, SEO, master, esqueleto da página, CSS da página, fragmentos, widgets
//   modelos.json  modelos de fragmento (HTML com marcadores de campo, CSS, JS)
//   midia.json    arquivos referenciados (documentos/imagens) a enviar para a Media Library
// e o CSS/fontes/imagens do tema em ../front/public/temas/<pasta-do-tema>/
//
// Marcadores:
//   <!--f:ID-->            fragmento (instância ID)          <!--w:ID-->  widget
//   <!--conteudo-->        onde o master recebe a página
//   {{c:CAMPO}}            conteúdo HTML de um campo editável
//   {{a:CAMPO:atributo}}   atributo de um campo editável (src, href, alt...)
//   {{site:CHAVE}}         endereço de outro site (resolvido pelo domínio cadastrado no Strapi)
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import * as cheerio from 'cheerio'

const env = process.env
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const SITE = env.SITE || 'notredame'
const SITE_ID = env.SITE_ID
const SAIDA = path.join('dados', SITE)
const PUBLICO = path.join('..', 'front', 'public')
const OUTROS_SITES = (env.LIFERAY_SITES || '').split(',').map((s) => s.split(':')[1]).filter(Boolean)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12)
// Para agrupar variantes/masters: ignora espaço colado às tags e sufixos aleatórios (4 letras geradas a cada
// renderização) em atributos de identificação — nunca em class, para não juntar variantes realmente diferentes
const normal = (t) =>
  t.replace(/\s*([<>])\s*/g, '$1').replace(/\s+/g, ' ')
    .replace(/\b(id|for|name|aria-[a-z]+|data-[a-z-]+)="([^"]*)"/g, (_, a, v) => `${a}="${v.replace(/([-_])[a-z]{4}(?=$|[-_])/g, '$1~')}"`)

// Mesmo cálculo do front (front/lib/montar.ts): namespace estável por instância
const namespaceDe = (instancia) =>
  instancia.replace(/[^0-9a-f]/gi, '').slice(0, 4).split('').map((c) => String.fromCharCode(97 + (parseInt(c, 16) % 26))).join('') || 'frag'
fs.mkdirSync(SAIDA, { recursive: true })

// ── Acesso ao site atual ────────────────────────────────────────────────────
let token = null
const api = async (caminho) => {
  if (!token) {
    const r = await fetch(`${ORIGEM}/o/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.LIFERAY_OAUTH_CLIENT_ID, client_secret: env.LIFERAY_OAUTH_CLIENT_SECRET }),
    })
    token = (await r.json()).access_token
  }
  const r = await fetch(ORIGEM + caminho, { headers: { Authorization: `Bearer ${token}` } })
  return r.ok ? r.json() : null
}
const baixar = async (caminho, opcoes = {}) => {
  for (let t = 1; t <= 3; t++) {
    try {
      return await fetch(caminho.startsWith('http') ? caminho : ORIGEM + caminho, { redirect: 'manual', headers: { 'User-Agent': UA }, ...opcoes })
    } catch (e) {
      if (t === 3) throw e
      await new Promise((x) => setTimeout(x, 1500 * t))
    }
  }
}

// ── URLs ────────────────────────────────────────────────────────────────────
const midia = new Set()
const REGEX_MIDIA = /(?:https?:\/\/[\w.-]+)?(\/(?:o\/adaptive-media\/)?(?:documents|image)\/[^\s"'()<>\\{}]+)/g
// Módulos próprios da Hapvida (portlets): CSS/JS ficam, servidos em /modulos/<módulo>/. O resto de /o/ é do portal.
const MODULO_HAPVIDA = /^\/o\/(br\.com\.[\w.-]+|ouvidoria\.form|especialidades-portlet|[\w.-]*gndi[\w.-]*)\//
const ehArquivoProprio = (p) => (/^\/o\/[\w-]*theme[\w-]*\//.test(p) && !/classic-theme/.test(p)) || MODULO_HAPVIDA.test(p)
const publicoDe = (p) => p.replace(/^\/o\/([\w-]*theme[\w-]*)\//, '/temas/$1/').replace(/^\/o\/([^/]+)\//, (m, mod) => (MODULO_HAPVIDA.test(m) ? `/modulos/${mod}/` : m))

// Ganchos de ciclo de vida do portal no JS de temas/fragmentos → objeto Pagina do front (front/app/.../layout.tsx)
const semLiferay = (t) =>
  t.replace(/\bAUI\(\)\.ready\(/g, 'Pagina.pronta(').replace(/\bAUI\(\)\.(?:one|all)\(/g, 'jQuery(').replace(/\bLiferay\.Portlet\.ready\(/g, 'Pagina.widgetPronto(')
    .replace(/\bLiferay\.(?:on|once)\(/g, 'Pagina.on(')
    // Verificações de existência: if (window.Liferay && Liferay.on) { ... }
    .replace(/\bwindow\.Liferay\b(?!\.)/g, 'window.Pagina').replace(/\bLiferay\.(?:on|once)\b(?!\()/g, 'Pagina.on').replace(/\bLiferay\.authToken\b/g, "''")
    // Dados da página: endereço, site (código), visitante sem login
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.getPortalURL\(\)/g, 'window.location.origin')
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.getURLCurrent\(\)/g, 'window.location.href')
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.get(?:Scope|Site)GroupId\(\)/g, 'window.__SITE__.codigo')
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.getCompanyGroupId\(\)/g, 'window.__SITE__.codigoGlobal')
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.(?:getUserId|getCompanyId)\(\)/g, "''")
    .replace(/(?:window\.)?(?:Liferay\.ThemeDisplay|themeDisplay)\.isSignedIn\(\)/g, 'false')

// Endereços do site atual viram endereços do site novo
const reescreverUrls = (texto) => {
  if (!texto) return texto
  let t = semLiferay(texto).split(ORIGEM).join('').split(ORIGEM.replace('https://', 'http://')).join('')
  // Documentos/imagens: registra e marca para trocar pela URL da Media Library na importação
  t = t.replace(REGEX_MIDIA, (_, p) => {
    const limpo = p.replace(/&amp;/g, '&')
    midia.add(limpo)
    return `{{m:${limpo}}}`
  })
  // Páginas do próprio site: /web/<site>/x → /x
  t = t.replace(new RegExp(`/web/${SITE}(?=[/"'?#\\s]|$)`, 'g'), '').replace(/href="(?=["#?])/g, 'href="/')
  // Páginas de outros sites: endereço resolvido pelo domínio cadastrado
  for (const s of OUTROS_SITES) if (s !== SITE) t = t.replace(new RegExp(`/web/${s}(?=[/"'?#\\s]|$)`, 'g'), `{{site:${s}}}`)
  // Recursos do tema e dos módulos da Hapvida
  t = t.replace(/\/o\/([\w-]*theme[\w-]*)\//g, '/temas/$1/')
  t = t.replace(/\/o\/([\w.-]+)\//g, (m, mod) => (MODULO_HAPVIDA.test(m) ? `/modulos/${mod}/` : m))
  // Serviços dos formulários (e-mail, Salesforce, ouvidoria...) → API de serviços do front
  t = t.replace(/\/o\/(email|hapvida\/open|listaDinamica|generico|palestras-cursos|corretor|ouvidoria|searchCirurgia)\//g, '/api/servicos/$1/')
  // Atributos dos campos editáveis: nome neutro (o CSS/JS existente depende deles)
  t = t.replace(/data-lfr-editable-type/g, 'data-campo').replace(/data-lfr-editable-id/g, 'data-campo-id').replace(/data-lfr-background-image-id/g, 'data-campo-fundo')
  return t
}

// ── Tema (CSS + fontes + imagens) ───────────────────────────────────────────
const temaBaixado = new Set()
const temaNoCorpo = new Set()
const baixarTema = async (url) => {
  const u = new URL(url, ORIGEM)
  if (temaBaixado.has(u.pathname)) return
  temaBaixado.add(u.pathname)
  const r = await baixar(u.pathname)
  if (r.status !== 200) return log(`   ⚠️ tema ${r.status} ${u.pathname}`)
  const destino = path.join(PUBLICO, publicoDe(u.pathname).replace(/^\//, ''))
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  if (/\.css$/.test(u.pathname)) {
    let css = await r.text()
    const deps = [
      ...[...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]),
      ...[...css.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]),
    ].filter((d) => !/^(data:|https?:|#)/.test(d))
    for (const d of deps) {
      const abs = new URL(d, ORIGEM + u.pathname)
      if (ehArquivoProprio(abs.pathname)) await baixarTema(abs.pathname)
    }
    fs.writeFileSync(destino, reescreverUrls(css))
  } else if (/\.js$/.test(u.pathname)) {
    fs.writeFileSync(destino, reescreverUrls(await r.text()))
  } else {
    fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()))
  }
}

// ── Scripts: o que é runtime do Liferay sai; o resto fica ───────────────────
// Scripts descartados que parecem código da Hapvida (não do portal): avisa para revisar
const RUNTIME_CONHECIDO = /Liferay\.(Loader|Portlet|Session|component|Icons|CSP|OAuth2|CustomDialogs|Util|detach|Language|Address|Form|DDM|AssetPublisher|Search)|__CONFIG__|importmap|frontend-js|senna|_com_liferay_|AUI\.\$|Liferay\.on\(\s*'(destroyPortlet|messagePosted)'/
const descartados = new Map()
const avisarDescarte = (corpo) => {
  const t = semLiferay(corpo || '')
  if (t.length > 200 && !RUNTIME_CONHECIDO.test(t)) {
    const marca = [...new Set(t.match(/Liferay\.[A-Za-z]+|\bAUI\b\(\)\.[a-z]+|themeDisplay\.[A-Za-z]+/g) || [])].join(',')
    const i = t.search(/Liferay|\bAUI\b|__CONFIG__|frontend-js|senna/)
    descartados.set(marca, { n: (descartados.get(marca)?.n || 0) + 1, trecho: t.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' ') })
  }
}
const ehRuntimeLiferay = (src, corpo) =>
  (src && /^\/o\/|portal-adm-dxp|\/combo\?/.test(src) && !ehArquivoProprio(new URL(src, ORIGEM).pathname)) ||
  /Liferay|\bAUI\b|__CONFIG__|importmap|frontend-js|senna|_com_liferay_/.test(semLiferay(corpo || '')) ||
  (!src && !(corpo || '').trim())

// ── Fragmentos ──────────────────────────────────────────────────────────────
const modelos = {}
const PRELUDIO = /^\s*const configuration = ([\s\S]*?); const fragmentElement = document\.querySelector\('#(fragment-[^']+)'\);(?: const fragmentElementId = '[^']*';)?(?: const fragmentEntryLinkNamespace = '[^']*';)?(?: const fragmentNamespace = '([^']*)';)?(?: const layoutMode = '[^']*';)?/

// Configuração dos widgets React: Loader.require("modulo@versao") ... initializer({configuration: {portletInstance: ...}, portletElementId})
const lerConfigWidgets = ($) => {
  const cfg = {}
  $('script').each((_, el) => {
    const t = $(el).html() || ''
    for (const m of t.matchAll(/Loader\.require\(\s*"([^"@]+)@[^"]*"[\s\S]*?portletInstance:\s*JSON\.parse\('((?:[^'\\]|\\.)*)'\)[\s\S]*?portletElementId:\s*'([^']+)'/g)) {
      let configuracao = {}
      try { configuracao = JSON.parse(m[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\')) } catch {}
      cfg[m[3]] = { modulo: m[1], configuracao }
    }
  })
  return cfg
}

// Converte uma região (corpo do master ou conteúdo da página) em esqueleto + instâncias
const processarRegiao = ($, raiz, avisos, cfgWidgets = {}, cssTipoPagina = {}) => {
  const fragmentos = []
  const widgets = []
  // CSS de portlet emitido junto do widget (o front carrega o CSS de cada widget pelo catálogo)
  raiz.find('link[rel="stylesheet"]').each((_, l) => {
    const h = $(l).attr('href') || ''
    if (!/^(https?:\/\/[^/]+)?\/o\//.test(h)) return
    const p = new URL(h, ORIGEM).pathname
    if (ehArquivoProprio(p)) temaNoCorpo.add(p)
    else $(l).remove()
  })

  // Scripts de fragmento (ficam em qualquer lugar; ligados pelo id)
  const scriptsPorFragmento = {}
  raiz.find('script').each((_, el) => {
    const corpo = $(el).html() || ''
    const m = corpo.match(PRELUDIO)
    if (!m) return
    scriptsPorFragmento[m[2]] = { configuracao: m[1], namespace: m[3], js: corpo.slice(m[0].length) }
    $(el).remove()
  })

  // Widgets (portlets): por enquanto guardamos o HTML servido; os interativos serão componentes do front
  raiz.find('.portlet-boundary').each((_, el) => {
    const w = $(el)
    const id = w.attr('id') || `w-${widgets.length}`
    const nome = (w.attr('class') || '').match(/portlet-boundary_([\w]+?)_/)?.[1] || id
    w.find('script').each((__, s) => { if (ehRuntimeLiferay($(s).attr('src'), $(s).html())) { avisarDescarte($(s).html()); $(s).remove() } })
    // Formulários que enviavam para a ação do portlet passam a enviar para a API de formulários do front
    w.find('form[action*="p_p_lifecycle=1"]').each((__, f) => { $(f).attr('action', `/api/formularios/${nome.split('_')[0].toLowerCase()}`) })
    const container = w.find('[id^="js-portlet-"]').attr('id')
    const cfg = cfgWidgets[container] || {}
    widgets.push({ id, nome, html: reescreverUrls($.html(w)), container: container || '', modulo: cfg.modulo || '', configuracao: cfg.configuracao || {} })
    w.replaceWith(`<!--w:${id}-->`)
  })

  // CSS dos fragmentos: blocos <style> emitidos junto dos fragmentos. Cada bloco vai para o fragmento cujo HTML
  // tem mais classes em comum com os seletores (o bloco logo depois do fragmento desempata).
  const classesDe = (html) => new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean))
  const estilos = raiz.find('style').toArray().map((el) => {
    const css = $(el).html() || ''
    return { el, css, classes: new Set([...css.replace(/\{[^}]*\}/g, '{}').matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1])), anterior: $(el).prev('[id^="fragment-"]').attr('id') }
  })
  // HTML próprio de cada fragmento (sem os fragmentos aninhados nem os <style>)
  const htmlInicial = Object.fromEntries(raiz.find('[id^="fragment-"]').toArray().map((el) => {
    const copia = $(el).clone()
    copia.find('[id^="fragment-"], style').remove()
    return [$(el).attr('id'), copia.html() || '']
  }))
  const cssDoFragmento = {}
  for (const e of estilos) {
    let melhor = null
    let nota = 0
    for (const [id, html] of Object.entries(htmlInicial)) {
      const cls = classesDe(html)
      const n = [...e.classes].filter((c) => cls.has(c)).length + (e.anterior === id ? 0.5 : 0)
      if (n > nota) { nota = n; melhor = id }
    }
    if (melhor && nota >= 1) {
      (cssDoFragmento[melhor] ||= []).push(e.css)
      $(e.el).remove()
    }
  }

  // CSS de cada tipo nesta página (o Liferay emite o <style> só junto de uma das instâncias)
  const tipoDe = (el) => ($(el).parent('[data-layout-structure-item-id]').attr('class') || '').split(/\s+/).map((c) => c.replace('lfr-layout-structure-item-', '')).find((c) => c && !/^[0-9a-f]{8}-/.test(c) && c !== 'container') || `fragmento-${($(el).children().first().attr('class') || $(el).children().first().attr('id') || 'sem-nome').split(/\s+/)[0]}`
  for (const el of raiz.find('[id^="fragment-"]').toArray()) {
    const blocos = cssDoFragmento[$(el).attr('id')]
    if (blocos) for (const b of blocos) { const t = (cssTipoPagina[tipoDe(el)] ||= []); if (!t.includes(b)) t.push(b) }
  }

  // Fragmentos do mais interno para o mais externo
  const usadas = new Set()
  const els = raiz.find('[id^="fragment-"]').toArray().reverse()
  for (const el of els) {
    const f = $(el)
    const idHtml = f.attr('id')
    const item = f.parent('[data-layout-structure-item-id]')
    // O id do item de layout é estável entre páginas (o id do HTML não).
    // Itens de coleção repetem o mesmo id: numerados na ordem (id-r2, id-r3...)
    const base = item.attr('data-layout-structure-item-id') || idHtml
    let instancia = base
    for (let n = 2; usadas.has(instancia); n++) instancia = `${base}-r${n}`
    usadas.add(instancia)
    const chave = tipoDe(el)

    // Campos editáveis
    const campos = {}
    f.find('[data-lfr-editable-id]').each((_, e) => {
      const c = $(e)
      const id = c.attr('data-lfr-editable-id')
      const tipo = c.attr('data-lfr-editable-type')
      const campo = { tipo }
      if (tipo === 'image') {
        campo.src = reescreverUrls(c.attr('src') || '')
        campo.alt = c.attr('alt') || ''
        c.attr('src', `{{a:${id}:src}}`).attr('alt', `{{a:${id}:alt}}`)
      } else {
        campo.html = reescreverUrls(c.html() || '')
        c.html(`{{c:${id}}}`)
        if (tipo === 'link') {
          campo.href = reescreverUrls(c.attr('href') || '')
          campo.target = c.attr('target') || ''
          c.attr('href', `{{a:${id}:href}}`)
          if (c.attr('target') != null) c.attr('target', `{{a:${id}:target}}`)
        }
      }
      campos[id] = campo
    })
    f.find('[data-lfr-background-image-id]').each((_, e) => {
      const c = $(e)
      const id = c.attr('data-lfr-background-image-id')
      const estilo = c.attr('style') || ''
      campos[id] = { tipo: 'background-image', src: reescreverUrls(estilo.match(/url\(['"]?([^'")]+)/)?.[1] || '') }
      c.attr('style', estilo.replace(/url\(['"]?[^'")]+['"]?\)/, `url({{a:${id}:src}})`))
    })

    const css = reescreverUrls((cssTipoPagina[chave] || []).join('\n'))
    const script = scriptsPorFragmento[idHtml]
    // Namespace aleatório por renderização → marcador {{ns}} (o front gera um fixo por instância)
    const ns = script?.namespace
    const semNs = (t) => (ns ? t.replace(new RegExp(`(?<![A-Za-z0-9])${ns}(?![A-Za-z0-9])`, 'g'), '{{ns}}') : t)
    const js = semNs(script?.js || '')
    if (/Liferay\.|\bAUI\b|themeDisplay/.test(semLiferay(js))) avisos.push(`fragmento ${chave}: JS usa Liferay.* (ajustar)`)

    // Scripts embutidos no HTML do fragmento: runtime do Liferay sai
    f.find('script').each((_, s) => { if (ehRuntimeLiferay($(s).attr('src'), $(s).html())) { avisarDescarte($(s).html()); $(s).remove() } })

    // Widgets dentro do fragmento: o id leva o namespace → usa o mesmo namespace estável do front
    if (ns) {
      const nsFront = namespaceDe(instancia)
      for (const w of widgets) {
        if (w.id.includes(`_${ns}_`) && (f.html() || '').includes(`<!--w:${w.id}-->`)) {
          const novo = w.id.split(`_${ns}_`).join(`_${nsFront}_`)
          f.html((f.html() || '').split(`<!--w:${w.id}-->`).join(`<!--w:${novo.split(`_${nsFront}_`).join('_{{ns}}_')}-->`))
          w.html = w.html.split(ns).join(nsFront)
          w.container = w.container.split(ns).join(nsFront)
          w.id = novo
        }
      }
    }
    const html = semNs(reescreverUrls(f.html() || ''))
    // Sufixos aleatórios de 4 letras (ids gerados a cada renderização) não distinguem variantes
    const variante = `${SITE}:${chave}~${hash(normal(html) + normal(js) + css)}`
    if (!modelos[variante]) modelos[variante] = { chave: variante, tipo: chave, html, css, js: reescreverUrls(js) }
    let configuracao = {}
    try { configuracao = JSON.parse(script?.configuracao || '{}') } catch {}
    fragmentos.push({ instancia, modelo: variante, campos, configuracao, namespace: script?.namespace || '' })
    f.replaceWith(`<!--f:${instancia}-->`)
  }

  // Estilos que sobraram na região (layout, ajustes): ficam no esqueleto, como estão
  raiz.find('script').each((_, s) => { if (ehRuntimeLiferay($(s).attr('src'), $(s).html())) { avisarDescarte($(s).html()); $(s).remove() } })
  return { fragmentos, widgets }
}

// ── Página ──────────────────────────────────────────────────────────────────
const site = { chave: SITE, temaCss: [], estilosGlobais: [], scriptsCabeca: [], scriptsCorpo: [], classesBody: '', htmlAtributos: {} }
const masters = {}
const paginas = []
const redirects = []

const extrairPagina = async (caminho, meta) => {
  const r = await baixar(`/web/${SITE}${caminho === '/' ? '' : caminho}`)
  if (r.status >= 300 && r.status < 400) {
    redirects.push({ caminho, destino: reescreverUrls(r.headers.get('location') || '/'), status: r.status })
    return null
  }
  if (r.status !== 200) return log(`   ⚠️ ${r.status} ${caminho}`)
  const $ = cheerio.load(await r.text())
  const avisos = []

  // <head>
  const head = $('head')
  const seo = {
    titulo: head.find('title').text().trim(),
    descricao: head.find('meta[name="description"]').attr('content') || '',
    palavrasChave: head.find('meta[name="keywords"]').attr('content') || '',
    canonico: reescreverUrls(head.find('link[rel="canonical"]').attr('href') || ''),
    og: Object.fromEntries(head.find('meta[property^="og:"]').toArray().map((m) => [$(m).attr('property'), reescreverUrls($(m).attr('content') || '')])),
    robots: head.find('meta[name="robots"]').attr('content') || '',
  }
  // Arquivos do tema desta página, na ordem (cada página pode usar um tema)
  const arquivosTema = []
  head.find('link[rel="stylesheet"]').each((_, l) => {
    const href = $(l).attr('href') || ''
    const u = new URL(href, ORIGEM)
    // CSS de terceiros (CDN: Swiper, Slick, fontes): fica como está
    if (u.origin !== ORIGEM) { if (!arquivosTema.includes(u.href)) arquivosTema.push(u.href); return }
    const p = u.pathname
    if (ehArquivoProprio(p) && !arquivosTema.includes(p)) arquivosTema.push(p)
  })
  let cssPagina = ''
  const lcs = head.find('link[href*="/o/layout-common-styles/"]').attr('href')
  if (lcs) cssPagina = reescreverUrls(await (await baixar(new URL(lcs, ORIGEM).pathname + new URL(lcs, ORIGEM).search)).text())
  const estilosCabeca = head.find('style').toArray().map((s) => ($(s).html() || '').trim()).filter(Boolean)
  // Scripts de terceiros (cabeça e corpo): ficam no site
  $('script[src]').each((_, s) => {
    const src = $(s).attr('src')
    // Só os do <head> vão para o site; no corpo o script fica no lugar (a ordem importa para o código vizinho).
    // JS do tema no corpo: fica no lugar, mas o arquivo é baixado (e reescrito) para o front
    if (!$(s).closest('head').length) {
      const abs = new URL(src, ORIGEM)
      if (abs.origin === ORIGEM && ehArquivoProprio(abs.pathname)) temaNoCorpo.add(abs.pathname)
      return
    }
    if (/^https?:/.test(src) && !src.startsWith(ORIGEM)) {
      const html = $.html(s)
      const alvo = $(s).closest('head').length ? site.scriptsCabeca : site.scriptsCorpo
      if (!alvo.includes(html)) alvo.push(reescreverUrls(html))
      $(s).remove()
    } else if (ehArquivoProprio(new URL(src, ORIGEM).pathname)) {
      const p = new URL(src, ORIGEM).pathname
      if (!arquivosTema.includes(p)) arquivosTema.push(p) // JS do tema (ex.: jQuery) também é arquivo do tema
    }
  })
  site.classesBody ||= ($('body').attr('class') || '').split(/\s+/).filter((c) => !/signed|controls|has-edit|lfr-/.test(c)).join(' ')
  site.htmlAtributos = { lang: $('html').attr('lang') || 'pt-BR', class: $('html').attr('class') || '' }

  // Conteúdo da página: #main-content
  const cfgWidgets = lerConfigWidgets($)
  const main = $('#main-content')
  const cssTipoPagina = {}
  const conteudo = processarRegiao($, main, avisos, cfgWidgets, cssTipoPagina)
  const esqueleto = reescreverUrls(main.html() || '')
  main.html('<!--conteudo-->')

  // Master: o resto do <body>, sem runtime do Liferay
  const corpo = $('body')
  // O que depende da página atual vira marcador (o front preenche): título acessível e ação da busca
  corpo.find('.hide-accessible[role="heading"]').text('{{tituloPagina}}')
  corpo.find('[id$="_quickAccessNav"]').remove()
  corpo.find('#controlMenu, .control-menu-container, #ControlMenu, .lfr-product-menu-panel, #yui3-css-stamp, .yui3-skin-sam, iframe[name="hidden"]').remove()
  const master = processarRegiao($, corpo, avisos, cfgWidgets, cssTipoPagina)
  corpo.find('script').each((_, s) => { if (ehRuntimeLiferay($(s).attr('src'), $(s).html())) { avisarDescarte($(s).html()); $(s).remove() } })
  const esqueletoMaster = reescreverUrls(corpo.html() || '')
  const acaoAtual = new RegExp(`action="${(caminho === '/' ? '/' : caminho).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g')
  for (const w of master.widgets) w.html = w.html.replace(acaoAtual, 'action="{{caminho}}"')
  const idMaster = hash(normal(esqueletoMaster) + JSON.stringify(master.fragmentos.map((f) => [f.modelo, f.campos])) + normal(master.widgets.map((w) => w.html).join('')))
  masters[idMaster] ||= { id: idMaster, esqueleto: esqueletoMaster, ...master }

  for (const a of arquivosTema) if (!site.temaCss.includes(a)) site.temaCss.push(a)
  paginas.push({ caminho, titulo: meta?.titulo || seo.titulo, seo, master: idMaster, esqueleto, cssPagina, estilosCabeca, arquivosTema: arquivosTema.map(publicoDe), ...conteudo, avisos })
  if (avisos.length) log(`   ⚠️ ${caminho}: ${[...new Set(avisos)].join('; ')}`)

  // Links internos (para achar páginas fora da API, ex.: /w/<conteúdo>)
  return [...new Set($('a[href]').toArray().map((a) => $(a).attr('href')))]
}

// ── Execução ────────────────────────────────────────────────────────────────
log(`Site ${SITE} (${SITE_ID})`)
const lista = []
for (let page = 1; SITE_ID; page++) {
  const d = await api(`/o/headless-delivery/v1.0/sites/${SITE_ID}/site-pages?page=${page}&pageSize=100&fields=friendlyUrlPath,title`)
  if (!d) break
  lista.push(...d.items.map((i) => ({ caminho: decodeURIComponent(i.friendlyUrlPath), titulo: i.title })))
  if (page >= d.lastPage) break
}
log(`${lista.length} páginas pela API`)

const fila = [{ caminho: '/' }, ...lista]
const vistos = new Set()
while (fila.length) {
  const p = fila.shift()
  const c = p.caminho === '/home' ? '/' : p.caminho.replace(/\/+$/, '') || '/'
  if (vistos.has(c)) continue
  vistos.add(c)
  const links = await extrairPagina(c, p)
  log(`✔ ${c} · fila ${fila.length}`)
  for (const href of links || []) {
    let u
    try { u = new URL(href, `${ORIGEM}/web/${SITE}/`) } catch { continue }
    if (u.origin !== ORIGEM) continue
    const m = decodeURIComponent(u.pathname).match(new RegExp(`^/web/${SITE}(/.*)?$`))
    if (m && !/\/-\/|\/c\/|\.(pdf|png|jpg|svg)$/i.test(m[1] || '')) fila.push({ caminho: (m[1] || '/').replace(/\/+$/, '') || '/' })
  }
}



// Estilos do <head>: os comuns a todas as páginas ficam no site; os demais vão para o CSS da página (antes do CSS de layout)
const comuns = paginas.length ? paginas[0].estilosCabeca.filter((c) => paginas.every((p) => p.estilosCabeca.includes(c))) : []
site.estilosGlobais = comuns
for (const p of paginas) {
  const proprios = p.estilosCabeca.filter((c) => !comuns.includes(c))
  p.cssPagina = [...proprios.map(reescreverUrls), p.cssPagina].filter(Boolean).join('\n')
  delete p.estilosCabeca
}

log(`Tema: ${site.temaCss.length} arquivos`)
for (const t of [...site.temaCss, ...temaNoCorpo]) if (t.startsWith('/')) await baixarTema(t)
site.temaCss = site.temaCss.map(publicoDe).filter((a) => paginas.every((p) => p.arquivosTema.includes(a)))
site.estilosGlobais = site.estilosGlobais.map(reescreverUrls)

// Arquivos do tema/módulos citados no HTML, JS e CSS extraídos (ex.: imagens em <img>): baixa os que faltam
const citados = new Set()
const varrer = (v) => { for (const m of JSON.stringify(v).matchAll(/\/(temas|modulos)\/([\w.-]+)\/([^\s"'()<>\\{}?#]+)/g)) citados.add(`/o/${m[2]}/${m[3]}`) }
;[paginas, Object.values(masters), Object.values(modelos), site].forEach(varrer)
for (const c of citados) if (!fs.existsSync(path.join(PUBLICO, publicoDe(c).replace(/^\//, '')))) await baixarTema(c)

const gravar = (nome, dados) => fs.writeFileSync(path.join(SAIDA, nome), JSON.stringify(dados, null, 1))
gravar('site.json', site)
gravar('masters.json', Object.values(masters))
gravar('paginas.json', paginas)
gravar('redirects.json', redirects)
gravar('modelos.json', Object.values(modelos))
gravar('midia.json', [...midia])
for (const [marca, { n, trecho }] of descartados) log(`   ⚠️ ${n} script(s) descartado(s) com ${marca || '(sem marca)'} — revisar: …${trecho}…`)
log(`Fim: ${paginas.length} páginas, ${redirects.length} redirects, ${Object.keys(masters).length} masters, ${Object.keys(modelos).length} modelos de fragmento, ${midia.size} arquivos de mídia.`)
