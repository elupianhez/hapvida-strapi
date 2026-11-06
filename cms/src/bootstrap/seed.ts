import type { Core } from '@strapi/strapi';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Seed de demonstração (roda no boot quando não há sites). Todo o conteúdo é fictício.
 * Monta dois sites completos para provar o modelo: Site → Master page → Cabeçalho/Rodapé → Menus → Páginas.
 */
export const seedDemo = async (strapi: Core.Strapi) => {
  await criarAdmin(strapi);
  // Sites fictícios só se pedido (os sites reais vêm da migração)
  if (process.env.SEED_DEMO !== 'true') return;
  if ((await strapi.documents('api::site.site').count({})) > 0) return;
  strapi.log.info('🌱 Criando sites de demonstração...');

  const img = await enviarImagem(strapi, path.join(strapi.dirs.app.root, 'seed', 'hero.webp'), 'Imagem de destaque');
  const portal = process.env.PORTAL_URL || 'http://localhost:3301';

  for (const def of SITES) {
    const site = await strapi.documents('api::site.site').create({
      data: { nome: def.nome, dominio: def.dominio, marca: def.marca, seoPadrao: def.seo } as never,
    });

    // Páginas (mães antes das filhas), já publicadas
    const pg: Record<string, string> = {};
    for (const p of def.paginas) {
      const doc = await strapi.documents('api::pagina.pagina').create({
        status: 'published',
        data: {
          titulo: p.titulo,
          slug: p.slug,
          site: site.documentId,
          paginaPai: p.pai ? pg[p.pai] : null,
          seo: p.seo,
          conteudo: p.conteudo(img),
        } as never,
      });
      pg[p.slug] = doc.documentId;
    }

    // Menus
    // "{portal}" ou "http…" = URL externa; qualquer outro valor = slug de uma página do site
    const destino = (d: string) =>
      d.startsWith('http') || d === '{portal}' ? { urlExterna: d.replace('{portal}', portal), novaAba: true } : { pagina: pg[d] };
    const mn: Record<string, string> = {};
    for (const m of def.menus) {
      const doc = await strapi.documents('api::menu.menu').create({
        data: {
          nome: m.nome,
          site: site.documentId,
          itens: m.itens.map(([rotulo, d, subs = []]) => ({
            rotulo,
            ...(d ? destino(d) : {}),
            subitens: subs.map(([r, sd]) => ({ rotulo: r, ...destino(sd) })),
          })),
        } as never,
      });
      mn[m.chave] = doc.documentId;
    }

    // Cabeçalhos e rodapés
    const cab: Record<string, string> = {};
    for (const c of def.cabecalhos) {
      cab[c.chave] = (
        await strapi.documents('api::cabecalho.cabecalho').create({
          data: {
            nome: c.nome,
            site: site.documentId,
            menu: c.menu ? mn[c.menu] : null,
            mostrarBusca: c.busca,
            botoes: c.botoes.map(([rotulo, d, estilo]) => ({ rotulo, estilo, ...destino(d) })),
          } as never,
        })
      ).documentId;
    }
    const rod: Record<string, string> = {};
    for (const r of def.rodapes) {
      rod[r.chave] = (
        await strapi.documents('api::rodape.rodape').create({
          data: {
            nome: r.nome,
            site: site.documentId,
            colunas: r.colunas.map(([titulo, menu]) => ({ titulo, menu: mn[menu] })),
            redesSociais: r.redes.map(([rede, url]) => ({ rede, url })),
            textoLegal: r.textoLegal,
          } as never,
        })
      ).documentId;
    }

    // Master pages
    const mp: Record<string, string> = {};
    for (const m of def.masters) {
      mp[m.chave] = (
        await strapi.documents('api::master-page.master-page').create({
          data: {
            nome: m.nome,
            site: site.documentId,
            cabecalho: cab[m.cabecalho],
            rodape: rod[m.rodape],
            antesDoConteudo: m.antes || [],
            depoisDoConteudo: m.depois || [],
          } as never,
        })
      ).documentId;
    }

    // Site: página inicial e master padrão
    await strapi.documents('api::site.site').update({
      documentId: site.documentId,
      data: { paginaInicial: pg[def.inicial], masterPagePadrao: mp[def.masterPadrao] } as never,
    });

    // Páginas que usam outra master page (ex.: landing sem menu)
    for (const p of def.paginas.filter((x) => x.master)) {
      await strapi.documents('api::pagina.pagina').update({ documentId: pg[p.slug], data: { masterPage: mp[p.master!] } as never });
      await strapi.documents('api::pagina.pagina').publish({ documentId: pg[p.slug] });
    }
  }
  strapi.log.info('🌱 Sites de demonstração criados.');
};

// ── Conteúdo de demonstração ────────────────────────────────────────────────
type Pag = { titulo: string; slug: string; pai?: string; master?: string; seo?: Record<string, unknown>; conteudo: (img?: number) => unknown[] };

const banner = (titulo: string, texto: string, img?: number, botoes: unknown[] = []) => ({ __component: 'blocos.banner', titulo, texto, imagem: img, botoes });
const texto = (t: string) => ({ __component: 'blocos.texto', texto: t });

const SITES: {
  nome: string; dominio: string; marca: string; seo: Record<string, string>; inicial: string; masterPadrao: string
  paginas: Pag[]
  menus: { chave: string; nome: string; itens: [string, string | null, [string, string][]?][] }[]
  cabecalhos: { chave: string; nome: string; menu?: string; busca: boolean; botoes: [string, string, string][] }[]
  rodapes: { chave: string; nome: string; colunas: [string, string][]; redes: [string, string][]; textoLegal: string }[]
  masters: { chave: string; nome: string; cabecalho: string; rodape: string; antes?: unknown[]; depois?: unknown[] }[]
}[] = [
  {
    nome: 'Hapvida',
    dominio: 'hapvida.localhost',
    marca: 'hapvida',
    seo: { sufixoTitulo: ' | Hapvida', descricao: 'Planos de saúde e odontológicos com rede própria.' },
    inicial: 'inicio',
    masterPadrao: 'institucional',
    paginas: [
      { titulo: 'Início', slug: 'inicio', seo: { tituloSeo: 'Planos de saúde' }, conteudo: (img) => [banner('Cuidar de você é o nosso plano', 'Planos de saúde com rede própria em todo o Brasil.', img), texto('## Por que a Hapvida?\n\nRede própria, telemedicina 24h e atendimento perto de você.')] },
      { titulo: 'Planos', slug: 'planos', conteudo: () => [texto('## Nossos planos\n\nEscolha o plano ideal para você, sua família ou sua empresa.')] },
      { titulo: 'Plano Individual', slug: 'individual', pai: 'planos', seo: { descricao: 'Plano de saúde individual e familiar.' }, conteudo: () => [texto('## Plano Individual\n\nPara você e sua família.\n\n- Consultas e exames\n- Pronto atendimento 24h\n- Telemedicina')] },
      { titulo: 'Plano Empresarial', slug: 'empresarial', pai: 'planos', conteudo: () => [texto('## Plano Empresarial\n\nPara empresas a partir de 2 vidas.')] },
      { titulo: 'Rede credenciada', slug: 'rede-credenciada', conteudo: () => [texto('## Rede credenciada\n\nHospitais, clínicas e laboratórios perto de você.')] },
      { titulo: 'Fale conosco', slug: 'fale-conosco', conteudo: () => [texto('## Fale conosco\n\nCentral 24h: 0800 000 0000 (fictício).')] },
      { titulo: 'Campanha de vacinação', slug: 'campanha-vacinacao', master: 'landing', seo: { incluirNoSitemap: false }, conteudo: (img) => [banner('Vacinação contra a gripe', 'Vacine-se nas unidades participantes, sem agendamento.', img)] },
    ],
    menus: [
      { chave: 'principal', nome: 'Menu principal Hapvida', itens: [['Planos', 'planos', [['Individual', 'individual'], ['Empresarial', 'empresarial']]], ['Rede credenciada', 'rede-credenciada'], ['Fale conosco', 'fale-conosco']] },
      { chave: 'institucional', nome: 'Rodapé · Institucional', itens: [['Planos', 'planos'], ['Rede credenciada', 'rede-credenciada']] },
      { chave: 'atendimento', nome: 'Rodapé · Atendimento', itens: [['Fale conosco', 'fale-conosco'], ['Portal do beneficiário', '{portal}']] },
    ],
    cabecalhos: [
      { chave: 'completo', nome: 'Cabeçalho completo Hapvida', menu: 'principal', busca: true, botoes: [['Área do cliente', '{portal}', 'primario']] },
      { chave: 'landing', nome: 'Cabeçalho de landing Hapvida', busca: false, botoes: [['Quero contratar', 'fale-conosco', 'primario']] },
    ],
    rodapes: [
      { chave: 'padrao', nome: 'Rodapé padrão Hapvida', colunas: [['Institucional', 'institucional'], ['Atendimento', 'atendimento']], redes: [['instagram', 'https://instagram.com/'], ['linkedin', 'https://linkedin.com/']], textoLegal: 'Hapvida · ANS nº 000000 (fictício)' },
      { chave: 'simples', nome: 'Rodapé simples Hapvida', colunas: [], redes: [], textoLegal: 'Hapvida · ANS nº 000000 (fictício)' },
    ],
    masters: [
      { chave: 'institucional', nome: 'Institucional Hapvida', cabecalho: 'completo', rodape: 'padrao' },
      { chave: 'landing', nome: 'Landing Hapvida (sem menu)', cabecalho: 'landing', rodape: 'simples', depois: [texto('*Condições da campanha sujeitas à disponibilidade nas unidades.*')] },
    ],
  },
  {
    nome: 'NotreDame Intermédica',
    dominio: 'notredame.localhost',
    marca: 'ndi',
    seo: { sufixoTitulo: ' | NotreDame Intermédica', descricao: 'Planos de saúde premium.' },
    inicial: 'inicio',
    masterPadrao: 'institucional',
    paginas: [
      { titulo: 'Início', slug: 'inicio', conteudo: (img) => [banner('Premium inteligente', 'Para cada momento de cuidado.', img)] },
      { titulo: 'Planos', slug: 'planos', conteudo: () => [texto('## Planos NotreDame\n\nMesmo endereço /planos do site Hapvida: a URL é única por site.')] },
      { titulo: 'Plano Premium', slug: 'premium', pai: 'planos', conteudo: () => [texto('## Plano Premium\n\nRede de excelência em São Paulo e Rio de Janeiro.')] },
      { titulo: 'Fale conosco', slug: 'fale-conosco', conteudo: () => [texto('## Fale conosco\n\nCentral 24h: 0800 000 0001 (fictício).')] },
    ],
    menus: [
      { chave: 'principal', nome: 'Menu principal NotreDame', itens: [['Planos', 'planos', [['Premium', 'premium']]], ['Fale conosco', 'fale-conosco']] },
      { chave: 'rodape', nome: 'Rodapé NotreDame', itens: [['Planos', 'planos'], ['Fale conosco', 'fale-conosco']] },
    ],
    cabecalhos: [{ chave: 'completo', nome: 'Cabeçalho NotreDame', menu: 'principal', busca: true, botoes: [['Seja cliente', 'fale-conosco', 'primario']] }],
    rodapes: [{ chave: 'padrao', nome: 'Rodapé NotreDame', colunas: [['Navegação', 'rodape']], redes: [['instagram', 'https://instagram.com/']], textoLegal: 'NotreDame Intermédica · ANS nº 000000 (fictício)' }],
    masters: [{ chave: 'institucional', nome: 'Institucional NotreDame', cabecalho: 'completo', rodape: 'padrao' }],
  },
];

// ── Utilitários ─────────────────────────────────────────────────────────────
const criarAdmin = async (strapi: Core.Strapi) => {
  const usuarios = strapi.service('admin::user');
  if (await usuarios.exists()) return;
  const superAdmin = await strapi.service('admin::role').getSuperAdmin();
  await usuarios.create({
    email: process.env.CMS_ADMIN_EMAIL || 'admin@hapvida.poc',
    firstname: 'Editor',
    lastname: 'Hapvida',
    password: process.env.CMS_ADMIN_PASSWORD || 'Hapvida123',
    isActive: true,
    registrationToken: null,
    roles: superAdmin ? [superAdmin.id] : [],
  });
};

const enviarImagem = async (strapi: Core.Strapi, arquivo: string, alt: string) => {
  try {
    const stat = fs.statSync(arquivo);
    const [file] = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { alternativeText: alt, name: path.basename(arquivo) } },
      files: { filepath: arquivo, originalFilename: path.basename(arquivo), mimetype: 'image/webp', size: stat.size },
    });
    return file.id as number;
  } catch (err) {
    strapi.log.warn(`Imagem de demonstração não enviada: ${(err as Error).message}`);
    return undefined;
  }
};
