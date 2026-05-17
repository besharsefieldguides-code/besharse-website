// ==========================================
// 1. AUTOMATIC IMAGE SLIDESHOW CONFIGURATION
// ==========================================
const images = [
    "url('forest.jpg')",    
    "url('mountains.jpg')", 
    "url('wildlife.jpg')"   
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
// 2. REFRESH & PERSISTENT NAVIGATION LOGIC (UPDATED)
// ==========================================

// Now accepts both the Tab Element ID and the URL Hash path
function handleTabRefresh(clickedTabId, urlHash) {
    // 1. Save the clicked tab ID into session storage memory
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);
    
    // 2. Use HTML5 history modification to push the hashtag change directly into the address bar
    window.history.pushState(null, null, urlHash);
    
    // 3. Fire up the loading overlay spinner animation
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // 4. Force a clean page refresh after our optimized 0.4-second delay
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
