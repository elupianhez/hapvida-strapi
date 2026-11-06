import { carregar } from '@/lib/objetos';
import { taxonomia } from '@/lib/taxonomia';

// POST /api/unidades/filtros  { site }  → tipos e locais de unidade (categorias) e especialidades do site
export async function POST(req: Request) {
  const { site = '' } = await req.json().catch(() => ({}));
  const { vocabularios, categorias } = await taxonomia();
  const doVocabulario = (nome: string) => {
    const v = vocabularios.find((x) => x.name === nome && x.escopo === 'global') || vocabularios.find((x) => x.name === nome);
    return v ? categorias.filter((c) => c.taxonomyVocabularyId === v.id).map((c) => ({ id: String(c.id), label: c.name })) : [];
  };
  const temSite = (sites: unknown) => Array.isArray(sites) && sites.some((s) => (s as { key?: string })?.key === site);
  const especialidades = ((await carregar('especialidades')) || [])
    .filter((e) => temSite(e.sites))
    .map((e) => ({ id: String(e.id), label: String(e.nome || '') }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  return Response.json({ tipos: doVocabulario('Tipo de Unidade'), locais: doVocabulario('Local da Unidade'), especialidades });
}
