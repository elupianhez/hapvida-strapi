import type { Core } from '@strapi/strapi';

import { errors } from '@strapi/utils';

/**
 * Regras de negócio que o Strapi não tem nativamente:
 *  1. Página: "caminho" calculado a partir do slug e da página pai (/planos/individual)
 *  2. Página: caminho único DENTRO do site (dois sites podem ter /planos)
 *  3. Coerência entre sites: menu, cabeçalho, rodapé, master page e página só podem
 *     apontar para itens do MESMO site.
 * Roda como middleware do Document Service, dentro de uma transação: se uma regra
 * falhar, nada é salvo e o editor vê a mensagem no admin.
 */
const { ValidationError } = errors;

type Ref = { documentId: string; site?: { documentId: string } | null } | null | undefined;

const PAGINA = 'api::pagina.pagina';
const ACOES = ['create', 'update', 'publish'];
const TIPOS = ['api::pagina.pagina', 'api::menu.menu', 'api::cabecalho.cabecalho', 'api::rodape.rodape', 'api::master-page.master-page', 'api::site.site'];

const mesmoSite = (siteId: string | undefined, ref: Ref, oQue: string) => {
  if (ref?.site && siteId && ref.site.documentId !== siteId) {
    throw new ValidationError(`${oQue} pertence a outro site. Escolha um item do mesmo site.`);
  }
};

const comSite = { populate: { site: true } };
const menuPopulate = {
  site: true,
  itens: { populate: { pagina: comSite, subitens: { populate: { pagina: comSite } } } },
};

// ── Página ──────────────────────────────────────────────────────────────────
const validarPagina = async (strapi: Core.Strapi, documentId: string) => {
  const docs = strapi.documents(PAGINA);
  const p = (await docs.findOne({
    documentId,
    status: 'draft',
    populate: { site: true, masterPage: comSite, paginaPai: comSite },
  })) as any;
  if (!p) return;
  const siteId = p.site?.documentId;

  mesmoSite(siteId, p.masterPage, `A master page "${p.masterPage?.nome}"`);
  mesmoSite(siteId, p.paginaPai, `A página pai "${p.paginaPai?.titulo}"`);

  // Sobe pela hierarquia: evita ciclo (A pai de B pai de A) e monta o caminho
  const segmentos = [p.slug];
  const vistos = new Set([documentId]);
  let pai = p.paginaPai;
  while (pai) {
    if (vistos.has(pai.documentId)) throw new ValidationError('A página pai cria um ciclo (uma página não pode ser ancestral dela mesma).');
    vistos.add(pai.documentId);
    const atual = (await docs.findOne({ documentId: pai.documentId, status: 'draft', populate: { paginaPai: true } })) as any;
    if (!atual) break;
    segmentos.unshift(atual.slug);
    pai = atual.paginaPai;
  }
  const caminho = `/${segmentos.join('/')}`;

  // Caminho único dentro do site
  const conflito = (await docs.findFirst({
    status: 'draft',
    filters: { caminho: { $eq: caminho }, site: { documentId: { $eq: siteId } }, documentId: { $ne: documentId } },
  })) as any;
  if (conflito) throw new ValidationError(`O endereço ${caminho} já é usado pela página "${conflito.titulo}" neste site.`);

  if (p.caminho !== caminho) {
    // Grava direto no banco (só a versão rascunho) para não disparar este middleware de novo
    await strapi.db.query(PAGINA).updateMany({ where: { documentId, publishedAt: null }, data: { caminho } });
    await atualizarFilhas(strapi, documentId, caminho);
  }
};

// Mudou o caminho da mãe → recalcula o das filhas (e netas)
const atualizarFilhas = async (strapi: Core.Strapi, documentId: string, caminhoMae: string) => {
  const filhas = (await strapi.documents(PAGINA).findMany({
    status: 'draft',
    filters: { paginaPai: { documentId: { $eq: documentId } } },
    fields: ['slug', 'caminho'],
  })) as any[];
  for (const f of filhas) {
    const caminho = `${caminhoMae}/${f.slug}`;
    await strapi.db.query(PAGINA).updateMany({ where: { documentId: f.documentId, publishedAt: null }, data: { caminho } });
    await atualizarFilhas(strapi, f.documentId, caminho);
  }
};

const copiarCaminhoParaPublicada = async (strapi: Core.Strapi, documentId: string) => {
  const rascunho = await strapi.db.query(PAGINA).findOne({ where: { documentId, publishedAt: null }, select: ['caminho'] });
  if (rascunho) {
    await strapi.db.query(PAGINA).updateMany({ where: { documentId, publishedAt: { $notNull: true } }, data: { caminho: rascunho.caminho } });
  }
};

// ── Demais tipos: coerência de site ─────────────────────────────────────────
const validarDemais = async (strapi: Core.Strapi, uid: string, documentId: string) => {
  if (uid === 'api::menu.menu') {
    const m = (await strapi.documents(uid).findOne({ documentId, populate: menuPopulate as never })) as any;
    for (const item of m?.itens || []) {
      mesmoSite(m.site?.documentId, item.pagina, `O item "${item.rotulo}" aponta para uma página que`);
      for (const sub of item.subitens || []) mesmoSite(m.site?.documentId, sub.pagina, `O subitem "${sub.rotulo}" aponta para uma página que`);
    }
  }
  if (uid === 'api::cabecalho.cabecalho') {
    const c = (await strapi.documents(uid).findOne({ documentId, populate: { site: true, menu: comSite, botoes: { populate: { pagina: comSite } } } as never })) as any;
    mesmoSite(c?.site?.documentId, c?.menu, `O menu "${c?.menu?.nome}"`);
    for (const b of c?.botoes || []) mesmoSite(c.site?.documentId, b.pagina, `O botão "${b.rotulo}" aponta para uma página que`);
  }
  if (uid === 'api::rodape.rodape') {
    const r = (await strapi.documents(uid).findOne({ documentId, populate: { site: true, colunas: { populate: { menu: comSite } } } as never })) as any;
    for (const col of r?.colunas || []) mesmoSite(r.site?.documentId, col.menu, `O menu da coluna "${col.titulo}"`);
  }
  if (uid === 'api::master-page.master-page') {
    const mp = (await strapi.documents(uid).findOne({ documentId, populate: { site: true, cabecalho: comSite, rodape: comSite } as never })) as any;
    mesmoSite(mp?.site?.documentId, mp?.cabecalho, `O cabeçalho "${mp?.cabecalho?.nome}"`);
    mesmoSite(mp?.site?.documentId, mp?.rodape, `O rodapé "${mp?.rodape?.nome}"`);
  }
  if (uid === 'api::site.site') {
    const s = (await strapi.documents(uid).findOne({ documentId, populate: { paginaInicial: comSite, masterPagePadrao: comSite } as never })) as any;
    mesmoSite(documentId, s?.paginaInicial, `A página inicial "${s?.paginaInicial?.titulo}"`);
    mesmoSite(documentId, s?.masterPagePadrao, `A master page padrão "${s?.masterPagePadrao?.nome}"`);
  }
};

export const registrarRegras = (strapi: Core.Strapi) => {
  strapi.documents.use(async (ctx, next) => {
    if (!TIPOS.includes(ctx.uid) || !ACOES.includes(ctx.action)) return next();

    return strapi.db.transaction(async () => {
      const resultado = await next();
      const documentId =
        (ctx.params as { documentId?: string })?.documentId ?? (resultado as { documentId?: string })?.documentId;
      if (!documentId) return resultado;

      if (ctx.uid === PAGINA) {
        if (ctx.action !== 'publish') await validarPagina(strapi, documentId);
        // Ao publicar, a versão publicada recebe o caminho calculado no rascunho
        const publicou = ctx.action === 'publish' || (ctx.params as { status?: string })?.status === 'published';
        if (publicou) await copiarCaminhoParaPublicada(strapi, documentId);
      } else {
        await validarDemais(strapi, ctx.uid, documentId);
      }
      return resultado;
    });
  });
};
