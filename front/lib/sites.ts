// Sites cadastrados no Strapi: domínio, chave e código (o código identifica o site nos dados migrados)
const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.SITE_API_TOKEN || '';
export const CODIGO_GLOBAL = Number(process.env.CODIGO_GLOBAL || 20123);

type Site = { documentId: string; chave: string; dominio: string; codigo: number | null; nome: string; configuracoes: Record<string, unknown> | null };
let cache: { em: number; sites: Site[] } | null = null;

export const sites = async () => {
  if (cache && Date.now() - cache.em < 60_000) return cache.sites;
  const r = await fetch(`${STRAPI}/api/sites?pagination[pageSize]=100&fields[0]=chave&fields[1]=dominio&fields[2]=codigo&fields[3]=nome&fields[4]=configuracoes`, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}, cache: 'no-store' });
  const j = await r.json();
  cache = { em: Date.now(), sites: (j.data || []).map((s: Site) => ({ ...s, codigo: s.codigo ? Number(s.codigo) : null })) };
  return cache.sites;
};

// Escopo pedido pelos widgets (chave do site, código do site ou código global) → chave usada nos dados
export const chaveDoEscopo = async (escopo: string) => {
  if (!/^\d+$/.test(escopo)) return escopo;
  if (Number(escopo) === CODIGO_GLOBAL) return 'global';
  return (await sites()).find((s) => s.codigo === Number(escopo))?.chave || escopo;
};

// Site da requisição (pelo domínio)
export const siteDaRequisicao = async (req: Request) => {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0];
  return (await sites()).find((s) => s.dominio === host) || null;
};
