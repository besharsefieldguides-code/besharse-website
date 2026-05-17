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
    
    // Wipe clean any existing active highlights from all tabs
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // Target and apply the premium olive green highlight to the active choice
    const activeTab = document.getElementById(clickedTabId);
    if (activeTab) {
        activeTab.classList.add('active-tab');
    }
    
    // Cache the design choice in sessionStorage to keep it persistent 
    sessionStorage.setItem('selectedNavbarTab', clickedTabId);

    // Update the address bar URL quietly without jumping or reloading
    const hashName = clickedTabId.replace('tab-', '#');
    window.history.pushState(null, null, hashName);
}

function applySavedTabHighlight() {
    const currentHash = window.location.hash;
    
    // FIXED FAIL-SAFE: If there's no hash or we are returning fresh to home,
    // clear memory immediately so it defaults cleanly to the Home tab highlight.
    if (!currentHash || currentHash === '' || currentHash === '#home') {
        sessionStorage.removeItem('selectedNavbarTab');
    }

    const activeTabId = sessionStorage.getItem('selectedNavbarTab');
    const allTabs = document.getElementsByClassName('nav-item');
    
    // Clear active classes safely
    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active-tab');
    }
    
    // Apply highlight to memory state, otherwise default directly to home element
    if (activeTabId && document.getElementById(activeTabId)) {
        document.getElementById(activeTabId).classList.add('active-tab');
    } else {
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.classList.add('active-tab');
        }
    }
}

// ==========================================
// 3. INITIALIZATION ENGINE & UNCONDITIONAL RESET
// ==========================================

function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
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
        console.error("Interface execution caught safely:", error);
    } finally {
        // Crucial Fix: Executing inside finally ensures the loading screen 
        // drops completely even if a state check experiences an exception.
        hideLoadingScreen();
    }
};
