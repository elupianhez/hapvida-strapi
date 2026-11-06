import React from 'react';


export function parseSearchContent(item) {
    const nested = item.contentFields?.[0]?.nestedContentFields ?? [];
    const get = (name) => nested.find(f => f.name === name)?.contentFieldValue?.data ?? "";

    const buttonNested = nested.find(f => f.name === "button")?.nestedContentFields ?? [];
    const getButton = (name) => buttonNested.find(f => f.name === name)?.contentFieldValue?.data ?? "";

    return {
        id: item.id,
        dataPublicacao: item.datePublished,
        title: get("searchTitle"),
        description: get("searchDescription"),
        buttonText: getButton("buttonText"),
        buttonLink: item.friendlyUrlPath,
        category: item.taxonomyCategoryBriefs?.[0]?.taxonomyCategoryName ?? "",
    };
}

export function sortByDateDesc(data) {
    return [...data].sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));
}