import React, { useEffect, useState } from "react"
import Home from './pages/home';

const DEFAULTS = {
    "hapvida": {
        structureName: "Artigos (Dicas Saúde / Noticias / Imprensa) - Global (atualizado)",
        vocabularyName: "Artigos",
        categoryName: "Notícia",
        configurationCategoryGroupName: "Noticias",
    }
};

export default function AppComponent({configuration}) {
    const [defaults, setDefaults] = useState(DEFAULTS["hapvida"]);

    const structureName = (configuration?.portletInstance?.structureName || defaults.structureName).trim();
    const vocabularyName = (configuration?.portletInstance?.vocabularyName || "Artigos");
    const categoryName = (configuration?.portletInstance?.categoryName || "Blog da saúde");


    return (
        <Home
            structureName={structureName}
            categoryName={categoryName}
            vocabularyName={vocabularyName}
        />
    );
}