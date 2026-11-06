import React from "react";

export function StepIndicator({ steps, currentStep, formData, onStepClick }) {
    return (
        <div className="form-indicators">
            <p
                className="step-counter"
                tabIndex={0}
            >
                Passo {currentStep + 1} de {steps.length}
            </p>

            <div className="square-indicator">
                {steps.map((step, index) => {
                    let squareClass = "square-item";
                    const isFilled = Boolean(formData[step.id]);
                    const isActive = index === currentStep;
                    const isCompleted = isFilled && !isActive;
                    const isClickable = isFilled && !isActive;

                    if (isCompleted) {
                        squareClass += " square-completed";
                    }

                    if (isActive) {
                        squareClass += " square-active";
                    }

                    if (isClickable) {
                        squareClass += " square-clickable";
                    }

                    const status = isActive
                        ? "atual"
                        : isCompleted
                        ? "concluído"
                        : "pendente";

                    return (
                        <span
                            key={step.id}
                            className={squareClass}
                            role={isClickable ? "button" : undefined}
                            tabIndex={isClickable ? 0 : undefined}
                            aria-label={`${step.label} ${status}${
                                isClickable ? ", clique para navegar" : ""
                            }`}
                            onClick={
                                isClickable ? () => onStepClick(index) : undefined
                            }
                            onKeyDown={
                                isClickable
                                    ? (e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault();
                                              onStepClick(index);
                                          }
                                      }
                                    : undefined
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}