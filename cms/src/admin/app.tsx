import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Admin em português (o editor pode trocar no perfil).
    locales: ['pt-BR'],
    translations: {
      'pt-BR': {
        'Auth.form.welcome.title': 'CMS Hapvida (PoC)',
        'Auth.form.welcome.subtitle': 'Usuário admin@hapvida.poc · senha Hapvida123',
      },
    },
  },
  bootstrap(_app: StrapiApp) {},
};
