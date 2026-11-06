let googleMapsPromise = null;

export function loadGoogleMaps({ apiKey, language = "pt-BR", region = "BR" } = {}) {
	if (window.google?.maps) return Promise.resolve(window.google.maps);

	if (googleMapsPromise) return googleMapsPromise;

	googleMapsPromise = new Promise((resolve, reject) => {
		const existing = document.getElementById("google-maps-script");
		if (existing) {
			const waitReady = () => {
				if (window.google?.maps) {
					resolve(window.google.maps);
				} else {
					const t0 = Date.now();
					const timer = setInterval(() => {
						if (window.google?.maps) {
							clearInterval(timer);
							resolve(window.google.maps);
						} else if (Date.now() - t0 > 8000) {
							clearInterval(timer);
							reject(new Error("Timeout aguardando google.maps"));
						}
					}, 50);
				}
			};
			if (!window.google?.maps) {
				existing.onload = () => {
					existing.onload = null;
					existing.onerror = null;
					waitReady();
				};
				existing.onerror = (e) => {
					existing.onload = null;
					existing.onerror = null;
					reject(e instanceof Error ? e : new Error("Falha ao carregar Google Maps"));
				};
			}
			waitReady();
			return;
		}

		const script = document.createElement("script");
		script.id = "google-maps-script";
		const params = new URLSearchParams({
            key: apiKey || "",
            libraries: "geometry",
        });
		script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
		script.async = true;
		script.defer = true;

		script.onload = () => {
			script.onload = null;
			script.onerror = null;
			if (window.google?.maps) {
				resolve(window.google.maps);
			} else {
				reject(new Error("google.maps não disponível após onload"));
			}
		};
		script.onerror = (e) => {
			script.onload = null;
			script.onerror = null;
			reject(e instanceof Error ? e : new Error("Erro ao carregar script do Google Maps"));
		};

		document.head.appendChild(script);
	});

	return googleMapsPromise;
}