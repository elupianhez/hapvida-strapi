import api from "./endpoints";
import { siteAtual } from "./site";

async function fetchStructureIdByName(structureName) {
    try {
        const data = await api(
            `/api/conteudos/estruturas?nome=${encodeURIComponent(structureName)}`,
            { headers: { "Content-Type": "application/json" } }
        );
        return data.items[0]?.id ?? null;
    } catch (error) {
        throw new Error(`Erro ao buscar estrutura pelo nome: ${error.message ?? JSON.stringify(error)}`);
    }
}


async function fetchVocabularyIdByERC(siteId, erc) {
	try {
		const data = await api(
			`/api/taxonomia/vocabularios/erc/${encodeURIComponent(erc)}?escopo=${siteId}`,
			{
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
		return data?.id ?? null;
	} catch (error) {
		throw new Error(`Erro ao buscar vocabulário pelo ERC: ${error.message ?? JSON.stringify(error)}`);
	}
}

async function fetchCategoriesByVocabularyERC(isGlobal, vocabularyERC) {
	// Mesma semântica do código original: qualquer valor "verdadeiro" (inclusive o texto "false") = global
	const siteId = isGlobal ? "global" : siteAtual().chave;
	const vocabularyId = await fetchVocabularyIdByERC(siteId, vocabularyERC);

	if (!vocabularyId) {
		return [];
	}
	const response = await api(
		`/api/taxonomia/vocabularios/${vocabularyId}/categorias`,
		{
			headers: {
				"Content-Type": "application/json"
			}
		}
	);
	return response?.items ?? [];
}

async function fetchContentsByStructureId(structureId) {
    try {
        const data = await api(
            `/api/conteudos/estruturas/${structureId}`,
            { headers: { "Content-Type": "application/json" } }
        );

        return data.items ?? [];

    } catch (error) {
        throw new Error(`Erro ao buscar conteúdos pela estrutura: ${error.message ?? JSON.stringify(error)}`);
    }
}

async function fetchCategoryIdByName(structureName, vocabularyName) {
	try {
		const response = await api(`/api/taxonomia/categorias?nome=${encodeURIComponent(structureName)}&escopo=${siteAtual().chave}`, {
            method: 'GET'
        });

		if (!response.items || response.items.length === 0) {
			return null;
		}

		const category = response.items.find(
            (item) => item.parentTaxonomyVocabulary?.name === vocabularyName
        );

        return category ? category.id : null;
	} catch (error) {
		console.error("Erro ao buscar structureId pelo nome", error);
		return null;
	}
}

async function fetchCategoryGroupIdByName(categoryGroupName) {

    try {
        const data = await api(
            `/api/taxonomia/vocabularios?contem=${encodeURIComponent(categoryGroupName)}&escopo=${siteAtual().chave}`,
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );

        return data.items?.[0]?.id ?? null;

    } catch (error) {
        throw new Error(`Erro ao buscar category group pelo nome: ${error.message ?? JSON.stringify(error)}`);
    }
}

async function fetchCategoriesByVocabularyId(vocabularyId) {
    try {
        const data = await api(
            `/api/taxonomia/vocabularios/${vocabularyId}/categorias`,
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );

        return data.items?.map(({ id, name }) => ({ id, name })) ?? [];

    } catch (error) {
        throw new Error(`Erro ao buscar categorias: ${error.message ?? JSON.stringify(error)}`);
    }
}

async function fetchBreadcrumbEntries() {
    try {
        const portalURL = window.location.origin;
        const fullCurrentURL = window.location.href;
        const layoutRelativeURL = window.location.pathname;

        const slugTitleMap = {
            "blog-da-saude": "Blog da Saúde",
            "noticias": "Notícias",
            "home": "Home",
            "pesquisas" : "Instituto de Pesquisa",
        };

        function formatSlug(slug) {
            if (slugTitleMap[slug]) return slugTitleMap[slug];
            return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }

        const homeUrl = (() => {
            const isHmlOrStg =
                fullCurrentURL.includes("web");

            if (isHmlOrStg) {
                const segments = layoutRelativeURL.split("/").filter(Boolean);
                const webIndex = segments.indexOf("web");
                if (webIndex !== -1) {
                    const siteContext = "/" + segments.slice(0, webIndex + 2).join("/");
                    return `${portalURL}${siteContext}`;
                }
            }

            return `${portalURL}${siteAtual().inicio || "/"}`;
        })();

        const IGNORED_SEGMENTS = ["w", "artigo"];
        const filteredSegments = layoutRelativeURL.split("/").filter(Boolean).filter(seg => !IGNORED_SEGMENTS.includes(seg));

        const hasSitePrefix = filteredSegments[0] === "web";

        const sitePrefix = hasSitePrefix
            ? "/" + filteredSegments.slice(0, 2).join("/")
            : "";

        const pageSegments = hasSitePrefix
            ? filteredSegments.slice(2)
            : filteredSegments;

        const contentParents = ["blog-da-saude", "noticias", "pesquisas"];

        const parentSlugIndex = pageSegments.findIndex(seg => contentParents.includes(seg));
        const parentSlug = parentSlugIndex !== -1 ? pageSegments[parentSlugIndex] : null;

        const isContentPage = !!parentSlug;

        let entries = [];

        if (isContentPage) {
            const parentTitle = formatSlug(parentSlug);
            const parentPath = sitePrefix + "/" + pageSegments.slice(0, parentSlugIndex + 1).join("/");
            const parentUrl = `${portalURL}${parentPath}`;

            entries = [
                { title: parentTitle, url: parentUrl, isCurrent: true }
            ];
        } else {
            entries = pageSegments.map((seg, i) => {
                const path = sitePrefix + "/" + pageSegments.slice(0, i + 1).join("/");
                const url = portalURL + path;
                const isCurrent = i === pageSegments.length - 1;

                return {
                    title: formatSlug(seg),
                    url,
                    isCurrent
                };
            });
        }

        return { homeUrl, entries };

    } catch (error) {
        throw new Error(`Erro ao montar breadcrumb: ${error.message ?? JSON.stringify(error)}`);
    }
}

async function fetchSiteName() {
    try {
        return siteAtual().nome?.toLowerCase() || "";
    } catch {
        return "";
    }
}

async function fetchAllObjectEntries(objectName, siteId, userPageArea) {
    try {
        const filterParam = userPageArea
            ? `&filter=${encodeURIComponent(
                  `userPageArea eq '${userPageArea}'`
              )}`
            : "";

        const data = await api(
            `/api/objetos/${objectName}/escopo/${siteId}?pageSize=500${filterParam}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return data.items ?? [];
    } catch (error) {
        throw new Error(
            `Erro ao buscar entradas do Object '${objectName}': ${
                error.message ?? JSON.stringify(error)
            }`
        );
    }
}

export { fetchStructureIdByName, fetchCategoryIdByName, fetchCategoryGroupIdByName, fetchCategoriesByVocabularyId, fetchBreadcrumbEntries, fetchContentsByStructureId, fetchSiteName, fetchVocabularyIdByERC, fetchCategoriesByVocabularyERC, fetchAllObjectEntries };
