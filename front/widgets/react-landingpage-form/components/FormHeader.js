import React from "react";

export function FormHeader({ headerText, formTitle }) {
    return (
        <div className="header-container">
            <p className="header-text" tabIndex={0}>
                {headerText}
            </p>

            <h1
                className="form-title"
                dangerouslySetInnerHTML={{ __html: formTitle }}
                tabIndex={0}
            />
        </div>
    );
}