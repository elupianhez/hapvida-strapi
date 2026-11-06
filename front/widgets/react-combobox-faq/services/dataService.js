import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";

function parseAccordion(item) {
    return {
        id: item.id,
        title: item.titulo,
        detail: item.detalhe,
        categories: (item.taxonomyCategoryBriefs ?? []).map((c) => c.taxonomyCategoryName),
    };
}

export async function fetchAccordions() {
    const globalGroupId = siteAtual().codigoGlobal;

    try {
        const data = await api(
            `/api/objetos/accordions/escopo/${globalGroupId}?pageSize=500`,
            { headers: { "Content-Type": "application/json" } }
        );

        return (data.items ?? []).map(parseAccordion);
    } catch (error) {
        throw new Error(`Erro ao buscar accordions: ${error.message ?? JSON.stringify(error)}`);
    }
}