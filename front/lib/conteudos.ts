// Conteúdos estruturados (artigos, notícias, banners) no formato que os widgets usam
// (id, title, friendlyUrlPath, contentFields, taxonomyCategoryBriefs, siteId...), com filtro, busca, ordem e paginação.
import { compilarFiltro, normalizar, valorDe } from './filtro';
import { midiaLocal } from './montar';

const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.SITE_API_TOKEN || '';
const CACHE_MS = 60_000;
type Item = Record<string, unknown>;
const cache = new Map<string, { em: number; itens: Item[] }>();

const todos = async (consulta: string) => {
  const lista: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${STRAPI}/api/${consulta}&pagination[page]=${page}&pagination[pageSize]=1000`, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}, cache: 'no-store' });
    if (!r.ok) throw new Error(`Strapi ${r.status} em ${consulta}`);
    const j = await r.json();
    lista.push(...j.data);
    if (page >= j.meta.pagination.pageCount) break;
  }
  return lista;
};

export const estruturasPorNome = async (nome: string) =>
  (await todos(`estruturas?filters[nome][$eq]=${encodeURIComponent(nome)}`)).map((e) => ({ id: Number(e.codigo), name: e.nome }));

const converter = (c: Record<string, unknown>, estrutura: number): Item => {
  const categorias = (c.categorias as { id: number; name: string }[] | null) || [];
  const campos = JSON.parse(midiaLocal(JSON.stringify(c.campos || [])));
  // Valores por nome do campo, para filtrar/ordenar por "contentFields/<campo>"
  const porCampo = Object.fromEntries((campos as { name: string; contentFieldValue?: { data?: unknown } }[]).map((f) => [f.name, f.contentFieldValue?.data]));
  return {
    id: Number(c.codigo),
    title: c.titulo,
    friendlyUrlPath: c.slug,
    description: c.descricao,
    siteId: Number(c.siteCodigo),
    contentStructureId: estrutura,
    datePublished: c.publicadoEm,
    dateCreated: c.criadoEm,
    dateModified: c.modificadoEm,
    externalReferenceCode: c.erc,
    keywords: c.palavrasChave || [],
    taxonomyCategoryBriefs: categorias.map((t) => ({ taxonomyCategoryId: t.id, taxonomyCategoryName: t.name })),
    taxonomyCategoryIds: categorias.map((t) => t.id),
    contentFields: campos,
    __cf: porCampo,
  };
};

const carregar = async (estrutura: number) => {
  const k = String(estrutura);
  const c = cache.get(k);
  if (c && Date.now() - c.em < CACHE_MS) return c.itens;
  const itens = (await todos(`conteudos?filters[estrutura][codigo][$eq]=${estrutura}`)).map((x) => converter(x, estrutura));
  cache.set(k, { em: Date.now(), itens });
  return itens;
};

const campoInterno = (t: string) => t.replace(/contentFields\//g, '__cf/');

export const consultarConteudos = async (estrutura: number, params: URLSearchParams) => {
  let itens = await carregar(estrutura);
  const filtro = params.get('filter');
  if (filtro) {
    const pred = compilarFiltro(campoInterno(filtro));
    itens = itens.filter((i) => { try { return pred(i); } catch { return false; } });
  }
  const busca = params.get('search');
  if (busca) {
    const b = normalizar(busca);
    itens = itens.filter((i) => normalizar(`${i.title} ${i.description} ${JSON.stringify(i.__cf)}`).includes(b));
  }
  const sort = params.get('sort');
  if (sort) {
    const regras = campoInterno(sort).split(',').map((s) => { const [campo, dir] = s.split(':'); return { campo, dir: dir === 'desc' ? -1 : 1 }; });
    itens = [...itens].sort((a, b) => {
      for (const { campo, dir } of regras) {
        const va = valorDe(a, campo.split('/')) as never;
        const vb = valorDe(b, campo.split('/')) as never;
        if (va == vb) continue;
        return (va > vb ? 1 : -1) * dir;
      }
      return 0;
    });
  }
  const total = itens.length;
  const pageSize = Number(params.get('pageSize') || 20);
  const page = Number(params.get('page') || 1);
  const pagina = (pageSize === -1 ? itens : itens.slice((page - 1) * pageSize, page * pageSize)).map(({ __cf, ...i }) => i);
  return { actions: {}, facets: [], items: pagina, lastPage: pageSize === -1 ? 1 : Math.max(1, Math.ceil(total / pageSize)), page, pageSize, totalCount: total };
};
