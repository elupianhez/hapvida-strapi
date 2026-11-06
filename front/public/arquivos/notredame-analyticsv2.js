(function () {
    'use strict';

    if (window.__NOTREDAME_ANALYTICS_INITIALIZED__) {
        return;
    }

    window.__NOTREDAME_ANALYTICS_INITIALIZED__ = true;

    var FLOW_NAME = 'notredame-institucional';
    var DEBUG = false;

    var CLICKABLE_SELECTOR = [
        'a',
        'button',
        '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]'
    ].join(',');

    var ANALYTICS_MAP = {
        pages: {
            '/': 'home',
            '/home': 'home',

            '/institucional/boas-vindas': 'boas-vindas',
            '/boas-vindas': 'boas-vindas',

            '/institucional/portabilidade': 'portabilidade',
            '/informacoes-regulatorias/portabilidade-plano-de-saude': 'portabilidade',
            '/portabilidade': 'portabilidade',

            '/demonstrativo-financeiro': 'demonstrativo-financeiro',
            '/demonstrativos-financeiros': 'demonstrativo-financeiro',

            '/informacoes-regulatorias': 'informacoes-regulatorias',
            '/noticias': 'noticias',
            '/nossos-diferenciais': 'nossos-diferenciais',
            '/planos-de-saude': 'planos-de-saude',
            '/aplicativo': 'aplicativo',
            '/2-via-de-boleto': '2-via-de-boleto',
            '/teleconsulta': 'teleconsulta',

            '/agendamento-consultas-exames':
                'agendamento-de-consultas-e-exames',

            '/agendamento-de-consultas-e-exames':
                'agendamento-de-consultas-e-exames',

            '/duvidas-frequentes': 'duvidas-frequentes',
            '/canais-de-atendimento': 'canais-de-atendimento',
            '/unidades': 'unidades',
            '/ouvidoria': 'ouvidoria',
            '/beneficiario': 'beneficiario',
            '/empresa': 'empresa',
            '/prestador': 'prestador',
            '/corretor': 'corretor',
            '/seja-cliente': 'seja-cliente'
        },

        areas: {
            'premium inteligente':
                'premium-inteligente',

            'rede credenciada de excelencia':
                'rede-credenciada-de-excelencia',

            'acompanhamento continuo':
                'acompanhamento-continuo',

            'saude premium':
                'saude-premium',

            'simplifica o cuidado no ritmo da sua vida':
                'saude-premium',

            'acompanhe nossas noticias':
                'acompanhe-noticias',

            'acompanhe noticias':
                'acompanhe-noticias',

            'consulte a nossa rede':
                'consulte-a-nossa-rede',

            'o que voce precisa hoje':
                'consulte-a-nossa-rede',

            'boas vindas a notredame':
                'boas-vindas-a-notredame',

            'viva uma geracao de cuidado premium':
                'viva-uma-geracao-de-cuidado-premium',

            'nossos servicos':
                'nossos-servicos',

            'consulta a distancia':
                'consulta-a-distancia',

            'rede de atendimento':
                'rede-de-atendimento',

            'quer iniciar portabilidade':
                'quer-iniciar-portabilidade',

            'portabilidade de plano de saude':
                'portabilidade',

            'portabilidade':
                'portabilidade',

            'demonstracoes financeiras individuais e consolidado 2025':
                'demonstracoes-financeiras-individuais-e-consolidado-2025',

            'indicadores economicos 31 12 2025':
                'indicadores-economicos-31-12-2025',

            'reajuste ans 2026':
                'reajuste-ans-2026',

            'reajuste para o agrupamento de contratos':
                'reajuste-para-o-agrupamento-de-contratos',

            'tenha o cuidado premium':
                'tenha-o-cuidado-premium',

            'conheca o compromisso da notredame':
                'conheca-o-compromisso-da-notredame',

            'um plano de saude que cuida de voce':
                'uma-plano-de-saude-que-cuida-de-voce',

            'advance':
                'advance',

            'premium':
                'premium',

            'infinity':
                'infinity',

            'por que milhares de pessoas escolhem':
                'por-que-milhares-de-pessoas-escolhem',

            'por que milhares de pessoas escolhem a notredame':
                'por-que-milhares-de-pessoas-escolhem',

            'quando a prevencao evolui':
                'quando-a-prevencao-evolui',

            'aplicativo notredame saude':
                'aplicativo-notredame-saude',

            'seus servicos na palma da mao':
                'seus-servicos-na-palma-da-mao',

            '2 via de boleto':
                '2-via-de-boleto',

            'acesse sua 2 via':
                'acesse-sua-2-via',

            'consulte se por video':
                'consulte-se-por-video',

            'agendamento de consultas e exames':
                'agendamento-de-consultas-e-exames',

            'cuide da sua saude':
                'cuide-da-sua-saude',

            'teleconsulta':
                'teleconsulta',

            'canais de atendimento':
                'canais-de-atendimento',

            'outras formas de atendimento':
                'outras-formas-de-atendimento',

            'encontre unidades perto de voce':
                'encontre-unidades-perto-de-voce',

            'encontre o atendimento ideal perto de voce':
                'encontre-unidades-perto-de-voce',

            'uma rede de excelencia para cada momento de cuidado':
                'unidades',

            'entrar em contato com ouvidoria':
                'entrar-em-contato-com-ouvidoria',

            'envie formulario':
                'envie-formulario',

            'envie o formulario':
                'envie-formulario',

            'area do beneficiario':
                'area-do-beneficiario',

            'carteirinha digital':
                'carteirinha-digital',

            'rede credenciada':
                'rede-credenciada',

            'agendamento':
                'agendamento',

            'segunda via do boleto':
                'segunda-via-do-boleto',

            'resultado dos exames':
                'resultado-dos-exames',

            'minha internacao':
                'minha-internacao',

            'o plano de saude ideal para voce':
                'o-plano-de-saude-ideal-para-voce',

            'preparado para facilitar o seu dia a dia':
                'preparado-para-facilitar-o-seu-dia-a-dia'
        },

        ctas: {
            'logo': 'logo',
            'sobre a notredame saude': 'sobre-a-notredame-saude',
            'boas vindas': 'boas-vindas',
            'portabilidade': 'portabilidade',
            'demonstrativos financeiros': 'demonstrativos-financeiros',
            'informacoes regulatorias': 'informacoes-regulatorias',
            'noticias': 'noticias',
            'nossos diferenciais': 'nossos-diferenciais',
            'planos de saude': 'planos-de-saude',
            'aplicativo': 'aplicativo',
            '2 via de boleto': '2-via-de-boleto',
            'teleconsulta': 'teleconsulta',
            'agendamento de consulta e exames':
                'agendamento-de-consulta-e-exames',
            'agendamento de consultas e exames':
                'agendamento-de-consulta-e-exames',
            'duvidas gerais': 'duvidas-gerais',
            'canais de atendimento': 'canais-de-atendimento',
            'unidades': 'unidades',
            'ouvidoria': 'ouvidoria',
            'beneficiario': 'beneficiario',
            'empresa': 'empresa',
            'prestador': 'prestador',
            'corretor': 'corretor',
            'solicitar proposta': 'solicitar-proposta',
            'acessibilidade': 'acessibilidade',

            'portal da privacidade': 'portal-da-privacidade',
            'app store': 'app-store',
            'google play': 'google-play',
            'pesquisar unidades': 'pesquisar-unidades',

            'conhecer os planos': 'conhecer-os-planos',
            'explorar': 'explorar',
            'concierge da saude': 'concierge-da-saude',
            'reembolso': 'reembolso',
            'rede hospitalar de referencia':
                'rede-hospitalar-de-referencia',
            'terapias online': 'terapias-online',
            'descubra o que significa viver uma experiencia':
                'descubrar-o-que-significa-viver-uma-experiencia',
            'premium inteligente': 'premium-inteligente',
            'consultar rede credenciada':
                'consultar-rede-credenciada',
            'baixar app': 'baixar-app',
            'conhecer mais': 'conhercer-mais',
            'acessar central de servicos':
                'acessar-central-de-servicos',
            'duvidas frequentes': 'duvidas-frequentes',
            'acessar teleconsulta': 'acessar-teleconsulta',
            'conhecer rede de atendimento':
                'conhecer-rede-de-atendimento',
            'ver as duvidas frequentes':
                'ver-as-duvidas-frequentes',
            'baixar pdf': 'baixar-pdf',
            'solicitar portabilidade':
                'solicitar-portabilidade',
            'emitir declaracao': 'emitir-declaracao',
            'acesse ouvidoria': 'acesse-ouvidoria',
            'ler mais': 'ler-mais',
            'conheca mais sobre o nosso cuidado':
                'conheca-mais-sobre-o-nosso-cuidado',
            'baixar o aplicativo':
                'baixar-o-aplicativo',
            'area do beneficiario':
                'area-do-beneficiario',
            'area de empresa':
                'area-de-empresa',
            'agendar teleconsulta':
                'agendar-teleconsulta',
            'como agendar sua teleconsulta':
                'como-agendar-sua-teleconsulta',
            'como acessar o pronto atendimento online':
                'como-acessar-o-pronto-atendimento-online',
            'agendar agora':
                'agendar-agora',
            'como funciona':
                'como-funciona',
            'a teleconsulta e segura':
                'a-teleconsulta-e-segura',
            'consultas e exames':
                'consultas-e-exames',
            'resultado de exames':
                'resultado-de-exames',
            'acessar a rede credenciada':
                'acessar-a-rede-credenciada',
            'explorar planos':
                'explorar-planos',
            'enviar':
                'enviar'
        },

        specialAreas: [
            {
                page: 'home',
                selector: 'header',
                area: undefined
            },
            {
                page: 'home',
                selector: 'footer',
                area: undefined
            }
        ]
    };

    function normalizeText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return '';
        }

        return String(value)
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ª/g, 'a')
            .replace(/[º°]/g, 'o')
            .replace(/&/g, ' e ')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function sanitize(value) {
        var normalized = normalizeText(value);

        if (!normalized) {
            return undefined;
        }

        return normalized
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || undefined;
    }

    function sanitizeError(value) {
        if (
            value === undefined ||
            value === null ||
            value === ''
        ) {
            return undefined;
        }

        return String(value)
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9_-]/g, '')
            .replace(/-+/g, '-') || undefined;
    }

    function getDataLayer() {
        window.dataLayer = window.dataLayer || [];
        return window.dataLayer;
    }

    function debugLog(payload, context) {
        if (!DEBUG) {
            return;
        }

        console.log(
            '[NotreDame Analytics]',
            payload,
            context || ''
        );
    }

    function cleanPathname() {
        var path = window.location.pathname || '/';

        try {
            path = decodeURIComponent(path);
        }
        catch (error) {
        }

        path = path
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');

        if (!path) {
            path = '/';
        }

        path = path.replace(
            /^\/web\/[^/]+(?=\/|$)/i,
            ''
        );

        if (!path) {
            path = '/';
        }

        return path.toLowerCase();
    }

    function findMappedPage(path) {
        if (ANALYTICS_MAP.pages[path]) {
            return ANALYTICS_MAP.pages[path];
        }

        var keys = Object.keys(
            ANALYTICS_MAP.pages
        );

        for (var i = 0; i < keys.length; i++) {
            var route = keys[i];

            if (
                route !== '/' &&
                (
                    path === route ||
                    path.endsWith(route)
                )
            ) {
                return ANALYTICS_MAP.pages[route];
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

        var segments = path
            .split('/')
            .filter(Boolean);

        if (!segments.length) {
            return 'home';
        }

        return sanitize(
            segments[segments.length - 1]
        );
    }

    function findMappedValue(text, map) {
        var normalized = normalizeText(text);

        if (!normalized) {
            return undefined;
        }

        if (map[normalized]) {
            return map[normalized];
        }

        var keys = Object.keys(map);

        keys.sort(function (a, b) {
            return b.length - a.length;
        });

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (
                normalized === key ||
                normalized.indexOf(key) !== -1
            ) {
                return map[key];
            }
        }

        return undefined;
    }

    function getElementType(element) {
        if (
            !element ||
            typeof element.closest !== 'function'
        ) {
            return undefined;
        }

        if (
            element.closest(
                'header, #header, [role="banner"]'
            )
        ) {
            return 'header';
        }

        if (
            element.closest(
                'footer, #footer, [role="contentinfo"]'
            )
        ) {
            return 'footer';
        }

        return 'botao';
    }

    function getSpecialArea(element) {
        var page = getPageSection();
        var rules =
            ANALYTICS_MAP.specialAreas || [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (rule.page !== page) {
                continue;
            }

            try {
                if (element.closest(rule.selector)) {
                    return rule.area;
                }
            }
            catch (error) {
            }
        }

        return undefined;
    }

    function getFragmentContainer(element) {
        if (
            !element ||
            typeof element.closest !== 'function'
        ) {
            return null;
        }

        return element.closest(
            [
                '.fragment-entry-link',
                '[data-fragment-entry-link-id]',
                'section',
                'article',
                '.portlet',
                '.portlet-boundary'
            ].join(',')
        );
    }

    function collectCandidateHeadings(element) {
        var candidates = [];
        var current = element;
        var limit = 0;

        while (
            current &&
            current !== document.body &&
            limit < 12
        ) {
            if (
                current.matches &&
                current.matches(
                    [
                        '.fragment-entry-link',
                        '[data-fragment-entry-link-id]',
                        'section',
                        'article',
                        '.portlet',
                        '.portlet-boundary'
                    ].join(',')
                )
            ) {
                var headings = current.querySelectorAll(
                    'h1, h2, h3, h4, h5, h6'
                );

                for (
                    var i = 0;
                    i < headings.length;
                    i++
                ) {
                    var headingText =
                        headings[i].innerText ||
                        headings[i].textContent;

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
        if (
            !element ||
            typeof element.closest !== 'function'
        ) {
            return undefined;
        }

        var current = element.parentElement;
        var limit = 0;

        while (
            current &&
            current !== document.body &&
            current !== document.documentElement &&
            limit < 16
        ) {
            if (
                current.matches &&
                current.matches(
                    'header, footer, #header, #footer, [role="banner"], [role="contentinfo"]'
                )
            ) {
                return undefined;
            }

            if (current.querySelectorAll) {
                var headings = current.querySelectorAll(
                    'h1, h2, h3, h4, h5, h6'
                );

                if (headings.length === 1) {
                    var headingText =
                        headings[0].innerText ||
                        headings[0].textContent;

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

        while (
            current &&
            current !== document.body &&
            current !== document.documentElement &&
            limit < 18
        ) {
            if (
                current.matches &&
                current.matches(
                    'header, footer, #header, #footer, [role="banner"], [role="contentinfo"]'
                )
            ) {
                return undefined;
            }

            if (current.querySelectorAll) {
                var headings = current.querySelectorAll(
                    'h1, h2, h3, h4, h5, h6'
                );
                var matches = {};
                var matchCount = 0;
                var onlyMatch;

                for (
                    var i = 0;
                    i < headings.length;
                    i++
                ) {
                    var headingText =
                        headings[i].innerText ||
                        headings[i].textContent;

                    var mappedHeading = findMappedValue(
                        headingText,
                        ANALYTICS_MAP.areas
                    );

                    if (
                        mappedHeading &&
                        !matches[mappedHeading]
                    ) {
                        matches[mappedHeading] = true;
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

    function getHomeNewsAreaName(element, ctaLabel) {
        if (
            getPageSection() !== 'home' ||
            ctaLabel !== 'ler-mais'
        ) {
            return undefined;
        }

        var heading = findNearestSingleHeading(element);
        var normalized = normalizeText(heading);

        if (
            normalized &&
            normalized !== 'acompanhe nossas noticias' &&
            normalized !== 'acompanhe noticias'
        ) {
            return sanitize(heading);
        }

        var href = getHref(element);
        var newsMatch = href.match(
            /\/noticias\/([^?#]+)/i
        );

        if (newsMatch && newsMatch[1]) {
            try {
                return sanitize(
                    decodeURIComponent(newsMatch[1])
                );
            }
            catch (error) {
                return sanitize(newsMatch[1]);
            }
        }

        return undefined;
    }

    function getPageSpecificAreaName(
        element,
        page,
        ctaLabel
    ) {
        var heading = findNearestSingleHeading(element);
        var normalizedHeading = normalizeText(heading);

        if (page === 'home') {
            var newsArea = getHomeNewsAreaName(
                element,
                ctaLabel
            );

            if (newsArea) {
                return newsArea;
            }
        }

        if (page === '2-via-de-boleto') {
            if (
                ctaLabel === 'area-do-beneficiario' ||
                normalizedHeading === 'beneficiario' ||
                normalizedHeading.indexOf('beneficiario') !== -1
            ) {
                return 'area-do-beneficiario';
            }

            if (
                ctaLabel === 'area-de-empresa' ||
                normalizedHeading === 'empresa' ||
                normalizedHeading.indexOf('empresa') !== -1
            ) {
                return 'area-de-empresa';
            }
        }

        if (page === 'unidades') {
            if (
                normalizedHeading.indexOf(
                    'encontre unidades perto de voce'
                ) !== -1 ||
                normalizedHeading.indexOf(
                    'encontre o atendimento ideal perto de voce'
                ) !== -1
            ) {
                return 'encontre-unidades-perto-de-voce';
            }

            if (
                normalizedHeading.indexOf(
                    'uma rede de excelencia para cada momento de cuidado'
                ) !== -1
            ) {
                return 'unidades';
            }

            if (
                ctaLabel === 'pesquisar-unidades' ||
                ctaLabel === 'consultar-rede-credenciada' ||
                ctaLabel === 'acessar-a-rede-credenciada'
            ) {
                return 'encontre-unidades-perto-de-voce';
            }

            return 'unidades';
        }

        return undefined;
    }

    function getAreaName(element, ctaLabel) {
        if (!element) {
            return undefined;
        }

        var elementType =
            getElementType(element);

        if (
            elementType === 'header' ||
            elementType === 'footer'
        ) {
            return undefined;
        }

        var specialArea =
            getSpecialArea(element);

        if (specialArea !== undefined) {
            return specialArea;
        }

        var page = getPageSection();

        var pageSpecificArea =
            getPageSpecificAreaName(
                element,
                page,
                ctaLabel
            );

        if (pageSpecificArea) {
            return pageSpecificArea;
        }

        var nearestMappedArea =
            findNearestMappedArea(element);

        if (nearestMappedArea) {
            return nearestMappedArea;
        }

        var headings =
            collectCandidateHeadings(element);

        for (
            var i = 0;
            i < headings.length;
            i++
        ) {
            var mapped = findMappedValue(
                headings[i],
                ANALYTICS_MAP.areas
            );

            if (mapped) {
                return mapped;
            }
        }

        var fragment =
            getFragmentContainer(element);

        if (fragment) {
            var fragmentText =
                fragment.innerText ||
                fragment.textContent;

            var mappedFragment =
                findMappedValue(
                    fragmentText,
                    ANALYTICS_MAP.areas
                );

            if (mappedFragment) {
                return mappedFragment;
            }
        }

        return undefined;
    }

    function getImageLabel(element) {
        if (
            !element ||
            !element.querySelector
        ) {
            return undefined;
        }

        var image = element.querySelector(
            'img[alt]'
        );

        if (
            image &&
            image.getAttribute('alt')
        ) {
            return image.getAttribute('alt');
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

        if (/apps\.apple\.com|itunes\.apple\.com/i.test(href)) {
            return 'app-store';
        }

        if (/play\.google\.com/i.test(href)) {
            return 'google-play';
        }

        if (/\/duvidas-frequentes(?:[/?#]|$)/i.test(href)) {
            return 'duvidas-frequentes';
        }

        return undefined;
    }

    function isGenericCtaSource(value) {
        var normalized = normalizeText(value);

        return (
            normalized === 'descricao padrao' ||
            normalized === 'descricao' ||
            normalized === 'logo' ||
            normalized === 'imagem' ||
            normalized === 'image' ||
            normalized === 'icone' ||
            normalized === 'icon' ||
            normalized === 'botao' ||
            normalized === 'button' ||
            normalized === 'link'
        );
    }

    function getCtaSource(element) {
        if (!element) {
            return undefined;
        }

        var ariaLabel =
            element.getAttribute('aria-label');

        if (
            ariaLabel &&
            !isGenericCtaSource(ariaLabel)
        ) {
            return ariaLabel;
        }

        var title =
            element.getAttribute('title');

        if (
            title &&
            !isGenericCtaSource(title)
        ) {
            return title;
        }

        if (
            element.tagName === 'INPUT' &&
            element.value
        ) {
            return element.value;
        }

        var text =
            element.innerText ||
            element.textContent;

        if (
            text &&
            normalizeText(text) &&
            !isGenericCtaSource(text)
        ) {
            return text;
        }

        var imageLabel = getImageLabel(element);

        if (
            imageLabel &&
            !isGenericCtaSource(imageLabel)
        ) {
            return imageLabel;
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
            /*
             * Logo frequentemente é somente imagem.
             */
            if (
                element &&
                element.closest &&
                element.closest(
                    'header, #header'
                ) &&
                element.querySelector &&
                element.querySelector('img')
            ) {
                return 'logo';
            }

            return undefined;
        }

        var mapped = findMappedValue(
            source,
            ANALYTICS_MAP.ctas
        );

        if (mapped) {
            return mapped;
        }

        return sanitize(source);
    }

    function shouldTrack(element) {
        if (!element) {
            return false;
        }

        if (
            element.closest &&
            element.closest(
                [
                    '.lfr-editable',
                    '.page-editor__topper__item',
                    '.segments-experiment-panel'
                ].join(',')
            )
        ) {
            if (
                document.body &&
                document.body.classList.contains(
                    'has-edit-mode-menu'
                )
            ) {
                return false;
            }
        }

        return true;
    }

    function pushDataLayer(payload, context) {
        getDataLayer().push(payload);
        debugLog(payload, context);
    }

    function trackClick(element) {
        if (!element) {
            return;
        }

        var ctaLabel = getCtaLabel(element);

        var payload = {
            event: 'click',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: getPageSection(),
            area_name: getAreaName(
                element,
                ctaLabel
            ),
            element_type: getElementType(element),
            cta_label: ctaLabel
        };

        pushDataLayer(payload, element);
    }

    function handleClick(event) {
        var target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        var clickable = target.closest(
            CLICKABLE_SELECTOR
        );

        if (!clickable) {
            return;
        }

        if (!shouldTrack(clickable)) {
            return;
        }

        trackClick(clickable);
    }

    function trackOuvidoriaCallback(options) {
        options = options || {};

        var statusSubmit;

        if (
            options.statusSubmit !== undefined &&
            options.statusSubmit !== null &&
            options.statusSubmit !== ''
        ) {
            statusSubmit =
                String(options.statusSubmit);
        }
        else if (options.success === true) {
            statusSubmit = 'sucesso';
        }
        else {
            var errorType =
                sanitizeError(options.errorType);

            statusSubmit =
                'erro:' +
                (errorType || 'erro');
        }

        pushDataLayer({
            event: 'callback',
            event_type: 'event_custom',
            flow_name: FLOW_NAME,
            page_section: 'ouvidoria',
            area_name: 'envie-formulario',
            element_type: 'form',
            status_submit: statusSubmit
        });
    }

    document.addEventListener(
        'click',
        handleClick,
        true
    );

    document.addEventListener(
        'notredame:ouvidoria-callback',
        function (event) {
            var detail =
                event && event.detail
                    ? event.detail
                    : {};

            trackOuvidoriaCallback(detail);
        }
    );

    window.NotreDameAnalytics = {
        getPageSection: getPageSection,

        getAreaName: function (element) {
            return getAreaName(
                element,
                getCtaLabel(element)
            );
        },

        getElementType: function (element) {
            return getElementType(element);
        },

        getCtaLabel: function (element) {
            return getCtaLabel(element);
        },

        trackClick: trackClick,

        trackOuvidoriaCallback:
            trackOuvidoriaCallback,

        trackOuvidoriaSuccess: function () {
            return trackOuvidoriaCallback({
                success: true
            });
        },

        trackOuvidoriaError: function (errorType) {
            return trackOuvidoriaCallback({
                success: false,
                errorType: errorType
            });
        },

        sanitize: sanitize,

        setDebug: function (enabled) {
            DEBUG = enabled === true;

            console.log(
                '[NotreDame Analytics] Debug:',
                DEBUG
            );
        },

        getMap: function () {
            return ANALYTICS_MAP;
        }
    };

    if (DEBUG) {
        console.log(
            '[NotreDame Analytics] Inicializado',
            {
                flow_name: FLOW_NAME,
                page_section: getPageSection()
            }
        );
    }
})();