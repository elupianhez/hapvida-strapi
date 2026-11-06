// Importa os conteúdos estruturados (artigos, notícias, banners, cards) e as estruturas para o Strapi.
// Imagens e documentos citados nos campos vão para a Media Library. Idempotente (pelo "codigo" de origem).
//
//   node importarConteudos.mjs     variáveis: ESTRUTURAS=6110912,5826647 (filtro)  LIFERAY_SITES  LIFERAY_URL/OAUTH  STRAPI_URL  MIGRACAO_API_TOKEN
const env = process.env
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const STRAPI = (env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '')
const TOKEN = env.MIGRACAO_API_TOKEN
const GLOBAL = env.LIFERAY_GLOBAL_SITE_ID || '20123'
const SITES = [{ id: GLOBAL, chave: 'global' }, ...(env.LIFERAY_SITES || '').split(',').filter(Boolean).map((s) => { const [id, chave] = s.split(':'); return { id, chave } })]
const CHAVE_POR_ID = Object.fromEntries(SITES.map((s) => [String(s.id), s.chave]))
const FILTRO = (env.ESTRUTURAS || '').split(',').filter(Boolean)
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

let tokenLf = null
const lf = async (caminho) => {
  for (let t = 1; t <= 4; t++) {
    if (!tokenLf) {
      const r = await fetch(`${ORIGEM}/o/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.LIFERAY_OAUTH_CLIENT_ID, client_secret: env.LIFERAY_OAUTH_CLIENT_SECRET }) })
      tokenLf = (await r.json()).access_token
    }
    const r = await fetch(ORIGEM + caminho, { headers: { Authorization: `Bearer ${tokenLf}`, Accept: 'application/json' } }).catch(() => null)
    if (r?.status === 401) { tokenLf = null; continue }
    if (r?.ok) return r.json()
    if (r && r.status < 500) return null
    await new Promise((x) => setTimeout(x, 2000 * t))
  }
  return null
}
const st = async (caminho, { metodo = 'GET', corpo, form } = {}) => {
  for (let t = 1; t <= 10; t++) {
    try {
      const r = await fetch(`${STRAPI}/api/${caminho}`, { method: metodo, headers: { Authorization: `Bearer ${TOKEN}`, ...(corpo ? { 'Content-Type': 'application/json' } : {}) }, body: form || (corpo ? JSON.stringify(corpo) : undefined) })
      const j = await r.json().catch(() => ({}))
      if (r.ok) return j
      if (r.status < 500) throw Object.assign(new Error(`Strapi ${r.status} ${metodo} ${caminho.slice(0, 60)}: ${JSON.stringify(j?.error?.details?.errors || j?.error?.message || j).slice(0, 300)}`), { definitivo: true })
    } catch (e) {
      if (e.definitivo || t === 10) throw e
    }
    await new Promise((x) => setTimeout(x, Math.min(1500 * t, 8000)))
  }
  throw new Error(`Strapi indisponível em ${caminho.slice(0, 60)}`)
}
const pool = async (itens, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < itens.length) await fn(itens[i++]) })) }
const existentesDe = async (plural) => {
  const m = {}
  for (let page = 1; ; page++) {
    const r = await st(`${plural}?fields[0]=codigo&pagination[page]=${page}&pagination[pageSize]=1000`)
    for (const d of r.data) m[String(d.codigo)] = d.documentId
    if (page >= r.meta.pagination.pageCount) break
  }
  return m
}
const gravar = async (plural, existentes, codigo, data) => {
  const id = existentes[String(codigo)]
  const r = await st(id ? `${plural}/${id}` : plural, { metodo: id ? 'PUT' : 'POST', corpo: { data } })
  existentes[String(codigo)] = r.data.documentId
  return r.data.documentId
}

// ── Mídia ───────────────────────────────────────────────────────────────────
const mapa = {}
for (let page = 1; ; page++) {
  const r = await st(`upload/files?filters[caption][$startsWith]=origem:&pagination[page]=${page}&pagination[pageSize]=1000`).catch(() => [])
  const lista = Array.isArray(r) ? r : r?.results || []
  for (const f of lista) mapa[f.caption.slice(7)] = f.url
  break
}
const emAndamento = new Map()
const subir = (p) => {
  if (mapa[p] !== undefined) return Promise.resolve(mapa[p])
  if (emAndamento.has(p)) return emAndamento.get(p)
  const prom = (async () => {
    try {
      const r = await fetch(ORIGEM + p)
      if (!r.ok) return (mapa[p] = null)
      const mime = (r.headers.get('content-type') || 'application/octet-stream').split(';')[0]
      const corpo = Buffer.from(await r.arrayBuffer())
      if (!corpo.length) return (mapa[p] = null)
      const segs = decodeURIComponent(p.split('?')[0]).split('/').filter(Boolean)
      const nome = (segs.find((s, i) => i >= 2 && /\.\w{2,5}$/.test(s)) || segs.at(-1) || 'arquivo').replace(/[^\w.\-]+/g, '-').slice(-90)
      const form = new FormData()
      form.append('files', new Blob([corpo], { type: mime }), nome)
      form.append('fileInfo', JSON.stringify({ name: nome, caption: `origem:${p}`.slice(0, 1000) }))
      const [arq] = await st('upload', { metodo: 'POST', form })
      return (mapa[p] = arq.url)
    } catch (e) {
      log(`   ⚠️ mídia ${p.slice(0, 90)}: ${e.message.slice(0, 100)}`)
      return (mapa[p] = null)
    }
  })()
  emAndamento.set(p, prom)
  return prom
}
const REGEX = /(?:https?:\/\/[\w.-]+)?(\/(?:o\/adaptive-media\/)?(?:documents|image)\/[^\s"'()<>\\{}]+)/g
// Sobe tudo que os campos citam e troca pelos endereços da Media Library
const trocarMidias = async (valor) => {
  const texto = JSON.stringify(valor)
  const caminhos = [...new Set([...texto.matchAll(REGEX)].map((m) => m[1].replace(/\\u0026|&amp;/g, '&')))]
  for (const c of caminhos) await subir(c)
  return JSON.parse(texto.replace(REGEX, (todo, p) => mapa[p.replace(/\\u0026|&amp;/g, '&')] || todo))
}

// ── Estruturas e conteúdos ──────────────────────────────────────────────────
const estruturas = await existentesDe('estruturas')
const conteudos = await existentesDe('conteudos')
for (const site of SITES) {
  const lista = (await lf(`/o/headless-delivery/v1.0/sites/${site.id}/content-structures?pageSize=200`))?.items || []
  for (const e of lista) {
    if (FILTRO.length && !FILTRO.includes(String(e.id))) continue
    const idEstrutura = await gravar('estruturas', estruturas, e.id, {
      codigo: e.id, nome: e.name, escopo: site.chave,
      campos: (e.contentStructureFields || []).map((f) => ({ nome: f.name, rotulo: f.label, tipo: f.dataType, repetivel: f.repeatable })),
    })
    let n = 0
    for (let page = 1; ; page++) {
      const d = await lf(`/o/headless-delivery/v1.0/content-structures/${e.id}/structured-contents?nestedFields=taxonomyCategoryBriefs&pageSize=100&page=${page}`)
      if (!d?.items?.length) break
      await pool(d.items, 6, async (c) => {
        try {
          const campos = await trocarMidias(c.contentFields || [])
          await gravar('conteudos', conteudos, c.id, {
            codigo: c.id, estrutura: idEstrutura, titulo: c.title || '(sem título)', slug: c.friendlyUrlPath, descricao: c.description || null,
            siteCodigo: c.siteId, escopo: CHAVE_POR_ID[String(c.siteId)] || String(c.siteId),
            publicadoEm: c.datePublished, criadoEm: c.dateCreated, modificadoEm: c.dateModified,
            categorias: (c.taxonomyCategoryBriefs || []).map((t) => ({ id: t.taxonomyCategoryId, name: t.taxonomyCategoryName })),
            palavrasChave: c.keywords || [], campos, erc: c.externalReferenceCode,
          })
          n++
        } catch (err) {
          log(`   ⚠️ conteúdo ${c.id}: ${err.message.slice(0, 160)}`)
        }
      })
      if (page >= d.lastPage) break
    }
    log(`▶ ${site.chave} · ${e.name}: ${n} conteúdos`)
  }
}
log(`Fim. Mídias: ${Object.values(mapa).filter(Boolean).length}`)
