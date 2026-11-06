import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { buscarRedirect } from '@/lib/strapi'

/**
 * URLs antigas do Liferay (/web/...).
 * - Página já migrada e publicada → existe redirect no Strapi → 308 para a URL nova.
 * - Ainda não migrada → 404, e o gateway (nginx) reencaminha a requisição para o Liferay.
 */
export const dynamic = 'force-dynamic'

export default async function LegadoLiferay({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const de = `/web/${path.map(decodeURIComponent).join('/')}`
  const r = await buscarRedirect(de).catch(() => null)
  if (!r) notFound()
  if (r.permanente) permanentRedirect(r.para)
  redirect(r.para)
}
