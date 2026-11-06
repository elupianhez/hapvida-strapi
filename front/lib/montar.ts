import type { Fragmento, Render, Widget } from './conteudo';
import { CATALOGO } from '@/widgets/catalogo';

// Monta o HTML da página: master → esqueleto da página → fragmentos (modelo + campos) → widgets.
//   <!--conteudo-->         onde a página entra no master
//   <!--f:ID-->             instância de fragmento       <!--w:ID-->  widget
//   {{c:CAMPO}}             conteúdo do campo            {{a:CAMPO:atributo}}  atributo do campo
//   {{ns}}                  namespace da instância       {{site:CHAVE}}        endereço de outro site

const escHtml = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const escAttr = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Namespace estável por instância (4 letras), usado em ids do HTML e no JS do fragmento
const namespace = (instancia: string) =>
  instancia.replace(/[^0-9a-f]/gi, '').slice(0, 4).split('').map((c) => String.fromCharCode(97 + (parseInt(c, 16) % 26))).join('') || 'frag';

const PORTA = process.env.SITE_PORTA_PUBLICA ? `:${process.env.SITE_PORTA_PUBLICA}` : '';
// URL pública da Media Library → /midia no domínio do site
const MIDIA_PUBLICA = (process.env.MIDIA_PUBLICA || 'http://localhost:9900/midia').replace(/\/+$/, '');
export const midiaLocal = (t: string) => t.split(MIDIA_PUBLICA).join('/midia');

export const montarCorpo = (d: Render) => {
  const fragmentos = new Map<string, Fragmento>();
  const widgets = new Map<string, Widget>();
  for (const f of [...(d.master?.fragmentos || []), ...d.pagina.fragmentos]) fragmentos.set(f.instancia, f);
  for (const w of [...(d.master?.widgets || []), ...d.pagina.widgets]) widgets.set(w.identificador, w);
  const sites = (t: string) => t.replace(/\{\{site:([\w-]+)\}\}/g, (_, s) => (d.dominios[s] ? `http://${d.dominios[s]}${PORTA}` : `/${s}`));

  const preencher = (html: string, profundidade = 0): string =>
    profundidade > 20
      ? html
      : html
          .replace(/<!--f:([\w-]+)-->/g, (_, id) => fragmento(id, profundidade))
          .replace(/<!--w:([\w-]+)-->/g, (_, id) => widgets.get(id)?.html || '');

  const fragmento = (id: string, profundidade: number) => {
    const f = fragmentos.get(id);
    const m = f && d.modelos[f.modelo];
    if (!f || !m) return '';
    const ns = namespace(id);
    const campos = f.campos || {};
    let html = m.html
      .replace(/\{\{c:([^}]+)\}\}/g, (_, c) => campos[c]?.html ?? '')
      .replace(/\{\{a:([^}:]+):(\w+)\}\}/g, (_, c, a) => escAttr((campos[c] as Record<string, unknown> | undefined)?.[a]))
      .replace(/\{\{ns\}\}/g, ns);
    html = preencher(html, profundidade + 1);
    // JS do fragmento: mesmo contrato de antes (fragmentElement, configuration...)
    const js = m.js
      ? `<script type="module">const configuration = ${JSON.stringify(f.configuracao || {}).replace(/</g, '\\u003c')}; const fragmentElement = document.getElementById('fragment-${id}'); const fragmentElementId = 'fragment-${id}'; const fragmentEntryLinkNamespace = '${ns}'; const fragmentNamespace = '${ns}'; const layoutMode = 'view';${m.js.replace(/\{\{ns\}\}/g, ns)}</script>`
      : '';
    return `<div id="fragment-${id}">${html}</div>${js}`;
  };

  const pagina = preencher(d.pagina.esqueleto);
  const master = d.master?.esqueleto || '<!--conteudo-->';
  const html = preencher(master.replace('<!--conteudo-->', () => pagina))
    // Dependem da página atual
    .replace(/\{\{tituloPagina\}\}/g, () => escHtml(d.pagina.seo?.tituloSeo || d.pagina.titulo))
    .replace(/\{\{caminho\}\}/g, () => escAttr(d.pagina.caminho));
  return midiaLocal(sites(html));
};

// CSS dos modelos usados, uma vez cada (variantes do mesmo tipo têm o mesmo CSS)
export const cssDosModelos = (d: Render) => [
  ...new Set([...(d.master?.fragmentos || []), ...d.pagina.fragmentos].map((f) => midiaLocal(d.modelos[f.modelo]?.css || '')).filter(Boolean)),
];

// Widgets interativos (React) da página e do master
export const widgetsInterativos = (d: Render) =>
  [...(d.master?.widgets || []), ...d.pagina.widgets]
    .filter((w) => w.modulo && w.container && CATALOGO[w.modulo])
    .map((w) => ({ container: w.container as string, modulo: w.modulo as string, configuracao: w.configuracao || {} }));
