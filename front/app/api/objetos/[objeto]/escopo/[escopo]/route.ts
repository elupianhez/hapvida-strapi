import { consultar } from '@/lib/objetos';

// GET /api/objetos/<objeto>/escopo/<site>?...   (registros de um site)
export async function GET(req: Request, { params }: { params: Promise<{ objeto: string; escopo: string }> }) {
  const { objeto, escopo } = await params;
  const r = await consultar(objeto, escopo, new URL(req.url).searchParams);
  return r ? Response.json(r) : Response.json({ status: 'NOT_FOUND' }, { status: 404 });
}
