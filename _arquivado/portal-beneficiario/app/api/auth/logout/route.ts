import { NextResponse, type NextRequest } from 'next/server'

import { lerSessao, PORTAL_URL, SESSION_COOKIE, urlDeLogout } from '@/lib/oidc'

export async function GET(req: NextRequest) {
  const sessao = await lerSessao(req.cookies.get(SESSION_COOKIE)?.value)
  const res = NextResponse.redirect(sessao ? urlDeLogout(sessao.idToken) : PORTAL_URL)
  res.cookies.delete(SESSION_COOKIE)
  return res
}
