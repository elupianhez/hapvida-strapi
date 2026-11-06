import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocos } from '@/components/blocos'
import { buscarPagina } from '@/lib/strapi'

export const renderizarPagina = async (slug: string) => {
  const pagina = await buscarPagina(slug)
  if (!pagina) notFound()
  return (
    <article>
      <RenderBlocos blocos={pagina.layout} />
    </article>
  )
}

export const metadadosDaPagina = async (slug: string): Promise<Metadata> => {
  const p = await buscarPagina(slug).catch(() => null)
  return {
    title: p?.seo?.titulo || p?.titulo || 'Hapvida',
    description: p?.seo?.descricao,
    openGraph: p?.seo?.imagem?.url ? { images: [p.seo.imagem.url] } : undefined,
  }
}
