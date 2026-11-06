import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";
import { fetchStructureIdByName } from "react-shared-bundle/structureService";
import { parseSearchContent } from "../utils/util";

export async function fetchDataBlog(structureName, setAllData, setFilteredData) {
    try {
        const siteId = siteAtual().codigo;

        const structureId = await fetchStructureIdByName(structureName);

        if (!structureId) {
            setAllData([]);
            setFilteredData([]);
            return;
        }

        const items = await fetchAllStructuredContents(structureId, siteId);
        const articleList = items.map(parseSearchContent);

        setAllData(articleList);
        setFilteredData(articleList);
    } catch (err) {
        console.error("Erro ao buscar dados", err);
        setAllData([]);
        setFilteredData([]);
    }
}

async function fetchAllStructuredContents(structureId, siteId) {
    try {
        const filter = encodeURIComponent(`siteId eq ${siteId}`);
        const data = await api(
            `/api/conteudos/estruturas/${structureId}?filter=${filter}&nestedFields=taxonomyCategoryBriefs&pageSize=500`,
            { headers: { "Content-Type": "application/json" } }
        );

        return data.items ?? [];
    } catch (error) {
        throw new Error(`Erro ao buscar conteúdos pela estrutura: ${error.message ?? JSON.stringify(error)}`);
    }
}