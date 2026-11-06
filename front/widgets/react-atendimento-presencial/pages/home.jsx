import React from "react";

import { useEffect, useRef, useState } from "react";

import DynamicList from "react-shared-bundle/DynamicList";

import { fetchDataFilters, fetchAllUnits, getCurrentLocation } from "../services/dataService";
import UnidadeCard from "../components/UnidadeCard";
import UnidadeCardSkeleton from "../components/UnidadeCardSkeleton";
import {
    getEstadoName,
    getEstadoFullName,
    calcDistance,
    normalizeText
} from "../utils/unitUtils";

export default function Home({ regionMode, defaultRegion, nomeObject, categorias }) {
    const [loading, setLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [allUnidades, setAllUnidades] = useState([]);
    const [filteredUnidades, setFilteredUnidades] = useState([]);
    const [filters, setFilters] = useState({ locais: [] });
    const [regiaoSelecionada, setRegiaoSelecionada] = useState("-1");
    const [searchTerm, setSearchTerm] = useState("");
    const [userLocation, setUserLocation] = useState(null);

    const initialItemsPerPage = 6;
    const unidadesListRef = useRef(null);

    const triggerSkeleton = () => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 400);
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchDataFilters(setFilters);
            const unidades = await fetchAllUnits(nomeObject, categorias);
            setAllUnidades(unidades);
            setLoading(false);
        };
        fetchData();
    }, [nomeObject, categorias]);

    useEffect(() => {
        const getLocation = async () => {
            const location = await getCurrentLocation();
            if (location) {
                setUserLocation(location);
            }
        };
        getLocation();
    }, []);

    useEffect(() => {
        if (!allUnidades.length || !filters.locais.length) return;

        const applyInitialRegion = async () => {
            if (regionMode === "all") {
                setRegiaoSelecionada("-1");
                return;
            }

            if (regionMode === "geolocation") {
                const location = await getCurrentLocation();
                if (location) {
                    setUserLocation(location);
                    setRegiaoSelecionada("-1");
                    return;
                }
            }

            const regiaoId = filters.locais.find(
                (o) => o.label === defaultRegion
            )?.id;
            setRegiaoSelecionada(regiaoId ?? "-1");
        };

        applyInitialRegion();
    }, [allUnidades.length, filters.locais.length]);

    useEffect(() => {
        let result = [...allUnidades];

        if (regiaoSelecionada && regiaoSelecionada !== "-1") {
            const regiaoLabel = filters.locais.find(
                (l) => String(l.id) === String(regiaoSelecionada)
            )?.label;

            result = result.filter((u) =>
                u.taxonomyCategoryBriefs?.some(
                    (c) =>
                        String(c.taxonomyCategoryId) === String(regiaoSelecionada) ||
                        (regiaoLabel && c.taxonomyCategoryName === regiaoLabel)
                )
            );
        }

        if (searchTerm.trim()) {
            const normalized = normalizeText(searchTerm);
            
            result = result.filter((u) => {
                const nome = normalizeText(u.nomeUnidade);
                const endereco = normalizeText(u.enderecoUnidade);
                const estadoCategories = normalizeText((u.taxonomyCategoryBriefs || [])
                    .map((c) => c.taxonomyCategoryName)
                    .join(" "));
                const estadoCompleto = normalizeText(getEstadoName(u));
                const estadoNomeCompleto = normalizeText(getEstadoFullName(u));

                return (
                    nome.includes(normalized) ||
                    endereco.includes(normalized) ||
                    estadoCategories.includes(normalized) ||
                    estadoCompleto.includes(normalized) ||
                    estadoNomeCompleto.includes(normalized)
                );
            });
        }

        if (userLocation && regionMode === "geolocation") {
            result = result
                .map(u => {
                    if (!u.latitudeUnidade || !u.longitudeUnidade) return { ...u, _distance: Infinity };
                    return {
                        ...u,
                        _distance: calcDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            u.latitudeUnidade,
                            u.longitudeUnidade
                        )
                    };
                })
                .sort((a, b) => (a._distance || 0) - (b._distance || 0));
        } else {
            result.sort((a, b) => {
                const estadoA = getEstadoName(a) || "";
                const estadoB = getEstadoName(b) || "";
                return (
                    estadoA.localeCompare(estadoB) ||
                    (a.nomeUnidade || "").localeCompare(b.nomeUnidade || "")
                );
            });
        }

        setFilteredUnidades(result);
    }, [allUnidades, regiaoSelecionada, searchTerm, filters.locais, userLocation, regionMode]);

    useEffect(() => {
        const handler = (event) => {
            setSearchTerm(event.detail?.term || "");
            setCurrentPage(1);
            triggerSkeleton();
        };
        window.addEventListener("blog-search", handler);
        return () => window.removeEventListener("blog-search", handler);
    }, []);

    useEffect(() => {
        const handler = (event) => {
            setRegiaoSelecionada(event.detail?.regiaoId || "-1");
            setCurrentPage(1);
            triggerSkeleton();
        };
        window.addEventListener("regiao-filter-change", handler);
        return () => window.removeEventListener("regiao-filter-change", handler);
    }, []);

    useEffect(() => {
        const handler = () => {
            triggerSkeleton();
            if (unidadesListRef.current) {
                //desconto no posicionamento devido a header fixo do site. 
                const top = unidadesListRef.current.getBoundingClientRect().top + window.scrollY - 160;
                window.scrollTo({ top, behavior: "smooth" });
            }
        };
        window.addEventListener("pagination-changed", handler);
        return () => window.removeEventListener("pagination-changed", handler);
    }, []);

    const handleVoltarLocalizacao = () => {
        setRegiaoSelecionada("-1");
        setSearchTerm("");
        window.dispatchEvent(new CustomEvent("regiao-filter-reset"));
        window.dispatchEvent(new CustomEvent("blog-search", { detail: { term: "", page: 1 } }));
    };

    const showSkeleton = loading || isTransitioning;
    const hasSearch = searchTerm.trim() !== "";
    const hasResults = filteredUnidades.length > 0;
    // No build antigo (const → var) isRegiaoSelecionada ainda era undefined aqui; mantém o mesmo comportamento
    const showFallback = !hasResults && (hasSearch || false);
    
    let fallbackData = [...allUnidades];
    
    if (userLocation) {
        fallbackData = fallbackData
            .map(u => {
                if (!u.latitudeUnidade || !u.longitudeUnidade) return { ...u, _distance: Infinity };
                return {
                    ...u,
                    _distance: calcDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        u.latitudeUnidade,
                        u.longitudeUnidade
                    )
                };
            })
            .sort((a, b) => (a._distance || 0) - (b._distance || 0))
            .slice(0, 3);
    } else {
        fallbackData = fallbackData
            .sort((a, b) => (getEstadoName(a) || "").localeCompare(getEstadoName(b) || ""))
            .slice(0, 3);
    }

    const totalItens = filteredUnidades.length;
    const totalItensView = Math.min(initialItemsPerPage, totalItens);
    const regiaoLabel = filters.locais.find(
        (l) => String(l.id) === String(regiaoSelecionada)
    )?.label;
    const isRegiaoSelecionada = regiaoSelecionada !== "-1";
    const emptyMsg = hasSearch ? "Não foram encontrados resultados para essa pesquisa." : "Não foram encontradas unidades para essa região.";
    const emptySubMsg = hasSearch ? "Por favor, tente novamente com outras palavras." : "Conheça outras unidades abaixo.";

    return (
        <>
            <div className="canais-presencial custom-container">
                {!showSkeleton ? (
                    isRegiaoSelecionada || searchTerm ? (
                        <div className="voltar-exibindo-row">
                            <a
                                className="voltar-localizacao"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleVoltarLocalizacao();
                                }}
                            >
                                &lt; Voltar para localizações
                            </a>
                            <span className="total-itens" tabIndex={0}>
                                Exibindo {totalItensView}-{totalItens} resultados
                            </span>
                        </div>
                    ) : (
                        <div className="voltar-exibindo-row">
                            <span className="total-itens" tabIndex={0}>
                                Exibindo {totalItensView}-{totalItens} resultados
                            </span>
                        </div>
                    )
                ) : null}

                {!showSkeleton && (isRegiaoSelecionada || searchTerm) && (
                    <h2 className="results-title" tabIndex={0}>
                        ({filteredUnidades.length}) Resultados para: {searchTerm || regiaoLabel}
                    </h2>
                )}

                <div className="unidades-list" ref={unidadesListRef}>
                    <DynamicList
                        originalData={loading
                            ? Array.from({ length: initialItemsPerPage }, (_, i) => ({ id: `skeleton-${i}` }))
                            : filteredUnidades
                        }
                        getItemKey={(u) => u.id}
                        renderItem={(unidade) => (
                            showSkeleton
                                ? <UnidadeCardSkeleton />
                                : <UnidadeCard unidade={unidade} />
                        )}
                        emptyMsg={emptyMsg}
                        emptySubMsg={emptySubMsg}
                        initialItemsPerPage={initialItemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {showFallback && (
                    <>
                        <div className="fallback-title" tabIndex={0}>
                            Conheça outras unidades
                        </div>
                        <DynamicList
                            originalData={fallbackData}
                            getItemKey={(u) => u.id}
                            renderItem={(unidade) => (
                                <UnidadeCard unidade={unidade} />
                            )}
                            initialItemsPerPage={3}
                        />
                    </>
                )}
            </div>
        </>
    );
}
