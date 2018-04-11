$(document).ready(function() {
  var navSelector = '#main-nav li a';

  /* Navigation link click event */
  $(navSelector).on('click', function(e) {
    e.preventDefault();

    // Scroll to section
    var sectionId = $(this).attr('href');
    var position = $(sectionId).offset().top;
    $('html,body').animate({scrollTop: position}, 'slow');

    // Update active class
    $(navSelector).removeClass('active');
    $(this).addClass('active');
  });

  /* Scroll event
   * Update navigation active class based on current scroll position
   */
  $(window).scroll(function() {
    var windowScroll = $(window).scrollTop();
    var navHeight = 65;
    if (windowScroll > navHeight) {
      $('.content section').each(function(i) {
        if ($(this).position().top - navHeight + 1 <= windowScroll) {
          $(navSelector + '.active').removeClass('active');
          $(navSelector).eq(i).addClass('active');
        }        
      });
    }
  });
});
