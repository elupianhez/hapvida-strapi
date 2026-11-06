#!/bin/sh
# Gera um .zip do código (sem dependências, builds, relatórios nem .env) para compartilhar.
#   scripts/empacotar-codigo.sh   → pacote/hapvida-portais-codigo-AAAAMMDD.zip
set -e
cd "$(dirname "$0")/.."
mkdir -p pacote
NOME="pacote/hapvida-portais-codigo-$(date +%Y%m%d).zip"
rm -f "$NOME"
zip -qr "$NOME" . -x '*/node_modules/*' 'node_modules/*' '*/.next/*' '.env' '.idea/*' 'pacote/*' \
  'migracao/relatorio-visual/*' '_arquivado/*' '*.DS_Store' '*.pdf'
ls -lh "$NOME"
