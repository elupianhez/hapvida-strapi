import React, { useEffect, useState, useRef, useCallback } from "react";
import { useIsTabletOrMobile } from "../utils/util";
import { fetchDataBlogInitial, fetchDataBlogRemaining } from "../services/dataServiceHapvida";

import DynamicList from "react-shared-bundle/DynamicList";
import Card from "react-shared-bundle/Card";
import Loader from "react-shared-bundle/Loader";

export default function Home({ structureName, categoryName, vocabularyName }) {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRemaining, setLoadingRemaining] = useState(false);
    const [initialItemsPerPage, setInitialItemsPerPage] = useState(6);
    const [totalItensView, setTotalItensView] = useState(1);
    const [totalItens, setTotalItens] = useState(0);
    const [realTotalCount, setRealTotalCount] = useState(0);
    const [term, setTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const termRef = useRef(term);
    const isTabletOrMobile = useIsTabletOrMobile();
    const initialItemsLoaded = useRef(0);
    const isLoadingRemainingRef = useRef(false);
    const allDataRef = useRef([]);

    useEffect(() => {
        termRef.current = term;
    }, [term]);

    useEffect(() => {
        const newPerPage = isTabletOrMobile ? 4 : 6;
        setInitialItemsPerPage(newPerPage);
    }, [isTabletOrMobile]);

    useEffect(() => {
        const start = (currentPage - 1) * initialItemsPerPage;
        const totalExibido = Math.min(initialItemsPerPage, filteredData.length - start);
        setTotalItensView(totalExibido > 0 ? totalExibido : Math.min(initialItemsPerPage, filteredData.length));
    }, [currentPage, filteredData, initialItemsPerPage]);

    const applyFilters = useCallback((data, page = 1, resetPage = true) => {
        let filtered = [...data];

        if (termRef.current.trim() !== "") {
            const normalizedTerm = termRef.current.toLowerCase();
            filtered = filtered.filter((item) => {
                const titulo = item.titulo?.toLowerCase() || "";
                const dataPublicacao = item.dataPublicacao?.toLowerCase() || "";
                const imagem = item.imagem?.toLowerCase() || "";
                const categorias = Array.isArray(item.categorias)
                    ? item.categorias.join(" ").toLowerCase()
                    : "";

                return (
                    String(item.id).includes(normalizedTerm) ||
                    titulo.includes(normalizedTerm) ||
                    dataPublicacao.includes(normalizedTerm) ||
                    imagem.includes(normalizedTerm) ||
                    categorias.includes(normalizedTerm)
                );
            });
        }

        setFilteredData(filtered);
        setTotalItens(filtered.length);

        if (resetPage) {
            setCurrentPage(page);
        }
    }, []);

    // Só aplica filtros + reseta página quando o termo muda
    useEffect(() => {
        if (allDataRef.current.length > 0) {
            applyFilters(allDataRef.current, 1, true);
        }
    }, [term, applyFilters]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const { items: firstItems, totalCount, structureId, filter } =
                    await fetchDataBlogInitial(structureName, categoryName, vocabularyName);

                allDataRef.current = firstItems;
                setRealTotalCount(totalCount);
                setAllData(firstItems);
                setTotalItens(firstItems.length);
                setCurrentPage(1);
                applyFilters(firstItems, 1, true);
                setLoading(false);

                initialItemsLoaded.current = firstItems.length;

                if (totalCount > firstItems.length) {
                    setLoadingRemaining(true);
                    isLoadingRemainingRef.current = true;

                    await fetchDataBlogRemaining(structureId, filter, (chunk) => {
                        const merged = [...allDataRef.current, ...chunk];
                        allDataRef.current = merged;
                        setAllData(merged);
                    }, totalCount, firstItems.length);

                    applyFilters(allDataRef.current, currentPage, false);
                    isLoadingRemainingRef.current = false;
                    setLoadingRemaining(false);
                }
            } catch (err) {
                console.error("Erro ao buscar Blog da Saude", err);
                isLoadingRemainingRef.current = false;
                setLoading(false);
                setLoadingRemaining(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handler = (event) => {
            const { term: searchTerm } = event.detail;
            setTerm(searchTerm || "");
        };

        window.addEventListener("blog-search", handler);

        return () => {
            window.removeEventListener("blog-search", handler);
        };
    }, []);

    const hasSearch = term.trim() !== "";
    const hasResults = filteredData.length > 0;
    const showFallback = hasSearch && !hasResults && !loading;
    const fallbackItemsPerPage = isTabletOrMobile ? 2 : 3;
    const fallbackData = allDataRef.current.slice(0, fallbackItemsPerPage);

    const dynamicListTotalCount = hasSearch ? filteredData.length : realTotalCount;

    return (
        <>
            <Loader open={loading} />

            <div className="custom-container">
                <div className="filters-row">
                    {hasSearch && (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setTerm("");
                                termRef.current = "";
                                window.dispatchEvent(
                                    new CustomEvent("blog-search", {
                                        detail: { term: "", page: 1 }
                                    })
                                );
                            }}
                            className="link-reset"
                        >
                            {"< Voltar para dicas"}
                        </a>
                    )}
                    <div className="total-itens" tabIndex={0}>
                        Exibindo {totalItensView} de {hasSearch ? totalItens : realTotalCount} resultados
                    </div>
                </div>

                {hasSearch && (
                    <div className="itens-pesquisa" tabIndex={0}>
                        ({totalItens}) Resultados para: {term}
                    </div>
                )}

                <DynamicList
                    key={`${term}`}
                    originalData={filteredData}
                    totalCount={dynamicListTotalCount}
                    getItemKey={(article) => article.id}
                    renderItem={(article) => (
                        <Card
                            key={article.id}
                            img={article.imagem}
                            date={article.dataPublicacao}
                            tags={article.categorias}
                            title={article.titulo}
                            href={article.friendlyUrlPath}
                        />
                    )}
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
                            Últimas postagens do blog
                        </div>

                        <DynamicList
                            originalData={fallbackData}
                            getItemKey={(article) => article.id}
                            renderItem={(article) => (
                                <Card
                                    key={article.id}
                                    img={article.imagem}
                                    date={article.dataPublicacao}
                                    tags={article.categorias}
                                    title={article.titulo}
                                    href={article.friendlyUrlPath}
                                />
                            )}
                            initialItemsPerPage={fallbackItemsPerPage}
                            loadingRemaining={false}
                        />
                    </>
                )}
            </div>
        </>
    );
}
