import React from "react";

import { getEstadoName } from "../utils/unitUtils";

function formatHorario(horario) {
    if (!horario) return null;
    if (Array.isArray(horario)) {
        const names = horario.map((h) => h.name || h.key).filter(Boolean);
        return names.length ? names.join(", ") : null;
    }
    return String(horario);
}

export default function UnidadeCard({ unidade }) {
    const estado = getEstadoName(unidade);
    const horario = formatHorario(unidade.horariosFuncionamento);

    return (
        <div className="card-canais">
            {estado && (
                <div className="card-estado" tabIndex={0}>
                    {estado}
                </div>
            )}
            <h6 className="card-unidade-title" tabIndex={0}>
                {unidade.nomeUnidade}
            </h6>
            {(unidade.enderecoUnidade || unidade.cepUnidade || horario) && (
                <div className="card-info-group">
                    {unidade.enderecoUnidade && (
                        <p className="card-info" tabIndex={0}>
                            <strong>Endereço:</strong> {unidade.enderecoUnidade}
                        </p>
                    )}
                    {unidade.cepUnidade && (
                        <p className="card-info" tabIndex={0}>
                            <strong>CEP:</strong> {unidade.cepUnidade}
                        </p>
                    )}
                    {horario && (
                        <p className="card-info" tabIndex={0}>
                            <strong>Horário:</strong> {horario}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
