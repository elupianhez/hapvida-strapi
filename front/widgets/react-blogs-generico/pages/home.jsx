import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchDataItems, fetchCategoryIdByERC, fetchRelatedBaseItems } from "../services/dataServiceHapvida";
import useAnyFilterActive from "react-shared-bundle/useAnyFilterActive";

import DynamicList from "react-shared-bundle/DynamicList";
import CardItem from "./CardItem";
import Header from "./Header";
import Loader from "react-shared-bundle/Loader";

export default function Home({serviceUrl, linkText, hideSearch, urlDetail, filtersConfigRaw, useAsResultPage, isGlobal, filterERC,
	useCurrentEntryCategories, relatedVocabularyERC, relatedItemsLimit, relatedTitle,
	categoryEventName = "category-noticia-filter", searchEventName = "busca-noticia-filter"}) {

    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialItemsPerPage, setInitialItemsPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);

    const [termoInput, setTermoInput] = useState("");
    const [termoBusca, setTermoBusca] = useState("");

    const isResultPage = useAsResultPage === true || useAsResultPage === "true";
    const isHighlight = !isResultPage;

    const isRelatedMode =
        useCurrentEntryCategories === true || useCurrentEntryCategories === "true";

    const relatedLimit = useMemo(() => {
        const parsed = parseInt(relatedItemsLimit, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
    }, [relatedItemsLimit]);

    const [categoryLabel, setCategoryLabel] = useState("");
    const [categoryId, setCategoryId] = useState(null);
    const [categoryResolved, setCategoryResolved] = useState(!filterERC);

    const [selectedFilters, setSelectedFilters] = useState({});
    const filtersConfig = useMemo(() => {
        try {
            return JSON.parse(filtersConfigRaw || "[]");
        } catch (err) {
            console.error("filters config inválida:", err);
            return [];
        }
    }, [filtersConfigRaw]);

    useEffect(() => {
        const listeners = filtersConfig.map((filter) => {
            const handler = (event) => {
                setSelectedFilters((prev) => ({
                    ...prev,
                    [filter.paramKey]: {
                        id: event.detail.id,
                        label: event.detail.label || "",
                    },
                }));
            };
            window.addEventListener(filter.eventName, handler);
            return { eventName: filter.eventName, handler };
        });

        return () => {
            listeners.forEach(({ eventName, handler }) =>
                window.removeEventListener(eventName, handler)
            );
        };
    }, [filtersConfig]);

    useEffect(() => {
        if (isRelatedMode || !filterERC) {
            setCategoryId(null);
            setCategoryLabel("");
            setCategoryResolved(true);
            return;
        }
        fetchCategoryIdByERC(isGlobal, filterERC)
            .then((info) => {
                setCategoryLabel(info?.name || "");
                setCategoryId(info?.id ?? null);
            })
            .catch((err) => console.error("Erro ao buscar categoria", err))
            .finally(() => setCategoryResolved(true));
    }, [filterERC, isGlobal, isRelatedMode]);

    useEffect(() => {
        if (!categoryResolved) return;

        setLoading(true);

        if (isRelatedMode) {
            fetchRelatedBaseItems(serviceUrl)
                .then((response) => setAllData(response || { items: [], totalCount: 0 }))
                .catch((err) => {
                    console.error("Erro ao buscar Items", err);
                    setAllData({ items: [], totalCount: 0 });
                })
                .finally(() => setLoading(false));
            return;
        }

        fetchDataItems(serviceUrl, setFilteredData, setAllData, categoryId)
            .then(() => setLoading(false))
            .catch((err) => {
                console.error("Erro ao buscar Items", err);
                setLoading(false);
            });
    }, [serviceUrl, categoryId, categoryResolved, isRelatedMode]);

    useEffect(() => {
        if (isRelatedMode) return;
        if (isHighlight && filterERC != "") return;
        setFilteredData(allData);
    }, [allData, isHighlight, isRelatedMode]);

    useEffect(() => {
        if (isRelatedMode) return;
        if (isHighlight && filterERC != "") return;

        const normalizarTexto = (texto = "") =>
            texto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        const termoNormalizado = normalizarTexto(termoBusca);

        const filteredItems = (allData?.items || []).filter((item) => {
            const briefs = item.taxonomyCategoryBriefs || [];

            const matchesAllFilters = filtersConfig.every((filter) => {
                const selected = selectedFilters[filter.paramKey];
                if (!selected?.id || selected.id === "-1") return true;

                return briefs.some(
                    (brief) =>
                        brief.parentTaxonomyVocabulary?.externalReferenceCode ===
                            filter.vocabularyERC &&
                        String(brief.taxonomyCategoryId) === String(selected.id)
                );
            });

            const matchesBusca =
                !termoNormalizado ||
                normalizarTexto(item.titulo).includes(termoNormalizado) ||
                normalizarTexto(item.subTitulo).includes(termoNormalizado);

            return matchesAllFilters && matchesBusca;
        });

        setFilteredData({
            ...allData,
            items: filteredItems,
            totalCount: filteredItems.length,
        });
        setCurrentPage(1);
    }, [selectedFilters, termoBusca, allData, filtersConfig, isHighlight, isRelatedMode]);

    const normalizePath = useCallback((path) => {
        try {
            return decodeURIComponent(path || "")
                .replace(/^\/+|\/+$/g, "")
                .toLowerCase();
        } catch (err) {
            return (path || "").replace(/^\/+|\/+$/g, "").toLowerCase();
        }
    }, []);

    const getRelatedCategoryIds = useCallback(
        (item) => {
            const briefs = item?.taxonomyCategoryBriefs || [];
            return briefs
                .filter(
                    (brief) =>
                        !relatedVocabularyERC ||
                        brief.parentTaxonomyVocabulary?.externalReferenceCode ===
                            relatedVocabularyERC
                )
                .map((brief) => String(brief.taxonomyCategoryId))
                .filter(Boolean);
        },
        [relatedVocabularyERC]
    );

    useEffect(() => {
        if (!isRelatedMode) return;

        const items = allData?.items || [];

        if (!items.length) {
            setFilteredData({ items: [], totalCount: 0 });
            return;
        }

        const currentSlug = normalizePath(
            window.location.pathname.split("/").filter(Boolean).pop()
        );

        const currentItem = items.find(
            (item) => normalizePath(item.friendlyUrlPath) === currentSlug
        );

        if (!currentItem) {
            console.warn(
                "Blog Generico: não foi possível identificar o item exibido na página para:",
                currentSlug
            );
        }

        const currentCategoryIds = new Set(getRelatedCategoryIds(currentItem));

        const relatedItems = currentCategoryIds.size
            ? items
                  .filter(
                      (item) =>
                          String(item.id) !== String(currentItem.id) &&
                          getRelatedCategoryIds(item).some((id) =>
                              currentCategoryIds.has(id)
                          )
                  )
                  .sort(
                      (a, b) =>
                          new Date(b.data || 0).getTime() -
                          new Date(a.data || 0).getTime()
                  )
                  .slice(0, relatedLimit)
            : [];

        setFilteredData({
            ...allData,
            items: relatedItems,
            totalCount: relatedItems.length,
        });
        setCurrentPage(1);
    }, [
        allData,
        isRelatedMode,
        relatedLimit,
        getRelatedCategoryIds,
        normalizePath,
    ]);

    useEffect(() => {
        const handleExternalSearch = (event) => {
            const term = event.detail?.term || "";
            setTermoInput(term);
            setTermoBusca(term);
        };

        window.addEventListener(searchEventName, handleExternalSearch);
        return () => window.removeEventListener(searchEventName, handleExternalSearch);
    }, [searchEventName]);

	const clearAllFilters = useCallback(
	    (event) => {
	        event.preventDefault();
	        window.dispatchEvent(
	            new CustomEvent(categoryEventName, { detail: { id: null, label: "" } })
	        );
	        window.dispatchEvent(
	            new CustomEvent(searchEventName, { detail: { term: "" } })
	        );
	    },
	    [categoryEventName, searchEventName]
	);

    const handleSearch = () => {
        if (termoInput.trim().length > 0 && termoInput.trim().length < 10) {
            return;
        }
        setTermoBusca(termoInput.trim());
    };

    const totalCount = filteredData?.totalCount ?? 0;
    const itemsPerPage = isRelatedMode ? relatedLimit : initialItemsPerPage;
    const itemsShown = Math.min(
        itemsPerPage,
        Math.max(totalCount - (currentPage - 1) * itemsPerPage, 0)
    );

    function formatDate(isoString) {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";

        return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
    }

    function getCategoryNames(item) {
        const briefs = item.taxonomyCategoryBriefs || [];
        const vocabularyERCs = filtersConfig.map((f) => f.vocabularyERC);

        if (isRelatedMode && relatedVocabularyERC) {
            vocabularyERCs.push(relatedVocabularyERC);
        }

        return briefs
            .filter((brief) =>
                vocabularyERCs.includes(brief.parentTaxonomyVocabulary?.externalReferenceCode)
            )
            .map((brief) => brief.taxonomyCategoryName)
            .filter(Boolean);
    }

    function getPageTitle() {
        if (isRelatedMode) {
            return relatedTitle || "Conteúdos relacionados";
        }

        if (termoBusca) {
            return `(${totalCount}) Resultados para: ${termoBusca}`;
        }

        const filtrosAtivos = filtersConfig
            .map((filter) => {
                const selected = selectedFilters[filter.paramKey];
                if (!selected?.id || selected.id === "-1") return null;
                return selected.label;
            })
            .filter(Boolean);

        if (filtrosAtivos.length > 0) {
            return `(${totalCount}) Resultados para: ${filtrosAtivos.join(" > ")}`;
        }

        return `(${totalCount}) Resultados para: Geral`;
    }

    const dispatchCategory = useCallback(
        (event) => {
            event.preventDefault();
            window.dispatchEvent(
                new CustomEvent(categoryEventName, {
                    detail: categoryId
                        ? { id: categoryId, label: categoryLabel }
                        : { id: null, label: "" },
                })
            );
        },
        [categoryId, categoryLabel, categoryEventName]
    );

    const hasActiveFilter = useAnyFilterActive(categoryEventName, searchEventName);
    const shouldRender = isRelatedMode
        ? true
        : isResultPage
        ? hasActiveFilter
        : !hasActiveFilter;

    if (!shouldRender) {
        return null;
    }

	function toPreviewUrl(href) {
		if (!href) return href;
	    const url = new URL(href, window.location.origin);
	    url.searchParams.delete("download");
	    return url.toString();
	}

    return (
        <>
            <Loader open={loading} />

            <div className="notredame-news-grid">
                <Header
                    title={getPageTitle()}
                    itemsShown={itemsShown}
                    totalCount={totalCount}
                    searchValue={termoInput}
                    onSearchChange={setTermoInput}
                    onSearch={handleSearch}
                    searchPlaceholder="O que você está procurando?"
                    hideSearch={isRelatedMode ? true : hideSearch}
                    hideResultsCount={isRelatedMode}
                    categoryLabel={categoryLabel}
                    clearAllFilters={clearAllFilters}
                    isResultPage={isResultPage}
                />

                <DynamicList
                    key="list"
                    originalData={filteredData?.items}
                    totalCount={filteredData?.totalCount}
                    getItemKey={(article) => article.id}
                    renderItem={(article) => (
                        <CardItem
                            key={article.id}
                            date={formatDate(article.data)}
                            description={article.subTitulo}
                            title={article.titulo}
                            link={ article?.arquivo?.link ? toPreviewUrl(article.arquivo.link.href) : `/${urlDetail}/${article.friendlyUrlPath }`}
                            isExternal={Boolean(article?.arquivo?.link)}
                            linkText={linkText}
                            categories={getCategoryNames(article)}
                        />
                    )}
                    emptyMsg={
                        isRelatedMode
                            ? "Não foram encontrados conteúdos relacionados."
                            : "Não foram encontrados resultados para essa pesquisa."
                    }
                    emptySubMsg={
                        isRelatedMode
                            ? "Não há outros conteúdos publicados nas mesmas categorias deste item."
                            : "Por favor, altere as categorias selecionadas nos filtros."
                    }
                    initialItemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}
                />
                {categoryLabel && (
                    <a href="#" className="section-button section-button-secondary my-4" tabIndex={0} onClick={dispatchCategory}>
                        Ver todas notícias em {categoryLabel}
                    </a>
                )}
            </div>
        </>
    );
}