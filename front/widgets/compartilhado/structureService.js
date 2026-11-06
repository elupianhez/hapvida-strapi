import api from "./endpoints";
import { siteAtual } from "./site";

async function fetchStructureIdByName(structureName) {
	try {
		const response = await api(
			`/api/conteudos/estruturas?nome=${encodeURIComponent(structureName)}`,
			{
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		if (!response.items || response.items.length === 0) {
			return null;
		}

		return response.items[0].id;
	} catch (error) {
		console.error("Erro ao buscar structureId pelo nome", error);
		return null;
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

export { fetchCategoryIdByName, fetchStructureIdByName };
