import { useEffect } from "react";

export default function StructuredData({ faqs }) {
    useEffect(() => {
        const existing = document.getElementById("faq-ld-json");
        if (existing) existing.remove();

        if (!faqs || faqs.length === 0) return;

        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.pergunta,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.resposta,
                },
            })),
        };

        const script = document.createElement("script");
        script.id = "faq-ld-json";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const el = document.getElementById("faq-ld-json");
            if (el) el.remove();
        };
    }, [faqs]);

    return null;
}
