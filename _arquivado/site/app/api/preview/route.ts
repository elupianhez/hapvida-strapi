import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/** Chamado pelo botão "Abrir preview" do Strapi (config/admin.ts). */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  if (p.get('segredo') !== process.env.PREVIEW_SECRET) return new Response('Preview não autorizado', { status: 401 })

  const destino = p.get('tipo') === 'post' ? `/posts/${p.get('slug')}` : p.get('slug') === 'home' ? '/' : `/${p.get('slug')}`
  const modo = await draftMode()
  if (p.get('status') === 'published') modo.disable()
  else modo.enable()
  redirect(destino)
}
