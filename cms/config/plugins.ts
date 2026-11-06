import type { Core } from '@strapi/strapi';

// Espelho do Liferay: precisa aceitar tudo que as páginas carregam (fontes, SVG, etc.).
const allowedMediaTypes = [
  'font/*',
  'application/font-woff',
  'application/x-font-woff',
  'application/vnd.ms-fontobject',
  'application/octet-stream',
  'image/svg+xml',
  'application/zip',
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: { httpOnly: true },
    },
  },
  // Documents & Media do Liferay → bucket S3 (RustFS na PoC; S3/OCI/Azure em produção).
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        // URL pública dos arquivos (o navegador acessa o bucket direto).
        baseUrl: env('S3_PUBLIC_URL'),
        s3Options: {
          endpoint: env('S3_ENDPOINT'),
          region: env('S3_REGION', 'us-east-1'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
          },
          // Sem ACL: o acesso público é dado pela política do bucket (storage-init).
          params: { Bucket: env('S3_BUCKET', 'midia'), ACL: undefined },
        },
      },
      security: { allowedTypes: allowedMediaTypes, deniedTypes },
    },
  },
});

export default config;
