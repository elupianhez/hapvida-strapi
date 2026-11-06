import React from "react";

export default function Loader({
  text = "Por favor, aguarde alguns instantes.",
  open = true,
}) {
  if (!open) return null;

  return (
    <div
      className="loader-overlay"
      role="alert"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando"
    >
      <div className="loader-content">
        <span className="loader-ring" aria-hidden="true" />
        <span className="loader-text">{text}</span>
      </div>
    </div>
  );
}