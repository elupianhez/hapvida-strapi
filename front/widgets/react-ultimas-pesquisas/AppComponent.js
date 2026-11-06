import React, { useEffect, useState } from "react";
import { fetchStructureIdByName, fetchContentsByStructureId } from "react-shared-bundle/structure";
import { sortByDateDesc, parseSearchContent } from "./utils/util";
import { SkeletonCard } from "./components/SkeletonCard";
import { SearchItem } from "./components/SearchItem";

export default function AppComponent({ configuration }) {
    const sectionTitle = (configuration?.portletInstance?.sectionTitle || "Acompanhe o que estamos fazendo").trim();
    const sectionRedirectLink = (configuration?.portletInstance?.sectionRedirectLink || "/web/institucional/programas").trim();
    const structureName = (configuration?.portletInstance?.structureName || "Global - Pesquisa").trim();

    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const structureId = await fetchStructureIdByName(structureName);
                if (!structureId) return;

                const items = await fetchContentsByStructureId(structureId);
                const sorted = sortByDateDesc(items.map(parseSearchContent)).slice(0, 3);
                setContents(sorted);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [structureName]);

    return (
        <section className="global-ultimas-noticias">
            <div className="header-container">
                <span className="header-title" tabIndex={0}>
                    {sectionTitle}
                </span>

                <a className="header-link" href={sectionRedirectLink} target="_blank">
                    Ver todos
                </a>
            </div>

            <div className="searchs-container">
                {loading
                   ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
                   : contents.map((item) => <SearchItem key={item.id} item={item} />)
                }
            </div>
        </section>
    );
}