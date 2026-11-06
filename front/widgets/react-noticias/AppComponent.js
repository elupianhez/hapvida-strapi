import React, { useEffect, useState } from 'react';
import Home from './pages/home';

const DEFAULTS = {
    "hapvida": {
        structureName: "Artigos (Dicas Saúde / Noticias / Imprensa) - Global (atualizado)",
        vocabularyName: "Artigos",
        categoryName: "Notícia",
        configurationCategoryGroupName: "Noticias",
    }
};

export default function AppComponent({ configuration }) {
    const [defaults, setDefaults] = useState(DEFAULTS["hapvida"]);

    const structureName = (configuration?.portletInstance?.structureName || defaults.structureName).trim();
    const vocabularyName = (configuration?.portletInstance?.vocabularyName || defaults.vocabularyName).trim();
    const categoryName = (configuration?.portletInstance?.categoryName || defaults.categoryName).trim();
    const configurationCategoryGroupName = (configuration?.portletInstance?.configurationCategoryGroupName || defaults.configurationCategoryGroupName).trim();

    return (
        <Home
            structureName={structureName}
            categoryName={categoryName}
            vocabularyName={vocabularyName}
            configurationCategoryGroupName={configurationCategoryGroupName}
        />
    );
}