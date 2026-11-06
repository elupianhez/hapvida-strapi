// Importa os registros dos Objects e a taxonomia (vocabulários/categorias) para os tipos gerados por gerarTipos.mjs.
// Idempotente (atualiza pelo "codigo" de origem). Anexos vão para a Media Library.
//
//   node importarObjetos.mjs     variáveis: OBJETOS=noticias,faqs (filtro)  LIFERAY_SITES  LIFERAY_URL/OAUTH  STRAPI_URL  MIGRACAO_API_TOKEN
import fs from 'node:fs'
import path from 'node:path'

const env = process.env
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const STRAPI = (env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '')
const TOKEN = env.MIGRACAO_API_TOKEN
const SITES = (env.LIFERAY_SITES || '').split(',').filter(Boolean).map((s) => { const [id, chave] = s.split(':'); return { id, chave } })
const GLOBAL = env.LIFERAY_GLOBAL_SITE_ID || '20123'
const FILTRO = (env.OBJETOS || '').split(',').filter(Boolean)
const MAPA = JSON.parse(fs.readFileSync(path.join('..', 'front', 'lib', 'objetos.json'), 'utf8'))
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

let tokenLf = null
const lf = async (caminho) => {
  for (let t = 1; t <= 3; t++) {
    if (!tokenLf) {
      const r = await fetch(`${ORIGEM}/o/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.LIFERAY_OAUTH_CLIENT_ID, client_secret: env.LIFERAY_OAUTH_CLIENT_SECRET }) })
      tokenLf = (await r.json()).access_token
    }
    let r = await fetch(ORIGEM + caminho, { headers: { Authorization: `Bearer ${tokenLf}`, Accept: 'application/json' } })
    if (r.status === 401) { tokenLf = null; continue }
    // A credencial não tem acesso a alguns Objects que são públicos: tenta como visitante
    if (r.status === 403) r = await fetch(ORIGEM + caminho, { headers: { Accept: 'application/json' } })
    if (r.ok) return r.json()
    if (r.status < 500) return null
    await new Promise((x) => setTimeout(x, 1500 * t))
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
}
const pool = async (itens, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < itens.length) await fn(itens[i++]) })) }
const todos = async (caminho) => {
  const lista = []
  for (let page = 1; ; page++) {
    const d = await lf(`${caminho}${caminho.includes('?') ? '&' : '?'}page=${page}&pageSize=200`)
    lista.push(...(d?.items || []))
    if (!d || page >= (d.lastPage || 1)) break
  }
  return lista
}
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
}

// ── Mídia (anexos) ──────────────────────────────────────────────────────────
const midias = {}
for (let page = 1; ; page++) {
  const r = await st(`upload/files?filters[caption][$startsWith]=origem:&pagination[page]=${page}&pagination[pageSize]=1000`).catch(() => [])
  const lista = Array.isArray(r) ? r : r?.results || []
  for (const f of lista) midias[f.caption.slice(7)] = f.id
  break
}
const subirAnexo = async (href) => {
  if (!href) return null
  const u = new URL(href, ORIGEM)
  const p = u.pathname + u.search
  if (midias[p]) return midias[p]
  try {
    const r = await fetch(ORIGEM + p)
    if (!r.ok) return null
    const mime = (r.headers.get('content-type') || 'application/octet-stream').split(';')[0]
    const corpo = Buffer.from(await r.arrayBuffer())
    if (!corpo.length) return null
    const segs = decodeURIComponent(u.pathname).split('/').filter(Boolean)
    const nome = (segs.find((s, i) => i >= 2 && /\.\w{2,5}$/.test(s)) || segs.at(-1) || 'anexo').replace(/[^\w.\-]+/g, '-').slice(-90)
    const form = new FormData()
    form.append('files', new Blob([corpo], { type: mime }), nome)
    form.append('fileInfo', JSON.stringify({ name: nome, caption: `origem:${p}`.slice(0, 1000) }))
    const [arq] = await st('upload', { metodo: 'POST', form })
    return (midias[p] = arq.id)
  } catch (e) {
    log(`   ⚠️ anexo ${p.slice(0, 90)}: ${e.message.slice(0, 120)}`)
    return null
  }
}

// ── Taxonomia ───────────────────────────────────────────────────────────────
const vocExist = await existentesDe('vocabularios')
const catExist = await existentesDe('categorias')
let nCat = 0
// Não há listagem de vocabulários: usa os ERCs que os widgets configurados referenciam (dados/*/paginas.json)
const ercs = new Set((env.VOCABULARIOS || '').split(',').filter(Boolean))
const coletar = (v) => {
  if (Array.isArray(v)) return v.forEach(coletar)
  if (v && typeof v === 'object') return Object.entries(v).forEach(([k, x]) => (/vocabularyERC$/i.test(k) && typeof x === 'string' ? ercs.add(x) : coletar(x)))
  if (typeof v === 'string' && v.startsWith('[')) { try { coletar(JSON.parse(v)) } catch {} }
}
for (const site of fs.existsSync('dados') ? fs.readdirSync('dados') : []) {
  const f = path.join('dados', site, 'paginas.json')
  if (fs.existsSync(f)) for (const p of JSON.parse(fs.readFileSync(f, 'utf8'))) for (const w of p.widgets || []) coletar(w.configuracao)
}
for (const erc of ercs) {
  for (const { id: siteId, chave } of [{ id: GLOBAL, chave: 'global' }, ...SITES]) {
    const v = await lf(`/o/headless-admin-taxonomy/v1.0/sites/${siteId}/taxonomy-vocabularies/by-external-reference-code/${encodeURIComponent(erc)}`)
    if (!v?.id) continue
    await gravar('vocabularios', vocExist, v.id, { codigo: v.id, nome: v.name, erc: v.externalReferenceCode, escopo: chave })
    const cats = await todos(`/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${v.id}/taxonomy-categories?flatten=true`)
    await pool(cats.map((c, i) => ({ ...c, __ordem: i })), 6, async (c) => {
      await gravar('categorias', catExist, c.id, {
        codigo: c.id, nome: c.name, erc: c.externalReferenceCode, descricao: c.description || null,
        vocabulario: vocExist[String(v.id)], codigoPai: c.parentTaxonomyCategory?.id || null, ordem: c.__ordem,
      })
      nCat++
    })
  }
}
log(`Taxonomia: ${Object.keys(vocExist).length} vocabulários, ${nCat} categorias`)

// ── Objects ─────────────────────────────────────────────────────────────────
for (const [origem, def] of Object.entries(MAPA)) {
  if (FILTRO.length && !FILTRO.includes(origem)) continue
  const rels = Object.keys(def.relacoes)
  const nested = rels.length ? `?nestedFields=${rels.join(',')}&nestedFieldsDepth=1` : ''
  const escopos = def.escopo === 'site'
    ? [{ id: GLOBAL, chave: 'global' }, ...SITES].map((s) => ({ escopo: s.chave, caminho: `/o/c/${origem}/scopes/${s.id}${nested}` }))
    : [{ escopo: 'global', caminho: `/o/c/${origem}${nested}` }]
  const existentes = await existentesDe(def.plural)
  let n = 0
  for (const { escopo, caminho } of escopos) {
    const itens = await todos(caminho)
    await pool(itens, 4, async (item) => {
      const data = {
        codigo: item.id, erc: item.externalReferenceCode, escopo,
        categorias: (item.taxonomyCategoryBriefs || []).map((c) => ({ id: c.taxonomyCategoryId, name: c.taxonomyCategoryName })),
        criadoEm: item.dateCreated, modificadoEm: item.dateModified,
      }
      for (const [campo, tipo] of Object.entries(def.campos)) {
        const v = item[campo]
        if (v === undefined) continue
        data[campo] = tipo === 'Attachment' ? await subirAnexo(v?.link?.href) : v
      }
      for (const r of rels) data[r] = Array.isArray(item[r]) ? item[r].map((x) => x.id) : item[r]?.id ? [item[r].id] : []
      for (let t = 1; t <= 2; t++) {
        try {
          await gravar(def.plural, existentes, item.id, data)
          n++
          break
        } catch (e) {
          if (t === 2) log(`   ⚠️ ${origem} ${item.id}: ${e.message.slice(0, 200)}`)
        }
      }
    })
  }
  log(`▶ ${origem} → ${def.plural}: ${n} registros`)
}
log('Fim.')
