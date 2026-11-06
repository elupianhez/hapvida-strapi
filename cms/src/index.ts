import type { Core } from '@strapi/strapi';

import { registrarRegras } from './bootstrap/regras';
import { seedDemo } from './bootstrap/seed';
import { configurarTelas } from './bootstrap/telas';
import { sincronizarTokens } from './bootstrap/tokens';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registrarRegras(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await sincronizarTokens(strapi);
    // Espelho: guarda imagens como vieram do Liferay (sem miniaturas nem recompressão)
    await strapi.store({ type: 'plugin', name: 'upload', key: 'settings' }).set({
      value: { sizeOptimization: false, responsiveDimensions: false, autoOrientation: false },
    });
    await configurarTelas(strapi);
    await seedDemo(strapi);
  },
};
