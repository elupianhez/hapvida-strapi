import { notFound } from 'next/navigation'
import React from 'react'

import { Imagem, Markdown } from '@/components/base'
import { buscarPost } from '@/lib/strapi'

type Args = { params: Promise<{ slug: string }> }

export const generateMetadata = async ({ params }: Args) => {
  const p = await buscarPost((await params).slug).catch(() => null)
  return { title: `${p?.titulo || 'Notícia'} | Hapvida`, description: p?.resumo }
}

export default async function Noticia({ params }: Args) {
  const p = await buscarPost((await params).slug)
  if (!p) notFound()
  return (
    <article className="container max-w-3xl">
      {p.categoria && <p className="text-sm font-semibold uppercase text-primary">{p.categoria.nome}</p>}
      <h1 className="mt-2 text-4xl font-bold">{p.titulo}</h1>
      {p.publishedAt && <p className="mt-2 text-sm text-muted-foreground">{new Date(p.publishedAt).toLocaleDateString('pt-BR')}</p>}
      <Imagem className="my-8 w-full rounded-2xl" midia={p.imagem} />
      <Markdown className="mt-8" texto={p.conteudo} />
    </article>
  )
}
