// Vocabulários e categorias (Strapi) no formato que os widgets usam (id, name, externalReferenceCode...)
const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.SITE_API_TOKEN || '';
const CACHE_MS = 60_000;

type Vocabulario = { id: number; name: string; externalReferenceCode: string; escopo: string };
type Categoria = { id: number; name: string; externalReferenceCode: string; description: string | null; taxonomyVocabularyId: number; parentTaxonomyVocabulary: { id: number; name: string }; parentTaxonomyCategory?: { id: number } };

let cache: { em: number; vocabularios: Vocabulario[]; categorias: Categoria[] } | null = null;

const todos = async (plural: string, extra = '') => {
  const lista: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${STRAPI}/api/${plural}?pagination[page]=${page}&pagination[pageSize]=1000${extra}`, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}, cache: 'no-store' });
    if (!r.ok) throw new Error(`Strapi ${r.status} em ${plural}`);
    const j = await r.json();
    lista.push(...j.data);
    if (page >= j.meta.pagination.pageCount) break;
  }
  return lista;
};

export const taxonomia = async () => {
  if (cache && Date.now() - cache.em < CACHE_MS) return cache;
  const vocabularios = (await todos('vocabularios')).map((v) => ({ id: Number(v.codigo), name: v.nome as string, externalReferenceCode: v.erc as string, escopo: v.escopo as string }));
  // Mesma ordem do site de origem (campo "ordem"); sem ordem, alfabética
  const categorias = (await todos('categorias', '&populate[vocabulario][fields][0]=codigo&populate[vocabulario][fields][1]=nome&sort[0]=ordem:asc&sort[1]=nome:asc')).map((c) => {
    const voc = c.vocabulario as { codigo: string; nome: string } | null;
    return {
      id: Number(c.codigo),
      name: c.nome as string,
      externalReferenceCode: c.erc as string,
      description: (c.descricao as string) || null,
      taxonomyVocabularyId: Number(voc?.codigo),
      parentTaxonomyVocabulary: { id: Number(voc?.codigo), name: voc?.nome || '' },
      ...(c.codigoPai ? { parentTaxonomyCategory: { id: Number(c.codigoPai) } } : {}),
    };
  });
  cache = { em: Date.now(), vocabularios, categorias };
  return cache;
};
