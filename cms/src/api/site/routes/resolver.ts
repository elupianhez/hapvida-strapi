/**
 * Rotas públicas de leitura para o front-end (conteúdo publicado).
 * Rascunho exige o token do site (validado no controller).
 */
export default {
  routes: [
    { method: 'GET', path: '/resolver', handler: 'resolver.resolver', config: { auth: false } },
    { method: 'GET', path: '/renderizar', handler: 'resolver.renderizar', config: { auth: false } },
    { method: 'GET', path: '/sitemap', handler: 'resolver.sitemap', config: { auth: false } },
  ],
};
