import React from "react";

export function PlanBannerSkeleton() {
    return (
        <section className="plans-banner">
            <div className="plans-banner__content">
                <div className="plans-banner__skeleton-sidebar">
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-sidebar-image" />

                    <div className="plans-banner__skeleton-sidebar-content">
                        <div className="plans-banner__skeleton-block plans-banner__skeleton-select-label" />
                        <div className="plans-banner__skeleton-block plans-banner__skeleton-select-input" />

                        <div className="plans-banner__skeleton-block plans-banner__skeleton-tabs-title" />

                        <div className="plans-banner__skeleton-tabs-list">
                            <div className="plans-banner__skeleton-block plans-banner__skeleton-tab" />
                            <div className="plans-banner__skeleton-block plans-banner__skeleton-tab" />
                            <div className="plans-banner__skeleton-block plans-banner__skeleton-tab" />
                            <div className="plans-banner__skeleton-block plans-banner__skeleton-tab" />
                        </div>
                    </div>
                </div>

                <div className="plans-banner__skeleton-panel">
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-panel-title" />
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-panel-line" />
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-panel-line" />
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-panel-line plans-banner__skeleton-panel-line--short" />
                    <div className="plans-banner__skeleton-block plans-banner__skeleton-cta" />
                </div>
            </div>
        </section>
    );
}