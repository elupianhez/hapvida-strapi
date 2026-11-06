'use client';

import { createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { COMPONENTES } from '@/widgets/registro';

export type WidgetNaPagina = { container: string; modulo: string; configuracao: Record<string, unknown> };

// Monta cada widget interativo dentro do seu contêiner no HTML da página
export default function Widgets({ lista }: { lista: WidgetNaPagina[] }) {
  useEffect(() => {
    const raizes: Root[] = [];
    let ativo = true;
    for (const w of lista) {
      const carregar = COMPONENTES[w.modulo];
      const el = document.getElementById(w.container);
      if (!carregar || !el) {
        console.warn('[widgets] sem componente ou contêiner:', w.modulo, w.container);
        continue;
      }
      carregar().then(({ default: App }) => {
        if (!ativo) return;
        const raiz = createRoot(el);
        raizes.push(raiz);
        raiz.render(createElement(App, {
          configuration: { portletInstance: w.configuracao || {}, system: {} },
          portletElementId: w.container,
          portletNamespace: `_${w.container.replace(/^js-portlet-/, '')}`,
          contextPath: '',
        }));
      }).catch((e) => console.error('[widgets] falha ao carregar', w.modulo, e));
    }
    return () => {
      ativo = false;
      raizes.forEach((r) => r.unmount());
    };
  }, [lista]);
  return null;
}
