export function sortByOrdem(faqs) {
    return [...faqs].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
}

export function getTemas(faqs) {
    const seen = new Map();
    faqs.forEach((faq) => {
        if (!faq.tema || seen.has(faq.tema)) return;
        seen.set(faq.tema, faq.temaLabel || faq.tema);
    });

    return Array.from(seen.entries()).map(([tema, label]) => ({
        tema,
        label,
        total: faqs.filter((faq) => faq.tema === tema).length,
    }));
}

export function filterByTema(faqs, tema) {
    return sortByOrdem(faqs.filter((faq) => faq.tema === tema));
}

const DIACRITICS_START = String.fromCharCode(768);
const DIACRITICS_END = String.fromCharCode(879);
const DIACRITICS_REGEX = new RegExp("[" + DIACRITICS_START + "-" + DIACRITICS_END + "]", "g");

function removeAccents(text) {
    return text.normalize("NFD").replace(DIACRITICS_REGEX, "");
}

function normalizeForSearch(text) {
    return removeAccents(text.toLowerCase());
}

export function filterByTerm(faqs, term) {
    const normalizedTerm = normalizeForSearch(term.trim());
    if (!normalizedTerm) return [];

    return sortByOrdem(
        faqs.filter((faq) => {
            const pergunta = normalizeForSearch(faq.pergunta || "");
            const resposta = normalizeForSearch(faq.resposta || "");
            return pergunta.includes(normalizedTerm) || resposta.includes(normalizedTerm);
        })
    );
}
