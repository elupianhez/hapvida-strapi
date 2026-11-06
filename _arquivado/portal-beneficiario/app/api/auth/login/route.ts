import { NextResponse } from 'next/server'

import { gerarPkce, urlDeLogin } from '@/lib/oidc'

export async function GET() {
  const { verifier, challenge, state } = await gerarPkce()
  const res = NextResponse.redirect(urlDeLogin(challenge, state))
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 600 }
  res.cookies.set('oidc_verifier', verifier, opts)
  res.cookies.set('oidc_state', state, opts)
  return res
}
