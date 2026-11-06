/**
 * Consumo headless do CMS: o portal não tem conteúdo próprio, ele lê avisos e tema
 * da API REST do Strapi. Qualquer outro canal (app, totem, WhatsApp) faria o mesmo.
 */
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.PORTAL_API_TOKEN
export const SITE_URL = process.env.SITE_URL || 'http://localhost:8800'

const get = async <T,>(path: string, fallback: T): Promise<T> => {
  try {
    const res = await fetch(`${STRAPI}/api/${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    })
    if (!res.ok) return fallback
    return ((await res.json()) as { data: T }).data ?? fallback
  } catch {
    return fallback
  }
}

export const buscarAparencia = () =>
  get<{ marca: string; nomeDoSite: string }>('aparencia', { marca: 'hapvida', nomeDoSite: 'Hapvida' })

export type Aviso = { documentId: string; titulo: string; slug: string; resumo?: string }

export const buscarAvisos = () => {
  const q = new URLSearchParams({
    'filters[categoria][slug][$eq]': 'avisos',
    sort: 'publishedAt:desc',
    'pagination[limit]': '3',
    'fields[0]': 'titulo',
    'fields[1]': 'slug',
    'fields[2]': 'resumo',
  })
  return get<Aviso[]>(`posts?${q}`, [])
}
