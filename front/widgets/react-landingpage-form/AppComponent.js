import React, { useState, useEffect, useRef } from "react";
import { FormHeader } from "./components/FormHeader";
import { StepIndicator } from "./components/StepIndicator";
import { FormStepField } from "./components/FormStepField";
import { SuccessMessage } from "./components/SuccessMessage";
import { STEPS } from "./data/steps";
import { isValidEmail, isValidPhone } from "./utils/validators";

const LEAD_ENDPOINT = "/api/formularios/planium-lead";

function getEmptyValue(field) {
    if (field.type === "stateCity") return { uf: "", city: "" };
    return "";
}

function isFieldFilled(field, value) {
    if (field.type === "stateCity") {
        return Boolean(value && value.uf && value.city);
    }
    return Boolean(value && String(value).trim());
}

function getValidationError(field, value) {
    if (!isFieldFilled(field, value)) {
        return { type: "required", message: "Este campo é obrigatório." };
    }
    if (field.type === "tel" && !isValidPhone(value)) {
        return { type: "invalid", message: "Informe um telefone válido, com DDD." };
    }
    if (field.type === "email" && !isValidEmail(value)) {
        return { type: "invalid", message: "Informe um e-mail válido." };
    }
    return null;
}

function buildLeadPayload(formData, fixedData) {
    return {
        cliente_nome: formData.name || "",
        cliente_telefone: formData.phone || "",
        cliente_email: formData.email || "",
        potencial_vidas: Number(formData.planQuantityUsers || 0),
        cidadeID: formData.stateCity?.city || "",
        cidadeUf: formData.stateCity?.uf || "",
        campanhaID: Number(fixedData.numeroCampanha),
        cnpj_operadora: fixedData.cnpjOperadora,
        tipo_contratacao: fixedData.tipoContratacao,
        tipo_lead: Number(fixedData.tipoLead),
    };
}

async function submitLead(payload) {
    const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Falha ao enviar o formulário (status ${response.status})`);
    }

    return response.json().catch(() => null);
}

export default function AppComponent({ configuration }) {
    const headerText = (
        configuration?.portletInstance?.headerText ||
        "Planos de Saúde NotreDame"
    ).trim();

    const formTitle = (
        configuration?.portletInstance?.formTitle ||
        "Um plano de saúde que cuida de você <strong>antes mesmo de você precisar</strong>"
    ).trim();

    const whatsappLink = (
        configuration?.portletInstance?.whatsappLink ||
        "https://api.whatsapp.com/send/?phone=558000005059&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20planos%20da%20NotreDame%20Sa%C3%BAde.%20An%C3%Bancio:%202304"
    ).trim();

    const numeroCampanha = (
        configuration?.portletInstance?.numeroCampanha || "1904"
    ).trim();

    const cnpjOperadora = (
        configuration?.portletInstance?.cnpjOperadora || "44649812000138"
    ).trim();

    const tipoContratacao = (
        configuration?.portletInstance?.tipoContratacao || "pj"
    ).trim();

    const tipoLead = (
        configuration?.portletInstance?.tipoLead || "0"
    ).trim();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [currentValue, setCurrentValue] = useState(getEmptyValue(STEPS[0]));
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [autoFocusEnabled, setAutoFocusEnabled] = useState(false);
    const isInitialRender = useRef(true);

    const isLastStep = currentStep === STEPS.length - 1;
    const activeField = STEPS[currentStep];

    const handleChange = (newValue) => {
        setCurrentValue(newValue);
        if (error) setError(null);
    };

    const handleNext = async (e) => {
        e.preventDefault();

        const validationError = getValidationError(activeField, currentValue);
        if (validationError) {
            setError(validationError);
            return;
        }

        const updatedData = {
            ...formData,
            [activeField.id]: currentValue,
        };

        setFormData(updatedData);
        setError(null);

        if (isLastStep) {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                const payload = buildLeadPayload(updatedData, {
                    numeroCampanha,
                    cnpjOperadora,
                    tipoContratacao,
                    tipoLead,
                });
                await submitLead(payload);
                setIsSubmitted(true);
            } catch (err) {
                setSubmitError(
                    "Não foi possível enviar seus dados agora. Tente novamente."
                );
            } finally {
                setIsSubmitting(false);
            }
        } else {
            const nextStep = currentStep + 1;
            const nextField = STEPS[nextStep];
            setCurrentStep(nextStep);
            setCurrentValue(updatedData[nextField.id] ?? getEmptyValue(nextField));
        }
    };

    const handleStepClick = (index) => {
        const targetField = STEPS[index];
        const isFilled = isFieldFilled(targetField, formData[targetField.id]);

        if (!isFilled || index === currentStep) return;

        setCurrentStep(index);
        setCurrentValue(formData[targetField.id]);
        setError(null);
    };

    const handleBack = () => {
        if (currentStep === 0) return;

        const previousStep = currentStep - 1;
        const previousField = STEPS[previousStep];

        setCurrentStep(previousStep);
        setCurrentValue(formData[previousField.id] ?? getEmptyValue(previousField));
        setError(null);
    };

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        setAutoFocusEnabled(true);
    }, [currentStep]);

    return (
        <section className="form-landingpage">
            <div className="form-container">
                <FormHeader headerText={headerText} formTitle={formTitle} />

                {isSubmitted ? (
                    <SuccessMessage whatsappLink={whatsappLink} />
                ) : (
                    <form className="stepped-form" onSubmit={handleNext} noValidate>
                        <StepIndicator
                            steps={STEPS}
                            currentStep={currentStep}
                            formData={formData}
                            onStepClick={handleStepClick}
                        />

                        <FormStepField
                            field={activeField}
                            value={currentValue}
                            onChange={handleChange}
                            isLastStep={isLastStep}
                            error={error}
                            onBack={currentStep > 0 ? handleBack : null}
                            autoFocus={autoFocusEnabled}
                            isSubmitting={isSubmitting}
                        />

                        {submitError && (
                            <p className="form-submit-error">{submitError}</p>
                        )}
                    </form>
                )}

                {!isSubmitted && (
                    <div className="lgpd-data">
                        <span className="lgpd-data-icon" title="Ícone de Segurança"></span>
                        <span className="lgpd-data-text">
                            Seus dados são protegidos pela LGPD.
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}