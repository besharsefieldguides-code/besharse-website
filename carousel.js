/**
 * Besharse Field Guides - Hero Slideshow Controller
 * Manages crossfade logic for the 8-image rotation sequence.
 */
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlideIndex = 0;
    const slideIntervalTime = 4000; // Time each slide stays visible (4 seconds)

    function nextSlide() {
        // Remove active class from the current image
        slides[currentSlideIndex].classList.remove('active');
        
        // Loop index smoothly back to 0 after hitting slide 8
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        
        // Inject active class to trigger CSS opacity fade transition
        slides[currentSlideIndex].classList.add('active');
    }

    // Initialize automatic loop rotation
    setInterval(nextSlide, slideIntervalTime);
});
