const ESTADOS_BRASIL = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins"
};

export function getEstadoName(unidade) {
    const categories = unidade.taxonomyCategoryBriefs || [];

    const formattedCategory = categories.find((c) =>
        /^[A-Z]{2}\s*-\s*/.test(c.taxonomyCategoryName || "")
    )?.taxonomyCategoryName;

    if (formattedCategory) {
        return formattedCategory.replace(/\s*-\s*/, " - ");
    }

    const categoryByName = categories
        .map((c) => getEstadoFromText(c.taxonomyCategoryName))
        .find(Boolean);

    if (categoryByName) {
        return categoryByName;
    }

    return getEstadoFromText(unidade.enderecoUnidade);
}

export function getEstadoFromText(text = "") {
    const safeText = text || "";
    const normalizedText = normalizeText(safeText);
    const estadoByName = Object.entries(ESTADOS_BRASIL).find(([, name]) =>
        normalizedText.includes(normalizeText(name))
    );

    if (estadoByName) {
        const [uf, name] = estadoByName;
        return `${uf} - ${name}`;
    }

    const ufMatch = safeText.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i);
    const uf = ufMatch?.[1]?.toUpperCase();

    return uf && ESTADOS_BRASIL[uf] ? `${uf} - ${ESTADOS_BRASIL[uf]}` : null;
}

export function normalizeText(text = "") {
    return (text || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function getEstadoFullName(unidade) {
    const estadoStr = getEstadoName(unidade) || "";
    const ufMatch = estadoStr.match(/^([A-Z]{2})\s*-/);
    return ufMatch ? (ESTADOS_BRASIL[ufMatch[1]] || "") : "";
}

export function getEstadoIdFromUnit(unidade, locais) {
    const estadoName = getEstadoName(unidade);
    if (!estadoName) return null;
    return locais.find((l) => l.label === estadoName)?.id || null;
}

export function findNearestUnit(unidades, location) {
    return unidades.reduce((nearest, u) => {
        if (!u.latitudeUnidade || !u.longitudeUnidade) return nearest;
        const d = calcDistance(
            location.latitude,
            location.longitude,
            u.latitudeUnidade,
            u.longitudeUnidade
        );
        if (!nearest || d < nearest._distance) return { ...u, _distance: d };
        return nearest;
    }, null);
}

export function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
