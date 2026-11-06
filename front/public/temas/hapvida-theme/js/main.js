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
        document.querySelectorAll('#tabButtons span').forEach(function (span) {
            span.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelectorAll('#tabButtons span').forEach(function (s) {
                    s.classList.remove('campoGuiaStyle');
                });
                this.classList.add('campoGuiaStyle');
            });
        });
        document.querySelectorAll('.table-responsive').forEach(function (el) {
            el.remove();
        });
        try {
            const leftIcons = document.querySelectorAll('ul.pagination li a span span svg.lexicon-icon-angle-left');
            leftIcons.forEach(function (svg) {
                const parent = svg.parentNode;
                if (parent) {
                    const span = document.createElement('span');
                    span.className = 'taglib-text sublinhado';
                    span.textContent = 'Anterior';
                    parent.insertAdjacentElement('afterend', span);
                }
            });

            const rightIcons = document.querySelectorAll('ul.pagination li a span span svg.lexicon-icon-angle-right');
            rightIcons.forEach(function (svg) {
                const parent = svg.parentNode;
                if (parent) {
                    const span = document.createElement('span');
                    span.className = 'taglib-text sublinhado';
                    span.textContent = 'Próxima';
                    parent.insertAdjacentElement('beforebegin', span);
                }
            });
        } catch (err) {
            console.error(err);
        }
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

