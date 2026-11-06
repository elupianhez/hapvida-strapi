import { siteAtual } from "react-shared-bundle/site";
import React, { useEffect, useState } from "react";
import { fetchStructureIdByName, fetchCategoryIdByName } from "react-shared-bundle/structure";
import api from "react-shared-bundle/endpoints";
import { parseSearchContent } from "./utils/util";
import { SkeletonCard } from "./components/SkeletonCard";
import { NewCard } from "./components/NewCard";

const DEFAULTS = {
    "hapvida": {
        structureName: "Artigos (Dicas Saúde / Noticias / Imprensa) - Global (atualizado)",
        vocabularyName: "Artigos",
        categoryName: "Notícia",
    }
};

export default function AppComponent({ configuration }) {
    const sectionRedirectLink = (
        configuration?.portletInstance?.sectionRedirectLink ||
        "/noticias"
    ).trim();

    const [defaults, setDefaults] = useState(DEFAULTS["hapvida"]);

    const structureName = (configuration?.portletInstance?.structureName || defaults.structureName).trim();
    const vocabularyName = (configuration?.portletInstance?.vocabularyName || defaults.vocabularyName).trim();
    const categoryName = (configuration?.portletInstance?.categoryName || defaults.categoryName).trim();

    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const siteId = siteAtual().codigo;

                const structureId = await fetchStructureIdByName(
                    structureName
                );

                const categoryId = await fetchCategoryIdByName(
                    categoryName,
                    vocabularyName
                );

                const isValid = (val) =>
                    val && !val?.erro && !isNaN(Number(val));


                if (!isValid(structureId) || !isValid(categoryId)) {
                    console.warn(
                        "IDs inválidos — structureId:",
                        structureId,
                        "categoryId:",
                        categoryId
                    );

                    setContents([]);
                    return;
                }

                let filter = `siteId eq ${siteId}`;

                filter += ` and taxonomyCategoryIds/any(t:t eq ${categoryId})`;

                const response = await api(
                    `/api/conteudos/estruturas/${structureId}`
                    + `?filter=${encodeURIComponent(filter)}`
                    + `&nestedFields=taxonomyCategoryBriefs`
                    + `&pageSize=3`
                    + `&page=1`
                    + `&sort=contentFields/dataPublicacao:desc`,
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const items = (response?.items || []).map(parseSearchContent);

                setContents(items);
            } catch (error) {
                console.error("Erro ao carregar notícias:", error);
                setContents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <section className="global-ultimas-noticias">
            <div className="header-container">
                <h2 className="header-title mb-0" tabIndex={0}>
                    Fique por dentro das
                </h2>

                <a
                    className="header-link"
                    href={sectionRedirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ver todas as notícias
                </a>
            </div>

            <div className="news-cards-container">
                {loading
                    ? [1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))
                    : contents.map((item) => (
                        <NewCard
                            key={item.id}
                            img={item.img}
                            date={item.date}
                            tags={item.tags}
                            title={item.title}
                            href={item.href}
                        />
                    ))}
            </div>
        </section>
    );
}