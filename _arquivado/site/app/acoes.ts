'use server'

import { enviarFormularioStrapi } from '@/lib/strapi'

export const enviarFormulario = async (_: { ok: boolean; erro: string }, form: FormData) => {
  const formulario = String(form.get('__formulario') || '')
  const dados = Object.fromEntries([...form.entries()].filter(([k]) => !k.startsWith('$') && k !== '__formulario').map(([k, v]) => [k, String(v)]))
  const ok = await enviarFormularioStrapi(formulario, dados)
  return ok ? { ok: true, erro: '' } : { ok: false, erro: 'Não foi possível enviar. Tente novamente.' }
}
