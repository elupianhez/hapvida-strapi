import React, { useState } from "react";

export function PlanTabsNav({ tabs, activeTab, onSelectTab, disabled, serviceNetworkUrl }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <nav className="plans-banner__tabs">
            <span className="plans-banner__tabs-title" tabIndex={0}>
                Explore e conheça mais
            </span>

            <div
                id="plans-banner-tabs-list"
                className={
                    isExpanded
                        ? "plans-banner__tabs-itens plans-banner__tabs-itens--expanded"
                        : "plans-banner__tabs-itens"
                }
            >
                {tabs.map((section) => (
                    <button
                        key={section.key}
                        type="button"
                        data-section={section.label}
                        aria-disabled={disabled}
                        tabIndex={0}
                        title={disabled ? "Selecione um plano" : undefined}
                        className={
                            section.key === activeTab
                                ? "plans-banner__tab active"
                                : "plans-banner__tab"
                        }
                        onClick={() => !disabled && onSelectTab(section.key)}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && !disabled) {
                                e.preventDefault();
                                onSelectTab(section.key);
                            }
                        }}
                    >
                        {section.label}
                    </button>
                ))}

                {serviceNetworkUrl && (
                    <a
                        href={serviceNetworkUrl}
                        data-section="Rede de atendimento"
                        className="plans-banner__network"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Rede de atendimento
                    </a>
                )}
            </div>

            <button
                type="button"
                className="plans-banner__tabs-toggle"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-controls="plans-banner-tabs-list"
            >
                <span
                    className={
                        isExpanded
                            ? "plans-banner__tabs-toggle-label plans-banner__tabs-toggle-label--open"
                            : "plans-banner__tabs-toggle-label"
                    }
                >
                    {isExpanded ? "Ocultar detalhes" : "Expandir"}
                </span>
            </button>
        </nav>
    );
}