// Array containing your slideshow image filenames directly from your root directory
const images = [
    "url('forest.jpg')",    // Replace with your exact first filename
    "url('mountains.jpg')", // Replace with your exact second filename
    "url('wildlife.jpg')"   // Replace with your exact third filename
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

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex >= images.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = images.length - 1;
    }
    updateSlider();
    resetTimer();
}

function setSlide(index) {
    currentSlideIndex = index;
    updateSlider();
    resetTimer();
}

function startTimer() {
    sliderTimer = setInterval(() => {
        changeSlide(1);
    }, slideIntervalTime);
}

function resetTimer() {
    clearInterval(sliderTimer);
    startTimer();
}

window.onload = function() {
    updateSlider();
    startTimer();
};
