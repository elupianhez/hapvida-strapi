import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    // Libera no admin as imagens do bucket S3 (RustFS) e o preview do site.
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', env('S3_PUBLIC_URL', 'http://localhost:9900')],
          'media-src': ["'self'", 'data:', 'blob:', env('S3_PUBLIC_URL', 'http://localhost:9900')],
          'frame-src': ["'self'", env('SITE_URL', 'http://localhost:8800')],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { formLimit: '50mb', jsonLimit: '50mb', formidable: { maxFileSize: 50 * 1024 * 1024 } } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
