import React from "react";
import { StateCityField } from "./StateCityField";
import { maskPhone, onlyDigits, onlyLetters } from "../utils/masks";

export function FormStepField({
    field,
    value,
    onChange,
    isLastStep,
    error,
    onBack,
    autoFocus,
}) {
    const isRequiredError = error?.type === "required";
    const fieldClassName = `form-step form-step-active${
        error ? " form-step-error" : ""
    }`;
    const labelId = `${field.id}-label`;

    const renderInput = () => {
        if (field.type === "stateCity") {
            return (
                <StateCityField
                    field={field}
                    value={value}
                    onChange={onChange}
                    hasError={Boolean(error)}
                    autoFocus={autoFocus}
                    labelledBy={labelId}
                />
            );
        }

        if (field.type === "select") {
            return (
                <select
                    id={field.id}
                    name={field.id}
                    className={error ? "input-error" : ""}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    aria-labelledby={labelId}
                    required
                >
                    <option value="">{field.placeholder}</option>
                    {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (field.type === "tel") {
            return (
                <input
                    id={field.id}
                    name={field.id}
                    type="tel"
                    inputMode="numeric"
                    className={error ? "input-error" : ""}
                    placeholder={field.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(maskPhone(e.target.value))}
                    autoFocus={autoFocus}
                    aria-labelledby={labelId}
                    required
                />
            );
        }

        if (field.id === "name") {
            return (
                <input
                    id={field.id}
                    name={field.id}
                    type="text"
                    className={error ? "input-error" : ""}
                    placeholder={field.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(onlyLetters(e.target.value))}
                    autoFocus={autoFocus}
                    aria-labelledby={labelId}
                    required
                />
            );
        }

        if (field.id === "planQuantityUsers") {
            return (
                <input
                    id={field.id}
                    name={field.id}
                    type="text"
                    inputMode="numeric"
                    className={error ? "input-error" : ""}
                    placeholder={field.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(onlyDigits(e.target.value))}
                    autoFocus={autoFocus}
                    aria-labelledby={labelId}
                    required
                />
            );
        }

        return (
            <input
                id={field.id}
                name={field.id}
                type={field.type}
                className={error ? "input-error" : ""}
                placeholder={field.placeholder}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                autoFocus={autoFocus}
                aria-labelledby={labelId}
                required
            />
        );
    };

    return (
        <div className={fieldClassName}>
            {onBack && (
                <button type="button" className="back-step-btn" onClick={onBack}>
                    &lt; Voltar
                </button>
            )}

            <h2 id={labelId} className={error ? "label-error" : ""}>
                {field.label}
                {isRequiredError && (
                    <span className="required-error-text"> (Campo obrigatório)</span>
                )}
            </h2>

            <div className="form-field">
                {renderInput()}

                <button type="submit" className="next-step-btn">
                    {isLastStep ? "Enviar" : "Avançar"}
                </button>
            </div>

            {error?.type === "invalid" && (
                <p className="form-field-error">{error.message}</p>
            )}
        </div>
    );
}