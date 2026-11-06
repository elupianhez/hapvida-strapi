import { headers } from 'next/headers';
import { cache } from 'react';

const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');

export type Fragmento = { instancia: string; modelo: string; campos: Record<string, Campo>; configuracao: Record<string, unknown> };
export type Campo = { tipo: string; html?: string; src?: string; alt?: string; href?: string; target?: string };
export type Widget = { identificador: string; nome: string; html?: string; container?: string; modulo?: string; configuracao?: Record<string, unknown> };
export type Modelo = { html: string; css: string; js: string };

export type Render = {
  redirecionar?: { para: string; status: number };
  site: {
    chave: string; nome: string; dominio: string; idioma: string; codigo: number | null; configuracoes: Record<string, unknown>;
    arquivosTema: string[]; estilosGlobais: string[];
    scriptsCabeca: string; scriptsCorpo: string; classesBody: string;
  };
  dominios: Record<string, string>;
  pagina: {
    titulo: string; caminho: string; esqueleto: string; css: string; arquivosTema: string[];
    seo: { tituloSeo?: string; descricao?: string; urlCanonica?: string; indexar?: boolean };
    fragmentos: Fragmento[]; widgets: Widget[];
  };
  master: { esqueleto: string; fragmentos: Fragmento[]; widgets: Widget[] } | null;
  modelos: Record<string, Modelo>;
};

// Domínio da requisição (sem porta): cada site responde no seu domínio
export const dominioAtual = async () => ((await headers()).get('x-forwarded-host') || (await headers()).get('host') || '').split(':')[0];

// Uma busca por requisição (layout e página compartilham)
export const buscarPagina = cache(async (dominio: string, caminho: string): Promise<Render | null> => {
  const r = await fetch(`${STRAPI}/api/renderizar?dominio=${encodeURIComponent(dominio)}&caminho=${encodeURIComponent(caminho)}`, { cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Strapi ${r.status} em ${dominio}${caminho}`);
  return r.json();
});

export const caminhoDe = (segmentos?: string[]) => `/${(segmentos || []).map(decodeURIComponent).join('/')}`;
