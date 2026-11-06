import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { Link, Midia } from '@/lib/strapi'

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/** Rich text do Strapi (Markdown). */
export const Markdown = ({ texto, className }: { texto?: string | null; className?: string }) =>
  texto ? (
    <div className={cn('prose prose-neutral max-w-none dark:prose-invert prose-a:text-primary', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
    </div>
  ) : null

export const Imagem = ({ midia, className }: { midia?: Midia | null; className?: string }) =>
  midia?.url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={midia.alternativeText || ''} className={className} loading="lazy" src={midia.url} />
  ) : null

export const Botoes = ({ links, className }: { links?: Link[] | null; className?: string }) =>
  links?.length ? (
    <div className={cn('flex flex-wrap gap-3 mt-6', className)}>
      {links.map((l, i) => (
        <a
          className={cn(
            'inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90',
            l.estilo === 'secundario'
              ? 'border border-current bg-transparent'
              : 'bg-primary text-primary-foreground',
          )}
          href={l.url}
          key={i}
        >
          {l.rotulo}
        </a>
      ))}
    </div>
  ) : null

/** Logotipo tipográfico de demonstração (não é o logo oficial). */
export const Logo = ({ marca, claro }: { marca: string; claro?: boolean }) =>
  marca === 'ndi' ? (
    <span className={cn('text-xl font-bold tracking-tight', claro ? 'text-white' : 'text-primary')}>
      NotreDame <span className="font-light">Intermédica</span>
    </span>
  ) : (
    <span className={cn('text-2xl font-extrabold lowercase tracking-tight', claro ? 'text-white' : 'text-[var(--brand-escuro)]')}>
      hap<span className="text-primary">vida</span>
    </span>
  )
