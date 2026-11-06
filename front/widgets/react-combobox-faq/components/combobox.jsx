import React from "react";
import { CustomSelect } from "./CustomSelect";

export default function ComboBox({
    title = "",
    subtitle = "",
    categories = [],
    selected,
    onSelect,
    hasLink,
    linkText = "",
    link = "",
}) {
    const options = categories.map((category) => ({
        label: category,
        value: category,
    }));

    return (
        <div className="faq-combo-box">
            {title && (
                <h2 className="faq-combo-box__title" tabIndex={0}>
                    {title}
                </h2>
            )}

            {subtitle && (
                <p className="faq-combo-box__subtitle" tabIndex={0}>
                    {subtitle}
                </p>
            )}

            <CustomSelect
                id="faq-category-select"
                className="faq-combo-box__select"
                options={options}
                value={selected}
                onChange={onSelect}
                placeholder="Selecione uma categoria"
            />

        </div>
    );
}