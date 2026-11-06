import React from "react";
import SearchBar from "./SearchBar";

export default function Header({
	title,
    itemsShown,
    totalCount,
    searchValue,
	onSearchChange,
	onSearch,
	searchPlaceholder = "O que você está procurando?",
	hideSearch,
	hideResultsCount,
	categoryLabel,
	clearAllFilters,
	isResultPage
}) {
    const isSearchHidden = hideSearch === true || hideSearch === "true";
    if (categoryLabel){
	    title = `Últimas notícias em ${categoryLabel}`
    }

    return (
        <div className="page-header">
			{isResultPage &&(
                <a href="#" className="section-button section-button-secondary my-4" tabIndex={0} onClick={clearAllFilters}>
                    {'< Voltar'}
                </a>
            )}

	        <div className="page-header__title-row">
	            <h2 className="page-header__title" tabIndex={0}>{title}</h2>
	        </div>

            <div className="page-header__meta-row">
				{!categoryLabel && !hideResultsCount && (
		            <p className="page-header__results" tabIndex={0}>
		                Exibindo {itemsShown} - {totalCount} resultados
		            </p>
	            )}

		        {!isSearchHidden && (
					<SearchBar
		                value={searchValue}
		                onChange={onSearchChange}
		                onSearch={onSearch}
		                placeholder={searchPlaceholder}
		            />
		        )}
            </div>
        </div>
    );
}