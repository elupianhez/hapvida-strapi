import { taxonomia } from '@/lib/taxonomia';

// /api/taxonomia/vocabularios/erc/<ERC>?escopo=      um vocabulário
// /api/taxonomia/vocabularios/<id>/categorias         categorias do vocabulário
// /api/taxonomia/vocabularios?contem=<nome>&escopo=   busca por nome
// /api/taxonomia/categorias/erc/<ERC>                 uma categoria
// /api/taxonomia/categorias?nome=<nome>               busca por nome exato
export async function GET(req: Request, { params }: { params: Promise<{ rota: string[] }> }) {
  const [tipo, a, b] = (await params).rota.map(decodeURIComponent);
  const q = new URL(req.url).searchParams;
  const { vocabularios, categorias } = await taxonomia();
  const lista = <T,>(items: T[]) => Response.json({ items, totalCount: items.length, page: 1, pageSize: items.length, lastPage: 1 });
  const nao = () => Response.json({ status: 'NOT_FOUND' }, { status: 404 });

  if (tipo === 'vocabularios') {
    if (a === 'erc') {
      const escopo = q.get('escopo');
      const v = vocabularios.find((x) => x.externalReferenceCode === b && (!escopo || x.escopo === escopo)) || vocabularios.find((x) => x.externalReferenceCode === b);
      return v ? Response.json(v) : nao();
    }
    if (a && b === 'categorias') return lista(categorias.filter((c) => c.taxonomyVocabularyId === Number(a)));
    const contem = (q.get('contem') || '').toLowerCase();
    const escopo = q.get('escopo');
    return lista(vocabularios.filter((v) => v.name.toLowerCase().includes(contem) && (!escopo || v.escopo === escopo || v.escopo === 'global')));
  }
  if (tipo === 'categorias') {
    if (a === 'erc') {
      const c = categorias.find((x) => x.externalReferenceCode === b);
      return c ? Response.json(c) : nao();
    }
    // Categorias dos vocabulários do site (como a busca original, que era sempre dentro do site)
    const nome = q.get('nome');
    const escopo = q.get('escopo');
    const doSite = new Set(vocabularios.filter((v) => !escopo || v.escopo === escopo).map((v) => v.id));
    return lista(categorias.filter((c) => (!nome || c.name === nome) && doSite.has(c.taxonomyVocabularyId)));
  }
  return nao();
}
