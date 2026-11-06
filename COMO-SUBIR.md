# Como subir os sites Hapvida na sua máquina

Stack: **Strapi** (conteúdo) + **Next.js** (sites) + PostgreSQL + RustFS (arquivos), tudo no Docker Compose.
Você não precisa de acesso ao Liferay: os dados já migrados vêm num pacote.

## O que você recebe

| Arquivo | Tamanho | Conteúdo |
|---|---|---|
| `hapvida-portais-codigo-AAAAMMDD.zip` | ~16 MB | Código (Strapi, front, scripts de migração), temas e módulos já extraídos em `front/public` |
| `hapvida-dados-AAAAMMDD.tar.gz` | ~1,3 GB | Base do Strapi (`pg_dump`) + arquivos da Media Library (imagens, PDFs) |

O pacote de dados é grande demais para e-mail ou Git: compartilhe por OneDrive/SharePoint/Teams.

## Pré-requisitos

- Docker Desktop com pelo menos 6 GB de memória e ~8 GB livres em disco.
- Chrome ou Edge: eles abrem `*.localhost` sem configurar nada.
- Portas livres: **1337** (Strapi), **3300** (sites), **9900/9901** (arquivos).

## Passo a passo

```bash
unzip hapvida-portais-codigo-AAAAMMDD.zip -d hapvida-portais
cd hapvida-portais
cp .env.example .env
scripts/importar-dados.sh ~/Downloads/hapvida-dados-AAAAMMDD.tar.gz
```

O script sobe o banco e o armazenamento, restaura a base do Strapi, envia os arquivos para o bucket e
sobe o Strapi e o front. Na primeira vez o build leva alguns minutos.

> O `importar-dados.sh` **substitui** a base e os arquivos locais pelos do pacote. Use de novo sempre que
> receber um pacote mais novo.

## Endereços

| O quê | Endereço |
|---|---|
| Sites | `http://<chave>.localhost:3300` |
| Admin do Strapi | http://localhost:1337/admin · `admin@hapvida.poc` / `Hapvida123` |
| Console dos arquivos (RustFS) | http://localhost:9901 · `hapvida` / `hapvida-segredo-s3` |

Chaves dos sites: `hapvida`, `institucional`, `clinipam`, `landingpage`, `ccg`, `dashboards`, `minas`,
`hapvida-porto-alegre`, `suavida`, `lp-hapvidacuidae`, `notredame`.
Exemplo: http://hapvida.localhost:3300/unidades

A lista de todas as páginas, com o link novo e o original lado a lado, está em `urls.html`.

## Dia a dia

```bash
docker compose up -d                 # subir
docker compose down                  # parar (os dados ficam nos volumes)
docker compose logs -f front cms     # acompanhar logs
```

- **Front em desenvolvimento** (padrão, `FRONT_MODO=dev`): editar `front/app`, `front/lib`, `front/widgets` ou
  `front/components` recarrega na hora.
- **Front como em produção:** `FRONT_MODO=producao docker compose up -d --force-recreate --no-deps front`
  (faz `next build` e `next start`).
- **Strapi:** editar `cms/src` reinicia o Strapi sozinho. Tipos de conteúdo novos aparecem no admin após o reinício.
- **Sempre** use `--no-deps` ao recriar só o front, para não reiniciar o Strapi junto.

## Onde está cada coisa

| Pasta | O que é |
|---|---|
| `cms/` | Strapi: tipos de conteúdo (`src/api`), componentes, regras (`src/bootstrap`) e o endpoint `/api/renderizar` |
| `front/app` | Next.js: layout e página únicos para todos os sites; APIs dos widgets e formulários em `app/api` |
| `front/lib` | Montagem da página (`montar.ts`), acesso ao Strapi, filtros, objetos, conteúdos, taxonomia |
| `front/widgets` | Widgets React (unidades, notícias, blog, FAQ, filtros...) e o catálogo/registro deles |
| `front/public` | Temas, módulos e arquivos estáticos extraídos (CSS, JS, fontes, imagens) |
| `migracao/` | Ferramentas de migração e de comparação visual (só para quem for migrar de novo) |
| `scripts/` | Exportar/importar o pacote de dados e empacotar o código |

## Gerar um pacote novo (para quem mantém a base)

```bash
scripts/exportar-dados.sh       # → pacote/hapvida-dados-AAAAMMDD.tar.gz
scripts/empacotar-codigo.sh     # → pacote/hapvida-portais-codigo-AAAAMMDD.zip
```

## Rodar a migração de novo (opcional)

Só é necessário para trazer conteúdo novo do Liferay. Preencha `LIFERAY_OAUTH_CLIENT_ID` e
`LIFERAY_OAUTH_CLIENT_SECRET` no `.env` (pedir a quem mantém o projeto) e rode:

```bash
migracao/migrar-todos.sh                   # todos os sites, objetos, conteúdos e taxonomia
migracao/rodar.sh SITES=hapvida comparar.mjs   # comparação visual → migracao/relatorio-visual/hapvida/index.html
```

Instale as dependências da migração uma vez: `docker run --rm -v "$PWD/migracao":/w -w /w node:22-alpine npm install`.

## Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Página abre, mas widgets (unidades, notícias) ficam vazios | Abra pelo domínio `<chave>.localhost:3300`, não por `localhost:3300`. No Safari, use Chrome ou Edge. |
| `404 Nenhum site com o domínio ...` | O domínio não está cadastrado no Strapi. Use uma das chaves acima. |
| Imagens quebradas | O bucket não foi restaurado: rode `scripts/importar-dados.sh` de novo. |
| Porta em uso | Outro serviço usa 1337/3300/9900. Pare-o ou troque a porta em `docker-compose.yml`. |
| Strapi demora a subir | Na primeira vez ele instala e compila o admin; acompanhe com `docker compose logs -f cms`. |
| Banner de cookies e aviso de privacidade não aparecem | Esperado: o OneTrust só funciona nos domínios autorizados. |
| Formulário "envia" mas nada chega | Esperado por enquanto: os envios ficam em Content Manager → Envio de formulário. |
