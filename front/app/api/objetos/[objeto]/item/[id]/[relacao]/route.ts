import { item } from '@/lib/objetos';

// GET /api/objetos/<objeto>/item/<id>/<relação>   registros relacionados
export async function GET(_: Request, { params }: { params: Promise<{ objeto: string; id: string; relacao: string }> }) {
  const { objeto, id, relacao } = await params;
  const r = await item(objeto, id, relacao);
  return r ? Response.json(r) : Response.json({ status: 'NOT_FOUND' }, { status: 404 });
}
