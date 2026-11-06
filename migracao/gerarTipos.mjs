// Gera os tipos de conteúdo do Strapi a partir das definições dos Objects do site atual (roda uma vez).
// Cada Object vira uma coleção com campos equivalentes, mais:
//   codigo      id de origem (links e filtros existentes continuam valendo)
//   escopo      chave do site (objetos por site) ou "global"
//   categorias  [{ id, name }] (taxonomia)
// Também gera Vocabulário e Categoria. Escreve ../cms/src/api/... e ../front/lib/objetos.json (mapa usado pela API do front).
import fs from 'node:fs'
import path from 'node:path'

const env = process.env
const ORIGEM = (env.LIFERAY_URL || '').replace(/\/+$/, '')
const CMS = path.join('..', 'cms', 'src', 'api')
const IGNORAR = new Set(['objetoexclusaos', 'objectsyncs', 'searchcounts', 'failedemailentries'])

const token = (await (await fetch(`${ORIGEM}/o/oauth2/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.LIFERAY_OAUTH_CLIENT_ID, client_secret: env.LIFERAY_OAUTH_CLIENT_SECRET }),
})).json()).access_token
const defs = (await (await fetch(`${ORIGEM}/o/object-admin/v1.0/object-definitions?pageSize=200`, { headers: { Authorization: `Bearer ${token}` } })).json()).items

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const TIPOS = {
  Text: { type: 'string' },
  LongText: { type: 'text' },
  RichText: { type: 'richtext' },
  Integer: { type: 'integer' },
  AutoIncrement: { type: 'integer' },
  LongInteger: { type: 'biginteger' },
  Decimal: { type: 'float' },
  PrecisionDecimal: { type: 'float' },
  Boolean: { type: 'boolean' },
  Date: { type: 'date' },
  DateTime: { type: 'datetime' },
  Picklist: { type: 'json' },
  MultiselectPicklist: { type: 'json' },
  Attachment: { type: 'media', multiple: false, allowedTypes: ['images', 'files', 'videos', 'audios'] },
}

const escrever = (nome, plural, display, desc, attrs) => {
  const base = path.join(CMS, nome)
  fs.mkdirSync(path.join(base, 'content-types', nome), { recursive: true })
  fs.writeFileSync(path.join(base, 'content-types', nome, 'schema.json'), `${JSON.stringify({
    kind: 'collectionType', collectionName: plural.replace(/-/g, '_'),
    info: { singularName: nome, pluralName: plural, displayName: display, description: desc },
    options: { draftAndPublish: false }, pluginOptions: {}, attributes: attrs,
  }, null, 2)}\n`)
  for (const [t, f] of [['controllers', 'createCoreController'], ['routes', 'createCoreRouter'], ['services', 'createCoreService']]) {
    fs.mkdirSync(path.join(base, t), { recursive: true })
    fs.writeFileSync(path.join(base, t, `${nome}.ts`), `import { factories } from '@strapi/strapi';\n\nexport default factories.${f}('api::${nome}.${nome}');\n`)
  }
}

const mapa = {}
for (const o of defs) {
  const origem = o.restContextPath?.split('/').pop()
  if (o.system || !origem || IGNORAR.has(origem)) continue
  const nome = `obj-${kebab(o.name)}`
  const plural = `${nome}s`
  const attrs = {
    codigo: { type: 'biginteger', unique: true },
    erc: { type: 'string' },
    escopo: { type: 'string' },
    categorias: { type: 'json' },
    criadoEm: { type: 'datetime' },
    modificadoEm: { type: 'datetime' },
  }
  const campos = {}
  for (const f of o.objectFields) {
    if (f.system || f.businessType === 'Relationship' || !TIPOS[f.businessType]) continue
    attrs[f.name] = { ...TIPOS[f.businessType] }
    campos[f.name] = f.businessType
  }
  // Relações (por enquanto: códigos dos registros relacionados; a API do front devolve os itens aninhados)
  const relacoes = {}
  for (const r of o.objectRelationships || []) {
    const alvo = defs.find((d) => d.name === r.objectDefinitionName2)?.restContextPath?.split('/').pop()
    if (!alvo) continue
    attrs[r.name] = { type: 'json' }
    relacoes[r.name] = { alvo, tipo: r.type }
  }
  const display = (o.label?.pt_BR || o.label?.en_US || o.name).trim()
  escrever(nome, plural, display, `Migrado de "${origem}"`, attrs)
  mapa[origem] = { nome, plural, escopo: o.scope, campos, relacoes }
}

escrever('vocabulario', 'vocabularios', 'Vocabulário', 'Grupo de categorias (temas, anos, tipos de notícia...)', {
  codigo: { type: 'biginteger', unique: true },
  nome: { type: 'string', required: true },
  erc: { type: 'string' },
  escopo: { type: 'string' },
})
escrever('categoria', 'categorias', 'Categoria', 'Categoria de um vocabulário', {
  codigo: { type: 'biginteger', unique: true },
  nome: { type: 'string', required: true },
  erc: { type: 'string' },
  descricao: { type: 'text' },
  vocabulario: { type: 'relation', relation: 'manyToOne', target: 'api::vocabulario.vocabulario' },
  codigoPai: { type: 'biginteger' },
  ordem: { type: 'integer' },
})

fs.writeFileSync(path.join('..', 'front', 'lib', 'objetos.json'), `${JSON.stringify(mapa, null, 2)}\n`)
console.log(`${Object.keys(mapa).length} tipos de objeto: ${Object.entries(mapa).map(([k, v]) => `${k}→${v.nome}`).join(', ')}`)
