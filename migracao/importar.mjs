// Importa o pacote de dados/<site>/ (gerado por extrair.mjs) no Strapi. Idempotente: atualiza o que já existe.
//
//   node importar.mjs     variáveis: SITE=notredame  NOME="NotreDame Saúde"  DOMINIO=notredame.localhost
//                                    STRAPI_URL  MIGRACAO_API_TOKEN  LIFERAY_URL (só para baixar as mídias)
import fs from 'node:fs'
import path from 'node:path'

const env = process.env
const SITE = env.SITE || 'notredame'
const DOMINIO = env.DOMINIO || `${SITE}.localhost`
const NOMES = {
  hapvida: 'Hapvida', institucional: 'GNDI Institucional', clinipam: 'Clinipam', landingpage: 'Landing Pages', ccg: 'CCG Saúde',
  dashboards: 'Dashboards', minas: 'Hapvida Minas', 'hapvida-porto-alegre': 'Hapvida Porto Alegre', suavida: 'Suavida',
  'lp-hapvidacuidae': 'Hapvida Cuida', notredame: 'NotreDame Saúde',
}
const NOME = env.NOME || NOMES[SITE] || SITE
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const STRAPI = (env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '')
const TOKEN = env.MIGRACAO_API_TOKEN
const DADOS = path.join('dados', SITE)
const TEMAS = path.join('..', 'front', 'public', 'temas')
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)
const ler = (n) => JSON.parse(fs.readFileSync(path.join(DADOS, n), 'utf8'))

const st = async (caminho, { metodo = 'GET', corpo, form } = {}) => {
  for (let t = 1; t <= 10; t++) {
    try {
      const r = await fetch(`${STRAPI}/api/${caminho}`, {
        method: metodo,
        headers: { Authorization: `Bearer ${TOKEN}`, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
        body: form || (corpo ? JSON.stringify(corpo) : undefined),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok) return j
      if (r.status < 500) throw Object.assign(new Error(`Strapi ${r.status} ${metodo} ${caminho.slice(0, 80)}: ${JSON.stringify(j?.error?.details?.errors || j?.error?.message || j).slice(0, 300)}`), { definitivo: true })
    } catch (e) {
      if (e.definitivo || t === 10) throw e
    }
    await new Promise((x) => setTimeout(x, Math.min(1500 * t, 8000)))
  }
}
const pool = async (itens, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < itens.length) await fn(itens[i++]) })) }
const umPorFiltro = async (plural, filtros, extra = '') => (await st(`${plural}?${filtros}&pagination[pageSize]=1${extra}`)).data?.[0]

// ── 1. Mídias → Media Library ───────────────────────────────────────────────
const midias = ler('midia.json')
const mapa = {}
const existentes = {}
for (let page = 1; ; page++) {
  const r = await st(`upload/files?filters[caption][$startsWith]=origem:&pagination[page]=${page}&pagination[pageSize]=500`).catch(() => null)
  const lista = Array.isArray(r) ? r : r?.results || []
  for (const f of lista) existentes[f.caption.slice('origem:'.length)] = f.url
  if (!Array.isArray(r) && (!r?.pagination || page >= r.pagination.pageCount)) break
  if (Array.isArray(r)) break
}
let falhas = 0
await pool(midias, 6, async (p) => {
  if (existentes[p]) return (mapa[p] = existentes[p])
  try {
    const r = await fetch(ORIGEM + p)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const mime = (r.headers.get('content-type') || 'application/octet-stream').split(';')[0]
    const corpo = Buffer.from(await r.arrayBuffer())
    if (!corpo.length) throw new Error('vazio')
    // Scripts hospedados como documento: viram arquivo estático do front
    if (/javascript/.test(mime)) {
      const nomeJs = `${decodeURIComponent(p.split('?')[0]).split('/').filter(Boolean).at(-1).replace(/[^\w.\-]+/g, '-')}.js`
      fs.mkdirSync(path.join('..', 'front', 'public', 'arquivos'), { recursive: true })
      fs.writeFileSync(path.join('..', 'front', 'public', 'arquivos', nomeJs), corpo)
      return (mapa[p] = `/arquivos/${nomeJs}`)
    }
    const segs = decodeURIComponent(p.split('?')[0]).split('/').filter(Boolean)
    const nome = (segs.find((s, i) => i >= 2 && /\.\w{2,5}$/.test(s)) || segs.at(-1) || 'arquivo').replace(/[^\w.\-]+/g, '-').slice(-90)
    const form = new FormData()
    form.append('files', new Blob([corpo], { type: mime }), nome)
    form.append('fileInfo', JSON.stringify({ name: nome, caption: `origem:${p}`.slice(0, 1000), alternativeText: '' }))
    const [arq] = await st('upload', { metodo: 'POST', form })
    mapa[p] = arq.url
  } catch (e) {
    falhas++
    log(`   ⚠️ mídia ${p.slice(0, 100)}: ${e.message}`)
  }
})
log(`Mídias: ${Object.keys(mapa).length}/${midias.length} (${falhas} falhas)`)

// Troca os marcadores {{m:/documents/...}} pela URL da Media Library
const trocar = (v) => {
  if (typeof v === 'string') return v.replace(/\{\{m:([^}]+)\}\}/g, (_, p) => mapa[p] || '')
  if (Array.isArray(v)) return v.map(trocar)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, trocar(x)]))
  return v
}
// CSS do tema (arquivos estáticos do front)
const andar = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? andar(path.join(d, e.name)) : [path.join(d, e.name)])) : []
for (const f of andar(TEMAS).filter((f) => f.endsWith('.css'))) {
  const css = fs.readFileSync(f, 'utf8')
  // Arquivo estático do front: mídia pelo caminho /midia do próprio site
  if (css.includes('{{m:')) fs.writeFileSync(f, trocar(css).split((env.MIDIA_PUBLICA || 'http://localhost:9900/midia')).join('/midia'))
}

// ── 2. Site ─────────────────────────────────────────────────────────────────
const dadosSite = trocar(ler('site.json'))
// Configurações do site que os widgets usam (ex.: chave do Google Maps do mapa de unidades)
const configuracoes = {}
if (env.SITE_ID) {
  const r = await fetch(`${ORIGEM}/o/facilities/map-key/${env.SITE_ID}`).catch(() => null)
  const j = r?.ok ? await r.json().catch(() => null) : null
  if (j?.googleMapsKey) configuracoes.googleMapsKey = j.googleMapsKey
}
const camposSite = {
  nome: NOME, dominio: DOMINIO, chave: SITE, idioma: dadosSite.htmlAtributos?.lang || 'pt-BR',
  codigo: env.SITE_ID ? Number(env.SITE_ID) : null, configuracoes,
  arquivosTema: dadosSite.temaCss, estilosGlobais: dadosSite.estilosGlobais,
  scriptsCabeca: dadosSite.scriptsCabeca.join('\n'), scriptsCorpo: dadosSite.scriptsCorpo.join('\n'), classesBody: dadosSite.classesBody,
}
let site = (await umPorFiltro('sites', `filters[chave][$eq]=${SITE}`)) || (await umPorFiltro('sites', `filters[dominio][$eq]=${DOMINIO}`))
site = (await st(site ? `sites/${site.documentId}` : 'sites', { metodo: site ? 'PUT' : 'POST', corpo: { data: camposSite } })).data
log(`Site ${SITE} → ${DOMINIO}`)

// ── 3. Modelos de fragmento ─────────────────────────────────────────────────
const modelos = trocar(ler('modelos.json'))
const modelosExistentes = {}
for (let page = 1; ; page++) {
  const r = await st(`modelos-fragmento?fields[0]=chave&pagination[page]=${page}&pagination[pageSize]=500`)
  for (const m of r.data) modelosExistentes[m.chave] = m.documentId
  if (page >= r.meta.pagination.pageCount) break
}
await pool(modelos, 6, async (m) => {
  const data = { chave: m.chave, tipo: m.tipo, html: m.html, css: m.css, js: m.js }
  const id = modelosExistentes[m.chave]
  await st(id ? `modelos-fragmento/${id}` : 'modelos-fragmento', { metodo: id ? 'PUT' : 'POST', corpo: { data } })
})
log(`Modelos: ${modelos.length}`)
// Modelos que não são mais usados: variantes antigas deste site e chaves antigas sem prefixo de site
const atuais = new Set(modelos.map((m) => m.chave))
const obsoletos = Object.entries(modelosExistentes).filter(([c]) => (c.startsWith(`${SITE}:`) && !atuais.has(c)) || !c.includes(':'))
await pool(obsoletos, 6, async ([, id]) => { await st(`modelos-fragmento/${id}`, { metodo: 'DELETE' }).catch(() => {}) })
if (obsoletos.length) log(`Modelos removidos: ${obsoletos.length}`)

// ── 4. Masters ──────────────────────────────────────────────────────────────
const blocos = (lista) => lista.map((f) => ({ instancia: f.instancia, modelo: f.modelo, campos: f.campos, configuracao: f.configuracao }))
const widgets = (lista) => lista.map((w) => ({ identificador: w.id, nome: w.nome, html: w.html, container: w.container || null, modulo: w.modulo || null, configuracao: w.configuracao || {} }))
const masterIds = {}
for (const m of trocar(ler('masters.json'))) {
  const chave = `${SITE}-${m.id}`
  const atual = await umPorFiltro('master-pages', `filters[chave][$eq]=${chave}`)
  const data = { nome: `${NOME} · master ${m.id.slice(0, 6)}`, chave, site: site.documentId, esqueleto: m.esqueleto, fragmentos: blocos(m.fragmentos), widgets: widgets(m.widgets) }
  const r = await st(atual ? `master-pages/${atual.documentId}` : 'master-pages', { metodo: atual ? 'PUT' : 'POST', corpo: { data } })
  masterIds[m.id] = r.data.documentId
}
log(`Masters: ${Object.keys(masterIds).length}`)

// ── 5. Páginas (mães antes das filhas) ──────────────────────────────────────
const paginas = trocar(ler('paginas.json')).sort((a, b) => a.caminho.split('/').length - b.caminho.split('/').length || a.caminho.localeCompare(b.caminho))
const porCaminho = {}
const corta = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || null)
const acharPagina = async (caminho) => porCaminho[caminho] || (porCaminho[caminho] = (await umPorFiltro('paginas', `filters[caminho][$eq]=${encodeURIComponent(caminho)}&filters[site][documentId][$eq]=${site.documentId}`, '&status=draft'))?.documentId)

const garantirMae = async (caminho) => {
  if (caminho === '/' || !caminho) return null
  const id = await acharPagina(caminho)
  if (id) return id
  // Página intermediária que não existe no site atual: rascunho (não aparece no site)
  const segs = caminho.split('/').filter(Boolean)
  const mae = await garantirMae(`/${segs.slice(0, -1).join('/')}`)
  const r = await st('paginas?status=draft', { metodo: 'POST', corpo: { data: { titulo: segs.at(-1), slug: segs.at(-1), site: site.documentId, paginaPai: mae } } })
  return (porCaminho[caminho] = r.data.documentId)
}

let inicial = null
for (const p of paginas) {
  const ehInicial = p.caminho === '/'
  const segs = p.caminho.split('/').filter(Boolean)
  const slug = ehInicial ? 'home' : segs.at(-1)
  const caminhoStrapi = ehInicial ? '/home' : p.caminho
  const mae = ehInicial ? null : await garantirMae(`/${segs.slice(0, -1).join('/')}`)
  const data = {
    titulo: p.titulo || p.seo.titulo || slug,
    slug,
    site: site.documentId,
    paginaPai: mae,
    masterPage: masterIds[p.master] || null,
    esqueleto: p.esqueleto,
    css: p.cssPagina,
    arquivosTema: p.arquivosTema || [],
    fragmentos: blocos(p.fragmentos),
    widgets: widgets(p.widgets),
    seo: {
      tituloSeo: corta(p.seo.titulo, 70),
      descricao: corta(p.seo.descricao, 160),
      urlCanonica: p.seo.canonico || null,
      indexar: !/noindex/i.test(p.seo.robots || ''),
    },
  }
  try {
    const id = await acharPagina(caminhoStrapi)
    const r = await st(id ? `paginas/${id}?status=published` : 'paginas?status=published', { metodo: id ? 'PUT' : 'POST', corpo: { data } })
    porCaminho[caminhoStrapi] = r.data.documentId
    if (ehInicial) inicial = r.data.documentId
  } catch (e) {
    log(`   ⚠️ página ${p.caminho}: ${e.message}`)
  }
}
const home = paginas.find((p) => p.caminho === '/')
await st(`sites/${site.documentId}`, { metodo: 'PUT', corpo: { data: { paginaInicial: inicial, masterPagePadrao: home ? masterIds[home.master] : null } } })
log(`Páginas: ${paginas.length}`)

// ── 6. Redirecionamentos ────────────────────────────────────────────────────
for (const r of ler('redirects.json')) {
  const atual = await umPorFiltro('redirecionamentos', `filters[de][$eq]=${encodeURIComponent(r.caminho)}&filters[site][documentId][$eq]=${site.documentId}`)
  const data = { site: site.documentId, de: r.caminho, para: trocar(r.destino), status: r.status === 302 ? 302 : 301 }
  await st(atual ? `redirecionamentos/${atual.documentId}` : 'redirecionamentos', { metodo: atual ? 'PUT' : 'POST', corpo: { data } })
}
log(`Fim. Site em http://${DOMINIO}:3300`)
