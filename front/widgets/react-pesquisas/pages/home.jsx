import React, { useEffect, useState } from "react";

import { fetchDataBlog } from "../services/dataService";

import Loader from "react-shared-bundle/Loader";
import CategoryTagsCarousel from "../components/category-tags-carousel";
import BarraPesquisa from "../components/barra-pesquisa";
import DynamicList from "../components/dynamic-list";

import { sortByDateDesc } from "../utils/util";

export default function Home({
    structureName,
    configurationCategoryGroupName,
}) {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItensView, setTotalItensView] = useState(1);
    const [totalItens, setTotalItens] = useState(1);
    const [term, setTerm] = useState("");
    const [tagNames, setTagNames] = useState([]);

    const initialItemsPerPage = 6;
    const fallbackItemsPerPage = 3;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            await fetchDataBlog(
                structureName,
                (data) => setAllData(sortByDateDesc(data)),
                (data) => setFilteredData(sortByDateDesc(data))
            );

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handler = (event) => {
            if (event.detail?.tags) {
                setTagNames(event.detail.tags.map(t => t.name));
            }
        };

        window.addEventListener("categories-loaded", handler);
        return () => window.removeEventListener("categories-loaded", handler);
    }, []);

    useEffect(() => {
        const handler = (event) => {
            const { term } = event.detail;

            if (!term || term.trim() === "") {
                setTerm("");
                setTotalItens(allData.length);
                setFilteredData(allData);
                setTotalItensView(Math.min(initialItemsPerPage, allData.length));
                return;
            }

            const normalizedTerm = term.toLowerCase();
            setTerm(term);

            const filtered = allData.filter((item) => {
                const title = item.title?.toLowerCase() || "";
                const dataPublicacao = item.dataPublicacao?.toLowerCase() || "";
                const category = item.category?.toLowerCase() || "";
                const description = item.description?.toLowerCase() || "";

                return (
                    String(item.id).includes(normalizedTerm) ||
                    title.includes(normalizedTerm) ||
                    dataPublicacao.includes(normalizedTerm) ||
                    category.includes(normalizedTerm) ||
                    description.includes(normalizedTerm)
                );
            });

            const sortedFiltered = sortByDateDesc(filtered);

            setTotalItens(sortedFiltered.length);
            setFilteredData(sortedFiltered);
            setTotalItensView(Math.min(initialItemsPerPage, sortedFiltered.length));
        };

        const handlerPagination = (event) => {
            const { page } = event.detail;
            if (page == null) return;

            const start = (page - 1) * initialItemsPerPage;
            const totalExibido = Math.min(initialItemsPerPage, filteredData.length - start);

            setTotalItensView(totalExibido);
        };

        window.addEventListener("blog-search", handler);
        window.addEventListener("pagination-changed", handlerPagination);

        return () => {
            window.removeEventListener("blog-search", handler);
            window.removeEventListener("pagination-changed", handlerPagination);
        };
    }, [allData, filteredData]);

    useEffect(() => {
        if (!allData || allData.length === 0) return;

        setTotalItens(allData.length);
        setTotalItensView(Math.min(initialItemsPerPage, allData.length));
    }, [allData]);

    const hasSearch = term.trim() !== "";
    const showFallback = hasSearch && filteredData.length === 0;
    const fallbackData = allData.slice(0, fallbackItemsPerPage);

    const isTagSearch = tagNames.includes(term);

    const emptyMsg = isTagSearch
        ? "Ainda não há pesquisas disponíveis."
        : "Não foram encontrados resultados para essa pesquisa.";

    const emptySubMsg = isTagSearch
        ? "Por favor, aguarde novas inscrições."
        : "Por favor, tente novamente com outras palavras.";

    return (
        <>
            <Loader open={loading} />

            <div className="custom-container">
                <div className="filters-results">
                    <div className="filters-containers">
                        <CategoryTagsCarousel
                            configuration={configurationCategoryGroupName}
                        />
                        <BarraPesquisa />
                    </div>

                    <div className="filters-row">
                        {hasSearch && (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.dispatchEvent(
                                        new CustomEvent("blog-search", {
                                            detail: { term: "", page: 1 }
                                        })
                                    );
                                    window.dispatchEvent(new CustomEvent("reset-category"));
                                }}
                                className="link-reset"
                            >
                                {"< Voltar para programas"}
                            </a>
                        )}
                        <div className="total-itens" tabIndex={0}>
                            Exibindo {totalItensView} de {totalItens} resultados
                        </div>
                    </div>

                    {term && (
                        <div className="itens-pesquisa" tabIndex={0}>
                            ({totalItens}) Resultados para: {term}
                        </div>
                    )}
                </div>

                <DynamicList
                    originalData={filteredData}
                    getItemKey={(article) => article.id}
                    emptyMsg={emptyMsg}
                    emptySubMsg={emptySubMsg}
                    initialItemsPerPage={initialItemsPerPage}
                    loading={loading}
                />

                {showFallback && (
                    <>
                        <div className="fallback-title" tabIndex={0}>
                            Últimas pesquisas
                        </div>

                        <DynamicList
                            originalData={fallbackData}
                            getItemKey={(article) => article.id}
                            initialItemsPerPage={fallbackItemsPerPage}
                        />
                    </>
                )}
            </div>
        </>
    );
}