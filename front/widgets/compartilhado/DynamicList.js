import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';

const DynamicList = ({
    renderItem,
    getItemKey,
    originalData = [],
    footerContent,
    emptyMsg = 'Nenhum resultado encontrado',
    emptySubMsg,
    initialItemsPerPage = 10,
    totalCount: externalTotalCount,
    loadingRemaining = false,
    currentPage: externalCurrentPage,
    onPageChange: externalOnPageChange,
}) => {
    const [internalPage, setInternalPage] = useState(1);

    const isControlled = externalCurrentPage != null && externalOnPageChange != null;
    const currentPage = isControlled ? externalCurrentPage : internalPage;

    useEffect(() => {
        if (!isControlled) setInternalPage(1);
    }, [originalData]);

    const effectiveTotalCount = externalTotalCount ?? originalData.length;
    const totalPages = Math.ceil(effectiveTotalCount / initialItemsPerPage);
    const safePage = Math.min(currentPage, totalPages) || 1;

    const startIndex = (safePage - 1) * initialItemsPerPage;
    const currentItems = originalData.slice(startIndex, startIndex + initialItemsPerPage);

    const handlePageChange = (newPage) => {
        if (isControlled) {
            externalOnPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    return (
        <>
            {currentItems.length === 0 ? (
                <>
                    <h3 className="empty-result" tabIndex={0}>{emptyMsg}</h3>
                    <h4 className="sub-empty-result" tabIndex={0}>{emptySubMsg}</h4>
                </>
            ) : (
                <div className="articles-list">
                    {currentItems.map((item, index) => {
                        const key = getItemKey ? getItemKey(item, index) : item?.id ?? index;
                        return (
                            <React.Fragment key={key}>
                                {renderItem(item, index)}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={safePage}
                    onPageChange={handlePageChange}
                    totalPages={totalPages}
                    loadingRemaining={loadingRemaining}
                />
            )}

            {footerContent && <div className="mt-4">{footerContent}</div>}
        </>
    );
};

export default DynamicList;