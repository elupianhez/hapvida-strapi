import React, { useEffect, useState } from "react";
import NewsSearchFilterBar from "./NewsSearchFilterBar";
import api from "react-shared-bundle/endpoints";
import { fetchCategoriesByVocabularyERC } from "react-shared-bundle/structure";

export default function AppComponent({ configuration }) {
    const vocabularyERC = configuration?.portletInstance?.vocabularyERC;
    const eventName = configuration?.portletInstance?.eventName;
    const isGlobal = configuration?.portletInstance?.isGlobal;
    const carrosselIlimitado = String(configuration?.portletInstance?.carrosselIlimitado) === "true";

    const [categorias, setCategorias] = useState([]);
    const [categoriaFromUrl, setCategoriaFromUrl] = useState(null);

    useEffect(() => {
        fetchCategoriesByVocabularyERC(isGlobal, vocabularyERC)
            .then((items) => {
                setCategorias(carrosselIlimitado ? (items ?? []) : (items ?? []).slice(0, 5));
            })
            .catch(console.error);
    }, [isGlobal, vocabularyERC, carrosselIlimitado]);

    const options = [
        ...categorias.map(({ id, name }) => ({
            id,
            label: name,
        })),
    ];

    useEffect(() => {
        const categoria = sessionStorage.getItem("tema");
        if (categoria) {
            setCategoriaFromUrl(categoria);
            sessionStorage.removeItem("tema");
        }
    }, []);

    return (
        <NewsSearchFilterBar
            categories={options}
            categoryEventName={eventName}
            initialSelectedId={categoriaFromUrl}
        />
    );
}