import { draftMode } from 'next/headers'
import qs from 'qs'

/**
 * Cliente da API REST do Strapi (server-side, com o token de leitura do site).
 * Em modo preview (draft mode do Next), busca a versão RASCUNHO dos documentos.
 */
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.SITE_API_TOKEN

export type Midia = { url: string; alternativeText?: string | null; width?: number; height?: number; mime?: string }
export type Link = { rotulo: string; url: string; estilo?: 'primario' | 'secundario' | null }
export type Bloco = { __component: string; id: number; [k: string]: any }
export type Pagina = {
  documentId: string
  titulo: string
  slug: string
  layout: Bloco[]
  seo?: { titulo?: string; descricao?: string; imagem?: Midia | null } | null
}
export type Post = {
  documentId: string
  titulo: string
  slug: string
  resumo?: string
  conteudo?: string
  imagem?: Midia | null
  publishedAt?: string
  categoria?: { nome: string; slug: string } | null
}

export const strapi = async <T,>(caminho: string, params: Record<string, unknown> = {}, rascunho?: boolean) => {
  const status = rascunho ?? (await draftMode()).isEnabled ? 'draft' : undefined
  const query = qs.stringify({ ...params, ...(status ? { status } : {}) }, { encodeValuesOnly: true })
  const res = await fetch(`${STRAPI}/api/${caminho}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Strapi ${res.status} em /api/${caminho}: ${(await res.text()).slice(0, 200)}`)
  }
  return (await res.json()) as { data: T; meta?: any }
}

// Populate explícito de cada bloco da dynamic zone (Strapi 5).
const POPULATE_LAYOUT = {
  layout: {
    on: {
      'blocks.hero': { populate: { imagem: true, links: true } },
      'blocks.banner-destaque': { populate: { imagem: true, logos: true, links: true } },
      'blocks.banner-topo': { populate: { links: true } },
      'blocks.grade-cards': { populate: { itens: { populate: { imagem: true } } } },
      'blocks.frase-destaque': { populate: '*' },
      'blocks.texto': { populate: '*' },
      'blocks.chamada': { populate: { links: true } },
      'blocks.lista-colecao': { populate: '*' },
      'blocks.formulario': { populate: { formulario: { populate: { campos: true } } } },
      'blocks.legado': { populate: '*' },
    },
  },
  seo: { populate: { imagem: true } },
}

export const buscarPagina = async (slug: string) => {
  const r = await strapi<Pagina[]>('paginas', { filters: { slug: { $eq: slug } }, populate: POPULATE_LAYOUT })
  return r?.data?.[0] ?? null
}

export const buscarPosts = async (limite = 12) =>
  (await strapi<Post[]>('posts', { sort: 'publishedAt:desc', populate: { imagem: true, categoria: true }, pagination: { limit: limite } }))?.data ?? []

export const buscarPost = async (slug: string) =>
  (await strapi<Post[]>('posts', { filters: { slug: { $eq: slug } }, populate: { imagem: true, categoria: true, seo: true } }))?.data?.[0] ?? null

export const buscarAparencia = async () => {
  try {
    return (await strapi<{ marca: string; nomeDoSite: string }>('aparencia', {}, false))?.data ?? { marca: 'hapvida', nomeDoSite: 'Hapvida' }
  } catch {
    return { marca: 'hapvida', nomeDoSite: 'Hapvida' }
  }
}

export const buscarNavegacao = async () => {
  try {
    return (await strapi<{ cabecalho: Link[]; rodape: Link[] }>('navegacao', { populate: '*' }, false))?.data ?? { cabecalho: [], rodape: [] }
  } catch {
    return { cabecalho: [], rodape: [] }
  }
}

/** Itens de qualquer coleção (inclusive as geradas a partir dos Objects do Liferay). */
export const buscarColecao = async (colecao: string, opcoes: { documentIds?: string[]; limite?: number; ordem?: string }) => {
  const filtros = opcoes.documentIds?.length ? { documentId: { $in: opcoes.documentIds } } : undefined
  const r = await strapi<Record<string, any>[]>(colecao, {
    populate: '*',
    ...(filtros ? { filters: filtros } : {}),
    ...(opcoes.ordem ? { sort: opcoes.ordem } : {}),
    pagination: { limit: opcoes.documentIds?.length || opcoes.limite || 6 },
  }, false)
  const itens = r?.data ?? []
  // Mantém a ordem escolhida (como na Asset List do Liferay).
  return opcoes.documentIds?.length
    ? opcoes.documentIds.map((id) => itens.find((i) => i.documentId === id)).filter(Boolean) as Record<string, any>[]
    : itens
}

export const buscarRedirect = async (de: string) =>
  (await strapi<{ para: string; permanente: boolean }[]>('redirects', { filters: { de: { $eq: de } } }, false))?.data?.[0] ?? null

export const enviarFormularioStrapi = async (formulario: string, dados: Record<string, string>) => {
  const res = await fetch(`${STRAPI}/api/envios`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { formulario, dados } }),
  })
  return res.ok
}
