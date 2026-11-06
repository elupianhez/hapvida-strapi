import { item } from '@/lib/objetos';

// GET /api/objetos/<objeto>/item/<id>
export async function GET(_: Request, { params }: { params: Promise<{ objeto: string; id: string }> }) {
  const { objeto, id } = await params;
  const r = await item(objeto, id);
  return r ? Response.json(r) : Response.json({ status: 'NOT_FOUND' }, { status: 404 });
}
