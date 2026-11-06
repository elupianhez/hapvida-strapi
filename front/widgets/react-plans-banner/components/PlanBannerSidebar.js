import React from "react";

import { CustomSelect } from "./CustomSelect";
import { PlanTabsNav } from "./PlanTabsNav";

export function PlanBannerSidebar({
    tipoPlano,
    planoOptions,
    selectedPlanoId,
    onSelectPlano,
    tabsToRender,
    activeTab,
    onSelectTab,
    planoDetalhe,
}) {
    const semPlanos = planoOptions.length <= 1;

    return (
        <div className="plans-banner__sidebar">
            {tipoPlano.bannerImageUrl && (
                <img
                    src={tipoPlano.bannerImageUrl}
                    alt={tipoPlano.bannerImageAlt}
                    className="plans-banner__sidebar-image"
                />
            )}

            {!semPlanos && (
                <div className="plans-banner__sidebar-content">
                    <div className="plans-banner__select">
                        <label htmlFor="plano-select" tabIndex={0}>
                            Selecione um plano para começar
                        </label>
                        <CustomSelect
                            id="plano-select"
                            options={planoOptions}
                            value={selectedPlanoId}
                            onChange={onSelectPlano}
                            placeholder="Selecione um plano"
                        />
                    </div>

                    <PlanTabsNav
                        tabs={tabsToRender}
                        activeTab={activeTab}
                        onSelectTab={onSelectTab}
                        disabled={!planoDetalhe}
                        serviceNetworkUrl={tipoPlano.serviceNetwork}
                    />
                </div>
            )}
        </div>
    );
}