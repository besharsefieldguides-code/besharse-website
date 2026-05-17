// ==========================================
// 1. HORIZONTAL PULL SLIDESHOW LOGIC
// ==========================================

let currentSlideIndex = 0;
const totalSlidesCount = 6; // Matching exactly our 6 HTML slide nodes
const slideIntervalTime = 10000; // Slide view time duration (10 seconds)
let sliderTimer;

function updateSlider() {
    const track = document.getElementById("slider-track");
    const dots = document.getElementsByClassName("dot");
    if (!track) return;
    
    // Smooth Pull Mechanic: Pulls the horizontal track row by intervals of 100%
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    // Cycle matching active classes across pagination dot rings
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add("active");
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex >= totalSlidesCount) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlidesCount - 1;
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
// 2. PROTOTYPE NAVBAR SELECTION TRACKING
// ==========================================

function selectTab(clickedTabId) {
    const allTabs = document.getElementsByClassName('nav-item');
    
    // 1. Wipe clean any existing active highlights from all tabs
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // 2. Target and apply the premium olive green highlight to the active choice
    const activeTab = document.getElementById(clickedTabId);
    if (activeTab) {
        activeTab.classList.add('active-tab');
    }
    
    // 3. Cache the design choice in sessionStorage to keep it persistent 
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);

    // 4. NEW: Update the address bar URL quietly without jumping or reloading
    // We convert the tab ID (like 'tab-about') into a clean hash link (like '#about')
    const hashName = clickedTabId.replace('tab-', '#');
    window.history.pushState(null, null, hashName);
}

function applySavedTabHighlight() {
    const savedTabId = sessionStorage.getItem('selectedNavbarTab');
    
    // If a tab was previously active before structural adjustments, repaint it
    if (savedTabId && document.getElementById(savedTabId)) {
        document.getElementById(savedTabId).classList.add('active-tab');
    } else {
        // Fall back to painting the Home tab by default if storage is empty
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.classList.add('active-tab');
        }
    }
}

// ==========================================
// 3. INITIALIZATION ENGINE & SCREEN REMOVAL
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
        updateSlider();            
        startTimer();              
        applySavedTabHighlight();  
    } catch (error) {
        console.error("Interface engine setup error:", error);
    } finally {
        hideLoadingScreen();
    }
};
