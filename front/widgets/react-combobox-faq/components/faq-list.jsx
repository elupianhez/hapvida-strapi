import React, { useId } from "react";
import { buildFaqPageSchema, serializeJsonLd } from "../utils/helpers";

const SKELETON_COUNT = 3;

function ArrowIcon() {
    return (
        <svg
            className="faq-arrow"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M16.5 7.5L9.763 14.5L3.5 7.5"
                stroke="#5B5B5F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function FaqSkeleton({ count = SKELETON_COUNT }) {
    return (
        <div className="faq-skeleton" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div className="faq-skeleton__item" key={index}>
                    <span className="faq-skeleton__line" />
                    <span className="faq-skeleton__arrow" />
                </div>
            ))}
        </div>
    );
}

function FaqJsonLd({ category, items }) {
    if (!items.length) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: serializeJsonLd(buildFaqPageSchema(category, items)),
            }}
        />
    );
}

export default function FaqList({
    title = "",
    category,
    infoText = "",
    items = [],
    loading,
    error
}) {
    const accordionGroup = useId();

    if (!category) return null;

    return (
        <div
            role="region"
            aria-labelledby="faq-list__title-category"
            aria-busy={loading ? "true" : "false"}
            className="faq-list"
        >
            <div className="faq-list__title-container">
                {title &&
                    <h3 className="faq-list__title" tabIndex={0}>
                        {title}
                    </h3>
                }
                <span id="faq-list__title-category" tabIndex={0}>{category}</span>
            </div>

            {infoText.trim() && <span className="faq-list__info" tabIndex={0}>{infoText}</span>}

            {loading && (
                <>
                    <p role="status" className="faq-skeleton__status" tabIndex={0}>Carregando...</p>
                    <FaqSkeleton />
                </>
            )}
            {!loading && error && <p role="alert" tabIndex={0}>Não foi possível carregar as informações.</p>}
            {!loading && !error && !items.length && (
                <p tabIndex={0}>Nenhum item encontrado para esta categoria.</p>
            )}

            {!loading && items.map((item) => (
                <details className="faq-accordion" key={item.id} name={accordionGroup}>
                    <summary>
                        <h4 className="faq-title" tabIndex={0}>
                            {item.title}
                        </h4>
                        <ArrowIcon />
                    </summary>
                    <div
                        className="faq-description"
                        dangerouslySetInnerHTML={{ __html: item.detail }}
                        tabIndex={0}
                    />
                </details>
            ))}

            {!loading && !error && <FaqJsonLd category={category} items={items} />}
        </div>
    );
}