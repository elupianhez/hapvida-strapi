import React from "react";

export function SuccessMessage({ whatsappLink }) {
    return (
        <div className="success-message" tabIndex={0}>
            <span
                className="success-message-icon"
                title="Ícone de Sucesso"
                tabIndex={0}
            >
            </span>

            <div className="success-message-text">
                <span
                    className="success-title"
                    tabIndex={0}
                >
                        Obrigado!
                </span>
                <span
                    className="success-description"
                    tabIndex={0}
                >
                    Para continuar seu atendimento,{" "}
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="success-link"
                    >
                        <strong>clique aqui</strong>
                    </a>{" "}
                    e chame nossa equipe no WhatsApp.
                </span>
            </div>
        </div>
    );
}