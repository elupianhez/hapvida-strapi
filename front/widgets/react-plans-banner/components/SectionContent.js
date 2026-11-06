import React from "react";
import highlightParagraph from "../utils/highlightParagraph";

export function SectionContent({ section }) {
    const { type, value } = section;

    if (type === "html") {
        const htmlProcessado = highlightParagraph(
            value,
            "Planos a partir de",
            "plans-banner__highlight"
        );

        return <div tabIndex={0} dangerouslySetInnerHTML={{ __html: htmlProcessado }} />;
    }

    if (type === "list") {
        return (
            <ul>
                {value.map((item) => (
                    <li key={item.key}>{item.name}</li>
                ))}
            </ul>
        );
    }

    return <div tabIndex={0} dangerouslySetInnerHTML={{ __html: value }} />;
}