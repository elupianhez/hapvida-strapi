import React from "react";

import { usePlanBannerData } from "./data/usePlanBannerData";
import { PlanBannerSidebar } from "./components/PlanBannerSidebar";
import { PlanDetailPanel } from "./components/PlanDetailPanel";
import { PlanBannerSkeleton } from "./components/PlanBannerSkeleton";

export default function AppComponent({ configuration }) {
    const planName = (
        configuration?.portletInstance?.planName ||
        "Planos Micro Empresa"
    ).trim();

    const {
        tipoPlano,
        planosAssociados,
        planoOptions,
        planoDetalhe,
        selectedPlanoId,
        setSelectedPlanoId,
        tabsToRender,
        activeTab,
        setActiveTab,
        currentSection,
        loading,
        error,
    } = usePlanBannerData(planName);

    if (loading) {
        return <PlanBannerSkeleton />;
    }

    if (error) {
        return (
            <section className="plans-banner">
                <p>Erro ao carregar o plano.</p>
            </section>
        );
    }

    if (!tipoPlano) {
        return (
            <section className="plans-banner">
                <p>Nenhum plano encontrado.</p>
            </section>
        );
    }

    return (
        <section className="plans-banner">
            <div className="plans-banner__content">
                <PlanBannerSidebar
                    tipoPlano={tipoPlano}
                    planoOptions={planoOptions}
                    selectedPlanoId={selectedPlanoId}
                    onSelectPlano={setSelectedPlanoId}
                    tabsToRender={tabsToRender}
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    planoDetalhe={planoDetalhe}
                />

                <PlanDetailPanel
                    tipoPlano={tipoPlano}
                    planoDetalhe={planoDetalhe}
                    currentSection={currentSection}
                    activeTab={activeTab}
                    planosAssociados={planosAssociados}
                />
            </div>
        </section>
    );
}