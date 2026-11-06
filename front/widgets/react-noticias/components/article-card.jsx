import React from 'react';
import { useIsTabletOrMobile, formatDate } from '../utils/util';

export default function ArticleCard({ img, date, tags = [], title, href, variant }) {
    const isTabletOrMobile = useIsTabletOrMobile();
    const isLarge = variant === 'large';

    const formattedDate = formatDate(date);
    const visibleCount = (isLarge || isTabletOrMobile) ? 2 : 1;
    const visibleTags = tags.slice(0, visibleCount);
    const extraCount = tags.length - visibleCount;
    const showDot = isTabletOrMobile && !isLarge;

    const renderTags = () => (
        <div className="article-card-tags">
            {visibleTags.map((tag, i) => (
                <React.Fragment key={i}>
                    {showDot && i > 0 && (
                        <span className="article-card-tag-dot" aria-hidden="true">•</span>
                    )}
                    <span className="article-card-tag" tabIndex={0}>{tag}</span>
                </React.Fragment>
            ))}
            {extraCount > 0 && (
                <>
                    {showDot && (
                        <span className="article-card-tag-dot" aria-hidden="true">•</span>
                    )}
                    <span className="article-card-tag article-card-tag--extra" tabIndex={0}>
                        +{extraCount}
                    </span>
                </>
            )}
        </div>
    );

    return (
        <a href={href} className='article-card' tabIndex={0}>

            {img && (
                <img
                    src={img}
                    alt={title}
                    className="article-card-image"
                />
            )}

            <div className="article-card-content">
                {isLarge ? (
                    <>
                        {formattedDate && (
                            <span className="article-card-date" tabIndex={0}>{formattedDate}</span>
                        )}
                        {tags.length > 0 && renderTags()}
                        <h2 className="article-card-title" tabIndex={0}>{title}</h2>
                    </>
                ) : (
                    <>
                        <div className="article-card-meta">
                            {tags.length > 0 && renderTags()}
                            {formattedDate && (
                                <span className="article-card-date" tabIndex={0}>{formattedDate}</span>
                            )}
                        </div>
                        <h2 className="article-card-title" tabIndex={0}>{title}</h2>
                    </>
                )}
            </div>
        </a>
    );
}