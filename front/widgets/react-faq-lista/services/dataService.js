import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";

function stripParagraphTags(html) {
    if (!html) return "";
    return html.replace(/<p[^>]*>/gi, "").replace(/<\/p>/gi, "");
}

function parseFaqEntry(item) {
    return {
        id: item.id,
        pergunta: item.pergunta ?? "",
        resposta: stripParagraphTags(item.resposta ?? ""),
        tema: item.tema?.key ?? item.tema ?? "",
        temaLabel: item.tema?.name_i18n?.["pt_BR"] ?? item.tema?.name ?? item.tema ?? "",
        ordem: item.ordem ?? 0,
    };
}

export async function fetchAllFaqs(objectName) {
    try {
        const siteId = siteAtual().chave;
        const objectPath = (objectName || "faqs").trim().toLowerCase();
        const baseUrl = `/api/objetos/${objectPath}/escopo/${siteId}?pageSize=500`;

        const firstPage = await api(`${baseUrl}&page=1`, {
            headers: { "Content-Type": "application/json" }
        });

        const totalPages = Math.ceil((firstPage.totalCount || 0) / 500);
        let items = firstPage.items || [];

        if (totalPages > 1) {
            const remaining = await Promise.all(
                Array.from({ length: totalPages - 1 }, (_, i) =>
                    api(`${baseUrl}&page=${i + 2}`, {
                        headers: { "Content-Type": "application/json" }
                    })
                )
            );
            remaining.forEach((p) => {
                items = [...items, ...(p.items || [])];
            });
        }

        return items.map(parseFaqEntry);
    } catch (err) {
        console.error("Erro ao buscar entradas do Object de FAQ", err);
        return [];
    }
}
