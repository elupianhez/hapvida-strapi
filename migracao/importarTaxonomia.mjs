// Importa os vocabulários (com todas as categorias) cujas categorias aparecem nos dados já importados
// (objetos obj-* e conteúdos). Complementa importarObjetos.mjs, que importa os vocabulários citados nos widgets.
import fs from 'node:fs'
import path from 'node:path'

const env = process.env
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const STRAPI = (env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '')
const TOKEN = env.MIGRACAO_API_TOKEN
const GLOBAL = env.LIFERAY_GLOBAL_SITE_ID || '20123'
const CHAVE_POR_ID = Object.fromEntries([[GLOBAL, 'global'], ...(env.LIFERAY_SITES || '').split(',').filter(Boolean).map((s) => s.split(':'))])
const MAPA = JSON.parse(fs.readFileSync(path.join('..', 'front', 'lib', 'objetos.json'), 'utf8'))
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

let tokenLf = null
const lf = async (caminho) => {
  if (!tokenLf) tokenLf = (await (await fetch(`${ORIGEM}/o/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.LIFERAY_OAUTH_CLIENT_ID, client_secret: env.LIFERAY_OAUTH_CLIENT_SECRET }) })).json()).access_token
  let r = await fetch(ORIGEM + caminho, { headers: { Authorization: `Bearer ${tokenLf}` } })
  if (r.status === 403 || r.status === 404) r = await fetch(ORIGEM + caminho)
  return r.ok ? r.json() : null
}
const st = async (caminho, init = {}) => {
  const r = await fetch(`${STRAPI}/api/${caminho}`, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) } })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Strapi ${r.status} ${caminho.slice(0, 60)}: ${JSON.stringify(j?.error?.message || j).slice(0, 200)}`)
  return j
}
const todos = async (plural, campos) => {
  const lista = []
  for (let page = 1; ; page++) {
    const r = await st(`${plural}?${campos.map((c, i) => `fields[${i}]=${c}`).join('&')}&pagination[page]=${page}&pagination[pageSize]=1000`)
    lista.push(...r.data)
    if (page >= r.meta.pagination.pageCount) break
  }
  return lista
}
const existentes = async (plural) => Object.fromEntries((await todos(plural, ['codigo'])).map((d) => [String(d.codigo), d.documentId]))
const gravar = async (plural, mapa, codigo, data) => {
  const id = mapa[String(codigo)]
  const r = await st(id ? `${plural}/${id}` : plural, { method: id ? 'PUT' : 'POST', body: JSON.stringify({ data }) })
  return (mapa[String(codigo)] = r.data.documentId)
}

// Categorias citadas
const citadas = new Set()
for (const plural of ['conteudos', ...Object.values(MAPA).map((d) => d.plural)]) {
  for (const d of await todos(plural, ['categorias'])) for (const c of d.categorias || []) citadas.add(String(c.id))
}
const catExist = await existentes('categorias')
const faltam = env.TODAS === 'true' ? [...citadas] : [...citadas].filter((c) => !catExist[c])
log(`${citadas.size} categorias citadas, ${faltam.length} a importar`)

// Vocabulários dessas categorias
const vocabularios = new Set()
for (const c of faltam) {
  const cat = await lf(`/o/headless-admin-taxonomy/v1.0/taxonomy-categories/${c}`)
  if (cat?.parentTaxonomyVocabulary?.id) vocabularios.add(String(cat.parentTaxonomyVocabulary.id))
}
const vocExist = await existentes('vocabularios')
let n = 0
for (const vid of vocabularios) {
  const v = await lf(`/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${vid}`)
  if (!v) continue
  const docVoc = await gravar('vocabularios', vocExist, v.id, { codigo: v.id, nome: v.name, erc: v.externalReferenceCode, escopo: CHAVE_POR_ID[String(v.siteId)] || String(v.siteId) })
  for (let page = 1; ; page++) {
    const d = await lf(`/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${vid}/taxonomy-categories?flatten=true&pageSize=200&page=${page}`)
    for (const [i, c] of (d?.items || []).entries()) {
      await gravar('categorias', catExist, c.id, { codigo: c.id, nome: c.name, erc: c.externalReferenceCode, descricao: c.description || null, vocabulario: docVoc, codigoPai: c.parentTaxonomyCategory?.id || null, ordem: (page - 1) * 200 + i })
      n++
    }
    if (!d || page >= (d.lastPage || 1)) break
  }
  log(`▶ ${v.name}`)
}
log(`Fim: ${vocabularios.size} vocabulários, ${n} categorias.`)
