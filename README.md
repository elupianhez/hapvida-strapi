# Sites Hapvida em Strapi + Next.js

Conteúdo no **Strapi**, sites no **Next.js**. Sem Liferay na stack: o site atual só é lido uma vez,
pelas ferramentas de `migracao/`, para extrair o conteúdo e comparar o visual.

```bash
docker compose up -d --build        # Strapi + Postgres + armazenamento + front
```

| O quê | Endereço | Acesso |
|---|---|---|
| Sites | http://<chave>.localhost:3300 — hapvida, institucional, clinipam, landingpage, ccg, dashboards, minas, hapvida-porto-alegre, suavida, lp-hapvidacuidae, notredame | público |
| Admin do Strapi | http://localhost:1337/admin | `admin@hapvida.poc` / `Hapvida123` |

Cada site responde no seu domínio. Localmente: `<chave>.localhost:3300` (o navegador resolve `*.localhost` sozinho).
Em produção, o domínio de cada site fica no campo **Domínio** do Site no Strapi.

## Como uma página é montada

```
Site (tema, estilos globais, scripts de terceiros)
 └─ Master page (cabeçalho/rodapé)  ──  esqueleto com <!--conteudo-->
     └─ Página (URL, SEO, CSS próprio) ── esqueleto com <!--f:ID--> e <!--w:ID-->
         ├─ Fragmentos: instância de um Modelo de fragmento + campos (textos, imagens, links)
         └─ Widgets: componentes React do front (listas, filtros, FAQ, busca)
```

| No Strapi | O que é |
|---|---|
| **Site** | domínio, chave, arquivos do tema, estilos globais, scripts de terceiros (OneTrust, analytics) |
| **Master page** | esqueleto comum (cabeçalho, rodapé) + fragmentos/widgets dele |
| **Página** | URL calculada, SEO, esqueleto, CSS da página, fragmentos, widgets |
| **Modelo de fragmento** | HTML com marcadores `{{c:campo}}` / `{{a:campo:atributo}}`, CSS e JS do bloco |
| **Redirecionamento** | endereço antigo → novo |
| **Vocabulário / Categoria** | taxonomia (temas, anos, tipos de notícia...) |
| **obj-*** | dados que os widgets usam (unidades, especialidades, notícias, FAQ, informações regulatórias...) |

O front (`front/`) busca tudo em `GET /api/renderizar?dominio=&caminho=` e monta o HTML
(`front/lib/montar.ts`). O JS de cada fragmento roda com o mesmo contrato de antes
(`fragmentElement`, `configuration`). Os widgets React (`front/widgets/`) leem os dados pela API do
próprio front: `/api/objetos/<objeto>` (filtro, busca, ordenação, paginação) e `/api/taxonomia/...`.
Mídias são servidas em `/midia/...` no domínio do site.

## Migração

```bash
migracao/migrar-todos.sh                 # todos os sites: extrai, importa páginas, depois objetos, conteúdos e taxonomia
migracao/migrar-todos.sh hapvida minas   # só esses sites (páginas)
SEM_EXTRAIR=1 migracao/migrar-todos.sh   # reimporta sem extrair de novo
migracao/rodar.sh SITES=hapvida CONCORRENCIA=6 comparar.mjs   # → migracao/relatorio-visual/<site>/index.html
```

| Script | O que faz |
|---|---|
| `extrair.mjs` | lê o HTML público de cada página e gera `migracao/dados/<site>/` (esqueletos, modelos de fragmento, widgets, mídia) e os arquivos do tema/módulos em `front/public/temas` e `front/public/modulos` |
| `importar.mjs` | grava site, masters, páginas, modelos e redirecionamentos no Strapi; mídias na Media Library |
| `gerarTipos.mjs` | gera os tipos `obj-*` a partir das definições dos Objects (só quando mudarem) |
| `importarObjetos.mjs` | registros dos Objects (inclui escopo global) |
| `importarConteudos.mjs` | conteúdos estruturados (artigos, banners, cards) e as estruturas |
| `importarTaxonomia.mjs` | vocabulários/categorias citados nos dados, na ordem original (`TODAS=true` reimporta) |
| `capturarListas.mjs` | estados e cidades usados pelo formulário de ouvidoria → `front/lib/dados` |
| `comparar.mjs` | screenshots do site atual × front novo (desktop e celular) e % de diferença |
| `posicoes.mjs`, `detalhar.mjs`, `regras.mjs`, `console.mjs`, `erro.mjs`, `avaliar.mjs` | diagnóstico de uma diferença |

O que o extrator troca para não depender do Liferay: links e mídias, `AUI().ready`/`Liferay.on`/`themeDisplay`
(viram o objeto `Pagina` e `window.__SITE__` do front), formulários de portlet e serviços `/o/...` (viram
`/api/formularios` e `/api/servicos`). Runtime do portal (loader, combos, SPA) é descartado.

### Front em modo produção

```bash
FRONT_MODO=producao docker compose up -d --force-recreate --no-deps front   # build + start, como no deploy
```

## Regras do Strapi

`cms/src/bootstrap/regras.ts` (em transação): URL calculada por slug + página pai, URL única por site,
sem ciclo de páginas, e menu/cabeçalho/rodapé/master/página só apontam para itens do próprio site.

## Pendências

- Formulários (ouvidoria, leads, e-mail, Salesforce): os envios ficam gravados em **Envio de formulário** no Strapi; o encaminhamento aos sistemas de destino depende das credenciais.
- Busca de cirurgias (`/api/servicos/searchCirurgia/search`) e portlets Java de busca: o visual é o mesmo, a busca ainda não tem fonte de dados.
- OneTrust (banner de cookies e aviso de privacidade) só aparece nos domínios autorizados.
- Textos de alguns fragmentos estão no HTML do modelo (não eram campos editáveis no site atual).
- HML/produção em Azure (Blob Storage, PostgreSQL gerenciado, Container Apps, Front Door).

`_arquivado/` guarda a PoC anterior (portal logado, SSO, MCP, gateway), fora da stack.
