import React, { useEffect, useState } from "react";
import CustomSelect from "./CustomSelect";
import api from "react-shared-bundle/endpoints";
import { fetchCategoriesByVocabularyERC } from "react-shared-bundle/structure";

export default function AppComponent({configuration}) {

    const vocabularyERC = (configuration?.portletInstance?.vocabularyERC);
    const labelTodos = (configuration?.portletInstance?.labelTodos || "Todas as categorias");
    const placeholderSelecionar = (configuration?.portletInstance?.placeholderSelecionar || "Selecione uma categoria");
    const eventName = (configuration?.portletInstance?.eventName || "category-filter");
    const isGlobal = (configuration?.portletInstance?.isGlobal);

    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("-1");

    useEffect(() => {
        fetchCategoriesByVocabularyERC(isGlobal, vocabularyERC)
           .then((items) => {
              setCategorias(items ?? []);
           })
           .catch(console.error);
    }, [isGlobal, vocabularyERC]);

    const handleCategoryChange = (value) => {
        setCategoriaSelecionada(value);

        const selectedOption = options.find(
            (opt) => String(opt.value) === String(value)
        );

        window.dispatchEvent(
            new CustomEvent(eventName, {
                detail: { id: value, label: selectedOption?.label || "" }
            })
        );
    };

    const options = [
        { value: "-1", label: labelTodos },
        ...categorias.map(({ id, name }) => ({
            value: id,
            label: name,
        })),
    ];

    useEffect(() => {
        const categoriaFromUrl = sessionStorage.getItem("tema");
        if (categoriaFromUrl && categorias?.length > 0) {
            const existe = categorias.some(
                (cat) => String(cat.id) === String(categoriaFromUrl)
            );
            if (existe) {
                sessionStorage.removeItem("tema");
                handleCategoryChange(categoriaFromUrl);
            }
        }
    }, [categorias]);

    return (
        <CustomSelect
            value={categoriaSelecionada}
            onChange={handleCategoryChange}
            options={options}
            placeholder={placeholderSelecionar}
      />
    );
}