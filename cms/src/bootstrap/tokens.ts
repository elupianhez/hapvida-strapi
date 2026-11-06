import type { Core } from '@strapi/strapi';

/**
 * Token de API com valor fixo (vindo do .env), para o front-end já subir configurado.
 *   - site: leitura de todos os content types (find/findOne). Também libera o rascunho no /api/resolver.
 * O Strapi gera tokens aleatórios; aqui o hash é sobrescrito com o valor do .env.
 */
type Def = { nome: string; env: string; descricao: string; tipo: 'custom' | 'full-access'; permissoes?: () => string[] };

const tiposApi = (strapi: Core.Strapi) =>
  Object.entries(strapi.contentTypes)
    .filter(([uid]) => uid.startsWith('api::'))
    .map(([uid, ct]) => ({ uid, single: ct.kind === 'singleType' }));

const DEFS = (strapi: Core.Strapi): Def[] => [
  {
    nome: 'site',
    env: 'SITE_API_TOKEN',
    descricao: 'Front-end: leitura de sites, páginas, menus, cabeçalhos, rodapés e master pages',
    tipo: 'custom',
    permissoes: () => tiposApi(strapi).flatMap(({ uid, single }) => (single ? [`${uid}.find`] : [`${uid}.find`, `${uid}.findOne`])),
  },
  { nome: 'migracao', env: 'MIGRACAO_API_TOKEN', descricao: 'Captura/espelho do Liferay (acesso total)', tipo: 'full-access' },
];

export const sincronizarTokens = async (strapi: Core.Strapi) => {
  const servico = strapi.service('admin::api-token');
  const cripto = strapi.service('admin::encryption');

  for (const def of DEFS(strapi)) {
    const valor = process.env[def.env];
    if (!valor) continue;
    const permissoes = def.permissoes?.() ?? [];
    let token = await strapi.db.query('admin::api-token').findOne({ where: { name: def.nome } });

    if (!token) {
      token = await servico.create({
        name: def.nome,
        description: def.descricao,
        type: def.tipo,
        kind: 'content-api',
        lifespan: null,
        ...(def.tipo === 'custom' ? { permissions: permissoes } : {}),
      });
    } else if (def.tipo === 'custom') {
      await servico.update(token.id, { permissions: permissoes });
    }

    await strapi.db.query('admin::api-token').update({
      where: { id: token.id },
      data: { accessKey: servico.hash(valor), encryptedKey: cripto.encrypt(valor) },
    });
  }
};
