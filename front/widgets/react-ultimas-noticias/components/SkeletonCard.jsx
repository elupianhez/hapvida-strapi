import React from "react";

export function SkeletonCard() {
    return (
        <div className="card-article">
            <span className="skeleton skeleton--image" />

            <span className="skeleton skeleton--date" />

            <span className="tags">
                <span className="skeleton skeleton--tag" />
            </span>

            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--title-short" />
        </div>
    );
}