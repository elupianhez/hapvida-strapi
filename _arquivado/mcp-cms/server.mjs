// Servidor MCP do CMS (Strapi). Porta de entrada dos agentes das equipes.
//
// - Autenticação: Authorization: Bearer <MCP_API_KEY>
// - Fala com o Strapi usando um token de API com permissões limitadas (ler/criar/editar
//   páginas e posts, ler/editar tema). As tools NUNCA publicam: tudo vira rascunho para
//   revisão humana no admin do Strapi.
import http from 'node:http'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

const PORT = Number(process.env.PORT || 3100)
const STRAPI = process.env.STRAPI_URL || 'http://localhost:1337'
const ADMIN = process.env.STRAPI_ADMIN_URL || 'http://localhost:1337'
const TOKEN = process.env.MCP_STRAPI_TOKEN
const CHAVE = process.env.MCP_API_KEY

// ── Strapi ──────────────────────────────────────────────────────────────────
const api = async (caminho, { metodo = 'GET', corpo } = {}) => {
  const res = await fetch(`${STRAPI}/api/${caminho}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${json?.error?.message || res.statusText}`)
  return json
}
const q = (o) => new URLSearchParams(o).toString()
const texto = (t) => ({ content: [{ type: 'text', text: t }] })
const linkAdmin = (uid, documentId) =>
  `${ADMIN}/admin/content-manager/collection-types/${uid}/${documentId}`

// ── Contrato da página migrada (igual ao usado pelo agente) ─────────────────
const paginaMigrada = {
  titulo: z.string().describe('Título da página'),
  slug: z.string().regex(/^[a-z0-9-]+$/).describe('Slug da nova URL, kebab-case. Ex: planos-individuais'),
  urlLiferay: z.string().describe('URL original no Liferay (vira redirect quando um humano publicar)'),
  resumo: z.string().describe('Frase de abertura'),
  metaDescricao: z.string().max(160).describe('Meta description (até 160 caracteres)'),
  secoes: z
    .array(
      z.object({
        titulo: z.string(),
        paragrafos: z.array(z.string()).default([]),
        itens: z.array(z.string()).optional(),
      }),
    )
    .min(1),
  chamada: z.object({ texto: z.string(), rotulo: z.string(), url: z.string() }).optional(),
  alertasCompliance: z.array(z.string()).optional().describe('O que um humano deve revisar antes de publicar'),
}

const montarPagina = (p) => ({
  titulo: p.titulo,
  slug: p.slug,
  urlLiferay: p.urlLiferay,
  origemMigracao: 'agente',
  alertasMigracao: (p.alertasCompliance || []).map((a) => `• ${a}`).join('\n') || null,
  seo: { titulo: `${p.titulo} | Hapvida`, descricao: p.metaDescricao },
  layout: [
    { __component: 'blocks.banner-topo', titulo: p.titulo, texto: p.resumo },
    {
      __component: 'blocks.texto',
      texto: p.secoes
        .map((s) => [`## ${s.titulo}`, ...s.paragrafos, ...(s.itens || []).map((i) => `- ${i}`)].join('\n\n'))
        .join('\n\n'),
    },
    ...(p.chamada
      ? [{ __component: 'blocks.chamada', texto: p.chamada.texto, links: [{ rotulo: p.chamada.rotulo, url: p.chamada.url }] }]
      : []),
  ],
})

const acharRascunho = async (tipo, slug) =>
  (await api(`${tipo}?${q({ status: 'draft', 'filters[slug][$eq]': slug, 'fields[0]': 'slug' })}`)).data?.[0]

const publicados = async (tipo) =>
  new Set(
    ((await api(`${tipo}?${q({ status: 'published', 'fields[0]': 'slug', 'pagination[limit]': '1000' })}`)).data || []).map(
      (d) => d.documentId,
    ),
  )

// ── Tools ───────────────────────────────────────────────────────────────────
const criarServidor = () => {
  const server = new McpServer({ name: 'CMS Hapvida (Strapi)', version: '0.2.0' })

  server.registerTool(
    'criarPaginaRascunho',
    {
      description:
        'Cria (ou atualiza) uma página do site como RASCUNHO a partir de conteúdo migrado do Liferay. Nunca publica.',
      inputSchema: paginaMigrada,
    },
    async (args) => {
      const data = montarPagina(args)
      const existente = await acharRascunho('paginas', args.slug)
      const r = existente
        ? await api(`paginas/${existente.documentId}?status=draft`, { metodo: 'PUT', corpo: { data } })
        : await api('paginas?status=draft', { metodo: 'POST', corpo: { data } })
      return texto(
        `Página "${args.titulo}" ${existente ? 'atualizada' : 'criada'} como rascunho. Revisar em ${linkAdmin('api::pagina.pagina', r.data.documentId)}`,
      )
    },
  )

  server.registerTool(
    'statusMigracao',
    { description: 'Lista as páginas migradas do Liferay e o status de cada uma (rascunho ou publicada).', inputSchema: {} },
    async () => {
      const pub = await publicados('paginas')
      const { data } = await api(
        `paginas?${q({ status: 'draft', 'filters[urlLiferay][$notNull]': 'true', 'fields[0]': 'slug', 'fields[1]': 'urlLiferay', 'pagination[limit]': '1000' })}`,
      )
      if (!data?.length) return texto('Nenhuma página migrada ainda.')
      return texto(data.map((d) => `- ${d.urlLiferay} → /${d.slug} [${pub.has(d.documentId) ? 'publicada' : 'rascunho'}]`).join('\n'))
    },
  )

  server.registerTool(
    'buscarPaginas',
    {
      description: 'Busca páginas do site pelo título (inclui rascunhos).',
      inputSchema: { termo: z.string().optional().describe('Parte do título; vazio = todas') },
    },
    async ({ termo }) => {
      const pub = await publicados('paginas')
      const filtro = termo ? { 'filters[titulo][$containsi]': termo } : {}
      const { data } = await api(`paginas?${q({ status: 'draft', ...filtro, 'fields[0]': 'titulo', 'fields[1]': 'slug', 'pagination[limit]': '100' })}`)
      return texto(data.map((d) => `- ${d.titulo} (/${d.slug}) [${pub.has(d.documentId) ? 'publicada' : 'rascunho'}]`).join('\n') || 'Nada encontrado.')
    },
  )

  server.registerTool(
    'criarPostRascunho',
    {
      description: 'Cria uma notícia/aviso como RASCUNHO (Markdown no conteúdo). Nunca publica.',
      inputSchema: {
        titulo: z.string(),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        resumo: z.string(),
        conteudo: z.string().describe('Corpo em Markdown'),
      },
    },
    async (args) => {
      const r = await api('posts?status=draft', { metodo: 'POST', corpo: { data: args } })
      return texto(`Post "${args.titulo}" criado como rascunho. Revisar em ${linkAdmin('api::post.post', r.data.documentId)}`)
    },
  )

  server.registerTool(
    'lerAparencia',
    { description: 'Mostra o tema (marca) atual do site e dos portais.', inputSchema: {} },
    async () => {
      const { data } = await api('aparencia')
      return texto(`Marca: ${data.marca} · Nome do site: ${data.nomeDoSite}`)
    },
  )

  server.registerTool(
    'alterarAparencia',
    {
      description: 'Troca o tema do site e dos portais (hapvida = laranja/azul, ndi = NotreDame Intermédica).',
      inputSchema: { marca: z.enum(['hapvida', 'ndi']), nomeDoSite: z.string().optional() },
    },
    async ({ marca, nomeDoSite }) => {
      await api('aparencia', { metodo: 'PUT', corpo: { data: { marca, ...(nomeDoSite ? { nomeDoSite } : {}) } } })
      return texto(`Tema alterado para ${marca}.`)
    },
  )

  return server
}

// ── HTTP (Streamable HTTP, sem sessão) ──────────────────────────────────────
const lerJson = (req) =>
  new Promise((ok) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      try {
        ok(b ? JSON.parse(b) : undefined)
      } catch {
        ok(undefined)
      }
    })
  })

http
  .createServer(async (req, res) => {
    if (req.url === '/saude') return res.writeHead(200).end('ok')
    if (!req.url?.startsWith('/mcp')) return res.writeHead(404).end()
    if (req.headers.authorization !== `Bearer ${CHAVE}`) {
      return res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'MCP_API_KEY inválida' }))
    }
    const server = criarServidor()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => {
      transport.close()
      server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req, res, await lerJson(req))
  })
  .listen(PORT, () => console.log(`MCP do CMS em http://localhost:${PORT}/mcp (Strapi: ${STRAPI})`))
