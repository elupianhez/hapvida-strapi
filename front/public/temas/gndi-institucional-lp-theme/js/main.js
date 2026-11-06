/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

/*
 * This function gets loaded when all the HTML, not including the portlets, is
 * loaded.
 */
Pagina.pronta(function () {
    const altoContrastre = localStorage.getItem('altoContrastre');

    if (altoContrastre != null && altoContrastre) {
        document.body.classList.add("contraste-body");
        var logo = document.getElementById("logo"); if (logo) logo.classList.add("contraste-logo");
        document.querySelectorAll(".card-class-submain").forEach(function(el) { el.classList.add("contraste-carrossel-bg"); });
        document.querySelectorAll(".label-category").forEach(function(el) { el.classList.add("contraste-carossel-bg"); });
    } else {
        document.body.classList.remove("contraste-body");
        var logo = document.getElementById("logo"); if (logo) logo.classList.remove("contraste-logo");
        document.querySelectorAll(".card-class-submain").forEach(function(el) { el.classList.remove("contraste-carrossel-bg"); });
        document.querySelectorAll(".label-category").forEach(function(el) { el.classList.remove("contraste-carossel-bg"); });
    }


    document.querySelectorAll(".contrasteAjuste").forEach(function(btn) {
        btn.addEventListener("click", function (event) {
            event.preventDefault();
            if (document.body.classList.contains("contraste-body")) {
                localStorage.removeItem('altoContrastre');
                document.body.classList.remove("contraste-body");
                var logo = document.getElementById("logo"); if (logo) logo.classList.remove("contraste-logo");
                document.querySelectorAll(".card-class-submain").forEach(function(el) { el.classList.remove("contraste-carrossel-bg"); });
                document.querySelectorAll(".label-category").forEach(function(el) { el.classList.remove("contraste-carossel-bg"); });
            } else {
                localStorage.setItem('altoContrastre', true);
                document.body.classList.add("contraste-body");
                var logo = document.getElementById("logo"); if (logo) logo.classList.add("contraste-logo");
                document.querySelectorAll(".card-class-submain").forEach(function(el) { el.classList.add("contraste-carrossel-bg"); });
                document.querySelectorAll(".label-category").forEach(function(el) { el.classList.add("contraste-carossel-bg"); });
            }
        });
    });

    if (!false) {
        var swiper = new Swiper(".mySwiperFragmentadoInterclube", {
            init: true,
            direction: "horizontal",
            preloadImages: true,
            spaceBetween: 15,
            slidesPerView: 1,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                380: {
                    slidesPerView: "auto",
                    freeMode: true,
                    simulateTouch: true,
                },
                992: {
                    slidesPerView: "auto",
                    simulateTouch: false,
                    freeMode: false,
                },
            }
        });
    }
});

/*
 * This function gets loaded after each and every portlet on the page.
 *
 * portletId: the current portlet's id
 * node: the Alloy Node object of the current portlet
 */
Pagina.widgetPronto(function (_portletId, _node) {
});

/*
 * This function gets loaded when everything, including the portlets, is on
 * the page.
 */
Pagina.on('allPortletsReady', function () {
    document.addEventListener("DOMContentLoaded", function () {

        var tabs = document.querySelectorAll("#tabButtons span");
        tabs.forEach(function (tab) {
            tab.addEventListener("click", function (e) {
                e.preventDefault();
                tabs.forEach(function (t) { t.classList.remove("campoGuiaStyle"); });
                this.classList.add("campoGuiaStyle");
            });
        });

        try {
            var leftIcon = document.querySelector("ul.pagination li a span span svg.lexicon-icon-angle-left");
            if (leftIcon && leftIcon.parentNode) leftIcon.parentNode.insertAdjacentHTML("afterend", '<span class="taglib-text sublinhado">Anterior</span>');
            var rightIcon = document.querySelector("ul.pagination li a span span svg.lexicon-icon-angle-right");
            if (rightIcon && rightIcon.parentNode) rightIcon.parentNode.insertAdjacentHTML("beforebegin", '<span class="taglib-text sublinhado">Próxima</span>');
        } catch (err) {}

    });

})
//JS Antigo do Sustentabilidade Documentos
tabWrapper = document.querySelectorAll('#tabContent');

function hideTabs(currID) {
    tabWrapper.forEach((item) => {
        if (item.dataset.tab === currID) {
            item.style.display = 'block';
        } else item.style.display = 'none';
    });
}


//Botoes de acessibilidade para tamanho de fonte

var alterarFonteImpl = function(tagName, aumentar) {
    let elements = document.getElementsByTagName(tagName);
    for (let el of elements) {
        let text = el.textContent;
        if(text) {
            size = parseInt(window.getComputedStyle(el).fontSize.replace('px', ''));
            if(aumentar) size++;
            else size--;
            el.setAttribute("style", "font-size: " + size + "px;");
        }
    }
}

var alterarFonte = function(aumentar) {
    alterarFonteImpl("body", aumentar);
    alterarFonteImpl("p", aumentar);
    alterarFonteImpl("a", aumentar);
    alterarFonteImpl("h1", aumentar);
    alterarFonteImpl("h5", aumentar);
    alterarFonteImpl("a", aumentar);
    alterarFonteImpl("li", aumentar);
    alterarFonteImpl(".desktop_nav", aumentar);
    alterarFonteImpl(".bottom_link", aumentar);
    alterarFonteImpl(".btn", aumentar);
    alterarFonteImpl("#breadcrumbs li", aumentar);
    alterarFonteImpl("#breadcrumbs h2", aumentar);
    alterarFonteImpl("h2", aumentar);
    alterarFonteImpl("h3", aumentar);
    alterarFonteImpl("h4", aumentar);
    alterarFonteImpl("span", aumentar);
    alterarFonteImpl("button", aumentar);
    alterarFonteImpl("address", aumentar);
    console.log('alterarFonte - institucional');
}

document.querySelectorAll(".fonteMaior").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        alterarFonte(true);
    });
});

document.querySelectorAll(".fonteMenor").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        alterarFonte(false);
    });
});


//Função para criptografia
function hashSHA256(value) {
    return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
}
