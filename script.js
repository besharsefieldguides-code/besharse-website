// ==========================================
// 1. AUTOMATIC IMAGE SLIDESHOW CONFIGURATION
// ==========================================

// Array expanded to hold 6 nature image file variables from your GitHub root directory
const images = [
    "url('Zebra1.jpg')",     // Slide 1 filename
    "url('Lion1.jpg')",  // Slide 2 filename
    "url('Hippo1.jpg')",   // Slide 3 filename
    "url('Lemur1.jpg')",    // Slide 4: Change to your exact 4th filename
    "url('Elephant1.jpg')",    // Slide 5: Change to your exact 5th filename
    "url('Crocodile1.jpg')"     // Slide 6: Change to your exact 6th filename
];

let currentSlideIndex = 0;
const slideIntervalTime = 10000; 
let sliderTimer;

function updateSlider() {
    const sliderContainer = document.getElementById("hero-slider");
    const dots = document.getElementsByClassName("dot");
    if (!sliderContainer) return;
    
    sliderContainer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${images[currentSlideIndex]}`;
    
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
// 2. REFRESH & PERSISTENT NAVIGATION LOGIC
// ==========================================
function handleTabRefresh(clickedTabId, urlHash) {
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);
    window.history.pushState(null, null, urlHash);
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 400);
}

function applySavedTabHighlight() {
    const savedTabId = sessionStorage.getItem('selectedNavbarTab');
    const allTabs = document.getElementsByClassName('nav-item');
    
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    if (savedTabId && document.getElementById(savedTabId)) {
        document.getElementById(savedTabId).classList.add('active-tab');
    } else {
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.classList.add('active-tab');
        }
    }
}


// ==========================================
// 3. INITIALIZATION ENGINE
// ==========================================
window.onload = function() {
    updateSlider();            
    startTimer();              
    applySavedTabHighlight();  
};
