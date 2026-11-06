import { consultarConteudos, estruturasPorNome } from '@/lib/conteudos';

// /api/conteudos/estruturas?nome=<nome>        estruturas com esse nome
// /api/conteudos/estruturas/<id>?filter=&...   conteúdos da estrutura (filtro, busca, ordem, paginação)
export async function GET(req: Request, { params }: { params: Promise<{ rota: string[] }> }) {
  const [tipo, id] = (await params).rota.map(decodeURIComponent);
  const q = new URL(req.url).searchParams;
  if (tipo !== 'estruturas') return Response.json({ status: 'NOT_FOUND' }, { status: 404 });
  if (!id) {
    const items = await estruturasPorNome(q.get('nome') || '');
    return Response.json({ items, totalCount: items.length, page: 1, pageSize: items.length, lastPage: 1 });
  }
  return Response.json(await consultarConteudos(Number(id), q));
}
