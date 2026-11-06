import React, { useState, useEffect, useCallback } from "react";

import Loader from "react-shared-bundle/Loader";
import FormFieldSelect from "react-shared-bundle/FormFieldSelect";

import SidebarFiltros from "./SidebarFiltros";
import MapaUnidades from "./MapaUnidades";
import { fetchDataFilters, fetchDataUnidades, getCurrentLocation } from "../services/dataServiceHapvida";

export default function TabelaDados({regionName, googleMapsKey}) {

    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [unidades, setUnidades] = useState(null);
    const [unidadesOriginal, setUnidadesOriginal] = useState([]);
    const [form, setForm] = useState({});
    const [activeView, setActiveView] = useState("cards");
    const [filters, setFilters] = useState({
          especialidades: [],
          tipos: [],
          locais: []
        });
    const [distanciasSelecionadas, setDistanciasSelecionadas] = useState([]);
    const [especSelecionadas, setEspecSelecionadas] = useState([]);
    const [activeAcessibilidade, setActiveAcessibilidade] = useState([]);
    const [quantidadeFiltros, setQuantidadeFiltros] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
				fetchDataFilters(setFilters),
	            fetchDataUnidades(setUnidades, setUnidadesOriginal, regionName, googleMapsKey)
            ]);
        };
        fetchData();
    }, []);

	useEffect(() => {
        if (unidades !== null) {
            setLoading(false);
        }
    }, [unidades]);

    useEffect(() => {
      const handleResize = () => {
          const width = window.innerWidth;
          setIsMobile(width <= 743);
          setIsTablet(width >= 744 && width <= 1280);
          setIsDesktop(width >= 1281);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      if (!filters?.locais?.length || !unidadesOriginal?.length) return;
      const run = async () => {
        const location = await getCurrentLocation();
        if (!location) {
          const regiaoId = filters.locais.find(o => o.label === regionName)?.id;
          if (regiaoId != null) {
            setForm((prev) => {
              const newForm = { ...prev, regiao: regiaoId };
              filtrar(newForm, unidadesOriginal);
              return newForm;
            });
          }
        }
      };
      run();
    }, [filters?.locais, unidadesOriginal]);

    const handleFiltrarClick = () => {
        filtrar(form, unidadesOriginal);
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm((prev) => {
            const newForm = { ...prev, [field]: value };
            filtrar(newForm, unidadesOriginal);
            return newForm;
        });
    };

    const filtrar = (newForm, unidadesPesquisadas) => {
        let unidadesFiltradas = unidadesPesquisadas.filter((unidade) => {
            let passou = true;

            //filtro por distancia
            if (distanciasSelecionadas.length > 0) {
                const distancia = unidade.distance;
                const matchDistancia = distanciasSelecionadas.some((filtro) => {
                    const km = parseInt(filtro);
                    return distancia <= km;
                });
                if (!matchDistancia) passou = false;
            }

            //filtro por especialidades
            const temTodos = especSelecionadas.some(id => id === null || id === undefined || id === "");
            if (!temTodos && especSelecionadas.length > 0) {
                const idsEspecialidade = Array.isArray(unidade.especialidades)
                  ? unidade.especialidades.map(e => e.id)
                  : [];
                const matchEspec = especSelecionadas.some(id => idsEspecialidade.includes(Number(id)));
                if (!matchEspec) passou = false;
            }

            //filtro por acessibilidades
            if (activeAcessibilidade.length > 0) {
              const matchAcessibilidade = unidade?.acessibilidades?.some(a =>
              	activeAcessibilidade.includes(a.key)
              );
              if (!matchAcessibilidade) passou = false;
            }
            return passou;
        });

        const { regiao, unidade, ordenacao } = {...newForm};

        //Filtro por região
        if (regiao && regiao !== "-1") {
            unidadesFiltradas = unidadesFiltradas.filter((u) =>
            	Array.isArray(u.taxonomyCategoryBriefs) &&
            	u.taxonomyCategoryBriefs.some(
            		(c) => String(c.taxonomyCategoryId) === String(regiao)
            	)
            );
        }

        //Filtro por unidade
        if (unidade && unidade !== "-1") {
            unidadesFiltradas = unidadesFiltradas.filter((u) =>
            	Array.isArray(u.taxonomyCategoryBriefs) &&
            	u.taxonomyCategoryBriefs.some(
            		(c) => String(c.taxonomyCategoryId) === String(unidade)
            	)
            );
        }

        //ordena por distancia por padrao
        unidadesFiltradas.sort(
            (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );

        //Ordenação
        switch (ordenacao) {
            case "1":
                unidadesFiltradas.sort((a, b) => {
                    const countTrue = (u) =>
                        [
                            u.accessibility,
                            u.nearTheBusTerminal,
                            u.nearTheTrain,
                            u.elevator,
                            u.accessibleRamp,
                            u.accessibleBathroom,
                            u.tactilePaving
                        ].filter(Boolean).length;
                    return countTrue(b) - countTrue(a);
                    });
                break;
            case "2":
                unidadesFiltradas.sort(
                    (a, b) =>
                    (b.especialidades?.length || 0) -
                    (a.especialidades?.length || 0)
                );
                break;
          case "3":
                unidadesFiltradas.sort(
                    (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
                );
                break;
          case "4":
                unidadesFiltradas.sort(
                    (a, b) => (b.distance || -Infinity) - (a.distance || -Infinity)
                );
                break;
          default:
                break;
        }

        setUnidades(unidadesFiltradas.slice(0, 30));
        setActiveView("cards");
    }

    return (
        <div className="container-fluid">

            <Loader open={loading} />

            <div className="row">
                <SidebarFiltros
                    filters={filters}
                    distanciasSelecionadas={distanciasSelecionadas}
                    setDistanciasSelecionadas={setDistanciasSelecionadas}
                    especSelecionadas={especSelecionadas}
                    setEspecSelecionadas={setEspecSelecionadas}
                    activeAcessibilidade={activeAcessibilidade}
                    setActiveAcessibilidade={setActiveAcessibilidade}
                    handleFiltrarClick={handleFiltrarClick}
                    visible={visible}
                    setVisible={setVisible}
                    setQuantidadeFiltros={setQuantidadeFiltros}
                />
                {(!visible || isTablet || isDesktop) && (
                    <>
                        <main className={`col-12 col-lg-9 px-3 py-3 ${visible ? "with-aside" : "no-aside"} ${isTablet ? "ajuste-main-cards" : ""}`}>
                            <div className="my-4">
                                <span className="unidades-font-24" tabIndex={0}>Encontre uma unidade</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                                <div className="d-flex flex-wrap gap-2 unidades-top">
                                    <FormFieldSelect
                                        name="regiao"
                                        label=""
                                        value={form.regiao}
                                        onChange={handleChange("regiao")}
                                        classNameWrapper="form-select form-select-sm filtro-select"
                                        classInputNameWrapper="select-w330"
                                        placeholder="Selecione uma região"
                                        options={filters.locais.map(({ id, label }) => ({ value: id, label }))}
                                    />
                                    <FormFieldSelect
                                        name="unidade"
                                        label=""
                                        value={form.unidade}
                                        onChange={handleChange("unidade")}
                                        classNameWrapper="form-select form-select-sm filtro-select ml-5"
                                        classInputNameWrapper="select-w330"
                                        placeholder="Selecione um tipo"
                                        options={filters.tipos.map(({ id, label }) => ({ value: id, label }))}
                                        disabled={!form.regiao}
                                    />
                                </div>

                                <div className="unidades-view-toggle">
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveView("cards");
                                        }}
                                        tabIndex={0}
                                        className={`me-2 filtro-label filtro-border-right px-2 ${
                                            activeView === "cards" ? "unidade-active-link" : ""
                                        }`}>Ver Cards</a>
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveView("mapa");
                                        }}
                                        tabIndex={0}
                                        className={`me-2 filtro-label px-2 ${
                                            activeView === "mapa" ? "unidade-active-link" : ""
                                        }`}>Ver Mapa</a>
                                </div>
                            </div>


                            <div className="d-flex justify-content-between align-items-center flex-wrap my-4 unidades-font-16 unidades-filtros-bar">
                                {(isMobile || (isTablet && !visible)) && (
                                    <a className="filtros-link" href onClick={() => setVisible(true)}>
                                        <svg id="filtro" xmlns="http://www.w3.org/2000/svg" width="15.185" height="10.123" viewBox="0 0 15.185 10.123">
                                          <path id="filter_list_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24" d="M125.905-709.877v-1.687h3.374v1.687Zm-3.374-4.218v-1.687h10.123v1.687ZM120-718.313V-720h15.185v1.687Z" transform="translate(-120 720)"/>
                                        </svg>
                                        <span className="filtro-quantidade pl-1">{quantidadeFiltros > 0 ? quantidadeFiltros : ""} Filtros</span>
                                    </a>
                                )}
                                <div className="small text-muted unidades-font-16 unidades-quantidade-mobile" tabIndex={0}>Exibindo {unidades?.length} resultados</div>
                                {activeView == "cards" && (
                                    <FormFieldSelect
                                        name="ordenacao"
                                        label=""
                                        value={form.ordenacao}
                                        onChange={handleChange("ordenacao")}
                                        classNameWrapper="form-select form-select-sm filtro-select ordenar-por"
                                        placeholder="Ordenar por"
                                        options={[
                                            { value: "1", label: "Mais facilidades" },
                                            { value: "2", label: "Mais especialidades" },
                                            { value: "3", label: "Mais próximo" },
                                            { value: "4", label: "Mais distante" }
                                        ]}
                                    />
                                )}
                            </div>

                            {activeView == "cards" && (
                                <div>
                                    <div className="row g-3 card-unidades-box">
                                        {unidades?.map((unidade, index) => (
                                            <div key={index} className="col-md-6 col-lg-4 col-sm-6">
                                                <div className="card card-tamanho">
                                                    <div className="card-body">
                                                        <span className="py-2 card-distance" tabIndex={0}>{Number.isFinite(unidade?.distance) ? `${unidade.distance} km de você` : 'sem localização'}</span>
                                                        <a href={`/unidades/${unidade.friendlyUrlPath}`} tabIndex={0}>
                                                            <h6 className="card-title mb-5 mt-3" tabIndex={0}>{unidade.nomeUnidade}</h6>
                                                        </a>
                                                        <p className="mb-4 card-adress" tabIndex={0}>{unidade.enderecoUnidade}</p>
                                                        <a href={`/unidades/${unidade.friendlyUrlPath}`} className="card-link" tabIndex={0}>Ver unidade</a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {unidades?.length == 0 && (
                                        <div>
                                            <div className="unidades-font-cinza unidades-font-20" tabIndex={0}>Opa! Parece que não conseguimos encontrar nenhuma unidade :(</div>
                                            <div className="unidades-font-16 mt-2" tabIndex={0}>Que tal ajustar os filtros e <span className="unidade-active-link unidades-font-16-bold">tentar novamente?</span></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeView == "mapa" && (
                                <div>
                                    <MapaUnidades unidades={unidades} googleMapsKey={googleMapsKey}/>
                                </div>
                            )}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}