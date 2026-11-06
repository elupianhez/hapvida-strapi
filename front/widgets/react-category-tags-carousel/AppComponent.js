import React, { useState, useEffect, useRef } from "react";
import { fetchCategoryGroupIdByName, fetchCategoriesByVocabularyId, fetchSiteName } from "react-shared-bundle/structure";

const DEFAULTS = {
    "hapvida": {
        categoryGroupName: "Hapvida",
    },
    "hapvida-notredame": {
        categoryGroupName: "GNDI",
    },
};

export default function AppComponent({ configuration }) {
  const [defaults, setDefaults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showArrows, setShowArrows] = useState(false);

  const scrollRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  useEffect(() => {
      fetchSiteName()
          .then(siteName => {
              const key = siteName.trim().toLowerCase().replace(/\s+/g, "-");
              setDefaults(DEFAULTS[key] ?? DEFAULTS["hapvida"]);
          })
          .catch(() => setDefaults(DEFAULTS["hapvida"]));
  }, []);

  useEffect(() => {
    if (!defaults) return;

    const categoryGroupName = (
      configuration?.portletInstance?.categoryGroupName || defaults.categoryGroupName
    ).trim();

    async function loadCategories() {
      try {
        const vocabularyId = await fetchCategoryGroupIdByName(categoryGroupName);
        if (!vocabularyId) throw new Error("Vocabulário não encontrado");

        const items = await fetchCategoriesByVocabularyId(vocabularyId);
        setCategories(items);

        const savedCategory = localStorage.getItem("categoria");
        if (savedCategory) {
          const found = items.find(item => item.name === savedCategory);
          setActiveId(found ? found.id : -1);
        } else {
          setActiveId(-1);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    loadCategories();
  }, [defaults]);

  useEffect(() => {
    checkArrowsAndOverflow();
  }, [categories]);

  useEffect(() => {
    if (!initialized) return;

    let name = "";
    if (activeId > 0) {
      const activeItem = categories.find(item => item.id === activeId);
      if (activeItem) name = activeItem.name;
    }

    window.dispatchEvent(
      new CustomEvent("blog-search", {
        detail: { term: name, page: 1 }
      })
    );
  }, [activeId, initialized]);

  useEffect(() => {
    const handleResize = () => checkArrowsAndOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function checkArrowsAndOverflow() {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    setShowArrows(hasOverflow);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  function scrollLeft() {
    if (!canScrollLeft) return;
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  }

  function scrollRight() {
    if (!canScrollRight) return;
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  }

  const handleMouseDown = (e) => {
    if (!showArrows) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !showArrows) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeftStart - (x - startX) * 1.5;
    checkArrowsAndOverflow();
  };

  const handleMouseUp = () => {
    if (!showArrows) return;
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "";
    }
  };

  const handleMouseLeave = () => {
    if (isDragging && showArrows) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = "grab";
        scrollRef.current.style.userSelect = "";
      }
    }
  };

  const handleTouchStart = (e) => {
    if (!showArrows) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !showArrows) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeftStart - (x - startX) * 1.5;
    checkArrowsAndOverflow();
  };

  const handleTouchEnd = () => {
    if (!showArrows) return;
    setIsDragging(false);
  };

  if (error) return <p className="categories-error">{error}</p>;

  return (
    <div className="categories-wrapper">
      {showArrows && (
        <div className="categories-controls">
          <button
            className={`categories-arrow left ${!canScrollLeft ? "disabled" : ""}`}
            onClick={scrollLeft}
          >
            <span className="arrow-left" aria-label="Slide anterior"></span>
          </button>
          <button
            className={`categories-arrow right ${!canScrollRight ? "disabled" : ""}`}
            onClick={scrollRight}
          >
            <span className="arrow-right" aria-label="Próximo slide"></span>
          </button>
        </div>
      )}

      <div className={`categories-track-wrapper ${showArrows ? "overflow" : ""}`}>
        <div
          ref={scrollRef}
          className="categories-track"
          onScroll={checkArrowsAndOverflow}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: showArrows ? "grab" : "default" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="categories-skeleton" />
              ))
            : (
              <>
                <button
                  className={`categories-tag ${activeId === -1 ? "active" : ""}`}
                  onClick={() => {
                    setActiveId(-1);
                    localStorage.removeItem("categoria");
                  }}
                >
                  Todos
                </button>

                {categories.map(({ id, name }) => (
                  <button
                    key={id}
                    className={`categories-tag ${activeId === id ? "active" : ""}`}
                    onClick={() => {
                      setActiveId(id);
                      localStorage.setItem("categoria", name);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </>
            )}
        </div>
      </div>
    </div>
  );
}