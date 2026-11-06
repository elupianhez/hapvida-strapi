import React from "react";

export function SkeletonCard() {
    return (
        <div className="search-item search-item--skeleton">
            <span className="skeleton skeleton--status" />
            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--description" />
            <span className="skeleton skeleton--description skeleton--description-short" />
            <span className="skeleton skeleton--button" />
        </div>
    );
}