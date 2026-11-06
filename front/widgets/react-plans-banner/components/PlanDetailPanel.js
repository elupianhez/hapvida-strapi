import React from "react";

import { SectionContent } from "./SectionContent";
import { PlanComparisonTable } from "./PlanComparisonTable";

export function PlanDetailPanel({
    tipoPlano,
    planoDetalhe,
    currentSection,
    activeTab,
    planosAssociados,
}) {
    const tipoPlanoSection = {
        key: "tipoPlanoContent",
        label: tipoPlano.name,
        type: "html",
        value: tipoPlano.textContent,
    };

    const isCompareActive = activeTab === "comparePlanos";
    const semPlanosAssociados = planosAssociados.length === 0;

     if (semPlanosAssociados) {
            return (
                <div className="plans-banner__panel">
                    <SectionContent section={tipoPlanoSection} />
                    <p className="plans-banner__panel-section" tabIndex={0}>
                        Nenhum plano detalhado encontrado para este tipo de plano.
                    </p>
                </div>
            );
    }

    return (
        <div className="plans-banner__panel">
            {!planoDetalhe && (
                <>
                    <SectionContent section={tipoPlanoSection} />

                    <h3 className="plans-banner__panel-subtitle" tabIndex={0}>
                        Confira o que nossos planos podem te oferecer
                    </h3>

                    <PlanComparisonTable
                        planosAssociados={planosAssociados}
                        planoDetalhe={null}
                    />
                </>
            )}

            {planoDetalhe && (
                <h2 className="plans-banner__panel-title" tabIndex={0}>
                    {planoDetalhe.nome}
                </h2>
            )}

            {!isCompareActive && planoDetalhe && currentSection && (
                <>
                    <span className="plans-banner__panel-section" tabIndex={0}>
                        {currentSection.label}
                    </span>

                    <SectionContent section={currentSection} />
                </>
            )}

            {planoDetalhe && isCompareActive && (
                <>
                    <span className="plans-banner__panel-section" tabIndex={0}>
                        Compare os Planos
                    </span>
                    <h3 className="plans-banner__panel-subtitle" tabIndex={0}>
                        Confira o que nossos planos podem te oferecer
                    </h3>
                    <PlanComparisonTable
                        planosAssociados={planosAssociados}
                        planoDetalhe={planoDetalhe}
                    />
                </>
            )}

            {tipoPlano?.linkBotao && (
                <a
                    href={tipoPlano.linkBotao}
                    className="plans-banner__cta"
                    target="_blank"
                    rel="noreferrer"
                >
                    {tipoPlano.textoBotao}
                </a>
            )}
        </div>
    );
}