# PoC: Strapi em modo develop (Content-Type Builder liberado e recarga ao editar ./src).
# Produção: `npm run build && npm run start`, com NODE_ENV=production.
FROM node:22-alpine

RUN apk add --no-cache libc6-compat vips-dev
WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ENV STRAPI_TELEMETRY_DISABLED=true
EXPOSE 1337
CMD ["npm", "run", "develop"]
