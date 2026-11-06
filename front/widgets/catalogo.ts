// Catálogo dos widgets interativos (sem código de componente: pode ser usado no servidor)
const css = (pasta: string, arquivos: string[]) => arquivos.map((a) => `/widgets/${pasta}/${a}`);

export const CATALOGO: Record<string, { css: string[] }> = {
  'br.com.hapvida.react-blog-generico': { css: css('react-blogs-generico', ['styles.css']) },
  'br.com.hapvida.react-faq-lista': { css: css('react-faq-lista', ['styles.css']) },
  'br.com.hapvida.react-acesse-sua-area': { css: css('react-acesse-sua-area', ['styles.css']) },
  'br.com.hapvida.react-filtro-categoria': { css: css('react-filtro-categoria', ['styles.css']) },
  'br.com.hapvida.react-filtro-input-categoria': { css: css('react-filtro-input-categoria', ['styles.css']) },
  'br.com.hapvida.react-barra-pesquisa': { css: css('react-barra-pesquisa', ['styles.css']) },
  'br.com.hapvida.react-unidades': { css: css('react-unidades', ['styles.css']) },
  'br.com.hapvida.react-noticias': { css: css('react-noticias', ['styles.css']) },
  'br.com.hapvida.react-ultimas-noticias': { css: css('react-ultimas-noticias', ['styles.css']) },
  'br.com.hapvida.react-category-tags-carousel': { css: css('react-category-tags-carousel', ['styles.css']) },
  'br.com.hapvida.react-blog-da-saude': { css: css('react-blog-da-saude', ['styles.css']) },
  'br.com.hapvida.react-filtro-regiao': { css: css('react-filtro-regiao', ['styles.css']) },
  'br.com.hapvida.react-atendimento-presencial': { css: css('react-atendimento-presencial', ['styles.css']) },
  'br.com.hapvida.react-ultimas-pesquisas': { css: css('react-ultimas-pesquisas', ['styles.css']) },
  'br.com.hapvida.react-pesquisas': { css: css('react-pesquisas', ['styles.css']) },
  'br.com.hapvida.react-landingpage-form': { css: css('react-landingpage-form', ['styles.css']) },
  'br.com.hapvida.react-combobox-faq': { css: css('react-combobox-faq', ['styles.css']) },
  'br.com.hapvida.react-plans-banner': { css: css('react-plans-banner', ['styles.css']) },
};

// CSS comum a todos os widgets (styles.css importa card, pagination, unidades, breadcrumb e accordion)
export const CSS_COMPARTILHADO = css('compartilhado', ['styles.css']);
