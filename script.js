// Array containing the paths/URLs to your slideshow images
// Note: A dark gradient overlay is added inline via JavaScript to keep text legible
const images = [
    "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560')", // Image 1
    "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560')", // Image 2
    "url('https://images.unsplash.com/photo-1500627869374-13cd993b1115?q=80&w=2560')"  // Image 3
];

let currentSlideIndex = 0;
const slideIntervalTime = 10000; // 10 seconds timeout
let sliderTimer;

function updateSlider() {
    const sliderContainer = document.getElementById("hero-slider");
    const dots = document.getElementsByClassName("dot");

    // Apply background image alongside a standard dark overlay tint
    sliderContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${images[currentSlideIndex]}`;

    // Update active state class on the bullet points
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    dots[currentSlideIndex].classList.add("active");
}

// Function for arrow button clicks (+1 or -1)
function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= images.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = images.length - 1;
    }
    
    updateSlider();
    resetTimer(); // Restarts the 10-second window on interaction
}

// Function for direct bullet point selection
function setSlide(index) {
    currentSlideIndex = index;
    updateSlider();
    resetTimer();
}

// Timer configuration functions
function startTimer() {
    sliderTimer = setInterval(() => {
        changeSlide(1);
    }, slideIntervalTime);
}

function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
}

// Initialize the carousel layout when the page finishes loading
window.onload = function() {
    updateSlider();
    startTimer();
};
