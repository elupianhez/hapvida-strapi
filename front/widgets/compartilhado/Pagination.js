import React, { useState, useEffect } from "react";

const useWindowSize = () => {
    const [width, setWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
};

const Pagination = ({ currentPage, totalPages, onPageChange, loadingRemaining = false }) => {
    const windowWidth = useWindowSize();
    const isMobile = windowWidth <= 743;

    const generatePageNumbers = () => {
        const pages = [];

        if (isMobile) {
            if (totalPages <= 4) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
                return pages;
            }
            if (currentPage <= 2) {
                pages.push(1, 2, "...", totalPages);
                return pages;
            }
            if (currentPage >= totalPages - 1) {
                pages.push(1, "...", totalPages - 1, totalPages);
                return pages;
            }
            pages.push(1, currentPage, "...", totalPages);
            return pages;
        }

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, "...", totalPages);
            return pages;
        }

        if (currentPage >= totalPages - 3) {
            pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            return pages;
        }

        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        return pages;
    };

    const handlePageChange = (page) => {
        if (page === "..." || page < 1 || page > totalPages || page === currentPage) return;
        if (loadingRemaining && page === totalPages) return;
        onPageChange(page);
        window.dispatchEvent(
            new CustomEvent("pagination-changed", { detail: { page } })
        );
    };

    const pageNumbers = generatePageNumbers();

    return (
        <nav className="custom-pagination" aria-label="Paginação">
            <button
                type="button"
                className={`pagination-nav pagination-nav-prev ${currentPage === 1 ? "is-disabled" : ""}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : 0}
            >
                <span className="pagination-nav-arrow">&lt;</span>
                {!isMobile && <span>Anterior</span>}
            </button>

            <div className="pagination-pages">
                {pageNumbers.map((page, index) =>
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="pagination-page">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            className={`pagination-page ${currentPage === page ? "is-active" : ""} ${loadingRemaining && page === totalPages ? "is-disabled" : ""}`}
                            onClick={() => handlePageChange(page)}
                            disabled={loadingRemaining && page === totalPages}
                            tabIndex={loadingRemaining && page === totalPages ? -1 : 0}
                            aria-disabled={loadingRemaining && page === totalPages}
                            title={loadingRemaining && page === totalPages ? "Carregando conteúdo..." : undefined}
                        >
                            {loadingRemaining && page === totalPages ? "..." : page}
                        </button>
                    )
                )}
            </div>

            <button
                type="button"
                className={`pagination-nav pagination-nav-next ${currentPage === totalPages ? "is-disabled" : ""}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : 0}
            >
                {!isMobile && <span>Próxima</span>}
                <span className="pagination-nav-arrow">&gt;</span>
            </button>
        </nav>
    );
};

export default Pagination;