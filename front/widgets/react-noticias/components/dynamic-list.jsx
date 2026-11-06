import React, { useEffect, useState, useRef } from "react";
import Pagination from "react-shared-bundle/Pagination";
import ArticleCard from "./article-card";

export default function DynamicList({
    originalData = [],
    getItemKey,
    footerContent,
    emptyMsg = "Nenhum resultado encontrado",
    emptySubMsg,
    initialItemsPerPage,
    noFeatured,
    totalCount: externalTotalCount,
    loadingRemaining = false,
    currentPage: externalCurrentPage,
    onPageChange: externalOnPageChange,
}) {
    const [internalPage, setInternalPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
    const [filteredData, setFilteredData] = useState(originalData);
    const [currentItems, setCurrentItems] = useState([]);

    const isControlled = externalCurrentPage != null && externalOnPageChange != null;
    const currentPage = isControlled ? externalCurrentPage : internalPage;

    useEffect(() => {
        setItemsPerPage(initialItemsPerPage);
        if (!isControlled) setInternalPage(1);
    }, [initialItemsPerPage]);

    useEffect(() => {
        setFilteredData(originalData);
        if (!isControlled) setInternalPage(1);
    }, [originalData]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setCurrentItems(filteredData.slice(startIndex, endIndex));
    }, [filteredData, currentPage, itemsPerPage]);

    const effectiveTotalCount = externalTotalCount ?? filteredData.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (isControlled) {
            externalOnPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
        window.dispatchEvent(
            new CustomEvent("pagination-changed", { detail: { page: newPage } })
        );
    };

    if (currentItems.length === 0) {
        return (
            <>
                <div className="empty-result" tabIndex={0}>{emptyMsg}</div>
                <div className="sub-empty-result" tabIndex={0}>{emptySubMsg}</div>
            </>
        );
    }

    const getKey = (item, index) =>
        getItemKey ? getItemKey(item, index) : item?.id ?? index;

    if (noFeatured) {
        return (
            <>
                <div className={`articles-small-list ${noFeatured && "fallback"}`}>
                    {currentItems.map((item, index) => (
                        <ArticleCard
                            key={getKey(item, index)}
                            img={item.imagem}
                            date={item.dataPublicacao}
                            tags={item.categorias}
                            title={item.titulo}
                            href={item.friendlyUrlPath}
                            variant="small"
                        />
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        totalPages={totalPages}
                        loadingRemaining={loadingRemaining}
                    />
                )}

                {footerContent && <div className="mt-4">{footerContent}</div>}
            </>
        );
    }

    const featuredItem = currentItems[0];
    const smallItems = currentItems.slice(1);

    return (
        <>
            <div className="articles-list">
                <div className="articles-featured">
                    <ArticleCard
                        key={getKey(featuredItem, 0)}
                        img={featuredItem.imagem}
                        date={featuredItem.dataPublicacao}
                        tags={featuredItem.categorias}
                        title={featuredItem.titulo}
                        href={featuredItem.friendlyUrlPath}
                        variant="large"
                    />
                </div>

                {smallItems.length > 0 && (
                    <div className="articles-small-list">
                        {smallItems.map((item, index) => (
                            <ArticleCard
                                key={getKey(item, index + 1)}
                                img={item.imagem}
                                date={item.dataPublicacao}
                                tags={item.categorias}
                                title={item.titulo}
                                href={item.friendlyUrlPath}
                                variant="small"
                            />
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={totalPages}
                    loadingRemaining={loadingRemaining}
                />
            )}

            {footerContent && <div className="mt-4">{footerContent}</div>}
        </>
    );
}