import React, { useEffect, useMemo, useRef, useState } from "react";

export function PlanComparisonTable({
    planosAssociados = [],
    planoDetalhe,
}) {
    const scrollRef = useRef(null);

    const [showNav, setShowNav] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const planosOrdenados = useMemo(() => {
        if (!planoDetalhe) {
            return planosAssociados;
        }

        const outros = planosAssociados.filter(
            (p) => p.id !== planoDetalhe.id
        );

        return [planoDetalhe, ...outros];
    }, [planosAssociados, planoDetalhe]);

    const allBenefits = useMemo(() => {
        const seen = new Map();

        const requiredBenefits = [
            {
                key: "RedeCredenciada",
                name: "Rede Credenciada",
                type: "boolean",
            },
            {
                key: "acomodacoes",
                name: "Acomodações",
                type: "accommodation",
            },
            {
                key: "ContrataoComOuSemCoparticipao",
                name: "Contratação com ou sem coparticipação",
                type: "boolean",
            },
            {
                key: "ExamesECirurgias",
                name: "Exames e Cirurgias",
                type: "boolean",
            },
            {
                key: "Telemedicina",
                name: "Telemedicina",
                type: "boolean",
            },
            {
                key: "EducaoEstendida",
                name: "Educação Estendida",
                type: "boolean",
            },
        ];

        requiredBenefits.forEach((beneficio) => {
            seen.set(beneficio.key, beneficio);
        });

        planosOrdenados.forEach((plano) => {
            (plano.beneficios || []).forEach((beneficio) => {
                if (!seen.has(beneficio.key)) {
                    seen.set(beneficio.key, {
                        key: beneficio.key,
                        name: beneficio.name,
                        type: "boolean",
                    });
                }
            });
        });

        return Array.from(seen.values());
    }, [planosOrdenados]);

    const updateScrollState = () => {
        const el = scrollRef.current;

        if (!el) return;

        const hasOverflow =
            el.scrollWidth > el.clientWidth + 1;

        setShowNav(hasOverflow);

        setCanScrollLeft(el.scrollLeft > 0);

        setCanScrollRight(
            el.scrollLeft + el.clientWidth <
                el.scrollWidth - 1
        );
    };

    useEffect(() => {
        updateScrollState();

        const el = scrollRef.current;

        if (!el) return;

        el.addEventListener(
            "scroll",
            updateScrollState
        );

        window.addEventListener(
            "resize",
            updateScrollState
        );

        let resizeObserver;

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(
                updateScrollState
            );

            resizeObserver.observe(el);
        }

        return () => {
            el.removeEventListener(
                "scroll",
                updateScrollState
            );

            window.removeEventListener(
                "resize",
                updateScrollState
            );

            resizeObserver?.disconnect();
        };
    }, [planosOrdenados, allBenefits]);

    const scrollByDirection = (direction) => {
        const el = scrollRef.current;

        if (!el) return;

        el.scrollBy({
            left: el.clientWidth * 0.8 * direction,
            behavior: "smooth",
        });
    };

    if (!planosOrdenados.length) {
        return null;
    }

    return (
        <div className="benefits-comparison-wrapper">
            <div
                className="benefits-table"
                ref={scrollRef}
            >
                <table
                    className={
                        planoDetalhe
                            ? "comparison-table has-selected"
                            : "comparison-table"
                    }
                >
                    <thead>
                        {planoDetalhe && (
                            <tr className="selected-plan-label-row">
                                <th />

                                <th className="selected-plan-label">
                                    <span className="selected-label-text">
                                        Plano Selecionado
                                    </span>
                                </th>

                                {planosOrdenados
                                    .slice(1)
                                    .map((p) => (
                                        <th key={p.id} />
                                    ))}
                            </tr>
                        )}

                        <tr className="plan-titles-row">
                            <th />

                            {planosOrdenados.map((p) => (
                                <th
                                    key={p.id}
                                    className="plan-header"
                                    tabIndex={0}
                                >
                                    {p.nome}
                                </th>
                            ))}
                        </tr>

                        <tr>
                            <th
                                className="benefit-header"
                                tabIndex={0}
                            >
                                Benefícios do plano
                            </th>

                            {planosOrdenados.map((p) => (
                                <th key={p.id} />
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {allBenefits.map((beneficio) => (
                            <tr key={beneficio.key}>
                                <td
                                    className="benefit-name"
                                    tabIndex={0}
                                >
                                    {beneficio.name}
                                </td>

                                {planosOrdenados.map(
                                    (plano) => {
                                        if (
                                            beneficio.type ===
                                            "accommodation"
                                        ) {
                                            return (
                                                <td
                                                    key={plano.id}
                                                    className="benefit-status benefit-status--text"
                                                    tabIndex={0}
                                                >
                                                    {plano.acomodacoes ||
                                                        "-"}
                                                </td>
                                            );
                                        }

                                        const encontrado = (
                                            plano.beneficios ||
                                            []
                                        ).some(
                                            (b) =>
                                                b.key ===
                                                beneficio.key
                                        );

                                        return (
                                            <td
                                                key={plano.id}
                                                className="benefit-status"
                                                tabIndex={0}
                                            >
                                                {encontrado ? (
                                                    <span
                                                        className="check-icon"
                                                        title={`${beneficio.name} - Benefício ativo`}
                                                    />
                                                ) : (
                                                    <span
                                                        className="cancel-icon"
                                                        title={`${beneficio.name} - Benefício inativo`}
                                                    />
                                                )}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div
                className={
                    showNav
                        ? "table-navigation show"
                        : "table-navigation"
                }
            >
                <button
                    type="button"
                    className="table-nav-button scroll-left-btn"
                    aria-label="Rolar para esquerda"
                    disabled={!canScrollLeft}
                    onClick={() =>
                        scrollByDirection(-1)
                    }
                />

                <button
                    type="button"
                    className="table-nav-button scroll-right-btn"
                    aria-label="Rolar para direita"
                    disabled={!canScrollRight}
                    onClick={() =>
                        scrollByDirection(1)
                    }
                />
            </div>
        </div>
    );
}