#!/bin/sh
# Gera o pacote de dados para outra máquina: base do Strapi (pg_dump) + arquivos da Media Library.
#   scripts/exportar-dados.sh            → pacote/hapvida-dados-AAAAMMDD.tar.gz
set -e
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
DATA=$(date +%Y%m%d)
TMP=pacote/tmp-$DATA
rm -rf "$TMP"; mkdir -p "$TMP/midia"

echo "▶ Base do Strapi"
docker compose exec -T postgres pg_dump -U strapi -d strapi -Fc > "$TMP/strapi.dump"

echo "▶ Arquivos da Media Library"
docker run --rm --network hapvida-novos-portais_default -v "$PWD/$TMP/midia":/midia \
  -e AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" -e AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" -e AWS_DEFAULT_REGION=us-east-1 \
  amazon/aws-cli:2.31.0 --endpoint-url http://rustfs:9000 s3 sync s3://midia /midia --only-show-errors

tar -czf "pacote/hapvida-dados-$DATA.tar.gz" -C "$TMP" .
rm -rf "$TMP"
ls -lh "pacote/hapvida-dados-$DATA.tar.gz"
