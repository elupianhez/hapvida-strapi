import React from "react";

export default function AcessibilidadeButton({
  nome,
  atributo,
  activeAcessibilidade,
  setActiveAcessibilidade,
  icone: IconComponent
}) {

    const onToggle = (e, atributo) => {
        e.preventDefault();
        setActiveAcessibilidade((prev) => {
            if (prev.includes(atributo)) {
                return prev.filter((item) => item !== atributo);
            } else {
                return [...prev, atributo];
            }
        });
    };

    return (
        <button
          type="button"
          onClick={(e) => onToggle(e, atributo)}
          className={`btn btn-sm mr-2 mt-3 d-flex align-items-center filtro-card ${
            activeAcessibilidade.includes(atributo) ? "filtro-btn-selected" : ""
          }`}
        >
            <IconComponent fill={activeAcessibilidade.includes(atributo) ? "#0435AC" : "#5b5b5f"} />
            <span
                className={`filtro-label pl-2 ${
                activeAcessibilidade.includes(atributo) ? "filtro-label-selected" : ""
                }`}>
                {nome}
            </span>
        </button>
    );
}