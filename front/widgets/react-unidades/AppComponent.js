import React, { useState, useEffect, useCallback } from "react";

import TabelaDados from "./components/TabelaDados";
import { loadGoogleMaps } from "./utils/loadGoogleMaps";
import { fetchGoogleMapsKey } from "./services/dataServiceHapvida";

export default function AppComponent({ configuration }) {
    const regionName = configuration?.portletInstance?.regionName || "CE - Fortaleza";
    const [googleMapsKey, setGoogleMapsKey] = useState("");

    useEffect(() => {
        const init = async () => {
            const key = await fetchGoogleMapsKey();
            setGoogleMapsKey(key);
            await loadGoogleMaps({ apiKey: key });
        };

        init();
    }, []);

    return (
        <div className="">
            <TabelaDados
                regionName={regionName}
                googleMapsKey={googleMapsKey}
            />
        </div>
    );
}
