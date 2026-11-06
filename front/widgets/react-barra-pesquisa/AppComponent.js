import React from "react";
import Home from './pages/home';

export default function AppComponent({ configuration }) {
	const minCaracteres = Number(configuration?.portletInstance?.minCaracteres || 0);
	const resetInstantaneo = configuration?.portletInstance?.resetInstantaneo !== "false";
	const PpoMode = configuration?.portletInstance?.PpoMode ? "PpoMode" : "";
	const PlaceholderText = configuration?.portletInstance?.placeholderText



	return (
        <Home minCaracteres={minCaracteres} resetInstantaneo={resetInstantaneo} PpoMode={PpoMode} PlaceholderText={PlaceholderText}/>
	);
}