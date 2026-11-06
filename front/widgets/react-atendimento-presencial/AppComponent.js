import React from 'react';

import Home from "./pages/home";

export default function AppComponent({ configuration }) {
	const regionMode = configuration?.portletInstance?.regionMode || "default";
	const defaultRegion = configuration?.portletInstance?.defaultRegion || "";
	const nomeObject = configuration?.portletInstance?.nomeObject || "unidades";
	const categorias = configuration?.portletInstance?.categorias || "";

	return (
		<Home
			regionMode={regionMode}
			defaultRegion={defaultRegion}
			nomeObject={nomeObject}
			categorias={categorias}
		/>
	);
}
