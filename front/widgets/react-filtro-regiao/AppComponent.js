import { siteAtual } from "react-shared-bundle/site";
import React, { useEffect, useState } from "react";
import FormFieldSelect from "react-shared-bundle/FormFieldSelect";
import api from "react-shared-bundle/endpoints";

async function fetchLocais(setLocais) {
    try {
        const companyId = siteAtual().empresa;
        const companyGroupId = siteAtual().codigoGlobal;
        const scopeGroupId = siteAtual().codigo;

        const response = await api("/api/unidades/filtros", {
            method: "POST",
            body: JSON.stringify({
                companyId,
                companyGroupId,
                scopeGroupId,
                nomeEstrutura: "Especialidades"
            }),
            headers: { "Content-Type": "application/json" }
        });

        const locais = [
            { id: "-1", label: "Todas as regiões" },
            ...(response.locais || [])
        ];
        setLocais(locais);
    } catch (err) {
        console.error("Erro ao buscar regiões", err);
        setLocais([{ id: "-1", label: "Todas as regiões" }]);
    }
}

export default function AppComponent() {
    const [locais, setLocais] = useState([]);
    const [regiaoSelecionada, setRegiaoSelecionada] = useState("-1");

    useEffect(() => {
        fetchLocais(setLocais);
    }, []);

    useEffect(() => {
        const handler = () => {
            setRegiaoSelecionada("-1");
        };
        window.addEventListener("regiao-filter-reset", handler);
        return () => window.removeEventListener("regiao-filter-reset", handler);
    }, []);

    const handleRegiaoChange = (e) => {
        const value = e.target.value;
        setRegiaoSelecionada(value);

        window.dispatchEvent(
            new CustomEvent("regiao-filter-change", {
                detail: { regiaoId: value }
            })
        );
    };

    return (
        <div className="filtro-regiao-wrapper">
            <div className="filter-select">
                <FormFieldSelect
                    name="regiao"
                    value={regiaoSelecionada}
                    onChange={handleRegiaoChange}
                    placeholder="Selecione a localização desejada"
                    options={locais.map(({ id, label }) => ({
                        value: id,
                        label,
                    }))}
                />
            </div>
        </div>
    );
}
