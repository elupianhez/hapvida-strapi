import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";

async function getPlanosByScope(nomePlano) {
    let endpoint = `/api/objetos/tipoplanos/escopo/${siteAtual().codigo}`;

    if (nomePlano) {
        const nomeEscapado = nomePlano.replace(/'/g, "''");
        const filter = `name eq '${nomeEscapado}'`;

        endpoint += `?filter=${encodeURIComponent(filter)}`;
    }

    const data = await api(endpoint);
    const items = data.items ?? [];

    return items.map((item) => ({
        id: item.id,
        name: item.name,
        bannerImageUrl: item.bannerImage?.link?.href || null,
        bannerImageAlt:
            item.bannerImageAlt ||
            item.bannerImage?.alternativeText ||
            "",
        textContent:
            item.textContent ||
            item.textContentRawText ||
            "",
        serviceNetwork: item.serviceNetwork || "",
        textoBotao: item.buttonText || "",
        linkBotao: item.buttonLink || "",
    }));
}

async function getPlanosAssociados(tipoPlanoId) {
    const endpoint = `/api/objetos/tipoplanos/item/${tipoPlanoId}/planType`;

    const data = await api(endpoint);
    const items = data.items ?? [];

    return items.map((item) => ({
        id: item.id,

        nome: item.name || "",

        sobrePlano:
            item.aboutPlan ||
            item.aboutPlanRawText ||
            "",

        carencias:
            item.gracePeriod ||
            item.gracePeriodRawText ||
            "",

        cobertura:
            item.coverage ||
            item.coverageRawText ||
            "",

        abrangencia:
            item.scope ||
            item.scopeRawText ||
            "",

        acomodacao:
            item.accommodation ||
            item.accommodationRawText ||
            "",

        teleconsulta:
            item.teleconsultation ||
            item.teleconsultationRawText ||
            "",

        acomodacoes: item.accommodations?.name || "",

        beneficios: item.benefits ?? [],
    }));
}

export {
    getPlanosByScope,
    getPlanosAssociados,
};