import React from 'react';
import Home from './pages/home';

export default function AppComponent({ configuration }) {
    const objectName = configuration?.portletInstance?.objectName || "faqs";
    const linkVoltarText = configuration?.portletInstance?.linkVoltarText || "< Voltar";
    const assuntosTitulo = configuration?.portletInstance?.assuntosTitulo || "Assuntos frequentes";
    const assuntosDescricao = configuration?.portletInstance?.assuntosDescricao || "";
    const emptyStateTitulo = configuration?.portletInstance?.emptyStateTitulo || "Não foram encontrados resultados para essa busca.";
    const emptyStateDescricao = configuration?.portletInstance?.emptyStateDescricao || "Por favor, altere as categorias selecionadas nos filtros.";

    return (
        <Home
            objectName={objectName}
            linkVoltarText={linkVoltarText}
            assuntosTitulo={assuntosTitulo}
            assuntosDescricao={assuntosDescricao}
            emptyStateTitulo={emptyStateTitulo}
            emptyStateDescricao={emptyStateDescricao}
        />
    );
}
