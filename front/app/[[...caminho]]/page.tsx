import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import { buscarPagina, caminhoDe, dominioAtual } from '@/lib/conteudo';
import Widgets from '@/components/Widgets';
import { montarCorpo, widgetsInterativos } from '@/lib/montar';

type Props = { params: Promise<{ caminho?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await buscarPagina(await dominioAtual(), caminhoDe((await params).caminho));
  if (!d?.pagina) return {};
  const seo = d.pagina.seo || {};
  return {
    title: seo.tituloSeo || d.pagina.titulo,
    description: seo.descricao || undefined,
    alternates: seo.urlCanonica ? { canonical: seo.urlCanonica } : undefined,
    robots: seo.indexar === false ? { index: false, follow: false } : undefined,
  };
}

export default async function Pagina({ params }: Props) {
  const d = await buscarPagina(await dominioAtual(), caminhoDe((await params).caminho));
  if (!d) notFound();
  if (d.redirecionar) return d.redirecionar.status === 302 ? redirect(d.redirecionar.para) : permanentRedirect(d.redirecionar.para);
  // display: contents → o conteúdo se comporta como filho direto do <body> (o CSS do tema conta com isso)
  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: montarCorpo(d) }} />
      <Widgets lista={widgetsInterativos(d)} />
    </>
  );
}
