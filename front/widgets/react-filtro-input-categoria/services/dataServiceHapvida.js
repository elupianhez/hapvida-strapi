import api from "react-shared-bundle/endpoints";
import { fetchVocabularyIdByERC } from "react-shared-bundle/structure";
import { siteAtual } from "react-shared-bundle/site";

export async function fetchCategoryElements(setCategorias, isGlobal, vocabularyERC) {
	let siteId = "global";
	if (!isGlobal){
		siteId = siteAtual().chave;
	}
    const vocabularyId = await fetchVocabularyIdByERC(siteId, vocabularyERC);

    const baseUrl = `/api/taxonomia/vocabularios/${vocabularyId}/categorias?`;
    const response = await api(`${baseUrl}&pageSize=500`, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    setCategorias(response?.items);
}