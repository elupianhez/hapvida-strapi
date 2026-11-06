import React, { useEffect, useState } from "react";
import Pagination from "react-shared-bundle/Pagination";
import { SearchItem } from "./SearchItem";
import { SkeletonCard } from "./SkeletonCard";

export default function DynamicList({
    originalData = [],
    getItemKey,
    footerContent,
    emptyMsg,
    emptySubMsg,
    initialItemsPerPage,
    loading = false,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
    const [filteredData, setFilteredData] = useState(originalData);
    const [currentItems, setCurrentItems] = useState([]);

    useEffect(() => {
        setItemsPerPage(initialItemsPerPage);
        setCurrentPage(1);
    }, [initialItemsPerPage]);

    useEffect(() => {
        setFilteredData(originalData);
        setCurrentPage(1);
    }, [originalData]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setCurrentItems(filteredData.slice(startIndex, endIndex));
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getKey = (item, index) =>
        getItemKey ? getItemKey(item, index) : item?.id ?? index;

    if (loading) {
        return (
            <div className="searchs-container">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (currentItems.length === 0) {
        return (
            <>
                <div className="empty-result" tabIndex={0}>
                    {emptyMsg}
                </div>
                <div className="sub-empty-result" tabIndex={0}>
                    {emptySubMsg}
                </div>
            </>
        );
    }

    return (
        <>
            <div className="searchs-container">
                {currentItems.map((item, index) => (
                    <SearchItem key={getKey(item, index)} item={item} />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalPages={totalPages}
                />
            )}

            {footerContent && (
                <div className="mt-4">{footerContent}</div>
            )}
        </>
    );
}