import React from "react";

export default function UnidadeCardSkeleton() {
    return (
        <div className="card-canais card-canais--skeleton" aria-hidden="true">
            <span className="skeleton-block skeleton-estado" />
            <span className="skeleton-block skeleton-title" />
            <div className="card-info-group">
                <span className="skeleton-block skeleton-info" />
                <span className="skeleton-block skeleton-info" />
                <span className="skeleton-block skeleton-info skeleton-info--short" />
            </div>
        </div>
    );
}
