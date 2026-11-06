/**
 * Copyright (c) 2000-present Liferay, Inc.
 * GNU LGPL v2.1+
 */

"use strict";

/*
 * Carrega quando o HTML (sem portlets) termina de carregar.
 */
Pagina.pronta(function () {
	const altoContrastre = localStorage.getItem("altoContrastre");

	const addClasses = (sel, cls) =>
		document.querySelectorAll(sel).forEach((el) => el.classList.add(cls));
	const removeClasses = (sel, cls) =>
		document.querySelectorAll(sel).forEach((el) => el.classList.remove(cls));

	const applyHighContrast = (apply) => {
		const method = apply ? addClasses : removeClasses;
		method("body", "contraste-body");
		method("#logo", "contraste-logo");
		method(".card-class-submain", "contraste-carrossel-bg");
		method(".label-category", "contraste-carossel-bg");
	};

	if (altoContrastre !== null && altoContrastre !== "false") {
		applyHighContrast(true);
	} else {
		applyHighContrast(false);
	}

	// Toggle alto contraste
	document.querySelectorAll(".contrasteAjuste").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			const isOn = document.body.classList.contains("contraste-body");
			if (isOn) {
				localStorage.removeItem("altoContrastre");
			} else {
				localStorage.setItem("altoContrastre", "true");
			}
			applyHighContrast(!isOn);
		});
	});

	if (!false) {

	// Swipers
	new Swiper(".mySwiperEstrutura", {
		spaceBetween: 30,
		freeMode: true,
		centeredSlides: false,
		pagination: { el: ".swiper-pagination", clickable: true },
		breakpoints: {
			360: { slidesPerView: 1 },
			500: { slidesPerView: 1.3 },
			768: { slidesPerView: 1.8 },
			992: { slidesPerView: 2.3 },
			1200: { slidesPerView: 2.8 }
		}
	});

	new Swiper(".mySwiperEstruturaInterna", {
		init: true,
		direction: "horizontal",
		preloadImages: true,
		spaceBetween: 30,
		centeredSlides: false,
		breakpoints: {
			360: { slidesPerView: "auto", simulateTouch: true, freeMode: true },
			992: {
				slidesPerView: "auto",
				freeMode: false,
				simulateTouch: false,
				navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
			}
		}
	});

	new Swiper(".mySwiperBoasVindas", {
		init: true,
		direction: "horizontal",
		slidesPerView: 1,
		preloadImages: true,
		spaceBetween: 36,
		centeredSlides: false,
		simulateTouch: false,
		freeMode: false,
		breakpoints: {
			360: { slidesPerView: 1.3 },
			500: { slidesPerView: 1.8 },
			768: { slidesPerView: 3 }
		},
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
	});

	new Swiper(".mySwiperPreventivo", {
		spaceBetween: 30,
		freeMode: true,
		centeredSlides: false,
		pagination: { el: ".swiper-pagination", clickable: true },
		breakpoints: {
			500: { slidesPerView: 1 },
			768: { slidesPerView: 1.5 },
			992: { slidesPerView: 2.5 },
			1200: { slidesPerView: 3 }
		}
	});

	new Swiper(".mySwiperServicos", {
		slidesPerView: 2,
		spaceBetween: 10,
		freeMode: true,
		centeredSlides: false,
		pagination: { el: ".swiper-pagination", clickable: true }
	});

	new Swiper(".mySwiperSubplanos", {
		slidesPerView: 1,
		spaceBetween: 30,
		freeMode: true,
		centeredSlides: false,
		pagination: { el: ".swiper-pagination", clickable: true }
	});

	new Swiper(".mySwiperSubplanos1", {
		slidesPerView: 1,
		freeMode: false,
		centeredSlides: true,
		pagination: { el: ".swiper-pagination" }
	});

	new Swiper(".mySwiperCarrossel", {
		init: true,
		direction: "horizontal",
		slidesPerView: 1.2,
		preloadImages: true,
		spaceBetween: 36,
		centeredSlides: false,
		simulateTouch: false,
		freeMode: false,
		breakpoints: { 991: { slidesPerView: 3 } },
		pagination: { el: ".swiper-pagination", clickable: true },
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
	});

	new Swiper(".mySwiperPortlet", {
		slidesPerView: 3,
		spaceBetween: 5,
		freeMode: true,
		pagination: { el: ".swiper-pagination", clickable: true }
	});

	new Swiper(".mySwiperArrowSub", {
		simulateTouch: false,
		freeMode: false,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
		breakpoints: { 991: { simulateTouch: true } }
	});

	new Swiper(".mySwiperArrow", {
		freeMode: false,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
	});

	new Swiper(".mySwiperTimeline", {
		slidesPerView: 1,
		spaceBetween: 10,
		freeMode: true,
		centeredSlides: false,
		pagination: { el: ".swiper-pagination", clickable: true },
		breakpoints: {
			360: { slidesPerView: 1.5 },
			500: { slidesPerView: 2.1 },
			768: { slidesPerView: 3.1 },
			992: { slidesPerView: 3.8 },
			1200: { slidesPerView: 4.5 }
		}
	});

	new Swiper(".mySwiperFragmentado", {
		spaceBetween: 15,
		freeMode: false,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
		breakpoints: {
			360: { slidesPerView: 1.1 },
			420: { slidesPerView: 1.5 },
			560: { slidesPerView: 2 },
			768: { slidesPerView: 2.3 },
			992: { slidesPerView: 1.7 },
			1200: { slidesPerView: 2 }
		}
	});

	new Swiper(".mySwiperFragmentado2", {
		spaceBetween: 15,
		freeMode: true,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
	});

	new Swiper(".mySwiperFragmentadoLivre", {
		spaceBetween: 15,
		freeMode: true
	});

	new Swiper(".mySwiperFragmentadoOncologia", {
		spaceBetween: 15,
		slidesPerView: "auto",
		freeMode: false
	});

	new Swiper(".mySwiperFragmentadoTxt", {
		spaceBetween: 15,
		slidesPerView: "auto",
		freeMode: true,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
	});

	new Swiper(".mySwiperFragmentadoInterclube", {
		init: true,
		direction: "horizontal",
		preloadImages: true,
		spaceBetween: 15,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
		breakpoints: {
			380: { slidesPerView: "auto", freeMode: true, simulateTouch: true },
			992: { slidesPerView: "auto", simulateTouch: false, freeMode: false }
		}
	});

	new Swiper(".mySwiperFragmentadoExtendido", {
		spaceBetween: 15,
		freeMode: false,
		navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
		breakpoints: {
			380: { slidesPerView: 1.2 },
			420: { slidesPerView: 1.4 },
			560: { slidesPerView: 1.8 },
			768: { slidesPerView: 2.4 },
			992: { slidesPerView: 2 },
			1200: { slidesPerView: 2.3 }
		}
	});

	new Swiper(".carr-planos", {
		slidesPerView: "auto",
		spaceBetween: 30,
		breakpoints: {
			992: { slidesPerView: "2.9" },
			805: { slidesPerView: "2.7" },
			768: { slidesPerView: "2" }
		}
	});
}


});


/*
 * Carrega após cada portlet.
 */
Pagina.widgetPronto(function (_portletId, _node) {
	// sem dependências de jQuery
});

/*
 * Carrega quando tudo (incluindo portlets) está pronto.
 */
function aplicarAjustesLayout() {
    document.querySelectorAll("#tabButtons span").forEach((span) => {
        span.addEventListener("click", (e) => {
            e.preventDefault();
            document
                .querySelectorAll("#tabButtons span")
                .forEach((s) => s.classList.remove("campoGuiaStyle"));
            span.classList.add("campoGuiaStyle");
        });
    });

    // Remover .table-responsive
    document.querySelectorAll(".table-responsive").forEach((el) => el.remove());

    // Inserir rótulos "Anterior" e "Próxima" na paginação
    try {
        const leftIcon = document.querySelector(
            "ul.pagination li a span span svg.lexicon-icon-angle-left"
        );
        
        if (leftIcon && leftIcon.parentElement && !leftIcon.parentElement.querySelector('.taglib-text')) {
            leftIcon.parentElement.insertAdjacentHTML(
                "afterend",
                '<span class="taglib-text sublinhado">Anterior</span>'
            );
        }

        const rightIcon = document.querySelector(
            "ul.pagination li a span span svg.lexicon-icon-angle-right"
        );
        
        if (rightIcon && rightIcon.parentElement && !rightIcon.parentElement.querySelector('.taglib-text')) {
            rightIcon.parentElement.insertAdjacentHTML(
                "beforebegin",
                '<span class="taglib-text sublinhado">Próxima</span>'
            );
        }
    } catch (err) {
        
    }
}

Pagina.on("allPortletsReady", aplicarAjustesLayout);

Pagina.on("endNavigate", aplicarAjustesLayout);

// JS Antigo do Sustentabilidade Documentos (já era vanilla)
let tabWrapper = document.querySelectorAll("#tabContent");
function hideTabs(currID) {
	tabWrapper.forEach((item) => {
		if (item.dataset.tab === currID) item.style.display = "block";
		else item.style.display = "none";
	});
}

let btnTest = document.querySelectorAll("#tabButtons span");
btnTest.forEach((element) => {
	element.addEventListener("click", function () {
		let currID = this.id;
		hideTabs(currID);
	});

	// JS Novo do Sustentabilidade Documentos
	const nextBtn1 = document.querySelector(".carousel-control-next");
	const prevBtn1 = document.querySelector(".carousel-control-prev");

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	if (nextBtn1) {
		nextBtn1.addEventListener("click", async () => {
			await delay(800);
			const activeSpan = document.querySelector(
				".carousel-item.tab--item.active > span"
			);
			if (activeSpan) hideTabs(activeSpan.id);
		});
	}

	if (prevBtn1) {
		prevBtn1.addEventListener("click", async () => {
			await delay(800);
			const activeSpan = document.querySelector(
				".carousel-item.tab--item.active > span"
			);
			if (activeSpan) hideTabs(activeSpan.id);
		});
	}
});

// ---- Acessibilidade: botões de tamanho de fonte ----

// agora aceita seletores genéricos (tag, classe, etc.)
const alterarFonteImpl = function (selector, aumentar) {
	const wrapper = document.getElementById("wrapper") || document;
	const elements = wrapper.querySelectorAll(selector);
	elements.forEach((el) => {
		const text = el.textContent;
		if (text) {
			const style = window.getComputedStyle(el);
			const size = parseInt(style.fontSize.replace("px", ""), 10);
			const newSize = aumentar ? size + 1 : size - 1;
			// preserva estilos existentes, só força font-size
			el.style.fontSize = newSize + "px";
		}
	});
};

const alterarFonte = function (aumentar) {
	const selectors = [
		"body",
		"p",
		"a",
		".footer h5",
		".footer a",
		".footer li",
		"li",
		".desktop_nav",
		".bottom_link",
		".btn",
		"#breadcrumbs li",
		"#breadcrumbs h2",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"span",
		"button"
	];
	selectors.forEach((sel) => alterarFonteImpl(sel, aumentar));
	console.log("alterarFonte - institucional");
};

// Handlers dos botões .fonteMaior / .fonteMenor
document.querySelectorAll(".fonteMaior").forEach((el) =>
	el.addEventListener("click", (e) => {
		e.preventDefault();
		alterarFonte(true);
	})
);
document.querySelectorAll(".fonteMenor").forEach((el) =>
	el.addEventListener("click", (e) => {
		e.preventDefault();
		alterarFonte(false);
	})
);