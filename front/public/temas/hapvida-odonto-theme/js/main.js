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
        document.getElementById("logo")?.classList.add("contraste-logo");
        document.querySelectorAll(".card-class-submain").forEach(el => el.classList.add("contraste-carrossel-bg"));
        document.querySelectorAll(".label-category").forEach(el => el.classList.add("contraste-carossel-bg"));
    } else {
        document.body.classList.remove("contraste-body");
        document.getElementById("logo")?.classList.remove("contraste-logo");
        document.querySelectorAll(".card-class-submain").forEach(el => el.classList.remove("contraste-carrossel-bg"));
        document.querySelectorAll(".label-category").forEach(el => el.classList.remove("contraste-carossel-bg"));
    }


    document.querySelectorAll(".contrasteAjuste").forEach(function (el) {
        el.addEventListener("click", function (event) {
            event.preventDefault();

            if (document.body.classList.contains("contraste-body")) {
                localStorage.removeItem("altoContrastre");
                document.body.classList.remove("contraste-body");
                document.getElementById("logo")?.classList.remove("contraste-logo");
                document.querySelectorAll(".card-class-submain").forEach(x => x.classList.remove("contraste-carrossel-bg"));
                document.querySelectorAll(".label-category").forEach(x => x.classList.remove("contraste-carossel-bg"));
            } else {
                localStorage.setItem("altoContrastre", true);
                document.body.classList.add("contraste-body");
                document.getElementById("logo")?.classList.add("contraste-logo");
                document.querySelectorAll(".card-class-submain").forEach(x => x.classList.add("contraste-carrossel-bg"));
                document.querySelectorAll(".label-category").forEach(x => x.classList.add("contraste-carossel-bg"));
            }
        });
    });

    if (!false) {
        var swiperEstruturas = new Swiper(".mySwiperEstrutura", {
            spaceBetween: 30,
            freeMode: true,
            centeredSlides: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                360: {
                    slidesPerView: 1,
                },
                500: {
                    slidesPerView: 1.3,
                },
                768: {
                    slidesPerView: 1.8,
                },
                992: {
                    slidesPerView: 2.3,
                },
                1200: {
                    slidesPerView: 2.8,
                }
            }
        });

        var swiperEstruturas = new Swiper(".mySwiperEstruturaInterna", {
            init: true,
            direction: 'horizontal',
            preloadImages: true,
            spaceBetween: 30,
            centeredSlides: false,
            breakpoints: {
                360: {
                    slidesPerView: 'auto',
                    simulateTouch: true,
                    freeMode: true,
                },

                992: {
                    slidesPerView: 'auto',
                    freeMode: false,
                    simulateTouch: false,
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }
                }
            }
        });

        var swiperEstruturas = new Swiper(".mySwiperBoasVindas", {
            init: true,
            direction: 'horizontal',
            slidesPerView: 1,
            preloadImages: true,
            spaceBetween: 36,
            centeredSlides: false,
            simulateTouch: false,
            freeMode: false,
            breakpoints: {
                360: {
                    slidesPerView: 1.3,
                },
                500: {
                    slidesPerView: 1.8,
                },
                768: {
                    slidesPerView: 3,
                }
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });

        var swiperEstruturas = new Swiper(".mySwiperPreventivo", {
            spaceBetween: 30,
            freeMode: true,
            centeredSlides: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                500: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 1.5,
                },
                992: {
                    slidesPerView: 2.5,
                },
                1200: {
                    slidesPerView: 3,
                }
            }
        });

        var swiperServicos = new Swiper(".mySwiperServicos", {
            slidesPerView: 2,
            spaceBetween: 10,
            freeMode: true,
            centeredSlides: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });

        var swiperSubplanos = new Swiper(".mySwiperSubplanos", {
            slidesPerView: 1,
            spaceBetween: 30,
            freeMode: true,
            centeredSlides: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });

        var swiperSubplanos1 = new Swiper(".mySwiperSubplanos1", {
            slidesPerView: 1,
            freeMode: false,
            centeredSlides: true,
            pagination: {
                el: ".swiper-pagination",
            },
        });

        var swiper = new Swiper(".mySwiperCarrossel", {
            init: true,
            direction: 'horizontal',
            slidesPerView: 1.2,
            preloadImages: true,
            spaceBetween: 36,
            centeredSlides: false,
            simulateTouch: false,
            freeMode: false,
            breakpoints: {
                991: {
                    slidesPerView: 3,
                }
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });

        var swiper = new Swiper(".mySwiperPortlet", {
            slidesPerView: 3,
            spaceBetween: 5,
            freeMode: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });

        var swiper = new Swiper(".mySwiperArrowSub", {
            simulateTouch: false,
            freeMode: false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                991: {
                    simulateTouch: true,
                }
            }
        });

        var swiper = new Swiper(".mySwiperArrow", {
            freeMode: false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

        var swiperServicos = new Swiper(".mySwiperTimeline", {
            slidesPerView: 1,
            spaceBetween: 10,
            freeMode: true,
            centeredSlides: false,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                360: {
                    slidesPerView: 1.5,
                },
                500: {
                    slidesPerView: 2.1,
                },
                768: {
                    slidesPerView: 3.1,
                },
                992: {
                    slidesPerView: 3.8,
                },
                1200: {
                    slidesPerView: 4.5,
                }
            }
        });

        var swiper = new Swiper(".mySwiperFragmentado", {
            spaceBetween: 15,
            freeMode: false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                360: {
                    slidesPerView: 1.1,
                },
                420: {
                    slidesPerView: 1.5,
                },
                560: {
                    slidesPerView: 2,
                },
                768: {
                    slidesPerView: 2.3,
                },
                992: {
                    slidesPerView: 1.7,
                },
                1200: {
                    slidesPerView: 2,
                }
            }
        });

        var swiper = new Swiper(".mySwiperFragmentado2", {
            spaceBetween: 15,
            freeMode: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });

        var swiper = new Swiper(".mySwiperFragmentadoLivre", {
            spaceBetween: 15,
            freeMode: true,
        });

        var swiper = new Swiper(".mySwiperFragmentadoOncologia", {
            spaceBetween: 15,
            slidesPerView: "auto",
            freeMode: false,
        });

        var swiper = new Swiper(".mySwiperFragmentadoTxt", {
            spaceBetween: 15,
            slidesPerView: "auto",
            freeMode: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

        var swiper = new Swiper(".mySwiperFragmentadoInterclube", {
            init: true,
            direction: 'horizontal',
            preloadImages: true,
            spaceBetween: 15,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                380: {
                    slidesPerView: 'auto',
                    freeMode: true,
                    simulateTouch: true,
                },
                992: {
                    slidesPerView: 'auto',
                    simulateTouch: false,
                    freeMode: false,
                }
            }
        });

        var swiper = new Swiper(".mySwiperFragmentadoExtendido", {
            spaceBetween: 15,
            freeMode: false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                380: {
                    slidesPerView: 1.2,
                },
                420: {
                    slidesPerView: 1.4,
                },
                560: {
                    slidesPerView: 1.8,
                },
                768: {
                    slidesPerView: 2.4,
                },
                992: {
                    slidesPerView: 2,
                },
                1200: {
                    slidesPerView: 2.3,
                }
            }
        });

        var swiper = new Swiper('.carr-planos', {
            slidesPerView: 'auto',
            spaceBetween: 30,
            breakpoints: {
                992: {
                    slidesPerView: '2.9',
                },
                805: {
                    slidesPerView: '2.7',
                },
                768: {
                    slidesPerView: '2',
                },
            },
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
        document.querySelectorAll("#tabButtons span").forEach(function (span) {
            span.addEventListener("click", function (e) {
                e.preventDefault();
                document.querySelectorAll("#tabButtons span").forEach(el => el.classList.remove("campoGuiaStyle"));
                this.classList.add("campoGuiaStyle");
            });
        });

        document.querySelectorAll(".table-responsive").forEach(function (el) {
            el.remove();
        });

        try {
            document.querySelectorAll("ul.pagination li a span span svg.lexicon-icon-angle-left").forEach(function (svg) {
                svg.parentNode.insertAdjacentHTML("afterend", '<span class="taglib-text sublinhado">Anterior</span>');
            });

            document.querySelectorAll("ul.pagination li a span span svg.lexicon-icon-angle-right").forEach(function (svg) {
                svg.parentNode.insertAdjacentHTML("beforebegin", '<span class="taglib-text sublinhado">Próxima</span>');
            });
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


btnTest = document.querySelectorAll('#tabButtons span');

btnTest.forEach((element) => {
    element.addEventListener('click', function () {
        currID = this.id;
        hideTabs(currID);
    });

//JS Novo do Sustentabilidade Documentos
    let tabWrapper1 = document.querySelectorAll('#tabContent');
    let btnTest1 = document.querySelectorAll('.carousel-item.tab--item > span');

    let nextBtn1 = document.querySelector('.carousel-control-next');
    let prevBtn1 = document.querySelector('.carousel-control-prev');

    const delay = ms => new Promise(res => setTimeout(res, ms));

    nextBtn1.addEventListener('click', async () => {
        await delay(800)
        let currID = document.querySelector('.carousel-item.tab--item.active > span').id;
        hideTabs(currID);

    });

    prevBtn1.addEventListener('click', async () => {
        await delay(800)
        let currID = document.querySelector('.carousel-item.tab--item.active > span').id;
        hideTabs(currID);

    });


    function hideTabs1(currID) {
        tabWrapper.forEach((item) => {
            if (item.dataset.tab === currID) {
                item.style.display = 'block';
            } else item.style.display = 'none';
        });
    }
});


//Botoes de acessibilidade para tamanho de fonte

var alterarFonteImpl = function(tagName, aumentar) {
    let wrapper = document.getElementById("wrapper");
    let elements = wrapper.getElementsByTagName(tagName);
    for (let el of elements) {
        let text = el.textContent;
        if(text) {
            size = parseInt(window.getComputedStyle(el).fontSize.replace('px', ''));
            if(aumentar) size++;
            else size--;
            el.setAttribute("style", "font-size: " + size + "px; !important");
        }
    }
}

var alterarFonte = function(aumentar) {
    alterarFonteImpl("body", aumentar);
    alterarFonteImpl("p", aumentar);
    alterarFonteImpl("a", aumentar);
    alterarFonteImpl(".footer h5", aumentar);
    alterarFonteImpl(".footer a", aumentar);
    alterarFonteImpl(".footer li", aumentar);
    alterarFonteImpl("li", aumentar);
    alterarFonteImpl(".desktop_nav", aumentar);
    alterarFonteImpl(".bottom_link", aumentar);
    alterarFonteImpl(".btn", aumentar);
    alterarFonteImpl("#breadcrumbs li", aumentar);
    alterarFonteImpl("#breadcrumbs h2", aumentar);
    alterarFonteImpl("h1", aumentar);
    alterarFonteImpl("h2", aumentar);
    alterarFonteImpl("h3", aumentar);
    alterarFonteImpl("h4", aumentar);
    alterarFonteImpl("h5", aumentar);
    alterarFonteImpl("span", aumentar);
    alterarFonteImpl("button", aumentar);
    console.log('alterarFonte - institucional');
}

document.querySelectorAll(".fonteMaior").forEach(function (el) {
    el.addEventListener("click", function (event) {
        event.preventDefault();
        alterarFonte(true);
    });
});

document.querySelectorAll(".fonteMenor").forEach(function (el) {
    el.addEventListener("click", function (event) {
        event.preventDefault();
        alterarFonte(false);
    });
});
