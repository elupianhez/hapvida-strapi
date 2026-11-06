import React from 'react';
import Home from './pages/home';

export default function AppComponent({configuration}) {
    const structureName = (configuration?.portletInstance?.structureName || "Global - Pesquisa");
    const configurationCategoryGroupName = (configuration?.portletInstance?.categoryName || "Pesquisa");


    return (
        <Home structureName={structureName} configurationCategoryGroupName={configurationCategoryGroupName} />
    );
}