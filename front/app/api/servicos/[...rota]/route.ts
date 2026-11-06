import fs from 'node:fs';
import path from 'node:path';

import { siteDaRequisicao } from '@/lib/sites';

const STRAPI = (process.env.STRAPI_URL || 'http://cms:1337').replace(/\/+$/, '');
const TOKEN = process.env.FORMULARIOS_API_TOKEN || '';
const DADOS = path.join(process.cwd(), 'lib', 'dados');

// Serviços chamados pelos formulários dos sites (/api/servicos/<serviço>/<ação>).
//   GET  ouvidoria/get-states | ouvidoria/get-cities?uf=   listas copiadas do site anterior
//   POST qualquer outro (e-mail, Salesforce, fale conosco, lista dinâmica, corretor...)
//        → grava em "Envio de formulário" no Strapi. O encaminhamento para os sistemas de destino
//          entra aqui quando as credenciais estiverem configuradas.
export async function GET(req: Request, { params }: { params: Promise<{ rota: string[] }> }) {
  const rota = (await params).rota.join('/');
  const json = (corpo: string) => new Response(corpo, { headers: { 'Content-Type': 'application/json' } });
  if (rota === 'ouvidoria/get-states') return json(fs.readFileSync(path.join(DADOS, 'ouvidoria', 'estados.txt'), 'utf8'));
  if (rota === 'ouvidoria/get-cities') {
    const cidades = JSON.parse(fs.readFileSync(path.join(DADOS, 'ouvidoria', 'cidades.json'), 'utf8'));
    return json(cidades[new URL(req.url).searchParams.get('uf') || ''] || '[]');
  }
  return Response.json({ status: 'NOT_FOUND' }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ rota: string[] }> }) {
  const rota = (await params).rota.join('/');
  const tipo = req.headers.get('content-type') || '';
  const dados = tipo.includes('json')
    ? await req.json().catch(() => null)
    : Object.fromEntries([...(await req.formData().catch(() => new FormData())).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : { arquivo: v.name, tamanho: v.size }]));

  // Busca de cirurgias: consulta (não é envio) — ainda sem fonte de dados no site novo
  if (rota === 'searchCirurgia/search') return Response.json({ items: [], totalCount: 0, total: 0 });

  const site = await siteDaRequisicao(req);
  const r = await fetch(`${STRAPI}/api/envios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: { formulario: rota, site: site?.chave || null, pagina: req.headers.get('referer') || null, dados } }),
  });
  if (!r.ok) return Response.json({ success: false, sucesso: false }, { status: 502 });
  return Response.json({ success: true, sucesso: true, status: 'success', message: 'Enviado com sucesso', mensagem: 'Enviado com sucesso' });
}
