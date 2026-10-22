(function($){




    document.addEventListener("DOMContentLoaded", () => {
        const button = document.querySelector(".home-banner .btn-primary");
        const image = document.querySelector(".home-banner .right img");
      
        // Add hover effects dynamically (optional but for additional customization)
        button.addEventListener("mouseover", () => {
          button.style.transform = "scale(1.1)";
          button.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.2)";
        });
      
        button.addEventListener("mouseout", () => {
          button.style.transform = "scale(1)";
          button.style.boxShadow = "none";
        });
      
        image.addEventListener("mouseover", () => {
          image.style.transform = "scale(1.05)";
        });
      
        image.addEventListener("mouseout", () => {
          image.style.transform = "scale(1)";
        });
      });
      
      




$(".w-90-p").animate({width: "90%"},2500);
$(".w-98-p").animate({width: "98%"},2500);
$(".w-20-p").animate({width: "20%"},2500);
$(".w-5-p").animate({width: "5%"},2500);
$(".w-0-p").animate({width: "0%"},2500);
$(".w-0-p").animate({width: "0%"},2500);
$(".w-1-p").animate({width: "1%"},2500);
$(".w-0-p").animate({width: "0%"},2500);

$('.counter').counterUp();

   new WOW().init();

    var $grid = $('.filter-items').isotope();
    $('.filter ul').on('click', 'li', function() {
        var filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
        $(this).siblings(".active").removeClass('active');
        $(this).addClass("active");
    });

    $(document).ready(function(){
        $('.testimonial-carousel').owlCarousel({
            loop:true, 
            margin:10,
            nav:false,
            dots:true,
            mouseDrag:false,
            responsiveClass:true,
            responsive:{
                0:{
                    items:1,
                    nav:true
                },
                600:{
                    items:1,
                    nav:false
                },
                1000:{
                    items:1,
                    nav:true,
                    loop:false
                }
            }
        });
    });

    $(document).ready(function(){
        $('.client-carousel').owlCarousel({
            loop:true, 
            margin:10,
            nav:false,
            dots:true,
            mouseDrag:false,
            responsiveClass:true,
            responsive:{
                0:{
                    items:1,
                    nav:true
                },
                400:{
                    items:2
                },
                600:{
                    items:3
                },
                800:{
                    items:4
                },
                1000:{
                    items:5
                }
            }
        });
    });

    $(document).ready(function(){
        $('.photo-carousel').owlCarousel({
            loop:true, 
            margin:10,
            nav:true,
            dots:false,
            mouseDrag:true,
            responsiveClass:true,
            responsive:{
                0:{
                    items:1,
                    nav:true
                },
                600:{
                    items:1,
                    nav:true
                },
                1000:{
                    items:1,
                    nav:true
                }
            }
        });
    });

    $(window).on('load',function(){
         $('#preloader_inner').fadeOut();
         $('#preloader').fadeOut();
        //  $(body).css({'overflow':'visible'});
    });

    $(window).on('scroll',function(){
        if($(this).scrollTop() > 100){
            $('.scrollup').fadeIn();
        }else{
            $('.scrollup').fadeOut();
        }
    });

    $('.scrollup').on('click',function(){
        $("html,body").animate({scrollTop:0},45);
        return false;
    });

})(jQuery)


/* Typed js */
const typed = new Typed('.multiple-text', {
    strings: ['Frontend Developer', 'Youtuber', 'Fakibuzz'],
    typeSpeed: 150,
    backSpeed: 40, 
    backDelay: 1000, 
    loop: true
});

(function($) {
    $(document).ready(function() {
        // ✅ Footer Logo Animation
        $(".footer-logo").hover(function() {
            $(this).css("transform", "rotate(10deg) scale(1.2)");
        }, function() {
            $(this).css("transform", "rotate(0) scale(1)");
        });

        // ✅ Footer Social Icons Animation
        $(".social-links a").hover(function() {
            $(this).css("transform", "translateY(-8px)");
        }, function() {
            $(this).css("transform", "translateY(0)");
        });

        // ✅ Footer Text Fade-in Effect
        $(".copyright p").hide().fadeIn(2000);
    });

})(jQuery);

/* about js */

(function ($) {
    $(document).ready(function () {
        // ✅ Profile Image Animation
        $(".profile-img").hover(
            function () {
                $(this).css("transform", "scale(1.1)");
            },
            function () {
                $(this).css("transform", "scale(1)");
            }
        );

        // ✅ Social Icons Hover Animation
        $(".social ul li").hover(
            function () {
                $(this).css({
                    "background": "#333",
                    "transform": "scale(1.1)"
                });
            },
            function () {
                $(this).css({
                    "background": "rgb(237 37 37 / 90%)",
                    "transform": "scale(1)"
                });
            }
        );

        // ✅ Contact Info Links Hover Effect
        $(".contact-info a").hover(
            function () {
                $(this).css("color", "rgb(237 37 37 / 90%)");
            },
            function () {
                $(this).css("color", "#333");
            }
        );
    });
})(jQuery);


(function($) {
    $(document).ready(function() {
        // Initialize EmailJS with your Public Key
        emailjs.init("0EzOJvAxLzQjAsaOQ"); // Public Key
        
        // Handle form submission
        $("#contact-form").on("submit", function(event) {
            event.preventDefault();  // Prevent default form submission

            // Collect form data
            const formData = {
                name: $("input[name='name']").val(),
                email: $("input[name='email']").val(),
                phone: $("input[name='phone']").val(),
                message: $("textarea[name='message']").val()
            };

            // Send email via EmailJS
            emailjs.send("service_61bk3r8", "template_i4m2nlo", formData)  // Use your Service ID and Template ID
                .then(function(response) {
                    // Show success message
                    $("#success-message").show();

                    // Reset form fields after submission
                    $("#contact-form")[0].reset();
                })
                .catch(function(error) {
                    alert("Failed to send the message. Please try again later.");
                    console.log(error); // Log errors for debugging
                });
        });
    });
})(jQuery);




