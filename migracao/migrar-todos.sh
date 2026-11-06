#!/bin/sh
# Migração completa (idempotente): extrai e importa os sites, depois dados dos widgets e taxonomia.
#   migracao/migrar-todos.sh [site ...]      (sem argumentos: todos de LIFERAY_SITES)
#   SEM_EXTRAIR=1 migracao/migrar-todos.sh    reimporta sem extrair de novo
cd "$(dirname "$0")/.." || exit 1
set -a; . ./.env; set +a
R=migracao/rodar.sh
ALVOS="$*"
for par in $(echo "$LIFERAY_SITES" | tr ',' ' '); do
  id=${par%%:*}; s=${par##*:}
  [ -n "$ALVOS" ] && ! echo " $ALVOS " | grep -q " $s " && continue
  echo "=== $s ($id)"
  if [ -z "$SEM_EXTRAIR" ]; then rm -rf "migracao/dados/$s"; $R SITE=$s SITE_ID=$id extrair.mjs 2>&1 | grep -E "Fim:"; fi
  $R SITE=$s SITE_ID=$id DOMINIO=$s.localhost importar.mjs 2>&1 | grep -E "Páginas:|⚠️ página"
done
[ -n "$ALVOS" ] && exit 0
echo "=== dados dos widgets"
$R importarObjetos.mjs 2>&1 | grep -E "Taxonomia|Fim"
$R importarConteudos.mjs 2>&1 | grep -E "Fim"
$R TODAS=true importarTaxonomia.mjs 2>&1 | grep -E "Fim"
