import React, { useEffect, useMemo, useState } from "react";

import Loader from "react-shared-bundle/Loader";
import Accordion from "react-shared-bundle/Accordion";

import TemasList from "../components/TemasList";
import StructuredData from "../components/StructuredData";

import { fetchAllFaqs } from "../services/dataService";
import { getTemas, filterByTema, filterByTerm } from "../utils/util";

export default function Home({ objectName, linkVoltarText, assuntosTitulo, assuntosDescricao, emptyStateTitulo, emptyStateDescricao }) {
    const [allFaqs, setAllFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTema, setSelectedTema] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const faqs = await fetchAllFaqs(objectName);
            setAllFaqs(faqs);
            setLoading(false);
        })();
    }, [objectName]);

    useEffect(() => {
        const handler = (event) => {
            const term = event.detail?.term ?? "";
            setSearchTerm(term);
            setSelectedTema(null);
        };

        window.addEventListener("blog-search", handler);
        return () => window.removeEventListener("blog-search", handler);
    }, []);

    const temas = useMemo(() => getTemas(allFaqs), [allFaqs]);

    const isSearching = searchTerm.trim() !== "";
    const showTemasList = !isSearching && !selectedTema;
    const showResultados = isSearching || !!selectedTema;

    const visibleFaqs = isSearching
        ? filterByTerm(allFaqs, searchTerm)
        : selectedTema
            ? filterByTema(allFaqs, selectedTema)
            : [];

    const temaSelecionadoLabel = selectedTema
        ? temas.find((t) => t.tema === selectedTema)?.label || selectedTema
        : "";

    const resultadoTitulo = isSearching ? searchTerm : temaSelecionadoLabel;

    const handleSelectTema = (tema) => {
        setSelectedTema(tema);
    };

    const handleVoltar = () => {
        setSelectedTema(null);
        setSearchTerm("");
    };

    return (
        <div className="faq-lista">
            <Loader open={loading} />

            {showResultados && <StructuredData faqs={visibleFaqs} />}

            {!loading && showResultados && (
                <div className="faq-lista__voltar-container">
                    <button type="button" className="faq-resultados__voltar" onClick={handleVoltar}>
                        {linkVoltarText}
                    </button>
                </div>
            )}

            {!loading && (
                <div className="faq-lista__grid">
                    <div className="faq-lista__col-info">
                        {showTemasList ? (
                            <>
                                {assuntosTitulo && <h2 className="faq-lista__titulo" tabIndex={0}>{assuntosTitulo}</h2>}
                                {assuntosDescricao && <p className="faq-lista__descricao" tabIndex={0}>{assuntosDescricao}</p>}
                            </>
                        ) : (
                            <>
                                <h2 className="faq-lista__titulo" tabIndex={0}>
                                    ({visibleFaqs.length}) Resultados para: {resultadoTitulo}
                                </h2>
                                {assuntosDescricao && <p className="faq-lista__descricao" tabIndex={0}>{assuntosDescricao}</p>}
                            </>
                        )}
                    </div>

                    <div className="faq-lista__col-content">
                        {showTemasList && (
                            <TemasList temas={temas} onSelectTema={handleSelectTema} />
                        )}

                        {showResultados && (
                            visibleFaqs.length === 0 ? (
                                <div className="faq-resultados__empty">
                                    <h3 className="faq-resultados__empty-titulo" tabIndex={0}>{emptyStateTitulo}</h3>
                                    {emptyStateDescricao && (
                                        <p className="faq-resultados__empty-descricao" tabIndex={0}>{emptyStateDescricao}</p>
                                    )}
                                </div>
                            ) : (
                                <Accordion
                                    items={visibleFaqs}
                                    getItemKey={(faq) => faq.id}
                                    renderTitle={(faq) => faq.pergunta}
                                    renderContent={(faq) => <h4 dangerouslySetInnerHTML={{ __html: faq.resposta }} />}
                                />
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
