export const normalize = (value) => (value || '').trim().toLowerCase();

export const parsePairs = (raw) =>
    new Map(
        raw
            .split('|')
            .map((entry) => {
                const index = entry.indexOf('=');
                if (index === -1) return null;
                return [normalize(entry.slice(0, index)), entry.slice(index + 1).trim()];
            })
            .filter((pair) => pair && pair[0] && pair[1])
);

export function buildFaqPageSchema(category, items = []) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        name: category,
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.title,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.detail,
            },
        })),
    };
}

export function serializeJsonLd(data) {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}