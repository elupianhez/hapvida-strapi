import { useEffect, useMemo, useState } from "react";

import { getPlanosByScope, getPlanosAssociados } from "../services/dataObjectService";
import { SECTION_CONFIG, COMPARE_TAB, isFilled } from "./sectionConfig";

export function usePlanBannerData(planName) {
    const [tipoPlano, setTipoPlano] = useState(null);
    const [planosAssociados, setPlanosAssociados] = useState([]);
    const [selectedPlanoId, setSelectedPlanoId] = useState("");
    const [activeTab, setActiveTab] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const tipoPlanos = await getPlanosByScope(planName);
                const tipo = tipoPlanos[0] || null;

                if (!isMounted) return;
                setTipoPlano(tipo);

                if (tipo) {
                    const associados = await getPlanosAssociados(tipo.id);

                    if (isMounted) {
                        setPlanosAssociados(associados);
                        setSelectedPlanoId("");
                    }
                }
            } catch (err) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [planName]);

    const planoDetalhe = useMemo(
        () =>
            planosAssociados.find(
                (p) => String(p.id) === String(selectedPlanoId)
            ) || null,
        [planosAssociados, selectedPlanoId]
    );

    const planoOptions = useMemo(
        () => [
            { value: "", label: "Selecione um plano" },
            ...planosAssociados.map((p) => ({
                value: String(p.id),
                label: p.nome,
            })),
        ],
        [planosAssociados]
    );

    const sections = useMemo(() => {
        if (!planoDetalhe) return [];

        return SECTION_CONFIG.filter((cfg) =>
            isFilled(planoDetalhe[cfg.key])
        ).map((cfg) => ({
            ...cfg,
            value: planoDetalhe[cfg.key],
        }));
    }, [planoDetalhe]);

    const allPossibleSections = useMemo(() => {
        return SECTION_CONFIG.filter((cfg) =>
            planosAssociados.some((plano) => isFilled(plano[cfg.key]))
        );
    }, [planosAssociados]);

    // Comparação só faz sentido com 2+ planos tendo benefícios preenchidos
    const canCompare = useMemo(
        () =>
            planosAssociados.filter((p) => isFilled(p.beneficios)).length > 1,
        [planosAssociados]
    );

    const tabsToRender = useMemo(() => {
        const base = planoDetalhe ? sections : allPossibleSections;
        return canCompare ? [...base, COMPARE_TAB] : base;
    }, [planoDetalhe, sections, allPossibleSections, canCompare]);

    useEffect(() => {
        setActiveTab(sections[0]?.key || null);
    }, [sections]);

    const currentSection = sections.find((s) => s.key === activeTab);

    return {
        tipoPlano,
        planosAssociados,
        planoOptions,
        planoDetalhe,
        selectedPlanoId,
        setSelectedPlanoId,
        tabsToRender,
        activeTab,
        setActiveTab,
        currentSection,
        loading,
        error,
    };
}