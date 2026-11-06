import React, { useState, useEffect } from "react";
import { fetchBreadcrumbEntries } from "react-shared-bundle/structure";

const Breadcrumb = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const result = await fetchBreadcrumbEntries();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    useEffect(() => {
        if (!data) return;

        const { homeUrl, entries } = data;

        const itemListElement = [];
        let position = 1;

        itemListElement.push({
            "@type": "ListItem",
            position,
            name: "Home",
            item: homeUrl
        });
        position++;

        entries.forEach((entry) => {
            itemListElement.push({
                "@type": "ListItem",
                position,
                name: entry.title,
                item: entry.url
            });
            position++;
        });

        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement
        };

        const existing = document.getElementById("breadcrumb-ld-json");
        if (existing) existing.remove();

        const script = document.createElement("script");
        script.id = "breadcrumb-ld-json";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const el = document.getElementById("breadcrumb-ld-json");
            if (el) el.remove();
        };
    }, [data]);

    if (loading) return <div className="breadcrumb-skeleton" />;
    if (error) return <p className="breadcrumb-error">{error}</p>;
    if (!data) return null;

    const { homeUrl, entries } = data;

    return (
        <nav className="global-menu-breadcrumb" aria-label="breadcrumb">
            <a className="fixed-home-link oxygen-p4-regular" href={homeUrl} target="_self" tabIndex={0}>Home</a>

            <div className="breadcrumb-item-list">
                {entries.map((entry, index) => (
                    entry.isCurrent
                        ? <span key={index} className="oxygen-p4-regular" tabIndex={0}>{entry.title}</span>
                        : <a key={index} className="oxygen-p4-regular" href={entry.url} target="_self" tabIndex={0}>{entry.title}</a>
                ))}
            </div>
        </nav>
    );
};

export default Breadcrumb;