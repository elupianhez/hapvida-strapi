'use client';

// Componentes dos widgets (carregados só no navegador)
import type { ComponentType } from 'react';

type Props = { configuration: { portletInstance: Record<string, unknown>; system: Record<string, unknown> }; portletElementId: string; portletNamespace: string; contextPath: string };

export const COMPONENTES: Record<string, () => Promise<{ default: ComponentType<Props> }>> = {
  'br.com.hapvida.react-blog-generico': () => import('./react-blogs-generico/AppComponent'),
  'br.com.hapvida.react-faq-lista': () => import('./react-faq-lista/AppComponent'),
  'br.com.hapvida.react-acesse-sua-area': () => import('./react-acesse-sua-area/AppComponent'),
  'br.com.hapvida.react-filtro-categoria': () => import('./react-filtro-categoria/AppComponent'),
  'br.com.hapvida.react-filtro-input-categoria': () => import('./react-filtro-input-categoria/AppComponent'),
  'br.com.hapvida.react-barra-pesquisa': () => import('./react-barra-pesquisa/AppComponent'),
  'br.com.hapvida.react-unidades': () => import('./react-unidades/AppComponent'),
  'br.com.hapvida.react-noticias': () => import('./react-noticias/AppComponent'),
  'br.com.hapvida.react-ultimas-noticias': () => import('./react-ultimas-noticias/AppComponent'),
  'br.com.hapvida.react-category-tags-carousel': () => import('./react-category-tags-carousel/AppComponent'),
  'br.com.hapvida.react-blog-da-saude': () => import('./react-blog-da-saude/AppComponent'),
  'br.com.hapvida.react-filtro-regiao': () => import('./react-filtro-regiao/AppComponent'),
  'br.com.hapvida.react-atendimento-presencial': () => import('./react-atendimento-presencial/AppComponent'),
  'br.com.hapvida.react-ultimas-pesquisas': () => import('./react-ultimas-pesquisas/AppComponent'),
  'br.com.hapvida.react-pesquisas': () => import('./react-pesquisas/AppComponent'),
  'br.com.hapvida.react-landingpage-form': () => import('./react-landingpage-form/AppComponent'),
  'br.com.hapvida.react-combobox-faq': () => import('./react-combobox-faq/AppComponent'),
  'br.com.hapvida.react-plans-banner': () => import('./react-plans-banner/AppComponent'),
};
