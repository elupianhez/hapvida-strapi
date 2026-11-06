import React, { useState, useEffect, useCallback, useRef } from "react";

import Icon from "react-shared-bundle/Icones";
import CheckboxList from "react-shared-bundle/CheckboxList";

import AcessibilidadeButton from "./AcessibilidadeButton";

export default function SidebarFiltros({
    filters,
    distanciasSelecionadas,
    setDistanciasSelecionadas,
    especSelecionadas,
    setEspecSelecionadas,
    activeAcessibilidade,
    setActiveAcessibilidade,
    handleFiltrarClick,
    visible,
    setVisible,
    setQuantidadeFiltros
    }) {
      const [isMobile, setIsMobile] = useState(false);
      const [isTablet, setIsTablet] = useState(false);
      const [limpar, setLimpar] = useState(false);
      const [overlayTop, setOverlayTop] = useState(0);
      const asideRef = useRef(null);

      const handleFiltrarFechar = () => {
          setQuantidadeFiltros(distanciasSelecionadas.length + especSelecionadas.length + activeAcessibilidade.length);
          handleFiltrarClick();
          setVisible(false);
      };

        const handleLimpar = () => {
            setDistanciasSelecionadas([]);
            setEspecSelecionadas([]);
            setActiveAcessibilidade([]);
            setLimpar(true);
        };

        useEffect(() => {
            if(limpar) {
                handleFiltrarFechar();
                setLimpar(false);
            }
          }, [limpar]);

      useEffect(() => {
            const handleResize = () => {
                const width = window.innerWidth;
                setIsMobile(width <= 743);
                setIsTablet(width >= 744 && width <= 1280);
            };

            handleResize();
            window.addEventListener("resize", handleResize);
            return () => {
              window.removeEventListener("resize", handleResize);
            };
          }, []);

      // calcula a distância do topo do viewport até o início do aside
      useEffect(() => {
        const recalc = () => {
          if (asideRef.current) {
            const rect = asideRef.current.getBoundingClientRect();
            setOverlayTop(620);
          }
        };
        if (isMobile && visible) {
          // mede logo após pintar
          setTimeout(recalc, 0);
          window.addEventListener("resize", recalc);
          window.addEventListener("orientationchange", recalc);
          document.body.classList.add("lock-scroll");
        } else {
          document.body.classList.remove("lock-scroll");
        }
        return () => {
          window.removeEventListener("resize", recalc);
          window.removeEventListener("orientationchange", recalc);
          document.body.classList.remove("lock-scroll");
        };
      }, [isMobile, visible]);

    const [especOpen, setEspecOpen] = useState(false);
    const [acessibilidadeOpen, setAcessibilidadeOpen] = useState(true);
    const [distanciaOpen, setDistanciaOpen] = useState(true);

    const handleChangeDistancia = (id) => {
        setDistanciasSelecionadas((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleChangeEspec = (id) => {
        setEspecSelecionadas((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const distancias = [
        { id: "5", label: "Até 5 km" },
        { id: "10", label: "Até 10 km" },
        { id: "20", label: "Até 20 km" },
        { id: "50", label: "Até 50 km" },
        { id: "100", label: "Até 100 km" },
      ];

    return (
      <>
        {(!(isMobile || isTablet) || visible) && (
          <aside ref={asideRef}
                    className={`col-12 col-lg-3 filtro-fundo border-right d-flex flex-column ${isMobile ? "overlay" : ""}`}
                    style={isMobile ? { minHeight: `calc(100vh - ${overlayTop}px)` } : undefined}
                  >

            {(isMobile || isTablet) && (
              <div className="filtro-voltar filtro-titulo-espacamento pb-3 filtro-voltar" onClick={() => setVisible(false)}>
                <svg id="arrow" xmlns="http://www.w3.org/2000/svg" width="13.09" height="13.09" viewBox="0 0 13.09 13.09">
                  <path id="arrow_back_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24" d="M163.129-792.637l4.581,4.581-1.166,1.145L160-793.455,166.545-800l1.166,1.145-4.581,4.581h9.961v1.636Z" transform="translate(-160 800)" fill="#fe4e06"/>
                </svg>
                <span className="pl-1 color-orange">Voltar</span>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3 filtro-titulo-espacamento">
              <span className="unidades-font-20 mb-0" tabIndex={0}>Filtros</span>
              <a href="#" onClick={handleLimpar} className="text-decoration-none text-muted small unidades-font-16" tabIndex={0}>
                Limpar filtros
              </a>
            </div>

            {/* Especialidades */}
            <div className="filtro-separador">
              <button
                className="btn btn-block text-left d-flex justify-content-between align-items-center p-0"
                type="button"
                aria-expanded={especOpen}
                aria-controls="collapseEspecialidades"
                onClick={() => setEspecOpen(v => !v)}
                onFocus={() => setEspecOpen(true)}
              >
                <div className="d-flex align-items-center">
                  <span className="font-weight-bold filtro-titulo mr-2">Especialidades</span>
                  {especSelecionadas.length > 0 && (
                    <span className="px-2 py-1 filtro-badge">
                      {especSelecionadas.length}
                    </span>
                  )}
                </div>
                <Icon.Seta up={especOpen} />
              </button>
              <div
                id="collapseEspecialidades"
                role="region"
                className={`collapse ${especOpen ? "show" : ""}`}
              >
                <div className="my-3 small text-muted checbox-size">
                  <CheckboxList
                    values={filters.especialidades}
                    selected={especSelecionadas}
                    onChange={handleChangeEspec}
                  />
                </div>
              </div>
            </div>

            {/* Acessibilidade */}
            <div className="filtro-separador">
              <button
                className="btn btn-block text-left d-flex justify-content-between align-items-center p-0"
                type="button"
                aria-expanded={acessibilidadeOpen}
                aria-controls="collapseAcessibilidade"
                onClick={() => setAcessibilidadeOpen(v => !v)}
                onFocus={() => setAcessibilidadeOpen(true)}
              >
                <div className="d-flex align-items-center">
                  <span className="font-weight-bold filtro-titulo mr-2">Acessibilidade</span>
                  {activeAcessibilidade.length > 0 && (
                    <span className="px-2 py-1 filtro-badge">
                      {activeAcessibilidade.length}
                    </span>
                  )}
                </div>
                <Icon.Seta up={acessibilidadeOpen} />
              </button>
              <div
                id="collapseAcessibilidade"
                role="region"
                className={`collapse ${acessibilidadeOpen ? "show" : ""}`}
              >
                <div className="d-flex flex-wrap mt-2">
                  <AcessibilidadeButton icone={Icon.RampaAcessivel} nome="Rampa Acessível" atributo="RAMPAACESSIVEL" activeAcessibilidade={activeAcessibilidade} setActiveAcessibilidade={setActiveAcessibilidade} />
                  <AcessibilidadeButton icone={Icon.PisoTatil} nome="Piso Tátil" atributo="PISOTATIL" activeAcessibilidade={activeAcessibilidade} setActiveAcessibilidade={setActiveAcessibilidade} />
                  <AcessibilidadeButton icone={Icon.Elevador} nome="Elevador" atributo="ELEVADOR" activeAcessibilidade={activeAcessibilidade} setActiveAcessibilidade={setActiveAcessibilidade} />
                  <AcessibilidadeButton icone={Icon.PontoOnibus} nome="Transporte Público" atributo="TransportePublico" activeAcessibilidade={activeAcessibilidade} setActiveAcessibilidade={setActiveAcessibilidade} />
                  <AcessibilidadeButton icone={Icon.BanheiroAcessivel} nome="Banheiro Acessível" atributo="BANHEIROACESSIVEL" activeAcessibilidade={activeAcessibilidade} setActiveAcessibilidade={setActiveAcessibilidade} />
                </div>
              </div>
            </div>

            {/* Distância */}
            <div className="filtro-separador">
              <button
                className="btn btn-block text-left d-flex justify-content-between align-items-center p-0"
                type="button"
                aria-expanded={distanciaOpen}
                aria-controls="collapseDistancia"
                onClick={() => setDistanciaOpen(v => !v)}
                onFocus={() => setDistanciaOpen(true)}
              >
                <div className="d-flex align-items-center">
                  <span className="font-weight-bold filtro-titulo mr-2">Distância</span>
                  {distanciasSelecionadas.length > 0 && (
                    <span className="px-2 py-1 filtro-badge">
                      {distanciasSelecionadas.length}
                    </span>
                  )}
                </div>
                <Icon.Seta up={distanciaOpen} />
              </button>
              <div
                id="collapseDistancia"
                role="region"
                className={`collapse ${distanciaOpen ? "show" : ""}`}
              >
                <div className="my-3 small text-muted">
                  <CheckboxList
                    values={distancias}
                    selected={distanciasSelecionadas}
                    onChange={handleChangeDistancia}
                  />
                </div>
              </div>
            </div>

            {/* Botão Aplicar */}
            <div className="mt-auto pt-3 border-top text-center mb-3">
              <button
                onClick={handleFiltrarFechar}
                type="button"
                className="btn filtro-btn"
              >
                Aplicar
              </button>
            </div>

          </aside>
        )}
      </>
    );
}