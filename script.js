// ==========================================
// 1. AUTOMATIC IMAGE SLIDESHOW CONFIGURATION
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
    const bgLayer = document.getElementById("hero-bg");
    const dots = document.getElementsByClassName("dot");
    if (!bgLayer) return;
    
    // Clear class to reset CSS animation smoothly
    bgLayer.classList.remove("slide-fade");
    
    // Force DOM Reflow to reset CSS transition states instantly
    void bgLayer.offsetWidth; 
    
    // Switch background assets
    bgLayer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${images[currentSlideIndex]}`;
    
    // Re-assign animation class
    bgLayer.classList.add("slide-fade");
    
    // Sync slider pagination dot states
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
        
        // Target anchor hash scrolling with safe query selection wrappers
        const targetHash = window.location.hash;
        if (targetHash && targetHash !== '#') {
            try {
                const targetElement = document.querySelector(targetHash);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error("Navigation target parsing exception caught safely:", error);
            }
        }
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
        applySavedTabHighlight();  
    } catch (error) {
        console.error("Initialization error:", error);
    } finally {
        hideLoadingScreen();
    }
};
