import React from "react";

export default function CardItem({
  date,
  title,
  description,
  link = "#",
  isExternal = false,
  linkText = "Ler mais",
  categories = [],
}) {
  const [firstCategory, ...restCategories] = categories;

  return (
    <div className="card-blog mx-0 mx-md-3 my-3">
      <div className="card-blog__meta">
        <p className="card-blog__date" tabIndex={0}>{date}</p>

        {firstCategory && (
          <>
            <p className="card-blog__dot" aria-hidden="true" tabIndex={0}>
              •
            </p>
            <p className="card-blog__category" tabIndex={0}>{firstCategory}</p>
          </>
        )}

        {restCategories.length > 0 && (
          <>
            <p className="card-blog__dot" aria-hidden="true" tabIndex={0}>
              •
            </p>
            <p className="card-blog__category-more" tabIndex={0}>
              +{restCategories.length}
            </p>
          </>
        )}
      </div>

      <h3
        className="card-blog__title"
        tabIndex={0}
        data-asw-org-font-size="20"
        style={{ fontSize: "20px" }}
      >
        <p>{title}</p>
      </h3>

      <h4 className="card-blog__description" tabIndex={0}>
        <p>{description}</p>
      </h4>

      <div className="card-link">
        <a
          href={link}
          target={isExternal ? "_blank" : undefined}
          className="card-blog__link"
          tabIndex={0}
          aria-label={`${linkText}: ${title}`}
          data-asw-org-font-size="16"
          style={{ fontSize: "16px" }}
        >
          {linkText}
        </a>
      </div>
    </div>
  );
}