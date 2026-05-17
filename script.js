// ==========================================
// AUTOMATIC IMAGE SLIDESHOW ENGINE
// ==========================================

const images = [
    "url('Zebra1.jpg')",     
    "url('Lion1.jpg')",      
    "url('Hippo1.jpg')",     
    "url('Lemur1.jpg')",   
    "url('Elephant1.jpg')",  
    "url('Crocodile1.jpg')"  
];

let currentSlideIndex = 0;
const slideIntervalTime = 10000; // Time spent on each slide (10 seconds)
let sliderTimer;

function preloadImages() {
    for (let i = 0; i < images.length; i++) {
        const img = new Image();
        const match = images[i].match(/'(.*?)'/);
        if (match && match[1]) {
            img.src = match[1];
        }
    }
}

function updateSlider() {
    const bgLayer = document.getElementById("hero-bg");
    const dots = document.getElementsByClassName("dot");
    if (!bgLayer) return;
    
    // Drop the animation class so it reset-arms for the next slide transition
    bgLayer.classList.remove("slide-fade");
    
    // Force a micro DOM reflow to make the browser register the class drop instantly
    void bgLayer.offsetWidth; 
    
    // Map the new background asset behind the content card layer
    bgLayer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${images[currentSlideIndex]}`;
    
    // Re-inject the optimized animation class to trigger the smooth lens-fade
    bgLayer.classList.add("slide-fade");
    
    // Update structural state of pagination indicators
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add("active");
    }
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

// ==========================================
// INITIALIZATION ENGINE & INTERFACE SECURITY
// ==========================================

function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay && loadingOverlay.style.display !== 'none') {
        loadingOverlay.style.opacity = '0'; 
        setTimeout(() => {
            loadingOverlay.style.display = 'none'; 
        }, 500); 
    }
}

window.onload = function() {
    try {
        preloadImages();           
        updateSlider();            
        startTimer();              
    } catch (error) {
        console.error("Interface engine setup error:", error);
    } finally {
        hideLoadingScreen();
    }
};
