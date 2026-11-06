import { useEffect, useState } from "react";

/**
 * Retorna `true` se o filtro de categoria ou a busca por texto
 * estiverem ativos no momento.
 */
export default function useAnyFilterActive(categoryEventName, searchEventName) {
  const [categoryActive, setCategoryActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    const handleCategory = (event) => {
      const id = event.detail?.id;
      setCategoryActive(id !== null && id !== undefined && id !== "-1");
    };

    const handleSearch = (event) => {
      const term = (event.detail?.term || "").trim();
      setSearchActive(term.length > 0);
    };

    window.addEventListener(categoryEventName, handleCategory);
    window.addEventListener(searchEventName, handleSearch);

    return () => {
      window.removeEventListener(categoryEventName, handleCategory);
      window.removeEventListener(searchEventName, handleSearch);
    };
  }, [categoryEventName, searchEventName]);

  return categoryActive || searchActive;
}