import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";
import { fetchStructureIdByName, fetchCategoryIdByName } from "react-shared-bundle/structure";

export async function fetchDataBlogInitial(structureName, categoryName, vocabularyName) {
    const siteId = siteAtual().codigo;

    const structureId = await fetchStructureIdByName(structureName);
    const categoryId = await fetchCategoryIdByName(categoryName, vocabularyName);

    const isValid = (val) => val && !val?.erro && !isNaN(Number(val));

    if (!isValid(structureId) || !isValid(categoryId)) {
        console.warn("IDs inválidos — structureId:", structureId, "categoryId:", categoryId);
        return { items: [], totalCount: 0, totalPages: 0, structureId: null, filter: null };
    }

    let filter = `siteId eq ${siteId}`;
    if (categoryId != null && categoryId !== "0") {
        filter += ` and taxonomyCategoryIds/any(t:t eq ${categoryId})`;
    }

    const pageSize = 5;
    const initialPages = 5;

    const requests = Array.from({ length: initialPages }, (_, i) =>
        api(
            `/api/conteudos/estruturas/${structureId}`
            + `?filter=${encodeURIComponent(filter)}&nestedFields=taxonomyCategoryBriefs&pageSize=${pageSize}&page=${i + 1}&sort=contentFields/dataPublicacao:desc`,
            { headers: { "Content-Type": "application/json" } }
        )
    );

    const responses = await Promise.all(requests);
    const totalCount = responses[0]?.totalCount || 0;

    let allItems = [];
    responses.forEach((response) => {
        if (response.items) {
            allItems = [...allItems, ...response.items];
        }
    });

    const mappedItems = mapArticles(allItems);

    return {
        items: mappedItems,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        structureId,
        filter,
        initialPagesLoaded: initialPages,
    };
}

export async function fetchDataBlogRemaining(structureId, filter, onChunk, totalCount) {
    const pageSize = 500;
    const baseUrl =
        `/api/conteudos/estruturas/${structureId}`
        + `?filter=${encodeURIComponent(filter)}&nestedFields=taxonomyCategoryBriefs&pageSize=${pageSize}&sort=contentFields/dataPublicacao:desc`;

    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages === 0) return;

    const requests = Array.from({ length: totalPages }, (_, i) =>
        api(`${baseUrl}&page=${i + 1}`, { headers: { "Content-Type": "application/json" } })
    );

    const responses = await Promise.all(requests);

    responses.forEach((res, index) => {
        const mappedItems = mapArticles(res.items || []);
        onChunk(index === 0 ? mappedItems.slice(25) : mappedItems);
    });
}

function mapArticles(items) {
    return items.map((item) => {
        const fields = item.contentFields || [];
        const getField = (name) => fields.find((f) => f.name === name);
        return {
            id: item.id,
            titulo: getField("titulo")?.contentFieldValue?.data || "",
            dataPublicacao: getField("dataPublicacao")?.contentFieldValue?.data || "",
            imagem: getField("imagem")?.contentFieldValue?.image?.contentUrl || "",
            categorias: (item.taxonomyCategoryBriefs || []).map((cat) => cat.taxonomyCategoryName),
            friendlyUrlPath: item.friendlyUrlPath,
        };
    });
}