#!/bin/sh
# Roda uma ferramenta de migração num contêiner, com as variáveis do .env.
#   migracao/rodar.sh [VAR=valor ...] script.mjs [args]
# Scripts com navegador (comparar, posicoes...) usam a imagem do Playwright.
cd "$(dirname "$0")/.." || exit 1
set -a; . ./.env; set +a
ENVS=""
while [ $# -gt 0 ] && echo "$1" | grep -q '^[A-Z_]*='; do ENVS="$ENVS -e $1"; shift; done
case "$1" in
  comparar.mjs|erro.mjs|avaliar.mjs|posicoes.mjs|detalhar.mjs|regras.mjs|console.mjs|rede.mjs) IMG=mcr.microsoft.com/playwright:v1.65.0-noble ;;
  *) IMG=node:22-alpine ;;
esac
exec docker run --rm --shm-size=2g --network hapvida-novos-portais_default -v "$PWD":/p -w /p/migracao \
  -e LIFERAY_URL -e LIFERAY_OAUTH_CLIENT_ID -e LIFERAY_OAUTH_CLIENT_SECRET -e LIFERAY_SITES \
  -e MIGRACAO_API_TOKEN -e STRAPI_URL=http://cms:1337 $ENVS "$IMG" node "$@"
