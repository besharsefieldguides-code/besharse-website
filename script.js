// ==========================================
// 1. AUTOMATIC IMAGE SLIDESHOW CONFIGURATION
// ==========================================

const images = [
    "url('Zebra.jpg')",     
    "url('Lion.jpg')",      
    "url('Hippo.jpg')",     
    "url('Giraffe.jpg')",   
    "url('Elephant.jpg')",  
    "url('Crocodile.jpg')"  
];

let currentSlideIndex = 0;
const slideIntervalTime = 10000; 
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
        loadingOverlay.style.opacity = '1'; 
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
// 3. INITIALIZATION ENGINE & FAIL-SAFES
// ==========================================

// Dedicated function to gracefully remove the loading screen
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
    // The try/finally block ensures that even if one of these functions fails,
    // the code will skip to the "finally" block and remove the loading screen.
    try {
        preloadImages();           
        updateSlider();            
        startTimer();              
        applySavedTabHighlight();  
    } catch (error) {
        console.error("Initialization error:", error);
    } finally {
        hideLoadingScreen();
    }
};

// ULTIMATE FAIL-SAFE: If the window.onload event gets stuck (e.g., waiting for a broken external font), 
// this forces the loading screen to disappear after exactly 2.5 seconds no matter what.
setTimeout(hideLoadingScreen, 2500);
