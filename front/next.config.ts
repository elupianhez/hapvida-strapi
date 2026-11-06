import type { NextConfig } from 'next';

// Mídias da Media Library servidas no domínio do próprio site (/midia/...)
const MIDIA_INTERNA = (process.env.MIDIA_INTERNA || 'http://rustfs:9000/midia').replace(/\/+$/, '');

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  devIndicators: false,
  // Em desenvolvimento, cada site é aberto pelo seu domínio (<site>.localhost) — liberar o JS do Next para eles
  allowedDevOrigins: ['front', '*.localhost', 'localhost'],
  rewrites: async () => [{ source: '/midia/:arquivo*', destination: `${MIDIA_INTERNA}/:arquivo*` }],
};

export default config;
