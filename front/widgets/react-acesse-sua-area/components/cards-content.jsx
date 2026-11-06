import React, { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function Cards({ entries = [], loading }) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [entries]);

    const paginatedEntries = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return entries.slice(startIndex, endIndex);
    }, [entries, currentPage]);

    const handlePreviousPage = () => {
        setCurrentPage((previousPage) =>
            Math.max(previousPage - 1, 1)
        );
    };

    const handleNextPage = () => {
        setCurrentPage((previousPage) =>
            Math.min(previousPage + 1, totalPages)
        );
    };

    if (loading) {
        return (
            <div className="cards-wrapper">
                <div className="cards-content">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                        <div className="card-item card-skeleton" key={index}>
                            <div className="skeleton-block skeleton-icon" />
                            <div className="skeleton-block skeleton-title" />
                            <div className="skeleton-block skeleton-description" />
                            <div className="skeleton-block skeleton-description short" />
                            <div className="skeleton-block skeleton-link" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!entries.length) {
        return <div className="cards-status">Nenhum card encontrado.</div>;
    }

    return (
        <div className="cards-wrapper">
            <div className="cards-content">
                {paginatedEntries.map((item) => (
                    <div
                        className="card-item"
                        key={item.id}
                        data-id={item.id}
                        data-categoria={item.categoria || ""}
                        data-categorias={item.categorias?.join(",") || ""}
                    >
                        {item.icone?.url && (
                            <img
                                className="card-icon"
                                src={item.icone.url}
                                alt={item.icone.alt || item.icone.nome || ""}
                                tabIndex={0}
                            />
                        )}

                        <h3 className="card-title" tabIndex={0}>
                            {item.titulo}
                        </h3>

                        <div
                            className="card-description"
                            dangerouslySetInnerHTML={{
                                __html: item.textoHtml,
                            }}
                            tabIndex={0}
                        />
                        <a

                            className="card-link"
                            href={item.link}
                        >
                            Acessar
                        </a>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <nav
                    className="cards-pagination"
                    aria-label="Paginação dos cards"
                >
                    <button
                        type="button"
                        className="pagination-arrow pagination-arrow-previous"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >
                    </button>

                    <button
                        type="button"
                        className="pagination-arrow pagination-arrow-next"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        aria-label="Próxima página"
                    >
                    </button>
                </nav>
            )}
        </div>
    );
}