(function () {
    'use strict';
    if (window.__HAPVIDA_ANALYTICS_INITIALIZED__) {
        return;
    }
    window.__HAPVIDA_ANALYTICS_INITIALIZED__ = true;
    window.__HAPVIDA_ANALYTICS_VERSION__ = '2026-10-07-v4';
    var FLOW_NAME = 'hapvida-institucional';
    var DEBUG = false;
    var LOAD_GTM = true;
    var GTM_ID = 'GTM-PNDD2PZT';
    var SITE_VERIFICATION = '';
    function getExistingGtmScript() {
        var scripts = document.getElementsByTagName('script');

        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src || '';

            if (
                src.indexOf('googletagmanager.com/gtm.js') !== -1 &&
                src.indexOf('id=' + GTM_ID) !== -1
            ) {
                return scripts[i];
            }
        }

        return null;
    }

    function isGtmPresent() {
        var containers = window.google_tag_manager;

        if (containers && containers[GTM_ID]) {
            return true;
        }

        return !!getExistingGtmScript();
    }

    function loadGtm() {
        if (!LOAD_GTM || !document.head) {
            return;
        }

        if (isGtmPresent()) {
            debugLog({
                gtm: GTM_ID
            }, 'container ja presente');

            return;
        }

        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });

        var script = document.createElement('script');

        script.async = true;
        script.src =
            'https://www.googletagmanager.com/gtm.js?id=' +
            encodeURIComponent(GTM_ID);

        script.setAttribute(
            'data-hapvida-analytics-gtm',
            'true'
        );

        script.onload = function () {
            debugLog({
                gtm: GTM_ID
            }, 'container carregado');
        };

        script.onerror = function () {
            console.error(
                '[Hapvida Analytics] Falha ao carregar o GTM:',
                GTM_ID
            );
        };

        document.head.appendChild(script);

        debugLog({
            gtm: GTM_ID
        }, 'bootstrap inserido no head');
    }

    function cleanupBrokenGtmMarkup() {
        var scripts = document.querySelectorAll('script:not([src])');

        for (var i = 0; i < scripts.length; i++) {
            var content = scripts[i].textContent || '';

            if (
                content.indexOf(GTM_ID) !== -1 &&
                content.indexOf('(function(w,d,s,l,i)') !== -1 &&
                content.indexOf('googletagmanager.com/gtm.js') !== -1
            ) {
                if (scripts[i].parentNode) {
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
            }
        }

        var noscripts = document.querySelectorAll('noscript');

        for (var j = 0; j < noscripts.length; j++) {
            var noscriptContent =
                noscripts[j].textContent ||
                noscripts[j].innerHTML ||
                '';

            if (
                noscriptContent.indexOf(
                    'googletagmanager.com/ns.html?id=' + GTM_ID
                ) !== -1
            ) {
                if (noscripts[j].parentNode) {
                    noscripts[j].parentNode.removeChild(noscripts[j]);
                }
            }
        }
    }

    function injectSiteVerification() {
        if (!SITE_VERIFICATION) {
            return;
        }
        var meta = document.querySelector('meta[name="google-site-verification"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'google-site-verification';
            meta.content = SITE_VERIFICATION;
            document.head.appendChild(meta);
        } else {
            meta.content = SITE_VERIFICATION;
        }
    }
    function bootstrapGtm() {
        if (!LOAD_GTM) {
            injectSiteVerification();
            return;
        }

        loadGtm();
        injectSiteVerification();

        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                cleanupBrokenGtmMarkup,
                { once: true }
            );
        } else {
            cleanupBrokenGtmMarkup();
        }
    }
    var HEADER_SELECTOR = ['header', '#header', '[role="banner"]', '.base-header-dropzone'].join(',');
    var FOOTER_SELECTOR = ['footer', '#footer', '[role="contentinfo"]', '.novo-footer'].join(',');
    var CLICKABLE_SELECTOR = ['a', 'button', '[role="button"]', 'input[type="button"]', 'input[type="submit"]'].join(',');
    var FIELD_SELECTOR = ['input:not([type="button"]):not([type="submit"]):not([type="hidden"])', 'select', 'textarea'].join(',');
    var ACCORDION_SELECTOR = ['[data-toggle="collapse"]', '[data-bs-toggle="collapse"]', '[aria-expanded]', 'summary', '.accordion-button', '.panel-title a'].join(',');
    var NOT_ACCORDION_SELECTOR = ['[aria-haspopup]', '.primary-link', '.secondary-link', '.link-parent', '.nav-hamburger', '.hpv-search-btn', '.titulo-container'].join(',');
    var CONTAINER_SELECTOR = ['.fragment-entry-link', '[data-fragment-entry-link-id]', 'section', 'article', '.portlet', '.portlet-boundary'].join(',');
    var CHROME_SELECTOR = HEADER_SELECTOR + ',' + FOOTER_SELECTOR;
    var ANALYTICS_MAP = {
        pages: {
            '/': 'home',
            '/home': 'home',
            '/institucional/sobre-o-grupo': 'sobre-a-hapvida',
            '/sobre-o-grupo': 'sobre-a-hapvida',
            '/institucional/nosso-modelo': 'nosso-modelo',
            '/nosso-modelo': 'nosso-modelo',
            '/certificacoes-e-premios': 'certificacoes-e-premios',
            '/etica': 'etica',
            '/institucional/qualitotal': 'qualitotal',
            '/qualitotal': 'qualitotal',
            '/institucional/centro-de-pesquisa-clinica-hapvida': 'centro-de-pesquisa-clinica',
            '/centro-de-pesquisa-clinica-hapvida': 'centro-de-pesquisa-clinica',
            '/institucional/instituto-de-pesquisa': 'centro-de-pesquisa-clinica',
            '/comite-de-etica-em-pesquisa': 'comite-de-etica-em-pesquisa',
            '/sustentabilidade': 'sutentabilidade',
            '/imprensa': 'assessoria-de-imprensa',
            '/demonstrativos-financeiros': 'demonstrativos-financeiros',
            '/trabalhe-conosco': 'trabalhe-conosco',
            '/noticias': 'novidades',
            '/planos-de-saude-individuais': 'planos-de-saude-pessoa-fisica',
            '/planos-de-saude-empresariais': 'planos-de-saude-pessoa-juridica',
            '/planos-de-saude-micro-empresa': 'planos-de-saude-micro-empresa',
            '/maisodonto': 'hapvida+odonto',
            '/maisodonto/plano-odonto-empresarial-individual': 'planos-de-odonto-planos-odontologicos',
            '/maisodonto/institucional/sobre-mais-odonto': 'hapvida+odonto',
            '/boas-vindas': 'boas-vindas',
            '/agendamento': 'agendamento',
            '/aplicativo': 'aplicativo',
            '/segunda-via-de-boletos': 'segunda-via-de-boletos',
            '/teleconsulta': 'teleconsulta',
            '/linha-de-cuidado-em-endometriose': 'linha-de-cuidado-em-endometriose',
            '/cuidado-em-saude-mental': 'cuidado-em-saude-mental',
            '/clube-de-vantagens': 'clube-de-vantagens',
            '/blog-da-saude': 'blog-da-saude',
            '/qualivida': 'qualivida',
            '/saude-da-mulher': 'saude-da-mulher',
            '/unidades': 'unidades',
            '/canais-de-atendimento-presencial': 'canais-de-atendimento-presencial',
            '/atendimento/saude': 'canais-de-atendimento',
            '/atendimento/perguntas-frequentes': 'duvidas-frequentes',
            '/ouvidoria': 'ouvidoria',
            '/canaldedenuncias': 'canal-de-denuncias',
            '/informacoes-regulatorias': 'informacoes-regulatorias',
            '/portal-da-privacidade': 'portal-da-privacidade',
            '/beneficiario': 'beneficiario',
            '/empresas': 'empresa',
            '/empresa': 'empresa',
            '/prestador': 'prestador',
            '/corretor': 'corretor',
            '/fornecedor': 'fornecedor',
            '/seja-cliente': 'seja-cliente'
        },
        pagePrefixes: {
            '/noticias/': 'novidades',
            '/blog-da-saude/': 'blog-da-saude',
            '/institucional/': undefined,
            '/maisodonto/': 'hapvida+odonto'
        },
        areas: {
            'confira nossas unidades': 'confira-nossas-unidades',
            'mais facilidade no pagamento': 'mais-facilidade-no-pagamento',
            'planos de saude para sua familia': 'planos-de-saude-para-sua-familia',
            'clube de vantagens': 'clube-de-vantagens',
            teleconsulta: 'teleconsulta',
            qualivida: 'qualivida',
            'conheca hapvida diagnostico': 'conheca-hapvida-diagnostico',
            noticias: 'noticias',
            'tudo o que voce precisa para cuidar da sua saude': 'planos-de-saude-para-sua-familia',
            'muito mais do que um plano de saude': 'beneficios-para-cuidar-de-voce',
            'beneficios para cuidar de voce todos os dias': 'beneficios-para-cuidar-de-voce',
            'encontre o plano ideal para cuidar de quem importa': 'confira-nossos-planos',
            'cuidado de verdade': 'cuidado-de-verdade',
            'em todos os momentos da sua vida': 'cuidado-de-verdade',
            'ficou com alguma duvida': 'ficou-com-alguma-duvida',
            'planos de saude para voce': 'planos-de-saude-para-sua-familia',
            'planos de saude para sua familia ou seu negocio': 'planos-de-saude-para-sua-familia',
            'saude bucal acessivel para todos': 'planos-de-odonto',
            'confira nossos planos': 'confira-nossos-planos',
            'informacoes regulatorias': 'informacoes-regulatorias',
            'programa qualitotal': 'programa-qualitotal',
            'servicos e certificacoes em saude': 'servicos-e-certificacoes-em-saude',
            'demonstracao financeira hapvida saude 2025': 'demonstracao-financeira-hapvida-saude-2025',
            'homologacao de avaliadores': 'servicos-e-certificacoes-em-saude',
            'nosso compromisso cientifico': 'nosso-compromisso-cientifico',
            'duvidas frequentes': 'duvidas-frequentes',
            'conheca o plano de saude individual': 'conheca-o-plano-de-saude-individual',
            'escolha um plano pra voce e sua familia': 'escolha-um-plano-pra-voce-e-sua-familia',
            'conheca os beneficios': 'conheca-os-beneficios',
            '2 via de boleto': '2-via-de-boleto',
            '2 via de boletos': '2-via-de-boleto',
            'emissao de boletos': 'emissao-de-boletos',
            'boletos para empresa': 'boletos-para-empresa',
            aplicativo: 'aplicativo',
            'saiba como instalar': 'saiba-como-instalar',
            'portal teleconsulta': 'portal-teleconsulta',
            'consultas e exames': 'consultas-e-exames',
            'guia medico': 'guia-medico',
            'um cuidado continuo': 'um-cuidado-continuo',
            'transformando dor em qualidade de vida': 'transformando-dor-em-qualidade-de-vida',
            'nosso beneficiario': 'nosso-beneficiario',
            'acessos rapidos': 'acessos-rapidos',
            'nossos servicos para voce': 'nossos-servicos-para-voce',
            'area do beneficiario': 'area-do-beneficiario',
            servicos: 'servicos'
        },
        ctas: {
            logo: 'logo',
            'logo hapvida': 'logo',
            acessibilidade: 'acessibilidade',
            'abrir recursos de acessibilidade': 'acessibilidade',
            buscar: 'buscar',
            'abrir busca': 'buscar',
            'fechar busca': 'fechar-busca',
            submeter: 'buscar',
            limpar: 'limpar-busca',
            'barra de busca': 'barra-de-busca',
            'abrir menu': 'abrir-menu',
            'faca sua cotacao': 'faca-sua-cotacao',
            'para beneficiarios': 'para-beneficiarios',
            'servicos rapidos': 'servicos-rapidos',
            destaques: 'destaques',
            servicos: 'servicos',
            'acessos rapidos': 'acessos-rapidos',
            'politicas e termos': 'politicas-e-termos',
            'conheca a hapvida': 'conheca-a-hapvida',
            'sobre a hapvida': 'sobre-a-hapvida',
            'nosso modelo': 'nosso-modelo',
            'certificacoes e premios': 'certificacoes-e-premios',
            etica: 'etica',
            qualitotal: 'qualitotal',
            'centro de pesquisa clinica': 'centro-de-pesquisa-clinica',
            'comite de etica em pesquisa': 'comite-de-etica-em-pesquisa',
            sustentabilidade: 'sutentabilidade',
            'assessoria de imprensa': 'assessoria-de-imprensa',
            'demonstrativos financeiros': 'demonstrativos-financeiros',
            'trabalhe conosco': 'trabalhe-conosco',
            novidades: 'novidades',
            'hapvida odonto': 'hapvida+odonto',
            'hapvida mais odonto': 'hapvida+odonto',
            'nossos planos': 'nossos-planos',
            'planos de saude': 'planos-de-saude',
            'planos pessoa fisica': 'planos-de-saude-individuais',
            'planos pessoa juridica': 'planos-de-saude-empresariais',
            'planos micro empresa': 'planos-de-saude-micro-empresa',
            'planos de odonto': 'planos-de-odonto',
            'planos odontologicos': 'planos-odontologicos',
            'planos de saude empresariais': 'planos-de-saude-empresariais',
            'planos de saude individuais': 'planos-de-saude-individuais',
            'planos individual e familiar': 'planos-de-saude-individuais',
            'planos empresariais': 'planos-de-saude-empresariais',
            'conheca os planos de saude': 'conheca-os-planos-de-saude',
            'nossas unidades': 'nossas-unidades',
            'boas vindas': 'boas-vindas',
            'agendamento de consultas e exames': 'agendamento-de-consultas-e-exames',
            'rede de atendimento': 'rede-de-atendimento',
            'rede de atendimento odonto': 'rede-de-atendimento-odonto',
            'central de servicos': 'central-de-servicos',
            portabilidade: 'portabilidade',
            aplicativo: 'aplicativo',
            'canais de atendimento presencial': 'canais-de-atendimento-presencial',
            'canais de atendimento saude': 'canais-de-atendimento-saude',
            'canais de atendimento': 'canais-de-atendimento',
            '2 via de boletos': '2-via-de-boletos',
            '2 via de boleto': '2-via-de-boleto',
            'resultados de exames': 'resultado-de-exame',
            'resultado de exame': 'resultado-de-exame',
            'solicitar autorizacao de procedimento': 'solicitar-autorizacao',
            'solicitar autorizacao': 'solicitar-autorizacao',
            teleconsulta: 'teleconsulta',
            'negociacao de dividas': 'negociacao-de-dividas',
            'imposto de renda': 'imposto-de-renda',
            'consultas e exames': 'consultas-e-exames',
            'linha de cuidado em endometriose': 'linha-de-cuidado-em-endometriose',
            'cuidado em saude mental': 'cuidado-em-saude-mental',
            'clube de vantagens': 'clube-de-vantagens',
            'blog da saude': 'blog-da-saude',
            'programa qualivida': 'programa-qualivida',
            qualivida: 'qualivida',
            'saude da mulher': 'saude-da-mulher',
            ouvidoria: 'ouvidoria',
            'duvidas frequentes': 'duvidas-frequentes',
            'canal de denuncias': 'canal-de-denuncias',
            'politica da qualidade': 'politica-da-qualidade',
            'acesse sua area': 'acesse-sua-area',
            beneficiario: 'beneficiario',
            empresa: 'empresa',
            empresas: 'empresa',
            prestador: 'prestador',
            corretor: 'corretor',
            fornecedor: 'fornecedor',
            'seja cliente': 'seja-cliente',
            'area logada': 'area-logada',
            'area do beneficiario': 'area-do-beneficiario',
            todos: 'todos',
            financeiro: 'financeiro',
            suporte: 'suporte',
            consultas: 'consultas',
            'consultas reajuste de contrato': 'consultas-reajuste-de-contrato',
            'declaracao de quitacao anual': 'declaracao-de-quitacao-anual',
            'sou pessoa fisica': 'sou-pessoa-fisica',
            'sou pessoa juridica': 'sou-pessoa-juridica',
            'contrate agora': 'contrate-agora',
            'contratar agora': 'contrate-agora',
            participar: 'participar',
            conheca: 'conheca',
            consultar: 'consultar',
            'saiba mais': 'saiba-mais',
            'simule seu orcamento': 'simule-seu-orcamento',
            'solicitar cotacao': 'solicitar-cotacao',
            'baixar fatura': 'baixar-fatura',
            'baixar pdf': 'baixar-pdf',
            'conheca o aplicativo': 'conheca-o-aplicativo',
            'acessar portal': 'acessar-portal',
            'agendar consulta': 'agendar-consulta',
            'agendar uma consulta': 'agendar-uma-consulta',
            'consultar guia medico': 'consultar-guia-medico',
            'assistir videos': 'assistir-videos',
            'boleto individual': 'boleto-individual',
            'boleto empresarial': 'boleto-empresarial',
            'codigo de conduta': 'codigo-de-conduta',
            'confira codigo de conduta': 'confira-codigo-de-conduta',
            'politicas e normativas': 'politicas-e-normativas',
            'acesse portal da transparencia': 'acesse-portal-da-transparencia',
            'acesse o questionario de autoavaliacao': 'acesse-o-questionario-de-autoavaliacao',
            'conhecer pesquisas': 'conhecer-pesquisas',
            'envie solicitacao': 'envie-solicitacao',
            'historico de demonstracoes': 'historico-de-demonstracoes',
            'historico de relatorios': 'historico-de-relatorios',
            'indicadores economico financeiros': 'indicadores-economico-financeiros',
            'confira nossas oportunidades': 'confira-nossas-oportunidades',
            'portal da privacidade': 'portal-da-privacidade',
            'informacoes regulatorias': 'informacoes-regulatorias',
            investidores: 'investidores',
            'app store': 'app-store',
            'google play': 'google-play',
            enviar: 'enviar'
        },
        hrefCtas: [{
            pattern: /apps\.apple\.com|itunes\.apple\.com/i,
            label: 'app-store'
        }, {
            pattern: /play\.google\.com/i,
            label: 'google-play'
        }, {
            pattern: /instagram\.com/i,
            label: 'instagram'
        }, {
            pattern: /tiktok\.com/i,
            label: 'tiktok'
        }, {
            pattern: /youtube\.com/i,
            label: 'youtube'
        }, {
            pattern: /linkedin\.com/i,
            label: 'linkedin'
        }, {
            pattern: /ri\.hapvida\.com\.br/i,
            label: 'investidores'
        }, {
            pattern: /clube\.hapvida\.com\.br/i,
            label: 'clube-de-vantagens'
        }, {
            pattern: /resultadoexame\.hapvida\.com\.br/i,
            label: 'resultado-de-exame'
        }, {
            pattern: /portal-beneficiario\.hapvida\.com\.br/i,
            label: 'solicitar-autorizacao'
        }, {
            pattern: /cafex\.hapvida\.com\.br\/sigo\/portabilidade/i,
            label: 'portabilidade'
        }, {
            pattern: /cafex\.hapvida\.com\.br\/sigo\/linha-frente/i,
            label: 'central-de-servicos'
        }, {
            pattern: /\/perguntas-frequentes(?:[/?#]|$)/i,
            label: 'duvidas-frequentes'
        }, {
            pattern: /\/segunda-via-de-boletos(?:[/?#]|$)/i,
            label: '2-via-de-boletos'
        }, {
            pattern: /\/seja-cliente(?:[/?#]|$)/i,
            label: 'faca-sua-cotacao'
        }],
        specialAreas: [{
            page: '*',
            selector: HEADER_SELECTOR,
            area: undefined
        }, {
            page: '*',
            selector: FOOTER_SELECTOR,
            area: undefined
        }],
        fields: {
            'nome completo': 'nome-completo',
            nome: 'nome',
            email: 'email',
            'e mail': 'email',
            'e mail corporativo': 'e-mail-corporativo',
            telefone: 'telefone',
            celular: 'celular',
            whatsapp: 'whatsapp',
            cnpj: 'cnpj',
            cpf: 'cpf',
            'quantas vidas vao utilizar': 'quantas-vidas-vao-utilizar',
            'quantas vidas': 'quantas-vidas-vao-utilizar',
            uf: 'uf',
            estado: 'uf',
            cidade: 'cidade',
            cep: 'cep',
            'data de nascimento': 'data-de-nascimento',
            mensagem: 'mensagem',
            assunto: 'assunto'
        }
    };
    function normalizeText(value) {
        if (value === undefined || value === null) {
            return '';
        }
        return String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ª/g, 'a').replace(/[º°]/g, 'o').replace(/&/g, ' e ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    }
    function sanitize(value) {
        var normalized = normalizeText(value);
        if (!normalized) {
            return undefined;
        }
        return normalized.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || undefined;
    }
    function sanitizeError(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        return String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-') || undefined;
    }
    var SORTED_KEYS_CACHE = [];
    function getSortedKeys(map) {
        for (var i = 0; i < SORTED_KEYS_CACHE.length; i++) {
            if (SORTED_KEYS_CACHE[i].map === map) {
                return SORTED_KEYS_CACHE[i].keys;
            }
        }
        var keys = Object.keys(map).sort(function (a, b) {
            return b.length - a.length;
        });
        SORTED_KEYS_CACHE.push({
            map: map,
            keys: keys
        });
        return keys;
    }
    function getDataLayer() {
        window.dataLayer = window.dataLayer || [];
        return window.dataLayer;
    }
    function debugLog(payload, context) {
        if (!DEBUG) {
            return;
        }
        console.log('[Hapvida Analytics]', payload, context || '');
    }
    function pushDataLayer(payload, context) {
        getDataLayer().push(payload);
        debugLog(payload, context);
    }
    function matches(element, selector) {
        if (!element || typeof element.matches !== 'function') {
            return false;
        }
        try {
            return element.matches(selector);
        } catch (error) {
            return false;
        }
    }
    function closest(element, selector) {
        if (!element || typeof element.closest !== 'function') {
            return null;
        }
        try {
            return element.closest(selector);
        } catch (error) {
            return null;
        }
    }
    function cleanPathname() {
        var path = window.location.pathname || '/';
        try {
            path = decodeURIComponent(path);
        } catch (error) { }
        path = path.replace(/\/+/g, '/').replace(/\/$/, '');
        if (!path) {
            path = '/';
        }
        path = path.replace(/^\/(?:web|group)\/[^/]+(?=\/|$)/i, '');
        path = path.replace(/^\/(?:en|es|pt-br)(?=\/|$)/i, '');
        if (!path) {
            path = '/';
        }
        return path.toLowerCase();
    }
    function findMappedPage(path) {
        if (ANALYTICS_MAP.pages[path]) {
            return ANALYTICS_MAP.pages[path];
        }
        var keys = getSortedKeys(ANALYTICS_MAP.pages);
        var i;
        for (i = 0; i < keys.length; i++) {
            var route = keys[i];
            if (route !== '/' && (path === route || path.endsWith(route))) {
                return ANALYTICS_MAP.pages[route];
            }
        }
        var prefixes = getSortedKeys(ANALYTICS_MAP.pagePrefixes);
        for (i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            if (path.indexOf(prefix) === 0) {
                return ANALYTICS_MAP.pagePrefixes[prefix];
            }
        }
        return undefined;
    }
    function getPageSection() {
        var path = cleanPathname();
        var mapped = findMappedPage(path);
        if (mapped) {
            return mapped;
        }
        var segments = path.split('/').filter(Boolean);
        if (!segments.length) {
            return 'home';
        }
        return sanitize(segments[segments.length - 1]);
    }
    function getElementType(element) {
        if (!element) {
            return undefined;
        }
        if (closest(element, HEADER_SELECTOR)) {
            return 'header';
        }
        if (closest(element, FOOTER_SELECTOR)) {
            return 'footer';
        }
        return 'botao';
    }
    function findMappedValue(text, map) {
        var normalized = normalizeText(text);
        if (!normalized) {
            return undefined;
        }
        if (map[normalized]) {
            return map[normalized];
        }
        var keys = getSortedKeys(map);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (normalized === key || normalized.indexOf(key) !== -1) {
                return map[key];
            }
        }
        return undefined;
    }
    function getSpecialArea(element) {
        var page = getPageSection();
        var rules = ANALYTICS_MAP.specialAreas || [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.page !== '*' && rule.page !== page) {
                continue;
            }
            if (closest(element, rule.selector)) {
                return {
                    area: rule.area
                };
            }
        }
        return undefined;
    }
    function getFragmentContainer(element) {
        return closest(element, CONTAINER_SELECTOR);
    }
    function collectCandidateHeadings(element) {
        var candidates = [];
        var current = element;
        var limit = 0;
        while (current && current !== document.body && limit < 12) {
            if (matches(current, CONTAINER_SELECTOR)) {
                var headings = current.querySelectorAll('h1, h2, h3, h4, h5, h6');
                for (var i = 0; i < headings.length; i++) {
                    var headingText = headings[i].innerText || headings[i].textContent;
                    if (headingText) {
                        candidates.push(headingText);
                    }
                }
                if (candidates.length) {
                    break;
                }
            }
            current = current.parentElement;
            limit++;
        }
        return candidates;
    }
    function findNearestSingleHeading(element) {
        if (!element) {
            return undefined;
        }
        var current = element.parentElement;
        var limit = 0;
        while (current && current !== document.body && current !== document.documentElement && limit < 16) {
            if (matches(current, CHROME_SELECTOR)) {
                return undefined;
            }
            if (current.querySelectorAll) {
                var headings = current.querySelectorAll('h1, h2, h3, h4, h5, h6');
                if (headings.length === 1) {
                    var headingText = headings[0].innerText || headings[0].textContent;
                    if (normalizeText(headingText)) {
                        return headingText;
                    }
                }
            }
            current = current.parentElement;
            limit++;
        }
        return undefined;
    }
    function findNearestMappedArea(element) {
        if (!element) {
            return undefined;
        }
        var current = element.parentElement;
        var limit = 0;
        while (current && current !== document.body && current !== document.documentElement && limit < 18) {
            if (matches(current, CHROME_SELECTOR)) {
                return undefined;
            }
            if (current.querySelectorAll) {
                var headings = current.querySelectorAll('h1, h2, h3, h4, h5, h6');
                var found = {};
                var matchCount = 0;
                var onlyMatch;
                for (var i = 0; i < headings.length; i++) {
                    var headingText = headings[i].innerText || headings[i].textContent;
                    var mappedHeading = findMappedValue(headingText, ANALYTICS_MAP.areas);
                    if (mappedHeading && !found[mappedHeading]) {
                        found[mappedHeading] = true;
                        onlyMatch = mappedHeading;
                        matchCount++;
                    }
                }
                if (matchCount === 1) {
                    return onlyMatch;
                }
            }
            current = current.parentElement;
            limit++;
        }
        return undefined;
    }
    function getPageSpecificAreaName(element, page, ctaLabel) {
        var heading = findNearestSingleHeading(element);
        var normalizedHeading = normalizeText(heading);
        if (page === 'novidades' || page === 'blog-da-saude') {
            if (normalizedHeading) {
                return sanitize(heading);
            }
        }
        if (page === 'segunda-via-de-boletos') {
            if (ctaLabel === 'boleto-individual' || normalizedHeading.indexOf('beneficiario') !== -1) {
                return 'emissao-de-boletos';
            }
            if (ctaLabel === 'boleto-empresarial' || normalizedHeading.indexOf('empresa') !== -1) {
                return 'boletos-para-empresa';
            }
        }
        if (page === 'unidades') {
            return 'confira-nossas-unidades';
        }
        return undefined;
    }
    function getAreaName(element, ctaLabel) {
        if (!element) {
            return undefined;
        }
        var special = getSpecialArea(element);
        if (special) {
            return special.area;
        }
        var page = getPageSection();
        var pageSpecificArea = getPageSpecificAreaName(element, page, ctaLabel);
        if (pageSpecificArea) {
            return pageSpecificArea;
        }
        var nearestMappedArea = findNearestMappedArea(element);
        if (nearestMappedArea) {
            return nearestMappedArea;
        }
        var headings = collectCandidateHeadings(element);
        for (var i = 0; i < headings.length; i++) {
            var mapped = findMappedValue(headings[i], ANALYTICS_MAP.areas);
            if (mapped) {
                return mapped;
            }
        }
        var fragment = getFragmentContainer(element);
        if (fragment) {
            var fragmentText = fragment.innerText || fragment.textContent;
            var mappedFragment = findMappedValue(fragmentText, ANALYTICS_MAP.areas);
            if (mappedFragment) {
                return mappedFragment;
            }
        }
        var fallbackHeading = findNearestSingleHeading(element);
        if (fallbackHeading) {
            return sanitize(fallbackHeading);
        }
        return undefined;
    }
    function getHref(element) {
        if (!element || !element.getAttribute) {
            return '';
        }
        return element.getAttribute('href') || '';
    }
    function getHrefCtaLabel(element) {
        var href = getHref(element);
        if (!href) {
            return undefined;
        }
        var rules = ANALYTICS_MAP.hrefCtas || [];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].pattern.test(href)) {
                return rules[i].label;
            }
        }
        return undefined;
    }
    function isGenericCtaSource(value) {
        var normalized = normalizeText(value);
        if (!normalized) {
            return true;
        }
        return normalized === 'descricao padrao' || normalized === 'texto padrao' || normalized === 'default alt' || normalized === 'descricao' || normalized === 'coloque aqui o texto descritivo' || normalized === 'imagem desktop' || normalized === 'imagem tablet' || normalized === 'imagem mobile' || normalized === 'logo' || normalized === 'imagem' || normalized === 'image' || normalized === 'icone' || normalized === 'icon' || normalized === 'botao' || normalized === 'button' || normalized === 'link' || /^imagem \d+$/.test(normalized);
    }
    function getImageLabel(element) {
        if (!element || !element.querySelector) {
            return undefined;
        }
        var image = element.querySelector('img[alt]');
        if (image && image.getAttribute('alt')) {
            return image.getAttribute('alt');
        }
        return undefined;
    }
    function getCtaSource(element) {
        if (!element) {
            return undefined;
        }
        var ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel && !isGenericCtaSource(ariaLabel)) {
            return ariaLabel;
        }
        var title = element.getAttribute('title');
        if (title && !isGenericCtaSource(title)) {
            return title;
        }
        if (element.tagName === 'INPUT' && element.value) {
            return element.value;
        }
        var text = element.innerText || element.textContent;
        if (text && !isGenericCtaSource(text)) {
            return text;
        }
        var imageLabel = getImageLabel(element);
        if (imageLabel && !isGenericCtaSource(imageLabel)) {
            return String(imageLabel).replace(/^\s*[íi]cone\s+/i, '');
        }
        return undefined;
    }
    function getCtaLabel(element) {
        var hrefLabel = getHrefCtaLabel(element);
        if (hrefLabel) {
            return hrefLabel;
        }
        var source = getCtaSource(element);
        if (!source) {
            if (closest(element, HEADER_SELECTOR) && element.querySelector && element.querySelector('img')) {
                return 'logo';
            }
            return undefined;
        }
        var mapped = findMappedValue(source, ANALYTICS_MAP.ctas);
        if (mapped) {
            return mapped;
        }
        return sanitize(source);
    }
    function getFieldSource(field) {
        if (!field) {
            return undefined;
        }
        var id = field.getAttribute('id');
        if (id) {
            var label = document.querySelector('label[for="' + String(id).replace(/"/g, '\\"') + '"]');
            if (label) {
                var labelText = label.innerText || label.textContent;
                if (normalizeText(labelText)) {
                    return labelText;
                }
            }
        }
        var wrappingLabel = closest(field, 'label');
        if (wrappingLabel) {
            var wrappingText = wrappingLabel.innerText || wrappingLabel.textContent;
            if (normalizeText(wrappingText)) {
                return wrappingText;
            }
        }
        return field.getAttribute('aria-label') || field.getAttribute('placeholder') || field.getAttribute('name') || field.getAttribute('id') || undefined;
    }
    function getFieldLabel(field) {
        var source = getFieldSource(field);
        if (!source) {
            return undefined;
        }
        var mapped = findMappedValue(source, ANALYTICS_MAP.fields);
        if (mapped) {
            return mapped;
        }
        return sanitize(source);
    }
    function shouldTrack(element) {
        if (!element) {
            return false;
        }
        var editable = closest(element, ['.lfr-editable', '[data-lfr-editable-id]', '.page-editor__topper__item', '.segments-experiment-panel'].join(','));
        if (editable && document.body && document.body.classList.contains('has-edit-mode-menu')) {
            return false;
        }
        return true;
    }
    function trackClick(element) {
        if (!element) {
            return;
        }
        var ctaLabel = getCtaLabel(element);
        pushDataLayer({
            event: 'click',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: getPageSection(),
            area_name: getAreaName(element, ctaLabel),
            element_type: getElementType(element),
            cta_label: ctaLabel
        }, element);
    }
    function trackFieldInteraction(field) {
        if (!field) {
            return;
        }
        var ctaLabel = getFieldLabel(field);
        pushDataLayer({
            event: 'interaction',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: getPageSection(),
            area_name: getAreaName(field, ctaLabel),
            element_type: 'campo',
            cta_label: ctaLabel
        }, field);
    }
    function trackAccordionInteraction(element, isOpen) {
        if (!element) {
            return;
        }
        var source = getCtaSource(element);
        var label = sanitize(source);
        if (!label) {
            return;
        }
        pushDataLayer({
            event: 'interaction',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: getPageSection(),
            area_name: getAreaName(element, label),
            element_type: 'accordion',
            cta_label: (isOpen ? 'abriu:' : 'fechou:') + label
        }, element);
    }
    function trackCallback(options) {
        options = options || {};
        var statusSubmit;
        if (options.statusSubmit !== undefined && options.statusSubmit !== null && options.statusSubmit !== '') {
            statusSubmit = String(options.statusSubmit);
        } else if (options.success === true) {
            statusSubmit = 'sucesso';
        } else {
            var errorType = sanitizeError(options.errorType);
            statusSubmit = 'erro:' + (errorType || 'erro');
        }
        var areaName = options.areaName ? sanitize(options.areaName) : getAreaName(options.element, undefined);
        pushDataLayer({
            event: 'callback',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: options.pageSection ? sanitize(options.pageSection) : getPageSection(),
            area_name: areaName,
            element_type: 'form',
            status_submit: statusSubmit
        });
    }
    function onlyDigits(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        return String(value).replace(/\D/g, '') || undefined;
    }
    function sha256(value) {
        if (value === undefined || value === null || value === '' || !window.crypto || !window.crypto.subtle) {
            return Promise.resolve(undefined);
        }
        var normalized = String(value).trim().toLowerCase();
        var bytes = (new TextEncoder).encode(normalized);
        return window.crypto.subtle.digest('SHA-256', bytes).then(function (buffer) {
            var array = Array.prototype.slice.call(new Uint8Array(buffer));
            return array.map(function (byte) {
                return ('00' + byte.toString(16)).slice(-2);
            }).join('');
        });
    }
    function trackGlobal(data) {
        data = data || {};
        return Promise.all([sha256(onlyDigits(data.phone)), sha256(data.email), sha256(onlyDigits(data.cpf))]).then(function (values) {
            pushDataLayer({
                event: 'global',
                event_type: 'event_custom',
                user_phone: values[0],
                user_cep: onlyDigits(data.cep),
                user_email: values[1],
                user_cpf: values[2]
            });
        });
    }
    function handleClick(event) {
        var target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        var accordion = closest(target, ACCORDION_SELECTOR);
        if (accordion && (matches(accordion, NOT_ACCORDION_SELECTOR) || closest(accordion, NOT_ACCORDION_SELECTOR) || closest(accordion, CHROME_SELECTOR))) {
            accordion = null;
        }
        if (accordion) {
            var expanded = accordion.getAttribute('aria-expanded');
            var isOpen;
            if (expanded !== null) {
                isOpen = expanded !== 'true';
            } else if (accordion.tagName === 'SUMMARY') {
                var details = closest(accordion, 'details');
                isOpen = !(details && details.open);
            }
            if (isOpen !== undefined && shouldTrack(accordion)) {
                trackAccordionInteraction(accordion, isOpen);
                return;
            }
        }
        var clickable = closest(target, CLICKABLE_SELECTOR);
        if (!clickable) {
            return;
        }
        if (!shouldTrack(clickable)) {
            return;
        }
        trackClick(clickable);
    }
    var TRACKED_FIELD_ATTRIBUTE = 'data-hpv-interaction';
    function handleFieldInteraction(event) {
        var field = event.target;
        if (!(field instanceof Element)) {
            return;
        }
        if (!matches(field, FIELD_SELECTOR)) {
            return;
        }
        if (closest(field, CHROME_SELECTOR)) {
            return;
        }
        if (!shouldTrack(field)) {
            return;
        }
        if (field.getAttribute(TRACKED_FIELD_ATTRIBUTE)) {
            return;
        }
        field.setAttribute(TRACKED_FIELD_ATTRIBUTE, '1');
        trackFieldInteraction(field);
    }
    function safe(handler) {
        return function (event) {
            try {
                handler(event);
            } catch (error) {
                if (DEBUG) {
                    console.error('[Hapvida Analytics]', error);
                }
            }
        };
    }
    bootstrapGtm();
    document.addEventListener('click', safe(handleClick), true);
    document.addEventListener('focusin', safe(handleFieldInteraction), true);
    document.addEventListener('change', safe(handleFieldInteraction), true);
    if (window.Liferay && typeof window.Liferay.on === 'function') {
        window.Liferay.on('endNavigate', function () {
            var tracked = document.querySelectorAll('[' + TRACKED_FIELD_ATTRIBUTE + ']');

            for (var i = 0; i < tracked.length; i++) {
                tracked[i].removeAttribute(TRACKED_FIELD_ATTRIBUTE);
            }

            loadGtm();
            cleanupBrokenGtmMarkup();

            debugLog({
                page_section: getPageSection()
            }, 'endNavigate');
        });
    }
    document.addEventListener('hapvida:form-callback', function (event) {
        var detail = event && event.detail ? event.detail : {};
        trackCallback(detail);
    });
    window.HapvidaAnalytics = {
        getPageSection: getPageSection,
        getAreaName: function (element) {
            return getAreaName(element, getCtaLabel(element));
        },
        getElementType: getElementType,
        getCtaLabel: getCtaLabel,
        getFieldLabel: getFieldLabel,
        trackClick: trackClick,
        trackFieldInteraction: trackFieldInteraction,
        trackAccordionInteraction: trackAccordionInteraction,
        trackCallback: trackCallback,
        trackCallbackSuccess: function (options) {
            options = options || {};
            options.success = true;
            return trackCallback(options);
        },
        trackCallbackError: function (errorType, options) {
            options = options || {};
            options.success = false;
            options.errorType = errorType;
            return trackCallback(options);
        },
        trackGlobal: trackGlobal,
        isGtmPresent: isGtmPresent,
        sanitize: sanitize,
        setDebug: function (enabled) {
            DEBUG = enabled === true;
            console.log('[Hapvida Analytics] Debug:', DEBUG);
        },
        getMap: function () {
            return ANALYTICS_MAP;
        }
    };
    if (DEBUG) {
        console.log('[Hapvida Analytics] Inicializado', {
            flow_name: FLOW_NAME,
            page_section: getPageSection()
        });
    }
})();