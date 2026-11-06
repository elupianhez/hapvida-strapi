// Dados dos widgets: registros das coleções do Strapi (geradas a partir dos Objects) no formato que o
// código dos widgets já usa (items, totalCount, taxonomyCategoryBriefs...), com filtro, busca, ordem e paginação.
import MAPA from './objetos.json';
import { compilarFiltro, normalizar, valorDe } from './filtro';
import { midiaLocal } from './montar';
import { chaveDoEscopo } from './sites';

type Def = { nome: string; plural: string; escopo: string; campos: Record<string, string>; relacoes: Record<string, { alvo: string; tipo: string }> };
type Item = Record<string, unknown>;
const DEFS = MAPA as Record<string, Def>;

const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.SITE_API_TOKEN || '';
const CACHE_MS = 60_000;
const cache = new Map<string, { em: number; itens: Item[] }>();

const midia = (m: { id?: number; name?: string; url?: string } | null | undefined) =>
  m?.url ? { id: m.id, name: m.name, link: { href: midiaLocal(m.url), label: m.name } } : null;

const converter = (def: Def, e: Record<string, unknown>): Item => {
  const categorias = (e.categorias as { id: number; name: string }[] | null) || [];
  const item: Item = {
    id: Number(e.codigo),
    externalReferenceCode: e.erc,
    dateCreated: e.criadoEm,
    dateModified: e.modificadoEm,
    scopeKey: e.escopo,
    taxonomyCategoryBriefs: categorias.map((c) => ({ taxonomyCategoryId: c.id, taxonomyCategoryName: c.name })),
    taxonomyCategoryIds: categorias.map((c) => c.id),
  };
  for (const [campo, tipo] of Object.entries(def.campos)) {
    const v = e[campo];
    item[campo] = tipo === 'Attachment' ? midia(v as never) : v ?? null;
  }
  for (const r of Object.keys(def.relacoes)) item[`__${r}`] = e[r] || [];
  return item;
};

export const carregar = async (objeto: string): Promise<Item[] | null> => {
  const def = DEFS[objeto];
  if (!def) return null;
  const c = cache.get(objeto);
  if (c && Date.now() - c.em < CACHE_MS) return c.itens;
  const midias = Object.entries(def.campos).filter(([, t]) => t === 'Attachment').map(([k]) => k);
  const populate = midias.map((m, i) => `populate[${i}]=${m}`).join('&');
  const itens: Item[] = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${STRAPI}/api/${def.plural}?pagination[page]=${page}&pagination[pageSize]=1000${populate ? `&${populate}` : ''}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(`Strapi ${r.status} em ${def.plural}`);
    const j = await r.json();
    itens.push(...j.data.map((e: Record<string, unknown>) => converter(def, e)));
    if (page >= j.meta.pagination.pageCount) break;
  }
  cache.set(objeto, { em: Date.now(), itens });
  return itens;
};

// Relações aninhadas (nestedFields): troca os códigos pelos itens relacionados
const aninhar = async (objeto: string, itens: Item[], nested: string[]) => {
  const def = DEFS[objeto];
  const out = itens.map((i) => ({ ...i }));
  for (const [rel, { alvo }] of Object.entries(def.relacoes)) {
    if (!nested.includes(rel)) continue;
    const relacionados = new Map((await carregar(alvo))?.map((x) => [x.id, x]) || []);
    for (const i of out) i[rel] = ((i[`__${rel}`] as number[]) || []).map((c) => relacionados.get(c)).filter(Boolean);
  }
  for (const i of out) for (const k of Object.keys(i)) if (k.startsWith('__')) delete i[k];
  return out;
};

export const consultar = async (objeto: string, escopo: string | null, params: URLSearchParams) => {
  let itens = await carregar(objeto);
  if (!itens) return null;
  if (escopo) {
    const chave = await chaveDoEscopo(escopo);
    itens = itens.filter((i) => i.scopeKey === chave);
  }

  const id = params.get('__id');
  if (id) return (await aninhar(objeto, itens.filter((i) => String(i.id) === id), (params.get('nestedFields') || '').split(',')))[0] || null;

  const filtro = params.get('filter');
  if (filtro) {
    const pred = compilarFiltro(filtro);
    itens = itens.filter((i) => { try { return pred(i); } catch { return false; } });
  }
  const busca = params.get('search');
  if (busca) {
    const b = normalizar(busca);
    itens = itens.filter((i) => normalizar(JSON.stringify(i)).includes(b));
  }
  const sort = params.get('sort');
  if (sort) {
    const regras = sort.split(',').map((s) => { const [campo, dir] = s.split(':'); return { campo, dir: dir === 'desc' ? -1 : 1 }; });
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
  const pagina = pageSize === -1 ? itens : itens.slice((page - 1) * pageSize, page * pageSize);
  const campos = params.get('fields')?.split(',');
  const nested = (params.get('nestedFields') || '').split(',');
  const saida = (await aninhar(objeto, pagina, nested)).map((i) => (campos ? Object.fromEntries(campos.filter((c) => c in i).map((c) => [c, i[c]])) : i));
  return { actions: {}, facets: [], items: saida, lastPage: pageSize === -1 ? 1 : Math.max(1, Math.ceil(total / pageSize)), page, pageSize, totalCount: total };
};

// Um registro, ou os registros de uma relação dele (ex.: tipoplanos/item/<id>/planType)
export const item = async (objeto: string, id: string, relacao?: string) => {
  const itens = await carregar(objeto);
  if (!itens) return null;
  const [r] = await aninhar(objeto, itens.filter((i) => String(i.id) === id), relacao ? [relacao] : []);
  if (!r) return null;
  if (!relacao) return r;
  const lista = (r[relacao] as Item[]) || [];
  return { actions: {}, facets: [], items: lista, lastPage: 1, page: 1, pageSize: lista.length, totalCount: lista.length };
};
