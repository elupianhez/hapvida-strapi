import React from "react";

export function NewCard({ img, date, tags = [], title, href }) {
    const card = (
        <div className="card-article">
            {img && (
                <img src={img} alt={title} />
            )}

            {date && (
                <span className="date" tabIndex={0}>
                    {new Intl.DateTimeFormat("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }).format(new Date(date))}
                </span>
            )}

            {tags.length > 0 && (
                <span className="tags">
                    {tags.slice(0, 2).map((tag, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <span className="dot" aria-hidden="true">•</span>
                            )}
                            <span className="tag" tabIndex={0}>
                                {tag}
                            </span>
                        </React.Fragment>
                    ))}

                    {tags.length > 2 && (
                        <span className="tag" tabIndex={0}>
                            +{tags.length - 2}
                        </span>
                    )}
                </span>
            )}

            {title && (
                <h3 className="title" tabIndex={0}>
                    {title}
                </h3>
            )}
        </div>
    );

    if (href) {
        return <a className="card-article-link" href={href}>{card}</a>;
    }

    return card;
}