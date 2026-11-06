import type { Core } from '@strapi/strapi';

/**
 * GET /api/resolver?dominio=hapvida.localhost&caminho=/planos/individual
 *
 * Devolve TUDO que um front-end precisa para desenhar a página, já resolvido:
 * site, master page (da página ou a padrão do site), cabeçalho e rodapé com os menus
 * (links já convertidos em URL), SEO com os valores padrão do site, breadcrumb e blocos.
 *
 * Rascunho: &status=draft com o header "Authorization: Bearer <SITE_API_TOKEN>".
 * GET /api/sitemap?dominio=... lista os endereços publicados que entram no sitemap.
 */
const MIDIA = { fields: ['url', 'alternativeText', 'width', 'height'] };
const COM_PAGINA = { populate: { pagina: { fields: ['caminho', 'titulo'] } } };
const BLOCOS = {
  on: {
    'blocos.banner': { populate: { imagem: MIDIA, botoes: COM_PAGINA } },
    'blocos.texto': { populate: '*' },
    'blocos.imagem': { populate: { imagem: MIDIA } },
  },
};
const MENU = { populate: { itens: { populate: { pagina: { fields: ['caminho', 'titulo'] }, subitens: COM_PAGINA } } } };

type Link = { rotulo: string; pagina?: { documentId: string; caminho: string } | null; urlExterna?: string | null; novaAba?: boolean };

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const midia = (m: any) => (m?.url ? { url: m.url, alt: m.alternativeText || '', largura: m.width, altura: m.height } : null);

  const montar = (inicialId?: string) => {
    // Página interna → caminho dela ("/" se for a página inicial do site); senão a URL externa.
    const href = (l: Link) =>
      l.pagina ? (l.pagina.documentId === inicialId ? '/' : l.pagina.caminho) : l.urlExterna || null;
    const link = (l: Link) => ({ rotulo: l.rotulo, href: href(l), novaAba: Boolean(l.novaAba), externo: !l.pagina });
    const menu = (m: any) =>
      (m?.itens || [])
        .filter((i: any) => href(i) || i.subitens?.length)
        .map((i: any) => ({ ...link(i), subitens: (i.subitens || []).filter(href).map(link) }));
    const blocos = (lista: any[] = []) =>
      lista.map(({ id, __component, ...b }) => {
        if (__component === 'blocos.banner') return { tipo: 'banner', ...b, imagem: midia(b.imagem), botoes: (b.botoes || []).filter(href).map((x: any) => ({ ...link(x), estilo: x.estilo })) };
        if (__component === 'blocos.imagem') return { tipo: 'imagem', ...b, imagem: midia(b.imagem) };
        return { tipo: __component.replace('blocos.', ''), ...b };
      });
    return { link, menu, blocos };
  };

  return {
    async resolver(ctx: any) {
      const { dominio, caminho: caminhoBruto = '/', status } = ctx.query as Record<string, string>;
      if (!dominio) return ctx.badRequest('Informe ?dominio=');

      // Rascunho só com o token do site
      const token = (ctx.request.header.authorization || '').replace(/^Bearer\s+/i, '');
      const rascunho = status === 'draft';
      if (rascunho && token !== process.env.SITE_API_TOKEN) return ctx.unauthorized('Rascunho exige o token do site');
      const versao = rascunho ? 'draft' : 'published';

      const site = (await strapi.documents('api::site.site').findFirst({
        filters: { dominio: { $eq: dominio } },
        populate: { logo: MIDIA, favicon: MIDIA, paginaInicial: { fields: ['caminho'] }, masterPagePadrao: { fields: ['nome'] }, seoPadrao: { populate: { imagemCompartilhamento: MIDIA } } } as never,
      })) as any;
      if (!site) return ctx.notFound(`Nenhum site com o domínio ${dominio}`);

      const caminho = `/${caminhoBruto.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/');
      const paginas = strapi.documents('api::pagina.pagina');
      const populatePagina = {
        seo: { populate: { imagemCompartilhamento: MIDIA } },
        masterPage: { fields: ['nome'] },
        paginaPai: { fields: ['titulo', 'caminho'] },
        conteudo: BLOCOS,
      };
      const pagina = (caminho === '/'
        ? site.paginaInicial && (await paginas.findOne({ documentId: site.paginaInicial.documentId, status: versao, populate: populatePagina as never }))
        : await paginas.findFirst({ status: versao, filters: { caminho: { $eq: caminho }, site: { documentId: { $eq: site.documentId } } }, populate: populatePagina as never })) as any;
      if (!pagina) return ctx.notFound(`Página ${caminho} não encontrada (${versao}) no site ${site.nome}`);

      // Master page: a da página ou a padrão do site
      const masterId = pagina.masterPage?.documentId || site.masterPagePadrao?.documentId;
      const master = masterId
        ? ((await strapi.documents('api::master-page.master-page').findOne({
            documentId: masterId,
            populate: {
              antesDoConteudo: BLOCOS,
              depoisDoConteudo: BLOCOS,
              cabecalho: { populate: { logo: MIDIA, menu: MENU, botoes: COM_PAGINA } },
              rodape: { populate: { colunas: { populate: { menu: MENU } }, redesSociais: true } },
            } as never,
          })) as any)
        : null;

      const { link, menu, blocos } = montar(site.paginaInicial?.documentId);

      // Breadcrumb: sobe pelas páginas pai
      const trilha = [];
      let pai = pagina.paginaPai;
      while (pai && trilha.length < 10) {
        trilha.unshift({ rotulo: pai.titulo, href: pai.caminho });
        pai = ((await paginas.findOne({ documentId: pai.documentId, status: versao, populate: { paginaPai: { fields: ['titulo', 'caminho'] } } as never })) as any)?.paginaPai;
      }

      const seo = pagina.seo || {};
      const padrao = site.seoPadrao || {};
      const ehInicial = pagina.documentId === site.paginaInicial?.documentId;
      const url = `https://${site.dominio}${ehInicial ? '/' : pagina.caminho}`;

      ctx.body = {
        status: versao,
        site: { nome: site.nome, dominio: site.dominio, marca: site.marca, logo: midia(site.logo), favicon: midia(site.favicon) },
        pagina: { titulo: pagina.titulo, caminho: ehInicial ? '/' : pagina.caminho, atualizadaEm: pagina.updatedAt },
        seo: {
          titulo: `${seo.tituloSeo || pagina.titulo}${padrao.sufixoTitulo || ''}`,
          descricao: seo.descricao || padrao.descricao || null,
          imagem: midia(seo.imagemCompartilhamento) || midia(padrao.imagemCompartilhamento),
          urlCanonica: seo.urlCanonica || url,
          robots: seo.indexar === false ? 'noindex, nofollow' : 'index, follow',
        },
        breadcrumb: ehInicial ? [] : [{ rotulo: 'Início', href: '/' }, ...trilha, { rotulo: pagina.titulo, href: null }],
        masterPage: master ? { nome: master.nome, antesDoConteudo: blocos(master.antesDoConteudo), depoisDoConteudo: blocos(master.depoisDoConteudo) } : null,
        cabecalho: master?.cabecalho
          ? {
              logo: midia(master.cabecalho.logo) || midia(site.logo),
              menu: menu(master.cabecalho.menu),
              botoes: (master.cabecalho.botoes || []).map((b: any) => ({ ...link(b), estilo: b.estilo })),
              mostrarBusca: master.cabecalho.mostrarBusca,
            }
          : null,
        rodape: master?.rodape
          ? {
              colunas: (master.rodape.colunas || []).map((c: any) => ({ titulo: c.titulo, links: menu(c.menu) })),
              redesSociais: (master.rodape.redesSociais || []).map((r: any) => ({ rede: r.rede, url: r.url })),
              textoLegal: master.rodape.textoLegal,
            }
          : null,
        conteudo: blocos(pagina.conteudo),
      };
    },

    /**
     * GET /api/renderizar?dominio=notredame.localhost&caminho=/noticias
     * Tudo para o front montar a página: site (tema, estilos, scripts), master, página,
     * os modelos de fragmento usados e os domínios dos outros sites (links entre sites).
     */
    async renderizar(ctx: any) {
      const { dominio, caminho: bruto = '/' } = ctx.query as Record<string, string>;
      if (!dominio) return ctx.badRequest('Informe ?dominio=');
      const caminho = `/${String(bruto).replace(/^\/+|\/+$/g, '')}`;
      const docs = strapi.documents as any;

      const site = await docs('api::site.site').findFirst({
        filters: { dominio: { $eq: dominio } },
        populate: { paginaInicial: { fields: ['caminho'] }, masterPagePadrao: { fields: ['chave'] } },
      });
      if (!site) return ctx.notFound(`Nenhum site com o domínio ${dominio}`);

      const redirect = await docs('api::redirecionamento.redirecionamento').findFirst({
        filters: { de: { $eq: caminho }, site: { documentId: { $eq: site.documentId } } },
      });
      if (redirect) return (ctx.body = { redirecionar: { para: redirect.para, status: redirect.status || 301 } });

      const POP = { seo: { populate: { imagemCompartilhamento: MIDIA } }, masterPage: { fields: ['chave'] }, fragmentos: true, widgets: true };
      const pagina =
        caminho === '/'
          ? site.paginaInicial && (await docs('api::pagina.pagina').findOne({ documentId: site.paginaInicial.documentId, status: 'published', populate: POP }))
          : await docs('api::pagina.pagina').findFirst({ status: 'published', filters: { caminho: { $eq: caminho }, site: { documentId: { $eq: site.documentId } } }, populate: POP });
      if (!pagina) return ctx.notFound(`Página ${caminho} não encontrada no site ${site.nome}`);

      const masterId = pagina.masterPage?.documentId || site.masterPagePadrao?.documentId;
      const master = masterId ? await docs('api::master-page.master-page').findOne({ documentId: masterId, populate: { fragmentos: true, widgets: true } }) : null;

      const chaves = [...new Set([...(pagina.fragmentos || []), ...(master?.fragmentos || [])].map((f: any) => f.modelo))];
      const modelos = chaves.length
        ? await docs('api::modelo-fragmento.modelo-fragmento').findMany({ filters: { chave: { $in: chaves } }, fields: ['chave', 'html', 'css', 'js'], limit: chaves.length })
        : [];
      const sites = await docs('api::site.site').findMany({ fields: ['chave', 'dominio'], limit: 100 });

      const limpa = (f: any) => ({ instancia: f.instancia, modelo: f.modelo, campos: f.campos || {}, configuracao: f.configuracao || {} });
      ctx.body = {
        site: {
          chave: site.chave, nome: site.nome, dominio: site.dominio, idioma: site.idioma || 'pt-BR',
          codigo: site.codigo ? Number(site.codigo) : null, configuracoes: site.configuracoes || {},
          arquivosTema: site.arquivosTema || [], estilosGlobais: site.estilosGlobais || [],
          scriptsCabeca: site.scriptsCabeca || '', scriptsCorpo: site.scriptsCorpo || '', classesBody: site.classesBody || '',
        },
        dominios: Object.fromEntries(sites.filter((s: any) => s.chave).map((s: any) => [s.chave, s.dominio])),
        pagina: {
          titulo: pagina.titulo, caminho, esqueleto: pagina.esqueleto || '', css: pagina.css || '', arquivosTema: pagina.arquivosTema || [],
          seo: pagina.seo || {}, fragmentos: (pagina.fragmentos || []).map(limpa), widgets: pagina.widgets || [],
        },
        master: master ? { esqueleto: master.esqueleto || '<!--conteudo-->', fragmentos: (master.fragmentos || []).map(limpa), widgets: master.widgets || [] } : null,
        modelos: Object.fromEntries(modelos.map((m: any) => [m.chave, { html: m.html || '', css: m.css || '', js: m.js || '' }])),
      };
    },

    async sitemap(ctx: any) {
      const { dominio } = ctx.query as Record<string, string>;
      const site = (await strapi.documents('api::site.site').findFirst({ filters: { dominio: { $eq: dominio } }, populate: { paginaInicial: true } as never })) as any;
      if (!site) return ctx.notFound(`Nenhum site com o domínio ${dominio}`);
      const lista = (await strapi.documents('api::pagina.pagina').findMany({
        status: 'published',
        filters: { site: { documentId: { $eq: site.documentId } } },
        populate: { seo: true } as never,
        fields: ['caminho', 'updatedAt'] as never,
      })) as any[];
      ctx.body = lista
        .filter((p) => p.seo?.incluirNoSitemap !== false && p.seo?.indexar !== false)
        .map((p) => ({ url: `https://${site.dominio}${p.documentId === site.paginaInicial?.documentId ? '/' : p.caminho}`, atualizadaEm: p.updatedAt }));
    },
  };
};
