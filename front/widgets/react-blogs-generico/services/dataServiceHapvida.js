import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";

const getSiteName = () => siteAtual().chave || null;

export async function fetchCategoryIdByERC(isGlobal, categoryERC) {
    let siteId = "global";
    if (!isGlobal) {
        siteId = siteAtual().chave;
    }

    const baseUrl = `/api/taxonomia/categorias/erc/${encodeURIComponent(categoryERC)}?escopo=${siteId}`;
    const response = await api(baseUrl, {
        headers: { "Content-Type": "application/json" },
    });

    return { id: response?.id, name: response?.name };
}

export async function fetchDataItems(serviceUrl, setItems, setItemsOriginal, categoryId) {
    let site;
	let pageSize = 60;
    try {
        [site] = await Promise.all([getSiteName()]);
    } catch (err) {
        console.error("Erro ao inicializar fetchDataItems:", err);
        setItems([]);
        setItemsOriginal([]);
        return;
    }

    const filter = `sites/any(s:s eq '${site}')`;
    let filterCategory = "";
    if (categoryId) {
        filterCategory = ` and taxonomyCategoryIds/any(s:s eq ${categoryId})`
        pageSize = 3;
    }

    const url = `/api/objetos/${serviceUrl}?nestedFields=taxonomyCategoryBriefs&pageSize=${pageSize}&page=1&sort=data:desc&filter=${encodeURIComponent(filter)}${encodeURIComponent(filterCategory)}`;

    api(url, { headers: { "Content-Type": "application/json" } })
        .then((response) => {
            if (categoryId){
            setItems({
                ...response,
                totalCount: response.items?.length ?? 0,
                });
            } else {
                setItems(response)
            }
        })
        .catch((err) => {
            console.error("Erro ao buscar artigos:", err);
            setItems([]);
        });

	if (!categoryId) {
	    fetchAllItems(serviceUrl, site)
	        .then(setItemsOriginal)
	        .catch((err) => {
	            console.error("Erro ao buscar artigos:", err);
	            setItemsOriginal([]);
	        });
    }
}

export async function fetchRelatedBaseItems(serviceUrl) {
	const site = getSiteName();

	if (!site) {
		return { items: [], totalCount: 0 };
	}

	return fetchAllItems(serviceUrl, site);
}

async function fetchAllItems(serviceUrl, site) {
	const filter = `sites/any(s:s eq '${site}')`
	const baseUrl = `/api/objetos/${serviceUrl}?nestedFields=taxonomyCategoryBriefs&pageSize=500&sort=data:desc&filter=${encodeURIComponent(filter)}`;

	const response = await api(`${baseUrl}&page=1`, {
		headers: {
			"Content-Type": "application/json"
		}
	});

	const totalPages = Math.ceil((response.totalCount || 0) / 500);

	if (totalPages <= 1) {
		return response;
	}

	const requests = [];

	for (let page = 2; page <= totalPages; page++) {
		requests.push(
			api(`${baseUrl}&page=${page}`, {
				headers: {
					"Content-Type": "application/json"
				}
			})
		);
	}

	const responses = await Promise.all(requests);

	responses.forEach((pageResponse) => {
		response.items = [...response.items, ...(pageResponse.items || [])];
	});

	return response;
}