$(function() {

  // owlCarousel
  $('.owl-carousel').owlCarousel({
    margin:20,
    loop:true,
    autoWidth:true,
    dots:false,
    responsive:{
      330:{
        margin:10
      }
    }
  });

  // select
  $('select').niceSelect();

  // Range слайдер
  $("#example_id").ionRangeSlider({
      type: "double",
      min: 15,
      max: 100,
      from: 15,
      to: 100,
  });


  // swipe
  $(".mobile__nav-swipe").swipe( {
      swipeLeft:leftSwipe,
      threshold:0
  });
  function leftSwipe(event){
    $('#menu__togle, #mobile__nav').removeClass('menu-icon-active mobile-nav--active');
  };




  // Прелоадер
  setTimeout(function() {
    $('#ctn-preloader').addClass('loaded');
    // Once the preloader has finished, the scroll appears
    $('#preloader-body').removeClass('no-scroll-y');

    if ($('#ctn-preloader').hasClass('loaded')) {
      // It is so that once the preloader is gone, the entire preloader section will removed
      $('#preloader').delay(1000).queue(function() {
        $(this).remove();
      });
    }
  }, 500);

  /////////////////////////////////////////////////

  const menuToggle = document.querySelector('#menu__togle');
  const mobileNavContainer = document.querySelector('#mobile__nav');

  menuToggle.onclick = function(){
      menuToggle.classList.toggle('menu-icon-active');
      mobileNavContainer.classList.toggle('mobile-nav--active');
  }

  ///////////////////////////////////////////////


  var settingsButton = $('.settings__button');
  var chatOpros = $('.chat-opros');
  var helloChat = $('.hello-chat');

  $(settingsButton).click(function(){
    $('.chat-welcome').toggleClass('active');
  });

  //////////////////////////////////////////////

  var settingsButton1 = $('.sign__in, .back');
  var chatOpros1 = $('.chat-opros');
  var helloChat1 = $('.hello-chat');

  $(settingsButton1).click(function(){
    $('.reg').toggleClass('active');
  });


}); // rwdy end





