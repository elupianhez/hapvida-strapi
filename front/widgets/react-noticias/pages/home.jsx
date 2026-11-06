import React, { useEffect, useRef, useState, useCallback } from "react";

import { fetchDataBlogInitial, fetchDataBlogRemaining } from "../services/dataServiceHapvida";

import Loader from "react-shared-bundle/Loader";
import CategoryTagsCarousel from "../components/category-tags-carousel";
import BarraPesquisa from "../components/barra-pesquisa";
import DynamicList from "../components/dynamic-list";

import { useIsTabletOrMobile } from "../utils/util";

export default function Home({
    structureName,
    categoryName,
    vocabularyName,
    configurationCategoryGroupName,
}) {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRemaining, setLoadingRemaining] = useState(false);
    const [totalItensView, setTotalItensView] = useState(1);
    const [totalItens, setTotalItens] = useState(0);
    const [realTotalCount, setRealTotalCount] = useState(0);
    const [initialItemsPerPage, setInitialItemsPerPage] = useState(4);
    const [currentPage, setCurrentPage] = useState(1);
    const [term, setTerm] = useState("");

    const termRef = useRef(term);
    const isTabletOrMobile = useIsTabletOrMobile();
    const allDataRef = useRef([]);

    useEffect(() => {
        termRef.current = term;
    }, [term]);

    useEffect(() => {
        const itemsPerPage = isTabletOrMobile ? 5 : 4;
        setInitialItemsPerPage(itemsPerPage);
    }, [isTabletOrMobile]);

    const applyFilters = useCallback((data, page = 1, resetPage = true) => {
        let filtered = [...data];

        if (termRef.current.trim() !== "") {
            const normalizedTerm = termRef.current.toLowerCase();
            filtered = filtered.filter((item) => {
                const titulo = item.titulo?.toLowerCase() || "";
                const categorias = Array.isArray(item.categorias)
                    ? item.categorias.join(" ").toLowerCase()
                    : "";
                return titulo.includes(normalizedTerm) || categorias.includes(normalizedTerm);
            });
        }

        const start = (page - 1) * initialItemsPerPage;
        const totalExibido = Math.min(initialItemsPerPage, filtered.length - start);

        setFilteredData(filtered);
        setTotalItens(filtered.length);
        setTotalItensView(totalExibido);

        if (resetPage) {
            setCurrentPage(1);
        }
    }, [initialItemsPerPage]);

    useEffect(() => {
        if (allDataRef.current.length > 0) {
            applyFilters(allDataRef.current, 1, true);
        }
    }, [term, applyFilters]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const { items: firstItems, totalCount, totalPages, structureId, filter, initialPagesLoaded } =
                    await fetchDataBlogInitial(structureName, categoryName, vocabularyName);

                allDataRef.current = firstItems;
                setRealTotalCount(totalCount);
                setAllData(firstItems);
                applyFilters(firstItems, 1, true);
                setLoading(false);

                if (totalPages > initialPagesLoaded) {
                    setLoadingRemaining(true);

                    await fetchDataBlogRemaining(structureId, filter, (chunk) => {
                        const merged = [...allDataRef.current, ...chunk];
                        allDataRef.current = merged;
                        setAllData(merged);
                    }, totalCount);

                    applyFilters(allDataRef.current, currentPage, false);
                    setLoadingRemaining(false);
                }
            } catch (err) {
                console.error("Erro ao buscar Notícias", err);
                setLoading(false);
                setLoadingRemaining(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleSearch = (event) => {
            const { term: searchTerm } = event.detail;
            setTerm(searchTerm || "");
        };

        const handlePagination = (event) => {
            const { page } = event.detail;
            if (page == null) return;
            setCurrentPage(page);
            applyFilters(allDataRef.current, page, false);
        };

        window.addEventListener("blog-search", handleSearch);
        window.addEventListener("pagination-changed", handlePagination);

        return () => {
            window.removeEventListener("blog-search", handleSearch);
            window.removeEventListener("pagination-changed", handlePagination);
        };
    }, [applyFilters]);

    const hasSearch = term.trim() !== "";
    const showFallback = hasSearch && filteredData.length === 0 && !loading;

    const fallbackItemsPerPage = isTabletOrMobile ? 2 : 3;
    const fallbackData = allDataRef.current.slice(0, fallbackItemsPerPage);

    const dynamicListTotalCount = hasSearch ? filteredData.length : realTotalCount;

    return (
        <>
            <Loader open={loading} />

            <div className="custom-container">
                <div className="filters-results">
                    <div className="filters-containers">
                        <CategoryTagsCarousel configuration={configurationCategoryGroupName} />
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
                                }}
                                className="link-reset"
                            >
                                {"< Voltar para notícias"}
                            </a>
                        )}
                        <div className="total-itens" tabIndex={0}>
                            Exibindo {totalItensView} de {hasSearch ? totalItens : realTotalCount} resultados
                        </div>
                    </div>

                    {term && (
                        <div className="itens-pesquisa" tabIndex={0}>
                            ({totalItens}) Resultados para: {term}
                        </div>
                    )}
                </div>

                <DynamicList
                    key={`${term}`}
                    originalData={filteredData}
                    totalCount={dynamicListTotalCount}
                    getItemKey={(article) => article.id}
                    emptyMsg="Não foram encontrados resultados para essa pesquisa."
                    emptySubMsg="Por favor, tente novamente com outras palavras."
                    initialItemsPerPage={initialItemsPerPage}
                    loadingRemaining={loadingRemaining}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        applyFilters(allDataRef.current, page, false);
                    }}
                />

                {showFallback && (
                    <>
                        <div className="fallback-title" tabIndex={0}>
                            Últimas notícias
                        </div>

                        <DynamicList
                            originalData={fallbackData}
                            getItemKey={(article) => article.id}
                            initialItemsPerPage={fallbackItemsPerPage}
                            noFeatured={true}
                        />
                    </>
                )}
            </div>
        </>
    );
}