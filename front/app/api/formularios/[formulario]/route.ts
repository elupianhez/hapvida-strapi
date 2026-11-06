import { siteDaRequisicao } from '@/lib/sites';

const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.FORMULARIOS_API_TOKEN || '';

// POST /api/formularios/<formulario>  (ex.: planium-lead, ouvidoria)
// Grava o envio no Strapi ("Envio de formulário"). O encaminhamento para os sistemas de destino
// (Salesforce, Planium, SAC) entra aqui quando as credenciais estiverem configuradas.
export async function POST(req: Request, { params }: { params: Promise<{ formulario: string }> }) {
  const { formulario } = await params;
  const tipo = req.headers.get('content-type') || '';
  const json = tipo.includes('json');
  // Formulário HTML: anexos são registrados pelo nome/tamanho (o envio dos arquivos entra com a integração)
  const dados = json
    ? await req.json().catch(() => null)
    : Object.fromEntries([...(await req.formData().catch(() => new FormData())).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : { arquivo: v.name, tamanho: v.size }]));
  const site = await siteDaRequisicao(req);
  const r = await fetch(`${STRAPI}/api/envios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: { formulario, site: site?.chave || null, pagina: req.headers.get('referer') || null, dados } }),
  });
  if (!r.ok) return json ? Response.json({ ok: false }, { status: 502 }) : new Response('Não foi possível enviar. Tente novamente.', { status: 502 });
  if (json) return Response.json({ ok: true, mensagem: 'Recebido' });
  // Formulário HTML: volta para a página de onde veio
  const volta = new URL(req.headers.get('referer') || '/', req.url);
  volta.searchParams.set('enviado', '1');
  return Response.redirect(volta, 303);
}
