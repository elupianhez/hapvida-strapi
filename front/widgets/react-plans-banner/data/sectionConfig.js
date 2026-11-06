export const SECTION_CONFIG = [
    { key: "sobrePlano", label: "Sobre o Plano", type: "html" },
    { key: "carencias", label: "Carências", type: "html" },
    { key: "cobertura", label: "Cobertura", type: "html" },
    { key: "abrangencia", label: "Abrangência", type: "text" },
    { key: "acomodacao", label: "Acomodação", type: "text" },
    { key: "teleconsulta", label: "Teleconsulta", type: "text" },
];

export const COMPARE_TAB = {
    key: "comparePlanos",
    label: "Compare os Planos",
    type: "compare",
};

export function isFilled(value) {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Boolean(value.name || value.key);
    return String(value).trim().length > 0;
}