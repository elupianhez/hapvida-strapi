import React from 'react'

type Resultado = { id: string; tipo: string; titulo: string; url: string; descricao?: string }

// Busca no Meilisearch (índice alimentado pelo Strapi ao publicar).
const buscar = async (q: string): Promise<Resultado[]> => {
  if (!q) return []
  try {
    const res = await fetch(`${process.env.MEILI_HOST}/indexes/conteudos/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.MEILI_MASTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, limit: 20 }),
      cache: 'no-store',
    })
    return res.ok ? ((await res.json()) as { hits: Resultado[] }).hits : []
  } catch {
    return []
  }
}

export const metadata = { title: 'Busca | Hapvida' }

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const resultados = await buscar(q)
  return (
    <div className="container max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold">Busca</h1>
      <form className="mb-10 flex gap-3">
        <input className="flex-1 rounded-full border border-border px-5 py-3" defaultValue={q} name="q" placeholder="O que você procura?" />
        <button className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Buscar</button>
      </form>
      {q && <p className="mb-6 text-sm text-muted-foreground">{resultados.length} resultado(s) para “{q}”</p>}
      <ul className="space-y-6">
        {resultados.map((r) => (
          <li key={r.id}>
            <span className="text-xs uppercase text-muted-foreground">{r.tipo}</span>
            <a className="block text-lg font-semibold text-primary" href={r.url}>
              {r.titulo}
            </a>
            {r.descricao && <p className="text-sm text-muted-foreground">{r.descricao}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
