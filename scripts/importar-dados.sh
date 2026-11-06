#!/bin/sh
# Carrega o pacote de dados (gerado por exportar-dados.sh) numa máquina nova e sobe a stack.
#   scripts/importar-dados.sh hapvida-dados-AAAAMMDD.tar.gz
# ATENÇÃO: substitui a base do Strapi e os arquivos locais pelos do pacote.
set -e
PACOTE=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
cd "$(dirname "$0")/.."
[ -f "$PACOTE" ] || { echo "Pacote não encontrado: $1"; exit 1; }
[ -f .env ] || cp .env.example .env
set -a; . ./.env; set +a
TMP=pacote/tmp-importar
rm -rf "$TMP"; mkdir -p "$TMP"
tar -xzf "$PACOTE" -C "$TMP"

echo "▶ Subindo banco e armazenamento"
docker compose up -d postgres rustfs storage-init
docker compose stop cms front 2>/dev/null || true
until docker compose exec -T postgres pg_isready -U strapi >/dev/null 2>&1; do sleep 2; done

echo "▶ Restaurando a base do Strapi"
docker compose exec -T postgres psql -U strapi -d postgres -qc "DROP DATABASE IF EXISTS strapi WITH (FORCE);" -c "CREATE DATABASE strapi OWNER strapi;"
docker compose exec -T postgres pg_restore -U strapi -d strapi --no-owner < "$TMP/strapi.dump"

echo "▶ Restaurando os arquivos da Media Library"
until [ "$(docker inspect -f '{{.State.Status}}' hapvida-novos-portais-storage-init-1 2>/dev/null)" = "exited" ]; do sleep 2; done
docker run --rm --network hapvida-novos-portais_default -v "$PWD/$TMP/midia":/midia \
  -e AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" -e AWS_DEFAULT_REGION=us-east-1 \
  amazon/aws-cli:2.31.0 --endpoint-url http://rustfs:9000 s3 sync /midia s3://midia --only-show-errors
rm -rf "$TMP"

echo "▶ Subindo Strapi e front"
docker compose up -d --build
echo "Pronto: http://hapvida.localhost:3300 · admin http://localhost:1337/admin"
