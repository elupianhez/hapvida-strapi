import { siteDaRequisicao } from '@/lib/sites';

// GET /api/unidades/chave-mapa → chave do Google Maps do site (cadastrada nas configurações do Site no Strapi)
export async function GET(req: Request) {
  const site = await siteDaRequisicao(req);
  return Response.json({ googleMapsKey: (site?.configuracoes?.googleMapsKey as string) || '' });
}
