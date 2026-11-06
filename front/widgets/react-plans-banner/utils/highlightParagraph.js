export default function highlightParagraph(html, textoAlvo, className) {
    if (!html) return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const paragraphs = doc.querySelectorAll("p");
    paragraphs.forEach((p) => {
        if (p.textContent.includes(textoAlvo)) {
            p.classList.add(className);
        }
    });

    return doc.body.innerHTML;
}