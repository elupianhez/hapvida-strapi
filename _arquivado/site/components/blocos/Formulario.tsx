'use client'

import React, { useActionState } from 'react'

import { enviarFormulario } from '@/app/acoes'

type Campo = { nome: string; rotulo: string; tipo: 'texto' | 'email' | 'textarea'; obrigatorio?: boolean; largura?: string }
type Formulario = { documentId: string; titulo: string; botao?: string; mensagemSucesso?: string; campos: Campo[] }

/** Formulário montado no CMS (substitui Liferay Forms). O envio fica salvo em "Envios". */
export const FormularioCliente = ({ formulario }: { formulario: Formulario }) => {
  const [estado, acao, enviando] = useActionState(enviarFormulario, { ok: false, erro: '' })

  if (estado.ok) {
    return <p className="rounded-xl bg-card p-6 text-lg font-semibold">{formulario.mensagemSucesso || 'Enviado!'}</p>
  }

  return (
    <form action={acao} className="grid grid-cols-2 gap-4 rounded-2xl border border-border p-6">
      <input name="__formulario" type="hidden" value={formulario.documentId} />
      {formulario.campos.map((c) => (
        <label className={c.largura === 'metade' ? 'col-span-2 md:col-span-1' : 'col-span-2'} key={c.nome}>
          <span className="mb-1 block text-sm font-medium">
            {c.rotulo}
            {c.obrigatorio && ' *'}
          </span>
          {c.tipo === 'textarea' ? (
            <textarea className="w-full rounded-lg border border-border bg-background p-3" name={c.nome} required={c.obrigatorio} rows={4} />
          ) : (
            <input
              className="w-full rounded-lg border border-border bg-background p-3"
              name={c.nome}
              required={c.obrigatorio}
              type={c.tipo === 'email' ? 'email' : 'text'}
            />
          )}
        </label>
      ))}
      {estado.erro && <p className="col-span-2 text-sm text-red-600">{estado.erro}</p>}
      <button
        className="col-span-2 justify-self-start rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        disabled={enviando}
        type="submit"
      >
        {enviando ? 'Enviando…' : formulario.botao || 'Enviar'}
      </button>
    </form>
  )
}
