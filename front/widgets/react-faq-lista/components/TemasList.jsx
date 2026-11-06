import React from "react";

function ChevronRightIcon() {
    return (
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function TemasList({ temas, onSelectTema }) {
    return (
        <ul className="faq-temas__list">
            {temas.map((item) => (
                <li key={item.tema} className="faq-temas__item">
                    <button
                        type="button"
                        className="faq-temas__link"
                        onClick={() => onSelectTema(item.tema)}
                    >
                        <h3 className="faq-temas__title">{item.label}</h3>
                        <ChevronRightIcon />
                    </button>
                </li>
            ))}
        </ul>
    );
}
