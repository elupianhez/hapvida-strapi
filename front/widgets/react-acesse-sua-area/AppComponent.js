import React, { useEffect, useState } from "react";
import Cards from "./components/cards-content";
import { fetchAllObjectEntries } from "react-shared-bundle/structure";
import { siteAtual } from "react-shared-bundle/site";
import { mapCardsDeAcesseSuaArea } from "./utils/util";

export default function AppComponent({ configuration }) {
    const areaKey =
        configuration?.portletInstance?.areaKey || "BENEFICIARIO";
    const titleContainer =
            configuration?.portletInstance?.titleContainer || "Tenha tudo na palma da sua mão";
    const subtitleContainer =
            configuration?.portletInstance?.subtitleContainer || "Escolha abaixo o serviço disponível para você";

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function carregarEntries() {
            try {
                const data = await fetchAllObjectEntries(
                    "carddeacessesuareas",
                    siteAtual().chave,
                    areaKey
                );

                const cards = mapCardsDeAcesseSuaArea({ items: data });

                if (ativo) setEntries(cards);
            } catch (error) {
                console.error(error);
            } finally {
                if (ativo) setLoading(false);
            }
        }

        carregarEntries();

        return () => {
            ativo = false;
        };
    }, [areaKey]);

    return (
        <section className="visit-your-area">
            <div className="content-container">
                <div className="text-content">
                    <h2 className="title-content" tabIndex={0}>
                        {titleContainer}
                    </h2>

                    <p className="subtext-content" tabIndex={0}>

                        {subtitleContainer}
                    </p>
                </div>

                <Cards entries={entries} loading={loading} />
            </div>
        </section>
    );
}