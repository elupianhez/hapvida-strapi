import React, { useState, useEffect, useRef, useCallback } from "react";

export default function NewsSearchFilterBar({
  categories = [],
  searchPlaceholder = "O que você está procurando?",
  categoryEventName = "category-noticia-filter",
  searchEventName = "busca-noticia-filter",
  initialSelectedId = null,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSelectedId);
  const scrollerRef = useRef(null);
  const didInitialDispatch = useRef(false);

  const dispatchCategory = useCallback(
    (category) => {
      setSelectedCategoryId(category ? category.id : null);
      window.dispatchEvent(
        new CustomEvent(categoryEventName, {
          detail: category
            ? { id: category.id, label: category.label }
            : { id: null, label: "" },
        })
      );
    },
    [categoryEventName]
  );

	useEffect(() => {
	    const handleExternalSearch = (event) => {
	        setSearchValue(event.detail?.term ?? "");
	    };
	    window.addEventListener(searchEventName, handleExternalSearch);
	    return () => window.removeEventListener(searchEventName, handleExternalSearch);
	}, [searchEventName]);

  useEffect(() => {
    if (initialSelectedId && categories.length > 0) {
      const found = categories.find(
        (c) => String(c.id) === String(initialSelectedId)
      );
      if (found) {
        dispatchCategory(found);
      }
    }
  }, [categories, initialSelectedId, dispatchCategory]);

  const dispatchSearch = useCallback(() => {
    const term = searchValue.trim();
     if (term.length > 0 && term.length < 10) {
        return;
    }
    window.dispatchEvent(
      new CustomEvent(searchEventName, {
        detail: { term },
      })
    );
  }, [searchEventName, searchValue]);

	useEffect(() => {
	  const handleExternalCategoryChange = (event) => {
	    setSelectedCategoryId(event.detail?.id ?? null);
	  };

	  window.addEventListener(categoryEventName, handleExternalCategoryChange);
	  return () =>
	    window.removeEventListener(categoryEventName, handleExternalCategoryChange);
	}, [categoryEventName]);

  const handleCategoryClick = (category) => {
      const isCurrentlySelected = String(selectedCategoryId) === String(category?.id);
      if (isCurrentlySelected) {
          dispatchCategory(null);
      } else {
          dispatchCategory(category);
      }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dispatchSearch();
    }
  };

	const handleScrollNext = useCallback(() => {
	  const el = scrollerRef.current;
	  if (!el) return;
	  el.scrollBy({ left: 200, behavior: "smooth" });
	}, []);

	const handleScrollPrev = useCallback(() => {
	  const el = scrollerRef.current;
	  if (!el) return;
	  el.scrollBy({ left: -200, behavior: "smooth" });
	}, []);

  return (
    <div className="news-filter-bar">
      <div className="news-filter-bar__search">
        <svg
          className="news-filter-bar__search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          onClick={dispatchSearch}
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          className="news-filter-bar__input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className="news-filter-bar__chips-row">
        <span className="news-filter-bar__chips-label news-filter-bar__chips-button" onClick={handleScrollPrev} role="button" tabIndex={0} aria-label="Categorias anteriores" style={{ cursor: "pointer" }}>
          <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.5 23.5L11.5 16.763L18.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="news-filter-bar__chips" ref={scrollerRef} role="list">
          {categories.map((category) => {
            const isSelected = String(selectedCategoryId) === String(category.id);
            return (
              <button
                key={category.id}
                type="button"
                role="listitem"
                className={`news-filter-bar__chip px-3${
                  isSelected ? " is-selected" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => handleCategoryClick(category)}
              >
                {category.label}
              </button>
            );
          })}
        </div>
        <span className="news-filter-bar__chips-label news-filter-bar__chips-button" onClick={handleScrollNext} role="button" tabIndex={0} aria-label="Rolar categorias" style={{ cursor: "pointer" }}>
          <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 23.5L20.5 16.763L13.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </span>
      </div>
    </div>
  );
}