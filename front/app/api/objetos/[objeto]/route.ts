import { consultar } from '@/lib/objetos';

// GET /api/objetos/<objeto>?filter=&search=&sort=&page=&pageSize=&fields=&nestedFields=
export async function GET(req: Request, { params }: { params: Promise<{ objeto: string }> }) {
  const r = await consultar((await params).objeto, null, new URL(req.url).searchParams);
  return r ? Response.json(r) : Response.json({ status: 'NOT_FOUND' }, { status: 404 });
}
