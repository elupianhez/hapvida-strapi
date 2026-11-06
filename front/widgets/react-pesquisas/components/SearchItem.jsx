import React from "react";

export function SearchItem({ item }) {
    return (
        <div className="search-item">
            {item.category && (
                <span className="search-status" tabIndex={0}>
                    {item.category}
                </span>
            )}
            {item.title && (
                <span className="search-title" tabIndex={0}>
                    {item.title}
                </span>
            )}
            {item.description && (
                <div
                    className="search-description"
                    tabIndex={0}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                />
            )}
            {item.buttonLink && (
                <a className="search-link-button" href={item.buttonLink} target="_self">
                    {item.buttonText}
                </a>
            )}
        </div>
    );
}