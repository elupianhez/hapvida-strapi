import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";

const getSiteName = () => {
    try {
        return siteAtual().chave ? siteAtual().chave.replaceAll('-', '') : null;
    }
    catch (error) {
        console.error('Erro ao identificar site:', error);
        return null;
    }
};

export async function fetchDataFilters(setFilters) {
    try {
        const companyId = siteAtual().empresa;
        const companyGroupId = siteAtual().codigoGlobal;
        const site = getSiteName();

        const response = await api("/api/unidades/filtros", {
            method: "POST",
            body: JSON.stringify({
                companyId,
                companyGroupId,
                site,
                nomeEstrutura: "Especialidades"
            }),
            headers: { "Content-Type": "application/json" }
        });

        const addTodos = (array, label) => [
            { id: "-1", label },
            ...(array || [])
        ];

        setFilters({
            especialidades: addTodos(response.especialidades, "Ver Todas"),
            tipos: addTodos(response.tipos, "Todos os tipos"),
            locais: addTodos(response.locais, "Todas as regiões")
        });
    } catch (err) {
        console.error("Erro ao buscar filtros", err);
        setFilters({ locais: [], tipos: [], especialidades: [] });
    }
}

export async function fetchAllUnits(nomeObject, categoriasStr) {
    try {
        const site = getSiteName();
        const objectPath = (nomeObject || "unidades").trim().toLowerCase();
        let baseUrl = `/api/objetos/${objectPath}?nestedFields=especialidades,taxonomyCategoryBriefs&pageSize=500`;
        
        if (site) {
            const filter = `sites/any(s:s eq '${site}')`;
            baseUrl = `${baseUrl}&filter=${encodeURIComponent(filter)}`;
        }

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

        if (categoriasStr && categoriasStr.trim()) {
            const categorias = categoriasStr
                .split(",")
                .map((c) => c.trim().toLowerCase())
                .filter(Boolean);

            items = items.filter((u) =>
                u.taxonomyCategoryBriefs?.some((c) =>
                    categorias.includes(c.taxonomyCategoryName.toLowerCase())
                )
            );
        }

        return items;
    } catch (err) {
        console.error("Erro ao buscar unidades", err);
        return [];
    }
}

export function getCurrentLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}
