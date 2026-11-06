import { NextResponse, type NextRequest } from 'next/server'

import { assinarSessao, PORTAL_URL, SESSION_COOKIE, trocarCodigo } from '@/lib/oidc'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const verifier = req.cookies.get('oidc_verifier')?.value

  if (!code || !verifier || state !== req.cookies.get('oidc_state')?.value) {
    return NextResponse.redirect(`${PORTAL_URL}/?erro=login`)
  }

  try {
    const sessao = await trocarCodigo(code, verifier)
    const res = NextResponse.redirect(PORTAL_URL)
    res.cookies.set(SESSION_COOKIE, await assinarSessao(sessao), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    })
    res.cookies.delete('oidc_verifier')
    res.cookies.delete('oidc_state')
    return res
  } catch (err) {
    console.error('[auth] falha no callback:', err)
    return NextResponse.redirect(`${PORTAL_URL}/?erro=login`)
  }
}
