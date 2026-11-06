import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'

/**
 * OIDC (Authorization Code + PKCE) com o Keycloak, sem bibliotecas de auth.
 * O navegador fala com o Keycloak pela URL pública; o servidor do portal troca o código
 * pela URL interna da rede Docker. O "iss" dos tokens é sempre a URL pública.
 */
const realm = process.env.KEYCLOAK_REALM || 'hapvida'
export const KC_PUBLIC = `${process.env.KEYCLOAK_PUBLIC_URL || 'http://localhost:8880'}/realms/${realm}`
const KC_INTERNAL = `${process.env.KEYCLOAK_INTERNAL_URL || 'http://localhost:8880'}/realms/${realm}`

export const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'portal-beneficiario'
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || ''
export const PORTAL_URL = process.env.PORTAL_URL || 'http://localhost:3301'
export const REDIRECT_URI = `${PORTAL_URL}/api/auth/callback`

const jwks = createRemoteJWKSet(new URL(`${KC_INTERNAL}/protocol/openid-connect/certs`))
const segredo = new TextEncoder().encode(process.env.SESSION_SECRET || 'troque-este-segredo-da-poc')

export const SESSION_COOKIE = 'portal_sessao'

export type Sessao = {
  nome: string
  email: string
  idToken: string
}

const base64url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url')

export const gerarPkce = async () => {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64url(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))),
  )
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)))
  return { verifier, challenge, state }
}

export const urlDeLogin = (challenge: string, state: string) => {
  const url = new URL(`${KC_PUBLIC}/protocol/openid-connect/auth`)
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    ui_locales: 'pt-BR',
  }).toString()
  return url.toString()
}

export const trocarCodigo = async (code: string, verifier: string) => {
  const res = await fetch(`${KC_INTERNAL}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error(`Keycloak recusou o código (${res.status}): ${await res.text()}`)
  const { id_token } = (await res.json()) as { id_token: string }

  const { payload } = await jwtVerify(id_token, jwks, { issuer: KC_PUBLIC, audience: CLIENT_ID })
  return {
    nome: String(payload.name || payload.preferred_username || ''),
    email: String(payload.email || ''),
    idToken: id_token,
  } satisfies Sessao
}

export const assinarSessao = (s: Sessao) =>
  new SignJWT(s).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('8h').sign(segredo)

export const lerSessao = async (token?: string): Promise<Sessao | null> => {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, segredo)
    return payload as unknown as Sessao
  } catch {
    return null
  }
}

export const urlDeLogout = (idToken: string) => {
  const url = new URL(`${KC_PUBLIC}/protocol/openid-connect/logout`)
  url.search = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: PORTAL_URL,
  }).toString()
  return url.toString()
}
