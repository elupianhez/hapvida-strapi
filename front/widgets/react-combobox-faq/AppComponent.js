import React, { useEffect, useMemo, useState } from 'react';
import ComboBox from "./components/combobox";
import FaqList from "./components/faq-list";
import { fetchAccordions } from "./services/dataService";
import { normalize, parsePairs } from "./utils/helpers";

export default function AppComponent({ configuration = {} }) {
    const rawTitle =
        configuration.portletInstance?.faqComboBoxTitle ?? '';

    const rawSubtitle =
        configuration.portletInstance?.faqComboBoxSubtitle ?? '';

    const rawCategories =
        configuration.portletInstance?.categoryNames ?? '';

    const rawDefaultCategory =
        configuration.portletInstance?.defaultCategory ?? '';

    const rawInfos =
        configuration.portletInstance?.categoryInfos ?? '';

    const rawHasLink =
        configuration.portletInstance?.faqComboBoxHasLink ?? true;

    const rawLinkText =
        configuration.portletInstance?.faqComboBoxLinkText ?? '';

    const rawLink =
        configuration.portletInstance?.faqComboBoxLink ?? '';

    const rawListTitle =
        configuration.portletInstance?.faqListTitle ?? '';

    const categories = rawCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

    const infoMap = parsePairs(rawInfos);

    const [selected, setSelected] = useState(rawDefaultCategory.trim());
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchAccordions()
            .then((items) => {
                if (!cancelled) setAllItems(items);
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const items = useMemo(
        () =>
            allItems.filter((item) =>
                item.categories.some((c) => normalize(c) === normalize(selected))
            ),
        [allItems, selected]
    );

    const infoText = infoMap.get(normalize(selected)) ?? '';

    if (!categories.length) {
        return (
         <section className="faq-combobox">
            <div className="content-container">
                <p tabIndex={0}>
                    Não foi possível carregar as categorias. Verifique se todas as configurações foram aplicadas corretamente.
                </p>;
            </div>
        </section>
        )
    }

    return (
        <section className="faq-combobox">
            <div className="content-container">
                <ComboBox
                    title={rawTitle}
                    subtitle={rawSubtitle}
                    categories={categories}
                    selected={selected}
                    onSelect={setSelected}
                    hasLink={rawHasLink}
                    linkText={rawLinkText}
                    link={rawLink}
                />
                <FaqList
                    title={rawListTitle}
                    category={selected}
                    infoText={infoText}
                    items={items}
                    loading={loading}
                    error={error}
                />
            </div>
        </section>
    );
}