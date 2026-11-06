import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { Logo } from '@/components/base'
import { buscarAparencia, buscarNavegacao } from '@/lib/strapi'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:8800'),
  title: 'Hapvida',
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [{ marca }, nav, { isEnabled: rascunho }] = await Promise.all([buscarAparencia(), buscarNavegacao(), draftMode()])

  return (
    <html data-brand={marca} lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        {rascunho && (
          <div className="bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-amber-950">
            Modo rascunho: você está vendo conteúdo não publicado ·{' '}
            <a className="underline" href="/api/sair-preview">
              sair
            </a>
          </div>
        )}
        <header className="container relative z-20 flex items-center justify-between py-8">
          <a href="/">
            <Logo marca={marca} />
          </a>
          <nav className="flex flex-wrap gap-5 text-sm font-medium">
            {nav.cabecalho?.map((l) => (
              <a className="hover:text-primary" href={l.url} key={l.url}>
                {l.rotulo}
              </a>
            ))}
            <a aria-label="Buscar" className="hover:text-primary" href="/busca">
              🔍
            </a>
          </nav>
        </header>
        <main className="flex-1 pb-24">{children}</main>
        <footer className="bg-[var(--brand-escuro)] text-white">
          <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
            <Logo claro marca={marca} />
            <nav className="flex flex-wrap gap-5 text-sm">
              {nav.rodape?.map((l) => (
                <a href={l.url} key={l.url}>
                  {l.rotulo}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
