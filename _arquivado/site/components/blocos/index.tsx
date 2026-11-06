import React from 'react'

import type { Bloco, Midia } from '@/lib/strapi'
import { buscarColecao } from '@/lib/strapi'

import { Botoes, cn, Imagem, Markdown } from '../base'
import { FormularioCliente } from './Formulario'

type P = { b: Bloco }

const Hero = ({ b }: P) =>
  b.estilo === 'destaque' && b.imagem ? (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden text-white">
      <Imagem className="absolute inset-0 h-full w-full object-cover brightness-50" midia={b.imagem} />
      <div className="container relative">
        <h1 className="max-w-3xl text-4xl font-bold md:text-6xl">{b.titulo}</h1>
        {b.texto && <p className="mt-4 max-w-xl text-lg opacity-90">{b.texto}</p>}
        <Botoes links={b.links} />
      </div>
    </section>
  ) : (
    <section className="container py-12">
      <h1 className="text-4xl font-bold">{b.titulo}</h1>
      {b.texto && <p className="mt-3 text-lg text-muted-foreground">{b.texto}</p>}
      <Botoes links={b.links} />
    </section>
  )

const BannerDestaque = ({ b }: P) => (
  <section className="container">
    <div className={cn('grid items-center gap-8 rounded-3xl bg-card p-6 md:p-12', b.imagem && 'md:grid-cols-2')}>
      <div className={cn(b.imagemAEsquerda && 'md:order-2')}>
        {b.subtitulo && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{b.subtitulo}</p>}
        {b.titulo && <Markdown className="prose-headings:m-0 prose-p:m-0 mb-4 text-3xl font-bold md:text-4xl [&_*]:text-inherit" texto={b.titulo} />}
        {b.descricao && <Markdown className="text-muted-foreground" texto={b.descricao} />}
        {b.logos?.length > 0 && (
          <div className="mt-6 flex gap-4">
            {b.logos.map((l: Midia, i: number) => (
              <Imagem className="h-10 w-auto" key={i} midia={l} />
            ))}
          </div>
        )}
        <Botoes links={b.links} />
      </div>
      {b.imagem && <Imagem className="w-full rounded-2xl object-cover" midia={b.imagem} />}
    </div>
  </section>
)

const BannerTopo = ({ b }: P) => (
  <section className="-mt-8 bg-[var(--brand-escuro)] pb-14 pt-16 text-white">
    <div className="container">
      <h1 className="max-w-3xl text-3xl font-bold md:text-5xl">{b.titulo}</h1>
      {b.texto && <p className="mt-4 max-w-2xl text-lg opacity-90">{b.texto}</p>}
      <Botoes links={b.links} />
    </div>
  </section>
)

const GradeCards = ({ b }: P) => (
  <section className="container">
    {b.titulo && <h2 className="mb-6 text-2xl font-bold">{b.titulo}</h2>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(b.itens || []).map((c: any, i: number) => {
        const Tag = c.url ? 'a' : 'div'
        return (
          <Tag
            className={cn(
              'flex flex-col gap-3 border border-border p-6',
              b.estilo === 'branco' ? 'bg-white text-black' : 'bg-card',
              b.estilo === 'arredondado' ? 'rounded-3xl' : 'rounded-xl',
            )}
            href={c.url || undefined}
            key={i}
          >
            <Imagem className="h-12 w-12 object-contain" midia={c.imagem} />
            {c.titulo && <strong className="text-lg">{c.titulo}</strong>}
            {c.subtitulo && <span className="text-sm text-muted-foreground">{c.subtitulo}</span>}
          </Tag>
        )
      })}
    </div>
  </section>
)

const FraseDestaque = ({ b }: P) => (
  <section className="container py-8 text-center">
    <Markdown
      className="mx-auto max-w-4xl text-3xl font-light leading-tight md:text-5xl prose-p:m-0 prose-strong:font-bold prose-strong:text-primary [&_*]:text-inherit"
      texto={b.frase}
    />
  </section>
)

const Texto = ({ b }: P) => (
  <section className="container max-w-4xl">
    <Markdown texto={b.texto} />
  </section>
)

const Chamada = ({ b }: P) => (
  <section className="container">
    <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[var(--brand-escuro)] p-8 text-white md:flex-row md:items-center md:p-12">
      <Markdown className="prose-invert [&_*]:text-white" texto={b.texto} />
      <Botoes className="mt-0" links={b.links} />
    </div>
  </section>
)

// ── Lista de coleção: qualquer coleção do Strapi, com heurísticas de campos ──
const primeiro = (doc: Record<string, any>, nomes: string[]) => {
  for (const n of nomes) if (doc[n] !== undefined && doc[n] !== null && doc[n] !== '') return doc[n]
}
const TITULO = ['titulo', 'title', 'nomePlano', 'pergunta', 'cardTitle', 'name', 'nomeUnidade', 'nome']
const TEXTO = ['resumo', 'subTitulo', 'descricaoCurta', 'description', 'resposta', 'detalhe', 'cardText', 'textContent', 'conteudo']
const IMAGEM = ['imagem', 'image', 'bannerImage', 'icon', 'imagemCapa']
const LINK = ['buttonLink', 'cardLink', 'ctaPrimaryURL', 'urlBotao']
const ROTULO = ['buttonText', 'ctaPrimaryLabel', 'textoBotao']
const ehMidia = (v: unknown): v is Midia => Boolean(v && typeof v === 'object' && 'url' in (v as object))

const ListaColecao = async ({ b }: P) => {
  const itens = await buscarColecao(b.colecao, {
    documentIds: Array.isArray(b.itens) ? b.itens : undefined,
    limite: b.limite || 6,
    ordem: b.apresentacao === 'acordeao' ? undefined : 'createdAt:desc',
  }).catch(() => [])

  if (!itens.length) {
    return (
      <section className="container">
        <p className="text-sm text-muted-foreground">Nenhum item em “{b.colecao}”.</p>
      </section>
    )
  }

  if (b.apresentacao === 'acordeao') {
    return (
      <section className="container max-w-3xl">
        {b.titulo && <h2 className="mb-6 text-2xl font-bold">{b.titulo}</h2>}
        <div className="divide-y divide-border border-y border-border">
          {itens.map((d) => (
            <details className="group py-4" key={d.documentId}>
              <summary className="flex cursor-pointer list-none justify-between font-semibold">
                {String(primeiro(d, TITULO) ?? '')}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <Markdown className="pt-3 text-muted-foreground" texto={String(primeiro(d, TEXTO) ?? '')} />
            </details>
          ))}
        </div>
      </section>
    )
  }

  if (b.apresentacao === 'carrossel') {
    return (
      <section className="container">
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
          {itens.map((d) => {
            const img = primeiro(d, IMAGEM)
            return (
              <div className="relative min-w-full snap-center overflow-hidden rounded-3xl bg-[var(--brand-escuro)] text-white" key={d.documentId}>
                {ehMidia(img) && <Imagem className="absolute inset-0 h-full w-full object-cover opacity-50" midia={img} />}
                <div className="relative max-w-2xl p-8 md:p-16">
                  <Markdown className="prose-headings:m-0 text-3xl font-bold md:text-5xl [&_*]:text-white" texto={String(primeiro(d, TITULO) ?? '')} />
                  <p className="mt-4 text-lg opacity-90">{String(primeiro(d, TEXTO) ?? '')}</p>
                  <Botoes
                    links={[
                      d.ctaPrimaryLabel && { rotulo: d.ctaPrimaryLabel, url: d.ctaPrimaryURL || '#' },
                      d.ctaSecondaryLabel && { rotulo: d.ctaSecondaryLabel, url: d.ctaSecondaryURL || '#', estilo: 'secundario' },
                    ].filter(Boolean)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const base = b.colecao === 'posts' ? '/posts/' : null
  return (
    <section className="container">
      {b.titulo && <h2 className="mb-6 text-2xl font-bold">{b.titulo}</h2>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((d) => {
          const img = primeiro(d, IMAGEM)
          const beneficios = Object.keys(d)
            .filter((k) => /^benef[ií]?cio\d+$/.test(k) && d[k])
            .map((k) => String(d[k]))
          const link = base ? `${base}${d.slug}` : primeiro(d, LINK)
          const data = d.data || (base ? d.publishedAt : null)
          return (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6" key={d.documentId}>
              {ehMidia(img) && <Imagem className="h-40 w-full rounded-xl object-cover" midia={img} />}
              {typeof d.selo === 'string' && (
                <span className="self-start rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{d.selo}</span>
              )}
              {data && <span className="text-xs text-muted-foreground">{new Date(data).toLocaleDateString('pt-BR')}</span>}
              <strong className="text-lg">{String(primeiro(d, TITULO) ?? '')}</strong>
              <Markdown className="text-sm text-muted-foreground" texto={String(primeiro(d, TEXTO) ?? '')} />
              {beneficios.length > 0 && (
                <ul className="list-disc pl-5 text-sm">
                  {beneficios.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              {typeof link === 'string' && (
                <a className="mt-auto text-sm font-semibold text-primary" href={link}>
                  {String(primeiro(d, ROTULO) ?? 'Saiba mais')} →
                </a>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

const Formulario = ({ b }: P) =>
  b.formulario ? (
    <section className="container max-w-3xl">
      <Markdown className="mb-8" texto={b.introducao} />
      <FormularioCliente formulario={b.formulario} />
    </section>
  ) : null

const Legado = ({ b }: P) => (
  <section className="container">
    <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-6 text-amber-950">
      <p className="text-xs font-semibold uppercase tracking-wide">
        {b.tipo === 'widget' ? 'Widget' : 'Fragment'} do Liferay a migrar: <code>{b.chave}</code>
      </p>
      {b.textos && <p className="mt-3 whitespace-pre-line text-sm opacity-80">{b.textos}</p>}
    </div>
  </section>
)

const COMPONENTES: Record<string, React.ComponentType<P> | ((p: P) => Promise<React.ReactNode>)> = {
  'blocks.hero': Hero,
  'blocks.banner-destaque': BannerDestaque,
  'blocks.banner-topo': BannerTopo,
  'blocks.grade-cards': GradeCards,
  'blocks.frase-destaque': FraseDestaque,
  'blocks.texto': Texto,
  'blocks.chamada': Chamada,
  'blocks.lista-colecao': ListaColecao,
  'blocks.formulario': Formulario,
  'blocks.legado': Legado,
}

export const RenderBlocos = ({ blocos }: { blocos?: Bloco[] }) => (
  <>
    {(blocos || []).map((b, i) => {
      const C = COMPONENTES[b.__component] as React.ComponentType<P> | undefined
      return C ? (
        <div className="my-14 first:mt-0" key={`${b.__component}-${b.id}-${i}`}>
          <C b={b} />
        </div>
      ) : null
    })}
  </>
)
