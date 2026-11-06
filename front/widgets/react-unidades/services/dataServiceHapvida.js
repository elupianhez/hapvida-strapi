import { siteAtual } from "react-shared-bundle/site";
import api from "react-shared-bundle/endpoints";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

const addDistanceToUnidade = (unidade, userLocation) => {
    if (!userLocation || !unidade.latitudeUnidade || !unidade.longitudeUnidade) {
        return { ...unidade, distance: Infinity };
    }
    const distance = calcularDistancia(
        userLocation.latitude,
        userLocation.longitude,
        unidade.latitudeUnidade,
        unidade.longitudeUnidade
    );
    return { ...unidade, distance: distance ?? Infinity };
};

const sortAndLimitByDistance = (unidades, limit = 30) =>
    unidades
        .filter((u) => typeof u.distance === "number")
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

const parseRegionName = (regionName) => {
    const [uf, cidade] = regionName.split(" - ").map((s) => s.trim());
    return `${cidade}, ${uf}, Brasil`;
};

const getSiteName = () => {
	try {
		return siteAtual().chave ? siteAtual().chave.replaceAll('-', '') : null;
	}
	catch (error) {
		console.error('Erro ao identificar site:', error);
		return null;
	}
};

const getLocationFromRegionName = async (regionName, googleMapsKey) => {
    if (!regionName || regionName === "Todas as regiões") return null;

    await loadGoogleMaps({ apiKey: googleMapsKey });

    const query = parseRegionName(regionName);

    return new Promise((resolve) => {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
            {
                address: query,
                componentRestrictions: { country: "BR" },
            },
            (results, status) => {
                if (status !== "OK" || !results?.[0]) {
                    console.warn("Geocoding sem resultado para:", query, status);
                    resolve(null);
                    return;
                }

                const location = results[0].geometry.location;
                resolve({
                    latitude: location.lat(),
                    longitude: location.lng(),
                });
            }
        );
    });
};

export async function fetchDataUnidades(setUnidades, setUnidadesOriginal, regionName, googleMapsKey) {
    let site;
    let userLocation;
    let resolvedLocation = null;

    try {
        [site, userLocation] = await Promise.all([
            getSiteName(),
            getCurrentLocation().catch(() => null)
        ]);
    } catch (err) {
        console.error("Erro ao inicializar fetchDataUnidades:", err);
        setUnidades([]);
        setUnidadesOriginal([]);
        return;
    }

    try {
        const { url, resolvedLocation: loc } = await buildUrl(
            site,
            userLocation,
            regionName,
            googleMapsKey
        );

        resolvedLocation = loc;

        const { items = [] } = await api(url, { headers: { "Content-Type": "application/json" } });

        setUnidades(
            sortAndLimitByDistance(items.map((u) => addDistanceToUnidade(u, resolvedLocation)))
        );
    } catch (err) {
        console.error("Erro ao buscar unidades próximas:", err);
        setUnidades([]);
    }

    fetchAllUnits(site)
        .then(({ items = [] }) => {
            const todasUnidades = items.map((u) => addDistanceToUnidade(u, resolvedLocation));

            if (!resolvedLocation) {
                setUnidades(sortAndLimitByDistance(todasUnidades));
            }

            setUnidadesOriginal(todasUnidades);
        })
        .catch((err) => {
            console.error("Erro ao buscar lista completa de unidades:", err);
            setUnidadesOriginal([]);
        });
}


const buildUrl = async (site, userLocation, regionName, googleMapsKey) => {
    const baseUrl = `/api/objetos/unidades?nestedFields=especialidades,taxonomyCategoryBriefs&pageSize=60&page=1`;

    const location = userLocation ?? (
        regionName ? await getLocationFromRegionName(regionName, googleMapsKey) : null
    );

    if (!location) return { url: baseUrl, resolvedLocation: null };

    const { latMin, latMax, lngMin, lngMax } = getBoundingBox(
        location.latitude,
        location.longitude,
        100
    );

    const filter = `sites/any(s:s eq '${site}') and latitudeUnidade ge ${latMin} and latitudeUnidade le ${latMax} and longitudeUnidade ge ${lngMin} and longitudeUnidade le ${lngMax}`;

    return {
        url: `${baseUrl}&filter=${encodeURIComponent(filter)}`,
        resolvedLocation: location
    };
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
    // Raio da Terra em km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return Math.ceil(distancia);
}

function getBoundingBox(lat, lng, raioKm) {
	const deltaLat = raioKm / 111;
	const deltaLng = raioKm / (111 * Math.cos(lat * Math.PI / 180));

	return {
		latMin: lat - deltaLat,
		latMax: lat + deltaLat,
		lngMin: lng - deltaLng,
		lngMax: lng + deltaLng
	};
}

export function getCurrentLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn("Localização não permitida ou falhou:", error);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            );
        } else {
            console.warn("Geolocation não suportado");
            resolve(null);
        }
    });
}

export async function fetchDataFilters(setFilters) {
    try {
        const companyId = siteAtual().empresa;
        const companyGroupId = siteAtual().codigoGlobal;
        const site = getSiteName();

        const response = await api("/api/unidades/filtros", {
            method: "POST",
            body: JSON.stringify({
                companyId,
                companyGroupId,
                site
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

         const addTodos = (array, label = "Todos") => [
              { id: "-1", label },
              ...(array || [])
            ];

        setFilters({
            especialidades: addTodos(response.especialidades, "Ver Todas"),
            tipos: addTodos(response.tipos, "Todos os tipos"),
            locais: addTodos(response.locais, "Todas as regiões")
        });
    } catch (err) {
        console.error("Erro ao buscar filtros", err);
        setFilters({});
    }
}

export async function fetchGoogleMapsKey() {
    try {
        const scopeGroupId = siteAtual().codigo;
        const response = await api(`/api/unidades/chave-mapa`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response.googleMapsKey;
    } catch (err) {
        console.error("Erro ao buscar filtros", err);
        return "";
    }
}

async function fetchAllUnits(site) {
	const filter = `sites/any(s:s eq '${site}')`
	const baseUrl = `/api/objetos/unidades?nestedFields=especialidades,taxonomyCategoryBriefs&pageSize=500&filter=${encodeURIComponent(filter)}`;

	const response = await api(`${baseUrl}&page=1`, {
		headers: {
			"Content-Type": "application/json"
		}
	});

	const totalPages = Math.ceil((response.totalCount || 0) / 500);

	if (totalPages <= 1) {
		return response;
	}

	const requests = [];

	for (let page = 2; page <= totalPages; page++) {
		requests.push(
			api(`${baseUrl}&page=${page}`, {
				headers: {
					"Content-Type": "application/json"
				}
			})
		);
	}

	const responses = await Promise.all(requests);

	responses.forEach((pageResponse) => {
		response.items = [...response.items, ...(pageResponse.items || [])];
	});

	return response;
}