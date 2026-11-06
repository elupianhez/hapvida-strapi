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
    $("body").addClass("contraste-body");
    $(".logo_gndi_roseta").addClass("contraste-logo");
    $("#logo").addClass("contraste-logo");
    $(".card-class-submain").addClass("contraste-carrossel-bg");
  } else {
    $("body").removeClass("contraste-body");
    $(".logo_gndi_roseta").removeClass("contraste-logo");
    $(".logo_gndi_roseta").removeClass("contraste-logo");
    $(".card-class-submain").removeClass("contraste-carrossel-bg");
  }

  $(".contrasteAjuste").click(function () {
    if ($("body").hasClass("contraste-body")) {
      localStorage.removeItem('altoContrastre');
      $("body").removeClass("contraste-body");
      $(".logo_gndi_roseta").removeClass("contraste-logo");
      $(".logo_gndi_roseta").removeClass("contraste-logo");
      $(".card-class-submain").removeClass("contraste-carrossel-bg");
    } else {
      localStorage.setItem('altoContrastre', true);
      $("body").addClass("contraste-body");
      $(".logo_gndi_roseta").addClass("contraste-logo");
      $("#logo").addClass("contraste-logo");
      $(".card-class-submain").addClass("contraste-carrossel-bg");
    }
    return false;
  });
  var swiper = new Swiper(".mySwiperCarrossel", {
    slidesPerView: 1.25,
    spaceBetween: 16,
    slidesOffsetBefore: 16,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      390: {
        slidesPerView: 1.425,
      },
      500: {
        slidesPerView: 1.7,
        spaceBetween: 24,
      },
      // Configuração para telas menores que 768px de largura
      768: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      // Configuração para telas maiores ou iguais a 992px de largura
      992: {
        slidesPerView: 3.8,
        spaceBetween: 24,
      },
    },
  });
  var swiper = new Swiper(".mySwiperCarrossel2", {
    slidesPerView: 1.6,
    spaceBetween: 24,
    slidesOffsetBefore: 29,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
});

/*
 * This function gets loaded after each and every portlet on the page.
 *
 * portletId: the current portlet's id
 * node: the Alloy Node object of the current portlet
 */
Pagina.widgetPronto(function (_portletId, _node) {});

/*
 * This function gets loaded when everything, including the portlets, is on
 * the page.
 */
Pagina.on('allPortletsReady', function () {});

$(".fonteMenor").click(function () {
  var size = $("body").css('font-size');
  size = size.replace('px', '');
  size = parseInt(size) - 1;
  window.localStorage.setItem("tamanhoFonte", size);
  $("body").animate({
    'font-size': size + 'px'
  });
  $("p").animate({
    'font-size': size + 'px'
  });
  $("h2").animate({
    'font-size': size + 'px'
  });
  $("a").animate({
    'font-size': size + 'px'
  });
  $(".footer h5").animate({
    'font-size': size + 'px'
  });
  $(".footer a").animate({
    'font-size': size + 'px'
  });
  $(".footer li").animate({
    'font-size': size + 'px'
  });
  $(".desktop_nav").animate({
    'font-size': size + 'px'
  });
  $(".bottom_link").animate({
    'font-size': size + 'px'
  });
  $(".btn").animate({
    'font-size': size + 'px'
  });
  $("#breadcrumbs li").animate({
    'font-size': size + 'px'
  });
  $("#breadcrumbs h2").animate({
    'font-size': size + 20 + 'px'
  });
  return false;
});

$(".fonteMaior").click(function () {
  var size = $("body").css('font-size');
  size = size.replace('px', '');
  size = parseInt(size) + 1;
  window.localStorage.setItem("tamanhoFonte", size);
  $("body").animate({
    'font-size': size + 'px'
  });
  $("p").animate({
    'font-size': size + 'px'
  });
  $("h2").animate({
    'font-size': size + 'px'
  });
  $("a").animate({
    'font-size': size + 'px'
  });
  $(".footer h5").animate({
    'font-size': size + 'px'
  });
  $(".footer a").animate({
    'font-size': size + 'px'
  });
  $(".footer li").animate({
    'font-size': size + 'px'
  });
  $(".desktop_nav").animate({
    'font-size': size + 'px'
  });
  $(".bottom_link").animate({
    'font-size': size + 'px'
  });
  $(".btn").animate({
    'font-size': size + 'px'
  });
  $("#breadcrumbs li").animate({
    'font-size': size + 'px'
  });
  $("#breadcrumbs h2").animate({
    'font-size': size + 20 + 'px'
  });
  return false;
});