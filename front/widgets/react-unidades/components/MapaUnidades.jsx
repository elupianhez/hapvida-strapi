import React, { useEffect, useRef, useState } from "react";

import Loader from "react-shared-bundle/Loader";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

export default function MapaUnidades({ unidades = [], googleMapsKey = "" }) {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);

    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);

                await loadGoogleMaps({ apiKey: googleMapsKey });
                if (cancelled || !mapDivRef.current) return;

                const unidadesValidas = Array.isArray(unidades)
                    ? unidades.filter(
                        (u) =>
                            Number.isFinite(Number(u?.latitudeUnidade)) &&
                            Number.isFinite(Number(u?.longitudeUnidade))
                      )
                    : [];

                const center =
                    unidadesValidas.length > 0
                        ? {
                                lat: Number(unidadesValidas[0].latitudeUnidade),
                                lng: Number(unidadesValidas[0].longitudeUnidade),
                          }
                        : { lat: -23.55052, lng: -46.633308 };

                // cria/recria o mapa para “limpar” marcadores
                mapRef.current = new window.google.maps.Map(mapDivRef.current, {
                    zoom: 10,
                    center,
                });
                const map = mapRef.current;

                const bounds = new window.google.maps.LatLngBounds();

                if (unidadesValidas.length > 0) {
                    unidadesValidas.forEach((unidade) => {
                        const marker = new window.google.maps.Marker({
                            position: {
                                lat: Number(unidade.latitudeUnidade),
                                lng: Number(unidade.longitudeUnidade),
                            },
                            map,
                            title: unidade.nomeUnidade,
                            icon: "/temas/hapvida-theme/images/marker.svg",
                            id: unidade.id,
                        });
                        bounds.extend(marker.getPosition());

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `<div>
                                <h3 class="marker-title mb-3">${unidade.nomeUnidade ?? ""}</h3>
                                <p class="marker-text mb-0">${unidade.enderecoUnidade ?? ""}</p>
                                <p class="marker-text mb-0"><strong>Telefone:</strong> ${unidade.telefoneUnidade ?? ""}</p>
                                <a href="/unidades/${unidade.friendlyUrlPath ?? "#"}" class="marker-link unidade-active-link">Ver unidade</a>
                            </div>`,
                        });

                        marker.addListener("click", () => {
                            map.setZoom(13);
                            map.setCenter(marker.getPosition());
                            infoWindow.open({ anchor: marker, map, shouldFocus: false });
                        });
                    });

                    if (unidadesValidas.length === 1) {
                        map.setCenter(bounds.getCenter());
                        map.setZoom(14);
                    } else {
                        map.fitBounds(bounds);
                    }
                } else {
                    map.setZoom(10);
                    map.setCenter({ lat: -23.5505, lng: -46.6333 });
                }
            } catch (e) {
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [unidades, googleMapsKey]);

    return (
        <div>
            <Loader open={loading} />
            <div id="map" ref={mapDivRef} style={{ width: "100%", height: "595px" }} role="img" aria-label="Mapa de unidades"/>
        </div>
    );
}