import React from 'react'

import { Imagem } from '@/components/base'
import { buscarPosts } from '@/lib/strapi'

export const metadata = { title: 'Notícias | Hapvida' }

export default async function Noticias() {
  const posts = await buscarPosts(24)
  return (
    <div className="container">
      <h1 className="mb-10 text-4xl font-bold">Notícias</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <a className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6" href={`/posts/${p.slug}`} key={p.documentId}>
            <Imagem className="h-40 w-full rounded-xl object-cover" midia={p.imagem} />
            {p.publishedAt && <span className="text-xs text-muted-foreground">{new Date(p.publishedAt).toLocaleDateString('pt-BR')}</span>}
            <strong className="text-lg">{p.titulo}</strong>
            {p.resumo && <span className="text-sm text-muted-foreground">{p.resumo}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}
