import type { Core } from '@strapi/strapi';

/**
 * Rótulos, dicas e campos somente leitura nas telas do admin (o que o marketing vê).
 * O Strapi guarda isso na "configuração de visualização"; aqui ela é aplicada no boot
 * para ficar versionada no código. Só os campos listados são alterados.
 */
type Campo = { rotulo: string; dica?: string; somenteLeitura?: boolean };

const TELAS: Record<string, { tipo: 'ct' | 'comp'; campos: Record<string, Campo>; tituloLista?: string }> = {
  'api::site.site': {
    tipo: 'ct',
    tituloLista: 'nome',
    campos: {
      nome: { rotulo: 'Nome do site' },
      dominio: { rotulo: 'Domínio', dica: 'Endereço do site, sem https://. Ex.: www.hapvida.com.br' },
      logo: { rotulo: 'Logo' },
      favicon: { rotulo: 'Favicon' },
      marca: { rotulo: 'Marca (tema de cores)' },
      paginaInicial: { rotulo: 'Página inicial', dica: 'Página exibida no endereço "/" do site' },
      masterPagePadrao: { rotulo: 'Master page padrão', dica: 'Usada por todas as páginas que não escolherem outra' },
      seoPadrao: { rotulo: 'SEO padrão do site', dica: 'Usado quando a página não preencher o próprio SEO' },
    },
  },
  'api::pagina.pagina': {
    tipo: 'ct',
    tituloLista: 'titulo',
    campos: {
      titulo: { rotulo: 'Título' },
      site: { rotulo: 'Site' },
      masterPage: { rotulo: 'Master page', dica: 'Vazio = usa a master page padrão do site' },
      slug: { rotulo: 'Slug (parte da URL)', dica: 'Só letras minúsculas, números e hífen. Ex.: plano-individual' },
      paginaPai: { rotulo: 'Página pai', dica: 'Define a hierarquia da URL. Ex.: pai "Planos" → /planos/plano-individual' },
      caminho: { rotulo: 'URL da página', dica: 'Calculada automaticamente a partir do slug e da página pai', somenteLeitura: true },
      seo: { rotulo: 'SEO' },
      conteudo: { rotulo: 'Conteúdo da página (blocos)' },
    },
  },
  'api::master-page.master-page': {
    tipo: 'ct',
    tituloLista: 'nome',
    campos: {
      nome: { rotulo: 'Nome' },
      site: { rotulo: 'Site' },
      cabecalho: { rotulo: 'Cabeçalho' },
      rodape: { rotulo: 'Rodapé' },
      antesDoConteudo: { rotulo: 'Faixas antes do conteúdo', dica: 'Aparecem em todas as páginas desta master page, acima do conteúdo' },
      depoisDoConteudo: { rotulo: 'Faixas depois do conteúdo', dica: 'Aparecem em todas as páginas desta master page, abaixo do conteúdo' },
    },
  },
  'api::menu.menu': {
    tipo: 'ct',
    tituloLista: 'nome',
    campos: {
      nome: { rotulo: 'Nome do menu' },
      site: { rotulo: 'Site' },
      itens: { rotulo: 'Itens do menu', dica: 'Arraste para reordenar. Cada item pode ter subitens (2º nível)' },
    },
  },
  'api::cabecalho.cabecalho': {
    tipo: 'ct',
    tituloLista: 'nome',
    campos: {
      nome: { rotulo: 'Nome' },
      site: { rotulo: 'Site' },
      logo: { rotulo: 'Logo', dica: 'Vazio = usa o logo do site' },
      menu: { rotulo: 'Menu' },
      botoes: { rotulo: 'Botões de destaque' },
      mostrarBusca: { rotulo: 'Mostrar busca' },
    },
  },
  'api::rodape.rodape': {
    tipo: 'ct',
    tituloLista: 'nome',
    campos: {
      nome: { rotulo: 'Nome' },
      site: { rotulo: 'Site' },
      colunas: { rotulo: 'Colunas de links' },
      redesSociais: { rotulo: 'Redes sociais' },
      textoLegal: { rotulo: 'Texto legal', dica: 'Ex.: razão social e registro ANS' },
    },
  },
  'navegacao.item-menu': {
    tipo: 'comp',
    tituloLista: 'rotulo',
    campos: {
      rotulo: { rotulo: 'Texto do item' },
      pagina: { rotulo: 'Página do site', dica: 'Escolha uma página OU preencha a URL externa' },
      urlExterna: { rotulo: 'URL externa', dica: 'Ex.: https://... (usada se nenhuma página for escolhida)' },
      novaAba: { rotulo: 'Abrir em nova aba' },
      subitens: { rotulo: 'Subitens (2º nível)' },
    },
  },
  'navegacao.subitem-menu': {
    tipo: 'comp',
    tituloLista: 'rotulo',
    campos: {
      rotulo: { rotulo: 'Texto do subitem' },
      pagina: { rotulo: 'Página do site' },
      urlExterna: { rotulo: 'URL externa' },
      novaAba: { rotulo: 'Abrir em nova aba' },
    },
  },
  'navegacao.botao': {
    tipo: 'comp',
    tituloLista: 'rotulo',
    campos: {
      rotulo: { rotulo: 'Texto do botão' },
      pagina: { rotulo: 'Página do site' },
      urlExterna: { rotulo: 'URL externa' },
      novaAba: { rotulo: 'Abrir em nova aba' },
      estilo: { rotulo: 'Estilo' },
    },
  },
  'seo.pagina': {
    tipo: 'comp',
    campos: {
      tituloSeo: { rotulo: 'Título para o Google', dica: 'Até 70 caracteres. Vazio = título da página. O sufixo do site é adicionado' },
      descricao: { rotulo: 'Descrição para o Google', dica: 'Até 160 caracteres. Vazio = descrição padrão do site' },
      imagemCompartilhamento: { rotulo: 'Imagem de compartilhamento', dica: 'Aparece ao compartilhar no WhatsApp e redes sociais' },
      urlCanonica: { rotulo: 'URL canônica', dica: 'Só preencha se o conteúdo for cópia de outra URL' },
      indexar: { rotulo: 'Permitir que buscadores indexem' },
      incluirNoSitemap: { rotulo: 'Incluir no sitemap' },
    },
  },
  'seo.padrao-site': {
    tipo: 'comp',
    campos: {
      sufixoTitulo: { rotulo: 'Sufixo do título', dica: 'Ex.: " | Hapvida" (vai depois do título de cada página)' },
      descricao: { rotulo: 'Descrição padrão' },
      imagemCompartilhamento: { rotulo: 'Imagem de compartilhamento padrão' },
    },
  },
};

export const configurarTelas = async (strapi: Core.Strapi) => {
  for (const [uid, tela] of Object.entries(TELAS)) {
    const servico = strapi.plugin('content-manager').service(tela.tipo === 'ct' ? 'content-types' : 'components');
    const modelo = tela.tipo === 'ct' ? strapi.contentTypes[uid as never] : strapi.components[uid as never];
    if (!modelo) continue;
    const atual = await servico.findConfiguration(modelo);
    const metadatas = { ...atual.metadatas };
    for (const [campo, c] of Object.entries(tela.campos)) {
      const m = metadatas[campo];
      if (!m) continue;
      metadatas[campo] = {
        ...m,
        edit: { ...m.edit, label: c.rotulo, description: c.dica ?? m.edit?.description ?? '', ...(c.somenteLeitura ? { editable: false } : {}) },
        list: { ...m.list, label: c.rotulo },
      };
    }
    const settings = tela.tituloLista ? { ...atual.settings, mainField: tela.tituloLista } : atual.settings;
    await servico.updateConfiguration(modelo, { settings, metadatas, layouts: atual.layouts });
  }
};
